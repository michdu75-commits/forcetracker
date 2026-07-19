# Force Tracker — Idées & projets futurs

Fichier de notes : bugs à corriger, fonctionnalités à explorer. Rien ici n'est en cours.

---

# 🗺️ FEUILLE DE ROUTE (ordre des priorités)

**Phase 1 — Stabiliser la fondation (AVANT tout le reste)**
1. ⭐ Refonte de la logique d'affichage des écrans (règle 3 bugs d'un coup).
2. 🧱 Découper index.html en plusieurs fichiers (moins de bugs + économie de tokens).
3. 🐞 Corriger les bugs restants (minuterie, bouton d'aide, écran qui s'éteint/pivote, touches fantômes, mode jour, en-tête incohérent).

**Phase 2 — Fiabiliser le cœur**
4. 📗 Refaire proprement le tableur de synchro (structure saine).
5. 🗂️ Ranger le dossier forcetracker + `.claspignore` correct.
6. 🔁 / ⚠️ Finaliser & clarifier superséries + dropsets (UX + édition).

**Phase 3 — Enrichir (une fois la base solide)**
7. Fonctionnalités : remontée exercices manquants, doublons, barre Progrès, pull-to-dismiss, swipe entre onglets, indicateur nouveauté, aide détaillée.
8. 🍽️ Nutrition : semaine de repas premium. 🩺 Profil avancé (santé).
9. ♿ Accessibilité (daltonien, basse vision, gaucher/droitier) + vérifs F-pattern / thumb zone.
10. 🖼️ Visuels exercices (machine + GIF) — gros chantier contenu.

**Phase 4 — Gros projets / long terme**
11. 🤖 Coach IA (mémoire premium, personnalité, proactif, sujets élargis).
12. 👩 Thème femme (priorité produit). 🎤 Logging vocal. ⌚ Garmin.
13. 🏗️ Base de données + hébergement adapté (quand le nombre d'utilisateurs le justifie).

> Principe : **structurer avant d'empiler** (voir « Principe directeur » plus bas). Une chose à la fois, testée, sur branche Git.

---

## 🌟 RETOURS DE L'ANALYSE PRODUIT EXTERNE (19/07) — actionnables

*(Analyse complète très positive : Concept 10/10, Coach IA 9,5, Potentiel commercial 10/10.
Confirme la direction — Gardien « adapte au lieu d'interdire », Milo compagnon, inscription
prénom/sexe/objectif/niveau/blessures. Ci-dessous ce qui est VRAIMENT nouveau à faire.)*

- **🎯 « La valeur AVANT le premium » (le meilleur point).** Le premium arrive trop tôt : il
  serait bien plus convaincant **après** une 1ʳᵉ séance / un 1ᵉʳ record / une 1ʳᵉ analyse.
  Principe gravé dans la Vision. **Actionnable** : ne pas afficher de mur/incitation premium
  tant que l'utilisateur n'a pas ressenti de valeur (ex. décaler le mur du Coach, les teasers
  premium après la 1ʳᵉ séance ou le 1ᵉʳ record). À cadrer proprement (quels déclencheurs de
  « valeur atteinte »).
- **✨ Accueil « waouh » personnalisé** (carte Milo de l'Accueil). Exemple de l'analyse :
  *« Bienvenue Michel, objectif Force, attention à ton genou droit, construisons ton prochain
  record. »* → réutilise **pile** le profil + la **blessure** qu'on vient d'ajouter à
  l'inscription. Beau « waouh » à faire **après l'Étape B** (peu de code, gros effet).
- **🗣️ Milo encore plus humain/conversationnel** — continuer le travail de personnalité (ton,
  effet miroir, registre de langage) ; l'analyse le note comme un levier.
- **📖 Guide un peu plus court / optionnel** — le guide-film pourrait être raccourci (5-6
  diapos) ou offrir un « Passer » plus visible. Mineur.

---

## 🚪 GROS CHANTIER PROPOSÉ — « L'inscription minimale » (découvrir le profil, pas le demander)

- **Vision (ChatGPT, 19/07)** : *« Force Tracker ne devrait pas demander un profil. Il
  devrait le découvrir. »* Le but n'est pas le questionnaire parfait, mais **la plus petite
  inscription possible** → l'utilisateur arrive **tout de suite** dans l'app (effet « waouh »).
- **Au 1ᵉʳ lancement, Milo ne pose que l'indispensable** : objectif · depuis combien de temps
  tu t'entraînes · une blessure/contrainte importante. Le reste du profil se **construit
  progressivement** via les **Faits**, les **Observations** et la **Mémoire** — une question
  posée **seulement quand elle devient utile**, jamais un long formulaire. S'adapte aux profils
  (passionné, sceptique, pressé, amateur de stats).
- **✅ L'infra existe déjà en partie** : le **quiz du Coach** (`COACH_QUIZ`/`_applyQuizToProfile`,
  coach.js) pose déjà de petites questions qui remplissent le profil ; les **Observations 5A**
  proposent→valident des faits. → on **construit dessus**, pas de zéro.
- **⚠️ Le piège (nuance Claude) : certaines données ne se DÉCOUVRENT pas.** Âge, poids, taille,
  sexe → impossibles à deviner depuis les séances, et **indispensables** aux moteurs de calcul
  (Nutrition = calories/macros, récup, niveaux de force). Donc l'inscription minimale doit les
  demander **plus tard, au bon moment** (« pour calculer tes calories, dis-moi ton poids/taille/
  âge » à la 1ʳᵉ ouverture de Nutrition), pas les zapper. Les 3 questions de ChatGPT sont
  parfaites pour **Milo/coaching**, pas pour les calculs.
- **⚠️ Mouvement inverse assumé** : on vient JUSTE d'enrichir l'inscription (écran niveau, date
  de naissance, poids visé — ft-v240/247). Ce chantier, c'est la **trimmer**. Assumé, pas une
  contradiction.
- **Ampleur** : GROS chantier (refonte de l'onboarding + mécanisme « demander au bon moment »),
  au moins aussi important que la mémoire (« c'est le 1ᵉʳ contact avec l'esprit de Force Tracker »
  — ChatGPT).
- **🎯 PRIORITÉ (décidée avec ChatGPT, 19/07)** : chantier **« Inscription + premier accueil »**
  placé **juste APRÈS le chantier aides** (donc AVANT le moteur nutrition local). Raison : tous
  les utilisateurs passent par l'inscription + les premières minutes → si on réussit ces deux
  minutes, on donne envie de découvrir tout le reste. « L'investissement produit le plus
  important aujourd'hui » (ChatGPT).
- **Piste de conception** : onboarding « 3 questions Milo » (objectif · ancienneté · blessure)
  → **entrée directe dans l'app** → **« collecte paresseuse »** des données de calcul **au moment
  où elles deviennent utiles** :
  - 1ʳᵉ ouverture de **Nutrition** → demander le **poids** ;
  - calcul des **besoins** (TDEE/macros) → demander la **taille** (+ âge, sexe) ;
  - autres infos demandées **quand elles apportent une vraie valeur** (jamais un formulaire).
  + questions progressives de Milo (quiz Coach + Observations) pour enrichir le reste.
  → l'inscription reste **légère** sans pénaliser les calculs.

### 📐 SPEC du chantier « Faisons connaissance » (cadrage ChatGPT + Claude, 19/07)
- **Objectif** : remplacer l'inscription-formulaire par une **« Faisons connaissance »** —
  Milo pose **3 questions par boutons** (objectif · depuis quand tu t'entraînes · une
  blessure/contrainte) + l'**email** (avec le pourquoi) → **entrée directe dans l'app**.
- **Critère de réussite** : un nouvel inscrit arrive dans l'app en **< 1 min**, sent que Milo
  « commence à le connaître », et les moteurs de calcul (Nutrition/récup) demandent les données
  manquantes (poids/taille/âge/sexe) **au bon moment**, sans jamais planter.
- **Hors périmètre** : renommer « Profil » globalement · refondre les moteurs de calcul ·
  demander l'email plus tard (on le **garde** à l'inscription).
- **Décisions de cadrage** :
  - **① 3 questions = conversation guidée par BOUTONS** (pas de texte à taper). *« Bonjour, moi
    c'est Milo. Avant de commencer, j'aimerais apprendre 3 choses sur toi. »* → l'utilisateur
    sent que Milo apprend déjà. **Réutilise l'infra existante** (`COACH_QUIZ`/boutons + onboarding
    déjà à boutons).
  - **② Email à l'inscription + EXPLIQUER pourquoi** : « Ton compte te permet de retrouver ton
    historique si tu changes de téléphone. » (Mieux que demander tard = risque de perte.)
  - **③ Vocabulaire « relation, pas compte »** : *Inscription → « Faisons connaissance »* ·
    *Informations perso → « Ce qui m'aidera à mieux t'accompagner »*. ⚠️ **PIÈGE** : ne PAS
    renommer « Profil » en « Ce que Milo sait déjà de toi » → **ce nom est DÉJÀ pris** (page des
    Observations, Menu → « Ce que Milo sait de toi »). Garder « Profil » (mot clair) ; vocabulaire
    chaleureux réservé à l'onboarding.
