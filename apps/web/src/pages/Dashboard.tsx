import { useAuthStore } from "../stores/auth.js";

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
