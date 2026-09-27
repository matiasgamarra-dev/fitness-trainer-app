import { defineConfig } from "vitest/config";
import { config } from "dotenv";
import { resolve } from "node:path";

// Carga el .env de apps/api antes de correr los tests
config({ path: resolve(import.meta.dirname, ".env") });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/index.ts",
        "src/server.ts",
        "src/config/env.ts",
      ],
    },
  },
});