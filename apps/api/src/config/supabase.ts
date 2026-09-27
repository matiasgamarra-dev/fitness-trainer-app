import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Cliente Supabase para el backend.
 *
 * Usa la SERVICE_ROLE_KEY para bypassar RLS (necesario para operaciones admin
 * como sync, validaciones cross-user, etc.).
 *
 * ⚠️ NUNCA exponer este cliente al frontend.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Cliente Supabase "público" (con ANON_KEY).
 *
 * Respeta RLS. Se usa cuando el backend actúa "en nombre del usuario".
 */
export const supabasePublic = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);