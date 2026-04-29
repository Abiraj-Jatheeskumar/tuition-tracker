import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export function useStudents() {
  const { user, authReady } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!user) {
      setStudents([]);
      setLoading(false);
      return undefined;
    }
    const uid = user.uid;
    const q = query(
      collection(db, "users", uid, "students"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user, authReady]);

  return { students, loading };
}
