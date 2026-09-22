# ⚖️ DOSSIER DE DÉCISION — MOTEUR NUTRITIONNEL

> **22/09/2026.** Répond point par point aux 14 sections demandées par Michel.
> ⛔⛔ **AUCUN CHANGEMENT MÉTIER SERVI · AUCUNE PUBLICATION · AUCUN NUMÉRO DE VERSION.**
> Les fichiers ajoutés sont des **instruments** (`tools/`) et des **témoins non branchés**
> (`tests/parcours/nutri_proprietes.js`). `state.js`, `app.js`, `screens.js` : **0 ligne**.

---

## ⏱️ AVANT TOUT : A / B, comme demandé

| | |
|---|---|
| **A — ce qui exige vraiment du temps CALENDAIRE** | Uniquement la **Phase 9** : une validation longitudinale sur 8-16 semaines exige 8-16 semaines de données réelles. **Rien d'autre.** |
| **B — ce qui n'exigeait que du temps machine** | **Tout le reste, et c'était rapide.** 921 984 profils simulés en **67 secondes**. 6 variantes de conception comparées sur 69 120 profils en **~3 minutes**. 9 mutations de contrôle négatif en **~4 minutes**. |

⭐ **Tu avais raison et mon estimation d'hier était paresseuse** : j'avais mis « plusieurs
semaines » sur du travail qui a pris **une heure et demie de machine**.

---

## 1. 🔍 DIAGNOSTIC FINAL

**⛔⛔ LE PROBLÈME N'EST PAS LES 659 g DE GLUCIDES. C'est un symptôme, et pas le pire.**

Les trois anomalies mesurées ont **une seule cause racine** :

> ### Les protéines et les lipides sont calculés sur le **POIDS DE CORPS TOTAL**, et la masse maigre — pourtant connue, fraîche et déjà utilisée par le BMR — **n'atteint jamais les macros**.

C'est **R4 dans sa forme la plus pure**, et c'est mesuré à l'unité près :

```
Δ protéines / Δ lipides quand un bilan corporel frais existe : (0, 0) sur 160 comparaisons
```

`leanMassRecente()` existe. `bmrDetail()` l'emploie (Katch-McArdle). `macrosForKcal()` **ne la
lit pas une seule fois**. L'information est collectée, validée, stockée, elle atteint le BMR —
et s'arrête là.

### Les trois anomalies, par gravité décroissante

| # | anomalie | ampleur mesurée | pire cas |
|---|---|---|---|
| **1** | protéines absurdes chez les sujets à forte masse grasse | **27 648** profils > 3,1 g/kg de masse maigre ; **2 542** > 40 % des calories | 130 kg à 45 % MG → **325 g de protéines = 4,55 g/kg maigre = 49,7 % des calories** |
| **2** | ⛔⛔ **la somme des macros contredit la cible affichée** | **191** profils (0,15 %), écart moyen **108 kcal** | femme 75 ans, 150 cm, 110 kg, perte, décharge → écran : **cible 1 515 kcal**, macros affichées = **1 892 kcal**, soit **+25 %** |
| **3** | glucides écrêtés à **0 g** | **885** profils | homme 110 kg / 150 cm en perte → **P 275 · G 0 · L 88** : une cétogène involontaire, jamais choisie |
| *(4)* | *glucides très hauts (le cas du cahier)* | *109 922 > 8 g/kg* | *homme 45 kg IMC 13,9 très actif → **16,8 g/kg*** |

⭐⭐ **Et l'anomalie n°2 est la plus grave alors qu'elle est la plus rare** : elle touche
**exclusivement des femmes âgées en surpoids marqué en perte de poids**, et elle affiche **deux
chiffres qui se contredisent sur le même écran** — la famille de bugs la plus vicieuse du projet.

**⚠️⚠️ ET ELLE N'EST NI DANS LE CAHIER D'AUDIT, NI DANS MON RAPPORT D'HIER.** J'avais publié
*« fermeture calorique saine, ±3 kcal »* sur **14 cas**, puis *« ±6 kcal »* sur 922 000. **Les
deux étaient faux**, et la seconde fois c'est **ma lecture** qui mentait : mon corpus ne gardait
que les **8 premiers** cas rencontrés, pas les **pires**.
👉 ***Un échantillon d'exemples n'est pas un maximum.*** C'est un témoin écrit comme un
invariant qui a rougi sur le code servi et m'a corrigé.

