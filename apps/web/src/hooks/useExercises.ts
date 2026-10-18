import { useQuery } from "@tanstack/react-query";
import { api, type BackendSuccessBody } from "../lib/api.js";
import type { Exercise, MuscleGroup, Equipment } from "@fitness-trainer/shared";

export interface ExerciseFilters {
  muscle_group?: MuscleGroup;
  equipment?: Equipment;
}

// Query key factory (jerarquica, best practice TanStack Query v5)
export const exerciseKeys = {
  all: ["exercises"] as const,
  list: (filters?: ExerciseFilters) => [...exerciseKeys.all, filters] as const,
};

/**
 * Hook para listar el catalogo global de ejercicios.
 *
 * - El catalogo es seed fijo (migracion). No cambia durante la sesion.
 * - staleTime: 'static' -> nunca refetchea automaticamente.
 * - Acepta filtros opcionales por muscle_group y equipment.
 */
export function useExercises(filters?: ExerciseFilters) {
  return useQuery({
    queryKey: exerciseKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.muscle_group) {
        params.set("muscle_group", filters.muscle_group);
      }
      if (filters?.equipment) {
        params.set("equipment", filters.equipment);
      }

      const query = params.toString();
      const url = query ? `/exercises?${query}` : "/exercises";

      const { data } = await api.get<BackendSuccessBody<Exercise[]>>(url);
      return data.data;
    },
    staleTime: "static",
  });
}