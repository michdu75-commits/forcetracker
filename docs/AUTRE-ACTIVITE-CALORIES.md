# 🚶 « Autre activité » + calories personnalisables (cardio ET autre activité)

> **Mission critique de Michel, 05/11/2026** — session-C (Claude N°2, Séance). Branche `claude/dreamy-bell-pu88ia`, repartie de master `e2b942f3` (`ft-v1263`).
> ⛔ **NON FUSIONNÉ · NON PUBLIÉ · AUCUN DÉPLOIEMENT · `Code.js` NON TOUCHÉ · aucun numéro de version** (`sw.js` reste `ft-v1263`). **État : ✅ LIVRÉ SUR BRANCHE** (voir §9).
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
| F19 | **Défaut PUBLIÉ (`ft-v1263`)** : après un export PDF de l'historique réussi, l'app affiche « Export PDF impossible » — `exportHistoPdf` lit `seances`, variable qui n'existe que dans `_histoEntete` (`ReferenceError` attrapée). Le fichier, lui, est bien remis. | sonde sur la version publiée `e2b942f3` ; **corrigé** (`_histoCompte`), témoin `C-ACT-H4`, mutation M42 · `BUGS.md` §141 |
| F20 | Le message de fin de l'export CSV dit « N séries exportées » en comptant aussi les lignes de cardio (préexistant, **non corrigé** ; avec une activité il dit « N lignes »). | `setup.js` `exportHistoCsv` |
| F21 | `banc_ux_integration.js` lancé SEUL : 4 rouges (`B-UXI-G2/G3/G5/G7`, onglets du Coach) **identiques sur la version publiée `e2b942f3` et sur cette branche**, et rouges aussi dans la passe répartie — préexistants, non causés ici. | `outils_act/uxi_base.txt` / `uxi_wt.txt` |
| F22 | **Finir une séance dans un onglet périmé écrase la séance qu'un autre onglet vient d'enregistrer** (version publiée : 1 séance sur le disque au lieu de 2). Cause : `finishWorkout` écrit `ft4_sessions` en direct AVANT `persist()` ; le filet multi-onglets ne s'exécute qu'au début de `persist()`. Les activités n'ont pas ce défaut (`_auAbsorberAutreOnglet`). **NON corrigé** (hors périmètre, cœur de la sauvegarde d'une séance) — proposition d'une ligne, à décider. | sonde à deux onglets · `BUGS.md` §142 · témoin `C-ACT-G7`, mutation M25 |
| F23 | L'écouteur global « trick iOS » (`app.js`, `input` → `defaultValue = value`) aligne `defaultValue` sur chaque frappe : un champ « tapé mais pas validé » ne se détecte PAS par `defaultValue`. Une valeur de montre tapée puis « Enregistrer » touché sans quitter le champ aurait été perdue (mesuré). | sondes ; **corrigé** pour les champs de calories (`kcalValiderChampsEnAttente`, valeur enregistrée `data-kcal-man`), bloc `C-ACT-I`, mutations M43-M47 |
| F24 | Un témoin voisin comparait l'OBJET cardio entier (`B-NP01-A`, `nut_punch01.js`) : le bloc porte maintenant ses calories figées (champs en plus). | seul rouge réel relevé par la passe D-031 ; **témoin ramené à son invariant** (type, intensité, durée) |
| F25 | **Deux témoins piégés par le CALENDRIER** : `PS-E29` (`progres_seances.js`, écart fixe `OFF_DBF = -305` jours) est rouge sur la version publiée depuis le 02/11/2026 jusqu'au 31/12 (la date tombe dans l'année courante, déjà dépliée) ; le bloc CXXX du `runner` (« Ce qu'il te reste » dans le Journal) n'a pas d'horloge figée et rougit le SOIR (après 20 h, Paris — la 1re passe, jouée l'après-midi, était verte). **Non corrigés** (fichiers d'autres sessions) ; propositions : dériver l'écart du calendrier, figer l'horloge. | `base_progres_seances.js.log` (68 OK / 1 rouge sur `e2b942f3`) · `base_reste.log` (rouge à 21 h, vert à midi) · `BUGS.md` §143 |
| F26 | Six autres rouges de la passe répartie, **identiques sur la version publiée** : plantage de `seance_ux.js` au clic « Reprendre » (27 témoins joués), `B-UXI-G2/G3/G5/G7`, `B-FFD-⑧e` (figurines de face). Non causés par ce chantier ; cause non cherchée. | `outils_act/base_seance_ux.js.log`, `uxi_base.txt`, `base_fig_face_dos.js.log` |
| F27 | **Un témoin de SOURCE voisin figeait une écriture, pas un invariant** : `B-CCCXIX ⑥` (`accueil_mini.js`) exigeait la forme `!((S.sessions\|\|[]).length)` pour le silence de l'Accueil. Le chantier la remplace légitimement par `_seancesTrain()` (une marche ne fait pas apparaître de score). **Témoin ramené à son invariant** (les DEUX absences, cherchées dans l'instruction `_sansDonnee` elle-même) ; éprouvé vert / vert / rouge / rouge (ancienne écriture, nouvelle, clause retirée, forme étrangère) ; témoin de comportement `C-ACT-D9`. | passe répartie (1re) · `C-ACT-D9`, M50-M52 |
| F28 | `PS-S3` impose **un seul producteur de carte d'historique** : la première carte d'activité en écrivait un second. Une **enveloppe unique** (`_sessCarteEnveloppe`) sert la séance et l'activité ; la carte d'une séance reste identique à l'octet à la version publiée (SHA-256 de 5 cartes mesuré sur `e2b942f3`). | passe répartie (1re) · `C-ACT-F12`, M49, M53 |
| F29 | **Fenêtre de lecture comptée en ENREGISTREMENTS** : `_repartitionReps` (`coach.js`) prenait les 25 premiers enregistrements de `S.sessions` — des marches récentes chassaient de vraies séances de la répartition des répétitions envoyée à Milo. **Corrigé** (`_seancesTrain()`). | recensement des lectures brutes · `C-ACT-J4` · M54 |
| F30 | **Tableau de bord ordinateur** (`dashboard.html` + `dashboard.js`, page à part) : « 31 séances lues depuis ce navigateur » pour 28 séances et 3 marches ; ses quatre autres gardes (`_dSess`, `_dCal`, `_dBas`, `renderDashBlocs`) n'étaient sous aucun témoin. **Corrigé** + témoin sur la vraie page. | `C-ACT-J7` · M55 |
| F31 | **29 gardes `_seancesTrain()` sur 52 ne tombaient sous aucun témoin** (balayage `tools/mut_sites_garde.py`) et quatre témoins étaient **vacueux** (registre athlète : la fonction ne rend rien ; séance annoncée : aucune annonce dans le jeu ; historique compact de Milo : vide sur 4 séances ; couleur du calendrier : le rouge par défaut est aussi la couleur « haut du corps »). Bloc J, témoin de SOURCE des lectures brutes (81 fonctions classées), quatre témoins renforcés. | `C-ACT-J1` → `J7`, `J30`, `J31` · M38 M39 M20 M18 M54-M62 |

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

### 4 bis. Variables et invariants (livrable de l'audit)

**Variables** — où elles vivent, qui les écrit, qui les lit :

