import { Router, type Response } from "express";
import { verifyUser, type AuthRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import {
  measurementCreateSchema,
  type MeasurementCreateInput,
} from "@fitness-trainer/shared";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────

function getUserId(req: AuthRequest, res: Response): string | null {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: "User ID not found in token",
    });
    return null;
  }
  return userId;
}

// ─── POST /api/v1/measurements ───────────────────────────────
// Crea una medida corporal nueva.
// Body: { date, weight_kg, body_fat_pct?, chest_cm?, ... }
// 409 si ya existe una medida en esa fecha para ese usuario.

router.post("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const parsed = measurementCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    const payload: MeasurementCreateInput & { user_id: string } = {
      ...parsed.data,
      user_id: userId,
    };

    const { data, error } = await supabaseAdmin
      .from("body_measurements")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      // UNIQUE(user_id, date) violado
      if (error.code === "23505") {
        res.status(409).json({
          success: false,
          error: "Measurement already exists for this date",
          hint: "Ya hay una medida registrada en esa fecha. Podés editarla con PUT /measurements/:id o eliminarla con DELETE.",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Database error",
        details: error.message,
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: data,
      message: "Measurement created",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: message,
    });
  }
});

// ─── GET /api/v1/measurements ────────────────────────────────
// Lista las medidas del usuario autenticado.
// Query params opcionales:
//   ?limit=N          (default 30, max 365)
//   ?from=YYYY-MM-DD  (fecha mínima, inclusive)
//   ?to=YYYY-MM-DD    (fecha máxima, inclusive)

router.get("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    // Parsear y validar query params
    const limitRaw = req.query.limit;
    const fromRaw = req.query.from;
    const toRaw = req.query.to;

    let limit = 30;
    if (typeof limitRaw === "string") {
      const parsed = Number.parseInt(limitRaw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 365);
      }
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const from =
      typeof fromRaw === "string" && dateRegex.test(fromRaw) ? fromRaw : null;
    const to =
      typeof toRaw === "string" && dateRegex.test(toRaw) ? toRaw : null;

    // Armamos el chain completo ANTES de awaitear.
    // El orden importa: select → filtros → order → limit.
    let query = supabaseAdmin
      .from("body_measurements")
      .select("*")
      .eq("user_id", userId);

    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    query = query.order("date", { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (error) {
      res.status(500).json({
        success: false,
        error: "Database error",
        details: error.message,
      });
      return;
    }

    res.json({
      success: true,
      data: data,
      message: "OK",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: message,
    });
  }
});

// ─── PUT /api/v1/measurements/:id ────────────────────────────
// Actualiza una medida existente (partial update).
// Solo funciona si la medida pertenece al usuario autenticado.

router.put("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const parsed = measurementCreateSchema.partial().safeParse(req.body);

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

    // Verificamos que la medida exista y sea del usuario
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("body_measurements")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({
        success: false,
        error: "Measurement not found",
      });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés modificar medidas de otro usuario.",
      });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("body_measurements")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        res.status(409).json({
          success: false,
          error: "Measurement already exists for this date",
          hint: "Ya hay otra medida en esa fecha.",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Database error",
        details: error.message,
      });
      return;
    }

    res.json({
      success: true,
      data: data,
      message: "Measurement updated",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: message,
    });
  }
});

// ─── DELETE /api/v1/measurements/:id ─────────────────────────
// Elimina una medida existente.
// Solo funciona si la medida pertenece al usuario autenticado.

router.delete("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    // Verificar pertenencia antes de borrar
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("body_measurements")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({
        success: false,
        error: "Measurement not found",
      });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés eliminar medidas de otro usuario.",
      });
      return;
    }

    const { error } = await supabaseAdmin
      .from("body_measurements")
      .delete()
      .eq("id", id);

    if (error) {
      res.status(500).json({
        success: false,
        error: "Database error",
        details: error.message,
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: message,
    });
  }
});

export default router;