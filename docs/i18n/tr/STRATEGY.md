<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->

# Cookwala stratejisi: mesaj, ürün, web sitesi, dokümanlar, geliştirici deneyimi

**Durum:** 2026-10-04 tarihinde revize edildi (v2). Misyon, vizyon, hikaye, standart, web sitesi,
dokümantasyon, API ve SDK, demolar, topluluk ve metrikleri kapsar. Eylem planı
(`ACTION-PLAN.md`), arka plan hikayesi ve boşluk listesi (`research/BACKSTORY.md`), mimari inceleme
(`research/ARCHITECTURE-REVIEW.md`), 23 sitelik kıyaslama (`research/WEB-BENCHMARK.md`),
paydaş tasarımı (`STAKEHOLDERS.md`) ve mesajlaşma kuralları (`MESSAGING.md`) üzerine inşa edilmiştir. Bölüm 1'deki tablo ilk geçiş çalışmasıdır; kıyaslama, farklılık gösterdikleri durumlarda onun yerine geçer.

---

## 0. Özet

**Cookwala'nın işi.** Herhangi bir mutfağa (bir kişi, bir food bank, bir fırın veya bir humanoid robot) **ne yapacağını, her adımın ne zaman tamamlandığını ve asla neyin gerçekleşmemesi gerektiğini** söylemenin ve cihaz üzerinde her üçünü de kontrol etmenin açık yoludur.

**Neler değişti:**

1. **Mesaj.** "Dünyanın ilk ve en büyük robot yemek tarifleri indeksi ve CLI" ifadesini emekliye ayırın ve her robot üreticisinin ve mutfağın yaşadığı sorunla öne çıkın. Yeni tek cümlelik slogan:
   *"Güvenli yemek pişirme için açık standart: insanlar, mutfaklar ve robotlar."*
2. **Hikaye.** Robotlar evlerde yemek pişirmek üzere, ancak hiç kimse bir makinenin kontrol edebileceği bir formda, "tamamlandı" ve "güvenli" kavramlarının ne anlama geldiğini veya hangi mutfaklarda geçerli olduğunu yazmadı. Cookwala, bir ailenin Mısır yemek tariflerinden yola çıktı. Misyonu, makinelere her mutfağı güvenli bir şekilde öğretmek ve iyi yemeğin insanlara ulaşmasını sağlamaktır.
3. **Vaat öncesi kanıt.** Canlı, gerçek sayaçlar. now / next / later etiketleri. Yayınlanmış eleştiriler.
4. **Herkesin anladığı tek döngü:** *Tanımla → Kontrol Et → Pişir → Öğren.*
5. **Hedef kitleye göre yollar:** cihaz üreticileri, AI-agent geliştiricileri, mutfaklar ve food bank'ler, aşçılar, araştırmacılar.
6. **İlk ekranda kod ve canlı bir demo.** Tarayıcı içi dry run ("Bu cihaz bu tarifi pişirebilir mi?"), simülatörler ve bugün çalışan kopyala-yapıştır komutları.
7. **En iyi AI ve robotik dokümanları seviyesinde geliştirici deneyimi:** 5 dakikalık bir quickstart, öğreticiler, nasıl yapılır kılavuzları, referans ve açıklama şeklinde organize edilmiş dokümanlar, `llms.txt`, kopyala-sayfa, bir Python paketi ve CLI, tiplenmiş bir JS/TS SDK, bir MCP server, yerel olarak çalıştırabileceğiniz bir referans hub, bir ROS 2 paketi ve bir LeRobot köprüsü.
8. **Bir katkıda bulunan ağı** (Figure's Index'ten esinlenilmiştir): aşçılar ve mutfaklar, robotların her mutfağı öğrenmesi için gerçek tariflerin onaylı kayıtlarını sunar ve bunu onlara öğreten insanlara atıfta bulunur.

---

## 1. Öğrendiklerimiz

