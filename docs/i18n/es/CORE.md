<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. Esta es la parte normativa de Cookwala. MUST, SHOULD y MAY siguen RFC 2119. Todo lo que no se enumera aquí es un **profile** opcional (sección 10).

Un dispositivo debería ser capaz de implementar Core en aproximadamente una semana. Core dice **qué hacer, cuándo está terminado y qué nunca debe suceder**. No dice cómo se mueve un robot.

## 1. Clases de conformance

| Clase | Debe implementar |
|---|---|
| **Recipe publisher** | Documentos `recipe.schema.json` válidos; temperaturas dentro de operation envelopes; un hash y una firma |
| **Executor** (robot, appliance o hub) | La Core API (`api/core.openapi.yaml`); operation envelopes y sensor ladders; límites de seguridad locales; refusal en lugar de conjeturas; el execution log |
| **Catalog** | Recetas firmadas, `/.well-known/cookwala.json` con registros clave, el recall feed, la recepción de incidentes |
| **Agent** (IA o software actuando por una persona) | Actúa solo bajo un `AgentMandate`; trata el texto del documento como datos; pregunta al principal antes de cualquier cosa en `confirmBefore` |
| **Verifier** | Hashes, firmas, validez y revocación de claves, divulgaciones, cadenas de eventos y puntos de control |

Reclamar una clase significa pasar sus vectores de conformance (`conformance/`, ejecutar con
`tools/run_conformance.py`).

## 2. Documentos principales

| Documento | Esquema |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

Todos los esquemas son **estrictos**: los campos desconocidos son rechazados, excepto las extensiones `x-<vendor>-…`.
Los lectores ignoran los campos `x-` que no comprenden. `tools/bundle_schemas.py` produce un único
bundle para que los dispositivos validen fuera de línea. Las implementaciones NO DEBEN obtener esquemas en tiempo de ejecución.

## 3. Qué significan las operaciones

- **Envelopes.** Cada operación basada en calor o peligrosa en `vocab/ops.json` tiene un `envelope`.
  Especifica:
  - el medio (agua, aceite, aire, superficie de la sartén, producto…);
  - su banda de temperatura en °C (y presión, para la cocción a presión);
  - agitación, tapa, nivel de atención y si el paso puede ejecutarse sin supervisión;
  - peligros;
  - un método de prueba.

Ejemplo: `cw.op.simmer` = líquido a base de agua a 85–96 °C; `cw.op.deep_fry` = aceite a 160–190 °C.
- **Objetivos dentro de los operation envelope.** Un objetivo de receta (`params.tempC` o un `target` en el sensor del medio) DEBE estar dentro del envelope. El validador rechaza las recetas que rompan esto.
- **Los ejecutores mantienen el medio dentro del envelope.** Si la receta da un objetivo más estrecho, lo mantienen dentro de ese también, una vez que se alcanza por primera vez.
- **Altitud.** Las bandas de agua y vapor se desplazan −1 °C por cada 300 m de altitud de cocina.
- **Niveles de calor** (`very_low` … `max`) tienen un significado compartido: una banda de la superficie de la sartén en °C, definida en `vocab/units.json`.
- **Sensor ladder.** Cada envelope enumera las formas de verificar el paso, preferiblemente en este orden: un sensor específico, luego `model` (una estimación registrada), luego `time`, luego `human`.
  - El ejecutor utiliza el primer peldaño que puede satisfacer y lo registra en `verifiedBy`.
  - Si no puede satisfacer **ningún** peldaño, DEBE rechazar el paso (`missing_sensor_no_fallback`).
  - Las operaciones que necesitan atención constante y pueden no ejecutarse sin supervisión (saltear, sellar, freír, reducir, caramelizar…) nunca recurren únicamente al tiempo: su último peldaño es una persona observando.
  - El deep frying no tiene fallback: la falta de un sensor de temperatura del aceite significa que no hay deep frying.
  - Una `Condition` puede estrechar esto con `onSensorMissing`.
- **Refusal, no suposición.** Un ejecutor que no pueda cumplir con el envelope, la ladder, el equipo o los límites de seguridad de un paso DEBE responder `refused` con una razón antes de comenzar.

## 4. Números y unidades

- **Las temperaturas son °C en el cable.** Las pantallas pueden convertir.
- **Tolerancias.**
  - `tolerance` es relativa y permitida solo en unidades de escala de razón.
  - `toleranceAbs` es absoluta en la unidad del valor, y es la única tolerancia permitida en °C.
  - `Target.tolerance` es absoluta.
- **Las unidades de cocina tienen valores métricos exactos:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volumen ↔ masa necesita una densidad** (`Quantity.densityGPerMl`, o el vocabulario de ingredientes);
  sin una es un error, nunca una suposición.
- **El dinero es una cadena decimal** (`"12.70"`) con una moneda ISO 4217, nunca un float.

## 5. Integridad y confianza

