import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

function byCreatedAtDesc(a, b) {
  return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
}

// Lead sees every ticket in the project; a student sees only their own.
// Sorted client-side (rather than orderBy in the query), and filtered
// with plain equality clauses only, so this never needs a Firestore
// composite index.
export function useTickets({ projectId, uid, isLead }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    if (!isLead && !uid) return;

    const ticketsRef = collection(db, "tickets");
    const q = isLead
      ? query(ticketsRef, where("projectId", "==", projectId))
      : query(ticketsRef, where("projectId", "==", projectId), where("assignedTo", "==", uid));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort(byCreatedAtDesc);
      setTickets(list);
      setLoading(false);
    });
    return unsub;
  }, [projectId, uid, isLead]);

  return { tickets, loading };
}
