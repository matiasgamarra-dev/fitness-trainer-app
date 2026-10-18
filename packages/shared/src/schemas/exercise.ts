import { z } from "zod";

/**
 * Grupos musculares soportados.
 * Si agregas uno nuevo aca, tambien agregalo en el CHECK de la migracion.
 */
export const muscleGroupSchema = z.enum([
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "glutes",
  "core",
  "cardio",
  "full_body",
]);

/**
 * Equipamiento requerido para el ejercicio.
 */
export const equipmentSchema = z.enum([
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "bodyweight",
  "kettlebell",
  "band",
  "other",
]);

/**
 * Schema de un ejercicio del catalogo global.
 * Los ejercicios son de solo lectura: se crean por seed/migracion,
 * no por la API.
 */
export const exerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  muscle_group: muscleGroupSchema,
  equipment: equipmentSchema,
  description: z.string().max(1000).nullable(),
  created_at: z.string(),
});

export type MuscleGroup = z.infer<typeof muscleGroupSchema>;
export type Equipment = z.infer<typeof equipmentSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;