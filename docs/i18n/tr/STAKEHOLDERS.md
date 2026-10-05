<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->
# Paydaşlar: bir mesaj, seçenekler, bir ilk başarı ve herkes için bir akış

**Durum:** 2026-10-04. Her grup için: Cookwala'nın onlar için neden önemli olduğu, hafiften derine doğru katılım yolları, 15 dakikadan kısa sürede ilk başarı, ondan sonraki yol ve katılımın onların çalışmalarını ve dünyayı nasıl ilerlettiği. Burada var olmayan hiçbir ortak, kullanıcı veya pilot çalışma ismi geçmemektedir. Bir şey planlandığında, next veya later ifadesi kullanılır.

Her satırın arkasındaki üç hedef: açlığı bitirmeye yardımcı olmak, insanları daha sağlıklı hale getirmek, robotları insanlar için çalışmaya koymak.

---

## 1. Yapıcılar: geliştiriciler, robot ve cihaz üreticileri, gömülü sistem mühendisleri, AI-agent yapımcıları, akıllı ev ve platform geliştiricileri, açık kaynak katkıda bulunanlar

**Mesaj.** Robotlar ve cihazlar hareket etmeyi öğreniyor. Bir makinenin kontrol edebileceği bir formda, "simmer" ifadesinin ne anlama geldiği, tavuğun ne zaman güvenli olduğu veya bir adımın ne zaman reddedilmesi gerektiği henüz kimse tarafından yazılmadı. Cookwala bu katmandır: bir makinenin planlayabileceği tarifler, ölçebileceği bitiş koşulları ve kendi üzerinde uyguladığı güvenlik limitleri. Açık, telifsiz, modelden bağımsız ve cihazdan bağımsızdır; ayrıca bugün çalıştırabileceğiniz bir conformance paketiyle birlikte gelir.

**Seçenekler.**
- *Hafif:* tarayıcı dry run işlemini çalıştırın; Core 0.2 okuyun (bir akşam).
- *Orta:* `pip install -e sdk/python`, cihazınızın yeteneklerini örnek tariflere karşı dry-run yapın, conformance vektörlerini çalıştırın, referans hub'ı başlatın.
- *Derin:* bir cihaz veya hub üzerinde Core API uygulayın, bir conformance raporu yayınlayın, cihazınızı directory'e ekleyin, bir RFC önerin, bir ROS 2 köprü düğümü yazın, agent-safety benchmark'ına saldırı vakaları ekleyin.

**İlk başarı (15 dakikanın altında).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Akış.** Dry run → referans hub üzerinde Core API'yi uygula → conformance geç →
raporu yayınla → cihazı listele → onaylanmış execution logs, LeRobot veri setlerine ve
OpenTelemetry izlerine dönüşür.

**Çalışmalarını nasıl ilerletir.** Yemek pişirme için ortak bir görev tanımı ve başarı testi, buna karşı ölçüm yapmak için halka açık bir kıyaslama noktası; onları yazmaya gerek kalmadan her mutfaktan tarifler; düzenleyicilerin okuyabileceği bir güvenlik hikayesi; bir satış belgesi olarak conformance raporları; uygulayıcıları tarafından yönetilecek bir standartta ilk hareket eden olma konumu.

**Toplumu nasıl ilerletir.** Tahmin yürütmek yerine refusal yapan makineler sayesinde daha az mutfak yangını ve gıda kaynaklı hastalık; birkaç mutfak yerine dünyanın mutfaklarını miras alan makineler.

---

## 2. Şirketler: girişimler, işletmeler, gıda şirketleri, marketler ve teslimat, restoranlar ve yemek hizmeti, sigortacılar, sertifikalandırıcılar, satış ve ortaklık ekipleri

