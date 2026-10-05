<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance û rêya ber bi certification ve

**Status:** draft, 2026-10-04 (RFC-0008). Henê tu sertifikîkar neketiye destnîşandin; ev rêya standard pêşniyar dike.

## 1. Sê gav

| Gav | Kî? | Meriv çi tê wateyê | Wekî çi tê nîşandan |
|---|---|---|---|
| **Bi xwe deklare kirî** | Çêker an weşêger | Vektorên giştî bi amûrê giştî xera kir û `ConformanceReport` (`schemas/conformance.schema.json`) weşand, ku bi kîla xwe hatiye îmzekirin | rapor, bi suîte û hejmaran; qet ne nîşan (badge) |
| **Piştrastî kirî** | Operatîtorê registry | Xera kirina wekhev li dijî hash û hejmarca vektora heman setê pêk anî û raporê bi navê xwe îmze kir | rapor û piştrastker |
| **Sertifiketiye kirî** | Sertifikîkerê serbixwe (îro tu tune ne) | Suîte û kontrolên hardware û safety-case di bin şemeke weşandî de xera kir û nîşan da | rapor, sertifikîker, nîşan |

Raporê ku di her vektora klasê de bihevije, nikare îroya wê klasê îdia kirê bike. `registry` raporan nîşan dide, ne `badges`.

Îro tenê operatörê registry specification maintainer e (cookwala.ai), ji ber vê yekê "verified" heta ku registryyeke duyemîn hebe tu serbixwedî nade; statû hîn wekî self-verification tê nîşandan.

## 2. Raport çi dihewîne

Versiyona bingehîn, ku klas (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) an jî îdiaqeke profîlê (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), mijar (berhem, firoşkar, versiyon), suîtên ku bi bi temam û vector idên şaş hatine kirin, hash a koma vector, amûr û commit, dîrok, rewş û
wejîner. Mînak: `examples/conformance/report-reference.json`, ku ji aliyê vê ve hatî hilberandin

```bash
python tools/run_conformance.py --report report.json
```

## 3. Karakter û tiştên ku ew îsbat dikin

| Tevger | Vektor | Ji bo certification jî pêwîst in (bi vektoran nehatine dabînkirin) |
|---|---|---|
| Belavkarê rêçetê | hash, envelope (armanc di nav bendan de), yekin | nirxandina naveroka rêçetê ji aliyê pisporê ewlehiya xwarinê ve |
| Çalakker | envelope, sensor ladder, veguherînên çalakkirinê, sedemên refusal | case-a ewlehiya amûrê bi xwe (ISO 13482, IEC 60335, UL 3300 wekî ku ser bi xêr be); paşxistina sekinandina herêmî ya measured; sînorên ewlehiyê bêyî torê hatine sepandin |
| Katalog | hash, îmze, betalkirina kuncê, recalls | parastina kuncê û pêvajoya wergirtina bûyeran |
| Ajan | nivîsa nebawerî, heywa mandate (agent-safety benchmark) | encamên li gorî model hatine weşandin bi rêbazê |
| Verifier | hemû komên Core | tune |
| Humanitarian H0–H3 | gramera SMS, makîneya rewşê, rule packs | nirxandina berpirsyariya daneyan; ne audit a daneyên kesane |
| Household | polîtiqa ragihandinê | nirxandina bandora parastina daneyan |
| Registry | rêzên nav û versiyonê, tombstones | pêvajoya îsata namespace |

## 4. Çi certification nikare soz bide

Raporê conformanceê îsbat dike ku yazılım di roja ku xebitî de wekî ku vektor diderisin tevlihevî kir.
Ev îsbat nake ku amûr di her metbexê de ewle ye, ku çêkirina xwarinê bi rengê rast tê, an jî ku
tu zirar nikare pêk were. Standarda ku sozê dide bê zirarî ne rast e; ev standart soz dide
ku sînor li cihê xwe têne sepandin, ku refusal berî germê pêk tên, û ku dîrok dikarin
bi rêya kontrolkirinê werin lêkolînkirin.

## 5. Rêberiya nîşana

Nîşana certification û rêzikên wê diçe bingehê neytral re bi navê navendî re
(`GOVERNANCE.md`). Heta wê demê tu nîşan nexistsin; tenê rapor hene.

