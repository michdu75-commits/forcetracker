# 🛃 La DOUANE du journal alimentaire — étape 5

> **Créée le 13/09/2026**, sur feu vert de Michel après validation du hub (ft-v1204) :
> ⛔ *« la douane doit être construite et validée séparément. Je ne veux pas encore de correction
> automatique ni de blocage utilisateur. »*
>
> **Objectif, mot pour mot** : *« créer un point unique de contrôle juste avant l'écriture finale
> dans `S.foodLog`, afin que toutes les lignes qui vont réellement être enregistrées puissent être
> observées avec les mêmes règles »*.

---

## 0️⃣ CE QU'ELLE EST, EN UNE LIGNE

**Elle LIT la forme finale. Elle ne la reconstruit pas, ne la corrige pas, ne la bloque pas.**

```
objet final à enregistrer  →  douane  →  résultat d'observation  →  écriture INCHANGÉE
```

⭐⭐ *Le hub PRÉPARE, la douane OBSERVE. Ni l'un ni l'autre ne décide — pas encore.*

---

## 1️⃣ LES ÉCRIVAINS RÉELS — 4, recomptés le jour même

**Mesuré dans le code servi**, pas repris d'un plan :

| # | écrivain | forme de l'écriture | rôle |
|---|---|---|---|
| ⓵ | `addFoodEntry` | `S.foodLog.push(_e)` | l'écran d'ajout |
| ⓶ | `quickAddFood` | `S.foodLog.push(…)` | l'ajout **direct** depuis « Mes aliments », sans écran |
| ⓷ | `rejouerRepas` | `push` **dans une boucle** | rejeu d'un repas habituel — plusieurs lignes d'un coup |
| ⓸ | **`saveEditFood`** | ⚠️ **aucun `push`** — elle **mute en place** un élément déjà dans le tableau, puis `persist()` | l'édition d'une ligne |

👉 ***Une recherche sur `S.foodLog.push` rate le quatrième, et c'est pourtant une vraie ligne
enregistrée.*** C'est précisément ce qui rendait le recomptage nécessaire.

### ⛔ Écartés du périmètre, **avec leur raison** (R30)

| fonction | pourquoi elle n'est pas un écrivain de ligne |
|---|---|
| `removeFoodEntry` | elle **supprime** |
| `_vcApplyPersona` (coach.js) | persona de **test**, elle remplace tout le journal |
| `_applyRestoreData` (setup.js) | **restauration** d'une sauvegarde |
| `load` · `_fusionnerAvecLeDisque` (state.js) | **chargement** depuis le stockage du téléphone |

*Ils remplacent ou retirent ; ils n'enregistrent pas une ligne issue d'une saisie.*

---

## 2️⃣ LA FORME EXACTE JUSTE AVANT L'ÉCRITURE — et elle n'est pas la même partout

Mesurée sur **8 formes réelles** (grammes · portions · pour-100 g présent/absent · provenance
présente/absente · quantité valide/absente) :

| | les **3 pousseurs** | `saveEditFood` |
|---|---|---|
| **clés toujours présentes** | **17** | **8** |
| clés optionnelles | `portionLabel`, `portionWeightG` | `q`, `u`, `per100`, `origine`, `sourceId`, `etat`, `portionLabel`, `portionWeightG` |
| `v` · `saisie` · `modifie` | ✅ posés par `_provFood` | ⛔ **jamais posés** |

⭐ Les trois pousseurs passent tous par **`_provFood`**, donc ils produisent la même forme.
`saveEditFood` ne l'appelle pas : elle **hérite** de ce que la ligne portait déjà.

---

## 3️⃣ LE CONTRAT

```js
_douaneLigne(ligne, ecrivain) → { v:1, etat:'OK'|'WARN'|'INVALID', regles:[…], ecrivain:'…' }
```

- **pure vis-à-vis de son entrée** : elle ne touche à aucun champ de `ligne` (prouvé octet pour
  octet, clés triées, sur les 29 lignes réelles **et** sur 4 formes fabriquées) ;
- **sans effet de bord visible** : ni `S.foodLog`, ni `persist`, ni `toast`, ni `document` ;
- **un carnet volatile** (`_douaneVus`, 50 derniers) rend le résultat *« explicite et testable »*
  sans rien persister. ⛔ Il ne garde **que** l'état, l'écrivain et les noms de règles — **jamais**
  le nom de l'aliment ni ses valeurs : *la douane observe la FORME, elle ne collecte pas ce que la
  personne mange* (Constitution **P3** · **R36**).

---

## 4️⃣ LES 21 RÈGLES — mesurées avant d'être écrites

