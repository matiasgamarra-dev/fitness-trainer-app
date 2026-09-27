# 🎨 Wireframes y Flujos

Descripción de las pantallas del MVP (V1).

## Flujo general
Landing → Registro → Onboarding → Dashboard
├── Rutinas
├── Entrenamiento
├── Nutrición
├── Progreso
└── Perfil

text

## Pantallas V1

### 1. Landing (`/`)

- Logo + nombre
- Tagline: "Entrená. Comé. Progresá."
- Botones: "Iniciar sesión" / "Crear cuenta"
- Sección features (3 cards)
- Footer

### 2. Registro (`/register`)

- Nombre, Email, Password, Confirmar password
- Botón "Crear cuenta"
- Link a login

### 3. Login (`/login`)

- Email, Password
- Botón "Iniciar sesión"
- Link a registro

### 4. Onboarding (`/onboarding`)

1. Datos físicos: altura, peso, fecha nacimiento, sexo
2. Objetivo: perder grasa / ganar músculo / mantener
3. Nivel: principiante / intermedio / avanzado
4. Frecuencia: días por semana

### 5. Dashboard (`/dashboard`)

- Peso actual + gráfico mini
- Calorías consumidas hoy / objetivo
- Entrenamiento de hoy
- Racha de días activos

### 6. Rutinas (`/routines`)

- Card por rutina con nombre, días/semana, activa
- Botón "Nueva rutina"

### 7. Detalle de rutina (`/routines/:id`)

- Nombre, descripción
- Ejercicios por día (acordeón)
- Botón "Iniciar entrenamiento"

### 8. Entrenamiento activo (`/workout/:sessionId`)

- Ejercicio actual
- Series con peso/reps editables
- Timer de descanso circular
- Botones "Siguiente" / "Finalizar"

### 9. Nutrición (`/nutrition`)

- Resumen del día: calorías, macros
- Comidas: desayuno, almuerzo, cena, snacks
- Botón "Buscar alimento"

### 10. Buscar alimento (`/nutrition/search`)

- Input de búsqueda
- Resultados con macros por 100g
- Modal para cantidad

### 11. Progreso (`/progress`)

- Tabs: Peso / Medidas / Fuerza
- Gráfico grande (Recharts)
- Tabla de registros

### 12. Perfil (`/profile`)

- Avatar + nombre
- Datos personales
- Objetivo nutricional
- Botón "Editar" / "Cerrar sesión"

## Componentes reutilizables

- `<Button />`, `<Input />`, `<Card />`, `<Modal />`
- `<Chart />`, `<ProgressBar />`, `<Timer />`, `<EmptyState />`

## Paleta de colores

| Uso | HEX |
|---|---|
| Fondo principal | `#0D1117` |
| Fondo secundario | `#161B22` |
| Primario | `#00D9FF` |
| Acento | `#7C3AED` |
| Texto principal | `#F0F6FC` |
| Texto secundario | `#C9D1D9` |
| Éxito | `#3FB950` |
| Advertencia | `#D29922` |
| Error | `#F85149` |

## Tipografía

- **UI**: Inter
- **Números/datos**: JetBrains Mono
- **Tamaños**: 12 / 14 / 16 / 20 / 24 / 32 / 48

## Responsive

- **Mobile first**: 375px base
- **Tablet**: 768px
- **Desktop**: 1024px+