# Force Tracker — Idées & projets futurs

Fichier de notes : bugs à corriger, fonctionnalités à explorer. Rien ici n'est en cours.

---

## 📤 EXPORTER **SEULEMENT L'HISTORIQUE DES SÉANCES** — à faire (noté le 23/08/2026)

> Michel : *« rajoute à la liste aussi la possibilité d'exporter que l'historique des séances »*.

**Ce qui existe déjà** (vérifié dans le code — `#ov-export-choix`, `index.html`) : la modale
d'export propose **deux** boutons, *Exporter* et *Exporter **avec mes discussions***. Le premier
envoie déjà **tout** le reste : séances, records, bilans, programmes, **santé**, mémoire de Milo.
Il n'existe aucun moyen de n'emporter **que** l'entraînement.

**Ce qui manque** : un **troisième** choix, plus étroit que les deux autres — *les séances, rien
d'autre*.

### ⭐ Pourquoi ça compte plus qu'un confort

Le fichier d'export sert **à être donné** : à ChatGPT pour une analyse, à une autre app, à un
coach, à moi pour déboguer. Or aujourd'hui **le seul geste possible est « tout donner »**. Le
bandeau d'avertissement de la modale le dit déjà pour les discussions — *« tu y parles de ton
corps, de ton moral, de tes blessures »* — mais **le même argument vaut pour le bilan sanguin, le
bilan corporel, le TRT et le profil santé**, qui partent aujourd'hui dans l'export « normal » sans
que rien ne le signale.
👉 *Un export tout-ou-rien pousse à partager plus que nécessaire.* C'est un sujet de
**confidentialité** (Constitution), pas seulement d'ergonomie.

### ⛔ Les points à trancher AVANT de coder (ne pas les découvrir en route)

- **Que contient exactement « l'historique des séances » ?** `S.sessions` seul, ou aussi
  `S.prs` (les records) et `S.programmes` ? *Un historique sans records se lit mal ; des records
  sans dates ne servent à rien* (leçon ft-v660). **Proposition** : séances + records + poids de
  corps, **rien de santé, rien de nutrition, rien de Milo**.
- **Le format** : le même JSON que l'export complet (donc **réimportable**), ou un fichier plus
  lisible pour un humain / une IA ? ⚠️ **R2** — si on invente un 2ᵉ format, il divergera. Partir
  du JSON existant en **retirant** des clés, jamais en réécrivant un exporteur.
- **Le nom du fichier doit dire ce qu'il contient** (`forcetracker-seances-…`), sinon on
  redonnera le mauvais fichier par erreur.
- **R13** : la modale a déjà le bon motif (des **boutons**, pas des cases — voir le commentaire
  au-dessus de `#ov-export-choix`, où les cases à cocher ont été retirées exprès). Un 3ᵉ bouton,
  pas une case.

⏭️ **Non commencé.** Noté pendant la nuit du 23/08, à côté du chantier « intégration des
informations des codes-barres et des scans » et de l'inversion des boutons de la nutrition.

---

## ✅ LE SCORE DE RÉCUPÉRATION DIT CE QUI MANQUE POUR ARRIVER À 100 — LIVRÉ (ft-v952, 21/08/2026)

> ⭐ **Fait le jour même.** Michel : *« ET reprend mon idée aussi pour la recup faut pas l'oublier »*.
> **Le détail par facteur existait déjà** (`calcRecoveryDetail` rend `{ic,label,val,why}`) — la
> première étape « gratuite » ci-dessous n'a rien coûté et la réponse était oui.
> ⭐⭐ **Et sa parenthèse était CALCULABLE** : âge et tabac sont les deux facteurs permanents →
> à 48 ans et fumeur, le maximum atteignable est **93**, pas 100.
> ⛔ **L'arbitrage A/B ci-dessous a été tranché autrement, et c'est mieux** : ni A ni B seul, mais
> **l'échelle absolue GARDÉE + le plafond AJOUTÉ**. Re-barêmer « sur 93 » aurait réécrit
> silencieusement tout l'historique — un 85 d'il y a trois mois n'aurait plus voulu dire la même
> chose. *On n'efface pas l'information, on arrête juste de la reprocher* — et on ne touche pas
> aux courbes passées.
> ⏭️ **Ce qui reste ouvert** : rien sur cette idée. Gardé ici pour la trace du raisonnement.

## 🔋 (l'idée d'origine, telle qu'elle a été notée)

> *« merde je viens d'avoir une idée, par rapport à la récupération, je marque sinon je vais
> oublier, on a le score de récupération mais il faudrait rajouter la donnée où on arrive à 100
> (bon sauf moi qui suis fumeur) »*

**L'idée** : le score de récup donne un **nombre**, il ne dit pas **ce qui coûte les points
manquants**. Or c'est la seule information sur laquelle on peut agir. Un 72 sans explication est
un jugement ; « 72 — il te manque surtout du sommeil cette semaine » est un levier.

⭐ **C'est le motif « informer sans décider » (R29/R24)** : quand l'app renonce à trancher, elle
**affiche les éléments** au lieu de poser une question à l'aveugle. Ici elle a déjà les éléments —
elle ne les montre pas.

### ⚠️⚠️ Et la parenthèse de Michel est le point le plus important, pas une blague

*« sauf moi qui suis fumeur »*. **Si un facteur PERMANENT plafonne le score, le 100 devient
inatteignable — et un plafond invisible transforme un outil de progrès en reproche quotidien.**
C'est exactement ce que la Constitution interdit (P21, adapter plutôt qu'interdire ; la
nutrition/le suivi ne doit jamais coûter plus de stress qu'il n'apporte).

**Deux façons de traiter ça, à trancher :**

| | Approche | Ce que ça donne |
|---|---|---|
| **A** | Le 100 reste absolu | Honnête, mais un fumeur voit un plafond qu'il ne peut pas atteindre — et il le voit **tous les jours** |
| **B** | Le 100 est **ton** 100 | Le score se lit *« par rapport à ce que TU peux atteindre »* — ce qui est le sujet du produit (*« il se souvient de qui tu es devenu »*) |

⭐ **Penchant : B**, mais **sans jamais cacher le A**. Le facteur permanent est nommé une fois,
calmement, sans moraliser — et il n'est pas répété chaque jour. *On n'efface pas l'information,
on arrête juste de la reprocher.*

⛔ **Et surtout : aucun conseil d'arrêter de fumer.** Ce n'est ni le rôle de l'app ni celui de
Milo (Constitution P13 : accompagnement, jamais thérapie). On dit ce que ça coûte **si on le
demande**, on ne le rappelle pas spontanément.

### 👉 Avant de coder — les 3 questions de R3
① **Qui produit la donnée ?** — le score existe déjà ; il faut savoir s'il expose son détail par
facteur ou seulement un total. ② **Qui l'exploite ?** — l'écran Accueil, et Milo. ③ **Quel
comportement change ?** — la personne sait sur quoi appuyer. Les trois ont une réponse → l'idée
est recevable.

⏭️ **Première étape, gratuite** : ouvrir le calcul du score et mesurer **s'il garde le détail par
facteur ou s'il l'écrase dans un total**. Sans ce détail, il n'y a rien à afficher — et c'est
peut-être là que se trouve le vrai travail.

---

## 🥑 EN RECOMP, LE PLAFOND DE LIPIDES EST TRÈS SERRÉ (Michel, 22/08/2026, usage réel)

> *« les lipides je sais mais il y a un sujet sur les lipides justement »*, après avoir buté
> deux fois dans la même soirée (huile d'olive + fromage au dîner, puis des œufs entiers).

**Le constat** : en recomposition, les lipides ne représentent que **17 % des calories** (63 g
pour lui, à 3 360 kcal). C'est la conséquence directe des protéines très hautes (2,6 g/kg) et des
glucides cycling (ft-v951) — à calories fixes, monter les deux revient forcément à comprimer le
troisième. **Un peu d'huile de cuisson + du fromage suffit à épuiser tout le budget du jour**, et
un œuf entier (contrairement à ce qu'on pourrait croire d'un aliment « protéiné ») est en réalité
assez gras (~9-10 g/100 g).

⚠️ **Ce n'est pas un bug** — le calcul est exact et cohérent (vérifié le 22/08 : TDEE 3 510 −
250 + 100 phase = 3 360, retombe pile). C'est une **tension de conception réelle** : un plafond de
lipides aussi serré est difficile à respecter avec une cuisine normale (huile, fromage, œufs
entiers), pas seulement avec des excès.

**Pistes à explorer si ça revient** (aucune tranchée) :
- un **plancher de lipides plus généreux** en recomp (aujourd'hui le ratio est fixe à 0,85 g/kg,
  pas ajusté par objectif) ;
- ou une **explication à l'écran** quand le plafond est atteint tôt dans la journée, du même
  esprit que la carte du plancher calorique (ft-v906) — nommer le fait plutôt que le laisser
  surprendre en soirée.

**Critère de retour à 3 paliers (R22)** : c'est la 1ʳᵉ fois qu'il le signale → on **observe**. Pas
d'action tant que ça ne revient pas une 2ᵉ ou 3ᵉ fois.

## 🤸‍♂️ ÉCHAUFFEMENT & MOBILITÉ — le dossier à construire (Michel, 18/08/2026)

> Michel, entre deux sujets nutrition : *« l'échauffement avant une séance de muscu et la mobilité,
> un dossier qu'il faudra construire aussi »*. **Noté ici pour ne plus avoir à y penser** — on reste
> sur la nutrition. Rien à faire maintenant.

**⚠️⚠️ NE PAS CONFONDRE AVEC LA MONTÉE EN CHARGE — c'est le premier piège de ce dossier.**
Ce qui est **déjà construit** (ft-v887, ft-v890, `_completerMonteeEnCharge` / `_repsPalier` dans
`log.js`), ce sont les **paliers d'échauffement d'un exercice** : 60 → 90 → 110 avant 130 kg, avec
la dose qui dépend de la place dans la séance et les répétitions qui décroissent. C'est de
l'**échauffement SPÉCIFIQUE**, sous forme de séries, dans la séance.
Ce que Michel demande ici est **l'autre échauffement** : les **5-10 minutes AVANT de toucher une
barre** — élever la température, faire circuler, ouvrir les épaules et les hanches — et la
**mobilité** comme pratique à part entière (avant, après, ou un jour à elle).

**⭐ LE CONSTAT QUI JUSTIFIE LE DOSSIER, vérifié dans le code (18/08)** : la consigne existe, mais
**seulement dans le TEXTE**. `coach.js` dit à Milo *« Bâtir une séance : échauffement 5-10 min
OBLIGATOIRE (mobilité) »* — et **rien, nulle part, ne le collecte, ne le mesure ni ne l'affiche**.
Pas de champ, pas d'écran, pas de trace dans l'historique. Milo le recommande, l'app l'ignore :
c'est **R4 dans sa définition même** (l'information ne descend jamais jusqu'à la donnée) et **R3**
(aucun comportement observable). Et c'est **exactement le motif qui a produit le bug du 10/08** :
la même phrase disait « mobilité + 1-2 séries légères », le modèle a suivi la lettre, et il a fallu
sortir le calcul du prompt pour le mettre dans le code.
👉 **Donc le vrai sujet de ce dossier n'est pas d'écrire une liste d'étirements : c'est de décider
ce qui devient une DONNÉE.**

**Les questions à trancher le jour où on le construira** (aucune n'est tranchée aujourd'hui) :
- **Est-ce que ça se logge ?** Une case « échauffement fait », une durée, des mouvements nommés ?
  Ou rien du tout — et alors Milo n'a pas le droit d'en parler comme d'un fait (R29).
- **Est-ce que ça s'adapte à la séance ?** L'app connaît déjà les **régions travaillées** du jour
  (`_mscScores`, R31) : un échauffement d'épaules avant un développé, de hanches avant un squat,
  se **déduit** — il n'a pas à être demandé.
- **Zones fragiles.** Quelqu'un qui a déclaré une épaule sensible n'a pas le même échauffement.
  ⚠️ Le **Gardien** est déjà propriétaire de cette information (`_gardienZones`) — on la lit, on
  ne la re-demande pas et on n'en fait pas une 2ᵉ copie (**R2**).
- **La frontière médicale.** Échauffement et mobilité ≠ rééducation. La Constitution s'applique :
  adapter, jamais prescrire un soin, et renvoyer au professionnel de santé sur une douleur.
