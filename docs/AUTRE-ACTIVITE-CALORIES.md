# 🚶 « Autre activité » + calories personnalisables (cardio ET autre activité)

> **Mission critique de Michel, 05/11/2026** — session-C (Claude N°2, Séance). Branche `claude/dreamy-bell-pu88ia`, repartie de master `e2b942f3` (`ft-v1263`).
> ⛔ **NON FUSIONNÉ · NON PUBLIÉ · AUCUN DÉPLOIEMENT · `Code.js` NON TOUCHÉ · aucun numéro de version** (`sw.js` reste `ft-v1263`).
> Ce document est la **mémoire** du chantier : l'audit (§2-3), la conception (§4), les décisions (§5), les tests (§6), les compteurs R17 (§7), les limites (§8).
> Il est écrit **avant** le code et complété à chaque étape ; l'état final est dans §9.

## 1. Ce que Michel demande (résumé fidèle)

**A — « Autre activité »** : une vraie tuile **juste sous « Programme »**, distincte de « Séance libre » et du cardio. Marche, marche sportive, randonnée, balade, vélo loisir / sportif, course à pied… (liste ouverte). Champs : type, date, heure (si pertinent), durée, distance (facultative), intensité (facultative), calories estimées **et personnalisables**, notes. Créer · consulter · modifier · supprimer. **Aucune série, répétition, charge ni volume.**

**B — Mécanisme commun des calories (cardio existant + autre activité)** : FT calcule une **estimation**. La personne peut **saisir une valeur** (montre Garmin) qui **la REMPLACE — jamais additionnée** (cardio estimé 145 → Garmin 115 → retenu **115** ; marche estimée 300 → 255 → retenu **255**). Calories d'**activité** seulement (hors métabolisme de repos). On distingue : estimée · manuelle · retenue · origine · mode de calcul · statut de remplacement. Une seule valeur **retenue** pour tout agrégat ; modifiable après coup ; retour à l'estimation possible ; absent ≠ zéro ; **changer le poids actuel ne recalcule jamais une valeur déjà enregistrée**.

**Intégration transversale + bilans hebdo/mensuels rétroactifs** (musculation / cardio / autres, calories par catégorie + total, séries et volume pour la musculation seulement) · **jeu étalon** : 02/11 muscu 410 · 04/11 muscu 365 + cardio 379 · 05/11 muscu 303 → muscu 1 078 + cardio 379 = **1 457** ; 3 séances muscu, 1 activité cardio, 3 jours ; marche 255 → **1 712** ; suppression → **1 457** ; édition à 200 → **1 657**.

**Interdits** : toucher le travail de Claude N°1 · fusionner · déployer · migration destructive · modifier arbitrairement les formules de Nutrition / récupération / MET.

## 2. Audit — faits établis (OBSERVÉS dans le code ou MESURÉS), avec preuves

