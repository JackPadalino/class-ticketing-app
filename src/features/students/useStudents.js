/**
 * useStudents(enabled): live list of student profiles sorted by name. Only
 * subscribes when `enabled` is true (the lead's screens).
 */

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function useStudents(enabled) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!enabled) return;
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
      setStudents(list);
    });
    return unsub;
  }, [enabled]);

  return students;
}
