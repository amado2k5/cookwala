<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. Hii ni sehemu ya kikanuni ya Cookwala. MUST, SHOULD na MAY zinafuata RFC 2119. Kila kitu ambacho hakijaorodheshwa hapa ni **profile** ya hiari (sehemu 10).

Kifaa kinapaswa kuweza kutekeleza Core katika takriban wiki moja. Core inasema **nini cha kutengeneza, lini imekamilika na nini kisitokee kamwe**. Haisemi jinsi roboti inavyosogea.

## 1. Madaraja ya conformance

| Daraja | Lazima itekeleze |
|---|---|
| **Recipe publisher** | Nyaraka halali za `recipe.schema.json`; joto ndani ya operation envelopes; hash na sahihi |
| **Executor** (robot, appliance au hub) | Core API (`api/core.openapi.yaml`); operation envelopes na sensor ladders; mipaka ya usalama ya ndani; refusal badala ya kukisia; execution log |
| **Catalog** | Mapishi yaliyotiwa sahihi, `/.well-known/cookwala.json` yenye rekodi muhimu, recall feed, intake ya matukio |
| **Agent** (AI au programu inayofanya kazi kwa niaba ya mtu) | Inafanya kazi tu chini ya `AgentMandate`; inachukulia maandishi ya nyaraka kama data; inauliza mkuu kabla ya chochote katika `confirmBefore` |
| **Verifier** | Hashes, sahihi, uhalali na ubatilishaji wa funguo, ufichuzi, mnyororo wa matukio na checkpoint |

Kudai darasa kunamaanisha kupita vekta zake za conformance (`conformance/`, endesha na
`tools/run_conformance.py`).

## 2. Nyaraka kuu

