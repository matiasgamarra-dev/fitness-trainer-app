// scripts/create-measurements-routes.mjs
// Crea los archivos del Bloque D: rutas de medidas + tests + modifica server.ts
// Ejecutar: node scripts\create-measurements-routes.mjs

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = join(import.meta.dirname, "..");
const api = join(root, "apps", "api");

// ──────────────────────────────────────────────────────────────
// 1. routes/measurements.ts
// ──────────────────────────────────────────────────────────────
const routeContent = `import { Router, type Response } from "express";
import { verifyUser, type AuthRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import {
  measurementCreateSchema,
  type MeasurementCreateInput,
} from "@fitness-trainer/shared";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────

function getUserId(req: AuthRequest, res: Response): string | null {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: "User ID not found in token",
    });
    return null;
  }
  return userId;
}

// ─── POST /api/v1/measurements ───────────────────────────────
// Crea una medida corporal nueva.
// Body: { date, weight_kg, body_fat_pct?, chest_cm?, ... }
// 409 si ya existe una medida en esa fecha para ese usuario.

router.post("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const parsed = measurementCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    const payload: MeasurementCreateInput & { user_id: string } = {
      ...parsed.data,
      user_id: userId,
    };

    const { data, error } = await supabaseAdmin
      .from("body_measurements")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      // UNIQUE(user_id, date) violado
      if (error.code === "23505") {
        res.status(409).json({
          success: false,
          error: "Measurement already exists for this date",
          hint: "Ya hay una medida registrada en esa fecha. Podés editarla con PUT /measurements/:id o eliminarla con DELETE.",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Database error",
        details: error.message,
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: data,
      message: "Measurement created",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: message,
    });
  }
});

// ─── GET /api/v1/measurements ────────────────────────────────
// Lista las medidas del usuario autenticado.
// Query params opcionales:
//   ?limit=N          (default 30, max 365)
//   ?from=YYYY-MM-DD  (fecha mínima, inclusive)
//   ?to=YYYY-MM-DD    (fecha máxima, inclusive)

router.get("/", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    // Parsear y validar query params
    const limitRaw = req.query.limit;
    const fromRaw = req.query.from;
    const toRaw = req.query.to;

    let limit = 30;
    if (typeof limitRaw === "string") {
      const parsed = Number.parseInt(limitRaw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 365);
      }
    }

    const dateRegex = /^\\d{4}-\\d{2}-\\d{2}$/;
    const from =
      typeof fromRaw === "string" && dateRegex.test(fromRaw) ? fromRaw : null;
    const to =
      typeof toRaw === "string" && dateRegex.test(toRaw) ? toRaw : null;

    let query = supabaseAdmin
      .from("body_measurements")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);

    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    const { data, error } = await query;

    if (error) {
      res.status(500).json({
        success: false,
        error: "Database error",
        details: error.message,
      });
      return;
    }

    res.json({
      success: true,
      data: data,
      message: "OK",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: message,
    });
  }
});

// ─── PUT /api/v1/measurements/:id ────────────────────────────
// Actualiza una medida existente (partial update).
// Solo funciona si la medida pertenece al usuario autenticado.

router.put("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    const parsed = measurementCreateSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    if (Object.keys(parsed.data).length === 0) {
      res.status(400).json({
        success: false,
        error: "Empty body",
        hint: "Enviá al menos un campo para actualizar.",
      });
      return;
    }

    // Verificamos que la medida exista y sea del usuario
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("body_measurements")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({
        success: false,
        error: "Measurement not found",
      });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés modificar medidas de otro usuario.",
      });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("body_measurements")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        res.status(409).json({
          success: false,
          error: "Measurement already exists for this date",
          hint: "Ya hay otra medida en esa fecha.",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Database error",
        details: error.message,
      });
      return;
    }

    res.json({
      success: true,
      data: data,
      message: "Measurement updated",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: message,
    });
  }
});

// ─── DELETE /api/v1/measurements/:id ─────────────────────────
// Elimina una medida existente.
// Solo funciona si la medida pertenece al usuario autenticado.

router.delete("/:id", verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    // Verificar pertenencia antes de borrar
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("body_measurements")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({
        success: false,
        error: "Measurement not found",
      });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "No podés eliminar medidas de otro usuario.",
      });
      return;
    }

    const { error } = await supabaseAdmin
      .from("body_measurements")
      .delete()
      .eq("id", id);

    if (error) {
      res.status(500).json({
        success: false,
        error: "Database error",
        details: error.message,
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: message,
    });
  }
});

export default router;
`;

