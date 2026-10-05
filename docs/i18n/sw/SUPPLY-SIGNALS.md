<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# Ishara za ziada ya shambani na ugavi

> **Hali: experimental** (RFC-0007). Schema: `schemas/supply.schema.json`. Mifano:
> `examples/supply/`. **Gate:** mapitio ya sheria za ushindani kabla ya matumizi yoyote ya uzalishaji
> (`docs/ACTION-PLAN.md`, concern C7). cookwala.ai haichapishi ishara leo.

## 1. Mambo mawili wakulima wanayohitaji now

1. **Njia ya kuorodhesha ziada kabla haijaungua.** Shamba ni mtoaji katika Humanitarian Profile:
   `Offer` yenye `Item.origin: farm` na `harvestedAt`, au kwa SMS:

FARM 120KG TOMATO A BB0411

food bank inadai, jiko linapika, usambazaji unahesabu. Hakuna hati mpya,
   hakuna data ya kibinafsi, mashirika pekee.
2. **Ishara ya haki ya kile kitakachohitajika.** Hiyo ndiyo sehemu ya majaribio hapa chini.

## 2. Ishara za mahitaji na ugavi

| Hati | Inasema | Kanuni |
|---|---|---|
| `DemandSignal` | Katika eneo R, katika wiki ya ISO W, jikoni na programu zilipanga kutumia kati ya L na H kg za kiungo **class** C | angalau vyanzo 20 vinavyochangia; imechapishwa angalau siku 7 baada ya wiki kuisha; kiwango cha class (legume, leafy vegetable, poultry), kamwe bidhaa au chapa; **hakuna bei**; eneo lisilo finer kuliko admin1 isipokuwa vyanzo 100 au zaidi |
| `SupplySignal` | Katika eneo R, katika wiki W, class C iko katika glut, normal au short supply, ikiwa na harvest window | imechapishwa na cooperative, programu au market operator; **wazi kwa wote**: ya umma, bure, inayofanana kwa kila msomaji |

Ukaguzi wa rejea ni `check_signal()` katika `tools/cookwala_ref.py`; vekta za wasifu (`conformance/profiles/signal.json`) zinaonyesha kile kinachokubaliwa na kinachokataliwa.

## 3. Kwa nini sheria hizi

Kushiriki utabiri kati ya washindani ni ubadilishaji wa taarifa ambao mamlaka za ushindani
huonya. Ukusanyaji, kuchelewa, kiwango cha daraja, hakuna bei na uchapishaji wa wazi huifanya ishara
iwe muhimu kwa upangaji na isiyo na manufaa kwa uratibu wa bei. Viwango vya juu ni vituo vya kuanzia;
mshauri na mtaalamu wa takwimu wanapaswa kuviweka.

## 4. Wazo la mwanzilishi linakuwa nini

Mzunguko wa macro (RFC-0007): upishi uliopangwa → mahitaji yaliyokusanywa →
mashamba na maduka yanapanga kuhitaji → kilicholimwa kidogo, kilichohamishwa na kutupwa. Mi simulators ya mji, nchi na
dunia inaonyesha ukubwa wa athari chini ya dhana zao (ya kielelezo, si
utabiri). Nyaraka hizi mbili ni hatua ndogo ya uaminifu kuelekea hilo.

## 5. Later

Ushauri wa upandaji kutoka kwa mahitaji ya mbele; ukubwa wa akiba (mnyororo wa ugavi uliokamilika kuwa mwembamba ni
fragile); mtiririko wa misaada ya mikoa tofauti; ishara za ugavi kwa SMS kutoka kwa ushirika.

