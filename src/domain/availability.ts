/**
 * Disponibilidad de pistas por franja, para un día concreto.
 *
 * Función pura sin dependencias de Next.js ni de Prisma (ver
 * docs/product/TECH.md): no sabe nada de la base de datos, solo recibe los
 * datos ya cargados (reservas activas y bloqueos de ese día) y los combina
 * con las franjas del club (`src/domain/slots.ts`).
 */

import type { CalendarDate } from "@/domain/club-time";
import { SLOTS } from "@/domain/slots";

/** Una reserva activa de una pista en una franja de un día. */
export interface ActiveBooking {
  courtId: string;
  slot: string;
}

/** Un bloqueo de una pista en una franja de un día (mantenimiento, torneo...). */
export interface ActiveBlock {
  courtId: string;
  slot: string;
}

/** El "ahora" del club: su fecha de calendario y la hora local en minutos. */
export interface ClubNow {
  date: CalendarDate;
  minutes: number;
}

export interface ComputeAvailabilityParams {
  /** El día que se está consultando. */
  date: CalendarDate;
  /** El "ahora" del club (ver `src/domain/club-time.ts`). */
  now: ClubNow;
  /** Los ids de todas las pistas del club. */
  courtIds: readonly string[];
  /** Las reservas activas de `date` (cualquier pista, cualquier franja). */
  bookings: readonly ActiveBooking[];
  /** Los bloqueos de `date` (cualquier pista, cualquier franja). */
  blocks: readonly ActiveBlock[];
}

export interface SlotAvailability {
  /** Minutos desde las 00:00 en los que empieza la franja. */
  start: number;
  /** Hora de inicio con el formato "HH:MM". */
  label: string;
  /** Cuántas pistas quedan libres en esta franja. */
  free: number;
  /** El total de pistas del club. */
  total: number;
  /** Si la franja ya ha empezado (solo puede ser `true` si `date` es hoy). */
  past: boolean;
}

/**
 * Calcula, para cada una de las 9 franjas del día, cuántas pistas quedan
 * libres.
 *
 * Una pista reservada o bloqueada en una franja no cuenta como libre en esa
 * franja (si tiene ambas cosas a la vez, cuenta una sola vez), pero sí en el
 * resto. Una franja de hoy cuyo inicio ya pasó, en hora del club, se marca
 * como `past` y con `free = 0` (sin mirar reservas ni bloqueos): no tiene
 * sentido ofrecerla como libre aunque técnicamente ninguna pista tenga
 * reserva.
 */
export function computeAvailability({
  date,
  now,
  courtIds,
  bookings,
  blocks,
}: ComputeAvailabilityParams): SlotAvailability[] {
  const total = courtIds.length;
  const isToday = date === now.date;

  const bookedCourtIdsBySlot = groupCourtIdsBySlot(bookings);
  const blockedCourtIdsBySlot = groupCourtIdsBySlot(blocks);

  return SLOTS.map((slot) => {
    const past = isToday && slot.start < now.minutes;

    if (past) {
      return { start: slot.start, label: slot.label, free: 0, total, past: true };
    }

    const unavailable = new Set<string>([
      ...(bookedCourtIdsBySlot.get(slot.label) ?? []),
      ...(blockedCourtIdsBySlot.get(slot.label) ?? []),
    ]);
    const free = Math.max(0, total - unavailable.size);

    return { start: slot.start, label: slot.label, free, total, past: false };
  });
}

function groupCourtIdsBySlot(
  entries: readonly { courtId: string; slot: string }[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const entry of entries) {
    const courtIds = map.get(entry.slot);
    if (courtIds) {
      courtIds.push(entry.courtId);
    } else {
      map.set(entry.slot, [entry.courtId]);
    }
  }
  return map;
}
