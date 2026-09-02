# 📐 Le moteur de tendance nutritionnelle — spécification mesurée

> **Créé le 02/09/2026.** GPT a lu le contre-audit de `docs/NUTRITION-ANALYSE-GPT.md`, accepté les
> réfutations, et demandé une **proposition A→E avant toute implémentation** : moteur de tendance
> sur 14 jours · matrice de décision par objectif · quelle métrique de performance **existe déjà** ·
> hiérarchie de l'écran · ce qui reste à 0 appel API. Sa dernière ligne : *« ne rien implémenter
> avant validation de cette proposition »*.
>
> ⛔ **Aucune ligne de code n'a été écrite pour ce document.**
> 📄 Version autonome envoyée à GPT : `Force-Tracker-moteur-tendance-proposition.pdf`.

---

## ⚠️ 0. Ce que la MESURE change dans sa proposition

Quatre vérifications faites avant d'écrire quoi que ce soit. **Trois modifient la proposition**,
une la conforte de façon inattendue.

### ⛔⛔ ① LE TOUR DE TAILLE N'A AUCUN HISTORIQUE — ses §6 et §11 ne sont pas calculables

`S.waist` est un **nombre unique**, écrasé à chaque saisie. Il n'existe **aucun journal de
mensurations** dans le dépôt. ⚠️ **Et j'ai vérifié du côté des bilans d'impédancemètre avant de
l'affirmer** (R30) : `_BS_FIELDS` porte 16 champs — poids, `bf`, masse grasse, muscle, eau,
protéine, os, viscéral, BMR, âge corporel, IMC, score, masse maigre, graisse sous-cutanée, SMI —
et **le tour de taille n'y figure pas**.

👉 *« Tour de taille ↘ sur 14 jours »* **ne peut pas s'afficher** : la donnée n'existe qu'au
présent. C'est un **arbitrage** : soit le moteur v1 s'en passe et le dit, soit on construit
d'abord le journal — et la première tendance n'apparaîtrait alors **pas avant plusieurs semaines
d'usage**.

⛔ **Et le `bf` d'un impédancemètre n'est PAS un substitut à 14 jours** : sur les 5 rapports réels
de Michel, les variations de la ligne « muscle » et celles de la ligne « eau » ont une corrélation
de **0,998** (`docs/REGLES-ARCHITECTURE.md`, **R32**). *À court terme, ces lignes mesurent
l'hydratation, pas le tissu.*

### ⭐ ② LES TROIS ÉTATS QU'IL PROPOSE EXISTENT DÉJÀ, ET LE SEUIL EST DÉJÀ 14

`app.js` : `_PA_MIN_JOURS = 3` (« en dessous, on ne prétend rien observer ») et
`_PA_SOLIDE = 14` (« à partir de là, on parle d'habitudes ») → états **insuffisant · partiel ·
solide**, posés en ft-v1021 **indépendamment**. Et `_volumeParMuscle()` travaille lui aussi sur
**14 jours** (mesuré : fenêtre 20/08 → 02/09, 8 séances).

👉 **Sa fenêtre de 14 jours coïncide avec un seuil déjà en production.** Le moteur doit **réutiliser
ces seuils** (R2/R13), pas en créer de nouveaux.

### ⛔⛔ ③ LA TENDANCE PAR OBJECTIF EXISTE DÉJÀ (son §10) — MAIS ELLE EST FISSURÉE

`renderWeightCorrelations` (tracking.js) calcule une **régression linéaire** du poids en kg/semaine
et la juge **par objectif**. Milo reçoit la même chose (`coach.js`).

**⛔ Mais une seule des six bornes est une DONNÉE.** `_GOAL_TREND_RECOMP = {min:-0.3, max:0}` vit
dans `state.js` et est lue des deux côtés. **Les cinq autres n'existent qu'en PROSE**, dans la
chaîne `goalDir` d'un affichage — et le juge de Milo applique des **seuils différents**, écrits
ailleurs (`wc > 0.05` pour `muscle`).

**MESURÉ, et c'est une contradiction visible à l'écran :**

| objectif | tendance | ce que l'ÉCRAN annonce | ce que MILO reçoit |
|---|---|---|---|
| prise de muscle | +0,2 kg/sem | +0,1 à +0,3 | ✓ bonne direction |
| prise de muscle | **+1,6 kg/sem** | +0,1 à +0,3 | **✓ bonne direction** |
| équilibre | +0,3 kg/sem | ±0,1 | ⚠ à ajuster |

👉 ***+1,6 kg/semaine — cinq fois la borne haute que l'écran affiche juste à côté — est annoncé à
Milo comme « dans la bonne direction ».*** C'est **R4** (l'info reste dans le TEXTE, n'atteint
jamais la DONNÉE) doublé de **R2** (deux sources pour la même règle, qui ont divergé).

