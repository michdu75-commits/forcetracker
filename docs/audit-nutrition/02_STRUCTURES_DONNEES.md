# 02 — STRUCTURES DE DONNÉES RÉELLES

> **Version décrite : `ft-v1174`.** Les formes ci-dessous sont relevées **dans le code**
> (`_provFood`, `_afMajAncre`, `_efQtyRender`, `_lookupBarcode`) — pas inventées pour l'exemple.
> ⚠️ En cas d'écart avec `04_CODE_SOURCE.md`, **c'est le code qui fait foi**.

---

## 1. `S.foodLog` — une ligne du journal

C'est **le seul objet persisté** de la chaîne (localStorage `ft4_*`, puis sync cloud).

| champ | type | unité | signification | c'est un… | créé par | modifié par |
|---|---|---|---|---|---|---|
| `date` | `'YYYY-MM-DD'` | — | jour du repas | — | `addFoodEntry`, `quickAddFood` | — |
| `meal` | `string` | — | `petitdej`·`collation`·`dejeuner`·`collation2`·`diner` | — | idem | `saveEditFood` |
| `name` | `string` (≤80) | — | nom affiché | — | idem | `saveEditFood` |
| `ts` | `number` | ms | identifiant de la ligne | — | idem | jamais |
| `kcal` | `int` | kcal | **TOTAL CONSOMMÉ** | ⚠️ **total** | idem | `saveEditFood` |
| `prot` `carbs` `fat` | `int` | g | **TOTAL CONSOMMÉ** | ⚠️ **total** | idem | `saveEditFood` |
| `q` | `number`\|`null` | selon `u` | **quantité consommée** | portion | `_provFood` | `saveEditFood` |
| `u` | `'g'`\|`null` | — | unité de `q` | — | `_provFood` | `saveEditFood` |
| `per100` | `{kcal,prot,carbs,fat}`\|`null` | pour 100 g | **RÉFÉRENCE NUTRITIONNELLE** | ⭐ **référence** | `_provFood` | jamais après écriture |
| `saisie` | `string` | — | `scan`·`liste`·`historique`·`manuel`·`ia-texte`·`photo-code`·`etiquette-main`·`recherche`·`ciqual`·`marque` | — | `_provFood` | — |
| `origine` | `string` | — | `off`·`ciqual`·`marque`·`utilisateur`·`ia`·`reprise`·`etiquette` | — | `_provFood` | — |
| `sourceId` | `string`\|`null` | — | EAN, `ciqual:NNNN`, id de marque | — | `_provFood` | — |
| `etat` | `'tel-que-vendu'`\|`null` | — | valeurs SÈCHES (pâtes, riz) vs préparées | — | `_provFood` | — |
| `modifie` | `bool` | — | les 4 valeurs ont été retouchées à la main après remplissage auto | — | `_provFood` | — |
| `codeDouteux` | `true` (absent sinon) | — | code-barres dont la clé de contrôle n'a pas été vérifiée | — | `_provFood` | — |
| `doute` | `string`\|absent | — | motif d'un chiffre publié incohérent (marques) | — | `_provFood` | — |
| `kcalDerivee` | `true`\|absent | — | les kcal viennent des macros, pas d'une source | — | `_provFood` | — |
| `v` | `int` | — | `FOOD_LOG_V`, version du schéma | — | `_provFood` | — |

⛔⛔ **LE POINT CENTRAL POUR L'AUDIT** : dans la même ligne cohabitent un **TOTAL**
(`kcal/prot/carbs/fat`), une **QUANTITÉ** (`q`) et une **RÉFÉRENCE** (`per100`). Les trois ne
sont pas toujours tous présents — `per100` et `q` valent `null` sur certains chemins.

---

## 2. `_afRef` — la référence de travail de l'écran d'ajout

```js
let _afRef = null;   // ou { base:{kcal,prot,carbs,fat}, q:number, u:'g'|'', src:string }
```

