import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export function useSlots() {
  const { user, authReady } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!user) {
      setSlots([]);
      setLoading(false);
      return undefined;
    }
    const uid = user.uid;
    const q = query(collection(db, "users", uid, "slots"));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => {
        const di = Number(a.dayIndex) - Number(b.dayIndex);
        if (di !== 0) return di;
        return String(a.time || "").localeCompare(String(b.time || ""));
      });
      setSlots(rows);
      setLoading(false);
    });
    return () => unsub();
  }, [user, authReady]);

  return { slots, loading };
}
