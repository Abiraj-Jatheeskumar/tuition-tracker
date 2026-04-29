import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useStudents } from "../hooks/useStudents";
import { useDialog } from "../context/DialogContext";
import {
  subjectBadgeClasses,
  SUBJECT_LABELS,
  SUBJECT_OPTIONS,
  formatRs,
} from "../utils/helpers";

async function removeStudentAndRelated(db, uid, studentId) {
  const cref = collection(db, "users", uid, "classes");
  const cs = await getDocs(query(cref, where("studentId", "==", studentId)));
  await Promise.all(cs.docs.map((d) => deleteDoc(d.ref)));
  const pref = collection(db, "users", uid, "payments");
  const ps = await getDocs(query(pref, where("studentId", "==", studentId)));
  await Promise.all(ps.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, "users", uid, "students", studentId));
}

export default function AddStudent() {
  const { user } = useAuth();
  const { students, loading } = useStudents();
  const { showAlert, showConfirm } = useDialog();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("chem");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !name.trim() || !price) return;
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) {
      await showAlert({
        title: "Check the price",
        message: "Enter a valid positive number for price per class (Rs.).",
      });
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "students"), {
        name: name.trim(),
        subject,
        pricePerClass: n,
        phone: phone.trim() || "",
        createdAt: serverTimestamp(),
      });
      setName("");
      setPrice("");
      setPhone("");
      setSubject("chem");
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "Couldn't save student",
        message: err?.message || "Could not add student",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(student) {
    if (!user) return;
    const confirmed = await showConfirm({
      title: `Remove ${student.name}?`,
      message:
        "This deletes this student's profile and all related class logs and payments in Firestore.",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (!confirmed) return;
    try {
      await removeStudentAndRelated(db, user.uid, student.id);
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "Couldn't remove",
        message: err?.message || "Could not remove",
      });
    }
  }

  return (
    <div className="tt-page">
      <h1 className="tt-heading">Add Student</h1>
      <p className="tt-sub">Create a profile for each learner you teach.</p>

      <form onSubmit={handleSubmit} className="tt-card mt-8 border px-6 py-6 shadow-xl shadow-emerald-900/[0.06]">
        <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Student name *
          <input required value={name} onChange={(e) => setName(e.target.value)} className="tt-input mt-2" />
        </label>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Subject
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="tt-input mt-2">
            {SUBJECT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Price per class (Rs.) *
          <input
            required
            type="number"
            min="1"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="tt-input mt-2 font-mono-nums"
          />
        </label>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Phone (optional)
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="tt-input mt-2" />
        </label>
        <button type="submit" disabled={saving} className="tt-btn-dark mt-7 min-h-[3rem] px-10">
          Add Student
        </button>
      </form>

      <h2 className="tt-section-title mt-10">Existing students</h2>
      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton-pulse h-16 rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No students yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {students.map((s) => (
            <li
              key={s.id}
              className="tt-card-solid tt-card-hover flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="font-display text-lg font-semibold text-[var(--text)]">{s.name}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject)}`}>
                    {SUBJECT_LABELS[s.subject] || s.subject}
                  </span>
                  <span className="font-mono-nums text-xs font-medium text-[var(--muted)]">{formatRs(s.pricePerClass)}</span>
                  {s.phone ? (
                    <span className="font-mono-nums text-xs font-medium text-[var(--muted)]">{s.phone}</span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(s)}
                className="tt-btn-ghost min-h-11 shrink-0 self-start text-[var(--red)] hover:border-[rgba(197,48,48,0.35)] hover:bg-[var(--red-light)] hover:text-[var(--red)] sm:self-center"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
