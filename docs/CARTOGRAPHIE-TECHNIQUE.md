# FORCE TRACKER — CARTOGRAPHIE TECHNIQUE ET ZONES DE RISQUE

> **Document autonome.** Il est écrit pour être lu **sans accès au dépôt**, notamment par une IA
> extérieure (GPT). Tout ce qu'il contient a été **mesuré le 02/09/2026** sur la version
> `ft-v1101` réellement servie — rien n'est écrit de mémoire.
>
> ⛔ **C'est un AUDIT.** Aucune ligne de l'application n'a été modifiée pendant sa rédaction.
> Les défauts trouvés sont **décrits et laissés en l'état**, avec leur preuve.
>
> ⚠️ **Comment lire les chiffres.** Quand une mesure est fragile ou qu'un détecteur a une
> précision faible, c'est écrit. Une mesure sans contrôle négatif n'est pas une preuve : ce
> principe a coûté cher au projet (voir §14) et il s'applique aussi à ce document.

---

## 0. CE QU'IL FAUT SAVOIR AVANT DE LIRE

**Force Tracker** est une application web de suivi de musculation (PWA), conçue pour mobile
(largeur max 430 px), **sans framework et sans étape de build**. Le code est du JavaScript
« vanilla » chargé par une seule page HTML. Elle est servie par GitHub Pages.

Trois conséquences structurent tout le reste :

1. **Il n'y a pas de modules.** Tous les scripts partagent un **espace global unique**. Une
   fonction définie dans un fichier est appelable depuis tous les autres. Il n'y a ni `import`
   ni `export` côté application.
2. **L'état vit dans un seul objet global, `S`**, sauvegardé dans le `localStorage` du
   navigateur. Il n'y a pas de base de données côté client.
3. **L'ordre de chargement des scripts est significatif** (voir §1) : un fichier ne peut pas
   utiliser à l'exécution *immédiate* ce qu'un fichier chargé plus tard définit.

