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

**11. 📣 À CHAQUE fonctionnalité mise en PROD — prévenir l'utilisateur (checklist OBLIGATOIRE, ne jamais zapper).**
Une feature n'est PAS finie tant que l'utilisateur n'est pas informé. Avant de considérer une feature comme livrée en prod, faire **les 5** :
1. **Pop-up « Quoi de neuf »** → ajouter une entrée dans `WHATS_NEW` (constants.js) avec `v = WHATS_NEW_MAX+1`, puis **incrémenter `WHATS_NEW_MAX`**.
2. **Point rouge « nouveauté »** → ajouter une entrée dans `NEW_FEATURES` (constants.js) : `{id, screen, desc}` (+ `spot`/`anchor` si on vise un élément précis).
3. **Aide contextuelle « ? »** de l'onglet concerné → mettre à jour `_HELP_DATA` (screens.js) pour l'écran touché.
4. **Aide détaillée** (Menu → Aide) → ajouter/mettre à jour l'entrée dans `_DRAWER_CONTENT.help` (coach.js).
5. **Guide de l'application** (Menu → Guide de l'application, diaporama `APP_GUIDE_SLIDES` dans app.js) → ajouter/mettre à jour la diapo. ⚠️ Les **captures d'écran** (`guide/*.jpg`) doivent être **fournies par Michel** — lui demander si besoin.
- **Guide d'installation** : à mettre à jour SEULEMENT si la feature change la façon d'installer l'app (rare).
- Ces éléments vivent sur des **branches de test** tant que la feature est sur le `/clone/` → on les remplit **au moment de la promotion en prod** (sinon les points rouges/pop-ups ne servent personne).
- ⚠️ Ne PAS se laisser emporter par la construction et oublier cette étape (erreur commise en juillet 2026 : calendrier/score santé livrés sans pop-up ni aide).

**12. 📓 TENIR TOUS LES FICHIERS DE SUIVI À JOUR EN TEMPS RÉEL — automatiquement, à chaque modif, sans qu'on le demande.**
Documenter n'est PAS une étape séparée « pour plus tard » : ça fait partie de la livraison, **en temps réel**, dans le **même mouvement** que le bump `sw.js` + commit + push (un réflexe, jamais sur demande de Michel). À CHAQUE fonctionnalité ou correctif livré (chaque `ft-vNN`) :
- **`CLAUDE.md` — LE fichier maître, PRIORITAIRE** (il est relu au début de CHAQUE session : il doit TOUJOURS refléter la réalité). Ajouter une entrée (1 ligne concise) dans le journal des versions : **quoi + pourquoi** (le retour/la raison) + le `ft-vNN`. Ne jamais le laisser prendre du retard.
- **Fichier(s) de suivi dédié(s)** du chantier en cours (ex. `DOSSIER-ATHLETE-SUIVI.md`, `CONSTITUTION-MILO.md`, `IDEES-FUTURES.md`, `A-FAIRE-SUR-PC.md`…) : entrée détaillée + mise à jour de la table des **points de sauvegarde** + de toute décision prise.
- **Règle stricte** : aucune version livrée (commit/push) sans que TOUS les fichiers de suivi concernés soient à jour **dans le même commit** (ou juste avant). Si un retard est constaté → **rattrapage immédiat** (1 ligne par version manquante) avant toute autre chose.

**📜 Documents de gouvernance (à respecter) :**
- 🌟 **`docs/VISION-FORCE-TRACKER.md`** — **l'ESPRIT / le POURQUOI du produit** : *« Force Tracker n'est pas une IA, c'est une mémoire sportive intelligente »* · *« il ne te dit pas qui tu dois devenir, il se souvient de qui tu es devenu »*. Le sportif ne repart jamais de zéro ; la vie avant le programme ; observer avant conseiller ; adapter avant interdire. **Question de référence avant toute feature : « est-ce que cela renforce l'esprit Force Tracker ? »** La Constitution dit le *comment*, la Vision dit le *pourquoi*.
- 👥 **`docs/PERSONAS-FONDATEURS.md`** — **à lire juste après la Vision** : les personas ne sont plus des profils de test, ce sont les **dimensions du projet**. **Michel** = Vision & Architecture (le fondateur, à part). **Christophe** = Terrain & Métier (→ VM). **Tatiana** = Personnalisation, pas de présupposés (→ VC). **Emma** = Physiologie & Ressenti (→ VC). Relie chaque évolution technique à un besoin humain concret. Règle : un nouveau persona n'entre que s'il ouvre une **dimension** nouvelle. *(Idée & conception : Michel.)*
- 🧩 **`docs/MODELE-METIER.md`** — **le LANGAGE COMMUN du produit** (v0.1, vivant) : les objets métier que TOUS les modules partagent (Athlète · Objectif · Programme · Cycle · Séance · Bloc · Exercice · Série · Exercice-bibliothèque) + transversaux (Méthode · Consigne · Notation) + la grammaire + le principe **PLANIFIÉ vs RÉALISÉ**. Cap posé par Michel (21/07/2026) : penser « objets métier », pas « fonctionnalités ». Se distille des vrais programmes, reste vivant. Lié au chantier structures (`PARSER-STRUCTURES.md`).
- 📍 **`docs/CONTEXTE-ACTUEL.md`** — **À LIRE EN PREMIER avant toute nouvelle tâche** (1 page) : version, branche, brique active, dernières décisions, prochaine étape, blocages. Le raccourci pour reprendre le contexte sans tout relire.
- **`docs/PROCESSUS-DEVELOPPEMENT.md`** — la **méthode officielle** : le cycle d'une brique (Réflexion → Spécification `Objectif/Critère/Hors périmètre` → Challenge → Développement → **Clôture obligatoire** → Validation Michel). Suivre ce processus pour CHAQUE brique, sans sauter d'étape.
- **`CONSTITUTION-MILO.md`** — les principes stables (la personne d'abord, sécurité, faits avant opinions, confidentialité…). Toute évolution doit les respecter.
- **`docs/PRESENCE-MILO.md`** — vision d'identité : Milo devient la **présence** / la porte d'entrée du produit (Milo → App), sans gadget, jamais un passage obligé. **Le cerveau d'abord, la présence ensuite.** Guide l'UX des futures briques.
- 🧠 **`docs/MOTEUR-RAISONNEMENT-MILO.md`** — **LE CADRE du « cerveau de Milo »** (réflexion fondatrice Michel 22/07) : le pipeline **Compréhension → Diagnostic → décision → Explication** (le DIAGNOSTIC = l'étape qui manquait : même contexte, cause différente, stratégie différente) ; les **2 cerveaux** (Comprendre = Registre/ADN/Observations/état du jour/mémoire · Décider = raisonnement + Gardien + générateur) ; et surtout la **limite volontaire (Principe 18)** : **fiabilité AVANT intelligence** — profil vivant, décider avec l'info d'aujourd'hui, **ne jamais faire semblant de savoir**, **savoir s'arrêter**. Chaque brique « cerveau » (ancre/accessoire, observations, profil conversationnel…) est une **PIÈCE de ce moteur**, jamais un ajout isolé.
- 🍽️ **`docs/NUTRITION-PHILOSOPHIE.md`** — **L'ESPRIT de la nutrition** (cadre à respecter AVANT de coder une brique nutrition ; croisement Gemini + Mistral + Claude + synthèse Michel, 22/07). Phrase-boussole : *« la nutrition est un moyen d'améliorer la santé/récup/perf ; elle ne doit jamais devenir une source de stress supérieure au bénéfice qu'elle apporte »* (**Constitution · Principe 21**). Les principes (levier au service de l'objectif · optionnelle jamais bloquante · fiabilité > exhaustivité · cohérence > réactivité · local d'abord + fallback fait-maison · qualité gratuite via Nutri-Score/NOVA · adapter pas imposer · mémoire · anti-TCA) · **la précision au CHOIX (4 niveaux : qualitatif → portions → macros → suivi précis)** · **le Gardien nutrition** (seuils d'alerte) · **la 1ʳᵉ brique** (journal léger « à la portion » sur Open Food Facts) · la couche future (chronobiologie/montre connectée).
- 📱 **`docs/STRATEGIE-NATIF.md`** — **les principes DURABLES du passage en natif/hybride** (cadrage 22/07, croisement Gemini + Mistral + Claude + synthèse Michel). Principe directeur (Michel) : *« le natif ne doit apporter que ce que le web ne peut pas offrir »* (question de contrôle : la PWA suffit-elle déjà ?). Chemin : **coque Capacitor, zéro réécriture** (on garde Milo/EXLIB/modèle/local-first) ; RN/Flutter/Tauri/Cordova écartés ; TWA sur Android. **Approche progressive** des plugins (préparer l'archi, n'ajouter chaque plugin que sur un besoin réel — pas « tous en V1 »). Priorité : objets connectés > push > stores > (IAP en dernier). Monétisation : au lancement garder le premium **serveur** (rien vendu in-app → esquive la taxe Apple), bouton neutre « gérer sur le web » ensuite. ⚠️ **Aucune estimation de coût/délai** (décision Michel : un doc d'archi garde les principes durables).
- 🧨 **`docs/GALERES-ET-LECONS.md`** — le **journal d'expérience** (« comment Force Tracker est devenu plus robuste ») : grosses galères résolues (son iOS, 4G, perte de données, backend qui tombe…), **décisions qu'on ne regrette pas** (§6), **fausses bonnes idées** (§7), problèmes **encore ouverts**, ce qui **manque**, et les **réflexes** pour ne pas re-tomber dedans. À consulter avant un chantier risqué, et à **compléter à chaque nouvelle galère / décision / fausse bonne idée**.
- 🧭 **`docs/BUGS-DE-PHILOSOPHIE.md`** — **NOUVEAU (23/07/2026), l'un des docs les plus précieux** : ne documente PAS des bugs de code, mais les **dérives de COMPORTEMENT de Milo** (une hypothèse présentée comme un fait, une mémoire créée d'une déduction, un interrogatoire, une sortie de rôle…) — le *raisonnement* est souvent bon, c'est la **SORTIE** qui trahit la Constitution. **Chaque bug de philosophie devient une règle de conception** (*« un bug n'est pas un échec, c'est une règle qui manquait »*, Michel). Distinction fondatrice **raisonnement vs comportement** + les cas PB-001→004. **À compléter à chaque dérive repérée** (souvent via un « piège » de testeur/Michel). Une règle mûre peut monter en Constitution.
- 🧪 **`RETOURS-TESTEURS.md`** — **mémoire centralisée des retours des vrais testeurs** (Tatiana, Christophe, Emma, Eline…) : leur profil, ce qui leur plaît, ce qui manque, leurs bugs/idées, et ce que chaque retour a produit. **À compléter à chaque retour marquant** (réflexe, pas sur demande).
- 🤝 **`README-IA.md`** — **le mode d'emploi du dépôt pour TOUTE IA** (Claude, ChatGPT…). Modèle « équipe IA » (Michel décide · Claude archi/dev · ChatGPT vision/UX) adopté le 19/07/2026 : **le dépôt = source de vérité commune**, pas de dialogue direct IA↔IA, une **mémoire de projet partagée**. Explique l'ordre de lecture, où trouver quoi, et comment une IA externe (ChatGPT) lit le dépôt (liens GitHub raw / Custom GPT) — pour arrêter le copier-coller de contexte.
- **Organisation de la doc** : `CLAUDE.md` = **page d'accueil** (vision + les 12 règles d'or EN ENTIER + version/branche/brique + liens). Le **détail** vit dans les docs spécialisés (`/docs/`, `DOSSIER-ATHLETE-SUIVI.md`, `IDEES-FUTURES.md`…). ⚠️ Les **règles d'or restent dans CLAUDE.md** (seul fichier auto-chargé chaque session — les `/docs/` sont lus à la demande).

