<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->

# Wadau: ujumbe, chaguzi, mafanikio ya kwanza na mtiririko kwa kila mtu

**Hali:** 2026-10-04. Kwa kila kikundi: kwa nini Cookwala ni muhimu kwao, njia za kushiriki kuanzia
nyepesi hadi nzito, mafanikio ya kwanza ndani ya dakika 15, njia baada ya hapo, na jinsi kushiriki
kunavyozidisha kazi yao na ulimwengu. Hakuna kitu hapa kinachotaja mshirika, mtumiaji au jaribio ambalo halipo. Mahali ambapo kitu kinapangwa, kinasema next au later.

Malengo matatu nyuma ya kila mstari: kusaidia kumaliza njaa, kuwafanya watu kuwa wenye afya zaidi, kuwaweka roboti kazini kwa ajili ya watu.

---

## 1. Wajenzi: watengenezaji, watengenezaji wa roboti na vifaa, wahandisi wa mifumo iliyojengwa ndani, watengenezaji wa AI-agent, watengenezaji wa smart-home na majukwaa, wachangiaji wa open-source

**Ujumbe.** Roboti na vifaa vinajifunza kutembea. Hakuna mtu aliyeandika, katika mfumo ambao mashine inaweza kuukagua, maana ya "simmer", wakati kuku ni salama, au wakati hatua lazima ikataliwe. Cookwala ni tabaka hilo: mapishi ambayo mashine inaweza kupanga, hali za mwisho ambazo inaweza kupima, na mipaka ya usalama ambayo inajilazimisha yenyewe. Ni wazi, haina malipo ya hakimiliki, haitegemei modeli na haitegemei kifaa, na inakuja na seti ya conformance unayoweza kuendesha leo.

**Chaguo.**
- *Light:* endeleza browser dry run; soma Core 0.2 (jioni moja).
- *Medium:* `pip install -e sdk/python`, fanya dry-run uwezo wa kifaa chako dhidi ya
  mapishi ya mfano, endeleza conformance vectors, anza reference hub.
- *Deep:* tekeleza Core API kwenye kifaa au hub, chapisha conformance report, ongeza
  kifaa chako kwenye directory, pendekeza RFC, andika ROS 2 bridge node, ongeza kesi za shambulio
  kwenye agent-safety benchmark.

**Mafanikio ya kwanza (chini ya dakika 15).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Mtiririko.** Dry run → tekeleza Core API dhidi ya reference hub → pita conformance →
toa ripoti → orodhesha kifaa → consented execution logs zinakuwa LeRobot datasets na
OpenTelemetry traces.

**Jinsi inavyoendeleza kazi yao.** Tafsiri ya kazi ya pamoja na jaribio la mafanikio kwa upishi, ikiwa na
kipimo cha umma cha kulinganishia; mapishi katika kila aina ya chakula bila kuyaandika; hadithi ya
usalama ambayo wasimamizi wanaweza kusoma; ripoti za conformance kama hati ya mauzo; nafasi ya kwanza
katika kiwango ambacho kitatawaliwa na watekelezaji wake.

**Jinsi inavyoendeleza jamii.** Moto mdogo wa jikoni na magonjwa ya chakula kutoka kwa mashine zinazo
kataa badala ya kukisia; mashine zinazorithi mapishi ya ulimwengu badala ya machache.

---

## 2. Makampuni: startups, biashara, makampuni ya chakula, maduka ya rejareja na usambazaji, migahawa na huduma ya chakula, bima, watia sifa, timu za mauzo na ushirikiano

**Ujumbe.** Kila kampuni inayohusika na chakula itakutana na mashine za kupikia na mawakala wa AI katika miaka michache ijayo. Cookwala inakupa kiolesura kimoja kwa ajili ya zote, kile pekee chenye mipaka ya usalama inayotekelezwa kwenye kifaa na rekodi unazoweza kukagua. Kwa wauzaji wa bidhaa za chakula na wasambazaji: pokea muda wa uwasilishaji na mahitaji ya viashiria vya mzio, kamwe ratiba ya familia. Kwa bima na watia nidhamu: muundo wa ripoti ya conformance na mfululizo wa ripoti za matukio ulioundwa kwa ajili yako.

