<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# Οδικός χάρτης: now, next, later

**Status:** 2026-10-04. Κάθε στοιχείο φέρει μια κατάσταση: **done**, **in progress**, **planned**,
**not yet funded**. Τα Gates προέρχονται από την ενότητα 4 του `ACTION-PLAN.md`. Τίποτα δεν μετακινείται από το planned
στο done χωρίς την ονομασμένη απόδειξη.

## Now (αυτή η έκδοση)

| Αντικείμενο | Κατάσταση |
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

## Next (εντός περίπου ενός έτους, καθώς οι πόροι το επιτρέπουν)

| Αντικείμενο | Κατάσταση | Πύλη |
|---|---|---|
| Επιστημονική αξιολόγηση των operation envelopes από επιστήμονα τροφίμων | planned | ο κριτικός συμφωνεί |
| Αξιολογήσεις από διαιτολόγο και υπεύθυνο ασφάλειας τροφίμων για τα τέσσερα rule packs | planned | οι αξιολογήσεις καταγράφηκαν· τα packs μεταφέρονται σε reviewed |
| Εκτίμησηผลής επίπρηξης στην προστασία δεδομένων του household profile | planned | ο κριτικός συμφωνεί |
| Μια πιλοτική εφαρμογή food-bank (12 weeks, προ-εγγεγραμμένη, ανεξάρτητος αξιολογητής) | not yet funded | συνεργάτης και χρηματοδότηση (`humanitarian/CONCEPT-NOTE.md`) |
| Αποτελέσματα agent-safety benchmark για αρκετές οικογένειες μοντέλων | planned | οι runs δημοσιεύονται με τη μέθοδο |
| `pip install cookwala` wheel και `@cookwala/sdk` στο npm | planned | συσκευασία που περιλαμβάνει λεξικά και schemas |
| Υπηρεσία Registry (`validate`, `publish`, tombstones) | planned | ένας worker και απόδειξη namespace |
| Πρώτος κατασκευαστής συσκευών που υλοποιεί το Core API έναντι του reference hub | planned | ένας κατασκευαστής συμφωνεί· το conformance report δημοσιεύεται |
| Μετατροπή των πρώτων συλλογών fifi.cooking | planned | ο ιδρυτής αποφασίζει τα δικαιώματα ανά συλλογή |
| Core 0.3 από το feedback των συσκευών | planned | feedback από δύο implementers |
| Steering committee | planned | τρεις ανεξάρτητοι adopters ή δύο implementations |

## Later

| Αντικείμενο | Κατάσταση |
|---|---|
| Μια πραγματική συσκευή που μαγειρεύει μια συνταγή Cookwala, χωρίς επεξεργασία, σε βίντεο | όχι ακόμη χρηματοδοτημένο· απαιτείται συνεργάτης συσκευών |
| Σχήμα certification με ανεξάρτητο πιστοποιητή | σχεδιασμένο· δεν έχει ανατεθεί πιστοποιητής |
| Ουδέτερο θεμέλιο για την προδιαγραφή, το εμπορικό σήμα και το σύμβολο | σχεδιασμένο |
| Δίκτυο συντελεστών: συγκατενευμένες ηχογραφήσεις πραγματικών συνταγών με αναφορά | σχεδιασμένο |
| Σήματα ζήτησης και προσφοράς που δημοσιεύονται από προγράμματα και συνεργασίες | σχεδιασμένο, μετά από έλεγχο βάσει του droit ανταγωνισμού |
| Benchmark "Cook in simulation" (Isaac Lab, Gazebo ή MuJoCo) | σχεδιασμένο |
| Αναγνώριση ως Digital Public Good για το Humanitarian Profile | σχεδιασμένο, μετά από pilot evidence |
| Ροές ανακούφισης μεταξύ περιዞχών στον παγκόσμιο simulator; αποτελέσματα clean-cooking | σχεδιασμένο |

## Τι δεν θα κάνουμε

Συλλογή προσωπικών δεδομένων· δημοσίευση αριθμών χωρίς μέθοδο· ονομασία ενός συνεργάτη πριν συμφωνήσει·
αποκάλυψη μιας certification που δεν υπάρχει· τοποθέτηση household data σε οποιοδήποτε ledger· δημιουργία ενός κεντρικού
orchestrator από εξαρτημένοι οι κουζίνες· ισχυρισμός ότι θα εξαλείψετε την πείνα.

## Κανόνες kill και pivot

Από το σχέδιο δράσης: εάν δύο γύροι εξωτερικής αναθεώρησης αποτύχουν να παράγουν έναν κατασκευαστή συσκευών ή έναν πιλοτικό συνεργάτη, η Cookwala περιορίζεται στο Humanitarian Profile και στο recipe format. Εάν ένας πιλοτικός έλεγχος δείξει κέρδος μικρότερο από 5 %, τα αποτελέσματα δημοσιεύονται και το προφίλ επανασχεδιάζεται πριν από οποιαδήποτε επέκταση.

