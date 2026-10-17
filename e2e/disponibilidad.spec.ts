import { expect, test } from "@playwright/test";

import {
  addDaysToCalendarDate,
  formatClubDayMonth,
  formatClubWeekday,
  getClubDateString,
} from "../src/domain/club-time";
import { prisma } from "./support/db";

// "Hoy" en hora del club, calculado al vuelo en vez de fijado a una fecha
// concreta: así los tests no dependen de la fecha en la que corren.
const CLUB_TODAY = getClubDateString(new Date());
const PLUS_1 = addDaysToCalendarDate(CLUB_TODAY, 1); // dentro de los 2 días de antelación de un no socio
const PLUS_5 = addDaysToCalendarDate(CLUB_TODAY, 5); // fuera de esa antelación
const PLUS_3 = addDaysToCalendarDate(CLUB_TODAY, 3); // primera fecha desde la que se podrá reservar PLUS_5

const COURT_NAMES = Array.from({ length: 6 }, (_, i) => `Pista ${i + 1}`);

let courtIds: string[] = [];
const createdBookingIds: string[] = [];
const createdBlockIds: string[] = [];

test.describe("Ver las pistas libres de un día", () => {
  test.beforeAll(async () => {
    // Las 6 pistas del club: se crean si faltan, sin duplicar (idempotente).
    const courts = await Promise.all(
      COURT_NAMES.map((name) =>
        prisma.court.upsert({ where: { name }, update: {}, create: { name } }),
      ),
    );
    courtIds = courts.map((court) => court.id);

    const [courtA, courtB] = courtIds;
    const dateAsDate = new Date(`${PLUS_1}T00:00:00Z`);

    const booking = await prisma.booking.create({
      data: { courtId: courtA, date: dateAsDate, slot: "10:30", status: "ACTIVE" },
    });
    createdBookingIds.push(booking.id);

    const block = await prisma.block.create({
      data: { courtId: courtB, date: dateAsDate, slot: "10:30", reason: "Mantenimiento (test e2e)" },
    });
    createdBlockIds.push(block.id);
  });

  test.afterAll(async () => {
    await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    await prisma.block.deleteMany({ where: { id: { in: createdBlockIds } } });
    await prisma.$disconnect();
  });

  test("al elegir un día se ven las 9 franjas, y una con reserva+bloqueo muestra los libres correctos", async ({
    page,
  }) => {
    await page.goto("/disponibilidad");
    await page.getByTestId(`day-${PLUS_1}`).click();
    await expect(page).toHaveURL(new RegExp(`dia=${PLUS_1}`));

    const slotLabels = [
      "09:00",
      "10:30",
      "12:00",
      "13:30",
      "15:00",
      "16:30",
      "18:00",
      "19:30",
      "21:00",
    ];
    for (const label of slotLabels) {
      await expect(page.getByTestId(`slot-${label}`)).toBeVisible();
    }

    const total = courtIds.length;
    await expect(page.getByTestId("slot-10:30")).toContainText(`${total - 2} libres`);
    await expect(page.getByTestId("slot-12:00")).toContainText(`${total} libres`);
  });

  test("en hoy+5 (fuera de la antelación de 2 días de un no socio) aparece el aviso con la fecha hoy+3", async ({
    page,
  }) => {
    await page.goto(`/disponibilidad?dia=${PLUS_5}`);

    const notice = page.getByTestId("booking-window-notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(formatClubWeekday(PLUS_3));
    await expect(notice).toContainText(formatClubDayMonth(PLUS_3));
  });

  test("en hoy+1 (dentro de la antelación de un no socio) no aparece el aviso", async ({ page }) => {
    await page.goto(`/disponibilidad?dia=${PLUS_1}`);

    await expect(page.getByTestId("booking-window-notice")).toHaveCount(0);
  });

  test("a 375px de ancho, la lista de franjas se lee sin scroll horizontal y con letra de al menos 18px", async ({
    page,
  }) => {
    await page.goto(`/disponibilidad?dia=${PLUS_1}`);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);

    const slot = page.getByTestId("slot-10:30");
    const fontSizePx = await slot.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSizePx).toBeGreaterThanOrEqual(18);
  });
});
