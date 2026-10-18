import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createServer } from "../src/server.js";

vi.mock("jose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jose")>();
  return {
    ...actual,
    createRemoteJWKSet: vi.fn(() => "mocked-jwks"),
    jwtVerify: vi.fn(async (token: string) => {
      if (token === "valid-token") {
        return {
          payload: { sub: "test-user-id", email: "test@example.com", role: "authenticated" },
          protectedHeader: { alg: "HS256" },
        };
      }
      throw new Error("Invalid token");
    }),
  };
});

const { mockChain, setListResponse, setSingleResponse, setMaybeSingleResponse } = vi.hoisted(() => {
  const state = {
    listResponse: { data: [], error: null },
    singleResponse: { data: null, error: null },
    maybeSingleResponse: { data: null, error: null },
  };
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn(() => Promise.resolve(state.listResponse)),
    single: vi.fn(() => Promise.resolve(state.singleResponse)),
    maybeSingle: vi.fn(() => Promise.resolve(state.maybeSingleResponse)),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
  return {
    mockChain: chain,
    setListResponse: (r) => { state.listResponse = r; },
    setSingleResponse: (r) => { state.singleResponse = r; },
    setMaybeSingleResponse: (r) => { state.maybeSingleResponse = r; },
  };
});

vi.mock("../src/config/supabase.js", () => ({
  supabaseAdmin: { from: vi.fn(() => mockChain) },
  supabasePublic: {},
}));

const VALID_UUID = "11111111-1111-4111-8111-111111111111";

const validSession = {
  id: VALID_UUID, user_id: "test-user-id", routine_id: null,
  routine_name: "Push Day", day_of_week: 1,
  started_at: "2026-10-18T10:00:00Z", finished_at: null, notes: null,
  created_at: "2026-10-18T10:00:00Z", updated_at: "2026-10-18T10:00:00Z",
};

describe("GET /api/v1/workouts", () => {
  const app = createServer();
  beforeEach(() => { vi.clearAllMocks(); setListResponse({ data: [validSession], error: null }); });

  it("401 sin token", async () => {
    const res = await request(app).get("/api/v1/workouts");
    expect(res.status).toBe(401);
  });

  it("200 con token valido", async () => {
    const res = await request(app).get("/api/v1/workouts").set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("GET /api/v1/workouts/stats", () => {
  const app = createServer();
  beforeEach(() => { vi.clearAllMocks(); setListResponse({ data: [], error: null }); });

  it("401 sin token", async () => {
    const res = await request(app).get("/api/v1/workouts/stats");
    expect(res.status).toBe(401);
  });

  it("200 con token valido y devuelve stats", async () => {
    const res = await request(app).get("/api/v1/workouts/stats").set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("total_sessions");
    expect(res.body.data).toHaveProperty("current_streak_days");
    expect(res.body.data).toHaveProperty("last_session");
  });
});

describe("GET /api/v1/workouts/:id", () => {
  const app = createServer();
  beforeEach(() => { vi.clearAllMocks(); setSingleResponse({ data: validSession, error: null }); setListResponse({ data: [], error: null }); });

  it("401 sin token", async () => {
    const res = await request(app).get("/api/v1/workouts/" + VALID_UUID);
    expect(res.status).toBe(401);
  });

  it("404 si no existe", async () => {
    setSingleResponse({ data: null, error: { code: "PGRST116" } });
    const res = await request(app).get("/api/v1/workouts/" + VALID_UUID).set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(404);
  });

  it("200 con sets embebidos", async () => {
    const res = await request(app).get("/api/v1/workouts/" + VALID_UUID).set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("sets");
    expect(Array.isArray(res.body.data.sets)).toBe(true);
  });
});

describe("POST /api/v1/workouts", () => {
  const app = createServer();
  const validBody = { routine_id: null, routine_name: "Push Day", day_of_week: 1 };
  beforeEach(() => { vi.clearAllMocks(); setMaybeSingleResponse({ data: null, error: null }); setSingleResponse({ data: validSession, error: null }); });

  it("401 sin token", async () => {
    const res = await request(app).post("/api/v1/workouts").send(validBody);
    expect(res.status).toBe(401);
  });

  it("400 si falta routine_name", async () => {
    const res = await request(app).post("/api/v1/workouts").set("Authorization", "Bearer valid-token").send({ routine_id: null });
    expect(res.status).toBe(400);
  });

  it("201 al crear sesion", async () => {
    const res = await request(app).post("/api/v1/workouts").set("Authorization", "Bearer valid-token").send(validBody);
    expect(res.status).toBe(201);
  });

  it("409 si ya hay sesion activa", async () => {
    setMaybeSingleResponse({ data: { id: "existing-id" }, error: null });
    const res = await request(app).post("/api/v1/workouts").set("Authorization", "Bearer valid-token").send(validBody);
    expect(res.status).toBe(409);
    expect(res.body.details.active_session_id).toBe("existing-id");
  });
});

describe("PUT /api/v1/workouts/:id", () => {
  const app = createServer();
  beforeEach(() => { vi.clearAllMocks(); setSingleResponse({ data: validSession, error: null }); });

  it("401 sin token", async () => {
    const res = await request(app).put("/api/v1/workouts/" + VALID_UUID).send({ notes: "x" });
    expect(res.status).toBe(401);
  });

  it("400 con body vacio", async () => {
    const res = await request(app).put("/api/v1/workouts/" + VALID_UUID).set("Authorization", "Bearer valid-token").send({});
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/v1/workouts/:id", () => {
  const app = createServer();
  beforeEach(() => { vi.clearAllMocks(); setSingleResponse({ data: validSession, error: null }); });

  it("401 sin token", async () => {
    const res = await request(app).delete("/api/v1/workouts/" + VALID_UUID);
    expect(res.status).toBe(401);
  });

  it("404 si no existe", async () => {
    setSingleResponse({ data: null, error: { code: "PGRST116" } });
    const res = await request(app).delete("/api/v1/workouts/" + VALID_UUID).set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(404);
  });
});
