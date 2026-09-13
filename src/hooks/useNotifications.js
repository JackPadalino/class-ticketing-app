import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { getEnabledAlertTypes } from "../constants";

// Lead: unread pings from any student, limited to whichever alert types
// are enabled in their alertPrefs (see ALERT_TYPES in constants.js).
// Student: unread pings addressed to them (ticket reviewed, lead
// commented) - always all of them, no toggle for students today.
// Sorted client-side to avoid needing a Firestore composite index.
export function useNotifications({ role, uid, alertPrefs }) {
  const [notifications, setNotifications] = useState([]);
  const enabledTypesKey = role === "lead" ? getEnabledAlertTypes(alertPrefs).join(",") : "";

  useEffect(() => {
    if (!role || (role === "student" && !uid)) return;

    const base = collection(db, "notifications");

    if (role === "lead") {
      const enabledTypes = enabledTypesKey ? enabledTypesKey.split(",") : [];
      if (enabledTypes.length === 0) {
        setNotifications([]);
        return;
      }
      const q = query(base, where("type", "in", enabledTypes), where("read", "==", false));
      const unsub = onSnapshot(q, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setNotifications(list);
      });
      return unsub;
    }

    const q = query(base, where("recipientId", "==", uid), where("read", "==", false));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setNotifications(list);
    });
    return unsub;
  }, [role, uid, enabledTypesKey]);

  return notifications;
}
