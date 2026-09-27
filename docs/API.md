# 🔌 API Reference

## Base URL
http://localhost:3000/api/v1

text

## Endpoints (propuestos)

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /auth/register | Registrar usuario |
| POST | /auth/login | Iniciar sesión |
| POST | /auth/logout | Cerrar sesión |

### Rutinas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /routines | Listar rutinas |
| POST | /routines | Crear rutina |
| GET | /routines/:id | Obtener rutina |
| PUT | /routines/:id | Actualizar rutina |
| DELETE | /routines/:id | Eliminar rutina |

### Entrenamientos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /workouts | Listar entrenamientos |
| POST | /workouts | Registrar entrenamiento |
| GET | /workouts/stats | Estadísticas |

## Formato de respuesta

```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
Códigos de error
Código	Significado
400	Bad Request
401	Unauthorized
404	Not Found
500	Internal Error