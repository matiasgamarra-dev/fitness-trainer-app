# 🏗️ Arquitectura del Proyecto

## Visión general

Fitness Trainer App es una aplicación con arquitectura cliente-servidor en monorepo, pensada para escalar.

## Estructura del monorepo

```
fitness-trainer-app/
├── apps/
│   ├── api/                    ← Backend Express + TypeScript
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── env.ts       (validación con Zod)
│   │   │   │   └── supabase.ts  (cliente Supabase admin)
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts      (verifyUser con jose + JWKS)
│   │   │   ├── routes/
│   │   │   │   ├── health.ts
│   │   │   │   └── auth.ts      (GET /auth/me)
│   │   │   ├── index.ts         (entry point)
│   │   │   └── server.ts        (Express app)
│   │   ├── tests/               (Vitest)
│   │   └── .env
│   │
│   └── web/                    ← Frontend React + Vite
│       ├── src/
│       │   ├── components/
│       │   │   └── ProtectedRoute.tsx
│       │   ├── lib/
│       │   │   └── supabase.ts  (cliente Supabase)
│       │   ├── pages/
│       │   │   ├── Login.tsx
│       │   │   ├── Register.tsx
│       │   │   ├── AuthCallback.tsx
│       │   │   └── Dashboard.tsx
│       │   ├── stores/
│       │   │   └── auth.ts      (Zustand)
│       │   ├── App.tsx          (React Router)
│       │   ├── main.tsx
│       │   └── index.css
│       ├── tests/               (Vitest + Testing Library)
│       └── .env
│
├── packages/
│   └── shared/                 ← Tipos y utilidades compartidas
│
├── docs/                       ← Documentación
├── scripts/                    ← docs.mjs (automatización)
├── .github/workflows/          ← CI/CD
├── package.json                ← raíz con workspaces
└── README.md
```

## Capas

### Backend

1. **Rutas** (`routes/`): definen endpoints
2. **Middleware** (`middleware/`): auth, validación, logging
3. **Config** (`config/`): env, clientes de servicios externos
4. **Servicios** (futuro): lógica de negocio
5. **Repositorios** (futuro): acceso a datos

### Frontend

1. **Páginas** (`pages/`): una por ruta
2. **Componentes** (`components/`): reutilizables
3. **Stores** (`stores/`): estado global (Zustand)
4. **Lib** (`lib/`): clientes (Supabase, axios)

## Flujo de datos

### Request autenticado típico

```
[React Component]
    ↓ useAuthStore / useQuery
[Zustand / React Query]
    ↓ axios request con Authorization header
[Express API]
    ↓ middleware verifyUser (jose + JWKS)
    ↓ route handler
[Supabase Client (admin)]
    ↓ query a Postgres
[Supabase DB (con RLS)]
    ↓ data
[Express API]
    ↓ JSON response
[React Component]
```

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + TypeScript |
| Estilos | Tailwind CSS v4 |
| Estado | Zustand + React Query |
| Routing | React Router v7 |
| Backend | Node.js + Express + TypeScript |
| Base de datos | Supabase (PostgreSQL cloud) |
| Cliente DB | @supabase/supabase-js |
| Auth | Supabase Auth (Email + Google) |
| Verificación JWT | jose + JWKS |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions |
| Deploy | Vercel (front) + Railway (back) |

## Decisiones técnicas

- **Modularidad**: cada carpeta con responsabilidad clara
- **Escalabilidad**: agregar features sin romper nada
- **Testing**: Vitest en back y front
- **Separación de capas**: la UI nunca habla directo con la DB
- **Monorepo**: shared types y config reutilizable
- **Auth delegado**: Supabase maneja todo el ciclo de auth

Ver [STACK.md](./STACK.md) para más detalle técnico.
