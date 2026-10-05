<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->

# Household Context Profile: το συνολικό εικόνα παραμένει στο σπίτι

> **Κατάσταση: draft profile** (RFC-0001). Δεν αποτελεί μέρος του Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Κανόνες παραλήπτη: `profiles/household/recipient-roles.json`. Τοπικό API:
> `api/household.openapi.yaml`. Παράδειγμα: `examples/household/context.json`.

## 1. Γιατί

Ένα ρομπότ που εξυπηρετεί καλά μια οικογένεια πρέπει να γνωρίζει πολλά: τις συσκευές και τις ιδιαιτερότητές τους, ποιος ζει εκεί και πότε είναι στο σπίτι, κατοικίδια, παιδιά, διατροφές, αλλεργίες, χρονισμό φαρμάκων, τελετουργίες, προϋπολογισμό, alışveriş συνήθειες, τι πήγε στραβά την τελευταία φορά. Τα ίδια γεγονότα αποτελούν ένα σχέδιο ληστείας και ένα εργαλείο προφίλ. Αυτό το προφίλ δίνει στον **planner at home** την πλήρη εικόνα και δίνει σε όλους τους άλλους μόνο έναν **constraint**.

## 2. Τρεις ιδέες

1. **Facets.** Ένα πληκτρολογημένο γεγονός το καθένα (`cw.facet.household.health.allergies`), με το ποιος
   το υποστήριξε (declared, observed, reported, inferred), πότε, για πόσο καιρό, πόσο σίγουρος,
   και μια κατηγορία ιδιωτικότητας (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in the registry.** Κάθε τύπος facet αναφέρει εάν η αraw τιμή του επιτρέπεται να βγει
   από το σπίτι: `never` (45 τύποι: children, absences, layouts, health conditions, religion,
   behaviour, incidents, income posture), μόνο ως `derived` constraint (81 τύποι), ή ως
   `consented` disclosure μετά από ρητή έγκριση (13 τύποι, κυρίως device self-state για τον
   maker).
3. **Derived constraints.** Το μόνο household object που λαμβάνει ένας επιπλοπωλητής, σχεδιαστής, υπηρεσία παράδοσης,
   κατασκευαστής συσκευών ή ένας άλλος robot: "deliver 17:00–18:00 to the front door",
   "block peanuts", "no robot movement in the hallway 15:00–15:30", "budget cap 18.00 USD per
   meal". Κάθε ένα ονομάζει τα **types** των facet από τα οποία προήλθε, ποτέ τις τιμές τους.

## 3. Ποιος παίρνει τι

| Ρόλος παραλήπτη | Μπορεί να λάβει |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI ή λογισμικό που σχεδιάζει το γεύμα) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | μόνο device fault summary (αριθμοί σφαλμάτων ανά κατηγορία, όχι χρόνοι, όχι household facts), και μόνο όταν το household έχει ορίσει έναν insurer ως παραλήπτη; το RFC-0001 αναφέρει αυτόν ως τον ρόλο που είναι πιο πιθανό να αφαιρεθεί εάν μια αναθεώρηση απορρήτου επισημάνει αντίρρηση |
| program (food bank, school) | τίποτα |
| dataset | τίποτα |

## 4. Κανόνες

- Τα ακατέργαστα facets δεν εγκαταλείπουν ποτέ τη συσκευή. Δεν υπάρχει API που τα επιστρέφει σε κανέναν εκτός του οικιακού δικτύου.
- Τα `inferred` facets δεν χρησιμοποιούνται ποτέ για αποφάσεις ασφαλείας.
- Δεν παράγεται ούτε αποθηκεύεται κανένα βαθμολογητικό σκορ συμπεριφοράς οποιουδήποτε προσώπου. Τα facets συμπεριφοράς υπάρχουν για να εξυπηρετούν το household (μεγέθη μερίδων, πότε να καθαριστεί) και δεν μετακινούνται ποτέ.
- Το οικονομικό επίπεδο είναι μια **θέση προϋπολογισμού που ορίζει ο ιδιοκτήτης**, ποτέ δεν συμπεραίνεται από κάτι άλλο.
- Τα δεδομένα και οι απουσίες των παιδιών είναι `secret` και δεν μετακινούνται ποτέ, ακόμη και αν είναι derived, εκτός αν πρόκειται για περιορισμούς κίνησης και safe-zone που δεν αποκαλύπτουν πρόγραμμα.
- Κάθε facet είναι διαγράφσιμο. Η διαγραφή ολοκληρώνεται εντός του παραθύρου του household (προεπιλογή 7 ημέρες, το πολύ 30) και καταγράφεται στο execution log χωρίς περιεχόμενο.
- Μια κατηγορία ιδιωτικότητας μπορεί να οριστεί υψηλότερα από την προεπιλογή του registry, ποτέ χαμηλότερα.

## 5. Η τοπική μνήμη συμβάντων

Το RFC-0001 ρωτά τι θυμάται ο ρομπότ σχετικά με συναγερμούς, συγκρούσεις, αποçάδες και μαθήματα. Το `LocalIncident` τα περιέχει: ημερομηνία, κατηγορία από το
`vocab/incidents.json`, ποιος εμπλέκεται ανά είδος, μια σημείωση και ένα μάθημα. Δεν εγκαταλείπει ποτέ το
σπίτι. Το δημόσιο, ανώνυμο `IncidentReport` στο Core είναι ένα διαφορετικό έγγραφο από το οποίο μαθαίνει κάθε
maker.

## 6. Conformance

Οι διανυσματικές προφίλ (`conformance/profiles/disclosure_policy.json`) παρέχουν facets και έναν ρόλο παραλήπτη και αναμένουν τους ακριβείς τύπους constraints, τα disclosed ids και τα withheld ids με τους λόγους. Η αναφορά υλοποίησης είναι η `derive_constraints()` στο `tools/cookwala_ref.py`.

## 7. Σχέση με άλλα έγγραφα

`ClientProfile`, `KitchenProfile` και `RobotProfile` (`profile.schema.json`) παραμένουν ως
ευסτάκτα πακέτα. Τα facets της αποστολής (`mission.schema.json`) χρησιμοποιούν τα ίδια ids του registry. Το
Core `AgentMandate` παραμένει η κανονιστική δήλωση για το τι μπορεί να κάνει ένας agent; τα facets του mandate
περιγράφουν τους κανόνες του household τοπικά.

## 8. Ανοικτές ερωτήσεις

Δείτε το RFC-0001: κλειστοί ρόλοι παραληπτών; raise-only privacy; μια εκτίμησηผลกระทu impact assessment με έναν κριτή.

