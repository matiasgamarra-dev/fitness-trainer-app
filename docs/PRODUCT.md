# 🎯 Visión del Producto

## Pitch

App de seguimiento personal que integra nutrición, entrenamiento y progreso físico en un solo lugar, con planes personalizados y métricas claras.

## Problema que resuelve

Hoy una persona que quiere entrenar y comer bien necesita:
- Una app para contar calorías
- Otra para registrar entrenamientos
- Otra para ver progreso
- Una libreta o Excel para el peso

**Fitness Trainer App unifica todo** en una sola interfaz simple.

## Público objetivo

### Usuario principal (V1)
- Personas de 18 a 45 años
- Que arrancan o retoman el gimnasio
- Que quieren ordenar su alimentación
- Que buscan ver progreso medible

### Usuarios secundarios (V3)
- Entrenadores personales que gestionan clientes
- Nutricionistas que siguen pacientes

## Propuesta de valor

1. **Todo en uno**: no cambiar entre 5 apps
2. **Datos accionables**: no solo registrar, sino entender
3. **Simple y rápido**: registrar un entrenamiento en <30 segundos
4. **Gratis para el usuario final** (en V1 y V2)

## Módulos funcionales

### V1 — MVP (lo mínimo viable)

| Módulo | Qué hace |
|---|---|
| Autenticación | Registro, login, perfil básico |
| Perfil físico | Peso, altura, edad, objetivo |
| Rutinas | Crear y seguir rutinas |
| Registro de entrenamientos | Series, reps, peso, notas |
| Registro de comidas | Comidas con macros |
| Progreso | Peso corporal, medidas, gráficos |

### V2 — Consolidación

- Calculadora de macros automática
- Base de datos de ejercicios con video
- Base de datos de alimentos (por 100g)
- Rutinas predefinidas (full body, PPL, etc.)
- Gráficos avanzados (fuerza, volumen, adherencia)
- Recordatorios y notificaciones

### V3 — Profesional / Social

- Modo entrenador (multi-cliente)
- Chat entrenador-cliente
- Integración con wearables (Apple Health, Google Fit)
- Recomendaciones con IA
- Modo social (compartir progreso, retos)

## Métricas de éxito

### Para el usuario
- % de adherencia al plan semanal
- Progreso en fuerza (kg levantados)
- Progreso en composición corporal
- Retención a 30 días

### Para el producto
- Usuarios activos mensuales (MAU)
- Sesiones por usuario por semana
- Tiempo promedio por sesión

## Fuera de alcance (por ahora)

- ❌ Marketplace de entrenadores
- ❌ Planes de pago en V1
- ❌ Recetas paso a paso
- ❌ Integración con gimnasios físicos

## Decisiones de producto clave

1. **Mobile-first web** → arrancamos en web responsive, después PWA, después nativo
2. **Sin redes sociales en V1** → enfoque en uso personal primero
3. **Datos del usuario son suyos** → exportación en CSV/JSON en V2
4. **Español primero** → i18n en V3