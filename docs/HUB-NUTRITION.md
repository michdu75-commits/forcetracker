# 🔀 Le HUB de préparation Nutrition — étape 4

> **Créé le 13/09/2026**, sur feu vert de Michel après la clôture du chantier 1b/3 :
> ⛔ *« Je ne veux PAS encore la douane. Le hub doit d'abord être construit et validé seul. »*
>
> **Objectif, mot pour mot** : *« faire converger les portes d'entrée Nutrition vers un chemin
> commun de préparation d'un aliment, **sans modifier ce qui est enregistré aujourd'hui** »*.

---

## 1️⃣ LES PORTES RÉELLES — cartographie refaite le jour même

**12 fonctions** appellent `_afOublierAliment` (le reset d'aliment). Classées par **RÔLE**, jamais
par ressemblance :

| # | groupe | fonctions | état |
|---|---|---|---|
| **A** | passent **déjà** par `_offRemplirFormulaire` | `_lookupBarcode` · `_calAppliquer` · `_afSuggPrendreMarque` · `_afSuggPrendreCiqual` · `_afSuggPrendreOff` | **5** — migrées d'un coup, via leur hub |
| **B** | préparent l'écran **à la main** | `quickFillFood` · `_afSuggPrendreLocale` · `onFoodLabelFile` · `estimateFoodAI` | **4** — une seule migrée |
| **C** | **ne préparent pas un aliment** | `openAddFood` (l'ouverture) · `_bcSansValeurs` (repli « produit sans valeurs ») · `quickAddFood` (ajout **direct**, sans écran) | **3** — hors sujet par nature |

➕ **`rejouerRepas`** n'appelle même pas `_afOublierAliment` : elle écrit directement, aucun écran.

### ⚠️ Le premier relevé était FAUX — §63 dans l'instrument

Il attribuait des appels à **`readFoodLabel`** et **`scanBarcodeIA`**. **Ce ne sont pas des
portes** : 7 lignes chacune, elles n'ouvrent que le sélecteur de fichier. Les vraies portes sont
**`onFoodLabelFile`** et **`estimateFoodAI`**.

**Cause** : l'extracteur bornait les corps par `\nfunction NAME(` et ratait les `async function`.
👉 *Un motif qui suppose une syntaxe ne compte pas les endroits.* **Attrapé par une ligne de points
qui ne pouvait pas être vide** — pas par une relecture.

---

## 2️⃣ LE NOYAU COMMUN — mesuré geste par geste

`onFoodLabelFile` recopiait **8 des 13 gestes** de `_offRemplirFormulaire`, et **son propre
commentaire le disait depuis ft-v1163** : *« c'est exactement ce que faisait
`_offRemplirFormulaire` »*.

| geste | `_offRemplirFormulaire` | `onFoodLabelFile` | dans le hub ? |
|---|---|---|---|
| vider le champ des grammes | ✅ | ✅ | **OUI** |
| `_bcQtyPose = false` | ✅ | ✅ | **OUI** |
| proposer la portion | ✅ | ✅ | **OUI** |
| écrire **d'où vient** ce nombre | ✅ | ✅ | **OUI** |
| poser le nom | ✅ | ✅ | **OUI** |
| montrer la ligne | ✅ | ✅ | **OUI** |
| poser la description | ✅ | ✅ | **OUI** |
| recalculer | ✅ | ✅ | **OUI** |
| pastille « la dernière fois » | ✅ | ⛔ | **non** |
| le **paquet** | ✅ | ⛔ | **non** |
| la **provenance** (`_afSetSrc`) | ✅ | ✅ *(la sienne)* | **non** |
| l'état (`_afNoteEtat`) | ✅ | ⛔ | **non** |
| la carte santé | ✅ | ⛔ | **non** |

> ⭐⭐ ***Un hub qui fait plus que le noyau commun n'est pas un chemin commun : c'est une porte qui
> en avale une autre.*** Absorber les 5 gestes manquants changerait le comportement de
> `onFoodLabelFile` — **mesuré, pas supposé**.

**⚠️ Les trois libellés sont des PARAMÈTRES, pas des règles.** Chaque porte sait *d'où vient* le
nombre qu'elle propose (« portion fabricant » · « lu sur l'étiquette » · l'enseigne pour un produit
de marque). Le hub, lui, ne le sait pas — *une formule unique lui ferait inventer une source*.

---

## 3️⃣ CE QUE LE HUB NE FAIT PAS — et c'est la moitié de sa définition

⛔ **Le hub n'est PAS la douane.** Il **prépare** ; la douane validera plus tard.

| il ne… | figé par |
|---|---|
| ne juge pas si une ligne est **valide** | témoin de source ⑨ (aucun `toast`, aucune validation) |
| ne **corrige** aucune valeur | ⑨ |
| ne **bloque** aucun enregistrement | ⑨ |
| ne touche pas à `S.foodLog` | témoins ③ **et** ⑨ (comportement **et** source) |
| ne touche pas à la **provenance** | ④ et ⑨ |
| ne touche ni **quantité**, ni **unité**, ni **pour-100 g**, ni **portion** | ⑤ et ⑪ |
| ne touche **aucun propriétaire** de 1b/3 | ⑪ |

---

## 4️⃣ NON-FUSION PAR RESSEMBLANCE — la question posée nommément par Michel

> *« vérifie qu'aucune porte n'est fusionnée simplement parce qu'elle "ressemble" à une autre »*

**Mesuré**, part du noyau faite en propre par chaque porte restée dehors :

| porte | gestes du noyau qu'elle fait | pourquoi elle ne migre pas |
|---|---|---|
| `quickFillFood` | **4 / 8** | ni portion proposée, ni recalcul, ni description → **les y brancher AJOUTERAIT des gestes** |
| `_afSuggPrendreLocale` | **5 / 8** | idem (ni portion, ni recalcul) |
| `_bcSansValeurs` | 2 / 8 | c'est un **repli**, pas un aliment préparé : elle ouvre la saisie manuelle |
| `estimateFoodAI` | 1 / 8 | elle ne prépare pas l'écran, elle pose une estimation |
| `openAddFood` | 1 / 8 | c'est **l'ouverture** de l'écran, pas une porte d'aliment |
| `quickAddFood` | 0 / 8 | **aucun écran** : elle écrit directement |

**Deux témoins figent cette non-fusion**, et la mutation *« quickFillFood ressemble, je la branche
aussi »* fait **2 rouges**.

---

## 5️⃣ CE QUI RESTE À FAIRE

- ⏭️ **Les 3 portes du groupe B non migrées** (`quickFillFood`, `_afSuggPrendreLocale`,
  `estimateFoodAI`) : elles ne feront converger quoi que ce soit **que si** on décide de changer
  leur comportement — donc **décision produit**, pas extraction. **Non commencé.**
- ⛔ **La douane** — consigne explicite : elle vient **après** validation du hub seul.
- ⛔ Hors périmètre inchangé : `savedFoods` multi-onglets · l'écart **48,3 / 48** · l'historique ·
  les migrations · les harmonisations produit · le garde `!_bcNutr` non bloquant (mesuré et
  documenté en ft-v1203, **feu vert séparé**).

---

## 6️⃣ COMBIEN DE PORTES ATTEIGNENT RÉELLEMENT LE HUB — le chiffre qui a failli être faux

| mesure | valeur |
|---|---|
| portes réelles (appellent `_afOublierAliment`) | **12** |
| **appelants** du hub | **2** — `_offRemplirFormulaire` · `onFoodLabelFile` |
| **portes** qui atteignent le hub | **6** — les 5 du groupe A *indirectement*, + `onFoodLabelFile` en direct |
| portes qui restent dehors | **6** — 3 du groupe B (décision produit) + 3 du groupe C (hors sujet) |

⚠️⚠️ **Le premier compte donnait 7, et il était faux.** Il dérivait les portes servies de
l'ensemble des portes — or ⛔ **`_offRemplirFormulaire` n'est PAS une porte** : elle n'appelle pas
`_afOublierAliment`, ce sont ses **5 appelants** qui le font. 👉 ***Un sous-ensemble supposé est une
mesure qu'on n'a pas faite.*** Attrapé par un garde qui recompte, pas par une relecture — et figé :
le générateur du PDF refuse de produire si ce chiffre n'est plus 6.
