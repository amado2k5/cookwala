<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# Surplus pertanian dan sinyal pasokan

> **Status: experimental** (RFC-0007). Schema: `schemas/supply.schema.json`. Contoh:
> `examples/supply/`. **Gate:** tinjauan hukum persaingan sebelum penggunaan produksi apa pun
> (`docs/ACTION-PLAN.md`, concern C7). cookwala.ai tidak menerbitkan sinyal apa pun hari ini.

## 1. Dua hal yang dibutuhkan petani now

1. **Sebuah cara untuk mencantumkan surplus sebelum membusuk.** Sebuah pertanian adalah donor dalam Humanitarian Profile:
   sebuah `Offer` dengan `Item.origin: farm` dan `harvestedAt`, atau melalui SMS:

   FARM 120KG TOMATO A BB0411

food bank mengklaimnya, sebuah dapur memasaknya, distribusi menghitungnya. Tidak ada dokumen baru,
   tidak ada data pribadi, hanya organisasi.
2. **Sinyal yang adil tentang apa yang akan dibutuhkan.** Itu adalah bagian eksperimental di bawah ini.

## 2. Sinyal permintaan dan penawaran

| Dokumen | Mengatakan | Aturan |
|---|---|---|
| `DemandSignal` | Di wilayah R, pada minggu ISO W, dapur dan program berencana menggunakan antara L dan H kg bahan **kelas** C | setidaknya 20 sumber kontributor; dipublikasikan setidaknya 7 hari setelah minggu berakhir; tingkat kelas (legume, leafy vegetable, poultry), tidak pernah produk atau merek; **tanpa harga**; wilayah tidak lebih detail dari admin1 kecuali 100 sumber atau lebih |
| `SupplySignal` | Di wilayah R, pada minggu W, kelas C dalam kondisi glut, pasokan normal atau kurang, dengan jendela panen | dipublikasikan oleh koperasi, program atau operator pasar; **terbuka untuk semua**: publik, gratis, identik untuk setiap pembaca |

Pemeriksaan referensi adalah `check_signal()` di `tools/cookwala_ref.py`; vektor profil (`conformance/profiles/signal.json`) menunjukkan apa yang diterima dan ditolak.

## 3. Mengapa aturan ini

Berbagi prakiraan antar kompetitor adalah pertukaran informasi yang diperingatkan oleh otoritas persaingan. Agregasi, penundaan, tingkat kelas, tanpa harga, dan publikasi terbuka menjaga sinyal tetap berguna untuk perencanaan dan tidak berguna untuk mengoordinasikan harga. Ambang batas adalah titik awal; penasihat dan seorang statistikawan harus menetapkannya.

## 4. Menjadi apa ide pendiri tersebut

Loop makro (RFC-0007): memasak yang direncanakan → permintaan agregat →
pertanian dan toko merencanakan kebutuhan → lebih sedikit yang ditanam, dipindahkan dan dibuang. Simulator kota, negara dan
dunia menunjukkan besarnya efek di bawah asumsi mereka (ilustratif, bukan sebuah
perkiraan). Kedua dokumen ini adalah langkah jujur terkecil menuju hal tersebut.

## 5. Later

Saran penanaman dari permintaan ke depan; penentuan ukuran cadangan (rantai pasok yang sangat ramping adalah rapuh); aliran bantuan lintas wilayah; sinyal pasokan melalui SMS dari koperasi.

