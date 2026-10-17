import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { firstDateNonMemberCanBook, isWithinBookingWindow } from "@/domain/booking-window";
import {
  addDaysToCalendarDate,
  formatClubDayMonth,
  formatClubWeekday,
  getClubDateString,
  getClubMinutesOfDay,
} from "@/domain/club-time";
import type { SlotAvailability } from "@/domain/availability";
import { getAvailabilityForDay } from "@/lib/availability";

export const metadata: Metadata = {
  title: "Pistas libres — Turnos",
  description: "Cuántas pistas de pádel quedan libres en cada franja, día a día.",
};

// Cuántos días (además de hoy) se pueden elegir: hoy + los 7 siguientes.
const DAYS_AHEAD_SHOWN = 7;

/**
 * Quien mira esta pantalla nunca se ha identificado (no hay login en este
 * ticket, ver #4): se le trata siempre como no socio, con 2 días de
 * antelación.
 */
const VIEWER_IS_MEMBER = false;

function isValidCalendarDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

/**
 * Resuelve el día pedido por `?dia=`: si falta, está mal formado o cae fuera
 * de hoy..hoy+7, se usa hoy (en hora del club).
 */
function resolveSelectedDate(requested: string | undefined, today: string): string {
  if (!requested || !isValidCalendarDate(requested)) {
    return today;
  }

  const maxDate = addDaysToCalendarDate(today, DAYS_AHEAD_SHOWN);
  if (requested < today || requested > maxDate) {
    return today;
  }

  return requested;
}

export default function DisponibilidadPage({ searchParams }: PageProps<"/disponibilidad">) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-6 dark:bg-black sm:px-6">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Pistas libres</h1>
          <Link
            href="/"
            className="text-lg font-medium text-zinc-600 underline underline-offset-4 dark:text-zinc-300"
          >
            Volver
          </Link>
        </div>
        <Suspense fallback={<p className="text-xl text-zinc-600 dark:text-zinc-300">Cargando…</p>}>
          <Disponibilidad searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function Disponibilidad({
  searchParams,
}: Pick<PageProps<"/disponibilidad">, "searchParams">) {
  const params = await searchParams;
  const diaParam = params.dia;
  const requested = typeof diaParam === "string" ? diaParam : undefined;

  // `new Date()` cambia en cada petición: con Cache Components, hay que
  // marcar explícitamente que esta parte renderiza en el momento de la
  // petición (no se puede prerenderizar), ver
  // node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md.
  await connection();
  const now = new Date();
  const clubToday = getClubDateString(now);
  const clubNowMinutes = getClubMinutesOfDay(now);
  const selectedDate = resolveSelectedDate(requested, clubToday);

  const days = Array.from({ length: DAYS_AHEAD_SHOWN + 1 }, (_, index) =>
    addDaysToCalendarDate(clubToday, index),
  );

  const [slots, canBookSelectedDate] = await Promise.all([
    getAvailabilityForDay({ date: selectedDate, now: { date: clubToday, minutes: clubNowMinutes } }),
    Promise.resolve(
      isWithinBookingWindow({
        today: clubToday,
        bookingDate: selectedDate,
        isMember: VIEWER_IS_MEMBER,
      }),
    ),
  ]);

  return (
    <>
      <DaySelector days={days} selectedDate={selectedDate} />
      {!canBookSelectedDate && <BookingWindowNotice targetDate={selectedDate} />}
      <SlotList slots={slots} />
    </>
  );
}

function DaySelector({ days, selectedDate }: { days: string[]; selectedDate: string }) {
  return (
    // Rejilla de 4 columnas x 2 filas (hoy + 7 días = 8) en vez de una fila
    // con scroll horizontal: a 375px de ancho, los 8 días tienen que verse
    // sin desplazamiento (ver criterio de aceptación de 375px).
    <nav aria-label="Elegir día" data-testid="day-selector" className="grid grid-cols-4 gap-2">
      {days.map((day) => {
        const isSelected = day === selectedDate;
        return (
          <Link
            key={day}
            href={`/disponibilidad?dia=${day}`}
            aria-current={isSelected ? "date" : undefined}
            data-testid={`day-${day}`}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-1 py-2 text-center ${
              isSelected
                ? "border-blue-700 bg-blue-700 text-white"
                : "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            }`}
          >
            <span className="text-lg leading-tight font-semibold capitalize">
              {formatClubWeekday(day, "short")}
            </span>
            <span className="text-lg leading-tight">{formatClubDayMonth(day, "short")}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function BookingWindowNotice({ targetDate }: { targetDate: string }) {
  const firstBookableDate = firstDateNonMemberCanBook(targetDate);
  const weekday = formatClubWeekday(firstBookableDate);
  const dayMonth = formatClubDayMonth(firstBookableDate);

  return (
    <p
      data-testid="booking-window-notice"
      role="status"
      className="rounded-lg border-2 border-amber-600 bg-amber-50 px-4 py-3 text-lg font-medium text-amber-900 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-100"
    >
      Podrás reservar este día a partir del {weekday} {dayMonth}.
    </p>
  );
}

function SlotList({ slots }: { slots: SlotAvailability[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {slots.map((slot) => (
        <li
          key={slot.label}
          data-testid={`slot-${slot.label}`}
          className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 ${
            slot.past
              ? "border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
              : slot.free === 0
                ? "border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100"
                : "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100"
          }`}
        >
          <span className="text-xl font-semibold">{slot.label}</span>
          <span className="text-xl font-medium">{describeSlot(slot)}</span>
        </li>
      ))}
    </ul>
  );
}

function describeSlot(slot: SlotAvailability): string {
  if (slot.past) {
    return "Pasada";
  }
  if (slot.free === 0) {
    return "Completa";
  }
  return `${slot.free} libres`;
}
