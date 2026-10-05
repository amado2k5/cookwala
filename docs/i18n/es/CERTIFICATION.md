<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->

# Conformance y el camino hacia la certification

**Status:** draft, 2026-10-04 (RFC-0008). No se ha contratado a ningún certificador todavía; este es el camino que ofrece el estándar.

## 1. Tres pasos

| Paso | Quién | Qué significa | Se muestra como |
|---|---|---|---|
| **Self-declared** | El fabricante o editor | Ejecutó los vectores públicos con la herramienta pública y publicó un `ConformanceReport` (`schemas/conformance.schema.json`), firmado con su propia clave | el informe, con las suites y recuentos; nunca una insignia |
| **Verified** | Un operador de registry | Reprodujo la ejecución contra el mismo hash de conjunto de vectores y cofirmó el informe | el informe más el verifier |
| **Certified** | Un certifier independiente (ninguno existe hoy) | Ejecutó la suite más comprobaciones de hardware y de safety-case bajo un esquema publicado y otorgó la marca | el informe, el certifier, la marca |

Un informe que falle en cualquier vector de una clase no puede reclamar dicha clase. El registry muestra
informes, no badges.

Hoy el único operador del registry es el mantenedor de la especificación (cookwala.ai), por lo que "verified" no añade independencia hasta que exista un segundo registry; el status todavía se muestra como self-verification.

## 2. Qué contiene un informe

Versión principal, la clase reclamada (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) o una reclamación de perfil (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), el sujeto (producto, proveedor, versión), las suites ejecutadas con totales e ids de
vector fallidos, el hash del conjunto de vectores, la herramienta y el commit, la fecha, el estado y el
verificador. Ejemplo: `examples/conformance/report-reference.json`, producido por

```bash
python tools/run_conformance.py --report report.json
```

## 3. Clases y lo que demuestran

| Clase | Vectores | También necesario para la certification (no cubierto por vectores) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | revisión de contenido de recetas por un profesional de seguridad alimentaria |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | el propio caso de seguridad del dispositivo (ISO 13482, IEC 60335, UL 3300 según corresponda); latencia de parada local measured; límites de seguridad aplicados sin red |
| Catalog | hash, signature, key revocation, recalls | custodia de claves y proceso de recepción de incidentes |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | resultados publicados por modelo con método |
| Verifier | todas las suites Core | ninguno |
| Humanitarian H0–H3 | gramática SMS, máquina de estados, rule packs | revisión de responsabilidad de datos; sin auditoría de datos personales |
| Household | política de divulgación | evaluación de impacto de protección de datos |
| Registry | reglas de nombre y versión, tombstones | proceso de prueba de namespace |

## 4. Lo que la certification no puede prometer

Un informe de conformance demuestra que el software se comportó como los vectores requieren el día en que se ejecutó.
No demuestra que un dispositivo sea seguro en cada cocina, que una receta sepa bien, o que
no pueda ocurrir ningún daño. Un estándar que prometiera cero daño sería deshonesto; este promete
que los límites se aplican localmente, que los refusals ocurren before heat, y que los registros pueden
ser verificados.

## 5. Gobernanza de la marca

La marca de certification y sus reglas se trasladan a la base neutral con la marca comercial (`GOVERNANCE.md`). Hasta entonces no existe ninguna marca; solo existen informes.

