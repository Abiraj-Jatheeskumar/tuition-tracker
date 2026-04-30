import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useDialog } from "../context/DialogContext";
import { useToast } from "../context/ToastContext";
import { useStudents } from "../hooks/useStudents";
import { usePayments } from "../hooks/usePayments";
import PageHero from "./PageHero";
import {
  AVATAR_COLORS,
  formatRs,
  initials,
  studentAvatarIndex,
  subjectBadgeClasses,
  SUBJECT_LABELS,
  totalClassesPaidAll,
  totalIncomeAll,
  todayYYYYMMDD,
  uniquePaymentMonths,
} from "../utils/helpers";

function PaymentEditorPortal({ payment, uid, onClose, onSaved, showAlert }) {
  const [classCount, setClassCount] = useState(String(payment.classCount ?? ""));
  const [pricePerClass, setPricePerClass] = useState(String(payment.pricePerClass ?? ""));
  const [date, setDate] = useState(payment.date || todayYYYYMMDD());
  const [busy, setBusy] = useState(false);

  const computed = useMemo(() => {
    const ccRaw = Number.parseFloat(String(classCount).trim().replace(",", "."));
    const pp = Number(pricePerClass);
    if (!Number.isFinite(ccRaw) || !Number.isFinite(pp) || ccRaw < 0.25 || pp <= 0) return null;
    const cc = Math.round(ccRaw * 4) / 4;
    if (cc < 0.25) return null;
    return { total: cc * pp, units: cc };
  }, [classCount, pricePerClass]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (computed === null) {
      await showAlert({
        title: "Check values",
        message: "Use billing units (min 0.25, steps of 0.25) and a positive Rs. per unit.",
      });
      return;
    }
    setBusy(true);
    try {
      await updateDoc(doc(db, "users", uid, "payments", payment.id), {
        classCount: computed.units,
        pricePerClass: Number(pricePerClass),
        totalAmount: computed.total,
        date,
      });
      onSaved();
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "Could not save",
        message: err?.message || "Update failed.",
      });
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[298] flex items-end justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:items-center md:p-8">
      <button
        type="button"
        className="absolute inset-0 z-0 animate-[fadeIn_0.2s_ease-out] bg-[rgba(10,22,28,0.48)] backdrop-blur-[4px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="income-edit-title"
        className="relative z-10 max-h-[min(90dvh,calc(100%-2rem))] w-full max-w-md overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.55)] bg-[rgba(253,251,246,0.98)] px-5 py-6 shadow-xl ring-2 ring-black/[0.04] backdrop-blur-xl sm:px-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="income-edit-title" className="font-display text-lg font-bold text-[var(--text)]">
          Edit payment
        </h2>
        <p className="mt-1 font-mono-nums text-xs text-[var(--muted)]">{payment.studentName}</p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Date received
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="tt-input mt-1 font-mono-nums" />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Billing units in this payment
            <input
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              value={classCount}
              onChange={(e) => setClassCount(e.target.value)}
              className="tt-input mt-1 font-mono-nums"
            />
            <span className="mt-1 block text-[11px] text-[var(--muted)]">Must match how many oldest unpaid units this receipt clears.</span>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Rs. per unit
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="any"
              value={pricePerClass}
              onChange={(e) => setPricePerClass(e.target.value)}
              className="tt-input mt-1 font-mono-nums"
            />
          </label>
          <div className="rounded-xl border border-[rgba(26,122,92,0.2)] bg-[rgba(232,242,235,0.5)] px-3 py-2 text-sm text-[var(--accent)]">
            Total:&nbsp;<span className="font-mono-nums font-semibold">{computed !== null ? formatRs(computed.total) : "—"}</span>
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse sm:justify-end">
            <button type="submit" disabled={busy} className="tt-btn-accent min-h-[3rem] w-full px-6 sm:w-auto">
              Save changes
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

export default function Income() {
  const { user } = useAuth();
  const { showConfirm, showAlert } = useDialog();
  const { showToast } = useToast();
  const { students, loading: ls } = useStudents();
  const { payments, loading: lp } = usePayments();
  const loading = ls || lp;
  const months = useMemo(() => uniquePaymentMonths(payments), [payments]);
  const [month, setMonth] = useState("all");
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    if (month === "all") return payments;
    return payments.filter((p) => String(p.date || "").startsWith(month));
  }, [payments, month]);

  const totalCollected = useMemo(() => totalIncomeAll(filtered), [filtered]);
  const classesPaid = useMemo(() => totalClassesPaidAll(filtered), [filtered]);
  const paymentCount = filtered.length;

  async function handleDeletePayment(p) {
    if (!user) return;
    const ok = await showConfirm({
      title: "Delete this payment?",
      message: `Remove ${formatRs(p.totalAmount)} from ${p.studentName}? Unpaid / paid tags on class history will recalculate for that student — sessions are not deleted.`,
      confirmLabel: "Delete",
      cancelLabel: "Keep",
    });
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "payments", p.id));
      showToast("Payment removed — balances updated.");
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "Could not delete",
        message: err?.message || "Delete failed.",
      });
    }
  }

  return (
    <div className="tt-page">
      <PageHero
        eyebrow="Finance"
        title="Income"
        subtitle="Every payment captured from your tutoring — filter by month, edit details, or remove to recalc unpaid."
        hint={
          <>
            Payments only change how billable units are counted (paid vs unpaid). They never delete session logs. Edit or delete here if you tapped &ldquo;Got payment&rdquo; by mistake.
          </>
        }
      />

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-pulse h-[96px] rounded-2xl border border-[rgba(28,27,24,0.06)] bg-white/50 shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="tt-stat">
            <div className="relative z-[1] text-sm font-medium text-[var(--muted)] md:text-xs">Total payments collected</div>
            <div className="relative z-[1] mt-1 font-mono-nums text-3xl font-bold tracking-tighter text-[var(--text)]">{paymentCount}</div>
          </div>
          <div className="tt-stat">
            <div className="relative z-[1] text-sm font-medium text-[var(--muted)] md:text-xs">Total units paid</div>
            <div className="relative z-[1] mt-1 font-mono-nums text-3xl font-bold tracking-tighter text-[var(--text)]">{classesPaid}</div>
          </div>
          <div className="tt-stat">
            <div className="relative z-[1] text-sm font-medium text-[var(--muted)] md:text-xs">Total income (Rs.)</div>
            <div className="relative z-[1] mt-1 font-mono-nums text-3xl font-bold tracking-tighter text-[var(--text)]">
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
            className="tt-input tt-select-touch mt-2 min-h-12 w-full min-w-0 sm:mt-0 sm:ml-0 sm:min-h-11 sm:min-w-[12rem]"
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
              <li key={p.id} className="tt-card-solid tt-card-hover rounded-2xl border px-4 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="flex min-w-0 gap-4">
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
                        {p.classCount} units × {formatRs(p.pricePerClass)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-[rgba(28,27,24,0.06)] pt-3 sm:flex-1 sm:max-w-xs sm:flex-none sm:items-end sm:border-0 sm:pt-0">
                    <div className="text-right font-mono-nums text-xl font-bold tracking-tighter text-[var(--accent)] sm:text-2xl">
                      {formatRs(p.totalAmount)}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" className="tt-btn-ghost min-h-11 px-6 text-[0.8125rem]" onClick={() => setEditing(p)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="tt-btn-ghost min-h-11 px-6 text-[0.8125rem] text-[var(--red)] hover:border-[rgba(197,48,48,0.35)] hover:bg-[var(--red-light)]"
                        onClick={() => handleDeletePayment(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && user ? (
        <PaymentEditorPortal
          payment={editing}
          uid={user.uid}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            showToast("Payment updated.");
          }}
          showAlert={showAlert}
        />
      ) : null}
    </div>
  );
}
