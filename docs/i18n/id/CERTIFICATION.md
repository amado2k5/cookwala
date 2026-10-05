<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance dan jalur menuju certification

**Status:** draft, 2026-10-04 (RFC-0008). Belum ada certifier yang dilibatkan; ini adalah jalur
yang ditawarkan standar tersebut.

## 1. Tiga langkah

| Langkah | Siapa | Apa artinya | Ditampilkan sebagai |
|---|---|---|---|
| **Self-declared** | Pembuat atau penerbit | Menjalankan vektor publik dengan alat publik dan menerbitkan `ConformanceReport` (`schemas/conformance.schema.json`), ditandatangani dengan kuncinya sendiri | laporan, dengan suite dan jumlahnya; tidak pernah berupa lencana |
| **Verified** | Operator registry | Mereproduksi jalannya terhadap hash set vektor yang sama dan menandatangani laporan tersebut | laporan ditambah verifier |
| **Certified** | Certifier independen (belum ada saat ini) | Menjalankan suite ditambah pemeriksaan perangkat keras dan safety-case di bawah skema yang diterbitkan dan memberikan tanda | laporan, certifier, tanda |

Sebuah laporan yang gagal pada vektor kelas apa pun tidak boleh mengklaim kelas tersebut. registry menunjukkan laporan, bukan lencana.

Hari ini satu-satunya operator registry adalah pemelihara spesifikasi (cookwala.ai), sehingga "verified" tidak menambah independensi sampai registry kedua ada; statusnya masih ditampilkan sebagai self-verification.

## 2. Apa yang terkandung dalam sebuah laporan

Versi inti, kelas yang diklaim (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) atau klaim profil (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), subjek (produk, vendor, versi), suite yang dijalankan dengan total dan id
vektor yang gagal, hash dari set vektor, alat dan commit, tanggal, status dan
verifier. Contoh: `examples/conformance/report-reference.json`, yang dihasilkan oleh

```bash
python tools/run_conformance.py --report report.json
```

## 3. Kelas dan apa yang mereka buktikan

| Kelas | Vektor | Juga diperlukan untuk certification (tidak dicakup oleh vektor) |
|---|---|---|
| Penerbit resep | hash, envelope (target di dalam pita), units | tinjauan konten resep oleh profesional keamanan pangan |
| Executor | envelope, sensor ladder, transisi eksekusi, alasan refusal | safety case perangkat itu sendiri (ISO 13482, IEC 60335, UL 3300 jika berlaku); latensi penghentian lokal yang measured; batas keamanan yang ditegakkan tanpa jaringan |
| Katalog | hash, tanda tangan, pencabutan kunci, recalls | proses penyimpanan kunci dan penerimaan insiden |
| Agent | teks yang tidak tepercaya, cakupan mandate (tolok ukur agent-safety) | hasil yang dipublikasikan per model dengan metode |
| Verifier | semua suite Core | tidak ada |
| Humanitarian H0–H3 | tata bahasa SMS, mesin status, rule packs | tinjauan tanggung jawab data; tidak ada audit data pribadi |
| Household | kebijakan pengungkapan | penilaian dampak perlindungan data |
| Registry | aturan nama dan versi, tombstones | proses pembuktian namespace |

## 4. Apa yang tidak dapat dijanjikan oleh certification

Sebuah laporan conformance membuktikan bahwa perangkat lunak berperilaku sebagaimana yang diminta oleh vektor pada hari ia dijalankan.
Ini tidak membuktikan bahwa sebuah perangkat aman di setiap dapur, bahwa sebuah resep terasa pas, atau bahwa
tidak ada bahaya yang dapat terjadi. Sebuah standar yang menjanjikan nol bahaya akan menjadi tidak jujur; standar ini menjanjikan
bahwa batasan ditegakkan secara lokal, bahwa refusal before heat terjadi, dan bahwa catatan dapat
diperiksa.

## 5. Tata kelola tanda tersebut

Tanda certification dan aturan-aturannya pindah ke fondasi netral bersama dengan merek dagang (`GOVERNANCE.md`). Sampai saat itu tidak ada tanda yang ada; hanya laporan saja.

