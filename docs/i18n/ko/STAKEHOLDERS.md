<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->

# 이해관계자: 메시지, 옵션, 첫 번째 성공 그리고 모두를 위한 흐름

**Status:** 2026-10-04. 각 그룹별로: Cookwala가 그들에게 중요한 이유, 가벼운 참여부터 깊은 참여까지의 방법, 15분 이내의 첫 번째 성공, 그 이후의 경로, 그리고 참여가 그들의 업무와 세상을 어떻게 발전시키는지에 대해 다룹니다. 여기에는 존재하지 않는 파트너, 사용자 또는 파일럿의 이름이 명시되지 않습니다. 무언가가 계획된 경우, next 또는 later라고 표시됩니다.

모든 행 뒤에 있는 세 가지 목표: 기아 종식을 돕고, 사람들을 더 건강하게 만들며, 로봇이 사람을 위해 일하게 하는 것입니다.

---

## 1. Builders: 개발자, 로봇 및 가전 제조사, 임베디드 엔지니어, AI-agent 빌더, 스마트 홈 및 플랫폼 개발자, 오픈 소스 기여자

**메시지.** 로봇과 가전제품은 움직이는 법을 배우고 있습니다. 기계가 확인할 수 있는 형태로 "simmer"가 무엇을 의미하는지, 닭고기가 언제 안전한지, 또는 언제 단계를 refusal before heat 해야 하는지 아무도 기록해 두지 않았습니다. Cookwala는 바로 그 계층입니다: 기계가 계획할 수 있는 레시피, 기계가 측정할 수 있는 종료 조건, 그리고 기계 스스로에게 강제하는 안전 한계입니다. 이는 개방적이고, 로열티가 없으며, model-neutral하고 device-neutral하며, 오늘 바로 실행할 수 있는 conformance suite를 제공합니다.

**옵션.**
- *Light:* 브라우저 dry run을 실행합니다; Core 0.2를 읽습니다 (저녁 한때).
- *Medium:* `pip install -e sdk/python`을 실행하고, 예시 레시피를 대상으로 기기의 기능을 dry-run 하며, conformance 벡터를 실행하고, reference hub를 시작합니다.
- *Deep:* 기기 또는 hub에 Core API를 구현하고, conformance 보고서를 게시하며, 기기를 directory에 추가하고, RFC를 제안하며, ROS 2 bridge node를 작성하고, agent-safety benchmark에 공격 케이스를 추가합니다.

**첫 번째 성공 (15분 미만).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Flow.** dry run → reference hub를 대상으로 Core API 구현 → conformance 통과 →
보고서 발행 → 장치 목록화 → 동의된 execution logs가 LeRobot 데이터셋 및
OpenTelemetry traces가 됨.

**그들의 작업을 어떻게 발전시키는가.** 요리를 위한 공유된 작업 정의 및 성공 테스트와 이를 측정하기 위한 공개 벤치마크; 레시피를 직접 작성하지 않고도 모든 요리법을 포함; 규제 기관이 읽을 수 있는 안전성 스토리; 판매 문서로서의 conformance 보고서; 구현자에 의해 관리될 표준에서의 선점자 지위.

**사회에 기여하는 방식.** 추측하기보다 refusal before heat를 수행하는 기계들로 인해 주방 화재와 식중독이 감소합니다; 소수의 요리법 대신 세계의 요리법을 계승하는 기계들입니다.

---

## 2. 기업: 스타트업, 엔터프라이즈, 식품 기업, 식료품점 및 배달, 레스토랑 및 푸드 서비스, 보험사, 인증 기관, 영업 및 파트너십 팀

**메시지.** 식품을 다루는 모든 기업은 향후 몇 년 내에 조리 기계 및 AI 에이전트를 만나게 될 것입니다. Cookwala는 이 모든 것을 위한 하나의 인터페이스를 제공하며, 장치에서 강제되는 안전 제한 사항과 감사 가능한 기록을 갖춘 유일한 인터페이스입니다. 식료품점 및 배달 업체에게는: 가족의 일정이 아닌, 배달 시간대와 알레르기 유발 물질 요구 사항을 전달합니다. 보험사 및 인증 기관에게는: 귀사를 위해 설계된 conformance 보고서 형식과 사고 보고 피드를 제공합니다.

**옵션.**
- *Light:* Investors and partners 페이지와 trust 페이지를 읽으십시오; 귀하의 제품을 ingredient classes 및 operations에 매핑하십시오.
- *Medium:* offer feed (market profile, experimental)를 게시하거나 local program (Humanitarian Profile)에 surplus offer를 게시하십시오; 배포할 계획인 agent에 대해 agent-safety benchmark를 실행하십시오.
- *Deep:* 제품에 Core API를 구현하십시오; conformance verification을 후원하십시오; steering committee가 구성되면 가입하십시오; certification 경로를 채택하십시오.

