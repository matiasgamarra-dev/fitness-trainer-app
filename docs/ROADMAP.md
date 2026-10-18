# ðŸ—ºï¸ Roadmap del Proyecto

Plan de desarrollo continuo, por fases y sprints.

## Estado actual

**Fase**: 1 â€” MVP
**Sprint**: 2 — Perfil y Onboarding ✅ (COMPLETADO)
**Progreso global**: 40%

---

## Fase 0 â€” Fundaciones (Semana 1) âœ…

### Sprint 0 â€” Setup âœ… (COMPLETADO)

- [x] Crear repositorio en GitHub
- [x] Instalar Git y Node localmente
- [x] Estructura profesional de carpetas
- [x] DocumentaciÃ³n inicial (README, LICENSE, CONTRIBUTING)
- [x] Docs extendidos (ARCHITECTURE, API, DEVELOPMENT)

### Sprint 0.5 â€” PlanificaciÃ³n + Setup tÃ©cnico âœ… (COMPLETADO)

**PlanificaciÃ³n:**
- [x] Documento de visiÃ³n (PRODUCT.md)
- [x] Modelo de datos (DATA_MODEL.md)
- [x] Stack tecnolÃ³gico (STACK.md)
- [x] Wireframes (WIREFRAMES.md)
- [x] Roadmap detallado (este archivo)

**Setup tÃ©cnico:**
- [x] Reestructurar a monorepo (apps/api, apps/web, packages/shared)
- [x] Configurar npm workspaces
- [x] Configurar TypeScript (raÃ­z + apps)
- [x] Configurar ESLint + Prettier
- [x] Configurar scripts de desarrollo
- [x] Instalar dependencias base del backend (Express)
- [x] Primer endpoint "hola mundo" funcionando
- [x] Script Ãºnico de docs (`docs.mjs`)

---

## Fase 1 â€” MVP (Semanas 2-6)

### Sprint 1 â€” AutenticaciÃ³n âœ… (COMPLETADO)

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

### Sprint 2 — Perfil y Onboarding ✅ (COMPLETADO)

**Backend:**
- [x] Modelo `BodyMeasurement` (SQL en Supabase)
- [x] Endpoints de perfil (GET/PUT)
- [x] Endpoints de medidas (CRUD)
- [x] Tests

**Frontend:**
- [x] Onboarding (4 pasos)
- [x] Pantalla de perfil
- [x] EdiciÃ³n de datos
- [x] Tests

### Sprint 3 â€” Rutinas (Semana 4)

**Backend:**
- [x] Tablas `exercises`, `routines`, `routine_exercises`
- [x] Seed de ~50 ejercicios base
- [x] CRUD de rutinas
- [x] Endpoints de ejercicios

**Frontend:**
- [x] Lista de rutinas
- [x] Detalle de rutina
- [x] Crear/editar rutina
- [x] Selector de ejercicios

### Sprint 4 â€” Entrenamiento (Semana 5)

**Backend:**
- [ ] Tablas `workout_sessions`, `workout_sets`
- [ ] Endpoints de sesiones
- [ ] Endpoint de registros de series

**Frontend:**
- [ ] Pantalla de entrenamiento activo
- [ ] Timer de descanso
- [ ] Historial de entrenamientos
- [ ] EstadÃ­sticas bÃ¡sicas

### Sprint 5 â€” NutriciÃ³n (Semana 6)

**Backend:**
- [ ] Tablas `foods`, `meals`, `meal_items`, `nutrition_goals`
- [ ] Seed de ~200 alimentos
- [ ] Endpoints de comidas
- [ ] Buscador de alimentos

**Frontend:**
- [ ] Pantalla de nutriciÃ³n diaria
- [ ] Buscador de alimentos
- [ ] AÃ±adir comidas

### Sprint 6 â€” Progreso y Deploy (Semana 7)

**Frontend:**
- [ ] Dashboard con resumen
- [ ] Pantalla de progreso con grÃ¡ficos (Recharts)
- [ ] Comparativa de perÃ­odos

**Deploy:**
- [ ] Deploy backend en Railway
- [ ] Deploy frontend en Vercel
- [ ] Configurar variables de entorno en prod
- [ ] Dominio personalizado

---

## Fase 2 â€” ConsolidaciÃ³n (Semanas 8-12)

### Sprint 7 â€” UX y detalles
- [ ] Animaciones y transiciones
- [ ] Loading states pulidos
- [ ] Empty states
- [ ] Toasts y notificaciones
- [ ] Modo oscuro / claro

### Sprint 8 â€” Rutinas predefinidas
- [ ] Biblioteca de rutinas (full body, PPL, etc.)
- [ ] Plantillas personalizables
- [ ] Duplicar rutinas

### Sprint 9 â€” AnÃ¡lisis y grÃ¡ficos
- [ ] GrÃ¡fico de volumen semanal
- [ ] Progreso de fuerza por ejercicio (1RM estimado)
- [ ] Adherencia al plan (%)
- [ ] Reportes semanales/mensuales

### Sprint 10 â€” PWA y offline
- [ ] Configurar service worker
- [ ] Modo offline
- [ ] SincronizaciÃ³n al reconectar
- [ ] Instalable en mÃ³vil

### Sprint 11 â€” Notificaciones
- [ ] Recordatorio de entrenamiento
- [ ] Recordatorio de comidas
- [ ] Notificaciones push

### Sprint 12 â€” ExportaciÃ³n
- [ ] Exportar datos a CSV
- [ ] Exportar datos a JSON
- [ ] Importar desde otras apps

---

## Fase 3 â€” Profesional / Social (Meses 4-6)

### Sprint 13 â€” Modo entrenador
- [ ] Roles: user / trainer / admin
- [ ] Panel de entrenador
- [ ] GestiÃ³n de clientes

### Sprint 14 â€” Chat y feedback
- [ ] Chat entrenador-cliente
- [ ] Comentarios en entrenamientos

### Sprint 15 â€” Integraciones
- [ ] Apple Health
- [ ] Google Fit
- [ ] Strava

### Sprint 16 â€” IA y recomendaciones
- [ ] Recomendaciones de rutinas
- [ ] Sugerencias nutricionales
- [ ] DetecciÃ³n de estancamiento

### Sprint 17 â€” Social
- [ ] Amigos / seguidores
- [ ] Compartir progreso
- [ ] Retos y desafÃ­os

### Sprint 18 â€” MonetizaciÃ³n (opcional)
- [ ] Plan gratis vs premium
- [ ] Suscripciones (Stripe)

---

## Backlog (ideas futuras)

- Recetas paso a paso con macros
- Video llamadas con entrenadores
- Realidad aumentada para forma de ejercicios
- Comunidad con foros
- IntegraciÃ³n con gimnasios
- Programa de referidos

---

## Convenciones de este roadmap

- âœ… Se actualiza al terminar cada sprint
- âœ… Los items nuevos se agregan al backlog
- âœ… Un sprint = 1 semana de trabajo
- âœ… Se commitea cada avance
- âœ… El progreso se refleja en el historial de commits

---

## MÃ©tricas por fase

| Fase | DuraciÃ³n | Objetivo | Estado |
|---|---|---|---|
| Fase 0 | 1 semana | Proyecto documentado y listo | âœ… |
| Fase 1 | 6 semanas | MVP funcional y deployado | ðŸŸ¡ En curso |
| Fase 2 | 5 semanas | Producto pulido y completo | â³ |
| Fase 3 | 12 semanas | Plataforma profesional | â³ |
