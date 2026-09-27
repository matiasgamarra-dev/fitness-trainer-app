import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  // 1. Ignorar carpetas y archivos que no queremos lintear
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "package-lock.json",
      "scripts/**", // Scripts de docs usan CommonJS a propósito
      "src/**", // Legacy: entry point viejo, se elimina en Sprint 1
    ],
  },

  // 2. Reglas base de JS recomendadas
  js.configs.recommended,

  // 3. Config recomendada de TypeScript ESLint
  ...tseslint.configs.recommended,

  // 4. Configuración global del proyecto
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // Reglas custom del proyecto
      "no-console": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
    },
  },

  // 5. Desactivar reglas de ESLint que chocan con Prettier
  prettierConfig,
);
