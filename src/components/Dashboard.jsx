import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDialog } from "../context/DialogContext";
import { useStudents } from "../hooks/useStudents";
import { useClasses } from "../hooks/useClasses";
import { usePayments } from "../hooks/usePayments";
import PaymentUndoBar from "./PaymentUndoBar";
import PageHero from "./PageHero";
import {
  AVATAR_COLORS,
  formatRs,
  initials,
  nextPaymentClassCount,
  sortStudentsByUnpaid,
  studentAvatarIndex,
  subjectBadgeClasses,
  SUBJECT_LABELS,
  todayYYYYMMDD,
  totalClassesLogged,
  unpaidClasses,
  unpaidInCurrentBundle,
  totalIncomeAll,
} from "../utils/helpers";

function StatCard({ label, value, mono }) {
  return (
    <div className="tt-stat">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      <div
        className={`relative z-[1] mt-1 text-2xl font-bold tracking-tighter text-[var(--text)] ${mono ? "font-mono-nums" : "font-display"}`}
      >
        {value}
      </div>
    </div>
  );
}

function CollectBanner({ student, unpaidTotal, bundlePayCount, bundleAmountRs, onCollect }) {
  const subtitle =
    unpaidTotal > bundlePayCount
      ? `${bundlePayCount}-class bundle (oldest first) · ${unpaidTotal} unpaid total → ${bundleAmountRs}`
      : `10 classes ready · ${bundleAmountRs}`;
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-[rgba(26,122,92,0.32)] bg-gradient-to-br from-[rgba(238,247,241,0.98)] via-white/95 to-[rgba(237,239,253,0.55)] px-4 py-3.5 shadow-[0_20px_48px_-32px_rgba(13,74,53,0.42)] ring-2 ring-[rgba(26,122,92,0.08)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div aria-hidden className="pointer-events-none absolute -right-4 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(26,122,92,0.15)_0%,transparent_70%)] blur-xl" />
      <p className="relative text-sm font-semibold leading-snug text-[var(--accent)]">
        {student.name} — {subtitle}
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

  const [undoPayment, setUndoPayment] = useState(null);
  const dismissUndo = useCallback(() => setUndoPayment(null), []);

  async function collect(student) {
    const uid = user.uid;
    const unpaid = unpaidClasses(student.id, classes, payments);
    if (unpaid <= 0) return;
    const payCount = nextPaymentClassCount(student.id, classes, payments);
    const totalAmount = payCount * student.pricePerClass;
    const extra =
      unpaid > payCount
        ? ` (${unpaid} unpaid total — this payment covers the oldest ${payCount} toward this bundle.)`
        : "";
    const confirmed = await showConfirm({
      title: "Record payment?",
      message: `${formatRs(totalAmount)} for ${payCount} class(es)?${extra} Older sessions are marked paid first; the rest stay toward the next bundle.`,
      confirmLabel: "Record payment",
      cancelLabel: "Not yet",
    });
    if (!confirmed) return;
    const pref = await addDoc(collection(db, "users", uid, "payments"), {
      studentId: student.id,
      studentName: student.name,
      subject: student.subject,
      classCount: payCount,
      pricePerClass: student.pricePerClass,
      totalAmount,
      date: todayYYYYMMDD(),
      collectedAt: serverTimestamp(),
    });
    setUndoPayment({
      id: pref.id,
      line: `${formatRs(totalAmount)} · ${student.name}`,
    });
  }

  return (
    <>
    <div className="tt-page">
      <PageHero
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Totals for your tutoring practice — who owes you, bundles to collect, and quick entry to profiles."
      />

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
          {readyStudents.map((s) => {
            const uTotal = unpaidClasses(s.id, classes, payments);
            const payCnt = nextPaymentClassCount(s.id, classes, payments);
            return (
            <CollectBanner
              key={s.id}
              student={s}
              unpaidTotal={uTotal}
              bundlePayCount={payCnt}
              bundleAmountRs={formatRs(payCnt * s.pricePerClass)}
              onCollect={collect}
            />
            );
          })}
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
            const bundlePos = unpaidInCurrentBundle(unpaid);
            const total = classes.filter((c) => c.studentId === s.id).length;
            const color =
              AVATAR_COLORS[studentAvatarIndex(s, students) % AVATAR_COLORS.length];
            const pct = Math.min(100, (bundlePos / 10) * 100);
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
                    {bundlePos}/10 this bundle · {unpaid} unpaid total · {total} classes logged
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
    {undoPayment ? (
      <PaymentUndoBar
        uid={user.uid}
        paymentId={undoPayment.id}
        summaryLine={`Recorded: ${undoPayment.line}. Mistake? Undo within 30s or delete later in Income.`}
        onUndoComplete={() => {
          dismissUndo();
          showToast("Payment removed — unpaid counts updated.");
        }}
        onExpire={dismissUndo}
      />
    ) : null}
    </>
  );
}
