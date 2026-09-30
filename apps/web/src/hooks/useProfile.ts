import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProfileUpdateInput } from "@fitness-trainer/shared";
import { api, ApiError } from "../lib/api.js";

// ─────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────

/**
 * Respuesta del backend en GET /profile y PUT /profile.
 * Los campos writeOnce pueden venir en null si el onboarding
 * todavía no se completó.
 */
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  birth_date: string | null;
  sex: "male" | "female" | "other" | null;
  height_cm: number | null;
  goal: "lose_fat" | "gain_muscle" | "maintain" | null;
  days_per_week: number | null;
  created_at: string;
  updated_at: string;
}

interface ProfileResponse {
  success: true;
  data: Profile;
}

// ─────────────────────────────────────────────────────────────
// Query key
// ─────────────────────────────────────────────────────────────

export const profileKeys = {
  all: ["profile"] as const,
};

// ─────────────────────────────────────────────────────────────
// GET /profile
// ─────────────────────────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: async () => {
      const response = await api.get<ProfileResponse>("/profile");
      return response.data.data;
    },
  });
}

// ─────────────────────────────────────────────────────────────
// PUT /profile
// ─────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProfileUpdateInput) => {
      const response = await api.put<ProfileResponse>("/profile", input);
      return response.data.data;
    },
    onSuccess: (updated) => {
      // Actualiza el cache con la respuesta del server (más fresco que refetch)
      queryClient.setQueryData(profileKeys.all, updated);
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Re-export para conveniencia
// ─────────────────────────────────────────────────────────────

export { ApiError };