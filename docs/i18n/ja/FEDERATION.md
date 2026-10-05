<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->

# 連合：中心を持たない Cookwala の仕組み

**Status:** draft, 2026-10-04 (RFC-0006). 創業者の写真はミツバチの巣でした。中央の指令室はなく、それでいて調和と回復がありました。このページでは、それが実務において何を意味するかを述べています。

## 1. ノード

| ノード | 何をサービスするか | 誰が運用するか |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | レシピパブリッシャー、food-bank ネットワーク、大学、デバイスメーカー、cookwala.ai |
| **Registry** | `/v1/registry.json`: catalogs, collections, devices, packs, benchmarks へのポインタ | 誰でも; cookwala.ai が運用 |
| **Hub** | キッチン用の Core API、ローカルな安全制限、household context | すべてのキッチン; オフラインで動作 |
| **Mirror** | 他のノードの署名済みアイテムをそのまま再公開 | 自身の地域でのレジリエンスを求める人なら誰でも |

静的なフォルダは有効なカタログです。CSVテンプレートを持つ電話は、レベル H0 における有効な人道支援参加者です。

## 2. コマンドではなく、フィード

ノードは署名付きフィードを公開します：recalls、anonymous incidents、registry changes、key records。
他のノードは自身が信頼するものをpollし、それをrepublishする場合があります。キッチンへ何もpushされることはありません。キッチンはオンラインの時にpullを行い、オフラインの時でも動作を継続します。

## 3. リレーではなく、必ず発行元に対して検証すること

ミラーを通じて届く recall は、**issuer** の署名と同等の価値しか持ちません。hub は、issuer 自身の discovery document または did:web から issuer の `KeyRecord` を解決し、body をバイト単位で検証します。ミラーのキーは内容について何も証明しません。recall を編集するミラーは署名を破損させます。`conformance/profiles/federation.json` 内の Profile vector がこれら3つのケースを示しています。

## 4. Trust lists

各 hub は、自身が信頼するカタログと registry のリストを、それらの key と優先度とともに保持します。
node はピア (`federation.peers`) を提案することがありますが、決定を行うのは hub です。cookwala.ai はそのようなリストの一つのエントリであり、root ではありません。

## 5. Freshness

Registry entriesはstatusとpublication timeを伴い、recallsはissue timeを伴い、household facetsはvalidityを伴います。Staleなアイテムは再取得されるか、破棄されます。古いからといって何も信頼されず、何も黙って削除されることはありません。取り下げられたentriesはtombstonesとして残ります。

## 6. 履歴

目撃されたチェックポイントを伴うイベントログ（Core section 5）は、ブロックチェーンなしでも書き換えを検知可能にします：第二者がログのヘッドに副署を行うため、後の書き換えが一致しなくなります。チェックポイントのヘッドのパブリックアンカリングは任意であり、創設者の決定事項です (`docs/research/BACKSTORY.md` section 4.7)。

## 7. 相互運用する3つのノード

- **A food-bank network** は、キッチンとドナーの registry、国内法に適応した rule pack のカタログ、および SMS gateway を運営します。それは cookwala.ai directory に自身を掲載するかどうかを選択でき、そのデータが国外に出る必要はありません。
- **A device maker** は、capability documents と safety-limit packs のカタログを運営し、conformance reports を公開し、顧客が使用するカタログの recall feeds をポーリングします。
- **A university lab** は、ベンチマークレシピと execution logs（同意がある場合）のカタログを運営し、語彙をミラーリングし、独自のベクトルを公開します。

それらのどれも cookwala.ai がオンラインである必要はありません。

## 8. 構築されていないもの

中央オーケストレーター、中央アイデンティティプロバイダー、トークン、ブロックチェーン。Missionプロファイルのクォーラム決定とオーケストレーターは、オプションかつ実験的な状態に留まります。

