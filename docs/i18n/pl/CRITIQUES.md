<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# Krytyki, które opublikowaliśmy

Zadaliśmy trudne pytania dotyczące Cookwala i spisaliśmy odpowiedzi. Każda obawa posiada id
w [action plan's concern register](ACTION-PLAN.md#2-concern-register), wraz z naszą
odpowiedzią i jej statusem. Recenzje z zewnątrz są mile widziane i będą tu wymienione.

## Czy to będzie działać? (strategy)

| Obawa | Krótka odpowiedź | Status |
|---|---|---|
| Rynek jeszcze nie istnieje; specyfikacja wyprzedza produkty | Small Core, najpierw demo, brak nowej specyfikacji bez użytkowników | Core 0.2 gotowe; device demo next |
| Nikt wpływowy nie ma powodu, aby to przyjąć | Prowadzenie poprzez korzyści każdego adoptującego; użyteczne bez robotów | Poszukiwany pilot food-bank i partner device |
| Symulatory dowodzą tego, co zakładają | Sprawiedliwa baza, zakresy, etykiety "illustrative"; pilotaże je zastępują | Open |
| Głód wynika z ubóstwa i konfliktów, a nie z surplus | Cookwala przyczynia się; nie twierdzi, że samotnie zakończy głód | Message changed |
| Bezpieczeństwo, odpowiedzialność i powierzchnia ataku | Limity wymuszane na urządzeniu; refusal; recalls; raporty incydentów | Spec done; certifier review open |
| Prywatność (dane dotyczące zdrowia i religii, rejestry vs usuwanie) | Local-first, selektywne ujawnianie, logi tylko z hashami, zgoda | Spec done; impact assessment open |
| Zbyt złożone | Core 0.2; wszystko inne oznaczone jako eksperymentalne | Done |
| Zależność od założyciela | Ścieżka governance do neutralnego domu | GOVERNANCE.md |

## Czy projekt techniczny jest poprawny?

| Obawa | Co zmieniło się w Core 0.2 |
|---|---|
| Operacje nie miały fizycznego znaczenia | Envelopes, poziomy ciepła, sensor ladders, zasada wysokości, wektory testowe |
| Błędy w jednostkach i liczbach | Tylko °C, tolerancje bezwzględne, jednostki kuchenne, gęstości, pieniądze z dziesiętnikami |
| Schematy akceptowały literówki | Ścisłe schematy z rozszerzeniami `x-`; offline bundle |
| Jeden zmienny dokument Mission | Event log + projekcja, pojedynczy sequencer, tabela przejść |
| Księga wieczysta dawała niewiele | Kluczowe rekordy z cofnięciem, świadkowane punkty kontrolne, wykrywanie nadpisywania |
| Niezdefiniowane dostarczanie zdarzeń; bezpieczeństwo w szynie | Numery sekwencyjne, klasy opóźnień, heartbeats, "safety is local" |
| Dryf powierzchni API | Core OpenAPI; każda referencja sprawdzana w CI |
| Brak weryfikatora | Biblioteka referencyjna i 106 wektorów conformance |

## Recenzje, o które prosimy

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), naukowcy ds. żywności
(envelopes), urzędnicy ds. bezpieczeństwa żywności i dietetycy (rule packs), audyt bezpieczeństwa,
przegląd ochrony danych oraz analiza luk przeprowadzona przez certyfikatora. Zobacz
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

