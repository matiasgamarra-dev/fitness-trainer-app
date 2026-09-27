# 🗄️ Modelo de Datos

Esquema de la base de datos (PostgreSQL).

## Diagrama de entidades
User ──┬── BodyMeasurement (1:N)
├── Routine (1:N) ── RoutineExercise (1:N) ── Exercise (N:1)
├── WorkoutSession (1:N) ── WorkoutSet (1:N) ── Exercise (N:1)
├── Meal (1:N) ── MealItem (1:N) ── Food (N:1)
└── NutritionGoal (1:N)

text

## Tablas

### `users`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | bcrypt |
| name | VARCHAR(100) | |
| birth_date | DATE | |
| sex | ENUM('male','female','other') | |
| height_cm | NUMERIC(5,2) | |
| goal | ENUM('lose_fat','gain_muscle','maintain') | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `body_measurements`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK users |
| date | DATE | |
| weight_kg | NUMERIC(5,2) | |
| body_fat_pct | NUMERIC(4,1) | opcional |
| chest_cm | NUMERIC(5,1) | opcional |
| waist_cm | NUMERIC(5,1) | opcional |
| arm_cm | NUMERIC(5,1) | opcional |
| thigh_cm | NUMERIC(5,1) | opcional |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### `exercises`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE |
| description | TEXT | |
| muscle_group | VARCHAR(50) | chest, back, legs, ... |
| equipment | VARCHAR(50) | barbell, dumbbell, ... |
| video_url | TEXT | opcional |
| created_at | TIMESTAMPTZ | |

### `routines`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK users |
| name | VARCHAR(100) | |
| description | TEXT | |
| days_per_week | INT | |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |

### `routine_exercises`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| routine_id | UUID | FK routines |
| exercise_id | UUID | FK exercises |
| day_of_week | INT | 1-7 |
| sets | INT | |
| reps_range | VARCHAR(20) | ej: "8-12" |
| rest_seconds | INT | |
| order_index | INT | |

### `workout_sessions`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK users |
| routine_id | UUID | FK routines, nullable |
| date | TIMESTAMPTZ | |
| duration_minutes | INT | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### `workout_sets`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| session_id | UUID | FK workout_sessions |
| exercise_id | UUID | FK exercises |
| set_number | INT | |
| weight_kg | NUMERIC(6,2) | |
| reps | INT | |
| completed | BOOLEAN | default false |

### `foods`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(150) | |
| calories_per_100g | NUMERIC(6,1) | |
| protein_g | NUMERIC(5,1) | por 100g |
| carbs_g | NUMERIC(5,1) | por 100g |
| fat_g | NUMERIC(5,1) | por 100g |
| serving_size_g | NUMERIC(6,1) | opcional |
| created_at | TIMESTAMPTZ | |

### `meals`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK users |
| date | DATE | |
| meal_type | ENUM('breakfast','lunch','dinner','snack') | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### `meal_items`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| meal_id | UUID | FK meals |
| food_id | UUID | FK foods |
| quantity_g | NUMERIC(6,1) | |
| computed_calories | NUMERIC(6,1) | desnormalizado |
| computed_protein | NUMERIC(5,1) | |
| computed_carbs | NUMERIC(5,1) | |
| computed_fat | NUMERIC(5,1) | |

### `nutrition_goals`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK users |
| daily_calories | INT | |
| daily_protein_g | INT | |
| daily_carbs_g | INT | |
| daily_fat_g | INT | |
| active_from | DATE | |
| created_at | TIMESTAMPTZ | |

## Índices recomendados

- `users.email` (UNIQUE)
- `body_measurements(user_id, date)` 
- `workout_sessions(user_id, date)`
- `meals(user_id, date)`
- `exercises.muscle_group`
- `foods.name` (para búsqueda)

## Convenciones

- **IDs**: UUID v4 (evita colisiones y es más seguro que autoincremental)
- **Timestamps**: `TIMESTAMPTZ` siempre
- **Nombres**: snake_case en DB, camelCase en código
- **Enums**: siempre que un campo tenga valores limitados
- **Soft delete**: considerar `deleted_at` en tablas críticas (V2)