import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// The single class-wide settings/global doc (see Settings -> Administrative).
// Returns {} if it doesn't exist yet - callers should treat missing fields
// as their documented default rather than requiring the doc to exist.
export function useSettings() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    return onSnapshot(doc(db, "settings", "global"), (snap) => {
      setSettings(snap.exists() ? snap.data() : {});
    });
  }, []);

  return settings;
}
