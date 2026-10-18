import { Router, type Response } from "express";
import { verifyUser, type AuthRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import {
  CreateWorkoutSessionSchema,
  UpdateWorkoutSessionSchema,
} from "@fitness-trainer/shared";

const router = Router();

function getUserId(req: AuthRequest, res: Response): string | null {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, error: "User ID not found in token" });
    return null;
  }
  return userId;
}

// ─── GET /api/v1/workouts ────────────────────────────────────
// Lista las sesiones del usuario.
// Query params opcionales:
//   ?active=true   (solo sesiones activas: finished_at IS NULL)
//   ?limit=N       (default 50, max 200)
router.get("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const activeOnly = req.query.active === "true";

    let limit = 50;
    if (typeof req.query.limit === "string") {
      const parsed = parseInt(req.query.limit, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        limit = Math.min(parsed, 200);
      }
    }

    let query = supabaseAdmin
      .from("workout_sessions")
      .select("id, routine_id, routine_name, day_of_week, started_at, finished_at, notes, created_at, updated_at")
      .eq("user_id", userId);

    if (activeOnly) {
      query = query.is("finished_at", null);
    }

    query = query.order("started_at", { ascending: false }).limit(limit);

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

// ─── GET /api/v1/workouts/:id ────────────────────────────────
// Detalle de una sesión. Por ahora devuelve sets: [] (placeholder).
// En S.4.2b se conecta con workout_sets.
router.get("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const { data: session, error: fetchError } = await supabaseAdmin
      .from("workout_sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !session) {
      res.status(404).json({ success: false, error: "Workout session not found" });
      return;
    }

    res.json({
      success: true,
      data: { ...session, sets: [] },
      message: "OK",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── POST /api/v1/workouts ───────────────────────────────────
// Inicia una sesión de entrenamiento.
// Regla: solo 1 sesión activa (finished_at IS NULL) por usuario.
// Si ya hay una activa → 409 Conflict.
router.post("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const parsed = CreateWorkoutSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    // 1. Verificar que no haya sesión activa
    const { data: activeSession, error: activeError } = await supabaseAdmin
      .from("workout_sessions")
      .select("id, routine_name, started_at")
      .eq("user_id", userId)
      .is("finished_at", null)
      .maybeSingle();

    if (activeError) {
      res.status(500).json({ success: false, error: "Database error", details: activeError.message });
      return;
    }

    if (activeSession) {
      res.status(409).json({
        success: false,
        error: "Ya hay una sesión activa",
        hint: "Finalizá o eliminá la sesión activa antes de iniciar otra.",
        details: { active_session_id: activeSession.id },
      });
      return;
    }

    // 2. Crear la sesión
    const { data: createdSession, error: createError } = await supabaseAdmin
      .from("workout_sessions")
      .insert({ ...parsed.data, user_id: userId })
      .select("*")
      .single();

    if (createError) {
      res.status(500).json({ success: false, error: "Database error", details: createError.message });
      return;
    }

    res.status(201).json({
      success: true,
      data: createdSession,
      message: "Workout session started",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── PUT /api/v1/workouts/:id ────────────────────────────────
// Actualiza una sesión (finalizar o cambiar notas).
// Regla: si finished_at ya está seteado, no se puede volver a setear → 409.
router.put("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const parsed = UpdateWorkoutSessionSchema.safeParse(req.body);
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
        hint: "Envía al menos un campo para actualizar.",
      });
      return;
    }

    // 1. Verificar pertenencia
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("workout_sessions")
      .select("id, user_id, finished_at")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: "Workout session not found" });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés modificar sesiones de otro usuario.",
      });
      return;
    }

    // 2. Si intenta setear finished_at sobre una ya finalizada → 409
    if (parsed.data.finished_at !== undefined && existing.finished_at !== null) {
      res.status(409).json({
        success: false,
        error: "Session already finished",
        hint: "No se puede re-finalizar una sesión ya cerrada.",
        details: { finished_at: existing.finished_at },
      });
      return;
    }

    // 3. Actualizar
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("workout_sessions")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      res.status(500).json({ success: false, error: "Database error", details: updateError.message });
      return;
    }

    res.json({ success: true, data: updated, message: "Workout session updated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── DELETE /api/v1/workouts/:id ────────────────────────────
// Elimina una sesión. Los sets se borran por CASCADE.
router.delete("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("workout_sessions")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: "Workout session not found" });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés eliminar sesiones de otro usuario.",
      });
      return;
    }

    const { error: deleteError } = await supabaseAdmin
      .from("workout_sessions")
      .delete()
      .eq("id", id);

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