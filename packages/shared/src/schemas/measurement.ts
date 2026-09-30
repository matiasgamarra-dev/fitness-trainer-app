import { z } from "zod";

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

export type MeasurementCreateInput = z.infer<typeof measurementCreateSchema>;
