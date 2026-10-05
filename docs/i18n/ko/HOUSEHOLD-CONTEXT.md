<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Household Context Profile: the whole picture stays home

> **Status: draft profile** (RFC-0001). Cookwala Core의 일부가 아님. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Recipient rules: `profiles/household/recipient-roles.json`. Local API:
> `api/household.openapi.yaml`. Example: `examples/household/context.json`.

## 1. 왜

가족을 잘 보살피는 로봇은 매우 많은 것을 알아야 합니다: 가전제품과 그 특이점들, 누가 그곳에 사는지와 그들이 언제 집에 있는지, 반려동물, 아이들, 식단, 알레르기, 약 복용 시간, 의식, 예산, 쇼핑 습관, 지난번에 무엇이 잘못되었는지 등입니다. 동일한 사실들이 빈집털이 계획이자 프로파일링 도구가 될 수 있습니다. 이 프로필은 **planner at home**에게 전체 그림을 제공하며, 다른 모든 이들에게는 오직 **constraint**만을 제공합니다.

## 2. 세 가지 아이디어

1. **Facets.** 각각 하나의 유형화된 사실(`cw.facet.household.health.allergies`)을 포함하며, 누가 이를 주장했는지(declared, observed, reported, inferred), 언제, 얼마 동안, 얼마나 확신하는지, 그리고 개인정보 등급(`public`, `household`, `sensitive`, `secret`)을 포함합니다.
2. **registry 내의 Travel rules.** 모든 facet type은 그 raw value가 집을 떠날 수 있는지 여부를 명시합니다: `never` (45개 유형: children, absences, layouts, health conditions, religion, behaviour, incidents, income posture), 오직 `derived` constraint로서만 가능(81개 유형), 또는 명시적 허가 후 `consented` disclosure로서 가능(13개 유형, 대부분 제조사를 위한 device self-state).
3. **Derived constraints.** 식료품점, 플래너, 배달 서비스, 기기 제조사 또는 다른 로봇이 받는 유일한 household object입니다: "17:00–18:00에 현관 앞으로 배달", "peanuts 차단", "15:00–15:30에 복도 내 로봇 이동 금지", "끼니당 예산 상한 18.00 USD". 각 항목은 그것이 유래된 facet **types**를 명시하며, 그 값(values)은 절대 명시하지 않습니다.

## 3. 누가 무엇을 받는가

| 수신자 역할 | 수신 가능 항목 |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (식사를 계획하는 AI 또는 소프트웨어) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; 동의에 따른 device self-state facets |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | device fault summary만 (카테고리별 fault 횟수, 시간 및 household facts 제외), 그리고 household가 insurer를 수신자로 지정한 경우에만; RFC-0001은 이를 privacy review에서 이의를 제기할 경우 제거될 가능성이 가장 높은 역할로 나열함 |
| program (food bank, school) | 없음 |
| dataset | 없음 |

## 4. 규칙

- Raw facets는 절대 장치를 떠나지 않습니다. 홈 네트워크 외부의 누구에게도 이를 반환하는 API는 존재하지 않습니다.
- `inferred` facets는 안전 결정을 위해 절대 사용되지 않습니다.
- 어떤 개인의 행동 점수도 생성되거나 저장되지 않습니다. Behaviour facets는 가구(portion sizes, 언제 치울지)를 위해 존재하며 절대 이동하지 않습니다.
- 경제적 수준은 **owner-set budget posture**이며, 그 무엇으로부터도 추론되지 않습니다.
- 아동 데이터와 부재는 `secret`이며, 일정을 드러내지 않는 이동 및 safe-zone constraints로서의 경우를 제외하고는 파생된 것이라도 절대 이동하지 않습니다.
- 모든 facet은 삭제 가능합니다. 삭제는 가구의 window(기본 7일, 최대 30일) 내에 완료되며, 내용은 없이 로그에 기록됩니다.
- privacy class는 registry default보다 높게 설정될 수는 있지만, 절대 낮아질 수 없습니다.

## 5. 로컬 인시던트 메모리

RFC-0001은 로봇이 알람, 충돌, 포기 및 교훈에 대해 무엇을 기억하는지 묻습니다. `LocalIncident`가 이를 보유합니다: 날짜, `vocab/incidents.json`의 카테고리, 유형별 관련자, 노트 및 교훈. 이는 절대 집을 떠나지 않습니다. Core에 있는 공개적이고 익명인 `IncidentReport`는 모든 제작자가 배우는 다른 문서입니다.

## 6. Conformance

프로필 벡터(`conformance/profiles/disclosure_policy.json`)는 facet과 수신자 역할을 제공하며, 정확한 제약 조건 유형, 공개된 id 및 사유가 포함된 비공개 id를 기대합니다. 참조 구현은 `tools/cookwala_ref.py`의 `derive_constraints()`입니다.

## 7. 타 문서와의 관계

`ClientProfile`, `KitchenProfile` 및 `RobotProfile` (`profile.schema.json`)은 편리한 번들로 유지됩니다. Mission facets (`mission.schema.json`)는 동일한 registry ids를 사용합니다. Core `AgentMandate`는 에이전트가 수행할 수 있는 것에 대한 규범적 진술로 유지되며, mandate facets는 가구의 규칙을 로컬하게 설명합니다.

## 8. 열린 질문들

RFC-0001 참조: closed recipient roles; raise-only privacy; 검토자가 포함된 데이터 보호 영향 평가.

