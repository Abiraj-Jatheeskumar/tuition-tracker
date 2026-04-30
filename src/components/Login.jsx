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
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden overflow-y-auto bg-[#0f1f1a] pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))]">
      {/* Deep atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(22,129,93,0.35),transparent_55%),radial-gradient(ellipse_90%_70%_at_100%_50%,rgba(91,97,232,0.18),transparent_50%),linear-gradient(180deg,#0f1f1a_0%,#152a22_38%,#141c1a_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-[5%] tt-login-orb-drift h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(22,129,93,0.45)_0%,transparent_65%)] blur-3xl md:-left-28"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-44 bottom-[0%] tt-login-orb-drift h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(91,97,232,0.35)_0%,transparent_62%)] blur-[100px] md:-right-36"
        style={{ animationDelay: "-7s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[12%] top-[55%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(8,145,178,0.12)_0%,transparent_68%)] blur-2xl opacity-80"
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-1 flex-col items-center justify-center gap-10 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-12">
        {/* Desktop story column */}
        <section className="hidden w-full max-w-[26rem] shrink-0 flex-col justify-center text-left text-white/95 xl:max-w-xl lg:flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[var(--accent-bright)] shadow-[0_0_12px_rgba(22,129,93,0.85)]" />
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#9ed4be]">
              Private tutoring workspace
            </span>
          </div>
          <h1 className="mt-8 font-display text-[clamp(1.875rem,3.2vw+1rem,2.75rem)] font-extrabold leading-[1.08] tracking-tight">
            Run your practice
            <br />
            <span className="bg-gradient-to-r from-[#86efac] via-[#4ade80] to-[#a5b4fc] bg-clip-text text-transparent">from one calm hub.</span>
          </h1>
          <p className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-white/[0.72]">
            Log sessions, bundle payments, and weekly timetables — built for tutors who want clarity without spreadsheets.
          </p>
          <ul className="mt-12 flex flex-col gap-4">
            {features.map((f) => (
              <li
                key={f.title}
                className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-4 backdrop-blur-sm transition-[transform,background] duration-300 hover:border-white/[0.12] hover:bg-white/[0.08]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[rgba(22,129,93,0.2)] text-[#b6f0d2] shadow-inner">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
                    {f.icon}
                  </svg>
                </span>
                <div>
                  <p className="font-display text-[0.9375rem] font-bold text-white">{f.title}</p>
                  <p className="mt-1 text-sm leading-snug text-white/[0.65]">{f.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Mobile + auth column */}
        <div className="flex w-full max-w-[26rem] flex-col items-center lg:max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 w-full lg:hidden">
            <div className="flex flex-col items-center gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-bright)] via-[#1b6b50] to-[#4338ca] font-display text-lg font-bold text-white shadow-[0_20px_40px_-12px_rgba(22,129,93,0.55)] ring-2 ring-white/25">
                  TT
                </div>
                <div className="text-left">
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-[#86efac]/90 min-[380px]:text-[11px]">Tuition Tracker</p>
                  <p className="font-display text-lg font-extrabold tracking-tight text-white min-[380px]:text-xl">
                    Sign in to continue
                  </p>
                </div>
              </div>
              <p className="max-w-xs text-center text-sm leading-relaxed text-white/[0.65]">
                Your students, bundles, and schedule — synced with your Google account.
              </p>
              <div className="-mx-1 flex w-full gap-2 overflow-x-auto overflow-y-hidden pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="shrink-0 snap-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm"
                  >
                    <p className="font-display text-xs font-bold text-[#cffafe]">{f.title}</p>
                    <p className="mt-1 max-w-[10.5rem] text-[11px] leading-snug text-white/[0.6]">{f.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="tt-login-card-animate tt-login-card-frame relative w-full" style={{ animationDelay: "0.05s" }}>
            <div className="tt-login-card-inner relative overflow-hidden px-7 py-10 sm:px-9 sm:py-11">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(22,129,93,0.12)_0%,transparent_70%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(91,97,232,0.1)_0%,transparent_70%)]"
              />

              <div className="relative">
                <div className="mx-auto flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-bright)] via-[#1b6b50] to-[#4338ca] shadow-[0_20px_44px_-16px_rgba(13,74,53,0.55)] ring-2 ring-white/70">
                  <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" aria-hidden>
                    <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="10" opacity="0.35" />
                  </svg>
                </div>
                <h2 className="mt-7 text-center font-display text-2xl font-bold tracking-tight text-[var(--text)] min-[380px]:text-[1.75rem]">Welcome back</h2>
                <p className="mx-auto mt-3 max-w-[19rem] text-center text-sm leading-relaxed text-[var(--muted)]">
                  One tap with Google. Your data stays under{" "}
                  <span className="font-semibold text-[var(--accent)]">your Firebase account only.</span>
                </p>

                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={busy}
                  className="tt-login-google-btn relative z-[1] mt-10 flex min-h-[3.25rem] w-full items-center justify-center gap-3 px-4 text-[0.9375rem] font-semibold text-[#1c1917] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bright)] focus-visible:ring-offset-2"
                >
                  <GoogleGlyph />
                  {busy ? "Opening Google…" : "Continue with Google"}
                </button>
                <p className="relative z-[1] mt-3 text-center text-xs leading-snug text-[var(--muted)] md:text-[11px]">
                  A small sign-in window may open — allow pop-ups if your browser blocks it.
                </p>

                <details className="group relative z-[1] mt-6 rounded-xl border border-[rgba(13,74,53,0.14)] bg-[rgba(232,242,235,0.35)] text-left">
                  <summary className="cursor-pointer list-none px-3.5 py-3 font-display text-xs font-semibold text-[var(--accent)] marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-2">
                      Trouble signing in?
                      <svg className="h-4 w-4 shrink-0 text-[var(--muted)] opacity-80 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>
                  <div className="border-t border-[rgba(13,74,53,0.1)] px-3.5 pb-3 pt-2 text-xs leading-snug text-[var(--muted)] md:text-[11px]">
                    If you see <span className="font-medium text-[var(--text)]">disallowed_useragent</span>, open this site in{" "}
                    <span className="font-medium text-[var(--text)]">Chrome or Safari</span> — not Instagram, Messenger, or in-app browsers. From a link, use &ldquo;Open in browser&rdquo;.
                  </div>
                </details>

                <p className="relative z-[1] mt-8 border-t border-[rgba(13,74,53,0.09)] pt-6 text-center text-[11px] leading-relaxed text-[var(--muted)] md:text-xs">
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-[var(--accent-bright)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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
