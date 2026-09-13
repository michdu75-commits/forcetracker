# ✂️ Découpage de 1b et 3 en sous-étapes — chantier Nutrition

> **Créé le 12/09/2026**, sur décision de Michel après la mesure du périmètre (ft-v1194) :
> ⛔ *« Je ne veux pas traiter 1b et 3 en un seul gros chantier. Redécoupe-les en sous-étapes plus
> petites, mesurables et réversibles. »*
> ⛔⛔ *« Je ne veux pas harmoniser maintenant les défauts divergents (`0`, `null`, clé absente,
> origine différente). À ce stade, on doit les **transporter explicitement sans les corriger**. »*
>
> **L'objectif reste inchangé** : extraction · propriétaire unique · **aucun** changement de
> comportement · **aucune** modification silencieuse des lignes existantes.

---

## ⭐⭐ LE FAIT QUI A CHANGÉ LE DÉCOUPAGE, ET QUE PERSONNE N'AVAIT NOMMÉ

**`quickFillFood` et `_afSuggPrendreLocale` partagent 36 lignes utiles identiques** — mesuré par
diff normalisé (81 et 99 lignes utiles, **40 % de squelette commun**).

Ce ne sont pas quinze sites éparpillés : c'est **la reprise d'un aliment à l'écran, écrite deux
fois**. L'une prend l'item dans « Mes aliments » (`_afQuickItems`), l'autre dans la recherche du
journal (`_afSuggLoc`) — et à partir de là, elles font la même chose.

⚠️ **Et l'historique le disait déjà, on ne l'avait juste jamais compté** : `ft-v973`, `ft-v975`,
`ft-v984` et `ft-v1176` ont **chacune** porté un correctif d'une porte à l'autre. Les commentaires
du code le répètent mot pour mot : *« le mécanisme existait, posé sur une seule des deux portes —
pour la 6ᵉ fois dans ce fichier »*.

👉 **5 des 10 sous-étapes ci-dessous portent sur cette paire** (1b-ii · 1b-v · 3-ii · 3-iii · 3-v). C'est là qu'est le gisement.

---

## 📐 LA RÈGLE DE DÉCOUPAGE

Une sous-étape est valide si elle réunit **les quatre** :

| critère | ce que ça veut dire concrètement |
|---|---|
| **une seule chose** | elle n'extrait qu'**un** motif. Deux motifs = un retour arrière qui ne peut plus être partiel |
| **mesurable** | l'instantané `tools/instantane_1b23.js` couvre déjà ses sites, **ou** on écrit la sonde **avant** |
| **réversible** | un `git revert` d'un seul commit suffit, et il ne casse rien d'autre |
| **honnête sur les défauts** | tout écart entre sites est **transporté** et **figé par un témoin** — jamais lissé |

⛔ **Et le critère de réussite reste binaire** : instantané **identique octet pour octet** avant et
après. *Un critère qu'on est obligé d'assouplir pour faire passer son propre code n'est plus un
critère.*

---

## 1️⃣ DÉCOUPAGE DE **1b** — la « forme aliment »

Ordre choisi : **du plus contraint au plus libre**. On commence par ce qui est *strictement
identique* (aucune décision possible), on finit par ce qui exige un paramètre de défaut — donc là
où une décision devient **visible dans la signature de la fonction**.

### 1b-i — la quantité reprise d'une ligne existante ✅ **LIVRÉE (ft-v1195)**

