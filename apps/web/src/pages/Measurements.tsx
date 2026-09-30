import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { measurementCreateSchema } from "@fitness-trainer/shared";
import {
  useMeasurements,
  useCreateMeasurement,
  useDeleteMeasurement,
  type Measurement,
} from "../hooks/useMeasurements.js";
import { getWeekRange } from "../lib/date.js";
import { ApiError } from "../lib/api.js";

interface FormState {
  date: string;
  weight_kg: string;
  body_fat_pct: string;
  notes: string;
  chest_cm: string;
  waist_cm: string;
  hip_cm: string;
  neck_cm: string;
  arm_cm: string;
  forearm_cm: string;
  thigh_cm: string;
  calf_cm: string;
  shoulder_cm: string;
}

const EMPTY_FORM: FormState = {
  date: today(),
  weight_kg: "",
  body_fat_pct: "",
  notes: "",
  chest_cm: "",
  waist_cm: "",
  hip_cm: "",
  neck_cm: "",
  arm_cm: "",
  forearm_cm: "",
  thigh_cm: "",
  calf_cm: "",
  shoulder_cm: "",
};

function today(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Measurements() {
  const listQuery = useMeasurements({ limit: 100 });
  const createMutation = useCreateMeasurement();
  const deleteMutation = useDeleteMeasurement();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  const chartData = useMemo(() => {
    const items = listQuery.data ?? [];
    return [...items]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => ({
        date: m.date.slice(5),
        weight_kg: m.weight_kg,
      }));
  }, [listQuery.data]);

  const listItems = useMemo(() => {
    return [...(listQuery.data ?? [])].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }, [listQuery.data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = buildPayload(form);
    const parsed = measurementCreateSchema.safeParse(payload);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Revisá los datos del formulario.",
      );
      return;
    }

    const { week_start, week_end } = getWeekRange(new Date(form.date));

    try {
      await createMutation.mutateAsync({
        ...parsed.data,
        week_start,
        week_end,
      });
      setForm(EMPTY_FORM);
      setShowAdvanced(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(
          "Ya existe una medida registrada esta semana. Editá la existente o esperá a la próxima.",
        );
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo guardar la medida. Intentá de nuevo.");
      }
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-cyan-400">Medidas</h1>
      <p className="mb-8 text-sm text-gray-400">
        Registrá tu peso y medidas corporales.
      </p>

      <section className="mb-8 rounded-lg border border-gray-800 bg-[#161B22] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Nueva medida
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-500">
                Fecha
              </span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="input"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-500">
                Peso (kg) *
              </span>
              <input
                type="number"
                min="0"
                max="500"
                step="0.1"
                value={form.weight_kg}
                onChange={(e) => update("weight_kg", e.target.value)}
                className="input"
                placeholder="Ej: 78.5"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-500">
                % Grasa corporal
              </span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.body_fat_pct}
                onChange={(e) => update("body_fat_pct", e.target.value)}
                className="input"
                placeholder="Opcional"
              />
            </label>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs uppercase tracking-wide text-cyan-400 hover:text-cyan-300"
            >
              {showAdvanced
                ? "− Ocultar medidas corporales"
                : "+ Agregar medidas corporales"}
            </button>

            {showAdvanced && (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {(
                  [
                    ["chest_cm", "Pecho"],
                    ["waist_cm", "Cintura"],
                    ["hip_cm", "Cadera"],
                    ["neck_cm", "Cuello"],
                    ["arm_cm", "Brazo"],
                    ["forearm_cm", "Antebrazo"],
                    ["thigh_cm", "Muslo"],
                    ["calf_cm", "Gemelo"],
                    ["shoulder_cm", "Hombro"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-500">
                      {label} (cm)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      className="input"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wide text-gray-500">
              Notas
            </span>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="input min-h-[60px] resize-y"
              placeholder="Opcional"
              maxLength={500}
            />
          </label>

          {error && (
            <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? "Guardando…" : "Guardar medida"}
          </button>
        </form>
      </section>

      {chartData.length >= 2 && (
        <section className="mb-8 rounded-lg border border-gray-800 bg-[#161B22] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Evolución del peso
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  domain={["dataMin - 2", "dataMax + 2"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D1117",
                    border: "1px solid #1f2937",
                    borderRadius: 6,
                    color: "#f0f6fc",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight_kg"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#22d3ee" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-gray-800 bg-[#161B22] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Historial ({listItems.length})
        </h2>

        {listQuery.isLoading && (
          <p className="text-sm text-gray-400">Cargando…</p>
        )}

        {listQuery.isError && (
          <p className="text-sm text-red-400">No se pudo cargar el historial.</p>
        )}

        {!listQuery.isLoading && listItems.length === 0 && (
          <p className="text-sm text-gray-400">
            Todavía no registraste ninguna medida.
          </p>
        )}

        {listItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4">Fecha</th>
                  <th className="pb-2 pr-4">Peso</th>
                  <th className="pb-2 pr-4">% Grasa</th>
                  <th className="pb-2 pr-4">Notas</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {listItems.map((m) => (
                  <Row
                    key={m.id}
                    measurement={m}
                    onDelete={() => {
                      if (
                        confirm(
                          `¿Eliminar la medida del ${m.date}? Esta acción no se puede deshacer.`,
                        )
                      ) {
                        deleteMutation.mutate(m.id);
                      }
                    }}
                    deleting={deleteMutation.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({
  measurement,
  onDelete,
  deleting,
}: {
  measurement: Measurement;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <tr className="border-b border-gray-800 last:border-b-0">
      <td className="py-2 pr-4 font-mono text-gray-300">
        {measurement.date}
      </td>
      <td className="py-2 pr-4 text-white">{measurement.weight_kg} kg</td>
      <td className="py-2 pr-4 text-gray-300">
        {measurement.body_fat_pct !== null
          ? `${measurement.body_fat_pct}%`
          : "—"}
      </td>
      <td className="max-w-xs truncate py-2 pr-4 text-gray-400">
        {measurement.notes ?? "—"}
      </td>
      <td className="py-2 text-right">
        <button
          onClick={onDelete}
          disabled={deleting}
          className="text-xs text-red-400 transition hover:text-red-300 disabled:opacity-40"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}

function buildPayload(form: FormState) {
  const num = (s: string) => (s.trim() === "" ? undefined : Number(s));

  return {
    date: form.date,
    weight_kg: Number(form.weight_kg),
    body_fat_pct: num(form.body_fat_pct),
    chest_cm: num(form.chest_cm),
    waist_cm: num(form.waist_cm),
    hip_cm: num(form.hip_cm),
    neck_cm: num(form.neck_cm),
    arm_cm: num(form.arm_cm),
    forearm_cm: num(form.forearm_cm),
    thigh_cm: num(form.thigh_cm),
    calf_cm: num(form.calf_cm),
    shoulder_cm: num(form.shoulder_cm),
    notes: form.notes.trim() === "" ? undefined : form.notes.trim(),
  };
}