| Hati | Schema |
|---|---|
| Recipe | `recipe.schema.json` |
| Uwezo wa kifaa | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Aina zinazoshirikiwa (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Matukio | `event.schema.json` (CloudEvents) |
| Msamiati: operations, units na heat levels, incidents | `vocab/*.json` |

Miundo yote ni **strict**: nyanja zisizojulikana zinakataliwa, isipokuwa viambatisho vya `x-<vendor>-…`.
Wasomaji wanapuuza nyanja za `x-` ambazo hawazielewi. `tools/bundle_schemas.py` inazalisha bundle moja ili vifaa vithibitishe offline. Implementations HAZITAKIWI kuchukua miundo wakati wa run time.

## 3. Maana ya operations

- **Envelopes.** Kila operation inayotokana na joto au hatari katika `vocab/ops.json` ina `envelope`.
  Inabainisha:
  - kimelea (maji, mafuta, hewa, uso wa pan, bidhaa…);
  - bandi yake ya joto katika °C (na shinikizo, kwa ajili ya pressure cooking);
  - mchanganyiko, kifuniko, kiwango cha uangalizi na ikiwa hatua hiyo inaweza kuendeshwa bila uangalizi;
  - hatari;
  - njia ya jaribio.

`cw.op.simmer` = majimaji yenye msingi wa maji katika 85–96 °C; `cw.op.deep_fry` = mafuta katika 160–190 °C.
- **Malengo ndani ya envelopes.** Lengo la mapishi (`params.tempC` au `target` kwenye sensor ya kitu kinachopikwa) LAZIMA liwe ndani ya envelope. Validator hukataa mapishi yanayovunja hili.
- **Executors huweka kitu kinachopikwa ndani ya envelope.** Ikiwa mapishi yanatoa lengo finyu zaidi, huweka ndani ya hilo pia, mara tu linapofikiwa kwa mara ya kwanza.
- **Kimo.** Bandi za maji na mvuke hubadilika kwa −1 °C kwa kila 300 m ya kimo cha jikoni.
- **Heat levels** (`very_low` … `max`) zina maana moja ya pamoja: bandi ya uso wa kikaango katika °C, iliyofafanuliwa katika `vocab/units.json`.
- **Sensor ladder.** Kila envelope inaorodhesha njia za kuhakiki hatua, bora kwanza: sensor maalum, kisha `model` (makadirio yaliyorekodiwa), kisha `time`, kisha `human`.
  - Executor hutumia ngazi ya kwanza inayoweza kuitimiza na kuirekodi katika `verifiedBy`.
  - Ikiwa haiwezi kutimiza ngazi **hiyo**, LAZIMA ikatae hatua hiyo (`missing_sensor_no_fallback`).
  - Operations zinazohitaji uangalizi wa mara kwa mara na zinaweza zisifanyike bila uangalizi (kukaanga kwa mafuta kidogo, kukaanga kwa moto mkali, kukaanga, kupunguza maji, kutengeneza caramel…) hazirudi nyuma kwa muda pekee: ngazi yao ya mwisho ni mtu anayechunguza.
  - Deep frying haina fallback: hakuna sensor ya joto la mafuta inamaanisha hakuna deep frying.
  - `Condition` inaweza kufanya hili kuwa finyu kwa kutumia `onSensorMissing`.
- **Refusal, si kukisia.** Executor ambayo haiwezi kukidhi envelope, ladder, vifaa au mipaka ya usalama ya hatua LAZIMA ijibu `refused` ikiwa na sababu kabla ya kuanza.

## 4. Nambari na vitengo

- **Temperatures are °C on the wire.** Displays may convert.
- **Tolerances.**
  - `tolerance` is relative and allowed only on ratio-scale units.
  - `toleranceAbs` is absolute in the value's unit, and is the only tolerance allowed on °C.
  - `Target.tolerance` is absolute.
- **Kitchen units have exact metric values:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ mass needs a density** (`Quantity.densityGPerMl`, or the ingredient vocabulary);
  without one it is an error, never a guess.
- **Money is a decimal string** (`"12.70"`) with an ISO 4217 currency, never a float.

## 5. Uadilifu na imani

- **Hash.** `sha256:` pamoja na hex digest ya RFC 8785 canonical JSON ya hati,
  bila nyanja zake za `hash` na `signature`. Kirejesha canonical kinazalisha mfano wa RFC
  8785 sawasawa.
- **Signature.** Ed25519 (`EdDSA`) juu ya ASCII hash string. `ES256` inaruhusiwa kwa funguo za
  vifaa vya P-256. `kid` inataja `KeyRecord`.
- **Keys.** `KeyRecord` inatoa funguo ya umma, mmiliki wake, dirisha la uhalali na `revokedAt`.
  Signature ambayo `signedAt` yake inatokea baada ya ubatilishaji, au nje ya dirisha la uhalali, ni
  batili.
  - Katalogi huchapisha funguo zao katika `/.well-known/cookwala.json`.
  - Mashirika na watu huchapisha zao katika nyaraka za did:web.
  - Vifaa huchapisha zao katika nyaraka zao za uwezo.
  - Wahakiki huhifadhi rekodi za funguo kwa ajili ya matumizi ya nje ya mtandao.
- **Selective disclosure.** Hati iliyotiwa saini inaweza kuwa na `Disclosure` digest,
  `sha256(JCS([salt, value]))`, badala ya thamani nyeti. Mwenye hati hufichua salt na
  thamani kwa wahusika walioruhusiwa tu kuziona, na signature bado inathibitika.
- **Event logs** (Mission profile):
  - Kila log inatumia sequencer moja inayopangilia `seq` na `prev`, ili mnyororo usigawanyike.
  - Checkpoints hutiwa saini na sequencer na kusainiwa tena na mashahidi, ambao wanaweza kujumuisha
    huduma ya uwazi kama IETF SCITT. Kuandika upya baada ya checkpoint iliyoshuhudiwa ni
    kinachoweza kugundulika.
  - Katika hali ya `hash_only`, payload zinaishi katika hifadhi inayofutika na log huhifadhi tu hash zake.

## 6. Kanuni za usalama na wakala (normative)

1. **Usalama ni wa ndani.** Watekelezaji (Executors) wanatilia nguvu `SafetyLimits` pack kwenye kifaa.
   - Hakuna mapishi, wakala, ujumbe wa mbali, nyongeza au hali ya uendeshaji inayoweza kuongeza au kuzima kikomo.
   - Kikomo kikali zaidi daima hushinda.
   - `profiles/core/safety-limits.default.json` ni rasimu ya kuanzia ambayo watengenezaji wa vifaa
     huifanya kuwa kali zaidi kutokana na kesi yao ya usalama.
2. **Simamisha ya ndani.** Udhibiti wa kusimamisha kwenye kifaa unasimamisha mwendo ndani ya 0.5 s na kukata joto ndani ya
   1 s, kukiwa na au bila mtandao. `POST …/stop` haikataliwi kamwe kwa ajili ya idhini mara tu
   mpigaji anapoweza kumfikia mtekelezaji.
3. **Matukio yanaripoti; hayalindi kamwe.** Matukio ya `cookwalalatency: local_safety` yanaripoti kile ambacho
   kifaa tayari kilifanya. Hakuna kazi ya usalama inayoweza kutegemea tukio kuwasili.
4. **Maandishi yasiyoaminika.** Kila uwanja wa maandishi huru (uliowekwa alama `x-cookwala-untrusted`) ni data na si
   maelekezo kamwe, kwa programu na mawakala wa AI vivyo hivyo. Jaribio la kutoa maelekezo kupitia maandishi
   hupuuzawe na kuandikwa kwenye log (`cw.incident.untrusted_instruction`).
5. **Mawakala hutenda chini ya mandate.** Ombi linalotumwa na wakala hubeba `AgentMandate` iliyotiwa saini
   na mkuu: maeneo (scopes), ukomo wa matumizi, watoa huduma walioruhusiwa, mwisho wa muda, na vitendo vinavyohitaji
   uthibitisho.
   - `irreversible` na `safety_override` daima zinahitaji uthibitisho, hata iwe mandate inasemaje.
   - Watekelezaji hukataa maombi yaliyo nje ya mandate (`mandate_scope`).
6. **Uendeshaji usio na uangalizi unahitaji mtu.** Uendeshaji ambao envelope yake inasema `unattended: false`
   unahitaji mtu anayehusika kuwepo, au anayeweza kufikiwa ndani ya dakika moja.
7. **Vizuizi vya mzio (Allergen blocks) hukataa.** Mzio wowote uliozuiwa kwenye mapishi au kwenye orodha hukataa
   ombi; hakuna mbadala unaoweza kutumika badala ya kizuizi.
8. **Recalls.** Katalogi huchapisha recalls zilizotiwa saini kwenye `GET /v1/recalls`. Watekelezaji hufanya poll wanapokuwa mtandaoni
   na kukataa marejesho (revisions) yaliyorecalliwa. `block_and_stop_running` pia inasimamisha uendeshaji wa executions kwa usalama.
9. **Ripoti za matukio** ni zisizo na majina (`IncidentReport`: tarehe pekee, hakuna majina au ids) na
   hutumwa kwa katalogi ili kila mtengenezaji ajifunze kutokana na kila karibu kukosea.

## 7. Maisha ya mzunguko wa utekelezaji na API

- **API:** `api/core.openapi.yaml`. Endpoint zake ni:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - upande wa catalog: `GET /v1/recalls`, `POST /v1/incidents`.
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` na `stopping` → `stopped` njiani;
  - `refused` na `failed` ni za mwisho.
  - Jedwali kamili la mabadiliko liko kwenye `core.schema.json#/$defs/ExecutionState` na
    vifaa vya conformance.
- **Request rules:**
  - Kila POST hubeba `Idempotency-Key`.
  - Mabadiliko kwenye execution iliyopo hubeba `If-Match: <seq>`; kutolingana kurudisha 412.
  - Stop haihitaji If-Match.
- **Events:**
  - Uwasilishaji ni angalau mara moja.
  - `id` ya CloudEvents ni ufunguo wa deduplication.
  - `cookwalaseq` hupanga events kwa kila subject na kulinganisha hali ya `seq`.
  - Vifaa hutoa `cookwala.device.heartbeat`, hivyo hub inaweza kugundua kifaa kilichopotea na kukabidhi.

## 8. Faragha

- **Execution logs hazibebi data za kibinafsi** (`privacy.personalData: "none"`).
- **Huondoka kwenye kifaa tu kwa ridhaa ya kuingia** (`consent.dataset`: `none` kwa kuanzia,
  `research_only`, au `open`). Ridhaa inaweza kuondolewa.
- **Datasets za wazi hupunguza muda hadi siku.**
- **Data za kaya, afya na kidini hubaki nyumbani** isipokuwa kama mtu atachagua vinginevyo.
  Inapobidi kusafiri, husafiri kama ufichuzi wa kuchagua.
- **The Humanitarian Profile** haibebi data za kibinafsi hata kidogo.

## 9. Toleo na miongozo ya ziada

- **Toleo kuu ni `0.2.x`.**
  - Wasomaji hukubali patch yoyote ya toleo lao la minor.
  - Hukataa minor nyingine kwa `unsupported_version`.
  - Hupuuza nyanja za `x-` zisizojulikana.
- **Operesheni, vitengo, sensa na aina za matukio mpya** huongezwa kwenye misamiati bila
  mabadiliko ya toleo.
- **Kubadilisha maana ya operesheni ni id mpya;** ile ya zamani huwekwa alama ya `deprecated` kwa
  `replacedBy`.
- **Wasifu (Profiles)** hutoa toleo huru na kutangaza toleo la Core wanalohitaji.

## 10. Wasifu na hali zao

| Profaili | Hali | Maelezo |
|---|---|---|
| Msingi (hili hati) | **draft, normative** | Lengo kwa ajili ya utekelezaji wa kifaa cha kwanza |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Hakuna data ya kibinafsi; hufanya kazi kwa SMS na CSV; surplus hadi sahani, muhtasari wa athari, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Ukweli wa kaya wa kwanza-lokal; ni derived constraints pekee zinazosafiri (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Namespaces zilizothibitishwa, matoleo sahihi, tombstones; mashirika kwa ombi (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Ripoti zilizotiwa saini nyuma ya kila dai la conformance (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds na relays; thibitisha dhidi ya mtoaji (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Migahawa, jamii, shule, majanga na jikoni za roboti (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Hali ya mahitaji na usambazaji iliyokusanywa, iliyochelewa, na ya kiwango cha darasa; imefungwa kwenye mapitio ya sheria ya ushindani (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection, mabadiliko katika `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Inahitaji mapitio ya sheria ya ushindani kabla ya matumizi ya uzalishaji |
| Relief planning (`relief.schema.json`) | experimental | Mtiririko wa kiutendaji umehamishiwa kwenye Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API ndiyo uso wa rejeleo |

Wasifu unakuwa thabiti wakati timbwi mbili huru za utekelezaji zinapopita vekta zake za conformance
na uwe na watumiaji halisi.

## 11. Zana

| Chombo | Inachofanya |
|---|---|
| `tools/validate_specs.py` | Inakagua schemas, mifano, semantics za mapishi (envelopes, op parameters, hakuna template placeholders), ukali, na kwamba marejeleo ya API yanatatuliwa |
| `tools/run_conformance.py` | Inafanya `conformance/*.json` na `conformance/profiles/*.json`, na kuandika ConformanceReport kwa kutumia `--report`: hashing (ikiwa ni pamoja na mfano wa RFC 8785), saini (ikiwa ni pamoja na funguo ya RFC 8032), ubatilishaji, ufichuzi, mnyororo wa matukio na vituo vya ukaguzi, vitengo, envelopes, sensor ladders, mashine za hali |
| `tools/cookwala_ref.py` | Maktaba ya marejeleo na CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Inatengeneza upya vectors (pitia diff) |
| `tools/bundle_schemas.py` | Muunganisho wa schema wa offline |
| `tools/humanitarian_check.py` | Kikaguzi cha rule-pack la Humanitarian Profile na muhtasari wa athari |
| `tools/make_profile_vectors.py` | Inatengeneza upya profile vectors katika `conformance/profiles/` |

## 12. Mabadiliko kutoka 0.1

| Eneo | 0.1 | 0.2 |
|---|---|---|
| Schemas | Imekubaliwa nyanja zisizojulikana | Ngumu, ikiwa na `x-` extensions |
| Joto | °C au °F, uvumilivu wa kulinganisha unaruhusiwa | °C pekee; uvumilivu wa kamili |
| Pesa | Namba | String ya desimali |
| Operesheni | Maelezo ya nathari | Physical envelopes, sensor ladders, viwango vya joto, test vectors |
| Saini | EdDSA iliyofungwa, funguo bila lifecycle | EdDSA au ES256, KeyRecords ikiwa na uhalali na ubatilishaji |
| Misheni | Hati moja inayoweza kubadilika, ledger ndani | Event log + projection, sequencer moja, witnessed checkpoints, hash-only mode |
| Wakala | Mandate ndani ya Misheni pekee | `AgentMandate` katika kawaida; inahitajika kwa maombi ya wakala |
| Usalama | Imetangazwa kwenye mapishi | Pia inasimamiwa mahali hapo kupitia SafetyLimits; recalls; ripoti za matukio |
| Data | Hakuna mfano wa dataset | ExecutionLog iliyokubaliwa, isiyo na personal-data |
| Conformance | Uhakiki wa Schema pekee | Vector 106 (44 Core, 62 profile) pamoja na marejeleo ya utekelezaji |

Ili kuhamisha hati ya 0.1: badilisha °F kuwa °C; badilisha tolerances za relative kwenye joto na `toleranceAbs`; badilisha kiasi cha pesa kuwa decimal strings; ondoa au ubadilishe majina ya nyanja zisizojulikana kuwa nyanja za `x-`.

