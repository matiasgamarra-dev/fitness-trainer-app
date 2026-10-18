import { Router, type Response } from "express";
import { verifyUser, type AuthRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import { routineCreateSchema, routineUpdateSchema } from "@fitness-trainer/shared";

const router = Router();

function getUserId(req: AuthRequest, res: Response): string | null {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, error: "User ID not found in token" });
    return null;
  }
  return userId;
}

// ─── GET /api/v1/routines ────────────────────────────────────
// Lista las rutinas del usuario con exercise_count.
// Query params opcionales:
//   ?active_only=true  (default false)
router.get("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const activeOnlyRaw = req.query.active_only;
    const activeOnly = activeOnlyRaw === "true";

    let query = supabaseAdmin
      .from("routines")
      .select("id, name, description, days_per_week, is_active, created_at, updated_at")
      .eq("user_id", userId);

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    query = query.order("is_active", { ascending: false }).order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ success: false, error: "Database error", details: error.message });
      return;
    }

    // Contar exercises por rutina (en 1 query extra)
    const routineIds = (data ?? []).map((r) => r.id);
    let countMap: Record<string, number> = {};

    if (routineIds.length > 0) {
      const { data: counts, error: countError } = await supabaseAdmin
        .from("routine_exercises")
        .select("routine_id")
        .in("routine_id", routineIds);

      if (countError) {
        res.status(500).json({ success: false, error: "Database error", details: countError.message });
        return;
      }

      countMap = (counts ?? []).reduce<Record<string, number>>((acc, row) => {
        acc[row.routine_id] = (acc[row.routine_id] ?? 0) + 1;
        return acc;
      }, {});
    }

    const enriched = (data ?? []).map((r) => ({
      ...r,
      exercise_count: countMap[r.id] ?? 0,
    }));

    res.json({ success: true, data: enriched, message: "OK" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── GET /api/v1/routines/:id ────────────────────────────────
// Detalle de una rutina con exercises embebidos.
router.get("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    // 1. Verificar pertenencia
    const { data: routine, error: fetchError } = await supabaseAdmin
      .from("routines")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !routine) {
      res.status(404).json({ success: false, error: "Routine not found" });
      return;
    }

    // 2. Traer los routine_exercises con join a exercises
    const { data: routineExercises, error: exError } = await supabaseAdmin
      .from("routine_exercises")
      .select("*, exercise:exercises(id, name, muscle_group, equipment)")
      .eq("routine_id", id)
      .order("day_of_week", { ascending: true })
      .order("order_index", { ascending: true });

    if (exError) {
      res.status(500).json({ success: false, error: "Database error", details: exError.message });
      return;
    }

    res.json({
      success: true,
      data: { ...routine, exercises: routineExercises ?? [] },
      message: "OK",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── POST /api/v1/routines ───────────────────────────────────
// Crea una rutina con sus ejercicios.
// Si is_active=true, desactiva las demas rutinas del usuario.
router.post("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const parsed = routineCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    const { exercises, ...routineData } = parsed.data;

    // 1. Si is_active=true, desactivar las demas rutinas activas
    if (routineData.is_active) {
      const { error: deactivateError } = await supabaseAdmin
        .from("routines")
        .update({ is_active: false })
        .eq("user_id", userId)
        .eq("is_active", true);

      if (deactivateError) {
        res.status(500).json({ success: false, error: "Database error", details: deactivateError.message });
        return;
      }
    }

    // 2. Insertar la rutina
    const { data: createdRoutine, error: createError } = await supabaseAdmin
      .from("routines")
      .insert({ ...routineData, user_id: userId })
      .select("*")
      .single();

    if (createError) {
      res.status(500).json({ success: false, error: "Database error", details: createError.message });
      return;
    }

    // 3. Insertar los routine_exercises
    const exercisesToInsert = exercises.map((ex) => ({
      ...ex,
      routine_id: createdRoutine.id,
    }));

    const { data: createdExercises, error: exercisesError } = await supabaseAdmin
      .from("routine_exercises")
      .insert(exercisesToInsert)
      .select("*");

    if (exercisesError) {
      // Rollback manual: borrar la rutina creada
      await supabaseAdmin.from("routines").delete().eq("id", createdRoutine.id);
      res.status(500).json({ success: false, error: "Database error", details: exercisesError.message });
      return;
    }

    res.status(201).json({
      success: true,
      data: { ...createdRoutine, exercises: createdExercises ?? [] },
      message: "Routine created",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── PUT /api/v1/routines/:id ────────────────────────────────
// Actualiza una rutina. Partial update.
// Si viene "exercises", reemplaza el array completo.
router.put("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const parsed = routineUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    if (Object.keys(parsed.data).length === 0) {
      res.status(400).json({ success: false, error: "Empty body", hint: "Envía al menos un campo para actualizar." });
      return;
    }

    // 1. Verificar pertenencia
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("routines")
      .select("id, user_id, is_active")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: "Routine not found" });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({ success: false, error: "Forbidden", hint: "No podés modificar rutinas de otro usuario." });
      return;
    }

    const { exercises, ...routineData } = parsed.data;

    // 2. Si is_active=true, desactivar las demas
    if (routineData.is_active === true && !existing.is_active) {
      await supabaseAdmin
        .from("routines")
        .update({ is_active: false })
        .eq("user_id", userId)
        .eq("is_active", true)
        .neq("id", id);
    }

    // 3. Actualizar la rutina (si hay campos)
    let updatedRoutine = existing;
    if (Object.keys(routineData).length > 0) {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("routines")
        .update(routineData)
        .eq("id", id)
        .select("*")
        .single();

      if (updateError) {
        res.status(500).json({ success: false, error: "Database error", details: updateError.message });
        return;
      }
      updatedRoutine = updated;
    }

    // 4. Si vienen exercises, reemplazar el array completo
    let finalExercises = null;
    if (exercises !== undefined) {
      // Borrar los existentes
      const { error: deleteError } = await supabaseAdmin
        .from("routine_exercises")
        .delete()
        .eq("routine_id", id);

      if (deleteError) {
        res.status(500).json({ success: false, error: "Database error", details: deleteError.message });
        return;
      }

      // Insertar los nuevos
      const toInsert = exercises.map((ex) => ({ ...ex, routine_id: id }));
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("routine_exercises")
        .insert(toInsert)
        .select("*");

      if (insertError) {
        res.status(500).json({ success: false, error: "Database error", details: insertError.message });
        return;
      }
      finalExercises = inserted;
    }

    res.json({
      success: true,
      data: { ...updatedRoutine, ...(finalExercises !== null ? { exercises: finalExercises } : {}) },
      message: "Routine updated",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── DELETE /api/v1/routines/:id ────────────────────────────
// Elimina una rutina. Los routine_exercises se borran por CASCADE.
router.delete("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    // Verificar pertenencia
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("routines")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: "Routine not found" });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({ success: false, error: "Forbidden", hint: "No podés eliminar rutinas de otro usuario." });
      return;
    }

    const { error: deleteError } = await supabaseAdmin.from("routines").delete().eq("id", id);

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

export default router;