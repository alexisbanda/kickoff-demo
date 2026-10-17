/**
 * Ventana de antelación para reservar una pista.
 *
 * Función pura sin dependencias de Next.js ni de Prisma (ver docs/product/TECH.md).
 *
 * Reglas del negocio (docs/product/BRIEF.md):
 * - Un socio puede reservar con hasta 7 días de antelación.
 * - Un no socio puede reservar con hasta 2 días de antelación.
 * - El día de hoy cuenta como día 0 (se puede reservar para hoy).
 * - No se puede reservar una fecha ya pasada.
 */

const MEMBER_ADVANCE_DAYS = 7;
const NON_MEMBER_ADVANCE_DAYS = 2;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Trunca una fecha a medianoche (hora local) para poder comparar solo días
 * completos, sin que la hora del día afecte al cálculo.
 */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Número de días de diferencia entre `from` y `to` (puede ser negativo si
 * `to` es anterior a `from`).
 */
function diffInDays(from: Date, to: Date): number {
  const fromDay = startOfDay(from);
  const toDay = startOfDay(to);
  return Math.round((toDay.getTime() - fromDay.getTime()) / MS_PER_DAY);
}

export interface BookingWindowCheck {
  /** Hoy (`diffInDays` se calcula a partir de esta fecha). */
  today: Date;
  /** La fecha para la que se quiere reservar. */
  bookingDate: Date;
  /** Si quien reserva es socio del club. */
  isMember: boolean;
}

/**
 * Dice si `bookingDate` está dentro de la antelación permitida para reservar,
 * contando desde `today` (día 0).
 */
export function isWithinBookingWindow({
  today,
  bookingDate,
  isMember,
}: BookingWindowCheck): boolean {
  const daysAhead = diffInDays(today, bookingDate);

  // Fechas pasadas nunca son reservables.
  if (daysAhead < 0) {
    return false;
  }

  const maxAdvanceDays = isMember ? MEMBER_ADVANCE_DAYS : NON_MEMBER_ADVANCE_DAYS;
  return daysAhead <= maxAdvanceDays;
}
