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

// Usamos vi.hoisted para exponer helpers de test
const { mockChain, setMockUser, setMockUpdateResponse } = vi.hoisted(() => {
  const state: {
    currentUser: Record<string, unknown> | null;
    updateResponse: { data: unknown; error: unknown };
  } = {
    currentUser: null,
    updateResponse: { data: null, error: null },
  };

  const defaultUser = {
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

  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: state.currentUser, error: null })),
    update: vi.fn().mockReturnThis(),
  };

  // El update hace select().single() después, así que necesitamos
  // que la respuesta del update esté disponible.
  // Como el chain es reusado, sobreescribimos single() cuando sea update.

  return {
    mockChain: chain,
    setMockUser: (user: Record<string, unknown> | null) => {
      state.currentUser = user;
    },
    setMockUpdateResponse: (resp: { data: unknown; error: unknown }) => {
      state.updateResponse = resp;
    },
    _getState: () => state,
    _getDefaultUser: () => defaultUser,
  };
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

  beforeEach(() => {
    vi.clearAllMocks();
    setMockUser({
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      birth_date: null,
      sex: null,
      height_cm: null,
      goal: null,
    });
  });

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
    setMockUser({
      id: "test-user-id",
      name: null,
      birth_date: null,
      sex: null,
      height_cm: null,
      goal: null,
    });

    const res = await request(app)
      .put("/api/v1/profile")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/empty/i);
  });

  it("devuelve 400 con body inválido (goal incorrecto)", async () => {
    setMockUser({
      id: "test-user-id",
      name: null,
      birth_date: null,
      sex: null,
      height_cm: null,
      goal: null,
    });

    const res = await request(app)
      .put("/api/v1/profile")
      .set("Authorization", "Bearer valid-token")
      .send({ goal: "invalid_goal" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/validation/i);
  });

  it("permite completar campos writeOnce si están en null", async () => {
    setMockUser({
      id: "test-user-id",
      name: "Test User",
      birth_date: null,
      sex: null,
      height_cm: null,
      goal: null,
    });

    const res = await request(app)
      .put("/api/v1/profile")
      .set("Authorization", "Bearer valid-token")
      .send({ goal: "gain_muscle", height_cm: 180 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("devuelve 403 si intenta cambiar un campo writeOnce ya seteado", async () => {
    setMockUser({
      id: "test-user-id",
      name: "Test User",
      birth_date: "1990-01-01",
      sex: "male",
      height_cm: 180,
      goal: "gain_muscle",
    });

    const res = await request(app)
      .put("/api/v1/profile")
      .set("Authorization", "Bearer valid-token")
      .send({ goal: "lose_fat" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/locked/i);
    expect(res.body.details.locked_fields).toContain("goal");
  });

  it("permite editar name aunque otros campos estén bloqueados", async () => {
    setMockUser({
      id: "test-user-id",
      name: "Test User",
      birth_date: "1990-01-01",
      sex: "male",
      height_cm: 180,
      goal: "gain_muscle",
    });

    const res = await request(app)
      .put("/api/v1/profile")
      .set("Authorization", "Bearer valid-token")
      .send({ name: "Nuevo Nombre" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});