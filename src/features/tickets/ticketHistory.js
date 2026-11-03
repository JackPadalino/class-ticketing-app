/**
 *   - logHistory(ticketId, { type, actor, actorRole }): appends an entry to a
 *     ticket's history subcollection (created, started, submitted_for_review,
 *     needs_revision, approved...). The timeline on the ticket modal reads these.
 *
 * Appears in the following files:
 *   - logHistory: features/tickets/ticketActions.js
 */

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export function logHistory(ticketId, { type, actor, actorRole }) {
  return addDoc(collection(db, "tickets", ticketId, "history"), {
    type,
    actorId: actor.uid,
    actorName: actor.displayName || actor.email,
    actorRole,
    createdAt: serverTimestamp(),
  });
}
