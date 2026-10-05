<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->

# Pemangku kepentingan: sebuah pesan, opsi, keberhasilan pertama dan alur untuk semua orang

**Status:** 2026-10-04. Untuk setiap grup: mengapa Cookwala penting bagi mereka, cara untuk terlibat dari
ringan hingga mendalam, keberhasilan pertama dalam waktu kurang dari 15 menit, jalur setelahnya, dan bagaimana keterlibatan
memajukan pekerjaan mereka dan dunia. Tidak ada satu pun di sini yang menyebutkan mitra, pengguna, atau pilot yang tidak
ada. Jika sesuatu direncanakan, maka akan tertulis next atau later.

Tiga tujuan di balik setiap baris: membantu mengakhiri kelaparan, membuat orang lebih sehat, menempatkan robot untuk bekerja bagi manusia.

---

## 1. Builders: pengembang, pembuat robot dan peralatan, insinyur embedded, pembangun AI-agent, pengembang smart-home dan platform, kontributor open-source

**Pesan.** Robot dan peralatan sedang belajar untuk bergerak. Belum ada yang menuliskan, dalam bentuk yang dapat diperiksa mesin, apa arti "simmer", kapan ayam aman, atau kapan sebuah langkah harus ditolak. Cookwala adalah lapisan tersebut: resep yang dapat direncanakan mesin, kondisi akhir yang dapat diukur, dan batasan keamanan yang ditegakkan pada dirinya sendiri. Ini bersifat terbuka, bebas royalti, netral-model dan netral-perangkat, serta dilengkapi dengan suite conformance yang dapat Anda jalankan hari ini.

**Opsi.**
- *Ringan:* jalankan browser dry run; baca Core 0.2 (satu malam).
- *Menengah:* `pip install -e sdk/python`, lakukan dry-run pada kemampuan perangkat Anda terhadap resep contoh, jalankan vektor conformance, mulai reference hub.
- *Mendalam:* implementasikan Core API pada perangkat atau hub, publikasikan laporan conformance, tambahkan perangkat Anda ke directory, usulkan RFC, tulis node bridge ROS 2, tambahkan kasus serangan ke agent-safety benchmark.

**Keberhasilan pertama (di bawah 15 menit).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Alur.** Dry run → implementasikan Core API terhadap reference hub → lulus conformance →
publikasikan laporan → daftarkan perangkat → consented execution logs menjadi dataset LeRobot dan
OpenTelemetry traces.

**Bagaimana hal ini memajukan pekerjaan mereka.** Definisi tugas dan uji keberhasilan bersama untuk memasak, dengan
tolok ukur publik untuk diukur; resep dalam setiap masakan tanpa menulisnya; sebuah
cerita keselamatan yang dapat dibaca regulator; laporan conformance sebagai dokumen penjualan; posisi penggerak pertama
dalam sebuah standar yang akan dikelola oleh para pelaksananya.

**Bagaimana ia memajukan masyarakat.** Lebih sedikit kebakaran dapur dan penyakit bawaan makanan dari mesin yang melakukan refusal before heat daripada menebak; mesin yang mewarisi kuliner dunia alih-alih hanya beberapa.

---

## 2. Perusahaan: startup, perusahaan besar, perusahaan makanan, pedagang grosir dan pengiriman, restoran dan layanan makanan, penanggung asuransi, pemberi sertifikasi, tim penjualan dan kemitraan

**Pesan.** Setiap perusahaan yang bersentuhan dengan makanan akan bertemu dengan mesin memasak dan agen AI dalam beberapa tahun ke depan. Cookwala memberi Anda satu antarmuka untuk semuanya, satu-satunya yang memiliki batasan keselamatan yang ditegakkan pada perangkat dan catatan yang dapat Anda audit. Untuk pedagang kelontong dan pengiriman: terima jendela pengiriman dan persyaratan alergen, bukan jadwal keluarga. Untuk penanggung asuransi dan pemberi sertifikasi: format laporan conformance dan umpan laporan insiden yang dirancang untuk Anda.

**Opsi.**
- *Ringan:* baca halaman Investors and partners dan halaman trust; petakan produk Anda ke
  ingredient classes dan operations.
- *Menengah:* publikasikan offer feed (market profile, experimental) atau surplus offer ke
  program lokal (Humanitarian Profile); jalankan agent-safety benchmark pada agent yang
  akan Anda deploy.
