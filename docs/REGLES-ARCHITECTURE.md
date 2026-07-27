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

### R5 — La règle marche À L'ENVERS : c'est un outil d'audit
Demander « où cette information ressort-elle **concrètement** ? » est ce qui a permis de trouver les
4 bugs ci-dessus. À faire périodiquement sur l'existant : les **données mortes** (stockées, jamais
exploitées) doivent être soit branchées, soit retirées.
*Origine : GPT + Claude, 27/07/2026 · ⏳ audit « données mortes » pas encore fait*

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
