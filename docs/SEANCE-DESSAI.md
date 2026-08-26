# 🎟️ La séance d'essai — le parcours de découverte, et là où Milo entre en jeu

> **Créé le 25/08/2026**, à partir d'une conversation de cadrage avec Michel. **Rien n'est
> construit** à ce jour : ce document fixe les décisions **avant** de coder, pour qu'on ne les
> re-discute pas dans trois semaines et qu'on ne les découvre pas chez un utilisateur.
>
> ⚠️ **Ce n'est pas une spécification technique.** Il dit *pourquoi* et *dans quel ordre*.
> Le *comment* suivra `docs/PROCESSUS-DEVELOPPEMENT.md`, une brique à la fois.

---

## 1. La métaphore fondatrice — et ce qu'elle tranche

Michel : *« comme dans une salle de sport, on te propose une séance gratuite, bah le même
principe »*.

⭐⭐ **Cette phrase règle le problème le plus difficile du sujet : le dosage du gratuit.**

Une séance d'essai en salle **n'est pas une version bridée**. Elle est complète, encadrée,
soignée — c'est la vitrine. Personne ne te fait faire une demi-séance pour te donner envie de
payer. **On n'a donc pas besoin d'appauvrir l'exemple**, et la raison n'est pas commerciale,
elle est dans le produit :

| | Gratuit | Milo premium |
|---|---|---|
| Ce qu'on donne | **une séance, entière et propre** | l'adaptation **dans la durée** |
| Ce que ça dit | « voilà à quoi ça ressemble » | « je me souviens de toi » |

👉 ***Un exemple parfait ne cannibalise pas Milo, parce qu'un exemple ne se souvient de rien.***
C'est la promesse du produit (`docs/VISION-FORCE-TRACKER.md` : *« le sportif ne repart jamais de
zéro »*) retournée en argument de vente : **la 2ᵉ séance vend mieux que la 1ʳᵉ.**

---

## 2. Le parcours, en cinq temps

Décrit par Michel, dans cet ordre :

1. ~~**Des types de séances**~~ — ✅ **LIVRÉ en ft-v1026.** Les 5 de `DISC_LABELS` remplissent
   l'écran Séance vide ; la carte porte la ligne chiffrée du cadre, le tap crée la séance, le
   « ⓘ » ouvre le cadre complet. ⛔ Le vrai travail était **R4** : `coeur` était de la prose que
   nul code ne pouvait lire — `DISC_SEANCE` est la descente manquante.
2. **De bons conseils d'échauffement.**
3. **Un questionnaire de 2-3 questions ciblées, SANS IA** — p. ex. *« tu préfères les pecs, les
   jambes, le dos ? »*.
4. **On annonce le débrief AVANT** : « à la fin de ta séance, tu auras un débrief et Milo pourra
   donner son avis ».
5. **À la fin, Milo entre en jeu** — son avis, ses recommandations. **Puis** la proposition
   premium, *« mais pas obligatoire bien sûr »*.

⭐ **Le point le plus malin est le n°4** : annoncer le débrief donne une raison d'aller au bout,
et Milo arrive au moment où il a de **vraies données** à commenter — pas sur un écran vide.

---

## 3. ⛔⛔ Milo juge LA SÉANCE, pas la personne

**L'objection soulevée pendant le cadrage** : à ce moment-là Milo ne connaît pas la personne —
ni historique, ni records, ni ressenti. Or « je me souviens de toi » est *tout* son argument.
Le faire commenter comme s'il savait serait exactement ce que la Constitution interdit
(*ne jamais faire semblant de savoir*).

**La réponse de Michel tranche le sujet** : *« il donne son avis SUR LA SÉANCE. Pas sur la
personne. »*

Une séance **se juge objectivement** : équilibre poussée/tirage/jambes, volume, intensité au
regard du cadre de la discipline, cohérence de l'échauffement, doublons. Rien de tout ça ne
demande de savoir qui l'a faite.

**Et l'étape suivante est la vraie trouvaille** — Milo propose *lui-même* d'en savoir plus :

> *« Si tu veux un conseil personnalisé, veux-tu que j'en apprenne un peu sur toi ? »*
> **Ça ne coûte rien** : quelques questions ciblées, les plus importantes.

👉 ***Le manque devient l'accroche au lieu d'être caché.*** C'est honnête **et** commercialement
plus fort que de simuler une connaissance qu'on n'a pas.

---

## 4. ⭐⭐ Le débrief ne dépend JAMAIS du réseau — et c'est la même solution que l'économie d'API

Michel pose **deux exigences** qui semblent séparées :

- *« Pas de réseau, il faut absolument que la personne puisse avoir un débrief. »*
- *« Plus on code, moins on consomme d'API, mais Milo doit arriver au bon moment pour
  impressionner et donner des valeurs fiables, un ton, une personnalité. »*

**Ce sont les deux faces d'une seule décision**, et elle porte déjà un nom dans le projet :
`docs/ARCHITECTURE-CERVEAU-CERVELET.md`, dont le critère tient en une phrase —
***« est-ce que ça a besoin de savoir QUI est la personne ? »*** Non → le code. Oui → Milo.

