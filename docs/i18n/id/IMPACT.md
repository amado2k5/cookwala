<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->

# Dampak: apa yang dapat diubah Cookwala, dengan sumber dan label

**Status:** 2026-10-04. Setiap angka di bawah ini diberi label **measured** (dihitung atau dilaporkan oleh
sumber yang disebutkan), **modelled** (dihasilkan oleh simulator kami berdasarkan asumsi yang dinyatakan) atau
**assumed** (angka perencanaan). Tidak ada satu pun di sini yang merupakan hasil dari Cookwala di lapangan: belum ada pilot
yang dijalankan. Halaman ini menyatakan besarnya masalah dan mekanisme yang melaluinya Cookwala
berkontribusi.

## 1. Kelaparan

| Fakta | Angka | Label dan sumber |
|---|---|---|
| Orang yang menghadapi kelaparan pada 2023 | sekitar 733 juta | measured oleh sumber: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| Orang yang mengalami ketahanan pangan moderat atau parah pada 2023 | sekitar 2,3 miliar | measured oleh sumber: SOFI 2024 |
| Pangan yang hilang antara panen dan ritel | sekitar 14 % dari pangan yang diproduksi | measured oleh sumber: FAO, *The State of Food and Agriculture 2019* (UNEP membulatkan angka yang sama menjadi 13 %) |
| Pangan yang terbuang di ritel, layanan makanan, dan rumah tangga pada 2022 | sekitar 1,05 miliar ton; sekitar 132 kg per orang; sekitar 79 kg per orang di rumah tangga | measured oleh sumber: UNEP, *Food Waste Index Report 2024* |

**Mekanisme Cookwala:** penawaran surplus yang mencapai dapur sebelum makanan rusak, dengan
pemeriksaan rantai-dingin pada setiap serah terima (Humanitarian Profile); dampak dihitung dengan cara yang sama di
setiap lokasi sehingga program dapat membandingkan dan meningkatkan; later, sinyal permintaan dan penawaran yang diagregasi
sehingga lebih sedikit yang ditanam dan dipindahkan untuk dibuang (experimental, gated on competition-law
review). **Apa yang tidak dilakukannya:** menangani kemiskinan, konflik, guncangan iklim, harga, atau
kebijakan, yang mendorong sebagian besar kelaparan.

**Modelled, ilustratif, bukan prakiraan:** peluncuran campuran simulator negara menyelamatkan
makanan setara dengan sekitar 4.7 % dari apa yang dibutuhkan populasi fiktif yang tidak memiliki ketahanan pangan; skenario "protokol, tanpa robot" simulator dunia menjangkau sekitar 40 juta dari kira-kira 770 juta (baseline assumed simulator, pembulatan dari 733 juta measured di atas)
orang lapar hanya melalui rescue. Keduanya mengatakan hal yang sama: rescue itu penting dan tidak
cukup.

## 2. Kesehatan

| Fakta | Angka | Label dan sumber |
|---|---|---|
| Penyakit akibat makanan tidak aman setiap tahun | sekitar 600 juta; sekitar 420.000 kematian | measured oleh sumber: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Asupan garam versus pedoman | kebanyakan orang makan 9 hingga 12 g garam sehari; WHO merekomendasikan di bawah 5 g (2 g natrium) | measured oleh sumber: WHO fact sheet on salt reduction |
| Kematian yang disebabkan oleh natrium tinggi setiap tahun | sekitar 1,9 juta | measured oleh sumber: WHO, *Global report on sodium intake reduction* (2023) |
| Orang yang bergantung pada bahan bakar memasak yang mencemari | sekitar 2,1 miliar; sekitar 3,2 juta kematian setahun akibat polusi udara rumah tangga | measured oleh sumber: WHO fact sheet on household air pollution (2024) |

**Mekanisme Cookwala:** titik kendali kritis dan batas penahanan panas, pendinginan dan pemanasan ulang yang ditegakkan pada perangkat dan dicatat; rule packs yang menandai natrium, gula bebas, lemak jenuh serta buah dan sayuran pada menu; aturan perawatan untuk anak-anak, kehamilan dan lansia; catatan tinjauan sehingga ahli diet dan petugas keamanan pangan dapat menjamin sebuah pack.
**Apa yang tidak dilakukannya:** mendiagnosis, mengobati atau menghitung diet terapeutik; lihat `docs/health/CLAIMS-POLICY.md`.

**Memasak bersih** ada dalam gambaran tetapi tidak dalam model: simulator belum menghitung memasak dengan kayu dan arang atau efek kesehatannya (terdaftar sebagai batasan; next).

## 3. Lingkungan

