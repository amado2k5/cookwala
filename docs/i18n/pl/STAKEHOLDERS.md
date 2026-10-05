<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->

# Interesariusze: wiadomość, opcje, pierwszy sukces i przepływ dla każdego

**Status:** 2026-10-04. Dla każdej grupy: dlaczego Cookwala jest dla nich ważna, sposoby zaangażowania od lekkich do głębokich, pierwszy sukces w mniej niż 15 minut, ścieżka po nim oraz to, jak zaangażowanie posuwa naprzód ich pracę i świat. Nic tutaj nie nazywa partnera, użytkownika ani pilotażu, który nie istnieje. Tam, gdzie coś jest planowane, widnieje status next lub later.

Trzy cele stojące za każdym wierszem: pomóc zakończyć głód, sprawić, by ludzie byli zdrowsi, postawić roboty do pracy dla ludzi.

---

## 1. Budowniczy: deweloperzy, producenci robotów i urządzeń, inżynierowie systemów wbudowanych, twórcy agentów AI, deweloperzy inteligentnych domów i platform, współtwórcy open-source

**Wiadomość.** Roboty i urządzenia uczą się poruszać. Nikt nie zapisał w formie, którą maszyna może sprawdzić, co oznacza „simmer”, kiedy kurczak jest bezpieczny lub kiedy krok musi zostać odrzucony (refusal before heat). Cookwala jest tą warstwą: przepisami, które maszyna może zaplanować, warunkami końcowymi, które może zmierzyć, oraz limitami bezpieczeństwa, których sama przestrzega. Jest otwarta, bezpłatna (royalty-free), neutralna względem modeli i urządzeń, a także posiada zestaw do conformance, który można uruchomić już dziś.

**Opcje.**
- *Light:* przeprowadź przeglądarkowy dry run; przeczytaj Core 0.2 (jeden wieczór).
- *Medium:* `pip install -e sdk/python`, przeprowadź dry-run możliwości swojego urządzenia względem przykładowych przepisów, uruchom wektory conformance, uruchom referencyjny hub.
- *Deep:* zaimplementuj Core API na urządzeniu lub hubie, opublikuj raport conformance, dodaj swoje urządzenie do directory, zaproponuj RFC, napisz węzeł mostka ROS 2, dodaj przypadki ataków do agent-safety benchmark.

**Pierwszy sukces (poniżej 15 minut).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Przebieg.** Dry run → wdróż Core API względem referencyjnego hub → przejdź conformance →
opublikuj raport → wymień urządzenie → zatwierdzone execution logs stają się zbiorami danych LeRobot i
śladami OpenTelemetry.

**Jak to rozwija ich pracę.** Wspólna definicja zadania i test sukcesu dla gotowania, wraz z
publicznym benchmarkiem do pomiaru; przepisy każdej kuchni bez ich pisania;
historia bezpieczeństwa, którą mogą przeczytać regulatorzy; raporty conformance jako dokument sprzedażowy;
pozycja pierwszego gracza w standardzie, który będzie zarządzany przez jego wdrażających.

**Jak to rozwija społeczeństwo.** Mniej pożarów w kuchni i chorób przenoszonych przez żywność dzięki maszynom, które
wykazują refusal before heat zamiast zgadywać; maszynom, które dziedziczą światowe kuchnie zamiast zaledwie kilku.

---

## 2. Firmy: startupy, przedsiębiorstwa, firmy spożywcze, sklepy spożywcze i dostawy, restauracje i usługi gastronomiczne, ubezpieczyciele, certyfikatorzy, zespoły sprzedaży i partnerstw

**Wiadomość.** Każda firma mająca kontakt z żywnością spotka maszyny do gotowania i agentów AI w ciągu najbliższych lat. Cookwala zapewnia jeden interfejs dla wszystkich tych rozwiązań, jedyny z wymuszonymi na urządzeniu limitami bezpieczeństwa i rejestrami, które można audytować. Dla sklepów spożywczych i dostawców: otrzymuj okna dostaw i wymagania dotyczące alergenów, nigdy harmonogram rodziny. Dla ubezpieczycieli i podmiotów zajmujących się certification: format raportu conformance oraz kanał raportów incydentów zaprojektowany dla Ciebie.

**Opcje.**
- *Light:* przeczytaj stronę Investors and partners oraz strony dotyczące zaufania; przypisz swoje produkty do
  klas składników i operacji.
- *Medium:* opublikuj kanał ofert (market profile, experimental) lub ofertę surplus do
  lokalnego programu (Humanitarian Profile); przeprowadź agent-safety benchmark na agencie, który
  planujesz wdrożyć.
