#!/usr/bin/env node
/**
 * scripts/docs.mjs
 * Script único para automatizar la documentación del proyecto.
 *
 * Uso:
 *   npm run docs                       → menú interactivo
 *   npm run docs -- sync               → sincroniza (context + check)
 *   npm run docs -- check              → verifica integridad de docs
 *   npm run docs -- context            → regenera AI_CONTEXT.md
 *   npm run docs -- changelog --type=feat --message="..."
 *   npm run docs -- roadmap --item="..."
 *   npm run docs -- new-docs           → crea AUTH, DEPLOYMENT, SECURITY
 *   npm run docs -- all                → context + check + sync
 *   npm run docs -- help               → muestra ayuda
 *
 * Opciones globales:
 *   --verbose    → más detalles en la salida
 *   --dry-run    → simula sin escribir archivos
 *   --silent     → sin salida
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

// ─────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

// ─────────────────────────────────────────────────────────────
// Colores ANSI
// ─────────────────────────────────────────────────────────────

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const ok = (msg) => console.log(`${C.green}✅ ${msg}${C.reset}`);
const warn = (msg) => console.log(`${C.yellow}⚠️  ${msg}${C.reset}`);
const err = (msg) => console.log(`${C.red}❌ ${msg}${C.reset}`);
const info = (msg) => console.log(`${C.cyan}ℹ️  ${msg}${C.reset}`);
const title = (msg) => console.log(`\n${C.bold}${C.blue}${msg}${C.reset}\n`);
const dim = (msg) => console.log(`${C.dim}${msg}${C.reset}`);

// ─────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────

/** Documentos requeridos y tamaño mínimo en bytes */
const REQUIRED_DOCS = [
  { file: "README.md", minSize: 500 },
  { file: "LICENSE", minSize: 500 },
  { file: "CHANGELOG.md", minSize: 100 },
  { file: "CONTRIBUTING.md", minSize: 100 },
  { file: "package.json", minSize: 100 },
  { file: ".env.example", minSize: 50 },
  { file: ".gitignore", minSize: 50 },
  { file: "docs/AI_CONTEXT.md", minSize: 1000 },
  { file: "docs/PRODUCT.md", minSize: 1000 },
  { file: "docs/DATA_MODEL.md", minSize: 1000 },
  { file: "docs/STACK.md", minSize: 1000 },
  { file: "docs/WIREFRAMES.md", minSize: 1000 },
  { file: "docs/ROADMAP.md", minSize: 1000 },
  { file: "docs/ARCHITECTURE.md", minSize: 500 },
  { file: "docs/API.md", minSize: 500 },
  { file: "docs/DEVELOPMENT.md", minSize: 500 },
  { file: "docs/AUTH.md", minSize: 500 },
  { file: "docs/DEPLOYMENT.md", minSize: 500 },
  { file: "docs/SECURITY.md", minSize: 500 },
];

/** Tipos de commit → sección del CHANGELOG */
const CHANGELOG_TYPES = {
  feat: "Added",
  fix: "Fixed",
  docs: "Changed",
  refactor: "Changed",
  perf: "Changed",
  style: "Changed",
  test: "Added",
  chore: "Changed",
};

// ─────────────────────────────────────────────────────────────
// Estado global de flags
// ─────────────────────────────────────────────────────────────

const flags = {
  verbose: false,
  dryRun: false,
  silent: false,
};

function log(...args) {
  if (!flags.silent) console.log(...args);
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd: ROOT }).trim();
  } catch {
    return "";
  }
}

function getGitInfo() {
  return {
    branch: run("git branch --show-current") || "(desconocida)",
    lastCommit: run('git log -1 --pretty=format:"%h - %s (%ar)"') || "(sin commits)",
    status: run("git status --porcelain"),
  };
}

function readDoc(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, "utf-8");
}

function writeDoc(relPath, content) {
  if (flags.dryRun) {
    info(`[dry-run] No se escribió ${relPath}`);
    return;
  }
  const fullPath = path.join(ROOT, relPath);
  fs.writeFileSync(fullPath, content, "utf-8");
}

