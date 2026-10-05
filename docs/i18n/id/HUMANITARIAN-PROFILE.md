<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->
# Profil Kemanusiaan Cookwala (draft 0.2)

**Status:** draf untuk ditinjau oleh food bank, program bantuan, dan profesional keamanan pangan dan nutrisi. Ini tidak ditinjau atau didukung oleh WFP, WHO, FAO, Global FoodBanking Network atau organisasi lain yang disebutkan di sini.

**Files:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (semua), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; semua draf menunggu tinjauan profesional, lihat [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank di Kairo, school meals, disaster kitchen, robot kitchen), masing-masing dengan `ImpactSummary` yang dihitung
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet dan SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Apa yang ditambahkan oleh 0.2 (RFC-0003, RFC-0004)

Tambahan di atas 0.1; pembaca menerima keduanya.

- **Farm to plate:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) dan `Item.harvestedAt`; peran `farm`, `caterer`, `robot_kitchen`; kata SMS `FARM`.
- **Care rules:** `Item.foodClasses` dan `Distribution.menu.foodClasses` (telur mentah, produk susu tidak dipasteurisasi, kacang utuh, nasi matang…), jenis aturan `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; tiga draf rule pack baru.
- **Reviews:** `RulePack.reviews` mencatat profesi, organisasi, tanggal, cakupan dan hasil dari setiap review; `status: reviewed` memerlukan review yang disetujui.
- **Impact:** `ImpactSummary` dengan sembilan ukuran, masing-masing membawa `method` (measured, modelled, assumed, not recorded), dihitung oleh `tools/humanitarian_check.py --summary`.
- **Time to claim:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` agar kilogram yang diselamatkan dihitung satu kali.
- **Program types** pada `Manifest`.

## 1. Tujuan

Sebuah bagian kecil, ketat, dan bebas data pribadi dari Cookwala untuk organisasi yang memberi makan orang:
food banks, dapur komunitas, program makan sekolah, program bantuan, donor (penjual bahan makanan,
restoran, pertanian, katering), pengangkut dan gudang pendingin. Ini mencakup empat pekerjaan:

1. **Menawarkan surplus food** dan mengklaimnya, secara cepat dan adil.
2. **Mencatat setiap handover** pengalihan hak milik, dengan pemeriksaan suhu (pemeriksaan cold-chain).
3. **Melaporkan apa yang disajikan** hanya sebagai jumlah agregat.
4. **Memeriksa menu dan handovers** terhadap aturan nutrisi dan keamanan pangan yang dapat dibaca mesin.

**Ini bekerja tanpa robot, aplikasi atau internet.** Level H0 dan H1 berjalan pada spreadsheet, SMS
dan ponsel dasar. Robot, hub dan agen adalah konsumen opsional dari dokumen yang sama.

## 2. Prinsip

- **Do no harm.** Jangan mengumpulkan apa pun yang dapat mengidentifikasi, melokalisasi, atau memprofilkan seseorang atau
  household. Dalam pengaturan yang rapuh, data tentang penerima manfaat adalah risiko perlindungan.
- **Humanitarian principles** (kemanusiaan, netralitas, ketidakberpihakan, kemandirian): tidak ada
  branding komersial pada bantuan, dan tidak ada penggunaan data untuk pemasaran.
- **Strict and small.** Setiap objek menolak field yang tidak dikenal (kecuali ekstensi `x-`),
  sehingga salah ketik dan field pribadi tambahan akan gagal validasi.
- **Exact units:** kilogram, derajat Celsius, toleransi absolut, dan uang sebagai string desimal.
- **Local rules win.** Rule packs dapat digantikan oleh hukum keamanan pangan nasional dan hukum donasi.
- **Open:** spesifikasi bebas royalti, alat sumber terbuka. Profil ini dirancang untuk memenuhi
  Digital Public Goods Standard dan Principles for Digital Development.

## 3. Tingkat conformance

