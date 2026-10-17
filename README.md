# Turnos — reservas de pistas del Club Deportivo La Ribera

Aplicación Next.js para reservar las 6 pistas de pádel del club desde el móvil. Ver el contexto de producto y técnico en [`docs/product/`](docs/product/) (`BRIEF.md` y `TECH.md`).

## Requisitos

- [Node.js 22](https://nodejs.org/) (ver [`.nvmrc`](.nvmrc))
- [Docker](https://www.docker.com/) y Docker Compose, para levantar Postgres en local

## Arranque en local

```bash
cp .env.example .env
docker compose up -d       # levanta Postgres 16 (bases `turnos` y `turnos_test`)
npm install
npm run db:migrate         # aplica las migraciones de Prisma a la base `turnos`
npm run db:seed            # crea las 6 pistas (idempotente)
npm run dev                # http://localhost:3000
```

## Cómo se prueba

```bash
npm test          # Vitest: tests unitarios (src/domain/) y de integración contra Postgres (turnos_test)
npm run test:e2e   # Playwright: e2e en un móvil de 375px, contra la app en el puerto 3100 (base turnos_test)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

Los tests de integración necesitan Postgres arriba (`docker compose up -d`); aplican las migraciones a la base `turnos_test` automáticamente antes de correr, usando las credenciales locales de [`.env.test`](.env.test).

Los e2e (`npm run test:e2e`) levantan la app con `next build && next start` en el puerto 3100 contra `turnos_test` y siembran y limpian sus propios datos; necesitan Chromium instalado una vez con `npx playwright install chromium`.

## Scripts disponibles

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Arranca la app en modo desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Comprueba los tipos de TypeScript |
| `npm test` | Tests con Vitest (unitarios + integración) |
| `npm run test:e2e` | Tests e2e con Playwright (375 px, puerto 3100) |
| `npm run db:migrate` | Aplica las migraciones de Prisma (`prisma migrate dev`) |
| `npm run db:seed` | Crea/actualiza las 6 pistas del club |