**첫 번째 성공.** 하나의 제품 라인을 GTIN 및 알레르기 유발 물질 자격 증명을 갖춘 시장 `Offer`로 변환하고, 이를 검증하며, 어떤 예시 레시피를 공급할 수 있는지 확인합니다.

**Flow.** 피드 제공 → 가구로부터의 derived constraints → 자체 checkout을 통한 주문 → fulfilment events → (동의 시) execution reports로부터의 reputation.

**그들의 업무를 어떻게 발전시키는가.** 수십 개의 벤더 통합 대신 중립적인 레이어에 대한 접근; 낭비를 줄이는 수요 신호 (later, 경쟁법 검토 이후); 보험사가 가격을 책정할 수 있는 certification; 안전에 대한 공개 기록.

**사회에 기여하는 방식.** 매장과 식탁 사이의 음식 손실 감소; 부패하기 전 주방에 도달하는 surplus; 안전하지 않은 행동을 하도록 설득될 수 없는 가정 내 기기들.

---

## 3. 제공자: 식료품점, 농장 및 협동조합, 배달, 에너지, AI 및 모델 벤더, 레시피 발행자

**Message.** 제공자는 Cookwala에 테넌트가 아닌 피어로 연결됩니다. 식료품점이나 배달 서비스는 제약 사항을 받을 뿐, 가구의 사실 관계를 결코 받지 않습니다. AI 벤더는 자신의 모델이 주방에서 안전함을 보여주는 벤치마크와 오늘 바로 사용할 수 있는 MCP 서버를 받습니다. 레시피 발행자는 모든 레시피에 자신의 이름을 유지하며 정적 폴더에서 서명된 카탈로그를 발행할 수 있습니다.

**Options.** 카탈로그(레시피) 게시 · offer feed 게시 · agent-safety benchmark 실행 · registry node 실행 · SMS로 surplus 제공.

**첫 번째 성공.** 레시피 게시자: `cookwala init my-dish`, 수정, `cookwala validate`,
`cookwala hash`; 당신의 카탈로그는 `/.well-known/cookwala.json`이 포함된 폴더입니다. AI 벤더:
MCP 서버를 추가하고 10가지 agent-safety cases를 실행하십시오.

**Flow.** 카탈로그 또는 피드 → 귀하의 검증된 네임스페이스 아래의 registry 항목 → 문제가 발생할 경우 recall 피드 → 결과로부터의 평판.

**그들의 작업을 어떻게 발전시키는가.** 하나의 형식을 통해 모든 장치와 에이전트에 도달합니다;
서명을 통한 신용 및 출처; 정직하게 통과했을 때 마케팅 자산이 되는 안전 벤치마크.

**사회에 기여하는 방식.** 레시피의 출처는 유지되며, 사람을 대신해 행동하는 에이전트는 신뢰받기 전에 measured 됩니다.

---

## 4. 식품: 농부, 요리사 및 셰프, 가정 요리사, 레시피 제작자, 요리 학교

**Message.** Cookwala를 위해 작성된 레시피는 그것을 요리하는 모든 기기에서 당신의 이름과 당신의 요리법을 유지하며, 기계가 절대 건너뛰어서는 안 되는 단계들이 기록되어 있습니다. 과잉 생산된 농장은 SMS로 이를 목록화하여 같은 날 주방에 도달하게 할 수 있습니다. 요리 학교는 스스로를 점검하는 형식으로 식품 안전을 가르칠 수 있습니다.

**옵션.**
- *농부:* `FARM 120KG TOMATO A BB0411`을 프로그램의 게이트웨이(존재하는 경우)로 전송;
  later, 공급 및 수요 신호를 읽음.
- *요리사 및 셰프:* 암기하고 있는 레시피 하나를 Cookwala 레시피로 변환; 본인의 언어로 된
  단계별 문장들을 검토; later, 크레딧과 함께 동의된 세션을 기록.
- *학교:* 9개의 예시 레시피를 교육 사례로 사용; 본인만의 레시피를 추가.

**첫 번째 성공.** Cooks: `cookwala init`, 모든 가열 단계에 대해 종료 조건이 포함된 레시피 하나를 작성하고, 이를 검증합니다. Farmers: 프로필을 실행하는 프로그램에 SMS 제안 하나를 전송합니다 (아직 실행되는 것은 없으며, parser와 vectors는 존재합니다).

