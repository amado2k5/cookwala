<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->

# Household Context Profile: the whole picture stays home

> **Status: draft profile** (RFC-0001). Cookwala Coreの一部ではありません。Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Recipient rules: `profiles/household/recipient-roles.json`. Local API:
> `api/household.openapi.yaml`. Example: `examples/household/context.json`.

## 1. なぜ

家族にうまく奉仕するロボットには、多くのことを知る必要があります。家電製品とその癖、誰がそこに住んでいていつ家にいるのか、ペット、子供、食事、アレルギー、服薬のタイミング、儀式、予算、買い物習慣、前回何がうまくいかなかったのか。同じ事実が、空き巣の計画であり、プロファイリングのツールでもあります。このプロフィールは、**planner at home** に全体像を与え、他のすべての人には**constraint**のみを与えます。

## 2. 3つのアイデア

1. **Facets.** 各々1つの型付けされた事実 (`cw.facet.household.health.allergies`)、誰がそれを断定したか（declared, observed, reported, inferred）、いつ、どのくらいの期間、どの程度の確信度か、およびプライバシークラス (`public`, `household`, `sensitive`, `secret`)。
2. **registry 内の Travel rules.** すべての facet type は、その raw value が家を出てよいかどうかを規定する: `never` (45 types: children, absences, layouts, health conditions, religion, behaviour, incidents, income posture)、`derived` constraint としてのみ (81 types)、または明示的な許可の後の `consented` disclosure として (13 types, 主に device maker のための device self-state)。
3. **Derived constraints.** 食料品店、プランナー、配送サービス、デバイスメーカー、または他のロボットが受け取る唯一の household object: "deliver 17:00–18:00 to the front door"、"block peanuts"、"no robot movement in the hallway 15:00–15:30"、"budget cap 18.00 USD per meal"。それぞれが、それが由来する facet **types** を指定し、その values は決して指定しない。

## 3. 誰が何を受け取るか

| 受信者の役割 | 受信可能事項 |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (食事を計画するAIまたはソフトウェア) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; consentに基づくdevice self-state facets |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | device fault summary のみ (カテゴリ別のfaultの回数、時刻やhousehold factsは含まない)、かつhouseholdがinsurerを受信者として指定した場合のみ; RFC-0001では、プライバシーレビューが異議を唱えた場合に削除される可能性が最も高い役割としてこれがリストされています |
| program (food bank, school) | なし |
| dataset | なし |

## 4. Rules

- 生の facet は決してデバイスから離れません。ホームネットワーク外の誰に対してもそれらを返す API は存在しません。
- `inferred` facet は安全に関する決定には決して使用されません。
- いかなる人物の行動スコアも生成または保存されません。行動 facet は household に奉仕するため（分量、片付けのタイミングなど）に存在し、決して外部へ送信されません。
- 経済レベルは **owner-set budget posture** であり、何からも inferred されることはありません。
- 子供のデータおよび不在は `secret` であり、決して外部へ送信されません。スケジュールを明らかにしない移動や safe-zone constraints としての derived なものを除きます。
- すべての facet は消去可能です。消去は household のウィンドウ内（デフォルト 7 days、最大 30）で完了し、内容は含まずにログに記録されます。
- プライバシークラスは registry のデフォルトより高く設定されることはありますが、低く設定されることはありません。

## 5. ローカル・インシデント・メモリ

RFC-0001は、ロボットがアラーム、コンフリクト、ギブアップ、および教訓について何を記憶しているかを問うものである。`LocalIncident`がそれらを保持する：日付、`vocab/incidents.json`からのカテゴリ、種類別の関与者、ノート、および教訓。それは決して家庭（home）の外に出ることはない。Coreにある公開された匿名の`IncidentReport`は、すべてのメーカーがそこから学ぶ異なるドキュメントである。

## 6. Conformance

プロファイルベクトル (`conformance/profiles/disclosure_policy.json`) は facet と受信者ロールを提供し、正確な constraint type、開示される id、および理由を伴う非開示の id を期待します。リファレンス実装は `tools/cookwala_ref.py` 内の `derive_constraints()` です。

## 7. 他の文書との関係

`ClientProfile`、`KitchenProfile`、および `RobotProfile` (`profile.schema.json`) は、便利なバンドルとしてそのまま残ります。Mission facets (`mission.schema.json`) は同じ registry ids を使用します。Core `AgentMandate` は、エージェントができることの規範的な声明として維持され、mandate facets は household context のルールをローカルに記述します。

## 8. 未解決の質問

RFC-0001を参照してください: closed recipient roles; raise-only privacy; レビュワーを伴うデータ保護影響評価。

