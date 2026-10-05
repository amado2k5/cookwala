<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->

# Profil Household Context: gambaran utuh tetap di rumah

> **Status: draft profile** (RFC-0001). Bukan bagian dari Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 tipe facet).
> Aturan penerima: `profiles/household/recipient-roles.json`. API Lokal:
> `api/household.openapi.yaml`. Contoh: `examples/household/context.json`.

## 1. Mengapa

Sebuah robot yang melayani keluarga dengan baik perlu mengetahui banyak hal: peralatan dan keunikannya, siapa yang tinggal di sana dan kapan mereka ada di rumah, hewan peliharaan, anak-anak, diet, alergi, waktu pengobatan, ritual, anggaran, kebiasaan belanja, apa yang salah terakhir kali. Fakta yang sama merupakan rencana pencurian dan alat pemprofilan. Profil ini memberikan **planner at home** gambaran lengkap dan memberikan orang lain hanya sebuah **constraint**.

## 2. Tiga ide

1. **Facets.** Satu fakta yang diketik masing-masing (`cw.facet.household.health.allergies`), dengan siapa
   yang menegaskannya (declared, observed, reported, inferred), kapan, untuk berapa lama, seberapa yakin,
   dan kelas privasi (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in the registry.** Setiap tipe facet menyatakan apakah nilai mentahnya boleh meninggalkan
   rumah: `never` (45 tipe: children, absences, layouts, health conditions, religion,
   behaviour, incidents, income posture), hanya sebagai constraint `derived` (81 tipe), atau sebagai
   pengungkapan `consented` setelah pemberian izin eksplisit (13 tipe, sebagian besar device self-state untuk
   pembuatnya).
3. **Derived constraints.** Satu-satunya objek household yang pernah diterima oleh pedagang kelontong, perencana, layanan pengiriman,
   pembuat perangkat, atau robot lain: "deliver 17:00–18:00 to the front door",
   "block peanuts", "no robot movement in the hallway 15:00–15:30", "budget cap 18.00 USD per
   meal". Masing-masing menyebutkan **types** facet asal datanya, tidak pernah nilai-nilainya.

## 3. Siapa mendapatkan apa

| Peran penerima | Dapat menerima |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI atau perangkat lunak yang merencanakan hidangan) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | hanya device fault summary (jumlah kesalahan berdasarkan kategori, tanpa waktu, tanpa fakta household), dan hanya ketika household telah menamai insurer sebagai penerima; RFC-0001 mencantumkan ini sebagai peran yang paling mungkin dihapus jika tinjauan privasi keberatan |
| program (food bank, sekolah) | tidak ada |
| dataset | tidak ada |

## 4. Aturan

- Facet mentah tidak pernah meninggalkan perangkat. Tidak ada API yang mengembalikannya kepada siapa pun di luar jaringan rumah.
- Facet `inferred` tidak pernah digunakan untuk keputusan keselamatan.
- Tidak ada skor perilaku dari orang mana pun yang dihasilkan atau disimpan. Facet perilaku ada untuk melayani rumah tangga (ukuran porsi, kapan harus membersihkan) dan tidak pernah berpindah.
- Tingkat ekonomi adalah **postur anggaran yang ditetapkan pemilik**, tidak pernah disimpulkan dari apa pun.
- Data dan ketidakhadiran anak-anak adalah `secret` dan tidak pernah berpindah, bahkan tidak yang diturunkan, kecuali sebagai batasan pergerakan dan zona aman yang tidak mengungkapkan jadwal.
- Setiap facet dapat dihapus. Penghapusan selesai dalam jendela rumah tangga (default 7 hari, paling banyak 30) dan dicatat tanpa konten.
- Kelas privasi dapat ditingkatkan di atas default registry, tidak pernah diturunkan.

## 5. Memori insiden lokal

RFC-0001 menanyakan apa yang diingat robot tentang alarm, konflik, penyerahan, dan pelajaran. `LocalIncident` menyimpannya: tanggal, kategori dari `vocab/incidents.json`, siapa yang terlibat berdasarkan jenis, sebuah catatan, dan sebuah pelajaran. Hal ini tidak pernah meninggalkan rumah. `IncidentReport` publik dan anonim di Core adalah dokumen berbeda yang dipelajari oleh setiap pembuat.

## 6. Conformance

Vektor profil (`conformance/profiles/disclosure_policy.json`) memberikan facet dan peran penerima serta mengharapkan tipe constraint yang tepat, id yang diungkapkan dan id yang ditahan beserta alasannya. Implementasi referensinya adalah `derive_constraints()` di dalam `tools/cookwala_ref.py`.

## 7. Hubungan dengan dokumen lain

`ClientProfile`, `KitchenProfile` dan `RobotProfile` (`profile.schema.json`) tetap sebagai
bundle yang praktis. Facet misi (`mission.schema.json`) menggunakan id registry yang sama.
`AgentMandate` Core tetap menjadi pernyataan normatif tentang apa yang boleh dilakukan oleh seorang agent; facet mandate
mendeskripsikan aturan household secara lokal.

## 8. Pertanyaan terbuka

Lihat RFC-0001: peran penerima tertutup; privasi raise-only; sebuah penilaian dampak perlindungan data dengan seorang peninjau.

