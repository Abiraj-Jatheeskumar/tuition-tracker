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
    <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)] text-sm text-[var(--muted)]">
      Loading…
    </div>
  );
}

function TabIcon({ name, active }) {
  const c = active ? "var(--accent)" : "var(--muted)";
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0">
        {items.map((item) => {
          const on = item.match(path);
          return (
            <button
              key={item.to}
              type="button"
              onClick={() => navigate(item.to)}
              className={`flex min-h-12 min-w-[44px] flex-1 flex-col items-center justify-center rounded-[10px] text-[10px] font-semibold ${
                on ? "text-[var(--accent)]" : "text-[var(--muted)]"
              }`}
            >
              <TabIcon name={item.to} active={on} />
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
    <div className="flex min-h-dvh bg-[var(--bg)]">
      <Sidebar user={user} />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden">
          <div className="text-base font-semibold text-[var(--text)]">
            Tuition<span className="text-[var(--accent)]">Tracker</span>
          </div>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="min-h-10 rounded-[10px] border border-[var(--border)] px-3 text-xs font-semibold text-[var(--muted)]"
          >
            Sign out
          </button>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
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
    return <Splash />;
  }

  if (!user) {
    return <Login />;
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
