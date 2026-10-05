<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->
# Partes interesadas: un mensaje, opciones, un primer éxito y un flujo para todos

**Status:** 2026-10-04. Para cada grupo: por qué Cookwala es importante para ellos, formas de participar desde lo ligero a lo profundo, un primer éxito en menos de 15 minutos, el camino después de ello, y cómo participar hace avanzar su trabajo y el mundo. Nada aquí nombra a un socio, un usuario o un piloto que no exista. Donde algo esté planeado, dice next o later.

Los tres objetivos detrás de cada fila: ayudar a acabar con el hambre, hacer que las personas sean más saludables, poner a los robots a trabajar para las personas.

---

## 1. Builders: desarrolladores, fabricantes de robots y electrodomésticos, ingenieros de sistemas embebidos, constructores de agentes de IA, desarrolladores de plataformas y hogares inteligentes, colaboradores de código abierto

**Mensaje.** Los robots y los electrodomésticos están aprendiendo a moverse. Nadie ha escrito, en una forma que una máquina pueda verificar, qué significa "simmer", cuándo el pollo es seguro o cuándo se debe rechazar un paso. Cookwala es esa capa: recetas que una máquina puede planificar, condiciones finales que puede medir y límites de seguridad que se impone a sí misma. Es abierto, libre de regalías, neutral al modelo y neutral al dispositivo, y viene con una suite de conformance que puedes ejecutar hoy.

**Opciones.**
- *Light:* ejecutar el dry run del navegador; leer Core 0.2 (una tarde).
- *Medium:* `pip install -e sdk/python`, realizar un dry-run de las capacidades de su dispositivo contra las
  recetas de ejemplo, ejecutar los vectores de conformance, iniciar el reference hub.
- *Deep:* implementar la Core API en un dispositivo o un hub, publicar un informe de conformance, añadir
  su dispositivo al directory, proponer un RFC, escribir un nodo de puente ROS 2, añadir casos de ataque
  al agent-safety benchmark.

**Primer éxito (menos de 15 minutos).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Flujo.** Dry run → implementar la Core API contra el reference hub → pasar la conformance →
publicar el reporte → listar el dispositivo → los consented execution logs se convierten en LeRobot datasets y
OpenTelemetry traces.

**Cómo hace avanzar su trabajo.** Una definición de tarea y prueba de éxito compartida para la cocina, con
un benchmark público para medir; recetas de cada cocina sin escribirlas; una
historia de seguridad que los reguladores puedan leer; informes de conformance como documento de ventas;
posición de pionero en un estándar que será gobernado por sus implementadores.

**Cómo hace avanzar a la sociedad.** Menos incendios de cocina y enfermedades transmitidas por alimentos gracias a máquinas que
aplican un refusal before heat en lugar de conjeturar; máquinas que heredan las cocinas del mundo en lugar de unas pocas.

---

## 2. Empresas: startups, empresas, compañías de alimentos, supermercados y entrega, restaurantes y servicios de comida, aseguradoras, certificadoras, equipos de ventas y asociaciones

**Mensaje.** Cada empresa que manipule alimentos se encontrará con máquinas de cocina y agentes de IA en los próximos años. Cookwala le ofrece una interfaz para todos ellos, la única con límites de seguridad aplicados en el dispositivo y registros que puede auditar. Para tenderos y repartidores: reciba ventanas de entrega y requisitos de alérgenos, nunca el horario de una familia. Para aseguradores y certificadores: un formato de informe de conformance y un flujo de informes de incidentes diseñado para usted.

**Opciones.**
- *Light:* lea la página de Investors and partners y las páginas de trust; mapee sus productos a
  las clases de ingredientes y operaciones.
- *Medium:* publique un feed de ofertas (market profile, experimental) o una oferta de surplus a un
  programa local (Humanitarian Profile); ejecute el agent-safety benchmark en el agente que
  planea desplegar.
