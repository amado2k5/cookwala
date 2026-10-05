<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->

# Federación: cómo Cookwala funciona sin un centro

**Status:** draft, 2026-10-04 (RFC-0006). La foto del fundador era una colmena: sin un comando central, pero con armonía y recuperación. Esta página dice lo que eso significa en la práctica.

## 1. Nodos

| Nodo | Qué sirve | Quién ejecuta uno |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recetas, vocabularios, rule packs, claves, feeds | un editor de recetas, una red de food bank, una universidad, un fabricante de dispositivos, cookwala.ai |
| **Registry** | `/v1/registry.json`: punteros a catalogs, collections, devices, packs, benchmarks | cualquiera; cookwala.ai ejecuta uno |
| **Hub** | la Core API para una cocina, límites de seguridad locales, el household context | cada cocina; funciona offline |
| **Mirror** | republica los elementos firmados de otros nodos sin cambios | cualquiera que quiera resiliencia en su región |

Una carpeta estática es un catálogo válido. Un teléfono con las plantillas CSV es un participante humanitario válido en el nivel H0.

## 2. Feeds, no comandos

Los nodos publican feeds firmados: recalls, incidentes anónimos, cambios en el registry, registros clave.
Otros nodos consultan lo que confían y pueden republicarlo. Nada se envía a una cocina; una
cocina consulta cuando está en línea y sigue trabajando cuando no lo está.

## 3. Verificar contra el emisor, nunca contra el relay

Un recall que llega a través de un mirror es tan bueno como la firma del **issuer**. Un hub resuelve el `KeyRecord` del issuer desde el propio documento de descubrimiento del issuer o did:web y verifica el cuerpo byte por byte. La clave del mirror no prueba nada sobre el contenido; un mirror que edita un recall rompe la firma. Los vectores de perfil en `conformance/profiles/federation.json` muestran los tres casos.

## 4. Listas de confianza

Cada hub mantiene una lista de catálogos y registries en los que confía, con sus claves y una prioridad. Un nodo puede sugerir pares (`federation.peers`); el hub decide. cookwala.ai es una entrada en dicha lista, no una raíz.

## 5. Frescura

Las entradas del registry llevan un status y un tiempo de publicación; los recalls llevan un tiempo de emisión; los facets de household llevan una validez. Los elementos obsoletos se vuelven a consultar o se descartan. Nada se considera confiable por ser antiguo, nada se elimina silenciosamente: las entradas retiradas permanecen como tombstones.

## 6. Historia

Los registros de eventos con puntos de control presenciados (sección 5 de Core) hacen que las reescrituras sean detectables sin una
blockchain: una segunda parte refirma la cabecera del registro, y una reescritura later ya no
coincide. El anclaje público de las cabeceras de los puntos de control es opcional y es una decisión de los fundadores
(`docs/research/BACKSTORY.md` sección 4.7).

## 7. Tres nodos que interoperan

- **Una red de food bank** gestiona un registry de sus cocinas y donantes, un catálogo de sus rule packs adaptados a la ley nacional, y una pasarela SMS. Se lista en el directory de cookwala.ai o no; sus datos nunca tienen que salir de su país.
- **Un fabricante de dispositivos** gestiona un catálogo de sus documentos de capacidad y packs de límites de seguridad, publica informes de conformance, y consulta los feeds de recall de los catálogos que sus clientes utilizan.
- **Un laboratorio universitario** gestiona un catálogo de recetas de referencia y execution logs (con consentimiento), refleja los vocabularios, y publica sus propios vectores.

Ninguno de ellos necesita que cookwala.ai esté en línea.

## 8. Lo que no está construido

Un orquestador central, un proveedor de identidad central, un token, una blockchain. Las decisiones de quórum del perfil de la Misión y los orquestadores permanecen opcionales y experimentales.

