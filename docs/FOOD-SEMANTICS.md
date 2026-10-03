# 🔎 FOOD SEMANTICS V1 — la recherche d'aliments propose la forme qu'on mange

> **Créé le 02/10/2026 (FS-01, session-B, demande de Michel)**, après son retour terrain du 01/10
> (`docs/SUIVI-AUDIT.md`, « la recherche d'aliments propose le mauvais aliment en premier »).
> Ce fichier porte **ce que FS-01 → FS-04 ont fait** et **le contrat des lots suivants** (FS-05 → FS-07).
> ⛔ **Rien de FS-05 à FS-07 n'est construit.** FS-01 → FS-04 sont des checkpoints sur branche, **non publiés**.
> **FS-01** → classement déterministe · **FS-02** → taxonomie des formes · **FS-03** → préférences génériques
> conservatrices · **FS-04** → la forme affichée dans les résultats (une projection, sans effet sur le classement).
> ⛔⛔ **« Une préférence générique n'est jamais une correction d'une requête explicite. »**
> ⛔⛔ **« Il n'existe pas de règle universelle cuit > cru. »**
> ⚖️ **D-036 (Michel, 02/10)** : l'ordre physique des entrées du fichier CIQUAL n'est **pas** une règle métier et ne
> sert **jamais** de départage sémantique.

## 1. Le principe (Michel)

- **Déterministe** : même requête + même base + mêmes alias + même version du moteur = **même résultat, même ordre**.
  Pas d'IA dans la V1.
- **Une requête EXPLICITE gagne toujours sur une préférence par défaut** : « café » → la boisson, mais
  « café moulu » → le café moulu. Le moteur ne « corrige » jamais ce que la personne a écrit.

## 2. Le pipeline (FS-01)

```
frappe dans #af-desc → _afSuggInput
  ├─ ① son journal (_afSuggLocales, le plus récent d'abord) ............ immédiat, inchangé
  ├─ ② CIQUAL + table d'alias → _ciqualChercher ......................... SOURCE CANONIQUE
  │     _aliasCible(requête entière)  → la cible de la table passe devant
  │     _ciqualChercherSansAlias      → FOOD_SYNONYMES (« coca » → « cola »…), en tourniquet
  │     _ciqualChercherUne            → _fsIntention(q) → filtre _afRang → clé _fsCle → tri
  ├─ ③ marques (_marquesChercher) ........................................ inchangé
  └─ ④ Open Food Facts (réseau, différé) .................................. inchangé
→ _afSuggRendu → #af-sugg
```

**Avant FS-01** (master `f31dc234`) : le tri tenait en trois clés — « commence par » · « a dû approximer » ·
« nom le plus court » — puis **l'ordre du fichier**, avec une coupure aux **400 premiers** candidats (elle aussi
dépendante de l'ordre du fichier). Et CIQUAL et la table d'alias **rendaient chacun de leur côté** : si CIQUAL
arrivait d'abord, la liste s'affichait sans alias (« riz » → « Riz blanc, **cru** ») puis se reclassait sous le
doigt (« Riz blanc, **cuit** »). **Mesuré dans un navigateur, alias retardés de 1,5 s.**

**Après FS-01** :
- **un seul rendu**, quand CIQUAL **et** la table d'alias sont là (`Promise.all`) — le 1ᵉʳ affichage est
  l'affichage stabilisé. Hors ligne, `_aliasCharger` rend `null` et la liste sort une fois, sans alias ;
- **un ordre total** : la clé finit par le nom puis le code CIQUAL — plus jamais l'ordre d'arrivée ;
- **plus de coupure à 400** (trier les ~3 500 lignes au pire coûte ~1 ms).

## 3. Le résolveur (`app.js`)

| Pièce | Rôle |
|---|---|
| `_FS_VERSION` (= **3** depuis FS-03) | la version du moteur, rendue dans l'intention |
| `_FS_FORMES` · `_FS_ORDRE` | **la taxonomie** (FS-02, §9) : 12 formes, une seule table |
| `_FS_EVITE_GENERIQUE` · `_FS_PREFS_GENERIQUES` · `_fsProfil` · `_fsPreference` · `_fsPromouvoir` | **la couche de préférences** (FS-03, §10) — elle remplace `_FS_TRANSFORMEES` (FS-01/02) |
| `_fsFormesDuTexte(texte, opt)` | **la fonction canonique** (FS-02) : les formes d'un texte, pour la requête comme pour l'aliment. `opt.qualificatifs` : après la 1ʳᵉ virgule · `opt.debut` : en tête de segment, éventuellement après un petit mot (« Oeuf, **en** poudre ») |
| `_fsIntention(q)` | → `{version, mots, formes, generique}` : générique = aucune forme nommée ; les formes viennent de `_fsFormesDuTexte(q)` |
| `_fsCle(a, it, r)` | la clé de tri, **plus petite = plus haut** |
| `_fsComparer` | comparaison de deux clés |

**La clé, position par position** (chacune se dit en une phrase) :

1. **commence par** ce qu'on a tapé (master) ;
2. **forme** — **3** : il manque une forme **nommée** par la personne (lue partout dans le nom : « Lait en poudre ») ;
   sinon la préférence par défaut `_fsPreference` (FS-03, §10) : **2** évité · **1** neutre. L'explicite passe donc
   toujours AVANT la préférence ;
3. **approximation** — la forme tapée bat la forme dépluralisée (« pates » → des pâtes, jamais « Pâté ») (master).
   Après la forme, mesuré : sinon « Haricots verts, purée » (pluriel exact) passait devant « Haricot vert » ;
4. **mot entier** — « gaufre » est un mot de « Gaufre bruxelloise », pas de « Gaufrette » ;
5. **nom de tête exact** — « Fromage (aliment moyen) » avant « Fromage de tête » ;
6. **nom de tête au singulier** — « crêpes » → « Crêpe, nature » ;
7. **longueur** du nom ; 8. **nom** ; 9. **code** CIQUAL.

⚠️ **Une forme se lit là où la table la range** : jamais dans le 1ᵉʳ segment pour une préférence par défaut —
« Pâtes **sèches**, standard, cuites » sont des pâtes CUITES, et « **Purée** de pommes » est une compote.

⛔ **Essayé puis retiré, sur mesure** : une préférence « aliment moyen » dans la clé. Elle passait « Pâtes fraîches
farcies (aliment moyen) » devant les pâtes et « Cola, sans précision » devant « Cola, sucré » (non-régression
ft-v1113). **L'aliment moyen reste le choix de la TABLE D'ALIAS**, mot par mot, là où il se lit.

## 4. La table d'alias (`tools/alias.py` → `data/alias.json`)

Trois changements, tous dans le générateur avec leur raison (R27) :
- `pomme`/`pommes` → **13396** « Pomme, chair sans peau, crue (aliment moyen) » (la table visait « Pomme, sèche »,
  247 kcal/100 g au lieu de ~51) ;
- `haricot vert`/`haricots verts` → **20030** « Haricot vert, cuit » (la table visait la purée ; cuit en premier,
  décision cru/cuit ft-v1115) ;
- `eau` → **18066** « Eau du robinet » (le résultat de master ; il ne tenait qu'à la coupure à 400 — sans elle,
  « Eau de coco » passait devant).

## 5. Avant / après (1ᵉʳ résultat, vraie base + vraie table d'alias)

| Requête | master `f31dc234` | FS-01 |
|---|---|---|
| café | Café, moulu | Café, instantané, sans sucres ajoutés, prêt à boire |
| café au lait / cappuccino | Café au lait ou cappuccino, poudre soluble | Café au lait, café crème ou cappuccino, …, prêt à boire |
| thé | Thé, feuille | Thé infusé, sans sucres ajoutés |
| pomme | Pomme, sèche | Pomme, chair sans peau, crue (aliment moyen) |
| fromage | Fromage de tête | Fromage (aliment moyen) |
| omelette | Omelette norvégienne | Omelette, garnitures diverses … (aliment moyen) |
| crêpe | Crêpe dentelle nature | Crêpe, nature, préemballée, rayon frais |
| gaufre | Gaufrette, fourrée vanille | Gaufre bruxelloise ou liégeoise nature, artisanale |
| curry | Curry, poudre | **Curry, poudre** (inchangé, voir §6) |
| haricots verts | Haricots verts, purée | Haricot vert, cuit |
| spaghetti bolognaise · carbonara | le plat | le plat (inchangé) |
| café moulu · café poudre · thé feuilles | la forme nommée | la forme nommée |
| pomme séchée | **RIEN** | Pomme, sèche |
| haricots verts purée | Haricots verts, purée | Haricots verts, purée |

**Différentiel** sur 2 519 requêtes (1ᵉʳ mot et 2 premiers mots de chaque nom CIQUAL + toutes les clés d'alias) :
**138 premiers résultats changent**, en grande majorité vers la forme courante (citron, fève, menthe, chocolat,
huître, cidre, vin, sauce…). Quelques changements **neutres ou discutables**, laissés à FS-03 plutôt que de
multiplier les règles : `pois` → « Pois d'Angole » · `legume` → « Légumes, mélange surgelé » (au lieu de « Légume
cuit (aliment moyen) ») · `haricot(s)` · les soupes (« déshydratée reconstituée » et « préemballée à réchauffer »
ont la même longueur : l'ordre alphabétique tranche, là où l'ordre du fichier tranchait).

**Deux témoins du runner adaptés, avec leur raison (R30)** — ils ne tenaient qu'à l'ordre du fichier :
- `oeuf` **sans** table d'alias : « Oeuf dur » → **« Oeuf cru »** (même longueur ; « cru » est aussi la cible de
  la table) ;