- **Découpage en petits pas (jamais casser l'inscription)** :
  1. **Vocabulaire + email « pourquoi »** (texte seul, risque ~0) — le premier pas.
  2. Écran « Faisons connaissance » : les 3 questions Milo par boutons.
  3. « Collecte paresseuse » : demander poids/taille/âge au bon moment (Nutrition/récup) + garde-fou
     anti-plantage si absent.
  4. Trim de l'ancien formulaire profil de l'onboarding (une fois 2 et 3 en place).

---

## 🚀 NOUVELLE BRIQUE PROPOSÉE — « Milo construit ta séance du jour »

- **Idée (demande Michel)** : pouvoir dire à Milo « aujourd'hui je fais les pecs,
  fais-moi 4-5 exos + un peu de cardio » → et que Milo **remplisse directement la
  séance en cours** (les exercices apparaissent dans l'écran Séance, prêts à
  logger), au lieu de seulement les proposer dans le chat.
- **État actuel** : Milo sait (1) **proposer** des exos dans le chat (l'utilisateur
  les ajoute à la main), (2) **générer un programme** enregistrable (`coachAction('force')`
  → `_saveForceProgram` → `S.programmes`, à charger plus tard), (3) **voir la séance
  en cours** (`S.wkt` injecté dans `buildCoachContext`). Mais **pas** injecter les
  exos directement dans `S.wkt`.
- **Pourquoi ça a du sens** : colle à la vision « Milo → App » (Milo qui **agit**,
  pas seulement qui parle). Passage « conseil » → « action ».
- **Faisabilité** : PAS énorme. On réutilise le moteur qui génère déjà un programme
  depuis Milo (`_extractForceProgram`/`_normalizeForceProg`) mais on le **branche
  sur la séance active** au lieu de `S.programmes` → un bouton **« ⚡ Démarrer cette
  séance »** sous la réponse de Milo qui appelle un équivalent de `loadProgDay` sur
  la structure générée. Réutiliser aussi la reconnaissance des groupes/supersets.
- **Points à cadrer** (méthode brique — Objectif/Critère/Hors périmètre) :
  · confirmer avant d'écraser une séance déjà commencée ;
  · pré-remplir les poids depuis les perfs précédentes (comme `loadProgDay`) ;
  · gérer le cardio (bloc cardio existant) ;
  · garder le contrôle à l'utilisateur (il peut retirer/modifier après).
- **Quand** : après les validations salle (5A/6A/6B). Prochaine vraie brique
  candidate avec la 5B.

---

## 🥫 IDÉE PRODUIT — Cache intelligent des produits alimentaires (moteur local)

- **Idée (Michel, 19/07)** : quand un utilisateur scanne un produit, si on l'a déjà
  → usage immédiat ; sinon on le récupère (Open Food Facts) **et on en garde une copie
  locale (cache)**. Va dans le sens du principe « moteur local d'abord ».
- **⚠️ 2 niveaux à bien distinguer (difficultés très différentes) :**
  - **Niveau 1 — cache PAR APPAREIL** : chaque téléphone garde les produits qu'il a
    déjà scannés → re-scan instantané + **hors-ligne**. **Facile, aucun serveur, 0
    souci de confidentialité ni de licence. Quick win** — à faire quand on attaque le
    moteur local nutrition (moteur de recherche d'aliments + cache).
  - **Niveau 2 — cache COMMUNAUTAIRE (partagé serveur)** : un produit récupéré par un
    utilisateur profite à tous. C'est le « patrimoine de données ». **Plus gros
    chantier → nécessite la VRAIE base de données** (Script Properties Google trop
    limitées pour une bibliothèque de produits). **À lier au chantier base de données.**
- **⚠️ Nuance coût (honnêteté)** : la recherche produit (code-barres → nutrition) passe
  par **Open Food Facts, GRATUIT** (pas l'IA) → le cache gagne en **vitesse / hors-ligne
  / indépendance**, **peu en argent**. Le vrai coût IA aujourd'hui = **lire le code-barres
  sur une photo** (`readBarcode`). Le vrai gain « argent » à terme = un **vrai scanner de
  code-barres sur le téléphone** (local, 0 IA) — chantier « moteur local » distinct.
- **⚠️ Licence** : Open Food Facts = **ODbL** → cache/réutilisation OK **avec attribution
  (« données Open Food Facts ») + partage à l'identique**. À respecter pour le **niveau 2**
  (redistribution). Niveau 1 (par appareil) = aucun souci.

### 🎯 Séquence complète du « moteur nutrition local » (plan validé 19/07, prêt à exécuter)
Objectif : supprimer presque tout le coût IA de la fonction code-barres, en restant fidèle à
« moteur local d'abord, l'IA seulement quand elle apporte une vraie valeur ».
1. **Scanner de code-barres LOCAL** (0 IA) :
   - **Android** : API navigateur native **`BarcodeDetector`** (gratuit, rapide, local).
   - **iPhone/Safari** : `BarcodeDetector` **absent** → **bibliothèque WASM embarquée** (type
     ZXing-wasm), stockée en local, hors-ligne. ⚠️ **À TESTER sérieusement sur iPhone** —
     c'est **la raison historique** du passage à l'IA (« la caméra live lisait mal les barres
     sur iPhone »). C'est le point dur du chantier.
2. **Fallback IA** (`readBarcode`, lecture de la photo) **UNIQUEMENT si le scan local
   échoue** → l'IA devient un **filet de secours**, plus la règle → coût quasi nul en usage
   normal. (Le code IA existe déjà, on le garde en repli.)
3. **Recherche produit** dans **Open Food Facts** (gratuit, déjà en place).
4. **Cache local par appareil** (niveau 1 ci-dessus) → re-scan instantané + hors-ligne.
5. **Cache communautaire** (niveau 2) **plus tard**, avec la vraie base de données + licence ODbL.
- **Gain** : usage normal = 100 % local (scan + cache), 0 € ; l'IA ne coûte que sur les cas
  vraiment difficiles. Résout aussi le souci iPhone historique (si la lib WASM tient).

---

## 🔧 À FAIRE APRÈS VALIDATION (petits ajustements notés en test réel)

- **Carte « Comment tu te sens aujourd'hui ? » (état du jour, brique 3B) → à RÉDUIRE.**
  Retour Michel (test réel, ft-v473) : « ça fonctionne nickel mais ça encombre
  l'écran ». Elle est en grand en haut de l'Accueil le temps de la validation.
  **Après validation** : la passer en **version compacte repliée** — une ligne
  résumé du type « 🌡️ Comment tu te sens ? · 🙂 · ⚠️ bas du dos » qu'on **déplie
  d'un tap** pour cocher énergie/douleur (même modèle que la carte Sommeil juste en
  dessous, `#home-sleep`). Objectif : rester accessible sans manger le haut de
  l'Accueil. Fichiers concernés : `_renderDayStateCard` (screens.js), `.ds-*`
  (style.css), `#home-daystate` (index.html).

---

## 🗣️ BACKLOG — Profil conversationnel avec Milo (⭐ étoile polaire, PAS maintenant)

> Idée de ChatGPT (19/07/2026), validée sur le plan fonctionnel par Claude.
> **À NE PAS développer avant que les fondations (briques 5, 6 et suivantes)
> soient terminées et stabilisées.** Fondations d'abord.

**Vision.** À terme, remplir son profil ne passe plus seulement par des
formulaires : **Milo accueille le nouvel utilisateur par une conversation
naturelle** (« Quel sport ? Depuis quand ? Force ou hypertrophie ? »). Les
réponses alimentent automatiquement le **Profil**, l'**ADN sportif** et
certaines infos du **Registre**. L'utilisateur a l'impression de **discuter**,
pas de remplir un questionnaire. Cohérent avec `docs/PRESENCE-MILO.md` (Milo =
la présence / la porte d'entrée).

**Non négociable.** Le profil manuel NE disparaît pas. **Deux modes coexistent**
(conversation Milo + édition manuelle) et alimentent la **même base**.

**S'appuie sur la brique 5** : mécanisme « Milo propose → l'utilisateur valide »
(« Si j'ai bien compris, tu préfères les charges lourdes. Je le retiens ? »).
Rien enregistré sans validation.

**⚠️ Garde-fou Claude (à respecter le jour où on le fait) : ne pas re-mélanger
les couches** qu'on a soigneusement séparées. La conversation remplit surtout le
**qualitatif** (discipline, préférences, ADN) ; les **données dures** (poids,
taille, âge) restent **déclarées/mesurées**, jamais « devinées » par Milo.

**Nature.** C'est la **convergence** de la brique **4B** (Milo apprend l'ADN
tout seul) + brique **5** (propose/valide) + l'**onboarding**. → Gros chantier,
étoile polaire, pas une petite brique. À reprendre quand la fondation Milo est
stable.

---

## 📸🔒 Sauvegarde des PHOTOS sur le Drive de Force Tracker (cryptées par le code perso) — chantier discuté 2026-07-13

**Le besoin (Michel)** : sur un changement de téléphone, on récupère toutes les DONNÉES mais **pas les photos** (photos d'exercices ajoutées, photos brutes des analyses morpho/bilan corporel). « C'est la base d'une appli de tout récupérer. »

**Pourquoi c'est bloqué aujourd'hui** : la sauvegarde cloud par personne (Apps Script `u_{email}`) a une limite **9 Mo/personne** → une seule photo peut peser autant que 10 ans de séances. On protège donc l'essentiel (données) et on laisse les photos en local.

**La solution (idée de Michel, validée faisable)** :
1. Stocker les photos sur le **Drive de Force Tracker** (`forcetracker.app@gmail.com`, **15 Go** gratuits vs 9 Mo — le backend écrit déjà dans ce Drive, dossier `ForceTracker-Backups/`). Un dossier/fichier par email.
2. **Crypter chaque photo sur le téléphone** avec une clé dérivée du **code d'accès perso** (`ft4_authcode` — voir CLAUDE.md « Protection de compte ») AVANT l'upload → sur le Drive, même l'admin ne voit que du charabia.
3. Restauration sur nouveau tél : email + code → le code **décrypte** les photos.

**Limites honnêtes à assumer / prévoir** :
- ⚠️ **Code oublié = photos perdues** (le prix du vraiment-privé ; les données, elles, restent récupérables).
- Code 4 chiffres = faible → prévoir d'**autoriser un code plus long** (ou un vrai mot de passe optionnel).
- Code optionnel aujourd'hui → sans code : soit on ne stocke pas les photos, soit non cryptées (choix clair de l'utilisateur).
- 🔒 **Données sensibles** (photos de corps, testeuses) → responsabilité RGPD, note de confidentialité honnête obligatoire.
- Surveiller le quota Drive (15 Go partagé Gmail/Drive/Photos) → Google One si ça grandit.

**« Sauvegarde complète » = déjà là pour les données** : `backupAllUserData_()` dumpe déjà tout (`u_{email}`) sur ce Drive chaque nuit à 2h. Ce chantier = **ajouter les photos** à cette logique.

**Statut** : discuté, non commencé. Gros chantier (crypto côté téléphone + stockage Drive + backend) → à faire une nuit, avec backup + branche, mini-plan validé par Michel AVANT de coder.

---

# 🌿 CHANTIERS SUR BRANCHES (workflow branche → test /clone/ → validation → mise en ligne)

*(Décidé avec Michel le 2026-07-11 : construire chaque gros chantier sur SA branche, isolé de la prod ; tester dans le bac à sable `/clone/` ; ne mettre en ligne que sur validation.)*

- **`feat/score-sante`** — 🥗 Score santé produit (module `food-health.js` : Nutri-Score + NOVA + additifs + macros sur le scan code-barres). ✅ **EN PROD (ft-v388)** — ouvert à tout le monde (2026-07-11). Code-barres + score = gratuit (0 token, Open Food Facts client). IA (📸 étiquette, 🤖 estimation) = freemium 25 essais + Premium.
- **`feat/accueil-calendrier`** — 📅 Calendrier mensuel sur l'Accueil + anneau doré sur les jours de record + icône 📊 perf par exercice dans l'historique. ✅ **EN PROD (ft-v387).** Cycle de force déplacé dans Menu > Outils ; niveau/PRs restent dans Progrès.
- **`feat/coach-v2`** — 🧠 Coach IA v2 : plus de techniques d'entraînement (périodisation, RPE, tempo, techniques d'intensité, powerlifting/BB) + dimension **coach de vie** (sommeil, stress, motivation, habitudes). *(branche prête, à construire)*
- **`feat/commandes-vocales`** — 🎙️ **Commandes vocales. ⏸️ MIS DE CÔTÉ (2026-07-11) — branche conservée, retiré du clone.** Fait (V1 testée iPhone) : module `voice.js` (Web Speech API, 0 token), micro dans l'en-tête Séance, push-to-talk, parse FR « 80 kilos 8 reps » → remplit la série active, « valide » (vocabulaire large + capture des mots courts) → valide, « repos » → chrono. Overlay diagnostic (affiche ce qu'iPhone a compris + erreurs + watchdog « app installée »). **Testé Michel** : reconnaissance des kg/reps OK ; validation affinée. **⚠️ Limites iPhone** : marche mieux dans Safari qu'en app installée ; dictée iOS à activer ; besoin d'un peu de réseau. **🎯 Vision Michel (le vrai objectif, gros chantier futur)** : app **pilotée à la voix de bout en bout** — dès l'ouverture, ajouter un exercice, **charger une séance d'un programme existant**, tout en vocal (assistant mains-libres complet). À reprendre par étapes : (1) logger une série [FAIT], (2) « ajoute [exercice] », (3) « charge la séance [nom] », (4) navigation vocale globale. Reprendre via `git checkout feat/commandes-vocales`.
- **`feat/programmes-complexes`** — 🏋️ **Bibliothèque de programmes de force. ⏸️ MIS DE CÔTÉ (2026-07-12) — branche conservée, retiré du clone.** Fait & testé sur le clone : module `programs-lib.js` (0 token, charges calculées sur les 1RM). **Bibliothèque** : Starting Strength, Texas Method, 5/3/1 BBB (assistance/abdos/lombaires corrigés), **Powerbuilding** (force + muscu, rééquilibrage du point faible dès 4 j + journée spé si 5 j), **🔴 Force Athlétique** périodisé (Bloc 1 Accumulation, variantes/abdos/lombaires/cardio, rotation Sem A/B) avec **gate profil** (incomplet → programme basique + message). **Questionnaire adaptatif** `S.trainingProfile` (jours/durée/moment/matériel/zones sensibles/volume/point faible) qui adapte les programmes. Accès : Séance → « 📋 Mes programmes & bibliothèque ». **Retours Michel intégrés** : logique d'exercices (pas 3 développés empilés, pas de hinge lourd le jour squat), volume = choix explicite (pas déduit du travail physique), point faible ciblé (pas le point fort). **🎯 Reste (vision)** : Blocs 2 (Force) & 3 (Peak) du cycle 12 sem ; famille **Musculation pure** (PPL, Haut/Bas) ; **niveau 2 « Milo réfléchit »** (IA qui lit morpho + étude du corps + historique → programme sur-mesure et réajusté = Premium ; free = 1 bilan, évolution = payant). Reprendre via `git checkout feat/programmes-complexes`.

---

# 🌙 À FAIRE AU CALME — session dédiée le soir (backup + branche, 0 utilisateur en séance)

*(Convenu avec Michel le 2026-07-11. Touche au backend / à des points sensibles → à faire posément, pas en coup de vent.)*

1. 🔒 **Fix activation protection iPhone** — `_protectPost` (app.js) fait un `fetch` CORS et **lit la réponse** (`r.json()`) du serveur Apps Script. Sur **iPhone Safari, cette lecture est intermittente** (redirection 302 vers `script.googleusercontent.com` → Safari bloque parfois la lecture) → toast « Erreur réseau » alors que le serveur a parfois bien reçu la demande. Michel a réussi en « allant doucement » (ça confirme le côté course/intermittent). **Fix visé** : que l'activation **ne dépende plus de la lecture de cette réponse** → POST en `mode:'no-cors'` (fire-and-forget, marche toujours) **puis vérification par un GET** (ex. `authStatus` exposé aussi en `doGet`, comme `loadProfile` GET qui marche sur iPhone). Idem pour `sendConfirmCode` / `setAccessCode` (activer/désactiver). ⚠️ Touche **Emma & Christophe** (iPhone) aussi. Nécessite modif `Code.js` (nouveau `doGet ?action=authStatus`) + rework frontend + **test sur vrai iPhone**.

2. 📤 **Boîte à idées — photos qui remontent dans l'appli (fini WhatsApp)** — aujourd'hui (`sendTesterIdea`/`shareTesterPhotos`, app.js) : le **texte** part de façon fiable (email `forcetracker.app@gmail.com` + backend `testerIdea`), mais les **photos ne peuvent pas être attachées à l'email** (limite navigateur : `mailto:` ne porte pas de fichier) → l'appli propose seulement le **menu « Partager »** du téléphone, où **WhatsApp apparaît** (avec Mail/Messages). Michel veut que les photos **arrivent collées à l'idée**. **Fix visé** : uploader les photos (redimensionnées, comme le Coach / l'étude du corps) vers le **backend** avec l'idée — probablement stockées dans **Drive** (les Script Properties sont trop petites, ~9 Ko/valeur). `handleTesterIdea_` (Code.js) à enrichir pour recevoir les images → dossier Drive dédié → Michel/Claude les lisent. Nécessite modif `Code.js` + déploiement.

