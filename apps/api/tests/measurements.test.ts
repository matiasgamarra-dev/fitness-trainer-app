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

const { mockChain, setListResponse, setSingleResponse } = vi.hoisted(() => {
  const state: {
    listResponse: { data: unknown; error: unknown };
    singleResponse: { data: unknown; error: unknown };
  } = {
    listResponse: { data: [], error: null },
    singleResponse: { data: null, error: null },
  };

  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    // limit() resuelve la lista (caso GET y check semanal en POST)
    limit: vi.fn(() => Promise.resolve(state.listResponse)),
    // single() resuelve un registro único (caso POST insert, GET by id, PUT)
    single: vi.fn(() => Promise.resolve(state.singleResponse)),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };

  return {
    mockChain: chain,
    setListResponse: (resp: { data: unknown; error: unknown }) => {
      state.listResponse = resp;
    },
    setSingleResponse: (resp: { data: unknown; error: unknown }) => {
      state.singleResponse = resp;
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

const validWeekBody = {
  date: "2026-09-30",
  weight_kg: 80,
  week_start: "2026-09-28",
  week_end: "2026-10-04",
};

describe("POST /api/v1/measurements", () => {
  const app = createServer();

  beforeEach(() => {
    vi.clearAllMocks();
    // Por default, no hay medida en la semana
    setListResponse({ data: [], error: null });
    // Y el insert devuelve una medida
    setSingleResponse({
      data: {
        id: "measurement-id",
        user_id: "test-user-id",
        date: "2026-09-30",
        weight_kg: 80,
      },
      error: null,
    });
  });

  it("devuelve 401 sin Authorization header", async () => {
    const res = await request(app)
      .post("/api/v1/measurements")
      .send(validWeekBody);

    expect(res.status).toBe(401);
  });

  it("devuelve 400 si falta weight_kg", async () => {
    const res = await request(app)
      .post("/api/v1/measurements")
      .set("Authorization", "Bearer valid-token")
      .send({
        date: "2026-09-30",
        week_start: "2026-09-28",
        week_end: "2026-10-04",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("devuelve 400 si falta week_start o week_end", async () => {
    const res = await request(app)
      .post("/api/v1/measurements")
      .set("Authorization", "Bearer valid-token")
      .send({ date: "2026-09-30", weight_kg: 80 });

    expect(res.status).toBe(400);
  });

  it("devuelve 400 si week_end no es exactamente 6 días después", async () => {
    const res = await request(app)
      .post("/api/v1/measurements")
      .set("Authorization", "Bearer valid-token")
      .send({
        date: "2026-09-30",
        weight_kg: 80,
        week_start: "2026-09-28",
        week_end: "2026-10-10", // 12 días
      });

    expect(res.status).toBe(400);
  });

  it("devuelve 400 con fecha inválida", async () => {
    const res = await request(app)
      .post("/api/v1/measurements")
      .set("Authorization", "Bearer valid-token")
      .send({
        date: "29/09/2026",
        weight_kg: 80,
        week_start: "2026-09-28",
        week_end: "2026-10-04",
      });

    expect(res.status).toBe(400);
  });

  it("crea medida con body válido y devuelve 201", async () => {
    const res = await request(app)
      .post("/api/v1/measurements")
      .set("Authorization", "Bearer valid-token")
      .send(validWeekBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/created/i);
  });

  it("devuelve 409 si ya hay una medida en esa semana", async () => {
    setListResponse({
      data: [{ id: "existing-id", date: "2026-09-29" }],
      error: null,
    });

    const res = await request(app)
      .post("/api/v1/measurements")
      .set("Authorization", "Bearer valid-token")
      .send(validWeekBody);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/already exists/i);
    expect(res.body.details.existing_id).toBe("existing-id");
  });
});

describe("GET /api/v1/measurements", () => {
  const app = createServer();

  beforeEach(() => {
    vi.clearAllMocks();
    setListResponse({
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
    setSingleResponse({ data: null, error: { code: "PGRST116" } });

    const res = await request(app)
      .delete("/api/v1/measurements/nonexistent")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(404);
  });
});