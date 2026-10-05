<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->

# Conformance ve sertifikasyon yolu

**Durum:** taslak, 2026-10-04 (RFC-0008). Henüz bir sertifikalandırıcı ile anlaşılmadı; bu, standardın sunduğu yoldur.

## 1. Üç adım

| Adım | Kim | Ne anlama gelir | Nasıl gösterilir |
|---|---|---|---|
| **Self-declared** | Üretici veya yayıncı | Kamu araçlarını kamu vektörleriyle çalıştırdı ve kendi anahtarıyla imzalanmış bir `ConformanceReport` (`schemas/conformance.schema.json`) yayınladı | rapor, suitler ve sayımlarla birlikte; asla bir rozet olarak değil |
| **Verified** | Bir registry operatörü | Çalıştırmayı aynı vektör seti hash'ine karşı yeniden üretti ve raporu karşı imzaladı | rapor artı doğrulayıcı |
| **Certified** | Bağımsız bir certifier (bugün hiçbiri mevcut değil) | Yayınlanmış bir şema kapsamında suit'i artı donanım ve güvenlik vakası kontrollerini çalıştırdı ve işareti verdi | rapor, certifier, işaret |

Bir sınıfın herhangi bir vektöründe başarısız olan bir rapor, o sınıfı iddia edemez. registry rozetleri değil, raporları gösterir.

Bugün tek registry operatörü spesifikasyon sürdürücüsüdür (cookwala.ai), bu nedenle ikinci bir registry var olana kadar "verified" herhangi bir bağımsızlık katmaz; durum hala self-verification olarak gösterilir.

## 2. Bir rapor neleri içerir

Çekirdek sürüm, iddia edilen sınıf (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) veya bir profil iddiası (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), konu (ürün, satıcı, sürüm), toplamlar ve başarısız vektör id'leri ile çalıştırılan paketler, vektör setinin özeti, araç ve commit, tarih, durum ve
doğrulayıcı. Örnek: `examples/conformance/report-reference.json`, tarafından üretilen

```bash
python tools/run_conformance.py --report report.json
```

## 3. Sınıflar ve kanıtladıkları şeyler

| Sınıf | Vektörler | Sertifikasyon için ayrıca gerekli (vektörler tarafından kapsanmayan) |
|---|---|---|
| Recipe publisher | hash, envelope (bantlar içindeki hedefler), units | bir gıda güvenliği uzmanı tarafından tariflerin içerik incelemesi |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | cihazın kendi güvenlik durumu (uygun olduğu şekilde ISO 13482, IEC 60335, UL 3300); ölçülmüş yerel durdurma gecikmesi; ağ olmadan uygulanan güvenlik limitleri |
| Catalog | hash, signature, key revocation, recalls | anahtar muhafazası ve olay kabul süreci |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | yönteme göre model başına yayınlanan sonuçlar |
| Verifier | tüm Core paketleri | hiçbiri |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | veri sorumluluğu incelemesi; kişisel veri denetimi yok |
| Household | disclosure policy | veri koruma etki değerlendirmesi |
| Registry | name and version rules, tombstones | namespace kanıt süreci |

## 4. Sertifikasyonun vaat edemeyeceği şeyler

Bir conformance raporu, yazılımın çalıştığı gün vektörlerin gerektirdiği şekilde davrandığını kanıtlar.
Bir cihazın her mutfakta güvenli olduğunu, bir tarifin tadının doğru olduğunu veya hiçbir zarar gelmeyeceğini kanıtlamaz. Sıfır zarar vaat eden bir standart dürüst olmazdı; bu standart limitlerin yerel olarak uygulandığını, refusal before heat durumlarının gerçekleştiğini ve kayıtların kontrol edilebileceğini vaat eder.

## 5. İşaretin yönetişimi

Sertifikasyon işareti ve kuralları, ticari marka ile birlikte tarafsız temele (`GOVERNANCE.md`) taşınır. O zamana kadar hiçbir işaret mevcut değildir; sadece raporlar mevcuttur.

