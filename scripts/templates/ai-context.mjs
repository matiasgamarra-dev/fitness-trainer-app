/**
 * scripts/templates/ai-context.mjs
 *
 * Template del AI_CONTEXT.md.
 * Toda la estructura del documento vive aca.
 *
 * Para cambiarlo: edita este archivo y corre:
 *   npm run docs -- context
 *
 * NO editar docs/AI_CONTEXT.md a mano. Se regenera desde aca.
 */

export const CURRENT_SPRINT = "Sprint 5 — Nutrición (PRÓXIMO)";
export const CURRENT_PHASE = "Fase 1 — MVP";
export const GLOBAL_PROGRESS = "~75%";

export function renderAiContext({ git, date, historial }) {
  const workingTree = git.status && git.status.trim() !== "" ? "⚠️ Sí" : "✅ No";

  return `# 🤖 AI Context — Manual de Continuidad

> Este documento permite que **cualquier IA** (ChatGPT, Claude, Gemini, Copilot) continúe el desarrollo del proyecto sin perder contexto.
> **Se regenera automáticamente** con \`npm run docs -- context\`. NO editar a mano.

---

## 🚦 PRÓXIMO PASO INMEDIATO

**Sprint 4 (Entrenamiento activo) cerrado.** Arrancar **Sprint 5 — Nutrición**.

Backend a construir:

- Migración: tablas \`foods\`, \`meals\`, \`meal_items\`, \`nutrition_goals\` + RLS
- Seed de ~200 alimentos base
- Endpoints CRUD de comidas y items
- Endpoint de objetivo nutricional
- Schemas Zod en \`packages/shared\` (nutrition.ts)
- Tests

Frontend a construir:

- \`/nutrition\` — pantalla del día (desayuno, almuerzo, cena, snacks)
- Buscador de alimentos
- Agregar items a comidas con macros
- Configuración de objetivo nutricional (calorías + macros)
- Dashboard: resumen del día (calorías, macros)

Ver [ROADMAP.md](./ROADMAP.md) para el detalle del Sprint 5.

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
- Profile writeOnce: \`birth_date\`, \`sex\`, \`height_cm\`, \`goal\`, \`days_per_week\` se bloquean post-onboarding
- Guard de onboarding: si los 4 campos clave son \`null\`, redirige a \`/onboarding\`
- Zod 4 \`.uuid()\` solo acepta UUID v4 → usar \`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\` en tests

---

## 🏗️ Arquitectura (Monorepo)

\`\`\`
fitness-trainer-app/
├── apps/
│   ├── api/                    → Backend Express + TypeScript
│   │   ├── src/
│   │   │   ├── config/         (env.ts, supabase.ts)
│   │   │   ├── middleware/     (auth.ts — verifyUser con jose + JWKS)
│   │   │   ├── routes/         (health, auth, profile, measurements,
│   │   │   │                    exercises, routines)
│   │   │   ├── index.ts
│   │   │   └── server.ts
│   │   └── tests/              (26 tests pasando)
│   └── web/                    → Frontend React + Vite + TS
│       └── src/
│           ├── components/     (AppLayout, ProtectedRoute, ExerciseSelector)
│           ├── hooks/          (useProfile, useMeasurements,
│           │                    useExercises, useRoutines)
│           ├── lib/            (api, supabase, date)
│           ├── pages/          (Login, Register, AuthCallback,
│           │                    Onboarding, Dashboard, Profile,
│           │                    Measurements, Routines, RoutineDetail,
│           │                    RoutineForm)
│           ├── stores/         (auth.ts — Zustand)
│           ├── App.tsx
│           └── main.tsx
├── packages/
│   └── shared/                 → Zod schemas compartidos
│       └── src/
│           ├── schemas/        (profile.ts, measurement.ts,
│           │                    exercise.ts, routine.ts)
│           └── index.ts
├── supabase/
│   └── migrations/             (7 migraciones versionadas)
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
| \`npm run docs -- db\` | Regenera DATABASE.md desde migraciones |
| \`npm run docs -- changelog --type=feat --message="..."\` | Agrega entrada al CHANGELOG |
| \`npm run docs -- roadmap --item="..."\` | Marca item del ROADMAP como completado (match parcial) |
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
- \`roadmap --item="..."\` hace match parcial (substring)

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
- Migración \`20260930000001_add_days_per_week_to_users.sql\`
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

### Sprint 2 — Frontend COMPLETO (E.2 + E.3)

- **E.2** — Cliente API (\`api.ts\` con interceptor JWT + \`ApiError\`), helper \`getWeekRange()\`, hooks React Query: \`useProfile\`, \`useUpdateProfile\`, \`useMeasurements\`, \`useCreateMeasurement\`, \`useUpdateMeasurement\`, \`useDeleteMeasurement\`
- **E.3** — Wizard de onboarding (4 pasos), pantalla de perfil con nombre editable y 4 campos writeOnce read-only, pantalla de medidas con form + gráfico Recharts + historial + delete, guard de onboarding en \`ProtectedRoute\`, layout común (\`AppLayout\`) con nav
- **Tests:** 19 tests web (Login, Register, Profile, Onboarding, Measurements)

### Sprint 3 — Rutinas COMPLETO (S.3.0 a S.3.7)

- **S.3.0** — Migración \`exercises\`, \`routines\`, \`routine_exercises\` + RLS + seed 55 ejercicios. Schemas Zod \`exercise.ts\` y \`routine.ts\`.
- **S.3.1** — Endpoints backend: \`GET /api/v1/exercises\` (con filtros), \`GET/POST/PUT/DELETE /api/v1/routines\`, \`GET /api/v1/routines/:id\` (con exercises embebidos).
- **S.3.2** — Hooks React Query: \`useExercises\` (staleTime static), \`useRoutines\`, \`useRoutine\`, \`useCreateRoutine\`, \`useUpdateRoutine\`, \`useDeleteRoutine\` (staleTime 30s + onSettled).
- **S.3.3** — Pantalla \`/routines\` (lista con cards, empty state, badge "Activa").
- **S.3.4** — Pantalla \`/routines/:id\` (detalle con ejercicios agrupados por día, delete con confirm).
- **S.3.5** — Pantalla \`/routines/new\` y \`/routines/:id/edit\` (form + modal selector de ejercicios con filtros).
- **S.3.6** — Tests: Routines (7), RoutineDetail (10), RoutineForm (12) = 29 tests nuevos.
- **S.3.7** — Cierre de sprint (docs + commit).

**Endpoints nuevos del Sprint 3:**

| Método | Endpoint | Códigos |
|---|---|---|
| GET | \`/api/v1/exercises\` | 200, 400, 401, 500 |
| GET | \`/api/v1/routines\` | 200, 401, 500 |
| GET | \`/api/v1/routines/:id\` | 200, 401, 404, 500 |
| POST | \`/api/v1/routines\` | 201, 400, 401, 500 |
| PUT | \`/api/v1/routines/:id\` | 200, 400, 401, 403, 404, 500 |
| DELETE | \`/api/v1/routines/:id\` | 204, 401, 403, 404, 500 |

**Total tests al cierre del Sprint 3:** 26 (API) + 48 (Web) = **74 tests verdes**.

### Sprint 4 — Entrenamiento activo COMPLETO (S.4.0 a S.4.10)

- **S.4.0** — Migración \`workout_sessions\`, \`workout_sets\` + RLS + trigger + índices. FKs con \`ALTER TABLE ADD CONSTRAINT\` (no inline).
- **S.4.1** — Schemas Zod en \`packages/shared/src/schemas/workout.ts\` + tipos.
- **S.4.2a** — Endpoints CRUD sesiones: \`GET/POST/PUT/DELETE /api/v1/workouts\`.
- **S.4.2b** — Endpoints sets + stats: \`POST/PUT/DELETE /api/v1/workouts/:id/sets\` y \`GET /api/v1/workouts/stats\`. Regla: solo 1 sesión activa por user (409). \`set_number\` calculado por backend (MAX+1).
- **S.4.3** — 15 tests backend (\`workouts.test.ts\`).
- **S.4.4** — 9 hooks React Query (\`useWorkouts.ts\` + \`useWorkoutSets.ts\`).
- **S.4.5** — Pantalla \`/workouts\` (historial con tabs Todos/Activos).
- **S.4.6** — Pantalla \`/workouts/new\` (form rutina + día + 409 con link a sesión activa).
- **S.4.7** — Pantalla \`/workouts/:id\` (timer + AddSetForm + sets agrupados + edición inline + finalizar + eliminar).
- **S.4.8** — Dashboard con rutina activa + sesión en curso + 3 stats.
- **S.4.9** — 25 tests web (\`Workouts.test.tsx\`, \`WorkoutForm.test.tsx\`, \`WorkoutActive.test.tsx\`).
- **S.4.10** — Cierre: \`DATABASE.md\`, \`API.md\`, \`ROADMAP.md\` 6/7 items, \`CHANGELOG.md\` 5 entradas.

**Total tests al cierre del Sprint 4:** 41 (API) + 73 (Web) = **114 tests verdes**.

**Deuda técnica:** "Timer de descanso" del roadmap quedó pendiente. El \`WorkoutTimer\` cuenta la duración total de la sesión, no un timer entre series. Agendado para Sprint 9 o mejora puntual.

---

## 📋 Próximos sprints (resumen)

| Sprint | Objetivo |
|---|---|
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
VITE_API_URL=http://localhost:3000/api/v1
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
- Scripts \`.mjs\` con template strings >500 líneas se cortan al pegar en VS Code → partir en varios archivos
- \`useCreateMeasurement\` requiere \`week_start\`/\`week_end\` → calcular con \`getWeekRange()\` antes de llamar
- Si el frontend tira \`Network Error\`, primero verificar que **ambos** dev servers estén corriendo (web en 5173, api en 3000)
- **Zod 4** \`.uuid()\` solo acepta UUID v4 → usar \`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\` en tests
- **PowerShell + chat**: pegar comandos línea por línea, nunca bloques multilínea con \`@{...}\` o \`foreach\`
- **PowerShell + emojis**: pegar archivos con emojis desde el chat puede romper el encoding. Guardar con VS Code "Save with Encoding → UTF-8 with BOM" o crear con \`Out-File -Encoding utf8\`.
- **PowerShell + Replace**: el método Replace NO modifica el archivo en disco, solo devuelve un string nuevo. Siempre hacer [System.IO.File]::WriteAllText(path, content, encoding) después. Si dice "OK" pero el archivo no cambia, se olvidó el WriteAllText.
- **PowerShell + WriteAllText**: los paths relativos se resuelven contra [Environment]::CurrentDirectory, no contra el cwd de PowerShell. Usar siempre paths absolutos.
- **PowerShell + Resolve-Path**: falla si el archivo no existe todavía. Para archivos nuevos, pasar el string del path directo a WriteAllText.
- **PowerShell + heredoc**: el here-string se corta si el contenido tiene tres backticks markdown al principio de línea, o si es muy largo (>50 líneas). Usar Set-Content con array de líneas.
- **PowerShell + backticks en template literals**: si el .mjs genera un .md con template literal, TODOS los backticks del contenido tienen que ir escapados con barra invertida + backtick. Un backtick suelto rompe el template y tira SyntaxError.
- **PowerShell + base64**: validar que el string matchee ^[A-Za-z0-9+/]*={0,2}$ antes de FromBase64String. Un solo asterisco, comilla doble, espacio, o salto de línea rompe con FormatException.
- **JS/TS + && y ??**: no se pueden mezclar sin paréntesis. a && b ?? c es error de sintaxis. Usar a && (b ?? c).
- **tsc --noEmit vs Vitest**: Vitest no chequea tipos. Siempre correr tsc --noEmit antes de commitear, no solo los tests.
- **Fixtures con tipos literales**: const FAKE = { finished_at: null } infiere finished_at: null (literal). { ...FAKE, finished_at: "string" } falla. Solución: anotar con interface explícita (const FAKE: FakeSession = {...}).
- **Vitest + vi.mock**: si el componente usa varias exportaciones del mismo módulo, el mock tiene que exportar TODAS. Si AddSetForm usa useLogSet y WorkoutActive usa useDeleteSet, ambos importan de useWorkoutSets.js → el mock exporta ambos.
- **getByText + JSX interpolado**: JSX como Serie con interpolación crea múltiples text nodes. getByText("80") NO matchea. Solución: getByText((_, el) => el?.textContent?.includes("...") ?? false).
- **ApiError.details**: debe ser unknown (no string) para soportar 409 con objeto ({ active_session_id }). Cambio hecho en apps/web/src/lib/api.ts.
- **docs -- changelog**: deduplica entradas (no agrega 2 veces la misma, tira warning). Si entró basura (--message="..." literal), borrarla a mano con Replace + WriteAllText.
- **docs -- roadmap --item**: match parcial (substring). --item="workout_sessions" matchea "Tablas workout_sessions, workout_sets". Respeta tildes en UTF-8 aunque Select-String muestre encoding raro.
- **Migraciones SQL + FKs**: usar ALTER TABLE ADD CONSTRAINT después del CREATE TABLE, no inline (REFERENCES inline falla con dependencias entre tablas). Mejor práctica Supabase.
- **DB con tablas relacionadas**: el orden importa. Primero crear workout_sessions, después workout_sets (que referencia a sessions y exercises), después los índices y el RLS.
- **Testing: bloques de 50 líneas**: archivos de test largos (>80 líneas) se parten en 3-4 bloques con Set-Content (primero) + Add-Content (siguientes), ≤50 líneas cada uno.
- **Testing: mock + router**: MemoryRouter con initialEntries + Routes/Route para que useParams funcione. vi.mock("react-router-dom") con useNavigate: () => navigateMock para el resto.
- **Regla de trabajo con IA**: un comando por paste, Enter → esperar prompt → siguiente. Nunca pegar output de error como comando. Nunca pegar markdown del chat como comando. Nunca ejecutar plantillas con ..., X, TODO.
- **PowerShell + UTF-8**: los archivos que se escriben con \`Set-Content -Encoding utf8\` mantienen el encoding; los que se pegan por chat pueden perder tildes/emojis

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