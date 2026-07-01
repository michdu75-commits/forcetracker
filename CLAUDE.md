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

---

# Force Tracker — Contexte projet pour Claude

## Présentation

PWA de suivi de musculation (Progressive Web App), conçue pour mobile (max-width 430 px). Single-page app HTML/CSS/JS pur, sans framework ni build step. Déployée sur GitHub Pages.

- **Repo GitHub** : https://github.com/michdu75-commits/forcetracker
- **App live** : https://michdu75-commits.github.io/forcetracker/
- **Auteur** : Michel — michdu75@gmail.com

## Backend Apps Script (v3.5 @46 — actif)

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
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache `ft-v142` |
| `Code.js` | Backend Google Apps Script v3.5 @46 (sync cloud, coach IA, premium) |
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
  - Couleur : >50% vert → >20% or → rouge — overtime : clignotement `@keyframes rest-blink`
  - Durée par défaut : **130s**, boutons −15s / +15s
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
  - Cache actuel : `ft-v142`
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

### Son décompte final — countdown.wav (✅ 2026-07-01, ft-v137→ft-v142)
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

### Chasse au trigger fantôme PREMIUM_EMAILS (✅ 2026-06-30, Code.js @46)
- **Trigger fantôme** : trigger installable inconnu dans l'UI Apps Script (invisible depuis clasp) réécrit `PREMIUM_EMAILS` — cause identifiée
- **Double protection** : `PREMIUM_HARDCODED_` (priorité absolue) + `ensurePremiumEmails_()` appelée à chaque `doPost`
- **Purge one-shot** dans `doGet` : supprime tous les triggers, flag `triggers_purged_20260630`, double try/catch (jamais bloquant même si scope `script.scriptapp` non autorisé)
- ⚠️ Pour que la purge s'exécute réellement : lancer `authorizeAndListTriggers()` depuis l'IDE Apps Script pour autoriser le scope `script.scriptapp` une fois

### Import programme — Fichiers Word et Excel (✅ 2026-06-16)
- Bouton 📸 dans s-log → flow import → accept étendu à `.docx` et `.xlsx/.xls`
- **Word (.docx)** : chargement dynamique mammoth.js (CDN cdnjs, ~150KB) → `extractRawText` → texte brut
  - `_loadMammoth()` : charge la lib si absente, retourne Promise
- **Excel (.xlsx/.xls)** : chargement dynamique SheetJS (CDN jsdelivr, ~800KB) → CSV par feuille
  - `_loadXLSX()` : charge la lib si absente, retourne Promise
  - Format : `[Feuille : NomFeuille]\n` + CSV, toutes les feuilles concaténées
- `addImportFile(input)` : async, limite 15MB par fichier, gère les 3 types (image/docx/xlsx) en parallèle
- Miniature : icône 📊 pour Excel, 📝 pour Word/texte, 📄 pour PDF
- Backend @11 : `handleImportProgram_` gère `isText:true` → `{type:'text', text:'[Fichier Word : ...]'}` envoyé à Claude
- Modèle utilisé : claude-sonnet-4-6 si fichier texte/PDF, claude-haiku si images seulement

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
| ft-v142 | fix déblocage iOS muet (muted=true avant play()) ← **actuel** |

### Tests — Chrome ET Safari
Tester toute modif UI sur **les deux navigateurs** avant de reporter la tâche comme terminée :
- **Chrome** (DevTools > mobile, ou vrai Android) — comportement de référence
- **Safari iOS** — différences connues : `position:fixed/sticky` dans les scroll containers, `getBoundingClientRect()` requis pour positionner des éléments flottants (CSS `%` non fiable), `<input type=file>` capture photo

Les bugs iOS Safari sont souvent silencieux (pas d'erreur console) — tester impérativement.

### Ordre de travail
- Une seule fonctionnalité modifiée → testée → validée avant de passer à la suivante
- Toujours vérifier que les écrans adjacents n'ont pas régressé (ex : modifier `s-log` → vérifier aussi `s-home` et `s-progress`)
- Ne jamais merger sur `master` sans avoir testé sur l'app déployée (GitHub Pages) ou en local avec un serveur HTTP
