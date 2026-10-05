<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala ve robotik yığını

Cookwala bir robotun hiçbir parçasının yerini almaz. Robotik yığınının yemek pişirme için eksik olduğu katmanı ekler: herhangi bir robotun, cihazın, simülatörün veya öğrenme hattının okuyup kontrol edebileceği bir biçimde **ne yapılacağı, her adımın ne zaman tamamlandığı ve asla gerçekleşmemesi gereken şey**,

## Nereye uyuyor

| Katman | Katman örnekleri (2026; bunlardan herhangi biriyle entegrasyon mevcut değil) | Cookwala ne ekler |
|---|---|---|
| Robotlar ve cihazlar | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, mutfak robotları (Moley, Miso, Chef Robotics), akıllı fırınlar | Cihazdan bağımsız, dry-run yapabileceği, reddedebileceği veya pişirebileceği bir tarif; cihaz üzerinde güvenlik limitleri |
| Ara katman yazılımı | ROS 2, ros-controls, Open-RMF (filolar), Matter (cihazlar) | Tarifler ve adımlar için ROS 2 aksiyonları (`bindings/ros2`); taslak bir Matter op eşlemesi (`bindings/matter.json`, doğrulanmamış); bir Open-RMF görevi planlanmış bir katkıdır |
| Robot öğrenimi | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π modelleri, Figure Helix | Veri setleri için doğal dilde adım görevleri ve adım segmentleri; değerlendirme hedefleri olarak tamamlanma kriterleri |
| Simülasyon | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Test koşulları olarak operation envelope ve conformance vektörleri |
| Yapay zeka ajanları | MCP, A2A, Claude, OpenAI ve açık modeller | AgentMandate, untrusted-text kuralı, mutfak ajan-güvenliği kıyaslaması |

Cookwala kasıtlı olarak **hareketin üzerindedir**. Modern robotlar manipülasyonu uçtan uca öğrenir;
Cookwala onlara görevi, başarı testini ve güvenlik zarfını verir ve geriye bir
execution log alır.

## ROS 2

`bindings/ros2/` iki eylem tanımlar:

| Eylem | Hedef | Geri Bildirim | Sonuç |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Final state, refusal reason, `ExecutionLog` |
| `ExecuteNode` | Bir tarif düğümü, onun operation envelope değeri, isteğe bağlı daha dar bir hedef | Progress, medium temperature, target reached | Envelope OK, rung used, step summary, deviation |

**İptal etme** bir `ExecuteRecipe` hedefi bir `StopRequest` işlemidir: sunucu güvenli bir şekilde durmalıdır.
**Güvenlik limitleri** cihazın içinde kalır; hiçbir hedef alanı onları değiştiremez. Bir tarifi birkaç robot arasında bölen bir hub, `ExecuteNode` hedefleri gönderir ve filo düzeyindeki sevkiyatı görevler olarak **Open-RMF**'e devredebilir.

## LeRobot ve robot-öğrenme veri setleri

LeRobot'un döngüsü teleoperate → record → train → deploy şeklindedir ve LeRobotDataset v2.1 sürümü doğal dildeki görevleri `meta/tasks.jsonl` içinde saklar (v3 meta verileri parquet formatına taşıdı; exporter bugün v2.1 tarzı dosyayı yazıyor ve bir v3 writer next aşamasında). Cookwala tarifleri halihazırda her adım için bir cümle içermektedir ve execution log'lar her adımın ne zaman başladığını ve bittiğini kaydeder.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Şunu yazar:
- `meta/tasks.jsonl`, her tarif adımı için bir görev;
- tarif özeti (hash), adım segmentleri (başlangıç ve bitiş saniyeleri,
  sensor-ladder basamağı, envelope sonucu) ve hanenin rızası ile birlikte `meta/cookwala/<log>.json`

Video ve eylemler robotun kendi kaydedicisinden gelir. Dışa aktarma, dataset onayı olmayan günlükleri reddeder.

## Simülasyon

`conformance/envelope.json` içindeki conformance vektörleri (beklenen sonuçlarla birlikte sıcaklık izleri) ve sensor-ladder kuralları simülatöre hazırdır. Bir tavanın, bir tencerenin veya bir fırının termal veya fiziksel simülasyonu, gerçek bir cihazın uyması gereken aynı envelopes değerlerine göre puanlanabilir. Isaac Lab, Gazebo ve MuJoCo, halka açık bir "cook in simulation" kıyaslaması için adaylardır.

## Gözlemlenebilirlik

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Bu, bir OpenTelemetry izi yazar: her adım için bir span, `cookwala.*` öznitelikleri (rung, envelope OK, deviation) ve güvenlik sınırı olayları ile birlikte. Herhangi bir OTLP backend (Jaeger, Grafana Tempo, LangSmith…) içine yüklenir, böylece ekipler cihazları, ajanları hata ayıkladıkları şekilde hata ayıklayabilirler.

## Dry run: bu cihaz bu tarifi pişirebilir mi?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run, herhangi bir şey ısınmadan önce yanıt verir. Cihazın hangi adımları attığını, bir kişinin hangi adımları attığını, her bir adımın nasıl doğrulanacağını (sensor, model, zaman veya kişi) veya reddetmesi gereken ilk nedeni söyler.