- *Deep:* zaimplementuj Core API w produkcie; sfinansuj conformance verification; dołącz do
  steering committee, gdy powstanie; przyjmij ścieżkę certification.

**Pierwszy sukces.** Przekształć jedną linię produktów w rynkową `Offer` z GTIN i danymi dotyczącymi alergenów, zweryfikuj ją i sprawdź, jakie przykładowe przepisy może ona zapewnić.

**Przepływ.** Oferta feed → derived constraints od gospodarstw domowych → zamówienia przez własny checkout → zdarzenia fulfilment → reputacja z execution reports (za zgodą).

**Jak to rozwija ich pracę.** Dostęp do neutralnej warstwy zamiast tuzina integracji dostawców; sygnały popytu (later, po przeglądzie pod kątem prawa konkurencji), które redukują marnotrawstwo; certification, którą ubezpieczyciele mogą wycenić; publiczna rejestracja bezpieczeństwa.

**Jak to rozwija społeczeństwo.** Mniej żywności traconej między sklepem a talerzem; surplus trafiający do kuchni, zanim zgnije; maszyny w domach, których nie da się namówić na niebezpieczne działania.

---

## 3. Dostawcy: sklepy spożywcze, gospodarstwa rolne i spółdzielnie, dostawy, energia, dostawcy AI i modeli, wydawcy przepisów

**Wiadomość.** Dostawcy podłączają się do Cookwala jako rówieśnicy, a nie najemcy. Sklep spożywczy lub usługa dostawy otrzymuje ograniczenie, nigdy fakty dotyczące gospodarstwa domowego. Dostawca AI otrzymuje benchmark, który pokazuje, że jego model jest bezpieczny w kuchni, oraz serwer MCP do wykorzystania dzisiaj. Wydawca przepisów zachowuje swoją nazwę przy każdym przepisie i może publikować podpisany katalog ze statycznego folderu.

**Opcje.** Opublikuj katalog (przepisy) · opublikuj kanał ofert · uruchom agent-safety benchmark · uruchom węzeł registry · zaoferuj surplus przez SMS.

**Pierwszy sukces.** Wydawca przepisu: `cookwala init my-dish`, edytuj, `cookwala validate`,
`cookwala hash`; Twój katalog to folder z `/.well-known/cookwala.json`. Dostawca AI:
dodaj serwer MCP i uruchom dziesięć przypadków agent-safety.

**Przebieg.** Katalog lub feed → wpis w registry pod Twoją sprawdzoną przestrzenią nazw → recall feed, jeśli
coś pójdzie nie tak → reputacja z wyników.

**Jak to rozwija ich pracę.** Dotrzyj do każdego urządzenia i agenta poprzez jeden format;
wiarygodność i pochodzenie poprzez podpis; punkt odniesienia bezpieczeństwa, który jest aktywem marketingowym, gdy
zostanie uczciwie zaliczony.

**Jak to rozwija społeczeństwo.** Przepisy pozostają przypisane; agenci działający w imieniu ludzi są
measured, zanim zostaną im zaufane.

---

## 4. Żywność: rolnicy, kucharze i szefowie kuchni, domowi kucharze, twórcy przepisów, szkoły kulinarne

**Wiadomość.** Przepis napisany dla Cookwala sprawia, że Twoje imię i Twoja kuchnia pozostają żywe na każdym
urządzeniu, które go przyrządza, z zapisanymi krokami, których maszyna nigdy nie może pominąć. Gospodarstwo rolne z
nadwyżką może przesłać go przez SMS i dotrzeć do kuchni tego samego dnia. Szkoła kulinarna może uczyć bezpieczeństwa
żywności za pomocą formatu, który sam się sprawdza.

**Opcje.**
- *Rolnicy:* `FARM 120KG TOMATO A BB0411` do bramki programu (jeśli istnieje);
  later, odczytaj sygnały podaży i popytu.
- *Kucharze i szefowie kuchni:* przekształć jeden przepis, który znasz na pamięć, w przepis Cookwala; przejrzyj
  zdania opisujące kroki w swoim języku; later, nagraj sesje za zgodą z uwzględnieniem kredytów.
- *Szkoły:* wykorzystaj dziewięć przykładowych przepisów jako przypadki dydaktyczne; dodaj własne.

**Pierwszy sukces.** Kucharze: `cookwala init`, napisz jeden przepis z warunkiem końcowym dla każdego kroku grzania, przeprowadź walidację. Rolnicy: wyślij jedną ofertę SMS do programu, który uruchamia profil (żaden nie działa jeszcze; parser i wektory istnieją).

