<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Quickstart

Lima menit, tanpa perangkat keras. Anda akan mengambil sebuah resep, melakukan hash, bertanya apakah sebuah perangkat dapat memasaknya, memeriksa jejak suhu terhadap pita aman suatu operasi, dan mengekspor log memasak sebagai jejak. Semua yang di bawah ini berfungsi hari ini.

## 1. Dapatkan alat-alatnya

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` dan para eksportir hanya menggunakan pustaka standar Python. Paket lainnya
adalah untuk validasi penuh dan tanda tangan. Paket `pip install cookwala` adalah next pada
roadmap.

## 2. Ambil sebuah resep dan lakukan hash padanya

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Seorang eksekutor memasak revisi ini secara tepat dan menolak jika hash yang diberikan tidak cocok.

## 3. Bisakah perangkat ini memasaknya?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

Jawabannya adalah `refused` dengan alasan `needs_human_present`: pemotongan tidak boleh dijalankan tanpa pengawasan.
Tambahkan orang:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Sekarang statusnya `accepted`. Rencana tersebut menyatakan langkah mana yang dilakukan lengan, mana yang dilakukan orang, dan bagaimana setiap langkah akan diperiksa (sensor, estimasi yang dicatat, waktu atau orang). Coba hal yang sama di browser pada [home page](/#demo).

## 4. Periksa jejak suhu terhadap pita aman

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Validasi semuanya dan jalankan tes conformance

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Ubah log memasak menjadi trace atau dataset

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` dimuat ke dalam backend OpenTelemetry apa pun. `my-dataset/meta/` menampung satu tugas per langkah resep untuk dataset gaya LeRobot. Keduanya menolak log yang household-nya tidak memilih untuk ikut serta.

## Ke mana selanjutnya

| Anda adalah | Next |
|---|---|
| Membangun robot atau peralatan | [Robots, ROS 2 and datasets](ROBOTICS.md), kemudian [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Membangun agen AI | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) dan [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Menjalankan dapur atau food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Menulis resep | [Recipe format](RECIPE-FORMAT.md) dan [Contributing](../CONTRIBUTING.md) |

