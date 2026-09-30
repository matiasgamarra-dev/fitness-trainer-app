# 🗄️ Supabase — Migraciones

Este directorio contiene las **migraciones SQL versionadas** del proyecto.

## Regla de oro

> **NUNCA ejecutar SQL directamente en el SQL Editor de Supabase para cambios de schema.**

Todo cambio de schema debe:

1. Escribirse como archivo `.sql` en `supabase/migrations/`
2. Commitearse a Git
3. Ejecutarse en Supabase (SQL Editor o CLI)
4. Verificarse

## Estructura

```
supabase/
└── migrations/
    ├── 20260927000001_create_users_table.sql
    ├── 20260927000002_users_rls_policies.sql
    ├── 20260927000003_create_handle_new_user_trigger.sql
    └── 20260929000001_create_body_measurements.sql
```

## Convención de nombres

`YYYYMMDDHHMMSS_descripcion_corta.sql`

Ejemplo: `20260929000001_create_body_measurements.sql`

## Cómo aplicar una migración

### Opción A — SQL Editor (manual)

1. Abrir Supabase Dashboard → SQL Editor
2. Pegar el contenido del archivo `.sql`
3. Ejecutar
4. Verificar en Table Editor

### Opción B — Supabase CLI (recomendado a futuro)

```cmd
supabase db push
```

Requiere tener Supabase CLI instalado y el proyecto linkeado.

## Estado actual

| Migración | Sprint | Estado |
|---|---|---|
| create_users_table | 1 | ✅ Aplicada |
| users_rls_policies | 1 | ✅ Aplicada |
| create_handle_new_user_trigger | 1 | ✅ Aplicada |
| create_body_measurements | 2 | ✅ Aplicada |

## Referencias

- [docs/DATABASE.md](../docs/DATABASE.md) — Documentación detallada
- [docs/DATA_MODEL.md](../docs/DATA_MODEL.md) — Modelo lógico
- [docs/SECURITY.md](../docs/SECURITY.md) — Políticas de seguridad