**Przebieg.** Przepis → walidacja → katalog → dry run na urządzeniach → execution logs pokazują, jak działa na rzeczywistych maszynach → rewizje z dowodami.

**Jak to rozwija ich pracę.** Atrybucja, która wędruje; przepis, który może być przyrządzony przez maszyny w innych krajach; dla rolników sposób na zamianę nadwyżki w posiłki zamiast odpadów.

**Jak to rozwija społeczeństwo.** Dziedzictwo kulinarne zachowane jako wiedza praktyczna, a nie wideo;
mniej strat na etapie gospodarstwa rolnego.

---

## 5. Humanitarne: NGO, food banks, kuchnie społecznościowe, programy posiłków szkolnych, agencje pomocowe, darczyńcy

**Wiadomość.** Humanitarian Profile przenosi surplus żywności na talerze za pomocą telefonów i
arkuszy kalkulacyjnych, rejestruje kontrole łańcucha chłodniczego, liczy posiłki i nie gromadzi
**żadnych danych osobowych**. Działa bez robotów, aplikacji czy internetu. Dostarcza liczby, które możesz obronić: kilogramy
uratowane, wydane posiłki, wskaźnik zgodności żywieniowej, koszt posiłku, czas zgłoszenia, incydenty bezpieczeństwa,
każdy z określoną metodą.

**Opcje.**
- *Light:* przeczytaj profil i protokół pilotażowy; wypróbuj SMS walkthrough.
- *Medium:* uruchom szablony CSV w jednej lokalizacji przez cztery tygodnie (poziom H0) i oblicz
  podsumowanie wpływu.
- *Deep:* 12-tygodniowy, zarejestrowany wcześniej pilotaż z linią bazową i niezależnym ewaluatorem;
  dostosuj rule packs do prawa krajowego ze swoim liderem ds. bezpieczeństwa żywności; uruchom własny węzeł registry.

**Pierwszy sukces.** Wypełnij trzy szablony CSV dla jednego dnia, uruchom
`cookwala humanitarian --summary your-folder`, przeczytaj `ImpactSummary` z metodą pod
każdą liczbą.

**Przebieg.** Oferta → roszczenie → przekazanie z kontrolą temperatury → dystrybucja → podsumowanie wpływu → opublikowane wyniki, bez względu na to, co pokazują.

**Jak to rozwija ich pracę.** Porównywalne liczby w różnych lokalizacjach; dowody dla fundatorów;
wyniki dotyczące bezpieczeństwa przed, a nie po wystąpieniu problemu; format, który systemy darczyńców mogą odczytać (mapowania HXL,
GS1, DHIS2).

**Jak to rozwija społeczeństwo.** Więcej żywności docierającej do ludzi w bezpieczny sposób, z zachowaniem ich godności:
bez nazwisk, bez twarzy, bez profilowania.

---

## 6. Zdrowie: dietetycy, inspektorzy ds. bezpieczeństwa żywności, agencje zdrowia publicznego, domy opieki

**Wiadomość.** Zasady żywienia i bezpieczeństwa żywności jako pakiety sprawdzalne przez maszynę, wywodzące się z publicznych wytycznych, stosowane do menu i przekazań, z Twoim przeglądem zarejestrowanym według profesji i wyniku. Nic nie jest poradą medyczną; nic nie jest deklarowane ponad to, co mówią pakiety.

**Opcje.** Przejrzyj rule pack z szablonem (dwie godziny) · dostosuj rule pack do krajowych zasad ·
zaproponuj zasady opieki dla osób, którym służysz · later, przeczytaj zagregowane wyniki z programów.

**Pierwszy sukces.** Otwórz `profiles/humanitarian/care-vulnerable-groups.rulepack.json` oraz
szablon przeglądu; oznacz trzy reguły jako zatwierdzone, zmienione lub odrzucone; zarejestruj przegląd.

**Przebieg.** Draft pack → przegląd → status reviewed → programy przyjmują → ustalenia w każdej
dystrybucji → wyniki publikowane wraz z metodami.

**Jak to rozwija ich pracę.** Twoje wskazówki działają w każdej kuchni, która je wdraża,
w tym w kuchniach robotycznych, z Twoim zawodem odnotowanym w rejestrze; recenzją nadającą się do publikacji;
zbiorem danych z wynikami (zagregowanymi, bez danych osobowych) do celów badawczych.

**Jak to rozwija społeczeństwo.** Mniej sodu, cukru i tłuszczów nasyconych w posiłkach wydawanych masowo; bezpieczniejsze utrzymywanie ciepła i chłodzenie; opieka nad dziećmi i osobami starszymi wpisana w maszynę.

---

