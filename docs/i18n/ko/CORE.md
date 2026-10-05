<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. 이것은 Cookwala의 규범적 부분입니다. MUST, SHOULD 및 MAY는 RFC 2119를 따릅니다. 여기에 나열되지 않은 모든 것은 선택적인 **profile** (section 10)입니다.

장치는 약 일주일 안에 Core를 구현할 수 있어야 합니다. Core는 **무엇을 만들지, 언제 완료되는지, 그리고 무엇이 절대 일어나서는 안 되는지**를 말합니다. 그것은 로봇이 어떻게 움직이는지는 말하지 않습니다.

## 1. conformance 클래스

| 클래스 | 반드시 구현해야 함 |
|---|---|
| **Recipe publisher** | 유효한 `recipe.schema.json` 문서; operation envelopes 범위 내의 온도; 해시 및 서명 |
| **Executor** (로봇, 가전 또는 hub) | Core API (`api/core.openapi.yaml`); operation envelopes 및 sensor ladders; 로컬 안전 제한; 추측 대신 refusal; execution log |
| **Catalog** | 서명된 레시피, 주요 기록이 포함된 `/.well-known/cookwala.json`, recall 피드, 사고 접수 |
| **Agent** (사람을 대신하여 행동하는 AI 또는 소프트웨어) | 오직 `AgentMandate` 하에서만 행동; 문서 텍스트를 데이터로 취급; `confirmBefore`에 명시된 사항을 수행하기 전 본인에게 요청 |
| **Verifier** | 해시, 서명, 키 유효성 및 폐기, 공개 사항, 이벤트 체인 및 체크포인트 |

클래스를 주장하는 것은 해당 conformance 벡터(`conformance/`, `tools/run_conformance.py`로 실행)를 통과하는 것을 의미합니다.

## 2. 핵심 문서

| 문서 | 스키마 |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

모든 스키마는 **strict**합니다: `x-<vendor>-…` 확장을 제외한 알 수 없는 필드는 거부됩니다.
읽기 작업 시 이해할 수 없는 `x-` 필드는 무시됩니다. `tools/bundle_schemas.py`는 장치가 오프라인에서 검증할 수 있도록 단일 번들을 생성합니다. 구현체는 실행 시점에 스키마를 가져와서는 안 됩니다(MUST NOT).

## 3. operation의 의미

- **Envelopes.** `vocab/ops.json`에 있는 모든 열 기반 또는 위험한 operation에는 `envelope`가 있습니다.
  이는 다음을 지정합니다:
  - 매질 (물, 기름, 공기, 팬 표면, 제품…);
  - °C 단위의 온도 대역 (및 압력 요리 시 압력);
  - 교반, 뚜껑, 주의 수준 및 해당 단계가 unattended로 실행될 수 있는지 여부;
  - hazards;
  - 테스트 방법.

예시: `cw.op.simmer` = 85–96 °C의 수분 기반 액체; `cw.op.deep_fry` = 160–190 °C의 기름.
- **envelopes 내부의 Targets.** 레시피 target (`params.tempC` 또는 매질의 `target` sensor)은 반드시 envelope 내에 있어야 합니다. validator는 이를 위반하는 레시피를 거부합니다.
- **Executors는 매질을 envelope 내에 유지합니다.** 레시피가 더 좁은 target을 제공하는 경우, 일단 해당 target에 도달하면 그 안에서도 매질을 유지합니다.
- **Altitude.** 물과 증기 대역은 주방 altitude 300 m당 −1 °C씩 이동합니다.
- **Heat levels** (`very_low` … `max`)는 하나의 공통된 의미를 가집니다: `vocab/units.json`에 정의된 °C 단위의 팬 표면 대역입니다.
- **Sensor ladder.** 각 envelope는 단계를 검증하는 방법을 나열하며, 가장 좋은 방법부터 우선합니다: 특정 sensor, 그다음 `model` (기록된 추정치), 그다음 `time`, 그다음 `human`.
  - executor는 충족할 수 있는 첫 번째 rung을 사용하고 이를 `verifiedBy`에 기록합니다.
  - 만약 **어떠한** rung도 충족할 수 없다면, 반드시 해당 단계를 거부해야 합니다 (`missing_sensor_no_fallback`).
  - 지속적인 주의가 필요하며 방치된 상태로 실행될 수 없는 작업들(sautéing, searing, frying, reducing, caramelizing…)은 절대 time만으로 fallback하지 않습니다: 이들의 마지막 rung은 지켜보는 사람입니다.
  - Deep frying은 fallback이 없습니다: 기름 온도 sensor가 없다는 것은 deep frying을 할 수 없음을 의미합니다.
  - `Condition`은 `onSensorMissing`을 통해 이를 좁힐 수 있습니다.
