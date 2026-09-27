# 🏗️ Arquitectura del Proyecto

## Visión general

Fitness Trainer App es una aplicación con arquitectura cliente-servidor pensada para escalar.

## Estructura de carpetas
src/
├── components/ → Componentes reutilizables (UI)
├── screens/ → Pantallas de la app
├── services/ → Lógica de negocio, conexión a API
├── hooks/ → Custom hooks
├── context/ → Estado global (Context API)
├── utils/ → Utilidades y helpers
├── assets/ → Recursos internos del código
└── index.js → Punto de entrada

text

## Capas

1. **Presentación** (screens + components)
2. **Lógica** (services + hooks)
3. **Datos** (repositorios / API)
4. **Utilidades** (utils)

## Tecnologías propuestas

| Capa | Tecnología |
|------|------------|
| Frontend | React / React Native |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL / MongoDB |
| Testing | Jest |
| CI/CD | GitHub Actions |