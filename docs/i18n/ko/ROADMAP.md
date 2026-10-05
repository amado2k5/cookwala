<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# 로드맵: now, next, later

**Status:** 2026-10-04. 모든 항목은 상태를 가집니다: **done**, **in progress**, **planned**,
**not yet funded**. 게이트는 `ACTION-PLAN.md` section 4에서 가져옵니다. 명시된 증거 없이는 아무것도 planned에서
done으로 이동할 수 없습니다.

## Now (this release)

| 항목 | 상태 |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| 영어와 아랍어로 된 9개의 예시 레시피 | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| 검토 템플릿을 포함한 Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) | done (drafts awaiting professional review) |
| 139-type facet registry와 disclosure vectors를 포함한 Household Context Profile | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| 프로토콜 On/Off 기능이 있는 4개의 simulators | done (illustrative) |
| 모든 이해관계자를 위한 페이지, whitepaper 및 deck을 포함한 영어와 아랍어 웹사이트 | in progress |

## Next (약 1년 이내, 자원이 허용하는 대로)

| 항목 | 상태 | 게이트 |
|---|---|---|
| operation envelopes에 대한 식품 과학자 검토 | planned | 검토자 동의 |
| 네 가지 rule packs에 대한 영양사 및 식품 안전 책임자 검토 | planned | 검토 완료 보고; packs가 reviewed로 이동 |
| household profile에 대한 데이터 보호 영향 평가 | planned | 검토자 동의 |
| food-bank 파일럿 (12 weeks, 사전 등록, 독립 평가자) | not yet funded | 파트너 및 자금 지원 (`humanitarian/CONCEPT-NOTE.md`) |
| 여러 모델 제품군에 대한 Agent-safety 벤치마크 결과 | planned | 방법론과 함께 실행 결과 게시 |
| `pip install cookwala` wheel 및 npm의 `@cookwala/sdk` | planned | vocabularies 및 schemas를 번들링하는 패키징 |
| Registry 서비스 (`validate`, `publish`, tombstones) | planned | 워커 및 네임스페이스 증명 |
| reference hub를 대상으로 Core API를 구현하는 첫 번째 기기 제조사 | planned | 한 제조사 동의; conformance 보고서 게시 |
| 첫 번째 fifi.cooking 컬렉션의 전환 | planned | 설립자가 컬렉션별 권한 결정 |
| 기기 피드백을 통한 Core 0.3 | planned | 두 구현자의 피드백 |
| 운영 위원회 | planned | 세 명의 독립적 채택자 또는 두 개의 구현 |

## Later

| 항목 | 상태 |
|---|---|
| Cookwala 레시피를 조리하는 실제 장치의 편집되지 않은 비디오 | 아직 자금 지원되지 않음; 장치 파트너 필요 |
| 독립적인 인증 기관을 포함한 certification 체계 | 계획됨; 참여한 certifier 없음 |
| 사양, 상표 및 마크를 위한 중립적 기반 | 계획됨 |
| 기여자 네트워크: 출처 표기가 포함된 실제 레시피의 동의된 녹화물 | 계획됨 |
| 프로그램 및 협동조합에 의해 게시되는 수요 및 공급 신호 | 계획됨, 경쟁법 검토 후 |
| "Cook in simulation" 벤치마크 (Isaac Lab, Gazebo 또는 MuJoCo) | 계획됨 |
| Humanitarian Profile에 대한 Digital Public Good 인정 | 계획됨, pilot evidence 확인 후 |
| 세계 시뮬레이터 내의 교차 지역 구호 흐름; clean-cooking 효과 | 계획됨 |

## 우리가 하지 않을 것

개인 데이터를 수집합니다; 방법론 없이 숫자를 게시합니다; 파트너가 동의하기 전에 파트너의 이름을 명시합니다;
존재하지 않는 certification을 주장합니다; 어떠한 ledger에도 household data를 올립니다; 주방이 의존하는 중앙 orchestrator를 구축합니다; 기아를 종식시킨다고 주장합니다.

## Kill and pivot rules

실행 계획에서: 만약 두 번의 외부 검토 라운드가 기기 제조사나 pilot partner를 도출하는 데 실패하면, Cookwala는 Humanitarian Profile과 recipe format으로 범위를 좁힙니다. 만약 pilot이 5 % 미만의 이득을 보이면, 결과가 게시되고 확산(scaling) 이전에 profile이 재설계됩니다.

