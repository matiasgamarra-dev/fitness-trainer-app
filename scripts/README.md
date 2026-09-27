# 🤖 Scripts de Automatización de Documentación

Scripts para que **cualquier IA** o desarrollador mantenga la documentación actualizada sin editar archivos a mano.

## Comandos disponibles

### `npm run docs:changelog`

Agrega una entrada al CHANGELOG.md.

```bash
npm run docs:changelog -- --type=feat --message="agrega login con Google"
Tipos: feat, fix, docs, refactor, perf, style, test, chore

npm run docs:roadmap
Marca un item del ROADMAP.md como completado.

bash
npm run docs:roadmap -- --item="Modelo User en Prisma"
npm run docs:context
Regenera el estado actual en AI_CONTEXT.md con datos reales de Git.

bash
npm run docs:context
npm run docs:check
Verifica que toda la documentación exista y no esté vacía.

bash
npm run docs:check
npm run docs:sync
Sincroniza todo (context + check).

bash
npm run docs:sync
Reglas para la IA
NUNCA editar CHANGELOG.md a mano → usar docs:changelog

NUNCA marcar items del ROADMAP a mano → usar docs:roadmap

SIEMPRE ejecutar docs:sync antes de commitear

SIEMPRE ejecutar docs:check antes de push

ACTUALIZAR AI_CONTEXT.md al terminar la sesión

Flujo típico
bash
# 1. Terminás una feature
npm run docs:changelog -- --type=feat --message="agrega endpoint de login"

# 2. Marcás el item del roadmap
npm run docs:roadmap -- --item="Endpoint POST /auth/login"

# 3. Sincronizás todo
npm run docs:sync

# 4. Verificás que no hay errores
npm run docs:check

# 5. Commit y push
git add .
git commit -m "feat(auth): agrega endpoint de login"
git push