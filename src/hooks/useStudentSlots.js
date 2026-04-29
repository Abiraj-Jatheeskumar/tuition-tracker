import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { compareSlotRows } from "../utils/helpers";

export function useStudentSlots(studentId) {
  const { user, authReady } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!user || !studentId) {
      setSlots([]);
      setLoading(false);
      return undefined;
    }
    const uid = user.uid;
    const q = collection(db, "users", uid, "students", studentId, "slots");
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort(compareSlotRows);
      setSlots(rows);
      setLoading(false);
    });
    return () => unsub();
  }, [user, authReady, studentId]);

  return { slots, loading };
}
