# ðŸ”Œ API Reference

## Base URL

```
http://localhost:3000/api/v1
```

## Endpoints implementados

### Health

| MÃ©todo | Endpoint | Auth | DescripciÃ³n |
|---|---|---|---|
| GET | `/health` | âŒ | Health check del servidor |

### Auth

| MÃ©todo | Endpoint | Auth | DescripciÃ³n |
|---|---|---|---|
| GET | `/auth/me` | âœ… Bearer | Devuelve perfil del usuario autenticado |

**Nota:** El registro y login **NO se hacen contra nuestra API**.
Se hacen directamente contra **Supabase Auth** desde el frontend:

- `supabase.auth.signUp({ email, password })` â†’ registro
- `supabase.auth.signInWithPassword({ email, password })` â†’ login email
- `supabase.auth.signInWithOAuth({ provider: 'google' })` â†’ login Google
- `supabase.auth.signOut()` â†’ logout


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

- `?active_only=true` (solo rutinas activas)
---

## Endpoints propuestos (futuros)

### Entrenamientos

| MÃ©todo | Endpoint | DescripciÃ³n |
|---|---|---|
| GET | `/workouts` | Listar entrenamientos |
| POST | `/workouts` | Registrar entrenamiento |
| GET | `/workouts/stats` | EstadÃ­sticas |

### NutriciÃ³n

| MÃ©todo | Endpoint | DescripciÃ³n |
|---|---|---|
| GET | `/meals` | Comidas del dÃ­a |
| POST | `/meals` | Crear comida |
| POST | `/meals/:id/items` | Agregar alimento |
| GET | `/nutrition/goal` | Obtener objetivo |
| PUT | `/nutrition/goal` | Actualizar objetivo |

## Formato de respuesta

### Ã‰xito

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
  "error": "DescripciÃ³n del error",
  "details": "Detalle opcional"
}
```

## AutenticaciÃ³n

Los endpoints protegidos requieren header:

```
Authorization: Bearer <supabase-jwt>
```

El backend verifica el JWT contra el JWKS de Supabase:

```
https://[PROJECT-REF].supabase.co/auth/v1/.well-known/jwks.json
```

## CÃ³digos de error

| CÃ³digo | Significado |
|---|---|
| 400 | Bad Request |
| 401 | Unauthorized (token faltante o invÃ¡lido) |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Error |
