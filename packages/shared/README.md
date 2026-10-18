# @fitness-trainer/shared

Tipos, schemas Zod y constantes compartidas entre apps/api y apps/web.

## Por que existe

Sin este paquete, cada app duplicaria la validacion de datos. Con el:

- **Backend** valida el req.body con Schema.safeParse().
- **Frontend** usa los mismos tipos (via z.infer) para tipar las respuestas y formularios.
- **Unico origen de verdad**: si cambia un campo, cambia en un solo lugar.

## Stack

- **Runtime**: Node.js + TypeScript
- **Validacion**: Zod 4

## Estructura

````
packages/shared/
  src/
    schemas/
      profile.ts      UserProfile, UpdateProfileInput
      measurement.ts  BodyMeasurement, Create/UpdateMeasurement
      exercise.ts     Exercise, ExerciseFilters
      routine.ts      Routine, RoutineExercise, Create/UpdateRoutine
      workout.ts      WorkoutSession, WorkoutSet, Stats, inputs
    index.ts          barrel: exporta todos los schemas
  package.json
  tsconfig.json
````

## Como consumirlo

En backend:

    import { CreateWorkoutSessionSchema } from '@fitness-trainer/shared';

    const parsed = CreateWorkoutSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

En frontend:

    import type { WorkoutSession } from '@fitness-trainer/shared';

    const [sessions, setSessions] = useState<WorkoutSession[]>([]);

## Agregar un schema nuevo

Paso 1: Crear el archivo en src/schemas/mi-recurso.ts:

    import { z } from 'zod';

    export const MiRecursoSchema = z.object({
      id: z.uuid(),
      name: z.string().min(1).max(100),
    });

    export type MiRecurso = z.infer<typeof MiRecursoSchema>;

Paso 2: Agregar el export al barrel src/index.ts:

    export * from './schemas/mi-recurso.js';

Ojo con el .js: es TypeScript con type=module. Aunque el archivo sea .ts, el import lleva .js (ESM lo requiere).

Paso 3: Correr npx tsc --noEmit -p packages/shared/tsconfig.json desde la raiz.

Paso 4: Commitear.

## Convenciones Zod 4

- **UUID**: z.uuid() valida solo UUID v4. Los tests tienen que usar xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (con 4 en la posicion 13).
- **Datetime**: z.iso.datetime() (reemplaza a z.string().datetime() de Zod 3).
- **Nullable vs optional**:
  - z.string().nullable() -> puede ser null (columna nullable en DB).
  - z.string().optional() -> puede estar ausente (body partial update).
  - z.string().nullable().optional() -> ambos.

## Scripts

| Comando | Que hace |
|---|---|
| npm run build --workspace=packages/shared | Placeholder (shared no se compila, se consume via TS paths) |
| npx tsc --noEmit -p packages/shared/tsconfig.json | Typecheck manual |

No hay tests propios. Este paquete se testea indirectamente:

- Los schemas se ejercitan en los tests de apps/api (al validar bodies).
- Y en los tests de apps/web (al tipar mocks y respuestas).

## Reglas

- **NO** agregar logica de negocio aca. Solo schemas, tipos y constantes puras.
- **NO** importar nada de apps/ (rompe la direccion de dependencia).
- Si un schema depende de otro (ej: WorkoutSessionWithSets incluye WorkoutSet[]), usar .extend() o z.array().
- Todo cambio aca impacta a api y web -> correr typecheck de los 3 workspaces antes de commitear.

## Referencias

- docs/ARCHITECTURE.md - arquitectura del monorepo
- docs/STACK.md - por que Zod
