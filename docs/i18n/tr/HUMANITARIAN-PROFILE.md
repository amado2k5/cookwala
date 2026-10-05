<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->
# Cookwala İnsani Profili (taslak 0.2)

**Durum:** food bank'ler, yardım programları ve gıda güvenliği ve beslenme uzmanları tarafından incelenmek üzere taslak halindedir. WFP, WHO, FAO, Global FoodBanking Network veya burada adı geçen başka herhangi bir kuruluş tarafından incelenmemiş veya onaylanmamıştır.

**Dosyalar:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (tümü), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; tüm taslaklar profesyonel inceleme bekliyor, bkz. [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (Kahire'deki food bank, okul yemekleri, afet mutfağı, robot mutfağı), her biri hesaplanmış bir `ImpactSummary` ile
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. 0.2 ne ekliyor (RFC-0003, RFC-0004)

0.1 üzerinde ekleme; okuyucular her ikisini de kabul eder.

- **Çiftlikten tabağa:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) ve `Item.harvestedAt`; roller `farm`, `caterer`, `robot_kitchen`; SMS kelimesi `FARM`.
- **Bakım kuralları:** `Item.foodClasses` ve `Distribution.menu.foodClasses` (çiğ yumurta, pastörize edilmemiş süt ürünü, bütün kuruyemiş, pişmiş pirinç…), kural türü `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; üç yeni taslak paket.
- **İncelemeler:** `RulePack.reviews` her incelemenin mesleğini, organizasyonunu, tarihini, kapsamını ve sonucunu kaydeder; `status: reviewed` onaylanmış bir inceleme gerektirir.
- **Etki:** Her biri `method` (measured, modelled, assumed, not recorded) taşıyan ve `tools/humanitarian_check.py --summary` tarafından hesaplanan dokuz ölçütlü `ImpactSummary`.
- **Talep etme süresi:** `Offer.createdAt`, `Claim.claimedAt`; kurtarılan kilogramların bir kez sayılması için `Handover.leg`.
- `Manifest` üzerindeki **Program türleri**.

## 1. Amaç

İnsanları besleyen kuruluşlar için Cookwala'nın küçük, katı ve kişisel veriden arındırılmış bir parçası:
food bank'ler, topluluk mutfakları, okul yemeği programları, yardım programları, bağışçılar (bakkallar, restoranlar, çiftlikler, catering şirketleri), taşıyıcılar ve soğuk hava depoları. Dört işi kapsar:

1. **Surplus food sunmak** ve bunu hızlı ve adil bir şekilde talep etmek.
2. Sıcaklık kontrolü (soğuk zincir kontrolü) ile birlikte, zilyetliğin **her devrini kaydetmek**.
3. **Nelerin servis edildiğini** yalnızca toplu sayımlar olarak raporlamak.
4. Menüleri ve devirleri, makine tarafından okunabilir beslenme ve gıda güvenliği kurallarına göre **kontrol etmek**.

**Robotlar, uygulamalar veya internet olmadan çalışır.** H0 ve H1 seviyeleri e-tablolar, SMS ve temel telefonlar üzerinde çalışır. Robotlar, hub'lar ve ajanlar aynı belgelerin isteğe bağlı tüketicileridir.

## 2. İlkeler

- **Zarar verme.** Bir kişiyi veya haneyi tanımlayabilecek, konumlandırabilecek veya profilleştirebilecek hiçbir şey toplamayın. Hassas ortamlarda, faydalanıcılar hakkındaki veriler bir koruma riskidir.
- **İnsani ilkeler** (insanlık, tarafsızlık, ayrım gözetmemek, bağımsızlık): yardımlarda ticari markalama yapılmaz ve veriler pazarlama için kullanılmaz.
- **Katı ve küçük.** Her nesne bilinmeyen alanları ( `x-` uzantıları hariç) reddeder, bu nedenle yazım hataları ve ekstra kişisel alanlar doğrulamadan geçemez.
- **Kesin birimler:** kilogramlar, derece Celsius, mutlak toleranslar ve ondalık dizgiler olarak para.
- **Yerel kurallar kazanır.** Rule packs, ulusal gıda güvenliği ve bağış yasaları ile değiştirilebilir.
- **Açık:** telif ücretsiz spesifikasyon, açık kaynaklı araçlar. Profil, Digital Public Goods Standard ve Principles for Digital Development standartlarını karşılayacak şekilde tasarlanmıştır.

## 3. Conformance seviyeleri

| Seviye | Katılımcının yaptığı | İhtiyaçlar |
|---|---|---|
| **H0 — Kağıt & SMS** | Teklifleri, devirleri ve dağıtımları CSV şablonlarında (HXL hashtag satırları ile) veya SMS yoluyla (bölüm 8.3) kaydeder | Bir e-tablo veya temel bir telefon |
| **H1 — Kurtarma** | API üzerinden `Offer`, `Claim`, `Handover` ve `Distribution` belgelerini değiştirir; durum makinesini (bölüm 5) takip eder | Herhangi bir HTTP istemcisi |
| **H2 — Güvenlik & beslenme** | Her devir ve menüye bir `RulePack` uygular ve `findings` kaydeder | Referans kontrol edici veya eşdeğeri |
| **H3 — Birlikte çalışabilirlik** | Agregatları HXL, DHIS2 ve çekirdek Cookwala `ImpactReport` formatına aktarır; GS1 tanımlayıcılarını kullanır | Entegrasyon çalışması |

Bir katılımcı, seviyelerini, rule pack'lerini, uç noktalarını ve `personalData: "none"` değerini beyan eden `/.well-known/cookwala-humanitarian.json` konumunda bir `Manifest` yayınlar.

## 4. Belgeler

| Belge | Kim yazar | Amaç |
|---|---|---|
| `Offer` | Bağışçı | Toplanabilir surplus gıda: kalemler (kg, depolama, tarih işaretleri, alerjenler), pencere, saha, sıcaklıklar |
| `Claim` | Food bank, mutfak, program | Bir teklifin tamamını veya bir kısmını, bir toplama zamanı ve araç tipi ile talep eder |
| `Handover` | Zilyetliğin devralanı | Her aşama için bir tane: sıcaklıklar, bir neden kodu ile kabul edilen veya reddedilen kg ve kural bulguları |
| `Distribution` | Mutfak, food bank, okul | Bir günde bir sahada sunulan toplam yemekler ve kişiler; isteğe bağlı menü besin değerleri ve maliyetler |
| `RulePack` | Program veya yetkili | Versiyonlanmış beslenme ve gıda güvenliği kuralları (bölüm 6) |
| `Manifest` | Her katılımcı | Yetenekler ve veri koruma beyanı |

Temel Cookwala yardım belgeleri (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`) planlama için kullanılabilir kalmaya devam eder. Bu profil
operasyonel akışı yönetir.

