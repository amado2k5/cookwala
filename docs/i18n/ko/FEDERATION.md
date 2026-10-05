<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->

# 연합: Cookwala가 중심 없이 작동하는 방식

**Status:** draft, 2026-10-04 (RFC-0006). 창립자의 사진은 벌집이었다: 중앙의 명령은 없지만, 조화와 회복이 있었다. 이 페이지는 그것이 실제로는 무엇을 의미하는지 말한다.

## 1. 노드

| 노드 | 역할 | 운영 주체 |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, 레시피, 어휘집, rule packs, 키, 피드 | 레시피 발행자, food bank 네트워크, 대학교, 기기 제조사, cookwala.ai |
| **Registry** | `/v1/registry.json`: catalogs, collections, devices, packs, benchmarks에 대한 포인터 | 누구나; cookwala.ai가 하나를 운영함 |
| **Hub** | 주방을 위한 Core API, 로컬 안전 제한, household context | 모든 주방; 오프라인으로 작동함 |
| **Mirror** | 다른 노드의 서명된 항목들을 변경 없이 재발행 | 자신의 지역에서 회복탄력성을 원하는 누구나 |

정적 폴더는 유효한 카탈로그입니다. CSV 템플릿이 있는 전화기는 H0 레벨의 유효한 인도주의적 참여자입니다.

## 2. 명령이 아닌 피드

노드는 서명된 피드인 recall, 익명 사고, registry 변경, 주요 기록을 게시합니다.
다른 노드는 신뢰하는 항목을 폴링하며 이를 재게시할 수 있습니다. 주방으로 아무것도 푸시되지 않습니다; 주방은 온라인 상태일 때 풀링하며, 오프라인 상태일 때도 계속 작동합니다.

## 3. 발행자를 기준으로 검증하십시오, 중계기가 아닙니다

미러를 통해 전달되는 recall은 오직 **issuer**의 서명만큼만 유효합니다. hub는 issuer의 자체 discovery document 또는 did:web로부터 issuer의 `KeyRecord`를 해결하고 본문을 바이트 단위로 검증합니다. 미러의 키는 콘텐츠에 대해 아무것도 증명하지 않습니다; recall을 편집하는 미러는 서명을 깨뜨립니다. `conformance/profiles/federation.json`에 있는 프로파일 벡터가 세 가지 사례를 보여줍니다.

## 4. 신뢰 목록

각 hub는 신뢰하는 catalog 및 registry의 목록을 키와 우선순위와 함께 유지합니다.
node는 피어(`federation.peers`)를 제안할 수 있으며, 결정은 hub가 합니다. cookwala.ai는 그러한 목록의 한 항목일 뿐, root가 아닙니다.

## 5. Freshness

Registry 항목은 status와 publication time을 포함하며; recall은 issue time을 포함합니다; household facet은 validity를 포함합니다. 오래된 항목은 re-fetch되거나 삭제됩니다. 오래되었다는 이유로 아무것도 신뢰되지 않으며, 아무것도 조용히 삭제되지 않습니다: 철회된 항목은 tombstones로 남습니다.

## 6. History

목격된 체크포인트가 포함된 이벤트 로그(Core section 5)는 블록체인 없이도 재작성을 감지할 수 있게 합니다: 제2자가 로그의 헤드에 부서서명을 하면, later 재작성은 더 이상 일치하지 않게 됩니다. 체크포인트 헤드의 공개 앵커링은 선택 사항이며 창립자의 결정 사항입니다 (`docs/research/BACKSTORY.md` section 4.7).

## 7. 상호 운용되는 세 개의 노드

- **A food-bank network**는 주방 및 기부자 registry, 국가 법률에 맞게 조정된 rule pack 카탈로그, 그리고 SMS 게이트웨이를 운영합니다. 이는 cookwala.ai directory에 자신을 등재하거나 하지 않을 수 있으며, 데이터는 결코 해당 국가를 벗어날 필요가 없습니다.
- **A device maker**는 capability document 및 safety-limit pack 카탈로그를 운영하고, conformance 보고서를 발행하며, 고객이 사용하는 카탈로그의 recall 피드를 폴링합니다.
- **A university lab**은 벤치마크 레시피 및 (동의를 얻은) execution log 카탈로그를 운영하고, 어휘를 미러링하며, 자체 벡터를 발행합니다.

그들 중 누구도 cookwala.ai가 온라인 상태일 필요는 없습니다.

## 8. 구축되지 않은 것

중앙 오케스트레이터, 중앙 ID 제공자, 토큰, 블록체인. Mission 프로필의 quorum 결정과 오케스트레이터는 선택 사항이며 실험적인 상태로 유지됩니다.

