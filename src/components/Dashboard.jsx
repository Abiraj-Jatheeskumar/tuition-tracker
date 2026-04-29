import { Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
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
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      <div
        className={`mt-1 text-xl font-semibold text-[var(--text)] ${mono ? "font-mono-nums" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function CollectBanner({ student, amountRs, unpaid, onCollect }) {
  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-[var(--accent)] bg-[var(--accent-light)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-[var(--accent)]">
        {student.name} — 10 classes done! {amountRs} to collect
      </p>
      <button
        type="button"
        onClick={() => onCollect(student)}
        className="min-h-11 shrink-0 rounded-[10px] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Got Payment
      </button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="skeleton-pulse h-[88px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)]"
        />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
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
    if (
      !window.confirm(
        `Record payment of ${formatRs(totalAmount)} for ${unpaid} class(es)?`,
      )
    ) {
      return;
    }
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
    <div className="p-4 pb-24 md:p-6 md:pb-6">
      <h1 className="text-xl font-semibold text-[var(--text)]">Dashboard</h1>
      <p className="mt-0.5 text-sm text-[var(--muted)]">
        Overview of students, classes, and collections.
      </p>

      {loading ? (
        <div className="mt-6">
          <DashboardSkeleton />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Students" value={students.length} />
          <StatCard
            label="Total Classes Logged"
            value={totalClassesLogged(classes)}
            mono
          />
          <StatCard
            label="Total Income (Rs.)"
            value={totalIncome.toLocaleString()}
            mono
          />
          <StatCard
            label="Ready to Collect"
            value={readyCount}
            mono
          />
        </div>
      )}

      {!loading && readyStudents.length > 0 ? (
        <div className="mt-6 flex flex-col gap-2">
          {readyStudents.map((s) => (
            <CollectBanner
              key={s.id}
              student={s}
              unpaid={unpaidClasses(s.id, classes, payments)}
              amountRs={formatRs(
                unpaidClasses(s.id, classes, payments) * s.pricePerClass,
              )}
              onCollect={collect}
            />
          ))}
        </div>
      ) : null}

      <h2 className="mt-8 text-sm font-semibold text-[var(--text)]">
        Students
      </h2>
      {loading ? (
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-pulse h-[72px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-4 rounded-[14px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
          No students yet. Add one from{" "}
          <Link to="/add-student" className="font-semibold text-[var(--accent)] underline">
            Add Student
          </Link>
          .
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
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
                className={`flex items-center gap-3 rounded-[14px] border bg-[var(--surface)] p-3 shadow-[0_1px_3px_rgba(28,27,24,0.04)] transition hover:border-[var(--accent)] ${
                  unpaid >= 10 ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/20" : "border-[var(--border)]"
                }`}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: color.bg, color: color.fg }}
                >
                  {initials(s.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[var(--text)]">{s.name}</span>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject)}`}
                    >
                      {SUBJECT_LABELS[s.subject] || s.subject}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color.fg }}
                    />
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
