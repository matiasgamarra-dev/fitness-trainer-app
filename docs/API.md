# 🔌 API Reference

## Base URL

```
http://localhost:3000/api/v1
```

## Endpoints implementados

### Health

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | ❌ | Health check del servidor |

### Auth

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/auth/me` | ✅ Bearer | Devuelve perfil del usuario autenticado |

**Nota:** El registro y login **NO se hacen contra nuestra API**.
Se hacen directamente contra **Supabase Auth** desde el frontend:

- `supabase.auth.signUp({ email, password })` → registro
- `supabase.auth.signInWithPassword({ email, password })` → login email
- `supabase.auth.signInWithOAuth({ provider: 'google' })` → login Google
- `supabase.auth.signOut()` → logout


### Exercises

| Método | Endpoint | Auth | Códigos | Descripción |
|---|---|---|---|---|
| GET | `/exercises` | ✅ Bearer | 200, 400, 401, 500 | Lista el catálogo global de ejercicios |

**Query params opcionales:**

- `?muscle_group=chest` (filtra por grupo muscular)
- `?equipment=barbell` (filtra por equipamiento)

### Routines

| Método | Endpoint | Auth | Códigos | Descripción |
|---|---|---|---|---|
| GET | `/routines` | ✅ Bearer | 200, 401, 500 | Lista rutinas del usuario |
| GET | `/routines/:id` | ✅ Bearer | 200, 401, 404, 500 | Detalle con exercises embebidos |
| POST | `/routines` | ✅ Bearer | 201, 400, 401, 500 | Crear rutina |
| PUT | `/routines/:id` | ✅ Bearer | 200, 400, 401, 403, 404, 500 | Actualizar rutina |
| DELETE | `/routines/:id` | ✅ Bearer | 204, 401, 403, 404 | Eliminar rutina |

**Regla:** solo una rutina activa (`is_active=true`) por usuario. Al crear/activar una, las demás se desactivan automáticamente.

**Query params en GET /routines:**

- “Oculta a los activos” activo_only=true

### Workouts

| Método | Endpoint | Auth | Códigos | Descripción |
|---|---|---|---|---|
| GET | `/workouts` | ✅ Bearer | 200, 401, 500 | Lista sesiones del usuario |
| GET | `/workouts/stats` | ✅ Bearer | 200, 401, 500 | Estadísticas (total_sessions, total_sets, total_volume_kg, current_streak_days, last_session) |
| GET | `/workouts/:id` | ✅ Bearer | 200, 401, 404, 500 | Detalle con sets embebidos + exercise info |
| POST | `/workouts` | ✅ Bearer | 201, 400, 401, 409, 500 | Iniciar sesión de entrenamiento |
| PUT | `/workouts/:id` | ✅ Bearer | 200, 400, 401, 403, 404, 409, 500 | Actualizar (finalizar / notas) |
| DELETE | `/workouts/:id` | ✅ Bearer | 204, 401, 403, 404 | Eliminar sesión |
| POST | `/workouts/:id/sets` | ✅ Bearer | 201, 400, 401, 403, 404, 409, 500 | Registrar serie |
| PUT | `/workouts/:id/sets/:setId` | ✅ Bearer | 200, 400, 401, 403, 404, 500 | Editar serie |
| DELETE | `/workouts/:id/sets/:setId` | ✅ Bearer | 204, 401, 403, 404 | Eliminar serie |

**Regla:** solo 1 sesión activa (`finished_at IS NULL`) por usuario. Iniciar otra devuelve `409 Conflict` con `details.active_session_id`.

**Regla:** no se pueden agregar series a una sesión finalizada (`409`).

**Regla:** `set_number` lo calcula el backend (`MAX + 1` por ejercicio en la sesión). Máximo 20 series por ejercicio.

**Query params en GET /workouts:**

- `?active=true` (solo sesión activa)
- `?limit=N` (default 50, max 200)

**Response de GET /workouts/stats:**

```json
{
  "success": true,
  "data": {
    "total_sessions": 12,
    "total_sets": 144,
    "total_volume_kg": 18450.5,
    "current_streak_days": 3,
    "last_session": {
      "id": "uuid",
      "routine_name": "Push Day",
      "finished_at": "2026-10-18T11:00:00Z"
    }
  },
  "message": "OK"
}
```

---

## Endpoints propuestos (futuros)

### Nutrición

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/meals` | Comidas del día |
| POST | `/meals` | Crear comida |
| POST | `/meals/:id/items` | Agregar alimento |
| GET | `/nutrition/goal` | Obtener objetivo |
| PUT | `/nutrition/goal` | Actualizar objetivo |

## Formato de respuesta

### Éxito

```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

### Error

```json
{
  "success": false,
  "error": "Descripción del error",
  "details": "Detalle opcional"
}
```

## Autenticación

Los endpoints protegidos requieren header:

```
Authorization: Bearer <supabase-jwt>
```

El backend verifica el JWT contra el JWKS de Supabase:

```
https://[PROJECT-REF].supabase.co/auth/v1/.well-known/jwks.json
```

## Códigos de error

| Código | Significado |
|---|---|
| 400 | Bad Request |
| 401 | Unauthorized (token faltante o inválido) |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Error |
