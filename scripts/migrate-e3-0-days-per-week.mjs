#!/usr/bin/env node
/**
 * E.3.0 — Agrega days_per_week al schema users + shared + backend.
 *
 * Idempotente: si un archivo ya tiene el cambio, lo saltea.
 *
 * Uso:
 *   node scripts\migrate-e3-0-days-per-week.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  ok: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  skip: (msg) => console.log(`⏭️  ${msg}`),
};

function read(path) {
  return readFileSync(path, "utf8");
}

function write(path, content) {
  writeFileSync(path, content, "utf8");
}

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

// ─────────────────────────────────────────────────────────────
// 1. Migración SQL
// ─────────────────────────────────────────────────────────────

const migrationDir = resolve(ROOT, "supabase/migrations");
const migrationFile = resolve(
  migrationDir,
  "20260930000001_add_days_per_week_to_users.sql",
);

const migrationSql = `-- ============================================================
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
`;

if (existsSync(migrationFile)) {
  log.skip(`Migración ya existe: ${migrationFile}`);
} else {
  ensureDir(migrationDir);
  write(migrationFile, migrationSql);
  log.ok(`Migración creada: supabase/migrations/20260930000001_add_days_per_week_to_users.sql`);
}

// ─────────────────────────────────────────────────────────────
// 2. packages/shared/src/schemas/profile.ts
// ─────────────────────────────────────────────────────────────

const sharedProfilePath = resolve(
  ROOT,
  "packages/shared/src/schemas/profile.ts",
);

if (!existsSync(sharedProfilePath)) {
  log.warn(`No existe: ${sharedProfilePath}`);
} else {
  let content = read(sharedProfilePath);
  if (content.includes("days_per_week")) {
    log.skip("shared/profile.ts ya tiene days_per_week");
  } else {
    // Insertar days_per_week después de goal (mismo bloque, antes del cierre)
    const anchor = `  goal: goalSchema.optional(),`;
    if (!content.includes(anchor)) {
      log.warn("No encontré el anchor 'goal: goalSchema.optional()' en shared/profile.ts");
    } else {
      content = content.replace(
        anchor,
        `${anchor}\n  days_per_week: z.number().int().min(1).max(7).optional(),`,
      );
      write(sharedProfilePath, content);
      log.ok("Actualizado packages/shared/src/schemas/profile.ts");
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 3. apps/web/src/hooks/useProfile.ts
// ─────────────────────────────────────────────────────────────

const webProfilePath = resolve(ROOT, "apps/web/src/hooks/useProfile.ts");

if (!existsSync(webProfilePath)) {
  log.warn(`No existe: ${webProfilePath}`);
} else {
  let content = read(webProfilePath);
  if (content.includes("days_per_week")) {
    log.skip("useProfile.ts ya tiene days_per_week");
  } else {
    const anchor = `  goal: "lose_fat" | "gain_muscle" | "maintain" | null;`;
    if (!content.includes(anchor)) {
      log.warn("No encontré el anchor 'goal: ... | null;' en useProfile.ts");
    } else {
      content = content.replace(
        anchor,
        `${anchor}\n  days_per_week: number | null;`,
      );
      write(webProfilePath, content);
      log.ok("Actualizado apps/web/src/hooks/useProfile.ts");
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 4. apps/api/src/routes/profile.ts
// ─────────────────────────────────────────────────────────────

const apiProfilePath = resolve(ROOT, "apps/api/src/routes/profile.ts");

if (!existsSync(apiProfilePath)) {
  log.warn(`No existe: ${apiProfilePath}`);
} else {
  let content = read(apiProfilePath);
  if (content.includes("days_per_week")) {
    log.skip("apps/api/src/routes/profile.ts ya tiene days_per_week");
  } else {
    let changes = 0;

    // a) SELECT: agregar days_per_week
    const selectOld = `.select("name, birth_date, sex, height_cm, goal")`;
    const selectNew = `.select("name, birth_date, sex, height_cm, goal, days_per_week")`;
    if (content.includes(selectOld)) {
      content = content.replace(selectOld, selectNew);
      changes++;
    } else {
      log.warn("No encontré el SELECT en profile.ts");
    }

    // b) writeOnceFields: agregar days_per_week
    const writeOnceOld = `const writeOnceFields = ["birth_date", "sex", "height_cm", "goal"] as const;`;
    const writeOnceNew = `const writeOnceFields = ["birth_date", "sex", "height_cm", "goal", "days_per_week"] as const;`;
    if (content.includes(writeOnceOld)) {
      content = content.replace(writeOnceOld, writeOnceNew);
      changes++;
    } else {
      log.warn("No encontré writeOnceFields en profile.ts");
    }

    // c) Comentario JSDoc del PUT
    const jsdocOld = ` *   - \`birth_date\`, \`sex\`, \`height_cm\`, \`goal\` son writeOnce:`;
    const jsdocNew = ` *   - \`birth_date\`, \`sex\`, \`height_cm\`, \`goal\`, \`days_per_week\` son writeOnce:`;
    if (content.includes(jsdocOld)) {
      content = content.replace(jsdocOld, jsdocNew);
      changes++;
    } else {
      log.warn("No encontré el comentario JSDoc del PUT en profile.ts");
    }

    if (changes > 0) {
      write(apiProfilePath, content);
      log.ok(`Actualizado apps/api/src/routes/profile.ts (${changes} cambios)`);
    }
  }
}

console.log("\n🎉 E.3.0 completado. Recordá aplicar la migración en Supabase SQL Editor.");