- `riz` **sans** table (hors ligne) : « Riz blanc, cru » → **« Riz, mélange de variétés …, cru »** (le nom de tête
  exact passe devant un nom composé plus court — la règle même qui rend « Fromage » et non « Fromage de tête ») ;
  l'intention du témoin (jamais bloquant, un riz cru) reste vérifiée.

## 6. Limites connues (mesurées, non corrigées)

- **curry** reste « Curry, poudre » : les données ne séparent pas proprement le plat de l'épice (cannelle,
  paprika suivent le même motif). Figé par un témoin pour qu'il ne change pas en passant.
- **riz sec** rend « Vermicelles de riz sèches, crues » (comme master) : pour CIQUAL, le riz « sec » s'appelle
  « cru ». ↪️ FS-02 a **classé** (la requête nomme `seche`, l'aliment porte `cru`) **sans inventer** d'équivalence
  (cadrage de Michel) : décider que « riz sec » doit rendre le riz cru est une préférence, donc **FS-03** (§9).
- **courgette** : la table d'alias vise la purée, même défaut que pomme / haricots verts (signalé dans
  `tools/alias.py`, laissé à FS-03).

## 7. Le contrat des lots suivants (⛔ FS-05 → FS-07 non construits)

| Lot | Contenu | Ce que FS-01 → FS-03 lui laissent |
|---|---|---|
| **FS-01** ✅ | pipeline canonique, résolveur déterministe, explicite prioritaire, alias avant le 1ᵉʳ affichage | — |
| **FS-02** ✅ | taxonomie des formes (§9) | — |
| **FS-03** ✅ | préférences génériques conservatrices (§10) | — |
| **FS-04** ✅ | affichage de la forme dans les résultats (§11) | — |
| **FS-05** | corpus de ~100–150 requêtes courantes | les bancs `food_semantics` / `food_formes` / `food_prefs` / `food_affichage` et les différentiels (avec ET sans alias, résultats entiers et valeurs) |
| **FS-06** | mutations étendues | `tools/mut_food_semantics.py` · `mut_food_formes.py` · `mut_food_prefs.py` · `mut_food_affichage.py` |
| **FS-07** | passe complète + publication | ⚠️ **le contrôle sur iPhone du badge de forme (RENDU-IOS-01, T4 manuel)** : le conteneur n'a que Chromium (WebKit absent, vérifié le 03/10) |