| | |
|---|---|
| **Périmètre exact** | le bloc `{q, u, per100, portionLabel, portionWeightG}` recopié depuis une ligne **déjà enregistrée** |
| **Sites** | `rejouerRepas` (@2213) · `quickAddFood` (@2870) — **2 sites, caractère pour caractère** |
| **Fichier / fonction** | `app.js` → `_srcRepriseQ(src, qOk)` |
| **Instantané** | les **11 sondes** de `tools/instantane_1b23.js` — **identiques**, sha256 `ace2a744dc89e6ec` |
| **Mutations** | ① propriétaire vide · ② `qOk` ignoré · ③ `portionWeightG` rend `0` · ④ `per100` retiré · ⑤ `portionLabel` retiré · ⑥ **la fausse harmonisation** (`sourceId`/`etat` au rejeu) · ⑦ l'inverse (la porte directe les perd) · ⑧ **débordement** (l'étape 3 faite au passage) · ⑨ une 2ᵉ copie réapparaît |
| **Rollback** | `git revert` — 1 fonction + 2 appels, rien d'autre |

⛔ **`qOk` reste calculé par l'appelant** : le test *« cette quantité est-elle utilisable ? »* est le
sujet de **l'étape 3**. L'absorber ferait deux extractions dans une seule sous-étape.
⛔ **`sourceId`/`etat` restent chez `quickAddFood` seul** — le rejeu ne les a jamais posés. **Écart
transporté**, figé par deux témoins (l'un exige leur absence, l'autre leur présence).

### 1b-ii — la provenance reprise `{sourceId, etat, per100}` ✅ **LIVRÉE (ft-v1197)**

| | |
|---|---|
| **Périmètre** | les 3 champs de provenance recopiés depuis une ligne existante |
| **Sites** | `quickFillFood` (@2758) · `_afSuggPrendreLocale` (@3948) · `quickAddFood` (@2871) |
| **Fonction** | `_srcProvenance(src)` |
| **Instantané** | ⚠️ **à étendre d'abord** — aucune sonde ne couvre `quickFillFood` ni `_afSuggPrendreLocale` aujourd'hui |
| **Mutations** | le propriétaire rend `null` · `sourceId` perdu · `etat` perdu · ⛔ **`rejouerRepas` reçoit la provenance** (doit rougir) |
| **Rollback** | 1 commit |

⚖️ **POINT DE DÉCISION PRODUIT n°1** — voir §3.

**⭐ CE QUE LA MESURE A CORRIGÉ DANS CETTE FICHE (12/09)** :
- **le 4ᵉ site cité (`_buildFoodQuickItems`) n'en est PAS un** — il construit un **item de liste**,
  pas une provenance pour `_afSetSrc` : c'est **1b-iii**, autre consommateur ;
- **`quickAddFood` ne porte que la PAIRE** (`sourceId`/`etat`) : son `per100` lui vient de
  `_srcRepriseQ` depuis ft-v1195 ;
- ⛔⛔ **`origine` et `saisie` NE SONT PAS entrés dans le propriétaire, et c'est la coupe elle-même** :
  ils divergent aux 3 portes (`it.origine||'reprise'` · `e.origine||'utilisateur'` · `'reprise'` en
  dur, qui **ignore la source exprès**). Les unifier changerait ce que le journal **dit de lui-même**
  → **décision produit n°4**, transportée et figée par **2 témoins de périmètre**.
- ⚠️ **L'étiquette « instantané » était juste, mais ma 1ʳᵉ sonde était MORTE** :
  `_afSuggPrendreLocale` lit **`_afSuggLoc[i]`, pas `S.foodLog`** — elle sortait au 3ᵉ caractère et
  la sonde rendait `ABSENT` partout. *Un BEFORE capturé ainsi serait resté identique quoi qu'on
  fasse au code* : il aurait **validé n'importe quelle extraction**. Corrigée en remplissant par
  `_afSuggLocales()`, la vraie fonction de production, **avec un garde qui LÈVE si la liste est vide**.

### 1b-iii — l'item de liste affichée ✅ **LIVRÉE (ft-v1198)**

| | |
|---|---|
| **Périmètre** | l'objet affiché dans « Mes aliments » et le favori enregistré |
| **Sites** | `_buildFoodQuickItems` (@2689 favoris, @2697 récents) · `toggleFavFood` (@2891) |
| **Instantané** | ✅ **déjà couvert** — `1b_buildFoodQuickItems`, `1b_toggleFavFood_complet`, `1b_toggleFavFood_nu` |
| **Rollback** | 1 commit |