function today() {
  return new Date().toISOString().split("T")[0];
}

// ─────────────────────────────────────────────────────────────
// Comando: context
// ─────────────────────────────────────────────────────────────

function cmdContext() {
  title("🔄 Actualizando AI_CONTEXT.md");

  const relPath = "docs/AI_CONTEXT.md";
  let content = readDoc(relPath);

  if (!content) {
    err(`No existe ${relPath}`);
    process.exit(1);
  }

  const git = getGitInfo();
  const date = today();

  // Reemplaza la sección "Estado actual"
  const estadoRegex = /## 📌 Estado actual del proyecto[\s\S]*?(?=\n---)/;
  const nuevoEstado = `## 📌 Estado actual del proyecto

| Campo | Valor |
|---|---|
| **Nombre** | Fitness Trainer App |
| **Repo** | https://github.com/matiasgamarra-dev/fitness-trainer-app |
| **Owner** | Matías Gamarra (@matiasgamarra-dev) |
| **Rama actual** | \`${git.branch}\` |
| **Último commit** | \`${git.lastCommit}\` |
| **Cambios sin commitear** | ${git.status ? "⚠️ Sí" : "✅ No"} |
| **Última actualización** | ${date} |

`;

  if (!estadoRegex.test(content)) {
    warn("No se encontró la sección 'Estado actual' en AI_CONTEXT.md");
    warn("Verificá que el archivo tenga el header '## 📌 Estado actual del proyecto'");
    process.exit(1);
  }

  content = content.replace(estadoRegex, nuevoEstado);

  // Agrega entrada al historial
  const historialRegex = /(\| Fecha \| Cambio \|\n\|---\|---\|\n)/;
  if (historialRegex.test(content)) {
    content = content.replace(
      historialRegex,
      `$1| ${date} | Actualización automática de contexto |\n`,
    );
  }

  writeDoc(relPath, content);

  ok("AI_CONTEXT.md actualizado");
  log(`   Rama: ${git.branch}`);
  log(`   Último commit: ${git.lastCommit}`);
  log(`   Cambios sin commitear: ${git.status ? "Sí" : "No"}`);
}

// ─────────────────────────────────────────────────────────────
// Comando: check
// ─────────────────────────────────────────────────────────────

function cmdCheck() {
  title("📋 Verificando documentación del proyecto");

  let errores = 0;
  let okCount = 0;

  for (const { file, minSize } of REQUIRED_DOCS) {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) {
      err(`FALTA: ${file}`);
      errores++;
      continue;
    }
    const size = fs.statSync(fullPath).size;
    if (size < minSize) {
      warn(`MUY CORTO: ${file} (${size} bytes, mínimo ${minSize})`);
      errores++;
      continue;
    }
    ok(`OK: ${file} (${size} bytes)`);
    okCount++;
  }

  title(`📊 Resultado: ${okCount} OK / ${errores} problemas`);

  if (errores > 0) {
    warn("Hay documentación faltante o incompleta.");
    process.exit(1);
  }

  ok("Toda la documentación está completa.");
}

// ─────────────────────────────────────────────────────────────
// Comando: changelog
// ─────────────────────────────────────────────────────────────

