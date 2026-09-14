# 🏁 Banc d'essai — quel moteur de décodage local pour Force Tracker ?

> **14/09/2026** · chantier ouvert par Michel à partir de `SCANNER-CAMERA-LOCAL-1.pdf`.
> ⛔⛔ **AUCUNE RÉACTIVATION UTILISATEUR PENDANT CE CHANTIER** — *« NE RÉACTIVE PAS le scanner
> dans l'interface utilisateur… Aucun bouton utilisateur tant que je n'ai pas tranché. »*
> Le bouton livré la veille en ft-v1210 a donc été **retiré**, et un témoin le fige.
>
> Mesures brutes agrégées : **`docs/banc-moteurs-mesures.json`** (relu par le générateur du PDF,
> qui refuse de produire si un chiffre du document ne s'y retrouve pas).

---

## 0. La réponse en cinq lignes

| | |
|---|---|
| **Le meilleur moteur seul** | **zxing-wasm** — **86,2 %** contre **77,5 %** au ZXing-js servi, et **25× plus rapide** (1,1 ms contre 28,1 ms) |
| **Le meilleur duo** | **zxing-wasm + Quagga2 (cadré)** — **91,3 %** |
| **Ce que personne ne lit** | le **flou ≥ 2 px**, et rien d'autre. Les 12 images inlisibles sont toutes des flous |
| **Le vrai facteur limitant** | la **mise au point**, pas le moteur : un flou léger coûte **3×** la résolution, un flou franc **6×** |
| **Verdict** | **C — ZXING + FALLBACK LOCAL SECONDAIRE**, avec **zxing-wasm en moteur principal** |

---

## 1. Les couches, et qui fait quoi (§1)

```
CAMÉRA → acquisition (résolution · objectif) → MISE AU POINT → orientation
       → recadrage → MOTEUR DE DÉCODAGE → candidat brut
       → validation EAN (clé de contrôle) → déduplication → 1 SEULE recherche produit
```

| solution | ce qu'elle apporte vraiment | moteur réellement différent ? |
|---|---|---|
| **ZXing-js (servi)** | le décodage seul. L'app fournit elle-même caméra, cycle de vie, UI | — c'est la référence |
| **Html5-QRCode** | une **couche caméra / UX** : sélection de l'objectif, cadre de visée, cycle de vie, scan de fichier | ⛔ **NON** — il embarque un **fork de zxing-js** (`third_party/zxing-js.umd`) |
| **zxing-wasm** | **le décodeur ZXing-C++** compilé en WebAssembly. Aucune caméra, aucune UI | ✅ **OUI** — autre implémentation, autre langage |
| **Quagga2** | un décodeur 1D **et** un localisateur de code dans une scène | ✅ **OUI** — algorithme totalement distinct |

---

## 2. Html5-QRCode — la question de Michel, et sa réponse mesurée (§2)

> *« Si Html5-QRCode utilise essentiellement le même moteur ZXing pour lire le code, dis-le
> clairement. »*

**Oui, et c'est lu dans son code source, pas supposé** : `code-decoder.ts` importe
`ZXingHtml5QrcodeDecoder`, qui importe `../third_party/zxing-js.umd` — un **fork de la
bibliothèque zxing-js** que nous servons déjà.

⛔⛔ **ET IL LA BRIDE.** `zxing-html5-qrcode-decoder.ts`, ligne 80 :

```ts
hints.set(ZXing.DecodeHintType.TRY_HARDER, false);
```

👉 ***`TRY_HARDER` est forcé à `false` en dur, et rien dans son API publique ne permet de le
rallumer.*** C'est exactement le réglage que nous avons mesuré en ft-v1210 comme étant celui qui
achète la lecture d'un code en paysage.

**Et ça se voit dans les chiffres** : **68,8 %** contre **77,5 %** pour le même moteur non bridé.
Il échoue précisément là où `TRY_HARDER` sert — **faible lumière (0/18)**, **faible contraste
(0/18)**, **cumul réaliste (0/18)**.

⭐⭐ **La preuve par le prétraitement** : lui appliquer un simple **étirement des niveaux** lui
rend **+18** (95 → 113). *Le prétraitement ne l'améliore pas, il compense un réglage qu'on lui a
retiré* — et même compensé, il reste **sous** zxing-wasm brut (119).

**Ce qu'il apporte réellement** : la **couche caméra** (sélection de l'objectif arrière, cadre de
visée, cycle de vie, arrêt propre, scan de fichier). ⚠️ **Or nous avons déjà tout ça**, écrit et
éprouvé en ft-v1210 : machine à états, `facingMode:'environment'`, coupure du flux par deux
chemins, table de fermeture. **Il remplacerait du code qui marche par du code équivalent, en
dégradant le décodage.**

