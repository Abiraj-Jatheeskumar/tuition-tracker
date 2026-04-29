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
import { useDialog } from "../context/DialogContext";
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
  const { showConfirm } = useDialog();
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
    const confirmed = await showConfirm({
      title: "Remove this slot?",
      message: "The timetable entry will disappear from all devices.",
      confirmLabel: "Remove",
      cancelLabel: "Keep",
    });
    if (!confirmed) return;
    await deleteDoc(doc(db, "users", user.uid, "slots", id));
  }

  return (
    <div className="tt-page">
      <h1 className="tt-heading">Timetable</h1>
      <p className="tt-sub">Weekly schedule reference — not tied to payments.</p>

      <form onSubmit={handleAdd} className="tt-card mt-8 border px-5 py-5 shadow-lg shadow-emerald-900/5">
        <h2 className="font-display text-[0.9375rem] font-semibold text-[var(--text)]">Add slot</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Day
            <select value={day} onChange={(e) => setDay(e.target.value)} className="tt-input">
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Time
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="4:00 PM"
              className="tt-input font-mono-nums"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Subject
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="tt-input text-sm">
              {SUBJECT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Duration
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="tt-input">
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)] sm:col-span-2 lg:col-span-1">
            Venue (optional)
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Home / Hall"
              className="tt-input"
            />
          </label>
        </div>
        <button type="submit" className="tt-btn-dark mt-6 min-h-[3rem] px-8">
          Add Slot
        </button>
      </form>

      <h2 className="tt-section-title mt-10">Your slots</h2>
      {loading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton-pulse min-h-[130px] rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No slots yet.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((s) => (
            <div
              key={s.id}
              className="tt-card-solid tt-card-hover relative overflow-hidden border px-5 py-4 pt-6 before:absolute before:left-0 before:right-0 before:top-0 before:z-0 before:h-1 before:bg-gradient-to-r before:from-[var(--accent-bright)] before:to-[var(--violet)]"
            >
              <div className="relative z-[1] text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{s.day}</div>
              <div className="relative z-[1] mt-2 font-mono-nums text-3xl font-bold tracking-tight text-[var(--text)]">{s.time}</div>
              <div className="relative z-[1] mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subjectBadgeClasses(s.subject)}`}>
                  {SUBJECT_LABELS[s.subject] || s.subject}
                </span>
                <span className="font-mono-nums text-xs font-medium text-[var(--muted)]">{s.duration}</span>
              </div>
              {s.venue ? <div className="relative z-[1] mt-2 text-xs text-[var(--muted)]">{s.venue}</div> : null}
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="tt-btn-ghost relative z-[1] mt-5 w-full min-h-11 text-[var(--red)] hover:border-[rgba(197,48,48,0.35)] hover:bg-[var(--red-light)] hover:text-[var(--red)]"
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
