<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->
# Cookwala Humanitarian Profile (draft 0.2)

**Status:** projekt do przeglądu przez food banks, programy pomocy oraz specjalistów ds. bezpieczeństwa żywności i żywienia. Nie został on sprawdzony ani poparty przez WFP, WHO, FAO, Global FoodBanking Network ani żadną inną organizację wymienioną tutaj.

**Pliki:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (wszystkie), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; wszystkie wersje robocze oczekujące na profesjonalną recenzję, patrz [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank w Kairze, posiłki szkolne, kuchnia kryzysowa, kuchnia robotyczna), każdy z obliczonym `ImpactSummary`
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Co dodaje 0.2 (RFC-0003, RFC-0004)

Dodatek powyżej 0.1; czytelnicy akceptują oba.

- **Od farmy do talerza:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) oraz `Item.harvestedAt`; role `farm`, `caterer`, `robot_kitchen`; słowo SMS `FARM`.
- **Zasady opieki:** `Item.foodClasses` oraz `Distribution.menu.foodClasses` (surowe jajko, niepasteryzowany nabiał, całe orzechy, gotowany ryż…), rodzaj zasady `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; trzy nowe szkice rule pack.
- **Przeglądy:** `RulePack.reviews` rejestruje zawód, organizację, datę, zakres i wynik każdego przeglądu; `status: reviewed` wymaga zatwierdzonego przeglądu.
- **Wpływ:** `ImpactSummary` z dziewięcioma miarami, z których każda posiada `method` (measured, modelled, assumed, not recorded), obliczanymi przez `tools/humanitarian_check.py --summary`.
- **Czas na zgłoszenie:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg`, aby uratowane kilogramy były liczone tylko raz.
- **Typy programów** w `Manifest`.

## 1. Cel

Mała, rygorystyczna, pozbawiona danych osobowych część Cookwala dla organizacji żywiących ludzi:
food banks, kuchnie społecznościowe, programy posiłków szkolnych, programy pomocy, darczyńcy (sklepy spożywcze, restauracje, gospodarstwa rolne, firmy cateringowe), transporterzy i magazyny chłodnicze. Obejmuje cztery zadania:

1. **Oferowanie surplus food** i zgłaszanie go, szybko i sprawiedliwie.
2. **Rejestrowanie każdego przekazania** opieki, wraz z kontrolą temperatury (cold-chain check).
3. **Raportowanie tego, co zostało podane**, wyłącznie jako zagregowane liczby.
4. **Sprawdzanie menu i przekazań** pod kątem maszynowo czytelnych zasad żywieniowych i bezpieczeństwa żywności.

**Działa bez robotów, aplikacji czy internetu.** Poziomy H0 i H1 działają na arkuszach kalkulacyjnych, SMS i prostych telefonach. Roboty, huby i agenci są opcjonalnymi konsumentami tych samych dokumentów.

## 2. Zasady

- **Nie wyrządzaj szkód.** Nie zbieraj niczego, co mogłoby identyfikować, lokalizować lub profilować osobę lub gospodarstwo domowe. W kruchych warunkach dane o beneficjentach stanowią ryzyko dla ochrony.
- **Zasady humanitarne** (humanitaryzm, neutralność, bezstronność, niezależność): brak komercyjnego brandingu na pomocy oraz brak wykorzystywania danych do celów marketingowych.
- **Ścisłe i małe.** Każdy obiekt odrzuca nieznane pola (z wyjątkiem rozszerzeń `x-`), więc literówki i dodatkowe pola osobowe nie przejdą walidacji.
- **Dokładne jednostki:** kilogramy, stopnie Celsius, tolerancje bezwzględne oraz pieniądze jako ciągi dziesiętne.
- **Lokalne zasady mają pierwszeństwo.** Rule packs mogą zostać zastąpione przez krajowe prawo dotyczące bezpieczeństwa żywności i darowizn.
- **Otwarte:** specyfikacja wolna od opłat licencyjnych, narzędzia open-source. Profil został zaprojektowany tak, aby spełniać Digital Public Goods Standard oraz Principles for Digital Development.

## 3. Poziomy conformance

| Poziom | Co robi uczestnik | Potrzeby |
|---|---|---|
| **H0 — Papier & SMS** | Rejestruje oferty, przekazania i dystrybucje w szablonach CSV (z wierszami hashtagów HXL) lub przez SMS (sekcja 8.3) | Arkusz kalkulacyjny lub podstawowy telefon |
| **H1 — Ratunek** | Wymienia dokumenty `Offer`, `Claim`, `Handover` i `Distribution` przez API; postępuje zgodnie ze stanem maszyny (sekcja 5) | Dowolny klient HTTP |
| **H2 — Bezpieczeństwo & odżywianie** | Stosuje `RulePack` do każdego przekazania i menu oraz rejestruje `findings` | Sprawdzający referencyjny lub odpowiednik |
| **H3 — Interoperacyjność** | Eksportuje agregaty do HXL, DHIS2 i rdzeniowego Cookwala `ImpactReport`; używa identyfikatorów GS1 | Prace integracyjne |

