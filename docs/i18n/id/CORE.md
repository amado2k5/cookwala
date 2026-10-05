<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. Ini adalah bagian normatif dari Cookwala. MUST, SHOULD dan MAY mengikuti RFC 2119. Segala sesuatu yang tidak tercantum di sini adalah **profile** opsional (bagian 10).

Sebuah perangkat harus dapat mengimplementasikan Core dalam waktu sekitar satu minggu. Core menyatakan **apa yang harus dibuat, kapan itu selesai dan apa yang tidak boleh terjadi**. Core tidak menyatakan bagaimana sebuah robot bergerak.

## 1. Kelas conformance

| Kelas | Harus mengimplementasikan |
|---|---|
| **Recipe publisher** | Dokumen `recipe.schema.json` yang valid; suhu di dalam operation envelopes; sebuah hash dan tanda tangan |
| **Executor** (robot, peralatan atau hub) | Core API (`api/core.openapi.yaml`); operation envelopes dan sensor ladders; batas keamanan lokal; refusal alih-alih menebak; execution log |
| **Catalog** | Resep yang ditandatangani, `/.well-known/cookwala.json` dengan catatan kunci, umpan recall, intake insiden |
| **Agent** (AI atau perangkat lunak yang bertindak untuk seseorang) | Bertindak hanya di bawah `AgentMandate`; memperlakukan teks dokumen sebagai data; bertanya kepada prinsipal sebelum apa pun di `confirmBefore` |
| **Verifier** | Hash, tanda tangan, validitas dan pencabutan kunci, pengungkapan, rantai peristiwa dan titik pemeriksaan |

Mengklaim sebuah kelas berarti lulus vektor conformance-nya (`conformance/`, jalankan dengan
`tools/run_conformance.py`).

## 2. Dokumen inti