---

## 2. 📚 SOURCES — ET CE QUI EST VÉRIFIÉ OU NON

**⛔ LIMITE TECHNIQUE MESURÉE, PAS SUPPOSÉE.** Seul `api.github.com` traverse le proxy
d'egress. Refusés au CONNECT (403, politique d'organisation) : `doi.org`, `pubmed`, `PMC`,
`EuropePMC`, `Crossref`, `OpenAlex`, `Semantic Scholar`, `Springer`, `Frontiers`, `MDPI`,
`arXiv`, `CORE`, `ANSES`, `EFSA`, `OMS`, `Dietitians of Canada`.
**La recherche fonctionne ; la lecture des sources primaires non.**

| règle candidate | source | population | unité | plage | vérif. |
|---|---|---|---|---|---|
| Glucides sports de force | **Slater & Phillips 2011**, J Sports Sci | sprint, haltéro, lancers, **bodybuilding** | g/kg poids | **4-7 g/kg/j** selon la phase | ⚠️ **NON VÉRIFIÉE** |
| Protéines entraînés | **ISSN 2017** position stand | sujets exerçants | g/kg **poids de corps** | **1,4-2,0** | ⚠️ **NON VÉRIFIÉE** |
| Protéines en déficit | **ISSN 2017** | entraînés en résistance, **hypocalorique** | g/kg **poids de corps** | **2,3-3,1** | ⚠️ **NON VÉRIFIÉE** |
| Protéines / lipides bodybuilding | **Helms, Aragon & Fitschen 2014**, JISSN | bodybuilders naturels en prépa | prot. en g/kg **masse maigre** | **2,3-3,1** LBM · lipides **15-30 %** des cal | ⚠️ **NON VÉRIFIÉE** |
| Lipides plancher | littérature physique/bodybuilding | athlètes physique | g/kg poids | **0,5-1,5** ; **< 0,5 = risque hormonal** | ⚠️ **NON VÉRIFIÉE** |
| Surplus prise de muscle | **Iraki et al. 2019** | naturels, hors saison | % maintenance | **+10-20 %** (novice/interm.), **+5-10 %** (avancé) | ⚠️ **NON VÉRIFIÉE** |
| Vitesse de prise | **Iraki 2019** | idem | % poids/sem | **0,25-0,5 %** | ⚠️ **NON VÉRIFIÉE** |
| Vitesse de perte | **Helms 2014** · rev. Nutrients 2021 | entraînés en résistance | % poids/sem | **0,5-1,0 %** | ⚠️ **NON VÉRIFIÉE** |
| Disponibilité énergétique | **CIO / RED-S** | athlètes | kcal/kg **masse maigre** | **< 30 = LEA** ; 45 = optimal | ⚠️ **NON VÉRIFIÉE** |
| Protéines en obésité | **Weijs**, *Protein requirement in obesity*, Curr Opin Clin Nutr Metab Care 2025 · Clin Nutr ESPEN 2022 | **surpoids / obésité** | poids **corrigé** ou **1,5 g/kg masse maigre** | différences cliniquement pertinentes chez **78-100 %** des sujets ; poids de référence **plafonné à IMC 30** | ⚠️ **NON VÉRIFIÉE** |
| Protéines population générale | **ANSES** | adulte sédentaire FR | g/kg poids | **RNP 0,83** | ⚠️ **NON VÉRIFIÉE** |

**⭐⭐ LE POINT DE DOCTRINE LE PLUS UTILE DE TOUTE LA PHASE 1, ET IL VIENT DE L'ANSES** :
elle a **explicitement refusé** de fixer un intervalle de référence pour les glucides —
*« les pourcentages découlent des références établies pour les deux autres macronutriments et
n'ont donc pas de justification propre »*.
👉 ***La borne à poser n'est donc PAS sur les glucides : elle est sur ce qui les détermine.***
Cela converge exactement avec la cause racine mesurée, par deux chemins indépendants.

