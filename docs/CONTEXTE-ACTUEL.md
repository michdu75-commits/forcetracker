# 📍 Contexte actuel — Force Tracker

> **Le PREMIER document à lire avant toute nouvelle tâche.** Une page maximum.
> Il donne l'état du projet en un coup d'œil, sans relire tout le reste.
> ⚠️ À tenir à jour EN TEMPS RÉEL (règle d'or #12).

---

- **Version en ligne (live) :** `ft-v595`. Sont **déjà en prod pour tous** : fixes sécurité/qualité Milo (⛔ ne joue pas au docteur / répond d'abord ft-v593 · ⛔ ne redemande pas une info connue ft-v595 · anti-invention ft-v589) · allègement CLAUDE.md · gouvernance (P24, les 2 moments Milo). **Encore CLONE-ONLY** (exprès) : le comportement « moment Milo » (positif) · la question guidée (chips) · le badge Gardien · le toggle questions illimitées.

---

## 🎯 RESTE À FAIRE (état au 23/07 au soir — reprise ici)

**Fait ce soir :** allègement CLAUDE.md (451→84 Ko + `docs/JOURNAL-ARCHIVE.md`) · Gardien de la Constitution **Étage 1** (clone, ft-v591) · **P24 « engagement responsable »** gravé (Constitution v2.2) · **les 2 moments Milo** gravés (`docs/PRESENCE-MILO.md`) · **Moment 1** fix comportemental (mal au ventre / docteur / re-demande, prod, ft-v593/595) · toggle clone **10 ⇄ illimité** (ft-v594) · **FRAMEWORK DE TESTS DE MILO** (noyau dur, 9 scénarios verts, `node tests/milo/runner.js` — `docs/FRAMEWORK-TESTS-MILO.md`).

**À reprendre :**
1. **[Michel] Valider le clone (ft-v595)** : refaire l'inscription, tester « j'ai mal au ventre » + demander une séance → Milo aide d'abord, ne redemande pas la salle, ne joue pas au docteur, pas d'interrogatoire.
2. **[Claude, après ①] Promouvoir en prod** le lot « comportement » (anti-interrogatoire + moment-Milo + blessure retenue → Gardien ft-v588) + checklist #11.
3. **[Claude] Lancer proprement la QUESTION GUIDÉE** (chips réponses rapides, clone-only ft-v585→590) quand validée = checklist #11 complète.
4. **[Chantier] MOMENT 2 « Milo se souvient de moi »** : surfacer la mémoire au retour (session 2). Pas commencé = la prochaine grande brique.
5. **[Tests] Élargir le corpus** au fil des bugs · construire le **Tier 2** (éval IA, minimal) · éventuelle GitHub Action pour le noyau dur.
6. **[Cross-IA en cours]** retours attendus : GPT/Gemini/Mistral sur le **framework de tests** · GPT sur le **« moment Milo »** · Gemini/Mistral sur l'**archi cerveau/cervelet** (pas encore envoyé). → à leur retour : synthèse + graver (dont le principe archi durable « **les faits viennent des moteurs, jamais inventés par le LLM** »).
7. **[Ne JAMAIS promouvoir — reste clone]** questions illimitées (toggle) + badge « 🛡️ Gardien » (outil de mesure).
8. **[Ouvert, rien à coder]** modèle éco (P24 gravé, implémentation LAISSÉE OUVERTE ; intermittence Gemini notée dans `IDEES-FUTURES.md`) · Gardien Étage 2 (option future).

⚠️ **Note dette technique :** ce fichier CONTEXTE-ACTUEL est devenu trop long (comme l'était CLAUDE.md) — à alléger un jour (garder 1 page + déplacer le vieux vers l'archive).

---

- **⚖️ PHILOSOPHIE DE MILO gravée — Constitution v2.1 (22/07, soirée, doc-only)** : reframe **confiance > empathie** (on ne fait pas un Milo « empathique », on fait un Milo digne de confiance ; l'empathie est dans ses **actes**, pas ses mots). **Principe 22 (capstone) « Le respect de la liberté de l'utilisateur »** (ne présume pas · ne décide pas à ta place · ne passe pas outre une limite · garde sa franchise mais te laisse le dernier mot · mémoire = tremplin jamais prison · **l'humilité** = diagnostique la barre jamais l'âme). **Principe 23 « Ne jamais confisquer le récit ; le réconfort n'est jamais une stratégie »**. Renfort P17 (interdits femmes). Mission : que chacun·e se sente compris·e, en particulier les **femmes** (phrase de Tatiana : « à quoi sert une appli à une femme si c'est juste pour rentrer des données ? »). Synthèse Michel + Claude + GPT + Gemini + Mistral. Détail : `CONSTITUTION-MILO.md`, `docs/VISION-FORCE-TRACKER.md`, `docs/MOTEUR-RAISONNEMENT-MILO.md`, `docs/PRESENCE-MILO.md`.

- **📱 NATIF — stratégie cadrée (22/07, croisement Gemini + Mistral + Claude + synthèse Michel · `docs/STRATEGIE-NATIF.md`)** : intention de passer en natif/hybride, **préparé sans rien coder ni bloquer les chantiers en cours**. Principe directeur (Michel) : *« le natif n'apporte que ce que le web ne peut pas offrir »*. Chemin = **coque Capacitor, zéro réécriture** (on garde tout) ; approche **progressive** des plugins (au besoin réel, pas « tous en V1 ») ; priorité objets connectés > push > stores ; monétisation au lancement = premium **serveur** (esquive la taxe Apple). Le **modèle est déjà prêt** (`MODELE-METIER.md` Principe n°2 : indépendant du mode d'acquisition). **⏭️ À décider avec Michel : le TEMPO** (quand démarrer) — pour l'instant, cap futur préparé.

- **🍽️ NUTRITION — esprit gravé (ft-v577, croisement Gemini + Mistral + Claude + synthèse Michel)** : phrase-boussole *« la nutrition est un moyen d'améliorer santé/récup/perf ; jamais une source de stress > bénéfice »* (**P21**). Principes : levier au service de l'objectif · optionnelle jamais bloquante · **précision au CHOIX (4 niveaux : qualitatif → portions → macros → suivi précis)** · fiabilité > exhaustivité (±20-50 %, tendances + fourchettes) · local d'abord + fallback fait-maison · qualité gratuite Nutri-Score/NOVA · anti-TCA (Gardien nutrition = seuils d'alerte). **1ʳᵉ brique proposée** = journal léger « à la portion » sur Open Food Facts. **⏭️ Prochaine étape avec Michel : choisir/prioriser cette 1ʳᵉ brique à coder.** Détail : `docs/NUTRITION-PHILOSOPHIE.md`.

