# 03 — CHAÎNES D'EXÉCUTION

> **Version décrite : `ft-v1174`.** Chaque chemin est reconstruit **en lisant le code**, et les
> chemins **D** et **E** sont en plus **exécutés dans un vrai navigateur** (Chromium + Playwright,
> les vraies fonctions de production, aucune simulation) — les chiffres sont relevés, pas déduits.
>
> ⛔ **Aucun correctif proposé**, conformément à la demande.

**Légende** — 📖 lu dans le code · 🔬 mesuré à l'exécution

---

## A. Scan code-barres → ajout → `foodLog` 📖

| # | fonction | objet entrant | référence utilisée | q. de référence | q. consommée | calcul | objet sortant |
|---|---|---|---|---|---|---|---|
| 1 | `_lookupBarcode(ean)` | EAN | — | — | — | appel réseau OFF | `p` (fiche OFF) |
| 2 | idem | `p.nutriments` | — | — | — | `energy-kcal_100g` ou `energy_100g/4.184` | `_bcNutr = {kcal100,…}` |
| 3 | `_offRemplirFormulaire(p,…)` | `p` | `_bcNutr` | **100 g** | `serving_quantity` sinon **100** | — | champ `af-bc-grams`, `af-bc-row` visible |
| 4 | `_bcApplyGrams()` | valeur du champ | `_bcNutr` | **100 g** | saisie | `_qtyRescale('af', _bcNutr, 100, saisie)` | 4 champs macro |
| 5 | `addFoodEntry()` | les 4 champs | — | — | — | `_provFood({kcal,…})` | ligne `S.foodLog` avec `per100` + `q` + `u` |

⭐ **La référence reste `per100` de bout en bout.** C'est le chemin le plus sûr des six.

⚠️ **Branche « fiche sans valeurs »** (fréquente sur les produits de marque) : à l'étape 2, si les
4 nutriments sont absents, `_bcSansValeurs` remet `_bcNutr = null`, ouvre le bloc de calibrage et
**ne pose aucun `per100`**. On bascule alors sur le chemin **C′** ci-dessous.

---

## B. Recherche par nom → ajout → `foodLog` 📖

Quatre sources, quatre points d'entrée, **un seul aboutissement** :

| source | fonction | `per100` |
|---|---|---|
| journal / favoris (local) | `_afSuggPrendreLocale` | recopié **s'il existait** |
| CIQUAL (table locale) | `_afSuggPrendreCiqual` | ✅ toujours |
| marques (table locale) | `_afSuggPrendreMarque` | ✅ toujours, **+ portion publiée** |
| Open Food Facts (réseau) | `_afSuggPrendreOff` | ✅ si la fiche en a |

Les quatre appellent `_offRemplirFormulaire`, puis le chemin **A** à partir de l'étape 3.

---

## C. Saisie IA (texte ou photo) → ajout → `foodLog` 📖

| # | fonction | ce qui se passe |
|---|---|---|
| 1 | l'utilisateur écrit une phrase | — |
| 2 | appel worker/backend | le modèle rend **des TOTAUX** (kcal, P, G, L) et parfois un poids estimé |
| 3 | remplissage des 4 champs | `_afMajAncre(true)` — **la source a changé**, l'écran devient la référence |
| 4 | `_afRef` | `{base: totaux, q: poids estimé ou 1, u:'g' ou ''}` |
| 5 | `addFoodEntry` → `_provFood` | `per100` **dérivé** si et seulement si `_afRef.u==='g'` et `_afRef.q>0` |

⛔ **Le modèle ne calcule jamais une portion** : il identifie et estime, le redimensionnement est
local (`_qtyRescale`).

### C′. Étiquette recopiée à la main (calibrage) 📖

`_calOuvrir` → saisie des 4 valeurs **pour 100 g** → `_calAppliquer` :
1. deux contrôles physiques (`_masseImpossibleVals`, `_kcalImpossibleVals`) — **refusent** la
   saisie si les macros ne tiennent pas dans 100 g, ou si les kcal dépassent le plafond
   énergétique ;
2. `_bcNutr = {…}` ← les valeurs saisies ;
3. `_offRemplirFormulaire({serving_quantity:0, quantity:_bcPaquetTxt, nutriments:{}}, null,
   'etiquette-main', false, 'etiquette')` ;
4. `_calOuvrir()` (referme le bloc de saisie).

⚠️ **Constat, non corrigé** : l'étape 3 affiche `af-bc-row` et **ne rappelle pas `_afMajAncre`**,
donc `af-prop-row` — s'il était ouvert avant — **reste affiché**. Une capture utilisateur du
08/09 montre les deux blocs simultanément, avec des macros correspondant à ~225 g au-dessus d'un
champ affichant 100.

---

## D. 🔬 Historique / « Mes aliments » → reprise → changement de quantité → `foodLog`

**C'est le chemin du cas réel signalé.** Exécuté deux fois, avec la même entrée de départ et
**une seule différence** : la présence ou l'absence de `per100`.

### Entrée de départ (identique aux deux essais)

```js
{ name:'Ratatouille Cassegrain', kcal:274, prot:4, carbs:23, fat:15,
  q:380, u:'g', saisie:'historique', origine:'off', per100: … }
```

### D1 — l'entrée A UN `per100` 🔬

