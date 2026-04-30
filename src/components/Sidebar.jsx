import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    desc: "Overview & totals",
    icon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
        <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/students",
    label: "Students",
    desc: "Profiles & classes",
    icon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
        <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" strokeLinecap="round" />
        <path d="M4 20v-1a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/timetable",
    label: "Timetable",
    desc: "Weekly slots",
    icon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
        <rect x="4" y="5" width="16" height="15" rx="2" strokeLinejoin="round" />
        <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/income",
    label: "Income",
    desc: "Payments & Rs.",
    icon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden>
        <path d="M4 7h16M4 12h11M4 17h15" />
        <path d="M18 17v3h3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/add-student",
    label: "Add student",
    desc: "New learner",
    icon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
        <circle cx="12" cy="8.5" r="3.75" strokeLinecap="round" />
        <path d="M5 21v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 13v8M17 17h8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Sidebar({ user }) {
  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  }

  const iconCls = "h-[1.15rem] w-[1.15rem] shrink-0 transition-[color,transform] duration-200";
  const display = (user?.displayName || "").trim() || "Your account";
  const email = (user?.email || "").trim();

  return (
    <aside className="tt-sidebar tt-sidebar-rail hidden h-full min-h-0 w-[268px] shrink-0 flex-col md:flex">
      <div className="relative overflow-hidden border-b border-[rgba(28,27,24,0.07)] px-4 py-5">
        <div aria-hidden className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(26,122,92,0.18)_0%,transparent_70%)]" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-bright)] via-[#1b6b50] to-[#4338ca] font-display text-sm font-bold text-white shadow-lg shadow-emerald-900/25 ring-2 ring-white/40">
            TT
          </div>
          <div className="min-w-0 pt-0.5">
            <div className="font-display text-[1.05rem] font-extrabold leading-tight tracking-tighter text-[var(--text)]">
              Tuition
              <span className="bg-gradient-to-r from-[var(--accent-bright)] to-[var(--violet)] bg-clip-text text-transparent">
                Tracker
              </span>
            </div>
            <p className="mt-1 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Workspace
            </p>
          </div>
        </div>
      </div>

      <nav className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-3" aria-label="Main">
        <p className="mb-2 px-2 pt-2 font-display text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]/85">
          Navigate
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `group tt-sidebar-link relative flex cursor-pointer gap-3 rounded-xl border border-transparent px-2.5 py-2.5 text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--accent-bright)] focus-visible:ring-offset-2 ${
                isActive
                  ? "border-[rgba(26,122,92,0.28)] bg-gradient-to-br from-[rgba(232,248,239,0.95)] via-white/95 to-[rgba(239,237,253,0.55)] shadow-[0_14px_32px_-22px_rgba(13,74,53,0.65),inset_0_1px_0_rgba(255,255,255,0.9)]"
                  : "hover:border-[rgba(28,27,24,0.06)] hover:bg-white/70 hover:shadow-[0_12px_28px_-26px_rgba(0,0,0,0.18)] active:scale-[0.99]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-colors duration-200 ${
                    isActive
                      ? "border-[rgba(26,122,92,0.35)] bg-white text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-2 ring-[rgba(26,122,92,0.12)]"
                      : "border-[rgba(28,27,24,0.06)] bg-[rgba(255,255,255,0.55)] text-[var(--muted)] group-hover:border-[rgba(26,122,92,0.2)] group-hover:text-[var(--accent)] group-hover:shadow-md"
                  }`}
                >
                  {item.icon(`${iconCls} ${isActive ? "scale-105" : ""}`)}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block font-display text-[0.9375rem] font-semibold leading-tight tracking-tight ${
                      isActive ? "text-[var(--text)]" : "text-[var(--text)]/90 group-hover:text-[var(--text)]"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.6875rem] font-medium text-[var(--muted)] group-hover:text-[var(--muted)]">
                    {item.desc}
                  </span>
                </span>
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[var(--accent-bright)] to-[var(--violet)] shadow-[0_0_12px_rgba(26,122,92,0.45)]"
                  />
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[rgba(28,27,24,0.07)] p-3">
        <div className="overflow-hidden rounded-2xl border border-[rgba(28,27,24,0.08)] bg-[linear-gradient(165deg,rgba(255,255,255,0.98)_0%,rgba(252,250,246,0.94)_45%,rgba(239,244,241,0.42)_100%)] shadow-[0_16px_40px_-28px_rgba(13,74,53,0.22),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-[rgba(255,255,255,0.7)]">
          <div className="flex items-center gap-3 px-3.5 py-3.5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="h-12 w-12 shrink-0 rounded-[0.875rem] border-2 border-white object-cover shadow-[0_6px_16px_-6px_rgba(15,23,42,0.25)] ring-1 ring-[rgba(28,27,24,0.06)]"
              />
            ) : (
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[0.875rem] border border-[rgba(28,27,24,0.07)] bg-gradient-to-br from-[rgba(232,242,235,0.95)] to-[rgba(237,233,254,0.65)] font-display text-[0.9375rem] font-bold text-[var(--accent)] shadow-inner"
                aria-hidden
              >
                {(display[0] || email[0] || "?").toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-display text-[0.625rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Signed in with Google</p>
              <p className="mt-1 truncate font-display text-[0.875rem] font-semibold leading-tight tracking-tight text-[var(--text)]">{display}</p>
              {email ? (
                <p className="mt-0.5 truncate font-mono-nums text-[11px] font-medium leading-snug text-[var(--muted)]" title={email}>
                  {email}
                </p>
              ) : (
                <p className="mt-0.5 text-[11px] font-medium italic text-[var(--muted)]/80">No email on this account</p>
              )}
            </div>
          </div>
          <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(28,27,24,0.08),transparent)]" aria-hidden />
          <button
            type="button"
            onClick={handleSignOut}
            className="group flex w-full items-center gap-2.5 px-3.5 py-3 text-left font-display text-[0.8125rem] font-semibold text-[var(--muted)] outline-none transition-colors duration-200 hover:bg-[rgba(197,48,48,0.06)] hover:text-[var(--red)] focus-visible:bg-[rgba(197,48,48,0.06)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-bright)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(28,27,24,0.06)] bg-white/80 text-[var(--muted)] shadow-sm transition-[border-color,background-color,color] duration-200 group-hover:border-[rgba(197,48,48,0.22)] group-hover:bg-[rgba(254,242,242,0.65)] group-hover:text-[var(--red)]">
              <svg className="h-[1.05rem] w-[1.05rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block leading-tight">Sign out</span>
              <span className="mt-0.5 block text-[10px] font-normal text-[var(--muted)]/90 group-hover:text-[var(--red)]/80">Leave this workspace</span>
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
