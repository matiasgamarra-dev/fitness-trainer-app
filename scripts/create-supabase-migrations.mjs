// scripts/create-supabase-migrations.mjs
// Crea la estructura supabase/migrations/ con migraciones retroactivas.
// Ejecutar: node scripts\create-supabase-migrations.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = join(import.meta.dirname, "..");
const migrationsDir = join(root, "supabase", "migrations");

// ──────────────────────────────────────────────────────────────
// Migración 1: tabla users
// ──────────────────────────────────────────────────────────────
const migration01 = `-- ============================================================
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
`;

// ──────────────────────────────────────────────────────────────
// Migración 2: RLS en users
// ──────────────────────────────────────────────────────────────
const migration02 = `-- ============================================================
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
`;

// ──────────────────────────────────────────────────────────────
// Migración 3: trigger handle_new_user + updated_at
// ──────────────────────────────────────────────────────────────
const migration03 = `-- ============================================================
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
`;

// ──────────────────────────────────────────────────────────────
// Migración 4: body_measurements (Sprint 2)
// ──────────────────────────────────────────────────────────────
const migration04 = `-- ============================================================
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
`;

// ──────────────────────────────────────────────────────────────
// README de supabase/
// ──────────────────────────────────────────────────────────────
const supabaseReadme = `# 🗄️ Supabase — Migraciones

Este directorio contiene las **migraciones SQL versionadas** del proyecto.

## Regla de oro

> **NUNCA ejecutar SQL directamente en el SQL Editor de Supabase para cambios de schema.**

Todo cambio de schema debe:

1. Escribirse como archivo \`.sql\` en \`supabase/migrations/\`
2. Commitearse a Git
3. Ejecutarse en Supabase (SQL Editor o CLI)
4. Verificarse

## Estructura

\`\`\`
supabase/
└── migrations/
    ├── 20260927000001_create_users_table.sql
    ├── 20260927000002_users_rls_policies.sql
    ├── 20260927000003_create_handle_new_user_trigger.sql
    └── 20260929000001_create_body_measurements.sql
\`\`\`

## Convención de nombres

\`YYYYMMDDHHMMSS_descripcion_corta.sql\`

Ejemplo: \`20260929000001_create_body_measurements.sql\`

## Cómo aplicar una migración

### Opción A — SQL Editor (manual)

1. Abrir Supabase Dashboard → SQL Editor
2. Pegar el contenido del archivo \`.sql\`
3. Ejecutar
4. Verificar en Table Editor

### Opción B — Supabase CLI (recomendado a futuro)

\`\`\`cmd
supabase db push
\`\`\`

Requiere tener Supabase CLI instalado y el proyecto linkeado.

## Estado actual

| Migración | Sprint | Estado |
|---|---|---|
| create_users_table | 1 | ✅ Aplicada |
| users_rls_policies | 1 | ✅ Aplicada |
| create_handle_new_user_trigger | 1 | ✅ Aplicada |
| create_body_measurements | 2 | ✅ Aplicada |

## Referencias

- [docs/DATABASE.md](../docs/DATABASE.md) — Documentación detallada
- [docs/DATA_MODEL.md](../docs/DATA_MODEL.md) — Modelo lógico
- [docs/SECURITY.md](../docs/SECURITY.md) — Políticas de seguridad
`;

// ──────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────
const files = {
  [join(migrationsDir, "20260927000001_create_users_table.sql")]: migration01,
  [join(migrationsDir, "20260927000002_users_rls_policies.sql")]: migration02,
  [join(migrationsDir, "20260927000003_create_handle_new_user_trigger.sql")]: migration03,
  [join(migrationsDir, "20260929000001_create_body_measurements.sql")]: migration04,
  [join(root, "supabase", "README.md")]: supabaseReadme,
};

async function main() {
  console.log("📦 Creando migraciones de Supabase...\n");

  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf8");
    const rel = path.replace(root + "\\", "").replace(root + "/", "");
    console.log(`   ✅ ${rel}`);
  }

  console.log("\n🎉 Listo. Archivos creados en supabase/");
  console.log("\n⚠️  IMPORTANTE:");
  console.log("   Las migraciones de Sprint 1 (users) YA ESTÁN aplicadas en Supabase.");
  console.log("   NO las vuelvas a ejecutar — son retroactivas, solo para versionar.");
  console.log("   La de body_measurements también ya está aplicada.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});