## 5. Teklif yaşam döngüsü

| Nereden | İzin verilen sonraki durumlar |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (talep düştü), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | hiçbiri (final) |

**Durum değişiklikleri için kurallar:**

- Her değişiklik `version` değerini artırır. Yazarlar `If-Match: <version>` gönderir; bir uyuşmazlık durumunda **409** döner ve yazar yeniden okuyup tekrar dener.
- Geçersiz bir geçiş, izin verilen geçişlerle birlikte **409** döner.
- Teklifler `window.to` anında otomatik olarak `expired` durumuna geçer.
- Talepler, `pickupBy` süresine programın belirlediği bir ek süre (varsayılan 30 minutes) eklendiğinde geçerliliğini yitirir.

**Adil talep etme.** Varsayılan olarak, talepler programın belirlediği bir öncelik katmanı içinde ilk gelen alır:
örneğin, önce çocuklara hizmet veren mutfaklar, sonra diğer mutfaklar, sonra food bank'ler. Katmanlar ve
herhangi bir rotasyon kuralları programın `Manifest` dosyasında veya web sitesinde yayınlanmalıdır.

## 6. Gıda güvenliği ve beslenme rule pack'leri

Bir `RulePack` altı türde kural barındırır:

- `temperature`: soğutulmuş ≤ 5 °C, sıcak tutulan ≥ 60 °C, dondurulmuş ≤ −18 °C;
- `time`: pişmiş gıdanın sıcaklık kontrolü dışında kaldığı en fazla 2 h;
- `date_mark`: son tüketim tarihi engelleri, tavsiye edilen tüketim tarihi uyarıları;
- `allergen`: beyan edilmemiş alerjen engeli;
- `nutrient`: kişi-gün başına veya öğün başına miktarlar;
- `energy_share`: serbest şeker, yağ, doymuş yağ, trans yağ veya proteinden gelen enerjinin payı.

Her bir kural ya `block` (kabul etme veya servis etme) ya da `warn` (izin verilir, bir bulgu olarak kaydedilir) şeklindedir.

Varsayılan paket `who-codex-basic@0.1.0`, **kamu kılavuzlarından türetilmiş bir taslaktır**: WHO'nun healthy-diet, sodyum, şekerler ve yağlar kılavuzu, WHO Five Keys to Safer Food, Codex etiketleme ve dondurulmuş gıda kodları ve Sphere'in minimum rasyon planlama rakamları. Basitleştirilmiştir, tıbbi tavsiye değildir, bebek ve terapötik beslenmeyi hariç tutar ve yetkin personel tarafından gözden geçirilmelidir. Programlar bunu kopyalayıp uyarlamalı, `jurisdiction` belirlemeli ve kimin gözden geçirdiğini `reviewedBy` kısmına kaydetmelidir.

