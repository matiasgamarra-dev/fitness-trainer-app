# 🤖 AI Context — Manual de Continuidad

> Este documento permite que **cualquier IA** (ChatGPT, Claude, Gemini, Copilot) continúe el desarrollo del proyecto sin perder contexto. Actualizalo cada vez que cierres una sesión de trabajo.

---

## 📌 Estado actual del proyecto

| Campo | Valor |
|---|---|
| **Nombre** | Fitness Trainer App |
| **Repo** | https://github.com/matiasgamarra-dev/fitness-trainer-app |
| **Owner** | Matías Gamarra (@matiasgamarra-dev) |
| **Rama actual** | `main` |
| **Último commit** | `627de90 - feat(api): agrega servidor Express con endpoint /api/v1/health (8 seconds ago)` |
| **Cambios sin commitear** | ✅ No |
| **Última actualización** | 2026-09-27 |


---

## 🎯 Objetivo del proyecto

App web de seguimiento personal que integra:
- Entrenamiento físico (rutinas, series, reps, peso)
- Nutrición (calorías, macros, comidas)
- Progreso (peso, medidas, gráficos)

Ver [PRODUCT.md](./PRODUCT.md) para visión completa.

---

## 🛠️ Stack decidido

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + TypeScript |
| Estilos | Tailwind CSS |
| Estado | Zustand + React Query |
| Backend | Node.js + Express + TypeScript |
| Base de datos | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Validación | Zod |
| Testing | Vitest + Jest |
| CI/CD | GitHub Actions |
| Deploy | Vercel (front) + Railway (back) |

Ver [STACK.md](./STACK.md) para justificación.

---

## 🏗️ Arquitectura (Monorepo)
fitness-trainer-app/
├── apps/
│ ├── api/ → Backend Express + TypeScript
│ └── web/ → Frontend React + Vite + TS
├── packages/
│ └── shared/ → Tipos y utilidades compartidas
├── docs/ → Documentación del proyecto
├── scripts/ → Scripts de automatización de docs
├── .github/ → CI/CD y plantillas
├── package.json → raíz con workspaces
└── README.md

text

**Convención de nombres**:
- Archivos: `kebab-case.ts`
- Componentes: `PascalCase.tsx`
- Funciones: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`

---

## 🤖 Scripts de automatización

Ubicados en `scripts/`. **Usar SIEMPRE en vez de editar docs a mano.**

| Comando | Qué hace |
|---|---|
| `npm run docs:sync` | Sincroniza AI_CONTEXT + verifica todo |
| `npm run docs:check` | Verifica integridad de la documentación |
| `npm run docs:context` | Regenera AI_CONTEXT con datos de Git |
| `npm run docs:changelog -- --type=feat --message="..."` | Agrega entrada al CHANGELOG |
| `npm run docs:roadmap -- --item="..."` | Marca item del ROADMAP como ✅ |

**Reglas para la IA que continúe:**
1. **NUNCA** editar CHANGELOG.md a mano → usar `docs:changelog`
2. **NUNCA** marcar items del ROADMAP a mano → usar `docs:roadmap`
3. **SIEMPRE** ejecutar `npm run docs:sync` antes de commitear
4. **SIEMPRE** ejecutar `npm run docs:check` antes de push

---

## 📁 Reglas para la IA que continúe

1. **Leer primero** este archivo (`AI_CONTEXT.md`)
2. **Revisar** `ROADMAP.md` para saber qué sprint toca
3. **Revisar** `DATA_MODEL.md` antes de tocar la base de datos
4. **Revisar** `STACK.md` antes de agregar dependencias
5. **Commitear por cada feature** con Conventional Commits
6. **Actualizar este documento** al terminar la sesión (usando `npm run docs:sync`)
7. **Marcar en ROADMAP.md** los items completados (usando `npm run docs:roadmap`)
8. **Nunca romper** la convención de commits
9. **Preguntar al usuario** antes de decisiones grandes

### Convención de commits obligatoria
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato
refactor: refactorización
test: tests
chore: mantenimiento
perf: performance

text

Ejemplo: `feat(auth): agrega endpoint de registro`

---

## ✅ Lo que ya está hecho

- [x] Repositorio en GitHub creado y configurado
- [x] Estructura de carpetas base
- [x] Documentación completa (README, LICENSE, CONTRIBUTING, CHANGELOG)
- [x] Documentación de producto (PRODUCT, DATA_MODEL, STACK, WIREFRAMES, ROADMAP)
- [x] Scripts de automatización de documentación
- [x] CI/CD configurado (`.github/workflows/ci.yml`)
- [x] Git configurado localmente (user.name, user.email)
- [x] Node.js 24.19.0 y npm 11.17.0 instalados
- [x] Git 2.55.0 instalado

---

## 🔄 Lo que falta (Sprint 0.5)

- [ ] Reestructurar a monorepo (apps/api, apps/web, packages/shared)
- [ ] Configurar npm workspaces
- [ ] Configurar TypeScript (raíz + apps)
- [ ] Configurar ESLint + Prettier
- [ ] Configurar scripts de desarrollo
- [ ] Instalar dependencias base del backend (Express)
- [ ] Primer endpoint "hola mundo" funcionando

---

## 📋 Próximos sprints (resumen)

| Sprint | Objetivo |
|---|---|
| Sprint 1 | Autenticación (register, login, JWT) |
| Sprint 2 | Perfil y onboarding |
| Sprint 3 | Rutinas |
| Sprint 4 | Entrenamiento activo |
| Sprint 5 | Nutrición |
| Sprint 6 | Progreso + Deploy |

Ver [ROADMAP.md](./ROADMAP.md) para detalle completo.

---

## 🔐 Credenciales y variables de entorno

**NUNCA commitear**:
- `.env` (solo `.env.example`)
- Claves API
- Passwords
- Tokens

Variables en `.env.example`:
- `PORT`, `NODE_ENV`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRES_IN`

---

## 🧭 Cómo continuar (para la IA)

Si sos una IA retomando este proyecto:

1. **Leer** este documento completo
2. **Preguntar al usuario**: "¿En qué punto quedamos? ¿Qué querés hacer ahora?"
3. **Revisar** `ROADMAP.md` para ubicar el sprint actual
4. **Revisar** `git status` y `git log` para ver el último commit
5. **Ejecutar** `npm run docs:sync` para actualizar contexto
6. **Proponer** el próximo paso concreto (una tarea a la vez)
7. **Guiar al usuario** paso a paso (comandos exactos, sin suposiciones)
8. **Al terminar**: commit, push y actualizar este archivo

---

## 🐛 Problemas conocidos / notas

- El usuario usa **Windows 10** + CMD (no bash)
- El **Bloc de Notas** corta textos largos → **usar VS Code para editar archivos**
- Autenticación con GitHub vía navegador (GCM) — ya configurado
- Codificación: usar UTF-8 siempre

---

## 📞 Contacto

- **Nombre**: Matías Gamarra
- **Email**: matiasgamarra.dev@gmail.com
- **GitHub**: @matiasgamarra-dev
- **País**: Argentina 🇦🇷

---

## 🔄 Historial de actualizaciones

| Fecha | Cambio |
|---|---|
| 2026-09-27 | Creación inicial del documento |
| 2026-09-27 | Contenido completo (arquitectura, scripts, reglas) |