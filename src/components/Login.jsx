import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useDialog } from "../context/DialogContext";

const features = [
  {
    title: "Bundles & classes",
    copy: "Billable units per session and per-student payment blocks.",
    icon: (
      <path d="M8 3v4m8-4v4M5 9h14M5 9a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2M5 9V7a2 2 0 012-2h10a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Income",
    copy: "Track what you earned and what’s still owed.",
    icon: (
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Timetable",
    copy: "Weekly slots so schedules stay clear.",
    icon: (
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

function GoogleGlyph() {
  return (
    <svg className="h-[22px] w-[22px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FeatureRow({ f }) {
  return (
    <li className="flex gap-3 rounded-xl border border-[rgba(28,27,24,0.07)] bg-[rgba(255,255,255,0.82)] px-3.5 py-3 shadow-[0_8px_24px_-18px_rgba(13,74,53,0.14)] backdrop-blur-sm sm:gap-4 sm:px-4 sm:py-3.5 lg:rounded-2xl lg:p-4 lg:transition-[transform,box-shadow] lg:duration-200 lg:hover:-translate-y-0.5 lg:hover:shadow-[0_14px_32px_-20px_rgba(13,74,53,0.18)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(13,74,53,0.12)] bg-[rgba(232,248,239,0.65)] text-[var(--accent)] shadow-sm sm:h-11 sm:w-11 lg:h-12 lg:w-12">
        <svg className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
          {f.icon}
        </svg>
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-display text-[0.8125rem] font-bold leading-snug text-[var(--text)] sm:text-sm">{f.title}</p>
        <p className="mt-1 text-[0.6875rem] leading-snug text-[var(--muted)] sm:text-xs">{f.copy}</p>
      </div>
    </li>
  );
}

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
    <div className="relative w-full pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(168deg,var(--bg)_0%,#ebe6dc_52%,var(--bg-deep)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: "radial-gradient(rgba(12,65,47,0.07) 1px,transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-[6%] tt-login-orb-drift h-[min(72vw,20rem)] w-[min(72vw,20rem)] max-w-none rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,transparent_68%)] blur-3xl sm:h-80 sm:w-80 lg:left-[-5rem]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-36 bottom-[0%] tt-login-orb-drift h-[min(85vw,22rem)] w-[min(85vw,22rem)] rounded-full bg-[radial-gradient(circle,rgba(22,129,93,0.18)_0%,transparent_65%)] blur-3xl sm:h-96 sm:w-96 lg:right-[-5rem]"
        style={{ animationDelay: "-9s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-52 w-52 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(8,145,178,0.1)_0%,transparent_70%)] blur-2xl sm:h-72 sm:w-72"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-6 py-5 sm:max-w-xl sm:gap-8 sm:py-8 lg:max-w-6xl lg:flex-row lg:items-start lg:justify-between lg:gap-x-12 lg:gap-y-8 lg:py-10 xl:gap-x-16">
        <section className="hidden max-w-xl shrink-0 flex-col text-left lg:flex lg:max-w-[26rem] xl:max-w-md">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[rgba(13,74,53,0.14)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent-bright)] shadow-[0_0_10px_rgba(22,129,93,0.45)]" />
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Private tutoring workspace</span>
          </div>
          <h1 className="mt-6 font-display text-[clamp(1.75rem,2.8vw+0.95rem,2.625rem)] font-extrabold leading-[1.1] tracking-tight text-[var(--text)]">
            Run your practice from{" "}
            <span className="bg-gradient-to-r from-[var(--accent-bright)] via-[var(--accent)] to-[var(--violet)] bg-clip-text text-transparent">one calm hub.</span>
          </h1>
          <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-[var(--muted)]">
            Log sessions, bundle payments, and weekly timetables — built for tutors who want clarity without spreadsheets.
          </p>
          <ul className="mt-10 flex flex-col gap-3">
            {features.map((f) => (
              <FeatureRow key={f.title} f={f} />
            ))}
          </ul>
        </section>

        <div className="flex w-full flex-1 flex-col lg:w-auto lg:max-w-[min(100%,26rem)] lg:flex-none xl:max-w-[28rem]">
          <header className="mb-5 flex flex-col items-center text-center lg:hidden">
            <div className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-bright)] via-[#1b6b50] to-[#4338ca] font-display text-[0.95rem] font-bold text-white shadow-[0_14px_32px_-10px_rgba(13,74,53,0.45)] ring-2 ring-white/70 sm:h-14 sm:w-14 sm:text-base">
              TT
            </div>
            <p className="mt-3 font-display text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-bright)] sm:tracking-[0.2em]">Tuition Tracker</p>
            <h1 className="mt-2 font-display text-[1.375rem] font-extrabold leading-tight tracking-tight text-[var(--text)] sm:text-2xl">Sign in to continue</h1>
            <p className="mx-auto mt-2 max-w-[20rem] text-sm leading-relaxed text-[var(--muted)]">
              Students, bundles, and schedule stay in sync with your Google account.
            </p>
          </header>

          <ul className="mb-5 grid grid-cols-1 gap-2 sm:gap-2.5 lg:hidden">
            {features.map((f) => (
              <FeatureRow key={f.title} f={f} />
            ))}
          </ul>

          <div className="tt-login-card-animate tt-login-card-frame w-full lg:mx-0 lg:shadow-none" style={{ animationDelay: "0.04s" }}>
            <div className="tt-login-card-inner relative overflow-hidden px-5 py-7 sm:px-7 sm:py-9">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(22,129,93,0.1)_0%,transparent_72%)] sm:h-48 sm:w-48"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-8 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(91,97,232,0.08)_0%,transparent_70%)] sm:-left-10"
              />

              <div className="relative">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-bright)] via-[#1b6b50] to-[#4338ca] shadow-[0_14px_28px_-8px_rgba(13,74,53,0.4)] ring-2 ring-white/65 sm:h-[4rem] sm:w-[4rem]">
                  <svg className="h-7 w-7 text-white sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" aria-hidden>
                    <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="10" opacity="0.35" />
                  </svg>
                </div>
                <h2 className="mt-5 text-center font-display text-xl font-bold tracking-tight text-[var(--text)] sm:mt-6 sm:text-[1.65rem]">Welcome back</h2>
                <p className="mx-auto mt-2.5 max-w-[19rem] text-center text-[0.8125rem] leading-relaxed text-[var(--muted)] sm:mt-3 sm:text-sm">
                  One tap with Google. Your data stays under{" "}
                  <span className="font-semibold text-[var(--accent)]">your Firebase account only.</span>
                </p>

                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={busy}
                  className="tt-login-google-btn relative z-[1] mt-7 flex min-h-[3rem] w-full touch-manipulation items-center justify-center gap-3 px-4 text-[0.9375rem] font-semibold text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bright)] focus-visible:ring-offset-2 sm:mt-8 sm:min-h-[3.25rem]"
                >
                  <GoogleGlyph />
                  {busy ? "Opening Google…" : "Continue with Google"}
                </button>
                <p className="relative z-[1] mt-2.5 text-center text-xs leading-snug text-[var(--muted)] md:text-[11px]">
                  A small sign-in window may open — allow pop-ups if your browser blocks it.
                </p>

                <details className="group relative z-[1] mt-5 rounded-xl border border-[rgba(13,74,53,0.12)] bg-[rgba(232,242,235,0.45)] text-left">
                  <summary className="cursor-pointer list-none px-3.5 py-3 font-display text-xs font-semibold text-[var(--accent)] marker:content-none [&::-webkit-details-marker]:hidden sm:py-3.5">
                    <span className="flex min-h-[44px] items-center justify-between gap-2 py-0.5 [-webkit-tap-highlight-color:transparent] sm:min-h-0">
                      Trouble signing in?
                      <svg className="h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>
                  <div className="border-t border-[rgba(13,74,53,0.09)] px-3.5 pb-3.5 pt-2 text-xs leading-relaxed text-[var(--muted)] md:text-[11px]">
                    If you see <span className="font-medium text-[var(--text)]">disallowed_useragent</span>, open this site in{" "}
                    <span className="font-medium text-[var(--text)]">Chrome or Safari</span> — not Instagram, Messenger, or in-app browsers. From a link, use &ldquo;Open in browser&rdquo;.
                  </div>
                </details>

                <p className="relative z-[1] mt-5 border-t border-[rgba(13,74,53,0.08)] pt-4 text-center text-[11px] leading-relaxed text-[var(--muted)] sm:mt-6 sm:pt-5 sm:text-xs">
                  <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 px-1">
                    <svg className="h-3.5 w-3.5 shrink-0 text-[var(--accent-bright)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Secured with Firebase Auth · workspace data under your user ID in Firestore
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
