<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Rewş:** taslak, 2026-10-04. Ev beşeya normatîf a Cookwala ye. MUST, SHOULD û MAY
li gorî RFC 2119 bişîwin. Her tiştê ku li vir nehat listekirin **profile** (beşa 10) e.

Divê amûr dikare Core di nêzî hefteyekê de pêk bîne. Core dibêje **çi bête çêkirin, kengî qediya û çi qet nebe ku çêbibe**. Ew nabe ku bibêje robot çawa tevgerê dide.

## 1. Karêkirdinên conformance

| Tevlî | Divê pêk bîne |
|---|---|
| **Recipe publisher** | Belgeyên `recipe.schema.json` yên vala; germî di nav operation envelopes de; hash û îmze |
| **Executor** (robot, appliance an hub) | Core API (`api/core.openapi.yaml`); operation envelopes û sensor ladders; sînorên ewlehiya herêmî; refusal li şûna domankirinê; execution log |
| **Catalog** | Reseteyên îmzekirî, `/.well-known/cookwala.json` bi dîrokên sereke, recall feed, incident intake |
| **Agent** (AI an yazılım ku ji bo kesekî kar dike) | Tenê di bin `AgentMandate` de kar dike; nivîsa belgeyan wekî daneyan vedigere; berî her tiştî di `confirmBefore` de ji serdest re dipirse |
| **Verifier** | Hashes, îmze, valîdîta sereke û revokasyon, daxistina agahiyan, zincîrên bûyeran û checkpoint |

Destnîsankirina klasê tê wê wateyê ku vektora `conformance` ya wê derbas bibe (`conformance/`, bi `tools/run_conformance.py` bixe.)

## 2. Dokumên bingehîn