**⚠️ ET LE PIÈGE DU §4 DU CAHIER S'EST PRÉSENTÉ DÈS LA PREMIÈRE REQUÊTE.** Interrogé sur les
glucides en musculation, le moteur de recherche a répondu **« 8-12 g/kg/j »** en le présentant
comme la recommandation pour la musculation. C'est la plage des **cyclistes d'endurance à très
haut volume**. *Une Phase B bâtie sur des résumés produirait des règles fausses avec l'apparence
de sources.* La bonne valeur, spécifique aux sports de force, est **4-7 g/kg** (Slater & Phillips).

**⛔ CONSÉQUENCE DIRECTE, ET ELLE EST TA CONSIGNE** : **aucune** de ces règles n'étant lue à la
source, **aucune ne peut devenir une règle métier définitive aujourd'hui**. Ce dossier propose
des règles **conditionnées à la vérification**.

---

## 3. 📐 RÈGLES ACTUELLES (lues dans `state.js`, pas décrites de mémoire)

```js
BMR      : Mifflin-St Jeor, ou Katch-McArdle si bilan corporel < 90 j et poids stable ±5 %
           (+7 % si fumeur, appliqué aux deux)
TDEE     : BMR × activityLevel + métier(0/200/325/450) + autre sport(+150) + pas
Cible    : TDEE + objectif + phase(±100) + lutéale(+150), puis plancher 1500 H / 1200 F
Protéines: poids_total × {muscle 2,2 · perte 2,5 · recomp 2,6 · force 2,0 · équilibre 2,0 · endurance 1,7}
Lipides  : poids_total × {muscle 0,9 · perte 0,8 · recomp 0,85 · force 1,0 · équilibre 0,85 · endurance 0,75}
Glucides : max(0, (cible − P×4 − L×9) / 4)          ← LE RÉSIDU, sans aucune borne
Cycle    : jour de séance → lipides ↓, glucides ↑ (plancher lipides 0,6 g/kg)
```

**Provenance de chaque coefficient, classée comme demandé :**

| coefficient | statut |
|---|---|
| Mifflin-St Jeor, Katch-McArdle | **documenté scientifiquement** |
| plancher 1500/1200 | **choix produit justifié** (aligné sur le Gardien de Milo, ft-v918) |
| ratios protéines 2,0-2,6 | **documenté** (ISSN 2,3-3,1 en déficit) mais **appliqué au mauvais dénominateur** |
| ratios lipides 0,75-1,0 | **documenté** (0,5-1,5 g/kg) ✅ |
| écarts objectifs (+350 / −450 / −250 / +200 / 0 / +100) | **choix produit**, cohérent avec Iraki (+10-20 %) pour `muscle` ; les autres **non sourcés** |
| phase ±100 kcal | **arbitraire** — aucune source trouvée |
| métier 0/200/325/450 | **hérité**, non sourcé |
| autre sport +150 | **choix produit documenté dans le code** (moyenne prudente) |
| +7 % fumeur | **documenté** |
| lutéale +150 kcal / +0,2 g/kg | **documenté** (effet thermique de la phase lutéale) |
| `_CYCLE_AMPLI` 0,30 · `_CYCLE_FAT_MIN` 0,6 | **choix produit**, non sourcés — mais 0,6 > 0,5 donc **sûr** ✅ |
| **glucides = résidu** | **cohérent avec Helms et l'ANSES** — ⛔ mais **sans contrôle de plausibilité** |

**Redondances / contradictions trouvées :** aucune duplication de table (elles ont été
unifiées en ft-v981 et ft-v1232). ⚠️ **Une contradiction interne subsiste** : le plancher
lipidique du cycle (0,6 g/kg) protège les jours de séance, mais **aucun plancher ne protège le
pourcentage calorique** — 126 779 profils descendent sous 15 % des calories, jusqu'à **7,2 %**.

---

## 4. 🛠️ RÈGLES PROPOSÉES

Six variantes ont été **simulées et comparées sur 69 120 profils**. Le témoin de validité du banc
(V0 doit égaler la production) tombe à **0 écart sur 69 120** — la comparaison est honnête.