- *Deep:* implemente la Core API en un producto; patrocine una verificación de conformance; únase al
  steering committee cuando se forme; adopte el camino de certification.

**Primer éxito.** Convertir una línea de productos en una `Offer` de mercado con GTINs y credenciales de alérgenos, validarla y ver qué recetas de ejemplo puede suministrar.

**Flujo.** Ofrecer feed → derived constraints de households → pedidos a través de su propio checkout → eventos de cumplimiento → reputación de execution reports (con consentimiento).

**Cómo hace avanzar su trabajo.** Acceso a una capa neutral en lugar de una docena de integraciones de proveedores; señales de demanda (later, tras la revisión de la ley de competencia) que reducen el desperdicio; certification que los aseguradores pueden valorar; un registro público de seguridad.

**Cómo hace avanzar a la sociedad.** Menos comida perdida entre la tienda y el plato; surplus llegando a las cocinas antes de que se pudra; máquinas en los hogares que no pueden ser persuadidas para realizar acciones inseguras.

---

## 3. Proveedores: tenderos, granjas y cooperativas, entrega, energía, proveedores de IA y modelos, editores de recetas

**Mensaje.** Los proveedores se conectan a Cookwala como pares, no como inquilinos. Un tendero o servicio de entrega recibe una restricción, nunca los hechos de un hogar. Un proveedor de IA recibe un benchmark que muestra que su modelo es seguro en una cocina y un servidor MCP para usar hoy. Un editor de recetas mantiene su nombre en cada receta y puede publicar un catálogo firmado desde una carpeta estática.

**Options.** Publicar un catálogo (recetas) · publicar un feed de ofertas · ejecutar el agent-safety benchmark · ejecutar un nodo de registry · ofrecer surplus por SMS.

**Primer éxito.** Editor de recetas: `cookwala init my-dish`, editar, `cookwala validate`,
`cookwala hash`; su catálogo es una carpeta con `/.well-known/cookwala.json`. Proveedor de IA:
añadir el servidor MCP y ejecutar los diez casos de seguridad de agentes.

**Flujo.** Catálogo o alimentación → entrada en el registry bajo su namespace probado → recall feed si
algo sale mal → reputación de los resultados.

**Cómo hace avanzar su trabajo.** Llegue a cada dispositivo y agente a través de un único formato;
crédito y procedencia mediante firma; un punto de referencia de seguridad que es un activo de marketing cuando
se supera honestamente.

**Cómo hace avanzar a la sociedad.** Las recetas permanecen atribuidas; los agentes que actúan por las personas son
measured antes de que se confíe en ellos.

---

## 4. Alimentos: agricultores, cocineros y chefs, cocineros domésticos, creadores de recetas, escuelas culinarias

**Mensaje.** Una receta escrita para Cookwala mantiene tu nombre y tu cocina vivos en cada
dispositivo que la cocina, con los pasos que una máquina nunca debe omitir escritos. Una granja con un
excedente puede listarla por SMS y llegar a una cocina el mismo día. Una escuela culinaria puede enseñar la
seguridad alimentaria con un formato que se verifica a sí mismo.

**Opciones.**
- *Agricultores:* `FARM 120KG TOMATO A BB0411` a la puerta de enlace de un programa (donde exista);
  later, leer las señales de oferta y demanda.
- *Cocineros y chefs:* convertir una receta que sepas de memoria en una receta de Cookwala; revisar las
  frases de los pasos en su idioma; later, registrar sesiones con consentimiento con crédito.
- *Escuelas:* usar las nueve recetas de ejemplo como casos de enseñanza; añadir las suyas propias.

**Primer éxito.** Cooks: `cookwala init`, escribe una receta con una condición de fin para cada paso de calor, valídala. Farmers: envía una oferta por SMS a un programa que ejecute el perfil (ninguno se ejecuta todavía; el parser y los vectores existen).

**Flujo.** Receta → validación → catálogo → dry run en dispositivos → los execution logs muestran cómo se desempeña en máquinas reales → revisiones con evidencia.

