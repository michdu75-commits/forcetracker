# 🔋 Récupération — PHASE 1 : les chiffres avant le code

> **04/09/2026.** Réponse à la « suite à donner au contre-audit » (28 sections). **Aucune ligne de
> code du dépôt n'a été modifiée** — c'est la contrainte du §28, et elle est tenue.
>
> ⭐⭐ **Méthode** : on **remplace `_penaliteSeance` en mémoire dans la page** et on rejoue la
> **vraie** `calcRecoveryDetail`. Le moteur reste celui de la production ; seule la charge change.
> Rien n'est simulé à côté.

---

## 0. Les deux contrôles qui rendent tout le reste lisible

⛔ **Sans eux, ces tableaux seraient parfaitement crédibles et parfaitement faux.**

| contrôle | résultat |
|---|---|
| le remplacement de `_penaliteSeance` **prend effet** | ✅ **oui** — 67 → 57 (pénalité forcée à 38) → 67 (rendue) |
| `score = constante + ajustement de séance` | ✅ **vérifié sur 4 points** (12 séries à 20 h · 20 à 20 h · 20 à 0 h · 4 à 20 h — mesuré = attendu à chaque fois) |

La constante vaut **C = 79** dans le décor de référence (homme 35 ans, 80 kg, intermédiaire,
3 nuits de 7 h 30 qualité 3, aucune séance). C'est elle qui permet de calculer un raccord
proposé sans avoir à modifier le code : **le moteur est une somme, et on l'a prouvé.**

---

## 1. Ancrage cardio — les deux variantes demandées

`charge_équivalente = MET·min ÷ facteur`, puis **exactement le barème actuel** (`×1,7`, plafond 38).

| ancrage | facteur |
|---|---|
| 45 min modéré = **6 séries** | MET·min **÷ 41,3** |
| 45 min modéré = **8 séries** | MET·min **÷ 30,9** |

### 1.1 Ancrage 6 séries

| intensité | min | MET | MET·min | charge | pénalité | score |
|---|---|---|---|---|---|---|
| léger | 5 | 3,5 | 18 | 0,4 | −2 | 78 |
| léger | 10 | 3,5 | 35 | 0,8 | −2 | 78 |
| léger | 20 | 3,5 | 70 | 1,7 | −3 | 77 |
| léger | 30 | 3,5 | 105 | 2,5 | −4 | 77 |
| léger | 45 | 3,5 | 158 | 3,8 | −6 | 75 |
| léger | 60 | 3,5 | 210 | 5,1 | −9 | 74 |
| léger | 90 | 3,5 | 315 | 7,6 | −13 | 71 |
| **modéré** | 5 | 5,5 | 28 | 0,7 | −2 | 78 |
| **modéré** | 10 | 5,5 | 55 | 1,3 | −2 | 78 |
| **modéré** | 20 | 5,5 | 110 | 2,7 | −5 | 76 |
| **modéré** | 30 | 5,5 | 165 | 4,0 | −7 | 75 |
| **modéré** | **45** | 5,5 | **248** | **6,0** | **−10** | **73** |
| **modéré** | 60 | 5,5 | 330 | 8,0 | −14 | 71 |
| **modéré** | 90 | 5,5 | 495 | 12,0 | −20 | 67 |
| intense | 5 | 9,5 | 48 | 1,2 | −2 | 78 |
| intense | 10 | 9,5 | 95 | 2,3 | −4 | 77 |
| intense | 20 | 9,5 | 190 | 4,6 | −8 | 74 |
| intense | 30 | 9,5 | 285 | 6,9 | −12 | 72 |
| intense | 45 | 9,5 | 428 | 10,4 | −18 | 68 |
| intense | 60 | 9,5 | 570 | 13,8 | −23 | 66 |
| intense | 90 | 9,5 | 855 | 20,7 | −35 | 59 |

### 1.2 Ancrage 8 séries