- **🧠 CHANTIER ACTIF — LE MOTEUR DE RAISONNEMENT DE MILO (le « cerveau »)** *(réflexion fondatrice Michel 22/07, cadre : `docs/MOTEUR-RAISONNEMENT-MILO.md`)* : passer du « générateur de programmes » au **raisonnement** (Compréhension → **Diagnostic** → décision → explication). Chaque brique = une **PIÈCE** du moteur, prompt-only (0 backend), invisible à l'utilisateur. **Pièces posées :**
  - `ft-v571` — **base du moteur** : bloc « savoir raisonner + savoir s'arrêter » (Constitution **Principe 18**).
  - `ft-v572` — **1ʳᵉ pièce (Cerveau 2)** : exercices **« ancre » vs « accessoire »** (`_exRole`, déterministe) — construire autour des ancres.
  - `ft-v573` — **2ᵉ pièce (Cerveau 1)** : **profil conversationnel** (étape 1 « comportement ») — Milo apprend en discutant.
  - `ft-v582` — **2ᵉ pièce, étape 2 : la MÉMOIRE DURABLE** — Milo propose de retenir un trait durable confié en discutant (bloc caché `{"retiens":[…]}` → « 🧠 Je retiens : … ? [Oui][Non] ») → validé = rangé dans `S.registre.observations` (`source:'conversation'`), réutilise l'infra Observations + « Ce que Milo sait de toi ». Rien sans accord (P3). ⚠️ émission = prompt → à valider iPhone.
  - `ft-v574` — Milo connaît enfin tes **objectifs chiffrés** (force par exo + poids objectif) → répond à « c'est atteignable en combien de temps ? ».
  - `ft-v575` — **PRINCIPE DE CONCEPTION** « **La pertinence avant la disponibilité** » (+ « la cohérence avant la réactivité ») — né du sujet IMC, croisement GPT/Gemini/Mistral/Claude. **DEUX ÉTAGES : Milo raisonne · le Gardien protège** (seuils absolus IMC ≥ 40 · tour de taille > 120). Constitution **Principes 19 & 20 (v1.9)**.
  - `ft-v576` — nuance UX « **répondre d'abord, proposer ensuite** » : l'absence d'une donnée = une opportunité, jamais un blocage (corollaire P19).
  - ⏭️ **Prochaine pièce** : Observations (Cerveau 1 affine + Cerveau 2 réévalue) · générateur de programme (sortie du Cerveau 2). ⏳ **Couche future** : veille longitudinale des signaux faibles + montre connectée (non collectées).
