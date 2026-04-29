import { useMemo, useState } from "react";
import { useStudents } from "../hooks/useStudents";
import { usePayments } from "../hooks/usePayments";
import {
  AVATAR_COLORS,
  formatRs,
  initials,
  studentAvatarIndex,
  subjectBadgeClasses,
  SUBJECT_LABELS,
  totalClassesPaidAll,
  totalIncomeAll,
  uniquePaymentMonths,
} from "../utils/helpers";

export default function Income() {
  const { students, loading: ls } = useStudents();
  const { payments, loading: lp } = usePayments();
  const loading = ls || lp;
  const months = useMemo(() => uniquePaymentMonths(payments), [payments]);
  const [month, setMonth] = useState("all");

  const filtered = useMemo(() => {
    if (month === "all") return payments;
    return payments.filter((p) => String(p.date || "").startsWith(month));
  }, [payments, month]);

  const totalCollected = useMemo(() => totalIncomeAll(filtered), [filtered]);
  const classesPaid = useMemo(() => totalClassesPaidAll(filtered), [filtered]);
  const paymentCount = filtered.length;

  return (
    <div className="tt-page">
      <h1 className="tt-heading">Income</h1>
      <p className="tt-sub">Payments you have collected from students.</p>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-pulse h-[96px] rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="tt-stat">
            <div className="relative z-[1] text-xs font-medium text-[var(--muted)]">Total payments collected</div>
            <div className="relative z-[1] mt-1 font-mono-nums font-display text-3xl font-bold text-[var(--text)]">{paymentCount}</div>
          </div>
          <div className="tt-stat">
            <div className="relative z-[1] text-xs font-medium text-[var(--muted)]">Total classes paid</div>
            <div className="relative z-[1] mt-1 font-mono-nums font-display text-3xl font-bold text-[var(--text)]">{classesPaid}</div>
          </div>
          <div className="tt-stat">
            <div className="relative z-[1] text-xs font-medium text-[var(--muted)]">Total income (Rs.)</div>
            <div className="relative z-[1] mt-1 font-mono-nums font-display text-3xl font-bold tracking-tight text-[var(--text)]">
              {totalCollected.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className="tt-card-solid mt-8 flex flex-col gap-4 rounded-xl border px-4 py-4 sm:inline-flex sm:max-w-full sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3 sm:py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Filter</span>
        <label className="flex w-full flex-col text-sm font-semibold text-[var(--text)] sm:w-auto sm:inline-flex sm:flex-row sm:items-center sm:gap-3">
          <span className="shrink-0 sm:pt-2">Month</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="tt-input mt-2 min-h-12 w-full min-w-0 sm:mt-0 sm:ml-0 sm:min-h-11 sm:min-w-[12rem]"
          >
            <option value="all">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h2 className="tt-section-title mt-10">Payment history</h2>
      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-pulse h-[76px] rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No payments in this range.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {filtered.map((p) => {
            const st = students.find((s) => s.id === p.studentId);
            const color = st ? AVATAR_COLORS[studentAvatarIndex(st, students) % AVATAR_COLORS.length] : AVATAR_COLORS[0];
            return (
              <li
                key={p.id}
                className="tt-card-solid tt-card-hover flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:py-3"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold shadow-sm"
                  style={{ background: color.bg, color: color.fg }}
                >
                  {initials(p.studentName || "?")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold text-[var(--text)]">{p.studentName}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(p.subject)}`}>
                      {SUBJECT_LABELS[p.subject] || p.subject}
                    </span>
                    <span className="font-mono-nums text-xs font-medium text-[var(--muted)]">{p.date}</span>
                  </div>
                  <div className="mt-1 font-mono-nums text-xs font-medium text-[var(--muted)]">
                    {p.classCount} classes × {formatRs(p.pricePerClass)}
                  </div>
                </div>
                <div className="w-full shrink-0 border-t border-[rgba(28,27,24,0.06)] pt-3 text-right font-mono-nums font-display text-xl font-bold tracking-tight text-[var(--accent)] sm:w-auto sm:border-0 sm:pt-0 sm:text-lg">
                  {formatRs(p.totalAmount)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
