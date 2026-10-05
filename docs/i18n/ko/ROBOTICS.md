<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->

# Cookwala와 로보틱스 스택

Cookwala는 로봇의 어떤 부분도 대체하지 않습니다. Cookwala는 로보틱스 스택에 요리를 위해 누락된 계층을 추가합니다: **무엇을 만들지, 각 단계가 언제 완료되는지, 그리고 절대 일어나서는 안 되는 일이 무엇인지**를, 어떤 로봇, 가전제품, 시뮬레이터 또는 학습 파이프라인도 읽고 확인할 수 있는 형태로 제공합니다.

## 어디에 해당하는지

| 계층 | 계층의 예시 (2026; 이들 중 어느 것과도 통합이 존재하지 않음) | Cookwala가 추가하는 것 |
|---|---|---|
| 로봇 및 가전제품 | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, 주방 로봇 (Moley, Miso, Chef Robotics), 스마트 오븐 | dry-run, refusal before heat 또는 요리를 할 수 있는 장치 독립적 레시피; 온디바이스 안전 제한 |
| 미들웨어 | ROS 2, ros-controls, Open-RMF (플릿), Matter (가전제품) | 레시피 및 단계를 위한 ROS 2 actions (`bindings/ros2`); Matter op 매핑 초안 (`bindings/matter.json`, 미검증); Open-RMF 태스크는 계획된 기여임 |
| 로봇 학습 | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | 데이터셋을 위한 자연어 단계 태스크 및 단계 세그먼트; 평가 대상으로서의 완료 기준 |
| 시뮬레이션 | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | 테스트 조건으로서의 operation envelope 및 conformance 벡터 |
| AI 에이전트 | MCP, A2A, Claude, OpenAI 및 오픈 모델 | AgentMandate, untrusted-text rule, 주방 에이전트 안전 벤치마크 |

Cookwala는 의도적으로 **motion** 위에 있습니다. 현대의 로봇들은 manipulation을 end to end로 학습합니다;
Cookwala는 그들에게 task, success test 그리고 safety envelope를 부여하고, execution log를 돌려받습니다.

## ROS 2

`bindings/ros2/`는 두 가지 액션을 정의합니다:

| 작업 | 목표 | 피드백 | 결과 |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | 최종 상태, refusal reason, `ExecutionLog` |
| `ExecuteNode` | 하나의 recipe node, 해당 operation envelope, 선택적인 더 좁은 target | 진행 상황, medium temperature, target 도달 | Envelope OK, 사용된 rung, step 요약, deviation |

`ExecuteRecipe` 목표를 **취소**하는 것은 `StopRequest`입니다: 서버는 안전하게 중단해야 합니다.
**안전 제한**은 장치 내부에 유지됩니다; 어떤 목표 필드도 이를 변경할 수 없습니다. 레시피를 여러 로봇에 나누어 전달하는 hub는 `ExecuteNode` 목표를 전송하며, fleet-level 배차를 작업으로서 **Open-RMF**에 넘길 수 있습니다.

## LeRobot 및 robot-learning 데이터셋

LeRobot의 루프는 teleoperate → record → train → deploy이며, its LeRobotDataset v2.1은
natural-language tasks를 `meta/tasks.jsonl`에 저장합니다 (v3는 metadata를 parquet로 이동했습니다; exporter는 현재 v2.1-style 파일을 작성하며 v3 writer가 next입니다). Cookwala 레시피는 이미 단계당 한 문장을 포함하고 있으며, execution logs는 각 단계가 언제 시작되고 종료되었는지 기록합니다.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

이것은 다음을 작성합니다:
- `meta/tasks.jsonl`, 레시피 단계당 하나의 task;
- 레시피 hash, step segments (시작 및 종료 초, sensor-ladder rung, envelope result) 및 가구의 동의가 포함된 `meta/cookwala/<log>.json`

비디오와 동작은 로봇 자체의 recorder에서 가져옵니다. export는 dataset consent가 없는 logs를 refusal 합니다.

## 시뮬레이션

`conformance/envelope.json`에 있는 conformance 벡터(예상 결과가 포함된 온도 추적)와 sensor-ladder 규칙은 시뮬레이터에서 즉시 사용할 수 있습니다. 팬, 냄비 또는 오븐의 열 또는 물리 시뮬레이션은 실제 장치가 준수해야 하는 것과 동일한 envelope을 기준으로 점수를 매길 수 있습니다. Isaac Lab, Gazebo 및 MuJoCo는 공개 "cook in simulation" 벤치마크의 후보입니다.

## 관측성

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

이것은 OpenTelemetry trace를 작성합니다: 각 단계마다 하나의 span을 생성하며, `cookwala.*` 속성(rung, envelope OK, deviation) 및 safety-limit 이벤트를 포함합니다. 이는 모든 OTLP backend(Jaeger, Grafana Tempo, LangSmith…)로 로드되므로, 팀은 에이전트를 디버깅하는 것과 동일한 방식으로 장치를 디버깅할 수 있습니다.

## dry run: 이 장치가 이 레시피를 요리할 수 있습니까?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run은 무엇인가가 가열되기 전에 답변을 제공합니다. 이는 장치가 수행하는 단계, 사람이 수행하는 단계, 각 단계가 어떻게 검증될지(sensor, model, time 또는 person), 또는 거부해야 하는 첫 번째 이유를 말합니다.

