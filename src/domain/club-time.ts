/**
 * Hora del club.
 *
 * Función pura sin dependencias de Next.js ni de Prisma (ver docs/product/TECH.md).
 *
 * El servidor puede correr en cualquier zona horaria, pero el club está en
 * Madrid: la fecha de calendario y la hora del día que ve un jugador siempre
 * se calculan en `Europe/Madrid`, usando `Intl.DateTimeFormat` (sin librerías
 * de fechas). Las fechas de calendario se representan como texto "AAAA-MM-DD"
 * para poder sumarlas o compararlas sin depender de la zona horaria del
 * proceso que ejecuta el código (ver `addDaysToCalendarDate` y
 * `diffInCalendarDays`, que trabajan en UTC puro sobre ese texto).
 */

export const CLUB_TIME_ZONE = "Europe/Madrid";

/** Fecha de calendario del club, como texto "AAAA-MM-DD". */
export type CalendarDate = string;

const CALENDAR_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLUB_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const TIME_OF_DAY_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: CLUB_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAY_FORMATTERS: Record<"long" | "short", Intl.DateTimeFormat> = {
  long: new Intl.DateTimeFormat("es-ES", { timeZone: CLUB_TIME_ZONE, weekday: "long" }),
  short: new Intl.DateTimeFormat("es-ES", { timeZone: CLUB_TIME_ZONE, weekday: "short" }),
};

const DAY_MONTH_FORMATTERS: Record<"long" | "short", Intl.DateTimeFormat> = {
  long: new Intl.DateTimeFormat("es-ES", {
    timeZone: CLUB_TIME_ZONE,
    day: "numeric",
    month: "long",
  }),
  short: new Intl.DateTimeFormat("es-ES", {
    timeZone: CLUB_TIME_ZONE,
    day: "numeric",
    month: "short",
  }),
};

/**
 * Fecha de calendario del club ("AAAA-MM-DD") en el instante dado, en
 * `Europe/Madrid`. Cerca de medianoche UTC, el día del club puede ser
 * distinto del día UTC.
 */
export function getClubDateString(instant: Date): CalendarDate {
  return CALENDAR_DATE_FORMATTER.format(instant);
}

/**
 * Minutos transcurridos desde las 00:00 en la hora local del club
 * (`Europe/Madrid`) en el instante dado. Tiene en cuenta el cambio de hora
 * (CET/CEST) porque delega en `Intl.DateTimeFormat` con esa zona.
 */
export function getClubMinutesOfDay(instant: Date): number {
  const parts = TIME_OF_DAY_FORMATTER.formatToParts(instant);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  return hour * 60 + minute;
}

/**
 * Construye un instante UTC a mediodía para una fecha de calendario, para
 * poder formatearla (día de la semana, día y mes) sin que el cambio de hora
 * ni la zona del proceso puedan desplazarla a otro día de calendario: a
 * mediodía UTC, la hora local en `Europe/Madrid` (siempre por delante de UTC)
 * sigue siendo la tarde del mismo día.
 */
function calendarDateToSafeInstant(date: CalendarDate): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/** Suma (o resta, si `days` es negativo) días de calendario a una fecha. */
export function addDaysToCalendarDate(date: CalendarDate, days: number): CalendarDate {
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

/** Días de diferencia entre dos fechas de calendario (negativo si `to` es anterior a `from`). */
export function diffInCalendarDays(from: CalendarDate, to: CalendarDate): number {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((toUtc - fromUtc) / (24 * 60 * 60 * 1000));
}

/** Nombre del día de la semana en español ("sábado" o, en corto, "sáb"). */
export function formatClubWeekday(date: CalendarDate, style: "long" | "short" = "long"): string {
  return WEEKDAY_FORMATTERS[style].format(calendarDateToSafeInstant(date));
}

/** Día y mes en español ("18 de octubre" o, en corto, "18 oct"). */
export function formatClubDayMonth(date: CalendarDate, style: "long" | "short" = "long"): string {
  return DAY_MONTH_FORMATTERS[style].format(calendarDateToSafeInstant(date));
}
