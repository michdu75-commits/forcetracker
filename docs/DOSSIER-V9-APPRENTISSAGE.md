# 🧠 FORCE TRACKER — MOTEUR NUTRITIONNEL V9 ET APPRENTISSAGE LONGITUDINAL

> **24/09/2026** · repart de `docs/DOSSIER-DECISION-V8.md` (arbre `0c73966d`).
> ⛔ **AUCUNE MODIFICATION DU MOTEUR SERVI. AUCUNE PUBLICATION. AUCUN BUMP.**
> V9 vit dans `tools/moteur_v9.js`, un simulateur Node que **rien** dans l'app ne charge.
>
> 🏷️ **[A]** mesuré dans Force Tracker · **[B]** source externe non lue à la source ·
> **[C]** inférence · **[D]** choix produit · **[E]** incertain.
> ⛔ **B ne devient jamais A.**

---

# PARTIE I — L'AUDIT DE CE QUI EXISTE (§1)

## 1. Qu'est-ce qui existe déjà dans Force Tracker ?

**[A] Prouvé par lecture du code servi, pas affirmé.**

| donnée / mécanisme | saisie | stockage | historique ? | relu par | statut |
|---|---|---|---|---|---|
| poids | pesée, bilan corporel, import | `S.weightLog` (`ft4_wlog`) | ✅ **tableau daté** | courbes, tendance, Milo | **EXISTE ET EST UTILISÉE** |
| **pente de poids** `penteKgParSemaine` | — | calculée | — | carte tendance, Progrès | ⭐ **EXISTE ET EST UTILISÉE** — régression linéaire **sur les jours** puis ×7, corrigée pour ne plus dépendre de la fréquence des pesées |
| masse maigre / bilan corporel | saisie ou photo lue par l'IA | `S.bodyScans` | ✅ tableau daté | **BMR (Katch)** | **EXISTE ET EST UTILISÉE** — mais **pour les calories seulement** |
| mensurations | carte Corps & santé | `S.mensLog` | ✅ tableau daté | US Navy, courbes | **EXISTE ET EST UTILISÉE** |
| séances | écran Séance | `S.sessions` | ✅ tableau daté | calendrier, PRs, `cycleGlucides` | **EXISTE ET EST UTILISÉE** |
| journal alimentaire | ajout d'aliment | `S.foodLog` | ✅ tableau daté | `_resteDuJour`, écran Nutrition | **EXISTE MAIS N'EST PAS EXPLOITÉE** longitudinalement |
| sommeil, état du jour, pas | check-in | `S.sleepLog`, `S.dayStateLog`, `S.stepsLog` | ✅ | récup, `_pasEcart` | **EXISTE ET EST UTILISÉE** |
| records | fin de séance | `S.prs` | ⚠️ **valeur courante + date**, pas de série | Accueil, Milo | **EXISTE PARTIELLEMENT** |
| séance annoncée | Accueil / Milo | `S.nextPlanned` | ⛔ **valeur courante**, effacée après | Accueil, Milo | **EXISTE MAIS EST ÉCRASÉE** |
| charges prescrites par Milo | `_milo:true` sur les séries | dans `S.sessions` | ✅ transporté | — | ⛔ **EXISTE MAIS N'EST PAS EXPLOITÉE** |
| **cible calorique prescrite** | — | ⛔ **nulle part** | ⛔ **AUCUN** | recalculée à chaque affichage | ⛔ **N'EXISTE PAS** |
| **TDEE observé / recalibré** | — | — | — | — | ⛔ **N'EXISTE PAS** |
| **périodes / versions du moteur** | — | — | — | — | ⛔ **N'EXISTE PAS** |
| `discipline`, `level` | profil | `ft4_discipline`, `ft4_level` | valeur courante | ⛔ **personne, côté nutrition** | **EXISTE MAIS N'EST PAS EXPLOITÉE** |

## 2. Qu'est-ce qui existe seulement EN APPARENCE ?

⛔⛔ **Trois choses, et la première est une erreur de documentation que je corrige ici.**