H2 seviyesindeki alıcılar, her devir teslimde ve her menüde paketi çalıştırır ve kural id'lerini `findings` içinde kaydeder. Referans denetleyicisi, beyan edilen ve hesaplanan bulguların uyuşmadığı yerleri raporlar.

## 7. Veri koruma

**Profil hiçbir kişisel veri taşımaz. Belgeler ŞUNLARI İÇERMEMELİDİR:**

- herhangi bir kişinin isimleri, telefon numaraları, e-postaları veya ulusal, mülteci veya biyometrik tanımlayıcıları;
- hane halkı düzeyindeki kayıtlar veya evlerin veya bireylerin konumları;
- herhangi bir kişinin sağlık, engellilik, din veya uyruğu.

**Bunun yerine taşıdığı şey:**

- **Sadece organizasyonlar.** Her taraf `did:web`, bir GS1
  Global Location Number (GLN) veya bir registry id ile tanımlanan bir organizasyondur. Kişiler yalnızca roller
  (`checkedBy: "trained_staff"`) olarak görünür.
- **Sadece agregatlar.** `Distribution.people` grup bazlı sayıları tutar ve 10'un altındaki her sayı
  `"<10"` olarak raporlanır.
- **Sadece sahalar.** Bir `Site`, bir organizasyonun tesisleri veya bir idari alandır
  (OCHA P-codes), asla bir household değildir.
- **Kısa notlar.** Serbest metin 280 karakterlik operasyonel notlarla sınırlıdır ve kişisel veri
  içermemelidir. Uygulamalar, notları depolamadan önce telefon numaraları ve id'ler için taramalıdır.

**Tutma ve denetim:**

- **Retention:** her katılımcı `Manifest` içinde `retentionDays` beyan eder ve bu süreden sonra belgeleri siler.
- **Audit (isteğe bağlı, `hash_only`):** program başına bir sequencer (normalde food bank veya program operatörü) her belgenin RFC 8785 canonical JSON SHA-256 hash'ini ekler. İçerikler ayrı olarak saklanır ve silinebilir kalır. Bir ortak kuruluş her gün bir checkpoint'i karşı-imzalar, böylece geçmiş sessizce yeniden yazılamaz. Tek bir sequencer zincirdeki fork'ları önler.
- **Hosting**, kanunun veya programın gerektirdiği şekilde ülke içinde olmalıdır.

## 8. Taşıma

### 8.1 API (seviye H1)

