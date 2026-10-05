<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->

# 영향: Cookwala가 변화시킬 수 있는 것, 출처 및 라벨 포함

**Status:** 2026-10-04. 아래의 모든 숫자는 **measured** (명시된 출처에 의해 계산되거나 보고됨), **modelled** (명시된 가정하에 당사의 시뮬레이터에 의해 생성됨) 또는 **assumed** (계획 수치)로 표시됩니다. 여기에 있는 그 어떤 것도 현장에서의 Cookwala 결과가 아닙니다: 어떠한 pilot도 실행되지 않았습니다. 이 페이지는 문제의 규모와 Cookwala가 기여하는 메커니즘을 명시합니다.

## 1. Hunger

| 사실 | 수치 | 라벨 및 출처 |
|---|---|---|
| 2023년에 굶주림에 직면한 사람들 | 약 733 million | measured by the source: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| 2023년에 중등도 또는 심각한 식량 불안정을 겪은 사람들 | 약 2.3 billion | measured by the source: SOFI 2024 |
| 수확과 소매 사이에서 손실된 식량 | 생산된 식량의 약 14 % | measured by the source: FAO, *The State of Food and Agriculture 2019* (UNEP는 동일한 수치를 13 %로 반올림함) |
| 2022년 소매, 외식 서비스 및 household에서 낭비된 식량 | 약 1.05 billion tonnes; 1인당 약 132 kg; household에서 1인당 약 79 kg | measured by the source: UNEP, *Food Waste Index Report 2024* |

**Cookwala의 메커니즘:** 음식이 상하기 전에 주방에 도달하는 surplus 제공, 모든 인도 단계에서의 cold-chain check (Humanitarian Profile); 프로그램이 비교하고 개선할 수 있도록 모든 사이트에서 동일한 방식으로 측정된 impact; 나중에, 더 적은 양이 재배되고 버려지기 위해 이동하도록 집계된 demand 및 supply 신호 (experimental, competition-law review에 따라 제한됨). **수행하지 않는 것:** 대부분의 기아를 유발하는 빈곤, 갈등, 기후 충격, 가격 또는 정책 문제 해결.

**Modelled, illustrative, not a forecast:** 국가 시뮬레이터의 혼합형 rollout은 가상의 식량 불안정 인구가 필요로 하는 양의 약 4.7 %에 해당하는 식사를 구조하며; 세계 시뮬레이터의 "protocol, no robots" 시나리오는 구조만으로 약 7억 7,000만 명(시뮬레이터의 assumed baseline, 위에서 measured된 7억 3,300만 명을 올림한 수치) 중 약 4,000만 명의 배고픈 사람들에게 도달합니다. 양측 모두 같은 말을 합니다: 구조는 중요하지만 그것만으로는 충분하지 않습니다.

## 2. 건강

| 사실 | 수치 | 라벨 및 출처 |
|---|---|---|
| 매년 안전하지 않은 식품으로 인한 질병 | 약 6억 명; 약 420,000명 사망 | 출처에 의해 measured됨: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| 권장 가이드라인 대비 소금 섭취량 | 대부분의 사람들은 하루에 9 ~ 12 g의 소금을 섭취함; WHO는 5 g 미만(나트륨 2 g)을 권장함 | 출처에 의해 measured됨: WHO fact sheet on salt reduction |
| 매년 높은 나트륨 섭취로 인한 사망자 수 | 약 1.9 million | 출처에 의해 measured됨: WHO, *Global report on sodium intake reduction* (2023) |
| 오염되는 조리 연료에 의존하는 사람들 | 약 2.1 billion; household air pollution으로 인해 연간 약 3.2 million명 사망 | 출처에 의해 measured됨: WHO fact sheet on household air pollution (2024) |

**Cookwala의 메커니즘:** 장치에서 강제되고 기록되는 임계 제어 지점 및 hot-holding, 냉각 및 재가열 제한; 메뉴의 나트륨, 당류, 포화 지방, 과일 및 채소를 표시하는 rule packs; 어린이, 임신 및 노인을 위한 care rules; 영양사 및 식품 안전 담당자가 pack을 보증할 수 있는 검토 기록.
**수행하지 않는 작업:** 치료용 식단을 진단, 치료 또는 계산하지 않음; `docs/health/CLAIMS-POLICY.md`를 참조하십시오.

**Clean cooking**은 그림에는 포함되어 있으나 모델에는 포함되어 있지 않습니다: 시뮬레이터는 아직 나무와 숯을 이용한 요리 또는 그 건강상의 영향(제한 사항으로 나열됨; next)을 계산하지 않습니다.

## 3. 환경

