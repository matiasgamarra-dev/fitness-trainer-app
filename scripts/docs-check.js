#!/usr/bin/env node
/**
 * docs-check.js
 * Verifica que toda la documentación requerida exista y no esté vacía.
 *
 * Uso:
 *   node scripts/docs-check.js
 */

const fs = require("fs");
const path = require("path");

const REQUIRED = [
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

const root = path.join(__dirname, "..");
let errores = 0;
let ok = 0;

console.log("📋 Verificando documentación del proyecto...\n");

REQUIRED.forEach(({ file, minSize }) => {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ FALTA: ${file}`);
    errores++;
    return;
  }
  const size = fs.statSync(fullPath).size;
  if (size < minSize) {
    console.log(`⚠️  MUY CORTO: ${file} (${size} bytes, mínimo ${minSize})`);
    errores++;
    return;
  }
  console.log(`✅ OK: ${file} (${size} bytes)`);
  ok++;
});

console.log(`\n📊 Resultado: ${ok} OK / ${errores} problemas`);

if (errores > 0) {
  console.log("\n⚠️  Hay documentación faltante o incompleta.");
  process.exit(1);
}

console.log("\n🎉 Toda la documentación está completa.");
