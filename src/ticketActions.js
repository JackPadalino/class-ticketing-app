import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { STATUS } from "./constants";

function logHistory(ticketId, { type, actor, actorRole }) {
  return addDoc(collection(db, "tickets", ticketId, "history"), {
    type,
    actorId: actor.uid,
    actorName: actor.displayName || actor.email,
    actorRole,
    createdAt: serverTimestamp(),
  });
}

export async function createProject({ name, description, createdBy }) {
  const ref = await addDoc(collection(db, "projects"), {
    name,
    description: description || "",
    createdBy,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProject(projectId, { name, description }) {
  await updateDoc(doc(db, "projects", projectId), {
    name,
    description: description || "",
  });
}

export async function createTicket({ projectId, title, description, phase, assignedTo, assignedToName, links, createdBy }) {
  const ref = await addDoc(collection(db, "tickets"), {
    projectId,
    title,
    description,
    phase,
    assignedTo,
    assignedToName,
    links: links || [],
    status: STATUS.READY_TO_START,
    needsRevision: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    reviewedBy: null,
    reviewedAt: null,
  });
  await logHistory(ref.id, { type: "created", actor: createdBy, actorRole: "lead" });
}

const STUDENT_STATUS_EVENT = {
  [STATUS.READY_TO_START]: "reset_to_ready",
  [STATUS.IN_PROGRESS]: "started",
  [STATUS.READY_FOR_REVIEW]: "submitted_for_review",
};

// The one action behind the student's status dropdown + "Update status"
// button. Only fires the lead's "ready for review" alert when that's
// actually the destination - moving to ready-to-start or in-progress is
// just the student managing their own board, nothing for the lead to act on.
export async function updateStudentStatus(ticket, student, newStatus) {
  await updateDoc(doc(db, "tickets", ticket.id), {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
  await logHistory(ticket.id, { type: STUDENT_STATUS_EVENT[newStatus], actor: student, actorRole: "student" });

  if (newStatus === STATUS.READY_FOR_REVIEW) {
    await addDoc(collection(db, "notifications"), {
      type: "ready_for_review",
      projectId: ticket.projectId,
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      actorId: student.uid,
      actorName: student.displayName || student.email,
      recipientId: null,
      decision: null,
      read: false,
      createdAt: serverTimestamp(),
    });
  }
}

export async function updateLinks(ticketId, links) {
  await updateDoc(doc(db, "tickets", ticketId), {
    links,
    updatedAt: serverTimestamp(),
  });
}

async function notifyStudentOfReview(ticket, lead, decision) {
  await addDoc(collection(db, "notifications"), {
    type: "ticket_reviewed",
    projectId: ticket.projectId,
    ticketId: ticket.id,
    ticketTitle: ticket.title,
    actorId: lead.uid,
    actorName: lead.displayName || lead.email,
    recipientId: ticket.assignedTo,
    decision,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function approveTicket(ticket, lead) {
  await updateDoc(doc(db, "tickets", ticket.id), {
    status: STATUS.COMPLETED,
    needsRevision: false,
    reviewedBy: lead.uid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logHistory(ticket.id, { type: "approved", actor: lead, actorRole: "lead" });
  await notifyStudentOfReview(ticket, lead, "approved");
}

export async function requestRevision(ticket, lead) {
  await updateDoc(doc(db, "tickets", ticket.id), {
    status: STATUS.NEEDS_REVISION,
    needsRevision: true,
    reviewedBy: lead.uid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logHistory(ticket.id, { type: "needs_revision", actor: lead, actorRole: "lead" });
  await notifyStudentOfReview(ticket, lead, "needs_revision");
}

export async function addComment(ticketId, { authorId, authorName, authorRole, text, decision }) {
  await addDoc(collection(db, "tickets", ticketId, "comments"), {
    authorId,
    authorName,
    authorRole,
    text,
    decision: decision || null,
    createdAt: serverTimestamp(),
  });
}

export async function markNotificationRead(notificationId) {
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}

// Deletes a project and everything that belongs to it: every ticket in
// it (plus each ticket's comments and history), and every notification
// that references it. Firestore doesn't cascade deletes on its own, so
// this has to walk the tree itself. Batched in chunks since a single
// batch write is capped at 500 operations.
export async function deleteProjectCascade(projectId) {
  const [ticketsSnap, notificationsSnap] = await Promise.all([
    getDocs(query(collection(db, "tickets"), where("projectId", "==", projectId))),
    getDocs(query(collection(db, "notifications"), where("projectId", "==", projectId))),
  ]);

  const refsPerTicket = await Promise.all(
    ticketsSnap.docs.map(async (ticketDoc) => {
      const [commentsSnap, historySnap] = await Promise.all([
        getDocs(collection(db, "tickets", ticketDoc.id, "comments")),
        getDocs(collection(db, "tickets", ticketDoc.id, "history")),
      ]);
      return [
        ...commentsSnap.docs.map((d) => d.ref),
        ...historySnap.docs.map((d) => d.ref),
        ticketDoc.ref,
      ];
    })
  );

  const refsToDelete = [
    ...refsPerTicket.flat(),
    ...notificationsSnap.docs.map((d) => d.ref),
    doc(db, "projects", projectId),
  ];

  const CHUNK_SIZE = 450;
  for (let i = 0; i < refsToDelete.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    refsToDelete.slice(i, i + CHUNK_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}
