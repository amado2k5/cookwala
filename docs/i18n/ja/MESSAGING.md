<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/MESSAGING.md -->
# メッセージング: Cookwala が何を、どのように伝えるか

**Status:** 2026-10-04. ページが作成される前に記述されました。すべてのページはこのドキュメントに従います。

## 1. 1つの文章

**Cookwalaは、人、キッチン、そしてロボットが安全に調理するためのオープンスタンダードです。**

Arabic: **Cookwala は、人々、キッチン、そしてロボットのための、安全な調理のためのオープンスタンダードです。**

## 2. あらゆる場所で使用されるトライアド

Cookwalaのレシピには、マシンがチェックできる3つのことが記載されています：

1. **何を作るか。** 機械が計画できるステップとしてのレシピ。
2. **いつ完了するか。** 測定可能な温度、食品の状態の合図、および時間。
3. **何が絶対に起きてはならないか。** デバイスが自身に対して強制する安全制限。

アラビア語: **何を料理するか。いつ熟成するか。決して起こってはならないことは何か。**

## 3. 正直に語られるミッション

- **Mission:** 飢餓を終わらせるのを助け、人々をより健康にし、ロボットを人々のために働かせること。
- **How we say it:** 「Cookwalaは、…（廃棄の削減、より安全な救済、より安価な食事、調整）というメカニズムを通じて、飢餓を終わらせるのを助けます」とし、決して「Cookwalaは飢餓を終わらせる」とは言わない。
- **The caveat, once per page where the mission appears:** 飢餓には多くの原因があります：貧困、紛争、気候、価格、政策。Cookwalaの役割は、実在するものであり、かつ部分的なものです。

## 4. 抑制を伴う3つのホライゾン

| Horizon | 言うべきこと | 言うべきでないこと |
|---|---|---|
| Now (to 2028) | 推測するのではなく refusal before heat を行うより安全なデバイス；マシン間で動作するレシピ；電話とスプレッドシートでより多くの救済を行う food bank；騙されることのないエージェント；今日から実行できるオープンなツール | "widely adopted", "proven" |
| Next (2028 to 2036) | あらゆる料理を作る家庭用および業務用ロボット；レシピを存続させる同意済みのデータセット；新しい役割；より少ない廃棄物；より安価で健康的な食事；規制当局が参照する標準 | "robots in every home", ロボットの数 |
| Later (2036 and beyond) | インフラとしての料理：災害地や料理ができない人々を含む、あらゆる場所のあらゆる人のための栄養価の高い食品；より少ない廃棄物とより低い排出量；取り戻された人間の時間；料理の遺産を消し去るのではなく、それを継承するマシン | 日付、数、"end hunger" |

読者はメカニズムに従うことでスケールを発見します。私たちはそれを告知しません。

## 5. ルールの作成

- 平易な言葉、短い文章。1文につき1つのアイデア。
- バズワードは使用しない：revolutionary, disruptive, AI-powered, world-class, first and largest は使用しない。
- すべての数値は、そのソースとともに数値の横に **measured**, **modelled** または **assumed** と記載する。
- まだ存在しないものについては **now / next / later** を使用する。サービスが存在するかのような暗示は決してしない。
- 存在しないパートナー、ユーザー、パイロット、引用、ロゴ、または推奨事項は記載しない。組織はソースとして、または「協力したい相手」として、ラベルを付けて記載する。
- 人々は役割と状況によって記述し、欠損によって記述しない。「the vulnerable」を名詞として使用しない。「children under five」や「people who cannot cook for themselves」とする。
- 安全性は単位を伴う数値であり、「safe」という言葉単体では使用しない。
- refusal は良いニュースである。「the device refuses before anything heats up」と誇りを持って述べる。
- すべての影響に関するページおよびロードマップのページにおいて、何を知らないか、何が間違っていたかを述べる。
- コードはコードブロック内に記述する。すべてのコマンドの後に期待される出力を記載する。
- アラビア語は、翻訳の付け足しではなく、第一級のバージョンとする：同じ構造、同じ誠実さ、右から左へのレイアウト、読者が期待するアラビア数字（技術的な内容では西欧数字も許容される）。

## 6. 用語集

| 用途 | 代わりに |
|---|---|
| recipe, step, done, safe band, limit, refuse, check, verify, consent | instruction set, AI brain, smart, autonomous |
| device, executor, hub | the robot (ロボットを指す場合を除く) |
| people who cannot cook for themselves | the elderly, the disabled |
| food bank, community kitchen, program | beneficiaries, recipients |
| measured, modelled, assumed | estimated, projected (ラベルなし) |
| now, next, later | coming soon, roadmap item (ホライゾンなし) |

## 7. 本日提示可能な証明

ビルド時のリポジトリからカウント (`/v1/stats.json`): 物理的定義を持つ operations、conformance vectors、safety limits、agent-safety tests、humanitarian rules、schemas、published recipes、languages、simulators。それぞれがその種類を示します。ソースが引用されていない限り、それ以外は数値ではありません。

## 8. 動詞によるアクションの呼び出し

try (dry run, simulator) · read (quickstart, Core, whitepaper) · build (SDK, hub, MCP) ·
publish (recipe, device, pack) · pilot (humanitarian) · review (rule pack, envelopes) ·
teach (lesson kit) · legislate (model language) · partner and invest (investors page) ·
contribute (RFC, translation, vectors).

## 9. Headline bank

- 安全に調理するためのオープンスタンダード。
- 何を作るか。いつ終わるか。決して起こってはならないことは何か。
- 推測するのではなく、拒否するデバイス。
- 廃棄されるはずの食品が、SMSによって、安全に、皿に届く。
- すべての料理に、調理者の名前が添えられている。
- 安全性はローカルである。同意は明示的である。記録は確認できる。
- ロボットは動き方を学んでいる。誰も調理方法を書き残していなかった。

## 10. すべてのページに含まれるもの

ステータスチップ（Core normative, draft profile, experimental, planned）、フッターの1文、レイヤーごとのライセンス、批判へのリンク、および結果を記載するすべてのページにおける「what we don't know yet」ブロック。