**Mesaj.** Gıda ile temas eden her şirket, önümüzdeki birkaç yıl içinde pişirme makineleri ve AI ajanları ile karşılaşacak. Cookwala size hepsi için tek bir arayüz sunar; cihaz üzerinde uygulanan güvenlik limitlerine ve denetleyebileceğiniz kayıtlara sahip olan tek arayüzdür. Bakkallar ve teslimatçılar için: bir ailenin programını değil, teslimat pencerelerini ve alerjen gereksinimlerini alın. Sigortacılar ve sertifikalandırıcılar için: sizin için tasarlanmış bir conformance rapor formatı ve bir olay raporu akışı.

**Seçenekler.**
- *Hafif:* Yatırımcılar ve ortaklar sayfasını ve güven sayfalarını okuyun; ürünlerinizi içerik sınıfları ve operasyonlar ile eşleştirin.
- *Orta:* bir teklif akışı (pazar profili, deneysel) veya yerel bir programa (Humanitarian Profile) bir surplus teklifi yayınlayın; dağıtmayı planladığınız ajan üzerinde ajan-güvenliği kıyaslamasını çalıştırın.
- *Derin:* bir üründe Core API'yi uygulayın; bir conformance doğrulamasına sponsor olun; kurul oluştuğunda yönetim komitesine katılın; certification yolunu benimseyin.

**İlk başarı.** Bir ürün hattını GTIN'ler ve alerjen kimlik bilgileri ile bir pazar `Offer`ına dönüştürün, onu doğrulayın ve hangi örnek tarifleri sağlayabileceğini görün.

**Akış.** Besleme sun → hanelerden gelen derived constraints → kendi ödeme sisteminiz üzerinden siparişler → fulfilment events → (onay ile) execution reports üzerinden itibar.

**Çalışmalarını nasıl ilerletir.** Onlarca satıcı entegrasyonu yerine tarafsız bir katmana erişim; atığı azaltan talep sinyalleri (later, rekabet hukuku incelemesinden sonra); sigortacıların fiyatlandırabileceği certification; güvenliğin kamuya açık bir kaydı.

**Toplumu nasıl ilerletir.** Mağaza ve tabak arasında daha az gıda kaybı; surplus'un çürümeden önce mutfaklara ulaşması; evlerde güvensiz eylemlere ikna edilemeyen makineler.

---

## 3. Sağlayıcılar: bakkallar, çiftlikler ve kooperatifler, teslimat, enerji, AI ve model satıcıları, tarif yayıncıları

**Mesaj.** Sağlayıcılar Cookwala'ya kiracı olarak değil, eşler olarak bağlanır. Bir bakkal veya teslimat servisi bir kısıtlama alır, asla bir hanenin gerçeklerini almaz. Bir yapay zeka satıcısı, modelinin bir mutfakta güvenli olduğunu gösteren bir kıyaslama ve bugün kullanabileceği bir MCP sunucusu alır. Bir tarif yayıncısı her tarifte adını tutar ve statik bir klasörden imzalı bir katalog yayınlayabilir.

**Seçenekler.** Bir katalog (tarifler) yayınla · bir teklif akışı yayınla · agent-safety benchmark çalıştır · bir registry node çalıştır · SMS ile surplus sun.

**İlk başarı.** Tarif yayınlayıcı: `cookwala init my-dish`, düzenle, `cookwala validate`,
`cookwala hash`; kataloğunuz `/.well-known/cookwala.json` içeren bir klasördür. AI sağlayıcısı:
MCP sunucusunu ekleyin ve on agent-safety durumunu çalıştırın.

**Akış.** Katalog veya besleme → kanıtlanmış namespace'iniz altında registry girişi → bir şeyler ters giderse recall beslemesi → sonuçlardan gelen itibar.

**Çalışmalarını nasıl ilerletir.** Tek bir format aracılığıyla her cihaza ve ajana ulaşın;
imza ile kredi ve köken; dürüstçe geçildiğinde bir pazarlama varlığı olan bir güvenlik kıstası.

**Toplumu nasıl ilerletir.** Tarifler atfedilmiş olarak kalır; insanlar adına hareket eden ajanlar güvenilmeden önce measured edilir.

