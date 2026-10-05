<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# Mapa drogowa: now, next, later

**Status:** 2026-10-04. Każdy element posiada status: **done**, **in progress**, **planned**,
**not yet funded**. Bramki pochodzą z sekcji 4 `ACTION-PLAN.md`. Nic nie przechodzi ze statusu planned
do done bez wymienionego dowodu.

## Teraz (to wydanie)

| Element | Status |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Nine example recipes in English and Arabic | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Four simulators with the protocol on and off | done (illustrative) |
| Website in English and Arabic with a page for every stakeholder, whitepaper and deck | in progress |

## Next (w ciągu około roku, w miarę dostępności zasobów)

| Element | Status | Gate |
|---|---|---|
| Przegląd operation envelopes przez naukowca żywności | planned | reviewer agrees |
| Przeglądy czterech rule packs przez dietetyka i oficera ds. bezpieczeństwa żywności | planned | reviews filed; packs move to reviewed |
| Ocena skutków dla ochrony danych profilu household context | planned | reviewer agrees |
| Pilotaż food-bank (12 weeks, pre-registered, independent evaluator) | not yet funded | partner and funding (`humanitarian/CONCEPT-NOTE.md`) |
| Wyniki agent-safety benchmark dla kilku rodzin modeli | planned | runs published with method |
| Wheel `pip install cookwala` oraz `@cookwala/sdk` na npm | planned | packaging that bundles vocabularies and schemas |
| Usługa registry (`validate`, `publish`, tombstones) | planned | a worker and namespace proof |
| Pierwszy producent urządzeń implementujący Core API względem reference hub | planned | one maker agrees; conformance report published |
| Konwersja pierwszych kolekcji fifi.cooking | planned | founder decides rights per collection |
| Core 0.3 na podstawie informacji zwrotnych od urządzeń | planned | two implementers' feedback |
| Steering committee | planned | three independent adopters or two implementations |

## Later

| Element | Status |
|---|---|
| Prawdziwe urządzenie gotujące przepis Cookwala, bez edycji, na wideo | nie sfinansowano jeszcze; wymagany partner urządzeń |
| Schemat certification z niezależnym certyfikatorem | zaplanowano; nie zaangażowano certyfikatora |
| Neutralna podstawa dla specyfikacji, znaku towarowego i znaku | zaplanowano |
| Sieć kontrybutorów: zgodne nagrania prawdziwych przepisów z uznaniem autorstwa | zaplanowano |
| Sygnały popytu i podaży publikowane przez programy i spółdzielnie | zaplanowano, po przeglądzie pod kątem prawa konkurencji |
| Benchmark "Cook in simulation" (Isaac Lab, Gazebo lub MuJoCo) | zaplanowano |
| Uznanie za Cyfrowe Dobro Publiczne dla Humanitarian Profile | zaplanowano, po dowodach z pilotażu |
| Międzyregionalne przepływy pomocy w symulatorze świata; efekty clean-cooking | zaplanowano |

## Czego nie będziemy robić

Zbieraj dane osobowe; publikuj liczby bez metody; wymieniaj partnera przed jego zgodą;
twierdź, że posiadasz certification, która nie istnieje; umieszczaj dane household na jakimkolwiek ledgerze; buduj centralny
orchestrator, od którego zależą kuchnie; twierdz, że położysz kres głodowi.

## Zasady kill and pivot

Z planu działania: jeśli dwie zewnętrzne rundy przeglądu nie wyłonią producenta urządzenia ani partnera pilotażowego, Cookwala zawęża zakres do Humanitarian Profile i formatu przepisu. Jeśli pilotaż wykaże zysk mniejszy niż 5 %, wyniki zostaną opublikowane, a profil zaprojektowany na nowo przed jakimkolwiek skalowaniem.

