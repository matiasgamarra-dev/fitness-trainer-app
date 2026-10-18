-- ============================================================================
-- Migration: 20261018000004_create_nutrition.sql
-- Sprint: 5 — Nutrición
-- Description: Crea foods, nutrition_goals, meals, meal_items + RLS + triggers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabla: foods
-- Catálogo global de alimentos. Solo lectura (seed por migración).
-- Macros por 100g. serving_g opcional para conversión de porciones.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN (
    'protein', 'dairy', 'carbs', 'fruit', 'vegetable',
    'legume', 'nuts', 'fat', 'processed', 'supplement', 'beverage'
  )),
  kcal_per_100g NUMERIC(6,2) NOT NULL CHECK (kcal_per_100g >= 0 AND kcal_per_100g <= 1000),
  protein_per_100g NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (protein_per_100g >= 0 AND protein_per_100g <= 100),
  carbs_per_100g NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (carbs_per_100g >= 0 AND carbs_per_100g <= 100),
  fat_per_100g NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (fat_per_100g >= 0 AND fat_per_100g <= 100),
  fiber_per_100g NUMERIC(5,2) DEFAULT 0 CHECK (fiber_per_100g >= 0 AND fiber_per_100g <= 100),
  serving_g NUMERIC(6,2) CHECK (serving_g IS NULL OR serving_g > 0),
  serving_name VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Tabla: nutrition_goals
-- Objetivo nutricional del usuario (1:1). El PUT reemplaza el valor.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  daily_kcal NUMERIC(6,2) NOT NULL CHECK (daily_kcal > 0 AND daily_kcal <= 10000),
  protein_g NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (protein_g >= 0 AND protein_g <= 1000),
  carbs_g NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (carbs_g >= 0 AND carbs_g <= 1000),
  fat_g NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (fat_g >= 0 AND fat_g <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT nutrition_goals_user_id_unique UNIQUE (user_id)
);

-- ----------------------------------------------------------------------------
-- Tabla: meals
-- Comidas del usuario por fecha. Una por meal_type por día.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT meals_user_date_type_unique UNIQUE (user_id, date, meal_type)
);

-- ----------------------------------------------------------------------------
-- Tabla: meal_items
-- Items dentro de una comida. Snapshot de macros al momento de agregar.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL,
  food_id UUID,
  food_name VARCHAR(150) NOT NULL,
  quantity_g NUMERIC(6,2) NOT NULL CHECK (quantity_g > 0 AND quantity_g <= 5000),
  kcal NUMERIC(7,2) NOT NULL CHECK (kcal >= 0),
  protein_g NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
  carbs_g NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (carbs_g >= 0),
  fat_g NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (fat_g >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Foreign Keys (ALTER TABLE ADD CONSTRAINT — lección Sprint 4)
-- ============================================================================
ALTER TABLE public.nutrition_goals
  ADD CONSTRAINT nutrition_goals_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.meals
  ADD CONSTRAINT meals_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.meal_items
  ADD CONSTRAINT meal_items_meal_id_fkey
  FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE;

ALTER TABLE public.meal_items
  ADD CONSTRAINT meal_items_food_id_fkey
  FOREIGN KEY (food_id) REFERENCES public.foods(id) ON DELETE SET NULL;

-- ============================================================================
-- Índices
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_foods_category
  ON public.foods(category);

CREATE INDEX IF NOT EXISTS idx_foods_name_search
  ON public.foods(name);

CREATE INDEX IF NOT EXISTS idx_meals_user_date
  ON public.meals(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_meal_items_meal
  ON public.meal_items(meal_id);

CREATE INDEX IF NOT EXISTS idx_meal_items_food
  ON public.meal_items(food_id);

-- ============================================================================
-- Trigger updated_at (reusa handle_updated_at de migración de users)
-- ============================================================================
DROP TRIGGER IF EXISTS trg_nutrition_goals_updated_at ON public.nutrition_goals;
CREATE TRIGGER trg_nutrition_goals_updated_at
  BEFORE UPDATE ON public.nutrition_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_meals_updated_at ON public.meals;
CREATE TRIGGER trg_meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- RLS: foods (solo lectura para authenticated)
-- ============================================================================
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "foods_select_all" ON public.foods;
CREATE POLICY "foods_select_all"
  ON public.foods FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- RLS: nutrition_goals (solo dueño)
-- ============================================================================
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nutrition_goals_select_own" ON public.nutrition_goals;
CREATE POLICY "nutrition_goals_select_own"
  ON public.nutrition_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "nutrition_goals_insert_own" ON public.nutrition_goals;
CREATE POLICY "nutrition_goals_insert_own"
  ON public.nutrition_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "nutrition_goals_update_own" ON public.nutrition_goals;
CREATE POLICY "nutrition_goals_update_own"
  ON public.nutrition_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "nutrition_goals_delete_own" ON public.nutrition_goals;
CREATE POLICY "nutrition_goals_delete_own"
  ON public.nutrition_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS: meals (solo dueño)
-- ============================================================================
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meals_select_own" ON public.meals;
CREATE POLICY "meals_select_own"
  ON public.meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "meals_insert_own" ON public.meals;
CREATE POLICY "meals_insert_own"
  ON public.meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "meals_update_own" ON public.meals;
CREATE POLICY "meals_update_own"
  ON public.meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "meals_delete_own" ON public.meals;
CREATE POLICY "meals_delete_own"
  ON public.meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS: meal_items (solo dueño, vía join con meals)
-- ============================================================================
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meal_items_select_own" ON public.meal_items;
CREATE POLICY "meal_items_select_own"
  ON public.meal_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.meals m
    WHERE m.id = meal_items.meal_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "meal_items_insert_own" ON public.meal_items;
CREATE POLICY "meal_items_insert_own"
  ON public.meal_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.meals m
    WHERE m.id = meal_items.meal_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "meal_items_update_own" ON public.meal_items;
CREATE POLICY "meal_items_update_own"
  ON public.meal_items FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.meals m
    WHERE m.id = meal_items.meal_id AND m.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.meals m
    WHERE m.id = meal_items.meal_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "meal_items_delete_own" ON public.meal_items;
CREATE POLICY "meal_items_delete_own"
  ON public.meal_items FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.meals m
    WHERE m.id = meal_items.meal_id AND m.user_id = auth.uid()
  ));
