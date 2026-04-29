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
          className="toast-animate fixed bottom-6 left-1/2 z-[100] max-w-[min(90vw,28rem)] -translate-x-1/2 rounded-full bg-[#1C1B18] px-5 py-3 text-center text-sm font-medium text-white shadow-lg"
          role="status"
        >
          {toast}
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
