import { describe, expect, it } from "vitest";

import { SLOTS } from "@/domain/slots";

describe("SLOTS", () => {
  it("tiene exactamente 9 franjas", () => {
    expect(SLOTS).toHaveLength(9);
  });

  it("empieza a las 09:00 y acaba (de inicio) a las 21:00, cada 90 minutos", () => {
    expect(SLOTS.map((slot) => slot.label)).toEqual([
      "09:00",
      "10:30",
      "12:00",
      "13:30",
      "15:00",
      "16:30",
      "18:00",
      "19:30",
      "21:00",
    ]);
  });

  it("la última franja (21:00 + 1h30) acaba justo a la hora de cierre, las 22:30", () => {
    const last = SLOTS[SLOTS.length - 1];
    const closingMinutes = 22 * 60 + 30;
    expect(last.start + 90).toBe(closingMinutes);
  });

  it("cada franja empieza 90 minutos después de la anterior", () => {
    for (let i = 1; i < SLOTS.length; i++) {
      expect(SLOTS[i].start - SLOTS[i - 1].start).toBe(90);
    }
  });

  it("el campo `label` coincide con `start` en formato HH:MM", () => {
    for (const slot of SLOTS) {
      const [hours, minutes] = slot.label.split(":").map(Number);
      expect(hours * 60 + minutes).toBe(slot.start);
    }
  });
});
