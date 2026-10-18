import { useState } from "react";
import { useExercises } from "../hooks/useExercises.js";
import type { Exercise, MuscleGroup, Equipment } from "@fitness-trainer/shared";

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Pecho",
  back: "Espalda",
  shoulders: "Hombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  legs: "Piernas",
  glutes: "Glúteos",
  core: "Core",
  cardio: "Cardio",
  full_body: "Full body",
};

const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "Barra",
  dumbbell: "Mancuerna",
  machine: "Máquina",
  cable: "Polea",
  bodyweight: "Peso corporal",
  kettlebell: "Kettlebell",
  band: "Banda",
  other: "Otro",
};

export default function ExerciseSelector({
  onSelect,
  onClose,
}: ExerciseSelectorProps) {
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | "">("");
  const [equipment, setEquipment] = useState<Equipment | "">("");

  const exercisesQuery = useExercises({
    muscle_group: muscleGroup || undefined,
    equipment: equipment || undefined,
  });

  const filtered = (exercisesQuery.data ?? []).filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-gray-800 bg-[#0D1117] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-white">Elegir ejercicio</h2>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-gray-400 transition hover:bg-gray-800 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Filtros */}
        <div className="space-y-3 border-b border-gray-800 p-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="input"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={muscleGroup}
              onChange={(e) =>
                setMuscleGroup(e.target.value as MuscleGroup | "")
              }
              className="input"
            >
              <option value="">Todos los músculos</option>
              {(Object.keys(MUSCLE_LABELS) as MuscleGroup[]).map((mg) => (
                <option key={mg} value={mg}>
                  {MUSCLE_LABELS[mg]}
                </option>
              ))}
            </select>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value as Equipment | "")}
              className="input"
            >
              <option value="">Todo el equipamiento</option>
              {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((eq) => (
                <option key={eq} value={eq}>
                  {EQUIPMENT_LABELS[eq]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-2">
          {exercisesQuery.isLoading && (
            <p className="p-4 text-center text-sm text-gray-400">Cargando...</p>
          )}

          {exercisesQuery.isError && (
            <p className="p-4 text-center text-sm text-red-400">
              No se pudieron cargar los ejercicios.
            </p>
          )}

          {!exercisesQuery.isLoading && filtered.length === 0 && (
            <p className="p-4 text-center text-sm text-gray-400">
              No se encontraron ejercicios con esos filtros.
            </p>
          )}

          {filtered.length > 0 && (
            <ul className="divide-y divide-gray-800">
              {filtered.map((ex) => (
                <li key={ex.id}>
                  <button
                    onClick={() => onSelect(ex)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[#161B22]"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{ex.name}</p>
                      <p className="text-xs text-gray-500">
                        {MUSCLE_LABELS[ex.muscle_group as MuscleGroup] ??
                          ex.muscle_group}{" "}
                        ·{" "}
                        {EQUIPMENT_LABELS[ex.equipment as Equipment] ??
                          ex.equipment}
                      </p>
                    </div>
                    <span className="rounded bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400">
                      + Agregar
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}