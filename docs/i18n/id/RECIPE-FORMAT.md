<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->
# Format Resep Cookwala: resep yang bekerja dengan Missions

Sebuah resep di Cookwala bukanlah daftar instruksi. Itu adalah **pengetahuan memasak portabel**
yang seorang perencana *menyusun* terhadap Misi tertentu (rumah tangga, robot, peralatan,
energi, anggaran, kesehatan, waktu) menjadi sebuah rencana yang dapat dieksekusi. Robot kemudian menjalankan rencana tersebut,
beradaptasi melalui kontingensi dan buku panduan ketika realitas berubah.

Skema: [`recipe.schema.json`](../schemas/recipe.schema.json). Contoh pengerjaan lengkap:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Empat lapisan (diadaptasi dari pendekatan WHO SMART Guidelines)

| Layer | Apa yang dikandungnya | Siapa yang menulisnya | Di mana ia berada |
|---|---|---|---|
| **R1 Narrative** | Teks resep manusia, cerita, catatan budaya, foto | Juru masak, koki, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | Apa *identitas* dan *keharusan* hidangan tersebut: identitas (esensial vs fleksibel), target sensorik, nutrisi, gaya penyajian dan makan, penyimpanan, pemeriksaan penerimaan | Editor resep, dibantu AI, ditinjau | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Metode agnostik-perangkat: formula (rasio + peran), grafik proses dari ops bertipe dengan kondisi pre/post status-makanan, kondisi `until`, alternatif, aturan jeda, mode kegagalan, affordances, bahaya, CCPs, persiapan lingkungan | Jalur ekspor + tinjauan; diverifikasi simulator (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | Resep R3 yang dikompilasi untuk Misi *ini*: kuantitas tepat, varian terpilih, aktor dan perangkat yang ditugaskan, jadwal, sewa, monitor, kontingensi | Planner/compiler, pada saat run time | Di dalam **Mission** (`plan`), tidak pernah di dalam katalog |

Seperti kode sumber dan kompiler: **resep adalah representasi perantara yang portabel
(R3 + R2). Mission adalah mesin target.** Itulah yang menjaga resep tetap valid saat robot
dan AI berubah: perencana yang lebih baik menghasilkan R4 yang lebih baik dari resep yang sama.

## 2. Apa yang dilakukan setiap bagian dalam sebuah Mission

| Bagian resep | Digunakan oleh Mission untuk… |
|---|---|
| `identity.essential / flexible / neverAdd` | Substitusi, mode anggaran dan ransum, adaptasi diet: ubah bagian yang `flexible`, jangan pernah bagian `essential`, agar hidangan tetap menjadi dirinya sendiri |
| `formula` (ratios, min/max, role, scaling) | Skala tepat ke jumlah orang berapa pun, pembagian bahan secara ransum selama seminggu, penghematan anggaran, menghabiskan apa yang ada (rescale bahan pembatas) |
| `sensory` | Titik pemeriksaan penglihatan, aroma, dan rasa; profil rasa `household context` (garam 2 vs 4); keputusan untuk menggunakan kembali dan memperbaiki |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Tugas persiapan lingkungan:** jika bak cuci piring atau kompor sedang digunakan, perencana menambahkan tugas "bersihkan, cuci, keringkan"; tugas merendam atau mencairkan dijadwalkan beberapa jam sebelumnya |
| `process.nodes[]` dengan status makanan `pre`/`post` | Perencanaan (hanya mulai apa yang sudah siap), verifikasi (apakah langkah tersebut menghasilkan status tersebut?), lanjutkan setelah interupsi |
| `until`, `onTimeout`, `retry` | Mengetahui kapan sebuah langkah selesai dan apa yang harus dilakukan jika belum selesai |
| `alternatives[]` + `energy` | Gas vs induksi vs oven, penghemat baterai, dapur tanpa oven, jam tenang |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Interupsi:** seorang anak butuh bantuan, pemilik memanggil, anjing menjatuhkan sesuatu. Robot memasukkan langkah ke dalam `safeState`-nya, menangani kejadian tersebut, lalu melanjutkan, memanaskan kembali, menyelamatkan atau membuang berdasarkan anggaran `pause` |
| `failureModes` (incident, detect, prevent, playbook) | Deteksi dini masalah yang diketahui dan `playbook` tepat untuk pemulihan |
| `affordances`, `space` | Mencocokkan langkah dengan robot yang dapat menggenggam, mengangkat, dan menjangkau; menjaga zona panas jauh dari anak-anak |
| `safety` (hazards, CCPs, supervision, abort) | Kernel keselamatan: invarian yang harus dijaga oleh setiap rencana |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Penyajian: apa yang diletakkan di meja, ke ruangan, ke dalam kotak makan siang; pengingat dan batas penahanan; gaya makan budaya |
| `storage` | Sisa makanan, `cook-ahead` dan Mission kotak makan siang |
| `acceptance` | *Tes* resep: Mission selesai ketika hal-hal ini terpenuhi |
| `nutrition`, `cost` | Porsi pribadi, anggaran, ransum bantuan |

## 3. Contoh: satu langkah dengan semuanya terlampir

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

## 4. Menyusun resep untuk sebuah Mission (apa yang dilakukan planner)

1. **Pilih varian:** diet, tekstur (IDDSI), peralatan, energi dan pilihan mode dari
   `alternatives`. Esensi identitas harus tetap ada.
2. **Skala:** dari `formula` dan porsi penyajian, porsi per orang (HEALTH.md),
   bahan pembatas, atau cakrawala ransum. Rempah-rempah secara sub-linear, waktu berdasarkan eksponen massa.
3. **Substitusi** dalam peran, menghormati `identity.neverAdd`, alergen, paket diet
   dan inventaris.
4. **Siapkan lingkungan:** bandingkan `prep` dengan facet ruang Misi (wastafel penuh?
   kompor terpakai? talenan kotor?) dan tambahkan tugas merapikan, mencuci, mengeringkan dan menata. Jadwalkan
   `advanceTasks` (rendam, cairkan, marinasi, panaskan).
5. **Ikat:** tugaskan setiap node ke robot, peralatan atau manusia berdasarkan affordance dan
   kemampuan. Sewa tungku, wadah dan zona. Pasang monitor (panci pintar, ETA
   pengiriman, detektor asap).
6. **Jadwalkan** mundur dari waktu penyajian, menghormati anggaran jeda, batas baterai dan energi,
   jam tenang rumah tangga dan jendela berbagi dapur.
7. **Lampirkan kontingensi:** `failureModes` dan aturan `pause` setiap node, ditambah
   kebijakan global Misi (gangguan, anak atau hewan peliharaan di dekat kompor, pengawas kompor,
   pengawas pembusukan).
8. **Verifikasi:** pemeriksaan skema + semantik, paket kebijakan, cakupan CCP, simulator dry-run,
   invarian tumpukan prioritas (PROTOCOL §7.2).
9. **Emisi R4** ke dalam `plan` Misi, tandatangani, dan serahkan ke robot.

## 5. Penulisan dan konversi

- **Dari fifi.cooking:** pipeline EXPORT-FIFI menghasilkan R1 + R2 + R3. Bagian-bagian baru
  (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  dihasilkan oleh model lokal dari teks yang ada dan diperiksa oleh validator serta
  sampel tinjauan manusia.
- **Dari web:** `cookwala convert --from schema-org` → R1/R2 (V0), kemudian pengayaan
  yang sama.
- **Ke format lain:** schema.org Recipe (R1/R2 untuk mesin pencari), Cooklang (penyuntingan
  manusia), PDDL atau temporal logic (perencana penelitian) semuanya dapat dihasilkan dari R3.
- **Secara manual:** `cookwala init recipe` menyusun semua lapisan; `cookwala validate` dan
  `cookwala simulate` memeriksanya.
- **Versi:** revisi bersifat immutable dan di-hash. Fork mencatat `meta.derivedFrom`.
  **patches** resep (dari playbook atau umpan balik) diusulkan sebagai diff dan dipromosikan hanya
  setelah tinjauan dan bukti.

## 6. Bahasa dari teks langkah

Kalimat langkah-langkah ditulis untuk manusia terlebih dahulu dan diurai oleh mesin kedua. Teks langkah bahasa Arab dalam contoh resep menggunakan imperatif feminin (قطّعي، سخّني), yang merupakan konvensi buku masak Mesir yang umum; ini adalah pilihan yang disengaja, bukan kelalaian, dan penerbit dapat menggunakan pasif netral gender (تُقطَّع البصلة) sebagai gantinya. Bidang `op`, `params` dan `until` membawa maknanya; kalimat tersebut adalah untuk juru masak.

## 7. Mengapa ini tetap tahan masa depan

- Resep mendeskripsikan **food outcomes and constraints, bukan motions**. Robot baru dan AI baru menghasilkan rencana R4 yang lebih baik dari R3 yang sama.
- Semua bagian baru bersifat **optional and additive**. Resep V0 (hanya R1) tetap berfungsi untuk memasak manusia yang dipandu; setiap lapisan yang ditambahkan membuka lebih banyak otomatisasi.
- Bidang `x-` yang tidak dikenal diteruskan. Vendor, koki, dan badan kesehatan dapat memperluas resep tanpa merusak apa pun.
- **Acceptance checks** memungkinkan eksekutor mana pun, manusia atau robot, membuktikan hidangan keluar dengan benar, yang merupakan cara resep naik ke V3 dengan bukti lapangan.

