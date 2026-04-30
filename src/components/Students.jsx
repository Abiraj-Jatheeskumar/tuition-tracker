import { useMemo } from "react";
import { Link } from "react-router-dom";
import PageHero from "./PageHero";
import { useStudents } from "../hooks/useStudents";
import { useClasses } from "../hooks/useClasses";
import { usePayments } from "../hooks/usePayments";
import { useSlots } from "../hooks/useSlots";
import {
  AVATAR_COLORS,
  compareSlotRows,
  formatRs,
  initials,
  nextPaymentClassCount,
  slotDisplayTime,
  sortStudentsByUnpaid,
  studentAvatarIndex,
  studentPaymentBundleSize,
  subjectBadgeClasses,
  SUBJECT_LABELS,
  totalBillableUnitsForStudent,
  unpaidClasses,
  unpaidInCurrentBundle,
} from "../utils/helpers";

/** Stable empty list for students with no slots (avoids rerender churn). */
const EMPTY_STUDENT_SLOTS = [];

function dayShort(day) {
  const d = String(day || "").trim();
  return d.length >= 3 ? d.slice(0, 3) : d || "—";
}

function SlotsPreview({ slots }) {
  const sorted = [...slots].sort(compareSlotRows);
  const preview = sorted.slice(0, 4);
  const extra = sorted.length - preview.length;

  if (sorted.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[rgba(28,27,24,0.08)] bg-[rgba(255,255,255,0.45)] px-3 py-2.5 text-center text-xs leading-snug text-[var(--muted)]">
        No recurring slots yet — add a weekly timetable on the profile.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {preview.map((slot) => (
        <li
          key={slot.id}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(28,27,24,0.08)] bg-[rgba(255,255,255,0.95)] px-2.5 py-1.5 font-mono-nums shadow-[inset_3px_0_0_0_var(--accent-bright)] ring-1 ring-[rgba(28,27,24,0.05)]"
        >
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)] sm:text-[10px]">{dayShort(slot.day)}</span>
          <span className="text-sm font-semibold tracking-tight text-[var(--text)] sm:text-[12px]">{slotDisplayTime(slot)}</span>
          {slot.duration ? (
            <span className="text-[11px] font-medium tabular-nums text-[var(--muted)] sm:text-[10px]">{slot.duration}</span>
          ) : null}
        </li>
      ))}
      {extra > 0 ? (
        <li className="inline-flex items-center rounded-xl bg-[rgba(13,74,53,0.08)] px-2.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] sm:text-[10px]">
          +{extra} more
        </li>
      ) : null}
    </ul>
  );
}

function StatCell({ label, value, muted }) {
  return (
    <div
      className={`rounded-xl border px-2.5 py-2 text-center ${
        muted
          ? "border-[rgba(28,27,24,0.06)] bg-[rgba(28,27,24,0.03)]"
          : "border-[rgba(13,74,53,0.12)] bg-[rgba(255,255,255,0.75)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
      }`}
    >
      <div className="font-mono-nums text-[0.85rem] font-bold tracking-tight text-[var(--text)]">{value}</div>
      <div className="mt-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] sm:text-[10px] sm:tracking-[0.14em]">{label}</div>
    </div>
  );
}

