import { prisma } from "../src/lib/db";

const COURT_NAMES = Array.from({ length: 6 }, (_, i) => `Pista ${i + 1}`);

async function main() {
  for (const name of COURT_NAMES) {
    await prisma.court.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Seed completo: ${COURT_NAMES.length} pistas (${COURT_NAMES.join(", ")}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
