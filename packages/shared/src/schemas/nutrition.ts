import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────

export const FOOD_CATEGORIES = [
  "protein",
  "dairy",
  "carbs",
  "fruit",
  "vegetable",
  "legume",
  "nuts",
  "fat",
  "processed",
  "supplement",
  "beverage",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export type MealType = (typeof MEAL_TYPES)[number];

// ─────────────────────────────────────────────────────────────
// Foods (catálogo global, solo lectura)
// ─────────────────────────────────────────────────────────────

export const FoodSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(150),
  category: z.enum(FOOD_CATEGORIES),
  kcal_per_100g: z.number().min(0).max(1000),
  protein_per_100g: z.number().min(0).max(100),
  carbs_per_100g: z.number().min(0).max(100),
  fat_per_100g: z.number().min(0).max(100),
  fiber_per_100g: z.number().min(0).max(100).nullable(),
  serving_g: z.number().positive().nullable(),
  serving_name: z.string().max(80).nullable(),
  created_at: z.iso.datetime(),
});

export type Food = z.infer<typeof FoodSchema>;

// ─────────────────────────────────────────────────────────────
// Nutrition Goals (1:1 por usuario)
// ─────────────────────────────────────────────────────────────

export const NutritionGoalSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  daily_kcal: z.number().positive().max(10000),
  protein_g: z.number().min(0).max(1000),
  carbs_g: z.number().min(0).max(1000),
  fat_g: z.number().min(0).max(1000),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type NutritionGoal = z.infer<typeof NutritionGoalSchema>;

// PUT /api/v1/nutrition/goal — crear o reemplazar objetivo
export const UpsertNutritionGoalSchema = z.object({
  daily_kcal: z.number().positive().max(10000),
  protein_g: z.number().min(0).max(1000).optional().default(0),
  carbs_g: z.number().min(0).max(1000).optional().default(0),
  fat_g: z.number().min(0).max(1000).optional().default(0),
});

export type UpsertNutritionGoalInput = z.infer<typeof UpsertNutritionGoalSchema>;

// ─────────────────────────────────────────────────────────────
// Meal Items (snapshot de macros)
// ─────────────────────────────────────────────────────────────

export const MealItemSchema = z.object({
  id: z.uuid(),
  meal_id: z.uuid(),
  food_id: z.uuid().nullable(),
  food_name: z.string().min(1).max(150),
  quantity_g: z.number().positive().max(5000),
  kcal: z.number().min(0),
  protein_g: z.number().min(0),
  carbs_g: z.number().min(0),
  fat_g: z.number().min(0),
  created_at: z.iso.datetime(),
});

export type MealItem = z.infer<typeof MealItemSchema>;

// ─────────────────────────────────────────────────────────────
// Meals (por usuario + fecha + meal_type)
// ─────────────────────────────────────────────────────────────

export const MealSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  date: z.string().date(),
  meal_type: z.enum(MEAL_TYPES),
  notes: z.string().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type Meal = z.infer<typeof MealSchema>;

// Comida con items embebidos (para GET /meals/:id y GET /meals?date=)
export const MealWithItemsSchema = MealSchema.extend({
  items: z.array(MealItemSchema),
});

export type MealWithItems = z.infer<typeof MealWithItemsSchema>;

// ─────────────────────────────────────────────────────────────
// Request bodies
// ─────────────────────────────────────────────────────────────

// POST /api/v1/meals — crear comida del día
export const CreateMealSchema = z.object({
  date: z.string().date(),
  meal_type: z.enum(MEAL_TYPES),
  notes: z.string().max(500).optional(),
});

export type CreateMealInput = z.infer<typeof CreateMealSchema>;

// PUT /api/v1/meals/:id — editar notas
export const UpdateMealSchema = z.object({
  notes: z.string().max(500).nullable().optional(),
});

export type UpdateMealInput = z.infer<typeof UpdateMealSchema>;

// POST /api/v1/meals/:id/items — agregar item
// Nota: kcal, protein_g, carbs_g, fat_g NO van acá
// El backend los calcula a partir del food_id + quantity_g
export const CreateMealItemSchema = z.object({
  food_id: z.uuid(),
  quantity_g: z.number().positive().max(5000),
});

export type CreateMealItemInput = z.infer<typeof CreateMealItemSchema>;

// PUT /api/v1/meals/:id/items/:itemId — editar cantidad
// Los macros se recalculan en el backend
export const UpdateMealItemSchema = z.object({
  quantity_g: z.number().positive().max(5000),
});

export type UpdateMealItemInput = z.infer<typeof UpdateMealItemSchema>;

// ─────────────────────────────────────────────────────────────
// Daily Summary (para dashboard / GET /nutrition/daily?date=)
// ─────────────────────────────────────────────────────────────

export const DailyNutritionSummarySchema = z.object({
  date: z.string().date(),
  total_kcal: z.number().min(0),
  total_protein_g: z.number().min(0),
  total_carbs_g: z.number().min(0),
  total_fat_g: z.number().min(0),
  goal: NutritionGoalSchema.nullable(),
  meals: z.array(MealWithItemsSchema),
});

export type DailyNutritionSummary = z.infer<typeof DailyNutritionSummarySchema>;