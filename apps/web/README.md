# @fitness-trainer/web

Frontend web de Fitness Trainer App. React 19 + Vite 7 + TypeScript + Tailwind CSS v4.

## Stack

- **UI**: React 19 + TypeScript 5.9
- **Build**: Vite 7
- **Estilos**: Tailwind CSS v4
- **Estado global**: Zustand 5
- **Data fetching**: TanStack Query 5
- **Routing**: React Router v7
- **Graficos**: Recharts 3
- **Testing**: Vitest 5 + Testing Library

## Estructura

````
apps/web/
  src/
    components/     AppLayout, ProtectedRoute, ExerciseSelector
    hooks/          useProfile, useRoutines, useWorkouts, ...
    lib/            api.ts, supabase.ts, date.ts
    pages/          Login, Register, AuthCallback, Onboarding, Dashboard,
                    Profile, Measurements, Routines, RoutineDetail, RoutineForm
    stores/         auth.ts (Zustand)
    App.tsx         rutas
    main.tsx        entrypoint
    index.css
  tests/            Vitest + Testing Library
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
````

## Setup local

Paso 1: Copiar .env.example a .env:

    Copy-Item .env.example .env

Paso 2: Completar las variables (te las pasa el owner del proyecto).

Paso 3: Desde la raiz del monorepo:

    npm run dev --workspace=apps/web

    El front arranca en http://localhost:5173.

Importante: para que funcione el login y las queries, el backend tiene que estar corriendo en http://localhost:3000. Si ves Network Error, verifica que ambos dev servers esten levantados.

## Scripts

| Comando | Que hace |
|---|---|
| npm run dev --workspace=apps/web | Levanta Vite dev server con HMR |
| npm run build --workspace=apps/web | Typecheck + build de produccion a dist/ |
| npm run preview --workspace=apps/web | Sirve dist/ (requiere build previo) |
| npm run typecheck --workspace=apps/web | tsc --noEmit |
| npm run test --workspace=apps/web | Corre todos los tests (Vitest run) |
| npm run test:watch --workspace=apps/web | Vitest en watch mode |
| npm run test:coverage --workspace=apps/web | Tests con coverage |

## Variables de entorno

| Variable | Requerida | Descripcion |
|---|---|---|
| VITE_SUPABASE_URL | Si | URL del proyecto Supabase |
| VITE_SUPABASE_ANON_KEY | Si | Anon key (publico, va al bundle) |
| VITE_API_URL | Si | URL del backend (default http://localhost:3000/api/v1) |

Nota: las variables con prefijo VITE_ se embeben en el bundle y son publicas. Nunca pongas SERVICE_ROLE_KEY aca.

## Auth

- Registro / login: directo contra Supabase Auth (no contra nuestra API)
- OAuth con Google: supabase.auth.signInWithOAuth({ provider: 'google' })
- Logout: supabase.auth.signOut()
- El JWT se guarda en Zustand (useAuthStore) y se manda en cada request al backend via interceptor en lib/api.ts

Ver docs/AUTH.md para el flujo completo.

## Estado global vs server state

- Zustand (stores/auth.ts): estado de sesion del usuario (token, user, isAuthenticated)
- TanStack Query (hooks/): todo lo que viene del backend. Cada recurso tiene su hook con useQuery / useMutation. Invalidacion de cache con queryClient.invalidateQueries.

Regla: si el dato viene del server -> React Query. Si es estado de UI global (sesion, tema) -> Zustand. Si es local -> useState.

## Rutas

| Ruta | Componente | Auth | Notas |
|---|---|---|---|
| /login | Login.tsx | No | |
| /register | Register.tsx | No | |
| /auth/callback | AuthCallback.tsx | No | OAuth callback |
| /onboarding | Onboarding.tsx | Si | Wizard 4 pasos |
| / | Dashboard.tsx | Si | Requiere onboarding completo |
| /profile | Profile.tsx | Si | |
| /measurements | Measurements.tsx | Si | |
| /routines | Routines.tsx | Si | |
| /routines/:id | RoutineDetail.tsx | Si | |
| /routines/new | RoutineForm.tsx | Si | |
| /routines/:id/edit | RoutineForm.tsx | Si | |
| /workouts | Workouts.tsx | Si | (Sprint 4) |
| /workouts/new | WorkoutForm.tsx | Si | (Sprint 4) |
| /workouts/:id | WorkoutActive.tsx | Si | (Sprint 4) |

ProtectedRoute redirige a /login si no hay sesion, y a /onboarding si faltan los 4 campos clave del perfil.

## Testing

- Tests en tests/*.test.tsx
- Usar @testing-library/react + @testing-library/user-event
- Mockear lib/api.ts con vi.mock()
- Setup compartido en tests/setup.ts
- Renderizar con los providers necesarios (QueryClient, Router, etc.)

## Referencias

- docs/WIREFRAMES.md - wireframes
- docs/API.md - endpoints que consume
- docs/AUTH.md - flujo de auth
- docs/STACK.md - por que cada libreria
- docs/DEVELOPMENT.md - setup de desarrollo
