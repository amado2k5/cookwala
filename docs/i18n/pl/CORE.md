<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. To jest część normatywna Cookwala. MUST, SHOULD i MAY
zgodnie z RFC 2119. Wszystko, co nie jest wymienione tutaj, jest opcjonalnym **profile** (sekcja 10).

Urządzenie powinno być w stanie wdrożyć Core w około tydzień. Core określa **co zrobić, kiedy jest gotowe i co nigdy nie może się wydarzyć**. Nie określa, jak porusza się robot.

## 1. Klasy conformance

| Klasa | Musi implementować |
|---|---|
| **Recipe publisher** | Ważne dokumenty `recipe.schema.json`; temperatury wewnątrz operation envelopes; hash i podpis |
| **Executor** (robot, urządzenie lub hub) | Core API (`api/core.openapi.yaml`); operation envelopes i sensor ladders; lokalne limity bezpieczeństwa; refusal zamiast zgadywania; execution log |
| **Catalog** | Podpisane przepisy, `/.well-known/cookwala.json` z kluczowymi rekordami, recall feed, przyjmowanie incydentów |
| **Agent** (AI lub oprogramowanie działające w imieniu osoby) | Działa wyłącznie na podstawie `AgentMandate`; traktuje tekst dokumentu jako dane; pyta mocodawcę przed czymkolwiek w `confirmBefore` |
| **Verifier** | Hashe, podpisy, ważność i cofanie kluczy, ujawnienia, łańcuchy zdarzeń i punkty kontrolne |

Zgłoszenie klasy oznacza przejście jej wektorów conformance (`conformance/`, uruchom z
`tools/run_conformance.py`).

## 2. Dokumenty podstawowe

