import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type BackendSuccessBody } from "../lib/api.js";
import type {
  RoutineCreateInput,
  RoutineUpdateInput,
} from "@fitness-trainer/shared";

// â”€â”€â”€ Tipos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface RoutineExerciseItem {
  id: string;
  routine_id: string;
  exercise_id: string;
  day_of_week: number;
  order_index: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string | null;
  created_at: string;
  exercise: {
    id: string;
    name: string;
    muscle_group: string;
    equipment: string;
  };
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  days_per_week: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  exercise_count?: number;
  exercises?: RoutineExerciseItem[];
}

export interface RoutineFilters {
  activeOnly?: boolean;
}

// â”€â”€â”€ Query keys (jerarquica) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const routineKeys = {
  all: ["routines"] as const,
  lists: () => [...routineKeys.all, "list"] as const,
  list: (filters?: RoutineFilters) => [...routineKeys.lists(), filters] as const,
  details: () => [...routineKeys.all, "detail"] as const,
  detail: (id: string) => [...routineKeys.details(), id] as const,
};

// â”€â”€â”€ Hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Lista las rutinas del usuario.
 * Las rutinas cambian cuando el usuario las edita/crea/borra,
 * por eso staleTime: 30s (no 'static' como exercises).
 */
export function useRoutines(filters?: RoutineFilters) {
  return useQuery({
    queryKey: routineKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.activeOnly) params.set("active_only", "true");
      const query = params.toString();
      const url = query ? `/routines?${query}` : "/routines";
      const { data } = await api.get<BackendSuccessBody<Routine[]>>(url);
      return data.data;
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Detalle de una rutina con exercises embebidos.
 */
export function useRoutine(id: string | null) {
  return useQuery({
    queryKey: routineKeys.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("id is required");
      const { data } = await api.get<BackendSuccessBody<Routine>>(`/routines/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Crea una rutina. Invalida la lista de rutinas.
 */
export function useCreateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RoutineCreateInput) => {
      const { data } = await api.post<BackendSuccessBody<Routine>>("/routines", input);
      return data.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.lists() });
    },
  });
}

/**
 * Actualiza una rutina. Invalida la lista y el detalle.
 */
export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: RoutineUpdateInput }) => {
      const { data } = await api.put<BackendSuccessBody<Routine>>(`/routines/${id}`, input);
      return data.data;
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.lists() });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: routineKeys.detail(variables.id) });
      }
    },
  });
}

/**
 * Elimina una rutina. Invalida la lista.
 */
export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/routines/${id}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.lists() });
    },
  });
}