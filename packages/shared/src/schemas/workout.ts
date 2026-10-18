import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Workout Sets (series)
// ─────────────────────────────────────────────────────────────

export const WorkoutSetSchema = z.object({
  id: z.uuid(),
  session_id: z.uuid(),
  exercise_id: z.uuid(),
  set_number: z.number().int().min(1),
  weight_kg: z.number().min(0).nullable(),
  reps: z.number().int().min(1),
  rpe: z.number().min(1).max(10).nullable(),
  is_warmup: z.boolean(),
  completed_at: z.iso.datetime(),
  notes: z.string().nullable(),
});

export type WorkoutSet = z.infer<typeof WorkoutSetSchema>;

// ─────────────────────────────────────────────────────────────
// Workout Sessions
// ─────────────────────────────────────────────────────────────

export const WorkoutSessionSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  routine_id: z.uuid().nullable(),
  routine_name: z.string().min(1).max(100),
  day_of_week: z.number().int().min(1).max(7).nullable(),
  started_at: z.iso.datetime(),
  finished_at: z.iso.datetime().nullable(),
  notes: z.string().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;

// Sesión con sets embebidos (para GET /workouts/:id)
export const WorkoutSessionWithSetsSchema = WorkoutSessionSchema.extend({
  sets: z.array(WorkoutSetSchema),
});

export type WorkoutSessionWithSets = z.infer<typeof WorkoutSessionWithSetsSchema>;

// ─────────────────────────────────────────────────────────────
// Request bodies
// ─────────────────────────────────────────────────────────────

// POST /api/v1/workouts — iniciar sesión
export const CreateWorkoutSessionSchema = z.object({
  routine_id: z.uuid().nullable(),
  routine_name: z.string().min(1).max(100),
  day_of_week: z.number().int().min(1).max(7).nullable(),
  notes: z.string().max(2000).optional(),
});

export type CreateWorkoutSessionInput = z.infer<typeof CreateWorkoutSessionSchema>;

// PUT /api/v1/workouts/:id — finalizar / editar notas
export const UpdateWorkoutSessionSchema = z.object({
  finished_at: z.iso.datetime().optional(),
  notes: z.string().max(2000).optional(),
});

export type UpdateWorkoutSessionInput = z.infer<typeof UpdateWorkoutSessionSchema>;

// POST /api/v1/workouts/:id/sets — registrar serie
// Nota: set_number NO va acá — lo calcula el backend (max+1 por ejercicio en la sesión)
export const LogWorkoutSetSchema = z.object({
  exercise_id: z.uuid(),
  weight_kg: z.number().min(0).nullable(),
  reps: z.number().int().min(1),
  rpe: z.number().min(1).max(10).nullable().optional(),
  is_warmup: z.boolean().optional().default(false),
  notes: z.string().max(1000).optional(),
});

export type LogWorkoutSetInput = z.infer<typeof LogWorkoutSetSchema>;

// PUT /api/v1/workouts/:id/sets/:setId — editar serie
export const UpdateWorkoutSetSchema = z.object({
  weight_kg: z.number().min(0).nullable().optional(),
  reps: z.number().int().min(1).optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  is_warmup: z.boolean().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type UpdateWorkoutSetInput = z.infer<typeof UpdateWorkoutSetSchema>;

// ─────────────────────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────────────────────

export const WorkoutLastSessionSchema = z.object({
  id: z.uuid(),
  routine_name: z.string(),
  finished_at: z.iso.datetime().nullable(),
});

export const WorkoutStatsSchema = z.object({
  total_sessions: z.number().int().min(0),
  total_sets: z.number().int().min(0),
  total_volume_kg: z.number().min(0),
  current_streak_days: z.number().int().min(0),
  last_session: WorkoutLastSessionSchema.nullable(),
});

export type WorkoutStats = z.infer<typeof WorkoutStatsSchema>;