-- ============================================================
-- Migration: 20260927000001_create_users_table
-- Sprint 1 — Autenticación
--
-- Crea la tabla pública de perfiles de usuario, espejo de auth.users.
-- El id es el mismo UUID que genera Supabase Auth.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  birth_date DATE,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  height_cm NUMERIC(5,2) CHECK (height_cm > 0 AND height_cm < 300),
  goal TEXT CHECK (goal IN ('lose_fat', 'gain_muscle', 'maintain')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
