# @fitness-trainer/api

Backend de Fitness Trainer App. Express 5 + TypeScript + Supabase.

## Stack

- **Runtime**: Node.js + TSX (dev) / tsc (build)
- **Framework**: Express 5.2.1
- **DB**: Supabase (PostgreSQL cloud) via @supabase/supabase-js
- **Auth**: JWT de Supabase verificado con jose + JWKS remoto
- **Validacion**: Zod 4 (schemas en @fitness-trainer/shared)
- **Testing**: Vitest 5 + Supertest

## Estructura

````
apps/api/
  src/
    config/         env.ts, supabase.ts
    middleware/     auth.ts (verifyUser + JWKS)
    routes/         auth, profile, measurements, exercises, routines, workouts, health
    index.ts        entrypoint
    server.ts       createServer() + mounts
  tests/            Vitest + Supertest
  package.json
  tsconfig.json
  vitest.config.ts
````

## Setup local

Paso 1: Copiar .env.example a .env:

    Copy-Item .env.example .env

Paso 2: Completar las variables (te las pasa el owner del proyecto).

Paso 3: Desde la raiz del monorepo:

    npm run dev --workspace=apps/api

    El server arranca en http://localhost:3000.

## Scripts

| Comando | Que hace |
|---|---|
| npm run dev --workspace=apps/api | Levanta el server con tsx watch (hot reload) |
| npm run build --workspace=apps/api | Compila TypeScript a dist/ |
| npm run start --workspace=apps/api | Corre dist/index.js (requiere build previo) |
| npm run typecheck --workspace=apps/api | tsc --noEmit |
| npm run test --workspace=apps/api | Corre todos los tests (Vitest run) |
| npm run test:watch --workspace=apps/api | Vitest en watch mode |
| npm run test:coverage --workspace=apps/api | Tests con coverage |

## Variables de entorno

| Variable | Requerida | Descripcion |
|---|---|---|
| NODE_ENV | Si | development / production / test |
| PORT | Si | Puerto del server (default 3000) |
| SUPABASE_URL | Si | URL del proyecto Supabase |
| SUPABASE_ANON_KEY | Si | Anon key (publico) |
| SUPABASE_SERVICE_ROLE_KEY | Si | NUNCA commitear. Solo en .env local o variables de prod |

## Endpoints

Ver docs/API.md para la referencia completa.

| Metodo | Endpoint | Auth |
|---|---|---|
| GET | /api/v1/health | No |
| GET | /api/v1/auth/me | Si |
| GET/PUT | /api/v1/profile | Si |
| CRUD | /api/v1/measurements | Si |
| GET | /api/v1/exercises | Si |
| CRUD | /api/v1/routines | Si |
| CRUD | /api/v1/workouts | Si |
| POST/PUT/DELETE | /api/v1/workouts/:id/sets | Si |
| GET | /api/v1/workouts/stats | Si |

## Auth

El backend NO emite tokens. Los emite Supabase Auth cuando el usuario se loguea (email o Google OAuth). El frontend guarda el token y lo manda en cada request como Authorization: Bearer <jwt>.

verifyUser valida el JWT contra el JWKS de Supabase, extrae el sub (user id) y lo deja en req.user.

Ver docs/AUTH.md para el flujo completo.

## Database

Todo el schema vive en supabase/migrations/. La doc tecnica en docs/DATABASE.md.

Regla de oro: nunca ejecutar SQL en el SQL Editor de Supabase para cambios de schema. Siempre migracion versionada + commit + ejecutar + verificar.

## Convenciones

- Archivos: kebab-case.ts
- Funciones: camelCase
- Constantes: UPPER_SNAKE_CASE
- Respuesta OK: { success: true, data, message }
- Respuesta error: { success: false, error, details?, hint? }
- Un endpoint = un handler. Si surge logica compartida entre rutas, extraer a src/lib/.

## Testing

- Tests en tests/*.test.ts
- Usar supertest para pegarle a los endpoints (via createServer())
- Mockear supabaseAdmin con vi.hoisted() + vi.mock() (leccion del proyecto: vi.mock se hoistea, usar vi.hoisted para variables)
- Cobertura objetivo: cada endpoint, happy path + al menos 1 error path

## Referencias

- docs/API.md - referencia de endpoints
- docs/AUTH.md - autenticacion con Supabase
- docs/DATABASE.md - schema de la DB
- docs/ARCHITECTURE.md - arquitectura del monorepo
- docs/DEVELOPMENT.md - setup de desarrollo
