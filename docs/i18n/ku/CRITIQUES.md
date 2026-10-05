<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->

# Naqeyên ku me weşandine

Me pirsên dijwar li ser Cookwala پرسîn kirin û bersivên wan nivîsandin. Her fikarê di [registry ya concern a planê ya action](ACTION-PLAN.md#2-concern-register) de di nav `id` de heye, ligel bersiva me û rewşa wê. Nirxandinên ji derve bi xêr hatin û li vir dê werin lîstkirin.

## Ma ev ê bixebit?” (stratejî)

| Lêkryan | Bersiva kurt | Status |
|---|---|---|
| Bazirganî hîn tune ye; spec ji berhemên pêş dikeve | Small Core, yekem demo, bê bikaranîan spec a nû tune | Core 0.2 hat temamkirin; demo ya amîrî `next` e |
| Kesê bi hêz sedemek tune hebe ku adopte bike | Bi feydaya her adoptekerî pêş bikeve; bê robotan jî bikar dibe | Pilotê food-bank û hevkariya amîrî tê lêgerîn |
| Simulatorkirin tiştê ku `assumed` e îsbat dikin | Baseline a dadwer, raman, etiketên "illustrative"; pilot lê guhertinê dikin | Open |
| Birçîbûn li ser feqîrî û nakokiyê ye, ne li ser surplus | Cookwala beşdar dibe; tê qebûlkirin ku bi tenê birçîbûnê bi dawî bike | Peyam hat guhertin |
| Ewlehî, berpirsyariyê û qada êrîşê | Sînor li ser amîrî hatine sepandin; refusal; recalls; raporên bûyeran | Spec hat temamkirin; nirxandina certifier `open` e |
| Privacy (daneyên tenduristiyê û olê, lejer vs. jêbirin) | Local-first, daxistina hilbijartî, logs tenê bi hash, razîbûn | Spec hat temamkirin; nirxandina bandorê `open` e |
| Pir tevlihev e | Core 0.2; her tiştê din wekî `experimental` hat nîşandan | Done |
| Girêdayî damezgerê | Rêya governance ber bi malekî neutr ve | GOVERNANCE.md |

## Gelo sêwirana teknîkî saxlem e?

| Lêguhaştin | Di Core 0.2 de çi guherî |
|---|---|
| Operasyonan wateya fizîkî tune bû | Envelopes, asta germiya, sensor ladders, qaîda bilindahiya, test vectors |
| Şaşiyên yekîn û hejmaran | Tenê °C, tolerance-ên mutlak, yekînên metbihşê, density, pereyên desimal |
| Schemas şaşiyên nivîsê qebûl dikirin | Schemas ên hiştrim bi zelalên `x-`; pakêtê offline |
| Dokumanteke Mission a yekê ya guherbar | Event log + projection, sequencerê yek, tabloya transitions |
| Ledger kêm îspat kir | Rekordên sereke bi revocation, checkpointên şahidî, naskirina rewrite |
| Dîlîkirina eventa nedefînekirî; ewlehiya ser bus | Hejmarên sequence, klasên latency, heartbeats, "safety is local" |
| API surfaces herikîn | Core OpenAPI; her referans di CI de hatî kontrolkirin |
| Verifier tune bû | Libaryeya referans û 106 conformance vectors |

## Nîgave yên ku em daxwaz dikin

W3C TAG (nasname, JSON-LD), IETF SCITT (şeffafiya daxila-log), zanistmendên xwarinê
(envelopes), oficêrên ewlehiya xwarinê û diyetîst (rule packs), auditek ewlehiyê,
nivîsîna lêkolîna parastina daneyan, û analîza cudahiya sertîfîkerê. Binêre
[bernameya lêkolîna derve](ACTION-PLAN.md#5-external-review-program-sequenced).

