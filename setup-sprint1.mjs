#!/usr/bin/env node
/**
 * setup-sprint1.mjs
 * Crea todos los archivos faltantes del Sprint 1 (frontend auth).
 * Ejecutar desde la raíz del monorepo: node setup-sprint1.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const log = (msg, color = "reset") => console.log(`${c[color]}${msg}${c.reset}`);

// ============================================================
// 1. Carpetas
// ============================================================
log("\n🚀 Setup Sprint 1 — Frontend Auth\n", "cyan");
log("📁 Creando carpetas...", "yellow");

const folders = [
  "apps/web/src/stores",
  "apps/web/src/pages",
  "apps/web/src/components",
  "apps/web/tests",
];

for (const folder of folders) {
  const fullPath = path.join(ROOT, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    log(`  ✅ ${folder}`, "green");
  } else {
    log(`  ⏭️  ${folder} (ya existe)`, "gray");
  }
}

// ============================================================
// Helper para escribir archivos
// ============================================================
function writeFile(relPath, content) {
  const fullPath = path.join(ROOT, relPath);
  fs.writeFileSync(fullPath, content, "utf-8");
  log(`  ✅ ${relPath}`, "green");
}

// ============================================================
// 2. stores/auth.ts
// ============================================================
log("\n📝 Creando stores/auth.ts...", "yellow");
writeFile(
  "apps/web/src/stores/auth.ts",
  `import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase.js";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    set({ loading: true });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    set({
      session,
      user: session?.user ?? null,
      loading: false,
      initialized: true,
    });

    supabase.auth.onAuthStateChange((_event, newSession) => {
      set({
        session: newSession,
        user: newSession?.user ?? null,
      });
    });
  },

  signInWithGoogle: async () => {
    set({ loading: true });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });

    set({ loading: false });
    return { error: error as Error | null };
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    set({ loading: false });
    return { error: error as Error | null };
  },

  signUpWithEmail: async (email, password, name) => {
    set({ loading: true });

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    set({ loading: false });
    return { error: error as Error | null };
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ session: null, user: null, loading: false });
  },
}));
`,
);

// ============================================================
// 3. components/ProtectedRoute.tsx
// ============================================================
log("\n📝 Creando components/ProtectedRoute.tsx...", "yellow");
writeFile(
  "apps/web/src/components/ProtectedRoute.tsx",
  `import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "../stores/auth.js";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
`,
);

// ============================================================
// 4. pages/Login.tsx
// ============================================================
log("\n📝 Creando pages/Login.tsx...", "yellow");
writeFile(
  "apps/web/src/pages/Login.tsx",
  `import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/dashboard");
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-[#161B22] p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-cyan-400">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-gray-400">Entrená. Comé. Progresá.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded bg-[#0D1117] px-3 py-2 text-white outline-none ring-1 ring-gray-700 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded bg-[#0D1117] px-3 py-2 text-white outline-none ring-1 ring-gray-700 focus:ring-cyan-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-cyan-500 py-2 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-700" />
          <span className="text-xs text-gray-500">o</span>
          <div className="h-px flex-1 bg-gray-700" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full rounded border border-gray-700 bg-white py-2 font-semibold text-black transition hover:bg-gray-100 disabled:opacity-50"
        >
          Continuar con Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
`,
);

// ============================================================
// 5. pages/Register.tsx
// ============================================================
log("\n📝 Creando pages/Register.tsx...", "yellow");
writeFile(
  "apps/web/src/pages/Register.tsx",
  `import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.js";

export default function Register() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, loading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const { error } = await signUpWithEmail(email, password, name);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/dashboard");
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-[#161B22] p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-cyan-400">Crear cuenta</h1>
        <p className="mb-6 text-sm text-gray-400">
          Empezá tu viaje fitness hoy.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-300">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded bg-[#0D1117] px-3 py-2 text-white outline-none ring-1 ring-gray-700 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded bg-[#0D1117] px-3 py-2 text-white outline-none ring-1 ring-gray-700 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded bg-[#0D1117] px-3 py-2 text-white outline-none ring-1 ring-gray-700 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Confirmar password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded bg-[#0D1117] px-3 py-2 text-white outline-none ring-1 ring-gray-700 focus:ring-cyan-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-cyan-500 py-2 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-700" />
          <span className="text-xs text-gray-500">o</span>
          <div className="h-px flex-1 bg-gray-700" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full rounded border border-gray-700 bg-white py-2 font-semibold text-black transition hover:bg-gray-100 disabled:opacity-50"
        >
          Registrarme con Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
`,
);

// ============================================================
// 6. pages/AuthCallback.tsx
// ============================================================
log("\n📝 Creando pages/AuthCallback.tsx...", "yellow");
writeFile(
  "apps/web/src/pages/AuthCallback.tsx",
  `import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.js";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { session } = useAuthStore();

  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-400">Iniciando sesión...</p>
    </div>
  );
}
`,
);

// ============================================================
// 7. pages/Dashboard.tsx
// ============================================================
log("\n📝 Creando pages/Dashboard.tsx...", "yellow");
writeFile(
  "apps/web/src/pages/Dashboard.tsx",
  `import { useAuthStore } from "../stores/auth.js";

export default function Dashboard() {
  const { user, signOut } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-[#161B22] p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-cyan-400">Dashboard</h1>
        <p className="mb-6 text-sm text-gray-400">
          Bienvenido, {(user?.user_metadata?.name as string | undefined) ?? user?.email ?? "usuario"}.
        </p>

        <div className="mb-6 rounded bg-[#0D1117] p-4">
          <p className="text-xs text-gray-500">Tu email:</p>
          <p className="font-mono text-sm text-white">{user?.email}</p>
        </div>

        <button
          onClick={signOut}
          className="w-full rounded bg-red-500 py-2 font-semibold text-white transition hover:bg-red-400"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
`,
);

// ============================================================
// 8. App.tsx
// ============================================================
log("\n📝 Actualizando App.tsx...", "yellow");
writeFile(
  "apps/web/src/App.tsx",
  `import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Dashboard from "./pages/Dashboard.js";
import AuthCallback from "./pages/AuthCallback.js";
import ProtectedRoute from "./components/ProtectedRoute.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
`,
);

// ============================================================
// 9. main.tsx
// ============================================================
log("\n📝 Actualizando main.tsx...", "yellow");
writeFile(
  "apps/web/src/main.tsx",
  `import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.js";
import { useAuthStore } from "./stores/auth.js";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Root() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
`,
);

// ============================================================
// 10. vitest.config.ts
// ============================================================
log("\n📝 Creando vitest.config.ts...", "yellow");
writeFile(
  "apps/web/vitest.config.ts",
  `import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.tsx"],
    css: false,
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
});
`,
);

// ============================================================
// 11. tests/setup.ts
// ============================================================
log("\n📝 Creando tests/setup.ts...", "yellow");
writeFile(
  "apps/web/tests/setup.ts",
  `import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");
`,
);

// ============================================================
// 12. tests/Login.test.tsx
// ============================================================
log("\n📝 Creando tests/Login.test.tsx...", "yellow");
writeFile(
  "apps/web/tests/Login.test.tsx",
  `import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../src/pages/Login.js";
import { useAuthStore } from "../src/stores/auth.js";

vi.mock("../src/stores/auth.js", () => ({
  useAuthStore: vi.fn(),
}));

describe("Login", () => {
  beforeEach(() => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      signInWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      loading: false,
    });
  });

  it("renderiza el formulario de login", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Continuar con Google")).toBeInTheDocument();
  });

  it("muestra el link a registro", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    expect(screen.getByText("Registrate")).toBeInTheDocument();
  });
});
`,
);

// ============================================================
// 13. tests/Register.test.tsx
// ============================================================
log("\n📝 Creando tests/Register.test.tsx...", "yellow");
writeFile(
  "apps/web/tests/Register.test.tsx",
  `import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../src/pages/Register.js";
import { useAuthStore } from "../src/stores/auth.js";

vi.mock("../src/stores/auth.js", () => ({
  useAuthStore: vi.fn(),
}));

describe("Register", () => {
  beforeEach(() => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      signUpWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      loading: false,
    });
  });

  it("renderiza el formulario de registro", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>,
    );

    expect(screen.getByText("Crear cuenta")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar password")).toBeInTheDocument();
  });

  it("muestra el link a login", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>,
    );

    expect(screen.getByText("Iniciá sesión")).toBeInTheDocument();
  });
});
`,
);

// ============================================================
// 14. .gitattributes
// ============================================================
log("\n📝 Creando .gitattributes...", "yellow");
writeFile(
  ".gitattributes",
  `# Auto-detect text files, normalize to LF in repo
* text=auto eol=lf

# Windows-specific
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
`,
);

// ============================================================
// Done
// ============================================================
log("\n🎉 Setup completo.\n", "green");
log("Próximos pasos:", "cyan");
log("  1. npm run typecheck -w @fitness-trainer/web");
log("  2. npm test -w @fitness-trainer/web");
log("  3. npm run dev -w @fitness-trainer/web");
log("  4. Abrí http://localhost:5173\n");