import { randomUUID } from "node:crypto";

import { afterAll, afterEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db";

describe("Court (integración con Postgres, base turnos_test)", () => {
  const createdIds: string[] = [];

  afterEach(async () => {
    // Los tests de integración limpian lo que crean.
    if (createdIds.length > 0) {
      await prisma.court.deleteMany({ where: { id: { in: createdIds } } });
      createdIds.length = 0;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("crea una pista y la vuelve a leer de la base de datos", async () => {
    const name = `Pista de prueba ${randomUUID()}`;

    const created = await prisma.court.create({ data: { name } });
    createdIds.push(created.id);

    const found = await prisma.court.findUnique({ where: { id: created.id } });

    expect(found).not.toBeNull();
    expect(found?.name).toBe(name);
    expect(found?.createdAt).toBeInstanceOf(Date);
  });

  it("no permite dos pistas con el mismo nombre", async () => {
    const name = `Pista duplicada ${randomUUID()}`;

    const first = await prisma.court.create({ data: { name } });
    createdIds.push(first.id);

    await expect(prisma.court.create({ data: { name } })).rejects.toThrow();
  });
});