| Site | Çözdüğü Problem | Yaklaşım | Nasıl İletişim Kuruyor | Hedef Kitle | Neyi Alıyoruz |
|---|---|---|---|---|---|
| **Figure – Index** | İnsansı robotların devasa miktarda gerçek dünya görev verisine ihtiyacı var | Günlük görevleri kaydeden ücretli katılımcı ağı; services now, robots later | Sinematik, monokrom, devasa ışık tipi; canlı sayaçlar (29 M video yüklemesi, $15 M ödemeli); *"Today, services on demand. Soon, robots on demand."* | Katılımcılar, haneler, işletmeler | Kredili katılımcı ağı; **canlı kanıt sayaçları**; bir "today / soon" dürüstlük çizgisi; çarpıcı bir görsel |
| **Figure (home)** | Ev yardımı | Genel amaçlı bir insansı robot | *"The future of home help is here."* Tek cümle, tek video | Haneler, yatırımcılar | Tek cümlelik vaat; özelliklerden önce ürün |
| **MCP Registry** | Güvenilir MCP sunucuları bulmak | Topluluk registry'si; doğrulanmış reverse-DNS ad alanları; kesin versiyonlar; bütünlük hash'leri; doğrulama endpoint'i; yaşam döngüsü durumu | Temiz OpenAPI referansı; schema-first | Sunucu yayıncıları, istemci yapımcıları | **Doğrulanmış ad alanları, sabitlenmiş versiyonlar, hash'ler, tombstones** → `REGISTRY.md` |
| **LangChain docs** | Ajan oluşturmak parçalı bir yapıda | Açık, modelden bağımsız framework'ler artı bir platform | *"The open agent engineering ecosystem"*; yaşam döngüsü Build → Test → Deploy → Monitor; güven merkezi ve durum | Ajan mühendisleri, işletmeler | **Okuyucunun tanıdığı bir yaşam döngüsü**; güven merkezi; akademi ve forum |
| **LangSmith Observability** | Ajanların üretim ortamında ne yaptığını görmek | Traces → monitoring → feedback → evals için veri setleri | Bağlantılı adımlar; kavramlar sayfası; entegrasyonlar | Ajan ekipleri | **Trace olarak execution logs**; trace'lerin veri setlerine dönüşmesi → `execlog_export.py otel` |
| **OpenAI API docs** | İlk API çağrısı | Önce kod ile hızlı başlangıç; build yolları; model kartları | Karanlık, kod odaklı, "Ask AI", durum ve cookbook | Geliştiriciler | **İlk ekranda kod; "build paths"** |
| **Claude Platform docs** | İlk çağrıdan üretime | İki yüzey (Messages, Managed Agents); numaralandırılmış geliştirici yolculuğu; model ailesi kartları | ⌘K arama; dil sekmeleri (Python … cURL, CLI); yolculuk 1–4 | Geliştiriciler, platform ekipleri | **Numaralandırılmış geliştirici yolculuğu; dil sekmeleri; "choose how you build"** |
| **AsyncAPI** | Olay güdümlü API'leri tanımlamak | Açık spec artı araçlar (generator'lar, docs); Linux Foundation altında açık yönetişim | "Part of the Linux Foundation"; spec → docs → code demo; topluluk toplantıları; sponsor kademeleri | Mimarlar, araç yapımcıları | **Açık yönetişim rozeti, TSC, topluluk takvimi, sponsorlar** |
| **SiliconFlow** | Hızlı, ucuz model çıkarımı | Birçok model için tek duraklı API | Performans, ölçeklenebilirlik, maliyet ve güvenlik özellik listeleri | Geliştiriciler, işletmeler | Net bir **characteristics** listesi (bizimkiler: safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | Deneme-yanılma ile prompt mühendisliği | Deklaratif test vakaları, red teaming, CI | *"Test-driven LLM development, not trial-and-error"*; neden-seç listesi; iş akışı adımları | LLM uygulama geliştiricileri, güvenlik | **Deklaratif güvenlik testleri** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; Figure'ın Helix AI'sı değil) | DeFi çok karmaşık | Her işlemden önce onay isteyen doğal dilli ajan | Whitepaper: abstract → problem → solution → architecture → security model | Kripto kullanıcıları | **Whitepaper yapısı; açık güvenlik modeli; "always confirm"** (token modelini değil, yapıyı alıyoruz) |
| **Hugging Face LeRobot** | Robotik dünyasına başlamak zor | Donanımdan bağımsız kütüphane; teleoperate → record → train → deploy; standart veri seti formatı; topluluk veri setleri | "Pick your path: I have a robot / no hardware yet / I want to contribute"; cheat sheet; yaygın sorunlar | Yapımcılar, araştırmacılar | **"Pick your path"; veri seti uyumluluğu; common-problems bölümü** |
| **ROS 2 / Open Robotics** | Robot yazılımı birlikte çalışabilirliği | Kar amacı gütmeyen bir kuruluş tarafından işletilen açık middleware (ROS, Gazebo, Open-RMF) | *"Powering the world's robots"* | Robot geliştiricileri | **ROS 2 actions; kar amacı gütmeyen yönetim** |
| **NVIDIA Isaac** | Robot geliştirme ve eğitme | Simülasyon, kütüphaneler, temel modeller (GR00T) | Platform haritası: kütüphaneler, simülasyon, modeller, blueprint'ler | Robotik ekipleri | Envelopes için **test tezgahı olarak simülasyon** |
| **1X, Unitree, Pollen** | Ev tipi insansılar, uygun fiyatlı robotlar, yapımcılar için açık robotlar | Depozito, ön sipariş ve topluluk içeren ürünler | Tek ürün, tek fiyat, tek düğme | Haneler, yapımcılar | Ev robotları now sevkiyat aşamasında; bizim penceremiz now |