⚠️ Michel : *« ne transforme pas automatiquement cette liste en règles ; mesure d'abord ce qui
existe réellement dans les données »*. Les candidates ont été passées sur les **29 lignes
réellement écrites** avant qu'une seule ligne de douane n'existe.

### ⛔ 9 règles `INVALID` — la ligne ne peut pas être interprétée

`nom_absent` · `date_absente` · `repas_absent` · `horodatage_absent` · `macro_non_finie` ·
`macro_negative` · `quantite_non_finie` · `quantite_negative` · `per100_non_fini`

### ⚠️ 12 règles `WARN` — elle s'interprète, mais quelque chose ne va pas ensemble

`unite_sans_quantite` · `quantite_sans_unite` · `unite_inconnue` · `unite_non_reprenable` ·
`portion_sans_poids` · `grammes_sans_per100` · `aucune_valeur` · `tracabilite_absente` ·
`provenance_orpheline` · `energie_incoherente` · `portion_masse_incoherente` ·
`per100_incoherent_avec_ligne`

### 🗑️ Deux candidates **jetées à la mesure**

- **`portion_sans_nom`** — une étiquette absente n'est pas une incohérence, juste un nom absent.
- **un seuil énergétique purement relatif** — il mordait sur un café à 2 kcal et sur les macros
  arrondies à l'entier par l'écran d'édition. ⭐ Le seuil retenu est **relatif ET absolu**
  (`≥ 25 kcal` d'écart **et** `> 30 %`).

---

## 5️⃣ LA RÉPARTITION MESURÉE — 4 écrivains × 8 formes

| état | nombre | remarque |
|---|---|---|
| **OK** | **12** | |
| **WARN** | **17** | |
| **INVALID** | **0** | ⭐ aucune ligne réellement produite par l'app n'est structurellement cassée |
| *(rien écrit)* | 3 | l'écran d'ajout **refuse** de lui-même 3 des 8 formes |

| règle | mord | sur quoi |
|---|---|---|
| `tracabilite_absente` | **8** | ⚠️ **exactement les 8 lignes de `saveEditFood`** |
| `portion_sans_poids` | 4 | les 4 écrivains, sur la portion sans poids |
| `grammes_sans_per100` | 3 | |
| `aucune_valeur` | 3 | |
| `energie_incoherente` | 3 | le cas des 48 kcal |
| `unite_sans_quantite` | 1 | |
| `unite_non_reprenable` | 1 | |

⛔ **Les 9 familles `INVALID` ne mordent sur AUCUNE ligne réelle.** Un témoin qui se contenterait
de le constater serait *un vert qui ne peut pas rougir* (ft-v994) : chacune est donc **éprouvée
une par une** sur une ligne fabriquée exprès, pour prouver que la branche existe.

---

## 6️⃣ DEUX DIVERGENCES RÉELLES — mesurées, écrites, **NON corrigées**

> Règle du projet depuis ft-v1200 : *un défaut découvert pendant un chantier se mesure, s'écrit
> avec sa cause, et attend un feu vert séparé.*

### ⓵ Une ligne **éditée** perd sa traçabilité

`saveEditFood` ne pose ni `v`, ni `saisie`, ni `modifie` — elle n'appelle pas `_provFood`.
👉 **Toute** ligne passée par l'écran d'édition sort `WARN` sur `tracabilite_absente` : 8 sur 8.
⛔ *Ce n'est pas un défaut de la ligne, c'est une divergence d'architecture entre les écrivains.*

### ⓶ Une ligne entièrement à zéro : refusée d'un côté, acceptée des trois autres

`addFoodEntry` refuse *« Renseigne au moins les calories »* ; `quickAddFood`, `rejouerRepas` et
`saveEditFood` l'acceptent. ⭐ **La douane ne tranche pas ce désaccord — elle le rend visible.**

### ⓷ Au passage, deux écarts déjà connus, re-confirmés à la mesure

- `rejouerRepas` perd `sourceId` et `etat` là où `quickAddFood` les garde (documenté en 1b-ii) ;
- une unité `ml` est **effacée** par les pousseurs (`_provFood` refuse la quantité) et **conservée**
  par l'écran d'édition.

---

## 7️⃣ CE QUI RESTE À FAIRE

- ⛔ **Rendre une règle bloquante** — consigne explicite : *« ne rends aucune règle bloquante sans
  un nouveau feu vert séparé »*. La mesure ci-dessus est là pour que cette décision soit prise
  sur des chiffres, pas sur une intuition.
- ⛔ Les **3 divergences** ci-dessus : décisions produit, pas corrections.
- ⛔ Hors périmètre inchangé : `savedFoods` multi-onglets · l'écart **48,3 / 48** · l'historique ·
  les migrations · les harmonisations produit · le garde `!_bcNutr` non bloquant (ft-v1203).
