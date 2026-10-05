<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Formato de receta Cookwala: recetas que funcionan con Missions

Una receta en Cookwala no es una lista de instrucciones. Es **conocimiento de cocina portátil**
que un planificador *compila* frente a una Misión específica (hogar, robots, electrodomésticos,
energía, presupuesto, salud, tiempos) en un plan ejecutable. El robot entonces ejecuta ese plan,
adaptándose mediante contingencias y playbooks cuando la realidad cambia.

Esquema: [`recipe.schema.json`](../schemas/recipe.schema.json). Ejemplo completo trabajado:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Cuatro capas (adaptado del enfoque de las Directrices SMART de la OMS)

| Capa | Qué contiene | Quién lo escribe | Dónde reside |
|---|---|---|---|
| **R1 Narrative** | Texto de receta humano, historia, notas culturales, fotos | Cocineros, chefs, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | Lo que el plato *es* y *debe ser*: identidad (esencial vs flexible), objetivos sensoriales, nutrición, estilo de servicio y consumo, almacenamiento, comprobaciones de aceptación | Editores de recetas, asistido por IA, revisado | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Método agnóstico al dispositivo: fórmula (ratios + roles), grafo de proceso de ops tipificadas con condiciones pre/post de estado de alimento, condiciones `until`, alternativas, reglas de pausa, modos de fallo, affordances, peligros, CCPs, preparación del entorno | Pipeline de exportación + revisión; verificado por simulador (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | La receta R3 compilada para *esta* Mission: cantidades exactas, variantes elegidas, actores y dispositivos asignados, horario, arrendamientos, monitores, contingencias | El planner/compiler, en run time | Dentro de la **Mission** (`plan`), nunca en el catálogo |

Como el código fuente y un compilador: **la receta es una representación intermedia portátil
(R3 + R2). La Misión es la máquina de destino.** Eso es lo que mantiene las recetas válidas a medida que los robots
y la IA cambian: un mejor planificador produce un mejor R4 a partir de la misma receta.

## 2. Qué hace cada sección en una Misión

| Sección de la receta | Utilizado por la Mission para… |
|---|---|
| `identity.essential / flexible / neverAdd` | Sustituciones, modos de presupuesto y ración, adaptaciones de dieta: cambiar las partes flexibles, nunca las esenciales, para que el plato siga siendo él mismo |
| `formula` (ratios, min/max, role, scaling) | Escalamiento exacto a cualquier número de personas, racionamiento de ingredientes durante una semana, estiramiento del presupuesto, usar lo que se tiene a mano (el rescale de ingrediente limitante) |
| `sensory` | Puntos de control de visión, aroma y sabor; perfiles de sabor del household context (sal 2 vs 4); decisiones de reutilización y corrección |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Tareas de preparación del entorno:** si el fregadero o la placa están ocupados, el planificador añade tareas de "limpiar, lavar, secar"; las tareas de remojo o descongelación se programan con horas de antelación |
| `process.nodes[]` con estados de comida `pre`/`post` | Planificación (solo empezar lo que está listo), verificación (¿el paso produjo el estado?), reanudar tras interrupciones |
| `until`, `onTimeout`, `retry` | Saber cuándo un paso ha terminado y qué hacer cuando no es así |
| `alternatives[]` + `energy` | Gas vs inducción vs horno, ahorro de batería, cocinas sin horno, horas de silencio |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Interrupciones:** un niño necesita ayuda, el propietario llama, el perro tira algo. El robot pone el paso en su safeState, gestiona el evento, luego reanuda, recalienta, rescata o descarta basándose en el presupuesto de pausa |
| `failureModes` (incident, detect, prevent, playbook) | Detección temprana de problemas conocidos y el playbook exacto para recuperarse |
| `affordances`, `space` | Emparejar pasos con robots que puedan agarrar, levantar y alcanzar; mantener las zonas calientes lejos de los niños |
| `safety` (hazards, CCPs, supervision, abort) | El núcleo de seguridad: invariantes que cada plan debe preservar |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Servicio: qué va a la mesa, a la habitación, en la fiambrera; recordatorios y límites de espera; estilo de comida cultural |
| `storage` | Sobras, Missions de cocinar con antelación y de fiambrera |
| `acceptance` | Las *pruebas* de la receta: la Mission termina cuando estas se mantienen |
| `nutrition`, `cost` | Porciones personales, presupuesto, raciones de alivio |

## 3. Ejemplo: un paso con todo adjunto

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. Compilación de una receta para una Misión (lo que hace el planner)

1. **Seleccionar la variante:** dieta, textura (IDDSI), equipo, energía y selección de modo de
   `alternatives`. Los esenciales de identidad deben sobrevivir.
2. **Escalar:** desde `formula` y las raciones, porciones por persona (HEALTH.md), el
   ingrediente limitante, o un horizonte de ración. Especias sublinealmente, tiempo por exponente de masa.
3. **Sustituir** dentro de los roles, respetando `identity.neverAdd`, alérgenos, packs dietéticos
   e inventario.
4. **Preparar el entorno:** comparar `prep` con las facetas espaciales de la Misión (¿fregadero lleno?
   ¿fogón ocupado? ¿tabla sucia?) y añadir tareas de ordenar, lavar, secar y preparar. Programar
   `advanceTasks` (remojar, descongelar, marinar, precalentar).
5. **Vincular:** asignar cada nodo a robots, electrodomésticos o humanos por afinidades y
   capacidades. Arrendar quemadores, recipientes y zonas. Adjuntar monitores (olla inteligente, ETA de
   entrega, detector de humo).
6. **Programar** hacia atrás desde la hora de servir, honrando presupuestos de pausa, límites de
   batería y energía, horas de silencio del hogar y ventanas de uso compartido de la cocina.
7. **Adjuntar contingencias:** las reglas de `failureModes` y `pause` de cada nodo, además de las
   políticas globales de la Misión (interrupciones, niño o mascota cerca del fogón, vigilante de la estufa,
   vigilancia de deterioro).
8. **Verificar:** comprobaciones de esquema + semánticas, packs de políticas, cobertura de CCP, dry run del
   simulador, invariantes de la pila de prioridad (PROTOCOL §7.2).
9. **Emitir R4** en el `plan` de la Misión, firmarlo y entregarlo al robot.

## 5. Autoría y conversión

- **De fifi.cooking:** el pipeline EXPORT-FIFI genera R1 + R2 + R3. Las nuevas
  secciones (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  son generadas por modelos locales a partir del texto existente y verificadas por validadores y
  revisión humana muestreada.
- **De la web:** `cookwala convert --from schema-org` → R1/R2 (V0), luego el mismo
  enrichment.
- **A otros formatos:** schema.org Recipe (R1/R2 para motores de búsqueda), Cooklang (edición
  humana), PDDL o lógica temporal (planificadores de investigación) pueden generarse todos desde R3.
- **A mano:** `cookwala init recipe` estructura todas las capas; `cookwala validate` y
  `cookwala simulate` las comprueban.
- **Versionado:** las revisiones son inmutables y tienen hash. Los forks registran `meta.derivedFrom`.
  Los **patches** de recetas (de playbooks o feedback) se proponen como diffs y se promueven solo
  después de la revisión y la evidencia.

## 6. Lenguaje del texto del paso

Las oraciones de los pasos están escritas para una persona primero y analizadas por una máquina en segundo lugar. El texto de los pasos en árabe en las recetas de ejemplo utiliza el imperativo femenino (قطّعي، سخّني), que es la convención común de los libros de cocina egipcios; es una elección deliberada, no un descuido, y un editor puede usar la pasiva de género neutro (تُقطَّع البصلة) en su lugar. Los campos `op`, `params` y `until` llevan el significado; la oración es para el cocinero.

## 7. Por qué esto se mantiene preparado para el futuro

- Las recetas describen **food outcomes and constraints, not motions**. Los nuevos robots y la nueva IA
  producen mejores planes R4 a partir del mismo R3.
- Todas las secciones nuevas son **optional and additive**. Una receta V0 (solo R1) sigue funcionando para
  la cocina humana guiada; cada capa añadida desbloquea más automatización.
- Los campos `x-` desconocidos se pasan sin cambios. Los proveedores, chefs y organismos de salud pueden extender las recetas
  sin romper nada para nadie.
- Los **Acceptance checks** permiten que cualquier ejecutor, humano o robot, demuestre que el plato salió bien,
  que es como las recetas ascienden a V3 con evidencia de campo.

