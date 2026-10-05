<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Format przepisu Cookwala: przepisy współpracujące z Misjami

Przepis w Cookwala to nie lista instrukcji. To **przenośna wiedza kulinarna**, którą planista *kompiluje* w odniesieniu do konkretnej Misji (household, roboty, urządzenia, energia, budżet, zdrowie, czas) w wykonalny plan. Robot następnie uruchamia ten plan, adaptując się poprzez contingencies i playbooks, gdy rzeczywistość ulega zmianie.

Schemat: [`recipe.schema.json`](../schemas/recipe.schema.json). Pełny przykład roboczy:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Cztery warstwy (zaadaptowane z podejścia WHO SMART Guidelines)

| Warstwa | Co zawiera | Kto to tworzy | Gdzie to znajduje się |
|---|---|---|---|
| **R1 Narrative** | Tekst przepisu, historia, uwagi kulturowe, zdjęcia | Kucharze, szefowie kuchni, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | Czym danie *jest* i *musi być*: tożsamość (istotna vs elastyczna), cele sensoryczne, wartości odżywcze, sposób podania i jedzenia, przechowywanie, kontrole akceptacji | Redaktorzy przepisów, wspomagane przez AI, recenzowane | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Metoda niezależna od urządzenia: formuła (proporcje + role), graf procesu typowanych operacji z warunkami pre/post stanu żywności, warunki `until`, alternatywy, reguły pauzy, tryby awarii, affordances, zagrożenia, CCPs, przygotowanie środowiska | Potok eksportu + recenzja; zweryfikowane przez symulator (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | Przepis R3 skompilowany dla *tej* Misji: dokładne ilości, wybrane warianty, przypisani aktorzy i urządzenia, harmonogram, leasingi, monitory, sytuacje awaryjne | Planista/kompilator, w czasie uruchomienia | Wewnątrz **Mission** (`plan`), nigdy w katalogu |

Jak kod źródłowy i kompilator: **przepis to przenośna reprezentacja pośrednia (R3 + R2). Misja to maszyna docelowa.** To sprawia, że przepisy pozostają ważne, gdy zmieniają się roboty i AI: lepszy planer produkuje lepsze R4 z tego samego przepisu.

## 2. Co robi każda sekcja w Misji

| Sekcja przepisu | Używane przez Misję do… |
|---|---|
| `identity.essential / flexible / neverAdd` | Substytucje, tryby budżetowe i racjonowania, adaptacje diety: zmień części `flexible`, nigdy `essentials`, aby danie pozostało sobą |
| `formula` (ratios, min/max, role, scaling) | Dokładne skalowanie na dowolną liczbę osób, racjonowanie składników na tydzień, rozciąganie budżetu, wykorzystanie tego, co jest pod ręką (przeskalowanie ze względu na ograniczający składnik) |
| `sensory` | Punkty kontrolne wzroku, aromatu i smaku; profile smaku w `household context` (sól 2 vs 4); decyzje o zmianie przeznaczenia i naprawie |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Zadania przygotowania środowiska:** jeśli zlew lub płyta grzewcza są zajęte, planer dodaje zadania "wyczyść, umyj, osusz"; zadania moczenia lub rozmrażania są planowane z wyprzedzeniem wielu godzin |
| `process.nodes[]` z `pre`/`post` stanami żywności | Planowanie (rozpocznij tylko to, co jest gotowe), weryfikacja (czy krok wyprodukował dany stan?), wznowienie po przerwach |
| `until`, `onTimeout`, `retry` | Wiedza o tym, kiedy krok jest zakończony i co zrobić, gdy nie jest |
| `alternatives[]` + `energy` | Gaz vs indukcja vs piekarnik, oszczędzanie baterii, kuchnie bez piekarnika, godziny ciszy |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Przerwy:** dziecko potrzebuje pomocy, właściciel dzwoni, pies coś przewraca. Robot wprowadza krok w jego `safeState`, obsługuje zdarzenie, a następnie wznawia, podgrzewa, ratuje lub wyrzuca na podstawie `pause` budget |
| `failureModes` (incident, detect, prevent, playbook) | Wczesne wykrywanie znanych problemów i dokładny `playbook` w celu odzyskania |
| `affordances`, `space` | Dopasowanie kroków do robotów, które mogą chwytać, podnosić i sięgać; trzymanie gorących stref z dala od dzieci |
| `safety` (hazards, CCPs, supervision, abort) | Jądro bezpieczeństwa: niezmienniki, które każdy plan musi zachować |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Serwowanie: co trafia na stół, do pokoju, do lunchboxa; przypomnienia i limity oczekiwania; kulturowy styl jedzenia |
| `storage` | Resztki, Misje typu cook-ahead i lunchbox |
| `acceptance` | *Testy* przepisu: Misja jest zakończona, gdy te warunki są spełnione |
| `nutrition`, `cost` | Porcje osobiste, budżet, racje pomocowe |

## 3. Przykład: jeden krok ze wszystkim dołączonym

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. Kompilowanie przepisu dla Misji (co robi planner)

1. **Wybierz wariant:** dieta, tekstura (IDDSI), sprzęt, wybór energii i trybu z
   `alternatives`. Elementy tożsamości muszą zostać zachowane.
2. **Skaluj:** na podstawie `formula` i liczby porcji, porcji na osobę (HEALTH.md),
   składnika ograniczającego lub horyzontu racjonowania. Przyprawy sublinearnie, czas poprzez wykładnik masy.
3. **Zastąp** w ramach ról, szanując `identity.neverAdd`, alergeny, pakiety dietetyczne
   i inwentarz.
4. **Przygotuj środowisko:** porównaj `prep` z aspektami przestrzeni Misji (zlewozmywak pełny?
   płyta zajęta? deska brudna?) i dodaj zadania sprzątania, mycia, suszenia i przygotowania. Zaplanuj
   `advanceTasks` (namaczanie, rozmrażanie, marynowanie, nagrzewanie wstępne).
5. **Powiąż:** przypisz każdy węzeł do robotów, urządzeń lub ludzi na podstawie możliwości i
   kompetencji. Wynajmij palniki, naczynia i strefy. Podłącz monitory (inteligentny garnek, przewidywany czas
   dostawy, czujnik dymu).
6. **Zaplanuj** wstecz od czasu podania, szanując budżety przerw, limity baterii i energii,
   domowe godziny ciszy i okna współdzielenia kuchni.
7. **Dołącz sytuacje awaryjne:** reguły `failureModes` i `pause` każdego węzła, plus
   globalne polityki Misji (przerwy, dziecko lub zwierzę przy płycie, strażnik kuchenki,
   nadzór nad psuciem się żywności).
8. **Zweryfikuj:** schemat + sprawdzenia semantyczne, pakiety polityk, pokrycie CCP, simulator dry-run,
   inwarianty stosu priorytetów (PROTOCOL §7.2).
9. **Wygeneruj R4** do `plan` Misji, podpisz go i przekaż robotowi.

## 5. Tworzenie i konwersja

- **Z fifi.cooking:** potok EXPORT-FIFI generuje R1 + R2 + R3. Nowe
  sekcje (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  są generowane przez lokalne modele z istniejącego tekstu i sprawdzane przez walidatory oraz
  próbkową recenzję ludzką.
- **Z sieci:** `cookwala convert --from schema-org` → R1/R2 (V0), a następnie to samo
  wzbogacanie.
- **Do innych formatów:** schema.org Recipe (R1/R2 dla wyszukiwarek), Cooklang (edycja
  ludzka), PDDL lub logika temporalna (planery badawcze) mogą zostać wygenerowane z R3.
- **Ręcznie:** `cookwala init recipe` tworzy szkielet wszystkich warstw; `cookwala validate` i
  `cookwala simulate` sprawdzają je.
- **Wersjonowanie:** rewizje są niezmienne i hashowane. Forki rejestrują `meta.derivedFrom`.
  **Patche** przepisów (z playbooków lub informacji zwrotnej) są proponowane jako diffy i promowane dopiero
  po recenzji i dowodach.

## 6. Język tekstu kroku

Zdania kroków są pisane najpierw dla osoby, a następnie analizowane przez maszynę. Tekst kroku w języku arabskim w przykładowych przepisach używa trybu rozkazującego w rodzaju żeńskim (قطّعي، سخّني), co jest powszechną egipską konwencją w książkach kucharskich; jest to świadomy wybór, a nie przeoczenie, i wydawca może zamiast tego użyć neutralnego płciowo biernego (تُقطَّع البصلة). Pola `op`, `params` i `until` niosą znaczenie; zdanie jest przeznaczone dla kucharza.

## 7. Dlaczego to pozostaje odporne na przyszłość

- Przepisy opisują **wyniki i ograniczenia żywności, a nie ruchy**. Nowe roboty i nowa AI
  generują lepsze plany R4 z tego samego R3.
- Wszystkie nowe sekcje są **opcjonalne i addytywne**. Przepis V0 (tylko R1) nadal działa
  przy kierowanym gotowaniu przez człowieka; każda dodana warstwa odblokowuje większą automatyzację.
- Nieznane pola `x-` są przekazywane dalej. Dostawcy, szefowie kuchni i organy zdrowia mogą rozszerzać przepisy
  bez zakłócania pracy innych.
- **Sprawdzenia akceptacji** pozwalają każdemu wykonawcy, człowiekowi lub robotowi, udowodnić, że danie wyszło prawidłowo,
  co jest sposobem, w jaki przepisy wchodzą na poziom V3 dzięki dowodom polowym.

