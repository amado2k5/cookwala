<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/MESSAGING.md -->

# Mesajlaşma: Cookwala ne söyler ve nasıl söyler

**Durum:** 2026-10-04. Sayfalardan önce yazılmıştır. Her sayfa bu belgeyi takip eder.

## 1. Tek cümle

**Cookwala; insanlar, mutfaklar ve robotlar için güvenli yemek pişirme konusunda açık standarttır.**

Arapça: **Cookwala güvenli pişirme için açık standarttır: insanlar, mutfaklar ve robotlar için.**

## 2. Her yerde kullanılan üçlü

Bir Cookwala tarifi, bir makinenin kontrol edebileceği üç şey söyler:

1. **Ne yapılacağı.** Bir makinenin planlayabileceği adımlar olarak tarifler.
2. **Ne zaman bittiği.** Ölçebileceği sıcaklıklar, gıda durumu ipuçları ve süreler.
3. **Asla gerçekleşmemesi gerekenler.** Cihazın kendi üzerinde uyguladığı güvenlik limitleri.

Arapça: **Ne pişiriyoruz. Ne zaman pişer. Asla ne olmamalı.**

## 3. Görev, dürüstçe anlatıldı

- **Görev:** açlığı sona erdirmeye yardımcı olmak, insanları daha sağlıklı hale getirmek ve robotları insanlar için işe koşmak.
- **Nasıl ifade ediyoruz:** "Cookwala ... yoluyla açlığı sona erdirmeye yardımcı olur" (daha az atık, daha güvenli kurtarma, daha ucuz öğünler, koordinasyon gibi bir mekanizma ile takip edilir), asla "Cookwala açlığı sona erdirir" denmez.
- **Uyarı, misyonun göründüğü her sayfada bir kez:** açlığın birçok nedeni vardır: yoksulluk, çatışma, iklim, fiyatlar, politika. Cookwala'nın payı gerçek ve kısmi düzeydedir.

## 4. Kısıtlama ile üç ufuk

| Horizon | Söyle | Söyleme |
|---|---|---|
| Now (2028'e kadar) | Tahmin etmek yerine reddeden daha güvenli cihazlar; makineler arasında çalışan tarifler; telefonlar ve tablolarla daha fazlasını kurtaran food bank'ler; kandırılamayan ajanlar; bugün çalıştırabileceğiniz açık araçlar | "yaygın olarak benimsenmiş", "kanıtlanmış" |
| Next (2028'den 2036'ya) | Her mutfağı pişiren ev ve ticari robotlar; tarifleri canlı tutan onaylı bir veri seti; yeni roller; daha az atık; daha ucuz, daha sağlıklı öğünler; düzenleyicilerin işaret edeceği bir standart | "her evde robotlar", robot sayıları |
| Later (2036 ve sonrası) | Bir altyapı olarak yemek pişirme: afet bölgeleri ve yemek pişiremeyen insanlar dahil olmak üzere herkes için, her yerde besleyici gıda; daha az atık ve daha düşük emisyonlar; geri kazandırılan insan zamanı; mutfak mirasını silmek yerine onu miras alan makineler | tarihler, sayımlar, "açlığı bitir" |

Okuyucu, mekanizmaları takip ederek ölçeği keşfeder; biz bunu duyurmayız.

## 5. Kuralları yazma

- Yalın kelimeler, kısa cümleler. Her cümlede tek bir fikir.
- Slogan kelimeler kullanmayın: devrim niteliğinde, yıkıcı, AI-powered, dünya çapında, ilk ve en büyük değildir.
- Her sayı, kaynağıyla birlikte sayının yanında görünecek şekilde **measured**, **modelled** veya **assumed** olarak belirtilir.
- Henüz var olmayan her şey için **now / next / later** kullanılır. Bir hizmetin var olduğunu asla ima etmeyin.
- Var olmayan hiçbir ortak, kullanıcı, pilot, alıntı, logo veya onay kullanılmaz. Kuruluşlar kaynak olarak veya "çalışmak istediğimiz kişiler" olarak etiketlenerek görünür.
- İnsanlar rol ve durumla tanımlanır, asla eksiklikleriyle değil. İsim olarak "savunmasızlar" denmez; "beş yaş altı çocuklar", "kendi başına yemek pişiremeyen kişiler" denir.
- Güvenlik, bir birimi olan bir sayıdır; asla tek başına "güvenli" kelimesi kullanılmaz.
- Refusal iyi bir haberdir. "Cihaz, herhangi bir şey ısınmadan önce refusal yapar" ifadesini gururla söyleyin.
- Her etki ve yol haritası sayfasında neyi bilmediğimizi ve neyin yanlış gittiğini söyleyin.
- Kod blokları içinde kod; her komuttan sonra beklenen çıktı.
- Arapça, sonradan eklenen bir çeviri değil, birinci sınıf bir versiyondur: aynı yapı, aynı dürüstlük, sağdan sola düzen, okuyucunun beklediği Arap rakamları (teknik içerikte Batı rakamları kabul edilebilir).

## 6. Kelime Dağarcığı

| Kullanım | Yerine |
|---|---|
| recipe, step, done, safe band, limit, refuse, check, verify, consent | instruction set, AI brain, smart, autonomous |
| device, executor, hub | the robot (bir robot kastedilmedikçe) |
| kendi başına yemek pişiremeyen kişiler | yaşlılar, engelliler |
| food bank, community kitchen, program | beneficiaries, recipients |
| measured, modelled, assumed | estimated, projected (bir etiket olmaksızın) |
| now, next, later | coming soon, roadmap item (bir ufuk olmaksızın) |

## 7. Bugün gösterebileceğimiz kanıt

Derleme zamanında depodan sayılmıştır (`/v1/stats.json`): fiziksel tanımları olan operasyonlar, conformance vektörleri, güvenlik limitleri, agent-safety testleri, insani kurallar, şemalar, yayınlanmış tarifler, diller, simülatörler. Her biri türünü gösterir. Bir kaynak belirtilmedikçe başka hiçbir şey bir sayı değildir.

## 8. Fiile göre eylem çağrıları

dene (dry run, simülatör) · oku (quickstart, Core, whitepaper) · oluştur (SDK, hub, MCP) ·
yayınla (reçete, cihaz, pack) · pilot uygulama (insani yardım) · incele (rule pack, envelopes) ·
öğret (ders kiti) · yasalaştır (model dil) · ortak ol ve yatırım yap (yatırımcı sayfası) ·
katkıda bulun (RFC, çeviri, vektörler).

## 9. Başlık bankası

- Güvenli pişirme için açık standart.
- Ne yapılacağı. Ne zaman biteceği. Asla ne olmaması gerektiği.
- Tahmin etmek yerine reddeden cihazlar.
- Atılacak olan gıdanın, SMS ile güvenli bir şekilde tabağa ulaşması.
- Her mutfak, üzerinde aşçının ismiyle.
- Güvenlik yereldir. Onay açıktır. Kayıtlar kontrol edilebilir.
- Robotlar hareket etmeyi öğreniyor. Kimse nasıl pişirileceğini yazmamıştı.

## 10. Her sayfanın taşıdığı her şey

Bir durum çipi (Core normative, draft profile, experimental, planned), altbilgideki tek cümle, katman başına lisanslar, eleştirilere bir bağlantı ve bir sonucu belirten herhangi bir sayfada "henüz bilmediklerimiz" bloğu.

