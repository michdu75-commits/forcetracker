# 🔎 FOOD SEMANTICS V1 — la recherche d'aliments propose la forme qu'on mange

> **Créé le 02/10/2026 (FS-01, session-B, demande de Michel)**, après son retour terrain du 01/10
> (`docs/SUIVI-AUDIT.md`, « la recherche d'aliments propose le mauvais aliment en premier »).
> Ce fichier porte **ce que FS-01 a fait** et **le contrat des lots suivants** (FS-02 → FS-07).
> ⛔ **Rien de FS-02 à FS-07 n'est construit.**

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
| `_FS_VERSION` (= 1) | la version du moteur, rendue dans l'intention |
| `_FS_FORMES` | les **formes** connues : `poudre` (moulu, soluble), `feuille`, `seche` (sec, séché), `puree`, `partie` (blanc/jaune d'œuf). Pour chacune : les mots qui la **nomment** dans la requête, le début de qualificatif CIQUAL qui la **porte**, et ce qu'on cherche quand elle est nommée (« séchée » → « sec ») |
| `_fsIntention(q)` | → `{version, mots, formes, generique}` : générique = aucune forme nommée |
| `_fsFormesDuNom(nom, partout)` | les formes que porte un aliment, lues dans ses **qualificatifs** (après la 1ʳᵉ virgule, éventuellement après un petit mot : « Oeuf, **en** poudre ») ; `partout` aussi dans le 1ᵉʳ segment, pour une forme nommée (« Lait en poudre ») |
| `_fsCle(a, it, r)` | la clé de tri, **plus petite = plus haut** |
| `_fsComparer` | comparaison de deux clés |

**La clé, position par position** (chacune se dit en une phrase) :

1. **commence par** ce qu'on a tapé (master) ;
2. **forme non demandée** — générique : un aliment qui porte une forme transformée (poudre, feuille, séché, purée,
   partie) descend ; explicite : un aliment qui ne porte **pas** la forme nommée descend ;
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
  « cru ». Comprendre l'équivalence sec/cru est un travail de **taxonomie** (FS-02).
- **courgette** : la table d'alias vise la purée, même défaut que pomme / haricots verts (signalé dans
  `tools/alias.py`, laissé à FS-03).

## 7. Le contrat des lots suivants (⛔ non construits)

| Lot | Contenu | Ce que FS-01 lui laisse |
|---|---|---|
| **FS-02** | taxonomie minimale des formes alimentaires (cru, cuit, sec, poudre, boisson, séché, purée, sauce, plat préparé…) et leurs équivalences (sec ↔ cru pour les céréales) | `_FS_FORMES` : une table, une ligne par forme ; `_fsIntention` rend déjà les formes nommées |
| **FS-03** | préférences par défaut plus larges (pois, légume, courgette, soupes…) | la table d'alias pour un mot précis ; la clé `_fsCle` pour une règle générale |
| **FS-04** | affichage explicite de la forme dans l'interface | les formes d'un aliment se lisent par `_fsFormesDuNom` |
| **FS-05** | corpus de ~100–150 requêtes courantes | le banc `tools/banc_food_semantics.js` et le différentiel |
| **FS-06** | mutations étendues | `tools/mut_food_semantics.py` |
| **FS-07** | passe complète + publication | — |

**Les invariants à garder dans tous les lots** : même entrée = même ordre (le témoin de déterminisme mélange la
base 4 fois) · une forme nommée gagne toujours · un seul rendu quand CIQUAL et les alias sont là · un choix pour
**un mot précis** va dans la table d'alias (R2, le générateur est le seul propriétaire), une règle **générale** va
dans la clé.

## 8. Les preuves

- Banc `node tools/banc_food_semantics.js` — blocs B-CDXXVIII (source) · B-CDXXIX (résolveur conduit sur la vraie
  base) · B-CDXXX (premier affichage par la vraie frappe : alias retardés, CIQUAL retardé, alias injoignables).
- Contrôle négatif `python3 tools/mut_food_semantics.py` (M00 = le code de master, M1 → M6 demandés par Michel,
  M7 → M11 pour les autres pièces, 5 déguisées, 1 équivalente, 1 commentaire).
- Scénario de recette `NUTRI-RECHERCHE-FS01` ; la table d'alias est une zone du sélecteur.
