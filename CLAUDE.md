# Force Tracker — Contexte projet pour Claude

## Présentation

PWA de suivi de musculation (Progressive Web App), conçue pour mobile (max-width 430 px). Single-page app HTML/CSS/JS pur, sans framework ni build step. Déployée sur GitHub Pages.

- **Repo GitHub** : https://github.com/michdu75-commits/forcetracker
- **App live** : https://michdu75-commits.github.io/forcetracker/
- **Apps Script URL (v3.1 — active)** : https://script.google.com/macros/s/AKfycbw52oQ9grdgeXQcnWaP3t-3C50oNUAzkn5lBTuXbEbCi_61vE8Aml8Pb6vwjw02CM1OHA/exec
- **Fichier Apps Script local** : `appsscript.gs` (référence — déjà déployé)
- **Auteur** : Michel — michdu75@gmail.com

## Architecture

| Fichier | Rôle |
|---|---|
| `index.html` | App complète (HTML + CSS + JS inline, ~3 200 lignes) |
| `appsscript.gs` | Backend Google Apps Script v3.1 (sync cloud) |
| `manifest.json` | Config PWA (icône, couleurs, display:standalone) |
| `logo.png` | Icône app |

**État persistant** : `localStorage` — clés préfixées `ft4_*`  
**Objet global** : `S` (state) — chargé par `load()`, sauvé par `persist()`  
**URL Apps Script** : codée en dur dans `DEFAULT_URL` (ligne ~1084), jamais saisie par l'utilisateur

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

**Mode admin** : 5 taps sur le logo → onglet "Admin" caché dans Setup (email, test connexion, restaurer, voir réponse brute API). Masqué aux utilisateurs normaux.

## Fonctionnalités implémentées

### Entraînement
- Suivi de séances (exercices, séries, reps, poids, type : Normal/Warm-up/Eccentrique/Drop)
- Timer de repos configurable (60/90/120/180/300 s) avec barre de progression
- Calculateur de plaques (visualisation disques sur barre)
- PRs automatiques (calcul 1RM Brzycki) par exercice
- Niveaux de force (Débutant/Novice/Intermédiaire/Avancé/Élite) par genre/âge

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

### Navigation bas de page (v2 — 2026-06-13)
- Ordre : Accueil · Progrès · **Séance** (centre) · Nutrition · Coach · Setup
- Bouton Séance : FAB surélevé, cercle rouge 54px, icône + blanche — classe `.nb-ctr`
- `.nav` a `align-items:flex-end` + `overflow:visible` pour l'élévation

### Onglet Progrès
- 4 chips cliquables : Squat · Soulevé de Terre · Développé Couché · Développé Militaire
- Variable globale `_progEx` (défaut : `BIG4[0]`)
- Fonction `selectProgEx(name)` — met à jour chip actif + appelle `renderChart()`
- Dropdown "Autre exercice" pour tous les autres exercices

### Programmes (séances sauvegardées)
- `S.programmes` — tableau de templates (`ft4_progs`)
- Modal `#mod-prog` : sauvegarder séance en cours, charger avec poids précédents, supprimer

### Cloud sync (Google Apps Script)
- `saveProfile` POST → sauvegarde profil (email, nom, poids, âge, taille, sexe, objectif, activité)
- `loadProfile` GET → restaure le profil depuis l'email + retourne `premium:true` si email whitelisté
- `logSession` POST → log séance dans Google Sheets (analytics)
- `coach` POST → appel Claude Haiku API pour le Coach IA
- `validateCode` POST → vérifie un code premium (liste dans `PREMIUM_CODES`)
- **Webhook Ko-fi** : doPost détecte `e.parameter.data` → ajoute email dans `PREMIUM_EMAILS` automatiquement

## Coach IA Premium (implémenté 2026-06-13)

### Modèle freemium
- **Gratuit** : 10 questions (compteur `S.coachFree`, persisté `ft4_coachFree`)
- **Premium** : 4,99€ / 2 mois via Ko-fi — `S.premium` (persisté `ft4_premium`)
- `COACH_FREE_LIMIT = 10` (constante JS)