**Chaguzi.**
- *Light:* soma ukurasa wa Investors and partners na kurasa za trust; panga bidhaa zako kulingana na
  ingredient classes na operations.
- *Medium:* chapisha offer feed (market profile, experimental) au surplus offer kwa
  programu ya ndani (Humanitarian Profile); endesha agent-safety benchmark kwenye agent unayopanga
  ku-deploy.
- *Deep:* tekeleza Core API kwenye bidhaa; sponsor conformance verification; jiunge na
  steering committee itakapoundwa; acha njia ya certification.

**Mafanikio ya kwanza.** Badilisha mstari mmoja wa bidhaa kuwa `Offer` ya soko yenye GTINs na sifa za mzio, ithibitishe, na uone ni mifano gani ya mapishi inayoweza kuipatia.

**Mtiririko.** Toa chakula → derived constraints kutoka kwa households → oda kupitia checkout yako mwenyewe → matukio ya utimilifu → sifa kutoka kwa execution reports (kwa ridhaa).

**Jinsi inavyoendeleza kazi yao.** Ufikiaji wa tabaka isiyo na upendeleo badala ya muunganiko wa wauzaji kadhaa; ishara za mahitaji (later, baada ya mapitio ya sheria za ushindani) zinazopunguza upotevu; certification ambayo bima zinaweza kupanga bei; rekodi ya umma ya usalama.

**Jinsi inavyoendeleza jamii.** Chakula kidogo kinachopotea kati ya duka na sahani; surplus ikifika
majikoni kabla haijaoza; mashine nyumbani ambazo haziwezi kushawishiwa kufanya vitendo visivyo salama.

---

## 3. Watoa huduma: maduka ya rejareja, mashamba na ushirika, usafirishaji, nishati, watoa AI na modeli, wachapishaji wa mapishi

**Ujumbe.** Watoa huduma wanachomekwa kwenye Cookwala kama washirika, si wapangaji. Muuzaji wa bidhaa za chakula au huduma ya usafirishaji
hupata kizuizi (constraint), kamwe ukweli wa kaya. Muuzaji wa AI hupata kipimo (benchmark) kinachoonyesha kuwa
model yake ni salama jikoni na MCP server ya kutumia leo. Mchapishaji wa mapishi huweka jina lake
kwenye kila mapishi na anaweza kuchapisha katalog iliyotiwa saini kutoka kwenye folda ya static.

**Chaguzi.** Toa katalogi (mapishi) · toa mchanganuo wa ofa · endesha agent-safety benchmark · endesha registry node · toa surplus kwa SMS.

**Mafanikio ya kwanza.** Mchapishaji wa mapishi: `cookwala init my-dish`, hariri, `cookwala validate`,
`cookwala hash`; katalogi yako ni folda yenye `/.well-known/cookwala.json`. Muuzaji wa AI:
ongeza seva ya MCP na uendeshe kesi kumi za usalama wa wakala.

**Mtiririko.** Katalogi au chakula → ingizo la registry chini ya namespace yako iliyothibitishwa → recall feed ikiwa
kitu chochote kinaenda mrama → sifa kutokana na matokeo.

**Jinsi inavyoendeleza kazi yao.** Fikia kila kifaa na wakala kupitia muundo mmoja;
mikopo na asili kwa saini; kigezo cha usalama ambacho ni rasilimali ya masoko wakati
kinapopitishwa kwa uaminifu.

**Jinsi inavyoendeleza jamii.** Mapishi yanabaki yakiwa na utambulisho; mawakala wanaotenda kwa ajili ya watu wanapimwa kabla ya kuaminiwa.

---

## 4. Chakula: wakulima, wapishi na wapishi wakuu, wapishi wa nyumbani, watengenezaji mapishi, shule za mapishi

