<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->
# Kuchnie i cykle produkcyjne: restauracje, społeczności, szkoły, kuchnie kryzysowe i robotyczne

> **Status: experimental profile** (RFC-0005). Schemat: `schemas/fleet.schema.json`.
> Przykłady: `examples/fleet/`.

## 1. Dlaczego

Założyciel poprosił o ten sam protokół w restauracji, na weselu, podczas zbiórki darów lub w fabryce żywności (RFC-0005). Brief dodaje programy posiłków szkolnych i kuchnie kryzysowe. Core obejmuje gotowanie jednej receptury przez jedno urządzenie; Humanitarian Profile obejmuje przemieszczanie surplus oraz liczenie posiłków. Pomiędzy nimi znajduje się **kitchen**: stanowiska, urządzenia, ludzie, wiele partii, okno wydawania, krytyczne punkty kontrolne oraz powiązanie z execution log urządzenia z posiłkami, które raportuje program.

## 2. Dokumenty

| Dokument | Co mówi |
|---|---|
| `Kitchen` | Kuchnia organizacji: typ, stanowiska (przygotowanie, płyta, piekarnik, frytkownica, czajnik, komórka robotyczna, nakładanie, pakowanie, utrzymywanie ciepła, chłodzenie, magazyn chłodniczy, mycie), urządzenia jako referencje możliwości, wydajność w posiłkach na godzinę, sprzęt do utrzymywania ciepła i chłodzenia, obowiązujące rule packs, **liczba pracowników według ról**, godziny pracy |
| `ProductionRun` | Przepisy z liczbą partii i porcji, okno wydawania, przypisania do każdego kroku przepisu do stanowiska oraz do `device`, `person` lub obu, zapisy krytycznych punktów kontrolnych (temperatura rdzenia gotowania, utrzymywanie ciepła, chłodzenie dwuetapowe, odgrzewanie, przechowywanie w niskiej temperaturze, segregacja alergenów), wyprodukowane wykonania Core oraz wynik (wyprodukowane i wydane posiłki, odpady, wykorzystane uratowane jedzenie, awarie, incydenty, energia, koszt, emitowana przez niego Humanitarian `Distribution`) |
| `StationLease` | Wyłączne użytkowanie stanowiska przez `device` lub rolę przez określony czas |

## 3. Jak łączy się z resztą

- Krok przypisany do `device` to Core `ExecuteRequest` (lub cel `ExecuteNode` poprzez powiązanie z ROS 2); jego hash `ExecutionLog` trafia do `executions`.
- Uruchomienie (run) służące programowi emituje Humanitarian `Distribution`; `ccps` uruchomienia są dowodem (evidence) stojącym za wynikami dotyczącymi bezpieczeństwa dystrybucji.
- Rule packs z Humanitarian Profile mają zastosowanie do menu i pozycji uruchomienia.
- Dyspozycja floty (któty robot gdzie jedzie) należy do Open-RMF lub menedżera floty dostawcy, a nie do tego profilu.

## 4. Przykład obliczeniowy

`examples/fleet/kitchen-disaster.json` i `production-run-disaster.json`: kuchnia pomocowa
z dwoma kotłami gazowymi, jednostkami hot-hold i kąpielą lodową produkuje 710 posiłków z zupy z soczewicy i
ryżu w dwugodzinnym oknie czasowym, rejestruje temperatury gotowania i hot-hold, znajduje jedną jednostkę hot-hold
poniżej 60 °C i podgrzewa tę partię przed podaniem, oraz emituje distribution. Przykład ma charakter
ilustracyjny; nie opisuje żadnej prawdziwej kuchni ani zdarzenia.

## 5. Co zostało celowo pominięte

Imiona i harmonogramy pracowników, płace, zamówienia i płatności klientów, ceny w menu. Pracownicy pojawiają się jako liczby według ról, dzięki czemu koszt posiłku może zostać obliczony bez identyfikowania kogokolwiek.

## 6. Next

Przykład obsługi restauracji ze stacją robota; zestaw conformance dla maszyny stanów run; unifikacja `StationLease` z dzierżawami sesji (`session.schema.json`).

