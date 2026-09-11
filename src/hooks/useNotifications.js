import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

// Lead: unread "ready for review" pings from any student.
// Student: unread "ticket reviewed" (approved/needs revision) pings
// addressed to them. Sorted client-side to avoid needing a Firestore
// composite index.
export function useNotifications({ role, uid }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!role || (role === "student" && !uid)) return;

    const base = collection(db, "notifications");
    const q =
      role === "lead"
        ? query(base, where("type", "==", "ready_for_review"), where("read", "==", false))
        : query(base, where("recipientId", "==", uid), where("read", "==", false));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setNotifications(list);
    });
    return unsub;
  }, [role, uid]);

  return notifications;
}
