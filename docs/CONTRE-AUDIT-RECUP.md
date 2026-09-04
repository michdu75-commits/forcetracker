# 🔋 Contre-audit du moteur de récupération

> **Créé le 04/09/2026**, version en ligne **ft-v1118**. Répond au brief en 49 sections rédigé par
> GPT et transmis par Michel. **Aucune ligne de code n'a été modifiée** — c'est la contrainte
> explicite du brief (§49), et elle est tenue.
>
> ⭐⭐ **Tout ce qui est chiffré ici sort d'un banc d'essai DÉTERMINISTE** qui appelle la vraie
> fonction `calcRecoveryDetail(refTs)` dans un navigateur, sur l'arbre déployé. **0 appel API,
> 0 €.** Instant de référence figé (aujourd'hui 18 h 00 locales) pour que les nuits et les dates
> ne bougent pas d'une exécution à l'autre. Rien n'est recopié, rien n'est estimé de tête.

---

## 0. Le résumé, pour qui ne lit qu'une page

**Le trou du cardio est réel, et il est plus large que ce que le brief décrit.** Mesuré sur
**18 combinaisons** (3 intensités × 6 durées) : **toutes** rendent exactement la même pénalité,
**−6**, et le même score, **75**. 90 minutes de tapis intense (1 140 kcal) coûtent autant que
10 minutes de marche légère (47 kcal) — et **moins** que 6 séries de développé couché.

**Mais l'audit a trouvé trois défauts que le brief ne demandait pas, et deux d'entre eux sont
plus graves que le cardio.**

| # | Trouvaille | Mesure |
|---|---|---|
| ⛔⛔ **1** | **Une falaise de 6 points à 48 h** | 47,9 h → **79** · 48,0 h → **85** |
| ⛔⛔ **2** | **Le score sature à 0** et cesse de discriminer | grosse séance + 3 j + mauvaise nuit + énergie basse = **0** ; ajouter une FC de repos à +6 bpm ne change **rien** |
| ⛔ **3** | **Une falaise d'entrée** de 4 points | aucune séance **79** → **une seule série** ou **10 min de marche** **75** |
| ⛔ **4** | Le cardio est totalement ignoré | 18 combinaisons, un seul résultat |
| ⛔ **5** | **Seule la DERNIÈRE séance compte** | deux séances de 20 séries de plus dans les 3 derniers jours coûtent **4 points au total** |
| ⛔⛔ **6** | **`RECUP_EFFACE_H` a un lecteur qui ne le lit pas** | `projectionRecup` écrit **48 en dur, deux fois** — changer la constante désynchroniserait la date annoncée du score |

**La falaise de 48 h est la trouvaille la plus embarrassante du projet** : c'est *exactement* la
famille de défaut que Force Tracker a corrigée le 30/07/2026 sous le nom de **« marche de midi »**
(ft-v671 : *« le score faisait +7 points d'un coup à 12 h 01 »*). Elle a été déplacée, pas
supprimée — le saut vit maintenant à la frontière des 48 h, et **personne ne l'a mesurée depuis**.

---

## 1. Explication exacte du moteur actuel

Le score est une **somme d'ajustements** appliqués à un socle, puis bornée à 0-100.

```
score = borne_0_100( socle_sommeil
                   + séance_récente_ou_repos
                   + âge + cycle + jours_enchaînés + tabac
                   + énergie_dernière_séance + forme_du_jour
                   + fc_repos )
```

### 1.1 Le socle — les 3 dernières nuits

- Union de `S.sleepLog` (saisie) et `S.healthDaily` (mesure montre). La **durée mesurée gagne**
  sur la durée saisie ; la **qualité n'est jamais dérivée** d'une mesure.
- Chaque nuit : `_sleepCurve(durée)` × 0,6 + `qualité` × 0,4, la qualité étant mappée
  `[15, 15, 45, 75, 100]`. **Qualité absente → la durée seule**, jamais une qualité moyenne.
- Pondération des 3 nuits : **0,6 / 0,3 / 0,1**.
- **Aucune nuit connue → socle neutre de 70**, assumé par le produit.

`_SLEEP_ANCHORS = [[0,0],[4,18],[5,35],[6,55],[7,72],[8,90],[9,100],[10,96],[12,85]]`,
interpolation linéaire. **Mesuré : 6 h 59 → 73 · 7 h 00 → 73 · 7 h 01 → 73.** Aucune falaise.

### 1.2 La dernière séance

⚠️ **`_derniereSeanceAvant()` ne rend QU'UNE séance.** Tout ce qui précède n'existe que par le
facteur « jours enchaînés ». C'est la trouvaille n°5 ci-dessus, et elle change la lecture de
plusieurs autres facteurs.

- Si la séance porte une heure : la pénalité s'efface **linéairement sur `RECUP_EFFACE_H = 48` h**.
- Au-delà de 48 h **et** 2 jours calendaires : **bonus de repos** `min(jours,4) × 3`, soit
  +6 / +9 / +12.
- Séance sans heure (import, vieil historique) : ancien barème par jour.

### 1.3 `_penaliteSeance` — le cœur du problème

```js
load = Σ séries validées   (échauffement É et W exclus ; échec ×1,5 ; drop ×1,3)
pénalité = max(6, min(38, round(load × 1,7)))
```

**Elle ne voit RIEN d'autre** : ni charge, ni répétitions, ni muscles, ni durée, ni densité,
**ni cardio**.

---

## 2. Archéologie des constantes (§48.2)

⚠️ **L'historique Git du dépôt ne remonte qu'au 28/08/2026** (383 commits, premier commit `86e1857`). La mémoire réelle du
projet est le **journal des versions** (`docs/JOURNAL-ARCHIVE.md`, 642 entrées) — c'est lui qui a
été fouillé.

| Constante | Version | Date | Ce qui l'a motivée, dans les mots du journal |
|---|---|---|---|
| **pénalité proportionnelle** (fin du −25 fixe) | `ft-v254` | 06/07/2026 | Michel : *« juste des abdos donnait le même résultat qu'un gros leg day »*. Objectif écrit : *« d'environ −10 pour une petite séance (abdos) à −30 pour une grosse »*. |
| **×1,7** | `ft-v254` | 06/07/2026 | ⚠️ **Jamais justifié explicitement.** Il se **déduit** des deux ancres ci-dessus : 6 séries × 1,7 ≈ 10 (les « abdos »), 18 séries × 1,7 ≈ 30 (le plafond de l'époque). *C'est un coefficient d'ajustement à deux points, pas une grandeur physiologique.* |
| **échec ×1,5 · drop ×1,3** | `ft-v254` | 06/07/2026 | Introduits dans le même geste, sans mesure documentée. |
| **plancher 6** | ⚠️ **origine INTROUVABLE** | — | Aucune entrée de journal ne le mentionne. **R30 s'applique : ne pas le supprimer sans avoir retrouvé la décision.** Son effet, lui, est mesuré (§3.3). |
| **plafond 30** | `ft-v254` | 06/07/2026 | Idem. |
| **niveau ×1,15 / ×0,85** | `ft-v256` | 06/07/2026 | *« débutant récupère plus lentement d'un même volume, confirmé a plus de capacité »*. **Aucune mesure.** |
| **jours enchaînés −4 / −8** | `ft-v256` | 06/07/2026 | Même entrée, même jour, aucune mesure. |
| **tabac −4** | `ft-v256` | 06/07/2026 | Idem. |
| **énergie −6 / −3 / +4** | `ft-v256` | 06/07/2026 | Idem. |
| **âge** | antérieur à `ft-v256` | — | L'entrée dit *« s'ajoute à l'âge et au cycle menstruel déjà pris en compte »*. Origine non retrouvée. |
| **effacement dans la journée** | `ft-v286` | ~08/07/2026 | Michel : *« le score n'augmente pas dans la journée, il devrait évoluer non ? »*. 1ʳᵉ formule : `pen × (1 − min(0,5 ; hrs/14 × 0,5))`. |
| **effacement CONTINU, fin de la « marche de midi »** | `ft-v671` | 30/07/2026 | *« le score faisait +7 points d'un coup à 12 h 01 (mesuré : 55 → 62) »*. Effacement continu sur **36 h**. ⚠️ **C'est là que la falaise actuelle est née** : le barème bascule du régime « pénalité » au régime « bonus » à une frontière nette. |
| **plafond 30 → 38 · 36 h → 48 h** | `ft-v718` | ~02/08/2026 | Michel : *« le prêt à performer déconne, il est trop optimiste »*. **Mesuré sur 10 profils types** : *« bien dormi + 24 séries de squat hier → 77, Bonne récup »*. C'est la seule constante du lot dont le changement a été **mesuré avant et après**. |
| **courbe de sommeil continue** | `ft-v718` | ~02/08/2026 | *« 6 h 54 → 53, 7 h 00 → 77 : 24 points pour six minutes de sommeil »*. |
| **plafond atteignable affiché** | `ft-v952` | 21/08/2026 | Michel : *« il faudrait rajouter la donnée où on arrive à 100 (bon sauf moi qui suis fumeur) »*. |

**⭐ Ce que cette archéologie apprend, et qui compte plus que les nombres** : **onze des treize
constantes datent du même week-end (06/07/2026) et n'ont jamais été mesurées.** Les deux qui
l'ont été (`ft-v671`, `ft-v718`) sont précisément celles qui avaient produit un défaut visible.
*Le moteur n'a pas été calibré : il a été réparé deux fois, aux endroits où quelqu'un a crié.*

**⚠️ Et aucune n'a été calibrée sur autre chose que Michel.** Les « 10 profils types » de
ft-v718 étaient des profils **construits**, pas des utilisateurs.

---

## 3. Le banc d'essai, en chiffres

### 3.1 Le cardio — 18 combinaisons, un seul résultat

*Référence sans aucune séance : **79**.*

| intensité | MET | 10 min | 20 | 30 | 45 | 60 | 90 |
|---|---|---|---|---|---|---|---|
| léger | 3,5 | 75 | 75 | 75 | 75 | 75 | 75 |
| modéré | 5,5 | 75 | 75 | 75 | 75 | 75 | 75 |
| intense | 9,5 | 75 | 75 | 75 | 75 | 75 | 75 |

Pénalité : **−6 partout**. Pour mémoire, ce que l'app **sait déjà** de ces mêmes séances :

| | MET·min | kcal (80 kg) |
|---|---|---|
| 10 min léger | 35 | 47 |
| 45 min modéré | 248 | 330 |
| 90 min intense | **855** | **1 140** |

👉 ***L'écart entre le moins et le plus fatigant du tableau est de 24 fois en MET·min, et de
0 point sur le score.***

### 3.2 La musculation — le barème actuel

| séries | 1 | 2 | 4 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 30 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| pénalité | −6 | −6 | −7 | −10 | −14 | −17 | −20 | −27 | −34 | **−38** | **−38** |
| score | 75 | 75 | 75 | 73 | 71 | 69 | 67 | 63 | 59 | 57 | 57 |

Type de série, à 12 séries : **N −20 · D −27 · E −31**. Le plafond mord dès **23 séries**
normales — au-delà, plus rien ne distingue 24 séries de 40.

### 3.3 Les deux falaises

**① À 48 heures — 6 points en un dixième d'heure :**

| heures depuis la séance (20 séries) | 46 | 47 | 47,5 | 47,9 | **48,0** | 48,1 | 49 | 50 |
|---|---|---|---|---|---|---|---|---|
| score | 78 | 78 | 79 | 79 | **85** | 85 | 85 | 85 |

Cause : en dessous de 48 h le régime est *« pénalité résiduelle »* (qui tend vers 0) ; au-dessus,
le régime devient *« bonus de repos »* (+6 d'un coup). **Les deux régimes ne se raccordent pas.**

Vue d'ensemble de l'effacement (20 séries) — la pente est propre… jusqu'à la marche :
`0 h = 45 · 6 h = 49 · 12 h = 53 · 18 h = 58 · 24 h = 62 · 30 h = 66 · 36 h = 70 · 42 h = 75 ·
47 h = 78 · **48 h = 85** · 60 h = 85 · 72 h = 88`

**② À l'entrée en « séance » — 4 points pour presque rien :**

| | score |
|---|---|
| aucune séance | **79** |
| **une seule série** normale | **75** |
| **10 min** de tapis léger | **75** |
| **90 min** de tapis intense | **75** |

C'est le plancher de 6 : dès qu'une séance existe, elle coûte au moins 6 points, et *tout ce qui
est en dessous de ~3,5 séries est aplati sur la même valeur*.

### 3.4 Les profils demandés (§28)

| profil | score | détail |
|---|---|---|
| **A** 22 ans débutant · 8 h · 10 séries | **73** | Sommeil 84 · Séance −11 |
| **B** 48 ans confirmé · 7 h · 15 séries | **57** | Sommeil 73 · Séance −13 · Âge −3 |
| **C** 65 ans entraîné · 8 h · 8 séries | **68** | Sommeil 84 · Séance −7 · Âge −9 |
| **D** 30 ans F · règles · 5 h qualité 1 · 6 séries | **11** | Sommeil 27 · Séance −6 · Cycle −10 |
| **E** 45 min tapis modéré | **75** | Sommeil 79 · Séance **−4** |
| **F** 20 min tapis modéré | **75** | Sommeil 79 · Séance **−4** |
| **G** 10 min cardio léger + 15 séries | **64** | Séance −15 |
| **H** 45 min cardio **intense** + 15 séries | **64** | Séance −15 |
| **I** confirmé · 24 séries jambes · 9 h qualité 4 · forme ⚡ | **85** | Sommeil 100 · Séance −19 · Forme +4 |
| **J** 4 séries · 4 h qualité 1 · énergie 😴 | **3** | Sommeil 17 · Séance −4 · Forme −10 |
| **K** aucune donnée sauf la séance | **58** | Base 70 · Séance −12 |

**Les deux tests explicites du brief échouent** :
- **E doit être plus pénalisé que F** → **75 = 75**. ❌
- **H doit montrer une charge supérieure à G** → **64 = 64**. ❌

**Deux résultats méritent d'être discutés au-delà du cardio** :
- **I → 85 après 24 séries de jambes.** Excellente nuit et bonne forme suffisent à effacer la plus
  grosse séance possible. *C'est exactement le symptôme que ft-v718 disait avoir corrigé.*
- **J → 3/100** et **D → 11/100**. Le brief demande que « petite séance ≠ forcément bonne récup » :
  c'est obtenu, mais par un score qui frôle zéro. **Un 3/100 n'est pas une information, c'est une
  alarme** — et il vient d'un seul tap sur 😴 combiné à une mauvaise nuit.

### 3.5 Données manquantes (§32)

| | score | socle affiché |
|---|---|---|
| tout renseigné (12 séries) | 67 | Sommeil 79 |
| **sans sommeil** | 58 | **Récup de base 70** |
| sommeil sans qualité (montre seule) | 69 | Sommeil 81 |
| sans séance | 79 | Sommeil 79 |
| **sans rien du tout** | **70** | Récup de base 70 |

✅ **Le principe « inconnu ≠ moyen » est tenu partout sauf à un endroit, assumé** : le socle
neutre de 70. Il est **affiché comme tel** (« Récup de base ») et un conseil invite à renseigner
le sommeil. ⚠️ Mais il reste une valeur inventée qui produit *« 70/100, bonne récupération »*
pour quelqu'un dont on ne sait **rien** — c'était déjà noté comme non traité en ft-v718.

### 3.6 Cumul des facteurs — y a-t-il double comptage ? (§25, §40)

| état | score | facteurs |
|---|---|---|
| grosse séance hier (20 séries) | 59 | Séance −20 |
| + énergie 😴 aujourd'hui | 49 | Séance −20 · Forme −10 |
| + **3 jours enchaînés** (3 × 20 séries) | 55 | Séance −20 · **Jours enchaînés −4** |
| + 3 jours enchaînés + énergie 😴 | 45 | −20 · −4 · −10 |
| + 3 j + 😴 + mauvaise nuit (5 h, qualité 1) | **0** | Sommeil 27 · −20 · −4 · −10 |
| … **et la même chose avec FC repos +6 bpm** | **0** | **−8 supplémentaires, aucun effet** |

**Deux conclusions, et elles vont dans des directions opposées :**

**⛔ Il n'y a PAS de double comptage — il y a un SOUS-comptage.** Ajouter **deux séances de
20 séries** dans les trois derniers jours coûte **4 points au total** (59 → 55). C'est mécanique :
seule la dernière séance produit une pénalité, les autres n'existent que par le forfait
« jours enchaînés ». *Le moteur ne cumule pas la charge, il la remplace.*

**⛔⛔ En revanche le score SATURE.** À partir du 5ᵉ état il vaut 0, et le facteur suivant — la
FC au repos, le **seul signal physiologique mesuré** de tout le système — **ne change rien**.
👉 ***Le score cesse de discriminer exactement là où la personne aurait le plus besoin qu'il
discrimine.***

### 3.7 Niveau, âge, tabac isolés

| | avec 12 séries | sans séance |
|---|---|---|
| débutant / intermédiaire / confirmé | **65 / 67 / 69** | 79 / 79 / 79 |
| 25 / 45 / 55 / 65 ans | 67 / 64 / 61 / 58 | 79 / 76 / 73 / 70 |
| non-fumeur / fumeur | 67 / 63 | — |

Plafond réellement atteignable (9 h, qualité 4, aucune séance) :
**25 ans non-fumeur → 100 · 48 ans fumeur → 93 · 65 ans fumeur → 87.**

**Le facteur niveau ne vaut que 4 points d'écart** entre un débutant et un confirmé sur la même
séance. Le débat du §9 du brief (« est-il défendable qu'un confirmé subisse 15 % de moins ? »)
porte donc sur un effet **plus petit que l'arrondi du socle sommeil**.

### 3.8 Continuité et monotonicité (§29, §30)

| test | résultat |
|---|---|
| sommeil 6 h 59 / 7 h 00 / 7 h 01 | 73 / 73 / 73 ✅ |
| séries 11 / 12 / 13 | 68 / 67 / 66 ✅ |
| cardio 19 / 20 / 21 puis 44 / 45 / 46 min | 75 partout — **plat, donc « continu » sans rien mesurer** ⚠️ |
| **47,9 h / 48,0 h depuis la séance** | **79 / 85** ❌ |
| 90 min intense **vs** 6 séries de développé | **75 vs 73** ❌ monotonicité violée |

---

### 3.9 ⛔⛔ Le piège caché des 48 h — la constante a un lecteur qui ne la lit pas

Le brief demande (§8) si 48 h reste raisonnable. **Avant de répondre, il faut savoir ce qu'il se
passerait si on y touchait — et la réponse est : une incohérence silencieuse.**

`RECUP_EFFACE_H = 48` a été créée le **01/09/2026** précisément pour qu'il n'y ait qu'un seul
propriétaire de cette durée : *« deux nombres pour une même règle finissent toujours par diverger,
et c'est celui que la personne LIT qui avait tort (R2) »*. Le calcul et la phrase affichée la
lisent bien.

⛔ **Mais un troisième lecteur existe et ne la lit pas.** `projectionRecup()` — la fonction qui
annonce *« tu seras au maximum à telle heure »* — écrit :

```js
const hFin = Math.max(0, 48 - 24/Math.max(1,pen)) + 1/60;
```

**Deux littéraux** : le `48`, et le `24` qui n'est autre que `48 ÷ 2` (l'instant où la pénalité
arrondie tombe sous 0,5). Passer `RECUP_EFFACE_H` à 36 ou à 60 laisserait donc la projection
annoncer une date calculée sur **48**, pendant que le score, lui, aurait changé.

👉 ***C'est le même défaut que celui corrigé le 01/09, réapparu à trois lignes de sa propre
correction*** — et il ne se voit pas, parce que tant que personne ne touche à la constante, les
deux nombres coïncident. *Une constante n'est un propriétaire unique que si TOUS ses lecteurs la
lisent.*

⛔ **Conséquence pour ce contre-audit** : **toute** décision qui touche à la durée d'effacement,
y compris la correction du raccord (option A n°2), doit passer par cette fonction. Elle n'est pas
optionnelle.

---

## 4. Classement CHARGE / RÉPONSE / CONTEXTE (§40)

| facteur | nature | commentaire |
|---|---|---|
| séries validées | **CHARGE** | seul canal réel aujourd'hui |
| type de série (É/D/E) | **CHARGE** | modulateur d'intensité |
| cardio | **CHARGE** | ⛔ **non branché** |
| effacement 48 h | **CHARGE** (décroissance) | la falaise vit ici |
| jours enchaînés | **CHARGE** | ⚠️ seul canal pour les séances antérieures à la dernière |
| sommeil (durée) | **RÉPONSE** + contexte | mesuré ou déclaré |
| qualité de sommeil | **RÉPONSE** | subjectif, jamais inventé |
| énergie dernière séance | **RÉPONSE** | ≤ 1 jour |
| forme du jour | **RÉPONSE** | le plus lourd des subjectifs (−10) |
| FC au repos | **RÉPONSE** | le seul signal physiologique · **noyé par la saturation** |
| âge | **CONTEXTE** | permanent, non individualisé |
| niveau | **CONTEXTE** | modulateur de charge |
| tabac | **CONTEXTE** | permanent |
| cycle menstruel | **CONTEXTE** | prior de population |
| douleur | **ni l'un ni l'autre** | ✅ n'entre pas dans le score — décision à conserver |

**⭐ Le déséquilibre saute aux yeux une fois classé** : la colonne CHARGE ne contient qu'**un**
canal réellement quantifié (les séries), et la colonne RÉPONSE en contient **cinq**. Le moteur
mesure beaucoup mieux comment la personne se sent que ce qu'elle a fait.

---

## 5. Le tableau demandé (§39)

| Facteur | Actuel | Problème mesuré | Conserver ? | Modifier ? | Justification |
|---|---|---|---|---|---|
| **socle sommeil** | 3 nuits 0,6/0,3/0,1 · durée 60 % / qualité 40 % | aucun défaut trouvé | ✅ oui | non | continuité vérifiée (73/73/73), sources hiérarchisées, inconnu jamais comblé |
| **courbe `_SLEEP_ANCHORS`** | 9 ancres, interpolation | — | ✅ oui | non | corrigée sur mesure en ft-v718, elle tient |
| **socle neutre 70** | sans sommeil | affirme « bonne récup » sans rien savoir | ⚠️ | **à trancher produit** | déjà signalé non traité en ft-v718 ; c'est le seul « inconnu = moyen » du moteur |
| **séries validées** | `load` | ne voit ni charge ni reps | ✅ oui | plus tard | c'est le canal le plus robuste et le moins coûteux à saisir |
| **échec ×1,5 · drop ×1,3** | multiplicateurs | jamais mesurés | ✅ oui | non | ordre de grandeur plausible, effet borné, rien ne suggère qu'ils nuisent |
| **×1,7** | `load × 1,7` | coefficient à 2 ancres, non documenté | ✅ oui | **non, surtout pas seul** | le changer déplace tout l'historique ; **il ne se retouche que si l'unité de charge change** |
| **plancher 6** | `max(6, …)` | **falaise de 4 points à l'entrée** (79→75) · aplatit 1 à 3 séries | ⚠️ | **oui** | ⛔ **origine introuvable dans le journal — R30 : demander avant de retirer** |
| **plafond 38** | `min(38, …)` | mord dès 23 séries | ✅ oui | non | seule constante **mesurée avant/après** (ft-v718) |
| **48 h** | effacement linéaire | **falaise de 6 points** au raccord · **et deux littéraux `48` dans `projectionRecup`** | ✅ la durée | **oui, le RACCORD** | ce n'est pas 48 qui est faux, c'est la discontinuité — et la constante doit devenir vraiment unique |
| **bonus repos +6/+9/+12** | `min(j,4)×3` | crée la falaise | ✅ oui | **oui, le rendre continu** | mêmes valeurs aux extrémités, pente au milieu |
| **niveau ×1,15/×0,85** | modulateur | 4 points d'écart, jamais mesuré | ⚠️ | **plus tard** | l'app possède un meilleur proxy : le volume habituel **de cette personne** |
| **âge −3/−6/−9** | permanent | jamais mesuré, non individualisé | ✅ oui | **plus tard** | c'est un *prior* de population, honnête tant qu'on n'a rien de mieux ; le plafond est déjà affiché |
| **tabac −4** | permanent | jamais mesuré | ✅ oui | non | cohérent avec le +7 % fumeur du métabolisme de base, effet petit |
| **cycle −10/−5/+2/+4** | prior | impose la même réponse à toutes | ✅ oui | **plus tard** | même raisonnement que l'âge ; la réponse observée doit primer quand elle existe |
| **jours enchaînés −4/−8** | forfait | ⚠️ **sous-compte massivement** (2 grosses séances = 4 points) | ⚠️ | **oui** | il ne double pas la charge, il la **remplace** |
| **énergie dernière séance** | −6/−3/+4 | — | ✅ oui | non | signal de réponse, borné |
| **forme du jour** | −10/−4/0/+4 | le plus lourd des subjectifs | ✅ oui | ⚠️ | contribue à la saturation à 0 |
| **FC au repos ±8** | écart à sa médiane | ✅ excellente philosophie | ✅ oui | non | ⚠️ mais **noyée** quand le score sature |
| **douleur** | hors score | ✅ | ✅ oui | non | décision à graver, pas à revoir |

---

## 6. Ce qui est défendable · arbitraire · défectueux (§48.3-5)

### ✅ Défendable, à ne pas toucher
- La **hiérarchie des sources** de sommeil (mesure > saisie, qualité jamais dérivée).
- **Inconnu ≠ moyen**, tenu partout sauf le socle neutre assumé.
- La **FC au repos comparée à soi-même**, avec minimum de 7 jours, médiane, effet borné.
- La **douleur hors du score**.
- Le **plafond atteignable affiché** (100 n'existe pas pour tout le monde).
- Le fait que `calcRecoveryDetail` **rende le détail facteur par facteur** — c'est ce qui rend le
  score explicable, et c'est rare.

### ⚠️ Arbitraire mais raisonnable
- `×1,7`, `−4` tabac, `−3/−6/−9` âge, `±1,15/0,85` niveau, `−4/−8` jours enchaînés : aucun n'est
  mesuré, **tous sont de petite amplitude et vont dans le sens attendu**. Les changer sans données
  reviendrait à remplacer un arbitraire par un autre.

### ⛔ Clairement défectueux
1. **Le cardio ignoré** (18 combinaisons identiques).
2. **La falaise de 48 h** (6 points).
3. **La saturation à 0** (le signal le plus objectif devient inopérant).
4. **La falaise d'entrée** (4 points pour une série).
5. **Le sous-comptage de la charge accumulée** (seule la dernière séance compte).

---

## 7. Analyse spécifique cardio (§48.8, §19-21)

**Le brief a raison de refuser `pénalité = kcal / constante`.** Mesuré :

| 45 min tapis modéré | MET·min | kcal |
|---|---|---|
| 60 kg | 248 | 248 |
| 80 kg | 248 | 330 |
| 100 kg | 248 | **413** |

Les kcal varient de **+67 %** entre 60 et 100 kg pour **exactement le même effort relatif**. Les
**MET·min ne bougent pas**. 👉 **Les MET·min sont la bonne base de charge cardio**, et c'est une
conclusion mesurée, pas une préférence.

⚠️ **Ce que les MET·min ne disent pas** : ils ne distinguent pas 45 min continues d'un HIIT de
45 min à la même moyenne, et ils ignorent l'impact mécanique (course vs vélo). *On ne prétendra
donc pas mesurer une fatigue physiologique — on mesure une charge externe, ce qui est exactement
la distinction du §37 du brief.*

**⛔ Et il manque un nombre que je ne peux pas produire.** Aucune publication ne donne
« X MET·min = Y points de récupération ». Le seul ancrage disponible est **l'échelle interne du
projet** (6 → 38, où 38 = 24 séries de jambes). Le convertir demande **une décision de Michel**,
formulable en une phrase :

> **« 45 minutes de tapis modéré doivent coûter à peu près autant qu'une séance de ___ séries. »**

Tout le reste en découle mécaniquement. Trois réponses plausibles, avec ce qu'elles donnent :

| si 45 min modéré ≈ | facteur MET·min → séries | 20 min modéré | 45 min modéré | 90 min intense | 10 min léger |
|---|---|---|---|---|---|
| **6 séries** | ÷ 41 | −6 (plancher) | −10 | −35 | −6 |
| **10 séries** | ÷ 25 | −7 | −17 | −38 (plafond) | −6 |
| **15 séries** | ÷ 17 | −11 | −25 | −38 (plafond) | −6 |

*(Lecture : `charge_cardio_en_séries = MET·min ÷ facteur`, puis exactement la même formule que la
musculation — même ×1,7, même plancher, même plafond. **Aucun nouveau mécanisme, une seule
échelle** — R13/R2.)*

**⭐ Le point important de ce tableau n'est pas le chiffre, c'est que les trois colonnes rendent
le moteur monotone et continu** : E devient plus pénalisé que F, H plus que G, et 90 min intense
plus qu'une série de développé. Les trois réparent les deux tests échoués du brief.

**Sur les séances mixtes (§20)** : les deux charges s'**additionnent dans la même unité** avant
le plafond. `10 min léger (35 MET·min ÷ 25 = 1,4) + 15 séries = 16,4 séries équivalentes`, contre
`45 min intense (428 ÷ 25 = 17) + 15 = 32`. L'échauffement léger ne pèse presque rien, ce qui est
le comportement demandé, et **il n'y a pas de double comptage** puisqu'il n'y a qu'une somme.

**⛔ Et l'interface ne doit jamais afficher « 45 min de tapis = 10 séries »** (§21). C'est une
unité **interne** de charge, pas une équivalence physiologique. Le détail affiché dira
*« Cardio −17 »* à côté de *« Séance −20 »*, sans jamais les traduire l'un dans l'autre.

---

## 8. Analyse spécifique musculation (§48.9, §18)

**Ce qui est déjà là et suffit** : le **nombre de séries** est le prédicteur le plus robuste et le
moins coûteux. Rien dans les mesures ne suggère qu'il faille le remplacer.

**Ce que l'app possède et qui pourrait s'ajouter, par ordre de rapport valeur/risque** :

| candidat | disponible ? | verdict |
|---|---|---|
| **% du e1RM** | ✅ `S.prs[ex].rm1` existe, et `getExerciseMET` s'en sert **déjà** pour les calories | ⭐ **le meilleur candidat** : relatif à la personne, déjà calculé ailleurs, déjà éprouvé (ft-v879) |
| **RIR / RPE** | ⚠️ facultatif, saisi par intermittence | à n'utiliser **que s'il est là**, jamais inventé |
| **muscles sollicités** | ✅ `_mscScores`, 324 exercices | ⭐ **la seule voie vers la récupération LOCALE** (§9 ci-dessous) |
| **durée / densité** | ✅ mesurée depuis ft-v874 | contexte, effet probablement faible |
| **tonnage** | ✅ | ⛔ **à écarter** : mesuré en ft-v879, `r = +0,076` avec les calories ; c'est un chiffre absolu qui ne veut rien dire d'une personne à l'autre |
| **temps de repos** | ✅ | complexité > gain attendu |

**⚠️ Une leçon du projet s'applique directement ici** : en ft-v879, la modulation par le % du max
a été livrée avec un effet mesuré de **−3 kcal médians** — *« on ne vend pas plus que ce qu'on
livre »*. Il faut s'attendre au même ordre de grandeur ici : ajouter le %1RM à la pénalité
changera le score de **quelques points**, pas de vingt.

---

## 9. Récupération globale vs locale (§17, §48.10)

**La donnée existe déjà, entièrement.** `_mscScores(exs)` rend un score par groupe musculaire
pour n'importe quelle liste d'exercices, et il est **déjà relu à 13 endroits** (figurine,
calendrier, calories, écran Progrès, contexte de Milo — voir **R31**).

**Ce qui manque n'est donc pas la donnée, c'est la décision produit.** Deux questions, aucune
technique :

1. **Deux chiffres ou un ?** Un second score visible double la surface d'explication et peut se
   contredire avec le premier (*« récup 80 mais quadriceps 30 »* — laquelle croire ?).
2. **Que faire du résultat ?** La récupération locale n'a de valeur que si elle **change une
   proposition** (« aujourd'hui plutôt haut du corps »). Sans ça, c'est un chiffre de plus.

**⭐ Recommandation** : ne PAS créer un second score. La récupération locale est utile comme
**avertissement contextuel**, exactement comme la douleur l'est déjà : *« tes quadriceps ont pris
cher avant-hier »*. Le mécanisme d'affichage existe (le bandeau ⚠️), la donnée existe, et ça ne
crée aucune nouvelle source de vérité (**R2**).

⛔ **Ce n'est pas dans les options A/B/C ci-dessous** : c'est un chantier produit séparé, à
décider après.

---

## 10. Individualisation selon l'historique (§22, §46, §48.11)

**Ce que l'app possède déjà, et qui est directement exploitable** :
`S.sessions` (jusqu'à 1 500 séances), `S.sleepLog`, `S.healthDaily`, `S.dayStateLog`, les
check-ins d'énergie, les records datés.

**⭐ La piste la plus simple, la plus robuste et la plus honnête : le volume HABITUEL de la
personne.** Le moteur juge aujourd'hui « 15 séries » de la même façon pour quelqu'un qui en fait
10 d'habitude et pour quelqu'un qui en fait 25. Or la médiane de ses 20 dernières séances est
gratuite à calculer, déterministe, et **remplace avantageusement le facteur « niveau »** — qui
est déclaratif, jamais vérifié, et ne vaut que 4 points.

Forme possible, **bornée et réversible** :
`facteur = borne(0,85 ; 1,15 ; charge_de_la_séance ÷ médiane_de_ses_20_dernières)`

- même amplitude que le facteur « niveau » actuel → **aucun choc sur l'historique** ;
- **exige un minimum de séances** (10 ?), sinon il ne s'applique pas — inconnu ≠ moyen ;
- explicable en une phrase : *« cette séance est plus grosse que d'habitude pour toi »*.

**⛔ Ce que je NE recommande PAS** : apprendre depuis la *réponse* (énergie du lendemain, FC,
performance). Le brief le propose (§23) et c'est séduisant, mais :
- la boucle est **fermée sur elle-même** — l'énergie du lendemain influence déjà le score, donc
  s'en servir pour recalibrer le score revient à faire dépendre le modèle de sa propre sortie ;
- il faudrait des dizaines de points par personne avant de distinguer un signal du bruit ;
- et **rien ne permet de le valider** : on n'a pas de vérité terrain. *Un apprentissage qu'on ne
  peut pas contredire n'est pas un apprentissage, c'est une dérive lente et invisible.*

---

## 11. Les trois options (§41)

### OPTION A — corriger ce qui est certain

1. **Brancher le cardio** en MET·min sur l'échelle existante (§7).
2. **Supprimer la falaise de 48 h** en rendant le raccord continu.
3. **Adoucir la falaise d'entrée** (le plancher de 6).

| | |
|---|---|
| **Bénéfice** | les 5 défauts « clairement défectueux » sauf la saturation et le sous-comptage |
| **Complexité** | faible — une fonction de charge cardio, un raccord, un plancher |
| **Risque** | faible, mais **l'historique bouge** : toute séance de cardio recalculée descend |
| **Données** | aucune nouvelle |
| **Décision de Michel** | **UN nombre** : 45 min de tapis modéré ≈ combien de séries ? |
| **Tests** | balayage cardio 18 cas · continuité aux 3 frontières · non-régression muscu |

### OPTION B — A + la charge devient cumulative et bornée

4. **La charge des 3 derniers jours s'additionne** au lieu que seule la dernière séance compte
   (chacune décroissant sur ses propres 48 h) — et le forfait « jours enchaînés » **disparaît**,
   puisqu'il devient redondant.
5. **Borner l'ensemble des ajustements négatifs de RÉPONSE** pour que le score cesse de saturer à
   0 et que la FC au repos reste lisible.

| | |
|---|---|
| **Bénéfice** | supprime le sous-comptage **et** la saturation ; le score reste informatif en bas |
| **Complexité** | moyenne — une boucle sur les séances récentes, une borne |
| **Risque** | **moyen** : l'historique bouge davantage ; un enchaînement de grosses séances descendra plus bas qu'avant |
| **Données** | aucune nouvelle |
| **Compatibilité** | ⚠️ à mesurer avant/après sur les journées réelles de Michel (§42) |
| **Tests** | ceux de A + cumul 1/2/3 séances + le plancher du score |

### OPTION C — B + individualisation par le volume habituel

6. **Remplacer le facteur « niveau »** par le rapport à **sa propre** médiane de volume (§10),
   avec minimum de séances et bornes identiques.
7. **Ajouter le % du e1RM** à la charge d'une série, sur le modèle exact de ft-v879.

| | |
|---|---|
| **Bénéfice** | le moteur cesse de juger tout le monde à la même aune ; c'est ce que demande le §22 |
| **Complexité** | moyenne+ |
| **Risque** | ⚠️ **effet probablement modeste** (ft-v879 : −3 kcal médians pour un travail comparable) et **historique déplacé une 3ᵉ fois** |
| **Données** | déjà présentes (`S.prs`, `S.sessions`) |
| **Tests** | ceux de B + profils à volume habituel différent + absence d'historique |

---

## 12. Recommandation

**Livrer A maintenant, préparer B, différer C.**

**Pourquoi A d'abord** : les trois défauts qu'elle corrige sont **certains, mesurés et
reproductibles**, et aucun ne demande une hypothèse sur la physiologie — seulement un ancrage
produit. Elle ne touche à **aucune** constante existante de la musculation : `×1,7`, `38`, les
multiplicateurs de série et le socle sommeil restent intacts, donc **l'historique de musculation
ne bouge pas d'un point**.

**Pourquoi B ensuite et pas tout de suite** : le sous-comptage est réel, mais le corriger déplace
l'historique **de tout le monde** et rend le score plus sévère pour les gens qui s'entraînent
souvent — c'est-à-dire les plus assidus. *Ce genre de changement se mesure sur des données réelles
avant d'être livré* (§42), et Michel est le seul à en avoir.

**Pourquoi C est différé** : la mesure de ft-v879 dit ce qu'il faut attendre — quelques points.
L'individualisation par le volume habituel est la seule partie de C dont le rapport
valeur/complexité est clairement favorable ; le %1RM peut attendre.

**⛔ Et une chose n'est pas dans les options, exprès** : le socle neutre de 70 quand aucun sommeil
n'est connu. C'est le seul « inconnu = moyen » du moteur, il est signalé depuis ft-v718, et
**c'est une décision de produit, pas une correction** — l'alternative est de ne pas afficher de
score du tout tant que rien n'est renseigné, ce qui a son propre coût.

---

## 13. Impact sur l'historique (§42)

⚠️ **`calcRecoveryDetail(refTs)` recalcule les scores passés à la volée** : il n'existe aucun
`recupLog`. Changer le barème **réécrit donc toute la courbe historique**, silencieusement.

| option | ce qui bouge | ampleur attendue |
|---|---|---|
| **A** | uniquement les jours avec **cardio** ; et le raccord des 48 h | forte sur les jours de cardio (jusqu'à −32 points sur un 90 min intense), nulle ailleurs |
| **B** | tous les jours suivant **plusieurs séances rapprochées** | modérée, dans le sens plus sévère |
| **C** | tous les jours avec séance | faible mais partout |

**Avant toute livraison** : rejouer les **60 derniers jours réels de Michel** avec l'ancien et le
nouveau moteur, et regarder la courbe des deux — pas seulement des tests verts (§43).

---

## 14. Fichiers et fonctions concernés (§48.17)

| fichier | fonction | ce qui changerait |
|---|---|---|
| `tracking.js` | `_penaliteSeance` | accepter une charge cardio en plus des séries |
| `tracking.js` | *(nouvelle)* `_chargeCardio(sess)` | MET·min → charge, un seul propriétaire (R2) |
| `tracking.js` | `calcRecoveryDetail` | raccord continu 48 h ; en B : boucle sur les séances récentes + borne |
| `tracking.js` | `RECUP_EFFACE_H` | **inchangé** |
| `tracking.js` | `projectionRecup` | ⛔ **obligatoire** : remplacer les deux littéraux `48` et `24` par la constante |
| `app.js` | `CARDIO_MET` | **lu**, pas modifié |
| `screens.js` | affichage « Pourquoi ce score ? » | une ligne « Cardio » quand il y en a un |
| `tests/calculs/runner.js` | — | balayages cardio, continuité, monotonicité |
| `tests/parcours/runner.js` | — | profils A→K figés |

⚠️ **`_penaliteSeance` est aussi lue par la projection « quand serai-je au max ? »** (sortie de
`calcRecoveryDetail` le 21/08 exprès pour ça, **R2**). Toute modification doit être vérifiée des
deux côtés, sinon la date annoncée ne correspondra plus au score.

---

## 15. Tests à ajouter (§48.18)

1. **Balayage cardio** : 3 intensités × 6 durées → monotonicité stricte en durée et en intensité.
2. **Continuité aux 3 frontières** : 47,9/48,0/48,1 h · 19/20/21 min · 0/1/2 séries.
3. **Les 11 profils A→K** figés avec leur score attendu.
4. **Non-régression musculation** : le tableau 1→30 séries **inchangé** en option A.
5. **Mixte sans double comptage** : `cardio seul + muscu seule ≥ mixte` (le plafond doit mordre,
   pas s'additionner deux fois).
6. **Données manquantes** : chaque facteur retiré un par un, aucun ne doit être remplacé par une
   moyenne.
7. **Le score ne sature plus** (option B) : la FC au repos doit rester lisible dans le pire cas.
8. ⛔ **Contrôle négatif obligatoire** : chaque témoin doit être vu ROUGE sur l'ancien code avant
   d'être livré. *Sur ce moteur, un témoin qui ne peut pas rougir est particulièrement facile à
   écrire — la plupart des scores sont plats.*

---

## 16. Risques de régression (§48.19)

| risque | probabilité | atténuation |
|---|---|---|
| l'historique de récup change sans prévenir | **certaine** | mesurer avant/après sur 60 jours réels, et le **dire** à l'utilisateur (règle d'or #11) |
| la projection « quand serai-je au max ? » diverge du score | moyenne | elles lisent la même fonction — le vérifier par un témoin |
| un cardio d'échauffement devient pénalisant | faible | mesuré : 10 min léger = 1,4 série équivalente |
| le plafond de 38 masque à nouveau les grosses séances | moyenne en option B | la borne se pose sur la **réponse**, pas sur la charge |
| quelqu'un lit « 45 min de tapis = 10 séries » comme une vérité | **réelle** | ne jamais afficher l'équivalence (§21) |

---

## 17. Ce qui reste ouvert, et qui appartient à Michel

1. ⭐⭐ **Le nombre d'ancrage** : *45 min de tapis modéré ≈ combien de séries ?*
2. Le **socle neutre de 70** sans sommeil : score affiché, ou pas de score ?
3. La **récupération locale** : avertissement contextuel, ou rien ?
4. Le **plancher de 6** : son origine est introuvable dans le journal — quelqu'un s'en souvient-il ?
5. L'option **B** : accepte-t-on que le score devienne plus sévère pour les gens assidus ?

---

*Aucune ligne de code n'a été modifiée pour produire ce document. Le banc d'essai vit hors du
dépôt ; il sera versé dans `tests/` le jour où une option est retenue — un banc d'essai qui ne
protège encore aucune décision n'a rien à faire dans la suite de tests (**R19**).*
