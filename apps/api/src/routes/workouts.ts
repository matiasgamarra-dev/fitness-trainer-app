import { Router, type Response } from "express";
import { verifyUser, type AuthRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import {
  CreateWorkoutSessionSchema,
  UpdateWorkoutSessionSchema,
  LogWorkoutSetSchema,
  UpdateWorkoutSetSchema,
} from "@fitness-trainer/shared";

const router = Router();

const MAX_SETS_PER_EXERCISE = 20;

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

// ─── GET /api/v1/workouts/stats ─────────────────────────────
// IMPORTANTE: debe ir ANTES de GET /:id para que Express no matchee "stats" como id.
router.get("/stats", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    // 1. Sesiones del user (para total_sessions, streak y last_session)
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("workout_sessions")
      .select("id, routine_name, finished_at")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (sessionsError) {
      res.status(500).json({ success: false, error: "Database error", details: sessionsError.message });
      return;
    }

    const allSessions = sessions ?? [];
    const finishedSessions = allSessions.filter((s) => s.finished_at !== null);

    // 2. Sets del user (JOIN via session_ids)
    const sessionIds = allSessions.map((s) => s.id);
    let totalSets = 0;
    let totalVolume = 0;

    if (sessionIds.length > 0) {
      const { data: sets, error: setsError } = await supabaseAdmin
        .from("workout_sets")
        .select("weight_kg, reps, is_warmup")
        .in("session_id", sessionIds);

      if (setsError) {
        res.status(500).json({ success: false, error: "Database error", details: setsError.message });
        return;
      }

      totalSets = (sets ?? []).length;

      totalVolume = (sets ?? [])
        .filter((s) => !s.is_warmup && s.weight_kg !== null)
        .reduce((acc, s) => acc + Number(s.weight_kg) * s.reps, 0);
    }

    // 3. Streak (Duolingo-style: días consecutivos con al menos una sesión terminada,
    //    empezando por hoy. Si hoy no entrenaste, streak = 0.)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 365);

    const daySet = new Set<string>();
    for (const s of finishedSessions) {
      if (!s.finished_at) continue;
      const d = new Date(s.finished_at);
      if (d < cutoff) continue;
      daySet.add(d.toISOString().slice(0, 10));
    }

    let streak = 0;
    const cursor = new Date();
    // Normalizar a medianoche UTC para comparar solo fechas
    cursor.setUTCHours(0, 0, 0, 0);

    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!daySet.has(key)) break;
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    // 4. last_session: sesión terminada más reciente (por finished_at)
    const lastFinished = finishedSessions
      .filter((s) => s.finished_at !== null)
      .sort((a, b) => new Date(b.finished_at!).getTime() - new Date(a.finished_at!).getTime())[0];

    res.json({
      success: true,
      data: {
        total_sessions: allSessions.length,
        total_sets: totalSets,
        total_volume_kg: Math.round(totalVolume * 100) / 100,
        current_streak_days: streak,
        last_session: lastFinished
          ? {
              id: lastFinished.id,
              routine_name: lastFinished.routine_name,
              finished_at: lastFinished.finished_at,
            }
          : null,
      },
      message: "OK",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── GET /api/v1/workouts/:id ────────────────────────────────
// Detalle de una sesión con sets embebidos + info del ejercicio en cada set.
router.get("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    // 1. Sesión (verificando pertenencia)
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

    // 2. Sets con join a exercises
    const { data: sets, error: setsError } = await supabaseAdmin
      .from("workout_sets")
      .select("*, exercise:exercises(id, name, muscle_group, equipment)")
      .eq("session_id", id)
      .order("exercise_id", { ascending: true })
      .order("set_number", { ascending: true });

    if (setsError) {
      res.status(500).json({ success: false, error: "Database error", details: setsError.message });
      return;
    }

    res.json({
      success: true,
      data: { ...session, sets: sets ?? [] },
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

    if (parsed.data.finished_at !== undefined && existing.finished_at !== null) {
      res.status(409).json({
        success: false,
        error: "Session already finished",
        hint: "No se puede re-finalizar una sesión ya cerrada.",
        details: { finished_at: existing.finished_at },
      });
      return;
    }

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

// ─── POST /api/v1/workouts/:id/sets ─────────────────────────
// Registra una serie. El set_number lo calcula el backend (MAX + 1 por ejercicio).
router.post("/:id/sets", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const parsed = LogWorkoutSetSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    // 1. Verificar que la sesión exista y sea del user
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("workout_sessions")
      .select("id, user_id, finished_at")
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      res.status(404).json({ success: false, error: "Workout session not found" });
      return;
    }

    if (session.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés modificar sesiones de otro usuario.",
      });
      return;
    }

    if (session.finished_at !== null) {
      res.status(409).json({
        success: false,
        error: "Session already finished",
        hint: "No se pueden agregar series a una sesión finalizada.",
      });
      return;
    }

    // 2. Calcular set_number = MAX + 1
    const { data: maxRow, error: maxError } = await supabaseAdmin
      .from("workout_sets")
      .select("set_number")
      .eq("session_id", id)
      .eq("exercise_id", parsed.data.exercise_id)
      .order("set_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxError) {
      res.status(500).json({ success: false, error: "Database error", details: maxError.message });
      return;
    }

    const nextSetNumber = (maxRow?.set_number ?? 0) + 1;

    if (nextSetNumber > MAX_SETS_PER_EXERCISE) {
      res.status(400).json({
        success: false,
        error: "Too many sets",
        hint: `Máximo ${MAX_SETS_PER_EXERCISE} series por ejercicio.`,
      });
      return;
    }

    // 3. Insertar el set
    const { data: created, error: createError } = await supabaseAdmin
      .from("workout_sets")
      .insert({
        session_id: id,
        exercise_id: parsed.data.exercise_id,
        set_number: nextSetNumber,
        weight_kg: parsed.data.weight_kg,
        reps: parsed.data.reps,
        rpe: parsed.data.rpe ?? null,
        is_warmup: parsed.data.is_warmup ?? false,
        notes: parsed.data.notes ?? null,
      })
      .select("*, exercise:exercises(id, name, muscle_group, equipment)")
      .single();

    if (createError) {
      res.status(500).json({ success: false, error: "Database error", details: createError.message });
      return;
    }

    res.status(201).json({
      success: true,
      data: created,
      message: "Set logged",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── PUT /api/v1/workouts/:id/sets/:setId ───────────────────
// Edita una serie existente.
router.put("/:id/sets/:setId", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id, setId } = req.params;

    const parsed = UpdateWorkoutSetSchema.safeParse(req.body);
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

    // 1. Verificar que el set existe, pertenece a la sesión y la sesión es del user
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("workout_sets")
      .select("id, session_id, workout_sessions!inner(user_id)")
      .eq("id", setId)
      .eq("session_id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: "Workout set not found" });
      return;
    }

    type SetWithSession = { workout_sessions: { user_id: string } };
    const sessionUserId = (existing as unknown as SetWithSession).workout_sessions.user_id;

    if (sessionUserId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés modificar series de otro usuario.",
      });
      return;
    }

    // 2. Actualizar
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("workout_sets")
      .update(parsed.data)
      .eq("id", setId)
      .select("*, exercise:exercises(id, name, muscle_group, equipment)")
      .single();

    if (updateError) {
      res.status(500).json({ success: false, error: "Database error", details: updateError.message });
      return;
    }

    res.json({ success: true, data: updated, message: "Set updated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: "Internal server error", details: message });
  }
});

// ─── DELETE /api/v1/workouts/:id/sets/:setId ────────────────
// Elimina una serie.
router.delete("/:id/sets/:setId", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id, setId } = req.params;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("workout_sets")
      .select("id, session_id, workout_sessions!inner(user_id)")
      .eq("id", setId)
      .eq("session_id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: "Workout set not found" });
      return;
    }

    type SetWithSession = { workout_sessions: { user_id: string } };
    const sessionUserId = (existing as unknown as SetWithSession).workout_sessions.user_id;

    if (sessionUserId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés eliminar series de otro usuario.",
      });
      return;
    }

    const { error: deleteError } = await supabaseAdmin
      .from("workout_sets")
      .delete()
      .eq("id", setId);

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