<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Perfil Humanitario de Cookwala (borrador 0.2)

**Status:** borrador para revisión por parte de food banks, programas de ayuda y profesionales de la seguridad alimentaria y la nutrición. No ha sido revisado ni respaldado por WFP, WHO, FAO, the Global FoodBanking Network ni ninguna otra organización mencionada aquí.

**Files:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (todos), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; todos los borradores esperando revisión profesional, ver [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank en El Cairo, school meals, disaster kitchen, robot kitchen), cada uno con un `ImpactSummary` computado
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Lo que añade 0.2 (RFC-0003, RFC-0004)

Aditivo sobre 0.1; los lectores aceptan ambos.

- **De la granja al plato:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) e `Item.harvestedAt`; roles `farm`, `caterer`, `robot_kitchen`; la palabra SMS `FARM`.
- **Reglas de cuidado:** `Item.foodClasses` y `Distribution.menu.foodClasses` (huevo crudo, lácteos no pasteurizados, frutos secos enteros, arroz cocido…), tipo de regla `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; tres nuevos draft packs.
- **Revisiones:** `RulePack.reviews` registra la profesión, organización, fecha, alcance y resultado de cada revisión; `status: reviewed` requiere una revisión aprobada.
- **Impacto:** `ImpactSummary` con nueve medidas, cada una con su `method` (measured, modelled, assumed, not recorded), computado por `tools/humanitarian_check.py --summary`.
- **Tiempo para reclamar:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` para que los kilogramos rescatados se cuenten una sola vez.
- **Tipos de programa** en el `Manifest`.

## 1. Propósito

Una pequeña, estricta y libre de datos personales parte de Cookwala para organizaciones que alimentan a personas:
food banks, comedores comunitarios, programas de comidas escolares, programas de ayuda, donantes (tiendas de comestibles,
restaurantes, granjas, servicios de catering), transportistas y almacenes frigoríficos. Cubre cuatro trabajos:

1. **Ofrecer surplus food** y reclamarla, de forma rápida y justa.
2. **Registrar cada handover** de custodia, con un control de temperatura (control de la cadena de frío).
3. **Informar sobre lo que se sirvió** únicamente como recuentos agregados.
4. **Comprobar los menús y handovers** frente a reglas de nutrición y seguridad alimentaria legibles por máquina.

**Funciona sin robots, apps o internet.** Los niveles H0 y H1 se ejecutan en hojas de cálculo, SMS
y teléfonos básicos. Los robots, hubs y agentes son consumidores opcionales de los mismos documentos.

## 2. Principios

- **No hacer daño.** No recopile nada que pueda identificar, localizar o perfilar a una persona o
  hogar. En entornos frágiles, los datos sobre los beneficiarios representan un riesgo de protección.
- **Principios humanitarios** (humanidad, neutralidad, imparcialidad, independencia): sin
  marcas comerciales en la ayuda, y sin uso de datos para marketing.
- **Estricto y pequeño.** Cada objeto rechaza campos desconocidos (excepto extensiones `x-`),
  por lo que los errores tipográficos y los campos personales adicionales fallan la validación.
- **Unidades exactas:** kilogramos, grados Celsius, tolerancias absolutas y dinero como cadenas decimales.
- **Las reglas locales prevalecen.** Los rule packs son reemplazables por la ley nacional de seguridad alimentaria y de donaciones.
- **Abierto:** especificación libre de regalías, herramientas de código abierto. El perfil está diseñado para cumplir con el Digital Public Goods Standard y los Principles for Digital Development.

## 3. Niveles de conformance

| Nivel | Lo que hace un participante | Necesidades |
|---|---|---|
| **H0 — Papel y SMS** | Registra ofertas, entregas y distribuciones en las plantillas CSV (con filas de hashtag HXL) o por SMS (sección 8.3) | Una hoja de cálculo o un teléfono básico |
| **H1 — Rescate** | Intercambia documentos `Offer`, `Claim`, `Handover` y `Distribution` a través de la API; sigue la máquina de estados (sección 5) | Cualquier cliente HTTP |
| **H2 — Seguridad y nutrición** | Aplica un `RulePack` a cada entrega y menú, y registra `findings` | El verificador de referencia o un equivalente |
| **H3 — Interoperabilidad** | Exporta agregados a HXL, DHIS2 y el `ImpactReport` principal de Cookwala; utiliza identificadores GS1 | Trabajo de integración |

