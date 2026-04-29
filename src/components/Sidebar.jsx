import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const items = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/students", label: "Students" },
  { to: "/timetable", label: "Timetable" },
  { to: "/income", label: "Income" },
  { to: "/add-student", label: "Add Student" },
];

export default function Sidebar({ user }) {
  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <aside className="tt-sidebar hidden h-dvh w-[226px] shrink-0 flex-col md:flex">
      <div className="border-b border-[rgba(28,27,24,0.06)] px-4 py-[1.125rem]">
        <div className="font-display text-lg font-bold tracking-tight text-[var(--text)]">
          Tuition
          <span className="bg-gradient-to-r from-[var(--accent-bright)] to-[#4338ca] bg-clip-text text-transparent">
            Tracker
          </span>
        </div>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
          Class hub
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `tt-nav-link ${isActive ? "tt-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[rgba(28,27,24,0.06)] p-3">
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-[rgba(13,74,53,0.05)] px-2 py-2">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="h-10 w-10 rounded-xl border border-white/80 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-light)] to-[rgba(99,102,241,0.15)] font-display text-xs font-bold text-[var(--accent)]">
              {(user?.displayName || user?.email || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-[var(--text)]">
              {user?.displayName || "Tutor"}
            </div>
            <div className="truncate text-[11px] text-[var(--muted)]">
              {user?.email}
            </div>
          </div>
        </div>
        <button type="button" onClick={handleSignOut} className="tt-btn-ghost w-full text-[var(--muted)] hover:text-[var(--accent)]">
          Sign out
        </button>
      </div>
    </aside>
  );
}