| Yöntem | Yol | Notlar |
|---|---|---|
| `POST` | `/offers` | Bir teklif oluşturur (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Bir alıcıya yakın açık teklifler |
| `POST` | `/offers/{id}/claims` | Bir teklifi talep eder; `If-Match` gereklidir; zaten talep edilmişse 409 |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` gereklidir |
| `POST` | `/handovers` | Bir devir teslimi kaydeder |
| `POST` | `/distributions` | Bir dağıtımı kaydeder |
| `GET` | `/reports?from=…&to=…` | Bir dönem için toplulaştırır |

İstek ve taşıma kuralları:

- **Idempotency:** her `POST` bir `Idempotency-Key` taşır. Sunucular anahtarları en az 24 h tutar ve tekrarlar için orijinal yanıtı döndürür.
- **Authentication:** OAuth 2.1 istemci kimlik bilgileri, kuruluş başına bir istemci.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  tekilleştirme için bir olay `id` değeri ve sıralama için teklif başına bir sıra numarası ile en az bir kez iletilir.

### 8.2 Hesap Tabloları (seviye H0)

`profiles/humanitarian/templates/` içindeki CSV şablonlarını kullanın. İkinci satırları, insani yardım veri araçlarının bunları doğrudan okuyabilmesi için [HXL](https://hxlstandard.org) hashtag'lerini içerir.

### 8.3 SMS (seviye H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

Dilbilgisi `tools/cookwala_ref.py` (`parse_sms`) içinde uygulanır ve `conformance/profiles/sms.json` tarafından test edilir. Anahtar kelimeler İngilizcedir; rakamın bulunduğu her yerde Arapça-Hint (٠-٩) ve Farsça (۰-۹) rakamları kabul edilir, bu nedenle her iki klavyeye ayarlanmış bir telefon çalışır.

Depolama kodları: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Tarih işaretleri: `UB` use-by,
`BB` best-before, `HV` harvested, `DDMM` olarak. Reddetme nedeni kodları: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; diğer herhangi bir kelime `other` olarak kaydedilir. `HELP`
yanıtı her komut için bir örnek, düz ASCII ve 160 karakterin altında OLMALIDIR.

Bir gateway, bir belge yazmadan önce bu kontrolleri MUTLAKA uygulamalıdır (`sms_storage_findings` referansta; id'ler blok bulgularıdır):

| Bulgu | Ne Zaman |
|---|---|
| `safety.temp_not_recorded` | soğutulmuş, dondurulmuş veya sıcak tutulan bir hatta bulunan bir `HAND`, `T` okuması taşımıyor: bunu talep eden bir yanıt ver, hiçbir şey yazma |
| `safety.hot_hold_min` | depolama `H` değeri 60 °C'nin altında olan bir `OFFER`: listelemeyi reddet |
| `safety.storage_class_mismatch` | ürün kelimeleri süt, et, kümes hayvanı, balık, yumurta veya pişmiş gıda olduğunu ima ediyor ve depolama `A` ise: listelemeyi reddet |
| `safety.chilled_max`, `safety.frozen_max` | teklif veya teslimat sırasında 5 °C veya −18 °C üzerindeki okumalar |

Sıcak tutulan gıda teklifleri iki saat sonra kapanır (pişmiş pirinç için bir saat); bir gateway asla bir placeholder okuması saklamaz. Gateway, gönderenin kayıtlı numarasını dokümanlarda asla bir kişiye değil, bir organizasyona eşler.

## 9. Birlikte Çalışabilirlik

| Sistem | Eşleme |
|---|---|
| HXL | CSV şablonları; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (ürünler); `Site.gln` ve `OrgId` `gln:` (konumlar) |
| OCHA ortak operasyonel veri setleri | `Site.pcode` |
| DHIS2 | `Distribution` üzerinden site ve dönem başına toplu veri değerleri (öğünler, gruba göre kişiler, kg, olaylar) |
| WFP SCOPE ve diğer faydalanıcı sistemleri | **Yalnızca agregatlar.** Hiçbir faydalanıcı kaydı bu profile girmez veya bu profilden çıkmaz |
| Gıda kurtarma uygulamaları | Adaptörler listelemelerini `Offer` ile, toplama işlemlerini ise `Claim` ve `Handover` ile eşler |
| Çekirdek Cookwala | `Item.ingredientId` ve `menu.recipes` tarif indeksine bağlanır; `relief.ImpactReport` `Distribution` toplamlarını alır |

## 10. Pilot metrikleri (siteler karşılaştırılabilsin diye tanımlanmıştır)

`python tools/humanitarian_check.py --summary DIR` tarafından bir `ImpactSummary` olarak hesaplanmıştır. Bir pilotun nasıl yürütüldüğü ve değerlendirildiği: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metrik | Tanım |
|---|---|
| Kurtarılan Kg | Bağışçılardan gelen ilk aşamadaki `Handover.kgAccepted` toplamı |
| Talep oranı | `claimed` durumuna ulaşan teklifler ÷ oluşturulan teklifler |
| Talep süresi | `Offer` oluşturulmasından `claimed` durumuna kadar geçen medyan dakika |
| Nedene göre reddetme | `reason` bazında `kgRejected` toplamı |
| Servis edilen öğünler | `Distribution.meals` toplamı |
| Beslenme geçme oranı | Menüsü olan ve `nutrition.*` bulgusu olmayan dağıtımlar ÷ menüsü olan dağıtımlar |
| Öğün başına maliyet | (gıda + nakliye + personel + enerji) ÷ öğünler |
| 100 kg başına gönüllü dakikası | `volunteerMinutes` ÷ (kullanılan kg ÷ 100) |
| Güvenlik | `safety.*` blok bulgularının sayısı ve `safetyIncidents` |

## 11. Güvenlik

- **H1'de imzalar isteğe bağlıdır** ve H3'te kuruluşlar arası denetim için gereklidir
  (EdDSA, kuruluşun `did:web` adresinde yayınlanan anahtarlar).
- **Dokümanlardaki notlar ve isimler güvenilmeyen verilerdir.** Yazılımlar ve yapay zeka ajanları bunları asla
  talimat olarak değerlendirmemelidir.
- **Rule packs her bulguda versiyonlanmış ve sabitlenmiştir** (`id@version`), böylece sonuçlar
  yeniden üretilebilir.

## 12. Kasten dışarıda bırakıldı

- Faydalanıcı kaydı, uygunluk ve hedefleme (bunlar programın kendi korumalı sistemlerine aittir).
- Ödemeler: Cookwala asla para hareket ettirmez.
- Tarifler ve robot execution (temel spec). Profil sadece tarifleri isimlendirir ve besin değerlerini raporlar.
- Tıbbi ve terapötik beslenme.

## 13. Nasıl gözden geçirilir

Lütfen [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues) adresinde `humanitarian` etiketiyle issue açın. Bu incelemeler en yararlı olanlardır:

- rule pack ve ret gerekçelerini kontrol eden gıda güvenliği personeli;
- yaşam döngüsünü ve SMS akışını kontrol eden food-bank operatörleri;
- bölüm 7'yi kontrol eden veri koruma görevlileri.

