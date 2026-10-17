/**
 * Disponibilidad de pistas por franja, leída de la base de datos.
 *
 * Capa fina sobre Prisma: lee las pistas del club, las reservas activas y
 * los bloqueos del día pedido, y delega el cálculo en la función pura
 * `computeAvailability` de `src/domain/availability.ts` (ver
 * docs/product/TECH.md: la lógica de dominio vive en `src/domain/`).
 */

import { computeAvailability, type ClubNow, type SlotAvailability } from "@/domain/availability";
import type { CalendarDate } from "@/domain/club-time";
import { prisma } from "@/lib/db";

export interface GetAvailabilityForDayParams {
  /** El día que se quiere consultar (fecha de calendario del club). */
  date: CalendarDate;
  /** El "ahora" del club. */
  now: ClubNow;
}

/**
 * Para `date`, cuántas pistas quedan libres en cada una de las 9 franjas.
 *
 * `date` se interpreta como fecha de calendario (sin hora): se construye un
 * `Date` a medianoche UTC para que coincida con cómo Prisma/Postgres guardan
 * una columna `@db.Date` (sin zona horaria), evitando que la zona del
 * proceso del servidor desplace el día buscado.
 */
export async function getAvailabilityForDay({
  date,
  now,
}: GetAvailabilityForDayParams): Promise<SlotAvailability[]> {
  const dayStart = calendarDateToUtcMidnight(date);

  const [courts, bookings, blocks] = await Promise.all([
    prisma.court.findMany({ select: { id: true } }),
    prisma.booking.findMany({
      where: { date: dayStart, status: "ACTIVE" },
      select: { courtId: true, slot: true },
    }),
    prisma.block.findMany({
      where: { date: dayStart },
      select: { courtId: true, slot: true },
    }),
  ]);

  return computeAvailability({
    date,
    now,
    courtIds: courts.map((court) => court.id),
    bookings,
    blocks,
  });
}

function calendarDateToUtcMidnight(date: CalendarDate): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