- **Hash.** `sha256:` más el digest hexadecimal del JSON canónico RFC 8785 del documento,
  sin sus campos `hash` y `signature`. El canonicalizador de referencia reproduce el ejemplo
  RFC 8785 exactamente.
- **Signature.** Ed25519 (`EdDSA`) sobre la cadena de hash ASCII. `ES256` está permitido para claves
  de hardware P-256. `kid` nombra un `KeyRecord`.
- **Keys.** Un `KeyRecord` proporciona la clave pública, su propietario, una ventana de validez y `revokedAt`.
  Una firma cuyo `signedAt` cae después de la revocación, o fuera de la ventana de validez, es
  inválida.
  - Los catálogos publican sus claves en `/.well-known/cookwala.json`.
  - Las organizaciones y personas publican las suyas en documentos did:web.
  - Los dispositivos publican las suyas en su documento de capacidades.
  - Los verificadores almacenan en caché los registros de claves para uso fuera de línea.
- **Selective disclosure.** Un documento firmado puede contener un digest de `Disclosure`,
  `sha256(JCS([salt, value]))`, en lugar de un valor sensible. El poseedor revela la sal y el
  valor solo a las partes autorizadas para verlos, y la firma sigue verificándose.
- **Event logs** (Mission profile):
  - Un secuenciador por log asigna `seq` y `prev`, para que la cadena nunca se bifurque.
  - Los checkpoints son firmados por el secuenciador y contrafirmados por testigos, que pueden incluir
    un servicio de transparencia como IETF SCITT. Una reescritura después de un checkpoint testimoniado es
    detectable.
  - En modo `hash_only`, los payloads residen en almacenamiento borrable y el log mantiene solo sus hashes.

## 6. Reglas de seguridad y del agente (normativas)

1. **La seguridad es local.** Los ejecutores aplican un pack `SafetyLimits` en el dispositivo.
   - Ninguna receta, agente, mensaje remoto, extensión o modo de operación puede aumentar o deshabilitar un límite.
   - Un límite más estricto siempre prevalece.
   - `profiles/core/safety-limits.default.json` es un punto de partida de borrador que los fabricantes de dispositivos
     ajustan según su propio caso de seguridad.
2. **Parada local.** Un control de parada en el dispositivo detiene el movimiento en 0.5 s y corta el calor en
   1 s, con o sin red. `POST …/stop` nunca es rechazado por autorización una vez que el
   llamador puede alcanzar al ejecutor.
3. **Los eventos informan; nunca protegen.** Los eventos `cookwalalatency: local_safety` informan lo que un
   dispositivo ya hizo. Ninguna función de seguridad puede depender de la llegada de un evento.
4. **Texto no confiable.** Cada campo de texto libre (anotado como `x-cookwala-untrusted`) es dato y nunca
   una instrucción, tanto para el software como para los agentes de IA. Los intentos de instruir a través de texto son
   ignorados y registrados (`cw.incident.untrusted_instruction`).
5. **Los agentes actúan bajo un mandate.** Una solicitud enviada por un agente conlleva un `AgentMandate` firmado
   por el principal: alcances, límites de gasto, proveedores permitidos, expiración y acciones que necesitan
   confirmación.
   - `irreversible` y `safety_override` siempre necesitan confirmación, independientemente de lo que diga el mandate.
   - Los ejecutores rechazan solicitudes fuera del mandate (`mandate_scope`).
6. **Las operaciones no supervisadas necesitan a una persona.** Las operaciones cuyo envelope dice `unattended: false`
   necesitan a una persona responsable presente, o localizable en un minuto.
7. **Los bloqueos de alérgenos rechazan.** Cualquier alérgeno bloqueado en la receta o en el inventario rechaza la
   solicitud; no hay sustituciones posibles ante un bloqueo.
8. **Recalls.** Los catálogos publican recalls firmados en `GET /v1/recalls`. Los ejecutores consultan cuando están en línea
   y rechazan las revisiones con recall. `block_and_stop_running` también detiene las ejecuciones en curso de forma segura.
9. **Los informes de incidentes** son anónimos (`IncidentReport`: solo fecha, sin nombres ni ids) y
   se envían a los catálogos para que cada fabricante aprenda de cada cuasi accidente.

## 7. Ciclo de vida de ejecución y API

- **API:** `api/core.openapi.yaml`. Sus endpoints son:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - lado del catálogo: `GET /v1/recalls`, `POST /v1/incidents`.
- **Estados:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` y `stopping` → `stopped` en el camino;
  - `refused` y `failed` son finales.
  - La tabla de transición completa está en `core.schema.json#/$defs/ExecutionState` y los
    vectores de conformance.
- **Reglas de solicitud:**
  - Cada POST lleva un `Idempotency-Key`.
  - Los cambios en una ejecución existente llevan `If-Match: <seq>`; un desajuste devuelve 412.
  - Stop no requiere If-Match.