**Cómo hace avanzar su trabajo.** Atribución que viaja; una receta que puede ser cocinada por máquinas en otros países; para los agricultores, una forma de convertir un surplus en comidas en lugar de desperdicio.

**Cómo hace avanzar a la sociedad.** El patrimonio culinario preservado como conocimiento práctico, no como video;
menos desperdicio en la granja.

---

## 5. Humanitario: ONGs, food banks, comedores comunitarios, programas de comidas escolares, agencias de ayuda, donantes

**Mensaje.** El Humanitarian Profile traslada el surplus de alimentos a los platos con teléfonos y hojas de cálculo, registra los controles de la cadena de frío, cuenta las comidas y **no contiene datos personales**. Funciona sin robots, aplicaciones o internet. Le proporciona números que puede defender: kilogramos rescatados, comidas servidas, tasa de aprobación de nutrición, coste por comida, tiempo de reclamación, incidentes de seguridad, cada uno con su método.

**Opciones.**
- *Light:* lea el perfil y el protocolo piloto; pruebe el recorrido SMS.
- *Medium:* ejecute las plantillas CSV en un sitio durante cuatro semanas (nivel H0) y calcule un
  resumen de impacto.
- *Deep:* un piloto pre-registrado de 12 semanas con una línea base y un evaluador independiente;
  adapte los rule packs a la ley nacional con su responsable de seguridad alimentaria; ejecute su propio nodo de registry.

**Primer éxito.** Completa las tres plantillas CSV para un día, ejecuta
`cookwala humanitarian --summary your-folder`, lee el `ImpactSummary` con un método bajo
cada número.

**Flujo.** Oferta → reclamación → entrega con una comprobación de temperatura → distribución → resumen de impacto → resultados publicados, independientemente de lo que muestren.

**Cómo hace avanzar su trabajo.** Números comparables entre sitios; evidencia para financiadores;
hallazgos de seguridad antes, no después, de un problema; un formato que los sistemas de los donantes pueden leer (mapeos HXL,
GS1, DHIS2).

**Cómo hace avanzar a la sociedad.** Más alimentos llegando a las personas de forma segura, con su dignidad intacta:
sin nombres, sin rostros, sin perfilado.

---

## 6. Salud: dietistas, oficiales de seguridad alimentaria, agencias de salud pública, residencias de ancianos

**Mensaje.** Reglas de nutrición y seguridad alimentaria como packs verificables por máquina, derivados de orientación pública, aplicados a menús y traspasos, con su revisión registrada por profesión y resultado. Nada es consejo médico; no se afirma nada más allá de lo que dicen los packs.

**Options.** Revisar un pack con la plantilla (dos horas) · adaptar un pack a las reglas nacionales ·
proponer reglas de cuidado para las personas a las que sirve · later, leer los resultados agregados de los programas.

**Primer éxito.** Abre `profiles/humanitarian/care-vulnerable-groups.rulepack.json` y
la plantilla de revisión; marca tres reglas como aprobadas, cambiadas o rechazadas; archiva la revisión.

**Flujo.** Draft pack → revisión → status reviewed → los programas adoptan → hallazgos en cada distribución → resultados publicados con métodos.

**Cómo hace avanzar su trabajo.** Su orientación se ejecuta en cada cocina que la adopta, incluyendo cocinas robóticas, con su profesión registrada; una revisión publicable; un conjunto de datos de hallazgos (agregados, sin datos personales) para investigación.

**Cómo hace avanzar a la sociedad.** Menos sodio, azúcar y grasas saturadas en comidas de alimentación masiva; mantenimiento en caliente y enfriamiento más seguros; cuidado de niños y personas mayores integrado en la máquina.

---

## 7. Educación: maestros de escuela, educadores, profesores, investigadores, estudiantes

**Mensaje.** Cocinar es el proceso más familiar del mundo, y Cookwala lo convierte en un
objeto de enseñanza: temperaturas, unidades, reparto justo, seguridad, máquinas que siguen reglas. Para
investigadores es un benchmark, un formato de dataset y una lista de open-problems.

