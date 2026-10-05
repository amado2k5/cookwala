<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->

# Nadwyżki rolne i sygnały podaży

> **Status: experimental** (RFC-0007). Schemat: `schemas/supply.schema.json`. Przykłady:
> `examples/supply/`. **Brama:** przegląd pod kątem prawa konkurencji przed jakimkolwiek użyciem produkcyjnym
> (`docs/ACTION-PLAN.md`, obawa C7). cookwala.ai nie publikuje dziś żadnych sygnałów.

## 1. Dwie rzeczy, których rolnicy potrzebują now

1. **Sposób na wymienienie nadmiaru, zanim zgnije.** Gospodarstwo rolne jest dawcą w Humanitarian Profile:
   `Offer` z `Item.origin: farm` oraz `harvestedAt`, lub przez SMS:

   FARM 120KG TOMATO A BB0411
   ```

food bank to zgłasza, kuchnia to gotuje, dystrybucja to liczy. Żadnego nowego dokumentu,
   żadnych danych osobowych, tylko organizacje.
2. **Rzetelny sygnał tego, co będzie potrzebne.** To jest część eksperymentalna poniżej.

## 2. Sygnały popytu i podaży

| Dokument | Mówi | Reguły |
|---|---|---|
| `DemandSignal` | W regionie R, w tygodniu ISO W, kuchnie i programy planowały zużyć między L a H kg składnika **klasy** C | co najmniej 20 przyczyniających się źródeł; opublikowane co najmniej 7 dni po zakończeniu tygodnia; poziom klasy (strączkowe, warzywa liściaste, drób), nigdy produkt lub marka; **brak cen**; region nie dokładniejszy niż admin1, chyba że występuje 100 lub więcej źródeł |
| `SupplySignal` | W regionie R, w tygodniu W, klasa C ma nadwyżkę, podaż normalną lub niedobór, z oknem zbiorów | opublikowane przez spółdzielnię, program lub operatora rynku; **otwarte dla wszystkich**: publiczne, bezpłatne, identyczne dla każdego czytelnika |

Sprawdzenie referencyjne to `check_signal()` w `tools/cookwala_ref.py`; wektory profilu (`conformance/profiles/signal.json`) pokazują, co jest akceptowane, a co odrzucane.

## 3. Dlaczego te reguły

Udostępnianie prognoz między konkurentami to wymiana informacji, przed którą ostrzegają organy antymonopolowe. Agregacja, opóźnienie, poziom klas, brak cen i otwarta publikacja sprawiają, że sygnał pozostaje użyteczny dla planowania, a bezużyteczny dla koordynowania cen. Progi są punktami wyjścia; powinni je ustalić doradca i statystyk.

## 4. W co zmienia się pomysł założyciela

Pętla makro (RFC-0007): planowane gotowanie → zagregowany popyt →
gospodarstwa i sklepy planują zapotrzebowanie → mniej uprawiane, transportowane i wyrzucane. Symulatory miasta, kraju i
świata pokazują wielkość efektu w oparciu o swoje założenia (ilustracyjne, nie
prognoza). Te dwa dokumenty są najmniejszym uczciwym krokiem w tym kierunku.

## 5. Later

Porady dotyczące planowania na podstawie prognozowanego popytu; wielkość rezerw (doskonale szczupły łańcuch dostaw jest
kruchy); międzyregionalne przepływy pomocy; sygnały dostaw przez SMS od spółdzielni.