| Level | Apa yang dilakukan peserta | Kebutuhan |
|---|---|---|
| **H0 — Paper & SMS** | Mencatat penawaran, serah terima dan distribusi dalam templat CSV (dengan baris tagar HXL) atau melalui SMS (bagian 8.3) | Spreadsheet atau ponsel dasar |
| **H1 — Rescue** | Menukar dokumen `Offer`, `Claim`, `Handover` dan `Distribution` melalui API; mengikuti state machine (bagian 5) | HTTP client apa pun |
| **H2 — Safety & nutrition** | Menerapkan `RulePack` pada setiap serah terima dan menu, dan mencatat `findings` | Reference checker atau yang setara |
| **H3 — Interoperability** | Mengekspor agregat ke HXL, DHIS2 dan core Cookwala `ImpactReport`; menggunakan pengenal GS1 | Pekerjaan integrasi |

Seorang partisipan memublikasikan sebuah `Manifest` di `/.well-known/cookwala-humanitarian.json` yang
mendeklarasikan level, rule packs, endpoints, dan `personalData: "none"`.

## 4. Dokumen

| Dokumen | Siapa yang menulisnya | Tujuan |
|---|---|---|
| `Offer` | Donor | Surplus food tersedia untuk pengambilan: item (kg, penyimpanan, tanda tanggal, alergen), jendela waktu, lokasi, suhu |
| `Claim` | Food bank, dapur, program | Mengklaim semua atau sebagian dari penawaran, dengan waktu pengambilan dan tipe kendaraan |
| `Handover` | Penerima hak asuh | Satu per leg: suhu, kg yang diterima atau ditolak dengan kode alasan, dan temuan rule pack |
| `Distribution` | Dapur, food bank, sekolah | Agregat makanan dan orang yang dilayani di sebuah lokasi pada suatu hari; nutrisi menu dan biaya opsional |
| `RulePack` | Program atau otoritas | Aturan nutrisi dan keamanan pangan yang memiliki versi (bagian 6) |
| `Manifest` | Setiap partisipan | Deklarasi kapabilitas dan perlindungan data |

