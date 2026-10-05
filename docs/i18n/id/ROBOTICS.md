<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala dan tumpukan robotika

Cookwala tidak menggantikan bagian apa pun dari robot. Ia menambahkan lapisan yang hilang dari tumpukan robotika untuk memasak: **apa yang harus dibuat, kapan setiap langkah selesai, dan apa yang tidak boleh terjadi**, dalam bentuk yang dapat dibaca dan diperiksa oleh robot, peralatan, simulator, atau alur pembelajaran apa pun.

## Di mana ini ditempatkan

| Layer | Contoh dari layer (2026; tidak ada integrasi dengan satu pun dari mereka) | Apa yang Cookwala tambahkan |
|---|---|---|
| Robots and appliances | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, kitchen robots (Moley, Miso, Chef Robotics), smart ovens | Resep independen-perangkat yang dapat di-dry-run, ditolak atau dimasak; batas keamanan pada-perangkat |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | ROS 2 actions untuk resep dan langkah (`bindings/ros2`); draf pemetaan op Matter (`bindings/matter.json`, belum diverifikasi); sebuah tugas Open-RMF adalah kontribusi terencana |
| Robot learning | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | Tugas langkah bahasa-alami dan segmen langkah untuk dataset; kriteria selesai sebagai target evaluasi |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes dan vektor conformance sebagai kondisi pengujian |
| AI agents | MCP, A2A, Claude, OpenAI and open models | AgentMandate, aturan untrusted-text, tolok ukur agent-safety dapur |

Cookwala secara sengaja berada **di atas gerakan**. Robot modern mempelajari manipulasi secara end to end;
Cookwala memberi mereka tugas, uji keberhasilan dan safety envelope, dan mendapatkan kembali sebuah
execution log.

## ROS 2

`bindings/ros2/` mendefinisikan dua aksi:

| Tindakan | Tujuan | Umpan Balik | Hasil |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Status akhir, alasan refusal before heat, `ExecutionLog` |
| `ExecuteNode` | Satu node resep, operation envelope-nya, target yang lebih sempit opsional | Progress, medium temperature, target tercapai | Envelope OK, rung yang digunakan, ringkasan langkah, deviasi |

**Membatalkan** sebuah tujuan `ExecuteRecipe` adalah sebuah `StopRequest`: server harus berhenti dengan aman.
**Batas keamanan** tetap berada di dalam perangkat; tidak ada bidang tujuan yang dapat mengubahnya. Sebuah hub yang membagi sebuah resep ke beberapa robot mengirimkan tujuan `ExecuteNode`, dan dapat menyerahkan pengiriman tingkat armada ke **Open-RMF** sebagai tugas.

## LeRobot dan dataset robot-learning

Loop LeRobot adalah teleoperate → record → train → deploy, dan LeRobotDataset v2.1 miliknya menyimpan
tugas-tugas bahasa alami dalam `meta/tasks.jsonl` (v3 memindahkan metadata ke parquet; eksportir menulis
file gaya v2.1 hari ini dan penulis v3 adalah next). Resep Cookwala sudah berisi satu kalimat
per langkah, dan execution log mencatat kapan setiap langkah dimulai dan berakhir.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Ini menulis:
- `meta/tasks.jsonl`, satu tugas per langkah resep;
- `meta/cookwala/<log>.json` dengan hash resep, segmen langkah (detik mulai dan akhir,
  sensor-ladder rung, hasil envelope) dan persetujuan household.

Video dan tindakan berasal dari perekam robot itu sendiri. Ekspor menolak log tanpa persetujuan dataset.

## Simulasi

Vektor conformance dalam `conformance/envelope.json` (jejak suhu dengan hasil yang diharapkan) dan aturan sensor-ladder sudah siap untuk simulator. Simulasi termal atau fisika dari sebuah wajan, panci, atau oven dapat dinilai terhadap envelope yang sama yang harus dipatuhi oleh perangkat asli. Isaac Lab, Gazebo dan MuJoCo adalah kandidat untuk benchmark publik "cook in simulation".

## Observabilitas

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Ini menulis sebuah trace OpenTelemetry: satu span per langkah, dengan atribut `cookwala.*` (rung, envelope OK, deviation) dan event safety-limit. Ini dimuat ke dalam backend OTLP apa pun (Jaeger, Grafana Tempo, LangSmith…), sehingga tim dapat melakukan debug perangkat dengan cara mereka melakukan debug agent.

## Dry run: dapatkah perangkat ini memasak resep ini?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run menjawab sebelum apa pun memanas. Ia menyatakan langkah mana yang dilakukan perangkat, mana yang dilakukan orang, bagaimana setiap langkah akan diverifikasi (sensor, model, waktu atau orang), atau alasan pertama mengapa ia harus melakukan refusal before heat.