**Les invariants à garder dans tous les lots** : même entrée = même ordre (les témoins de déterminisme mélangent la
base 4 fois) · **jamais l'ordre du fichier** (D-036) · une forme nommée gagne toujours · un seul rendu quand CIQUAL et
les alias sont là · une seule table de formes · un choix pour **un mot précis** va dans la table d'alias (R2, le
générateur est le seul propriétaire), une règle **générale** va dans la clé · une préférence ne touche JAMAIS une
requête explicite et ne choisit que le PREMIER résultat (le cru reste juste sous le cuit, ft-v1115).

## 8. Les preuves

- Banc `node tools/banc_food_semantics.js` — blocs B-CDXXVIII (source) · B-CDXXIX (résolveur conduit sur la vraie
  base) · B-CDXXX (premier affichage par la vraie frappe : alias retardés, CIQUAL retardé, alias injoignables).
- Contrôle négatif `python3 tools/mut_food_semantics.py` (M00 = le code de master, M1 → M6 demandés par Michel,
  M7 → M11 pour les autres pièces, 5 déguisées, 1 équivalente, 1 commentaire).
- Banc `node tools/banc_food_formes.js` — blocs B-CDXXXI (une table, une fonction) · B-CDXXXII (vraie base :
  corpus par forme, pièges, comptes, requêtes explicites, ambiguïtés, déterminisme). Contrôle négatif
  `python3 tools/mut_food_formes.py` (M00 = le code de FS-01, M1 → M10 demandés par Michel, 4 déguisées,
  1 équivalente, 1 commentaire).