export default function Students() {
  const { students, loading: ls } = useStudents();
  const { classes, loading: lc } = useClasses();
  const { payments, loading: lp } = usePayments();
  const { slots: slotRows, loading: lslots } = useSlots();
  const loading = ls || lc || lp || lslots;

  const slotsByStudent = useMemo(() => {
    const m = new Map();
    for (const row of slotRows) {
      if (row.studentId && !row.__legacy) {
        const list = m.get(row.studentId) || [];
        list.push(row);
        m.set(row.studentId, list);
      }
    }
    return m;
  }, [slotRows]);

  const sorted = sortStudentsByUnpaid(students, classes, payments);
  const ready = sorted.filter((s) => unpaidClasses(s.id, classes, payments) >= studentPaymentBundleSize(s));

  return (
    <div className="tt-page">
      <PageHero
        eyebrow="People"
        title="Students"
        subtitle="Progress, timetable chips, estimated dues — open a learner for full logs and edits."
      />

      {!loading && ready.length > 0 ? (
        <div className="mt-8 flex flex-col gap-4">
          {ready.map((s) => {
            const unpaid = unpaidClasses(s.id, classes, payments);
            const bs = studentPaymentBundleSize(s);
            const payCnt = nextPaymentClassCount(s.id, classes, payments, bs);
            const color =
              AVATAR_COLORS[studentAvatarIndex(s, students) % AVATAR_COLORS.length];
            return (
              <div
                key={`banner-${s.id}`}
                className="relative overflow-hidden rounded-2xl border border-[rgba(26,122,92,0.35)] bg-gradient-to-br from-[rgba(232,242,235,0.98)] via-white/90 to-[rgba(220,252,231,0.85)] px-5 py-4 shadow-[0_16px_40px_-28px_rgba(13,74,53,0.45)] ring-1 ring-[rgba(13,74,53,0.08)]"
              >
                <div aria-hidden className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-[rgba(26,122,92,0.12)] blur-2xl" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)] md:text-[0.6875rem] md:tracking-[0.16em]">Collect next bundle</p>
                    <p className="mt-2 font-display text-base font-semibold tracking-tight text-[var(--text)]">{s.name}</p>
                    <p className="mt-1 font-mono-nums text-sm text-[var(--muted)]">
                      {payCnt} unit{payCnt === 1 ? "" : "s"} × {formatRs(s.pricePerClass)} ={" "}
                      <span className="font-semibold text-[var(--accent)]">{formatRs(payCnt * s.pricePerClass)}</span>
                      {unpaid > payCnt ? ` · ${unpaid} unpaid total` : ""}
                    </p>
                  </div>
                  <Link
                    to={`/students/${s.id}`}
                    className="tt-btn-accent inline-flex shrink-0 min-h-[2.875rem] items-center justify-center px-8 text-[0.9375rem] font-semibold no-underline shadow-md"
                  >
                    Open profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-pulse min-h-[296px] rounded-3xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-inner" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="tt-card-solid mt-10 border border-dashed border-[rgba(13,74,53,0.22)] px-8 py-14 text-center">
          <p className="text-sm text-[var(--muted)]">
            No students yet —{" "}
            <Link className="font-semibold text-[var(--accent)] underline underline-offset-2" to="/add-student">
              add one
            </Link>{" "}
            to appear here.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((s) => {
            const unpaid = unpaidClasses(s.id, classes, payments);
            const bs = studentPaymentBundleSize(s);
            const bundlePos = unpaidInCurrentBundle(unpaid, bs);
            const payNext = nextPaymentClassCount(s.id, classes, payments, bs);
            const earnedHint = unpaid > 0 ? formatRs(unpaid * s.pricePerClass) : formatRs(0);
            const total = classes.filter((c) => c.studentId === s.id).length;
            const unitsLogged = totalBillableUnitsForStudent(s.id, classes);
            const color = AVATAR_COLORS[studentAvatarIndex(s, students) % AVATAR_COLORS.length];
            const pct = bs > 0 ? Math.min(100, (bundlePos / bs) * 100) : 0;
            const mySlots = slotsByStudent.get(s.id) ?? EMPTY_STUDENT_SLOTS;
            const urgent = unpaid >= bs;

            return (
              <Link
                key={s.id}
                to={`/students/${s.id}`}
                className={`group relative isolate flex flex-col overflow-hidden rounded-3xl border text-left shadow-[0_28px_64px_-40px_rgba(13,74,53,0.35)] outline-none ring-1 transition-[transform,box-shadow,border-color] duration-300 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
                  urgent
                    ? "border-[rgba(26,122,92,0.45)] bg-gradient-to-br from-white via-[rgba(236,253,245,0.65)] to-white ring-[rgba(26,122,92,0.12)] hover:-translate-y-0.5 hover:shadow-[0_36px_72px_-40px_rgba(13,74,53,0.42)] cursor-pointer hover:border-[rgba(26,122,92,0.55)] hover:ring-emerald-500/26"
                    : "border-white/65 bg-[linear-gradient(160deg,rgba(255,255,255,0.98)_0%,rgba(249,246,239,0.92)_52%,rgba(255,255,255,0.88)_100%)] ring-black/[0.04] backdrop-blur-xl hover:-translate-y-1 hover:border-white/85 hover:shadow-[0_32px_64px_-36px_rgba(13,74,53,0.35)] hover:ring-black/[0.05] cursor-pointer"
                }`}
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 z-0 h-1 rounded-t-3xl bg-gradient-to-r opacity-95 shadow-[inset_0_-1px_0_rgba(255,255,255,0.35)] transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${color.fg}, var(--violet))`,
                  }}
                />
                <div className="pointer-events-none absolute -right-20 -top-24 h-44 w-44 rounded-full bg-gradient-to-br from-[rgba(99,102,241,0.12)] via-transparent to-[rgba(26,122,92,0.08)] blur-3xl opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="relative z-[1] flex flex-1 flex-col p-5 sm:p-[1.35rem]">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="flex h-[3.625rem] w-[3.625rem] shrink-0 items-center justify-center rounded-2xl text-[0.95rem] font-bold shadow-[inset_0_3px_8px_rgba(255,255,255,0.35),0_14px_24px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.05]"
                      style={{
                        background: `linear-gradient(145deg, ${color.bg}, white)`,
                        color: color.fg,
                      }}
                    >
                      {initials(s.name)}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="font-display text-lg font-bold leading-tight tracking-tight text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
                          {s.name}
                        </h2>
                        {urgent ? (
                          <span className="shrink-0 rounded-full bg-gradient-to-r from-[var(--accent-bright)] to-[var(--accent)] px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-[0.13em] text-white shadow-[0_4px_12px_-4px_var(--accent-glow)] sm:text-[10px] sm:tracking-[0.14em]">
                            Collect
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full border border-[rgba(28,27,24,0.08)] bg-white/85 px-2 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] sm:text-[10px]">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex max-w-full rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject)}`}>
                          {SUBJECT_LABELS[s.subject] || s.subject}
                        </span>
                        {s.phone ? (
                          <span className="max-w-[9rem] truncate font-mono-nums text-[11px] font-medium text-[var(--muted)]" title={s.phone}>
                            {s.phone}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium italic text-[var(--muted)]/85">Phone not set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <StatCell label="This block" value={`${bundlePos}/${bs}`} />
                    <StatCell label="Sessions / units" value={`${total} / ${unitsLogged}`} muted={total === 0} />
                    <StatCell label="≈ unpaid (Rs)" value={earnedHint} muted={unpaid === 0} />
                  </div>

                  <div className="relative mt-5 rounded-2xl border border-[rgba(28,27,24,0.07)] bg-[rgba(255,255,255,0.55)] px-3.5 py-3 shadow-inner">
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(13,74,53,0.08)] text-[var(--accent)]" aria-hidden>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <rect x="4" y="5" width="16" height="15" rx="2" />
                          <path d="M8 3v4M16 3v4M4 11h16" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] sm:text-[10px] sm:tracking-[0.16em]">Weekly timetable</span>
                    </div>
                    <SlotsPreview slots={mySlots} />
                  </div>

                  <div className="mt-5 flex items-end gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] sm:text-[10px]">
                        <span>Bundle progress</span>
                        {unpaid > 0 ? (
                          <span className="font-mono-nums normal-case text-[var(--text)]">
                            Next up to {payNext} · {formatRs(payNext * s.pricePerClass)}
                          </span>
                        ) : (
                          <span className="font-mono-nums normal-case text-[var(--muted)]">All paid up</span>
                        )}
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgba(28,27,24,0.08)] shadow-inner">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${color.fg}, var(--accent-bright))`,
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(28,27,24,0.08)] bg-white/90 text-[var(--accent)] shadow-sm transition group-hover:border-[rgba(13,74,53,0.2)] group-hover:bg-[rgba(13,74,53,0.06)]"
                      aria-hidden
                    >
                      <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
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
