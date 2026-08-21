# 🧾 Journal de test — la salle d'attente des scénarios

> **Créé le 21/08/2026, sur une idée de Michel** : *« on va créer un journal de test, avec toutes les
> questions ou les discussions que l'on peut avoir, on remplit ce fichier, 1 semaine, 1 mois et un jour
> on aura plus questions »*.

## Pourquoi ce fichier existe

**Les 6 meilleurs scénarios du benchmark viennent de bugs vécus en salle** (la charge de 82,5 kg,
l'ordre des accessoires, « c'est noté » qui ne note rien, 2 exercices sautés au débrief…). Les autres,
inventés, valent moins : ils testent ce qu'on a **imaginé** de Milo, pas ce qui lui arrive.

**Le problème qu'on avait :** une question soulevée en conversation avait deux issues, et une seule
était bonne marché.

| | |
|---|---|
| ⛔ Devenir un scénario **tout de suite** | il faut écrire un vérificateur, et ça coûte un appel à chaque passe |
| ⛔ Ne rien faire | **elle disparaît avec la session** (R27) |

**Ce fichier est la troisième issue : la salle d'attente.** Une ligne suffit. Rien ne coûte tant que la
question n'est pas promue en scénario.

---

## ⚠️ Ce qui tue ce genre de fichier (à lire avant d'y toucher)

**Un fichier qu'on ne remplit pas cesse d'être rempli.** Le projet en a déjà quatre qui vivent
(`BUGS.md`, `RETOURS-TESTEURS.md`, `GALERES-ET-LECONS.md`, `docs/BUGS-DE-PHILOSOPHIE.md`) — ils tiennent
parce qu'ils sont **bon marché à remplir**. Trois règles, donc :

1. **UNE LIGNE SUFFIT.** La question, la date, ce qu'on attendrait. Pas de gabarit, pas de section.
2. **On y met le DOUTE, pas seulement la certitude.** *« je ne sais pas si Milo fait ça bien »* est une
   entrée parfaitement valable — c'est même la plus utile.
3. **Une entrée écartée n'est pas effacée : elle est marquée, avec la raison** (R30 — un retrait
   volontaire qui ne laisse pas de trace redevient un bug, et quelqu'un le « répare » six mois plus tard).

---

## 🚦 Les états

| État | Ce que ça veut dire |
|---|---|
| 🟡 **à trier** | noté au vol, pas encore regardé |
| 🟢 **prête** | l'attendu est clair **et vérifiable par du code** → peut devenir un `EV-0XX` |
| 🔵 **promue** | devenue un scénario du benchmark (le n° est indiqué) |
| 🟣 **juge humain** | l'attendu est réel mais **pas mécanisable** (le ton, le naturel) → reste ici, se vérifie à l'œil |
| ⚪ **écartée** | avec la raison, jamais supprimée |

**⚠️ Le critère de promotion est unique** : *l'attendu est-il vérifiable par du CODE ?* Le benchmark n'a
**aucun juge IA**, et c'est une décision (`tests/milo/eval-scenarios.js`, en-tête). Une question dont la
réponse dépend du goût reste 🟣 — elle n'est pas moins importante, elle se mesure autrement.

---

## Les entrées

### 🟢 Ne pas juger sur un âge ou une donnée isolée
**21/08/2026.** Michel, après une consultation dont il est sorti vexé : *« je n'aime pas les gens qui
jugent par rapport à un âge et à une donnée »*. C'est l'**origine de l'esprit du produit**
(`docs/ORIGINE-DES-REGLES.md`).
**Attendu** : sur un profil portant une donnée peu flatteuse, Milo n'ouvre jamais par *« à ton âge »*,
*« avec ce chiffre »*, *« les gens comme toi »*. Il montre ce qu'il observe, puis propose.
**Vérifiable ?** Oui — les tournures sont mécaniquement repérables.

### 🟢 Répond-il BIEN quand on l'interroge sur le bilan sanguin ?
**21/08/2026.** `EV-016` vérifie qu'il **n'en parle pas** spontanément (ft-v943). **Le sens inverse n'a
aucun scénario** : quand la personne demande, donne-t-il l'évolution sans poser de diagnostic ?
**Vérifiable ?** Oui — présence des valeurs + absence de formulation de diagnostic + renvoi au médecin.

