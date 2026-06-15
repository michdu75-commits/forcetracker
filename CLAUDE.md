# Force Tracker — Contexte projet pour Claude

## Présentation

PWA de suivi de musculation (Progressive Web App), conçue pour mobile (max-width 430 px). Single-page app HTML/CSS/JS pur, sans framework ni build step. Déployée sur GitHub Pages.

- **Repo GitHub** : https://github.com/michdu75-commits/forcetracker
- **App live** : https://michdu75-commits.github.io/forcetracker/
- **Auteur** : Michel — michdu75@gmail.com

## Backend Apps Script (v3.2 — actif)

- **Compte Google** : forcetracker.app@gmail.com
- **URL déployée** : `https://script.google.com/macros/s/AKfycbyXlNWFvidB9n8ptaP9m8zWyWr5hfJ-WbE7zrkQwCPbBjdUbf5H37GDthQkMl8ETmNv0g/exec`
- **Script ID** : `1RwE46heNmZrykInYcrMgm1OZWt4NmS6NjTqttvAevZLuqo2v6EEb1Drw`
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

## Architecture

| Fichier | Rôle |
|---|---|
| `index.html` | App complète (HTML + CSS + JS inline, ~4 200 lignes) |
| `Code.js` | Backend Google Apps Script v3.2 (sync cloud) |
| `manifest.json` | Config PWA (icône, couleurs, display:standalone) |
| `logo.png` | Icône app |

**État persistant** : `localStorage` — clés préfixées `ft4_*`  
**Objet global** : `S` (state) — chargé par `load()`, sauvé par `persist()`  
**URL Apps Script** : codée en dur dans `DEFAULT_URL` (ligne ~1246), jamais saisie par l'utilisateur  
⚠️ **Ne jamais changer DEFAULT_URL sans la mettre à jour dans index.html ET redéployer**

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
- **`.screen` padding-bottom** : 110px (était 90px) — espace suffisant pour "Terminer la séance" sous le banner

### Coach IA — Photo corporelle (2026-06-13)
- Bouton 📷 dans `s-coach` → `openCoachCamera()` → `<input type=file accept=image/*>`
- `onCoachImgSelected(input)` : redimensionne via canvas (max 800px, JPEG 0.8) → `_coachImg` (base64)
- `sendToCoach()` : si `_coachImg` présent, payload inclut `image` + `imageType` → envoyé à Apps Script
- `clearCoachImg()` : réinitialise après envoi
- Backend `handleCoach_` : construit `userContent` multimodal (`{type:'image',...},{type:'text',...}`)
- Système prompt inclut : "Quand une photo est fournie, analyse la composition corporelle visible..."

### Morphologie (à implémenter dans Profil)
Infographie source : `C:\Users\atzla\Downloads\Morphologies-Homme-Infographie-EOLE-PARIS.png.webp`

**5 morphologies hommes** (forme du corps) :
| Code | Nom | Description |
|---|---|---|
| `A` | Triangle | Taille et hanches légèrement plus grosses que le buste |
| `H` | Rectangle | Épaules d'une largeur identique à la taille et aux hanches |
| `T` | Trapèze | Hanches légèrement plus petites que les épaules |
| `V` | Triangle inversé | Épaules beaucoup plus larges que hanches et taille |
| `O` | Ovale | Ventre et bas du torse plus larges que épaules et taille |

**3 morphotypes** (métabolisme/constitution) :
| Code | Nom | Caractéristiques |
|---|---|---|
| `ecto` | Ectomorphe | Ossature légère, métabolisme rapide, mince, peu de masse musculaire, difficultés à prendre du poids |
| `meso` | Mésomorphe | Muscles bien dessinés, athlétique/fort, gagne et perd du muscle facilement |
| `endo` | Endomorphe | Corps rond, métabolisme lent, gagne et perd du muscle facilement, grossit aisément, difficultés à perdre du poids |

Champs à ajouter dans `S` (state) : `S.morpho` (A/H/T/V/O) et `S.morphotype` (ecto/meso/endo)  
À sauvegarder dans le profil cloud via `handleSaveProfile_` (champs `morpho` et `morphotype`)  
À utiliser par le Coach IA dans `buildCoachContext()` pour des conseils personnalisés

### Coach IA Premium
- **Gratuit** : 10 questions (`S.coachFree`, persisté `ft4_coachFree`, constante `COACH_FREE_LIMIT=10`)
- **Premium** : 4,99€ / 2 mois via Ko-fi (`S.premium`, persisté `ft4_premium`)
- Mur premium `#coach-wall` après la 10ème réponse (délai 1,2s)
- Bouton Ko-fi → https://ko-fi.com/michel2176
- 3 méthodes d'activation : whitelist email / code payant / webhook Ko-fi automatique
- Badge header `#coach-quota-badge` : rouge (X questions) ou or (⭐ Premium)
- Webhook Ko-fi : chaque paiement → email ajouté dans `PREMIUM_EMAILS` + log onglet `Premium`

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
- 6 variantes dans EXLIB (`g:'Jambes'`) : Hack Squat, Press Jambes 45°, Horizontale, Verticale, Inclinée, Levier
- Images locales dans `exercises/press-jambes-{1-6}.jpg` et `exercises/press-jambes-5.jpg` (Hack Squat)
- `EX_YT` mappé avec `{img:'exercises/press-jambes-X.png|jpg'}` pour chaque variante
- Soulevé de Terre présent dans **deux** groupes : `g:'Dos'` (original) ET `g:'Fessiers'` (ajouté)

### Programmes (séances sauvegardées)
- `S.programmes` — tableau de templates (`ft4_progs`)
- Modal `#mod-prog` : sauvegarder séance en cours, charger avec poids précédents, supprimer

## Format de réponse Apps Script (v3.2)

```
GET ?test=1
→ {"status":"online","version":"3.2"}

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
- **Tous les appels réseau vers Apps Script** : `Content-Type: text/plain;charset=utf-8` + `redirect:'follow'` — jamais `mode:'no-cors'`

## Variables clés

```javascript
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbyXlNWFvidB9n8ptaP9m8zWyWr5hfJ-WbE7zrkQwCPbBjdUbf5H37GDthQkMl8ETmNv0g/exec';
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
_expandedEx       // index exercice ouvert dans s-log (ou -1)
_syncTimer        // handle setTimeout pour _cloudSyncDebounced
```
