<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# Roadmap: now, next, later

**Status:** 2026-10-04. Setiap item membawa status: **done**, **in progress**, **planned**,
**not yet funded**. Gates berasal dari bagian 4 `ACTION-PLAN.md`. Tidak ada yang berpindah dari planned
ke done tanpa bukti yang disebutkan.

## Now (rilis ini)

| Item | Status |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Sembilan contoh resep dalam bahasa Inggris dan Arab | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) dengan templat tinjauan | done (drafts awaiting professional review) |
| Household Context Profile dengan 139-type facet registry dan disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` dan `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Empat simulator dengan protokol aktif dan nonaktif | done (illustrative) |
| Situs web dalam bahasa Inggris dan Arab dengan halaman untuk setiap pemangku kepentingan, whitepaper dan deck | in progress |

## Next (dalam waktu sekitar satu tahun, sesuai ketersediaan sumber daya)

| Item | Status | Gate |
|---|---|---|
| Tinjauan ilmuwan pangan terhadap operation envelopes | planned | reviewer setuju |
| Tinjauan ahli diet dan petugas keamanan pangan terhadap empat rule packs | planned | tinjauan disimpan; packs pindah ke reviewed |
| Penilaian dampak perlindungan data dari profil household context | planned | reviewer setuju |
| Pilot food-bank (12 minggu, terdaftar sebelumnya, evaluator independen) | not yet funded | partner dan pendanaan (`humanitarian/CONCEPT-NOTE.md`) |
| Hasil tolok ukur keamanan agen untuk beberapa keluarga model | planned | runs diterbitkan dengan metode |
| wheel `pip install cookwala` dan `@cookwala/sdk` di npm | planned | pengemasan yang membundel kosakata dan skema |
| Layanan Registry (`validate`, `publish`, tombstones) | planned | seorang worker dan bukti namespace |
| Pembuat perangkat pertama yang mengimplementasikan Core API terhadap reference hub | planned | satu pembuat setuju; laporan conformance diterbitkan |
| Konversi koleksi fifi.cooking pertama | planned | pendiri memutuskan hak per koleksi |
| Core 0.3 dari umpan balik perangkat | planned | umpan balik dari dua implementer |
| Komite pengarah | planned | tiga adopter independen atau dua implementasi |

## Later

| Item | Status |
|---|---|
| Perangkat nyata memasak resep Cookwala, tanpa suntingan, dalam video | belum didanai; membutuhkan mitra perangkat |
| Skema certification dengan certifier independen | direncanakan; belum ada certifier yang dilibatkan |
| Fondasi netral untuk spesifikasi, merek dagang, dan tanda | direncanakan |
| Jaringan kontributor: rekaman resep nyata yang disetujui dengan kredit | direncanakan |
| Sinyal permintaan dan penawaran yang diterbitkan oleh program dan koperasi | direncanakan, setelah tinjauan hukum persaingan |
| Tolok ukur "Cook in simulation" (Isaac Lab, Gazebo atau MuJoCo) | direncanakan |
| Pengakuan Digital Public Good untuk Humanitarian Profile | direncanakan, setelah bukti pilot |
| Aliran bantuan lintas wilayah dalam simulator dunia; efek memasak bersih | direncanakan |

## Apa yang tidak akan kami lakukan

Mengumpulkan data pribadi; memublikasikan angka tanpa metode; menyebut nama mitra sebelum ia setuju;
mengklaim sebuah certification yang tidak ada; menempatkan data household pada ledger apa pun; membangun
orchestrator pusat yang menjadi sandaran dapur; mengklaim untuk mengakhiri kelaparan.

## Aturan kill dan pivot

Dari rencana aksi: jika dua putaran tinjauan eksternal gagal menghasilkan pembuat perangkat atau mitra pilot, Cookwala menyempit ke Humanitarian Profile dan format resep. Jika pilot menunjukkan keuntungan kurang dari 5 %, hasil akan dipublikasikan dan profil dirancang ulang sebelum penskalaan apa pun.

