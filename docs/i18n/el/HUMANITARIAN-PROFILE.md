<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Cookwala Ανθρωπιστιακό Προφίλ (draft 0.2)

**Status:** προσχέδιο για επανεξέταση από food banks, προγράμματα ανακούφισης και επαγγελματίες της ασφάλειας τροφίμων και της διατροφής. Δεν έχει ελεγχθεί ή επικυρωθεί από τον WFP, τον WHO, τον FAO, το Global FoodBanking Network ή οποιονδήποτε άλλο οργανισμό αναφέρεται εδώ.

**Αρχεία:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`basic-nutrition-food-safety`](../profiles/humanitarian/basic-nutrition-food-safety.rulepack.json) (όλα), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; όλα τα drafts αναμονής επαγγελματικής επανεξέτασης, δείτε [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank στο القاهرة, school meals, disaster kitchen, robot kitchen), το καθένα με ένα υπολογισμένο `ImpactSummary`
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Τι προσθέτει το 0.2 (RFC-0003, RFC-0004)

Προσθετικό πάνω από 0.1; οι αναγνώστες αποδέχονται και τα δύο.

- **Από την φάρμα στο πιάτο:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) και `Item.harvestedAt`; ρόλοι `farm`, `caterer`, `robot_kitchen`; η λέξη SMS `FARM`.
- **Κανόνες φροντίδας:** `Item.foodClasses` και `Distribution.menu.foodClasses` (ωμό αυγό, μη παστεριωμένα γαλακτοκομικά, ολόκληρα ξηρά καρπούς, μαγειρεμένο ρύζι…), είδος κανόνα `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; τρία νέα προσχέδια rule pack.
- **Αναθεωρήσεις:** το `RulePack.reviews` καταγράφει το επάγγελμα, τον οργανισμό, την ημερομηνία, το πεδίο εφαρμογής και το αποτέλεσμα κάθε αναθεώρησης· το `status: reviewed` απαιτεί μια εγκεκριμένη αναθεώρηση.
- **Αντίκτυπος:** `ImpactSummary` με εννέα μέτρα, το καθένα φέρει `method` (measured, modelled, assumed, not recorded), υπολογισμένα από το `tools/humanitarian_check.py --summary`.
- **Χρόνος για την απαίτηση:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` ώστε τα κιλά που σsave되었 να μετρούνται μία φορά.
- **Τύποι προγραμμάτων** στο `Manifest`.

## 1. Σκοπός

Ένα μικρό, αυστηρό, χωρίς προσωπικά δεδομένα τμήμα του Cookwala για οργανισμούς που τροφοδοτούν ανθρώπους:
food banks, κοινά κουζίνες, προγράμματα σχολικών γευμάτων, προγράμματα ανακούφισης, δωρητές (τροφονόμοι,
εστιατόρια, φάρμες, κατεριστές), μεταφορείς και ψυγεία αποθήκευσης. Καλύπτει τέσσερις εργασίες:

1. **Προσφορά surplus food** και απαίτησή της, γρήγορα και δίκαια.
2. **Καταγραφή κάθε παράδοσης** της κηδεμονίας, με έλεγχο θερμοκρασίας (cold-chain check).
3. **Αναφορά αυτού που σερβιρίστηκε** μόνο ως συνολικά ποσά.
4. **Έλεγχος μενού και παραδόσεων** σε σχέση με μηχανικά αναγνώσιμα κανόνες διατροφής και ασφάλειας τροφίμων.

**Λειτουργεί χωρίς ρομπότ, εφαρμογές ή internet.** Τα επίπεδα H0 και H1 εκτελούνται σε spreadsheets, SMS
και βασικά τηλέφωνα. Τα ρομπότ, τα hubs και οι agents είναι προαιρετικοί καταναλωτές των ίδιων εγγράφων.

## 2. Αρχές

