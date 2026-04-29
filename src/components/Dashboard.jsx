import { Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDialog } from "../context/DialogContext";
import { useStudents } from "../hooks/useStudents";
import { useClasses } from "../hooks/useClasses";
import { usePayments } from "../hooks/usePayments";
import {
  AVATAR_COLORS,
  formatRs,
  initials,
  sortStudentsByUnpaid,
  studentAvatarIndex,
  subjectBadgeClasses,
  SUBJECT_LABELS,
  todayYYYYMMDD,
  totalClassesLogged,
  unpaidClasses,
  totalIncomeAll,
} from "../utils/helpers";

function StatCard({ label, value, mono }) {
  return (
    <div className="tt-stat">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      <div
        className={`relative z-[1] mt-1 font-display text-2xl font-bold tracking-tight text-[var(--text)] ${mono ? "font-mono-nums tracking-tighter" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function CollectBanner({ student, amountRs, onCollect }) {
  return (
    <div className="tt-banner flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold leading-snug text-[var(--accent)]">
        {student.name} — 10 classes done! {amountRs} to collect
      </p>
      <button
        type="button"
        onClick={() => onCollect(student)}
        className="tt-btn-accent shrink-0 px-5"
      >
        Got Payment
      </button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-pulse h-[92px] rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showConfirm } = useDialog();
  const { students, loading: ls } = useStudents();
  const { classes, loading: lc } = useClasses();
  const { payments, loading: lp } = usePayments();
  const loading = ls || lc || lp;

  const sorted = sortStudentsByUnpaid(students, classes, payments);
  const readyStudents = sorted.filter(
    (s) => unpaidClasses(s.id, classes, payments) >= 10,
  );
  const totalIncome = totalIncomeAll(payments);
  const readyCount = readyStudents.length;

  async function collect(student) {
    const uid = user.uid;
    const unpaid = unpaidClasses(student.id, classes, payments);
    if (unpaid <= 0) return;
    const totalAmount = unpaid * student.pricePerClass;
    const confirmed = await showConfirm({
      title: "Record payment?",
      message: `${formatRs(totalAmount)} for ${unpaid} class(es)? This updates income and resets unpaid counting.`,
      confirmLabel: "Record payment",
      cancelLabel: "Not yet",
    });
    if (!confirmed) return;
    await addDoc(collection(db, "users", uid, "payments"), {
      studentId: student.id,
      studentName: student.name,
      subject: student.subject,
      classCount: unpaid,
      pricePerClass: student.pricePerClass,
      totalAmount,
      date: todayYYYYMMDD(),
      collectedAt: serverTimestamp(),
    });
    showToast(`${formatRs(totalAmount)} recorded from ${student.name}`);
  }

  return (
    <div className="tt-page">
      <h1 className="tt-heading">Dashboard</h1>
      <p className="tt-sub">Overview of students, classes, and collections.</p>

      {loading ? (
        <div className="mt-8">
          <DashboardSkeleton />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Students" value={students.length} />
          <StatCard label="Total Classes Logged" value={totalClassesLogged(classes)} mono />
          <StatCard label="Total Income (Rs.)" value={totalIncome.toLocaleString()} mono />
          <StatCard label="Ready to Collect" value={readyCount} mono />
        </div>
      )}

      {!loading && readyStudents.length > 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          {readyStudents.map((s) => (
            <CollectBanner
              key={s.id}
              student={s}
              amountRs={formatRs(unpaidClasses(s.id, classes, payments) * s.pricePerClass)}
              onCollect={collect}
            />
          ))}
        </div>
      ) : null}

      <h2 className="tt-section-title mt-10">Students</h2>
      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-pulse h-[76px] rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="tt-card-solid mt-4 border border-dashed border-[rgba(13,74,53,0.2)] bg-[rgba(255,255,255,0.7)] px-6 py-10 text-center">
          <p className="text-sm text-[var(--muted)]">
            No students yet. Add one from{" "}
            <Link to="/add-student" className="font-semibold text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-bright)]">
              Add Student
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {sorted.map((s) => {
            const unpaid = unpaidClasses(s.id, classes, payments);
            const total = classes.filter((c) => c.studentId === s.id).length;
            const color =
              AVATAR_COLORS[studentAvatarIndex(s, students) % AVATAR_COLORS.length];
            const pct = Math.min(100, (unpaid / 10) * 100);
            return (
              <Link
                key={s.id}
                to={`/students/${s.id}`}
                className={`tt-card tt-card-hover flex items-center gap-3 border p-4 ${
                  unpaid >= 10
                    ? "border-[rgba(26,122,92,0.45)] shadow-[0_12px_40px_-16px_rgba(13,74,53,0.35)] ring-2 ring-[rgba(26,122,92,0.15)]"
                    : "border-white/65"
                }`}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold shadow-inner"
                  style={{ background: color.bg, color: color.fg }}
                >
                  {initials(s.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-semibold text-[var(--text)]">{s.name}</span>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject)}`}
                    >
                      {SUBJECT_LABELS[s.subject] || s.subject}
                    </span>
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[rgba(28,27,24,0.08)] shadow-inner">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color.fg }} />
                  </div>
                  <div className="mt-1 font-mono-nums text-[11px] text-[var(--muted)]">
                    {unpaid}/10 unpaid · {total} total classes
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
