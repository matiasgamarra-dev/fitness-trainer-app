import { z } from "zod";

/**
 * Schema para crear/editar una medida corporal.
 * Los datos reales que se guardan en DB son los campos de body_measurements.
 */
export const measurementCreateSchema = z.object({
  date: z.string().date(),
  weight_kg: z.number().positive().max(500),
  body_fat_pct: z.number().min(0).max(100).optional(),
  chest_cm: z.number().positive().max(300).optional(),
  waist_cm: z.number().positive().max(300).optional(),
  hip_cm: z.number().positive().max(300).optional(),
  neck_cm: z.number().positive().max(100).optional(),
  arm_cm: z.number().positive().max(100).optional(),
  forearm_cm: z.number().positive().max(100).optional(),
  thigh_cm: z.number().positive().max(150).optional(),
  calf_cm: z.number().positive().max(100).optional(),
  shoulder_cm: z.number().positive().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
});

/**
 * Schema para el POST /measurements.
 * Extiende measurementCreateSchema con week_start y week_end,
 * que el frontend calcula según la timezone del usuario.
 * Sirven para validar que no haya otra medida en la semana.
 */
export const measurementCreateWithWeekSchema = measurementCreateSchema
  .extend({
    week_start: z.string().date(),
    week_end: z.string().date(),
  })
  .refine((data) => data.date >= data.week_start && data.date <= data.week_end, {
    message: "date debe estar entre week_start y week_end",
    path: ["date"],
  })
  .refine(
    (data) => {
      const start = new Date(data.week_start + "T00:00:00Z");
      const end = new Date(data.week_end + "T00:00:00Z");
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays === 6;
    },
    {
      message: "week_end debe ser exactamente 6 días después de week_start",
      path: ["week_end"],
    },
  );

export type MeasurementCreateInput = z.infer<typeof measurementCreateSchema>;
export type MeasurementCreateWithWeekInput = z.infer<
  typeof measurementCreateWithWeekSchema
>;