- *Mendalam:* implementasikan Core API dalam sebuah produk; sponsori conformance verification; bergabunglah dengan
  steering committee saat terbentuk; adopsi certification path.

**Keberhasilan pertama.** Konversikan satu lini produk menjadi `Offer` pasar dengan GTIN dan kredensial alergen, validasi, dan lihat resep contoh mana yang dapat dipenuhinya.

**Alur.** Tawarkan feed → derived constraints dari household context → pesanan melalui checkout Anda sendiri → fulfilment events → reputasi dari execution reports (dengan persetujuan).

**Bagaimana hal ini memajukan pekerjaan mereka.** Akses ke lapisan netral alih-alih selusin integrasi vendor; sinyal permintaan (later, setelah tinjauan hukum persaingan) yang mengurangi limbah; certification yang dapat dihargai oleh asuransi; catatan publik tentang keselamatan.

**Bagaimana ia memajukan masyarakat.** Lebih sedikit makanan yang terbuang antara toko dan piring; surplus mencapai dapur sebelum membusuk; mesin di rumah-rumah yang tidak dapat dibujuk untuk melakukan tindakan yang tidak aman.

---

## 3. Penyedia: pedagang kelontong, pertanian dan koperasi, pengiriman, energi, vendor AI dan model, penerbit resep

**Pesan.** Penyedia terhubung ke Cookwala sebagai rekan, bukan penyewa. Seorang pedagang kelontong atau layanan pengiriman mendapatkan sebuah constraint, tidak pernah fakta dari sebuah household. Seorang vendor AI mendapatkan sebuah benchmark yang menunjukkan bahwa modelnya aman di dapur dan sebuah MCP server untuk digunakan hari ini. Seorang penerbit resep mempertahankan namanya pada setiap resep dan dapat menerbitkan katalog bertanda tangan dari folder statis.

**Opsi.** Publikasikan katalog (resep) · publikasikan umpan penawaran · jalankan benchmark agent-safety · jalankan node registry · tawarkan surplus melalui SMS.

**Keberhasilan pertama.** Penerbit resep: `cookwala init my-dish`, edit, `cookwala validate`,
`cookwala hash`; katalog Anda adalah sebuah folder dengan `/.well-known/cookwala.json`. Vendor AI:
tambahkan server MCP dan jalankan sepuluh kasus agent-safety.

**Alur.** Katalog atau feed → entri registry di bawah namespace Anda yang terbukti → recall feed jika
terjadi kesalahan → reputasi dari hasil.

**Bagaimana hal ini memajukan pekerjaan mereka.** Jangkau setiap perangkat dan agen melalui satu format;
kredit dan asal-usul melalui tanda tangan; tolok ukur keselamatan yang merupakan aset pemasaran ketika
lulus secara jujur.

**Bagaimana ia memajukan masyarakat.** Resep tetap diatribusikan; agen yang bertindak untuk orang-orang diukur sebelum mereka dipercaya.

---

## 4. Makanan: petani, juru masak dan koki, juru masak rumah tangga, pembuat resep, sekolah kuliner

**Pesan.** Sebuah resep yang ditulis untuk Cookwala menjaga nama Anda dan masakan Anda tetap hidup di setiap
perangkat yang memasaknya, dengan langkah-langkah yang tidak boleh dilewati oleh mesin tertulis di sana. Sebuah pertanian dengan
surplus dapat mencantumkannya melalui SMS dan menjangkau dapur pada hari yang sama. Sebuah sekolah kuliner dapat mengajarkan keamanan
pangan dengan format yang memeriksa dirinya sendiri.

**Opsi.**
- *Petani:* `FARM 120KG TOMATO A BB0411` ke gateway suatu program (jika ada);
  later, baca sinyal penawaran dan permintaan.
- *Juru masak dan koki:* ubah satu resep yang Anda hafal di luar kepala menjadi resep Cookwala; tinjau
  kalimat langkah-langkah dalam bahasa Anda; later, rekam sesi yang disetujui dengan kredit.
- *Sekolah:* gunakan sembilan contoh resep sebagai kasus pengajaran; tambahkan milik Anda sendiri.

**Keberhasilan pertama.** Cooks: `cookwala init`, tulis satu resep dengan kondisi akhir untuk setiap
langkah pemanasan, validasi. Farmers: kirim satu penawaran SMS ke program yang menjalankan profil (belum ada
yang berjalan; parser dan vektor sudah ada).

**Alur.** Resep → validasi → katalog → dry run pada perangkat → execution logs menunjukkan bagaimana kinerjanya pada mesin nyata → revisi dengan bukti.

