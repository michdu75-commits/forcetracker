# 🗺️ Carte des données — Profil · Séance · État du jour · Accueil/Progrès · Milo

> **Créée le 12/09/2026, à la demande de Michel** : *« je veux comprendre les connexions avant de
> décider quoi corriger »*.
> ⛔⛔ **LECTURE ET MESURE UNIQUEMENT — aucune ligne de production n'a été modifiée.**
> ⛔ **La nutrition est hors périmètre** (consigne du jour, chantier de l'autre session).

## Comment cette carte a été faite (et pourquoi ce n'est pas un grep)

| Question | Comment elle a été mesurée |
|---|---|
| Qui **écrit** / qui **lit** une donnée ? | analyse du code des **8 fichiers servis**, avec la **fonction englobante** retrouvée par comptage d'accolades, **commentaires et chaînes retirés** |
| La donnée arrive-t-elle **vraiment** chez Milo ? | on **exécute** l'app dans un navigateur, on sème un profil à **valeurs uniques**, on appelle `buildCoachContext()` et on **cherche la valeur dans le texte produit** |
| Est-elle **répétée** ? | même mesure, comptée **par section** du contexte |
| Milo s'en **sert**-il ? | ⛔ **non mesurable ici** — voir la colonne dédiée |

**⚠️⚠️ L'INSTRUMENT A ÉTÉ FAUX HUIT FOIS AVANT D'ÊTRE JUSTE, et c'est la première chose à savoir
avant de lire les chiffres.** Chaque erreur est écrite ici parce qu'elle se reproduira :

| # | L'erreur de mesure | Ce qu'elle faisait croire |
|---|---|---|
| 1 | `healthProfile` semé comme une **chaîne** (c'est un **objet**) | « la blessure n'atteint pas Milo » — **faux**, et énorme |
| 2 | `healthProfile.injuries` semé avec des **chaînes** (ce sont des **objets `{zone,status}`**) | idem |
| 3 | `dayState.pain` au lieu de **`pains: [{zone, side}]`** | « la douleur du jour n'atteint pas Milo » — **faux** |
| 4 | `dayStateLog` avec la clé `d` au lieu de **`date`** | rien ne remontait |
| 5 | `healthDaily` semé comme un **objet** (c'est un **tableau**) | « le sommeil n'atteint pas Milo » — **faux** |
| 6 | `sleepLog` daté d'hier alors que le contexte lit **aujourd'hui** | idem |
| 7 | recherche **sensible à la casse et aux accents** | « discipline et type de balance absents » — **faux** |
| 8 | valeurs **arrondies** acceptées comme empreintes | niveau d'activité « présent **123 fois** » — **fabriqué** |

👉 ***Une sonde trop stricte invente des trous ; une sonde trop permissive invente des doublons.***
Tout ce qui suit a été **revérifié dans le texte réel** avant d'être écrit.

---

## 1. Le schéma, en une image

```
                  ┌──────────────────────────────────────────────────────────┐
   SAISIE         │  Profil · Check-in · Séance · Pesée · Sommeil            │
   (la personne)  └───────────────┬──────────────────────────────────────────┘
                                  │
   IMPORT (IA)    ┌───────────────┴───────────┐   programme · historique · bilan
                  │                           │   corporel · prise de sang
                  ▼                           ▼
            ┌─────────────────────────────────────────────┐
            │   PROPRIÉTAIRE UNIQUE :  l'objet  S         │   (state.js — load/persist)
            │   stockage : localStorage, clés ft4_*       │
            └───────┬──────────────────────┬──────────────┘
                    │                      │
    CONSOMMATEURS   │                      │   CALCULS LOCAUX (aucune IA)
    D'ÉCRAN         ▼                      ▼   bz() 1RM · calcTDEE · calcMacros
       Accueil · Séance · Progrès      calcRecoveryScore · calcSessionCalories
       Cycle · Profil                  _nuit · _pasEcart · getProgCurrentWeek
                    │                      │
                    └──────────┬───────────┘
                               │
                               ▼
                  ┌────────────────────────────────────┐
                  │  buildCoachContext()  — coach.js   │  ~79 000 à 83 000 caractères
                  │  13 sections                       │  reconstruit à CHAQUE message
                  └────────────┬───────────────────────┘
                               │  + coachMemory (champ SÉPARÉ)
                               │  + history (8 derniers messages)
                               │  + message
                               ▼
                        ┌─────────────┐
                        │    MILO     │   (Worker Cloudflare → API Claude)
                        └─────────────┘
```

**⭐ Le point d'architecture le plus important, et il est sain** : l'app **ne dépend pas de Milo
pour fonctionner**. Tous les calculs qui font l'écran — 1RM, volume, calories, TDEE, macros,
score de récupération, semaine de cycle, records — sont **locaux et déterministes**.

---

## 2. La table — PROFIL

| Donnée | Propriétaire | Stockage | Écrite par | Lue par | Nature | → Milo | Section | Répétée | Usage réel Milo | Usage app sans Milo | Perte possible | Doublon | Décision ? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **poids** `S.bw` | state.js | `ft4_bw` | `saveProfile` · `saveWeightEntry` · `_applyRestoreData` · `load` (9) | **32** | saisie | ✅ | Profil · Objectifs · Poids&compo | ⚠️ **3 sections** | non vérifiable sans banc d'essai API | ✅ TDEE, calories, 1RM relatif | non | ⚠️ 3× | **oui** |
| **taille** `S.height` | state.js | `ft4_ht` | 4 | 19 | saisie | ✅ | Profil athlète | non | idem | ✅ TDEE, IMC, masse grasse | non | non | non |
| **âge** `S.age` | state.js | `ft4_age` | 4 | 17 | saisie | ✅ | Profil athlète | non | idem | ✅ TDEE, niveaux de force | non | non | non |
| **sexe** `S.gender` | state.js | `ft4_gender` | 6 | 28 | saisie | ✅ | Profil athlète | non | idem | ✅ TDEE, physiologie, figurine | non | non | non |
| **tour de taille** `S.waist` | state.js | `ft4_waist` | 3 | 12 | saisie | ⛔ **NON** | — | — | — | ✅ masse grasse (Navy) | ⛔ **oui** | — | ⛔⛔ **OUI** |
| **tour de cou** `S.neck` | state.js | `ft4_neck` | 3 | 11 | saisie | ⛔ **NON** | — | — | — | ✅ masse grasse (Navy) | ⛔ oui | — | **oui** |
| **hanches** `S.hip` | state.js | `ft4_hip` | 3 | 11 | saisie | ⛔ **NON** | — | — | — | ✅ masse grasse (femmes) | ⛔ oui | — | **oui** |
| **masse grasse** (dérivée) | coach.js (calcul en ligne) | — (recalculée) | — | — | **calculée** | ✅ | Poids & composition | non | non vérifiable sans banc d'essai API | ✅ affichage, Milo | — | ⚠️ formule **recopiée** entre l'écran et le contexte | **oui** |
| **discipline** `S.discipline` | state.js | `ft4_disc` | 4 | 14 | saisie | ✅ | Profil · Programmes | ⚠️ **2 sections** | idem | ✅ cadre `DISC_CADRE`, MET | non | ⚠️ 2× | non |
| **objectif** `S.goal` | state.js | `ft4_goal` | 4 | 24 | saisie | ✅ | Profil · Personnalité · Cycle · Nutrition | ⚠️ **4 sections** | idem | ✅ TDEE, macros, générateur | non | ⚠️ 4× | **oui** |
| **priorités muscles** `S.priorities` | state.js | `ft4_prio` | 5 | 7 | saisie | ✅ | Profil · Personnalité | ⚠️ 2 sections | idem | ✅ générateur débutant | non | ⚠️ 2× | non |

---

## 3. La table — SÉANCE

| Donnée | Propriétaire | Stockage | Écrite par | Lue par | Nature | → Milo | Section | Répétée | Usage réel Milo | Usage app sans Milo | Perte / incohérence | Décision ? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **programme prévu** `S.programmes` | log.js / setup.js | `ft4_progs` | `_saveForceProgram` · `_applyRestoreData` (5) | 9 | importé (IA) **ou** saisi | ✅ | « Ses programmes enregistrés » | non | non vérifiable sans banc d'essai API | ✅ sélecteur de jour, semaine A/B | non | non |
| **séance prévue** `S.nextPlanned` | screens.js | `ft4_nextplanned` | 7 | 4 | produite par Milo | ✅ | Situation de l'instant | non | idem | ✅ carte d'accueil | non | non |
| **séance en cours** `S.wkt` | log.js | `ft4_wkt` | `startWorkout` · `_cardioVersWkt` · `toggleWktPause` (17) | **79** | saisie | ✅ | Situation de l'instant | non | idem | ✅ **tout l'écran Séance** | non | non |
| **séance réalisée** `S.sessions` | log.js | `ft4_sessions` | `finishWorkout` · `saveSessEdits` · restore (7) | **81** | saisie / importée | ✅ | Dernières séances | non | idem | ✅ Accueil, Progrès, calendrier, calories | non | non |
| **séries · reps · charge** | log.js (dans `S.sessions`) | idem | idem | idem | saisie | ✅ | Dernières séances + Records | ⚠️ **2 sections** | idem | ✅ 1RM, volume, PR | non | ⚠️ 2× |
| **RIR** `set.rir` | log.js | dans la série | `setRir` | — | saisie | ✅ | Dernières séances | non | idem | ✅ colonne « précédent » | non | non |
| **RPE** | ⭐ **aucun stockage** | — | — | — | **affichage dérivé** (`10 − RIR`) | ✅ (traduit) | idem | non | idem | ✅ | non | ⭐ **modèle sain** : une mesure, deux langues |
| **type de série** `set.type` | log.js | dans la série | `setSetType` | — | saisie | ✅ | Dernières séances | non | idem | ✅ repos, PR, volume | ⚠️ **la règle « compte pour un PR » a 1 propriétaire + 2 copies** | **oui** |
| **repos par défaut** `S.defRest` | ⭐ **state.js `reposDefaut()`** (depuis ft-v1195) | `ft4_rest` | `saveProfile` · `load` (3) | 6 | saisie | ✅ | (via rythme de séance) | non | idem | ✅ chrono, calories, durée | ✅ **réglé aujourd'hui** (3 replis → 1) | non |
| **repos par exercice** `S.exRestPref` | log.js | `ft4_exrest` | 4 | 8 | saisie | ✅ | « Ses temps de repos réglés » (`3 min 33 s`) | non | idem | ✅ chrono | non | non |
| **exercice** `EXLIB` + `S.customExercises` | constants.js / log.js | `ft4_customex` | 5 | 30 | catalogue + saisie | ✅ | Catalogue (bas du contexte) | non | idem | ✅ sélecteur, muscles, MET | non | non |
| **records** `S.prs` | log.js | `ft4_prs` | `finishWorkout` · `saveSessEdits` · `finalImportHist` · renommages (11) | 29 | **calculée** (`bz`) | ✅ | Records + Objectifs | ⚠️ **2 sections** | idem | ✅ Progrès, badges, cycle | ⛔ **3 écritures, 1 seul propriétaire de la règle** | **oui** |
| **progression** | setup.js `renderChart` | — (calculée) | — | — | **calculée** | ✅ (via records) | Records | non | idem | ✅ graphique 1RM | non | non |
| **adaptation de séance** | coach.js | `S.exSwaps` | 5 | 9 | **produite par Milo** | ✅ | Situation de l'instant | non | idem | ✅ appliquée à la séance | non | non |

---

## 4. La table — ÉTAT DU JOUR & RÉCUPÉRATION

| Donnée | Propriétaire | Stockage | Écrite par | Lue par | Nature | → Milo | Section | Usage app sans Milo | Perte / incohérence | Décision ? |
|---|---|---|---|---|---|---|---|---|---|---|
| **sommeil** `S.sleepLog` | ⭐ **`_nuit()`** (tracking.js) | `ft4_sleep` | `saveSleepEntry` · `ciPickSleep` (6) | 22 | saisie | ✅ | Récupération & sommeil | ✅ score de récup | non | non |
| **sommeil mesuré** `S.healthDaily` | ⭐ **`_nuit()`** — même propriétaire | `ft4_healthdaily` | raccourci iOS (1) | 10 | importée (montre) | ✅ | idem | ✅ TDEE, courbe | ⚠️ **la donnée n'arrive pas** (raccourci iOS à faire) | non |
| **fatigue / énergie** `S.dayState.energy` | screens.js `_dayState()` | `ft4_daystate` | `_saveDayStateToLog` (3) | 8 | saisie | ✅ | **État du jour** | ✅ carte d'accueil | non | non |
| **moral** `S.dayState.mood` | idem | idem | idem | idem | saisie | ✅ | **État du jour** | ✅ | non | non |
| **douleur** `S.dayState.pains[]` | idem | idem | `toggleDayPain` | idem | saisie | ✅ **+ Gardien** | État du jour **et** Gardien | ✅ | non | non |
| **ressenti / note** `S.dayState.note` | idem | idem | idem | idem | saisie | ✅ | État du jour | ✅ | non | non |
| **récupération** (score) | tracking.js `calcRecoveryScore` | — (calculé) | — | — | **calculée** | ✅ | Récupération & sommeil | ✅ **entièrement local** | non | non |
| **historique check-in** `S.dayStateLog` | screens.js `_saveDayStateToLog` | `ft4_daystatelog` | 3 | 7 | saisie | ⛔ **NON — 0 occurrence dans coach.js** | — | ✅ « souvenirs » de l'Accueil | ⛔⛔ **trou connu** | ⛔ **OUI** |
| **badges** `S.badges` | app.js `checkBadges` | `ft4_badges` | 5 | 7 | **calculée** | ⛔ **NON** (déclaré transmis, il ne l'est pas) | — | ✅ écran badges | ⛔ **trou connu** | **oui** |
| **profil santé** `S.healthProfile` | setup.js / app.js | `ft4_health` | `_obApplyInjuries` · `_confirmMiloMemory` (7) | 14 | saisie **+ produite par Milo** | ✅ **Gardien + Profil** | Gardien (en tête) + Profil | ⚠️ lu surtout pour Milo | non | non |

---

## 5. La table — ACCUEIL & PROGRÈS

| Élément | Propriétaire | Source des données | Calcul | Dépend de Milo ? |
|---|---|---|---|---|
| Stats du mois, calendrier, PR récents | `renderHome` (screens.js) | `S.sessions`, `S.prs` | **local** | ⛔ non |
| Récupération affichée | `calcRecoveryScore` (tracking.js) | `sleepLog` + `healthDaily` + `sessions` | **local** | ⛔ non |
| Graphique 1RM | `renderChart` (setup.js) | `S.sessions` + `bz()` | **local** | ⛔ non |
| Suivi du poids, corrélations | `renderProgress` | `S.weightLog` | **local** | ⛔ non |
| Carte « ta prochaine séance » | `renderHome` | `S.nextPlanned` | local | ⚠️ **la donnée vient de Milo** |
| **Questions proactives** (observations, écarts, confirmations) | `_pendingGap` · `_pendingEnrich` · `_pendingConfirm` (tracking.js) | `S.registre`, `S.sessions`, `S.coachQuiz` | **local** | ⛔ non |

**⚠️ La règle de rythme des questions** — *« au plus 1 question/semaine, et pas avant 3 séances »* —
est **retapée à l'identique dans les 3 fonctions**. Et un commentaire voisin annonce **3 jours**
là où le code dit **7**.

---

## 6. MILO — ce qu'il reçoit vraiment

### 6.1 Le message envoyé (4 morceaux, pas un seul)

| Morceau | Contenu | Taille mesurée |
|---|---|---|
| `context` | `buildCoachContext()` — 13 sections | **~79 000 à 83 000 caractères** |
| `coachMemory` | la mémoire longue — **champ séparé**, pas dans le contexte | variable |
| `history` | les **8** derniers messages | variable |
| `message` | ce que la personne écrit | court |

### 6.2 Les sections, par taille (mesuré)

| Section | Caractères | Part |
|---|---|---|
| **TA PERSONNALITÉ** (les consignes) | **31 091** | **~39 %** |
| NUTRITION | 14 105 | 18 % |
| CYCLE DE FORCE | 14 097 | 18 % |
| PROFIL ATHLÈTE | 11 616 | 15 % |
| DERNIÈRES SÉANCES | 3 817 | 5 % |
| Récupération · Objectifs · Programmes · Records · Poids · Instant · Check-in | ~4 800 | 6 % |

⭐ **Les 3/4 du contexte sont des CONSIGNES et des CADRES, pas les données de la personne.**

### 6.3 Les constats vérifiés un par un (demande explicite de Michel)

| Constat à vérifier | Verdict mesuré |
|---|---|
| **tour de taille cité dans le prompt mais absent du contexte** | ⛔ **CONFIRMÉ.** Le prompt le nomme **2 fois** (*« appuie-toi sur … le tour de taille (rapport taille/hauteur ≥ 0,5) »* · *« CROISER poids + tour de taille + tendance + ressenti »*) et **la valeur n'y est nulle part** — seule la masse grasse dérivée part. **R8, 6ᵉ fois.** |
| **`badges` transmis ?** | ⛔ **NON.** Déclaré transmis, il ne l'est pas : `S.badges` n'apparaît dans `coach.js` que dans le remetteur à zéro des personas de test. |
| **`dayStateLog` absent ?** | ⛔ **CONFIRMÉ — 0 occurrence dans `coach.js`.** Milo sait comment tu vas *aujourd'hui*, jamais comment tu allais **sur la durée**. |
| **poids / dernière pesée répétés ?** | ⚠️ **OUI, 3 sections chacun** (Profil athlète · Objectifs · Poids & composition). |
| **charges principales répétées ?** | ⚠️ **OUI, 2 sections** (Records personnels · Dernières séances). |
| **discipline / objectif / priorités répétés ?** | ⚠️ **OUI** : discipline 2 sections · objectif **4** sections · priorités 2 sections. |
| **taille du contexte** | **~79 000 à 83 000 caractères** selon le profil (≈ 20 000 jetons), 13 sections. |
| ⭐ **douleur du jour transmise ?** | ✅ **OUI** — `énergie · moral · douleur(s) du jour: épaule (côté droit) · note`. *Ma première mesure disait non : c'était ma fixture.* |
| ⭐ **blessure déclarée transmise ?** | ✅ **OUI**, deux fois et **exprès** : au **Gardien** (en tête, sécurité) et au Profil santé. |
| ⭐ **sommeil transmis ?** | ✅ **OUI**, via un propriétaire unique `_nuit()` qui **unit** la saisie et la montre. |
| ⭐ **repos par exercice transmis ?** | ✅ **OUI** (« Squat à la Barre → 3 min 33 s »). |

---

## 7. Les 4 catégories

### A — SAIN

- **Un seul propriétaire du stockage** : `S` + `load()`/`persist()`, clés `ft4_*`. Aucun module ne garde sa copie.
- **`_nuit()`** : un propriétaire qui **unit** deux sources (saisie + montre) au lieu de les laisser diverger.
- **Le RPE** : *aucun stockage en double* — une mesure (`rir`), deux langues. Modèle à copier.
- **`_dayState()`** : une seule porte d'écriture, un seul journal.
- **Le Gardien** : la blessure remonte **en tête** du contexte, avant tout le reste.
- **Tous les calculs d'écran sont locaux** — 1RM, volume, calories, TDEE, macros, récup, cycle.
- **`reposDefaut()`** — réglé aujourd'hui (ft-v1195) : 3 replis divergents → 1.
- **`_rpeDeRir()`** — réglé aujourd'hui : 6 copies → 1 propriétaire.

### B — DUPLICATION

| Ce qui est en double | Coût |
|---|---|
| **poids + dernière pesée** dans **3 sections** du contexte | jetons payés à chaque message ; deux formulations peuvent diverger |
| **objectif** dans **4 sections** | idem |
| **charges** dans **2 sections** (Records / Dernières séances) | ⭐ *probablement légitime* : ce ne sont pas les mêmes faits (le record vs ce qu'il a fait mardi) |
| **la règle de rythme des questions** ×3 (`_pendingGap`/`Enrich`/`Confirm`) | ⛔ une divergence = Milo devient harcelant, **sans qu'aucun chiffre soit faux** |
| **la règle « cette série compte pour un PR »** : 1 propriétaire + **2 copies**, dont une **sans filtre de type** | ⛔ un échauffement pourrait créer un record le jour où l'import évolue |
| **la formule de masse grasse (Navy)** recopiée entre l'écran et le contexte | divergence silencieuse possible |

### C — TROU DE CONNEXION

| Trou | Ce que ça coûte |
|---|---|
| ⛔⛔ **tour de taille / cou / hanches → jamais envoyés** | le prompt **réclame** le tour de taille **2 fois**. Milo ne peut ni appliquer sa consigne, ni dire *« ton tour de taille est passé de 92 à 88 »* |
| ⛔⛔ **`dayStateLog` → jamais envoyé** | Milo ne voit **jamais la durée** : il ne peut pas dire *« c'est la 3ᵉ semaine où ton énergie est basse »* — c'est-à-dire la promesse même du produit |
| ⛔ **`badges` → jamais envoyé** | déclaré transmis ; il ne l'est pas |
| ⚠️ **`healthDaily` → la donnée n'arrive pas** | le code est branché des deux côtés, c'est le **raccourci iOS** qui ne l'envoie pas |

### D — DÉPENDANCE IA INUTILE OU EXCESSIVE

| Sujet | Constat |
|---|---|
| **Les 3/4 du contexte sont des consignes** (31 091 car. rien que « ta personnalité ») | ⛔ **non arbitrable ici** : savoir si une consigne « sert » demande un **banc d'essai API** |
| **Le cycle de force : 14 097 car. envoyés à chaque message** | ⚠️ y compris quand **aucun cycle n'est en cours**. Candidat n°1 à l'allègement — **à mesurer** |
| **La nutrition : 14 105 car.** | hors périmètre aujourd'hui |
| **Ce que l'app fait déjà sans IA** | 1RM, volume, calories, TDEE, macros, récupération, semaine de cycle, PR, calendrier, corrélations, durée de séance |
| **Ce qui dépend vraiment d'une IA** | **14 actions**, dont : conversation, **import de programme**, **import d'historique**, lecture de bilan corporel, prise de sang, code-barres, résumé de mémoire |

---

## 8. Conclusions concrètes

### Les 5 connexions les plus importantes à sécuriser

1. **`dayStateLog` → Milo** — le seul trou qui touche la **promesse du produit** (« il se souvient de qui tu es devenu »).
2. **Tour de taille → Milo** — le prompt le réclame déjà : c'est une consigne qui tourne à vide.
3. **La règle « compte pour un PR »** — 1 propriétaire, 2 copies, dont une sans filtre : le record est l'objet le plus sensible après la séance.
4. **La règle de rythme des questions** — 3 copies d'une règle de **comportement**, pas de calcul.
5. **`healthDaily`** — le code attend une donnée que le téléphone n'envoie pas.

### Les 5 doublons les plus coûteux ou risqués

1. La règle de rythme ×3 (risque : **comportement**).
2. La règle du PR ×3 (risque : **donnée**).
3. L'objectif dans **4 sections** (risque : **coût** + formulations divergentes).
4. Poids / dernière pesée dans **3 sections**.
5. La formule de masse grasse recopiée (risque : deux chiffres différents pour la même personne).

### Ce que Force Tracker fait déjà intelligemment **sans IA**

1RM (Brzycki) · volume · calories de séance (moteur MET) · TDEE adaptatif · macros · score de
récupération · semaine de cycle · records · calendrier · corrélations poids/perf · durée réelle de
séance · muscles travaillés · alternance semaine A/B · avertissements de cohérence.

### Ce qui justifie réellement Milo

- **Le jugement** : *« ce chiffre est-il pertinent pour CETTE personne, aujourd'hui ? »*
- **Le diagnostic** : même contexte, cause différente → stratégie différente.
- **La lecture de documents** : programme, historique, bilan corporel, prise de sang.
- **La mémoire conversationnelle** : ce que la personne dit et qui n'est dans aucun champ.

### Ce qui pourrait être retiré du contexte — **à mesurer, pas à décider**

- Le bloc **cycle de force** (14 097 car.) **quand aucun cycle n'est en cours**.
- Les **répétitions** du poids et de l'objectif (3 et 4 sections).
- ⚠️ Tout le reste relève du banc d'essai : **une section « inutile » est une hypothèse, un doublon est un fait**.

### Ce qui exige obligatoirement un banc d'essai API avant décision

1. Retirer quoi que ce soit des **consignes** (31 091 car.).
2. Ajouter `dayStateLog`, les **badges** ou le **tour de taille** — *ajouter change aussi ce que Milo reçoit*.
3. Réduire les doublons du contexte.
4. Toute réponse à *« Milo s'en sert-il vraiment ? »* — **sans exception**.

---

## 9. La réponse à la question de fond

> **Si Milo disparaît demain, est-ce que Force Tracker continue à fonctionner correctement ?**

**⭐ OUI, et largement.** Mesuré : l'intégralité des écrans Accueil, Séance, Progrès et Cycle
fonctionne sur des calculs **locaux et déterministes**. Ce qu'on perdrait :

| Ce qui s'arrête net | Ce qui continue |
|---|---|
| la conversation | tout le suivi de séance |
| l'**import** de programme et d'historique (photo/PDF) | les programmes déjà importés |
| la lecture de bilan corporel / prise de sang | les bilans déjà lus |
| le scan de code-barres par photo | le scan par le lecteur natif |
| les séances **proposées** par Milo | la création manuelle |

> **Et qu'est-ce que Milo apporte réellement en plus ?**

**Trois choses, et une seule est irremplaçable.** ① *Lire un document* — remplaçable par de la
saisie, au prix du confort. ② *Proposer une séance* — l'app a déjà un générateur sans IA
(`openBeginnerSetup`). ③ ⭐ **Relier ce qui n'est écrit dans aucun champ** : *« tu as annoncé le bas
du corps, tu as fait du haut, et tu m'as dit que tu déménages en octobre »*. **C'est la seule
chose que le code ne sait pas faire** — et c'est précisément ce que les deux trous de connexion
(`dayStateLog`, tour de taille) l'empêchent aujourd'hui de faire à fond.

---

*Carte établie le 12/09/2026, en lecture seule. Aucune ligne de production modifiée.
Sondes rejouables : `tools/audit_milo_liens.js`. Les mesures d'écriture/lecture proviennent d'une
analyse du code des 8 fichiers servis, commentaires et chaînes retirés.*
