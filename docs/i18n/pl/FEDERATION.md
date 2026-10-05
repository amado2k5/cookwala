<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->
# Federacja: jak Cookwala działa bez centrum

**Status:** draft, 2026-10-04 (RFC-0006). Zdjęcie założyciela przedstawiało ul: brak centralnego
dowodzenia, a jednak harmonia i regeneracja. Ta strona wyjaśnia, co to oznacza w praktyce.

## 1. Węzły

| Węzeł | Do czego służy | Kto prowadzi |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | wydawca przepisów, sieć food-bank, uniwersytet, producent urządzeń, cookwala.ai |
| **Registry** | `/v1/registry.json`: wskaźniki do catalogs, collections, devices, packs, benchmarks | każdy; cookwala.ai prowadzi jeden |
| **Hub** | Core API dla kuchni, lokalne limity bezpieczeństwa, household context | każda kuchnia; działa offline |
| **Mirror** | ponownie publikuje podpisane elementy innych węzłów bez zmian | każdy, kto chce odporności w swoim regionie |

Folder statyczny jest poprawnym katalogiem. Telefon z szablonami CSV jest poprawnym uczestnikiem humanitarnym na poziomie H0.

## 2. Dane wejściowe, a nie polecenia

Węzły publikują podpisane kanały informacyjne: recalls, anonimowe incydenty, zmiany w registry, kluczowe rekordy.
Inne węzły sprawdzają to, któremu ufają, i mogą to opublikować ponownie. Nic nie jest przesyłane do kuchni; kuchnia pobiera dane, gdy jest online, i kontynuuje pracę, gdy nie jest.

## 3. Weryfikuj względem wystawcy, nigdy przekaźnika

`recall`, który przychodzi przez mirror, jest tak dobry, jak podpis **wydawcy**. `hub` rozwiązuje `KeyRecord` wydawcy z własnego dokumentu discovery wydawcy lub `did:web` i weryfikuje body bajt po bajcie. Klucz mirrora nic nie dowodzi w kwestii treści; mirror, który edytuje `recall`, narusza podpis. Wektory profilu w `conformance/profiles/federation.json` pokazują trzy przypadki.

## 4. Listy zaufania

Każdy hub przechowuje listę katalogów i registry, którym ufa, wraz z ich kluczami i priorytetem. Węzeł może sugerować rówieśników (`federation.peers`); decyzję podejmuje hub. cookwala.ai jest jedną z wpisów na takiej liście, a nie rootem.

## 5. Świeżość

Wpisy w registry posiadają status oraz czas publikacji; recalls posiadają czas wydania; household facets posiadają ważność. Nieaktualne elementy są ponownie pobierane lub odrzucane. Nic nie jest ufnane tylko dlatego, że jest stare, nic nie jest usuwane po cichu: wycofane wpisy pozostają jako tombstones.

## 6. Historia

Logi zdarzeń z potwierdzonymi punktami kontrolnymi (Core section 5) sprawiają, że przeredagowania są wykrywalne bez
blockchaina: druga strona kontrasygnuje nagłówek logu, a późniejsze przeredagowanie nie pasuje już
do oryginału. Publiczne zakotwiczenie nagłówków punktów kontrolnych jest opcjonalne i jest decyzją założyciela
(`docs/research/BACKSTORY.md` section 4.7).

## 7. Trzy węzły, które współpracują ze sobą

- **Sieć food bank** prowadzi registry swoich kuchni i darczyńców, katalog swoich rule pack dostosowanych do prawa krajowego oraz bramkę SMS. Może wpisać się do directory cookwala.ai lub nie; jej dane nigdy nie muszą opuszczać kraju.
- **Producent urządzeń** prowadzi katalog swoich dokumentów dotyczących capability oraz pakietów safety-limit, publikuje raporty conformance i sprawdza recall feeds katalogów, z których korzystają jego klienci.
- **Laboratorium uniwersyteckie** prowadzi katalog przepisów benchmarkowych oraz execution log (za zgodą), lustruje słownictwa i publikuje własne wektory.

Żadne z nich nie wymaga, aby cookwala.ai było online.

## 8. Co nie zostało zbudowane

Centralny orkiestrator, centralny dostawca tożsamości, token, blockchain. Decyzje kworum profilu Mission oraz orkiestratorzy pozostają opcjonalni i eksperymentalni.

