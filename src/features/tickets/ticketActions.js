/**
 * Firestore writes for tickets (everything except comments and notifications).
 *   - createTicket(...): new ticket in "ready_to_start" + a "created" history entry.
 *   - findMatchingTickets(ticket): all copies of "the same" ticket across students
 *     (same project, title and phase) - tickets have no shared id.
 *   - updateTicketDetails(ticket, changes, applyToAll): edit title/description/
 *     phase/dueDate on one ticket or every copy. Only changed fields are sent.
 *   - updateStudentStatus / markNeedSupport: a student's status change; alerts
 *     the lead for "ready for review" and "need support" (which requires a comment).
 *   - updateLinks, updateDueDate: edit a ticket's links / due date.
 *   - approveTicket, requestRevision: the lead's review decisions (also notify
 *     the student).
 *   - updateTicketStatusAsLead: the lead's dropdown; routes Approve and Needs
 *     revisions to the two functions above.
 *   - updateTicketStatusForCopies(ticket, lead, newStatus, applyToAll): the same
 *     status change on one ticket or on every copy across students (skipping
 *     copies already at that status).
 *   - updateStudentTicket(ticket, changes): a student editing a ticket they
 *     created (title, description, phase, due date, assignee, who can see it).
 *   - deleteTicket(ticketId, { actorId }): deletes the ticket with its comments,
 *     history and related notifications. A student passes their own uid so only
 *     the alerts they are allowed to touch are cleared.
 *   - STATUS_EVENT (private): maps a status to its history event type.
 *
 * Appears in the following files:
 *   - createTicket: features/tickets/components/CreateTicketModal.jsx,
 *       features/tickets/components/StudentTicketModal.jsx
 *   - findMatchingTickets: features/tickets/components/EditTicketModal.jsx; also inside this
 *       file by updateTicketDetails
 *   - updateTicketDetails: features/tickets/components/EditTicketModal.jsx
 *   - updateStudentTicket: features/tickets/components/StudentTicketModal.jsx
 *   - updateStudentStatus: features/tickets/components/TicketDetailModal.jsx; also inside this
 *       file by markNeedSupport
 *   - markNeedSupport: features/tickets/components/TicketDetailModal.jsx
 *   - updateLinks: features/tickets/components/TicketDetailModal.jsx
 *   - updateDueDate: features/tickets/components/TicketDetailModal.jsx
 *   - approveTicket: also inside this file by updateTicketStatusAsLead
 *   - requestRevision: also inside this file by updateTicketStatusAsLead
 *   - updateTicketStatusAsLead: features/tickets/components/TicketDetailModal.jsx; also
 *       inside this file by updateTicketStatusForCopies
 *   - updateTicketStatusForCopies: features/tickets/components/EditTicketModal.jsx
 *   - deleteTicket: features/tickets/components/TicketDetailModal.jsx (lead and the
 *       student who created the ticket)
 *   - Local helpers (only used in this file): STATUS_EVENT
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
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

// `createdBy` is the creating user ({ uid, email, displayName }). `visibleTo`
// is the list of student uids who can see the ticket; the assignee and the
// creator (when a student) are always included. The lead sees every ticket
// regardless.
export async function createTicket({
  projectId,
  title,
  description,
  phase,
  dueDate,
  assignedTo,
  assignedToName,
  links,
  createdBy,
  createdByRole = "lead",
  visibleTo = [],
}) {
  const viewers = new Set([...visibleTo, assignedTo]);
  if (createdByRole === "student") viewers.add(createdBy.uid);

  const ref = await addDoc(collection(db, "tickets"), {
    projectId,
    title,
    description,
    phase,
    dueDate: dueDate || null,
    assignedTo,
    assignedToName,
    createdBy: createdBy.uid,
    createdByName: createdBy.displayName || createdBy.email || "",
    createdByRole,
    visibleTo: [...viewers],
    links: links || [],
    status: STATUS.READY_TO_START,
    needsRevision: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    reviewedBy: null,
    reviewedAt: null,
  });
  await logHistory(ref.id, { type: "created", actor: createdBy, actorRole: createdByRole });
}

// Tickets have no shared id across students, so "the same ticket for
// everyone" is every ticket in the project with the same title and phase
// (that's how "Add ticket -> All students" creates them). Includes the
// ticket itself.
export async function findMatchingTickets(ticket) {
  if (ticket.createdByRole === "student") {
    const own = await getDoc(doc(db, "tickets", ticket.id));
    return own.exists() ? [own] : [];
  }
  const snap = await getDocs(
    query(
      collection(db, "tickets"),
      where("projectId", "==", ticket.projectId),
      where("title", "==", ticket.title)
    )
  );
  return snap.docs.filter((d) => d.data().phase === ticket.phase && d.data().createdByRole !== "student");
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

// A student's edit of a ticket they created. `changes` holds only the fields
// that actually changed; visibleTo (when sent) is rebuilt so it always still
// contains the creator and the (possibly new) assignee. Everyone who can see
// the ticket gets the update live via their board's snapshot listener.
export async function updateStudentTicket(ticket, changes) {
  const data = { ...changes, updatedAt: serverTimestamp() };
  if ("dueDate" in data) data.dueDate = data.dueDate || null;
  if ("visibleTo" in data || "assignedTo" in data) {
    const assignedTo = data.assignedTo ?? ticket.assignedTo;
    data.visibleTo = [...new Set([...(data.visibleTo ?? ticket.visibleTo ?? []), assignedTo, ticket.createdBy])];
  }
  await updateDoc(doc(db, "tickets", ticket.id), data);
}

const STATUS_EVENT = {
  [STATUS.READY_TO_START]: "reset_to_ready",
  [STATUS.IN_PROGRESS]: "started",
  [STATUS.READY_FOR_REVIEW]: "submitted_for_review",
  [STATUS.NEED_SUPPORT]: "requested_support",
  [STATUS.CLOSED]: "closed",
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
// The lead's status change from the Edit ticket form: this one ticket, or every
// student's copy. Each copy goes through updateTicketStatusAsLead so history and
// student notifications stay correct; copies already at newStatus are skipped.
export async function updateTicketStatusForCopies(ticket, lead, newStatus, applyToAll) {
  if (!applyToAll) {
    await updateTicketStatusAsLead(ticket, lead, newStatus);
    return 1;
  }
  const matches = await findMatchingTickets(ticket);
  const targets = matches.map((d) => ({ id: d.id, ...d.data() })).filter((t) => t.status !== newStatus);
  for (const target of targets) {
    await updateTicketStatusAsLead(target, lead, newStatus);
  }
  return targets.length;
}

export async function deleteTicket(ticketId, { actorId } = {}) {
  // The lead can find every notification about the ticket. A student can only
  // read the ones they triggered or received, so query for exactly those.
  const notificationQueries = actorId
    ? [
        query(collection(db, "notifications"), where("ticketId", "==", ticketId), where("actorId", "==", actorId)),
        query(collection(db, "notifications"), where("ticketId", "==", ticketId), where("recipientId", "==", actorId)),
      ]
    : [query(collection(db, "notifications"), where("ticketId", "==", ticketId))];

  const [commentsSnap, historySnap, ...notificationSnaps] = await Promise.all([
    getDocs(collection(db, "tickets", ticketId, "comments")),
    getDocs(collection(db, "tickets", ticketId, "history")),
    ...notificationQueries.map((q) => getDocs(q)),
  ]);

  const batch = writeBatch(db);
  commentsSnap.docs.forEach((d) => batch.delete(d.ref));
  historySnap.docs.forEach((d) => batch.delete(d.ref));
  const notificationRefs = new Map();
  notificationSnaps.forEach((snap) => snap.docs.forEach((d) => notificationRefs.set(d.id, d.ref)));
  notificationRefs.forEach((ref) => batch.delete(ref));
  batch.delete(doc(db, "tickets", ticketId));
  await batch.commit();
}
