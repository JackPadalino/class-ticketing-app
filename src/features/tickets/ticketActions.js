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
import { db } from "../../lib/firebase";
import { logHistory } from "./ticketHistory";
import { notifyLead } from "../notifications/notificationActions";
import { notifyStudentOfReview } from "../notifications/notificationActions";
import { STATUS } from "./constants/status";

export async function createTicket({ projectId, title, description, phase, dueDate, assignedTo, assignedToName, links, createdBy }) {
  const ref = await addDoc(collection(db, "tickets"), {
    projectId,
    title,
    description,
    phase,
    dueDate: dueDate || null,
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

// Tickets have no shared id across students, so "the same ticket for
// everyone" is every ticket in the project with the same title and phase
// (that's how "Add ticket -> All students" creates them). Includes the
// ticket itself.
export async function findMatchingTickets(ticket) {
  const snap = await getDocs(
    query(
      collection(db, "tickets"),
      where("projectId", "==", ticket.projectId),
      where("title", "==", ticket.title)
    )
  );
  return snap.docs.filter((d) => d.data().phase === ticket.phase);
}

// `changes` should only hold the fields the lead actually edited, so
// applying to everyone doesn't overwrite fields that legitimately differ
// per student (e.g. a per-student description).
export async function updateTicketDetails(ticket, changes, applyToAll) {
  const data = { ...changes, updatedAt: serverTimestamp() };
  if ("dueDate" in data) data.dueDate = data.dueDate || null;

  if (!applyToAll) {
    await updateDoc(doc(db, "tickets", ticket.id), data);
    return 1;
  }

  const matches = await findMatchingTickets(ticket);
  const CHUNK_SIZE = 450;
  for (let i = 0; i < matches.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    matches.slice(i, i + CHUNK_SIZE).forEach((d) => batch.update(d.ref, data));
    await batch.commit();
  }
  return matches.length;
}

const STATUS_EVENT = {
  [STATUS.READY_TO_START]: "reset_to_ready",
  [STATUS.IN_PROGRESS]: "started",
  [STATUS.READY_FOR_REVIEW]: "submitted_for_review",
  [STATUS.NEED_SUPPORT]: "requested_support",
};

// The one action behind the student's status dropdown + "Update status"
// button. Only fires a lead alert when the destination is one the lead
// needs to act on - moving to ready-to-start or in-progress is just the
// student managing their own board.
export async function updateStudentStatus(ticket, student, newStatus) {
  await updateDoc(doc(db, "tickets", ticket.id), {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
  await logHistory(ticket.id, { type: STATUS_EVENT[newStatus], actor: student, actorRole: "student" });

  if (newStatus === STATUS.READY_FOR_REVIEW) {
    await notifyLead("ready_for_review", ticket, student);
  }
  if (newStatus === STATUS.NEED_SUPPORT) {
    await notifyLead("need_support", ticket, student);
  }
}

// Marking a ticket "Need support" always requires an explanatory comment
// (enforced in the UI's prompt) so the lead never sees a bare status
// flip with no context for what the student is stuck on. Posts the
// comment directly rather than through addComment() to avoid also
// firing a redundant "student_comment" alert alongside "need_support".
export async function markNeedSupport(ticket, student, commentText) {
  await addDoc(collection(db, "tickets", ticket.id, "comments"), {
    authorId: student.uid,
    authorName: student.displayName || student.email,
    authorRole: "student",
    text: commentText,
    decision: null,
    createdAt: serverTimestamp(),
  });
  await updateStudentStatus(ticket, student, STATUS.NEED_SUPPORT);
}

export async function updateLinks(ticketId, links) {
  await updateDoc(doc(db, "tickets", ticketId), {
    links,
    updatedAt: serverTimestamp(),
  });
}

// dueDate is a plain "YYYY-MM-DD" string (matches <input type="date">
// directly, no timezone math needed) or null to clear it. Firestore
// rules only let the lead touch this field - a student's update is
// restricted to hasOnly(['status', 'links', 'updatedAt']).
export async function updateDueDate(ticketId, dueDate) {
  await updateDoc(doc(db, "tickets", ticketId), {
    dueDate: dueDate || null,
    updatedAt: serverTimestamp(),
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

// The lead's own status dropdown + "Update status" button - available
// on every ticket no matter the "allow students to update ticket
// status" setting, since the lead can always change status themselves.
// Approve and Needs revisions route through approveTicket()/
// requestRevision() so the review trail (reviewedBy, reviewedAt, the
// history entry, and the student's notification) stays the same
// regardless of which control set it.
export async function updateTicketStatusAsLead(ticket, lead, newStatus) {
  if (newStatus === STATUS.COMPLETED) {
    await approveTicket(ticket, lead);
    return;
  }
  if (newStatus === STATUS.NEEDS_REVISION) {
    await requestRevision(ticket, lead);
    return;
  }
  await updateDoc(doc(db, "tickets", ticket.id), {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
  await logHistory(ticket.id, { type: STATUS_EVENT[newStatus], actor: lead, actorRole: "lead" });
}

// Deletes a single ticket along with its comments, history, and any
// notifications that reference it. Firestore doesn't cascade deletes
// on its own, so this has to walk the tree itself.
export async function deleteTicket(ticketId) {
  const [commentsSnap, historySnap, notificationsSnap] = await Promise.all([
    getDocs(collection(db, "tickets", ticketId, "comments")),
    getDocs(collection(db, "tickets", ticketId, "history")),
    getDocs(query(collection(db, "notifications"), where("ticketId", "==", ticketId))),
  ]);

  const batch = writeBatch(db);
  commentsSnap.docs.forEach((d) => batch.delete(d.ref));
  historySnap.docs.forEach((d) => batch.delete(d.ref));
  notificationsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "tickets", ticketId));
  await batch.commit();
}