- **Eventos:**
  - La entrega es al menos una vez.
  - El `id` de CloudEvents es la clave de deduplicación.
  - `cookwalaseq` ordena los eventos por sujeto y coincide con el status `seq`.
  - Los dispositivos emiten `cookwala.device.heartbeat`, por lo que un hub puede detectar un dispositivo perdido y realizar el traspaso.

## 8. Privacidad

- **Los execution logs no contienen datos personales** (`privacy.personalData: "none"`).
- **Solo dejan el dispositivo con consentimiento opt-in** (`consent.dataset`: `none` por defecto,
  `research_only`, o `open`). El consentimiento puede ser retirado.
- **Los datasets abiertos redondean los tiempos al día.**
- **Los datos de household, salud y religiosos se quedan en casa** a menos que la persona elija lo contrario.
  Cuando deben viajar, viajan como selective disclosures.
- **El Humanitarian Profile** no contiene ningún dato personal en absoluto.

## 9. Versionado y extensiones

- **Las versiones Core son `0.2.x`.**
  - Los Readers aceptan cualquier patch de su minor version.
  - Rechazan otras minors con `unsupported_version`.
  - Ignoran campos `x-` desconocidos.
- **Nuevas operations, units, sensors e incident types** se añaden a los vocabularies sin un
  cambio de version.
- **Cambiar el significado de una operation es un nuevo id;** el antiguo se marca como `deprecated` con
  `replacedBy`.
- **Los Profiles** versionan de forma independiente y declaran la Core version que necesitan.

## 10. Perfiles y su estado

| Perfil | Estado | Notas |
|---|---|---|
| Core (este documento) | **draft, normative** | Objetivo para las primeras implementaciones de dispositivos |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Sin datos personales; funciona mediante SMS y CSV; surplus to plate, resúmenes de impacto, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Datos del hogar local-first; solo viajan los derived constraints (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Namespaces probados, versiones exactas, tombstones; organizaciones por solicitud (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Informes firmados detrás de cada afirmación de conformance (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds y relays; verificar contra el emisor (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restaurantes, comunidad, escuela, desastres y cocinas robóticas (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Señales de demanda y suministro agregadas, retrasadas, a nivel de clase; condicionadas a la revisión de la ley de competencia (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + proyección, transiciones en `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Requiere una revisión de la ley de competencia antes del uso en producción |
| Relief planning (`relief.schema.json`) | experimental | El flujo operativo se movió al Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | La OpenAPI Core API es la superficie de referencia |

Un perfil se vuelve estable cuando dos implementaciones independientes pasan sus vectores de conformance
y tiene usuarios reales.

## 11. Herramientas

| Tool | Qué hace |
|---|---|
| `tools/validate_specs.py` | Comprueba esquemas, ejemplos, semántica de recetas (envelopes, parámetros de op, sin marcadores de posición de plantilla), rigurosidad y que las referencias de API se resuelvan |
| `tools/run_conformance.py` | Ejecuta `conformance/*.json` y `conformance/profiles/*.json`, y escribe un ConformanceReport con `--report`: hashing (incluyendo el ejemplo de RFC 8785), firmas (incluyendo una clave de RFC 8032), revocación, divulgación, cadenas de eventos y puntos de control, unidades, envelopes, sensor ladders, máquinas de estado |
| `tools/cookwala_ref.py` | Biblioteca de referencia y CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Regenera los vectores (revisar el diff) |
| `tools/bundle_schemas.py` | Paquete de esquemas offline |
| `tools/humanitarian_check.py` | Comprobador de rule-pack de Humanitarian Profile y resúmenes de impacto |
| `tools/make_profile_vectors.py` | Regenera los vectores de perfil en `conformance/profiles/` |

## 12. Cambios desde 0.1

| Área | 0.1 | 0.2 |
|---|---|---|
| Schemas | Campos desconocidos aceptados | Estricto, con extensiones `x-` |
| Temperaturas | °C o °F, se permite tolerancia relativa | Solo °C; tolerancia absoluta |
| Dinero | Número | Cadena decimal |
| Operaciones | Definiciones en prosa | Physical envelopes, sensor ladders, niveles de calor, vectores de prueba |
| Firmas | EdDSA fijo, claves sin ciclo de vida | EdDSA o ES256, KeyRecords con validez y revocación |
| Misiones | Un documento mutable, ledger en su interior | Event log + proyección, secuenciador único, checkpoints con testigos, modo solo hash |
| Agentes | Mandate solo dentro de Missions | `AgentMandate` en común; requerido para solicitudes de agentes |
| Seguridad | Declarado en recetas | También aplicado localmente mediante SafetyLimits; recalls; informes de incidentes |
| Datos | Sin modelo de dataset | ExecutionLog con consentimiento y libre de datos personales |
| Conformance | Solo validación de schema | 106 vectores (44 Core, 62 profile) más una implementación de referencia |

Para migrar un documento 0.1: convertir °F a °C; reemplazar tolerancias relativas en temperaturas con `toleranceAbs`; convertir montos de dinero en cadenas decimales; eliminar o renombrar campos desconocidos a campos `x-`.