Le serveur est un **Google Apps Script** (sauvegarde, premium, import de documents) doublé d'un
**Cloudflare Worker** (tous les appels d'IA). Un miroir **Supabase** sert de sauvegarde
secondaire.

**Milo** est le nom du coach IA du produit.

---

## 1. INVENTAIRE DES FICHIERS RÉELLEMENT SERVIS

### 1.1 Ordre de chargement (déclaré dans `index.html`)

Les scripts sont chargés dans cet ordre exact, en balises `<script src>` classiques
(pas de `type="module"`, pas de `defer` sur tous) :

| # | Fichier | Lignes | Caractères | Rôle principal |
|---|---|---|---|---|
| 1 | `constants.js` | 2 304 | 259 107 | Catalogue d'exercices (EXLIB), tables de muscles, URLs des services, nouveautés (`NEW_FEATURES`, `WHATS_NEW`), aiguillage IA |
| 2 | `state.js` | 2 010 | 142 767 | **L'objet `S`**, `load()`, `persist()`, et les calculs de base (TDEE, macros, cycle menstruel, bornes de validation) |
| 3 | `supabase.js` | ~250 | 9 643 | Miroir de sauvegarde secondaire (`sbMirror`) |
| 4 | `screens.js` | 3 213 | 265 718 | Navigation entre écrans, rendu de l'Accueil et de la Nutrition, aide contextuelle `_HELP_DATA` |
| 5 | `log.js` | 8 990 | 639 802 | **Écran Séance** : démarrage, séries, repos, fin de séance, programmes, sélecteur d'exercices, muscles travaillés |
| 6 | `setup.js` | 3 690 | 251 575 | Profil, écran Progrès, graphiques, **restauration de compte**, synchronisation cloud, exports |
| 7 | `tracking.js` | 3 578 | 238 601 | Cycle de force, badges, check-in du jour, poids/mensurations, bilans corporels, `toast()`, envoi au classeur |
| 8 | `coach.js` | 7 728 | 671 717 | **Milo** : construction du contexte, envoi, Gardien de sécurité, aide détaillée, banc d'essai |
| 9 | `food-health.js` | 431 | 17 942 | Score santé des aliments (Nutri-Score, NOVA) |
| 10 | `app.js` | 6 826 | 476 267 | Démarrage (`autoConnect`), badges, calories de séance/MET, administration, Guide de l'application |

**Autres fichiers servis :** `index.html` (3 471 lignes, 326 164 car. — structure HTML, aucun JS
inline), `style.css` (1 795 lignes), `sw.js` (313 lignes — Service Worker), `manifest.json`,
les polices en local, les images du guide, et quatre bibliothèques locales chargées à la
demande (`jspdf`, `jspdf-autotable`, `xlsx`, `zxing`).

**Non servis au navigateur :** `Code.js` (3 607 lignes — le backend Apps Script) et `worker.js`
(906 lignes — le Cloudflare Worker). `translations.js` existe dans le dépôt mais **n'est pas
chargé par `index.html`** (0 référence).

### 1.2 Volumétrie

- **~38 500 lignes de JavaScript servi**, ~2,9 Mo de source non minifiée.
- **1 569 fonctions nommées** dans l'espace global.
- **340 constantes** en majuscules.
- **143 clés `localStorage`** littérales distinctes.
- **106 champs** dans l'objet d'état `S`.

### 1.3 Fonctions majeures par fichier

| Fichier | Fonctions | Points d'entrée les plus structurants |
|---|---|---|
| `constants.js` | 13 | `_aiUrl()` (aiguillage Worker/Apps Script), `getLevel()` (dormante — voir §11) |
| `state.js` | 59 | `load()`, `persist()`, `calcTDEE()`, `calcMacros()`, `calcBMR()`, `bz()` (e1RM Brzycki), `getMensCyclePhase()`, `cycleGlucides()`, `_poidsValide()`, `_serieValide()`, `_ageValide()` |
| `screens.js` | 132 | `goScreen()`, `renderHome()`, `renderNutrition()`, `_HELP_DATA`, `_saveDayStateToLog()` |
| `log.js` | 381 | `startWorkout()`, `renderLog()`, `finishWorkout()`, `startRest()`, `loadProg()`, `loadProgDay()`, `_mscScores()` (muscles), `getPrev()`, `showConfirm()` |
| `setup.js` | 194 | `renderProgress()`, `_cloudSync()`, `_applyRestoreData()`, `_prsDepuisSeances()`, `saveProfile()`, exports CSV/PDF |
| `tracking.js` | 200 | `toast()`, `renderCycleScreen()`, `getCurrentCycleWeek()`, `cycleTermine()`, `syncSheets()`, `_retrySheetQueue()`, `saveWeightEntry()`, `saveBodyScan()` |
| `coach.js` | 223 | `buildCoachContext()`, `sendToCoach()`, `_gardienRules()`, `_gardienZones()`, `showPremiumWall()`, `_DRAWER_CONTENT` (aide détaillée) |
| `app.js` | 351 | `autoConnect()`, `checkBadges()`, `_checkBadgeCond()`, `getExerciseMET()`, `calcSessionCalories()`, `APP_GUIDE_SLIDES` |

---

## 2. CARTOGRAPHIE DES RESPONSABILITÉS

Pour chaque domaine : qui possède la donnée, qui la calcule, qui la modifie, qui l'affiche,
et si elle atteint Milo.

| Domaine | Donnée (dans `S`) | Calcul | Modification | Affichage | → Milo |
|---|---|---|---|---|---|
| **Profil** | `name, age, height, bw, gender, goal, activityLevel, workType` | — | `saveProfile()` (setup.js), `_applyRestoreData()` | `setup.js` | ✅ |
| **Séance en cours** | `wkt` | `log.js` | `startWorkout`, `loadProg`, `loadProgDay`, saisie des séries | `renderLog()` | ✅ |
| **Historique** | `sessions` | volume et calories calculés à la fin | `finishWorkout()` (log.js), `saveSessEdits()` / suppression (setup.js) | `renderSessions()`, calendrier | ✅ |
| **Records (e1RM)** | `prs` | `bz()` — formule Brzycki, dans `state.js` | `finishWorkout()`, `saveSessEdits()`, import d'historique | Accueil, Progrès | ✅ |
| **Exercices** | `constants.js` (`EXLIB`) + `customExercises` | `_mscScores()` (muscles) | création/fusion dans `log.js` | sélecteur, figurine | ✅ |
| **Progression** | dérivée de `sessions` + `prs` | `setup.js` | — | `renderProgress()`, graphiques | ✅ |
| **Nutrition** | `foodLog, manualKcal, diet, foodMode, keto, fasting, nutritionPhase` | `calcTDEE()`, `calcMacros()`, `cycleGlucides()` — **tous dans `state.js`** | `screens.js`, `app.js` | `renderNutrition()` | ✅ |
| **Poids** | `weightLog` (clé `kg`, **pas** `bw`), `bw` (valeur courante) | tendance calculée dans `tracking.js` | `saveWeightEntry()`, `saveBodyScan()`, `deleteWeighEntry()` | Progrès → Corps & santé | ✅ |
| **Mensurations** | `neck, waist, hip, targetWeight, scaleType` | US Navy (% de gras) | `saveProfile()`, bilans corporels | Progrès, Profil | ✅ |
| **Composition** | `bodyScans, bodyScanImports, bodyStudy, bodySeries` | fabricant + repli déterministe côté serveur | `tracking.js` | Progrès | ✅ |
| **Santé / blessures** | `healthProfile` (`injuries[{zone,status}]`, `notes`), `smoker`, `contraception`, `mensCycleStart/Dur` | `_gardienZones()` | Profil → Santé | Profil | ✅ (via le **Gardien**) |
| **État du jour** | `dayState` (`energy, mood, pains[], note`) | score de récupération | check-in de l'Accueil | Accueil | ✅ |
| **Historique du check-in** | `dayStateLog` | — | `_saveDayStateToLog()` (screens.js) | souvenirs de l'Accueil | ❌ **trou connu** (§12) |
| **Cycle de force** | `cycle` (`startDate, weeks, exercises{}`) | `getCurrentCycleWeek()`, `getWeekPlan()`, `cycleTermine()` | `startCycle()`, `endCycle()` | Menu → Outils | ✅ |
| **Badges** | `badges` | `_checkBadgeCond()` (app.js) | `checkBadges()` | Progrès → Badges | ❌ **trou connu** (§12) |
| **Récupération** | dérivée (sommeil, séances, âge, tabac, cycle) | `tracking.js` | — | carte de l'Accueil | ✅ |
| **Milo** | `coachMemory` (chaîne), `coachFree`, `coachQuiz`, `registre`, `adn` | `buildCoachContext()` | `coach.js` | écran Coach | ✅ |
| **Stockage** | 143 clés `ft4_*` | — | `persist()` (state.js) | — | — |
| **Sauvegarde** | — | — | `_cloudSync()` (setup.js), `sbMirror` (supabase.js), `syncSheets()` (tracking.js) | Profil → Admin | — |
| **Interface** | `a11y, halo, theme, menuAck, seenFeatures` | — | `app.js`, `screens.js` | partout | ❌ (exclu, motivé) |

### 2.1 Cas où le propriétaire n'est PAS clair

**Mesuré** : sur les 106 champs de `S`, **73** sont écrits depuis plusieurs fichiers. **Ce
chiffre brut est trompeur et il ne faut pas le citer tel quel.**

Trois fonctions écrivent en masse, par construction, et ne sont pas des « propriétaires
concurrents » :

| Fonction | Fichier | Champs écrits | Rôle |
|---|---|---|---|
| `load()` | `state.js` | **106** | charge tout depuis `localStorage` au démarrage |
| `_applyRestoreData()` | `setup.js` | **71** | restaure un compte depuis le cloud |
| `_vcApplyPersona()` | `coach.js` | **54** | remet à zéro l'état pour un persona de **test** (anti-fuite de données) |

**Une fois ces trois retirées, il reste 25 champs réellement écrits depuis plusieurs
fichiers** — c'est le chiffre à retenir :

`activityLevel, bw, coachQuiz, connected, customExercises, email, foodLog, gender,
healthProfile, hip, level, levelAuto, name, neck, nextPlanned, premium, premiumExpiry,
programmes, prs, registre, sessions, sleepLog, waist, weightLog, wkt`

Les plus exposés, par nombre d'écrivains distincts :

- **`healthProfile`** — 4 fichiers (`app.js`, `coach.js`, `setup.js`, `state.js`). Donnée
  sensible, lue par le Gardien de sécurité.
- **`bw`, `weightLog`, `neck`, `waist`, `hip`** — écrits par `setup.js` (saisie manuelle) **et**
  `tracking.js` (pesée, bilan corporel). C'est la famille qui a produit le défaut §35 du
  catalogue de bugs du projet.
- **`prs`, `sessions`, `wkt`** — le cœur de l'entraînement, écrits par `log.js` et `setup.js`.

---

## 3. CARTOGRAPHIE DU STOCKAGE

### 3.1 Principe

Tout tient dans le `localStorage`, sous **143 clés** préfixées `ft4_`. `persist()`
(dans `state.js`) écrit **l'ensemble de `S`** à chaque appel — c'est un point structurant
(voir §8). `load()` fait l'inverse au démarrage.

### 3.2 Familles de clés

| Famille | Exemples | Nature | Historisé ? |
|---|---|---|---|
| **Profil** | `ft4_name, ft4_age, ft4_ht, ft4_bw, ft4_gender, ft4_goal, ft4_act` | valeur courante | ❌ écrasé |
| **Entraînement** | `ft4_sessions, ft4_prs, ft4_wkt, ft4_progs` | collection | ✅ pour `sessions` · ❌ pour `prs` (valeur max courante) |
| **Poids / corps** | `ft4_wlog, ft4_bodyscans, ft4_neck, ft4_waist` | mixte | ✅ `wlog`, `bodyscans` · ❌ mensurations |
| **Nutrition** | `ft4_foodlog, ft4_manual_kcal, ft4_diet, ft4_foodmode` | mixte | ✅ `foodlog` · ❌ réglages |
| **Santé** | `ft4_health, ft4_blood, ft4_contra, ft4_menscycle` | valeur courante | ❌ |
| **État du jour** | `ft4_daystate` (aujourd'hui), `ft4_daystatelog` (historique) | **les deux** | ✅ l'historique existe |
| **Milo** | `ft4_coach_mem, ft4_coachfree, ft4_registre, ft4_adn` | valeur courante | ❌ |
| **Interface** | `ft4_theme, ft4_halo, ft4_menuack, ft4_seen*` | préférences | ❌ |

### 3.3 Clés écrites depuis plusieurs fichiers (10 mesurées)

| Clé | Écrite par |
|---|---|
| `ft4_wkt` | `app.js`, `log.js`, `state.js` |
| `ft4_sessions` | `log.js`, `state.js` |
| `ft4_prs` | `log.js`, `state.js` |
| `ft4_coach_mem` | `coach.js`, `state.js` |
| `ft4_email` | `app.js`, `state.js` |
| `ft4_progexos` | `setup.js`, `state.js` |
| `ft4_pending_debrief` | `coach.js`, `log.js` |
| `ft4_halo`, `ft4_haloColor`, `ft4_haloDir` | `app.js`, `state.js` |

### 3.4 Données à surveiller par nature

- **Écrasées au lieu d'être historisées** : les **mensurations** (`neck`, `waist`, `hip`) et le
  **poids objectif**. On ne peut pas tracer leur évolution — alors que `weightLog` l'est.
- **Dérivées mais stockées** : `prs` (calculable depuis `sessions` — la fonction existe :
  `_prsDepuisSeances()`), le `volume` et les `calories` de chaque séance.
  ⚠️ **C'est volontaire et argumenté** : un record peut venir d'un import ou d'un autre
  appareil, donc le recalculer effacerait un vrai record. Ne pas « corriger ».
- **Susceptibles de devenir périmées** : `bodyScans` (le projet applique une règle de 3 mois),
  `registre`, `adn`, `coachMemory` — aucune n'a de date de péremption automatique.
- **Utilisées par plusieurs modules** : `bw` (profil, nutrition, calories, Milo), `sessions`
  (Accueil, Progrès, calendrier, récupération, Milo), `weightLog` (Progrès, nutrition, Milo).

---

## 4. FLUX DE DONNÉES

Chaque flux ci-dessous a été **suivi dans le code**, pas déduit.

### 4.1 Séance

```
Saisie (renderExBlocks, log.js)
  → S.wkt.exs[].sets[]              (mémoire)
  → persist() → ft4_wkt             (disque, à chaque frappe validée)
  → finishWorkout() : calcule volume + calories + records
  → S.sessions.unshift(...) + S.prs mis à jour
  → persist() → ft4_sessions, ft4_prs
  → _cloudSyncSessions() (Apps Script)  ET  syncSheets() (classeur Google)
  → buildCoachContext() lit S.sessions et S.prs
```

**Points de perte identifiés :** une séance en cours n'entre dans l'historique **qu'à la fin**.
Trois actions la détruisent (annuler, vider, charger un programme) — les trois demandent
désormais confirmation.

### 4.2 Progression et records

```
S.sessions → bz(kg, reps) [state.js] → e1RM par série
  → max par exercice → S.prs
  → renderChart() / renderProgress() [setup.js]
  → contexte de Milo
```

⚠️ **`bz()` plafonne les répétitions à 20.** Toute charge à 20 reps ou plus vaut donc
2,1 × la charge. C'est ce qui a permis à un import mal lu de créer un record de 1 060 kg
(corrigé depuis par un plafond de sortie à 600 kg).

### 4.3 Nutrition

```
Profil (bw, age, height, gender, activityLevel)
  → calcBMR() → calcTDEE() → calcMacros()   [tous dans state.js]
  → cycleGlucides() : répartit glucides/lipides selon jour de séance ou de repos
  → renderNutrition() [screens.js]
  → contexte de Milo
Journal : saisie → S.foodLog → anneaux → ❌ PAS transmis à Milo (exclusion écrite)
```

### 4.4 Poids

```
Pesée manuelle : saveWeightEntry() [tracking.js] — bornée 20–300 kg
Bilan corporel : saveBodyScan()    [tracking.js] — mêmes bornes depuis ft-v1096
  → S.weightLog[] (clé `kg`) + S.bw (valeur courante)
  → tendance (kg/semaine) → comparée aux plages de l'objectif
  → écran Progrès ET contexte de Milo (même source depuis ft-v1100)
```

### 4.5 Profil

```
Saisie manuelle : saveProfile() [setup.js] — bornes 14–99 ans, 100–229 cm, 20–300 kg
Restauration    : _applyRestoreData() [setup.js] — MÊMES bornes depuis ft-v1099
  → S.* → persist() → contexte de Milo
```

### 4.6 Blessures et exclusions

```
Profil → Santé : S.healthProfile.injuries[{zone, status}] + notes libres
Check-in       : S.dayState.pains[{zone}]
  → _gardienZones() [coach.js] : fusionne les deux
  → _gardienRules() : produit un bloc de consignes placé EN TÊTE du contexte
  → _gardienNoteDuJour() : observation sur la séance du jour, placée EN BAS
```

**Mesuré :** sans blessure déclarée, `_gardienRules()` rend **0 caractère**. Avec une blessure
active, **1 797 caractères**, et la zone atteint bien le contexte.

### 4.7 Récupération

```
sleepLog + sessions récentes + âge + tabac + cycle menstruel + dayState
  → score /100 [tracking.js] → carte de l'Accueil → contexte de Milo
```

### 4.8 Milo — le flux qui compte le plus

**Découverte de cet audit : le message envoyé a SIX canaux, pas un.**

```
sendToCoach(message)  [coach.js]
  → payload = {
      action:'coach',
      email,
      message,
      context      ← buildCoachContext()   ~75 000 caractères
      history      ← les 8 derniers messages
      coachMemory  ← S.coachMemory (chaîne)   ← HORS du contexte
    }
  → _aiUrl('coach') → Cloudflare Worker → API Claude
```

⚠️ **Conséquence pour tout audit futur** : `coachMemory` **ne figure pas dans
`buildCoachContext()`**. Un audit qui n'inspecte que le contexte le déclarera « manquant »
alors qu'il part bien. C'est arrivé pendant cette passe.

⚠️ **Autre piège mesuré** : un message de simple salutation (« Salut ») **ne déclenche aucun
appel réseau** — l'application y répond localement. Une sonde qui teste avec « Salut » mesure
zéro et conclut à tort.

---

## 5. SOURCES DE VÉRITÉ — DUPLICATIONS SUSPECTES

### 5.1 Méthode, et ce qui ne marche pas

Un détecteur naïf a été essayé : chercher les **nombres-seuils** comparés dans plusieurs
fichiers. **Il ne fonctionne pas** — les 14 premiers candidats sont `5, 4, 60, 20, 7, 10, 8,
90…`, présents dans 6 à 8 fichiers pour des raisons sans rapport entre elles.
*L'égalité numérique n'est presque jamais une parenté.* Ce constat avait déjà été mesuré par
le projet ; il est reconfirmé ici.

Le détecteur qui **fonctionne** cherche des **noms identiques définis deux fois**.

### 5.2 Résultats mesurés

**Fonctions définies dans plusieurs fichiers : 0.** L'espace global est propre de ce côté.

**Constantes en majuscules définies plusieurs fois : 5**, dont **3 faux positifs** (`ICO`,
`LBL`, `MAX` sont des constantes **locales** à des fonctions, avec des sens différents).

Restent **deux duplications réelles** :

#### Duplication A — `BIG3`

| Emplacement | Forme |
|---|---|
| `constants.js:231` | `const BIG3=['Squat à la Barre','Développé Couché','Soulevé de Terre']` |
| `coach.js:325` | `const BIG3=/squat à la barre\|développé couché\|soulevé de terre/i` |

Deux définitions de « qu'est-ce que le Big 3 » : une **liste de noms exacts**, une **expression
régulière**. Si un exercice est renommé dans le catalogue, la liste suit et la regex non.

#### Duplication B — `MAX_MB`

`const MAX_MB=15` est écrit **trois fois** : `log.js:5833`, `log.js:6174`, `app.js:5063`.
C'est la taille maximale d'un fichier importé. Trois copies d'un même plafond.

### 5.3 Famille déjà connue du projet

La famille que ce chapitre cherche est celle des **plages de variation de poids selon
l'objectif** : l'écran annonçait une plage tandis que le contexte de Milo appliquait une autre
logique. Elle a été corrigée (source unique dans `state.js`). Le mécanisme à retenir : **une
règle écrite en PROSE dans un affichage n'est lisible par aucun code**, donc elle sera
inévitablement ré-écrite ailleurs, différemment.

⚠️ **Ce document ne tranche pas** quelle définition est correcte dans les cas A et B. C'est une
décision à prendre.

---

## 6. CARTOGRAPHIE DES CALCULS

| Calcul | Fonction propriétaire | Fichier | Appels mesurés | Consommateurs |
|---|---|---|---|---|
| Métabolisme de base | `calcBMR()` | `state.js` | 3 | TDEE, écran Nutrition, Milo |
| Dépense totale | `calcTDEE()` | `state.js` | 3 | macros, anneaux, Milo |
| Macros | `calcMacros()` | `state.js` | 8 | Nutrition, Milo, plan de repas |
| Cyclage glucidique | `cycleGlucides()` | `state.js` | 1 | `calcMacros` |
| e1RM | `bz()` | `state.js` | — | records, progression, Milo |
| Muscles travaillés | `_mscScores()` | `log.js` | 15 | figurine, calendrier, calories, Progrès, Milo |
| Volume par muscle | `_volumeParMuscle()` | `log.js` | 2 | Progrès, Milo |
| MET / calories | `getExerciseMET()`, `calcSessionCalories()` | `app.js` | 1 + 2 | fin de séance, Nutrition |
| Semaine de cycle | `getCurrentCycleWeek()` | `tracking.js` | 3 | écran Cycle, Milo |
| Cycle terminé | `cycleTermine()` | `tracking.js` | — | écran Cycle **et** Milo (même propriétaire) |
| Plan de la semaine | `getWeekPlan()` | `tracking.js` | 4 | écran Cycle |
| Projection de force | `projectRM()` | `tracking.js` | 2 | écran Cycle |
| Phase du cycle menstruel | `getMensCyclePhase()` | `state.js` | 8 | récup, nutrition, Milo |
| Badges | `_checkBadgeCond()` | `app.js` | via `checkBadges()` ×6 | écran Badges |
| Records recalculés | `_prsDepuisSeances()` | `setup.js` | 2 | outil d'administration |
| Séance précédente | `getPrev()` | `log.js` | 8 | pré-remplissage, colonne « précédent » |
| Contexte de Milo | `buildCoachContext()` | `coach.js` | 7 | envoi, banc d'essai, export |

**Calcul reproduit ailleurs :** aucun cas de fonction dupliquée n'a été trouvé. Le risque de ce
projet n'est pas la fonction copiée, c'est la **règle écrite en prose à côté du calcul**
(voir §5.3).

---

## 7. DÉPENDANCES ET ZONES DE RISQUE

### 7.1 Les fonctions au plus grand rayon d'impact

| Fonction | Appels | Fichier | Ce qu'elle touche |
|---|---|---|---|
| `toast()` | **519** | `tracking.js` | affichage seulement — risque faible malgré le nombre |
| `persist()` | **217** | `state.js` | **écrit tout `S` sur le disque** — rayon maximal |
| `_escNote()` | 57 | `log.js` | échappement de texte libre — **sécurité d'affichage** |
| `_cloudSyncDebounced()` | 46 | `setup.js` | envoi cloud |
| `_escIdea()` | 44 | `app.js` | échappement (2ᵉ fonction pour le même besoin) |
| `renderExBlocks()` | 43 | `log.js` | rendu de la séance |
| `numFR()` | 43 | `state.js` | conversion virgule → point |
| `goScreen()` | 36 | `screens.js` | navigation — **préfixe `s-` lui-même** (piège connu) |
| `showConfirm()` | 27 | `log.js` | toutes les confirmations destructrices |

### 7.2 Classement par risque

| Zone | Risque | Justification **mesurée** |
|---|---|---|
| `persist()` et l'écriture de `S` | **ÉLEVÉ** | 217 appels ; écrit **tout** l'état ; une seule fonction pour 106 champs ; comportement multi-onglets récemment corrigé mais partiellement (§8) |
| Contexte de Milo (`buildCoachContext`) | **ÉLEVÉ** | ~75 000 caractères ; 56 champs de `S` atteints via 61 fonctions ; deux trous connus ; l'oubli y est **silencieux** |
| `finishWorkout()` / `saveSessEdits()` | **ÉLEVÉ** | écrivent `sessions` **et** `prs` **et** déclenchent 2 synchronisations ; toute erreur touche l'historique |
| `_applyRestoreData()` | **ÉLEVÉ** | écrit **71** champs d'un coup ; chemin automatique, personne ne relit ; famille de défauts déjà constatée 5 fois |
| Bornes de validation (`state.js`) | **MOYEN** | propriétaire unique désormais, mais chaque nouvelle porte d'entrée doit penser à les appeler |
| `_mscScores()` et la figurine | **MOYEN** | 15 consommateurs ; la précision anatomique **plafonne** tout ce qui en dépend (couleurs, calories, Milo) |
| Échappement du texte libre | **MOYEN** | **deux** fonctions pour le même besoin (`_escNote`, `_escIdea`) — mesuré sain aujourd'hui, mais deux propriétaires |
| Service Worker | **MOYEN** | voir §9 |
| `goScreen()` | **FAIBLE** | 36 appels, comportement mesuré sain, mais son préfixe implicite a produit **3 faux positifs de test** |
| `toast()` | **FAIBLE** | 519 appels mais aucun effet de bord sur les données |

### 7.3 Ordre de chargement

`constants.js` puis `state.js` doivent précéder tout le reste : `state.js` lit `DEFAULT_URL` et
les tables de `constants.js`. Aucune dépendance circulaire n'a été trouvée à l'exécution
(l'espace global les rendrait de toute façon invisibles au chargement, ce qui est **en soi un
risque** : une inversion d'ordre ne se manifesterait qu'à l'appel).

---

## 8. ÉCRITURES SENSIBLES

### 8.1 Le mécanisme central

`persist()` écrit **l'intégralité de `S`** depuis la mémoire de l'onglet appelant. Ce choix est
simple et robuste dans le cas normal, mais il a une conséquence directe : **l'onglet qui écrit
en dernier gagne**.

### 8.2 Deux onglets ouverts — DÉFAUT REPRODUIT, partiellement corrigé

**Reproduit** dans deux pages du même contexte navigateur : l'onglet B termine une séance
(1 séance + 1 record sur le disque), l'onglet A règle son temps de repos → **0 séance,
0 record**. Le rechargement ne les ramène pas.

**Correction en place** : l'événement `storage` ne se déclenche que dans les *autres* onglets ;
quand il a été reçu, le `persist()` suivant prend l'**union** au lieu de remplacer.

⚠️ **Limite mesurée et non corrigée** : la fusion ne couvre que **5 collections sur 13**
(`sessions`, `weightLog`, `sleepLog`, `foodLog`, `prs`). Les huit autres — `programmes`,
`badges`, `customExercises`, `exSwaps`, `registre`, `coachMemory`, `goalLog`, `exRestPref` —
sont toujours écrasées. **Reproduit** : un programme créé dans l'onglet A est perdu au
`persist()` de l'onglet B.

**La difficulté est réelle** : ces huit collections ne sont **pas datées**, donc le mécanisme
d'union avec départage par date ne s'y applique pas tel quel.

### 8.3 Application depuis l'écran d'accueil + navigateur

C'est le **cas le plus fréquent** du défaut §8.2, pas un cas théorique : une PWA installée et
un onglet Safari partagent le même `localStorage`.

### 8.4 Interruption pendant une écriture — RISQUE THÉORIQUE

`localStorage.setItem` est synchrone ; une interruption au milieu d'une clé est improbable.
En revanche, `persist()` écrit **plusieurs clés à la suite** : une interruption entre deux
clés laisserait un état partiellement à jour. **Non reproduit.**

### 8.5 Hors ligne — MESURÉ SAIN

Une séance terminée sans réseau est écrite sur le disque, mise en file (`synced:false`), et les
écrans rendent sans erreur JS. La file ne renvoie que ce qui est marqué `synced===false`.

⚠️ **Nuance non écrite dans le code** : une séance **sans** le champ `synced` (restaurée depuis
le cloud, ou ancienne) n'est **jamais** reprise par la file. C'est probablement voulu — une
séance restaurée est déjà dans le classeur — mais ce n'est écrit nulle part.

### 8.6 Sauvegardes secondaires

Trois chemins coexistent : `_cloudSync()` (Apps Script, `mode:'no-cors'`), `sbMirror`
(Supabase) et `syncSheets()` (classeur Google, avec confirmation serveur).
Le premier **ne peut pas** savoir s'il a réussi (`no-cors`), par conception historique.

---

## 9. SERVICE WORKER ET CACHE

### 9.1 État mesuré

- **Version actuelle** : `ft-v1101` (constante `CACHE` en tête de `sw.js`).
- **Trois caches** : `CACHE` (versionné, purgé à chaque version), `IMG_CACHE = 'ft-images'`
  (**nom stable**, jamais purgé), `OCR_CACHE = 'ft-ocr'` (stable).
- **Pré-cache** : la page, le CSS, **les 10 scripts**, le manifeste, les polices locales, les
  4 bibliothèques, les captures du guide.
- **Stratégie** : navigation → cache d'abord avec revalidation réseau en parallèle ; autres
  assets → cache d'abord, mise en cache à la demande pour ce qui n'est pas pré-caché.
- **Mise à jour** : `skipWaiting()` à l'installation + `clients.claim()` à l'activation → la
  nouvelle version s'active immédiatement.

### 9.2 Risque principal : l'oubli de version

Le numéro `ft-vNN` est **écrit à la main**. S'il n'est pas incrémenté alors qu'un asset a
changé, les utilisateurs restent sur l'ancienne version **sans aucun signal**.

⚠️ **Un cas réel documenté** : `supabase.js` était le **seul** des 10 scripts absent du
pré-cache. Conséquence silencieuse — application ouverte hors ligne après une mise à jour, la
balise `<script>` échoue, la sauvegarde miroir est morte pour toute la session, et le
`try/catch` avale l'absence.

**Ce que ce cas enseigne** : le risque n'est pas seulement « oublier le numéro », c'est
**oublier d'ajouter un nouveau fichier à la liste**. Rien ne le détecte automatiquement.

### 9.3 Exclusions volontaires

`data/ciqual.json` et `data/complalim.json` (≈250 Ko) sont **délibérément** hors pré-cache :
ils seraient re-téléchargés à chaque version pour une base que beaucoup n'ouvriront jamais. Ils
sont mis en cache à la première recherche d'aliment. **Décision écrite — ne pas la « réparer ».**

---

## 10. TESTS EXISTANTS

### 10.1 Volumétrie par suite

| Suite | Assertions écrites | Lignes | Domaine |
|---|---|---|---|
| `tests/parcours/` | 4 980 appels, **2 379 exécutés** | 23 441 | parcours de bout en bout, tous domaines, 133 blocs |
| `tests/calculs/` | 387 | 1 834 | TDEE, macros, e1RM, calories |
| `tests/muscles/` | 284 | 1 465 | figurine, attribution musculaire |
| `tests/croises/` | 79 | 610 | cohérence catalogue (groupe × muscles × mouvement × image) |
| `tests/dates/` | 12 | 86 | fuseaux horaires, changements d'heure |
| `tests/donnees/` | 5 | 93 | **classification** des données face à Milo |
| `tests/milo/` (Tier 1) | 9 | 134 | scénarios déterministes de sécurité |
| `tests/milo/eval.js` (Tier 2) | 55 scénarios | — | banc d'essai avec **appels réels payants** |

⚠️ **L'écart 4 980 écrits / 2 379 exécutés** s'explique par des assertions dans des branches
non prises. Le total exécuté est le chiffre honnête.

### 10.2 Couverture par domaine

| Domaine | Couverture | Commentaire |
|---|---|---|
| Entraînement, séance, records | **bonne** | nombreux blocs de parcours, chaque bug devient un test |
| Muscles / catalogue | **bonne** | 2 suites dédiées, 363 assertions |
| Calculs nutritionnels | **bonne** | 387 assertions |
| Contexte de Milo (présence) | **moyenne** | classification + détecteur R8 ; prouve la présence, **jamais l'obéissance** |
| Comportement de Milo | **faible** | seul le Tier 2 payant le mesure, et il n'a pas tourné pour de vrai récemment |
| Dates / fuseaux | **faible en nombre** (12) mais ciblée sur une famille de bugs connue |
| Multi-onglets | **partielle** | le cas corrigé est testé ; les 8 collections non fusionnées ne le sont pas |
| Service Worker | **absente** | aucun test ne vérifie que le pré-cache contient tous les scripts servis |
| Interface / mise en page | **faible** | quelques mesures de position (le bouton central de la séance est mesuré, pas regardé) |

⚠️ **« Aucun test trouvé » ne veut pas dire « cassé ».** Le Service Worker n'a pas de test et
fonctionne ; c'est le *risque de régression silencieuse* qui est élevé, pas l'état actuel.

---

## 11. DÉFAUTS ET POINTS OUVERTS CONSTATÉS PENDANT CET AUDIT

⛔ **Aucun n'a été corrigé.**

### Défaut 1 — `badges` déclaré transmis à Milo, ne l'est pas

- **Constat** : le fichier de classification déclare `badges` « transmis » à Milo.
- **Preuve** : `S.badges` n'apparaît qu'**une fois** dans `coach.js`, et c'est dans
  `_vcApplyPersona()` — la fonction qui **efface** le champ pour les personas de test. Mesure
  par injection d'un marqueur : absent du contexte **et** du payload complet.
- **Impact** : faible en soi (Milo ignore les badges), mais **le garde-fou mentait**.
- **Zone** : `tests/donnees/donnees-milo.json`, `coach.js`.
- **Test manquant** : un test qui **mesure** la transmission au lieu de lire la déclaration.

### Défaut 2 — `dayStateLog` déclaré transmis, ne l'est pas

- **Constat** : idem pour l'historique du check-in.
- **Preuve** : **zéro** occurrence de `S.dayStateLog` dans `coach.js`. Marqueur absent du
  payload complet.
- **Impact** : **plus sérieux**. C'est l'historique de l'énergie, du moral, des douleurs et des
  notes libres. Milo ne peut donc rien dire de l'évolution du ressenti sur la durée, alors que
  la donnée existe et s'accumule.
- **Zone** : `coach.js`, `screens.js`.
- **Test manquant** : le même que ci-dessus.

### Défaut 3 — `BIG3` défini deux fois (§5.2)

- **Impact** : un renommage d'exercice désynchroniserait la liste et la regex.
- **Test manquant** : un test qui vérifie que la regex reconnaît exactement les 3 noms de la
  liste.

### Défaut 4 — `MAX_MB` défini trois fois (§5.2)

- **Impact** : faible ; un changement de plafond appliqué à deux endroits sur trois.
- **Test manquant** : un test qui refuse une 2ᵉ définition littérale du plafond.

### Point ouvert 5 — fusion multi-onglets incomplète (§8.2)

- **Impact** : perte silencieuse de programmes, badges, exercices persos, mémoire de Milo.
- **Décision requise** : dater ces collections, les fusionner par identité, ou **assumer et
  écrire** la limite.

### Point ouvert 6 — un record survit à la suppression de sa séance

- **Preuve** : séance supprimée (2 → 1), record de 112,5 kg conservé, et il atteint Milo.
- **Pourquoi ce n'est pas un correctif évident** : recalculer automatiquement effacerait un
  record légitime venu d'un import ou d'un autre appareil. La forme correcte est probablement
  d'**avertir** au moment de supprimer.

### Point ouvert 7 — `getLevel()` est du code dormant

- **Constat** : la fonction de calcul du niveau de force n'est plus appelée par l'application
  depuis une refonte de l'écran d'accueil. Elle est conservée volontairement.
- ⚠️ **Ne pas la « réparer »** : c'est un retrait décidé.

---

## 12. CE QUE CET AUDIT A MESURÉ SAIN (à ne pas rechasser)

- **Échappement du texte libre** : un nom d'exercice piégé rendu sur 5 écrans → **0 script
  exécuté**, 0 balise injectée. Le contrôle prouve que le nom était bien **affiché**.
- **Timer de repos** : s'appuie sur `Date.now()`, donc il résiste à la mise en veille.
- **Séries spéciales** : échauffement et série « W » hors volume, drop set dedans, aucun record
  depuis un échauffement — cohérent partout.
- **Navigation** : les 7 écrans sont atteignables ; un écran inexistant ne casse rien.
- **Contraception hormonale** : correctement traitée — **aucune phase naturelle** n'est annoncée
  à Milo sous pilule.
- **R8 (le prompt nomme-t-il une source qu'il ne reçoit pas ?)** : **0 trou** sur 11 sources
  vérifiées.
- **Gardien de sécurité** : 0 caractère sans blessure, 1 797 avec, et la zone atteint le
  contexte.

---

## 13. AVERTISSEMENT DE MÉTHODE POUR LA SUITE

Ce projet a une pathologie de mesure documentée, et elle a frappé **neuf fois** pendant la
seule passe qui a produit ce document. **Toute sonde qui « ne trouve rien » doit être
suspectée avant le code.**

Les causes réelles, mesurées :

| Piège | Exemple réel |
|---|---|
| Nom de champ inventé | `customExercises` stocke `{n, g}`, pas `{name}` |
| Vocabulaire fermé | `contraception` attend `pill-combo`, pas « pilule » |
| Type inattendu | `coachMemory` est une **chaîne**, pas un tableau |
| Donnée seulement **dérivée** | `healthDaily` se tait sous 7 jours d'historique |
| Drapeau qui court-circuite | `_demoMode` fait sortir `syncSheets()` à sa 1ʳᵉ ligne |
| Argument oublié | `sendToCoach()` sans message lit un champ de saisie et sort |
| Court-circuit local | « Salut » ne déclenche **aucun** appel réseau |
| Préfixe implicite | `goScreen()` ajoute `s-` lui-même |

👉 **Le symptôme est toujours identique : tout paraît absent.** D'où la règle : **exiger de
voir une donnée connue** (contrôle positif) avant de conclure à une absence.

---

## LES 10 AUDITS À FAIRE ENSUITE

Classés par priorité, chaque priorité étant justifiée par un fait mesuré de ce document.

**1. La fusion multi-onglets des 8 collections non couvertes** (§8.2)
Perte reproduite, touche la règle n°1 du projet (zéro perte). Décision de conception requise :
ces collections ne sont pas datées.

**2. Ce que Milo reçoit vraiment, canal par canal** (§4.8, §11)
Le payload a 6 canaux ; deux données déclarées transmises ne le sont pas. Refaire la carte
**par mesure**, pas par déclaration, pour les 106 champs.

**3. Le comportement de Milo, pas seulement la présence de ses données** (§10.2)
Tout l'outillage actuel prouve la présence. Le banc d'essai réel (55 scénarios, coût mesuré
0,84 à 3,63 €) n'a pas tourné récemment, alors que deux changements de contexte ont été livrés.

**4. Le pré-cache du Service Worker contre la liste réelle des fichiers servis** (§9.2)
Un fichier servi mais absent du pré-cache produit une panne **silencieuse** hors ligne. Un cas
réel a déjà eu lieu. Aucun test ne couvre cette zone.

**5. Les chemins d'écriture automatiques face aux chemins manuels** (§7.2)
La famille a mordu 5 fois : le chemin automatique est systématiquement le moins protégé.
Restent à instruire : import de programme, code-barres, bilan sanguin.

**6. Les règles écrites en PROSE à côté d'un calcul** (§5.3)
C'est le vrai générateur de doubles sources de vérité dans ce projet, bien plus que la
duplication de fonctions (mesurée à 0). Chercher les phrases d'écran qui énoncent un seuil.

**7. Les données écrasées au lieu d'être historisées** (§3.4)
Mensurations et poids objectif n'ont pas d'historique, alors que le poids en a un. Décider si
c'est voulu.

**8. Le cycle de vie des données périssables** (§3.4)
`registre`, `adn`, `coachMemory`, `bodyScans` n'ont pas de date de péremption uniforme. Milo
peut donc s'appuyer sur un fait devenu faux.

**9. Les deux fonctions d'échappement** (§7.2)
`_escNote` et `_escIdea` couvrent le même besoin. Mesuré sain aujourd'hui ; deux propriétaires
pour une garantie de sécurité est une dette.

**10. `getPrev()` et le pré-remplissage** (§6)
8 consommateurs, aucun test dédié trouvé, et le projet a déjà constaté qu'un pré-remplissage
correct dans un contexte devient faux dans un autre.

---

*Document produit le 02/09/2026 sur la version `ft-v1101`. Toutes les mesures sont
reproductibles à partir du dépôt. Aucune modification du code n'a été faite pendant sa
rédaction.*
