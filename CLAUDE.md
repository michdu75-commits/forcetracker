# ⚡ RÈGLES D'OR — à lire à chaque session avant tout le reste

**1. 🚀 Apps Script : TOUJOURS redéployer après un changement de code.**
`clasp push` ne met à jour que le brouillon. Le `/exec` continue de servir l'ancienne version tant qu'on n'a pas **redéployé** (nouvelle version @NN). → Le bug premium venait de là.

**2. 💎 Premium : ne JAMAIS écraser `PREMIUM_EMAILS`.**
Il existe **deux** sources : la Script Property `PREMIUM_EMAILS` **et** la liste `PREMIUM_HARDCODED_` dans le code. Aucune fonction ne doit réécrire/réinitialiser `PREMIUM_EMAILS` (un bug le remettait à `michdu75 + elineazs32` et effaçait les ajouts).

**3. 🛡️ Zéro perte de séance — priorité n°1 absolue.**
Tout est **local-first** : on enregistre en local **avant** toute synchro. Le réseau ne doit **jamais** bloquer ni faire perdre une donnée. La synchro se fait en arrière-plan, avec file d'attente si hors-ligne.

**4. ⚡ Ouverture instantanée à la salle (réseau faible/absent).**
L'app doit s'ouvrir **depuis le cache, même hors-ligne** (Service Worker). Le démarrage ne doit **jamais** attendre une requête réseau.

**5. 🏷️ Incrémenter `ft-vNN` à chaque déploiement.**
Visible dans « À propos ». Sans ça, impossible de savoir quelle version tourne (cache trompeur).

**6. 🔒 Avant toute opération risquée : backup + branche.**
Backend / migration / suppression → créer **branche + tag de backup** d'abord, et faire ça **la nuit** (zéro utilisateur en séance).

**7. 🎨 Garder l'identité « figurines muscles ».**
Ne pas copier Hevy/JEFIT. Une chose à la fois, **testée avant** de passer à la suite.

**8. 💾 Commit étiqueté AVANT chaque modif + tag stable APRÈS + rollback en 1 ligne.**
Avant toute modification importante : `git add + commit` avec message explicite (quoi + version, ex. `"avant: modif profil ft-v161"`). Ne pas mélanger plusieurs changements dans un commit. Après chaque fonctionnalité qui marche : poser un tag daté (`stable-YYYY-MM-DD-sujet-ok`). À la fin de chaque tâche : fournir la commande de rollback (`git reset --hard <tag>` ou `git checkout <tag>`). Cette règle s'applique AVANT le moindre changement de fichier.

**9. 🔴 FAB « + » Séance — SENSIBLE, ne pas toucher sans recalculer.**
Le bouton FAB `#fab-session` est `position:absolute` dans la nav et positionné par `_positionFab()` (via `getBoundingClientRect(#nb-log)`). **Toute modif de l'écran Séance** (ajout d'éléments dans le header, changement de layout du DOM) **doit vérifier que le FAB reste bien positionné**. `_positionFab()` est appelé via `requestAnimationFrame` à chaque `_syncLogHdrBtns()` (déclenché à chaque `renderExBlocks()`). Si le FAB se décale : appeler `_positionFab()` manuellement après le changement. Ne jamais supprimer les appels `requestAnimationFrame(_positionFab)` de `_syncLogHdrBtns()`.

**10. 🗣️ Michel n'est ni développeur ni programmeur — adapter la communication.**
Michel conçoit l'appli avec l'aide de Claude (design/réflexion/prompts), il ne code pas lui-même. Toujours :
- **Expliquer simplement**, sans jargon technique (ou alors le traduire en une phrase claire).
- **Prévenir avant tout truc risqué** et proposer un backup + une méthode de rollback simple, **avant** d'agir.
- **Ne jamais supposer** qu'il sait lancer une commande — le guider pas à pas, une étape à la fois.
- **Une chose à la fois**, testée et validée avant de passer à la suivante.

---

# Force Tracker — Contexte projet pour Claude

## Présentation

PWA de suivi de musculation (Progressive Web App), conçue pour mobile (max-width 430 px). Single-page app HTML/CSS/JS pur, sans framework ni build step. Déployée sur GitHub Pages.

- **Repo GitHub** : https://github.com/michdu75-commits/forcetracker
- **App live** : https://michdu75-commits.github.io/forcetracker/
- **Auteur** : Michel — michdu75@gmail.com

## Backend Apps Script (v3.5 @57 — actif)

- **Compte Google** : forcetracker.app@gmail.com
- **URL déployée** : `https://script.google.com/macros/s/AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA/exec`
- **Script ID** : `1RwE46heNmZrykInYcrMgm1OZWt4NmS6NjTqttvAevZLuqo2v6EEb1Drw`
- **Sheet Google** : `1b0kuCk6kuNi26hMJq5Q5R6-mKFeXEexfm2P9SryJ-eg` (onglets Séances, Premium, etc.)
- **Fichier local** : `Code.js` (géré via clasp)
- **clasp** : toujours préfixer avec `NODE_TLS_REJECT_UNAUTHORIZED=0` (SSL Windows)
- **Déploiement web app** : Execute as = Me, Who has access = Anyone — ⚠️ à vérifier après chaque redéploiement UI

### Config Script Properties (script.google.com → Paramètres du projet)
| Propriété | Usage |
|---|---|
| `ANTHROPIC_API_KEY` | Clé API Claude pour le Coach IA |
| `PREMIUM_EMAILS` | Emails whitelist indéfinis, séparés par `,` |
| `PREMIUM_CODES` | Codes d'accès payants, séparés par `,` |
| `KOFI_TOKEN` | Token webhook Ko-fi (optionnel) |

### Commandes clasp utiles
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp push --force   # pousser Code.js
NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp deploy          # nouveau déploiement
NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp login           # (re)connexion
```

### ⚠️ Piège déploiement Apps Script — clasp push ≠ en ligne

`clasp push` met à jour le code source du projet Apps Script, mais **ne met PAS à jour la web app en production**. Le déploiement actif continue de tourner sur l'ancienne version jusqu'à la commande suivante :

```bash
# Mettre à jour le déploiement EXISTANT (obligatoire pour que l'app en prod soit à jour)
NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp deploy -i AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA
```

Sans `-i <deploymentId>`, `clasp deploy` crée un NOUVEAU déploiement avec une nouvelle URL — l'app ne le connaît pas. Toujours utiliser `-i` avec l'ID existant.  
Séquence systématique après chaque modif backend : **push → deploy -i → vérifier `?test=1` retourne `{"status":"online"}`**.

## Architecture

| Fichier | Rôle |
|---|---|
| `index.html` | Structure HTML + balises `<script src>` — pas de JS inline |
| `style.css` | Tout le CSS (variables, composants, dark/light mode) |
| `constants.js` | EXLIB, BIG4, DEFAULT_URL, STD (niveaux de force), EX_YT, EX_EN, _MUSCLE_SVG |
| `state.js` | Objet `S`, `load()`, `persist()`, `calcTDEE()`, `calcMacros()`, `bz()` |
| `app.js` | Bootstrap (`autoConnect`, `onLoad`), nutrition, cardio, pilule repos, `_premiumPending` |
| `screens.js` | Navigation (`goScreen`, swipe), `renderHome()`, `renderNutrition()`, `updatePill()` |
| `log.js` | Séance : `startWorkout()`, `renderLog()`, `renderExBlocks()`, timer repos, plaques |
| `coach.js` | Chat IA : `sendToCoach()`, `buildCoachContext()`, `showPremiumWall()`, morpho |
| `setup.js` | Profil : `renderProgress()`, `renderChart()`, `_cloudSync()`, éditeur programmes |
| `tracking.js` | Cycle de force, badges, check-in, sommeil, `toast()` |
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache `ft-v160` |
| `Code.js` | Backend Google Apps Script v3.5 @57 (sync cloud, coach IA, premium, import programme) |
| `manifest.json` | Config PWA (icône, couleurs, display:standalone) |
| `appsscript.json` | Manifest Apps Script (scopes OAuth, timezone, webapp config) |
| `female-body.png` | Silhouette féminine — présent mais non utilisé (voir Notes techniques) |

**État persistant** : `localStorage` — clés préfixées `ft4_*`  
**Objet global** : `S` (state) — chargé par `load()`, sauvé par `persist()`  
**URL Apps Script** : `DEFAULT_URL` dans `constants.js` (ligne ~110), jamais saisie par l'utilisateur  
⚠️ **Ne jamais changer DEFAULT_URL sans la mettre à jour dans constants.js ET redéployer**

### Carte des modules — grandes fonctions

| Fonction | Fichier | Rôle |
|---|---|---|
| `load()` / `persist()` | `state.js` | Chargement/sauvegarde localStorage |
| `autoConnect()` | `app.js` | Ping Apps Script + chargement statut premium au démarrage |
| `goScreen(id, btn)` | `screens.js` | Navigation entre écrans |
| `renderHome()` | `screens.js` | Rendu écran accueil (stats, PRs, récup) |
| `renderLog()` | `log.js` | Rendu écran séance |
| `renderExBlocks()` | `log.js` | Rendu des blocs exercice (collapse/expand) |
| `startWorkout()` | `log.js` | Démarrage séance + chrono |
| `finishWorkout()` | `log.js` | Fin séance → calcul PRs → cloud sync |
| `startRest(sec)` | `log.js` | Démarrage timer repos |
| `renderProgress()` | `setup.js` | Rendu onglet Progrès (graphiques, badges) |
| `renderChart()` | `setup.js` | Graphique 1RM par exercice |
| `_cloudSync()` | `setup.js` | Sync complète vers Apps Script |
| `renderNutrition()` | `screens.js` | Rendu onglet Nutrition |
| `calcTDEE()` | `state.js` | Calcul TDEE (Harris-Benedict adaptatif) |
| `calcMacros(phase)` | `state.js` | Calcul macros selon objectif + phase |
| `buildCoachContext()` | `coach.js` | Construction du system prompt Coach IA |
| `sendToCoach()` | `coach.js` | Envoi message + gestion quota/premium |
| `showPremiumWall()` | `coach.js` | Affichage mur payant (vérifie `_premiumPending`) |
| `checkBadges(silent)` | `tracking.js` | Vérification et déblocage des badges |
| `renderCycleScreen()` | `tracking.js` | Rendu écran cycle de force |
| `toast(msg, type)` | `tracking.js` | Notification toast (succès/erreur/info) |
| `bz(kg, reps)` | `state.js` | Formule Brzycki → 1RM estimé |
| `getLevel(ex, rm1, bw, gender, age)` | `constants.js` | Niveau de force (Débutant→Élite) |

## Écrans (navigation bas de page)

| ID | Onglet | Contenu |
|---|---|---|
| `s-home` | 🏠 Accueil | Stats du mois, bouton séance, récupération, cycle de force, niveau de force, PRs |
| `s-log` | ⚡ Séance | Exercices actifs, sets/reps/kg, repos, calculateur de plaques |
| `s-progress` | 📈 Progrès | Graphique 1RM par exercice, suivi du poids de corps, corrélations |
| `s-nutrition` | 🍽️ Nutrition | Macros TDEE adaptatif, plan de repas, suppléments (créatine, whey), calories brûlées |
| `s-setup` | 👤 Profil | Profil athlète (âge/taille/poids/sexe/objectif/activité), composition corporelle |
| `s-coach` | 🤖 Coach IA | Chat Claude Haiku via Apps Script, contexte profil injecté |
| `s-cycle` | — | Cycle de force (config + vue active), accès depuis s-home |

**Navigation** : Accueil · Progrès · **Séance** (centre, FAB rouge 54px) · Nutrition · Coach · Setup  
**Mode admin** : 5 taps sur le logo → onglet "Admin" caché dans Setup (email, test connexion, restaurer, réponse brute API)

## Fonctionnalités implémentées

### Entraînement (session 2026-06-13/14)
- Suivi de séances (exercices, séries, reps, poids)
- **Types de série** : N (Normal) / W (Warm-up, exclu du volume) / E (Échec) / D (Drop set)
  - Couleurs : N=gris, W=bleu, E=rouge, D=violet
  - Timer adaptatif par type : N=defRest, W=45s, E=240s, D=20s
  - **Popup d'aide** ℹ️ (icône dans l'en-tête exercice) → `openTypeHelp()` / modal `#ov-type-help`
