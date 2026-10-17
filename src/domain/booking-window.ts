/**
 * Ventana de antelación para reservar una pista.
 *
 * Función pura sin dependencias de Next.js ni de Prisma (ver docs/product/TECH.md).
 *
 * Trabaja sobre fechas de calendario del club ("AAAA-MM-DD", ver
 * `src/domain/club-time.ts`) en vez de `Date` locales, para no depender de la
 * zona horaria del servidor.
 *
 * Reglas del negocio (docs/product/BRIEF.md):
 * - Un socio puede reservar con hasta 7 días de antelación.
 * - Un no socio puede reservar con hasta 2 días de antelación.
 * - El día de hoy cuenta como día 0 (se puede reservar para hoy).
 * - No se puede reservar una fecha ya pasada.
 */

import { addDaysToCalendarDate, type CalendarDate, diffInCalendarDays } from "@/domain/club-time";

const MEMBER_ADVANCE_DAYS = 7;
const NON_MEMBER_ADVANCE_DAYS = 2;

export interface BookingWindowCheck {
  /** Fecha de hoy, en calendario del club ("AAAA-MM-DD"). */
  today: CalendarDate;
  /** La fecha para la que se quiere reservar ("AAAA-MM-DD"). */
  bookingDate: CalendarDate;
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
  const daysAhead = diffInCalendarDays(today, bookingDate);

  // Fechas pasadas nunca son reservables.
  if (daysAhead < 0) {
    return false;
  }

  const maxAdvanceDays = isMember ? MEMBER_ADVANCE_DAYS : NON_MEMBER_ADVANCE_DAYS;
  return daysAhead <= maxAdvanceDays;
}

/**
 * Para un no socio, la primera fecha de calendario desde la que podrá
 * reservar `targetDate` (es decir, `targetDate` menos los días de antelación
 * de un no socio).
 */
export function firstDateNonMemberCanBook(targetDate: CalendarDate): CalendarDate {
  return addDaysToCalendarDate(targetDate, -NON_MEMBER_ADVANCE_DAYS);
}
