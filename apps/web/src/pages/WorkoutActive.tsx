import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkout, useUpdateWorkout, useDeleteWorkout } from "../hooks/useWorkouts.js";
import { useDeleteSet } from "../hooks/useWorkoutSets.js";
import { useExercises } from "../hooks/useExercises.js";
import { WorkoutTimer } from "../components/WorkoutTimer.js";
import { AddSetForm } from "../components/AddSetForm.js";
import { formatDateTime, dayOfWeekName } from "../lib/date.js";
import type { WorkoutSetItem } from "../hooks/useWorkoutSets.js";

function groupSetsByExercise(sets: WorkoutSetItem[]): Map<string, WorkoutSetItem[]> {
  const map = new Map<string, WorkoutSetItem[]>();
  for (const s of sets) {
    const key = s.exercise_id;
    const arr = map.get(key) ?? [];
    arr.push(s);
    map.set(key, arr);
  }
  for (const arr of map.values()) arr.sort((a, b) => a.set_number - b.set_number);
  return map;
}

export default function WorkoutActive() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workoutQuery = useWorkout(id ?? null);
  const exercisesQuery = useExercises();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();
  const deleteSet = useDeleteSet(id ?? "");

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (workoutQuery.isLoading) return <p className="text-gray-400">Cargando sesión...</p>;
  if (workoutQuery.isError) return <p className="text-red-400">No se pudo cargar la sesión.</p>;
  if (!workoutQuery.data) return <p className="text-gray-400">Sesión no encontrada.</p>;

  const workout = workoutQuery.data;
  const sets = workout.sets ?? [];
  const grouped = groupSetsByExercise(sets);
  const exercises = exercisesQuery.data ?? [];
  const isActive = workout.finished_at === null;

  async function handleFinish() {
    try {
      await updateWorkout.mutateAsync({
        id: workout.id,
        input: { finished_at: new Date().toISOString() },
      });
    } catch {
      // silencioso, el botón se reactiva
    }
  }

  async function handleDeleteWorkout() {
    try {
      await deleteWorkout.mutateAsync(workout.id);
      navigate("/workouts");
    } catch {
      // silencioso
    }
  }

  async function handleDeleteSet(setId: string) {
    try {
      await deleteSet.mutateAsync(setId);
    } catch {
      // silencioso
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate("/workouts")}
        className="mb-4 text-sm text-gray-400 hover:text-white"
      >
        ← Volver al historial
      </button>

      <div className="mb-6 rounded-lg border border-gray-800 bg-[#161B22] p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">{workout.routine_name}</h1>
            <p className="mt-1 text-xs text-gray-500">
              {formatDateTime(workout.started_at)}
              {workout.day_of_week && ` · ${dayOfWeekName(workout.day_of_week)}`}
            </p>
          </div>
          <WorkoutTimer startedAt={workout.started_at} finishedAt={workout.finished_at} />
        </div>

        {workout.notes && (
          <p className="mb-3 text-sm text-gray-400 italic">{workout.notes}</p>
        )}

        <div className="flex gap-2">
          {isActive ? (
            <button
              onClick={handleFinish}
              disabled={updateWorkout.isPending}
              className="rounded bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
            >
              {updateWorkout.isPending ? "Finalizando..." : "Finalizar entrenamiento"}
            </button>
          ) : (
            <span className="rounded bg-gray-700/50 px-2 py-1 text-xs text-gray-400">
              Finalizada
            </span>
          )}
          {confirmDelete ? (
            <div className="flex gap-2">
              <button onClick={handleDeleteWorkout} className="rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-400">
                Confirmar eliminar
              </button>
              <button onClick={() => setConfirmDelete(false)} className="rounded border border-gray-700 px-3 py-1.5 text-sm text-gray-300">
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="rounded border border-gray-700 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800">
              Eliminar sesión
            </button>
          )}
        </div>
      </div>

      {isActive && (
        <div className="mb-6">
          <AddSetForm sessionId={workout.id} exercises={exercises} />
        </div>
      )}

      {grouped.size === 0 && (
        <div className="rounded-lg border border-gray-800 bg-[#161B22] p-8 text-center">
          <p className="text-gray-400">Todavía no registraste series.</p>
        </div>
      )}

      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([exerciseId, exerciseSets]) => {
          const ex = exerciseSets[0]?.exercise;
          return (
            <div key={exerciseId} className="rounded-lg border border-gray-800 bg-[#161B22] p-4">
              <h3 className="mb-2 text-sm font-semibold text-white">
                {ex?.name ?? "Ejercicio"}
                {ex?.muscle_group && <span className="ml-2 text-xs text-gray-500">({ex.muscle_group})</span>}
              </h3>
              <div className="space-y-1">
                {exerciseSets.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded bg-[#0D1117] px-3 py-1.5 text-sm">
                    <span className="text-gray-300">
                      Serie {s.set_number}: {s.weight_kg ?? 0} kg × {s.reps}
                      {s.rpe !== null && <span className="ml-2 text-xs text-gray-500">RPE {s.rpe}</span>}
                      {s.is_warmup && <span className="ml-2 text-xs text-yellow-500">calentamiento</span>}
                    </span>
                    {isActive && (
                      <button onClick={() => handleDeleteSet(s.id)} className="text-xs text-red-400 hover:text-red-300">
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
