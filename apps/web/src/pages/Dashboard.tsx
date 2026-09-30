import { useAuthStore } from "../stores/auth.js";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const displayName =
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    "usuario";

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-cyan-400">Dashboard</h1>
      <p className="mb-8 text-sm text-gray-400">Bienvenido, {displayName}.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-800 bg-[#161B22] p-6">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Perfil
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Completá tus datos físicos y objetivo.
          </p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-[#161B22] p-6">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Medidas
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Registrá tu peso y medidas corporales.
          </p>
        </div>
      </div>
    </div>
  );
}