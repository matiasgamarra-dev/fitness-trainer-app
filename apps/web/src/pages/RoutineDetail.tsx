import { useNavigate, useParams } from "react-router-dom";
import { useRoutine, useDeleteRoutine, type RoutineExerciseItem } from "../hooks/useRoutines.js";

const DAY_LABELS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

export default function RoutineDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const routineQuery = useRoutine(id ?? null);
  const deleteMutation = useDeleteRoutine();

  if (routineQuery.isLoading) {
    return <p className="text-gray-400">Cargando rutina...</p>;
  }

  if (routineQuery.isError || !routineQuery.data) {
    return (
      <div>
        <p className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          No se pudo cargar la rutina.
        </p>
        <button
          onClick={() => navigate("/routines")}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Volver a rutinas
        </button>
      </div>
    );
  }

  const routine = routineQuery.data;

  const grouped = (routine.exercises ?? []).reduce<Record<number, RoutineExerciseItem[]>>(
    (acc, ex) => {
      if (!acc[ex.day_of_week]) acc[ex.day_of_week] = [];
      acc[ex.day_of_week].push(ex);
      return acc;
    },
    {},
  );

  const sortedDays = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  async function handleDelete() {
    if (!confirm(`¿Eliminar la rutina "${routine.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(routine.id);
      navigate("/routines", { replace: true });
    } catch {
      alert("No se pudo eliminar la rutina. Intentá de nuevo.");
    }
  }

  return (
    <div>
      <button
        onClick={() => navigate("/routines")}
        className="mb-6 text-sm text-gray-400 hover:text-white"
      >
        ← Volver a rutinas
      </button>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-cyan-400">{routine.name}</h1>
            {routine.is_active && (
              <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400">
                Activa
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">
            {routine.days_per_week} días/semana ·{" "}
            {(routine.exercises ?? []).length} ejercicios
          </p>
          {routine.description && (
            <p className="mt-2 max-w-2xl text-sm text-gray-300">
              {routine.description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/routines/${routine.id}/edit`)}
            className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>

      {sortedDays.length === 0 && (
        <div className="rounded-lg border border-gray-800 bg-[#161B22] p-8 text-center">
          <p className="text-gray-300">Esta rutina no tiene ejercicios todavía.</p>
        </div>
      )}

      <div className="space-y-6">
        {sortedDays.map((day) => (
          <section
            key={day}
            className="rounded-lg border border-gray-800 bg-[#161B22] p-6"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {DAY_LABELS[day] ?? `Día ${day}`}
            </h2>

            <div className="space-y-3">
              {(grouped[day] ?? [])
                .sort((a, b) => a.order_index - b.order_index)
                .map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-xs text-gray-500">
                        {idx + 1}.
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {ex.exercise.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ex.exercise.muscle_group} · {ex.exercise.equipment}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>{ex.sets} series</span>
                      <span>{ex.reps} reps</span>
                      <span>{ex.rest_seconds}s descanso</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}