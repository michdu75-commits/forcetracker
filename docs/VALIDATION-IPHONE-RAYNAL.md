# 📱 Validation iPhone réelle — le cas Raynal (ft-v1208)

> **Ce document n'est pas un compte rendu, c'est un TÉMOIN.** Il fige un cas **observé sur le
> téléphone de Michel**, avec ses valeurs exactes, pour que le chantier « fiabilité énergie /
> macros » ait un point de référence vérifiable — et pas seulement des fixtures écrites par moi.
>
> ⛔ **Créé sur demande de Michel, 13/09/2026** : *« Cette capture doit devenir le témoin concret
> que le cas réel Raynal est maintenant traité génériquement et correctement sur iPhone. »*
> Sa consigne de périmètre était explicite : *« Ne change rien au comportement si tout correspond
> au contrat actuel. »* — **et rien n'a été changé au comportement.**

---

## 1. Ce que la capture montre (transcription, 13/09/2026 · 23:23)

> ⚠️ **La capture est transcrite, pas embarquée.** C'est une photo de son écran, et le dépôt est
> **public** ; ce qui doit être figé, ce sont les **valeurs**, et elles le sont ici et dans le banc
> d'essai. *Une image ne peut pas rougir ; un témoin, si.*

| Élément de l'écran | Valeur |
|---|---|
| Produit | **Lentilles Cuisinées à l'Auvergnate — Raynal & Roquelaure** |
| Code-barres | **3021690201123** |
| En-tête de la ligne | *« … · **99.2 kcal/100g** »* |
| Quantité | **410 g** |
| Portion déclarée par la fiche | 205 g (pastille « portion fabricant ») |
| Récapitulatif | *« pour tes 410 g : **407 kcal** · 25 g de protéines · 41 g de glucides · 13 g de lipides »* |
| Calories / Protéines / Glucides / Lipides | **407** · 25 · 41 · 13 |

**L'avertissement affiché**, mot pour mot :

> 🔬 La fiche annonce **48.3 kcal/100 g**, mais ses protéines et ses lipides en valent déjà **53.2**
> à eux seuls — **même si les glucides ne comptaient pour rien**. L'app utilise **99.2 kcal/100 g**,
> l'autre valeur de la fiche (**energy-kj_100g**).
> *La valeur d'origine (48.3) est conservée avec la ligne. Si tu as l'étiquette, tu peux corriger.*

---

## 2. La conclusion factuelle

Les sept points demandés, **chacun mesuré en runtime sur le code déployé**, en conduisant les
vraies portes — pas en appelant les fonctions à la main.

| Question | Réponse mesurée |
|---|---|
| **État du résolveur** | **`ALTERNATIVE_FIABLE`** — et **non** `DERIVE_ESTIMABLE` |
| **Méthode** | **`autre_champ_source`** · confiance **`source`** |
| **Champ source utilisé** | **`energy-kj_100g`** (`fiab.champ`) |
| **Champ d'où venait la valeur brute** | **`energy-kcal_100g`** (`fiab.champSource`) |
| **Valeur brute** | **48,3 kcal/100 g** — conservée avec la ligne (`fiab.brut`) |
| **Valeur retenue** | **99,2 kcal/100 g** |
| **Résultat pour 410 g** | **407 kcal** · 25 P · 41 G · 13 L |
| **Scan = saisie manuelle ?** | **oui** — écran, résolution et ligne **identiques** |
| **Changement nécessaire ?** | ⛔ **aucun.** Tout correspond au contrat |

### Le détail qui a tranché : la fiche se contredit elle-même

| champ de la fiche | valeur | verdict |
|---|---|---|
| `energy-kcal_100g` | **48,3 kcal** | ⛔ **impossible** — 4×6,1 + 9×3,2 = **53,2** à eux seuls |
| `energy-kj_100g` | **≈ 415 kJ** | ✅ **tenable** — 415 / 4,184 = **99,187…** → **99,2** |

👉 ***L'erreur est DANS LA BASE Open Food Facts, pas dans l'application.*** C'est l'hypothèse **A**
des cinq envisagées en ft-v1207, et elle n'a pu être tranchée que par l'écran de Michel : le
conteneur de développement ne peut pas joindre Open Food Facts (403).

