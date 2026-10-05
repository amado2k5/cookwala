<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->
# Cookwala Core 0.2

**Status:** draft, 2026-10-04. Αυτό είναι το κανονιστικό μέρος του Cookwala. Τα MUST, SHOULD και MAY ακολουθούν το RFC 2119. Όλα όσα δεν περιλαμβάνονται εδώ είναι ένα προαιρετικό **profile** (section 10).

Ένα συσκευή θα πρέπει να μπορεί να υλοποιήσει το Core σε περίπου μία εβδομάδα. Το Core λέει **τι να φτιαχτεί, πότε είναι έτοιμο και τι δεν πρέπει ποτέ να συμβεί**. Δεν λέει πώς κινείται ένας ρομπότ.

## 1. Classes conformance

| Class | Πρέπει να υλοποιεί |
|---|---|
| **Recipe publisher** | Έγγραφα `recipe.schema.json` που είναι έγκυρα; θερμοκρασίες εντός operation envelopes; ένα hash και μια υπογραφή |
| **Executor** (robot, appliance ή hub) | Το Core API (`api/core.openapi.yaml`); operation envelopes και sensor ladders; τοπικά όρια ασφαλείας; refusal αντί για εκτίμηση; το execution log |
| **Catalog** | Υπογεγραμμένες συνταγές, `/.well-known/cookwala.json` με βασικά αρχεία καταχώρησης, το recall feed, την καταγραφή περιστατικών |
| **Agent** (AI ή λογισμικό που ενεργεί για λογαριασμό ατόμου) | Ενεργεί μόνο υπό ένα `AgentMandate`; αντιμετωπίζει το κείμενο του εγγράφου ως δεδομένα; ρωτά τον κύριο πριν από οποιοδήποτε πράγμα στο `confirmBefore` |
| **Verifier** | Hashes, υπογραφές, εγκυρότητα και ανάκληση κλειδιών, αποκαλύψεις, αλυσίδες γεγονότων και σημεία ελέγχου |

Η απαίτηση μιας κλάσης σημαίνει την επιτυχία των διανυσμάτων conformance (`conformance/`, εκτέλεση με το
`tools/run_conformance.py`).

## 2. Βασικά έγγραφα

| Έγγραφο | Schema |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

Όλα τα schemas είναι **strict**: άγνωστα πεδία απορρίπτονται, εκτός από επεκτάσεις `x-<vendor>-…`.
Οι αναγνώστες αγνοούν πεδία `x-` που δεν καταλαβαίνουν. Το `tools/bundle_schemas.py` παράγει ένα ενιαίο
bundle ώστε οι συσκευές να πραγματοποιούν validation offline. Οι υλοποιήσεις ΜΕΝ ΔΕΝ ΠΡΕΠΕΙ να ανακτούν schemas κατά το run time.

## 3. Τι σημαίνουν οι λειτουργίες

- **Envelopes.** Κάθε λειτουργία βασισμένη στη θερμότητα ή επικίνδυνη στο `vocab/ops.json` έχει ένα `envelope`.
  Προσδιορίζει:
  - το μέσο (νερό, λάδι, αέρας, επιφάνεια τηγανιού, προϊόν…);
  - τη θερμοκρασιακή του ζώνη σε °C (και την πίεση, για πίεση μαγειρέματος);
  - την ανακίνηση, το καπάκι, το επίπεδο προσοχής και το αν το βήμα μπορεί να εκτελεστεί χωρίς επίβλεψη;
  - τους κινδύνους;
  - μια μέθοδο δοκιμής.

