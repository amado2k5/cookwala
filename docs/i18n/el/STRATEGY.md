<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->

# Cookwala στρατηγική: μήνυμα, προϊόν, ιστοσελίδα, έγγραφα, εμπειρία προγραμματιστή

**Status:** αναθεωρημένο 2026-10-04 (v2). Καλύπτει την αποστολή, το όραμα, την ιστορία, το πρότυπο, τον ιστότοπο, την
τεκμηρίωση, το API και το SDK, τις demos, την κοινότητα και τα metrics. Βασίζεται στο σχέδιο δράσης
(`ACTION-PLAN.md`), την ιστορία και τη λίστα κενών (`research/BACKSTORY.md`), την αναθεώρηση αρχιτεκτονικής
(`research/ARCHITECTURE-REVIEW.md`), το benchmark των 23 sites (`research/WEB-BENCHMARK.md`), τον
σχεδιασμό των stakeholders (`STAKEHOLDERS.md`) και τους κανόνες μηνυμάτων (`MESSAGING.md`). Ο πίνακας της Ενότητας 1
είναι η μελέτη πρώτης προσπάθειας· το benchmark τον αντικαθιστά εκεί όπου διαφέρουν.

---

## 0. Σύνοψη

**Η δουλειά της Cookwala.** Είναι ο ανοιχτός τρόπος για να λέμε σε οποιαδήποτε κουζίνα (έναν άνθρωπο, ένα food bank, έναν φούρνο ή έναν ανθρωειδή ρομπότ) **τι να φτιάξει, πότε ολοκληρώνεται κάθε βήμα και τι δεν πρέπει ποτέ να συμβεί**, και να ελέγχουμε και τα τρία στη συσκευή.

**Τι αλλάζει:**

1. **Μήνυμα.** Αποσύρτε το "the world's first and largest robot cooking recipes index and CLI"
   και ξεκινήστε με το πρόβλημα που αντιμετωπίζει κάθε κατασκευαστής ρομπότ και κάθε κουζίνα. Νέο one-liner:
   *"The open standard for cooking safely: people, kitchens and robots."*
2. **Ιστορία.** Τα ρομπότ πρόκειται να μαγειρέψουν σε σπίτια, αλλά κανείς δεν έχει καταγράψει, σε μορφή που μια
   μηχανή μπορεί να ελέγξει, τι σημαίνουν τα "done" και "safe", ή σε ποιες κουζίνες. Η Cookwala ξεκίνησε
   από τις αιγυπτιακές συνταγές μιας οικογένειας. Η αποστολή της είναι να διδάξει στις μηχανές κάθε κουζίνα
   με ασφάλεια, και να διασφαλίσει ότι το καλό φαγητό φτάνει στους ανθρώπους.
3. **Απόδειξη πριν την υπόσχεση.** Ζωντανά, πραγματικά στατιστικά στοιχεία. Ετικέτες now / next / later. Δημοσιευμένες κριτικές.
4. **Ένας κύκλος που όλοι καταλαβαίνουν:** *Describe → Check → Cook → Learn.*
5. **Διαδρομές ανά κοινό:** κατασκευαστές συσκευών, δημιουργοί AI-agent, κουζίνες και food banks, μάγειρες,
   ερευνητές.
