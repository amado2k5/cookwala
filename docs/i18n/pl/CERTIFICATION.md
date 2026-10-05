<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->

# Conformance i droga do certification

**Status:** draft, 2026-10-04 (RFC-0008). Żaden certyfikator nie został jeszcze zaangażowany; to jest ścieżka,
którą oferuje standard.

## 1. Trzy kroki

| Krok | Kto | Co to oznacza | Wyświetlane jako |
|---|---|---|---|
| **Self-declared** | Producent lub wydawca | Uruchomił publiczne wektory za pomocą publicznego narzędzia i opublikował `ConformanceReport` (`schemas/conformance.schema.json`), podpisany własnym kluczem | raport, wraz z zestawami i licznikami; nigdy jako odznaka |
| **Verified** | Operator registry | Powtórzył uruchomienie względem tego samego hasha zestawu wektorów i kontrasygnował raport | raport plus verifier |
| **Certified** | Niezależny certyfikator (obecnie nie istnieje) | Przeprowadził sprawdzenie zestawu oraz sprzętu i safety-case zgodnie z opublikowanym schematem i przyznał znak | raport, certyfikator, znak |

Raport, który nie spełnia któregokolwiek wektora klasy, nie może rościć sobie prawa do tej klasy. registry pokazuje
raporty, a nie odznaki.

Dzisiaj jedynym operatorem registry jest utrzymujący specyfikację (cookwala.ai), więc „verified” nie dodaje żadnej niezależności, dopóki nie powstanie drugie registry; status jest nadal wyświetlany jako self-verification.

## 2. Co zawiera raport

Wersja rdzenia, deklarowana klasa (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) lub deklarowany profil (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), podmiot (produkt, dostawca, wersja), uruchomione zestawy wraz z sumami i nieudanymi
id wektorów, hash zestawu wektorów, narzędzie i commit, data, status i
verifier. Przykład: `examples/conformance/report-reference.json`, wygenerowany przez

```bash
python tools/run_conformance.py --report report.json
```

## 3. Klasy i to, co dowodzą

| Klasa | Wektory | Również wymagane do certification (nieobjęte przez wektory) |
|---|---|---|
| Recipe publisher | hash, envelope (cele wewnątrz pasm), units | content review przepisów przez specjalistę ds. bezpieczeństwa żywności |
| Executor | envelope, sensor ladder, przejścia wykonania, powody refusal before heat | własny safety case urządzenia (ISO 13482, IEC 60335, UL 3300 w zależności od zastosowania); zmierzona lokalna latencja zatrzymania; limity bezpieczeństwa wymuszane bez sieci |
| Catalog | hash, signature, unieważnienie klucza, recalls | proces przechowywania kluczy i przyjmowania incydentów |
| Agent | untrusted text, zakres mandate (agent-safety benchmark) | wyniki opublikowane dla każdego modelu wraz z metodą |
| Verifier | wszystkie zestawy Core | brak |
| Humanitarian H0–H3 | gramatyka SMS, maszyna stanów, rule packs | przegląd odpowiedzialności za dane; brak audytu danych osobowych |
| Household | polityka ujawniania informacji | ocena skutków dla ochrony danych |
| Registry | zasady nazw i wersji, tombstones | proces dowodzenia przestrzeni nazw |

## 4. Czego certification nie może obiecać

Raport conformance dowodzi, że oprogramowanie zachowywało się zgodnie z wymaganiami wektorów w dniu, w którym zostało uruchomione.
Nie dowodzi on, że urządzenie jest bezpieczne w każdej kuchni, że przepis smakuje odpowiednio lub że
nie może dojść do żadnej szkody. Standard obiecujący zero szkód byłby nieuczciwy; ten obiecuje,
że limity są egzekwowane lokalnie, że refusal before heat ma miejsce i że zapisy mogą być
sprawdzane.

## 5. Zarządzanie znakiem

Oznaczenie certification i jego zasady przechodzą do neutralnej fundacji wraz ze znakiem towarowym (`GOVERNANCE.md`). Do tego czasu żadne oznaczenie nie istnieje; istnieją tylko raporty.

