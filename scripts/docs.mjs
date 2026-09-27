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