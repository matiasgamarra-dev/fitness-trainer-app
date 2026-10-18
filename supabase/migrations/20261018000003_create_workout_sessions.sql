-- ============================================================================
-- Migración: create_workout_sessions
-- Sprint: 4 — Entrenamiento activo
-- Crea: workout_sessions, workout_sets
--       + FKs (ALTER TABLE) + índices + RLS + trigger updated_at
--
-- Nota: las FKs se agregan con ALTER TABLE ADD CONSTRAINT (no inline).
--       Ver docs/DATABASE.md — sección "Convenciones de migración".
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) workout_sessions (sin FKs inline)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL,
  routine_id     UUID,
  routine_name   VARCHAR(100) NOT NULL,
  day_of_week    INT CHECK (day_of_week IS NULL OR (day_of_week BETWEEN 1 AND 7)),
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at    TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.workout_sessions             IS 'Sesiones de entrenamiento (una por vez activa por usuario)';
COMMENT ON COLUMN public.workout_sessions.routine_id  IS 'NULL si la rutina fue borrada; historial se preserva';
COMMENT ON COLUMN public.workout_sessions.finished_at IS 'NULL = sesión activa sin terminar';

-- ----------------------------------------------------------------------------
-- 2) workout_sets (sin FKs inline)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL,
  exercise_id    UUID NOT NULL,
  set_number     INT NOT NULL CHECK (set_number >= 1),
  weight_kg      NUMERIC(6,2) CHECK (weight_kg IS NULL OR weight_kg >= 0),
  reps           INT NOT NULL CHECK (reps >= 1),
  rpe            NUMERIC(3,1) CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10)),
  is_warmup      BOOLEAN NOT NULL DEFAULT false,
  completed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes          TEXT,
  CONSTRAINT workout_sets_unique_set UNIQUE (session_id, exercise_id, set_number)
);

COMMENT ON TABLE  public.workout_sets           IS 'Series registradas dentro de una sesión';
COMMENT ON COLUMN public.workout_sets.weight_kg IS 'NULL = peso corporal / no aplica';
COMMENT ON COLUMN public.workout_sets.rpe       IS 'Esfuerzo percibido 1-10 (opcional)';

-- ----------------------------------------------------------------------------
-- 3) Foreign keys (ALTER TABLE — mejor práctica Supabase)
-- ----------------------------------------------------------------------------
ALTER TABLE public.workout_sessions
  ADD CONSTRAINT workout_sessions_user_fk
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.workout_sessions
  ADD CONSTRAINT workout_sessions_routine_fk
  FOREIGN KEY (routine_id) REFERENCES public.routines(id) ON DELETE SET NULL;

ALTER TABLE public.workout_sets
  ADD CONSTRAINT workout_sets_session_fk
  FOREIGN KEY (session_id) REFERENCES public.workout_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.workout_sets
  ADD CONSTRAINT workout_sets_exercise_fk
  FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE RESTRICT;

-- ----------------------------------------------------------------------------
-- 4) Índices
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_started
  ON public.workout_sessions (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_active
  ON public.workout_sessions (user_id)
  WHERE finished_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_workout_sets_session
  ON public.workout_sets (session_id, exercise_id, set_number);

CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise
  ON public.workout_sets (exercise_id);

-- ----------------------------------------------------------------------------
-- 5) Trigger updated_at en workout_sessions
--    Reutiliza handle_updated_at() creada en migración 20260927000003
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_workout_sessions_updated_at ON public.workout_sessions;
CREATE TRIGGER trg_workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6) RLS — workout_sessions
-- ----------------------------------------------------------------------------
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own workout_sessions" ON public.workout_sessions;
CREATE POLICY "Users can select own workout_sessions"
  ON public.workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workout_sessions" ON public.workout_sessions;
CREATE POLICY "Users can insert own workout_sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workout_sessions" ON public.workout_sessions;
CREATE POLICY "Users can update own workout_sessions"
  ON public.workout_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workout_sessions" ON public.workout_sessions;
CREATE POLICY "Users can delete own workout_sessions"
  ON public.workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 7) RLS — workout_sets (vía sesión padre)
-- ----------------------------------------------------------------------------
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own workout_sets" ON public.workout_sets;
CREATE POLICY "Users can select own workout_sets"
  ON public.workout_sets FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = workout_sets.session_id AND ws.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own workout_sets" ON public.workout_sets;
CREATE POLICY "Users can insert own workout_sets"
  ON public.workout_sets FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = workout_sets.session_id AND ws.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own workout_sets" ON public.workout_sets;
CREATE POLICY "Users can update own workout_sets"
  ON public.workout_sets FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = workout_sets.session_id AND ws.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = workout_sets.session_id AND ws.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own workout_sets" ON public.workout_sets;
CREATE POLICY "Users can delete own workout_sets"
  ON public.workout_sets FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.workout_sessions ws
            WHERE ws.id = workout_sets.session_id AND ws.user_id = auth.uid())
  );

-- ============================================================================
-- Fin de migración
-- ============================================================================