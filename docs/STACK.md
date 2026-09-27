# 🛠️ Stack Tecnológico

Decisiones técnicas del proyecto y por qué se eligieron.

## Resumen

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + TypeScript |
| Estilos | Tailwind CSS |
| Estado global | Zustand |
| Data fetching | React Query (TanStack Query) |
| Gráficos | Recharts |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Autenticación | JWT + bcrypt |
| Validación | Zod |
| Testing | Vitest (front) + Jest (back) |
| CI/CD | GitHub Actions |
| Deploy front | Vercel |
| Deploy back | Railway |
| DB host | Supabase o Neon |

## Justificación de cada decisión

### React + Vite + TypeScript
- **React**: estándar de la industria, enorme comunidad
- **Vite**: build ultrarrápido, mejor DX que CRA
- **TypeScript**: menos bugs, mejor autocompletado, más profesional

### Tailwind CSS
- Prototipado rápido
- Sin CSS a mano
- Consistencia visual

### Zustand
- Más simple que Redux
- Menos boilerplate
- Escala bien

### React Query
- Cachea datos automáticamente
- Maneja loading/error states
- Perfecto para APIs

### Recharts
- Fácil de usar
- Bonito por defecto
- Basado en SVG (liviano)

### Node.js + Express + TypeScript
- Mismo lenguaje que front
- Express es minimalista y flexible
- TypeScript en back evita errores de tipos

### Prisma
- ORM moderno con tipado
- Migraciones declarativas
- Autocompletado en queries

### PostgreSQL
- Relacional, ideal para datos del negocio
- Gratis, robusto, escalable
- Soporta JSONB si hace falta flexibilidad

### JWT + bcrypt
- Estándar de autenticación
- Stateless (no guarda sesiones)
- bcrypt para hashear passwords

### Zod
- Validación de datos en runtime
- Se integra con TypeScript
- Reutilizable front + back

### Vitest + Jest
- Vitest: rápido, integrado con Vite
- Jest: estándar en Node.js
- Juntos cubren todo

### GitHub Actions
- CI/CD gratis para repos públicos
- Ya configurado en `.github/workflows/ci.yml`
- Corre tests en cada push

### Vercel + Railway
- Deploy en 1 clic
- Tier gratis generoso
- HTTPS automático

## Alternativas consideradas

| Decisión | Alternativa | Por qué NO |
|---|---|---|
| React | Vue, Svelte | React tiene más demanda laboral |
| TypeScript | JavaScript puro | TS es el estándar en proyectos serios |
| Vite | Create React App | CRA está deprecado |
| Tailwind | CSS Modules, Styled Components | Tailwind es más rápido de iterar |
| Zustand | Redux Toolkit | Zustand es más simple |
| PostgreSQL | MongoDB | Los datos son relacionales |
| Prisma | TypeORM, Sequelize | Prisma tiene mejor DX |
| Express | Fastify, NestJS | Express es el más conocido |
| Vercel | Netlify | Vercel optimizado para Next/React |

## Convenciones de código

- **Nombres de archivos**: kebab-case (`user-profile.tsx`)
- **Componentes**: PascalCase (`UserProfile`)
- **Funciones y variables**: camelCase (`getUserById`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Rutas**: kebab-case (`/user-profile`)

## Herramientas de desarrollo

- **VS Code** con extensiones:
  - ESLint
  - Prettier
  - GitLens
  - Error Lens
  - Tailwind CSS IntelliSense
- **Postman / Insomnia** para probar API
- **TablePlus / DBeaver** para ver la DB

## Comandos previstos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm test

# Lint
npm run lint

# Formatear
npm run format

# Migraciones DB
npx prisma migrate dev
npx prisma migrate deploy

# Ver DB en UI
npx prisma studio