---

## 4. Gıda: çiftçiler, aşçılar ve şefler, ev aşçıları, tarif oluşturucular, mutfak okulları

**Mesaj.** Cookwala için yazılmış bir tarif, onu pişiren her cihazda isminizi ve mutfağınızı canlı tutar ve bir makinenin asla atlamaması gereken adımları kayıt altına alır. Fazlası olan bir çiftlik, bunu SMS ile listeleyebilir ve aynı gün bir mutfağa ulaşabilir. Bir yemek okulu, kendini kontrol eden bir formatla gıda güvenliğini öğretebilir.

**Seçenekler.**
- *Çiftçiler:* `FARM 120KG TOMATO A BB0411` bir programın geçidine (varsa);
  daha sonra, arz ve talep sinyallerini okuyun.
- *Aşçılar ve şefler:* ezbere bildiğiniz bir tarifi bir Cookwala tarifine dönüştürün; kendi dilinizdeki
  adım cümlelerini gözden geçirin; daha sonra, kredi ile onaylanmış oturumları kaydedin.
- *Okullar:* dokuz örnek tarifi öğretim vakası olarak kullanın; kendi tariflerinizi ekleyin.

**İlk başarı.** Aşçılar: `cookwala init`, her ısı adımı için bir bitiş koşulu içeren bir tarif yazın, onu doğrulayın. Çiftçiler: profili çalıştıran bir programa bir SMS teklifi gönderin (henüz çalışan yok; ayrıştırıcı ve vektörler mevcut).

**Akış.** Tarif → doğrulama → katalog → cihazlar üzerinde dry run → execution logs gerçek makinelerde nasıl performans gösterdiğini gösterir → kanıtlarla revizyonlar.

**Çalışmalarını nasıl ilerletir.** Seyahat eden atıf; diğer ülkelerdeki makineler tarafından pişirilebilen bir tarif; çiftçiler için, bir fazlalığı atık yerine öğünlere dönüştürmenin bir yolu.

**Toplumu nasıl ilerletir.** Mutfak mirası video olarak değil, çalışan bilgi olarak korunur;
daha az çiftlik kapısı atığı.

---

## 5. İnsani Yardım: STK'lar, food bank'ler, toplum mutfakları, okul yemeği programları, yardım kuruluşları, bağışçılar

**Mesaj.** Humanitarian Profile, surplus gıdayı telefonlar ve e-tablolar aracılığıyla tabaklara taşır, soğuk zincir kontrollerini kaydeder, öğünleri sayar ve **hiçbir kişisel veri** taşımaz. Robotlar, uygulamalar veya internet olmadan çalışır. Size savunabileceğiniz sayılar sunar: kurtarılan kilogramlar, servis edilen öğünler, beslenme geçme oranı, öğün başına maliyet, talep süresi, güvenlik olayları; her biri kendi yöntemiyle.

**Seçenekler.**
- *Hafif:* profili ve pilot protokolünü okuyun; SMS adım adım kılavuzunu deneyin.
- *Orta:* CSV şablonlarını bir sahada dört hafta boyunca çalıştırın (seviye H0) ve bir
  etki özeti hesaplayın.
- *Derin:* bir temel çizgi ve bağımsız bir değerlendirici ile 12 haftalık önceden kayıtlı bir pilot;
  gıda güvenliği liderinizle rule pack'leri ulusal hukuka uyarlayın; kendi registry
  düğümünüzü çalıştırın.

**İlk başarı.** Bir gün için üç CSV şablonunu doldurun,
`cookwala humanitarian --summary your-folder` komutunu çalıştırın, her sayının altındaki bir yöntemle `ImpactSummary` içeriğini okuyun.

**Akış.** Teklif → talep → sıcaklık kontrolü ile devir → dağıtım → etki özeti → ne gösterirlerse göstersinler, yayınlanan sonuçlar.

