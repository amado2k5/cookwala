<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->
# 影響：Cookwalaが変え得るもの、出典およびラベルとともに

**Status:** 2026-10-04. 以下のすべての数値は、**measured**（指定されたソースによってカウントまたは報告された）、**modelled**（記載された仮定の下で当社のシミュレーターによって生成された）、または **assumed**（計画上の数値）のいずれかとしてラベル付けされています。ここにあるものは、Cookwalaが現場で出した結果ではありません。パイロットはまだ実施されていません。このページでは、問題の規模と、Cookwalaが貢献するメカニズムについて述べています。

## 1. Hunger

| 事実 | 数値 | ラベルおよび出典 |
|---|---|---|
| 2023年に飢餓に直面した人々 | 約7億3300万人 | measured by the source: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| 2023年に中程度または深刻な食料不安状態にあった人々 | 約23億人 | measured by the source: SOFI 2024 |
| 収穫から小売までの間に失われた食料 | 生産された食料の約14 % | measured by the source: FAO, *The State of Food and Agriculture 2019* (UNEPは同じ数値を13 %に丸めている) |
| 2022年に小売、フードサービス、およびhousehold contextにおいて廃棄された食料 | 約10.5億トン; 1人あたり約132 kg; household contextでは1人あたり約79 kg | measured by the source: UNEP, *Food Waste Index Report 2024* |

**Cookwalaのメカニズム:** 食品が腐敗する前にキッチンに届くsurplusの提供、およびすべての引き渡し時におけるcold-chain check (Humanitarian Profile); プログラムが比較・改善できるよう、すべてのサイトで同様にカウントされるimpact; later、栽培や移動の後に廃棄されるものが少なくなるよう、集計されたdemandおよびsupply signals (experimental, 競争法の審査に基づき制限)。 **行わないこと:** 飢餓の主な要因である、貧困、紛争、気候ショック、価格、または政策への対処。

**modelled, 概念的であり、予測ではない:** 国別シミュレーターの混合ロールアウトによる救済は、架空の食料不安人口が必要とする量の約 4.7 % に相当する食事を救済します。世界シミュレーターの「protocol, no robots」シナリオでは、救済のみを通じて、約 7億7000万人（シミュレーターのassumed baselineであり、上記の7億3300万人measuredを切り上げた数値）の飢餓人口のうち約4000万人に到達します。両者は同じことを述べています。救済は重要であるが、それだけでは不十分である。

## 2. 健康

| 事実 | 数値 | ラベルおよび出典 |
|---|---|---|
| 不安全な食品による毎年の疾病 | 約6億人; 約420,000人の死亡 | 出典によりmeasured: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| 塩分摂取量とガイドラインの比較 | most peopleは1日あたり9〜12 gの塩を摂取; WHOは5 g (2 g sodium)未満を推奨 | 出典によりmeasured: WHO fact sheet on salt reduction |
| 高ナトリウムに起因する毎年の死亡者数 | 約1.9 million | 出典によりmeasured: WHO, *Global report on sodium intake reduction* (2023) |
| 汚染された調理燃料に依存している人々 | 約2.1 billion; household air pollutionにより年間約3.2 million人の死亡 | 出典によりmeasured: WHO fact sheet on household air pollution (2024) |

**Cookwalaのメカニズム:** デバイス上で強制され記録される、クリティカルコントロールポイントおよびホットホールディング、冷却、再加熱の制限; メニュー上のナトリウム、遊離糖類、飽和脂肪酸、および果物と野菜をフラグ立てするrule pack; 子供、妊娠、および高齢者のためのケアルール; 管理栄養士や食品安全担当者がパックを保証できるようにするためのレビュー記録。
**行わないこと:** 治療食の診断、治療、または計算; `docs/health/CLAIMS-POLICY.md` を参照してください。

**Clean cooking** は図には含まれていますが、モデルには含まれていません：シミュレーターは、薪や木炭による調理、またはその健康への影響をまだカウントしていません（制限事項として記載されています；next）。

## 3. 環境

