# CONTRE-AUDIT DU PLAN « MILO SESSION BUILDER »

> Réponse à la demande explicite de GPT (§77-79) : *« faire maintenant un contre-audit de ce plan
> sur ft-v1102 »*, *« ne pas implémenter tout le chantier immédiatement »*, *« ne pas accepter les
> affirmations de GPT comme vérité, tout confronter au dépôt réel »*. C'est fait. **Rien n'a été
> codé.** Mesuré le 02/09/2026 sur `ft-v1102`. Chaque classement s'appuie sur un chiffre, une
> ligne de code ou une sonde jouée dans un navigateur — jamais sur un souvenir.

## LE VERDICT EN UNE PAGE

**Le plan a raison sur la question, et se trompe sur l'état des lieux.**

Sa question centrale — *« la séance est-elle meilleure PARCE QUE Force Tracker connaît le
sportif ? »* — est la bonne, et personne n'y a répondu. Mais **la chaîne technique qu'il propose
de construire existe déjà presque entièrement**, et depuis des mois.

| Ce que le plan propose | État mesuré |
|---|---|
| Cartographier le payload d'une demande de séance | **EXISTE** — mesuré ici en 20 minutes |
| Une validation déterministe avant activation | **EXISTE** depuis le 24/08 (`_validationSeance`) |
| Éviter un 2ᵉ appel IA au démarrage | **EXISTE** — mesuré : **0 appel** sur tout le chemin |
| Détecter les doublons dans la séance générée | **EXISTE** (`out.doublons`) |
| Des personas qui demandent une séance | **EXISTE** — 20 des 55 scénarios du banc payant |
| Mesurer le coût d'une passe | **EXISTE** — `node tests/milo/eval.js` sort un devis chiffré |
| Milo demande l'info manquante au lieu d'inventer | **EXISTE** — scénario EV-045 |
| Le test A/B « avec / sans mémoire Force Tracker » | **ABSENT** — et c'est le seul qui compte |

**⛔ ET LE VRAI TROU N'EST PAS CELUI QUE LE PLAN DÉCRIT. Il est dans le banc d'essai lui-même :
sur ses 55 scénarios, 3 seulement donnent un historique d'entraînement à Milo.** Zéro programme,
zéro cycle, zéro état du jour, zéro mémoire. Autrement dit : **le banc payant mesure aujourd'hui si
Milo sait écrire une séance plausible, pas si la mémoire de Force Tracker la rend meilleure** —
exactement la question que le plan veut poser.

**Et trois lignes du banc rendent ses personas D (fatigue), H (historique récent) et le cycle de
force littéralement impossibles à écrire.** C'est là qu'il faut commencer, et ça ne coûte rien.

---

## A — LA CHAÎNE RÉELLE, MESURÉE (questions 1, 2, 9, 11, 12)

### A1. Comment Milo crée une séance aujourd'hui — la cascade à trois étages

Milo **n'émet pas de structure** : il écrit sa séance en français. La conversion en données se
fait côté app, en trois voies, dans cet ordre :

1. **le bloc JSON caché**, s'il est là (`_extractDaySession`) — gratuit, rétrocompatible ;
2. **le cervelet** (`_cerveletSeance`) — une 2ᵉ IA qui ne sait rien de la personne et n'a qu'un
   métier : traduire un texte en données. ⭐ **Appelée seulement AU TAP** : qui ne touche pas au
   bouton ne dépense rien ;
3. **la lecture déterministe du texte** (`_seanceDepuisTexte`) — gratuite, hors ligne, et
   nourrie de trois formats appris sur le terrain (« Nom 4×8 », nom sur la ligne précédente,
   et « S1 : 95×3 » une ligne par série).

Puis : `_montee()` complète la montée en charge (déterministe, hors du modèle),
`_appendSeanceQuestion` pose la carte *« Cette séance te convient ? »*, `_startSessionFromMilo`
(ou `_applyMiloSession` si une séance tourne déjà) applique, et `_appliqueMiloSession` est le
**point unique** que les deux portes traversent.

### A2. Ce qui se passe entre la réponse et la séance lançable — mesuré

Sonde jouée sur un texte au **format réel** que Milo écrit (une ligne par série) :