| variante | ce qu'elle change |
|---|---|
| **V1** | poids de référence plafonné à **IMC 30** pour protéines **et** lipides |
| **V2** | masse maigre si bilan frais, sinon poids plafonné — pour les **deux** macros |
| **V3** | V2 + borne glucides 7 g/kg, surplus versé aux lipides |
| ⭐ **V4** | poids de référence réduit pour les **PROTÉINES SEULES** ; lipides sur le poids **réel**, avec double plancher (**0,5 g/kg réel** ET **15 % des calories**) |
| ⭐⭐ **V5** | **V4** + borne glucides **7 g/kg** (sports de force), surplus versé aux lipides **sans dépasser 35 % des calories**, puis **SIGNAL d'incohérence** au lieu de fabriquer un nombre |

---

## 5. ⚖️ JUSTIFICATION DE CHAQUE CHANGEMENT — AVANT → PROBLÈME → PREUVE → RÈGLE → APRÈS

### ① Le dénominateur des protéines

| | |
|---|---|
| **AVANT** | `prot_g = poids_total × ratio` |
| **PROBLÈME** | chez un sujet à forte masse grasse, le tissu adipeux gonfle le dénominateur |
| **PREUVE** | **27 648** profils > 3,1 g/kg de masse maigre ; pire cas **4,55 g/kg maigre = 49,7 % des calories** ; et **Δ = 0 g** quand un bilan frais existe |
| **RÈGLE** | poids de référence = **masse maigre / 0,85** si bilan frais, sinon **min(poids, poids à IMC 30)** |
| **SOURCE** | Weijs 2025 · Clin Nutr ESPEN 2022 (*« maximum weight of BMI 30 »*) · Helms 2014 (LBM) — ⚠️ **NON VÉRIFIÉES** |
| **APRÈS** | 27 648 → **2 496** (−91 %) · protéines > 40 % des cal : 2 542 → **219** (−91 %) |

### ② Le dénominateur des lipides — ⛔ CE CHANGEMENT EST REFUSÉ, et c'est mon contre-audit qui l'a tué

| | |
|---|---|
| **AVANT** | `fat_g = poids_total × ratio` |
| **PROPOSÉ D'ABORD** | même poids de référence réduit que les protéines (V1/V2) |
| **⛔ PREUVE CONTRE** | **V1 et V2 créent un défaut que V0 n'avait PAS** : lipides < 0,5 g/kg passe de **0** à **1 920** (V1) et **384** (V2) ; lipides < 15 % des calories passe de **5 892** à **13 569** |
| **POURQUOI** | la justification (*« le tissu adipeux ne consomme pas de protéines »*) vaut pour les **protéines**. Les lipides ont un rôle **hormonal** et leur plancher s'exprime en **poids réel** |
| **RÈGLE RETENUE** | lipides sur le **poids réel**, avec **double plancher** : `max(ratio × poids, 0,5 g/kg, 15 % des calories)` |
| **APRÈS (V4)** | lipides < 0,5 g/kg : **0** ✅ · lipides < 15 % : 5 892 → **3 221** (−45 %) |

### ③ La borne de plausibilité des glucides

| | |
|---|---|
| **AVANT** | aucune borne ; `Math.max(0, …)` **masque** le dépassement au lieu de le signaler |
| **PROBLÈME** | ⛔ glucides à **0 g** (885 profils) et ⛔ **somme des macros ≠ cible affichée** (+377 kcal) |
| **PREUVE** | mesurée sur 922 000 profils ; le pire cas est une femme de 75 ans en perte de poids |
| **RÈGLE** | plage **4-7 g/kg** pour les objectifs de force ; au-delà, verser aux lipides **sans dépasser 35 % des calories** ; si ça ne suffit pas → **signal d'incohérence explicite** |
| **SOURCE** | Slater & Phillips 2011 (**sports de force**, pas endurance) — ⚠️ **NON VÉRIFIÉE** |
| **APRÈS (V5)** | glucides > 7 g/kg : 12 025 → **5 348** (−56 %) · > 8 g/kg : 9 478 → **3 418** (−64 %) · glucides à 0 : **0** · lipides > 40 % : **34** (identique à V0, contre 1 016 en V3) |

**⛔ ET LA RÈGLE QUI ENCADRE TOUT : on ne fabrique jamais un nombre extrême en silence.** Quand
la cible ne peut pas se répartir dans les plages, le moteur le **dit**. C'est exactement le §6 du
cahier, et c'est la seule réponse honnête à *« où vont les calories quand une macro atteint une
borne ? »*.

