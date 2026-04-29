import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

const DialogContext = createContext(null);

function normalizeAlert(input) {
  if (typeof input === "string") {
    return { title: "", message: input };
  }
  return { title: input?.title ?? "", message: input?.message ?? "" };
}

function normalizeConfirm(input) {
  if (typeof input === "string") {
    return {
      title: "",
      message: input,
      confirmLabel: "Continue",
      cancelLabel: "Cancel",
    };
  }
  return {
    title: input?.title ?? "",
    message: input?.message ?? "",
    confirmLabel: input?.confirmLabel ?? "Continue",
    cancelLabel: input?.cancelLabel ?? "Cancel",
  };
}

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const dismissAlert = useCallback(() => {
    setDialog((prev) => {
      if (prev?.variant === "alert" && prev.resolve) prev.resolve();
      return null;
    });
  }, []);

  const dismissConfirm = useCallback((value) => {
    setDialog((prev) => {
      if (prev?.variant === "confirm" && prev.resolve) prev.resolve(value);
      return null;
    });
  }, []);

  const showAlert = useCallback((input) => {
    const o = normalizeAlert(input);
    return new Promise((resolve) => {
      setDialog({ variant: "alert", ...o, resolve });
    });
  }, []);

  const showConfirm = useCallback((input) => {
    const o = normalizeConfirm(input);
    return new Promise((resolve) => {
      setDialog({ variant: "confirm", ...o, resolve });
    });
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;
    function onKey(e) {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (dialog.variant === "confirm") dismissConfirm(false);
      else dismissAlert();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, dismissAlert, dismissConfirm]);

  const overlay =
    dialog &&
    createPortal(
      <div className="fixed inset-0 z-[300] flex items-end justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:items-center md:p-8 md:pb-8 md:pt-8">
        <button
          type="button"
          className="absolute inset-0 z-0 animate-[fadeIn_0.2s_ease-out] bg-[rgba(10,22,28,0.48)] backdrop-blur-[4px]"
          aria-label={dialog.variant === "confirm" ? "Cancel" : "Close"}
          onClick={() =>
            dialog.variant === "confirm" ? dismissConfirm(false) : dismissAlert()
          }
        />
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={dialog.title ? "tt-dlg-heading" : "tt-dlg-msg"}
          aria-describedby="tt-dlg-msg"
          className="tt-modal relative z-10 max-h-[min(88dvh,100%)] w-full max-w-md animate-[ttModalIn_0.26s_cubic-bezier(0.22,1,0.36,1)] overflow-y-auto overscroll-contain rounded-2xl border border-[rgba(255,255,255,0.55)] bg-[rgba(253,251,246,0.97)] px-5 py-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35)] ring-2 ring-black/[0.04] backdrop-blur-xl sm:px-6 sm:py-7"
          onClick={(e) => e.stopPropagation()}
        >
          {dialog.title ? (
            <h2
              id="tt-dlg-heading"
              className="font-display text-[1.15rem] font-bold leading-snug tracking-tight text-[var(--text)]"
            >
              {dialog.title}
            </h2>
          ) : null}
          <p
            id="tt-dlg-msg"
            className={`text-sm leading-relaxed ${dialog.title ? "mt-3 text-[var(--muted)]" : "font-medium text-[var(--text)]"}`}
          >
            {dialog.message}
          </p>
          {dialog.variant === "alert" ? (
            <button
              type="button"
              className="tt-btn-accent mt-7 w-full min-h-[3rem] px-8"
              autoFocus
              onClick={dismissAlert}
            >
              OK
            </button>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="tt-btn-ghost min-h-[3rem] w-full px-5 text-[0.9375rem]"
                onClick={() => dismissConfirm(false)}
              >
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                className="tt-btn-accent min-h-[3rem] w-full px-5 text-[0.9375rem] shadow-emerald-950/25"
                autoFocus
                onClick={() => dismissConfirm(true)}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body,
    );

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {overlay}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}