- **1RM live** affiché dans le badge de type (sous la lettre), formule Brzycki `bz(kg,reps)`
- **Auto-focus** : après saisie du poids → focus auto sur reps (700ms debounce, `_onKgInput`)
- **Timer de repos sticky** : entre log-sleep et exercices, `position:sticky;top:0;z-index:10`
  - Couleur : >50% vert → >20% or → rouge — à 0 : le timer s'arrête et disparaît (pas d'overtime, voir ft-v166)
  - Durée par défaut : **130s**, boutons −15s / +15s
  - **100% silencieux** (vibrations + visuel seulement) — ne jamais ajouter d'audio ici (coupe la musique iPhone, ft-v166)
- **Collapse/expand exercices** : un seul exercice ouvert à la fois (`_expandedEx`)
  - Ajout exercice → le dernier s'ouvre, les autres se replient
  - **Auto-scroll** : `addExercise()` appelle `scrollIntoView({block:'start'})` 80ms après `renderExBlocks()` — nécessaire car `#log-sleep` (~200px) pousse le bloc hors de la vue sur petits écrans
  - Vue repliée : ligne compacte avec nom + sets
- **Confirmation suppression** : modal `#ov-confirm` avant `rmEx(ei)` → `showConfirm(title,msg,cb)`
- PRs automatiques (calcul 1RM Brzycki) par exercice
- Niveaux de force (Débutant/Novice/Intermédiaire/Avancé/Élite) par genre/âge
- Calculateur de plaques (visualisation disques sur barre)

### Visualisation des séances passées
- Modal `#ov-sess-detail` : voir + modifier les kg/reps de chaque set d'une séance passée
- Affiche 1RM calculé `~Xkg` pour chaque set
- `_renderSessDetailContent()` / `openSessDetail(i)` / `saveSessDetail()`

### Cloud sync — ✅ COMPLET (2026-06-13)
- **`_cloudSync()`** : envoie TOUT au cloud — profil + sessions(100) + prs + weightLog(365) + sleepLog(365) + cycle
- **`_cloudSyncDebounced()`** : appelé par `persist()` — debounce 4s → pas de spam réseau
- **`finishWorkout()`** : appelle `_cloudSyncSessions()` (alias de `_cloudSync()`) après chaque séance
- **Restauration** : `_applyRestoreData()` restaure sessions, prs, weightLog, sleepLog, cycle depuis le cloud
- **Stockage** : `PropertiesService.getScriptProperties()` — clé `u_{email}` — limite 9MB total

### Suivi physique
- Journal de poids de corps avec graphique (courbes bézier)
- Calcul IMC, corrélations poids/volume
- Composition corporelle — méthode US Navy (tour de cou/taille/hanches)
- Check-in post-séance (sommeil, énergie) → score de récupération
- Suivi sommeil avec graphique

### Nutrition
- TDEE adaptatif (Harris-Benedict révisé) : âge, taille, poids, sexe, activité, type de travail, tabac
- Phases charge/décharge (macros différentes)
- Adaptation par objectif (muscle / perte / force / rééquilibrage / endurance)
- Adaptation par phase du cycle menstruel (femmes)
- Plan de repas détaillé (5 repas)
- Calculateur suppléments : créatine (phases charge/entretien), whey (objectif protéines journalier)
- Calories brûlées à la séance

### Cycle de force
- Planification 8-20 semaines avec phases auto (Accumulation → Intensification → Peak → Décharge)
- Projections 1RM fin de cycle (taux selon niveau et âge)
- Vue semaine par semaine avec charges recommandées (%1RM)

### UX / PWA
- Onboarding 5 étapes (nom → compte existant? → profil → objectif → email)
- Restauration depuis email à l'onboarding
- Mode jour/nuit (toggle dans Setup)
- Animation logo (pulsation rouge)
- Ripple effect sur tous les boutons
- Install prompt PWA (iOS : instructions, Android : prompt natif)
- Toast notifications (succès/erreur/info)
- **`#install-banner`** : `pointer-events:none` sur le container, `pointer-events:auto` sur boutons/liens — empêche le banner fixe de bloquer le scroll et les touches dans `s-log`
- **`#install-banner.hidden button, #install-banner.hidden a`** : `pointer-events:none` — empêche les boutons du banner caché de capturer les taps sur le FAB
- **`.screen` padding-bottom** : 110px (était 90px) — espace suffisant pour "Terminer la séance" sous le banner
- **Service Worker** `sw.js` : navigation cache-first (ouverture instantanée) + revalidation silencieuse en fond, assets cache-first (offline OK)
  - Cache actuel : `ft-v160`
  - ⚠️ À chaque modif d'asset (logo, images) : bumper `CACHE = 'ft-vN'` dans `sw.js`
  - `controllerchange` listener dans `index.html` → rechargement auto quand nouveau SW prend le contrôle (pas besoin que les users vident le cache manuellement)

### Coach IA — Photo corporelle (2026-06-13)
- Bouton 📷 dans `s-coach` → `openCoachCamera()` → `<input type=file accept=image/*>`
- `onCoachImgSelected(input)` : redimensionne via canvas (max 800px, JPEG 0.8) → `_coachImg` (base64)
- `sendToCoach()` : si `_coachImg` présent, payload inclut `image` + `imageType` → envoyé à Apps Script
- `clearCoachImg()` : réinitialise après envoi
- Backend `handleCoach_` : construit `userContent` multimodal (`{type:'image',...},{type:'text',...}`)
- Système prompt inclut : "Quand une photo est fournie, analyse la composition corporelle visible..."

### Morphologie (✅ implémenté 2026-06-15)

**Hommes** : H (Rectangle) · A (Triangle) · T (Trapèze) · V (Triangle inversé) · O (Ovale)  
**Femmes** : H (Rectangle) · A (Poire) · V (Triangle inversé) · X (Sablier) · O (Ronde)  
**Morphotypes** : `ecto` (mince) · `meso` (athlétique) · `endo` (rond)

- `S.morpho` (ft4_morpho) + `S.morphotype` (ft4_morphot) — persistés + sync cloud
- Section 🧬 Morphologie dans s-setup : `_renderMorphoSection()` (genre-aware)
- `setMorphotype(val)` / `setMorpho(val)` — mise à jour immédiate
- `buildCoachContext()` intègre morpho/morphotype
- Coach IA Premium : bouton 📸 "Analyser ma morphologie" → overlay `#ov-morpho-analysis`
  - 3 slots photo guidés (Face/Dos/Profil), resize 800px JPEG 0.8
  - `analyzeMorphoPhotos()` → Apps Script `morphoAnalysis` → Claude Haiku Vision
  - `applyMorphoResult(d)` → auto-update S.morpho + S.morphotype
- Code.js @9 : `handleMorphoAnalysis_` + champs morpho/morphotype dans `handleSaveProfile_`

### Coach IA Premium
- **Gratuit** : 10 questions (`S.coachFree`, persisté `ft4_coachFree`, constante `COACH_FREE_LIMIT=10`)
- **Premium** : 4,99€ / 2 mois via Ko-fi (`S.premium`, persisté `ft4_premium`)
- Mur premium `#coach-wall` après la 10ème réponse (délai 1,2s)
- Bouton Ko-fi → https://ko-fi.com/michel2176
- 3 méthodes d'activation : whitelist email / code payant / webhook Ko-fi automatique
- Badge header `#coach-quota-badge` : rouge (X questions) ou or (⭐ Premium)
- Webhook Ko-fi : chaque paiement → email ajouté dans `PREMIUM_EMAILS` + log onglet `Premium`

### Premium — mécanisme complet et pièges

#### Vérification côté backend (Code.js `getPremiumStatus_`)
Trois couches vérifiées dans l'ordre :
1. **`PREMIUM_HARDCODED_`** (tableau const dans Code.js) — priorité absolue, immune à tout trigger
2. **`PREMIUM_EMAILS`** Script Property — whitelist éditable, mais **peu fiable** (voir ci-dessous)
3. **`prem_{email}`** Script Property — accès daté (Ko-fi webhook)

```js
const PREMIUM_HARDCODED_ = [
  'michdu75@gmail.com',
  'elineazs32@gmail.com',
  'christophe@famillelanglois.fr',
  'apollonone75@gmail.com'
];
```

#### ⚠️ PREMIUM_EMAILS — trigger fantôme
La Script Property `PREMIUM_EMAILS` est régulièrement réécrite à `michdu75@gmail.com,elineazs32@gmail.com` par un **trigger installable inconnu** créé manuellement dans l'UI Apps Script (invisible depuis clasp). Pour éditer la whitelist de façon fiable, ajouter les emails dans `PREMIUM_HARDCODED_` dans Code.js.

**Safeguard actif depuis @44** : `ensurePremiumEmails_()` est appelée à chaque `doPost` — si `PREMIUM_EMAILS` ne contient pas tous les hardcoded, elle les réécrit. Le trigger fantôme est ainsi rendu inoffensif.

#### Côté frontend (app.js / coach.js)
- `_premiumPending` (variable globale dans `app.js`) : `true` tant que `autoConnect()` n'a pas reçu la réponse serveur
- `showPremiumWall()` dans `coach.js` : retourne sans rien faire si `_premiumPending === true`
- `sendToCoach()` : affiche toast "Vérification premium en cours…" si quota dépassé mais `_premiumPending`
- `autoConnect()` : ping no-cors fire-and-forget, puis `loadProfile` avec await → applique `S.premium` → `_premiumPending = false`

### Onglet Progrès
- 4 chips cliquables : Squat · Soulevé de Terre · Développé Couché · Développé Militaire
- Variable globale `_progEx` (défaut : `BIG4[0]`)
- `selectProgEx(name)` — met à jour chip actif + appelle `renderChart()`
- Dropdown "Autre exercice" pour tous les autres exercices

### Visualisation muscles dans séances passées (2026-06-13)
- `#ov-sess-detail` contient `<div id="sd-muscles">` avant `#sd-content`
- `openSessDetail(i)` : calcule les groupes travaillés via `EXLIB`, filtre `EX_GROUPS`, affiche silhouettes SVG
- Si aucun groupe → `sd-muscles` masqué

