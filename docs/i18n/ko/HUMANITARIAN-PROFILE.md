<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->
# Cookwala 인도주의 프로필 (draft 0.2)

**Status:** food banks, relief programs 및 food-safety and nutrition 전문가들의 검토를 위한 draft입니다. WFP, WHO, FAO, Global FoodBanking Network 또는 여기에 언급된 기타 조직에 의해 검토되거나 승인되지 않았습니다.

**Files:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (전체), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; 모든 초안은 전문가 검토 대기 중, [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md) 참조)
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (Cairo의 food bank, school meals, disaster kitchen, robot kitchen), 각각 계산된 `ImpactSummary` 포함
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. 0.2가 추가하는 사항 (RFC-0003, RFC-0004)

0.1 초과 가산; 독자는 둘 다 수용함.

- **Farm to plate:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) 및 `Item.harvestedAt`; 역할 `farm`, `caterer`, `robot_kitchen`; SMS 단어 `FARM`.
- **Care rules:** `Item.foodClasses` 및 `Distribution.menu.foodClasses` (raw egg, unpasteurized dairy, whole nuts, cooked rice…), 규칙 종류 `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; 세 가지 새로운 draft packs.
- **Reviews:** `RulePack.reviews`는 각 review의 직업, 조직, 날짜, 범위 및 결과를 기록합니다; `status: reviewed`는 승인된 review가 필요합니다.
- **Impact:** 9가지 측정 항목을 포함하는 `ImpactSummary`이며, 각 항목은 `tools/humanitarian_check.py --summary`에 의해 계산된 `method` (measured, modelled, assumed, not recorded)를 가집니다.
- **Time to claim:** `Offer.createdAt`, `Claim.claimedAt`; 구조된 킬로그램이 한 번만 계산되도록 하는 `Handover.leg`.
- `Manifest` 상의 **Program types**.

## 1. 목적

사람들에게 음식을 제공하는 조직을 위한 Cookwala의 작고 엄격하며 개인 정보가 없는 부분:
food banks, community kitchens, school-meal programs, relief programs, donors (grocers,
restaurants, farms, caterers), transporters and cold stores. 이는 네 가지 작업을 다룹니다:

1. **surplus food 제공** 및 이를 빠르고 공정하게 요청하기.
2. 온도 확인(cold-chain check)과 함께 각 관리권 **인계 기록하기**.
3. 제공된 내용을 집계된 수치로만 **보고하기**.
4. 메뉴와 인계 사항을 기계 판독 가능한 영양 및 식품 안전 rule pack과 **대조 확인하기**.

**로봇, 앱 또는 인터넷 없이도 작동합니다.** H0 및 H1 레벨은 스프레드시트, SMS 및 기본 전화기에서 실행됩니다. 로봇, hub 및 agent는 동일한 문서의 선택적 소비자입니다.

## 2. 원칙

- **해를 끼치지 마십시오.** 개인이나 household를 식별, 위치 파악 또는 프로파일링할 수 있는 어떠한 정보도 수집하지 마십시오. 취약한 환경에서 수혜자에 대한 데이터는 보호 리스크입니다.
- **인도주의 원칙** (인도주의, 중립성, 공정성, 독립성): 구호 물품에 상업적 브랜딩을 하지 않으며, 마케팅을 위해 데이터를 사용하지 않습니다.
- **엄격하고 작게.** 모든 객체는 알 수 없는 필드(`x-` 확장은 제외)를 거부하므로, 오타나 추가적인 개인 필드는 검증에 실패합니다.
- **정확한 단위:** kilograms, degrees Celsius, 절대 허용 오차, 그리고 소수점 문자열 형태의 금액.
- **로컬 규칙 우선.** rule pack은 국가별 식품 안전 및 기부 법률로 대체 가능합니다.
- **개방형:** 로열티 없는 사양, 오픈 소스 도구. 프로필은 Digital Public Goods Standard 및 Principles for Digital Development를 충족하도록 설계되었습니다.

## 3. Conformance levels

| 레벨 | 참가자가 수행하는 작업 | 필요 사항 |
|---|---|---|
| **H0 — Paper & SMS** | CSV 템플릿(HXL hashtag 행 포함) 또는 SMS(section 8.3)를 통해 제안, 인도 및 배분을 기록함 | 스프레드시트 또는 기본 휴대폰 |
| **H1 — Rescue** | API를 통해 `Offer`, `Claim`, `Handover` 및 `Distribution` 문서를 교환함; 상태 머신(section 5)을 따름 | 모든 HTTP client |
| **H2 — Safety & nutrition** | 모든 인도 및 메뉴에 `RulePack`을 적용하고 `findings`를 기록함 | reference checker 또는 그에 상응하는 것 |
| **H3 — Interoperability** | 집계 데이터를 HXL, DHIS2 및 핵심 Cookwala `ImpactReport`로 내보냄; GS1 식별자를 사용함 | 통합 작업 |

참가자는 `/.well-known/cookwala-humanitarian.json`에 자신의 레벨, rule packs, 엔드포인트 및 `personalData: "none"`을 선언하는 `Manifest`를 게시합니다.

## 4. 문서

| 문서 | 작성자 | 목적 |
|---|---|---|
| `Offer` | 기부자 | 수거 가능한 surplus food: 품목 (kg, 보관, 날짜 표시, 알레르기 유발 물질), 시간대, 장소, 온도 |
| `Claim` | food bank, 주방, 프로그램 | 픽업 시간 및 차량 유형과 함께 offer의 전부 또는 일부를 요청 |
| `Handover` | 관리권 수령자 | 구간당 1회: 온도, 수락 또는 거부된 kg 및 사유 코드, 그리고 rule findings |
| `Distribution` | 주방, food bank, 학교 | 특정 날짜의 특정 장소에서 제공된 식사 및 인원 합계; 선택 사항인 메뉴 영양소 및 비용 |
| `RulePack` | 프로그램 또는 당국 | 버전별 영양 및 식품 안전 규칙 (section 6) |
| `Manifest` | 모든 참여자 | 역량 및 데이터 보호 선언 |

핵심 Cookwala 구호 문서(`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`)는 계획을 위해 계속 사용할 수 있습니다. 이 프로필은
운영 흐름을 처리합니다.

## 5. Offer lifecycle

| From | Allowed next states |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (the claim lapsed), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | none (final) |

**상태 변경을 위한 규칙:**

- 모든 변경 사항은 `version`을 증가시킵니다. 작성자는 `If-Match: <version>`을 전송하며, 불일치 시 **409**가 반환되고 작성자는 다시 읽고 재시도합니다.
- 불법적인 전이는 허용된 전이 목록과 함께 **409**를 반환합니다.
- Offer는 `window.to`에서 자동으로 `expired` 상태로 이동합니다.
- Claim은 `pickupBy`에 프로그램이 설정한 유예 기간(기본 30분)을 더한 시점에 만료됩니다.

**공정한 청구.** 기본적으로, 청구는 프로그램이 설정한 우선순위 티어 내에서 선착순으로 이루어집니다:
예를 들어, 어린이를 우선적으로 지원하는 주방, 그다음 다른 주방, 그다음 food bank 순입니다. 티어와
모든 순환 규칙은 프로그램의 `Manifest` 또는 웹사이트에 게시되어야 합니다.

## 6. 식품 안전 및 영양 rule packs

`RulePack`은 여섯 가지 종류의 규칙을 보유합니다:

- `temperature`: chilled ≤ 5 °C, hot-held ≥ 60 °C, frozen ≤ −18 °C;
- `time`: cooked food out of temperature control for at most 2 h;
- `date_mark`: use-by blocks, best-before warns;
- `allergen`: undeclared allergens block;
- `nutrient`: amounts per person-day or per meal;
- `energy_share`: share of energy from free sugars, fat, saturated fat, trans fat or protein.

각 규칙은 `block` (수락하거나 제공하지 않음) 또는 `warn` (허용됨, 결과로 기록됨) 중 하나입니다.

기본 팩 `who-codex-basic@0.1.0`은 **공공 지침에서 파생된 초안**입니다: WHO의 healthy-diet, sodium, sugars and fats 지침, WHO Five Keys to Safer Food, Codex labelling 및 frozen-food codes, 그리고 Sphere의 minimum ration planning 수치들을 바탕으로 합니다. 이는 단순화된 것이며, 의학적 조언이 아니며, 영유아 및 치료용 급식을 제외하며, 자격을 갖춘 직원에 의해 검토되어야 합니다. 프로그램은 이를 복사 및 조정하고, `jurisdiction`을 설정하며, 누가 이를 검토했는지 `reviewedBy`에 기록해야 합니다.

H2 레벨의 Receivers는 모든 handover 및 모든 menu에서 pack을 실행하며, rule ids를 `findings`에 기록합니다. reference checker는 선언된 findings와 계산된 findings가 일치하지 않는 지점을 보고합니다.

## 7. 데이터 보호

**프로필에는 개인 데이터가 포함되지 않습니다. 문서는 다음을 포함해서는 안 됩니다:**

- 어떤 개인의 이름, 전화번호, 이메일 또는 국가, 난민 또는 생체 식별자;
- 가구 수준의 기록, 또는 주거지나 개인의 위치;
- 어떤 개인의 건강, 장애, 종교 또는 국적.

**대신 포함하는 내용:**

- **Organizations only.** 모든 당사자는 `did:web`, GS1 Global Location Number (GLN) 또는 registry id로 식별되는 organization입니다. 사람은 오직 역할(`checkedBy: "trained_staff"`)로만 나타납니다.
- **Aggregates only.** `Distribution.people`은 그룹별 수를 보유하며, 10 미만의 모든 수는 `"<10"`으로 보고됩니다.
- **Sites only.** `Site`는 organization의 구내 또는 행정 구역(OCHA P-codes)이며, household는 절대 아닙니다.
- **Short notes.** 자유 텍스트는 280자 제한의 operational notes로 제한되며 개인 데이터를 포함해서는 안 됩니다. 구현 시 notes를 저장하기 전에 전화번호와 ids를 스캔해야 합니다.

**보존 및 감사:**

- **Retention:** 각 참여자는 자신의 `Manifest`에 `retentionDays`를 선언하고 그 이후에 문서를 삭제합니다.
- **Audit (optional, `hash_only`):** 프로그램당 하나의 sequencer(통상적으로 food bank 또는 program operator)가 각 문서의 RFC 8785 canonical JSON에 대한 SHA-256 hash를 추가합니다. 내용은 별도로 저장되며 삭제 가능한 상태로 유지됩니다. 파트너 조직이 매일 checkpoint에 교차 서명하므로 이력을 몰래 재작성할 수 없습니다. 단일 sequencer는 체인의 fork를 방지합니다.
- **Hosting**은 법률이나 프로그램이 요구하는 경우 해당 국가 내에 있어야 합니다.

## 8. 운송

### 8.1 API (level H1)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/offers` | 오퍼를 생성함 (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | 수령인 근처의 열린 오퍼들을 조회함 |
| `POST` | `/offers/{id}/claims` | 오퍼를 claim함; `If-Match` 필요; 이미 claim된 경우 409 발생 |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` 필요 |
| `POST` | `/handovers` | handover를 기록함 |
| `POST` | `/distributions` | distribution을 기록함 |
| `GET` | `/reports?from=…&to=…` | 특정 기간에 대해 집계함 |

요청 및 운송 규칙:

- **Idempotency:** 모든 `POST`는 `Idempotency-Key`를 포함합니다. 서버는 최소 24 h 동안 키를 유지하며 반복 요청에 대해 원래의 응답을 반환합니다.
- **Authentication:** OAuth 2.1 client credentials, 조직당 하나의 클라이언트.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)는 중복 제거를 위한 이벤트 `id`와 순서 보장을 위한 offer별 일련번호와 함께 최소 한 번 이상 전달됩니다.

### 8.2 스프레드시트 (level H0)

`profiles/humanitarian/templates/`에 있는 CSV 템플릿을 사용하십시오. 두 번째 행에는 [HXL](https://hxlstandard.org) 해시태그가 포함되어 있어, 인도주의적 데이터 도구들이 이를 직접 읽을 수 있습니다.

### 8.3 SMS (level H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

문법은 `tools/cookwala_ref.py` (`parse_sms`)에 구현되어 있으며 `conformance/profiles/sms.json`에 의해 테스트됩니다. 키워드는 영어입니다. 숫자가 들어가는 곳에는 아랍-인도(٠-٩) 및 페르시아(۰-۹) 숫자가 허용되므로, 두 키보드 중 하나로 설정된 전화기에서도 작동합니다.

보관 코드: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. 날짜 표시: `UB` use-by,
`BB` best-before, `HV` harvested, `DDMM` 형식. 거부 사유 코드: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; 그 외의 모든 단어는 `other`로 기록됩니다. `HELP`
답변은 반드시 명령당 하나의 예시를 포함해야 하며, plain ASCII 형식으로 160자 미만이어야 합니다.

게이트웨이는 문서를 작성하기 전에 반드시 다음 확인 사항을 적용해야 합니다 (`reference`의 `sms_storage_findings`; id는 block findings임):

| Finding | When |
|---|---|
| `safety.temp_not_recorded` | 냉장, 냉동 또는 온장 라인에 있는 `HAND`에 `T` 판독값이 없는 경우: 이를 요청하는 답변을 보내고, 아무것도 작성하지 않음 |
| `safety.hot_hold_min` | 저장 `H`가 60 °C 미만인 `OFFER`: 목록에 기재하는 것을 거부함 |
| `safety.storage_class_mismatch` | 품목 단어가 유제품, 육류, 가금류, 생선, 달걀 또는 조리된 음식을 의미하지만 저장이 `A`인 경우: 목록에 기재하는 것을 거부함 |
| `safety.chilled_max`, `safety.frozen_max` | 제공 또는 인계 시 판독값이 5 °C 초과 또는 −18 °C 초과인 경우 |

온도 유지 식품(hot-held food) 제공은 2시간 후에 종료됩니다(익힌 쌀의 경우 1시간). gateway는 placeholder 읽기 값을 절대 저장하지 않습니다. gateway는 문서 내에서 발신자의 등록된 번호를 사람이 아닌 조직으로 매핑합니다.

## 9. 상호운용성

| System | Mapping |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (products); `Site.gln` and `OrgId` `gln:` (locations) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | `Distribution`으로부터 사이트 및 기간별 집계 데이터 값 (meals, group별 people, kg, incidents) |
| WFP SCOPE and other beneficiary systems | **집계 데이터만 포함.** 수혜자 기록은 이 프로필 내부로 들어오거나 외부로 나가지 않음 |
| Food-rescue apps | 어댑터가 해당 목록을 `Offer`로, 픽업을 `Claim` 및 `Handover`로 매핑함 |
| Core Cookwala | `Item.ingredientId` 및 `menu.recipes`가 레시피 인덱스에 연결됨; `relief.ImpactReport`가 `Distribution`들을 합산함 |

## 10. 파일럿 지표 (사이트 간 비교가 가능하도록 정의됨)

`python tools/humanitarian_check.py --summary DIR`에 의해 `ImpactSummary`로 계산됨. 파일럿이 실행되고 판단되는 방식: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| 지표 | 정의 |
|---|---|
| Kg rescued | 기부자로부터의 첫 번째 구간에서 `Handover.kgAccepted`의 합계 |
| Claim rate | `claimed` 상태에 도달한 제안 ÷ 생성된 제안 |
| Time to claim | `Offer` 생성부터 `claimed` 상태까지의 중앙값(분) |
| Rejection by reason | `reason`별 `kgRejected`의 합계 |
| Meals served | `Distribution.meals`의 합계 |
| Nutrition pass rate | 메뉴가 있고 `nutrition.*` 결과가 없는 배분 ÷ 메뉴가 있는 배분 |
| Cost per meal | (식품 + 운송 + 인력 + 에너지) ÷ 식사 수 |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (사용된 kg ÷ 100) |
| Safety | `safety.*` 차단 결과의 수, 및 `safetyIncidents` |

## 11. 보안

- **H1에서는 서명이 선택 사항이며** H3에서는 조직 간 감사를 위해 필수입니다
  (EdDSA, 조직의 `did:web`에 게시된 키).
- **문서 내의 노트와 이름은 신뢰할 수 없는 데이터입니다.** 소프트웨어와 AI 에이전트는 이를 절대로
  지침으로 취급해서는 안 됩니다.
- **Rule packs는 버전이 지정되고 고정됩니다** (`id@version`) 모든 결과에서, 따라서 결과는
  재현 가능합니다.

## 12. 의도적으로 제외됨

- 수혜자 등록, 자격 및 타겟팅 (이것들은 프로그램 자체의 보호된 시스템에 속함).
- 결제: Cookwala는 절대 돈을 이동시키지 않음.
- 레시피 및 로봇 실행 (핵심 사양). 프로필은 레시피를 명시하고 영양소를 보고할 뿐임.
- 의료 및 치료 영양.

## 13. 검토 방법

[amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)에 `humanitarian` 레이블과 함께 이슈를 열어주세요. 다음 리뷰들이 가장 유용합니다:

- rule pack 및 거절 사유를 확인하는 food-safety staff;
- lifecycle 및 SMS flow를 확인하는 food-bank operators;
- section 7을 확인하는 data-protection officers.