Un participante publica un `Manifest` en `/.well-known/cookwala-humanitarian.json` que
declara sus niveles, rule packs, endpoints y `personalData: "none"`.

## 4. Documentos

| Documento | Quién lo escribe | Propósito |
|---|---|---|
| `Offer` | Donante | Surplus de alimentos disponible para recolección: artículos (kg, almacenamiento, marcas de fecha, alérgenos), ventana, sitio, temperaturas |
| `Claim` | Food bank, cocina, programa | Reclama todo o parte de una `Offer`, con un tiempo de recogida y tipo de vehículo |
| `Handover` | Receptor de la custodia | Uno por tramo: temperaturas, kg aceptados o rechazados con un código de motivo, y hallazgos de las reglas |
| `Distribution` | Cocina, food bank, escuela | Agrega comidas y personas servidas en un sitio en un día; nutrientes y costos del menú opcionales |
| `RulePack` | Programa o autoridad | Reglas de nutrición y seguridad alimentaria versionadas (sección 6) |
| `Manifest` | Cada participante | Capacidades y declaración de protección de datos |

Los documentos principales de Cookwala (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` en `relief.schema.json`) permanecen disponibles para la planificación. Este perfil gestiona
el flujo operativo.

## 5. Ciclo de vida de la oferta

| De | Estados `next` permitidos |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (el reclamo expiró), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | ninguno (final) |

**Reglas para los cambios de estado:**

- Cada cambio incrementa `version`. Los escritores envían `If-Match: <version>`; un desajuste devuelve
  **409**, y el escritor vuelve a leer y reintenta.
- Una transición ilegal devuelve **409** con las transiciones permitidas.
- Las ofertas pasan a `expired` automáticamente en `window.to`.
- Las reclamaciones caducan en `pickupBy` más un periodo de gracia que el programa establece (por defecto 30 minutos).

**Reclamación justa.** Por defecto, las reclamaciones se asignan por orden de llegada dentro de un nivel de prioridad que establece el programa:
por ejemplo, cocinas que sirven a niños primero, luego otras cocinas, luego food banks. Los niveles y
cualquier regla de rotación deben publicarse en el `Manifest` del programa o en su sitio web.

## 6. rule packs de seguridad alimentaria y nutrición

Un `RulePack` contiene reglas de seis tipos:

- `temperature`: refrigerado ≤ 5 °C, caliente ≥ 60 °C, congelado ≤ −18 °C;
- `time`: alimentos cocinados fuera de control de temperatura por un máximo de 2 h;
- `date_mark`: los bloques de fecha de caducidad advierten, los de consumo preferente avisan;
- `allergen`: bloque de alérgenos no declarados;
- `nutrient`: cantidades por persona-día o por comida;
- `energy_share`: proporción de energía proveniente de azúcares libres, grasa, grasa saturada, grasa trans o proteína.

Cada regla es ya sea `block` (no aceptar ni servir) o `warn` (permitido, registrado como un finding).

El pack por defecto `who-codex-basic@0.1.0` es un **borrador derivado de orientación pública**: la orientación de la OMS sobre dieta saludable, sodio, azúcares y grasas, las Cinco Claves para la Inocuidad de los Alimentos de la OMS, los códigos de etiquetado y de alimentos congelados del Codex, y las cifras de planificación de raciones mínimas de Sphere. Es simplificado, no es asesoramiento médico, excluye la alimentación infantil y terapéutica, y debe ser revisado por personal cualificado. Los programas deben copiarlo y adaptarlo, establecer `jurisdiction` y registrar quién lo revisó en `reviewedBy`.

Los receptores en el nivel H2 ejecutan el pack en cada handover y en cada menú, y registran los rule ids en `findings`. El verificador de referencia informa dónde los findings declarados y computados no coinciden.

## 7. Protección de datos

**El perfil no contiene datos personales. Los documentos NO DEBEN contener:**

- nombres, números de teléfono, correos electrónicos o identificadores nacionales, de refugiados o biométricos de cualquier persona;
- registros a nivel de household, o ubicaciones de hogares o individuos;
- salud, discapacidad, religión o nacionalidad de cualquier persona.

**Lo que transporta en su lugar:**

- **Solo organizaciones.** Cada parte es una organización identificada por `did:web`, un GS1
  Global Location Number (GLN) o un registry id. Las personas aparecen solo como roles
  (`checkedBy: "trained_staff"`).
- **Solo agregados.** `Distribution.people` contiene recuentos por grupo, y cualquier recuento inferior a 10
  se reporta como `"<10"`.
- **Solo sitios.** Un `Site` son las instalaciones de una organización o un área administrativa
  (OCHA P-codes), nunca un household.
- **Notas cortas.** El texto libre se limita a notas operativas de 280 caracteres y no debe
  contener datos personales. Las implementaciones deben escanear las notas en busca de números de teléfono e ids
  antes de almacenarlos.

**Retención y auditoría:**

- **Retención:** cada participante declara `retentionDays` en su `Manifest` y elimina
  documentos después de este.
- **Auditoría (opcional, `hash_only`):** un secuenciador por programa (normalmente el food bank o
  el operador del programa) añade el hash SHA-256 del JSON canónico RFC 8785 de cada documento.
  Los contenidos se almacenan por separado y siguen siendo eliminables. Una organización
  socia refirma un punto de control cada día, para que el historial no pueda ser reescrito silenciosamente. Un único
  secuenciador evita bifurcaciones en la cadena.
- **Hosting** debe ser en el país donde la ley o el programa lo requiera.

## 8. Transporte

### 8.1 API (nivel H1)

| Método | Ruta | Notas |
|---|---|---|
| `POST` | `/offers` | Crea una oferta (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Ofertas abiertas cerca de un receptor |
| `POST` | `/offers/{id}/claims` | Reclama una oferta; `If-Match` requerido; 409 cuando ya ha sido reclamada |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` requerido |
| `POST` | `/handovers` | Registra una entrega |
| `POST` | `/distributions` | Registra una distribución |
| `GET` | `/reports?from=…&to=…` | Agrega para un periodo |

Reglas de solicitud y transporte:

- **Idempotencia:** cada `POST` lleva un `Idempotency-Key`. Los servidores guardan las claves durante al menos 24 h y devuelven la respuesta original para las repeticiones.
- **Autenticación:** credenciales de cliente OAuth 2.1, un cliente por organización.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  se entregan al menos una vez, con un `id` de evento para la deduplicación y un número de secuencia por oferta para el ordenamiento.

### 8.2 Hojas de cálculo (nivel H0)

Utilice las plantillas CSV en `profiles/humanitarian/templates/`. Su segunda fila contiene hashtags de [HXL](https://hxlstandard.org), para que las herramientas de datos humanitarios puedan leerlas directamente.

### 8.3 SMS (nivel H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

La gramática se implementa en `tools/cookwala_ref.py` (`parse_sms`) y se prueba mediante
`conformance/profiles/sms.json`. Las palabras clave están en inglés; se aceptan dígitos
árabe-indios (٠-٩) y persas (۰-۹) dondequiera que haya un dígito, por lo que funciona cualquier teléfono configurado con cualquiera de los dos teclados.

Códigos de almacenamiento: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Marcas de fecha: `UB` use-by,
`BB` best-before, `HV` harvested, como `DDMM`. Códigos de motivo de rechazo: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; cualquier otra palabra se registra como `other`. La respuesta `HELP` DEBE ser un ejemplo por comando, ASCII plano, de menos de 160 caracteres.

Una puerta de enlace DEBE aplicar estas comprobaciones antes de escribir un documento (`sms_storage_findings` en la referencia; los ids son hallazgos de bloque):

| Hallazgo | Cuándo |
|---|---|
| `safety.temp_not_recorded` | un `HAND` en una línea refrigerada, congelada o de mantenimiento en caliente no tiene lectura `T`: responder solicitándola, no escribir nada |
| `safety.hot_hold_min` | un `OFFER` con almacenamiento `H` por debajo de 60 °C: negarse a listarlo |
| `safety.storage_class_mismatch` | las palabras del artículo implican lácteos, carne, aves, pescado, huevo o comida cocinada y el almacenamiento es `A`: negarse a listarlo |
| `safety.chilled_max`, `safety.frozen_max` | lecturas por encima de 5 °C o por encima de −18 °C en oferta o entrega |

Las ofertas de comida caliente se cierran después de dos horas (una hora para el arroz cocido); un gateway nunca almacena una lectura de marcador de posición. El gateway mapea el número registrado del remitente a una organización, nunca a una persona en los documentos.

## 9. Interoperabilidad

| Sistema | Mapeo |
|---|---|
| HXL | Plantillas CSV; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (productos); `Site.gln` y `OrgId` `gln:` (ubicaciones) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Valores de datos agregados por sitio y periodo desde `Distribution` (comidas, personas por grupo, kg, incidentes) |
| WFP SCOPE y otros sistemas de beneficiarios | **Solo agregados.** Ningún registro de beneficiario entra o sale de este perfil |
| Food-rescue apps | Los adaptadores mapean sus listados a `Offer` y sus recolecciones a `Claim` y `Handover` |
| Core Cookwala | `Item.ingredientId` y `menu.recipes` se vinculan al índice de recetas; `relief.ImpactReport` suma los `Distribution`s |

## 10. Métricas piloto (definidas para que los sitios puedan compararse)

Calculado en un `ImpactSummary` por `python tools/humanitarian_check.py --summary DIR`. Cómo se ejecuta y se juzga un piloto: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Métrica | Definición |
|---|---|
| Kg rescatados | Suma de `Handover.kgAccepted` en el primer tramo desde los donantes |
| Tasa de reclamación | Ofertas que alcanzan `claimed` ÷ ofertas creadas |
| Tiempo para reclamar | Mediana de minutos desde la creación de `Offer` hasta el estado `claimed` |
| Rechazo por motivo | Suma de `kgRejected` por `reason` |
| Comidas servidas | Suma de `Distribution.meals` |
| Tasa de aprobación nutricional | Distribuciones con menús y sin hallazgos `nutrition.*` ÷ distribuciones con menús |
| Costo por comida | (comida + transporte + personal + energía) ÷ comidas |
| Minutos de voluntariado por cada 100 kg | `volunteerMinutes` ÷ (kg usados ÷ 100) |
| Seguridad | Recuento de hallazgos en el bloque `safety.*`, y `safetyIncidents` |

## 11. Seguridad

- **Las firmas son opcionales en H1** y obligatorias para la auditoría entre organizaciones en H3
  (EdDSA, claves publicadas en el `did:web` de la organización).
- **Las notas y nombres en los documentos son datos no confiables.** El software y los agentes de IA nunca deben
  tratarlos como instrucciones.
- **Los rule packs están versionados y fijados** (`id@version`) en cada hallazgo, para que los resultados sean
  reproducibles.

## 12. Dejado fuera deliberadamente

- Registro de beneficiarios, elegibilidad y focalización (estos pertenecen a los propios
  sistemas protegidos del programa).
- Pagos: Cookwala nunca mueve dinero.
- Recetas y ejecución del robot (la especificación principal). El perfil solo nombra recetas e informa
  nutrientes.
- Nutrición médica y terapéutica.

## 13. Cómo revisar

Por favor, abre issues en [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
con la etiqueta `humanitarian`. Estas revisiones son las más útiles:

- personal de seguridad alimentaria revisando el rule pack y los motivos de rechazo;
- operadores de food-bank revisando el ciclo de vida y el flujo de SMS;
- oficiales de protección de datos revisando la sección 7.

