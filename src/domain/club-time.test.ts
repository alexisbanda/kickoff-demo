import { describe, expect, it } from "vitest";

import {
  addDaysToCalendarDate,
  diffInCalendarDays,
  formatClubDayMonth,
  formatClubWeekday,
  getClubDateString,
  getClubMinutesOfDay,
} from "@/domain/club-time";

describe("getClubDateString / getClubMinutesOfDay", () => {
  it("cerca de medianoche UTC, usa el día de calendario de Madrid (CET = UTC+1 en enero)", () => {
    // 2026-01-15T23:30:00Z son las 2026-01-16T00:30 en Madrid.
    const instant = new Date("2026-01-15T23:30:00Z");
    expect(getClubDateString(instant)).toBe("2026-01-16");
    expect(getClubMinutesOfDay(instant)).toBe(30);
  });

  it("a mediodía UTC en verano (CEST = UTC+2), el día de calendario coincide con el de UTC", () => {
    const instant = new Date("2026-07-01T12:00:00Z");
    expect(getClubDateString(instant)).toBe("2026-07-01");
    expect(getClubMinutesOfDay(instant)).toBe(14 * 60); // 14:00 local
  });

  it("cambio de hora de primavera (último domingo de marzo): salta de 01:59 a 03:00 CEST", () => {
    // El cambio ocurre a la 01:00 UTC. Justo antes, son las 01:59 CET; justo
    // después, las 03:00 CEST (no existe la 02:xx ese día).
    const beforeChange = new Date("2026-03-29T00:59:00Z");
    const afterChange = new Date("2026-03-29T01:00:00Z");

    expect(getClubDateString(beforeChange)).toBe("2026-03-29");
    expect(getClubMinutesOfDay(beforeChange)).toBe(1 * 60 + 59);

    expect(getClubDateString(afterChange)).toBe("2026-03-29");
    expect(getClubMinutesOfDay(afterChange)).toBe(3 * 60);
  });

  it("cambio de hora de otoño (último domingo de octubre): vuelve de 02:59 a 02:00 CET", () => {
    // El cambio ocurre a la 01:00 UTC. Justo antes, son las 02:59 CEST; justo
    // después, las 02:00 CET (esa hora local se repite).
    const beforeChange = new Date("2026-10-25T00:59:00Z");
    const afterChange = new Date("2026-10-25T01:00:00Z");

    expect(getClubDateString(beforeChange)).toBe("2026-10-25");
    expect(getClubMinutesOfDay(beforeChange)).toBe(2 * 60 + 59);

    expect(getClubDateString(afterChange)).toBe("2026-10-25");
    expect(getClubMinutesOfDay(afterChange)).toBe(2 * 60);
  });
});

describe("addDaysToCalendarDate", () => {
  it("suma días dentro del mismo mes", () => {
    expect(addDaysToCalendarDate("2026-10-10", 3)).toBe("2026-10-13");
  });

  it("suma días cruzando de mes", () => {
    expect(addDaysToCalendarDate("2026-10-30", 3)).toBe("2026-11-02");
  });

  it("suma días cruzando de año", () => {
    expect(addDaysToCalendarDate("2026-12-30", 3)).toBe("2027-01-02");
  });

  it("resta días con un número negativo", () => {
    expect(addDaysToCalendarDate("2026-10-10", -3)).toBe("2026-10-07");
  });

  it("suma 0 días deja la fecha igual", () => {
    expect(addDaysToCalendarDate("2026-10-10", 0)).toBe("2026-10-10");
  });
});

describe("diffInCalendarDays", () => {
  it("calcula la diferencia cuando `to` es posterior", () => {
    expect(diffInCalendarDays("2026-10-10", "2026-10-17")).toBe(7);
  });

  it("calcula la diferencia cuando `to` es anterior (negativa)", () => {
    expect(diffInCalendarDays("2026-10-17", "2026-10-10")).toBe(-7);
  });

  it("es 0 para la misma fecha", () => {
    expect(diffInCalendarDays("2026-10-10", "2026-10-10")).toBe(0);
  });

  it("funciona cruzando un cambio de hora (no afecta porque se calcula en UTC puro sobre el texto)", () => {
    expect(diffInCalendarDays("2026-03-28", "2026-03-30")).toBe(2);
  });
});

describe("formatClubWeekday / formatClubDayMonth", () => {
  it("formatea el día de la semana en español, en largo y corto", () => {
    expect(formatClubWeekday("2026-10-18")).toBe("domingo");
    expect(formatClubWeekday("2026-10-18", "short")).toBe("dom");
  });

  it("formatea el día y el mes en español, en largo y corto", () => {
    expect(formatClubDayMonth("2026-10-18")).toBe("18 de octubre");
    expect(formatClubDayMonth("2026-10-18", "short")).toBe("18 oct");
  });
});
