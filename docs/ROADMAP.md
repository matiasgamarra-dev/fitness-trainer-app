# 🗺️ Roadmap del Proyecto

Plan de desarrollo continuo, por fases y sprints.

## Estado actual

**Fase**: 0 — Fundaciones
**Sprint**: 0 — Setup del proyecto
**Progreso global**: 15%

---

## Fase 0 — Fundaciones (Semana 1)

### Sprint 0 — Setup ✅ (COMPLETADO)

- [x] Crear repositorio en GitHub
- [x] Instalar Git y Node localmente
- [x] Estructura profesional de carpetas
- [x] Documentación inicial (README, LICENSE, CONTRIBUTING)
- [x] Docs extendidos (ARCHITECTURE, API, DEVELOPMENT)

### Sprint 0.5 — Planificación (EN CURSO)

- [x] Documento de visión (PRODUCT.md)
- [x] Modelo de datos (DATA_MODEL.md)
- [x] Stack tecnológico (STACK.md)
- [x] Wireframes (WIREFRAMES.md)
- [x] Roadmap detallado (este archivo)
- [ ] Configurar TypeScript en el proyecto
- [ ] Configurar ESLint + Prettier
- [ ] Configurar testing (Jest + Vitest)
- [ ] Configurar base de datos local (PostgreSQL)
- [ ] Configurar Prisma

---

## Fase 1 — MVP (Semanas 2-6)

### Sprint 1 — Autenticación (Semana 2)

**Backend:**
- [ ] Modelo `User` en Prisma
- [ ] Endpoint `POST /auth/register`
- [ ] Endpoint `POST /auth/login`
- [ ] Endpoint `GET /auth/me`
- [ ] Middleware JWT
- [ ] Hashing con bcrypt
- [ ] Validación con Zod

**Frontend:**
- [ ] Pantalla Login
- [ ] Pantalla Registro
- [ ] Store de autenticación (Zustand)
- [ ] Guard de rutas protegidas
- [ ] Interceptor de axios con JWT

**Tests:**
- [ ] Tests de auth (backend)
- [ ] Tests de componentes Login/Registro

### Sprint 2 — Perfil y Onboarding (Semana 3)

**Backend:**
- [ ] Modelo `BodyMeasurement`
- [ ] Endpoints de perfil (GET/PUT)
- [ ] Endpoints de medidas (CRUD)

**Frontend:**
- [ ] Onboarding (4 pasos)
- [ ] Pantalla de perfil
- [ ] Edición de datos

### Sprint 3 — Rutinas (Semana 4)

**Backend:**
- [ ] Modelos `Exercise`, `Routine`, `RoutineExercise`
- [ ] Seed de ejercicios base (~50 ejercicios)
- [ ] CRUD de rutinas
- [ ] Endpoints de ejercicios

**Frontend:**
- [ ] Lista de rutinas
- [ ] Detalle de rutina
- [ ] Crear/editar rutina
- [ ] Selector de ejercicios

### Sprint 4 — Entrenamiento (Semana 5)

**Backend:**
- [ ] Modelos `WorkoutSession`, `WorkoutSet`
- [ ] Endpoints de sesiones
- [ ] Endpoint de registros de series

**Frontend:**
- [ ] Pantalla de entrenamiento activo
- [ ] Timer de descanso
- [ ] Historial de entrenamientos
- [ ] Estadísticas básicas

### Sprint 5 — Nutrición (Semana 6)

**Backend:**
- [ ] Modelos `Food`, `Meal`, `MealItem`, `NutritionGoal`
- [ ] Seed de alimentos base (~200 alimentos)
- [ ] Endpoints de comidas
- [ ] Buscador de alimentos
- [ ] Calculadora de macros

**Frontend:**
- [ ] Pantalla de nutrición diaria
- [ ] Buscador de alimentos
- [ ] Añadir comidas
- [ ] Configurar objetivo nutricional

### Sprint 6 — Progreso y Deploy (Semana 7)

**Frontend:**
- [ ] Dashboard con resumen
- [ ] Pantalla de progreso con gráficos
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
- [ ] Modo offline (registros locales)
- [ ] Sincronización al reconectar
- [ ] Instalable en móvil

### Sprint 11 — Notificaciones y recordatorios
- [ ] Recordatorio de entrenamiento
- [ ] Recordatorio de comidas
- [ ] Notificaciones push

### Sprint 12 — Exportación y respaldo
- [ ] Exportar datos a CSV
- [ ] Exportar datos a JSON
- [ ] Importar desde otras apps (formato estándar)

---

## Fase 3 — Profesional / Social (Meses 4-6)

### Sprint 13 — Modo entrenador
- [ ] Roles: user / trainer / admin
- [ ] Panel de entrenador
- [ ] Gestión de clientes
- [ ] Asignar rutinas a clientes
- [ ] Ver progreso de clientes

### Sprint 14 — Chat y feedback
- [ ] Chat entrenador-cliente
- [ ] Comentarios en entrenamientos
- [ ] Feedback en rutinas

### Sprint 15 — Integraciones
- [ ] Apple Health
- [ ] Google Fit
- [ ] Strava
- [ ] Importar desde MyFitnessPal

### Sprint 16 — IA y recomendaciones
- [ ] Recomendaciones de rutinas
- [ ] Sugerencias nutricionales
- [ ] Detección de estancamiento
- [ ] Ajuste automático de cargas

### Sprint 17 — Social
- [ ] Amigos / seguidores
- [ ] Compartir progreso
- [ ] Retos y desafíos
- [ ] Ranking semanal

### Sprint 18 — Monetización (opcional)
- [ ] Plan gratis vs premium
- [ ] Suscripciones (Stripe)
- [ ] Marketplace de entrenadores

---

## Backlog (ideas futuras)

- Recetas paso a paso con macros
- Video llamadas con entrenadores
- Realidad aumentada para forma de ejercicios
- Comunidad con foros
- Modo competencia
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

| Fase | Duración | Objetivo |
|---|---|---|
| Fase 0 | 1 semana | Proyecto documentado y listo para codear |
| Fase 1 | 6 semanas | MVP funcional y deployado |
| Fase 2 | 5 semanas | Producto pulido y completo |
| Fase 3 | 12 semanas | Plataforma profesional |