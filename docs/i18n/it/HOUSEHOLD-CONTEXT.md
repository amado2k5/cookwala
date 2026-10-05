<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Profilo Household Context: l'immagine completa resta a casa

> **Stato: draft profile** (RFC-0001). Non parte di Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Regole del destinatario: `profiles/household/recipient-roles.json`. API locale:
> `api/household.openapi.yaml`. Esempio: `examples/household/context.json`.

## 1. Perché

Un robot che serva bene una famiglia deve sapere moltissimo: gli elettrodomestici e le loro particolarità, chi vive lì e quando sono in casa, animali domestici, bambini, diete, allergie, tempi dei farmaci, rituali, budget, abitudini di spesa, cosa è andato storto l'ultima volta. Gli stessi fatti sono un piano per un furto e uno strumento di profilazione. Questo profilo fornisce al **planner at home** il quadro completo e fornisce a tutti gli altri solo un **constraint**.

## 2. Tre idee

1. **Facets.** Un fatto digitato per ciascuno (`cw.facet.household.health.allergies`), con chi
   lo ha asserito (declared, observed, reported, inferred), quando, per quanto tempo, il livello di confidenza,
   e una classe di privacy (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in the registry.** Ogni tipo di facet indica se il suo valore grezzo può lasciare
   la casa: `never` (45 tipi: bambini, assenze, layout, condizioni di salute, religione,
   comportamento, incidenti, posizione reddituale), solo come vincolo `derived` (81 tipi), o come
   divulgazione `consented` dopo un esplicito consenso (13 tipi, principalmente lo stato interno del dispositivo per il
   produttore).
3. **Derived constraints.** L'unico oggetto household che un alimentari, un pianificatore, un servizio di consegna,
   un produttore di dispositivi o un altro robot riceve mai: "consegnare 17:00–18:00 alla porta d'ingresso",
   "bloccare arachidi", "nessun movimento di robot nel corridoio 15:00–15:30", "limite di budget 18.00 USD per
   pasto". Ciascuno indica i **types** di facet da cui proviene, mai i loro valori.

## 3. Chi ottiene cosa

| Ruolo del destinatario | Può ricevere |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI o software che pianifica il pasto) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | solo device fault summary (conteggi dei guasti per categoria, nessun orario, nessun fatto relativo al household), e solo quando il household ha nominato un insurer come destinatario; RFC-0001 elenca questo come il ruolo più probabile che verrà rimosso se una revisione della privacy si oppone |
| program (food bank, school) | nulla |
| dataset | nulla |

## 4. Regole

- Le facet grezze non lasciano mai il dispositivo. Non esiste alcuna API che le restituisca a chiunque al di fuori della rete domestica.
- Le facet `inferred` non vengono mai utilizzate per decisioni di sicurezza.
- Nessun punteggio comportamentale di alcuna persona viene prodotto o memorizzato. Le facet comportamentali esistono per servire la household (dimensioni delle porzioni, quando sparecchiare) e non viaggiano mai.
- Il livello economico è una **owner-set budget posture**, mai inferita da nulla.
- I dati e le assenze dei bambini sono `secret` e non viaggiano mai, nemmeno se derivati, se non come vincoli di movimento e di safe-zone che non rivelano alcun programma.
- Ogni facet è cancellabile. La cancellazione si completa entro la finestra della household (predefinita 7 giorni, al massimo 30) ed è registrata senza contenuti.
- Una classe di privacy può essere elevata rispetto al default del registry, mai abbassata.

## 5. La memoria locale degli incidenti

RFC-0001 chiede cosa ricorda il robot riguardo ad allarmi, conflitti, rinunce e lezioni. `LocalIncident` lo contiene: data, categoria da `vocab/incidents.json`, chi era coinvolto per tipo, una nota e una lezione. Non lascia mai la casa. L' `IncidentReport` pubblico e anonimo in Core è un documento diverso da cui ogni maker impara.

## 6. Conformance

I vettori di profilo (`conformance/profiles/disclosure_policy.json`) forniscono facet e un ruolo del destinatario e si aspettano i tipi di vincolo esatti, gli id divulgati e gli id trattenuti con le relative motivazioni. L'implementazione di riferimento è `derive_constraints()` in `tools/cookwala_ref.py`.

## 7. Relazione con altri documenti

`ClientProfile`, `KitchenProfile` e `RobotProfile` (`profile.schema.json`) rimangono come bundle convenienti. Le mission facets (`mission.schema.json`) utilizzano gli stessi registry ids. Il Core `AgentMandate` rimane la dichiarazione normativa di ciò che un agente può fare; le mandate facets descrivono le regole della household localmente.

## 8. Domande aperte

Vedi RFC-0001: ruoli dei destinatari chiusi; privacy raise-only; una valutazione di impatto sulla protezione dei dati con un revisore.

