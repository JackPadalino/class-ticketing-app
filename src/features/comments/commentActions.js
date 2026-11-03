/**
 * Firestore writes for ticket comments.
 *   - addComment(ticket, { authorId, authorName, authorRole, text }): saves the
 *     comment and creates a notification (lead_comment for the student, or
 *     student_comment for the lead).
 *   - updateComment(ticketId, commentId, text): edits text, stamps editedAt.
 *   - deleteComment(ticketId, commentId).
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function addComment(ticket, { authorId, authorName, authorRole, text }) {
  await addDoc(collection(db, "tickets", ticket.id, "comments"), {
    authorId,
    authorName,
    authorRole,
    text,
    decision: null,
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "notifications"), {
    type: authorRole === "lead" ? "lead_comment" : "student_comment",
    projectId: ticket.projectId,
    phase: ticket.phase,
    ticketId: ticket.id,
    ticketTitle: ticket.title,
    actorId: authorId,
    actorName: authorName,
    recipientId: authorRole === "lead" ? ticket.assignedTo : null,
    decision: null,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function updateComment(ticketId, commentId, text) {
  await updateDoc(doc(db, "tickets", ticketId, "comments", commentId), {
    text,
    editedAt: serverTimestamp(),
  });
}

export async function deleteComment(ticketId, commentId) {
  await deleteDoc(doc(db, "tickets", ticketId, "comments", commentId));
}