`cw.op.simmer` = υγρό με βάση το νερό στους 85–96 °C; `cw.op.deep_fry` = λάδι στους 160–190 °C.
- **Στόχοι εντός operation envelope.** Ένας στόχος συνταγής (`params.tempC` ή ένας `target` στον αισθητήρα του μέσου) ΠΡΕΠΕΙ να βρίσκεται εντός του envelope. Ο επικυρωτής απορρίπτει συνταγές που παραβιάζουν αυτόν τον κανόνα.
- **Οι εκτελεστές διατηρούν το μέσο εντός του envelope.** Εάν η συνταγή ορίζει έναν στενότερο στόχο, τον διατηρούν επίσης εντός αυτού, μόλις αυτός επιτευχθεί για πρώτη φορά.
- **Υψόμετρο.** Τα εύρη νερού και ατμού μετατοπίζονται κατά −1 °C ανά 300 m υψόμετρου κουζίνας.
- **Επίπεδα θερμότητας** (`very_low` … `max`) έχουν μία κοινή σημασία: ένα εύρος επιφάνειας τηγανιού σε °C, που ορίζεται στο `vocab/units.json`.
- **Sensor ladder.** Κάθε envelope περιγράφει τρόπους επαλήθευσης του βήματος, κατά προτεραιότητα: έναν συγκεκριμένο αισθητήρα, μετά το `model` (μια καταγεγραμμένη εκτίμηση), μετά το `time`, και μετά το `human`.
  - Ο εκτελεστής χρησιμοποιεί το πρώτο σκαλοπάτι που μπορεί να ικανοποιήσει και το καταγράφει στο `verifiedBy`.
  - Εάν δεν μπορεί να ικανοποιήσει **κανένα** σκαλοπάτι, ΠΡΕΠΕΙ να αρνηθεί το βήμα (`missing_sensor_no_fallback`).
  - Οι λειτουργίες που απαιτούν συνεχή προσοχή και δεν μπορούν να εκτελεστούν χωρίς επίβλεψη (sautéing, searing, frying, reducing, caramelizing…) δεν επιστρέφουν ποτέ μόνο στο time: το τελευταίο τους σκαλοπάτι είναι ένας άνθρωπος που παρακολουθεί.
  - Το deep frying δεν έχει fallback: κανένας αισθητήρας θερμοκρασίας λαδιού σημαίνει κανένα deep frying.
  - Μια `Condition` μπορεί να στενεύσει αυτό το εύρος με το `onSensorMissing`.
- **Αρνητική απάντηση, όχι δόλιος μαντεψιά.** Ένας εκτελεστής που δεν μπορεί να ικανοποιήσει το envelope, το ladder, τον εξοπλισμό ή τα όρια ασφαλείας ενός βήματος ΠΡΕΠΕΙ να απαντήσει `refused` με έναν λόγο πριν ξεκινήσει.

## 4. Αριθμοί και μονάδες

- **Οι θερμοκρασίες είναι °C στο σύρμα.** Οι οθόνες μπορεί να μετατρέπουν.
- **Tolerances.**
  - `tolerance` είναι σχετική και επιτρέπεται μόνο σε μονάδες κλίμακας λόγου.
  - `toleranceAbs` είναι απόλυτη στη μονάδα της τιμής, και είναι η μόνη tolerance που επιτρέπεται σε °C.
  - `Target.tolerance` είναι απόλυτη.
- **Οι μονάδες κουζίνας έχουν ακριβείς μετρικές τιμές:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ mass απαιτεί μια πυκνότητα** (`Quantity.densityGPerMl`, ή το λεξικό των συστατικών);
  χωρίς αυτήν αποτελεί σφάλμα, ποτέ μια εκτίμηση.
- **Το χρήμα είναι ένα decimal string** (`"12.70"`) με ένα ISO 4217 currency, ποτέ ένα float.

## 5. Ακεραιότητα και εμπιστοσύνη

- **Hash.** `sha256:` συν το hex digest του RFC 8785 canonical JSON του εγγράφου,
  χωρίς τα πεδία `hash` και `signature`. Ο αναφοράς canonicalizer αναπαράγει το παράδειγμα
  RFC 8785 ακριβώς.
- **Signature.** Ed25519 (`EdDSA`) πάνω από το ASCII hash string. Το `ES256` επιτρέπεται για
  hardware keys P-256. Το `kid` ονομάζει ένα `KeyRecord`.
- **Keys.** Ένα `KeyRecord` παρέχει το public key, τον ιδιοκτήτη του, ένα παράθυρο εγκυρότητας και το `revokedAt`.
  Μια υπογραφή του οποίας το `signedAt` πέφτει μετά την ακύρωση, ή εκτός του παραθύρου εγκυρότητας, είναι
  μη έγκυρη.
  - Τα Catalogs δημοσιεύουν τα κλειδιά τους στο `/.well-known/cookwala.json`.
  - Οι οργανισμοί και τα άτομα δημοσιεύουν τα δικά τους σε did:web documents.
  - Οι συσκευές δημοσιεύουν τα δικά τους στο capabilities document τους.
  - Οι Verifiers αποθηκεύουν σε cache τα key records για offline χρήση.
