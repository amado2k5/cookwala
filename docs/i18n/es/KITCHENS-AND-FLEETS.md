<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->

# Cocinas y ejecuciones de producción: restaurantes, comunidad, escuela, desastres y cocinas robóticas

> **Estado: perfil experimental** (RFC-0005). Esquema: `schemas/fleet.schema.json`.
> Ejemplos: `examples/fleet/`.

## 1. Por qué

El fundador pidió el mismo protocolo en un restaurante, una boda, una campaña de donación o una fábrica de alimentos (RFC-0005). El informe añade programas de comidas escolares y cocinas de desastre. El núcleo cubre un dispositivo cocinando una receta; el Perfil Humanitario cubre el movimiento de surplus y el conteo de comidas. Entre ellos se encuentra la **kitchen**: estaciones, dispositivos, personas, muchos lotes, una ventana de servicio, puntos de control críticos y el vínculo desde el execution log de un dispositivo hasta las comidas que un programa reporta.

## 2. Documentos

| Document | Lo que dice |
|---|---|
| `Kitchen` | La cocina de una organización: tipo, estaciones (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), dispositivos como referencias de capacidad, capacidad en comidas por hora, equipo de hot-hold y cooling, rule packs en vigor, **recuentos de personal por rol**, horas de operación |
| `ProductionRun` | Recetas con recuentos de lotes y porciones, una ventana de servicio, asignaciones por paso de receta a una estación y a un `device`, a un `person` o a cualquiera de los dos, registros de puntos críticos de control (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation), las ejecuciones Core producidas, y un resultado (comidas producidas y servidas, desperdicio, rescued food usado, fallos, incidentes, energía, coste, la `Distribution` Humanitaria que emitió) |
| `StationLease` | Uso exclusivo de una estación por un device o un rol durante un tiempo |

## 3. Cómo se une al resto

- Un paso asignado a un `device` es un Core `ExecuteRequest` (o un objetivo `ExecuteNode` a través del
  vínculo ROS 2); su hash de `ExecutionLog` va en `executions`.
- Una ejecución que sirve a un programa emite una Humanitarian `Distribution`; los `ccps` de la ejecución son la
  evidencia detrás de los hallazgos de seguridad de la distribución.
- Los rule packs del Humanitarian Profile se aplican al menú y los elementos de la ejecución.
- El despacho de la flota (qué robot va a dónde) pertenece a Open-RMF o al gestor de flota de un proveedor,
  no a este perfil.

## 4. Ejemplo resuelto

`examples/fleet/kitchen-disaster.json` y `production-run-disaster.json`: una cocina de socorro
con dos calderas de gas, unidades de mantenimiento en caliente y un baño de hielo produce 710 comidas de sopa de lentejas y
arroz para una ventana de dos horas, registra las temperaturas de cocción y de mantenimiento en caliente, encuentra una unidad de mantenimiento en caliente
por debajo de 60 °C y recalienta ese lote antes de servir, y emite una distribución. El ejemplo es
ilustrativo; no se describe ninguna cocina o evento real.

## 5. Qué se deja fuera deliberadamente

Nombres y horarios del personal, salarios, pedidos y pagos de clientes, precios del menú. El personal aparece como recuentos por rol para que el coste por comida pueda calcularse sin identificar a nadie.

## 6. Next

Ejemplo de servicio de restaurante con una estación de robot; una suite de conformance para la máquina de estados de run; unificación de `StationLease` con los leases de sesión (`session.schema.json`).

