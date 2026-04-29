import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDialog } from "../context/DialogContext";
import { useStudents } from "../hooks/useStudents";
import { useClasses } from "../hooks/useClasses";
import { usePayments } from "../hooks/usePayments";
import {
  AVATAR_COLORS,
  classesChronologicalForStudent,
  formatRs,
  initials,
  paidClassIdSet,
  studentAvatarIndex,
  subjectBadgeClasses,
  SUBJECT_LABELS,
  todayYYYYMMDD,
  totalEarnedFromStudent,
  totalPaidClassCount,
  unpaidClasses,
} from "../utils/helpers";

export default function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showAlert, showConfirm } = useDialog();
  const { students, loading: ls } = useStudents();
  const { classes, loading: lc } = useClasses();
  const { payments, loading: lp } = usePayments();
  const [date, setDate] = useState(todayYYYYMMDD());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const student = useMemo(
    () => students.find((s) => s.id === studentId),
    [students, studentId],
  );

  const loading = ls || lc || lp;

  const studentClasses = useMemo(
    () => classes.filter((c) => c.studentId === studentId),
    [classes, studentId],
  );

  const chrono = useMemo(
    () => classesChronologicalForStudent(studentId, classes),
    [classes, studentId],
  );

  const classNumberById = useMemo(() => {
    const m = new Map();
    chrono.forEach((c, i) => m.set(c.id, i + 1));
    return m;
  }, [chrono]);

  const paidSet = useMemo(
    () => paidClassIdSet(studentId, classes, payments),
    [studentId, classes, payments],
  );

  const unpaid = student ? unpaidClasses(student.id, classes, payments) : 0;
  const totalLogged = studentClasses.length;
  const paidCount = student ? totalPaidClassCount(student.id, payments) : 0;
  const earned = student ? totalEarnedFromStudent(student.id, payments) : 0;
  const color = student
    ? AVATAR_COLORS[studentAvatarIndex(student, students) % AVATAR_COLORS.length]
    : AVATAR_COLORS[0];
  const pct = Math.min(100, (unpaid / 10) * 100);

  async function handleLogClass(e) {
    e.preventDefault();
    if (!student || !user) return;
    setSaving(true);
    const uid = user.uid;
    const beforeUnpaid = unpaidClasses(student.id, classes, payments);
    try {
      await addDoc(collection(db, "users", uid, "classes"), {
        studentId: student.id,
        studentName: student.name,
        subject: student.subject,
        date,
        note: note.trim() || "",
        loggedAt: serverTimestamp(),
      });
      const afterUnpaid = beforeUnpaid + 1;
      setNote("");
      setDate(todayYYYYMMDD());
      if (beforeUnpaid < 10 && afterUnpaid >= 10) {
        showToast("🎉 10 classes done! Time to collect.");
      } else {
        showToast(`Class logged — ${afterUnpaid}/10 unpaid`);
      }
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "Couldn't log class",
        message: err?.message || "Could not log class",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteClass(c) {
    if (!user) return;
    const ok = await showConfirm({
      title: "Delete this entry?",
      message: "This class session will be removed from the history. You can undo only by logging the class again.",
      confirmLabel: "Delete",
      cancelLabel: "Keep",
    });
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "classes", c.id));
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "Couldn't delete",
        message: err?.message || "Could not delete",
      });
    }
  }

  async function handleCollect() {
    if (!student || !user) return;
    const u = unpaidClasses(student.id, classes, payments);
    if (u <= 0) return;
    const totalAmount = u * student.pricePerClass;
    const confirmed = await showConfirm({
      title: "Record payment?",
      message: `${formatRs(totalAmount)} for ${u} unpaid class(es). This will reset the unpaid tally for counting toward the next bundle of 10.`,
      confirmLabel: "Record payment",
      cancelLabel: "Not yet",
    });
    if (!confirmed) return;
    await addDoc(collection(db, "users", user.uid, "payments"), {
      studentId: student.id,
      studentName: student.name,
      subject: student.subject,
      classCount: u,
      pricePerClass: student.pricePerClass,
      totalAmount,
      date: todayYYYYMMDD(),
      collectedAt: serverTimestamp(),
    });
    showToast(`${formatRs(totalAmount)} recorded from ${student.name}`);
  }

  if (!loading && !student) {
    return (
      <div className="tt-page">
        <p className="text-sm text-[var(--muted)]">Student not found.</p>
        <button
          type="button"
          onClick={() => navigate("/students")}
          className="mt-4 font-semibold text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-bright)]"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="tt-page">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="rounded-lg px-1 text-sm font-semibold text-[var(--muted)] transition hover:bg-[rgba(13,74,53,0.06)] hover:text-[var(--text)]"
      >
        ← Back
      </button>

      {loading || !student ? (
        <div className="mt-6 space-y-4">
          <div className="skeleton-pulse h-28 rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
          <div className="skeleton-pulse min-h-[200px] rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
        </div>
      ) : (
        <>
          <header className="tt-card-solid mt-5 flex flex-col gap-4 border px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-[0.9375rem] font-bold shadow-inner"
                style={{ background: color.bg, color: color.fg }}
              >
                {initials(student.name)}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text)]">{student.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(student.subject)}`}
                  >
                    {SUBJECT_LABELS[student.subject] || student.subject}
                  </span>
                  <span className="font-mono-nums text-sm font-medium text-[var(--muted)]">{formatRs(student.pricePerClass)} / class</span>
                  {student.phone ? <span className="font-mono-nums text-sm font-medium text-[var(--muted)]">{student.phone}</span> : null}
                </div>
              </div>
            </div>
          </header>

          {unpaid >= 10 ? (
            <div className="tt-banner mt-5 flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[var(--accent)]">
                10 classes completed! Collect {formatRs(unpaid * student.pricePerClass)}
              </p>
              <button type="button" onClick={handleCollect} className="tt-btn-accent shrink-0 px-6">
                Got Payment
              </button>
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="tt-stat">
              <div className="relative z-[1] text-xs font-medium text-[var(--muted)]">Unpaid classes</div>
              <div className="relative z-[1] mt-1 font-mono-nums font-display text-2xl font-bold text-[var(--text)]">{unpaid}</div>
            </div>
            <div className="tt-stat">
              <div className="relative z-[1] text-xs font-medium text-[var(--muted)]">Total classes logged</div>
              <div className="relative z-[1] mt-1 font-mono-nums font-display text-2xl font-bold text-[var(--text)]">{totalLogged}</div>
            </div>
            <div className="tt-stat">
              <div className="relative z-[1] text-xs font-medium text-[var(--muted)]">Classes paid</div>
              <div className="relative z-[1] mt-1 font-mono-nums font-display text-2xl font-bold text-[var(--text)]">{paidCount}</div>
            </div>
            <div className="tt-stat">
              <div className="relative z-[1] text-xs font-medium text-[var(--muted)]">Total earned from this student</div>
              <div className="relative z-[1] mt-1 font-mono-nums font-display text-2xl font-bold text-[var(--text)]">{formatRs(earned)}</div>
            </div>
          </div>

          <div className="tt-card mt-8 border px-5 py-5">
            <div className="font-display text-[0.9375rem] font-semibold text-[var(--text)]">Progress (unpaid / 10)</div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[rgba(28,27,24,0.09)] shadow-inner">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color.fg }} />
            </div>
            <div className="mt-4 flex justify-between gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 flex-1 rounded-full shadow-inner transition ${i < unpaid ? "bg-gradient-to-br from-[var(--accent-bright)] to-[var(--accent)]" : "bg-[rgba(28,27,24,0.07)]"}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleLogClass} className="tt-card mt-8 border px-5 py-5">
            <h2 className="font-display text-[0.9375rem] font-semibold text-[var(--text)]">Log a Class</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Date
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="tt-input font-mono-nums" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)] sm:col-span-2">
                Notes (optional)
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Chapter 5 — Electrochemistry"
                  className="tt-input"
                />
              </label>
            </div>
            <button type="submit" disabled={saving} className="tt-btn-dark mt-5 w-full min-h-[3rem] px-10 sm:w-auto">
              ✓ Class Done
            </button>
          </form>

          <h2 className="tt-section-title mt-10">Class history</h2>
          {studentClasses.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">No classes logged yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {studentClasses.map((c) => {
                const num = classNumberById.get(c.id) || 0;
                const paid = paidSet.has(c.id);
                return (
                  <li
                    key={c.id}
                    className="tt-card-solid flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono-nums text-sm font-bold shadow-sm ${paid ? "bg-[rgba(13,74,53,0.12)] text-[var(--accent)]" : "bg-[rgba(28,27,24,0.06)] text-[var(--muted)]"}`}
                      >
                        {num}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="font-mono-nums text-sm font-medium text-[var(--text)]">{c.date}</div>
                        {c.note ? <div className="break-words text-xs leading-snug text-[var(--muted)]">{c.note}</div> : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[rgba(28,27,24,0.06)] pt-3 sm:flex-nowrap sm:border-0 sm:pt-0">
                      {paid ? (
                        <span className="rounded-full bg-[rgba(13,74,53,0.1)] px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                          PAID
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDeleteClass(c)}
                        className="tt-btn-ghost min-h-11 min-w-[4.75rem] text-[var(--red)] hover:border-[rgba(197,48,48,0.3)] hover:bg-[var(--red-light)] hover:text-[var(--red)]"
                      >
                        Del
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
