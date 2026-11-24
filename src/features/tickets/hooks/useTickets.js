/**
 * useTickets({ projectId, uid, isLead }): live tickets for a project, oldest first.
 * The lead gets every ticket; a student gets the tickets assigned to them plus
 * the ones shared with them (visibleTo), merged from two live queries. Returns
 * { tickets, loading }. Uses only single-field filters and sorts/filters
 * client-side so no Firestore composite index is required.
 *
 * Appears in the following files:
 *   - useTickets: features/boards/LeadDashboard.jsx, features/boards/StudentDashboard.jsx
 *   - Local helpers (only used in this file): byCreatedAtAsc
 */

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";

// Oldest first, so a sequence of onboarding tickets (e.g. "Create Google
// Drive folder" before "Choose Tech Stack") reads top-to-bottom in the
// order they were assigned.
function byCreatedAtAsc(a, b) {
  return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
}

// Lead sees every ticket in the project; a student sees the ones assigned to
// them and the ones shared with them. Those are two queries because Firestore
// has no OR across fields; each result is kept apart and merged by id. The
// shared query is not filtered by project server-side (that would need a
// composite index), so it is narrowed to the project here.
export function useTickets({ projectId, uid, isLead }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    if (!isLead && !uid) return;

    const ticketsRef = collection(db, "tickets");

    if (isLead) {
      return onSnapshot(query(ticketsRef, where("projectId", "==", projectId)), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort(byCreatedAtAsc);
        setTickets(list);
        setLoading(false);
      });
    }

    let assigned = null;
    let shared = null;
    const publish = () => {
      if (assigned === null || shared === null) return;
      const byId = new Map();
      [...assigned, ...shared].forEach((t) => byId.set(t.id, t));
      const list = [...byId.values()].filter((t) => t.projectId === projectId);
      list.sort(byCreatedAtAsc);
      setTickets(list);
      setLoading(false);
    };
    const toList = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const unsubAssigned = onSnapshot(
      query(ticketsRef, where("projectId", "==", projectId), where("assignedTo", "==", uid)),
      (snap) => {
        assigned = toList(snap);
        publish();
      }
    );
    const unsubShared = onSnapshot(query(ticketsRef, where("visibleTo", "array-contains", uid)), (snap) => {
      shared = toList(snap);
      publish();
    });
    return () => {
      unsubAssigned();
      unsubShared();
    };
  }, [projectId, uid, isLead]);

  return { tickets, loading };
}