---

## 6. 🧪 CORPUS TESTÉ

| corpus | profils | temps | instrument |
|---|---|---|---|
| **Principal** — 2 sexes × 7 âges × 6 tailles × 9 poids × 4 activités × 4 métiers × 4 volumes × 6 objectifs × 2 phases × séance/repos, IMC borné 13-55 | **921 984** | **67 s** | `tools/corpus_nutri.js` |
| **Masse grasse** — 5 poids × 8 % de MG × 4 objectifs, avec/sans bilan | **320** | 8 s | `tools/corpus_nutri_mg.js` |
| **Variantes de conception** — 6 variantes × 11 520 profils | **414 720** | ~3 min | `tools/simul_nutri_v2.js` |
| **Fermeture calorique** — recherche des vrais maximums | **131 712** | 45 s | *(sonde dédiée)* |

**Total : ~1,47 million d'évaluations du moteur réel**, zéro erreur de page.

---

## 7. 📉 EXTRÊMES OBSERVÉS

| grandeur | minimum | maximum | profil du maximum |
|---|---|---|---|
| glucides g/kg | **0,00** | **16,82** | H 18 ans, 180 cm, 45 kg (IMC 13,9), très actif, métier physique, muscle |
| protéines / masse maigre | 1,7 | **4,73** | H 110 kg à 45 % MG, recomp |
| % calories en protéines | 8 % | **49,7 %** | H 130 kg à 45 % MG, perte |
| % calories en lipides | **7,2 %** | 52,3 % | min : H 45 kg endurance ; max : profils écrêtés |
| kcal/kg | 10,7 | **82,9** | H 18 ans, 45 kg, très actif, métier physique |
| écart somme macros / cible | −6 | **+377 kcal** | **F 75 ans, 150 cm, 110 kg, perte, décharge** |

⚠️ **Le corpus est une grille combinatoire, pas une population.** « 11,9 % de profils au-dessus
de 8 g/kg » ne veut **pas** dire « 11,9 % des utilisateurs ». *Un corpus sert à trouver les
défauts, pas à estimer une fréquence d'usage.*

---

## 8. ✅ RÉSULTATS DES TESTS

**Bloc `B-CCCLII`** (`tests/parcours/nutri_proprietes.js`), **15 témoins, 15 verts** :

- **4 photographies T01** — les 4 cas de référence figés à la valeur près
- **2 tables figées** — écarts par objectif, plancher calorique
- **3 défauts figés** — ⑦ la masse maigre n'atteint pas les macros · ⑨ les glucides à 0 · ⑬ la somme dépasse la cible
- **5 invariants** — aucune macro négative · aucun NaN · aucune cible sous plancher · ⑬bis fermeture dans l'arrondi hors écrêtage · aucune erreur de page

⭐ **Les trois « défauts figés » sont VERTS parce que le défaut existe.** Ils rougiront le jour
où tu valideras la correction — *un témoin qui fige un état ne se supprime pas quand cet état
change : il se retourne, avec la raison écrite à côté* (**R30**).

⛔ **Le bloc n'est PAS branché dans la passe complète**, exprès : il fige un état qui attend ta
décision. On le branchera au moment où elle sera prise.

---

## 9. 🥊 RÉSULTATS DU CONTRE-AUDIT

**Le contre-audit a réfuté ma première proposition, pas confirmé mon audit.**

| ce qu'il a trouvé | conséquence |
|---|---|
| ⛔ **V1 et V2 cassent un invariant que V0 tenait** (lipides < 0,5 g/kg : 0 → 1 920) | la proposition a été **refaite** → V4 |
| ⛔ **V3 fait exploser les lipides** (> 40 % des cal : 34 → 1 016) parce qu'il y verse le surplus sans plafond | la règle est devenue « verser **jusqu'à 35 %**, puis **signaler** » → V5 |
| ⛔ **Mon affirmation « fermeture saine » était fausse deux fois** (±3 puis ±6 kcal ; vrai maximum **+377**) | mon audit d'hier est **corrigé** dans ce dossier |
| ⛔ **Mon corpus lui-même mentait** : il gardait les 8 *premiers* cas, pas les *pires* | l'instrument a été corrigé, et la leçon est écrite |

