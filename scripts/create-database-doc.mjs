#!/usr/bin/env node
// scripts/create-database-doc.mjs
// Crea docs/DATABASE.md a partir de las migraciones.
// Ejecutar: node scripts\create-database-doc.mjs
//      o: npm run docs -- db
//
// IMPORTANTE: Este script es la ÚNICA forma de crear/modificar este doc.
// No editar docs/DATABASE.md a mano.
//
// Cómo agregar una migración nueva:
//   1. Crear el .sql en supabase/migrations/
//   2. Agregar su entrada a META (abajo)
//   3. Si toca una tabla, actualizar la sección "Tablas" del template
//   4. Correr: node scripts\create-database-doc.mjs

import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const migrationsDir = join(root, "supabase", "migrations");
const docsDir = join(root, "docs");

// ─────────────────────────────────────────────────────────────
// META: metadata por migración
// ─────────────────────────────────────────────────────────────

const META = {
  "20260927000001_create_users_table.sql": {
    sprint: 1,
    description: "Crea `public.users` (perfil espejo de `auth.users`)",
  },
  "20260927000002_users_rls_policies.sql": {
    sprint: 1,
    description: "Habilita RLS en `public.users` con 3 políticas (SELECT/INSERT/UPDATE)",
  },
  "20260927000003_create_handle_new_user_trigger.sql": {
    sprint: 1,
    description: "Triggers `handle_new_user` (auto-crea perfil) y `handle_updated_at`",
  },
  "20260929000001_create_body_measurements.sql": {
    sprint: 2,
    description: "Crea `public.body_measurements` con RLS y trigger `updated_at`",
  },
  "20260930000001_add_days_per_week_to_users.sql": {
    sprint: 2,
    description: "Agrega `days_per_week` (INT, 1-7) a `public.users` con CHECK",
  },
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function getMigrations() {
  const files = await readdir(migrationsDir);
  return files.filter((f) => f.endsWith(".sql")).sort();
}

function formatTable(rows) {
  const header = "| Migración | Sprint | Descripción |\n|---|---|---|";
  const body = rows
    .map((r) => `| \`${r.file}\` | ${r.sprint} | ${r.description} |`)
    .join("\n");
  return `${header}\n${body}`;
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log("📝 Generando docs/DATABASE.md...\n");

  const migrations = await getMigrations();

  // ─── Check de integridad: migraciones sin META ─────────────
  const missingMeta = migrations.filter((f) => !META[f]);
  if (missingMeta.length > 0) {
    console.log("⚠️  Migraciones sin META (agregalas al objeto META del script):\n");
    for (const f of missingMeta) {
      console.log(`   • ${f}`);
    }
    console.log("");
  }

  // ─── Check inverso: META con migraciones que ya no existen ─
  const missingFiles = Object.keys(META).filter(
    (f) => !migrations.includes(f),
  );
  if (missingFiles.length > 0) {
    console.log("⚠️  Entradas en META sin archivo correspondiente:\n");
    for (const f of missingFiles) {
      console.log(`   • ${f}`);
    }
    console.log("");
  }

  const migrationRows = migrations.map((file) => ({
    file,
    sprint: META[file]?.sprint ?? "?",
    description: META[file]?.description ?? "(sin descripción)",
  }));

  const date = new Date().toISOString().split("T")[0];

  const content = `# 🗄️ Base de Datos

Documentación técnica de la base de datos del proyecto.

> ⚠️ **Este archivo se genera automáticamente** con \`node scripts\\create-database-doc.mjs\` (o \`npm run docs -- db\`).
> **NO lo edites a mano.** Para cambiar algo, editá el script o agregá una migración.

---

## Fuente de verdad

Toda la estructura de la base de datos está versionada en **\`supabase/migrations/\`**.

La regla es simple:

> **NUNCA ejecutar SQL directo en el SQL Editor de Supabase para cambios de schema.**
> **SIEMPRE: escribir migración → commit → ejecutar → verificar.**

Ver [\`supabase/README.md\`](../supabase/README.md) para el flujo detallado.

---

## Migraciones aplicadas

${formatTable(migrationRows)}

---

## Tablas

### \`public.users\`

Perfil del usuario. Espejo de \`auth.users\` (Supabase Auth).

| Campo | Tipo | Notas |
|---|---|---|
| \`id\` | UUID | PK, FK → \`auth.users.id\`, ON DELETE CASCADE |
| \`email\` | VARCHAR(255) | UNIQUE, NOT NULL |
| \`name\` | VARCHAR(100) | |
| \`birth_date\` | DATE | |
| \`sex\` | TEXT | CHECK: \`male\`, \`female\`, \`other\` |
| \`height_cm\` | NUMERIC(5,2) | CHECK: > 0, < 300 |
| \`goal\` | TEXT | CHECK: \`lose_fat\`, \`gain_muscle\`, \`maintain\` |
| \`days_per_week\` | INT | CHECK: 1 a 7 (nullable, writeOnce post-onboarding) |
| \`created_at\` | TIMESTAMPTZ | Default \`now()\` |
| \`updated_at\` | TIMESTAMPTZ | Trigger \`handle_updated_at\` |

**Triggers:**

- \`handle_new_user\` (AFTER INSERT ON \`auth.users\`) → inserta fila en \`public.users\`
- \`handle_updated_at\` (BEFORE UPDATE ON \`public.users\`) → actualiza \`updated_at\`

**RLS:** habilitado. 3 políticas (SELECT, INSERT, UPDATE) sobre \`auth.uid() = id\`.

---

### \`public.body_measurements\`

Registro de medidas corporales. Un registro por usuario por día.

| Campo | Tipo | Notas |
|---|---|---|
| \`id\` | UUID | PK, \`gen_random_uuid()\` |
| \`user_id\` | UUID | FK → \`public.users.id\`, ON DELETE CASCADE |
| \`date\` | DATE | NOT NULL |
| \`weight_kg\` | NUMERIC(5,2) | NOT NULL, CHECK: > 0, < 500 |
| \`body_fat_pct\` | NUMERIC(4,1) | Opcional, CHECK: 0–100 |
| \`chest_cm\` | NUMERIC(5,1) | Opcional, CHECK: > 0, < 300 |
| \`waist_cm\` | NUMERIC(5,1) | Opcional, CHECK: > 0, < 300 |
| \`hip_cm\` | NUMERIC(5,1) | Opcional, CHECK: > 0, < 300 |
| \`neck_cm\` | NUMERIC(5,1) | Opcional, CHECK: > 0, < 100 |
| \`arm_cm\` | NUMERIC(5,1) | Opcional, CHECK: > 0, < 100 |
| \`forearm_cm\` | NUMERIC(5,1) | Opcional, CHECK: > 0, < 100 |
| \`thigh_cm\` | NUMERIC(5,1) | Opcional, CHECK: > 0, < 150 |
| \`calf_cm\` | NUMERIC(5,1) | Opcional, CHECK: > 0, < 100 |
| \`shoulder_cm\` | NUMERIC(5,1) | Opcional, CHECK: > 0, < 200 |
| \`notes\` | TEXT | Opcional |
| \`created_at\` | TIMESTAMPTZ | Default \`now()\` |
| \`updated_at\` | TIMESTAMPTZ | Trigger \`handle_body_measurements_updated_at\` |

**Constraint único:** \`(user_id, date)\` → evita duplicados del mismo día.

**Índice:** \`idx_body_measurements_user_date (user_id, date DESC)\` → optimiza listados ordenados por fecha.

**RLS:** habilitado. 4 políticas (SELECT, INSERT, UPDATE, DELETE) sobre \`auth.uid() = user_id\`.

**Trigger:** \`trg_body_measurements_updated_at\` (BEFORE UPDATE) → actualiza \`updated_at\`.

---

## Cómo aplicar migraciones

### Opción A — SQL Editor (manual, actual)

1. Abrir el archivo \`.sql\` en \`supabase/migrations/\`
2. Copiar el contenido
3. Pegar en Supabase Dashboard → SQL Editor
4. Ejecutar
5. Verificar en Table Editor

### Opción B — Supabase CLI (a futuro)

\`\`\`cmd
supabase db push
\`\`\`

Requiere Supabase CLI instalado y el proyecto linkeado.

---

## Ver también

- [\`DATA_MODEL.md\`](./DATA_MODEL.md) — Modelo lógico completo (con futuras tablas)
- [\`SECURITY.md\`](./SECURITY.md) — Políticas de seguridad detalladas
- [\`supabase/README.md\`](../supabase/README.md) — Flujo de migraciones

---

## Historial de actualizaciones

| Fecha | Cambio |
|---|---|
| ${date} | Regeneración automática desde migraciones |
`;

  await writeFile(join(docsDir, "DATABASE.md"), content, "utf8");
  console.log("   ✅ docs\\DATABASE.md");
  console.log(`\n📊 Migraciones: ${migrations.length}`);
  console.log(`   Con META: ${migrations.length - missingMeta.length}`);
  console.log(`   Sin META: ${missingMeta.length}`);
  console.log("\n🎉 Listo.\n");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});