import { useState } from "react";
import { useLogSet } from "../hooks/useWorkoutSets.js";
import { ApiError } from "../lib/api.js";
import type { Exercise } from "@fitness-trainer/shared";

interface AddSetFormProps {
  sessionId: string;
  exercises: Exercise[];
  onDone?: () => void;
}

export function AddSetForm({ sessionId, exercises, onDone }: AddSetFormProps) {
  const logSet = useLogSet(sessionId);
  const [exerciseId, setExerciseId] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [rpe, setRpe] = useState<string>("");
  const [isWarmup, setIsWarmup] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!exerciseId) {
      setErrorMsg("Elegí un ejercicio.");
      return;
    }
    const repsNum = Number(reps);
    if (!Number.isFinite(repsNum) || repsNum < 1) {
      setErrorMsg("Reps debe ser un número mayor a 0.");
      return;
    }

    const weightNum = weight.trim() === "" ? null : Number(weight);
    const rpeNum = rpe.trim() === "" ? null : Number(rpe);

    try {
      await logSet.mutateAsync({
        exercise_id: exerciseId,
        weight_kg: weightNum,
        reps: repsNum,
        rpe: rpeNum,
        is_warmup: isWarmup,
      });
      setWeight("");
      setReps("");
      setRpe("");
      setIsWarmup(false);
      onDone?.();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Error al guardar la serie.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-800 bg-[#0D1117] p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-300">Agregar serie</h3>
      <div className="grid gap-3 sm:grid-cols-5">
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="rounded border border-gray-700 bg-[#161B22] px-2 py-1.5 text-sm text-white sm:col-span-2"
        >
          <option value="">Ejercicio...</option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
        <input
          type="number"
          step="0.5"
          min="0"
          placeholder="kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="rounded border border-gray-700 bg-[#161B22] px-2 py-1.5 text-sm text-white"
        />
        <input
          type="number"
          min="1"
          placeholder="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="rounded border border-gray-700 bg-[#161B22] px-2 py-1.5 text-sm text-white"
        />
        <input
          type="number"
          step="0.5"
          min="1"
          max="10"
          placeholder="RPE"
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
          className="rounded border border-gray-700 bg-[#161B22] px-2 py-1.5 text-sm text-white"
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-gray-400">
          <input
            type="checkbox"
            checked={isWarmup}
            onChange={(e) => setIsWarmup(e.target.checked)}
          />
          Calentamiento
        </label>
        <button
          type="submit"
          disabled={logSet.isPending}
          className="rounded bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
        >
          {logSet.isPending ? "Guardando..." : "Agregar serie"}
        </button>
      </div>
      {errorMsg && <p className="mt-2 text-xs text-red-400">{errorMsg}</p>}
    </form>
  );
}