| Étape | Mesure |
|---|---|
| Séance lue | ✅ 3 exercices, via la lecture **texte** (gratuite) |
| Noms | `Développé Couché`, `Rowing Barre`, `Élévations Latérales` — repris **tels quels** |
| Séries après montée en charge | 7 / 3 / 3 (les paliers d'échauffement sont ajoutés par le code) |
| Charges | 35/45/60/75/80/85/85 — **la prescription de Milo est respectée**, l'échauffement est calculé |
| Marqueur `_milo` sur tous les exercices | ✅ (il suit la séance jusque dans l'historique) |
| **Appels IA pendant lecture + validation + activation** | **0** |
| **Appels réseau pendant l'activation** | **0** |

👉 **Question 12 répondue par la mesure : « Commencer la séance » ne déclenche aucun appel IA.**
Le schéma que le plan appelle de ses vœux en §50 — *1 appel utile, validation locale, activation* —
est **déjà celui qui tourne**.

### A3. Le Gardien revalide-t-il ? Oui, et depuis le 24/08 (question 11)

`_validationSeance(newExs, mode)` s'exécute au point unique, avant activation, et rend quatre
familles : **doublons** · **exclusions durables** (`S.exSwaps` + raisons `durable`) · **blessures**
(zones actives ou douloureuses aujourd'hui, via `_gardienZones`) · **charnières de hanche**
(deux mouvements lourds sur des lombaires déjà chargées).

⚠️ **Elle SIGNALE, elle ne bloque pas** — R24 et Constitution P13 (adapter, jamais interdire).
Le plan écrit en §49 *« MILO PROPOSE → FORCE TRACKER VALIDE → UTILISATEUR ACTIVE »* : c'est
exactement l'ordre en place.

### A4. Le payload d'une demande de création — mesuré (question 3)

Capture du **vrai** corps envoyé pour *« Crée-moi ma séance d'aujourd'hui. »*, 0 appel réel.
Six canaux : `action`, `email`, `message`, `context`, `history`, `coachMemory`.
Le contexte est découpé **comme `worker.js` le découpe** — chercher un mot dans les 71 000
caractères entiers ne mesure rien, les règles parlent déjà d'épaule et de mollets.

| Bloc | Profil nu | + mémoire Force Tracker |
|---|---|---|
| total | 71 561 car. | 78 787 car. |
| bloc **COMMUN** (caché 1 h) | 43 473 | 45 235 |
| bloc **PERSONNE** | 25 136 | 30 482 |
| bloc **INSTANT** | 2 952 | 3 070 |
| canal `history` | 63 | 161 |
| canal `coachMemory` | 0 | 34 |

⭐ **Ce qui parle de CETTE personne : 39 % du payload pour un profil nu, 43 % pour un profil
complet. La mémoire Force Tracker pèse +5 464 caractères.**

### A5. Ce qui arrive vraiment jusqu'à Milo (questions 4 et 5)

Cherché **dans le seul bloc propre à la personne**, avec un profil nu comme contrôle négatif :

| Donnée | Profil nu | Profil complet |
|---|---|---|
| record 110 kg | ❌ | ✅ |
| record squat 120 kg | ❌ | ✅ |
| sommeil 5 h | ❌ | ✅ |
| observation validée du registre | ❌ | ✅ |
| historique daté | ❌ | ✅ |

⚠️ **Deux de mes marqueurs ont menti avant d'être corrigés**, et c'est la même signature que
d'habitude : *un résultat identique des deux côtés*. « épaule » et « mollets » ressortaient
**même sur le profil nu** — parce que le **catalogue d'exercices** est dans le bloc personnel et
qu'il contient ces mots. Et mon observation du registre est d'abord sortie ❌ parce que ma fixture
écrivait `{t, d}` là où le code lit `status:'validated'` et `fact`. *Une sonde qui invente un nom
de champ mesure toujours zéro, et zéro ressemble exactement à un trou.*

---

## B — LE SEUL TROU DE DONNÉES TROUVÉ : LE CÔTÉ D'UNE BLESSURE

**MESURÉ.** L'app **collecte** le côté d'une blessure à l'inscription (`obSetInjSide`, boutons
gauche/droite/les deux) — mais :

- l'écran Santé écrit la blessure comme `{zone, status, since}` (`setup.js:1758`) : **aucun champ
  côté** ;
- le contexte la rend comme `zone (statut)` (`coach.js:3646`) : **le côté n'y est pas** ;
- `_gardienZones()` garde bien un `todaySide` pour une **douleur du jour**, et **rien** pour une
  blessure durable.

👉 *Le côté n'existe que sous forme de TEXTE LIBRE, dans les notes écrites à l'inscription.*
C'est **R4** (l'information ne descend pas jusqu'à la donnée) et **R8** (la jumelle est gardée,
l'original ne l'est pas) — la douleur du jour a son côté, la blessure durable ne l'a pas.

⚠️ **Ce n'est PAS un trou de sécurité** : sans côté, `_validationSeance` signale l'exercice dans
tous les cas — elle se trompe **du côté prudent**. C'est un **plafond de précision** (R31) : on ne
peut pas construire une séance qui épargne l'épaule droite et charge la gauche. **Classé ABSENT,
priorité basse, et à ne PAS corriger sans décision produit** — ajouter un champ, c'est ajouter une
question à l'écran Santé.

---

## C — LE VRAI DÉFAUT EST DANS LE BANC D'ESSAI (questions 6, 7, 15, 20)

### C1. Les personas du plan existent déjà — en nombre

| Ce que le plan demande | Mesuré dans le dépôt |
|---|---|
| Personas qui demandent une séance | **20 des 55 scénarios** du banc payant |
| Persona débutant (§10) | EV-007, EV-035, EV-030 |
| Persona blessure (§15) | EV-050 (« une blessure déclarée est respectée dans la séance ») |
| Contrainte de temps (§13 durée) | EV-033, EV-034, EV-038 (« 40 minutes montre en main ») |
| Exercice imposé par la personne (§19) | EV-039 (« je veux ABSOLUMENT le pec deck ») |
| Milo demande au lieu d'inventer (§67) | EV-045 (« demande mal formulée ») |
| Il n'invente pas d'exercice hors catalogue (§47) | EV-052 |
| Couverture du banc de non-régression | `_validationSeance` **20 fois**, `_startSessionFromMilo`/`_appliqueMiloSession` **24 fois**, `_extractDaySession` **14 fois**, `_cerveletSeance` **9 fois** |

### C2. ⛔⛔ MAIS LES PERSONAS N'ONT PAS DE MÉMOIRE — ET C'EST LE CŒUR DU SUJET

Le banc remet tout à neutre avant chaque scénario (`_vcApplyPersona`), et ne rétablit que ce que
la fixture déclare. Compté sur les 55 :

| Donnée posée par la fixture | Nombre de scénarios |
|---|---|
| `sessions` (historique d'entraînement) | **3** |
| `prs` (records) | 7 |
| `healthProfile` | 4 |
| `sleepLog` | 1 |
| `programmes` · `cycle` · `dayState` · `coachMemory` · `registre` · `weightLog` | **0** |

👉 ***50 scénarios sur 55 demandent à Milo de travailler sans le moindre historique.***
Or vingt d'entre eux lui demandent de **construire une séance**. **Le banc payant mesure donc si
Milo sait écrire une séance plausible — pas si Force Tracker la rend meilleure.** C'est
littéralement la question du plan, et elle n'est couverte par rien.

### C3. Et trois personas du plan sont AUJOURD'HUI IMPOSSIBLES À ÉCRIRE

Mesuré : on pose un état du jour, un cycle et une séance en cours dans un persona, puis on regarde
ce qui survit.

| Champ | Résultat |
|---|---|
| `dayState` (fatigue, douleurs du jour) | ⛔ **forcé à `null`** — persona D du plan **impossible** |
| `cycle` (cycle de force) | ⛔ **forcé à `null`** |
| `wkt` (séance en cours) | ⛔ **forcé à `null`** |

`coach.js:5971` et `:5994` écrivent `S.wkt=null; S.cycle=null;` et `S.dayState=null;` — en dur,
sans lire la fixture, contrairement aux 50 autres champs. **Trois lignes.** C'est le prérequis de
tout le reste du plan, et il est gratuit.

### C4. ⛔ TROIS DONNÉES DE LA VRAIE PERSONNE FUIENT DANS CHAQUE PERSONA

Sonde avec marqueurs reconnaissables, **contrôle positif inclus** (`sessions` doit disparaître :
il disparaît ; le persona Tatiana est bien en place) :

| Donnée | Dans le contexte du persona |
|---|---|
| `exSwaps` — les exercices qu'elle remplace **et la raison qu'elle a donnée** | ⛔ **FUITE** |
| `programmes` — ses programmes enregistrés | ⛔ **FUITE** |
| `fasting` — sa fenêtre de jeûne | ⛔ **FUITE** |
| `sessions` *(contrôle)* | ✅ nettoyé |

C'est **exactement la famille que le dépôt a déjà corrigée trois fois** (`foodLog` en ft-v1014,
`missedLog` et `nextPlanned` en ft-v1050), avec l'obligation écrite noir sur blanc : *« dès qu'une
donnée entre dans `buildCoachContext`, elle DOIT être remise à zéro ici »*.
⭐ **Et le témoin qui garde cette règle ne pouvait pas les voir** : il ne surveille que les données
entrées **depuis** sa ligne de base, et `exSwaps` est entré en ft-v888 — avant lui. *Un garde-fou
posé après coup ne voit pas ce qui est passé avant lui*, c'est écrit dans le code qui le pose.

⚠️ **Double conséquence** : un persona qui porte les remplacements d'exercices d'un vrai testeur
n'est plus un persona (**validité**), et ces données partent dans chaque appel du banc
(**confidentialité**).

---

## D — CE QUE LE PLAN DEMANDE ET QUI EXISTE DÉJÀ (à ne pas reconstruire)

| § | Proposition | État |
|---|---|---|
| §49 | Milo propose → Force Tracker valide → l'utilisateur active | **EXISTE** (`_validationSeance`, 24/08) |
| §50 | Pas de 2ᵉ appel IA à l'activation | **EXISTE** — mesuré à 0 appel |
| §48 | Détection des doublons | **EXISTE** (`out.doublons`) |
| §47 | Exercices reconnus / hors catalogue | **PARTIEL** — les noms non reconnus sont gardés **tels quels** (jamais remplacés « à peu près »), mais rien ne les **classe** catalogue / custom / inconnu |
| §51 | Mesurer le coût d'une passe | **EXISTE** — `node tests/milo/eval.js` sort un devis : 4 057 k car., ≈ 1 126 852 tokens d'entrée, **0,84 € à 3,64 €** (Sonnet), **0,28 € à 1,21 €** (Haiku) |
| §33 | Mode debug « quelles données Milo a reçues » | **EXISTE** — `tools/dump_prompt.js`, `tools/audit-prompt.js`, `tools/cache-coupure.js` |
| §35/§37 | Taille et découpage du contexte | **EXISTE** — `tools/cache-coupure.js` mesure les coupures de cache, avec une métrique (« empreintes 9/16 → 5/16 ») |
| §67 | Milo demande l'info manquante au lieu d'inventer | **EXISTE** — EV-045 |
| §31 | Ne pas construire un 2ᵉ coach pour noter Milo | **DÉJÀ ÉCRIT** — c'est R6 et le §8 de `ARCHITECTURE-CERVEAU-CERVELET` |
| §73 | Le prompt en dernier | **DÉJÀ ÉCRIT** — c'est **R7**, mot pour mot |
| §75 | Ne pas confondre présence et obéissance | **DÉJÀ ÉCRIT** — même document, même §8 |

⚠️ **Un point mérite d'être nommé, parce que je l'ai pris pour un défaut avant de vérifier** : le
bloc marqué *« commun à tous, caché 1 h »* **n'est pas identique d'une personne à l'autre** — 43 473
vs 45 235 caractères, la différence étant les **règles du Gardien**, qui dépendent des blessures.
Ce n'est **pas un oubli** : c'est un arbitrage daté du 18/08, écrit dans le code — la règle de
sécurité reste en tête avec priorité absolue (**R11**), même si elle coûte du cache. Seule
l'observation du jour a été descendue, avec la mesure à l'appui (46 741 caractères refacturés).

---

## E — CE QU'IL FAUT ÉCARTER (3 points)

1. **§29 — la grille de 12 critères notés sur 5.** Un score chiffré sans méthode qui le calcule
   est une fausse précision : c'est **R32** (*« on ne fabrique pas un score de fiabilité chiffré
   sans méthode validée »*) et **R29**. Des **états nommés** — *respecté · partiellement · ignoré ·
   non concluant* — disent la même chose sans inventer une décimale.

