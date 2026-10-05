<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# Yayınladığımız eleştiriler

Cookwala hakkında zor sorular sorduk ve cevapları yazdık. Her endişenin [action plan's concern register](ACTION-PLAN.md#2-concern-register) içinde bir id'si, yanıtımız ve durumu bulunmaktadır. Dışarıdan gelen incelemeler memnuniyetle karşılanır ve burada listelenecektir.

## Bu işe yarayacak mı? (strategy)

| Endişe | Kısa cevap | Durum |
|---|---|---|
| Pazar henüz mevcut değil; spesifikasyon ürünlerin önünde | Küçük Core, önce demo, kullanıcılar olmadan yeni spesifikasyon yok | Core 0.2 tamamlandı; cihaz demosu next |
| Güçlü hiç kimsenin benimseme nedeni yok | Her benimseyenin kazancıyla öncülük edin; robotlar olmadan kullanışlı | Food-bank pilotu ve cihaz ortağı aranıyor |
| Simülatörler neyi assume ediyorsa onu kanıtlıyor | Adil baseline, aralıklar, "illustrative" etiketleri; pilotlar onların yerini alır | Open |
| Açlık yoksulluk ve çatışma ile ilgilidir, surplus ile değil | Cookwala katkıda bulunur; tek başına açlığı bitirmeyi iddia etmez | Mesaj değiştirildi |
| Güvenlik, sorumluluk ve saldırı yüzeyi | Cihaz üzerinde uygulanan limitler; refusal; recalls; olay raporları | Spesifikasyon tamamlandı; certifier incelemesi open |
| Gizlilik (sağlık ve din verileri, defterler vs. silme) | Yerel öncelikli, seçici açıklama, sadece hash içeren loglar, rıza | Spesifikasyon tamamlandı; etki değerlendirmesi open |
| Çok karmaşık | Core 0.2; geri kalan her şey deneysel olarak işaretlendi | Done |
| Kurucu bağımlılığı | Tarafsız bir yuvaya giden yönetişim yolu | GOVERNANCE.md |

## Teknik tasarım sağlam mı?

| Endişe | Core 0.2'de ne değişti |
|---|---|
| Operasyonların fiziksel bir anlamı yoktu | Envelopes, ısı seviyeleri, sensor ladders, irtifa kuralı, test vektörleri |
| Birim ve sayı hataları | Sadece °C, mutlak toleranslar, mutfak birimleri, yoğunluklar, ondalık para |
| Şemalar yazım hatalarını kabul ediyordu | `x-` uzantılı katı şemalar; çevrimdışı paket |
| Tek bir değiştirilebilir Mission belgesi | Event log + projeksiyon, tekil sequencer, geçişler tablosu |
| Defter (ledger) çok az şey kanıtlıyordu | İptal (revocation) içeren ana kayıtlar, tanık olunmuş kontrol noktaları, yeniden yazma tespiti |
| Tanımlanmamış olay teslimatı; veri yolunda (bus) güvenlik | Sıra numaraları, gecikme sınıfları, kalp atışları (heartbeats), "güvenlik yereldir" |
| API yüzeyleri kayıyor | Core OpenAPI; CI içinde kontrol edilen her referans |
| Doğrulayıcı (verifier) yoktu | Referans kütüphanesi ve 106 conformance vektörü |

## İstediğimiz incelemeler

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), gıda bilimcileri
(envelopes), gıda güvenliği görevlileri ve diyetisyenler (rule packs), bir güvenlik denetimi, bir
veri koruma incelemesi ve bir sertifikalandırıcının boşluk analizi. Bkz.
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