⛔⛔ **CETTE SOUS-ÉTAPE N'EST PAS PUREMENT EXTRACTIVE, ET IL FAUT LE DIRE** : `q` vaut **`0`** chez
`_buildFoodQuickItems` et **`null`** chez `toggleFavFood` ; `portionWeightG` pareil.
👉 Le propriétaire prend donc le défaut **en paramètre explicite** — `_itemListe(src, {vide:0})` vs
`{vide:null}`. *Un paramètre nommé rend l'écart visible dans le code au lieu de le cacher dans deux
copies.*

⚖️ **POINT DE DÉCISION PRODUIT n°2** — voir §3.

**⛔⛔ CE QUE LA MESURE A CORRIGÉ DANS CETTE FICHE (12/09) — LE PLAN ANNONÇAIT DEUX DIVERGENCES,
IL N'Y EN A QU'UNE.** Mesuré champ par champ sur les 3 sites :
- ⛔ **`q` NE diverge PAS** : il vaut `+X.q>0?+X.q:0` **aux trois**. La phrase ci-dessus était fausse.
- ⭐ **Seul `portionWeightG` diverge** : `0` aux deux branches de la liste, **`null`** au favori.

👉 ***Le propriétaire ne prend donc AUCUN paramètre `{vide:…}`*** : il était dimensionné pour deux
écarts alors qu'il n'y en a qu'un, et *un paramètre inutile déplace la divergence DANS le
propriétaire au lieu de la laisser visible chez les appelants*. **9 champs strictement identiques**
partent dans `_itemListe(src)` ; `portionWeightG` et `fav` restent **écrits chez chaque appelant**.
⛔ Et `origine`/`sourceId`/`etat` ne bougent pas : **une seule copie** (branche récents).

### 1b-iv — l'export CSV ⛔ **ÉCARTÉE (12/09/2026) — IL N'Y A RIEN À EXTRAIRE**

> ⚠️ **Elle reste écrite ici AVEC SA RAISON, elle ne disparaît pas** (**R30**) : une sous-étape
> effacée du plan ressemble à un oubli, et quelqu'un la remettrait dans six mois.

| | |
|---|---|
| **Ce que le plan annonçait** | « la ligne CSV du journal nutrition, 13 colonnes aux noms français » |
| **Ce que la MESURE dit** | `NUTRI_COLONNES` et son `.map()` existent **une seule fois** dans tout le code servi. Aucun import ne les relit, aucun second aplatissement en noms français n'existe |
| **Et le partage est DÉJÀ fait** | `_csvFichier(colonnes, lignes, nom, unité)` est le propriétaire commun, appelé par **nutrition ET poids** — la factorisation a été faite au bon niveau, avant ce chantier |

**⛔⛔ UNE EXTRACTION EXIGE AU MOINS DEUX COPIES.** Sortir `_ligneCsvNutri(e)` créerait un
propriétaire à **un seul appelant** : ce n'est pas une extraction, c'est une abstraction pour
elle-même — et c'est **R19** qui l'interdit (*la gouvernance sert le produit, jamais l'inverse*).

**⭐⭐ ET L'ERREUR QUI L'A FAIT ENTRER DANS LE PLAN VAUT PLUS QUE LA SOUS-ÉTAPE.** Sa justification
écrite était : *« c'est elle qui était invisible au compteur (noms français, liste de colonnes figée
à part) »*. C'est **vrai** — c'est le cas d'école de `BUGS.md` §63. Mais j'en ai tiré la mauvaise
conclusion : j'ai versé au découpage **tout ce que le compteur avait raté**, sans jamais demander,
site par site, *s'il était DUPLIQUÉ*.
👉 ***Un site qu'un compteur défaillant a manqué n'est pas pour autant un site à extraire.***
Réparer l'instrument (§63) et refaire l'inventaire sont **deux gestes différents** ; j'ai fait le
premier et cru avoir fait le second.

