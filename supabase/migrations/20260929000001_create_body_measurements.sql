-- ============================================================
-- Migration: 20260929000001_create_body_measurements
-- Sprint 2 — Perfil y Onboarding
--
-- Registro de medidas corporales por usuario.
-- Incluye: peso, % grasa, 10 medidas corporales y notas.
-- Un solo registro por usuario por día.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Peso (obligatorio)
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),

  -- Composición corporal
  body_fat_pct NUMERIC(4,1) CHECK (body_fat_pct >= 0 AND body_fat_pct <= 100),

  -- Medidas (todas opcionales)
  chest_cm     NUMERIC(5,1) CHECK (chest_cm > 0 AND chest_cm < 300),
  waist_cm     NUMERIC(5,1) CHECK (waist_cm > 0 AND waist_cm < 300),
  hip_cm       NUMERIC(5,1) CHECK (hip_cm > 0 AND hip_cm < 300),
  neck_cm      NUMERIC(5,1) CHECK (neck_cm > 0 AND neck_cm < 100),
  arm_cm       NUMERIC(5,1) CHECK (arm_cm > 0 AND arm_cm < 100),
  forearm_cm   NUMERIC(5,1) CHECK (forearm_cm > 0 AND forearm_cm < 100),
  thigh_cm     NUMERIC(5,1) CHECK (thigh_cm > 0 AND thigh_cm < 150),
  calf_cm      NUMERIC(5,1) CHECK (calf_cm > 0 AND calf_cm < 100),
  shoulder_cm  NUMERIC(5,1) CHECK (shoulder_cm > 0 AND shoulder_cm < 200),

  -- Notas
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un solo registro por usuario por día
  CONSTRAINT body_measurements_user_date_unique UNIQUE (user_id, date)
);

-- ─── Índices ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date
  ON public.body_measurements (user_id, date DESC);

-- ─── Row Level Security ──────────────────────────────────────

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own measurements"
  ON public.body_measurements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements"
  ON public.body_measurements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements"
  ON public.body_measurements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements"
  ON public.body_measurements
  FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Trigger: updated_at automático ──────────────────────────

CREATE OR REPLACE FUNCTION public.handle_body_measurements_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_body_measurements_updated_at ON public.body_measurements;

CREATE TRIGGER trg_body_measurements_updated_at
  BEFORE UPDATE ON public.body_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_body_measurements_updated_at();