| Belge | Schema |
|---|---|
| Reset | `recipe.schema.json` |
| Kar pêkaniyên amûr | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Tîpên parvekirî (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Lêgerdan | `event.schema.json` (CloudEvents) |
| Sêwiran: operasyon, yekeyên û asta germiyanê, bûyer | `vocab/*.json` |

Hemû şemayên **strict** in: qadên nenas têne redkirin, bi yek ji derve zextên `x-<vendor>-…`.
Xwendekar qadên `x-` yên ku wan nizanin ji dûr ve dibin. `tools/bundle_schemas.py` pakêzeke yek ji bo amûr bixwe amade dike da ku amûr bi awayekî offline kontrol bikin. Agahdarî (Implementations) NEYÊ bixwazin şemayan di dema xebatê de bikişînin.

## 3. Operasyon çi dibin e

- **Envelopes.** Her operasyoneke li ser bingeha germê an jî xetere di `vocab/ops.json` de `envelope`ek heye.
  Ev diyar dike:
  - nav (av, rezî, hewa, qerîya tencê, berhem…);
  - qada germiya wê di °C de (û zext, ji bo çêkirina bi zextê);
  - tevger, lid, asta baldarî û ka gav dikare bê xwedîkirin bije;
  - xeterî;
  - rêbazekî ezmûnê.

`cw.op.simmer` = av-bingehîna şil di 85–96 °C de; `cw.op.deep_fry` = rezîn di 160–190 °C de.
- **Targetên di nav envelopean de.** Targetekta rêçeteyê (`params.tempC` an `target` li ser sensorê medyumê) PÊWÎST e di nav envelope de be. Validator wan rêçeteyên ku vê têkiliya têkilişê dişkînin red dike.
- **Executor medyumê di nav envelope de dimîne.** Heke rêçet targetekî îngerttir bide, ew ê medyumê di nav wê de jî dimîne, gava ku yekem car em dest pê bikin.
- **Bilindahiya devedanê.** Bendên av û bûharê li gorî −1 °C li ser her 300 m bilindahiya metborxaneyê guher dikin.
- **Astên germê** (`very_low` … `max`) yek wateya hevpar hene: bendeke serê qulîçkê di °C de, ku di `vocab/units.json` de hatîye pênasekirin.
- **Sensor ladder.** Her envelope rêyên piştrastkirina gavê di nav xwe de diwestîne, herî baş ev e: sensorê taybet, paşê `model` (estîmek ku hatî qeydkirin), paşê `time`, paşê `human`.
  - Executor ew qerebalîş (rung) bi kar tîne ku bikaribe pêkanî û wê di `verifiedBy` de qeyd dike.
  - Heke nekaribe **tu** qerebalîş pêkanî, PÊWÎST e gavê red bike (`missing_sensor_no_fallback`).
  - Operasyonên ku hewceyî baldarîya berdewam in û dibe ku bê xwedîkirin neçe, (sautéing, searing, frying, reducing, caramelizing…) tu carî tenê nabe `time`: qerebalîşê wan a dawî kesek e ku li ber çavan e.
  - Deep frying fallback nîne: heke sensorê germiya rezînî tune be, tê wê wateyê ku deep frying nabe.
  - `Condition` dikare bi `onSensorMissing` vê yekê îngerttir bike.
- **Redkirin, ne xeyalkirin.** Executorê ku nikare envelope, ladder, amûr an sînorên ewlehiyê yên gavê pêk bîne, PÊWÎST e berî destpêkirin bi sedemek ve bersiva `refused` bide.

## 4. Hejmar û yekeyên pîvanê

- **Germiya bi °C li ser tewere ye.** Nîşandan dikarin vegerin.
- **Tolerans.**
  - `tolerance` نسبî ye û tenê li ser yekneyên pergalê (ratio-scale) dibe destûrkirin.
  - `toleranceAbs` di yekneyê de absolut e, û tenê toleransa li ser °C dibe destûrkirin.
  - `Target.tolerance` absolut e.
- **Yekneyên metrizî yên metebêyê bi nirxên metrizî yên tam in:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Hacm ↔ kîlo (mass) pêdivî bi tîna giraniyê (density) heye** (`Quantity.densityGPerMl`, an jî peyvên navberê yên îngrediyan);
  bêyî yekê ev xeletî ye, qet nabe xeyal.
- **Pere di nav stringa desimal de ye** (`"12.70"`) bi pereyê ISO 4217, qet ne float e.

## 5. Integrité û bawerî

- **Hash.** `sha256:` lêgotina hex a JSON-ê ya kanonîk a RFC 8785 ya belgeyê,
  bêyî qadên `hash` û `signature` yên wê. Kanonîzerê referans bi tam ji mînakê RFC
  8785 dubare dike.
- **Signature.** Ed25519 (`EdDSA`) li ser dîloka hash a ASCII. `ES256` ji bo kerên
  donkerê P-256 dibe destûr. `kid` navê `KeyRecord` dike.
- **Keys.** `KeyRecord` yekê dide kîşa giştî, xwediyê wê, qada meteybûnê û `revokedAt`.
  Sîgnatûreke ku `signedAt` wê piştî revokasyonê an jî li derveyî qada meteybûnê dikeve,
  nevalîd e.
  - Katalogên xwe di `/.well-known/cookwala.json` de weşirînin.
  - Rêxistin û mirov xwe di belgeyên did:web de weşirînin.
  - Amûr xwe di belgeya xwe ya şiyaniyên (capabilities) de weşirînin.
  - Verifîker (çalakker) qeydên kîsê ji bo bikaranîna offline parastî dikin (cache).
- **Selective disclosure.** Belgeyek îmzekirî dikare dîloka `Disclosure` hildigire,
  `sha256(JCS([salt, value]))`, li şûna nirxekî hesas. Xwediyê belgeyê tenê ji aliyên ku destûr wergirtine dibe ku salt û
  nirx nîşan bide, û sîgnatûr hîn jî tê verifîkirin.
- **Event logs** (Mission profile):
  - Her log ji bo yekê sequencer `seq` û `prev` deynê, da ku zincîr qet şax nedê (fork).
  - Checkpoint bi rêya sequencer tê îmzekirin û bi rêya şahidên ku dikarin xizmeta şeffafiyê wek IETF SCITT jî di nav wan de bin, tê îmzekirina duyemîn. Nivîsandineke piştî checkpointeke şahitîkirî dikare
    were tespîtkirin.
  - Di mode `hash_only` de, payload di storanê de ku dikare were jêbirin dijîn û log tenê hashên wan diparêze.

## 6. Rêzikên ewlehî û agentan (normatîv)

1. **Safety her der ne.** Çalakker `SafetyLimits` pakêkê li ser amûrî bi dest nîşan dide.
   - Tu rêçeya, agent, peyama dûr, berfirehbûn an moda opérasyonê nikare sînorêkê bilind bike an bêkar bixe.
   - Sînorê tundtir her tim serdest dibe.
   - `profiles/core/safety-limits.default.json` xaleke destpêkê ya nîşandê ye ku çêkerên amûrê
     li gorî weziya xwe ya safety (safety case) tund dikin.
2. **Rawestandina her derî.** Kontrola rawestandinê li ser amûrî di nav 0.5 s de tevgerê dixe rawestandin û di nav 1 s de germiyê diqete, bi şebekeyê an bêyî şebekeyê. `POST …/stop` ji bo otorîzasyonê qet nayê redkirin dema ku
   daxwazkar dikare bigihîje çalakker.
3. **Raporên bûyeran; ew qet parastinê nakin.** Bûyerên `cookwalalatency: local_safety` raporê dikin ka amûr çi kirî. Tu funkisyona safety nikare li vegihîştina bûyerekê bibe girêdayî.
4. **Nivîsa nebawerbar.** Her qad a nivîsa azad (ku wek `x-cookwala-untrusted` hatî nîşankirin) daneyê ye û qet ne
   ferman e, hem ji bo yazılımê hem jî ji bo agentên AI. Hewldanên bi rêya nivîsê ferman kirin têne
   neguhertin û log dikin (`cw.incident.untrusted_instruction`).
5. **Agent di bin mandatekê de çalak dibin.** Daxwazeke ji aliyê agent ve hatî şandin `AgentMandate`ekî li ser wekî temen (principal) îmze dike: sînorên xebatê (scopes), sînorên xerckirinê, radêyên destûrdayî, demên derbasbûnê, û kirarên ku hewceya
   têkildanê (confirmation) hene.
   - `irreversible` û `safety_override` her tim hewceya têkildanê ne, çi wekî mandate bê gotin.
   - Çalakker daxwazên derveyî mandate red dikin (`mandate_scope`).
6. **Operasyonên bê xwedî xwedî hewceya mirovekî hene.** Operasyonên ku envelope wan dibêje `unattended: false`
   hevceyekî berpirsiyar li wir, an jî di nav sedî qetî de dikare were gihîştin, hewce ne.
7. **Blokkirina alerjenan red dike.** Her alerjenê ku di rêçeyê de an di inwentarê de hatiye blokkirin daxwazê red dike; ji bo blokkirinê tu veguherîn (substitutions) nîn in.
8. **Recall.** Katalog li ser `GET /v1/recalls` recallên îmzekirî weşya dikin. Çalakker dema ku online bin kontrol dikin û revîzyonên hatine recall kirin red dikin. `block_and_stop_running` jî çalakbûnên (executions) xebatê bi awayekî safe disîne rawestandin.
9. **Raporên bûyeran** bênav û nîşan (anonymous) in (`IncidentReport`: tenê dîrok, ne nav an id dike) û
   diqêmin katalogan da ku her çêker ji her bûyera nêzîk (near miss) fêr bibe.

## 7. Çarçoveya jiyanê ya cotkirinê û API

- **API:** `api/core.openapi.yaml`. Endpointên wê ev in:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - aliyê katalogê: `GET /v1/recalls`, `POST /v1/incidents`.
- **Rewş:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` û `stopping` → di nav rê de dibin `stopped`;
  - `refused` û `failed` dawî ne.
  - Tabloya veguherîna tam di `core.schema.json#/$defs/ExecutionState` û vektorên conformance de heye.
- **Qanûnên daxwazê:**
  - Her POST ji bo `Idempotency-Key` tê xebitandin.
  - Guhertinên li ser executionek existing `If-Match: <seq>` digirin; heke ne li hev bin 412 vedigerîne.
  - Stop hewceyî If-Match nîn e.
- **Daxuyanî (Events):**
  - Dîliyîn (Delivery) herî kêm carekê ye.
  - `id` ya CloudEvents tîpa deduplication e.
  - `cookwalaseq` daxuyaniyan li gorî mijarê rêz dike û statusê `seq` bi hev re tîne.
  - Amûr `cookwala.device.heartbeat` vedigenê, ji ber vê yekê hub dikare amûreke windabûyî bipîsîne û dest pê bike.

## 8. Privacy

- **Logên rêveberiyê ne daneyên kesane digirin** (`privacy.personalData: "none"`).
- **Ew tenê bi razîkirina opt-in ji amûrê derdikevin** (`consent.dataset`: `none` bi default,
  `research_only`, an `open`). Razîkirin dikare were vekişandin.
- **Daneyên vekirî demê heta rojê mezin dikin.**
- **Daneyên malbatî, tenduristiyê û olî li malê dimînin** heta ku kesê terkaittê çi din hilbijêre.
  Dema ku divê biçe, wekî daxistina hilbijartî diçe.
- **Profileya Humanitarian** qet daneyên kesane digirin.

## 9. Werziyonkirin û berfirehbûn

- **Versiyonên bingehîn `0.2.x` in.**
  - Xwendekar her patch a versiyonên xwe yên minor qebûl dikin.
  - Ew minorên din bi `unsupported_version` red dikin.
  - Ew qadên `x-` yên nenas ji dest dixin.
- **Operasyonên, yekeyên, sensor û cureyên bûyerên nû** bêyî guhertina versiyonê tên zêdekirin nav vokabularyan.
- **Guherandina wateya operasyoneke nû id e;** ya kevn bi `deprecated` û bi `replacedBy` tê nîşandan.
- **Profile** bi awayekî serbixwe versiyonê diyar dikin û versiyona Bingehîn a ku pêwîst e diyar dikin.

## 10. Profile û rewşa wan

| Profile | Status | Notes |
|---|---|---|
| Core (evê belge) | **draft, normative** | Armanc ji bo pêkanînên yekem ên amûr |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Daneyên kesane tune ne; bi SMS û CSV kar dike; surplus to plate, kurtiyên bandorê, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Agahiyên malbatî yên yekemîn-local; tenê derived constraints diçe (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Namespaces piştrastkirî, versiyonên tam, tombstones; rêkxistinh bi daxwazê (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Raporên îmzekirî li pişt her daxwaza conformance (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds û relays; li dijî derûşandinê piştrast bike (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restoran, civak, dibistan, kûçikî û kûçikên robot (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Sînyalên daxwaz û dabînkirinê yên komkirî, derengketî, di astê klas de; li ser lêkolîna qanûna pêşdibîrxaniyê (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection, guherînên di `profiles/mission/transitions.json` de |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Berî bikaranîna berhemê pêdivî bi lêkolîna qanûna pêşdibîrxaniyê heye |
| Relief planning (`relief.schema.json`) | experimental | Akilê operasyonel hat xistina Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API rûbera referans e |

Profil dikeve rewşa hesûktir dema ku du agahdariya (implementations) serbixweş vektorên conformance yên wê derbas dikin
û bikaranînerên wê yên rast hebin.

## 11. Amûr

| Amôr | Çi dike |
|---|---|
| `tools/validate_specs.py` | Şemayên (schemas), mînak, semantîka rêçan (envelopes, parametreyên op, ne cihên cihgirên template), tundî, û ku referansên API çareser dibin kontrol dike |
| `tools/run_conformance.py` | `conformance/*.json` û `conformance/profiles/*.json` dicerîne, û bi `--report` bi navê ConformanceReport dinivîse: hashing (termalê RFC 8785 digire nav xwe), îmza (termalê RFC 8032 digire nav xwe), betalkirin, nîşandan, zincîrên bûyerê û xalên kontrolê, yekeyan, envelopes, sensor ladders, makîneyên rewşê |
| `tools/cookwala_ref.py` | Libaryaya referans û CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Vektoran ji nû ve çêdike (difforma lêkolîn bike) |
| `tools/bundle_schemas.py` | Pakêtnameya şemaya offline |
| `tools/humanitarian_check.py` | Kontrolkara rule-pack a Humanitarian Profile û kurtiyên bandorê |
| `tools/make_profile_vectors.py` | Vektorên profile di `conformance/profiles/` de ji nû ve çêdike |

## 12. Guherîn ji 0.1

| Qad | 0.1 | 0.2 |
|---|---|---|
| Schemas | Qadên nenasmayî hatine qebûlkirin | Bi zelal, bi zelalî û bi zelalî `x-` zêdekirinan |
| Germahî | °C an °F, rêveya nisbî tê destûrdan | Tenê °C; rêveya berfireh |
| Pere | Hejmar | String a desîmal |
| Operasyon | Pênûsên pênûs | Operasyon envelope, sensor ladder, asta germî, vektora ceribandinê |
| İmza | EdDSA ya fiks, kîleyên bê temen | EdDSA an ES256, KeyRecords bi valahî û betalkirinê |
| Mîsyon | Dokumanteke guherbar, ledger di hundur de | Loga bûyerê + projection, sequencer ê yekser, checkpointên şahidî, moda tenê hash |
| Agendan | Tenê Mandate di hundurê Mîsyonan de | `AgentMandate` di hevpar de; ji bo daxwazên agendan pêwîst e |
| Safety | Di reseptan de hatî ragihandin | Bi awayê herêmî jî bi rêya SafetyLimits tê pêkanîn; recall; raporên bûyeran |
| Daney | Modelê dataset nîne | ExecutionLog bi razîkirin, bêyî daneyên kesane |
| Conformance | Tenê valîdasyona Schema | 106 vektora (44 Core, 62 profile) lê belê pêkanîna referans |

Ji bo migrasyoneke 0.1: convert °F ber bi °C ve; toleransên nisbî yên li ser germiyanên bi `toleranceAbs` veguhere; mîqdara pereyan bibe stringên desimal; qadên neyaraz jê bibe an bi qadên `x-` nav bide.