### Ce que le code sait déjà calculer, hors ligne et gratuitement

Mesuré dans le dépôt au 25/08 — **rien de tout ça n'est à construire** :

| Ce que le code sait | D'où |
|---|---|
| muscles travaillés et dominants | `_mscScores` · `_mscFocus` |
| région de la séance (haut / bas / full) | `_calSessRegion` |
| calories | `getExerciseMET` |
| volume, séries, durée | déjà stockés |
| charge trop lourde pour le niveau | `_intensiteDefauts` |
| **montée d'échauffement mal construite** | `_monteeDefauts` |
| doublons, exclusions, blessures | `_validationSeance` |
| cadre chiffré de la discipline (reps, charge, repos, volume, échec) | `DISC_CADRE` |

### La règle qui en découle

> ⛔ **Le débrief CHIFFRÉ est calculé en local, toujours. Milo n'ajoute pas les faits — il
> ajoute le JUGEMENT, le TON et la RECOMMANDATION.**

Ce qui donne un mode dégradé **honnête** plutôt que mutilé :

- **Avec réseau** : les chiffres **+** *« belle séance, mais ton échauffement était trop court
  sur le développé… »*
- **Sans réseau** : les chiffres, **complets**, **+** *« l'avis de Milo arrive dès que tu as du
  réseau »*

Personne n'est bloqué (**règle d'or #3**), personne n'est trompé, et la promesse du point 2.4
tient. ⭐ *Et le bénéfice API n'est pas un effet de bord : c'est la même ligne de code.*

---

## 5. Ce qui existe déjà — à REBRANCHER, pas à construire

⚠️ **Mesuré dans le code le 25/08.** Le chantier est beaucoup plus petit qu'il n'en a l'air.

| Ce que décrit le parcours | Ce qui existe | État |
|---|---|---|
| types de séances (force, bodybuilding, powerbuilding…) | **`DISC_LABELS`** (5 disciplines) | ✅ existe |
| le cadre chiffré de chaque type | **`DISC_CADRE`** — reps, charge, repos, volume, échec, ce qu'il faut éviter | ✅ existe |
| questionnaire 2-3 questions **sans IA** | **`openBeginnerSetup`** — 2 questions déterministes (2 ou 3 séances/sem · full body ou split) + génération des séances | ⚠️ existe, **enfermé** derrière « 🌱 Créer mon parcours débutant » et bloqué si déjà fait |
| débrief de fin de séance par Milo | **existe** (ft-v979), avec continuité d'une séance à l'autre | ⚠️ existe, **pas en mode hors ligne** |
| éditeur de programme | **`editProg` / `_renderProgEdit`** | ⚠️ existe, **sans porte d'entrée** (accessible seulement par le ✏️ d'un programme déjà créé) |
| conseils d'échauffement | `_monteeDefauts` détecte les défauts | 🕳️ **le seul vrai trou** : rien qui *conseille* |

### ⛔⛔ Le piège à ne pas commettre

**Ne pas créer une deuxième liste de « types de séances » à côté de `DISC_CADRE`.** Elles
divergeraient (**R2**), et Milo lirait l'une pendant que l'écran afficherait l'autre. Le
vocabulaire existe : on s'en sert.

---

## 6. Les garde-fous — ce que ce parcours n'a PAS le droit de faire

- ⛔ **Jamais en travers d'une séance en cours.** Quelqu'un qui ouvre l'app à 19 h dans une salle
  vient s'entraîner, pas voir une offre (**règle d'or #4** : ouverture instantanée).
  👉 L'exemple se propose **là où il sert** — écran vide, création de programme.
- ⛔ **Informer sans bloquer** (**R24**) : la proposition premium **propose**, elle n'emprisonne
  pas. Michel l'a posé lui-même : *« mais pas obligatoire bien sûr »*.
- ⛔ **Ne jamais faire semblant de savoir** (Constitution) : cf. §3 — Milo dit qu'il découvre.
- ⛔ **Le débrief chiffré ne peut pas être payant ni conditionné au réseau** (§4).

---

## 7. Ce qui reste à trancher

### 7.1 — Les exemples : pour toujours, ou un vrai essai limité ?

- **(a)** ils restent disponibles → socle gratuit honnête, Milo vend l'adaptation par-dessus
- **(b)** essai limité, puis il faut Milo

**Avis de Claude : (a).** Le (b) heurte la **règle d'or #4** (quelqu'un qui a « épuisé son
essai » trouve un mur au lieu de son app à 19 h) et la Constitution (*adapter, jamais
interdire*). En (a) on ne perd rien : celui qui ne paiera jamais garde une app utile, celui qui
veut mieux voit très vite ce qui lui manque. ⏭️ **Décision de Michel, non prise à ce jour.**

### 7.2 — ⚠️⚠️ Optionnel vs ABSOLUMENT NÉCESSAIRE : ce que Milo doit savoir