// ──────────────────────────────────────────────────────────────
// 2. tests/measurements.test.ts
// ──────────────────────────────────────────────────────────────
const testContent = `import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createServer } from "../src/server.js";

// ─── Mocks ───────────────────────────────────────────────────
vi.mock("jose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jose")>();
  return {
    ...actual,
    createRemoteJWKSet: vi.fn(() => "mocked-jwks"),
    jwtVerify: vi.fn(async (token: string) => {
      if (token === "valid-token") {
        return {
          payload: {
            sub: "test-user-id",
            email: "test@example.com",
            role: "authenticated",
          },
          protectedHeader: { alg: "HS256" },
        };
      }
      throw new Error("Invalid token");
    }),
  };
});

// Usamos vi.hoisted para tener las variables disponibles en el factory
const { mockChain, setMockResponse } = vi.hoisted(() => {
  const state: {
    singleResponse: { data: unknown; error: unknown };
    listResponse: { data: unknown; error: unknown };
    deleteResponse: { error: unknown };
  } = {
    singleResponse: { data: null, error: null },
    listResponse: { data: [], error: null },
    deleteResponse: { error: null },
  };

  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(state.listResponse),
    single: vi.fn(() => Promise.resolve(state.singleResponse)),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    // then() permite que se resuelva al hacer await del chain
    then: vi.fn((resolve: (v: unknown) => unknown) =>
      Promise.resolve(state.deleteResponse).then(resolve),
    ),
  };

  return {
    mockChain: chain,
    setMockResponse: (kind: keyof typeof state, value: unknown) => {
      state[kind] = value as never;
    },
  };
});

vi.mock("../src/config/supabase.js", () => ({
  supabaseAdmin: {
    from: vi.fn(() => mockChain),
  },
  supabasePublic: {},
}));

// ─── Tests ───────────────────────────────────────────────────

describe("POST /api/v1/measurements", () => {
  const app = createServer();

  beforeEach(() => {
    vi.clearAllMocks();
    setMockResponse("singleResponse", {
      data: {
        id: "measurement-id",
        user_id: "test-user-id",
        date: "2026-09-29",
        weight_kg: 80,
      },
      error: null,
    });
  });

  it("devuelve 401 sin Authorization header", async () => {
    const res = await request(app)
      .post("/api/v1/measurements")
      .send({ date: "2026-09-29", weight_kg: 80 });

    expect(res.status).toBe(401);
  });

  it("devuelve 400 si falta weight_kg", async () => {
    const res = await request(app)
      .post("/api/v1/measurements")
      .set("Authorization", "Bearer valid-token")
      .send({ date: "2026-09-29" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("devuelve 400 con fecha inválida", async () => {
    const res = await request(app)
      .post("/api/v1/measurements")
      .set("Authorization", "Bearer valid-token")
      .send({ date: "29/09/2026", weight_kg: 80 });

    expect(res.status).toBe(400);
  });

  it("crea medida con body válido y devuelve 201", async () => {
    const res = await request(app)
      .post("/api/v1/measurements")
      .set("Authorization", "Bearer valid-token")
      .send({ date: "2026-09-29", weight_kg: 80, waist_cm: 85 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/created/i);
  });
});

describe("GET /api/v1/measurements", () => {
  const app = createServer();

  beforeEach(() => {
    vi.clearAllMocks();
    setMockResponse("listResponse", {
      data: [
        { id: "1", date: "2026-09-29", weight_kg: 80 },
        { id: "2", date: "2026-09-28", weight_kg: 80.5 },
      ],
      error: null,
    });
  });

  it("devuelve 401 sin token", async () => {
    const res = await request(app).get("/api/v1/measurements");
    expect(res.status).toBe(401);
  });

  it("devuelve lista con token válido", async () => {
    const res = await request(app)
      .get("/api/v1/measurements")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("acepta query params ?limit y ?from", async () => {
    const res = await request(app)
      .get("/api/v1/measurements?limit=10&from=2026-01-01")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/v1/measurements/:id", () => {
  const app = createServer();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 sin token", async () => {
    const res = await request(app).delete("/api/v1/measurements/abc");
    expect(res.status).toBe(401);
  });

  it("devuelve 404 si la medida no existe", async () => {
    setMockResponse("singleResponse", { data: null, error: { code: "PGRST116" } });

    const res = await request(app)
      .delete("/api/v1/measurements/nonexistent")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(404);
  });
});
`;

// ──────────────────────────────────────────────────────────────
// 3. Modificar server.ts para registrar el router
// ──────────────────────────────────────────────────────────────
const serverPath = join(api, "src", "server.ts");

const files = {
  [join(api, "src", "routes", "measurements.ts")]: routeContent,
  [join(api, "tests", "measurements.test.ts")]: testContent,
};

async function main() {
  console.log("📦 Creando archivos del Bloque D...\n");

  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf8");
    const rel = path.replace(root + "\\", "").replace(root + "/", "");
    console.log(`   ✅ ${rel}`);
  }

  // Modificar server.ts
  let serverContent = await readFile(serverPath, "utf8");

  // Agregar import si no está
  if (!serverContent.includes("measurementsRouter")) {
    serverContent = serverContent.replace(
      'import profileRouter from "./routes/profile.js";',
      'import profileRouter from "./routes/profile.js";\nimport measurementsRouter from "./routes/measurements.js";',
    );
  }

  // Agregar app.use si no está
  if (!serverContent.includes('"/api/v1/measurements"')) {
    serverContent = serverContent.replace(
      'app.use("/api/v1/profile", profileRouter);',
      'app.use("/api/v1/profile", profileRouter);\n  app.use("/api/v1/measurements", measurementsRouter);',
    );
  }

  await writeFile(serverPath, serverContent, "utf8");
  console.log("   ✅ apps\\api\\src\\server.ts (modificado)");

  console.log("\n🎉 Listo. Bloque D creado.");
  console.log("\n⚠️  IMPORTANTE:");
  console.log("   Corré los tests para verificar:");
  console.log("   npm test -w @fitness-trainer/api");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});