**⛔ Le test d'entrée, désormais explicite pour toute sous-étape** : *compter les copies AVANT de la
décrire*. Appliqué aux 8 restantes le 12/09 — **1b-ii** (3-4 sites) · **1b-iii** (2) · **1b-v** (2,
identiques au caractère près) · **3-ii/iii/iv/v** (les 5 sites « grammes seuls ») **tiennent toutes** ;
seule celle-ci était vide.

**⚠️ Et l'étiquette « instantané » était fausse DES DEUX CÔTÉS** : elle annonçait *« AUCUNE sonde
aujourd'hui »*, or le bloc **CCIV** conduit vraiment `exportNutritionCsv()`, intercepte la remise du
fichier et **lit le CSV produit** (échappement de la virgule, BOM, provenance, ordre). *C'est le
miroir de 3-i, où l'étiquette annonçait « couvert » pour une sonde qui ne couvrait rien.*
👉 **Dans les deux sens, l'étiquette ne remplace pas l'ouverture du fichier.**

### 1b-v — l'hydratation des écrans ⛔ **ÉCARTÉE (13/09/2026) — IL N'Y A PLUS RIEN À EXTRAIRE**

> ⚠️ **Elle reste écrite ici AVEC SA RAISON, elle ne disparaît pas** (**R30**) : un site non
> propriétarisé ressemble trait pour trait à un oubli, et le suivant « réparerait » une décision.
> C'est le cas vécu du calculateur de plaques. **Un bloc de témoins (CCCI) fige l'écartement.**

**⭐ LE BALAYAGE COMPLET, refait le jour même dans le code servi** — les **12 écritures** des quatre
variables de portion, classées par **métier** et non par ressemblance :

| métier | sites | état |
|---|---|---|
| **hydratation depuis une SOURCE** | `_afReprendreDefPortion` (+ ses 2 appelants) · **`openEditFood`** | le 1ᵉʳ est le propriétaire livré par 3-v ; le 2ᵉ est **seul de sa forme** |
| **saisie à l'ÉCRAN** | puce · nom · poids, **× 2 écrans** = 5 sites | *autre métier* — la personne tape, rien n'est repris |
| **déclaration / remise à plat** | 3 sites | — |

👉 **Il ne reste qu'UN site d'hydratation non propriétarisé, et il écrit d'AUTRES variables.**
**Test d'entrée : 1 copie** → *on ne crée pas de propriétaire pour une forme unique* (**R19**),
exactement comme 1b-iv.

**⛔⛔ ET DEUX MESURES INTERDISENT DE LE FONDRE AVEC LE PROPRIÉTAIRE `_af` :**

1. **Les deux formes ne sont pas strictement identiques** — `(+X.portionWeightG>0)?` contre
   `+X.portionWeightG>0?`. Sémantiquement pareil, **textuellement différent** : la consigne dit
   *« n'extrais que ce qui est strictement identique »*.
2. ⭐⭐ **Et surtout, elles n'ont pas le même garde** : l'écran d'**ajout** refuse si
   `u !== 'portion'` ; l'écran d'**édition** hydrate **sans aucun garde d'unité**.