2. **§55 — les six sous-domaines** (`SESSION_BUILDER_BASE`, `_INJURY`, `_RECOVERY`, `_HISTORY`,
   `_STRENGTH`, `_PROGRESSION`). Un seul marqueur suffit tant qu'on n'a pas mesuré qu'on lance des
   sous-ensembles différents. Six catégories pour 20 scénarios, c'est de la complexité payée pour
   un gain qui n'existe pas encore (**R19**).

3. **§32 — demander à Milo de justifier ses choix.** Le plan le dit lui-même (*« un modèle peut
   rationaliser après coup »*) — et ça double le coût de chaque scénario. À garder comme outil
   ponctuel de diagnostic, **jamais** comme critère.

---

## F — LE RISQUE QUE LE PLAN CRÉE LUI-MÊME

Le plan le nomme à moitié en §75. Il faut le dire en entier :

> **Un banc « Session Builder » entièrement vert prouverait seulement que la CHAÎNE fonctionne.**

Or la chaîne fonctionne déjà — mesurée ici : 0 appel superflu, validation en place, séance
lançable. **Tout ce qu'on peut vérifier gratuitement est déjà vert.** Le vert supplémentaire qu'on
gagnerait à construire le chantier du plan ne dirait rien de la question posée, et donnerait le
sentiment d'y avoir répondu.