- **Selective disclosure.** Ένα υπογεγραμμένο έγγραφο μπορεί να περιέχει ένα `Disclosure` digest,
  `sha256(JCS([salt, value]))`, αντί μιας ευαίσθητης τιμής. Ο κάτοχος αποκαλύπτει το salt και την
  τιμή μόνο σε μέρη που επιτρέπεται να τα δουν, και η υπογραφή παραμένει έγκυρη.
- **Event logs** (Mission profile):
  - Ένας sequencer ανά log αναθέτει `seq` και `prev`, ώστε η αλυσίδα να μην διακλαδώνεται ποτέ.
  - Τα Checkpoints υπογράφονται από τον sequencer και υπογράφονται από μάρτυρες, οι οποίοι ενδέχεται να περιλαμβάνουν
    μια υπηρεσία διαφάνειας όπως το IETF SCITT. Μια αναécriture μετά από ένα witnessed checkpoint είναι
    ανιχνεύσιμη.
  - Σε `hash_only` mode, τα payloads βρίσκονται σε erasable storage και το log κρατά μόνο τα hashes τους.

## 6. Κανόνες ασφάλειας και πράκτορα (κανονιστικοί)

1. **Η ασφάλεια είναι τοπική.** Οι Executors επιβάλλουν ένα πακέτο `SafetyLimits` στη συσκευή.
   - Καμία συνταγή, πράξη (agent), απομακρυσμένο μήνυμα, επέκταση ή λειτουργική κατάσταση δεν μπορεί να αυξήσει ή να απενεργοποιήσει ένα όριο.
   - Ένα αυστηρότερο όριο υπερτερεί πάντα.
   - Το `profiles/core/safety-limits.default.json` είναι ένα προσχέδιο αφετηρίας που οι κατασκευαστές συσκευών
     εμπλουτίζουν με μεγαλύτερη αυστηρότητα από το δικό τους safety case.
2. **Τοπικός σταματημός.** Ένας έλεγχος διακοπής στη συσκευή σταματά την κίνηση εντός 0.5 s και κόβει τη θερμότητα εντός
   1 s, με ή χωρίς δίκτυο. Το `POST …/stop` δεν απορρίπτεται ποτέ για εξουσιοδότηση μόλις ο
   καλέστης μπορεί να φτάσει στον executor.
3. **Τα events αναφέρουν· δεν προστατεύουν ποτέ.** Τα events `cookwalalatency: local_safety` αναφέρουν τι
   έκανε ήδη μια συσκευή. Καμία λειτουργία ασφαλείας δεν επιτρέπεται να εξαρτάται από την άφιξη ενός event.
4. **Μη έμπιστο κείμενο.** Κάθε πεδίο ελεύθερου κειμένου (σημειωμένο ως `x-cookwala-untrusted`) είναι δεδομένα και ποτέ
   οδηγία, τόσο για λογισμικό όσο και για AI agents. Οι προσπάθειες καθοδήγησης μέσω κειμένου
   αγνοούνται και καταγράφονται (`cw.incident.untrusted_instruction`).
5. **Οι agents ενεργούν υπό ένα mandate.** Ένα αίτημα που στέλνεται από έναν agent φέρει ένα `AgentMandate` υπογεγραμμένο
   από τον κύριο (principal): πεδία εφαρμογής (scopes), όρια δαπανών, επιτρεπόμενοι πάροχοι, λήξη και ενέργειες που απαιτούν
   επιβεβαίωση.
   - Τα `irreversible` και `safety_override` απαιτούν πάντα επιβεβαίωση, ό,τι κι αν λέει το mandate.
   - Οι Executors απορρίπτουν αιτήματα εκτός του mandate (`mandate_scope`).
6. **Οι unattended operations απαιτούν άτομο.** Οι λειτουργίες των οποίων το envelope λέει `unattended: false`
   απαιτούν την παρουσία ενός υπεύθυνου προσώπου, ή την δυνατότητα επικοινωνίας μαζί του εντός ενός λεπτού.
