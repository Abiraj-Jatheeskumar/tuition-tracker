import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export async function deleteSlotDocsUnderStudent(db, uid, studentId) {
  const sref = collection(db, "users", uid, "students", studentId, "slots");
  const snap = await getDocs(sref);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function removeStudentCascade(db, uid, studentId) {
  const cref = collection(db, "users", uid, "classes");
  const cs = await getDocs(query(cref, where("studentId", "==", studentId)));
  await Promise.all(cs.docs.map((d) => deleteDoc(d.ref)));
  const pref = collection(db, "users", uid, "payments");
  const ps = await getDocs(query(pref, where("studentId", "==", studentId)));
  await Promise.all(ps.docs.map((d) => deleteDoc(d.ref)));
  await deleteSlotDocsUnderStudent(db, uid, studentId);
  await deleteDoc(doc(db, "users", uid, "students", studentId));
}

/**
 * Updates student core fields and keeps denormalized copies in classes / payments / slots in sync.
 */
export async function updateStudentProfile(db, uid, studentId, next, prev) {
  const nameTrim = String(next.name || "").trim();
  const payload = {
    name: nameTrim,
    subject: next.subject,
    pricePerClass: Number(next.pricePerClass),
    phone: String(next.phone || "").trim(),
    updatedAt: serverTimestamp(),
  };

  await updateDoc(doc(db, "users", uid, "students", studentId), payload);

  const nameChanged = (prev.name || "").trim() !== nameTrim;
  const subChanged = prev.subject !== next.subject;

  if (nameChanged) {
    const cs = await getDocs(
      query(collection(db, "users", uid, "classes"), where("studentId", "==", studentId)),
    );
    await Promise.all(cs.docs.map((d) => updateDoc(d.ref, { studentName: nameTrim })));
    const ps = await getDocs(
      query(collection(db, "users", uid, "payments"), where("studentId", "==", studentId)),
    );
    await Promise.all(ps.docs.map((d) => updateDoc(d.ref, { studentName: nameTrim })));
    const slots = await getDocs(collection(db, "users", uid, "students", studentId, "slots"));
    await Promise.all(slots.docs.map((d) => updateDoc(d.ref, { studentName: nameTrim })));
  }

  if (subChanged) {
    const cs = await getDocs(
      query(collection(db, "users", uid, "classes"), where("studentId", "==", studentId)),
    );
    await Promise.all(cs.docs.map((d) => updateDoc(d.ref, { subject: next.subject })));
    const ps = await getDocs(
      query(collection(db, "users", uid, "payments"), where("studentId", "==", studentId)),
    );
    await Promise.all(ps.docs.map((d) => updateDoc(d.ref, { subject: next.subject })));
    const slots = await getDocs(collection(db, "users", uid, "students", studentId, "slots"));
    await Promise.all(slots.docs.map((d) => updateDoc(d.ref, { subject: next.subject })));
  }
}