**Flow.** 레시피 → validation → catalog → 기기에서의 dry run → execution logs는 실제 기기에서 어떻게 작동하는지 보여줌 → 증거를 통한 수정.

**그들의 작업을 어떻게 발전시키는가.** 이동 가능한 귀속성; 다른 국가의 기계가 요리할 수 있는 레시피; 농부들에게는 과잉 생산물을 폐기물 대신 식사로 바꿀 수 있는 방법.

**사회에 기여하는 방식.** 요리 유산이 영상이 아닌 실무 지식으로서 보존됨;
농가 폐기물 감소.

---

## 5. 인도주의적 차원: NGO, food bank, 커뮤니티 키친, 학교 급식 프로그램, 구호 기관, 기부자

**Message.** Humanitarian Profile은 휴대폰과 스프레드시트를 통해 surplus food를 접시로 옮기고, cold-chain 점검을 기록하며, 식사 수를 계산하고, **개인 데이터를 포함하지 않습니다**. 로봇, 앱 또는 인터넷 없이 작동합니다. 구출된 킬로그램, 제공된 식사 수, 영양 통과율, 식사당 비용, 청구 시간, 안전 사고 등 각각의 방법이 포함된, 방어 가능한 수치를 제공합니다.

**옵션.**
- *Light:* 프로필과 pilot protocol을 읽으십시오; SMS walkthrough를 시도하십시오.
- *Medium:* 한 곳의 사이트에서 4주 동안 CSV templates를 실행하고(level H0)
  impact summary를 계산하십시오.
- *Deep:* baseline과 독립적인 평가자가 참여하는 12주간의 pre-registered pilot;
  food-safety lead와 함께 rule packs를 국가 법률에 맞게 조정하십시오; 자체 registry
  node를 운영하십시오.

**첫 번째 성공.** 하루 분량의 세 가지 CSV 템플릿을 채우고,
`cookwala humanitarian --summary your-folder`를 실행한 뒤,
모든 숫자 아래에 방법이 포함된 `ImpactSummary`를 읽으십시오.

**Flow.** 제공 → 청구 → 온도 확인을 포함한 인도 → 배포 → 영향 요약 → 결과 발표, 그 결과가 무엇이든 간에.

**그들의 업무를 어떻게 발전시키는가.** 사이트 간의 비교 가능한 수치; 후원자를 위한 증거; 문제가 발생한 후가 아닌, 발생 전의 안전 결과; 기부자 시스템이 읽을 수 있는 형식 (HXL, GS1, DHIS2 매핑).

**사회에 기여하는 방식.** 더 많은 음식이 사람들에게 안전하게 전달되며, 그들의 존엄성을 유지합니다:
이름 없음, 얼굴 없음, 프로파일링 없음.

---

## 6. 건강: 영양사, 식품 안전 관리자, 공중 보건 기관, 요양원

**메시지.** 공공 지침에서 도출되어 메뉴와 인계에 적용되는, 기계 검사가 가능한 팩 형태의 영양 및 식품 안전 규칙이며, 귀하의 검토 내용은 직업 및 결과별로 기록됩니다. 어떤 것도 의료적 조언이 아니며, 팩에 명시된 내용 이상의 어떠한 주장도 하지 않습니다.

**Options.** 템플릿으로 pack 검토 (2시간) · national rules에 맞춰 pack 조정 ·
서비스 대상자를 위한 care rules 제안 · later, 프로그램의 aggregate outcomes 읽기.

**첫 번째 성공.** `profiles/humanitarian/care-vulnerable-groups.rulepack.json`과
검토 템플릿을 열고; 세 개의 규칙을 approved, changed 또는 rejected로 표시하십시오; 검토 내용을 제출하십시오.

**Flow.** Draft pack → review → status reviewed → programs adopt → findings in every
distribution → outcomes published with methods.

**그들의 업무를 어떻게 발전시키는가.** 당신의 가이드는 로봇 주방을 포함하여 이를 채택하는 모든 주방에서 실행되며, 당신의 전문성이 기록에 남고, 출판 가능한 리뷰와 연구를 위한 (개인 데이터가 없는 집계된) 결과 데이터셋이 제공됩니다.

**사회에 기여하는 방식.** 대량 급식 식단의 나트륨, 설탕 및 포화 지방 감소; 더 안전한 hot-holding 및 냉각; 기계에 내재된 아동 및 노인에 대한 배려.

---

## 7. 교육: 학교 교사, 교육자, 교수, 연구원, 학생