### Exercices — Press Jambes (2026-06-13)
- 6 variantes dans EXLIB (`g:'Jambes'`) : Squat Hack (Hack Squat), Press Jambes 45°, Horizontale, Verticale, Inclinée, Levier
- Images locales dans `exercises/press-jambes-{1-6}.jpg` et `exercises/press-jambes-5.jpg` (Squat Hack)
- `EX_YT` mappé avec `{img:'exercises/press-jambes-X.png|jpg'}` pour chaque variante
- Soulevé de Terre présent dans **deux** groupes : `g:'Dos'` (original) ET `g:'Fessiers'` (ajouté)

### Traduction exercices EN→FR (✅ 2026-06-16)
- 24 exercices renommés : nom français + anglais entre parenthèses (ex. `Leg Curl` → `Curl Ischio-jambiers (Leg Curl)`)
- `LOWER_KW` / `UPPER_KW` / `_MEX` regex : inchangés — les mots anglais restant entre parenthèses, tous les matchs partiels fonctionnent encore
- `EX_YT` et `EX_EN` : clés mises à jour pour `Pont Fessier (Glute Bridge)`, `Squat Hack (Hack Squat)`, `Poussée de Hanche (Hip Thrust)`, `Curl Ischio-jambiers (Leg Curl)`, `Extension Quadriceps (Leg Extension)`, `Tirage Visage (Face Pull)`, `Haussements d'Épaules (Shrugs)`
- **Migration one-time** dans `load()` : flag `ft4_exmig2` — renomme les anciennes clés dans `S.prs` et `S.sessions[].exs[].name` sans perte de données

### Badges & Récompenses (✅ 2026-06-15/16)
- **18 badges** en 4 catégories : évolution (1re séance, 10/25/50/100 séances…), performance (PRs, club 100kg/140kg), streak (7/30/90 jours), spécial (lève-tôt, noctambule, anniversaire, premium)
- `S.badges` = `{badgeId: {unlockedAt:'YYYY-MM-DD'}}` — persisté `ft4_badges`, sync cloud
- `BADGES` : tableau const (18 entrées `{id, icon, name, desc, cat}`)
- `checkBadges(silent)` : vérifie toutes les conditions, débloque + toast si nouveaux
- `_checkBadgeCond(badge)` : switch sur badge.id — logique par badge
- `_getMaxStreak()` : calcule streak max depuis `S.sessions` (dates uniques triées)
- **Popup PR** `#ov-pr-congrats` : s'affiche 2,4s après `finishWorkout()` si nouveau PR détecté
  - `showPrCongrats({ex, newRm, oldRm})` — affiche gain, comparaison old→new, niveau atteint
- **Résumé hebdomadaire** `#ov-week-summary` : affiché le lundi au démarrage (`checkWeeklySummary()`)
  - Contenu : séances, volume, PRs, badges débloqués la semaine passée
  - Bouton 📋 Partager → `copyWeekSummary()` (clipboard)
- **Date anniversaire** `S.bday` (ft4_bday) : champ `JJ/MM` dans s-setup → `saveBday(val)`
  - Badge `birthday` : séance le jour de l'anniversaire
- Onglet **🏅 Badges** dans `s-progress` (3e tab) → `renderBadges()` / `switchProgTab('badges')`
- `startWorkout()` : sauvegarde `S.wkt.startHour = new Date().getHours()` pour badges lève-tôt/noctambule
- Badges lève-tôt/noctambule : fallback sur `new Date(s.ts||s.id).getHours()` pour anciennes séances sans `startHour`

### EXLIB — Bibliothèque d'exercices (✅ 2026-06-16)
- **172 exercices** au total, **12 groupes** : Pectoraux · Dos · Trapèzes · Épaules · Biceps · Triceps · Jambes · Fessiers · Abdominaux · Mollets · **Avant-bras** · **Full Body**
- Groupes Avant-bras et Full Body créés lors de cette session
- Soulevé de Terre présent dans Dos ET Fessiers (intentionnel)
- Soulevé de Terre Sumo présent dans Dos ET Fessiers (intentionnel)

### Visuels exercices — SVG templates + EX_EN (✅ 2026-06-16)
- **`_MUSCLE_SVG`** : objet IIFE avec 12 clés (un SVG par groupe musculaire)
  - Silhouette corps humain (vue avant, 100×202 viewBox, dark theme `var(--bg3)`)
  - Groupe cible en rouge `#FF2D55` opacity 0.85
  - Note `(vue dos)` pour Dos / Trapèzes / Triceps / Fessiers
- **`_groupTemplateSvg(name)`** : lookup groupe EXLIB → retourne `<div>` avec le SVG
- **`toggleExGif(ei, name)`** — ordre de priorité :
  1. `EX_YT[name]` → image locale ou vidéo YouTube (immédiat, 0 réseau)
  2. `fetchExImage(name)` via wger.de → image trouvée → affiche + lien YT
  3. Rien trouvé → `_groupTemplateSvg(name)` + lien YT (fallback garanti)
- **`EX_EN`** étendu : ~150 termes anglais couvrant les 172 exercices (wger.de search)
- **`gifCache`** : cache en mémoire par nom d'exercice (évite les doublons réseau)
- **Tag git sauvegarde** : `v-svg-templates-2026-06-16` — restauration possible si besoin

### Programmes (séances sauvegardées) (✅ 2026-06-16)
- `S.programmes` — tableau de templates (`ft4_progs`)
- Modal `#mod-prog` : sauvegarder séance en cours, charger avec poids précédents, supprimer
- **Éditeur de programme** overlay `#ov-prog-edit` : modifier nom + ajouter/supprimer exercices
  - `editProg(idx)` → ouvre l'overlay avec deep copy du programme
  - `_renderProgEdit()` : rendu des jours/exercices avec boutons × et "+" par jour
  - `_openExPickerForProg(dayIdx)` : positionne `_exPickerMode='prog'` + `_editDayIdx` puis ouvre picker
  - `addExercise(name)` : intercepté si `_exPickerMode==='prog'` → route vers `_addExToProgEdit(name)`
  - `_addExToProgEdit(name)` : push exercice (3 sets N par défaut), re-render
  - `_removeExFromProgEdit(dayIdx, exIdx)` : splice + re-render
  - `saveProgEdit()` : écrase `S.programmes[idx]`, persist, referme et rouvre `#mod-prog`
  - Variables : `_exPickerMode` (workout|prog), `_editProgIdx`, `_editProgData`, `_editDayIdx`
- **Analyse IA de programme** (Premium) overlay `#ov-prog-analysis`
  - Bouton 🤖 sur chaque programme dans `#mod-prog` → `analyzeProgIa(idx)`
  - `_formatProgForAnalysis(prog)` : formate le programme en texte structuré
  - Appel `action:'coach'` avec prompt structuré en 4 parties
  - `continueInCoach()` : injecte l'analyse dans `coachHistory` et navigue vers s-coach
  - `_coachFmtHtml(text)` : même rendu markdown que le chat coach

### Gym perf — réseau faible (✅ 2026-06-30)
- **SW navigation cache-first** : app s'ouvre instantanément depuis le cache, revalidation silencieuse en fond
- **Timeout 3s** sur `autoConnect()` / `loadProfile` — pas de blocage réseau lent au démarrage
- **`syncSheets(sess)`** dans `tracking.js` : retourne `{ok, error}` (plus de boolean aveugle), log HTTP brut console, erreur exacte affichée par date dans le panneau Admin
- **`_buildSyncRows(sess)`** : normalisation générale de toutes les séances avant envoi Sheets — date, exercise, type, kg, reps, rm1, bw, gender, age — fonctionne pour tout utilisateur, toute séance cassée
- **`_retrySheetQueue()`** : relance auto au démarrage + retour en ligne pour toutes les séances `synced===false`
- Panneau Admin : bouton "Resynchroniser" + compteur séances non-synced

### Dédicace anniversaire Eline (✅ 2026-06-30, ft-v133)
- **3 guards** : email `elineazs32@gmail.com` + date 2–5 juillet + flag `localStorage ft4_bday_eline_2026`
- Écran plein écran `#ov-bday` (z-index 9999) : gâteau HTML/CSS, "JOYEUX ANNIVERSAIRE" + "Eline" (police Pacifico), message + "— Papa"
- **Mini-jeu bougies** : 19 bougies colorées, `touchmove` + `elementFromPoint` + walk-up `.closest('.bday-candle')`, vibration 18ms par bougie soufflée
- **Bouton verrouillé** (`disabled`) jusqu'à 0 bougies restantes → pop rouge animé (`bday-btn-pop`)
- 4 keyframes CSS : `bday-flicker`, `bday-sparkle`, `bday-smoke`, `bday-btn-pop`
- Fonctions dans `app.js` : `checkBirthdayDedication()`, `showBirthdayScreen()`, `closeBirthdayScreen()`, `_initBdayCandles()`, `_bdayTouch()`, `_blowCandle()`

### Overlay décompte final de repos (✅ 2026-07-01, ft-v135)
- **Déclenchement** : 10 dernières secondes du timer repos, uniquement si `restTot > 10` et `_curScreen === 'log'`
- **Overlay** `#ov-rest-countdown` : fond `#0e1016` plein écran, z-index 9999
- **Anneau SVG** : r=85, circumférence 534px, `stroke-dashoffset` piloté par `left/10` — orange `#FF6C00` → rouge `#FF2D55` sur les 3 dernières secondes
- **Chiffre central** : 10→1 en gras 110px, même couleur que l'anneau
- **À 0** : label `C'EST REPARTI` + `GO` en blanc + prochaine série (nom exercice, numéro, kg × reps)
- **3 sorties** : tap overlay, bouton `Passer ▸`, auto-close 2 s après le 0
- **`_nextSetInfo()`** : lit `S.wkt.exs[_expandedEx]`, retourne premier set non `done`
- **Fonctions** : `_showRestCountdown()`, `_updateRestCountdown()`, `_closeRestCountdown()` dans `log.js`
- **`stopRest()`** : appelle `_closeRestCountdown()` en tête — overlay fermé si série validée pendant repos
- **Variables** : `_cdownActive` (bool), `_cdownAutoClose` (handle timeout)

### Notes libres par exercice (✅ 2026-07-01, ft-v136)
- **Stockage** : `S.wkt.exs[ei].note` (string) — persisté via `persist()`, voyage automatiquement dans `S.sessions[].exs[].note` lors de `finishWorkout()`, sync cloud sans modif backend
- **UI en séance** (bloc déplié) : textarea 💬 sous le bouton `+ Série`, fond transparent, auto-extensible (`scrollHeight`), sauvegarde immédiate via `saveExNote(ei, val)` dans `log.js`
- **Vue repliée** : indicateur `💬` ajouté à la fin du `summary` si `ex.note` non vide
- **Séances passées** `#ov-sess-detail` → `_renderSessDetailContent()` dans `setup.js` : affiche `💬 ${ex.note}` en or italique sous le nom si présent
- **Coach IA** `buildCoachContext()` dans `coach.js` : ajoute `[note: ...]` par exercice dans la section DERNIÈRES SÉANCES

