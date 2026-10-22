# 🥗 Nutrition V2 — architecture et récupération de l'historique (jalon 1)

> **22/10/2026 · session-A (Claude Nutrition) · branche `claude/nutrition-v2`** (depuis master `f82a7c07`, `ft-v1258`).
> **Statut : PROPOSITION.** Rien n'est construit, rien n'est en production, aucune donnée réelle n'est écrite.
> Décision de départ : **D-096** (Michel, 22/10) — reconstruire le cœur Nutrition sur le clone, et récupérer les
> journaux historiques ; *« une V2 sans récupération fiable de l'historique ne sera pas considérée comme terminée »*.
> Les mesures sur un journal réel (§4.3) viennent de l'extrait du 20/10, **lu sans écrire** ; ce document n'en porte que
> des **agrégats** (aucun nom d'aliment, aucune ligne). Le détail ligne par ligne reste hors du dépôt (`audits/`, exclu).
>
> ↪️ **Mise à jour du 22/10 (08:50 UTC) — répartition décidée par Michel (D-098)** : l'inventaire, la sécurisation et la
> récupération des anciens journaux passent à **Claude Principal**. Nutrition V2 garde le moteur et un **adaptateur des
> anciennes lignes en lecture seule** (§2.5), *« sans jamais modifier les originaux ni inventer de quantités manquantes »*.
> Les §4 à §7 (classement A/B/C/D, migration, scénarios zéro perte) restent la **proposition de référence** pour ce
> chantier, que Nutrition V2 ne mène plus. **Jalon 2 livré** : `nutrition-v2.js` (non branché à l'app), banc 53 / 0,
> contrôle négatif 20 / 20 (§8).

---

## En bref

1. **Un seul calcul, une seule porte d'écriture.** Valeurs = fiche × quantité, par une fonction pure ; une ligne ne
   reçoit jamais la quantité ou la fiche d'une autre ; un champ inconnu reste « ? », jamais 0 ; une quantité absente,
   nulle ou illisible n'enregistre rien.
2. **Pas de second journal.** V2 enrichit les lignes là où elles sont (`S.foodLog`, **R1**) : elle ajoute ce qui manque
   (provenance, statut, corrections, trace de migration) sans changer **un seul chiffre affiché** tant que la personne
   n'a rien accepté. Tout le reste de l'app (Accueil, Milo, export, nuage) continue de lire les mêmes champs.
3. **L'historique, mesuré sur 517 lignes réelles** : **187 fiables (A)** · **161 réparables avec une preuve (B)** ·
   **142 à confirmer (C)** · **27 gardées telles quelles avec un signalement (D)**. Aucune ligne perdue ; **aucune
   quantité ni aucune valeur tapée n'est changée sans réponse** (D-095).
4. **Avant toute migration** : une copie intacte du journal d'origine, écrite une seule fois, vérifiée par empreinte
   SHA-256 ; retour arrière à l'octet ; relance sans doublon ni double correction.
5. **Les autres comptes attendent** le chemin d'identité de Claude Principal : aujourd'hui, un compte sans code perso
   peut voir son journal **remplacé en bloc** par n'importe quel client qui connaît son e-mail (§9).
6. **Le clone sert à construire et essayer V2 avec des données fictives.** Il ne peut pas recevoir de vraies données :
   aucun import par fichier n'existe, et **D-084** l'interdit.
7. **Estimation** : ≈ 32 h de développement + ≈ 11 h 30 d'exécution des tests, en cinq jalons ; risque de reprise à
   part (§10). Chaque publication du clone = ton feu vert.
8. **Trois décisions** t'attendent (§11).

---

## 1. Ce que V2 garantit — le contrat, et la cause racine que chaque clause ferme

Les causes racines sont celles du dossier de nuit du 21/10 (CR-1 à CR-5) ; chacune est fermée **par construction**, pas
par un garde ajouté après coup.

| Exigence (décision du 22/10) | Mécanisme V2 | Cause fermée |
|---|---|---|
| Provenance explicite des références | la fiche porte clé stable, source, version, fiabilité ; la ligne garde le pour-100 g **exact** qui a servi | CR-5 (la provenance ne dit pas ce qu'elle prétend) |
| Pour-100 g / 100 ml ≠ quantité consommée | deux données séparées ; **aucune** valeur de ligne n'est relue comme une fiche sans confirmation | CR-1 ① (M1 : le poids mangé devenait le poids des valeurs) |
| g et ml explicites, pas de conversion sans densité | base de la fiche ∈ {g, ml, portion} ; ml ↔ g **seulement** par une densité sourcée, sinon le calcul **refuse** | CR-1 ⑦, CR-4 (le ml perdu à l'ajout, écrit « g » à la modification) |
| Anciennes portions jamais interprétées | « 1 portion » sans poids reste « 1 portion » (ligne **déclarée**) ; aucune conversion en grammes sans preuve ni réponse | CR-1 ⑤, CR-3 |
| Portion du fabricant = suggestion, si poids/volume connu | une portion sans poids n'est **pas proposée** | CR-4 (« 33 cl » proposé comme « 330 g ») |
| **Une** fonction centrale déterministe | `nut2Calcule(fiche, quantité)` : pure, sans écran ni état global, la même pour l'ajout, la modification, la reprise, le favori, le repas habituel et la migration | CR-1, CR-2 (`_provFood` assemblait, `_qtyRescale` défaisait) |
| Champ absent ≠ zéro | un champ absent de la fiche est **absent** du résultat (« ? ») | CR-4 (une macro absente devenait 0, y compris côté Worker) |
| Quantité absente / invalide / nulle → rien | l'écrivain refuse une ligne pesée sans quantité > 0 ; la fiche n'est **jamais** enregistrée comme mangée | CR-1 ② (STR-01) |
| Changer de fiche ou de nom ne garde rien en silence | changer de fiche = recalcul depuis la nouvelle ; renommer ne change pas la fiche **et l'écran le dit** | CR-1 ④ (N2 : l'omelette au pour-100 g du riz) |
| Correction à la main gardée et tracée | une correction est une donnée (champ, valeur, valeur d'avant, date) ; un recalcul ne l'efface jamais | CR-2 (M4, N3) |
| Pas de dérive d'arrondi | aucun calcul ne part d'une valeur arrondie ; tout recalcul repart de la fiche et de la quantité | CR-4 |

---

## 2. La structure V2

### 2.1 Où vivent les données — les lignes existantes, enrichies

- **Le journal reste `S.foodLog`** (`ft4_foodlog`), les favoris restent `S.savedFoods` (`ft4_savedfoods`) : **R1** (une
  source de vérité) et **R2** (aucune donnée en double). Un journal V2 à côté de l'ancien aurait obligé à réécrire d'un
  coup **tous** les lecteurs (Accueil, Progrès, Milo, export, nuage, restauration — §3.3) et à réconcilier deux
  journaux sur deux appareils.
- **Les champs actuels gardent leur sens** et **sont** les données V2 : `date`, `meal`, `name`, `kcal` `prot` `carbs`
  `fat`, `q` `u`, `per100`, `sourceId`, `etat`, `portionLabel` `portionWeightG`, `id`, `ts`. Rien n'est recopié.
- **Chaque ligne ÉCRITE PAR V2 porte un objet `n2`** qui porte seulement ce qui manque à V1. ⛔ Une **ancienne** ligne
  n'est jamais réécrite par V2 : l'adaptateur en calcule une vue à la volée (§2.5) ; l'enrichir ou la réparer relève de
  la récupération (Claude Principal, D-098), avec ton feu vert.

```
n2 = {
  s:    1,                                   // version du schéma V2
  m:    'p' | 'd',                           // pesée (fiche + quantité → valeurs) | déclarée (valeurs écrites)
  f:    { src, ver, fiab, base, densite? },  // provenance de la fiche (sa clé reste `sourceId`, son contenu `per100`)
  qo:   'tapee' | 'portion' | 'proposee' | 'estimee' | 'v1',   // d'où vient la quantité
  st:   'fiable' | 'a-confirmer' | 'declaree' | 'non-verifiable',
  no:   [codes],                             // notes : 'portion-par-defaut-100g', 'repas-inconnu', 'quantite-non-prouvee'…
  corr: [{ c, v, avant, le }],               // corrections à la main, tracées
  mig:  { c: 'A'|'B'|'C'|'D', r: [règles], h: empreinte de la ligne d'origine, o: version de l'outil,
          avant?: {…},                       // valeurs d'avant, seulement si une correction a été acceptée
          dec?:   { option, le } }           // la réponse de la personne à une proposition C
}
```

- **Une ligne déclarée** (`m:'d'`) garde ses `q`, `u`, `per100` d'origine **pour mémoire** : ils sont affichés comme
  « notés, non vérifiés » et ne servent **jamais** à fabriquer une fiche ni à être repris ailleurs. C'est ce qui empêche
  une quantité contaminée (M6) ou un pour-100 g fabriqué (M1) de se propager. La personne peut toujours corriger les
  valeurs (correction tracée) ; une ligne en portions confirmée peut changer de **nombre** de portions (`ft-v1186` ③).
- **Mesuré** (517 lignes réelles, export du 20/10) : le journal V1 pèse **174 Ko** (JSON compact, 337 octets par
  ligne ; **28,8 Ko** compressé). L'objet `n2` complet ajoute **jusqu'à +45 %** sur le téléphone (+32 % compressé) ; réduit aux
  **décisions** (classe, réponse), il ajoute **+4 %** (+2 % compressé). D'où la règle du nuage (§6.4).

### 2.2 Trois bases, une fonction : `nut2Calcule(fiche, quantité)`

- **Bases** : `g` (pour 100 g), `ml` (pour 100 ml), `portion` (pour **une** portion **nommée**, décision `ft-v1186` :
  *« le label est stocké, jamais deviné »*).
- **Quantité** : un nombre fini **> 0** et une unité ∈ {g, ml, portion}. Une portion **pesée** porte son poids
  (`portionWeightG`) : la masse totale reste **dérivée** (`q × poids`), jamais stockée (`ft-v1186` ②) — « 2 steaks »
  ne devient pas « 250 g ».
- **Conversions permises, et seulement elles** : portion → masse par le poids d'une portion ; ml ↔ g par une densité
  sourcée. Toute autre combinaison : **refus** (`UNITE_INCOMPATIBLE`) — jamais « 1 ml = 1 g ».
- **Sortie** : pour chaque champ **présent** dans la fiche, `Math.round(facteur × valeur)` ; un champ absent reste
  absent et la sortie dit lesquels manquent.
- **Arrondi = celui de l'app aujourd'hui** (entier, `Math.round`). **Mesuré : les 206 lignes réelles « conformes »
  retombent toutes à l'identique**, les quatre valeurs. Une ligne fiable migrée garde donc ses chiffres au chiffre près.
- **Pure** : aucune lecture d'écran, de stockage, d'heure ou de réseau ; chargeable dans Node (même motif que
  `capacites-ia.js` et `food-health.js`).
- **Une fiche dérivée** (valeurs ÷ quantité) n'existe que sur **confirmation** de la personne, et suit alors la règle
  écrite de `ft-v1188` : dérivée des **totaux enregistrés**, à une décimale (`_per100d1`) — *« on ne devine pas, on
  vérifie »*.

### 2.3 L'écrivain unique : `nut2Ecrire(entrée, porte)`

Toutes les portes (ajout, ajout rapide, rejeu d'un repas, modification, favori, migration) appellent **la même**
fonction, avec un objet **complet** construit par l'appelant — **jamais** l'état de l'écran (principe de D-094 étendu
à toutes les portes).

1. Pesée sans fiche valide ou sans quantité > 0 → **refus**, rien n'est écrit (D-075, garde de `ft-v1254`, garde-fou
   large du 10/09 : *« Aucune ligne alimentaire ne peut être enregistrée sans une quantité réellement choisie par
   l'utilisateur »*).
2. Valeurs = `nut2Calcule` ; les corrections à la main sont réappliquées **par-dessus**, jamais effacées.
3. `date`, `meal`, `id`, `ts` obligatoires ; une ligne migrée garde **son** `id`.
4. **La douane continue d'observer** : `_douaneLigne(ligne, porte)` est appelée avec le nom historique de la porte
   (`addFoodEntry`, `quickAddFood`, `rejouerRepas`, `saveEditFood`). Ses 21 règles, son carnet et leur format restent
   **gelés** (13/09) ; ses verdicts ne bloquent toujours rien. Les refus de V2 sont ceux du contrat du 22/10, rien de plus.

### 2.4 Totaux, corrections, modèles

- **Total du jour = somme des lignes telles qu'affichées** (comme aujourd'hui) : une ligne fiable migrée ne change
  aucun total, et ce que la personne additionne de tête tombe juste.
- **Corriger à la main** enregistre la correction et la montre comme telle, valeur calculée à côté. **Changer la
  quantité** recalcule le calcul ; la correction **reste**, et l'écran demande : garder, ou revenir au calcul ?
- **Favori = raccourci vers un modèle** (D-051) : ajouter depuis un favori **recalcule** depuis sa fiche et la
  quantité choisie ; modifier un modèle ne réécrit **jamais** une prise passée (chaque ligne garde le pour-100 g qui a
  servi). Un favori sans fiche vérifiée est un modèle **déclaré**, qui le dit à chaque ajout.
- **Repas habituel** : toujours **déduit** du journal (aucun stockage). Le rejouer recalcule chaque élément pesé ; un
  élément déclaré est recopié **avec** son statut ; l'écran d'ajout n'est jamais lu (D-094).

### 2.5 L'adaptateur des anciennes lignes — `lireAncienne(ligne, ctx)`, en lecture seule (construit au jalon 2)

- **Il ne modifie rien** : ni champ, ni sous-objet ; la vue qu'il rend ne partage aucun objet avec la ligne (banc : 16
  lignes gelées, 0 octet changé ; mutation « il écrit sur l'ancienne ligne » : 18 témoins rouges).
- **Il n'invente rien** : quantité absente → absente ; unité absente → absente (jamais « g ») ; « 1 portion » sans poids
  → une portion sans poids ; repas inconnu ou ancien (`brunch`, `midi`) → tel quel, absent → `null` (jamais
  « déjeuner ») ; valeur illisible → absente et notée (jamais 0).
- **Les valeurs de la vue sont celles enregistrées**, au chiffre près. `q`, `u`, `per100` sont **notés** : ils ne servent
  à recalculer que si la ligne est **recalculable** — fiche retrouvée **à l'identique** (±0,05) dans la table CIQUAL
  embarquée que nomme `sourceId`, et valeurs qui en découlent exactement. Ce n'est **pas** un classement de
  récupération (A/B/C/D) : c'est la seule condition pour qu'une modification future de la quantité repasse par le calcul.
- **Ce qu'il note** (une liste de codes, rien de plus) : `sans-id`, `sans-version`, `sans-quantite`,
  `quantite-sans-unite`, `unite-sans-quantite`, `portion-sans-poids`, `fiche-sans-quantite`, `quantite-sans-fiche`,
  `fiche-non-verifiee`, `repas-absent`, `date-illisible`, `valeur-illisible:<champ>`, `saisie-inconnue`.
- `lireJournal` lit tout un journal : **une vue par ligne, dans l'ordre**, les lignes illisibles comprises (elles
  donnent une vue en échec, elles ne disparaissent pas) ; deux copies identiques restent deux vues.

---

## 3. Les anciennes données (V1) et leurs incompatibilités

### 3.1 Où elles sont, et comment elles voyagent

| Donnée | Clé | Nuage | Restauration |
|---|---|---|---|
| Journal `S.foodLog` | `ft4_foodlog` | les **8 000 dernières** lignes (ordre du tableau) ; le serveur **remplace** le journal en bloc (`_pa_`) | **union par `id`** (`_fusionnerFoodLogRestauration`) : la version du téléphone gagne à `id` égal |
| Favoris `S.savedFoods` | `ft4_savedfoods` | les **200 plus anciens** ; remplacés en bloc | **remplacés en bloc** dès que le nuage en a un |
| Aliments masqués `S.hiddenFoods` | `ft4_hiddenfoods` | non | non |
| Plan de repas `S.mealPlan` | `ft4_mealplan` | non | non |
| Carnet de la douane | `ft4_douane_obs` | non | non |

- **Une seule copie serveur par compte**, dans une propriété de script `u_<email>` compressée ; **toutes** les
  propriétés partagent un réservoir de **512 000 octets**, monté à **102 % le 29/07/2026**. Une copie Supabase en
  écriture seule reçoit le même journal ; une sauvegarde Drive, deux fois par jour, copie le compte entier.
- **Aucun import par fichier** de l'export complet n'existe : toutes les restaurations passent par le serveur.

### 3.2 La ligne V1, ses générations

`FOOD_LOG_V` vaut **1 depuis sa création** (`ft-v907`, 18/08) : `v` ne distingue **pas** les générations. Elles se
reconnaissent à leurs champs et à leur date (bornes du code, publiées progressivement — une date ne prouve qu'une
**borne**, l'arithmétique prouve le reste) :

| Génération | Jusqu'à | Signature |
|---|---|---|
| G0 | `ft-v907` (18/08) | pas de `v`, pas de provenance |
| G1 | `ft-v987` (24/08) | lecture de code-barres notée `scan` |
| G2 | `ft-v1111/1112` (03/09) | pour-100 g arrondi à l'entier, valeurs calculées avec |
| G3 | `ft-v1177/1179` (08/09) | ajout rapide sans `q`/`u`/`per100` ; `q` pouvant venir du produit précédent |
| G4 | `ft-v1183` (09/09) | portions enregistrées `q:null`, totaux multipliés |
| G5 | `ft-v1188/1190` (10/09) | pour-100 g dérivé à l'entier ; quantité posée sans geste (portion ou 100 g) |
| G6 | `ft-v1218` (16/09) | lignes rejouées au même `ts`, sans `id` |
| G7 | `ft-v1258` (21/10) | rejeu et ajout rapide lisant l'écran (M6) |
| G8 | aujourd'hui | quantité 0 / vide / illisible enregistrant la fiche (STR-01), ml perdu, macro absente → 0 |

### 3.3 Qui lit le journal (ce qu'une V2 ne doit pas casser)

`_foodTotals`, `_resteDuJour`, `_profilAlimentaire`, `_repasHabituels`, `_mesAliments`, `_portionsNotees`,
`_buildFoodQuickItems`, les suggestions « Déjà noté », l'édition (`app.js`) ; le journal, « Aujourd'hui », l'évolution
(`screens.js`) ; `tendance14j`, `_joursAlimComplets` (`state.js`) ; le contexte de **Milo** (totaux des 7 derniers
jours notés, `coach.js`) ; l'export JSON complet et le CSV ; la synchronisation et la restauration. Ils lisent tous les
champs plats : **c'est pourquoi V2 les garde**.

### 3.4 Les incompatibilités, et la règle V2 qui les remplace

| Comportement V1 | Règle V2 |
|---|---|
| `_provFood` colle `q`/`per100` lus à l'écran sur des valeurs venues d'ailleurs | l'appelant fournit un objet complet ; l'écrivain ne lit rien d'autre |
| `_qtyRescale` repart de la fiche et efface une correction | la correction est une donnée, réappliquée après tout recalcul |
| `per100` dérivé des valeurs d'une ligne (M1) | jamais sans confirmation ; dérivé alors selon `ft-v1188` |
| `modifie` vrai dès que la quantité change (STR-11) | n'est plus utilisé ; les corrections sont explicites |
| macro absente écrite 0 (cases entières, Worker) | champ absent = absent, « ? » à l'écran |
| ml perdu à l'ajout, écrit `g` à la modification | ml de plein droit, jamais converti sans densité |
| `u` supposé `g`, `q` inventée à la réouverture (formes anciennes) | jamais : la ligne reste déclarée |
| favori = copie figée de valeurs, identité = nom | modèle avec fiche ; identité dérivée du nom, ambiguïté signalée (`ft-v1188`) |
| repas inconnu rangé en « déjeuner » à l'écran, exporté brut | clé gardée telle quelle, signalée, jamais réaffectée (D-050) |

### 3.5 Trois fragilités existantes, constatées en lisant le code (NON VÉRIFIÉ à l'exécution)

- `load()` lit le journal par un `JSON.parse` nu dans un seul `try` : une valeur corrompue fait **sauter tout le reste
  du chargement**. V2 ne doit jamais écrire autre chose qu'un tableau JSON valide.
- Quand le stockage du téléphone est plein, `persist()` **réduit les séances gardées sur le téléphone à 50** (avec un
  drapeau qui protège le nuage) ; les clés Nutrition n'ont aucun repli. **Toute croissance du journal se paie ici** :
  d'où un `n2` compact, et l'instantané hors de `localStorage` (§6.1).
- La fusion entre deux onglets reconnaît une ligne par `date|nom|repas|kcal` : deux lignes identiques le même jour
  peuvent n'en faire qu'une. À reproduire au jalon 2 ; hors périmètre de V2.

---

## 4. Le classement A / B / C / D

### 4.1 La règle de preuve (D-095)

*« Le fait qu'une ligne soit mathématiquement cohérente ne démontre pas que la quantité réellement consommée était
correcte. »* Mesuré : **161 des 175 lignes « corrigées, certaines » de la v1.2 étaient parfaitement cohérentes avec leur
propre pour-100 g** — c'était le pour-100 g qui était faux. La cohérence interne ne prouve rien. D'où trois règles :

1. **A exige une fiche indépendante** (CIQUAL embarqué, base des marques, lecture de code-barres de première main, ou
   une ligne du même aliment qui porte cette source avec exactement ce pour-100 g) **et** des valeurs qui en découlent
   au chiffre près. **Jamais** un rapprochement par le nom seul (la famille « premier match gagnant », `BUGS.md`).
2. **B ne change jamais ce que la personne a tapé** : ni quantité, ni valeur écrite. B répare la **fiche** (pour-100 g
   fabriqué ou arrondi de l'époque) et recalcule depuis la **quantité tapée**.
3. **Toute quantité déduite, complétée ou rendue est C**, même quand l'arithmétique tombe juste (le critère F2/C6 que
   D-095 a écarté), et toute valeur tapée jugée impossible l'est aussi.

### 4.2 Définitions

| Classe | Ce que fait la migration | Statut V2 | Règles (outil v1.2, reprises) |
|---|---|---|---|
| **A — fiable** | rien ne change ; la ligne devient **pesée** | `fiable` | « conforme », sans note |
| **B — correction démontrée** | **proposée** : fiche indépendante, valeurs recalculées avec la quantité tapée ; appliquée après ton accord (un geste, liste consultable) ; d'ici là, ligne **déclarée** | `a-confirmer` puis `fiable` | C2 et C2-copie (pour-100 g fabriqué hérité) · C4 (arrondi de l'époque) · C5 (pour-100 g arrondi, valeurs justes) · favoris F3 |
| **C — plausible, à confirmer** | rien n'est appliqué ; la ligne reste **déclarée** avec ses valeurs ; les options chiffrées attendent une réponse | `a-confirmer` | C1 (quantité de l'écran sur un rejeu) · C3 (énergie tapée impossible) · C6 (quantité déduite) · E1/E1-copie · E2 · E3 · A-PRODUIT · A-ETAT · D-QUESTION · D-COPIE-EXC · D-DOSE/D-EXC (décision personnelle, **préremplie, pas appliquée**) · hypothèses de portion · favoris F1, F2, D-FAVORI |
| **D — insuffisante** | la ligne originale est gardée telle quelle, l'incertitude est **dite** | `non-verifiable` | sans provenance · sans quantité · aucune référence · quantité proposée d'office (100 g) jamais changée |

### 4.3 Mesure sur un journal réel (517 lignes, agrégats)

Formes : **F1** g + pour-100 g + source · **F2** g + pour-100 g sans source · **F3** sans quantité ni pour-100 g ·
**F4** « 1 portion » sans poids · **F5** g sans pour-100 g (signature M6) · **F0** antérieures à `ft-v907`.

| Forme | A | B | C | D | Total |
|---|---:|---:|---:|---:|---:|
| F1 | 158 | 80 | 6 | 13 | 257 |
| F2 | 29 | 81 | 23 | 2 | 135 |
| F3 | 0 | 0 | 55 | 8 | 63 |
| F4 | 0 | 0 | 32 | 0 | 32 |
| F5 | 0 | 0 | 26 | 0 | 26 |
| F0 | 0 | 0 | 0 | 4 | 4 |
| **Total** | **187** | **161** | **142** | **27** | **517** |

- **B (161)** : **88 ne changent aucun chiffre** (seul le pour-100 g gardé sur la ligne est remis juste) ; **73 changent
  des valeurs** (fiche fabriquée héritée : 47 ; arrondi de l'époque : 26). 3 gardent une note de portion.
- **C (142)** : 104 relèvent d'une décision personnelle déjà prise (D-095 : préremplie, pas appliquée) · 18 « à
  trancher » de la v1.2 · 9 quantités déduites · 4 quantités de l'écran recopiées par un rejeu · 1 énergie tapée
  impossible · 6 portions inhabituelles avec une hypothèse chiffrée.
- **D (27)** : 14 non vérifiables · 13 à la quantité proposée d'office (100 g), jamais changée.
- **Favoris (9)** : A 2 · B 1 · C 6.
- **Écart avec la v1.2** : 14 lignes passent de « certaines » à C (C1 : 4, C3 : 1, C6 : 9), et 4 favoris F2, par
  application de D-095 ; 19 lignes « conformes » portant une note passent en C (6) ou en D (13).

### 4.4 Ce qui ne se généralise pas

Les 104 lignes « décidées » dépendent d'une décision de Michel **sur son propre aliment**. Chez une autre personne, la
même forme (« 1 portion » sans poids, quantité de l'écran) reste **D** : on garde, on signale, on ne devine pas. Les
règles **B** sont génériques : elles ne lisent que la ligne, son horodatage, ses voisines et les bases embarquées.

---

## 5. Règles exactes de conversion et de conservation

### 5.1 Ce qui est conservé, toujours

`id`, `date`, `ts`, la clé de repas, le nom, les valeurs, et **tous** les champs V1 : la conversion **ajoute** `n2`,
elle ne modifie ni ne retire rien. Une correction acceptée garde les valeurs d'avant (`mig.avant`). L'original intégral
reste dans l'instantané (§6.1).

### 5.2 Par champ

| V1 | V2 | Règle |
|---|---|---|
| `id` | inchangé | absent : le mécanisme existant (`_foodLogIdentifier`) le pose au chargement, l'instantané garde la ligne d'origine sans `id` ; en double : les deux gardés, le second réidentifié et signalé |
| `ts`, `date` | inchangés | date illisible → gardée + note, classe D |
| `meal` | inchangé | clé inconnue gardée + note ; **jamais** rangée d'office en déjeuner (leçon STR-14, D-050) |
| `name` | inchangé | — |
| `kcal` `prot` `carbs` `fat` | inchangés | un 0 de V1 reste 0 (on ne sait pas s'il voulait dire « inconnu ») ; une énergie incompatible avec les macros est **signalée** |
| `q`, `u` | inchangés | utilisés pour calculer **seulement** sur une ligne pesée ; jamais d'unité supposée |
| `per100` | inchangé (A) ; remplacé après accord (B, C) | une fiche non vérifiée n'est jamais utilisée pour recalculer |
| `sourceId`, `etat` | inchangés | `sourceId` ne vaut fiche que si `per100` correspond à la source |
| `saisie`, `origine` | inchangés | lus pour la provenance (`n2.f.src`), selon une table fixe |
| `modifie` | inchangé | **non utilisé** pour décider (STR-11) |
| `portionLabel`, `portionWeightG` | inchangés | une portion pesée devient calculable ; sans poids, elle reste déclarée |
| `fiab`, `kcalDerivee`, `doute`, `codeDouteux`, `v` | inchangés | repris comme provenance ou notes |
| champ inconnu | inchangé | compté par l'inventaire, jamais jeté |

### 5.3 Par forme

| Forme | Conversion | Interdit |
|---|---|---|
| g + pour-100 g + fiche indépendante qui retombe juste (A) | **pesée** | — |
| g + pour-100 g fabriqué ou arrondi (B) | **déclarée** ; après accord, **pesée** avec la fiche indépendante et la quantité tapée | toucher à la quantité |
| sans quantité ni pour-100 g | **déclarée** | déduire une quantité sans réponse |
| « 1 portion » sans poids | **déclarée** ; une fois la ligne confirmée, son **nombre** de portions peut changer (`ft-v1186` ③ : référence d'une portion = totaux ÷ q) | convertir en grammes |
| g sans pour-100 g (signature M6) | **déclarée**, note « quantité non prouvée » | dériver une fiche de ces valeurs |
| pour-100 g sans quantité (forme ancienne) | **déclarée**, fiche gardée pour mémoire | inventer une quantité (l'ancien moteur écrivait 205 g en silence) |
| quantité sans unité (forme ancienne) | **déclarée** | supposer des grammes |
| ml | **pesée** seulement si la fiche est pour 100 ml (ou densité sourcée) | 1 ml = 1 g |

### 5.4 Favoris et repas habituels

- Un favori devient un **modèle** (D-051). Fiche indépendante + quantité : modèle complet. Sans quantité : modèle sans
  quantité par défaut (l'écran la demande). Sans fiche vérifiée : modèle **déclaré**.
- Un favori porteur d'une fiche fausse **ne transmet rien** tant que sa correction n'est pas acceptée : il ne peut plus
  réintroduire l'erreur après la migration.
- Deux favoris du même nom : les deux gardés, l'ambiguïté signalée ; rien n'est fait à leur place (`ft-v1188`).
- Les repas habituels restent déduits : ils ne demandent aucune migration.

---

## 6. La migration : versionnée, rejouable, réversible

### 6.1 Les étapes

1. **Lecture sûre** : les clés du journal et des favoris sont lues **comme texte brut**, sans être modifiées. Une
   valeur illisible arrête la migration (rien n'est écrit) et le dit.
2. **Instantané** : le texte brut est copié **une seule fois**, dans IndexedDB (hors du quota de `localStorage`, §3.5),
   avec son empreinte SHA-256, la date, la version de l'app et l'identifiant local du compte ; relu et revérifié avant
   la suite. Il n'est **jamais** réécrit. En plus, l'app **propose** de télécharger l'export complet (qui existe déjà).
   Si l'instantané échoue (navigation privée, stockage refusé) : **aucune correction n'est proposée**, la conversion
   reste en mémoire.
3. **Lecture sans perte** : V2 lit chaque ancienne ligne par l'adaptateur (§2.5), **sans rien y écrire** ; une ligne
   revenue du nuage se lit de la même façon. *(Version d'origine de cette étape : « chaque ligne sans `n2` en reçoit
   un » — remplacée le 22/10 par la consigne de Michel : on ne modifie jamais les originaux.)* Les étapes 2 et 4 à 7
   relèvent de la récupération, chantier de Claude Principal (D-098).
4. **Inventaire** : une fiche par ligne d'origine (id, empreinte, forme, classe, règles, preuve) ; contrôle : autant de
   fiches que de lignes, par jour et par repas.
5. **Propositions** (B, C) : calculées à partir de l'original, avec leur règle, leur preuve et leurs chiffres avant /
   après ; recalculables à tout moment, donc jamais stockées en double. Chaque proposition B est recalculée par un
   **second calcul indépendant** (oracle) : un désaccord la fait redescendre en C.
6. **Accord** : A et D ne demandent rien ; B en un geste après lecture de la liste ; C par ligne ou par groupe, options
   chiffrées. Avant l'accord, **tout total est identique à l'original**.
7. **Retour arrière** : par correction (on rend `mig.avant`) ou en entier (on rend l'instantané, à l'octet près,
   vérifié par l'empreinte). Les lignes saisies après la conversion sont **conservées**.

### 6.2 Rejouer sans doublon ni double correction

- La conversion et les propositions sont des **fonctions pures** de (lignes d'origine, version de l'outil, réponses
  déjà données) : relancées, elles donnent le même résultat à l'octet près.
- Une correction se calcule **depuis l'original**, jamais depuis une valeur déjà corrigée.
- Les lignes sont indexées par leur `id` : une relance remplace, elle n'ajoute pas.
- Une nouvelle version de l'outil ne touche pas une réponse déjà donnée ; elle peut seulement proposer.

### 6.3 Ce qui reste hors migration

- Les lignes écrites par V2 (déjà converties).
- Les données d'**autres** comptes : la migration ne lit que l'appareil, pour le compte local ; elle n'identifie aucun
  compte par une adresse e-mail, et un instantané pris pour un compte n'est **jamais** appliqué à un autre.

### 6.4 Le nuage

- Le serveur reçoit **les lignes et les décisions** (`n2` réduit à la classe et à la réponse : **+2 %** compressé,
  mesuré), pas le cœur V2 complet (**+32 %** dans un réservoir commun déjà plein une fois). Revenues du nuage sans leur
  cœur complet, les lignes sont reconverties et les réponses déjà données réappliquées.
- **Aucune ligne corrigée n'est envoyée au serveur** tant que l'écriture du compte n'est pas authentifiée (code perso
  ou jeton d'appareil) — dépendance §9.

---

## 7. Les scénarios qui garantissent qu'aucune entrée n'est perdue

| Invariant | Vérification automatique |
|---|---|
| 100 % des lignes dans l'inventaire | fiches = lignes, globalement, par jour, par repas ; ids identiques |
| Zéro perte silencieuse | toute ligne d'origine est présente après conversion, après accord, après retour arrière |
| Zéro doublon, y compris après relance | deux conversions successives : même empreinte du journal ; aucune id deux fois |
| Aucune ligne rattachée à un autre compte | instantané lié à l'identifiant local ; refus si l'identifiant change avant l'accord |
| Dates et repas intacts | égalité champ à champ, toutes lignes, toutes classes |
| Calculs exacts | `nut2Calcule` = oracle indépendant (attendus écrits à la main) ; fiches CIQUAL et marques connues |
| Incertitude préservée | C et D identiques à l'original tant que rien n'est accepté ; statut et notes présents |
| Totaux journaliers | avant l'accord : égaux partout ; après : écart = somme exacte des corrections acceptées |
| Import puis export | export → restauration (simulée) → export : identique ; différences documentées champ par champ |
| Restauration intégrale | retour arrière → clés d'origine identiques **à l'octet** (SHA-256) ; lignes postérieures conservées |
| Interruption | coupure à chaque étape (exception, stockage plein, fermeture) : ancien journal intact |
| Contrôle négatif | chaque invariant éprouvé par mutation : il doit **rougir** quand on casse ce qu'il protège |

**Jeux d'essai fictifs** : un par génération (G0 → G8), plus les cas limites — id manquant ou en double, date
illisible, repas inconnu, ml, portion pesée et non pesée, pour-100 g sans quantité, quantité sans unité, macro absente,
valeur corrompue, journal vide, **8 000 lignes** (performance et stockage), deux appareils, deux onglets.
**Données réelles** : seulement sur une copie autorisée, dans le conteneur, résultats hors du dépôt (décision ①, §11).

---

## 8. Plan de construction sur le clone

**Principe** : le moteur et la récupération d'abord, les écrans ensuite. Les jalons 2 et 3 se construisent et se
prouvent **sans le clone** (bancs sur la branche, données fictives) ; le clone sert à partir du jalon 4.

| Jalon | Contenu | Preuve de sortie |
|---|---|---|
| **J1** ✅ | contrat, schéma, inventaire V1, matrice A/B/C/D mesurée (ce document) | — |
| **J2 — moteur** ✅ | `calcule`, l'écrivain des nouvelles lignes, l'adaptateur des anciennes en lecture seule ; **un seul fichier applicatif neuf**, `nutrition-v2.js`, à la racine, **non branché** | banc `tools/banc_nut2_moteur.js` **53 / 0** (oracle écrit à la main, générations fictives) ; contrôle négatif `tools/mut_nut2_moteur.py` **20 / 20** ; aucune ancienne ligne modifiée |
| **J3 — récupérateur** ↪️ | **confié à Claude Principal (D-098)** : inventaire, sauvegarde, réparations, migration — la matrice §4 et les règles §5-§7 lui servent de proposition | — |
| **J4 — écrans sur le clone** | recherche, quantité (g / ml / portion), ajout, historique, favoris-modèles, modification avec corrections tracées, écran « ton historique » (A/B/C/D, accord, retour arrière) | bancs d'écran ; passe complète D-031 ; **publication du clone avec ton feu vert** ; recette iPhone |
| **J5 — recette adverse** | V1 contre V2 sur toutes les générations, copie réelle, 8 000 lignes, hors ligne, stockage plein, interruption | tous les invariants du §7 ; passe complète |
| **J6 — migration réelle préparée** | procédure par compte, sauvegarde, retour arrière, format nuage, branchement au chemin d'identité | dossier + répétition à blanc ; **aucun lancement sans ton feu vert** |

- **Pourquoi un fichier à la racine, et pas un dossier `nutrition-v2/`** : le générateur du clone n'accepte que des
  scripts à la racine (`clone_build.py`, garde sur « / ») et n'empreinte que les fichiers de premier niveau ; un dossier
  aurait obligé à modifier le mécanisme d'isolement de D-084. Le fichier neuf entre aussi dans `sw.js` (`PRECACHE`,
  témoin CLXXXIV), `check_regles.py`, `recette_selecteur.py`, le témoin D031S-III ② et `inventaire.py`.
  `.claspignore` n'a rien à faire (il n'autorise que `Code.js` et `appsscript.json`).
- **Les données (`data/*.json`) ne sont pas copiées dans le clone** : il lit celles de master. V2 n'en ajoute aucune.
- **Ce qui ne change pas avant le jalon 6** : production, master (hors publications du clone que tu autorises),
  Apps Script, Worker, Supabase.
- **Anciens chemins que V2 supprimera à la bascule** (cible, compte exact au jalon 4) : `_provFood` (≈ 220 lignes),
  `_qtyRescale`, `_bcApplyGrams`, `_efApplyGrams`, `_afDeclarePoids`, l'écriture de `modifie` ; les quatre écrivains
  deviennent des appels à `nut2Ecrire`.
- **Publication du clone** : régénération par `clone_build.py` (jamais à la main), master + **un** commit qui ne touche
  que `clone/`, contrôles sur l'arbre exact (isolement 22/0, contrôle négatif 8/8, régénération identique, aucun canal
  de stockage ou de réseau ajouté, `check_regles`), avance rapide sans forcer, vérification du déploiement ; retour
  arrière = `git revert`. Le clone sert aujourd'hui la recette Séance (`b1840bc7`, 57 commits derrière master) : la
  première publication V2 le **remplace** — je le redemanderai à ce moment-là.

---

## 9. Dépendances avec le chantier Sécurité

| Ce dont V2 dépend | Pourquoi | Qui |
|---|---|---|
| **Écritures authentifiées** (`_MIG_FERME_`, aujourd'hui ouvert) | sans code perso ni jeton, un client qui connaît l'e-mail peut **remplacer** le journal d'un compte ; une ancienne version de l'app peut écraser des lignes corrigées | Principal ; la date est la tienne |
| **Fusion du journal côté serveur** | `_pa_` remplace le journal en bloc (le dernier qui écrit gagne) ; la restauration fusionne, le serveur non | Principal (Apps Script : ton feu vert) |
| **Place dans le réservoir serveur** | 512 000 octets pour tous les comptes ; un journal de 8 000 lignes pèserait à lui seul ≈ 445 Ko compressé (extrapolé de 55,7 octets par ligne) | Principal + toi |
| **Lecture authentifiée** | relire un compte demande son code perso, le jeton n'est pas accepté : vérifier la copie serveur avant / après une migration passe par là | Principal |
| **Harnais de tests D-031** | tout banc V2 : garde réseau en première ligne, identités fictives `@example.test`, contrôle négatif, registre de recette, lancement sous garde | appliqué par V2 |
| **Isolement du clone (D-084)** | V2 n'ajoute ni Web Worker, ni OPFS, ni nouveau canal ; l'instantané IndexedDB est couvert par le bouclier et sera ajouté au banc d'isolement | V2 |

Tant que les trois premières lignes ne sont pas réglées, **V2 n'est activée pour aucun autre compte** et aucune ligne
corrigée ne part au serveur.

---

## 10. Estimations (méthode D-088)

**Repères mesurés** : passe complète D-031 **80 à 104 min** (91 et 93 min les 21-22/10) · bancs voisins ≈ 20 min ·
une mutation ≈ 35 s sur un banc court · publication du clone **11 min** (réel) · correctif d'écran borné 12 à 40 min.
L'historique estimé / réel montre une **surestimation** (×1,4 à ×3 sur D-086, D-087, D-088). **Aucun repère mesuré
n'existe pour un lot de cette taille** : les durées de développement ci-dessous sont des estimations, à comparer au réel
à la fin de chaque jalon.

| Jalon | Développement | Exécution des tests | Total central |
|---|---:|---:|---:|
| J2 moteur | 5 h | 1 h 30 | 6 h 30 |
| J3 récupérateur | 8 h | 2 h 30 | 10 h 30 |
| J4 écrans + clone | 12 h | 3 h (dont une passe complète, publication) | 15 h |
| J5 recette adverse | 4 h | 3 h (dont une passe complète) | 7 h |
| J6 migration préparée | 3 h | 1 h 30 | 4 h 30 |
| **Total** | **32 h** | **11 h 30** | **43 h 30** |

**Réel du jalon 2** (D-088 ⑤) : estimé 6 h 30 (5 h + 1 h 30) ; réel **≈ 13 min** (08:38 → 08:51 UTC), sur un périmètre
réduit — moteur non branché, récupération passée à Claude Principal. Mes estimations de développement sont trop hautes ;
celles des jalons 4 à 6 seront recalibrées sur cette mesure.

**Risque de reprise, à part** : retours de ta recette iPhone sur les écrans (+4 à 6 h) · écarts entre les règles v1.2
(Python) et leur portage (+2 h) · toute publication sur master pendant une passe la périme (+91 min) · le chemin
d'identité de Principal, dont la date ne dépend pas de ce chantier. **Recette iPhone et décisions : hors estimation.**

---

## 11. Les trois décisions qui t'attendent

1. **Les vraies données pour les essais.** D-084 interdit toute donnée réelle dans le clone, et le clone ne peut pas en
   recevoir. Je propose de tester la récupération sur **ton extrait du 20/10** (copie de travail), **dans le
   conteneur, résultats hors du dépôt**, comme pour la v1.2 — et sur un extrait plus récent au jalon 5. D'accord ?
   Sans ton accord, seulement des données fictives : la V2 ne pourra pas être déclarée terminée (D-096).
2. **Une quantité en portions.** La décision du 09/09 (`ft-v1186`) garde « 2 steaks » (2 portions de 125 g, la masse
   250 g calculée) ; ton intention du 21/10 (question Q-C, ouverte) mettait les grammes et millilitres d'abord. Le
   calcul est identique dans les deux cas. **Par défaut, V2 suit la décision du 09/09** ; dis-moi si tu veux l'autre.
3. **Les petits correctifs de l'ancien moteur, en attendant V2.** La production garde l'ancien moteur pendant toute la
   construction (plusieurs semaines). Les correctifs préparés cette nuit (une quantité 0 ou vide enregistre la fiche
   comme mangée ; le poids estimé par l'IA perdu ; les repas mal nommés dans l'export) protègent ton journal **dès
   maintenant** ; chaque ligne abîmée d'ici là sera une ligne de plus à récupérer. Les publier quand même (≈ 4 h 30
   ensemble, une seule passe complète, ton feu vert), ou attendre V2 ?

**Plus tard, pas maintenant** : au jalon 4, les questions d'écran déjà ouvertes (Q-A : afficher 0 g ; Q-L : « 40 »
tapé dans un champ en portions ; Q-N : prévenir quand l'IA remplace une fiche CIQUAL ; Q-P : un aliment renommé ;
Q-M : l'avertissement « sec ») ; au jalon 6, la date de fermeture des écritures non authentifiées et la place serveur.

---

## 12. Les décisions déjà actées que V2 respecte (règle d'or #15)

| Décision | Ce qu'elle impose à V2 |
|---|---|
| D-096 (22/10) | reconstruire sur le clone ; récupération de l'historique obligatoire ; ni production, ni master, ni donnée réelle écrite sans feu vert |
| D-095 (21/10) | cohérence ≠ preuve de quantité ; v1.2 référence de travail, jamais appliquée seule ; incertains listés |
| D-094 (21/10) | aucune porte hors écran ne lit l'écran d'ajout |
| D-084 (17/10) | clone isolé, aucune donnée réelle, jamais édité à la main |
| D-051, D-050 | favori = raccourci vers un modèle ; un modèle ne réécrit jamais une prise passée ; repas non imposés, jamais réaffectés en silence |
| D-075, `ft-v1254`, garde-fou large (10/09), option A | une quantité réellement choisie ; la quantité tapée dans la recherche ne pré-remplit rien ; refus d'une quantité vide, 0 ou illisible |
| `ft-v1186` | portion nommée (jamais devinée), poids d'une portion à part, masse dérivée |
| `ft-v1188` | fiche dérivée depuis les totaux enregistrés, à une décimale ; on vérifie, on ne devine pas |
| gel du 13/09 | la douane, ses 21 règles et son carnet restent tels quels ; aucune règle ne devient bloquante |
| D-015, R16, R29, R33, R36 | absent = on ne sait pas ; local d'abord ; demander quand l'erreur touche la personne ; un nom interne par grandeur ; rien de personnel dans une base commune |
| D-031, D-088 | passe complète sur le dernier arbre fonctionnel ; estimations mesurées, développement et tests séparés |

---

## 13. Ce que ce document ne fait pas

- Il ne construit rien : **0** fichier applicatif touché à ce jalon.
- Il ne tranche aucune question d'écran (jalon 4) ni la date de fermeture des écritures non authentifiées (jalon 6).
- Les mesures du §4.3 viennent **d'un seul journal** ; les autres comptes ne sont pas vérifiés (et ne le seront pas
  avant le chemin d'identité).
- Les fragilités du §3.5 sont lues dans le code, **pas reproduites**.

**Règle d'or #17 — jalon 2 (mesuré, code applicatif)** : données persistées ajoutées **0** · fichiers applicatifs touchés
**1** (`nutrition-v2.js`, nouveau, non servi) · lignes **+330 / −0** · anciens chemins supprimés **0** (rien n'est branché ;
les six chemins visés au §8 partent à la bascule). *Prévision révisée* : l'instantané IndexedDB et toute écriture sur les
anciennes lignes sortent du périmètre de V2 (D-098).
