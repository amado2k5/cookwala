<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Durum:** taslak, 2026-10-04. Bu, Cookwala'nın normatif kısmıdır. MUST, SHOULD ve MAY kavramları RFC 2119'u takip eder. Burada listelenmeyen her şey isteğe bağlı bir **profile** (bölüm 10) niteliğindedir.

Bir cihaz, Core'u yaklaşık bir haftada uygulayabilmelidir. Core, **ne yapılacağını, ne zaman bittiğini ve asla neyin gerçekleşmemesi gerektiğini** söyler. Bir robotun nasıl hareket ettiğini söylemez.

## 1. Conformance sınıfları

| Sınıf | Uygulamalıdır |
|---|---|
| **Recipe publisher** | Geçerli `recipe.schema.json` dokümanları; operation envelopes içindeki sıcaklıklar; bir hash ve bir imza |
| **Executor** (robot, appliance veya hub) | Core API (`api/core.openapi.yaml`); operation envelopes ve sensor ladders; yerel güvenlik limitleri; tahmin yerine refusal; execution log |
| **Catalog** | İmzalı tarifler, anahtar kayıtları içeren `/.well-known/cookwala.json`, recall akışı, olay girişi |
| **Agent** (bir kişi adına hareket eden AI veya yazılım) | Yalnızca bir `AgentMandate` altında hareket eder; doküman metnini veri olarak işler; `confirmBefore` içindeki herhangi bir şeyden önce asile sorar |
| **Verifier** | Hash'ler, imzalar, anahtar geçerliliği ve iptali, açıklamalar, olay zincirleri ve kontrol noktaları |

Bir sınıf talep etmek, onun conformance vektörlerinden geçmek anlamına gelir (`conformance/`, `tools/run_conformance.py` ile çalıştırın).

## 2. Temel belgeler