⚠️ **Et un second risque, plus concret** : le dernier rapport du banc payant porte
`"mode": "blanc"`. **Le Tier 2 n'a jamais tourné pour de vrai.** Les 0,84 €–3,64 € sont un devis
calculé sur des tailles de contexte réelles, pas une facture. Aucun verdict de qualité n'existe
aujourd'hui, sur aucun scénario. *Construire vingt scénarios de plus avant d'avoir lancé les 55
qui existent reviendrait à agrandir un banc qu'on n'a jamais utilisé.*

---

## G — LE PROTOCOLE MINIMAL (question 78)

**Étape 0 — gratuite, 3 lignes, prérequis de tout le reste.**
`_vcApplyPersona` doit lire `dayState`, `cycle` et `wkt` depuis la fixture au lieu de les forcer à
`null`, et remettre à zéro `exSwaps`, `programmes` et `fasting`. Sans ça, les personas D, H et le
cycle sont impossibles, et trois données réelles polluent chaque appel.
*Coût : 0 €. Bénéfice : le banc redevient valide.*

**Étape 1 — gratuite. Le contrôle qui manque.**
Deux fixtures du **même** sportif — l'une nue, l'autre avec 24 séances, 3 records, un sommeil
court et une blessure active — et une seule vérification : **le contexte diffère-t-il d'au moins
5 000 caractères, et les valeurs attendues sont-elles dans le bloc propre à la personne ?**
C'est fait dans ce document ; il reste à l'épingler comme témoin permanent.