**Opciones.**
- *Profesores:* el kit de lecciones (`docs/education/LESSON-KIT.md`): cinco lecciones desde "qué es un
  simmer" hasta "qué es lo que una máquina nunca debe hacer".
- *Profesores y estudiantes:* la lista de temas de investigación, los simuladores, los vectores de
  conformance como condiciones de prueba, la exportación de LeRobot, problemas abiertos de tamaño de tesis.
- *Investigadores:* publicar conjuntos de datos de ejecuciones consentidas; criticar las
  assumptions de los simuladores; proponer vectores.

**Primer éxito.** Profesores: ejecuten el dry run del navegador en clase y pregunten por qué el dispositivo se negó. Estudiantes: cambien un assumption en el simulador de la ciudad y expliquen el resultado.

**Flujo.** Lección → proyecto → conjunto de datos → artículo → RFC.

**Cómo hace avanzar su trabajo.** Material gratuito, abierto y citable; un benchmark que nadie posee;
coautoría en el estándar a través de RFCs.

**Cómo hace avanzar a la sociedad.** Una generación que sabe qué es una cocina segura y puede leer una
hoja de seguridad.

---

## 8. Gobierno: gobiernos, ministerios, funcionarios municipales, reguladores, políticos y legisladores, organismos de gobierno y de normalización

**Mensaje.** Las máquinas de cocina domésticas y comerciales están llegando bajo regulaciones escritas para electrodomésticos y software por separado. Cookwala ofrece a los reguladores algo concreto a lo que señalar: límites de seguridad aplicados en el dispositivo, refusal before heat, registros firmados, informes de incidentes anónimos y una suite de conformance que cualquiera puede ejecutar. Para la seguridad de la donación de alimentos, proporciona un estándar de datos sin datos personales. Es libre de regalías y se dirige hacia una gobernanza neutral.

**Opciones.** Lea el informe de políticas (`docs/policy/BRIEF.md`) · use el lenguaje del modelo para datos de donación de alimentos y seguridad de máquinas de cocina · pida a su organismo de normalización que revise Core 0.2 · ejecute un nodo de registry nacional · financie un piloto con su programa de comidas escolares.

**Primer éxito.** Lea el informe de dos páginas y compruebe tres cosas en el repositorio: el
safety limits pack, el conformance runner, las reglas de protección de datos humanitarios.

**Flujo.** Breve → revisión por un organismo nacional de normalización → referencia en la guía → piloto →
esquema de certification.

**Cómo hace avanzar su trabajo.** Una base técnica lista para usar y revisable; evidencia de los pilots; un canal hacia la industria a través de un estándar neutral; interoperabilidad con los estándares de datos humanitarios que ya utiliza.

**Cómo hace avanzar a la sociedad.** Máquinas más seguras en los hogares; rescate de alimentos que protege a las personas a las que sirve; menos desperdicio en las ciudades.

---

## 9. Capital: inversores, emprendedores, filantropías, bancos de desarrollo

**Mensaje.** La cocina está a punto de convertirse en infraestructura. El estándar es gratuito; los servicios
que lo rodean son un negocio: certification, software de hub, conjuntos de datos consentidos, operaciones de
registry, pilotos. La capa humanitaria es un bien público que los financiadores del desarrollo pueden
respaldar con evaluación prerregistrada. No se hacen promesas financieras en ningún lugar de este sitio.

**Opciones.** Lea la oportunidad, el modelo de negocio, la hoja de ruta, los riesgos y la gobernanza
(`/investors`) · financiar un pilot o una revisión · respaldar una empresa que vende servicios junto al
estándar gratuito · unirse a la gobernanza como observador financiador.

**Primer éxito.** Lea las secciones de problema, arquitectura y riesgos del whitepaper y el registro de preocupaciones del plan de acción; cada riesgo abierto está listado.

