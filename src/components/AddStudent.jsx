import { useCallback, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { removeStudentCascade, updateStudentProfile } from "../firebase/studentLifecycle";
import { useAuth } from "../context/AuthContext";
import { useStudents } from "../hooks/useStudents";
import { useToast } from "../context/ToastContext";
import { useDialog } from "../context/DialogContext";
import {
  subjectBadgeClasses,
  SUBJECT_LABELS,
  SUBJECT_OPTIONS,
  formatRs,
} from "../utils/helpers";
import PageHero from "./PageHero";
import StudentEditorModal from "./StudentEditorModal";
import { createPendingSlotLine, SlotRowInputs, slotFirestorePayload } from "./SlotRowInputs";

export default function AddStudent() {
  const { user } = useAuth();
  const { students, loading } = useStudents();
  const { showToast } = useToast();
  const { showAlert, showConfirm } = useDialog();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("chem");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [scheduleLines, setScheduleLines] = useState([]);
  const [editing, setEditing] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const updateScheduleLine = useCallback((key, next) => {
    setScheduleLines((prev) => prev.map((row) => (row.key === key ? next : row)));
  }, []);

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
      const pref = await addDoc(collection(db, "users", user.uid, "students"), {
        name: name.trim(),
        subject,
        pricePerClass: n,
        phone: phone.trim() || "",
        createdAt: serverTimestamp(),
      });
      const sid = pref.id;
      const trimmedName = name.trim();
      for (const line of scheduleLines) {
        if (!line.time24?.trim()) continue;
        await addDoc(collection(db, "users", user.uid, "students", sid, "slots"), {
          ...slotFirestorePayload(line, {
            subject,
            studentId: sid,
            studentName: trimmedName,
            createdAt: serverTimestamp(),
          }),
        });
      }
      setName("");
      setPrice("");
      setPhone("");
      setSubject("chem");
      setScheduleLines([]);
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

  async function handleSaveEdit(fields) {
    if (!user || !editing) return;
    const n = Number(fields.pricePerClass);
    if (!Number.isFinite(n) || n <= 0) {
      await showAlert({
        title: "Check the price",
        message: "Enter a valid positive amount for Rs. per class.",
      });
      return;
    }
    setSavingEdit(true);
    try {
      await updateStudentProfile(
        db,
        user.uid,
        editing.id,
        { ...fields, pricePerClass: n },
        {
          name: editing.name || "",
          subject: editing.subject || "chem",
          pricePerClass: editing.pricePerClass,
          phone: editing.phone || "",
        },
      );
      showToast("Student profile updated.");
      setEditing(null);
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "Couldn't save",
        message: err?.message || "Update failed.",
      });
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleRemove(student) {
    if (!user) return;
    const confirmed = await showConfirm({
      title: `Remove ${student.name}?`,
      message:
        "This deletes this student's profile, weekly timetable slots, class logs, and payments in Firestore.",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (!confirmed) return;
    try {
      await removeStudentCascade(db, user.uid, student.id);
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
      <PageHero
        eyebrow="Profiles"
        title="Students"
        subtitle="Add learners, edit their rate or subject, or remove profiles — timetable slots stay on each student detail page."
      />

      <form onSubmit={handleSubmit} className="tt-card mt-2 border px-6 py-6 shadow-xl shadow-emerald-900/[0.06]">
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

        <div className="mt-8 rounded-2xl border border-[rgba(13,74,53,0.14)] bg-[rgba(232,242,235,0.35)] px-4 py-4 sm:px-5">
          <p className="font-display text-[0.9375rem] font-semibold text-[var(--text)]">Weekly timetable (optional)</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            One row per recurring lesson — same subject as above. Use the day dropdown and clock picker for time.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {scheduleLines.map((row) => (
              <SlotRowInputs
                key={row.key}
                row={row}
                showRemove={scheduleLines.length > 0}
                onRemove={() =>
                  setScheduleLines((prev) => {
                    if (prev.length <= 1) return [];
                    return prev.filter((r) => r.key !== row.key);
                  })
                }
                onChange={(next) => updateScheduleLine(row.key, next)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setScheduleLines((prev) =>
                prev.length === 0 ? [createPendingSlotLine()] : [...prev, createPendingSlotLine()],
              )
            }
            className="tt-btn-ghost mt-4 min-h-11 px-6"
          >
            {scheduleLines.length === 0 ? "+ Add timetable row" : "+ Another time slot"}
          </button>
        </div>

        <button type="submit" disabled={saving} className="tt-btn-dark mt-7 min-h-[3rem] px-10">
          Add Student
        </button>
      </form>

      <StudentEditorModal
        open={!!editing}
        student={editing}
        saving={savingEdit}
        onClose={() => setEditing(null)}
        onSubmit={handleSaveEdit}
      />

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
              <div className="flex shrink-0 flex-wrap gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setEditing(s)}
                  className="tt-btn-ghost min-h-11 px-5 text-[var(--accent)] hover:border-[rgba(13,74,53,0.28)] hover:bg-[rgba(13,74,53,0.06)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(s)}
                  className="tt-btn-ghost min-h-11 px-5 text-[var(--red)] hover:border-[rgba(197,48,48,0.35)] hover:bg-[var(--red-light)] hover:text-[var(--red)]"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
