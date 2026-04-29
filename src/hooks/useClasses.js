import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export function useClasses() {
  const { user, authReady } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!user) {
      setClasses([]);
      setLoading(false);
      return undefined;
    }
    const uid = user.uid;
    const q = query(
      collection(db, "users", uid, "classes"),
      orderBy("loggedAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user, authReady]);

  return { classes, loading };
}