**Çalışmalarını nasıl ilerletir.** Siteler genelinde karşılaştırılabilir sayılar; fon sağlayıcılar için kanıt; bir problemden sonra değil, önce güvenlik bulguları; bağışçı sistemlerinin okuyabileceği bir format (HXL, GS1, DHIS2 eşlemeleri).

**Toplumu nasıl ilerletir.** Daha fazla gıdanın, onurları korunarak güvenli bir şekilde insanlara ulaşması:
isim yok, yüz yok, profilleme yok.

---

## 6. Sağlık: diyetisyenler, gıda güvenliği görevlileri, halk sağlığı ajansları, bakım evleri

**Mesaj.** Kamu kılavuzlarından türetilen, menülere ve devirlere uygulanan, incelemenizin meslek ve sonuç bazlı kaydedildiği, makine tarafından kontrol edilebilir paketler halinde sunulan beslenme ve gıda güvenliği kuralları. Hiçbir şey tıbbi tavsiye değildir; paketlerin söylediklerinin ötesinde hiçbir iddia bulunmamaktadır.

**Seçenekler.** Bir paketi şablonla gözden geçirin (iki saat) · bir paketi ulusal kurallara uyarlayın ·
hizmet verdiğiniz kişiler için bakım kuralları önerin · later, programlardan elde edilen toplu sonuçları okuyun.

**İlk başarı.** `profiles/humanitarian/care-vulnerable-groups.rulepack.json` dosyasını ve inceleme şablonunu açın; üç kuralı onaylandı, değiştirildi veya reddedildi olarak işaretleyin; incelemeyi dosyaya kaydedin.

**Akış.** Taslak pack → inceleme → status reviewed → programlar benimser → her dağıtımda bulgular → yöntemlerle birlikte sonuçlar yayınlanır.

**Çalışmalarını nasıl ilerletir.** Rehberliğiniz, robot mutfaklar da dahil olmakla birlikte, mesleğinizin kayıtlarda olduğu ve yayınlanabilir bir incelemenin yanı sıra araştırma için bir bulgular veri setinin (toplu, kişisel veri içermeyen) bulunduğu, bunu benimseyen her mutfakta yürütülür.

**Toplumu nasıl ilerletir.** Toplu beslenen öğünlerde daha az sodyum, şeker ve doymuş yağ; daha güvenli sıcak tutma ve soğutma; makineye işlenmiş çocuklar ve yaşlılar için bakım.

---

## 7. Eğitim: okul öğretmenleri, eğitimciler, profesörler, araştırmacılar, öğrenciler

**Mesaj.** Yemek pişirme dünyadaki en tanıdık süreçtir ve Cookwala bunu bir öğretim nesnesine dönüştürür: sıcaklıklar, birimler, adil paylaşım, güvenlik, kuralları takip eden makineler. Araştırmacılar için bu bir kıyaslama noktası, bir veri seti formatı ve açık problemler listesidir.

**Seçenekler.**
- *Öğretmenler:* ders kiti (`docs/education/LESSON-KIT.md`): "simmer nedir"den "bir makine asla ne yapmamalıdır"a kadar beş ders.
- *Profesörler ve öğrenciler:* araştırma konuları listesi, simülatörler, test koşulları olarak conformance vektörleri, LeRobot dışa aktarımı, tez boyutunda açık problemler.
- *Araştırmacılar:* onaylanmış execution'ların veri setlerini yayınlamak; simülatörlerin assumptions'larını eleştirmek; vektörler önermek.

**İlk başarı.** Öğretmenler: sınıfta tarayıcı dry run işlemini çalıştırın ve cihazın neden refusal before heat verdiğini sorun. Öğrenciler: şehir simülatöründe bir assumption değiştirin ve sonucu açıklayın.

**Akış.** Ders → proje → veri seti → makale → RFC.

**Çalışmalarını nasıl ilerletir.** Ücretsiz, açık, atıf yapılabilir materyal; kimsenin sahip olmadığı bir kıyaslama noktası;
RFC'ler aracılığıyla standart üzerinde ortak yazarlık.