**En iyiler tarafından paylaşılan kalıplar:**
1. Kimin için olduğu ve ne yaptığına dair tek bir cümle.
2. Okuyucunun tanıdığı bir döngü.
3. Tek bir kaydırma mesafesinde çalışan kod veya bir demo.
4. Seç-yolunu giriş noktaları.
5. Kanıt (sayılar, kullanıcılar, yönetişim).
6. Dürüst durum (güven merkezi, durum sayfası, now/next).
7. Bugün katılabileceğiniz bir topluluk.
8. Hem insanlar hem de AI okuyucuları için oluşturulmuş dokümanlar (kopyalama sayfası, `llms.txt`, "Ask AI").

---

## 2. Bugün Cookwala

**Güçlü Yönler:**
- Nadir, somut bir fikir: fiziksel operation envelopes, sensor ladders, tahmin yürütmek yerine refusal, cihaz üzerinde zorunlu kılınan güvenlik, doğrulanabilir belgeler.
- İki bağımsız standart sonucunu (RFC 8785, RFC 8032) içeren conformance vektörleri.
- Oynanabilir dört simülatör.
- Robotlar olmadan çalışan insani bir profil.
- Gerçek bir tarif külliyatı (fifi.cooking) ve kimliği olan bir bölge (Mısır, Arap dünyası).
- Olağan dışı derecede dürüst bir eleştiri-ve-yanıt kaydı.

**Boşluklar:**

| Boşluk | Etki |
|---|---|
| Manşet, 1 yayınlanmış tarif ile "ilk ve en büyük" iddiasında bulunuyor | Reklam/abartı olarak algılanır; reddedilmeye davetiye çıkarır |
| "Dünyadaki açlığı bitir" ifadesinin ön planda olması | Açlığın nedenlerini bilen fon sağlayıcıları ve uzmanları uzaklaştırır |
| Sadece robotlara odaklanan çerçeveleme | Bugün benimseyebilecek kullanıcıları (mutfaklar, food bank, ajan oluşturucular) dışlar |
| Hızlı başlangıç yok, SDK yok, çalıştırılabilir sunucu yok | Kimse 5 dakika içinde başarılı olamaz |
| Dokümanlar, navigasyon içermeyen 25 markdown dosyasından oluşuyor | Bulması zor, güvenmesi zor |
| Canlı kanıt veya durum yok | Momentum veya hazır olma hissi yok |
| Katılma yolu yok | İlgi, katkıya dönüşemez |

---

## 3. Konumlandırma ve mesaj