## 7. Edukacja: nauczyciele szkolni, edukatorzy, profesorowie, badacze, studenci

**Wiadomość.** Gotowanie jest najbardziej znanym procesem na świecie, a Cookwala zmienia je w
obiekt dydaktyczny: temperatury, jednostki, sprawiedliwy podział, bezpieczeństwo, maszyny, które przestrzegają reguł. Dla
badaczy jest to benchmark, format zbioru danych i lista otwartych problemów.

**Opcje.**
- *Nauczyciele:* zestaw lekcji (`docs/education/LESSON-KIT.md`): pięć lekcji od „co to jest simmer” do „czego maszyna nigdy nie powinna robić”.
- *Profesorowie i studenci:* lista tematów badawczych, symulatory, wektory conformance jako warunki testowe, eksport LeRobot, problemy otwarte o skali pracy dyplomowej.
- *Badacze:* publikowanie zestawów danych z zatwierdzonych executions; krytyka założeń (assumptions) symulatorów; proponowanie wektorów.

**Pierwszy sukces.** Nauczyciele: przeprowadźcie w klasie dry run w przeglądarce i zapytajcie, dlaczego urządzenie odmówiło. Studenci: zmieńcie jedno assumption w symulatorze miasta i wyjaśnijcie wynik.

**Przebieg.** Lekcja → projekt → zestaw danych → praca → RFC.

**Jak to rozwija ich pracę.** Darmowy, otwarty, cytowalny materiał; benchmark, do którego nikt nie ma praw;
współautorstwo standardu poprzez RFCs.

**Jak to rozwija społeczeństwo.** Pokolenie, które wie, czym jest bezpieczna kuchnia i potrafi przeczytać kartę bezpieczeństwa.

---

## 8. Rząd: rządy, ministerstwa, urzędnicy miejscy, regulatorzy, politycy i ustawodawcy, organy rządzące i organ regulujący standardy

**Wiadomość.** Domowe i komercyjne maszyny do gotowania trafiają na rynek w ramach regulacji napisanych oddzielnie dla urządzeń i oprogramowania. Cookwala daje regulatorom coś konkretnego, na co mogą wskazać: limity bezpieczeństwa wymuszane na urządzeniu, refusal before heat, podpisane rekordy, anonimowe raportowanie incydentów oraz zestaw conformance, który każdy może uruchomić. W celu zapewnienia bezpieczeństwa darowizn żywności, Cookwala dostarcza standard danych bez danych osobowych. Jest on wolny od opłat licencyjnych i zmierza w stronę neutralnego zarządzania.

**Opcje.** Przeczytaj streszczenie polityki (`docs/policy/BRIEF.md`) · używaj języka modelu dla danych dotyczących darowizn żywności i bezpieczeństwa maszyn do gotowania · poproś swój organ normalizacyjny o przegląd Core 0.2 · uruchom krajowy węzeł registry · sfinansuj pilotaż ze swoim programem posiłków szkolnych.

**Pierwszy sukces.** Przeczytaj dwustronicowy brief i sprawdź trzy rzeczy w repozytorium:
pakiet limitów bezpieczeństwa, runner conformance, zasady ochrony danych humanitarnych.

**Przebieg.** Krótki → przegląd przez krajowy organ normalizacyjny → odniesienie w wytycznych → pilotaż →
schemat certification.

**Jak to rozwija ich pracę.** Gotowa, podlegająca przeglądowi podstawa techniczna; dowody z pilotaży; kanał do przemysłu poprzez neutralny standard; interoperacyjność ze standardami danych humanitarnych, których już używasz.

**Jak to rozwija społeczeństwo.** Bezpieczniejsze maszyny w domach; ratowanie żywności, które chroni ludzi, którym służy; mniej odpadów w miastach.

---

## 9. Kapitał: inwestorzy, przedsiębiorcy, fundacje filantropijne, banki rozwoju

**Wiadomość.** Gotowanie ma stać się infrastrukturą. Standard jest bezpłatny; usługi
wokół niego to biznes: certification, oprogramowanie hub, zestawy danych za zgodą, operacje
registry, pilotaże. Warstwa humanitarna to dobro publiczne, które fundatorzy rozwoju mogą
wspierać poprzez pre-registered evaluation. Nigdzie na tej stronie nie składane są żadne obietnice finansowe.

**Opcje.** Przeczytaj szansę, model biznesowy, mapę drogową, ryzyka i zarządzanie
(`/investors`) · sfinansuj dry run lub przegląd · wesprzyj firmę, która sprzedaje usługi obok
darmowego standardu · dołącz do governance jako obserwator fundatora.