---

# Force Tracker — Contexte projet pour Claude

## Présentation

> 🌟 **L'esprit du produit (le cap) :** *« Force Tracker n'est pas une intelligence artificielle. C'est une mémoire sportive intelligente. »* — *« Il ne te dit pas qui tu dois devenir, il se souvient de qui tu es devenu. »* Détail : `docs/VISION-FORCE-TRACKER.md`.

PWA de suivi de musculation (Progressive Web App), conçue pour mobile (max-width 430 px). Single-page app HTML/CSS/JS pur, sans framework ni build step. Déployée sur GitHub Pages.

- **Repo GitHub** : https://github.com/michdu75-commits/forcetracker
- **App live** : https://michdu75-commits.github.io/forcetracker/
- **Auteur** : Michel — michdu75@gmail.com
- **🎂 Date de naissance** : **17 juin 2026** (première maquette Claude Design). Le suivi Git n'a démarré qu'au 30 juin 2026 — la période « Claude Design / Claude.ai » d'avant n'est pas dans le dépôt. Conçu de bout en bout avec Claude (Design → réflexion → code).

## Backend Apps Script (v3.5 @62 — actif)

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

**Windows (cmd)** : la variable SSL se met en 2 temps (pas `VAR=0 cmd` comme sur Mac/Linux) :
```
set NODE_TLS_REJECT_UNAUTHORIZED=0
npx clasp push --force
npx clasp deploy -i AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA
```