### 3.1 Kategori ve tek satırlık açıklama
- **Kategori:** yürütülebilir, doğrulanabilir yemek pişirme için (ücretsiz araçlar ve bir dizin içeren) açık bir standart.
- **Tek satırlık açıklama:** *Cookwala; insanlar, mutfaklar ve robotlar için güvenli yemek pişirmenin açık standardıdır.*
- **Triad**, her yerde kullanılır:
  - **Ne yapılacağı.** Bir makinenin planlayabileceği adımlar olarak tarifler.
  - **Ne zaman biteceği.** Ölçülebilir bitiş koşulları: sıcaklıklar, gıda durumu ipuçları, süreler.
  - **Asla ne olmaması gerektiği.** Cihazın kendisinin uyguladığı güvenlik limitleri.

### 3.2 Misyon ve vizyon (revize edildi)
- **Misyon:** *Yemeği kim yaparsa yapsın, herkesin iyi, güvenli, uygun fiyatlı ve israf etmeden yemesine yardımcı olmak.*
- **Vizyon:** *Dünyadaki herhangi bir mutfak herhangi bir tarifi güvenle pişirebilir ve iyi yemekler çöp yerine insanlara ulaşır.*
- **Değişikliğin nedeni:** "dünyadaki açlığı sona erdirmek" uzun vadeli neden olarak kalır ve kanıtlarla anlatılır. Cookwala; açlığın ihtiyaç duyduğu programlar, finansman ve politikaların yanı sıra daha az atık, gıda kurtarma ve daha ucuz pişirme yoluyla buna katkıda bulunur.

### 3.3 Hikaye

> Ev robotları geliyor: Figure 03, 1X NEO ve mutfak robotları sevkiyat aşamasında veya sipariş alıyor. Hareket etmeyi öğreniyorlar, ancak bir makinenin kontrol edebileceği şekilde "simmer"ın ne anlama geldiğini, tavuğun ne zaman güvenli olduğunu veya bir büyükannenin molokhia'sının nasıl yapıldığını henüz kimse yazmadı. Her üretici, çoğunlukla birkaç mutfaktan kendi kapalı tariflerini yazıyor.
>
> Cookwala, fifi.cooking üzerindeki bir ailenin Mısır ev tariflerinden yola çıkarak basit bir soru sordu: Bir tarifi bir makineye nasıl verirsiniz ve onu güvenli bir şekilde pişireceğini nasıl bilirsiniz?
>
> Cevap açık bir standarttır. Ne yapılacağını, her adımın ne zaman tamamlandığını ve asla neyin gerçekleşmemesi gerektiğini söyler. Cihaz, herhangi bir şeyi ısıtmadan önce bunu kontrol eder ve tahmin etmek yerine reddeder. Aynı tarifler bugün insanlar ve food bank'ler için işe yarıyor ve yarın robotların, kendilerine öğreten aşçıların hakkını teslim ederek dünyadaki her mutfağı öğrenmelerini sağlayacak.

*(Kurucu, kaynak cümleyi onaylamalı ve kişiselleştirmelidir. Otantik olan, cilalanmış olandan daha iyidir.)*

### 3.4 Mesaj evi

| Sütun | Vaat | Bugün gösterebileceğimiz kanıt |
|---|---|---|
| **Tasarım gereği güvenli** | Cihazlar tahmin yürütmek yerine reddeder ve sınırları yerel olarak uygular | 32 operasyon için operation envelopes; safety-limits pack; dry run; conformance |
| **Doğrulanabilir** | Herkes bir tarifi, bir cihazı ve bir kaydı kontrol edebilir | İmzalar, anahtar iptali, event-log checkpoints; RFC sonuçları dahil 106 vektör |
| **Açık ve tarafsız** | Royalty-free, model-agnostic, device-agnostic | Lisanslar; yönetişim yolu; API anahtarı yok |
| **Her mutfak** | Gerçek ev yemeklerinden oluşturulmuştur, çok dilli | fifi.cooking corpus; Arapça ve İngilizce; world-cuisines plan |
| **Robotlardan önce kullanışlı** | Mutfaklar ve food banklar now fayda sağlar | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **Rıza ile öğrenir** | Gerçek yemek pişirme, kredi verilerek daha iyi robotlara dönüşür | ExecutionLog consent; LeRobot export; OTel traces |

