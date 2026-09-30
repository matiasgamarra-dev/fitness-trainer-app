# 🗄️ Modelo de Datos

Esquema de la base de datos en Supabase (PostgreSQL).

## Diagrama de entidades

```
auth.users (Supabase Auth)
    │
    │ (trigger handle_new_user)
    ↓
public.users ──┬── BodyMeasurement (1:N)
               ├── Routine (1:N) ── RoutineExercise (1:N) ── Exercise (N:1)
               ├── WorkoutSession (1:N) ── WorkoutSet (1:N) ── Exercise (N:1)
               ├── Meal (1:N) ── MealItem (1:N) ── Food (N:1)
               └── NutritionGoal (1:N)
```

## Relación con Supabase Auth

**Supabase maneja `auth.users`** (tabla interna del sistema de auth):
- Guarda email, password hasheado, providers, metadata
- NO se debe tocar manualmente
- Cada usuario registrado tiene un UUID único

**Nosotros tenemos `public.users`** (nuestra tabla de perfil):
- Copia el `id` de `auth.users` como PK
- Se sincroniza automáticamente vía **trigger** `handle_new_user`
- Guarda datos de perfil: nombre, birth_date, height, goal, etc.

**Flujo:**
1. Usuario se registra (email o Google)
2. Supabase crea registro en `auth.users`
3. **Trigger `handle_new_user`** se dispara y crea registro en `public.users`
4. Backend usa `supabaseAdmin` para leer/escribir `public.users`

## Tablas

### `public.users`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK, FK → auth.users.id |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(100) | |
| birth_date | DATE | |
| sex | TEXT | CHECK: male/female/other |
| height_cm | NUMERIC(5,2) | |
| goal | TEXT | CHECK: lose_fat/gain_muscle/maintain |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Trigger auto-actualiza |

**RLS activo:** cada user solo ve/edita su propio registro.

### `body_measurements` (Sprint 2)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| date | DATE | |
| weight_kg | NUMERIC(5,2) | |
| body_fat_pct | NUMERIC(4,1) | opcional |
| chest_cm, waist_cm, arm_cm, thigh_cm | NUMERIC(5,1) | opcional |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### `exercises` (Sprint 3)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE |
| description | TEXT | |
| muscle_group | VARCHAR(50) | |
| equipment | VARCHAR(50) | |
| video_url | TEXT | opcional |
| created_at | TIMESTAMPTZ | |

### `routines` (Sprint 3)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| name | VARCHAR(100) | |
| description | TEXT | |
| days_per_week | INT | |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |

### `routine_exercises` (Sprint 3)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| routine_id | UUID | FK → routines |
| exercise_id | UUID | FK → exercises |
| day_of_week | INT | 1-7 |
| sets | INT | |
| reps_range | VARCHAR(20) | ej: "8-12" |
| rest_seconds | INT | |
| order_index | INT | |

### `workout_sessions` (Sprint 4)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| routine_id | UUID | FK → routines, nullable |
| date | TIMESTAMPTZ | |
| duration_minutes | INT | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### `workout_sets` (Sprint 4)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| session_id | UUID | FK → workout_sessions |
| exercise_id | UUID | FK → exercises |
| set_number | INT | |
| weight_kg | NUMERIC(6,2) | |
| reps | INT | |
| completed | BOOLEAN | default false |

### `foods` (Sprint 5)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(150) | |
| calories_per_100g | NUMERIC(6,1) | |
| protein_g | NUMERIC(5,1) | por 100g |
| carbs_g | NUMERIC(5,1) | por 100g |
| fat_g | NUMERIC(5,1) | por 100g |

### `meals` (Sprint 5)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| date | DATE | |
| meal_type | TEXT | CHECK: breakfast/lunch/dinner/snack |
| notes | TEXT | |

### `meal_items` (Sprint 5)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| meal_id | UUID | FK → meals |
| food_id | UUID | FK → foods |
| quantity_g | NUMERIC(6,1) | |
| computed_calories | NUMERIC(6,1) | desnormalizado |
| computed_protein | NUMERIC(5,1) | |
| computed_carbs | NUMERIC(5,1) | |
| computed_fat | NUMERIC(5,1) | |

### `nutrition_goals` (Sprint 5)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| daily_calories | INT | |
| daily_protein_g | INT | |
| daily_carbs_g | INT | |
| daily_fat_g | INT | |
| active_from | DATE | |

## Row Level Security (RLS)

**Todas las tablas de `public` tienen RLS habilitado.**

### Políticas en `public.users`

| Operación | Política |
|---|---|
| SELECT | `auth.uid() = id` |
| INSERT | `auth.uid() = id` |
| UPDATE | `auth.uid() = id` |
| DELETE | (sin política) |

### Futuras tablas

Siempre:
1. `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
2. Crear políticas explícitas
3. Testear con un usuario "atacante"

## Triggers

### `handle_new_user`

Al crear un usuario en `auth.users`, inserta automáticamente en `public.users`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `handle_updated_at`

Actualiza `updated_at` en cada UPDATE de `public.users`.

## Índices recomendados

- `users.email` (UNIQUE)
- `body_measurements(user_id, date)`
- `workout_sessions(user_id, date)`
- `meals(user_id, date)`
- `exercises.muscle_group`
- `foods.name` (búsqueda)

## Convenciones

- **IDs**: UUID v4
- **Timestamps**: TIMESTAMPTZ
- **Nombres DB**: snake_case
- **Nombres código**: camelCase
- **Enums**: usar CHECK en SQL
- **Soft delete**: considerar en V2