### Son décompte final — countdown.wav (⚠️ OBSOLÈTE — remplacé par tick-tock/bell en ft-v163, voir plus bas) (2026-07-01, ft-v137→ft-v142)
- **Fichier** : `countdown.wav` (racine du repo, ~10 s : ticks 10→4, montée 3-2-1, GO) — inclus dans le précache SW
- **Élément audio** : `_cdownAudio` (HTMLAudioElement singleton), initialisé par `_initCdownAudio()` dans `log.js`
- **Déblocage iOS** : `touchstart` (once) → `muted=true` → `play()` → `pause()` → `currentTime=0` → `muted=false` — silence total, débloque pour les lectures futures
- **Lecture** : `_showRestCountdown()` → `currentTime=0; play()` — une seule lecture par overlay
- **Arrêt net** : `_closeRestCountdown()` → `pause(); currentTime=0` (fermeture manuelle ou auto)
- **Guards sur les oscillateurs** : `_beepTick()` et les deux `beep()` font `if(_cdownActive)return;` → aucun oscillateur WebAudio ne sonne pendant l'overlay
- **Vibration** conservée : 80 ms sur 3-2-1, `[200,60,200,60,300]` sur GO
- **Flash vert GO** : à 0, fond `#0e1016` → `#00e676` → `#0e1016` en 200+200 ms — filet visuel mode silencieux iPhone

### Fix chrono repos transparent (✅ 2026-06-30, ft-v134)
- **Cause** : `@keyframes rest-blink` animait `opacity` sur `#rest-bar` et `#rest-pill` entiers → fond transparent au pulse, contenu exercice visible en dessous
- **Fix** : animation déplacée sur `#rest-bar.overtime #rest-time` et `#rest-pill.overtime #rest-pill-time` (texte seul)
- `#rest-pill` fond : `rgba(14,16,22,.95)` → `#0e1016` (100% opaque) + `z-index:30`

### Backup quotidien Drive (✅ Code.js @51→@54)
- **`backupAllUserData_()`** : dump JSON de toutes les propriétés utilisateurs (`u_{email}`) → fichier `backup-YYYY-MM-DD.json` dans Drive
- **Dossier** : `ForceTracker-Backups/` (ID : `1iQ6xFuG10d4qCE1Jz8d8lOodrUsV36Fq`) — **append-only, jamais supprimé automatiquement**
- **Trigger quotidien** : `dailyBackup` à 2h du matin, 1 actif (`?action=installDailyBackup&t=FT_BACKUP_INIT_2026` pour installer)
- **Alerte quota** : si > 1000 fichiers dans le dossier → log `[FT backup ⚠️ ALERTE DRIVE]` (jamais bloquant)
- **Migration** : ancien onglet Sheet `Backup 2026-06-29 20:03` → `backup-migration-2026-06-29-2003.json`
- **Vérification** : `?action=checkBackup` → `{fileCount, lastFiles, driveFolder}`
- **Garde-fou saveProfile** (`@47+`) : un push vide (0 session, profil défaut) n'écrase jamais des données remplies — pour tous les emails
  - `_ps_(ps, key, val)` : string — garde la valeur existante si `val` est vide/null
  - `_pn_(ps, key, val)` : number — garde si `val === 0` ou absent
  - `_pa_(ps, key, val)` : array — garde si `val.length === 0`
  - `_po_(ps, key, val)` : objet/JSON — garde si `val` est vide

### Chasse au trigger fantôme PREMIUM_EMAILS (✅ 2026-06-30, Code.js @46)
- **Trigger fantôme** : trigger installable inconnu dans l'UI Apps Script (invisible depuis clasp) réécrit `PREMIUM_EMAILS` — cause identifiée
- **Double protection** : `PREMIUM_HARDCODED_` (priorité absolue) + `ensurePremiumEmails_()` appelée à chaque `doPost`
- **Purge one-shot** dans `doGet` : supprime tous les triggers, flag `triggers_purged_20260630`, double try/catch (jamais bloquant même si scope `script.scriptapp` non autorisé)
- ⚠️ Pour que la purge s'exécute réellement : lancer `authorizeAndListTriggers()` depuis l'IDE Apps Script pour autoriser le scope `script.scriptapp` une fois

### Import programme — Fichiers Word, Excel, PDF, Images (✅ @57)
- Bouton 📸 dans s-log → overlay `#ov-import-prog` → accept `.docx`, `.xlsx/.xls`, `.pdf`, images
- **Word (.docx)** : chargement dynamique mammoth.js (CDN cdnjs, ~150KB) → `extractRawText` → texte brut
- **Excel (.xlsx/.xls)** : chargement dynamique SheetJS (CDN jsdelivr, ~800KB) → CSV par feuille
- **PDF** : converti en JPEG via PDF.js (`_pdfToImages`) → envoyé comme images au backend
- Modèle : claude-sonnet-4-6 si texte/PDF/multi-image, claude-haiku si image unique
- **`handleImportProgram_` — règles prompt (@57)** :
  - **Règle 0** : séparateur = `SÉANCE N` / `Jour N` / `Day N` / `Workout N` UNIQUEMENT. Groupes musculaires = sections internes. Ignorer SOMMAIRE + séances vides.
  - **Règle 1** : repsPerSet. Unilatéral (`bras/bras`, `jambe/jambe`, `alterné`) → chaque ligne NxN = 2 séries. `NxN+M` → `+M` au partenaire superset. **Ramping reps** (`3+4+5+6+7 par cycle`) → `repsPerSet:[3,4,5,6,7]`, jamais `3x7`.
  - **Règle 4** : `setType` = `""` (Normal) ou `"D"` (Dropset) UNIQUEMENT. Jamais `"E"` ni `"W"`. Mots "à l'échec/Maxi/échauffement" → NOTE.
  - **Règle 5** : superset = `+` entre noms complets ou préfixe C1/C2. `+` dans reps (`15x2+15`, `8+2+2`) ≠ superset.
  - **Règle 6** : dropset → `setType:"D"`, `repsPerSet`, `kgPerSet` par palier.

### Import historique — Séances passées datées (✅ ft-v161, @58)
- **⚠️ ≠ import programme** : séances déjà réalisées avec dates → alimente `S.sessions`, stats, PRs, courbes.
- **Bouton** : 📅 "Importer un journal" dans `s-log` → `openImportHist()` → overlay `#ov-import-hist`
- **Flow totalement isolé** : `_histPhotos`, `_histExtracted`, `_histConflicts` — ne touche JAMAIS `_impPhotos`/`_impExtracted`/`_impMode`
- **Backend** : `action:'importHistory'` → `handleImportHistory_()` — toujours Sonnet
- **JSON retourné** : `{sessions:[{date:'YYYY-MM-DD', estimatedDate:bool, label, exercises:[{name, sets:[{kg, reps, type:''/D, note}], note}]}]}`
- **Dates** : `JJ/MM/AA` → `YYYY-MM-DD`, `JJ/MM` → année 2026. Séance sans date → `estimatedDate:true`
- **Séries** : "par bras/par jambe" → 2 sets, "vide" → kg:0, "N rep Xkg N rep Ykg" sur une ligne → DROP SET
- **Conflits de date** : 3 choix inline — Remplacer / Garder / Les 2 (défaut = Les 2)
- **Volume** : exclut W uniquement. Drop set D **compte**. `type!=='W' && type!=='É'`
- **PRs** : recalcul chrono ASC sur séances importées. `if(!cur||rm>cur.rm1)` — jamais écraser plus élevé.
- **Sort final** : `S.sessions` triées par `ts` DESC (plus récente en tête)
- **Après import** : `persist()` + `_cloudSyncSessions()` + `checkBadges(true)`
- **Flag** : `sess.importedHistory = true` — identifie l'origine dans `S.sessions`

### Polices hébergées en local — 0 dépendance réseau (✅ 2026-07-02, ft-v162)
- **Cause corrigée** : `style.css` chargeait Manrope + Space Grotesk via `@import` Google Fonts, et `index.html` chargeait Pacifico via `<link>` Google Fonts — feuilles de style externes **bloquantes pour l'affichage**, non mises en cache par le SW (`sw.js` ignore volontairement les origines externes). Sur réseau très faible/absent (ex. sous-sol de salle), ça provoquait un **écran blanc** le temps du timeout réseau.
- **Fix** : les 3 polices sont téléchargées et stockées dans `fonts/` (`manrope-variable.woff2`, `spacegrotesk-variable.woff2`, `pacifico-400.woff2` — Manrope et Space Grotesk sont des polices variables, un seul fichier couvre toutes les graisses). Déclarées en `@font-face` locales dans `style.css`. Plus aucune requête vers `fonts.googleapis.com`/`fonts.gstatic.com`.
- **SW** : les 3 fichiers ajoutés au `PRECACHE` de `sw.js` — disponibles hors-ligne dès la première visite.
- **Sous-ensemble** : seul le subset "latin" (couvre les accents français, ex. é/è/à/ç/œ) a été téléchargé — pas les subsets cyrillique/vietnamien/etc., inutiles ici.

### Uniformisation visuelle — tuiles étape 2 : Séance Sommeil + Cardio (✅ 2026-07-03, ft-v180)
- **Étape 2** du chantier uniformisation cartes : les cartes **Sommeil** (`renderLogSleep`, tracking.js) et **Cardio** (`renderCardioBlock`, app.js) de l'écran Séance adoptent le **gabarit** de l'étape 1.
- **Fix** : leurs icône/titre/sous-titre étaient en **style inline** → ne suivaient ni le gabarit ni le mode agrandi. Rebranchés sur les **classes** `.home-row-ic` (40px), `.home-row-ttl` (15/700), `.home-row-sub` (12/t3) → cohérence auto en mode normal ET agrandi (a11y-lv).
  - Cardio : icône 32px→`.home-row-ic`, titre 13px→`.home-row-ttl`.
  - Sommeil (replié) : lune passée d'un icône nu 14px à une **tuile violette 40px** `.home-row-ic`, titre→`.home-row-ttl`, sous-titre→`.home-row-sub`.
- Testé (Chromium, normal + a11y-lv) : Sommeil + Cardio alignés sur Accueil/Coach dans les deux modes, 0 erreur JS.
- **⚠️ Reste à faire (noté avec Michel)** : **audit du mode jour (light-mode)** — signalé « c'est la cata » — à traiter comme chantier dédié.
- **Rollback** : `git reset --hard backup-2026-07-03-avant-unif-seance`

### Uniformisation visuelle — tuiles étape 1 : Accueil + Coach (✅ 2026-07-03, ft-v179)
- **Demande** : « l'ensemble visuel n'est pas assez uniformisé » entre les écrans. Décision testeur : commencer par les **cartes/tuiles**, une chose à la fois, **en tenant compte du mode « affichage agrandi »** (accessibilité, réglé dans le profil).
- **⚠️ Chantier en plusieurs étapes.** Étape 1 (ft-v179) = **gabarit de tuile unique** partagé par Accueil (`.home-row`) et Coach (`.coach-action-card`). Étapes suivantes = étendre aux autres cartes (Séance Sommeil/Cardio, Nutrition, boxes de stats…).
- **Étape 1 — `style.css` (CSS uniquement, aucune modif HTML/JS)** :
  - `.home-row-ic` et `.coach-action-ic` → **40 px, radius 12** (identiques).
  - `.home-row-ttl` et `.coach-action-lbl` → **15 px / 700 / `var(--t1)`**.
  - `.home-row-sub` et `.coach-action-sub` → **12 px / `var(--t3)` / line 1.4**.
  - **Mode agrandi** : règle `#root.a11y-lv` étendue à `.coach-action-lbl`/`.coach-action-sub` (16 px/700 + 13 px), alignée sur `.home-row-*` → cohérent aussi en `a11y-lv`.
