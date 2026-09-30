-- ============================================================
-- Migration: 20260930000001_add_days_per_week_to_users
-- Sprint 2 — Perfil y Onboarding
--
-- Agrega days_per_week (frecuencia semanal de entrenamiento, 1-7).
-- Se completa durante el onboarding y queda bloqueado (writeOnce).
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS days_per_week INT
  CHECK (days_per_week IS NULL OR (days_per_week >= 1 AND days_per_week <= 7));

COMMENT ON COLUMN public.users.days_per_week IS
  'Frecuencia semanal de entrenamiento declarada en el onboarding (1-7). writeOnce.';
