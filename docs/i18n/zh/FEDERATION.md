<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->
# 联邦：Cookwala 在没有中心的情况下如何运作

**Status:** draft, 2026-10-04 (RFC-0006)。创始人的照片是一个蜂巢：没有中央指挥，却有着和谐与恢复。本页面说明了这在实践中的含义。

## 1. 节点

| 节点 | 它服务于 | 谁运行一个 |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`，食谱，词汇表，rule packs，密钥，feeds | 食谱发布者，一个 food bank 网络，一所大学，设备制造商，cookwala.ai |
| **Registry** | `/v1/registry.json`：指向 catalogs，collections，devices，packs，benchmarks 的指针 | 任何人；cookwala.ai 运行一个 |
| **Hub** | 厨房的核心 API，本地安全限制，household context | 每个厨房；可离线工作 |
| **Mirror** | 原封不动地重新发布其他节点的已签名项目 | 任何希望在其区域实现韧性的人 |

静态文件夹是一个有效的目录。带有 CSV 模板的手机是一个有效的 H0 级人道主义参与者。

## 2. 是馈送，而非命令

节点发布已签名的馈送：recalls、匿名事件、registry 变更、关键记录。
其他节点轮询它们信任的内容并可能对其进行重新发布。没有任何内容被推送到 kitchen；kitchen 在其在线时进行拉取，并在其不在线时继续工作。

## 3. 验证对象应为发行方，绝非中继方

通过镜像到达的 recall 仅与**issuer**的签名一样可靠。hub 从 issuer 自己的 discovery document 或 did:web 中解析 issuer 的 `KeyRecord`，并逐字节验证 body。镜像的 key 对内容不提供任何证明；编辑 recall 的镜像会破坏签名。`conformance/profiles/federation.json` 中的 Profile vectors 展示了这三种情况。

## 4. Trust lists

每个 hub 都保留一份其信任的 catalogs 和 registries 列表，并附带它们的 keys 和 priority。一个 node 可能会建议 peers (`federation.peers`)；由 hub 决定。cookwala.ai 是此类列表中的一个 entry，而非 root。

## 5. 新鲜度

Registry 条目携带一个 status 和一个发布时间；recalls 携带一个发布时间；household facets 携带一个有效期。陈旧的项目会被重新获取或丢弃。没有任何东西因为其陈旧而被信任，没有任何东西会被静默删除：撤回的条目将作为 tombstones 保留。

## 6. 历史

带有见证检查点的事件日志（Core section 5）使得在没有区块链的情况下也能检测到重写：第二方对日志头部进行会签，随后的重写将不再匹配。检查点头部的公开锚定是可选的，且是一项创始人决策（`docs/research/BACKSTORY.md` section 4.7）。

## 7. 三个相互协作的节点

- **一个 food bank 网络**运行其厨房和捐赠者的 registry，一个适应国家法律的 rule pack 目录，以及一个 SMS gateway。它在 cookwala.ai directory 中列出自己或不列出；其数据永远不必离开其国家。
- **一个设备制造商**运行其能力文档和 safety-limit pack 的目录，发布 conformance 报告，并轮询其客户所使用的目录的 recall feed。
- **一个大学实验室**运行基准食谱和 execution log（经同意）的目录，镜像词汇表，并发布其自身的向量。

它们都不需要 cookwala.ai 在线。

## 8. 尚未构建的内容

一个中央编排器，一个中央身份提供商，一个令牌，一个区块链。Mission profile 的 quorum 决策和编排器保持为可选且实验性的。

