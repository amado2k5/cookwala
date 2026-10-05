<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# Excedente agrícola y señales de suministro

> **Estado: experimental** (RFC-0007). Esquema: `schemas/supply.schema.json`. Ejemplos:
> `examples/supply/`. **Puerta:** revisión de derecho de la competencia antes de cualquier uso de producción
> (`docs/ACTION-PLAN.md`, preocupación C7). cookwala.ai no publica ninguna señal hoy.

## 1. Dos cosas que los agricultores necesitan now

1. **Una forma de listar un excedente antes de que se pudra.** Una granja es un donante en el Humanitarian Profile:
   un `Offer` con `Item.origin: farm` y `harvestedAt`, o por SMS:

   FARM 120KG TOMATO A BB0411

El food bank lo reclama, una cocina lo cocina, la distribución lo cuenta. Sin nuevos documentos,
   sin datos personales, solo organizaciones.
2. **Una señal justa de lo que será necesario.** Esa es la parte experimental de abajo.

## 2. Señales de demanda y oferta

| Documento | Dice | Reglas |
|---|---|---|
| `DemandSignal` | En la región R, en la semana ISO W, las cocinas y programas planearon usar entre L y H kg de ingrediente de **clase** C | al menos 20 fuentes contribuyentes; publicado al menos 7 días después de que termine la semana; nivel de clase (legumbre, verdura de hoja, ave), nunca un producto o marca; **sin precios**; región no más fina que admin1 a menos que sean 100 fuentes o más |
| `SupplySignal` | En la región R, en la semana W, la clase C tiene exceso, suministro normal o escaso, con una ventana de cosecha | publicado por una cooperativa, programa u operador de mercado; **abierto a todos**: público, gratuito, idéntico para cada lector |

La comprobación de referencia es `check_signal()` en `tools/cookwala_ref.py`; los vectores de perfil (`conformance/profiles/signal.json`) muestran lo que es aceptado y rechazado.

## 3. Por qué estas reglas

Compartir pronósticos entre competidores es el intercambio de información sobre el que las autoridades de competencia advierten. La agregación, el retraso, el nivel de clase, la ausencia de precios y la publicación abierta mantienen la señal útil para la planificación e inútil para coordinar precios. Los umbrales son puntos de partida; un asesor y un estadístico deberían establecerlos.

## 4. En qué se convierte la idea del fundador

El bucle de macro (RFC-0007): cocción planificada → demanda agregada →
las granjas y tiendas planifican la necesidad → menos cultivado, trasladado y desechado. Los simuladores de la ciudad, el país y el
mundo muestran el tamaño del efecto bajo sus supuestos (ilustrativo, no un
pronóstico). Estos dos documentos son el paso honesto más pequeño hacia ello.

## 5. Later

Consejos de siembra a partir de la demanda futura; dimensionamiento de reservas (una cadena de suministro perfectamente ajustada es frágil); flujos de alivio entre regiones; señales de suministro por SMS de las cooperativas.

