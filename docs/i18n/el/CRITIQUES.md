<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# Κριτικές που δημοσιεύσαμε

Ζητήσαμε δύσκολες ερωτήσεις σχετικά με το Cookwala και καταγράψαμε τις απαντήσεις. Κάθε ανησυχία έχει ένα id στο [action plan's concern register](ACTION-PLAN.md#2-concern-register), μαζί με την απάντησή μας και την κατάστασή της. Οι κριτικές από εξωτερικούς φορείς είναι ευπρόσδεκτες και θα καταχωρηθούν εδώ.

## Θα λειτουργήσει αυτό; (strategy)

| Concern | Short answer | Status |
|---|---|---|
| Η αγορά δεν υπάρχει ακόμα· το spec προηγείται των προϊόντων | Small Core, demo πρώτα, όχι νέο spec χωρίς χρήστες | Core 0.2 ολοκληρώθηκε· device demo next |
| Κανείς με δύναμη δεν έχει λόγο να υιοθετήσει | Ηγεσία μέσω του οφέλους κάθε υιοθετητή· χρήσιμο χωρίς ρομπότ | Αναζητούνται food-bank pilot και device partner |
| Οι simulators αποδεικνύουν αυτό που assume | Δίκαιη baseline, εύρη, ετικέτες "illustrative"· τα pilots τα αντικαθιστούν | Open |
| Η πείνα αφορά τη φτώχεια και τη σύγκρουση, όχι το surplus | Η Cookwala συμβάλλει· δεν ισχυρίζεται ότι τερματίζει μόνη της την πείνα | Message changed |
| Ασφάλεια, ευθύνη και attack surface | Περιορισμοί επιβάλλλονται στο device· refusal· recalls· incident reports | Spec done; certifier review open |
| Ιδιωτικότητα (δεδομένα υγείας και θρησκείας, ledgers έναντι erasure) | Local-first, selective disclosure, hash-only logs, consent | Spec done; impact assessment open |
| Πολύ πολύπλοκο | Core 0.2· όλα τα άλλα επισημασμένα ως experimental | Done |
| Εξάρτηση από τον ιδρυτή | Διαδρομή governance προς ένα ουδέτερο σπίτι | GOVERNANCE.md |

## Είναι το τεχνικό σχέδιο αξιόπιστο;

| Concern | Τι άλλαξε στο Core 0.2 |
|---|---|
| Οι λειτουργίες δεν είχαν φυσική σημασία | Envelopes, heat levels, sensor ladders, altitude rule, test vectors |
| Σφάλματα μονάδων και αριθμών | μόνο °C, absolute tolerances, kitchen units, densities, decimal money |
| Τα Schemas αποδέχονταν τυπογραφικά λάθη | Strict schemas με `x-` extensions; offline bundle |
| Ένα μεταβλητό έγγραφο Mission | Event log + projection, single sequencer, transitions table |
| Το ledger αποδίδει ελάχιστα | Key records με revocation, witnessed checkpoints, rewrite detection |
| Απροσδιόριστη παράδοση γεγονότων; ασφάλεια στο bus | Sequence numbers, latency classes, heartbeats, "safety is local" |
| Παρακλίσεις στις επιφάνειες API | Core OpenAPI; κάθε αναφορά ελέγχεται στο CI |
| Καμία επαλήθευση (verifier) | Reference library και 106 conformance vectors |

## Κριτικές που ζητάμε

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), επιστήμονες τροφίμων
(envelopes), υπάλληλοι ασφάλειας τροφίμων και διαιτολόγοι (rule packs), ένας έλεγχος ασφαλείας, μια
επανεξέταση προστασίας δεδομένων και μια ανάλυση κενών από πιστοποιητή. Δείτε το
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