| 사실 | 수치 | 라벨 및 출처 |
|---|---|---|
| 식품 손실 및 폐기물로 인한 전 세계 온실가스 배출량 비중 | 약 8 to 10 % | 출처에 의해 measured됨: UNEP, *Food Waste Index Report 2024* |

**Modelled, illustrative:** 월드 시뮬레이터에서, "many robots with the protocol"은 해당 로봇이 없는 동일한 세상과 비교하여 5년 동안 모든 식품 손실 또는 낭비를 약 4.1 % 줄이고 배출량을 약 5.2 % 줄입니다; "many robots alone"은 가구 폐기물을 줄이지만 가정에 도달하기 전의 손실을 약 3 % 증가시킵니다 (채찍 효과). 로봇 전력(해당 시나리오에서 5년 동안 약 164 TWh)이 계산에 포함됩니다. 이것들은 각 시뮬레이터 페이지에 나열된 모델의 가정에 따른 모델의 출력값입니다.

## 4. 경제 및 업무

**assumed and modelled:** 도시 시뮬레이터는 1인당 월 약 5 USD를 추정함
식비 지출이 줄어들고 로봇과 함께 요리 및 쇼핑을 함으로써 가구당 월 약 10시간이 줄어듦
요리사, 하드웨어는 포함되지 않음. 일자리에 대한 수치는 어디에도 제공되지 않음; 새로운 역할들이
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) 숫지 없이
명명됨.

## 5. 문화

숫자 없음. 해당 주장은 정성적이며 확인 가능함: Cookwala 레시피는 요리사의 이름, 요리의 정체성(무엇이 필수적인지, 무엇이 유연한지, 무엇이 절대 추가되지 않는지), 요리사의 언어로 된 텍스트, 그리고 서명을 포함함. 이를 요리하는 기계는 해당 레시피를 공로와 함께 작동 지식으로서 상속받음.

## 6. 측정할 것이 있을 때 우리가 측정할 것

| 측정 항목 | 방법 | 정의된 위치 |
|---|---|---|
| 구조된 킬로그램, 제공된 식사, 도달한 인원, 영양 통과율, 식사당 비용, 청구 소요 시간, 청구율, 안전 차단 결과, 안전 사고 | Offer, Claim, Handover 및 Distribution 문서로부터 계산됨 | Humanitarian Profile section 10; `ImpactSummary` |
| 검증된 요리사: conformance를 준수하는 log와 함께 서명된 레시피를 처음부터 끝까지 실행한 executions | 동의가 포함된 execution logs | `STRATEGY.md` section 11 |
| conformance를 통과한 독립적 구현체 | 게시된 conformance reports | `docs/CERTIFICATION.md` |
| 모델별 Agent-safety 결과 | model id, date 및 config hash를 포함한 promptfoo benchmark | `evals/kitchen-agent-safety/` |

## 7. 우리가 아직 알지 못하는 것

food bank가 현재 방식보다 해당 프로필을 통해 더 많은 것을 구제할 수 있는지 여부 (pilot protocol이 존재함; 아직 실행된 pilot은 없음). 모든 요리에 envelope가 적합한지 여부 (food scientist가 이를 검토하지 않음). simulator의 behavioural assumptions이 유효한지 여부 (목록에 있으며 조정 가능함). rebound effects가 얼마나 큰지 여부. 여기의 어떤 것도 약속이 아님.

## 8. 무엇이 잘못되었는가

아무것도 배포되지 않았으므로, 현장에서 잘못된 일은 발생하지 않았습니다. 저장소에서는: 첫 번째 한 줄 설명("world's first and largest robot cooking recipes index")은 존재하는 것보다 과장되어 변경되었습니다; 첫 번째 Mission 스키마는 알 수 없는 필드를 허용했으나 엄격하게 변경되었습니다; 첫 번째 시뮬레이터들은 strawman baseline을 사용했으나 competent-integration baseline 및 범위를 확보했습니다. 이러한 변경을 이끈 비판들은 게시되어 있습니다 (`docs/CRITIQUES.md`).

## 9. 출처

- FAO, IFAD, UNICEF, WFP and WHO, *The State of Food Security and Nutrition in the World
  2024*, Rome, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Rome, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Geneva, 2015.
- WHO, *Global report on sodium intake reduction*, Geneva, 2023; WHO fact sheet *Salt
  reduction*.
- WHO fact sheet *Household air pollution*, 2024.

수치는 소스에서 발행된 대로 반올림하여 인용하며, 인쇄 시 인용하기 전에 현재 판본과 대조하여 재확인하십시오. 조직은 소스이며 파트너가 아닙니다.