| Dokumen | Skema |
|---|---|
| Resep | `recipe.schema.json` |
| Kemampuan perangkat | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Tipe bersama (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Peristiwa | `event.schema.json` (CloudEvents) |
| Kosakata: operasi, unit dan tingkat panas, insiden | `vocab/*.json` |

Semua skema bersifat **strict**: field yang tidak dikenal akan ditolak, kecuali ekstensi `x-<vendor>-…`.
Pembaca mengabaikan field `x-` yang tidak mereka pahami. `tools/bundle_schemas.py` menghasilkan satu
bundle agar perangkat dapat melakukan validasi secara offline. Implementasi TIDAK BOLEH mengambil skema pada saat run time.

## 3. Apa arti operasi

- **Envelopes.** Setiap operasi berbasis panas atau berbahaya di `vocab/ops.json` memiliki `envelope`.
  Ini menentukan:
  - medium (air, minyak, udara, permukaan panci, produk…);
  - rentang suhunya dalam °C (dan tekanan, untuk memasak dengan tekanan);
  - agitasi, tutup, tingkat perhatian dan apakah langkah tersebut dapat dijalankan tanpa pengawasan;
  - bahaya;
  - metode pengujian.

Contoh: `cw.op.simmer` = cairan berbasis air pada 85–96 °C; `cw.op.deep_fry` = minyak pada 160–190 °C.
- **Target di dalam envelope.** Target resep (`params.tempC` atau `target` pada sensor medium) HARUS berada di dalam envelope. Validator menolak resep yang melanggar hal ini.
- **Executor menjaga medium tetap di dalam envelope.** Jika resep memberikan target yang lebih sempit, mereka menjaganya tetap di dalam target tersebut juga, setelah target tersebut pertama kali tercapai.
- **Ketinggian.** Pita air dan uap bergeser sebesar −1 °C per 300 m ketinggian dapur.
- **Tingkat panas** (`very_low` … `max`) memiliki satu makna bersama: pita permukaan panci dalam °C, yang ditentukan dalam `vocab/units.json`.
- **Sensor ladder.** Setiap envelope mencantumkan cara untuk memverifikasi langkah tersebut, dengan urutan terbaik: sensor spesifik, kemudian `model` (estimasi yang dicatat), kemudian `time`, kemudian `human`.
  - Executor menggunakan anak tangga pertama yang dapat dipenuhinya dan mencatatnya dalam `verifiedBy`.
  - Jika ia tidak dapat memenuhi **satupun** anak tangga, ia HARUS menolak langkah tersebut (`missing_sensor_no_fallback`).
  - Operasi yang membutuhkan perhatian konstan dan mungkin tidak dapat dijalankan tanpa pengawasan (menumis, menyegel, menggoreng, menyusutkan, mengkaramelisasi…) tidak pernah beralih ke `time` saja: anak tangga terakhir mereka adalah orang yang mengawasi.
  - Deep frying tidak memiliki fallback: tidak adanya sensor suhu minyak berarti tidak ada deep frying.
  - Sebuah `Condition` dapat mempersempit hal ini dengan `onSensorMissing`.
- **Penolakan, bukan menebak.** Seorang executor yang tidak dapat memenuhi envelope, ladder, peralatan, atau batasan keselamatan suatu langkah HARUS menjawab `refused` dengan alasan sebelum memulai.

## 4. Angka dan unit

- **Suhu adalah °C pada kabel.** Tampilan mungkin melakukan konversi.
- **Toleransi.**
  - `tolerance` bersifat relatif dan hanya diizinkan pada unit skala-rasio.
  - `toleranceAbs` bersifat absolut dalam unit nilai tersebut, dan merupakan satu-satunya toleransi yang diizinkan pada °C.
  - `Target.tolerance` bersifat absolut.
- **Unit dapur memiliki nilai metrik yang tepat:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ massa memerlukan densitas** (`Quantity.densityGPerMl`, atau kosakata bahan);
  tanpa itu merupakan sebuah kesalahan, bukan sebuah tebakan.
- **Uang adalah string desimal** (`"12.70"`) dengan mata uang ISO 4217, bukan float.

## 5. Integritas dan kepercayaan

- **Hash.** `sha256:` ditambah hex digest dari RFC 8785 canonical JSON dari dokumen tersebut,
  tanpa bidang `hash` dan `signature`. Reference canonicalizer mereproduksi contoh RFC
  8785 secara persis.
- **Signature.** Ed25519 (`EdDSA`) di atas string hash ASCII. `ES256` diperbolehkan untuk kunci
  perangkat keras P-256. `kid` menamai sebuah `KeyRecord`.
- **Keys.** Sebuah `KeyRecord` memberikan kunci publik, pemiliknya, jendela validitas dan `revokedAt`.
  Sebuah tanda tangan yang `signedAt`-nya jatuh setelah pencabutan, atau di luar jendela validitas, adalah
  tidak valid.
  - Katalog memublikasikan kunci mereka di `/.well-known/cookwala.json`.
  - Organisasi dan orang memublikasikan milik mereka di dokumen did:web.
  - Perangkat memublikasikan milik mereka di dokumen kapabilitas mereka.
  - Verifier menyimpan cache catatan kunci untuk penggunaan luring.
- **Selective disclosure.** Sebuah dokumen bertanda tangan dapat berisi digest `Disclosure`,
  `sha256(JCS([salt, value]))`, alih-alih nilai yang sensitif. Pemegang mengungkapkan salt dan
  value hanya kepada pihak yang diizinkan untuk melihatnya, dan tanda tangan tetap terverifikasi.
- **Event logs** (Profil misi):
  - Satu sequencer per log menetapkan `seq` dan `prev`, sehingga rantai tidak pernah bercabang.
  - Checkpoint ditandatangani oleh sequencer dan ditandatangani bersama oleh saksi, yang dapat mencakup
    layanan transparansi seperti IETF SCITT. Penulisan ulang setelah checkpoint yang disaksikan dapat
    terdeteksi.
  - Dalam mode `hash_only`, payload berada di penyimpanan yang dapat dihapus dan log hanya menyimpan hash mereka.

## 6. Aturan keselamatan dan agen (normatif)

1. **Keamanan bersifat lokal.** Executor menerapkan paket `SafetyLimits` pada perangkat.
   - Tidak ada resep, agen, pesan jarak jauh, ekstensi, atau mode operasi yang dapat menaikkan atau menonaktifkan batas.
   - Batas yang lebih ketat selalu menang.
   - `profiles/core/safety-limits.default.json` adalah titik awal draf yang diperketat oleh pembuat perangkat dari kasus keamanan mereka sendiri.
2. **Penghentian lokal.** Kontrol penghentian pada perangkat menghentikan gerakan dalam 0.5 s dan memutus panas dalam 1 s, dengan atau tanpa jaringan. `POST …/stop` tidak pernah ditolak karena otorisasi setelah pemanggil dapat menjangkau executor.
3. **Laporan peristiwa; mereka tidak pernah melindungi.** Peristiwa `cookwalalatency: local_safety` melaporkan apa yang telah dilakukan perangkat. Tidak ada fungsi keamanan yang boleh bergantung pada kedatangan suatu peristiwa.
4. **Teks yang tidak dipercaya.** Setiap bidang teks bebas (ditandai `x-cookwala-untrusted`) adalah data dan bukan instruksi, baik untuk perangkat lunak maupun agen AI. Upaya untuk memberi instruksi melalui teks akan diabaikan dan dicatat (`cw.incident.untrusted_instruction`).
5. **Agen bertindak di bawah sebuah mandate.** Permintaan yang dikirim oleh agen membawa `AgentMandate` yang ditandatangani oleh prinsipal: cakupan, batas pengeluaran, penyedia yang diizinkan, kedaluwarsa, dan tindakan yang memerlukan konfirmasi.
   - `irreversible` dan `safety_override` selalu memerlukan konfirmasi, apa pun yang dinyatakan dalam mandate.
   - Executor menolak permintaan di luar mandate (`mandate_scope`).
6. **Operasi tanpa pengawasan membutuhkan seseorang.** Operasi yang envelope-nya menyatakan `unattended: false` membutuhkan orang yang bertanggung jawab hadir, atau dapat dihubungi dalam waktu satu menit.
7. **Pemblokiran alergen menolak.** Setiap alergen yang diblokir dalam resep atau inventaris menolak permintaan; tidak ada substitusi untuk menghindari pemblokiran.
8. **Recall.** Katalog menerbitkan recall yang ditandatangani di `GET /v1/recalls`. Executor melakukan polling saat online dan menolak revisi yang di-recall. `block_and_stop_running` juga menghentikan eksekusi yang sedang berjalan dengan aman.
9. **Laporan insiden** bersifat anonim (`IncidentReport`: hanya tanggal, tanpa nama atau id) dan dikirimkan ke katalog sehingga setiap pembuat dapat belajar dari setiap kejadian yang hampir terjadi.

## 7. Siklus hidup eksekusi dan API

- **API:** `api/core.openapi.yaml`. Endpoint-nya adalah:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - sisi katalog: `GET /v1/recalls`, `POST /v1/incidents`.
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` dan `stopping` → `stopped` di sepanjang jalan;
  - `refused` dan `failed` adalah final.
  - Tabel transisi lengkap ada di `core.schema.json#/$defs/ExecutionState` dan vektor
    conformance.
- **Request rules:**
  - Setiap POST membawa `Idempotency-Key`.
  - Perubahan pada eksekusi yang ada membawa `If-Match: <seq>`; ketidakcocokan mengembalikan 412.
  - Stop tidak memerlukan If-Match.
- **Events:**
  - Pengiriman adalah setidaknya satu kali.
  - `id` CloudEvents adalah kunci deduplikasi.
  - `cookwalaseq` mengurutkan event per subjek dan mencocokkan status `seq`.
  - Perangkat memancarkan `cookwala.device.heartbeat`, sehingga hub dapat mendeteksi perangkat yang hilang dan melakukan serah terima.

## 8. Privasi

- **Execution logs tidak membawa data pribadi** (`privacy.personalData: "none"`).
- **Data tersebut meninggalkan perangkat hanya dengan persetujuan opt-in** (`consent.dataset`: `none` secara default,
  `research_only`, atau `open`). Persetujuan dapat ditarik kembali.
- **Dataset terbuka memperkasar waktu menjadi harian.**
- **Data rumah tangga, kesehatan, dan agama tetap di rumah** kecuali orang tersebut memilih lain.
  Ketika harus dikirim, data tersebut dikirim sebagai pengungkapan selektif.
- **The Humanitarian Profile** tidak membawa data pribadi sama sekali.

## 9. Versioning dan ekstensi

- **Versi inti adalah `0.2.x`.**
  - Pembaca menerima patch apa pun dari versi minor mereka.
  - Mereka menolak minor lain dengan `unsupported_version`.
  - Mereka mengabaikan field `x-` yang tidak dikenal.
- **Operasi, unit, sensor, dan tipe insiden baru** ditambahkan ke kosakata tanpa perubahan versi.
- **Mengubah makna suatu operasi adalah id baru;** yang lama ditandai `deprecated` dengan `replacedBy`.
- **Profil** memiliki versi secara independen dan mendeklarasikan versi Core yang mereka butuhkan.

## 10. Profil dan statusnya

| Profil | Status | Catatan |
|---|---|---|
| Core (dokumen ini) | **draft, normative** | Target untuk implementasi perangkat pertama |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Tanpa data pribadi; bekerja melalui SMS dan CSV; surplus ke piring, ringkasan dampak, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Fakta rumah tangga lokal-first; hanya derived constraints yang dikirim (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Namespaces terbukti, versi eksak, tombstones; organisasi berdasarkan permintaan (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Laporan bertanda tangan di balik setiap klaim conformance (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds dan relays; verifikasi terhadap penerbit (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restoran, komunitas, sekolah, bencana, dan dapur robot (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Sinyal permintaan dan pasokan agregat, tertunda, tingkat kelas; dibatasi pada tinjauan hukum persaingan (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + proyeksi, transisi dalam `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Membutuhkan tinjauan hukum persaingan sebelum penggunaan produksi |
| Relief planning (`relief.schema.json`) | experimental | Alur operasional dipindahkan ke Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API adalah permukaan referensi |

Sebuah profil menjadi stabil ketika dua implementasi independen lulus vektor conformance-nya
dan memiliki pengguna riil.

## 11. Tools

| Tool | Apa yang dilakukannya |
|---|---|
| `tools/validate_specs.py` | Memeriksa skema, contoh, semantik resep (envelopes, parameter op, tidak ada placeholder template), ketatnya aturan, dan memastikan referensi API terselesaikan |
| `tools/run_conformance.py` | Menjalankan `conformance/*.json` dan `conformance/profiles/*.json`, dan menulis ConformanceReport dengan `--report`: hashing (termasuk contoh RFC 8785), tanda tangan (termasuk kunci RFC 8032), pencabutan, pengungkapan, rantai peristiwa dan titik pemeriksaan, unit, envelopes, sensor ladders, mesin status |
| `tools/cookwala_ref.py` | Library referensi dan CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Menghasilkan ulang vektor (tinjau diff) |
| `tools/bundle_schemas.py` | Bundle skema offline |
| `tools/humanitarian_check.py` | Pemeriksa rule-pack Humanitarian Profile dan ringkasan dampak |
| `tools/make_profile_vectors.py` | Menghasilkan ulang vektor profil di `conformance/profiles/` |

## 12. Perubahan dari 0.1

| Area | 0.1 | 0.2 |
|---|---|---|
| Schemas | Bidang tidak dikenal diterima | Ketat, dengan ekstensi `x-` |
| Temperatures | °C atau °F, toleransi relatif diizinkan | Hanya °C; toleransi absolut |
| Money | Angka | String desimal |
| Operations | Definisi prosa | Physical envelopes, sensor ladders, tingkat panas, vektor pengujian |
| Signatures | EdDSA tetap, kunci tanpa siklus hidup | EdDSA atau ES256, KeyRecords dengan validitas dan pencabutan |
| Missions | Satu dokumen yang dapat diubah, ledger di dalamnya | Event log + proyeksi, sequencer tunggal, checkpoint bersaksi, mode hash-only |
| Agents | Mandate hanya di dalam Missions | `AgentMandate` di common; diperlukan untuk permintaan agen |
| Safety | Dinyatakan dalam resep | Juga ditegakkan secara lokal melalui SafetyLimits; recalls; laporan insiden |
| Data | Tidak ada model dataset | ExecutionLog yang disetujui dan bebas data pribadi |
| Conformance | Validasi skema saja | 106 vektor (44 Core, 62 profil) ditambah implementasi referensi |

Untuk memigrasikan dokumen 0.1: konversi °F ke °C; ganti toleransi relatif pada suhu dengan `toleranceAbs`; ubah jumlah uang menjadi string desimal; hapus atau ganti nama field yang tidak dikenal menjadi field `x-`.

