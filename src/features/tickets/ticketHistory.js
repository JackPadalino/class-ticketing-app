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
