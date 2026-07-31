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
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache versionné `ft-vNN`, bumpé à chaque release (**actuel : `ft-v689`** — voir le journal des versions) |
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

> **Version actuelle : `ft-v689`** (prochaine : `ft-v690`). Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> **20** entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien
> supprimer). `python3 tools/check_regles.py` le signale automatiquement.

**GOUVERNANCE — ✂️ `CLAUDE.md` SCINDÉ EN DEUX : 33 000 → 10 300 mots (−69 %), sur une remarque venue de l'extérieur (28/07/2026, doc-only)** — **Le déclencheur** : en aidant une amie de Michel à cadrer un autre projet, une relecture extérieure a fait remarquer qu'un fichier de règles de 371 lignes relu à chaque session est **trop long pour être lu**. L'argument valait **bien plus pour nous** : notre `CLAUDE.md` faisait **33 007 mots**, dont **79 % de journal des versions** (83 entrées, alors que le fichier lui-même prescrivait d'archiver au-delà de 30). **Le principe, à retenir** : *une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle* — c'est le pendant de la « règle des règles » (une règle sans vérification est un souhait), appliqué à la **longueur**. C'est aussi **R20** (« le prompt est opérationnel, la doc est de la mémoire ») qu'on n'avait jamais appliqué à nous-mêmes. **Livré** : ① nouveau **`docs/REGLES-OR.md`** = les 12 règles d'or **en entier** (le pourquoi, les cas vécus) ; `CLAUDE.md` n'en garde qu'**une ligne chacune**, avec renvoi. ② **71 entrées de journal** (ft-v575→632) déménagées dans `docs/JOURNAL-ARCHIVE.md` — **rien supprimé**, coupé/collé dans l'ordre, sous un titre daté. `CLAUDE.md` garde les **12** plus récentes. ③ nouveau **`tools/check_regles.py`** : vérifie que les deux fichiers portent les mêmes règles, que chaque ligne courte renvoie bien vers la longue, **et** que le journal récent ne dépasse pas 20 entrées (le seuil se rappelle tout seul, au lieu d'être une phrase qu'on ignore). **Garde-fou posé exprès** : le risque d'un fichier scindé, c'est que le *pourquoi* cesse d'être lu — et *une règle dont on a oublié la raison finit toujours par être contournée*. D'où les renvois systématiques, et le rappel que le pourquoi vraiment critique vit **dans le code**, au-dessus de ce qu'il protège (R27). **Vérifié** : aucune des 83 entrées perdue (contrôle automatique avant/après), les 12 règles présentes des deux côtés, l'import `@docs/REGLES-ARCHITECTURE.md` et toutes les sections techniques intacts. Noyau dur 10/10. Rollback : `git reset --hard avant-scission-claude-md`. Doc-only, aucun impact appli, **pas de bump sw.js**. Fichiers : `CLAUDE.md`, `docs/REGLES-OR.md` (nouveau), `docs/JOURNAL-ARCHIVE.md`, `tools/check_regles.py` (nouveau). |