| intensité | min | MET·min | charge | pénalité | score |
|---|---|---|---|---|---|
| léger | 5 | 18 | 0,6 | −2 | 78 |
| léger | 10 | 35 | 1,1 | −2 | 78 |
| léger | 20 | 70 | 2,3 | −4 | 77 |
| léger | 30 | 105 | 3,4 | −6 | 75 |
| léger | 45 | 158 | 5,1 | −9 | 74 |
| léger | 60 | 210 | 6,8 | −12 | 72 |
| léger | 90 | 315 | 10,2 | −17 | 69 |
| **modéré** | 5 | 28 | 0,9 | −2 | 78 |
| **modéré** | 10 | 55 | 1,8 | −3 | 77 |
| **modéré** | 20 | 110 | 3,6 | −6 | 75 |
| **modéré** | 30 | 165 | 5,3 | −9 | 74 |
| **modéré** | **45** | **248** | **8,0** | **−14** | **71** |
| **modéré** | 60 | 330 | 10,7 | −18 | 68 |
| **modéré** | 90 | 495 | 16,0 | −27 | 63 |
| intense | 5 | 48 | 1,5 | −3 | 77 |
| intense | 10 | 95 | 3,1 | −5 | 76 |
| intense | 20 | 190 | 6,1 | −10 | 73 |
| intense | 30 | 285 | 9,2 | −16 | 70 |
| intense | 45 | 428 | 13,8 | −23 | 66 |
| intense | 60 | 570 | 18,4 | −31 | 61 |
| intense | 90 | 855 | 27,6 | **−38 (plafond)** | 57 |

### 1.3 ⭐ Ce que les deux tableaux disent, et le seul vrai discriminant

**Les deux ancrages tombent exactement dans la fenêtre demandée** — la cible annoncée était
*« −10 à −14 »* pour 45 min modéré : l'ancrage 6 donne **−10**, l'ancrage 8 donne **−14**.
👉 ***La question n'est donc plus « lequel est raisonnable », mais « lequel des deux bords de TA
fenêtre ».***

Le discriminant est **en haut du tableau**, pas au milieu :

| | ancrage 6 | ancrage 8 |
|---|---|---|
| 10 min léger (échauffement) | −2 | −2 |
| 20 min modéré | −5 | −6 |
| **45 min modéré** | **−10** | **−14** |
| 60 min modéré | −14 | −18 |
| 90 min modéré | −20 | −27 |
| **90 min intense** | **−35** | **−38 → le plafond est atteint** |

⛔ **Avec l'ancrage 8, un cardio SEUL peut atteindre le plafond de 38** — c'est-à-dire le niveau
qui, depuis ft-v718, désigne *« 24 séries de squat »*. L'ancrage 6 laisse le plafond à la
musculation : le cardio le plus extrême du tableau s'arrête à −35.

**⚠️ Et une chose vraie dans les deux cas** : le plafond mord sur les séances **mixtes** lourdes
(45 min intense + 20 séries → 38 dans les deux ancrages). C'est nouveau, et c'est voulu : deux
grosses charges additionnées **doivent** buter sur le plafond, sinon il ne sert à rien.

---

## 2. Musculation — vérification que rien ne bouge (§9, §20)

| séries | pénalité actuelle | P0 (aucun plancher) | P1 (plancher 2) | P2 (plancher 3) |
|---|---|---|---|---|
| 0 | — | — | — | — |
| **1** | **−6** | −2 | −2 | −3 |
| **2** | **−6** | −3 | −3 | −3 |
| **3** | **−6** | −5 | −5 | −5 |
| 4 | −7 | −7 | −7 | −7 |
| 6 | −10 | −10 | −10 | −10 |
| 8 | −14 | −14 | −14 | −14 |
| 10 | −17 | −17 | −17 | −17 |
| 12 | −20 | −20 | −20 | −20 |
| 16 | −27 | −27 | −27 | −27 |
| 20 | −34 | −34 | −34 | −34 |
| 24 | −38 | −38 | −38 | −38 |
| 30 | −38 | −38 | −38 | −38 |

✅ **À partir de 4 séries, rien ne change — pas d'un point.** Le `×1,7`, les multiplicateurs de
série et le plafond 38 sont intacts. **Seules 1, 2 et 3 séries bougent**, ce qui est exactement le
périmètre du §8.

---

## 3. Le plancher de 6 — trois solutions, mesurées

Scores pour 0 / 1 / 2 / 3 / 4 séries :

| variante | 0 | 1 | 2 | 3 | 4 | falaise d'entrée |
|---|---|---|---|---|---|---|
| **actuel (plancher 6)** | 79 | **75** | 75 | 75 | 75 | **−4 d'un coup, puis plat** |
| **P0 — aucun plancher** | 79 | 78 | 77 | 76 | 75 | **−1 par palier** ✅ |
| **P1 — plancher 2** | 79 | 78 | 77 | 76 | 75 | **−1 par palier** ✅ |
| **P2 — plancher 3** | 79 | 77 | 77 | 76 | 75 | −2 puis −0 |

