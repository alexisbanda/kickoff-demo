import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Global setup de Vitest: aplica las migraciones de Prisma a la base de
 * datos de test (`turnos_test`, ver docker-compose.yml) antes de correr los
 * tests de integración. Usa las credenciales de `.env.test` (locales de
 * Docker, sin secretos reales).
 */
export default function setup() {
  const envPath = path.join(rootDir, ".env.test");
  const testEnv = dotenv.parse(fs.readFileSync(envPath, "utf-8"));

  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, ...testEnv },
  });
}
