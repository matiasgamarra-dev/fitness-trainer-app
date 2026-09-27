# 💻 Guía de Desarrollo

## Requisitos

- Node.js >= 20
- npm >= 10
- Git >= 2.40
- PostgreSQL >= 14
- VS Code (recomendado)

## Instalación local

```bash
git clone https://github.com/matiasgamarra-dev/fitness-trainer-app.git
cd fitness-trainer-app
npm install
cp .env.example .env
Editar .env con tus credenciales.

Comandos disponibles
bash
npm start        # Producción
npm run dev      # Desarrollo (hot reload)
npm test         # Tests
npm run lint     # Linter
npm run format   # Formatear código
Flujo de trabajo Git
Actualizar main: git pull origin main

Crear rama: git checkout -b feature/nombre-feature

Desarrollar y commitear con Conventional Commits

Push: git push origin feature/nombre-feature

Abrir Pull Request en GitHub

Convención de commits
Prefijo	Uso
feat:	Nueva funcionalidad
fix:	Corrección de bug
docs:	Documentación
style:	Formato
refactor:	Refactorización
test:	Tests
chore:	Mantenimiento
perf:	Performance
Ejemplo: feat(auth): agrega login con Google

Estructura de ramas
main → producción (protegida)

develop → integración

feature/* → nuevas funcionalidades

fix/* → correcciones

hotfix/* → urgencias

Antes de hacer commit
□ El código compila (npm run build)
□ Los tests pasan (npm test)
□ El linter no da errores (npm run lint)
□ Actualicé CHANGELOG.md si aplica
□ El commit sigue Conventional Commits