- Scénarios de recette `NUTRI-RECHERCHE-FS01` et `NUTRI-RECHERCHE-FS02` ; la table d'alias est une zone du sélecteur.

## 9. FS-02 — la taxonomie des formes (02/10/2026, checkpoint non publié)

**Trois notions séparées, jamais mélangées** : ① les formes **nommées** dans la requête (`_fsIntention(q).formes`) ·
② les formes que **porte** un candidat (`_fsFormesDuTexte(nom)`) · ③ la **préférence** par défaut d'une requête
générique (`_FS_TRANSFORMEES`, celle de FS-01, **inchangée** en FS-02 — ↪️ FS-03 l'a déplacée dans sa propre couche, §10). ① et ② passent par **la même
fonction et la même table** : l'ancienne `_fsFormesDuNom` et son dictionnaire FS-01 ont disparu.

**Comment un mot devient une forme** : mots **entiers** (découpés sur l'espace et la barre : « sauté/poêlé ») ·
« **sans** X » n'est pas X · une **sauce** doit ouvrir le **nom** · une **partie** exige l'œuf dans le texte ·
plusieurs formes possibles (« Haricot vert, surgelé, cuit » → `cuit` + `surgele`) · sortie dans l'ordre de la table.

**Mesuré sur la vraie base** (`data/ciqual.json`, **3 341** aliments proposables ; 1 298 ne portent aucune forme,
253 en portent plusieurs) — figé par B-CDXXXII :

| Forme | Mots reconnus (normalisés) | Aliments | dont en tête de qualificatif | Exemples CIQUAL |
|---|---|---|---|---|
| `cru` | cru, crue, crus, crues | 598 | 460 | Poulet, viande crue · Haricot vert, cru |
| `cuit` | cuit(e)(s), bouilli(e)(s), braisé(e)(s), frit(e)(s), grillé(e)(s), sauté(e)(s), poêlé(s), vapeur | 526 | 351 | Riz blanc, cuit, sans sel ajouté · Champignon de Paris, sauté/poêlé |
| `seche` | sec, secs, sèche(s), séchée(s) | 164 | 58 | Pomme, sèche · Abricot, dénoyauté, sec · Lentille, sèche |
| `poudre` | poudre(s), moulu(e)(s), soluble(s) | 38 | 30 | Café, moulu · Lait en poudre, entier · Oeuf, en poudre |
| `feuille` | feuille(s) | 11 | 3 | Thé, feuille |
| `boisson` | boisson(s), prêt(e)(s) à boire, infusé(e), infusion | 106 | 15 | Café, instantané, …, prêt à boire · Thé infusé |
| `puree` | purée(s) | 34 | 10 | Haricots verts, purée · Tomate, purée, appertisée |
| `sauce` | sauce(s) — **en tête du nom** | 70 | 0 | Sauce au curry, chaude, préemballée · Sauce carbonara |
| `prepare` | préemballé(e)(s), cuisiné(e)(s), fait(e) maison, restauration rapide | 571 | 565 | Poulet basquaise, préemballé |
| `partie` | blanc(s), jaune(s) — **avec l'œuf** | 6 | 6 | Oeuf, blanc (blanc d'oeuf), cru |
| `surgele` | surgelé(e)(s) | 67 | 66 | Haricot vert, surgelé, cuit |
| `conserve` | appertisé(e)(s), conserve(s), semi-conserve | 114 | 110 | Haricot vert, appertisé, égoutté |

**Les pièges mesurés, et pourquoi ces mots ne sont PAS des formes** :
- « **sèche** » sert au fruit séché (« Pomme, sèche ») **et** au légume sec (« Lentille, sèche ») : sec et séché ne font
  donc **qu'une** forme — les séparer reposerait sur les accents, que la personne ne tape pas ;
- « **poêlée** » est le plus souvent un plat (« Poêlée de légumes, surgelée, crue ») · « **rôti** » un morceau (« Porc,
  rôti cru ») · « **plat** » un légume (« Haricot plat ») · « **précuit** » n'est pas cuit · « **déshydratée
  reconstituée** » (34 soupes et bouillons) n'est ni sèche ni une boisson ;
- « **sauce** » en tête d'un qualificatif est un plat EN sauce (« Ravioli au boeuf, sauce tomate », « Maquereau, …, en
  sauce ») ; « avec sauce » un ingrédient ;
