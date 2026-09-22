# ⚖️ DOSSIER DE DÉCISION — MOTEUR NUTRITIONNEL V2

> **22/09/2026, soir.** Répond aux **23 points** demandés.
> ⛔⛔ **AUCUNE modification des règles servies · AUCUNE publication · AUCUN bump de version.**
> `state.js`, `app.js`, `screens.js`, `coach.js`, `index.html`, `sw.js` : **0 ligne**.

---

## ⏱️ TEMPS — les deux estimations, séparées

| | |
|---|---|
| **TEMPS MACHINE / TRAVAIL** — réalisé aujourd'hui | **~2 h 30**. 921 984 profils en **67 s** · 414 720 évaluations de variantes en 3 min · 90 combinaisons discipline×niveau · 10 attaques adversariales · 14 mutations. **Total : ~1,6 million d'évaluations du moteur réel.** |
| **TEMPS CALENDAIRE INCOMPRESSIBLE** | **La Phase N seule** : 8 à 16 semaines de données réelles. **Rien d'autre.** |

---

## ⛔ AVERTISSEMENT : UNE PRÉMISSE DE TON BRIEF EST FAUSSE

Ton brief énonce *« la fermeture calorique du moteur est correcte »*. **Elle ne l'est pas.**
Il reprend mon **premier** audit ; le dossier du soir l'avait déjà réfuté. Mesuré : l'écart
atteint **+450 kcal** (contre-audit, attaque 8).

---

# ⭐⭐ LA CONCLUSION QUI VA CONTRE L'HYPOTHÈSE DE DÉPART

Tu demandes explicitement : *« si ton audit démontre que certaines valeurs qui nous semblaient
énormes sont justifiées, DIS-LE »*.

> ## Les 659 g de glucides ne sont PAS le problème.

**Mesuré sur un profil normal de musculation** (85 kg, niveau « Actif », 0 à 6 séances/semaine) :

| séances/sem | objectif force | objectif muscle |
|---|---|---|
| 0 | 5,64 g/kg ✅ | 6,08 g/kg ✅ |
| 2 | 6,24 g/kg ✅ | 6,64 g/kg ✅ |
| 4 | 5,99 g/kg ✅ | 6,41 g/kg ✅ |
| 6 | 5,75 g/kg ✅ | 6,20 g/kg ✅ |

**Toutes ces valeurs sont DANS la plage 4-7 g/kg** de Slater & Phillips 2011 (sports de force).
Ton cas personnel sort à **7,61 g/kg** — soit **9 % au-dessus** de la borne haute. C'est
**marginalement élevé, pas aberrant**, et cela s'explique par ton TDEE élevé (métier physique +
niveau « Actif »).

👉 ***Le moteur actuel produit des glucides défendables pour le cœur de sa population.*** Ce qui
ne va pas est **ailleurs**, et touche des profils auxquels tu ne pensais pas.

---

## 1. 🗺️ CARTOGRAPHIE DU MOTEUR ACTUEL

```
profil (sexe, âge, taille, poids, fumeur)
  └→ composition corporelle : leanMassRecente()  ── bilan < 90 j ET écart de poids ≤ 5 %
        └→ BMR : Katch-McArdle (370 + 21,6 × masse maigre)  sinon  Mifflin-St Jeor
              └→ ×1,07 si fumeur
  └→ activité : S.activityLevel (1,375 / 1,55 / 1,725 / 1,9)  ⚠️ DÉCLARATIF
  └→ TDEE = BMR × activityLevel + métier(0/200/325/450) + autre sport(+150) + pas
        └→ ⛔ discipline : JAMAIS lue    ⛔ niveau : JAMAIS lu    ⛔ séances réelles : JAMAIS lues
  └→ objectif : _GOAL_DELTA_KCAL (muscle +350 · perte −450 · recomp −250 · force +200 · équilibre 0 · endurance +100)
  └→ charge/décharge : ±100 kcal        └→ lutéale : +150 kcal
  └→ plancher : max(cible, 1500 H / 1200 F)   ⛔ sauf cible MANUELLE (décision actée)
  └→ protéines = POIDS TOTAL × ratio     ⛔ la masse maigre n'arrive PAS ici
  └→ lipides   = POIDS TOTAL × ratio     ⛔ idem
  └→ glucides  = max(0, (cible − P×4 − L×9) / 4)   ⛔ le RÉSIDU, sans borne
  └→ cycle jour de séance : lipides ↓ / glucides ↑ (plancher 0,6 g/kg)
  └→ affichage
```

### Classement de CHAQUE coefficient

