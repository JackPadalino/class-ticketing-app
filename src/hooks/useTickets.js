import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

// Oldest first, so a sequence of onboarding tickets (e.g. "Create Google
// Drive folder" before "Choose Tech Stack") reads top-to-bottom in the
// order they were assigned.
function byCreatedAtAsc(a, b) {
  return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
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
      list.sort(byCreatedAtAsc);
      setTickets(list);
      setLoading(false);
    });
    return unsub;
  }, [projectId, uid, isLead]);

  return { tickets, loading };
}
