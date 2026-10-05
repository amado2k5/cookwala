<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->
# Wpływ: co Cookwala może zmienić, wraz ze źródłami i etykietami

**Status:** 2026-10-04. Każda liczba poniżej jest oznaczona jako **measured** (policzona lub zaraportowana przez wymienione źródło), **modelled** (wygenerowana przez nasze symulatory przy określonych założeniach) lub **assumed** (wartość planistyczna). Nic tutaj nie jest wynikiem działania Cookwala w terenie: nie przeprowadzono żadnego pilotażu. Ta strona określa skalę problemów oraz mechanizmy, dzięki którym Cookwala przyczynia się do ich rozwiązania.

## 1. Głód

| Fakt | Liczba | Etykieta i źródło |
|---|---|---|
| Ludzie, którzy doświadczyli głodu w 2023 | około 733 milionów | measured przez źródło: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| Ludzie z umiarkowanym lub poważnym brakiem bezpieczeństwa żywnościowego w 2023 | około 2,3 miliarda | measured przez źródło: SOFI 2024 |
| Żywność utracona między zbiorami a sprzedażą detaliczną | około 14 % wyprodukowanej żywności | measured przez źródło: FAO, *The State of Food and Agriculture 2019* (UNEP zaokrągla tę samą liczbę do 13 %) |
| Żywność zmarnowana w handlu detalicznym, usługach gastronomicznych i gospodarstwach domowych w 2022 | około 1,05 miliarda ton; około 132 kg na osobę; około 79 kg na osobę w gospodarstwach domowych | measured przez źródło: UNEP, *Food Waste Index Report 2024* |

**Mechanizmy Cookwala:** oferty surplus, które docierają do kuchni, zanim żywność się zepsuje, z
kontrolą cold-chain przy każdym przekazaniu (Humanitarian Profile); wpływ liczony w ten sam sposób w
każdym miejscu, aby programy mogły porównywać i ulepszać; later, zagregowane sygnały popytu i podaży,
aby uprawiano i transportowano mniej rzeczy, które mają zostać wyrzucone (experimental, gated on competition-law
review). **Czego nie robi:** nie zajmuje się ubóstwem, konfliktami, szokami klimatycznymi, cenami ani
polityką, które napędzają większość głodu.

**Modelled, ilustracyjne, nie prognoza:** mieszane wdrażanie symulatora kraju ratuje posiłki równe około 4.7 % tego, czego potrzebuje jego fikcyjna populacja dotknięta brakiem bezpieczeństwa żywnościowego; scenariusz „protokół, żadnych robotów” symulatora świata dociera do około 40 milionów z około 770 milionów (zakładany baseline symulatora, zaokrąglenie z 733 milionów measured powyżej) głodujących ludzi wyłącznie poprzez rescue. Oba mówią to samo: rescue ma znaczenie i nie jest wystarczające.

## 2. Zdrowie

| Fakt | Liczba | Etykieta i źródło |
|---|---|---|
| Choroby wywołane niebezpieczną żywnością każdego roku | około 600 milionów; około 420,000 zgonów | measured przez źródło: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Spożycie soli w stosunku do wytycznych | większość ludzi spożywa od 9 do 12 g soli dziennie; WHO zaleca poniżej 5 g (2 g sodu) | measured przez źródło: WHO fact sheet on salt reduction |
| Zgony przypisywalne wysokiemu spożyciu sodu każdego roku | około 1.9 miliona | measured przez źródło: WHO, *Global report on sodium intake reduction* (2023) |
| Ludzie polegający na zanieczyszczających paliwach do gotowania | około 2.1 miliarda; około 3.2 miliona zgonów rocznie z powodu zanieczyszczenia powietrza w household context | measured przez źródło: WHO fact sheet on household air pollution (2024) |

**Mechanizmy Cookwala:** krytyczne punkty kontrolne oraz limity utrzymywania ciepła, chłodzenia i ponownego podgrzewania egzekwowane na urządzeniu i rejestrowane; rule packs, które flagują sód, cukry proste, tłuszcze nasycone oraz owoce i warzywa w menu; zasady opieki dla dzieci, kobiet w ciąży i osób starszych; rejestr przeglądów, dzięki któremu dietetycy i urzędnicy ds. bezpieczeństwa żywności mogą potwierdzić zgodność pakietu.
**Czego nie robi:** nie diagnozuje, nie leczy i nie oblicza diet terapeutycznych; zobacz `docs/health/CLAIMS-POLICY.md`.