- **Μην προκαλείτε βλάβη.** Μην συλλέγετε τίποτα που θα μπορούσε να προσδιορίσει, να εντοπίσει ή να προφιλοποιήσει ένα άτομο ή ένα household. Σε ευάλωτα περιβάλλοντα, τα δεδομένα σχετικά με τους δικαιούχους αποτελούν κίνδυνο προστασίας.
- **Ανθρωπιστικές αρχές** (ανθρωπιά, ουdeτερότητα, αμεροληψία, ανεξαρτησία): κανένα εμπορικό branding στη βοήθεια, και καμία χρήση δεδομένων για marketing.
- **Αυστηρά και μικρά.** Κάθε αντικείμενο απορρίπτει άγνωστα πεδία (εκτός από επεκτάσεις `x-`), έτσι ώστε τυπογραφικά λάθη και επιπλέον προσωπικά πεδία να αποτυγχάνουν στην επαλήθευση.
- **Ακριβείς μονάδες:** κιλά, βαθμοί Celsius, απόλυτες ανοχές, και χρήματα ως δεκαδικές συμβολοσειρές.
- **Οι τοπικοί κανόνες υπερέχουν.** Τα rule packs είναι αντικαθίστατα από τον εθνικό νόμο για την ασφάλεια τροφίμων και τις δωρεές.
- **Ανοικτό:** προδιαγραφή χωρίς δικαιώματα royalty, εργαλεία open-source. Το προφίλ έχει σχεδιαστεί για να πληροί το Digital Public Goods Standard και τα Principles for Digital Development.

## 3. Επίπεδα conformance

| Επίπεδο | Τι κάνει ένας συμμετέχων | Ανάγκες |
|---|---|---|
| **H0 — Paper & SMS** | Καταγράφει προσφορές, παραδόσεις και διανομές στα πρότυπα CSV (με σειρές HXL hashtag) ή μέσω SMS (section 8.3) | Ένα υπολογιστικό φύλλο ή ένα βασικό τηλέφωνο |
| **H1 — Rescue** | Ανταλλάσσει έγγραφα `Offer`, `Claim`, `Handover` και `Distribution` μέσω του API; ακολουθεί το state machine (section 5) | Οποιοσδήποτε HTTP client |
| **H2 — Safety & nutrition** | Εφαρμόζει ένα `RulePack` σε κάθε παράδοση και μενού, και καταγράφει `findings` | Ο reference checker ή ένας αντίστοιχος |
| **H3 — Interoperability** | Εξάγει συγκεντρωτικά δεδομένα σε HXL, DHIS2 και το κεντρικό Cookwala `ImpactReport`; χρησιμοποιεί GS1 identifiers | Εργασία ολοκλήρωσης (Integration work) |

Ένας συμμετέχων δημοσιεύει ένα `Manifest` στο `/.well-known/cookwala-humanitarian.json` που
δηλώνει τα επίπεδα, τα rule packs, τα endpoints και το `personalData: "none"`.

## 4. Έγγραφα

| Έγγραφο | Ποιος το γράφει | Σκοπός |
|---|---|---|
| `Offer` | Δωρητής | Surplus τροφίμων διαθέσιμα για συλλογή: είδη (kg, αποθήκευση, ημερομηνίες, αλλεργίδια), παράθυρο, τοποθεσία, θερμοκρασίες |
| `Claim` | Food bank, κουζίνα, πρόγραμμα | Απαιτεί ολόκληρη ή ένα μέρος μιας προσφοράς, με χρόνο παραλαβής και τύπο οχήματος |
| `Handover` | Αποδέκτης της φύλαξης | Ένα ανά leg: θερμοκρασίες, kg που αποδέχθηκαν ή απέρριψαν με έναν κωδικό αιτίας, και ευρήματα κανόνων |
| `Distribution` | Κουζίνα, food bank, σχολείο | Σύνολο γευμάτων και ανθρώπων που εξυπηρετήθηκαν σε μια τοποθεσία σε μια ημέρα; προαιρετικά θρεπτικά συστατικά και κόστη μενού |
| `RulePack` | Πρόγραμμα ή αρχή | Εκδοσιόνες κανόνων διατροφής και ασφάλειας τροφίμων (section 6) |
| `Manifest` | Κάθε συμμετέχων | Δήλωση δυνατοτήτων και προστασίας δεδομένων |

