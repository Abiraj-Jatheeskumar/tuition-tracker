import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export function usePayments() {
  const { user, authReady } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!user) {
      setPayments([]);
      setLoading(false);
      return undefined;
    }
    const uid = user.uid;
    const q = query(
      collection(db, "users", uid, "payments"),
      orderBy("collectedAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user, authReady]);

  return { payments, loading };
}