### 3.5 Dil kuralları
- **Kullan:** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent.
- **Kaçın:** "revolutionary", "first and largest" (doğru olana kadar), "end hunger" (bir başlık olarak),
  "AI-powered" (belirsiz).
- **Her sayıyı** *measured*, *modelled* veya *assumed* olarak etiketleyin.
- Bir şey mevcut değilken var olduğunu ima etmek yerine **"now / next / later"** deyin.

---

## 4. Hedef kitleler ve ilk başarıları

| Hedef Kitle | Yapılması gereken iş | İlk başarı (≤ 15 dk) | Sonra |
|---|---|---|---|
| **Robot ve cihaz üreticileri** | Her tarifi yazmadan, pişirme özelliklerini güvenli bir şekilde sunmak | Cihaz profillerini 5 tarif ile dry run yapmak; adım başına kabul/red görmeyi izlemek | Core API (reference hub) uygulayın, conformance testinden geçin, cihazı registry'ye yayın |
| **AI-agent geliştiricileri** | Ajanların zarar vermeden öğün planlamasına ve yemek sipariş etmesine izin vermek | Cookwala MCP sunucusunu ekleyin; modelleri üzerinde agent-safety benchmark çalıştırın | Eyleme geçmeden önce AgentMandate ve dry run kullanın |
| **Mutfaklar ve food bank'ler** | Surplus ürünleri güvenle kurtarmak, besleyici menüler planlamak | Bir SMS teklifi gönderin veya CSV dosyasını doldurun; rule-pack kontrolünü görün | Humanitarian Profile ile pilot uygulama yapın |
| **Aşçılar ve tarif oluşturucular** | Tariflerini canlı ve atıf verilmiş tutmak | Editör ile bir tarifi dönüştürün; doğrulama testinden geçtiğini görün | Kayıtlar ekleyin (onaylı); credits kısmında yer alın |
| **Araştırmacılar ve incelemeciler** | Veri, benchmark'lar, dürüst assumptions | Bir simülatör çalıştırın; eleştiriyi ve conformance suite'i okuyun | Veri setlerini kullanın; incelemeleri yayınlayın |
| **Fon sağlayıcılar ve politika yapıcılar** | Etkiyi, riskleri ve yönetişimi görmek | 2 sayfalık whitepaper özeti ve concept note belgesini okuyun | Pilot uygulamaları finanse edin; yönetişime katılın |

---

## 5. Ürün mimarisi: Cookwala ne sunar

| Katman | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profiller (taslak / deneysel) | İlk cihaz geri bildiriminden sonra Core 0.3 | Bir temel altında Core 1.0 |
| **Index and registry** | Örnek tarifler; registry spec | fifi.cooking korpusu dönüştürüldü (2,380 tarif, Arapça + İngilizce); doğrulanmış namespaces | Topluluk koleksiyonları, dünya mutfakları |
| **Tools** | Validator, referans kütüphanesi, dry run, conformance, exporters | `pip install cookwala` (CLI + kütüphane); JS/TS SDK | Tarif editörü (web) |
| **Reference hub** | Core API spec | Simüle edilmiş bir cihaz ile Docker hub, böylece quickstart `curl` yerel olarak çalışır | Hardware-in-the-loop kiti |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | ROS 2 paketi; MCP server; Open-RMF task | Isaac Lab "cook in simulation" benchmark |
| **Safety** | Limits pack, recalls, incidents, agent benchmark | İncelenmiş limitler; halka açık agent-safety sonuçları | Bir sertifikalandırıcı ile certification şeması |
| **Humanitarian** | Profil, rule pack, şablonlar, concept note | Mısır food-bank pilotu | Food-bank ağı adaptasyonu |
| **Data** | Consent ile ExecutionLog | Katılımcı ağı, ilk onaylı veri seti | Hugging Face Hub üzerinde çoklu mutfak benchmark |

---

## 6. Web sitesi

### 6.1 Site Haritası

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 Ana sayfa, yukarıdan aşağıya

