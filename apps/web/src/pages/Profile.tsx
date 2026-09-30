import { useEffect, useState } from "react";
import { profileUpdateSchema } from "@fitness-trainer/shared";
import { useProfile, useUpdateProfile } from "../hooks/useProfile.js";
import { ApiError } from "../lib/api.js";

// ─────────────────────────────────────────────────────────────
// Etiquetas para mostrar en la UI
// ─────────────────────────────────────────────────────────────

const SEX_LABELS: Record<string, string> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
};

const GOAL_LABELS: Record<string, string> = {
  lose_fat: "Perder grasa",
  gain_muscle: "Ganar músculo",
  maintain: "Mantener",
};

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export default function Profile() {
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sincronizar el input local cuando carga el perfil
  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name ?? "");
    }
  }, [profileQuery.data]);

  // Limpiar mensajes después de 3s
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [success]);

  // ───────────────────────────────────────────────────────────
  // Handlers
  // ───────────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const parsed = profileUpdateSchema.safeParse({ name: name.trim() });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Revisá el nombre ingresado.",
      );
      return;
    }

    try {
      await updateProfile.mutateAsync(parsed.data);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.lockedFields?.length) {
        setError(
          `No se puede modificar: ${err.lockedFields.join(", ")}. Contactá al administrador.`,
        );
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo guardar. Intentá de nuevo.");
      }
    }
  }

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  if (profileQuery.isLoading) {
    return <p className="text-gray-400">Cargando perfil…</p>;
  }

  if (profileQuery.isError) {
    return (
      <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        No se pudo cargar el perfil.
      </div>
    );
  }

  const profile = profileQuery.data;
  if (!profile) return null;

  const nameChanged = name.trim() !== (profile.name ?? "");

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-cyan-400">Perfil</h1>
      <p className="mb-8 text-sm text-gray-400">
        Datos personales y objetivo.
      </p>

      <div className="max-w-xl space-y-6">
        {/* Datos de cuenta */}
        <section className="rounded-lg border border-gray-800 bg-[#161B22] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Cuenta
          </h2>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Email
            </p>
            <p className="mt-1 font-mono text-sm text-white">{profile.email}</p>
          </div>
        </section>

        {/* Nombre editable */}
        <section className="rounded-lg border border-gray-800 bg-[#161B22] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Nombre
          </h2>
          <form onSubmit={handleSave} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Tu nombre"
              maxLength={100}
            />

            {error && (
              <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
                Nombre actualizado.
              </p>
            )}

            <button
              type="submit"
              disabled={!nameChanged || updateProfile.isPending}
              className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {updateProfile.isPending ? "Guardando…" : "Guardar cambios"}
            </button>
          </form>
        </section>

        {/* Datos bloqueados (writeOnce) */}
        <section className="rounded-lg border border-gray-800 bg-[#161B22] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Datos personales
            </h2>
            <span className="rounded bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
              Solo lectura
            </span>
          </div>

          <div className="space-y-4">
            <ReadOnlyField
              label="Fecha de nacimiento"
              value={profile.birth_date ?? "—"}
            />
            <ReadOnlyField
              label="Sexo"
              value={profile.sex ? SEX_LABELS[profile.sex] : "—"}
            />
            <ReadOnlyField
              label="Altura"
              value={
                profile.height_cm !== null ? `${profile.height_cm} cm` : "—"
              }
            />
            <ReadOnlyField
              label="Objetivo"
              value={profile.goal ? GOAL_LABELS[profile.goal] : "—"}
            />
            <ReadOnlyField
              label="Días por semana"
              value={
                profile.days_per_week !== null
                  ? `${profile.days_per_week} días`
                  : "—"
              }
            />
          </div>

          <p className="mt-6 rounded border border-gray-700 bg-[#0D1117] px-3 py-2 text-xs text-gray-400">
            Estos datos se completan una sola vez. Para modificarlos,
            contactá al administrador.
          </p>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Subcomponente
// ─────────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}