---

## 3. zxing-wasm — il rattrape-t-il vraiment des cas ? (§3)

> *« Récupère-t-il réellement des cas que ZXing-js rate ? Pas seulement "il est techniquement
> différent". »*

**Oui, et on peut les nommer** : il lit **2 familles de cas** que ZXing-js rate.

| cas | ZXing-js | zxing-wasm |
|---|---|---|
| **rotation 90° (code en portrait)** | **0/18** | **18/18** |
| **recadrage serré (3 modules de zone de silence)** | **0/18** | **18/18** |

⭐ **La première est la plus importante en usage réel** : le téléphone tenu verticalement devant un
code horizontal, c'est le geste le plus banal.

| mesure | ZXing-js servi | zxing-wasm |
|---|---|---|
| taux global | 77,5 % | **86,2 %** |
| cas durs | 75,5 % | **81,4 %** |
| temps moyen | 28,1 ms | **1,1 ms** |
| p95 | 131,6 ms | **3,5 ms** |
| maximum | 188,5 ms | **8,1 ms** |
| 1ᵉʳ appel (init compris) | 8,8 ms | 30,6 ms |
| appel chaud | 1,57 ms | **0,87 ms** |
| octets chargés | 328 Ko (97 Ko gzip) | 36 Ko js + **931 Ko wasm** (13 + 403 Ko gzip) |

⚠️ **Le coût honnête** : le `.wasm` pèse **931 Ko** (403 Ko compressés), soit **+306 Ko
transférés** par rapport au ZXing actuel. ⭐ Mais il **remplace** les 328 Ko de `zxing.min.js`, et
il n'est chargé **qu'à l'ouverture du scanner** — jamais au démarrage (règle d'or #4 intacte).

⛔ **Intégration PWA** : il existe en **IIFE** (36 Ko), donc **aucun bundler**, `<script src>` comme
le reste. Le `.wasm` se sert depuis `lib/`, via `locateFile` — **aucun CDN**.
⚠️ **Ce que je ne peux pas mesurer d'ici** : le comportement WebAssembly de **Safari/iOS**. WASM y
est supporté depuis iOS 11, mais *je ne le présente pas comme validé* — c'est le premier point du
protocole iPhone.

---

## 4. Quagga2 — pertinent ou pas ? (§4)

**Pertinent, et c'est une surprise** : il fait **87,0 %** en mode « cadré », le meilleur score
brut du banc, et **88,2 % sur les cas durs** — le meilleur du banc, là aussi.

⭐⭐ **Il est nettement plus tolérant au FLOU**, ce qui est exactement notre ennemi n°1 :

| flou du direct | ZXing-js / wasm / Html5 | **Quagga2** |
|---|---|---|
| léger (0,8 px) | module ≥ **3** | module ≥ **2** |
| franc (1,5 px) | module ≥ **6** | module ≥ **3** |

Et il lit **« flou + reflet »** (18/18) que **les trois autres ratent** (0/18).

