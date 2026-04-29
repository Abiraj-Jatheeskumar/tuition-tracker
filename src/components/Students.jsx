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
    <div className="tt-page">
      <h1 className="tt-heading">Students</h1>
      <p className="tt-sub">Tap a student to log classes and view history.</p>

      {!loading && ready.length > 0 ? (
        <div className="mt-6 flex flex-col gap-3">
          {ready.map((s) => {
            const unpaid = unpaidClasses(s.id, classes, payments);
            return (
              <div
                key={s.id}
                className="tt-banner flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm font-semibold leading-snug text-[var(--accent)]">
                  {s.name} — {unpaid} unpaid · {formatRs(unpaid * s.pricePerClass)} to collect
                </p>
                <Link
                  to={`/students/${s.id}`}
                  className="tt-btn-accent inline-flex min-h-[2.75rem] items-center justify-center px-6 text-[0.9375rem] no-underline"
                >
                  Open
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-pulse min-h-[196px] rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="tt-card-solid mt-10 border border-dashed border-[rgba(13,74,53,0.2)] px-8 py-14 text-center text-sm text-[var(--muted)]">
          No students yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                className={`group tt-card tt-card-hover relative flex flex-col overflow-hidden border p-5 ${
                  unpaid >= 10
                    ? "border-[rgba(26,122,92,0.5)] shadow-[0_14px_48px_-20px_rgba(13,74,53,0.45)] ring-2 ring-[rgba(26,122,92,0.14)]"
                    : ""
                }`}
              >
                {unpaid >= 10 ? (
                  <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-[var(--accent-bright)] to-[var(--accent)] px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-emerald-700/25">
                    Collect
                  </span>
                ) : null}
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-[0.9375rem] font-bold shadow-sm"
                    style={{ background: color.bg, color: color.fg }}
                  >
                    {initials(s.name)}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="font-display text-lg font-semibold text-[var(--text)]">{s.name}</div>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject)}`}
                    >
                      {SUBJECT_LABELS[s.subject] || s.subject}
                    </span>
                  </div>
                </div>
                <div className="mt-4 font-mono-nums text-sm font-medium text-[var(--muted)]">{formatRs(s.pricePerClass)} / class</div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[rgba(28,27,24,0.08)] shadow-inner">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 group-hover:[filter:brightness(1.06)]"
                    style={{ width: `${pct}%`, background: color.fg }}
                  />
                </div>
                <div className="mt-2 font-mono-nums text-xs text-[var(--muted)]">{unpaid}/10 unpaid · {total} classes logged</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
