import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const hideTimer = useRef(null);

  const showToast = useCallback((message) => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    setToast(message);
    hideTimer.current = window.setTimeout(() => {
      setToast(null);
      hideTimer.current = null;
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
      {toast ? (
        <div
          className="toast-animate fixed left-1/2 z-[110] max-w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-gradient-to-r from-[#1e3a2f] via-[#1a2e28] to-[#251d3d] px-5 py-3.5 text-center text-sm font-medium leading-snug text-[#faf9f5] shadow-[0_20px_48px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-sm [bottom:calc(5rem+env(safe-area-inset-bottom,0px))] md:bottom-10"
          role="status"
        >
          <span className="block leading-snug">{toast}</span>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
