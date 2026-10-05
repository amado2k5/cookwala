<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->

# Impacto: lo que Cookwala puede cambiar, con fuentes y etiquetas

**Status:** 2026-10-04. Cada número a continuación está etiquetado como **measured** (contado o reportado por
la fuente nombrada), **modelled** (producido por nuestros simuladores bajo supuestos declarados) o
**assumed** (una cifra de planificación). Nada aquí es un resultado de Cookwala en el campo: ningún piloto
se ha ejecutado. Esta página establece el tamaño de los problemas y los mecanismos mediante los cuales Cookwala
contribuye.

## 1. Hambre

| Hecho | Cifra | Etiqueta y fuente |
|---|---|---|
| Personas que enfrentaron hambre en 2023 | cerca de 733 millones | measured por la fuente: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| Personas con inseguridad alimentaria moderada o grave en 2023 | cerca de 2.3 billion | measured por la fuente: SOFI 2024 |
| Alimentos perdidos entre la cosecha y la venta al por menor | cerca de 14 % de los alimentos producidos | measured por la fuente: FAO, *The State of Food and Agriculture 2019* (UNEP redondea la misma cifra a 13 %) |
| Alimentos desperdiciados en la venta al por menor, servicios de alimentación y households en 2022 | cerca de 1.05 billion toneladas; cerca de 132 kg por persona; cerca de 79 kg por persona en households | measured por la fuente: UNEP, *Food Waste Index Report 2024* |

**Mecanismos de Cookwala:** ofertas de surplus que llegan a una cocina antes de que el alimento se eche a perder, con un control de la cadena de frío en cada entrega (Humanitarian Profile); impacto contado de la misma manera en cada sitio para que los programas puedan comparar y mejorar; later, señales agregadas de demanda y oferta para que se cultive y se mueva menos para ser desechado (experimental, sujeto a revisión de leyes de competencia). **Lo que no hace:** abordar la pobreza, el conflicto, los choques climáticos, los precios o la política, que impulsan la mayor parte del hambre.

**Modelled, ilustrativo, no un pronóstico:** los rescates del despliegue mixto del simulador del país equivalen a aproximadamente el 4.7 % de lo que su población ficticia con inseguridad alimentaria necesita; el escenario "protocolo, sin robots" del simulador mundial alcanza a unos 40 millones de aproximadamente 770 millones (la línea de base assumed del simulador, un redondeo de los 733 millones measured anteriormente) de personas con hambre solo mediante el rescate. Ambos dicen lo mismo: el rescate importa y no es suficiente.

## 2. Salud

| Hecho | Cifra | Etiqueta y fuente |
|---|---|---|
| Enfermedades por alimentos inseguros cada año | cerca de 600 millones; cerca de 420,000 muertes | measured por la fuente: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Ingesta de sal frente a la directriz | la mayoría de las personas consumen de 9 a 12 g de sal al día; la WHO recomienda menos de 5 g (2 g de sodio) | measured por la fuente: WHO fact sheet on salt reduction |
| Muertes atribuibles al alto contenido de sodio cada año | cerca de 1.9 millones | measured por la fuente: WHO, *Global report on sodium intake reduction* (2023) |
| Personas que dependen de combustibles de cocina contaminantes | cerca de 2.1 mil millones; cerca de 3.2 millones de muertes al año por contaminación del aire en el household context | measured por la fuente: WHO fact sheet on household air pollution (2024) |

**Mecanismos de Cookwala:** puntos de control críticos y límites de mantenimiento en caliente, enfriamiento y recalentamiento aplicados en el dispositivo y registrados; rule packs que señalan el sodio, azúcares libres, grasas saturadas y frutas y verduras en los menús; reglas de cuidado para niños, embarazo y adultos mayores; un registro de revisión para que dietistas y oficiales de seguridad alimentaria puedan avalar un pack.
**Lo que no hace:** diagnosticar, tratar o computar dietas terapéuticas; ver `docs/health/CLAIMS-POLICY.md`.

**Cocina limpia** está en la imagen pero no en el modelo: los simuladores aún no cuentan la cocina con leña y carbón o sus efectos en la salud (listado como una limitación; next).