| # | Bölüm | Amaç | İçerik |
|---|---|---|---|
| 1 | **Hero** | Tek nefeste ne olduğunu söyle | Tek satırlık açıklama, üçlü, iki buton (*Try the dry run*, *Read the quickstart*); dürüst durum çipi "Draft standard · v0.2" |
| 2 | **Live demo** | Anlatma, göster | "Bu cihaz bu tarifi pişirebilir mi?" Bir tarif ve bir cihaz seçin; her adım yapıldı / kişi / refusal gösterir, karar veren kural ile birlikte |
| 3 | **The problem** | Boşluğu hissettir | Robotlar geliyor; "simmer" farklı anlamlara geliyor; az sayıda mutfaktan kapalı tarifler; insanlar açken israf edilen gıdalar |
| 4 | **The loop** | Tek bir zihinsel model | Tanımla → Kontrol et → Pişir → Öğren, her biri ilgili nesne ve komut ile |
| 5 | **Pick your path** | Her ziyaretçiyi yönlendir | Beş kart (bölüm 4), her biri ilk başarı ile birlikte |
| 6 | **Proof** | Momentum ve dürüstlük | `/v1/stats.json` üzerinden canlı sayaçlar (tanımlanan operations, conformance vektörleri, şemalar, yayınlanan tarifler, diller); her sayı etiketlenmiş |
| 7 | **Safety** | Güven | Güvenlik yereldir; refusal; ajan kuralları; recalls; /trust bağlantısı |
| 8 | **Works today** | Robotlardan önceki kullanışlılık | Humanitarian Profile, SMS örneği, simülatörler |
| 9 | **Now / next / later** | Dürüst yol haritası | Bölüm 5'ten |
| 10 | **Open** | Tarafsız ve katılım sağlanabilir | Lisanslar, yönetişim yolu, katkıda bulun, GitHub |

