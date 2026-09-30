# 🛠️ Stack Tecnológico

Decisiones técnicas del proyecto y por qué se eligieron.

## Resumen

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + TypeScript |
| Estilos | Tailwind CSS v4 |
| Estado global | Zustand |
| Data fetching | React Query (TanStack Query) |
| Routing | React Router v7 |
| Gráficos | Recharts |
| Backend | Node.js + Express + TypeScript |
| Base de datos | **Supabase (PostgreSQL cloud)** |
| Cliente DB | **@supabase/supabase-js** |
| Autenticación | **Supabase Auth** (Email + Google OAuth) |
| Verificación JWT | **jose + JWKS remoto** |
| Validación | Zod |
| Testing | **Vitest** (backend + frontend) |
| CI/CD | GitHub Actions |
| Deploy front | Vercel |
| Deploy back | Railway |

## Justificación de cada decisión

### React + Vite + TypeScript
- **React**: estándar de la industria, enorme comunidad
- **Vite**: build ultrarrápido, mejor DX que CRA
- **TypeScript**: menos bugs, mejor autocompletado

### Tailwind CSS v4
- Prototipado rápido
- Sin CSS a mano
- Consistencia visual
- v4 usa PostCSS con `@tailwindcss/postcss`

### Zustand
- Más simple que Redux
- Menos boilerplate
- Escala bien

### React Query
- Cachea datos automáticamente
- Maneja loading/error states
- Perfecto para APIs

### Supabase
- **Auth integrado**: email, Google OAuth, y más providers en el futuro
- **PostgreSQL administrado**: sin instalar nada localmente
- **Row Level Security**: seguridad a nivel de fila nativa
- **Tier gratuito generoso**: 500 MB de DB, 50.000 usuarios activos
- **SDK oficial**: `@supabase/supabase-js` con tipos TypeScript

### @supabase/supabase-js
- Cliente único para auth + DB + storage
- No requiere descargar binarios (a diferencia de Prisma)
- Se usa tanto en backend como en frontend
- Tipos autogenerados desde el schema

### jose + JWKS
- Verificación de JWT **sin guardar secretos**
- Descarga las claves públicas desde Supabase
- Soporta rotación de claves transparente
- Estándar de la industria para OAuth/JWT

### Zod
- Validación de datos en runtime
- Se integra con TypeScript
- Reutilizable front + back

### Vitest
- **Un solo runner** para backend y frontend
- Rápido (usa esbuild internamente)
- Integrado con Vite
- Compatible con Testing Library

### GitHub Actions
- CI/CD gratis para repos públicos
- Corre tests en cada push

### Vercel + Railway
- Deploy en 1 clic
- Tier gratis generoso
- HTTPS automático

## Convenciones de código

- **Archivos**: kebab-case (`user-profile.tsx`)
- **Componentes**: PascalCase (`UserProfile`)
- **Funciones**: camelCase (`getUserById`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Rutas**: kebab-case (`/user-profile`)

## Herramientas de desarrollo

- **VS Code** con extensiones:
  - ESLint
  - Prettier
  - GitLens
  - Error Lens
  - Tailwind CSS IntelliSense
  - Supabase (oficial)
- **Postman / Insomnia** para probar API

## Comandos

```bash
# Desarrollo
npm run dev -w @fitness-trainer/api
npm run dev -w @fitness-trainer/web

# Tests
npm test -w @fitness-trainer/api
npm test -w @fitness-trainer/web

# Typecheck
npm run typecheck -w @fitness-trainer/api
npm run typecheck -w @fitness-trainer/web

# Lint + format
npm run lint
npm run format
```