**⭐⭐ Résultat inattendu et important : P0 et P1 sont INDISCERNABLES.** `round(1,7 × 1 série) = 2`
— un plancher de 2 n'est **jamais atteignable par le bas**, donc il ne mord jamais. Les deux
variantes produisent la **même** colonne de chiffres.

👉 **Le choix réel n'est donc pas entre trois solutions, mais entre deux** :

- **retirer le plancher** (ou le mettre à 2, ce qui revient au même mesurablement) → progression
  parfaitement régulière ;
- **le descendre à 3** → une petite marche subsiste à la 1ʳᵉ série, et 1 et 2 séries deviennent
  indistinguables.

⛔ **Recommandation : P1 = 2, et pas P0.** Non pas pour l'effet — il est identique — mais parce que
**garder un plancher NOMMÉ conserve la décision d'origine sous une forme lisible** : *« une séance
enregistrée coûte au moins quelque chose »*. Son origine est introuvable dans le journal (**R30**) ;
le baisser au lieu de le supprimer permet de ne pas trancher une décision qu'on n'a pas retrouvée.

**Côté cardio, la même question, mesurée** (ancrage 6) :
0 → **79** · 5 min léger → **78** · 10 min léger → **78** · 20 min léger → **77** · 30 min → 77.
Aucune falaise ; l'échauffement de 10 minutes coûte **2 points**, ce qui est le comportement
demandé au §5.

---

## 4. Le raccord des 48 h — deux variantes (§6)

Séance de 20 séries. `C = 79`.

| heures depuis la séance | **actuel** | **R1 — rampe de 12 h** | **R2 — bonus continu en heures** |
|---|---|---|---|
| 24 | 62 | 62 | 62 |
| 36 | 70 | 70 | 70 |
| 42 | 75 | 75 | 75 |
| 46 | 78 | 78 | 78 |
| 47 | 78 | 78 | 78 |
| 47,5 | 79 | 79 | 79 |
| 47,9 | 79 | 79 | 79 |
| **48,0** | **85** ⛔ | **79** ✅ | **79** ✅ |
| 48,1 | 85 | 79 | 79 |
| 49 | 85 | 80 | 79 |
| 50 | 85 | 80 | 80 |
| 54 | 85 | 82 | 81 |
| 59 | 85 | 85 | 82 |
| 60 | 85 | 85 | 82 |
| 61 | 85 | 85 | 82 |
| 72 | 88 | **88** | 85 |
| 84 | 88 | 88 | 88 |
| 96 | 91 | 91 | 91 |

**R1** — le bonus de repos garde son barème par **jours calendaires** (+6 / +9 / +12) mais s'installe
**progressivement sur 12 h** après la fin de l'effacement :
`bonus_effectif = bonus_du_jour × min(1 ; (heures − 48) ÷ 12)`

**R2** — le bonus devient une fonction **des heures**, sans jours calendaires :
`bonus = 12 × min(1 ; (heures − 48) ÷ 48)`

| | R1 | R2 |
|---|---|---|
| supprime la falaise de 48 h | ✅ | ✅ |
| supprime aussi la **marche de minuit** (+3 au changement de jour, visible entre 61 h et 72 h) | ⛔ **non** | ✅ **oui** |
| déplace l'historique | **très peu** (seulement les 12 h après 48 h) | **davantage** (72 h : 88 → 85) |
| complexité | 1 multiplication | remplace le barème par jours |

**⛔ Recommandation : R1 pour l'étape A.** Elle corrige le défaut certain (la falaise mesurée) en
touchant **12 heures de barème** et rien d'autre. La marche de minuit existe depuis toujours,
vaut **3 points** au lieu de 6, et n'a jamais fait l'objet d'un retour — *la traiter dans le même
geste mélangerait un défaut mesuré et une amélioration discutable*, ce qui est exactement ce que
le §9 demande d'éviter.

---

## 5. `projectionRecup()` — la remise en cohérence exacte (§7)

**Aujourd'hui** (tracking.js, dans `projectionRecup`) :

```js
const hFin = Math.max(0, 48 - 24/Math.max(1,pen)) + 1/60;
```

**D'où viennent ces deux nombres.** La pénalité affichée vaut `round(pen × (H − h) / H)`. Elle
tombe à 0 quand ce produit passe sous 0,5, c'est-à-dire à `h = H − (H/2)/pen`. Avec `H = 48` :
`48 − 24/pen`. Le `24` **est** `48 ÷ 2` — **les deux littéraux dépendent de `RECUP_EFFACE_H`.**