**Étape 2 — la plus petite expérience payante réellement discriminante (question 15 et 20).**

| | |
|---|---|
| Scénarios | **1 sportif, 2 conditions** (nu / mémoire complète), même question |
| Appels | **2** — plus 2 de répétition pour distinguer le hasard du signal, soit **4** |
| Coût estimé | **0,03 € à 0,07 €** sur Sonnet (extrapolé du devis mesuré : 3,64 € pour 55) |
| Mesure | l'ensemble d'exercices, le nombre de séries, la plage de répétitions et les **charges prescrites** diffèrent-ils ? |
| Critère de poursuite | **si les charges prescrites sont les mêmes des deux côtés alors qu'un record de 110 kg n'est présent que d'un côté, on s'arrête et on cherche pourquoi** (§73 : données → canal → contradiction → et le prompt en dernier) |

⭐ **Cette expérience-là ne demande aucun chantier.** Elle demande les 3 lignes de l'étape 0, deux
fixtures, et quatre appels. *C'est la seule mesure du plan qui puisse changer une décision produit
— toutes les autres décrivent une chaîne qui marche déjà.*

**Étape 3 — seulement si l'étape 2 montre une vraie différence.** Alors on étend aux 5 personas
du §72, on lance enfin la passe complète des 55, et on parle de découvrabilité (§42).

---

## H — LE MEILLEUR DU PLAN, ET IL N'EST PAS TECHNIQUE

Deux apports sont réellement neufs et méritent d'être gardés tels quels :

**§62 — comparer la séance PROPOSÉE à la séance RÉELLEMENT FAITE.** C'est la meilleure idée du
document, et ⭐ **la donnée existe déjà** : chaque exercice prescrit par Milo porte `_milo:true`,
et il suit la séance jusque dans l'historique. On peut donc mesurer, **sans rien ajouter à
l'application et sans un centime**, ce que Michel supprime, remplace ou recharge après coup.
*Plus il corrige, plus on sait où le Session Builder est faible.* **Classé : donnée EXISTE,
mesure ABSENTE — et c'est le meilleur rapport valeur/coût de tout le plan.**

