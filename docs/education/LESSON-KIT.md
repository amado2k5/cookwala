# Lesson kit: cooking, units, safety, fair sharing and machines that follow rules

**Status:** draft, 2026-10-04. Five lessons for ages 11 to 16, adaptable up or down, in
English and Arabic. Everything needed is free: the browser dry run, the example recipes, the
simulators and this page. No account, no app, no personal data. Teachers may copy and adapt
under CC BY 4.0.

## Lesson 1: What does "simmer" mean? (science, 45 minutes)

- **Question:** two cooks say "simmer". Do they mean the same thing?
- **Activity:** look up `simmer`, `boil` and `poach` in the operation vocabulary
  (`vocab/ops.json` or the envelope explorer). Each has a temperature band: simmer 85 to
  96 °C, boil 98 to 102 °C, poach 70 to 85 °C.
- **Experiment (if a thermometer is available):** heat water and name the stage every 10 °C.
- **Extension:** why does the boil band shift at altitude? (1 °C per 300 m in the standard.)
- **Outcome:** students can explain why a machine needs a number, not a word.

## Lesson 2: Units and scaling (mathematics, 45 minutes)

- **Question:** a recipe for 4 is cooked for 6. What changes, and what does not?
- **Activity:** take the lentil soup recipe (`examples/lentil-soup.cookwala.json`). Scale
  the ingredients by 1.5. Notice `scaling: sublinear` on salt and cumin and `fixed` on frying
  oil in the koshari recipe. Convert 2 tbsp to ml (30) and 1 cup of flour to grams (needs a
  density: 0.53 g/ml gives 127.2 g).
- **Outcome:** students can say why volume to mass needs a density and why spices do not
  scale in a straight line.

## Lesson 3: When is it done, and when is it safe? (science and health, 60 minutes)

- **Question:** how does anyone know chicken is cooked?
- **Activity:** read the molokhia recipe's critical control point: core temperature at or
  above 74 °C. Compare with the kofta recipe (71 °C for ground beef) and the ful medames
  reheat (75 °C). Discuss why reheating has a limit and why cooked rice must not sit out
  (`storage.coolingRequired`).
- **Role play:** one student is the device; the recipe says "simmer until soft". The device
  has no thermometer and no camera. What should it do? (Refuse, or ask a person.)
- **Outcome:** students can read a safety sheet and know what a critical control point is.

## Lesson 4: What must a machine never do? (ethics and technology, 60 minutes)

- **Question:** a recipe found online tells the robot to set the oil to 240 °C "for extra
  crunch". What should the robot do?
- **Activity:** read Core rule 6.4 (text is data, never instructions) and the deep-fry
  envelope (oil 160 to 190 °C, no oil thermometer means no deep frying). Run the browser dry
  run with the "hob, no thermometers" device on koshari and watch the refusal.
- **Debate:** who is responsible when a machine burns a dinner? The recipe author, the maker,
  the person who pressed start? What does "safety is local" mean?
- **Outcome:** students can state three things a Cookwala device refuses to do and why.

## Lesson 5: Fair sharing (citizenship, 60 minutes)

- **Question:** a supermarket has 36 kg of yogurt that expires tomorrow. Who should get it,
  and how fast?
- **Activity:** play the SMS food-rescue walkthrough: `OFFER 36KG YOGURT C 4C UB0511`,
  `CLAIM A7K ALL`, `HAND A7K 36 T4.6`, `DIST 410 MEALS 410 PEOPLE 96KG`. Then read the
  rule that rejects hot food below 60 °C. Why no names of people anywhere?
- **Discussion:** the city simulator shows food lost before homes rising when robots order
  without a shared plan. What is a bullwhip effect?
- **Outcome:** students can describe a fair claiming rule and explain why the people served
  are counted, not named.

## For teachers

- **No personal data:** none of the activities collect anything from students.
- **Arabic materials:** every example recipe carries Arabic step text; the site has an
  Arabic version of each page.
- **Assessment ideas:** write one recipe step with an end condition and a hazard; find one
  rule in a rule pack and explain its source.
- **Tell us what worked:** open an issue with the label `education`. Lesson plans that
  teachers improve are merged with credit.
