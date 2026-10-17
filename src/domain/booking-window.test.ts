import { describe, expect, it } from "vitest";

import { isWithinBookingWindow } from "@/domain/booking-window";

// Usamos siempre un `today` fijo a mediodía para comprobar que la hora del
// día no afecta al cálculo (solo importa el día de calendario).
const TODAY = new Date(2026, 2, 10, 12, 0, 0); // 10 de marzo de 2026

function daysFromToday(days: number): Date {
  return new Date(2026, 2, 10 + days);
}

describe("isWithinBookingWindow", () => {
  it("permite reservar hoy mismo (día 0) para un socio", () => {
    expect(
      isWithinBookingWindow({ today: TODAY, bookingDate: daysFromToday(0), isMember: true }),
    ).toBe(true);
  });

  it("permite reservar hoy mismo (día 0) para un no socio", () => {
    expect(
      isWithinBookingWindow({ today: TODAY, bookingDate: daysFromToday(0), isMember: false }),
    ).toBe(true);
  });

  it("un socio puede reservar exactamente 7 días antes", () => {
    expect(
      isWithinBookingWindow({ today: TODAY, bookingDate: daysFromToday(7), isMember: true }),
    ).toBe(true);
  });

  it("un socio no puede reservar con 8 días de antelación", () => {
    expect(
      isWithinBookingWindow({ today: TODAY, bookingDate: daysFromToday(8), isMember: true }),
    ).toBe(false);
  });

  it("un no socio puede reservar exactamente 2 días antes", () => {
    expect(
      isWithinBookingWindow({ today: TODAY, bookingDate: daysFromToday(2), isMember: false }),
    ).toBe(true);
  });

  it("un no socio no puede reservar con 3 días de antelación", () => {
    expect(
      isWithinBookingWindow({ today: TODAY, bookingDate: daysFromToday(3), isMember: false }),
    ).toBe(false);
  });

  it("no se puede reservar una fecha pasada (ayer), ni siquiera un socio", () => {
    expect(
      isWithinBookingWindow({ today: TODAY, bookingDate: daysFromToday(-1), isMember: true }),
    ).toBe(false);
  });

  it("no se puede reservar una fecha pasada lejana para un no socio", () => {
    expect(
      isWithinBookingWindow({ today: TODAY, bookingDate: daysFromToday(-10), isMember: false }),
    ).toBe(false);
  });

  it("ignora la hora del día al comparar: reservar hoy por la noche sigue siendo día 0", () => {
    const todayAtDawn = new Date(2026, 2, 10, 0, 1, 0);
    const bookingLateAtNight = new Date(2026, 2, 10, 23, 59, 0);
    expect(
      isWithinBookingWindow({
        today: todayAtDawn,
        bookingDate: bookingLateAtNight,
        isMember: false,
      }),
    ).toBe(true);
  });
});
