import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useStudents } from "./useStudents";
import { compareSlotRows } from "../utils/helpers";

/**
 * All weekly slots: per-student subcollections plus legacy top-level `slots` (older data).
 */
export function useSlots() {
  const { user, authReady } = useAuth();
  const { students, loading: loadingStudents } = useStudents();
  const [byStudentId, setByStudentId] = useState({});
  const [legacyRows, setLegacyRows] = useState([]);
  const [legacyReady, setLegacyReady] = useState(false);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!user) {
      setByStudentId({});
      setLegacyRows([]);
      setLegacyReady(true);
      return undefined;
    }
    const uid = user.uid;
    const unsubs = [];
    unsubs.push(
      onSnapshot(collection(db, "users", uid, "slots"), (snap) => {
        setLegacyRows(snap.docs.map((d) => ({ id: d.id, ...d.data(), __legacy: true })));
        setLegacyReady(true);
      }),
    );
    students.forEach((stu) => {
      unsubs.push(
        onSnapshot(collection(db, "users", uid, "students", stu.id, "slots"), (snap) => {
          const rows = snap.docs.map((d) => ({
            ...d.data(),
            id: d.id,
            studentId: stu.id,
            studentName: stu.name,
          }));
          setByStudentId((prev) => ({ ...prev, [stu.id]: rows }));
        }),
      );
    });
    return () => unsubs.forEach((u) => u());
  }, [user, authReady, students]);

  const slots = useMemo(() => {
    const out = [];
    students.forEach((s) => {
      (byStudentId[s.id] || []).forEach((row) => {
        out.push({
          ...row,
          studentId: s.id,
          studentName: s.name,
        });
      });
    });
    legacyRows.forEach((row) => {
      out.push({
        ...row,
        studentName: "General (legacy)",
        __legacy: true,
      });
    });
    out.sort(compareSlotRows);
    return out;
  }, [students, byStudentId, legacyRows]);

  const loading = !legacyReady || loadingStudents;

  return { slots, loading };
}