**Bagaimana hal ini memajukan pekerjaan mereka.** Atribusi yang berpindah; resep yang dapat dimasak oleh mesin di negara lain; bagi petani, sebuah cara untuk mengubah surplus menjadi hidangan alih-alih limbah.

**Bagaimana hal ini memajukan masyarakat.** Warisan kuliner dilestarikan sebagai pengetahuan praktis, bukan video;
mengurangi limbah di tingkat petani.

---

## 5. Kemanusiaan: LSM, food bank, dapur umum, program makan sekolah, lembaga bantuan, donor

**Pesan.** Humanitarian Profile memindahkan surplus makanan ke piring dengan ponsel dan
spreadsheet, mencatat pemeriksaan rantai dingin, menghitung makanan, dan **tidak membawa data pribadi**. Ia
bekerja tanpa robot, aplikasi atau internet. Ia memberi Anda angka yang dapat Anda pertahankan: kilogram
yang diselamatkan, makanan yang disajikan, tingkat kelulusan nutrisi, biaya per makanan, waktu untuk klaim, insiden keselamatan,
masing-masing dengan metodenya.

**Opsi.**
- *Light:* baca profil dan protokol pilot; coba panduan SMS.
- *Medium:* jalankan templat CSV di satu situs selama empat minggu (level H0) dan hitung
  ringkasan dampak.
- *Deep:* pilot terdaftar sebelumnya selama 12 minggu dengan baseline dan evaluator independen;
  adaptasi rule pack ke hukum nasional dengan pimpinan keamanan pangan Anda; jalankan node registry Anda sendiri.

**Keberhasilan pertama.** Isi ketiga templat CSV untuk satu hari, jalankan
`cookwala humanitarian --summary your-folder`, baca `ImpactSummary` dengan metode di bawah
setiap angka.

**Alur.** Penawaran → klaim → serah terima dengan pemeriksaan suhu → distribusi → ringkasan dampak → hasil yang dipublikasikan, apa pun yang ditunjukkannya.

**Bagaimana hal ini memajukan pekerjaan mereka.** Angka yang sebanding di seluruh situs; bukti bagi penyandang dana;
temuan keselamatan sebelum, bukan sesudah, sebuah masalah; format yang dapat dibaca oleh sistem donor (pemetaan HXL,
GS1, DHIS2).

**Bagaimana hal ini memajukan masyarakat.** Lebih banyak makanan menjangkau orang-orang dengan aman, dengan martabat mereka tetap terjaga:
tanpa nama, tanpa wajah, tanpa profiling.

---

## 6. Kesehatan: ahli diet, petugas keamanan pangan, lembaga kesehatan masyarakat, panti jompo

**Pesan.** Aturan nutrisi dan keamanan pangan sebagai paket yang dapat diperiksa mesin, diturunkan dari panduan publik, diterapkan pada menu dan serah terima, dengan tinjauan Anda yang dicatat berdasarkan profesi dan hasil. Tidak ada yang merupakan saran medis; tidak ada yang diklaim melampaui apa yang dinyatakan oleh paket tersebut.

**Opsi.** Tinjau sebuah pack dengan templat (dua jam) · adaptasi sebuah pack ke aturan nasional ·
usulkan aturan perawatan untuk orang-orang yang Anda layani · later, baca hasil agregat dari program.

**Keberhasilan pertama.** Buka `profiles/humanitarian/care-vulnerable-groups.rulepack.json` dan
templat tinjauan; tandai tiga aturan sebagai disetujui, diubah atau ditolak; simpan tinjauan tersebut.

**Alur.** Draft pack → review → status reviewed → programs adopt → findings in every
distribution → outcomes published with methods.

**Bagaimana hal ini memajukan pekerjaan mereka.** Panduan Anda berjalan di setiap dapur yang mengadopsinya, termasuk dapur robot, dengan profesi Anda yang tercatat; sebuah ulasan yang dapat diterbitkan; sebuah dataset temuan (agregat, tanpa data pribadi) untuk penelitian.

**Bagaimana hal ini memajukan masyarakat.** Lebih sedikit natrium, gula dan lemak jenuh dalam makanan yang disajikan secara massal; penyimpanan panas dan pendinginan yang lebih aman; perawatan untuk anak-anak dan orang tua yang tertulis ke dalam mesin.

---

## 7. Pendidikan: guru sekolah, pendidik, profesor, peneliti, siswa

