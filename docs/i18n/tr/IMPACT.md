<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->
# Etki: Cookwala neleri değiştirebilir, kaynaklar ve etiketlerle birlikte

**Durum:** 2026-10-04. Aşağıdaki her sayı **measured** (adı geçen kaynak tarafından sayılmış veya raporlanmış), **modelled** (belirtilen varsayımlar altında simülatörlerimiz tarafından üretilmiş) veya **assumed** (bir planlama rakamı) olarak etiketlenmiştir. Buradaki hiçbir şey sahada Cookwala'nın bir sonucu değildir: hiçbir pilot çalışma yürütülmemiştir. Bu sayfa, sorunların boyutunu ve Cookwala'nın katkıda bulunduğu mekanizmaları belirtmektedir.

## 1. Açlık

| Gerçek | Rakam | Etiket ve kaynak |
|---|---|---|
| 2023 yılında açlıkla karşılaşan insanlar | yaklaşık 733 milyon | kaynak tarafından measured: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| 2023 yılında orta veya şiddetli düzeyde gıda güvensizliği yaşayan insanlar | yaklaşık 2.3 milyar | kaynak tarafından measured: SOFI 2024 |
| Hasat ile perakende arasında kaybedilen gıda | üretilen gıdanın yaklaşık %14'ü | kaynak tarafından measured: FAO, *The State of Food and Agriculture 2019* (UNEP aynı rakamı %13 olarak yuvarlar) |
| 2022 yılında perakende, gıda hizmetleri ve hanehalkında israf edilen gıda | yaklaşık 1.05 milyar ton; kişi başına yaklaşık 132 kg; hanehalkında kişi başına yaklaşık 79 kg | kaynak tarafından measured: UNEP, *Food Waste Index Report 2024* |

**Cookwala'nın mekanizmaları:** gıda bozulmadan önce bir mutfağa ulaşan surplus teklifleri ve her devir teslimde bir soğuk zincir kontrolü (Humanitarian Profile); programların karşılaştırabilmesi ve iyileştirebilmesi için her sahada aynı şekilde sayılan etki; daha sonra, daha az ürün yetiştirilmesi ve çöpe atılmak üzere taşınmaması için birleştirilmiş talep ve arz sinyalleri (experimental, gated on competition-law review). **Yapmadığı şeyler:** açlığın çoğunu tetikleyen yoksulluk, çatışma, iklim şokları, fiyatlar veya politika konularını ele almak.