- **추측이 아닌 Refusal.** 단계의 envelope, ladder, 장비 또는 안전 제한을 충족할 수 없는 executor는 시작하기 전에 반드시 이유와 함께 `refused`라고 응답해야 합니다.

## 4. Numbers and units

- **온도는 wire 상에서 °C입니다.** 디스플레이에서 변환될 수 있습니다.
- **Tolerances.**
  - `tolerance`는 상대적이며 ratio-scale 단위에서만 허용됩니다.
  - `toleranceAbs`는 값의 단위에 따른 절대값이며, °C에서 허용되는 유일한 tolerance입니다.
  - `Target.tolerance`는 절대값입니다.
- **주방 단위는 정확한 metric 값을 가집니다:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ mass에는 density가 필요합니다** (`Quantity.densityGPerMl`, 또는 ingredient vocabulary);
  density가 없으면 error이며, 결코 guess가 아닙니다.
- **Money는 ISO 4217 통화를 가진 decimal string** (`"12.70"`)이며, 결코 float이 아닙니다.

## 5. 무결성 및 신뢰

- **Hash.** `sha256:` 및 `hash`와 `signature` 필드를 제외한 문서의 RFC 8785 canonical JSON의 hex digest. 참조용 canonicalizer는 RFC 8785 예시를 정확하게 재현한다.
- **Signature.** ASCII hash string에 대한 Ed25519 (`EdDSA`). P-256 하드웨어 키의 경우 `ES256`이 허용된다. `kid`는 `KeyRecord`를 지정한다.
- **Keys.** `KeyRecord`는 공개 키, 소유자, 유효 기간 및 `revokedAt`을 제공한다. `signedAt`이 폐기 이후이거나 유효 기간을 벗어나는 서명은 무효이다.
  - Catalog는 `/.well-known/cookwala.json`에 키를 게시한다.
  - 조직과 개인은 did:web 문서에 키를 게시한다.
  - 장치는 capabilities document에 키를 게시한다.
  - Verifier는 오프라인 사용을 위해 key record를 캐시한다.
- **Selective disclosure.** 서명된 문서는 민감한 값 대신 `sha256(JCS([salt, value]))`인 `Disclosure` digest를 보유할 수 있다. 보유자는 이를 볼 권한이 있는 당사자에게만 salt와 value를 공개하며, 서명은 여전히 검증된다.
- **Event logs** (Mission profile):
  - 로그당 하나의 sequencer가 `seq`와 `prev`를 할당하여 체인이 분기되지 않도록 한다.
  - Checkpoint는 sequencer에 의해 서명되고, IETF SCITT와 같은 transparency service를 포함할 수 있는 witnesses에 의해 교차 서명된다. witnessed checkpoint 이후의 재작성은 탐지 가능하다.
  - `hash_only` 모드에서 payload는 삭제 가능한 저장소에 존재하며, log는 오직 그들의 hash만을 유지한다.

## 6. 안전 및 에이전트 규칙 (규범적)

1. **안전은 로컬입니다.** 실행기(Executors)는 장치에서 `SafetyLimits` 팩을 강제합니다.
   - 어떤 레시피, 에이전트, 원격 메시지, 확장 기능 또는 작동 모드도 제한을 높이거나 비활성화할 수 없습니다.
   - 더 엄격한 제한이 항상 우선합니다.
   - `profiles/core/safety-limits.default.json`은 장치 제조사가 자체 safety case에 따라 강화하는 초안 시작점입니다.
