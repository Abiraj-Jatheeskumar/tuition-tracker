import { useEffect, useRef } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const DISMISS_MS = 30000;

export default function PaymentUndoBar({
  uid,
  paymentId,
  summaryLine,
  onUndoComplete,
  onExpire,
}) {
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    const t = window.setTimeout(() => expireRef.current(), DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [paymentId]);

  async function handleUndo() {
    try {
      await deleteDoc(doc(db, "users", uid, "payments", paymentId));
      onUndoComplete?.();
    } catch (e) {
      console.error(e);
      onExpire();
    }
  }

  return (
    <div
      className="fixed left-4 right-4 z-[96] animate-[fadeIn_0.25s_ease-out]"
      style={{ bottom: "calc(5.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="tt-card-solid mx-auto flex max-w-lg flex-col gap-3 rounded-xl border-[rgba(26,122,92,0.35)] px-4 py-3 shadow-lg shadow-emerald-900/15 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold leading-snug text-[var(--text)]">{summaryLine}</p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="tt-btn-ghost min-h-11 px-5 text-[0.8125rem]"
            onClick={onExpire}
          >
            Dismiss
          </button>
          <button
            type="button"
            className="tt-btn-accent min-h-11 whitespace-nowrap px-5 py-2 text-[0.9375rem]"
            onClick={handleUndo}
          >
            Undo payment
          </button>
        </div>
      </div>
    </div>
  );
}
