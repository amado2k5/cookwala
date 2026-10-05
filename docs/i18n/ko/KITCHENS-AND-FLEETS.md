<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->
# 주방 및 생산 실행: 레스토랑, 커뮤니티, 학교, 재난 및 로봇 주방

> **상태: experimental profile** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> 예시: `examples/fleet/`.

## 1. 왜

창립자는 레스토랑, 결혼식, 기부 행사 또는 식품 공장(RFC-0005)에서도 동일한 프로토콜을 요청했습니다. 브리프에는 학교 급식 프로그램과 재난 주방이 추가되었습니다. Core는 하나의 장치가 하나의 레시피를 요리하는 것을 다루며, Humanitarian Profile은 surplus를 이동시키고 식사 수를 계산하는 것을 다룹니다. 그 사이에는 **kitchen**이 위치합니다: 스테이션, 장치, 사람들, 많은 배치, 배식 시간, 중요 관리 지점, 그리고 장치의 execution log에서 프로그램이 보고하는 식사로 이어지는 연결 고리입니다.

## 2. 문서

| Document | 내용 |
|---|---|
| `Kitchen` | 조직의 주방: 유형, 스테이션 (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), 역량 참조로서의 장치, 시간당 식사 수 기준 용량, hot-hold 및 cooling 장비, 시행 중인 rule packs, 역할별 직원 **counts**, 운영 시간 |
| `ProductionRun` | 배치 수와 서빙 수가 포함된 레시피, 서빙 window, 레시피 단계별 스테이션 및 `device`, `person` 또는 둘 중 하나로의 할당, 중요 관리점 기록 (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation), 생성된 Core executions, 그리고 결과 (생산 및 서빙된 식사, waste, 사용된 rescued food, failures, incidents, energy, cost, 방출된 Humanitarian `Distribution`) |
| `StationLease` | 특정 시간 동안 장치 또는 역할에 의한 스테이션의 독점적 사용 |

## 3. 나머지 요소들과 결합되는 방식

- `device`에 할당된 단계는 Core `ExecuteRequest`(또는 ROS 2 바인딩을 통한 `ExecuteNode` 목표)입니다; 해당 `ExecutionLog` 해시는 `executions`에 들어갑니다.
- 프로그램을 수행하는 run은 Humanitarian `Distribution`을 방출합니다; 해당 run의 `ccps`는 distribution의 안전성 결과 뒤에 있는 근거입니다.
- Humanitarian Profile의 rule packs는 run의 메뉴와 항목에 적용됩니다.
- Fleet dispatch(어떤 로봇이 어디로 갈지)는 Open-RMF 또는 벤더의 fleet manager에 속하며, 이 profile에 속하지 않습니다.

## 4. 계산 예시

`examples/fleet/kitchen-disaster.json` 및 `production-run-disaster.json`: 두 개의 가스 케틀, hot-hold units 및 ice bath를 갖춘 구호 주방은 2시간의 window 동안 710인분의 lentil soup와 rice를 생산하고, cook 및 hot-hold 온도를 기록하며, 60 °C 미만인 hot-hold unit 하나를 발견하여 배식 전 해당 batch를 reheat하고, distribution을 emit합니다. 이 예시는 설명용이며, 실제 주방이나 이벤트는 기술되지 않았습니다.

## 5. 의도적으로 제외된 사항

직원 이름 및 일정, 임금, 고객 주문 및 결제, 메뉴 가격. 직원은 역할별 인원수로 표시되므로 누구인지 식별하지 않고도 끼니당 비용을 계산할 수 있습니다.

## 6. Next

로봇 스테이션을 포함한 레스토랑 서비스 예시; 실행 상태 머신을 위한 conformance suite; `StationLease`와 세션 리스(`session.schema.json`)의 통합.