**Clean cooking** jest uwzględnione w obrazie, ale nie w modelu: symulatory nie uwzględniają jeszcze gotowania na drewnie i węglu drzewnym ani jego skutków zdrowotnych (wymienione jako ograniczenie; next).

## 3. Środowisko

| Fakt | Wartość | Etykieta i źródło |
|---|---|---|
| Udział globalnych emisji gazów cieplarnianych wynikających ze strat i marnotrawstwa żywności | około 8 do 10 % | measured przez źródło: UNEP, *Food Waste Index Report 2024* |

**Modelled, illustrative:** w symulatorze świata, „wiele robotów z protokołem” redukuje całą
żywność utraconą lub zmarnowaną o około 4.1 % oraz emisje o około 5.2 % w ciągu pięciu lat w porównaniu z
tym samym światem bez nich; „wiele robotów samo w sobie” redukuje odpady gospodarstwa domowego, ale zwiększa straty przed
domami o około 3 % (efekt biczowania). Liczony jest prąd dla robotów (około 164 TWh w ciągu pięciu lat w
tym scenariuszu). Są to wyniki modelu oparte na jego założeniach, wymienione na
każdej stronie symulatora.

## 4. Ekonomia i praca

**Assumed and modelled:** symulator miasta szacuje około 5 USD na osobę miesięcznie
mniej wydatków na żywność i około 10 godzin na dom miesięcznie mniej gotowania i zakupów z robotem
kucharzy, sprzęt nie wliczony. Żadna liczba dotycząca miejsc pracy nie została nigdzie podana; nowe role są wymienione
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) bez
liczb.

## 5. Kultura

Brak numeru. Twierdzenie jest jakościowe i sprawdzalne: przepis Cookwala zawiera imię kucharza, tożsamość dania (co jest niezbędne, co jest elastyczne, czego nigdy nie dodaje się), tekst w języku kucharza oraz podpis. Maszyny, które je gotują, dziedziczą przepis jako wiedzę operacyjną, z zachowaniem autorstwa.

## 6. Co będziemy mierzyć, gdy pojawi się coś do zmierzenia

| Miara | Metoda | Gdzie zdefiniowane |
|---|---|---|
| Kilogramy uratowane, posiłki wydane, osoby dotknięte, wskaźnik zaliczenia wartości odżywczych, koszt posiłku, czas na zgłoszenie, wskaźnik zgłoszeń, ustalenia dotyczące blokad bezpieczeństwa, incydenty bezpieczeństwa | obliczone na podstawie dokumentów Offer, Claim, Handover i Distribution | Humanitarian Profile section 10; `ImpactSummary` |
| Zweryfikowani kucharze: egzekucje, które przeprowadziły podpisaną recepturę od początku do końca z logiem zgodnym z conformance | execution logs z consent | `STRATEGY.md` section 11 |
| Niezależne implementacje przechodzące conformance | opublikowane raporty conformance | `docs/CERTIFICATION.md` |
| Wyniki Agent-safety na model | promptfoo benchmark, z model id, date i config hash | `evals/kitchen-agent-safety/` |

## 7. Czego jeszcze nie wiemy

Czy food bank ratuje więcej dzięki profilowi niż przy obecnej metodzie (istnieje protokół dry run; żaden pilot nie został przeprowadzony). Czy operation envelope są odpowiednie dla każdej kuchni (food scientist ich nie przeanalizował). Czy założenia behawioralne symulatorów są trafne (są wymienione i regulowane). Jak duże są efekty odbicia. Nic tutaj nie jest obietnicą.

## 8. Co poszło nie tak

Nic nie zostało wdrożone, więc nic nie poszło nie tak w terenie. W repozytorium: pierwszy one-liner („world's first and largest robot cooking recipes index”) wyolbrzymiał to, co istniało, i został zmieniony; pierwszy schemat Mission akceptował nieznane pola i został zmieniony na strict; pierwsze symulatory używały strawman baseline i uzyskały competent-integration baseline oraz zakresy. Krytyki, które wymusiły te zmiany, są opublikowane (`docs/CRITIQUES.md`).

## 9. Źródła

- FAO, IFAD, UNICEF, WFP i WHO, *The State of Food Security and Nutrition in the World
  2024*, Rzym, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Rzym, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Genewa, 2015.
- WHO, *Global report on sodium intake reduction*, Genewa, 2023; karta informacyjna WHO *Salt
  reduction*.
- Karta informacyjna WHO *Household air pollution*, 2024.

Liczby są cytowane w takiej formie, w jakiej publikują je źródła, po zaokrągleniu; przed cytowaniem w druku należy ponownie sprawdzić każdą z nich względem aktualnego wydania. Organizacje są źródłami, a nie partnerami.