Michel : *« c'est là où on doit être très intelligent. Ce qui est optionnel pour Milo et ce qui
est absolument nécessaire pour qu'il soit performant dans ce qu'il fait le mieux. »*

**C'est le point le plus intéressant du chantier, et le seul qu'on ne peut pas trancher
aujourd'hui.** On peut lister ce que Milo reçoit et ce que chaque champ *prétend* servir — mais
**savoir lesquels le rendent réellement meilleur se MESURE**, avec le banc d'essai (50
scénarios) et un avant/après (**R34**).

⛔ **Or le banc d'essai n'a jamais tourné** : il demande une vraie clé API, indisponible dans
l'environnement d'analyse. 👉 **Tant qu'il n'a pas tourné, tout tri « nécessaire / optionnel »
est une hypothèse, pas un résultat** — et décider au feeling ce qui est indispensable est
exactement l'erreur que le projet a déjà payée plusieurs fois (**R7**, **R9**).

### 7.3 — Le coût du débrief

Le débrief Milo est **le seul poste du parcours qui dépense de l'argent réel** : un appel API par
séance d'essai, pour des gens qui ne paient pas. C'est le bon investissement — c'est là que Milo
impressionne — mais c'est aussi le seul à surveiller si ça décolle.
👉 L'instrumentation existe depuis **ft-v990** : la regarder **dès la première brique**, pas
après la facture.

---

## 8. L'ordre proposé (du plus rentable au moins urgent)

Aucune de ces briques n'est commencée. Elles se livrent **une par une**, testées — c'est l'écran
le plus sensible de l'app (**règle d'or #9** : le bouton central ne bouge pas).

1. **Le sélecteur d'exercices reste ouvert.** Aujourd'hui `addExercise()` appelle
   `closeExPicker()` à chaque ajout : 6 exercices = 6 allers-retours. Petit changement, gros
   gain — c'est le goulot que Michel a senti en premier.
2. **Une porte « Créer un programme »** (l'éditeur existe déjà) + renommer **« + Ajouter »** en
   **« Créer ma séance »**. ⚠️ L'incohérence est déjà là : l'écran vide dit *« Appuie sur
   + Ajouter un exercice »* alors que le bouton s'appelle « + Ajouter ».
3. ~~**Le débrief chiffré en local** (§4)~~ — ✅ **LIVRÉ en ft-v1022.** Les faits sont calculés
   en local **toujours** (muscles, région et %, durée cardio comprise, calories, défauts
   d'échauffement et de charge, cadre de la discipline) ; Milo **ajoute** son avis par-dessus au
   lieu de le remplacer. ⚠️ **Une correction au cadrage de ce doc** : `_validationSeance` y était
   listée comme utilisable — elle ne l'est pas, elle est écrite pour ce que Milo **propose**
   (**R14**). Détail : journal ft-v1022.
4. ~~**Sortir le générateur de séances du cadre « débutant »** (§5)~~ — ✅ **LIVRÉ en ft-v1023.**
   ⚠️ **Correction au cadrage de ce doc** : il disait le générateur *« enfermé derrière le bouton
   Créer mon parcours débutant »* — **le bouton était déjà visible pour tout le monde**. Le vrai
   verrou était ailleurs (vocabulaire · contenu 100 % machines · blocage one-shot ·
   `beginnerJourney` posé même pour un confirmé). La **3ᵉ question** demandée au §2.3 existe
   désormais : *« avec quoi tu t'entraînes ? »*, déterministe, sans IA.
5. ~~**Ranger** « Scanner ton programme » et « Importer un journal »~~ — ✅ **LIVRÉ en ft-v1024.**
   Mesuré : **200 px pleine largeur** contre ~110 px sur une demi-rangée pour l'action
   principale → **200 px → 35 px**. ⛔ Rangés, **pas supprimés** (R30), et le rangement **suit
   l'usage** : un vrai nouveau (0 programme ET 0 séance) les voit dépliés.

**✅ LES 5 BRIQUES SONT LIVRÉES** (ft-v1009 · 1012 · 1022 · 1023 · 1024).
⏭️ **Et ce qui reste est la plainte d'origine de Michel** : *« quand on arrive c'est vide »*.
L'écran Séance porte encore **~700 px de vide** sous les actions — ranger les imports l'a
mécaniquement agrandi. Ce qui doit le remplir est le **§2.1** : proposer des **types de
séances**. *Le chantier de rangement est fini ; le parcours de découverte commence.*

---

## 🔗 Où va le reste

| Sujet | Document |
|---|---|
| Pourquoi le produit existe | `docs/VISION-FORCE-TRACKER.md` |
| Qui fait quoi entre le code et Milo | `docs/ARCHITECTURE-CERVEAU-CERVELET.md` |
| Comportement de Milo envers la personne | `CONSTITUTION-MILO.md` |
| Comment on construit | `docs/REGLES-ARCHITECTURE.md` |
| La méthode d'une brique | `docs/PROCESSUS-DEVELOPPEMENT.md` |

---

*À compléter quand une décision de §7 est prise — en écrivant **la raison**, pas seulement le
choix (R30).*
