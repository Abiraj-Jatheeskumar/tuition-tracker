import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useDialog } from "../context/DialogContext";

export default function Login() {
  const [busy, setBusy] = useState(false);
  const { showAlert } = useDialog();

  async function handleSignIn() {
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
      await showAlert({
        title: "Sign-in didn't work",
        message: e?.message || "Sign-in failed",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] min-h-0 w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-[var(--bg)] py-6 ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))] pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-[10%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.35)_0%,transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-[5%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(26,122,92,0.35)_0%,transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_70%)] blur-xl"
      />

      <div className="tt-card relative w-full max-w-md overflow-hidden p-px">
        <div className="relative rounded-[calc(1rem-1px)] bg-gradient-to-br from-white/95 to-white/80 px-8 py-10 backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-bright)] to-[#4338ca] shadow-lg shadow-indigo-500/25">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" opacity="0.35" />
            </svg>
          </div>
          <h1 className="text-center font-display text-3xl font-bold tracking-tight text-[var(--text)]">
            Tuition Tracker
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-relaxed text-[var(--muted)]">
            Class &amp; payment manager built for tutors — crisp, calm,{" "}
            <span className="font-semibold text-[var(--accent-bright)]">always in sync.</span>
          </p>

          <button
            type="button"
            onClick={handleSignIn}
            disabled={busy}
            className="tt-btn-dark mt-9 flex min-h-[3rem] w-full items-center justify-center gap-3 rounded-xl px-4 py-3"
          >
            <svg className="h-[22px] w-[22px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {busy ? "Opening Google…" : "Sign in with Google"}
          </button>
          <p className="mt-6 text-center text-[11px] text-[var(--muted)] opacity-90">
            Only your tutoring account signs in — data stays under your Firebase user folder.
          </p>
        </div>
      </div>
    </div>
  );
}