**Toplumu nasıl ilerletir.** Güvenli bir mutfağın ne olduğunu bilen ve bir güvenlik belgesini okuyabilen bir nesil.

---

## 8. Hükümet: hükümetler, bakanlıklar, şehir yetkilileri, düzenleyiciler, politikacılar ve yasama organları, yönetişim ve standart kuruluşları

**Mesaj.** Ev ve ticari pişirme makineleri, cihazlar ve yazılımlar için ayrı ayrı yazılmış düzenlemeler kapsamında geliyor. Cookwala düzenleyicilere işaret edebilecekleri somut bir şey sunar: cihaz üzerinde uygulanan güvenlik limitleri, refusal before heat, imzalı kayıtlar, anonim olay raporlama ve herkesin çalıştırabileceği bir conformance paketi. Gıda bağışı güvenliği için kişisel veri içermeyen bir veri standardı sağlar. Telif ücretsizdir ve tarafsız yönetime doğru ilerlemektedir.

**Seçenekler.** Politika özetini (`docs/policy/BRIEF.md`) okuyun · gıda bağışı verileri ve pişirme makinesi güvenliği için model dilini kullanın · standartlar kuruluşunuzdan Core 0.2'yi gözden geçirmesini isteyin · ulusal bir registry düğümü çalıştırın · okul yemeği programınızla bir pilot çalışmayı finanse edin.

**İlk başarı.** İki sayfalık özeti okuyun ve depoda üç şeyi kontrol edin:
güvenlik limitleri paketi, conformance runner, insani veri koruma kuralları.

**Akış.** Kısa → ulusal bir standartlar kuruluşu tarafından inceleme → kılavuzda referans → pilot →
certification scheme.

**Çalışmalarını nasıl ilerletir.** Hazır, gözden geçirilebilir bir teknik temel; pilotlardan gelen kanıtlar; tarafsız bir standart aracılığıyla endüstriye bir kanal; halihazırda kullandığınız insani yardım veri standartları ile birlikte çalışabilirlik.

**Toplumu nasıl ilerletir.** Evlerde daha güvenli makineler; hizmet ettiği insanları koruyan gıda kurtarma; şehirlerde daha az atık.

---

## 9. Sermaye: yatırımcılar, girişimciler, hayırseverler, kalkınma bankaları

**Mesaj.** Yemek pişirme bir altyapı haline gelmek üzere. Standart ücretsizdir; etrafındaki hizmetler bir iş modelidir: certification, hub yazılımı, onaylanmış veri setleri, registry operasyonları, pilotlar. İnsani katman, kalkınma fonlayıcılarının önceden kayıtlı değerlendirme ile destekleyebileceği bir kamu malıdır. Bu sitede hiçbir yerde herhangi bir finansal vaatte bulunulmamaktadır.

**Seçenekler.** Fırsatı, iş modelini, yol haritasını, riskleri ve yönetişimi okuyun
(`/investors`) · bir pilot çalışmayı veya bir incelemeyi finanse edin · ücretsiz standardın yanında hizmetler satan bir şirketi destekleyin · bir fon sağlayıcı gözlemcisi olarak yönetişime katılın.

**İlk başarı.** Whitepaper'ın problem, mimari ve riskler bölümlerini ve eylem planının concern register kısmını okuyun; her açık risk listelenmiştir.

**Akış.** Kanıt (pilotlar, conformance, benimseyenler) → eylem planındaki kapılar → kapılara bağlı finansman → standart için tarafsız bir temel, hizmetler için bir şirket.

**Çalışmalarını nasıl ilerletir.** Dürüst rakamlarla, bir kategoriyi tanımlayan standartta erken konum; kamu yararından ayrıştırılmış, yatırım yapılabilir bir hizmet şirketi.

**Toplumu nasıl ilerletir.** Sermaye iddia edilene değil, measured olana gider.

