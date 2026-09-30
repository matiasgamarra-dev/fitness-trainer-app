# 🔐 Autenticación

Documentación del sistema de autenticación de Fitness Trainer App.

## Stack

| Componente | Tecnología |
|---|---|
| **Auth provider** | Supabase Auth |
| **Providers habilitados** | Email + Password, Google OAuth |
| **Almacenamiento de token** | localStorage (default de Supabase) |
| **Verificación backend** | `jose` + JWKS remoto |
| **Estado frontend** | Zustand (`useAuthStore`) |

## Flujo de autenticación

### Registro con email + password

```
[Usuario] → llena formulario → [Frontend]
    ↓ supabase.auth.signUp()
[Supabase Auth] → crea en auth.users
    ↓ trigger handle_new_user
[Supabase DB] → crea en public.users
    ↓ devuelve session (si email confirmation OFF)
[Frontend] → guarda session en Zustand + localStorage
```

### Login con Google OAuth

```
[Usuario] → click "Continuar con Google" → [Frontend]
    ↓ supabase.auth.signInWithOAuth({ provider: 'google' })
[Google] → muestra consent screen
    ↓ redirige a: https://ourssnznqjladulhmpeq.supabase.co/auth/v1/callback
[Supabase Auth] → valida con Google → crea/actualiza user
    ↓ trigger handle_new_user
[Supabase DB] → crea en public.users
    ↓ redirige a: http://localhost:5173/auth/callback
[Frontend AuthCallback] → detecta session → navigate a /dashboard
```

### Request autenticado al backend

```
[Usuario] → acción que requiere auth → [Frontend]
    ↓ axios request con header: Authorization: Bearer <jwt>
[Backend API] → middleware verifyUser
    ↓ jose.jwtVerify(token, JWKS, { issuer, audience })
[Supabase JWKS] → devuelve clave pública
    ↓ verifica firma + expiración
[Backend API] → adjunta user al req → continúa con el handler
```

## Estructura de archivos

### Backend

| Archivo | Propósito |
|---|---|
| `apps/api/src/middleware/auth.ts` | Middleware `verifyUser` con jose + JWKS |
| `apps/api/src/routes/auth.ts` | Endpoint `GET /api/v1/auth/me` |
| `apps/api/src/config/supabase.ts` | Cliente Supabase admin |
| `apps/api/src/config/env.ts` | Validación de variables con Zod |

### Frontend

| Archivo | Propósito |
|---|---|
| `apps/web/src/lib/supabase.ts` | Cliente Supabase |
| `apps/web/src/stores/auth.ts` | Store Zustand de auth |
| `apps/web/src/pages/Login.tsx` | Pantalla de login |
| `apps/web/src/pages/Register.tsx` | Pantalla de registro |
| `apps/web/src/pages/AuthCallback.tsx` | Callback de OAuth |
| `apps/web/src/pages/Dashboard.tsx` | Dashboard protegido |
| `apps/web/src/components/ProtectedRoute.tsx` | Guard de rutas |

## Endpoints

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/auth/me` | ✅ Bearer | Devuelve perfil del usuario autenticado |

## Variables de entorno

### Backend (`apps/api/.env`)

```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Frontend (`apps/web/.env`)

```env
VITE_SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
