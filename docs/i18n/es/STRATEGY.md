<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->

# Estrategia de Cookwala: mensaje, producto, sitio web, docs, experiencia del desarrollador

**Status:** revisado 2026-10-04 (v2). Cubre la misión, visión, historia, estándar, sitio web,
documentación, API y SDK, demostraciones, comunidad y métricas. Se basa en el plan de acción
(`ACTION-PLAN.md`), la historia de fondo y la lista de brechas (`research/BACKSTORY.md`), la revisión de arquitectura
(`research/ARCHITECTURE-REVIEW.md`), el benchmark de 23 sitios (`research/WEB-BENCHMARK.md`), el
diseño de partes interesadas (`STAKEHOLDERS.md`) y las reglas de mensajería (`MESSAGING.md`). La tabla de la Sección 1
es el estudio de primera pasada; el benchmark lo reemplaza donde difieren.

---

## 0. Resumen

**El trabajo de Cookwala.** Es la forma abierta de decirle a cualquier cocina (una persona, un food bank, un horno o un robot humanoide) **qué hacer, cuándo se completa cada paso y qué es lo que nunca debe suceder**, y verificar las tres cosas en el dispositivo.

**Qué cambios:**

1. **Message.** Retire "the world's first and largest robot cooking recipes index and CLI"
   y lidere con el problema que tiene cada fabricante de robots y cada cocina. Nuevo eslogan:
   *"The open standard for cooking safely: people, kitchens and robots."*
2. **Story.** Los robots están a punto de cocinar en los hogares, pero nadie ha escrito, en una forma que una
   máquina pueda verificar, lo que significan "listo" y "seguro", o en qué cocinas. Cookwala comenzó
   a partir de las recetas egipcias de una familia. Su misión es enseñar a las máquinas cada cocina
   de forma segura, y asegurar que la buena comida llegue a las personas.
3. **Proof before promise.** Contadores reales y en vivo. Etiquetas now / next / later. Críticas publicadas.
4. **One loop everyone understands:** *Describe → Check → Cook → Learn.*
5. **Paths by audience:** fabricantes de dispositivos, constructores de agentes de IA, cocinas y food banks, cocineros,
   investigadores.