**Ujumbe.** Mapishi yaliyoandikwa kwa ajili ya Cookwala yanaweka jina lako na mapishi yako hai kwenye kila
kifaa kinachoyapika, huku hatua ambazo mashine haipaswi kamwe kuruka zikiwa zimeandikwa. Shamba lenye
ziada linaweza kulorodhesha kwa SMS na kufikia jikoni siku hiyo hiyo. Shule ya mapishi inaweza kufundisha usalama wa
chakula kwa muundo unaojihakiki wenyewe.

**Chaguzi.**
- *Wakulima:* `FARM 120KG TOMATO A BB0411` hadi lango la programu (pale linapokuwepo);
  later, soma ishara za ugavi na mahitaji.
- *Mpishi na wapishi:* badilisha mapishi moja unayoyajua kwa moyo kuwa mapishi ya Cookwala; pitia
  sentensi za hatua katika lugha yako; later, rekodi vipindi vilivyokubaliwa kwa mkopo.
- *Shule:* tumia mapishi tisa ya mfano kama kesi za kufundishia; ongeza yako mwenyewe.

**Mafanikio ya kwanza.** Wapishi: `cookwala init`, andika mapishi mamoja yenye hali ya mwisho kwa kila hatua ya joto, thibitisha. Wakulima: tuma ofa moja ya SMS kwa programu inayojiendesha kwa wasifu (hakuna inayojiendesha bado; parser na vectors zipo).

**Mtiririko.** Recipe → validation → catalog → dry run kwenye vifaa → execution logs zinaonyesha jinsi inavyofanya kazi kwenye mashine halisi → marekebisho pamoja na ushahidi.

**Jinsi inavyoendeleza kazi yao.** Attribution inayotembea; mapishi ambayo yanaweza kupikwa na
mashine katika nchi nyingine; kwa wakulima, njia ya kugeuza surplus kuwa milo badala ya taka.

**Jinsi inavyoendeleza jamii.** Urithi wa mapishi unahifadhiwa kama maarifa ya kazi, si video;
punguza upotevu wa mazao shambani.

---

## 5. Kibinadamu: NGOs, food banks, jikoni za jamii, programu za milo shuleni, mashirika ya misaada, wafadhili

**Ujumbe.** Humanitarian Profile huhamisha surplus food kwenye sahani kwa kutumia simu na
spreadsheets, hurekodi ukaguzi wa cold-chain, huhesabu milo, na haibebi **no personal data**. Inafanya
kazi bila roboti, apps au internet. Inakupa namba unazoweza kutetea: kilogramu
zilizookolewa, milo iliyotolewa, nutrition pass rate, gharama kwa kila mlo, muda wa kudai, matukio ya usalama,
kila moja ikiwa na mbinu yake.

**Chaguo.**
- *Light:* soma wasifu na itifaki ya jaribio; jaribu mwongozo wa SMS.
- *Medium:* endesha templates za CSV katika tovuti moja kwa wiki nne (level H0) na uhesabu
  muhtasari wa athari.
- *Deep:* jaribio la wiki 12 lililosajiliwa mapema lenye baseline na mwelekezaji huru;
  rekebisha rule packs kulingana na sheria ya kitaifa ukiwa na kiongozi wako wa usalama wa chakula; endesha registry
  node yako mwenyewe.

**Mafanikio ya kwanza.** Jaza muchanganuo (templates) mitatu ya CSV kwa siku moja, endesha
`cookwala humanitarian --summary your-folder`, soma `ImpactSummary` ukitumia mbinu chini ya
kila namba.

**Mtiririko.** Toa → dai → makabidhiano pamoja na ukaguzi wa joto → usambazaji → muhtasari wa athari → matokeo yaliyochapishwa, vyovyote vile wanavyoonyesha.

**Jinsi inavyoendeleza kazi yao.** Namba zinazolinganishwa katika tovuti mbalimbali; ushahidi kwa wafadhili;
matokeo ya usalama kabla, si baada, ya tatizo; muundo ambao mifumo ya wafadhili inaweza kusoma (HXL,
GS1, DHIS2 mappings).

