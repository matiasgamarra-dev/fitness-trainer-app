# 💻 Guía de Desarrollo

## Requisitos

- Node.js >= 20
- npm >= 10
- Git >= 2.40
- VS Code (recomendado)
- Cuenta de Supabase

**Nota:** No hace falta instalar PostgreSQL local. Usamos Supabase cloud.

## Instalación local

```bash
git clone https://github.com/matiasgamarra-dev/fitness-trainer-app.git
cd fitness-trainer-app
npm install
```

## Variables de entorno

### Backend (`apps/api/.env`)

Crear el archivo con:

```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
```

**Obtener de:** Supabase Dashboard → Project Settings → API Keys

### Frontend (`apps/web/.env`)

```env
VITE_SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

## Comandos disponibles

### Backend

```bash
npm run dev -w @fitness-trainer/api         # Desarrollo (hot reload con tsx)
npm run build -w @fitness-trainer/api       # Build producción
npm run typecheck -w @fitness-trainer/api   # Solo verificar tipos
npm test -w @fitness-trainer/api            # Tests (Vitest)
npm run test:watch -w @fitness-trainer/api  # Tests en modo watch
```

### Frontend

```bash
npm run dev -w @fitness-trainer/web         # Dev server (Vite)
npm run build -w @fitness-trainer/web       # Build producción
npm run typecheck -w @fitness-trainer/web   # Solo verificar tipos
npm test -w @fitness-trainer/web            # Tests (Vitest)
npm run test:watch -w @fitness-trainer/web  # Tests en modo watch
```

### Root (monorepo)

```bash
npm run lint                                 # ESLint
npm run format                               # Prettier
npm run docs -- <comando>                    # Script de docs
npm run docs -- help                         # Ver comandos disponibles
```

## Flujo de trabajo Git

1. **Actualizar main**: `git pull origin main`
2. **Crear rama**: `git checkout -b feature/nombre-feature`
3. **Desarrollar y commitear** con Conventional Commits
4. **Push**: `git push origin feature/nombre-feature`
5. **Abrir Pull Request** en GitHub

## Convención de commits

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `docs:` | Documentación |
| `style:` | Formato |
| `refactor:` | Refactorización |
| `test:` | Tests |
| `chore:` | Mantenimiento |
| `perf:` | Performance |

**Ejemplo:** `feat(auth): agrega login con Google`

## Script de documentación

```bash
npm run docs -- sync         # Sincroniza AI_CONTEXT + verifica
npm run docs -- check        # Solo verifica
npm run docs -- context      # Regenera AI_CONTEXT
npm run docs -- changelog --type=feat --message="..."
npm run docs -- roadmap --item="..."
npm run docs -- new-docs     # Crea docs nuevos (AUTH, DEPLOYMENT, SECURITY)
npm run docs -- all          # context + check
npm run docs -- help         # Ayuda
```

## Estructura de ramas

- `main` → producción (protegida)
- `feature/*` → nuevas funcionalidades
- `fix/*` → correcciones
- `hotfix/*` → urgencias

## Antes de hacer commit

- [ ] El código compila: `npm run typecheck`
- [ ] Los tests pasan: `npm test`
- [ ] El linter no da errores: `npm run lint`
- [ ] Ejecuté `npm run docs -- sync`
- [ ] El commit sigue Conventional Commits

## Contacto con Supabase

- **Dashboard:** https://supabase.com/dashboard/project/ourssnznqjladulhmpeq
- **Docs oficiales:** https://supabase.com/docs