**Message.** 요리는 세상에서 가장 친숙한 과정이며, Cookwala는 이를 다음과 같은 교육 대상으로 전환합니다: 온도, 단위, 공정한 분배, 안전, 규칙을 따르는 기계들. 연구자들에게 이것은 벤치마크, 데이터셋 형식 및 open-problems 목록입니다.

**옵션.**
- *교사:* 레슨 키트 (`docs/education/LESSON-KIT.md`): "simmer이란 무엇인가"부터 "기계가 절대 해서는 안 되는 일은 무엇인가"까지의 다섯 가지 레슨.
- *교수 및 학생:* 연구 주제 목록, 시뮬레이터, 테스트 조건으로서의 conformance 벡터, LeRobot export, 학위 논문 규모의 오픈 문제.
- *연구자:* 동의된 execution의 데이터셋을 게시; 시뮬레이터의 assumptions 비판; 벡터 제안.

**첫 번째 성공.** 교사: 수업 중에 브라우저 dry run을 실행하고 왜 장치가 refusal before heat를 했는지 질문하십시오. 학생: 도시 시뮬레이터에서 하나의 assumed를 변경하고 그 결과를 설명하십시오.

**Flow.** Lesson → project → dataset → paper → RFC.

**그들의 작업을 어떻게 발전시키는가.** 무료이며, 공개적이고, 인용 가능한 자료; 누구의 소유도 아닌 벤치마크;
RFC를 통한 표준에 대한 공동 저자권.

**사회에 기여하는 방식.** 안전한 주방이 무엇인지 알고 안전 시트를 읽을 수 있는 세대.

---

## 8. 정부: 정부, 부처, 시 공무원, 규제 기관, 정치인 및 입법가, 관리 및 표준 기구

**Message.** 가정용 및 상업용 조리 기계가 가전제품과 소프트웨어를 별도로 위해 작성된 규정에 따라 도입되고 있습니다. Cookwala는 규제 기관에 구체적인 지표를 제공합니다: 장치에서 강제되는 안전 한계, refusal before heat, 서명된 기록, 익명의 사고 보고, 그리고 누구나 실행할 수 있는 conformance suite입니다. 식품 기부 안전을 위해 개인 데이터가 없는 데이터 표준을 제공합니다. 이는 로열티가 없으며 중립적인 거버넌스를 지향합니다.

**Options.** 정책 브리프(`docs/policy/BRIEF.md`)를 읽으십시오 · 식품 기부 데이터 및 조리 기계 안전을 위해 모델 언어를 사용하십시오 · 귀하의 표준화 기구에 Core 0.2 검토를 요청하십시오 · 국가 registry 노드를 실행하십시오 · 귀하의 학교 급식 프로그램과 함께 파일럿에 자금을 지원하십시오.

**첫 번째 성공.** 2페이지 분량의 브리프를 읽고 저장소에서 세 가지를 확인하십시오:
safety limits pack, conformance runner, humanitarian data-protection rules.

**Flow.** Brief → 국가 표준 기구의 검토 → 지침 내 참조 → pilot →
certification scheme.

**그들의 업무를 어떻게 발전시키는가.** 즉시 검토 가능한 기술적 기반; 파일럿으로부터 얻은 증거; 중립적 표준을 통한 산업계로의 채널; 귀하가 이미 사용 중인 인도주의적 데이터 표준과의 상호 운용성.

**사회를 어떻게 발전시키는가.** 가정 내 더 안전한 기기; 서비스를 받는 사람들을 보호하는 식량 구조; 도시 내 폐기물 감소.

---

## 9. 자본: 투자자, 기업가, 자선 단체, 개발 은행

**Message.** 요리는 곧 인프라가 될 것입니다. 표준은 무료이지만, 그 주변의 서비스들인 certification, hub 소프트웨어, 동의된 데이터 세트, registry 운영, 파일럿 프로그램은 비즈니스입니다. 인도주의적 계층은 개발 자금 지원자들이 사전 등록된 평가를 통해 지원할 수 있는 공공재입니다. 이 사이트 어디에서도 어떠한 재정적 약속도 하지 않습니다.

**Options.** 기회, 비즈니스 모델, 로드맵, 리스크 및 거버넌스를 읽어보십시오
(`/investors`) · 파일럿 또는 검토에 자금을 지원하십시오 · 무료 표준과 병행하여 서비스를 판매하는 기업을 지원하십시오 · 자금 지원자 참관인으로서 거버넌스에 참여하십시오.

**첫 번째 성공.** 백서의 문제, 아키텍처 및 리스크 섹션과 실행 계획의 concern register를 읽으십시오; 모든 열려 있는 리스크가 나열되어 있습니다.

