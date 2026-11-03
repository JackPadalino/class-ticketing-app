/**
 * useComments(ticketId): live comments for one ticket, oldest first.
 *
 * Where things are used:
 *   - useComments: features/comments/CommentThread.jsx
 */

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function useComments(ticketId) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!ticketId) return;
    const q = query(collection(db, "tickets", ticketId, "comments"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [ticketId]);

  return comments;
}