- « **blanc** » / « **jaune** » seuls ne sont pas une partie (« Riz blanc », « Fromage blanc », « Poivron, vert, jaune ou
  rouge ») ;
- ⚠️ **limite** : une cuisson dite par un mot propre au plat n'est pas reconnue (« Oeuf dur », « Oeuf poché », « à la
  coque », « brouillé ») — « dur » sert aussi à « blé dur ». Et une virgule **dans une parenthèse** coupe un segment
  comme les autres (« Salade César (salade verte, fromage, croûtons, sauce) »).

**Les ambiguïtés, figées telles quelles (ce sont des décisions de FS-03, pas de FS-02)** — ↪️ FS-03 (§10) : riz sec, curry et poulet restent **volontairement sans préférence** ; courgette est **tranchée** (alias retiré) :
1. **« riz sec »** → la requête nomme `seche` ; « Riz blanc, cru » porte `cru`. CIQUAL range le riz sec sous « cru » ;
   **aucune équivalence sec = cru n'est inventée** — le 1ᵉʳ résultat reste « Vermicelles de riz sèches, crues ».
2. **« curry »** → « Curry, poudre » = `poudre` · « Sauce au curry » = `sauce` + `prepare` · « Poulet au curry et au
   lait de coco, préemballé » = `prepare`. Rien n'est décidé : « curry » rend toujours la poudre.
3. **« poulet »** → requête générique, jamais transformée en « poulet cuit » ; les premiers résultats restent crus.
4. **« courgette »** → la table d'alias vise « Courgette, purée » (`puree`) ; laissé tel quel.