Τα βασικά έγγραφα ανακούφισης Cookwala (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` στο `relief.schema.json`) παραμένουν διαθέσιμα για τον σχεδιασμό. Αυτό το προφίλ διαχειρίζεται το
operational flow.

## 5. Κύκλος ζωής προσφοράς

| Από | Επιτρεπόμενες επόμενες καταστάσεις |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (η απαίτηση έληξε), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | καμία (τελική) |

**Κανόνες για αλλαγές κατάστασης:**

- Κάθε αλλαγή αυξάνει το `version`. Οι συγγραφείς στέλνουν `If-Match: <version>`; μια μη ταυτότητα επιστρέφει
  **409**, και ο συγγραφέας ξαναδιαβάζει και δοκιμάζει ξανά.
- Μια παράνομη μετάβαση επιστρέφει **409** με τις επιτρεπόμενες μεταβάσεις.
- Οι προσφορές μετακινούνται σε `expired` αυτόματα στο `window.to`.
- Οι αξιώσεις λήγουν στο `pickupBy` συν μια περίοδος χάριτος που ορίζει το πρόγραμμα (προεπιλογή 30 λεπτά).

**Δίκαιη αξίωση.** Από προεπιλογή, οι αξιώσεις ακολουθούν την αρχή του «πρώτου που έρχεται» εντός ενός επιπέδου προτεραιότητας που ορίζει το πρόγραμμα:
για παράδειγμα, κουζίνες που εξυπηρετούν παιδιά πρώτα, μετά άλλες κουζίνες, και μετά food banks. Τα επίπεδα και
οποιοι κανόνες περιστροφής πρέπει να δημοσιεύονται στο `Manifest` του προγράμματος ή στην ιστοσελίδα του.

## 6. Πακέτα κανόνων ασφάλειας τροφίμων και διατροφής

Ένα `RulePack` περιέχει κανόνες έξι ειδών:

- `temperature`: ψυχρό ≤ 5 °C, διατήρηση θερμού ≥ 60 °C, κατεψυγμένο ≤ −18 °C;
- `time`: μαγειρεμένο τρόφιμο εκτός θερμοκρασιακού ελέγχου για το πολύ 2 h;
- `date_mark`: τα blocks use-by, τα warns best-before;
- `allergen`: block μη δηλωμένων α러γενών;
- `nutrient`: ποσότητες ανά person-day ή ανά γεύμα;
- `energy_share`: μερίδιο ενέργειας από ελεύθερα σάκχαρα, λιπαρά, κορεσμένα λιπαρά, trans fat ή πρωτεΐνη.

Κάθε κανόνας είναι είτε `block` (μη αποδοχή ή εξυπηρέτηση) είτε `warn` (επιτρέπεται, καταγράφεται ως εύρημα).

Το προεπιλεγμένο pack `basic-nutrition-food-safety@0.1.0` είναι ένα **draft derived from public guidance**: οι οδηγίες του WHO για healthy-diet, sodium, sugars και fats, τα WHO Five Keys to Safer Food, οι Codex labelling και frozen-food codes, και τα Sphere minimum ration planning figures. Είναι απλοποιημένο, όχι ιατρική συμβουλή, αποκλείει την infant και therapeutic feeding, και πρέπει να ελέγχεται από εξειδικευμένο προσωπικό. Τα προγράμματα πρέπει να το αντιγράφουν και να το προσαρμόζουν, να ορίζουν το `jurisdiction`, και να καταγράφουν ποιος το εξέτασε στο `reviewedBy`.

Οι δέκτες στο επίπεδο H2 εκτελούν το pack σε κάθε handover και σε κάθε μενού, και καταγράφουν τα rule ids στο `findings`. Ο ελεγκτής αναφοράς αναφέρει όπου τα δηλωμένα και τα υπολογισμένα findings διαφωνούν.

## 7. Προστασία δεδομένων

**Το προφίλ δεν περιέχει προσωπικά δεδομένα. Τα έγγραφα ΜΗΧΑΝΙΚΑ ΔΕΝ ΠΡΕΠΕΙ να περιέχουν:**

- ονόματα, τηλέφωνα, emails, ή εθνικά, προσφυγικά ή βιομετρικά στοιχεία ταυτοποίησης οποιουδήποτε προσώπου·
- καταχωρήσεις επιπέδου household, ή τοποθεσίες σπιτιών ή ατόμων·
- υγεία, αναπηρία, θρησκεία ή εθνικότητα οποιουδήποτε προσώπου.

**Τι μεταφέρει αντί τούτο:**

- **Μόνο οργανισμοί.** Κάθε μέρος είναι ένας οργανισμός που προσδιορίζεται από `did:web`, ένα GS1
  Global Location Number (GLN) ή ένα registry id. Οι άνθρωποι εμφανίζονται μόνο ως ρόλοι
  (`checkedBy: "trained_staff"`).
- **Μόνο συγκεντρωτικά δεδομένα.** Το `Distribution.people` περιέχει καταμέτρησης ανά ομάδα, και οποιαδήποτε καταμέτρηση κάτω από 10
  αναφέρεται ως `"<10"`.
- **Μόνο τοποθεσίες.** Μια `Site` είναι οι εγκαταστάσεις ενός οργανισμού ή μια διοικητική περιοχή
  (OCHA P-codes), ποτέ ένα household.
- **Σύντομες σημειώσεις.** Το ελεύθερο κείμενο περιορίζεται σε λειτουργικές σημειώσεις 280 χαρακτήρων και δεν πρέπει να
  περιέχει προσωπικά δεδομένα. Οι υλοποιήσεις πρέπει να σαρώνουν τις σημειώσεις για αριθμούς τηλεφώνου και ids
  πριν τις αποθηκεύσουν.

**Διατήρηση και έλεγχος:**

- **Retention:** κάθε συμμετέχων δηλώνει `retentionDays` στο `Manifest` του και διαγράφει
  έγγραφα μετά από αυτό.
- **Audit (προαιρετικό, `hash_only`):** ένας sequencer ανά πρόγραμμα (συνήθως το food bank ή ο
  εκτελεστής του προγράμματος) προσθέτει το SHA-256 hash του RFC 8785 canonical JSON κάθε εγγράφου.
  Το περιεχόμενο αποθηκεύεται ξεχωριστά και παραμένει επιτρεπτό προς διαγραφή. Μια οργανωτική
  συνεργάτης υπογράφει κάθε ημέρα ένα checkpoint, ώστε η ιστορία να μην μπορεί να ξαναγραφεί αθόρυβα. Ένας μόνο
  sequencer αποφεύγει τα forks στην αλυσίδα.
- **Hosting** πρέπει να είναι εντός της χώρας όπου ο νόμος ή το πρόγραμμα το απαιτεί.

## 8. Μεταφορά

### 8.1 API (επίπεδο H1)

| Μέθοδος | Διαδρομή | Σημειώσεις |
|---|---|---|
| `POST` | `/offers` | Δημιουργεί μια προσφορά (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Ανοικτές προσφορές κοντά σε έναν παραλήπτη |
| `POST` | `/offers/{id}/claims` | Κυρώνεται μια προσφορά; `If-Match` απαιτείται; 409 όταν έχει ήδη κυρωθεί |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` απαιτείται |
| `POST` | `/handovers` | Καταγράφει μια παράδοση |
| `POST` | `/distributions` | Καταγράφει μια διανομή |
| `GET` | `/reports?from=…&to=…` | Συγκεντρώνει δεδομένα για μια περίοδο |

Κανόνες αιτήματος και μεταφοράς:

- **Idempotency:** κάθε `POST` φέρει ένα `Idempotency-Key`. Οι διακομιστές διατηρούν κλειδιά για τουλάχιστον 24 h και επιστρέφουν την αρχική απόκριση για επαναλήψεις.
- **Authentication:** OAuth 2.1 client credentials, ένας client ανά οργάνωση.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  παραδίδονται τουλάχιστον μία φορά, με ένα event `id` για αποδιπλασιασμό και έναν αριθμό σειράς ανά offer για την κατάταξη.

### 8.2 Υπολογιστικά φύλλα (επίπεδο H0)

Χρησιμοποιήστε τα πρότυπα CSV στο `profiles/humanitarian/templates/`. Η δεύτερη σειρά τους περιέχει
[HXL](https://hxlstandard.org) hashtags, ώστε τα εργαλεία δεδομένων ανθρωπιστικής βοήθειας να μπορούν να τα διαβάζουν απευθείας.

### 8.3 SMS (επίπεδο H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

Η γραμματική υλοποιείται στο `tools/cookwala_ref.py` (`parse_sms`) και ελέγχεται από το
`conformance/profiles/sms.json`. Οι λέξεις-κλειδιά είναι αγγλικές· οι αραβικά-ινδικές (٠-٩) και περσικές (۰-۹)
ψηφία γίνονται δεκτά όπου και αν υπάρχει ψηφίο, επομένως ένα τηλέφωνο που έχει ρυθμισμένο οποιοδήποτε πληκτρολόγιο λειτουργεί.

Κωδικοί αποθήκευσης: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Σημάδια ημερομηνίας: `UB` use-by,
`BB` best-before, `HV` harvested, ως `DDMM`. Κωδικοί λόγου απόρριψης: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; οποιαδήποτε άλλη λέξη καταγράφεται ως `other`. Η απάντηση `HELP` ΠΡΕΠΕΙ να είναι ένα παράδειγμα ανά εντολή, απλό ASCII, κάτω από 160 χαρακτήρες.

Ένα gateway ΠΡΕΠΕΙ να εφαρμόζει αυτές τις ελέγχους πριν γράψει ένα έγγραφο (`sms_storage_findings` στο
αναφοράς; τα ids είναι findings του block):

| Εύρημα | Πότε |
|---|---|
| `safety.temp_not_recorded` | ένα `HAND` σε μια γραμμή ψυχής, κατεψυγμένης ή θερμής διατήρησης δεν φέρει ανάγνωση `T`: απαντήστε ζητώντας την, μην γράψετε τίποτα |
| `safety.hot_hold_min` | μια `OFFER` με αποθήκευση `H` κάτω από 60 °C: αρνηθείτε να την καταγράψετε |
| `safety.storage_class_mismatch` | οι λέξεις του αντικειμένου υπονοούν γαλακτοκομικά, κρέας,poultry, ψάρι, αυγό ή μαγειρεμένο φαγητό και η αποθήκευση είναι `A`: αρνηθείτε να την καταγράψετε |
| `safety.chilled_max`, `safety.frozen_max` | αναγνώσεις άνω των 5 °C ή άνω των −18 °C κατά την προσφορά ή την παράδοση |

Οι προσφορές τροφίμων που διατηρούνται ζεστά κλείνουν μετά από δύο ώρες (μία ώρα για μαγειρεμένο ρύζι)· μια gateway δεν αποθηκεύει ποτέ μια τιμή placeholder. Η gateway αντιστοιχίζει τον εγγεγραμμένο αριθμό του αποστολέα σε έναν οργανισμό, ποτέ σε πρόσωπο στα έγγραφα.

## 9. Διαλειτουργικότητα

| Σύστημα | Χαρτογράφηση |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (προϊόντα); `Site.gln` και `OrgId` `gln:` (τοποθεσίες) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Συγκεντρωτικές τιμές δεδομένων ανά site και περίοδο από το `Distribution` (meals, people by group, kg, incidents) |
| WFP SCOPE και άλλα συστήματα δικαιούχων | **Μόνο συγκεντρωτικά δεδομένα.** Καμία καταγραφή δικαιούχου δεν εισέρχεται ή εξέρχεται από αυτό το προφίλ |
| Food-rescue apps | Οι προσαρμογείς χαρτογραφούν τις καταχωρίσεις τους στο `Offer` και τις παραλαβές τους στο `Claim` και `Handover` |
| Core Cookwala | Το `Item.ingredientId` και το `menu.recipes` συνδέονται με τον δείκτη συνταγών; το `relief.ImpactReport` αθροίζει τα `Distribution`s |

## 10. Μετρικές πιλοτικού προγράμματος (ορίζονται έτσι ώστε να μπορούν να συγκρίνονται οι τοποθεσίες)

Υπολογίστηκε σε ένα `ImpactSummary` από το `python tools/humanitarian_check.py --summary DIR`. Πώς εκτελείται και κρίνεται ένα pilot: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Μετρική | Ορισμός |
|---|---|
| Kg rescued | Άθροισμα των `Handover.kgAccepted` στο πρώτο στάδιο από τους δωρητές |
| Claim rate | Προσφορές που φτάνουν σε `claimed` ÷ προσφορές που δημιουργήθηκαν |
| Time to claim | Μεσοσχηνο λεπτών από τη δημιουργία της `Offer` έως την κατάσταση `claimed` |
| Rejection by reason | Άθροισμα των `kgRejected` ανά `reason` |
| Meals served | Άθροισμα των `Distribution.meals` |
| Nutrition pass rate | Διανομές με μενού και χωρίς ευρήματα `nutrition.*` ÷ διανομές με μενού |
| Cost per meal | (food + transport + staff + energy) ÷ meals |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Safety | Καταμέτρηση ευρημάτων `safety.*` block και `safetyIncidents` |

## 11. Ασφάλεια

- **Οι υπογραφές είναι προαιρετικές στο H1** και απαιτούνται για διαድርganική ελεγκτική διαδικασία στο H3
  (EdDSA, κλειδιά δημοσιευμένα στο `did:web` του οργανισμού).
- **Οι σημειώσεις και τα ονόματα στα έγγραφα είναι μη έμπιστα δεδομένα.** Το λογισμικό και οι πράκτορες AI δεν πρέπει ποτέ
  να τα αντιμετωπίζουν ως οδηγίες.
- **Τα rule packs έχουν έκδοση και είναι σταθερά** (`id@version`) σε κάθε εύρημα, ώστε τα αποτελέσματα να είναι
  αναπαραγώγιμα.

## 12. Σκόπιμα παραλείφθηκε

- Εγγραφή δικαιούχου, επιλεξιμότητα και στόχευση (αυτά ανήκουν στα ίδια
  προστατευμένα συστήματα του προγράμματος).
- Πληρωμές: η Cookwala δεν μεταφέρει ποτέ χρήματα.
- Συνταγές και εκτέλεση ρομπότ (η βασική προδιαγραφή). Το προφίλ ονομάζει μόνο συνταγές και αναφέρει
  θρεπτικά συστατικά.
- Ιατρική και θεραπευτική διατροφή.

## 13. Πώς να κάνετε επανεξέταση

Παρακαλώ ανοίξτε issues στο [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
με το label `humanitarian`. Αυτές οι κριτικές είναι οι πιο χρήσιμες:

- προσωπικό ασφάλειας τροφίμων που ελέγχει το rule pack και τους λόγους απόρριψης·
- λειτουργοί food-bank που ελέγχουν τον κύκλο ζωής και τη ροή SMS·
- υπάλληλοι προστασίας δεδομένων που ελέγχουν την ενότητα 7.

