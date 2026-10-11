# Brief de producto: Turnos

> Redactado por Ticket Studio a partir de las notas de Marta (gerente del Club Deportivo La Ribera) y su entrevista. Es el contexto de producto del proyecto: lo leen el equipo, Ticket Studio al escribir tickets y agent-playbook al planificar.

## Problema

El club tiene 6 pistas de pádel y las reservas las lleva el encargado por WhatsApp y en una libreta. Los fines de semana se le acumulan los mensajes, hay reservas dobles casi todas las semanas y gente que no aparece y deja la pista vacía. Los socios se quejan de que los no socios se quedan las mejores horas. Turnos permite que cada jugador reserve y pague solo desde el móvil, con ventaja para los socios, y libera al encargado de gestionar las reservas a mano.

## Usuarios

| Usuario | Qué necesita | Con qué frecuencia usa el producto |
| --- | --- | --- |
| Socio | Reservar con 7 días de antelación y pagar el precio de socio, de forma muy sencilla (muchos son mayores) | No concretada |
| No socio | Reservar con 2 días de antelación y pagar al reservar | Ocasional |
| Encargado (Javi) | Ver el día de un vistazo, bloquear pistas, ayudar a quien se atasca y llevar la cuenta de quién no aparece | A diario |
| Gerente (Marta) | Que las pistas se llenen sin reservas dobles ni pistas vacías | No concretada |

## Flujos principales

1. **Reservar una pista.** El jugador abre Turnos en el navegador del móvil, elige día, franja y pista libre dentro de su antelación (7 días si es socio, 2 si no), paga su precio y recibe la confirmación por correo.
2. **Cancelar una reserva.** Hasta 24 horas antes, cancela y se le devuelve el dinero; después puede cancelar pero no se devuelve.
3. **Apuntarse a la lista de espera.** Si la franja está llena, se apunta; cuando alguien cancela, se avisa por correo a toda la lista y la pista es del primero que reserve y pague.
4. **Gestionar el día (encargado).** Javi ve todas las pistas y franjas del día, bloquea pistas por mantenimiento o torneo, ayuda a quien se atasca y anota quién no se presentó.

## Glosario del dominio

| Término | Significa |
| --- | --- |
| Pista | Cada una de las 6 pistas de pádel del club |
| Franja | Hora de inicio fija de una reserva; cada reserva dura 1 h 30 |
| Reserva | Una pista en una franja de un día, pagada por un jugador |
| Socio | Jugador que está en la lista de socios que carga el club |
| No socio | Cualquier otro jugador |
| Antelación | Cuántos días antes se puede reservar: 7 los socios, 2 los no socios |
| Lista de espera | Jugadores apuntados a una franja llena, a los que se avisa si se libera |
| Bloqueo | Pista que el encargado saca de las reservas (mantenimiento, torneo) |
| Ausencia | Reserva pagada a la que el jugador no se presenta |

## Qué no es

- No gestiona torneos ni clases con monitor; quedan para más adelante.
- Solo pádel: no reserva otros deportes ni instalaciones.
- No es una app de la tienda: se usa desde el navegador del móvil, sin instalar nada.
- No gestiona a los socios (cuotas, altas y bajas): eso sigue como hoy; Turnos solo usa la lista de socios.
- No se paga en recepción: todo el mundo paga al reservar.

## Requisitos no funcionales

- Muy sencillo para gente mayor: reservar en pocos pasos (día, franja, pista y pago), con letra grande y legible en el móvil sin hacer zoom.
- Turnos no guarda tarjetas: el cobro lo hace un tercero.
- Los avisos (confirmaciones, lista de espera) llegan por correo.
- Tiene que estar funcionando en primavera, antes de la temporada alta.

## Épicas por prioridad

1. **Reservas.** Que socios y no socios reserven solos desde el móvil, viendo qué pistas hay libres, sin reservas dobles. Alcance: ver disponibilidad por día, franja y pista; reservar respetando la antelación de cada uno; ver mis reservas; la lista de socios que carga el club; no incluye el pago (épica 2).
2. **Pago al reservar.** Que cada reserva quede pagada en el momento de hacerla, con precio de socio y de no socio. Alcance: cobro de 8 € (socio) o 14 € (no socio) por reserva y confirmación por correo; no incluye pagar en recepción ni guardar tarjetas.
3. **Cancelación y lista de espera.** Que las pistas que se liberan vuelvan a llenarse. Alcance: cancelar con devolución hasta 24 horas antes y sin devolución después; apuntarse a una franja llena y aviso por correo a toda la lista cuando se libera; no incluye reasignar la pista automáticamente.
4. **Panel del encargado.** Que Javi controle el día sin WhatsApp ni libreta. Alcance: vista del día con todas las pistas y franjas, bloquear y desbloquear pistas, cargar la lista de socios y ayudar a un jugador con su reserva; no incluye informes ni contabilidad.
5. **Ausencias.** Que no aparecer tenga consecuencias. Alcance: el encargado marca una ausencia, se avisa al jugador y, tras varias, no puede reservar durante un tiempo; no incluye multas ni cobros extra.

## Preguntas abiertas

- [ ] ¿Cuáles son las franjas exactas (hora de apertura, de cierre y de inicio de cada franja)?
- [ ] Ausencias: ¿cuántas antes de limitar, durante cuánto tiempo y quién las marca (solo Javi)?
- [ ] «Ayuda de Javi»: ¿puede Javi reservar en nombre de un jugador? Si todo se paga al reservar, ¿quién paga en ese caso?
- [ ] Lista de espera: ¿hasta cuándo se avisa (por ejemplo, no si faltan menos de 2 horas)?
- [ ] ¿Cuántas reservas a la vez puede tener un jugador?
- [ ] ¿Con qué frecuencia usan hoy las pistas los socios? Ayuda a dimensionar.
