import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type BackendSuccessBody } from "../lib/api.js";
import type {
  LogWorkoutSetInput,
  UpdateWorkoutSetInput,
} from "@fitness-trainer/shared";

// ─── Tipos ───────────────────────────────────────────────────

export interface WorkoutSetItem {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number;
  rpe: number | null;
  is_warmup: boolean;
  completed_at: string;
  notes: string | null;
  exercise?: {
    id: string;
    name: string;
    muscle_group: string;
    equipment: string;
  };
}

export interface WorkoutStats {
  total_sessions: number;
  total_sets: number;
  total_volume_kg: number;
  current_streak_days: number;
  last_session: {
    id: string;
    routine_name: string;
    finished_at: string | null;
  } | null;
}

// ─── Query keys ──────────────────────────────────────────────

export const workoutSetKeys = {
  all: ["workout_sets"] as const,
  stats: () => [...workoutSetKeys.all, "stats"] as const,
};

// ─── Mutations ───────────────────────────────────────────────

export function useLogSet(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LogWorkoutSetInput) => {
      const { data } = await api.post<BackendSuccessBody<WorkoutSetItem>>(
        `/workouts/${sessionId}/sets`,
        input,
      );
      return data.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts", "detail", sessionId] });
      queryClient.invalidateQueries({ queryKey: workoutSetKeys.stats() });
    },
  });
}

export function useUpdateSet(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ setId, input }: { setId: string; input: UpdateWorkoutSetInput }) => {
      const { data } = await api.put<BackendSuccessBody<WorkoutSetItem>>(
        `/workouts/${sessionId}/sets/${setId}`,
        input,
      );
      return data.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts", "detail", sessionId] });
    },
  });
}

export function useDeleteSet(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (setId: string) => {
      await api.delete(`/workouts/${sessionId}/sets/${setId}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts", "detail", sessionId] });
      queryClient.invalidateQueries({ queryKey: workoutSetKeys.stats() });
    },
  });
}

// ─── Query stats ─────────────────────────────────────────────

export function useWorkoutStats() {
  return useQuery({
    queryKey: workoutSetKeys.stats(),
    queryFn: async () => {
      const { data } = await api.get<BackendSuccessBody<WorkoutStats>>("/workouts/stats");
      return data.data;
    },
    staleTime: 30 * 1000,
  });
}