3. 📷 **Scanner de code-barres EN DIRECT (fini la photo floue)** — aujourd'hui (`scanBarcode`/`onBarcodeFile`, app.js) : on prend **une seule photo figée** (`<input type=file capture>`) puis on la décode avec **ZXing** (`decodeFromImageUrl`). Problème signalé par Michel (2026-07-11, capture « Code-barres illisible ») : une photo de code-barres est très souvent **légèrement floue / trop petite** → échec. **Vérifié en test** (barcode généré) : image nette = OK ; image floue/réduite = **FAIL même avec `TRY_HARDER` + `POSSIBLE_FORMATS` EAN/UPC** → aucun réglage ne rattrape une photo floue (info perdue). **Fix visé** : **scanner vidéo en continu** — `navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})` + `ZXing.BrowserMultiFormatReader.decodeFromVideoDevice(...)` (frames en boucle, autofocus, lit dès que net, comme Yuka). ⚠️ **getUserMedia sur iOS Safari** = HTTPS OK (GitHub Pages), mais **comportement à tester sur vrai iPhone** (surtout en PWA installée / standalone). Prévoir : overlay `<video>` + viseur, permission caméra, `stream.getTracks().forEach(t=>t.stop())` à la fermeture, **fallback sur la photo actuelle** si getUserMedia indispo. ZXing expose bien `DecodeHintType`/`BarcodeFormat` (vérifié). Frontend only (pas de backend). Le reste marche déjà : saisie manuelle + 🤖 estimation IA.

---

# 💡 IDÉES À CADRER (discussion en cours — pas encore lancées)

## ✕ (Annuler) vs 🗑 Vider — 2 boutons qui se ressemblent (à trancher)
En séance, l'en-tête a **deux** boutons proches : **✕** (`clearWkt` → **quitte** la séance) et **🗑 Vider** (`clearAllEx` → **vide les exos mais garde la séance ouverte**, ex. mauvais programme chargé). Michel : « c'est quoi la différence, ça fait la même chose lol ». Ils font des choses **différentes** mais c'est pas clair visuellement. → À trancher plus tard : soit les rendre **visuellement distincts** (icônes/couleurs/libellés explicites « Quitter » vs « Vider »), soit en **retirer un** si l'un fait doublon à l'usage. **Laissé tel quel pour l'instant** (décision Michel 2026-07-07).

## 🍽️ Nutrition — Charge / Décharge : pas utile pour tous les profils ? (à cadrer)
Michel (2026-07-10) : le système **Charge / Décharge** (phases nutrition avec macros différentes, boutons dans l'onglet Nutrition → `nutritionPhase`, `calcMacros(phase)`) n'est **pas forcément utile pour tous les profils**. Pertinent surtout pour la prise de masse / la performance (force athlé, bodybuilding en préparation) ; beaucoup moins pour un débutant, quelqu'un en simple perte de poids ou en rééquilibrage. → **À cadrer** : soit **masquer/afficher** ces boutons selon le profil (objectif + discipline + niveau), soit les rendre **optionnels** (réglage « je veux gérer mes phases charge/décharge »), soit ajouter une **explication courte** pour ceux à qui ça parle. Ne rien casser pour ceux qui l'utilisent déjà. **Idée à discuter, pas lancée.**

## 🎨 Chronomètres de repos — skins au choix (gratuit) — EN COURS sur le clone
Michel a envoyé 4 designs de chronos (montre chromée + anneau pointillé/pie rouge, cadrans noirs à segments vert→jaune→orange→rouge, chrono analogique aiguille, horloge pie verte à graduations). Idée : proposer **plusieurs styles de chrono au choix** (option **gratuite**), réglable quelque part (Profil ou réglages du timer). Essais **sur le clone** d'abord, puis promotion. *(Décision Michel 2026-07-07 : « voit ce que tu peux faire pour ces chronos, on fera des essais sur le clone, faudra les mettre en option de choix quelque part (gratuit) ».)*

## 🅴 Échec auto à l'import — désactivé (ft-v292), à re-cadrer
Avant : à l'import d'un programme, si le doc disait « à l'échec », `_buildProgDay` marquait la dernière série en **« E »** (via `ex.specialSets` → `'E'`). Remontée Christophe/Michel : indésirable (l'app mettait une série à l'échec toute seule). **Désactivé en ft-v292** (`type:baseType`, on ne convertit plus `specialSets` en `'E'`). **Gardé en mémoire** : si on veut le réactiver un jour, remettre la logique `baseType==='N'?((ex.specialSets&&ex.specialSets.includes(si))?'E':'N'):baseType` dans les deux `sets=` de `_buildProgDay` (log.js). *(Décision Michel 2026-07-07 : « on enlève pour l'instant mais garde en mémoire ».)*

## 📣 Réseau social / fil communautaire (gros projet, long terme)
Idée Michel : une **page dédiée** type mini-réseau social / fil d'actu — ex. « Christophe a fait une super séance », « Événement aujourd'hui : salon du culturisme ». **Sans pop-up intrusif.** But : créer du lien entre utilisateurs.
- ⚠️ **Gros chantier** : nécessite un **vrai backend** (comptes, posts, modération, notifications non-intrusives) — l'archi actuelle (Apps Script + localStorage) ne suffit pas. À planifier quand la base utilisateurs le justifie (cf. Phase 4 « base de données + hébergement »).
- Piste douce et réaliste **tout de suite** : un simple **fil « Actus / Événements »** en lecture seule (annonces salon, défis du mois), alimenté par Michel — pas de comptes ni de posts utilisateurs. Beaucoup plus simple, sans backend social.

