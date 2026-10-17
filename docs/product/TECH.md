# Brief técnico: Turnos

> **Lo escribe el tech lead.** Ticket Studio solo deja esta plantilla y, en «Decisiones pendientes», las preguntas técnicas que salen del brief de producto. No propone stack ni arquitectura. El ticket 0 de cimientos depende de este documento. Los encabezados `##` son fijos: `brief_check.py` los comprueba.

## Stack

- **Next.js** (App Router) con **TypeScript** en modo estricto, en Node 22 LTS. Una sola aplicación: páginas renderizadas en servidor y Server Actions o route handlers para escribir.
- **PostgreSQL 16**, con **Prisma** como ORM y para las migraciones.
- Estilos con **Tailwind CSS**: letra grande y legible en el móvil sin zoom (requisito del brief).
- Gestor de paquetes: **npm** (con `package-lock.json` versionado).

## Arquitectura

- Una aplicación Next.js monolítica: interfaz, lógica de dominio y acceso a datos en el mismo repositorio.
- La lógica de dominio (antelación, precios, cancelación, lista de espera) vive en `src/domain/` como funciones puras sin dependencias de Next.js, para probarla con tests unitarios.
- Las fechas y horas del dominio (antelación, franjas, disponibilidad) se calculan en hora del club (`Europe/Madrid`), no en la del servidor: `src/domain/club-time.ts` da la fecha de calendario y los minutos del día a partir de un instante, con `Intl.DateTimeFormat` (sin librerías de fechas), y tiene en cuenta el cambio de hora.
- El acceso a datos pasa por Prisma (`src/lib/db.ts`, un único cliente compartido).
- Sin servicios aparte mientras no haga falta: correo y pagos se integran como módulos en `src/lib/` cuando lleguen sus épicas.

## Datos

- Modelo a grandes rasgos: Pista, Reserva (pista + día + franja + jugador), Jugador, Socio (de la lista del club), Bloqueo, Lista de espera, Ausencia. Se define en `prisma/schema.prisma` épica a épica; el ticket 0 solo deja Prisma configurado y una primera migración vacía o mínima.
- **Reservas dobles:** una restricción única en base de datos sobre (pista, día, franja) para reservas activas; la aplicación no se fía solo de comprobar antes de insertar.
- Datos personales (nombre, correo, lista de socios, ausencias): ver decisiones pendientes.

## Integraciones externas

Ninguna en el ticket 0. Pagos y correo quedan como decisiones pendientes de sus épicas.

## Cómo se prueba

- **Tests unitarios y de integración con Vitest:** `npm test`. Los de integración usan una base de Postgres de prueba (`DATABASE_URL` de `.env.test`) a la que se aplican las migraciones antes de correr.
- **Lint y tipos:** `npm run lint` y `npm run typecheck`.
- **E2E con Playwright:** `npm run test:e2e`, en un proyecto móvil de 375 px de ancho (Chromium). Levanta la app con `next build && next start` en el puerto 3100, contra la base `turnos_test`; cada archivo de `e2e/` siembra y limpia sus propios datos.
- Datos de prueba: un seed (`npm run db:seed`) con las 6 pistas y algunos socios ficticios.

## Entornos y despliegue

- **Desarrollo local:** `docker compose up -d` levanta Postgres; `npm run dev` arranca la aplicación en `http://localhost:3000`. Variables en `.env` a partir de `.env.example`.
- **CI:** GitHub Actions en cada PR: instalar, lint, typecheck, migraciones contra un servicio de Postgres y `npm test`.
- **Producción y entorno de pruebas:** por decidir (ver decisiones pendientes); no bloquea el ticket 0.

## Decisiones pendientes

- [ ] Hay pagos y devoluciones (cancelación con más de 24 h): ¿qué proveedor? Turnos no debe guardar tarjetas.
- [ ] Hay cuentas de jugador: ¿cómo se identifican al entrar (correo, otro método)? El brief pide pocos pasos para gente mayor.
- [ ] Hay datos personales (la lista de socios, correos, ausencias): ¿dónde se alojan, cuánto tiempo se guardan y cómo se cumple la normativa de protección de datos?
- [ ] La lista de socios la carga el club: ¿en qué formato llega y cada cuánto se actualiza?
- [ ] Los avisos van por correo: ¿con qué servicio se envían?
- [x] Hoy hay reservas dobles: ¿cómo se garantiza que dos jugadores no reserven la misma pista y franja a la vez? Restricción única en base de datos (ver Datos).
- [ ] Se usa desde el navegador del móvil y debe estar en primavera: ¿dónde se despliega (hosting de Next.js y Postgres gestionado) y con qué entorno de pruebas?
