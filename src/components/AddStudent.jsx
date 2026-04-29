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
      alert("Enter a valid price per class.");
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
      alert(err?.message || "Could not add student");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(student) {
    if (!user) return;
    if (
      !window.confirm(
        `Remove ${student.name}? This deletes their classes and payment records for this student.`,
      )
    ) {
      return;
    }
    try {
      await removeStudentAndRelated(db, user.uid, student.id);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Could not remove");
    }
  }

  return (
    <div className="p-4 pb-24 md:p-6 md:pb-6">
      <h1 className="text-xl font-semibold text-[var(--text)]">Add Student</h1>
      <p className="mt-0.5 text-sm text-[var(--muted)]">
        Create a profile for each learner you teach.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]"
      >
        <label className="block text-xs font-medium text-[var(--muted)]">
          Student name *
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="mt-3 block text-xs font-medium text-[var(--muted)]">
          Subject
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          >
            {SUBJECT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs font-medium text-[var(--muted)]">
          Price per class (Rs.) *
          <input
            required
            type="number"
            min="1"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 font-mono-nums text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="mt-3 block text-xs font-medium text-[var(--muted)]">
          Phone (optional)
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 min-h-11 rounded-[10px] bg-[var(--text)] px-6 text-sm font-semibold text-white disabled:opacity-60"
        >
          Add Student
        </button>
      </form>

      <h2 className="mt-8 text-sm font-semibold text-[var(--text)]">
        Existing students
      </h2>
      {loading ? (
        <div className="mt-3 space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="skeleton-pulse h-14 rounded-[14px] border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : students.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">No students yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {students.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="font-semibold text-[var(--text)]">{s.name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject)}`}
                  >
                    {SUBJECT_LABELS[s.subject] || s.subject}
                  </span>
                  <span className="font-mono-nums text-xs text-[var(--muted)]">
                    {formatRs(s.pricePerClass)}
                  </span>
                  {s.phone ? (
                    <span className="font-mono-nums text-xs text-[var(--muted)]">
                      {s.phone}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(s)}
                className="min-h-10 rounded-[10px] border border-[var(--border)] px-3 text-xs font-semibold text-[var(--red)] hover:bg-[var(--red-light)]"
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
