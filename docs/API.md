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

## Endpoints propuestos (futuros)

### Rutinas

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/routines` | Listar rutinas |
| POST | `/routines` | Crear rutina |
| GET | `/routines/:id` | Obtener rutina |
| PUT | `/routines/:id` | Actualizar rutina |
| DELETE | `/routines/:id` | Eliminar rutina |

### Entrenamientos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/workouts` | Listar entrenamientos |
| POST | `/workouts` | Registrar entrenamiento |
| GET | `/workouts/stats` | Estadísticas |

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