⚠️ **Une donnée fausse chez Open Food Facts reste fausse** : la corriger à la source profiterait à
tous ceux qui scannent ce produit. C'est un geste que Michel peut faire, pas l'app.

---

## 3. « Rien n'est recalculé inutilement » — la mesure, pas l'intention

Michel a posé la question nommément : *« vérifie qu'aucune valeur n'est désormais recalculée
inutilement à partir des macros quand une autre valeur énergétique cohérente de la même source
existe. »*

**Mesuré, en instrumentant la fonction d'estimation :**

| ce qu'on observe | valeur |
|---|---|
| appels à l'estimation pendant la résolution | **1** |
| ce qu'elle rend | **93,2 kcal** |
| ce qui est **retenu** | **99,2 kcal** — la valeur **de la fiche** |

⭐⭐ **L'estimation sert de JUGE, jamais de source.** Elle n'est appelée que pour répondre à une
seule question : *« ce second champ est-il crédible ? »*. Un candidat qui s'en écarte de plus de
30 % est **refusé** — c'est ce qui empêche qu'une erreur de saisie d'un facteur 1000 dans la base
(un champ à 3 000 kJ, par exemple) devienne notre valeur de confiance.

⛔ **Donc on ne la supprime pas « pour économiser un calcul »** : c'est une addition de trois
produits, et elle ferme une vraie faille. *Un garde qui coûte une multiplication n'est pas un
gaspillage, c'est le prix de ne pas croire n'importe quoi.*

---

## 4. Ce qui fige ce cas pour de bon

Bloc **CCCVI** du parcours (`tests/parcours/runner.js`), **22 témoins**. Les principaux :

| témoin | ce qu'il fige |
|---|---|
| ① | le code-barres réel à 410 g donne **407 kcal**, pas 198 |
| ①bis | c'est une valeur **de la source** (`ALTERNATIVE_FIABLE`, `energy-kj_100g`), pas une estimation |
| ①ter | la **même fiche privée de son second champ** retombe sur les macros (382, `DERIVE_ESTIMABLE`) |
| ② | l'avertissement nomme **les deux** valeurs, et l'ancien encadré a disparu |
| ③ / ③bis | **scan et saisie manuelle** donnent le même résultat complet — et la provenance, elle, les distingue (`scan` contre `code-tape`) |
| ⑤ | la trace part avec la ligne, et **`champSource` survit** |
| ⑨bis / ⑨ter | un second champ **impossible** ou **absurde** est refusé |
| ⑨quater | **rien n'est recalculé depuis les macros** quand la source a une valeur qui tient |

⛔ **Et deux témoins protègent une ABSENCE** : aucun cas particulier pour ce code-barres, et le
garde de mise à jour de ft-v1184 n'a pas été « réparé ».

### ⚠️ Un défaut de témoin trouvé en écrivant ce document

Le témoin « scan = tapé » passait `saisie:'manuel'` — **une valeur qui n'existe pas en
production** : la vraie porte (`_manualBarcode`) enregistre **`'code-tape'`**. Le résultat était
juste **par accident**. 👉 ***Vérifier la fonction n'est pas vérifier l'appel*** (`BUGS.md` §58).
Le témoin conduit désormais la vraie porte : il remplit le champ et l'appelle, comme la personne.

---

## 5. Ce que ce document ne fait pas

⛔ **Aucun changement de comportement.** ⛔ **Aucun fichier servi modifié** — `sw.js` n'est donc pas
bumpé (*un bump gratuit fait re-télécharger l'app à tout le monde pour rien*).
⛔ **Périmètre intact**, nommé par Michel : la douane · `savedFoods` · l'historique · les
migrations · les `ml` · `saveEditFood` · `rejouerRepas` · l'estimation IA · les autres règles
Nutrition.

---

*Conception du chantier : journal des versions **ft-v1207** et **ft-v1208** (`CLAUDE.md`) ·
`docs/CAPTURE-IPHONE-TRANCHEE.pdf` · `docs/FIABILITE-ENERGIE-MACROS.pdf`.*
