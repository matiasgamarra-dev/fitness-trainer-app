import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkouts } from "../hooks/useWorkouts.js";
import { formatDateTime, formatDuration, dayOfWeekName } from "../lib/date.js";

type FilterTab = "all" | "active";

export default function Workouts() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<FilterTab>("all");
  const workoutsQuery = useWorkouts(tab === "active" ? { activeOnly: true } : undefined);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-cyan-400">Entrenamientos</h1>
          <p className="text-sm text-gray-400">
            Historial de tus sesiones de entrenamiento.
          </p>
        </div>
        <button
          onClick={() => navigate("/workouts/new")}
          className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
        >
          + Nuevo entrenamiento
        </button>
      </div>

      <div className="mb-4 flex gap-1 border-b border-gray-800">
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          Todos
        </TabButton>
        <TabButton active={tab === "active"} onClick={() => setTab("active")}>
          Activos
        </TabButton>
      </div>

      {workoutsQuery.isLoading && (
        <p className="text-gray-400">Cargando entrenamientos...</p>
      )}

      {workoutsQuery.isError && (
        <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          No se pudieron cargar los entrenamientos.
        </p>
      )}

      {!workoutsQuery.isLoading && !workoutsQuery.isError && (workoutsQuery.data ?? []).length === 0 && (
        <div className="rounded-lg border border-gray-800 bg-[#161B22] p-8 text-center">
          <p className="mb-2 text-gray-300">
            {tab === "active" ? "No tenés ninguna sesión activa." : "Todavía no tenés entrenamientos."}
          </p>
          <p className="text-sm text-gray-500">
            {tab === "active"
              ? "Iniciá un nuevo entrenamiento para empezar."
              : "Iniciá tu primer entrenamiento para empezar a registrar tu progreso."}
          </p>
        </div>
      )}

      {!workoutsQuery.isLoading && !workoutsQuery.isError && (workoutsQuery.data ?? []).length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(workoutsQuery.data ?? []).map((w) => (
            <WorkoutCard key={w.id} workout={w} onClick={() => navigate(`/workouts/${w.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm transition ${
        active
          ? "border-cyan-400 text-cyan-400"
          : "border-transparent text-gray-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

interface WorkoutCardProps {
  workout: {
    id: string;
    routine_name: string;
    day_of_week: number | null;
    started_at: string;
    finished_at: string | null;
    notes: string | null;
  };
  onClick: () => void;
}

function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  const isActive = workout.finished_at === null;
  const duration = formatDuration(workout.started_at, workout.finished_at);
  const dayName = dayOfWeekName(workout.day_of_week);

  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-lg border border-gray-800 bg-[#161B22] p-5 text-left transition hover:border-cyan-500/50 hover:bg-[#1c2330]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-white group-hover:text-cyan-400">
          {workout.routine_name}
        </h3>
        {isActive ? (
          <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400">
            ● Activa
          </span>
        ) : (
          <span className="rounded bg-gray-700/50 px-2 py-0.5 text-xs text-gray-400">
            Finalizada
          </span>
        )}
      </div>

      {dayName && (
        <p className="mb-1 text-xs text-gray-500">{dayName}</p>
      )}

      <p className="mb-2 text-sm text-gray-400">{formatDateTime(workout.started_at)}</p>

      {workout.notes && (
        <p className="mb-2 line-clamp-2 text-sm text-gray-500 italic">
          {workout.notes}
        </p>
      )}

      <div className="mt-auto flex gap-4 text-xs text-gray-500">
        {duration && <span>⏱ {duration}</span>}
      </div>
    </button>
  );
}
