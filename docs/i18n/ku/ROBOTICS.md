<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->

# Cookwala û stackê robotîkê

Cookwala qismek ji robotî vedigire. Ew ew qatê lêzêdixe ku stack-ê robotîkê ji bo çêkirina xwarinê kêm dike: **çi bête çêkirin, kengî her gav pêkan dibe, û çi qet nabê e**, bi şêveyek ku her robot, amûr, simulator an pipeline-ê fêrîbûnê dikare bixwîne û kontrol bike.

## Li ku derê derbas dibe

| Tager | Mînakên tagerê (2026; tu yek ji wan jî bi tu awayî bi yekî ve nîn e) | Tiştê ku Cookwala lê zêde dike |
|---|---|---|
| Robota û amûr | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, robota metbexê (Moley, Miso, Chef Robotics), ovenên jîr | Reseptek ku bêserîberî amûrî dikare dry-run bike, red bike an jî bişewîne; sînorên ewlehiya ser-amûrî |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | Çalakiyên ROS 2 ji bo resept û gavan (`bindings/ros2`); nexşeya Matter op a rangka (`bindings/matter.json`, nehatî piştrastkirin); erkê Open-RMF beşdariya plankirî ye |
| Fêrbûna Robota | LeRobot (Hugging Face), NVIDIA Isaac GR00T, modelên Physical Intelligence π, Figure Helix | Erka gavan a bi zimanê xwezayî û beşên gavan ji bo datasetan; krîterên temamkirinê wekî armancên nirxandinê |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes û vektorên conformance wekî şertên testê |
| Agentên AI | MCP, A2A, Claude, OpenAI û modelên vekirî | AgentMandate, rêta metlest-nabe ya nivîsê, benchmarkê ewlehiya agentê metbexê |

Cookwala bi qedel **li ser tevgerê** ye. Robota moden ji bo manipulasyonê ji destpêkê heta dawiyê fêr dibin;
Cookwala erk, testa serkeftinê û operation envelope didetê, û execution log werdegirtin.

## ROS 2

`bindings/ros2/` du çalakiyan pênase dike:

| Çalakî | Armanc | Feedback | Encam |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Rewşa dawî, sedema refusal, `ExecutionLog` |
| `ExecuteNode` | Yek node a recipe, operation envelope, hedefekî temençtir ê guncaw | Pêşveçûn, medium temperature, hedef hatibû gihîştin | Envelope OK, rung hatî bikaranîn, kurtiya gavê, deviation |

**Betalkirin** girêdana `ExecuteRecipe` dibe `StopRequest`: divê server bi awayekî ewle raweste.
**Sînorên ewlehiyê** di hundurê amûrê de dimînin; tu qadên armancê nikarin wan biguherin. Hubek ku pelê (recipe) li ser çend robotan dabeş dike, armancên `ExecuteNode` dişîne, û dikare şandina di asta tîm de (fleet-level dispatch) wekî erk (tasks) bide **Open-RMF**.

## LeRobot û daneyên robot-fêrbûnê

Çalakiya LeRobot teleoperate → record → train → deploy e, û `LeRobotDataset v2.1` wê xebatên bi zimanê xwezayî di `meta/tasks.jsonl` de hildigire (v3 metadata veguherand parquet; exporter îro fîla bi şêwazê v2.1 dinivîse û nivîskarê v3 ê herî nêzîk e). Resepetên Cookwala êdî ji bo her gavijekê hevokekê dihewînin, û execution log dema destpêkirin û dawîbûna her gavikê qeyd dikin.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Ev ev dinivîse:
- `meta/tasks.jsonl`, her gavek ji bo her rêçê;
- `meta/cookwala/<log>.json` bi hash a rêçê, beşên gavê (saniyeyên destpêk û dawî, sensor-ladder rung, envelope result) û rıza malbatê re.

Vîdyo û çalakî ji rekorêrê robotê yên xwe re tên. Derveçûna (export) bêyî razîbûna datasetê logan red dike.

## Simûlasyon

Vektorên conformance di `conformance/envelope.json` de (çalakiyên germî yên bi encamên hêvîkirî) û rêzikên sensor-ladder ji bo simulator amade ne. Similasyoneke termal an fîzîk a tencê, qorpanê an ovenê dikare li gorî heman envelope-an ku pîşekî rastîn divê biparêze, were puan kirin. Isaac Lab, Gazebo û MuJoCo ji bo benchmark-ekî giştî yê "cook in simulation" kandidat in.

## Çavdêrî

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Ev trace-ekî OpenTelemetry dinivîse: ji bo her gavekê yek span, bi atributên `cookwala.*` (rung, envelope OK, deviation) û bûyerên sînorê ewlehiyê re. Ew di her backend-ekî OTLP de (Jaeger, Grafana Tempo, LangSmith…) tê yükkirin, bi wusa fîrmên dikarin amûrên wekî agentan debug bikin.

## Dry run: ma ev amûr dikare vê resepê çêbike?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

Dry run berî ku tiştek germ bibe bersiv dide. Dibêje ku kîjan gav ji aliyê amûr ve tên kirin, kîjan gav ji aliyê mirovek ve tên kirin, her gav çawa dê were piştrastkirin (sensor, model, dem an mirov), an jî sedema yekem a ku divê refuse bike.

