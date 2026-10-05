<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->

# Dapur dan putaran produksi: restoran, komunitas, sekolah, bencana, dan dapur robot

> **Status: profil eksperimental** (RFC-0005). Skema: `schemas/fleet.schema.json`.
> Contoh: `examples/fleet/`.

## 1. Mengapa

Pendiri meminta protokol yang sama di restoran, pernikahan, penggalangan donasi atau pabrik makanan (RFC-0005). Ringkasan tersebut menambahkan program makanan sekolah dan dapur bencana. Core mencakup satu perangkat memasak satu resep; Humanitarian Profile mencakup pemindahan surplus dan penghitungan makanan. Di antara keduanya terdapat **kitchen**: stasiun, perangkat, orang, banyak batch, jendela penyajian, titik kendali kritis, dan tautan dari execution log sebuah perangkat ke makanan yang dilaporkan oleh sebuah program.

## 2. Dokumen

| Dokumen | Apa yang dikatakannya |
|---|---|
| `Kitchen` | Dapur sebuah organisasi: tipe, stasiun (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), perangkat sebagai referensi kapabilitas, kapasitas dalam makanan per jam, peralatan hot-hold dan cooling, rule packs yang berlaku, **jumlah staf berdasarkan peran**, jam operasional |
| `ProductionRun` | Resep dengan jumlah batch dan porsi, jendela penyajian, penugasan per langkah resep ke sebuah stasiun dan ke sebuah `device`, seorang `person` atau keduanya, catatan titik kendali kritis (suhu inti masak, hot-hold, two-stage cooling, reheating, chilled storage, segregasi alergen), eksekusi Core yang dihasilkan, dan sebuah hasil (makanan yang diproduksi dan disajikan, limbah, rescued food yang digunakan, kegagalan, insiden, energi, biaya, Humanitarian `Distribution` yang dipancarkannya) |
| `StationLease` | Penggunaan eksklusif sebuah stasiun oleh sebuah device atau sebuah peran untuk jangka waktu tertentu |

## 3. Bagaimana ia bergabung dengan yang lainnya

- Sebuah langkah yang ditetapkan ke sebuah `device` adalah Core `ExecuteRequest` (atau tujuan `ExecuteNode` melalui
  ikatan ROS 2); hash `ExecutionLog`-nya masuk ke dalam `executions`.
- Sebuah run yang melayani sebuah program memancarkan Humanitarian `Distribution`; `ccps` dari run tersebut adalah
  bukti di balik temuan keamanan distribusi tersebut.
- Rule packs dari Humanitarian Profile berlaku untuk menu dan item dari run tersebut.
- Fleet dispatch (robot mana pergi ke mana) termasuk dalam Open-RMF atau manajer armada vendor,
  bukan pada profil ini.

## 4. Contoh soal yang dikerjakan

`examples/fleet/kitchen-disaster.json` dan `production-run-disaster.json`: sebuah dapur bantuan
dengan dua ketel gas, unit hot-hold dan sebuah bak es menghasilkan 710 porsi sup lentil dan
nasi untuk jendela waktu dua jam, mencatat suhu memasak dan hot-hold, menemukan satu unit hot-hold
di bawah 60 °C dan memanaskan kembali batch tersebut sebelum disajikan, dan mengeluarkan sebuah distribusi. Contoh ini bersifat
ilustratif; tidak ada dapur atau peristiwa nyata yang dijelaskan.

## 5. Apa yang sengaja tidak disertakan

Nama dan jadwal staf, upah, pesanan dan pembayaran pelanggan, penetapan harga menu. Staf muncul
sebagai jumlah berdasarkan peran sehingga biaya per hidangan dapat dihitung tanpa mengidentifikasi siapa pun.

## 6. Next

Contoh layanan restoran dengan stasiun robot; suite conformance untuk mesin status run; unifikasi `StationLease` dengan sewa sesi (`session.schema.json`).