**Contrôle négatif par mutations — `tools/mut_nutri_proprietes.py`, 9 mutations, 9 conformes,
0 ancre morte**, chacune faisant rougir **le bon témoin** :

| mutation | témoin qui rougit |
|---|---|
| écart objectif `muscle` 350 → 400 | ① T01 + ⑤ table |
| plancher 1500 → 1400 | ⑥ + ⑫ |
| ratio protéines force 2,0 → 1,8 | ① |
| **`Math.max(0, …)` retiré** → glucides négatifs | ⑨ + ⑩ + ⑬ |
| ⭐⭐ **la correction simulée** (les macros lisent la masse maigre) | **⑦ — le témoin du défaut** |
| plancher désarmé | ⑫ |
| phase ±100 → ±150 | ①②③ |
| ratio lipides force 1,0 → 1,2 | ① |
| *commentaire citant tous les mots cherchés* | **aucun (reste vert)** ✅ |

⭐⭐ **M05 est la preuve qui compte** : le témoin qui fige le défaut **voit arriver sa propre
correction**. Un témoin de défaut qui ne détecterait pas sa correction ne serait pas une garantie.

---

## 10. ❓ POINTS ENCORE INCERTAINS

1. ⛔⛔ **Aucune source n'est lue à la source.** C'est le blocage n°1, et il est technique.
2. **2 496 profils restent > 3,1 g/kg de masse maigre même en V4/V5** — à comprendre avant de figer.
3. **Le diviseur `0,85`** (masse maigre → poids de référence) est **mon choix**, non sourcé. Une alternative consiste à appliquer les g/kg **directement à la masse maigre** avec des ratios réajustés — à simuler.
4. **La phase ±100 kcal** n'a **aucune source**. Elle n'est pas dangereuse, mais elle est arbitraire.
5. **La frontière « endurance »** est exemptée de la borne glucides dans V5 — défendable, mais c'est un choix.
6. **12 927 profils émettent un signal en V5** (18,7 % du corpus). Sur une population réelle ce serait bien moins, mais **le chiffre n'est pas connu** : il faudra le mesurer sur l'usage.
7. **Les profils à IMC < 16** produisent des valeurs absurdes (16,8 g/kg). Faut-il les traiter ? C'est une **décision produit** : ces personnes existent, et l'app leur répond quelque chose.

---

## 11. 🗄️ PROPOSITION POUR L'HISTORIQUE (Phase 8)

**Chantier séparé, aucun lien technique avec les macros** — il peut être décidé et livré
indépendamment.

- **Un événement, pas un écrasement.** Chaque changement de poids, masse grasse, objectif, niveau d'activité, discipline ou fréquence crée une **entrée immuable** : date/heure, ancienne et nouvelle valeur, **provenance**, BMR/TDEE théoriques du moment, prescription calories/macros, phase, **et la version des règles qui l'a produite**.
- ⭐ **La brique existe déjà à moitié** : `weightLog[].bfSrc` (ft-v1231) porte déjà la provenance d'une mesure, et `coachMemoryMeta` (ft-v1227) porte déjà le patron « la valeur d'un côté, sa nature de l'autre ». **On étend un mécanisme éprouvé, on n'en invente pas un** (R13).
- ⛔ **Une version N+1 ne recalcule JAMAIS une prescription de version N.** C'est la seule règle non négociable de ce chantier, et elle décide du format : la prescription est **stockée**, pas recalculée.
- ⛔ **Aucune IA** : comparer deux périodes est du tri et de la soustraction.
- ⚠️ **Le coût réel est le volume** : `localStorage` est déjà sous tension. Un événement par changement significatif, pas par frappe clavier.

---

## 12. 📅 CE QUI EXIGE RÉELLEMENT PLUSIEURS SEMAINES

**Une seule chose : la Phase 9.** Et encore, seulement sa partie *observation*.

| ce qui peut se décider AUJOURD'HUI | ce qui exige d'attendre |
|---|---|
| quelles données observer | **8 à 16 semaines de données réelles** |
| les fenêtres 7 / 14 / 28 jours | la convergence d'un TDEE **observé** |
| la moyenne glissante et la règle de tendance | la vérification que les adaptations sont **bornées et espacées** |
| les bornes d'ajustement (jamais sur une seule mesure) | |
| le format de stockage | |

