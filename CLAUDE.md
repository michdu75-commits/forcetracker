# ⚡ RÈGLES D'OR — à lire à chaque session avant tout le reste

> **Version courte, une ligne par règle.** Le texte complet, le pourquoi et les cas vécus sont dans
> **`docs/REGLES-OR.md`** — à ouvrir quand une règle est contestée ou qu'on hésite à la contourner.
> *Une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle.*

1. **🚀 Apps Script : TOUJOURS redéployer** après un changement de code. `clasp push` ne met à jour que le brouillon. → `docs/REGLES-OR.md#1`
2. **💎 Premium : ne JAMAIS écraser `PREMIUM_EMAILS`.** Deux sources ; aucune fonction ne doit les réinitialiser. → `docs/REGLES-OR.md#2`
3. **🛡️ Zéro perte de séance — priorité n°1 absolue.** Local d'abord, le réseau ne bloque jamais. → `docs/REGLES-OR.md#3`
4. **⚡ Ouverture instantanée à la salle**, même hors ligne. Le démarrage n'attend aucune requête. → `docs/REGLES-OR.md#4`
5. **🏷️ Incrémenter `ft-vNN`** à chaque déploiement (visible dans « À propos »). → `docs/REGLES-OR.md#5`
6. **🔒 Avant toute opération risquée : backup + branche**, et la nuit. → `docs/REGLES-OR.md#6`
7. **🎨 Garder l'identité « figurines muscles ».** Une chose à la fois, testée avant de continuer. → `docs/REGLES-OR.md#7`
8. **💾 Commit étiqueté AVANT, tag stable APRÈS, rollback en 1 ligne** à la fin de chaque tâche. → `docs/REGLES-OR.md#8`
9. **🔴 FAB « + » Séance — SENSIBLE** : toute modif de l'écran Séance doit vérifier `_positionFab()`. → `docs/REGLES-OR.md#9`
10. **🗣️ Michel n'est ni développeur ni programmeur.** Expliquer simplement, prévenir avant tout risque, **court par défaut** — la réponse d'abord, le détail seulement s'il le demande. → `docs/REGLES-OR.md#10`
11. **📣 À CHAQUE feature en PROD : prévenir l'utilisateur** — points **2 à 5 toujours** (point rouge `NEW_FEATURES` · aide `?` de l'onglet · aide détaillée · diapo du Guide). ⚖️ **La pop-up `WHATS_NEW` se mérite** : seulement si la personne doit *faire* quelque chose, ou si un repère a bougé. **La pop-up ANNONCE, l'aide EXPLIQUE.** → `docs/REGLES-OR.md#11`
12. **📓 Tenir TOUS les fichiers de suivi à jour EN TEMPS RÉEL**, dans le même mouvement que le bump `sw.js` + commit : `CLAUDE.md` (1 ligne : quoi + pourquoi + `ft-vNN`), `docs/INVENTAIRE.md` régénéré, fichiers de chantier. → `docs/REGLES-OR.md#12`

