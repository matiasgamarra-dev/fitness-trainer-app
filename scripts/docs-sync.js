#!/usr/bin/env node
/**
 * docs-sync.js
 * Sincroniza toda la documentación del proyecto.
 * Ejecuta: context + check
 * 
 * Uso:
 *   node scripts/docs-sync.js
 */

const { execSync } = require('child_process');
const path = require('path');

function run(script) {
  console.log(`\n▶️  Ejecutando ${script}...`);
  try {
    execSync(`node ${path.join(__dirname, script)}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Error en ${script}`);
    process.exit(1);
  }
}

console.log('🔄 Sincronizando documentación del proyecto...\n');

run('docs-context.js');
run('docs-check.js');

console.log('\n🎉 Sincronización completa.');