import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useDialog } from "../context/DialogContext";

const features = [
  {
    title: "Bundles & classes",
    copy: "Log sessions and track 10-class bundles with clear paid / unpaid status.",
    icon: (
      <path d="M8 3v4m8-4v4M5 9h14M5 9a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2M5 9V7a2 2 0 012-2h10a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Income at a glance",
    copy: "See what you earned and what is still owed, without spreadsheets.",
    icon: (
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Weekly timetable",
    copy: "Map each learner to weekly slots so nothing overlaps.",
    icon: (
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

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
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden overflow-y-auto bg-[var(--bg)] pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(165deg,var(--bg)_0%,#ebe6dc_52%,var(--bg-deep)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.65] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(rgba(12,65,47,0.09) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-[8%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.28)_0%,transparent_68%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-36 bottom-[2%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(22,129,93,0.32)_0%,transparent_68%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[40%] h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_70%)] blur-2xl"
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-1 flex-col items-center justify-center gap-12 py-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-16 lg:py-14">
        <section className="flex w-full max-w-xl flex-shrink-0 flex-col justify-center text-left max-lg:hidden">
          <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-bright)]">Private tutoring workspace</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--text)] lg:text-[2.75rem]">
            Classes, bundles,{" "}
            <span className="bg-gradient-to-r from-[var(--accent-bright)] via-[var(--accent)] to-[#4338ca] bg-clip-text text-transparent">and income —</span>{" "}
            organised.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--muted)]">
            One calm place to run your practice: log sessions, watch bundle progress, plan weekly slots, and stay on top of payments.
          </p>
          <ul className="mt-10 flex flex-col gap-5">
            {features.map((f) => (
              <li key={f.title} className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(13,74,53,0.12)] bg-white/80 text-[var(--accent)] shadow-sm ring-1 ring-[rgba(28,27,24,0.04)]">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                    {f.icon}
                  </svg>
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-[var(--text)]">{f.title}</p>
                  <p className="mt-1 text-sm leading-snug text-[var(--muted)]">{f.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex w-full flex-col items-center justify-center lg:w-auto lg:min-w-[min(100%,28rem)]">
          <div className="mb-6 w-full text-center lg:hidden">
            <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--accent-bright)]">Private tutoring workspace</p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-snug text-[var(--muted)]">
              Classes, bundles, payments, and timetables — one place that stays in sync with your Google account.
            </p>
          </div>

          <div className="tt-card relative w-full max-w-md overflow-hidden p-px shadow-[0_32px_80px_-48px_rgba(12,65,47,0.55)] ring-1 ring-[rgba(13,74,53,0.08)]">
            <div className="relative rounded-[calc(1rem-1px)] bg-gradient-to-br from-white/[0.97] via-white/90 to-[rgba(232,242,235,0.85)] px-8 py-10 backdrop-blur-xl sm:px-10 sm:py-11">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.125rem] bg-gradient-to-br from-[var(--accent-bright)] via-[#1b6b50] to-[#4338ca] shadow-[0_18px_40px_-14px_rgba(13,74,53,0.55)] ring-2 ring-white/60 lg:h-[4.25rem] lg:w-[4.25rem]">
                <svg className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
                  <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="10" opacity="0.35" />
                </svg>
              </div>
              <h2 className="text-center font-display text-3xl font-bold tracking-tight text-[var(--text)]">Welcome back</h2>
              <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-[var(--muted)]">
                Sign in once with Google — your tutoring data stays{" "}
                <span className="font-semibold text-[var(--accent)]">scoped to your account.</span>
              </p>

              <button
                type="button"
                onClick={handleSignIn}
                disabled={busy}
                className="tt-btn-dark mt-9 flex min-h-[3.125rem] w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-[0.9375rem] shadow-[0_8px_24px_-12px_rgba(12,52,41,0.45)] transition-[transform,box-shadow] hover:shadow-[0_12px_32px_-12px_rgba(12,52,41,0.5)] active:scale-[0.99]"
              >
                <svg className="h-[22px] w-[22px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {busy ? "Opening Google…" : "Continue with Google"}
              </button>
              <p className="mt-7 border-t border-[rgba(13,74,53,0.08)] pt-6 text-center text-[11px] leading-relaxed text-[var(--muted)]">
                Firebase Auth signs you in; app data lives under{" "}
                <span className="whitespace-nowrap font-medium text-[var(--text)] opacity-85">Firestore / your UID</span> only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
