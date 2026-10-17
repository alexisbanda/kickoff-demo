import { randomUUID } from "node:crypto";

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { getAvailabilityForDay } from "@/lib/availability";
import { prisma } from "@/lib/db";

// Día futuro cualquiera (no depende de la fecha en la que corren los
// tests): basta con que esté lejos para no coincidir con "hoy" ni con datos
// de otros tests.
const FUTURE_DATE = "2099-06-20";
const FUTURE_DATE_AS_DATE = new Date("2099-06-20T00:00:00Z");

// "Ahora" del club muy anterior a FUTURE_DATE: ninguna franja de ese día
// puede ser "past".
const NOW = { date: "2099-06-01", minutes: 0 };

describe("getAvailabilityForDay (integración con Postgres, base turnos_test)", () => {
  const createdCourtIds: string[] = [];
  const createdBookingIds: string[] = [];
  const createdBlockIds: string[] = [];

  beforeAll(async () => {
    // Nos aseguramos de tener al menos las 6 pistas del club (el seed de
    // desarrollo no corre contra `turnos_test`); si ya existen, no se
    // duplican porque `name` es único.
    for (let i = 1; i <= 6; i++) {
      await prisma.court.upsert({
        where: { name: `Pista ${i}` },
        update: {},
        create: { name: `Pista ${i}` },
      });
    }
  });

  afterEach(async () => {
    if (createdBookingIds.length > 0) {
      await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
      createdBookingIds.length = 0;
    }
    if (createdBlockIds.length > 0) {
      await prisma.block.deleteMany({ where: { id: { in: createdBlockIds } } });
      createdBlockIds.length = 0;
    }
    if (createdCourtIds.length > 0) {
      await prisma.court.deleteMany({ where: { id: { in: createdCourtIds } } });
      createdCourtIds.length = 0;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("cuenta las pistas libres de cada franja, descontando una reserva activa y un bloqueo sembrados", async () => {
    // Dos pistas propias para este test, para no depender de cuántas pistas
    // tenga ya la base ni de datos de otros tests corriendo en paralelo.
    const courtA = await prisma.court.create({ data: { name: `Pista test A ${randomUUID()}` } });
    const courtB = await prisma.court.create({ data: { name: `Pista test B ${randomUUID()}` } });
    createdCourtIds.push(courtA.id, courtB.id);

    const booking = await prisma.booking.create({
      data: { courtId: courtA.id, date: FUTURE_DATE_AS_DATE, slot: "10:30", status: "ACTIVE" },
    });
    createdBookingIds.push(booking.id);

    const block = await prisma.block.create({
      data: { courtId: courtB.id, date: FUTURE_DATE_AS_DATE, slot: "10:30", reason: "Mantenimiento" },
    });
    createdBlockIds.push(block.id);

    const result = await getAvailabilityForDay({ date: FUTURE_DATE, now: NOW });

    expect(result).toHaveLength(9);

    const totalCourts = result[0].total;
    const slot1030 = result.find((slot) => slot.label === "10:30");
    const otherSlot = result.find((slot) => slot.label === "12:00");

    // La franja 10:30 tiene la pista A reservada y la pista B bloqueada:
    // dos pistas menos libres que en el resto de franjas.
    expect(slot1030?.free).toBe(totalCourts - 2);
    expect(otherSlot?.free).toBe(totalCourts);
  });

  it("una reserva cancelada no cuenta: la pista sigue libre en esa franja", async () => {
    const court = await prisma.court.create({ data: { name: `Pista test cancelada ${randomUUID()}` } });
    createdCourtIds.push(court.id);

    const booking = await prisma.booking.create({
      data: { courtId: court.id, date: FUTURE_DATE_AS_DATE, slot: "19:30", status: "CANCELLED" },
    });
    createdBookingIds.push(booking.id);

    const result = await getAvailabilityForDay({ date: FUTURE_DATE, now: NOW });
    const slot1930 = result.find((slot) => slot.label === "19:30");

    expect(slot1930?.free).toBe(slot1930?.total);
  });
});
