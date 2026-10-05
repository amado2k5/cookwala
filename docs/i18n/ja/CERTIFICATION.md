<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance と certification への道

**Status:** draft, 2026-10-04 (RFC-0008). まだ認証機関は関与していません。これは標準が提供する経路です。

## 1. 3つのステップ

| ステップ | 誰が | 意味 | 表示形式 |
|---|---|---|---|
| **Self-declared** | メーカーまたはパブリッシャー | 公開ツールを用いて公開ベクトルを実行し、自身の鍵で署名された `ConformanceReport` (`schemas/conformance.schema.json`) を公開した | suites と counts を含むレポート。バッジとして表示されることはない |
| **Verified** | registry オペレーター | 同じベクトルセットのハッシュに対して実行を再現し、レポートにカウンター署名した | レポートと verifier |
| **Certified** | 独立した certifier (現在は存在しない) | 公開されたスキームに基づき、suite に加えてハードウェアおよび safety-case のチェックを実行し、マークを付与した | レポート、certifier、マーク |

クラスのいずれかのベクトルに失敗したレポートは、そのクラスを主張することはできません。registryはバッジではなく、レポートを表示します。

今日、唯一の registry オペレーターは仕様のメンテナー (cookwala.ai) であるため、2つ目の registry が存在するまで "verified" は独立性を追加しません。ステータスは依然として self-verification として表示されます。

## 2. レポートの内容

コアバージョン、主張されたクラス (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) またはプロファイル主張 (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`)、対象 (product, vendor, version)、合計および失敗した
vector ids を伴って実行された suites、vector set のハッシュ、ツールと commit、日付、status および
verifier。例: `examples/conformance/report-reference.json`、以下によって生成された

```bash
python tools/run_conformance.py --report report.json
```

## 3. クラスとそれが証明するもの

| クラス | ベクトル | certification にも必要（ベクトルではカバーされない） |
|---|---|---|
| Recipe publisher | hash, envelope (bands 内の targets), units | 食品安全の専門家によるレシピの content review |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | デバイス自身の safety case (適用可能な場合は ISO 13482, IEC 60335, UL 3300); measured されたローカル停止レイテンシ; ネットワークなしで強制される safety limits |
| Catalog | hash, signature, key revocation, recalls | key の保管および incident intake プロセス |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | method ごとに model に基づいて公開される結果 |
| Verifier | すべての Core suites | なし |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; 個人データの audit はなし |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name および version のルール, tombstones | namespace proof プロセス |

## 4. certification が約束できないこと

conformance レポートは、ソフトウェアが実行された日にベクトルが要求する通りに動作したことを証明します。
それは、デバイスがあらゆるキッチンで安全であること、レシピが正しい味であることを、あるいは、いかなる危害も起こり得ないことを証明するものではありません。危害ゼロを約束する標準は不誠実なものとなるでしょう。この標準は、制限がローカルで強制されること、refusal before heat が発生すること、そして記録が確認可能であることを約束します。

## 5. マークのガバナンス

認証マークとそのルールは、商標とともに中立的な基盤（`GOVERNANCE.md`）へと移行します。それまではマークは存在せず、レポートのみが存在します。

