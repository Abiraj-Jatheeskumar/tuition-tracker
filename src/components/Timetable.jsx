import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";
import { useSlots } from "../hooks/useSlots";
import { useStudents } from "../hooks/useStudents";
import {
  SUBJECT_LABELS,
  slotDisplayTime,
  subjectBadgeClasses,
} from "../utils/helpers";
import PageHero from "./PageHero";
import { createPendingSlotLine, SlotRowInputs, slotFirestorePayload } from "./SlotRowInputs";

export default function Timetable() {
  const { user } = useAuth();
  const { showConfirm, showAlert } = useDialog();
  const { slots, loading } = useSlots();
  const { students, loading: loadingStudents } = useStudents();
  const [studentId, setStudentId] = useState("");
  const [draft, setDraft] = useState(() => createPendingSlotLine());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!studentId && students.length) {
      setStudentId(students[0].id);
    }
    if (studentId && students.length && !students.some((s) => s.id === studentId)) {
      setStudentId(students[0].id);
    }
  }, [students, studentId]);

  async function handleAddSlot(e) {
    e.preventDefault();
    if (!user || !draft.time24?.trim() || !studentId) return;
    const stu = students.find((x) => x.id === studentId);
    if (!stu) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "students", studentId, "slots"), {
        ...slotFirestorePayload(draft),
        studentId,
        studentName: stu.name,
        subject: stu.subject,
        createdAt: serverTimestamp(),
      });
      setDraft(createPendingSlotLine());
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "Couldn't save slot",
        message: err?.message || "Try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slot) {
    if (!user || !studentId) return;
    const confirmed = await showConfirm({
      title: "Remove this slot?",
      message: `${slot.studentName || "Lesson"} · ${slot.day} ${slotDisplayTime(slot)}.`,
      confirmLabel: "Remove",
      cancelLabel: "Keep",
    });
    if (!confirmed) return;
    try {
      if (slot.__legacy) {
        await deleteDoc(doc(db, "users", user.uid, "slots", slot.id));
      } else {
        await deleteDoc(doc(db, "users", user.uid, "students", slot.studentId, "slots", slot.id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="tt-page">
      <PageHero
        eyebrow="Calendar"
        title="Timetable"
        subtitle="Weekly slots belong to each student. Legacy rows from older data show as general — merge them into learners when you can."
      />

      <form onSubmit={handleAddSlot} className="tt-card mt-8 border px-5 py-5 shadow-lg shadow-emerald-900/5">
        <h2 className="font-display text-[0.9375rem] font-semibold text-[var(--text)]">Add a slot</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          Choose student first — day, duration, then tap the clock icon for time (native picker on phone).
        </p>
        {students.length === 0 && !loadingStudents ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Add a student first in{" "}
            <Link to="/add-student" className="font-semibold text-[var(--accent)] underline underline-offset-2">
              Add student
            </Link>
            .
          </p>
        ) : (
          <>
            <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Student
              <select
                value={studentId || students[0]?.id || ""}
                onChange={(e) => setStudentId(e.target.value)}
                className="tt-input tt-select-touch mt-2 cursor-pointer py-3"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-6">
              <SlotRowInputs row={draft} onChange={setDraft} showRemove={false} />
            </div>
            <button type="submit" disabled={saving || !studentId || !draft.time24?.trim()} className="tt-btn-dark mt-4 min-h-[3rem] px-8">
              Save slot
            </button>
          </>
        )}
      </form>

      <h2 className="tt-section-title mt-10">All weekly slots</h2>
      {loading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton-pulse min-h-[130px] rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">Nothing scheduled yet.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((s) => (
            <div
              key={`${s.__legacy ? "L" : s.studentId || "?"}-${s.id}`}
              className="tt-card-solid tt-card-hover relative overflow-hidden border px-5 py-4 pt-6 before:absolute before:left-0 before:right-0 before:top-0 before:z-0 before:h-1 before:bg-gradient-to-r before:from-[var(--accent-bright)] before:to-[var(--violet)]"
            >
              <div className="relative z-[1] text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                {(s.studentName || "Lesson") + ` · ${s.day || "—"}`}
              </div>
              <div className="relative z-[1] mt-2 font-mono-nums text-3xl font-bold tracking-tight text-[var(--text)]">
                {slotDisplayTime(s)}
              </div>
              <div className="relative z-[1] mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject)}`}>
                  {SUBJECT_LABELS[s.subject] || s.subject || ""}
                </span>
                <span className="font-mono-nums text-xs font-medium text-[var(--muted)]">{s.duration}</span>
                {s.studentId ? (
                  <Link
                    to={`/students/${s.studentId}`}
                    className="rounded-full bg-[rgba(13,74,53,0.09)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] no-underline sm:text-[10px]"
                  >
                    Student
                  </Link>
                ) : null}
              </div>
              {s.venue ? <div className="relative z-[1] mt-2 text-xs text-[var(--muted)]">{s.venue}</div> : null}
              <button
                type="button"
                onClick={() => handleDelete(s)}
                className="tt-btn-ghost relative z-[1] mt-5 w-full min-h-11 text-[var(--red)] hover:border-[rgba(197,48,48,0.35)] hover:bg-[var(--red-light)] hover:text-[var(--red)]"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
