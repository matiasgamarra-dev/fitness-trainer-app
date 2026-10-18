import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type BackendSuccessBody } from "../lib/api.js";
import type {
  CreateWorkoutSessionInput,
  UpdateWorkoutSessionInput,
} from "@fitness-trainer/shared";

// ─── Tipos ───────────────────────────────────────────────────

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_id: string | null;
  routine_name: string;
  day_of_week: number | null;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  sets?: import("./useWorkoutSets.js").WorkoutSetItem[];
}

export interface WorkoutFilters {
  activeOnly?: boolean;
  limit?: number;
}

// ─── Query keys ──────────────────────────────────────────────

export const workoutKeys = {
  all: ["workouts"] as const,
  lists: () => [...workoutKeys.all, "list"] as const,
  list: (filters?: WorkoutFilters) => [...workoutKeys.lists(), filters] as const,
  details: () => [...workoutKeys.all, "detail"] as const,
  detail: (id: string) => [...workoutKeys.details(), id] as const,
};

// ─── Queries ─────────────────────────────────────────────────

export function useWorkouts(filters?: WorkoutFilters) {
  return useQuery({
    queryKey: workoutKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.activeOnly) params.set("active", "true");
      if (filters?.limit) params.set("limit", String(filters.limit));
      const query = params.toString();
      const url = query ? `/workouts?${query}` : "/workouts";
      const { data } = await api.get<BackendSuccessBody<WorkoutSession[]>>(url);
      return data.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useWorkout(id: string | null) {
  return useQuery({
    queryKey: workoutKeys.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("id is required");
      const { data } = await api.get<BackendSuccessBody<WorkoutSession>>(`/workouts/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

// ─── Mutations ───────────────────────────────────────────────

export function useStartWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateWorkoutSessionInput) => {
      const { data } = await api.post<BackendSuccessBody<WorkoutSession>>("/workouts", input);
      return data.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateWorkoutSessionInput }) => {
      const { data } = await api.put<BackendSuccessBody<WorkoutSession>>(`/workouts/${id}`, input);
      return data.data;
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: workoutKeys.detail(variables.id) });
      }
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/workouts/${id}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
    },
  });
}
