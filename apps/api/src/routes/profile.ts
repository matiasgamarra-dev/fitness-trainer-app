import { Router, type Response } from "express";
import { verifyUser, type AuthRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import { profileUpdateSchema } from "@fitness-trainer/shared";

const router = Router();

/**
 * GET /api/v1/profile
 *
 * Devuelve el perfil del usuario autenticado (sin el objeto `auth`).
 * Requiere header: Authorization: Bearer <supabase-jwt>
 */
router.get("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User ID not found in token",
      });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        res.status(404).json({
          success: false,
          error: "Profile not found",
          hint: "El perfil se crea automáticamente al registrarse.",
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

/**
 * PUT /api/v1/profile
 *
 * Actualiza parcialmente el perfil del usuario autenticado.
 * Solo se modifican los campos enviados en el body.
 *
 * Body (todos opcionales):
 *   name       string
 *   birth_date string (YYYY-MM-DD)
 *   sex        "male" | "female" | "other"
 *   height_cm  number
 *   goal       "lose_fat" | "gain_muscle" | "maintain"
 */
router.put("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User ID not found in token",
      });
      return;
    }

    // Validar body
    const parsed = profileUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    // No permitir body vacío
    if (Object.keys(parsed.data).length === 0) {
      res.status(400).json({
        success: false,
        error: "Empty body",
        hint: "Enviá al menos un campo para actualizar.",
      });
      return;
    }

    // Actualizar en DB
    const { data, error } = await supabaseAdmin
      .from("users")
      .update(parsed.data)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        res.status(404).json({
          success: false,
          error: "Profile not found",
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
      message: "Profile updated",
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

export default router;