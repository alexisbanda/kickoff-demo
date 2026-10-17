import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Cliente Prisma único y compartido (patrón singleton).
//
// En desarrollo, Next.js recarga los módulos de servidor en caliente, lo que
// crearía un PrismaClient (y un pool de conexiones) nuevo en cada recarga si
// no lo guardáramos en `globalThis`. En producción no hay recarga, así que
// basta con una instancia por proceso.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
