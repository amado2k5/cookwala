<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Profil Household Context: cały obraz zostaje w domu

> **Status: draft profile** (RFC-0001). Nie jest częścią Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Recipient rules: `profiles/household/recipient-roles.json`. Local API:
> `api/household.openapi.yaml`. Przykład: `examples/household/context.json`.

## 1. Dlaczego

Robot, który dobrze służy rodzinie, musi wiedzieć bardzo wiele: jakie urządzenia i jakie mają specyficzne cechy, kto tam mieszka i kiedy są w domu, zwierzęta, dzieci, diety, alergie, czas przyjmowania leków, rytuały, budżet, nawyki zakupowe, co poszło nie tak ostatnim razem. Te same fakty stanowią plan włamania i narzędzie profilowania. Ten profil daje **plannerowi w domu** pełny obraz, a wszystkim innym daje jedynie **constraint**.

## 2. Trzy pomysły

1. **Facets.** Każdy wpis zawiera jeden wpisany fakt (`cw.facet.household.health.allergies`) wraz z informacją, kto go
   stwierdził (declared, observed, reported, inferred), kiedy, jak długo, z jaką pewnością oraz klasę prywatności (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in the registry.** Każdy typ facet określa, czy jego surowa wartość może opuścić
   dom: `never` (45 typów: dzieci, nieobecności, układy, stany zdrowia, religia,
   zachowanie, incydenty, postawa dochodowa), tylko jako `derived` constraint (81 typów), lub jako
   `consented` disclosure po wyraźnym udzieleniu zgody (13 typów, głównie stan własny urządzenia dla
   producenta).
3. **Derived constraints.** Jedyny obiekt household, jaki sprzedawca, planista, serwis dostawczy,
   producent urządzenia lub inny robot kiedykolwiek otrzymuje: "dostarczyć 17:00–18:00 pod drzwi wejściowe",
   "blokuj orzeszki ziemne", "brak ruchu robotów na korytarzu 15:00–15:30", "limit budżetowy 18.00 USD na
   posiłek". Każdy określa **typy** facet, z których pochodzi, nigdy ich wartości.

## 3. Kto co otrzymuje

| Rola odbiorcy | Może otrzymać |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI lub oprogramowanie planujące posiłek) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | tylko device fault summary (liczba błędów według kategorii, bez czasu, bez faktów dotyczących household context), i tylko wtedy, gdy household context wskazał insurer jako odbiorcę; RFC-0001 wymienia to jako rolę, która najprawdopodobniej zostanie usunięta, jeśli przegląd prywatności zgłosi sprzeciw |
| program (food bank, szkoła) | nic |
| dataset | nic |

## 4. Zasady

- Surowe facets nigdy nie opuszczają urządzenia. Nie istnieje żadne API, które zwracałoby je komukolwiek poza siecią domową.
- facets typu `inferred` nigdy nie są używane do decyzji dotyczących bezpieczeństwa.
- Żaden wynik behawioralny żadnej osoby nie jest generowany ani przechowywany. Behaviour facets istnieją, aby służyć gospodarstwu domowemu (wielkość porcji, kiedy posprzątać) i nigdy nie są przesyłane.
- Poziom ekonomiczny to **owner-set budget posture**, nigdy nie wnioskowany z niczego.
- Dane dotyczące dzieci i ich nieobecności są `secret` i nigdy nie są przesyłane, nawet w formie derived, z wyjątkiem ograniczeń dotyczących ruchu i bezpiecznej strefy, które nie ujawniają harmonogramu.
- Każdy facet może zostać wymazany. Wymazanie następuje w oknie czasowym gospodarstwa domowego (domyślnie 7 dni, maksymalnie 30) i jest logowane bez treści.
- Klasa prywatności może zostać podniesiona powyżej domyślnej wartości w registry, ale nigdy nie obniżona.

## 5. Lokalna pamięć incydentów

RFC-0001 pyta, co robot pamięta o alarmach, konfliktach, rezygnacjach i lekcjach. `LocalIncident` przechowuje to: datę, kategorię z
`vocab/incidents.json`, kto był zaangażowany według rodzaju, notatkę i lekcję. Nigdy nie opuszcza
domu. Publiczny, anonimowy `IncidentReport` w Core to inny dokument, z którego uczy się każdy
maker.

## 6. Conformance

Wektory profilu (`conformance/profiles/disclosure_policy.json`) podają facet i rolę odbiorcy oraz oczekują dokładnych typów ograniczeń, ujawnionych id oraz zatajonych id wraz z powodami. Implementacja referencyjna to `derive_constraints()` w `tools/cookwala_ref.py`.

## 7. Relacja do innych dokumentów

`ClientProfile`, `KitchenProfile` i `RobotProfile` (`profile.schema.json`) pozostają jako wygodne zestawy. Facetki misji (`mission.schema.json`) używają tych samych identyfikatorów registry. Rdzeń `AgentMandate` pozostaje normatywnym stwierdzeniem tego, co agent może robić; facetki mandate opisują zasady household lokalnie.

## 8. Otwarte pytania

Zobacz RFC-0001: zamknięte role odbiorców; raise-only privacy; ocena skutków dla ochrony danych z recenzentem.

