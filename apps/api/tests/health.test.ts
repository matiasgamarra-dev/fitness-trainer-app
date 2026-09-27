import { describe, it, expect } from "vitest";
import request from "supertest";
import { createServer } from "../src/server.js";

describe("GET /api/v1/health", () => {
  const app = createServer();

  it("responde con status 200 y success:true", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: "ok",
      },
    });
    expect(response.body.data.timestamp).toBeDefined();
  });

  it("incluye un timestamp ISO válido", async () => {
    const response = await request(app).get("/api/v1/health");

    const { timestamp } = response.body.data;
    const date = new Date(timestamp);
    expect(date.toString()).not.toBe("Invalid Date");
  });
});