## 🔔 Rappel « tu as oublié d'enregistrer ta séance » (petit, faisable)
Michel veut **éviter les pop-ups à la con**, mais accepte un rappel utile : si une séance est **en cours depuis longtemps sans être terminée** (`S.wkt` actif, vieux), afficher un rappel discret (style carte Milo sur l'Accueil, pas de pop-up). → Faisable sans backend, à faire quand on veut.

## 💳 « Super Premium » (suivi Excel/Sheets) — Michel penche vers « trop »
Idée : un palier au-dessus du Premium pour ceux qui veulent le **suivi Excel/Sheets**. Michel doute que ça marche et pense que « c'est peut-être un peu trop ». **Avis : d'accord — ne pas ajouter de palier pour l'instant** (complexité tarifaire, valeur incertaine). L'export existe déjà (Exporter les données). À rediscuter seulement si des utilisateurs le réclament vraiment.

## 🌍 App / Coach MULTILINGUE (anglais, russe… — futur, gros taff)
Idée Michel : à terme, proposer l'application (et Milo) en **plusieurs langues** pour toucher plus large. C'est un **vrai chantier** (traduction de toute l'UI + textes + prompts, gestion multilingue). Pas la priorité maintenant. Note : Milo peut déjà répondre dans la langue de la personne côté prompt, mais l'UI reste en français.
- **Déjà commencé puis mis en pause** (Michel, 19/07) : « on a commencé la traduction, après on est parti sur autre chose » → reste dans le fonctionnement futur, à reprendre.
- **Piste technique** : rendre le « réponds TOUJOURS en français » de Milo **adaptatif à la langue de l'utilisateur** (déjà noté ft-v401/402), puis attaquer l'UI (i18n).
- **🎯 SIGNAL TERRAIN FORT (Tatiana, testeuse + coach, 19/07)** : elle a demandé **si ce sera utilisable en RUSSE** — parce qu'elle **partagerait l'app avec ses clientes**. Double intérêt : (1) une vraie **demande de langue** (russe), (2) un **canal de distribution** = **les coachs amènent leurs clients**. Une coach qui adopte Force Tracker peut faire entrer tout son groupe. → La traduction n'est pas qu'un confort : c'est un **levier de croissance** via les coachs. À garder en tête au moment de prioriser.

## ⚖️ Connexion à une balance connectée — limite technique honnête
Question Michel : se connecter à une appli de balance connectée (Withings, etc.) ?
- **PWA web = très limité** : pas d'accès à Apple Santé / Google Fit depuis le web, Web Bluetooth **non supporté sur iOS Safari/PWA**. Se brancher sur Withings/Fitbit demanderait leur **API OAuth + un backend** (lourd), et ne couvrirait pas Apple Health.
- **Réaliste aujourd'hui** : saisie manuelle (déjà en place). Une vraie synchro balance = **appli native** (futur) ou intégration API tierce ciblée (gros dev). À garder en tête, pas prioritaire.

## 🖼️ Figurines des exercices dans le PDF de programme (idée Michel, parkée)
Michel : dans le PDF de programme, mettre une **image de l'exercice** à côté de chaque ligne. Décision : **utiliser les figurines muscles** (les vignettes légères `_progExThumb` : photo perso > image muscle `muscles/*.png` > figurine `_mscSVGmini`) plutôt que les GIFs (trop lourds pour un PDF).
- **Faisable** sur le PDF de **programme** uniquement (exercices bien listés). Pas sur une réponse coach en texte libre (pas de correspondance fiable nom→image).
- **À cadrer** : la figurine est un SVG/PNG → il faut la rendre en dataURI (canvas) avant de l'injecter dans jsPDF (`addImage`), une par exercice. Reste léger (contrairement aux GIFs). Colonne « photo » ~24px à gauche de chaque ligne du tableau.
- Cohérent avec l'identité « figurines muscles » (règle d'or n°7). **Pas lancé — dans la boîte à idées.**

## 🎨 Retravailler le logo (Michel : « il est moche finalement »)
Michel veut réaméliorer le logo (`logo.png` / `force-tracker-logo-final.png` / `-splash.gif` / `-topbar.gif`).
- ⚠️ **PAS DE SVG** (Michel : « c'est dégueulasse »). Le logo doit rester une **vraie image** (rendu type silhouette muscle actuelle).
- **Chemin unique** : **Michel fournit** le nouveau logo (outil de génération d'image / graphiste) → **Claude l'intègre partout** (splash, topbar, favicon manifest, bonnes tailles, PRECACHE sw.js + bump). Claude ne dessine pas le logo.
- Garder l'**identité « figurines muscles »** (règle d'or n°7), ne pas copier Hevy/JEFIT. **Pas lancé.**

---

# 🚧 EN COURS — à reprendre (non fini)

## 🏋️ Programme de force « Gagner en force (Big 3) » — v1 livrée (ft-v225), **à approfondir**

**Ce qui marche déjà (déployé) :**
- Bouton « Gagner en force (Big 3) » dans le Coach.
- Milo lit automatiquement les maxes (1RM) Squat / Développé Couché / Soulevé de Terre dans les records (`S.prs`).
- Il renvoie un conseil + un programme, avec un bouton « 💾 Enregistrer ce programme » qui l'ajoute dans « Mes programmes » (chargeable en séance avec les charges).

**Ce qui reste à faire / améliorer (pourquoi c'est « non fini ») :**
- **Vraie périodisation sur plusieurs semaines** : aujourd'hui le programme = des séances fixes. Il faudrait une progression semaine par semaine (montée des %1RM, deload) plutôt qu'un jeu de séances figé — idéalement relié au **Cycle de Force** existant (`s-cycle`) qui gère déjà accumulation → intensification → peak → décharge.
- **Mode « prépa compétition »** : viser une date de compétition, avec un peak calé dessus.
- **Fiabilité du format** : le programme dépend d'un bloc JSON généré par l'IA ; si le modèle ne respecte pas le format, pas de bouton « Enregistrer » (juste le conseil). À sécuriser (ex. action backend dédiée à réponse structurée, ou 2e tentative).
- **Correction des maxes avant génération** : laisser Michel ajuster ses 3 maxes (si l'app en a mal estimé un) avant de lancer.
- **Charges plus fines** : calcul des %1RM et de la progression plus rigoureux (RPE, tonnage), adapté au niveau.

> État : posé de côté à la demande de Michel. La v1 reste utilisable telle quelle ; on reprend quand on veut pour la rendre « complète ».

---

# ✅ À FAIRE

## ⭐ PRIORITÉ — Refonte de la logique d'affichage des écrans

Plusieurs bugs viennent du même endroit : la façon dont l'app **ouvre, empile et ferme** les écrans/panneaux.
Le régler en premier corrige d'un coup plusieurs bugs ci-dessous (menu qui ne se ferme pas, Profil en arrière-plan, retour sans effet).

**À demander à Claude Code (en clair) :**
> Mets en place une gestion centralisée des écrans, type "pile de navigation" :
> - Ouvrir un écran l'affiche TOUJOURS au premier plan (au-dessus de tout le reste).
> - Ouvrir un nouvel écran ferme proprement le panneau/menu précédent (un seul visible à la fois, sauf overlay voulu).
> - Le bouton "retour" dépile = revient à l'écran précédent.
> - Le drawer Menu se ferme dès qu'on choisit une entrée.
> Une seule logique réutilisée partout, au lieu d'un comportement différent par écran.

---

## 🐞 Bugs à corriger

- **Mise à jour auto du Service Worker (cache PWA)** : normalement réglé, mais à **revérifier** — l'app gardée en cache ne se met parfois pas à jour seule (signet/app installée montre l'ancienne version). Vérifier détection de nouvelle version + bandeau « Rafraîchir » ou reload auto, et cache bien bumpé (`ft-vN`) à chaque release. Important pour les utilisateurs (sinon bloqués sur vieille version).
- **Drawer Menu ne se ferme pas après sélection** : on ouvre le Menu, on choisit une entrée des Outils
  (Anatomie, Protéines, Compléments, Calculateur 1RM…) → le menu reste ouvert par-dessus la page. À fermer automatiquement. *(réglé par la refonte ci-dessus)*
- **Profil s'ouvre en arrière-plan** : si un outil est déjà ouvert (ex. Anatomie) et qu'on clique sur Profil,
  le Profil s'affiche derrière → il faut fermer l'outil pour le voir. *(réglé par la refonte ci-dessus)*
- **Bouton retour du Profil sans action** : clic sans effet → le câbler pour revenir à l'écran précédent. *(réglé par la refonte ci-dessus)*
- **Profil accessible 2 fois dans le Menu (doublon)** : la **carte « Michel » en haut** ET l'entrée **« Mon profil »** dans COMPTE mènent au même endroit → garder **uniquement la carte du haut**, supprimer « Mon profil » de COMPTE.
- **Accès admin en double** : le **petit logo admin** (haut droite) fait doublon → on y accède déjà en cliquant sur le logo dans **Nutrition**. À retirer/simplifier.
- **Croix ✕ du Profil : mauvais côté + trop loin** : la croix de fermeture du Profil n'est **pas du même côté** que celle des autres sous-menus (incohérent) ET trop **haute/éloignée** pour le pouce (usage à une main). → Uniformiser le côté de la ✕ sur tous les sous-menus + la rendre atteignable au pouce.
- **Minuterie d'exercice non mise à jour** : la valeur en minutes (durée/minuteur) ne se met pas à jour correctement.
- **Bouton d'aide mal placé** : le petit bouton d'aide (?) est mal positionné **partout** (pas qu'à un endroit) → définir une **place cohérente et atteignable** pour l'aide sur tous les écrans, plutôt qu'un coin haut-droite difficile au pouce.
  **Décision :** le « ? » est une **aide contextuelle** (chaque écran a sa propre aide) → on le **garde** (utile), on le **repositionne** juste à un endroit cohérent + atteignable au pouce sur tous les écrans. (≠ « Aide détaillée » du menu, qui reste en place.)
- **Mettre à jour le contenu de l'aide** : après toutes les refontes (affichage, superséries, menu…), les textes d'aide contextuelle + « Aide détaillée » doivent être **réécrits pour coller à la version actuelle** des écrans (sinon l'aide décrit une ancienne UI).
- **Profil — « ? » d'aide + petit logo (menu caché) en haut à droite** : ces deux accès sont dans la zone la plus dure à atteindre au pouce (haut-droite) → repositionner pour l'usage à une main.
- **Écran s'éteint en séance** : l'écran s'éteint alors que l'app est ouverte → activer **Wake Lock** (garder l'écran allumé pendant la séance).
- ✅ **L'écran pivote — FAIT** : verrouillé en portrait via `manifest.json` (`"orientation":"portrait-primary"`, app installée) + `screen.orientation.lock('portrait')` (app.js).
- **Touches accidentelles (tél posé) — limite iOS** : on ne peut PAS empêcher iOS de détecter les touches quand l'écran touche une surface (matériel/OS, hors portée web). **Mitigation en place** : les actions destructrices sont protégées (suppression exo/série = appui long 400ms, Vider/Annuler séance = confirmation) → une touche fantôme ne peut pas détruire de données. *Si un popup précis réapparaît tout seul, identifier l'action concernée et la blinder (confirmation/appui long).*
- **Mode jour — drawer Menu reste sombre** : en **mode jour/clair**, une **ombre apparaît à droite** et l'ouverture du **Menu s'affiche en noir** (pas adapté au thème clair). → Adapter le drawer Menu (fond + ombre) au mode jour.
- **Logo/titre « Force Tracker » incohérent entre onglets** : l'en-tête « Force Tracker » n'est **pas identique sur tous les onglets** (taille/style/position varient), en **mode jour ET nuit**. → Uniformiser l'en-tête sur tous les écrans.

---

## 🔁 Superséries — comportement à finaliser

Dans une supersérie (ex. 3 exercices), une fois le **dernier exercice du tour validé**,
l'app revient **automatiquement au 1er exercice** pour enchaîner le tour suivant (boucle 1 → 2 → 3 → 1 …) jusqu'à la fin des séries.
- **Pas de minuteur entre les exercices** d'un même tour : ils s'enchaînent dans la foulée.
- Le **chrono de repos se déclenche uniquement après le dernier** exercice du tour (puis retour au 1er).

## ✅ Remontée des exercices manquants — FAIT

Les exercices perso ajoutés par les utilisateurs remontent côté admin (Sheet), avec ID anonyme.

## 🖼️ Exercices — image de la machine + GIF du mouvement (gros chantier)

Pour chaque exercice :
- afficher l'**image de la machine** concernée et ses **variantes** (dans la liste / la fiche).
- en **entrant dans l'exercice**, montrer le **mouvement en GIF** (démonstration animée).
⚠️ Gros boulot (collecte/création des visuels pour tous les exercices + intégration). À planifier comme un chantier à part.

## 📊 Stats globales (admin) + stats perso utilisateur + RGPD — à faire

- **Admin** : Sheet miroir global regroupant **tous les utilisateurs** (colonne **ID_utilisateur anonyme**, pas d'email en clair) → stats globales, usage, exercices manquants.
- **Utilisateur** : chaque personne doit pouvoir voir **ses propres stats** dans l'app (synthèse de sa progression, volumes, PRs…).
- ⚠️ **RGPD / vie privée** : prévenir les utilisateurs que leurs données sont stockées, ID anonyme plutôt qu'identifiant perso, pouvoir **supprimer** les données sur demande. À faire proprement, surtout quand l'app grandit.

## 📤 Export performance utilisateur + template Excel premium — à faire

- **Export perso** : améliorer le bouton « Exporter mes données » → fichier Excel/CSV propre (séances, charges, PRs). Chaque utilisateur n'exporte que **SES** données (vie privée).
- **Template Excel premium** (plus tard) : offrir le beau fichier de suivi (graphes, mésocycles, calculateur 1RM) en bonus **premium** — vrai argument de vente.

## 📈 Historique poids au tap (écran séance) — à faire

Garder PRÉCÉDENT à 1 valeur. Ajouter une **petite icône historique (graphique)** à côté de chaque exercice :
au tap → **mini-graphe de progression du POIDS uniquement** (3-5 dernières séances), lisible au pouce, refermable.
Données = historique déjà mémorisé par l'app. Ne pas alourdir la grille de saisie.

## ✅ Progrès — choisir les exercices de la barre de progression — FAIT

Dans l'onglet **Progrès**, on peut **changer les 4 exercices** affichés dans la barre de progression.

## ✅ Détecter les exercices en doublon — FAIT

Rapprochement flou à la création (ignore casse, accents, espaces, pluriels) + outil admin de fusion.

## 👇 Fermer la fenêtre en scrollant (groupes musculaires / muscle) — à ajouter

Pouvoir **fermer la fenêtre en scrollant** (swipe vers le bas) :
- depuis la **liste des groupes musculaires**,
- et quand on est **dans un muscle**.
→ Geste « tirer vers le bas pour fermer » (pull-to-dismiss), en plus du bouton de fermeture.

## 🍽️ Nutrition — repas (premium vs gratuit) — EN COURS

- 🆓 **Gratuit** : idées de repas **du jour**, **1 régénération par jour** (incite au premium).
- ⭐ **Premium** : **semaine complète** de repas planifiés + **historique sur 1 mois**.
- Génération par le **Coach IA**, basé sur le **profil** (objectifs, calories/macros) — profil à bien remplir.

**Phrase pour Claude Code :**
> Nutrition : génère les idées de repas via le **Coach IA**, à partir du profil (objectifs, calories/macros cibles).
> - **Gratuit** : repas **du jour** avec **1 seule régénération par jour**.
> - **Premium** : **semaine complète** de repas + **historique sur 1 mois**.
> - Si le profil n'est pas rempli, invite à le compléter avant. Ne casse pas l'écran Nutrition existant.

## ✅ Indicateur de nouveauté — FAIT

Pastille « nouveau » en place sur les fonctionnalités récentes.

## ✅ Menu « Aide détaillée » — FAIT

Aide détaillée étoffée (guides par écran, superséries/dropsets, coach…). Bloc 7 terminé.

## 🩻 Logo Force Tracker en filigrane de fond (à tester)

Au lieu du logo en petite icône, le mettre en **fond d'écran léger et très transparent** (watermark/filigrane discret,
ex. centré ou en bas, opacité faible) pour habiller l'app sans nuire à la lisibilité. À tester sur le thème nuit.

## 🎨 Réduire la présence du rouge (à revoir)

Le rouge corail est **trop présent** (CTA, onglet actif, FAB, chiffres, icônes, badges, dégradés…) → il perd son impact.
Principe : l'accent doit rester **rare** pour garder sa force.
- Réserver le rouge à **l'action n°1 de chaque écran** + l'onglet actif.
- Passer chiffres / icônes secondaires / petits badges en **neutres** (blanc/gris sur le charbon).
- Garder vert (récup/validé) et or (PR) là où ils portent une vraie info.
→ Objectif : app qui respire, plus premium, l'œil va droit à l'action.

## 🎨 Palette & thèmes personnalisables (à explorer)

- Trouver une **palette cohérente** (1 accent fort + neutres + vert/or pour l'info). Michel aime le **bleu** → testable comme accent alternatif (le bleu marche très bien en UI : calme, "tech", lisible).
- Proposer des **thèmes / accents au choix** (rouge, bleu, …) et éventuellement un **fond personnalisé** par l'utilisateur (option perso premium ?).
- **Fonds à thème premium** (idée Michel) : packs de fonds stylés (dragon, espace, etc.) en bonus premium.
  ⚠️ **Droits d'auteur** : NE PAS utiliser de licences protégées (Dragon Ball, Mandalorian/Star Wars…) → illégal sans accord.
  Solution : créer des fonds **originaux "inspirés de"** (dragon original, ambiance sci-fi/guerrier…) ou utiliser des visuels libres de droits. Lisibilité du contenu à préserver (assombrir/flouter le fond derrière le texte).
- **Modèle économique (idée Michel)** : plusieurs **thèmes inclus dans le premium** + des **thèmes complémentaires payants à l'unité** (comme les skins de jeux vidéo → 2e source de revenus, fort attachement). Affichage **bandeau** recommandé (lisibilité). Visuels = illustrateur exclusif ou banques libres de droits.
- ⚠️ Garder la lisibilité et le contraste quel que soit le thème (lié à l'accessibilité).

**Fond sombre & batterie :** vrai sur écrans **OLED/AMOLED** (téléphones haut/milieu de gamme) — le noir = pixels éteints = **moins de conso**. Sur écrans **LCD**, pas de gain. Donc garder un **vrai noir** pour le thème nuit = bon pour l'autonomie sur OLED (+ confort visuel en salle sombre).

## ⚠️ Dropsets & superséries — fonctionnement + clarté UX à revoir

Le fonctionnement actuel des **dropsets** et **superséries** n'est pas satisfaisant et **pas assez clair pour l'utilisateur**.
À revoir : rendre évident où on en est (quel exercice/tour en cours, ce qui s'enchaîne, quand vient le repos),
et fluidifier le déroulé. → Faire une maquette claire de l'UX avant de recoder.

**Bug édition supersérie :** quand on **retire** un exercice d'un groupe, on ne peut **pas en rajouter** un ensuite ;
on est obligé de **tout effacer et refaire le regroupement**. → Permettre d'ajouter/retirer un exercice d'un groupe existant sans le détruire.

---

## ✅ PRIORITÉ #2 — Découper index.html — FAIT

Le JS est désormais **découpé en 8 fichiers** (`constants.js` · `state.js` · `screens.js` · `log.js` · `setup.js` · `tracking.js` · `coach.js` · `app.js`), chargés via `<script src>`. `index.html` (~1660 lignes) ne contient plus que l'HTML/les modales + 1 petite balise d'init. Bénéfice atteint : fichiers séparés = moins de bugs en cascade + Claude n'ouvre que le fichier concerné.

**Reste éventuel (non prioritaire, risqué)** : `log.js` (~3350 lignes) est le plus gros — pourrait être re-découpé un jour (séance / picker / timers / figurines), MAIS c'est le fichier le plus sensible (« zéro perte de séance ») → n'y toucher que s'il devient ingérable.

---

## 👆 Navigation — slider entre onglets

Pouvoir **glisser horizontalement** (swipe gauche/droite) pour passer d'un onglet à l'autre
(Accueil ↔ Progrès ↔ Séance ↔ Nutrition ↔ Coach), en plus du tap sur la barre du bas.
⚠️ Attention aux conflits avec le drawer Menu et les éléments qui glissent déjà.

---

# 💡 PROJETS À EXPLORER

## 🎓 Offre Débutant (nouvelle formule payante — idée Michel)

**Vision :** une offre dédiée aux **débutants** — le plus gros segment, le plus perdu au démarrage, et le plus fidèle si on l'accompagne bien. Un vrai « prends-moi par la main » de A à Z.

**Tarifs proposés (Michel) :**
- **Découverte** : 2 mois à **9,99 €**.
- **Renouvellement** : 4 mois à **14,99 €**.
- ⚠️ **Note de cohérence tarifaire à trancher** : 9,99 €/2 mois = **5,00 €/mois** ; 14,99 €/4 mois = **3,75 €/mois** → le renouvellement est **moins cher au mois** que la découverte. C'est défendable (« engage-toi plus longtemps, paie moins cher au mois » = logique d'abonnement classique + récompense de fidélité), mais à **valider consciemment**. Alternative si on veut « hameçon » : découverte moins chère puis prix plein.
- **Inclut le Premium** (Coach IA illimité, etc.) → l'offre Débutant est un **cran au-dessus** du Premium actuel (4,99 €/2 mois).

**Contenu de l'offre :**
- 📋 **Questionnaire de départ** : situer la personne (niveau, objectif, matériel dispo, fréquence, blessures, morphologie…) → base pour tout personnaliser.
- 🏋️ **Programme sur mesure** : exercices **simples**, adaptés débutant, avec **explications visuelles** (photo machine + GIF/mouvement + consignes de sécurité).
- 🍽️ **Conseils nutrition** de base (adaptés à l'objectif, pas une usine à gaz).
- 📈 **Suivi personnalisé** : stats dédiées + **évolution du programme selon les performances réelles** (surcharge progressive automatique, on complexifie quand la personne progresse).

**Synergie avec l'existant :** s'appuie fortement sur le **Coach IA** (déjà là), les **visuels d'exercices** (chantier en cours), le **profil avancé** (santé/blessures), et le système **premium** existant.

**Points techniques à cadrer (avant de coder) :**
- 💳 **Abonnement récurrent** : le premium actuel passe par **Ko-fi** (codes / webhook one-shot). Une offre avec **durées + renouvellements** demande une vraie gestion d'abonnement (Ko-fi **memberships**, ou Stripe plus tard) → à décider. Prévoir dates de début/fin, relance de renouvellement.
- 🧭 **Parcours guidé** : le questionnaire → génération de programme → suivi = un **flux onboarding** dédié (pas juste un écran de plus).
- 🔁 **Programme évolutif** : logique de progression automatique (quand valider une montée de charge/volume, quand complexifier un exercice).
- ⚠️ **Périmètre** : garder simple pour le débutant (ne pas noyer sous les options). L'offre = **accompagnement**, pas surcharge de features.

**Prochaine étape :** maquette du parcours (questionnaire → 1er programme → 1re semaine → suivi) + décision sur la brique paiement récurrent, avant tout code.

---

## 🎯 Exercices « ancre » vs « accessoire » (à explorer)

**Origine (méthode Michel) :** Michel structure ses séances avec **1 polyarticulaire + 1 isolation** sur le muscle visé, **+ 3 exercices complémentaires** qui n'ont pas forcément à voir avec le groupe du jour — volontairement, **pour la nouveauté** (garder le cerveau stimulé, éviter la lassitude / « j'ai la flemme, c'est toujours pareil »). **Contrepartie assumée :** il ne se « spécialise » pas et ne performe pas sur ces mouvements qui tournent.

**Constat :** beaucoup de pratiquants **font tourner leurs accessoires** (variété, motivation, adhérence). Résultat : la **courbe de progression** de ces exos est vide/en dents de scie (normal, ils changent) — alors que le suivi PR/1RM n'a de sens que sur les mouvements **répétés** (les « ancres »).

**Idée :** permettre de **marquer un exercice comme :**
- **🎯 Ancre** = mouvement suivi → on cherche la **surcharge progressive**, la courbe et les PRs comptent (ex. le polyarticulaire lourd du jour).
- **🔄 Accessoire** = juste **loggé** → compte pour le **volume** et le **diagramme des muscles**, mais **pas de pression PR** (pas de « faux décrochage » quand il change).

**Bénéfices :**
- Réconcilie les deux styles : progression **là où on la veut**, variété **partout ailleurs**, sans polluer les stats.
- L'onglet **Progrès** met en avant les **ancres** (courbes propres) ; les accessoires restent dans le volume/muscles sans encombrer.
- Colle à l'app existante : le **volume** et la **carte des muscles** ne dépendent déjà pas de la progression d'un exo précis.

**Pistes de mise en œuvre (léger) :**
- Un simple **drapeau** par exercice (`anchor: true/false`) — réglable au tap (ex. une petite étoile/épingle sur le bloc exo, ou dans le menu ⋯).
- Par défaut : rien n'est « ancre » → aucun changement pour l'existant. L'utilisateur épingle ses 1-2 ancres.
- Optionnel : le **Coach IA** pourrait dire « tu tournes beaucoup, pense à garder 1-2 ancres pour progresser » (info, pas leçon).

**À NE PAS faire :** imposer la distinction ou compliquer la saisie. Ça doit rester **invisible** pour qui s'en fiche, et **utile** pour qui veut suivre proprement.

---

## 🤖 Coach IA — qualité, engagement & personnalité (à explorer)

Objectif : augmenter la qualité **sans 2ème IA** (garder une seule IA, mieux la nourrir) et rendre le coach addictif.

**Déjà en place :**
- **Mémoire pour les membres premium** (le coach se souvient des échanges). → Atout fort : à mettre en avant et à enrichir.

**Pistes qualité :**
- Étendre/enrichir la mémoire (objectifs, blessures, historique d'échanges) — plus gros levier de qualité.
- Donner une vraie **personnalité** au coach (nom, ton) → les gens s'attachent à un personnage.
- Affiner les **instructions** (system prompt) : ton technique, précis, format des réponses.

**Pistes engagement / addiction (saine) :**
- Coach **proactif** : messages personnalisés au bon moment (félicitations après un PR, rappel doux, conseil du jour).
- Notifications intelligentes (pas du spam), streaks/régularité, check-in quotidien (« comment tu te sens ? »).
- Réponse instantanée 24/7 = avantage vs coach humain.

**Questions au-delà du sport :**
- Ouvrir aux sujets **sport, nutrition, sommeil, motivation, stress, mental** = compagnon de vie sportive.
- ⚠️ Rester dans ce domaine élargi (pas "tout" : identité + coûts API). ⚠️ Médical : orienter vers un pro, ne pas diagnostiquer (lié au profil avancé).

---

## 👩 Profil femme — thème féminin (priorité produit)

**Vision / opportunité :** vrai potentiel marché côté femmes — la plupart des apps de muscu
sont pensées "homme" puis juste repeintes en rose. Faire un thème femme **sérieux et abouti**
(pas cosmétique) peut être un vrai différenciateur. À traiter comme une priorité produit, pas un détail.

**Décidé :**
- **Thème optionnel** (activable/désactivable), pas imposé selon le sexe.
- **Figurines** : aujourd'hui ce sont des silhouettes d'homme → il faut une **silhouette femme**
  (utiliser/adapter l'asset existant `female-body.png` pour TOUTES les figurines en mode thème femme).

**À cadrer plus tard :**
- Accent couleur / palette du thème femme (garder charbon + variante d'accent ?).
- Ton des textes, objectifs par défaut (optionnel).
- Garder la cohérence avec l'identité Force Tracker — variante, pas refonte totale.

---

## 🩺 Profil avancé (Menu › Profil) — EN COURS

Profil avancé santé (tous champs **optionnels**) :
- 🩹 Blessures / limitations (zones : épaule, genou, dos, poignet… + en cours ou ancienne)
- 🫀 Pathologies (cardiaque, tension, diabète, asthme, hernie…)
- 💊 Traitements en cours (optionnel)
- 🤰 Grossesse (utile pour le futur profil femme)
- 📝 Note libre

Le **Coach IA** en tient compte (adapte exos/charges, évite contre-indications) — **jamais de diagnostic**, oriente vers un médecin.
**Disclaimer médical** affiché sur l'écran.
⚠️ **Données de santé sensibles (RGPD élevé)** : stockage privé, jamais partagé, suppression possible, champ optionnel + raison expliquée.

**Phrase pour Claude Code :**
> Ajoute un **Profil avancé santé** (Menu › Profil), tous champs **optionnels** : blessures/limitations (zones + en cours/ancienne), pathologies (cardiaque, tension, diabète, asthme, hernie…), traitements en cours, grossesse, note libre. Le **Coach IA doit en tenir compte** (adapter exos/charges, éviter les mouvements contre-indiqués) **sans jamais diagnostiquer** (orienter vers un médecin). Affiche un **disclaimer médical**. Données **sensibles** : stockage privé, jamais partagé, l'utilisateur peut **tout supprimer**.

---

## 🎤 Logging vocal de la séance

**Idée :** logger ses séries à la voix, mains libres.
- « Je vais faire du développé couché » → l'app insère l'exercice automatiquement.
- « Je viens de faire une série de 10 à 60 kilos, je valide » → la série est enregistrée.

**Comment ça marcherait :**
- `SpeechRecognition` (Web Speech API) transcrit la voix → texte.
- Parsing local simple pour les chiffres (« 10 à 60 » → reps 10, poids 60) afin d'éviter de cramer des appels IA.
- L'IA (Coach) ne sert que pour les cas ambigus / noms d'exercices flous.

**Points d'attention :**
- 🎧 **Bruit en salle** : privilégier le **push-to-talk** + **confirmation visuelle** avant validation (« Développé couché — 10 × 60 kg ? »).
- 🍎 **iPhone** : `SpeechRecognition` mal supporté dans une PWA Safari (contrainte technique, pas un blocage Apple). 🟢 Bien mieux sur Android/Chrome.
- 💎 **Modèle premium** : le Coach illimité est réservé aux membres premium. Décider si le logging vocal est premium, OU inclus pour tous grâce au parsing local.
- 🔁 Reconnaissance des noms d'exercices : rapprochement flou avec la liste d'exos existante.

**Prochaine étape :** maquette du flux (écoute → « j'ai compris : X » → confirmation → insertion) avant de coder.

---

## ⌚ Connexion objets connectés (Garmin, Fitbit, Apple Santé, Samsung Health)

Relier l'app aux montres/trackers pour récupérer FC, sommeil, calories, activité → nourrir le Coach et la récup.

**Réalité du chantier (par plateforme, pas un seul projet) :**
- **Apple Santé** : possible seulement depuis une **vraie app iOS** (pas une PWA). Nécessiterait de passer l'app en natif/wrapper iOS.
- **Samsung Health / Google Health Connect** : pareil côté **Android natif**.
- **Garmin / Fitbit** : ont des **API web** (OAuth) → jouables même en web, mais chaque intégration = compte développeur, validation, maintenance.
- ⚠️ Gros morceau : 4 écosystèmes = 4 intégrations différentes, + contraintes natives (l'app est une PWA aujourd'hui).

**Conseil :** ne pas tout faire d'un coup. Commencer par **1 source** (la plus demandée par tes users), idéalement une API web (Fitbit/Garmin) pour rester en PWA. Les intégrations Apple/Samsung impliquent de passer natif → décision produit majeure, plus tard.
**Note :** Michel utilise **Garmin** → bon candidat pour la 1ère intégration (API web, on reste en PWA).

---

## 📱 Rapprocher la PWA d'une vraie app native (faisable, progressif)

Sans passer par l'App Store, on peut rendre la PWA quasi indiscernable d'une app native. Pistes :
- **Installation propre** : icône, splash screen, plein écran sans barre d'URL (manifest PWA bien réglé). ← logo splash déjà prêt.
- **Mode hors-ligne** solide (Service Worker : l'app s'ouvre même sans réseau).
- **Notifications push** (web push) → rappels, coach proactif (limité sur iPhone, OK Android).
- **Gestes natifs** : swipe entre onglets, transitions fluides, retour haptique.
- **Vibrations**, garder l'écran allumé en séance, etc. (APIs web dispo).

**Limites à connaître :** iPhone bride certaines APIs web (push, reconnaissance vocale, capteurs). Pour 100% des capacités natives (Apple Santé, etc.) → wrapper natif (Capacitor) un jour. Mais une PWA bien faite couvre déjà ~90% du ressenti natif.
*(Irritants concrets écran éteint / rotation / touches fantômes → déplacés dans « Bugs à corriger ».)*

## 🎯 Principe directeur (vision Michel)

Le **PWA bien structuré** est un pari d'avenir crédible face au natif — **à condition** d'être rigoureux sur la structure.
- **La structure prime** : sans architecture claire, Claude Code développe « comme il peut » → dette + bugs. C'est à NOUS de cadrer (fichiers séparés, conventions, tableur/base propres).
- **Garder la main** : s'informer un minimum sur les choix techniques pour **repérer les limites de Claude** (il ne voit pas toujours les problèmes) et valider les décisions, sans devenir développeur.
- Structurer AVANT d'empiler les fonctionnalités (rejoint priorité #1 affichage + #2 découpe).
- Changer de techno (framework React/Vue/Angular) = réflexion **très long terme, NON prioritaire** ; le vanilla bien découpé suffit largement.

## 🛡️ Construire proprement — l'app est en production

L'app devient **complète et complexe**, et **des gens l'utilisent vraiment** → plus le droit aux bugs/régressions.
La construire **proprement** pour qu'elle tienne dans la durée. Principes à appliquer systématiquement :
- **Toujours une branche Git** dédiée + commit « ça marche » avant toute modif (retour arrière facile).
- **Une seule chose à la fois**, testée avant de passer à la suivante (écran par écran).
- **Tester sur Chrome ET Safari/iPhone** avant de déployer (PWA = comportements différents).
- Garder le **backend Apps Script intouché** sauf besoin explicite ; `.claspignore` à jour (ne jamais uploader maquettes/`support.js`).
- Bumper le cache Service Worker (`ft-vN`) à chaque release.
- La **priorité #2 (découper index.html)** sert directement cet objectif : moins gros fichier = moins de régressions.

---

## 🏗️ Optimisation & architecture (à anticiper — l'app grossit)

L'app devient complète → penser à la **solidité de la fondation** avant d'empiler les fonctionnalités.

**Base de données :**
- Aujourd'hui les données passent par **Google Sheets** (via Apps Script) → simple mais **pas fait pour grandir** (lenteur, limites, fragile avec beaucoup d'utilisateurs).
- À terme : migrer vers une **vraie base de données** (ex. Firebase/Firestore, Supabase) → plus rapide, plus fiable, gère mieux la montée en charge, l'authentification, le temps réel.
- ⚠️ Gros chantier (migration des données + réécriture des accès). À planifier, pas dans l'urgence.

**Hébergement / support adapté :**
- Aujourd'hui : **GitHub Pages** (gratuit, simple, mais basique).
- Si l'app grandit (base de données, comptes, paiements premium, images/GIF) → un hébergement plus adapté (Firebase Hosting, Vercel, Netlify…) facilitera tout.

**Optimisation perçue (faisable plus tôt, moins lourd) :**
- Compression des images/GIF, chargement à la demande (lazy-load), bon cache Service Worker.
- Réduire les appels réseau inutiles.

**Ordre logique :** d'abord stabiliser (bugs + découpe index.html), PUIS base de données + hébergement quand le nombre d'utilisateurs le justifie.

## 🌈 Version daltonien (accessibilité) — à prévoir

Prévoir un **mode daltonien** : ne pas reposer uniquement sur la couleur pour transmettre l'info
(ex. vert = bon / rouge = alerte). Ajouter icônes/formes/textes en complément, et proposer des
**palettes adaptées** (deutéranopie, protanopie, tritanopie). À cadrer comme option d'accessibilité.

## ♿ Autres options d'accessibilité — à prévoir

- **Mode « bigleux » / basse vision** : option **gros texte / contraste renforcé** (tout doit rester lisible et ne pas casser la mise en page).
- **Gaucher / droitier** : pouvoir **basculer les éléments d'action** (boutons, validation, FAB) côté gauche ou droit selon la main dominante.
- **Usage à une main** : actions clés atteignables au pouce (bas de l'écran), cibles ≥ 44px — déjà amorcé en séance, à généraliser.

## 👁️ Ergonomie de lecture & d'usage — vérifier (à appliquer partout)

- **F-pattern** : organiser l'info selon la façon dont l'œil lit (important en haut/à gauche, balayage en F) → titres, chiffres clés et actions placés là où le regard tombe en premier.
- **Thumb zone** : placer les actions principales dans la **zone d'atteinte du pouce** (bas de l'écran), réserver le haut à l'info/lecture.
À vérifier sur **chaque écran** lors des prochaines passes design.

**⭐ Manipulation au pouce = facteur clé.** On utilise l'app en salle, souvent à **une main** → toutes les actions
fréquentes (valider une série, +/- poids/reps, naviguer, lancer le repos) doivent être atteignables **au pouce, sans se contorsionner**.
À traiter comme un critère de conception central, pas un détail : tester chaque écran « une main » avant de valider.
**Gaucher vs droitier :** la zone du pouce est **inversée** (droitier = côté droit, gaucher = côté gauche).
→ Ne pas figer toutes les actions d'un seul côté ; la **bascule gaucher/droitier** (voir accessibilité) déplace les
éléments d'action du bon côté. Michel est **gaucher** → tester aussi en gaucher, pas seulement en droitier.
**Important :** l'écart gauche/droite doit rester **léger** → l'utilisateur ne pensera pas forcément à régler sa main.
La disposition **par défaut doit déjà bien marcher pour les deux** (actions centrées/atteignables) ; la bascule est un **bonus**, pas un prérequis.

## 📗 Refaire le fichier Excel/Sheets de synchro (proprement)

Un fichier tableur (Excel/Google Sheets) **synchronisé avec l'app** avait été créé → à **refaire correctement**.
- C'est la couche de données actuelle (via Apps Script) → structure soignée = moins de bugs.
- À cadrer : colonnes/onglets clairs (séances, exercices, PRs, nutrition, profil…), format stable que l'app lit/écrit,
  cohérent avec une future migration base de données (voir section Optimisation & architecture).
- ⚠️ Lien direct avec la robustesse : un tableur mal structuré = source de bugs de synchro.

## 🗂️ Ranger le dossier forcetracker (PC) — à faire

Le dossier local du projet est en désordre. À réorganiser proprement :
- Séparer le **code de l'app** (index.html, Code.js, sw.js, assets, anatomy/muscles/…) des **fichiers de design/handoff** (maquettes, `support.js`, dossiers `design_handoff_*`) qui NE doivent PAS être poussés par clasp.
- Vérifier le **`.claspignore`** (ne jamais uploader maquettes/support.js → cause du crash passé).
- Ranger les exemples/tests (PDF, GIF logo) dans un sous-dossier à part.
- **Note :** Michel a déjà ajouté des dossiers d'**images musculaires** et d'**exercices** → bien les classer/nommer dans cette structure (ex. `assets/muscles/`, `assets/exercices/`) et vérifier qu'ils sont référencés au bon chemin + bien gérés par le cache.

---



## 🤖 Milo « au top / très évolué » — priorité Michel (2026-07-08)
- **Objectif Michel** : Milo doit être le plus avancé possible, **d'abord pour lui** (déjà sur Opus depuis @68), Christophe ensuite. Continuer à enrichir : contexte, mémoire, nouvelles capacités.
- **Lire un bilan sanguin** (idée validée, à concevoir à froid) : même moule que le bilan corporel (photo/PDF → IA `importBodyScan`-like → stockage daté → suivi → Milo).
  - Marqueurs utiles muscu : testostérone, ferritine/fer, vitamine D, CRP/CK, glycémie/HbA1c, cholestérol/lipides, thyroïde.
  - ⚠️ **MÉDICAL — garde-fous stricts obligatoires** : Milo ne pose JAMAIS de diagnostic, ne dit JAMAIS « c'est normal/OK », renvoie SYSTÉMATIQUEMENT vers le médecin sur toute valeur hors norme. Contexte entraînement/récup/nutrition uniquement. Disclaimers partout. Données privées (local + cloud perso).
  - Michel très clair : « on ne rigole pas avec ça, ça peut vite faire peur s'il dit de la merde ». → concevoir messages + disclaimers avec soin avant de coder.

---

## 📦 STOCKAGE / PRÊT POUR LE GRAND PUBLIC — chantier pré-lancement (décidé avec Michel, 2026-07-08)

**Constat (mesuré au banc d'essai « utilisateurs fantômes », 2026-07-08) :**
- Le cloud (Script Properties `u_{email}`) est plafonné (~9 Mo TOTAL, tous utilisateurs confondus).
- Mesuré par utilisateur : léger ~8 Ko · moyen sans photo ~68 Ko · lourd avec photos ~295 Ko.
- Capacité actuelle ≈ **~130 utilisateurs sans photo, ~30 avec photos** → OK pour une **bêta** (amis/famille), PAS pour un vrai grand public.
- Frontend testé **très robuste** : 0 plantage avec 120 ou 500 séances, profil vide, données cassées.

**Ce qui est DÉJÀ propre (rien à faire) :**
- **3 photos morpho**, **PDF/photos bilan sanguin**, **photo bilan corporel (balance)** → **jamais stockées** (analysées puis jetées, on ne garde que le résultat). ✅
- **PDF de programme** → fabriqués à la volée, **jamais stockés**. ✅
- **4 photos de comparaison** (suivi photos super-testeur) → stockées **sur le téléphone SEULEMENT** (local, jamais cloud) → n'impactent PAS la limite 9 Mo. ✅

**Le VRAI poste qui remplit le tiroir 9 Mo = les PHOTOS D'EXERCICES** (photos de machines que l'utilisateur colle sur un exo : `S.exPhotos` + `customExercises[].img`, ~10-15 Ko chacune, sync cloud).

### ✅ DÉCISION MICHEL : déplacer les photos d'exercices sur Google Drive
- **But** : vider le petit tiroir de 9 Mo (le seul vrai frein au grand public). Photos de machines = **rien de sensible** → Drive privé (voire lien partagé) suffit, la sécurité n'est pas un enjeu ici.
- **Deux caches à NE PAS confondre :**
  1. **Figurines** (animations d'exercices, `exercises/*.webp`) = assets de l'app, **déjà précachés par le SW à l'installation** (barre d'installation ft-v314) → hors-ligne OK, **on n'y touche pas**.
  2. **Photos machines de l'utilisateur** (nouveau, via Drive) : téléchargées au 1er affichage puis **mises en cache runtime sur le téléphone** (même idée) → hors-ligne OK **après la 1re fois**. C'est ce qui règle le seul compromis (voir ci-dessous).
- **Compromis à gérer** : sans cache, une photo Drive ne s'affiche pas hors-ligne (règle d'or n°4). → prévoir un **cache SW runtime** pour ces images (fallback figurine muscle en attendant).
- **Plan technique** (backend Code.js `handleSaveProfile_` + frontend `_exImg`) :
  - À la sauvegarde : si `exPhotos`/`customExercises[].img` arrive en base64 → écrire le fichier dans un **dossier Drive dédié** (privé), stocker seulement l'**ID/URL Drive** dans la propriété (plus de base64 dans le tiroir).
  - `loadProfile` renvoie les URLs ; `_exImg(name)` sait afficher une URL Drive (+ cache SW).
  - **Migration one-time** des photos base64 existantes → Drive, **sans perte** (règle d'or n°3).
  - ⚠️ Liens Drive directs pour `<img>` = capricieux (format Google change) → **tester sur le clone** avant.
- **PRÉREQUIS** : touche au backend → nécessite l'**auto-déploiement** (GitHub Action, secret `CLASPRC_JSON` à poser 1× depuis le PC) OU le PC de Michel. Je ne peux ni déployer ni tester le backend d'ici (proxy bloque script.google.com).
- **Ordre conseillé** : (1) brancher l'auto-déploiement → (2) je prépare tout le code + test sur le clone → (3) déploiement **la nuit**, **branche + tag de backup d'abord**, rollback prêt (règles d'or n°6 et n°8).

### 🚀 Autres points « prêt pour le grand public » (rappel)
- **Coût Milo** (API Anthropic) : garde-fous limites gratuites + estimation budget mensuel avant d'ouvrir en grand.
- **Confidentialité / RGPD** : page de confidentialité claire (données santé/photos), message visible « 🔒 tes photos ne sont jamais enregistrées » sur morpho/bilans.
- **Décider public/privé** : bilan sanguin (bêta Michel-only), boîte à idées (testeurs), etc.
- **Vérifier la limite Google exacte** du store de propriétés (le ~9 Mo est la note projet ; à confirmer).

---

## 👩 PROFIL FEMME / THÈME FEMME — à approfondir (priorité produit, Michel 2026-07-08)

Michel : « améliore le profil femme, faudra vraiment qu'on le fasse aussi, il reste pas mal de choses à faire et pas mal de tests ». → gros chantier transverse (profil + nutrition + coach + visuels), à découper en petites étapes testées, **une à la fois**, avec de **vraies testeuses** (Eline, Emma).

**Déjà en place (la base existe) :**
- Phase du cycle menstruel → nutrition + contexte Milo ; endométriose (condition santé femme-only).
- Morphologie féminine (H/A/V/X/O) + sections genre-aware ; niveaux de force gendrés (`getLevel`).
- Milo : ton adapté (plus à l'écoute, sans materner) ; masse grasse US Navy avec hanches (formule femme).
- Parcours débutant : nuance femme (Poussée de Hanche / Abduction) — sans cliché, elles travaillent tout.

**À faire / améliorer :**
- 🎨 **Figurine muscle FÉMININE** : aujourd'hui la silhouette muscle est **masculine pour les deux sexes** (échecs iOS WebKit sur `female-body.png` ; dead code `_mscSVG_F`/`_BDY_F`/`_BDY_F_MINI` déjà présent). → reprendre proprement avec un **SVG féminin natif** (pas d'`<image>` + filtre CSS, ça casse sur iOS).
- 🌸 **Cycle menstruel enrichi** : suivi plus complet (symptômes, SPM, humeur/énergie par phase), **adaptation de l'entraînement par phase** (folliculaire = pousser fort / lutéale = alléger), prédiction + rappels.
- 🍽️ **Nutrition femme** : accent fer & calcium, macros de cycle affinées ; option **ménopause** (métabolisme, densité osseuse, protéines).
- 🏋️ **Accents de programme (sans cliché)** : fessiers/hanches, plancher pelvien, haut du corps — options, pas des cases par défaut.
- 🤰 **Grossesse / post-partum** (à décider si dans le scope) : mode « prudence » avec garde-fous médicaux stricts (même logique que le profil santé).
- 🗣️ **Contenu & vocabulaire** : guides/aides avec exemples féminins, éviter le tout-masculin par défaut dans les textes.
- 🧪 **Beaucoup de tests** avec testeuses réelles avant de reporter comme fini.

⚠️ Ne PAS tomber dans le cliché « rose + cardio » : les femmes soulèvent lourd aussi. L'idée = **options et adaptations physiologiques réelles** (cycle, insertions, objectifs), pas un thème gadget.

---

## 🔒 SÉCURISATION DE L'APP — prérequis BLOQUANT avant le grand public (Michel 2026-07-08)

Aujourd'hui l'app est pensée pour un **petit cercle de confiance**. Avant d'ouvrir à des inconnus (surtout avec des **données santé**), 3 vraies faiblesses à corriger :

1. **Pas de vraie authentification (LE point n°1).** L'identité = **juste l'email** (pas de mot de passe, pas de jeton). Quelqu'un qui connaît/devine un email peut charger ou écraser les données de l'autre (`loadProfile?email=…` / `saveProfile`). Faible risque entre potes, **inacceptable** en grand public avec des bilans santé. → **vrai système de comptes** (email+mot de passe hashé, ou connexion Google/OAuth).
2. **Backend ouvert à tous → abus + coût.** La web app Apps Script est « Anyone can access ». N'importe qui peut marteler l'action `coach`/`importBloodTest`/… et **faire exploser la facture Anthropic** (ou spammer). → **rate-limiting** par personne + **clé secrète** app↔serveur + quotas.
3. **Données sensibles (santé) — accès & RGPD.** Bilans/santé dans Script Properties + backups Drive, liés à l'email. → contrôle d'accès (découle du n°1) + idéalement chiffrement + **page de confidentialité RGPD**.

*(Déjà connu : `ADMIN_CODE` dans le JS public = anti-curieux seulement, pas un vrai verrou. Le premium est vérifié côté serveur (OK), mais le flag client se triche — fuite de revenu, pas de risque utilisateur.)*

**Vérité honnête / stratégie :**
- La vraie sécurité = **comptes côté serveur**, et les points n°1, n°2, n°3 ET la migration stockage (photos/9 Mo) **pointent tous vers la MÊME chose** : **vrais comptes + vraie base de données + hébergement adapté** (le gros chantier « phase 4 »).
- ⚠️ **Ne PAS bricoler une auth fragile sur la fondation actuelle** (Apps Script + Script Properties n'est pas fait pour l'auth) : ce serait du **jetable** (refait lors de la migration DB) ET un **faux sentiment de sécurité** (dangereux sur des données santé). Mieux vaut faire les deux **ensemble, proprement** (ex. Firebase Auth / Supabase).
- **Blocage déploiement** : tout ça touche le backend → nécessite l'**auto-déploiement** (secret CI) ou le PC ; je ne peux ni déployer ni tester le backend d'ici.

**Ce qui peut avancer SANS le gros chantier (faible risque, testable frontend) :**
- Échappement/sanitisation du contenu utilisateur injecté en `innerHTML` (noms, notes, programmes importés) → anti-injection (XSS). Balayage soigneux, à faire prudemment.
- Design/plan détaillé du système de comptes (options A/B + reco) pour être prêt.
- Garde-fous coût Milo (limites gratuites solides) — partie frontend possible, partie serveur à déployer.

**Décidé avec Michel** : noter comme **prérequis bloquant** en tête de la check-list grand public. Le gros du travail (auth serveur) se fait **avec** la migration base de données, la nuit, branche + tag de backup, rollback prêt.

### ✅ AVANCEMENT « grand public » — session 2026-07-08 (déployé en prod)
- 💸 **Garde-fou coût IA** — FAIT (@ backend) : `_aiQuotaBlock_` limites journalières par email + global, réglables via Script Properties `AI_EMAIL_MAX`/`AI_GLOBAL_MAX`, suivi via `?action=aiUsage&token=FT_IDEES_2026`.
- 📦 **Stockage 9 Mo** — FAIT (ft-v326) : photos d'exercices (exPhotos + customExercises[].img) rendues **local-only** (retirées du payload cloud, backend nettoie l'existant). Le tiroir ne grossit plus des photos. (Drive écarté : servir des `<img>` depuis Drive = fragile/déprécié + Apps Script ne sert pas d'image binaire ; le vrai cloud-photos = hébergeur d'images avec la migration DB.)
- 📧 **Confirmation email (soft)** — FAIT (ft-v325) : code 6 chiffres par email (GmailApp) à l'inscription, badge « ✅ Email confirmé », ne bloque jamais l'app. 1re brique des comptes + preuve de possession de l'email.
- 🤖 **Auto-déploiement backend** — FAIT : GitHub Action (clasp 3.3.0), plus besoin du PC de Michel.

### 🔒 MOTS DE PASSE / COMPTES — design retenu (à faire AVEC la base de données, décidé 2026-07-08 : « on attend »)
Michel a choisi d'**attendre** (le faire proprement avec la vraie DB, pas bricolé sur Apps Script — risque n°1 = bloquer des gens hors de leurs données). **Design validé à implémenter le moment venu** :
- **Mot de passe OPTIONNEL (opt-in), rétro-compatible, ne bloque JAMAIS un utilisateur existant.**
- Poser un mot de passe = **confirmer l'email d'abord** (le code déjà en place) → preuve de possession → personne ne vole un compte sans accès à l'email.
- Une fois posé : `loadProfile`/`saveProfile` exigent un **token** (émis au login email+mot de passe). Comptes **sans** mot de passe = comportement actuel inchangé (pas de token requis) → zéro lockout.
- « Mot de passe oublié » → code email → nouveau mot de passe.
- Hash salé + itéré (Apps Script n'a pas bcrypt → PBKDF2-like via SHA-256, ou mieux : le faire côté vraie DB/Firebase Auth). ⚠️ La partie « verrou sur la synchro » touche le cœur → par étapes, branche + backup, tests.

### ⏳ Restent pour le grand public
- 🔒 **Vrais comptes / mots de passe** (design ci-dessus, avec la DB).
- 🗄️ **Vraie base de données + hébergement** (va avec les comptes + le vrai cloud-photos).
- 📄 **Page de confidentialité RGPD**.

## 🐛 BUG À INVESTIGUER (signalé 2026-07-12, à voir plus tard)
**Annotations sur un programme → « ça fout le bordel ».** Un utilisateur a mis des annotations/notes sur son programme et ça casse quelque chose (affichage ? chargement en séance ? sauvegarde ?). Détails à préciser avec Michel. Pistes : notes de jour (`day.note`) / notes d'exercice (`ex.note`) dans un programme importé ou édité, peut-être un souci d'échappement HTML, de rendu, ou de conflit avec le parsing d'import. À reproduire + corriger.

## 🌍 TRADUCTION DE L'APP (branche feat/traduction-app) — points clés notés 2026-07-12
Quand on traduira l'app dans d'autres langues, penser au **Coach IA (Milo)** :
- Le cerveau de Milo (`buildCoachContext`, coach.js) commence par « Tu es Milo… **Tu réponds TOUJOURS en français** ». → à rendre **adaptatif** : « réponds dans la LANGUE de l'utilisateur » (langue de l'app / du profil).
- La consigne « **langue soignée** » (aujourd'hui « français soigné » : traduire les anglicismes, « de zéro » pas « from scratch »…) doit valoir **dans chaque langue** (pas d'anglais parasite quel que soit l'idiome).
- Toutes les sections du contexte Milo (méthode, raisonnement, modèle) sont en français → à traduire ou à laisser en français avec instruction « réponds en {langue} » (Claude traduit très bien à la volée, mais mieux vaut au moins traduire l'intro + la langue de réponse).
- Reste de l'app : `WHATS_NEW`, `NEW_FEATURES`, `_HELP_DATA`, `_DRAWER_CONTENT`, textes UI (index.html) — gros chantier i18n (clés de traduction).

## 😴 IMPORT DONNÉES SOMMEIL/SANTÉ (Garmin & wearables) — idée notée 2026-07-12
Michel a un export **Garmin** (CSV : date, score, qualité, durée, heure coucher/lever par semaine). Idée : **importer** ces données dans l'app (comme les bilans de balance via `handleImportBodyScan_`) → alimente le `sleepLog` + donne à Milo une vraie vision de la récup.
- Format Garmin CSV connu (colonnes ci-dessus). Montre surtout l'IRRÉGULARITÉ (coucher de 22h à 4h43) et des durées 5h30-8h30.
- Contexte Michel (à retenir pour le coaching) : **travail de nuit + astreintes + 2e job** → sommeil forcément irrégulier, PAS un manque de volonté. Milo doit composer avec (principe « adapter à la vie réelle » ajouté à buildCoachContext le 2026-07-12).
- Piste : import CSV (SheetJS déjà présent) ou photo du récap Garmin (vision IA). À voir au retour de Michel.

## 🎓 PROCHAINES « LEÇONS » POUR MILO (roadmap, notée 2026-07-12)
Milo a déjà : méthode + raisonnement + modèle pro + adaptation vie/travail. À enrichir (par ordre d'intérêt discuté avec Michel) :
1. **Nutrition « facile »** (LE gros pain point — « la nutrition c'est pénible pour tout le monde ») : cerveau nutrition + rendre ça SIMPLE/indolore, pas obsessionnel.
2. **Récup/sommeil** : exploiter le sommeil (régularité, dette) + import Garmin.
3. **Prépa compétition** (Michel prépare « les Jeux ») : périodisation bloc, affûtage/tapering, gestion semaine de compét.
4. Technique par exercice (cues détaillés gros mouvements), lecture des courbes de l'app pour décider.

## 🎨 COULEURS PAR GROUPE MUSCULAIRE (idée Michel, notée 2026-07-16 — « on verra plus tard »)
Idée : donner une **couleur par groupe musculaire** pour repérer d'un coup d'œil, dans une séance / un programme / l'historique, ce qui est jambes, pecs, dos… (Michel : « une palette de couleurs différente »).
- **⚠️ Piège = le dosage.** 12 groupes → si fonds pleins colorés partout = **arc-en-ciel fatigant** qui casse l'identité rouge/propre de l'app. À éviter absolument.
- **Approche recommandée (discutée)** : touche **discrète**, pas de fond plein. Ex. **fine barre de couleur à gauche** de chaque bloc d'exercice, ou petite **pastille/étiquette**. Icône de muscle éventuellement teintée.
- **Couleurs par FAMILLES** (pour rester harmonieux, pas 12 couleurs qui se battent) : 🟢 bas du corps (Jambes/Fessiers/Mollets) = verts · 🔴 Pectoraux = rouge (couleur identité) · 🔵 Dos/Trapèzes/Lombaires = bleus · 🟣 Épaules = violet · 🟡 Bras (Biceps/Triceps/Avant-bras) = ambre/or · 🟠 Abdominaux = orange.
- **Où l'appliquer** : d'abord la **séance** (blocs d'exercice) + l'**historique/programmes** (là où scanner aide). Le sélecteur a déjà ses icônes de muscles → pas prioritaire.
- **Méthode** : prototyper **sur le clone** (`/clone/`) sur UN écran (blocs séance), version « barre de couleur à gauche », **testé jour + nuit + affichage agrandi**, Michel valide sur iPhone → si OK, promotion en prod. Sinon on annule sans risque.
- Le groupe d'un exercice se lit dans `EXLIB` (`.g`) ; certains exos sont dans 2 groupes (squat = Jambes+Fessiers) → décider quelle couleur montrer (le 1er groupe ? le muscle principal ?).
