<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# 私たちが公開した批判事項

私たちは Cookwala について難しい質問を投げかけ、その回答を書き留めました。各懸念事項には [action plan's concern register](ACTION-PLAN.md#2-concern-register) 内に id が割り当てられており、私たちの回答とその status が併記されています。外部からのレビューも歓迎しており、ここに記載されます。

## これはうまくいくでしょうか？ (strategy)

| 懸念事項 | 短い回答 | ステータス |
|---|---|---|
| 市場がまだ存在しない。仕様が製品に先行している | Small Core、まずはデモ、ユーザーなしでの新仕様策定は行わない | Core 0.2 完了；次は device demo |
| 強力な主体が採用する理由がない | 各採用者の利益を主導する；ロボットなしでも有用 | food-bank パイロットおよび device パートナーを募集中 |
| シミュレーターは想定していることを証明しているに過ぎない | 公平な baseline、範囲、"illustrative" ラベル；パイロットがそれらに取って代わる | Open |
| 飢餓は余剰ではなく、貧困と紛争の問題である | Cookwala は貢献する；単独で飢餓を終わらせると主張するものではない | メッセージを変更済み |
| 安全性、責任、および攻撃対象領域 | デバイス上で制限を強制；refusal；recall；インシデントレポート | 仕様完了；certifier によるレビューは Open |
| プライバシー（健康および宗教データ、台帳 vs 消去） | Local-first、選択的開示、hash-only logs、同意 | 仕様完了；影響評価は Open |
| 複雑すぎる | Core 0.2；その他はすべて experimental と表記 | 完了 |
| 創業者への依存 | 中立的なホームへのガバナンス経路 | GOVERNANCE.md |

## 技術設計は健全ですか？

| 懸念事項 | Core 0.2 で変更された点 |
|---|---|
| Operations に物理的な意味がなかった | Envelopes, heat levels, sensor ladders, altitude rule, test vectors |
| 単位と数値のバグ | °C のみ, absolute tolerances, kitchen units, densities, decimal money |
| Schemas がタイポを許容していた | `x-` extensions を持つ strict schemas; offline bundle |
| 変更可能な Mission ドキュメントが1つだった | Event log + projection, single sequencer, transitions table |
| Ledger がほとんど役に立たなかった | revocation を伴う key records, witnessed checkpoints, rewrite detection |
| 未定義の event delivery; バス上の安全性 | Sequence numbers, latency classes, heartbeats, "safety is local" |
| API surface の乖離 | Core OpenAPI; CI でのすべての reference のチェック |
| Verifier がなかった | Reference library と 106 conformance vectors |

## 私たちが求めているレビュー

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), 食品科学者
(envelopes), 食品安全責任者および管理栄養士 (rule packs), セキュリティ監査、
データ保護レビュー、および認証機関によるギャップ分析。
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced)を参照してください。