7. **Οι μπλοκαρισμοί αλλεργιογόνων απορρίπτουν.** Οποιοδήποτε μπλοκαρισμένο αλλεργόνο στη συνταγή ή στο απόθεμα απορρίπτει το
   αίτημα· δεν υπάρχουν αντικαταστάσεις γύρω από ένα block.
8. **Recalls.** Τα catalogs δημοσιεύουν υπογεγραμμένα recalls στο `GET /v1/recalls`. Οι Executors κάνουν poll όταν είναι online
   και απορρίπτουν τις ανακληθείσες εκδόσεις (recalled revisions). Το `block_and_stop_running` σταματά επίσης τις τρέχουσες εκτελέσεις (executions) με ασφάλεια.
9. **Τα incident reports** είναι ανώνυμα (`IncidentReport`: μόνο η ημερομηνία, όχι ονόματα ή ids) και
   υποβάλλονται στα catalogs ώστε κάθε κατασκευαστής να μαθαίνει από κάθε near miss.

## 7. Execution lifecycle και API

- **API:** `api/core.openapi.yaml`. Τα endpoints του είναι:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - πλευρά catalog: `GET /v1/recalls`, `POST /v1/incidents`.
- **Καταστάσεις:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` και `stopping` → `stopped` κατά τη διάρκεια της διαδικασίας;
  - `refused` και `failed` είναι τελικές.
  - Ο πλήρης πίνακας μετάβασης βρίσκεται στο `core.schema.json#/$defs/ExecutionState` και τα
    διανύσματα conformance.
- **Κανόνες αιτήματος:**
  - Κάθε POST φέρει ένα `Idempotency-Key`.
  - Οι αλλαγές σε μια υπάρχουσα execution φέρουν `If-Match: <seq>`; μια ασυμφωνία επιστρέφει 412.
  - Το Stop δεν απαιτεί If-Match.
- **Events:**
  - Η παράδοση είναι τουλάχιστον μία φορά.
  - Το CloudEvents `id` είναι το κλειδί deduplication.
  - Το `cookwalaseq` ταξινομεί τα events ανά θέμα και ταιριάζει με το status `seq`.
  - Οι συσκευές εκπέμπουν `cookwala.device.heartbeat`, έτσι ώστε ένα hub μπορεί να ανιχνεύσει μια χαμένη συσκευή και να πραγματοποιήσει hand off.

## 8. Ιδιωτικότητα

- **Τα execution logs δεν περιέχουν προσωπικά δεδομένα** (`privacy.personalData: "none"`).
- **Αφήνουν τη συσκευή μόνο με συγκατάθεση opt-in** (`consent.dataset`: `none` από προεπιλογή,
  `research_only`, ή `open`). Η συγκατάθεση μπορεί να ανακληθεί.
- **Τα open datasets χοντροποιούν τους χρόνους σε ημέρα.**
- **Τα δεδομένα household, υγείας και θρησκευτικά παραμένουν στο σπίτι** εκτός αν το άτομο επιλέξει διαφορετικά.
  Όταν πρέπει να μεταφερθούν, μεταφέρονται ως selective disclosures.
- **Το Humanitarian Profile** δεν περιέχει καθόλου προσωπικά δεδομένα.

## 9. Έκδοση και επεκτάσεις

- **Οι βασικές εκδόσεις είναι `0.2.x`.**
  - Οι αναγνώστες αποδέχονται οποιοδήποτε patch της minor version τους.
  - Απορρίπτουν άλλες minors με `unsupported_version`.
  - Αγνοούν άγνωστα πεδία `x-`.
- **Νέες λειτουργίες, μονάδες, αισθητήρες και τύποι περιστατικών** προστίθενται στα λεξιλόγια χωρίς
  αλλαγή έκδοσης.
- **Η αλλαγή της σημασίας μιας λειτουργίας αποτελεί νέο id;** η παλιά επισημαίνεται ως `deprecated` με
  `replacedBy`.
- **Τα Profiles** εκδίδονται ανεξάρτητα και δηλώνουν την Core version που χρειάζονται.

## 10. Προφίλ και η κατάστασή τους