| coefficient | valeur | emplacement | unité | classe | conséquence |
|---|---|---|---|---|---|
| Mifflin-St Jeor | `10bw + 6,25h − 5a ± (5/−161)` | `bmrDetail` | kcal | **ÉTABLI** | base du TDEE |
| Katch-McArdle | `370 + 21,6 × LBM` | `bmrDetail` | kcal | **ÉTABLI** | employé si bilan frais |
| fraîcheur bilan | **90 j** | `BMR_LM_JOURS` | jours | **CHOIX PRODUIT** | ⛔ **discontinuité de +77 kcal au seuil** |
| écart de poids toléré | **5 %** | `BMR_LM_ECART` | % | **CHOIX PRODUIT** | ⛔ **discontinuité de −110 kcal au seuil** |
| fumeur | **+7 %** | `bmrDetail` | % du BMR | **PROBABLE** | ⛔ **−192 kcal le jour où l'on arrête** |
| niveaux d'activité | 1,375 / 1,55 / 1,725 / 1,9 | `S.activityLevel` | multiplicateur | **ÉTABLI** (Harris-Benedict) | ⚠️ **déclaratif, jamais mis à jour** |
| métier | 0 / 200 / 325 / 450 | `calcWorkExtra` | kcal | **HISTORIQUE** | non sourcé |
| autre sport | **+150** | `calcSportExtra` | kcal | **CHOIX PRODUIT** documenté | ✅ pas de double comptage vérifié |
| objectif muscle | **+350** | `_GOAL_DELTA_KCAL` | kcal **fixe** | **CHOIX PRODUIT** | ⛔ **+22,2 % du TDEE chez un profil léger** |
| objectif perte | **−450** | idem | kcal **fixe** | **CHOIX PRODUIT** | ⛔ **vitesse relative divisée par 2 entre 60 et 130 kg** |
| objectif recomp | **−250** | idem | kcal fixe | **CHOIX PRODUIT** | — |
| objectif force | **+200** | idem | kcal fixe | **ARBITRAIRE** | aucune source trouvée |
| objectif équilibre | **0** | idem | kcal | **ÉTABLI** par définition | — |
| objectif endurance | **+100** | idem | kcal | **ARBITRAIRE** | — |
| phase charge/décharge | **±100** | `_autoKcalBrut` | kcal **fixe** | **ARBITRAIRE** | aucune source |
| lutéale | **+150** kcal, **+0,2** g/kg prot. | `_autoKcalBrut`, `macrosForKcal` | kcal, g/kg | **PROBABLE** | effet thermique documenté |
| plancher calorique | **1500 H / 1200 F** | `PLANCHER_KCAL` | kcal | **CHOIX PRODUIT justifié** | ✅ aligné sur le Gardien |
| ratios protéines | 1,7 → 2,6 | `macrosForKcal` | g/kg **poids total** | **PROBABLE** (ISSN) | ⛔ **mauvais dénominateur** |
| ratios lipides | 0,75 → 1,0 | idem | g/kg **poids total** | **PROBABLE** | ✅ dans 0,5-1,5 |
| glucides | **résidu** | idem | g | **PROBABLE** (Helms, ANSES) | ⛔ **aucune borne** |
| cycle amplitude | **0,30** | `_CYCLE_AMPLI` | part des lipides | **ARBITRAIRE** | — |
| cycle plancher lipides | **0,6** | `_CYCLE_FAT_MIN` | g/kg | **CHOIX PRODUIT** | ✅ > 0,5 donc sûr |
| **discipline** | 5 valeurs | `S.discipline` | — | ⛔ **INCONNU du moteur** | **0 effet mesuré** |
| **niveau** | 3 valeurs | `S.level` | — | ⛔ **INCONNU du moteur** | **0 effet mesuré** |
| **séances réelles** | 0-6/sem | `S.sessions` | — | ⛔ **INCONNU du TDEE** | **0 effet mesuré** |

---

## 2. 📖 SOURCES RÉELLEMENT LUES

> ### ⛔ AUCUNE. Zéro source primaire lue.

C'est la réponse honnête, et elle conditionne tout le reste de ce dossier.

## 3. 🚫 SOURCES NON ACCESSIBLES

