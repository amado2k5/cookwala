<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->

# Federation: hur Cookwala fungerar utan ett centrum

**Status:** draft, 2026-10-04 (RFC-0006). Grundarens bild var en bikupa: inget centralt
kommando, men ändå harmoni och återhämtning. Denna sida förklarar vad det innebär i praktiken.

## 1. Noder

| Nod | Vad den tjänar | Vem som kör en |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | en receptutgivare, ett food-bank nätverk, ett universitet, en enhetstillverkare, cookwala.ai |
| **Registry** | `/v1/registry.json`: pointers till catalogs, collections, devices, packs, benchmarks | vem som helst; cookwala.ai kör en |
| **Hub** | Core API för ett kök, lokala säkerhetsgränser, household context | varje kök; fungerar offline |
| **Mirror** | publicerar om andra noders signerade objekt oförändrade | vem som helst som vill ha resiliens i sin region |

En statisk mapp är en giltig katalog. En telefon med CSV-mallarna är en giltig humanitär
deltagare på nivå H0.

## 2. Feeds, inte kommandon

Noder publicerar signerade flöden: recalls, anonyma incidenter, registry-ändringar, nyckelposter.
Andra noder pollar det de litar på och kan publicera det på nytt. Ingenting pushas in i ett kök; ett
kök pullar när det är online och fortsätter att arbeta när det inte är det.

## 3. Verifiera mot utfärdaren, aldrig reläet

En recall som anländer genom en spegel är bara så bra som **utgivarens** signatur. En hub
löser utgivarens `KeyRecord` från utgivarens eget discovery-dokument eller did:web och
verifierar kroppen byte för byte. Spegelns nyckel bevisar ingenting om innehållet; en spegel
som redigerar en recall bryter signaturen. Profilvektorer i `conformance/profiles/federation.json`
visar de tre fallen.

## 4. Tillitlistor

Varje hub håller en lista över kataloger och registries som den litar på, med deras nycklar och en prioritet. En
nod kan föreslå peers (`federation.peers`); hubben beslutar. cookwala.ai är en post på
en sådan lista, inte en root.

## 5. Friskhet

Registry-poster bär en status och en publiceringstid; recalls bär en utfärdandetid; household-facets bär en giltighet. Gamla objekt hämtas om eller tas bort. Ingenting litar man på bara för att det är gammalt, ingenting raderas tyst: återkallade poster stannar kvar som tombstones.

## 6. Historia

Händelseloggarna med bevittnade kontrollpunkter (Core section 5) gör omskrivningar detekterbara utan en
blockchain: en part skriver under loggens huvud, och en later rewrite matchar inte längre.
Public anchoring av checkpoint heads är valfritt och är ett grundarbeslut
(`docs/research/BACKSTORY.md` section 4.7).

## 7. Tre noder som samverkar

- **Ett food-bank-nätverk** driver ett registry över sina kök och donatorer, en katalog över sina rule packs anpassade till nationell lag, och en SMS-gateway. Det listar sig själv i cookwala.ai directory eller inte; dess data behöver aldrig lämna dess land.
- **En enhetstillverkare** driver en katalog över sina förmågehandlingar och safety-limit packs, publicerar conformance-rapporter, och efterfrågar recall-flöden från de kataloger dess kunder använder.
- **Ett universitetslaboratorium** driver en katalog över benchmark-recept och execution logs (med samtycke), speglar vokabulärerna, och publicerar sina egna vektorer.

Ingen av dem behöver att cookwala.ai är online.

## 8. Vad som inte är byggt

En central orkestrator, en central identitetsleverantör, en token, en blockchain. Mission-profilens quorum-beslut och orkestratorer förblir valfria och experimentella.

