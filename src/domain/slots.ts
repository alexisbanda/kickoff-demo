/**
 * Franjas horarias del club.
 *
 * Función/dato puro sin dependencias de Next.js ni de Prisma (ver
 * docs/product/TECH.md). Cada franja dura 1 h 30; el club abre de 9:00 a
 * 22:30, todos los días, con 9 franjas (ver docs/product/BRIEF.md, pregunta
 * abierta ya decidida).
 */

export interface Slot {
  /** Minutos desde las 00:00 en los que empieza la franja. */
  start: number;
  /** Hora de inicio con el formato "HH:MM". */
  label: string;
}

function minutesToLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

const SLOT_DURATION_MINUTES = 90;
const FIRST_SLOT_START_MINUTES = 9 * 60; // 09:00
const SLOT_COUNT = 9;

/** Las 9 franjas de 1 h 30 del club, de 09:00 a 21:00 (la última acaba a las 22:30). */
export const SLOTS: readonly Slot[] = Array.from({ length: SLOT_COUNT }, (_, index) => {
  const start = FIRST_SLOT_START_MINUTES + index * SLOT_DURATION_MINUTES;
  return { start, label: minutesToLabel(start) };
});
