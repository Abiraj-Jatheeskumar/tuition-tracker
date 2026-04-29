import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";
import { useStudentSlots } from "../hooks/useStudentSlots";
import {
  SUBJECT_LABELS,
  slotDisplayTime,
  subjectBadgeClasses,
} from "../utils/helpers";
import { createPendingSlotLine, SlotRowInputs, slotFirestorePayload } from "./SlotRowInputs";

export default function StudentWeeklySchedule({ student }) {
  const { user } = useAuth();
  const { showConfirm, showAlert } = useDialog();
  const { slots, loading } = useStudentSlots(student.id);
  const [draft, setDraft] = useState(() => createPendingSlotLine());
  const [saving, setSaving] = useState(false);

  async function handleAddScheduled(e) {
    e.preventDefault();
    if (!user || !draft.time24?.trim()) {
      await showAlert({
        title: "Pick a time",
        message: "Use the clock button to choose a lesson time.",
      });
      return;
    }
    setSaving(true);
    try {
      await addDoc(
        collection(db, "users", user.uid, "students", student.id, "slots"),
        slotFirestorePayload(draft, {
          subject: student.subject,
          studentId: student.id,
          studentName: student.name,
          createdAt: serverTimestamp(),
        }),
      );
      setDraft(createPendingSlotLine());
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "Could not save slot",
        message: err?.message || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveRow(s) {
    if (!user) return;
    const ok = await showConfirm({
      title: "Remove this slot?",
      message: `${s.day} · ${slotDisplayTime(s)} will be removed.`,
      confirmLabel: "Remove",
      cancelLabel: "Keep",
    });
    if (!ok) return;
    await deleteDoc(doc(db, "users", user.uid, "students", student.id, "slots", s.id));
  }

  return (
    <div className="tt-card mt-8 border px-5 py-5 shadow-lg shadow-emerald-900/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[0.9375rem] font-semibold text-[var(--text)]">Weekly timetable</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--muted)]">
            Your usual slot for this student. Separate from attendance — use native day, time & duration pickers.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 skeleton-pulse h-24 rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
      ) : slots.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">No fixed slots yet. Add below.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {slots.map((s) => (
            <li
              key={s.id}
              className="tt-card-solid flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{s.day}</div>
                <div className="mt-1 font-mono-nums text-2xl font-bold tracking-tight text-[var(--text)]">
                  {slotDisplayTime(s)}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject || student.subject)}`}
                  >
                    {SUBJECT_LABELS[s.subject || student.subject] || s.subject}
                  </span>
                  <span className="rounded-full bg-[rgba(28,27,24,0.06)] px-2 py-0.5 font-mono-nums text-[11px] font-medium text-[var(--muted)]">
                    {s.duration || "—"}
                  </span>
                  {s.venue ? <span className="text-xs text-[var(--muted)]">{s.venue}</span> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRow(s)}
                className="tt-btn-ghost min-h-11 shrink-0 text-[var(--red)] hover:border-[rgba(197,48,48,0.35)] hover:bg-[var(--red-light)] hover:text-[var(--red)]"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddScheduled} className="mt-6 border-t border-[rgba(28,27,24,0.08)] pt-6">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Add lesson slot</p>
        <SlotRowInputs row={draft} onChange={setDraft} showRemove={false} />
        <button type="submit" disabled={saving} className="tt-btn-dark mt-4 min-h-[3rem] px-8">
          Add weekly slot
        </button>
      </form>
    </div>
  );
}
