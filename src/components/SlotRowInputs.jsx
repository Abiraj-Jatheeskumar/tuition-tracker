import { DAYS, DURATION_OPTIONS, dayLabelToDayIndex } from "../utils/helpers";

/** One pending line when adding / editing timetable rows (student subcollection slots). */
export function createPendingSlotLine() {
  return {
    key: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    day: "Monday",
    time24: "",
    duration: "1hr",
    venue: "",
  };
}

/**
 * Touch-friendly selects + native time picker. `row`: { day, time24?, duration, venue }
 */
export function SlotRowInputs({ row, onChange, onRemove, showRemove }) {
  const patch = (k, v) => onChange({ ...row, [k]: v });

  const selectCls = "tt-input tt-select-touch cursor-pointer py-3 min-h-[3rem]";
  const timeCls = "tt-input tt-time-touch cursor-pointer py-3 min-h-[3rem] font-mono-nums tabular-nums";

  const dayId = `slot-day-${row.key || row.id || "x"}`;
  const timeId = `slot-time-${row.key || row.id || "x"}`;

  return (
    <div className="grid gap-4 rounded-2xl border border-[rgba(28,27,24,0.06)] bg-[rgba(255,255,255,0.72)] px-4 py-4 sm:grid-cols-12 sm:gap-4 sm:gap-y-4">
      <label className="flex flex-col sm:col-span-4 lg:col-span-3" htmlFor={dayId}>
        <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Day</span>
        <select
          id={dayId}
          value={row.day || "Monday"}
          onChange={(e) => patch("day", e.target.value)}
          className={selectCls}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col sm:col-span-4 lg:col-span-3" htmlFor={timeId}>
        <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Time</span>
        <input
          id={timeId}
          type="time"
          step={900}
          value={row.time24 ?? ""}
          onChange={(e) => patch("time24", e.target.value)}
          className={timeCls}
        />
      </label>
      <label className="flex flex-col sm:col-span-4 lg:col-span-3">
        <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Duration</span>
        <select value={row.duration || "1hr"} onChange={(e) => patch("duration", e.target.value)} className={selectCls}>
          {DURATION_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col sm:col-span-12 lg:col-span-2">
        <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Place (optional)</span>
        <input
          value={row.venue || ""}
          onChange={(e) => patch("venue", e.target.value)}
          placeholder="Home · Hall"
          className="tt-input py-3 min-h-[3rem]"
        />
      </label>
      {showRemove ? (
        <div className="flex items-end justify-end sm:col-span-12 lg:col-span-1">
          <button
            type="button"
            onClick={onRemove}
            className="tt-btn-ghost min-h-12 min-w-[4.75rem] text-[var(--red)] hover:border-[rgba(197,48,48,0.35)] hover:bg-[var(--red-light)] hover:text-[var(--red)]"
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function slotFirestorePayload(row, extras) {
  const day = row.day || "Monday";
  return {
    day,
    dayIndex: dayLabelToDayIndex(day),
    time24: row.time24 || "",
    duration: row.duration || "1hr",
    venue: String(row.venue || "").trim(),
    ...extras,
  };
}