**Jinsi inavyoendeleza jamii.** Chakula zaidi kinachowafikia watu kwa usalama, huku utu wao ukiwa salama:
hakuna majina, hakuna nyuso, hakuna upimaji wa wasifu.

---

## 6. Afya: wataalamu wa lishe, maafisa wa usalama wa chakula, mashirika ya afya ya jamii, nyumba za matunzo

**Ujumbe.** Kanuni za lishe na usalama wa chakula kama paketi zinazoweza kukaguliwa na mashine, zinazotokana na mwongozo wa umma, zinazotumika kwenye menyu na makabidhiano, huku mapitio yako yakirekodiwa kwa taaluma na matokeo. Hakuna kitu ambacho ni ushauri wa kitabibu; hakuna kitu kinachodaiwa zaidi ya kile ambacho paketi hizi zinasema.

**Chaguzi.** Pitia rule pack kwa kutumia template (saa mbili) · rekebisha rule pack kulingana na sheria za kitaifa ·
pendekeza care rules kwa watu unaowahudumia · later, soma aggregate outcomes kutoka kwa programu.

**Mafanikio ya kwanza.** Fungua `profiles/humanitarian/care-vulnerable-groups.rulepack.json` na
kiolezo cha mapitio; weka sheria tatu zilizoidhinishwa, zilizobadilishwa au zilizokataliwa; hifadhi mapitio.

**Mtiririko.** Draft pack → review → status reviewed → programs adopt → findings in every
distribution → outcomes published with methods.

**Jinsi inavyoendeleza kazi yao.** Mwongozo wako unaendelea katika kila jikoni inayoutumia,
ikiwa ni pamoja na majikoni ya roboti, ukiwa na taaluma yako ikiwa imerekodiwa; mapitio yanayoweza kuchapishwa;
seti ya data ya matokeo (jumla, hakuna data binafsi) kwa ajili ya utafiti.

**Jinsi inavyoendeleza jamii.** Sodiamu, sukari na mafuta yaliyoshiba kidogo katika milo inayoliwa na watu wengi; uhifadhi wa moto na upozaji salama zaidi; utunzaji wa watoto na watu wazima uliowekwa ndani ya mashine.

---

## 7. Elimu: walimu wa shule, wasomeshi, maprofesa, watafiti, wanafunzi

**Ujumbe.** Kupika ni mchakato unaofahamika zaidi duniani, na Cookwala huugeuza kuwa kitu cha kufundishia: joto, vipimo, ugawaji wa haki, usalama, mashine zinazofuata sheria. Kwa watafiti ni kigezo, muundo wa seti ya data na orodha ya matatizo ya wazi.

**Chaguzi.**
- *Walimu:* kit cha somo (`docs/education/LESSON-KIT.md`): masomo matano kuanzia "what is a
  simmer" hadi "what should a machine never do".
- *Maprofesa na wanafunzi:* orodha ya mada za utafiti, wasimulizi (simulators), vekta za conformance
  kama masharti ya majaribio, LeRobot export, matatizo ya wazi ya ukubwa wa tasnifu.
- *Watafiti:* chapisha seti za data za executions zilizokubaliwa; kosoa assumptions za wasimulizi;
  pendekeza vekta.

**Mafanikio ya kwanza.** Walimu: fanya browser dry run darasani na uulize kwa nini kifaa
kilikataa. Wanafunzi: badilisha assumption moja katika city simulator na ueleze matokeo.

**Mtiririko.** Somo → mradi → seti ya data → karatasi → RFC.

**Jinsi inavyoendeleza kazi yao.** Nyenzo za bure, wazi, zinazoweza kunukuliwa; kipimo ambacho hakimilikiwi na mtu yeyote;
ushirikiano wa uandishi kwenye kiwango kupitia RFCs.

**Jinsi inavyoendeleza jamii.** Kizazi kinachojua jinsi jiko salama linavyokuwa na kinachoweza kusoma
karatasi ya usalama.

---

## 8. Serikali: serikali, wizara, maafisa wa jiji, wasimamizi, wanasiasa na watunga sheria, vyombo vya utawala na viwango