**① `CLAUDE.md` annonce « TDEE adaptatif » et « Harris-Benedict adaptatif ».** **[A] C'est faux
sur les deux points** : le code servi emploie **Mifflin-St Jeor** et **Katch-McArdle**, jamais
Harris-Benedict, et **rien n'est adaptatif** — `grep` sur `recalibr|tdeeObserve|tdeeReel|
adaptTDEE` rend **zéro occurrence**. 👉 *Un document d'état qui sur-déclare fait croire qu'une
brique existe et empêche de la construire* (**R23**).

**② « Comparer prescrit et observé » existe — pour AUJOURD'HUI seulement.** `_resteDuJour`
(app.js) compare bien la cible aux aliments notés. ⛔ Mais il appelle `calcMacros()` **au moment
de l'affichage** : rouvrir une journée d'il y a trois semaines la compare à la cible d'**au-
jourd'hui**, pas à celle qui était en vigueur ce jour-là. *C'est une comparaison instantanée, pas
un historique.*

**③ « Apprendre d'une progression ou d'une régression » n'existe pas comme MÉCANISME.**
Le mot « stagnation » n'apparaît que dans le **prompt de Milo** (`coach.js`). C'est donc une
compétence du modèle de langage, pas une règle déterministe de l'app. ⛔ **Aucune comparaison
entre charge prescrite et charge réalisée** n'existe, alors que `_milo:true` transporte
l'information depuis ft-v1017.

## 3. Qu'est-ce qui manque ?

| les 8 questions du §1 | réponse **[A]** |
|---|---|
| apprendre d'une progression sportive | ⛔ **N'EXISTE PAS** (les PRs sont détectés, jamais exploités pour décider) |
| apprendre d'une régression | ⛔ **N'EXISTE PAS** |
| comparer charge prévue / réalisée | ⛔ **N'EXISTE PAS** (la donnée est là, personne ne la lit) |
| comparer nutrition prescrite / observée | ⚠️ **PARTIELLEMENT** — le jour même, contre la cible actuelle |
| comparer poids prévu / observé | ⛔ **N'EXISTE PAS** (aucun poids prévu n'est stocké) |
| recalibrer une estimation énergétique | ⛔ **N'EXISTE PAS** |
| conserver les anciennes estimations | ⛔ **N'EXISTE PAS** |
| expliquer pourquoi une reco diffère de l'ancienne | ⛔ **N'EXISTE PAS** (rien ne garde l'ancienne) |

⭐ **La brique la plus coûteuse à construire existe déjà** : `penteKgParSemaine`, et elle est
déjà robuste aux pesées irrégulières. V9 la réemploie (**R2/R13**) au lieu d'en écrire une
seconde.

---

# PARTIE II — LES 600 g (§2, §3, §4, §5)

## 4. Pourquoi 600 g avait-il été choisi ?

⛔⛔ **Réponse : par moi, sans aucune justification. Vérifié, pas supposé.**

* `grep` sur tout le dépôt : **600 n'existe nulle part dans le moteur servi**.
* `git log -S"gluc_sur_600g"` : la chaîne apparaît **pour la première fois dans mon propre
  commit `c628c236`** du 23/09.
* Elle ne vit que dans `tools/banc_v8.js` ligne 70 et dans mon dossier V8.

**Et la recherche ne trouve aucune borne absolue en grammes/jour.** Ce que la littérature donne
est **toujours par kg** : 3-5 g/kg (charge légère) → **8-12 g/kg (charge très élevée)**. Les
seules valeurs absolues publiées concernent l'**apport PENDANT l'effort** (30-90 g/h, jusqu'à
120 g/h en glucose-fructose 1:0,8) — *une grandeur qui n'a rien à voir avec un total journalier*.

## 5-6. 600 g est-il conservé, et sous quelle forme ?

**Réponse : A — non. C'est B.** 600 g est **retiré des invariants scientifiques** et conservé
**uniquement comme signal de praticabilité absolue**, renommé dans tout le banc :
`S_gluc_sur_600g_SIGNAL_praticabilite`. ⛔ Il ne juge plus rien, il ne coupe rien.

## 7. Quelle règle remplace le seuil absolu ?

⭐⭐ **La PLAUSIBILITÉ GLUCIDIQUE : un classement à quatre niveaux, pas un seuil.**

**[A] La démonstration du §3 est arithmétique et elle est mesurée :**

| 600 g pour… | g/kg | bande justifiée par la charge | verdict V9 |
|---|---|---|---|
| 55 kg, 0 séance | **10,9** | légère, 3-5 g/kg | ⛔ `INCOHERENT_AVEC_LE_CONTEXTE` |
| 85 kg, 4 séances | 7,1 | élevée, 6-10 g/kg | ✅ `NORMAL` |
| 120 kg, 6 séances | **5,0** | très élevée, 8-12 g/kg | ✅ `NORMAL`, et **sous** la plage |

👉 ***La même quantité absolue est absurde, normale ou basse selon le contexte.*** Un seuil en
grammes ne peut pas le voir.

**Les quatre niveaux :** `NORMAL` (dans la bande) · `ELEVE_MAIS_COHERENT` (au-dessus mais
≤ 12 g/kg) · `TRES_ELEVE_A_VERIFIER` (> 12 g/kg) · `INCOHERENT_AVEC_LE_CONTEXTE` (au-dessus de
la bande **ET** TDEE douteux **ET** une cause identifiée). ⛔ **Aucun ne tronque.**

**[A] Répartition mesurée, corpus B (1 000 000 profils) :**
`NORMAL` **79,7 %** · `ELEVE_MAIS_COHERENT` **11,8 %** · `INCOHERENT_AVEC_LE_CONTEXTE` **0,3 %**.

## §5 — Pourquoi les gros apports arrivent : l'attribution de cause

**[A] Sur les profils > 600 g du corpus B (V9), causes cumulées :**

| cause | occurrences |
|---|---|
| **TDEE élevé** (> 45 kcal/kg) | **18 540** |
| **activité déclarée sans séances** (≥ 1,725 avec ≤ 2 séances) | **9 365** |
| **métier physique + activité élevée cumulés** | **7 450** |
| aucune cause identifiée | 7 073 |
| surplus élevé | 5 732 |
| résidu énergétique pur | 764 |
| petit poids + TDEE haut | 382 |

**Distribution des profils > 600 g :** absolus **p50 640 · p90 719 · p95 749 · p99 823 ·
max 863 g** — en g/kg **p50 7,45 · p90 9,18 · p95 9,56 · p99 10,68 · max 10,90**.

⭐⭐ **Le maximum de V9 est 10,9 g/kg — donc DANS la plage publiée 8-12 g/kg pour charge très
élevée.** ⛔ *Le moteur ne produit plus une seule prescription hors des plages de la littérature.*

👉 **Et la conclusion du §5 est nette : deux causes sur trois ne sont pas nutritionnelles.**
Le TDEE, l'activité déclarée et le cumul métier+activité expliquent **35 355** des attributions.
*Le problème est en amont de l'assiette.*

## §6 — Ce que V9 fait quand la plausibilité est mauvaise

⛔ **Elle ne coupe pas les glucides.** Elle remonte la chaîne et **nomme ce qu'il faut
réexaminer** : le niveau d'activité · le cumul métier+activité · le TDEE · le surplus · la
cohérence globale. ⭐ Et la fermeture reste exacte : **aucune calorie n'est jetée**.

---

# PARTIE III — LE CAS ~659 g (§20)

## 8. Pourquoi Force Tracker arrivait-il à ~659 g ?

**⚠️ Et je commence par une correction : mon premier profil de référence était FAUX.**
J'avais reconstruit « 85,8 kg · 178 cm · 52 ans · bureau » → **490 g**, pas 659. Le profil réel,
relu dans l'audit du 22/09, est **85,8 kg · 179 cm · 41 ans · « Actif (5-6 j) » · métier
PHYSIQUE · phase CHARGE · jour de séance**, TDEE **3 515 kcal**.
👉 *Un cas de référence reconstruit de mémoire au lieu d'être relu est un faux témoin* — et il
m'aurait fait écrire que V0 ne produit pas 659 g.

**[A] L'autopsie, version par version :**

| | BMR | TDEE | cible | P | L | G | g/kg | % énergie | plausibilité |
|---|---|---|---|---|---|---|---|---|---|
| **V0** | 1 777 | 3 515 | 3 965 | 189 | 77 | **629** | 7,33 | 63,5 % | — |
| V4 | 1 777 | 3 515 | 3 965 | 189 | 77 | 629 | 7,33 | 63,5 % | — |
| V5 | 1 777 | 3 515 | 4 037 | 189 | 77 | 647 | 7,54 | 64,1 % | — |
| V6 / V7 | 1 777 | 3 515 | 4 037 | 189 | **98** | **600** | 6,99 | 59,5 % | — (tronqué) |
| V8 | 1 777 | 3 515 | 3 853 | **128** | 77 | **662** | 7,72 | 68,7 % | — |
| **V9** | 1 777 | 3 515 | 3 853 | **154** | 77 | **636** | **7,41** | 66,0 % | ✅ **NORMAL** |

*(Le journal d'origine annonçait 653 g : l'écart de 24 g avec les 629 g du miroir est le
**cyclage des glucides du jour de séance**, que le miroir ne couvre pas et qui est documenté.)*

**La cause, en une phrase : un TDEE de 3 515 kcal que personne n'a jamais vérifié.**
Décomposé : BMR 1 777 × **1,725** (« Actif 5-6 j ») = 3 066, **+ 450 kcal de métier physique**.
👉 ***Le multiplicateur d'activité contient déjà l'entraînement, et le métier physique s'y
ajoute — le même effort est compté deux fois par deux canaux différents.*** C'est la cause
`metier_et_activite_cumules`, la 3ᵉ du corpus B.

## 9-10. V9 produit combien, et pourquoi ?

**V9 produit 636 g — soit 7,41 g/kg, classé NORMAL.**

⛔⛔ **ET JE NE LE FAIS PAS BAISSER ARTIFICIELLEMENT.** V9 rend presque la même chose que V0
(636 contre 629 g), et **c'est volontaire** : à un TDEE de 3 515 kcal, 7,41 g/kg est **dans la
plage 6-10 g/kg** publiée pour une charge élevée. *Le chiffre est cohérent avec les entrées.*

⭐⭐ **Ce qui fait baisser V9, ce n'est pas une règle — c'est l'APPRENTISSAGE :**

| | TDEE retenu | confiance | cible | glucides | g/kg |
|---|---|---|---|---|---|
| **S0** — nouvel utilisateur | 3 515 (formule) | aucune | 3 853 | **636 g** | 7,41 |
| **S4** — 28 j, journal à 18 %, 3 pesées | 3 515 (formule) | faible → ⛔ **porte fermée** | 3 853 | 636 g | 7,41 |
| **S8** — 56 j, journal à 64 %, 9 pesées | **3 206** (obs 3 074, poids 0,7) | forte | 3 541 | **558 g** | 6,50 |
| **S12** — 84 j, journal à 86 %, poids stable | **3 190** (obs 3 050) | forte | 3 525 | **554 g** | 6,46 |
| **S16** — l'activité augmente (6 séances) | **3 355** (obs 3 287) | forte | 3 693 | **596 g** | 6,95 |

👉 ***Les 659 g n'étaient pas un défaut de répartition des macros. C'était une estimation de
dépense que rien ne venait corriger.*** Une fois l'observation disponible, la prescription
descend de **636 à 558 g** — sans qu'aucune borne glucidique n'ait été touchée.

---

# PARTIE IV — LES RÈGLES DE V9

## 11. Les glucides dépendent de l'entraînement — comment, exactement

**[B] Par une échelle publiée**, graduée par la charge : 3-5 · 5-7 · 6-10 · **8-12 g/kg**.
**[C] La charge se lit dans ce que Force Tracker mesure déjà** : séances/semaine, **séries par
groupe musculaire** (seuil de 10 séries, Henselmans 2022), métier.

⚠️⚠️ **ET C'EST ICI QUE JE CORRIGE MON ERREUR DU 23/09.** J'avais transformé Henselmans en
**plafond d'apport** (4-8 g/kg). ⛔ **Faux** : sa revue dit que des glucides *supplémentaires*
n'améliorent pas la performance à ≤ 10 séries par groupe chez quelqu'un de nourri — elle ne dit
rien d'une limite d'apport. *Transformer « pas de bénéfice ergogénique » en « plafond » est
exactement transformer une observation en seuil physiologique.*

## 12. Comment le TDEE évolue-t-il ? (§11)

```
TDEE_ESTIMÉ  (Mifflin ou Katch)          ← toujours disponible
TDEE_OBSERVÉ = apport moyen − (pente de poids × 7 700 / 7)   ← bilan énergétique, rien d'autre
TDEE_PERSONNALISÉ = estimé × (1−w) + observé × w             ← w = poids de la confiance
```
⛔ **`w` ne monte jamais à 1**, et la raison est connue : *l'apport auto-déclaré est
systématiquement sous-estimé*. Un moteur qui croirait le journal à 100 % apprendrait un TDEE
trop bas pour tout le monde. **[D]** plafond à 0,7.
⛔ **Une observation hors de ±35 % de l'estimation est REJETÉE** avec sa raison écrite : c'est
le journal qui est faux, pas le métabolisme.

## 13-14. Comment l'utilisateur est-il appris, et à quel niveau de confiance ? (§12)

**Une PORTE, puis une pente.** ⛔ Sous la porte, le poids de l'observation est **zéro**, pas
« un petit peu » — la consigne était explicite et **ma première version la violait** (elle
donnait 0,15 à un journal rempli à 18 %).

**La porte (cumulative) :** ≥ 14 jours **ET** ≥ 50 % des jours notés **ET** ≥ 4 pesées **ET**
aucun changement d'objectif **ET** aucune interruption déclarée.
**La pente au-dessus :** faible 0,15 · moyenne 0,35 · forte 0,70.

## 15. Comment les mauvaises données sont-elles neutralisées ? (§13)

* **tendance, jamais la pesée du jour** : régression linéaire sur les **jours**, ×7 — donc
  insensible à la fréquence des pesées ;
* **[A] mesuré** : une pesée aberrante de +2,5 kg, en début, milieu ou fin de série, déplace la
  cible de **moins de 80 kcal** ;
* observation absurde → rejetée ; changement d'objectif ou interruption → porte fermée.

## 16. Comment l'historique est-il conservé ? (§14)

⛔ **Conçu, non implémenté**, et je le dis plutôt que de le suggérer :
`MOTEUR_NUTRI_VERSION` (un seul propriétaire, R2) · une **PÉRIODE** s'ouvre à chaque changement
structurant (poids, masse grasse, activité, objectif, fréquence, calories manuelles, méthode) ·
chaque période porte profil · méthode · TDEE estimé · cible · macros · observé · résultat ·
⛔ **aucune migration** : une ligne sans version se lit « avant le versionnement », ce qui est
vrai (règle d'or #16).

## 17. Comment sport et nutrition communiquent-ils ? (§15)

**Architecture commune, logiques séparées, un SIGNAL entre les deux — jamais une causalité.**

```
SPORT     : prescription → réalisation → réponse (PRs, volume) → adaptation
NUTRITION : prescription → consommation → réponse (poids, composition) → adaptation
```
V9 lit **deux signaux sportifs** : le volume (bande glucidique) et les séances (dépense
d'exercice de la disponibilité énergétique). ⛔ **Aucun lien automatique** dans l'autre sens :
un déficit prolongé + une chute de performance produiraient un **signal** à afficher, jamais une
conclusion.

## 18. Discipline et niveau (§14 du brief)

* **Discipline → B : aucune raison scientifique suffisante.** Les 5 disciplines de Force Tracker
  sont toutes des sports de force ; aucune source ne les différencie sur l'énergie. ⛔ **On ne
  fabrique pas deux coefficients pour faire joli.** Si leur volume diffère, c'est le **volume**
  qui produit la différence — et il le fait déjà, via la bande glucidique.
* **Niveau → A : il doit intervenir, et il intervient.** Iraki distingue explicitement
  novice/intermédiaire et avancé. V9 lit `S.level` pour la vitesse de prise.

## 19. Les garde-fous, en trois catégories (§7)

| catégorie | règle | borne | origine |
|---|---|---|---|
| **A — INVARIANT DUR** | fermeture : cible = somme des macros | exact | cohérence interne |
| **A** | aucune macro négative, aucun NaN, déterminisme | — | arithmétique |
| **B — GARDE-FOU SCIENTIFIQUE** | déficit ≤ 31 kcal/kg de masse grasse | **[B]** Alpert 2005 | physiologique |
| **B** | déficit ≤ 500 kcal sous IMC 25, transition jusqu'à IMC 30 | **[B]** Murphy & Koehler + seuils OMS | contextualisé |
| **B** | après l'exercice, il reste au moins le **métabolisme de repos** | **[B/C]** lecture du seuil RED-S | s'échelonne |
| **B** | surplus ≤ 15 % du TDEE | **[B]** Helms 2023 | — |
| **B** | protéines ≤ 3,1 g/kg de **masse maigre**, ≥ 1,4 g/kg de **poids** | **[B]** Helms / ISSN | unités jamais mélangées |
| **B** | lipides ∈ [0,5 ; 1,5] g/kg et [15 % ; 35 %] des calories | **[B]** Iraki + Helms | — |
| **C — SIGNAL** | **600 g absolus** | ⛔ **aucune** — c'est moi | praticabilité pure |
| **C** | > 55 kcal/kg | **[B]** Iraki (~45 observé) | TDEE à réexaminer |
| **C** | disponibilité énergétique < 30 kcal/kg de masse maigre | **[B]** CIO/RED-S | hors de sa population de calibration |
| **C** | protéines > 2,2 g/kg de poids | **[E]** ANSES, source secondaire | ⛔ **plus un plafond** |

## 20. Comment la fermeture est garantie

Les glucides sont le résidu, et **la cible rendue EST la somme des macros**. Quand les minimums
de sécurité dépassent la cible, V9 **déclare** le conflit au lieu d'afficher deux totaux.

## §10 — Les calories manuelles : la troisième voie

⛔ **V8 falsifiait la valeur en silence** (600 saisis → 863 rendus, sans trace de la demande).
**V9 conserve la demande et déclare le conflit :**
```
{ demande: 600, minimum_calculable: 863, ecart: +263,
  pourquoi: "les minimums de sécurité (protéines 119 g, lipides 43 g) valent déjà 863 kcal" }
