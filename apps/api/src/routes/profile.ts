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
 *
 * Reglas:
 *   - `name` es editable siempre.
 *   - `birth_date`, `sex`, `height_cm`, `goal`, `days_per_week` son writeOnce:
 *     si ya tienen valor en DB, no se pueden cambiar vía API.
 *     Contactar al admin para modificarlos.
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

    // Obtener el perfil actual para verificar campos bloqueados
    const { data: current, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("name, birth_date, sex, height_cm, goal, days_per_week")
      .eq("id", userId)
      .single();

    if (fetchError || !current) {
      res.status(404).json({
        success: false,
        error: "Profile not found",
      });
      return;
    }

    // Campos writeOnce: una vez seteados, no se pueden cambiar
    const writeOnceFields = ["birth_date", "sex", "height_cm", "goal", "days_per_week"] as const;
    const blockedFields: string[] = [];

    for (const field of writeOnceFields) {
      const newValue = parsed.data[field];
      const currentValue = current[field];

      // Si el campo ya tiene valor Y se intenta cambiar a otro distinto → bloqueado
      if (
        newValue !== undefined &&
        currentValue !== null &&
        currentValue !== newValue
      ) {
        blockedFields.push(field);
      }
    }

    if (blockedFields.length > 0) {
      res.status(403).json({
        success: false,
        error: "Profile fields are locked",
        details: {
          locked_fields: blockedFields,
          hint: "Estos datos se completan una sola vez. Contactá al administrador para modificarlos.",
        },
      });
      return;
    }

    // Filtrar los campos bloqueados del payload
    // (si el valor es igual al actual, lo dejamos pasar sin problema;
    //  si está en null, permitimos la escritura inicial)
    const payload: Record<string, unknown> = { ...parsed.data };

    // Actualizar en DB
    const { data, error } = await supabaseAdmin
      .from("users")
      .update(payload)
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