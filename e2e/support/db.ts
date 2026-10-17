/**
 * Cliente de Prisma para los e2e, que corren fuera del proceso de Next.js
 * (ver playwright.config.ts): se conecta directamente a `turnos_test` con
 * las credenciales de `.env.test`, las mismas que usa `webServer` para
 * arrancar la app y que usan los tests de integración de Vitest.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

import { PrismaClient } from "../../src/generated/prisma/client";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const testEnv = dotenv.parse(fs.readFileSync(path.join(rootDir, ".env.test"), "utf-8"));

const connectionString = process.env.DATABASE_URL ?? testEnv.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
