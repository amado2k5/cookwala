<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# Çiftlik surplus ve arz sinyalleri

> **Durum: experimental** (RFC-0007). Şema: `schemas/supply.schema.json`. Örnekler:
> `examples/supply/`. **Eşik:** herhangi bir üretim kullanımı öncesinde rekabet hukuku incelemesi
> (`docs/ACTION-PLAN.md`, endişe C7). cookwala.ai bugün hiçbir sinyal yayınlamıyor.

## 1. Çiftçilerin şimdi ihtiyaç duyduğu iki şey

1. **Bir fazlalığı çürümeden listelemenin bir yolu.** Humanitarian Profile içinde bir çiftlik bir donördür:
   `Item.origin: farm` ve `harvestedAt` içeren bir `Offer` veya SMS yoluyla:

   FARM 120KG TOMATO A BB0411

food bank bunu iddia eder, bir mutfak onu pişirir, dağıtım onu sayar. Yeni bir belge yok,
   kişisel veri yok, sadece kuruluşlar.
2. **Neye ihtiyaç duyulacağına dair adil bir sinyal.** Aşağıdaki deneysel kısım budur.

## 2. Talep ve arz sinyalleri

| Belge | Der | Kurallar |
|---|---|---|
| `DemandSignal` | R bölgesinde, W ISO haftasında, mutfaklar ve programlar C **sınıfı** malzemeden L ile H kg arası kullanmayı planladı | en az 20 katkıda bulunan kaynak; hafta bittikten en az 7 gün sonra yayınlanmış; sınıf seviyesi (baklagil, yapraklı sebze, kümes hayvanı), asla bir ürün veya marka değil; **fiyat yok**; 100 veya daha fazla kaynak yoksa admin1'den daha ince olmayan bölge |
| `SupplySignal` | R bölgesinde, W haftasında, C sınıfı bir hasat penceresi ile bol, normal veya kıt arz durumunda | bir kooperatif, program veya piyasa operatörü tarafından yayınlanmış; **herkese açık**: kamuya açık, ücretsiz, her okuyucu için özdeş |

Referans kontrolü `tools/cookwala_ref.py` içindeki `check_signal()` fonksiyonudur; profil vektörleri (`conformance/profiles/signal.json`) nelerin kabul edildiğini ve reddedildiğini gösterir.

## 3. Bu kurallar neden var?

Rakipler arasında tahmin paylaşımı, rekabet otoritelerinin uyardığı bilgi değişimidir. Toplulaştırma, gecikme, sınıf seviyesi, fiyat olmaması ve açık yayınlama; sinyali planlama için yararlı, fiyatları koordine etmek için ise yararsız kılar. Eşik değerler başlangıç noktalarıdır; hukuk danışmanı ve bir istatistikçi bunları belirlemelidir.

## 4. Kurucunun fikri neye dönüşür

Makro döngü (RFC-0007): planlanan pişirme → birleştirilmiş talep →
çiftlikler ve mağazaların ihtiyaç duyacağını planlaması → daha az yetiştirilen, taşınan ve çöpe atılan. Şehir, ülke ve
dünya simülatörleri, varsayımları altında etkinin büyüklüğünü gösterir (tahmin değil, örneklendirme). Bu iki belge, ona doğru atılan en küçük dürüst adımdır.

## 5. Later

İleri talep üzerinden ekim tavsiyeleri; rezerv boyutlandırma (mükemmel derecede yalın bir tedarik zinciri kırılgandır); bölgeler arası yardım akışları; kooperatiflerden SMS yoluyla gelen tedarik sinyalleri.

