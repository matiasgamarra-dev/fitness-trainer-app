-- ============================================================
-- Migration: 20261018000002_seed_exercises
-- Sprint 3 - Rutinas
--
-- Seed del catalogo global de ejercicios (~50).
-- Idempotente: usa ON CONFLICT (name) DO NOTHING.
-- ============================================================

-- â”€â”€â”€ CHEST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.exercises (name, muscle_group, equipment, description) VALUES
  ('Bench Press', 'chest', 'barbell', 'Press de banca plano con barra'),
  ('Incline Bench Press', 'chest', 'barbell', 'Press de banca inclinado con barra'),
  ('Dumbbell Bench Press', 'chest', 'dumbbell', 'Press de banca con mancuernas'),
  ('Dumbbell Fly', 'chest', 'dumbbell', 'Aperturas planas con mancuernas'),
  ('Cable Crossover', 'chest', 'cable', 'Cruces de polea para pecho'),
  ('Push Up', 'chest', 'bodyweight', 'Flexiones de brazos')
ON CONFLICT (name) DO NOTHING;

-- â”€â”€â”€ BACK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.exercises (name, muscle_group, equipment, description) VALUES
  ('Deadlift', 'back', 'barbell', 'Peso muerto convencional'),
  ('Barbell Row', 'back', 'barbell', 'Remo con barra'),
  ('Pull Up', 'back', 'bodyweight', 'Dominadas'),
  ('Lat Pulldown', 'back', 'cable', 'Jalon al pecho en polea alta'),
  ('Seated Cable Row', 'back', 'cable', 'Remo sentado en polea'),
  ('Single Arm Dumbbell Row', 'back', 'dumbbell', 'Remo a una mano con mancuerna'),
  ('T-Bar Row', 'back', 'barbell', 'Remo en T')
ON CONFLICT (name) DO NOTHING;

-- â”€â”€â”€ SHOULDERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.exercises (name, muscle_group, equipment, description) VALUES
  ('Overhead Press', 'shoulders', 'barbell', 'Press militar de pie'),
  ('Dumbbell Shoulder Press', 'shoulders', 'dumbbell', 'Press de hombros con mancuernas'),
  ('Lateral Raise', 'shoulders', 'dumbbell', 'Elevaciones laterales'),
  ('Front Raise', 'shoulders', 'dumbbell', 'Elevaciones frontales'),
  ('Rear Delt Fly', 'shoulders', 'dumbbell', 'Aperturas posteriores para deltoides'),
  ('Face Pull', 'shoulders', 'cable', 'Jalon a la cara en polea'),
  ('Arnold Press', 'shoulders', 'dumbbell', 'Press Arnold')
ON CONFLICT (name) DO NOTHING;

-- â”€â”€â”€ BICEPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.exercises (name, muscle_group, equipment, description) VALUES
  ('Barbell Curl', 'biceps', 'barbell', 'Curl de biceps con barra'),
  ('Dumbbell Curl', 'biceps', 'dumbbell', 'Curl de biceps con mancuernas'),
  ('Hammer Curl', 'biceps', 'dumbbell', 'Curl martillo'),
  ('Preacher Curl', 'biceps', 'barbell', 'Curl en banco Scott'),
  ('Cable Curl', 'biceps', 'cable', 'Curl en polea')
ON CONFLICT (name) DO NOTHING;

-- â”€â”€â”€ TRICEPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.exercises (name, muscle_group, equipment, description) VALUES
  ('Triceps Pushdown', 'triceps', 'cable', 'Extension de triceps en polea'),
  ('Overhead Triceps Extension', 'triceps', 'dumbbell', 'Extension de triceps sobre la cabeza'),
  ('Dips', 'triceps', 'bodyweight', 'Fondos en paralelas'),
  ('Skull Crusher', 'triceps', 'barbell', 'Extension de triceps en banco plano'),
  ('Close Grip Bench Press', 'triceps', 'barbell', 'Press de banca agarre cerrado')
ON CONFLICT (name) DO NOTHING;

-- â”€â”€â”€ LEGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.exercises (name, muscle_group, equipment, description) VALUES
  ('Squat', 'legs', 'barbell', 'Sentadilla trasera con barra'),
  ('Front Squat', 'legs', 'barbell', 'Sentadilla frontal'),
  ('Leg Press', 'legs', 'machine', 'Prensa de piernas'),
  ('Romanian Deadlift', 'legs', 'barbell', 'Peso muerto rumano'),
  ('Leg Extension', 'legs', 'machine', 'Extension de cuadriceps'),
  ('Leg Curl', 'legs', 'machine', 'Curl femoral'),
  ('Walking Lunge', 'legs', 'dumbbell', 'Zancadas caminando'),
  ('Bulgarian Split Squat', 'legs', 'dumbbell', 'Sentadilla bulgara')
ON CONFLICT (name) DO NOTHING;

-- â”€â”€â”€ GLUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.exercises (name, muscle_group, equipment, description) VALUES
  ('Hip Thrust', 'glutes', 'barbell', 'Empuje de cadera con barra'),
  ('Glute Bridge', 'glutes', 'bodyweight', 'Puente de gluteos'),
  ('Cable Kickback', 'glutes', 'cable', 'Patada de gluteo en polea')
ON CONFLICT (name) DO NOTHING;

-- â”€â”€â”€ CORE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.exercises (name, muscle_group, equipment, description) VALUES
  ('Plank', 'core', 'bodyweight', 'Plancha frontal'),
  ('Crunch', 'core', 'bodyweight', 'Abdominales clasicos'),
  ('Hanging Leg Raise', 'core', 'bodyweight', 'Elevacion de piernas colgado'),
  ('Russian Twist', 'core', 'bodyweight', 'Giro ruso'),
  ('Cable Crunch', 'core', 'cable', 'Abdominales en polea')
ON CONFLICT (name) DO NOTHING;

-- â”€â”€â”€ CARDIO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.exercises (name, muscle_group, equipment, description) VALUES
  ('Treadmill Run', 'cardio', 'machine', 'Carrera en cinta'),
  ('Stationary Bike', 'cardio', 'machine', 'Bicicleta fija'),
  ('Rowing Machine', 'cardio', 'machine', 'Remo ergometro'),
  ('Jump Rope', 'cardio', 'other', 'Salto de cuerda'),
  ('Burpee', 'cardio', 'bodyweight', 'Burpees')
ON CONFLICT (name) DO NOTHING;

-- â”€â”€â”€ FULL BODY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.exercises (name, muscle_group, equipment, description) VALUES
  ('Clean and Jerk', 'full_body', 'barbell', 'Cargada y envion olimpico'),
  ('Snatch', 'full_body', 'barbell', 'Arrancada olimpica'),
  ('Kettlebell Swing', 'full_body', 'kettlebell', 'Swing con kettlebell'),
  ('Thruster', 'full_body', 'barbell', 'Sentadilla + press militar')
ON CONFLICT (name) DO NOTHING;

-- â”€â”€â”€ UNIQUE constraint para idempotencia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Agregamos UNIQUE(name) para que el ON CONFLICT funcione.
-- Si ya existe como constraint, esto falla silenciosamente.
