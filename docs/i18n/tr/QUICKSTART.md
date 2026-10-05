<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# Hızlı Başlangıç

Beş dakika, donanım yok. Bir tarif getirecek, onu hash'leyecek, bir cihazın onu pişirip pişiremeyeceğini soracak, bir sıcaklık izini bir operasyonun güvenli bandına karşı kontrol edecek ve bir pişirme günlüğünü bir iz olarak dışa aktaracaksınız. Aşağıdaki her şey bugün çalışıyor.

## 1. Araçları edinin

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` ve dışa aktarıcılar yalnızca Python standart kütüphanesini kullanır. Diğer paketler tam doğrulama ve imzalar içindir. Yol haritasında bir sonraki adım `pip install cookwala` paketidir.

## 2. Bir tarif getir ve onu hashle

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Bir yürütücü tam olarak bu revizyonu pişirir ve kendisine verilen hash eşleşmezse reddeder.

## 3. Bu cihaz bunu pişirebilir mi?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

Cevap `refused` ve sebep `needs_human_present`: kesme işlemi gözetimsiz olarak çalıştırılmayabilir.
Bir kişi ekleyin:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Şimdi `accepted` durumunda. Plan, kolun hangi adımları yapacağını, bir kişinin hangi adımları yapacağını ve her adımın nasıl kontrol edileceğini (sensor, logged estimate, time veya person) belirtir. Aynı şeyi tarayıcıda [home page](/#demo) üzerinde deneyin.

## 4. Bir sıcaklık izini güvenli bir bant ile karşılaştırın

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Her şeyi doğrulayın ve conformance testlerini çalıştırın

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Bir yemek günlüğünü bir izleme veya bir veri kümesine dönüştürün

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` herhangi bir OpenTelemetry backend'ine yüklenir. `my-dataset/meta/` LeRobot-style veri setleri için her tarif adımı başına bir görev tutar. Her ikisi de household opt in yapmayan logları refuse eder.

## Sırada ne var

| Siz | Next |
|---|---|
| Bir robot veya cihaz inşa ediyorsanız | [Robots, ROS 2 and datasets](ROBOTICS.md), ardından [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Bir AI agent inşa ediyorsanız | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) ve [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Bir mutfak veya food bank yönetiyorsanız | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Tarif yazıyorsanız | [Recipe format](RECIPE-FORMAT.md) ve [Contributing](../CONTRIBUTING.md) |