| # | fonction | référence | q. réf. | q. consommée | calcul | résultat |
|---|---|---|---|---|---|---|
| 1 | `quickFillFood(i)` | `it.per100` → `_bcNutr` | 100 g | — | — | `af-bc-row` visible, champ **vidé**, pastille « ↩ 380 g (la dernière fois) » |
| 2 | saisie « 110 » | `_bcNutr` | 100 g | 110 g | `_qtyRescale('af', per100, 100, 110)` | **79 kcal / 1 / 7 / 4** |

**Mesuré : 71,8 kcal / 100 g.** La référence d'origine (72) est conservée.

### D2 — l'entrée N'A PAS de `per100` 🔬

| # | fonction | référence | q. réf. | q. consommée | calcul | résultat |
|---|---|---|---|---|---|---|
| 1 | `quickFillFood(i)` | — | — | — | les 4 champs reçoivent **les totaux** `274/4/23/15` ; `_bcNutr = null` ; `af-bc-row` masqué ; **`it.q` (380) n'est lu nulle part dans cette branche** | `af-prop-row` visible |
| 2 | `_afMajAncre(true)` | l'écran | — | — | `_afRef = {base:{274,4,23,15}, q:1, u:'', src:'portion'}` | bloc « portions » |
| 3 | `_afSetUnite('g')` puis déclaration « 110 » | `_afRef` | — | — | `_afRef = {base:{274,…}, q:110, u:'g'}` | **274 kcal / 4 / 23 / 15** |
| 4 | `addFoodEntry` → `_provFood` | `_afRef` | 110 | 110 | `f = 100/110` ; `per100 = totaux × f` | ligne : `q:110, u:'g', kcal:274, per100:{kcal:249, prot:4, carbs:21, fat:14}` |

**Mesuré : 249,1 kcal / 100 g** — la valeur de référence a changé.

### D3 — 🔬 la reprise suivante, depuis la ligne créée en D2

| # | fonction | résultat |
|---|---|---|
| 1 | `quickFillFood` | `per100` existe désormais (249) → `af-bc-row` visible |
| 2 | saisie « 180 » | **448 kcal / 7 / 38 / 25** |

⛔ **Les trois états correspondent exactement, chiffre pour chiffre, aux lignes de l'export réel**
(31/08 · 01/09 · 02/09). La chaîne est donc **reproductible à volonté**.

---

## E. « Mes aliments » → ajout DIRECT (sans ouvrir le formulaire) 📖

Chemin distinct de **D**, plus court, et **il n'écrit ni référence ni quantité** :

```js
function quickAddFood(i){
  const it=_afQuickItems[i];
  const _vals={kcal:it.kcal||0, prot:it.prot||0, carbs:it.carbs||0, fat:it.fat||0};
  _afSetSrc({saisie:'liste', origine:'reprise'});          // ⛔ ni per100, ni q, ni u
  S.foodLog.push(Object.assign({date,meal,name,ts}, _vals, _provFood(_vals)));
}
```

⚠️ **Conséquence lisible dans la donnée** : la ligne créée porte des **totaux** et
`q:null, u:null, per100:null` — la troisième forme décrite en `02 §6`, **non convertible**.
C'est la forme des lignes « quantité vide » relevées dans l'export réel (steak haché, 24/08,
25/08, 28/08).

---

## F. Ouverture d'une entrée existante → modification → sauvegarde 📖

| # | fonction | comportement |
|---|---|---|
| 1 | `openEditFood(ts)` | remet `_efUnite='portion'`, `_efPoidsDeclare=0`, `_efPoidsPose=false`, **`_efRef=null`** |
| 2 | `_efQtyRender(srcChange)` | choisit la référence dans **cet ordre** : ① `srcChange` → lit l'écran · ② `_efRef` existant → **préservé** · ③ sinon → l'entrée enregistrée |
| 3 | branche `e.per100` | champ en grammes absolu ; `_efApplyGrams` → `_qtyRescale('ef', e.per100, 100, saisie)` |
| 4 | branche « ancrage » (`e.q>0`, ou un nombre lu dans le nom) | `_efRef={base: totaux de l'entrée, q: e.q, u: e.u}` → `_efApplyProp` |
| 5 | branche « aucun ancrage » | onglets ⚖️/🍽️, `_efRef={base, q:1, u:null}` — le poids doit être déclaré |
| 6 | `saveEditFood()` | réécrit `kcal/prot/carbs/fat` depuis les champs ; `q`/`u` **seulement si** un champ de quantité était affiché ; ⛔ **`per100` n'est jamais réécrit** |

⭐ **Différence notable avec D2** : ici, l'étape 4 **utilise `e.q`**. L'écran d'édition conserve
donc l'appariement (totaux ↔ quantité) que le chemin de reprise D2 ne conserve pas.

---

## Récapitulatif : où une valeur peut devenir une référence

| endroit | ce qu'il transforme | condition |
|---|---|---|
| `_offRemplirFormulaire` | la fiche source → `per100` | une source le fournit |
| `_calAppliquer` | 4 champs saisis → `per100` | passe les deux contrôles physiques |
| `_afSuggPrendreMarque` / `…Ciqual` | table locale → `per100` | toujours |
| **`_provFood`** | **totaux ÷ quantité → `per100`** | `!p.per100 && _afRef.u==='g' && _afRef.q>0` |
| `_afMajAncre` | les 4 champs affichés → `_afRef.base` | `srcChange` vrai |
| `_efQtyRender` | les 4 champs affichés → `_efRef.base` | `srcChange` vrai |

**Les six sont dans `04_CODE_SOURCE.md`, en entier.** Les 286 écritures brutes sont dans `06`.
