# 🏛️ Règles d'architecture — comment on CONSTRUIT Force Tracker

> **Créé le 27/07/2026** — sur une proposition de GPT (« un document qui ne contiendrait que les règles
> de conception »). Le manque était réel : ces règles existaient, mais **éparpillées** entre `CLAUDE.md`,
> `PROCESSUS-DEVELOPPEMENT.md`, `PROFIL-VIVANT.md`, `MOTEUR-RAISONNEMENT-MILO.md`, `GALERES-ET-LECONS.md`
> et le journal des versions. Ce fichier les **rassemble** — il ne les invente pas.

## ⚠️ Ne pas confondre avec la Constitution

| Document | Répond à la question |
|---|---|
| **`CONSTITUTION-MILO.md`** | *Comment Milo se comporte-t-il envers la **personne** ?* (éthique, sécurité, respect, mémoire) |
| **Ce fichier** | *Comment **construit-on** le système ?* (architecture, données, décisions techniques) |

Les deux sont nécessaires et ne se remplacent pas. En cas de conflit, **la Constitution l'emporte** —
la personne passe avant l'élégance technique.

## 📖 Comment lire ce fichier

Chaque règle est née d'un **événement réel** (un bug, une décision, une galère) — la colonne *origine*
le rappelle. Ce n'est pas une liste de bonnes pratiques génériques : c'est ce que **ce** projet a appris,
souvent à ses dépens. *« Un bug n'est pas un échec, c'est une règle qui manquait »* (Michel).

---

## 1. Les données

### R1 — Le profil vivant est la SOURCE DE VÉRITÉ unique
Tous les moteurs (Milo, nutrition, récupération, programmes, analyses) s'appuient sur **le même**
profil. Aucun module ne maintient sa propre copie d'une information.
*Origine : GPT + Michel, 27/07/2026 · détail : `docs/PROFIL-VIVANT.md`*

### R2 — Ne jamais dupliquer une information
Corollaire direct de R1. Si deux endroits stockent la même chose, ils **divergeront** — la seule
question est quand. Une information a **un** propriétaire.
*Origine : R1 · appliqué p. ex. en réutilisant `COACH_QUIZ` pour l'inscription (ft-v604) au lieu de
recréer des champs.*

### R3 — Toute connaissance doit produire un COMPORTEMENT OBSERVABLE
Avant d'ajouter une information au profil, répondre aux **3 questions** : ① qui la **produit** ·
② qui l'**exploite** · ③ quel comportement **concret** change ? Aucune réponse → on n'ajoute pas.
**⚠️ Nuance indispensable** : le comportement peut être **DIFFÉRÉ**, mais il doit être **NOMMABLE**.
*« Ça servira à telle brique dans quelques mois » = valide ; « on verra bien » = non.* Sans cette
nuance, la règle tuerait la **mémoire longue**, qui est l'ADN du produit (une pesée isolée ne dit rien,
c'est la tendance qui parle ; le journal d'état du jour a été bâti pour servir des mois plus tard).
*Origine : GPT, 27/07/2026, après les 4 bugs Milo→Séance · nuance : Claude*

### R4 — L'information doit descendre jusqu'à la DONNÉE, jamais rester dans le TEXTE
**La famille de bugs la plus coûteuse du projet.** Milo raisonne parfaitement dans la conversation
(charges, repos, ordre des exercices, consignes techniques) — mais si cette intelligence n'atteint pas
la structure de données que l'app utilise, **elle n'existe pas**. Le maillon faible n'est ni la
collecte ni le raisonnement : c'est la **RESTITUTION**.
*Origine : ft-v625 (charges écrasées) · ft-v626 (repos) · ft-v627 (ordre) · ft-v628 (consignes)*

### R4a — GARDE-FOU : toute donnée doit être CLASSÉE face à Milo *(28/07/2026)*
R4 était une intention ; elle se répétait quand même — **cinq fois** (charges ft-v625, repos ft-v626,
ordre ft-v627, consignes ft-v628, prénom ft-v652). La cause n'est pas la négligence, c'est que
**l'oubli est SILENCIEUX** : ajouter une donnée sans la transmettre ne plante pas, ne lève aucune
erreur, ne casse aucun test. Milo répond juste un peu moins bien, et personne ne peut le voir.
**Le garde-fou** (`tests/donnees/runner.js`) lit toutes les données chargées par `load()` et exige
que chacune soit classée : **transmise** · **exclue avec la raison écrite** · **manquante** (trou
connu). Une donnée non classée **fait échouer la livraison**.
*On ne peut plus oublier — on peut seulement décider.* Et une exclusion sans raison est refusée :
une exclusion dont on a oublié le motif finit toujours par être contournée (R27).
**État au 02/08 (après ft-v713)** : 50 transmises · 39 exclues · **2 trous connus** (`programmes`,
`exRestPref`). `customExercises` comblé en ft-v713 : les exercices perso partent avec le catalogue.
Le 1ᵉʳ trou comblé (`nextPlanned`, ft-v654) a confirmé **R2** au passage : l'Accueil avait sa version
de la règle « cette annonce tient-elle encore ? », le chat n'en avait aucune — elle vit maintenant
dans **une seule** fonction que les deux lisent.

