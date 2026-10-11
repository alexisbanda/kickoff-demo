# Brief técnico: Turnos

> **Lo escribe el tech lead.** Ticket Studio solo deja esta plantilla y, en «Decisiones pendientes», las preguntas técnicas que salen del brief de producto. No propone stack ni arquitectura. El ticket 0 de cimientos depende de este documento. Los encabezados `##` son fijos: `brief_check.py` los comprueba.

## Stack

<Lenguajes, frameworks, base de datos.>

## Arquitectura

<Piezas principales y cómo se hablan.>

## Datos

<Modelo de datos a grandes rasgos, datos personales, retención.>

## Integraciones externas

<Servicios de terceros: pagos, correo, autenticación…>

## Cómo se prueba

<Comando de tests, tipos de prueba, datos de prueba. Lo usa el ticket 0 y cada criterio `[test]`.>

## Entornos y despliegue

<Desarrollo local, entorno de pruebas, producción, CI.>

## Decisiones pendientes

- [ ] Hay pagos y devoluciones (cancelación con más de 24 h): ¿qué proveedor? Turnos no debe guardar tarjetas.
- [ ] Hay cuentas de jugador: ¿cómo se identifican al entrar (correo, otro método)? El brief pide pocos pasos para gente mayor.
- [ ] Hay datos personales (la lista de socios, correos, ausencias): ¿dónde se alojan, cuánto tiempo se guardan y cómo se cumple la normativa de protección de datos?
- [ ] La lista de socios la carga el club: ¿en qué formato llega y cada cuánto se actualiza?
- [ ] Los avisos van por correo: ¿con qué servicio se envían?
- [ ] Hoy hay reservas dobles: ¿cómo se garantiza que dos jugadores no reserven la misma pista y franja a la vez?
- [ ] Se usa desde el navegador del móvil y debe estar en primavera: ¿qué implica para el stack y los entornos?