Mesuré, pas supposé — refus au CONNECT (**HTTP 403**, politique d'organisation) :

```
doi.org · pubmed.ncbi.nlm.nih.gov · pmc.ncbi.nlm.nih.gov · europepmc.org
api.crossref.org · api.openalex.org · api.semanticscholar.org · core.ac.uk
link.springer.com · tandfonline.com · frontiersin.org · mdpi.com · nature.com
cambridge.org · journals.physiology.org · arxiv.org · biorxiv.org
anses.fr · efsa.europa.eu · who.int · dietitians.ca · scholar.google.com
─────────────────────────────────────────────────────────────────────────
seul  api.github.com  répond (200)
```

**La recherche fonctionne, la lecture non.** ⛔ Et le piège que tu redoutais s'est présenté
**dès la première requête** : interrogé sur les glucides en musculation, le moteur de recherche
a répondu **« 8-12 g/kg/j »** — la plage des **cyclistes d'endurance à très haut volume**. La
valeur correcte pour les sports de force est **4-7 g/kg**.

## 4. ✅ RÈGLES SCIENTIFIQUEMENT ÉTABLIES

**Aucune règle nutritionnelle** ne peut être classée « établie » sans lecture primaire.
Sont établis **par la mesure du code**, pas par la littérature :

- la formule du résidu, son absence de borne, et les trois dénominateurs manquants ;
- les 4 cas de ton cahier, reproduits à la calorie près ;
- l'absence totale d'effet de la discipline, du niveau et des séances réelles.

## 5. 🟡 RÈGLES PROBABLES (convergence de plusieurs recherches, non lues à la source)

| règle | source | population | unité | plage | limites | applicabilité |
|---|---|---|---|---|---|---|
| glucides sports de force | Slater & Phillips 2011 | sprint, haltéro, lancers, **bodybuilding** | g/kg poids | **4-7** | *« selon la phase »* — vague | ⭐ **directe : les 5 disciplines de l'app sont des sports de force** |
| protéines entraînés | ISSN 2017 | sujets exerçants | g/kg **poids** | **1,4-2,0** | hors déficit | directe |
| protéines en déficit | ISSN 2017 | entraînés, hypocalorique | g/kg **poids** | **2,3-3,1** | sujets **entraînés**, pas obèses | ⚠️ **ne couvre pas les forts %MG** |
| protéines bodybuilding | Helms 2014 | bodybuilders en prépa | g/kg **masse maigre** | **2,3-3,1** | population très sèche | ⚠️ unité ≠ ISSN |
| lipides | Helms 2014 · litt. physique | athlètes physique | % cal / g/kg | **15-30 %** · **0,5-1,5 g/kg** ; **< 0,5 = risque hormonal** | — | directe |
| surplus | Iraki 2019 | naturels hors saison | % maintenance | **+10-20 %** (novice/interm.) · **+5-10 %** (avancé) | dépend du **niveau** | ⚠️ le niveau n'est pas lu |
| vitesse de prise | Iraki 2019 | idem | % poids/sem | **0,25-0,5** | — | directe |
| vitesse de perte | Helms 2014 · Nutrients 2021 | entraînés | % poids/sem | **0,5-1,0** | — | directe |
| déficit modulé par le %MG | GSSI · litt. obésité | athlètes vs obèses | — | *plus on est sec, plus le déficit doit être conservateur* | qualitatif | ⭐ **directe, et le moteur fait l'inverse** |
| protéines en obésité | Weijs 2025 · Clin Nutr ESPEN 2022 | **surpoids / obésité** | poids **corrigé** ou **1,5 g/kg LBM** | poids de réf. **plafonné à IMC 30** | littérature **clinique**, pas sportive | ⚠️ extrapolation à marquer |
| disponibilité énergétique | CIO / RED-S | athlètes | kcal/kg LBM | **< 30 = LEA** | — | directe |
| protéines pop. générale | ANSES | adulte FR | g/kg | **RNP 0,83** | sédentaires | contexte |
| ⭐ **pas d'intervalle pour les glucides** | **ANSES** | adulte FR | — | *« découlent des références des deux autres macronutriments, pas de justification propre »* | — | ⭐⭐ **décide de la méthode** |

## 6. ❌ RÈGLES NON DÉMONTRÉES

- *« 7,61 g/kg est nutritionnellement indéfendable »* → **NON DÉMONTRÉ**. C'est 9 % au-dessus d'une borne elle-même non vérifiée.
- *« le TDEE de départ est surestimé »* → **NON DÉMONTRÉ** ; exige un TDEE observé.
- *« 57-64 % des calories en glucides est excessif »* → **NON DÉMONTRÉ** ; l'ANSES refuse justement de fixer cet intervalle.
- **Le diviseur 0,85** (masse maigre → poids de référence) est **mon choix**, sans source.

---

## 7. 🧪 CORPUS EXACT UTILISÉ

| corpus | dimensions | profils | temps |
|---|---|---|---|
| Principal | 2 sexes × 7 âges × 6 tailles × 9 poids × 4 activités × 4 métiers × 4 volumes × 6 objectifs × 2 phases × séance/repos ; **IMC borné 13-55** | **921 984** | 67 s |
| Masse grasse | 5 poids × 8 %MG × 4 objectifs × avec/sans bilan | 320 | 8 s |
| Variantes | 6 variantes × 11 520 | **414 720** | 3 min |
| Fermeture | recherche des vrais maximums | 131 712 | 45 s |
| **Disciplines / niveaux** | 5 disciplines × 3 niveaux × 6 objectifs | **90** | 5 s |
| Objectifs (E/F/G/H) | perte 16 · muscle 48 · recomp 5 · force 36 | 105 | 10 s |
| Contre-audit | 10 attaques ciblées | ~300 | 15 s |

**~1,6 million d'évaluations du moteur réel · 0 erreur de page.**

## 8. 📊 DISTRIBUTION DES RÉSULTATS (corpus principal, 921 984 profils)

| objectif | glucides g/kg (min → max, moy) | protéines g/kg | lipides g/kg | % cal lipides |
|---|---|---|---|---|
| muscle | 0,84 → **16,82** (6,01) | 2,20 | 0,75 → 0,91 | 8,2 → 40,0 |
| perte | **0,00** → 12,29 (3,40) | 2,50 | 0,65 → 0,80 | 9,2 → 52,3 |
| recomp | **0,00** → 13,22 (3,82) | 2,60 | 0,69 → 0,85 | 8,9 → 49,3 |
| force | 0,56 → 16,02 (5,54) | 2,00 | 0,82 → 1,00 | 9,3 → 46,8 |
| équilibre | 0,55 → 15,20 (5,21) | 2,00 | 0,69 → 0,85 | 8,2 → 43,0 |
| endurance | 1,25 → 16,22 (6,03) | 1,70 | 0,61 → 0,76 | 7,2 → 36,5 |

| propriété violée | occurrences | % |
|---|---|---|
| lipides < 15 % des calories | 126 779 | 13,75 % |
| glucides > 8 g/kg | 109 922 | 11,92 % |
| glucides < 1 g/kg | 16 154 | 1,75 % |
| fermeture > 5 kcal | 13 510 | 1,47 % |
| glucides > 12 g/kg | 7 566 | 0,82 % |
| lipides > 40 % des calories | 1 531 | 0,17 % |
| **glucides = 0 g** | **885** | 0,10 % |
| macro négative · NaN · sous plancher · protéines < 0,8 g/kg · lipides < 0,5 g/kg | **0** | **0 %** ✅ |

⚠️ **Le corpus est une grille combinatoire, pas une population.** Ces pourcentages disent où le
moteur casse, **pas** combien d'utilisateurs sont touchés.

## 9. 📉 VALEURS EXTRÊMES

| grandeur | extrême | profil |
|---|---|---|
| glucides | **16,82 g/kg** | H 18 ans, 180 cm, **45 kg** (IMC 13,9), très actif, métier physique, muscle |
| protéines / masse maigre | **4,73 g/kg** | H 110 kg à 45 % MG, recomp |
| % calories en protéines | **49,7 %** | H 130 kg à 45 % MG, perte |
| % calories en lipides | **7,2 %** (min) | H 45 kg, endurance |
| kcal/kg | **82,9** | H 18 ans, 45 kg, très actif |
| écart somme macros / cible | **+450 kcal** | **F 78 ans, 148 cm, 120 kg, sédentaire, perte, décharge** |
| glucides | **0 g** | H 110 kg / 150 cm, perte, décharge |

---

## 10. 🔻 ANALYSE — PERTE DE POIDS

Homme 175 cm, 35 ans, modéré, **avec bilan corporel frais** :

| poids | %MG | TDEE | cible | déficit | déficit % | **%/sem** | g/kg P poids | **g/kg P maigre** |
|---|---|---|---|---|---|---|---|---|
| 60 | 10 | 2 381 | 2 031 | −350 | −14,7 % | **−0,53 %** ✅ | 2,50 | 2,78 ✅ |
| 80 | 20 | 2 716 | 2 366 | −350 | −12,9 % | −0,40 % ⚠️ | 2,50 | 3,13 |
| 100 | 30 | 2 917 | 2 567 | −350 | −12,0 % | −0,32 % ⛔ | 2,50 | 3,57 ⛔ |
| 130 | 45 | 2 967 | 2 617 | −350 | −11,8 % | **−0,24 %** ⛔ | 2,50 | **4,55** ⛔ |

**⛔⛔ TROIS DÉFAUTS :**

1. **Le déficit est un nombre FIXE**, donc la vitesse relative de perte **s'effondre quand le poids monte** : **−0,53 %/sem à 60 kg** contre **−0,24 %/sem à 130 kg**. La plage de référence est **0,5-1,0 %/sem** : seul le sujet le plus léger y est.
2. ⛔⛔ **C'EST L'INVERSE DE LA LITTÉRATURE.** Elle recommande d'être **conservateur chez le sujet sec** et permet un déficit **plus agressif chez le sujet à forte masse grasse**. Le moteur fait exactement le contraire, **parce que le déficit est fixe**.
3. **Protéines jusqu'à 4,55 g/kg de masse maigre** — hors de toute plage publiée.

⚠️ **Un quatrième signal, que je donne avec sa limite** : la **disponibilité énergétique** estimée tombe à **27,2-27,7 kcal/kg de masse maigre** dans les 8 cas, sous le seuil RED-S de 30. ⛔ **Mon estimation de la dépense d'exercice (`TDEE − BMR×1,2`) est grossière et surestime probablement cette dépense** chez quelqu'un dont l'activité vient du métier. *Je signale le signal, je ne conclus pas.*

## 11. 📈 ANALYSE — PRISE DE MUSCLE

| poids | activité | phase | TDEE | surplus | **surplus %** | **%/sem** | g/kg G |
|---|---|---|---|---|---|---|---|
| 55 | 1,375 | charge | 2 027 | +450 | **+22,2 %** ⛔ | **+0,74 %** ⚠️ | 7,02 |
| 55 | 1,900 | charge | 2 801 | +450 | +16,1 % ✅ | +0,74 % ⚠️ | **10,53** ⛔ |
| 65 | 1,375 | charge | 2 164 | +450 | **+20,8 %** ⛔ | +0,63 % ⚠️ | 5,82 |
| 85 | 1,900 | charge | 3 371 | +450 | +13,3 % ✅ | +0,48 % ✅ | 7,00 |
| 110 | 1,900 | charge | 3 846 | +450 | +11,7 % ✅ | +0,37 % ✅ | 5,54 |

**⛔ DEUX DÉFAUTS, un seul cause :** le surplus est **fixe**.

1. Il dépasse **+20 %** (borne haute d'Iraki) chez les profils **légers et peu actifs**.
2. La **vitesse de prise atteint +0,74 %/sem** à 55 kg — **48 % au-dessus** de la borne haute (0,5 %).
3. Et **c'est là que les glucides explosent vraiment** : **10,53 g/kg** chez une personne de 55 kg très active. ⭐ *Bien pire que tes 659 g, et sur un profil parfaitement réaliste.*

✅ **En revanche, à partir de 75-85 kg, le surplus est dans la plage et conservateur.**

## 12. 🔄 ANALYSE — RECOMPOSITION (l'unité des protéines)

| poids | %MG | maigre | P g | g/kg **poids** | g/kg **maigre** | % cal | ISSN (poids) | Helms (LBM) |
|---|---|---|---|---|---|---|---|---|
| 70 | 10 | 63,0 | 182 | 2,60 | 2,89 | 28,7 % | ✅ dedans | ✅ dedans |
| 80 | 15 | 68,0 | 208 | 2,60 | 3,06 | 30,8 % | ✅ dedans | ✅ dedans |
| 85 | **20** | 68,0 | 221 | 2,60 | **3,25** | 32,7 % | ✅ dedans | ⛔ **dehors** |
| 105 | 30 | 73,5 | 273 | 2,60 | **3,71** | 37,9 % | ✅ dedans | ⛔ **dehors** |

**⭐⭐ LA RÉPONSE EST NUANCÉE, ET ELLE EST PLUTÔT FAVORABLE AU MOTEUR.**

`2,60 g/kg de poids de corps` est **TOUJOURS dans la plage ISSN 2017** (2,3-3,1 g/kg de **poids**,
en hypocalorique). Ce n'est donc **pas** un mélange d'unités : **l'ISSN emploie bien le poids de
corps**.

👉 ***La règle casse seulement au-delà de ~20 % de masse grasse***, là où les deux littératures
divergent. ⛔ **Jusqu'à 15 % de MG, la règle actuelle est défendable dans les DEUX unités.**

**⚠️ Correction de mon audit de ce matin** : j'avais écrit « unité différente » en me fondant sur
Helms seul. C'était **incomplet** — l'ISSN utilise le poids de corps.

## 13. 🏋️ ANALYSE — FORCE / POWERLIFTING / POWERBUILDING

**⭐⭐ DEUX FAITS QUI SIMPLIFIENT ÉNORMÉMENT CETTE PHASE.**

1. **Les 5 disciplines de Force Tracker sont TOUTES des sports de force** — `muscu`,
   `bodybuilding`, `powerbuilding`, `powerlifting`, `haltero`. **Il n'existe aucune discipline
   d'endurance.** 👉 ***Ta crainte « powerlifter traité comme un cycliste » ne peut pas se
   produire par la discipline*** : il n'y a pas de cycliste dans l'app. Et **Slater & Phillips
   (4-7 g/kg, sports de force) couvre donc TOUTE la population, sans aucune extrapolation.**
2. ⛔ **Mais la discipline n'atteint pas le moteur** : **90 combinaisons** (5 disciplines × 3
   niveaux × 6 objectifs) → **0 écart**. Un powerlifter et un bodybuilder reçoivent **exactement
   la même prescription**.

**Le +200 kcal de l'objectif « force » : ARBITRAIRE.** Aucune source trouvée. Il n'est pas
dangereux (il produit 5,64-6,24 g/kg, dans la plage) — mais il n'a **aucune justification**.

⛔ **Et le vrai défaut de cette phase est ailleurs** : **le volume d'entraînement n'atteint pas le
TDEE**. Mesuré : **0 séance/semaine et 6 séances/semaine donnent la même cible de 3 200 kcal.**
👉 *Un powerlifter qui passe de 3 à 6 séances ne voit sa nutrition changer en rien.*

---

## 14. 🛠️ PROPOSITION DE MOTEUR CIBLE

⭐ **Principe directeur, et il répond à ton « pas de sur-ingénierie »** : **aucune couche nouvelle,
aucun moteur parallèle, aucun paramètre neuf.** Quatre corrections **ciblées**, chacune sur une
ligne existante.

### C1 — Le dénominateur des protéines

| | |
|---|---|
| **RÈGLE ACTUELLE** | `prot_g = poids_total × ratio` |
| **PROBLÈME MESURÉ** | 27 648 profils > 3,1 g/kg maigre ; jusqu'à **49,7 % des calories** ; **Δ = 0 g** quand un bilan frais existe |
| **SOURCE** | Weijs 2025 · Clin Nutr ESPEN 2022 (poids de réf. plafonné à **IMC 30**) · Helms 2014 (LBM) — ⚠️ non vérifiées |
| **RÈGLE PROPOSÉE** | poids de référence = `masse_maigre / 0,85` si bilan frais, sinon `min(poids, poids à IMC 30)` |
| **CONSÉQUENCE** | 27 648 → **2 496** (−91 %) · > 40 % des cal : 2 542 → **219** (−91 %) |
| **CAS LIMITES** | sujet très sec (LBM/0,85 > poids) → prendre le **min** avec le poids réel |
| **TEST** | `B-CCCLII ⑦` — et **M05 le fait rougir** |

### C2 — Le double plancher lipidique (⛔ et le dénominateur des lipides ne change PAS)

| | |
|---|---|
| **RÈGLE ACTUELLE** | `fat_g = poids_total × ratio`, sans plancher en % |
| **PROBLÈME MESURÉ** | 126 779 profils sous 15 % des calories, jusqu'à **7,2 %** |
| **⛔ CE QUE LE CONTRE-AUDIT A TUÉ** | appliquer le poids réduit aux lipides **casse** un invariant que V0 tenait : lipides < 0,5 g/kg passe de **0 → 1 920** |
| **RÈGLE PROPOSÉE** | lipides sur le **poids réel**, avec `max(ratio × poids, 0,5 g/kg, 15 % des calories)` |
| **CONSÉQUENCE** | lipides < 0,5 g/kg : **0** ✅ · < 15 % : 5 892 → **3 221** (−45 %) |
| **TEST** | propriété de plancher, à ajouter |

### C3 — La borne de plausibilité des glucides, et **où vont les calories**

| | |
|---|---|
| **RÈGLE ACTUELLE** | `max(0, reste/4)` — l'écrêtage **masque** le dépassement |
| **PROBLÈME MESURÉ** | glucides à **0 g** (885) · somme des macros **+450 kcal au-dessus de la cible** |
| **SOURCE** | Slater & Phillips 2011 : **4-7 g/kg**, sports de force ⇒ **toute la population de l'app** |
| **RÈGLE PROPOSÉE** | au-delà de 7 g/kg → verser aux lipides **jusqu'à 35 % des calories** ; si insuffisant → **SIGNALER l'incohérence**, ne jamais fabriquer un nombre |
| **CONSÉQUENCE** | > 7 g/kg : 12 025 → **5 348** (−56 %) · > 8 g/kg : −64 % · glucides à 0 : **0** · lipides > 40 % : **34** (identique à V0) |
| **CAS LIMITES** | objectif `endurance` **exempté** (choix à valider) ; cible manuelle basse → signal |

### C4 — Ce qui n'atteint pas le moteur (R4, trois fois)

| | |
|---|---|
| **PROBLÈME MESURÉ** | **discipline** (0 effet sur 90 combinaisons) · **niveau** (0 effet) · **séances réelles** (0 vs 6 → même cible) |
| **SOURCE** | Iraki 2019 : le surplus dépend du **niveau** (+10-20 % vs +5-10 %) |
| **⛔ CE QUE JE NE PROPOSE PAS** | **rien d'automatique**. `S.activityLevel` est déclaratif **par décision** (`ecartNiveauActivite` **propose déjà** la bascule et laisse la personne trancher — R29) |
| **RÈGLE PROPOSÉE** | **le niveau module le surplus** (`+10-20 %` débutant/intermédiaire, `+5-10 %` confirmé) — **une seule ligne**, une source, aucun automatisme |
| **⚠️ DÉCISION QUI TE REVIENT** | faut-il que la **discipline** change quoi que ce soit ? **Aucune source trouvée** ne différencie powerlifting et bodybuilding sur les macros. *Sans source, je ne propose rien.* |

---

## 15. 📊 COMPARAISON AVANT / APRÈS SUR LE CORPUS (69 120 profils par variante)

Témoin de validité du banc : **V0 = production, 0 écart sur 69 120** ✅

| propriété violée | V0 actuel | V1 IMC30 | V2 maigre | V3 borne | **V4** | **V5** |
|---|---|---|---|---|---|---|
| protéines > 3,1 g/kg maigre | 27 648 | 17 568 | 2 496 | 2 496 | **2 496** | **2 496** |
| protéines > 40 % des cal | 2 542 | 803 | 219 | 219 | **219** | **219** |
| glucides = 0 g | 9 | 0 | 0 | 0 | **0** | **0** |
| fermeture > 12 kcal | 9 | 0 | 0 | 0 | **0** | **0** |
| lipides < 0,5 g/kg | **0** | ⛔ 1 920 | ⛔ 384 | ⛔ 384 | **0** ✅ | **0** ✅ |
| lipides < 15 % des cal | 5 892 | ⛔ 13 569 | ⛔ 12 601 | 6 525 | **3 221** | **1 482** |
| lipides > 40 % des cal | 34 | 0 | 0 | ⛔ 1 016 | **34** | **34** |
| glucides > 7 g/kg (force) | 12 025 | 14 480 | 13 864 | 0 | 12 927 | **5 348** |
| glucides > 8 g/kg | 9 478 | 11 043 | 11 123 | 3 109 | 10 124 | **3 418** |
| signaux émis | 0 | 0 | 0 | 13 864 | 0 | 12 927 |

⚠️ **V5 émet un signal sur 18,7 % du corpus.** Sur une population réelle ce serait bien moins,
mais **le chiffre n'est pas connu** et devra être mesuré.

## 16. ✅ RÉSULTATS DES TESTS

**Bloc `B-CCCLII` — 21 témoins, 21 verts** (`tests/parcours/nutri_proprietes.js`) :

- **4 photographies T01** (les 4 cas de ton cahier, figés à la valeur près)
- **2 tables figées** (écarts par objectif, plancher)
- **9 défauts figés** : ⑦ masse maigre ignorée · ⑨ glucides à 0 · ⑬ somme > cible · ⑮ discipline et niveau sans effet · ⑯ 0 vs 6 séances · ⑰ déficit fixe · ⑱ surplus > 20 % · ⑲ cible manuelle · ⑳ discontinuité à 90 jours
- **6 invariants** : aucune macro négative · aucun NaN · aucune cible sous plancher · fermeture dans l'arrondi hors écrêtage · aucune erreur de page

⛔ **Non branché dans la passe complète** — il fige un état qui attend ton GO.

## 17. 🔬 RÉSULTATS DU CONTRÔLE NÉGATIF

**14 mutations, 14 conformes, 0 ancre morte.** Chacune fait rougir **le bon témoin** :

| mutation | témoin qui rougit |
|---|---|
| écart objectif `muscle` 350→400 · phase ±100→±150 · ratios prot./lip. force | ①②③ T01 + ⑤ table |
| plancher 1500→1400 · plancher désarmé | ⑥ · ⑫ |
| **`Math.max(0, …)` retiré** → glucides négatifs | ⑨ + ⑩ + ⑬ |
| ⭐ **correction simulée : les macros lisent la masse maigre** | **⑦** |
| ⭐ **correction simulée : la discipline atteint la nutrition** | **⑮** |
| ⭐ **correction simulée : le déficit devient proportionnel au poids** | **⑰** |
| seuil de fraîcheur 90→120 j | ⑳ |
| plancher posé sur la cible manuelle | ⑲ |
| *commentaire citant tous les mots cherchés* | **aucun (vert)** ✅ |

⭐⭐ **Les trois corrections simulées font rougir exactement leur témoin.** *Un témoin de défaut
qui ne verrait pas arriver sa correction ne serait pas une garantie.*

## 18. 🥊 RÉSULTATS DU CONTRE-AUDIT (10 attaques, **6 cassent**)

| # | attaque | résultat |
|---|---|---|
| 1 | +1 kg de poids | ✅ **tient** — saut max 16 kcal |
| 2 | bilan corporel 89 j → 91 j | ⛔ **CASSE** — Katch 2 400 → Mifflin 2 477 kcal (**+77 en une nuit**) |
| 3 | écart de poids 4 % → 6 % | ⛔ **CASSE** — 3 635 → 3 525 (**−110 kcal**) |
| 4 | ordre perte < équilibre < muscle | ✅ **tient** — 0 incohérence sur 20 |
| 5 | charge toujours > décharge | ✅ **tient** — 0 inversion sur 18 |
| 6 | 0 séance/sem vs 6 séances/sem | ⛔ **CASSE** — **cible identique : 3 200 kcal** |
| 7 | arrêter de fumer | ⛔ **CASSE** — **−192 kcal du jour au lendemain** (le code en annonçait ~100) |
| 8 | **F 78 ans, 148 cm, 120 kg, sédentaire, perte, décharge** | ⛔⛔ **CASSE** — cible **1 614 kcal**, macros **2 064 kcal**, glucides **0 g** |
| 9 | **cible manuelle 600 kcal** | ⛔⛔ **CASSE** — acceptée ; P 138 g, G 0, L 44 → macros **948 kcal pour une cible de 600** |
| 10 | autre sport à « très actif » | ✅ **tient** — **+0 kcal**, le garde-fou anti-double-comptage fonctionne |

⚠️ **L'attaque 9 mérite une nuance** : que la cible manuelle échappe au plancher est une
**décision actée** (on n'interdit pas — R29). ⛔ Mais que **les macros totalisent 948 kcal pour
une cible de 600** n'est décidé nulle part.

---

## 19. 🗄️ ARCHITECTURE POUR L'HISTORIQUE (Phase M — conçue, non implémentée)

```
S.profilLog = [ {
   ts, date,
   champ,                    // 'bw' | 'goal' | 'activityLevel' | 'discipline' | 'level' | 'bodyFat'
   avant, apres,
   provenance,               // 'saisie' | 'bilan' | 'import' | 'proposition acceptée'
   snapshot: { bw, bodyFat, bfSrc, lm, activityLevel, goal, discipline, level,
               bmr, tdee, kcal, P, G, L, phase },
   regles: 'ft-vNNNN'        // ⛔ la VERSION qui a produit la prescription
} ]
```

- ⭐ **On étend deux mécanismes éprouvés, on n'en invente pas** (**R13**) : `weightLog[].bfSrc`
  (ft-v1231) porte déjà une provenance ; `coachMemoryMeta` (ft-v1227) porte déjà le patron
  « la valeur d'un côté, sa nature de l'autre ».
- ⛔ **Une version N+1 ne recalcule JAMAIS une prescription de version N** — c'est la seule règle
  non négociable, et elle impose de **stocker** la prescription au lieu de la recalculer.
- ⛔ **Aucune IA** : comparer deux périodes est du tri et de la soustraction.
- ⚠️ **Le coût réel est le volume** : un événement par changement **significatif**, jamais par
  frappe clavier. `localStorage` est déjà sous tension.
- ⚖️ **Chantier indépendant** : aucun lien technique avec les macros, décidable séparément.

## 20. 📅 PROTOCOLE LONGITUDINAL (Phase N — spécifié, non implémenté)

| fenêtre | ce qu'on en tire | ce qu'on n'en tire PAS |
|---|---|---|
| **7 j** | adhérence (jours notés / 7), calories réellement consommées | ⛔ **aucune adaptation** |
| **14 j** | moyenne glissante du poids, première tendance | ⛔ aucune adaptation |
| **28 j** | tendance fiable, tour de taille, **TDEE observé** (première estimation) | ⚠️ adaptation **bornée** possible |
| **8 sem** | validation de la vitesse réelle vs prescrite | recalibrage des deltas |
| **12-16 sem** | validation de la composition corporelle | recalibrage des ratios |

**Règles d'adaptation, décidables aujourd'hui :**
- ⛔ **jamais sur une seule mesure** — minimum 14 jours de données ;
- ⛔ **bornée** : au plus ±10 % de la cible par fenêtre ;
- ⛔ **espacée** : au plus une adaptation par 14 jours ;
- ⛔ **explicable** : la personne voit pourquoi ;
- ⭐ **testable dès maintenant sur séries synthétiques** : perte régulière, plateau, rétention
  d'eau, week-end haut, données manquantes, recomposition à poids stable, performance en chute.

## 21. ⚠️ RISQUES RESTANT OUVERTS

1. ⛔⛔ **Aucune source primaire lue.** Tout le §5 reste « probable ».
2. **2 496 profils restent hors plage même en V4/V5** — non expliqué.
3. **Le diviseur 0,85** est mon choix, sans source.
4. **±100 kcal de phase, +200 force, +100 endurance, métier 0/200/325/450** : arbitraires ou hérités.
5. **18,7 % de signaux en V5** sur le corpus — fréquence réelle inconnue.
6. **Les discontinuités aux seuils** (90 j, 5 %, fumeur) ne sont pas traitées par les corrections proposées.
7. **Les profils à IMC < 16** produisent 16,8 g/kg — décision produit, pas technique.
8. **Mon estimation de la disponibilité énergétique est grossière** et ne doit pas servir de preuve.

## 22. ⏱️ TEMPS DE TRAVAIL RESTANT

| phase | état | restant |
|---|---|---|
| A — sources | ⚠️ **bloquée** | **2-3 h** avec les PDF · **impossible** sinon |
| B — cartographie | ✅ **FAITE** | 0 |
| C — corpus | ✅ **FAITE** (1,6 M) | 0 |
| D — plausibilité | ✅ **FAITE** | 0 |
| E/F/G/H — par objectif | ✅ **FAITES** | 0 |
| I — moteur cible | ✅ **FAITE** (6 variantes) | **1-2 h** pour trancher le §21 |
| J — tests | ✅ 21 témoins | **2-3 h** pour les 38 tests complets |
| K — contrôle négatif | ✅ 14 mutations conformes | **1 h** d'extension |
| L — contre-audit | ✅ 10 attaques, 6 cassent | **1 h** supplémentaire |
| M — historique | 📄 **conçue** | **4-6 h** d'implémentation |
| N — longitudinal | 📄 **spécifiable** | **2-3 h** + séries synthétiques |
| **Implémentation C1→C4** | ⏸️ **attend ton GO** | **4-6 h** (code + témoins retournés + contrôle négatif + passe complète) |

## 23. 📆 TEMPS CALENDAIRE RÉELLEMENT INCOMPRESSIBLE

> **8 à 16 semaines, pour la Phase N uniquement, et uniquement sa partie observation.**

**Rien d'autre dans ce chantier n'exige d'attendre.**

---

## ⛔ ÉTAT DE LIVRAISON

**Aucune modification des règles servies · aucune publication · aucun bump de version.**

`state.js` · `app.js` · `screens.js` · `coach.js` · `index.html` · `sw.js` → **0 ligne**.

Instruments ajoutés (lecture seule) : `tools/corpus_nutri.js` · `corpus_nutri_mg.js` ·
`simul_nutri_v2.js` · `banc_nutri_objectifs.js` · `contre_audit_nutri.js` ·
`banc_nutri_proprietes.js` · `mut_nutri_proprietes.py` · `tests/parcours/nutri_proprietes.js`
(⛔ non branché).

---

*J'attends ton GO.*
