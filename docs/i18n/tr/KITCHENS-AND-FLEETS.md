<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->

# Mutfaklar ve üretim süreçleri: restoranlar, topluluk, okul, afet ve robot mutfakları

> **Durum: experimental profile** (RFC-0005). Şema: `schemas/fleet.schema.json`.
> Örnekler: `examples/fleet/`.

## 1. Neden

Kurucu; bir restoranda, bir düğünde, bir bağış kampanyasında veya bir gıda fabrikasında (RFC-0005) aynı protokolü talep etti. Özet; okul yemeği programlarını ve afet mutfaklarını da ekler. Çekirdek, bir cihazın bir tarifi pişirmesini kapsar; İnsani Profil ise surplus hareketini ve öğün sayımını kapsar. Aralarında **mutfak** yer alır: istasyonlar, cihazlar, insanlar, birçok parti, bir servis penceresi, kritik kontrol noktaları ve bir cihazın execution log kaydından bir programın raporladığı öğünlere olan bağlantı.

## 2. Belgeler

| Belge | Ne söylüyor |
|---|---|
| `Kitchen` | Bir organizasyonun mutfağı: tip, istasyonlar (hazırlık, ocak, fırın, fritöz, kettle, robot hücresi, tabaklama, paketleme, sıcak tutma, soğutma, soğuk depo, yıkama), yetenek referansları olarak cihazlar, saat başına öğün cinsinden kapasite, sıcak tutma ve soğutma ekipmanları, yürürlükteki rule pack'ler, role göre personel **sayıları**, çalışma saatleri |
| `ProductionRun` | Parti sayıları ve porsiyonları ile tarifler, bir servis penceresi, tarif adımı başına bir istasyona ve bir `device`'a, bir `person`'a veya her ikisine yapılan atamalar, kritik kontrol noktası kayıtları (pişirme çekirdek sıcaklığı, sıcak tutma, iki aşamalı soğutma, yeniden ısıtma, soğutulmuş depolama, alerjen ayrıştırma), üretilen Core yürütmeleri ve bir sonuç (üretilen ve servis edilen öğünler, atık, kurtarılan gıda kullanımı, hatalar, olaylar, enerji, maliyet, yaydığı Humanitarian `Distribution`) |
| `StationLease` | Bir istasyonun bir cihaz veya bir rol tarafından belirli bir süre için özel kullanımı |

## 3. Diğerleriyle nasıl birleşir

- Bir `device` birime atanan bir adım, bir Core `ExecuteRequest` (veya ROS 2 bağlaması aracılığıyla bir `ExecuteNode` hedefidir); `ExecutionLog` özeti `executions` içine girer.
- Bir programa hizmet eden bir run, bir Humanitarian `Distribution` yayar; run'ın `ccps` değerleri, dağıtımın güvenlik bulgularının arkasındaki kanıtlardır.
- Humanitarian Profile'dan gelen rule pack'ler, run'ın menüsüne ve öğelerine uygulanır.
- Filo sevkiyatı (hangi robotun nereye gideceği) bu profile değil, Open-RMF'e veya bir satıcının filo yöneticisine aittir.

## 4. Uygulamalı örnek

`examples/fleet/kitchen-disaster.json` ve `production-run-disaster.json`: iki gazlı kazan, sıcak tutma üniteleri ve bir buz banyosu ile donatılmış bir yardım mutfağı iki saatlik bir pencerede 710 porsiyon mercimek çorbası ve pirinç üretir, pişirme ve sıcak tutma sıcaklıklarını kaydeder, 60 °C'nin altında bir sıcak tutma ünitesi bulur ve servis etmeden önce o partiyi yeniden ısıtır ve bir dağıtım gerçekleştirir. Örnek açıklayıcıdır; gerçek bir mutfak veya olay tanımlanmamıştır.

## 5. Kasten dışarıda bırakılanlar

Personel isimleri ve programları, ücretler, müşteri siparişleri ve ödemeler, menü fiyatlandırması. Personel, kimse tanımlanmadan öğün başına maliyet hesaplanabilmesi için rol bazlı sayılar olarak görünür.

## 6. Next

Bir robot istasyonu ile restoran servis örneği; çalışma durumu durum makinesi için bir conformance paketi; `StationLease` yapısının oturum kiralamaları (`session.schema.json`) ile birleştirilmesi.