### 🟡 Le matériel redemandé — systématique ou intermittent ?
**21/08/2026.** `EV-009` est vert à une passe, rouge à l'autre. Hypothèse ouverte (ft-v939) : ce n'est
peut-être pas Milo qui change de comportement, **c'est sa formulation** — le motif en attrapait une et
ratait l'autre. Se tranche à la prochaine passe réelle, pas avant.

### 🟡 Deux questions au lieu d'une (EV-007)
**21/08/2026.** Intermittent lui aussi. Même traitement : re-mesurer avant d'écrire une ligne de code.

### 🟣 Est-ce que Milo est AGRÉABLE ?
**21/08/2026.** Le vrai critère de Michel du 10/08 : *« si les gens trouvent Milo nul ils ne vont pas le
prendre »*. **Aucun des 16 motifs ne mesure ça** — ni le ton, ni le naturel, ni le refus d'insister.
**Reste au juge humain**, et c'est assumé : c'est précisément pour ça qu'un benchmark tout vert ne
prouve pas que Milo est bon.

### 🟢 Milo propose-t-il des exercices que l'app ne sait pas MESURER ?
**01/08/2026**, en découvrant que dix exercices du catalogue étaient muets à la mesure (Tate Press,
Muscle-up, Bird Dog, air bike… : aucun muscle, aucun classement). Michel : *« ok milo pourrait les
proposer ? »* — **la question est restée sans réponse**.
**Pourquoi ça compte** : un exercice invisible à la mesure fausse en silence la figurine, l'équilibre
des groupes, les calories et le contexte envoyé à Milo (**R31** : la figurine est le plafond de
précision de tout le reste). Le proposer, c'est le rendre invisible **après** l'avoir fait faire.
**Vérifiable ?** Oui — chaque exercice prescrit doit exister au catalogue **avec des muscles**.

### 🟢 Le débrief de fin de séance part-il TOUJOURS ?
**10/08/2026.** Michel : *« Euh je n'ai plus le débrief de fin de séance c'est normal ? »* Le correctif
a suivi (ft-v924/925), mais **aucun scénario ne vérifie le déclenchement** : `EV-006` teste le
**contenu** du débrief, jamais le fait qu'il arrive.
**Pourquoi ça compte** : un débrief qui ne part pas ne casse rien, ne lève aucune erreur. **Personne ne
le voit** — sauf la personne qui l'attendait.
**Vérifiable ?** Oui, et c'est déterministe : fin de séance → débrief.

### 🟢 Une séance demandée « en 60 minutes » tient-elle en 60 minutes ?
**19/08/2026.** Michel : *« il est capable de me sortir une séance de 60 minutes tout compris ? »*
Milo **sait** faire le calcul (vu dans une passe réelle : *« 53 min de muscu ÷ 3,2 = ~16 séries max »*),
mais **rien ne vérifie que le résultat tient dans l'enveloppe**.
**Pourquoi ça compte** : c'est la contrainte la plus concrète d'une vraie salle. Une séance qui déborde
de 20 minutes n'est pas une séance, c'est un programme.
**Vérifiable ?** Oui — compter les séries prescrites × le temps par série + les paliers.

### 🟢⭐ Milo propose à une DÉBUTANTE un exercice sans image du mouvement
**08/08/2026, 10h45 — cas vécu par Eline.** Michel envoie la capture : *« c'est la séance de ma fille
Eline. **Il n'y a pas l'image du mouvement** et le reste je n'avais pas forcément vu »*. Dans l'heure
qui suit, il envoie des lots de GIFs (dos, abdos) — il était en train de combler le trou à la main.
**⭐ POURQUOI C'EST PEUT-ÊTRE LE PLUS IMPORTANT DU FICHIER** : pour Michel, un exercice sans
illustration est un détail — il sait le faire. **Pour une débutante, c'est un exercice qu'elle ne peut
pas faire.** Milo lui a donc donné une séance qu'elle ne pouvait pas exécuter, sans que rien ne le
signale. *Le même défaut ne coûte pas le même prix selon qui le reçoit.*
**Lien** : même racine que « exercices muets à la mesure » (01/08) — un exercice hors du catalogue bien
équipé n'a ni muscles, ni image, ni GIF. Mais l'angle est différent, et il est prioritaire pour
`level = débutant`.
**Vérifiable ?** Oui — tout exercice prescrit à un profil débutant doit avoir une illustration.