| Variable | Où | Écrit par | Lu par | Règle |
|---|---|---|---|---|
| Type d'activité | `autre.type` | formulaire | historique, bilans, Milo, export, barème MET | ∈ `AUTRE_TYPES` (liste ouverte) ; « autre » porte un libellé libre (`autre.libelle`) |
| Origine | présence de `autre` (activité) · bloc `cardio`/`cardioAvant` (cardio) | création | `_genreSeance` | jamais stockée pour l'ancien : dérivée de la structure |
| Autonome ou complément | une activité est TOUJOURS autonome ; un cardio est un complément de séance, ou un « cardio seul » (`exs:[]` + bloc) | création | `_genreSeance`, bilans | — |
| Durée | `autre.duration` (min) · `duration` (secondes, compat. lecteurs) | formulaire | bilans, historique, Milo, export (colonne `reps`) | entier de 1 à 1 440 |
| Distance | `autre.distance` (km) | formulaire | historique, Milo, export | facultative, 0,1 à 1 000 ; absente ≠ 0 |
| Intensité | `autre.intensity` | formulaire | estimation, historique, Milo | facultative : léger · modéré · intense (« modéré » sinon) |
| Poids | `kcalPoids` (poids de calcul du bloc) | `kcalPoserEstimation` | estimation | **jamais le poids du jour** pour réécrire une valeur déjà enregistrée ; `S.bw` ne sert qu'à une NOUVELLE estimation |
| Calories estimées | `kcalEst` | idem | éditeur, bilans (via retenue) | figée ; recalculée seulement si type / intensité / durée changent |
| Calories manuelles | `kcalMan` | éditeur | idem | absent ≠ 0 ; 0 est une valeur ; borne 10 000 |
| Calories retenues | dérivée `kcalBloc().retenue` ; persistée dans `calories` et `calData.autre` / `calData.cardio` | création, édition | **tous** les lecteurs (déjà ceux d'aujourd'hui) | = saisie si présente, sinon estimation ; jamais la somme |
| Mode de calcul / statut de remplacement | `kcalMode` (`met1`) · `origine` / `remplacee` dérivés | idem | éditeur, carte (✎), Milo | une autre méthode aurait sa propre étiquette |
| Date · heure · fuseau | `date` « AAAA-MM-JJ » **locale** · `autre.heure` « HH:MM » · `startHour` | formulaire | tous | jamais d'UTC ; le fuseau n'est pas stocké : une chaîne de date relue dans un autre fuseau ne bouge pas |
| Identifiant unique | `id` = `ts` (entier) | `_auTsUnique` | UI (`ts‖id`), débrief (`id‖ts‖date`), onglets (`ts‖id`), restauration (`id`) | unique, numérique (le HTML l'injecte sans guillemets), stable à l'édition |
| Statut de sauvegarde · synchro | `synced:true` (rien à envoyer au classeur) · `sessions` complet dans la sauvegarde cloud | `_auPersister` | `_cloudSync`, restauration | écriture locale d'abord, retour arrière si refus |
| Agrégations jour / semaine / mois | calculées à la volée | `_agregatPeriode` | bilans, calendrier | une seule définition, jamais d'instantané |
| Classification statistiques / recommandations | `_genreSeance`, `_seancesTrain()` | — | ~30 lecteurs « séance », bloc Milo | une activité n'est jamais une séance |

**Invariants métiers** (chacun a son témoin ; le contrôle négatif prouve que le témoin sait rougir) :

| # | Invariant | Témoins |
|---|---|---|
| I1 | Une activité ne peut pas être comptée deux fois | `A9` `B4` `B6` `D2` (T24) |
| I2 | Le total des calories = la somme des valeurs retenues des activités comptabilisées ; total = musculation + cardio + autres | `C1` `C4` `F6` |
| I3 | Une marche ne produit ni série, ni répétition, ni charge, ni volume | `A7` `A9` `A30` |
| I4 | Une modification est répercutée dans les agrégats concernés | `A12` `F9` `C10` |
| I5 | Une suppression retire exactement la contribution de l'activité | `A21` `F10` |
| I6 | Modifier l'estimation n'écrase jamais une valeur manuelle validée | `A15` `A16` |
| I7 | Mêmes données sources → mêmes résultats ; lire ne réécrit rien | `C9` `G13` `A10` `H1` |
| I8 | Retenue = saisie si présente, sinon estimation — jamais la somme | `A6` `B3` `B4` `B5` |
| I9 | Une valeur déjà enregistrée ne change pas quand le poids actuel change | `A18` `A19` `G17` |
| I10 | Une activité ne modifie aucune sortie « séance » (Nutrition, fréquence, récupération, badges, registre, programmes) | `D2` à `D5` `D7` `D8` |
| I11 | Absent ≠ zéro | `A25` `A23` `I2` |
| I12 | Un échec d'écriture ne laisse ni perte ni doublon ; une valeur tapée n'est jamais perdue en silence | `G9` à `G12` `I1` à `I4` |
| I13 | Un jour sans activité, une période de musculation seule, un export sans activité, **la carte d'historique d'une séance** sont **identiques à l'octet** à la version publiée | `C7` `H1` `E3` `F12` |
| I14 | Une activité ne chasse jamais une vraie séance d'une FENÊTRE de lecture (12 séances pour le rythme de Milo, 15 pour ses temps de repos, 25 pour la répartition des répétitions) | `J4` |
| I15 | Un compte neuf qui n'enregistre que des activités n'obtient aucun badge, aucune série, aucune observation de Milo, ne monte pas de niveau, garde l'écran Séance « vierge » et le message d'Accueil d'un compte neuf | `J1` `J2` `J3` |
| I16 | **Toute fonction qui lit `S.sessions` en brut est connue et classée** (81 fonctions, 4 familles) ; une nouvelle lecture non classée fait rougir | `J30` `J31` |

**Conflits possibles avec Claude N°1** (candidate `ft-v1264`, branche `origin/integration/nut-publication-2026-11-04`) : fusion à blanc (`git merge-tree`, rien d'écrit) contre la tête `a87cc89d` de la branche de N°1 : aucun conflit de code (`app.js` `coach.js` `constants.js` `screens.js` `setup.js` `state.js` `runner.js` se fusionnent seuls) ; **deux conflits de documentation**, à résoudre en gardant les deux côtés : `docs/JOURNAL-DE-PARTAGE.md` (les lignes de session-C et celles de N°1) et `BUGS.md` (fin de fichier : §126-§129 de N°1, §140-§143 d'ici) ; banc rejoué sur l'arbre fusionné : 130 OK / 1 rouge — le seul rouge est le témoin de source `C-ACT-J30`, qui signale l'unique nouvelle lecture brute de `S.sessions` venue de N°1 (`state.js::_persistRepli`, le repli de stockage plein déplacé hors de `persist()` : famille « persistance ») → une ligne à ajouter à la liste blanche à l'intégration


L'intersection sémantique tient : Nutrition lit les séances (sans les activités, différentiel), Milo reçoit un bloc de plus, la seule ligne que N°1 ajoute sur `S.sessions` est ce repli de stockage (aucun nouveau compteur de séances).

## 5. Décisions

**Prises par défaut (conservatrices, réversibles) — ✅ VALIDÉES par Michel le 08/11/2026** *(D-ACT-1, E1, D-ACT-7 et E4 / D-ACT-4 explicitement ; D-ACT-2, D-ACT-3, D-ACT-5, E2 et E5 partent avec leur défaut — « je valide tes recommandations » ; D-ACT-6 : ordre du 05/11 reconfirmé le 08/11 ; registre : `docs/DECISIONS.md` **D-151** et **D-152**)* :
- **D-ACT-1** — une activité est un **enregistrement de `S.sessions`** portant un bloc `autre` : aucune clé de stockage, aucun champ racine (F5 : un nouveau tableau racine serait jeté par le `Code.js` déployé).
- **D-ACT-2** — « 0 » saisi est une **valeur** (retenue 0), jamais un champ vide ; vider le champ = retour à l'estimation.
- **D-ACT-3** — les activités n'entrent **dans aucun calcul de cible, de fréquence, de jour de séance, de badge, de registre ni de récupération** (Nutrition et récupération inchangées à l'octet : test différentiel, bloc D). Leurs calories ne s'ajoutent jamais à la cible du jour : le niveau d'activité du Profil compte déjà l'entraînement (double compte corrigé à ft-v949), l'ajouter serait le compter deux fois.
- **D-ACT-4** — **un cardio seul vaut la somme de ses blocs retenus.** Le forfait d'échauffement du moteur (≈ 24 kcal à 82 kg, mesuré : « tapis 45 min » = 338 de cardio + 24 de forfait = 362) n'est plus ajouté aux **NOUVEAUX** cardios seuls — avec ou sans valeur de montre. Raison : « une seule valeur retenue pour les agrégations » — sinon l'éditeur dit « retenu 338 » pendant que la carte dit 362, et une valeur de montre de 115 donnerait 139. **Impact mesuré : −24 kcal (−6,6 %) sur un cardio seul de 45 min à 82 kg ; les enregistrements anciens gardent leur total d'origine, forfait compris.** Ce n'est pas un changement du moteur (`calcSessionCalories` est seulement APPELÉ, `CAL_ENGINE=3` inchangé, registre `SEANCE-BK1`) mais un changement d'assemblage du total d'un cardio seul : **à confirmer** — l'alternative est de garder le forfait en mode estimation (la carte dirait 362, l'éditeur 338 : le défaut d'aujourd'hui).
- **D-ACT-5** — définitions du bilan : « séances de musculation » = enregistrements de genre `muscu` ; « activités cardio » = nombre de BLOCS de cardio notés ; « autres activités » = enregistrements de genre `autre` ; « jours actifs » = jours DISTINCTS avec au moins une séance ou une activité (« dont N de musculation ») ; calories par catégorie d'après les valeurs RETENUES rangées, jamais recalculées ; la somme des trois catégories est le total (rien compté deux fois).
- **D-ACT-6** — la **décision L de D-085** (17/10/2026 : « Autre activité » NON construite, piste à étudier) est **REMPLACÉE par l'ordre explicite de Michel du 05/11/2026** (R30) : la tuile existe, 3ᵉ, juste sous « Programme ». Le témoin `B-UXI-F4` et sa mutation M18 qui gardaient l'ABSENCE gardent maintenant la PLACE. ✅ Inscrit au registre le 08/11/2026 : **D-152** (la décision L de `D-085` y est marquée REMPLACÉE).
- **D-ACT-7** — pas de pop-up « Quoi de neuf » (une porte s'ajoute ; la séparation du cardio dans les bilans est un correctif) : point rouge + aide « ? » + aide détaillée + diapo du Guide (sans image : Michel fournit les captures). ✅ Validé par Michel le 08/11/2026 (**D-152**) : pas de pop-up `WHATS_NEW`.

**Décisions de Michel du 08/11/2026 sur ces points (enregistrées : D-151, D-152) :** *E1 ✅ barème MET = estimation indicative, remplaçable par la montre (non vérifié à la source, dit) · E2 ✅ par défaut (aucun effet sur la récupération) · E3 hors lot (reste ouverte) · E4 ✅ validée, avec sa condition · E5 ✅ par défaut (message de l'export CSV inchangé, préexistant).*
- **E1** — le **barème MET** des types de « Autre activité » (marche 3,0 / 3,8 / 4,8 · marche sportive 4,8 / 5,5 / 7,0 · randonnée 4,8 / 6,0 / 7,0 · balade 2,0 / 3,0 / 3,5 · vélo loisir 3,5 / 4,0 / 6,8 · vélo sportif 6,8 / 8,0 / 10,0 · course 6,5 / 8,5 / 11,0 · autre = barème « autre » du cardio). Valeurs du Compendium 2024 **lues dans des extraits de recherche** (le site n'est pas joignable depuis le conteneur) : **non vérifiées à la source**. Aucun MET existant n'est modifié.
- **E2** — une activité doit-elle peser sur le **score de récupération** ? (aujourd'hui : non — la formule, ses plafonds et le principe « base MET·min, jamais les kcal » sont intacts).
- **E3** — les calories saisies de la montre pour des **séances de musculation** (hors périmètre de cette mission).
- **E4** — D-ACT-4 ci-dessus. ✅ **Validée par Michel le 08/11/2026, avec sa condition obligatoire** : la valeur de la montre (calories ACTIVES de la Garmin) **remplace** l'estimation — ni addition, ni double comptage —, se **modifie après l'enregistrement**, et l'on peut **revenir à l'estimation automatique** ; la saisie de **0 kcal** est vérifiée ; la fonctionnalité est **vérifiée sur iPhone AVANT toute publication**. Vérification de la saisie de 0 (08/11) : le formulaire d'activité et le cardio seul la retenaient déjà (témoins `C-ACT-A25`, puis `C-ACT-B20`) ; **un défaut a été trouvé et corrigé** sur une séance de musculation + cardio saisi à 0 (`BUGS.md` §144 : la part cardio n'était pas rangée, le bilan disait « non séparable ») — témoins `C-ACT-B16` à `B20`, mutations M63 / M64.
- **E5** — le **message de fin de l'export CSV** compte encore les lignes de cardio parmi les « séries » (préexistant, non corrigé ; avec une activité il dit « lignes »).

## 6. Tests

**Le banc** — `tests/parcours/autre_activite.js` (blocs `C-ACT-A` → `C-ACT-J`, branché dans le runner et dans `repartition-3.json`), lancé par `node tools/banc_autre_activite.js` ; la matrice T01 → T50 de la mission y est jouée et **produite par l'exécution** (`ACT_MATRICE=<fichier>` écrit ID · scénario · attendu · observé · statut · preuve). Il **conduit** la vraie app (réseau coupé, horloge fixe, de vrais clics et de vraies frappes), **observe** les enregistrements, les agrégats, les textes affichés et les sorties de ~30 lecteurs « séance » avec et sans activités ; il **ne couvre pas** l'iPhone, le réseau et la synchro réels (reprise SIMULÉE par une route coupée puis rétablie, dite telle), le multi-appareils réel (deux onglets d'un même navigateur + les fonctions de fusion + le vrai `Code.js` chargé dans un contexte `vm`), de vraies données de Michel (T50 : BLOCKED).

**Résultat du banc (↪️ 08/11/2026, branche d'intégration : **136 OK / 0 rouge** — les 131 d'origine + 5 témoins du correctif « 0 kcal », `C-ACT-B16` à `B20` ; contrôle négatif **64/64**)** — *résultat d'origine, sur la branche de développement* : **131 OK / 0 rouge** (blocs `C-ACT-A` → `C-ACT-J`) ; matrice : **61 PASS · 1 BLOCKED · 0 NOT RUN · 0 FAIL** sur 62 scénarios (T01-T50, jeu de référence, 11 découverts) ; scénarios SIMULÉS (réseau, second appareil) : T29 T30 T31 ; hors périmètre exécutable : T50..
**Contrôle négatif** `tools/mut_autre_activite.py` (R17 : un test protège un invariant) : **62/62 conformes** (`tools/mut_autre_activite.py` : 61 mutations qui retirent chacune une garde ou réintroduisent un défaut — chacune exige que SON témoin tombe — et 1 équivalente qui doit rester verte ; arbre sain 0 rouge avant et après la campagne). Trois de ses mutations jouent, au lieu du banc, la fonction `source` d'un module VOISIN (`accueil_mini.js`, `progres_seances.js`) : c'est ainsi qu'un témoin voisin ré-aimé par ce chantier est éprouvé.
**Balayage des gardes** : **54 sites de garde sur 54 protégés** (`tools/mut_sites_garde.py` : chaque garde `_seancesTrain()` est retirée à son tour dans une copie ; blocs D,E,F,J). Avant le bloc J, 29 des 52 sites alors recensés ne tombaient sous aucun témoin. Il a démasqué ce que les 53 premières mutations ne voyaient pas : des gardes qu'aucun témoin ne protégeait (badges, série de jours, niveau, observations de Milo, écran Séance, message de l'Accueil, fenêtres de Milo, tableau de bord ordinateur) — d'où le **bloc J** du banc (un compte neuf à qui l'on ajoute 120 marches ; 14 marches « en semaine, le matin » ; un compte établi dont les fenêtres de lecture ne doivent pas se remplir d'activités ; la corrélation poids / séance ; la ligne des pas ; la page `dashboard.html`) et un **témoin de SOURCE** (`C-ACT-J30` / `J31`) : toute fonction qui lit `S.sessions` sans passer par `_seancesTrain()` doit être classée (81 fonctions, 4 familles, avec la raison) ou fait rougir. **Deux défauts réels** en sont sortis et sont corrigés : la répartition des répétitions de Milo prenait les 25 premiers *enregistrements* (des marches récentes chassaient de vraies séances de sa fenêtre) et la page du tableau de bord ordinateur annonçait « 31 séances lues » pour 28 séances et 3 marches. Quatre témoins étaient en outre **vacueux** (ils comparaient deux sorties vides : registre athlète, séance annoncée, historique compact de Milo, couleur du calendrier) : renforcés, chacun a maintenant sa mutation.
**Non-régression** : D-031 répartie (`tools/passe_repartie.py 3`) : **8 363 ✅ / 8 ❌** (équivalent séquentiel 8 325 ✅ ; 47.7 min ; arbre testé `d168d8a5`) — **passe NON « valide »** : les 8 ❌ sont TOUS déjà rouges sur la version publiée `e2b942f3` (preuves ci-dessous), **0 rouge nouveau**. 1re passe (sur `72cb2867`) : 8 347 ✅ / 10 ❌, dont 3 causés par ce chantier, corrigés puis rejoués.
⚠️ **Cette passe n'est PAS « valide » au sens des 8 conditions** (des rouges et un module planté : ②, ⑤, ⑥) — elle ne donne donc aucun feu vert de publication. Elle dit autre chose, et c'est mesuré : **aucun des rouges qui restent n'est causé par ce chantier** (chacun est rouge à l'identique sur la version publiée `e2b942f3`, journal de preuve en regard). La passe classique `tools/passe_valide.sh` (≈ 96 min) n'a **pas** été rejouée : R1 l'exigerait avant toute publication (le runner et la répartition sont touchés), c'est à l'intégrateur de la lancer.
`check_regles.py` : seule alerte = `DOSSIER-ATHLETE-SUIVI.md` « tableau des 8 briques périmé », **identique sur la version publiée** (préexistant).

| Rouge relevé par la passe | 1re passe | passe finale | Origine | Ce qu'on en a fait |
|---|---|---|---|---|
| `ft-v1057 ne convertit AUCUN champ entier` (module `runner`) | ❌ | ✅ | ce chantier | le champ Durée de l'activité était `type="text"` → `type="number"` ; témoin `C-ACT-A31`, mutation M48 |
| `PS-S3` « UN seul producteur de carte d'historique » | ❌ | ✅ | ce chantier | la carte d'activité écrivait sa propre balise → UNE enveloppe `_sessCarteEnveloppe` ; carte d'une séance identique à l'octet à la version publiée (`C-ACT-F12`, M49, M53) |
| `B-CCCXIX ⑥` (silence de l'Accueil, `accueil_mini.js`) | ❌ | ✅ | ce chantier | témoin de SOURCE ramené à son invariant (les DEUX absences), éprouvé vert/vert/rouge/rouge ; témoin de comportement `C-ACT-D9` ; M50-M52 |
| `PS-E29` (`progres_seances.js`) | ❌ | ❌ | préexistant | témoin piégé par la DATE (écart de −305 jours), rouge sur le code publié depuis le 02/11/2026 — `BUGS.md` §143 ; non corrigé (fichier d'une autre session) |
| plantage de `seance_ux.js` (27 témoins joués) | ❌ | ❌ | préexistant | même plantage (`page.click` : délai dépassé, bouton « Reprendre ») sur la version publiée ; cause non cherchée |
| `B-UXI-G2` · `G3` · `G5` · `G7` (onglets du Coach) | ❌ | ❌ | préexistant | 4 rouges, identiques sur la version publiée (`banc_ux_integration.js` seul) |
| `B-FFD-⑧e` (figurines de face, `fig_face_dos.js`) | ❌ | ❌ | préexistant | même rouge sur la version publiée ; cause non cherchée |
| « Ce qu'il te reste » présent dans le Journal (bloc CXXX du runner) | ✅ (jouée l'après-midi) | ❌ | préexistant | témoin SANS horloge figée : rouge le SOIR (après 20 h, Paris) sur la version publiée aussi, vert à midi — `BUGS.md` §143 ; la 1re passe, jouée l'après-midi, ne le voyait pas |

Preuves des rouges préexistants (sorties conservées hors dépôt) : `base_progres_seances.js.log` (68 OK / 1 rouge sur `e2b942f3`), `base_seance_ux.js.log`, `uxi_base.txt`, `base_fig_face_dos.js.log`, `base_reste.log` (rouge à 21 h, vert à midi).

**Compatibilité avec la candidate `ft-v1264` de Claude N°1** (`origin/integration/nut-publication-2026-11-04`) : fusion à blanc (`git merge-tree`, rien d'écrit) contre la tête `a87cc89d` de la branche de N°1 : aucun conflit de code (`app.js` `coach.js` `constants.js` `screens.js` `setup.js` `state.js` `runner.js` se fusionnent seuls) ; **deux conflits de documentation**, à résoudre en gardant les deux côtés : `docs/JOURNAL-DE-PARTAGE.md` (les lignes de session-C et celles de N°1) et `BUGS.md` (fin de fichier : §126-§129 de N°1, §140-§143 d'ici) ; banc rejoué sur l'arbre fusionné : 130 OK / 1 rouge — le seul rouge est le témoin de source `C-ACT-J30`, qui signale l'unique nouvelle lecture brute de `S.sessions` venue de N°1 (`state.js::_persistRepli`, le repli de stockage plein déplacé hors de `persist()` : famille « persistance ») → une ligne à ajouter à la liste blanche à l'intégration


L'intersection sémantique tient : Nutrition lit les séances (sans les activités, différentiel), Milo reçoit un bloc de plus, la seule ligne que N°1 ajoute sur `S.sessions` est ce repli de stockage (aucun nouveau compteur de séances).

### Matrice des tests (ID · scénario · attendu · observé · statut · preuve)

Statuts : PASS / FAIL / BLOCKED / NOT RUN seulement. « (simulé) » = ne remplace pas une validation réelle. Les identifiants de preuve sont les témoins `C-ACT-*` du banc ; le fichier complet (attendus et observés détaillés) est produit par `ACT_MATRICE=<fichier> node tools/banc_autre_activite.js`.

| ID | SCÉNARIO | RÉSULTAT ATTENDU | RÉSULTAT OBSERVÉ | STATUT | PREUVE |
|---|---|---|---|---|---|
| T01 | Cardio avec estimation automatique | tapis modéré 45 min à 82 kg : estimation 338, retenu = estimation | éditeur « ≈ 338 · retenu 338 » ; enregistré 338, bloc figé, aucune série | PASS | banc B1 B2 |
| T02 | Cardio avec calories personnalisées | estimé 145, montre 115 → retenu 115 | 145 affiché, 115 retenu, total 115 (ni 260, ni 139) | PASS | banc B3 B4 I3 |
| T03 | Autre activité avec estimation automatique | tuile sous « Programme » ; 60 min de marche estimées | tuile 3ᵉ collée à Programme ; 312 kcal (3,8 MET × 82 kg) ; exs=[] volume 0 | PASS | banc A2-A5 |
| T04 | Autre activité avec calories personnalisées | estimé 300, montre 255 → retenu 255 | 300 / 255 / retenu 255 (jamais 555) ; valeur tapée sans quitter le champ lue | PASS | banc A6 A7 B5 I1 |
| T05 | Modification de calories après enregistrement | modifier les calories après coup | 255→200 : total 1 657, même identifiant ; ancien cardio 379→300 | PASS | banc A12 B11 F9 G17 I4 |
| T06 | Modification de durée après enregistrement | durée : estimation suit, valeur de montre gardée | 60→30 sans saisie : 156 ; avec 255 : gardée ; ancien cardio ×2 sans saisie : 734 = version publiée | PASS | banc A14 A15 B13 B14 |
| T07 | Modification d'intensité après enregistrement | intensité / type : estimation suit, valeur de montre gardée | intense : 590 ; vélo sportif : 656 ; valeur 255 conservée | PASS | banc A16 A17 |
| T08 | Suppression d'une activité | suppression confirmée, retour exact | deux clics ; retour à 1 457 ; persisté ; depuis l'historique aussi | PASS | banc A20-A22 F10 |
| T09 | Plusieurs activités le même jour | plusieurs activités le même jour | 3 lignes distinctes, total du jour 1 038 (303+255+400+80) | PASS | banc F1 |
| T10 | Musculation + cardio le même jour | muscu + cardio le même jour | 04/11 : muscu 365 + cardio 379 = 744 | PASS | banc B9 |
| T11 | Musculation + autre activité le même jour | muscu + autre le même jour | panneau : 3 activités + 16 séries de muscu seules | PASS | banc F1 F2 |
| T12 | Cardio + autre activité le même jour | cardio + autre le même jour | 300 + 900 = 1 200 | PASS | banc F3 |
| T13 | Musculation + cardio + autre activité | muscu + cardio + autre | 365 + 379 + 200 = 944 | PASS | banc F3 |
| T14 | Cardio ajouté à une séance de musculation | cardio ajouté à la muscu | part cardio = 200 exactement ; remplacer 226 par 200 retire 26 ; agrégat 426 | PASS | banc B6-B8 |
| T15 | Activité autonome sans musculation | activité autonome sans muscu | jours 4 / jours de muscu 3 ; 49 séries inchangées | PASS | banc A30 |
| T16 | Consultation de l'historique | consulter l'historique | 6 cartes propres (ni « kg de travail » ni bouton Milo) ; filtres 6 / 3 / 2 ; 11 en tout | PASS | banc F7 F8 |
| T17 | Modification d'une ancienne activité | ancienne activité / ancien cardio | 255 · 342 · 90 kg conservés ; durée → 171 au poids rangé | PASS | banc B11 G17 |
| T18 | Bilans hebdomadaires | bilans hebdo par catégorie | 3 muscu · 1 cardio · 1 autre · 1 712 (dont 1 078 / 379 / 255) ; sans marche : 1 457 | PASS | banc C1-C3 |
| T19 | Bilans mensuels | bilans mensuels + comparaison | idem ; vs octobre : 2 séances (+1), volume +1 200 %, activités exclues | PASS | banc C4-C6 |
| T20 | Recalcul rétroactif | rétroactivité sans réécrire | ancien historique : 1 000 / 450 / 1 450 ; 1 part cardio non rangée SIGNALÉE ; octets identiques | PASS | banc C8 C9 |
| T21 | Cohérence Accueil / Progrès / Agenda | cohérence Accueil / Progrès / Agenda | bilan 4 492 = 1 078 + 679 + 2 735 ; tuile « 5 +6 act. » | PASS | banc F6 |
| T22 | Cohérence avec Nutrition | cohérence Nutrition | TDEE, macros, écran identiques avec et sans 9 activités | PASS | banc D2 D3 |
| T23 | Cohérence avec Milo | cohérence Milo | contexte moins le bloc = contexte sans activité, à l'octet (78 836 car.) ; fenêtres de Milo (rythme 12 séances, répétitions 25, repos 15) et ligne des pas inchangées ; 14 marches en semaine ne fabriquent aucune observation | PASS | banc E1-E7 J3 J4 J6 |
| T24 | Absence de double comptage énergétique | aucun double comptage | +255 → 1 712 une fois ; cible inchangée ; cardio 115, pas 260 | PASS | banc A9 B4 B6 D2 |
| T25 | Changement de poids utilisateur | changement de poids | 82→95 kg : 312 inchangé ; édition au poids rangé (623, pas 722) | PASS | banc A18 A19 |
| T26 | Redémarrage de l'application | redémarrage | après rechargement : activité et 1 712 | PASS | banc A10 |
| T27 | Fermeture pendant une sauvegarde | fermeture pendant la sauvegarde | fermé aussitôt : activité là (mémoire + stockage) ; nuage repris à la réouverture | PASS | banc G1 |
| T28 | Fonctionnement hors connexion | hors connexion | créer / modifier / supprimer sans réseau | PASS | banc G2 |
| T29 | Reconnexion et synchronisation | reconnexion et synchro | l'activité part intacte (Apps Script + miroir) ; vrai Code.js la range à l'identique | PASS (simulé) | banc G3 G4 |
| T30 | Gestion des conflits de synchronisation | conflits de synchro | union sans doublon ; conflit signalé ; limite du serveur mesurée | PASS (simulé) | banc G5 G6 |
| T31 | Modification sur plusieurs appareils | plusieurs appareils | 2 onglets : les deux activités survivent ; dernier écrivain gagne | PASS (simulé) | banc G7 G8 |
| T32 | Gestion des dates et fuseaux horaires | dates et fuseaux | LA 23 h 30 = 05/11 ; Auckland 00 h 30 = 06/11 ; Paris→Auckland reste le 05 | PASS | banc C16 C17 |
| T33 | Passage entre deux semaines | passage de semaine | dimanche 23 h 30 dans la semaine ; lundi 00 h 10 dans la suivante | PASS | banc C10 C11 |
| T34 | Passage entre deux mois | passage de mois | 31/10 → octobre (80) ; 01/11 → novembre (40) | PASS | banc C12 |
| T35 | Passage entre deux années | passage d'année | une semaine, deux mois, deux années | PASS | banc C13 |
| T36 | Gestion des changements d'heure | changement d'heure | 3 identifiants distincts le 25/10 ; 29/03 reste daté du 29 | PASS | banc C14 C15 |
| T37 | Conservation des anciennes données | anciennes données conservées | anciens enregistrements identiques à l'octet (disque + mémoire) ; brouillon ancien = même total | PASS | banc C9 G13 B15 |
| T38 | Absence de régression des séances existantes | pas de régression séances | lecteurs de séances identiques (différentiel) ; séance annoncée / manquée inchangée par une marche ; modules séance de la passe | PASS | banc D4 D10 + passe |
| T39 | Absence de régression des programmes | pas de régression programmes | programmes et planification identiques ; séance libre normale | PASS | banc D4 D8 + passe |
| T40 | Absence de régression Nutrition | pas de régression Nutrition | différentiel Nutrition + `nut_punch01` 36/0 + modules Nutrition de la passe (aucun des 8 rouges ne les touche) | PASS | banc D2 D3 + passe |
| T41 | Absence de régression des statistiques | pas de régression statistiques | constantes, volume, registre (enfin LU), badges, récupération, poids / séance et tableau de bord ordinateur identiques | PASS | banc D5 D7 J5 J7 + passe |
| T42 | Cohérence des exports et rapports concernés | exports et rapports | CSV sans activité = octet pour octet (SHA-256) ; ligne ACTIVITE ; PDF et JSON ; message PDF corrigé | PASS | banc H1-H6 |
| T43 | Création, modification et suppression répétées | créer / modifier / supprimer en boucle | 9 + 3 + 2 gestes : état = modèle, aucun doublon | PASS | banc A28 |
| T44 | Valeur manuelle absente, nulle ou invalide | valeur absente, nulle, invalide | absente = estimation ; « 0 » = valeur ; 7 formes invalides refusées ; virgule OK | PASS | banc A23-A25 I2 |
| T45 | Retour de la valeur manuelle à l'estimation | retour à l'estimation | kcalMan retiré (≠ 0) ; ancien cardio : retour à 379 | PASS | banc A13 B12 |
| T46 | Échec de sauvegarde et nouvelle tentative | échec de sauvegarde et nouvelle tentative | stockage plein simulé : rien d'écrit, formulaire gardé, message ; retry OK | PASS | banc G9-G12 |
| T47 | Absence de perte ou de duplication après échec | ni perte ni doublon après échec | création, modification, suppression : état d'avant puis une seule application | PASS | banc G9-G12 |
| T48 | Rafraîchissement de tous les écrans concernés | rafraîchissement des écrans | modifier / supprimer depuis l'historique : carte, calendrier, bilan, tuile suivent | PASS | banc F9 F10 |
| T49 | Intégrité des identifiants et références | identifiants et références | id = ts entier unique ; union par id ; deux onglets ; routage vers le bon formulaire | PASS | banc A8 G6 G8 G16 |
| T50 | Vérification des calculs sur données réelles | calculs exacts sur les séances réelles de Michel | aucun export réel de S.sessions accessible (Drive : 0 fichier) | BLOCKED | recherche Drive |
| T-ref | Jeu de référence de la mission | muscu 1 078 · cardio 379 · total 1 457 · 3 séances · 1 cardio · 3 jours ; +marche 255 → 1 712 ; suppression → 1 457 ; 255→200 → 1 657 | identique (muscu 1 078, cardio 379, autres 255 ; 1 712 / 1 457 / 1 657) ; 49 séries et 26 005 kg inchangés | PASS | banc A1 A9 A12 A21 |
| D01 | découvert : l'import d'historique « remplacer » ne supprime jamais une activité du même jour (F15) | import d'historique ne supprime pas une activité | « Remplacer » retire la séance, pas l'activité de 20 h 30 | PASS | banc G14 |
| D02 | découvert : l'outil admin de recalage (×1,55) ne réécrit jamais une activité (F14) | outil admin de recalage | activités intactes ; la muscu non chronométrée, elle, est recalée | PASS | banc G15 |
| D03 | découvert : un bilan de musculation SEULE garde exactement son ancien texte | bilan de muscu seule inchangé | semaine, mois, partage identiques à la version publiée à l'octet | PASS | banc C7 |
| D04 | découvert : la couleur du calendrier n'est pas masquée par une activité enregistrée après la séance (F11) | couleur du calendrier | région de la muscu gardée malgré une balade à 20 h 30 (jour de jambes violet compris) ; jour d'activité neutre | PASS | banc F4 F5 F13 |
| D05 | découvert : badges, registre, niveau automatique : aucune activité n'est comptée comme une séance (F6) | badges, registre, niveau | une marche ne débloque pas « 10 séances » ; compte neuf + 120 marches : aucun badge, série ni niveau ; l'Accueil reste muet | PASS | banc D5 D7 D9 J2 |
| D06 | découvert : cardio seul avec valeur de la montre : pas de forfait d'échauffement ajouté (F4, D-ACT-4) | cardio seul + montre : pas de forfait | 115 exactement (pas 139) | PASS | banc B4 |
| D07 | découvert : un bloc cardio ANCIEN reste affiché à sa valeur rangée, jamais au poids du jour (F3) | ancien bloc au poids rangé | détail ancien cardio : 379 rangé, pas 338 | PASS | banc B10 |
| D08 | découvert : limites de saisie : durée 1-1440, distance, date non future, heure valide | limites de saisie | durée 0/1 441, date future, distance 0/1 000,5/« abc » refusées ; 1 440 min et 1 000 km passent | PASS | banc A4 A26 A27 |
| D09 | découvert : la valeur « 0 kcal » saisie est une valeur (≠ champ vide) | 0 kcal est une valeur | retenu 0, kcalMan 0 ≠ vide | PASS | banc A25 |
| D10 | découvert : l'historique : filtre « Activités », compteurs, aucune ligne « 0 kg de travail », aucun bouton d'analyse muscu | cartes d'historique | ni « kg de travail » ni bouton d'analyse ; la carte d'une séance reste identique à l'octet | PASS | banc F7 F12 |
| D11 | découvert : un enregistrement d'activité venu d'ailleurs, sans estimation figée, garde sa valeur rangée quand on le rouvre puis l'enregistre | enregistrement étranger sans estimation figée | valeur rangée 250 conservée à la réouverture | PASS | banc G18 |


## 7. Compteurs R17 (code applicatif seulement ; base = master `e2b942f3`)

| Compteur | Valeur |
|---|---|
| Données persistées ajoutées | **0 clé de stockage, 0 champ racine de `S`.** Dans les enregistrements EXISTANTS de `S.sessions` : **1 bloc `autre`** (type, duration, distance?, intensity?, heure?, libelle?, notes?, kcalEst, kcalPoids, kcalMode, kcalMan?) et **4 champs sur les blocs cardio** (`kcalEst`, `kcalPoids`, `kcalMode`, `kcalMan`) |
| Fichiers applicatifs touchés | **10** (`app.js` `coach.js` `constants.js` `dashboard.js` `index.html` `log.js` `screens.js` `setup.js` `state.js` `tracking.js`) ; **0 créé** ; `style.css`, `sw.js`, `Code.js`, `clone/` non touchés |
| Lignes ajoutées − retirées | **+893 − 130 = +763** (10 fichiers servis) (le dépôt documente largement dans le code : une grande part est du commentaire d'explication) |
| Anciens chemins supprimés / fusionnés | **4 fusionnés, 0 supprimé** : (1) trois calculs des calories d'un bloc cardio → `kcalBloc` (un propriétaire) ; (2) le bilan de la semaine, celui du mois et leur comparaison, qui comptaient chacun à leur façon, → `_agregatPeriode` ; (3) trois éditeurs de calories (séance en cours, détail, formulaire) → `_kcalEditeurHtml` ; (4) les comptes d'un export (en-tête du PDF, message de fin) → `_histoCompte` |

Garde-fous du dépôt : `tests/donnees/runner.js` (R4a) non déclenché (aucun champ de `S` ajouté) ; `python3 tools/check_regles.py` rejoué (une seule alerte, préexistante) ; `tools/inventaire.py` **à relancer à l'intégration** (fichier généré que les deux branches modifient : ne pas le régénérer ici évite un conflit de plus).

## 8. Limites connues, dites

- **Multi-appareils** : le serveur applique « dernier écrivain gagne » à la liste ENTIÈRE des séances (mesuré avec le vrai `Code.js`, témoin `C-ACT-G5`, et par le banc de chaos `M1a`) : la sauvegarde périmée d'un 2ᵉ appareil qui n'a jamais vu l'activité l'efface du classeur ; la restauration par union de l'app la rattrape ; une SUPPRESSION n'est pas propagée par la restauration (elle revient) — comme pour toute séance. Un ancien appareil non mis à jour qui rouvre une activité ne comprend pas le bloc `autre`.
- `nb_seances` (feuille Utilisateurs, `Code.js:387`) comptera les activités : statistique d'administration, non corrigeable sans déploiement.
- Le tableau de bord ordinateur (`dashboard.html` + `dashboard.js`) lit des clés qui n'existent pas pour certains blocs : préexistant, non corrigé. Ses lectures de séances passent maintenant par `_seancesTrain()` et sont sous témoin (`C-ACT-J7`, qui a trouvé le compteur « 31 séances lues » pour 28 séances et 3 marches).
- Le classeur Google (Sheets) n'a jamais reçu les éditions ni les suppressions : inchangé ; une activité a `synced:true` à la création (aucune série à envoyer).
- **Passe D-031 : 8 rouges préexistants** (voir §6) : deux témoins piégés par le calendrier (`PS-E29`, la date : rouge sur le code publié depuis le 02/11/2026 ; « Ce qu'il te reste » du Journal, l'heure : rouge après 20 h Paris, `BUGS.md` §143) et six rouges de ce conteneur (plantage de `seance_ux.js`, `B-UXI-G2/G3/G5/G7`, `B-FFD-⑧e`) dont la cause n'a pas été cherchée. Ils masquent la ligne de total « valide » : à traiter par leurs propriétaires, pas ici.
- **Passe classique non rejouée** (≈ 96 min, R1) : à lancer par l'intégrateur avant toute publication. ↪️ **08/11/2026 : rejouée** sur la branche d'intégration (machine seule ; 3 conditions de validité sur 4 vertes — la 2ᵉ, « code de sortie du runner = 0 », ne peut pas l'être tant que les 7 rouges connus existent, `passe_valide.sh` écrit « PASSE NON VALIDE » : validation par comparaison aux rouges connus, pas par le feu vert de l'outil) : **8 337 ✅ / 7 ❌, les 7 rouges connus et aucun autre** — voir § 9 bis.
- **T50 (calculs sur données réelles) : BLOCKED** — aucun export réel de `S.sessions` n'est accessible (recherche Drive en lecture seule : 0 fichier ; le dossier MET ne donne que des moyennes). Le jeu de la mission est vérifié sur des séances reconstruites.
- **Pas de recette iPhone** (le conteneur ne joint pas le site) : « corrigé sur branche », pas « vérifié sur iPhone ». Les dates (`type=date`) et heures (`type=time`) suivent le téléphone. ↪️ **08/11/2026** : recette **préparée** (§ 10), clone de test généré depuis la branche d'intégration et servi depuis la session ; **non faite**.
- **Apple Santé** : intégration indirecte uniquement (raccourci iOS → `S.healthInbox` → rattachement manuel à un bloc cardio, calories de la montre ignorées) — non modifiée ; l'utilisateur peut maintenant saisir lui-même la valeur de sa montre sur ce bloc (`SEANCE-F22` / `MET-04` : le barème « autre » des activités rattachées n'est pas corrigé).
- Milo : ce que le banc prouve est la **présence** de ce qu'il reçoit (comme `tests/milo`), pas l'**obéissance** du modèle — aucun appel réseau possible ici.

## 9. État final

**✅ LIVRÉ SUR BRANCHE `claude/dreamy-bell-pu88ia` (11 commits depuis master `e2b942f3`, tête `d168d8a5`), NON FUSIONNÉ, NON PUBLIÉ, AUCUN DÉPLOIEMENT, aucun numéro de version, `Code.js` non touché, `clone/` non touché.** (dernier commit de CODE validé par la passe ; seuls des commits de documentation le suivent.)

- **Corrigé sur branche** (branche · commits · tests) : chantier A (tuile, formulaire, historique, calendrier, bilans, Milo, exports) et chantier B (mécanisme commun de calories) ; banc `C-ACT` 131 OK / 0 rouge, contrôle négatif 62/62, passe D-031 répartie 8 363 ✅ / 8 ❌ (tous déjà rouges sur la version publiée).
- **Intégré** : non *(↪️ 08/11/2026 : intégré sur la branche isolée `claude/integration-autre-activite-2026-11-08`, voir § 9 bis ; toujours pas sur master)*. **Publié** : non. **Vérifié sur iPhone** : non (le conteneur ne joint pas le site) — à faire par Michel.
- **Pour l'intégrateur (Claude Principal)** : fusion à blanc avec `origin/integration/nut-publication-2026-11-04` : aucun conflit de code (`app.js` `coach.js` `constants.js` `screens.js` `setup.js` `state.js` `runner.js` se fusionnent seuls) ; **deux conflits de documentation**, à résoudre en gardant les deux côtés : `docs/JOURNAL-DE-PARTAGE.md` (les lignes de session-C et celles de N°1) et `BUGS.md` (fin de fichier : §126-§129 de N°1, §140-§143 d'ici) ; banc rejoué sur l'arbre fusionné : 130 OK / 1 rouge — le seul rouge est le témoin de source `C-ACT-J30`, qui signale l'unique nouvelle lecture brute de `S.sessions` venue de N°1 (`state.js::_persistRepli`, le repli de stockage plein déplacé hors de `persist()` : famille « persistance ») → une ligne à ajouter à la liste blanche à l'intégration À faire à l'intégration : bump `sw.js` + `ft-vNN`, entrée de journal de `CLAUDE.md` (résumé prêt ci-dessous), `python3 tools/inventaire.py`, décision `WHATS_NEW`, captures du Guide fournies par Michel, mise à jour du registre et de la passation (bloc fourni dans le rapport).
- **Entrée de journal prête à copier (`CLAUDE.md`)** : `**ft-vNNNN — 🚶 « AUTRE ACTIVITÉ » + CALORIES PERSONNALISABLES** — une tuile sous « Programme » (marche, vélo, randonnée, course… : aucune série ni volume) et la valeur de la montre qui REMPLACE l'estimation (cardio comme activité), jamais additionnée ; bilans semaine/mois par catégorie ; les activités n'entrent dans aucun calcul de cible, fréquence, badge, registre ni récupération (test différentiel) ; export PDF : « Export PDF impossible » après un export réussi corrigé. Mission de Michel du 05/11/2026 — docs/AUTRE-ACTIVITE-CALORIES.md.`

## 9 bis. Intégration isolée sur master ft-v1265 (08/11/2026)

**🟡 INTÉGRÉ SUR LA BRANCHE ISOLÉE `claude/integration-autre-activite-2026-11-08` (tête `cb8a260f`, code testé `cb8a260f`) — NON FUSIONNÉ SUR MASTER, NON PUBLIÉ, AUCUN DÉPLOIEMENT.** Master reste `be04f04c` (ft-v1265) ; `Code.js` non touché (Apps Script @195) ; `sw.js` → `ft-v1266` sur la branche seulement.

- **Ordre de Michel (08/11, « GO technique limité »)** : préparer et tester l'intégration du seul lot « Autre activité » ; correctif « 0 kcal » autorisé ; exception des 7 rouges D-031 reconduite **uniquement s'ils sont exactement les mêmes**, mêmes causes, aucun nouveau ; master gelé ; recette iPhone obligatoire avant publication ; aucun push / fusion sur master, aucun déploiement sans GO FINAL.
- **Fusion** de `064c9dc0` (13 commits) sur master `be04f04c` : **0 conflit de code** ; 2 conflits de documentation (`BUGS.md`, `docs/JOURNAL-DE-PARTAGE.md`) résolus en gardant les deux côtés, **0 ligne perdue** (mesuré) ; l'arbre est identique, fichier par fichier, à la fusion à blanc du 08/11 (hors ces 2 fichiers).
- **Ajouts autorisés, et eux seuls** : `state.js::_persistRepli` dans la liste blanche de `C-ACT-J30` ; le **correctif « 0 kcal »** (`BUGS.md` §144 ; +7 −3 lignes dans `log.js::_calDataSeance` et `setup.js::_kcalApresEdition`, témoins `C-ACT-B16` à `B20`, mutations M63 / M64) ; `sw.js` ; documentation et suivi (`D-151`, `D-152`).
- **Périmètre** (garde automatique, relue dans le journal de cette session) : 30 fichiers, **10 fichiers applicatifs + `sw.js`**, aucun fichier interdit, ni lot T / T-bis, ni TDEE V2, ni cardio multi-activités. **Compteurs R17** (code applicatif) : 10 fichiers (+ `sw.js`) · +900 −132 lignes (+768) · 0 clé de stockage ni champ racine ajouté · 0 ancien chemin supprimé.
- **Résultats** : banc du lot 136 ✅ / 0 ❌ · contrôle négatif 64/64 · 33 bancs voisins (29 verts, 4 rouges connus identiques à master) · D-031 classique 8 337 ✅ / 7 ❌ (les 7 connus, identiques à master) · suite annexe 12 PASS, 1 défaut connu, 2 FAIL identiques à master. Les 7 rouges de D-031 (`PS-E29`, plantage `seance_ux`, `B-UXI-G2/G3/G5/G7`, `B-FFD-⑧e`) sont **identiques sur master et sur la branche** (mêmes libellés, mêmes détails, mesurés le même jour). Suite annexe hors D-031 : `calculs` (un témoin Nutrition) et `dates` (fixtures UTC de `nut_sync01.js:40` / `nut_sync02_clients.js:236`) rouges **aussi sur master**, `discussions` défaut connu (taille du prompt) — **non couverts par l'exception de Michel (D-031)** : à lui de décider.
- **États** : corrigé sur branche **oui** · intégré sur la branche isolée **oui**, sur master **non** · publié **non** · vérifié sur iPhone **non** *(↪️ 08/11/2026, soir : **oui pour les parcours principaux**, par Michel sur son iPhone, clone `3bac5474` — voir § 11 ; appareil et version d'iOS à compléter ; reste non vérifié sur iPhone : la ligne 16, hors ligne, qui se joue après publication)* *(↪️ 09/11/2026 : **publié** — master `5fd26dd1`, Pages n°1366 ✅ ; voir § 12)*.

## 10. Recette iPhone (méthode, 08/11/2026)

Obligatoire avant publication (décision de Michel). **Voie A** (sans push, sans publication) : le clone de test est généré depuis la branche d'intégration (`python3 tools/clone_build.py claude/integration-autre-activite-2026-11-08`, banc d'isolement 22 ✅ / 0 ❌), servi **uniquement sous `/clone/`** depuis la session (aucune page de l'app de la racine : elle tournerait sans l'isolation) ; une page `/demo` charge un profil de démonstration (82 kg) et 5 séances dont deux **anciennes** (cardio seul 379 kcal ; musculation + cardio 500 kcal dont 150 de cardio). **Voie B** (si l'aperçu n'est pas visible sur le téléphone) : publier `clone/` seul sur master = **GO distinct** (≈ 25 min ; l'app de production ne change pas).

Les 16 lignes (N = estimation affichée ; X = calories actives de la montre, ex. 255) : **1** marche 60 min → « Estimation FT ≈ 312 kcal · Retenu 312 · estimation » · **2** taper 255 → « Retenu 255 · valeur saisie », 312 reste affiché sans s'ajouter, bouton « ↩︎ Revenir à l'estimation » · **3** Enregistrer → « Activité enregistrée ✓ — 255 kcal », carte « 🔥 255 kcal ✎ » · **4** rouvrir, 300 → +45 sur le total de la semaine · **5** « Revenir » → 312 sans ✎ · **6** taper 0 → « Retenu 0 kcal · valeur saisie », carte « 🔥 0 kcal ✎ », bilan +0 ; vider → 312 · **7** « abc » / « 99999 » refusés avec un message, « 255,6 » → 256 · **8** taper X puis « Enregistrer » sans quitter le champ → la valeur est prise · **9** le bouton « + » central n'a pas bougé · **10** séance du 04/11 (cardio seul ancien) → « ≈ 379 kcal · Retenu 379 » · **11** séance du 03/11 (musculation + cardio ancien) → cardio « ≈ 150 » · **12** y taper 0 → la séance passe de 500 à **350**, le bilan du mois **ne dit pas** « non séparable » ; « Revenir » → 500 · **13** y taper 120 → 350 + 120 = **470** (jamais 500 + 120) · **14** séance neuve avec cardio saisi → pas d'addition · **15** cardio seul 45 min → « ≈ 338 kcal » (plus de forfait fictif) · **16** *(en production, après publication)* mode avion → l'activité survit, synchro au retour du réseau ; l'écran Nutrition est inchangé.

*La voie A prouve le vrai code sur le moteur WebKit de l'iPhone (clavier numérique, virgule, champ non quitté) ; elle ne prouve pas la synchro réelle ni le hors ligne d'une app installée : ligne 16, en production.*

## 11. Recette iPhone de Michel — résultats (08/11/2026, soir) et améliorations reportées

**Faite par Michel sur son iPhone, dans son clone « FT clone » mis à jour en `3bac5474`** (le clone ne parle à aucun serveur et range ses données sous le préfixe `cl_`). Le profil du clone est celui d'« Aude », **52 kg** : c'est ce poids qui explique les estimations affichées. **Modèle d'iPhone et version d'iOS : à compléter par Michel** (non communiqués ; l'état « vérifié sur iPhone » ne s'écrit complet qu'avec eux — règle d'or #19).

| Parcours (constaté par Michel) | Résultat |
|---|---|
| Affichage et ouverture d'« Autre activité » | ✅ |
| Création d'une marche de 60 minutes | ✅ |
| Estimation calorique selon l'activité et l'intensité | ✅ — 198 kcal |
| Calories de la montre : 150 kcal | ✅ remplacent l'estimation de 198 (jamais additionnées) |
| Enregistrement dans l'historique | ✅ |
| Modification de 150 à 250 kcal | ✅ |
| Saisie et sauvegarde de 0 kcal | ✅ |
| Retour à l'estimation (198 kcal) | ✅ |
| Suppression d'une activité | ✅ — compteur revenu à « 14 séances et 1 activité » |
| Accès à Nutrition | ✅ — aucun dysfonctionnement évident |

**Rejeu automatique du même scénario** (hors dépôt ; code du candidat `c2d6b389`, profil 52 kg, 14 séances + 1 activité de départ, horloge figée au 08/11/2026 à 19 h) : **27/27** sur l'application à la racine et **28/28** sur le clone du dépôt (bandeau `3bac5474` lu comme sur l'iPhone). Il retrouve : la marche de 60 min à 52 kg = **198 kcal** (légère 156 · modérée 198 · intense 250) ; 150 qui remplace ; 250 qui fait bouger le total de **+100**, pas de +250 ; 0 kcal compté 0 ; la case vidée qui revient à 198 sans ✎ ; la suppression en deux touchers qui ramène « 14 séances · 1 activité » ; l'écran Nutrition **identique** avant, pendant et après ; la valeur tapée puis « Enregistrer » sans quitter le champ. **Contrôle négatif** : trois mutations volontaires (arrondi à l'entier inférieur, valeur de la montre additionnée, 0 traité comme un champ vide) font rougir 8, 10 et 3 points ; le code d'avant « Autre activité » plante. ⛔ Chromium n'est pas un iPhone : le rejeu confirme la logique, pas le toucher.

**Non couvert par l'iPhone de Michel (couvert par l'automatisation seulement)** : lignes 14 et 15 (cardio d'une séance de musculation ; cardio seul à 338 kcal), correctif « 0 kcal » d'une séance de musculation avec cardio, anciens enregistrements (lignes 10 à 13, impossibles à jouer sur un clone) et **ligne 16 (mode avion, application installée, Nutrition) : à jouer sur la vraie application, après publication**.

**Améliorations reportées APRÈS la publication — décision de Michel du 08/11/2026 (`D-155`)** : le contraste et la lisibilité du formulaire, la sélection automatique de la valeur numérique à la prise de focus, et — à traiter séparément — une confirmation discrète quand on enregistre `0 kcal`. **Elles ne sont pas dans le candidat, rien n'est codé** : `ft-v1266` est clôturé tel qu'il a été recetté.

## 12. Publication — constat (09/11/2026)

**GO FINAL de Michel** (09/11/2026) pour le candidat `5fd26dd1` ; les échecs préexistants de D-031 et de la suite annexe sont acceptés pour **CETTE publication uniquement**, à corriger ultérieurement (`D-156`) ; aucune amélioration (cardio seul, interface) ni nouveau chantier n'est fusionné avec elle. **Protocole exécuté** : ① pré-vol — master distant `374dfeb3`, candidat `5fd26dd1`, avance rapide possible, aucun fichier interdit dans le diff ; ② branche de sauvegarde `backup-prod-ft-v1265-avant-ft-v1266-2026-11-08` créée sur `374dfeb3` et vérifiée à distance (une tentative précédente par un autre accès avait échoué en 403, sans rien pousser ; par `git push`, elle a réussi) ; ③ **avance rapide de master `374dfeb3` → `5fd26dd1`** à 07:37 UTC, sans `--force` ; ④ **Pages : run n°1366 ✅** (07:37:58 → 07:38:27 UTC, 29 s) ; **Apps Script : aucun run** (dernier n°180, ft-v1265) ; **Worker : aucun run** (dernier n°32) ; ⑤ ce constat (documents seulement).

**Reste** : les vérifications de Michel sur la vraie app (fiche `VERIFICATIONS-APRES-PUBLICATION-FT-V1266`, dont la ligne 16 en mode avion), son modèle d'iPhone et sa version d'iOS ; le tag `stable-2026-11-08-autre-activite-ok` n'est posé qu'après. **Retour arrière testé** (arbre jetable) : un commit qui restaure les 11 fichiers applicatifs depuis la branche de sauvegarde ; le `git revert` de la fusion échoue (conflits de documents).