### ⚠️⚠️ Piège `.claspignore` — ne JAMAIS pousser le frontend dans Apps Script (bug 2026-07-07)
`clasp push` envoie **tous** les fichiers `.js`/`.json`/`.html` du repo NON listés dans `.claspignore`. Le backend Apps Script ne doit contenir **QUE `Code.js` + `appsscript.json`**. Les fichiers frontend (`app.js`, `clone/**`, `lib/**`…) utilisent `window`/`document` → s'ils sont poussés, Apps Script refuse de charger le projet → **tout le backend tombe** (`ReferenceError: window is not defined`, `?test=1` cassé, Milo/sync HS pour tous).
- **Cause 2026-07-07** : le dossier `clone/` (créé après le `.claspignore` d'origine) et `lib/` (jsPDF) n'étaient pas ignorés → poussés → backend KO en @66/@67.
- **Fix** : `clone/**` et `lib/**` ajoutés au `.claspignore`. **Toujours vérifier que `clasp push` n'affiche QUE `appsscript.json` + `Code.js`.** Si d'autres fichiers apparaissent → les ajouter à `.claspignore`.
- **Piège dans le piège** : après avoir ignoré des fichiers, `clasp push` peut dire « Script is already up to date » et **ne PAS retirer** les fichiers déjà sur le serveur. Il faut un vrai diff dans `Code.js` (ex. un commentaire) pour forcer le re-push complet qui nettoie le projet.
- **🔴 Rechute 2026-07-21 (worker.js)** : le **déploiement backend auto échouait DEPUIS MI-JUILLET** sans qu'on le voie (`clasp push` → `Syntax error: Unexpected token 'export' file: worker.gs`). Cause : **`worker.js`** (le Cloudflare Worker, syntaxe ES module `export`) + `food-health.js` + `translations.js` (frontend, `window`) n'étaient PAS dans `.claspignore` → poussés dans Apps Script → push cassé → **les changements backend accumulés ne partaient plus** (persistance cloud de l'**ADN sportif** @ft-v464 et du **dayStateLog** @ft-v549 restées non déployées jusqu'au fix). **Fix** : `worker.js` + `food-health.js` + `translations.js` ajoutés à `.claspignore` → run **@36 vert** (push + deploy + `?test=1` online) → tout le backend accumulé déployé. **Leçon** : à chaque **nouveau fichier `.js` à la racine** (worker, module frontend…), l'ajouter à `.claspignore` IMMÉDIATEMENT (la liste est explicite, pas de wildcard `*.js` — sinon `Code.js` serait ignoré). Et **surveiller l'onglet Actions** : un déploiement backend rouge = silencieux, personne n'est prévenu.

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
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache versionné `ft-vNN`, bumpé à chaque release (**actuel : `ft-v590`** — voir le journal des versions) |
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

## 🗺️ Carte de la connaissance (où vit quoi)

> Force Tracker n'accumule plus des *fonctionnalités* mais des *connaissances, principes, cas réels,
> décisions de conception*. Cet index dit **où trouver quoi** par DOMAINE. Le détail historique
> (catalogue des features + journal ft-v128→574) vit dans **`docs/JOURNAL-ARCHIVE.md`**.

| Domaine | Où | Quoi |
|---|---|---|
| **Fondamentales** | `CONSTITUTION-MILO.md` (v2.1) · `docs/VISION-FORCE-TRACKER.md` · `docs/PERSONAS-FONDATEURS.md` · `docs/MODELE-METIER.md` | Les principes stables, l'esprit/le pourquoi, les dimensions du projet, le langage métier commun. |
| **Conversation (Milo)** | `docs/MOTEUR-RAISONNEMENT-MILO.md` · `docs/PRESENCE-MILO.md` · `coach.js` (`buildCoachContext`, `_gardienRules`) | Le cerveau (Compréhension→Diagnostic→décision→Explication), la présence, le contexte injecté, le Gardien de sécurité (entrée). |
| **Mémoire** | `docs/DOSSIER-ATHLETE-SUIVI.md` · `S.registre`/`S.adn`/`S.coachMemory` · `docs/VISION` (mémoire 3 niveaux) | Registre, ADN sportif, observations validées, mémoire durable, faits mesurés. Modèle : essentielle (gratuite) → intelligente (premium) → vivante (briques 7-8). |
| **UX / produit** | `docs/PROCESSUS-DEVELOPPEMENT.md` · règles d'or #9-11 · `IDEES-FUTURES.md` · `A-FAIRE-SUR-PC.md` | Le cycle d'une brique, la checklist #11 (informer l'utilisateur), le FAB, les idées à venir, le backlog PC. |
| **Éthique / sécurité** | `CONSTITUTION-MILO.md` (P2/P13/P17/P22/P23) · `docs/BUGS-DE-PHILOSOPHIE.md` · `docs/GALERES-ET-LECONS.md` | Adapter pas interdire, accompagnement jamais thérapie, respect de la liberté, le récit ; les dérives de comportement corrigées ; les galères techniques. |
| **Détail features + journal** | `docs/JOURNAL-ARCHIVE.md` | Le catalogue complet des fonctionnalités (ft-v128→441) + le journal des versions ft-v128→574 + la gouvernance antérieure. |

**🛡️ Gardien de la Constitution (sortie, en construction)** — symétrique au Gardien de sécurité (entrée) :
une couche de **conformité AVANT l'affichage** qui vérifie que la réponse de Milo respecte les principes
(hypothèse présentée comme hypothèse, pas d'invention de fait/source, rôle tenu, rythme). **Étage 1** =
déterministe local (généralise `_stripCoachTech` : blocs qui fuient, interrogatoire, jargon médical) ;
**Étage 2** = validation IA (option future, coûteuse). Cadre : `docs/MOTEUR-RAISONNEMENT-MILO.md`.

---

## 🔑 Références vivantes (extraits gardés au chaud)

> Blocs consultés en permanence — gardés ici pour éviter d'ouvrir l'archive. Version complète : `docs/JOURNAL-ARCHIVE.md`.

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


### Protection de compte — code d'accès perso (le « mot de passe »)
- **Il EXISTE un vrai code perso par utilisateur** (≠ code admin, ≠ code premium). C'est le « mot de passe » qui protège la sauvegarde cloud.
- **Frontend** : `_authCode()`/`_setAuthCode()` (state.js) = clé localStorage `ft4_authcode`. Envoyé à CHAQUE `_cloudSync` (`authCode:_authCode()` dans le payload saveProfile). UI : overlay « protéger mon compte » (`#ec-code`, app.js `_protectPost({action:'setAccessCode',...})` pour poser/changer/retirer) ; restauration = champ `#restore-code-inp` (`_restoreSubmitCode`, setup.js).
- **Backend** (Code.js) :
  - `handleSetAccessCode_` (@ ~871) : pour poser un code il faut d'abord **vérifier l'email** (code 6 chiffres reçu par mail, `pending_confirms`). Code perso **min 4 caractères**. Stocké **haché+salé** `salt$SHA256(salt|code)` dans la Script Property `auth_{email}` — **jamais en clair** (même l'admin ne voit pas le code). `remove:true` retire la protection. Pose aussi `profile.emailVerified=true`.
  - `_authCheck_(email, code)` (@ ~52) : **INVARIANT ABSOLU** — un compte SANS `auth_{email}` se comporte exactement comme avant (aucune protection, rétrocompatible). Avec code → vérifie le hash. Appelé dans **saveProfile** (protège l'écriture) ET **loadProfile** (protège la restauration) → sans le code, impossible de lire/écrire un compte protégé.
  - `handleAuthStatus_` (@ ~903) : l'app demande juste si un compte est protégé → renvoie `{hasCode:bool, emailVerified:bool}`, **aucun secret divulgué**.
- **Limites honnêtes** : le code est optionnel (invariant ci-dessus) ; 4 chiffres = anti-curieux, pas anti-pirate déterminé. Solide (salt+SHA256, vérif email) mais court.
- ⚠️ **Ce code est la brique clé pour un futur « photos cryptées sur le Drive »** (chiffrement côté téléphone avec une clé dérivée du code perso → même l'admin ne voit que du charabia). Voir IDEES-FUTURES.md.


### 🧪 Clone de test (`/clone/`) — bac à sable restylage (✅ 2026-07-04)
- **But** : copie fonctionnelle et LIVE de l'app pour faire le restylage complet **sans toucher la prod**. Stratégie « copie test en off » du fichier idées. URL : `https://michdu75-commits.github.io/forcetracker/clone/`.
- **⚠️ Impossible en repo séparé** (l'accès GitHub de Claude Code web est limité à `michdu75-commits/forcetracker`) → le clone vit dans un **sous-dossier `/clone/` du même repo**. La prod (racine) n'est jamais modifiée.
- **Contenu de `/clone/`** : copies de code uniquement (index.html, style.css, les 8 JS, manifest.json, sw.js). **Aucun asset dupliqué** — les images/polices lourdes (anatomy 22M, muscles 17M, exercises 6.7M…) sont référencées via `../` vers le parent (réécriture `sed` des chemins `anatomy/`→`../anatomy/`, etc.).
- **Isolation stockage** : un shim en tête de `clone/index.html` **redéfinit `window.localStorage`** pour préfixer toutes les clés en `cl_` → le clone a SES données, ne lit/écrit JAMAIS les `ft4_*` de l'app réelle. Vérifié en test (le clone voit `null` pour `ft4_name` de la prod, la prod reste intacte). *(Fallback si un navigateur refuse la redéfinition : partage — donc sur iPhone, considérer que le clone PEUT partager les données ; l'utiliser surtout pour le rendu.)*
- **Service Worker du clone** (`clone/sw.js`) : réseau natif pur (scope `/clone/`), **ne touche jamais** le Cache Storage de la prod (partagé par origine — ne PAS y faire `caches.delete`). Garantit toujours la dernière version pour tester. Un reload one-shot au 1er chargement (controllerchange) est normal.
- **Badge `🧪 CLONE`** injecté en haut pour ne jamais confondre avec l'app réelle.
- **⚠️ Réécriture `sed` — piège** : `machine/` a été remplacé à tort dans un **regex** `.../epaules machine/i` de `log.js` (le `/` était le délimiteur de regex, pas un chemin). Corrigé. **Règle** : si on régénère le clone, ne préfixer que les tokens précédés d'une quote/paren, jamais dans un regex.
- **Workflow** : restyler dans `/clone/`, Michel valide sur l'URL clone, puis on **promeut** vers la racine (copier les fichiers validés de `clone/` → racine + bump `sw.js`).


---

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


## 🗓️ Journal des versions — récent (ft-v575 → ft-v590 + gouvernance récente)

> **Version actuelle : `ft-v593`** (prochaine : `ft-v594`). Historique complet (ft-v128→574 + gouvernance
> antérieure) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> ~30 entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien supprimer).

**ft-v593 — 🌟 MOMENT 1 « Milo me comprend » : fix comportemental de la découverte (le cas « mal au ventre » enfin traité) + gravure des DEUX moments Milo** — Aboutissement de la longue réflexion (Michel + Claude + GPT + Gemini + Mistral) : la découverte de Milo n'est pas un nombre de messages, c'est un **MOMENT**. Et il y en a **deux** : ① *premier contact = « Milo me comprend »* (compréhension, pas mémoire — un nouvel utilisateur n'a pas de passé) ; ② *premier retour = « Milo se souvient de moi »* (la mémoire paie). **Conséquence** : le but de la découverte n'est pas de convertir en session 1, c'est de **faire REVENIR** (sans 2ᵉ session la mémoire ne prouve rien). **Gravé (doc)** : `docs/PRESENCE-MILO.md` (section « les deux moments Milo » + garde-fou *pas de gros onboarding* : Milo apprend au fil des échanges, sinon on *simule* « il me connaît » = le faux). **Livré (code) — Moment 1** : ① **root-cause fix (PROD + clone, cohérence avec P19/P17 déjà gravés)** — la consigne « signal d'état → pose une question douce AVANT de conseiller » (qui produisait l'interrogatoire + le triage médical du cas « mal au ventre ») est retournée : Milo **RECONNAÎT + AIDE d'abord** (adapter/alléger la séance), **PUIS au plus UNE question douce** ; ⛔ pour une **douleur** (ventre/tête…) il ne **joue jamais au docteur** — n'exige jamais qu'on **DÉCRIVE/QUALIFIE** la douleur (crampe/aigu/depuis quand = triage médical, pas son rôle), reste sur l'entraînement, oriente vers un pro si fort/persistant. ② **bloc « CRÉER LE PREMIER MOMENT MILO » (clone d'abord, à valider)** : au 1ᵉʳ contact (zéro mémoire), le déclic vient de la **COMPRÉHENSION + valeur immédiate**, jamais d'un questionnaire ; but = donner envie de **revenir** (le 2ᵉ moment se construit au fil des échanges, sans le simuler). Fichiers : `coach.js` (buildCoachContext : ligne d'état réécrite + bloc moment-Milo gaté `__FT_CLONE__`), `docs/PRESENCE-MILO.md`, `sw.js`, `clone/*`. Testé Playwright (PROD : fix docteur + aide-d'abord présents, bloc moment-Milo absent ; CLONE : tout présent ; 0 erreur JS). ⚠️ Comportement dépend du prompt → **à re-tester sur le clone (cas « mal au ventre »)** puis **promotion** du bloc moment-Milo en prod + checklist #11. Le fix docteur/aide-d'abord est déjà en PROD (refinement de sécurité, pas de pop-up, comme ft-v589). **Prochain pas = Moment 2** (« Milo se souvient de moi » : surfacer la mémoire au retour). sw.js ft-v593. |
**GOUVERNANCE — « L'ENGAGEMENT RESPONSABLE » gravé : Constitution v2.2, Principe 24 (23/07/2026, doc-only, croisement Michel + GPT + Gemini + Mistral)** — Partie du sujet « mur premium / mal au ventre », la réflexion s'est élevée en **principe de conception** après le croisement des 4 IA. **Le virage de Michel** : le vrai sujet du modèle éco n'est pas « **comment compter** » (messages/questions/sessions) mais « **quand Milo a-t-il le droit de s'engager** » — une question de **confiance**, pas de facturation. La peur à tuer chez l'utilisateur = *« est-ce que Milo va me lâcher au milieu ? »*. **Gravé (doc-only, 0 code)** : `CONSTITUTION-MILO.md` **Principe 24 (L'engagement responsable)** — *« Milo ne s'engage jamais dans une conversation qu'il estime ne pas pouvoir mener jusqu'à un point d'arrêt utile — et il réévalue à CHAQUE tour, jamais seulement au départ. »* Points clés : chaque tour laisse un **point d'arrêt utile** (prolonge P19 + « le gratuit doit donner une victoire ») ; **transparence CIBLÉE** (seulement si budget tendu, jamais un premium) et **jamais vendeur** (P23) ; **réévaluation continue = GRATUITE** (elle tient dans l'appel déjà fait) alors qu'un estimateur au 1ᵉʳ message = 2ᵉ appel = double coût → écarté (idée Michel qui bat la proposition « estimateur » de Mistral) ; **le message reste l'unité**. **Discipline gravée en parallèle** : `docs/PROCESSUS-DEVELOPPEMENT.md` = **les 3 critères d'évaluation** de toute proposition (UX réelle ? · soutenable à l'échelle ? · version 80/20 plus simple ?) + corollaire **« séparer le PRINCIPE de l'IMPLÉMENTATION »** (ne pas figer une archi sur une intuition). ⚠️ **Implémentation délibérément LAISSÉE OUVERTE** (décision Michel) → piste minimale notée dans `IDEES-FUTURES.md` (donner à Milo la conscience de son budget + consigne de transparence ciblée, clone d'abord, à passer par les 3 critères) — **rien codé**. Fichiers : `CONSTITUTION-MILO.md` (P24, v2.2), `docs/PROCESSUS-DEVELOPPEMENT.md` (3 critères), `IDEES-FUTURES.md` (implémentation différée), `CLAUDE.md`. Doc-only, aucun impact appli, pas de bump sw.js. |
**ft-v592 — 🧪 Clone = labo : plus de mur premium pendant les tests (retour Michel « le clone n'a que 10 questions »)** — Sur le clone (stockage isolé `cl_`), l'utilisateur est traité en compte gratuit → il tombait sur le mur premium au bout de **10 questions**, impossible de discuter assez longtemps avec Milo pour provoquer/observer une dérive (interrogatoire, question guidée…). Fix **clone-only** : `COACH_FREE_LIMIT` = `9999` si `window.__FT_CLONE__` (posé ligne 29 de `clone/index.html`, bien avant le chargement de `coach.js`), sinon **10 en prod (inchangé)** ; le badge quota affiche « ∞ questions (clone test) » au lieu d'un grand nombre. Une seule ligne (le `const`) → tous les points de contrôle (les 2 murs + le compteur + l'affichage) suivent automatiquement. Fichiers : `coach.js`, `sw.js`, `clone/*`. Testé Playwright (PROD `COACH_FREE_LIMIT=10` clone=false · CLONE `9999` clone=true · 0 erreur JS). sw.js ft-v592. |
**ft-v591 — 🛡️ LE GARDIEN DE LA CONSTITUTION, Étage 1 (contrôleur de conformité en SORTIE — idée GPT « Force Tracker devient un système », clone d'abord)** — Symétrique au **Gardien de sécurité** (qui agit à l'ENTRÉE en lisant santé/blessures) : une couche de **conformité AVANT l'affichage** qui vérifie que la RÉPONSE de Milo respecte les principes. Née du constat (GPT + `docs/BUGS-DE-PHILOSOPHIE.md`) : la plupart des vraies dérives ne sont pas du **raisonnement** mais du **comportement en sortie** (hypothèse présentée comme un fait, mémoire créée d'une déduction, interrogatoire, sortie de rôle). **Livré (déterministe, 0 IA, 0 coût)** : `_gardienSortie(text)` (coach.js) enveloppe `_stripCoachTech` et renvoie `{text, flags}` avec 3 détecteurs **par motif** — `bloc_technique` (un bloc JSON/code a fuité puis été retiré), `interrogatoire` (≥2 lignes numérotées/à puces contenant une question → viole P19 « répondre d'abord »), `diagnostic` (formulation affirmative de diagnostic médical, regex conservatrice anti-faux-positifs → viole P17). **Seule réparation SÛRE = retirer les blocs qui fuient** (déjà le cas) ; interrogatoire/diagnostic sont **SIGNALÉS** (on ne charcute pas la phrase) → **badge dev `🛡️ Gardien` sous la bulle + `console.warn`, UNIQUEMENT sur le clone** (`__FT_CLONE__`) pour rendre les dérives **visibles et mesurables**. **PROD inchangée** : `renderCoachMsg` garde `_stripCoachTech` verbatim hors clone. ⚠️ **Honnêteté (humilité du concepteur, Vision)** : l'Étage 1 n'attrape QUE le détectable par motif ; le **sémantique** (inventer un détail, hypothèse-comme-fait) reste au prompt → **Étage 2 = validation IA, option future coûteuse** (un 2ᵉ appel), à activer seulement si le prompt continue d'échouer. Gouvernance : `docs/MOTEUR-RAISONNEMENT-MILO.md` (Étage 1 marqué ✅ construit) + `docs/BUGS-DE-PHILOSOPHIE.md`. Fichiers : `coach.js` (`_gardienSortie` + routage clone dans `renderCoachMsg` + badge), `style.css` (`.gardien-flag`), `sw.js`, `clone/*`. Testé (9 cas unitaires node : normal/bloc/interro/diag/cumul/faux-positif « arthrose » ; Playwright prod=pas de badge + JSON retiré, clone=badge « bloc technique retiré · 3 questions en liste » + JSON retiré ; 0 erreur JS). **Prochain pas** : mesurer les vraies dérives sur le clone → décider quoi auto-réparer vs promouvoir. sw.js ft-v591. |

**ft-v575 — 🧭 PRINCIPE DE CONCEPTION gravé : « La pertinence avant la disponibilité » (+ « la cohérence avant la réactivité ») — né du sujet IMC, croisement Michel + GPT + Gemini + Mistral + Claude (22/07/2026)** — Parti d'une question de Michel (« on tient compte de l'IMC pour un sportif ou non ? »), le sujet s'est élevé en **principe de conception général** après 3 PDF croisés avec GPT/Gemini/Mistral + mon rendu d'architecte (méthode convergence/divergence). **La bascule** : la bonne question n'est pas « quelles données Milo a ? » mais « **lesquelles sont PERTINENTES pour CETTE personne, ICI ?** » — le contexte prime sur la donnée ; une donnée n'est utilisée que si elle **améliore la décision** (pas parce qu'elle existe). **Livré (prompt + 2 seuils, 0 backend) — DEUX ÉTAGES** : ① **Milo RAISONNE** (`buildCoachContext`, coach.js) — bloc **« CHOISIR LES BONNES DONNÉES — LA PERTINENCE AVANT LA DISPONIBILITÉ »** (pertinence contextuelle/variable ; ex. IMC secondaire chez un sportif sec → masse grasse/tour de taille/WHtR ≥ 0,5/tendance ; utile chez un sédentaire ; **repères = guides, pas table de coefficients** ; **pertinence ≠ minimalisme** = croiser plusieurs données OK ; **transparence CIBLÉE** = expliquer quand ça compte, jamais à chaque message) + bloc **« LA COHÉRENCE AVANT LA RÉACTIVITÉ »** (raisonner sur les TENDANCES, pas le bruit : 84,8→84,5 kg = bruit ; 6 sem de stagnation = signal). ② **Le GARDIEN PROTÈGE** (`_gardienRules`, coach.js) — **SEUILS ABSOLUS** de sécurité qui s'allument **TOUJOURS**, indépendamment de la pertinence (IMC ≥ 40 · tour de taille > 120 cm), **vigilance jamais diagnostic** ; le Gardien s'active désormais **même sans blessure** (early-return élargi à `!vigil.length`, préambule zones affiché seulement s'il y a des zones). **Gouvernance** : `CONSTITUTION-MILO.md` **Principes 19 & 20 (v1.9)** + phrase-signature « Milo ne cherche pas le meilleur indicateur ; il cherche le plus pertinent pour la situation » + `docs/MOTEUR-RAISONNEMENT-MILO.md`. **⏳ Couche future** (honnêteté) : veille longitudinale des signaux faibles sur des semaines (dérive sommeil/FC repos) + données **montre connectée** (FC, pas) = non collectées aujourd'hui → brique « mémoire vivante ». **Rétrocompatible** (Gardien silencieux si rien ; contexte identique si IMC/taille normaux). Fichiers : `coach.js` (2 blocs prompt + `vigil` Gardien), `CONSTITUTION-MILO.md` (v1.9), `docs/MOTEUR-RAISONNEMENT-MILO.md`, `sw.js`, `clone/*`. Testé Playwright (4 blocs présents ; Gardien silencieux si tout normal ; vigil IMC ≥ 40 **et** tour de taille > 120 se déclenchent sans blessure ; re-silencieux si normal ; 0 erreur JS). sw.js ft-v575. |
**ft-v576 — 🧭 Nuance UX (Michel) : « RÉPONDRE D'ABORD, PROPOSER ENSUITE » — l'absence d'une donnée = une OPPORTUNITÉ, jamais une erreur ni un blocage** — Suite du principe de pertinence (ft-v575), Michel ajoute une nuance qui améliore l'expérience : quand Milo a **déjà** de quoi répondre, il ne doit **pas couper** la conversation pour réclamer une donnée manquante. **Livré (prompt-only, 0 backend)** : `buildCoachContext` (coach.js) — bloc **« RÉPONDRE D'ABORD, PROPOSER ENSUITE »** = ① Milo répond **d'abord** avec ce qu'il a (profil incomplet = jamais une faute ni un blocage) · ② **puis, à la fin seulement**, il peut proposer **UNE** piste d'amélioration, **uniquement si** cette donnée apporterait une vraie valeur (pertinence), formulée comme une **opportunité jamais un reproche** (« je peux déjà te conseiller ; si tu renseignes ta nutrition, je pourrai affiner » / « si tu ajoutes tes mensurations, je suivrai mieux ton évolution ») · ③ **une seule** suggestion à la fois (si ça ne change pas la réponse, n'en parle même pas) · ④ **FIABILITÉ** : n'exploite le suivi nutritionnel / journal / tracker **que s'il est fiable** (un suivi sporadique ne pilote pas les conclusions — rejoint « méfiance des données incomplètes » ft-v403). **Gouvernance** : corollaire ajouté au **Principe 19** de `CONSTITUTION-MILO.md` (la pertinence appliquée à ce que Milo *demande*, pas seulement à ce qu'il *utilise*). **Rétrocompatible**. Fichiers : `coach.js` (bloc), `CONSTITUTION-MILO.md` (corollaire P19), `sw.js`, `clone/*`. Testé Playwright (bloc + « OPPORTUNITÉ » + « FIABILITÉ » présents ; P19/P20 intacts ; 0 erreur JS). sw.js ft-v576. |
**ft-v577 — 🍽️ ESPRIT NUTRITION gravé (croisement Gemini + Mistral + Claude + synthèse Michel) — on cadre la philosophie AVANT de coder une brique** — Même méthode que l'IMC : PDF de cadrage → croisé avec les 3 IA → synthèse de Michel (3 nuances + phrase-boussole) → grave. **Aucune feature codée** (la 1ʳᵉ brique = étape suivante). **Livré (prompt + docs, 0 backend)** : ① **Cerveau de Milo** (`buildCoachContext`, coach.js) — bloc **« NUTRITION — UN LEVIER AU SERVICE DE L'OBJECTIF, JAMAIS UNE SOURCE DE STRESS »** : levier pas finalité (adapté à l'objectif réel) · **accès au coaching JAMAIS conditionné** (la nutrition affine, ne déverrouille pas — jamais « il faut remplir ta nutrition ») · **la précision est un CHOIX** (qualitatif → portions → macros → suivi précis, jamais de micro-comptage imposé) · **anti-faux-précis** (±20-50 % → tendances + fourchettes « ~1900 kcal ± 200 ») · ton **éducatif non culpabilisant** (« carburant/cycle/tendance », jamais « bon/mauvais/écart/triche »), interventions sur les tendances pas par repas, vraie vie (travail de nuit) · **garde-fous santé** (< ~1500 kcal/j H · < ~1200 F · perte > ~1 %/sem · prot > 3 ou < 0,8 g/kg · < 2 repas/j · rapport anxieux à la nourriture → oriente vers un pro, aucun diagnostic) · **règle d'or P21** (jamais un stress > bénéfice → alléger/masquer si ça nuit au sommeil/à la régularité). ② **Gouvernance** : `CONSTITUTION-MILO.md` **Principe 21 « Une donnée ne doit jamais coûter plus qu'elle n'apporte » (v2.0)** — forme large de la phrase de Michel (*« la nutrition est un moyen d'améliorer la santé/récup/perf ; elle ne doit jamais devenir une source de stress supérieure au bénéfice qu'elle apporte »*) + nouveau doc **`docs/NUTRITION-PHILOSOPHIE.md`** (les 10 principes · **la précision au CHOIX = 4 niveaux** · **le Gardien nutrition** = tableau de seuils d'alerte · **la 1ʳᵉ brique** = journal léger « à la portion » sur Open Food Facts + Nutri-Score/NOVA gratuits + fallback fait-maison · la **couche future** chronobiologie/flexibilité métabolique/FC repos = montre connectée · sources croisées). Lié dans `CLAUDE.md` (docs de gouvernance). **Apports croisés** : Gemini = modèle « portions » + anti-charge-mentale ; Mistral = qualité Nutri-Score/NOVA + seuils santé chiffrés + fallback fait-maison + anti-pseudo-précision ; Michel = **les 4 niveaux** (ne pas opposer qualitatif/quantitatif) + la phrase-boussole. **Rétrocompatible**. Fichiers : `coach.js` (bloc), `CONSTITUTION-MILO.md` (P21 v2.0), `docs/NUTRITION-PHILOSOPHIE.md` (nouveau), `CLAUDE.md`, `sw.js`, `clone/*`. Testé Playwright (bloc + « précision est un CHOIX » + garde-fous + règle d'or présents ; P19/P20/répondre-d'abord intacts ; 0 erreur JS). ⏭️ **Prochaine étape (avec Michel)** : choisir/prioriser la 1ʳᵉ brique nutrition à coder (le journal « à la portion »). sw.js ft-v577. |
**ft-v578 — ⚡ Milo → SÉANCE en 1 clic (demande Michel : « lors de la discussion avec Milo je fixe mon programme du jour et il l'intègre dans la séance direct »)** — Dans le chat, quand l'utilisateur **dicte sa séance du jour** OU demande quoi faire maintenant et que Milo la propose, un bouton **« ⚡ Commencer cette séance »** apparaît sous la bulle de Milo → **injecte la séance direct dans l'écran Séance** (`S.wkt`), prête à logger. **Réutilise le mécanisme du programme force (ft-v225)** : Milo termine par un bloc caché ` ```json {"seance":{"label","exs":[{"name","sets":[{"reps","kg","type"}]}]}}``` ` (clé **`seance`** distincte du programme force `days`/`exs` → pas de collision ; **retiré de l'affichage** par `_stripCoachTech` — l'utilisateur ne voit que la séance en clair + le bouton). **Frontend** : `_extractDaySession`/`_appendStartSessionBtn`/`var _pendingMiloSessions` (coach.js) + `_normalizeMiloSession`/`_startSessionFromMilo` (log.js — construit `S.wkt.exs` avec **pré-remplissage par série** depuis la dernière séance via `getPrev`, comme `loadProgDay` ; **séance en cours → AJOUTE, jamais n'écrase** (règle d'or #3) ; sinon nouvelle séance `progLabel`=label de Milo) + instruction dans `buildCoachContext` (format exact + « n'émets ce bloc QUE pour une séance à faire MAINTENANT » + ne jamais parler du JSON). Types de série gérés (N/É/X/D), `maxi` supporté. **0 backend** (Milo émet le bloc via le prompt ; l'injection est 100 % locale). Fichiers : `coach.js`, `log.js`, `sw.js`, `clone/*`. Testé Playwright (extraction + JSON caché + normalisation + nouvelle séance + append à une séance active + instruction dans le contexte, 0 erreur JS). ⚠️ **Le déclenchement (Milo qui ÉMET le bloc) dépend du prompt → à valider sur iPhone** (le Worker IA est hors de portée de mon environnement). **⏳ Checklist #11 (pop-up « Quoi de neuf » + point rouge + guide) à faire une fois validé sur device** ; l'`?`/aide détaillée suivront à la promotion. sw.js ft-v578. |
**ft-v579 — ✅ « Milo → séance en 1 clic » VALIDÉ sur iPhone + checklist #11** — Test réel Michel (captures) : le bouton **« ⚡ Commencer cette séance (5 exercices) »** apparaît bien sous la réponse de Milo, et le tap **injecte la séance** correctement dans l'écran Séance — Développé Couché avec série 1 en **É** (échauffement) + série 4 en **X** (échec), **1RM calculés** (~69,7/~90/~95,3), **figurine** du bon exo, **poids pré-remplis**, colonne « Précédent » alignée. Bout en bout fonctionnel. **Checklist #11 faite** : WHATS_NEW **v37** ⚡ « Milo démarre ta séance » + `WHATS_NEW_MAX=37` (slots testeurs réservés décalés v38/39/40) + red dot `milo-start-session` (screen coach) + aide `?` Coach (⚡) + aide détaillée « Milo démarre ta séance » (coach.js). Fichiers : `constants.js`, `screens.js`, `coach.js`, `sw.js`, `clone/*`. Testé Playwright (v37 présente, 0 doublon de version, red dot, tip `?`, 0 erreur JS). ⏳ **Diapo du Guide de l'appli** = à faire quand Michel fournit une capture. sw.js ft-v579. |
**ft-v580 — 📖 Guide de l'appli : diapo « Milo démarre ta séance ⚡ »** (clôt le ⏳ de ft-v579 — Michel a fourni la capture iPhone). Capture réelle (la vue Coach avec le bouton « ⚡ Commencer cette séance (5 exercices) » sous la réponse de Milo) → `guide/milo-seance.jpg` (780px JPEG q82, comme les autres) + slide ajoutée à `APP_GUIDE_SLIDES` (app.js) **après la diapo Coach**, doigt animé sur le bouton (`tap:[.5,.45]`) + ajoutée au PRECACHE (`sw.js`). Guide passe de 13 à **14 diapos**. Fichiers : `app.js`, `guide/milo-seance.jpg`, `sw.js`, `clone/*`. Testé Playwright (slide trouvée, image chargée HTTP 200, tap correct, 0 erreur JS). → **checklist #11 de « Milo → séance en 1 clic » COMPLÈTE** (pop-up + red dot + `?` + aide détaillée + guide). sw.js ft-v580. |
**ft-v581 — ⚕️ TRT (traitement de testostérone PRESCRIT par un médecin) — option privée ADMIN-ONLY (demande Michel : « juste pour moi, j'ai l'avis de mon médecin ; pour les autres on verra »)** — ⚠️ **Uniquement le TRT MÉDICAL prescrit** (contexte légitime — hypogonadisme, beaucoup de pratiquants 40+ ; **rien à voir avec du dopage** : j'ai refusé une « spécialisation produits testostérone » qui coacherait des cures — risque juridique/santé + contraire à la Constitution). **Livré** : toggle **« ⚕️ Sous TRT (prescrit par un médecin) »** dans Profil → Santé, **visible SEULEMENT si `_isAdminUnlocked()`** (`_renderHealthSection`/`toggleTrt`, setup.js — double garde : rendu + handler) ; stocké dans **`S.healthProfile.trt`** → déjà privé + synchronisé cloud + restauré (**0 backend**). **Milo** (`buildCoachContext`, section PROFIL SANTÉ) : quand `hp.trt`, il **adapte l'entraînement/la récup/les attentes** + rappelle le **suivi médical & bilan sanguin**, mais **⛔ NE conseille JAMAIS sur le traitement lui-même** (dose/molécule/ajustement) — domaine EXCLUSIF du médecin, il y renvoie systématiquement ; n'encourage jamais un usage non prescrit ; reste sur son terrain (entraînement/récup/nutrition/sommeil). Même patron que les conditions santé existantes. Cohérent Constitution (jamais de diagnostic, oriente vers un pro). **Admin-only → pas de checklist #11** (non public). Fichiers : `coach.js`, `setup.js`, `sw.js`, `clone/*`. Testé Playwright (non-admin : toggle invisible + bloqué ; admin : toggle visible + activable ; contexte Milo = TRT + cadre de sécurité si activé, absent sinon ; 0 erreur JS). sw.js ft-v581. |
**ft-v582 — 🧠 Cerveau de Milo, 2ᵉ PIÈCE (Cerveau 1 = COMPRENDRE) — étape 2 : la MÉMOIRE DURABLE du profil conversationnel (demande Michel « La mémoire durable 2 »)** — Suite de ft-v573 (étape 1 = le comportement) : maintenant Milo **retient pour de bon** ce que la personne lui confie de DURABLE en discutant (« je m'entraîne le matin avant le travail », « je n'ai que des haltères chez moi », une préférence forte, une contrainte de vie, sa motivation) — **avec validation** (rien mémorisé sans accord, **Principe 3**). **Mécanique (prompt + infra Observations réutilisée, 0 backend)** : Milo termine son message par un **bloc CACHÉ** ` ```json {"retiens":["tu t'entraînes le matin…"]}``` ` (**retiré de l'affichage** par `_stripCoachTech` — clé `retiens` ajoutée à sa regex) → sous sa bulle, une ligne **« 🧠 Je retiens : \<trait\> ? [Oui, retiens][Non] »** par trait **NOUVEAU** → **Oui** = rangé en **mémoire durable** dans `S.registre.observations` (`status:'validated'`, `source:'conversation'`) → réutilise l'**injection contexte** (filtre `validated` → fait confirmé de `buildCoachContext`) **et** la page **« Ce que Milo sait de toi »** ; **Non** = `rejected` (jamais re-proposé). **Une seule mémoire** (le Registre, pas de silo). Fonctions coach.js : `var _pendingMiloMemory`, `_slugTrait` (clé de dédup normalisée), `_extractMemory(reply)` (parse le bloc `retiens`), `_appendMemoryBtns(traits)` (**filtre les clés déjà connues** via `registre.observations`), `_confirmMiloMemory(idx,ok,btn)` (push observation + `persist` + `_cloudSyncDebounced` + `_renderMiloKnows` + toast + remplace la ligne par la confirmation) ; câblé dans `sendToCoach` (à côté de la séance ft-v578, affichage déjà propre via `_stripCoachTech`). Bloc prompt **« RETENIR DURABLEMENT CE QUE TU APPRENDS »** (`buildCoachContext`) : ne retenir qu'une info **DURABLE et NOUVELLE** (pas un état du jour « je suis crevé aujourd'hui »), au plus 1-2 par message, phrase courte à la 2ᵉ personne, **jamais inventer**, **jamais parler du bloc**. `registre.observations` **déjà synchronisé cloud** → 0 backend. **Distinction (0 doublon)** : ADN = déclaré dans un formulaire · mémoire de conversation (`coachMemory`) = résumé qui roule · **Observations 5A = hypothèses proposées PAR Milo** · **ici = ce que la PERSONNE confie, retenu avec son accord** — toutes atterrissent au même endroit (mémoire durable validée). **Rétrocompatible** (pas de bloc → rien proposé, comportement identique). ⚠️ **L'ÉMISSION du bloc dépend du prompt** (comportement du modèle) → **à valider sur iPhone** (comme ft-v578 ; mon env bloque Cloudflare). **Invisible tant que Milo ne propose rien.** Doc : `docs/MOTEUR-RAISONNEMENT-MILO.md` (étape 2 de la 2ᵉ pièce marquée ✅). Fichiers : `coach.js`, `sw.js`, `clone/*`. Testé Playwright (7/7 : `_extractMemory` parse le bloc, `_stripCoachTech` le cache, `_confirmMiloMemory(…,true)` stocke une observation `validated`/`source:'conversation'`, injection dans le contexte Milo, refus → `rejected`, `_appendMemoryBtns` déduplique une clé déjà connue, pas de bloc → aucune proposition ; 0 erreur JS). ⏳ Checklist #11 (pop-up « Quoi de neuf »/aides) à faire à la validation iPhone. sw.js ft-v582. |
**ft-v583 — ✅ Checklist #11 pour la MÉMOIRE DURABLE (ft-v582 VALIDÉE sur iPhone/clone par Michel)** — Test réel Michel sur le clone ft-v582 (capture) : après une réponse de Milo (qui, sur une vieille tendinite d'épaule, cadre l'entraînement + demande si la gêne est actuelle ou un antécédent), la ligne **« 🧠 Je retiens : *tu as déjà eu une tendinite à l'épaule* ? [Oui, retiens] [Non] »** apparaît bien sous sa bulle → **le déclenchement fonctionne**, et sur un bon exemple (info durable + utile, pas un état du jour). **Checklist #11 faite** : WHATS_NEW **v38** 🧠 « Milo retient ce que tu lui confies » + `WHATS_NEW_MAX=38` (slots testeurs réservés décalés v39/40/41) + red dot `milo-remember` (screen coach) + aide `?` Coach (🧠) + aide détaillée « Milo retient ce que tu lui confies » (coach.js) — chaque texte **distingue** cette brique (ce que TOI tu confies à Milo) de la page d'Accueil ft-v465/v18 (où c'est LUI qui te pose des questions). Fichiers : `constants.js`, `screens.js`, `coach.js`, `sw.js`, `clone/*`. Testé Playwright (v38 présente, 0 doublon de version, red dot, tip `?`, 0 erreur JS). ⏳ **Diapo du Guide de l'appli** = à faire quand Michel fournit une capture prod propre (celle du test = clone). sw.js ft-v583. |
**ft-v585 — 🗣️ QUESTION GUIDÉE (réponses rapides à taper) — EN TEST SUR LE CLONE (demande Michel « on attaque la question guidée sur le clone »)** — Née de la longue réflexion du 22/07 (Michel : « personne ne va se taper un pavé à réécrire, il faut laisser un espace pour répondre direct sous la question ») + les 3 IA. Quand **Milo pose UNE question**, il peut proposer **2 à 4 réponses courtes tappables** sous sa bulle → un **tap = la réponse est envoyée** (`sendToCoach(texte)`) ; **le champ texte reste toujours dispo** (les chips sont une AIDE, pas une cage). Mécanique = même patron caché que ft-v578/582 : Milo termine par ` ```json {"reponses":["Récent","Il y a des mois","Il y a des années"]}``` ` (clé **`reponses`** ajoutée à `_stripCoachTech` → **jamais affichée**). **Frontend** (coach.js, inoffensif en prod car ne fait rien sans bloc) : `_extractQuickReplies` (parse), `_appendQuickReplies` (chips `.coach-qr`/`.coach-qr-chip`, tap → nettoie + envoie), câblés dans `sendToCoach` à côté de séance/mémoire + **nettoyage des chips périmés** au prochain envoi (pour ne pas qu'ils traînent si on tape à la main). **Prompt** (`buildCoachContext`) **GATÉ `window.__FT_CLONE__`** = ACTIF **seulement sur le clone**, PROD inchangée (Milo n'émet pas le bloc hors clone) : garde-fous gravés (**UNE question à la fois — JAMAIS une liste numérotée / interrogatoire · réponses OPTIONNELLES, on peut toujours écrire ou ne pas répondre · 1-4 mots · porte de sortie douce si perso « je préfère pas en parler » · jamais un sondage/pour meubler · ne parle jamais du bloc**). Incarne la « question guidée » conçue après la philosophie de Milo (P17/P22/P23) + l'anti-flicage de Gemini. ⚠️ **Émission = prompt → à valider sur iPhone/clone par Michel** (comme ft-v578/582). Fichiers : `coach.js`, `sw.js`, `clone/*`. Testé Playwright (PROD : instruction ABSENTE du contexte / CLONE : PRÉSENTE ; `_extractQuickReplies` parse, `_stripCoachTech` cache le bloc, chips rendus, tap envoie le texte + nettoie, 0 erreur JS). ⏳ **Si validé → promotion** = retirer le gate `__FT_CLONE__` (le frontend est déjà en prod) + checklist #11. sw.js ft-v585. |
**ft-v590 — 🗣️ Question guidée : anti-interrogatoire + le freemium n'est jamais bloqué en répondant à Milo (retour Michel)** — Test clone : Milo a posé **5-6 questions d'affilée** (accident→zone→sensation genou→temps→matériel) avant de rien proposer, et la **dernière était écrite** (pas de chips). Michel : « si le mec est freemium et qu'il n'a plus de questions gratuites il est **nike** » (il tape la question écrite → mur premium → bloqué, et il n'a JAMAIS eu son programme). ⚠️ Ironie : donner les boutons à Milo l'a rendu **plus** questionneur. **Bonne nouvelle du test** : les chips apparaissent, la zone est demandée (v588), et le compteur est resté à « 5 questions gratuites » sur tous les taps (**tap gratuit v586 OK**). **2 correctifs** : ① **ANTI-INTERROGATOIRE** (prompt, gated `__FT_CLONE__`) — Milo n'enchaîne JAMAIS les questions : il **apporte de la valeur d'abord** (1er programme avec **hypothèses raisonnables** « ~45 min, haltères+barre, dis-moi si différent et j'ajuste ») puis demande **au plus 1-2** infos décisives ; **jamais toute la valeur en otage** derrière un questionnaire — la personne repart avec de l'utile même sans répondre ; les réponses rapides ne sont **pas** une licence pour interroger. ② **QUOTA** (frontend, `sendToCoach`) — répondre à une question **posée par Milo** (pendant que des chips sont affichés) ne **bloque ni ne coûte** jamais à un freemium : le tap était déjà gratuit (v586), et une réponse **TAPÉE** pendant que des chips sont là devient gratuite aussi (`opts.noQuota` mis auto si `.coach-qr` présent, **avant** le mur premium). Effectivement clone-only (les chips n'existent qu'au clone) → prod inchangée. Fichiers : `coach.js`, `sw.js`, `clone/*`. Testé Playwright (CLONE : anti-interro présent + mur si pas de chips à sec / PAS de mur si chips à sec ; PROD : anti-interro absent = inchangée ; 0 erreur JS). ⏳ **À re-tester clone** : Milo doit proposer un 1er programme AVANT d'interroger, et le freemium ne doit plus être bloqué en répondant. sw.js ft-v590. |
**ft-v589 — 🚨 FIX MAJEUR anti-INVENTION (retour Michel, clone) : Milo inventait un détail + fabriquait une source** — Test : Michel dit seulement « j'ai eu un accident de moto » → Milo répond « je vois ça dans tes antécédents. C'était **il y a quelques années** d'après ce que je sais » + interrogatoire. Michel : « je n'ai JAMAIS confirmé que c'était il y a plusieurs années ». **Double faute** = ① **invention d'un détail** (la date) non donné ; ② **fabrication de source** (« je vois dans tes antécédents / d'après ce que je sais » pour une info dite À L'INSTANT). Viole frontalement les principes gravés la veille (P18 « ne jamais faire semblant de savoir », P22 « ne présume/n'invente jamais », P3). Racine : le garde-fou anti-invention existait (buildCoachContext) mais pas assez précis → Milo « complétait » un détail sur un fait vrai, et l'avait même stocké en mémoire (« accident de moto il y a quelques années »). **Fix — NON GATÉ (prod + clone)** car un Milo qui invente des faits = risque de confiance EN DIRECT pour tous, et le fix ne peut que protéger : ① ⛔ **N'AJOUTE JAMAIS un détail non donné** (date/gravité/cause), même à une info que la personne vient de dire (« accident de moto » → tu sais SEULEMENT ça) → demande ou omets ; ② ⛔ **ne FABRIQUE jamais de source** (« je vois dans tes antécédents », « d'après ce que je sais ») pour une info fraîche → accueille-la comme NOUVELLE ; ③ le **bloc `retiens`** (mémoire ft-v582) = EXACTEMENT ce que la personne a dit, **zéro détail ajouté** (« tu as eu un accident de moto », jamais « … il y a quelques années »). ⚠️ **Honnêteté** : le prompt RÉDUIT fortement l'invention mais ne la garantit pas à 100 % (pas de garde technique fiable pour « a-t-il ajouté un détail ») → à re-tester sur device ; si ça récidive, on escalade. Le mauvais souvenir déjà stocké se supprime dans « Ce que Milo sait de toi ». Fichiers : `coach.js`, `sw.js`, `clone/*`. Testé Playwright (les 2 règles présentes en prod ET clone, 0 erreur JS). sw.js ft-v589. |
**ft-v588 — 🩹 Question guidée/mémoire : une CONSÉQUENCE de blessure confiée à Milo atteint enfin le GARDIEN (piège de Michel)** — Test clone de Michel : « l'accident de moto a une conséquence… Milo retient l'accident nickel et après **plus rien** ». **Trou trouvé** (confirmé dans le code) : ce que Milo « retient » (ft-v582, `registre.observations`) est injecté dans son **chat** (il le SAIT en discutant) mais le **Gardien** (`_gardienRules`) ne lit **QUE** le Profil Santé (`healthProfile` injuries/notes/conditions) — **pas la mémoire**. Donc une blessure retenue **ne protégeait AUCUNE zone** en séance/programme (« la mémoire et la sécurité pas connectées »), et Milo retenait l'**événement** (« accident de moto il y a X ans ») pas la **conséquence** (la zone limitée). **Fix (gated `__FT_CLONE__`, prod inchangée)** : ① **prompt** (`buildCoachContext`, bloc RETENIR) — pour une **BLESSURE/ACCIDENT/SANTÉ**, Milo retient la **CONSÉQUENCE DURABLE (zone + limitation)** pas l'anecdote (« épaule fragile » pas « accident de moto »), **nomme la zone**, et **ENCHAÎNE** (protège/adapte tout de suite) au lieu de « c'est noté » ; ② **câblage `_confirmMiloMemory`** — si le trait retenu nomme une **zone du corps** (`_gardienZonesFromText`), on l'ajoute **AUSSI** à `S.healthProfile.notes` → le **Gardien protège la zone dans TOUTES les séances**, automatique au « Oui, retiens » (l'accord est déjà donné) ; toast dédié « Zone ajoutée à ta santé — Milo la protège 🛡️ ». ⚠️ **Domaine délicat** (rappel Michel) : ça n'alimente que le **Gardien** (qui ADAPTE/protège, **jamais ne diagnostique**) — Milo reste dans son couloir (blessure grave → oriente vers un pro). Non-santé (« je m'entraîne le matin ») ne va PAS dans la santé. Fichiers : `coach.js`, `sw.js`, `clone/*`. Testé Playwright (CLONE : zone→Profil Santé + Gardien protège l'épaule + non-santé hors santé ; PROD : gaté = rien ne fuit ; mémoire toujours stockée ; 0 erreur JS). ⏳ À valider clone → puis promotion (retirer le gate) + brancher aussi sur les Observations si besoin. sw.js ft-v588. |
**ft-v587 — 🗣️ Question guidée : le PROMPT choisit mieux les questions à boutons (retour Michel « il faut bien choisir les questions avec le tap »)** — Puisque le tap est gratuit (ft-v586), Milo ne doit pas coller des boutons partout (qualité UX + coût). Instruction affinée (`buildCoachContext`, gated `__FT_CLONE__`) : ✅ réponses rapides RÉSERVÉES aux questions **FACTUELLES/PRATIQUES** à petit nombre de réponses (quand · fréquence · où · matériel · temps dispo · choix clair force/volume · oui-non) ; ❌ **PAS** de boutons pour une question **OUVERTE, personnelle, émotionnelle ou un « pourquoi »** (« ça venait de quoi ? », « comment tu te sens ? ») → la personne écrit librement (au besoin juste une porte de sortie douce si intime). Sert la qualité (anti-flicage Gemini) ET le coût (pas de rounds gratuits à la pelle). Prompt-only, prod inchangée. Testé Playwright (instruction absente en prod / présente sur le clone, 0 erreur JS). sw.js ft-v587. |
**ft-v586 — 🗣️ Question guidée : répondre à Milo est GRATUIT (retour Michel : « la question proposée ne rentre pas dans les questions gratuites ? »)** — Bien vu : tel que codé en ft-v585, un tap sur une réponse rapide appelait `sendToCoach(t)` sans `noQuota` → il **consommait une question gratuite** (et pouvait déclencher le mur premium). Or répondre à une question **posée par Milo** ≠ TOI qui interroges → ça ne doit rien coûter (cohérent avec « les questions de Milo ne coûtent pas à l'utilisateur » + un vrai coach ne facture pas ses propres questions). **Fix** (`_appendQuickReplies`, coach.js) : le tap appelle `sendToCoach(t, null, {noQuota:true})` → **pas d'incrément de `coachFree`, pas de mur premium** (via le `!opts.noQuota` déjà en place aux lignes wall + incrément). **Périmètre** : seul le **TAP** est gratuit ; une réponse **TAPÉE à la main** reste un message normal (comptée) — choix délibéré pour éviter l'abus « n'importe quel message tapé après une question de Milo serait gratuit » (on ne peut pas distinguer un vrai off-list d'une nouvelle question). Toujours EN TEST SUR LE CLONE. Fichiers : `coach.js`, `sw.js`, `clone/*`. Testé Playwright (tap → `sendToCoach` reçoit `{noQuota:true}` + le texte du chip, 0 erreur JS). sw.js ft-v586. |
**ft-v584 — 📖 Guide de l'appli : diapo « Milo retient ce que tu lui confies 🧠 »** (clôt le ⏳ de la checklist #11 de ft-v583 — Michel a fourni une capture PROD propre, jeudi 23/07). Capture réelle (vue Coach avec « 🧠 Je retiens : tu t'entraînes surtout l'après-midi ? [Oui, retiens][Non] » sous la réponse de Milo, badge Premium, **sans badge clone**) → `guide/milo-memoire.jpg` (780px JPEG q82, ~144 Ko) + slide ajoutée à `APP_GUIDE_SLIDES` (app.js) **après « Milo démarre ta séance »**, doigt sur le bouton « Oui, retiens » (`tap:[.26,.63]`) + ajoutée au PRECACHE (`sw.js`). Guide passe de 14 à **15 diapos**. → **checklist #11 de la mémoire durable COMPLÈTE à 100 %** (pop-up v38 + red dot + `?` + aide détaillée + guide). Fichiers : `app.js`, `guide/milo-memoire.jpg`, `sw.js`, `clone/*`. Testé Playwright (slide présente, ordre après séance, image chargée 780×1691 HTTP, 15 diapos, 0 erreur JS). sw.js ft-v584. |
**GOUVERNANCE — « Force Tracker devient un SYSTÈME » : humilité du concepteur + Journal des bugs de philosophie + Gardien de la Constitution (23/07/2026, doc-only)** — Réflexion fondatrice de Michel : *« on n'atteint pas une limite d'intelligence, mais d'organisation »* — on accumule des connaissances/principes/exceptions/cas réels, pas des features → le prochain progrès vient de la **gouvernance du système**, pas de l'accumulation. Preuve chiffrée : `CLAUDE.md` = ~440 Ko / 1450 lignes / ~420 entrées (= la limite d'organisation, tangible). **3 gravures doc-only** : ① **Principe fondateur « L'humilité du concepteur »** (`docs/VISION-FORCE-TRACKER.md`) — *« l'humilité qu'on demande à Milo envers l'utilisateur, nous devons nous la demander à nous-mêmes envers le produit »* : on ne crée pas une IA qui *semble* tout savoir, mais une IA qui **sait respecter ses limites** ; un bug = une règle de conception qui manquait ; on ne refait pas l'archi, on la gouverne. ② **Nouveau `docs/BUGS-DE-PHILOSOPHIE.md`** (Michel : « va devenir l'un des plus précieux ») — distinction fondatrice **raisonnement vs comportement** (nos bugs récents = erreurs de COMPORTEMENT au niveau de la SORTIE, pas de raisonnement) + les cas **PB-001** (inventer/fabriquer une source, ft-v589) · **PB-002** (mémoire déconnectée du Gardien, ft-v588) · **PB-003** (interrogatoire, ft-v590) · **PB-004** (parcours qu'un freemium ne peut finir → « le gratuit doit toujours donner une victoire, même partielle », ft-v590). Chaque bug → une règle de conception. ③ **Le « Gardien de la Constitution »** (concept GPT, gravé dans `docs/MOTEUR-RAISONNEMENT-MILO.md`) — couche de conformité **à la SORTIE** (vérifie la réponse avant l'affichage), **symétrique** du Gardien de sécurité qui agit **à l'ENTRÉE** ; **rigueur honnête (Claude)** : 2 étages — **Étage 1 déterministe** (local, 0 IA, attrape le détectable par motif : blocs qui fuient `_stripCoachTech` déjà fait + interrogatoire + jargon médical) vs **Étage 2 validation IA** (le sémantique — invention — au coût d'une 2ᵉ passe, option future) ; ⚠️ ne pas se croire protégé à 100 % par le seul Étage 1. Verdict Michel : *« Force Tracker passe d'une logique de fonctionnalités à une logique de système — le plus grand changement de ces dernières semaines. »* ⏳ **À faire (avec go Michel)** : construire l'Étage 1 (contrôleur de sortie, sur le clone) + alléger `CLAUDE.md` (maître + carte de la connaissance + archive du vieux journal). Doc-only, aucun impact appli, pas de bump. |
**GOUVERNANCE — LA PHILOSOPHIE DE MILO gravée : Constitution v2.1 (22/07/2026, doc-only, soirée de réflexion Michel + Claude + GPT + Gemini + Mistral)** — Longue réflexion fondatrice partie d'une question simple (« que répondre à quelqu'un qui a passé une journée de merde ? ») et remontée jusqu'à l'identité de Milo. Michel « piège » les IA une par une (refuse toutes les formules d'empathie classiques) pour vérifier si le problème venait de la PHRASE ou de la PHILOSOPHIE → **c'était la philosophie**. **Le reframe fondateur** : on ne construit pas un Milo « empathique » (multiplier les phrases de réconfort sonne faux) — on construit un Milo **digne de CONFIANCE** ; l'empathie en est une **conséquence**, jamais un objectif, et elle est **dans les actes (ce qu'il ajuste), pas dans les mots**. **Convergence des 4 voix** : GPT prend l'altitude → **« le respect de la liberté de l'utilisateur »** (capstone) ; Mistral → **« l'empathie naît quand l'IA arrête de deviner et commence à se souvenir »** (absence de présomption) + LE risque que personne d'autre n'a vu : **la mémoire peut devenir une prison** (figer la personne dans son passé) ; Gemini → **« un étranger poli qui observe »**, l'empathie dans l'ajustement, + l'angle mort **intrusion/flicage** (ne jamais « savoir » son corps avant qu'elle ne le formule) + les interdits concrets côté femmes ; **Michel** → la **clé de voûte, l'HUMILITÉ** (« Milo ne cherche pas à comprendre mieux que toi ») + **« ne jamais confisquer le récit »** (exemple « j'ai un gros cul » → *« tu souhaites qu'on travaille cet objectif ? »*) + **« le réconfort n'est jamais une stratégie »** (anti-séduction émotionnelle). **La mission derrière** (Michel) : que chacun·e se sente compris·e, **en particulier les femmes** (outils pensés par des hommes qui présument ; une femme en confiance = fidèle) — phrase fondatrice de **Tatiana** : *« à quoi sert une appli à une femme si c'est juste pour rentrer des données ? »*. **Gravé (doc-only, 0 impact appli)** : **Constitution v2.1** — **Principe 22 (Le respect de la liberté de l'utilisateur — capstone** : ne présume pas · ne décide pas à ta place · ne passe pas outre une limite · garde sa franchise mais te laisse le dernier mot · mémoire = tremplin jamais prison · **l'humilité** : diagnostique la barre jamais l'âme, accepte l'inconnu**)** + **Principe 23 (Ne jamais confisquer le récit ; le réconfort n'est jamais une stratégie)** + renfort du **Principe 17** (interdits concrets femmes : fausse motivation / « girl power » marketé / diminutifs / « programme spécial femmes » / lire un silence → jamais ; valider le statu quo sans drame). **Vision** — reframe *confiance > empathie* + 3 signatures (deviner→se souvenir · simuler→construire · l'empathie dans les actes) + la mission femmes. **`docs/MOTEUR-RAISONNEMENT-MILO.md`** — la frontière **« Milo diagnostique la barre, jamais l'âme »** (hypothèse de cause *technique* vérifiée = oui ; cause *intime* = jamais ; garde-fou anti-neutralisation « humble sur la personne, franc sur l'entraînement »). **`docs/PRESENCE-MILO.md`** — empathie = fonction de la mémoire · tremplin pas prison (promu de futur à garde-fou ACTIF) · l'humilité. **`docs/PERSONAS-FONDATEURS.md`** — dimension de Tatiana approfondie + sa phrase. **`IDEES-FUTURES.md`** — la « philosophie de la mémoire » : le PRINCIPE est gravé, seul le MÉCANISME (cycle de vie oubli/re-confirmation) reste futur. **Mes 2 garde-fous d'architecte** (validés Michel, pour ne pas s'auto-neutraliser) : *« liberté ≠ Milo mou »* (il garde conviction et franchise, seul le dernier mot te revient) + *« humble sur la personne, franc sur l'entraînement »* (le moteur peut toujours diagnostiquer le technique). Doc-only, aucun bump sw.js. |
**GOUVERNANCE — Retour GPT sur le cap « moteur de raisonnement » (22/07/2026, doc-only)** — GPT relit le récap du cerveau de Milo : le projet a **changé de nature** — d'« appli de muscu enrichie par une IA » à **« moteur de raisonnement appliqué au coaching »** ; tous les principes racontent la même histoire, **aucune contradiction majeure**. **3 apports gravés** : ① **angle mort — la PHILOSOPHIE DE LA MÉMOIRE** (« apprendre ET savoir oublier ») : distinguer PERMANENT (blessures chroniques, préférences fortes, matériel, objectifs long terme) / TEMPORAIRE (douleurs guéries, objectifs abandonnés, ancienne salle) / à RE-CONFIRMER / ARCHIVABLE auto → **noté comme futur principe, PAS développé maintenant** (GPT + Claude d'accord). Nuance Claude gravée : le *mécanisme* d'oubli existe déjà en embryon (état du jour éphémère · douleur du jour ≠ zone fragile durable · Observations `rejected`/`deleteObs`) → ce qui manque = un **cycle de vie** de la mémoire durable, à concevoir **après** les briques 7-8. Rangé dans `IDEES-FUTURES.md`. ② **DISCIPLINE — garder la Constitution COURTE** : nouveau **critère d'entrée** dans `CONSTITUTION-MILO.md` (« principe fondamental pour des années, ou simple règle métier ? » → si règle métier, va au journal/`/docs/`, pas dans la Constitution) — méta-règle auto-limitante, ne multiplie pas les principes. ③ **phrase d'identité** ajoutée aux signatures de `docs/VISION-FORCE-TRACKER.md` : *« Force Tracker ne cherche pas à remplacer un coach. Il cherche à donner à chaque utilisateur un coach qui apprend progressivement à le connaître, agit avec les informations dont il dispose, et sait reconnaître les limites de son propre raisonnement. »* (crystallise l'identité « moteur de raisonnement » — Principes 18/19/20). **Alignement sur la suite** : GPT confirme la priorité = **transformer les principes en fonctionnalités concrètes**, la **mémoire durable** en tête (« la brique qui donne le plus de valeur à tout ce qui a été conçu ») — on venait justement de livrer `ft-v582`. **Ne pas ouvrir de nouveau grand chantier.** + correctif : titre de la Constitution recalé v1.7 → **v2.0** (le journal des versions était déjà à jour). Doc-only, aucun impact appli, pas de bump. |


> ### 🔒 Features EN PROD mais RÉSERVÉES AUX TESTEURS (à ouvrir à tous plus tard)
> Réglage manuel des calories/macros · Objectif « Perte de gras + muscle » (recomposition) · « maxi » dans les reps · pointeur Journal.
> **Verrou unique** : `_isNutriBeta()` dans `screens.js` (= `_isTester()`, donc `TESTER_EMAILS` : christophe/eline/emma/tanna).
> **👉 POUR OUVRIR À TOUT LE MONDE** (quand Michel dit « on balance à tout le monde ») : ① `_isNutriBeta()` → `return true;` ; ② dans `constants.js`, remettre les 3 entrées `WHATS_NEW` en **v16/17/18** (voir commentaire) + `WHATS_NEW_MAX=18` et les 3 red dots `manual-kcal`/`goal-recomp`/`reps-maxi` ; ③ bump `sw.js`. Les aides `?`/détaillées décrivent déjà ces features (laissées en place, opt-in). *(⚠️ v15 est déjà prise = pop-up d'excuses réseau 4G ft-v433.)*

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
| @58 | import historique : action importHistory → handleImportHistory_ (Sonnet) |
| @59 | persistance cloud `discipline` (ft-v194) + `histImports` (ft-v168) dans `handleSaveProfile_` |
| @60 | premium à vie : ajout `emma.david16@gmail.com` (testeuse) dans `PREMIUM_HARDCODED_` |
| @61 | Étude du corps : `handleBodyStudy_` (Sonnet, bilan posture/insertions/équilibre/santé/exercices) + route `bodyStudy` + persistance `bodyStudy` dans `handleSaveProfile_` ; embarque aussi `exPhotos` (ft-v212) |
| @62 | persistance cloud `targetWeight` (poids objectif, ft-v229) dans `handleSaveProfile_` |
| @63 | `handleBodyStudy_` enrichi (ft-v262) : mode `deep`/`compare` — ajoute les photos de la série précédente, renvoie une clé JSON `evolution` (comparaison d'évolution), `max_tokens` 3072. Active le « Suivi photos » du Super Testeur (Christophe) |
| @65 | Boîte à idées lisible côté backend (`?action=getIdees&token=FT_IDEES_2026` → `handleTesterIdea_`/`TESTER_IDEAS`, ft-v273) + persistance cloud du **niveau** (`body.level` → `_ps_` dans `handleSaveProfile_`, ft-v240). Déployé depuis le PC de Michel (2026-07-06) |
| @68 | **Milo — modèle du Coach selon l'utilisateur** : `handleCoach_` lit `body.email` (envoyé par le frontend, coach.js `sendToCoach`) et choisit le modèle via **Script Properties** (`COACH_MODEL_MICHEL` → Opus pour michdu75@gmail.com, `COACH_MODEL_CHRISTOPHE` → Sonnet pour christophe@famillelanglois.fr, défaut Haiku 4.5). Modèles en config (pas en dur dans le code). @66/@67 = tentatives cassées (voir piège ci-dessous), @68 = version propre. Déployé PC (2026-07-07) |
| @69 | **Bilan corporel — import photo** : `handleImportBodyScan_` (Sonnet vision, route `action:'importBodyScan'`) lit une photo de rapport de balance pro/impédancemètre → JSON des 12 valeurs (ft-v302). + persistance cloud `bodyScans` (`_pa_` dans `handleSaveProfile_`). Déployé PC (2026-07-07). |
| @71 | **Bilan corporel — lecture photo enrichie** : prompt `handleImportBodyScan_` amélioré (ft-v303/304) — ignore les plages entre parenthèses (prend le 1er nombre), lit les sections annexes + l'**analyse segmentaire** (10 clés bras/tronc/jambes G-D). Déployé PC (2026-07-08). |
| @auto (2026-07-12) | **`readBarcode`** (ft-v393) : `handleReadBarcode_` (Haiku vision, route `action:'readBarcode'`) lit le NUMÉRO d'un code-barres sur une photo (les chiffres imprimés sous les barres) → renvoie les chiffres, que l'app cherche gratuitement dans Open Food Facts. Ajout **isolé** (aucune action existante modifiée) + ajouté à `AI_ACTIONS_` (quota IA). **⚠️ Déployé AUTOMATIQUEMENT** via la GitHub Action `deploy-appsscript.yml` (voir ci-dessous) — le n° de version @NN est auto-assigné (non connu précisément). |
| @auto (2026-07-12 bis) | **Boîte à idées — token robuste + photos en pièces jointes** (ft-v397). `handleTesterIdea_` : ① token de lecture `getIdees`/`aiUsage` vérifié par **HASH en dur** (`_checkIdeesTok_` + `IDEES_TOKEN_HASH_` = SHA-256 de `FT_IDEES_2026`) au lieu de la Script Property `IDEES_TOKEN` **qui ne persiste pas** sur ce projet (le token en clair n'est PAS dans le repo public, seul son hash) ; ② chaque idée est **envoyée par mail** à forcetracker.app@gmail.com **avec les photos en pièces jointes** (`Utilities.newBlob` + `GmailApp` attachments), photos non stockées dans la propriété. Déployé AUTO. |
| @auto (2026-07-13) | **Persistance cloud `manualKcal`** (calories réglées à la main, ft-v409) : `handleSaveProfile_` → `if(body.manualKcal!==undefined) profile.manualKcal=_pn_(...)`. `loadProfile` renvoie déjà tout `profile`. Déployé AUTO. ← **actuel**. |

> **🚀 DÉPLOIEMENT BACKEND MAINTENANT AUTOMATIQUE (depuis 2026-07-08, workflow `.github/workflows/deploy-appsscript.yml`)** : dès qu'un push sur `master` modifie `Code.js` ou `appsscript.json`, GitHub fait tout seul `clasp push --force` + `clasp create-deployment -i <ID>` (redéploie la web app existante) + vérifie `?test=1`. **Plus besoin du PC de Michel ni de clasp en local.** Claude peut désormais modifier `Code.js`, pousser sur master, et le backend part en prod automatiquement (~1-2 min). Vérifier le run via GitHub MCP (`actions_list`/`actions_get`, workflow `deploy-appsscript.yml`). L'auth clasp vit dans le secret GitHub `CLASPRC_JSON`. ⚠️ `.claspignore` toujours respecté (seuls `Code.js` + `appsscript.json` partent). Les mentions « Déployé PC » ci-dessus sont l'ancien mode (historique).

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