6. **Κώδικας και μια ζωντανή demo στην πρώτη οθόνη.** dry run στον browser ("Can this device cook
   this recipe?"), οι simulators, και εντολές copy-paste που λειτουργούν σήμερα.
7. **Εμπειρία προγραμματιστή στο επίπεδο των καλύτερων docs για AI και ρομποτική:** ένα 5λεπτο
   quickstart, docs οργανωμένα ως tutorials, how-to guides, reference και explanation,
   `llms.txt`, copy-page, ένα Python package και CLI, ένα typed JS/TS SDK, έναν MCP server, ένα
   reference hub που μπορείτε να τρέξετε τοπικά, ένα ROS 2 package, και μια LeRobot bridge.
8. **Ένα δίκτυο συντελεστών** (εμπνευσμένο από το Index της Figure): μάγειρες και κουζίνες συνεισφέρουν
   συγκατενταμένες ηχογραφήσεις πραγματικών συνταγών, ώστε τα ρομπότ να μαθαίνουν κάθε κουζίνα, με αναγνώριση
   στους ανθρώπους που τους τα δίδαξαν.

---

## 1. Τι μάθαμε

| Ιτόπος | Πρόβλημα που επιλύει | Προσέγγιση | Πώς επικοινωνεί | Κοινό | Τι παίρνουμε |
|---|---|---|---|---|---|
| **Figure – Index** | Οι ανθρωτοειδή χρειάζονται τεράστιες ποσότητες δεδομένων πραγματικών εργασιών | Δίκτυο πληρωμένων συντελεστών που καταγράφει καθημερινές εργασίες; υπηρεσίες now, ρομπότ later | Κινηματογραφικό, μονόχρωμο, τεράστιος τύπος γραμματοσειράς; ζωντανά μετρητές (29 M video uploads, $15 M paid); *"Today, services on demand. Soon, robots on demand."* | Συντελεστές, νοικοκυριά, επιχειρήσεις | Δίκτυο συντελεστών με πιστώσεις; **ζωντανά μετρητικά αποδεικτικά**; μια γραμμή ειλικρίνειας "today / soon"; μία εντυπωσιακή εικόνα |
| **Figure (home)** | Βοήθεια στο σπίτι | Ένα humanoid γενικής χρήσης | *"The future of home help is here."* Μία πρόταση, ένα video | Νοικοκυριά, επενδυτές | Την υπόσχεση μιας πρότασης; προϊόν πριν τα χαρακτηριστικά |
| **MCP Registry** | Εύρεση αξιόπιστων MCP servers | Κοινοτικό registry; επαληθευμένα reverse-DNS namespaces; ακριβείς εκδόσεις; integrity hashes; validation endpoint; lifecycle status | Καθαρή αναφορά OpenAPI; schema-first | Εκδότες servers, κατασκευαστές clients | **Επαληθευμένα namespaces, pinned versions, hashes, tombstones** → `REGISTRY.md` |
| **LangChain docs** | Η δημιουργία agents είναι αποσπασματική | Ανοιχτά, model-agnostic frameworks συν μια πλατφόρμα | *"The open agent engineering ecosystem"*; lifecycle Build → Test → Deploy → Monitor; trust center και status | Agent engineers, επιχειρήσεις | **Ένα lifecycle που ο αναγνώστης αναγνωρίζει**; trust center; academy και forum |
| **LangSmith Observability** | Παρακολούθηση αυτού που έκαναν τα agents σε παραγωγή | Traces → monitoring → feedback → datasets για evals | Βήματα με links; σελίδα εννοιών; integrations | Ομάδες agents | **Execution logs ως traces**; τα traces γίνονται datasets → `execlog_export.py otel` |
| **OpenAI API docs** | Πρώτη κλήση API | Quickstart με code first; build paths; model cards | Dark, code-forward, "Ask AI", status και cookbook | Developers | **Code στην πρώτη οθόνη; "build paths"** |
| **Claude Platform docs** | Από την πρώτη κλήση στην παραγωγή | Δύο επιφάνειες (Messages, Managed Agents); αριθμημένο developer journey; model family cards | ⌘K search; language tabs (Python … cURL, CLI); journey 1–4 | Developers, ομάδες πλατφόρμας | **Αριθμημένο developer journey; language tabs; "choose how you build"** |
| **AsyncAPI** | Περιγραφή event-driven APIs | Ανοιχτό spec συν εργαλεία (generators, docs); ανοιχτή διακυβέρνηση υπό τη Linux Foundation | "Part of the Linux Foundation"; spec → docs → code demo; κοινοτικές συναντήσεις; sponsor tiers | Αρχιτέκτονες, δημιουργοί εργαλείων | **Open governance badge, TSC, community calendar, sponsors** |
| **SiliconFlow** | Γρήγορη, φθηνή model inference | One-stop API για πολλά μοντέλα | Λίστες χαρακτηριστικών για απόδοση, κλιμακωτότητα, κόστος και ασφάλεια | Developers, επιχειρήσεις | Μια σαφής λίστα **characteristics** (δικές μας: safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | Trial-and-error prompt engineering | Declarative test cases, red teaming, CI | *"Test-driven LLM development, not trial-and-error"*; λίστα why-choose; βήματα workflow | LLM app developers, ασφάλεια | **Declarative safety tests** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; όχι το Figure's Helix AI) | Το DeFi είναι πολύ περίπλοκο | Agent φυσικής γλώσσας με refusal before heat σε κάθε συναλλαγή | Whitepaper: abstract → problem → solution → architecture → security model | Χρήστες crypto | **Whitepaper structure; explicit security model; "always confirm"** (παίρνουμε τη δομή, όχι το token model) |
| **Hugging Face LeRobot** | Η ρομποτική είναι δύσκολο να ξεκινήσει | Hardware-agnostic library; teleoperate → record → train → deploy; standard dataset format; community datasets | "Pick your path: I have a robot / no hardware yet / I want to contribute"; cheat sheet; common problems | Makers, ερευνητές | **"Pick your path"; dataset compatibility; common-problems section** |
| **ROS 2 / Open Robotics** | Διασυνδεσιμότητα λογισμικού ρομπότ | Ανοιχτό middleware (ROS, Gazebo, Open-RMF) που διαχειρίζεται ένα non-profit | *"Powering the world's robots"* | Robot developers | **ROS 2 actions; non-profit stewardship** |
| **NVIDIA Isaac** | Ανάπτυξη και εκπαίδευση ρομπότ | Simulation, libraries, foundation models (GR00T) | Πλάνο πλατφόρμας: libraries, simulation, models, blueprints | Ομάδες ρομποτικής | **Simulation ως το test bench** για envelopes |
| **1X, Unitree, Pollen** | Home humanoids, οικονομικά ρομπότ, ανοιχτά ρομπότ για makers | Προϊόντα με καταθέσεις, pre-orders και κοινότητα | Ένα προϊόν, μία τιμή, ένα κουμπί | Νοικοκυριά, makers | Τα home robots αποστέλλονται now; το παράθυρό μας είναι now |

**Πρότυπα που μοιράζονται οι καλύτεροι:**
1. Μία πρόταση για το ποιοι προορίζεται και τι κάνει.
2. Ένα loop που ο αναγνώστης αναγνωρίζει.
3. Λειτουργικός κώδικας ή μια demo εντός ενός scroll.
4. Σημεία εισόδου pick-your-path.
5. Απόδειξη (αριθμοί, χρήστες, governance).
6. Ειλικρινής status (trust center, status page, now/next).
7. Κοινότητα στην οποία μπορείτε να συμμετάσχετε σήμερα.
8. Docs κατασκευασμένα τόσο για ανθρώπους όσο και για AI αναγνώστες (copy page, `llms.txt`, "Ask AI").

---

## 2. Cookwala σήμερα

**Δυνατά σημεία:**
- Μια σπάνια, συγκεκριμένη ιδέα: φυσικά operation envelopes, sensor ladders, refusal αντί για
  μαντεψιές, ασφάλεια επιβαλλόμενη στη συσκευή, επαληθεଉόμενα έγγραφα.
- Vectors conformance που περιλαμβάνουν αποτελέσματα δύο ανεξάρτητων προτύπων (RFC 8785, RFC 8032).
- Τέσσερα playable simulators.
- Ένα ανθρωπιστικό προφίλ που λειτουργεί χωρίς ρομπότ.
- Ένα πραγματικό corpus συνταγών (fifi.cooking) και μια περιοχή με ταυτότητα (Αίγυπτος, ο αραβικός κόσμος).
- Ένα ασυνήθιστα ειλικρινές αρχείο κριτικής-και-απάντησης.

**Κενά:**

| Κενό | Επίδραση |
|---|---|
| Ο τίτλος ισχυρίζεται "πρώτος και μεγαλύτερος" με 1 δημοσιευμένη συνταγή | Διαβάζεται ως υπερβολή (hype); προκαλεί άρνηση |
| "Λήξη της παγκόσμιας πείνας" ως κύριο θέμα | Απομακρύνει χρηματοδότες και ειδικούς που γνωρίζουν τους παράγοντες της πείνας |
| Πλαίσιο μόνο για ρομπότ | Αποκλείει τους χρήστες που μπορούν να υιοθετήσουν την τεχνολογία σήμερα (κουζίνες, food banks, agent builders) |
| Χωρίς quickstart, χωρίς SDK, χωρίς runnable server | Κανείς δεν μπορεί να πετύχει σε 5 λεπτά |
| Τα Docs είναι 25 markdown αρχεία χωρίς πλοήγηση | Δύσκολο να βρεθούν, δύσκολο να εμπιστευτούν |
| Χωρίς ζωντανή απόδειξη ή status | Χωρίς αίσθηση ορμής ή ετοιμότητας |
| Χωρίς τρόπο συμμετοχής | Το ενδιαφέρον δεν μπορεί να μετατραπεί σε συνεισφορά |

---

## 3. Τοποθέτηση και μήνυμα

### 3.1 Κατηγορία και σύντομη περιγραφή
- **Κατηγορία:** ένα ανοιχτό πρότυπο (με δωρεάν εργαλεία και έναν index) για εκτελέσιμο, επαληθεύσιμο
  μαγείρεμα.
- **Σύντομη περιγραφή:** *Το Cookwala είναι το ανοιχτό πρότυπο για ασφαλές μαγείρεμα: άνθρωποι, κουζίνες και ρομπότ.*
- **Τριάδα**, που χρησιμοποιείται παντού:
  - **Τι να φτιαχτεί.** Συνταγές ως βήματα που ένα μηχάνημα μπορεί να σχεδιάσει.
  - **Πότε τελειώνει.** Μετρήσιμες καταστάσεις τερματισμού: θερμοκρασίες, ενδείξεις κατάστασης τροφίμων, χρόνοι.
  - **Τι δεν πρέπει ποτέ να συμβεί.** Όρια ασφαλείας που επιβάλλει η ίδια η συσκευή.

### 3.2 Αποστολή και όραση (αναθεωρημένη)
- **Αποστολή:** *Βοηθήστε όλους να τρώνε καλά, με ασφάλεια, οικονομικά και χωρίς σπατάλη, όποιος κι αν κάνει
  το μαγείρεμα.*
- **Όραση:** *Κάθε κουζίνα στη Γη μπορεί να μαγειρέψει οποιαδήποτε συνταγή με ασφάλεια, και καλό φαγητό φτάνει στους ανθρώπους
  αντί για τον κάδο απορριμμάτων.*
- **Γιατί η αλλαγή:** το "end world hunger" παραμένει ως ο μακροπρόθεσμος λόγος, που υποστηρίζεται με evidence.
  Η Cookwala συμβάλλει σε αυτό μέσω της λιγότερης σπατάλης, της διάσωσης τροφίμων και του φθηνότερου μαγειρέματος, לצωδόν
  τα προγράμματα, τη χρηματοδότηση και την πολιτική που απαιτεί η πείνα.

### 3.3 Η ιστορία

> Οι οικιακοί ρομπότ φτάνουν: Figure 03, 1X NEO και τα ρομπότ κουζίνας αποστέλλονται ή δέχονται
> παραγγελίες. Μαθαίνουν να κινούνται, αλλά κανείς δεν έχει καταγράψει, με τρόπο που μια μηχανή να μπορεί να
> ελέγξει, τι σημαίνει "simmer", πότε το κοτόπουλο είναι ασφαλές, ή πώς φτιάχνεται η molokhia μιας γιαγιάς.
> Κάθε κατασκευαστής γράφει τις δικές του κλειστές συνταγές, κυρίως από λίγες κουζίνες.
>
> Η Cookwala ξεκίνησε από τις αιγυπτιακές συνταγές σπιτιού μιας οικογένειας στο fifi.cooking και έθεσε μια απλή
> ερώτηση: πώς δίνεις μια συνταγή σε μια μηχανή, και ξέρεις ότι θα τη μαγειρέψει με ασφάλεια;
>
> Η απάντηση είναι ένα ανοιχτό πρότυπο. Λέει τι να φτιαχτεί, πότε ολοκληρώνεται κάθε βήμα, και τι δεν πρέπει
> ποτέ να συμβεί. Η συσκευή το ελέγχει πριν θερμάνει οτιδήποτε, και επιλέγει refusal before heat αντί για
> μαντεψιά. Οι ίδιες συνταγές λειτουργούν για ανθρώπους και food bank σήμερα, και θα επιτρέψουν στα ρομπότ
> να μάθουν κάθε κουζίνα στη Γη αύριο, δίνοντας αναγνώριση στους μάγειρες που τους δίδαξαν.

*(Ο ιδρυτής θα πρέπει να επιβεβαιώσει και να εξατομικεύσει την αρχική πρόταση. Το αυθεντικό κερδίζει το φινιρισμένο.)*

### 3.4 Message house

| Πυλώνας | Υπόσχεση | Απόδειξη που μπορούμε να δείξουμε σήμερα |
|---|---|---|
| **Safe by design** | Οι συσκευές αρνούνται αντί να μαντεύουν, και επιβάλλουν όρια τοπικά | Operation envelopes για 32 operations; safety-limits pack; dry run; conformance |
| **Verifiable** | Οποιοσδήποτε μπορεί να ελέγξει μια συνταγή, μια συσκευή και ένα αρχείο | Signatures, key revocation, event-log checkpoints; 106 vectors incl. RFC results |
| **Open and neutral** | Royalty-free, model-agnostic, device-agnostic | Licences; governance path; no API keys |
| **Every cuisine** | Κατασκευασμένο από πραγματικό μαγείρεμα στο σπίτι, πολυγλωσσικό | fifi.cooking corpus; Arabic and English; world-cuisines plan |
| **Useful before robots** | Οι κουζίνες και τα food banks επωφελούνται now | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **Learns with consent** | Το πραγματικό μαγείρεμα γίνεται καλύτεροι ρομπότ, με αναγνώριση | ExecutionLog consent; LeRobot export; OTel traces |

### 3.5 Κανόνες γλώσσας
- **Χρήση:** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent.
- **Αποφυγή:** "revolutionary", "first and largest" (μέχρι να είναι αληθές), "end hunger" (ως επικεφαλίδα),
  "AI-powered" (ασαφές).
- **Επισημάνετε κάθε αριθμό** ως *measured*, *modelled* ή *assumed*.
- **Πείτε "now / next / later"** αντί να υπονοείτε ότι κάτι υπάρχει όταν δεν υπάρχει.

---

## 4. Κοινό και η πρώτη τους επιτυχία

| Κοινό | Εργασία προς εκτέλεση | Πρώτη επιτυχία (≤ 15 min) | Μετά |
|---|---|---|---|
| **Κατασκευαστές ρομπότ και συσκευών** | Αποστολή λειτουργιών μαγειρέματος χωρίς τη συγγραφή κάθε συνταγής, με ασφάλεια | dry run του προφίλ συσκευής τους σε 5 συνταγές; δείτε accept/refuse ανά βήμα | Υλοποίηση του Core API (reference hub), επιτυχία στην conformance, δημοσίευση της συσκευής στο registry |
| **Κατασκευαστές AI-agent** | Επιτρέψτε σε agents να σχεδιάζουν γεύματα και να παραγγέλνουν φαγητό χωρίς βλάβη | Προσθήκη του Cookwala MCP server; εκτέλεση του agent-safety benchmark στο μοντέλο τους | Χρήση του AgentMandate και του dry run πριν από την ενέργεια |
| **Κουζίνες και food banks** | Διάσωση surplus με ασφάλεια, σχεδιασμός θρεπτικών μενού | Αποστολή προσφοράς μέσω SMS, ή συμπλήρωση του CSV; δείτε τον έλεγχο rule-pack | Πιλοτική εφαρμογή με το Humanitarian Profile |
| **Μάγειρες και δημιουργοί συνταγών** | Διατήρηση των συνταγών τους και αναγνώριση της δημιουργίας τους | Μετατροπή μιας συνταγής με τον editor; δείτε την να περνά την validation | Συνεισφορά ηχογραφήσεων (με συγκατάθεση); εμφάνιση στις credits |
| **Ερευνητές και κριτές** | Δεδομένα, benchmarks, honest assumptions | Εκτέλεση simulator; ανάγνωση της κριτικής και της conformance suite | Χρήση datasets; δημοσίευση reviews |
| **Χρηματοδότες και υπεύθυνοι πολιτικής** | Δείτε αντίκτυπο, κινδύνους και διακυβέρνηση | Ανάγνωση του 2-σελίδιου whitepaper summary και concept note | Χρηματοδότηση πιλοτικών προγραμμάτων; συμμετοχή στη διακυβέρνηση |

---

## 5. Αρχιτεκτονική προϊόντος: τι προσφέρει η Cookwala

| Επίπεδο | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profiles (draft / experimental) | Core 0.3 μετά το πρώτο feedback από συσκευή | Core 1.0 υπό ένα foundation |
| **Index and registry** | Παραδείγματα συνταγών; registry spec | fifi.cooking corpus μετατρέφθηκε (2,380 recipes, Arabic + English); verified namespaces | Community collections, παγκόσμιες κουζίνες |
| **Tools** | Validator, reference library, dry run, conformance, exporters | `pip install cookwala` (CLI + library); JS/TS SDK | Recipe editor (web) |
| **Reference hub** | Core API spec | Docker hub με μια simulated συσκευή, ώστε το quickstart `curl` να λειτουργεί τοπικά | Hardware-in-the-loop kit |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | ROS 2 package; MCP server; Open-RMF task | Isaac Lab "cook in simulation" benchmark |
| **Safety** | Limits pack, recalls, incidents, agent benchmark | Reviewed limits; δημόσια αποτελέσματα agent-safety | Certification scheme με έναν certifier |
| **Humanitarian** | Profile, rule pack, templates, concept note | Egypt food-bank pilot | Υιοθέτηση δικτύου food-bank |
| **Data** | ExecutionLog με συγκατάθεση | Δίκτυο συντελεστών, πρώτο consented dataset | Multi-cuisine benchmark στο Hugging Face Hub |

---

## 6. Ιστότοπος

### 6.1 Χάρτης ιστότοπου

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 Αρχική σελίδα, από πάνω προς κάτω

| # | Ενότητα | Σκοπός | Περιεχόμενο |
|---|---|---|---|
| 1 | **Hero** | Πείτε τι είναι με μια ανάσα | Μία γραμμή, τρία, δύο κουμπιά (*Try the dry run*, *Read the quickstart*); ειλικρινές status chip "Draft standard · v0.2" |
| 2 | **Live demo** | Δείξτε, μην πείτε | "Μπορεί αυτή η συσκευή να μαγειρέψει αυτή τη συνταγή;" Επιλέξτε μια συνταγή και μια συσκευή; κάθε βήμα δείχνει done / person / refuse, με τον rule που αποφάσισε |
| 3 | **The problem** | Κάντε το κενό αισθητό | Τα ρομπότ φτάνουν; η "simmer" σημαίνει διαφορετικά πράγματα; κλειστές συνταγές από λίγες κουζίνες; τρόφιμα που σπαταλούνται ενώ οι άνθρωποι πεινούν |
| 4 | **The loop** | Ένα νοητικό μοντέλο | Describe → Check → Cook → Learn, το καθένα με το artifact και την εντολή |
| 5 | **Pick your path** | Καθοδηγήστε κάθε επισκέπτη | Πέντε κάρτες (ενότητα 4), η κάθε μία με μια πρώτη επιτυχία |
| 6 | **Proof** | Momentum και ειλικρίνεια | Ζωντανοί μετρητές από `/v1/stats.json` (operations defined, conformance vectors, schemas, recipes published, languages); κάθε αριθμός με ετικέτα |
| 7 | **Safety** | Εμπιστοσύνη | Η ασφάλεια είναι τοπική; refusal; agent rules; recalls; σύνδεσμος στο /trust |
| 8 | **Works today** | Χρησιμότητα πριν τα ρομπότ | Humanitarian Profile, παράδειγμα SMS, simulators |
| 9 | **Now / next / later** | Ειλικρινές οδικός χάρτης | Από την ενότητα 5 |
| 10 | **Open** | Ουδέτερο και προσκαληκτικό | Licences, μονοπάτι διακυβέρνησης, contribute, GitHub |

### 6.3 Κατεύθυνση σχεδιασμού
- **Αίσθηση:** ήρεμη, ακριβής, ζεστή. Ένα επαγγελματικό όργανο με ψυχή κουζίνας.
- **Τύπος:** ένα ακριβές grotesque για το UI και ένα mono face για δεδομένα και κώδικα. Μεγάλος, ελαφρύς τύπος γραμματοσειράς για το hero (δανείζοντας την αυτοπεποίθηση του Figure), χωρίς να αντιγράφει το κινηματογραφικό του σκοτάδι.
- **Χρώμα:** ουδέτερο χαρτί και μελάνι με μία θερμή έμφαση (ember orange) που επισημαίνει επίσης τα δεδομένα θερμοκρασίας. Η παλέτα είναι επικυρωμένη για αναγνώστες με δυσκολία στην αντίληψη χρωμάτων, και έχουν σχεδιαστεί τόσο ανοιχτά όσο και σκοτεινά θέματα.
- **Εικονοগ্রাফία:** πραγματικά χέρια και πραγματικές οικιακές κουζίνες μόλις τις έχουμε, ποτέ stock ρομπότ. Μέχρι τότε, διαγράμματα και το live demo στηρίζουν τη σελίδα.
- **Κίνηση:** για μια στιγμή, το step-by-step dry run. Όλα τα άλλα είναι ακίνητα.
- **Δίγλωσσο από την αρχή:** Αγγλικά και Αραβικά (διάταξη από δεξιά προς τα αριστερά), στη συνέχεια άλλα.
- **Προσβασιμότητα:** WCAG 2.2 AA; πληκτρολόγιο; μειωμένη κίνηση; όχι πληροφορίες μόνο μέσω χρώματος.

### 6.4 Αλληλεπίδραση
1. In-browser dry run (συνταγή × συσκευή).
2. Envelope explorer: σύρετε μια γραφική παράσταση θερμοκρασίας και δείτε πότε εγκαταλείπει το "simmer".
3. Προσομοιωτές, με το πρωτόκολλο ενεργοποιημένο ή απενεργοποιημένο.
4. Recipe step viewer: η πρόταση ενός βήματος, το JSON του και το envelope του পাশাপাশি.
5. Later: ένας επεξεργαστής συνταγών που πραγματοποιεί validation καθώς πληκτρολογείτε.

---

## 7. Τεκμηρίωση

Οργανωμένο σύμφωνα με το πλαίσιο Diátaxis, έτσι ώστε κάθε σελίδα να έχει μία δουλειά:

| Τύπος | Σκοπός | Σελίδες |
|---|---|---|
| **Tutorials** | Μάθετε κάνοντας | Quickstart; Το πρώτο σας Cookwala recipe; Κάντε ένα συσκευή Cookwala-ready; Προσθέστε Cookwala σε έναν agent; Εκτελέστε ένα food-rescue pilot με SMS |
| **How-to guides** | Λύστε μία εργασία | Dry-run μιας συσκευής; Sign and verify; Δημοσιεύστε στο registry; Εξάγετε logs στο LeRobot ή OpenTelemetry; Εκτελέστε το agent-safety benchmark; Αναφέρετε ένα incident; Εκδώστε ένα recall |
| **Reference** | Αναζητήστε πληροφορίες | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vectors; CLI |
| **Explanation** | Κατανοήστε το γιατί | Γιατί envelopes; η safety είναι local; trust model; privacy; humanitarian design; critiques και responses; simulators και τα όρια τους |

**Εργονομία εγγράφων:**
- αριστερή πλοήγηση, αναζήτηση, "Copy page", "Edit on GitHub", σύνδεσμοι previous/next;
- καρτέλες γλώσσας (Python / JavaScript / cURL / CLI);
- `llms.txt` και markdown ανά σελίδα για AI readers;
- ένα cheat sheet και μια σελίδα common-problems;
- ένα changelog με ημερομηνίες.

---

## 8. API και SDK

| Παραδοτέο | Τι | Γιατί |
|---|---|---|
| πακέτο Python `cookwala` | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (από το `tools/`) | Μία εντολή για την πρώτη επιτυχία |
| `@cookwala/sdk` (TypeScript) | Τύποι που παράγονται από schemas; Core API client; dry run στον browser | Web και agent developers |
| Reference hub (Docker) | Core API με μια προσομοιωμένη συσκευή και τα όρια ασφαλείας | Το `curl` του quickstart λειτουργεί τοπικά; test bed για makers |
| MCP server | Εργαλεία: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | Κάθε agent με δυνατότητα MCP μπορεί να χρησιμοποιήσει το Cookwala με ασφάλεια |
| πακέτο ROS 2 | `cookwala_msgs` (actions), ένας bridge node προς το Core API | Robot makers |
| Exporters | LeRobot, OpenTelemetry (ολοκληρώθηκε) | Μάθηση και observability |
| Evals | promptfoo agent-safety benchmark (ολοκληρώθηκε) | Agent builders, safety reviewers |
| Versioning | Semver για το Core; dated schema bundle; changelog; deprecation windows | Υπόσχεση σταθερότητας |
| Status | Δημόσια σελίδα status για τα endpoints του cookwala.ai | Εμπιστοσύνη |

---

## 9. Δемоνстрації

| Demo | Κοινό | Κατάσταση |
|---|---|---|
| In-browser dry run | Όλοι | Building now |
| Simulators (home, city, country, world) | Όλοι, χρηματοδότες | Live |
| Agent-safety results across models | Agent builders, AI labs | Next (run the benchmark, publish results with method) |
| SMS food-rescue walkthrough | Food banks | Next (recorded demo) |
| A real device cooking a Cookwala recipe, unedited | Όλοι | Later (the most important demo; needs a device partner) |
| "Cook in simulation" (Isaac Lab / Gazebo) | Robotics researchers | Later |

---

## 10. Κοινότητα και ανάπτυξη

- **Δίκτυο συντελεστών** (εμπνευσμένο από το Figure's Index):
  - Οι *Cooks* καταγράφουν sessions συναινεμένων συνταγών που γνωρίζουν, με αναφορά στο κάθε recipe και dataset card.
  - Πιλοτική εφαρμογή σε *Kitchens and food banks*.
  - Οι *Makers* υλοποιούν συσκευές.
  - Οι *Reviewers* ελέγχουν rule packs και envelopes.
  - Οι *Translators* μεταφράζουν βήματα και λεξιλόγιο.
  - Οι πληρωμένες συνεισφορές έρχονται later, χρηματοδοτούμενες από επιχορηγήσεις. Ποτέ μην πληρώνετε για δεδομένα χωρίς informed consent και δίκαιους όρους.
- **Rituals:** μηνιαία κλήση κοινότητας; τριμηνιαία "state of Cookwala" με πραγματικούς αριθμούς; δημόσια threads αναθεώρησης.
- **Partnership sequence:** οι πρώτοι δέκα από το stakeholder tracker (food bank, WFP Innovation Accelerator, Home Assistant, μια startup συσκευών, ένα πανεπιστημιακό εργαστήριο, ένας certifier, World Central Kitchen, ένα ίδρυμα, ένα ουδέτερο σπίτι, ένας creator).
- **Channels:** GitHub Discussions, ένα newsletter, ομιλίες σε συνέδρια (ROSCon, IROS/ICRA workshops, food-tech events), κανάλια γλώσσας Αραβικών.

---

## 11. Μετρικές

- **North-star metric:** *verified cooks*, ο αριθμός των executions που εκτέλεσαν ένα υπογεγραμμένο Cookwala
  recipe από την αρχή έως το τέλος με ένα συγκατενευμένο, conforming log. Όσο αυτό είναι μηδέν, παρακολουθήστε leading
  indicators.

| Funnel | Metric | Target by 2027-03 |
|---|---|---|
| Attract | Monthly visitors to /start | 2,000 |
| Activate | Dry runs completed (web + CLI) | 500 |
| Build | Independent Core implementations passing conformance | 2 |
| Adopt | Food-bank pilot kg rescued (measured) | First 6-month pilot running |
| Contribute | External contributors with merged changes | 15 |
| Trust | External reviews published | 6 |
| Learn | Consented execution logs | 1,000 |

---

## 12. Οδικός χάρτης

Το συντηρούμενο roadmap με κατάσταση ανά στοιχείο είναι [`ROADMAP.md`](ROADMAP.md). Ο παρακάτω πίνακας είναι το
αρχικό σχέδιο 180 ημερών, που διατηρείται για την καταγραφή.

| Πότε | Ιστοσελίδα και ιστορία | Εμπειρία προγραμματιστή | Πρότυπο και ασφάλεια | Κοινότητα |
|---|---|---|---|---|
| **Now (αυτή η έκδοση)** | Νέα αρχική σελίδα με ζωντανό dry run, triad, paths, proof, now/next/later; docs viewer; `llms.txt`; σελίδες εμπιστοσύνης (security, governance) | Dry run; LeRobot και OTel exporters; ROS 2 actions; agent-safety benchmark | Registry spec (namespaces, versions, hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **Επόμενοι 30 ημέρες** | /start quickstart; Αραβική αρχική σελίδα; claims pass σε όλες τις σελίδες | `pip install cookwala`; reference hub (Docker) | Δημοσιεύθηκαν τα πρώτα αποτελέσματα benchmark | Concept note στο food bank; πρόταση Home Assistant |
| **60 ημέρες** | /recipes index με το fifi corpus (τα πρώτα 100 μεταwetμένα); /humanitarian | TS SDK; MCP server | Επανεξέταση envelope από επιστήμονα τροφίμων | Πρώτη κλήση κοινότητας |
| **90 ημέρες** | Whitepaper + 2 σελίδες περίληψης; /roadmap | ROS 2 package | Core 0.3 από feedback συσκευών | Συνεργάτης συσκευών, πανεπιστημιακό εργαστήριο |
| **180 ημέρες** | Demo video πραγματικής συσκευής | Recipe editor | Certifier gap analysis | Αποτελέσματα πιλοτικού; αίτηση για foundation |

---

## 13. Κίνδυνοι για αυτή τη στρατηγική

| Κίνδυνος | Μείωση |
|---|---|
| Ένας φαντασμαγορικός ιστότοπος πάνω σε μια λεπτή πραγματικότητα μοιάζει με hype | Κάθε ισχυρισμός επισημάνεται; ζωντανοί μετρητές από πραγματικά δεδομένα; now/next/later |
| Διάχυση σε πάρα πολλά κοινά | Δύο κύριες διαδρομές για τα επόμενα 90 ημέρες: κατασκευαστές συσκευών και food banks. Άλλοι υποστηρίζονται αλλά δεν κυνηγούνται |
| Οι μεγάλες πλατφόρμες στέλνουν κλειστές εναλλακτικές | Γίνετε το ουδέτερο, επαληθεύσιμο επίπεδο που μπορούν να υιοθετήσουν; συνεργαστείτε με ανοιχτούς παίκτες (Hugging Face, Open Robotics, Home Assistant) |
| Κατάχρηση δεδομένων συντελεστών | Συγκατάθεση opt-in, ανακλητήσιμη; όχι προσωπικά δεδομένα; δημοσιευμένες data cards |
| Διαθεσιμότητα ιδρυτή | Στείλτε την εμπειρία προγραμματιστή (package, hub) πριν από περισσότερα specs; προσλάβετε έναν co-maintainer |

