import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.js";

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Perfil" },
  { to: "/measurements", label: "Medidas" },
];

export default function AppLayout() {
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0D1117] text-white">
      <header className="border-b border-gray-800 bg-[#161B22]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-cyan-400">
              Fitness Trainer
            </span>
            <nav className="flex gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded px-3 py-1.5 text-sm transition ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <button
            onClick={handleSignOut}
            className="rounded px-3 py-1.5 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}