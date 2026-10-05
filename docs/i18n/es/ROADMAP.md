<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# Hoja de ruta: now, next, later

**Status:** 2026-10-04. Cada elemento tiene un estado: **done**, **in progress**, **planned**,
**not yet funded**. Los gates provienen de la sección 4 de `ACTION-PLAN.md`. Nada pasa de planned
a done sin la evidencia nombrada.

## Now (esta versión)

| Item | Status |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Nine example recipes in English and Arabic | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Four simulators with the protocol on and off | done (illustrative) |
| Website in English and Arabic with a page for every stakeholder, whitepaper and deck | in progress |

## Next (dentro de aproximadamente un año, según lo permitan los recursos)

| Item | Status | Gate |
|---|---|---|
| Revisión de científicos de alimentos de los operation envelopes | planned | reviewer agrees |
| Revisiones de dietistas y oficiales de seguridad alimentaria de los cuatro rule packs | planned | reviews filed; packs move to reviewed |
| Evaluación de impacto de protección de datos del household profile | planned | reviewer agrees |
| Un piloto de food-bank (12 weeks, pre-registered, independent evaluator) | not yet funded | partner and funding (`humanitarian/CONCEPT-NOTE.md`) |
| Resultados de benchmark de seguridad de agentes para varias familias de modelos | planned | runs published with method |
| wheel de `pip install cookwala` y `@cookwala/sdk` en npm | planned | packaging that bundles vocabularies and schemas |
| Servicio de Registry (`validate`, `publish`, tombstones) | planned | a worker and namespace proof |
| Primer fabricante de dispositivos implementando la Core API contra el reference hub | planned | one maker agrees; conformance report published |
| Conversión de las primeras colecciones de fifi.cooking | planned | founder decides rights per collection |
| Core 0.3 a partir del feedback de dispositivos | planned | two implementers' feedback |
| Steering committee | planned | three independent adopters or two implementations |

## Later

| Item | Status |
|---|---|
| Un dispositivo real cocinando una receta Cookwala, sin editar, en video | aún no financiado; necesita un socio de dispositivos |
| Esquema de certification con un certificador independiente | planificado; ningún certificador contratado |
| Fundación neutral para la especificación, marca comercial y marca | planificado |
| Red de contribuyentes: grabaciones consentidas de recetas reales con crédito | planificado |
| Señales de demanda y oferta publicadas por programas y cooperativas | planificado, tras la revisión de la ley de competencia |
| Benchmark de "Cook in simulation" (Isaac Lab, Gazebo o MuJoCo) | planificado |
| Reconocimiento como Bien Público Digital para el Humanitarian Profile | planificado, tras la evidencia del piloto |
| Flujos de ayuda transregionales en el simulador mundial; efectos de clean-cooking | planificado |

## Lo que no haremos

Recopilar datos personales; publicar números sin un método; nombrar a un socio antes de que este acepte;
reclamar una certification que no existe; poner datos de household en cualquier ledger; construir un
orchestrator central del que dependan las cocinas; afirmar que se acabará el hambre.

## Reglas de kill y pivot

Del plan de acción: si dos rondas de revisión externa no logran producir un fabricante de dispositivos o un socio piloto, Cookwala se reduce al Humanitarian Profile y al formato de receta. Si un piloto muestra una ganancia inferior al 5 %, los resultados se publican y el perfil se rediseña antes de cualquier escalado.