| Doküman | Şema |
|---|---|
| Tarif | `recipe.schema.json` |
| Cihaz yetenekleri | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Paylaşılan tipler (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Olaylar | `event.schema.json` (CloudEvents) |
| Sözlükler: operasyonlar, birimler ve ısı seviyeleri, olaylar | `vocab/*.json` |

Tüm şemalar **strict** yapıdadır: `x-<vendor>-…` uzantıları hariç, bilinmeyen alanlar reddedilir.
Okuyucular anlamadıkları `x-` alanlarını görmezden gelir. `tools/bundle_schemas.py` cihazların çevrimdışı doğrulama yapabilmesi için tek bir bundle üretir. Uygulamalar çalışma zamanında şemaları ÇEKMEMELİDİR.

## 3. Operasyonlar ne anlama gelir

- **Envelopes.** `vocab/ops.json` içindeki her ısı tabanlı veya tehlikeli operasyonun bir `envelope` değeri vardır.
  Şunları belirtir:
  - ortam (su, yağ, hava, tava yüzeyi, ürün…);
  - °C cinsinden sıcaklık bandı (ve basınçlı pişirme için basınç);
  - ajitasyon, kapak, dikkat seviyesi ve adımın gözetimsiz çalışıp çalışamayacağı;
  - tehlikeler;
  - bir test yöntemi.

Örnek: `cw.op.simmer` = 85–96 °C'de su bazlı sıvı; `cw.op.deep_fry` = 160–190 °C'de yağ.
- **Zarfların içindeki hedefler.** Bir tarif hedefi (`params.tempC` veya ortamın sensörü üzerindeki bir `target`) zarfın içinde OLMALIDIR. Doğrulayıcı, bunu bozan tarifleri reddeder.
- **Yürütücüler ortamı zarfın içinde tutar.** Eğer tarif daha dar bir hedef veriyorsa, ilk kez ulaşıldığında ortamı bunun içinde de tutarlar.
- **Rakım.** Su ve buhar bantları, mutfak rakımının her 300 m'si için −1 °C kayar.
- **Isı seviyeleri** (`very_low` … `max`) ortak bir anlama sahiptir: `vocab/units.json` içinde tanımlanan, °C cinsinden bir tava-yüzeyi bandı.
- **Sensor ladder.** Her zarf, adımı doğrulamanın yollarını listeler, en iyiden başlayarak: belirli bir sensör, ardından `model` (kaydedilmiş bir tahmin), ardından `time`, ardından `human`.
  - Yürütücü, karşılayabildiği ilk basamağı kullanır ve bunu `verifiedBy` içine kaydeder.
  - Eğer **hiçbir** basamağı karşılayamazsa, adımı reddetmelidir (`missing_sensor_no_fallback`).
  - Sürekli dikkat gerektiren ve gözetimsiz çalışmayabilecek operasyonlar (soteleme, mühürleme, kızartma, çektirme, karamelize etme…) asla sadece zamana geri dönmez: son basamakak bir kişinin izlemesidir.
  - Deep frying için bir fallback yoktur: yağ sıcaklığı sensörünün olmaması, deep frying yapılamayacağı anlamına gelir.
  - Bir `Condition`, bunu `onSensorMissing` ile daraltabilir.
- **Tahmin değil, refusal.** Bir adımın zarfını, ladder'ını, ekipmanını veya güvenlik limitlerini karşılayamayan bir yürütücü, başlamadan önce bir neden ile `refused` yanıtını VERMELİDİR.

## 4. Sayılar ve birimler

- **Sıcaklıklar kablo üzerinde °C cinsindendir.** Ekranlar dönüştürebilir.
- **Toleranslar.**
  - `tolerance` görelidir ve yalnızca oran ölçekli birimlerde izin verilir.
  - `toleranceAbs` değerin biriminde mutlak değerdir ve °C üzerinde izin verilen tek toleranstır.
  - `Target.tolerance` mutlak değerdir.
- **Mutfak birimleri kesin metrik değerlere sahiptir:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Hacim ↔ kütle bir yoğunluk gerektirir** (`Quantity.densityGPerMl` veya içerik sözlüğü);
  biri olmadan bu bir hatadır, asla bir tahmin değildir.
- **Para birimi bir ondalık dizidir** (`"12.70"`) ve bir ISO 4217 para birimine sahiptir, asla bir float değildir.

## 5. Bütünlük ve güven

- **Hash.** `sha256:` artı belgenin `hash` ve `signature` alanları olmadan RFC 8785 canonical JSON'unun hex özeti. Referans canonicalizer, RFC 8785 örneğini tam olarak yeniden üretir.
- **Signature.** ASCII hash dizisi üzerinde Ed25519 (`EdDSA`). P-256 donanım anahtarları için `ES256` izin verilir. `kid` bir `KeyRecord` adlandırır.
- **Keys.** Bir `KeyRecord` genel anahtarı, sahibini, bir geçerlilik penceresini ve `revokedAt` değerini verir. `signedAt` değeri iptal işleminden sonra veya geçerlilik penceresinin dışında kalan bir imza geçersizdir.
  - Kataloglar anahtarlarını `/.well-known/cookwala.json` içinde yayınlar.
  - Kuruluşlar ve kişiler anahtarlarını did:web belgelerinde yayınlar.
  - Cihazlar anahtarlarını yetenek belgelerinde (capabilities document) yayınlar.
  - Doğrulayıcılar (verifiers), çevrimdışı kullanım için anahtar kayıtlarını önbelleğe alır.
- **Selective disclosure.** İmzalı bir belge, hassas bir değer yerine bir `Disclosure` özeti, `sha256(JCS([salt, value]))` içerebilir. Sahibi, tuzu (salt) ve değeri yalnızca bunları görmeye yetkili taraflara açıklar ve imza hala doğrulanır.
- **Event logs** (Görev profili):
  - Her log için bir sequencer `seq` ve `prev` atar, böylece zincir asla çatallanmaz.
  - Kontrol noktaları (checkpoints) sequencer tarafından imzalanır ve IETF SCITT gibi bir şeffaflık servisini içerebilen tanıklar tarafından karşı-imzalanır. Tanıklık edilmiş bir kontrol noktasından sonra yapılan bir yeniden yazma tespit edilebilir.
  - `hash_only` modunda, yükler (payloads) silinebilir depolamada bulunur ve log yalnızca bunların hash'lerini tutar.

## 6. Güvenlik ve ajan kuralları (normatif)

1. **Güvenlik yereldir.** Yürütücüler cihaz üzerinde bir `SafetyLimits` paketi uygular.
   - Hiçbir tarif, ajan, uzak mesaj, eklenti veya çalışma modu bir sınırı yükseltemez veya devre dışı bırakamaz.
   - Daha katı bir sınır her zaman kazanır.
   - `profiles/core/safety-limits.default.json`, cihaz üreticilerinin kendi güvenlik vakalarından (safety case) sıkılaştıracağı bir taslak başlangıç noktasıdır.
2. **Yerel durdurma.** Cihaz üzerindeki bir durdurma kontrolü, ağ olsun veya olmasın, hareketi 0.5 saniye içinde durdurur ve ısıyı 1 saniye içinde keser. Çağırıcı yürütücüye ulaşabildiği andan itibaren `POST …/stop` yetkilendirme için asla reddedilmez.
3. **Olaylar raporlar; asla koruma sağlamazlar.** `cookwalalatency: local_safety` olayları bir cihazın halihazırda ne yaptığını raporlar. Hiçbir güvenlik fonksiyonu bir olayın gelmesine bağlı olamaz.
4. **Güvenilmeyen metin.** Her serbest metin alanı (`x-cookwala-untrusted` olarak işaretlenmiş), hem yazılım hem de yapay zeka ajanları için veridir ve asla bir talimat değildir. Metin yoluyla talimat verme girişimleri görmezden gelinir ve günlüğe kaydedilir (`cw.incident.untrusted_instruction`).
5. **Ajanlar bir mandate altında hareket eder.** Bir ajan tarafından gönderilen bir istek, asıl kişi tarafından imzalanmış bir `AgentMandate` taşır: kapsamlar, harcama sınırları, izin verilen sağlayıcılar, son kullanma tarihi ve onay gerektiren eylemler.
   - `irreversible` ve `safety_override`, mandate ne derse desin her zaman onay gerektirir.
   - Yürütücüler mandate dışındaki istekleri reddeder (`mandate_scope`).
6. **Gözetimsiz operasyonlar bir kişiye ihtiyaç duyar.** Envelope değeri `unattended: false` olan operasyonlar, sorumlu bir kişinin hazır bulunmasını veya bir dakika içinde ulaşılabilir olmasını gerektirir.
7. **Alerjen blokları reddeder.** Tarifteki veya envanterdeki herhangi bir engellenmiş alerjen isteği reddeder; bir engelleme etrafında ikame yoktur.
8. **Recalls.** Kataloglar `GET /v1/recalls` adresinde imzalı recalls yayınlar. Yürütücüler çevrimiçi olduklarında sorgulama yapar ve geri çağrılmış revizyonları reddeder. `block_and_stop_running` ayrıca çalışan yürütmeleri güvenli bir şekilde durdurur.
9. **Olay raporları** anonimdir (`IncidentReport`: sadece tarih, isim veya id yok) ve her üreticinin her ramak kala olayından ders çıkarması için kataloglara sunulur.

## 7. Yürütme yaşam döngüsü ve API

- **API:** `api/core.openapi.yaml`. Uç noktaları şunlardır:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - katalog tarafı: `GET /v1/recalls`, `POST /v1/incidents`.
- **Durumlar:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` ve `stopping` → yol boyunca `stopped`;
  - `refused` ve `failed` son durumdur.
  - Tam geçiş tablosu `core.schema.json#/$defs/ExecutionState` içinde ve
    conformance vektörlerindedir.
- **İstek kuralları:**
  - Her POST bir `Idempotency-Key` taşır.
  - Mevcut bir yürütmedeki değişiklikler `If-Match: <seq>` taşır; bir uyuşmazlık 412 döndürür.
  - Durdurma işlemi If-Match gerektirmez.
- **Olaylar:**
  - Teslimat en az bir kez gerçekleşir.
  - CloudEvents `id` tekilleştirme anahtarıdır.
  - `cookwalaseq` olayları konu başına sıralar ve durum `seq` ile eşleştirir.
  - Cihazlar `cookwala.device.heartbeat` yayınlar, böylece bir hub kayıp bir cihazı tespit edebilir ve devredebilir.

## 8. Gizlilik

- **Execution logs kişisel veri taşımaz** (`privacy.personalData: "none"`).
- **Cihazdan yalnızca onay (opt-in) ile ayrılırlar** (`consent.dataset`: varsayılan olarak `none`,
  `research_only` veya `open`). Onay geri çekilebilir.
- **Açık veri setleri zamanları güne yuvarlar.**
- **Ev, sağlık ve dini veriler, kişi aksi bir seçim yapmadıkça evde kalır.**
  Seyahat etmesi gerektiğinde, seçici açıklamalar (selective disclosures) olarak seyahat eder.
- **Humanitarian Profile** hiçbir kişisel veri taşımaz.

## 9. Sürümleme ve uzantılar

- **Çekirdek sürümler `0.2.x` şeklindedir.**
  - Okuyucular, kendi minor versiyonlarının herhangi bir patch sürümünü kabul eder.
  - Diğer minor sürümleri `unsupported_version` ile reddederler.
  - Bilinmeyen `x-` alanlarını görmezden gelirler.
- **Yeni operasyonlar, birimler, sensörler ve olay türleri**, versiyon değişikliği yapılmadan sözlüklere eklenir.
- **Bir operasyonun anlamını değiştirmek yeni bir id'dir;** eski olan `replacedBy` ile `deprecated` olarak işaretlenir.
- **Profiller** bağımsız olarak versiyonlanır ve ihtiyaç duydukları Çekirdek versiyonunu beyan ederler.

## 10. Profiller ve durumları

| Profil | Durum | Notlar |
|---|---|---|
| Core (bu belge) | **taslak, normatif** | İlk cihaz uygulamaları için hedef |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | taslak | Kişisel veri yok; SMS ve CSV ile çalışır; tabaktaki surplus, etki özetleri, bakım rule pack'leri (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | taslak | Yerel öncelikli household facts; sadece derived constraint'ler iletilir (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | taslak | Kanıtlanmış namespaces, kesin versiyonlar, tombstones; talep üzerine organizasyonlar (RFC-0002) |
| Conformance raporları (`CERTIFICATION.md`) | taslak | Her conformance iddiasının arkasında imzalı raporlar (RFC-0008) |
| Federation (`FEDERATION.md`) | taslak | Beslemeler ve röleler; yayıncıya karşı doğrulama (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | deneysel | Restoranlar, topluluk, okul, afet ve robot mutfakları (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | deneysel | Agregre edilmiş, gecikmeli, sınıf düzeyinde talep ve supply sinyalleri; rekabet hukuku incelemesine bağlı (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | deneysel | Olay günlüğü + projeksiyon, `profiles/mission/transitions.json` içindeki geçişler |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | deneysel | |
| Market and ecosystem | deneysel | Üretim kullanımı öncesinde rekabet hukuku incelemesi gerektirir |
| Relief planning (`relief.schema.json`) | deneysel | Operasyonel akış Humanitarian Profile'a taşındı |
| Reasoning and advice, health, flows, extensions | deneysel | |
| GraphQL and AsyncAPI surfaces | deneysel | OpenAPI Core API referans yüzeydir |

Bir profil, iki bağımsız uygulama onun conformance vektörlerinden geçtiğinde ve gerçek kullanıcıları olduğunda kararlı hale gelir.

## 11. Araçlar

| Araç | Ne yapar |
|---|---|
| `tools/validate_specs.py` | Şemaları, örnekleri, tarif semantiğini (envelopes, op parametreleri, template placeholder içermemesi), katılığı ve API referanslarının çözümlendiğini kontrol eder |
| `tools/run_conformance.py` | `conformance/*.json` ve `conformance/profiles/*.json` dosyalarını çalıştırır ve `--report` ile bir ConformanceReport yazar: hashing (RFC 8785 örneği dahil), imzalar (bir RFC 8032 anahtarı dahil), iptal, ifşa, olay zincirleri ve kontrol noktaları, birimler, envelopes, sensor ladders, durum makineleri |
| `tools/cookwala_ref.py` | Referans kütüphanesi ve CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Vektörleri yeniden oluşturur (diff'i inceleyin) |
| `tools/bundle_schemas.py` | Çevrimdışı şema paketi |
| `tools/humanitarian_check.py` | Humanitarian Profile rule-pack denetleyicisi ve etki özetleri |
| `tools/make_profile_vectors.py` | `conformance/profiles/` içindeki profil vektörlerini yeniden oluşturur |

## 12. 0.1 sürümünden farklar

| Alan | 0.1 | 0.2 |
|---|---|---|
| Şemalar | Kabul edilen bilinmeyen alanlar | `x-` uzantıları ile katı |
| Sıcaklıklar | °C veya °F, göreceli toleransa izin verilir | Sadece °C; mutlak tolerans |
| Para | Sayı | Ondalık dize |
| Operasyonlar | Nesir tanımlar | Fiziksel operation envelope, sensor ladder, ısı seviyeleri, test vektörleri |
| İmzalar | Sabit EdDSA, yaşam döngüsü olmayan anahtarlar | EdDSA veya ES256, geçerlilik ve iptal içeren KeyRecords |
| Görevler | Tek bir değiştirilebilir belge, içinde defter | Olay günlüğü + projeksiyon, tek sequencer, tanık olunmuş kontrol noktaları, sadece hash modu |
| Ajanlar | Sadece Görevlerin içinde Mandate | Ortak alanda `AgentMandate`; ajan istekleri için zorunlu |
| Güvenlik | Tariflerde beyan edilir | Ayrıca SafetyLimits aracılığıyla yerel olarak uygulanır; recall; olay raporları |
| Veri | Veri kümesi modeli yok | Rıza gösterilmiş, kişisel veriden arındırılmış ExecutionLog |
| Conformance | Sadece şema doğrulaması | 106 vektör (44 Core, 62 profil) artı bir referans uygulama |

Bir 0.1 belgesini taşımak için: °F değerini °C değerine dönüştürün; sıcaklıklardaki göreceli toleransları `toleranceAbs` ile değiştirin; para miktarlarını ondalık dizelere dönüştürün; bilinmeyen alanları kaldırın veya `x-` alanları olarak yeniden adlandırın.

