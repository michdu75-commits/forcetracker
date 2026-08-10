# 🤝 Mode d'emploi — reprendre le catalogue d'exercices de Force Tracker

> Écrit pour une IA qui construit **une autre application** et a besoin d'exercices + de figurines.
> Tout est public : rien à demander, rien à téléverser, aucun zip.
> Auteur du catalogue : **Michel** (michdu75@gmail.com). Les deux applications sont les siennes.

---

## ⚡ En une phrase

**Lis un fichier, insère-le tel quel, et pointe les images sur des URL déjà en ligne.**
Le rapprochement exercice → figurine est **déjà fait** ; le refaire, c'est le casser.

---

## 1. Les données — un seul fichier à lire

| Format | URL |
|---|---|
| **CSV** (à importer dans une base) | `https://raw.githubusercontent.com/michdu75-commits/forcetracker/master/export/catalogue-exercices.csv` |
| **JSON** (à lire depuis du code) | `https://raw.githubusercontent.com/michdu75-commits/forcetracker/master/export/catalogue-exercices.json` |

**362 exercices · 72 Ko en CSV.** Colonnes :

`id` · `nom` · `groupe` · `muscles_primaires` · `muscles_secondaires` · `pattern` · `met` ·
`unilateral` · `image_url`

- **`id`** — identifiant stable (`rowing-haltere-tirage-horizontal`). **C'est LUI la clé**, jamais le
  nom : un nom d'affichage peut changer, l'id non. Range l'historique dessus.
- **`muscles_*`** — codes séparés par `|` (`lats|traps`). Relus un par un en août 2026.
- **`pattern`** — famille de mouvement (`squat`, `hip-hinge`, `fente`, `poussee-horizontale`,
  `tirage-vertical`…). Sert à proposer un **remplacement équivalent** quand une machine est prise.
- **`met`** — coût énergétique (4.0 isolation · 5.5 haut du corps · 6.5 bas du corps · 8.0 explosif).
- **`unilateral`** — `true` = **la série se refait de l'autre côté**. Voir §4, ce n'est pas un détail.
- **`image_url`** — l'adresse complète de la figurine. **340 des 362 en ont une.**

## 2. Les figurines — déjà en ligne, ne rien téléverser

**306 fichiers · 30 Mo au total · 100 Ko en moyenne.** Ce sont des **WebP animés** (12 à 24 images),
déjà convertis et compressés — un GIF brut équivalent pèse 5 à 10 fois plus.

```
https://michdu75-commits.github.io/forcetracker/exercises/<fichier>.webp
```

- **Inventaire complet** (fichier, URL, poids, nombre d'images, dimensions, exercices concernés) :
  `https://raw.githubusercontent.com/michdu75-commits/forcetracker/master/export/figurines.json`
- **Galerie à regarder avec des yeux humains** :
  `https://michdu75-commits.github.io/forcetracker/docs/FIGURINES.html`

👉 **Il suffit de mettre `image_url` dans un `<img src>`.** Pas de stockage, pas de copie. Bonus :
si une figurine est améliorée un jour, elle s'améliore **dans les deux applications à la fois**.

## 3. ⛔ Les quatre choses à NE PAS faire

1. **Ne pas re-déduire le rapprochement depuis les noms de fichiers.** C'est le piège n°1, et il a
   déjà fait rater le **développé couché**. Les fichiers s'appellent
   `developpe-couche-halteres-exercice-musculation.webp` ou `rowing-haltere-un-bras.webp` : aucun
   rapprochement automatique ne s'en sort. **Prendre la colonne `image_url`, point.**
   Le catalogue distingue par exemple **11 variantes** du développé couché (barre, haltères, incliné,
   décliné, Larsen, au sol, chaînes, Smith, poulie, élastique, unilatéral kettlebell).
2. **Ne pas repartir des GIF d'origine.** Ils sont énormes et c'est ce qui a saturé le stockage.
   Les `.webp` sont le même contenu, 5 à 10× plus léger.
3. **Ne pas juger un mouvement sur UNE image.** Les figurines sont **animées** : la première image
   est la **position de départ**, le seul instant où le mouvement n'a pas encore commencé. Pour
   savoir ce que fait l'exercice, extraire **4 images réparties** (`PIL.Image.seek`), jamais une.
   *Cette erreur a fait classer deux exercices à l'envers avant d'être repérée.*
4. **Ne pas deviner `unilateral` d'après le nom.** « Haltère » au singulier ne veut pas dire « un
   bras » (Pull-over, Hip Thrust, Leg Curl Haltère sont à deux mains) ; « iso-latéral » ne veut pas
   dire « un à la fois » (ça veut dire *bras de levier indépendants*). Les 57 cas litigieux ont été
   tranchés **à la main, figurine par figurine**. La colonne est une donnée vérifiée, pas une
   déduction.

## 4. Ce que `unilateral` change vraiment

**Définition retenue (Michel, 10/08/2026)** : *un exercice est unilatéral si **la série doit se
refaire de l'autre côté***. Ce n'est pas « combien de membres travaillent » — c'est ce critère-là qui
compte, parce que c'est lui qui double le volume.

**Comment noter une série**, dans les deux cas, avec **une seule règle** :

> **On note le poids qui BOUGE pendant la répétition.**

| Exercice | Ce qui bouge | On note |
|---|---|---|
| Développé Incliné Haltères | les 2 haltères montent | **60** (2 × 30) |
| Rowing Haltère (unilatéral) | 1 haltère monte | **28** |
| Curl Haltères (alterné) | 1 monte, l'autre pend | **30** |
| Squat Bulgare (unilatéral) | les 2 descendent avec le corps | **40** (2 × 20) |

Et **on ne saisit pas 6 séries** pour 3 séries faites des deux côtés : on saisit **3**, et
l'application sait qu'il faut **doubler le volume** et afficher « **par bras** / **par jambe** ».
*Saisir 6 lignes serait exact et insupportable à noter en salle.*

## 5. Les trous connus, dits honnêtement

- **20 exercices n'ont aucune figurine** — la liste est dans le JSON (`image_url` vide). Ne pas
  inventer d'image : afficher l'exercice sans figurine est préférable à une figurine fausse.
- **4 figurines ne sont rattachées à aucun exercice** (visibles dans `figurines.json`, champ
  `exercices` vide) : `front-squat-avec-halteres` · `montees-banc-lateral-halteres` ·
  `shrug-machine-mollets` · `triceps-haltere-un-bras`. Ce sont des images disponibles si
  l'application cible a ces exercices-là.
- **Le catalogue est en français.** Les noms sont des noms de salle française.

## 6. Si l'application cible a des exercices absents du catalogue

Les rapprocher **par `pattern` + `muscles_primaires`**, pas par ressemblance de nom. Deux exercices
qui portent des noms proches peuvent travailler des muscles opposés — cas réel : « Élévations lat »
tombait sur le *Lat Pulldown* (grand dorsal) au lieu des *élévations latérales* (deltoïde). En cas
de doute, **ne rien rattacher** : un lien faux coûte plus cher qu'un lien manquant.
