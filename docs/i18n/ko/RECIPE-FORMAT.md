<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Cookwala 레시피 형식: Missions와 함께 작동하는 레시피

Cookwala의 레시피는 지침 목록이 아닙니다. 그것은 플래너가 특정 Mission(household, robots, appliances, energy, budget, health, timing)에 따라 **이동 가능한 요리 지식**을 실행 가능한 계획으로 *컴파일*한 것입니다. 그러면 로봇은 그 계획을 실행하며, 현실이 변할 때 contingency와 playbook을 통해 적응합니다.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). 전체 작업 예시:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. 네 가지 계층 (WHO SMART Guidelines 접근 방식에서 수정됨)

| 계층 | 포함 내용 | 작성자 | 위치 |
|---|---|---|---|
| **R1 Narrative** | 인간의 레시피 텍스트, 이야기, 문화적 노트, 사진 | 요리사, 셰프, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | 요리가 *무엇인지* 그리고 *무엇이어야 하는지*: 정체성 (필수 vs 유연), 감각적 목표, 영양, 서빙 및 식사 스타일, 보관, 수용성 확인 | 레시피 편집자, AI 보조, 검토됨 | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | 장치 불가지론적 방법: 공식 (비율 + 역할), 식품 상태 전/후 조건이 포함된 유형화된 ops의 프로세스 그래프, `until` 조건, 대안, 일시 중지 규칙, 실패 모드, 어포던스, 위험 요소, CCPs, 환경 준비 | 내보내기 파이프라인 + 검토; 시뮬레이터 검증됨 (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | *이* Mission을 위해 컴파일된 R3 레시피: 정확한 양, 선택된 변형, 할당된 행위자 및 장치, 일정, 리스, 모니터, 비상 계획 | 플래너/컴파일러, 실행 시점 | **Mission** (`plan`) 내부, 카탈로그에는 절대 포함되지 않음 |

소스 코드와 컴파일러처럼: **레시피는 이식 가능한 중간 표현(R3 + R2)입니다. Mission은 타겟 머신입니다.** 이것이 로봇과 AI가 변하더라도 레시피를 유효하게 유지해 주는 것입니다: 더 나은 플래너는 동일한 레시피로부터 더 나은 R4를 생성합니다.

## 2. Mission의 각 섹션이 수행하는 역할

| 레시피 섹션 | Mission에서 사용하는 용도… |
|---|---|
| `identity.essential / flexible / neverAdd` | 대체품, 예산 및 배급 모드, 식단 조정: flexible한 부분은 변경하되, essential한 부분은 절대 변경하지 않음으로써 요리가 본연의 모습을 유지하도록 함 |
| `formula` (ratios, min/max, role, scaling) | 인원수에 맞춘 정확한 scaling, 일주일 단위의 식재료 배급, 예산 확장, 보유 중인 재료 소진 (limiting-ingredient rescale) |
| `sensory` | 시각, 향기 및 맛 체크포인트; household taste profiles (salt 2 vs 4); 재용도 결정 및 수정 결정 |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **환경 준비 작업:** 싱크대나 hob가 사용 중이면, planner가 "clear, wash, dry" 작업을 추가함; soak 또는 thaw 작업은 몇 시간 전에 예약됨 |
| `process.nodes[]` with `pre`/`post` food states | 계획 (준비된 것만 시작), 검증 (해당 단계가 상태를 생성했는가?), 중단 후 재개 |
| `until`, `onTimeout`, `retry` | 단계가 완료된 시점과 완료되지 않았을 때 무엇을 해야 하는지 파악 |
| `alternatives[]` + `energy` | Gas vs induction vs oven, battery saver, oven이 없는 주방, quiet hours |
| `pause` (pausable, safeState, maxPause, onExceeded) | **중단:** 아이가 도움이 필요하거나, 주인이 부르거나, 개가 무언가를 넘어뜨림. 로봇은 해당 단계를 safe state로 전환하고, 이벤트를 처리한 후, pause budget에 따라 재개, 재가열, 구조 또는 폐기함 |
| `failureModes` (incident, detect, prevent, playbook) | 알려진 문제의 조기 감지 및 복구를 위한 정확한 playbook |
| `affordances`, `space` | 잡고, 들고, 닿을 수 있는 로봇에 맞춰 단계를 매칭; hot zones를 아이들로부터 멀리 유지 |
| `safety` (hazards, CCPs, supervision, abort) | safety kernel: 모든 plan이 반드시 유지해야 하는 불변량 |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | 서빙: 식탁 위, 방 안, 도시락 안에 무엇이 들어가는지; reminders 및 hold limits; 문화적 eating style |
| `storage` | 남은 음식, cook-ahead 및 도시락 Mission |
| `acceptance` | 레시피의 *tests*: 이 조건들이 충족될 때 Mission이 완료됨 |
| `nutrition`, `cost` | 개인별 portion, 예산, relief rations |

## 3. 예시: 모든 것이 연결된 한 단계

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. 미션을 위한 레시피 컴파일 (플래너가 수행하는 작업)

1. **변형 선택:** `alternatives`에서 식단, 질감 (IDDSI), 장비, 에너지 및 모드를 선택합니다. Identity essentials는 유지되어야 합니다.
2. **스케일링:** `formula`와 서빙 횟수, 인당 분량 (HEALTH.md), 제한 식재료, 또는 배급 한계로부터 결정합니다. 향신료는 sub-linearly, 시간은 질량 지수(mass exponent)에 따라 적용합니다.
3. **대체:** 역할 내에서 `identity.neverAdd`, 알레르기 유발 물질, 식단 팩 및 인벤토리를 준수하며 대체합니다.
4. **환경 준비:** `prep`을 Mission의 공간 facet(싱크대 가득 참? 홉 점유 중? 도마 더러움?)과 비교하고 정리, 세척, 건조 및 스테이징 작업을 추가합니다. `advanceTasks`(불리기, 해동, 마리네이드, 예열)를 스케줄링합니다.
5. **바인딩:** 어포던스(affordances)와 역량에 따라 각 노드를 로봇, 가전제품 또는 사람에게 할당합니다. 버너, 용기 및 구역을 임대합니다. 모니터(스마트 팟, 배송 ETA, 연기 감지기)를 부착합니다.
6. **스케줄링:** 일시 중지 예산, 배터리 및 에너지 제한, household quiet hours 및 주방 공유 시간대를 준수하며 서빙 시간으로부터 역산하여 스케줄링합니다.
7. **비상 계획 부착:** 각 노드의 `failureModes` 및 `pause` 규칙과 Mission의 글로벌 정책(중단, 홉 근처의 아이 또는 반려동물, 스토브 와치독, 부패 감시)을 추가합니다.
8. **검증:** 스키마 + 시맨틱 체크, 정책 팩, CCP 커버리지, 시뮬레이터 dry run, 우선순위 스택 불변량 (PROTOCOL §7.2)을 검증합니다.
9. **R4 방출:** Mission의 `plan`으로 R4를 방출하고, 서명한 뒤 로봇에게 전달합니다.

## 5. 작성 및 변환

- **From fifi.cooking:** EXPORT-FIFI 파이프라인은 R1 + R2 + R3를 생성합니다. 새로운
  섹션들(identity, sensory, formula, prep, service, pause, failureModes, affordances)은
  기존 텍스트로부터 로컬 모델에 의해 생성되며, validators와
  샘플링된 human review를 통해 검증됩니다.
- **From the web:** `cookwala convert --from schema-org` → R1/R2 (V0), 그 다음 동일한
  enrichment가 수행됩니다.
- **To other formats:** schema.org Recipe (검색 엔진용 R1/R2), Cooklang (human
  editing), PDDL 또는 temporal logic (research planners) 모두 R3로부터 생성될 수 있습니다.
- **By hand:** `cookwala init recipe`가 모든 레이어를 스캐폴딩하며, `cookwala validate` 및
  `cookwala simulate`가 이를 검증합니다.
- **Versioning:** revisions는 불변이며 해시됩니다. Forks는 `meta.derivedFrom`을 기록합니다.
  Recipe **patches** (playbooks 또는 feedback으로부터)는 diff로 제안되며, 검토와
  evidence 이후에만 승격됩니다.

## 6. 단계 텍스트의 언어

단계 문장은 먼저 사람을 위해 작성되고 그다음에 기계에 의해 파싱됩니다. 예시 레시피의 아랍어 단계 텍스트는 이집트 요리책의 일반적인 관례인 여성 명령형(قطّعي, سخّني)을 사용합니다; 이는 실수이 아니라 의도적인 선택이며, 출판사는 대신 성 중립적인 수동태(تُقطَّع البصلة)를 사용할 수도 있습니다. `op`, `params` 및 `until` 필드가 의미를 전달하며, 문장은 요리사를 위한 것입니다.

## 7. 이것이 미래에도 유효한 이유

- 레시피는 **동작이 아닌 음식 결과와 제약 사항을 설명합니다**. 새로운 로봇과 새로운 AI는 동일한 R3로부터 더 나은 R4 계획을 생성합니다.
- 모든 새로운 섹션은 **선택 사항이며 추가적입니다**. V0 레시피(R1 전용)는 여전히 가이드된 인간 요리에 작동하며, 추가되는 각 레이어는 더 많은 자동화를 가능하게 합니다.
- 알 수 없는 `x-` 필드는 그대로 통과됩니다. 공급업체, 셰프 및 보건 기관은 누구에게도 영향을 주지 않고 레시피를 확장할 수 있습니다.
- **Acceptance checks**를 통해 인간이든 로봇이든 어떤 실행자라도 요리가 제대로 나왔음을 증명할 수 있으며, 이것이 레시피가 현장 증거와 함께 V3로 올라가는 방식입니다.

