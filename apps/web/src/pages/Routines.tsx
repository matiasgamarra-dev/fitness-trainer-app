import { useNavigate } from "react-router-dom";
import { useRoutines } from "../hooks/useRoutines.js";

export default function Routines() {
  const navigate = useNavigate();
  const routinesQuery = useRoutines();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-cyan-400">Rutinas</h1>
          <p className="text-sm text-gray-400">
            Gestioná tus rutinas de entrenamiento.
          </p>
        </div>
        <button
          onClick={() => navigate("/routines/new")}
          className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
        >
          + Nueva rutina
        </button>
      </div>

      {routinesQuery.isLoading && (
        <p className="text-gray-400">Cargando rutinas...</p>
      )}

      {routinesQuery.isError && (
        <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          No se pudieron cargar las rutinas.
        </p>
      )}

      {!routinesQuery.isLoading &&
        !routinesQuery.isError &&
        (routinesQuery.data ?? []).length === 0 && (
          <div className="rounded-lg border border-gray-800 bg-[#161B22] p-8 text-center">
            <p className="mb-2 text-gray-300">Todavía no tenés rutinas.</p>
            <p className="text-sm text-gray-500">
              Creá tu primera rutina para empezar a entrenar.
            </p>
          </div>
        )}

      {!routinesQuery.isLoading &&
        !routinesQuery.isError &&
        (routinesQuery.data ?? []).length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(routinesQuery.data ?? []).map((routine) => (
              <button
                key={routine.id}
                onClick={() => navigate(`/routines/${routine.id}`)}
                className="group flex flex-col rounded-lg border border-gray-800 bg-[#161B22] p-5 text-left transition hover:border-cyan-500/50 hover:bg-[#1c2330]"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-white group-hover:text-cyan-400">
                    {routine.name}
                  </h3>
                  {routine.is_active && (
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400">
                      Activa
                    </span>
                  )}
                </div>

                {routine.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-gray-400">
                    {routine.description}
                  </p>
                )}

                <div className="mt-auto flex gap-4 text-xs text-gray-500">
                  <span>{routine.days_per_week} días/sem</span>
                  <span>{routine.exercise_count ?? 0} ejercicios</span>
                </div>
              </button>
            ))}
          </div>
        )}
    </div>
  );
}