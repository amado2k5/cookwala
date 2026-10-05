<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Household Context Profili: bütün resim evde kalır

> **Durum: taslak profil** (RFC-0001). Cookwala Core'un bir parçası değildir. Şema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet tipi).
> Alıcı kuralları: `profiles/household/recipient-roles.json`. Yerel API:
> `api/household.openapi.yaml`. Örnek: `examples/household/context.json`.

## 1. Neden

Bir aileye iyi hizmet eden bir robotun çok şey bilmesi gerekir: cihazlar ve onların tuhaflıkları, orada kimlerin yaşadığı ve ne zaman evde oldukları, evcil hayvanlar, çocuklar, diyetler, alerjiler, ilaç zamanlaması, ritüeller, bütçe, alışveriş alışkanlıkları, geçen sefer neyin yanlış gittiği. Aynı gerçekler bir hırsızlık planı ve bir profilleme aracıdır. Bu profil, **evdeki planlayıcıya** tam resmi verir ve diğer herkese yalnızca bir **constraint** verir.

## 2. Üç fikir

1. **Facets.** Her biri tek bir yazılmış gerçek (`cw.facet.household.health.allergies`), bunu kimin
   ileri sürdüğü (declared, observed, reported, inferred), ne zaman, ne kadar süreyle, ne kadar güvenle
   ve bir gizlilik sınıfı (`public`, `household`, `sensitive`, `secret`) ile birlikte.
2. **Registry içindeki seyahat kuralları.** Her facet tipi, ham değerinin evden çıkıp çıkamayacağını belirtir:
   `never` (45 tip: çocuklar, yokluklar, yerleşim düzenleri, sağlık durumları, din,
   davranış, olaylar, gelir duruşu), yalnızca bir `derived` kısıtlama olarak (81 tip) veya
   açık bir izin sonrası `consented` ifşa olarak (13 tip, çoğunlukla üretici için cihazın kendi durumu).
3. **Derived constraints.** Bir bakkalın, planlayıcının, teslimat servisinin, cihaz üreticisinin veya başka bir robotun
   aldığı tek hane nesnesi: "17:00–18:00 arası ön kapıya teslim et", "yer fıstığını engelle",
   "15:00–15:30 arasında koridorda robot hareketi olmasın", "öğün başına 18.00 USD bütçe sınırı". Her biri,
   geldiği facet **types** isimlerini belirtir, asla değerlerini değil.

## 3. Kim neyi alır

| Alıcı rolü | Alabilir |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (öğünü planlayan AI veya yazılım) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; consent ile device self-state facets |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | yalnızca device fault summary (kategoriye göre hata sayıları, zamanlar yok, household facts yok) ve yalnızca household bir insurer'ı alıcı olarak belirlediğinde; RFC-0001 bunu, bir gizlilik incelemesi itiraz ederse kaldırılma olasılığı en yüksek rol olarak listeler |
| program (food bank, school) | hiçbir şey |
| dataset | hiçbir şey |

## 4. Kurallar

- Ham facet'ler cihazdan asla ayrılmaz. Bunları ev ağı dışındaki herhangi birine döndüren bir API yoktur.
- `inferred` facet'ler güvenlik kararları için asla kullanılmaz.
- Hiçbir kişinin davranışsal puanı üretilmez veya saklanmaz. Davranış facet'leri hane halkına hizmet etmek (porsiyon boyutları, ne zaman temizleneceği) için vardır ve asla taşınmaz.
- Ekonomik seviye, hiçbir şeyden çıkarım yapılmayan, **sahibi tarafından belirlenen bir bütçe duruşudur**.
- Çocukların verileri ve yoklukları `secret` kapsamındadır ve hiçbir zaman taşınmaz; hareket ve herhangi bir program ifşa etmeyen güvenli bölge kısıtlamaları dışında, türetilmiş olsalar dahi taşınmazlar.
- Her facet silinebilir. Silme işlemi hane halkının penceresi içinde tamamlanır (varsayılan 7 gün, en fazla 30) ve içerik olmadan günlüğe kaydedilir.
- Bir gizlilik sınıfı, registry varsayılanının üzerine çıkarılabilir, asla düşürülemez.

## 5. Yerel olay belleği

RFC-0001 robotun alarmlar, çatışmalar, vazgeçmeler ve dersler hakkında neleri hatırladığını sorar. `LocalIncident` bunları tutar: tarih, `vocab/incidents.json` dosyasından kategori, türüne göre kimlerin dahil olduğu, bir not ve bir ders. Asla evden ayrılmaz. Core içindeki halka açık, anonim `IncidentReport` ise her maker'ın ders çıkardığı farklı bir belgedir.

## 6. Conformance

Profil vektörleri (`conformance/profiles/disclosure_policy.json`) facet'ler ve bir alıcı rolü verir ve tam kısıtlama türlerini, ifşa edilen id'leri ve nedenleriyle birlikte gizlenen id'leri bekler. Referans uygulama `tools/cookwala_ref.py` içindeki `derive_constraints()` fonksiyonudur.

## 7. Diğer dokümanlarla ilişki

`ClientProfile`, `KitchenProfile` ve `RobotProfile` (`profile.schema.json`) kullanışlı paketler olarak kalır. Görev facet'leri (`mission.schema.json`) aynı registry id'lerini kullanır. Core `AgentMandate`, bir ajanın ne yapabileceğine dair normatif ifade olarak kalır; mandate facet'leri hane halkının kurallarını yerel olarak tanımlar.

## 8. Açık sorular

RFC-0001'e bakın: kapalı alıcı rolleri; raise-only gizlilik; bir incelemeci ile veri koruma etki değerlendirmesi.

