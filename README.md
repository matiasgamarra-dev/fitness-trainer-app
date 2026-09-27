# 🏋️ Fitness Trainer App

> Aplicación de seguimiento personal que integra nutrición, entrenamiento y progreso físico en un solo lugar.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)

## 📋 Descripción

**Fitness Trainer App** es una plataforma todo-en-uno para:

- 🏃 Crear y seguir rutinas de entrenamiento personalizadas
- 📊 Registrar series, repeticiones, peso y descansos
- 🥗 Controlar calorías y macros de las comidas diarias
- 📈 Visualizar progreso con gráficos (peso, medidas, fuerza)
- 🎯 Establecer objetivos semanales y medir adherencia
- 📱 Funcionar offline como PWA

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [🎯 Visión del producto](./docs/PRODUCT.md) | Pitch, público, funcionalidades |
| [🗄️ Modelo de datos](./docs/DATA_MODEL.md) | Esquema de la base de datos |
| [🛠️ Stack tecnológico](./docs/STACK.md) | Tecnologías y decisiones |
| [🎨 Wireframes](./docs/WIREFRAMES.md) | Pantallas y flujos |
| [🗺️ Roadmap](./docs/ROADMAP.md) | Plan por fases y sprints |
| [🏗️ Arquitectura](./docs/ARCHITECTURE.md) | Estructura del proyecto |
| [🔌 API Reference](./docs/API.md) | Endpoints del backend |
| [💻 Guía de desarrollo](./docs/DEVELOPMENT.md) | Setup local |

## 🛠️ Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **Testing**: Vitest + Jest
- **CI/CD**: GitHub Actions
- **Deploy**: Vercel (front) + Railway (back)

## ⚙️ Requisitos

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 14

## 🔧 Instalación

```bash
git clone https://github.com/matiasgamarra-dev/fitness-trainer-app.git
cd fitness-trainer-app
npm install
cp .env.example .env
▶️ Uso
bash
npm run dev      # Desarrollo
npm start        # Producción
npm test         # Tests
npm run lint     # Linter
🗺️ Roadmap resumido
Fase	Objetivo	Estado
Fase 0	Documentación y setup	🟡 En curso
Fase 1	MVP (auth, rutinas, comidas)	⏳ Pendiente
Fase 2	Consolidación (PWA, gráficos)	⏳ Pendiente
Fase 3	Profesional / Social	⏳ Pendiente
Ver roadmap completo.

🤝 Contribuir
Las contribuciones son bienvenidas. Leé CONTRIBUTING.md.

📄 Licencia
MIT © Matías Gamarra

👨‍💻 Autor
Matías Gamarra

GitHub: @matiasgamarra-dev

Argentina 🇦🇷

⭐ Si te gusta el proyecto, dale una estrella en GitHub.

text

**FIN ↑**

---

# 📄 ARCHIVO 2: `docs\API.md`

**Ubicación**: `C:\Users\matia\Proyectos\fitness-trainer-app\docs\API.md`

**INICIO ↓**

```markdown
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

### Nutrición

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /foods | Buscar alimentos |
| GET | /meals | Comidas del día |
| POST | /meals | Crear comida |
| POST | /meals/:id/items | Agregar alimento |
| GET | /nutrition/goal | Obtener objetivo |
| PUT | /nutrition/goal | Actualizar objetivo |

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
403	Forbidden
404	Not Found
500	Internal Error
text

**FIN ↑**

---

# 📄 ARCHIVO 3: `docs\ARCHITECTURE.md`

**Ubicación**: `C:\Users\matia\Proyectos\fitness-trainer-app\docs\ARCHITECTURE.md`

**INICIO ↓**

```markdown
# 🏗️ Arquitectura del Proyecto

## Visión general

Fitness Trainer App es una aplicación con arquitectura cliente-servidor pensada para escalar.

## Estructura de carpetas
src/
├── components/ → Componentes reutilizables (UI)
├── screens/ → Pantallas de la app
├── services/ → Lógica de negocio, conexión a API
├── hooks/ → Custom hooks
├── context/ → Estado global (Context API)
├── utils/ → Utilidades y helpers
├── assets/ → Recursos internos del código
└── index.js → Punto de entrada

text

## Capas

1. **Presentación** (screens + components)
2. **Lógica** (services + hooks)
3. **Datos** (repositorios / API)
4. **Utilidades** (utils)

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite + TypeScript |
| Estilos | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Base de datos | PostgreSQL + Prisma |
| Testing | Vitest + Jest |
| CI/CD | GitHub Actions |

## Flujo de datos
UI (React) → Hook (React Query) → Service → API (Express) → Prisma → PostgreSQL

text

## Decisiones técnicas

- **Modularidad**: cada carpeta tiene una responsabilidad clara.
- **Escalabilidad**: fácil agregar features sin romper nada.
- **Testing**: tests unitarios en `tests/`.
- **Separación de capas**: la UI nunca habla directo con la DB.

Ver [STACK.md](./STACK.md) para más detalle técnico.