Dokumen inti Cookwala relief (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` dalam `relief.schema.json`) tetap tersedia untuk perencanaan. Profil ini menangani
aliran operasional.

## 5. Siklus hidup penawaran

| Dari | Status next yang diizinkan |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (klaim kedaluwarsa), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | none (final) |

**Aturan untuk perubahan status:**

- Setiap perubahan meningkatkan `version`. Penulis mengirimkan `If-Match: <version>`; ketidakcocokan mengembalikan
  **409**, dan penulis membaca ulang dan mencoba kembali.
- Transisi ilegal mengembalikan **409** dengan transisi yang diizinkan.
- Penawaran berpindah ke `expired` secara otomatis pada `window.to`.
- Klaim berakhir pada `pickupBy` ditambah masa tenggang yang ditetapkan program (default 30 menit).

**Klaim yang adil.** Secara default, klaim bersifat siapa cepat dia dapat dalam tingkatan prioritas yang ditetapkan program:
misalnya, dapur yang melayani anak-anak terlebih dahulu, kemudian dapur lainnya, kemudian food bank. Tingkatan dan
aturan rotasi apa pun harus dipublikasikan dalam `Manifest` program atau situs web.

## 6. rule pack keamanan pangan dan nutrisi

Sebuah `RulePack` berisi aturan dari enam jenis:

- `temperature`: dingin ≤ 5 °C, panas-tahan ≥ 60 °C, beku ≤ −18 °C;
- `time`: makanan matang di luar kendali suhu selama paling lama 2 h;
- `date_mark`: blok gunakan-sebelum, peringatan baik-sebelum;
- `allergen`: blok alergen yang tidak dinyatakan;
- `nutrient`: jumlah per orang-hari atau per hidangan;
- `energy_share`: bagian energi dari gula bebas, lemak, lemak jenuh, lemak trans atau protein.

Setiap aturan adalah `block` (jangan terima atau sajikan) atau `warn` (diizinkan, dicatat sebagai temuan).

Paket default `who-codex-basic@0.1.0` adalah **draft derived from public guidance**: panduan WHO tentang healthy-diet, sodium, sugars dan fats, WHO Five Keys to Safer Food, Codex labelling dan frozen-food codes, serta angka perencanaan ransum minimum Sphere. Ini disederhanakan, bukan saran medis, mengecualikan pemberian makan bayi dan terapeutik, dan harus ditinjau oleh staf yang berkualifikasi. Program harus menyalin dan mengadaptasinya, mengatur `jurisdiction`, dan mencatat siapa yang meninjaunya di `reviewedBy`.

Penerima pada level H2 menjalankan pack pada setiap handover dan pada setiap menu, dan mencatat rule ids dalam `findings`. Pemeriksa referensi melaporkan di mana temuan yang dinyatakan dan dihitung tidak sesuai.

## 7. Perlindungan data

**Profil tidak membawa data pribadi. Dokumen TIDAK BOLEH berisi:**

- nama, nomor telepon, email, atau pengenal nasional, pengungsi, atau biometrik dari orang mana pun;
- catatan tingkat rumah tangga, atau lokasi rumah atau individu;
- kesehatan, disabilitas, agama, atau kebangsaan dari orang mana pun.

**Apa yang dibawanya sebagai gantinya:**

- **Hanya organisasi.** Setiap pihak adalah organisasi yang diidentifikasi oleh `did:web`, sebuah GS1
  Global Location Number (GLN) atau sebuah registry id. Orang hanya muncul sebagai peran
  (`checkedBy: "trained_staff"`).
- **Hanya agregat.** `Distribution.people` berisi jumlah berdasarkan grup, dan setiap jumlah di bawah 10
  dilaporkan sebagai `"<10"`.
- **Hanya situs.** Sebuah `Site` adalah premis organisasi atau area administratif
  (OCHA P-codes), tidak pernah sebuah household.
- **Catatan singkat.** Teks bebas dibatasi pada catatan operasional 280-karakter dan tidak boleh
  berisi data pribadi. Implementasi harus memindai catatan untuk nomor telepon dan id
  sebelum menyimpannya.

**Retensi dan audit:**

- **Retention:** setiap peserta mendeklarasikan `retentionDays` dalam `Manifest`-nya dan menghapus
  dokumen setelahnya.
- **Audit (opsional, `hash_only`):** satu sequencer per program (biasanya food bank atau
  operator program) menambahkan SHA-256 hash dari RFC 8785 canonical JSON setiap dokumen.
  Konten disimpan secara terpisah dan tetap dapat dihapus. Sebuah organisasi mitra
  menandatangani checkpoint setiap hari, sehingga riwayat tidak dapat ditulis ulang secara diam-diam. Sebuah sequencer tunggal menghindari fork dalam rantai.
- **Hosting** harus berada di dalam negeri di mana hukum atau program mensyaratkannya.

## 8. Transport

### 8.1 API (level H1)

| Metode | Jalur | Catatan |
|---|---|---|
| `POST` | `/offers` | Membuat sebuah penawaran (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Penawaran terbuka di dekat penerima |
| `POST` | `/offers/{id}/claims` | Mengklaim sebuah penawaran; `If-Match` diperlukan; 409 ketika sudah diklaim |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` diperlukan |
| `POST` | `/handovers` | Mencatat sebuah serah terima |
| `POST` | `/distributions` | Mencatat sebuah distribusi |
| `GET` | `/reports?from=…&to=…` | Agregasi untuk suatu periode |

Aturan permintaan dan transportasi:

- **Idempotency:** setiap `POST` membawa `Idempotency-Key`. Server menyimpan kunci selama setidaknya 24 h dan mengembalikan respons asli untuk pengulangan.
- **Authentication:** kredensial klien OAuth 2.1, satu klien per organisasi.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  dikirimkan setidaknya satu kali, dengan `id` peristiwa untuk deduplikasi dan nomor urut per-penawaran untuk pengurutan.

### 8.2 Spreadsheet (level H0)

Gunakan templat CSV di `profiles/humanitarian/templates/`. Baris keduanya berisi tagar [HXL](https://hxlstandard.org), sehingga alat data kemanusiaan dapat membacanya secara langsung.

### 8.3 SMS (level H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

Tata bahasa diimplementasikan dalam `tools/cookwala_ref.py` (`parse_sms`) dan diuji oleh
`conformance/profiles/sms.json`. Kata kunci dalam bahasa Inggris; angka Arab-Indik (٠-٩) dan Persia (۰-۹)
diterima di mana pun angka berada, sehingga ponsel yang diatur ke salah satu papan ketik akan berfungsi.

Kode penyimpanan: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Tanda tanggal: `UB` use-by,
`BB` best-before, `HV` harvested, sebagai `DDMM`. Kode alasan penolakan: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; kata lainnya dicatat sebagai `other`. Balasan `HELP`
HARUS berupa satu contoh per perintah, ASCII polos, di bawah 160 karakter.

Sebuah gateway HARUS menerapkan pemeriksaan ini sebelum menulis sebuah dokumen (`sms_storage_findings` dalam
referensi; ids adalah temuan blok):

| Temuan | Kapan |
|---|---|
| `safety.temp_not_recorded` | sebuah `HAND` pada lini dingin, beku atau panas tidak membawa pembacaan `T`: balas dengan menanyakannya, jangan tulis apa pun |
| `safety.hot_hold_min` | sebuah `OFFER` dengan penyimpanan `H` di bawah 60 °C: tolak untuk mencantumkannya |
| `safety.storage_class_mismatch` | kata-kata item menyiratkan produk susu, daging, unggas, ikan, telur atau makanan matang dan penyimpanan adalah `A`: tolak untuk mencantumkannya |
| `safety.chilled_max`, `safety.frozen_max` | pembacaan di atas 5 °C atau di atas −18 °C pada penawaran atau serah terima |

Penawaran makanan panas yang disimpan ditutup setelah dua jam (satu jam untuk nasi matang); sebuah gateway tidak pernah menyimpan pembacaan placeholder. Gateway memetakan nomor terdaftar pengirim ke sebuah organisasi, tidak pernah ke seseorang dalam dokumen tersebut.

## 9. Interoperabilitas

| Sistem | Pemetaan |
|---|---|
| HXL | Templat CSV; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (produk); `Site.gln` dan `OrgId` `gln:` (lokasi) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Nilai data agregat per situs dan periode dari `Distribution` (makanan, orang berdasarkan grup, kg, insiden) |
| WFP SCOPE dan sistem penerima manfaat lainnya | **Hanya agregat.** Tidak ada catatan penerima manfaat yang masuk atau keluar dari profil ini |
| Aplikasi penyelamatan makanan | Adaptor memetakan daftar mereka ke `Offer` dan penjemputan mereka ke `Claim` dan `Handover` |
| Core Cookwala | `Item.ingredientId` dan `menu.recipes` terhubung ke indeks resep; `relief.ImpactReport` menjumlahkan `Distribution`s |

## 10. Metrik pilot (didefinisikan agar situs dapat dibandingkan)

Dihitung ke dalam sebuah `ImpactSummary` oleh `python tools/humanitarian_check.py --summary DIR`. Bagaimana sebuah pilot dijalankan dan dinilai: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metrik | Definisi |
|---|---|
| Kg rescued | Jumlah `Handover.kgAccepted` pada tahap pertama dari donor |
| Claim rate | Penawaran yang mencapai `claimed` ÷ penawaran yang dibuat |
| Time to claim | Median menit dari pembuatan `Offer` ke status `claimed` |
| Rejection by reason | Jumlah `kgRejected` berdasarkan `reason` |
| Meals served | Jumlah `Distribution.meals` |
| Nutrition pass rate | Distribusi dengan menu dan tanpa temuan `nutrition.*` ÷ distribusi dengan menu |
| Cost per meal | (food + transport + staff + energy) ÷ meals |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Safety | Jumlah temuan blok `safety.*`, dan `safetyIncidents` |

## 11. Keamanan

- **Tanda tangan bersifat opsional pada H1** dan wajib untuk audit lintas-organisasi pada H3
  (EdDSA, kunci dipublikasikan di `did:web` organisasi).
- **Catatan dan nama dalam dokumen adalah data yang tidak dipercaya.** Perangkat lunak dan agen AI tidak boleh
  menganggapnya sebagai instruksi.
- **Rule packs memiliki versi dan dipaku** (`id@version`) dalam setiap temuan, sehingga hasil dapat
  direproduksi.

## 12. Sengaja dikosongkan

- Registrasi penerima manfaat, kelayakan dan penargetan (ini termasuk dalam sistem terlindungi milik program itu sendiri).
- Pembayaran: Cookwala tidak pernah memindahkan uang.
- Resep dan eksekusi robot (spesifikasi inti). Profil hanya menamai resep dan melaporkan nutrisi.
- Nutrisi medis dan terapeutik.

## 13. Cara meninjau

Silakan buka issue di [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
dengan label `humanitarian`. Tinjauan ini adalah yang paling berguna:

- staf keamanan pangan memeriksa rule pack dan alasan penolakan;
- operator food-bank memeriksa siklus hidup dan alur SMS;
- petugas perlindungan data memeriksa bagian 7.

