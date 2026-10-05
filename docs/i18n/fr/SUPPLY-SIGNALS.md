<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# Surplus agricole et signaux d'approvisionnement

> **Statut : experimental** (RFC-0007). Schéma : `schemas/supply.schema.json`. Exemples :
> `examples/supply/`. **Porte :** examen du droit de la concurrence avant toute utilisation de production
> (`docs/ACTION-PLAN.md`, préoccupation C7). cookwala.ai ne publie aucun signal aujourd'hui.

## 1. Deux choses dont les agriculteurs ont besoin now

1. **Un moyen de lister un surplus avant qu'il ne pourrisse.** Une ferme est un donateur dans le Humanitarian Profile :
   un `Offer` avec `Item.origin: farm` et `harvestedAt`, ou par SMS :

   FARM 120KG TOMATO A BB0411
   ```

Le food bank le revendique, une cuisine le cuisine, la distribution le compte. Aucun nouveau document,
aucune donnée personnelle, uniquement des organisations.
2. **Un signal équitable de ce qui sera nécessaire.** Il s'agit de la partie expérimentale ci-dessous.

## 2. Signaux de la demande et de l'offre

| Document | Dit | Règles |
|---|---|---|
| `DemandSignal` | Dans la région R, dans la semaine ISO W, les cuisines et les programmes prévoient d'utiliser entre L et H kg de l'**classe** d'ingrédient C | au moins 20 sources contributrices ; publié au moins 7 jours après la fin de la semaine ; niveau de classe (légumineuse, légume à feuilles, volaille), jamais un produit ou une marque ; **pas de prix** ; région pas plus fine que admin1 sauf si 100 sources ou plus |
| `SupplySignal` | Dans la région R, dans la semaine W, la classe C est en surplus, en approvisionnement normal ou en pénurie, avec une fenêtre de récolte | publié par une coopérative, un programme ou un opérateur de marché ; **ouvert à tous** : public, gratuit, identique pour chaque lecteur |

La vérification de référence est `check_signal()` dans `tools/cookwala_ref.py` ; les vecteurs de profil (`conformance/profiles/signal.json`) montrent ce qui est accepté et rejeté.

## 3. Pourquoi ces règles

Le partage de prévisions entre concurrents est l'échange d'informations dont les autorités de la concurrence mettent en garde. L'agrégation, le délai, le niveau de classe, l'absence de prix et la publication ouverte maintiennent le signal utile pour la planification et inutile pour la coordination des prix. Les seuils sont des points de départ ; un conseiller et un statisticien devraient les fixer.

## 4. Ce que devient l'idée du fondateur

La boucle macro (RFC-0007) : cuisson planifiée → demande agrégée →
les fermes et les magasins prévoient d'avoir besoin de → moins de cultures, de déplacements et de déchets. Les simulateurs de la ville, du pays et du
monde montrent l'ampleur de l'effet selon leurs hypothèses (illustratif, pas une
prévision). Ces deux documents sont le plus petit pas honnête vers celle-ci.

## 5. Later

Conseils de plantation à partir de la demande anticipée ; dimensionnement des réserves (une chaîne d'approvisionnement parfaitement agile est fragile) ; flux de secours interrégionaux ; signaux d'approvisionnement par SMS provenant des coopératives.

