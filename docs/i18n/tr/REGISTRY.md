<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->

# Cookwala Registry: tarifleri, cihazları ve paketleri yayınlama ve bulma

> **Durum: taslak profil.** Model Context Protocol sunucularını listeleyen resmi MCP Registry üzerinde modelledi: doğrulanmış ad alanları, sabitlenmiş sürümler, bütünlük özetleri, bir doğrulama uç noktası ve bir yaşam döngüsü durumu.

registry bir **pointer listesidir**: neyin mevcut olduğu, kimin yayınladığı, hangi tam sürüm olduğu
ve hash değeri. İçerik, yayıncısı tarafından barındırıldığı her yerde kalır (herhangi bir katalog, herhangi bir alan adı).
Herkes bir registry çalıştırabilir. cookwala.ai ilkini `/v1/registry.json` adresinde çalıştırır.

## 1. İsimler kimin yayınladığını kanıtlar

Her giriş `<namespace>/<name>` olarak adlandırılır. Namespace kanıtlanmalıdır:

| Namespace | Örnek | Kanıt |
|---|---|---|
| Bir alan adı, ters çevrilmiş | `org.fifi-cooking/egyptian-home` | `fifi-cooking.org` üzerindeki `cookwala-verify=<token>` DNS TXT kaydı veya token döndüren `https://fifi-cooking.org/.well-known/cookwala-verify` |
| Bir kod-host hesabı | `io.github.amado2k5/recipes` | Bu hesaptaki bir CI işinden gelen GitHub (veya GitLab) OIDC token'ı |
| Bir anahtar | herhangi biri | Namespace'e zaten bağlanmış bir anahtar tarafından atılan imza (rotation) |

İsimler asla yeniden kullanılmaz. Silinen girişler mezar taşı (tombstone) olarak kalır.

## 2. Versiyonlar tamdır

- **Yalnızca tam sürümler.** Girişler bir sürümü (`1.4.2`) sabitler; `^1.4` veya `1.x` gibi aralıklar reddedilir.
- **Hashler.** Her sürüm nesnenin `sha256` değerini kaydeder ve istemciler kullanmadan önce bunu doğrular. Tarifler ayrıca kendi Cookwala belge hash'lerini taşır ve yürütücüler bir uyumsuzluğu refusal before heat olarak değerlendirir.
- **Repository id.** Girişler, varsa kod ana bilgisayarının kararlı repository id değerini kaydeder, böylece aynı isme sahip silinip yeniden oluşturulan bir repository tespit edilir.

## 3. Yaşam Döngüsü

`active` → `deprecated` (hâlâ kullanılabilir, bir alternatifi mevcut) → `recalled` (güvensiz; ayrıca
recall feed içinde yayınlanır ve yürütücüler bunu reddeder) → `deleted` (tombstone).

## 4. Yayınlama akışı

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

`registry`, `POST /v1/registry/validate` ile aynı doğrulamayı çalıştırır: şema, tarif semantiği (`operation envelopes`, sıcaklıklar), hash'ler ve namespace kanıtı. Her sorun yapılandırılmış bir liste olarak geri döner, böylece CI bunu gösterebilir.

> API, [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002) dosyasında tanımlanmıştır.
> Servis later gelecektir; bugün girişler, yalnızca bu depoda mevcut olanları listeleyen `site/v1/registry.json` dosyasına pull request ile eklenir. İsim ve versiyon kuralları
> `conformance/profiles/registry.json` tarafından test edilir.

## 5. Giriş

`catalog.schema.json#/$defs/RegistryEntry` şuna bakın:

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

## 6. Kuruluşlar dizini

`/v1/directory.json`, listelenmeyi **talep eden** kuruluşları listeler
(`catalog.schema.json#/$defs/DirectoryEntry`): cihaz üreticileri, kataloglar, registries, food banks,
toplum mutfakları, okul ve yardım programları, çiftlikler ve kooperatifler, bakkallar, restoranlar,
tarif yayıncıları, certifiers, araştırma laboratuvarları, sağlık kuruluşları, hükümetler, sigortacılar, çevirmen
toplulukları. Her girişin rolleri, bir ülkesi, bir URL'si, bir doğrulama kaydı ve, conformance iddia ettiği yerlerde, yayınlanmış `ConformanceReport`larının hash değerleri vardır
(`docs/CERTIFICATION.md`). Listeleme; bir onay, certification veya ortaklık değildir. Bugün directory, başka hiç kimse henüz talep etmediği için tek bir girişe, bu sitenin operatörüne sahiptir.