**ft-v689 — 📚 L'HISTORIQUE DES BILANS ENFIN TROUVABLE (retour Michel : « j'ai fait 2 bilans, je suis bien en 688, et je ne trouve pas l'historique »)** — Le bouton Historique livré en ft-v688 **existait**… mais il vivait DANS le bilan rappelé, qui s'affiche **sous les 4 grandes cases photos** — un écran de téléphone entier plus bas. Personne ne fait défiler un écran de prise de photos pour chercher un historique : *une fonctionnalité qu'on ne peut pas voir n'existe pas* (le cousin UX de R23). **Livré** : ① un bouton **« 📚 Mes bilans précédents — N bilans »** tout en **HAUT** de la fenêtre Étude du corps, visible dès l'ouverture, avec la mention *(le dernier est affiché plus bas)* ; ② ouvrir l'historique fait **défiler l'écran** jusqu'à la liste (elle aussi se dessinait hors de vue) ; ③ **filet de sécurité** : si `bodyStudy` (dernier bilan) a été perdu mais que `bodyStudies` (historique) existe, le plus récent est **rappelé quand même** — avant, le bouton Historique devenait carrément inaccessible dans ce cas. **Vérifié en vrai navigateur** (2 captures : le bouton en haut à l'ouverture, la liste après le tap). Tests : **`tests/parcours/runner.js` 80/80** (+3 : bouton en haut avec le compte de bilans · rappel malgré bodyStudy perdu · aucun bilan → pas de bouton). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : plantage (la livraison serait bloquée). Les 11 familles vertes. **Pas de pop-up** (correctif d'ergonomie). Fichiers : `index.html`, `setup.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v689. |
**ft-v688 — 📸 L'Espace testeur se recentre sur la boîte à idées (capture Michel : « ça n'a plus lieu d'être, et d'ailleurs on n'a pas l'historique des analyses photos »)** — En testant la boîte à idées avec son compte (ft-v687), Michel tombe sur la carte « Analyse approfondie de tes photos — **en avant-première rien que pour toi** » : un discours d'avant, quand le suivi photos était une exclusivité testeur — depuis, l'**Étude du corps 4 photos existe pour tout le monde en Premium** (ft-v681/682), la carte était un vestige. **Livré (décisions Michel via 2 questions)** : ① la carte **retirée** de l'Espace testeur, qui ne garde que la **boîte à idées** ; ② le **suivi photos** des super testeurs (Christophe, Emma, Michel — séries de 4 photos, 4/mois, comparaison d'évolution) déménage dans le **menu photos du Profil**, à côté d'« Étude du corps » et « Morphologie » — **sans porte Premium** (c'est un statut, pas un produit) ; ③ l'**historique de l'Étude du corps** apparaît **dès le premier bilan** (avant : à partir de 2 — avec un seul bilan, aucun accès, c'était le « on n'a pas l'historique » de Michel) + singulier/pluriel du libellé. Fonction morte `_openTesterPhotoAnalysis` retirée avec sa carte. Tests : **`tests/parcours/runner.js` 77/77** (+3 : carte disparue mais boîte à idées intacte · l'entrée du menu photos réservée super testeurs · historique dès 1 bilan). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : 4 rouges. Les 11 familles vertes. Fichiers : `app.js`, `setup.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v688. |
**ft-v687 — 🧪 Michel entre dans `TESTER_EMAILS` (« je peux essayer avec mon compte, moi aussi je suis testeur »)** — En fait non : son email n'y était **pas** (la liste ne contenait que Christophe, Eline, Emma, Tatiana) — son compte ne voyait ni l'Espace testeur ni la boîte à idées. Ajouté, pour qu'il puisse **tester lui-même la chaîne d'envoi de mail** de la boîte à idées (diagnostic du message de Christophe jamais reçu — durcissement backend @auto 31/07 : mail vers les 2 boîtes + échecs tracés `MAIL_FAILS` + route `mailFails`). **Effet de bord assumé, écrit dans le code** : son Accueil affiche la carte « Testeur Fondateur » et les pop-ups testeurs se montreront une fois chacune. Les 11 familles vertes (aucun test ne fige la composition de la liste — c'est une donnée, pas un comportement). Fichiers : `constants.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v687. |
**ft-v686 — 🔎 LA CHASSE AUX BUGS pendant la séance de Michel (« cherche des bugs, revérifie bien les exercices, je pense qu'il y en a d'autres comme celui d'Eline »)** — Audit systématique en 3 volets, il avait raison sur les trois. **① 6 exercices remis dans la bonne catégorie** (re-vérification des 249, en appelant les VRAIES fonctions) : `Leg Curl Haltère` était un **biceps** (« curl halter » l'attrapait — figurine des bras pour un exo d'ischios, et MET 4 au lieu de 6,5) · `Rotation Externe Épaule Abduction` était classée **fessiers** (le mot « abduction ») · `Tirage Vertical (Upright Row)` était un **tirage dorsal** (c'est une élévation épaules/trapèzes) · `Jefferson Curl` était un **biceps** (mobilité lombaires/ischios) · les 3 **kickbacks fessiers** avaient le schéma *extension de triceps* · `Tirage Incliné Poulie Haute` était une **poussée** (le kw « incline »). Toujours LA même maladie — règle générique avant la précise — et la mesure avant/après a même attrapé 2 dégâts collatéraux de mes propres correctifs (`\brow\b` attrapait « Upright ROW » ; le stemming réduit « triceps » en « tricep »). **Bilan mesuré : 11 changements sur 249, tous voulus, zéro collatéral.** **② La famille du bug d'Eline étendue** : la masse grasse en kg et le % de gras se **déduisent l'un de l'autre** quand le poids est lu (beaucoup de balances n'affichent que l'un des deux) — repli déterministe au backend ET migration des anciens bilans, dans l'ordre qui fait aboutir la chaîne (% → kg → masse maigre). Valeurs lues jamais recalculées. **③ 3 VIEUX PRIX encore en prod** (échappés au balayage ft-v684) : le mur des **combinaisons de suppléments** (app.js), l'aide du Coach et la note du plan de repas affichaient encore « 4,99 €/2 mois » → 6,99 €/mois, et le mur des combos ouvre désormais la **fiche Premium** (cohérent ft-v680). Test structurel : plus AUCUN « 4,99 »/« 2 mois » dans tout le frontend. **④ 5 fonctions suppléments définies 2 FOIS dans app.js** (renderSupplements, renderCreatine, renderWhey, setCreatPhase, updateProteinBar) — le 1er jeu était **mort**, écrasé en silence par le 2ᵉ : on aurait édité la version fantôme sans effet. Retirées (comportement inchangé par construction). Au passage : 705 ID HTML tous uniques, les 247 handlers de boutons pointent tous vers une fonction existante, registre des overlays sain. Tests : **muscles 60/60** (+10, chaque correction figée avec son témoin) · **calculs 95/95** (+4, chaîne % ↔ kg) · **parcours 73/73** (+1 structurel anti-vieux-prix). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : 11 rouges. Les 11 familles vertes. Fichiers : `log.js`, `state.js`, `app.js`, `screens.js`, `Code.js`, `tests/muscles/runner.js`, `tests/calculs/runner.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v686. |
**ft-v685 — 💶 L'essai passe à 1,99 € (retour Michel depuis la salle : « sur Ko-fi on peut pas payer 0,99 € »)** — Ko-fi a un montant minimum : le 0,99 € affiché en ft-v684 était **impayable**. Prix d'essai choisi par Michel : **1,99 €** (3 jours). **Livré** : les 3 affichages corrigés (mur du Coach, fiche Premium, aide détaillée du Coach). **Aucun changement backend** : le seuil Ko-fi (≥0,90 € → 3 jours) acceptait déjà 1,99 € tel quel — seuls les commentaires de Code.js sont mis à jour. Tests : **`tests/parcours/runner.js` 72/72** (+1 : la fiche doit afficher 1,99 et ne plus contenir 0,99 — contrôle négatif vérifié : l'ancien affichage rend le test rouge). Les 11 familles vertes. ⚠️ Rappel inchangé : les boutons de paiement (1,99 · 6,99 · 34,99) se créent sur la page Ko-fi de Michel, pas dans le code. Fichiers : `index.html`, `coach.js`, `Code.js` (commentaires), `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v685. |
**ft-v684 — 💶 NOUVEAUX TARIFS : 6,99 €/mois · 34,99 €/6 mois (−17 %) · essai 3 jours à 0,99 € (décisions Michel en rafale : « 4,99 € pour 2 mois c'est pas un peu léger ? » → « change pour 4,99 par mois » → « 1 an c'est trop long, 6 mois max » → « on peut passer à 6,99 » → « et peut-être une offre test ? »)** — Le prix affiché passe de 4,99 €/2 mois à **6,99 €/mois**, avec une formule **6 mois à 34,99 €** (−17 % vs 6×6,99) et un **essai 3 jours à 0,99 €**. **⭐ Découverte R23 au passage** : le palier d'essai Ko-fi **existait déjà au backend** (un petit montant donnait déjà quelques jours) mais n'était affiché **nulle part** — une offre d'essai que personne ne pouvait connaître n'existe pas. Désormais visible sur le mur du Coach ET la fiche Menu → Premium. **Livré** : ① les **4 affichages de prix** (mur du Coach, 2 mini-murs nutrition/historique, fiche Premium) passent à 6,99 €/mois — plus aucun « 2 mois » nulle part (test qui l'interdit) ; ② la fiche et le mur affichent la formule 6 mois et l'essai ; ③ l'aide détaillée Premium alignée ; ④ **Code.js — barème Ko-fi ré-aligné** : ≥30 € → 184 jours (semestriel) · ≥4 € → 31 jours (mensuel — un ancien lien 4,99 donne toujours son mois, personne n'est piégé) · ≥0,90 € → 3 jours (essai). **Les accès déjà accordés gardent leur échéance** (le webhook ne révoque jamais, il ne fait qu'accorder). **⚠️ Deux choses qui restent chez Michel** : sa **page Ko-fi** doit proposer les nouveaux montants (le webhook ne fait que convertir un montant reçu en durée — les boutons de paiement, c'est son compte Ko-fi) ; et le **repère-prix bouge** pour qui avait vu 4,99 €/2 mois — pas de pop-up (une modif de prix s'annonce à sa discrétion, pas par un correctif automatique). Tests : **`tests/parcours/runner.js` 71/71** (le test du prix exige 6,99 + « / mois » + la formule 6 mois, et **refuse** « 2 mois »). Les 11 familles vertes. Fichiers : `index.html`, `coach.js`, `Code.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v684. |
**ft-v683 — 💰 LE CACHE DE PROMPT : la facture de Milo divisée par ~3 en conversation (« optimisation à fond », go de Michel après le calcul de rentabilité)** — **Le déclencheur** : sa question *« un gros utilisateur me coûte combien ? »*. Réponse honnête : ~6 centimes la question (le contexte de ~46 000 caractères, **refacturé intégralement à CHAQUE message**, sur Sonnet — le défaut depuis le 26/07, c'est là que « ça a augmenté ») → un profil 10 questions/jour coûtait ~12 €/2 mois pour 4,99 € payés. **Livré** : ① coach.js — l'**heure** et le **score de récup** (ce qui change à chaque message) déménagent **en fin de briefing** sous le marqueur *« ═══ SITUATION DE L'INSTANT ═══ »* (doublé d'un avertissement écrit dans le prompt même : ne jamais rien insérer de variable au-dessus, sinon le cache saute en silence). Tout ce qui précède est **stable** — garanti par test : **contexte identique à l'octet près à 8 minutes d'écart**. ② worker.js — découpe sur le marqueur, `cache_control ephemeral` sur le bloc stable (+ la mémoire) → facturé **~10× moins cher dès la 2ᵉ question** d'une conversation (fenêtre ~5 min glissante). Une question passe de ~6 à ~1,5-2 centimes en conversation ; le gros utilisateur redevient **rentable**. Ancienne appli sans marqueur → comportement d'origine (rien ne casse). ③ Au passage, la **QUESTION GUIDÉE** (réponses rapides tappables — demande du jour de Michel « des questions avec des choix comme un coach ferait ») **existait déjà en prod** (ft-v585→590, aide + annonce comprises — une fonctionnalité invisible de plus, R23) mais Milo était timide (*« tu PEUX »*) → consigne renforcée : **par défaut** sur les questions factuelles. ⚠️ L'effet réel du cache se lira sur la **facture Anthropic** de Michel (mon environnement ne peut pas appeler l'API) ; l'effet « réponses rapides plus fréquentes » se validera à l'usage. Tests : **`tests/calendrier-milo/runner.js` 24/24** (+5). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : 5 rouges. Les 11 familles vertes. Fichiers : `coach.js`, `worker.js`, `tests/calendrier-milo/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v683. |
**ft-v682 — 🔐 LES 3 PORTES PREMIUM (décisions Michel : « programmes oui et non… faut mettre une limite » · « la pesée 2 gratuits » · « la prise de sang pour tout le monde mais analyse premium »)** — Sa question déclencheuse : *« ça utilise ma clé API ? »* — **oui**, l'import de programme comme la pesée photo passent par la lecture IA. **Livré** : ① **PROGRAMMES** — 2 imports IA gratuits puis Premium (créer/éditer **à la main** reste gratuit et illimité) ; nouveau compteur `S.progImports`, persisté ET synchronisé cloud (toute la chaîne : state.js → setup.js → Code.js, sur le modèle de `histImports`). ② **PESÉE PHOTO** — 2 lectures gratuites (au lieu de 10) puis Premium — et **le Premium lève enfin la limite** : avant, même un abonné était plafonné à 10 sans que personne ne l'ait décidé. La saisie à la main et le code restent gratuits (ils ne coûtent rien). ③ **PRISE DE SANG** — la carte devient **visible par tout le monde** (fin de la bêta à 2 emails, `_isBloodBeta` gardée en fonction comme `_isNutriBeta`) ; l'**analyse IA** est réservée Premium — la porte est posée sur `_analyzeBloodRedacted`, après le masquage d'identité. **Chaque porte ouvre la fiche Premium** (pas un mur sec). `PREMIUM_PERKS` passe à **15 avantages**. Point rouge `blood-for-all`. **⚠️ Repère qui bouge, à savoir** : un compte gratuit qui avait déjà consommé 3 à 10 lectures pesée se retrouve au-dessus de la nouvelle limite — message doux + la saisie main reste ouverte. Le garde-fou des données a exigé de classer `progImports` (R4a — c'est exactement son travail). Tests : **`tests/parcours/runner.js` 71/71** (+8 : le Premium lève la limite pesée · un gratuit reste limité · la prise de sang visible par tous · compteur persisté · 4 vérifications structurelles des portes). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : 8 rouges. Les 11 familles vertes. Fichiers : `log.js`, `tracking.js`, `state.js`, `setup.js`, `constants.js`, `Code.js`, `tests/parcours/runner.js`, `tests/donnees/donnees-milo.json`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v682. |
**ft-v681 — ⭐ La VRAIE liste des avantages Premium (retour Michel : « il manque des trucs et pas qu'un peu »)** — Le mur du Coach listait **5 avantages en dur** pendant que le vrai périmètre Premium en comptait **12** — encore la maladie des deux listes : le texte avait divergé de la réalité du code (**R2**). **Livré** : ① **`PREMIUM_PERKS`** (constants.js) = **source unique**, construite en vérifiant **porte par porte** dans le code (chaque ligne correspond à un vrai verrou `S.premium` — règle écrite en tête de la liste : on n'y ajoute RIEN qui ne soit réellement réservé) ; ② le **mur du Coach** ET la **fiche Menu → Premium** se remplissent depuis cette liste (`_renderPremiumPerks`) — plus jamais deux versions. **Les manquants ajoutés** : le récap de chaque séance par Milo · l'**étude du corps 4 photos** · l'analyse IA des programmes importés · la **nutrition IA en illimité** (étiquette en photo, repas estimé en une phrase, plan de repas) · les combinaisons d'aliments · l'import de journal en illimité · le questionnaire avancé + la question de la semaine. **⏳ Trois demandes de Michel PAS encore dans la liste, exprès** — elles ne sont **pas réservées Premium** dans le code aujourd'hui : les **programmes en illimité** (l'import est ouvert à tous), la **pesée photo** (bilan corporel, ouverte à tous), la **prise de sang** (en bêta, 2 personnes seulement). Les afficher aurait été une **promesse fausse** — à décider avec Michel : les verrouiller Premium, ou les laisser ouvertes. Tests : **`tests/parcours/runner.js` 63/63** (+2 : fiche et mur = `PREMIUM_PERKS` au complet · les manques signalés y sont). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : plantage. Les 11 familles vertes. Fichiers : `constants.js`, `index.html`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v681. |
**ft-v680 — ⭐ LE PREMIUM DEVIENT VISIBLE (demande Michel : « pourquoi prendre le premium, et une ligne dans le menu sous le profil »)** — Avant, on ne découvrait le Premium qu'en **se cognant au mur de quota** dans le Coach : rien ne le présentait, nulle part. **Livré** : ① une **ligne ⭐ Premium dorée** dans le Menu, juste **sous le profil**, avec un sous-titre d'état (*« Milo en illimité — découvre pourquoi »* / *« Actif ✓ »*) ; ② une **fiche complète** : le pourquoi (*l'appli est gratuite et le restera ; le Premium débloque Milo en illimité ; 10 questions offertes pour l'essayer*), les **5 avantages** repris du mur existant (**R13** — rien réinventé), le prix **4,99 €/2 mois**, le bouton contact **et** l'activation d'un code (`activatePremium` accepte maintenant l'id du champ — le mur du Coach inchangé) ; **déjà Premium** → bandeau vert « Ton Premium est actif » (échéance ou « accès à vie »), l'appel à l'action disparaît. **③ La capture de vérification a révélé une SURPRISE** : une ancienne bannière « Coach IA Premium » existait déjà **plus bas dans le même Menu** (elle envoyait vers le Coach) — personne ne l'avait en tête, ni Michel ni moi. **Retirée** : deux portes Premium dans un même menu = un doublon qui divergera (**R2**) ; les 2 endroits de `setup.js` qui la montraient/cachaient sont rebranchés sur la fiche. Point rouge `NEW_FEATURES` (`premium-menu`). Tests : **`tests/parcours/runner.js` 61/61** (+6 : la ligne existe · l'ancienne bannière a DISPARU · la fiche vend quand on n'est pas Premium · elle dit « actif » et masque l'appel à l'action quand on l'est · le sous-titre du Menu suit). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : plantage. Les 11 familles vertes. Fichiers : `index.html`, `coach.js`, `constants.js`, `setup.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v680. |
**ft-v679 — 📣 ANNONCES CIBLÉES : la boîte à idées répond à ceux qui l'ont remplie (demande Michel : « envoie à Christophe et Eline seulement »)** — Deux pop-ups **perso** au démarrage, une seule fois chacune, que **personne d'autre** ne voit : **Christophe** → son idée *« se déplacer de gauche à droite pour voir les jours »* est **livrée** (flèches ‹ › + glissement dans la fenêtre de pesée, ft-v676) ; **Eline** → sa **masse maigre** est réglée **sans rien refaire** (ft-v677), + la navigation au passage. **Réutilise le mécanisme existant des pop-ups testeurs (R13)** : marqueur localStorage une-fois, inscription dans `_OVERLAY_CLOSERS` (**R15** — fermer au doigt pose le marqueur, sinon la pop-up reviendrait en boucle), ajout à la liste `busy`. **Aucun chiffre personnel dans le code** (le dépôt est public — la pop-up d'Eline dit « c'est réglé », pas ses valeurs). **La boucle de la boîte à idées se referme** : idée → triée → livrée → **la personne est prévenue que SON idée a été entendue** — c'est ça qui fait qu'on continue de remplir une boîte. Tests : **`tests/parcours/runner.js` 55/55** (+6 : un utilisateur lambda ne voit RIEN · chacun voit LA SIENNE et pas celle de l'autre · une seule fois chacune · R15 vérifié structurellement). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : plantage. Les 11 familles vertes. Fichiers : `index.html`, `app.js`, `screens.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v679. |
**ft-v678 — 📮 ANTI DOUBLE-ENVOI de la boîte à idées (trouvé EN LISANT la boîte)** — En triant les 17 idées, deux de Christophe étaient parties **en double** (taps à 2 s et 18 s d'écart) : pendant le redimensionnement des photos + l'envoi réseau (1-2 s), un deuxième tap **relançait tout**. **Livré** : un verrou `_sendingIdea` — un envoi en cours → toast *« Envoi déjà en cours… »* ; et le verrou **saute toujours** (`finally`), même si l'envoi plante — sinon un échec réseau aurait rendu la boîte muette jusqu'au rechargement. Tests : **`tests/parcours/runner.js` 49/49** (+2 : un double-tap = **UN** envoi · le verrou retombe et un envoi voulu ensuite passe normalement). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : 2 rouges (le double-tap produisait bien 2 envois). Les 11 familles vertes. **Pas de pop-up** (correctif invisible). Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v678. |
**ft-v677 — 🧮 La MASSE MAIGRE calculée aussi sur les ANCIENS bilans (décision Michel : « si on peut le faire par calcul, pourquoi pas le faire de suite et sur les anciennes pesées »)** — Le repli déterministe posé au backend le matin même (leanMass = poids − masse grasse quand le lecteur IA la rate) ne servait qu'aux **nouveaux** imports — Eline aurait dû réimporter sa photo. **Livré** : une **migration au chargement** (state.js, à côté des autres migrations) complète les bilans corporels **déjà en stock** avec la même formule. **Garde-fous écrits dans le code** : une masse maigre déjà **lue** n'est **jamais** écrasée (la réalité mesurée prime sur un calcul) ; sans poids ou masse grasse, on n'invente **rien**. Frontend et backend portent désormais la **même règle aux deux bouts** — un vieux bilan et un nouvel import donnent le même résultat. Tests : **`tests/calculs/runner.js` 91/91** (+3 : le bilan d'Eline calculé à 37.8 · valeur lue jamais écrasée · donnée manquante → rien d'inventé). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : 2 rouges. Les 11 familles vertes. **Pas de pop-up** (la donnée apparaît, rien à faire). Fichiers : `state.js`, `tests/calculs/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v677. |
**ft-v676 — ⚖️ NAVIGUER ENTRE LES PESÉES (1ʳᵉ idée livrée de la boîte à idées ouverte le 30/07, go de Michel : « Vas y go »)** — **L'idée de Christophe** (29/07, avec sa capture de la fenêtre « Modifier la pesée ») : *« pouvoir se déplacer de gauche à droite et inversement pour voir les jours suivants ou précédents »* — sans la photo, l'idée était illisible ; avec elle, limpide : naviguer d'une pesée à l'autre **sans rouvrir le graphique** à chaque fois. **Livré** : flèches **‹ ›** de part et d'autre du titre + **glissement gauche/droite** dans la fenêtre, compteur *« Pesée 12 sur 42 »*, flèches éteintes en bout d'historique. Glisser vers la **droite** = remonter vers la pesée plus **ancienne**. **⚠️ Deux pièges traités d'emblée** : ① le glissement doit être **franc et bien horizontal** (seuil 60 px + rapport 2:1) pour ne pas voler le **glisser-fermer vertical** de la modale ; ② naviguer **charge** la pesée visée — une modif non enregistrée est abandonnée, « Enregistrer » reste un geste **explicite** (les flèches servent à CONSULTER). Aide `?` de Progrès mise à jour (règle #11 : l'aide explique ; **pas de pop-up** — rien à faire pour en profiter, aucun repère déplacé, à annoncer si Michel le souhaite). Au passage de la même boîte : le **fix leanMass d'Eline** est parti en backend (@auto 30/07) — avec une **rechute du piège `.claspignore`** au passage (`tools/exercices-muscles.js` non ignoré → push backend KO, vu parce qu'on vérifie CHAQUE run — R18 ; `tools/**` ignoré, leçon re-gravée dans Code.js). Tests : **`tests/parcours/runner.js` 47/47** (+7 : pré-remplissage · compteur · ‹ › · butoirs · glissement horizontal · le glissement VERTICAL ne navigue pas). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : plantage (la livraison serait bloquée). Les 11 familles vertes. Fichiers : `index.html`, `tracking.js`, `screens.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v676. |
**ft-v675 — 🗓️ SÉANCE FAITE ≠ SÉANCE PRÉPARÉE (capture Michel : « matte ça petit beug »)** — Milo écrit *« Ta séance d'hier, pour rappel »* … et liste la séance **préparée la veille pour aujourd'hui** (haut du corps) — jamais faite. La vraie dernière séance était **mardi** (bas du corps), et hier était un **repos**. **Le diagnostic dans l'ordre de R7** : ① structurel ? non — les **données étaient justes** (dates + jours des séances ft-v660, calendrier ft-v658, et Milo s'est d'ailleurs **bien rattrapé** quand Michel l'a repris : *« la séance qu'on avait préparée hier pour aujourd'hui… hier c'était repos »*) ; ② hiérarchie ? non ; ③ donc le **prompt**, le dernier levier — et pour une fois c'est le bon : c'est une confusion de **vocabulaire** entre une séance *discutée en conversation* et une séance *enregistrée dans l'historique*. **Livré** : une règle collée directement à la liste `DERNIÈRES SÉANCES` du contexte — *ces séances sont les seules réellement FAITES ; une séance seulement préparée/discutée ne s'appelle JAMAIS « ta séance d'hier » (dire « la séance qu'on a préparée ») ; un jour sans séance listée = REPOS, à dire tel quel* — avec le cas réel du 30/07 cité dedans. Placée **à côté de la donnée qu'elle encadre** plutôt que dans le pavé de consignes générales (les règles collées à leur donnée survivent mieux au « régime du prompt » à venir). Tests : **`tests/calendrier-milo/runner.js` 19/19** (+1). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : 1 rouge. Les 11 familles vertes. **Pas de pop-up** (correctif). Fichiers : `coach.js`, `tests/calendrier-milo/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v675. |
**ft-v674 — ✳️ Les ÉTOILES BRUTES disparaissent du chat de Milo (2ᵉ capture de la journée)** — Dans la séance proposée par Milo : *« Développé militaire haltères — 3×10 \*(coudes légèrement devant, pas derrière les oreilles)\* »* — les **astérisques s'affichaient telles quelles**. **La cause** : le rendu du chat convertit le **gras** markdown (`**…**`) depuis toujours, mais pas l'**italique** (`*…*`) — que Milo emploie précisément pour ses consignes techniques. Personne ne l'avait vu parce que Milo utilisait surtout le gras ; les consignes d'exercice (ft-v628) ont généralisé l'italique. **Livré** : ① conversion `*…*` → italique dans `renderCoachMsg`, avec la règle markdown **stricte** (un caractère non-espace collé à chaque étoile) → *« 3 \* 5 \* 2 »*, une vraie multiplication espacée, **reste intacte** ; ② `_coachPlain` (partage/PDF) retire aussi ces étoiles. **Vérifié en vrai navigateur avant de livrer** : italique rendu, gras conservé, multiplication intacte, partage propre. Tests : **`tests/discussions/runner.js` 22/22** (+4). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : 2 rouges. Les 11 familles vertes. **Pas de pop-up** (correctif d'affichage). Fichiers : `coach.js`, `tests/discussions/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v674. |
**ft-v673 — 🕊️ L'ÉCARTÉ BUSTE PENCHÉ n'est plus un exercice de PECTORAUX (capture de la fille de Michel, en pleine séance : « ya pas un soucis ? » — si.)** — Sa fille crée un exercice perso **« Écarté Haltères Buste Penché »** (un oiseau : arrière d'épaule / haut du dos) → l'app affiche la **figurine des pectoraux**. **La cause, la même maladie que « poigneT BARre »** : la règle de famille « ecarte → pec » (le rattrapage de ft-v667) attrapait TOUS les écartés, et la règle « oiseau » placée **après** elle était morte — une règle précise derrière une générique ne gagne jamais. **⚠️ Mesuré sur tout le catalogue AVANT de corriger** (le rituel de ft-v666 : *tester des archétypes n'est pas tester le catalogue*) : **exactement 2 exercices changent, les 2 dans le bon sens** — l'exercice perso de la capture, ET **« Écarté Arrière Élastique »** (exercice du catalogue, faux **depuis toujours** — personne ne regarde la figurine d'un écarté arrière). Zéro dégât collatéral, vérifié nom par nom sur les 250. **Livré** : ① règle précise *« écarté/fly + penché/arrière/inverse = OISEAU (arrière d'épaule) »* placée **AVANT** les règles pec dans `_MEX`, avec le pourquoi écrit au-dessus ; ② même garde dans `_movPattern` — le mot-clé « ecarte » de la poussée horizontale l'attrapait aussi, donc **Milo** aurait cru à une poussée pectorale (les mots-clés simples ne savent pas dire « un mot au milieu » : « Écarté *Haltères* Buste Penché » échappe à toute adjacence). **Témoins figés** : l'Écarté Haltères couché **RESTE** des pectoraux, l'Oiseau garde son schéma d'élévation d'épaule. **🎓 La leçon, 3ᵉ occurrence en une semaine** : *une règle générique sans exclusions attrape toujours un cas qu'elle ne devait pas* — poignet-barre (ft-v669), wall-sit/épaule (ft-v670), écarté penché (ici). Le remède est TOUJOURS le même : la règle précise passe DEVANT, et deux témoins figent les deux côtés. Tests : **`tests/muscles/runner.js` 50/50** (+5). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : 3 rouges. Les 11 familles vertes. **Pas de pop-up** (correctif). Fichiers : `log.js`, `tests/muscles/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v673. |
**ft-v672 — 🚴 L'« AUTRE SPORT » DESCEND ENFIN DANS LES CHIFFRES (point 2 de l'audit, go de Michel : « OK bah fais le point numéro deux »)** — **Le constat de l'audit** : l'aide promettait *« un autre sport change ta récupération ET ta dépense d'énergie (donc tes calories) »* — vérifié en croisé, **aucun chiffre ne bougeait**. La réponse (vélo, course, foot…) n'atteignait que le texte de Milo. C'est **R4** au sens strict : l'information restait dans le TEXTE au lieu de descendre dans la DONNÉE. **Livré, en deux moitiés honnêtes** : **① les CALORIES descendent** — un autre sport déclaré ajoute **+150 kcal/j** au TDEE (`calcSportExtra()`, state.js) : moyenne prudente d'une pratique loisir ~2-3 fois/semaine, soit une **demi-marche** du multiplicateur d'activité (~310 kcal). **⚠️ Anti-double-comptage réfléchi avant de coder** : le niveau d'activité du profil compte des *jours d'entraînement par semaine* (« Modéré (3-4j) », « Actif (5-6j) »…) — à « Actif » ou « Très actif », l'autre sport est **déjà dans le multiplicateur** → +0, écrit noir sur blanc dans le code. **② la RÉCUP ne reçoit VOLONTAIREMENT aucun malus** : l'app ne sait pas **QUAND** la personne pratique son vélo — un malus permanent serait une fatigue **inventée** (*ne jamais faire semblant de savoir*, Principe 18 · R29 : le droit de deviner dépend du coût de l'erreur). C'est **Milo** qui adapte ses conseils, et son contexte lui précise désormais que le surcoût est **DÉJÀ compté** dans les besoins caloriques — sinon il aurait conseillé d'ajouter des calories une **deuxième** fois (le bug qu'on venait de corriger, recréé chez Milo). L'aide `?` et le toast disent maintenant **exactement** ce qui se passe (la pop-up d'époque, elle, reste dans l'historique). **⚠️ Repère qui bouge à signaler** : pour qui a déclaré un autre sport avec une activité ≤ Modéré, l'objectif calories affiché monte de 150 — à annoncer ou pas, décision Michel. Tests : **`tests/calculs/runner.js` 88/88** (+3 : +150 · « Très actif » → +0 · « aucun » → +0) · **`tests/parcours/runner.js` 40/40** — le constat R4 de l'audit y devient une **exigence** (l'ancien comportement ferait échouer la livraison). **VÉRIFIÉ CONTRE L'ANCIEN CODE** : 1 rouge. Les 11 familles vertes. Fichiers : `state.js`, `coach.js`, `screens.js`, `tracking.js`, `tests/calculs/runner.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v672. |
**GOUVERNANCE — 🛡️ LE GARDE-FOU DES DONNÉES + ce qu'on a mesuré du contexte de Milo (28/07/2026, parti d'une intuition de Michel, doc + tests)** — **Le déclencheur** : après le bug du prénom (ft-v652), Michel ne lâche pas — *« j'espère qu'il n'y a pas d'autres trucs qu'ils ne voient pas, ça serait con »*, puis *« ça fait plusieurs fois qu'on trouve des trucs chelou »*, puis *« y'a un truc qui cloche je le sens »*. Il avait raison sur les trois. **① Le constat** : le prénom n'était pas un accident isolé, c'était la **5ᵉ fois** de la même famille (charges ft-v625, repos ft-v626, ordre ft-v627, consignes ft-v628, prénom ft-v652). La cause n'est pas la négligence : **l'oubli est SILENCIEUX**. Ajouter une donnée sans la transmettre à Milo ne plante pas, ne lève aucune erreur, ne casse aucun test — Milo répond juste un peu moins bien, et **personne ne peut le voir**. **② Le garde-fou (`tests/donnees/runner.js`, nouveau)** : il lit **toutes** les données chargées par `load()` et exige que chacune soit **classée** — *transmise* · *exclue avec la raison écrite* (≥ 15 caractères, une exclusion sans motif est refusée : R27) · *trou connu*. Une donnée non classée **fait échouer la livraison**. Vérifié en ajoutant un faux champ (rouge) puis en le retirant (vert). *On ne peut plus oublier — on peut seulement décider.* **État : 90 données · 48 transmises · 38 exclues · 4 trous connus** (`nextPlanned` — le plus gênant, l'Accueil affiche « je m'en souviens » et le chat ne l'a pas · `programmes` · `customExercises` · `exRestPref`). Gravé en **R4a** dans `docs/REGLES-ARCHITECTURE.md`. **③ Ce que la mesure a révélé (le vrai sujet)** : le contexte envoyé à Milo fait **~45 400 caractères**, dont **91 % de CONSIGNES** et **9 % de connaissance sur la personne** — 144 lignes d'instructions, dont **42 occurrences de « JAMAIS »**. Et `S.sessions.slice(0, 5)` : il ne voit que les **5 dernières séances**. *« La mémoire sportive, mon cul »* (Michel). **⚠️ À ne pas mal lire** — ce n'est PAS « Milo n'a que 9 % de mémoire » : 48 des 90 données lui sont bien transmises, le 9 % est un **volume de texte**. Le problème n'est pas les 4 000 caractères de données, ce sont les 41 400 de consignes qui les **noient** (c'est **R20** appliqué au prompt de Milo : plus on charge, moins chaque règle pèse). **⏭️ Le chantier qui en découle, spécifié pas commencé** : rendre les consignes **conditionnelles à la mission en cours** (Milo n'a pas besoin des règles de nutrition quand on lui demande une séance) — **avec un plancher inconditionnel** : les règles de **sécurité** (blessures, contre-indications, Gardien) partent **toujours**, quelle que soit la mission. **④ Une leçon de méthode, payée cher** : mon **premier** audit annonçait « 25 données manquantes ». **19 étaient des faux positifs** — mes objets de test n'avaient pas la bonne forme, donc je concluais qu'une donnée n'était pas transmise alors qu'elle l'était. Le chiffre n'est devenu fiable qu'en **mesurant le contexte réellement construit**, pas en cherchant des noms de champs dans le code. Même leçon qu'à l'audit « données mortes » du 27/07, qui avait demandé 4 tentatives. Fichiers : `tests/donnees/runner.js` + `tests/donnees/donnees-milo.json` (nouveaux), `docs/REGLES-ARCHITECTURE.md` (R4a), `docs/BUGS-DE-PHILOSOPHIE.md` (PB-006), `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/GALERES-ET-LECONS.md`. Doc + tests uniquement, aucun code applicatif touché → **pas de bump sw.js**. |


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
| @auto (2026-07-13) | **Persistance cloud `manualKcal`** (calories réglées à la main, ft-v409) : `handleSaveProfile_` → `if(body.manualKcal!==undefined) profile.manualKcal=_pn_(...)`. `loadProfile` renvoie déjà tout `profile`. Déployé AUTO. |
| @auto (2026-07-30) | **Bilan corporel — repli déterministe `leanMass`** (retour Eline via la boîte à idées : « Milo a tout lu sauf le taux de masse maigre »). Le modèle de lecture (léger) rate parfois la masse maigre dans « Autres indicateurs » → si `leanMass` manque mais `weight` et `fatMass` sont lus, `handleImportBodyScan_` la CALCULE (poids − masse grasse, vérifié sur son rapport : 51.85 − 14.1 ≈ 37.8). Jamais d'IA là où une soustraction suffit. Déployé AUTO. |
| @auto (2026-07-31) | **Boîte à idées — panne de mail rendue VISIBLE** (message de Christophe jamais reçu, confirmé par Michel sur les deux boîtes) : ① le mail part vers **les 2 boîtes** (appli + perso, en dur comme `PREMIUM_HARDCODED_`) ; ② l'échec d'envoi n'est plus avalé par un `catch` vide → **`_logMailFail_`** (Script Property `MAIL_FAILS`, 50 derniers) ; ③ nouvelle route de diagnostic **`?action=mailFails&token=…`** (même token que `getIdees`) qui renvoie les échecs + le quota mail restant. L'idée reste de toute façon stockée dans `TESTER_IDEAS` même si le mail plante. ← **actuel**. |

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
