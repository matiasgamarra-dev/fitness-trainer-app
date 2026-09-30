// scripts/lib/changelog.mjs
// Lógica de actualización del CHANGELOG, extraída para no romper docs.mjs.

import fs from "node:fs";
import path from "node:path";

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

/**
 * Agrega una entrada al CHANGELOG.md del proyecto.
 *
 * @param {object} opts
 * @param {string} opts.root - Ruta raíz del repo
 * @param {string} opts.type - feat | fix | docs | ...
 * @param {string} opts.message - Texto de la entrada
 * @param {(msg: string) => void} opts.ok - Callback "ok"
 * @param {(msg: string) => void} opts.warn - Callback "warn"
 * @param {(msg: string) => void} opts.err - Callback "err"
 * @param {() => void} opts.exit - Callback para salir con error
 */
export function updateChangelog({ root, type, message, ok, warn, err, exit }) {
  const section = CHANGELOG_TYPES[type] || "Changed";
  const date = new Date().toISOString().split("T")[0];
  const relPath = "CHANGELOG.md";
  const fullPath = path.join(root, relPath);

  if (!fs.existsSync(fullPath)) {
    err(`No existe ${relPath}`);
    exit();
    return;
  }

  let content = fs.readFileSync(fullPath, "utf-8");

  // Asegura que exista [Unreleased]
  if (!content.includes("## [Unreleased]")) {
    content = content.replace(
      /(# 📝 Changelog\n\n)/,
      `$1## [Unreleased]\n\n### Added\n\n### Changed\n\n### Fixed\n\n`,
    );
  }

  // Encuentra el bloque [Unreleased] hasta el próximo "## [" o fin de archivo
  const unreleasedMatch = content.match(
    /(## \[Unreleased\][\s\S]*?)(?=\n## \[|$)/,
  );

  if (!unreleasedMatch) {
    err("No se pudo encontrar el bloque [Unreleased]");
    exit();
    return;
  }

  const unreleasedBlock = unreleasedMatch[1];
  const sectionHeader = `### ${section}`;
  const newLine = `- ${message} (${date})`;

  // Idempotencia: si ya existe la línea, no hacemos nada
  if (unreleasedBlock.includes(newLine)) {
    warn(`La entrada ya existe en CHANGELOG.md: ${newLine}`);
    return;
  }

  let nuevoBloque;
  if (unreleasedBlock.includes(sectionHeader)) {
    nuevoBloque = unreleasedBlock.replace(
      new RegExp(`(${sectionHeader}\\n)`),
      `$1${newLine}\n`,
    );
  } else {
    nuevoBloque = `${unreleasedBlock.trimEnd()}\n\n${sectionHeader}\n${newLine}\n`;
  }

  content = content.replace(unreleasedBlock, nuevoBloque);

  fs.writeFileSync(fullPath, content, "utf-8");

  ok(`CHANGELOG actualizado: [${section}] ${message}`);
}