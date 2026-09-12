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

### 1b-ii — la provenance reprise `{sourceId, etat, per100}`

| | |
|---|---|
| **Périmètre** | les 3 champs de provenance recopiés depuis une ligne existante |
| **Sites** | `quickFillFood` (@2758) · `_afSuggPrendreLocale` (@3948) · `quickAddFood` (@2871) |
| **Fonction** | `_srcProvenance(src)` |
| **Instantané** | ⚠️ **à étendre d'abord** — aucune sonde ne couvre `quickFillFood` ni `_afSuggPrendreLocale` aujourd'hui |
| **Mutations** | le propriétaire rend `null` · `sourceId` perdu · `etat` perdu · ⛔ **`rejouerRepas` reçoit la provenance** (doit rougir) |
| **Rollback** | 1 commit |

⚖️ **POINT DE DÉCISION PRODUIT n°1** — voir §3.

### 1b-iii — l'item de liste affichée

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

### 1b-iv — l'export CSV

| | |
|---|---|
| **Périmètre** | la ligne CSV du journal nutrition, 13 colonnes aux noms **français** |
| **Sites** | `setup.js` : `NUTRI_COLONNES` (@438) + `exportNutritionCsv` (@441-455) |
| **Instantané** | ⛔ **AUCUNE sonde aujourd'hui — prérequis absolu, à écrire AVANT de toucher au code** |
| **Rollback** | 1 commit, fichier isolé |

⭐ **Lecteur pur, aucun écrivain** : c'est la sous-étape la moins risquée du lot — *à condition*
d'écrire la sonde d'abord. **C'est elle qui était invisible au compteur** (noms français, liste de
colonnes figée à part) : elle a sa place dans le découpage précisément pour ça.

### 1b-v — l'hydratation des écrans

| | |
|---|---|
| **Périmètre** | poser `_afPortionLabel` / `_afPortionPoids` / `_efPortion*` depuis une ligne reprise |
| **Sites** | `quickFillFood` (@2842) · `_afSuggPrendreLocale` (@3996) · `openEditFood` (@4186) · `_afSetUnite` (@4941) |
| **Dépendance** | ⛔ **après 3-v** — les deux moitiés sont entrelacées ligne à ligne |

---

## 2️⃣ DÉCOUPAGE DE **3** — « cette quantité est-elle utilisable ? »

⚠️ **Rappel du décompte mesuré** (ft-v1194) : la règle stricte est écrite **7 fois en 2 formes**
(5 « grammes seuls » + 2 « avec portions ») — *le « 6 » du plan était presque juste*. Ce que le plan
a raté, c'est la **moitié PORTIONS** : **9 lignes** de plus, ajoutées en ft-v1183/1186 et jamais
réintégrées à l'inventaire. **16 décisions** sur l'unité au total.

### 3-i — la forme « avec portions »
- **Sites** : `rejouerRepas` (@2212) · `quickAddFood` (@2868) — **2, identiques**
- **Fonction** : `_qReprenable(src)` → booléen
- **Instantané** : ✅ couvert (`3_regle_avec_portions`, `3_via_quickAddFood`)
- **Mutations** : la règle retirée · les portions refusées · les grammes refusés · l'unité absente refusée
- ⭐ **C'est la suite naturelle de 1b-i** : le même couple de fonctions, l'autre moitié de la ligne.

### 3-ii — la pastille « ta dernière quantité »
- **Sites** : `quickFillFood` (@2777) · `_afSuggPrendreLocale` (@3924) — **2, identiques**
- **Instantané** : ⚠️ à étendre (la pastille n'est pas sondée)

### 3-iii — l'ouverture du bloc code-barres
- **Sites** : `quickFillFood` (@2828) · `_afSuggPrendreLocale` (@3980) — **2, identiques**
- ⛔ **Attention** : le garde `!_bcNutr` fait partie du motif et **n'est pas** la règle de quantité.
  Il ne part pas avec.

### 3-iv — `_provFood` : les deux branches d'écriture
- **Sites** : @1232 (grammes) · @1237 (portions) — **le seul endroit qui ÉCRIT `p.q`/`p.u`**
- ⛔ **À faire EN DERNIER** des formes : tout le reste *lit*, celui-ci *décide*. Une erreur ici se
  retrouve dans les lignes enregistrées.

### 3-v — la reprise des portions à l'écran
- **Sites** : `quickFillFood` (@2842-2843) · `_afSuggPrendreLocale` (@3996-3997) — **2 × 2 lignes identiques**
- **Dépendance** : ⛔ **avant 1b-v**

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
1b-i  ✅ livrée (ft-v1195)
  │
  ├─ 3-i      (même couple de fonctions, l'autre moitié de la ligne)
  │
  ├─ 1b-iv    (isolée — mais PRÉREQUIS : écrire la sonde CSV d'abord)
  │
  └─ 1b-ii ──┬─ 3-ii     ┐
             ├─ 3-iii    │  les 4 sous-étapes de la PAIRE
             ├─ 3-v ─────┤  quickFillFood / _afSuggPrendreLocale
             └─ 1b-v ────┘
                  │
                  └─ 3-iv   (en dernier : le seul qui ÉCRIT)
                       │
                       └─ hub (étape 4) ─ douane (étape 5)
```

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
