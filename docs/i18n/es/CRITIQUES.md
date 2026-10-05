<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# Críticas que publicamos

Hicimos preguntas difíciles sobre Cookwala y escribimos las respuestas. Cada inquietud tiene un id
en el [action plan's concern register](ACTION-PLAN.md#2-concern-register), junto con nuestra
respuesta y su status. Las revisiones externas son bienvenidas y se enumerarán aquí.

## ¿Va a funcionar esto? (strategy)

| Preocupación | Respuesta corta | Estado |
|---|---|---|
| El mercado aún no existe; la especificación va por delante de los productos | Small Core, demo primero, sin nueva especificación sin usuarios | Core 0.2 terminado; demo de dispositivo next |
| Nadie con poder tiene una razón para adoptar | Liderar con el beneficio de cada adoptante; útil sin robots | Se buscan piloto de food bank y socio de dispositivo |
| Los simuladores prueban lo que asumen | Línea base justa, rangos, etiquetas "illustrative"; los pilotos los reemplazan | Open |
| El hambre se trata de pobreza y conflicto, no de surplus | Cookwala contribuye; no pretende acabar con el hambre por sí solo | Mensaje cambiado |
| Seguridad, responsabilidad y superficie de ataque | Límites aplicados en el dispositivo; refusal; recalls; informes de incidentes | Especificación terminada; revisión de certifier open |
| Privacidad (datos de salud y religión, ledgers vs borrado) | Local-first, divulgación selectiva, logs de solo hash, consentimiento | Especificación terminada; evaluación de impacto open |
| Demasiado complejo | Core 0.2; todo lo demás marcado como experimental | Done |
| Dependencia del fundador | Camino de gobernanza hacia un hogar neutral | GOVERNANCE.md |

## ¿Es sólido el diseño técnico?

| Preocupación | Qué cambió en Core 0.2 |
|---|---|
| Las operaciones no tenían significado físico | Envelopes, niveles de calor, sensor ladders, regla de altitud, vectores de prueba |
| Errores de unidades y números | Solo °C, tolerancias absolutas, unidades de cocina, densidades, dinero decimal |
| Los esquemas aceptaban errores tipográficos | Esquemas estrictos con extensiones `x-`; bundle offline |
| Un documento Mission mutable | Event log + proyección, secuenciador único, tabla de transiciones |
| El libro mayor aportaba poco | Registros clave con revocación, checkpoints testimoniados, detección de reescritura |
| Entrega de eventos no definida; seguridad en el bus | Números de secuencia, clases de latencia, heartbeats, "la seguridad es local" |
| Deriva en las superficies de la API | Core OpenAPI; cada referencia verificada en CI |
| Sin verificador | Biblioteca de referencia y 106 vectores de conformance |

## Reseñas que estamos solicitando

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), científicos de alimentos
(envelopes), oficiales de seguridad alimentaria y dietistas (rule packs), una auditoría de seguridad, una
revisión de protección de datos y un análisis de brechas de un certificador. Consulte el
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