| # | Constat | Preuve |
|---|---|---|
| F1 | Le cardio **n'est pas une entité** : c'est un bloc `cardio` (après) / `cardioAvant` `{type, intensity, duration (min)}` **dans** un enregistrement de `S.sessions`. Un « cardio seul » = enregistrement `exs:[]` + bloc cardio. **Son `progLabel` est `''`** (la prémisse « `progLabel:'Cardio'` » du brief est inexacte : « Cardio » n'est qu'un libellé d'affichage). | `app.js:44-62`, `log.js:5084`, `log.js:190`, `setup.js:2013-2015` |
| F2 | Les calories d'une séance sont **persistées à l'enregistrement** : `sess.calories` + `sess.calData` (`_calDataSeance`, `log.js:5047` = moteur gelé `calcSessionCalories` + `calcCardioKcal` des deux blocs). Elles ne se recalculent pas à l'affichage. Le recalcul n'a lieu qu'à l'**édition** (`_kcalApresEdition`, `setup.js:1818`, règle F21 : seule la variation d'effort s'applique) et par l'outil admin `_recalerAnciennesSeances` (`setup.js:4539`). | idem |
| F3 | `calcCardioKcal` = `MET[type][intensité] × S.bw × durée/60`, **au poids ACTUEL** (`app.js:44-48`). Affichage du détail d'une séance passée = poids du jour (incohérence d'affichage préexistante). | `setup.js:1571-1578` |
| F4 | **Le moteur ajoute un forfait d'échauffement** (≈ 5 min à 3,5 MET) à toute séance : un cardio seul « tapis 45 min » = **362 kcal** (338 de cardio + 24 de forfait). Mesuré : `calcSessionCalories({exs:[]})` → 48. Un type d'activité qui passerait par `_calDataSeance` recevrait ce forfait. | mesure `exp_moteur.js` du 05/11 ; `app.js:800-826` |
| F5 | **Stockage** : un champ **ajouté dans un enregistrement de `S.sessions` traverse tout** (local, Apps Script, restauration, Supabase, sauvegarde Drive, export JSON) — **prouvé par exécution du vrai `Code.js`**. Un **nouveau tableau racine est JETÉ en silence** par le `Code.js` déployé (76 clés nommées, `Code.js:1746-1994`) : pas de cloud, pas de restauration, perte au changement de téléphone. | rapport persistance (exécution `tools/chaos/harness_appsscript.js`) ; précédent `hiddenFoods` |
| F6 | **Tout enregistrement daté vaut « une séance »** pour ~40 lecteurs : aucun ne teste le contenu. Un enregistrement `exs:[]` ne plante rien, il est **compté partout**. | rapports Accueil, Progrès, Milo, Nutrition |
| F7 | **MESURÉ** (expérience `diff_lecteurs.js`, app réelle, 9 marches de 60 min / 255 kcal ajoutées sans garde) : `_weeklyCounts(4)` `[5,3,3,3]` → `[6,5,5,5]` ; **macros : glucides 377 → 371 g, lipides 69 → 72 g** (calories identiques 2 786) ; carte « **Passer en Actif (5-6j)** » apparaît (1,55 → 1,725) ; question de Milo « tu t'entraînes plus que déclaré » apparaît ; bilan du mois 4 → 5 séances ; tuile Nutrition « 303 kcal / Séance » → « **558 kcal / 2 séances** » ; la carte d'historique affiche « 0 kg de travail · — ». | sortie du 05/11, §2 bis |
| F8 | **La cible alimentaire ne contient AUCUNE calorie de séance** (`calcTDEE` = BMR × niveau d'activité + travail + « autre sport » déclaré (+150) + surplus de pas). Verrouillé par `nutri_moteur.js:53` et `nut_punch01.js:159-166`. Le niveau d'activité contient **déjà** l'entraînement (double compte corrigé à ft-v949). | rapport Nutrition ; `state.js:1798` |
| F9 | **Récupération** : le score ne lit ni durée ni calories, mais **toute entrée de `S.sessions` pèse** (pénalité plancher 2, devient « dernière séance » et remet le bonus de repos à zéro, masque `projectionRecup`). Principe écrit : base MET·min, **jamais les kcal** (`tracking.js:3861-3866`). | rapport récupération |
| F10 | **Milo ne reçoit AUCUNE calorie de séance** (`_ligneSeance` lit exercices, `cardio`, `cardioAvant`, `date`, volume). 9 lecteurs côté Milo compteraient un enregistrement `exs:[]` comme une séance. Le bloc personnel du prompt n'a pas de garde de taille vert ; le commun a ≈ 1 126 caractères de marge. | rapport Milo |
| F11 | **Calendrier** : jour actif si ≥ 1 enregistrement porte la date ; couleur = région du **premier** enregistrement du jour (`.find`) → une marche enregistrée **après** une séance masquerait sa couleur ; panneau du jour sans durée ni kcal. | `screens.js:2386`, `2448-2470` |
| F12 | **Pas de point central de rafraîchissement** : chaque appelant rappelle ce qu'il croit utile ; la navigation reconstruit l'écran d'arrivée (`screens.js:127-159`). | rapport Accueil |
| F13 | **Bilans** : `checkWeeklySummary` (lundi, semaine précédente lundi→dimanche) et `_bilanMois` comptent **tout enregistrement** comme « séance » et additionnent `s.calories` (cardio compris) : défaut décrit par Michel, **reproduit à l'identique** (4 séances, 3 jours, 49 séries, 26 005 kg, 1 457 kcal). | `baseline_bilans.js` |
| F14 | Outil admin `_recalerAnciennesSeances` réécrit (×1,55) `calories` de **tout** enregistrement non horodaté (sauf `calData.cardio`) : il réécrirait une valeur saisie. | `setup.js:4539-4560` |
| F15 | Import d'historique : conflit **par date seule** (`log.js:8539-8541`), « remplacer » supprime le **premier** enregistrement du jour (`8676-8677`) → pourrait supprimer une activité. | rapport Progrès |
| F16 | **Apple Santé** : intégration **indirecte** seulement (raccourci iOS → `pushHealth` → `S.healthInbox` → « Utiliser » rattache à un bloc cardio, **calories de la montre ignorées**). Aucun HealthKit / Capacitor dans le code. Non modifiée ici. | `setup.js:1366-1433`, `Code.js:2501-2596` |
| F17 | `dashboard.js` (page PC) recalcule les calories de **toute l'année** au poids d'aujourd'hui avec le moteur ; lit des clés cardio qui n'existent pas (`cardioPre`, `.min`). | `dashboard.js:249-266, 416-423` |
| F18 | Deux aides **fausses** disent que le cardio « s'ajoute au TDEE » (`coach.js:8532`, `screens.js:370`) — le code ne le fait pas (relevé F13 du chantier commun). | rapport Nutrition |

### 2 bis — Mesure « avant » du défaut des bilans (jeu étalon, app réelle, 05/11)

```
BILAN DU MOIS (2026-11) : 🏋️ Séances 4 | 📅 Jours d'entraînement 3 | 🔢 Séries de travail 49 | 📦 Volume 26 005 kg | 🔥 Calories 1 457 kcal
BILAN DE LA SEMAINE (lundi 9/11) : 🏋️ Séances 4 | 📦 Volume total 26005 kg | 🔥 Calories 1457 kcal
```

## 3. Matrice de dépendances et d'impacts (24 composants + dépendances trouvées en plus)

Légende décision : **EXCLURE** = l'activité « autre » n'entre pas (sorties **identiques à l'octet** pour toute donnée existante) · **INCLURE** = elle entre, classée · **ADAPTER** = comportement à changer.

| # | Composant | Existe ? | Fonctions / lignes clés | Lit | Écrit | Décision | Risque de régression | Tests |
|---|---|---|---|---|---|---|---|---|
| 1 | Création de séances | oui | `#log-avant` `index.html:627` ; `openExPicker`, `openProgModal` | — | `S.wkt` | **ADAPTER** : 3ᵉ tuile sous « Programme » | décalage de ~76 px de l'écran Séance (bouton « + » à mesurer, règle #9) | C-ACT tuile + mesure du « + » |
| 2 | Séances libres | oui | `finishWorkout` `log.js:5063` | `S.wkt` | `S.sessions` | inchangé | nul | bancs Séance voisins |
| 3 | Séances de programme | oui | `editProg`, `_cardioVersWkt` | programmes | `S.wkt` | inchangé | nul | idem |
| 4 | Cardio intégré (blocs) | oui | `app.js:27-170`, `setSessCardio` `setup.js:1620` | `S.wkt.cardio*` | `sess.cardio*` | **ADAPTER** : calories estimée / manuelle / retenue | moyen (totaux) | C-KCAL |
| 5 | Cardio autonome | oui (= cardio seul) | `log.js:94-190` | — | `exs:[]` + bloc | **ADAPTER** idem + classification `_genreSeance` | moyen | C-KCAL, C-BIL |
| 6 | Historique | oui | `renderSessions`, `_sessCarteHtml` `setup.js:1915-2059` | `S.sessions` | — | **ADAPTER** : carte « autre », en-têtes « N séances · N cardio · N activités », filtre par genre | moyen | C-HIST |
| 7 | Progrès (synthèse, volume/semaine, exercices) | oui | `_synthConstantes`, `_volumeParMuscle` | `S.sessions` | — | **EXCLURE** (séances) | moyen | C-INV |
| 8 | Accueil | oui | `renderHome` `screens.js:2104`, `_miloMessage` | `S.sessions` | — | tuile « Séances » + carte Milo : **EXCLURE** ; ligne « N activités » : **INCLURE** | moyen | C-INV, C-HOME |
| 9 | Agenda | oui | `_renderHomeCalendar` `screens.js:2348`, `_calDayPanel` | `S.sessions` | — | **INCLURE** (jour actif, liste du jour, kcal) ; couleur de région : **ignorer les « autre »** | moyen | C-CAL |
| 10 | Nutrition | oui | `calcTDEE`, `calcMacros`, `cycleGlucides`, `jourSeance`, `ecartNiveauActivite`, `_weeklyCounts` | `S.sessions` (présence/nombre) | — | **EXCLURE** (aucune formule modifiée ; kcal d'activité jamais ajoutées à la cible) | **haut** (F7) | C-INV (différentiel), nutri_moteur, nut_punch01 |
| 11 | Statistiques quotidiennes | partiel | panneau du jour (calendrier) | idem | — | **INCLURE** dans le panneau du jour | bas | C-CAL |
| 12 | Bilan hebdomadaire | oui | `checkWeeklySummary` `app.js:10207` | `s.calories`, `date` | `S.lastWeekSummary` | **ADAPTER** : catégories | moyen | C-BIL |
| 13 | Bilan mensuel | oui | `_bilanMois` `app.js:10273`, `copyMonthSummary` | idem | — | **ADAPTER** + comparaison à définitions identiques | moyen | C-BIL |
| 14 | Milo | oui | `_ligneSeance`, `_memoireLongue`, `_seancesRecentes` `coach.js` | `S.sessions` | — | séances : **EXCLURE** ; bloc « AUTRES ACTIVITÉS » conditionnel : **INCLURE** | moyen (R34) | C-MILO |
| 15 | Calculs énergétiques | oui | `calcSessionCalories` (gelé), `calcCardioKcal`, `_calDataSeance`, `_kcalApresEdition`, admin recalage | — | `calories`, `calData` | **ADAPTER** (moteur NON touché) | **haut** | C-KCAL, F21 (102), mutations |
| 16 | Récupération | oui | `calcRecoveryDetail` `tracking.js:3962` | `S.sessions` | — | **EXCLURE** (décision de Michel en attente §5) | moyen | C-INV |
| 17 | Stockage local | oui | `persist`/`load` `state.js` | `ft4_sessions` | idem | inchangé (champs dans l'enregistrement) | bas | C-PERS |
| 18 | Persistance / synchro | oui | `_cloudSync` `setup.js:1065`, restauration union `state.js:922` | idem | cloud | inchangé | bas (limite multi-appareils §8) | C-PERS, banc_lot3 |
| 19 | Google Sheets | oui | `_buildSyncRows` `tracking.js:59` | séries faites | — | `exs:[]` ⇒ 0 ligne ; `synced:true` à la création | bas | C-PERS |
| 20 | Apple Santé | indirect | `S.healthInbox`, `utiliserActiviteMontre` | inbox | bloc cardio | **inchangé** | nul | — |
| 21 | Imports / exports | oui | `finalImportHist` `log.js:8620`, `_histoLignes` `setup.js:295`, export JSON `coach.js:8919` | séances | CSV/PDF/JSON | import : garde « autre » ; CSV/PDF : ligne d'activité | moyen | C-EXP, C-IMP |
| 22 | Rapports / PDF | oui | `exportHistoPdf` `setup.js:557` | idem | — | en-tête « N séances · N activités » | bas | C-EXP |
| 23 | Caches / dérivés | oui | `S.registre.facts`, `S.badges`, `_calColorCache` | — | — | registre/badges : **EXCLURE** | bas | C-INV |
| 24 | Réconciliation historique | oui | restauration union, fusion d'onglets, admin recalage | — | — | recalage : **EXCLURE** les « autre » | moyen | C-PERS, C-KCAL |
| + | Badges / séries / niveau auto | oui | `app.js:10039-10113`, `log.js:5551` | `S.sessions` | `S.badges` | **EXCLURE** | moyen | C-INV |
| + | Registre / observations | oui | `computeRegistreFacts` `tracking.js:2354` | idem | `S.registre` | **EXCLURE** | moyen | C-INV |
| + | `dashboard.js` | oui | `:97, 144, 162, 232-266, 318, 416` | idem | — | **EXCLURE** des KPI ; kcal = valeur retenue | bas | C-INV |
| + | Outil admin recalage | oui | `_recalerAnciennesSeances` `setup.js:4539` | `calories` | `calories` | **EXCLURE** les « autre » | haut | C-KCAL |
| + | Backend `Code.js` | oui | `handleSaveProfile_` `:1889`, `nb_seances` `:387` | — | — | **non touché** ; `nb_seances` (admin) comptera les activités | nul | exécution vm |
| + | Tests existants à adapter | — | `B-UXI-F4` (`ux_integration.js:251`) | — | — | réécrit sur l'invariant + mutation | — | M18 |

## 4. Conception (A2)

### 4.1 Où vit une « autre activité »
**Dans `S.sessions`**, comme un enregistrement, avec un **bloc `autre`** — **aucune clé de stockage, aucun champ racine nouveau** (F5 : un tableau racine serait jeté par le serveur déployé ; une dépendance à un redéploiement de `Code.js` ferait perdre des données si l'ordre de mise en ligne était inversé).
```
{ id, ts (= id, numérique, unique), date, startHour?, exs:[], exercises:[], volume:0, uniConv:1, synced:true,
  duration (secondes, compat lecteurs), progLabel:'', calories (= retenue), calData:{total, autre},
  autre:{ type, duration (min), distance?, intensity?, heure?, notes?, kcalEst, kcalPoids, kcalMode, kcalMan? } }
```
### 4.2 Classification (dérivée, jamais stockée pour l'ancien)
`_genreSeance(s)` → `'autre'` si `s.autre` · `'cardio'` si aucun exercice et ≥ 1 bloc cardio de durée > 0 · sinon `'muscu'` (défaut conservateur : tout l'ancien reste « muscu » ou « cardio » exactement comme aujourd'hui).
### 4.3 Calories — une seule règle
Bloc (cardio ou autre) : `kcalEst` = estimation **figée** (recalculée seulement si la personne change type / intensité / durée, avec `kcalPoids` — le poids rangé, jamais le poids du jour) · `kcalMan` = valeur saisie (≥ 0, bornée ; **0 est une saisie, ≠ champ absent**) · **retenue = `kcalMan` si présente, sinon `kcalEst`** · origine déduite · retour à l'estimation = retirer `kcalMan`.
Un bloc **sans** ces champs (tout l'ancien) reste lu comme aujourd'hui : retenue = ce qu'`calcCardioKcal` donnait ; pour l'**affichage** d'un bloc ancien, part proportionnelle de `calData.cardio` rangé (jamais le poids du jour).
`calories` et `calData.cardio|autre` restent les totaux **retenus persistés** que tous les lecteurs lisent déjà → **aucun lecteur n'a à changer pour voir la valeur retenue**.
Cardio **seul** avec une valeur saisie : le forfait du moteur (F4) n'est **pas** ajouté (la valeur de la montre remplace l'activité entière).
### 4.4 Lecteurs
Trois familles (matrice §3) : **EXCLURE** (≈ 30 lecteurs « séance », prédicat unique `_estAutre`), **INCLURE** (historique, calendrier, bilans, Milo dédié, exports), **ADAPTER** (calories). Preuve : test différentiel (`diff_lecteurs.js` → bloc C-INV) qui doit donner **zéro différence** sur toutes les sorties « musculation / nutrition / récupération » quand on ajoute des activités.
### 4.5 Rétroactivité
Les bilans sont **calculés à la volée** depuis `S.sessions` : aucun instantané, **aucune migration, aucune réécriture d'un enregistrement ancien**. Le classement muscu / cardio est **dérivé** de la structure. Part des calories d'un ancien enregistrement : `calories − calData.cardio` (muscu) / `calData.cardio` (cardio) ; ancien enregistrement avec bloc cardio **sans** `calData.cardio` : part cardio **non répartie** — signalée, jamais inventée.

## 5. Décisions

**Prises par défaut (conservatrices, réversibles) — à confirmer par Michel :**
- **D-ACT-1** stockage dans `S.sessions` (F5) · **D-ACT-2** « 0 » saisi = valeur explicite (≠ vide) · **D-ACT-3** les activités n'entrent **dans aucun calcul de cible, de fréquence, de jour de séance ni de récupération** (Nutrition et récupération inchangées à l'octet) · **D-ACT-4** valeur saisie sur un cardio seul : pas de forfait moteur · **D-ACT-5** « activités cardio » = nombre de blocs cardio notés ; « jours actifs » = jours distincts avec ≥ 1 séance **ou** activité.
**En attente de Michel (je ne tranche pas) :**
- **E1** le **barème MET** des types de « Autre activité » (valeurs du Compendium 2024 lues par extraits web, site non joignable depuis le conteneur — voir §6.4) ;
- **E2** une activité doit-elle peser sur la **récupération** (aujourd'hui : non) ;
- **E3** les calories saisies de la montre pour des **séances de musculation** (hors périmètre ici).

## 6. Tests

*(rempli au fil de l'eau — voir §9 pour l'état final)*

## 7. Compteurs R17 (code applicatif seulement)

*(rempli à la clôture)*

## 8. Limites connues, dites

- **Multi-appareils** : le serveur garde « dernier écrivain gagne » sur la liste entière ; un ancien appareil non mis à jour qui rouvre une activité ne comprend pas le bloc `autre` et peut réécrire ses calories avec la logique d'avant. Effet limité par la mise à jour automatique du service worker.
- `nb_seances` (feuille Utilisateurs, `Code.js:387`) comptera les activités : statistique d'administration, non corrigeable sans déploiement.
- L'ancien calendrier / tableau de bord PC (`dashboard.js`) lit des clés qui n'existent pas : préexistant, non corrigé hors guard.
- Le classeur Google (Sheets) n'a jamais reçu les éditions ni les suppressions : inchangé.

## 9. État final

*(rempli à la clôture)*
