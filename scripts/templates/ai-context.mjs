/**
 * scripts/templates/ai-context.mjs
 *
 * Template del AI_CONTEXT.md.
 * Toda la estructura del documento vive acá.
 *
 * Para cambiarlo: editá este archivo y corré:
 *   npm run docs -- context
 *
 * NO editar docs/AI_CONTEXT.md a mano. Se regenera desde acá.
 */

export const CURRENT_SPRINT = "Sprint 2 — Frontend (E.2 + E.3)";
export const CURRENT_PHASE = "Fase 1 — MVP";
export const GLOBAL_PROGRESS = "~40%";

export function renderAiContext({ git, date, historial }) {
  const workingTree = git.status && git.status.trim() !== "" ? "⚠️ Sí" : "✅ No";

  return `# 🤖 AI Context — Manual de Continuidad

> Este documento permite que **cualquier IA** (ChatGPT, Claude, Gemini, Copilot) continúe el desarrollo del proyecto sin perder contexto.
> **Se regenera automáticamente** con \`npm run docs -- context\`. NO editar a mano.

---

## 🚦 PRÓXIMO PASO INMEDIATO

**Continuar con E.2 del Sprint 2: cliente API + hooks React Query.**

Archivos a crear:

- \`apps/web/src/lib/api.ts\` — cliente axios con interceptor JWT de Supabase
- \`apps/web/src/lib/date.ts\` — helper \`getWeekRange()\` (lunes-domingo local)
- \`apps/web/src/hooks/useProfile.ts\` — \`useProfile()\` + \`useUpdateProfile()\`
- \`apps/web/src/hooks/useMeasurements.ts\` — CRUD completo de medidas

Después: **E.3 (Onboarding + Perfil + Medidas)**.

---

## 📌 Estado actual del proyecto

| Campo | Valor |
|---|---|
| **Nombre** | Fitness Trainer App |
| **Repo** | https://github.com/matiasgamarra-dev/fitness-trainer-app |
| **Owner** | Matías Gamarra (@matiasgamarra-dev) |
| **Rama actual** | \`${git.branch}\` |
| **Último commit** | \`${git.lastCommit}\` |
| **Cambios sin commitear** | ${workingTree} |
| **Fase** | ${CURRENT_PHASE} |
| **Sprint actual** | ${CURRENT_SPRINT} |
| **Progreso global** | ${GLOBAL_PROGRESS} |
| **Última actualización** | ${date} |

---

## 🎯 Objetivo del proyecto

App web de seguimiento personal que integra:

- Entrenamiento físico (rutinas, series, reps, peso)
- Nutrición (calorías, macros, comidas)
- Progreso (peso, medidas, gráficos)

Ver [PRODUCT.md](./PRODUCT.md) para visión completa.

---

## 🛠️ Stack decidido

| Capa | Tecnología |
|---|---|
| Runtime | Node.js v24.19.0 |
| Package manager | npm 11.17.0 |
| Lenguaje | TypeScript 5.9.3 |
| Frontend | React 19 + Vite 7 + Tailwind CSS v4 |
| Estado | Zustand 5 + React Query 5 |
| Routing | React Router v7 |
| Gráficos | Recharts |
| Backend | Express 5.2.1 + TypeScript |
| Base de datos | **Supabase (PostgreSQL cloud)** |
| Cliente DB | **@supabase/supabase-js 2.117.2** |
| Auth | **Supabase Auth** (Email + Google OAuth) |
| Verificación JWT | **jose 6.2.12 + JWKS remoto** |
| Validación | Zod 4.6.5 (schemas en \`packages/shared\`) |
| Testing | **Vitest 5** (backend + frontend) |
| CI/CD | GitHub Actions |
| Deploy | Vercel (front) + Railway (back) — pendiente |

Ver [STACK.md](./STACK.md) para justificación.

**Decisiones clave:**

- NO usamos Prisma → \`@supabase/supabase-js\` (Prisma fallaba en Windows)
- Zod schemas viven en \`packages/shared\` → front y back comparten validación
- Semana calculada por el cliente (lunes-domingo local) → se envía \`week_start\` y \`week_end\` al backend
- Profile writeOnce: \`birth_date\`, \`sex\`, \`height_cm\`, \`goal\` se bloquean post-onboarding

---

## 🏗️ Arquitectura (Monorepo)

\`\`\`
fitness-trainer-app/
├── apps/
│   ├── api/                    → Backend Express + TypeScript
│   │   ├── src/
│   │   │   ├── config/         (env.ts, supabase.ts)
│   │   │   ├── middleware/     (auth.ts — verifyUser con jose + JWKS)
│   │   │   ├── routes/         (health, auth, profile, measurements)
│   │   │   ├── index.ts
│   │   │   └── server.ts
│   │   └── tests/              (26 tests pasando)
│   └── web/                    → Frontend React + Vite + TS
│       └── src/
│           ├── components/     (ProtectedRoute)
│           ├── lib/            (supabase.ts)
│           ├── pages/          (Login, Register, AuthCallback, Dashboard)
│           ├── stores/         (auth.ts — Zustand)
│           ├── App.tsx
│           └── main.tsx
├── packages/
│   └── shared/                 → Zod schemas compartidos
│       └── src/
│           ├── schemas/        (profile.ts, measurement.ts)
│           └── index.ts
├── supabase/
│   └── migrations/             (4 migraciones versionadas)
├── docs/                       → Documentación (generada por scripts)
├── scripts/                    → docs.mjs + templates/
├── .github/workflows/          → CI/CD
└── package.json                → raíz con workspaces
\`\`\`

**Convenciones:**

- Archivos: \`kebab-case.ts\`
- Componentes: \`PascalCase.tsx\`
- Funciones: \`camelCase\`
- Constantes: \`UPPER_SNAKE_CASE\`

---

## 🤖 Scripts de automatización

Ubicados en \`scripts/\`. **Usar SIEMPRE en vez de editar docs a mano.**

| Comando | Qué hace |
|---|---|
| \`npm run docs -- sync\` | Sincroniza (context + check) |
| \`npm run docs -- check\` | Verifica integridad de la documentación |
| \`npm run docs -- context\` | Regenera AI_CONTEXT.md desde el template |
| \`npm run docs -- changelog --type=feat --message="..."\` | Agrega entrada al CHANGELOG |
| \`npm run docs -- roadmap --item="..."\` | Marca item del ROADMAP como completado |
| \`npm run docs -- help\` | Ver todos los comandos |

**Reglas para la IA que continúe:**

1. **NUNCA** editar \`docs/AI_CONTEXT.md\` a mano → \`npm run docs -- context\`
2. **NUNCA** editar \`CHANGELOG.md\` a mano → \`npm run docs -- changelog\`
3. **NUNCA** marcar items del ROADMAP a mano → \`npm run docs -- roadmap\`
4. **SIEMPRE** ejecutar \`npm run docs -- sync\` antes de commitear

---

## 🔴 Reglas críticas (NO romper)

### Documentación

- Toda doc se crea/modifica vía script en \`scripts/\`
- Nunca editar docs a mano ni con VS Code directamente
- Scripts \`.mjs\` cuando son >3 archivos a crear/modificar

### SQL / Supabase

- **NUNCA** ejecutar SQL directo en el SQL Editor para cambios de schema
- **SIEMPRE**: (1) migración en \`supabase/migrations/\`, (2) commit, (3) ejecutar, (4) verificar
- Nombres: \`YYYYMMDDHHMMSS_descripcion.sql\`
- Idempotentes (\`IF NOT EXISTS\`, \`CREATE OR REPLACE\`)

### Git

- \`git status\` antes y después de \`git add .\`
- Conventional Commits obligatorio
- Nunca commitear \`.env\`
- Push al final de cada bloque funcional

### Modo de trabajo con el usuario

- Guiar paso a paso con comandos exactos para Windows CMD
- Una tarea a la vez, verificar antes de avanzar
- Recordar Ctrl+S en VS Code después de pegar contenido
- Preguntar antes de decisiones grandes

---

## ✅ Lo que ya está hecho

### Sprint 0 + 0.5 + 1

Monorepo, docs, CI/CD, Supabase configurado, Auth completo (email + Google OAuth), endpoints \`/auth/me\`, tests, deploy config.

### Sprint 2 — Backend COMPLETO

- \`packages/shared\` con schemas Zod (profile, measurement)
- Migraciones SQL versionadas + \`docs/DATABASE.md\`
- Endpoints \`GET/PUT /api/v1/profile\` con reglas writeOnce
- Endpoints CRUD \`/api/v1/measurements\` con validación semanal
- **26 tests pasando** en backend

**Endpoints implementados:**

| Método | Endpoint | Códigos |
|---|---|---|
| GET | \`/api/v1/profile\` | 200, 401, 404, 500 |
| PUT | \`/api/v1/profile\` | 200, 400, 401, 403, 404, 500 |
| POST | \`/api/v1/measurements\` | 201, 400, 401, 409 |
| GET | \`/api/v1/measurements\` | 200, 401 |
| PUT | \`/api/v1/measurements/:id\` | 200, 400, 401, 403, 404, 409 |
| DELETE | \`/api/v1/measurements/:id\` | 204, 401, 403, 404 |

---

## 🔄 Lo que falta (Sprint 2 — Frontend)

### E.2 — Cliente API + hooks (~30 min)

- [ ] \`apps/web/src/lib/api.ts\` — axios con interceptor JWT
- [ ] \`apps/web/src/lib/date.ts\` — \`getWeekRange()\` según timezone
- [ ] \`apps/web/src/hooks/useProfile.ts\` — React Query GET/PUT
- [ ] \`apps/web/src/hooks/useMeasurements.ts\` — React Query CRUD

### E.3 — Onboarding + Perfil + Medidas (~1.5 h)

- [ ] Onboarding de 4 pasos (\`/onboarding\`)
- [ ] Pantalla de perfil (\`/profile\`) con campos read-only
- [ ] Formulario de medidas con validación Zod
- [ ] Lista de medidas con gráfico Recharts
- [ ] Guard de onboarding en \`ProtectedRoute\`

### G — Docs + cierre

- [ ] Actualizar \`docs/API.md\`
- [ ] Actualizar \`docs/DATA_MODEL.md\`
- [ ] Actualizar \`docs/ROADMAP.md\`
- [ ] \`npm run docs -- sync\`

---

## 📋 Próximos sprints (resumen)

| Sprint | Objetivo |
|---|---|
| Sprint 3 | Rutinas (exercises, routines, routine_exercises) |
| Sprint 4 | Entrenamiento activo (workout_sessions, workout_sets) |
| Sprint 5 | Nutrición (foods, meals, meal_items, nutrition_goals) |
| Sprint 6 | Progreso + Deploy (Railway + Vercel) |

Ver [ROADMAP.md](./ROADMAP.md) para detalle completo.

---

## 🔐 Variables de entorno

**NUNCA commitear \`.env\`** — solo \`.env.example\`.

### Backend (\`apps/api/.env\`)

\`\`\`env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
\`\`\`

### Frontend (\`apps/web/.env\`)

\`\`\`env
VITE_SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
\`\`\`

---

## 🐛 Problemas conocidos / lecciones aprendidas

- Windows 10 + CMD (no bash)
- VS Code para editar archivos (nunca Notepad)
- Ctrl+S después de pegar contenido (error #1)
- No pegar texto con formato en CMD
- \`import.meta.dirname\` en vez de \`__dirname\` en ESM
- Vitest: \`vi.mock()\` se hoistea → usar \`vi.hoisted()\` para variables
- Supabase chain: \`.order()\` y \`.limit()\` cierran el chain → filtros antes
- TypeScript estricto: \`existing[0]?.id\` o guard explícito
- Prisma NO se instala en Windows → usamos Supabase SDK

---

## 📞 Contacto

- **Nombre**: Matías Gamarra
- **Email**: matiasgamarra.dev@gmail.com
- **GitHub**: @matiasgamarra-dev
- **País**: Argentina 🇦🇷

---

## 🔄 Historial de actualizaciones

| Fecha | Cambio |
|---|---|
${historial}
`;
}