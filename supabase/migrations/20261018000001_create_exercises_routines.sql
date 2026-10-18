-- ============================================================
-- Migration: 20261018000001_create_exercises_routines
-- Sprint 3 - Rutinas
--
-- Crea:
--   - public.exercises         (catálogo global, solo lectura)
--   - public.routines          (rutinas por usuario)
--   - public.routine_exercises (ejercicios asignados a rutina por dia)
-- ============================================================

-- â”€â”€â”€ exercises (catálogo global) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  muscle_group TEXT NOT NULL CHECK (muscle_group IN (
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'legs', 'glutes', 'core', 'cardio', 'full_body'
  )),
  equipment TEXT NOT NULL CHECK (equipment IN (
    'barbell', 'dumbbell', 'machine', 'cable',
    'bodyweight', 'kettlebell', 'band', 'other'
  )),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.exercises IS 'catálogo global de ejercicios. Solo lectura.';

-- â”€â”€â”€ routines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  days_per_week INT NOT NULL CHECK (days_per_week >= 1 AND days_per_week <= 7),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.routines IS 'Rutinas de entrenamiento por usuario.';

-- â”€â”€â”€ routine_exercises â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  day_of_week INT NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  order_index INT NOT NULL CHECK (order_index >= 0),
  sets INT NOT NULL CHECK (sets >= 1 AND sets <= 20),
  reps VARCHAR(20) NOT NULL,
  rest_seconds INT NOT NULL DEFAULT 60 CHECK (rest_seconds >= 0 AND rest_seconds <= 600),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.routine_exercises IS 'Ejercicios asignados a una rutina, agrupados por dia.';

-- â”€â”€â”€ Indices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_user_active ON public.routines(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine ON public.routine_exercises(routine_id, day_of_week, order_index);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_exercise ON public.routine_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON public.exercises(muscle_group);

-- â”€â”€â”€ RLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

-- exercises: todos leen, nadie escribe desde la API
CREATE POLICY "exercises_select_all" ON public.exercises
  FOR SELECT USING (true);

-- routines: solo el dueño
CREATE POLICY "routines_select_own" ON public.routines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "routines_insert_own" ON public.routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "routines_update_own" ON public.routines
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "routines_delete_own" ON public.routines
  FOR DELETE USING (auth.uid() = user_id);

-- routine_exercises: solo el dueño de la rutina
CREATE POLICY "routine_exercises_select_own" ON public.routine_exercises
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_exercises.routine_id AND r.user_id = auth.uid())
  );
CREATE POLICY "routine_exercises_insert_own" ON public.routine_exercises
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_exercises.routine_id AND r.user_id = auth.uid())
  );
CREATE POLICY "routine_exercises_update_own" ON public.routine_exercises
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_exercises.routine_id AND r.user_id = auth.uid())
  );
CREATE POLICY "routine_exercises_delete_own" ON public.routine_exercises
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_exercises.routine_id AND r.user_id = auth.uid())
  );

-- â”€â”€â”€ Trigger updated_at para routines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TRIGGER trg_routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();