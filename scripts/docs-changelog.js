#!/usr/bin/env node
/**
 * docs-changelog.js
 * Agrega una entrada al CHANGELOG.md automáticamente.
 *
 * Uso:
 *   node scripts/docs-changelog.js --type=feat --message="agrega login con Google"
 *   node scripts/docs-changelog.js --type=fix --message="corrige cálculo de macros"
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, ...value] = arg.replace(/^--/, "").split("=");
  acc[key] = value.join("=");
  return acc;
}, {});

const type = args.type || "chore";
const message = args.message || "Sin descripción";

const TYPES = {
  feat: "Added",
  fix: "Fixed",
  docs: "Changed",
  refactor: "Changed",
  perf: "Changed",
  style: "Changed",
  test: "Added",
  chore: "Changed",
};

const section = TYPES[type] || "Changed";
const date = new Date().toISOString().split("T")[0];
const changelogPath = path.join(__dirname, "..", "CHANGELOG.md");

if (!fs.existsSync(changelogPath)) {
  console.error("❌ CHANGELOG.md no encontrado");
  process.exit(1);
}

let changelog = fs.readFileSync(changelogPath, "utf-8");

// Si no hay sección [Unreleased], la agrega
if (!changelog.includes("## [Unreleased]")) {
  changelog = changelog.replace(
    /(# 📝 Changelog\n\n)/,
    `$1## [Unreleased]\n\n### Added\n\n### Changed\n\n### Fixed\n\n`,
  );
}

// Agrega la entrada debajo de la sección correspondiente
const sectionRegex = new RegExp(`(## \\[Unreleased\\][\\s\\S]*?### ${section}\\n)`);
if (sectionRegex.test(changelog)) {
  changelog = changelog.replace(sectionRegex, `$1- ${message} (${date})\n`);
} else {
  // Si no existe la sección, la crea
  changelog = changelog.replace(
    /## \[Unreleased\]\n/,
    `## [Unreleased]\n\n### ${section}\n- ${message} (${date})\n`,
  );
}

fs.writeFileSync(changelogPath, changelog, "utf-8");
console.log(`✅ CHANGELOG actualizado: [${section}] ${message}`);
