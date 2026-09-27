import { Router, type Response } from "express";
import { verifyUser, type AuthRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";

const router = Router();

/**
 * GET /api/v1/auth/me
 *
 * Devuelve el perfil del usuario autenticado.
 * Requiere header: Authorization: Bearer <supabase-jwt>
 */
router.get("/me", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User ID not found in token",
      });
      return;
    }

    // Busca el perfil en public.users
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // Si no existe el perfil, puede que el trigger no haya corrido todavía
      if (error.code === "PGRST116") {
        res.status(404).json({
          success: false,
          error: "User profile not found",
          hint: "El perfil se crea automáticamente al registrarse. Si persiste, revisá el trigger handle_new_user.",
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
      data: {
        user: data,
        auth: {
          sub: req.user?.sub,
          email: req.user?.email,
          role: req.user?.role,
        },
      },
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

export default router;