- *(⏸️ parqué en arrière-plan : INDUSTRIALISATION VM — étapes 1/2 faites `ft-v526/527` ; restent ③ couche machine user-fed · ④ tests réels · ⑤ enrichir EXLIB. À reprendre après le cerveau.)*
- *(ancienne note ft-v526 : VM câblé sur l'import HISTORIQUE — `_vmMatchHist`, plus de doublons ; ~378 alias GPT, `_EX_EQUIV`=406 clés)*
  - **🏗️ Phase industrialisation lancée (GO Michel)** — ordre : **① VM finalisé ✅ (import historique câblé, ft-v526)** → **② Confirm en un geste ✅ (figurine + ✓/✕, import prog+journal, ft-v527)** → ③ couche machine (MVP user-fed) → ④ tests réels programmes variés → ⑤ enrichir EXLIB au fil du réel. **⏳ À TESTER PAR MICHEL (iPhone)** : importer un vrai programme + un vrai journal → vérifier les rattachements auto (verts) + les propositions ✓/✕.

- **🔭 TOUR DE TABLE IA EXTÉRIEURES (20/07) — décisions d'archi VM prises** (détail : CLAUDE.md, méthode : `docs/PROCESSUS-DEVELOPPEMENT.md`) : avis croisés GPT + Gemini + Mistral sur le chantier VM. **Méthode adoptée** : convergence de regards indépendants = décision d'archi ; divergence = débat. **2 décisions** : ① couche machine = **user-fed d'abord** (le risque = les médias, pas le code) ; ② graphe **simple & dérivé** (14 schémas, pas de parsing exhaustif). **+ Principe** : palier « confirm » de l'import = **un TAP, pas un formulaire**. **Prématuré → IDEES-FUTURES** : matériel connecté (montre), modèle éco approfondi, export JSON/CSV. **Prochaine brique quand on construira = la couche machine.**
  - **🏛️ FRONTIÈRE VM / GARDIEN actée** (dernier doc GPT) : *le moteur VM identifie/structure les MOUVEMENTS ; le Gardien décide quoi FAIRE de cette connaissance* (remplacements, contre-indications, adaptations douleurs = métier du Gardien, pas du parsing). ✅ **Ratifiée par Michel → Constitution v1.5, Principe 15 « Le moteur comprend, le Gardien décide » (20/07)**.
  - **🏗️ CHANGEMENT DE PHASE — GO donné par GPT (20/07) → en attente GO Michel** : fin de la phase « grandes idées », début de l'**industrialisation**. **Ordre convenu (GPT + Claude)** : ① **finaliser VM** (câbler import historique) → ② **construire Confirm** (validation reconnaissance en un geste) → ③ **couche machine (MVP user-fed)** → ④ **tester avec de vrais programmes variés** → ⑤ **enrichir EXLIB uniquement à partir des cas réels**. Nuance actée : **Confirm AVANT Machine** (le confirm de reconnaissance ✓/✕ se construit d'abord, la photo machine s'y greffe ensuite). Conseil GPT : « ne plus chercher de grandes idées — le moteur doit apprendre du réel ». Les 4 IA (GPT/Gemini/Mistral/Claude) alignées sur « construire ».
- **Branche de travail :** `claude/claude-md-docs-ytabnv` — **publiée aussi sur `master`** (donc live = ft-v595). *(session Claude Code web)*
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
  - Constitution de Milo **v1.9** (20 principes). Derniers en date (22/07) :
    **P15** « Le moteur comprend, le Gardien décide » · **P16** respecter le
    travail des coachs · **P17** l'accompagnement jamais la thérapie · **P18**
    fiabilité avant intelligence (savoir raisonner + savoir s'arrêter) · **P19
    « La pertinence avant la disponibilité »** (une donnée n'est utilisée que si
    elle améliore la décision ; deux étages Milo/Gardien ; transparence ciblée ;
    l'absence d'une donnée = opportunité, répondre d'abord proposer ensuite) ·
    **P20 « La cohérence avant la réactivité »** (raisonner sur les tendances, pas
    le bruit). Rappel P14 « Miroir, jamais prophète » (garde-fou des briques 7 & 8).
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
