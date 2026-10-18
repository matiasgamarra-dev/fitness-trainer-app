import { Router, type Response } from "express";
import { verifyUser, type AuthRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import {
  CreateMealSchema,
  UpdateMealSchema,
  CreateMealItemSchema,
  UpdateMealItemSchema,
  UpsertNutritionGoalSchema,
  FOOD_CATEGORIES,
} from "@fitness-trainer/shared";

const router = Router();

const DEFAULT_FOODS_LIMIT = 50;
const MAX_FOODS_LIMIT = 200;

function getUserId(req: AuthRequest, res: Response): string | null {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, error: "User ID not found in token" });
    return null;
  }
  return userId;
}

// ─── GET /api/v1/foods ───────────────────────────────────────
// Catálogo global de alimentos. Solo lectura.
// Query params opcionales:
//   ?search=texto        (busca en name, case-insensitive)
//   ?category=protein    (filtra por categoría; debe ser una de FOOD_CATEGORIES)
//   ?limit=N             (default 50, max 200)
router.get("/foods", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    let limit = DEFAULT_FOODS_LIMIT;
    if (typeof req.query.limit === "string") {
      const parsed = parseInt(req.query.limit, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        limit = Math.min(parsed, MAX_FOODS_LIMIT);
      }
    }

    let query = supabaseAdmin
      .from("foods")
      .select("id, name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name");

    if (typeof req.query.search === "string" && req.query.search.trim().length > 0) {
      const term = req.query.search.trim();
      query = query.ilike("name", `%${term}%`);
    }

    if (typeof req.query.category === "string") {
      const cat = req.query.category;
      if (!FOOD_CATEGORIES.includes(cat as (typeof FOOD_CATEGORIES)[number])) {
        res.status(400).json({
          success: false,
          error: "Invalid category",
          hint: `Categorías válidas: ${FOOD_CATEGORIES.join(", ")}`,
        });
        return;
      }
      query = query.eq("category", cat);
    }

    query = query.order("name", { ascending: true }).limit(limit);

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ success: false, error: "Database error", details: error.message });
      return;
    }

    res.json({ success: true, data: data ?? [], message: "OK" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── GET /api/v1/meals?date=YYYY-MM-DD ───────────────────────
// Devuelve todas las comidas del día (breakfast/lunch/dinner/snack) con items embebidos.
// Query param requerido: ?date=YYYY-MM-DD
router.get("/meals", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const date = req.query.date;
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        success: false,
        error: "Missing or invalid date",
        hint: "Usá ?date=YYYY-MM-DD (ej: 2026-10-18).",
      });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("meals")
      .select("*, items:meal_items(*)")
      .eq("user_id", userId)
      .eq("date", date)
      .order("meal_type", { ascending: true });

    if (error) {
      res.status(500).json({ success: false, error: "Database error", details: error.message });
      return;
    }

    res.json({ success: true, data: data ?? [], message: "OK" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── GET /api/v1/meals/:id ───────────────────────────────────
// Detalle de una comida con items embebidos.
router.get("/meals/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const { data: meal, error: mealError } = await supabaseAdmin
      .from("meals")
      .select("*, items:meal_items(*)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (mealError || !meal) {
      res.status(404).json({ success: false, error: "Meal not found" });
      return;
    }

    res.json({ success: true, data: meal, message: "OK" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── POST /api/v1/meals ──────────────────────────────────────
// Crea una comida del día. Regla: única por (user_id, date, meal_type).
router.post("/meals", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const parsed = CreateMealSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("meals")
      .select("id")
      .eq("user_id", userId)
      .eq("date", parsed.data.date)
      .eq("meal_type", parsed.data.meal_type)
      .maybeSingle();

    if (existingError) {
      res.status(500).json({ success: false, error: "Database error", details: existingError.message });
      return;
    }

    if (existing) {
      res.status(409).json({
        success: false,
        error: "Meal already exists for that date and type",
        hint: "Ya hay una comida de ese tipo para esa fecha. Editá la existente.",
        details: { meal_id: existing.id },
      });
      return;
    }

    const { data: created, error: createError } = await supabaseAdmin
      .from("meals")
      .insert({
        user_id: userId,
        date: parsed.data.date,
        meal_type: parsed.data.meal_type,
        notes: parsed.data.notes ?? null,
      })
      .select("*")
      .single();

    if (createError) {
      res.status(500).json({ success: false, error: "Database error", details: createError.message });
      return;
    }

    res.status(201).json({ success: true, data: created, message: "Meal created" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── PUT /api/v1/meals/:id ───────────────────────────────────
// Edita notas de una comida.
router.put("/meals/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const parsed = UpdateMealSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    if (Object.keys(parsed.data).length === 0) {
      res.status(400).json({
        success: false,
        error: "Empty body",
        hint: "Enviá al menos un campo para actualizar.",
      });
      return;
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("meals")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: "Meal not found" });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés modificar comidas de otro usuario.",
      });
      return;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("meals")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      res.status(500).json({ success: false, error: "Database error", details: updateError.message });
      return;
    }

    res.json({ success: true, data: updated, message: "Meal updated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── DELETE /api/v1/meals/:id ────────────────────────────────
// Elimina una comida. Los items se borran por CASCADE.
router.delete("/meals/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("meals")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: "Meal not found" });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés eliminar comidas de otro usuario.",
      });
      return;
    }

    const { error: deleteError } = await supabaseAdmin.from("meals").delete().eq("id", id);

    if (deleteError) {
      res.status(500).json({ success: false, error: "Database error", details: deleteError.message });
      return;
    }

    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── POST /api/v1/meals/:id/items ────────────────────────────
// Agrega un alimento a la comida. Los macros se calculan a partir del food
// y quedan como snapshot (no se recalculan si el catálogo cambia).
router.post("/meals/:id/items", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const parsed = CreateMealItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    // 1. Verificar meal + ownership
    const { data: meal, error: mealError } = await supabaseAdmin
      .from("meals")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (mealError || !meal) {
      res.status(404).json({ success: false, error: "Meal not found" });
      return;
    }

    if (meal.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés modificar comidas de otro usuario.",
      });
      return;
    }

    // 2. Buscar el food
    const { data: food, error: foodError } = await supabaseAdmin
      .from("foods")
      .select("id, name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g")
      .eq("id", parsed.data.food_id)
      .single();

    if (foodError || !food) {
      res.status(404).json({ success: false, error: "Food not found" });
      return;
    }

    // 3. Calcular macros según quantity_g
    const factor = parsed.data.quantity_g / 100;
    const kcal = Number((food.kcal_per_100g * factor).toFixed(2));
    const protein_g = Number((food.protein_per_100g * factor).toFixed(2));
    const carbs_g = Number((food.carbs_per_100g * factor).toFixed(2));
    const fat_g = Number((food.fat_per_100g * factor).toFixed(2));

    // 4. Insertar
    const { data: created, error: createError } = await supabaseAdmin
      .from("meal_items")
      .insert({
        meal_id: id,
        food_id: food.id,
        food_name: food.name,
        quantity_g: parsed.data.quantity_g,
        kcal,
        protein_g,
        carbs_g,
        fat_g,
      })
      .select("*")
      .single();

    if (createError) {
      res.status(500).json({ success: false, error: "Database error", details: createError.message });
      return;
    }

    res.status(201).json({ success: true, data: created, message: "Meal item created" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── PUT /api/v1/meals/:id/items/:itemId ─────────────────────
// Edita la cantidad de un item. Recalcula macros con el food original.
router.put("/meals/:id/items/:itemId", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id, itemId } = req.params;

    const parsed = UpdateMealItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    // 1. Verificar item + ownership de la meal via join
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("meal_items")
      .select("id, meal_id, food_id, meals!inner(user_id)")
      .eq("id", itemId)
      .eq("meal_id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: "Meal item not found" });
      return;
    }

    type ItemWithMeal = { meals: { user_id: string } };
    const mealUserId = (existing as unknown as ItemWithMeal).meals.user_id;

    if (mealUserId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés modificar items de otro usuario.",
      });
      return;
    }

    // 2. Traer el food original para recalcular
    const { data: food, error: foodError } = await supabaseAdmin
      .from("foods")
      .select("kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g")
      .eq("id", existing.food_id)
      .single();

    if (foodError || !food) {
      res.status(404).json({
        success: false,
        error: "Original food not found",
        hint: "El alimento original ya no existe en el catálogo. Eliminá el item y creá uno nuevo.",
      });
      return;
    }

    // 3. Recalcular
    const factor = parsed.data.quantity_g / 100;
    const kcal = Number((food.kcal_per_100g * factor).toFixed(2));
    const protein_g = Number((food.protein_per_100g * factor).toFixed(2));
    const carbs_g = Number((food.carbs_per_100g * factor).toFixed(2));
    const fat_g = Number((food.fat_per_100g * factor).toFixed(2));

    // 4. Update
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("meal_items")
      .update({
        quantity_g: parsed.data.quantity_g,
        kcal,
        protein_g,
        carbs_g,
        fat_g,
      })
      .eq("id", itemId)
      .select("*")
      .single();

    if (updateError) {
      res.status(500).json({ success: false, error: "Database error", details: updateError.message });
      return;
    }

    res.json({ success: true, data: updated, message: "Meal item updated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── DELETE /api/v1/meals/:id/items/:itemId ─────────────────
router.delete("/meals/:id/items/:itemId", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id, itemId } = req.params;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("meal_items")
      .select("id, meal_id, meals!inner(user_id)")
      .eq("id", itemId)
      .eq("meal_id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: "Meal item not found" });
      return;
    }

    type ItemWithMeal = { meals: { user_id: string } };
    const mealUserId = (existing as unknown as ItemWithMeal).meals.user_id;

    if (mealUserId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés eliminar items de otro usuario.",
      });
      return;
    }

    const { error: deleteError } = await supabaseAdmin
      .from("meal_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      res.status(500).json({ success: false, error: "Database error", details: deleteError.message });
      return;
    }

    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── GET /api/v1/nutrition/goal ──────────────────────────────
// Devuelve el objetivo nutricional del usuario. 404 si no existe.
router.get("/nutrition/goal", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { data: goal, error: goalError } = await supabaseAdmin
      .from("nutrition_goals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (goalError) {
      res.status(500).json({ success: false, error: "Database error", details: goalError.message });
      return;
    }

    if (!goal) {
      res.status(404).json({
        success: false,
        error: "Nutrition goal not found",
        hint: "Configurá un objetivo con PUT /nutrition/goal.",
      });
      return;
    }

    res.json({ success: true, data: goal, message: "OK" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── PUT /api/v1/nutrition/goal ──────────────────────────────
// Crea o reemplaza el objetivo nutricional (upsert 1:1).
router.put("/nutrition/goal", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const parsed = UpsertNutritionGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("nutrition_goals")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      res.status(500).json({ success: false, error: "Database error", details: existingError.message });
      return;
    }

    if (existing) {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("nutrition_goals")
        .update(parsed.data)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updateError) {
        res.status(500).json({ success: false, error: "Database error", details: updateError.message });
        return;
      }

      res.json({ success: true, data: updated, message: "Nutrition goal updated" });
      return;
    }

    const { data: created, error: createError } = await supabaseAdmin
      .from("nutrition_goals")
      .insert({
        user_id: userId,
        daily_kcal: parsed.data.daily_kcal,
        protein_g: parsed.data.protein_g,
        carbs_g: parsed.data.carbs_g,
        fat_g: parsed.data.fat_g,
      })
      .select("*")
      .single();

    if (createError) {
      res.status(500).json({ success: false, error: "Database error", details: createError.message });
      return;
    }

    res.status(201).json({ success: true, data: created, message: "Nutrition goal created" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

export default router;