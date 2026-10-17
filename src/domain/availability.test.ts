import { describe, expect, it } from "vitest";

import { computeAvailability } from "@/domain/availability";
import { SLOTS } from "@/domain/slots";

const COURT_IDS = ["c1", "c2", "c3", "c4", "c5", "c6"];
const DATE = "2026-10-24"; // un sábado futuro cualquiera, no es "hoy" en estos tests
const FAR_FUTURE_NOW = { date: "2026-10-01", minutes: 0 }; // "hoy" muy anterior a DATE: nada es "past"

describe("computeAvailability", () => {
  it("sin reservas ni bloqueos, las 9 franjas tienen las 6 pistas libres", () => {
    const result = computeAvailability({
      date: DATE,
      now: FAR_FUTURE_NOW,
      courtIds: COURT_IDS,
      bookings: [],
      blocks: [],
    });

    expect(result).toHaveLength(9);
    for (const slot of result) {
      expect(slot.free).toBe(6);
      expect(slot.total).toBe(6);
      expect(slot.past).toBe(false);
    }
  });

  it("una pista reservada en una franja no cuenta como libre en esa franja, pero sí en las demás", () => {
    const result = computeAvailability({
      date: DATE,
      now: FAR_FUTURE_NOW,
      courtIds: COURT_IDS,
      bookings: [{ courtId: "c1", slot: "10:30" }],
      blocks: [],
    });

    const slot1030 = result.find((s) => s.label === "10:30");
    const otherSlot = result.find((s) => s.label === "12:00");
    expect(slot1030?.free).toBe(5);
    expect(otherSlot?.free).toBe(6);
  });

  it("una pista bloqueada en una franja no cuenta como libre en esa franja, pero sí en las demás", () => {
    const result = computeAvailability({
      date: DATE,
      now: FAR_FUTURE_NOW,
      courtIds: COURT_IDS,
      bookings: [],
      blocks: [{ courtId: "c2", slot: "10:30" }],
    });

    const slot1030 = result.find((s) => s.label === "10:30");
    const otherSlot = result.find((s) => s.label === "12:00");
    expect(slot1030?.free).toBe(5);
    expect(otherSlot?.free).toBe(6);
  });

  it("una pista con reserva y bloqueo a la vez en la misma franja cuenta una sola vez", () => {
    const result = computeAvailability({
      date: DATE,
      now: FAR_FUTURE_NOW,
      courtIds: COURT_IDS,
      bookings: [{ courtId: "c1", slot: "10:30" }],
      blocks: [{ courtId: "c1", slot: "10:30" }],
    });

    const slot1030 = result.find((s) => s.label === "10:30");
    expect(slot1030?.free).toBe(5);
  });

  it("varias pistas distintas reservadas o bloqueadas en la misma franja se restan todas", () => {
    const result = computeAvailability({
      date: DATE,
      now: FAR_FUTURE_NOW,
      courtIds: COURT_IDS,
      bookings: [
        { courtId: "c1", slot: "18:00" },
        { courtId: "c2", slot: "18:00" },
      ],
      blocks: [{ courtId: "c3", slot: "18:00" }],
    });

    const slot1800 = result.find((s) => s.label === "18:00");
    expect(slot1800?.free).toBe(3);
  });

  it("una franja de hoy cuyo inicio ya pasó aparece como `past` con 0 libres, aunque no tenga reservas", () => {
    const now = { date: DATE, minutes: SLOTS[2].start + 1 }; // justo después de que empiece la 3a franja (12:00)
    const result = computeAvailability({
      date: DATE,
      now,
      courtIds: COURT_IDS,
      bookings: [],
      blocks: [],
    });

    expect(result[0].past).toBe(true); // 09:00
    expect(result[0].free).toBe(0);
    expect(result[1].past).toBe(true); // 10:30
    expect(result[1].free).toBe(0);
    expect(result[2].past).toBe(true); // 12:00, justo empezada
    expect(result[2].free).toBe(0);
    expect(result[3].past).toBe(false); // 13:30, todavía no ha empezado
    expect(result[3].free).toBe(6);
  });

  it("una franja de hoy que empieza justo ahora (start === now.minutes) todavía no se considera pasada", () => {
    const now = { date: DATE, minutes: SLOTS[2].start };
    const result = computeAvailability({
      date: DATE,
      now,
      courtIds: COURT_IDS,
      bookings: [],
      blocks: [],
    });

    expect(result[2].past).toBe(false);
    expect(result[2].free).toBe(6);
  });

  it("si `date` no es hoy, ninguna franja es `past`, aunque `now.minutes` sea muy alto", () => {
    const now = { date: "2026-10-01", minutes: 23 * 60 };
    const result = computeAvailability({
      date: DATE,
      now,
      courtIds: COURT_IDS,
      bookings: [],
      blocks: [],
    });

    for (const slot of result) {
      expect(slot.past).toBe(false);
    }
  });

  it("si `date` es un día futuro respecto a `now.date`, tampoco es `past` ninguna franja", () => {
    const now = { date: "2026-10-20", minutes: 23 * 60 };
    const result = computeAvailability({
      date: DATE,
      now,
      courtIds: COURT_IDS,
      bookings: [],
      blocks: [],
    });

    for (const slot of result) {
      expect(slot.past).toBe(false);
    }
  });
});
