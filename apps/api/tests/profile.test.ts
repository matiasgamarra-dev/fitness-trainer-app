import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createServer } from "../src/server.js";

// ─── Mocks ───────────────────────────────────────────────────
// Vitest eleva vi.mock() al tope del archivo, así que las variables
// que usa el factory deben declararse dentro o con vi.hoisted().

// Mock de jose: simula verificación de JWT sin llamar a Supabase.
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

// Mock del cliente Supabase: usa vi.hoisted() para que las variables
// estén disponibles dentro del factory elevado.
const { mockUser, mockChain } = vi.hoisted(() => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    birth_date: null,
    sex: null,
    height_cm: null,
    goal: null,
    created_at: "2026-09-29T00:00:00Z",
    updated_at: "2026-09-29T00:00:00Z",
  };

  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
    update: vi.fn().mockReturnThis(),
  };

  return { mockUser, mockChain };
});

vi.mock("../src/config/supabase.js", () => ({
  supabaseAdmin: {
    from: vi.fn(() => mockChain),
  },
  supabasePublic: {},
}));

// ─── Tests ───────────────────────────────────────────────────

describe("GET /api/v1/profile", () => {
  const app = createServer();

  it("devuelve 401 sin Authorization header", async () => {
    const res = await request(app).get("/api/v1/profile");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("devuelve 401 con token inválido", async () => {
    const res = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("devuelve el perfil con token válido", async () => {
    const res = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: "test-user-id",
      email: "test@example.com",
    });
  });
});

describe("PUT /api/v1/profile", () => {
  const app = createServer();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 sin Authorization header", async () => {
    const res = await request(app)
      .put("/api/v1/profile")
      .send({ name: "Nuevo" });

    expect(res.status).toBe(401);
  });

  it("devuelve 400 con body vacío", async () => {
    const res = await request(app)
      .put("/api/v1/profile")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/empty/i);
  });

  it("devuelve 400 con body inválido (goal incorrecto)", async () => {
    const res = await request(app)
      .put("/api/v1/profile")
      .set("Authorization", "Bearer valid-token")
      .send({ goal: "invalid_goal" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/validation/i);
  });

  it("actualiza el perfil con body válido", async () => {
    const res = await request(app)
      .put("/api/v1/profile")
      .set("Authorization", "Bearer valid-token")
      .send({ name: "Nuevo Nombre", goal: "gain_muscle" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/updated/i);
  });
});