**Pesan.** Memasak adalah proses yang paling akrab di dunia, dan Cookwala mengubahnya menjadi sebuah objek pembelajaran: suhu, unit, pembagian yang adil, keamanan, mesin yang mengikuti aturan. Bagi para peneliti, ini adalah sebuah tolok ukur, format dataset, dan daftar masalah terbuka.

**Opsi.**
- *Guru:* kit pelajaran (`docs/education/LESSON-KIT.md`): lima pelajaran dari "apa itu
  simmer" hingga "apa yang tidak boleh dilakukan mesin".
- *Profesor dan mahasiswa:* daftar topik penelitian, simulator, vektor
  conformance sebagai kondisi pengujian, ekspor LeRobot, masalah terbuka seukuran tesis.
- *Peneliti:* menerbitkan dataset dari eksekusi yang disetujui; mengkritik asumsi
  simulator; mengusulkan vektor.

**Keberhasilan pertama.** Guru: jalankan browser dry run di kelas dan tanyakan mengapa perangkat tersebut
menolak. Siswa: ubah satu asumsi dalam simulator kota dan jelaskan hasilnya.

**Alur.** Pelajaran → proyek → dataset → makalah → RFC.

**Bagaimana hal ini memajukan pekerjaan mereka.** Materi yang gratis, terbuka, dan dapat dikutip; sebuah tolok ukur yang tidak dimiliki siapa pun;
kepengarangan bersama pada standar melalui RFCs.

**Bagaimana ia memajukan masyarakat.** Sebuah generasi yang tahu apa itu dapur yang aman dan dapat membaca lembar keselamatan.

---

## 8. Pemerintah: pemerintah, kementerian, pejabat kota, regulator, politisi dan legislator, badan pengatur dan standar

**Pesan.** Mesin memasak rumah tangga dan komersial hadir di bawah regulasi yang ditulis untuk peralatan dan perangkat lunak secara terpisah. Cookwala memberikan sesuatu yang konkret bagi regulator untuk dijadikan acuan: batas keamanan yang ditegakkan pada perangkat, refusal before heat, catatan yang ditandatangani, pelaporan insiden anonim, dan rangkaian conformance yang dapat dijalankan siapa saja. Untuk keamanan donasi makanan, ia memberikan standar data tanpa data pribadi. Ini bebas royalti dan menuju tata kelola netral.

**Opsi.** Baca ringkasan kebijakan (`docs/policy/BRIEF.md`) · gunakan bahasa model untuk
data donasi-makanan dan keamanan mesin-memasak · minta badan standar Anda untuk meninjau Core 0.2
· jalankan node registry nasional · danai uji coba dengan program makan-sekolah Anda.

**Keberhasilan pertama.** Baca ringkasan dua halaman dan periksa tiga hal di repositori: paket batas keselamatan, conformance runner, aturan perlindungan data kemanusiaan.

**Alur.** Singkat → tinjauan oleh badan standar nasional → referensi dalam panduan → pilot →
skema certification.

**Bagaimana hal ini memajukan pekerjaan mereka.** Dasar teknis yang siap pakai dan dapat ditinjau; bukti dari pilot; saluran ke industri melalui standar netral; interoperabilitas dengan standar data kemanusiaan yang sudah Anda gunakan.

**Bagaimana ia memajukan masyarakat.** Mesin yang lebih aman di rumah; penyelamatan makanan yang melindungi orang-orang yang dilayaninya; lebih sedikit limbah di kota-kota.

---

## 9. Modal: investor, pengusaha, filantropi, bank pembangunan

**Pesan.** Memasak akan segera menjadi infrastruktur. Standarnya gratis; layanan di sekitarnya adalah sebuah bisnis: certification, hub software, dataset yang disetujui, operasi registry, pilot. Lapisan kemanusiaan adalah barang publik yang dapat didukung oleh penyandang dana pembangunan dengan evaluasi yang terdaftar sebelumnya. Tidak ada janji finansial yang dibuat di mana pun di situs ini.

**Opsi.** Baca peluang, model bisnis, peta jalan, risiko dan tata kelola
(`/investors`) · danai uji coba atau tinjauan · dukung perusahaan yang menjual layanan di samping
standar gratis · bergabung dalam tata kelola sebagai pengamat pendana.

**Keberhasilan pertama.** Baca bagian masalah, arsitektur, dan risiko dari whitepaper serta daftar kekhawatiran dari rencana aksi; setiap risiko yang terbuka tercantum.

