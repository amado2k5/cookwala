<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Cookwala Tarif Formatı: Missions ile çalışan tarifler

Cookwala'daki bir tarif bir talimatlar listesi değildir. Bir planlayıcının belirli bir Misyon'a (household, robots, appliances, energy, budget, health, timing) karşı *derlediği* ve yürütülebilir bir plana dönüştürdüğü **taşınabilir pişirme bilgisidir**. Robot daha sonra, gerçeklik değiştiğinde beklenmedik durumlar ve playbook'lar aracılığıyla uyum sağlayarak o planı çalıştırır.

Şema: [`recipe.schema.json`](../schemas/recipe.schema.json). Tam işlenmiş örnek:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Dört katman (WHO SMART Kılavuz yaklaşımından uyarlanmıştır)

| Katman | Neleri içerir | Kim yazar | Nerede bulunur |
|---|---|---|---|
| **R1 Anlatı** | İnsan yemek tarifi metni, hikaye, kültürel notlar, fotoğraflar | Aşçılar, şefler, fifi.cooking | `text`, `dish.images` |
| **R2 Yemek spesifikasyonu** | Yemeğin *ne olduğu* ve *ne olması gerektiği*: kimlik (temel vs esnek), duyusal hedefler, beslenme, servis ve yeme stili, saklama, kabul kontrolleri | Tarif editörleri, AI-destekli, gözden geçirilmiş | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Yürütülebilir IR** | Cihazdan bağımsız yöntem: formül (oranlar + roller), tiplendirilmiş operasyonların gıda durumu ön/son koşullu süreç grafiği, `until` koşulları, alternatifler, duraklatma kuralları, hata modları, imkanlar, tehlikeler, CCP'ler, ortam hazırlığı | Dışa aktarma hattı + gözden geçirme; simülatör-doğrulanmış (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Sınırlandırılmış plan** | *Bu* Görev için derlenmiş R3 tarifi: kesin miktarlar, seçilen varyantlar, atanan aktörler ve cihazlar, program, kiralamalar, izleyiciler, beklenmedik durumlar | Planlayıcı/derleyici, çalışma zamanında | **Mission** (`plan`) içinde, asla katalogda değil |

Kaynak kod ve bir derleyici gibi: **tarif taşınabilir ara gösterimdir (R3 + R2). Görev ise hedef makinedir.** Robotlar ve yapay zeka değiştikçe tarifleri geçerli kılan şey budur: daha iyi bir planlayıcı, aynı tariften daha iyi bir R4 üretir.

## 2. Bir Görevde her bölümün işlevi

| Tarif bölümü | Görev tarafından ... için kullanılır |
|---|---|
| `identity.essential / flexible / neverAdd` | İkame, bütçe ve rasyon modları, diyet adaptasyonları: esnek kısımları değiştirin, temel kısımları asla değil, böylece yemek hala kendisi kalır |
| `formula` (ratios, min/max, role, scaling) | Herhangi bir kişi sayısına tam ölçekleme, malzemelerin bir hafta boyunca rasyonlanması, bütçeyi esnetme, eldekileri kullanma (sınırlayıcı-malzeme yeniden ölçekleme) |
| `sensory` | Görsel, aroma ve tat kontrol noktaları; household taste profilleri (tuz 2 vs 4); yeniden amaçlandırma ve düzeltme kararları |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Ortam hazırlama görevleri:** eğer lavabo veya ocak doluysa, planlayıcı "temizle, yıka, kurula" görevleri ekler; ıslatma veya çözündürme görevleri saatler öncesinden planlanır |
| `process.nodes[]` with `pre`/`post` food states | Planlama (sadece hazır olanı başlat), doğrulama (adım durumu üretti mi?), kesintilerden sonra devam etme |
| `until`, `onTimeout`, `retry` | Bir adımın ne zaman bittiğini ve bitmediğinde ne yapılacağını bilme |
| `alternatives[]` + `energy` | Gaz vs indüksiyon vs fırın, pil tasarrufu, fırınsız mutfaklar, sessiz saatler |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Kesintiler:** bir çocuğun yardıma ihtiyacı var, sahibi çağırıyor, köpek bir şeyi deviriyor. Robot adımı safe state durumuna sokar, olayı yönetir, ardından pause budget değerine göre devam eder, yeniden ısıtır, kurtarır veya atar |
| `failureModes` (incident, detect, prevent, playbook) | Bilinen sorunların erken tespiti ve kurtarmak için tam playbook |
| `affordances`, `space` | Adımları kavrayabilen, kaldırabilen ve ulaşabilen robotlarla eşleştirme; sıcak bölgeleri çocuklardan uzak tutma |
| `safety` (hazards, CCPs, supervision, abort) | Güvenlik çekirdeği: her planın koruması gereken değişmezler |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Servis: masaya, odaya, beslenme çantasına ne konur; hatırlatıcılar ve bekleme limitleri; kültürel yeme stili |
| `storage` | Artan yemekler, önceden pişirme ve beslenme çantası Görevleri |
| `acceptance` | Tarifin *testleri*: bunlar sağlandığında Görev tamamlanmış olur |
| `nutrition`, `cost` | Kişisel porsiyonlar, bütçe, yardım rasyonları |

