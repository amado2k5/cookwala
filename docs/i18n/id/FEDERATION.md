<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->
# Federasi: bagaimana Cookwala bekerja tanpa pusat

**Status:** draft, 2026-10-04 (RFC-0006). Foto pendirinya adalah sebuah sarang lebah: tidak ada komando pusat, namun ada harmoni dan pemulihan. Halaman ini menjelaskan apa artinya hal tersebut dalam praktiknya.

## 1. Nodes

| Node | Apa yang dilayaninya | Siapa yang menjalankannya |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, resep, kosakata, rule packs, kunci, feeds | penerbit resep, jaringan food bank, universitas, pembuat perangkat, cookwala.ai |
| **Registry** | `/v1/registry.json`: penunjuk ke katalog, koleksi, perangkat, packs, benchmark | siapa pun; cookwala.ai menjalankan satu |
| **Hub** | Core API untuk dapur, batas keamanan lokal, household context | setiap dapur; bekerja secara offline |
| **Mirror** | menerbitkan ulang item bertanda dari node lain tanpa perubahan | siapa pun yang menginginkan ketahanan di wilayah mereka |

Folder statis adalah katalog yang valid. Sebuah ponsel dengan templat CSV adalah partisipan kemanusiaan yang valid pada level H0.

## 2. Feed, bukan perintah

Node menerbitkan feed bertanda tangan: recalls, insiden anonim, perubahan registry, catatan kunci.
Node lain melakukan polling terhadap apa yang mereka percayai dan dapat menerbitkannya kembali. Tidak ada yang didorong ke dalam sebuah dapur; sebuah dapur menarik data saat sedang online dan terus bekerja saat sedang tidak online.

## 3. Verifikasi terhadap penerbit, jangan pernah terhadap relay

Sebuah recall yang tiba melalui sebuah mirror hanya sebagus tanda tangan **issuer**. Sebuah hub
menyelesaikan `KeyRecord` milik issuer dari dokumen penemuan milik issuer sendiri atau did:web dan
memverifikasi body byte demi byte. Key milik mirror tidak membuktikan apa pun tentang konten; sebuah mirror
yang mengedit sebuah recall akan merusak tanda tangan tersebut. Vektor profil dalam `conformance/profiles/federation.json`
menunjukkan ketiga kasus tersebut.

## 4. Daftar kepercayaan

Setiap hub menyimpan daftar katalog dan registry yang dipercayainya, dengan kunci dan prioritas masing-masing. Sebuah node dapat menyarankan rekan (`federation.peers`); hub yang memutuskan. cookwala.ai adalah satu entri pada daftar tersebut, bukan sebuah root.

## 5. Kesegaran

Entri registry membawa status dan waktu publikasi; recall membawa waktu penerbitan; facet household membawa validitas. Item yang usang diambil ulang atau dibuang. Tidak ada yang dipercaya karena sudah lama, tidak ada yang dihapus secara diam-diam: entri yang ditarik tetap ada sebagai tombstones.

## 6. Riwayat

Log peristiwa dengan checkpoint yang disaksikan (Bagian inti 5) membuat penulisan ulang dapat terdeteksi tanpa
blockchain: pihak kedua menandatangani bagian kepala log, dan penulisan ulang yang later tidak lagi
cocok. Penjangkaran publik dari kepala checkpoint bersifat opsional dan merupakan keputusan pendiri
(`docs/research/BACKSTORY.md` section 4.7).

## 7. Tiga node yang saling beroperasi

- **Sebuah jaringan food bank** menjalankan sebuah registry dari dapur dan donornya, sebuah katalog dari rule pack miliknya yang disesuaikan dengan hukum nasional, dan sebuah SMS gateway. Ia mencantumkan dirinya sendiri di dalam cookwala.ai directory atau tidak; datanya tidak pernah harus meninggalkan negaranya.
- **Seorang pembuat perangkat** menjalankan sebuah katalog dari dokumen kapabilitas dan safety-limit pack miliknya, menerbitkan laporan conformance, dan memantau feed recall dari katalog yang digunakan pelanggannya.
- **Sebuah laboratorium universitas** menjalankan sebuah katalog dari resep benchmark dan execution log (dengan persetujuan), mencerminkan kosakata, dan menerbitkan vektornya sendiri.

Tidak ada satu pun dari mereka yang membutuhkan cookwala.ai untuk tetap online.

## 8. Apa yang tidak dibangun

Seorang orkestrator pusat, penyedia identitas pusat, sebuah token, sebuah blockchain. Keputusan kuorum dan orkestrator profil Misi tetap bersifat opsional dan eksperimental.