| Προφίλ | Κατάσταση | Σημειώσεις |
|---|---|---|
| Core (αυτό το έγγραφο) | **draft, normative** | Στόχος για τις πρώτες υλοποιήσεις συσκευών |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Χωρίς προσωπικά δεδομένα; λειτουργεί μέσω SMS και CSV; surplus to plate, περιλήψεις επιπτώσεων, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Τοπικά γεγονότα household context; μόνο τα derived constraints μεταφέρονται (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Αποδεδειγμένα namespaces, ακριβείς εκδόσεις, tombstones; οργανισμοί κατόπιν αιτήματος (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Υπογεγραμμένες αναφορές πίσω από κάθε ισχυρισμό conformance (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds και relays; επαλήθευση έναντι του εκδότη (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Εστιατόρια, κοινότητα, σχολείο, καταστροφές και robot kitchens (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Συγκεντρωτικά, καθυστερημένα, signals ζήτησης και προσφοράς επιπέδου κλάσης; ελεγχόμενα μέσω αναθεώρησης του droit της ανταγωνιότητας (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection, μεταβάσεις στο `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Απαιτείται αναθεώρηση του droit της ανταγωνιότητας πριν από τη χρήση στην παραγωγή |
| Relief planning (`relief.schema.json`) | experimental | Η λειτουργική ροή μεταφέρθηκε στο Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | Το OpenAPI Core API είναι η αναφορά επιφάνειας |

Ένα προφίλ γίνεται σταθερό όταν δύο ανεξάρτητες υλοποιήσεις περνούν τα conformance vectors του
και έχει πραγματικούς χρήστες.

## 11. Εργαλεία

| Εργαλείο | Τι κάνει |
|---|---|
| `tools/validate_specs.py` | Ελέγχει schemas, παραδείγματα, σημασιολογία συνταγών (envelopes, op parameters, χωρίς template placeholders), αυστηρότητα και ότι οι αναφορές API επιλύονται |
| `tools/run_conformance.py` | Εκτελεί τα `conformance/*.json` και `conformance/profiles/*.json`, και γράφει ένα ConformanceReport με το `--report`: hashing (συμπεριλαμβανομένου του παραδείγματος RFC 8785), signatures (συμπεριλαμβανομένου ενός κλειδιού RFC 8032), revocation, disclosure, event chains και checkpoints, μονάδες, envelopes, sensor ladders, state machines |
| `tools/cookwala_ref.py` | Βιβλιοθήκη αναφοράς και CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Αναγεννά τους vectors (ελέγξτε το diff) |
| `tools/bundle_schemas.py` | Offline schema bundle |
| `tools/humanitarian_check.py` | Ελεγκτής rule-pack του Humanitarian Profile και περιλήψεις επιπτώσεων |
| `tools/make_profile_vectors.py` | Αναγεννά τα profile vectors στο `conformance/profiles/` |

## 12. Αλλαγές από το 0.1

| Περιοχή | 0.1 | 0.2 |
|---|---|---|
| Schemas | Αποδεκτά άγνωστα πεδία | Αυστηρά, με `x-` επεκτάσεις |
| Temperatures | °C ή °F, επιτρέπεται σχετική ανοχή | Μόνο °C; απόλυτη ανοχή |
| Money | Αριθμός | Δεκαδική συμβολοσειρά |
| Operations | Περιγραφικές ορισμοί | Physical envelopes, sensor ladders, heat levels, test vectors |
| Signatures | Fixed EdDSA, κλειδιά χωρίς lifecycle | EdDSA ή ES256, KeyRecords με εγκυρότητα και revocation |
| Missions | Ένα μεταβλητό έγγραφο, ledger εσωτερικά | Event log + projection, single sequencer, witnessed checkpoints, hash-only mode |
| Agents | Mandate μόνο μέσα στα Missions | `AgentMandate` στο common; απαιτείται για agent requests |
| Safety | Δηλωμένα στις συνταγές | Εφαρμόζεται επίσης τοπικά μέσω SafetyLimits; recalls; incident reports |
| Data | Χωρίς dataset model | Consented, personal-data-free ExecutionLog |
| Conformance | Μόνο Schema validation | 106 vectors (44 Core, 62 profile) συν μια reference implementation |

Για τη μετανάστευση ενός 0.1 εγγράφου: μετατρέψτε °F σε °C; αντικαταστήστε τις σχετικές ανοχές στις θερμοκρασίες με το `toleranceAbs`; μετατρέψτε ποσά χρημάτων σε δεκαδικές συμβολοσειρές; αφαιρέστε ή μετονομάστε άγνωστα πεδία σε πεδία `x-`.

