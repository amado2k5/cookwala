<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->

# Cookwala Registry: menerbitkan dan menemukan resep, perangkat dan pack

> **Status: draft profile.** Modelled pada MCP Registry resmi, yang mencantumkan server Model
> Context Protocol: namespace terverifikasi, versi yang dipaku, hash integritas, endpoint
> validasi, dan status siklus hidup.

Registry adalah **daftar penunjuk**: apa yang ada, siapa yang menerbitkannya, versi mana yang tepat,
dan hash-nya. Konten tetap berada di mana pun penerbitnya menghostingnya (katalog apa pun, domain apa pun).
Siapa pun dapat menjalankan registry. cookwala.ai menjalankan yang pertama di `/v1/registry.json`.

## 1. Nama membuktikan siapa yang menerbitkan

Setiap entri dinamai `<namespace>/<name>`. Namespace harus dibuktikan:

| Namespace | Contoh | Bukti |
|---|---|---|
| Sebuah domain, dibalik | `org.fifi-cooking/egyptian-home` | Rekaman DNS TXT `cookwala-verify=<token>` pada `fifi-cooking.org`, atau `https://fifi-cooking.org/.well-known/cookwala-verify` yang mengembalikan token tersebut |
| Sebuah akun code-host | `io.github.amado2k5/recipes` | Token OIDC GitHub (atau GitLab) dari pekerjaan CI di akun tersebut |
| Sebuah kunci | apa pun | Sebuah tanda tangan oleh kunci yang sudah terikat ke namespace (rotasi) |

Names are never reused. Deleted entries stay as tombstones.

## 2. Versi adalah eksak

- **Hanya versi eksak.** Entri mengunci versi (`1.4.2`); rentang seperti `^1.4` atau `1.x` ditolak.
- **Hashes.** Setiap versi mencatat `sha256` artefak, dan klien memverifikasinya sebelum digunakan. Resep juga membawa hash dokumen Cookwala mereka sendiri, dan eksekutor melakukan refusal sebelum heat jika terjadi ketidakcocokan.
- **Repository id.** Entri mencatat repository id yang stabil dari host kode jika ada, sehingga repository yang dihapus-dan-dibuat-kembali dengan nama yang sama dapat terdeteksi.

## 3. Siklus Hidup

`active` → `deprecated` (masih dapat digunakan, terdapat pengganti) → `recalled` (tidak aman; juga
diterbitkan dalam feed recall, dan eksekutor menolaknya) → `deleted` (tombstone).

## 4. Alur penerbitan

```bash
# 1. validate locally (same checks the registry runs)
python tools/validate_specs.py
python tools/cookwala_ref.py hash my-collection/recipe.cookwala.json

# 2. prove the namespace once (DNS TXT or /.well-known/cookwala-verify, or CI OIDC)

# 3. publish the entry
curl -X POST https://cookwala.ai/v1/registry/publish \
  -H "Authorization: Bearer $COOKWALA_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d @registry-entry.json
```

`registry` menjalankan validasi yang sama dengan `POST /v1/registry/validate`: skema, semantik resep (`operation envelopes`, suhu), hash dan bukti namespace. Setiap masalah dikembalikan sebagai daftar terstruktur, sehingga CI dapat menampilkannya.

> API dijelaskan dalam [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). Layanan tersebut datang later; hari ini entri ditambahkan melalui pull request ke `site/v1/registry.json`, yang hanya mencantumkan apa yang ada di repositori ini. Aturan nama dan versi diuji oleh `conformance/profiles/registry.json`.

## 5. Entri

Lihat `catalog.schema.json#/$defs/RegistryEntry`:

```json
{
  "kind": "recipe_collection",
  "name": "org.fifi-cooking/egyptian-home",
  "description": "Egyptian home recipes from fifi.cooking, robot-ready.",
  "version": "0.3.0",
  "status": "active",
  "url": "https://cookwala.ai/v1/recipes/",
  "sha256": "…",
  "coreVersion": "0.2.0",
  "verification": { "method": "dns_txt", "verifiedAt": "2026-10-04T10:00:00Z", "by": "cookwala.ai" },
  "repository": { "url": "https://github.com/amado2k5/cookwala", "source": "github", "id": "…" }
}
```

## 6. Directory of organizations

`/v1/directory.json` mencantumkan organisasi yang **meminta** untuk dicantumkan
(`catalog.schema.json#/$defs/DirectoryEntry`): pembuat perangkat, katalog, registry, food bank,
dapur komunitas, program sekolah dan bantuan, pertanian dan koperasi, pedagang kelontong, restoran,
penerbit resep, certifier, laboratorium penelitian, badan kesehatan, pemerintah, asuransi, komunitas
penerjemah. Setiap entri memiliki peran, negara, URL, catatan verifikasi dan, jika ia
mengklaim conformance, hash dari `ConformanceReport` yang diterbitkannya
(`docs/CERTIFICATION.md`). Pencantuman bukanlah dukungan, certification atau kemitraan. Saat ini
directory memiliki satu entri, operator situs ini, karena belum ada orang lain yang meminta.

