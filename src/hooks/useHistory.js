import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export function useHistory(ticketId) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!ticketId) return;
    const q = query(collection(db, "tickets", ticketId, "history"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [ticketId]);

  return history;
}
