import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { env } from "../config/env.js";

/**
 * JWKS remoto de Supabase.
 * Se cachea automáticamente y se refresca cuando Supabase rota las claves.
 */
const JWKS = createRemoteJWKSet(
  new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
);

/**
 * Extiende Request de Express para incluir el usuario autenticado.
 */
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Middleware que verifica el JWT de Supabase.
 *
 * Uso:
 *   router.get("/me", verifyUser, (req, res) => {
 *     const userId = (req as AuthRequest).user?.sub;
 *     ...
 *   });
 */
export async function verifyUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Missing or invalid Authorization header",
    });
    return;
  }

  const token = authHeader.slice(7); // remueve "Bearer "

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      audience: "authenticated",
    });

    (req as AuthRequest).user = payload;
    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid token";

    res.status(401).json({
      success: false,
      error: "Unauthorized",
      details: message,
    });
  }
}