### R4b — Le CHEMIN complet de l'intelligence de Milo (généralisation de R4)
GPT généralise R4 au-delà des séances, et il a raison — toute intelligence produite par Milo devrait
suivre ce chemin :
**Conversation → Compréhension → Connaissance PROPOSÉE → Validation → Profil vivant → Comportement futur**
*« Une bonne réponse ne suffit plus : elle doit améliorer le comportement futur de l'application. »*
**⚠️ Correction apportée à sa formulation** : il écrit « validation *si nécessaire* ». Chez nous, dès
que la connaissance porte **sur la personne**, la validation n'est pas optionnelle — c'est le Principe 3
de la Constitution (rien n'est mémorisé sans accord). Le « si nécessaire » ne s'applique qu'aux
connaissances **techniques** (p. ex. un temps de repos), jamais à ce qui la concerne.
*Origine : GPT, 27/07/2026 · nuance : Constitution P3*

### R31 — La FIGURINE est le vocabulaire du système : sa finesse est le PLAFOND de tout le reste
*« Tout découle de cette figurine, puisque le code lui-même est basé sur la figurine »* (Michel,
03/08/2026). **C'est exact, et c'est mesurable.** Les codes musculaires ne servent pas qu'à
colorier : ils sont produits par `_mscScores` et **relus à 13 endroits**, dans 4 fichiers — la
figurine, la **couleur du calendrier**, le calcul des **calories** (`_MET_REGIONS`), l'écran
Progrès, et le contexte envoyé à **Milo**. Aucun de ces modules ne peut être plus précis que le
vocabulaire qu'il reçoit.
**Conséquence pratique** : enrichir la figurine n'est pas un travail « visuel », c'est **relever le
plafond de précision de toute l'application**. Et inversement, un muscle absent du vocabulaire est
un muscle dont *aucun* module ne pourra jamais parler — l'imprécision se propage en silence, sans
bug, sans test rouge.
**Corollaire, et c'est ce qui rend la règle opérationnelle** : avant de déclarer qu'une distinction
est impossible (« on ne peut pas séparer le soléaire du jumeau »), **ouvrir le DESSIN**, pas
seulement la table qui nomme. Mesuré le 03/08 : le dessin distingue **34 structures anatomiques**
là où le code n'en nomme que **18**. Les adducteurs, le soléaire, le trapèze inférieur, la longue
portion du triceps, les fléchisseurs et extenseurs du poignet **étaient déjà dessinés** — rattachés
au mauvais groupe.
*Origine : 03/08/2026 · cas vécu : j'ai écrit six fois dans le code « les adducteurs n'existent pas
dans la figurine » sans jamais ouvrir le dessin, et j'ai même figé cette fausse limite par un test.
C'est **R28** (une limite non vérifiée devient une règle de conception silencieuse) appliquée à
moi-même, après que Michel l'ait vécue avec canvas. · voisine de R1 (source de vérité unique) et
de R3 (toute connaissance doit produire un comportement observable).*

**⭐ Et l'argument de Michel va plus loin que la technique**, il vaut d'être gardé tel quel :
*« plus on se rapproche d'une réalité, plus c'est fiabilisé ; plus c'est fiabilisé, plus les gens
vont avoir confiance dans ce que j'ai fait »*. Une correction anatomique n'est pas un détail
d'expert : c'est ce qui fait qu'un sportif qui S'Y CONNAÎT ne prend pas l'app en défaut. La
figurine est la **marque de fabrique** du produit — elle se voit avant tout le reste, et elle est
jugée par des gens qui savent où sont leurs muscles. *Ce qui est le plus visible est ce qui doit
être le moins bâclé.*

### R5 — La règle marche À L'ENVERS : c'est un outil d'audit
Demander « où cette information ressort-elle **concrètement** ? » est ce qui a permis de trouver les
4 bugs ci-dessus. À faire périodiquement sur l'existant : les **données mortes** (stockées, jamais
exploitées) doivent être soit branchées, soit retirées.
*Origine : GPT + Claude, 27/07/2026.* ✅ **AUDIT FAIT le 27/07 au soir** — périmètre : **110 clés de stockage** (110 écrites / 110 relues), **90 champs de `S`**, **17 sous-champs** des objets riches (`registre`, `coachQuiz`, `healthProfile`). **Résultat : UNE seule donnée morte** — `S.registre.updatedAt`, une date maintenue à chaque changement du registre et **jamais lue** (elle partait même dans le cloud sans être consultée). **Décision : gardée et NOMMÉE** plutôt que retirée — elle a un usage futur précis (départager deux appareils qui synchronisent le registre, au lieu d'écraser au hasard), donc elle relève du « différé mais nommable ». Le commentaire est posé aux 2 endroits où elle est écrite, avec la consigne : *si ce besoin disparaît, la retirer*. ⚠️ **Leçon de méthode** : l'audit a demandé **4 tentatives** — les 3 premières donnaient des dizaines de faux positifs (les alias `r`, `e`, `s`… sont des noms de variables courants ; `hp.style` est un élément HTML, pas une donnée). **Seul le motif non ambigu `S.objet.champ` est fiable.**

---

## 2. Les décisions

### R6 — Une seule mémoire, une seule VOIX — mais construite de façon ÉMERGENTE
Jumeau de R1 côté décision : les modules (Coach, Programmes, Nutrition, Récup, Notifications) doivent
devenir des **clients** d'une couche de raisonnement commune, plutôt que de relire le profil brut pour
re-décider chacun dans leur coin.
**⚠️ Nuance d'architecte** : **émergent, pas big-bang**. Réécrire une couche centrale d'un coup sur une
app sans framework serait de la sur-ingénierie prématurée. Son embryon existe déjà (le Gardien, la
construction du contexte, les rôles d'exercice). **La règle qu'on adopte tout de suite, et qui est
gratuite** : *tout nouveau module passe par la couche de raisonnement, jamais par le profil brut.*
*Origine : GPT + Michel + Claude, 27/07/2026 · détail : `docs/MOTEUR-RAISONNEMENT-MILO.md`*

### R7 — Le cerveau de Milo est DISTRIBUÉ — le prompt est le DERNIER levier
Un « bug de Milo » est un diagnostic **à travers les couches** (inscription · données · mémoire · code ·
hiérarchie des règles · prompt), jamais un réflexe de réécriture du prompt. **Les 3 questions, dans
l'ordre** : ① est-ce **STRUCTUREL** ? (déterministe, définitif) → ② est-ce une **HIÉRARCHIE** de règles ?
(déterministe) → ③ seulement alors, le **PROMPT** (probabiliste). Tant qu'on n'a pas répondu aux deux
premières, on n'y touche pas.
*Origine : Michel, 25/07/2026 — après trois durcissements de prompt inutiles*

### R8 — Un prompt ne compense JAMAIS une donnée absente
Si Milo redemande sans cesse une information, ce n'est pas qu'il est mal instruit : c'est que
**l'interface ne la collecte pas**. Le fix est dans l'INTERFACE.
*Origine : ft-v604 (écran « Ton entraînement » ajouté à l'inscription) — après des mois de durcissement
de prompt sur le même symptôme*
**Croisée 5 fois** : l'inscription (ft-v604) · le **prénom** que le prompt réclamait sans qu'on le
transmette (ft-v652) · les **jours à venir** (ft-v658 — « demain mercredi » un mercredi) · les **jours
passés et les dates de records** (ft-v660 — une séance datée « lundi » alors qu'elle était mardi, et un
maximal reproposé 2 jours après un record parce que les records n'avaient aucune date).
**5ᵉ fois — le CATALOGUE d'exercices (ft-v713)** : le prompt demandait à Milo d'employer « un nom
d'exercice le plus proche possible de la **bibliothèque** »… qu'on ne lui envoyait pas. Mesuré :
« élastique » et « TRX » apparaissaient **0 fois** dans ses 47 420 caractères de contexte, pour un
catalogue de 340 exercices. *Le signe qui aurait dû alerter : une consigne qui NOMME une source
(« la bibliothèque », « ton planning », « ses records ») sans que cette source soit dans le contexte.*
**À vérifier périodiquement** : pour chaque source citée par le prompt, chercher si elle y est vraiment.
⚠️ **Corollaire coûteux, appris à ft-v660** : en corrigeant ft-v658 je n'ai regardé QUE la question
posée (« demain »). Le même manque existait à **trois autres endroits du même contexte**, et le retour
suivant est tombé deux heures après. *Quand on trouve une donnée absente, chercher immédiatement ses
jumelles ailleurs dans le même bloc — un oubli de ce type est rarement isolé.*
**Le réflexe** : quand une réponse est fausse sur un point *factuel*, se demander d'abord **« est-ce
qu'on lui a seulement donné le fait ? »** — avant de toucher au prompt.

### R9 — Le niveau de MODÈLE est une variable STRUCTURELLE
On évalue Milo sur le modèle **réellement utilisé par les vrais utilisateurs**, jamais sur le modèle
haut de gamme du fondateur — sinon on **corrige le mauvais cerveau**. Un modèle léger suit mal des
consignes fines : le prompt le plus soigné ne « prend » que sur un modèle capable.
*Origine : 26/07/2026 — l'« interrogatoire » de Milo résistait à 3 durcissements ; la cause était le
modèle par défaut, pas le prompt*

### R10 — Les permissions sont hiérarchisées ET BORNÉES À UN DOMAINE
Une permission n'est jamais globale : elle doit dire **quoi** on a le droit de supposer **et dans quel
domaine**. Sans ces deux limites, elle finit toujours par déborder. Trois niveaux : **faits** (jamais
d'hypothèse) · **paramètres d'entraînement** (hypothèses OK, affichées) · **domaines sensibles**
(santé, blessures, médicaments : aucune hypothèse).
*Origine : ft-v605 — une permission « fais des hypothèses », pensée pour l'entraînement, a fait inventer
une maladie à partir d'une photo de médicament*

### R11 — La SÉCURITÉ prime sur la vitesse (hiérarchie à 3 étages)
En cas de conflit : **Constitution** (personne, sécurité) → **noyau cardinal de conversation** →
**comportements**. Les règles ne s'additionnent pas, elles **se concurrencent** : ce qui compte n'est
pas qu'une règle soit présente, mais sa **priorité**.
*Origine : ft-v603 — une règle « propose vite, prioritaire sur TOUT » avait écrasé la protection des
blessures déclarées*

### R12 — La cohérence avant la réactivité · la pertinence avant la disponibilité
Raisonner sur des **tendances**, pas sur du bruit (84,8 → 84,5 kg = bruit ; 6 semaines de stagnation =
signal). Et n'utiliser une donnée que si elle **améliore la décision**, pas parce qu'elle existe.
*Origine : Constitution P19 et P20 (22/07/2026)*

---

## 3. La construction

### R13 — Enrichir l'EXISTANT plutôt que créer un système nouveau
Avant d'écrire un composant, chercher s'il existe déjà ailleurs dans l'app. Moins de code, comportement
déjà éprouvé, cohérence visuelle gratuite.
*Exemples réels : le carrousel des nouveautés réutilise celui du Guide de l'application (ft-v630) ·
l'inscription réutilise les options du questionnaire coach (ft-v604) · la mémoire de conversation
réutilise l'infrastructure des observations (ft-v582).*

### R14 — Un comportement copié d'un contexte à un autre peut devenir FAUX
Le pré-remplissage par l'historique a du sens pour un **programme générique** (qui dit « 4×8 » sans
charge). Il est **absurde** pour une séance que Milo a prescrite exprès. Copier du code, c'est aussi
copier ses **hypothèses implicites** — les revérifier dans le nouveau contexte.
*Origine : ft-v625*

### R15 — Tout chemin de fermeture doit poser son marqueur
Si une action a un **effet de bord** (marquer « vu », consommer un quota, poser une date), **tous** les
chemins qui la déclenchent doivent le faire — y compris les chemins « secondaires » (glissement, touche
Échap, clic à côté).
*Origine : ft-v466 (point rouge qui ne partait pas) puis ft-v629 (pop-up qui revenait) — **deux fois le
même oubli**, d'où la règle*

### R16 — Local-first : zéro perte de séance
On enregistre en local **avant** toute synchronisation. Le réseau ne doit jamais bloquer ni faire perdre
une donnée. Corollaire : l'app doit s'ouvrir **depuis le cache, même hors-ligne**, et le démarrage ne
doit jamais attendre une requête réseau.
*Origine : règles d'or #3 et #4 (`CLAUDE.md`) — nées de vraies pertes de données*

### R17 — Chaque bug découvert devient un scénario de test PERMANENT
Le noyau dur (`tests/milo/`) rassemble les scénarios critiques et déterministes. Il tourne à chaque
version et **bloque la livraison** s'il est rouge.
*Origine : framework de tests, 23/07/2026*

### R18 — Vérifier le DÉPLOIEMENT, pas seulement le push
« J'ai poussé » ne veut pas dire « c'est en ligne ». Un déploiement peut échouer **silencieusement** —
c'est arrivé deux fois, l'app est restée bloquée plusieurs versions en arrière sans aucune alerte.
Vérifier le run, et le numéro de version affiché dans l'app.
*Origine : ft-v600 et ft-v619 · détail : `docs/GALERES-ET-LECONS.md`*

### R23 — Une fonctionnalité livrée SANS entrée de journal devient INVISIBLE
Elle est dans le code, absente de la doc — donc personne (ni humain ni IA) ne sait qu'elle existe. On
la re-propose, on la re-construit, ou on affirme à tort qu'elle manque.
**Cas réel** : l'import de prise de sang existe dans 4 fichiers du code, mais n'a **aucune** entrée de
journal ; elle n'apparaît qu'en note incidente dans une entrée de migration technique écrite des
semaines plus tard. Le 27/07, un audit a conclu qu'elle manquait — Michel a dû corriger.
**Corollaire pour les documents d'ÉTAT** : les tailler ne coûte rien **si et seulement si** ce qu'on
retire existe déjà dans le journal. *Tailler ≠ supprimer* : une ligne dont c'est la seule trace se
**déplace**, elle ne se jette pas.
**Ce qui manque encore** : un **inventaire de ce qui existe** (réponse à *« est-ce que c'est déjà
construit ? »*) — le journal répond à *« que s'est-il passé et pourquoi ? »*, ce n'est pas la même
question. Idéalement dérivé du **code** (vérifiable) et non de la mémoire.
*Origine : 27/07/2026, cas de la prise de sang*

### R30 — Un RETRAIT volontaire doit être écrit, sinon il redevient un bug
R23 dit qu'une fonctionnalité livrée sans entrée de journal devient invisible. **Le miroir est
plus dangereux** : une fonctionnalité **retirée exprès** ne laisse, elle, qu'un **code orphelin**
— une modale sans bouton, une fonction sans appelant. Or c'est exactement à quoi ressemble un
oubli. Le suivant « répare » donc une décision.
**Cas réel (02/08/2026)** : Michel avait retiré le **calculateur de plaques** (« ça ne servait à
rien »). Trois mois plus tard, je trouve `openPlateCalc` sans aucun appelant, je conclus au bug
— d'autant que **la veille**, le champ `bar-inp` était bel et bien un vrai orphelin — et je le
remets. Michel : *« dans mes souvenirs je l'avais retiré »*. Ni le journal, ni l'historique git
disponible n'en gardaient trace.
**Ce qu'on en fait** :
- un retrait s'écrit dans le journal **avec sa raison**, comme un ajout ;
- et se **fige par un test** qui vérifie que le chemin reste fermé — un test peut protéger une
  absence aussi bien qu'une présence ;
- ⚠️ **corollaire** : du code orphelin ne prouve rien. Avant de « réparer », chercher la décision
  (journal, git) — et si on ne trouve rien, **demander** au lieu de supposer.
**⭐⭐ 2ᵉ CAS RÉEL (22/08/2026) — et il ajoute une nuance que le premier n'avait pas.** Michel
demande de nettoyer le menu admin : *« retire ce qui est inutile. Par contre marque bien dans les
journaux qu'on les a retirés **et pourquoi ils ont été nécessaires**. Ça permet d'avoir une
traçabilité de ce qui a été fait. »*
**Sa consigne dit « pourquoi ça a été NÉCESSAIRE », pas « pourquoi on retire ».** Et c'est en
cherchant cette raison, outil par outil, que **les deux retraits proposés se sont effondrés** :
- **PT-001** — j'avais écrit « le benchmark l'a remplacé ». **Faux** : il rejoue *tout*
  l'historique et vérifie que Milo se souvient de la séance d'avant — un test de **mémoire
  longue**, quand le benchmark joue 16 messages **isolés**. Il mesure la promesse centrale du
  produit, et rien d'autre ne le fait.
- **Le recalage des anciennes séances** — cru one-shot. Or l'**import d'historique** existe, et
  des séances importées auraient besoin d'être recalées. *Elle n'est pas finie, elle dort.*
👉 **La leçon qui s'ajoute à R30** : chercher *pourquoi un outil a été nécessaire* est le meilleur
test de son inutilité présente. Un outil dont on retrouve la raison d'être **et** un cas où elle
vaut encore n'est pas mort — il dort. **On range, on ne supprime pas** ; ce qui a vraiment été
retiré, c'est le **piège** (les personas de test portaient les prénoms de vrais testeurs).
*C'est aussi **R28** payé deux fois dans la même tâche — et cette fois c'est celui qui écrit le
code qui affirmait une limite sans la vérifier.*
**⭐⭐ 3ᵉ CAS RÉEL (23/08/2026) — LE MIROIR DU MIROIR, et il vaut autant que la règle.** R30
dit : *avant de retirer, cherche pourquoi c'était nécessaire*. Le cas de ce soir dit
l'inverse et il est tout aussi coûteux : **avant de PROMOUVOIR un essai parqué, cherche
pourquoi il était parqué.**
Un audit extérieur signale que le pont « blessure dite à Milo → Profil Santé » est éteint
derrière `window.__FT_CLONE__`, et conclut que **le retrait du clone a créé une régression de
sécurité**. Deux choses sont fausses là-dedans :
- ce n'était **pas une régression** : l'essai n'avait jamais été promu, et ft-v976 l'avait
  listé comme tel le jour même. *Personne n'avait rien cassé — une décision n'avait jamais
  été prise* ;
- et surtout, **le promouvoir tel quel aurait été PIRE que de ne rien faire**. Mesuré avant
  de toucher au code : `_gardienZonesFromText` détecte des **noms de muscles**, pas des
  blessures — **7 faux positifs sur 9** phrases anodines. *« Michel veut prioriser le dos et
  les épaules »* produisait deux zones fragiles. Milo se serait mis à protéger des zones
  parfaitement saines chez des gens qui n'ont rien.
👉 **L'essai n'était pas OUBLIÉ, il était INCOMPLET — et le drapeau le savait.** Il lui
manquait la moitié qui distingue *« parler de son dos »* de *« avoir mal au dos »*. Une fois
ce second critère écrit : **0 faux positif, 0 raté sur 17 phrases**.
⚠️ **Ce qui rend la règle opérationnelle** : un garde `__FT_CLONE__`, un `if(false)`, un
drapeau d'essai sont des **questions non résolues**, pas des interrupteurs. Les retirer sans
retrouver la question, c'est répondre au hasard. *Et le fait qu'un audit extérieur réclame la
promotion ne remplace pas la mesure* (**R28**).
*Origine : 02/08/2026 · miroir de R23 · voisine de R28 (une limite non vérifiée) · 2ᵉ cas
22/08/2026 · 3ᵉ cas 23/08/2026, le sens inverse.*

---

## 4. La gouvernance (les règles qui s'appliquent aux règles)

### R19 — Gouvernance LÉGÈRE : la gouvernance sert le produit, jamais l'inverse
Chaque élément du cadre (document, procédure, checklist) doit **réduire un risque ou une charge
mentale**. Sinon on le coupe. La mesure du succès n'est pas le nombre de documents, c'est de pouvoir
valider la prochaine évolution **plus simplement, plus sûrement, plus vite** qu'avant. Si le cadre fait
réfléchir *davantage*, il est trop complexe.
*Origine : 24/07/2026 · détail : `docs/PROCESSUS-DEVELOPPEMENT.md`*

### R20 — Le prompt est OPÉRATIONNEL, la doc est de la MÉMOIRE
Le prompt reste maigre : *une règle entre, une règle sort*. Le budget de contexte n'est pas infini, et
chaque règle ajoutée **dilue** les autres. La doc, elle, se **jardine** : elle accumule, mais on la
taille.
*Origine : 24/07/2026*

### R21 — Une règle n'entre ici que si elle est STABLE
Critère d'entrée : *« principe de conception valable pour des années, ou simple règle métier ? »* Si
c'est une règle métier, elle va dans le journal des versions ou dans un doc spécialisé — pas ici.
Méta-règle auto-limitante : elle empêche ce fichier de gonfler.
*Origine : GPT, 22/07/2026 (critère d'entrée de la Constitution, appliqué ici aussi)*

### R22 — Les retours utilisateurs se traitent à 3 PALIERS
Un retour **isolé** → on observe. **2-3 retours indépendants** → on enquête. **Récurrent** → ça devient
un scénario de test permanent. Anti-sur-ajustement : ne pas réécrire l'architecture sur une remarque.
*Origine : 24/07/2026*

---

---

## 5. Le produit (l'expérience)

> **Pourquoi cette section existe** : GPT proposait (27/07) de séparer « règles d'architecture » et
> « règles de conception » dans **deux fichiers**. Le **fond** est juste — une règle sur *le système*
> et une règle sur *l'expérience* ne se ressemblent pas. La **forme** ne l'est pas : deux fichiers
> imposent, à chaque nouvelle règle, un arbitrage *« architecture ou conception ? »* que personne ne
> saura appliquer deux fois de la même façon — et on finit avec des règles introuvables dans les deux.
> **Une section coûte zéro, une frontière coûte cher.** (Cohérent avec R19 et R21.)

### R24 — Informer sans BLOQUER
Une information (nouveauté, conseil, rappel) ne doit jamais se mettre **en travers** de ce que la
personne est venue faire. Le **format** peut inciter à lire ; il ne doit pas **emprisonner**. Toujours
laisser une sortie — et la rendre **visible**, pas seulement possible.
*Origine : ft-v630 — un testeur proposait de forcer le passage par toutes les cartes de nouveautés ;
refusé au nom de l'ouverture instantanée à la salle. GPT est arrivé indépendamment à la même conclusion
(« informer sans bloquer »), ce qui a confirmé l'arbitrage. Complété par ft-v633 (sortie rendue visible).*

### R25 — La POP-UP annonce, l'AIDE explique
Ce qui interrompt doit être **court** (4-5 lignes) ; le détail va là où on le consulte **quand on en a
besoin** (l'aide contextuelle, l'aide détaillée). **Gagner de la place n'autorise jamais à écrire plus
long** — un pavé bien présenté reste un pavé.
*Origine : ft-v632 — Michel, juste après qu'on ait agrandi les cartes : « donner trop d'infos en une
seule pop-up c'est pas bon ». Mesuré : les entrées en attente faisaient 14 et 11 lignes.*

### R26 — Le format INCITE, la contrainte braque
Corollaire des deux précédentes, et garde-fou pour la suite : quand on veut qu'une chose soit lue,
faite ou comprise, **changer le format** marche mieux que **forcer le passage**. Une carte par écran
fait lire ; six écrans obligatoires font fermer l'app.
*Origine : ft-v630*

### R27 — On s'applique à nous-mêmes ce qu'on promet à l'utilisateur
La promesse du produit est *« tu ne repars jamais de zéro »* (`docs/VISION-FORCE-TRACKER.md`). Le
**projet** doit tenir la même promesse envers lui-même : ne pas repartir de zéro sur sa propre histoire
à chaque session.
**Constat du 27/07** : on demandait à Milo de se souvenir pour le sportif sans se l'appliquer — 3
versions sur 10 sans trace lisible, une fonctionnalité déclarée manquante alors qu'elle existait depuis
3 semaines, et **Michel comme seule mémoire vivante**. Ce n'est pas tenable : *dans deux ans, il ne s'en
souviendra plus non plus.*
**Ce qui en découle concrètement** :
- l'inventaire est **généré depuis le code** (`tools/inventaire.py`) → il ne peut pas se périmer ;
- le **pourquoi** s'écrit **dans le code**, à côté de ce qu'il protège (89 % des avertissements le font
  déjà) — pas dans un document qu'on oublie d'ouvrir ;
- une explication donnée en conversation s'écrit **tout de suite**, sinon elle disparaît avec la session.
*Origine : 27/07/2026, soirée de reconstruction du journal (57 % → 99 %) · argument long terme relevé
par GPT (« les fonctionnalités changent, les principes doivent durer des années ») et par Michel
(« dans 2 ans je ne vais plus m'en souvenir »).*

### R28 — Une limite non vérifiée devient une règle de conception silencieuse
Quand quelqu'un affirme *« on ne peut pas »*, *« on est limité par… »*, **vérifier dans le code avant
d'accepter**. Une contrainte imaginaire ne casse rien, ne remonte dans aucun test, dans aucun retour
utilisateur — **elle se manifeste seulement par ce qui n'est jamais demandé**, et rien ne mesure ça.
**Cas réel** : Michel a conçu l'app pendant des semaines en croyant qu'elle était bridée graphiquement
(« on est limité avec canvas »). Vérification du 27/07 : l'interface est en **SVG + CSS** (104 `<svg>`),
canvas ne sert qu'à traiter des **images**. Tout était faisable depuis le début. *« Je pensais que
j'étais limité, donc je me limitais dans mon idée du graphisme. »*
**Plus grave qu'un bug** : un bug coûte une correction, une fausse limite coûte tout ce qu'on n'a jamais
imaginé.
*Origine : 27/07/2026 · détail : `docs/GALERES-ET-LECONS.md`*

### R29 — Le droit de DEVINER dépend du COÛT DE L'ERREUR
Toutes les approximations ne se valent pas. Avant de laisser l'app trancher à la place de la
personne, se demander **ce que coûte une erreur** :
- **Erreur gratuite → devine.** Une couleur de calendrier, un tri, une suggestion : si c'est faux,
  personne ne le remarque et rien n'est perdu.
- **Erreur qui touche la personne → demande.** Un fait sur elle, une mémoire, une donnée de santé,
  l'effacement de quelque chose qu'elle a dit : là on **montre ce qu'on voit** et **elle tranche**.
**Le corollaire qui rend la règle utilisable** : quand l'app renonce à trancher, elle ne doit pas
poser une question à l'aveugle — elle **affiche les éléments** qu'elle a (ce qui a été fait, ce
qu'elle en déduit) pour que la décision soit facile. *Informer sans décider.*
**Et si elle ne sait pas, elle se tait** : une fonction de classement doit pouvoir rendre « je ne
sais pas » (`null`), et ce `null` ne doit JAMAIS être remplacé par une valeur par défaut.
**Cas réel** : Michel annonce « bas du corps » puis fait une séance ; faut-il considérer l'annonce
honorée ? Rapprocher son libellé des muscles travaillés se tromperait sur les séances **mixtes** —
et quand on lui a posé la question (développé couché + squat, on met quoi ?) il a répondu lui-même
*« j'avoue tu me poses une colle »*. **Si l'expert hésite, l'algorithme se trompera plus souvent que
lui.** (ft-v662 → ft-v663.)
*Origine : 29/07/2026, conversation Michel ↔ Claude · voisine de R10 (permissions bornées) et de
R24 (informer sans bloquer).*

### R32 — Une donnée peut être EXACTE dans le rapport et FAUSSE à lire littéralement
Une bio-impédance ne mesure ni la graisse, ni le muscle, ni l'eau : elle mesure un **poids** et
une **impédance électrique**, puis le fabricant **estime** le reste avec ses équations. Toutes les
lignes d'un rapport n'ont donc pas le même statut, et les confondre est le vrai piège — bien plus
que d'éventuels chiffres absurdes.
**Les trois niveaux, à distinguer explicitement** (proposition GPT, 23/08/2026) :
- **A — MESURÉ** : poids, impédances (Ω).
- **B — ESTIMÉ** : masse grasse, % de gras, muscle, muscle squelettique, eau, graisse viscérale.
- **C — PROPRIÉTAIRE** : IMC, score corporel, âge corporel, poids cible, « coaching expert ».
  ⛔ *Le poids cible du fabricant ne devient JAMAIS l'objectif de la personne* — ce sont deux
  concepts différents, et l'un vient d'un modèle qu'on ne peut pas ouvrir.

**⭐⭐ LE CAS QUI L'A FONDÉE EST MESURÉ, PAS THÉORIQUE.** Sur les 5 rapports de Michel
(27/07 → 23/08/2026), les variations de la ligne « muscle » et celles de la ligne « eau » ont une
corrélation de **r = 0,998** — même sens à chaque pas, rapport constant de 1,2 à 2,0. *La valeur
« muscle » n'est pas influencée par l'hydratation : elle EST l'estimation d'eau redimensionnée.*
Lire une variation de muscle comme du tissu n'a donc aucun sens à court terme.
⚠️ **Et il n'y avait aucune incohérence à trouver** : `poids × %gras = masse grasse` et
`poids − gras = maigre` tombent juste à **0,05 kg près** sur les 5 rapports. *La machine applique
correctement ses équations — c'est notre lecture qui était trop précise.*

**La règle opérationnelle** : jamais présenter une variation **à court terme** de masse grasse ou
musculaire issue d'une BIA comme un changement tissulaire certain. On privilégie ① la **tendance**
sur plusieurs mesures · ② des **conditions comparables** (même appareil, même heure, à jeun) ·
③ le croisement avec le **poids**, les **performances**, l'**entraînement** et la **nutrition**.
⛔ **Et on ne fabrique pas un « score de fiabilité » chiffré** (« fiabilité 92 % ») sans méthode
validée pour le calculer : ce serait remplacer une fausse précision par une autre (**R29**).
Des mots honnêtes suffisent : *conditions comparables · donnée estimée · tendance émergente ·
données insuffisantes*.

*Origine : 23/08/2026 · Michel envoie 5 rapports MyBodyCheck puis me reprend — « tu avais fait un
calcul approfondi comme quoi il y avait beaucoup de mytho dedans ». Il avait raison : c'était écrit
en ft-v323 (sa masse grasse sautait de 15 % à 20,6 % en changeant de balance) et ft-v833 (« on
n'avale pas le chiffre de la balance »), et je ne l'avais pas relu avant d'annoncer une perte de
gras chiffrée (**R23**). Analyse croisée de GPT, dont la corrélation eau/muscle a été vérifiée ici.
· voisine de **R29** (le droit de deviner dépend du coût de l'erreur) et de **R12** (cohérence
avant réactivité).*

### R33 — Le format du FABRICANT ne devient jamais le format INTERNE
Un rapport de balance, un export de montre, un bilan de labo arrivent chacun avec **son propre
vocabulaire** : *« Muscle squelettique »* chez MyBodyCheck, *« SMM »* chez InBody, *« Skeletal
Muscle »* ailleurs. Si l'app stocke ces libellés tels quels, le **deuxième** fabricant oblige à
retoucher tout ce qui lit la donnée — Milo compris.
👉 **Un seul nom interne par grandeur** (`skeletal_muscle_mass_kg`), et la traduction se fait
**à l'entrée**, une fois. Milo et l'Observateur n'ont alors jamais à connaître les particularités
d'une marque. *C'est **R2** appliqué au vocabulaire : une grandeur, un propriétaire, un nom.*
⚠️ **Corollaire de provenance** : ce qui est normalisé doit garder **d'où il vient** (marque,
type de document, méthode d'extraction). Sans ça on ne peut plus auditer une valeur douteuse, ni
savoir si elle a été lue, calculée ou devinée.

**⛔ ET L'ORDRE DES SOURCES EST UNE ÉCHELLE, PAS UN CHOIX** : donnée **structurée** native (CSV,
export, API) → **PDF texte** → **OCR** → **IA multimodale** → **échec propre**. *Prendre une photo
d'un tableau qu'on pourrait exporter, pour la faire relire par une IA, est le chemin le plus cher
et le moins fiable des quatre.* ⭐ On descend d'un cran **seulement** quand le précédent échoue.

**⚠️ CE QUE CETTE RÈGLE N'AUTORISE PAS : construire le pipeline avant d'en avoir le volume.**
Proposition GPT du 23/08 : ajouter OCR local + parsers par fabricant pour supprimer les appels IA.
**Mesuré avant de refuser** : l'app n'embarque **aucun** moteur OCR, en ajouter un coûte **2 à
4 Mo** (3 à 5× la plus grosse bibliothèque actuelle) et heurte la **règle d'or #4** — pendant que
le volume réel est de **5 imports en un mois**. *Une architecture dimensionnée pour 1 000 imports
qu'on n'a pas est une dette, pas une optimisation* (**R19**). Sa propre conclusion le dit :
*« il vaut mieux un appel IA fiable qu'un parser local faux »*.
👉 **Ce qu'on garde tout de suite, parce que c'est gratuit** : le nom interne, la provenance,
l'échelle des sources, et **l'échec propre** (`document non reconnu` vaut mieux qu'une donnée
inventée — c'est ft-v971).
⛔ **Et pas de faux score de confiance** (« fiabilité 97,4 % ») sans méthode qui le calcule
vraiment : des états nommés — *validé · partiel · ambigu · non reconnu* — sont plus honnêtes (**R29**).

*Origine : 23/08/2026 · note d'architecture de GPT sur l'import universel, après le cas des
5 rapports MyBodyCheck. Ses §8-9, §10, §33 et §36 sont adoptés ; son pipeline OCR+parsers est
différé faute de volume, avec la mesure qui le justifie. · voisine de **R2** (un propriétaire par
information), **R19** (la gouvernance sert le produit) et **R32** (mesuré / estimé / propriétaire).*

**⭐ PREMIÈRE MISE EN ŒUVRE, LE MÊME JOUR (ft-v974) — et le différé a sauté sur décision de
Michel** : *« on construit, parce que je l'utilise souvent »*. Ce qui a rendu l'échelle des
sources réellement applicable n'est pas le moteur OCR (0,3 s de chargement, 3,2-3,7 s de lecture,
≈ 2 Mo une seule fois) — **c'est de savoir DIRE NON**. Une valeur mal lue par un OCR n'est pas
absurde, elle est **crédible** : mesuré, la protéine de 13,8 kg sort à 18,8. Aucune borne
physique ne l'attrape.
👉 **Ce qui l'attrape, c'est la REDONDANCE du document lui-même** — `gras + eau + protéine + os =
poids`, juste à 0,05 kg près sur les 5 rapports. **La règle qui s'ajoute donc à R33** : *avant de
descendre d'un cran dans l'échelle des sources, chercher ce qui, DANS le document, permet de
vérifier la lecture.* Sans ce recoupement, un cran de plus n'est pas une source moins fiable :
c'est une source **dont on ne saura pas si elle a menti**. C'est la raison écrite pour laquelle le
même chemin n'a **pas** été ouvert à la prise de sang — un bilan sanguin n'a pas cette
arithmétique interne, et l'erreur y coûte beaucoup plus cher.
⛔ **Et le corollaire de fabrication** : un contrôle qui compare une valeur à la formule qui l'a
produite est un **vert qui ne peut pas rougir** (voir `BUGS.md`). Il faut le voir échouer avant
de lui faire confiance.

## 🔗 Où va le reste

| Sujet | Document |
|---|---|
| Pourquoi le produit existe | `docs/VISION-FORCE-TRACKER.md` |
| Comportement de Milo envers la personne | `CONSTITUTION-MILO.md` |
| Le cerveau de Milo (pipeline, contexte) | `docs/MOTEUR-RAISONNEMENT-MILO.md` |
| Le profil vivant (4 modes, fiabilité) | `docs/PROFIL-VIVANT.md` |
| La méthode de développement d'une brique | `docs/PROCESSUS-DEVELOPPEMENT.md` |
| Les dérives de comportement de Milo | `docs/BUGS-DE-PHILOSOPHIE.md` |
| Les galères techniques et leurs leçons | `docs/GALERES-ET-LECONS.md` |
| Le langage métier commun | `docs/MODELE-METIER.md` |
| État actuel, roadmap | `docs/CONTEXTE-ACTUEL.md` |

---

*À compléter quand une règle **stable** émerge d'un vrai événement. Ne pas y mettre de règle métier
(→ journal des versions) ni de règle de comportement de Milo (→ Constitution).*