function cmdChangelog({ type = "chore", message = "Sin descripción" }) {
  title("📝 Actualizando CHANGELOG.md");

  const section = CHANGELOG_TYPES[type] || "Changed";
  const date = today();
  const relPath = "CHANGELOG.md";
  let content = readDoc(relPath);

  if (!content) {
    err(`No existe ${relPath}`);
    process.exit(1);
  }

  // Asegura que exista [Unreleased]
  if (!content.includes("## [Unreleased]")) {
    content = content.replace(
      /(# 📝 Changelog\n\n)/,
      `$1## [Unreleased]\n\n### Added\n\n### Changed\n\n### Fixed\n\n`,
    );
  }

  // Encuentra el bloque [Unreleased] y busca la sección dentro de ÉL
  const unreleasedMatch = content.match(
    /(## \[Unreleased\][\s\S]*?)(?=\n## \[|\n*$)/,
  );

  if (!unreleasedMatch) {
    err("No se pudo encontrar el bloque [Unreleased]");
    process.exit(1);
  }

  const unreleasedBlock = unreleasedMatch[1];
  const sectionHeader = `### ${section}`;

  let nuevoBloque;
  if (unreleasedBlock.includes(sectionHeader)) {
    // Agrega debajo de la sección existente
    nuevoBloque = unreleasedBlock.replace(
      new RegExp(`(${sectionHeader}\\n)`),
      `$1- ${message} (${date})\n`,
    );
  } else {
    // Agrega la sección al final del bloque [Unreleased]
    nuevoBloque = `${unreleasedBlock.trimEnd()}\n\n${sectionHeader}\n- ${message} (${date})\n`;
  }

  content = content.replace(unreleasedBlock, nuevoBloque);

  writeDoc(relPath, content);

  ok(`CHANGELOG actualizado: [${section}] ${message}`);
}

// ─────────────────────────────────────────────────────────────
// Comando: roadmap
// ─────────────────────────────────────────────────────────────

function cmdRoadmap({ item }) {
  title("🗺️  Actualizando ROADMAP.md");

  if (!item) {
    err('Falta --item="texto del item"');
    process.exit(1);
  }

  const relPath = "docs/ROADMAP.md";
  let content = readDoc(relPath);

  if (!content) {
    err(`No existe ${relPath}`);
    process.exit(1);
  }

  const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`- \\[ \\] (${escaped})`, "i");

  if (!regex.test(content)) {
    err(`Item no encontrado o ya completado: "${item}"`);
    process.exit(1);
  }

  content = content.replace(regex, "- [x] $1");

  writeDoc(relPath, content);

  ok(`Roadmap actualizado: ${item}`);
}

// ─────────────────────────────────────────────────────────────
// Comando: new-docs
// ─────────────────────────────────────────────────────────────

const NEW_DOCS = [
  {
    path: "docs/AUTH.md",
    content: `# 🔐 Autenticación

Documentación del sistema de autenticación de Fitness Trainer App.

## Stack

| Componente | Tecnología |
|---|---|
| **Auth provider** | Supabase Auth |
| **Providers habilitados** | Email + Password, Google OAuth |
| **Almacenamiento de token** | localStorage (default de Supabase) |
| **Verificación backend** | \`jose\` + JWKS remoto |
| **Estado frontend** | Zustand (\`useAuthStore\`) |

## Flujo de autenticación

### Registro con email + password

\`\`\`
[Usuario] → llena formulario → [Frontend]
    ↓ supabase.auth.signUp()
[Supabase Auth] → crea en auth.users
    ↓ trigger handle_new_user
[Supabase DB] → crea en public.users
    ↓ devuelve session (si email confirmation OFF)
[Frontend] → guarda session en Zustand + localStorage
\`\`\`

### Login con Google OAuth

\`\`\`
[Usuario] → click "Continuar con Google" → [Frontend]
    ↓ supabase.auth.signInWithOAuth({ provider: 'google' })
[Google] → muestra consent screen
    ↓ redirige a: https://ourssnznqjladulhmpeq.supabase.co/auth/v1/callback
[Supabase Auth] → valida con Google → crea/actualiza user
    ↓ trigger handle_new_user
[Supabase DB] → crea en public.users
    ↓ redirige a: http://localhost:5173/auth/callback
[Frontend AuthCallback] → detecta session → navigate a /dashboard
\`\`\`

### Request autenticado al backend

\`\`\`
[Usuario] → acción que requiere auth → [Frontend]
    ↓ axios request con header: Authorization: Bearer <jwt>
[Backend API] → middleware verifyUser
    ↓ jose.jwtVerify(token, JWKS, { issuer, audience })
[Supabase JWKS] → devuelve clave pública
    ↓ verifica firma + expiración
[Backend API] → adjunta user al req → continúa con el handler
\`\`\`

## Estructura de archivos

### Backend

| Archivo | Propósito |
|---|---|
| \`apps/api/src/middleware/auth.ts\` | Middleware \`verifyUser\` con jose + JWKS |
| \`apps/api/src/routes/auth.ts\` | Endpoint \`GET /api/v1/auth/me\` |
| \`apps/api/src/config/supabase.ts\` | Cliente Supabase admin |
| \`apps/api/src/config/env.ts\` | Validación de variables con Zod |

### Frontend

| Archivo | Propósito |
|---|---|
| \`apps/web/src/lib/supabase.ts\` | Cliente Supabase |
| \`apps/web/src/stores/auth.ts\` | Store Zustand de auth |
| \`apps/web/src/pages/Login.tsx\` | Pantalla de login |
| \`apps/web/src/pages/Register.tsx\` | Pantalla de registro |
| \`apps/web/src/pages/AuthCallback.tsx\` | Callback de OAuth |
| \`apps/web/src/pages/Dashboard.tsx\` | Dashboard protegido |
| \`apps/web/src/components/ProtectedRoute.tsx\` | Guard de rutas |

## Endpoints

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | \`/api/v1/auth/me\` | ✅ Bearer | Devuelve perfil del usuario autenticado |

## Variables de entorno

### Backend (\`apps/api/.env\`)

\`\`\`env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
\`\`\`

### Frontend (\`apps/web/.env\`)

\`\`\`env
VITE_SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
\`\`\`
`,
  },
  {
    path: "docs/DEPLOYMENT.md",
    content: `# 🚀 Deployment

Guía para deployar Fitness Trainer App a producción.

## Servicios

| Componente | Servicio | Tier |
|---|---|---|
| **Frontend** | Vercel | Free |
| **Backend** | Railway | Free |
| **Base de datos** | Supabase | Free |
| **Auth** | Supabase Auth | Free |

## Deploy del backend (Railway)

### 1. Crear proyecto

1. Ir a [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → \`fitness-trainer-app\`

### 2. Configurar servicio

- **Root Directory:** \`apps/api\`
- **Build Command:** \`npm install && npm run build\`
- **Start Command:** \`npm start\`

### 3. Variables de entorno

\`\`\`env
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
\`\`\`

## Deploy del frontend (Vercel)

### 1. Crear proyecto

1. Ir a [vercel.com](https://vercel.com) → **Add New Project**
2. Importar \`fitness-trainer-app\`
3. Configurar:
   - **Framework Preset:** Vite
   - **Root Directory:** \`apps/web\`
   - **Build Command:** \`npm run build\`
   - **Output Directory:** \`dist\`

### 2. Variables de entorno

\`\`\`env
VITE_SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
\`\`\`

## Configurar dominios

### Supabase

**Authentication → URL Configuration:**
- **Site URL:** \`https://tu-app.vercel.app\`
- **Redirect URLs:** \`https://tu-app.vercel.app/auth/callback\`, \`http://localhost:5173/auth/callback\`

### Google Cloud

**APIs & Services → Credentials → OAuth 2.0 Client:**
- **Authorized redirect URIs:** agregar \`https://tu-app.vercel.app/auth/callback\`
- **Authorized JS origins:** agregar \`https://tu-app.vercel.app\`

## Verificar el deploy

- [ ] \`https://tu-api.up.railway.app/api/v1/health\` responde OK
- [ ] \`https://tu-app.vercel.app\` carga Login
- [ ] Login con Google funciona
- [ ] Login con email funciona
- [ ] Dashboard se muestra después de loguearse
- [ ] Logout funciona
`,
  },
  {
    path: "docs/SECURITY.md",
    content: `# 🔒 Seguridad

Prácticas y decisiones de seguridad del proyecto.

## Reglas de oro

1. **NUNCA commitear \`.env\`** — solo \`.env.example\`
2. **NUNCA exponer \`SUPABASE_SERVICE_ROLE_KEY\`** en el frontend
3. **NUNCA pasar credenciales por chat/email/PR**
4. **SIEMPRE usar HTTPS** en producción
5. **SIEMPRE rotar** claves si se sospecha filtración

## Gestión de secretos

| Secreto | Dónde vive | Quién lo usa |
|---|---|---|
| \`SUPABASE_URL\` | \`.env\` + Bitwarden | Backend + Frontend |
| \`SUPABASE_ANON_KEY\` | \`.env\` + Bitwarden | Backend + Frontend (pública) |
| \`SUPABASE_SERVICE_ROLE_KEY\` | \`.env\` + Bitwarden | **Solo backend** |
| DB password | Bitwarden | Solo conexión directa |
| Google OAuth Client ID/Secret | Bitwarden + Supabase | Solo Supabase |

## Row Level Security (RLS)

Todas las tablas de \`public\` tienen RLS habilitado.

### Políticas en \`public.users\`

| Operación | Política |
|---|---|
| SELECT | Solo tu propio perfil (\`auth.uid() = id\`) |
| INSERT | Solo tu propio perfil |
| UPDATE | Solo tu propio perfil |
| DELETE | Sin política (nadie puede borrar) |

### Futuras tablas

Siempre:
1. \`ALTER TABLE x ENABLE ROW LEVEL SECURITY;\`
2. Crear políticas explícitas
3. Testear con un usuario "atacante"

## Verificación de JWT

El backend **NUNCA** guarda un \`JWT_SECRET\`. Usa:
1. \`jose.createRemoteJWKSet\` para descargar claves públicas de Supabase
2. Verifica firma, expiración, issuer y audience
3. Cachea las claves automáticamente

**Ventaja:** si Supabase rota claves, el backend no necesita cambios.

## Buenas prácticas

- **Validación con Zod** en todos los endpoints
- **Tipos estrictos** en TypeScript
- **Helmet** para headers HTTP seguros
- **CORS** configurado explícitamente
- **Errores genéricos** al cliente

## Checklist antes de cada release

- [ ] \`npm audit\` sin vulnerabilidades altas
- [ ] \`.env\` no está en git
- [ ] No hay claves hardcodeadas
- [ ] RLS activo en todas las tablas
- [ ] CORS no permite \`*\` en producción
- [ ] HTTPS forzado en producción
- [ ] Logs no incluyen tokens ni passwords

## Reportar vulnerabilidades

**NO abras un issue público.** Contactá a **matiasgamarra.dev@gmail.com**.
`,
  },
];

function cmdNewDocs() {
  title("📄 Creando documentación nueva");

  for (const doc of NEW_DOCS) {
    const fullPath = path.join(ROOT, doc.path);
    if (fs.existsSync(fullPath)) {
      warn(`Ya existe, se saltea: ${doc.path}`);
      continue;
    }
    writeDoc(doc.path, doc.content);
    ok(`Creado: ${doc.path}`);
  }

  title("🎉 Documentación nueva lista");
}

// ─────────────────────────────────────────────────────────────
// Comando: sync
// ─────────────────────────────────────────────────────────────

function cmdSync() {
  title("🔄 Sincronizando documentación del proyecto");
  cmdContext();
  cmdCheck();
  title("🎉 Sincronización completa");
}

// ─────────────────────────────────────────────────────────────
// Comando: all
// ─────────────────────────────────────────────────────────────

function cmdAll() {
  title("🚀 Ejecutando TODO");
  cmdContext();
  cmdCheck();
  title("🎉 Todo listo");
}

// ─────────────────────────────────────────────────────────────
// Comando: help
// ─────────────────────────────────────────────────────────────

function cmdHelp() {
  console.log(`
${C.bold}${C.blue}📚 Script de automatización de documentación${C.reset}

${C.bold}Uso:${C.reset}
  npm run docs [comando] [opciones]

${C.bold}Comandos:${C.reset}
  ${C.cyan}(sin comando)${C.reset}                Menú interactivo
  ${C.cyan}sync${C.reset}                         Sincroniza (context + check)
  ${C.cyan}check${C.reset}                        Verifica integridad de docs
  ${C.cyan}context${C.reset}                      Regenera AI_CONTEXT.md
  ${C.cyan}changelog${C.reset}                    Agrega entrada al CHANGELOG
  ${C.cyan}roadmap${C.reset}                      Marca item del ROADMAP como completado
  ${C.cyan}new-docs${C.reset}                     Crea docs nuevos (AUTH, DEPLOYMENT, SECURITY)
  ${C.cyan}all${C.reset}                          Ejecuta context + check + sync
  ${C.cyan}help${C.reset}                         Muestra esta ayuda

${C.bold}Opciones:${C.reset}
  ${C.cyan}--verbose${C.reset}                    Más detalles en la salida
  ${C.cyan}--dry-run${C.reset}                    Simula sin escribir archivos
  ${C.cyan}--silent${C.reset}                     Sin salida

${C.bold}Ejemplos:${C.reset}
  npm run docs
  npm run docs -- sync
  npm run docs -- check
  npm run docs -- context
  npm run docs -- changelog --type=feat --message="agrega login con Google"
  npm run docs -- roadmap --item="Modelo User en Prisma"
  npm run docs -- all
  npm run docs -- check --verbose

${C.bold}Tipos de changelog:${C.reset}
  feat, fix, docs, refactor, perf, style, test, chore
`);
}

// ─────────────────────────────────────────────────────────────
// Modo interactivo
// ─────────────────────────────────────────────────────────────

async function interactive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (q) => new Promise((resolve) => rl.question(q, resolve));

  title("📚 Automatización de documentación");
  console.log("  [1] Sync (context + check)");
  console.log("  [2] Check");
  console.log("  [3] Context (regenerar AI_CONTEXT.md)");
  console.log("  [4] Changelog (agregar entrada)");
  console.log("  [5] Roadmap (marcar item como completado)");
  console.log("  [6] All (context + check + sync)");
  console.log("  [7] New docs (AUTH, DEPLOYMENT, SECURITY)");
  console.log("  [0] Salir");

  const opt = await question("\nOpción: ");

  switch (opt.trim()) {
    case "1":
      cmdSync();
      break;
    case "2":
      cmdCheck();
      break;
    case "3":
      cmdContext();
      break;
    case "4": {
      const type = await question("Tipo (feat/fix/docs/...): ");
      const message = await question("Mensaje: ");
      cmdChangelog({ type: type.trim(), message: message.trim() });
      break;
    }
    case "5": {
      const item = await question("Item del roadmap: ");
      cmdRoadmap({ item: item.trim() });
      break;
    }
    case "6":
      cmdAll();
      break;
    case "7":
      cmdNewDocs();
      break;
    case "0":
      info("Chau 👋");
      break;
    default:
      err("Opción inválida");
  }

  rl.close();
}

