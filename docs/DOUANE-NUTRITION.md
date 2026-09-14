# 🛃 La DOUANE du journal alimentaire — étape 5

> ## 🧊 ÉTAT AU 13/09/2026 : **PHASE D'OBSERVATION RÉELLE — GELÉ**
>
> Les étapes 5 (la douane) et 6 (l'observation) sont **validées par Michel** et **plus rien ne
> bouge** tant qu'il n'a pas donné un nouveau feu vert explicite.
> ⛔ **Ne pas toucher** : les 21 règles · leur gravité · les seuils · les divergences connues ·
> `savedFoods` · l'écart 48,3 / 48 · l'historique · les migrations · **le format du carnet**.
> ⭐ **On attend des chiffres réels** : ≥ 100 lignes, les 4 écrivains vus, ~2 semaines, et surtout
> une **couverture** suffisante des formes.
> ⚠️ *Une règle qui n'a jamais mordu n'est pas inutile : elle peut être **non éprouvée**.*

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


### ✅ Le compte a été re-fait de façon indépendante, par 5 méthodes qui ne se parlent pas

Un balayage adversarial (syntaxe directe · alias de tableau · mutation d'un **élément** ·
remontée depuis la **persistance** · départ du **métier**, écran par écran) a re-cherché les
écrivains sans connaître mon relevé. **Il trouve exactement les mêmes 4**, et les mêmes exclusions.

⭐⭐ **Et il a vérifié trois choses que mon propre balayage ne pouvait pas voir** :

| vérification | résultat |
|---|---|
| accès par **crochets** (`S['foodLog']`) — invisible à toute recherche sur `S.foodLog.` | **zéro occurrence** |
| **fuite de références vives** : une ligne du journal qui s'échappe par référence et serait mutée ailleurs | `_afSuggLocales` et `_repasHabituels` en font fuir — ⭐ **aucun de leurs consommateurs ne les mute** |
| `_majDefFavori` · `_qtyRescale` — appelées juste après une écriture | la 1ʳᵉ écrit dans `S.savedFoods`, la 2ᵉ dans des champs du DOM : **ni l'une ni l'autre ne touche à la ligne** |

👉 ***C'est la seule façon de prouver qu'il n'y a pas de 5ᵉ écrivain*** : un scan sur `S.foodLog`
ne peut pas voir une ligne mutée à travers une référence obtenue ailleurs.

⚠️ **Une nuance relevée au passage, hors périmètre** : `_fusionnerAvecLeDisque` remplace le journal
**depuis l'intérieur de `persist()`** — un chemin système, pas un écrivain de ligne, mais bon à
savoir avant de toucher à la persistance. Et `finalImportMeal` est un **faux ami** : elle a tout
l'air d'une porte nutrition et **n'écrit rien** dans le journal.

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

---

# 📊 ÉTAPE 6 — L'OBSERVATION RÉELLE (ft-v1206)

> Feu vert de Michel après validation du mode observation : *« faire tourner `_douaneLigne(...)`
> sur les vraies lignes réellement produites par l'application et obtenir un rapport agrégé des
> WARN / INVALID rencontrés en usage réel, **sans stocker le contenu des repas ni les valeurs
> nutritionnelles personnelles** »*.
>
> ⛔ **Rien ne change à la douane** : les 21 règles sont intactes, aucune n'est bloquante, aucune
> ligne n'est corrigée. Un témoin épingle les 21 règles et leurs 9 `INVALID`.

## 1️⃣ COMMENT C'EST BRANCHÉ

Les 4 écrivains appellent déjà `_douaneLigne` depuis ft-v1205. **Rien n'est rebranché** : c'est
`_douaneLigne` elle-même qui, après avoir rendu son verdict, appelle **`_douaneCompter(res, l)`**.

```
écrivain → _douaneLigne → verdict → _douaneCompter → compteurs (clé ft4_douane_obs)
                                 ↘ écriture INCHANGÉE
```

⭐ L'appel est enveloppé dans un `try` qui avale tout : **le comptage ne peut pas empêcher une
écriture**, même s'il plantait. Un témoin le fige.

## 2️⃣ CE QUI EST COLLECTÉ — la liste est fermée

| gardé | pourquoi |
|---|---|
| l'**écrivain** (4 valeurs) | comparer les 4 chemins entre eux |
| le **verdict** (`OK`/`WARN`/`INVALID`) | la répartition |
| les **noms** des règles qui ont mordu | savoir lesquelles servent |
| la **forme** (`grammes` · `portion` · `ml` · `sans_quantite` · `autre`) | déduite de `u`/`q` **seuls** |
| un **booléen** « la ligne avait-elle un `sourceId` » | suivre la divergence `rejouerRepas` |
| des **compteurs** et le **catalogue** des règles | le rapport |

⛔ **Jamais** : nom d'aliment · quantité réelle · kcal · protéines · glucides · lipides ·
commentaire · description de repas · **identifiant source** · date d'un repas.
👉 *Rien qui permette de reconstruire ce que la personne a mangé.* (**R36** · Constitution **P3**)

⭐ **Le catalogue des 21 règles n'est recopié nulle part** : il se remplit tout seul au premier
appel (`dit()` enregistre chaque nom), donc une règle ajoutée ou renommée suit sans divergence
possible (**R2**).

## 3️⃣ LA PREUVE QU'AUCUNE DONNÉE DE REPAS N'EST STOCKÉE — un CANARI

On enregistre, **par un vrai écrivain**, un aliment nommé `ZZCANARIMICHELXY` avec des valeurs
reconnaissables (`7777`, `6666`, `5555`, `4444`, `3333`, `9999`, `8888`, `2222`, `1111`) et un
`sourceId` `off:ZZCANARISOURCE`. Puis on lit **ce qui a été réellement stocké** et on y cherche
ces 11 chaînes.

⛔⛔ **Et le même témoin vérifie que le carnet a bien enregistré** (`quickAddFood` y figure) —
*sans ça, un carnet vide passerait le test sans rien prouver*, et la promesse de confidentialité
serait un vert qui ne peut pas rougir (ft-v994).

⭐⭐ **Les trois mutations de fuite** — garder le nom · garder les calories · garder l'identifiant
de source au lieu du booléen — **ne changent rien à l'écran**. Sans le canari, elles passeraient
toutes les trois. *C'est exactement le genre de dérive qu'aucun parcours ne peut voir.*

## 4️⃣ OÙ IL VIT, ET POURQUOI IL N'EN SORT PAS

- **sa propre clé** `ft4_douane_obs`, **hors de `S`** → donc hors de la sauvegarde, hors de la
  synchronisation cloud, hors de tout export. Trois témoins le figent, dont un qui lit `setup.js`.
- **borné** : 40 combinaisons maximum, le reste tombe dans `(autres)`.
- **remise à zéro d'un bouton** — et un témoin vérifie qu'elle **ne touche pas au journal
  alimentaire**.
- **il survit au rechargement** : c'est tout l'intérêt d'observer un usage réel sur plusieurs
  jours.

## 5️⃣ COMMENT LIRE LE RAPPORT

**Profil → Admin → « 📊 Douane — observation du journal » → Voir le rapport.**
Boutons *Copier* (pour me l'envoyer) et *Repartir de zéro* (compteurs seulement).

Le rapport donne, dans l'ordre : le **nombre de lignes observées** et la période · les
**verdicts** · le détail **par écrivain** (verdicts, formes, avec/sans identifiant de source) ·
les **règles qui ont mordu** · ⭐ **les règles qui n'ont JAMAIS mordu** · les **combinaisons**
les plus fréquentes.

⛔ Il **pose** les trois questions produit et **n'y répond pas** :
① quelles règles sont purement théoriques ? ② lesquelles signalent du réel mais doivent **rester**
des avertissements ? ③ lesquelles pourraient devenir bloquantes sans casser un usage légitime ?

## 6️⃣ COMBIEN DE TEMPS OBSERVER AVANT DE DÉCIDER

⚠️ **Je ne tranche pas — voici sur quoi la décision peut s'appuyer.**

| repère | pourquoi celui-là |
|---|---|
| **≥ 100 lignes** | en dessous, une règle qui mord 1 fois sur 20 peut ne jamais apparaître par hasard |
| **les 4 écrivains vus au moins une fois** | `rejouerRepas` et `saveEditFood` sont rares : sans eux, la moitié des divergences mesurées reste invisible |
| **≥ 2 semaines** | un usage réel contient des semaines chargées et des semaines creuses ; une seule semaine ne dit rien de la variété des formes |

⭐ **Le vrai critère n'est pas le temps, c'est la COUVERTURE** : une règle ne peut être déclarée
*« purement théorique »* que si les formes qui la déclencheraient ont **réellement été produites**.
👉 *Une règle qui n'a jamais mordu parce que le cas ne s'est jamais présenté n'est pas une règle
inutile — c'est une règle non éprouvée.* Le rapport donne les formes rencontrées précisément pour
qu'on puisse faire la différence.