### 6.3 Tasarım yönü
- **Hissiyat:** sakin, hassas, sıcak. Mutfak ruhuna sahip profesyonel bir enstrüman.
- **Tipografi:** UI için hassas bir grotesque ve veri ile kod için bir mono face. Hero için büyük, hafif bir display tipi (Figure'ın özgüveninden ödünç alınmış), ancak onun sinematik karanlığı kopyalanmadan.
- **Renk:** sıcaklık verisini de işaretleyen tek bir ısı vurgusu (kor turuncusu) ile nötr kağıt ve mürekkep. Palet, renk körü okuyucular için doğrulanmıştır ve hem açık hem de koyu temalar tasarlanmıştır.
- **Görselleştirme:** elimizde olduklarında gerçek eller ve gerçek ev mutfakları, asla stok robotlar değil. O zamana kadar, diyagramlar ve canlı demo sayfayı taşır.
- **Hareket:** bir anlık, adım adım dry run. Geri kalan her şey hareketsizdir.
- **Başlangıçtan itibaren iki dilli:** İngilizce ve Arapça (sağdan sola düzen), ardından diğerleri.
- **Erişilebilirlik:** WCAG 2.2 AA; klavye; azaltılmış hareket; yalnızca renk ile bilgi verilmez.

### 6.4 Etkileşim
1. Tarayıcı içi dry run (tarif × cihaz).
2. Envelope explorer: bir sıcaklık izini sürükleyin ve ne zaman "simmer" dışına çıktığını görün.
3. Protokol açık veya kapalı simülatörler.
4. Tarif adımı görüntüleyici: bir adımın cümlesi, JSON verisi ve envelope yapısı yan yana.
5. Later: siz yazdıkça doğrulama yapan bir tarif editörü.

---

## 7. Dokümantasyon

Diátaxis çerçevesi tarafından organize edilmiştir, böylece her sayfanın tek bir görevi vardır:

| Tür | Amaç | Sayfalar |
|---|---|---|
| **Eğitimler** | Yaparak öğrenin | Quickstart; İlk Cookwala tarifiniz; Bir cihazı Cookwala-ready hale getirin; Bir ajana Cookwala ekleyin; SMS ile bir food-rescue pilotu çalıştırın |
| **Nasıl yapılır kılavuzları** | Tek bir görevi çözün | Bir cihaz için dry run yapın; İmzalayın ve doğrulayın; Registry'ye yayınlayın; Logları LeRobot veya OpenTelemetry'ye aktarın; Agent-safety benchmark'ını çalıştırın; Bir olayı raporlayın; Bir recall başlatın |
| **Referans** | Bilgileri arayın | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vektörleri; CLI |
| **Açıklama** | Nedenini anlayın | Neden envelopes; güvenlik yereldir; trust model; gizlilik; insani tasarım; eleştiriler ve yanıtlar; simülatörler ve sınırları |

**Doküman ergonomisi:**
- sol navigasyon, arama, "Copy page", "Edit on GitHub", önceki/sonraki bağlantıları;
- dil sekmeleri (Python / JavaScript / cURL / CLI);
- AI okuyucular için `llms.txt` ve sayfa başına markdown;
- bir cheat sheet ve yaygın sorunlar sayfası;
- tarihlerin bulunduğu bir changelog.

---

## 8. API ve SDK

| Teslim Edilecek Ürün | Ne | Neden |
|---|---|---|
| `cookwala` Python paketi | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (`tools/` içinden) | İlk başarıya tek komutla |
| `@cookwala/sdk` (TypeScript) | Şemalardan üretilen tipler; Core API istemcisi; tarayıcıda dry run | Web ve ajan geliştiricileri |
| Referans hub (Docker) | Simüle edilmiş bir cihaz ve güvenlik limitleri ile Core API | Hızlı başlangıçtaki `curl` yerel olarak çalışır; yapımcılar için test yatağı |
| MCP sunucusu | Araçlar: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | MCP yetenekli her ajan Cookwala'yı güvenle kullanabilir |
| ROS 2 paketi | `cookwala_msgs` (aksiyonlar), Core API'ye bir köprü düğümü | Robot yapımcıları |
| Dışa Aktarıcılar | LeRobot, OpenTelemetry (tamamlandı) | Öğrenme ve gözlemlenebilirlik |
| Değerlendirmeler | promptfoo agent-safety benchmark (tamamlandı) | Ajan oluşturucular, güvenlik incelemecileri |
| Versiyonlama | Core için Semver; tarihli şema paketi; changelog; kullanımdan kaldırma pencereleri | Kararlılık sözü |
| Durum | cookwala.ai uç noktaları için halka açık durum sayfası | Güven |

---

## 9. Demolar

| Demo | Hedef Kitle | Durum |
|---|---|---|
| Tarayıcı içi dry run | Herkes | Building now |
| Simülatörler (ev, şehir, ülke, dünya) | Herkes, fon sağlayıcılar | Live |
| Modeller genelinde Agent-safety sonuçları | Agent builderlar, AI laboratuvarları | Next (benchmark çalıştırılacak, sonuçlar yöntemle birlikte yayınlanacak) |
| SMS gıda kurtarma walkthrough'u | Food banklar | Next (kaydedilmiş demo) |
| Gerçek bir cihazın düzenlenmemiş bir Cookwala tarifi pişirmesi | Herkes | Later (en önemli demo; bir cihaz ortağı gerekiyor) |
| "Simülasyonda pişir" (Isaac Lab / Gazebo) | Robotik araştırmacıları | Later |

---

## 10. Topluluk ve büyüme

- **Katılımcı ağı** (Figure's Index'ten esinlenilmiştir):
  - *Aşçılar* bildikleri tariflerin onaylanmış oturumlarını kaydeder, her tarif ve veri seti kartında kredi belirtilir.
  - *Mutfaklar ve food bank* pilot uygulaması.
  - *Üreticiler* cihazları uygular.
  - *İncelemeciler* rule pack ve envelope'leri inceler.
  - *Çevirmenler* adımları ve kelime dağarcığını çevirir.
  - Ücretli katkılar daha sonra, hibelerle finanse edilerek gelir. Bilgilendirilmiş onay ve adil şartlar olmadan asla veri için ödeme yapmayın.
- **Ritüeller:** aylık topluluk görüşmesi; gerçek rakamlarla üç aylık "Cookwala durumu"; halka açık inceleme başlıkları.
- **Ortaklık dizisi:** paydaş takipçisinden ilk on (food bank, WFP Innovation Accelerator, Home Assistant, bir cihaz girişimi, bir üniversite laboratuvarı, bir sertifikalandırıcı, World Central Kitchen, bir vakıf, tarafsız bir ev, bir içerik üreticisi).
- **Kanallar:** GitHub Discussions, bir bülten, konferans konuşmaları (ROSCon, IROS/ICRA workshopları, gıda teknolojisi etkinlikleri), Arapça dilli kanallar.

---

## 11. Metrikler

- **Kuzey yıldızı metriği:** *doğrulanmış aşçılar*, onaylanmış, uygun bir log ile uçtan uca imzalı bir Cookwala tarifini çalıştıran yürütmelerin sayısı. Bu değer sıfırken, öncü göstergeleri takip edin.

| Huni | Metrik | 2027-03 itibarıyla Hedef |
|---|---|---|
| Attract | /start için aylık ziyaretçiler | 2,000 |
| Activate | Tamamlanan dry run sayısı (web + CLI) | 500 |
| Build | Conformance testinden geçen bağımsız Core uygulamaları | 2 |
| Adopt | Food-bank pilot kapsamında kurtarılan kg (measured) | İlk 6 aylık pilot yürütülüyor |
| Contribute | Birleştirilmiş değişiklikleri olan harici katkıda bulunanlar | 15 |
| Trust | Yayınlanan harici incelemeler | 6 |
| Learn | Onaylanmış execution logs | 1,000 |

---

## 12. Yol Haritası

Her öğe için durum içeren güncel yol haritası [`ROADMAP.md`](ROADMAP.md) dosyasıdır. Aşağıdaki tablo, kayıt altında tutulan orijinal 180 günlük plandır.

| Ne zaman | Web sitesi ve hikaye | Geliştirici deneyimi | Standart ve güvenlik | Topluluk |
|---|---|---|---|---|
| **Now (bu sürüm)** | Canlı dry run, triad, paths, proof, now/next/later içeren yeni ana sayfa; docs viewer; `llms.txt`; güven sayfaları (security, governance) | Dry run; LeRobot ve OTel exporter'ları; ROS 2 actions; agent-safety benchmark | Registry spec (namespaces, versions, hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **Sonraki 30 gün** | /start quickstart; Arapça ana sayfa; tüm sayfalarda claims pass | `pip install cookwala`; reference hub (Docker) | İlk benchmark sonuçlarının yayınlanması | food bank için concept note; Home Assistant önerisi |
| **60 gün** | fifi corpus ile /recipes index (ilk 100 dönüştürüldü); /humanitarian | TS SDK; MCP server | Bir gıda bilimcisi tarafından envelope incelemesi | İlk topluluk görüşmesi |
| **90 gün** | Whitepaper + 2 sayfalık özet; /roadmap | ROS 2 package | Cihaz geri bildirimlerinden Core 0.3 | Cihaz ortağı, üniversite laboratuvarı |
| **180 gün** | Gerçek cihaz demo videosu | Recipe editor | Certifier gap analizi | Pilot sonuçları; foundation başvurusu |

---

## 13. Bu stratejiye yönelik riskler

| Risk | Mitigation |
|---|---|
| İnce bir gerçekliğin üzerindeki cilalı bir site reklam gibi görünür | Her iddia etiketlenmiş; gerçek verilerden canlı sayaçlar; now/next/later |
| Çok fazla kitleye yayılmak | Sonraki 90 gün için iki ana yol: cihaz üreticileri ve food bank. Diğerleri desteklenir ancak peşinden koşulmaz |
| Büyük platformlar kapalı alternatifler sunar | Benimseyebilecekleri tarafsız, doğrulanabilir katman olun; açık oyuncularla (Hugging Face, Open Robotics, Home Assistant) ortaklık kurun |
| Katılımcı verilerinin kötüye kullanımı | İsteğe bağlı, geri çekilebilir rıza; kişisel veri yok; yayınlanmış veri kartları |
| Kurucu bant genişliği | Daha fazla spesifikasyon öncesinde geliştirici deneyimini (package, hub) sunun; bir co-maintainer işe alın |

