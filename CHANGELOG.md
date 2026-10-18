# 📝 Changelog

Basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

## [Unreleased]

### Added
- nutricion: seed de 200 alimentos base con macros por 100g (2026-10-18)
- nutricion: crea tablas foods, meals, meal_items, nutrition_goals + RLS (2026-10-18)
- agrega 15 tests backend + 25 tests web para workouts (2026-10-18)
- Sprint 4: entrenamiento activo completo (migracion, schemas, endpoints, hooks, 4 pantallas, 40 tests) (2026-10-18)
- Sprint 3: rutinas con exercises, routines y routine_exercises + endpoints + UI (2026-10-18)
- agrega 15 tests de Profile, Onboarding y Measurements (19 tests web totales) (2026-10-18)
- agrega cliente API, hooks de React Query, layout, onboarding, perfil y medidas (E.2 + E.3) (2026-09-30)
- Sprint 0.5: monorepo con npm workspaces (apps/api, apps/web, packages/shared)
- Configuración de TypeScript base + tsconfig por workspace
- ESLint 10 con flat config + Prettier
- Servidor Express 5 con endpoint `GET /api/v1/health`
- Validación de variables de entorno con Zod
- Documentación inicial completa
- Estructura profesional de carpetas
- LICENSE MIT

### Fixed
- workout_sets usa ALTER TABLE ADD CONSTRAINT para FKs (no inline) (2026-10-18)

### Changed
- API.md con 9 endpoints de workouts (2026-10-18)
- DATABASE.md con secciones de workout_sessions y workout_sets (2026-10-18)

## [0.1.0] - 2026-09-27

### Added
- Primera versión base del proyecto
- Configuración de Git y Node
- package.json con metadatos