**Flujo.** Evidencia (pilotos, conformance, adoptantes) → puertas en el plan de acción → financiación vinculada a las puertas → base neutral para el estándar, una empresa para servicios.

**Cómo hace avanzar su trabajo.** Posición temprana en un estándar que define una categoría con números honestos; una empresa de servicios invertible separada del bien público.

**Cómo hace avanzar a la sociedad.** El capital va hacia lo que es measured, no hacia lo que se afirma.

---

## 10. Pensamiento: filósofos, especialistas en ética, historiadores y futuristas

**Mensaje.** Cuando una máquina cocina la receta de una abuela, ¿quién es el dueño del conocimiento? ¿Qué significa la dignidad en el cuidado automatizado? ¿Qué puede saber el robot de un hogar, y quién más puede saberlo? Cookwala ha tomado decisiones sobre estas preguntas en código; los ensayos (`docs/essays/`) dicen cuáles fueron e invitan al desacuerdo.

**Opciones.** Leer los ensayos · escribir una respuesta · proponer una regla (un RFC es un argumento filosófico con un esquema) · formar parte de la revisión ética del perfil del household context.

**Primer éxito.** Lea el ensayo sobre datos de household context y las reglas de viaje del facet registry;
encuentre un facet cuyo default cambiaría, y diga por qué.

**Flujo.** Ensayo → comentario público → RFC → valor predeterminado cambiado.

**Cómo hace avanzar su trabajo.** Un caso real donde las posiciones éticas se convierten en reglas en ejecución,
con un registro público del argumento.

**Cómo hace avanzar a la sociedad.** Decisiones sobre datos íntimos y herencia cultural tomadas a la luz pública antes de que las máquinas lleguen a millones de hogares.

---

## 11. Todos: personas a las que les preocupan la comida, los residuos, los empleos, el clima y el futuro

**Mensaje.** Cookwala es una forma de escribir una receta para que cualquier persona, o cualquier cosa, pueda cocinarla de forma segura, y una forma para que la comida que se tiraría llegue a alguien que la necesite. Es gratuita, no pertenece a ninguna empresa y dice lo que no sabe.

**Opciones.** Prueba el dry run · juega un simulador · lee las recetas · escribe una receta que te encante · sigue la hoja de ruta · cuéntaselo a un food bank o a una escuela.

**Primer éxito.** Cambia el dispositivo en el dry run y observa que se rechace un paso; lee por qué.

**Flujo.** Curiosidad → una receta → una conversación con una cocina que podría usarla.

**Cómo mejora su vida.** Máquinas más seguras en el hogar, sus propias recetas preservadas, una forma de ayudar sin dar dinero.

**Cómo hace avanzar a la sociedad.** Menos desperdicio, alimentos más seguros, máquinas que sirven a personas que no pueden cocinar por sí mismas y tiempo humano recuperado.

---

## 12. Empleos y dignidad, dicho claramente

Las máquinas de cocina cambiarán el trabajo. Posiciones de Cookwala: los humanos siempre pueden cocinar; los primeros usos son para personas que no pueden cocinar por sí mismas y para cocinas comunitarias que carecen de manos; el nombre de un cocinero permanece en una receta dondequiera que se cocine; una voz laboral tiene un asiento en el comité de dirección; nuevos roles (ingenieros de recetas, técnicos de robots de comida, certifiers, revisores de rule-pack) se nombran sin prometer números.

## 13. Dónde aterriza cada grupo en el sitio

| Grupo | Página |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Companies | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Food | `/for/food/`, `/farmers/` |
| Humanitarian | `/for/humanitarian/`, `/humanitarian/` |
| Health | `/for/health/` |
| Education | `/for/education/`, `/education/` |
| Government | `/for/government/`, `/policy/` |
| Capital | `/for/capital/`, `/investors/` |
| Thought | `/for/thought/`, `/ideas/` |
| Everyone | `/`, `/why/`, `/impact/` |

