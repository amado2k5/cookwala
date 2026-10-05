<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->

# Wasifu wa Household Context: picha nzima inabaki nyumbani

> **Hali: draft profile** (RFC-0001). Si sehemu ya Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (aina 139 za facet).
> Kanuni za mpokeaji: `profiles/household/recipient-roles.json`. API ya ndani:
> `api/household.openapi.yaml`. Mfano: `examples/household/context.json`.

## 1. Kwa nini

Roboti inayohudumia familia vizuri inahitaji kujua mambo mengi sana: vifaa na tabia zake za kipekee, nani anaishi hapo na lini wapo nyumbani, wanyama wa kufugwa, watoto, mlo, mzio, muda wa dawa, matambiko, bajeti, tabia za ununuzi, nini kilichokwenda vibaya mara ya mwisho. Ukweli ule ule ni mpango wa wizi na chombo cha uandishi wa wasifu. Wasifu huu unampa **mpangaji nyumbani** picha kamili na kuwapa wengine wote **derived constraint** pekee.

## 2. Mawazo matatu

1. **Facets.** Ukweli mmoja uliotiwa aina kila mmoja (`cw.facet.household.health.allergies`), pamoja na nani
   alithibitisha (declared, observed, reported, inferred), lini, kwa muda gani, ujasiri kiasi gani,
   na daraja la faragha (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules katika registry.** Kila aina ya facet inasema ikiwa thamani yake ghafi inaweza kuondoka
   nyumbani: `never` (aina 45: watoto, kutokuwepo, mpangilio, hali za afya, dini,
   tabia, matukio, hali ya mapato), kama `derived` constraint pekee (aina 81), au kama
   ufichuzi wa `consented` baada ya ruhusa ya wazi (aina 13, nyingi ni hali ya kifaa yenyewe kwa
   mtengenezaji).
3. **Derived constraints.** Kitu pekee cha household ambacho muuzaji wa bidhaa, mpangaji, huduma ya usafirishaji,
   mtengenezaji wa kifaa au roboti nyingine hupokea: "fikisha 17:00–18:00 mlangoni",
   "zuia karanga", "hakuna mwendo wa roboti kwenye korido 15:00–15:30", "kiwango cha bajeti 18.00 USD kwa
   mlo". Kila moja linataja **types** za facet ambazo limetoka, kamwe thamani zake.

## 3. Nani anapata nini

| Wajibu wa mpokeaji | Anaweza kupokea |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI au programu inayopanga mlo) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | device fault summary pekee (idadi ya hitilafu kwa kategoria, bila nyakati, bila ukweli wa household), na ni pale tu ambapo household imetaja insurer kama mpokeaji; RFC-0001 inaorodhesha hii kama wajibu ambao una uwezekano mkubwa wa kuondolewa ikiwa mapitio ya faragha yatapinga |
| program (food bank, shule) | hakuna kitu |
| dataset | hakuna kitu |

## 4. Kanuni

- Facets ghafi hazitoki kamwe kwenye kifaa. Hakuna API inayozirudisha kwa mtu yeyote nje ya mtandao wa nyumbani.
- Facets za `inferred` hazitumiki kamwe kwa maamuzi ya usalama.
- Hakuna alama ya kitabia ya mtu yeyote inayozalishwa au kuhifadhiwa. Facets za tabia zipo ili kuhudumia kaya (ukubwa wa sehemu, wakati wa kusafisha) na hazisafiri kamwe.
- Kiwango cha kiuchumi ni **owner-set budget posture**, hakitolewi kwa kufikiria (inferred) kutoka kwa kitu chochote.
- Data ya watoto na kutokuwepo kwao ni `secret` na hazisafiri kamwe, hata kama ni derived, isipokuwa kama ni movement na safe-zone constraints ambazo hazifichui ratiba.
- Kila facet inaweza kufutwa. Kufutwa hukamilika ndani ya dirisha la kaya (default 7 days, zisizozidi 30) na hurekodiwa bila maudhui.
- Daraja la faragha linaweza kuinuliwa juu ya registry default, halishushwi kamwe.

## 5. Kumbukumbu ya tukio ya ndani

RFC-0001 inauliza ni nini roboti hukumbuka kuhusu tahadhari, migongano, kuachia na masomo. `LocalIncident` huweka hayo: tarehe, kategoria kutoka
`vocab/incidents.json`, nani alihusika kwa aina, maelezo na somo. Haiondoki kamwe
nyumbani. `IncidentReport` ya umma na isiyojulikana katika Core ni hati tofauti ambayo kila
mtengenezaji hujifunza kutoka kwayo.

## 6. Conformance

Vekta za wasifu (`conformance/profiles/disclosure_policy.json`) hutoa facet na jukumu la mpokeaji na zinatarajia aina sahihi za constraint, id zilizofichuliwa na id zilizozuiwa pamoja na sababu. Utekelezaji wa rejeleo ni `derive_constraints()` katika `tools/cookwala_ref.py`.

## 7. Uhusiano na hati nyingine

`ClientProfile`, `KitchenProfile` na `RobotProfile` (`profile.schema.json`) zinabaki kama
fungo rahisi. Mission facets (`mission.schema.json`) zinatumia id za registry zilezile.
Core `AgentMandate` inabaki kama kauli ya kisheria ya kile agent anachoweza kufanya; mandate facets
zinaelezea sheria za household mahali hapo.

## 8. Maswali ya wazi

Angalia RFC-0001: majukumu ya mpokeaji yaliyofungwa; faragha ya `raise-only`; tathmini ya athari ya ulinzi wa data pamoja na mhakiki.

