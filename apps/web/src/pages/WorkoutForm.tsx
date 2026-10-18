import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoutines } from "../hooks/useRoutines.js";
import { useStartWorkout } from "../hooks/useWorkouts.js";
import { ApiError } from "../lib/api.js";
import { dayOfWeekName } from "../lib/date.js";

const FREE_WORKOUT_VALUE = "__free__";

function getTodayDay(): number {
  // JS getDay(): 0=domingo, 1=lunes, ..., 6=sábado
  // Backend day_of_week: 1=lunes, ..., 7=domingo
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export default function WorkoutForm() {
  const navigate = useNavigate();
  const routinesQuery = useRoutines();
  const startWorkout = useStartWorkout();

  const [routineId, setRoutineId] = useState<string>(FREE_WORKOUT_VALUE);
  const [dayOfWeek, setDayOfWeek] = useState<number>(getTodayDay());
  const [notes, setNotes] = useState<string>("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const routines = routinesQuery.data ?? [];
  const selectedRoutine = routines.find((r) => r.id === routineId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setActiveSessionId(null);

    const isFree = routineId === FREE_WORKOUT_VALUE;
    const payload = {
      routine_id: isFree ? null : routineId,
      routine_name: isFree ? "Entrenamiento libre" : (selectedRoutine?.name ?? "Entrenamiento"),
      day_of_week: dayOfWeek,
      notes: notes.trim() || undefined,
    };

    try {
      const created = await startWorkout.mutateAsync(payload);
      navigate(`/workouts/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const details = err.details as { active_session_id?: string } | undefined;
        setActiveSessionId(details?.active_session_id ?? null);
        setErrorMsg(err.message || "Ya hay una sesión activa.");
      } else {
        setErrorMsg(err instanceof Error ? err.message : "Error inesperado.");
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-cyan-400">Nuevo entrenamiento</h1>
        <p className="text-sm text-gray-400">
          Elegí una rutina (o entrenamiento libre), el día, y arrancá.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-800 bg-[#161B22] p-6">
        <div>
          <label htmlFor="routine" className="mb-2 block text-sm font-medium text-gray-300">
            Rutina
          </label>
          <select
            id="routine"
            value={routineId}
            onChange={(e) => setRoutineId(e.target.value)}
            className="w-full rounded border border-gray-700 bg-[#0D1117] px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value={FREE_WORKOUT_VALUE}>— Entrenamiento libre —</option>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}{r.is_active ? " (activa)" : ""}
              </option>
            ))}
          </select>
          {routinesQuery.isLoading && (
            <p className="mt-1 text-xs text-gray-500">Cargando rutinas...</p>
          )}
        </div>

        <div>
          <label htmlFor="day" className="mb-2 block text-sm font-medium text-gray-300">
            Día de la semana
          </label>
          <select
            id="day"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="w-full rounded border border-gray-700 bg-[#0D1117] px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value={0}>— Sin día específico —</option>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <option key={d} value={d}>
                {dayOfWeekName(d)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-300">
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ej: me siento con energía, foco en técnica..."
            className="w-full rounded border border-gray-700 bg-[#0D1117] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {errorMsg && (
          <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <p>{errorMsg}</p>
            {activeSessionId && (
              <button
                type="button"
                onClick={() => navigate(`/workouts/${activeSessionId}`)}
                className="mt-2 text-xs font-semibold text-red-300 underline hover:text-red-200"
              >
                Ir a la sesión activa →
              </button>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={startWorkout.isPending}
            className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {startWorkout.isPending ? "Iniciando..." : "Iniciar entrenamiento"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/workouts")}
            className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
