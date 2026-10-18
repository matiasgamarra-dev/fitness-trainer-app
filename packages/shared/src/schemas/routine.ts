import { z } from "zod";

/**
 * Dia de la semana 1-7 (lunes=1, domingo=7).
 * Coincide con el formato de users.days_per_week.
 */
export const dayOfWeekSchema = z.number().int().min(1).max(7);

/**
 * Schema de un ejercicio dentro de una rutina (con sets/reps/rest).
 * Es la fila de routine_exercises "completa", con el ejercicio embebido
 * cuando el backend la devuelve.
 */
export const routineExerciseInputSchema = z.object({
  exercise_id: z.string().uuid(),
  day_of_week: dayOfWeekSchema,
  order_index: z.number().int().min(0),
  sets: z.number().int().min(1).max(20),
  reps: z.string().trim().min(1).max(20),
  rest_seconds: z.number().int().min(0).max(600).default(60),
  notes: z.string().trim().max(500).optional(),
});

/**
 * Schema para crear una rutina (POST /routines).
 * Incluye los ejercicios embebidos para hacerlo atomico.
 */
export const routineCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional(),
  days_per_week: z.number().int().min(1).max(7),
  is_active: z.boolean().default(true),
  exercises: z.array(routineExerciseInputSchema).min(1).max(100),
});

/**
 * Schema para actualizar una rutina (PUT /routines/:id).
 * Todos los campos son opcionales. Si se manda exercises,
 * se reemplaza el array completo (patron "replace all").
 */
export const routineUpdateSchema = routineCreateSchema.partial();

export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;
export type RoutineExerciseInput = z.infer<typeof routineExerciseInputSchema>;
export type RoutineCreateInput = z.infer<typeof routineCreateSchema>;
export type RoutineUpdateInput = z.infer<typeof routineUpdateSchema>;