6. **Code and a live demo on the first screen.** dry run en el navegador ("¿Puede este dispositivo cocinar
   esta receta?"), los simuladores, y comandos de copiar y pegar que funcionan hoy.
7. **Developer experience at the level of the best AI and robotics docs:** un quickstart de 5 minutos,
   docs organizadas como tutoriales, guías de cómo hacerlo, referencia y explicación,
   `llms.txt`, copy-page, un paquete de Python y CLI, un SDK de JS/TS tipado, un servidor MCP, un
   reference hub que puedes ejecutar localmente, un paquete de ROS 2, y un puente LeRobot.
8. **A contributor network** (inspirado en el Index de Figure): cocineros y cocinas contribuyen con
   grabaciones consentidas de recetas reales, para que los robots aprendan cada cocina, con crédito para las
   personas que les enseñaron.

---

## 1. Lo que aprendimos

| Sitio | Problema que resuelve | Enfoque | Cómo se comunica | Audiencia | Qué tomamos |
|---|---|---|---|---|---|
| **Figure – Index** | Los humanoides necesitan enormes cantidades de datos de tareas del mundo real | Red de colaboradores de pago que registra tareas cotidianas; servicios now, robots later | Cinemático, monocromático, tipografía de gran tamaño; contadores en vivo (29 M video uploads, $15 M paid); *"Today, services on demand. Soon, robots on demand."* | Colaboradores, households, empresas | Red de colaboradores con crédito; **contadores de prueba en vivo**; una línea de honestidad "today / soon"; una imagen impactante |
| **Figure (home)** | Ayuda en el hogar | Un humanoide de propósito general | *"The future of home help is here."* Una frase, un video | Households, inversores | La promesa de una sola frase; producto antes que características |
| **MCP Registry** | Encontrar servidores MCP confiables | Registro comunitario; namespaces de reverse-DNS verificados; versiones exactas; hashes de integridad; endpoint de validación; estado del ciclo de vida | Referencia OpenAPI limpia; schema-first | Editores de servidores, fabricantes de clientes | **Namespaces verificados, versiones fijas, hashes, tombstones** → `REGISTRY.md` |
| **LangChain docs** | La construcción de agentes está fragmentada | Frameworks abiertos y agnósticos al modelo más una plataforma | *"The open agent engineering ecosystem"*; ciclo de vida Build → Test → Deploy → Monitor; centro de confianza y estado | Ingenieros de agentes, empresas | **Un ciclo de vida que el lector reconoce**; centro de confianza; academia y foro |
| **LangSmith Observability** | Ver qué hicieron los agentes en producción | Traces → monitoreo → feedback → datasets para evals | Pasos con enlaces; página de conceptos; integraciones | Equipos de agentes | **Execution logs como traces**; los traces se convierten en datasets → `execlog_export.py otel` |
| **OpenAI API docs** | Primera llamada a la API | Quickstart con código primero; rutas de construcción; model cards | Oscuro, enfocado en código, "Ask AI", estado y cookbook | Desarrolladores | **Código en la primera pantalla; "build paths"** |
| **Claude Platform docs** | Desde la primera llamada hasta la producción | Dos superficies (Messages, Managed Agents); viaje del desarrollador numerado; tarjetas de familia de modelos | Búsqueda ⌘K; pestañas de lenguaje (Python … cURL, CLI); viaje 1–4 | Desarrolladores, equipos de plataforma | **Viaje del desarrollador numerado; pestañas de lenguaje; "choose how you build"** |
| **AsyncAPI** | Describir APIs orientadas a eventos | Especificación abierta más herramientas (generadores, docs); gobernanza abierta bajo la Linux Foundation | "Part of the Linux Foundation"; spec → docs → code demo; reuniones comunitarias; niveles de patrocinio | Arquitectos, constructores de herramientas | **Insignia de gobernanza abierta, TSC, calendario comunitario, patrocinadores** |
| **SiliconFlow** | Inferencia de modelos rápida y barata | API integral para muchos modelos | Listas de características de rendimiento, escalabilidad, costo y seguridad | Desarrolladores, empresas | Una lista clara de **characteristics** (las nuestras: safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | Ingeniería de prompts por ensayo y error | Casos de prueba declarativos, red teaming, CI | *"Test-driven LLM development, not trial-and-error"*; lista de por qué elegir; pasos del flujo de trabajo | Desarrolladores de aplicaciones LLM, seguridad | **Pruebas de seguridad declarativas** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; no el Helix AI de Figure) | DeFi es demasiado complejo | Agente de lenguaje natural con confirmación antes de cada transacción | Whitepaper: abstract → problem → solution → architecture → security model | Usuarios de crypto | **Estructura del whitepaper; modelo de seguridad explícito; "always confirm"** (tomamos la estructura, no el modelo de token) |
| **Hugging Face LeRobot** | La robótica es difícil de empezar | Biblioteca agnóstica al hardware; teleoperate → record → train → deploy; formato de dataset estándar; datasets comunitarios | "Pick your path: I have a robot / no hardware yet / I want to contribute"; cheat sheet; problemas comunes | Makers, investigadores | **"Pick your path"; compatibilidad de datasets; sección de common-problems** |
| **ROS 2 / Open Robotics** | Interoperabilidad de software de robots | Middleware abierto (ROS, Gazebo, Open-RMF) gestionado por una organización sin fines de lucro | *"Powering the world's robots"* | Desarrolladores de robots | **ROS 2 actions; gestión sin fines de lucro** |
| **NVIDIA Isaac** | Desarrollar y entrenar robots | Simulación, librerías, modelos fundacionales (GR00T) | Mapa de la plataforma: librerías, simulación, modelos, blueprints | Equipos de robótica | **Simulación como banco de pruebas** para envelopes |
| **1X, Unitree, Pollen** | Humanoides domésticos, robots asequibles, robots abiertos para makers | Productos con depósitos, preventas y comunidad | Un producto, un precio, un botón | Households, makers | Los robots domésticos se están enviando now; nuestra ventana es now |

**Patrones compartidos por los mejores:**
1. Una oración sobre para quién es y qué hace.
2. Un bucle que el lector reconoce.
3. Código funcional o una demo dentro de un solo scroll.
4. Puntos de entrada de elección de ruta.
5. Prueba (números, usuarios, gobernanza).
6. Estado honesto (centro de confianza, página de estado, now/next).
7. Comunidad a la que puedes unirte hoy.
8. Docs construidos tanto para personas como para lectores de IA (página de copia, `llms.txt`, "Ask AI").

---

## 2. Cookwala hoy

**Fortalezas:**
- Una idea rara y concreta: operation envelopes físicos, sensor ladders, refusal en lugar de
  conjeturas, seguridad aplicada en el dispositivo, documentos verificables.
- Vectores de conformance que incluyen dos resultados de estándares independientes (RFC 8785, RFC 8032).
- Cuatro simuladores jugables.
- Un perfil humanitario que funciona sin robots.
- Un corpus de recetas real (fifi.cooking) y una región con identidad (Egipto, el mundo árabe).
- Un registro de crítica y respuesta inusualmente honesto.

**Gaps:**

| Brecha | Efecto |
|---|---|
| El titular afirma "primero y más grande" con 1 receta publicada | Se lee como hype; invita al descarte |
| "Acabar con el hambre en el mundo" como tema principal | Ahuyenta a financiadores y expertos que conocen los motores del hambre |
| Enfoque exclusivo para robots | Excluye a los usuarios que pueden adoptar hoy (cocinas, food banks, constructores de agentes) |
| Sin quickstart, sin SDK, sin servidor ejecutable | Nadie puede tener éxito en 5 minutos |
| La documentación son 25 archivos markdown sin navegación | Difícil de encontrar, difícil de confiar |
| Sin prueba en vivo o status | Sin sensación de impulso o preparación |
| Sin forma de unirse | El interés no puede convertirse en contribución |

---

## 3. Posicionamiento y mensaje

### 3.1 Categoría y descripción breve
- **Categoría:** un estándar abierto (con herramientas gratuitas y un índice) para una cocina ejecutable y verificable.
- **Descripción breve:** *Cookwala es el estándar abierto para cocinar de forma segura: personas, cocinas y robots.*
- **Triada**, utilizada en todas partes:
  - **Qué hacer.** Recetas como pasos que una máquina puede planificar.
  - **Cuándo está listo.** Condiciones finales medibles: temperaturas, señales del estado de los alimentos, tiempos.
  - **Qué nunca debe suceder.** Límites de seguridad que el dispositivo impone por sí mismo.

### 3.2 Misión y visión (revisado)
- **Misión:** *Ayudar a que todos coman bien, de forma segura, asequible y sin desperdicios, sea quien sea que
  cocine.*
- **Visión:** *Cualquier cocina en la Tierra puede cocinar cualquier receta de forma segura, y la buena comida llega a las personas
  en lugar del cubo de basura.*
- **Por qué el cambio:** "end world hunger" se mantiene como la razón a largo plazo, explicada con evidencia.
  Cookwala contribuye a ello mediante menos desperdicios, rescate de alimentos y cocina más barata, junto con
  los programas, la financiación y las políticas que el hambre necesita.

### 3.3 La historia

> Los robots domésticos están llegando: Figure 03, 1X NEO y los robots de cocina se están enviando o aceptando
> pedidos. Están aprendiendo a moverse, pero nadie ha escrito, de una manera que una máquina pueda
> verificar, qué significa "simmer", cuándo el pollo es seguro, o cómo se hace la molokhia de una abuela.
> Cada fabricante escribe sus propias recetas cerradas, principalmente de unas pocas cocinas.
>
> Cookwala comenzó con las recetas caseras egipcias de una familia en fifi.cooking y planteó una pregunta
> sencilla: ¿cómo se le entrega una receta a una máquina y se sabe que la cocinará de forma segura?
>
> La respuesta es un estándar abierto. Indica qué hacer, cuándo se completa cada paso y qué es lo que nunca
> debe suceder. El dispositivo lo comprueba antes de calentar nada, y aplica un refusal before heat en lugar de
> adivinar. Las mismas recetas funcionan para las personas y los food banks hoy, y permitirán que los robots
> aprendan cada cocina de la Tierra mañana, dando crédito a los cocineros que les enseñaron.

*(El fundador debe confirmar y personalizar la oración de origen. Lo auténtico supera a lo pulido.)*

### 3.4 Casa de mensajes

| Pilar | Promesa | Prueba que podemos mostrar hoy |
|---|---|---|
| **Safe by design** | Los dispositivos rechazan en lugar de conjeturar, y aplican límites localmente | Operation envelopes para 32 operaciones; safety-limits pack; dry run; conformance |
| **Verifiable** | Cualquiera puede verificar una receta, un dispositivo y un registro | Firmas, revocación de claves, puntos de control de event-log; 106 vectores incl. resultados RFC |
| **Open and neutral** | Libre de regalías, agnóstico al modelo, agnóstico al dispositivo | Licencias; ruta de gobernanza; sin API keys |
| **Every cuisine** | Construido a partir de cocina casera real, multilingüe | corpus fifi.cooking; árabe e inglés; plan de world-cuisines |
| **Useful before robots** | Cocinas y food banks se benefician now | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **Learns with consent** | La cocina real se convierte en mejores robots, con crédito | Consentimiento ExecutionLog; exportación LeRobot; trazas OTel |

### 3.5 Reglas de lenguaje
- **Usar:** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent.
- **Evitar:** "revolutionary", "first and largest" (hasta que sea cierto), "end hunger" (como titular),
  "AI-powered" (vago).
- **Etiquetar cada número** como *measured*, *modelled* o *assumed*.
- **Decir "now / next / later"** en lugar de implicar que algo existe cuando no es así.

---

## 4. Audiencias y su primer éxito

| Audiencia | Tarea a realizar | Primer éxito (≤ 15 min) | Luego |
|---|---|---|---|
| **Fabricantes de robots y electrodomésticos** | Lanzar funciones de cocina sin escribir cada receta, de forma segura | Realizar un dry run de su perfil de dispositivo con 5 recetas; ver aceptar/rechazar por paso | Implementar la Core API (reference hub), pasar la conformance, publicar el dispositivo en el registry |
| **Constructores de agentes de IA** | Permitir que los agentes planifiquen comidas y pidan comida sin daño | Añadir el servidor Cookwala MCP; ejecutar el benchmark de seguridad del agente en su modelo | Usar AgentMandate y el dry run antes de actuar |
| **Cocinas y food banks** | Rescatar el surplus de forma segura, planificar menús nutritivos | Enviar una oferta por SMS, o completar el CSV; ver la comprobación del rule pack | Pilotar con el Humanitarian Profile |
| **Cocineros y creadores de recetas** | Mantener sus recetas vivas y acreditadas | Convertir una receta con el editor; verla pasar la validación | Contribuir con grabaciones (con consentimiento); aparecer en los créditos |
| **Investigadores y revisores** | Datos, benchmarks, assumptions honestas | Ejecutar un simulador; leer la crítica y la suite de conformance | Usar datasets; publicar reseñas |
| **Financiadores y responsables políticos** | Ver el impacto, los riesgos y la gobernanza | Leer el resumen del whitepaper de 2 páginas y la nota conceptual | Financiar pilotos; unirse a la gobernanza |

---

## 5. Arquitectura del producto: lo que ofrece Cookwala

| Capa | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profiles (draft / experimental) | Core 0.3 después del primer feedback de dispositivos | Core 1.0 bajo una base |
| **Index and registry** | Recetas de ejemplo; especificación del registry | corpus fifi.cooking convertido (2,380 recipes, Arabic + English); namespaces verificados | Colecciones comunitarias, cocinas del mundo |
| **Tools** | Validator, biblioteca de referencia, dry run, conformance, exporters | `pip install cookwala` (CLI + library); JS/TS SDK | Editor de recetas (web) |
| **Reference hub** | Especificación de Core API | Docker hub con un dispositivo simulado, para que el quickstart `curl` funcione localmente | Kit de Hardware-in-the-loop |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | Paquete ROS 2; servidor MCP; tarea Open-RMF | Benchmark de Isaac Lab "cook in simulation" |
| **Safety** | Limits pack, recalls, incidentes, benchmark de agentes | Límites revisados; resultados públicos de seguridad de agentes | Esquema de certification con un certificador |
| **Humanitarian** | Profile, rule pack, plantillas, nota conceptual | Piloto de food-bank en Egipto | Adopción de la red de food-bank |
| **Data** | ExecutionLog con consentimiento | Red de contribuyentes, primer dataset con consentimiento | Benchmark multi-cocina en el Hugging Face Hub |

---

## 6. Sitio web

### 6.1 Mapa del sitio

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 Página de inicio, de arriba a abajo

| # | Sección | Propósito | Contenido |
|---|---|---|---|
| 1 | **Hero** | Decir qué es en un solo aliento | Una línea, tríada, dos botones (*Try the dry run*, *Read the quickstart*); chip de estado honesto "Draft standard · v0.2" |
| 2 | **Live demo** | Mostrar, no contar | "¿Puede este dispositivo cocinar esta receta?" Elegir una receta y un dispositivo; cada paso muestra done / person / refuse, con la rule que decidió |
| 3 | **The problem** | Hacer sentir la brecha | Los robots están llegando; "simmer" significa cosas diferentes; recetas cerradas de pocas cocinas; comida desperdiciada mientras la gente pasa hambre |
| 4 | **The loop** | Un modelo mental | Describe → Check → Cook → Learn, cada uno con el artifact y el command |
| 5 | **Pick your path** | Rutear a cada visitante | Cinco tarjetas (sección 4), cada una con un primer éxito |
| 6 | **Proof** | Impulso y honestidad | Contadores en vivo desde `/v1/stats.json` (operations definidas, conformance vectors, schemas, recetas publicadas, idiomas); cada número etiquetado |
| 7 | **Safety** | Confianza | La seguridad es local; refusal; reglas del agente; recalls; enlace a /trust |
| 8 | **Works today** | Utilidad antes de los robots | Humanitarian Profile, ejemplo de SMS, simuladores |
| 9 | **Now / next / later** | Hoja de ruta honesta | De la sección 5 |
| 10 | **Open** | Neutral y para unirse | Licencias, camino de gobernanza, contribuir, GitHub |

### 6.3 Dirección de diseño
- **Sensación:** calmada, precisa, cálida. Un instrumento profesional con alma de cocina.
- **Tipo:** una grotesque precisa para la UI y una mono face para datos y código. Tipo de letra de visualización grande y ligera para el hero (tomando prestada la confianza de Figure), sin copiar su oscuridad cinematográfica.
- **Color:** papel y tinta neutros con un acento de calor (naranja brasa) que también marca los datos de temperatura. La paleta está validada para lectores con daltonismo, y se diseñan tanto temas claros como oscuros.
- **Imaginería:** manos reales y cocinas domésticas reales una vez que las tengamos, nunca robots de stock. Hasta entonces, los diagramas y la demo en vivo sostienen la página.
- **Movimiento:** un momento, el dry run paso a paso. Todo lo demás está estático.
- **Bilingüe desde el principio:** inglés y árabe (diseño de derecha a izquierda), luego otros.
- **Accesibilidad:** WCAG 2.2 AA; teclado; movimiento reducido; sin información solo por color.

### 6.4 Interactividad
1. dry run en el navegador (receta × dispositivo).
2. Explorador de la operation envelope: arrastra un trazo de temperatura y observa cuándo sale de "simmer".
3. Simuladores, con el protocolo encendido y apagado.
4. Visor de pasos de la receta: la oración de un paso, su JSON y su envelope lado a lado.
5. Later: un editor de recetas que valida mientras escribes.

---

## 7. Documentación

Organizado por el marco de trabajo Diátaxis, de modo que cada página tiene un solo trabajo:

| Tipo | Propósito | Páginas |
|---|---|---|
| **Tutoriales** | Aprender haciendo | Quickstart; Your first Cookwala recipe; Make a device Cookwala-ready; Add Cookwala to an agent; Run a food-rescue pilot with SMS |
| **Guías de cómo hacerlo** | Resolver una tarea | Dry-run a device; Sign and verify; Publish to the registry; Export logs to LeRobot or OpenTelemetry; Run the agent-safety benchmark; Report an incident; Issue a recall |
| **Referencia** | Consultar información | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vectors; CLI |
| **Explicación** | Entender el porqué | Why envelopes; safety is local; trust model; privacy; humanitarian design; critiques and responses; simulators and their limits |

**Ergonomía de la documentación:**
- navegación izquierda, búsqueda, "Copy page", "Edit on GitHub", enlaces previous/next;
- pestañas de lenguaje (Python / JavaScript / cURL / CLI);
- `llms.txt` y markdown por página para lectores de IA;
- una cheat sheet y una página de problemas comunes;
- un changelog con fechas.

---

## 8. API y SDK

| Entregable | Qué | Por qué |
|---|---|---|
| paquete Python `cookwala` | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (de `tools/`) | Un comando para el primer éxito |
| `@cookwala/sdk` (TypeScript) | Tipos generados de esquemas; cliente Core API; dry run en el navegador | Desarrolladores web y de agentes |
| Reference hub (Docker) | Core API con un dispositivo simulado y los límites de seguridad | El `curl` del quickstart funciona localmente; banco de pruebas para makers |
| servidor MCP | Herramientas: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | Cada agente con capacidad MCP puede usar Cookwala de forma segura |
| paquete ROS 2 | `cookwala_msgs` (acciones), un nodo puente hacia la Core API | Makers de robots |
| Exporters | LeRobot, OpenTelemetry (hecho) | Aprendizaje y observabilidad |
| Evals | benchmark promptfoo agent-safety (hecho) | Constructores de agentes, revisores de seguridad |
| Versionado | Semver para Core; paquete de esquemas con fecha; changelog; ventanas de deprecación | Promesa de estabilidad |
| Status | Página de estado pública para los endpoints de cookwala.ai | Confianza |

---

## 9. Demos

| Demo | Audiencia | Estado |
|---|---|---|
| In-browser dry run | Todos | Building now |
| Simuladores (hogar, ciudad, país, mundo) | Todos, financiadores | Live |
| Resultados de seguridad de agentes en todos los modelos | Constructores de agentes, laboratorios de IA | Next (ejecutar el benchmark, publicar resultados con método) |
| Recorrido de rescate de alimentos por SMS | Food banks | Next (demo grabada) |
| Un dispositivo real cocinando una receta de Cookwala, sin editar | Todos | Later (la demo más importante; necesita un socio de dispositivos) |
| "Cook in simulation" (Isaac Lab / Gazebo) | Investigadores de robótica | Later |

---

## 10. Comunidad y crecimiento

- **Red de contribuyentes** (inspirada en el Index de Figure):
  - Los *cocineros* registran sesiones consentidas de recetas que conocen, con crédito en cada receta y
    tarjeta de conjunto de datos.
  - Piloto de *cocinas y food banks*.
  - Los *fabricantes* implementan dispositivos.
  - Los *revisores* revisan rule packs y envelopes.
  - Los *traductores* traducen pasos y vocabulario.
  - Las contribuciones pagadas llegan later, financiadas por subvenciones. Nunca pague por datos sin consentimiento
    informado y términos justos.
- **Rituales:** llamada comunitaria mensual; "estado de Cookwala" trimestral con números reales;
  hilos de revisión pública.
- **Secuencia de asociación:** los primeros diez del rastreador de partes interesadas (food bank, WFP
  Innovation Accelerator, Home Assistant, una startup de dispositivos, un laboratorio universitario, un certificador,
  World Central Kitchen, una fundación, un hogar neutral, un creador).
- **Canales:** GitHub Discussions, un boletín informativo, charlas en conferencias (ROSCon, talleres de IROS/ICRA,
  eventos de food-tech), canales en lengua árabe.

---

## 11. Métricas

- **Métrica North-star:** *verified cooks*, el número de ejecuciones que ejecutaron una receta Cookwala firmada de principio a fin con un log conforme y consentido. Mientras eso sea cero, rastrear indicadores adelantados.

| Embudo | Métrica | Objetivo para 2027-03 |
|---|---|---|
| Atraer | Visitantes mensuales a /start | 2,000 |
| Activar | dry run completados (web + CLI) | 500 |
| Construir | Implementaciones de Core independientes que pasan la conformance | 2 |
| Adoptar | kg rescatados en piloto de food bank (measured) | Primer piloto de 6 meses en ejecución |
| Contribuir | Contribuidores externos con cambios fusionados | 15 |
| Confiar | Reseñas externas publicadas | 6 |
| Aprender | execution log con consentimiento | 1,000 |

---

## 12. Hoja de ruta

La hoja de ruta mantenida con un estado por elemento es [`ROADMAP.md`](ROADMAP.md). La tabla de abajo es el
plan original de 180 días, conservado para el registro.

| Cuándo | Sitio web e historia | Experiencia del desarrollador | Estándar y seguridad | Comunidad |
|---|---|---|---|---|
| **Now (este lanzamiento)** | Nueva página de inicio con live dry run, triad, paths, proof, now/next/later; visor de docs; `llms.txt`; páginas de confianza (security, governance) | Dry run; exportadores LeRobot y OTel; acciones de ROS 2; benchmark de agent-safety | Especificación de registry (namespaces, versiones, hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **Próximos 30 días** | /start quickstart; página de inicio en árabe; claims pass en todas las páginas | `pip install cookwala`; hub de referencia (Docker) | Primeros resultados de benchmark publicados | Nota conceptual para food bank; propuesta de Home Assistant |
| **60 días** | índice /recipes con fifi corpus (primeros 100 convertidos); /humanitarian | TS SDK; servidor MCP | Revisión de envelope por un científico de alimentos | Primera llamada de la comunidad |
| **90 días** | Whitepaper + resumen de 2 páginas; /roadmap | paquete de ROS 2 | Core 0.3 basado en el feedback del dispositivo | Socio de dispositivo, laboratorio universitario |
| **180 días** | Video de demo con dispositivo real | Editor de recetas | Análisis de brechas del certifier | Resultados del piloto; solicitud de fundación |

---

## 13. Riesgos para esta estrategia

| Riesgo | Mitigación |
|---|---|
| Un sitio pulido sobre una realidad delgada parece hype | Cada afirmación etiquetada; contadores en vivo de datos reales; now/next/later |
| Extenderse hacia demasiadas audiencias | Dos caminos primarios para los próximos 90 días: fabricantes de dispositivos y food banks. Otros son apoyados pero no perseguidos |
| Las grandes plataformas lanzan alternativas cerradas | Ser la capa neutral y verificable que pueden adoptar; asociarse con actores abiertos (Hugging Face, Open Robotics, Home Assistant) |
| Uso indebido de datos de contribuyentes | Consentimiento opt-in, revocable; sin datos personales; data cards publicadas |
| Ancho de banda del fundador | Lanzar la experiencia del desarrollador (package, hub) antes de más especificaciones; reclutar un co-maintainer |

