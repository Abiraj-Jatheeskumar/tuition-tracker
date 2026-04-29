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
      alert(err?.message || "Could not log class");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteClass(c) {
    if (!user) return;
    if (!window.confirm("Delete this class entry?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "classes", c.id));
    } catch (err) {
      console.error(err);
      alert(err?.message || "Could not delete");
    }
  }

  async function handleCollect() {
    if (!student || !user) return;
    const u = unpaidClasses(student.id, classes, payments);
    if (u <= 0) return;
    const totalAmount = u * student.pricePerClass;
    if (
      !window.confirm(
        `Record payment of ${formatRs(totalAmount)} for ${u} class(es)?`,
      )
    ) {
      return;
    }
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
      <div className="p-6">
        <p className="text-sm text-[var(--muted)]">Student not found.</p>
        <button
          type="button"
          onClick={() => navigate("/students")}
          className="mt-4 text-sm font-semibold text-[var(--accent)] underline"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 md:p-6 md:pb-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]"
      >
        ← Back
      </button>

      {loading || !student ? (
        <div className="mt-4 space-y-3">
          <div className="skeleton-pulse h-24 rounded-[14px] border border-[var(--border)] bg-[var(--surface)]" />
          <div className="skeleton-pulse h-40 rounded-[14px] border border-[var(--border)] bg-[var(--surface)]" />
        </div>
      ) : (
        <>
          <header className="mt-4 flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                style={{ background: color.bg, color: color.fg }}
              >
                {initials(student.name)}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--text)]">
                  {student.name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(student.subject)}`}
                  >
                    {SUBJECT_LABELS[student.subject] || student.subject}
                  </span>
                  <span className="font-mono-nums text-sm text-[var(--muted)]">
                    {formatRs(student.pricePerClass)} / class
                  </span>
                  {student.phone ? (
                    <span className="font-mono-nums text-sm text-[var(--muted)]">
                      {student.phone}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          {unpaid >= 10 ? (
            <div className="mt-4 flex flex-col gap-3 rounded-[14px] border border-[var(--accent)] bg-[var(--accent-light)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-[var(--accent)]">
                10 classes completed! Collect {formatRs(unpaid * student.pricePerClass)}
              </p>
              <button
                type="button"
                onClick={handleCollect}
                className="min-h-11 shrink-0 rounded-[10px] bg-[var(--accent)] px-4 text-sm font-semibold text-white"
              >
                Got Payment
              </button>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]">
              <div className="text-xs font-medium text-[var(--muted)]">Unpaid classes</div>
              <div className="mt-1 font-mono-nums text-lg font-semibold text-[var(--text)]">
                {unpaid}
              </div>
            </div>
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]">
              <div className="text-xs font-medium text-[var(--muted)]">
                Total classes logged
              </div>
              <div className="mt-1 font-mono-nums text-lg font-semibold text-[var(--text)]">
                {totalLogged}
              </div>
            </div>
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]">
              <div className="text-xs font-medium text-[var(--muted)]">Classes paid</div>
              <div className="mt-1 font-mono-nums text-lg font-semibold text-[var(--text)]">
                {paidCount}
              </div>
            </div>
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]">
              <div className="text-xs font-medium text-[var(--muted)]">
                Total earned from this student
              </div>
              <div className="mt-1 font-mono-nums text-lg font-semibold text-[var(--text)]">
                {formatRs(earned)}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="text-sm font-semibold text-[var(--text)]">
              Progress (unpaid / 10)
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: color.fg }}
              />
            </div>
            <div className="mt-3 flex justify-between gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 flex-1 rounded-full ${i < unpaid ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                />
              ))}
            </div>
          </div>

          <form
            onSubmit={handleLogClass}
            className="mt-6 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]"
          >
            <h2 className="text-sm font-semibold text-[var(--text)]">Log a Class</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-[var(--muted)]">
                Date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 font-mono-nums text-sm outline-none ring-[var(--accent)] focus:ring-2"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)] sm:col-span-2">
                Notes (optional)
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Chapter 5 — Electrochemistry"
                  className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 min-h-11 w-full rounded-[10px] bg-[var(--text)] text-sm font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8"
            >
              ✓ Class Done
            </button>
          </form>

          <h2 className="mt-8 text-sm font-semibold text-[var(--text)]">
            Class history
          </h2>
          {studentClasses.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">No classes logged yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {studentClasses.map((c) => {
                const num = classNumberById.get(c.id) || 0;
                const paid = paidSet.has(c.id);
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-3"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono-nums text-sm font-semibold ${
                        paid ? "bg-[var(--accent-light)] text-[var(--accent)]" : "bg-[var(--border)] text-[var(--muted)]"
                      }`}
                    >
                      {num}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono-nums text-sm text-[var(--text)]">
                        {c.date}
                      </div>
                      {c.note ? (
                        <div className="truncate text-xs text-[var(--muted)]">{c.note}</div>
                      ) : null}
                    </div>
                    {paid ? (
                      <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">
                        PAID
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleDeleteClass(c)}
                      className="min-h-10 min-w-10 rounded-[10px] border border-[var(--border)] text-xs font-semibold text-[var(--red)] hover:bg-[var(--red-light)]"
                    >
                      Del
                    </button>
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
