import { describe, it, expect } from "vitest";
import request from "supertest";
import { createServer } from "../src/server.js";

describe("GET /api/v1/auth/me", () => {
  const app = createServer();

  it("devuelve 401 si no hay header Authorization", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: "Missing or invalid Authorization header",
    });
  });

  it("devuelve 401 si el header no empieza con 'Bearer '", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Basic abc123");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("devuelve 401 si el token es inválido", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer token-falso");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: "Unauthorized",
    });
  });
});