**Requêtes explicites** (le 1ᵉʳ résultat porte la forme nommée) : café moulu · café poudre · thé feuilles · pomme
séchée · haricots verts purée · riz cuit · riz cru · poulet cru · haricots verts surgelés cuits (`cuit` + `surgele`) ·
lait en poudre · sauce curry.

**Différentiel FS-01 → FS-02** : **0** premier résultat changé sur **2 519** requêtes génériques ; **2** sur **974**
requêtes explicites (1ᵉʳ mot d'un nom + un mot de forme réellement présent dans ce nom), les deux vers la forme
nommée : « bar cuit » → « Bar commun ou loup, rôti/cuit au four » (au lieu d'une barre chocolatée) ; « bette
feuille » → « Bette ou blette, côte et feuille, … » (au lieu de la bette « sans feuille »). **0** requête devenue
sans résultat.

## 10. FS-03 — les préférences génériques conservatrices (02/10/2026, checkpoint non publié)

**La question** : *quand la personne ne précise pas la forme, laquelle proposer en premier ?* **Une seule couche**
(`app.js`) qui LIT la taxonomie et n'y écrit rien — `_FS_FORMES` reste purement descriptive :

| Pièce | Rôle |
|---|---|
| `_FS_EVITE_GENERIQUE` | pour TOUTE requête générique, un aliment qui porte, en tête d'un segment, une forme transformée NON nommée descend : `poudre`, `feuille`, `seche`, `puree`, `partie` (la règle de FS-01) **+ `sauce`** |
| `_FS_PREFS_GENERIQUES` | 4 profils, chacun avec sa raison : **riz** → cuit · **pâtes** et leurs formes (`_AF_FORMES_PATES` : spaghetti, penne, macaroni…) → cuit · **haricot vert** → cuit · **curry** → **ambigu** (aucune préférence) |
| `_fsProfil(it)` | le profil d'une requête **générique**, à l'**identique** (au pluriel près) — jamais par préfixe : « riz au lait », « pâtes bolognaise » n'héritent de rien |
| `_fsPreference(it, nom)` | 1 neutre · 2 évité — une forme **nommée** n'est jamais évitée |
| `_fsPromouvoir(it, out)` | remonte en tête le meilleur candidat qui porte la forme préférée — **le premier résultat seulement** |

**Deux choix, mesurés avant d'être faits** :
1. **La préférence choisit le PREMIER résultat, pas l'ordre entier.** Appliquée à toute la liste, elle repoussait
   tout le cru sous le cuit (« riz » : cinq riz cuits avant le premier cru) — contre la **décision de Michel du
   03/09** (*« les deux, le cuit en premier »*, ft-v1115), figée par deux témoins du runner : **le cru reste juste
   dessous**.
2. **Elle ne rejoue pas un choix déjà fait par la table d'alias** (R2) : quand « riz » a sa cible (« Riz blanc,
   cuit »), la préférence ne s'applique pas à la suite de la liste. Elle sert donc là où l'alias ne répond pas :
   **hors ligne** (alias indisponibles), et les mots **sans alias** (macaroni, fusilli, farfalle, linguine…).

**Ce qui est volontairement SANS préférence (ambiguïtés assumées)** :
- **curry** : poudre, sauce ou plat — profil `ambigu`, comportement de FS-01 conservé (« Curry, poudre ») ;
- **viandes, poissons, œufs** : on pèse cru OU cuit — aucune préférence de cuisson ; les premiers résultats restent
  ceux de FS-02 (crus, par la table d'alias historique) ;
- **sec ≠ cru** quand CIQUAL ne permet pas l'équivalence : « riz sec » respecte la forme nommée, sans proposer le riz cru ;
- **légumes en général, courgette, soupes** : aucune préférence cru/cuit prouvée ; CIQUAL ne sépare pas une soupe en
  poudre d'une soupe prête (« déshydratée reconstituée » EST prête) ;
- ⚠️ **limite** : hors ligne, « raisin » rend encore « Raisin sec » — le mot est dans le nom même (comme « Biscuit sec »,
  « Saucisson sec »), et l'éviter casserait ces produits-là. En ligne, la table d'alias répond (ci-dessous).

**Les alias, classés (633)** : **487 lexicaux** (synonyme, orthographe, nom courant) · **146 « de préférence »** (ils
choisissent une forme parmi plusieurs : 67 → cru, 51 → cuit, 18 → pâtes cuites, …). ⛔ **On n'a pas nettoyé la table** :
seuls les trois défauts prouvés sont migrés, dans `tools/alias.py` avec leur raison :
- `courgette(s)` → « Courgette, purée » : **RETIRÉ** (nouvelle liste `RETRAITS`) — pas d'aliment moyen ; le moteur
  évite la purée sans imposer cru ou cuit ;
- `poire(s)` → « Poire belle Hélène » (un dessert glacé) → **« Poire, chair, crue (aliment moyen) »** ;
- `raisin(s)` → « Raisin sec » → **« Raisin cru (aliment moyen) »** (« raisins secs » reste explicite).

**Avant / après (1ᵉʳ résultat)** :

| Requête | FS-02 (en ligne · hors ligne) | FS-03 (en ligne · hors ligne) |
|---|---|---|
| riz | Riz blanc, cuit · **Riz, mélange…, cru** | Riz blanc, cuit · **Riz thaï, cuit** |
| pâtes / spaghetti | Pâtes sèches, cuites · **Pâtes sèches, crues** | Pâtes sèches, cuites · **Pâtes sèches, cuites** |
| macaroni, fusilli, penne… (sans alias) | **Pâtes sèches, crues** | **Pâtes sèches, cuites** |
| haricots verts | Haricot vert, cuit · **Haricot vert, cru** | Haricot vert, cuit · **Haricot vert, cuit** |
| courgette | **Courgette, purée** · Courgette, crue | Courgette, chair et peau, crue (les deux) |
| poire | **Poire belle Hélène** · Poire, crue | **Poire, chair, crue (aliment moyen)** · Poire, crue |
| raisin | **Raisin sec** · Raisin sec | **Raisin cru (aliment moyen)** · Raisin sec |
| carbonara | Pâtes à la carbonara · **Sauce carbonara** | Pâtes à la carbonara (les deux) |
| café · thé · pomme · curry · poulet · fromage · lait · soupe | inchangés | inchangés |

**Différentiel FS-02 → FS-03** (mêmes requêtes rejouées des deux côtés) — **en ligne** : 6 premiers résultats changés
sur 2 519 génériques (les 6 alias migrés), **0** sur 974 explicites, 0 vide ; **hors ligne** : 20 sur 2 520 génériques
(17 pâtes et formes de pâtes → cuites, 2 haricots verts → cuit, riz → cuit, et carbonara → le plat), **0** explicite,
0 vide.

## 11. FS-04 — la forme affichée dans les résultats (03/10/2026, checkpoint non publié)

**Un lot d'affichage, rien d'autre.** La forme affichée est une **projection** de la taxonomie FS-02
(`_fsFormesDuTexte`) : aucune 2ᵉ taxonomie, aucune modification du classement (FS-01 → FS-03), des alias, de la
recherche ni des valeurs. Le classement ne lit rien de l'affichage (vérifié par témoin de source).

**Le rendu** : chaque résultat CIQUAL de la recherche d'aliments porte, en tête de sa **ligne de détail** (celle des
kcal, jamais tronquée), un petit libellé texte — `Cuit` · `155 kcal/100 g · P 3,3 · …`. Le nom, lui, est tronqué
sur une ligne ; la forme ne l'est jamais. Style `.af-forme` (`style.css`) : petit, couleur de texte secondaire,
bordure fine — **du texte, jamais une couleur seule**. Pas de popup, pas de texte explicatif.
⚠️ Périmètre : la liste **CIQUAL** seulement (la source de Food Semantics) — « déjà noté par toi », fast-food et Open
Food Facts sont inchangés.

**Le mapping (12 formes FS-02 → libellés)** :

| Forme | Libellé | Forme | Libellé |
|---|---|---|---|
| `cru` | Cru | `puree` | Purée |
| `cuit` | Cuit | `sauce` | Sauce |
| `seche` | Sec / séché | `prepare` | Préparé |
| `poudre` | Poudre / moulu | `partie` | Blanc ou jaune d'œuf |
| `feuille` | Feuilles | `surgele` | Surgelé |
| `boisson` | Boisson | `conserve` | Conserve |

Libellés au masculin : la forme est un ÉTAT, pas un accord (« Pomme, chair et peau, crue » → `Cru`). `Sec / séché`
dit honnêtement que CIQUAL ne distingue pas les deux (§9).

**Aucune forme reconnue → rien.** 1 298 aliments sur 3 341 ; aucun libellé « standard », « brut » ou « inconnu » —
*l'absence de forme n'est pas un défaut*.

**Plusieurs formes (253 aliments) — inventaire réel, puis deux règles et un plafond** :

| Combinaison (nb) | Exemple | Affiché |
|---|---|---|
| sauce + préparé (64) | Sauce tartare, préemballée | Sauce |
| cuit + préparé (43) | Paupiette de veau, préemballée, rôtie/cuite au four | Cuit |
| cru + surgelé (33) | Haricot vert, surgelé, cru | Cru · Surgelé |
| cru + préparé (17) | Boulettes au porc et au boeuf, préemballées, crues | Cru |
| boisson + préparé (14) | Boisson à l'amande, …, préemballée | Boisson |
| cuit + surgelé (14) | Haricot vert, surgelé, cuit | Cuit · Surgelé |
| cuit + sec (10) | Pâtes sèches, standard, cuites | Cuit |
| purée + préparé (9) | Aligot (purée de pomme de terre…), préemballé | Purée |
| cru + sec (8) | Pâtes sèches, standard, crues | Cru |
| 3 formes ou plus (8) | Meloukhia, feuilles de corète séchées, en poudre | Poudre / moulu · Feuilles |

① « **sec** » à côté de cru / cuit dit le TYPE de produit, pas l'état — retiré (18 aliments) ; ② « **préparé** » à côté
d'une autre forme n'ajoute rien — retiré (il reste seul sur les plats préparés : « Crêpe, nature, préemballée ») ;
③ **2 libellés au plus**, dans un ordre fixe : ce que l'aliment EST (boisson, sauce, poudre, purée, feuilles, partie)
avant son état (cru, cuit, sec) avant son conditionnement (surgelé, conserve), « préparé » en dernier.
⚠️ Limite : « Poêlée de légumes … grillée …, surgelée, crue » affiche `Cru · Cuit` (« grillée » est dans le nom du
plat) — 1 aliment, laissé tel quel plutôt qu'une règle de plus.

**En ligne / hors ligne** : le libellé ne dépend que du NOM de l'aliment, donc un même aliment s'affiche pareil dans
les deux cas. ⚠️ **La limite connue de FS-03 reste VISIBLE, honnêtement** : hors ligne, « raisin » rend « Raisin sec »,
affiché `Sec / séché` ; le classement n'est pas corrigé ici (hors périmètre).

**Preuves** : banc `node tools/banc_food_affichage.js` (B-CDXXXV source · B-CDXXXVI projection sur la vraie base ·
B-CDXXXVII vraie frappe, en ligne et hors ligne, 390 et 430 px, noms longs) ; contrôle négatif
`python3 tools/mut_food_affichage.py` ; **différentiel FS-03 → FS-04 : 0 changement** sur 2 518 requêtes génériques et
974 explicites, en ligne et hors ligne, sur les **6 premiers résultats entiers et leurs valeurs** (kcal, P, G, L).
