import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Mismas credenciales de `turnos_test` que usan los tests de integración de
// Vitest (ver vitest.config.ts): los e2e corren contra esa base, nunca
// contra la de desarrollo (`turnos`), y siembran y limpian sus propios datos.
const testEnv = dotenv.parse(fs.readFileSync(path.join(rootDir, ".env.test"), "utf-8"));

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Los tests siembran y limpian datos compartidos (pistas, reservas,
  // bloqueos) en `turnos_test` dentro del mismo archivo: los dejamos en
  // serie para que esa siembra no se pise entre tests o workers.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: { ...testEnv, PORT: String(PORT) },
  },
});