// ─────────────────────────────────────────────────────────────
// Parser de argumentos
// ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { _: [] };
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [key, ...value] = arg.slice(2).split("=");
      args[key] = value.length ? value.join("=") : true;
    } else {
      args._.push(arg);
    }
  }
  return args;
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Flags globales
  flags.verbose = !!args.verbose;
  flags.dryRun = !!args["dry-run"];
  flags.silent = !!args.silent;

  const cmd = args._[0];

  if (!cmd) {
    await interactive();
    return;
  }

  switch (cmd) {
    case "sync":
      cmdSync();
      break;
    case "check":
      cmdCheck();
      break;
    case "context":
      cmdContext();
      break;
    case "changelog":
      cmdChangelog({
        type: args.type,
        message: args.message,
      });
      break;
    case "roadmap":
      cmdRoadmap({ item: args.item });
      break;
    case "new-docs":
      cmdNewDocs();
      break;
    case "all":
      cmdAll();
      break;
    case "help":
    case "--help":
    case "-h":
      cmdHelp();
      break;
    default:
      err(`Comando desconocido: "${cmd}"`);
      console.log('   Corré "npm run docs -- help" para ver la ayuda.');
      process.exit(1);
  }
}

main().catch((e) => {
  err(`Error inesperado: ${e.message}`);
  process.exit(1);
});