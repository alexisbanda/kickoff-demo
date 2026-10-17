import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Las variables de `.env.test` (base de datos `turnos_test` de Docker
// Compose) se inyectan en el entorno de cada test, para que tanto el
// globalSetup como `src/lib/db.ts` apunten a la base de pruebas.
const testEnv = dotenv.parse(fs.readFileSync(path.join(rootDir, ".env.test"), "utf-8"));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  test: {
    globalSetup: "./vitest.global-setup.ts",
    env: testEnv,
  },
});
