-- ============================================================
-- Migration: 20260927000002_users_rls_policies
-- Sprint 1 — Autenticación
--
-- Habilita Row Level Security en public.users y define que
-- cada usuario solo puede ver y editar su propio perfil.
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- SELECT: solo tu propio perfil
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- INSERT: solo podés crear tu propio perfil
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: solo tu propio perfil
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: sin política (nadie borra perfiles vía API)
