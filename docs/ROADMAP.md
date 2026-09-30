# 🗺️ Roadmap del Proyecto

Plan de desarrollo continuo, por fases y sprints.

## Estado actual

**Fase**: 1 — MVP
**Sprint**: 2 — Perfil y Onboarding (PRÓXIMO)
**Progreso global**: 25%

---

## Fase 0 — Fundaciones (Semana 1) ✅

### Sprint 0 — Setup ✅ (COMPLETADO)

- [x] Crear repositorio en GitHub
- [x] Instalar Git y Node localmente
- [x] Estructura profesional de carpetas
- [x] Documentación inicial (README, LICENSE, CONTRIBUTING)
- [x] Docs extendidos (ARCHITECTURE, API, DEVELOPMENT)

### Sprint 0.5 — Planificación + Setup técnico ✅ (COMPLETADO)

**Planificación:**
- [x] Documento de visión (PRODUCT.md)
- [x] Modelo de datos (DATA_MODEL.md)
- [x] Stack tecnológico (STACK.md)
- [x] Wireframes (WIREFRAMES.md)
- [x] Roadmap detallado (este archivo)

**Setup técnico:**
- [x] Reestructurar a monorepo (apps/api, apps/web, packages/shared)
- [x] Configurar npm workspaces
- [x] Configurar TypeScript (raíz + apps)
- [x] Configurar ESLint + Prettier
- [x] Configurar scripts de desarrollo
- [x] Instalar dependencias base del backend (Express)
- [x] Primer endpoint "hola mundo" funcionando
- [x] Script único de docs (`docs.mjs`)

---

## Fase 1 — MVP (Semanas 2-6)

### Sprint 1 — Autenticación ✅ (COMPLETADO)

**Infraestructura:**
- [x] Crear proyecto Supabase
- [x] Configurar Google OAuth
- [x] Conectar Google con Supabase
- [x] Crear tabla `users` + RLS + triggers

**Backend:**
- [x] Instalar `@supabase/supabase-js`
- [x] Configurar cliente Supabase (`supabaseAdmin`)
- [x] Instalar `jose` para verificar JWT
- [x] Middleware `verifyUser` con JWKS
- [x] Endpoint `GET /api/v1/auth/me`
- [x] Configurar Vitest
- [x] Tests de health + auth (5/5)

**Frontend:**
- [x] Setup Vite + React + TypeScript + Tailwind v4
- [x] Cliente Supabase
- [x] Store Zustand (`useAuthStore`)
- [x] Pantalla Login
- [x] Pantalla Registro
- [x] Pantalla AuthCallback (OAuth)
- [x] Pantalla Dashboard
- [x] ProtectedRoute
- [x] React Router
- [x] Tests de Login + Register (4/4)

**Docs:**
- [x] docs/AUTH.md
- [x] docs/DEPLOYMENT.md
- [x] docs/SECURITY.md

### Sprint 2 — Perfil y Onboarding (Semana 3) ← PRÓXIMO

**Backend:**
- [x] Modelo `BodyMeasurement` (SQL en Supabase)
- [x] Endpoints de perfil (GET/PUT)
- [x] Endpoints de medidas (CRUD)
- [ ] Tests

**Frontend:**
- [x] Onboarding (4 pasos)
- [x] Pantalla de perfil
- [x] Edición de datos
- [ ] Tests

### Sprint 3 — Rutinas (Semana 4)

**Backend:**
- [ ] Tablas `exercises`, `routines`, `routine_exercises`
- [ ] Seed de ~50 ejercicios base
- [ ] CRUD de rutinas
- [ ] Endpoints de ejercicios

**Frontend:**
- [ ] Lista de rutinas
- [ ] Detalle de rutina
- [ ] Crear/editar rutina
- [ ] Selector de ejercicios

### Sprint 4 — Entrenamiento (Semana 5)

**Backend:**
- [ ] Tablas `workout_sessions`, `workout_sets`
- [ ] Endpoints de sesiones
- [ ] Endpoint de registros de series