- **Disposition inchangée** : liste sur Accueil (3 items), grille sur Coach (4 items) — même brique, deux mises en page.
- **⚠️ Règle projet (nouvelle)** : à chaque uniformisation de carte, **vérifier le rendu en mode agrandi** (`#root.a11y-lv`) — beaucoup d'éléments ont des overrides `!important` dans le bloc `a11y-lv` de `style.css` (~ligne 700), à garder cohérents.
- Testé (Chromium, mode normal + `a11y-lv`) : tuiles Accueil et Coach identiques (icône + titre + sous-titre) dans les deux modes, 0 erreur JS.
- **Rollback** : `git reset --hard backup-2026-07-03-avant-unif-tuiles`

### Bouton central « + » docké dans la barre (✅ 2026-07-03, ft-v178)
- **Demande** : le FAB flottant `#fab-session` (« + » rouge, `position:absolute` au-dessus de la barre) recouvrait le contenu de l'écran Séance (cachait les séries) et posait un souci de swipe entre onglets quand on le touchait.
- **Fix** : **suppression** du bouton flottant `#fab-session` ; le bouton central de la barre `#nb-log` n'affiche plus le mot « Séance » mais un **« + » rouge (`.nb-plus`) intégré à la barre** (docké, non flottant). Toujours `onclick="startWorkout()"`.
- **CSS** : règles `#fab-session` (flottant, z-index 21, `_positionFab`) supprimées ; ajout `.nb-plus` (44px rouge dans la barre) + emphase `#root.on-log .nb-plus`.
- **Aucune modif JS** : `_positionFab()` fait un early-return car l'élément `#fab-session` n'existe plus → devient un no-op inoffensif. Les appels `requestAnimationFrame(_positionFab)` dans `_syncLogHdrBtns` restent mais ne font rien (pas besoin de les retirer). **La règle d'or n°9 sur le positionnement du FAB flottant est donc caduque** (plus de FAB flottant).
- **⚠️ Swipe** : à re-tester sur téléphone (le souci historique venait du calque flottant qui brouillait les touches ; maintenant c'est un simple bouton de barre).
- Testé (Chromium) : FAB flottant absent, « + » dans la barre, tap → écran Séance (`startWorkout`), ne recouvre plus les séries, 0 erreur JS.
- **Rollback** : `git reset --hard backup-2026-07-03-avant-fix-bouton-plus`

### Éditeur de programme — reps/séries éditables + vignette exercice (✅ 2026-07-03, ft-v177)
- **Demande** : dans l'éditeur de programme, pouvoir modifier **reps + nombre de séries** (pas juste le repos), et afficher une **vignette de l'exercice à gauche** (façon colonne « Photos » des programmes de coach).
- **Éditeur complet** (`_renderProgEdit` / `exCard`, log.js) :
  - Reps **éditables** par série (input) → `_setProgSetReps` (pas de re-render, garde le focus).
  - Bouton **×** par série → `_removeProgSet` (garde au moins 1 série). Bouton **« + série »** → `_addProgSet` (copie la dernière série). Helper `_progEditEx(di,ei)` (multi-jours ou à plat).
  - Le repos reste éditable (ft-v176). `saveProgEdit` persiste tout (`_editProgData`).
- **Vignette exercice** (`_progExThumb(name)`, à gauche du nom) — priorité, 100% hors-ligne :
  1. **Photo locale** `EX_YT[name].img` si dispo (gif/png réel).
  2. Sinon **image muscle réaliste** `muscles/*.png` (les PNG anatomie de Michel), choisie via le **muscle principal deviné du nom** : `_mscScores([{name,sets:[{done:true}]}])` → top code `_MG` → `_MG_IMG` (map code→PNG). Marche même pour un exo hors bibliothèque (ex. « Tirage bûcheron » → dos).
  3. Sinon **figurine anatomique colorée** `_mscSVGmini` (repli ultime).
  - Les 8 PNG muscle ajoutés au `PRECACHE` de `sw.js` (offline).
  - **Choix** : icônes muscle `muscles/*.png` (nettes en 46px) et **non** les schémas `anatomy/…` (détaillés/annotés, illisibles en vignette — réservés au grand affichage Coach IA).
- **Programmes existants** : intacts et modifiables (champ `rest` optionnel, aucune migration).
- Testé (Chromium) : éditer reps / +série / −série (garde min 1) / sauvegarde OK ; vignettes photo (Développé Couché, Press Jambes 45°) + muscle réaliste (Tirage bûcheron → dos), 0 erreur JS.
- **Rollback** : `git reset --hard backup-2026-07-03-avant-editeur-complet`

### Programmes — repos par série (schéma Série/Reps/Repos) (✅ 2026-07-03, ft-v176)
- **Demande** : reproduire le schéma visuel des programmes de coach (exercice | quantité | repos) et pouvoir définir un **temps de repos par série** — à l'import comme en création perso. Décision testeur : **un repos par série** (pas un seul par exercice), car les vrais programmes varient le repos série par série (ex. Développé couché : 45s, 45s, 1min15, 1min30…).
- **⚠️ Fait en 2 étapes.** **Étape 1 (ft-v176, frontend, ci-dessous) = affichage + édition + application au minuteur.** Étape 2 (à venir, backend Code.js, déploiement PC Michel) = import auto du repos depuis un document.
- **Étape 1 — `log.js`** :
  - **Modèle** : chaque série (programme ET séance) porte un champ optionnel `rest` (secondes). Défaut `0` = utilise le repos par type de série (N=90/exRestPref, W/É=45, E/X=240, D=20).
  - **Minuteur** : `toggleSet` → `sec = set.rest>0 ? set.rest : (restByType[type]||defForEx)`. Le repos de la série gagne s'il est défini.
  - **Propagation** : `loadProg` / `loadProgDay` recopient `s.rest` dans `S.wkt`. `saveAsProg` conserve `rest`. `_buildProgDay` (import) lit `ex.restPerSet[]` (par série) OU `ex.rest` (unique → recopié sur toutes les séries) — **préparé pour l'étape 2**, aucune donnée si le backend n'envoie rien.
  - **Éditeur de programme** (`_renderProgEdit`) : mini-tableau **Série | Reps | Repos** par exercice ; repos éditable par série (input secondes + format `1'30` affiché via `_fmtRest`). Helpers `_defRestForType`, `_fmtRest`, `_setProgSetRest` (setter sans re-render → garde le focus). Placeholder = repos par défaut du type.
- **Création perso** : même éditeur → l'utilisateur tape son repos par série. Import ou perso = même endroit.
- **Limite (Étape 1)** : l'éditeur règle le repos + ajoute/retire des exercices, mais ne modifie pas encore reps/nombre de séries (fait pendant la séance). Extension possible.
- Testé (Chromium) : prog type PDF (Rowing 5×90s, Tirage 60/120/120), repos propagé à la séance (90/120), minuteur correct, format `1'30`/`2'00` affiché, 0 erreur JS.
- **Rollback** : `git reset --hard backup-2026-07-03-avant-repos-par-serie`

### Onglet Progrès — ligne « Charge max soulevée » (poids réel) (✅ 2026-07-03, ft-v175)
- **Demande** : sur l'onglet Progrès, les 3 cases (Actuel / Record / Progrès) affichent **toutes le 1RM estimé** (un calcul). Il manquait la **charge maximale réellement soulevée** (le poids le plus lourd mis sur la barre, ex. `150 kg × 3`) — donnée distincte, à ne pas confondre avec le 1RM. « Si on fait 10×140 et un max 1RM de 154, ce n'est pas la même donnée. »
- **Fix (100% affichage, `setup.js` `renderChart`)** :
  - `maxLoad` = scan de **toutes les séances** (`S.sessions`), séries `done` avec kg&reps → set au **kg le plus élevé** (à kg égal, le plus de reps). Rétroactif (calcul en direct, marche pour tout l'historique).
  - Ligne sous les 3 stats : `🏋️ Charge max soulevée : XX kg × N → ~YY kg 1RM` (YY = `bz(maxLoad.kg,maxLoad.reps)`, le 1RM estimé de cette charge).
  - Partie chiffrée regroupée (`white-space:nowrap`) → retour à la ligne propre sur mobile (label ligne 1, valeurs ligne 2). Couleurs neutres (`--t1`/`--t2`/`--t3`), OK jour/nuit.
- **Genre** : identique H/F — `bz()` (Brzycki) et `maxLoad` sont **gender-neutral**. Seul le « niveau de force » (`getLevel`, accueil) est genré, non touché.
- Testé (Chromium, Soulevé de Terre, 4 séances, jour + nuit) : record 1RM 186.7 (depuis 140×10) vs charge max 150 kg × 3 → ~158.8 kg 1RM, 0 erreur JS.
- **Rollback** : `git reset --hard backup-2026-07-03-avant-charge-max-reelle`

### Détail de séance — « Meilleur 1RM potentiel » visible + ~XX kg lisibles (✅ 2026-07-03, ft-v174)
- **Demande** : après une séance terminée, le « 1RM max potentiel » (1RM estimé Brzycki) n'était plus visible clairement. Pendant la séance, la ligne exo affiche « · 1RM ~XX kg » (`maxRM`, log.js) ; dans le détail de séance passée (`#ov-sess-detail`), il ne restait que les `~XX kg` gris minuscules par série (`var(--t3)`, illisibles).
- **Fix (100% affichage, `setup.js` `_renderSessDetailContent`)** — les deux, sans toucher aux données ni aux records :
  - **Ligne résumé par exercice** : `maxRM = max(bz(kg,reps))` sur les séries `done` → `🎯 Meilleur 1RM potentiel : XX kg` sous le nom de l'exo (après la note si présente).
  - **~XX kg par série** : rendus lisibles (avant : `font-size:11px;color:var(--t3)` gris minuscule).
- **Couleurs (après itérations avec Michel)** : le rouge (`var(--red)`) mettait « du rouge partout » → finalement **texte pleine couleur neutre** `var(--t1)` (blanc en mode nuit / noir en mode jour, font-weight 700-800) pour un bon contraste sans surcharge. Testé mode jour ET nuit.
- **Rappel vocabulaire** : le `~XX kg` par série = 1RM estimé de la série ; le RECORD dans Progrès (`S.prs[name].rm1`) = le meilleur de tous ces `~XX kg` = « 1RM max ». Même donnée, le record est juste le max.
- Testé (Chromium, séance réaliste 5 + 6 séries, jour + nuit) : lignes 🎯 74.5 kg / 124.2 kg affichées, `~XX kg` lisibles, 0 erreur JS.
- **Rollback** : `git reset --hard backup-2026-07-03-avant-1rm-potentiel-detail`

### Migration « Press » → « Press Jambes 45° » (✅ 2026-07-03, ft-v173)
- **Demande** : l'exo perso « Press » était en fait la presse à jambes 45°. Le **supprimer** et le **remplacer** par « Press Jambes 45° » (déjà dans EXLIB, groupe Jambes) **sans perdre les données** stockées sous « Press ».
- **Migration one-time** dans `load()` (state.js, flag `ft4_pressmig1`), placée après `ft4_exmig2`, sur le **même modèle** que les migrations existantes :
  - **PR** (`S.prs`) : renomme la clé `Press` → `Press Jambes 45°`. **Garde-fou** : si la cible a déjà un PR plus élevé, on ne l'écrase pas à la baisse (`rm1` max conservé).
  - **Séances** (`S.sessions[].exs[].name`) : renomme partout (couvre aussi `.exercises` par sécurité).
  - **Programmes** (`S.programmes`) : renomme dans les deux structures — `.days[].exs[].name` (avec jours) ET `.exs[].name` (à plat).
  - **Exo perso** (`S.customExercises`) : retire l'entrée `{n:'Press'}` (le nouvel exo vient d'EXLIB, plus besoin de l'entrée perso).
  - Écrit tout en localStorage (`ft4_prs`, `ft4_sessions`, `ft4_progs`, `ft4_cuex`) + pose le flag.
- **Sync cloud** : au prochain `persist()`/`_cloudSync`, les données migrées sont poussées → cloud à jour (même comportement que `ft4_exmig2`, aucune modif backend).
- Testé (Chromium, scénario réaliste = données posées puis rechargement propre) : PR conservé (rm1 150), Squat intact, séance + programmes (jours & plat) migrés, « Press » perso retiré / « Mon Exo » intact, 0 erreur JS, 0 donnée perdue.
- **Rollback** : `git reset --hard backup-2026-07-03-avant-migration-press`

### Étiquette historique — nom séance programme / muscle principal (✅ 2026-07-03, ft-v172)
- **Demande testeur** : sur les cartes de l'historique, afficher **quelle séance** a été faite. Si la séance vient d'un programme → nom de la séance du programme ; sinon → **muscle le plus travaillé**.
- **Capture du nom de programme** : `loadProgDay` stocke `S.wkt.progLabel=day.label` ; `loadProg` (programme sans jours) stocke `S.wkt.progLabel=prog.name`. `finishWorkout` recopie `progLabel` sur l'objet `sess`. Voyage en cloud via `sessions` (aucune modif backend).
- **Carte** (`renderSessions`, setup.js) : `_tag` = `🗂️ ${progLabel}` si présent, sinon `💪 ${muscle le plus travaillé}` (plus haut score de `_mscScores`, label via `_MG[code].label`). Affiché en rouge sous la date.
- **⚠️ Rétroactif partiel** : le nom de programme n'apparaît que sur les séances faites APRÈS ft-v172 (l'info n'était pas sauvée avant). Les anciennes séances (et celles sans programme) tombent sur le muscle le plus travaillé — calculé en direct, marche pour tout l'historique.
- Testé (Chromium) : séance programme → « 🗂️ Push (Haut du corps) », séance jambes → « 💪 Quadriceps », séance pecs → « 💪 Pectoraux », 0 erreur JS.

### Diagramme muscles — détail de séance unifié (✅ 2026-07-03, ft-v171)
- **Avant** : les 3 affichages muscles utilisaient 2 moteurs différents. Le détail d'une séance passée (`_updateSdMuscles`, setup.js, zone `#sd-muscles`) matchait les noms sur `EXLIB` exact → vignettes de groupes, **rien pour les exercices machines/perso « Autres »**.
- **Fix (ft-v171)** : `_updateSdMuscles` réécrit pour utiliser **`_mscScores` (moteur `_MEX`)** comme la grande carte et le mini-bonhomme des cartes. Affiche désormais le **mini-bonhomme coloré** (front, 56px) + « 💪 Muscles travaillés — Tape pour agrandir », `onclick`→`showMuscleMap`. Les 3 affichages sont maintenant sur le **même moteur** (reconnaissance accents + vocabulaire enrichi ft-v169, bleu discret ft-v170).
- Ne dépend plus de `EXLIB`/`EX_GROUPS`/`_genderGroupSvg` pour cet écran. Testé (Chromium) : séance de machines (chest press, décliné, peck deck…) → bonhomme coloré affiché (avant : vide), 0 erreur JS.

### Diagramme muscles — bleu indirect discret (✅ 2026-07-03, ft-v170)
- **Demande** : le bleu « indirect » (stabilisateurs) était trop vif → il écrasait la figurine (dos/abdos/bras en bleu flashy) et volait la vedette au rouge (primaire). Rendu **discret** (gris-bleu doux) pour dire « participe un peu » sans dominer.
- **5 endroits changés** (couleur uniquement, aucune logique touchée) :
  - `log.js` `_mscSVG` : dégradé `g-ind` `#60A8FF→#0040CC` → `#9DBBD6→#6E8CA8` ; indirect passe de `filter:drop-shadow` (relief) à `opacity:0.5` + stroke `#5B7C9E`.
  - `log.js` légende texte « Indirects : » : `#007AFF` → `#8FB4D8`.
  - `log.js` `_mscSVG_F` (femelle, dead code) : indirect `#0A84FF` → `#8FB4D8`.
  - `setup.js` `_mscSVGmini` (mini-bonhomme cartes) : indirect `#4488FF/#0030AA` → `#8FA9C4/#5B7C9E`.
  - `index.html` pastille légende « Indirect » : `#60A0FF/#0040CC` → `#9DBBD6/#6E8CA8`.
- **Rouge (primaire) + orange (secondaire) inchangés.** Couverture des indirects **non étendue** (toujours le seul développé couché) — enrichissement possible plus tard.
- Testé (Chromium, capture) : figurine + pastille + texte cohérents, 0 erreur JS.

### Diagramme muscles — reconnaissance accents + vocabulaire (✅ 2026-07-03, ft-v169)
- **Bug** : le diagramme « Muscles travaillés » (`showMuscleMap`→`_mscScores`) ET le mini-bonhomme des cartes de séance (`_mscSVGmini`, historique) colorent les muscles en **devinant depuis le NOM** de l'exercice via une liste de motifs `_MEX` (log.js). Cette liste (24 motifs) était trop courte + sensible aux accents → sur des séances de machines (imports « Autres »), la poitrine et bien d'autres muscles restaient **non colorés ou faux** (ex. séance pecs affichant abdos/trapèzes en primaire, 0 pectoraux).
- **Cause double** : (1) `é`≠`e` — « Développé incliné » matchait, « Développé incline » non ; (2) vocabulaire absent — pas de « chest press », « peck deck », « décliné », « presse horizontale », « abducteur »…
- **Fix (100% frontend, `log.js`)** :
  - `_naz(s)` = `normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()` — retire accents + minuscules. `_mscScores` normalise le nom via `_naz()` AVANT de tester `_MEX`.
  - **`_MEX` réécrit SANS accents** (obligatoire, sinon le nom normalisé ne matcherait plus) + vocabulaire enrichi : chest press, peck deck, décliné, incliné (variantes), presse horizontale/jambe, développé épaules, élévation frontale, around the world, écarté inverse, tirage bûcheron, bras tendu, twist, relevés de genoux…
  - **Ordre** : mollets AVANT la presse (sinon « extension mollets sur presse » → cuisses). Premier motif qui matche gagne (`break`).
  - **Fix mapping erroné** : `abduction/abducteur` → fessiers (avant : fléchisseurs de hanche/abdos, faux). `adducteur` → fessiers/quadriceps.
- **Résultat testé** sur les 87 exercices réels de Michel : **84/87 reconnus** (avant : 50). Les 3 restants (« Press », « Crabe », « Exercice libre ») sont volontairement non mappés (trop vagues). 0 régression sur les classiques (couché, squat, curl, deadlift…). Séance pecs réelle → pectoraux score 8 (primaire). 0 erreur JS.
- **⚠️ `_MEX` ne doit JAMAIS contenir d'accents** (le nom testé est déjà « aplati » par `_naz`). Le Coach IA n'utilise PAS `_MEX` (il lit les noms bruts) → non impacté.
- **Note** : le 3e affichage muscles, `_updateSdMuscles` (setup.js, détail d'une séance passée), utilise un mécanisme DIFFÉRENT (match exact sur `EXLIB`), non concerné par ce fix — les exercices « Autres » y restent non affichés (chantier séparé si besoin).

### Limite premium — Import de journal (✅ 2026-07-03, ft-v168)
- **Règle** : import de **journal** gratuit = **1 seul au total** (`HIST_FREE_LIMIT=1`), illimité en premium. ⚠️ **L'import de PROGRAMME n'est PAS limité** — seul le journal (`analyzeHistPhotos`/`finalImportHist`) est concerné.
- **Compteur** : `S.histImports` (persisté `ft4_histImp`), incrémenté dans `finalImportHist()` à chaque import réussi. Sync cloud : ajouté au payload `_cloudSync` (saveProfile) + restauré dans `_applyRestoreData` avec `Math.max(local,cloud)` (ne re-gagne jamais un import gratuit après purge locale).
- **Gate** : début de `analyzeHistPhotos()` — si `!S.premium && histImports>=1` → `closeImportHist()` + `showHistWall()` (mur `#ov-hist-wall`), analyse PAS lancée. Si `_premiumPending` (statut serveur pas encore reçu) → toast « Vérification… » sans bloquer définitivement.
- **Mur** `#ov-hist-wall` : overlay dédié réutilisant les classes `coach-wall-*`, bouton contact mailto + bouton « Activer un code » qui renvoie vers l'onglet Coach (réutilise `showPremiumWall`/`activatePremium` existants — logique premium existante NON modifiée).
- **Premium** vérifié comme partout (`S.premium` frontend, `PREMIUM_HARDCODED_`+serveur backend) — inchangé.
- **⚠️ Backend à déployer (depuis le PC de Michel) pour la persistance cloud du compteur** — 1 ligne dans `handleSaveProfile_` (Code.js, à côté de `body.badges`, ~ligne 476) :
  ```js
  if (body.histImports !== undefined) profile.histImports = _pn_(body.histImports, profile.histImports);
  ```
  `loadProfile` renvoie déjà tout `profile` → aucune autre modif backend. Sans ce déploiement, le compteur reste **local uniquement** (le gate fonctionne quand même sur l'appareil, mais un utilisateur qui vide son cache regagnerait 1 import gratuit).

### Import journal par lots (✅ 2026-07-02, ft-v167)
- **Bug corrigé** : un gros journal (~18 séances) envoyé en un seul appel `importHistory` dépassait la limite de réponse de l'IA (`max_tokens: 8192` dans `handleImportHistory_`, Code.js @58) → JSON tronqué à ~20 500 caractères → « JSON invalide : Expected ',' or ']' ».
- **Fix 100% frontend** (aucun redéploiement backend nécessaire) : `analyzeHistPhotos()` découpe `_histPhotos` en **lots de 3 pages** (`_HIST_BATCH=3`), appelle `_histAnalyzeBatch()` séquentiellement, fusionne les `sessions` de tous les lots.
- **Séance à cheval sur 2 lots** : si la dernière séance du lot N et la première du lot N+1 ont la même date (non estimée) → fusion des exercices en une seule séance.
- **Erreurs par lot** : lot en échec ignoré + toast « X lots non lus » (import partiel possible) ; si TOUS échouent → retour étape 2 + message « Pages trop denses… » au lieu du crash.
- **Progression** : `#hist-s3-status` affiche « Analyse du lot X / Y » pendant l'analyse multi-lots.
- **Option backend future** (non faite) : monter `max_tokens` dans `handleImportHistory_` — nécessite clasp push + deploy -i depuis le PC de Michel.

### Timer 100% silencieux + GO persistant + fin overtime (✅ 2026-07-02, ft-v166)
- **Cause racine ENFIN identifiée** (repro Michel : bouton −15 qui saute sous les 10 s) : les **bips synthétiques** `_beepTick()`/`beep()` (présents depuis longtemps, bien avant v163) créent un `AudioContext` dans les 5 dernières secondes et au 0 — sur iPhone, la simple **création** d'un contexte audio **coupe la musique de fond** sans la relancer. L'overlay (qui s'ouvre à `left===10` pile) posait un guard `_cdownActive` qui masquait le bug — mais −15 saute le "10 pile" → overlay jamais ouvert → bips → musique coupée.
- **Fix : ZÉRO audio dans le timer.** `_beepTick()`, les 2 déclarations `beep()`, `_initCdownAudio`/`_cdownAudio`, le déblocage au premier tap et `countdown.wav` (repo + précache) : tous supprimés. Bloc commentaire `AUDIO : AUCUN` dans log.js — ne JAMAIS créer d'AudioContext/Audio dans le timer. Vibrations + flash vert conservés.
- **GO persistant** (Option A) : plus d'auto-close 2 s — l'overlay reste jusqu'au tap ou bouton « Passer ▸ ».
- **Overtime supprimé** : à 0 → vibration → timer + pastille disparaissent (plus de `+m:ss`). `_stopRestTimerOnly()` (arrêt sans fermer l'overlay) + `stopRest()` = close + stop. CSS `.overtime`/`rest-blink` supprimés.
- **Skip anticipé** : `_cdownTap()` — avant le 0 = `stopRest()` immédiat ; après le GO = fermeture simple.
- **Testé** (Chromium, espion sur les constructeurs Audio/AudioContext) : 0 création audio sur — ouverture+tap, scénario −15 sous 10 s, cycle complet 13 s, skip. Mode avion OK (ft-v166).

### ⛔ ROLLBACK sons du repos (2026-07-02, ft-v165) — v163/v164 ANNULÉES
- **Test iPhone (iOS 26.5) : 4 bugs** — tic-tac joué tout haut à l'ouverture de l'app (le déblocage "muet" ne l'est pas sur iOS, même bug qu'à ft-v137→v143) ; skip cassé sur iPhone ; musique jamais relancée après un son ; **musique de fond coupée à chaque ouverture de l'app** (bug le plus grave, touchait tous les users iOS).
- **ft-v165 = retour exact au comportement ft-v162** : `log.js`, `sw.js`, `index.html`, `style.css` restaurés depuis le tag `backup-2026-07-02-avant-sons-repos`. `tick-tock.mp3`/`bell-boxing.mp3` supprimés, `countdown.wav` restauré. Son iOS de nouveau désactivé (guard `_isIOS`), overtime de retour.
- **⚠️ Leçon pour une future tentative** : le déblocage audio iOS (`muted`/`volume=0` + play au premier geste) joue le son AUDIBLE sur iOS récent, et l'activation d'une session audio web COUPE la musique de fond à l'ouverture. Ne pas retenter tel quel — il faudra une approche différente (ex. son uniquement après action explicite de l'utilisateur, jamais de play au boot, et test iPhone AVANT fusion).
- Les sections v163/v164 ci-dessous sont conservées pour référence historique uniquement.

### Sons du repos — tick-tock.mp3 + bell-boxing.mp3 (⛔ ANNULÉ par ft-v165) (2026-07-02, ft-v163)
- **Fichiers** : `tick-tock.mp3` (~28 s, joué en **boucle**) + `bell-boxing.mp3` (~11 s avec résonance) — racine du repo, dans le PRECACHE SW. `countdown.wav` **supprimé** (repo + précache).
- **Tic-tac** : démarre quand l'overlay décompte final s'affiche (`_showRestCountdown`), s'arrête au GO (`_stopTick()` dans `_restTick`) ou à la fermeture de l'overlay (skip/tap).
- **Cloche** : `_playBell()` au GO (repos = 0) — **toujours**, overlay affiché ou non. La cloche finit de résonner naturellement (pas coupée par la fermeture de l'overlay).
- **Overtime SUPPRIMÉ** : à 0 → cloche → arrêt + disparition du timer (barre + pastille). Plus de `+m:ss` rouge clignotant. `restOvertime`, classes CSS `.overtime`, `@keyframes rest-blink` : supprimés.
- **`_stopRestTimerOnly()`** : arrête chrono/barre/pastille SANS fermer l'overlay — utilisé au GO pour laisser l'overlay afficher GO + flash 2 s avant l'auto-close. `stopRest()` = `_closeRestCountdown()` + `_stopRestTimerOnly()`.
- **Bips synthétiques supprimés** : `_beepTick()` et les **deux** déclarations de `beep()` retirées (oscillateurs WebAudio). Vibrations 5→1 et GO conservées.
- **Éléments audio** : `_tickAudio` (loop=true) + `_bellAudio`, init par `_initRestAudio()`.
- **⚠️ Son iOS RÉACTIVÉ** (était désactivé depuis ft-v143) : déblocage au premier geste (`_unlockRestAudio` — muted+volume=0 → play → pause → restore) sur `touchstart` ET `pointerdown` (once). Si régression iOS : remettre le guard `if(!_isIOS)` autour des listeners. Rappel : le bouton silencieux physique iPhone coupe tout son web — vibration + flash vert restent.

### Écran GO persistant + fix skip anticipé + audioSession (⛔ ANNULÉ par ft-v165) (2026-07-02, ft-v164)
- **GO persistant** : l'auto-close 2 s après le GO est supprimé — l'overlay reste affiché jusqu'au tap ou bouton « Passer ▸ » (déjà existants). L'utilisateur ferme quand il part faire sa série.
- **`_cdownTap()`** (routé depuis `onclick` de `#ov-rest-countdown` ET du bouton Passer) :
  - avant le 0 (`!_cdownGoDone`) → **skip anticipé** = `stopRest()` : fin immédiate du repos, timer + pastille effacés, **pas de cloche ni tic-tac** (bug corrigé : avant, tap/Passer appelaient `_closeRestCountdown()` seul → le chrono continuait en fond et la cloche sonnait au 0)
  - après le GO (`_cdownGoDone`) → simple `_closeRestCountdown()` (timer déjà arrêté, cloche déjà jouée)
- **La cloche ne joue QUE si le repos atteint 0 naturellement** — tout skip (overlay, bouton Passer, ✕ de la barre) reste muet.
- **Musique de fond (iOS)** : `navigator.audioSession.type='transient'` dans `_initRestAudio()` (try/catch) — sur iOS 17+, les sons se mixent avec la musique (elle baisse puis remonte) au lieu de l'interrompre. **Limite honnête** : sur iOS < 17 (API absente), un son web interrompt la musique et iOS ne la relance pas — incontournable côté web.

### Fix reload SW pendant une séance en cours (✅ 2026-07-02, ft-v162)
- **Cause corrigée** : `controllerchange` (et message `SW_UPDATED`) forçaient un `window.location.reload()` **immédiat et sans condition** dès qu'une nouvelle version de l'app était détectée en arrière-plan (vérif toutes les 5 min, à chaque retour au premier plan, à chaque retour réseau) — y compris en pleine séance, pendant un superset.
- **Fix** : `_reloadForUpdate()` (`app.js`) vérifie `S.wkt` (séance active). Si séance en cours → `window._swReloadPending=true` (reload différé) + toast informatif. Sinon → reload immédiat comme avant.
- **Déclenchement différé** : `persist()` (`state.js`), à chaque appel, vérifie si `_swReloadPending` est vrai ET que `S.wkt` est vide — déclenche alors le reload. Comme `finishWorkout()` et `clearWkt()` (annulation séance) appellent `persist()` juste après avoir vidé `S.wkt`, le reload s'applique automatiquement dès la fin ou l'annulation de la séance, jamais pendant.

## Format de réponse Apps Script (v3.5)

```
GET ?test=1
→ {"status":"online","version":"3.5"}

GET ?action=loadProfile&email=...
→ {"status":"not_found"}
→ {"status":"ok","premium":bool,"premiumExpiry":"YYYY-MM-DD"|null,
   "profile":{name,bw,age,height,gender,goal,activityLevel,...},
   "prs":{},"sessions":[],"weightLog":[],"sleepLog":[],"cycle":null}

POST body JSON (Content-Type: text/plain;charset=utf-8)
{action:"saveProfile", email, name, bw, age, ..., sessions[], prs{}, weightLog[], sleepLog[], cycle}
→ {"status":"ok"}

POST {action:"logSession", rows:[...], bw, date, gender, age}
→ {"status":"ok","count":N}

POST {action:"coach", message, context, history}
→ {"reply":"..."}

POST {action:"validateCode", code, email}
→ {"status":"ok","type":"lifetime"} | {"status":"invalid"}

POST {action:"importProgram", images:[{type, data, name?, isText?}]}
→ {"status":"ok","data":{"name","weeks","startDate","days":[...]}}

POST {action:"importHistory", images:[{type, data, name?, isText?}]}
→ {"status":"ok","data":{"sessions":[{date,estimatedDate,label,exercises:[{name,sets:[{kg,reps,type,note}],note}]}]}}

POST x-www-form-urlencoded data={"email":"...","amount":"4.99",...}  ← Webhook Ko-fi
→ "OK"
```

## Conventions de code

- Pas de framework, pas de bundler — JS vanilla inline dans `index.html`
- State global `S` avec `persist()` / `load()` pour le localStorage
- Fonctions de rendu : `renderHome()`, `renderNutrition()`, `renderLog()`, etc.
- Navigation : `goScreen(id, navBtn)`
- Modals : `.overlay` + `.modal` + classe `.open`
- Toast : `toast(message, 'success'|'error'|'info')`
- **Appels réseau vers Apps Script** :
  - `_cloudSync()` (saveProfile) : `mode:'no-cors'` — ne pas changer, crash CORS historique
  - `syncSheets()` (logSession) : CORS + `redirect:'follow'` + `Content-Type: text/plain;charset=utf-8` — confirmation serveur nécessaire

## Variables clés

```javascript
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA/exec'; // dans constants.js
S.url             // = DEFAULT_URL (jamais null)
S.email           // email utilisateur (stocké ft4_email)
S.connected       // bool (stocké ft4_ok)
S.bw              // poids corps kg
S.prs             // {exerciceName: {rm1, kg, reps, date}}
S.sessions        // [{date, exs:[{name, sets:[{kg,reps,done,type,rm1}]}], vol}]
S.weightLog       // [{date, bw}]
S.sleepLog        // [{date, hours, energy}]
S.cycle           // {startDate, weeks, rm1s:{...}} ou null
S.coachFree       // nb questions gratuites utilisées (ft4_coachFree)
S.premium         // bool — accès premium (ft4_premium)
S.programmes      // [{name, date, exs:[...]}] — templates séances (ft4_progs)
S.defRest         // durée repos par défaut en secondes (130)
S.badges          // {badgeId: {unlockedAt:'YYYY-MM-DD'}} (ft4_badges)
S.bday            // date anniversaire 'JJ/MM' (ft4_bday)
S.lastWeekSummary // date du dernier résumé hebdo affiché (ft4_lws)
_expandedEx       // index exercice ouvert dans s-log (ou -1)
_syncTimer        // handle setTimeout pour _cloudSyncDebounced
_exPickerMode     // 'workout' | 'prog' — intercept addExercise() pour éditeur programme
_editProgIdx      // index du programme en cours d'édition
_editProgData     // deep copy du programme en cours d'édition
_editDayIdx       // index du jour cible pour ajout d'exercice
_lastProgAnalysisProg // dernier programme analysé par IA
_lastProgAnalysisReply // dernière réponse IA analyse programme
```

## Notes techniques importantes

### Silhouette musculaire féminine
- `_mscSVG` et `_mscSVGmini` utilisent la **même silhouette masculine** pour les deux genres (décision 2026-06-16)
- `female-body.png` est présent dans le projet mais **non utilisé** — tentatives d'intégration échouées (SVG `<image>` ne supporte pas CSS filter sur iOS WebKit, overlays difficiles à positionner)
- Dead code présent dans index.html : `_MG_F_SHAPES`, `_BDY_F`, `_BDY_F_MINI`, `_fHl`, `_mscSVG_F` — inoffensif, utilisable pour une future implémentation

### Dark mode
- Dark mode = **défaut** (pas de classe sur `#root`)
- Light mode = classe `light-mode` sur `document.getElementById('root')`
- Détection JS : `document.getElementById('root')?.classList.contains('light-mode')`
- Persisté : `localStorage.getItem('ft4_theme')` = `'light'` ou `'dark'`

## Règles du projet

### Service Worker — bump du cache obligatoire
À chaque release (push sur master + GitHub Pages) qui modifie un asset statique (images, CSS, JS) :
1. Ouvrir `sw.js`
2. Incrémenter `const CACHE = 'ft-vN'` → `ft-v(N+1)`
3. Le `controllerchange` listener dans `index.html` rechargera l'app automatiquement chez les utilisateurs — pas besoin de vider le cache manuellement

Ne pas bumper si la modif ne concerne que `Code.js` (backend Apps Script uniquement).

#### Historique des caches SW (référence pour continuer la numérotation)
| Cache | Contenu |
|-------|---------|
| ft-v128 | gym perf : cache-first SW navigation, timeout autoConnect, retry Sheets |
| ft-v129 | normalisation séances `_buildSyncRows` |
| ft-v130 | normalisation générale (fix) |
| ft-v131 | dédicace Eline v1 simple |
| ft-v132 | dédicace Eline v2 gâteau + mini-jeu |
| ft-v133 | dédicace Eline production (guards restaurés) |
| ft-v134 | fix chrono repos opaque |
| ft-v135 | overlay décompte final de repos |
| ft-v136 | notes libres par exercice |
| ft-v137 | son décompte : bips synthétiques 10→1 + iOS AudioContext |
| ft-v138 | fix double bip 5→1 (_beepTick guard) |
| ft-v139 | fix double GO (beep() guard sur les deux déclarations) |
| ft-v140 | son décompte → countdown.wav, suppression oscillateurs |
| ft-v141 | flash vert 200ms au GO (mode silencieux iPhone) |
| ft-v142 | fix déblocage iOS muet (muted=true avant play()) |
| ft-v143 | désactive son iOS, volume=0 Android |
| ft-v144 | fix séance coincée : stopRest() au boot, draft clear, bouton ✕ annuler |
| ft-v145 | fix FAB position : _syncLogHdrBtns() + rAF _positionFab à chaque renderExBlocks |
| ft-v146 | fix iOS Safari : window._adminMode/_curScreen/_premiumPending (TDZ) |
| ft-v147 | fix openRestoreAccount global + scan _isIOS doublon |
| ft-v148 | fix SyntaxError _isIOS doublon app.js/log.js |
| ft-v149 | fix ReferenceError _obGender TDZ + try/catch par champ _applyRestoreData |
| ft-v150 | fix _premiumPending → window, try/catch renders dans doRestoreAccount |
| ft-v151 | force refresh cache SW + boot log ft-v151 |
| ft-v152 | fix _isIOS doublon : supprimé de app.js, converti en boolean |
| ft-v153 | fix _obGender TDZ dans _applyRestoreData + window._premiumPending |
| ft-v154 | garde-fou cloud sessions/PRs + restauration backup Michel 11s·30PRs |
| ft-v155 | réactive sync cloud (garde-fou @47 actif) |
| ft-v156 | boot log dynamique via caches.keys() — fin du bug "version hardcodée" |
| ft-v157 | auto-restauration au démarrage : cookie+IDB email redondant, overlay reconnect |
| ft-v158 | sync cloud programmes + exRestPref + garde-fou programmes |
| ft-v159 | local-first pull + guard auto-restore élargi + label "ce mois" séances |
| ft-v160 | garde-fou global profil serveur (@50) : bday/badges sauvés, '' et 0 ne gagnent jamais sur rempli ; restore prénom manquant (champ inline) ; z-index overlay restore |
| ft-v161 | import historique séances (#ov-import-hist) — flow isolé, conflits date, PRs chrono |
| ft-v162 | polices Manrope/Space Grotesk/Pacifico hébergées en local (fonts/, plus de Google Fonts) + fix reload SW différé si séance en cours |
| ft-v163 | sons repos tick-tock + bell-boxing, son iOS réactivé — ⛔ annulé par ft-v165 |
| ft-v164 | GO persistant + fix skip anticipé + audioSession — ⛔ annulé par ft-v165 |
| ft-v165 | ROLLBACK v163/v164 → retour comportement v162 (4 bugs iOS : son à l'ouverture, skip cassé, musique coupée) |
| ft-v166 | timer 100% SILENCIEUX (bips synthétiques + countdown.wav supprimés — la création d'AudioContext coupait la musique iPhone) + GO persistant + fin overtime + fix skip anticipé |
| ft-v167 | import journal par lots de 3 pages (fix réponse IA tronquée sur gros journaux) + import partiel si lot en échec |
| ft-v168 | limite premium import journal (1 gratuit au total, illimité premium) — compteur local+cloud, mur dédié #ov-hist-wall |
| ft-v169 | diagramme muscles : reconnaissance insensible aux accents (_naz) + vocabulaire _MEX enrichi (chest press, peck deck, décliné…) + fix abduction→fessiers — 84/87 exos reconnus (avant 50) |
| ft-v170 | diagramme muscles : bleu « indirect » rendu discret (gris-bleu doux, plus d'ombre portée) sur figurine + mini + légende |
| ft-v171 | détail de séance unifié sur _mscScores (mini-bonhomme coloré) — muscles affichés aussi pour les exos machines/perso |
| ft-v172 | étiquette carte historique : nom de la séance du programme (🗂️) si dispo, sinon muscle le plus travaillé (💪) |
| ft-v173 | migration « Press » (exo perso) → « Press Jambes 45° » (EXLIB) — PR/séances/programmes/exos perso, garde-fou PR max, sans perte |
| ft-v174 | détail de séance : ligne « 🎯 Meilleur 1RM potentiel : XX kg » par exo + ~XX kg par série rendus lisibles (couleur neutre pleine, contraste jour/nuit) |
| ft-v175 | onglet Progrès : ligne « 🏋️ Charge max soulevée : XX kg × N → ~YY kg 1RM » (poids réel, distinct du 1RM estimé), rétroactive, H/F identique |
| ft-v176 | programmes : repos par série (schéma Série/Reps/Repos éditable dans l'éditeur + appliqué au minuteur au chargement) — étape 1/2 (affichage) |
| ft-v177 | éditeur programme : reps + nombre de séries éditables + vignette exercice à gauche (photo locale > image muscle réaliste devinée du nom > figurine) |
| ft-v178 | bouton central « + » docké dans la barre (fini le FAB flottant `#fab-session` qui recouvrait les séries + souci swipe) — mot « Séance » retiré |
| ft-v179 | uniformisation visuelle étape 1 : gabarit de tuile unique Accueil + Coach (icône 40px, titre 15/700, sous-titre 12/t3), cohérent en mode normal + agrandi (a11y-lv) |
| ft-v180 | uniformisation visuelle étape 2 : cartes Séance Sommeil + Cardio rebranchées sur le gabarit (classes .home-row-*) — cohérent normal + agrandi ← **actuel** |

### Backend Apps Script — historique déploiements récents
| Version | Contenu |
|---------|---------|
| @51 | backup quotidien auto + test garde-fou `?action=testGardeFou` |
| @52 | suppression rétention 60j — append-only pur |
| @53 | backups → Google Drive (DriveApp) + migration Sheet→Drive + scope `drive` |
| @54 | warning quota Drive dans `backupAllUserData_()` — log si > 1000 fichiers |
| @55 | fix import : découpage séances (SÉANCE N only) + PDF natif + superset général |
| @56 | import : unilatéral NxN×2, +M sur partenaire superset, setType défaut '' |
| @57 | import : Ramping reps → repsPerSet[séquence], setType = '' ou 'D' seulement (jamais E/W) |
| @58 | import historique : action importHistory → handleImportHistory_ (Sonnet) ← **actuel** |

**Dossier Drive backups** : `ForceTracker-Backups/` (ID : `1iQ6xFuG10d4qCE1Jz8d8lOodrUsV36Fq`)  
**Trigger quotidien** : `backupAllUserData_()` à 2h du matin, 1 actif  
**Fichiers créés** : `backup-YYYY-MM-DD.json` (ou `-HH-mm` si 2e exec le même jour)  
**Migration** : ancien onglet Sheet `Backup 2026-06-29 20:03` → `backup-migration-2026-06-29-2003.json`

### Tests — Chrome ET Safari
Tester toute modif UI sur **les deux navigateurs** avant de reporter la tâche comme terminée :
- **Chrome** (DevTools > mobile, ou vrai Android) — comportement de référence
- **Safari iOS** — différences connues : `position:fixed/sticky` dans les scroll containers, `getBoundingClientRect()` requis pour positionner des éléments flottants (CSS `%` non fiable), `<input type=file>` capture photo

Les bugs iOS Safari sont souvent silencieux (pas d'erreur console) — tester impérativement.

### Ordre de travail
- Une seule fonctionnalité modifiée → testée → validée avant de passer à la suivante
- Toujours vérifier que les écrans adjacents n'ont pas régressé (ex : modifier `s-log` → vérifier aussi `s-home` et `s-progress`)
- Ne jamais merger sur `master` sans avoir testé sur l'app déployée (GitHub Pages) ou en local avec un serveur HTTP