**Correction, sans changer un seul comportement à H = 48 :**

```js
const H = RECUP_EFFACE_H;
const hFin = Math.max(0, H - (H/2)/Math.max(1,pen)) + 1/60;
```

⭐ **À H = 48 les deux expressions sont rigoureusement identiques** — donc cette correction est
**invisible aujourd'hui** et ne déplace aucun historique. Elle ne sert qu'à une chose : que le jour
où quelqu'un change `RECUP_EFFACE_H`, la date annoncée bouge avec le score au lieu de mentir.

**Le témoin déterministe qui va avec** (§7) — il doit pouvoir rougir :
1. pour plusieurs pénalités (6, 17, 34, 38), calculer `hFin` via `projectionRecup` ;
2. rejouer `calcRecoveryDetail(refTs)` **une minute avant** et **une minute après** cet instant ;
3. exiger que l'ajustement de séance soit **non nul avant** et **nul après**.
4. ⛔ **Et le contrôle négatif** : refaire tourner ce témoin avec `RECUP_EFFACE_H` temporairement
   à 36 — il doit **rougir** sur le code actuel (littéraux) et **rester vert** après correction.
   *Sans cette étape, le témoin serait vert des deux côtés et ne prouverait rien.*

---

## 6. Séances mixtes — une seule somme (§5, §20)

Ancrage 6, plancher 2 :

| cas | charge | pénalité | score |
|---|---|---|---|
| cardio seul 45 min modéré | 6,0 | −10 | 73 |
| muscu seule 10 séries | 10,0 | −17 | 69 |
| 10 min léger + 10 séries | 10,8 | −18 | 68 |
| 20 min modéré + 10 séries | 12,7 | −22 | 66 |
| 45 min modéré + 10 séries | 16,0 | −27 | 63 |
| 10 min léger + 20 séries | 20,8 | −35 | 59 |
| 45 min intense + 20 séries | 30,4 | −38 (plafond) | 57 |
| 10 léger + 15 séries + 20 modéré | 18,5 | −31 | 61 |

Ancrage 8, plancher 2 :

| cas | charge | pénalité | score |
|---|---|---|---|
| cardio seul 45 min modéré | 8,0 | −14 | 71 |
| muscu seule 10 séries | 10,0 | −17 | 69 |
| 10 min léger + 10 séries | 11,1 | −19 | 68 |
| 20 min modéré + 10 séries | 13,6 | −23 | 66 |
| 45 min modéré + 10 séries | 18,0 | −31 | 61 |
| 10 min léger + 20 séries | 21,1 | −36 | 58 |
| 45 min intense + 20 séries | 33,8 | −38 (plafond) | 57 |
| 10 léger + 15 séries + 20 modéré | 19,7 | −33 | 60 |

✅ **Une seule somme, aucun double comptage** : `charge = séries + Σ(MET·min ÷ facteur)` sur les
deux moments (`cardioAvant` et `cardio`), puis le barème s'applique une fois.
✅ **L'échauffement léger pèse ce qu'il doit peser** : +0,8 séries équivalentes, soit **1 point**
sur le score final (69 → 68).

---

## 7. Continuité et monotonicité (§21, §22)

**Valeurs réelles, pas « test vert ».**

| test | ancrage 6 | ancrage 8 |
|---|---|---|
| cardio 4 / 5 / 6 min modéré | 78 · 78 · 78 | 78 · 78 · 78 |
| cardio 19 / 20 / 21 min modéré | 77 · 76 · 76 | 75 · 75 · 75 |
| cardio 44 / 45 / 46 min modéré | 73 · 73 · 73 | 71 · 71 · 71 |
| séries 0 / 1 / 2 (plancher 2) | 79 · 78 · 77 | idem |
| 47,9 / 48,0 / 48,1 h (R1) | 79 · 79 · 79 | idem |
| 59 / 60 / 61 h (R1) | 85 · 85 · 85 | idem |

**Monotonicité** — les quatre exigences du §22 :

| exigence | avant | après |
|---|---|---|
| 20 min modéré **<** 45 min modéré (en charge) | ⛔ égaux (−6 / −6) | ✅ −5 / −10 |
| léger **<** modéré **<** intense à durée égale | ⛔ égaux | ✅ à 45 min : −6 / −10 / −18 |
| 10 séries **<** 15 séries | ✅ déjà vrai | ✅ inchangé |
| muscu seule **<** muscu + cardio | ⛔ égaux (64 / 64) | ✅ 69 → 68 → 66 → 63 |

