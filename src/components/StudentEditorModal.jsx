import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SUBJECT_OPTIONS } from "../utils/helpers";

export default function StudentEditorModal({ open, onClose, student, saving, onSubmit }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("chem");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!open || !student) return;
    setName(student.name || "");
    setSubject(student.subject || "chem");
    setPrice(student.pricePerClass != null ? String(student.pricePerClass) : "");
    setPhone(student.phone || "");
  }, [open, student]);

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!student) return;
    onSubmit?.({
      name: name.trim(),
      subject,
      pricePerClass: price,
      phone: phone.trim(),
    });
  }

  if (!open || !student) return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[298] flex items-end justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:items-center md:p-8"
      onMouseDown={handleBackdrop}
    >
      <div
        className="absolute inset-0 z-0 animate-[fadeIn_0.2s_ease-out] bg-[rgba(10,22,28,0.48)] backdrop-blur-[4px]"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-edit-title"
        className="relative z-10 max-h-[min(90dvh,calc(100%-2rem))] w-full max-w-md overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.55)] bg-[rgba(253,251,246,0.98)] px-5 py-6 shadow-xl ring-2 ring-black/[0.04] backdrop-blur-xl sm:px-7"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="student-edit-title" className="font-display text-lg font-bold text-[var(--text)]">
          Edit student
        </h2>
        <p className="mt-1 font-mono-nums text-xs text-[var(--muted)]">Updates name on class history, payments & timetable.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Student name *
            <input required value={name} onChange={(e) => setName(e.target.value)} className="tt-input mt-2" />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Subject
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="tt-input mt-2 cursor-pointer">
              {SUBJECT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Price per class (Rs.) *
            <input
              required
              type="number"
              min="1"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="tt-input mt-2 font-mono-nums"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Phone (optional)
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="tt-input mt-2" />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse sm:justify-end">
            <button type="submit" disabled={saving} className="tt-btn-accent min-h-[3rem] w-full px-6 sm:w-auto">
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" className="tt-btn-ghost min-h-[3rem] w-full sm:w-auto" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
