# 01 — ARCHITECTURE DE LA CHAÎNE NUTRITION

> **Version décrite : `ft-v1174`** (08/09/2026) — Force Tracker, PWA JS vanilla, sans framework.
>
> ⚠️ **CE FICHIER EST ÉCRIT À LA MAIN, LES 04/05/06 SONT GÉNÉRÉS.** En cas d'écart entre ce que
> ce document raconte et ce que `04_CODE_SOURCE.md` montre, **c'est le code qui a raison** — ce
> fichier peut se périmer, l'extraction non (`python3 tools/audit-nutrition.py`).
>
> ⛔ Conformément à la demande : **aucun correctif, aucun patch, aucune défense de
> l'architecture**. Ce qui suit décrit ce qui existe, y compris ce qui semble bancal.

---

## 1. Les fichiers

Aucun bundler, aucun build. Les fichiers sont servis tels quels et **partagent un seul espace
global** — l'ordre de chargement compte, et une redéclaration de nom écrase silencieusement
(défaut réel rencontré le 07/09, d'où un contrôle permanent aujourd'hui).

| fichier | ce qu'il porte pour la nutrition |
|---|---|
| `state.js` | l'objet global `S`, `load()`, `persist()`, `calcTDEE()`, `calcMacros()` |
| `app.js` | **l'essentiel** : saisie, scan, recherche, calibrage, provenance, journal |
| `screens.js` | `renderNutrition()` (l'écran), l'aide contextuelle |
| `constants.js` | `FOOD_MEALS`, `FOOD_LOG_V`, `AI_PROXY_ACTIONS` |
| `data/ciqual.json` | table CIQUAL 2025 (ANSES), 3 484 aliments, **pour-100 g uniquement** |
| `data/marques.json` | 123 produits de fast-food, **avec un poids de portion (123/123)** |
| `data/alias.json` | 632 alias de recherche → codes CIQUAL |
| `Code.js` / `worker.js` | backend : lecture d'étiquette et estimation IA — **pas de calcul de portion** |

⚠️ **Open Food Facts n'est PAS une table locale** : c'est un appel réseau en direct, produit par
produit (`_offFetchProduct`, `_offRechercher`).

---

## 2. Les trois objets, et où ils vivent réellement

L'auditeur précédent recommandait de séparer *référence nutritionnelle*, *portion* et *log*.
**Cette séparation existe déjà dans la donnée** depuis ft-v907 (« brique 0 ») et ft-v1056 :

```js
// une entrée de S.foodLog, telle que _provFood la construit
{
  date, meal, name, ts,          // identité
  kcal, prot, carbs, fat,        // ⚠️ LE TOTAL CONSOMMÉ (pas une référence)
  q, u,                          // la quantité consommée + son unité ('g' | null)
  per100: {kcal,prot,carbs,fat}, // ⚠️ LA RÉFÉRENCE (ou null si inconnue)
  saisie, origine, sourceId,     // provenance
  etat, modifie, codeDouteux, doute, kcalDerivee, v
}
```

👉 **Le modèle n'est donc pas le problème.** Ce qu'il faut auditer est **qui écrit `per100`, à
partir de quoi, et si `q` survit aux chemins de reprise** — c'est l'objet du fichier 06.

---

## 3. Le calcul de portion est LOCAL et déterministe

Une seule fonction redimensionne : **`_qtyRescale(pre, base, ref, saisie)`** (`app.js`, 20
lignes). Elle est appelée par les 4 façades (`_bcApplyGrams`, `_afApplyProp`, `_efApplyProp`,
`_efApplyGrams`).

```
facteur = quantité_saisie / quantité_de_référence
valeur  = base × facteur
```

⛔ **Aucune IA n'intervient dans ce calcul.** Le modèle (Milo / le worker) sert à *identifier* un
aliment ou *lire* une étiquette ; il ne multiplie jamais une portion. Vérifiable dans `06` : le
fichier `worker.js` n'écrit aucun des noms de la vérité nutritionnelle.

---

## 4. Les DEUX écrans de quantité, et leur invariant

Il existe **deux blocs de quantité distincts**, qui ne doivent jamais être visibles ensemble :

| bloc | id HTML | quand | référence |
|---|---|---|---|
| **pour-100 g** | `af-bc-row` | un `per100` est connu (scan, recherche, CIQUAL, marque, calibrage) | `per100` ↔ 100 g |
| **proportionnel** | `af-prop-row` | **aucun** `per100` | `_afRef.base` ↔ `_afRef.q` |

L'invariant est posé à la première ligne de `_afMajAncre` :

```js
if(_bcNutr){ _afPropCacher(); return; }   // un pour-100 g est connu : l'autre bloc se retire
```

⚠️ **Constat à vérifier par l'auditeur** : une capture d'écran du 08/09 montre **les deux blocs
ouverts en même temps**, après un passage par le calibrage. Le code de `_calAppliquer` (fichier
04) affiche `af-bc-row` sans rappeler `_afMajAncre`. **Ce n'est pas corrigé, c'est signalé.**

---

## 5. Les variables globales qui portent la référence

| variable | portée | ce qu'elle contient | qui l'écrit |
|---|---|---|---|
| `_bcNutr` | écran d'ajout | `{name, kcal100, prot100, carbs100, fat100}` — **le pour-100 g** | `_lookupBarcode`, `_calAppliquer`, `quickFillFood`, `_afSuggPrendre*` |
| `_afRef` | écran d'ajout | `{base:{kcal,prot,carbs,fat}, q, u, src}` — **des totaux appariés à une quantité** | `_afMajAncre` (seul) |
| `_efRef` | écran d'édition | idem, pour « Modifier l'aliment » | `_efQtyRender` (seul) |
| `_afSrc` | écran d'ajout | la provenance en attente, recopiée à l'enregistrement | `_afSetSrc` |
| `_afUnite` / `_afPoidsDeclare` / `_afPoidsPose` | écran d'ajout | l'unité choisie et le poids déclaré | `_afSetUnite`, `_afDeclarePoids` |

⛔⛔ **Le point le plus sensible de toute la chaîne** : `_afRef.base` sont des **TOTAUX**, et
`_afRef.q` la quantité à laquelle ils correspondent. **Le couple ne vaut que s'il est apparié.**
Trois versions (ft-v1061, ft-v1173) ont déjà corrigé des désappariements ; les protections sont
encore dans le code (fichier 04) et portent leur numéro de version en commentaire.

---

## 6. Ce que ce dossier ne contient pas

- ⛔ **Aucun correctif** — demande explicite de l'auditeur.
- ⛔ **Le rendu de l'écran** (`renderNutrition`, les anneaux, les cartes) : il *lit* le journal,
  il ne fabrique aucune référence. Inclus dans `06` seulement s'il écrit un des noms surveillés.
- ⛔ **La sauvegarde cloud** (`_cloudSync`) : elle transporte `S.foodLog` sans le transformer.
