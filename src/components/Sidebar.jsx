import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const linkClass =
  "flex min-h-11 items-center gap-2 rounded-[10px] px-3 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--accent-light)]";
const activeClass = "bg-[var(--accent-light)] text-[var(--accent)] font-semibold";

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
    <aside className="hidden h-dvh w-[220px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] md:flex">
      <div className="border-b border-[var(--border)] px-4 py-5">
        <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
          Tuition<span className="text-[var(--accent)]">Tracker</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[var(--border)] p-3">
        <div className="mb-2 flex items-center gap-2 px-1">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="h-9 w-9 rounded-full border border-[var(--border)] object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-light)] text-xs font-semibold text-[var(--accent)]">
              {(user?.displayName || user?.email || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-[var(--text)]">
              {user?.displayName || "Tutor"}
            </div>
            <div className="truncate text-[11px] text-[var(--muted)]">
              {user?.email}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="min-h-10 w-full rounded-[10px] border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)]"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
