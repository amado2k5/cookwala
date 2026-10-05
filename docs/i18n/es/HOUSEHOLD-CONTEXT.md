<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Perfil de Household Context: la imagen completa se queda en casa

> **Status: draft profile** (RFC-0001). No es parte de Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Recipient rules: `profiles/household/recipient-roles.json`. Local API:
> `api/household.openapi.yaml`. Example: `examples/household/context.json`.

## 1. Por qué

Un robot que sirve bien a una familia necesita saber muchísimo: los electrodomésticos y sus peculiaridades, quién vive allí y cuándo están en casa, mascotas, niños, dietas, alergias, horarios de medicación, rituales, presupuesto, hábitos de compra, qué salió mal la última vez. Los mismos hechos son un plan de robo y una herramienta de perfilado. Este perfil le da al **planner at home** la imagen completa y le da a todos los demás solo una **constraint**.

## 2. Tres ideas

1. **Facets.** Un hecho escrito cada uno (`cw.facet.household.health.allergies`), con quién
   lo afirmó (declarado, observado, reportado, inferido), cuándo, durante cuánto tiempo, qué tan seguro,
   y una clase de privacidad (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in the registry.** Cada tipo de facet indica si su valor bruto puede salir del
   hogar: `never` (45 tipos: niños, ausencias, distribuciones, condiciones de salud, religión,
   comportamiento, incidentes, postura de ingresos), solo como una restricción `derived` (81 tipos), o como una
   divulgación `consented` tras una concesión explícita (13 tipos, mayormente el estado propio del dispositivo para el
   fabricante).
3. **Derived constraints.** El único objeto de hogar que un tendero, planificador, servicio de entrega,
   fabricante de dispositivos u otro robot recibe alguna vez: "entregar 17:00–18:00 en la puerta principal",
   "bloquear cacahuetes", "sin movimiento de robots en el pasillo 15:00–15:30", "límite de presupuesto 18.00 USD por
   comida". Cada uno nombra los **types** de facet de los que proviene, nunca sus valores.

## 3. Quién recibe qué

| Rol del destinatario | Puede recibir |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (IA o software que planifica la comida) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | solo device fault summary (conteos de fallos por categoría, sin tiempos, sin hechos del household), y solo cuando el household ha nombrado a un insurer como destinatario; RFC-0001 enumera este como el rol con más probabilidades de ser eliminado si una revisión de privacidad presenta objeciones |
| program (food bank, school) | nada |
| dataset | nada |

## 4. Reglas

- Las facets brutas nunca salen del dispositivo. No hay ninguna API que las devuelva a nadie fuera de la red doméstica.
- Las facets `inferred` nunca se utilizan para decisiones de seguridad.
- No se produce ni se almacena ninguna puntuación de comportamiento de ninguna persona. Las facets de comportamiento existen para servir al hogar (tamaños de las porciones, cuándo recoger) y nunca viajan.
- El nivel económico es una **postura presupuestaria establecida por el propietario**, nunca inferida de nada.
- Los datos y ausencias de los niños son `secret` y nunca viajan, ni siquiera derivados, excepto como restricciones de movimiento y de zona segura que no revelan ningún horario.
- Cada facet es borrable. El borrado se completa dentro de la ventana del hogar (por defecto 7 días, como máximo 30) y se registra sin contenido.
- Una clase de privacidad puede elevarse por encima del valor por defecto del registry, nunca reducirse.

## 5. La memoria de incidentes locales

RFC-0001 pregunta qué recuerda el robot sobre alarmas, conflictos, desistimientos y lecciones. `LocalIncident` lo contiene: fecha, categoría de
`vocab/incidents.json`, quién estuvo involucrado por tipo, una nota y una lección. Nunca sale del
hogar. El `IncidentReport` público y anónimo en Core es un documento diferente del que cada
maker aprende.

## 6. Conformance

Los vectores de perfil (`conformance/profiles/disclosure_policy.json`) proporcionan facets y un rol de destinatario y esperan los tipos de constraint exactos, los ids divulgados y los ids retenidos con sus razones. La implementación de referencia es `derive_constraints()` en `tools/cookwala_ref.py`.

## 7. Relación con otros documentos

`ClientProfile`, `KitchenProfile` y `RobotProfile` (`profile.schema.json`) permanecen como
bundles convenientes. Los mission facets (`mission.schema.json`) utilizan los mismos registry ids. El
Core `AgentMandate` permanece como la declaración normativa de lo que un agente puede hacer; los mandate facets
describen las reglas del household localmente.

## 8. Preguntas abiertas

Ver RFC-0001: roles de destinatario cerrados; privacidad de solo elevación; una evaluación de impacto de protección de datos con un revisor.

