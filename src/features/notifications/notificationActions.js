/**
 * Firestore writes for notifications.
 *   - notifyLead(type, ticket, student): student -> lead ping with no single
 *     recipient (ready_for_review, need_support).
 *   - notifyStudentOfReview(ticket, lead, decision): lead -> that ticket's student
 *     ("approved" or "needs_revision").
 *   - markNotificationRead(id), markAllNotificationsRead(ids): mark read (the bulk
 *     version batches 450 at a time).
 *
 * Where things are used:
 *   - notifyLead: features/tickets/ticketActions.js
 *   - notifyStudentOfReview: features/tickets/ticketActions.js
 *   - markNotificationRead: features/notifications/NotificationBell.jsx,
 *       features/settings/Settings.jsx
 *   - markAllNotificationsRead: features/notifications/NotificationBell.jsx
 */

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

// A student -> lead ping with no single recipient (the lead's Dashboard
// alert toggles decide who sees which types). Shared by both
// "ready for review" and "need support".
export async function notifyLead(type, ticket, student) {
  await addDoc(collection(db, "notifications"), {
    type,
    projectId: ticket.projectId,
    phase: ticket.phase,
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

export async function notifyStudentOfReview(ticket, lead, decision) {
  await addDoc(collection(db, "notifications"), {
    type: "ticket_reviewed",
    projectId: ticket.projectId,
    phase: ticket.phase,
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

export async function markNotificationRead(notificationId) {
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}

// Marks every notification in the list read, in batches (a single
// batch write is capped at 500 operations).
export async function markAllNotificationsRead(notificationIds) {
  const CHUNK_SIZE = 450;
  for (let i = 0; i < notificationIds.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    notificationIds.slice(i, i + CHUNK_SIZE).forEach((id) => {
      batch.update(doc(db, "notifications", id), { read: true });
    });
    await batch.commit();
  }
}