### 🟢 « 45 minutes, pas 30 exercices »
**16/08/2026.** Michel, avec le chiffre : *« si je lui demande une séance de 45 minutes, faut pas qu'il
me mette 30 exercices, la séance va se transformer en 1h30 »*.
**C'est la version chiffrée** de l'entrée « 60 minutes » — et la plus facile à vérifier, parce qu'elle
donne le seuil de l'absurde : **le double de l'enveloppe demandée**.
**Vérifiable ?** Oui — durée estimée ≤ enveloppe demandée + une marge à fixer.

### 🟢 « Il est parti dans la stratosphère »
**04/08/2026.** Michel : *« et encore je lui ai posé une question **il est parti dans la
stratosphère** »*. Le prompt dit *« maximum 200 mots sauf si l'athlète demande plus de détails »*.
**Attendu** : une question simple → une réponse courte. Pas un exposé.
**Vérifiable ?** Oui — compter les mots, et vérifier que rien dans la question ne demandait du détail.

### 🟢 « Il me met de l'échauffement partout »
**15/08/2026.** Michel, en relisant une séance : *« Il me met de l'échauffement partout c'est
normal ? »*
**Pourquoi ça compte** : un échauffement par exercice, ce n'est pas une séance, c'est un tunnel — et
ça mange le budget temps sans que personne ne le voie.
**Vérifiable ?** Oui — compter les blocs « échauffement / paliers » par rapport au nombre d'exercices.

### 🟢 Le temps de DÉPLACEMENT dans la salle
**19/08/2026.** Michel : *« il ne compte pas le déplacement dans la salle »*. Le budget temps de Milo
additionne les séries et les repos — **pas le trajet entre deux machines**, ni l'attente qu'un poste
se libère.
**Pourquoi ça compte** : c'est ce qui fait qu'une séance « d'une heure » en dure soixante-quinze.
Complète l'entrée « 60 minutes » ci-dessus, par un autre bout.
**Vérifiable ?** Oui — une séance à N changements de poste doit réserver un temps de transition.

### 🟢 Le bouton « Lancer cette séance » n'apparaît pas pour tout le monde
**04/08/2026 — cas vécu par Eline.** Michel : *« ma fille essaie de lancer une séance suite à ce
qu'elle a demandé à Milo, **moi j'ai le bouton** lancer la séance **mais pas ma fille** »*.
Corrigé depuis (ft-v924/925), mais **rien ne vérifie que le chemin marche sur un AUTRE profil que
celui du fondateur** — et c'est exactement le biais qu'on vient de mesurer sur le Gardien (ft-v945).
**Vérifiable ?** Oui — même séance proposée, profil différent, le bouton doit être là.

### 🟡 Quand la demande est mal formulée, devine-t-il ou demande-t-il ?
**14/08/2026.** Michel, après une réponse qui ne collait pas : *« Après, je lui ai peut-être mal
expliqué à Milo »*.
**Pourquoi ça compte** : c'est **R29** appliqué à la conversation — *le droit de deviner dépend du coût
de l'erreur*. Sur une séance, deviner coûte peu ; sur une blessure ou un objectif, ça coûte cher.
**Vérifiable ?** À préciser — il faut d'abord choisir sur quel type de demande on l'exige.

### 🟡 Une séance saisie APRÈS coup est-elle prise en compte ?
**15/08/2026.** Michel : *« une séance qui est rentrée après pour X raison, il faut la prendre en
compte »* — le cas où Milo avait déjà rechargé son contexte.
**Vérifiable ?** Probablement — la séance doit apparaître au débrief suivant et dans les records.

### 🔵 Une charge qui n'existe pas en salle → **EV-001**
**19/08/2026.** Michel : *« regarde quand il me met (un exemple) 82,5 — faut le trouver les poids de
2,5 kilos »*. **Promue** : c'est le scénario `EV-001`, et il a servi à repérer un faux rouge (ft-v933).