- **Le coût en temps.** Le reproche du 16/08 (*« j'ai passé presque la moitié de ma séance sur des
  exercices d'échauffement »*) vaut d'avance ici : une routine longue ne sera pas faite. Court,
  ciblé, ou rien.

**🔗 Où ça se rattache** : la **mobilité** a déjà sa place dans la vision *« Les PRATIQUES
d'entraînement »* (plus bas dans ce fichier, 27/07) — cardio · mobilité · pilates · yoga · préhab.
**Ne pas créer un module « mobilité » séparé** le jour venu : c'est une *pratique* parmi les autres,
et l'audit d'architecture de cette section-là a déjà conclu qu'aucune refonte n'est nécessaire.
L'**échauffement**, lui, est plus proche de la séance elle-même — il est probablement le premier
morceau à construire, parce qu'il est **déductible** de ce que l'app sait déjà.

*Priorité : après la nutrition. Ne ralentit rien.*

---

## 🫀 POLAR ACCESSLINK — la piste sérieuse pour les données physiologiques (11/08/2026)

> Née de la question des calories (`docs/CALORIES-SOURCES.md`). Proposition de ChatGPT, vérifiée
> et **amendée** ici. Michel possède une **ceinture Polar H10** et une **Garmin**.

### ✅ Ce qui est vrai et intéressant

L'**API Polar AccessLink v4** (OAuth2, officielle) permet à une application autorisée de récupérer,
**après** la séance : durée exacte · calories calculées par Polar · FC moyenne/max · **échantillons
de FC à la seconde** · zones de FC · et, sur les appareils qui le gèrent, un objet `completedSets`
avec le début/fin de chaque série et sa FC moyenne/max. Plus un **profil physique** : poids, FC de
repos, FC max, seuils aérobie/anaérobie, VO₂max.

**L'intérêt réel, et il est grand** : Force Tracker connaît l'heure exacte de chaque série. Aligner
les deux sources donnerait, pour CHAQUE série, la réponse cardiaque et la **vitesse de récupération**
— une lecture physiologique que personne d'autre n'a, parce que personne d'autre n'a les deux moitiés.

**Et l'avantage décisif sur le Bluetooth web** : ça marche sur iPhone, puisque le navigateur n'a
rien à faire — tout passe par le serveur. Pas de Bluefy, pas de coque native.

### ⚠️ Les trois questions que la proposition ne posait pas

**1. La H10 seule ne crée PAS de séance dans Polar Flow.** C'est un capteur. Vérifié dans la
documentation Polar : elle a bien une mémoire interne (1 séance, jusqu'à 30 h, 1 mesure/seconde),
**mais il faut lancer l'enregistrement depuis l'application Polar Beat**. Sans ça, AccessLink n'a
rien à servir.
👉 **Michel a répondu : *« c'est moi qui la déclenche »*** — il lance donc déjà l'enregistrement à
la main. **Ce n'est donc PAS un obstacle pour lui** : la donnée existe dès ce soir, sans une ligne
de code. *Ça reste un obstacle pour un utilisateur ordinaire* (deux applications à lancer à chaque
séance) — mais c'est une question de produit, pour plus tard, pas un blocage technique aujourd'hui.

**2. `completedSets` n'est probablement pas accessible avec une H10.** Ce champ vient de la
fonction « musculation » des **montres** Polar, pas d'un capteur de poitrine. À vérifier avant de
construire quoi que ce soit dessus — c'est pourtant le champ le plus séduisant de la proposition.

**3. ⭐ Et surtout : ça ne résout TOUJOURS PAS la question des calories.** Une courbe de FC parfaite,
alignée série par série, ne devient pas des kcal tant qu'aucune équation validée n'existe pour la
musculation (`docs/CALORIES-SOURCES.md` §11 : Keytel surestime, et la FC monte en musculation pour
des raisons qui ne sont pas de la consommation d'oxygène). Ajouter « + réponse cardiaque réelle »
à un modèle **sans coefficient sourcé**, c'est exactement l'*« approximation sophistiquée qui donne
l'illusion d'être scientifique »* — la mise en garde venait de ChatGPT lui-même.

### 👉 Ce qu'on en retient

**La bonne raison de faire AccessLink n'est PAS les calories.** C'est la **lecture physiologique** :
récupération entre séries, réponse à l'effort, état de forme du jour. Ça, c'est solide, mesurable,
et personne ne le fait en croisant avec les charges soulevées.

**Le coût honnête** : compte développeur Polar, parcours OAuth2, stockage des jetons, écran de
consentement, et des **données de santé** de plus — donc ça vient s'ajouter au chantier RGPD déjà
identifié comme bloquant avant le grand public.

**Déclencheur pour rouvrir le sujet** : quand la question RGPD/authentification sera traitée, ou
si un testeur équipé Polar le demande. **Pas avant** — et surtout pas pour améliorer un chiffre de
calories qu'aucune équation ne sait produire.

### 🤖 ANDROID CHANGE LA DONNE (pour le H10 en direct) — et pas pour Michel (11/08, via GPT)

**Le fait est exact, vérifié** : **Chrome sur Android supporte le Web Bluetooth**, iOS ne le supporte
sur **aucun** navigateur (c'est le moteur de Safari qui est imposé à tous). Donc, sur un téléphone
Android, Force Tracker pourrait lire la ceinture **en direct, depuis la page web**, sans Bluefy et
sans coque native. C'est propre, et c'est à garder.

**⚠️ MAIS ÇA NE DÉBLOQUE RIEN AUJOURD'HUI, et il faut le dire** : Michel est sur **iPhone**. Une
fonctionnalité qui marche chez tout le monde sauf chez la personne qui la teste ne se construit pas
en premier. Et le principe posé le 22/07 tient toujours : *« le natif ne doit apporter que ce que le
web ne peut pas offrir »* — ici, ce serait plutôt *le web ne l'offre que sur la moitié des
téléphones*, ce qui est le pire cas pour une PWA (deux comportements à maintenir, deux aides à
écrire, deux sources de bugs).

**Ce qui reste vrai et utile** : si un testeur Android équipé d'un cardio se présente, c'est **le**
chemin à essayer — quelques dizaines de lignes, aucun compte développeur, aucune donnée qui sort du
téléphone (l'argument RGPD le plus fort de tout ce dossier).

### ⌚ FITBIT — un 3ᵉ avis, pas une 3ᵉ vérité (11/08, via GPT)

L'API Fitbit expose bien la **FC intraday** et les **calories/MET à la minute**. C'est séduisant, et
**le piège est là** : le MET rendu par Fitbit **n'est pas une mesure**, c'est **l'estimation de
Fitbit** — exactement l'objet qu'on cherche à valider. *On ne calibre pas une estimation avec une
autre estimation ; on constate juste qu'elles ne sont pas d'accord.* (GPT le dit d'ailleurs
lui-même, honnêtement.)

**Deux réserves concrètes** : ① l'API **intraday** n'est pas ouverte par défaut — il faut déclarer
une application « personnelle » (accès à ses propres données) ou demander une autorisation à Fitbit ;
② un bracelet au **poignet** mesure la FC par capteur optique, et c'est précisément ce qui se dégrade
sur les mouvements de musculation (poignet plié, main serrée, vibrations) — le reproche que Michel
faisait déjà à sa Garmin : *« le problème de Garmin c'est qu'il enregistre mal les mouvements »*.

**Ce que ça vaut quand même** : une **3ᵉ estimation indépendante** dit quelque chose d'utile — la
**dispersion**. Si l'app, la Polar, la Garmin et Fitbit donnent 255 · 310 · 420 · 380 kcal pour la
même séance, le vrai résultat n'est pas « laquelle a raison » (personne ne le sait) mais **« aucune
n'est fiable à ±25 %, donc on affiche une fourchette »** — et ça, c'est directement actionnable.

**⛔ On n'achète rien pour ça.** Si Michel a déjà le bracelet, on note la colonne ; sinon le protocole
ci-dessous suffit.

### 📌 Et la seule chose utile à faire MAINTENANT

Rien de tout ça n'est nécessaire pour savoir si le modèle actuel est dans le bon ordre de grandeur.
**Trois séances, quatre chiffres notés à la main** (app · Polar · Garmin · durée). *Le carnet bat
l'API cette semaine.*

---

## 🇷🇺 LE MULTILINGUE EXISTE ET N'EST BRANCHÉ NULLE PART (trouvé le 11/08/2026)

> **Michel, cette nuit** : *« continue de bosser sur l'application en russe »*. En m'y mettant,
> j'ai trouvé autre chose.

**`translations.js` n'est chargé par AUCUNE page.** Il n'est pas dans les `<script src>` de
`index.html`, pas dans le `PRECACHE` du service worker, référencé nulle part dans le code. Le
fichier vit dans le dépôt et **ne s'exécute jamais**.

**Ce qu'il contient pourtant, et qui marche** :
- **5 langues** — français · anglais · espagnol · grec · **russe** (`LANG_NAMES`, `LANG_FLAGS`) ;
- **252 textes d'interface** déjà traduits dans les 4 langues ;
- un moteur de traduction **par parcours du DOM** (`_apply`) + un `MutationObserver` qui
  retraduit ce qui s'affiche après coup — donc **aucun câblage à faire écran par écran** ;
- `window.t(fr)` avec repli propre sur le français.

**Ce que j'ai ajouté cette nuit** : les **324 noms d'exercices en russe**. C'était le vrai trou —
l'interface parlait russe, mais l'écran Séance, le sélecteur et l'historique restaient en français,
c'est-à-dire **la partie qu'on lit le plus**. Vérifié : 324/324 couverts, **aucune collision** (deux
exercices ne partagent jamais le même nom russe — deux entrées identiques dans le sélecteur seraient
pires que le français), aucun mot français resté par mégarde.

**⚠️ Ça ne change RIEN tant que le fichier n'est pas chargé** — et c'est volontaire : brancher le
multilingue est une décision produit, pas une correction de bug. Ce qu'il faut peser :

| | |
|---|---|
| **Pour** | l'app devient utilisable par un russophone (Tatiana), et par 4 langues de plus. Le travail est **déjà fait à 95 %**. |
| **Contre** | +64 Ko de JS **à chaque ouverture** (règle d'or #4 : ouverture instantanée) ; un `MutationObserver` qui écoute **tout le DOM** en permanence ; et il faut un **sélecteur de langue** quelque part. |
| **À vérifier avant** | que la traduction du DOM ne casse rien sur l'écran Séance (le plus dynamique) ; et **faire relire le russe par une personne native** — c'est moi qui l'ai écrit, pas un russophone. |

**⚠️ Et une question à trancher avant tout** : ce fichier a-t-il été **retiré exprès** ou jamais
branché ? L'historique git ne le dit pas (il n'apparaît que dans un commit de juillet, et
`index.html` ne l'a **jamais** chargé). *Du code orphelin ne prouve rien* (**R30**) — donc on
demande au lieu de supposer.


---

## 🎥 ANALYSE VIDÉO DE LA TECHNIQUE — l'idée est bonne, le mur n'est pas là où on croit (11/08, via GPT)

> 📄 **Dossier complet et roadmap : `docs/MOVEMENT-ANALYSIS-ROADMAP.md`** (document séparé du
> chantier calories, exprès). Ce qui suit en est le résumé.

> **Michel : « je balance et tu mets pour le suivi de ma réflexion »** — donc c'est archivé, pas
> décidé. Rien n'est engagé ici.

**Ce que propose GPT, et il a raison sur le fond** : ne PAS payer une API d'analyse à chaque vidéo.
Utiliser un modèle de détection de squelette **qui tourne dans le téléphone** (MediaPipe Pose,
MoveNet), en tirer les points articulaires, et écrire **nos propres règles** dessus (angle du genou,
profondeur, inclinaison du buste, symétrie, vitesse). Le modèle est gratuit et connu ; l'intelligence
est dans **nos** règles. Coût serveur marginal ≈ 0, et **la vidéo ne quitte pas le téléphone** —
argument commercial ET argument RGPD, sur un chantier déjà identifié comme bloquant.

**⭐ Ce que ça a de juste pour NOUS en particulier** : on a déjà 355 fiches d'exercices structurées,
avec leurs muscles écrits. Y accrocher « angles à analyser · amplitude attendue · erreurs
détectables » prolonge un actif existant au lieu d'en créer un nouveau (**R13**). Et ça reste
local-first (**R16**).

**⚠️ MAIS LE VRAI OBSTACLE N'EST PAS CELUI QU'IL CITE, et il faut l'écrire avant de s'emballer :**

1. **Une caméra 2D ne mesure pas un angle.** La « profondeur du squat » vue de trois quarts, avec un
   téléphone posé au hasard sur un banc, n'est pas la même que vue de profil. L'angle mesuré dépend
   d'abord **d'où est le téléphone**, ensuite du mouvement. Annoncer « amplitude 92 % » sur une
   mesure qui bouge de 15 % selon le cadrage, c'est **de la fausse précision** — exactement ce qu'on
   vient de refuser sur les calories, et ce serait pire ici parce que le chiffre a l'air objectif.
   → Toute V1 devrait commencer par **refuser d'analyser** une vidéo mal cadrée, avant de savoir
   analyser quoi que ce soit. *Savoir s'arrêter* (Principe 18).
2. **Le poids embarqué.** MediaPipe/TF Lite en web, c'est plusieurs Mo de WASM + modèle. L'app n'a
   ni bundler ni build step, et la **règle d'or #4** (ouverture instantanée à la salle) interdit de
   les charger au démarrage. C'est faisable — chargement uniquement à l'ouverture de la
   fonctionnalité — mais c'est une architecture à poser exprès, pas un ajout.
3. **La Constitution tranche déjà le discours** : jamais « détecte tes blessures », jamais de
   diagnostic. GPT le dit aussi. On peut dire « voici ce que je vois de ton exécution », pas
   « tu as un problème ».

**⚠️ Et une remarque d'ensemble** : c'est GPT lui-même qui écrivait, dans sa synthèse calories du
même jour, *« ne pas construire trop vite l'infrastructure »*. Ça vaut ici. Une analyse vidéo est
**plus grosse** que tout ce qu'on a livré cet été.

**Déclencheur pour rouvrir** : quand le RGPD/authentification sera traité (c'est le vrai bloquant
commun), et pas avant que la question des calories soit refermée. **Le premier pas honnête, s'il
arrive, n'est pas « analyser un squat » — c'est « dire à la personne si sa vidéo est exploitable ».**

---

## ✅ EXERCICES UNILATÉRAUX — LIVRÉ le 11/08/2026 (ft-v832)

> **✅ FAIT.** Les 48 exercices sont dans `EXLIB` (constante `EX_UNI`, clé = l'identifiant), le
> volume double, la pastille 🔀 « par bras / par jambe » s'affiche en séance avec son aide, et Milo
> reçoit la liste + la règle du poids qui bouge + l'interdiction de compter les séries en double.
> **22 témoins permanents**, 23 rouges au contrôle négatif. Détail : journal `ft-v832`.
>
> **⏭️ CE QUI RESTE OUVERT, et c'est une décision de Michel, pas un oubli :**
> · **l'historique d'avant la bascule** n'est pas corrigé (marqueur `sess.uniConv`) — son curl noté
>   60 kg (2 × 30) resterait juste en charge mais quadruple en volume s'il était recalculé.
>   Michel : *« laisse pour l'instant »*. Le jour où on décidera, ce sera une **migration explicite**
>   qui pose `uniConv:1` sur les séances reprises, jamais un changement de `_workVol` ;
> · **un côté plus faible ne peut pas s'exprimer** (28 à droite, 26 à gauche) — renoncement assumé,
>   à rouvrir seulement si un testeur le demande (R22) ;
> · les **séances importées** (photo/PDF d'un ancien carnet) ne reçoivent pas `uniConv` : on ne sait
>   pas sous quelle convention elles ont été notées, donc on ne double rien.

<details><summary>📜 Le dossier complet (méthode, critère, revue des 57 exercices) — gardé pour la mémoire</summary>

### La liste à cocher par Michel (ouvert le 10/08/2026)

> **D'où ça vient** : Michel note son Rowing Haltère « 56 kg » alors qu'il a **28 kg dans une main**.
> L'app n'a **aucune notion** d'unilatéral : elle compte le volume, les records et le 1RM comme si
> c'était une charge à deux bras. *« L'exercice c'est le bon ? Parce que c'est unilatéral »* — et
> *« Milo, lui, savait que sur certains exercices c'était à 1 bras »*. L'app, non.
>
> **⛔ POURQUOI ON NE DEVINE PAS D'APRÈS LE NOM** — c'est tout le sujet, et c'est vérifié :
> « Haltère » au singulier **ne veut pas dire « un bras »** (Pull-over Haltère, Hip Thrust Haltère,
> Leg Curl Haltère : deux mains sur un seul haltère). Un balayage par mots-clés sur les 355
> exercices remonte « Écarté Haltères » et « Kettlebell Swing » (bilatéraux) et **rate « Rowing
> Haltère »**, le cas qui a tout déclenché. Une liste **choisie à la main** est la seule option
> (R29 : le droit de deviner dépend du coût de l'erreur — ici l'erreur fausse les records).

**À faire quand Michel aura coché** : marquer ces exercices `uni:true` dans `EXLIB`, doubler le
volume, afficher « par bras / par jambe » dans la séance, et le dire à Milo dans le format de séance.

### ⭐⭐ LA RÉPONSE ÉTAIT DÉJÀ DANS LES FIGURINES (Michel, 10/08)

*« C'est ça, normalement dans les figurines que je t'ai passées il y a marqué unilatéral. »*
**Vérifié : il a raison, et ça change la méthode.** Le nom de fichier de la figurine porte
l'information que le nom de l'exercice ne porte pas — c'est **R31** en action (*la figurine est le
vocabulaire du système*), et c'est une source **vérifiable** au lieu d'une liste de mémoire.

**15 figurines sur 303 portent la marque** (`unilateral` · `un-bras` · `alterne` · `iso-laterale`).
**Trois d'entre elles sont des exercices dont le NOM ne dit rien :**

| Exercice | Sa figurine | Vérifié en OUVRANT le dessin |
|---|---|---|
| **Rowing Haltère (Tirage Horizontal)** | `rowing-haltere-un-bras.webp` | ✅ un genou sur le banc, **un seul haltère**, un bras — le cas de départ de Michel |
| **Curl Haltères** | `curl-halteres-**alterne**.webp` | ✅ deux haltères tenus, mais **un seul bras monte à la fois** — donc **son cas biceps est faux aussi** |
| **Meadows Row** | `rowing-unilateral-landmine-meadows-row.webp` | (nom de fichier ; dessin non ouvert) |

**⚠️ « alterné » n'est PAS « unilatéral », et la différence compte** : au curl alterné il tient
**deux** haltères (30 dans chaque main) mais chaque biceps ne voit jamais que **30**. Au rowing il
n'y a qu'**un seul** haltère, et la série se refait de l'autre côté. Le total à noter n'est donc pas
calculé pareil dans les deux cas.

**Et la figurine tranche déjà une de mes hésitations** : `extension-nuque-haltere-assis.webp` montre
**deux mains sur un seul haltère** → **Extension Nuque Haltère est BILATÉRALE**. (Une image
`triceps-haltere-un-bras.webp` traîne d'ailleurs dans le dossier **sans être rattachée à aucun
exercice** — c'est la version à un bras du même mouvement, assis sur un banc.)

### 🔬 LES 15 FIGURINES, OUVERTES UNE PAR UNE (10/08, à la demande de Michel)

| Exercice | Ce que le DESSIN montre | Verdict |
|---|---|---|
| Rowing Haltère (Tirage Horizontal) | genou sur le banc, **1 haltère**, 1 bras | ✅ unilatéral |
| Curl Haltères | **2 haltères** tenus, **1 seul bras monte** | ✅ alterné |
| Développé Couché Unilatéral Kettlebell | allongé, **1 kettlebell**, 1 bras | ✅ unilatéral |
| Développé Épaules Unilatéral Élastique | 1 bras pousse, l'autre main à la hanche | ✅ unilatéral |
| Élévations Latérales Unilatérale Poulie | 1 bras lève le câble | ✅ unilatéral |
| Meadows Row | landmine, 1 bras sur le bout de la barre | ✅ unilatéral |
| Tirage Vertical Alterné Élastique | vu de dos, **1 seul bras tire** | ✅ alterné |
| Extension Quadriceps Unilatérale | machine assise, **1 jambe** étend | ✅ unilatéral |
| Extension Quadriceps Unilatérale Machine à Dips | debout, 1 jambe | ✅ unilatéral |
| Leg Curl Unilatéral Debout | 1 jambe fléchit | ✅ unilatéral |
| Soulevé de Terre Roumain Unilatéral | en équilibre sur **1 jambe**, 1 haltère | ✅ unilatéral |
| **Tirage Iso-Latéral Hammer Strength** | **LES DEUX BRAS tirent ensemble** (revérifié sur 4 images) | ❌ **BILATÉRAL** |
| **Presse à Cuisses Iso-Latérale** | **LES DEUX JAMBES poussent ensemble** (revérifié sur 4 images) | ❌ **BILATÉRAL** |
| Hip Thrust Unilatéral | image 1 = deux pieds au sol (**la mise en place**) ; **dès l'image 4 la jambe est en l'air** | ✅ unilatéral |
| Rowing Unilatéral Élastique | **un seul bras tire**, l'autre est posé sur le genou | ✅ unilatéral |

**⭐ LE RÉSULTAT QUI COMPTE — « ISO-LATÉRAL » NE VEUT PAS DIRE « UN À LA FOIS ».** C'était
exactement mon hésitation, et le dessin la tranche : sur une machine iso-latérale, les deux bras (ou
les deux jambes) ont des **bras de levier indépendants**, mais on pousse **ensemble**. Ces deux-là
sont donc **bilatéraux** — les ajouter à la liste aurait **divisé les charges par deux à tort**.
*Le nom de fichier disait le contraire du dessin.*

**⭐⭐ ET LA VRAIE LEÇON EST UNE LEÇON DE MÉTHODE — les figurines sont ANIMÉES.**
J'avais d'abord classé le **Hip Thrust Unilatéral** et le **Rowing Unilatéral Élastique** comme
« douteux, le dessin contredit le nom ». Michel a corrigé de mémoire, sans ouvrir le fichier :
*« le premier, tu as raison pour la 1ʳᵉ partie du gif, mais quand le gif avance il y a un pied au
sol et le 2ᵉ pied en l'air ; et le 2ᵉ non, un seul bras qui tire, le 2ᵉ est sur le genou. »*
**Vérifié image par image : il a raison sur les deux.**

**La cause** : **304 figurines sur 306 sont des WebP ANIMÉS** (12 à 24 images). Quand je les ouvre,
je ne vois que **l'image 1** — c'est-à-dire, très souvent, la **POSITION DE DÉPART** : le moment
précis où le mouvement n'a pas encore commencé, donc où les deux pieds sont encore au sol et où
les deux bras pendent. **J'ai jugé 15 exercices sur leur pose d'avant l'exercice.**

*C'est le cousin exact de R28/R31 — « ouvrir le dessin » — mais en plus vicieux : j'AI ouvert le
dessin. Ce que je n'avais pas vu, c'est que le dessin BOUGE.* La règle à retenir :
**pour juger un mouvement sur une figurine, extraire plusieurs images, jamais la première seule.**
(Recette : `PIL.Image.seek(i)` sur 4 images réparties, collées côte à côte.)

**Et j'ai refait mes 2 verdicts « bilatéral » avec cette méthode** — parce que je les avais pris
sur l'image 1 comme les autres, et qu'une erreur de méthode ne se répare pas à moitié. Ils
tiennent : les deux bras tirent ensemble, les deux jambes poussent ensemble.

**Bilan des 15 : 13 unilatéraux · 2 bilatéraux** (les deux machines « iso-latérales »).

**⚠️ ET CE BALAYAGE NE SUFFIT PAS** : il ne trouve que les figurines dont on a **pensé** à marquer le
nom de fichier. **Curl Concentré**, **Squat Bulgare**, **Fentes**, **Kickback** sont unilatéraux et
n'ont **aucune** marque. La figurine **complète** la liste choisie à la main ; elle ne la remplace pas.

**⚠️ Le nom de fichier est un INDICE, pas une preuve** : c'est le **dessin** qui fait foi (R31 —
*avant de déclarer qu'une distinction est impossible, ouvrir le dessin, pas seulement la table qui
nomme*). Les figurines des 15 restent à ouvrir une par une avant de figer quoi que ce soit.
Et à l'inverse, une figurine **sans** marque ne prouve pas que l'exercice est bilatéral : le fichier
a pu être nommé sans y penser (ex. `curl-concentre.webp`, qui est pourtant à un bras).

<!-- SPEC-UNILATERAL-DEBUT -->
### 🛠️ COMMENT ÇA SE NOTE — la décision de Michel (10/08/2026)

*« Pas possible de faire 50 séries. Il faut intégrer comme avant 3 séries × X kilos, mais dans la
logique on sait qu'il faut faire une série à gauche et une à droite, et il faudra mettre le poids
de l'haltère et pas le doubler. »*

**C'est la règle, et elle est plus simple que tout ce qu'on avait envisagé :**

| | Ce qu'on saisit | Ce que l'app en déduit |
|---|---|---|
| **Séries** | **3** (comme avant) | 3 à gauche **+** 3 à droite = 6 séries réellement faites |
| **Charge** | **le poids de l'haltère** (28), **jamais le total** | c'est bien 28 kg que le muscle a tenu |
| **Volume** | — | **×2** (les deux côtés comptent) |
| **Record / 1RM** | — | calculé sur **28**, la vraie charge d'un côté |
| **Affichage** | — | « 3 × 8 à 28 kg **par bras** » |

**⭐ Pourquoi c'est juste** : saisir 6 lignes serait fidèle mais **insupportable à noter en salle** —
et l'ouverture instantanée / la simplicité passent avant l'exactitude comptable (règle d'or #4,
R24). L'app **sait** que la série se refait de l'autre côté : elle n'a pas besoin qu'on le lui
tape deux fois. *L'information est dans le TYPE de l'exercice, pas dans la saisie.*

**⚠️ Ce que ça implique, à ne pas oublier en codant :**
- le **volume** d'une séance change (×2 sur ces exercices) → l'historique déjà saisi ne sera plus
  comparable au nouveau, **à trancher avec Michel** (voir la section « historique déjà saisi ») ;
- le **temps de repos** entre gauche et droite n'est pas un vrai repos — à ne pas déclencher comme
  un repos de fin de série (à vérifier au moment de coder) ;
- **un côté plus faible ne peut pas s'exprimer** dans ce modèle (28 à droite, 26 à gauche). C'est
  un renoncement **assumé** : le cas est rare et le coût de la saisie double le serait pour tout
  le monde. À rouvrir seulement si un testeur le demande (R22).

### ✅ LA CONVENTION EST TRANCHÉE — et ses deux réponses n'en font qu'une

*« Pour moi en bilatéral c'est le poids total. »* (Michel, 10/08) — avec, pour l'unilatéral,
*« mettre le poids de l'haltère et pas le doubler »*.

**⭐ CE SONT DEUX FORMULATIONS DE LA MÊME RÈGLE, et c'est ça qui rend la chose codable :**

> **On note le poids qui BOUGE pendant la répétition.**

Vérifié sur les quatre cas qui posaient problème :

| Exercice | Ce qui bouge pendant la rep | On note |
|---|---|---|
| Développé Incliné Haltères | les **2** haltères montent | **60** (2 × 30) |
| Rowing Haltère | **1** haltère monte | **28** |
| Curl Haltères (alterné) | **1** haltère monte, l'autre pend | **30** |
| Squat Bulgare | les **2** haltères descendent avec le corps | **40** (2 × 20) |

**⭐⭐ LA CONSÉQUENCE QUI SIMPLIFIE TOUT** : le marqueur « unilatéral » **ne touche plus du tout à la
charge**. Il ne sert qu'à **doubler le volume** et à afficher « par bras / par jambe ». Il n'y a donc
**aucune convention à retenir par exercice** — une seule phrase couvre les 355. *Deux règles qui se
ressemblent finissent toujours par diverger ; une seule, non* (R2).

**Et ça règle le cas mixte tout seul** : le Squat Bulgare prend le **total** (les deux haltères
bougent) **et** le volume ×2 (la série se refait de l'autre côté). Les deux mécanismes sont
indépendants, donc ils ne se contredisent jamais.

**⏭️ Il ne reste plus qu'une décision, et elle porte sur le PASSÉ** : les séances déjà saisies en
unilatéral (Rowing à 56, Curl à 60) sont fausses au regard de cette règle. On les laisse (un
décrochage visible dans la courbe) ou on les corrige ? **À trancher avec Michel** — ne rien
réécrire tout seul.

<!-- SPEC-UNILATERAL-FIN -->

<!-- REVUE-UNILATERAL-DEBUT -->
### ✔️ REVUE TERMINÉE — 57 exercices tranchés par Michel (10/08/2026)

> **Méthode** : 2 figurines **animées** à la fois, il tranche. Aucune supposition : chaque verdict
> vient d'un dessin regardé, ou de son jugement quand il n'y a pas de figurine.

**⭐⭐ LE CRITÈRE, ET C'EST LUI QUI L'A DONNÉ** — sur le Soulevé de Terre Valise, où la charge est
d'un seul côté mais où les deux jambes poussent : *« bah c'est entre les 2 lol… met uni vu que ça
doit être fait de l'autre côté aussi. »* **C'est LA définition à coder** : ce qui compte n'est pas
combien de membres travaillent, c'est **si la série se refait de l'autre côté** — parce que c'est
exactement ce qui double le volume et ce qui rend la charge notée trompeuse.

#### 🔀 UNILATÉRAUX (48)

Arraché Haltère (Dumbbell Snatch) · Chariot de Puissance — Fentes Arrière · Cossack Squat · Curl Araignée (Spider Curl) · Curl Concentré · Curl Haltères · Développé Couché Unilatéral Kettlebell · Développé Épaules Unilatéral Élastique · Extension Fessiers Arrière (Kickback) · Extension Quadriceps Unilatérale · Extension Quadriceps Unilatérale Machine à Dips · Extension Triceps Concentrée Poulie · Fentes · Fentes Arrière · Fentes Croisées (Curtsy Lunge) · Fentes Kettlebell · Fentes Latérales · Fentes Marchées · Hip Thrust Unilatéral (Poussée de Hanche) · Kickback Machine · Leg Curl Unilatéral Debout · Meadows Row · Montée sur Box (Step-up) · Montée sur Box Haltères · Presse à Cuisses sur le Côté · Renegade Row · Rotation Externe Épaule Abduction · Rotation Externe Épaule Haltère · Rotation Externe Épaule Poulie · Rotation Externe Épaule Élastique · Rotation Interne 90° Poulie · Rotation Interne Épaule Élastique · Rowing Haltère (Tirage Horizontal) · Rowing Unilatéral Élastique · Smith Machine Fentes · Soulevé de Terre Roumain Unilatéral · Soulevé de Terre Valise (Suitcase) · Split Squat TRX (Sangles) · Split Squat Élastique (Fente Statique) · Squat Bulgare · Squat Bulgare Élastique · Squat Pistol · Squat Pistol TRX (Sangles) · Tirage Vertical Alterné Élastique · Élévation Latérale Inclinée Haltère · Élévation Latérale Landmine · Élévations Latérales Unilatérale Poulie · Élévations Mollets Unilatéral

#### ⚖️ BILATÉRAUX — les faux amis (9)

Curl Zottman · Extension Triceps Arrière (Kickback) · Leg Curl Haltère · Marteau · Presse à Cuisses Iso-Latérale · Rowing Landmine (T-Bar) · Seal Row · Tirage Iso-Latéral Hammer Strength · Élévations Mollets Penché (Donkey Calf Raise)

⚠️ **Ceux-là comptent autant que les autres** : les ranger en unilatéral aurait **divisé les charges
par deux à tort**. Trois venaient de MES paris, corrigés par Michel ou par le dessin — le **Marteau**
(*« en même temps, même si c'est rare de le faire »*), l'**Extension Triceps Arrière**, et les deux
machines **« iso-latérales »** (iso-latéral = bras de levier indépendants, PAS un à la fois).
*Une liste faite de tête se serait trompée sur 4 des 9.*

#### ⚠️ LE CAS MIXTE, à ne pas oublier en codant

**Squat Bulgare** : **une** jambe travaille, mais la personne tient **deux** haltères. Le poids noté
est donc bien le total des deux — alors que la SÉRIE, elle, se refait de l'autre côté. « Unilatéral »
ne dit donc pas à lui seul comment lire la charge : il faut aussi savoir **combien d'engins** sont
tenus. Même chose au Cossack Squat (1 haltère à 2 mains) et à la Montée sur Box.
→ C'est exactement pourquoi la question de la convention (**poids d'UN haltère ou TOTAL ?**) reste
à trancher AVANT de coder : voir la section plus haut.
<!-- REVUE-UNILATERAL-FIN -->

</details>


### ✅ Ceux dont je suis sûr (à confirmer quand même)

| Groupe | Exercices |
|---|---|
| **Dos** | Rowing Haltère (Tirage Horizontal) · Rowing Unilatéral Élastique · Meadows Row · Renegade Row · Tirage Vertical Alterné Élastique |
| **Épaules** | Développé Épaules Unilatéral Élastique · Élévations Latérales Unilatérale Poulie · Élévation Latérale Landmine · Élévation Latérale Inclinée Haltère · Rotation Externe Épaule (Poulie · Élastique · Haltère · Abduction) · Rotation Interne Épaule Élastique · Rotation Interne 90° Poulie |
| **Triceps** | Extension Triceps Arrière (Kickback) · Extension Triceps Concentrée Poulie |
| **Biceps** | Curl Concentré |
| **Pectoraux** | Développé Couché Unilatéral Kettlebell |
| **Jambes** | Squat Bulgare (+ Élastique) · Squat Pistol (+ TRX) · Fentes (Marchées · Arrière · Latérales · Croisées · Kettlebell · Smith Machine) · Chariot de Puissance — Fentes Arrière · Split Squat Élastique · Split Squat TRX · Montée sur Box (+ Haltères) · Extension Quadriceps Unilatérale (+ Machine à Dips) · Cossack Squat |
| **Fessiers** | Hip Thrust Unilatéral · Soulevé de Terre Roumain Unilatéral · Leg Curl Unilatéral Debout · Extension Fessiers Arrière (Kickback) · Kickback Machine |
| **Mollets** | Élévations Mollets Unilatéral |
| **Full Body** | Arraché Haltère (Dumbbell Snatch) |

### ❓ Ceux où j'hésite — c'est Michel qui tranche

Ils se font **des deux façons** selon la personne ou la salle. Plutôt que de choisir à sa place :

- ~~**Extension Nuque Haltère**~~ → **tranché par la figurine : deux mains, BILATÉRAL.**
- **Curl Araignée (Spider Curl)** — souvent les deux bras en même temps.
- **Rowing Landmine (T-Bar)** — deux mains sur la poignée, ou une main ?
- ~~**Tirage Iso-Latéral Hammer Strength** · **Presse à Cuisses Iso-Latérale**~~ → **tranchés par le
  dessin : BILATÉRAUX.** « Iso-latéral » = bras/jambes indépendants, mais on pousse ensemble.
- **Presse à Cuisses sur le Côté** — une jambe ou deux ?
- **Leg Curl Haltère** — haltère coincé entre les pieds = deux jambes, non ?
- **Soulevé de Terre Valise (Suitcase)** — charge d'un seul côté, mais les deux jambes poussent :
  est-ce qu'on double le volume ou pas ?

### 🔁 PLUS LARGE QUE L'UNILATÉRAL : le poids d'UN haltère ou le TOTAL ? (ajouté le 10/08, Michel)

Michel élargit : *« il n'y aura pas que celui-ci, les biceps c'est pareil, je mettais 8 reps à
60 kilos, comme pour le développé incliné aussi c'est 60 kilos en tout »*. Donc **tous** les
exercices aux haltères sont concernés, pas seulement les unilatéraux.

**⚠️ MAIS CE SONT DEUX PROBLÈMES DIFFÉRENTS, et un seul est une erreur :**

| Cas | Ce qu'il note | Est-ce faux ? |
|---|---|---|
| **Développé Incliné Haltères** — les deux bras poussent **en même temps** | 60 kg (= 30 + 30) | **Non.** Ses pectoraux poussent bien 60 kg au même instant, exactement comme une barre de 60. Le chiffre est comparable. |
| **Rowing Haltère** — un bras **à la fois** | 56 kg (= 28 × 2) | **Oui.** Son dos n'a jamais tenu 56 kg à un seul moment. **Ce chiffre n'existe pas.** |
| **Curl Haltères** — la figurine dit **alterné** (un bras à la fois) | 60 kg | **Oui, faux aussi.** Chaque biceps ne voit que 30 kg. Confirmé en ouvrant le dessin. |

**Donc il y a une question de FOND, et c'est la sienne** :

> **Quand tu notes un exercice aux haltères, tu écris le poids d'UN haltère (30) ou le total (60) ?**

Les deux conventions existent, aucune n'est bête :
- **le poids d'un haltère (30)** = ce qui est **écrit sur l'haltère**, donc rien à calculer à la
  salle, et c'est ce que disent la plupart des applis ; mais le volume total est faux si on ne
  double pas derrière ;
- **le total (60)** = comparable à une barre, mais il faut faire le calcul de tête à chaque série,
  et ça ne marche plus dès que l'exercice est **unilatéral** (cas du Rowing).

**Ce que ça implique quoi qu'il arrive** : Milo doit parler la **même** langue. S'il écrit
« prends 30 kg » et que Michel note 60, ils ne parlent pas du même objet — et l'app non plus.

**⚠️ Et ça touche ce qu'on vient de livrer (ft-v823)** : la montée en charge est calculée **sur la
charge notée**. Sur un exercice unilatéral noté en total, elle raisonne sur un poids qui n'existe
pas. Un de plus pour la liste des choses branchées sur cette donnée.

### ⚠️ Et l'historique déjà saisi

Ses anciennes séances de Rowing Haltère sont notées avec la charge **des deux côtés additionnée**
(« 56 kg »). Si on change la règle, il faut décider : on laisse l'historique tel quel (une rupture
dans la courbe), ou on le corrige. **À trancher avec lui aussi** — ne rien réécrire tout seul.


---

## 📒 INVENTAIRE DES FONCTIONNALITÉS EXISTANTES — le document qui manque vraiment (27/07/2026)

> **Né d'une vraie erreur** : lors de l'audit du 27/07, j'ai conclu qu'une fonctionnalité manquait
> (l'import de prise de sang). Michel a corrigé : *« mais la prise de sang on l'a déjà faite »*.
> Vérification faite : elle est bien dans le code (4 fichiers) — mais elle n'a **aucune** entrée de
> journal. Elle n'apparaît qu'en note incidente, dans une entrée sur autre chose, écrite des semaines
> après. **Elle était invisible dans la doc.** (→ règle R23)

**Le manque exact** : on a un excellent **journal** (que s'est-il passé, quand, pourquoi) mais **aucun
inventaire** (qu'est-ce qui existe aujourd'hui ?). Ce sont deux questions différentes, et le journal
répond mal à la seconde : pour savoir si une chose existe, il faut lire 500 entrées chronologiques.

**Conséquences concrètes du manque** :
- on re-propose une fonctionnalité déjà construite ;
- on affirme à tort qu'une chose manque (le cas ci-dessus) ;
- devant un bug, on ne remonte pas à la modification ancienne qui l'a causé ;
- Michel doit servir de mémoire vivante — ce qui n'est pas tenable.

**Le principe de conception, s'il est construit** : le dériver du **CODE**, pas de la mémoire.
Un inventaire écrit à la main redeviendra faux en trois semaines (exactement comme le fichier de
contexte). Un inventaire **généré** (les écrans, les entrées de menu, les actions du backend, les
fonctions publiques) est **vérifiable** et ne peut pas mentir sur ce qui existe.

**Piste concrète** : un petit script qui scanne le code et produit un tableau *fonctionnalité → où elle
vit → depuis quelle version*, relancé à chaque livraison. À croiser une fois avec le journal pour
retrouver les fonctionnalités « orphelines » (dans le code, absentes de la doc) — la prise de sang
n'est probablement pas la seule.

**📏 MESURE FAITE LE 27/07 (échantillon, 2 min)** — Michel : *« on ne notait que 90 %, je me trompe ? »*
→ **il ne se trompait pas : mesuré à ~85 %** sur les actions du backend (33 dans le code, 5 jamais
citées dans le journal). ⚠️ Ordre de grandeur, pas une note : le test cherche des noms techniques et
rate les cas où la doc décrit la fonctionnalité avec d'autres mots (faux positifs constatés).

**Le trou n'est PAS réparti au hasard** — il se concentre sur deux profils :
1. **Outils d'admin / maintenance** (`adminRestore`, `adminUnlockAuth`, `listUsers`, `migrateBackups`) —
   acceptable, personne ne va demander de les reconstruire.
2. **Petites fonctionnalités construites dans l'élan** (`logCustomExercise`, l'import de prise de sang) —
   **c'est ça le vrai trou**. Profil identifié par Michel lui-même : *« je sortais des idées à fond, on
   codait, j'essayais »*, puis on passait à la suivante sans écrire l'entrée.

**⚠️ Interprétation à ne pas se tromper** : ce n'est **pas** un défaut de rigueur, c'est le **coût normal
d'une phase de création rapide**. Documenter à 100 % en temps réel aurait divisé par deux ce qui a été
construit — le choix était bon à ce moment-là. Ce qui change, c'est que l'app est maintenant assez
grosse pour que les 15 % coûtent (le 27/07 : un audit a affirmé à tort qu'une fonctionnalité manquait).

**➡️ Conséquence sur la solution** : ce n'est PAS « être plus discipliné ». La discipline ne rattrape pas
le passé et craque justement dans les phases intenses — celles où on crée le plus. C'est pour ça que
l'inventaire doit être **généré depuis le code**.

**🚨 LA HIÉRARCHIE DU RISQUE (mesurée le 27/07)** — Michel : *« dans ces 15 % il peut y avoir des infos
super importantes »*. Il a raison, mais le risque n'est **pas** là où on croit. Quatre niveaux :

| Niveau | État mesuré | Récupérable ? |
|---|---|---|
| ① **Ce qui existe** (le *quoi*) | ~85 % documenté | ✅ **Oui, à 100 %** — le code *est* la liste. Un inventaire généré ne peut pas mentir. |
| ② **Où sont les zones dangereuses** | **75 avertissements** dans le code (`log.js` 18 · `coach.js` 16 · `app.js` 10 — concentrés au bon endroit) | ✅ Déjà couvert |
| ③ **POURQUOI c'est dangereux** | ✅ **CORRIGÉ le 27/07 : 56 blocs sur 63 (89 %) expliquent déjà.** ⚠️ Les chiffres annoncés d'abord (« 28 % », « 54 à compléter ») étaient **FAUX** : le détecteur comptait **ligne par ligne** alors qu'un commentaire est un **BLOC** — la moitié des explications étaient à la ligne suivante. Sur les 7 restants, 5 s'expliquaient d'eux-mêmes ; **2 vrais trous** trouvés et comblés (mur premium qui clignote → ft-v446 · trigger de backup quotidien = le filet de sécurité des données). | ✅ Fait |
| ④ Ce qui n'est écrit nulle part | dans la tête de Michel | ❌ Aucun script ne peut le trouver |

**Pourquoi le niveau ③ est le plus grave** : *« ne pas toucher »* sans *« sinon X casse »* protège d'une
modification distraite, mais **ne survit pas à une raison légitime de changer** — le jour où il faut
vraiment toucher là, personne ne peut peser le risque. Et une barrière dont plus personne ne connaît la
raison finit par être retirée « puisqu'elle ne sert à rien ».

**➡️ RÉSULTAT (fait le 27/07)** : le chantier n'existait quasiment pas. Le code est **bien commenté** —
89 % des avertissements disent déjà ce qui casse. Deux vrais trous comblés, terminé.

**🎓 La leçon de méthode vaut plus que le chantier** : trois mesures successives ont donné **54 → 33 → 7**.
Les deux premières étaient fausses parce que **l'unité de mesure ne correspondait pas à l'unité de sens**
(la ligne au lieu du bloc de commentaire). Un chiffre produit par un script n'est fiable que si on a
vérifié qu'il mesure la **bonne chose** — et un mauvais chiffre est d'autant plus dangereux qu'il est
précis : « 54 » a été gravé dans ce fichier et annoncé à Michel avant d'être vérifié.

**Pour le niveau ④, pas de projet : une HABITUDE.** Quand Claude touche à quelque chose et demande
*« pourquoi c'est comme ça ? »*, Michel répond → **on l'écrit dans le commentaire, tout de suite**. Ça
vaut plus que n'importe quel audit.

**🔎 DÉCOUVERTE DU 27/07 (soir) — L'INVENTAIRE EXISTE DÉJÀ, IL A CESSÉ D'ÊTRE ALIMENTÉ.**
En remontant au **tout premier `CLAUDE.md` (30/06/2026, 27 Ko)** via Git, constat : la période des débuts
(ft-v1 → ft-v127) n'a **jamais** eu de journal version par version — elle était documentée **autrement**,
par un **catalogue de fonctionnalités rangé par THÈME** (Entraînement · Cloud sync · Nutrition · Cycle de
force · Badges · EXLIB · Programmes…), avec les dates. **C'est exactement l'inventaire décrit ci-dessus.**

**Vérification faite : les 32 sections de ce premier fichier sont TOUTES encore présentes aujourd'hui**
(dans `docs/JOURNAL-ARCHIVE.md` et `CLAUDE.md`). **Rien n'a été perdu** dans les allègements successifs.

**➡️ Conséquence : le chantier est bien plus petit qu'annoncé.** Il ne s'agit pas de *créer* un
inventaire, mais de **reprendre celui qui existe** — il s'arrête vers **ft-v441**, soit ~190 versions de
retard. C'est la règle **R13** (enrichir l'existant plutôt que créer un système nouveau), et on a failli
y manquer en concevant un nouvel outil alors que l'ancien dormait dans l'archive.

**⚠️ Et ça corrige une mesure de la soirée** : le « trou » ft-v1 → ft-v127 n'en était pas vraiment un —
je cherchais des entrées de version dans une période qui utilisait un **autre format**. Troisième fois de
la soirée qu'un détecteur mal calibré donne un chiffre trop noir (54 → 2 · 57 % → 99 % · ce trou-ci).
**Leçon confirmée : avant de croire un chiffre, vérifier qu'il mesure la bonne chose.**

**Statut** : pas urgent, mais c'est le **seul** vrai manque documentaire identifié (la proposition de
réorganisation de GPT décrivait surtout des documents qui existaient déjà). À faire un jour calme.

---

## 🧠➡️💾 « CHAQUE SÉANCE DOIT ENRICHIR LE PROFIL VIVANT » — retour GPT sur le débrief de Milo (27/07/2026)

> **Le constat de GPT** (après lecture du programme de reprise + du débrief) : *« Milo écrit énormément
> d'informations pertinentes, mais ces informations restent principalement dans le TEXTE. Elles devraient
> progressivement devenir des connaissances persistantes. »*
> Exemples qu'il cite : bonne réponse physiologique après une semaine de repos · l'épaule droite tolère bien
> l'incliné en amplitude contrôlée · les perfs max sont meilleures après plusieurs jours de récup · les montées
> progressives donnent de meilleurs résultats que les montées agressives.

**⚠️ C'est EXACTEMENT la famille de bugs ft-v625→628** (« l'information est dans le TEXTE de Milo, pas dans la
DONNÉE que l'app reçoit »), mais **d'un cran au-dessus** : là c'était la séance du jour, ici c'est
l'**apprentissage sur la personne**. Et c'est aussi la règle du **comportement observable** (gravée le 27/07)
appliquée à la source : Milo *produit* de la connaissance qui n'est **exploitée par personne**.

**Ce qui existe déjà** (ne pas reconstruire) : le mécanisme de mémoire validée (`retiens` → observations
`validated`, ft-v582) et le `sessionLog` des débriefs. **Ce qui manque** : Milo ne propose **jamais** de retenir
une **règle de réaction physiologique** — seulement des faits déclaratifs.

**Garde-fous avant de coder** (Claude) :
- ⛔ **Jamais automatique** — « Milo ne pilote jamais » (`docs/PROFIL-VIVANT.md`) : ce sont des **hypothèses sur
  le corps de quelqu'un**, donc mode *proposer → l'utilisateur valide*, comme les observations.
- ⛔ **Une seule séance ne prouve rien** — exiger une **tendance** (cf. « la cohérence avant la réactivité », P20).
  « Tu as bien récupéré une fois » n'est pas « tu récupères bien ».
- ⛔ **Domaine sensible** (blessures, tolérance articulaire) → permissions bornées (ft-v605) : constater, jamais
  conclure médicalement.
- ✅ Passer la **grille des 3 questions** : qui produit · qui exploite · quel comportement change.

**➕ 5ᵉ GARDE-FOU (GPT, 27/07) — « toute connaissance doit pouvoir être RÉÉVALUÉE »**
> *« Le profil vivant ne doit pas uniquement apprendre. Un sportif évolue, son corps évolue, ses
> réactions évoluent. Une connaissance ne devrait jamais être considérée comme définitivement vraie :
> elle doit pouvoir être confirmée, renforcée, affaiblie, réévaluée. »*

**✅ Adopté — et c'est le point le plus fort de son retour.** Deux précisions honnêtes :

- **Ce n'est pas nouveau chez nous, pour les faits DÉCLARÉS.** Le mécanisme existe déjà : le mode
  **Confirmer** (ft-v617) rafraîchit la date sans changer la valeur, la **fiabilité par champ** décroît
  avec le temps, et *« la mémoire peut devenir une prison »* est déjà gravé (Constitution P22, apport de
  Mistral). Son vocabulaire est **complémentaire** au nôtre, pas redondant : nos 4 modes agissent sur le
  **contenu** (Compléter · Enrichir · Mettre à jour · Confirmer), ses 4 verbes agissent sur la
  **confiance** (confirmer · renforcer · affaiblir · réévaluer).

- **⚠️ Mais pour les RÈGLES APPRISES, c'est nettement plus dur — et c'est là que ça devient le cœur du
  problème, pas un garde-fou de plus.** Affaiblir un fait déclaré est simple : on redemande. Affaiblir
  *« il récupère bien après une semaine de coupure »* demande des **contre-observations** — donc de
  savoir reconnaître qu'une séance s'est mal passée *pour cette raison-là*, ce qu'on ne sait pas faire
  aujourd'hui. **Sans mécanisme d'affaiblissement, une règle apprise devient une prophétie** : Milo
  planifierait selon une réaction que le corps n'a plus.

**➡️ Conclusion de conception** : ce 5ᵉ point n'est pas à ajouter *après*, il **conditionne** le
chantier. Une règle apprise ne doit pas être mémorisée tant qu'on ne sait pas comment elle pourra être
remise en cause. *Si on ne sait pas l'affaiblir, on ne l'apprend pas encore.*

**Statut** : chantier de fond, **pas une brique courte**. À placer après la nutrition, ou comme évolution du
profil vivant une fois la base stabilisée. GPT : *« probablement l'évolution la plus importante de Force Tracker »* —
d'accord sur le fond, mais ça ne se bricole pas en une session.

---

## ✨ Nouveautés — les 2 idées GPT NON retenues tout de suite (27/07/2026)

Livrées le même jour : le carrousel (ft-v630), la discipline de longueur (ft-v632), l'historique + « Passer »
(ft-v633). **Restent en réserve** :

1. **Différencier mise à jour MAJEURE vs MINEURE** (GPT : 2-5 cartes pour une grosse évolution, 1 carte pour un
   correctif). *Bonne idée sur le fond* — mais elle demande un **champ de plus** dans `WHATS_NEW` et surtout un
   **jugement à chaque livraison** (« celle-ci est-elle majeure ? »). Or `WHATS_NEW_SHOW_MAX=6` fait déjà
   l'essentiel du travail, et la règle ft-v632 (4-5 lignes) empêche déjà le pavé. → **à faire le jour où on
   sentira vraiment le besoin**, pas avant (gouvernance légère : chaque élément doit réduire un risque ou une
   charge mentale).
2. **L'intro au ton de Milo** (« 👋 Salut ! Pendant ton absence, j'ai quelques nouveautés à te montrer » →
   *Voir* / *Plus tard*). *Séduisant et très aligné* avec `docs/PRESENCE-MILO.md`. **Réserve** : Milo qui annonce
   des mises à jour logicielles, c'est Milo qui parle **du produit** et non **de toi** — le risque est le
   **gadget** (précisément ce que la doc de présence interdit). → à reprendre quand on saura le formuler comme
   une **présence** et pas comme un habillage marketing.

---

## 📱 Header adaptatif (compact au scroll, façon iOS / Apple Music) — idée GPT + Michel (26/07/2026)

Née de l'optimisation du header (ft-v610, compaction statique testée sur le clone). L'idée d'évolution :
un **header à deux états**.
- **À l'ouverture** : header actuel, esthétique et « premium » (l'effet waouh).
- **Dès que l'utilisateur fait défiler la conversation** : le header se **compacte automatiquement**
  (logo/titre qui rapetissent en douceur, comme iOS ou Apple Music) → maximise la place pour le chat,
  qui est le cœur de l'expérience.
On garde ainsi le premier contact soigné ET le confort de lecture. **Rien codé** — brique à cadrer
plus tard (écouteur de scroll + transition CSS, à faire proprement, tester iOS Safari). La compaction
STATIQUE (ft-v610) est la 1ʳᵉ marche ; l'adaptatif serait la 2ᵉ.

---

## 💰 « Engagement responsable » — IMPLÉMENTATION à valider (principe déjà gravé, Constitution P24)

**Le PRINCIPE est gravé** (Constitution v2.2, Principe 24) : *« Milo ne s'engage jamais dans une
conversation qu'il estime ne pas pouvoir mener jusqu'à un point d'arrêt utile — et il réévalue à
chaque tour. »* **L'implémentation, elle, est délibérément LAISSÉE OUVERTE** (décision Michel :
graver le principe, ne pas figer l'architecture sur une intuition).

**La piste minimale (à tester UN JOUR, pas maintenant)** — issue du croisement Michel + GPT + Gemini
+ Mistral :
- **Ne PAS construire d'« estimateur » au 1ᵉʳ message** (la complexité n'est pas fiable au départ ;
  un 2ᵉ appel doublerait le coût → casse le critère « soutenable »). Écarté.
- **La bonne piste = donner à Milo la conscience de son BUDGET restant** (injecté dans son contexte,
  déterministe, 1 nombre) + une **consigne de transparence CIBLÉE** : s'il voit qu'une grosse demande
  dépasse le budget **tendu**, il l'annonce d'emblée (chaleureux, jamais vendeur) et donne quand même
  une première version utile. La **réévaluation à chaque tour est gratuite** (elle tient dans la
  réponse que Milo produit de toute façon).
- **Le message reste l'unité** de facturation (simple, compréhensible). On ne change pas l'unité ;
  on change l'honnêteté sur le périmètre.
- **Garde-fous** : ne s'active que budget tendu (un premium n'est jamais concerné) ; jamais une
  pression à payer (P23) ; à tester **sur le clone d'abord** (y simuler un budget bas).
- **À passer par les 3 critères** (`docs/PROCESSUS-DEVELOPPEMENT.md`) avant de coder.

---

## 🧭 LE FILTRE DE PRIORISATION (GPT 22/07/2026, adopté) — « améliore-t-il les décisions de Milo ? »

**Le constat (GPT, en relisant ce backlog) :** Force Tracker **change de nature** — au départ une app de musculation, aujourd'hui une **plateforme qui cherche à faire raisonner Milo comme un coach**. Le backlog « raconte une histoire » : on voit une **direction**, plus une liste d'idées.

**La question-filtre (adoptée pour prioriser) :**
> **« Est-ce que cette brique améliore la QUALITÉ DES DÉCISIONS de Milo ? »**
> Si OUI → assez haut dans le backlog. Si NON → ça peut souvent attendre.

Vont clairement **EN HAUT** (elles améliorent le raisonnement de Milo, = là où Force Tracker se différencie) : **profil conversationnel · Observations · continuité · exercices « ancre » vs « accessoire » · priorités musculaires**.

**⚠️ Nuance Claude (à garder) :** ce filtre range les briques à VALEUR AJOUTÉE COACHING, mais il ne remplace pas la **piste FONDATIONS / SÉCURITÉ** (règle d'or n°3 « zéro perte de séance », sécurisation avant grand public, RGPD, robustesse quand l'app grossit). Ces briques n'améliorent pas le raisonnement de Milo mais restent **non négociables**. → **Deux pistes en parallèle** : (1) « le cerveau de Milo » (priorisée par le filtre GPT), (2) « les fondations » (must-do de leur côté, indépendamment du filtre).

**Positions actées (GPT 22/07, avec nos nuances) :**
- **Objets connectés** : ne PAS lutter contre les limites de plateforme (Apple Santé & co peu accessibles en PWA). On enrichit Milo à la place ; la brique attendra que la techno le permette (import de fichier reste l'option honnête entre-temps).
- **Multilingue** : ce n'est pas une fonctionnalité, c'est une **capacité de plateforme** — ne plus la repousser, avancer tranquillement (« on regrette toujours de l'avoir trop tardé »). Reste DERRIÈRE le cerveau de Milo en priorité, mais on garde l'architecture i18n vivante.
- **Réseau social** : **garde-fou** — Force Tracker ne doit PAS devenir un réseau social. Si un jour du communautaire, il reste centré **coaching / progression / entraide**, JAMAIS la visibilité ni la validation sociale (aligné Vision + Constitution « la personne d'abord »).
- **« Super Premium »** : à creuser, mais positionné comme **« plus de MAÎTRISE »**, pas « plus de fonctionnalités » — analyses avancées de progression, exports complets, comparaisons de cycles, stats détaillées, historique long terme, outils pour passionnés/coachs. Cible = ceux qui veulent exploiter à fond leurs données. Cohérent avec le modèle « le premium débloque l'**intelligence** de la mémoire ».

---

## 💪 PRIORITÉS MUSCULAIRES — décidé (Michel + GPT + Claude, 22/07/2026), Phase 1 EN COURS

**Constat (Michel, sur les vrais programmes de Cyril Staal : Tatiana/Emma/Christophe)** : un coach ne programme pas qu'autour de l'OBJECTIF, mais autour des **priorités physiques** de l'athlète (retards/points forts). Deux personnes « hypertrophie » n'ont pas le même programme si l'une veut les épaules et l'autre rattraper ses quadriceps. → **c'est un enrichissement du cerveau de coaching, pas un gadget d'interface** (catégorie « améliore la qualité du coaching », pas « ajoute de la complexité » — distinction GPT).

**Découpage (validé, ne pas mélanger) :**
- **Phase 1 (EN COURS)** : l'utilisateur déclare **jusqu'à 2 groupes musculaires prioritaires** (dans le Profil, durable, comme les autres axes) → injecté dans le contexte de Milo → il adapte fréquence/volume/variantes/conseils + les programmes qu'il génère. **L'objectif reste le pilote.** Rétrocompatible (0 choisi = identique).
- **Phase 2 (PLUS TARD → brique « Observations »)** : Milo **analyse la progression** dans le temps et **suggère** de nouvelles priorités (« tes quadris +8 %, tes pecs +1 %, on priorise les pecs ? »). Plus ambitieux ; ne PAS mélanger avec la Phase 1.

**La carte des 4 axes (framing GPT, gravé — chacun répond à une question DIFFÉRENTE, zéro doublon) :**
- **Objectif** → *pourquoi je m'entraîne ?* (force, hypertrophie, perte…) — pilote la nutrition.
- **Priorité complémentaire** (goal2, ft-v568) → *qu'est-ce que je veux développer en plus ?* (un 2ᵉ but d'entraînement).
- **Morphologie** → *qui suis-je aujourd'hui ?* (morphotype, proportions, limitations).
- **Priorités musculaires** → *où je veux progresser en priorité ?* (pecs, quads, épaules…).

**Méthode** : une brique à la fois (Phase 1 seule maintenant). Michel : ne pas retarder le projet en attendant un designer pour le polish → avancer sur les **fondations métier** qui enrichissent Milo, fidèle à la méthode.

---

## 🔭 Issues du tour de table IA extérieures (20/07/2026) — pertinent mais PRÉMATURÉ

*(Contexte : après l'intégration des alias VM, avis croisés GPT + Gemini + Mistral. Les décisions d'archi retenues sont dans CLAUDE.md ; ci-dessous ce qui est bon mais pas maintenant.)*

- **⌚ Matériel connecté (import montre)** — Mistral : « ~70 % des pratiquants ont une montre » → import de fichiers **FIT/TCX** (Garmin/Apple/Strava), d'abord manuel, puis API si >20 % d'usage. **Vrai trou**, mais c'est un **satellite** → à faire *après* la décision « cœur muscu + satellites ». (Recoupe la note « import Garmin sommeil/activité » plus bas.)
- **💰 Modèle économique approfondi / partenariats** — on a déjà le freemium (Premium 4,99€). Pistes Mistral à réfléchir *plus tard* : abonnement analyse avancée, partenariats salles/marques (ex. une marque de machine « en avant » dans les suggestions — à manier avec éthique, ne pas biaiser les conseils). Non urgent (GPT d'accord).
- **💾 Export manuel JSON/CSV** — filet de sécurité **local**, indépendant du cloud (Mistral le classait « URGENT » car il ignorait qu'on a **déjà** sync cloud + backup Drive quotidien + code de compte + restauration email). Donc **basse priorité**, mais cheap et aligné « zéro perte » → à faire un jour comme 2ᵉ ceinture.
- **🏗️ Couche machine — MVP mesuré** (quand on la construira, décision d'archi = *user-fed* d'abord) : commencer petit (~10 exos × 2-3 machines), **mesurer l'usage** avant d'étendre ; ne PAS collecter 15 marques à la main (le risque = les médias). L'utilisateur photographie SA machine (déjà amorcé ft-v521). **Spec du palier « confirm » (GPT + Gemini, clôture 20/07)** : validation **en UN SEUL geste** — afficher *photo machine · nom exo · GIF éventuel · muscles principaux* puis **✓ / ✕**, zéro formulaire (pensé pour un sportif essoufflé entre 2 séries).
- **🕸️ Graphe biomécanique — plafonné** : forme minimale utile = `exercice → schéma moteur → muscle principal → famille` (tout ce qu'on calcule déjà). Détail fin (angles, remplacements, contre-indications) = base experte (wger/ExRx) ou via **le Gardien**, **jamais** du parsing de nom exhaustif (Gemini + Mistral convergent : plafond honnête ~85-90 %, le reste passe par le palier *confirm*).
- **🧪 VM Test Center (idée GPT, 21/07/2026) — à construire quand Michel dit go.** Remplacer le % global unique par la **maturité PAR domaine**, rangée en 3 familles avec une lecture différente : 🟢 **supporté** (Muscu classique/Machines/Alias/Salle commerciale → % **doit** être haut, une baisse = alerte) · 🟡 **non couvert** (TRX/CrossFit/Haltéro/Cardio/Strongman/Callisthénie → petit % **normal**, ce qu'on surveille = qu'aucun **mauvais** match n'apparaisse en « auto », pas le % ; monte = on a ajouté la famille) · 🔴 **robustesse** (Nightmare/Ambiguïtés/Fautes d'orthographe/Langues mixtes → doit **rester** 95-100 %). 80 % de la plomberie existe déjà (catégories + score/catégorie + référence/régression) → surtout regrouper en 3 tiers + tag d'intention + affichage. Batteries TRX/CrossFit/OldSchool = à figer comme permanentes. ⚠️ Les chiffres du mockup GPT sont fictifs.
- **🛡️ Versionnage du schéma de données + migrations client (Gemini, 21/07/2026) — PRIORITAIRE avant d'évoluer le modèle** : formaliser un `schema_version` (localStorage) + un **pipeline de migrations idempotentes** exécutées au `load()`. On le fait déjà en ad hoc (flags `ft4_exmig2`/`ft4_pressmig1`/`ft4_fragmig1`) → le rendre **systématique** : à chaque changement de structure de `S.programmes`/`S.sessions`/etc., une migration versionnée qui ne casse jamais l'historique local (règle d'or n°3, zéro perte). C'est le **prérequis technique** pour faire converger le stockage vers le modèle métier sans risque. Petit chantier, gros filet de sécurité.
- **📏 Série à métriques flexibles (Gemini) — futur, pour endurance/CrossFit/cardio** : la Série ne porte aujourd'hui que reps/kg/temps ; ajouter `{métrique, valeur, unité}` (distance, calories, watts, allure). À faire quand on adressera ces disciplines (pas la priorité muscu).
- **🔒 Mode privé + garde-fous éthiques techniques (Mistral + Gemini)** : anonymisation à l'import, interdiction technique de re-partager un programme importé d'un tiers, charte de transparence, consentement au partage (lié Mode Coach). ⚠️ Rappel honnête : l'import actuel envoie le doc à l'IA (serveur) → un vrai « 100 % local » suppose une lecture locale (OCR embarqué), gros chantier.
- **🦵 VM — désambiguïsation des variantes de presse (retour GPT, 21/07/2026)** : « Presse à Cuisses » tombe sur *Press Jambes 45°* par défaut, alors qu'on a déjà les variantes (45°/horizontale/verticale/inclinée/levier/Hack). À terme, mieux distinguer selon les indices du nom (angle, machine). Non prioritaire — le défaut 45° est correct dans la majorité des cas. Même logique possible pour d'autres familles à variantes (développés, tirages).
- **🧪🧪 VM Test Center — 2 AXES (précision Michel, 21/07/2026)** : le test doit couvrir **deux étapes distinctes** de l'import, pas une seule. **① LECTURE** (scan/PDF → l'IA du serveur extrait la structure : séances, exos, séries/reps, supersets, dropsets) = **IA, non-déterministe, testable seulement sur iPhone** (Claude ne peut pas : proxy bloque Cloudflare). **② RATTACHEMENT** (VM relie chaque nom extrait à EXLIB sans doublon) = **local, 0 IA, testable en banc** (ce qu'on fait). Le banc actuel ne teste que l'axe ②. Pour l'axe ①, Claude analyse le résultat d'un vrai import que Michel lui envoie (capture/JSON). Le futur Test Center devra montrer les 2 axes séparément.

---

## 📅 « Milo prépare ta séance de DEMAIN » — brique courte, valeur immédiate (découvert en test, 27/07/2026)

**Le constat (test réel de Michel)** : après sa séance pecs, il demande conseil → Milo lui prépare une **excellente séance pour DEMAIN** (bas du corps, 6 exercices, charges + repos + cues détaillés). **Mais elle est perdue** : le bouton « ⚡ Commencer cette séance » n'apparaît pas, car la consigne dit *« n'émets ce bloc QUE pour une séance à faire AUJOURD'HUI/MAINTENANT »* (règle **saine** : on ne veut pas qu'une séance future écrase la séance du jour). Résultat : Michel devra **tout redemander demain**, et Milo pourrait proposer autre chose. Du travail de qualité jeté.

**L'idée** : quand Milo prépare une séance pour un jour FUTUR, la **garder au chaud** au lieu de la perdre → le lendemain, elle est **prête** (« Milo t'avait préparé ta séance bas du corps 💪 [La charger] »).

**✅ Le mécanisme existe DÉJÀ à moitié** : `S.nextPlanned` (ft-v601/616) mémorise *quand* la prochaine séance est prévue (date + label) et l'Accueil l'affiche (« Séance prévue demain 💪 Je m'en souviens »). Il suffirait d'y **attacher le contenu** de la séance (le même bloc que `_startSessionFromMilo` consomme déjà) → à l'ouverture le jour J, un bouton la charge. **Peu de code, forte valeur** : la continuité devient tangible, et ça sert le Moment 2 (« Milo se souvient de moi »).

**Points à cadrer** : ① ne JAMAIS écraser une séance en cours (règle d'or #3 — même garde-fou qu'aujourd'hui : on AJOUTE) ; ② péremption (si la séance annoncée n'est pas faite dans les ~2 jours, on l'oublie — sinon on charge un truc obsolète) ; ③ Milo doit pouvoir **réviser** son plan le jour J (l'état du jour a pu changer : fatigue, douleur) → la séance gardée est une **proposition**, pas un contrat.

---

## 📐 Fraîcheur de l'ÉTUDE DU CORPS (« faut creuser ça », Michel, 27/07/2026)

**Le constat** : le résumé de l'étude du corps (4 photos → stature, insertions, équilibre, points forts/faibles) **est bien injecté** dans le contexte de Milo, avec une consigne ferme de s'en servir. ✅ *(Vérifié : ce n'est pas une « donnée morte », et le résumé lu est bien le plus récent.)* **MAIS il est DATÉ, et Milo n'en tient pas compte** : si le bilan a 6 mois, il raisonne sur un corps d'il y a 6 mois **sans le signaler**. Les photos, elles, ne sont pas conservées (choix de vie privée assumé) → il n'a que le compte rendu écrit.

**Pourquoi ça compte** : c'est exactement le problème de **fiabilité/fraîcheur** qu'on a résolu pour le reste du profil (mode **Confirmer**, ft-v617) — mais l'étude du corps **n'a pas ce garde-fou**. Or un corps évolue (c'est même le but).

**Pistes (à cadrer, pas codées)** : ① Milo **mentionne la date** quand le bilan est ancien (« ton bilan date de mars — ça a pu évoluer ») au lieu de l'énoncer comme un fait présent ; ② au-delà d'un certain âge, il **propose d'en refaire un** (via le mécanisme Confirmer/Enrichir, jamais insistant) ; ③ à terme, exploiter la **comparaison** entre bilans (le champ `evolution` existe déjà) pour raconter le chemin parcouru — pile l'esprit brique 7. ⚠️ Domaine **sensible** (corps, image de soi) : ton doux, jamais de jugement, cf. Constitution P17/P22.

---

## 🤸 VISION LONG TERME — « Les PRATIQUES d'entraînement » (cardio, mobilité, préhab…) — GPT + Michel, 27/07/2026

> ⚠️ **À NE PAS développer maintenant.** L'objectif de cette note est de **vérifier que l'architecture actuelle pourra accueillir cette évolution sans refonte** (question posée par GPT). ✅ **Réponse : OUI — et une partie existe déjà** (audit du code, 27/07).

**L'idée** : la plupart des applis demandent juste « tu fais du cardio ? combien de minutes ? ». Or le cardio influence la **récupération**, la **nutrition/dépense**, les **performances** et donc **tous les conseils de Milo**. Il mérite une modélisation plus riche : **type · moment · intensité · durée · objectif · fréquence**. Le **moment** est le plus discriminant (*« 30 min de vélo APRÈS la muscu ≠ 30 min de HIIT AVANT une séance jambes »*).

**Le vrai saut conceptuel (GPT)** : ne pas faire « un module cardio », mais un concept général — **les PRATIQUES d'entraînement** : 🏋️ musculation · ❤️ cardio · 🧘 mobilité · 🤸 pilates · 🧘 yoga · 🛡️ prévention/préhab · 🏃 autres sports. Chaque pratique a **ses propres caractéristiques** (le cardio : type/intensité/durée/fréquence/moment/objectif ; la mobilité : fréquence/durée/objectif ; la préhab : zones — genou, épaules, lombaires, chevilles…). Aujourd'hui ces pratiques sont **quasi invisibles** dans les applis de suivi, alors qu'elles **racontent énormément** sur un sportif. Résultat : quelqu'un n'a plus « 4 séances », il a un **vrai profil d'entraînement** (4 muscu + 2 sorties vélo + 15 min de gainage après chaque séance + mobilité épaules avant le haut du corps) → Milo peut alors dire *« tu fais du HIIT avant chaque séance jambes ; pour ton objectif force ça peut te coûter cher — on le déplace après, ou sur un jour séparé ? »*.

### ✅ Vérification d'architecture (Claude, 27/07) — ce qui existe DÉJÀ
- **Le cardio est déjà structuré** : `S.wkt.cardio = {type, intensity, duration}` → **3 des 6 caractéristiques** demandées sont là (type · intensité · durée), il est **rattaché à la séance**, **conservé dans l'historique** (`sess.cardio`) et **alimente déjà les calories** (`calcCardioKcal`). Une **séance de cardio seul** (sans muscu) est possible depuis ft-v7.
- **Le déclaratif existe** : `coachQuiz.cardio` (« ta relation avec le cardio ») + **`othersport`** (ft-v615, mode Enrichir) + `S.adn` (mode de vie, préférences, zones fragiles).
- **Le profil vivant est un objet OUVERT** : `S.coachQuiz.answers` = dictionnaire clé/valeur, `S.registre.observations` = liste. **Ajouter une pratique = ajouter des clés, pas refondre.** Et `_coachQuizContext()` **injecte automatiquement** ce qui s'y trouve → Milo en profite sans nouveau plumbing.
- **Les principes sont déjà posés** : « le profil vivant = source de vérité unique » (tout module est un client), le **catalogue des sources de contexte** (`docs/MOTEUR-RAISONNEMENT-MILO.md`) prévoit déjà une entrée *contexte de vie / autres sports*, et le mode **Enrichir** est **fait pour ça** (`othersport` en est le premier exemple).

**→ Conclusion : aucune refonte nécessaire.** Ce qui manquerait : le **moment** (avant/après muscu, jour séparé), l'**objectif** du cardio, la **fréquence**, et les pratiques non-cardio (mobilité, yoga, pilates, préhab par zone).

### ⚠️ Les 2 garde-fous à respecter le jour où on le construira (Claude)
1. **JAMAIS un questionnaire à rallonge.** 6 caractéristiques × 7 pratiques = **42 questions** → exactement l'**interrogatoire** qu'on combat (P19, anti-interrogatoire ft-v607). Ça doit passer par le mode **Enrichir** (≤ 1 question proactive/semaine, une seule à la fois) et/ou par une question **contextuelle** (quand un événement la rend naturelle).
2. **OBSERVER avant de DEMANDER** (déclaré vs réalisé). Le cardio *fait* est **déjà mesuré** dans les séances (`S.wkt.cardio` : type, intensité, durée, et sa position dans la séance) → Milo peut **déduire** une bonne partie (fréquence, type dominant, moment) au lieu de la demander. On ne demande que ce qui n'est **pas déductible** — typiquement l'**objectif** (« pourquoi tu fais ce cardio ? ») et les pratiques non loggées (mobilité, yoga). Cohérent avec « observé ≠ intention ».

*Priorité : évolution LONG TERME, ne ralentit pas le développement actuel. À rapprocher de la Phase B (nutrition entrelacée) — le cardio pèse sur la dépense énergétique, donc les deux sujets se croiseront naturellement.*

---

## 🎓 VISION LONG TERME — « Mode Coach » / multi-rôles (Michel, 20/07/2026) — À GARDER, PAS PRIORITAIRE

> ⚠️ **Ce n'est PAS un chantier immédiat.** La priorité reste l'industrialisation (VM · Confirm · couche Machine · tests). Cette vision se **documente** pour ne pas se peindre dans un coin, elle **ne se construit pas maintenant**.

**L'idée (Michel, qui a connu les 2 mondes — sportif ET coach)** : **un seul produit** Force Tracker qui **adapte son interface selon le RÔLE** de l'utilisateur, pas deux apps séparées. Rôles envisagés : **Athlète · Coach**, puis éventuellement Préparateur physique · Kiné · Salle de sport.
- **Le besoin du coach** ≠ juste créer des programmes : c'est **suivre plusieurs athlètes en même temps** — détecter les décrochages, mesurer la régularité, observer les progrès, **intervenir au bon moment**. Tableau de bord : progression · régularité · stats · alertes · historique · commentaires. Le **Gardien suggère/alerte**, mais **la décision reste au coach** (cohérent Principe 14).
- **Le moteur reste UNIQUE** : VM · EXLIB · Gardien · Milo · couche Machine · stockage sont communs à tous les rôles. **Seules la présentation + les permissions changent.** ✅ (c'est le point rassurant : pas de 2ᵉ moteur.)

**⚠️ Le vrai défi (analyse Claude) — ce n'est PAS le moteur, c'est DONNÉES + PERMISSIONS** :
- Aujourd'hui Force Tracker est **local-first + mono-utilisateur** (tout rangé par l'email du propriétaire, dans son téléphone). Un coach qui voit les données de **plusieurs** athlètes = besoin d'un **modèle serveur de RELATIONS** (lien coach↔athlète, accès en lecture partagé) → ça **sort du pur local-first**.
- **Consentement obligatoire de l'athlète** (données de santé privées — Constitution Principe 11) : l'athlète **choisit** de partager avec son coach, jamais imposé.
- → Le Mode Coach est un **changement de « plateforme »**, pas une feature. Faisable, mais **gros**, et il touche le point le plus sensible (vie privée). Il rejoint la brique Phase 4 « base de données + hébergement ».

**🛡️ LE GARDE-FOU À RESPECTER DÈS AUJOURD'HUI (gratuit, pour ne pas bloquer l'avenir)** — la phrase-clé de Michel : *« l'architecture doit gérer des ACTEURS, pas de simples UTILISATEURS. »*
1. Ne jamais coder « **le seul utilisateur = le propriétaire de ces données** » comme une vérité absolue.
2. Une donnée a un **propriétaire** (l'athlète) distinct de **qui la regarde** (lui, ou son coach avec accord).
3. Les **permissions** = une couche à part (qui voit quoi), **jamais mélangées au moteur métier**.

*(Doc source : « Vision à long terme – Mode Coach », note GPT/Michel. À relire avant tout choix d'archi structurant, pour vérifier qu'on ne ferme pas la porte.)*

### 🧪 UN PROTOTYPE RÉEL EXISTE / ARRIVE — l'app coaching « coach↔clients » (Michel, 27/07/2026)

**Michel développe une application de coaching à distance POUR une cliente coach** (qui suit ~6 personnes) — un **projet séparé** (travail client), qu'il **fera sûrement évoluer** et qui **servira peut-être à Force Tracker** (au Mode Coach). C'est **exactement la couche que FT n'a jamais construite** : la relation **coach↔client**, asynchrone, multi-tenant et sécurisée.

- **Ce que c'est (périmètre B, minimal & discipliné)** : messagerie (1 fil par client), envoi de **PDF** (programme = doc fabriqué hors app), **check-in hebdo** (poids/tour de taille/photos + 4 échelles 1-5 + commentaire), boîte de réception coach. **Zéro IA** — un *canal*, pas un cerveau.
- **Stack** : **Supabase** (Postgres + Auth + Storage, région **EU** pour la santé) + **PWA** + hébergement statique. → **Serveur d'abord** (l'opposé du local-first de FT) — c'est justement ce qui en fait un banc d'essai du Mode Coach.
- **Ce que ça prouve/apprend pour FT** : ① le **modèle serveur de relations** (`profils` avec `coach_id`, `messages`, `checkins`) + ② la **sécurité multi-tenant** (RLS stricte : un client ne lit que ses lignes, une coach que celles de ses clients ; bucket **privé** + URL signées courtes) — pile les points « DONNÉES + PERMISSIONS » identifiés comme *le vrai défi* ci-dessus. Michel note d'ailleurs le **nommage FR réutilisable** (« ces noms serviront à un autre projet ») → **pont conscient** vers le Mode Coach.
- **⚠️ Garde-fous stratégiques (analyse Claude, 27/07)** :
  - **Garder les 2 produits SÉPARÉS pour l'instant** (stacks différentes : vanilla/Apps Script vs Supabase). Ne PAS chercher à partager du **code** prématurément (= fausse bonne idée). Le pont FT↔coaching se fera **plus tard, par le MODÈLE DE DONNÉES commun**, pas par le code.
  - **Périmètre A ≠ B.** Le « périmètre A » (constructeur de programmes, saisie de séance, suivi nutrition, agenda, finance) **duplique le cœur de Force Tracker** → le recoder from scratch = réinventer FT. **B est le bon choix** (complémentaire, non-redondant). Si un jour on veut « A », la vraie voie = **brancher ce canal coach↔client sur FT**, pas rebâtir FT sur Supabase.
  - **Focus** : c'est du travail client distinct → cloisonner, ne pas diluer la roadmap FT (et inversement).
- **En une phrase** : *ça ne change pas l'approche de FT (qui reste local-first / mono-utilisateur / Milo), mais c'est le **prototype idéal du futur Mode Coach** — à condition de rester en périmètre B et de ponter par les DONNÉES, jamais par le code.*

### 🧭 LES 2 PROPOSITIONS DE GPT + LA SYNTHÈSE ARBITRÉE (27/07/2026, Michel + Claude)

GPT a proposé **2 possibilités** pour le Mode Coach. Constat : elles sont **identiques à ~95 %**, et ce 95 % commun **confirme exactement ce qu'on a déjà gravé** — une seule app / **deux rôles** (Sportif · Coach), le **Profil Vivant = source de vérité unique appartenant au client**, le coach obtient une **VUE** (jamais une copie, aucun moteur parallèle) **avec l'autorisation du client**, révocable (changement de coach → l'historique reste attaché au client), permissions = couche à part. Le coach **ne remplace jamais Milo**, il **collabore** et peut **enrichir** le Profil Vivant (blessure chronique, restriction…) → immédiatement exploitable par Milo/programmes/nutrition/analyses. **Positionnement différenciant** : construit autour du **sportif**, pas du coach.

**La seule vraie différence = l'interface principale du coach :**
- **Prop 1 — conversationnelle** : le coach *demande* à Milo (« quels clients ont besoin de moi ? », « résume-moi la semaine de X »). Milo = assistant.
- **Prop 2 — tableau de bord** : une **liste de clients priorisée** (🔴 attention · 🟡 à surveiller · 🟢 RAS), on creuse ensuite.

**Décision arbitrée (Claude, validée Michel) — Prop 2 comme CADRE, Prop 1 comme MOTEUR dedans** *(ce n'est pas un « ou »)* :
1. **La structure = Prop 2 (tableau de bord priorisé)** — parce que ① c'est le **vrai métier** d'un coach qui suit N personnes (voir d'un coup d'œil qui décroche, PUIS creuser — jamais interroger un par un) ; ② **Michel en construit déjà l'embryon** dans son app coaching (boîte de réception dense, non-lus en premier, « chaque ligne affiche assez pour décider sans ouvrir »). Signal fort.
2. **L'intelligence dedans = Prop 1 (Milo-assistant)** — quand le coach ouvre un client, c'est Milo qui génère la **synthèse** (« 7 derniers jours : fatigue en hausse, sommeil en baisse, nutrition 92 %, 2 records, poids stable ») et répond à ses questions. **Prop 2 = squelette, Prop 1 = muscles.**
3. **⚠️ Précision d'architecte (gravée) : les pastilles 🔴🟡🟢 sont DÉTERMINISTES** — calculées par nos **moteurs existants** (score de récup, tendance de poids, régularité, adhérence), **jamais inventées par le LLM**. Milo ajoute le **récit** (le « pourquoi »), les moteurs donnent le **fait** (le flag). C'est la règle « les faits viennent des moteurs, jamais du LLM » — et ça évite un appel IA par client (coût + Principe 24 « engagement responsable »).
4. **Timing : PAS maintenant.** On finit l'app individuelle (Profil Vivant, Milo, nutrition, récup) ; le tableau de bord n'a de valeur que si les moteurs qui l'alimentent sont solides. Le Mode Coach se greffe **ensuite**, naturellement.

> **Résumé** : structure Prop 2 (tableau de bord priorisé = métier réel du coach, prototype déjà en cours) · animée par le Milo-assistant de Prop 1 · pastilles calculées par les moteurs déterministes · **après** les fondations individuelles.

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
14. 🎓 **Mode Coach / multi-rôles** (voir la vision dédiée ci-dessous) — le plus gros, le plus tard.

> Principe : **structurer avant d'empiler** (voir « Principe directeur » plus bas). Une chose à la fois, testée, sur branche Git.

---

## 🎯 Objectif unique → PRIORITÉS classées (vision Michel, proposée GPT, 20/07) — À DÉCIDER

**Vision Michel** (déclenchée par le cas Tatiana) : *« un problème plus profond qui résout pas mal de
choses »* — un sportif a **plusieurs priorités simultanées**, pas un objectif unique. GPT : remplacer
« objectif » par des **priorités classées** (🥇 Priorité 1 · 🥈 2 · 🥉 3). Ex. **Michel** : 1) Force,
2) Muscle, 3) Perte de gras · **Tatiana** : 1) Définition/perte, 2) Muscle. → Milo sait **quoi
privilégier**, gère les **contradictions** par l'ordre, et devient **plus proche d'un coach humain**.

**⭐ Point clé (Claude)** : cette évolution **SUBSUME la décision « défaut objectif muscle »** — plus
besoin du drapeau « confirmé ? ». **Aucune priorité définie = objectif inconnu → Milo demande/observe**
(le principe person-first marche enfin naturellement). Le problème profond **résout le petit**.

**Garde-fous d'architecte (Claude) :**
1. **Changement de fond** : touche profil + inscription + **nutrition** (macros calculées depuis
   l'objectif unique) + contexte Milo + migration. Foundational, pas un patch.
2. **Nutrition = point délicat** : décider ce qui **pilote les macros** (probablement **Priorité 1 →
   phase**). Mapping priorités→macros à cadrer.
3. **UX simple** (règles #7/#10) : classer 1-3 priorités doit rester facile ; **dégrader à 1** = objectif
   unique ; défauts sensés ; pas d'usine à gaz (pas de poids/pourcentages en v1, juste l'ORDRE).
4. **Séquencement** : à concevoir **AVEC l'onboarding** (priorité #1) — c'est là qu'on capture les
   priorités. Pas en bolt-on.
5. **Migration douce** : objectif unique existant → **Priorité 1 = [son objectif]**, zéro perturbation.

**Décisions consolidées (Michel + GPT + Claude, 20/07)** :
- **Max 3 priorités**, dans une **LISTE FERMÉE** d'objectifs (force / muscle / perte de gras /
  forme-santé / endurance / définition…) — simplifie le raisonnement de Milo.
- **Nutrition** : la **Priorité 1 pilote** la stratégie, **les priorités secondaires la MODULENT**
  (GPT — ex. Force + Perte de gras → maintien/léger surplus, pas gros surplus). Mapping à cadrer.
- **Terminologie** : garder **« Priorités »** (⚠️ « phase » déjà pris = nutrition charge/décharge +
  cycle de force → collision) ; l'évolution est couverte par le fait qu'on **re-classe** les priorités.
  *(GPT proposait « Phase actuelle » ; à re-trancher au design, mais Claude penche « Priorités ».)*
- **À concevoir AVEC l'onboarding** · migration : objectif unique → Priorité 1 · **pas une 9ᵉ brique**
  (évolution de la couche Objectif/ADN).

**Statut** : 🟢 **direction validée** (évolution MAJEURE de la couche Objectif — influence coaching +
nutrition + raisonnement). **Construction = avec le chantier onboarding.** Pour l'immédiat (débloquer
VC-001), fixes légers suffisent : **garde-fou anti-invention** + **contexte honnête** (objectif non
défini → « non renseigné, demande ») + **le harnais VC exporte le contexte** (règle des 3 vérifs).

---

## 📅 Résumé hebdo « Ta semaine passée » v2 — SPEC VALIDÉE (Michel + GPT + Claude, 20/07/2026)

**Constat** : le résumé actuel (`checkWeeklySummary`, app.js) = **stats froides** (séances, volume,
calories, badges). GPT : *« ce n'est pas un ticket de caisse, c'est une histoire racontée par Milo. »*
Le résumé = 1ʳᵉ **prise de recul** hebdo → un pas vers la **brique 8 (Synthèse)** + contenu partageable.

**Spec finale (à construire) — 2 niveaux, LOCAL D'ABORD :**
- **A. Bloc LOCAL enrichi (0 IA, gratuit, s'affiche TOUJOURS)** :
  - **Comparaison à la semaine d'avant** (séances + volume avec ▲/▼ et %).
  - **Le fait marquant** (1 highlight par ordre de force) : record battu (nom+charge) · sinon meilleur
    lift · sinon groupe le plus travaillé · sinon plus grosse séance.
  - **Régularité** (mini-série hebdo : « 3ᵉ semaine de suite ≥2 séances 🔥 »).
  - Garder séances/volume/calories/badges, mieux présentés. (Répartition muscles = optionnel.)
- **B. Phrase de MILO (IA, GRATUITE POUR TOUS — décision GPT : ça fait partie de l'identité)** :
  - Raconte l'**histoire** de la semaine + un **« moment de fierté »** (« je suis surtout fier de… »)
    + **un objectif simple pour la semaine suivante** (⭐ **continuité de coaching** — réutilise la
    mécanique d'objectif du débrief, version hebdo).
  - **Local d'abord** : la phrase enrichit le bloc local ; si l'appel échoue le lundi matin (réseau),
    le résumé local s'affiche quand même. Anti-blocage.
- **Cible (exemple GPT)** : *« Cette semaine, tu as retrouvé ton rythme. Trois séances, un volume en
  hausse de 12 % et un nouveau record au développé couché. Je suis surtout fier de ta régularité.
  Objectif de la semaine prochaine : conserver ce rythme avec au moins deux séances. »*

**⚠️ Garde-fous :**
- **Zéro culpabilisation** (Constitution) : semaine légère (1 ou 0 séance) → ton neutre/bienveillant,
  jamais de morale (« la vie passe avant, on repart quand tu veux »).
- **Coût** : 1 appel IA/lundi/utilisateur (négligeable maintenant, à surveiller à l'échelle) —
  accepté car c'est l'âme du produit, et le local protège.
- **Checklist #11** (feature user-facing) : WHATS_NEW + red dot + aide `?` + aide détaillée à faire à la livraison.

**⏳ PLUS TARD (Premium — brique 7/8)** : analyse poussée = **tendances multi-semaines**, évolution,
recommandations avancées (le « premium débloque l'intelligence de la mémoire », pas son existence).

---

## ⏱️ Timer de repos adapté à l'intensité RÉELLE + l'âge (réflexion Michel affinée, 20/07/2026)

**Constat Michel** : quand on s'entraîne en **force** (charges lourdes, peu de reps), le timer de
repos **ne s'adapte pas** — il reste à ~1'30-2'00 max, alors qu'en force il faut **3 à 5 min**.
**État actuel** : le repos s'adapte par **type de série** (N=`defRest`~130 s, W=45 s, E/échec=240 s,
D=20 s) + réglage manuel par exo (`S.exRestPref`, éditeur ft-v438) + ±15 s. Aucune adaptation
automatique à l'**intensité réelle** ni à l'**âge**.

**✅ Approche retenue (Michel, meilleure que « suivre la discipline déclarée ») : DÉDUIRE de la
séance d'avant.** Les reps réellement faites sont un proxy fiable de l'intensité — marche tout
seul même si le profil est vide. Data-driven > déclaré.

**Règle proposée (v1)** — on lit les reps des séries de travail de **cet exo à la séance
précédente** (`getPrev`, exclure W/É) :
- ≤ 5 reps → **180 s** (force) · 6-8 → 150 s · 9-12 → 120 s · 13+ → 90 s
- **+ bonus âge** (`S.age`) : ≥ 40 → +20 s · ≥ 50 → +40 s · ≥ 60 → +60 s
- **Pas d'historique** (1ʳᵉ fois / 1ᵉʳ entraînement) → replier sur les reps de la **série du jour**,
  sinon le **défaut par type**.

**Garde-fous :**
- ⚠️ **Suggestion, jamais imposé** — l'utilisateur règle toujours à la main par-dessus (existe déjà).
- L'échec (type E) garde son 240 s ; ceci raffine surtout les séries **N** (normales).
- ⏳ **Nuance v2 (plus tard)** : un exo d'**isolation** à 5 reps (ex. leg curl) n'a pas besoin
  d'autant de repos qu'un **gros mouvement** à 5 reps (squat/soulevé) → affiner « reps **+** compound
  ou pas » (on sait déjà deviner le muscle/l'exo via `_MEX`). Pour v1, reps seules = 80 % du bénéfice.
- Petit chantier, à faire quand Michel veut (indépendant de la feuille de route mémoire/import).

## 🤖→🏋️ Milo propose une séance dans le chat → « charger dans ma séance » (precision de la priorité #4)

Déjà dans la feuille de route (**import 1 clic**, `_saveForceProgram` à moitié bâti). Précision
Michel (20/07) : quand Milo propose une séance/un programme **dans le chat** et qu'elle convient,
un **bouton pour l'incorporer directement dans la séance en cours** (pas juste l'enregistrer en
programme). À faire **après la mémoire** (Option C).

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

## 🧠🗑️ PHILOSOPHIE DE LA MÉMOIRE — apprendre ET savoir oublier (angle mort GPT 22/07, futur principe — PAS maintenant)

> *« La mémoire ne consiste pas seulement à apprendre. Elle consiste aussi à savoir oublier. »* — GPT

**Le constat (GPT)** : maintenant qu'on sait *retenir* (ADN, Observations, mémoire durable de conversation `ft-v582`), il faudra un jour une **vraie philosophie de la mémoire** — car toute mémoire qui n'oublie jamais devient fausse. Distinguer :
- **PERMANENT** (ne bouge presque jamais) : blessures/pathologies chroniques, préférences fortes, matériel disponible, objectifs de long terme, motivation profonde.
- **TEMPORAIRE / à faire évoluer** : anciennes douleurs guéries, objectifs abandonnés, anciennes habitudes, ancienne salle de sport.
- **À RE-CONFIRMER régulièrement** : ce qui a une durée de vie (« tu t'entraînais le matin — c'est toujours le cas ? »).
- **ARCHIVABLE automatiquement** : ce qui n'a plus servi une décision depuis longtemps (cohérent Principe 4 « chaque info doit être utile »).

**⚠️ MISE À JOUR (22/07/2026)** : le **principe** est désormais **GRAVÉ** (le risque « mémoire = prison » de Mistral a été élevé en garde-fou actif → Constitution **Principe 22** « la mémoire est un tremplin, jamais une prison » + `PRESENCE-MILO`). Ce qui reste **futur**, c'est le **MÉCANISME** (le cycle de vie : marquer permanent/temporaire/à-re-confirmer/archivable, vieillir/re-questionner/archiver au bon moment). On a le principe ; on n'a pas encore l'outil. On note, on ne construit pas le mécanisme maintenant.

**Nuance d'architecture (Claude)** : le *mécanisme* d'oubli existe déjà en embryon, on n'ajoute pas de silo —
- l'**état du jour** (`S.dayState`, `dayStateLog`) est **éphémère par nature** (remis à zéro chaque nuit) → le « temporaire » est déjà séparé du durable ;
- la **douleur du jour** (Gardien) ≠ une **zone fragile durable** (Profil Santé) → la distinction permanent/ponctuel est déjà posée côté douleurs ;
- les **Observations** (`registre.observations`) ont déjà `validated` / `rejected` + `deleteObs` → l'utilisateur peut **déjà** faire oublier.
Ce qui **manque** = un **cycle de vie** de la mémoire DURABLE elle-même : marquer chaque souvenir `permanent` / `à re-confirmer` / `archivable`, vieillir/re-questionner/archiver au bon moment. À concevoir **après** la mémoire vivante (briques 7-8), pas avant. Ne pas en faire un principe de Constitution tant que ce n'est pas prouvé fondamental (cf. « critère d'entrée dans la Constitution »).

## 🤝 LA CONTINUITÉ = LA SIGNATURE DE MILO (réflexion GPT 19/07 — gravée, à concevoir)

> *« La véritable signature de Milo n'est pas l'IA. C'est la continuité. Si, après plusieurs
> mois d'absence, un utilisateur revient et pense : "Il s'est souvenu de moi", alors nous
> aurons créé quelque chose de réellement différenciant. »* — GPT

**L'idée** : Milo n'est pas qu'un coach intelligent, c'est un **compagnon fiable qui reprend
la conversation là où elle s'était arrêtée** — y compris **après une longue absence**.
- **Accueil de retour SANS culpabilisation** (⚠️ le point crucial) : *« Ravi de te revoir. Ça
  fait ~4 mois depuis notre dernière séance. On reprend tranquillement et on refait le point. »*
  Milo **constate** le temps écoulé, **accueille**, reprend le fil — il ne **reproche JAMAIS**
  une absence (à l'inverse des streaks qui font la morale). = âme produit, cohérent avec « la
  vie avant le programme » + Constitution Principe 14.
- **Rattachement** : ce n'est pas une brique neuve → c'est **la voix concrète de la brique 7
  (Mémoire vivante)** + la catégorie d'anomalie déjà gravée *« événement marquant : retour après
  longue absence »* (Gemini/ChatGPT, « moins mais mieux »). On lui donne un visage, on ne crée
  pas de silo.
- **⚠️ Garde-fou (nuance Claude)** : la promesse doit **tenir même quand la mémoire est mince**
  (nouvel utilisateur / peu de données) → le « bonjour, ça fait X mois » doit **se dégrader
  proprement** s'il n'y a pas grand-chose à rappeler, sinon la promesse se retourne contre nous.
  À régler finement + tester.

**Promesse d'onboarding** (à choisir — doit être **vérifiable**, PAS du marketing ; l'utilisateur
la constate lui-même après quelques semaines) :
- ⭐ *« Je retiens ce qui compte pour mieux t'accompagner. »* (préférée Claude)
- *« Chaque séance construit la suivante. »*
- *« Tes efforts méritent qu'on s'en souvienne. »*
→ à brancher sur le chantier **onboarding / effet Waouh** (priorité #1).

**Défendable ?** (question Michel) — les briques techniques existent (LLM + mémoire persistante ;
cf. Replika/Pi côté compagnons) → **pas un verrou technique**. La vraie protection = **(1)** le
contexte (personne ne fait « le compagnon qui se souvient » **dans le sport** — Hevy/Strong/
Garmin/Whoop stockent la donnée mais ne tissent pas de relation, et leurs streaks culpabilisent),
**(2)** l'exécution + la philosophie (anti-culpabilisation, miroir jamais prophète), **(3)**
l'accumulation de SON histoire = coût de sortie qui grossit tout seul. Un gros acteur *pourrait*
l'ajouter → notre défense = « mieux, avant eux, avec une âme » + l'avance + le verrou des données.

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

### 📊 ÉTAT ACTUEL DU CHANTIER TRADUCTION (gravé 19/07 — « on avait déjà bien bossé dessus »)
**On ne part PAS de zéro : un système i18n complet est déjà bâti ET branché sur le CLONE.**
- **Fichier unique** : `clone/translations.js` (existe **aussi à la racine `translations.js`, identique**, mais **DORMANT en prod** — pas chargé dans `index.html`, pas utilisé par `coach.js` prod, absent du PRECACHE, pas de sélecteur dans le menu prod).
- **5 langues** : 🇫🇷 FR (défaut) · 🇬🇧 EN · 🇪🇸 ES · 🇬🇷 EL (grec) · 🇷🇺 RU. *(Cible annoncée Michel = EN/RU/EL ; l'espagnol est là en bonus — à garder ou retirer, décision Michel.)*
- **Emplacements précis** (dans `translations.js`) : liste des langues du sélecteur = **ligne 375** `var langs=['fr','en','es','el','ru']` ; drapeaux/noms/langue-de-Milo = **lignes 14-17** (`LANG_FLAGS`/`LANG_NAMES`/`LANG_COACH`) ; **dictionnaire `TR`** (~290 phrases FR→{en,es,el,ru}) = **lignes 22-310** ; sélecteur `openLangPicker()` = **lignes 368-389**.
- **Mécanisme** : le code garde ses textes SOURCE **en français** ; à l'affichage, un `TreeWalker` parcourt le DOM et remplace les chaînes connues (dictionnaire `TR`), un **MutationObserver** ré-applique après chaque rendu dynamique (+ traduit les `placeholder`). `setLang(l)` enregistre `ft4_lang` et **recharge la page**. Sélecteur de langue à drapeaux (`openLangPicker`), bouton drapeau dans le header (`.lang-flag-cur`).
- **✅ Milo (le Coach) répond ENTIÈREMENT dans la langue choisie** — `clone/coach.js` injecte `LANG_COACH[window._LANG]` dans le prompt (« tu réponds TOUJOURS en <langue>… réponds dans cette langue, soignée et idiomatique »). **C'est le plus gros morceau, et il est fait.**
- **Couverture ACTUELLE** : le **squelette** est traduit (nav, gros boutons type « Start a workout », titres clés, onboarding, menu, muscles, objectifs, niveaux) **✅** ; **MAIS** tout le **contenu dynamique NON listé dans `TR` reste en FRANÇAIS** (carte de Milo, récup « Bonne récupération… », sommeil « Mauvais/Moyen/Bon », dates, aides détaillées, guides, pop-ups « Quoi de neuf », noms d'exercices…). Vérifié en capture : clone en EN → nav anglaise mais plein de cartes encore en français.
- **Testé (Playwright)** : `_LANG` EN/RU/EL OK, `t('Accueil')` = Home/Главная/Αρχική, Milo configuré dans la bonne langue, 0 erreur JS. **Sélecteur validé visuellement par Michel sur iPhone** (grec + russe s'affichent nickel).
- **⚠️ Limite de l'approche** : le dictionnaire ne traduit que les **phrases EXACTES listées** → couvrir 100 % de l'app = gros travail d'énumération (des milliers de chaînes). Rendement décroissant sur le contenu profond.
- **PLAN POUR FINIR** (quand on reprend) : ① **étendre la couverture** des écrans très visibles (accueil, séance, onboarding, messages de Milo, récup, sommeil) pour un rendu propre — une UI à moitié traduite (FR+EN mélangés) casse l'effet Waouh ; ② **promouvoir en prod** (charger `translations.js` dans `index.html`, wirer `coach.js` prod sur `LANG_COACH`, ajouter le sélecteur au menu prod + le fichier au PRECACHE + bump `sw.js`) ; ③ le contenu secondaire (aides/guides longs) après, ou laissé FR au début (mot honnête à l'utilisateur). ⚠️ Reprendre **sur le clone**, valider, puis promouvoir (workflow habituel).

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

## 📤 Export performance utilisateur + template Excel premium — ✅ complétude FAITE (ft-v891), import à faire

- ✅ **Export COMPLET — FAIT le 17/08/2026 (ft-v891).** ⚠️ **Cette fiche disait la mauvaise chose, et ça a coûté cher.** Elle notait « améliorer le bouton → fichier Excel/CSV propre **(séances, charges, PRs)** » — c'est-à-dire le **format**, et une liste qui reprend **exactement les trois choses que l'export contenait déjà**. Le vrai problème — l'export n'emportait que **6 blocs sur 38** — n'était écrit nulle part. L'idée a donc survécu comme « le rendre plus joli » au lieu de « le rendre entier », rangée en confort à côté d'un template Excel premium. *Le quoi a été gardé, le pourquoi a été perdu* (`docs/ORIGINE-DES-REGLES.md`) — et personne ne pouvait le retrouver en relisant la fiche, moi compris : j'ai lu les exports de Michel pendant des jours sans me demander s'ils étaient complets, et j'en ai tiré une conclusion fausse sur ses bilans corporels.
- **Template Excel premium** (plus tard, vraie idée future) : offrir le beau fichier de suivi (graphes, mésocycles, calculateur 1RM) en bonus **premium** — vrai argument de vente. ⚠️ **Ne pas re-mélanger les deux sujets** : le format est du confort, la complétude était un correctif. C'est leur confusion qui a enterré le second pendant des mois.
- ⏭️ **Reste à faire : le bouton d'IMPORT.** L'export est complet, mais il n'existe aucun chemin pour le relire — c'est un aller simple. À construire avec les garde-fous d'usage (montrer ce que contient le fichier AVANT d'écrire, ne jamais écraser en silence, règle d'or #3).

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

> 🏛️ **Cadre d'archi (cap Michel 22/07) : `MODELE-METIER.md` Principe n°2 « Toute donnée a une SOURCE ».** On ne code PAS ces intégrations maintenant, mais on prépare le modèle : chaque donnée porte un champ `source` → une nouvelle app/appareil = un **adaptateur**, jamais une réécriture. La 1ʳᵉ brique nutrition (journal) doit déjà porter une `source` par entrée.

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

## 🌐 EN-TÊTES `no-cache` sur sw.js + index.html — à faire LE JOUR DU DOMAINE (noté 01/08/2026)

> Idée venue du projet de Tatiana (leçon croisée déjà notée dans `docs/GALERES-ET-LECONS.md`) :
> le dernier étage d'un mécanisme de mise à jour béton, c'est le **serveur** qui dit au navigateur
> « ces 2 fichiers-là, ne les garde jamais en cache » (`Cache-Control: no-cache` sur `sw.js` et
> `index.html` UNIQUEMENT — tout le reste peut rester caché longtemps).

- **Ce qu'on a déjà** (l'essentiel, c'est de chez nous que la recette vient) : version `ft-vNNN` dans
  le SW, `updateViaCache:'none'`, vérification au démarrage / 5 min / retour dans l'app / retour du
  réseau, rechargement auto (sans double logo depuis ft-v691), jamais pendant une séance.
- **Le morceau manquant** : les en-têtes serveur. **GitHub Pages ne permet PAS de les régler** —
  c'est une limite de l'hébergeur, pas un oubli. En pratique le délai résiduel est de quelques
  minutes au pire : gain réel faible AUJOURD'HUI, d'où le « plus tard ».
- **Quand le faire** : le jour où on prend un **vrai nom de domaine** (mise en vente) — passer le
  domaine par **Cloudflare** (Pages ou proxy devant GitHub Pages) donne les en-têtes gratuitement,
  via un fichier `_headers`. Les deux chantiers vont ensemble, ne pas faire l'un sans l'autre.
- **⚠️ À vérifier ce jour-là** (les 2 trous vus sur le projet de Tatiana) : ① contrôler que les
  en-têtes sont **réellement servis en prod** (`curl -sI` sur sw.js — un réglage posé mais pas
  déployé = rien) ; ② un appareil déjà coincé sur une vieille version ne se répare pas tout seul —
  prévoir UN dernier nettoyage manuel par appareil, puis plus jamais.

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

---

## ⛔ ÉCARTÉ le 03/08/2026 — enrichir le catalogue d'exercices « maison »

**La proposition** : j'avais mesuré les trous du catalogue et proposé de combler les plus criants —
**0 curl élastique** sur 16 biceps, **0 mollets au poids du corps** sur 8, **2 exercices de fessiers
à la maison** sur 33. Sur 335 exercices, seuls 80 se font sans machine.

**La réponse de Michel** : *« les 3 exercices tu les retires, on en a déjà beaucoup. »*

**Décision : on n'ajoute pas.** Le catalogue est jugé suffisamment fourni. La mesure reste vraie —
si le besoin revient (un retour de testeuse qui s'entraîne à la maison, par exemple), elle est ici
et il n'y aura pas à la refaire.

⚠️ **Ne pas re-proposer sans un déclencheur nouveau.** Une idée écartée qui revient toute seule fait
perdre du temps aux deux (R30 : un retrait volontaire doit être écrit, sinon il redevient un bug).

---

## 🌐 TRANSFORMER `dashboard.html` EN VRAI SITE (Michel, 09/08/2026 — « il faudra le transformer en vrai site »)

**Ce que c'est aujourd'hui, et il ne faut pas s'y tromper** : `dashboard.html` est une **vue
ordinateur de l'application**, pas un site. Elle charge les mêmes fichiers que l'app et lit les
mêmes données locales (`ft4_*`) — c'est voulu (R2, la leçon du `/clone/`). Conséquence directe :
**un visiteur qui n'a jamais utilisé Force Tracker n'y voit rien** — « Bonjour — », des compteurs
à zéro, des blocs vides. Elle est faite pour quelqu'un qui a **déjà** des séances.

**Ce qui manque vraiment, et c'est autre chose** : il n'existe **aucune page qui présente le
produit**. Quelqu'un qui découvre Force Tracker arrive directement dans l'app, en colonne de
430 px sur un écran de 1440. Rien ne dit ce que c'est, pour qui, ni pourquoi ce n'est pas une IA
mais *une mémoire sportive* (`docs/VISION-FORCE-TRACKER.md`).

**⚠️ NE PAS FUSIONNER LES DEUX.** Ce sont deux publics opposés :
| | Pour qui | Ce qu'on y montre |
|---|---|---|
| **Site vitrine** (n'existe pas) | quelqu'un qui ne connaît pas | ce que c'est · pour qui · une capture · un bouton « essayer » |
| **`dashboard.html`** (existe) | quelqu'un qui l'utilise déjà | SES séances, SES records, SA progression |

Mettre les deux au même endroit donnerait une page qui rate les deux cibles.

**La plus petite étape utile** : une page d'accueil (`accueil.html` ou la racine) — un titre, la
phrase de la Vision, 3 captures, un bouton vers l'app, et le lien Confidentialité (déjà écrit).
Aucune logique, aucune donnée, **aucun risque pour l'app** : c'est un fichier séparé.

⚠️ **À faire AVANT toute communication publique**, et à coupler avec deux chantiers déjà notés
ici : le **domaine** (§ en-têtes `no-cache` le jour du domaine) et le **nom** — vérifié le
09/08 : aucune appli de sport ne s'appelle « Force Tracker » (les homonymes sont *Field Force
Tracker*, un logiciel de gestion de techniciens, et *blue force tracking*, un terme militaire —
autres secteurs, aucun conflit). Le vrai sujet n'est pas légal, il est d'**être trouvé** : deux
mots très courants, noyés parmi Strong / StrongLifts / RepCount.

---

## 💰 DÉPLACER LES CONSIGNES GÉNÉRIQUES DU PAQUET PERSO VERS LE PAQUET COMMUN (mesuré le 10/08/2026)

**Ce qu'on a trouvé** (fouille demandée par Michel, mesurée dans l'app) : **1 278 tokens de
consignes strictement génériques** sont rangés dans le bloc PERSONNEL du prompt — donc réécrits
**pour chaque personne, chaque matin**, au lieu d'être déposés **une fois pour tout le monde**.

| Morceau | car | tokens |
|---|---|---|
| MÉTHODE DE COACHING | 1 407 | 485 |
| PROFIL ATHLÈTE (la consigne, pas les données) | 746 | 257 |
| OBJECTIFS FIXÉS (la consigne) | 740 | 255 |
| DERNIÈRES SÉANCES (la consigne) | 650 | 224 |
| CHECK-IN · POIDS · RECORDS (consignes) | 164 | 57 |

**⚠️ NE PAS LE FAIRE MAINTENANT — ce serait une PERTE.** Le bloc commun est gardé **1 h**
(écriture à 2×), le bloc perso **5 min** (écriture à 1,25×). Tant qu'il n'y a **qu'un
utilisateur**, déplacer coûte plus cher (0,23 $/mois contre 0,14 $).
**Le point de bascule est à 2 utilisateurs** ; le gain devient réel à partir de 10 :

| | laisser | déplacer |
|---|---|---|
| 1 utilisateur | **0,14 $/mois** | 0,23 $/mois |
| 10 utilisateurs | 1,44 $/mois | **0,23 $/mois** |
| 100 utilisateurs | 14,38 $/mois | **0,23 $/mois** |

**⚠️ ET CE N'EST PAS UN COPIER-COLLER.** Ces consignes sont collées à leurs données **exprès** :
« Aucun objectif chiffré fixé » est suivi de « quand il parle d'objectif, appuie-toi sur **ces
cibles** ». Déplacer la consigne loin de la donnée casse le renvoi (R8 : un prompt ne compense
jamais une donnée absente — ici c'est le miroir, une consigne qui pointe vers un vide). Il faut
**reformuler chaque renvoi**, un par un, avec le noyau dur en vert à chaque étape.

**⏭️ Déclencheur** : le jour où l'app a plus de 2 utilisateurs actifs par jour. Avant, ça coûte.

**⭐ ET IL Y A PLUS GROS À CÔTÉ, non chiffré ici** : le **catalogue d'exercices** (3 183 tokens)
est dans le bloc perso **parce qu'il est filtré par lieu d'entraînement**. On pourrait envoyer la
liste COMPLÈTE dans le bloc commun (partagée par tous) et ne garder dans le perso qu'une ligne
« voici les bacs qu'il peut utiliser ». ⚠️ Risque à évaluer : Milo verrait des exercices que la
personne ne peut pas faire, et pourrait les proposer — c'est exactement ce que le filtre par lieu
évite aujourd'hui. À ne tenter qu'avec des témoins solides.

---

## ⛔ ÉCARTÉ le 10/08/2026 — passer Milo en Haiku pour économiser

**La proposition** : Haiku coûte **3× moins cher** que Sonnet (0,005 $ le message contre 0,016 $,
soit **~5,70 $/mois** à 10 messages/jour). Après les corrections du 10/08 (les renvois du prompt
qui pointaient à l'envers), l'idée revient naturellement : *« s'il est plus fiable, on peut
peut-être passer en Haiku »*.

**La réponse de Michel, et c'est elle qui tranche** : *« on avait mis Sonnet pour tout le monde
normalement, parce que justement si les gens trouvent Milo nul ils ne vont pas le prendre. »*

**Décision : NON, et pour une raison PRODUIT avant d'être technique.** L'expérience **gratuite**
est l'argument de vente : quelqu'un qui essaie Milo et le trouve moyen ne passera jamais premium.
Économiser 5 $/mois en dégradant l'essai coûterait des abonnements à 5 €.

**Et techniquement, R9 le disait déjà** : un modèle léger suit mal les consignes fines —
l'« interrogatoire » du 26/07 résistait à **trois** durcissements du prompt, et la cause était le
modèle. Ce qu'un modèle plus léger lâche en premier, c'est précisément ce qui fait Milo : le
Gardien, « réponds d'abord puis AU PLUS UNE question », l'adaptation du ton, le refus d'inventer.

⚠️ **Ne pas re-proposer sans un déclencheur nouveau** (par exemple : un modèle léger nettement
plus capable, ou une mesure côte à côte sur le noyau dur qui montrerait qu'il tient). La décision
est aussi écrite **dans `worker.js`, à côté de la ligne qu'elle protège** (R27) — c'est là qu'on
la lira, pas ici.

**⭐ Pourquoi cette entrée existe** : l'idée a été re-proposée le 10/08 par Claude, alors qu'elle
était déjà tranchée — simplement parce qu'elle n'était **écrite nulle part**. C'est exactement
R30 : *un retrait volontaire non écrit redevient une proposition.*
---

## 🔍 OCR LOCAL AVANT L'IA — LA MESURE EST FAITE, LE VERDICT EST NUANCÉ (23/08/2026)

**D'où ça vient** : GPT propose (23/08) un pipeline « donnée structurée → PDF texte → OCR → IA ».
J'ai d'abord refusé sur le coût, en raisonnant sur le volume de Michel (5 imports/mois). **Il m'a
repris** : *« oui mais là tu penses à moi seulement, imagine avec des dizaines d'utilisateurs »*.
Puis : *« l'OCR pourrait fonctionner aussi pour d'autres choses utiles comme la prise de sang ? »*

**⭐ IL A RAISON SUR L'AMPLEUR — mesuré : 9 des 14 actions IA de l'app lisent une image**
(`importBloodTest`, `importBodyScan`, `foodLabel`, `importProgram`, `importHistory`,
`importMealPlan`, `readBarcode` — déjà local via ZXing —, `morphoAnalysis`, `bodyStudy`).
L'investissement s'amortirait sur presque tout, pas sur un seul écran.

**⚠️ MAIS LE COÛT N'EST PAS L'ARGUMENT** — chiffré sur Haiku 4.5, ~3 tranches d'image par import :
10 utilisateurs = **0,19 $/mois** · 200 = **3,76 $** · 1000 = **18,80 $/mois** (226 $/an). *Construire
et maintenir un OCR + un parser par fabricant coûte bien plus que 226 $/an.*
**⭐⭐ ET LE VRAI PROBLÈME D'ÉCHELLE EST AILLEURS** : `BODYSCAN_FREE_LIMIT = 2`. Un utilisateur non
premium a droit à **deux** lectures photo. Le scénario « 1000 imports = 1000 appels » **n'existe
pas** — l'app le plafonne déjà. *À l'échelle, le défaut n'est pas que ça coûte cher, c'est que la
fonction n'est presque pas disponible.* ⏭️ Le geste gratuit correspondant : **ouvrir à tous
l'import CSV/Excel** (`_isScaleCsvBeta`, réservé aux testeurs) — zéro OCR, zéro IA, déjà écrit.

### ⭐ CE QUE LA MESURE DIT VRAIMENT (Tesseract 5.3 + fra, sur SA photo d'étiquette)

Photo réelle : **4032×3024, tournée à 90°, reflets, surface courbe** — le pire cas.

| | |
|---|---|
| Valeurs retrouvées | **13 / 17 (76 %)** avec gris + contraste ×2,2 + agrandissement ×1,6 + netteté, `--psm 11` |
| Séparation des 2 colonnes (100 g / 30 g) | ✅ **fonctionne** par coordonnées (`image_to_data`) |
| Bruit | **55 nombres extraits pour 17 voulus** (le tableau d'acides aminés pollue) |
| Défaut systématique | le **`g` final lu `9`** (`3.39` = 3,3 g · `26.49` = 26,4 g) — corrigeable par règle |

**⚠️⚠️ J'AVAIS PRÉDIT UN ÉCHEC. C'ÉTAIT FAUX** — et Michel m'avait cité approbativement, donc le
corriger comptait double. L'OCR lit bien mieux que je ne l'annonçais sur une photo difficile.

**⛔⛔ MAIS LE DÉFAUT QUI DÉCIDE : le « 88 g » de PROTÉINES pour 100 g est TOTALEMENT ABSENT**
(vérifié : introuvable dans les 228 mots lus). *Sur une protéine en poudre, l'OCR perd la teneur en
protéines.* Idem pour glucides/100 g et fibres.
👉 **Et le pire n'est pas ce qu'il rate, c'est qu'il n'a aucun moyen de savoir qu'il l'a raté.** Un
pipeline qui rend « 388,5 kcal, 0 g de protéines » sans broncher, c'est le défaut de **ft-v971** :
un succès annoncé devant un résultat vide.

### ⭐⭐ LA CONVERGENCE QUI REND LA CHOSE FAISABLE

**Le contrôle de cohérence livré le matin même (ft-v972) attrape exactement ce cas** : sans les
protéines, `4×0 + 4×0 + 9×3,3 = 30 kcal` contre **388,5 annoncées** → **92 % d'écart** → alerte.

```
OCR → contrôle de cohérence (DÉJÀ EN PLACE)
        ├── ça tient        → 0 appel IA
        └── ça ne tient pas → l'IA prend le relais
```

C'est l'échelle de **R33**, avec le **juge automatique** qui décide de basculer — et il existe déjà.
Michel l'avait formulé lui-même : *« en cas d'échec on bascule à l'IA »*.

### ⏭️ CE QU'IL RESTE À MESURER AVANT DE DÉCIDER

⛔ **Les 5 rapports de balance n'ont PAS pu être testés** — ils n'étaient pas enregistrés sur le
disque de la session. Or ce sont des documents **propres** (captures droites, fort contraste), donc
le cas *favorable*. **Le chiffre qui manque est celui-là**, pas celui de l'étiquette.
⚠️ **Et le coût réel du chantier n'est pas l'OCR, c'est le PARSER** : l'OCR rend du texte, pas une
structure. Savoir que « Ferritine 45 ng/mL (30-400) » est un nom + une valeur + une unité + des
bornes se refait **à chaque format de labo**. C'est précisément là que l'IA gagne son prix.

**Critère de décision proposé** : mesurer sur 2-3 rapports de balance réels. **≥ 80 % des champs,
attribués correctement** → le chantier vaut le coup. **≤ 50 %** → on garde l'IA et on n'en reparle
plus. *Poids embarqué à prévoir : 2 à 4 Mo pour un moteur OCR, contre 880 Ko pour la plus grosse
bibliothèque actuelle — et la règle d'or #4 (ouverture instantanée) impose un chargement à la
demande, comme CIQUAL.*



---

## ✅ FAIT — le lecteur de rapport de balance sur le téléphone *(ft-v974, 23/08/2026)*

La mesure de faisabilité notée plus haut a été **construite** le jour même, sur décision de
Michel (*« on construit, parce que je l'utilise souvent »*). Ce qui est mesuré, dans un vrai
navigateur, sur ses 5 rapports MyBodyCheck :

| | |
|---|---|
| chargement du moteur | 0,3 s |
| lecture d'un rapport | 3,2 à 3,7 s |
| poids sur le réseau | ≈ 2 Mo, **une seule fois**, au premier scan |
| valeurs lues | 14 sur 16 (la masse maigre par soustraction, la 15ᵉ) |
| contrôles arithmétiques | 4/4 verts sur les 5 rapports |

⚠️ **Deux chiffres à ne pas oublier si quelqu'un reprend le sujet** :
- **la résolution décide de tout** : à 990 px de large, la protéine sort à 18,8 au lieu de 13,8 ;
  à 1900 px elle est juste. L'image préparée pour l'IA (1000 px) ne convient donc **pas** à l'OCR
  (**R14**) ;
- **« graisse sous-cutanée » est illisible** dans ce rapport (4 lectures fausses sur 5) parce que
  sa ligne chevauche le tableau d'impédance. Ce n'est pas une question de moteur.

⏭️ **Ce qui reste ouvert** : le même chemin pour la **prise de sang** (`importBloodTest`). Le
moteur est là, il ne coûte plus rien ; ce qui manque, ce sont les **règles de lecture** et,
surtout, un contrôle équivalent à l'arithmétique du rapport de balance — *sans lui, on ne saurait
pas si la lecture est juste*, et sur un bilan sanguin l'erreur coûte beaucoup plus cher.