**Pierwszy sukces.** Przeczytaj sekcje problem, architektura i ryzyka w whitepaper oraz rejestr obaw w planie działania; każdy otwarty ryzyko jest wymieniony.

**Przebieg.** Dowody (piloty, conformance, użytkownicy) → bramki w planie działania → finansowanie powiązane z bramkami → neutralna podstawa dla standardu, firma świadcząca usługi.

**Jak to rozwija ich pracę.** Wczesna pozycja w standardzie definiującym kategorię z rzetelnymi liczbami; inwestowalna firma usługowa oddzielona od dobra publicznego.

**Jak to rozwija społeczeństwo.** Kapitał płynie tam, gdzie jest to measured, a nie tam, gdzie jest to claimed.

---

## 10. Myśl: filozofowie, etycy, historycy i futurolodzy

**Wiadomość.** Gdy maszyna gotuje przepis babci, kto posiada tę wiedzę? Co oznacza godność w zautomatyzowanej opiece? Co może wiedzieć robot w gospodarstwie domowym i kto jeszcze może to wiedzieć? Cookwala dokonała wyborów w kwestii tych pytań w kodzie; eseje (`docs/essays/`) wyjaśniają, jakie one były i zapraszają do polemiki.

**Opcje.** Przeczytaj eseje · napisz odpowiedź · zaproponuj regułę (RFC to filozoficzny
argument z schematem) · zasiądź w komisji etycznej ds. profilu household context.

**Pierwszy sukces.** Przeczytaj esej na temat danych household i reguły podróży facet registry;
znajdź jeden facet, którego default zmieniłbyś, i powiedz dlaczego.

**Przebieg.** Esej → opinia publiczna → RFC → zmieniona wartość domyślna.

**Jak to rozwija ich pracę.** Żywy przypadek, w którym stanowiska etyczne stają się działającymi regułami,
wraz z publicznym zapisem argumentacji.

**Jak to rozwija społeczeństwo.** Decyzje dotyczące intymnych danych i dziedzictwa kulturowego podejmowane jawnie, zanim maszyny trafią do milionów domów.

---

## 11. Wszyscy: ludzie, którym zależy na jedzeniu, odpadach, pracy, klimacie i przyszłości

**Wiadomość.** Cookwala to sposób na zapisanie przepisu tak, aby każdy, lub cokolwiek, mógł go bezpiecznie przyrządzić, oraz sposób na to, aby jedzenie, które zostałoby wyrzucone, trafiło do kogoś, kto go potrzebuje. Jest to rozwiązanie darmowe, nie należy do żadnej firmy i mówi o tym, czego nie wie.

**Opcje.** Wypróbuj dry run · uruchom symulator · przeczytaj przepisy · napisz jeden przepis, który
uwielbiasz · postępuj zgodnie z roadmap · powiedz o tym food bank lub szkole.

**Pierwszy sukces.** Zmień urządzenie w dry run i obserwuj, jak jeden krok zostanie odrzucony; przeczytaj dlaczego.

**Przebieg.** Ciekawość → jeden przepis → jedna rozmowa z kuchnią, która mogłaby go wykorzystać.

**Jak to usprawnia ich życie.** Bezpieczniejsze maszyny w domu, zachowane ich własne przepisy, sposób na pomoc bez dawania pieniędzy.

**Jak to rozwija społeczeństwo.** Mniej marnotrawstwa, bezpieczniejsza żywność, maszyny służące ludziom, którzy nie mogą gotować dla siebie, oraz odzyskany czas ludzki.

---

## 12. Praca i godność, powiedziane wprost

Maszyny do gotowania zmienią pracę. Pozycje Cookwala: ludzie zawsze mogą gotować; pierwsze zastosowania są dla osób, które nie potrafią gotować dla siebie, oraz dla kuchni społecznych, którym brakuje rąk do pracy; nazwisko kucharza pozostaje przy przepisie, gdziekolwiek nie jest on gotowany; głos pracowników ma miejsce w komitecie sterującym; nowe role (inżynierowie przepisów, technicy robotów żywnościowych, certyfikatorzy, recenzenci rule-pack) są wymieniane bez obiecywania konkretnych liczb.

## 13. Gdzie każda grupa znajduje się w serwisie

| Grupa | Strona |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Companies | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Food | `/for/food/`, `/farmers/` |
| Humanitarian | `/for/humanitarian/`, `/humanitarian/` |
| Health | `/for/health/` |
| Education | `/for/education/`, `/education/` |
| Government | `/for/government/`, `/policy/` |
| Capital | `/for/capital/`, `/investors/` |
| Thought | `/for/thought/`, `/ideas/` |
| Everyone | `/`, `/why/`, `/impact/` |

