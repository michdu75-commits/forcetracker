# 🍱 Ce qu'un VRAI programme de nutrition nous apprend

> **Créé le 26/08/2026.** Michel a confié **trois plans alimentaires** rédigés par sa coach en
> nutrition, espacés dans le temps (**14 décembre · 29 janvier · 20 avril**). C'est la première
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

⚠️ **CE QUE JE N'AFFIRME PAS** : que ces équivalences soient **isocaloriques au gramme près**. Je
n'ai pas recalculé chaque ligne contre CIQUAL, et rien dans les documents ne le revendique. Ce
qui est **observable**, c'est que ce sont des alternatives offertes **au même poste**, chacune
avec son poids propre, et que ces poids varient dans le sens de la densité. *Une équivalence de
praticienne, pas une équation.*

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

⚠️ **CE QUE JE NE CONCLUS PAS** : *pourquoi* ça bouge. Sèche puis reprise ? Préparation puis
hors-préparation ? Changement d'objectif ? **Les documents ne le disent pas, et Michel ne l'a pas
dit.** Écrire « c'était une sèche » serait une hypothèse présentée comme un fait — exactement ce
que la Constitution interdit à Milo (**P4**), et ce qu'on s'applique à nous-mêmes.

---

## 7. 👉 Ce que ça change pour l'app — par ordre d'utilité

1. **⭐⭐⭐ Le gabarit à quatre trous.** Un plan de repas utile n'est pas une liste de menus :
   c'est **un poste par catégorie, avec 2-4 options chiffrées**. C'est directement applicable au
   plan de repas actuel, qui est une table figée identique pour tout le monde
   (`KETO_MEALS` & co., `state.js`) — le sujet n°1 d'`IDEES-FUTURES.md`.
2. **⭐⭐ Les substitutions au même poste.** C'est la brique manquante identifiée par
   `NUTRITION-MOTEUR.md` §4.0. La forme est là ; il reste à décider **d'où viennent les
   équivalences** (calculées depuis CIQUAL, ou relues à la main — la 2ᵉ voie est celle du doc).
3. **⭐⭐ Ancrer les repas sur la SÉANCE.** À jeun · avant · après · le soir. L'app a la donnée et
   ne s'en sert pas (**R4**). C'est le défaut n°1 documenté, confirmé ici par une source
   indépendante.
4. **⭐ Parler en aliments, pas en macros**, dans tout ce qui est **prescriptif**. Le suivi peut
   rester chiffré ; la proposition, non.
5. **⭐ Des listes courtes.** Trois bons choix par poste.

⛔ **Ce qu'on ne fera PAS** : recopier ces plans dans l'app. Ce sont **les plans d'une personne**,
écrits par **une praticienne** qui la connaît. *On en tire une grammaire, pas un contenu.*

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
