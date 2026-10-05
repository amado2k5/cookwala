<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->

# 우리가 게시한 Critiques

우리는 Cookwala에 대해 어려운 질문들을 던졌고 그 답변을 기록했습니다. 각 우려 사항은 우리의 응답 및 상태와 함께 [action plan's concern register](ACTION-PLAN.md#2-concern-register)에 id와 함께 기재되어 있습니다. 외부 검토는 언제나 환영하며 여기에 목록으로 게시될 것입니다.

## 이것이 작동할까요? (strategy)

| 우려 사항 | 짧은 답변 | 상태 |
|---|---|---|
| 시장이 아직 존재하지 않음; 사양이 제품보다 앞서 있음 | Small Core, 데모 우선, 사용자 없는 새로운 사양 불가 | Core 0.2 완료; device demo next |
| 영향력 있는 주체가 채택할 이유가 없음 | 각 채택자의 이득을 우선시; 로봇 없이도 유용함 | Food-bank pilot 및 device partner 모색 중 |
| 시뮬레이터는 그들이 assume한 것을 증명할 뿐임 | 공정한 baseline, 범위, "illustrative" 라벨; pilot이 이를 대체함 | Open |
| 기아는 surplus의 문제가 아니라 빈곤과 갈등의 문제임 | Cookwala는 기여함; 단독으로 기아를 종식시킨다고 주장하지 않음 | Message changed |
| 안전, 책임 및 공격 표면 | device에 제한 적용; refusal; recall; 사고 보고 | Spec 완료; certifier review open |
| 개인정보 보호 (건강 및 종교 데이터, ledger vs 삭제) | Local-first, 선택적 공개, hash-only logs, 동의 | Spec 완료; impact assessment open |
| 너무 복잡함 | Core 0.2; 그 외 모든 것은 experimental로 표시 | Done |
| 창업자 의존성 | 중립적인 홈으로 향하는 governance 경로 | GOVERNANCE.md |

## 기술적 설계가 견고한가요?

| 우려 사항 | Core 0.2에서 변경된 점 |
|---|---|
| Operations가 물리적 의미를 갖지 않음 | Envelopes, heat levels, sensor ladders, altitude rule, test vectors |
| 단위 및 숫자 버그 | °C only, absolute tolerances, kitchen units, densities, decimal money |
| Schemas가 오타를 허용함 | `x-` extensions가 포함된 strict schemas; offline bundle |
| 하나의 mutable Mission document | Event log + projection, single sequencer, transitions table |
| Ledger의 증명력이 낮음 | revocation이 포함된 key records, witnessed checkpoints, rewrite detection |
| 정의되지 않은 event delivery; bus 상의 safety | Sequence numbers, latency classes, heartbeats, "safety is local" |
| API surfaces의 드리프트 | Core OpenAPI; CI에서 모든 reference 체크 |
| Verifier 부재 | Reference library 및 106 conformance vectors |

## 우리가 요청하는 리뷰

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), 식품 과학자
(envelopes), 식품 안전 담당자 및 영양사 (rule packs), 보안 감사,
데이터 보호 검토, 그리고 인증 기관의 gap analysis.
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced)을 참조하십시오.