Uczestnik publikuje `Manifest` w `/.well-known/cookwala-humanitarian.json`, który
deklaruje swoje poziomy, rule packs, punkty końcowe oraz `personalData: "none"`.

## 4. Dokumenty

| Dokument | Kto go pisze | Cel |
|---|---|---|
| `Offer` | Dawca | Surplus food dostępna do odbioru: produkty (kg, przechowywanie, daty, alergeny), okno czasowe, lokalizacja, temperatury |
| `Claim` | Food bank, kuchnia, program | Zgłoszenie całości lub części oferty, wraz z czasem odbioru i typem pojazdu |
| `Handover` | Przekazujący opiekę | Jeden na każdy etap: temperatury, kg przyjęte lub odrzucone wraz z kodem powodu, oraz wyniki sprawdzenia reguł |
| `Distribution` | Kuchnia, food bank, szkoła | Zagregowane posiłki i liczba osób obsłużonych w lokalizacji w danym dniu; opcjonalne wartości odżywcze menu i koszty |
| `RulePack` | Program lub organ | Wersjonowane reguły żywieniowe i bezpieczeństwa żywności (sekcja 6) |
| `Manifest` | Każdy uczestnik | Deklaracja możliwości i ochrony danych |

Podstawowe dokumenty Cookwala dotyczące pomocy (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` w `relief.schema.json`) pozostają dostępne do planowania. Ten profil obsługuje
przepływ operacyjny.

## 5. Cykl życia oferty

| Od | Dozwolone stany next |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (roszczenie wygasło), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | brak (finalny) |

**Zasady zmian stanu:**

- Każda zmiana zwiększa `version`. Autorzy wysyłają `If-Match: <version>`; niedopasowanie zwraca
  **409**, a autor ponownie odczytuje i ponawia próbę.
- Nielegalne przejście zwraca **409** wraz z dozwolonymi przejściami.
- Oferty przechodzą w stan `expired` automatycznie w `window.to`.
- Roszczenia wygasają w `pickupBy` plus okres karencji ustalany przez program (domyślnie 30 minutes).

**Sprawiedliwe roszczenia.** Domyślnie roszczenia są przyznawane według zasady „kto pierwszy, ten lepszy” w ramach poziomu priorytetu ustalonego przez program:
na przykład kuchnie obsługujące dzieci w pierwszej kolejności, następnie inne kuchnie, a potem food banks. Poziomy i
wszelkie reguły rotacji muszą zostać opublikowane w `Manifest` programu lub na stronie internetowej.

## 6. Pakiety reguł dotyczących bezpieczeństwa żywności i wartości odżywczych

`RulePack` zawiera reguły sześciu rodzajów:

- `temperature`: schłodzone ≤ 5 °C, utrzymywane w cieple ≥ 60 °C, mrożone ≤ −18 °C;
- `time`: żywność gotowana poza kontrolą temperatury przez maksymalnie 2 h;
- `date_mark`: terminy przydatności do spożycia (use-by) blokują, terminy minimalnej trwałości (best-before) ostrzegają;
- `allergen`: blok nieoznaczonych alergenów;
- `nutrient`: ilości na osobodni lub na posiłek;
- `energy_share`: udział energii z wolnych cukrów, tłuszczu, tłuszczów nasyconych, tłuszczów trans lub białka.

Każda reguła to albo `block` (nie akceptuj ani nie serwuj) lub `warn` (dozwolone, odnotowane jako znalezisko).

Domyślny pakiet `who-codex-basic@0.1.0` to **projekt wywodzący się z publicznych wytycznych**: wytycznych WHO dotyczących zdrowej diety, sodu, cukrów i tłuszczów, wytycznych WHO Five Keys to Safer Food, kodeksów Codex dotyczących etykietowania i mrożonej żywności oraz danych Sphere dotyczących planowania minimalnych racji. Jest on uproszczony, nie stanowi porady medycznej, wyklucza żywienie niemowląt i żywienie terapeutyczne i musi zostać sprawdzony przez wykwalifikowany personel. Programy powinny go skopiować i dostosować, ustawić `jurisdiction` oraz zarejestrować, kto go sprawdził, w `reviewedBy`.

Odbiorcy na poziomie H2 uruchamiają pakiet przy każdym przekazaniu i w każdym menu, oraz rejestrują identyfikatory reguł w `findings`. Sprawdzający zgodność raportuje miejsca, w których zadeklarowane i obliczone znaleziska są rozbieżne.

## 7. Ochrona danych

**Profil nie zawiera danych osobowych. Dokumenty NIE MOGĄ zawierać:**

- imiona, numery telefonów, adresy e-mail lub krajowe, uchodźcze lub biometryczne identyfikatory jakiejkolwiek osoby;
- dane na poziomie gospodarstwa domowego lub lokalizacje domów lub osób;
- zdrowie, niepełnosprawność, religia lub narodowość jakiejkolwiek osoby.

**Co niesie zamiast tego:**

- **Tylko organizacje.** Każda strona jest organizacją zidentyfikowaną przez `did:web`, GS1
  Global Location Number (GLN) lub registry id. Ludzie pojawiają się tylko jako role
  (`checkedBy: "trained_staff"`).
- **Tylko agregaty.** `Distribution.people` przechowuje liczby według grup, a każda liczba poniżej 10
  jest raportowana jako `"<10"`.
- **Tylko lokalizacje.** `Site` to teren organizacji lub obszar administracyjny
  (OCHA P-codes), nigdy household.
- **Krótkie notatki.** Wolny tekst jest ograniczony do 280-znakowych notatek operacyjnych i nie może
  zawierać danych osobowych. Implementacje powinny skanować notatki pod kątem numerów telefonów i id
  przed ich zapisaniem.

**Retencja i audyt:**

- **Retention:** każdy uczestnik deklaruje `retentionDays` w swoim `Manifest` i usuwa
  dokumenty po tym czasie.
- **Audit (opcjonalny, `hash_only`):** jeden sequencer na program (zazwyczaj food bank lub
  operator programu) dopisuje SHA-256 hash RFC 8785 canonical JSON każdego dokumentu.
  Treści są przechowywane oddzielnie i pozostają możliwe do usunięcia. Organizacja partnerska
  podpisuje co dzień checkpoint, dzięki czemu historii nie można po cichu nadpisać. Pojedynczy
  sequencer zapobiega forkom w łańcuchu.
- **Hosting** powinien znajdować się w kraju, w którym wymaga tego prawo lub program.

## 8. Transport

### 8.1 API (poziom H1)

| Metoda | Ścieżka | Uwagi |
|---|---|---|
| `POST` | `/offers` | Tworzy ofertę (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Otwarte oferty w pobliżu odbiorcy |
| `POST` | `/offers/{id}/claims` | Zgłasza ofertę; wymagane `If-Match`; 409, gdy już zgłoszona |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; wymagane `If-Match` |
| `POST` | `/handovers` | Rejestruje przekazanie |
| `POST` | `/distributions` | Rejestruje dystrybucję |
| `GET` | `/reports?from=…&to=…` | Agreguje dane za dany okres |

Zasady żądań i transportu:

- **Idempotency:** każdy `POST` zawiera `Idempotency-Key`. Serwery przechowują klucze przez co najmniej 24 h i zwracają oryginalną odpowiedź dla powtórzeń.
- **Authentication:** OAuth 2.1 client credentials, jeden klient na organizację.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  są dostarczane co najmniej raz, z identyfikatorem `id` zdarzenia do deduplikacji oraz numerem sekwencyjnym na ofertę do zachowania kolejności.

### 8.2 Arkusze kalkulacyjne (poziom H0)

Użyj szablonów CSV w `profiles/humanitarian/templates/`. Ich drugi wiersz zawiera hashtagi [HXL](https://hxlstandard.org), dzięki czemu narzędzia do danych humanitarnych mogą je odczytywać bezpośrednio.

### 8.3 SMS (poziom H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

Gramatyka jest zaimplementowana w `tools/cookwala_ref.py` (`parse_sms`) i testowana przez
`conformance/profiles/sms.json`. Słowa kluczowe są w języku angielskim; cyfry arabsko-indyjskie (٠-٩) i perskie (۰-۹)
są akceptowane wszędzie tam, gdzie występuje cyfra, więc telefon ustawiony na dowolną z tych klawiatur będzie działał.

Kody przechowywania: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Znaki daty: `UB` use-by,
`BB` best-before, `HV` harvested, jako `DDMM`. Kody powodów odrzucenia: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; każde inne słowo jest rejestrowane jako `other`. Odpowiedź `HELP` MUSI zawierać jeden przykład na komendę, zwykły tekst ASCII, poniżej 160 znaków.

Bramka MUSI zastosować te kontrole przed zapisaniem dokumentu (`sms_storage_findings` w
referencji; ids to znaleziska blokowe):

| Znalezisko | Kiedy |
|---|---|
| `safety.temp_not_recorded` | `HAND` na linii schłodzonej, mrożonej lub utrzymywanej w cieple nie posiada odczytu `T`: odpowiedz z prośbą o niego, nie pisz nic więcej |
| `safety.hot_hold_min` | `OFFER` z przechowywaniem `H` poniżej 60 °C: odmów umieszczenia go na liście |
| `safety.storage_class_mismatch` | słowa opisujące przedmiot sugerują nabiał, mięso, drób, ryby, jajka lub żywność gotowaną, a przechowywanie to `A`: odmów umieszczenia go na liście |
| `safety.chilled_max`, `safety.frozen_max` | odczyty powyżej 5 °C lub powyżej −18 °C podczas `OFFER` lub przekazania |

Oferty żywności utrzymywanej w cieple kończą się po dwóch godzinach (jedna godzina dla gotowanego ryżu); gateway nigdy nie przechowuje wartości zastępczej. Gateway mapuje zarejestrowany numer nadawcy na organizację, nigdy na osobę w dokumentach.

## 9. Interoperacyjność

| System | Mapowanie |
|---|---|
| HXL | Szablony CSV; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (produkty); `Site.gln` i `OrgId` `gln:` (lokalizacje) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Zagregowane wartości danych na site i okres z `Distribution` (posiłki, osoby według grup, kg, incydenty) |
| WFP SCOPE i inne systemy beneficjentów | **Tylko agregaty.** Żadne rekordy beneficjentów nie przenikają do tego profilu ani z niego |
| Food-rescue apps | Adaptery mapują ich oferty na `Offer`, a ich odbioru na `Claim` i `Handover` |
| Core Cookwala | `Item.ingredientId` i `menu.recipes` łączą się z indeksem przepisów; `relief.ImpactReport` sumuje `Distribution`s |

## 10. Metryki pilotażowe (zdefiniowane tak, aby można było porównywać witryny)

Obliczone do `ImpactSummary` przez `python tools/humanitarian_check.py --summary DIR`. Jak przeprowadzany i oceniany jest pilot: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metryka | Definicja |
|---|---|
| Kg uratowane | Suma `Handover.kgAccepted` na pierwszym etapie od darczyńców |
| Wskaźnik zgłoszeń | Oferty, które osiągnęły stan `claimed` ÷ utworzone oferty |
| Czas do zgłoszenia | Mediana minut od utworzenia `Offer` do stanu `claimed` |
| Odrzucenie według powodu | Suma `kgRejected` według `reason` |
| Wydane posiłki | Suma `Distribution.meals` |
| Wskaźnik zgodności żywieniowej | Dystrybucje z menu i brakiem wyników `nutrition.*` ÷ dystrybucje z menu |
| Koszt na posiłek | (żywność + transport + personel + energia) ÷ posiłki |
| Minuty wolontariusza na 100 kg | `volunteerMinutes` ÷ (kg użyte ÷ 100) |
| Bezpieczeństwo | Liczba wyników blokad `safety.*` oraz `safetyIncidents` |

## 11. Bezpieczeństwo

- **Podpisy są opcjonalne na H1** i wymagane do audytu międzyorganizacyjnego na H3
  (EdDSA, klucze opublikowane w `did:web` organizacji).
- **Notatki i nazwy w dokumentach to dane niepewne.** Oprogramowanie i agenci AI nigdy nie mogą
  traktować ich jako instrukcji.
- **Rule packs są wersjonowane i przypięte** (`id@version`) w każdym znalezisku, dzięki czemu wyniki są
  powtarzalne.

## 12. Celowo pominięte

- Rejestracja beneficjentów, kwalifikowalność i targetowanie (należą one do własnych, chronionych systemów programu).
- Płatności: Cookwala nigdy nie przesyła pieniędzy.
- Przepisy i wykonanie przez robota (podstawowa specyfikacja). Profil jedynie wymienia przepisy i raportuje składniki odżywcze.
- Żywienie medyczne i terapeutyczne.

## 13. Jak dokonać przeglądu

Proszę otwierać zgłoszenia (issues) na [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
z etykietą `humanitarian`. Te recenzje są najbardziej użyteczne:

- personel ds. bezpieczeństwa żywności sprawdzający rule pack oraz powody odrzuceń;
- operatorzy food-bank sprawdzający cykl życia oraz przepływ SMS;
- inspektorzy ochrony danych sprawdzający sekcję 7.