⛔⛔ **MAIS IL A UN DÉFAUT QU'AUCUN AUTRE N'A, ET IL EST GRAVE.** En mode **« scène »**
(`locate:true`, le mode qu'il faut pour chercher un code dans une image large), il produit des
**EAN-8 de clé de contrôle PARFAITEMENT VALIDE** lus **à l'intérieur** d'un EAN-13 :

| image | code réel | ce que Quagga2 (scène) rend |
|---|---|---|
| 05 de près | 3083681011791 | **11151791** |
| 07 petit code | 3021690201123 | **90171123** |
| 13 faible contraste | 3083681011791 | **79255158** |
| 20 bougé léger | 3021690201123 | **90171123** |

👉 ***Un code faux dont la clé est juste ne peut être attrapé par RIEN en aval*** : ni par le
validateur, ni par la recherche produit, qui rendra « inconnu » — ou pire, **un autre produit**.

⚠️ **Et ce n'est pas un détail de configuration** : le mode « cadré » (`locate:false`) qui donne
87 % suppose que **le code remplit l'image**. Mesuré : sur une image où le code remplit le cadre,
`locate:true` tombe à **18,8 %** et `locate:false` monte à **87 %**. *Le mode qui marche ici est
celui qui ne cherche pas — donc il exige un cadre de visée strict.*

---

## 5. Les fixtures (§5) — et comment la courbure est simulée

**23 cas × 6 codes × 3 passes = 414 mesures par moteur.** Le **même canvas** est servi à tous.

⭐ **La zone de silence est comptée en MODULES, jamais en pixels** (la norme EAN-13 en exige 9 à
11) — l'erreur de ft-v1209, où 20 pixels ne valaient que 2,5 modules et faisaient conclure
« code vu de près : illisible » alors que c'était **ma fixture**.

### La courbure, expliquée (Michel : *« si tu simules la courbure, explique comment »*)

Un code collé sur une boîte cylindrique ne se déforme **pas en vague**. Vu de face, chaque colonne
de l'image correspond à un point du cylindre, et l'abscisse apparente suit un **sinus** de
l'angle. Les barres du **centre** gardent leur largeur, celles des **bords** sont **comprimées** —
et c'est exactement ce qui casse la lecture, puisqu'un décodeur mesure des **largeurs**.

Pour une colonne de sortie `x ∈ [-1,1]` et une étiquette couvrant un angle `a` :

```
u = asin( x · sin(a/2) ) / (a/2)
```

`u` est l'abscisse **source** à lire. `a = 0` rend l'image plate. On assombrit en plus les bords
(`k = 0,55 + 0,45·cos(x·a/2)`), parce qu'un vrai cylindre **perd du contraste là où il fuit la
lumière**. Deux niveaux sont testés : **70°** (boîte de conserve) et **100°** (forte).

⚠️ **Ce que la simulation ne couvre pas, dit plutôt que masqué** : elle n'inclut ni la texture du
carton, ni l'impression réelle, ni les vrais reflets d'un emballage brillant. *C'est un modèle
géométrique, pas une photo.*

### Le tableau par cas

| cas | ZXing-js | Html5-QRCode | zxing-wasm | Quagga2 (cadré) |
|---|---|---|---|---|
| 01 net | 18/18 | 18/18 | 18/18 | 18/18 |
| 02 flou léger 1 px | 18/18 | 18/18 | 18/18 | 18/18 |
| **03 flou moyen 2 px** | **0/18** | **0/18** | **0/18** | **0/18** |
| **04 flou fort 3 px** | **0/18** | **0/18** | **0/18** | **0/18** |
| 05 de près (mod 8) | 18/18 | 18/18 | 18/18 | 18/18 |
| 06 de loin (mod 1,6) | 15/18 | 15/18 | 15/18 | **18/18** |
| 07 petit code (mod 2) | 18/18 | 18/18 | 18/18 | 18/18 |
| 08 rotation 8° | 18/18 | 18/18 | 18/18 | 18/18 |
| 09 rotation 35° | 18/18 | 18/18 | 18/18 | 18/18 |
| **10 rotation 90° (portrait)** | **0/18** | **0/18** | **18/18** | **0/18** |
| 11 faible lumière 25 % | 18/18 | **0/18** | 18/18 | 18/18 |
| 12 reflet 0,72 | 18/18 | 18/18 | 18/18 | 18/18 |
| 13 faible contraste | 18/18 | **0/18** | 18/18 | 18/18 |
| 14 courbure 70° | 18/18 | 18/18 | 18/18 | 18/18 |
| 15 courbure 100° | 18/18 | 18/18 | 18/18 | 18/18 |
| 16 perspective 0,35 | 18/18 | 18/18 | 18/18 | 18/18 |
| **17 recadrage serré (3 mod)** | **0/18** | 18/18 | 18/18 | 18/18 |
| 18 zone de silence norme | 18/18 | 18/18 | 18/18 | 18/18 |
| 19 zone de silence limite (7 mod) | 18/18 | 18/18 | 18/18 | 18/18 |
| 20 bougé léger 3 px | 18/18 | 18/18 | 18/18 | 18/18 |
| **21 flou + reflet** | **0/18** | **0/18** | **0/18** | **18/18** |
| 22 courbure + perspective | 18/18 | 18/18 | 18/18 | 18/18 |
| 23 cumul réaliste | 18/18 | **0/18** | 18/18 | 18/18 |

---

## 6. Le tableau comparatif (§6)

| | ZXing-js (servi) | Html5-QRCode | **zxing-wasm** | Quagga2 (cadré) | Quagga2 (scène) |
|---|---|---|---|---|---|
| **taux de réussite** | 77,5 % | 68,8 % | **86,2 %** | **87,0 %** | 18,8 % |
| **cas durs** | 75,5 % | 63,7 % | 81,4 % | **88,2 %** | 17,6 % |
| **temps moyen** | 28,1 ms | 13,2 ms | **1,1 ms** | 17,0 ms | 49,1 ms |
| **p95** | 131,6 ms | 28,3 ms | **3,5 ms** | 28,3 ms | 69,0 ms |
| **maximum** | 188,5 ms | 69,8 ms | **8,1 ms** | 50,0 ms | 103,6 ms |
| **erreurs JS** | 0 | 0 | 0 | 0 | 0 |
| **faux positifs (EAN valide mais FAUX)** | **0** | **0** | **0** | **0** | ⛔ **12** |
| **codes rejetés par le validateur** | 0 | 0 | 0 | 0 | 0 |
| **stabilité (3 passes)** | 138/138 identiques | 138/138 | 138/138 | 138/138 | 138/138 |
| **octets chargés (gzip)** | 97 Ko | 106 Ko | 13 + **403** Ko | 42 Ko | 42 Ko |
| **1ᵉʳ appel (init)** | 8,8 ms | 13,0 ms | 30,6 ms | 25,1 ms | 66,4 ms |
| **appel chaud** | 1,57 ms | 16,11 ms | **0,87 ms** | 14,17 ms | 43,08 ms |
| **intégration** | déjà en place | UMD, remplace notre couche caméra | IIFE + un `.wasm` à servir | UMD simple | UMD simple |
| **mémoire (tas JS après la passe)** | ≈ 51 Mo pour les 5 moteurs réunis — non séparable par moteur, et c'est dit | | | | |

⚠️ **Une réserve sur les temps** : chaque moteur est mesuré **avec son chemin d'entrée obligatoire**
(ZXing-js et Quagga2 exigent une image ou une URL, zxing-wasm accepte directement un `ImageData`).
*Ce n'est pas un biais, c'est le coût réel de chaque intégration* — mais ça explique une partie de
l'écart de ZXing-js, qui paie un `toDataURL` à chaque appel.

---

## 7. La chaîne de validation unique (§7 et §18) — **construite et éprouvée**

```
MOTEUR(S) → candidat brut → _eanValide() → déduplication → _bcFusionnerCandidats() → 1 recherche
```

⭐ **Aucun propriétaire n'a été créé** : `_eanValide` existait déjà et reste le **seul** endroit qui
connaît la clé de contrôle (**R2**). Ce qui est neuf est **`_bcFusionnerCandidats`**, qui rend
**trois états** :

| état | quand | recherches |
|---|---|---|
| `aucun` | personne n'a lu, ou la clé est fausse | **0** |
| `valide` | un seul code, validé (confirmé par 1 ou N moteurs) | **1** |
| **`conflit`** | **deux codes valides DIFFÉRENTS** | ⛔ **0** |

⛔ **Le conflit ne s'avale pas** : pas de lookup, les deux candidats sont **nommés**, l'écran
redemande une capture et le scanner **retourne à l'état SCANNING**. *« Jamais prendre le premier et
continuer. Aucune invention. »*

⭐ **La déduplication passe AVANT le conflit** : deux moteurs qui lisent le **même** code ne se
contredisent pas, **ils se confirment** (`confirme: 2`).

⭐⭐ **Et il est sur le chemin VIVANT, pas à côté.** `_bcTraiterCode` passe par lui **même avec un
seul moteur**, et n'appelle `_lookupBarcode` qu'avec le code que le propriétaire a retenu.
*Un chemin qui ne serait juste que parce qu'il n'y a qu'un moteur serait juste par accident*
(`BUGS.md` §62).

⚠️ **Le `conflit` est donc inatteignable en production aujourd'hui**, et c'est assumé : **le
garde-fou s'écrit AVANT le second moteur, jamais après** — sinon il arrive après le premier faux
produit enregistré.

---

## 8. Les stratégies comparées (§8)

Sur **138 images** (6 codes × 23 cas), une image compte comme réussie si **les 3 passes** sont
justes.

| stratégie | résultat | verdict |
|---|---|---|
| **A** — ZXing-js seul (aujourd'hui) | 107/138 · **77,5 %** | la référence |
| **B** — Html5-QRCode seul | 95/138 · **68,8 %** | ⛔ **régression** |
| **B′** — zxing-wasm seul | 119/138 · **86,2 %** | ⭐ **+8,7 points, 25× plus rapide** |
| **C** — ZXing-js puis zxing-wasm | 119/138 · 86,2 % | ⛔ **le premier n'apporte rien** au second |
| **D** — ZXing-js puis Quagga2 (cadré) | 120/138 · 87,0 % | même remarque |
| **E** — Html5-QRCode (caméra) + 2ᵉ moteur | ≤ 126/138 | la couche caméra ne change pas le plafond |
| **F** — **zxing-wasm puis Quagga2 (cadré)** | **126/138 · 91,3 %** | ⭐⭐ **le plafond du banc** |

⛔⛔ **UN TROISIÈME MOTEUR N'APPORTE RIEN** : toutes les combinaisons à 3 plafonnent à **126/138**,
exactement comme la meilleure paire. *« Le but n'est pas d'empiler les librairies »* — et la mesure
lui donne raison.

⭐ **Et les 12 images que personne ne lit sont TOUTES des flous** (2 px et 3 px). **Le plafond du
banc n'est pas un plafond d'algorithme, c'est un plafond de mise au point.**

---

## 9. Deux moteurs en permanence ? Non (§9)

Mesuré : faire tourner zxing-wasm **et** Quagga2 sur chaque frame coûterait **1,1 + 17,0 = 18,1 ms**
par image au lieu de 1,1 — soit **16×** le CPU, en continu, sur batterie, pour un gain qui
n'existe **que sur les images que le premier a ratées**.

**La cascade proposée, et elle respecte l'ordre de Michel** :

```
moteur principal (zxing-wasm, en continu)
   └─ échec réel (bouton « Capturer », ou N secondes sans lecture)
        └─ second moteur LOCAL (Quagga2 cadré) sur la frame capturée
             └─ toujours rien → BOUTON de repli IA (jamais automatique)
```

⛔ Le second moteur ne tourne **que sur la frame capturée**, jamais en continu.
⛔ Le repli IA reste **un bouton** — décision ft-v1210, inchangée : *un appel payant doit nécessiter
un geste*.

---

## 10. Direct légèrement flou contre capture haute définition (§10)

**La mesure la plus utile du dossier pour l'iPhone.** Même code, résolution croissante (largeur d'un
module en pixels), avec et sans le flou du direct. Le seuil est la première largeur où **6/6** passe.

| | net (capture après mise au point) | direct légèrement flou (0,8 px) | direct flou (1,5 px) |
|---|---|---|---|
| ZXing-js | module ≥ **1** | module ≥ **3** | module ≥ **6** |
| Html5-QRCode | module ≥ **1** | module ≥ **3** | module ≥ **6** |
| zxing-wasm | module ≥ **1** | module ≥ **3** | module ≥ **6** |
| Quagga2 (cadré) | module ≥ **1** | module ≥ **2** | module ≥ **3** |

⭐⭐ ***Le flou coûte 3 à 6 fois la résolution.*** Une image **nette** se lit à **1 pixel par
module** — c'est-à-dire que la résolution n'est presque jamais le problème.

👉 **Conséquence directe pour l'iPhone** : **une capture haute définition APRÈS la mise au point bat
le décodage continu d'un flux légèrement flou**, et **monter la résolution sans régler la mise au
point est la façon chère d'acheter ce que la mise au point donne gratuitement**.

⚠️ **Limite dite** : ce conteneur n'a ni caméra ni Safari. Le comportement réel de l'autofocus
iPhone (`focusMode:'continuous'`, temps de convergence) **n'est pas mesuré ici**.

---

## 11. Les prétraitements (§11) — presque tous rejetés par la mesure

> *« Si le gain est faible, rejette-le. »*

Chaque prétraitement mesuré **séparément**, sur les 138 images, moteur par moteur. Base : le taux
sans aucun traitement.

| prétraitement | ZXing-js | zxing-wasm | Quagga2 (cadré) | Html5-QRCode | coût |
|---|---|---|---|---|---|
| aucun | 107 | 119 | 120 | 95 | — |
| gris | = | = | = | = | 2,1 ms |
| **niveaux (étirement)** | = | = | = | **+18** | 4,5 ms |
| netteté légère | +6 | **−12** | **−26** | = | 7,2 ms |
| **binarisation d'Otsu** | = | = | **−12** | **+18** | 4,1 ms |
| **agrandissement ×2** | +1 | **+5** | = | +1 | 1,4 ms |
| **recadrage centre 70 %** | **−107** | **−119** | **−120** | **−95** | 0,3 ms |
| redressement simple | = | = | = | = | 1,0 ms |

**Ce qu'on en retient :**
- ⛔ **Aucun prétraitement n'aide les deux meilleurs moteurs**, sauf l'**agrandissement ×2** pour
  zxing-wasm : **+5** (119 → 124) pour **1,4 ms**. C'est le seul qui mérite sa place.
- ⛔ **La netteté est une PERTE nette** pour les deux meilleurs (−12 et −26) : elle accentue le
  bruit autant que les barres.
- ⛔⛔ **Le recadrage central détruit tout** (−100 %) : il **mange la zone de silence**, sans
  laquelle aucun décodeur ne peut délimiter le code. *C'est le prétraitement qui semble le plus
  évident, et c'est le pire.*
- ⭐⭐ **Niveaux et Otsu ne « réparent » que Html5-QRCode** (+18 chacun) — parce qu'ils compensent
  son `TRY_HARDER:false`. Et **même compensé, il reste sous zxing-wasm brut**.

👉 ***On ne sur-traite pas : un seul traitement est retenu, et seulement pour un moteur.***

---

## 12. Les codes réels utilisés (§12)

Six EAN-13, **clé de contrôle recalculée et vérifiée**, couvrant **4 premiers chiffres distincts**
— donc 4 motifs de parité différents, donc des **dessins réellement différents** :

| code | premier chiffre | produit |
|---|---|---|
| `3083681011791` | 3 | Harrys American Sandwich *(donné par Michel)* |
| `3021690201123` | 3 | Lentilles Raynal & Roquelaure *(donné par Michel)* |
| `3017620422003` | 3 | Nutella 400 g |
| `5449000000996` | **5** | Coca-Cola 33 cl |
| `8000500310427` | **8** | Kinder |
| `7622210449283` | **7** | Milka |

⚠️ **Honnêteté** : la **clé de contrôle** de chacun est vérifiée, ce qui prouve qu'ils sont des
EAN-13 bien formés. Je **ne peux pas vérifier depuis ce conteneur** que chacun correspond bien au
produit nommé — Open Food Facts y est injoignable (`403`). *Pour le banc, seule la forme compte.*

---

## 13. Quels formats sont réellement nécessaires ? (§13)

> *« Je veux une recommandation mesurée. »*

**Voici la mesure, et elle est nette** :

| liste de formats acceptés | désaccords entre moteurs | EAN faux |
|---|---|---|
| **EAN-13 + EAN-8 + UPC-A + UPC-E** (aujourd'hui) | **12** | **12** |
| **EAN-13 + UPC-A seulement** | **0** | **0** |

👉 ***Les 12 désaccords et les 12 codes faux viennent TOUS de l'acceptation de l'EAN-8***, lu comme
un sous-morceau d'un EAN-13.

⚠️ **Mais je ne recommande pas de retirer l'EAN-8, et voici pourquoi.** Les 12 cas viennent
**exclusivement de Quagga2 en mode « scène »** — le mode que je ne propose pas d'utiliser. Mesuré :
**toute combinaison sans ce mode donne 0 désaccord et 0 code faux, EAN-8 accepté compris.**
Et l'EAN-8 est un **vrai format**, employé sur les petits emballages alimentaires : le retirer
rendrait ces produits inscannables.

**Recommandation mesurée, en deux temps :**
1. **Garder EAN-13 · EAN-8 · UPC-A · UPC-E** — chaque format en trop rallonge chaque frame ratée,
   mais ces quatre-là couvrent le rayon alimentaire et **aucun n'a produit de faux** hors mode scène.
2. ⛔ **Si un jour Quagga2 tourne en mode « scène »**, alors **l'EAN-8 doit exiger une confirmation
   par un second moteur** — la fusion sait déjà le faire (`confirme`).

---

## 14. L'architecture proposée — et elle est justifiée par l'écart (§14)

> *« 92 % contre 97 % justifie une cascade ; 92 % contre 92 % ne la justifie pas. »*

| | taux |
|---|---|
| aujourd'hui (ZXing-js seul) | 77,5 % |
| **zxing-wasm seul** | **86,2 %** (+8,7) |
| zxing-wasm + agrandissement ×2 | 89,9 % (+12,4) |
| **zxing-wasm + Quagga2 (cadré)** | **91,3 %** (+13,8) |
| un 3ᵉ moteur | **91,3 %** (**+0,0**) |

👉 **La cascade à 2 est justifiée** (+5,1 points sur le moteur principal, +13,8 sur l'existant).
👉 ⛔ **La cascade à 3 ne l'est pas** : gain **strictement nul**.

---

## 15. ⛔⛔ Aucune réactivation (§15)

Le bouton **« 📷 Scanner le code-barres avec la caméra »**, livré en ft-v1210, a été **retiré
d'`index.html`**. Un commentaire écrit sur place dit **pourquoi** (R30), et **deux témoins** figent
l'état dans les **deux sens** : ils rougissent si le bouton revient **et** si le moteur disparaît.

⭐ **Le moteur reste en place et reste éprouvé** — c'est la **porte** qui est fermée, pas le moteur.

---

## 16. Ce qui n'a pas été touché (§16)

⛔ `_lookupBarcode` · `_offFetchProduct` · `_ref100` · le résolveur énergie/macros · la **douane** ·
le journal alimentaire · `savedFoods` · les portions · les quantités · les migrations · **Milo** ·
l'import historique · l'**étape 1b** · les programmes · les records.

⭐ **Le banc d'essai vit ENTIÈREMENT hors du dépôt** (scratchpad) : les trois bibliothèques
candidates ne sont **pas** dans `lib/`, et aucune n'est servie à qui que ce soit.
⭐ **Réseau pendant tout le banc** : une seule requête, `/lib/zxing_reader.wasm` — le fichier local
de zxing-wasm. **Zéro appel IA, zéro Open Food Facts, zéro recherche produit.**

---

## 17. Les témoins permanents (§17) — bloc **CCCX**

| # | ce qu'il fige |
|---|---|
| ① | deux moteurs qui se contredisent ⇒ **`conflit`, 0 recherche** |
| ② | le conflit **nomme ses deux candidats**, il n'est pas étouffé |
| ③ | deux moteurs sur le **même** code ⇒ **confirmation**, 1 seule recherche |
| ④ | la **clé de contrôle** est vérifiée ; un code faux est rejeté et ne crée pas de conflit |
| ⑤ | **aucun candidat ⇒ aucune recherche** (jamais d'appel réseau à tout hasard) |
| ⑥ | un seul code valide ⇒ **exactement une** recherche |
| ⑦ | le propriétaire est sur le **chemin vivant** (`_bcTraiterCode` y passe, même seul) |
| ⑧ | la clé **n'est pas réécrite** : `_eanValide` reste le seul propriétaire (**R2**) |
| ⑨ | le propriétaire **ne sait rien de la nutrition** |
| ⑩ | **la porte reste fermée**, et le moteur reste présent |

Et les blocs **CCCVIII** (19 témoins) et **CCCIX** (12) tiennent toujours : scanner conduit devant
une **caméra factice**, `fetch` classé par domaine, **0 appel IA**, quota inchangé, même
`_lookupBarcode` que le code tapé.

⛔ **CONTRÔLE NÉGATIF : 12 mutations, 12 mordent**, contrôle sain à 0 rouge avant **et** après, sur
un arbre **copié**.

---

## 18. Le désaccord entre moteurs (§18)

Traité en §7. **Mesuré** : 12 désaccords réels observés au banc, **tous** produisant un EAN-8 de clé
valide. ⛔ Aucun n'est « le premier gagne » : l'état est `conflit`, **aucune** recherche ne part, et
l'écran redemande une capture.

---

## 19. Le protocole iPhone (§19) — à exécuter par Michel, APRÈS sa décision

**Comparer les deux meilleures stratégies** : **B′** (zxing-wasm seul) et **F** (zxing-wasm puis
Quagga2 cadré sur capture).

**6 produits** : ① code **plat** sur carton mat · ② boîte **cylindrique** (conserve) · ③ emballage
**brillant** (paquet de chips) · ④ code **légèrement abîmé** (froissé, rayé) · ⑤ **petit** code
(sachet, barre) · ⑥ code **courbé** sur bouteille.

**6 gestes** par produit : ① de **près** (10 cm) · ② **distance normale** (25 cm) · ③ **léger
angle** (~20°) · ④ **léger mouvement** (sans s'arrêter) · ⑤ **lumière moyenne** (intérieur le soir)
· ⑥ pendant que **l'autofocus cherche encore** (déclencher tout de suite).

**Ce qu'on note** (une ligne par essai, rien de plus) : *lu du premier coup / lu après quelques
secondes / pas lu*, et le **temps ressenti**. ⭐ **Et une chose qui compte autant** : le numéro
affiché est-il **le bon** ? — c'est la seule façon d'attraper sur un vrai téléphone le défaut
mesuré au banc.

---

## 20. VERDICT

> ### ⭐⭐ **C — ZXING + FALLBACK LOCAL SECONDAIRE**
> avec une précision qui change tout : **le ZXing à garder n'est pas celui d'aujourd'hui.**

**Ce que la mesure dit, et rien de plus :**

1. ⛔ **Pas A (garder ZXing-js seul)** : zxing-wasm fait **+8,7 points** en étant **25× plus
   rapide**, et il lit le **portrait 90°** que l'actuel ne lit pas du tout.
2. ⛔ **Pas B (remplacer par Html5-QRCode)** : c'est **le même moteur avec `TRY_HARDER` forcé à
   `false`** — **−8,7 points**. Sa valeur est sa couche caméra, **que nous avons déjà**.
3. ⛔ **Pas D (Html5-QRCode comme couche caméra)** : il remplacerait du code éprouvé par du code
   équivalent, en dégradant le décodage.
4. ⛔ **Pas E (pas de gain suffisant)** : +13,8 points entre l'existant et la meilleure cascade,
   ce n'est pas du bruit.
5. ✅ **C** : **zxing-wasm en moteur principal** (en continu), **Quagga2 en mode cadré** en second,
   **uniquement sur la frame capturée**, puis **le bouton de repli IA**.

**Ce que ça coûte, dit franchement** : **+306 Ko** transférés à l'ouverture du scanner
(931 Ko de `.wasm` en remplacement des 328 Ko de `zxing.min.js`), plus **153 Ko** si Quagga2 entre
aussi. Rien au démarrage de l'app (règle d'or #4 intacte).

**Ce que ça ne règle pas** : ⛔ **le flou**. Les 12 images que personne ne lit sont **toutes** des
flous, et aucun moteur, aucun prétraitement, aucune cascade n'en lit une seule. *Le moteur n'est
pas le facteur limitant — la mise au point l'est.*

⚠️ **Et ce que je ne peux pas mesurer d'ici** : WebAssembly sur Safari/iOS, l'autofocus réel, le
passage en arrière-plan, le comportement thermique. **C'est pour ça que le protocole §19 existe.**

---

# AUCUNE REACTIVATION UTILISATEUR AVANT TEST IPHONE