## 3. Entorno

| Hecho | Cifra | Etiqueta y fuente |
|---|---|---|
| Cuota de las emisiones globales de gases de efecto invernadero derivadas de la pérdida y el desperdicio de alimentos | alrededor de 8 a 10 % | measured por la fuente: UNEP, *Food Waste Index Report 2024* |

**Modelled, illustrative:** en el simulador del mundo, "many robots with the protocol" reduce toda la
comida perdida o desperdiciada en aproximadamente un 4.1 % y las emisiones en aproximadamente un 5.2 % durante cinco años frente al
mismo mundo sin ellos; "many robots alone" reduce los residuos del household pero aumenta las pérdidas antes de
llegar a los hogares en aproximadamente un 3 % (un efecto látigo). La electricidad de los robots (aproximadamente 164 TWh durante cinco años en
ese escenario) se contabiliza. Estos son los resultados del modelo bajo sus assumptions, enumerados en
cada página del simulador.

## 4. Economía y trabajo

**Assumed and modelled:** el simulador de la ciudad estima unos 5 USD por persona al mes
menos de gasto en comida y unas 10 horas por hogar al mes menos de cocina y compras con robots
de cocina, hardware no incluido. No se proporciona ninguna cifra para empleos en ninguna parte; se nombran nuevos roles
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) sin
números.

## 5. Cultura

Sin número. La afirmación es cualitativa y verificable: una receta de Cookwala lleva el nombre del cocinero, la identidad del plato (qué es esencial, qué es flexible, qué nunca se añade), texto en el idioma del cocinero y una firma. Las máquinas que lo cocinan heredan la receta como conocimiento práctico, con crédito.

## 6. Qué mediremos cuando haya algo que medir

| Medida | Método | Dónde se define |
|---|---|---|
| Kilogramos rescatados, comidas servidas, personas alcanzadas, tasa de aprobación de nutrición, costo por comida, tiempo para reclamar, tasa de reclamo, hallazgos de bloqueos de seguridad, incidentes de seguridad | computado a partir de documentos de Offer, Claim, Handover y Distribution | Sección 10 de Humanitarian Profile; `ImpactSummary` |
| Cocineros verificados: ejecuciones que ejecutaron una receta firmada de extremo a extremo con un log de conformance | execution logs con consentimiento | sección 11 de `STRATEGY.md` |
| Implementaciones independientes que pasan la conformance | reportes de conformance publicados | `docs/CERTIFICATION.md` |
| Resultados de Agent-safety por modelo | el benchmark de promptfoo, con model id, fecha y config hash | `evals/kitchen-agent-safety/` |

## 7. Lo que aún no sabemos

Si un food bank rescata más con el perfil que con su método actual (el protocolo del pilot existe; ningún pilot se ha ejecutado). Si los operation envelope son adecuados para cada cocina (un científico de alimentos no los ha revisado). Si las behavioural assumptions de los simuladores se mantienen (están listadas y son ajustables). Qué tan grandes son los efectos de rebote. Nada aquí es una promesa.

## 8. Qué salió mal

Nada se ha desplegado, por lo que nada ha salido mal en el campo. En el repositorio: la
primera línea única ("world's first and largest robot cooking recipes index") exageró lo que
existía y fue cambiada; el primer esquema de Mission aceptaba campos desconocidos y se hizo
estricto; los primeros simuladores usaron un strawman baseline y ganaron un competent-integration
baseline y rangos. Las críticas que impulsaron estos cambios están publicadas
(`docs/CRITIQUES.md`).

## 9. Fuentes

- FAO, IFAD, UNICEF, WFP and WHO, *The State of Food Security and Nutrition in the World
  2024*, Rome, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Rome, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Geneva, 2015.
- WHO, *Global report on sodium intake reduction*, Geneva, 2023; WHO fact sheet *Salt
  reduction*.
- WHO fact sheet *Household air pollution*, 2024.

Las cifras se citan tal como las publican las fuentes, redondeadas; vuelva a comprobar cada una con la edición actual antes de citarla en la imprenta. Las organizaciones son fuentes, no socios.