### Mur Premium
- Affiché après la 10ème réponse (délai 1,2s pour lire la réponse)
- Div `#coach-wall` — position absolute sur toute la zone coach
- Bouton Ko-fi → https://ko-fi.com/michel2176
- Champ code + bouton Activer → `activatePremium()`

### Activation Premium — 3 méthodes
1. **Email whitelist** (gratuit/test) : ajouter l'email dans `PREMIUM_EMAILS` (Script Properties)
2. **Code payant** : ajouter le code dans `PREMIUM_CODES` (Script Properties), l'utilisateur saisit le code dans l'app
3. **Webhook Ko-fi automatique** : à chaque paiement Ko-fi → Apps Script → email ajouté dans `PREMIUM_EMAILS`

### Config Apps Script (Script Properties)
| Propriété | Usage |
|---|---|
| `PREMIUM_EMAILS` | Emails premium gratuits, séparés par `,` |
| `PREMIUM_CODES` | Codes d'accès payants, séparés par `,` |
| `KOFI_TOKEN` | Token de vérification webhook Ko-fi (optionnel) |
| `ANTHROPIC_API_KEY` | Clé API Claude pour le Coach IA |

### Webhook Ko-fi
- Ko-fi → Settings → API → **Webhook URL** = URL du Apps Script déployé
- Chaque paiement → Ko-fi POST `data={"email":"...","amount":"4.99",...}` → email ajouté automatiquement
- Log dans Google Sheets onglet `Premium`
- **Après toute modif Apps Script : redéployer** (nouveau déploiement)

### Vérification premium au démarrage
- `autoConnect()` vérifie `loadProfile` si email connu + pas encore premium
- `_applyRestoreData()` applique `premium:true` si la réponse serveur le contient
- Badge header : `#coach-quota-badge` — rouge (X questions) ou or (⭐ Premium)

## État du cloud sync — fixes appliqués (2026-06-12)

### Bugs corrigés côté app (commit 64e6520)

| Bug | Cause | Fix |
|---|---|---|
| `saveProfile` ne sauvegardait jamais | `mode:'no-cors'` bloquait le redirect Apps Script | `redirect:'follow'` + `Content-Type: text/plain` |
| Restauration échouait même si profil existait | App lisait `data.name` au lieu de `data.profile.name` | `_applyRestoreData` gère le format `{status, profile:{}, prs:{}}` |
| `finishOnboarding` ne synchait pas le cloud | Manquait l'appel `saveProfile` cloud après onboarding | Ajouté |
| `testConn` toujours OK même URL fausse | `no-cors` = réponse opaque | Lit vraiment `{status:'online'}` |

### Nouvelle URL Apps Script déployée (2026-06-12)
L'ancienne URL (`AKfycbxPvDqe...`) a été remplacée par la nouvelle (`AKfycbw52oQ9...`).  
`DEFAULT_URL` dans `index.html` est à jour. App poussée sur GitHub Pages.  
**✅ Restauration confirmée fonctionnelle le 2026-06-12 — saveProfile + loadProfile opérationnels.**

### Format de réponse Apps Script (v3.2)

```
GET ?test=1
→ {"status":"online","version":"3.1"}

GET ?action=loadProfile&email=...
→ {"status":"not_found"}
→ {"status":"ok","premium":bool,"profile":{name,bw,age,height,gender,goal,activityLevel},"prs":{},"sessions":[],"weightLog":[],"sleepLog":[],"cycle":null,"nutritionPhase":"charge"}

POST body JSON (Content-Type: text/plain;charset=utf-8)
{action:"saveProfile", email, name, bw, age, height, gender, goal, activityLevel}
→ {"status":"ok"}

POST {action:"logSession", rows:[...], bw, date, gender, age}
→ {"status":"ok","count":N}

POST {action:"coach", message, context, history}
→ {"reply":"..."}

POST {action:"validateCode", code, email}
→ {"status":"ok","type":"monthly"} | {"status":"invalid"}

POST x-www-form-urlencoded data={"email":"...","amount":"4.99","verification_token":"...",...}  ← Webhook Ko-fi
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
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbw52oQ9.../exec';
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
```