**Alur.** Bukti (pilots, conformance, adopters) → gerbang dalam rencana aksi → pendanaan yang terikat pada gerbang → fondasi netral untuk standar, sebuah perusahaan untuk layanan.

**Bagaimana hal ini memajukan pekerjaan mereka.** Posisi awal dalam standar penentu kategori dengan angka yang jujur; sebuah perusahaan layanan yang layak investasi yang terpisah dari kepentingan publik.

**Bagaimana ia memajukan masyarakat.** Modal mengalir ke apa yang measured, bukan apa yang diklaim.

---

## 10. Pemikiran: filsuf, etis, sejarawan dan futuris

**Pesan.** Ketika sebuah mesin memasak resep seorang nenek, siapa yang memiliki pengetahuannya? Apa arti martabat dalam perawatan otomatis? Apa yang boleh diketahui oleh robot sebuah rumah tangga, dan siapa lagi yang boleh mengetahuinya? Cookwala telah membuat pilihan tentang pertanyaan-pertanyaan ini dalam kode; esai-esai (`docs/essays/`) menyatakan apa pilihan tersebut dan mengundang ketidaksetujuan.

**Opsi.** Baca esai · tulis tanggapan · usulkan aturan (sebuah RFC adalah argumen filosofis dengan skema) · duduk dalam tinjauan etika dari profil household context.

**Keberhasilan pertama.** Baca esai tentang data household dan aturan perjalanan facet registry;
temukan satu facet yang default-nya akan Anda ubah, dan katakan mengapa.

**Alur.** Esai → komentar publik → RFC → default berubah.

**Bagaimana hal ini memajukan pekerjaan mereka.** Sebuah kasus nyata di mana posisi etis menjadi aturan yang berjalan,
dengan catatan publik dari argumen tersebut.

**Bagaimana ia memajukan masyarakat.** Keputusan tentang data intim dan warisan budaya dibuat secara terbuka sebelum mesin-mesin tiba di jutaan rumah.

---

## 11. Semua orang: orang-orang yang peduli tentang makanan, limbah, pekerjaan, iklim dan masa depan

**Pesan.** Cookwala adalah cara untuk menulis resep sehingga siapa pun, atau apa pun, dapat memasaknya dengan aman, dan cara agar makanan yang seharusnya dibuang dapat sampai kepada seseorang yang membutuhkannya. Ini gratis, tidak dimiliki oleh perusahaan mana pun, dan menyatakan apa yang tidak diketahuinya.

**Opsi.** Coba dry run · mainkan simulator · baca resep-resepnya · tulis satu resep yang Anda
sukai · ikuti roadmap · beri tahu food bank atau sekolah tentang hal ini.

**Keberhasilan pertama.** Ubah perangkat dalam dry run dan perhatikan sebuah langkah ditolak; baca alasannya.

**Alur.** Curiosity → satu resep → satu percakapan dengan dapur yang bisa menggunakannya.

**Bagaimana hal itu memajukan hidup mereka.** Mesin yang lebih aman di rumah, resep mereka sendiri yang terjaga, sebuah cara untuk membantu tanpa memberikan uang.

**Bagaimana ia memajukan masyarakat.** Lebih sedikit limbah, makanan yang lebih aman, mesin yang melayani orang-orang yang tidak dapat memasak untuk diri mereka sendiri, dan waktu manusia yang dikembalikan.

---

## 12. Pekerjaan dan martabat, dikatakan secara lugas

Mesin memasak akan mengubah pekerjaan. Posisi Cookwala: manusia selalu dapat memasak; penggunaan pertama adalah untuk orang yang tidak dapat memasak untuk diri mereka sendiri dan untuk dapur komunitas yang kekurangan tenaga; nama juru masak tetap ada pada resep di mana pun itu dimasak; suara tenaga kerja memiliki kursi di komite pengarah; peran baru (recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) disebutkan tanpa menjanjikan jumlah tertentu.

## 13. Di mana setiap grup mendarat di situs tersebut

| Grup | Halaman |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Companies | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Food | `/for/food/`, `/farmers/` |
| Humanitarian | `/for/humanitarian/`, `/humanitarian/` |
| Health | `/for/health/` |
| Education | `/for/education/`, `/education/` |
| Government | `/for/government/`, `/policy/` |
| Capital | `/for/capital/`, `/investors/` |
| Thought | `/for/thought/`, `/ideas/` |
| Everyone | `/`, `/why/`, `/impact/` |

