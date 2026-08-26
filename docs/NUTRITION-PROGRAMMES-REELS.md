# 🍱🏋️ Ce que de VRAIS programmes de coach nous apprennent

> **Créé le 26/08/2026.** Michel a confié **trois plans alimentaires** (14 décembre · 29 janvier ·
> 20 avril) **et six programmes d'entraînement** (3 janvier · 4 février · 10 mars ×3 · 11 septembre
> 2023) rédigés par la même coach. C'est la première
> fois que le projet dispose de programmes **écrits par une professionnelle pour un vrai
> sportif**, et de plusieurs versions du **même** athlète — donc de son **évolution**.
>
> ⚠️ **LES DOCUMENTS EUX-MÊMES NE SONT PAS DANS LE DÉPÔT, ET N'Y ENTRERONT PAS.** Ce dépôt est
> **public**. Les PDF portent le nom commercial de la coach, un code promo d'affiliation, le
> surnom de Michel et sa prescription personnelle. Même décision qu'en **ft-v974** pour ses cinq
> rapports de balance : *on garde ce qu'on APPREND, pas le document*. Ce fichier ne contient donc
> ni marque, ni nom, ni code promo — et les quantités n'y figurent que comme **exemples du
> mécanisme**, jamais comme « le plan de Michel ».
>
> ⏳⚠️ **CES PLANS ONT PLUS DE TROIS ANS, ET L'OBJECTIF EST CONNU** — Michel : *« c'était pour
> perdre du poids et prendre de la force, mais ça remonte, y a plus de 3 ans »*.
> **Conséquence directe, à ne jamais perdre de vue : AUCUNE QUANTITÉ N'EST TRANSPOSABLE
> AUJOURD'HUI.** Ce sont les portions d'un autre corps, à un autre poids, à un autre niveau
> d'activité. *Un document d'état qu'on ne date pas fait dire des bêtises à celui qui le lit*
> (**R23** — la famille qui m'a déjà piégé deux fois dans la seule journée du 26/08).
> 👉 **Ce qui traverse le temps, c'est la GRAMMAIRE** (§1), le principe des **substitutions**
> (§2), l'**ancrage sur la séance** (§3), la **façon de prescrire** (§4). Ça, ça ne périme pas.
> ⛔ **Ce qui ne traverse PAS** : les grammes, les listes d'aliments, la supplémentation.
>
> ⭐ **Pourquoi ça compte** : `docs/MODELE-METIER.md` pose que les objets métier **se distillent
> de vrais programmes**, ils ne s'inventent pas. C'est exactement ce que ce fichier fait, côté
> nutrition — et ce que `docs/NUTRITION-MOTEUR.md` réclamait sans avoir la matière.

---

## 1. La grammaire — identique dans les trois programmes

**Cinq repas**, toujours les mêmes, toujours nommés pareil :
`PETIT-DÉJEUNER` · `COLLATION 1` · `REPAS DU MIDI` · `COLLATION 2` · `COLLATION 3` (+ `REPAS DU SOIR`)

**Chaque repas est écrit en CATÉGORIES DE NUTRIMENTS**, pas en plats :

```
Protéines :  ……
        +
Glucides :   ……
        +
Fibres :     ……
        +
Lipides :    ……
```

Et sous chaque catégorie, **une petite liste d'options**. La consigne est répétée **à chaque
repas**, mot pour mot :

> *« Choisis 1 aliment dans chaque catégorie de nutriments. »*

👉 **Un repas n'est pas un menu : c'est un GABARIT à quatre trous, et chaque trou a sa liste.**

---

## 2. ⭐⭐ Le point qui change tout : les grammes sont des ÉQUIVALENCES

Dans une même catégorie, **chaque option porte son propre poids** — et ces poids **suivent la
densité de l'aliment**. Trois exemples relevés tels quels :

| Repas | Les options proposées **au même poste** |
|---|---|
| Collation 2 (déc.) | **180 g** pomme de terre · **220 g** riz basmati · **240 g** quinoa |
| Midi (déc.) | **180 g** pâtes · **200 g** riz basmati |
| Protéines, collation 2 (déc.) | **150 g** bœuf · **200 g** poulet ou dinde |
| Protéines, midi (déc.) | **200 g** poulet · **230 g** poisson blanc · 2 œufs + 4 blancs |

**Le bœuf, plus dense, pèse moins que le poulet ; le poisson blanc, moins dense, pèse plus.** La
coach ne dit jamais « 40 g de protéines » : elle dit **quel aliment, à quel poids**, et le
calibrage est déjà fait.

### ⚠️⚠️ RECALCULÉ CONTRE CIQUAL — et le résultat corrige ce qui précède

**Michel a donné la convention qui manquait : *« pour la viande c'est cru, les glucides c'est
cuits »*.** Sans elle, aucun de ces poids n'était calculable. Avec elle, tout l'est — et l'app
embarque déjà la table **CIQUAL 2025 de l'ANSES** (`data/ciqual.json`, 3 484 aliments). *On
mesure au lieu de supposer* (**R28**).

| Poste | Les options, recalculées | Écart |
|---|---|---|
| déc · collation 2 | 180 g p. de terre = **146 kcal** · 220 g riz = **326** · 240 g quinoa = **358** | **× 2,5** |
| déc · midi | 180 g pâtes = **301 kcal** · 200 g riz = **296** | **× 1,0** |
| janv · collation 2 | 200 g p. de terre = **162 kcal** · 200 g lentilles = **250** | × 1,5 |
| janv · midi | 180 g riz complet = **337 kcal** · 150 g patate douce = **118** | **× 2,9** |
| avril · collation 2 | 260 g p. de terre = **211 kcal** · 230 g pâtes = **384** | × 1,8 |
| avril · midi | 260 g riz = **385 kcal** · 220 g patate douce = **174** | **× 2,2** |

**⭐⭐ LE MOTIF EST NET, ET IL EST DOUBLE :**
- **entre céréales, le calibrage est parfait** : 180 g de pâtes ≡ 200 g de riz, **301 contre
  296 kcal**. *Ce n'est pas de la chance — c'est un calibrage fait exprès et il tombe juste.*
- **entre tubercule et céréale, l'écart va de ×1,8 à ×2,9**, toujours dans le même sens : la
  pomme de terre et la patate douce apportent **environ la moitié** de l'option céréale du même
  poste.

**👉 La conséquence pratique est réelle et chiffrée** : au même poste, prendre la patate douce
plutôt que le riz, c'est **environ 200 kcal de moins**. Sur deux postes par jour, **~400 kcal**.

### ⭐⭐⭐ LA RAISON, DONNÉE PAR MICHEL — c'est l'INDEX GLYCÉMIQUE

Je m'étais arrêté à *« on ne sait pas si c'est voulu, donc on ne le dit pas »*. **Michel a la
réponse** :

> *« Il y a l'**index glycémique** qui rentre en compte. On parle souvent de calorie mais c'est
> faux — il faut faire attention à sa **santé** et faire attention au **sucre**. »*

**👉 L'écart tubercule / céréale n'est donc pas un défaut de calibrage : c'est un AXE que mon
calcul ne voyait pas.** Je comparais des calories ; elle arbitrait autre chose. *Deux aliments
« équivalents » en kcal ne le sont pas dans le sang* — et une praticienne qui prescrit pour la
santé ne raisonne pas qu'en arithmétique.

⭐ **C'est la démonstration la plus nette de pourquoi on ne conclut pas à la place des gens.**
Mon tableau était **juste** ; ma lecture aurait été **fausse**. La mesure ne dit jamais toute
seule ce qu'elle veut dire.

### ⚠️⚠️ ET ÇA DÉSIGNE UN TROU DE L'APP, PLUS GROS QUE CELUI DU PLAN DE REPAS

**L'app raisonne en calories et en macros, du début à la fin** : le TDEE, l'anneau, les trois
anneaux, la répartition en %, « ce qu'il te reste ». **Aucune notion de qualité, nulle part dans
la chaîne de décision.** Or `docs/NUTRITION-PHILOSOPHIE.md` dit exactement le contraire depuis le
22/07 — phrase-boussole, **Constitution P21** : *« la nutrition est un moyen d'améliorer la
**santé**, la récupération et la performance »*.

⭐ **Et la moitié de la réponse est DÉJÀ dans le dépôt, débranchée** : `food-health.js` sait
récupérer le **Nutri-Score**, le groupe **NOVA** et les additifs depuis Open Food Facts, et en
faire un score santé — **gratuitement**. Il sert à afficher une fiche produit au scan. **Il
n'entre dans aucun calcul, dans aucune suggestion, et Milo ne le voit pas.** *C'est **R4** : la
connaissance existe et n'atteint pas la donnée.*

⛔ **Ce qui manque vraiment, c'est l'index glycémique lui-même** : ni CIQUAL ni Open Food Facts ne
le portent. Il faudrait une table à part, et **il faut décider si on l'ajoute** — pas le supposer.
⚠️ Et prudence : l'IG d'un aliment isolé ne dit pas grand-chose de l'IG d'un **repas** (les
lipides, les fibres et les protéines le modifient). *Afficher un IG par aliment donnerait une
fausse précision* (**R29**) — c'est le même piège que le « score de fiabilité » refusé en **R32**.

⚠️ *(Écrit avant la réponse de Michel, et gardé tel quel : à ce moment-là, les raisons possibles
étaient la satiété, l'index glycémique ou la digestion avant séance, et **rien dans les documents
ne tranchait**. Conclure « c'est une erreur » aurait été une hypothèse présentée comme un fait —
**P4**. **La retenue a payé : la vraie raison était la deuxième.**)*

⭐⭐⭐ **LA LEÇON POUR L'APP EST L'INVERSE DE CE QUE J'AVAIS ÉCRIT UNE HEURE PLUS TÔT.** J'allais
proposer de **recopier** ces listes comme table de substitutions. **Il ne faut surtout pas** :
recopiées telles quelles, l'app annoncerait comme « équivalents » des choix qui vont du simple au
triple. 👉 **On garde la FORME (un poste, plusieurs options chiffrées) et on CALCULE les
quantités depuis CIQUAL.** C'est très exactement ce que `NUTRITION-MOTEUR.md` §4.0 demandait, et
c'est ce qu'une feuille de papier ne peut pas faire : *l'app, elle, peut proposer une
substitution qui tombe vraiment juste.*

⭐ **C'est exactement la table que l'app n'a pas.** `docs/NUTRITION-MOTEUR.md` §4.0 dit qu'il
faudrait une base « composable » d'environ 300 aliments avec leurs substitutions, relue à la
main. **En voici la forme, écrite par quelqu'un dont c'est le métier.**

---

## 3. ⭐⭐⭐ La séance structure les repas — et l'app ne le fait toujours pas

`docs/NUTRITION-MOTEUR.md` désigne depuis le 18/08 le **défaut n°1** de la nutrition :
*« le plan de repas ignore l'entraînement »*. **Ces documents le confirment de l'extérieur, et
ils montrent à quoi ressemble le bon comportement.**

Relevé dans le programme d'avril, tel quel :

- **à jeun** : collagène + glutamine + maca + **créatine** ;
- **avant ou pendant le sport** : **électrolytes / BCAA** ;
- **après le sport** : **créatine + une petite brique de jus de raisin** ;
- **le soir** : glutamine + collagène + magnésium + zinc.

👉 **Quatre moments, définis par rapport à la SÉANCE, pas par rapport à l'horloge.** Et la
collation qui suit l'entraînement est un **poste à part entière** du plan.

⭐ **L'app a déjà tout ce qu'il faut pour ça** : `S.wkt`, l'heure de début, la région travaillée,
la discipline. Elle n'en fait **rien** côté repas. *Le trou n'est pas dans la donnée, il est dans
le lien* — c'est **R4** appliqué à la nutrition.


---

## 3bis. 🏋️ LES PROGRAMMES D'ENTRAÎNEMENT DE LA MÊME COACH — six documents, 2023

Michel a retrouvé **six programmes d'entraînement** de la même praticienne : **3 janvier**,
**4 février**, **10 mars** (trois fichiers = trois séances du même programme) et **11 septembre
2023**. ⚠️ Mêmes règles que pour les diètes : **les documents restent hors du dépôt**, on garde
la méthode.

### La structure

Un tableau, toujours les mêmes colonnes :
`Exercices | Exécution / Accessoires | Répétitions | Repos (maximum) | Tips`

Des séances **numérotées et nommées par groupe** (*Dos et Biceps*…), plus un bloc **ABDOMINAUX**
à part, avec sa propre consigne de placement : *« à faire **4 fois par semaine**, **avant**
l'entraînement, **après** l'échauffement »*.

### ⭐⭐⭐ Elle ne donne JAMAIS de charge en kilos

Compté sur les six documents : **« lourd » 18 fois · « max » 11 · « léger » 2 · « dégressif » 3 ·
« progressif » · « charge montante »**. **Zéro kilo.** Jamais.

Les répétitions ne sont pas un nombre non plus, mais une **consigne** : `6-8 lourd` · `4 × 10/12` ·
`10-10-10-10 dégressif 4 charges` · `3 × 12 puis 10, 8, 6 rapides` · `4 × 10 + 10`.

👉 **C'est le pendant EXACT du « zéro calorie » côté nutrition** (§4) : *une praticienne donne des
repères qualitatifs et laisse la personne calibrer.* Elle prescrit un **effort**, pas un **nombre**.

⚠️⚠️ **ET C'EST UN CONTRE-POINT DIRECT À MILO.** Milo, lui, prescrit des kilos précis — *« 3 × 5
à 95 kg »*, ce qui a produit le défaut corrigé en **ft-v980** (une charge au-dessus du tenable,
qu'il a lui-même démentie quand on l'a questionné). *Une coach humaine, dans la même situation,
aurait écrit « 5 × 5 lourd ».* **Ça ne veut pas dire que Milo a tort de chiffrer** — un chiffre
pré-rempli dans l'app fait gagner du temps en salle, et c'est le cœur du produit. Mais ça montre
qu'il existe un autre registre, et qu'il est **plus sûr par construction** : *« lourd » ne peut
pas être trop lourd.*

### ⭐⭐ Le TEMPO est une colonne à part entière

*« 3 sec descente, 2 sec contraction »* · *« monte 3 sec, bloque 3 sec, descends 3 sec »* ·
*« montée lente, descente rapide »* · *« bloque 2 sec + 10 rapides »* · *« 1 + 1 = 1 rep »*.

**L'app n'a rien de tel.** Elle connaît la charge, les répétitions et le repos — pas la manière.
*Or c'est la manière qui distingue deux séries identiques sur le papier.*

### ⭐⭐ Trois convergences fortes avec ce que l'app fait DÉJÀ

Elles valent d'être écrites, parce qu'elles **valident des choix pris sans cette référence** :

1. **L'échauffement est nommé et EXCLU** : *« 1 série de chauffe légère **qui ne compte pas** »*.
   C'est **exactement** le tag `É` de l'app (exclu du volume et des records).
2. **La montée en charge** : *« charge montante »*, *« chauffes avant »*. L'app la fabrique toute
   seule depuis ft-v… — et ft-v972 a corrigé son dosage.
3. **⭐ On ADAPTE, on n'interdit pas** : *« si douleur au genou, reste que dans le bas de la
   position »*. **C'est le Gardien de Milo, écrit par une humaine** — Constitution **P13**,
   *« adapter, jamais interdire »*, mot pour mot.

### ⭐ Deux nuances que l'app ignore

- **Le repos est un MAXIMUM**, pas une consigne : la colonne s'intitule *« Repos maximum »*, et
  les valeurs sont des **plages** (`1 à 2 min`, `2 à 4 mins`, `45 sec max`). L'app, elle, traite
  le repos comme un **compte à rebours à respecter**. *Ce n'est pas la même chose : l'un borne,
  l'autre impose.*
- **Chaque séance porte son OBJECTIF, écrit en langage parlé** et orienté résultat — par exemple
  *« gagner en force pour passer progressivement en power, **par étapes**, pour pas te blesser ni
  choquer ton corps »*. 👉 **L'objectif ET sa justification, attachés à la séance.** L'app a un
  objectif *global* (dans le profil) ; elle n'a rien au niveau de la séance.

### 📈 La transition hypertrophie → force est MESURABLE

| Programme | Répétitions (médiane) | Repos |
|---|---|---|
| **4 février** | **10** | 1 min 30 → 2 min 30 |
| **10 mars** | **6 à 8** | **2 à 4 min** |
| **11 septembre** | **12** | 1 min → 1 min 15 |

Et c'est **écrit dans le document du 10 mars** : *« gagner en force pour passer progressivement en
power »*. Les schémas suivent — `5 × 5`, `6 × 4`, `2 × 8 + 2 × 6`.

⭐⭐ **ET ÇA S'ACCORDE AVEC LES DIÈTES.** Le plan alimentaire le plus **restrictif** est celui du
**29 janvier** ; le programme du **4 février** est en hypertrophie classique. Le passage en force
du **10 mars** est suivi du plan le plus **généreux**, le **20 avril**. *Plus de force demandée,
plus de glucides donnés.*
⚠️ **Attention quand même** : les diètes ne portent **pas l'année**. Le rapprochement est
cohérent et les écarts de dates collent, mais il **repose sur une hypothèse de millésime** — je
l'écris comme une correspondance plausible, pas comme un fait établi (**P4**).

---

## 4. ⭐ Ce qu'une pro n'écrit JAMAIS : des calories et des macros

**Zéro kcal. Zéro « 180 g de protéines par jour ». Zéro pourcentage.** Sur trois programmes et
neuf pages, la coach ne fait apparaître **aucun chiffre de macronutriment**.

Elle donne : **des aliments, des poids, des moments.**

⚠️ **Et l'app fait l'inverse** : elle met les macros au centre (l'anneau, les trois anneaux, la
répartition en %). *Ce n'est pas forcément une erreur — le suivi et la prescription ne sont pas
le même métier* — mais c'est une différence qu'il faut voir. **Le plan exécutable ne parle pas en
macros ; il parle en assiettes.** C'est très exactement ce que ft-v1019 avait commencé à corriger
avec *« ce qu'il te reste, en vrai »* : traduire un gramme abstrait en aliment réel.

---

## 5. ⭐ Les listes sont COURTES

**2 à 4 options par catégorie.** Jamais dix, jamais trois cents.

L'exception, ce sont les **légumes verts**, donnés comme une liste franchement interchangeable
**au même poids** (courgettes / épinards / brocolis / haricots verts / salade / tomates / cœur de
palmier / radis / asperges). *Ce qui est équivalent sans calcul est offert en vrac ; ce qui
demande un calibrage est chiffré un par un.*

👉 **Leçon pour le générateur de l'app** : une base composable n'a pas besoin d'être vaste, elle
a besoin d'être **juste** et **courte**. Trois bons choix par poste valent mieux que trente.

---

## 6. 📈 L'ÉVOLUTION — ce que trois dates permettent de voir

C'est la partie qu'aucun programme isolé ne peut donner.

| | 14 décembre | 29 janvier | 20 avril |
|---|---|---|---|
| **Glucides, collation 2** | 180 g pdt · 220 g riz · 240 g quinoa | 200 g pdt · 250 g riz sauvage · 200 g lentilles | **260 g** pdt · **230 g** pâtes |
| **Glucides, midi** | 180 g pâtes · 200 g riz | **180 g** riz complet · **150 g** patate douce | **260 g** riz · **220 g** patate douce |
| **Légumes** | 220-250 g | **180 g** | 200 g |
| **Huile** | 10 g | **5 g** | 10 g |
| **Petit-déj (produit laitier)** | 200 g skyr + 30 g whey | 2 skyr · 35 g isolate | **300 g** skyr · **50 g** whey |
| **Crème de riz** | 50 g | 70 g (collation) | **90 g** |

**👉 Janvier est le point le plus restrictif, avril le plus généreux.** Glucides du midi, huile et
légumes descendent tous en janvier, puis remontent nettement en avril. *Ce n'est pas du bruit :
les trois leviers bougent ensemble et dans le même sens.*

**Et la supplémentation s'enrichit dans le temps** : décembre = collagène + glutamine ; janvier
ajoute maca et oméga 3 ; avril ajoute **créatine (deux prises, dont une post-séance)**,
**électrolytes pendant l'effort**, **magnésium** et **zinc**.

**⭐ L'OBJECTIF, LUI, EST SU — et il vient de Michel, pas d'une déduction** : *« c'était pour
**perdre du poids et prendre de la force** »*. C'est, mot pour mot, l'objectif « **Perte de gras +
muscle** » que l'app propose aujourd'hui — la recomposition.

⚠️ **CE QUE JE NE CONCLUS TOUJOURS PAS** : *pourquoi* chaque curseur bouge à chaque date. Que
janvier soit le point bas et avril le point haut est **mesuré** ; qu'il s'agisse d'une sèche
suivie d'une reprise reste une **hypothèse**, et les documents n'en disent rien. *Une hypothèse
présentée comme un fait est ce que la Constitution interdit à Milo* (**P4**) — on se l'applique.

⏳ **Et tout ceci a plus de trois ans.** Reconstituer le récit exact n'a donc qu'un intérêt
limité : ce qu'on veut de ces documents, c'est la **méthode**, pas l'histoire.

---

## 7. 👉 Ce que ça change pour l'app — par ordre d'utilité

1. **⭐⭐⭐ Le gabarit à quatre trous.** Un plan de repas utile n'est pas une liste de menus :
   c'est **un poste par catégorie, avec 2-4 options chiffrées**. C'est directement applicable au
   plan de repas actuel, qui est une table figée identique pour tout le monde
   (`KETO_MEALS` & co., `state.js`) — le sujet n°1 d'`IDEES-FUTURES.md`.
2. **⭐⭐ Les substitutions au même poste — MAIS CALCULÉES.** La question « d'où viennent les
   équivalences » est **tranchée par la mesure du §2** : pas d'un document, même professionnel.
   Recopiées, elles présenteraient comme équivalents des choix qui vont du simple au triple.
   **On prend la forme, on calcule les nombres** (CIQUAL est déjà dans le dépôt).
3. **⭐⭐ Ancrer les repas sur la SÉANCE.** À jeun · avant · après · le soir. L'app a la donnée et
   ne s'en sert pas (**R4**). C'est le défaut n°1 documenté, confirmé ici par une source
   indépendante.
4. **⭐ Parler en aliments, pas en macros**, dans tout ce qui est **prescriptif**. Le suivi peut
   rester chiffré ; la proposition, non.
5. **⭐ Des listes courtes.** Trois bons choix par poste.

⛔ **Ce qu'on ne fera PAS** : recopier ces plans dans l'app. Ce sont **les plans d'une personne**,
écrits par **une praticienne** qui la connaît — et ils ont **plus de trois ans**. *On en tire une
grammaire, pas un contenu.* Les deux mesures du §2 le disent chacune à leur manière : les
quantités ne sont ni transposables dans le temps, ni équivalentes entre elles.

---

## 8. ⚠️ Ce qui reste inconnu, et qu'il faudrait demander

- Les aliments sont-ils pesés **crus ou cuits** ? Rien ne le dit, et **le rapport va du simple au
  triple** sur le riz et les pâtes. *C'est la première question à poser* — sans la réponse,
  aucune équivalence n'est calculable.
- Sur quel **signal** la coach fait-elle évoluer un plan (poids ? photos ? ressenti ? échéance) ?
- Y a-t-il des **jours différents** (entraînement / repos), ou le plan est-il le même tous les
  jours ? Les trois documents décrivent **une seule journée type**.
- Que fait-elle en cas d'**écart** — un repas au restaurant, un aliment absent ?

*Ces quatre questions valent plus que dix programmes de plus : elles portent sur la **méthode**,
et c'est la méthode qu'on cherche à comprendre.*


---

## 9. 🤖 UN PLAN GÉNÉRÉ PAR UNE IA, CONFRONTÉ À L'APP *(26/08/2026)*

Michel a aussi confié un **« Guide de powerbuilding et nutrition optimisée »** pour son profil
d'aujourd'hui : **48 ans · 1 m 80 · 86 kg · 4 entraînements/semaine · recomposition**.

⚠️ **CE DOCUMENT N'A PAS LE MÊME STATUT QUE CEUX DE LA COACH, et il le dit lui-même** : son pied
de page porte *« AI responses may include mistakes »*. **Ce n'est pas une source d'autorité, c'est
une liste de contrôle** — utile pour voir ce qu'on ne fait pas, jamais pour trancher.

### Le même profil, calculé par l'app

| | Le plan | **L'app** (profil identique) |
|---|---|---|
| BMR | *(non donné)* | **1 750** (Mifflin) |
| Maintenance | ~2 800 | **2 913** (activité 1,55) · **3 219** (1,725) |
| Cible | **2 400** | **2 763** en charge · **2 563** en décharge |
| Protéines | 205 g (**2,4** g/kg) | **224 g** (**2,6** g/kg) |
| Lipides | 86 g (**1,0** g/kg) | **73 g** (**0,85** g/kg) |
| Glucides | 205 g | **303 g** |

⭐ **Les deux se tiennent, et l'écart vient surtout du NIVEAU D'ACTIVITÉ** — 2 913 contre 3 219
selon qu'on déclare « modéré » ou « soutenu » pour 4 séances. *C'est exactement ce que la carte
« dérive d'activité » de l'app surveille déjà* (elle compare le niveau **déclaré** aux séances
**réelles**). Le plan, lui, pose une maintenance sans dire d'où elle vient.

### ⭐⭐⭐ Ce qu'il dit et que l'app ne fait pas — dont la TROISIÈME confirmation du défaut n°1

> *« Concentrez **60 % de vos glucides autour de la séance** — 1 h 30 avant et dans les 2 h
> après — pour saturer le glycogène au moment de pousser. »*

**Troisième source indépendante** à dire la même chose, après les diètes de la coach et ses
programmes d'entraînement : **le placement des glucides par rapport à la séance**. L'app connaît
l'heure de la séance et n'en fait rien côté repas.

Deux autres manques :
- **Le RPE** (*« reste au maximum à RPE 8 / 8,5 sur les polyarticulaires »*). L'app **connaît le
  mot** — il est dans le prompt de Milo et dans l'import de programmes — mais **une série n'a pas
  de champ RPE**. Elle a le tag `X` (échec) et, depuis ft-v980, un contrôle de % du 1RM.
- **Le timing des compléments** (*« collagène 30-60 min AVANT la séance pour cibler les
  tendons »*). L'app dose la créatine et la whey ; elle ne dit jamais **quand**.

### ⚠️ Un point où l'app a une PHILOSOPHIE DIFFÉRENTE — pas un retard

Le plan propose **deux cibles caloriques** : 2 400 les jours d'entraînement, **2 200** les jours de
repos. L'app, elle, **cycle les glucides** (`cycleGlucides`, `state.js`) mais **garde les calories
neutres sur la semaine** — et son cyclage tient compte de la **région travaillée**, pas seulement
de « jour on / jour off ».

👉 **Ce sont deux écoles, et celle de l'app est écrite et défendable.** ⛔ Ne pas « corriger »
l'une vers l'autre sans décision explicite (**R30**).

### 🔎 Et il a révélé un vrai petit défaut de l'app

`tracking.js` annonce l'évolution de poids attendue selon l'objectif : *muscle* → « +0,1 à
0,3 kg/sem », *perte* → « −0,3 à 0,7 kg/sem »… mais **`recomp` n'est pas dans la table**. Un
utilisateur en recomposition lit donc : *« l'évolution attendue est **variable** »*.

⚠️ **C'est l'objectif de Michel**, et c'est celui qui aurait le plus besoin d'un repère. Le plan,
lui, en donne un net : *« 300 à 500 g maximum par semaine, pour garantir que la perte vient du
gras et non du muscle »* — cohérent avec la fourchette « perte » déjà présente dans l'app.
⛔ **Non corrigé : c'est un chiffre de santé sur SON écran, la décision lui revient** (**R29**).


---

## 10. 🔬 UN COMPARATIF EXTÉRIEUR, CONFRONTÉ À SON TOUR *(26/08/2026)*

Michel a confié un **comparatif** (rédigé par une autre IA) entre le plan powerbuilding et les
diètes de la coach, centré sur le **rapport glycémique**. Il est bon, et il est **honnête sur sa
méthode** (il écrit lui-même que la partie glycémique est *« une analyse externe, pas une donnée
présente dans les documents »*). Vérifié point par point, comme n'importe quelle spécification
venue de l'extérieur (**famille 18 de `BUGS.md`, écrite le matin même**).

### ⭐⭐ Il a vu des documents que je n'ai PAS

Il parle de **quatre** plans alimentaires et cite une version de **juin** ; je n'en ai lu que
**trois** (14 déc · 29 janv · 20 avril). **Mesuré** : *boulgour · semoule · miel · sirop d'agave ·
Vitargo · spiruline · tofu · pois chiches · haricots rouges* — **aucun n'apparaît dans mes trois
fichiers**. 👉 **Il existe donc au moins un plan que je n'ai pas vu**, et il est plus varié.
*Écrit ici pour que personne ne prenne mon §2 pour un inventaire complet.*

### ⭐⭐⭐ Convergence indépendante sur le point qui décide de tout

Il écrit : `230 g pommes de terre ≠ 250 g riz cuit`, et *« Force Tracker pourrait **recalculer
automatiquement** les portions après chaque substitution »*.

**C'est exactement ce que j'ai mesuré (×1,8 à ×2,9) et exactement la conclusion que j'en ai
tirée** — garder la forme, calculer les nombres. **Deux analyses séparées, sans se connaître,
même verdict.** *C'est la meilleure validation qu'on puisse avoir sur ce point.*

### ✅ Son arithmétique est juste — et l'app a déjà le contrôle qu'il réclame

Il relève que `205 P + 86 L + 205 G` = **2 414 kcal**, pas les 2 400 annoncés (et **2 254** au
repos, pas 2 200). **Vérifié : exact.**

⚠️ **Mais sa conclusion mérite une précision.** Il écrit qu'*« une application devrait éliminer ce
genre d'incohérence automatiquement »* : **l'app a déjà ce contrôle** — `_coherenceKcal` (`app.js`,
ft-v972), né du *« 1117 kcal pour 26 P / 1 G / 1 L »* que Michel avait laissé passer. Deux
nuances :
- il ne s'applique qu'aux **aliments saisis**, jamais à une **cible** — *le mécanisme existe, il
  ne vise qu'un côté* (**R13**) ;
- et son seuil est **large exprès** (25 % **et** 60 kcal). Sur 14 kcal d'écart, **il se tairait —
  et il aurait raison** : c'est un arrondi. *Un contrôle qui crie pour un arrondi finit ignoré*
  (**R19**).

### ⭐⭐ Son §11 dit ce que j'avais écrit, et c'est le point le plus important du sujet

> *« Le repas compte plus que l'IG isolé. Force Tracker ne devrait pas afficher `IG du riz = X`,
> mais la charge glucidique de la portion + la composition du repas + le timing. »*

**Même conclusion que la mienne**, et son §14 ajoute le garde-fou qu'il fallait : ⛔ *« ne pas
créer une règle simpliste IG élevé = mauvais »* — **la charge glycémique est une information de
contexte, pas une note morale donnée à l'aliment.** C'est **R29** et la **Constitution P21**
(anti-TCA) formulées de l'extérieur.

### 🗺️ Son §17 est une feuille de route — et l'app en tient DÉJÀ 4 étapes sur 6

| Étape proposée | État réel de l'app |
|---|---|
| ① Cible (kcal + macros) | ✅ `calcMacros` |
| ② Contexte (entraînement/repos, **heure de séance**, objectif, poids) | ⚠️ **à moitié** — le cyclage des glucides existe et tient compte de la **région travaillée**, mais **l'heure de la séance n'est jamais utilisée** |
| ③ Repas réellement choisis | ✅ le Journal |
| ④ Recalcul automatique | ✅ `_foodTotals` + le rescale de ft-v972 |
| ⑤ Profil glycémique | ❌ **absent** |
| ⑥ Substitution recalculée (riz → p. de terre) | ❌ **absent** |

👉 **Le chantier tient donc en trois points, et ils sont nommés** : l'**heure de la séance**, la
**substitution recalculée**, la **charge glycémique du repas**. ⛔ Dans cet ordre : les deux
premiers se calculent avec ce que le dépôt contient déjà (CIQUAL, `S.wkt`) ; le troisième demande
une table d'IG que **ni CIQUAL ni Open Food Facts ne portent**, donc une décision.


---

## 11. 🏋️ L'EXTENSION « FORCE ATHLÉTIQUE » — et ce qu'elle valide *(26/08/2026)*

Le comparatif a reçu une 3ᵉ extension (§39-68), dédiée au **powerlifting**. Vérifiée dans le code,
comme les précédentes.

### ⭐⭐⭐ Son §65 décrit ce que l'app a construit IL Y A TROIS JOURS

Il propose qu'avant *« Commencer la séance »*, un validateur déterministe vérifie :
`exercice refusé · blessure · doublon · matériel · mouvement déjà lourdement travaillé · charge
incohérente avec l'e1RM · volume excessif · repos irréaliste`.

**Mesuré : 5 des 8 existent déjà.**

| Ce qu'il demande | État réel |
|---|---|
| exercice refusé · blessure · doublon | ✅ `_validationSeance` — **ft-v989**, 24/08 |
| charge incohérente avec le record | ✅ `intensiteWarn` — **ft-v980**, 23/08 |
| repos irréaliste | ✅ **ft-v980** (*« un 3×5 avec 90 s de repos, c'est impossible »*, Michel) |
| matériel disponible | ❌ |
| mouvement déjà lourdement travaillé récemment | ❌ |
| volume excessif | ❌ |

⭐⭐ **Et sa conclusion est, mot pour mot, la doctrine du projet** :
> *« Milo peut proposer. Force Tracker doit trancher ce qui est objectivement vérifiable. »*

C'est **R7** (*« est-ce STRUCTUREL ? → seulement alors, le prompt »*) et
`ARCHITECTURE-CERVEAU-CERVELET` (*le jugement à Milo, le vérifiable au code*).
**Une analyse extérieure, sans accès au dépôt, converge sur l'architecture déjà bâtie** — et elle
nomme les **trois contrôles qui manquent**. *C'est la meilleure validation de la soirée.*

### ⭐⭐ Son §49 réclame la force RELATIVE — l'app la calcule déjà, et le code est DORMANT

> *« Force Tracker pourrait afficher deux trajectoires : force absolue et force relative au poids.
> Cela évite de conclure « le pratiquant régresse » parce qu'un squat baisse pendant une descente
> de poids. »*

**`getLevel(exercice, rm1, bw, gender, age)` existe** (`constants.js:727`) : elle situe une
performance **rapportée au poids de corps**, de Débutant à Élite. **Mesuré : elle est appelée
0 fois** dans le code servi — débranchée le **11/07** (ft-v385), quand le « niveau de force » est
sorti de l'Accueil au profit du calendrier.

👉 **Ce n'est pas une fonctionnalité à construire, c'est une fonctionnalité à rebrancher** — et
`CLAUDE.md` le dit déjà : *« n'est plus affiché nulle part »*. ⚠️ Avant de la remettre, relire
pourquoi elle est partie (**R30** — 3ᵉ cas, celui du 23/08 : *avant de promouvoir un essai parqué,
chercher pourquoi il l'était*).

### ⛔⛔ SON §48 EST LE POINT LE PLUS IMPORTANT DE TOUTE LA SECTION, ET IL EST DE SÉCURITÉ

> *« Force Tracker ne devrait jamais recommander automatiquement : déshydratation agressive ·
> manipulation extrême du sodium · restriction hydrique · coupe rapide de plusieurs kilos ·
> laxatifs · protocoles de sudation. »*

**Ce n'est pas théorique** : la descente de catégorie est une pratique **courante et risquée** en
force athlétique, et l'app parle déjà à des gens qui en font. ⭐ **Ça relève du Gardien**, au même
titre que les blessures — et c'est **Constitution P13/P21/P22** : *adapter jamais interdire, mais
la santé passe avant la performance, et Milo n'est pas médecin.*
⏭️ **À vérifier** : le Gardien couvre-t-il ces demandes aujourd'hui ? *Non mesuré — donc non
affirmé.*

### ⚠️ Deux propositions que je ne suivrais PAS en l'état

- **§63, trois « scores de préparation » distincts** (squat / bench / deadlift). Séduisant, mais
  ce serait **trois chiffres de plus sans méthode validée pour les calculer** — exactement la
  fausse précision refusée en **R32** (le « score de fiabilité 92 % ») et en **R29**. Le projet a
  déjà **un** score de récup, et sa fiabilité se discute encore.
- **§60, préparer les tentatives en compétition.** Hors périmètre — *il le dit lui-même* (*« ce
  module doit rester séparé »*).

### 🧭 Et une remarque de méthode, parce qu'elle compte plus que le contenu

**C'est le quatrième document d'analyse de la soirée**, tous du même auteur, tous convergents, et
la valeur **par document décroît** : le §65 redécouvre ft-v989, le §52 redécouvre EV-020, le §34
redécouvre `PROFIL-VIVANT.md`. *La convergence est rassurante — elle n'est plus informative.*

⛔ **Ce qui manque au projet à ce stade n'est plus de l'analyse, ce sont des DÉCISIONS** (**R19** :
la gouvernance sert le produit, jamais l'inverse). Trois questions et deux propositions attendent
Michel, et aucune ne demande un document de plus.
