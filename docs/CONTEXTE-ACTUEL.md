# 📍 Contexte actuel — Force Tracker

> **Le PREMIER document à lire avant toute nouvelle tâche.** Une page maximum.
> Il donne l'état du projet en un coup d'œil, sans relire tout le reste.
> ⚠️ À tenir à jour EN TEMPS RÉEL (règle d'or #12).

---

- **Version en prod :** `ft-v514` (VM branché sur l'import de programme : rattachement aux références EXLIB → fini les doublons)
- **Branche de travail :** `master` (déploiement direct GitHub Pages)
- **Dernier point de sauvegarde :** ⭐ `backup-2026-07-20-pt001-valide-ft-v504` (milestone à jour)
  *(voir la table complète dans `DOSSIER-ATHLETE-SUIVI.md`)*

- **🧪 PROTOCOLE DE VALIDATION (nouveau, `ft-v497`) — PT-001 « Continuité mémoire »** :
  outil **admin** qui rejoue TOUT l'historique → Milo débriefe chaque séance + vérifie
  l'objectif de la fois d'avant, finit par « Qui suis-je en tant que sportif ? », et
  produit un **rapport exportable** (texte + PDF : timing, saturation, continuité,
  verdict + 7 axes GPT). Valide à 3 (Michel/GPT/Claude). C'est le **1ᵉʳ d'une série de
  protocoles** (PT-002 Gardien · PT-003 Observations · PT-004 ADN · PT-005 Onboarding).
  → **✅ 1ᵉʳ RUN RÉEL FAIT ET VALIDÉ (20/07)** : 20 séances, **20/20 réponses valides**
  (après le fix du bug 400), mémoire 20/20, **continuité d'objectif réelle ~95 %**
  (détecteur corrigé v504), **portrait « Qui suis-je ? » réussi** (décrit la personne).
  Preuves de suivi : saga hip thrust + « 105 OBJECTIF TENU, bravo ». Seul 🔴 = saturation
  = **artefact du rejeu Opus en rafale**, PAS Milo en réel (~14 s/débrief en vrai).
  Détail : `DOSSIER-ATHLETE-SUIVI.md` (§ Résultats du 1ᵉʳ run). *« On construit une méthode
  de validation reproductible, plus seulement des fonctionnalités » (GPT).*
  - **🏛️ CADRE ADOPTÉ — Laboratoire à 2 piliers VT / VC** (idée Michel, structurée GPT,
    19-20/07) : **VT** = Vérifications Techniques = les PT-xxx (le système marche) ·
    **VC** = Vérifications Comportementales = rejouer des **personas** (sportifs fictifs
    détaillés avec « attendus ») pour garder Milo cohérent/bienveillant/fidèle = filet
    **anti-régression de personnalité**. Garde-fous Claude : juge humain d'abord (IA-juge
    plus tard si prouvé), chaque persona a son « attendu », **semer depuis les VRAIS
    testeurs** (Tatiana = 1ᵉʳ VC) + la Constitution, **commencer PETIT** (5-6), le labo
    SERT la feuille de route sans la remplacer. Détail : `DOSSIER-ATHLETE-SUIVI.md`.
    ✅ **FAIT (`ft-v505`)** : format persona **v1.0 (7 rubriques)** figé + **harnais VC** (injection
    sûre : gel + snapshot + `load()` → données réelles intactes, testé) + **VC-001 Tatiana bâti**.
  - **🎭 VC-001 — état (20/07) :** **le COMPORTEMENT de Milo est conforme** (runs 3→6 : 5/5 attendus —
    il DEMANDE l'objectif, ne présume pas, n'invente pas « rattrape ton haut du corps »). MAIS les
    runs sur l'iPhone de Michel **fuitent encore ses données dans le contexte** — non pas un bug du
    code (v507 prouvé propre : git HEAD OK + Playwright 0 fuite), mais **iOS qui garde le vieux SW
    v506 en service** malgré l'affichage « 507 ». **→ SOLUTION : le `/clone/` devient le labo**
    (idée GPT). Le clone a un SW `cache:'no-store'` → exécute TOUJOURS le dernier code (aucune version
    périmée) + isolation `cl_`. Clone régénéré depuis prod ft-v507 (porte le harnais VC/PT + le fix).
    ✅ **VC-001 VALIDÉ (20/07, `ft-v508`)** : sur le clone (code frais), run 8 = contexte propre + Milo
    **5/5 attendus** (ne présume/impose rien, n'invente plus les genoux — ils sont déclarés cette fois).
    **Verdict CONFORME acté à 3** (Michel + GPT + Claude). 2ᵉ fuite trouvée+corrigée au passage
    (`coachQuiz`/`coachQuizPro`). Leçon GPT adoptée : *les attendus doivent coller EXACTEMENT au persona envoyé*.
  - **🎭 Bibliothèque VC (au 20/07, `ft-v509`) :** **VC-001 Tatiana** ✅ validé · **VC-002 Christophe**
    (confirmé qui a déjà un coach humain → Milo respecte/complète ? · testé **sur Sonnet**, son vrai modèle) ·
    **VC-003 Emma** (femme en règles + keto → ressenti prime, adaptation cycle, respect keto · Haiku).
    Harnais gère le **modèle-par-persona** (`coachEmail`) + cycle simulé (`cycleStartDaysAgo`) + keto.
    **✅ Conception validée par GPT (20/07)** : « attendus précis, observables, adaptés à une validation humaine ».
    Ses 2 points de vigilance sont **déjà couverts par les attendus** (VC-002 = Milo trop effacé → attendu 3 « compléter » ;
    VC-003 = reconnaître la fatigue avant les scores → attendu 1). 3 piliers couverts : comprendre avant de conseiller ·
    respecter un coach humain · faire primer le ressenti. ⏳ **PROCHAIN PAS : Michel lance VC-002 & VC-003 sur le clone** → verdict par attendus.

- **Chantier actif :** 🧠 **Dossier Athlète / Milo** (donner à Milo une mémoire
  durable + une vraie personnalité de coach).
- **Brique en cours :** — **3B CLÔTURÉE** (`ft-v471`, **validée Michel** : « 3B
  validé », « nickel »). Affinée (`ft-v472→v473`) : le ressenti nourrit le score —
  l'énergie l'ajuste en douceur, une **douleur ne fait pas chuter le chiffre** mais
  affiche un bandeau ⚠️ (« adapter, pas interdire »). Testeurs prévenus par un
  pop-up dédié (`ft-v474`). ⏳ À faire plus tard (IDEES-FUTURES) : **réduire la
  carte** de l'état du jour (elle encombre le haut de l'Accueil). **Restent en
  attente de validation réelle : 5A · 6A · 6B.** Briques 0–4A + 3B CLÔTURÉES ;
  Constitution v1.3 ; **Vision** gravée. Toutes les briques 0→6B **bâties** ;
  ensuite **5B** (observations IA).

- **Dernières décisions validées :**
  - Ton de Milo : « Laisse Milo choisir » (auto) par défaut, manuel = secours.
  - Registre Athlète (mémoire) + 7 faits mesurés, invisibles, règle d'or « un fait = une décision ».
  - Milo « comprendre avant de conseiller » (rupture d'habitude → question douce d'abord).
  - **Le ressenti de la personne prime toujours sur les chiffres** (ne jamais
    contredire « je suis HS » avec « ta récup est au top »).
  - **Nouvelle méthode de validation : les 4 axes** (fonctionnelle · technique ·
    situation réelle · philosophie de Milo) — adoptée à la clôture de la brique 3.
  - **Devise officielle** : « Force Tracker s'adapte au sportif. Le sportif ne
    s'adapte jamais à Force Tracker. »
  - **Le Gardien (brique 6) ADAPTE, il n'interdit pas** — adaptation par défaut,
    arrêt total = exception (Principe 13). Pas de « moteur de décision » séparé :
    c'est le rôle du Gardien.
  - Constitution de Milo **v1.4** (14 principes — Principe 12 « écouter,
    comprendre, contextualiser » + Principe 13 « l'adaptation avant l'interdiction »
    + **Principe 14 « Miroir, jamais prophète »** : Milo reflète l'histoire du
    sportif et l'aide à réfléchir, il ne prescrit ni ne prédit jamais — il enrichit
    le jugement, ne le remplace pas ; garde-fou vital des briques 7 & 8) ·
    question de contrôle · Processus officiel adopté.
  - Méthode de documentation : CLAUDE.md = page d'accueil, détails dans `/docs/`.
  - **Vision d'identité « présence de Milo »** (`docs/PRESENCE-MILO.md`) : Milo → App,
    présence sans gadget, jamais un passage obligé — **cerveau d'abord, présence ensuite**.
  - **La DESTINATION = architecture en 8 briques** (cadrage ChatGPT, gravé dans la
    Vision) : 0 Personnalité · 1 Mémoire · 2 Cerveau · 3 État du jour · 4 ADN ·
    5 Observations · 6 Gardien · **7 Mémoire vivante** (tendances sur plusieurs
    années) · **8 Synthèse** (prendre du recul sur toute son histoire). **7 et 8 =
    la finalité** (miroir jamais prophète ; dernières par nécessité — besoin de
    temps + données). Tout le reste (5B, « Milo construit ta séance »…) = affinages
    À L'INTÉRIEUR des briques, pas de nouvelles grandes briques.

- **🎯 ORDRE DES PRIORITÉS (recentrage GPT du 19/07 — « revenir au cœur du projet ») :**
  **1. Effet Waouh à l'inscription** (accueil perso et marquant — le nouveau comprend tout
  de suite que ce n'est pas un carnet) · **2. Débrief auto de fin de séance** *(déjà
  LARGEMENT FAIT : écran de fin `ft-v492` + débrief à l'ouverture du Coach `ft-v491`)* ·
  **3. Mémoire réellement exploitable** (Milo ressort l'info au bon moment, des semaines/mois
  après = Étapes 2/3 du débrief + brique 7 — « le plus important » selon GPT) · **4. Import
  auto des programmes** (Milo agit, en 1 clic — *à moitié bâti* : `_saveForceProgram`) ·
  **5. Traduction ensuite** (levier de croissance Tatiana, mais après le cœur ; déjà bien
  avancée sur le clone — voir `IDEES-FUTURES.md` + `RETOURS-TESTEURS.md`).
  → **✅ SÉQUENCEMENT TRANCHÉ = OPTION C (alignés à 3, Michel/GPT/Claude, 19/07)** : GPT
  distingue *priorités de dev* vs *priorités d'impact utilisateur* — la **mémoire (#3)** sert les
  utilisateurs **déjà là**, l'**onboarding (#1)** sert les **nouveaux** (pas le même problème).
  Donc : **(1)** Claude construit la **mémoire (#3)** + boucle l'**import (#4)** (déjà engagé) ;
  **(2)** EN PARALLÈLE, Michel + GPT **conçoivent** l'onboarding à fond (UX, dialogues, parcours,
  perso) **sans le coder tout de suite** ; **(3)** mémoire finie → on **enchaîne sur un onboarding
  déjà mûri**. ⚠️ L'onboarding n'est plus un simple écran = **mini-projet** (accueil perso, niveaux,
  effet Waouh) → concevoir avant de coder. Répartition qui colle au modèle « équipe IA »
  (`README-IA.md`) : Claude=dev, Michel+GPT=vision/UX, puis Claude exécute.
- *(ancienne note : « Inscription + premier accueil » restait le prochain gros chantier ;
  le moteur nutrition local vient après. Toujours valable, replacé dans l'ordre ci-dessus.)*
- **En parallèle (Milo) :** Michel teste en réel les briques encore en attente
  (**5A / 6A / 6B**) → validation 4 axes → clôtures. Ensuite **5B** (observations
  IA générées) ou la **réduction de la carte état du jour** (compacte repliée).
- **En discussion (gouvernance, non bloquant) :** le Principe 14 « Milo enrichit le
  jugement… » est **tranché** → devenu **Principe 14 « Miroir, jamais prophète »**
  (Constitution v1.4). Reste ouverte : la posture d'équilibre exigence/protection
  dans le comportement de Milo (à mûrir tranquillement).

- **Blocages :** aucun.

---

### 🗺️ Où lire quoi
- **Règles + vision + version** → `CLAUDE.md` (page d'accueil, auto-chargé chaque session).
- **Principes permanents** → `CONSTITUTION-MILO.md`.
- **Méthode de travail** → `docs/PROCESSUS-DEVELOPPEMENT.md`.
- **Chantier Milo (détail brique par brique)** → `DOSSIER-ATHLETE-SUIVI.md`.
- **Idées / à faire plus tard** → `IDEES-FUTURES.md`.
- **Backend à déployer depuis le PC** → `A-FAIRE-SUR-PC.md`.
