<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance και η διαδρομή προς την certification

**Status:** draft, 2026-10-04 (RFC-0008). Δεν έχει εμπλακεί ακόμη κανένας πιστοποιητής (certifier)· αυτή είναι η διαδρομή που προσφέρει το πρότυπο.

## 1. Τρία βήματα

| Βήμα | Ποιος | Τι σημαίνει | Εμφανίζεται ως |
|---|---|---|---|
| **Self-declared** | Ο κατασκευαστής ή ο εκδότης | Εκτέλεσε τα δημόσια vectors με το δημόσιο εργαλείο και δημοσίευσε ένα `ConformanceReport` (`schemas/conformance.schema.json`), υπογεγραμμένο με το δικό του κλειδί | η αναφορά, με τα suites και τους αριθμούς· ποτέ badge |
| **Verified** | Ένας λειτουργός registry | Αναπαραγώγησε το run σε σχέση με το ίδιο hash σετ vectors και υπογεγραμεί επαναλημμένα την αναφορά | η αναφορά συν ο verifier |
| **Certified** | Ένας ανεξάρτητος certifier (δεν υπάρχει κανένας σήμερα) | Εκτέλεσε το suite συν ελέγχους hardware και safety-case υπό ένα δημοσιευμένο scheme και χάρισε το mark | η αναφορά, ο certifier, το mark |

Ένα αναφορά που αποτυγχάνει σε οποιονδήποτε διάνυσμα μιας κατηγορίας δεν μπορεί να διεκδικήσει αυτή την κατηγορία. Το registry δείχνει
αναφορές, όχι badges.

Σήμερα ο μόνος λειτουργός του registry είναι ο συντηρητής των προδιαγραφών (cookwala.ai), επομένως το "verified" δεν προσθέτει
καμία ανεξαρτησία μέχρι να υπάρξει ένα δεύτερο registry· η κατάσταση εμφανίζεται ακόμα ως self-verification.

## 2. Τι περιέχει μια αναφορά

Κεντρική έκδοση, η τάση που ισχυρίστηκε (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) ή μια τάση προφίλ (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), το θέμα (προϊόν, προμηθευτής, έκδοση), τα suites που εκτελέστηκαν με τα σύνολα και τα αποτυχημένα
vector ids, το hash του συνόλου vector, το εργαλείο και το commit, η ημερομηνία, η κατάσταση και ο
verifier. Παράδειγμα: `examples/conformance/report-reference.json`, που παρήχθη από

```bash
python tools/run_conformance.py --report report.json
```

## 3. Κλάσεις και τι αποδεικνύουν

| Class | Vectors | Απαιτούνται επίσης για certification (δεν καλύπτονται από vectors) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | content review των recipes από επαγγελματία ασφάλειας τροφίμων |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | το δικό του safety case (ISO 13482, IEC 60335, UL 3300 όπου ισχύει); το measured local stop latency; safety limits που επιβάλλονται χωρίς δίκτυο |
| Catalog | hash, signature, key revocation, recalls | η διαδικασία key custody και incident intake |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | αποτελέσματα που δημοσιεύονται ανά model με μέθοδο |
| Verifier | όλα τα Core suites | κανένα |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; κανένας audit προσωπικών δεδομένων |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name and version rules, tombstones | η διαδικασία namespace proof |

## 4. Τι η certification δεν μπορεί να υπόσχεται

Ένα conformance report αποδεικνύει ότι το λογισμικό συμπεριφέρθηκε όπως απαιτούν τα vectors την ημέρα που εκτελέστηκε.
Δεν αποδεικνύει ότι μια συσκευή είναι ασφαλής σε κάθε κουζίνα, ότι μια συνταγή έχει σωστή γεύση, ή ότι
δεν μπορεί να συμβεί καμία βλάβη. Ένα standard που υποσχόταν μηδενική βλάβη θα ήταν ανειθικό; αυτό υπόσχεται
ότι τα όρια επιβάλλεται τοπικά, ότι οι refusals συμβαίνουν πριν από το heat, και ότι τα αρχεία μπορούν να
ελεγχθούν.

## 5. Διακυβέρνηση του mark

Το σύμβολο certification και οι κανόνες του μεταφέρονται στο ουδέτερο θεμέλιο μαζί με το εμπορικό σήμα (`GOVERNANCE.md`). Μέχρι τότε δεν υπάρχει κανένα σύμβολο· υπάρχουν μόνο αναφορές.

