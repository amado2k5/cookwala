<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala και το robotics stack

Η Cookwala δεν αντικαθιστά κανένα μέρος ενός ρομπότ. Προσθέτει το επίπεδο που λείπει από το robotics stack για το μαγείρεμα: **τι να φτιάξετε, πότε ολοκληρώνεται κάθε βήμα και τι δεν πρέπει ποτέ να συμβεί**, σε μια μορφή που οποιοδήποτε ρομπότ, συσκευή, simulator ή learning pipeline μπορεί να διαβάσει και να ελέγξει.

## Πού ταιριάζει

| Επίπεδο | Παραδείγματα του επιπέδου (2026; δεν υπάρχει καμία ενσωμάτωση με κανένα από αυτά) | Τι προσθέτει η Cookwala |
|---|---|---|
| Ρομπότ και συσκευές | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, kitchen robots (Moley, Miso, Chef Robotics), smart ovens | Μια συνταγή ανεξάρτητη από τη συσκευή που μπορεί να κάνει dry run, refusal before heat ή να μαγειρέψει; όρια ασφαλείας στο περιβάλλον της συσκευής |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | ROS 2 actions για συνταγές και βήματα (`bindings/ros2`); ένα προσχέδιο mapping για το Matter (`bindings/matter.json`, unverified); ένα Open-RMF task είναι μια προγραμματισμένη προσφορά |
| Μάθηση ρομπότ | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | Εργασίες βημάτων σε φυσική γλώσσα και τμήματα βημάτων για datasets; κριτήρια done ως στόχους αξιολόγησης |
| Προσομοίωση | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes και διανύσματα conformance ως συνθήκες δοκιμής |
| Πράκτορες AI | MCP, A2A, Claude, OpenAI και open models | AgentMandate, untrusted-text rule, kitchen agent-safety benchmark |

Η Cookwala είναι σκόπιμα **above motion**. Οι σύγχρονοι ρομπότ μαθαίνουν τη χειριστική επεξεργασία end to end;
η Cookwala τους δίνει την εργασία, το τεστ επιτυχίας και το safety envelope, και λαμβάνει πίσω ένα
execution log.

## ROS 2

`bindings/ros2/` ορίζει δύο ενέργειες:

| Ενέργεια | Στόχος | Ανατροφοδότηση | Αποτέλεσμα |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Τελική κατάσταση, λόγος refusal before heat, `ExecutionLog` |
| `ExecuteNode` | Ένας recipe node, το operation envelope του, ένας προαιρετικός στενότερος στόχος | Πρόοδος, medium temperature, στόχος επιτεύχθηκε | Envelope OK, rung που χρησιμοποιήθηκε, σύνοψη βήματος, απόκλιση |

**Ακύρωση** ενός στόχου `ExecuteRecipe` είναι ένα `StopRequest`: ο διακομιστής πρέπει να σταματήσει με ασφάλεια.
**Όρια ασφαλείας** παραμένουν εντός της συσκευής· κανένα πεδίο στόχου δεν μπορεί να τα αλλάξει. Ένα hub που μοιράζει μια
συνταγή σε αρκετούς ρομπότ στέλνει στόχους `ExecuteNode`, και μπορεί να παραδώσει την αποστολή επιπέδου στόλου στην **Open-RMF** ως εργασίες.

## LeRobot και σύνολα δεδομένων robot-learning

Ο βρόχος του LeRobot είναι teleoperate → record → train → deploy, και το LeRobotDataset v2.1 αποθηκεύει
εργασίες σε φυσική γλώσσα στο `meta/tasks.jsonl` (το v3 μετακίνησε τα metadata σε parquet· ο exporter γράφει το
αρχείο τύπου v2.1 σήμερα και ένας συγγραφέας v3 είναι next). Οι συνταγές Cookwala περιέχουν ήδη μία πρόταση
ανά βήμα, και τα execution logs καταγράφουν πότε ξεκίνησε και τελείωσε κάθε βήμα.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Αυτό γράφει:
- `meta/tasks.jsonl`, μία εργασία ανά βήμα συνταγής·
- `meta/cookwala/<log>.json` με το hash της συνταγής, τα τμήματα βημάτων (δευτερόλεπτα έναρξης και λήξης,
  sensor-ladder rung, envelope result) και τη συγκατάθεση του household context.

Το βίντεο και οι ενέργειες προέρχονται από τον δικό του καταγραφέα ο οποίος ανήκει στον ρομπότ. Η εξαγωγή αρνείται τα logs χωρίς τη συγκατάθεση του dataset.

## Προσομοίωση

Τα διανύσματα conformance στο `conformance/envelope.json` (καταγράψεις θερμοκρασίας με αναμενόμενα αποτελέσματα) και οι κανόνες sensor-ladder είναι έτοιμα για προσομοιωτή. Μια θερμική ή φυσική προσομοίωση ενός τηγανιού, μιας κατσαρόλας ή ενός φούρνου μπορεί να βαθμολογηθεί σε σχέση με τα ίδια envelopes που πρέπει να τηρεί μια πραγματική συσκευή. Το Isaac Lab, το Gazebo και το MuJoCo είναι υποψήφια για ένα δημόσιο benchmark "cook in simulation".

## Παρατηρησιμότητα

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Αυτό γράφει ένα OpenTelemetry trace: ένα span ανά βήμα, με attributes `cookwala.*` (rung,
envelope OK, deviation) και events safety-limit. Φορτώνει σε οποιοδήποτε OTLP backend
(Jaeger, Grafana Tempo, LangSmith…), έτσι ώστε οι ομάδες να μπορούν να κάνουν debug σε συσκευές με τον ίδιο τρόπο που κάνουν debug σε agents.

## dry run: μπορεί αυτή η συσκευή να μαγειρέψει αυτή τη συνταγή;

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

Το dry run απαντά πριν οποιοδήποτε πράγμα ζεσταθεί. Αναφέρει ποια βήματα εκτελεί η συσκευή, ποια εκτελεί ένας άνθρωπος, πώς θα επαληθευτεί κάθε βήμα (sensor, model, time ή person), ή τον πρώτο λόγο για τον οποίο πρέπει να γίνει refusal before heat.