**§64 — ne pas faire de Michel le seul étalon.** Juste, et déjà vrai : 46 des 53 fixtures du banc
portent son profil, 35 sur 53 sont `confirmé`, 43 sur 53 en objectif `muscle`. **Trois scénarios
seulement sont débutants.** Le banc a la forme d'un seul sportif.

---

## RÉPONSES AUX 20 QUESTIONS

1. **Comment Milo crée une séance ?** Il l'écrit en français ; l'app la convertit — bloc caché,
   puis cervelet au tap, puis lecture déterministe du texte.
2. **Quelles fonctions ?** `_extractDaySession`, `_cerveletSeance`, `_seanceDepuisTexte`,
   `_montee`, `_appendSeanceQuestion`, `_construireSeanceAuTap`, `_startSessionFromMilo` /
   `_applyMiloSession`, `_appliqueMiloSession`, `_validationSeance`.
3. **Quel payload ?** 6 canaux ; contexte 71 561 → 78 787 car. selon la richesse du profil.
4. **Quelles données arrivent ?** Records, historique daté, sommeil, blessures, exercices écartés,
   observations validées, mémoire — toutes vérifiées présentes.
5. **Ce que Force Tracker a et ne transmet pas ?** Le **côté** d'une blessure durable (section B).
6. **Quels tests couvrent le Session Builder ?** 20 des 55 scénarios payants ; 20 à 24 témoins par
   fonction dans le banc gratuit.
7. **Les personas existent-ils ?** Oui pour le débutant, la blessure, le temps limité, l'exercice
   imposé. **Non** pour la fatigue, le cycle et la séance en cours — impossibles à écrire (C3).
8. **Comparer deux séances sans 2ᵉ coach ?** Oui : ensemble d'exercices, nombre de séries, plage de
   répétitions, charges. Ce sont des comparaisons, pas des jugements.
9. **Réponse Milo → vraie séance ?** Mesuré : 3 exercices lus, noms préservés, montée en charge
   ajoutée par le code, `_milo:true` posé, séance lançable.
10. **Risques de perte ?** Traités : si le texte visible contient strictement plus d'exercices que
    le bloc caché et les contient tous, l'app suit le texte.
11. **Le Gardien revalide ?** Oui, au point unique, avant activation, 4 familles.
12. **Un 2ᵉ appel IA à l'activation ?** **Non — 0 appel, mesuré.**
13. **Gratuit ?** Payload, canaux, Gardien, structure produite, doublons, coût réseau, catalogue.
14. **Payant ?** Uniquement : Milo **exploite-t-il** ce qu'il reçoit.
15. **Plus petit test API discriminant ?** L'A/B à 4 appels de la section G.
16. **A/B propre ?** Oui — même fonction, deux fixtures ; Δ mesuré +5 464 car.
17. **Coût réel ?** Le devis existe et est chiffré ; **la passe réelle n'a jamais été lancée**.
18. **Proposé vs réalisé sans alourdir l'app ?** Oui — `_milo:true` est déjà dans les données.
19. **Trous déjà couverts ?** Section D — douze propositions.
20. **Première expérience discriminante ?** Étape 2, après les 3 lignes de l'étape 0.

---

## CE QU'IL FAUT DIRE À GPT

Son plan est sérieux et sa question est la bonne. Mais **il décrit un chantier de construction là
où il faut un chantier de mesure** : la chaîne technique qu'il veut bâtir tourne déjà, et tout ce
qui pouvait être vérifié gratuitement est vert.

Le vrai obstacle est ailleurs, et il est petit : **le banc d'essai n'a pas de mémoire**. Trois
lignes le débloquent, quatre appels API répondent à sa question centrale, et **rien de tout cela
ne demande une nouvelle couche**.

⭐ Et son meilleur apport n'est pas dans les 80 sections d'architecture : c'est son §62 —
*comparer la séance proposée à la séance réellement faite*. La donnée est déjà là.

*Contre-audit produit le 02/09/2026 sur `ft-v1102`. Aucune ligne de l'application n'a été
modifiée. Aucun test n'a été écrit. Aucun appel API n'a été passé.*
