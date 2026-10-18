import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.js";
import { useRoutines } from "../hooks/useRoutines.js";
import { useWorkouts } from "../hooks/useWorkouts.js";
import { useWorkoutStats } from "../hooks/useWorkoutSets.js";
import { formatDateTime } from "../lib/date.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const routinesQuery = useRoutines({ activeOnly: true });
  const activeSessionsQuery = useWorkouts({ activeOnly: true, limit: 1 });
  const statsQuery = useWorkoutStats();

  const displayName =
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    "usuario";

  const activeRoutine = routinesQuery.data?.[0] ?? null;
  const activeSession = activeSessionsQuery.data?.[0] ?? null;
  const stats = statsQuery.data ?? null;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-cyan-400">Dashboard</h1>
          <p className="text-sm text-gray-400">Bienvenido, {displayName}.</p>
        </div>
        <button
          onClick={() => navigate("/workouts/new")}
          className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
        >
          + Entrenar ahora
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <ActionCard
          title="Rutina activa"
          onClick={activeRoutine ? () => navigate(`/routines/${activeRoutine.id}`) : () => navigate("/routines/new")}
          isLoading={routinesQuery.isLoading}
          isError={routinesQuery.isError}
        >
          {activeRoutine ? (
            <>
              <p className="text-lg font-semibold text-white">{activeRoutine.name}</p>
              <p className="mt-1 text-xs text-gray-500">{activeRoutine.days_per_week} días/semana · {activeRoutine.exercise_count ?? 0} ejercicios</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-400">Todavía no tenés una rutina activa.</p>
              <p className="mt-1 text-xs text-cyan-400">Crear rutina →</p>
            </>
          )}
        </ActionCard>

        {activeSession ? (
          <ActionCard
            title="Sesión activa"
            onClick={() => navigate(`/workouts/${activeSession.id}`)}
            isLoading={activeSessionsQuery.isLoading}
            isError={activeSessionsQuery.isError}
          >
            <p className="text-lg font-semibold text-white">{activeSession.routine_name}</p>
            <p className="mt-1 text-xs text-cyan-400">● En curso · Continuar →</p>
          </ActionCard>
        ) : (
          <ActionCard
            title="Último entrenamiento"
            onClick={stats?.last_session ? () => navigate(`/workouts/${stats.last_session!.id}`) : () => navigate("/workouts")}
            isLoading={statsQuery.isLoading}
            isError={statsQuery.isError}
          >
            {stats?.last_session ? (
              <>
                <p className="text-lg font-semibold text-white">{stats.last_session.routine_name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {stats.last_session.finished_at ? formatDateTime(stats.last_session.finished_at) : "Sin finalizar"}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-400">Todavía no registraste entrenamientos.</p>
                <p className="mt-1 text-xs text-cyan-400">Iniciar el primero →</p>
              </>
            )}
          </ActionCard>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sesiones" value={stats?.total_sessions ?? 0} isLoading={statsQuery.isLoading} />
        <StatCard label="Volumen total" value={`${stats?.total_volume_kg ?? 0} kg`} isLoading={statsQuery.isLoading} />
        <StatCard label="Racha" value={`${stats?.current_streak_days ?? 0} días`} isLoading={statsQuery.isLoading} />
      </div>
    </div>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────

interface ActionCardProps {
  title: string;
  onClick: () => void;
  isLoading?: boolean;
  isError?: boolean;
  children: React.ReactNode;
}

function ActionCard({ title, onClick, isLoading, isError, children }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-lg border border-gray-800 bg-[#161B22] p-6 text-left transition hover:border-cyan-500/50 hover:bg-[#1c2330]"
    >
      <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">{title}</p>
      {isLoading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : isError ? (
        <p className="text-sm text-red-400">Error al cargar.</p>
      ) : (
        children
      )}
    </button>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  isLoading?: boolean;
}

function StatCard({ label, value, isLoading }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#161B22] p-6">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-cyan-400">
        {isLoading ? "—" : value}
      </p>
    </div>
  );
}
