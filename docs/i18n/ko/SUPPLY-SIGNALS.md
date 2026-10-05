<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# 농장 surplus 및 공급 신호

> **Status: experimental** (RFC-0007). Schema: `schemas/supply.schema.json`. Examples:
> `examples/supply/`. **Gate:** any production use 전의 competition-law review
> (`docs/ACTION-PLAN.md`, concern C7). cookwala.ai publishes no signals today.

## 1. 농부들에게 지금 필요한 두 가지

1. **부패하기 전에 과잉을 목록화하는 방법.** Humanitarian Profile에서 농장은 기부자입니다:
   `Item.origin: farm` 및 `harvestedAt`을 포함한 `Offer`, 또는 SMS를 통해:

   FARM 120KG TOMATO A BB0411
   ```

food bank가 이를 주장하고, 주방에서 이를 조리하며, 배급에서 이를 집계합니다. 새로운 문서나 개인 데이터 없이, 조직만 포함됩니다.
2. **필요하게 될 것에 대한 공정한 신호.** 그것이 아래의 실험적인 부분입니다.

## 2. 수요 및 공급 신호

| 문서 | 내용 | 규칙 |
|---|---|---|
| `DemandSignal` | 지역 R에서, ISO 주 W에, 주방 및 프로그램들이 **class** C에 해당하는 식재료를 L에서 H kg 사이로 사용할 계획임 | 최소 20개의 기여 소스; 해당 주가 종료된 후 최소 7일 뒤에 게시; class 레벨 (legume, leafy vegetable, poultry), 제품이나 브랜드는 절대 불가; **가격 정보 없음**; 100개 이상의 소스가 아닌 한 admin1보다 세분화된 지역은 불가 |
| `SupplySignal` | 지역 R에서, 주 W에, class C가 수확 기간과 함께 과잉, 정상 또는 부족 상태임 | 협동조합, 프로그램 또는 시장 운영자에 의해 게시됨; **모두에게 공개**: 공공의, 무료의, 모든 독자에게 동일함 |

참조 확인은 `tools/cookwala_ref.py`의 `check_signal()`입니다; 프로필 벡터(`conformance/profiles/signal.json`)는 무엇이 수락되고 거부되는지를 보여줍니다.

## 3. 이 규칙들이 필요한 이유

경쟁사 간의 예측 공유는 경쟁 당국이 경고하는 정보 교환입니다. 집계, 지연, 클래스 수준, 가격 미포함 및 공개 출판은 신호를 계획에는 유용하게 유지하면서 가격을 조정하는 데는 무용하게 만듭니다. 임계값은 시작점이며, 법률 자문과 통계학자가 이를 설정해야 합니다.

## 4. 창업자의 아이디어가 무엇이 되는가

매크로 루프 (RFC-0007): 계획된 요리 → 집계된 수요 →
농장과 상점의 필요 계획 → 적게 재배하고, 이동시키고, 버려지는 양. 도시, 국가 및
세계 시뮬레이터는 그들의 가정 하에 효과의 크기를 보여줍니다 (예시일 뿐, 예측이 아님). 이 두 문서는 그것을 향한 가장 작고 정직한 단계입니다.

## 5. Later

선행 수요로부터의 식재(Planting advice); 예비량 규모 산정(완벽하게 린(lean)한 공급망은 취약함); 지역 간 구호 흐름; 협동조합으로부터의 SMS를 통한 공급 신호.