| champ | signification |
|---|---|
| `base` | des **TOTAUX**, pas un pour-100 g |
| `q` | la quantité à laquelle `base` correspond (`1` quand il s'agit d'« une portion ») |
| `u` | `'g'` si la quantité est un poids réel ; `''` pour une portion sans masse connue |
| `src` | ce qui est écrit à l'écran : `'poids estimé par l'IA'`, `'lu dans ta phrase'`, `'que tu as indiqué'`, `'portion'` |

⛔ **Un seul écrivain : `_afMajAncre`.** Elle est appelée avec `srcChange` **vrai** quand les
valeurs viennent d'ailleurs (estimation IA, reprise, macro corrigée à la main, changement
d'unité si aucun poids réel n'a été posé) → elle relit les 4 champs de l'écran ; **faux** quand
elle ne fait que redessiner → `base` est préservée.

## 3. `_efRef` — le jumeau, écran « Modifier l'aliment »

Même forme, écrit uniquement par `_efQtyRender`, avec la même règle `srcChange`.
`u` peut y valoir `null` (portion) ou l'unité de l'ancrage (`'g'`, `'ml'` — *l'unité voyage*,
ft-v1103 : 100 ml de miel ne pèsent pas 100 g).

## 4. `_bcNutr` — le pour-100 g de l'aliment à l'écran

```js
let _bcNutr = null;  // ou { name, kcal100, prot100, carbs100, fat100 }
```

⭐ **C'est lui qui décide quel bloc de quantité s'affiche** (voir 01 §4). Posé par
`_lookupBarcode`, `_offRemplirFormulaire`, `_calAppliquer`, `quickFillFood`, `_afSuggPrendre*` ;
remis à `null` par `openAddFood`, `_bcSansValeurs` et la branche « pas de pour-100 g » de
`quickFillFood`.

---

## 5. Ce que produit chaque source

| source | `per100` | `q` | `u` | `etat` | commentaire |
|---|---|---|---|---|---|
| **Scan OFF** (fiche complète) | ✅ depuis `nutriments` | ✅ si un poids est saisi | `'g'` | `'tel-que-vendu'` | valeurs **telles que vendues** (riz = SEC) |
| **Scan OFF** (fiche sans valeurs) | ⛔ `null` | ⛔ `null` | `null` | `null` | part au calibrage (ft-v1165) |
| **Recherche par nom (OFF)** | ✅ | ✅ si saisi | `'g'` | `'tel-que-vendu'` | même chemin que le scan |
| **CIQUAL** | ✅ (table locale) | ✅ si saisi | `'g'` | `null` | pas de portion déclarée → 100 g par défaut |
| **Marque / fast-food** | ✅ (table locale) | ✅ portion publiée | `'g'` | `null` | 123/123 ont un poids de portion |
| **Étiquette recopiée** (`_calAppliquer`) | ✅ saisi à la main | ✅ si saisi | `'g'` | `null` | `origine:'etiquette'` |
| **Estimation IA** (texte/photo) | ⛔ `null` | ⛔ sauf poids déclaré | — | `null` | l'IA rend des **totaux**, pas un pour-100 g |
| **Reprise « Mes aliments » / historique** | 🔁 recopié **s'il existait** | ⚠️ **voir ci-dessous** | — | recopié | `origine:'reprise'` |

⛔⛔ **LE POINT QUE L'AUDITEUR DOIT REGARDER EN PREMIER**, et il est **mesuré, pas supposé** :

- `quickFillFood` (le pré-remplissage du formulaire depuis la liste) reçoit un objet qui porte
  `it.q` — **la quantité d'origine**. Elle ne s'en sert que dans la branche `per100` (pastille
  « ↩ 380 g (la dernière fois) »). **Dans la branche sans `per100`, `it.q` n'est utilisé nulle
  part.**
- `quickAddFood` (l'ajout direct depuis la liste, sans ouvrir le formulaire) recopie
  `it.kcal/prot/carbs/fat` — **des totaux** — et appelle `_afSetSrc({saisie:'liste',
  origine:'reprise'})` **sans `per100`, sans `q`, sans `u`**. La ligne créée porte donc un total
  et **aucune quantité**.

Ces deux constats sont visibles dans `04_CODE_SOURCE.md`. **Aucun n'est corrigé ici.**

---

## 6. Formes qui coexistent dans les données réelles

Relevé sur un export de journal réel (168 lignes, 08/07 → 07/09) fourni par l'utilisateur :

| forme | exemple | conséquence |
|---|---|---|
| référence complète | `q:380, u:'g', per100:{72,…}` | rescalable à volonté |
| **total sans quantité** | `q:null, per100:null, kcal:323` | ⛔ **non convertible** : rien ne permet de retrouver un pour-100 g |
| total + quantité, **sans** référence | `q:110, u:'g', per100:null` | le pour-100 g est **dérivable**… et c'est là que tout se joue |

⚠️ La troisième forme est celle qui permet à `_provFood` de **fabriquer** un `per100`
(`04_CODE_SOURCE.md`, `_provFood`, la branche `if(!p.per100 && _afRef.u==='g' && _afRef.q>0)`).
Cette dérivation est légitime quand le couple (totaux ↔ quantité) est juste. **Elle propage
l'erreur quand il ne l'est pas.**