```
La personne peut alors garder sa cible, changer ses contraintes, ou accepter la correction.

---

# PARTIE V — LES MESURES

## 21-22-23. Les trois corpus

| | profils | ce qu'il répond |
|---|---|---|
| **A — adversarial** | **756 000** | *le moteur peut-il produire ça ?* ⛔ **jamais une prévalence** |
| **B — plausible** | **1 000 000** | *combien de personnes le verraient ?* ⚠️ **modèle, pas recensement** |
| **C — distributions publiées** | **500 000** | *le moteur tient-il sur des corps réels ?* |

⚠️⚠️ **CORPUS C : JE N'AI PAS TÉLÉCHARGÉ NHANES.** `wwwn.cdc.gov` et `www.cdc.gov` rendent
**HTTP 000** (`connect_rejected`). Les moyennes employées sont des **statistiques résumées
publiées**, pas des lignes de données. *Un corpus bâti sur des moyennes teste le réalisme des
entrées ; il ne remplace jamais des données individuelles longitudinales.*

**Taux pour 100 000 — corpus C (distributions publiées) :**

| propriété | V0 | V5 | V6/V7 | V8 | **V9** |
|---|---|---|---|---|---|
| fermeture > 5 kcal | 516 | 230 | 230 | **0** | **0** |
| déficit au-delà d'Alpert | 2 828 | 4 281 | 4 281 | 2 580 | **0** |
| surplus > 20 % | 7 033 | 38 | 38 | **0** | **0** |
| protéines > 3,1 g/kg masse maigre | 69 994 | 58 569 | 58 569 | 5 025 | **0** |
| protéines > 40 % des calories | 12 532 | 6 076 | 6 076 | **0** | **0** |
| lipides < 15 % des calories | 1 547 | 1 050 | **0** | **0** | 38 |
| lipides > 1,5 g/kg | **0** | **0** | 2 484 | **0** | **0** |
| glucides > 12 g/kg | 115 | 77 | **0** | **0** | **0** |
| glucides = 0 g | 267 | **0** | **0** | **0** | **0** |
| *signal 600 g* | 1 740 | 3 383 | 2 809 | 2 619 | 2 276 |

## 24. Ce que V9 améliore

* **fermeture exacte** partout (V0 : 516/100 000 en corpus C) ;
* **plus aucune prescription au-delà de ce que la masse grasse peut fournir** (Alpert) ;
* **plus aucune protéine au-delà de Helms** ni au-delà de 40 % des calories ;
* **plus aucun glucide au-delà de 12 g/kg** — le maximum de V9 est **10,9 g/kg**, dans la plage ;
* **les unités ne sont plus mélangées** : masse maigre en déficit, poids de corps hors déficit ;
* **la cible manuelle n'est plus falsifiée** ;
* **le moteur apprend** : −78 g de glucides entre S0 et S8 sur le cas de référence ;
* **chaque sortie porte son explication** et, si besoin, ce qu'il faut réexaminer.

## 25. Ce que V9 DÉTÉRIORE — écrit comme demandé

⛔ **Quatre points, tous mesurés :**

1. ⚠️ **`P09_deficit_sur_500_hors_obesite` : V8 = 0, V9 = 5 616 pour 100 000 (corpus C).**
   **C'est voulu** — c'est exactement la réouverture demandée au §8. Mais le compteur emploie
   le seuil IMC 30 alors que V9 commence sa transition à IMC 25 : les profils **entre 25 et 30**
   dépassent 500 kcal. *Si Michel juge cette zone trop permissive, c'est le point à déplacer.*
2. ⚠️ **`P19_EA_sous_30` : V8 = 1 950, V9 = 6 478 (corpus A).** V9 a remplacé le garde-fou dur
   par le plancher du métabolisme de repos ; plus de profils passent donc sous le repère de
   30 kcal/kg — **en signal, pas en violation**. Le prix du point ⑤ ci-dessous.
3. ⚠️ **`P11_prot_sous_0_8_gkg` : 19 → 38 (A), 95 → 229 (C).** Profils kéto et cibles manuelles
   très basses. Petit, mais réel.
4. ⚠️ **V9 est nettement plus complexe** : ~330 lignes contre ~25 en production. C'est un coût
   (**R19**), et il ne se justifie que si l'apprentissage est réellement livré.


5. ⚠️⚠️ **ET SUR LE SIGNAL 600 g, V9 EST MOINS BONNE QUE V8 — sur le corpus adversarial.**
   Mesuré pour 100 000 : **corpus A → V8 3 001, V9 3 822** ; corpus B → V6/V7 2 370, V9 3 822 ;
   corpus C → V8 2 619, **V9 2 276** (là V9 gagne). 👉 *V9 émet plus souvent le signal parce
   qu'elle refuse de tronquer* : V6 et V7 descendaient sous 600 g en coupant à 7 g/kg, ce qui
   est interdit, et V8 rabotait les protéines. **V9 ne réduit pas la praticabilité brute — elle
   la QUALIFIE**, et c'est un échange assumé, pas un gain.

## 26. Résultats des mutations et du contre-audit

**Témoins** : `tools/temoins_v9.js`, bloc **B-CCCLIV**, ⛔ **non branché** dans le runner —
**63 témoins, 0 rouge**, dont 4 qui échouent volontairement sur V0 **et sur V8**.

**Mutations** : `tools/mut_v9.py` — **31 mutations sur arbre cloné, 31 conformes, 0 ancre
morte**, dont **3 qui doivent RESTER VERTES**. Les **8 familles exigées au §23** sont couvertes
nommément : apprend trop vite · apprend sans données · ignore l'historique · écrase l'historique
· réagit à une seule pesée · confond poids et masse maigre · traite 600 g comme une limite dure
· déplace les calories vers les lipides.

### ⛔⛔ Ce que le contre-audit a trouvé **dans ma propre V9**

| # | défaut | mesure | fermeture |
|---|---|---|---|
| ① | **mon garde-fou RED-S rendait la perte de poids IMPOSSIBLE aux profils lourds** | à 150 kg / 10 % de gras : déficit plafonné à **−18 kcal** | le seuil de 30 kcal/kg de masse maigre a été calibré sur des athlètes (40-70 kg de masse maigre) où il ≈ le métabolisme de repos ; à 135 kg de masse maigre il vaut 4 050 pour un repos de 3 286. **On garde le SENS, pas le nombre** : le plancher devient « après l'exercice, il reste le métabolisme de repos » |
| ② | **l'IMC 30 était une falaise** | saut de **243 kcal entre 95 et 96 kg** | interpolé entre les deux seuils **OMS** (surpoids 25 → obésité 30) — aucun nombre inventé |
| ③ | **V9 apprenait un peu de presque rien** | poids 0,15 sur un journal rempli à **18 %** | la confiance devient une **PORTE** : sous le seuil, poids **zéro** |
| ④ | **mon cas de référence « 659 g » était faux** | il rendait **490 g** | profil relu dans l'audit du 22/09 au lieu d'être reconstruit de mémoire |
| ⑤ | **6 mutations sur 31 ne mordaient pas** | 25/31 au premier passage | mêmes causes : le jeu de profils ne visitait pas le régime où la règle décide, ou un clamp placé après masquait la règle |
| ⑥ | **le plafond lipidique de 1,5 g/kg n'est PAS un plafond dans V9** | il n'est jamais atteint : les ratios de base plafonnent à 1,0 g/kg | c'est un **DÉTECTEUR** de conflit — le §22 demandait « que se passe-t-il si on la retire ? », la réponse est « le conflit cesse d'être signalé » |

## 27. Ce qui reste scientifiquement incertain **[E]**

1. **Aucune source primaire n'a été lue** — le proxy refuse le CONNECT sur 18 domaines.
2. **La valeur d'Alpert (31 kcal/kg de masse grasse)** : l'auteur a lui-même signalé une erreur
   de calcul, et les extraits rapportent la correction dans une unité incohérente. **On garde la
   valeur conservatrice**, et `V9mk` mesure l'alternative.
3. **Le plafond ANSES de 2,2 g/kg** reste une source française secondaire → **signal**, pas
   plafond. `V9dur` mesure ce qu'il changerait : **9 746 pour 100 000** au lieu de 0.
4. **Le surplus optimal n'est pas établi** (Helms 2023 contre un essai randomisé 2024).
5. **Aucune borne de praticabilité n'existe dans la littérature.**
6. **Les plages glucidiques** (3-5 / 5-7 / 6-10 / 8-12) viennent de sources secondaires.
7. **Le poids maximal de l'observation (0,7)** est un choix, pas une mesure.

## 28. Ce qui relève d'un CHOIX PRODUIT

⭐ **Quatre, et je ne les prends pas.** Tout le reste, les données permettaient de le trancher.

| # | question | ce qui est mesuré |
|---|---|---|
| **D-019** | **Le plafond ANSES : signal ou plafond ?** | signal (V9) : 9 746/100 000 au-delà de 2,2 g/kg · plafond (V9dur) : 0 |
| **D-020** | **La zone IMC 25-30 : jusqu'où assouplir le déficit ?** | V9 y autorise > 500 kcal — 5 616/100 000 en corpus C |
| **D-021** | **Faut-il livrer l'apprentissage, sachant qu'il exige le journal alimentaire ?** | sans journal à 50 %, V9 ≡ V8 sur la cible. *L'apprentissage ne sert que ceux qui notent.* |
| **D-022** | **Le journal alimentaire doit-il devenir plus incitatif ?** | c'est la condition de tout le §11. ⛔ Et ça touche à la Constitution (P4 : optionnelle, jamais bloquante) — **ce n'est pas à moi de l'ouvrir** |

## 29. Fichiers qui seraient modifiés après GO

| fichier | quoi | ampleur |
|---|---|---|
| `state.js` | `macrosForKcal`, `_autoKcalBrut`, `autoKcal`, `calcMacros` + les fonctions d'apprentissage | ~330 lignes |
| `tracking.js` | exposer `penteKgParSemaine` au moteur (elle existe déjà) | ~5 lignes |
| `screens.js` | affichage des signaux, de la plausibilité, de l'explication, du conflit de cible | ~60 lignes |
| `index.html` · `style.css` | le bandeau de signal et la carte « ce que l'app a appris de toi » | ~30 lignes |
| `app.js` | `_resteDuJour` : comparer à la cible **de la période**, pas à celle d'aujourd'hui | ~10 lignes |
| `tests/parcours/nutri_v9.js` | bloc B-CCCLIV **branché** | nouveau |
| `tests/donnees/runner.js` | classer `level` (aujourd'hui non transmis, R4a) | 1 ligne |

⛔ **Ni `coach.js`, ni `Code.js`, ni `worker.js`, ni `log.js`, ni `constants.js`.**
⛔ **Aucun moteur parallèle** : `macrosForKcal` reste propriétaire unique (R2).

## 30. Plan d'implémentation si GO

⛔ **Aucune estimation en semaines** — le brief l'interdit, et il a raison.
**Ce qui est mesuré** : banc complet **35 s** (miroir 1,3 s · corpus A 7,2 s · B 15,9 s ·
C 7,8 s) · 63 témoins **< 1 s** · 31 mutations **~5 min** · la **passe produit complète du dépôt
dure ~25 minutes** et devra être relancée entière.

**[C] L'ordre que je défends**, chaque étape livrable et testable seule :
1. **la fermeture + le conflit de cible manuelle** — aucune borne scientifique engagée ;
2. **le plancher du métabolisme de repos** — remplace un garde-fou absent, effet mesurable ;
3. **le déficit borné par Alpert** — physiologique, et il donne le bon gradient tout seul ;
4. **les unités protéiques contextuelles** — après l'arbitrage **D-019** ;
5. **la plausibilité glucidique et les signaux** — ils ne changent aucun chiffre, ils expliquent ;
6. **l'apprentissage longitudinal** — en dernier, après **D-021** et **D-022**, parce qu'il ne
   sert qu'aux gens qui tiennent leur journal.

---

## 🎯 MA RECOMMANDATION TECHNIQUE

⭐⭐ **Le résultat le plus important de ce dossier n'est pas V9. C'est ceci :**
***les ~659 g n'étaient pas un défaut de répartition des macros — c'était un TDEE que rien ne
venait corriger.*** V9 le montre en produisant **le même chiffre que V0** (636 contre 629 g) tant
qu'elle n'a pas de données, puis **558 g** une fois qu'elle en a.

👉 **Corollaire, et il est inconfortable** : plafonner les glucides — ce que V6 et V7 faisaient —
aurait **masqué** le vrai problème en le déplaçant vers les lipides. *Michel l'avait annoncé mot
pour mot, et la mesure lui donne raison.*

⛔ **Je ne recommande donc PAS de livrer V9 d'un bloc.** Les étapes 1 à 3 ci-dessus sont
défendables seules et corrigent de vrais défauts. Les étapes 4 à 6 dépendent d'arbitrages qui ne
m'appartiennent pas.

⚠️ **Et si 659 g est cohérent, je le dis : il l'est**, pour un homme de 85,8 kg dont l'app croit
qu'il dépense 3 515 kcal. **La question n'a jamais été le chiffre. C'était : dépense-t-il
vraiment 3 515 kcal ?** — et jusqu'à aujourd'hui, Force Tracker n'avait aucun moyen de le savoir.

---

**V9 EST UNE CANDIDATE EXPERIMENTALE NON SERVIE.
FORCE TRACKER DOIT ESTIMER, OBSERVER, APPRENDRE ET S'ADAPTER.
AUCUNE MODIFICATION DU MOTEUR NUTRITIONNEL N'A ETE PUBLIEE.
EN ATTENTE DU GO DE MICHEL.**
