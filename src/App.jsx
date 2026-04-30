import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Students from "./components/Students";
import StudentDetail from "./components/StudentDetail";
import Timetable from "./components/Timetable";
import Income from "./components/Income";
import AddStudent from "./components/AddStudent";

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <div className="tt-splash-ring" aria-hidden />
      <span className="font-display text-sm font-medium tracking-wide text-[var(--muted)]">
        Loading workspace…
      </span>
    </div>
  );
}

function TabIcon({ name, active }) {
  const c = active ? "#0d4a35" : "#878680";
  if (name === "/dashboard") {
    return (
      <svg className="mb-0.5 h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke={c}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "/students") {
    return (
      <svg className="mb-0.5 h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 20v-1a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v1"
          stroke={c}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "/timetable") {
    return (
      <svg className="mb-0.5 h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" stroke={c} strokeWidth="1.6" />
        <path d="M8 3v4M16 3v4M4 10h16" stroke={c} strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "/income") {
    return (
      <svg className="mb-0.5 h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7h16M4 12h10M4 17h16"
          stroke={c}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg className="mb-0.5 h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MobileTabs() {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const items = [
    { to: "/dashboard", label: "Home", match: (p) => p.startsWith("/dashboard") },
    { to: "/students", label: "Students", match: (p) => p.startsWith("/students") },
    { to: "/timetable", label: "Time", match: (p) => p.startsWith("/timetable") },
    { to: "/income", label: "Income", match: (p) => p.startsWith("/income") },
    { to: "/add-student", label: "Add", match: (p) => p.startsWith("/add-student") },
  ];
  return (
    <nav
      aria-label="Main"
      className="tt-mobile-nav fixed bottom-0 left-0 right-0 z-50 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_32px_-8px_rgba(0,0,0,0.08)] md:hidden"
      style={{ paddingLeft: "max(0.25rem, env(safe-area-inset-left))", paddingRight: "max(0.25rem, env(safe-area-inset-right))" }}
    >
      <div className="mx-auto flex max-w-lg items-end justify-between gap-0.5 sm:gap-1">
        {items.map((item) => {
          const on = item.match(path);
          return (
            <button
              key={item.to}
              type="button"
              onClick={() => navigate(item.to)}
              className={`flex min-h-[52px] min-w-[44px] flex-1 flex-col items-center justify-center rounded-xl pb-1 pt-0.5 text-[0.6875rem] font-semibold leading-snug tracking-wide transition-colors active:opacity-85 min-[380px]:text-xs sm:text-[0.8125rem] ${
                on
                  ? "text-[var(--accent)] [&_svg]:drop-shadow-[0_1px_2px_rgba(13,74,53,0.25)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <span
                className={`flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-[background,transform] duration-200 ${
                  on ? "scale-105 bg-[rgba(13,74,53,0.09)] shadow-[inset_0_0_0_1px_rgba(13,74,53,0.1)]" : ""
                }`}
              >
                <TabIcon name={item.to} active={on} />
              </span>
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function AppShell({ user }) {
  return (
    <div className="tt-mesh flex h-[100dvh] max-h-[100dvh] min-h-0 w-full overflow-hidden">
      <Sidebar user={user} />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className="tt-mobile-header flex shrink-0 items-center justify-between gap-3 py-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-bright)] via-[#1b6b50] to-[#4338ca] font-display text-[0.7rem] font-bold text-white shadow-[0_10px_24px_-12px_rgba(13,74,53,0.45)] ring-2 ring-white/50">
              TT
            </span>
            <div className="font-display text-lg font-extrabold leading-tight tracking-tighter text-[var(--text)] min-[380px]:text-[1.0625rem]">
              Tuition
              <span className="bg-gradient-to-r from-[var(--accent-bright)] to-[var(--violet)] bg-clip-text text-transparent">Tracker</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="tt-btn-ghost min-h-10 rounded-xl px-3 text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
          >
            Sign out
          </button>
        </header>
        <main className="isolate min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <Outlet />
        </main>
        <MobileTabs />
      </div>
    </div>
  );
}

export default function App() {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="tt-mesh flex h-[100dvh] max-h-[100dvh] min-h-0 w-full items-center justify-center overflow-hidden">
        <Splash />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="tt-mesh h-full min-h-0 w-full overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <Login />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell user={user} />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:studentId" element={<StudentDetail />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/income" element={<Income />} />
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