**Aucune violation ne subsiste**, et aucune n'a besoin d'être expliquée.

---

## 8. Les profils A→K, ancien contre nouveau

*(ancrage 8, plancher 2 — le cas le plus défavorable des deux ancrages, choisi exprès pour montrer
l'écart maximal)*

| profil | ancien | nouveau | Δ | charge | pénalité |
|---|---|---|---|---|---|
| A · 22 ans débutant · 8 h · 10 séries | 73 | 73 | **0** | 10 | −17 |
| B · 48 ans confirmé · 7 h · 15 séries | 57 | 57 | **0** | 15 | −26 |
| C · 65 ans entraîné · 8 h · 8 séries | 68 | 68 | **0** | 8 | −14 |
| D · 30 ans F règles · 5 h q1 · 6 séries | 11 | 11 | **0** | 6 | −10 |
| **E · 45 min tapis modéré** | 75 | **71** | **−4** | 8,0 | −14 |
| **F · 20 min tapis modéré** | 75 | **75** | 0 | 3,6 | −6 |
| **G · 10 min léger + 15 séries** | 64 | **63** | −1 | 16,1 | −27 |
| **H · 45 min intense + 15 séries** | 64 | **57** | **−7** | 28,8 | −38 |
| I · confirmé · 24 séries jambes · 9 h q4 | 85 | 85 | **0** | 24 | −38 |
| J · 4 séries · 4 h q1 · énergie 😴 | 3 | 3 | **0** | 4 | −7 |
| K · aucune donnée sauf la séance | 58 | 58 | **0** | 12 | −20 |

**⭐ Sept profils sur onze ne bougent pas d'un point.** Les quatre qui bougent sont exactement
ceux qui contiennent du cardio — ce qui est la définition même d'un changement bien ciblé.

**Les deux tests explicites du brief passent** :
- **E doit être plus pénalisé que F** → **71 < 75** ✅ *(avant : 75 = 75)*
- **H doit montrer plus de charge que G** → **57 < 63** ✅ *(avant : 64 = 64)*

---

## 9. Ce que je recommande, et pourquoi

| choix | recommandation | raison |
|---|---|---|
| **ancrage cardio** | **6 séries** (−10 pour 45 min modéré) | c'est le seul des deux qui **laisse le plafond de 38 à la musculation** ; avec 8, un cardio seul de 90 min intense atteint le niveau « 24 séries de squat ». ⚠️ Et un ancrage trop bas se corrige plus facilement vers le haut qu'un barème qui a déjà réécrit l'historique vers le bas. |
| **plancher** | **P1 = 2** | effet identique à P0 (mesuré), mais garde la décision d'origine sous une forme nommée (**R30**) |
| **raccord 48 h** | **R1 (rampe de 12 h)** | corrige le défaut mesuré en ne touchant que 12 h de barème ; la marche de minuit (3 points) reste, et se traitera séparément si elle gêne |
| **`projectionRecup`** | corriger | invisible aujourd'hui, indispensable demain |

⛔ **Et ce que je ne recommande pas de mettre dans A**, conformément au §9 et au §12 : la
saturation à 0 et le cumul des séances. Ils sont réels, ils sont dans B, et les mélanger ferait
perdre la lisibilité de ce qui a amélioré quoi.

---

## 10. Ce qu'il reste à décider avant de coder

1. ⭐ **Ancrage : 6 ou 8 ?** (les deux tableaux sont ci-dessus, les deux sont dans ta fenêtre)
2. **Plancher : 2 ou 3 ?** (2 recommandé)
3. **Raccord : R1 ou R2 ?** (R1 recommandé)
4. Confirmer que **l'historique des jours de cardio va descendre** — jusqu'à **−4 points** pour
   45 min modéré, **−7** pour une séance mixte intense — et que c'est voulu.

---

## 11. Ce qui suivra (PHASE 3, avant livraison)

Rejouer **60 jours réels** avec les deux moteurs et produire le tableau demandé au §24
(`date · ancien · nouveau · Δ · cause`), en regardant en particulier les jours de cardio, les
jours voisins de 48 h, les petites séances et les journées sans séance.

⚠️ **Ce banc-là a besoin des vraies données de Michel** — le conteneur n'y a pas accès. Il se
lancera depuis son appareil, ou sur un export qu'il fournira.

---

*Banc d'essai : `scratchpad/phase1.js`, hors dépôt tant qu'aucune option n'est retenue (**R19**).
Aucun fichier applicatif n'a été modifié.*
