import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MeasurementCreateWithWeekInput } from "@fitness-trainer/shared";
import { api, ApiError } from "../lib/api.js";
import { getWeekRange } from "../lib/date.js";

// ─────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────

export interface Measurement {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  weight_kg: number;
  body_fat_pct: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  neck_cm: number | null;
  arm_cm: number | null;
  forearm_cm: number | null;
  thigh_cm: number | null;
  calf_cm: number | null;
  shoulder_cm: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface MeasurementResponse {
  success: true;
  data: Measurement;
}

interface MeasurementListResponse {
  success: true;
  data: Measurement[];
}

export interface ListMeasurementsParams {
  limit?: number;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

export type MeasurementUpdateInput = Partial<
  Omit<MeasurementCreateWithWeekInput, "week_start" | "week_end">
>;

// ─────────────────────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────────────────────

export const measurementKeys = {
  all: ["measurements"] as const,
  list: (params: ListMeasurementsParams) =>
    [...measurementKeys.all, "list", params] as const,
};

// ─────────────────────────────────────────────────────────────
// GET /measurements
// ─────────────────────────────────────────────────────────────

export function useMeasurements(params: ListMeasurementsParams = {}) {
  return useQuery({
    queryKey: measurementKeys.list(params),
    queryFn: async () => {
      const response = await api.get<MeasurementListResponse>(
        "/measurements",
        { params },
      );
      return response.data.data;
    },
  });
}

// ─────────────────────────────────────────────────────────────
// POST /measurements
// ─────────────────────────────────────────────────────────────

export function useCreateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MeasurementCreateWithWeekInput) => {
      const payload: MeasurementCreateWithWeekInput = {
        ...input,
        week_start:
          input.week_start ?? getWeekRange(new Date(input.date)).week_start,
        week_end:
          input.week_end ?? getWeekRange(new Date(input.date)).week_end,
      };

      const response = await api.post<MeasurementResponse>(
        "/measurements",
        payload,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: measurementKeys.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// PUT /measurements/:id
// ─────────────────────────────────────────────────────────────

export function useUpdateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: MeasurementUpdateInput;
    }) => {
      const response = await api.put<MeasurementResponse>(
        `/measurements/${id}`,
        input,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: measurementKeys.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// DELETE /measurements/:id
// ─────────────────────────────────────────────────────────────

export function useDeleteMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/measurements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: measurementKeys.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Re-export
// ─────────────────────────────────────────────────────────────

export { ApiError };