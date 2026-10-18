import { Router, type Response } from "express";
import { verifyUser, type AuthRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import {
  muscleGroupSchema,
  equipmentSchema,
  type MuscleGroup,
  type Equipment,
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

/**
 * GET /api/v1/exercises
 *
 * Lista el catalogo global de ejercicios.
 * Query params opcionales:
 *   ?muscle_group=chest
 *   ?equipment=barbell
 *
 * Los ejercicios son de solo lectura (seed por migracion).
 */
router.get("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const muscleGroupRaw = req.query.muscle_group;
    const equipmentRaw = req.query.equipment;

    const muscleGroup =
      typeof muscleGroupRaw === "string"
        ? muscleGroupSchema.safeParse(muscleGroupRaw)
        : null;
    const equipment =
      typeof equipmentRaw === "string"
        ? equipmentSchema.safeParse(equipmentRaw)
        : null;

    if (muscleGroup && !muscleGroup.success) {
      res.status(400).json({
        success: false,
        error: "Invalid muscle_group",
        details: muscleGroup.error.flatten(),
      });
      return;
    }

    if (equipment && !equipment.success) {
      res.status(400).json({
        success: false,
        error: "Invalid equipment",
        details: equipment.error.flatten(),
      });
      return;
    }

    let query = supabaseAdmin.from("exercises").select("*");

    if (muscleGroup?.success) {
      query = query.eq("muscle_group", muscleGroup.data as MuscleGroup);
    }
    if (equipment?.success) {
      query = query.eq("equipment", equipment.data as Equipment);
    }

    query = query.order("muscle_group", { ascending: true }).order("name", { ascending: true });

    const { data, error } = await query;

    if (error) {
      res.status(500).json({
        success: false,
        error: "Database error",
        details: error.message,
      });
      return;
    }

    res.json({ success: true, data, message: "OK" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: message,
    });
  }
});

export default router;