2. **로컬 정지.** 장치의 정지 제어는 네트워크 연결 여부와 상관없이 0.5 s 이내에 움직임을 멈추고 1 s 이내에 열을 차단합니다. 호출자가 실행기에 도달할 수 있다면 `POST …/stop`은 권한 문제로 절대 거부되지 않습니다.
3. **이벤트는 보고할 뿐이며, 결코 보호하지 않습니다.** `cookwalalatency: local_safety` 이벤트는 장치가 이미 수행한 작업을 보고합니다. 어떤 안전 기능도 이벤트가 도착하는 것에 의존해서는 안 됩니다.
4. **신뢰할 수 없는 텍스트.** 모든 자유 형식 텍텍스트 필드(`x-cookwala-untrusted`로 주석 처리됨)는 소프트웨어와 AI 에이전트 모두에게 데이터일 뿐이며 결코 명령이 아닙니다. 텍스트를 통해 명령을 내리려는 시도는 무시되고 로그에 기록됩니다(`cw.incident.untrusted_instruction`).
5. **에이전트는 mandate에 따라 행동합니다.** 에이전트가 보낸 요청에는 본인이 서명한 `AgentMandate`가 포함됩니다: 범위, 지출 한도, 허용된 제공자, 만료일, 그리고 확인이 필요한 작업들.
   - `irreversible` 및 `safety_override`는 mandate의 내용과 관계없이 항상 확인이 필요합니다.
   - 실행기는 mandate 범위를 벗어난 요청을 거부합니다(`mandate_scope`).
6. **unattended 작업에는 사람이 필요합니다.** envelope에 `unattended: false`라고 명시된 작업은 책임 있는 사람이 현장에 있거나 1분 이내에 연락이 가능해야 합니다.
7. **알레르기 차단은 거부합니다.** 레시피나 인벤토리에 차단된 알레르기 유발 물질이 있으면 요청을 거부합니다; 차단 사항을 우회하는 대체품은 허용되지 않습니다.
8. **Recalls.** 카탈로그는 `GET /v1/recalls`에 서명된 recalls를 게시합니다. 실행기는 온라인 상태일 때 이를 폴링하며 recall된 리비전을 거부합니다. `block_and_stop_running` 또한 실행 중인 실행을 안전하게 중단합니다.
9. **Incident reports**는 익명이며(`IncidentReport`: 날짜만 포함, 이름이나 id 없음), 모든 제조사가 각 near miss로부터 배울 수 있도록 카탈로그에 제출됩니다.

## 7. 실행 라이프사이클 및 API

- **API:** `api/core.openapi.yaml`. 엔드포인트는 다음과 같습니다:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - catalog 측: `GET /v1/recalls`, `POST /v1/incidents`.
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` 및 `stopping` → 도중에 `stopped`로 전환;
  - `refused` 및 `failed`는 최종 상태입니다.
  - 전체 전이 테이블은 `core.schema.json#/$defs/ExecutionState` 및 conformance 벡터에 있습니다.
- **Request rules:**
  - 모든 POST는 `Idempotency-Key`를 포함합니다.
  - 기존 execution에 대한 변경은 `If-Match: <seq>`를 포함하며, 불일치 시 412를 반환합니다.
  - Stop은 If-Match를 요구하지 않습니다.
- **Events:**
  - 전달은 at least once 방식입니다.
  - CloudEvents `id`는 중복 제거 키입니다.
  - `cookwalaseq`는 subject별로 이벤트를 정렬하고 상태 `seq`와 일치시킵니다.
  - 장치는 `cookwala.device.heartbeat`를 방출하므로, hub가 분실된 장치를 감지하고 핸드오프할 수 있습니다.

## 8. 개인정보 보호

- **Execution logs에는 개인 데이터가 포함되지 않습니다** (`privacy.personalData: "none"`).
- **이 데이터는 opt-in 동의가 있을 때만 기기를 떠납니다** (`consent.dataset`: 기본값은 `none`,
  `research_only`, 또는 `open`). 동의는 철회될 수 있습니다.
- **Open datasets는 시간을 일 단위로 거칠게 처리합니다.**
- **Household, 건강 및 종교 데이터는** 사용자가 달리 선택하지 않는 한 **집에 머뭅니다.**
  데이터가 전송되어야 할 때는 selective disclosures로 전송됩니다.
- **The Humanitarian Profile**에는 개인 데이터가 전혀 포함되지 않습니다.

## 9. 버전 관리 및 확장

- **Core 버전은 `0.2.x`입니다.**
  - Reader는 자신의 minor version의 모든 patch를 수용합니다.
  - 다른 minor 버전은 `unsupported_version`으로 거부합니다.
  - 알 수 없는 `x-` 필드는 무시합니다.
