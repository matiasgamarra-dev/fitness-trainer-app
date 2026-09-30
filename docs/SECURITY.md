# 🔒 Seguridad

Prácticas y decisiones de seguridad del proyecto.

## Reglas de oro

1. **NUNCA commitear `.env`** — solo `.env.example`
2. **NUNCA exponer `SUPABASE_SERVICE_ROLE_KEY`** en el frontend
3. **NUNCA pasar credenciales por chat/email/PR**
4. **SIEMPRE usar HTTPS** en producción
5. **SIEMPRE rotar** claves si se sospecha filtración

## Gestión de secretos

| Secreto | Dónde vive | Quién lo usa |
|---|---|---|
| `SUPABASE_URL` | `.env` + Bitwarden | Backend + Frontend |
| `SUPABASE_ANON_KEY` | `.env` + Bitwarden | Backend + Frontend (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` + Bitwarden | **Solo backend** |
| DB password | Bitwarden | Solo conexión directa |
| Google OAuth Client ID/Secret | Bitwarden + Supabase | Solo Supabase |

## Row Level Security (RLS)

Todas las tablas de `public` tienen RLS habilitado.

### Políticas en `public.users`

| Operación | Política |
|---|---|
| SELECT | Solo tu propio perfil (`auth.uid() = id`) |
| INSERT | Solo tu propio perfil |
| UPDATE | Solo tu propio perfil |
| DELETE | Sin política (nadie puede borrar) |

### Futuras tablas

Siempre:
1. `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
2. Crear políticas explícitas
3. Testear con un usuario "atacante"

## Verificación de JWT

El backend **NUNCA** guarda un `JWT_SECRET`. Usa:
1. `jose.createRemoteJWKSet` para descargar claves públicas de Supabase
2. Verifica firma, expiración, issuer y audience
3. Cachea las claves automáticamente

**Ventaja:** si Supabase rota claves, el backend no necesita cambios.

## Buenas prácticas

- **Validación con Zod** en todos los endpoints
- **Tipos estrictos** en TypeScript
- **Helmet** para headers HTTP seguros
- **CORS** configurado explícitamente
- **Errores genéricos** al cliente

## Checklist antes de cada release

- [ ] `npm audit` sin vulnerabilidades altas
- [ ] `.env` no está en git
- [ ] No hay claves hardcodeadas
- [ ] RLS activo en todas las tablas
- [ ] CORS no permite `*` en producción
- [ ] HTTPS forzado en producción
- [ ] Logs no incluyen tokens ni passwords

## Reportar vulnerabilidades

**NO abras un issue público.** Contactá a **matiasgamarra.dev@gmail.com**.
