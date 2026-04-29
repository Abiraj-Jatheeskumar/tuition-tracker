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

  const totalCollected = useMemo(
    () => totalIncomeAll(filtered),
    [filtered],
  );
  const classesPaid = useMemo(
    () => totalClassesPaidAll(filtered),
    [filtered],
  );
  const paymentCount = filtered.length;

  return (
    <div className="p-4 pb-24 md:p-6 md:pb-6">
      <h1 className="text-xl font-semibold text-[var(--text)]">Income</h1>
      <p className="mt-0.5 text-sm text-[var(--muted)]">
        Payments you have collected from students.
      </p>

      {loading ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-pulse h-[88px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]">
            <div className="text-xs font-medium text-[var(--muted)]">
              Total payments collected
            </div>
            <div className="mt-1 font-mono-nums text-xl font-semibold text-[var(--text)]">
              {paymentCount}
            </div>
          </div>
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]">
            <div className="text-xs font-medium text-[var(--muted)]">
              Total classes paid
            </div>
            <div className="mt-1 font-mono-nums text-xl font-semibold text-[var(--text)]">
              {classesPaid}
            </div>
          </div>
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]">
            <div className="text-xs font-medium text-[var(--muted)]">
              Total income (Rs.)
            </div>
            <div className="mt-1 font-mono-nums text-xl font-semibold text-[var(--text)]">
              {totalCollected.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-[var(--muted)]">
          Month
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="ml-2 min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
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

      <h2 className="mt-6 text-sm font-semibold text-[var(--text)]">
        Payment history
      </h2>
      {loading ? (
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-pulse h-16 rounded-[14px] border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">No payments in this range.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {filtered.map((p) => {
            const st = students.find((s) => s.id === p.studentId);
            const color = st
              ? AVATAR_COLORS[studentAvatarIndex(st, students) % AVATAR_COLORS.length]
              : AVATAR_COLORS[0];
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-3"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: color.bg, color: color.fg }}
                >
                  {initials(p.studentName || "?")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[var(--text)]">{p.studentName}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(p.subject)}`}
                    >
                      {SUBJECT_LABELS[p.subject] || p.subject}
                    </span>
                    <span className="font-mono-nums text-xs text-[var(--muted)]">
                      {p.date}
                    </span>
                  </div>
                  <div className="mt-1 font-mono-nums text-xs text-[var(--muted)]">
                    {p.classCount} classes × {formatRs(p.pricePerClass)}
                  </div>
                </div>
                <div className="shrink-0 font-mono-nums text-sm font-semibold text-[var(--text)]">
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