## 3. Örnek: her şeyin bağlı olduğu tek bir adım

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. Bir Görev için tarif derleme (planlayıcının yaptığı şey)

1. **Varyantı seçin:** diyet, doku (IDDSI), ekipman, enerji ve `alternatives` içinden mod seçimi. Kimlik esasları korunmalıdır.
2. **Ölçeklendirin:** `formula` ve porsiyonlardan, kişi başına düşen porsiyonlardan (HEALTH.md), sınırlayıcı bileşenden veya bir rasyon ufkundan. Baharatlar alt-doğrusal, zaman ise kütle üssü ile.
3. **Yerine koyun:** roller dahilinde, `identity.neverAdd`, alerjenler, diyet paketleri ve envanteri gözeterek.
4. **Ortamı hazırlayın:** `prep` aşamasını Görev'in alan facet'leri ile karşılaştırın (lavabo dolu mu? ocak işgal edilmiş mi? tahta kirli mi?) ve düzenleme, yıkama, kurutma ve hazırlık görevlerini ekleyin. `advanceTasks` (ıslatma, çözme, marine etme, ön ısıtma) görevlerini planlayın.
5. **Bağlayın:** her düğümü imkanlar ve yeteneklere göre robotlara, cihazlara veya insanlara atayın. Ocak gözlerini, kapları ve bölgeleri kiralayın. İzleyicileri ekleyin (akıllı tencere, teslimat ETA, duman dedektörü).
6. **Planlayın:** servis zamanından geriye doğru, duraklatma bütçelerine, pil ve enerji limitlerine, hane halkı sessiz saatlerine ve mutfak paylaşım pencerelerine uyarak.
7. **Beklenmedik durumları ekleyin:** her düğümün `failureModes` ve `pause` kuralları, artı Görev'in küresel politikaları (kesintiler, ocağın yanında çocuk veya evcil hayvan, ocak gözlemcisi, bozulma takibi).
8. **Doğrulayın:** şema + anlamsal kontroller, politika paketleri, CCP kapsamı, simülatör dry run, öncelik yığını değişmezleri (PROTOCOL §7.2).
9. **R4'ü** Görev'in `plan` kısmına yayın, imzalayın ve robota teslim edin.

## 5. Yazma ve dönüştürme

- **fifi.cooking'den:** EXPORT-FIFI hattı R1 + R2 + R3 üretir. Yeni bölümler (identity, sensory, formula, prep, service, pause, failureModes, affordances) mevcut metinden yerel modeller tarafından oluşturulur ve doğrulayıcılar ile örneklem bazlı insan incelemesi ile kontrol edilir.
- **Web'den:** `cookwala convert --from schema-org` → R1/R2 (V0), ardından aynı zenginleştirme.
- **Diğer formatlara:** schema.org Recipe (arama motorları için R1/R2), Cooklang (insan düzenlemesi), PDDL veya temporal logic (araştırma planlayıcıları) bunların tamamı R3'ten üretilebilir.
- **Elle:** `cookwala init recipe` tüm katmanları yapılandırır; `cookwala validate` ve `cookwala simulate` bunları kontrol eder.
- **Versiyonlama:** revizyonlar değiştirilemez ve hashlenmiştir. Forklar `meta.derivedFrom` kaydeder. Tarif **patches** (playbook'lardan veya geri bildirimlerden gelen) diff olarak önerilir ve yalnızca inceleme ve kanıt sonrası yükseltilir.

## 6. Adım metninin dili

Adım cümleleri önce bir kişi için yazılır ve ikinci olarak bir makine tarafından ayrıştırılır. Örnek tariflerdeki Arapça adım metni, yaygın Mısır yemek kitabı geleneği olan dişil emir kipini (قطّعي، سخّني) kullanır; bu kasıtlı bir seçimdir, bir ihmal değildir ve bir yayıncı bunun yerine cinsiyetsiz edilgen yapıyı (تُقطَّع البصلة) kullanabilir. `op`, `params` ve `until` alanları anlamı taşır; cümle aşçı içindir.

## 7. Bu neden geleceğe hazır kalıyor

- Tarifler **hareketleri değil, gıda sonuçlarını ve kısıtlamalarını** tanımlar. Yeni robotlar ve yeni yapay zeka, aynı R3'ten daha iyi R4 planları üretir.
- Tüm yeni bölümler **isteğe bağlı ve ekleyicidir**. Bir V0 tarifi (sadece R1) rehberli insan pişirme için hala çalışır; eklenen her katman daha fazla otomasyonun kilidini açar.
- Bilinmeyen `x-` alanları aynen aktarılır. Tedarikçiler, şefler ve sağlık kuruluşları, kimsenin sistemini bozmadan tarifleri genişletebilir.
- **Kabul kontrolleri**, insan veya robot fark etmeksizin herhangi bir yürütücünün yemeğin doğru çıktığını kanıtlamasını sağlar; tariflerin saha kanıtlarıyla V3'e yükselmesi bu şekilde gerçekleşir.

