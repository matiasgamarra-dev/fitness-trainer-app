import { describe, it, expect, vi, beforeEach } from "vitest";
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