⛔ **C'est le seul prérequis réel du moteur**, et ce n'est **pas une invention** : il s'agit de
**transcrire en données les cinq plages déjà écrites et déjà affichées**, puis de faire lire la
même table aux deux juges. *Sans ça, le moteur bâtirait un verdict sur une base qui se contredit.*

### ⭐ ④ LA MÉTRIQUE DE PERFORMANCE EXISTE DÉJÀ — rien à créer (son §7)

Mesuré sur 28 jours réels : le **e1RM est stocké dans chaque série** (`rm1`, **64/64
renseignées**), `bz()` (Brzycki) est en place, le **volume est stocké par séance** (`s.vol`), et
la carte de volume par muscle tourne déjà sur 14 jours.

---

## A — Le moteur

| source | historique ? | minimum retenu | d'où vient ce minimum |
|---|---|---|---|
| **Poids** | oui, daté | 3 pesées / 14 j | seuil **déjà appliqué** (`pts.length<3` → la carte n'affiche rien) |
| **Alimentation** | oui, daté | 3 j pour parler · 14 j pour conclure | `_PA_MIN_JOURS` / `_PA_SOLIDE`, **déjà en prod** |
| **Entraînement** | oui, daté | le même exercice dans les **deux moitiés** | condition **logique**, pas un chiffre |
| **Sommeil** | oui, daté | — | non utilisé en v1 |
| **Tour de taille** | ⛔ **non** | — | **inutilisable** : valeur unique sans date |
| **Bilan d'impédance** | daté, mais | — | écarté à 14 j (**R32**) |

**Quatre états** : `données insuffisantes` · `tendance partielle` · `tendance cohérente` ·
`tendance ambiguë`. ⛔ **Aucun score chiffré** (R32/R33). ⛔ **L'état s'accompagne toujours de sa
fenêtre et de son remplissage** — c'est le défaut de **ft-v1027**, où deux moyennes justes se
contredisaient à 40 px d'écart faute de nommer leur période.

### ⛔⛔ Sur ses §8 et §9 — la position proposée est PLUS STRICTE que la sienne

**En v1, le moteur ne modifie AUCUN apport. Jamais, même avec une tendance robuste.**
① Il écrit lui-même qu'il ne faut pas inventer « +200 kcal » sans justification — **vérifié, aucune
source du projet ne fournit d'incrément**. Le seul ancrage non arbitraire serait une **fraction de
`_GOAL_DELTA_KCAL`** (+350 muscle, −450 perte…), et ça reste à décider.
② `S.manualKcal` existe : **la personne peut corriger elle-même**, en connaissance de cause. Une
correction automatique déciderait à sa place sur un calcul qu'elle ne voit pas (**R29**).

---

## B — Matrice de décision

⚠️ Les plages « attendues » sont **celles que l'app affiche déjà** — transcrites, pas proposées.

| objectif | observé | état | conclusion |
|---|---|---|---|
| perte | −0,4 kg/sem · e1RM stable · 12 j notés | **cohérente** | « rythme cohérent, charges tiennent — ne change rien » |
| perte | −1,2 kg/sem · e1RM −6 % | **cohérente, réserve** | « tu perds plus vite que la plage visée, et tes charges baissent » — ⛔ aucun ajustement auto |
| muscle | +0,2 kg/sem · e1RM +3 % | **cohérente** | « continue comme ça » |
| muscle | **+1,6 kg/sem** · e1RM +1 % | **hors plage** | ⭐ *c'est le cas que l'app annonce aujourd'hui comme « bonne direction »* |
| recomp | −0,1 kg/sem · e1RM +4 % | **cohérente** | la phrase « la balance est le mauvais instrument ici » **existe déjà** |
| recomp | poids stable · e1RM stable · taille **indisponible** | **partielle** | « ces deux-là ne suffisent pas à trancher » — ⛔ aucune conclusion |
| tous | poids ↑ · e1RM ↓ | **ambiguë** | → propose **Analyser avec Milo** |
| tous | 2 pesées · 4 j notés | **insuffisantes** | ⛔ aucune flèche, aucun chiffre |

⭐ **Son cas « poids ↑, taille ↑, force ↑↑ » ne peut pas se produire** tel quel — la taille n'est pas
suivie. Avec les deux signaux disponibles et l'objectif *muscle*, le moteur conclut **cohérent**,
ce qui est le bon comportement : ⛔ *il n'a jamais « tu manges trop » dans son vocabulaire.*

---

## C — Performances : le **meilleur e1RM par exercice, semaine contre semaine**

| candidate | existe ? | robustesse |
|---|---|---|
| **e1RM par série** | ✅ stocké | **la plus robuste** — charge **et** reps, donc immunisée contre son §7 |
| volume par séance | ✅ stocké | trompeur seul : monte quand on **ajoute une série** |
| séries/sem par muscle | ✅ sur 14 j | mesure le **travail**, pas la progression → excellent **garde-fou de contexte** |
| records `S.prs` | ✅ mais | un record est un **maximum historique**, il ne redescend jamais → inutilisable sur 14 j |

**Son exemple, chiffré avec la formule déjà en place** : `100 kg × 1` → **100,0** · `98 kg × 3` →
**103,8**. La charge max dit **−2,0 %**, le e1RM dit **+3,8 %**. *Le piège est évité sans écrire une
ligne.*

⛔ **Deux garde-fous** : ① une baisse de e1RM pendant une semaine à volume effondré est une
**décharge**, pas une régression → état *partielle* ; ② un e1RM se calcule sur une charge arrondie
à 2,5 kg et des reps comptées à l'unité — **le seuil de bruit doit être MESURÉ sur de vrais
historiques, pas choisi**.

Mesuré (28 j, +0,5 kg/séance) : **127,9 → 131,6 → 136,6 → 140,3 kg**. Signal propre et monotone.

---

## D — L'écran : **une carte ajoutée, rien de déplacé**

⛔ On ne refait pas le rangement de **ft-v1025** (2 649 → 1 439 px, « noter » de 1 783 → 415 px).
Une carte **« Ton évolution »** en tête, portant l'état, les trois flèches, **la fenêtre et le
remplissage**, et un « Voir le détail ». Le reste de l'ordre est **inchangé**.

⛔ **Trois interdits** : aucun rouge d'échec ni injonction à « remplir » (**P21**) · **aucune flèche
ni pourcentage** dans l'état *insuffisant* (une flèche est déjà une conclusion) · et le bouton
« noter ce que je mange » **ne descend pas d'un pixel** — à mesurer avant livraison.

---

## E — Appels API

**0** pour tout : calcul des tendances, choix de l'état, rédaction de la phrase, affichage, détail.
**1 seul appel**, sur appui volontaire : **« Analyser avec Milo »** — et **uniquement dans l'état
« ambiguë »**. ⛔ Pas sur *cohérente* (rien à interpréter), pas sur *insuffisante* (**R8** : *un
prompt ne remplace jamais une donnée absente*), pas sur *partielle*. Contexte **compact et chiffré**,
⛔ **jamais le journal alimentaire**.

---

## ⏭️ Ce qui reste à décider avant de coder

1. **Le tour de taille** : on construit son journal, ou le moteur s'en passe ? *(arbitrage produit)*
2. **Le seuil de bruit du e1RM** : à **mesurer** sur de vrais historiques, pas à choisir.
3. **L'ajustement automatique des apports** : proposé **hors v1**, faute d'incrément justifiable.

⛔ **Et le prérequis technique, lui, n'est pas une décision** : les **cinq plages par objectif
doivent descendre de la prose vers la donnée** (§0③), sinon tout le reste s'appuie sur une base
qui se contredit déjà.
