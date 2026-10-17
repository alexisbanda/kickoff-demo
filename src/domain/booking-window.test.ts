import { describe, expect, it } from "vitest";

import { firstDateNonMemberCanBook, isWithinBookingWindow } from "@/domain/booking-window";

const TODAY = "2026-03-10";

function daysFromToday(days: number): string {
  const date = new Date(Date.UTC(2026, 2, 10));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
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
});

describe("firstDateNonMemberCanBook", () => {
  it("es la fecha objetivo menos 2 días", () => {
    expect(firstDateNonMemberCanBook("2026-10-20")).toBe("2026-10-18");
  });

  it("cruza de mes correctamente", () => {
    expect(firstDateNonMemberCanBook("2026-11-01")).toBe("2026-10-30");
  });

  it("es consistente con isWithinBookingWindow: justo en esa fecha, un no socio ya puede reservar el día objetivo", () => {
    const target = "2026-10-20";
    const firstDate = firstDateNonMemberCanBook(target);
    expect(
      isWithinBookingWindow({ today: firstDate, bookingDate: target, isMember: false }),
    ).toBe(true);
  });

  it("es consistente con isWithinBookingWindow: un día antes de esa fecha, un no socio todavía no puede reservar el día objetivo", () => {
    const target = "2026-10-20";
    const firstDate = firstDateNonMemberCanBook(target);
    const dayBefore = new Date(`${firstDate}T00:00:00Z`);
    dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
    const dayBeforeStr = dayBefore.toISOString().slice(0, 10);
    expect(
      isWithinBookingWindow({ today: dayBeforeStr, bookingDate: target, isMember: false }),
    ).toBe(false);
  });
});
