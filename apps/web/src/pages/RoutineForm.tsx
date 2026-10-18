import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  routineCreateSchema,
  type Exercise,
  type RoutineCreateInput,
} from "@fitness-trainer/shared";
import ExerciseSelector from "../components/ExerciseSelector.js";
import {
  useCreateRoutine,
  useRoutine,
  useUpdateRoutine,
} from "../hooks/useRoutines.js";
import { ApiError } from "../lib/api.js";

// ─── Tipos ──────────────────────────────────────────────────

interface ExerciseEntry {
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  equipment: string;
  day_of_week: number;
  order_index: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
}

interface FormState {
  name: string;
  description: string;
  days_per_week: number;
  is_active: boolean;
  exercises: ExerciseEntry[];
}

const DAY_LABELS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  days_per_week: 3,
  is_active: true,
  exercises: [],
};

// ─── Componente ─────────────────────────────────────────────

export default function RoutineForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const routineQuery = useRoutine(id ?? null);
  const createMutation = useCreateRoutine();
  const updateMutation = useUpdateRoutine();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorDay, setSelectorDay] = useState<number>(1);

  // Cargar datos si es edición
  useEffect(() => {
    if (isEdit && routineQuery.data) {
      const r = routineQuery.data;
      setForm({
        name: r.name,
        description: r.description ?? "",
        days_per_week: r.days_per_week,
        is_active: r.is_active,
        exercises: (r.exercises ?? []).map((ex) => ({
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise.name,
          muscle_group: ex.exercise.muscle_group,
          equipment: ex.exercise.equipment,
          day_of_week: ex.day_of_week,
          order_index: ex.order_index,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes ?? undefined,
        })),
      });
    }
  }, [isEdit, routineQuery.data]);

  const exercisesByDay = useMemo(() => {
    const grouped: Record<number, ExerciseEntry[]> = {};
    for (let d = 1; d <= form.days_per_week; d++) {
      grouped[d] = form.exercises
        .filter((e) => e.day_of_week === d)
        .sort((a, b) => a.order_index - b.order_index);
    }
    return grouped;
  }, [form.exercises, form.days_per_week]);

  // ─── Handlers ─────────────────────────────────────────────

  function openSelector(day: number) {
    setSelectorDay(day);
    setSelectorOpen(true);
  }

  function handleSelectExercise(ex: Exercise) {
    const dayExercises = form.exercises.filter(
      (e) => e.day_of_week === selectorDay,
    );
    const nextOrder = dayExercises.length;

    setForm((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exercise_id: ex.id,
          exercise_name: ex.name,
          muscle_group: ex.muscle_group,
          equipment: ex.equipment,
          day_of_week: selectorDay,
          order_index: nextOrder,
          sets: 3,
          reps: "8-10",
          rest_seconds: 90,
        },
      ],
    }));
    setSelectorOpen(false);
  }

  function removeExercise(exercise_id: string, day_of_week: number) {
    setForm((prev) => {
      const remaining = prev.exercises.filter(
        (e) => !(e.exercise_id === exercise_id && e.day_of_week === day_of_week),
      );
      // Recalcular order_index por día
      const byDay: Record<number, ExerciseEntry[]> = {};
      for (const e of remaining) {
        if (!byDay[e.day_of_week]) byDay[e.day_of_week] = [];
        byDay[e.day_of_week].push(e);
      }
      const reordered: ExerciseEntry[] = [];
      for (const day of Object.keys(byDay)) {
        byDay[Number(day)]
          .sort((a, b) => a.order_index - b.order_index)
          .forEach((e, i) => reordered.push({ ...e, order_index: i }));
      }
      return { ...prev, exercises: reordered };
    });
  }

  function updateExercise(
    exercise_id: string,
    day_of_week: number,
    patch: Partial<ExerciseEntry>,
  ) {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) =>
        e.exercise_id === exercise_id && e.day_of_week === day_of_week
          ? { ...e, ...patch }
          : e,
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: RoutineCreateInput = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      days_per_week: form.days_per_week,
      is_active: form.is_active,
      exercises: form.exercises.map((e) => ({
        exercise_id: e.exercise_id,
        day_of_week: e.day_of_week,
        order_index: e.order_index,
        sets: e.sets,
        reps: e.reps.trim(),
        rest_seconds: e.rest_seconds,
        notes: e.notes?.trim() || undefined,
      })),
    };

    const parsed = routineCreateSchema.safeParse(payload);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          "Revisá los datos del formulario.",
      );
      return;
    }

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, input: parsed.data });
        navigate(`/routines/${id}`, { replace: true });
      } else {
        const created = await createMutation.mutateAsync(parsed.data);
        navigate(`/routines/${created.id}`, { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo guardar la rutina. Intentá de nuevo.");
      }
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ─── Render ───────────────────────────────────────────────

  if (isEdit && routineQuery.isLoading) {
    return <p className="text-gray-400">Cargando rutina...</p>;
  }

  if (isEdit && routineQuery.isError) {
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

  return (
    <div>
      <button
        onClick={() => navigate(isEdit && id ? `/routines/${id}` : "/routines")}
        className="mb-6 text-sm text-gray-400 hover:text-white"
      >
        ← {isEdit ? "Volver al detalle" : "Volver a rutinas"}
      </button>

      <h1 className="mb-8 text-3xl font-bold text-cyan-400">
        {isEdit ? "Editar rutina" : "Nueva rutina"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <section className="rounded-lg border border-gray-800 bg-[#161B22] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Datos básicos
          </h2>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-500">
                Nombre *
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input"
                placeholder="Ej: Full Body A"
                required
                maxLength={100}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-500">
                Descripción
              </span>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="input min-h-[60px] resize-y"
                placeholder="Opcional"
                maxLength={1000}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-500">
                  Días por semana *
                </span>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={form.days_per_week}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      days_per_week: Number(e.target.value),
                    }))
                  }
                  className="input"
                  required
                />
              </label>

              <label className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-700 bg-[#0D1117]"
                />
                <span className="text-sm text-gray-300">
                  Marcar como activa
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Ejercicios por día */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Ejercicios
          </h2>

          {Array.from({ length: form.days_per_week }, (_, i) => i + 1).map(
            (day) => (
              <div
                key={day}
                className="rounded-lg border border-gray-800 bg-[#161B22] p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">
                    {DAY_LABELS[day]}
                  </h3>
                  <button
                    type="button"
                    onClick={() => openSelector(day)}
                    className="rounded bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 transition hover:bg-cyan-500/20"
                  >
                    + Agregar ejercicio
                  </button>
                </div>

                {(exercisesByDay[day] ?? []).length === 0 && (
                  <p className="text-xs text-gray-500">
                    No hay ejercicios para este día.
                  </p>
                )}

                <div className="space-y-3">
                  {(exercisesByDay[day] ?? []).map((ex) => (
                    <div
                      key={`${ex.exercise_id}-${ex.day_of_week}`}
                      className="rounded border border-gray-800 bg-[#0D1117] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {ex.exercise_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ex.muscle_group} · {ex.equipment}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeExercise(ex.exercise_id, ex.day_of_week)
                          }
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Quitar
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <label className="block">
                          <span className="mb-1 block text-xs text-gray-500">
                            Series
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={ex.sets}
                            onChange={(e) =>
                              updateExercise(
                                ex.exercise_id,
                                ex.day_of_week,
                                { sets: Number(e.target.value) },
                              )
                            }
                            className="input"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs text-gray-500">
                            Reps
                          </span>
                          <input
                            type="text"
                            value={ex.reps}
                            onChange={(e) =>
                              updateExercise(
                                ex.exercise_id,
                                ex.day_of_week,
                                { reps: e.target.value },
                              )
                            }
                            className="input"
                            maxLength={20}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs text-gray-500">
                            Descanso (s)
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={600}
                            value={ex.rest_seconds}
                            onChange={(e) =>
                              updateExercise(
                                ex.exercise_id,
                                ex.day_of_week,
                                { rest_seconds: Number(e.target.value) },
                              )
                            }
                            className="input"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </section>

        {error && (
          <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-cyan-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Crear rutina"}
          </button>
          <button
            type="button"
            onClick={() =>
              navigate(isEdit && id ? `/routines/${id}` : "/routines")
            }
            className="rounded border border-gray-700 px-6 py-2 text-sm text-gray-300 transition hover:bg-gray-800"
          >
            Cancelar
          </button>
        </div>
      </form>

      {selectorOpen && (
        <ExerciseSelector
          onSelect={handleSelectExercise}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </div>
  );
}