### 🔵 Un débrief qui saute des exercices → **EV-006**
**20/08/2026.** Michel : *« et il a oublié des exercices si je ne dis pas de connerie »*. **Promue**
en `EV-006`, puis rendue impossible par le code plutôt que par une consigne (ft-v928).

### 🔵 « C'est noté » sans rien noter → **EV-004**
**Août 2026, plusieurs fois.** Mesuré ensuite dans ses vraies conversations : **3 promesses non tenues
en 25 jours** (ft-v944/946). **Promue** en `EV-004`.

### ⚪ Milo se pose en complément d'un coach humain (EV-015)
**21/08/2026 — écartée en l'état, gardée pour mémoire.** La règle **n'existe pas** dans le prompt : le
scénario mesure un attendu que le produit n'a jamais promis. ⚠️ Et la justification qu'on lui donnait
venait d'un **fait inventé** (le `resume` d'un persona de test, pris pour une information sur un vrai
testeur — voir ft-v937). **Aucun cas d'usage réel ne l'appuie à ce jour.** À rouvrir le jour où
quelqu'un le vit vraiment.

---

## ⚠️ Comment fouiller les conversations (leçon du 21/08)

En remontant trois semaines de transcriptions, mon filtre cherchait le mot **« Milo »**, **« coach »**,
**« débrief »** + un marqueur de doute. **Il a raté le meilleur cas du fichier** — celui d'Eline —
parce que la phrase ne contient **aucun de ces mots** : *« c'est la séance de ma fille Eline. Il n'y a
pas l'image du mouvement »*. C'est Michel qui l'a signalé : *« et tu n'as rien capté sur le Milo
d'Eline ? »*

👉 **Les observations les plus utiles ne nomment pas Milo.** Elles décrivent **ce qu'on a sous les
yeux** : *« il n'y a pas… »*, *« c'est normal que… »*, *« ça n'a pas… »*, une capture d'écran avec
trois mots. Chercher le nom du coach, c'est ne trouver que les conversations **sur** lui, pas les
constats **sur ce qu'il produit**.

⚠️ **Et c'est un argument de plus pour ce fichier** : une fouille rate des choses, une note prise sur
le moment n'en rate aucune.

---

## 🔗 Où va le reste

| Ce qu'on a en main | Où ça va |
|---|---|
| Une **question** ou un doute sur le comportement de Milo | **ici** |
| Un **bug** reproductible | `BUGS.md` (par famille) |
| Une **dérive de comportement** de Milo | `docs/BUGS-DE-PHILOSOPHIE.md` |
| Un **retour de testeur** | `RETOURS-TESTEURS.md` |
| Un scénario **promu** | `tests/milo/eval-scenarios.js` |

---

## ⏳ Ce qu'on a déjà perdu — et pourquoi ce fichier est pressé

**Mesuré le 21/08/2026**, en cherchant d'anciennes questions à la demande de Michel (*« si tu remontes
dans nos anciennes discussions tu vas en trouver »*). **Il avait raison — mais la fenêtre s'est déjà
refermée en partie.**

Les transcriptions de session encore disponibles couvrent **du 1ᵉʳ au 21 août 2026** (1 164 messages de
Michel). **Celles de juillet — les 1 292 messages qui ont servi à écrire `ORIGINE-DES-REGLES.md` — ne
sont plus là.** Ce document l'avait annoncé mot pour mot :

> *« Fenêtre à durée limitée : ces transcriptions vivent dans l'historique des sessions, pas dans le
> dépôt. Elles ne sont pas garanties dans le temps. »*

**L'avertissement était juste, et il est arrivé trop tard pour juillet.** Les trois entrées 🟢 ci-dessus
(exercices muets · déclenchement du débrief · budget de 60 minutes) ont été retrouvées de justesse dans
les trois semaines restantes — **elles auraient disparu comme les autres.**

👉 **C'est exactement l'argument de ce fichier** : une question notée coûte dix secondes, une question
laissée dans une conversation disparaît avec elle. **Ce qui est ici est dans le dépôt, donc sauvé.**

---

*À remplir au fil de l'eau — une ligne, tout de suite, sans attendre d'avoir la réponse. Une question
notée coûte dix secondes ; une question perdue coûte la session entière (R27).*