**⚙️ CHARGEMENT AUTOMATIQUE** — la ligne ci-dessous n'est pas décorative : la syntaxe `@fichier` fait
**importer** le document par Claude Code au démarrage, comme s'il était écrit ici. Un seul fichier est
importé, volontairement : les **règles de construction**, qui s'appliquent à *toutes* les tâches.
⚠️ **Ne pas en ajouter par réflexe.** `CLAUDE.md` fait déjà ~25 700 mots ; importer les autres docs de
gouvernance ajouterait ~13 800 mots (+54 %) à chaque session — et **plus on charge, moins chaque règle
pèse** (c'est la règle R20 elle-même). Les autres docs se lisent **à la demande**, c'est le bon régime.

@docs/REGLES-ARCHITECTURE.md

**📜 Documents de gouvernance (à respecter) :**
- ⚡ **`docs/REGLES-OR.md`** — **les 12 règles d'or EN ENTIER** (le pourquoi, les cas vécus, les garde-fous). `CLAUDE.md` n'en porte que la version d'une ligne depuis la scission du 28/07/2026 : ce fichier faisait **33 000 mots** relus à chaque session, dont **79 % de journal**. *Une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle.* Cohérence des deux fichiers vérifiée par `python3 tools/check_regles.py`.
- 🌟 **`docs/VISION-FORCE-TRACKER.md`** — **l'ESPRIT / le POURQUOI du produit** : *« Force Tracker n'est pas une IA, c'est une mémoire sportive intelligente »* · *« il ne te dit pas qui tu dois devenir, il se souvient de qui tu es devenu »*. Le sportif ne repart jamais de zéro ; la vie avant le programme ; observer avant conseiller ; adapter avant interdire. **Question de référence avant toute feature : « est-ce que cela renforce l'esprit Force Tracker ? »** La Constitution dit le *comment*, la Vision dit le *pourquoi*.
- 👥 **`docs/PERSONAS-FONDATEURS.md`** — **à lire juste après la Vision** : les personas ne sont plus des profils de test, ce sont les **dimensions du projet**. **Michel** = Vision & Architecture (le fondateur, à part). **Christophe** = Terrain & Métier (→ VM). **Tatiana** = Personnalisation, pas de présupposés (→ VC). **Emma** = Physiologie & Ressenti (→ VC). Relie chaque évolution technique à un besoin humain concret. Règle : un nouveau persona n'entre que s'il ouvre une **dimension** nouvelle. *(Idée & conception : Michel.)*
- 🧩 **`docs/MODELE-METIER.md`** — **le LANGAGE COMMUN du produit** (v0.1, vivant) : les objets métier que TOUS les modules partagent (Athlète · Objectif · Programme · Cycle · Séance · Bloc · Exercice · Série · Exercice-bibliothèque) + transversaux (Méthode · Consigne · Notation) + la grammaire + le principe **PLANIFIÉ vs RÉALISÉ**. Cap posé par Michel (21/07/2026) : penser « objets métier », pas « fonctionnalités ». Se distille des vrais programmes, reste vivant. Lié au chantier structures (`PARSER-STRUCTURES.md`).
- 📍 **`docs/CONTEXTE-ACTUEL.md`** — **À LIRE EN PREMIER avant toute nouvelle tâche** (1 page) : version, branche, brique active, dernières décisions, prochaine étape, blocages. Le raccourci pour reprendre le contexte sans tout relire.
- 🏛️ **`docs/REGLES-ARCHITECTURE.md`** — **COMMENT ON CONSTRUIT** (créé 27/07/2026 sur une proposition de GPT, qui pointait un vrai manque : les règles de conception existaient mais **éparpillées**). **28 règles** rassemblées, chacune née d'un **événement réel** (bug, décision, galère) : les **données** (source de vérité unique · ne jamais dupliquer · comportement observable *différé mais nommable* · **l'info doit descendre jusqu'à la DONNÉE pas rester dans le TEXTE** · l'audit à l'envers) · les **décisions** (une seule voix, construite **émergentiellement** · le cerveau distribué → **le prompt est le dernier levier** · un prompt ne compense jamais une donnée absente · le **modèle** est une variable structurelle · permissions **bornées** · sécurité > vitesse · cohérence > réactivité) · la **construction** (enrichir l'existant · un comportement copié peut devenir faux · tout chemin de fermeture pose son marqueur · local-first · chaque bug devient un test · vérifier le **déploiement** pas le push) · la **gouvernance** (légère · prompt maigre / doc jardinée · critère d'entrée · retours à 3 paliers). ⚠️ **Ne pas confondre avec la Constitution** : celle-ci dit comment Milo se comporte envers la **personne** (éthique) ; celui-là dit comment on **construit le système**. En cas de conflit, la Constitution l'emporte.
- **`docs/PROCESSUS-DEVELOPPEMENT.md`** — la **méthode officielle** : le cycle d'une brique (Réflexion → Spécification `Objectif/Critère/Hors périmètre` → Challenge → Développement → **Clôture obligatoire** → Validation Michel). Suivre ce processus pour CHAQUE brique, sans sauter d'étape.
- **`CONSTITUTION-MILO.md`** — les principes stables (la personne d'abord, sécurité, faits avant opinions, confidentialité…). Toute évolution doit les respecter.
- **`docs/PRESENCE-MILO.md`** — vision d'identité : Milo devient la **présence** / la porte d'entrée du produit (Milo → App), sans gadget, jamais un passage obligé. **Le cerveau d'abord, la présence ensuite.** Guide l'UX des futures briques.
- 🌱 **`docs/PROFIL-VIVANT.md`** — **le design du « profil vivant »** (prolonge Constitution P25) : Milo **apprend, vérifie, corrige et évolue** avec le sportif (*« plus tu utilises Force Tracker, plus Milo te connaît vraiment »*). Les **4 modes** (Compléter · Enrichir · Mettre à jour · **Confirmer**), le **déclaré vs réalisé** (la réalité prime sur une tendance stable, jamais auto), le principe **« Milo ne pilote jamais »** (observer → expliquer → proposer → décider), la **fiabilité par champ** (décroissance + écart observé ; blessures = sensible), le **ton humble anti-surveillance** (jamais 2× « je vois que »), l'**évolution perceptible mais méritée** (jauge « Ce que Milo sait de toi »). Backbone : confiance + date de dernière confirmation. Lié à `NUTRITION-PHILOSOPHIE.md` (autres sports → TDEE, changements de vie, manuel = propose, tout explicable).
- 🧠 **`docs/MOTEUR-RAISONNEMENT-MILO.md`** — **LE CADRE du « cerveau de Milo »** (réflexion fondatrice Michel 22/07) : le pipeline **Compréhension → Diagnostic → décision → Explication** (le DIAGNOSTIC = l'étape qui manquait : même contexte, cause différente, stratégie différente) ; les **2 cerveaux** (Comprendre = Registre/ADN/Observations/état du jour/mémoire · Décider = raisonnement + Gardien + générateur) ; et surtout la **limite volontaire (Principe 18)** : **fiabilité AVANT intelligence** — profil vivant, décider avec l'info d'aujourd'hui, **ne jamais faire semblant de savoir**, **savoir s'arrêter**. Chaque brique « cerveau » (ancre/accessoire, observations, profil conversationnel…) est une **PIÈCE de ce moteur**, jamais un ajout isolé.
- 🍽️ **`docs/NUTRITION-PHILOSOPHIE.md`** — **L'ESPRIT de la nutrition** (cadre à respecter AVANT de coder une brique nutrition ; croisement Gemini + Mistral + Claude + synthèse Michel, 22/07). Phrase-boussole : *« la nutrition est un moyen d'améliorer la santé/récup/perf ; elle ne doit jamais devenir une source de stress supérieure au bénéfice qu'elle apporte »* (**Constitution · Principe 21**). Les principes (levier au service de l'objectif · optionnelle jamais bloquante · fiabilité > exhaustivité · cohérence > réactivité · local d'abord + fallback fait-maison · qualité gratuite via Nutri-Score/NOVA · adapter pas imposer · mémoire · anti-TCA) · **la précision au CHOIX (4 niveaux : qualitatif → portions → macros → suivi précis)** · **le Gardien nutrition** (seuils d'alerte) · **la 1ʳᵉ brique** (journal léger « à la portion » sur Open Food Facts) · la couche future (chronobiologie/montre connectée).
- 📱 **`docs/STRATEGIE-NATIF.md`** — **les principes DURABLES du passage en natif/hybride** (cadrage 22/07, croisement Gemini + Mistral + Claude + synthèse Michel). Principe directeur (Michel) : *« le natif ne doit apporter que ce que le web ne peut pas offrir »* (question de contrôle : la PWA suffit-elle déjà ?). Chemin : **coque Capacitor, zéro réécriture** (on garde Milo/EXLIB/modèle/local-first) ; RN/Flutter/Tauri/Cordova écartés ; TWA sur Android. **Approche progressive** des plugins (préparer l'archi, n'ajouter chaque plugin que sur un besoin réel — pas « tous en V1 »). Priorité : objets connectés > push > stores > (IAP en dernier). Monétisation : au lancement garder le premium **serveur** (rien vendu in-app → esquive la taxe Apple), bouton neutre « gérer sur le web » ensuite. ⚠️ **Aucune estimation de coût/délai** (décision Michel : un doc d'archi garde les principes durables).
- 🌱 **`docs/ORIGINE-DES-REGLES.md`** — **D'OÙ VIENT CHAQUE RÈGLE** (créé 27/07/2026). Les règles d'or et les principes de la Constitution étaient écrits partout, mais **leur raison d'être nulle part** — or *une règle dont on a oublié la raison finit toujours par être contournée*. Retrouvé dans les **transcriptions de conversation** (2→27 juillet, 1 292 messages de Michel), qui n'étaient dans **aucun fichier du projet**. On y apprend que la règle **#6** (backup) date du **tout premier message** (« je suis comme un bébé… avant tout test, un backup ») · la **#4** (ouverture instantanée) vient des **polices** (« supprimer toute dépendance internet au démarrage ») · la **#11** (checklist) est la mise en forme de **trois rappels séparés** du 4/07 · les principes **femmes** viennent d'un souci d'exactitude physiologique (« aucun cliché… mais le discours ne doit pas être le même », « les migraines, plus fréquentes chez les femmes ») · et l'**audit de sécurité du 10/07** existait bien. **Couvre les 26 jours** (2→27/07). ⭐ **La découverte majeure** : le 18/07, Michel avait explicitement demandé *« le suivi de chaque évolution ET SA RAISON »* (c'est la naissance de la règle #12) — 9 jours plus tard on mesurait que le *pourquoi* manquait pour **70 %** des versions. **La règle existait, elle n'a pas été tenue.** ⭐ **Le mécanisme des règles d'or**, constaté 3 fois : elles naissent le jour où le même rappel revient une fois de trop (*« mets-le dans les règles stp, pas que je te le dise à chaque fois »*, 18/07) → **quand Michel répète une consigne deux fois, ne pas la ré-appliquer : l'ÉCRIRE.** ⚠️ Les transcriptions ne sont pas garanties dans le temps.
- 🎨 **`docs/DESIGN-KIT.md`** — **le kit à coller dans un outil de maquettage** (créé 27/07/2026). **Le problème** : l'outil externe travaille **à l'aveugle** — il ne connaît ni les couleurs, ni les polices, ni les composants de Force Tracker → il **invente** une esthétique, belle chez lui et **intransposable** ici (échec du 21/07 : *« le cercle n'a rien à voir, pas de profondeur, les couleurs pas respectées »*, et du **Flutter** proposé pour une PWA). **Le fix** : un bloc prêt à coller avec les **vraies** variables (`--bg`/`--t1`/`--red`…), les polices, les composants (`.btn`, `.card`, `.modal`) et le motif d'**anneau SVG**. ⚠️ **Constat au passage** : l'app n'utilise **PAS canvas** pour l'interface — **104 `<svg>`**, et les 17 usages de canvas ne servent qu'à traiter des **images** (redimensionner, masquer le bilan, caméra). Donc **aucune limite** côté design : dégradés, ombres, profondeur, animations sont tous faisables. **Bon partage des rôles** : l'outil externe pour *explorer une direction*, Claude Code pour *la rendre réelle sur l'écran existant* (et envoyer une capture du rendu réel — zéro transposition).
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
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache versionné `ft-vNN`, bumpé à chaque release (**actuel : `ft-v629`** — voir le journal des versions) |
| `.github/workflows/deploy-pages.yml` | **Déploiement Pages via GitHub Actions** (depuis ft-v619) — remplace le « Deploy from a branch » qui se bloquait par intermittence. Se déclenche à chaque push sur `master` + relançable à la main (`workflow_dispatch`). |
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

## 🔎 Fonctionnalités PEU VISIBLES — celles qu'on oublie (et qui font dire des bêtises)

> **Pourquoi cette liste existe** : le 27/07, un audit a conclu que l'import de **prise de sang**
> manquait. **Il existait depuis le 8 juillet.** Michel a dû corriger de mémoire. Cause : la
> fonctionnalité n'était documentée que dans l'archive (lue à la demande), pas ici (lu à chaque
> session). ⚠️ **Avant d'affirmer qu'une chose n'existe pas, vérifier dans le code et dans
> `docs/INVENTAIRE.md`** (règle R23).

Ces fonctionnalités **existent** mais ne se voient pas dans la liste des écrans (elles vivent dans des
modales, des boutons secondaires ou des accès réservés) :

| Fonctionnalité | Où | Notes |
|---|---|---|
| 🩸 **Bilan sanguin** (import PDF/photo, lecture IA, injecté dans le contexte de Milo) | Profil → Santé | `#ov-blood-test` + `#ov-blood-redact` (**masquage de l'identité avant envoi** : on passe le doigt sur nom/date de naissance). Accès bêta (`_isBloodBeta()`). Backend `handleImportBloodTest_` / action `importBloodTest`. ⚠️ Garde-fou médical : aucun diagnostic, renvoie au médecin. Livré ft-v313, élargi ft-v320/321. |
| 🧪 **Bilan corporel** (balance pro / impédancemètre) | Profil | `#ov-bodyscan-form` — recopie ou **photo du rapport** lue par l'IA (`importBodyScan`), 12 valeurs + analyse segmentaire. Stocké dans `bodyScans`. Backend @69/@71. |
| 📸 **Suivi photos / séries** | Profil | `#ov-body-series` — séries de photos comparées dans le temps (`bodyStudy` mode `deep`/`compare`). Réservé super-testeurs. |
| 💪 **Muscles travaillés** | Séance | `#ov-mm` — détail des muscles primaires/secondaires d'un exercice. |
| 📅 **Sélecteur de jour de programme** | Séance | `#ov-day-sel` — « Quel jour aujourd'hui ? » au chargement d'un programme multi-jours. |
| ⚕️ **TRT** (traitement prescrit) | Profil → Santé | **Admin uniquement** (`_isAdminUnlocked()`). Milo adapte l'entraînement mais ne conseille JAMAIS sur le traitement. Livré ft-v581. |
| 🎁 **Pop-ups testeurs** | démarrage | `#ov-emma-welcome`, `#ov-christophe-photos`, `#ov-tester-*`, `#ov-billoute` — messages personnels réservés (`TESTER_EMAILS`). Toutes doivent être dans `_OVERLAY_CLOSERS` (règle R15). |

---

## 🗺️ Carte de la connaissance (où vit quoi)

> Force Tracker n'accumule plus des *fonctionnalités* mais des *connaissances, principes, cas réels,
> décisions de conception*. Cet index dit **où trouver quoi** par DOMAINE. Le détail historique
> (catalogue des features + journal ft-v128→574) vit dans **`docs/JOURNAL-ARCHIVE.md`**.

| Domaine | Où | Quoi |
|---|---|---|
| **Fondamentales** | `CONSTITUTION-MILO.md` (v2.1) · `docs/VISION-FORCE-TRACKER.md` · `docs/PERSONAS-FONDATEURS.md` · `docs/MODELE-METIER.md` | Les principes stables, l'esprit/le pourquoi, les dimensions du projet, le langage métier commun. |
| **Conversation (Milo)** | `docs/MOTEUR-RAISONNEMENT-MILO.md` · `docs/PRESENCE-MILO.md` · `coach.js` (`buildCoachContext`, `_gardienRules`) | Le cerveau (Compréhension→Diagnostic→décision→Explication), la présence, le contexte injecté, le Gardien de sécurité (entrée). |
| **Mémoire** | `docs/DOSSIER-ATHLETE-SUIVI.md` · `S.registre`/`S.adn`/`S.coachMemory` · `docs/VISION` (mémoire 3 niveaux) | Registre, ADN sportif, observations validées, mémoire durable, faits mesurés. Modèle : essentielle (gratuite) → intelligente (premium) → vivante (briques 7-8). |
| **Les 12 règles d'or** | `docs/REGLES-OR.md` (texte complet) · `CLAUDE.md` (une ligne par règle) | Le socle opérationnel : déploiement, premium, zéro perte, ouverture instantanée, backup, FAB, communication, checklist utilisateur, tenue des fichiers de suivi. |
| **Architecture (comment on construit)** | `docs/REGLES-ARCHITECTURE.md` | Les 28 règles de conception, chacune née d'un vrai événement. Le « comment on construit », distinct du « comment Milo se comporte » (Constitution). |
| **UX / produit** | `docs/PROCESSUS-DEVELOPPEMENT.md` · règles d'or #9-11 · `IDEES-FUTURES.md` · `A-FAIRE-SUR-PC.md` | Le cycle d'une brique, la checklist #11 (informer l'utilisateur), le FAB, les idées à venir, le backlog PC. |
| **Éthique / sécurité** | `CONSTITUTION-MILO.md` (P2/P13/P17/P22/P23) · `docs/BUGS-DE-PHILOSOPHIE.md` · `docs/GALERES-ET-LECONS.md` | Adapter pas interdire, accompagnement jamais thérapie, respect de la liberté, le récit ; les dérives de comportement corrigées ; les galères techniques. |
| **Ce qui EXISTE (inventaire)** | `docs/INVENTAIRE.md` (généré) + `tools/inventaire.py` | **Répond à « est-ce que c'est déjà construit ? »** — écrans, menus, modales, actions du serveur, nouveautés annoncées, avec une colonne qui signale ce qui est **dans le code mais absent de la doc**. ⚙️ **Généré depuis le code**, jamais écrit à la main (un inventaire manuel redevient faux en 3 semaines). À régénérer à chaque livraison : `python3 tools/inventaire.py`. |
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

> **Version actuelle : `ft-v652`** (prochaine : `ft-v653`). Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> **20** entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien
> supprimer). `python3 tools/check_regles.py` le signale automatiquement.

**ft-v611 — 🧪 CLONE : badge quota compact + refonte header PARKÉE (choix « meilleur + sécur », délégué par Michel)** — Michel : « fais ce qu'il y a de meilleur et de plus sûr ». Décision : ① **gain safe tout de suite** — le badge quota passe à « **8 questions** » (au lieu de « 8 questions gratuites ») sur le clone (gaté `__FT_CLONE__`, `updateCoachHeader` coach.js ~697 ; **PROD garde le libellé complet**) ; ② **la grosse refonte du header** proposée (déplacer badge quota + horloge + `+` sur la ligne de la **date**, boutons d'action sur leur propre rangée) est **PARKÉE pour une session dédiée** : c'est un vrai chantier (déménager des contrôles du Coach vers le bandeau **global**, 2 rangées, conditionnel à l'écran Coach) — faisable (les contrôles sont retrouvés par ID donc la logique ne casse pas) mais **visuel** (Michel voudra itérer au pixel) et il touche **tous les écrans** → à faire proprement, pas en hack clone fragile (le header se redessine). Testé Playwright : prod « 8 questions gratuites » / clone « 8 questions » ✅ + `node --check` OK. ⏭️ **À faire ensemble** : la refonte 2-rangées du header (spec de Michel gardée). sw.js ft-v611. |

**ft-v610 — 🧪 CLONE : header compacté v2 — garder le LOGO (identité), gagner via les espacements (cadrage GPT)** — GPT affine ft-v609 : **ne pas toucher au logo/titre/boutons** (ils portent l'identité premium) — on gagne la place autrement. Révision : le shrink logo de ft-v609 est **remplacé** par de la compaction d'**espacements**, toujours **clone-only** (`html.is-clone`, PROD inchangée) : `.topbar` marge basse **14→8** · `.coach-header` **8/12→2/6** (resserre l'espace date→bloc Milo) · `.coach-header-sub` « Ton coach IA · S'adapte à toi » **12→11px** + line-height serré · `.coach-quota` (« 8 questions gratuites ») padding plus fin. **Honnêteté** : l'espace *au-dessus* du logo = la **barre d'état iPhone** (heure/batterie), non réductible sans passer dessous → on ne le touche pas. Gain ~**20-30px** pour le chat. Testé Playwright : **logo 56px partout** (prod ET clone), coach-header compacté **seulement** en clone (prod 8/12, clone 2/6) ✅ + noyau dur 10/10. **Idée future notée** (`IDEES-FUTURES.md`) : **header adaptatif** (compact au scroll, façon iOS/Apple Music — waouh à l'ouverture, place max ensuite). Fichiers : `style.css`, `sw.js`, `IDEES-FUTURES.md`, `clone/*`, `CLAUDE.md`. ⏳ Si Michel valide → promotion (retirer le gate). sw.js ft-v610. |

**ft-v609 — 🧪 CLONE : topbar compacte pour donner plus de place au chat (retour Michel « plus de visibilité au chat avec Milo »)** — Michel note que le bandeau global « Force Tracker » (`.topbar`) mange de la hauteur. Il ne peut pas monter *plus haut* (déjà collé sous la barre d'état de l'iPhone — l'heure/batterie), mais on le rend plus **compact** : logo **56→42 px** + marge basse **14→8 px** → ~**20 px** de contenu gagnés sur TOUS les écrans. Gaté **`html.is-clone`** (posé uniquement dans `/clone/` par `_initCloneTools`) → **PROD strictement inchangée**, à valider sur le clone puis promouvoir. Fichiers : `style.css` (2 règles clone-only), `sw.js`, `clone/*`, `CLAUDE.md`. Testé Playwright : PROD logo **56px** (inchangé) / avec `is-clone` **42px** (compact) ✅ + noyau dur non impacté. ⏳ Si Michel valide → promotion (retirer le gate `html.is-clone`). sw.js ft-v609. |

**ft-v608 — 📖 Guide de l'appli : diapo « Milo va droit au but » (clôt la checklist #11 de ft-v607)** — Michel a validé l'aperçu. Comme son compte perso est trop avancé (Opus + vrais records) pour reproduire l'exemple « débutante », on a pris la capture du **clone** (le rendu qu'un vrai nouvel utilisateur voit) et **recadré pour retirer le bandeau « 🧪 CLONE »** (contenu identique à la prod, même code — juste le marqueur de test enlevé) → `guide/milo-direct.jpg` (780px, recadré au-dessus de la ligne « Milo »). Diapo ajoutée à `APP_GUIDE_SLIDES` (app.js) **après la diapo Coach** (sans doigt animé — c'est une diapo « qualité de réponse », pas une action à taper) : montre le plan direct « Full Body » + « amplitude contrôlée pour protéger ton épaule droite ». + ajoutée au PRECACHE (sw.js). Guide passe de 15 à **16 diapos**. → **checklist #11 de ft-v607 COMPLÈTE à 100 %** (pop-up v39 + red dot + `?` + aide détaillée + guide). Fichiers : `app.js`, `guide/milo-direct.jpg`, `sw.js`, `clone/*`, `CLAUDE.md`. Testé : `node --check` OK + noyau dur 10/10. sw.js ft-v608. |

**ft-v607 — 🚀 PROMOTION EN PROD du lot anti-interrogatoire (le prompt fin marche enfin — grâce au fix modèle Sonnet) + checklist #11 (« go » Michel)** — **Le déclencheur** : sur le clone repassé en Sonnet (fix backend ci-dessus), test « je veux faire de la force » (sans email) → Milo donne un **vrai plan direct** (Full Body 3×/sem, exercices, reps), **montre comment il protège** les zones (« développé couché haltères en amplitude contrôlée pour l'épaule », « cardio doux pour le genou »), pose **UNE seule** question, **et les boutons de réponse rapide apparaissent** — le Gardien ne signale **plus** d'interrogatoire (juste « bloc technique retiré », normal). **Preuve définitive** : tout ce qu'on avait construit (anti-interrogatoire ft-v602/603/606, valeur-avant-question, protection blessure « montrer le comment », moment Milo ft-v593, question guidée ft-v585-590, mémoire prochaine séance ft-v601) **était juste** — il manquait un **modèle capable**. **Promotion** : retrait du gate `${…__FT_CLONE__…}` autour du gros bloc de `buildCoachContext` (lignes ~1126-1158) → ces règles s'appliquent maintenant à **TOUS** (prod), plus seulement le clone. **Restent gatés clone** (outils de test, ne jamais promouvoir) : badge « 🛡️ Gardien » (sortie), toggle questions illimitées, et le couplage blessure-retenue→Santé (ft-v588, a son propre frontend, promotion séparée à valider). **Checklist #11 faite** : WHATS_NEW **v39** « 💬 Milo va droit au but » (`WHATS_NEW_MAX=39`, réservés testeurs décalés v40/41/42) + red dot `milo-value-first` (coach) + aide `?` Coach (🗣️) + aide détaillée « Milo va droit au but » (coach.js). ⏳ **Item 5 (diapo du Guide)** = à faire quand Michel fournit une capture. Fichiers : `coach.js` (retrait gate + aide détaillée), `constants.js` (WHATS_NEW + red dot), `screens.js` (aide `?`), `sw.js`, `clone/*`, `CLAUDE.md`. Testé : `node --check` sur les 3 fichiers OK + **noyau dur 10/10** (0 régression). sw.js ft-v607. |

**BACKEND (worker.js) — 🎚️ LE MODÈLE, PAS LE PROMPT : coach par défaut monté Haiku → Sonnet (la « variable cachée », test réel Michel + GPT aligné, 26/07/2026)** — **La découverte** : l'« interrogatoire » de Milo revenait malgré **3 durcissements de prompt** (ft-v602/603/606). En testant le clone **sans email**, on tombait sur le modèle **par défaut = Haiku 4.5** (léger), alors que le fondateur (michdu75) teste sur **Opus 4.6** (haut de gamme). Un modèle léger **suit mal les consignes fines** (l'anti-interrogatoire en couches) → le prompt fin ne « prend » que sur un modèle capable. **Ce n'était pas le prompt, c'était le MODÈLE** = une variable **structurelle** du cerveau distribué. **Implication stratégique** : tous les vrais utilisateurs (testeuses, freemium, futurs) voyaient le Milo « interrogatoire », pas celui qu'on peaufine — or le **gratuit/la découverte** = là où se joue la **conversion**. **Fix (worker.js `handleCoach_`, ligne ~243)** : **défaut de la conversation coach = `claude-sonnet-4-6`** (au lieu de Haiku) ; michdu75 reste Opus 4.6 ; les **tâches utilitaires** (code-barres, résumés, lecture d'étiquette, morpho) **restent sur Haiku** ailleurs dans le fichier (coût maîtrisé). **Règle de gouvernance gravée (Michel + GPT)** : *« on évalue Milo sur le modèle réellement utilisé par les VRAIS utilisateurs, pas sur le modèle premium du fondateur »* — sinon on **corrige le mauvais cerveau**. **Gravé** : `docs/PROCESSUS-DEVELOPPEMENT.md` (le niveau de modèle = variable STRUCTURELLE, ajouté aux « 3 questions ») + `docs/GALERES-ET-LECONS.md` (§1 : « on optimisait un Milo que personne ne voyait »). **Backend → pas de bump sw.js** ; worker.js se redéploie via `deploy-worker.yml` au push sur master. ⚠️ **À valider sur le clone** (test « je veux faire de la force » **sans email** → doit maintenant tourner sur Sonnet → plan direct, plus d'interrogatoire) — c'est **le test qui confirme que la cause était le modèle**. Coût : Sonnet ≈ 3× Haiku en entrée (arbitrage assumé par Michel : la qualité de la conversation = le cœur du produit). Fichiers : `worker.js`, `docs/PROCESSUS-DEVELOPPEMENT.md`, `docs/GALERES-ET-LECONS.md`, `CLAUDE.md`. |

**BACKEND (worker.js) — 🔒 VERROU ANTI-ABUS DU SERVEUR IA DÉPLOYÉ (27/07/2026, Michel présent — clôt LE point critique de l'audit ft-v624)** — Le Worker Cloudflare était **grand ouvert** (CORS `*`, zéro vérif d'origine, zéro quota sur ce chemin) → n'importe qui avec l'URL pouvait consommer l'API Anthropic **aux frais de Michel**. **Fix** : `ALLOWED_ORIGIN = 'https://michdu75-commits.github.io'` (couvre prod + clone, **confirmé par Michel** : plus de clone pages.dev) — toute requête d'origine absente (curl/scripts) ou inconnue (site tiers) → **403 AVANT tout appel payant** ; l'en-tête CORS ne dit plus `*`. **Testé EN LOCAL avant déploiement** (nouveauté méthodo : le module ES du Worker s'exécute dans Node avec un faux réseau) : **9/9** (OPTIONS 204 · GET 405 · sans-Origin 403 · origine pirate 403 + **0 appel sortant** · app légitime 200 coach + relais Apps Script OK). Backup : tag `backup-avant-verrou-worker` ; **rollback 1 ligne** : `git revert` + push (redéploiement auto ~1 min). ⚠️ **Limite honnête** : un attaquant déterminé peut falsifier l'Origin hors navigateur → complément recommandé (à faire par Michel dans le dashboard Cloudflare, pas urgent) : règle de **rate-limiting** (ex. 30 req/min/IP). Validation device par Michel (Milo + code-barres + clone) à la mise en ligne. Backend pur → **pas de bump sw.js**. Fichiers : `worker.js`, `docs/worker-securise-PROPOSITION.txt` (marquée ✅ appliquée), `docs/GALERES-ET-LECONS.md` (§3 → résolu), `CLAUDE.md`. |

**GOUVERNANCE — 🎯 « Toute connaissance doit produire un COMPORTEMENT OBSERVABLE » (27/07/2026, GPT + Michel + Claude, doc-only)** — Née **du terrain** : les 4 bugs Milo→Séance du jour (ft-v625→628) n'en formaient qu'**un seul** — *Milo raisonnait parfaitement dans le chat (charges, repos, ordre, consignes) mais cette intelligence ne descendait pas jusqu'aux DONNÉES utilisées par l'app*. GPT en tire une **règle générale** : **« toute connaissance stockée dans le profil vivant doit produire au moins un comportement observable dans l'application ; une connaissance qui ne change rien est inutile »**. Le maillon faible n'est ni la **collecte** ni le **raisonnement**, c'est la **RESTITUTION**. **Grille des 3 questions** avant d'ajouter une info : **① qui la PRODUIT · ② qui l'EXPLOITE · ③ quel comportement CONCRET change ?** (aucune réponse → on n'ajoute pas). Le profil vivant = base de connaissances **ACTIVE**, pas de stockage. **⚠️ Nuance d'architecte (Claude) gravée** : le comportement peut être **DIFFÉRÉ** mais doit être **NOMMABLE** — appliquée trop littéralement, la règle tuerait la **mémoire longue** qui est l'ADN du produit (contre-exemples réels : une pesée isolée ne dit rien, c'est la tendance ; le `dayStateLog` a été bâti pour servir *des mois plus tard* ; `confirmedAt` ne fait rien en soi mais pilote le mode Confirmer ; les **briques 7-8** reposent entièrement sur de la valeur différée). Formulation retenue : *« ça servira à la brique 7 dans quelques mois » = valide ; « on verra bien » = non*. **💡 Bonus : la règle marche À L'ENVERS (audit)** — c'est en demandant « où cette info ressort-elle concrètement ? » qu'on a trouvé les 4 bugs → **audit « données mortes » à faire un jour** sur l'existant (stockées mais jamais exploitées : soit on les branche, soit on les retire). **Applique la grille aux « pratiques d'entraînement »** (cardio/mobilité/préhab) : elles la passent ✅ (cardio → récup + dépense + conseils + nutrition + analyses). Gravé : `docs/PROFIL-VIVANT.md` (la règle + les 3 questions + la nuance), `docs/PROCESSUS-DEVELOPPEMENT.md` (**4ᵉ filtre** de la grille d'évaluation d'une brique). Doc-only, aucun impact appli, pas de bump sw.js. |

**GOUVERNANCE — ✂️ `CLAUDE.md` SCINDÉ EN DEUX : 33 000 → 10 300 mots (−69 %), sur une remarque venue de l'extérieur (28/07/2026, doc-only)** — **Le déclencheur** : en aidant une amie de Michel à cadrer un autre projet, une relecture extérieure a fait remarquer qu'un fichier de règles de 371 lignes relu à chaque session est **trop long pour être lu**. L'argument valait **bien plus pour nous** : notre `CLAUDE.md` faisait **33 007 mots**, dont **79 % de journal des versions** (83 entrées, alors que le fichier lui-même prescrivait d'archiver au-delà de 30). **Le principe, à retenir** : *une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle* — c'est le pendant de la « règle des règles » (une règle sans vérification est un souhait), appliqué à la **longueur**. C'est aussi **R20** (« le prompt est opérationnel, la doc est de la mémoire ») qu'on n'avait jamais appliqué à nous-mêmes. **Livré** : ① nouveau **`docs/REGLES-OR.md`** = les 12 règles d'or **en entier** (le pourquoi, les cas vécus) ; `CLAUDE.md` n'en garde qu'**une ligne chacune**, avec renvoi. ② **71 entrées de journal** (ft-v575→632) déménagées dans `docs/JOURNAL-ARCHIVE.md` — **rien supprimé**, coupé/collé dans l'ordre, sous un titre daté. `CLAUDE.md` garde les **12** plus récentes. ③ nouveau **`tools/check_regles.py`** : vérifie que les deux fichiers portent les mêmes règles, que chaque ligne courte renvoie bien vers la longue, **et** que le journal récent ne dépasse pas 20 entrées (le seuil se rappelle tout seul, au lieu d'être une phrase qu'on ignore). **Garde-fou posé exprès** : le risque d'un fichier scindé, c'est que le *pourquoi* cesse d'être lu — et *une règle dont on a oublié la raison finit toujours par être contournée*. D'où les renvois systématiques, et le rappel que le pourquoi vraiment critique vit **dans le code**, au-dessus de ce qu'il protège (R27). **Vérifié** : aucune des 83 entrées perdue (contrôle automatique avant/après), les 12 règles présentes des deux côtés, l'import `@docs/REGLES-ARCHITECTURE.md` et toutes les sections techniques intacts. Noyau dur 10/10. Rollback : `git reset --hard avant-scission-claude-md`. Doc-only, aucun impact appli, **pas de bump sw.js**. Fichiers : `CLAUDE.md`, `docs/REGLES-OR.md` (nouveau), `docs/JOURNAL-ARCHIVE.md`, `tools/check_regles.py` (nouveau). |

**ft-v652 — 🙋 Le PRÉNOM : Milo ne l'avait jamais reçu, et il était introuvable dans le profil (signalé par Michel)** — *« Milo ne prenait pas mon prénom et il ne le voit pas dans le profil »*. **Deux bugs distincts**, tous les deux réels. **① Milo n'a JAMAIS reçu le prénom.** Le prompt lui demandait pourtant explicitement de dire *« Salut [son prénom], comment tu te sens ? »* — mais `S.name` n'apparaissait **nulle part** dans `buildCoachContext`. C'est **exactement la règle R8** : *un prompt ne compense jamais une donnée absente*. On lui demandait d'utiliser une information qu'on ne lui donnait pas. Ajouté au bloc `PROFIL ATHLÈTE`, avec la consigne de l'employer **naturellement** (pas à chaque phrase) ; et quand le prénom est inconnu, Milo est maintenant **prévenu de ne pas faire de formule à vide** plutôt que de laisser un trou. **② Le prénom n'existait pas dans l'écran Profil.** Il ne se saisissait qu'à l'**inscription** — ou lors d'une restauration cloud quand le cloud ne le connaissait pas. Une fois cette étape passée, il était **invisible et impossible à corriger**. Champ « Prénom » ajouté **en tête de la carte identité**, pré-rempli, nettoyé (espaces retirés, 30 caractères max), enregistré par « Enregistrer le profil » comme les autres champs — et le libellé du menu se met à jour au passage (il restait « Athlète »). **🎓 Ce que ça dit** : le premier bug est invisible à l'usage — Milo *semble* juste un peu impersonnel, on ne se dit pas « il lui manque une donnée ». C'est la signature de R8, et la deuxième fois qu'on la croise. Tests : **62/62** (+6 : le champ existe · il est pré-rempli · Milo reçoit le prénom · on peut le corriger et Milo suit · le menu se met à jour · sans prénom, pas de formule à vide). Noyau dur 10/10. Fichiers : `coach.js`, `setup.js`, `index.html`, `tests/anneau/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v652. |

**ft-v651 — ✨ Du relief sur les traits et les figurines du check-in (demande Michel)** — *« j'aimerais bien un petit effet 3D quand même sur les traits et sur la petite figurine »*. **Pourquoi ça comptait** : les traits font **9 × 5 px**. À cette taille, un aplat de couleur ne paraît pas sobre, il paraît **plat et sale**. **Même méthode que l'anneau** : un dégradé sur l'**épaisseur** (clair en haut, sombre en bas) + une arête claire au sommet. Nouveauté utile : les traits **éteints** sont désormais **creusés** (ombre interne) au lieu d'être un simple gris — on lit le niveau même sans couleur. Les figurines reçoivent une **ombre portée** + un halo léger de leur propre couleur, et la tuile est légèrement **bombée**. **Aucun filtre exotique** : ce sont de simples ombres, sûres sur Safari iOS. Et un repli `@supports` pour `color-mix` — sans lui la déclaration saute et le trait allumé deviendrait **invisible** (leçon du calendrier, ft-v639). Le style quitte l'inline pour des **classes CSS** (`.ck-b` / `.ck-ico` / `.ck-tuile`), `--ck` portant la couleur — c'était devenu illisible en ligne. Tests : **56/56** (+2 : le relief est bien là · la figurine a son ombre). ⚠️ Un test a dû être adapté : il lisait le `style` **en ligne** des traits, qui n'existe plus. Fichiers : `style.css`, `screens.js`, `tests/anneau/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v651. |

**ft-v650 — 🧩 Le check-in replié passe en 3 TUILES (conception Michel)** — *« un petit lit en violet avec en dessous des traits de la même couleur, ensuite pour l'énergie un éclair orange, et le moral avec une petite tête — vert s'il est content, orange si c'est moyen, rouge si c'est pas bon »*. Le résumé en **texte** (« 😴 6h · ⚡ énergie · 😄 moral ») devient **trois tuiles** : icône + **4 traits de niveau** dans la couleur de l'icône + la valeur + le libellé. On lit son état **sans lire**. **⚠️ 4 traits et pas 5** — Michel en voulait cinq. **Vérification des données avant de dessiner** : les trois échelles de l'app ont **4 niveaux** (sommeil Mauvais→Excellent, énergie 😴→⚡, moral 😔→😄). Un 5ᵉ trait qui ne se remplit **jamais** donne l'impression qu'il manque toujours quelque chose. Montré en **maquette côte à côte** (4 vs 5) plutôt qu'expliqué → décision immédiate : *« si c'est le bordel tu restes à quatre »*. Passer à 5 aurait demandé d'ajouter un niveau aux trois échelles, ce qui touche l'historique et ce que Milo lit. **Le moral porte le sens par la COULEUR** (vert / ambre / rouge) **et** par la bouche du visage. **Ambre** et pas orange pour le niveau moyen : sinon il se confond avec l'éclair de l'énergie juste à côté. Rien noté → tuiles grises, tiret, invitation conservée. Une gêne signalée s'affiche dessous en ambre. **📣 Première application de la règle #11 amendée** : **pas de pop-up** — rien à faire pour en profiter, aucun repère déplacé (la carte est au même endroit, elle est juste plus lisible). Point rouge + aide `?` + aide détaillée : **oui**. C'est exactement le cas que la nuance visait. Tests : **54/54** (+5 : 3 tuiles · 4 traits chacune · les traits allumés suivent le niveau · aucune donnée → pas de plantage · pas de NaN). ⚠️ **Deux faux positifs dans mes propres tests** : `text-transform:uppercase` agit sur l'**affichage**, pas sur le texte réel — je cherchais « SOMMEIL » là où le code écrit « Sommeil ». Fichiers : `screens.js`, `constants.js`, `coach.js`, `tests/anneau/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v650. |

**ft-v649 — 🐞 Les erreurs sont enfin ENREGISTRÉES + la règle #11 amendée (bandeau rouge vu par Michel)** — Michel envoie une capture : le bandeau *« Erreur — si l'appli ne répond plus, rechargez la page »*. **Impossible à reproduire ici** (0 erreur sur les deux styles, menu ouvert, 4 scores). **Le vrai problème n'est pas l'erreur, c'est qu'on ne peut pas la connaître** : le gestionnaire global **signalait** sans rien **garder**. Le bandeau dit qu'il y a un problème, jamais lequel — donc une erreur qui n'arrive que sur le téléphone de quelqu'un est **indiagnosticable**. C'est exactement la famille « l'information n'atteint jamais l'endroit où elle servirait » (**R4**). **Livré** : les **8 dernières** erreurs (message, fichier, ligne, horodatage) sont gardées dans `ft4_errlog` — **promesses rejetées comprises** — et **lisibles dans Profil → 🔧 Admin → « 🐞 Dernières erreurs »** (rafraîchir / vider). **Rien n'est envoyé nulle part** : tout reste sur l'appareil. Vérifié en provoquant une vraie erreur : capturée, datée, affichée. **⚖️ Règle #11 amendée — décision de Michel** : *« il faut choisir les pop-up quand il y a un gros changement »*. La **pop-up se mérite** désormais : seulement si ① la personne doit **faire** quelque chose pour en profiter, ou ② un repère qu'elle **connaissait** a bougé ou disparu. Les points **2 à 5** (point rouge, aide `?`, aide détaillée, guide) restent **systématiques** — ils informent **sans interrompre**, et ce sont eux qui empêchent une fonctionnalité de devenir invisible (**R23**). Constat qui a déclenché la décision : **3 pop-ups en deux jours**, dont deux sur la **même carte**. *Le risque n'est pas le nombre, c'est l'accumulation.* Gravé dans `CLAUDE.md` **et** `docs/REGLES-OR.md`, cohérence vérifiée par `tools/check_regles.py`. Fichiers : `app.js`, `index.html`, `CLAUDE.md`, `docs/REGLES-OR.md`, `sw.js`, `clone/*`. sw.js ft-v649. |

**ft-v648 — 🩺 On peut FIGER le tracé du cœur (demande Michel)** — *« peut-être mettre une petite option pour éviter que l'ECG bouge »*. **Menu → Apparence → « 🩺 Figer le tracé du cœur »** (`S.ecgStill`, clé `ft4_ecgstill`). Le bouton **ne s'affiche qu'en style moniteur** — il n'a aucun sens ailleurs. **⚠️ Choix de conception** : figé = le tracé reste affiché **en entier**, immobile. Un ECG **absent** ferait croire à un bug ; un ECG **immobile** se lit comme un dessin. Le tap ne le relance pas non plus quand il est figé. Le réglage d'accessibilité « réduire les animations » continue de tout figer, indépendamment de ce choix. **Communication** : la nouveauté **v52** venait tout juste de sortir → on **complète son texte** et l'aide détaillée, plutôt que d'ajouter une 2ᵉ pop-up pour la même fonctionnalité (règle **R25** : la pop-up annonce, l'aide explique — et deux pop-ups pour un même sujet, c'est du bruit). Tests : **48/48** (+3 : plus d'animation quand c'est figé · le tracé reste **entier** et pas vide · le réglage bascule dans les deux sens et se retient). Fichiers : `state.js`, `style.css`, `screens.js`, `app.js`, `index.html`, `constants.js`, `coach.js`, `tests/anneau/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v648. |

**ft-v647 — 📐 La jauge du style Moniteur remonte au niveau de « AUJOURD'HUI » (retour Michel)** — *« le cercle faut le monter un peu, il arrive au même niveau que aujourd'hui tout en haut du cercle »*. Marge haute de **−26 px** sur `#rj` : en style moniteur la pastille « Récup … » a été retirée, donc **la place à droite de l'entête est libre** — la carte y gagne en équilibre **et** perd ~26 px de hauteur. **Mesuré, pas estimé** : écart de **0,0 px** entre le sommet du cercle et le libellé. Et **un test permanent mesure cet écart** (tolérance 2 px) plutôt que de figer une valeur en dur, qui se perdrait au premier réglage suivant — même logique que le rayon du point (ft-v645). `tests/anneau/runner.js` **45/45**. Fichiers : `screens.js`, `tests/anneau/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v647. |

**ft-v646 — 🐛 FIX URGENT : « NaN » s'affichait sur l'Accueil (signalé par Michel, capture à l'appui)** — **Une seule ligne.** En branchant les deux apparences (ft-v645), j'ai laissé un `+` en tête de la ligne qui ouvre le bloc de l'anneau, **à l'intérieur d'un ternaire**. Ce `+` n'est plus une concaténation : c'est un **plus unaire** appliqué à une chaîne → **NaN**. Double effet : « NaN » affiché **et** le conteneur en ligne perdu (l'anneau passait au-dessus du texte au lieu d'être à côté — visible sur sa capture). **⚠️ Le style touché était le DÉFAUT** : tout le monde le voyait, alors que le nouveau style, lui, fonctionnait parfaitement. **🎓 Pourquoi aucun de mes 36 tests ne l'a vu** — et c'est la vraie leçon : ils vérifiaient la **présence** des éléments (`#recup-ring` existe, le score est affiché, le point est aligné) mais **jamais que le texte affiché est propre**. Un test de présence passe très bien sur une carte qui affiche « NaN ». **Nouveau test permanent** : la carte ne doit contenir ni `NaN`, ni `undefined`, ni `[object`, dans les **deux** styles × **4** scores (0, 64, 100, aucun) = 8 cas. `tests/anneau/runner.js` **44/44**. Et un commentaire est posé au-dessus de la ligne piégeuse, parce que le motif reviendra. Fichiers : `screens.js`, `tests/anneau/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v646. |

**ft-v645 — 💚 Une DEUXIÈME apparence pour la carte récup, au choix dans Menu → Apparence (conception Michel)** — Michel dessine un autre visuel : *« on sort le chiffre du cercle, on le met à gauche… à droite le cercle mais pas entier, on retire 15 % en bas. Fond rouge et par-dessus un curseur vert avec un point à son extrémité. Au milieu un effet d'électrocardiogramme qui se dessine »*. **Décision structurante, de lui** : *« on garde celui qui est actuellement et tu le mets dans l'apparence »* → ce n'est **pas** un remplacement, c'est un **choix**. L'anneau reste le **défaut** ; personne ne voit le nouveau style sans l'avoir sélectionné. **Le style « moniteur »** : chiffre en gros à gauche + libellé de récup dessous en vert clair · cercle à droite, **ouvert de 15 % en bas** · fond **rouge** = ce qu'il reste à récupérer, curseur **vert** = ce qui est récupéré, point lumineux au bout · au centre un **vrai tracé d'ECG** (onde P, complexe QRS, onde T, deux battements) qui se dessine puis **s'efface dans le même sens** — c'est ce **balayage** qui fait « moniteur » et pas « animation ». Lent volontairement (5,5 s) : *un tracé rapide devient un gadget*. **⭐ Le piège, repéré par Michel sur la maquette** (*« fais gaffe le point est mal aligné »*) : en affinant le trait, le milieu de la bande se déplace — le point était **2,5 px trop à l'intérieur**. Il l'a vu à l'œil ; je l'ai ensuite **mesuré** (54,6 px contre un milieu de bande à 54,58). La formule est écrite dans le CSS **et** un test mesure l'écart à chaque version : *si on change l'épaisseur, il faut recalculer le rayon du point*. **6 allers-retours** avant validation (trait plus fin ×2 · relief et contraste · libellés au vert de l'anneau · écriture fine · ECG en continu et plus lent). **Aucun n'a été poussé en prod** : tout s'est joué sur des maquettes envoyées en capture, l'app n'a bougé qu'une fois le rendu validé. Mêmes contraintes techniques que l'anneau (masques **imbriqués**, jamais `mask-composite` · `--p` piloté en JS · relief de tube dans la même couche que la couleur · tout figé par « réduire les animations »). Tests : **`tests/anneau/runner.js` 36/36** (+12, dont : *le défaut ne change pour personne* · le cercle est bien ouvert · le point est **pile** au milieu · le réglage se retient). Noyau dur 10/10, calendrier 10/10. Checklist #11 **complète** : WHATS_NEW **v52** + red dot `recup-moniteur` + aide `?` Accueil + aide détaillée + **diapo du Guide** (capture générée depuis l'app, guide → **21 diapos**). Fichiers : `screens.js`, `style.css`, `app.js`, `state.js`, `index.html`, `constants.js`, `coach.js`, `guide/recup-moniteur.jpg`, `tests/anneau/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v645. |

**ft-v644 — 💡 Le gris passe au BLANC translucide + la lueur traverse aussi la partie grise (la suggestion de Michel était la bonne)** — *« le rendu est pas mal mais toujours rien dans le gris, pourquoi pas mettre un léger blanc dans cette partie grise »*. **Il avait raison, et sa phrase contenait le diagnostic.** **① La cause, enfin comprise (4ᵉ tentative)** : on dessinait le tour en **gris OPAQUE** (`var(--bg3)`, `#454B59`…) sur un fond sombre. Sur l'écran d'un iPhone, **gris sombre sur fond sombre = invisible**, quelle que soit la géométrie — c'est pour ça que les corrections de forme (ft-v640), de largeur (ft-v641) et de relief (ft-v643) n'ont jamais réglé le fond du problème. Le relief est désormais fait en **BLANC TRANSLUCIDE** (`rgba(255,255,255,.04 → .30 → .02)`) posé par-dessus `var(--bg3)` : le blanc ressort **toujours**, sur n'importe quel écran et à n'importe quelle luminosité. Règle gravée dans le CSS. **② Le gris était MORT** : la lueur tournante vivait **dans `#rr-arcwrap`**, donc elle était découpée par la part et ne passait **que** sur la couleur — le gris ne recevait jamais rien. Nouveau calque **`#rr-glint`** (même conique, même masque, même 5 s, opacité .22) sur l'anneau **entier** → la lueur traverse aussi le gris, en plus discret. Tests : **`tests/anneau/runner.js` 27/27** (la crête est bien blanche et ≥ .25 · la lueur passe aussi sur le gris). Noyau dur 10/10, calendrier 10/10. **🎓 La leçon, sur 4 rounds** : *« je ne vois pas le gris »* a eu **quatre** causes — un filtre SVG, une largeur, un empilement, et enfin le **choix de la couleur elle-même**. J'ai corrigé trois fois la mécanique avant de remettre en cause la **matière**. Et c'est l'utilisateur, pas moi, qui a nommé la vraie solution — *quand quelqu'un répète le même symptôme après trois correctifs différents, arrêter de raffiner et changer d'hypothèse*. Fichiers : `screens.js`, `style.css`, `tests/anneau/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v644. |

**ft-v643 — 🛢️ L'anneau devient un TUBE, le gris enfin visible sur iPhone, la lueur plus marquée (3 retours de Michel sur device)** — *« alors non pas de gris, et la lueur qui passe dans l'anneau n'est pas assez prononcée. Et le cercle est plat, j'aimerais que ça fasse comme un tube »*. **① Le tube** : le relief se fait avec un `radial-gradient` posé **dans la même couche** que la couleur — bord sombre → crête claire → bord sombre **sur l'épaisseur** de la bande. L'arc empile donc `radial-gradient` (le galbe) + `conic-gradient` (la teinte) dans un seul `background`. **Aucun filtre** : Safari iOS les rend mal sur ce type de forme (leçon ft-v640). **② Le gris invisible, 3ᵉ round** — et cette fois la cause n'était **ni** la géométrie (ft-v640) **ni** la largeur (ft-v641) mais le **contraste et l'empilement** : 3 calques (`#rr-groove` + `#rr-track` + un `::after`), dont un **pseudo-élément masqué à l'intérieur d'un parent lui-même masqué** — exactement le genre de superposition que Safari rend mal. Simplifié en **UN seul calque**, avec une crête franchement claire (`#454B59`). **Règle gravée dans le CSS** : en dessous de ce contraste, le tour disparaît sur un iPhone. **③ La lueur** : opacité **0,26 → 0,58**, bande plus large, tour en **5 s** au lieu de 6,5. Tests : **`tests/anneau/runner.js` 26/26** (+4 : le tour a bien un relief de tube · sa crête est assez claire pour un téléphone · la lueur est ≥ .45 · l'arc a le même galbe). Noyau dur 10/10, calendrier 10/10. **🎓 Ce que ces trois rounds enseignent** : le même symptôme (« je ne vois pas le gris ») avait **trois causes différentes** — un filtre SVG, une largeur, un contraste. À chaque fois mes captures d'ordinateur montraient quelque chose de correct. *Sur un rendu, seul l'écran de l'utilisateur fait foi ; l'ordinateur ne sert qu'à vérifier qu'on n'a rien cassé.* Fichiers : `screens.js`, `style.css`, `tests/anneau/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v643. |

**ft-v642 — 🌈 L'anneau passe en DÉGRADÉ CONIQUE : la couleur suit enfin le cercle (rouge 0 → vert 100)** — Suite directe de ft-v641, qui avait constaté la limite sans pouvoir la lever : un dégradé **SVG est linéaire**, il ne peut pas tourner avec l'arc. **`conic-gradient` est la seule technique où la couleur suit le cercle.** Michel avait demandé la maquette à une IA externe, qui a refusé (*« ça dépasse sa limite »*) → fait ici, à partir du prototype validé en capture la veille. **La recette, à ne pas « simplifier »** : deux masques **imbriqués** — le parent `#rr-arcwrap` découpe la **part** en `conic-gradient`, les enfants `#rr-arc`/`#rr-shine` creusent le **trou** en `radial-gradient` — surtout **pas `mask-composite`**, mal supporté sur Safari iOS ; **`--p` piloté en JS** par `ringReplay()` et non via `@property` (trop récent pour être sûr sur tous les iPhone) ; le tour gris reste **plus large** que l'arc pour que la boucle se lise partout. **⭐ Piège trouvé à l'écran** : un `drop-shadow` coloré sur un anneau masqué se projette **aussi vers l'intérieur** et remplissait le centre d'une **tache de couleur** — halo retiré, piège gravé dans `docs/DESIGN-KIT.md`. Tout le SVG disparaît (dasharray/offset, filtres `rrIn`/`rrGlow`/`rrSoft`, `rr-hi`, `rr-trav`). **Les deux animations demandées par Michel sont conservées** : remplissage au tap (le chiffre et l'arc sur la même courbe) et reflet qui **traverse** l'arc en boucle (6,5 s) — figés par « réduire les animations ». Tests **réécrits** pour la nouvelle technique : **`tests/anneau/runner.js` 22/22**, dont les **4 pièges Safari figés** (pas de `mask-composite`, pas de `@property`, pas de halo qui déborde, tour plus large que l'arc). ⚠️ **Les tests eux-mêmes ont donné 2 faux positifs** : ils cherchaient `mask-composite` et `@property` dans le CSS… et les trouvaient **dans les commentaires qui expliquent pourquoi on ne les utilise pas**. Corrigé en retirant les commentaires avant la recherche — *le piège du piège*. Noyau dur 10/10, calendrier 10/10. Fichiers : `screens.js`, `style.css`, `tests/anneau/runner.js`, `docs/DESIGN-KIT.md`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v642. |

**ft-v641 — 🎨 La couleur de l'anneau suit le score, ROUGE (0) → VERT (100) + le tour gris se lit sur 360° (retour Michel)** — *« le gris c'est bien mais ça ne fait pas la boucle en entier, et il n'y a pas de dégradé de couleur du rouge 0 à vert pour 100 »*. **① La couleur** : nouvelle échelle **continue** `_ringScale()` (4 repères interpolés en RGB) → **25 = rouge · 57 = ambre · 88 = vert**. Avant, la teinte venait des **paliers** de `getRecoveryInfo` : elle **sautait** d'une couleur à l'autre au lieu de glisser — d'où le « il n'y a pas de dégradé ». Le halo prend aussi la couleur du score. **⚠️ Limite assumée, écrite dans le code pour ne pas la redécouvrir** : un dégradé SVG est **linéaire**, il ne peut pas **tourner** avec l'arc. Vouloir le rouge au départ et le vert à l'arrivée du **même tracé** pose les couleurs de travers — essayé, capture à l'appui : le rouge tombait **en bas** de l'anneau, et en inversant le sens il tombait ailleurs. Un vrai dégradé **angulaire** demande de **découper l'arc en segments**, ce qui casse l'animation de remplissage au tap → chantier à part, pas en fin de soirée. Le dégradé le long de l'arc reste donc **court** (deux teintes voisines de l'échelle) pour la profondeur. **② La boucle** : le tour gris passe à **11,5** de large et l'arc coloré à **8** → le gris reste visible **tout autour**, y compris de part et d'autre de la couleur, donc le cercle se lit comme **complet partout** (avant, arc et tour avaient la même largeur : là où la couleur passait, le gris disparaissait sous elle). Tests : **`tests/anneau/runner.js` 24/24** (+6 : rouge en bas d'échelle · vert en haut · la teinte se déplace vraiment · valeurs aberrantes gérées sans planter · le tour reste plus large que l'arc · 0 erreur JS). Noyau dur 10/10, calendrier 10/10. Fichiers : `screens.js`, `tests/anneau/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v641. |

> ### ✅ OUVERT À TOUT LE MONDE depuis ft-v623 (ex-« réservé testeurs »)
> Réglage manuel des calories/macros · Objectif « Perte de gras + muscle » (recomposition) · « maxi » dans les reps · pointeur Journal — **ouverts à TOUS** le 27/07/2026 (décision Michel « tout pour tout le monde »). `_isNutriBeta()` (screens.js) = `return true;` (gardée en fonction pour ne pas chasser les usages). Annoncés via WHATS_NEW **v46/47/48** + red dots `reps-maxi`/`manual-kcal`/`goal-recomp`.
> **Ce qui RESTE réservé (statut, pas des features)** : carte dorée « Testeur Fondateur » + Espace testeur (`_isTester()`, `TESTER_EMAILS` : christophe/eline/emma/tanna) · suivi photos approfondi (`_isSuperTester()`) · outils de test clone-only (badge Gardien, questions illimitées).

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