---

## 10. Düşünce: filozoflar, etikçiler, tarihçiler ve fütüristler

**Mesaj.** Bir makine bir büyükannenin tarifini pişirdiğinde, bilgiye kim sahiptir? Otomatikleştirilmiş bakımda onur ne anlama gelir? Bir hanenin robotu neleri bilebilir ve başka kimler bilebilir? Cookwala bu sorular hakkında kod ile seçimler yaptı; denemeler (`docs/essays/`) bunların ne olduğunu söylüyor ve anlaşmazlığa davet ediyor.

**Seçenekler.** Makaleleri oku · bir yanıt yaz · bir kural öner (bir RFC, bir şemaya sahip felsefi bir argümandır) · household context profilinin etik inceleme kurulunda yer al.

**İlk başarı.** household data ve facet registry'nin seyahat kuralları hakkındaki makaleyi okuyun;
varsayılanını değiştireceğiniz bir facet bulun ve nedenini söyleyin.

**Akış.** Makale → kamuoyu yorumu → RFC → değişen varsayılan.

**Çalışmalarını nasıl ilerletir.** Etik konumların, tartışmanın kamuya açık bir kaydıyla birlikte, yürürlükteki kurallara dönüştüğü canlı bir vaka.

**Toplumu nasıl ilerletir.** Makineler milyonlarca eve girmeden önce, mahrem veriler ve kültürel miras hakkında açık bir şekilde alınan kararlar.

---

## 11. Herkes: gıda, atık, işler, iklim ve gelecek ile ilgilenen insanlar

**Mesaj.** Cookwala, bir tarifin herkesin veya herhangi bir şeyin onu güvenli bir şekilde pişirebileceği şekilde yazılmasının bir yolu ve çöpe atılacak yiyeceklerin ona ihtiyacı olan birine ulaşmasının bir yoludur. Ücretsizdir, hiçbir şirkete ait değildir ve bilmediği şeyleri söyler.

**Seçenekler.** dry run deneyin · bir simülatör oynayın · tarifleri okuyun · sevdiğiniz bir tarif yazın · yol haritasını takip edin · bir food bank veya bir okul ile bunu paylaşın.

**İlk başarı.** dry run sırasında cihazı değiştirin ve bir adımın reddedildiğini izleyin; nedenini okuyun.

**Akış.** Merak → bir tarif → onu kullanabilecek bir mutfakla bir konuşma.

**Hayatlarını nasıl ilerletir.** Evde daha güvenli makineler, kendi tariflerinin korunması, para vermeden yardım etmenin bir yolu.

**Toplumu nasıl ilerletir.** Daha az atık, daha güvenli gıda, kendi başına yemek pişiremeyen insanlara hizmet eden makineler ve geri kazandırılan insan zamanı.

---

## 12. İşler ve onur, açıkça söylenmiş haliyle

Pişirme makineleri işi değiştirecek. Cookwala'nın konumları: insanlar her zaman yemek pişirebilir; ilk kullanımlar kendi başına yemek pişiremeyen kişiler ve eleman eksiği olan topluluk mutfakları içindir; bir aşçının ismi, yemek nerede pişirilirse pişirilsin tarifte kalır; bir işçi sesi yönetim komitesinde yer alır; yeni roller (tarif mühendisleri, gıda-robot teknisyenleri, certifiers, rule-pack incelemecileri) sayı vaat edilmeden adlandırılır.

## 13. Her grubun sitede yer aldığı yer

| Grup | Sayfa |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Companies | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Food | `/for/food/`, `/farmers/` |
| Humanitarian | `/for/humanitarian/`, `/humanitarian/` |
| Health | `/for/health/` |
| Education | `/for/education/`, `/education/` |
| Government | `/for/government/`, `/policy/` |
| Capital | `/for/capital/`, `/investors/` |
| Thought | `/for/thought/`, `/ideas/` |
| Everyone | `/`, `/why/`, `/impact/` |

