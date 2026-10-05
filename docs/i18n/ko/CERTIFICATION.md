<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->

# Conformance 및 certification으로 가는 경로

**Status:** draft, 2026-10-04 (RFC-0008). 아직 어떤 certifier도 참여하지 않았습니다; 이것이 표준이 제공하는 경로입니다.

## 1. 세 단계

| 단계 | 주체 | 의미 | 표시 방식 |
|---|---|---|---|
| **Self-declared** | 제조자 또는 발행자 | 공개 도구를 사용하여 공개 벡터를 실행하고 자체 키로 서명된 `ConformanceReport` (`schemas/conformance.schema.json`)를 발행함 | suite와 count가 포함된 보고서; 배지 형태가 아님 |
| **Verified** | registry 운영자 | 동일한 벡터 세트 해시를 대상으로 실행을 재현하고 보고서에 공동 서명함 | 보고서 및 verifier |
| **Certified** | 독립적인 certifier (현재 존재하지 않음) | 공개된 scheme에 따라 suite와 하드웨어 및 safety-case 점검을 실행하고 마크를 부여함 | 보고서, certifier, 마크 |

클래스의 어떤 벡터라도 통과하지 못한 보고서는 해당 클래스를 주장할 수 없습니다. registry는 배지가 아닌 보고서를 보여줍니다.

오늘 유일한 registry 운영자는 사양 유지 관리자(cookwala.ai)이므로, 두 번째 registry가 존재할 때까지 "verified"는 어떠한 독립성도 추가하지 않습니다; 상태는 여전히 self-verification으로 표시됩니다.

## 2. 보고서에 포함되는 내용

핵심 버전, 주장된 클래스 (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) 또는 프로필 주장 (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), 대상 (product, vendor, version), 총계 및 실패한
vector ids와 함께 실행된 suites, vector set의 hash, 도구 및 commit, 날짜, 상태 및
verifier. 예시: `examples/conformance/report-reference.json`, 생성자:

```bash
python tools/run_conformance.py --report report.json
```

## 3. 클래스 및 증명 내용

| Class | Vectors | certification을 위해 또한 필요한 사항 (vectors로 다뤄지지 않음) |
|---|---|---|
| Recipe publisher | hash, envelope (bands 내부의 targets), units | 식품 안전 전문가에 의한 레시피의 content review |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | 장치 자체의 safety case (해당되는 경우 ISO 13482, IEC 60335, UL 3300); measured된 local stop latency; 네트워크 없이 강제되는 safety limits |
| Catalog | hash, signature, key revocation, recalls | key custody 및 incident intake process |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | method와 함께 model별로 게시된 results |
| Verifier | 모든 Core suites | 없음 |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; 개인 데이터 audit 없음 |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name 및 version rules, tombstones | namespace proof process |

## 4. certification이 약속할 수 없는 것

conformance 보고서는 소프트웨어가 실행된 당일에 벡터가 요구하는 대로 동작했음을 증명합니다.
이것은 장치가 모든 주방에서 안전하다거나, 레시피의 맛이 적절하다거나, 혹은 어떠한 위해도 발생할 수 없음을 증명하는 것은 아닙니다. 위해 제로를 약속하는 표준은 부정직할 것입니다; 이 표준은 제한 사항이 로컬에서 강제되고, refusal before heat가 발생하며, 기록을 확인할 수 있음을 약속합니다.

## 5. 마크의 거버넌스

인증 마크와 그 규칙은 상표와 함께 중립적 기반인 `GOVERNANCE.md`로 이동합니다. 그때까지는 마크가 존재하지 않으며, 보고서만 존재합니다.