**Flow.** 증거 (pilots, conformance, adopters) → 실행 계획의 gates → gates에 연계된 funding → 표준을 위한 neutral foundation, 서비스를 위한 company.

**그들의 업무를 어떻게 발전시키는가.** 정직한 수치를 바탕으로 카테고리를 정의하는 표준에서 선점적 위치를 확보함; 공공의 이익과 분리된 투자 가능한 서비스 기업.

**사회 발전에 기여하는 방식.** 자본은 주장되는 것이 아니라 measured된 곳으로 흘러갑니다.

---

## 10. 생각: 철학자, 윤리학자, 역사학자 및 미래학자

**Message.** 기계가 할머니의 레시피로 요리를 할 때, 그 지식은 누구의 소유인가? 자동화된 돌봄에서 존엄성이란 무엇을 의미하는가? 한 가구의 로봇은 무엇을 알 수 있으며, 그 외에 누가 그것을 알 수 있는가? Cookwala는 코드 내에서 이러한 질문들에 대한 선택을 내렸습니다; 에세이(`docs/essays/`)는 그것들이 무엇이었는지 설명하며 이견을 환영합니다.

**Options.** 에세이 읽기 · 응답 작성 · 규칙 제안 (RFC는 스키마를 가진 철학적 논증임) · household context 프로필의 윤리 검토 위원으로 참여.

**첫 번째 성공.** household data에 관한 에세이와 facet registry의 travel rules를 읽으십시오;
기본값을 변경하고 싶은 facet을 하나 찾고, 그 이유를 말하십시오.

**흐름.** Essay → public comment → RFC → changed default.

**그들의 작업을 어떻게 발전시키는가.** 윤리적 입장이 실행 규칙이 되고, 논거의 공개 기록이 남는 실제 사례.

**사회에 기여하는 방식.** 수백만 가구에 기계가 도입되기 전, 공개된 상태에서 이루어지는 사적인 데이터와 문화적 유산에 관한 결정들.

---

## 11. 모두: 음식, 폐기물, 일자리, 기후 및 미래에 관심을 갖는 사람들

**Message.** Cookwala는 누구라도, 혹은 무엇이라도 안전하게 요리할 수 있도록 레시피를 작성하는 방법이며, 버려질 음식이 그것을 필요로 하는 사람에게 전달되도록 하는 방법입니다. 이것은 무료이며, 어떤 회사에도 속하지 않고, 자신이 알지 못하는 것을 명시합니다.

**Options.** dry run 시도하기 · 시뮬레이터 실행하기 · 레시피 읽기 · 좋아하는 레시피 하나 작성하기 · 로드맵 따르기 · food bank 또는 학교에 알리기.

**첫 번째 성공.** dry run에서 장치를 변경하고 단계가 refusal before heat 되는 것을 관찰하십시오; 그 이유를 읽어보십시오.

**Flow.** 호기심 → 레시피 하나 → 그것을 사용할 수 있는 주방과의 대화 하나.

**그들의 삶을 어떻게 발전시키는가.** 가정 내 더 안전한 기계, 그들만의 레시피 보존, 돈을 주지 않고도 도울 수 있는 방법.

**사회에 기여하는 방식.** 더 적은 폐기물, 더 안전한 식품, 스스로 요리할 수 없는 사람들을 돕는 기계, 그리고 되찾은 인간의 시간.

---

## 12. 일자리와 존엄성, 솔직하게 말하자면

요리 기계는 업무를 변화시킬 것입니다. Cookwala의 입장: 인간은 언제나 요리할 수 있습니다; 초기 사용처는 스스로 요리할 수 없는 사람들과 일손이 부족한 커뮤니티 키친을 위한 것입니다; 요리사의 이름은 레시피가 어디에서 요리되든 그 레시피에 남습니다; 노동자의 목소리가 운영 위원회에 자리를 가집니다; 새로운 역할들(레시피 엔지니어, 푸드 로봇 기술자, certifiers, rule-pack 검토자)이 구체적인 인원수를 약속하지 않은 채 명명됩니다.

## 13. 각 그룹이 사이트의 어디에 위치하는지

| 그룹 | 페이지 |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Companies | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Food | `/for/food/`, `/farmers/` |
| Humanitarian | `/for/humanitarian/`, `/humanitarian/` |
| Health | `/for/health/` |
| Education | `/for/education/`, `/education/` |
| Government | `/for/government/`, `/policy/` |
| Capital | `/for/capital/`, `/investors/` |
| Thought | `/for/thought/`, `/ideas/` |
| Everyone | `/`, `/why/`, `/impact/` |