**⭐⭐ CETTE DIVERGENCE A ÉTÉ MESURÉE BOUT EN BOUT, ET ELLE EST JUSTIFIÉE** — c'est le fait qui
décide de la sous-étape. Sur **la même ligne**, enregistrée **en grammes** mais portant une
étiquette de portion (état réel : `_provFood` recopie `portionLabel` sans condition d'unité) :

| écran | définition reprise ? | son unité à l'ouverture |
|---|---|---|
| **ÉDITION** | ✅ `part` / 120 g | **`portion`, toujours** (forcé à chaque ouverture) |
| **AJOUT** | ⛔ vide / 0 | **`g`** — il suit l'unité de la source |

👉 ***Les deux gardes diffèrent parce que les deux écrans ne partent pas du même état.*** L'écran
d'édition est **toujours** en mode portions, donc une définition de portion y a **toujours** du
sens ; l'écran d'ajout, lui, suit la source. **Ce n'est pas une incohérence : c'est la même
intention appliquée à deux états différents.** Les fondre serait précisément l'erreur que ce
chantier évite partout ailleurs — *ce qu'on factorise est l'INTENTION, jamais la ressemblance*.

⚠️ **Le témoin ⑨ du bloc CCCI fige la RAISON, pas seulement le fait** : il vérifie que l'écran
d'édition force encore son unité à « portion » à l'ouverture. **Le jour où ce fait tombera, la
divergence redeviendra un vrai défaut à réexaminer** — et un rouge le dira.

---

## 2️⃣ DÉCOUPAGE DE **3** — « cette quantité est-elle utilisable ? »

⚠️ **Rappel du décompte mesuré** (ft-v1194) : la règle stricte est écrite **7 fois en 2 formes**
(5 « grammes seuls » + 2 « avec portions ») — *le « 6 » du plan était presque juste*. Ce que le plan
a raté, c'est la **moitié PORTIONS** : **9 lignes** de plus, ajoutées en ft-v1183/1186 et jamais
réintégrées à l'inventaire. **16 décisions** sur l'unité au total.

### 3-i — la forme « avec portions » ✅ **LIVRÉE (ft-v1196)**
- **Sites** : `rejouerRepas` (@2212) · `quickAddFood` (@2868) — **2, identiques**
- **Fonction** : `app.js` → `_qReprenable(src)` → booléen
- **Instantané** : ✅ couvert — **après extension** (voir ci-dessous)
- **Mutations** : ① la règle rend toujours `true` · ② les portions refusées · ③ le `ml` accepté · ④ la quantité négative acceptée · ⑤ l'unité absente refusée · ⑥⑦ une porte reprend sa propre copie · ⑧ **débordement** (3-ii/iii/iv faites au passage) · ⑨ elle ne rend plus un booléen · ⑩ le garde `src||{}` retiré
- **Rollback** : `git revert` — 1 fonction + 2 appels
- ⭐ **C'est la suite naturelle de 1b-i** : le même couple de fonctions, l'autre moitié de la ligne.

> ⚠️⚠️ **CORRECTION — CE DOCUMENT DISAIT « INSTANTANÉ : COUVERT », ET C'ÉTAIT À MOITIÉ FAUX**
> (mesuré le 12/09 avant de coder). ⛔ `3_regle_avec_portions` **recopie la règle DANS la sonde**
> (`const regleP = c => …`) : elle n'appelle aucun code de production, donc elle ne peut **rien**
> détecter d'une extraction — c'est une **table de vérité**, pas une couverture. ⛔ Et
> `3_via_quickAddFood` ne conduit **qu'une** des deux portes : **`rejouerRepas` n'était sondé par
> rien**.
> ⭐ **Corrigé avant toute modification de code** : la sonde `3_via_rejouerRepas` comble la moitié
> manquante (12 sondes au lieu de 11). ⚠️ Et le commentaire de l'instantané annonçait *« les six
> sites conduits par leur VRAIE porte »* pour une boucle qui n'en conduit **qu'une** — *c'est le
> miroir du commentaire de ft-v1190, qui annonçait une portée plus ÉTROITE que le code : dans les
> deux cas, il dispense le lecteur suivant d'aller vérifier.*
> 👉 **Leçon à appliquer aux sous-étapes suivantes** : avant d'écrire « instantané couvert »,
> **ouvrir la sonde** et vérifier qu'elle conduit la production, pas une copie de la règle.

### 3-ii — la pastille « ta dernière quantité » ✅ **LIVRÉE (ft-v1199)**
- **Sites** : `quickFillFood` (@2777) · `_afSuggPrendreLocale` (@3924) — **2, identiques**
- **Instantané** : ⚠️ à étendre (la pastille n'est pas sondée)

### 3-iii — l'ouverture du bloc « poids repris en grammes » ✅ **LIVRÉE (ft-v1201)**
- **Sites** : `quickFillFood` · `_afSuggPrendreLocale` — **2, mesurés identiques**
- ⭐ **Et le test d'entrée portait sur LES DEUX MOITIÉS** : la **condition** *et* le **corps de
  3 lignes** (`_afUnite='g'` · `_afPoidsDeclare=+X.q` · `_afQtyNom=_afNomCourant()`) sont
  strictement identiques, au nom de variable près. **2 copies de chaque** → `_afReprendreGrammes(src)`.
- ⭐⭐ **C'est la sous-étape qui tient la promesse de 3-ii** : `_qGrammes` rend un NOMBRE, donc la
  condition s'écrit `_qGrammes(src) > 0` **sans réécrire la règle une 3ᵉ fois**.
- ⛔ **Le garde `!_bcNutr` n'est PAS parti avec**, comme annoncé : il dit *« aucun pour-100 g n'est
  posé »* — une question sur l'**état de l'écran**, pas sur la quantité de la ligne. L'absorber
  ferait deux extractions en une **et** rendrait le propriétaire dépendant d'une globale que ses
  appelants contrôlent. Un témoin de source l'interdit ; la mutation qui l'y met rougit.
- ⚠️ **Mesure qui a décidé des fixtures, et qui n'était pas dans le plan** : les blocs de **3-ii et
  3-iii sont MUTUELLEMENT EXCLUSIFS** sur la même entrée — `_bcNutr` est posé par le bloc du
  pour-100 g, donc celui-ci ne s'exécute **que lorsque l'autre ne s'est pas exécuté**. Des fixtures
  recopiées de 3-ii n'auraient **jamais** franchi le garde, et les six cas auraient rendu la même
  valeur (le piège de ft-v1199, évité parce qu'on l'a cherché d'avance).

### 3-iv — `_provFood` : la liste blanche de la provenance — ✅ **LIVRÉE (ft-v1202)**
- **Ce que ce paragraphe annonçait** : *« Sites : @1232 (grammes) · @1237 (portions) — le seul
  endroit qui ÉCRIT `p.q`/`p.u` »*.
- ⛔⛔ **FAUX SUR LES DEUX POINTS — et c'est la 4ᵉ sous-étape d'affilée dont le périmètre écrit ici
  ne résiste pas à la mesure.**

| ce que le plan disait | ce que la **mesure** dit |
|---|---|
| « les **deux** branches @1232/@1237 » | **1 copie de CHAQUE forme.** Elles se ressemblent, elles ne disent pas la même chose : l'une teste les grammes et écrit `u:'g'`, l'autre teste les portions et écrit `u:'portion'` |
| « le **SEUL** endroit qui écrit `p.q`/`p.u` » | **5 écritures** : @1232 · @1237 · @1300 (code-barres) · @1320 (poids déclaré) · @1355 (portions à l'écran) |

- ⭐ Les 3 écritures supplémentaires lisent l'**état de l'écran**, pas `_afSrc` — ce ne sont pas
  des copies non plus, et elles ne bougent pas. Un témoin fige que leur compte reste à **5**.
- ⭐⭐ **3-iv se réduit donc à BRANCHER la dernière copie écrite sur `_qGrammes`**, qui avait déjà
  3 appelants. ***Le test d'entrée protège contre la CRÉATION d'un propriétaire pour une forme
  unique ; il n'interdit pas d'ajouter un appelant à un propriétaire qui existe*** (R19) — sans
  quoi la dernière copie de la règle resterait écrite en dur pour toujours.
- ⛔ **La branche PORTIONS ne bouge pas** : 1 écriture, aucun propriétaire existant. *On ne crée
  pas de propriétaire pour une forme unique* — c'est la règle qui a fait écarter 1b-iv.
- ⛔ **Le garde `if(_afSrc)` reste chez l'appelant** : il dit *« une source existe »*, un état de
  l'écran — pas *« cette quantité est-elle des grammes »*. Le métier du propriétaire s'arrête à la
  quantité. Deux témoins le figent (un de comportement, un de source).
- ⭐⭐ **Et la mutation n°2 est la démonstration de la consigne de Michel** : la règle **réécrite
  sur place** au lieu d'appeler le propriétaire rend **5 rouges, TOUS sur des témoins de SOURCE** —
  chaque témoin de comportement reste vert, parce qu'une règle réécrite dit exactement la même
  chose à l'exécution. ***Une dérive de conception peut être invisible à l'exécution***, et c'est
  précisément ce qu'un témoin de source achète.

### 3-v — la définition de portion reprise d'une source — ✅ **LIVRÉE (ft-v1203)**
- ⭐ **Et pour la première fois depuis quatre sous-étapes, le plan disait VRAI sur la moitié qu'il
  décrivait** : `quickFillFood` et `_afSuggPrendreLocale` portaient
  `if(X.u==='portion'){ _afPortionLabel=…; _afPortionPoids=… }` **strictement identiques** —
  **exactement 2 copies** → **`_afReprendreDefPortion(src)`**.
- ⛔⛔ **MAIS L'AUTRE MOITIÉ ÉTAIT DÉJÀ FAITE, et le plan ne le savait pas** : le **NOMBRE** de
  portions a **déjà son propriétaire**, `_afReprendrePortions(n)`, et **les deux portes y sont
  branchées depuis ft-v1183/1186**. *La consigne « si un propriétaire existe déjà, branche
  l'appelant dessus au lieu de recréer une abstraction » était honorée avant même de commencer.*
- ⛔⛔ **Le point de conception est une ASYMÉTRIE DE CONDITION** : la ligne de la définition n'a
  **aucun** garde ; celle du nombre, juste en dessous, porte **`!_bcNutr`**. Les fondre sous un seul
  garde changerait le comportement.
- ⚠️⚠️ **ET LA MESURE VA PLUS LOIN QUE LA CONSIGNE : cette asymétrie est INATTEIGNABLE.** Le bloc qui
  pose `_bcNutr` se garde lui-même par `u!=='portion'`, et `quickFillFood` remet `_bcNutr=null` en
  entrant — donc **le `!_bcNutr` de la ligne voisine ne peut jamais bloquer**. Mesuré à la sonde sur
  les 6 cas. 👉 *Aucun témoin de comportement ne peut protéger cette frontière : non plus « invisible
  à l'exécution » mais **hors d'atteinte**.* Écrit dans `docs/JOURNAL-DE-TEST.md`, **non corrigé**.
- ⛔ **Hors périmètre, figé par témoins** : la ligne du nombre (2 copies chez les appelants) ·
  `_afReprendrePortions` · les **jumelles `_ef*`** de l'écran d'édition (même grandeur, **autre
  écran**, séparation documentée le 10/09 — les fondre serait une refonte).

---

## 3️⃣ ⚖️ À QUEL MOMENT UNE HARMONISATION DEVIENT UNE **DÉCISION PRODUIT**

> **Le critère est simple, et il ne dépend pas du code** : *est-ce que le changement modifie ce qui
> est ÉCRIT dans `S.foodLog` ou `S.savedFoods` ?* Si oui, ce n'est plus une extraction — c'est une
> décision, et elle revient à Michel.

| # | l'harmonisation tentante | ce qu'elle changerait **vraiment** | où |
|---|---|---|---|
| **1** | donner `sourceId`/`etat` à `rejouerRepas` | la **provenance enregistrée** d'une ligne rejouée : elle affirmerait venir d'un code-barres qu'on n'a pas relu. **R33 — la provenance ne ment pas** | 1b-ii |
| **2** | unifier `0` / `null` / clé absente | le **contenu de `S.savedFoods`** et des items de liste. Un `0` et un `null` ne se relisent pas pareil en aval (`+x>0` les traite pareil, `x===null` non) | 1b-iii |
| **3** | faire accepter les portions aux 5 sites « grammes seuls » | des lignes qui repartent aujourd'hui **sans quantité** en repartiraient **avec**. C'est exactement le correctif de ft-v1183/1176 — mais appliqué à des portes qui ne l'ont **pas** reçu, donc un **changement de comportement** | 3-ii/iii/iv |
| **4** | unifier `origine` (`'reprise'` · `it.origine\|\|'reprise'` · `e.origine\|\|'utilisateur'`) | ce que le journal **dit de lui-même**. Les trois formulations disent trois choses différentes, et au moins une est un choix assumé (`quickAddFood` : *« ça ne ment pas en héritant de la source d'origine, qu'on n'a pas conservée sur les favoris »*) | 1b-ii |

⛔ **Tant que ces quatre ne sont pas tranchées, chaque sous-étape les TRANSPORTE et les FIGE par un
témoin.** C'est le seul moyen qu'une harmonisation future soit un **choix**, et pas un effet de bord
qu'on découvre trois versions plus tard.

---

## 4️⃣ ORDRE PROPOSÉ, ET CE QUI BLOQUE QUOI

```
1b-i    ✅ livrée (ft-v1195)   la quantité reprise
1b-ii   ✅ livrée (ft-v1197)   la provenance reprise
1b-iii  ✅ livrée (ft-v1198)   l'item de liste
1b-iv   ⛔ ÉCARTÉE            rien à extraire — 1 copie. Raison écrite ci-dessus.
1b-v    ⛔ ÉCARTÉE            rien à extraire — 1 copie, et les formes NE DOIVENT PAS
                              converger (deux écrans, deux états de départ).

3-i     ✅ livrée (ft-v1196)   « cette quantité est-elle reprenable ? »
3-ii    ✅ livrée (ft-v1199)   la pastille « ta dernière quantité »
3-iii   ✅ livrée (ft-v1201)   le bloc « poids repris en grammes »
3-iv    ✅ livrée (ft-v1202)   la liste blanche — le seul site qui ÉCRIT
3-v     ✅ livrée (ft-v1203)   la définition de portion

        ══════════════════════════════════════════════════════
         1b ET 3 SONT TERMINÉES : 8 livrées · 2 écartées · 0 restante
        ══════════════════════════════════════════════════════
                          │
                          └─ hub (étape 4) ─ douane (étape 5)
```

⭐ **Bilan du découpage, mesuré** : sur **10** sous-étapes décrites le 12/09, **2 étaient vides**
(1b-iv, 1b-v) et **5 périmètres écrits sur 8 vérifiés étaient faux** — jamais deux fois de la même
façon. *Un document de plan ordonne le travail ; il n'est jamais une source pour un chiffre.*
👉 **Et les deux sous-étapes vides ont été trouvées par le même geste** : compter les copies **avant**
d'écrire une ligne. Sans ce test d'entrée, on aurait créé **deux propriétaires à un seul appelant** —
de la complexité sans contrepartie (**R19**).

⛔ **Le hub et la douane restent après** — consigne explicite de Michel, inchangée.

---

## 5️⃣ CE QUI RESTE OUVERT, ET NE BOUGE PAS

| sujet | état |
|---|---|
| `S.savedFoods` perdu entre deux onglets | **ouvert** — l'union par nom ferait ressusciter une étoile retirée. Décision produit |
| l'écart **48,3** / **48** sur la même fiche | **ouvert** — corriger changerait une valeur enregistrée |
| l'historique abîmé, les migrations | **non touchés** |
| le **hub** (étape 4), la **douane** (étape 5) | **après** 1b et 3 |

---

*À tenir à jour à chaque sous-étape livrée (règle d'or #12). Le « pourquoi » d'une version va dans
`CLAUDE.md` ; ce fichier ne porte que le découpage et ses dépendances.*
