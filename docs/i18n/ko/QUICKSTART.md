<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Quickstart

5분, 하드웨어 없음. 당신은 레시피를 가져오고, 해시하고, 장치가 그것을 요리할 수 있는지 묻고, 작업의 안전 범위에 대해 온도 트레이스를 확인하며, 요리 로그를 트레이스로 내보냅니다. 아래의 모든 것은 오늘 작동합니다.

## 1. 도구 가져오기

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` 및 exporter들은 오직 Python standard library만을 사용합니다. 다른 패키지들은 전체 validation 및 signatures를 위한 것입니다. `pip install cookwala` 패키지가 로드맵의 next 단계입니다.

## 2. 레시피를 가져오고 해시화하기

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

실행자(executor)는 정확히 이 리비전을 요리하며, 주어진 해시가 일치하지 않으면 거부(refuses)합니다.

## 3. 이 장치가 이것을 요리할 수 있습니까?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

답변은 이유 `needs_human_present`와 함께 `refused`입니다: cutting은 관리자 없이 실행될 수 없습니다.
사람을 추가하십시오:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

이제 `accepted` 상태입니다. 계획에는 팔이 수행하는 단계, 사람이 수행하는 단계, 그리고 각 단계가 어떻게 확인될지(sensor, logged estimate, time 또는 person)가 명시되어 있습니다. 브라우저의 [home page](/#demo)에서 동일한 작업을 시도해 보세요.

## 4. 안전 대역에 대해 온도 트레이스 확인하기

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. 모든 것을 검증하고 conformance 테스트를 실행하십시오

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. 요리 로그를 trace 또는 dataset으로 변환하기

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json`은 모든 OpenTelemetry 백엔드로 로드됩니다. `my-dataset/meta/`는 LeRobot-style datasets를 위해 레시피 단계당 하나의 작업을 보유합니다. 두 항목 모두 household가 opt in하지 않은 로그를 refusal합니다.

## Where next

| 당신은 | Next |
|---|---|
| 로봇 또는 가전제품을 제작 중인 경우 | [Robots, ROS 2 and datasets](ROBOTICS.md), 그 다음 [Core API](CORE.md#7-execution-lifecycle-and-api) |
| AI 에이전트를 제작 중인 경우 | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) 및 [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| 주방 또는 food bank를 운영 중인 경우 | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| 레시피를 작성 중인 경우 | [Recipe format](RECIPE-FORMAT.md) 및 [Contributing](../CONTRIBUTING.md) |