**Modelled, örnekleyici, bir tahmin değildir:** ülke simülatörünün karma rollout'ü, kurgusal gıda güvencesiz nüfusunun ihtiyacı olanın yaklaşık %4.7'sine eşit öğünleri kurtarır; dünya simülatörünün "protocol, no robots" senaryosu, sadece kurtarma yoluyla yaklaşık 770 milyon (simülatörün assumed baseline'ı, yukarıda measured olan 733 milyonun yukarı yuvarlanmış hali) aç insanın yaklaşık 40 milyonuna ulaşır. Her ikisi de aynı şeyi söylüyor: kurtarma önemlidir ve yeterli değildir.

## 2. Sağlık

| Gerçek | Rakam | Etiket ve kaynak |
|---|---|---|
| Her yıl güvensiz gıdalardan kaynaklanan hastalıklar | yaklaşık 600 milyon; yaklaşık 420.000 ölüm | kaynak tarafından measured: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Tuz alımı ile kılavuz karşılaştırması | çoğu insan günde 9 ila 12 g tuz tüketiyor; WHO 5 g'nin (2 g sodyum) altını öneriyor | kaynak tarafından measured: WHO salt reduction hakkındaki bilgi formu |
| Her yıl yüksek sodyuma atfedilebilen ölümler | yaklaşık 1.9 milyon | kaynak tarafından measured: WHO, *Global report on sodium intake reduction* (2023) |
| Kirletici pişirme yakıtlarına bağımlı insanlar | yaklaşık 2.1 milyar; household air pollution nedeniyle yılda yaklaşık 3.2 milyon ölüm | kaynak tarafından measured: WHO household air pollution hakkındaki bilgi formu (2024) |

**Cookwala'nın mekanizmaları:** cihaz üzerinde uygulanan ve kaydedilen kritik kontrol noktaları ile sıcak tutma, soğutma ve yeniden ısıtma limitleri; menülerdeki sodyum, serbest şekerler, doymuş yağ ve meyve ile sebzeleri işaretleyen rule pack'ler; çocuklar, hamilelik ve yaşlılar için bakım kuralları; diyetisyenlerin ve gıda güvenliği görevlilerinin bir paketi onaylayabilmesi için bir inceleme kaydı.
**Yapmadığı şeyler:** tedavi edici diyetleri teşhis etmez, tedavi etmez veya hesaplamaz; `docs/health/CLAIMS-POLICY.md` dosyasına bakınız.

**Temiz pişirme** tabloda mevcut ancak modelde değil: simülatörler henüz odun ve kömürle pişirmeyi veya bunun sağlık etkilerini (bir sınırlama olarak listelenmiştir; next) saymıyor.

## 3. Ortam

| Gerçek | Rakam | Etiket ve kaynak |
|---|---|---|
| Gıda kaybı ve israfından kaynaklanan küresel sera gazı emisyonlarının payı | yaklaşık %8 ila %10 | kaynak tarafından ölçülen: UNEP, *Food Waste Index Report 2024* |

**Modelled, illustrative:** dünya simülatöründe, "protokol ile birlikte birçok robot", onlar olmadan aynı dünyaya kıyasla beş yıl içinde tüm gıda kaybını veya israfını yaklaşık %4.1 ve emisyonları yaklaşık %5.2 oranında azaltır; "sadece birçok robot" hanehalkı atığını azaltır ancak evlerden önceki kayıpları yaklaşık %3 oranında artırır (bir bullwhip etkisi). Robot elektriği (bu senaryoda beş yıl boyunca yaklaşık 164 TWh) hesaba katılır. Bunlar, her simülatör sayfasında listelenen, modelin varsayımları altındaki çıktılarıdır.

## 4. Ekonomi ve iş

**Assumed and modelled:** şehir simülatörü kişi başı aylık yaklaşık 5 USD,
daha az gıda harcaması ve robot aşçılarla birlikte ev başına aylık yaklaşık 10 saat daha az yemek pişirme ve alışveriş tahmin etmektedir, donanım dahil değildir. İşler için hiçbir yerde bir rakam verilmemiştir; yeni roller sayılar
verilmeden (recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) adlandırılmıştır.

## 5. Kültür

Sayı yok. İddia niteldir ve kontrol edilebilir: bir Cookwala tarifi aşçının adını, yemeğin kimliğini (neyin temel, neyin esnek, neyin asla eklenmeyeceğini), aşçının dilindeki metni ve bir imzayı taşır. Onu pişiren makineler, tarifi bir kredi ile birlikte çalışan bilgi olarak devralır.

## 6. Ölçülecek bir şey olduğunda neyi ölçeceğiz

| Ölçü | Yöntem | Tanımlandığı Yer |
|---|---|---|
| Kurtarılan kilogramlar, servis edilen öğünler, ulaşılan insanlar, beslenme geçme oranı, öğün başına maliyet, talep süresi, talep oranı, güvenlik engeli bulguları, güvenlik olayları | Offer, Claim, Handover ve Distribution belgelerinden hesaplanır | Humanitarian Profile bölüm 10; `ImpactSummary` |
| Doğrulanmış aşçılar: uyumlu bir log ile uçtan uca imzalı bir tarifi çalıştıran yürütmeler | onaylı execution logs | `STRATEGY.md` bölüm 11 |
| Conformance testinden geçen bağımsız uygulamalar | yayınlanmış conformance raporları | `docs/CERTIFICATION.md` |
| Model başına Agent-safety sonuçları | model id, tarih ve config hash ile promptfoo benchmark | `evals/kitchen-agent-safety/` |

## 7. Henüz bilmediklerimiz

Bir food bank'in profil ile mevcut yöntemine kıyasla daha fazla kurtarma yapıp yapmadığı (pilot protokolü mevcuttur; henüz bir pilot çalışması yapılmamıştır). Zarfın her mutfak için doğru olup olmadığı (bir gıda bilimcisi bunları incelememiştir). Simülatörlerin davranışsal varsayımlarının geçerli olup olmadığı (bunlar listelenmiştir ve ayarlanabilir). Geri tepme etkilerinin ne kadar büyük olduğu. Burada hiçbir şey bir vaat değildir.

## 8. Ne yanlış gitti

Hiçbir şey konuşlandırılmadı, bu nedenle sahada hiçbir şey ters gitmedi. Depoda: ilk tek satırlık ifade ("world's first and largest robot cooking recipes index") mevcut olanı abarttı ve değiştirildi; ilk Mission şeması bilinmeyen alanları kabul ediyordu ve katı hale getirildi; ilk simülatörler bir strawman baseline kullandı ve yetkin bir entegrasyon baseline ve aralıkları kazandı. Bu değişiklikleri tetikleyen eleştiriler yayınlandı (`docs/CRITIQUES.md`).

## 9. Kaynaklar

- FAO, IFAD, UNICEF, WFP ve WHO, *The State of Food Security and Nutrition in the World
  2024*, Roma, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Roma, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Cenevre, 2015.
- WHO, *Global report on sodium intake reduction*, Cenevre, 2023; WHO bilgi formu *Salt
  reduction*.
- WHO bilgi formu *Household air pollution*, 2024.

Rakamlar, kaynakların yayınladığı şekilde, yuvarlanmış olarak alıntılanır; baskıda alıntılamadan önce her birini güncel edisyonla tekrar kontrol edin. Kuruluşlar kaynaktır, ortak değil.

