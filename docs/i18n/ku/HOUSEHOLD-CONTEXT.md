<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Profile-ê Contextê Malê: wêneyê tam li malê dimîne

> **Rewşa: profîla taslak** (RFC-0001). Ne beşê Cookwala Core ye. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 cureyên facet).
> Rêzayên wergir: `profiles/household/recipient-roles.json`. API ya herêmî:
> `api/household.openapi.yaml`. Mînak: `examples/household/context.json`.

## 1. Çima

Robotek ku xizmetê bi awayekî baş dide malbatê divê pir tişt bizanibe: amûr û taybetmendiyên wan, kî li wir dijî û kengî li malê ne, heywanên evdar, zarok, xwarinên wan, alerjî, demên dermanan, rituel, budçe, adetên kirînê, çi xeletî çêbû carê borî. Hemî van agahiyan planeke qelibandinê û amûreke profilkirinê ne. Ev profil wêneya tam dide **plankera li malê** û ji her kesê din tenê **derived constraint** dide.

## 2. Sê raman

1. **Facets.** Her yek faktê ku hatî nivîsandin (`cw.facet.household.health.allergies`), bi wê kesê re ku ew îdîa kiriye (daxuyandî, dîtî, rapor kirî, îstîncak kirî), kengî, çend demê, çiqas bawerî, û curekî privacy (`public`, `household`, `sensitive`, `secret`).
2. **Qanûnên rêwîtiyê di registry de.** Her cureyê facet dibêje ka nirxa wê ya xav dikare ji malê derkeve: `never` (45 cure: zarok, veqetandin, dîmen, rewşên tenduristiyê, ol, tevger, bûyer, rewşa dahatê), tenê wekî qidayekî `derived` (81 cure), an jî wekî daxistinek `consented` piştî dabînkirineke eşkere (13 cure, piraniya wan rewşa xwe ya amûrê ye ji bo çêker).
3. **Derived constraints.** Tenê obyekta malê ku firoşkar, planker, xizmeta şandina malan, çêkerê amûrê an robotekî din hîn dibîne: "17:00–18:00 li deriyê pêşîn bide", "fîstikên kîstî blok bike", "di rêzikê de tevgera robotê tune 15:00–15:30", "sînorê budçeyê 18.00 USD ji bo her xwarinê". Her yek navê **cureyên** facetên ku ew ji wan hatine, ne nirxên wan dibêje.

## 3. Kîjan kes çi dihêt girtin

| Rola wergir | Dikare wergir |
|---|---|
| dukandar | delivery window, access point, allergen block, budget cap, labelling, packaging |
| şandî | delivery window, access point, packaging |
| planker (AI an software ku xwarinê planker) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| çêkerê amîr | robot runtime, device fault summary; device self-state facets bi razîbûn |
| robotê din | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insures | tenê device fault summary (hejmarên xeletiyan li gorî kategoriyê, ne dem, ne faktên household), û tenê dema ku household wek wergirî insuresekî nav navê; RFC-0001 vê wek rola ku herî zêde emrê wê ê bê rakirin heger nirxandina privacy derengok bibe di nîşan dide |
| bername (food bank, dibistan) | tişt nîn e |
| dataset | tişt nîn e |

## 4. Rêz

## 4. Rêz

- Facetên xav (raw) qet ji amûrê derdikevin. Tu API tune ye ku wan bide kesên li derveyî tora malê.
- Facetên `inferred` qet ji bo biryarên ewlehiyê nayên bikaranîn.
- Koma nirxandina tevgerê (behavioural score) ya kesekî nayê amadekirin an jî danîn. Facetên tevgerê ji bo xizmetkirina malbatê (qebareya xwarinê, kengî xwarinê ji ber de bête danîn) hene û qet nagerin.
- Astê aborî **posture-a budçeya ji aliyê xwedî ve hatî diyarkirin** e, qet ji tiştekî re nayê `inferred`.
- Daneyên zarokan û nebaşiya wan `secret` in û qet nagerin, heta ku ne `derived` bin jî, tenê wekî kısıtandinên tevgerê û zona ewlehiyê ku tu bernameyê nîşan nedin.
- Her facet dikare bê jêbirin. Jêbirîn di nav demê malbatê de temam dibe (bi default 7 rojan, herî herî zêde 30) û bêyî naverok tê logkirin.
- Karaktera xweparastiyê (privacy class) dikare ji default-a registry bilind bibe, qet nayê kêmkirin.

## 5. Bîra bûyera herêmî

RFC-0001 dipirse ka robot çi li ser alarm, pevçûn, serînedan û dersan bi bîr tîne. `LocalIncident` wê dihewîne: dîrok, kategori ji `vocab/incidents.json`, kî bi çi cure beşdar bû, note û ders. Ew qet ji malê çûyê nabe. `IncidentReport` ê giştî û bênavê di Core de belgeya din e ku her çêker lê fêr dibe.

## 6. Conformance

Vektorên profile (`conformance/profiles/disclosure_policy.json`) facet û rola wergir dide û hêviya cureyên derîsteya tam, id-ên derketî û id-ên veşartî bi sedeman dike. Agahdariya referans `derive_constraints()` di `tools/cookwala_ref.py` de ye.

## 7. Têkiliya bi belgeyên din re

`ClientProfile`, `KitchenProfile` û `RobotProfile` (`profile.schema.json`) wekî pakêtên (bundles) bikarhatinê dimînin. Facetên misionê (`mission.schema.json`) heman idên registryan bikar tînin. `AgentMandate` yê Core wekî daxuyaniya normatîf a tiştê ku agent dikare bike dimîne; facetên mandateyan rêzikên malbatê bi awayekî herêmî dinivîsin.

## 8. Pirsên vekirî

Binêre RFC-0001: rolyên wergirên girtî; temenê temenê privacy; nirxandina bandora parastina daneyan bi nirxandekî re.

