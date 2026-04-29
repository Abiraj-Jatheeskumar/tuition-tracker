import { Link } from "react-router-dom";
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
  unpaidClasses,
} from "../utils/helpers";

export default function Students() {
  const { students, loading: ls } = useStudents();
  const { classes, loading: lc } = useClasses();
  const { payments, loading: lp } = usePayments();
  const loading = ls || lc || lp;
  const sorted = sortStudentsByUnpaid(students, classes, payments);
  const ready = sorted.filter((s) => unpaidClasses(s.id, classes, payments) >= 10);

  return (
    <div className="p-4 pb-24 md:p-6 md:pb-6">
      <h1 className="text-xl font-semibold text-[var(--text)]">Students</h1>
      <p className="mt-0.5 text-sm text-[var(--muted)]">
        Tap a student to log classes and view history.
      </p>

      {!loading && ready.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {ready.map((s) => {
            const unpaid = unpaidClasses(s.id, classes, payments);
            return (
              <div
                key={s.id}
                className="flex flex-col gap-2 rounded-[14px] border border-[var(--accent)] bg-[var(--accent-light)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm font-medium text-[var(--accent)]">
                  {s.name} — {unpaid} unpaid · {formatRs(unpaid * s.pricePerClass)} to collect
                </p>
                <Link
                  to={`/students/${s.id}`}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[10px] bg-[var(--accent)] px-4 text-sm font-semibold text-white"
                >
                  Open
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-pulse h-[180px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-8 rounded-[14px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
          No students yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                className={`relative flex flex-col rounded-[14px] border bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)] transition hover:border-[var(--accent)] ${
                  unpaid >= 10
                    ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/25"
                    : "border-[var(--border)]"
                }`}
              >
                {unpaid >= 10 ? (
                  <span className="absolute right-3 top-3 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Collect
                  </span>
                ) : null}
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ background: color.bg, color: color.fg }}
                  >
                    {initials(s.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[var(--text)]">{s.name}</div>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject)}`}
                    >
                      {SUBJECT_LABELS[s.subject] || s.subject}
                    </span>
                  </div>
                </div>
                <div className="mt-3 font-mono-nums text-sm text-[var(--muted)]">
                  {formatRs(s.pricePerClass)} / class
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color.fg }}
                  />
                </div>
                <div className="mt-2 font-mono-nums text-xs text-[var(--muted)]">
                  {unpaid}/10 unpaid · {total} classes logged
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
