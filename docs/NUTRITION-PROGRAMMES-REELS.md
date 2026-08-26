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

⚠️⚠️ **ET ON NE SAIT PAS SI C'EST VOULU — donc on ne le dit pas.** Une raison parfaitement
légitime peut l'expliquer (satiété : 260 g de pomme de terre font une grosse assiette pour
211 kcal · index glycémique · digestion avant séance), et **rien dans les documents ne
l'explique**. *Écrire « c'est une erreur » serait une hypothèse présentée comme un fait* —
exactement ce que la Constitution interdit à Milo (**P4**), et qu'on s'applique à soi-même.

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