- **새로운 operation, unit, sensor 및 incident type**은 버전 변경 없이 vocabularies에 추가됩니다.
- **operation의 의미를 변경하는 것은 새로운 id입니다;** 이전 것은 `replacedBy`와 함께 `deprecated`로 표시됩니다.
- **Profiles**는 독립적으로 버전을 관리하며 필요한 Core version을 선언합니다.

## 10. 프로필 및 상태

| Profile | Status | Notes |
|---|---|---|
| Core (this document) | **draft, normative** | 첫 번째 장치 구현을 위한 대상 |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | 개인 데이터 없음; SMS 및 CSV로 작동; surplus to plate, impact summaries, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | 로컬 우선 household facts; derived constraint만 전송됨 (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | 검증된 namespaces, 정확한 versions, tombstones; 요청에 따른 organizations (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | 모든 conformance 주장 뒤에 서명된 reports (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds 및 relays; issuer에 대해 검증 (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | 레스토랑, 커뮤니티, 학교, 재난 및 로봇 주방 (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | 집계된, 지연된, class-level 수요 및 공급 signals; 경쟁법 검토에 따라 제한됨 (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection, `profiles/mission/transitions.json` 내의 transitions |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | 실제 사용 전 경쟁법 검토 필요 |
| Relief planning (`relief.schema.json`) | experimental | Operational flow가 Humanitarian Profile로 이동됨 |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API가 참조 surface임 |

두 개의 독립적인 구현체가 해당 프로파일의 conformance 벡터를 통과하고 실제 사용자가 있을 때 프로파일은 안정화됩니다.

## 11. 도구

| Tool | 기능 |
|---|---|
| `tools/validate_specs.py` | 스키마, 예시, 레시피 의미론(envelopes, op parameters, template placeholders 없음), 엄격성, 그리고 API 참조가 해결되는지 확인 |
| `tools/run_conformance.py` | `conformance/*.json` 및 `conformance/profiles/*.json`을 실행하고, `--report`를 사용하여 다음을 포함하는 ConformanceReport를 작성: 해싱(RFC 8785 예시 포함), 서명(RFC 8032 키 포함), 폐기, 공개, 이벤트 체인 및 체크포인트, 단위, envelopes, sensor ladders, 상태 머신 |
| `tools/cookwala_ref.py` | 참조 라이브러리 및 CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | 벡터 재생성 (diff 검토) |
| `tools/bundle_schemas.py` | 오프라인 스키마 번들 |
| `tools/humanitarian_check.py` | Humanitarian Profile rule-pack 검사기 및 영향 요약 |
| `tools/make_profile_vectors.py` | `conformance/profiles/` 내의 프로필 벡터 재생성 |

## 12. 0.1 버전에서의 변경 사항

| 영역 | 0.1 | 0.2 |
|---|---|---|
| Schemas | Accepted unknown fields | Strict, `x-` extensions 포함 |
| Temperatures | °C 또는 °F, relative tolerance 허용 | °C 전용; absolute tolerance |
| Money | Number | Decimal string |
| Operations | Prose definitions | Physical envelopes, sensor ladders, heat levels, test vectors |
| Signatures | Fixed EdDSA, lifecycle 없는 keys | EdDSA 또는 ES256, validity 및 revocation을 포함한 KeyRecords |
| Missions | 하나의 mutable document, 내부에 ledger 포함 | Event log + projection, 단일 sequencer, witnessed checkpoints, hash-only mode |
| Agents | Missions 내부에만 Mandate 포함 | common 내 `AgentMandate`; agent requests에 필수 |
| Safety | recipes에 선언됨 | SafetyLimits를 통해 로컬에서도 강제됨; recalls; incident reports |
| Data | dataset model 없음 | 동의된, personal-data-free ExecutionLog |
| Conformance | Schema validation만 수행 | 106 vectors (44 Core, 62 profile) 및 reference implementation 포함 |

0.1 문서를 마이그레이션하려면: °F를 °C로 변환하십시오; 온도의 상대적 허용 오차를 `toleranceAbs`로 교체하십시오; 금액을 십진수 문자열로 변환하십시오; 알 수 없는 필드를 제거하거나 `x-` 필드로 이름을 변경하십시오.

