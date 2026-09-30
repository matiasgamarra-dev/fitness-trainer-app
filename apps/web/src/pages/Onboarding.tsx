import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileUpdateSchema, type Goal, type Sex } from "@fitness-trainer/shared";
import { useAuthStore } from "../stores/auth.js";
import { useUpdateProfile } from "../hooks/useProfile.js";
import { ApiError } from "../lib/api.js";

// ─────────────────────────────────────────────────────────────
// Tipos del wizard
// ─────────────────────────────────────────────────────────────

type Level = "principiante" | "intermedio" | "avanzado";

interface WizardState {
  // Paso 1
  name: string;
  birth_date: string; // YYYY-MM-DD
  sex: Sex | "";
  height_cm: string; // input como string, se convierte al enviar
  // Paso 2
  goal: Goal | "";
  // Paso 3 (visual)
  level: Level | "";
  // Paso 4
  days_per_week: number | "";
}

const TOTAL_STEPS = 4;

const GOAL_LABELS: Record<Goal, string> = {
  lose_fat: "Perder grasa",
  gain_muscle: "Ganar músculo",
  maintain: "Mantener",
};

const SEX_LABELS: Record<Sex, string> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
};

const LEVEL_LABELS: Record<Level, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const initialName = useMemo(
    () => (user?.user_metadata?.name as string | undefined) ?? "",
    [user],
  );

  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>({
    name: initialName,
    birth_date: "",
    sex: "",
    height_cm: "",
    goal: "",
    level: "",
    days_per_week: "",
  });
  const [error, setError] = useState<string | null>(null);

  // ───────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!state.name.trim()) return "Ingresá tu nombre.";
      if (!state.birth_date) return "Ingresá tu fecha de nacimiento.";
      if (!state.sex) return "Seleccioná tu sexo.";
      const height = Number(state.height_cm);
      if (!state.height_cm || Number.isNaN(height) || height <= 0 || height >= 300) {
        return "Ingresá una altura válida (cm).";
      }
    }
    if (current === 2) {
      if (!state.goal) return "Seleccioná tu objetivo.";
    }
    if (current === 3) {
      if (!state.level) return "Seleccioná tu nivel.";
    }
    if (current === 4) {
      const days = Number(state.days_per_week);
      if (!state.days_per_week || Number.isNaN(days) || days < 1 || days > 7) {
        return "Elegí entre 1 y 7 días por semana.";
      }
    }
    return null;
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleFinish() {
    const err = validateStep(4);
    if (err) {
      setError(err);
      return;
    }

    // Armamos el payload y lo validamos con el schema compartido.
    // level NO se manda (es visual).
    const payload = {
      name: state.name.trim(),
      birth_date: state.birth_date,
      sex: state.sex as Sex,
      height_cm: Number(state.height_cm),
      goal: state.goal as Goal,
      days_per_week: Number(state.days_per_week),
    };

    const parsed = profileUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Revisá los datos del formulario.",
      );
      return;
    }

    try {
      await updateProfile.mutateAsync(parsed.data);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.lockedFields?.length) {
        setError(
          `Estos campos ya estaban bloqueados: ${e.lockedFields.join(", ")}`,
        );
      } else if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError("No se pudo guardar el perfil. Intentá de nuevo.");
      }
    }
  }

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-[#0D1117] text-white">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-cyan-400">
          Completá tu perfil
        </h1>
        <p className="mb-6 text-sm text-gray-400">
          Paso {step} de {TOTAL_STEPS}
        </p>

        {/* Barra de progreso */}
        <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full bg-cyan-400 transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div className="rounded-lg border border-gray-800 bg-[#161B22] p-6">
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Nombre">
                <input
                  type="text"
                  value={state.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="input"
                  placeholder="Cómo te llamás"
                />
              </Field>

              <Field label="Fecha de nacimiento">
                <input
                  type="date"
                  value={state.birth_date}
                  onChange={(e) => update("birth_date", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Sexo">
                <select
                  value={state.sex}
                  onChange={(e) => update("sex", e.target.value as Sex | "")}
                  className="input"
                >
                  <option value="">Seleccioná…</option>
                  {(Object.keys(SEX_LABELS) as Sex[]).map((s) => (
                    <option key={s} value={s}>
                      {SEX_LABELS[s]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Altura (cm)">
                <input
                  type="number"
                  min={1}
                  max={299}
                  step="0.1"
                  value={state.height_cm}
                  onChange={(e) => update("height_cm", e.target.value)}
                  className="input"
                  placeholder="Ej: 178"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="mb-2 text-sm text-gray-400">
                ¿Cuál es tu objetivo principal?
              </p>
              {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                <RadioCard
                  key={g}
                  selected={state.goal === g}
                  onSelect={() => update("goal", g)}
                  label={GOAL_LABELS[g]}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="mb-2 text-sm text-gray-400">
                ¿Cuál es tu nivel de experiencia?
              </p>
              {(Object.keys(LEVEL_LABELS) as Level[]).map((l) => (
                <RadioCard
                  key={l}
                  selected={state.level === l}
                  onSelect={() => update("level", l)}
                  label={LEVEL_LABELS[l]}
                />
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Field label="¿Cuántos días por semana querés entrenar?">
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={state.days_per_week}
                  onChange={(e) =>
                    update(
                      "days_per_week",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="input"
                  placeholder="1 a 7"
                />
              </Field>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Navegación */}
        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Atrás
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={updateProfile.isPending}
              className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateProfile.isPending ? "Guardando…" : "Finalizar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function RadioCard({
  selected,
  onSelect,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded border px-4 py-3 text-left text-sm transition ${
        selected
          ? "border-cyan-400 bg-cyan-500/10 text-cyan-300"
          : "border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  );
}