| Fakta | Angka | Label dan sumber |
|---|---|---|
| Pangsa emisi gas rumah kaca global dari kehilangan dan pemborosan pangan | sekitar 8 hingga 10 % | measured oleh sumber: UNEP, *Food Waste Index Report 2024* |

**Modelled, ilustratif:** dalam simulator dunia, "banyak robot dengan protokol" memangkas semua
makanan yang hilang atau terbuang sekitar 4.1 % dan emisi sekitar 5.2 % selama lima tahun dibandingkan dengan
dunia yang sama tanpa mereka; "banyak robot saja" memangkas limbah rumah tangga tetapi meningkatkan kehilangan sebelum
sampai ke rumah sekitar 3 % (efek bullwhip). Listrik robot (sekitar 164 TWh selama lima tahun dalam
skenario tersebut) dihitung. Ini adalah output model berdasarkan asumsinya, yang tercantum pada
setiap halaman simulator.

## 4. Ekonomi dan pekerjaan

**Assumed and modelled:** simulator kota memperkirakan sekitar 5 USD per orang per bulan
pengeluaran makanan yang lebih sedikit dan sekitar 10 jam per rumah per bulan lebih sedikit memasak dan berbelanja dengan robot
masak, perangkat keras tidak termasuk. Tidak ada angka untuk pekerjaan yang diberikan di mana pun; peran baru disebutkan
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) tanpa
angka.

## 5. Budaya

Tidak ada nomor. Klaim ini bersifat kualitatif dan dapat diperiksa: sebuah resep Cookwala membawa nama juru masak, identitas hidangan (apa yang esensial, apa yang fleksibel, apa yang tidak pernah ditambahkan), teks dalam bahasa juru masak, dan sebuah tanda tangan. Mesin yang memasaknya mewarisi resep tersebut sebagai pengetahuan kerja, dengan kredit.

## 6. Apa yang akan kami ukur ketika ada sesuatu untuk diukur

| Ukuran | Metode | Tempat didefinisikan |
|---|---|---|
| Kilogram yang diselamatkan, makanan yang disajikan, orang yang dijangkau, tingkat kelulusan nutrisi, biaya per makanan, waktu untuk klaim, tingkat klaim, temuan blok keamanan, insiden keamanan | dihitung dari dokumen Offer, Claim, Handover dan Distribution | Bagian Humanitarian Profile 10; `ImpactSummary` |
| Koki terverifikasi: eksekusi yang menjalankan resep bertanda tangan dari awal hingga akhir dengan log yang memenuhi conformance | execution logs dengan persetujuan | Bagian 11 `STRATEGY.md` |
| Implementasi independen yang lulus conformance | laporan conformance yang dipublikasikan | `docs/CERTIFICATION.md` |
| Hasil agent-safety per model | benchmark promptfoo, dengan model id, tanggal dan config hash | `evals/kitchen-agent-safety/` |

## 7. Apa yang belum kita ketahui

Apakah sebuah food bank menyelamatkan lebih banyak dengan profil tersebut daripada dengan metodenya saat ini (protokol pilot tersedia; belum ada pilot yang dijalankan). Apakah operation envelope sudah tepat untuk setiap masakan (seorang ilmuwan pangan belum meninjaunya). Apakah asumsi perilaku simulator tetap berlaku (asumsi tersebut terdaftar dan dapat disesuaikan). Seberapa besar efek rebound yang terjadi. Tidak ada satu pun di sini yang merupakan janji.

## 8. Apa yang salah

Tidak ada yang telah diterapkan, sehingga tidak ada yang salah di lapangan. Di dalam repositori: satu baris pertama ("world's first and largest robot cooking recipes index") melebih-lebihkan apa yang ada dan telah diubah; skema Mission pertama menerima field yang tidak dikenal dan dibuat ketat; simulator pertama menggunakan baseline strawman dan memperoleh baseline serta rentang kompeten-integration. Kritik yang mendorong perubahan ini telah dipublikasikan (`docs/CRITIQUES.md`).

## 9. Sumber

- FAO, IFAD, UNICEF, WFP dan WHO, *The State of Food Security and Nutrition in the World
  2024*, Roma, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Roma, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Jenewa, 2015.
- WHO, *Global report on sodium intake reduction*, Jenewa, 2023; lembar fakta WHO *Salt
  reduction*.
- lembar fakta WHO *Household air pollution*, 2024.

Angka-angka dikutip sebagaimana sumber menerbitkannya, dibulatkan; periksa kembali setiap angka terhadap edisi terbaru sebelum dikutip dalam cetakan. Organisasi-organisasi adalah sumber, bukan mitra.

