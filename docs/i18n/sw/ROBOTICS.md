<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->

# Cookwala na robotics stack

Cookwala haichukui sehemu yoyote ya roboti. Inaongeza tabaka ambayo robotics stack imekosa kwa ajili ya kupika: **nini cha kutengeneza, wakati kila hatua inapofanyika, na nini kisitokee kamwe**, katika mfumo ambao roboti yoyote, kifaa, simulator au learning pipeline inaweza kusoma na kukagua.

## Inapofaa

| Tabaka | Mifano ya tabaka (2026; hakuna muunganisho wowote uliopo nao) | Cookwala inaongeza nini |
|---|---|---|
| Roboti na vifaa | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, roboti za jikoni (Moley, Miso, Chef Robotics), oven janja | Mapishi yasiyo tegemezi na kifaa ambayo inaweza kufanya dry run, kukataa au kupika; mipaka ya usalama kwenye kifaa |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | ROS 2 actions kwa ajili ya mapishi na hatua (`bindings/ros2`); rasimu ya ramani ya Matter op (`bindings/matter.json`, haijathibitishwa); kazi ya Open-RMF ni mchango uliopangwa |
| Kujifunza kwa roboti | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | Kazi za hatua za lugha ya asili na vipande vya hatua kwa ajili ya datasets; vigezo vya kukamilika kama malengo ya tathmini |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes na vectors za conformance kama masharti ya majaribio |
| AI agents | MCP, A2A, Claude, OpenAI na mifano ya wazi | AgentMandate, kanuni ya untrusted-text, kigezo cha usalama wa wakala wa jikoni |

Cookwala ni kwa makusudi **juu ya mwendo**. Roboti za kisasa hujifunza uendeshaji kuanzia mwanzo hadi mwisho;
Cookwala huwapa kazi, jaribio la mafanikio na safety envelope, na kupata
execution log.

## ROS 2

`bindings/ros2/` inafafanua vitendo viwili:

| Kitendo | Lengo | Maoni | Matokeo |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Hali ya mwisho, sababu ya refusal before heat, `ExecutionLog` |
| `ExecuteNode` | Node moja ya recipe, operation envelope yake, lengo nyembamba la hiari | Maendeleo, medium temperature, lengo limefikiwa | Envelope OK, rung iliyotumiwa, muhtasari wa hatua, deviation |

**Kughairi** lengo la `ExecuteRecipe` ni `StopRequest`: seva lazima isimame kwa usalama.
**Mipaka ya usalama** inabaki ndani ya kifaa; hakuna uwanja wa lengo unaoweza kuzibadilisha. hub inayogawanya
mapishi katika roboti kadhaa hutuma malengo ya `ExecuteNode`, na inaweza kukabidhi usambazaji wa kiwango cha msafara
kwa **Open-RMF** kama kazi.

## LeRobot na datasets za robot-learning

Mzunguko wa LeRobot ni teleoperate → record → train → deploy, na LeRobotDataset v2.1 yake huhifadhi
kazi za lugha ya asili katika `meta/tasks.jsonl` (v3 ilihamisha metadata kwenda parquet; exporter huandika
faili ya mtindo wa v2.1 leo na mwandishi wa v3 ni next). Mapishi ya Cookwala tayari yana sentensi moja
kwa kila hatua, na execution logs hurekodi wakati kila hatua ilipoanza na kuisha.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Hii huandika:
- `meta/tasks.jsonl`, kazi moja kwa kila hatua ya mapishi;
- `meta/cookwala/<log>.json` ikiwa na hash ya mapishi, vipande vya hatua (sekunde za kuanza na kumaliza,
  sensor-ladder rung, envelope result) na ridhaa ya kaya.

Video na vitendo vinatoka kwenye kirekodi cha roboti chenyewe. Eksipoti inakataa logi bila
ridhaa ya dataset.

## Simulation

Vekta za conformance katika `conformance/envelope.json` (mfululizo wa joto wenye matokeo yanayotarajiwa) na sheria za sensor-ladder ziko tayari kwa simulator. Simulation ya joto au fizikia ya kikaango, sufuria au oven inaweza kupimwa dhidi ya envelopes zilezile ambazo kifaa halisi lazima kufuata. Isaac Lab, Gazebo na MuJoCo ni wagombea kwa kigezo cha umma cha "cook in simulation".

## Uangalifu

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Hii huandika OpenTelemetry trace: span moja kwa kila hatua, ikiwa na sifa za `cookwala.*` (rung,
envelope OK, deviation) na matukio ya safety-limit. Inapakia katika OTLP backend yoyote
(Jaeger, Grafana Tempo, LangSmith…), ili timu ziweze kudhibiti hitilafu za vifaa kama zinavyodhibiti hitilafu za mawakala.

## Dry run: je, kifaa hiki kinaweza kupika mapishi haya?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run inajibu kabla ya kitu chochote kupata joto. Inasema ni hatua zipi kifaa kinazofanya, hatua zipi mtu anazofanya, jinsi kila hatua itakavyothibitishwa (sensor, model, time au mtu), au sababu ya kwanza inayofanya ikatae.

