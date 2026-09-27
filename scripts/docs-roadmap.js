#!/usr/bin/env node
/**
 * docs-roadmap.js
 * Marca items del ROADMAP.md como completados.
 * 
 * Uso:
 *   node scripts/docs-roadmap.js --item="Modelo User en Prisma"
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  acc[key] = value.join('=');
  return acc;
}, {});

const item = args.item;
if (!item) {
  console.error('❌ Falta --item="texto del item"');
  process.exit(1);
}

const roadmapPath = path.join(__dirname, '..', 'docs', 'ROADMAP.md');
if (!fs.existsSync(roadmapPath)) {
  console.error('❌ docs/ROADMAP.md no encontrado');
  process.exit(1);
}

let roadmap = fs.readFileSync(roadmapPath, 'utf-8');

// Busca el item exacto y lo marca como completado
const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(`- \\[ \\] (${escaped})`, 'i');

if (!regex.test(roadmap)) {
  console.error(`❌ Item no encontrado o ya completado: "${item}"`);
  process.exit(1);
}

roadmap = roadmap.replace(regex, '- [x] $1');
fs.writeFileSync(roadmapPath, roadmap, 'utf-8');
console.log(`✅ Roadmap actualizado: ${item}`);