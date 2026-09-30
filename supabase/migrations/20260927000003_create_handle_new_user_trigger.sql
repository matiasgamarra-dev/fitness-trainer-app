-- ============================================================
-- Migration: 20260927000003_create_handle_new_user_trigger
-- Sprint 1 — Autenticación
--
-- Crea los triggers:
--   1. handle_new_user: al registrarse en auth.users, inserta
--      automáticamente un registro en public.users.
--   2. handle_updated_at: actualiza updated_at en cada UPDATE
--      de public.users.
-- ============================================================

-- ─── Trigger: crear perfil al registrarse ────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── Trigger: actualizar updated_at en users ─────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
