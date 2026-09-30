import { z } from "zod";

export const goalSchema = z.enum(["lose_fat", "gain_muscle", "maintain"]);
export const sexSchema = z.enum(["male", "female", "other"]);

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  birth_date: z.string().date().optional(),
  sex: sexSchema.optional(),
  height_cm: z.number().positive().max(300).optional(),
  goal: goalSchema.optional(),
  days_per_week: z.number().int().min(1).max(7).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type Sex = z.infer<typeof sexSchema>;
