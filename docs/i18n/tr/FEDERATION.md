<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->

# Federasyon: Cookwala merkez olmadan nasıl çalışır

**Durum:** taslak, 2026-10-04 (RFC-0006). Kurucunun resmi bir arı kovanıydı: merkezi bir komuta yoktu, ancak uyum ve toparlanma vardı. Bu sayfa bunun pratikte ne anlama geldiğini söylüyor.

## 1. Düğümler

| Düğüm | Neye hizmet eder | Kim çalıştırır |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, tarifler, sözlükler, rule packs, anahtarlar, beslemeler | bir tarif yayıncısı, bir food bank ağı, bir üniversite, bir cihaz üreticisi, cookwala.ai |
| **Registry** | `/v1/registry.json`: kataloglara, koleksiyonlara, cihazlara, paketlere, kıyaslamalara işaretçiler | herkes; cookwala.ai bir tane çalıştırır |
| **Hub** | bir mutfak için Core API, yerel güvenlik limitleri, household context | her mutfak; çevrimdışı çalışır |
| **Mirror** | diğer düğümlerin imzalı öğelerini değiştirilmeden yeniden yayınlar | bölgesinde dayanıklılık isteyen herkes |

Statik bir klasör geçerli bir katalogdır. CSV şablonlarına sahip bir telefon, H0 seviyesinde geçerli bir insani yardım katılımcısıdır.

## 2. Komutlar değil, beslemeler

Düğümler imzalı beslemeler yayınlar: recalls, anonim olaylar, registry değişiklikleri, ana kayıtlar.
Diğer düğümler güvendikleri şeyleri sorgular ve bunları yeniden yayınlayabilir. Bir mutfağa hiçbir şey itilmez; bir mutfak çevrimiçiyken çeker ve çevrimiçi olmadığında çalışmaya devam eder.

## 3. Yayınlayana karşı doğrulayın, asla aktarıcıya karşı değil

Bir aynadan gelen bir recall, yalnızca **issuer'ın** imzası kadar iyidir. Bir hub, issuer'ın kendi discovery document veya did:web kaynağından issuer'ın `KeyRecord` bilgisini çözer ve gövdeyi bayt bayt doğrular. Aynanın anahtarı içerik hakkında hiçbir şey kanıtlamaz; bir recall'ı düzenleyen bir ayna imzayı bozar. `conformance/profiles/federation.json` içindeki profil vektörleri üç durumu göstermektedir.

## 4. Güven listeleri

Her hub, güvendiği katalogların ve registry'lerin anahtarları ve bir öncelik derecesiyle birlikte bir listesini tutar. Bir node akranlar (`federation.peers`) önerebilir; kararı hub verir. cookwala.ai böyle bir listedeki bir giriştir, bir root değildir.

## 5. Tazelik

Registry girişleri bir durum ve bir yayınlanma zamanı taşır; recalls bir sorun zamanı taşır; household facets bir geçerlilik taşır. Bayat öğeler yeniden çekilir veya bırakılır. Hiçbir şey eski olduğu için güvenilmez, hiçbir şey sessizce silinmez: geri çekilen girişler tombstones olarak kalır.

## 6. Geçmiş

Gözlemlenmiş kontrol noktalarına sahip olay günlükleri (Core bölüm 5), bir blockchain olmadan yeniden yazımları tespit edilebilir kılar: ikinci bir taraf günlüğün başını karşılar imzalar ve daha sonraki bir yeniden yazım artık eşleşmez. Kontrol noktası başlarının halka açık şekilde sabitlenmesi isteğe bağlıdır ve bir kurucu kararıdır (`docs/research/BACKSTORY.md` bölüm 4.7).

## 7. Birlikte çalışan üç düğüm

- **Bir food bank ağı**, mutfaklarının ve bağışçılarının bir registry'sini, ulusal yasaya uyarlanmış rule pack'lerinin bir kataloğunu ve bir SMS gateway'ini yönetir. Kendini cookwala.ai directory içinde listeler veya listelemez; verileri asla ülkesinden çıkmak zorunda değildir.
- **Bir cihaz üreticisi**, yetenek belgelerinin ve safety-limit pack'lerinin bir kataloğunu yönetir, conformance raporları yayınlar ve müşterilerinin kullandığı katalogların recall beslemelerini sorgular.
- **Bir üniversite laboratuvarı**, benchmark tariflerinin ve (onay ile) execution log'larının bir kataloğunu yönetir, terminolojileri aynalar ve kendi vektörlerini yayınlar.

Hiçbirinin cookwala.ai adresinin çevrimiçi olmasına ihtiyacı yoktur.

## 8. İnşa edilmeyen nedir

Merkezi bir orkestratör, merkezi bir kimlik sağlayıcı, bir token, bir blockchain. Görev profilinin quorum kararları ve orkestratörleri isteğe bağlı ve deneysel kalır.

