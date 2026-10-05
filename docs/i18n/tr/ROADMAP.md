<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# Yol Haritası: now, next, later

**Durum:** 2026-10-04. Her öğe bir durum taşır: **done**, **in progress**, **planned**,
**not yet funded**. Geçitler `ACTION-PLAN.md` bölüm 4'ten gelir. Adı belirtilen kanıt olmadan hiçbir şey planned
durumundan done durumuna geçmez.

## Şimdi (bu sürüm)

| Öğe | Durum |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (taslak, inceleme altında) |
| 101 conformance vektörü (Core ve profiller), conformance rapor formatı | done |
| Referans kütüphanesi, Python paketi ve CLI, TypeScript tipleri, MCP server, referans hub, ROS 2 arayüz paketi | done (düzenlenebilir ve kaynak kurulumları; registries next) |
| İngilizce ve Arapça dokuz örnek tarif | done (V1: yapılandırılmış, field-verified değil) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar ve parser, dört işlenmiş akış, etki özetleri, pilot protokolü, concept note | done (taslak) |
| İnceleme şablonu ile birlikte Health rule packs (temel, hassas gruplara bakım, okul yemekleri, sodyum azaltma) | done (taslaklar profesyonel inceleme bekliyor) |
| 139 tipinde bir facet registry ve disclosure vektörleri ile Household Context Profile | done (taslak) |
| Registry ve directory API, dürüst `registry.json` ve `directory.json` | done (statik) |
| Mutfaklar ve production runs; tedarik sinyalleri | done (deneysel) |
| Federation kuralları ve relay vektörleri | done (taslak) |
| Protokolün açık ve kapalı olduğu dört simülatör | done (örnekleyici) |
| Her paydaş için bir sayfa, whitepaper ve sunum içeren İngilizce ve Arapça web sitesi | in progress |

## Next (yaklaşık bir yıl içinde, kaynaklar izin verdiği ölçüde)

| Öğe | Durum | Kapı |
|---|---|---|
| operation envelope'ların gıda bilimci incelemesi | planned | incelemeci onaylıyor |
| dört rule pack'in diyetisyen ve gıda güvenliği görevlisi incelemeleri | planned | incelemeler dosyalandı; paketler reviewed durumuna geçer |
| household profile'ın veri koruma etki değerlendirmesi | planned | incelemeci onaylıyor |
| Bir food-bank pilotu (12 hafta, önceden kayıtlı, bağımsız değerlendirici) | not yet funded | ortak ve finansman (`humanitarian/CONCEPT-NOTE.md`) |
| Çeşitli model aileleri için ajan güvenliği kıyaslama sonuçları | planned | yöntemle birlikte çalışmalar yayınlandı |
| `pip install cookwala` wheel ve npm üzerinde `@cookwala/sdk` | planned | sözlükleri ve şemaları paketleyen paketleme |
| Registry servisi (`validate`, `publish`, tombstones) | planned | bir işçi ve namespace kanıtı |
| Core API'yi referans hub'a karşı uygulayan ilk cihaz üreticisi | planned | bir üretici onaylıyor; conformance raporu yayınlandı |
| İlk fifi.cooking koleksiyonlarının dönüşümü | planned | kurucu her koleksiyon için haklara karar verir |
| Cihaz geri bildirimlerinden Core 0.3 | planned | iki uygulayıcının geri bildirimi |
| Yönlendirme komitesi | planned | üç bağımsız benimseyen veya iki uygulama |

## Later

| Öğe | Durum |
|---|---|
| Bir Cookwala tarifini videoda, düzenlenmemiş şekilde pişiren gerçek bir cihaz | henüz finanse edilmedi; bir cihaz ortağı gerekiyor |
| Bağımsız bir sertifikalandırıcı ile sertifikasyon şeması | planlandı; henüz bir sertifikalandırıcı ile anlaşılmadı |
| Şartname, ticari marka ve işaret için tarafsız temel | planlandı |
| Katılımcı ağı: atıf içeren gerçek tariflerin onaylı kayıtları | planlandı |
| Programlar ve kooperatifler tarafından yayınlanan talep ve arz sinyalleri | planlandı, rekabet hukuku incelemesinin ardından |
| "Simülasyonda pişir" kıyaslaması (Isaac Lab, Gazebo veya MuJoCo) | planlandı |
| İnsani Profil için Dijital Kamu Yararı tanınması | planlandı, pilot kanıtın ardından |
| Dünya simülatöründe bölgeler arası yardım akışları; temiz pişirme etkileri | planlandı |

## Yapmayacağımız şeyler

Kişisel verileri topla; bir yöntem belirtmeden sayıları yayınla; bir ortak onaylamadan önce onu isimlendir;
var olmayan bir certification iddia et; household verilerini herhangi bir deftere koy; mutfakların bağımlı olduğu merkezi bir
orchestrator inşa et; açlığı bitirdiğini iddia et.

## Kill ve pivot kuralları

Eylem planından: eğer iki harici inceleme turu bir cihaz üreticisi veya bir pilot ortak ortaya çıkaramazsa, Cookwala Humanitarian Profile ve tarif formatına daralır. Eğer bir pilot %5'ten daha az kazanç gösterirse, sonuçlar yayınlanır ve herhangi bir ölçeklendirme yapılmadan önce profil yeniden tasarlanır.

