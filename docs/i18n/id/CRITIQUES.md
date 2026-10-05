<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->

# Kritik yang kami publikasikan

Kami mengajukan pertanyaan sulit tentang Cookwala dan menuliskan jawabannya. Setiap kekhawatiran memiliki id
di dalam [action plan's concern register](ACTION-PLAN.md#2-concern-register), beserta
tanggapan kami dan statusnya. Tinjauan dari luar disambut baik dan akan dicantumkan di sini.

## Apakah ini akan berhasil? (strategy)

| Kekhawatiran | Jawaban singkat | Status |
|---|---|---|
| Pasar belum ada; spesifikasi mendahului produk | Small Core, demo terlebih dahulu, tidak ada spesifikasi baru tanpa pengguna | Core 0.2 selesai; demo perangkat next |
| Tidak ada pihak berpengaruh yang memiliki alasan untuk mengadopsi | Pimpin dengan keuntungan setiap pengadopsi; berguna tanpa robot | Pilot food-bank dan mitra perangkat sedang dicari |
| Simulator membuktikan apa yang mereka assume | Baseline yang adil, rentang, label "illustrative"; pilot menggantikan mereka | Open |
| Kelaparan adalah tentang kemiskinan dan konflik, bukan surplus | Cookwala berkontribusi; ia tidak mengklaim dapat mengakhiri kelaparan sendirian | Pesan diubah |
| Keamanan, kewajiban, dan attack surface | Batasan ditegakkan pada perangkat; refusal; recall; laporan insiden | Spesifikasi selesai; tinjauan certifier open |
| Privasi (data kesehatan dan agama, ledger vs penghapusan) | Local-first, pengungkapan selektif, log hash-only, persetujuan | Spesifikasi selesai; penilaian dampak open |
| Terlalu kompleks | Core 0.2; sisanya ditandai sebagai eksperimental | Done |
| Ketergantungan pada pendiri | Jalur tata kelola menuju rumah yang netral | GOVERNANCE.md |

## Apakah desain teknisnya kuat?

| Kekhawatiran | Apa yang berubah di Core 0.2 |
|---|---|
| Operasi tidak memiliki makna fisik | Envelopes, tingkat panas, sensor ladders, aturan ketinggian, vektor pengujian |
| Bug unit dan angka | Hanya °C, toleransi absolut, unit dapur, densitas, uang desimal |
| Skema menerima salah ketik | Skema ketat dengan ekstensi `x-`; bundel luring |
| Satu dokumen Mission yang dapat diubah | Log peristiwa + proyeksi, sequencer tunggal, tabel transisi |
| Buku besar memberikan sedikit bukti | Catatan kunci dengan pencabutan, checkpoint yang disaksikan, deteksi penulisan ulang |
| Pengiriman peristiwa tidak terdefinisi; keamanan pada bus | Nomor urut, kelas latensi, heartbeat, "keamanan bersifat lokal" |
| Permukaan API bergeser | Core OpenAPI; setiap referensi diperiksa di CI |
| Tidak ada verifikator | Perpustakaan referensi dan 106 vektor conformance |

## Ulasan yang kami minta

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), ilmuwan pangan
(envelopes), petugas keamanan pangan dan ahli diet (rule packs), audit keamanan,
tinjauan perlindungan data, dan analisis kesenjangan sertifikasi. Lihat
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

