#!/usr/bin/env node
/**
 * docs-context.js
 * Actualiza docs/AI_CONTEXT.md con el estado actual del proyecto.
 * Regenera la sección "Estado actual" con datos reales de Git.
 *
 * Uso:
 *   node scripts/docs-context.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const contextPath = path.join(__dirname, "..", "docs", "AI_CONTEXT.md");
if (!fs.existsSync(contextPath)) {
  console.error("❌ docs/AI_CONTEXT.md no encontrado");
  process.exit(1);
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

const lastCommit = run('git log -1 --pretty=format:"%h - %s (%ar)"');
const branch = run("git branch --show-current");
const status = run("git status --porcelain");
const date = new Date().toISOString().split("T")[0];

let context = fs.readFileSync(contextPath, "utf-8");

// Reemplaza la sección "Estado actual"
const estadoRegex = /## 📌 Estado actual del proyecto[\s\S]*?(?=\n---)/;
const nuevoEstado = `## 📌 Estado actual del proyecto

| Campo | Valor |
|---|---|
| **Nombre** | Fitness Trainer App |
| **Repo** | https://github.com/matiasgamarra-dev/fitness-trainer-app |
| **Owner** | Matías Gamarra (@matiasgamarra-dev) |
| **Rama actual** | \`${branch}\` |
| **Último commit** | \`${lastCommit}\` |
| **Cambios sin commitear** | ${status ? "⚠️ Sí" : "✅ No"} |
| **Última actualización** | ${date} |

`;

context = context.replace(estadoRegex, nuevoEstado);

// Agrega entrada al historial
const historialRegex = /(\| Fecha \| Cambio \|\n\|---\|---\|\n)/;
context = context.replace(historialRegex, `$1| ${date} | Actualización automática de contexto |\n`);

fs.writeFileSync(contextPath, context, "utf-8");
console.log("✅ AI_CONTEXT.md actualizado");
console.log(`   Rama: ${branch}`);
console.log(`   Último commit: ${lastCommit}`);