| Dokument | Schemat |
|---|---|
| Przepis | `recipe.schema.json` |
| Możliwości urządzenia | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Wspólne typy (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Zdarzenia | `event.schema.json` (CloudEvents) |
| Słowniki: operacje, jednostki i poziomy ciepła, incydenty | `vocab/*.json` |

Wszystkie schematy są **strict**: nieznane pola są odrzucane, z wyjątkiem rozszerzeń `x-<vendor>-…`.
Czytelnicy ignorują pola `x-`, których nie rozumieją. `tools/bundle_schemas.py` generuje pojedynczy
bundle, aby urządzenia mogły przeprowadzać walidację offline. Implementacje NIE MOGĄ pobierać schematów w czasie uruchomienia.

## 3. Co oznaczają operacje

- **Envelopes.** Każda operacja oparta na cieple lub niebezpieczna w `vocab/ops.json` posiada `envelope`.
  Określa ona:
  - medium (woda, olej, powietrze, powierzchnia patelni, produkt…);
  - jej zakres temperatur w °C (oraz ciśnienie, w przypadku gotowania pod ciśnieniem);
  - mieszanie, pokrywka, poziom uwagi oraz to, czy krok może być wykonywany bez nadzoru;
  - zagrożenia;
  - metodę testową.

Przykład: `cw.op.simmer` = ciecz na bazie wody w 85–96 °C; `cw.op.deep_fry` = olej w 160–190 °C.
- **Cele wewnątrz operation envelope.** Cel przepisu (`params.tempC` lub `target` na sensorze
  medium) MUSI znajdować się wewnątrz envelope. Walidator odrzuca przepisy, które to naruszają.
- **Executorzy utrzymują medium wewnątrz operation envelope.** Jeśli przepis podaje węższy cel,
  utrzymują go również w jego obrębie, gdy zostanie on po raz pierwszy osiągnięty.
- **Wysokość.** Pasma wody i pary przesuwają się o −1 °C na każde 300 m wysokości kuchni.
- **Poziomy ciepła** (`very_low` … `max`) mają jedno wspólne znaczenie: pasmo powierzchni patelni w °C,
  zdefiniowane w `vocab/units.json`.
- **Sensor ladder.** Każde envelope wymienia sposoby weryfikacji kroku, najlepiej w tej kolejności: konkretny sensor,
  następnie `model` (zarejestrowany szacunek), następnie `time`, a na końcu `human`.
  - Executor wykorzystuje pierwszy szczebel, który może spełnić, i zapisuje go w `verifiedBy`.
  - Jeśli nie może spełnić **żadnego** szczebla, MUSI odmówić wykonania kroku (`missing_sensor_no_fallback`).
  - Operacje wymagające stałej uwagi i nie mogące być wykonywane bez nadzoru (podsmażanie, obsmażanie,
    smażenie, redukowanie, karmelizowanie…) nigdy nie przechodzą wyłącznie na time: ich ostatnim szczeblem jest osoba
    obserwująca.
  - Deep frying nie ma fallbacku: brak sensora temperatury oleju oznacza brak deep frying.
  - `Condition` może zawęzić to za pomocą `onSensorMissing`.
- **Refusal, a nie zgadywanie.** Executor, który nie może spełnić limitów envelope, ladder, sprzętu
  lub bezpieczeństwa dla danego kroku, MUSI odpowiedzieć `refused` wraz z powodem przed rozpoczęciem.

## 4. Liczby i jednostki

- **Temperatury to °C na przewodzie.** Wyświetlacze mogą dokonywać konwersji.
- **Tolerancje.**
  - `tolerance` jest relatywna i dozwolona tylko dla jednostek w skali ilorazowej.
  - `toleranceAbs` jest absolutna w jednostce wartości i jest jedyną tolerancją dozwoloną dla °C.
  - `Target.tolerance` jest absolutna.
- **Jednostki kuchenne mają dokładne wartości metryczne:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Objętość ↔ masa wymaga gęstości** (`Quantity.densityGPerMl`, lub słownika składników);
  bez niej występuje błąd, nigdy nie przypuszczenie.
- **Pieniądze to ciąg dziesiętny** (`"12.70"`) z walutą ISO 4217, nigdy float.

## 5. Integralność i zaufanie

- **Hash.** `sha256:` plus hex digest RFC 8785 canonical JSON dokumentu,
  bez jego pól `hash` i `signature`. Referencyjny canonicalizer reprodukuje przykład RFC
  8785 dokładnie.
- **Signature.** Ed25519 (`EdDSA`) nad ciągiem znaków ASCII hash. `ES256` jest dozwolone dla sprzętowych
  kluczy P-256. `kid` nazywa `KeyRecord`.
- **Keys.** `KeyRecord` podaje klucz publiczny, jego właściciela, okno ważności oraz `revokedAt`.
  Podpis, którego `signedAt` przypada po cofnięciu, lub poza oknem ważności, jest
  nieważny.
  - Katalogi publikują swoje klucze w `/.well-known/cookwala.json`.
  - Organizacje i osoby publikują swoje w dokumentach did:web.
  - Urządzenia publikują swoje w swoim dokumencie capabilities.
  - Weryfikatorzy przechowują rekordy kluczy w pamięci podręcznej do użytku offline.
- **Selective disclosure.** Podpisany dokument może zawierać digest `Disclosure`,
  `sha256(JCS([salt, value]))`, zamiast wrażliwej wartości. Posiadacz ujawnia salt i
  value tylko stronomom uprawnionym do ich zobaczenia, a podpis nadal jest weryfikowalny.
- **Event logs** (Mission profile):
  - Jeden sequencer na log przypisuje `seq` oraz `prev`, dzięki czemu łańcuch nigdy się nie rozwidla.
  - Checkpoints są podpisywane przez sequencer i kontrasygnowane przez świadków, którzy mogą obejmować
    usługę transparency, taką jak IETF SCITT. Przepisanie po świadkowanym checkpoint jest
    wykrywalne.
  - W trybie `hash_only`, payloady znajdują się w pamięci masowej z możliwością usuwania, a log przechowuje tylko ich hashe.

## 6. Zasady bezpieczeństwa i agenta (normatywne)

1. **Bezpieczeństwo jest lokalne.** Wykonawcy wymuszają pakiet `SafetyLimits` na urządzeniu.
   - Żaden przepis, agent, wiadomość zdalna, rozszerzenie ani tryb operacyjny nie może podnieść ani wyłączyć limitu.
   - Surowszy limit zawsze wygrywa.
   - `profiles/core/safety-limits.default.json` to roboczy punkt wyjścia, który producenci urządzeń
     zaostrzają na podstawie własnego przypadku bezpieczeństwa.
2. **Lokalne zatrzymanie.** Kontrola zatrzymania na urządzeniu zatrzymuje ruch w ciągu 0.5 s i odcina ciepło w ciągu
   1 s, z siecią lub bez niej. `POST …/stop` nigdy nie jest odrzucany ze względu na autoryzację, gdy
   wywołujący może dotrzeć do wykonawcy.
3. **Zdarzenia raportują; nigdy nie chronią.** Zdarzenia `cookwalalatency: local_safety` raportują to, co
   urządzenie już zrobiło. Żadna funkcja bezpieczeństwa nie może zależeć od nadejścia zdarzenia.
4. **Niezaufany tekst.** Każde pole tekstowe (oznaczone `x-cookwala-untrusted`) jest danymi, a nie
   instrukcją, zarówno dla oprogramowania, jak i agentów AI. Próby wydawania instrukcji poprzez tekst są
   ignorowane i logowane (`cw.incident.untrusted_instruction`).
5. **Agenci działają na podstawie mandatu.** Żądanie wysłane przez agenta zawiera `AgentMandate` podpisany
   przez mocodawcę: zakresy, limity wydatków, dozwolonych dostawców, datę wygaśnięcia oraz działania wymagające
   potwierdzenia.
   - `irreversible` i `safety_override` zawsze wymagają potwierdzenia, niezależnie od tego, co mówi mandat.
   - Wykonawcy odrzucają żądania spoza mandatu (`mandate_scope`).
6. **Operacje bez nadzoru wymagają osoby.** Operacje, których envelope wskazuje `unattended: false`,
   wymagają obecności osoby odpowiedzialnej lub możliwości kontaktu z nią w ciągu jednej minuty.
7. **Blokady alergenów odrzucają.** Każdy zablokowany alergen w przepisie lub inwentarzu odrzuca
   żądanie; nie ma możliwości obejścia blokady poprzez substytuty.
8. **Recalls.** Katalogi publikują podpisane recalls pod adresem `GET /v1/recalls`. Wykonawcy sprawdzają je, gdy są online,
   i odrzucają wycofane rewizje. `block_and_stop_running` bezpiecznie zatrzymuje również trwające egzekucje.
9. **Raporty o incydentach** są anonimowe (`IncidentReport`: tylko data, bez nazwisk ani id) i
   przesyłane do katalogów, aby każdy producent mógł uczyć się na każdym zdarzeniu typu near miss.

## 7. Cykl życia wykonania i API

- **API:** `api/core.openapi.yaml`. Jego punkty końcowe to:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - strona katalogu: `GET /v1/recalls`, `POST /v1/incidents`.
- **Stany:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` i `stopping` → `stopped` w trakcie;
  - `refused` i `failed` są końcowe.
  - Pełna tabela przejść znajduje się w `core.schema.json#/$defs/ExecutionState` oraz wektorach conformance.
- **Reguły żądań:**
  - Każdy POST zawiera `Idempotency-Key`.
  - Zmiany istniejącego execution zawierają `If-Match: <seq>`; niezgodność zwraca 412.
  - Stop nie wymaga If-Match.
- **Zdarzenia:**
  - Dostarczanie odbywa się co najmniej raz (at least once).
  - `id` w CloudEvents jest kluczem deduplikacji.
  - `cookwalaseq` porządkuje zdarzenia według podmiotu i dopasowuje status `seq`.
  - Urządzenia emitują `cookwala.device.heartbeat`, więc hub może wykryć utracone urządzenie i przejąć zadanie.

## 8. Prywatność

- **Execution logs nie zawierają danych osobowych** (`privacy.personalData: "none"`).
- **Opuszczają urządzenie tylko za zgodą opt-in** (`consent.dataset`: `none` domyślnie,
  `research_only`, lub `open`). Zgodę można wycofać.
- **Open datasets uogólniają czasy do skali dnia.**
- **Dane dotyczące household, zdrowia i religii pozostają w domu**, chyba że osoba zdecyduje inaczej.
  Gdy muszą zostać przesłane, są przesyłane jako selective disclosures.
- **The Humanitarian Profile** nie zawiera w ogóle danych osobowych.

## 9. Wersjonowanie i rozszerzenia

- **Wersje Core to `0.2.x`.**
  - Czytnicy akceptują dowolny patch swojej wersji minor.
  - Odrzucają inne wersje minor z `unsupported_version`.
  - Ignorują nieznane pola `x-`.
- **Nowe operacje, jednostki, sensory i typy incydentów** są dodawane do słowników bez
  zmiany wersji.
- **Zmiana znaczenia operacji to nowy id;** stara jest oznaczana jako `deprecated` z
  `replacedBy`.
- **Profile** wersjonują się niezależnie i deklarują wersję Core, której potrzebują.

## 10. Profile i ich status

| Profil | Status | Uwagi |
|---|---|---|
| Core (ten dokument) | **draft, normative** | Cel dla pierwszych implementacji urządzeń |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Brak danych osobowych; działa przez SMS i CSV; surplus to plate, podsumowania wpływu, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Fakty domowe typu local-first; przesyłane są tylko derived constraints (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Sprawdzone przestrzenie nazw, dokładne wersje, tombstones; organizacje na żądanie (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Podpisane raporty za każdym conformance claim (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feedy i przekaźniki; weryfikacja względem wystawcy (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restauracje, społeczności, szkoły, kuchnie kryzysowe i robotyczne (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Zagregowane, opóźnione sygnały popytu i podaży na poziomie klas; ograniczone przeglądem prawa konkurencji (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projekcja, przejścia w `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Wymaga przeglądu prawa konkurencji przed użyciem produkcyjnym |
| Relief planning (`relief.schema.json`) | experimental | Przepływ operacyjny przeniesiony do Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API jest powierzchnią referencyjną |

Profil staje się stabilny, gdy dwie niezależne implementacje przejdą jego wektory conformance
i posiada on realnych użytkowników.

## 11. Narzędzia

| Narzędzie | Co robi |
|---|---|
| `tools/validate_specs.py` | Sprawdza schematy, przykłady, semantykę przepisów (envelopes, parametry op, brak placeholderów szablonów), rygorystyczność oraz to, czy referencje API są rozstrzygalne |
| `tools/run_conformance.py` | Uruchamia `conformance/*.json` oraz `conformance/profiles/*.json` i zapisuje ConformanceReport za pomocą `--report`: haszowanie (w tym przykład RFC 8785), podpisy (w tym klucz RFC 8032), cofnięcie, ujawnienie, łańcuchy zdarzeń i punkty kontrolne, jednostki, envelopes, sensor ladders, maszyny stanów |
| `tools/cookwala_ref.py` | Biblioteka referencyjna i CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Regeneruje wektory (przejrzyj diff) |
| `tools/bundle_schemas.py` | Offline'owy pakiet schematów |
| `tools/humanitarian_check.py` | Sprawdzanie rule-pack dla Humanitarian Profile oraz podsumowania wpływu |
| `tools/make_profile_vectors.py` | Regeneruje wektory profili w `conformance/profiles/` |

## 12. Zmiany od 0.1

| Obszar | 0.1 | 0.2 |
|---|---|---|
| Schematy | Zaakceptowane nieznane pola | Rygorystyczne, z rozszerzeniami `x-` |
| Temperatury | °C lub °F, dozwolona tolerancja względna | Tylko °C; tolerancja absolutna |
| Pieniądze | Liczba | String dziesiętny |
| Operacje | Definicje tekstowe | Fizyczne operation envelope, sensor ladder, poziomy ciepła, wektory testowe |
| Sygnatury | Stałe EdDSA, klucze bez cyklu życia | EdDSA lub ES256, KeyRecords z ważnością i cofnięciem |
| Misje | Jeden mutowalny dokument, ledger wewnątrz | Event log + projekcja, pojedynczy sequencer, świadkowane punkty kontrolne, tryb hash-only |
| Agenci | Mandate tylko wewnątrz Misji | `AgentMandate` we wspólnym; wymagane dla żądań agenta |
| Bezpieczeństwo | Deklarowane w przepisach | Wymuszane również lokalnie poprzez SafetyLimits; recalls; raporty incydentów |
| Dane | Brak modelu zbioru danych | Zgodny, wolny od danych osobowych ExecutionLog |
| Conformance | Tylko walidacja schematu | 106 wektorów (44 Core, 62 profile) plus implementacja referencyjna |

Aby przeprowadzić migrację dokumentu 0.1: przekonwertuj °F na °C; zastąp tolerancje względne temperaturami `toleranceAbs`; zamień kwoty pieniężne na ciągi dziesiętne; usuń lub zmień nazwy nieznanych pól na pola `x-`.