⭐ **La spécification de la Phase 9 est donc du travail de type B** : elle peut être écrite,
testée sur des **séries synthétiques** (perte régulière, plateau, rétention d'eau, week-end
haut, données manquantes, recomposition à poids stable) **dès maintenant**. Seule la validation
sur données réelles attend.

---

## 13. 🚀 CE QUI PEUT ÊTRE LIVRÉ IMMÉDIATEMENT

Par ordre de rapport bénéfice / risque :

| # | livraison | risque | ampleur |
|---|---|---|---|
| **1** | ⛔⛔ **Fermer la contradiction cible / somme des macros** (anomalie n°2) | **faible** — 191 profils, tous déjà cassés | **critique** : deux chiffres qui se contredisent à l'écran |
| **2** | **Poids de référence des protéines** (V4) | **moyen** — change la prescription de beaucoup de profils | **−91 %** sur les deux pires propriétés |
| **3** | **Double plancher lipidique** (0,5 g/kg **et** 15 % des calories) | **faible** | **−45 %** sur les lipides trop bas |
| **4** | **Borne de plausibilité + signal** (V5) | **moyen** — c'est un nouveau message à l'écran | **−56 %** sur les glucides hors plage |
| **5** | **Historique des périodes** (Phase 8) | **faible** — purement additif | prépare toute la suite |

⚠️ **Mon avis, et c'est un avis** : livrer **1 et 3 d'abord** (faible risque, défauts objectifs),
puis **2 et 4 ensemble** après vérification des sources — parce que 2 et 4 **changent ce que les
gens mangent**, et ça ne se fait pas sur des sources non lues.

---

## 14. ⏱️ TEMPS DE TRAVAIL RESTANT PAR PHASE

| phase | état | temps de travail restant |
|---|---|---|
| **1 — audit documentaire** | ⚠️ **amorcée, bloquée** | **2-3 h** si tu fournis les PDF · **impossible** sinon |
| **2 — cartographie du moteur** | ✅ **FAITE** | 0 |
| **3 — corpus massif** | ✅ **FAITE** (1,47 M d'évaluations) | 0 |
| **4 — plausibilité** | ✅ **FAITE** (bornes sourcées, pas inventées) | 0 |
| **5 — conception V2** | ✅ **FAITE** (6 variantes simulées et comparées) | **1-2 h** pour trancher les incertitudes du §10 |
| **6 — tests et contre-tests** | ✅ **FAITE** (15 témoins, 9 mutations conformes) | **2-3 h** pour les 38 tests du cahier au complet |
| **7 — contre-audit** | ✅ **FAITE** (il a réfuté ma proposition **et** mon audit) | **1 h** de contre-audit adversarial supplémentaire |
| **8 — historique** | 📄 **spécifiée** | **4-6 h** d'implémentation + témoins |
| **9 — validation longitudinale** | 📄 **spécifiable maintenant** | **2-3 h** de spécification + séries synthétiques · puis **8-16 semaines d'observation** |
| **Implémentation de V4/V5** | ⏸️ **en attente de ta décision** | **3-5 h** (code + témoins retournés + contrôle négatif + passe complète) |

---

## ⛔ ÉTAT DE LIVRAISON

**Aucune publication. Aucun changement métier servi. Aucun numéro de version.**

| fichier | nature |
|---|---|
| `tools/corpus_nutri.js` · `corpus_nutri_mg.js` · `simul_nutri_v2.js` | instruments de mesure, **lecture seule** |
| `tests/parcours/nutri_proprietes.js` | témoins T01 + propriétés, ⛔ **non branchés** dans la passe |
| `tools/banc_nutri_proprietes.js` · `mut_nutri_proprietes.py` | banc ciblé + contrôle négatif |
| `docs/AUDIT-NUTRITION-2026-09-22.md` | l'audit d'hier — ⚠️ **corrigé par ce dossier sur la fermeture calorique** |

**`state.js`, `app.js`, `screens.js`, `coach.js`, `index.html`, `sw.js` : 0 ligne.**

---

*J'attends ta décision.*
