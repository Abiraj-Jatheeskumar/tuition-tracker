import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useSlots } from "../hooks/useSlots";
import {
  DAYS,
  DURATION_OPTIONS,
  SUBJECT_LABELS,
  SUBJECT_OPTIONS,
  subjectBadgeClasses,
} from "../utils/helpers";

export default function Timetable() {
  const { user } = useAuth();
  const { slots, loading } = useSlots();
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("chem");
  const [duration, setDuration] = useState("1hr");
  const [venue, setVenue] = useState("");

  async function handleAdd(e) {
    e.preventDefault();
    if (!user || !time.trim()) return;
    const dayIndex = DAYS.indexOf(day);
    await addDoc(collection(db, "users", user.uid, "slots"), {
      day,
      dayIndex: dayIndex < 0 ? 0 : dayIndex,
      time: time.trim(),
      subject,
      duration,
      venue: venue.trim() || "",
      createdAt: serverTimestamp(),
    });
    setTime("");
    setVenue("");
  }

  async function handleDelete(id) {
    if (!user) return;
    if (!window.confirm("Remove this slot?")) return;
    await deleteDoc(doc(db, "users", user.uid, "slots", id));
  }

  return (
    <div className="p-4 pb-24 md:p-6 md:pb-6">
      <h1 className="text-xl font-semibold text-[var(--text)]">Timetable</h1>
      <p className="mt-0.5 text-sm text-[var(--muted)]">
        Weekly schedule reference — not tied to payments.
      </p>

      <form
        onSubmit={handleAdd}
        className="mt-6 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]"
      >
        <h2 className="text-sm font-semibold text-[var(--text)]">Add slot</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-xs font-medium text-[var(--muted)]">
            Day
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Time
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="4:00 PM"
              className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 font-mono-nums text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Subject
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            >
              {SUBJECT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Duration
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-[var(--muted)] sm:col-span-2 lg:col-span-1">
            Venue (optional)
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Home / Hall"
              className="mt-1 w-full min-h-11 rounded-[10px] border border-[var(--border)] bg-white px-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
        </div>
        <button
          type="submit"
          className="mt-4 min-h-11 rounded-[10px] bg-[var(--text)] px-6 text-sm font-semibold text-white"
        >
          Add Slot
        </button>
      </form>

      <h2 className="mt-8 text-sm font-semibold text-[var(--text)]">Your slots</h2>
      {loading ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="skeleton-pulse h-[120px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">No slots yet.</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((s) => (
            <div
              key={s.id}
              className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_1px_3px_rgba(28,27,24,0.04)]"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {s.day}
              </div>
              <div className="mt-1 font-mono-nums text-2xl font-semibold text-[var(--text)]">
                {s.time}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject)}`}
                >
                  {SUBJECT_LABELS[s.subject] || s.subject}
                </span>
                <span className="font-mono-nums text-xs text-[var(--muted)]">
                  {s.duration}
                </span>
              </div>
              {s.venue ? (
                <div className="mt-2 text-xs text-[var(--muted)]">{s.venue}</div>
              ) : null}
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="mt-3 min-h-10 w-full rounded-[10px] border border-[var(--border)] text-xs font-semibold text-[var(--red)] hover:bg-[var(--red-light)]"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