**Ujumbe.** Mashine za kupikia za nyumbani na za kibiashara zinaingia chini ya kanuni zilizoandikwa kwa ajili ya vifaa na programu kando. Cookwala inawapa wasimamizi kitu madhubuti cha kuashiria: mipaka ya usalama inayotekelezwa kwenye kifaa, refusal before heat, rekodi zilizotiwa saini, utoaji wa ripoti za matukio bila jina, na seti ya conformance ambayo mtu yeyote anaweza kuendesha. Kwa usalama wa michango ya chakula inatoa kiwango cha data kisicho na data binafsi. Ni bure (royalty-free) na inaelekea kwenye utawala usio upande wowote.

**Chaguzi.** Soma muhtasari wa sera (`docs/policy/BRIEF.md`) · tumia lugha ya modeli kwa
data ya michango ya chakula na usalama wa mashine za kupikia · omba chombo chako cha viwango kukagua Core 0.2
· endesha node ya registry ya kitaifa · fadhili jaribio la awali (pilot) kwa programu yako ya milo ya shule.

**Mafanikio ya kwanza.** Soma muhtasari wa kurasa mbili na ukague vitu vitatu kwenye repository: kifurushi cha mipaka ya usalama, mrafiki wa conformance, sheria za ulinzi wa data za kibinadamu.

**Mtiririko.** Fupi → mapitio na chombo cha kitaifa cha viwango → rejea katika mwongozo → jaribio →
mfumo wa certification.

**Jinsi inavyoendeleza kazi yao.** Msingi wa kiufundi uliotayarishwa na unaoweza kuangaliwa; ushahidi kutoka kwa
dry run; njia ya kuelekea kwenye sekta kupitia kiwango kisicho na upendeleo; interoperability na
viwango vya data vya kibinadamu ambavyo tayari unatumia.

**Jinsi inavyoendeleza jamii.** Mashine salama zaidi nyumbani; uokoaji wa chakula unaolinda watu
wanaohudumiwa; taka chache katika miji.

---

## 9. Mtaji: wawekezaji, wajasiriamali, wafadhili, benki za maendeleo

**Ujumbe.** Kupika kiko karibu kuwa miundombinu. Kiwango ni cha bure; huduma
zinazozunguka ni biashara: certification, programu ya hub, seti za data zilizokubaliwa,
operesheni za registry, majaribio. Tabaka la kibinadamu ni mali ya umma ambayo wafadhili wa maendeleo wanaweza
kuunga mkono kwa tathmini iliyosajiliwa mapema. Hakuna ahadi za kifedha zinazotolewa popote kwenye tovuti hii.

**Chaguzi.** Soma fursa, mfumo wa biashara, ramani, hatari na utawala
(`/investors`) · fadhili jaribio la dry run au mapitio · uunge mkono kampuni inayouza huduma kando ya
kiwango cha bure · jiunge na utawala kama mtazamaji mfadhili.

**Mafanikio ya kwanza.** Soma sehemu za tatizo, usanifu na hatari za whitepaper na rejista ya wasiwasi ya mpango wa utekelezaji; kila hatari iliyo wazi imeorodheshwa.

**Mtiririko.** Ushahidi (pilots, conformance, adopters) → milango katika mpango wa utekelezaji → ufadhili uliounganishwa na milango → msingi usio na upendeleo kwa kiwango, kampuni ya huduma.

**Jinsi inavyoendeleza kazi yao.** Nafasi ya mapema katika kiwango kinachofafanua kategoria kwa namba za uaminifu; kampuni ya huduma inayoweza kuwekezwa iliyotenganishwa na manufaa ya umma.

**Jinsi inavyoendeleza jamii.** Mtaji huenda kwenye kile kilichopimwa (measured), si kile kinachodaiwa.

---

## 10. Fikra: wanafalsafa, wataalamu wa maadili, wanahistoria na wataalamu wa baadaye