**Frontend:**
- [ ] Pantalla de entrenamiento activo
- [ ] Timer de descanso
- [ ] Historial de entrenamientos
- [ ] Estadísticas básicas

### Sprint 5 — Nutrición (Semana 6)

**Backend:**
- [ ] Tablas `foods`, `meals`, `meal_items`, `nutrition_goals`
- [ ] Seed de ~200 alimentos
- [ ] Endpoints de comidas
- [ ] Buscador de alimentos

**Frontend:**
- [ ] Pantalla de nutrición diaria
- [ ] Buscador de alimentos
- [ ] Añadir comidas

### Sprint 6 — Progreso y Deploy (Semana 7)

**Frontend:**
- [ ] Dashboard con resumen
- [ ] Pantalla de progreso con gráficos (Recharts)
- [ ] Comparativa de períodos

**Deploy:**
- [ ] Deploy backend en Railway
- [ ] Deploy frontend en Vercel
- [ ] Configurar variables de entorno en prod
- [ ] Dominio personalizado

---

## Fase 2 — Consolidación (Semanas 8-12)

### Sprint 7 — UX y detalles
- [ ] Animaciones y transiciones
- [ ] Loading states pulidos
- [ ] Empty states
- [ ] Toasts y notificaciones
- [ ] Modo oscuro / claro

### Sprint 8 — Rutinas predefinidas
- [ ] Biblioteca de rutinas (full body, PPL, etc.)
- [ ] Plantillas personalizables
- [ ] Duplicar rutinas

### Sprint 9 — Análisis y gráficos
- [ ] Gráfico de volumen semanal
- [ ] Progreso de fuerza por ejercicio (1RM estimado)
- [ ] Adherencia al plan (%)
- [ ] Reportes semanales/mensuales

### Sprint 10 — PWA y offline
- [ ] Configurar service worker
- [ ] Modo offline
- [ ] Sincronización al reconectar
- [ ] Instalable en móvil

### Sprint 11 — Notificaciones
- [ ] Recordatorio de entrenamiento
- [ ] Recordatorio de comidas
- [ ] Notificaciones push

### Sprint 12 — Exportación
- [ ] Exportar datos a CSV
- [ ] Exportar datos a JSON
- [ ] Importar desde otras apps

---

## Fase 3 — Profesional / Social (Meses 4-6)

### Sprint 13 — Modo entrenador
- [ ] Roles: user / trainer / admin
- [ ] Panel de entrenador
- [ ] Gestión de clientes

### Sprint 14 — Chat y feedback
- [ ] Chat entrenador-cliente
- [ ] Comentarios en entrenamientos

### Sprint 15 — Integraciones
- [ ] Apple Health
- [ ] Google Fit
- [ ] Strava

### Sprint 16 — IA y recomendaciones
- [ ] Recomendaciones de rutinas
- [ ] Sugerencias nutricionales
- [ ] Detección de estancamiento

### Sprint 17 — Social
- [ ] Amigos / seguidores
- [ ] Compartir progreso
- [ ] Retos y desafíos

### Sprint 18 — Monetización (opcional)
- [ ] Plan gratis vs premium
- [ ] Suscripciones (Stripe)

---

## Backlog (ideas futuras)

- Recetas paso a paso con macros
- Video llamadas con entrenadores
- Realidad aumentada para forma de ejercicios
- Comunidad con foros
- Integración con gimnasios
- Programa de referidos

---

## Convenciones de este roadmap

- ✅ Se actualiza al terminar cada sprint
- ✅ Los items nuevos se agregan al backlog
- ✅ Un sprint = 1 semana de trabajo
- ✅ Se commitea cada avance
- ✅ El progreso se refleja en el historial de commits

---

## Métricas por fase

| Fase | Duración | Objetivo | Estado |
|---|---|---|---|
| Fase 0 | 1 semana | Proyecto documentado y listo | ✅ |
| Fase 1 | 6 semanas | MVP funcional y deployado | 🟡 En curso |
| Fase 2 | 5 semanas | Producto pulido y completo | ⏳ |
| Fase 3 | 12 semanas | Plataforma profesional | ⏳ |