| 事実 | 数値 | ラベルおよび出典 |
|---|---|---|
| 食品ロスおよび食品廃棄物による世界の温室効果ガス排出量の割合 | 約 8 〜 10 % | 出典により measured: UNEP, *Food Waste Index Report 2024* |

**modelled, 模範的な例:** ワールドシミュレーターにおいて、「プロトコルを持つ多くのロボット」は、それらが存在しない同じ世界と比較して、5年間で食料の紛失または廃棄を約 4.1 %、排出量を約 5.2 %削減します。「多くのロボットのみ」では、家庭の廃棄物は削減されますが、家庭に届く前の紛失が約 3 %増加します（ブルウィップ効果）。ロボットの電力（そのシナリオでは5年間で約 164 TWh）もカウントされます。これらは、各シミュレーターのページに記載されている、モデルの仮定に基づくモデルの出力です。

## 4. 経済と仕事

**assumed and modelled:** 都市シミュレーターは、1人あたり月間約 5 USD と推定しています
食費が減少し、ロボットによる調理と買い物により、1世帯あたり月間約 10 hours 減少します
調理、ハードウェアは含まれません。雇用の数値はどこにも示されていません。新しい役割が
（recipe engineers, food-robot technicians, certifiers, rule-pack reviewers）として
数値なしで挙げられています。

## 5. 文化

番号なし。その主張は定性的であり、検証可能です：Cookwala レシピには、調理者の名前、料理のアイデンティティ（何が不可欠か、何が柔軟か、何が絶対に追加されないか）、調理者の言語によるテキスト、そして署名が含まれます。それを調理する機械は、クレジットと共に、作業知識としてそのレシピを継承します。

## 6. 測定すべきものがあるときに、私たちが測定すること

| 尺度 | 方法 | 定義場所 |
|---|---|---|
| 回収されたキログラム、提供された食事、到達した人数、栄養合格率、食事あたりのコスト、申請までの時間、申請率、安全ブロックの発見事項、安全インシデント | Offer, Claim, Handover および Distribution ドキュメントから算出 | Humanitarian Profile section 10; `ImpactSummary` |
| 検証済みの調理師: 適合する execution log を伴い、署名済みのレシピをエンドツーエンドで実行した execution | 同意を伴う execution logs | `STRATEGY.md` section 11 |
| conformance を通過した独立した実装 | 公開された conformance reports | `docs/CERTIFICATION.md` |
| モデルごとの Agent-safety 結果 | model id、日付、config hash を含む promptfoo ベンチマーク | `evals/kitchen-agent-safety/` |

## 7. まだ分かっていないこと

そのプロファイルを用いることで、food bank が現在の方法よりも多くの救済を行えるかどうか（pilot protocol は存在しますが、pilot はまだ実行されていません）。すべての料理に対して operation envelope が適切であるかどうか（food scientist によるレビューは行われていません）。シミュレーターの行動に関する assumed な仮定が成立するかどうか（それらはリスト化されており、調整可能です）。リバウンド効果がどの程度大きいか。ここにあることは、いかなる約束でもありません。

## 8. 何がうまくいかなかったのか

何もデプロイされていないため、現場で問題が発生したことはありません。リポジトリ内では：最初のワンライナー（"world's first and largest robot cooking recipes index"）は存在していたものを誇張していたため変更されました。最初の Mission スキーマは未知のフィールドを受け入れていたため、厳格化されました。最初のシミュレータは strawman ベースラインを使用していましたが、competent-integration ベースラインと範囲を獲得しました。これらの変更を促した批判は公開されています (`docs/CRITIQUES.md`)。

## 9. Sources

- FAO, IFAD, UNICEF, WFP and WHO, *The State of Food Security and Nutrition in the World
  2024*, Rome, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Rome, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Geneva, 2015.
- WHO, *Global report on sodium intake reduction*, Geneva, 2023; WHO fact sheet *Salt
  reduction*.
- WHO fact sheet *Household air pollution*, 2024.

数値は、ソースが公表している通りに、四捨五入して引用されます。印刷物に引用する前に、現在の版と照らし合わせて再確認してください。組織はソースであり、パートナーではありません。