**Ujumbe.** Mashine inapopika mapishi ya bibi, nani anamiliki maarifa hayo? Heshima inamaanisha nini katika huduma ya kiotomatiki? Ni nini ambacho roboti ya kaya inaweza kujua, na ni nani mwingine anayeweza kuijua? Cookwala imefanya maamuzi kuhusu maswali haya katika kodi; insha (`docs/essays/`) zinaeleza
yalikuwa nini na zinakaribisha kutokubaliana.

**Chaguzi.** Soma insha · andika majibu · pendekeza kanuni (RFC ni hoja ya kifalsafa yenye schema) · keti kwenye mapitio ya maadili ya household context profile.

**Mafanikio ya kwanza.** Soma insha kuhusu data ya household context na kanuni za safari za facet registry;
tafuta facet moja ambayo default yake ungeibadilisha, na useme kwa nini.

**Mtiririko.** Insha → maoni ya umma → RFC → chaguo-msingi lililobadilishwa.

**Jinsi inavyoendeleza kazi yao.** Kesi hai ambapo msimamo wa kimaadili unakuwa kanuni zinazojiendesha,
ikiwa na rekodi ya umma ya hoja hiyo.

**Jinsi inavyoendeleza jamii.** Maamuzi kuhusu data za siri na urithi wa kitamaduni yanayofanywa
wazi kabla ya mashine kufika katika mamilioni ya nyumba.

---

## 11. Kila mtu: watu wanaojali chakula, taka, kazi, hali ya hewa na mustakabali

**Ujumbe.** Cookwala ni njia ya kuandika mapishi ili mtu yeyote, au kitu chochote, kiweze kupika kwa usalama, na njia kwa chakula ambacho kingetupwa kufika kwa mtu anayekihitaji. Ni bure, haimilikiwi na kampuni yoyote, na inasema kile ambacho haijui.

**Chaguzi.** Jaribu dry run · cheza simulator · soma mapishi · andika recipe moja unayoipenda · fuata roadmap · taarifu food bank au shule kuhusu hilo.

**Mafanikio ya kwanza.** Badilisha kifaa katika dry run na uone hatua ikikataliwa; soma kwa nini.

**Mtiririko.** Udadisi → mapishi mamoja → mazungumzo mamoja na jiko ambalo lingeweza kuyatumia.

**Jinsi inavyoendeleza maisha yao.** Mashine salama zaidi nyumbani, mapishi yao wenyewe yakiwa yamehifadhiwa, njia ya kusaidia bila kutoa pesa.

**Jinsi inavyoendeleza jamii.** Taka chache, chakula salama zaidi, mashine zinazowahudumia watu ambao hawawezi
kupika wenyewe, na muda wa binadamu kurudishwa.

---

## 12. Kazi na utu, kusemwa waziwazi

Mashine za kupikia zitabadilisha kazi. Nafasi za Cookwala: binadamu wanaweza kupika wakati wowote; matumizi ya kwanza ni kwa ajili ya watu ambao hawawezi kujipikia na kwa jikoni za jamii ambazo zina uhaba wa wafanyakazi; jina la mpishi linabaki kwenye mapishi popote inapopikwa; sauti ya mfanyakazi ina nafasi kwenye kamati ya uongozi; majukumu mapya (recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) yanatajwa bila kuahidi idadi.

## 13. Mahali kila kikundi kinapopatikana kwenye tovuti

| Kikundi | Ukurasa |
|---|---|
| Wajenzi | `/for/developers/`, `/developers/`, `/playground/` |
| Makampuni | `/for/companies/`, `/investors/` |
| Watoa huduma | `/for/providers/`, `/registry/` |
| Chakula | `/for/food/`, `/farmers/` |
| Kibinadamu | `/for/humanitarian/`, `/humanitarian/` |
| Afya | `/for/health/` |
| Elimu | `/for/education/`, `/education/` |
| Serikali | `/for/government/`, `/policy/` |
| Mtaji | `/for/capital/`, `/investors/` |
| Fikra | `/for/thought/`, `/ideas/` |
| Kila mtu | `/`, `/why/`, `/impact/` |

