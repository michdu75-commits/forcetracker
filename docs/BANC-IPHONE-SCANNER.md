# 📱 Le banc iPhone du scanner — protocole et garanties

> **14/09/2026 · ft-v1214.** Éprouver sur un **vrai iPhone** l'architecture désignée par le banc
> synthétique, ⛔ **sans rouvrir le bouton scanner pour les utilisateurs**.
>
> # AUCUNE REACTIVATION UTILISATEUR AVANT RESULTATS IPHONE

---

## 1. État du scanner servi au départ

Le bloc scanner fait **11 fonctions, 7 193 caractères de code** (commentaires retirés) :

`_loadZXing` · `scanBarcode` · `_bcSetEtat` · `_bcPrendreLaMain` · `_bcFusionnerCandidats` ·
`_bcTraiterCode` · `_bcHints` · `openBarcodeScanner` · `_bcCaptureFrame` · `_bcReplIA` ·
`closeBarcodeScanner`

| vérifié | résultat |
|---|---|
| `_eanValide` · `_bcFusionnerCandidats` · `_bcTraiterCode` · `_lookupBarcode` | déclarés **une seule fois chacun** |
| appelants de `_lookupBarcode` | exactement **3** : `camera-code-local` · `code-tape` · `photo-code-ia` |
| le garde conflit est-il sur le chemin vivant ? | **oui** — `_bcTraiterCode` appelle la fusion, et les **deux** lecteurs passent par lui |
| un lecteur appelle-t-il le lookup en direct ? | **non** |

**⛔ Un trou réel trouvé à l'audit, et c'est le sujet du test :**
`openBarcodeScanner` demandait `advanced:[{focusMode:'continuous'}]` — or une contrainte
`advanced` est **ignorée en silence** si elle n'est pas supportée. Mesuré : **ni
`getCapabilities()` ni `getSettings()` n'existaient nulle part dans `app.js`.**
👉 ***On demandait l'autofocus continu sans jamais savoir s'il était appliqué.***

---

## 2. Mécanisme d'accès — **Profil → Admin**, rien d'autre

`_isAdminUnlocked()` garde déjà **16 outils** de diagnostic ; l'onglet s'ouvre par **5 taps sur
le logo**. ⛔ Aucun drapeau, aucune route de test, aucun mécanisme nouveau (**R13**).

⭐⭐ **Et le garde vit DANS la fonction, pas sur le bouton** :

```js
function ouvrirBancScanner(moteur, avecQuagga){
  if(typeof _isAdminUnlocked==='function' && !_isAdminUnlocked()){
    toast('Réservé à l\'admin','error'); return;
  }
  …
}
```

*Une porte gardée par son bouton n'est pas gardée* — on peut appeler la fonction depuis la
console. La mutation qui retire ce garde fait rougir un témoin.

**Trois boutons**, c'est tout :

| | |
|---|---|
| **Ⓐ** | zxing-wasm seul |
| **Ⓑ** | zxing-wasm + Quagga2 cadré sur capture |
| **Ⓣ** | témoin — ZXing-js actuel |

---

## 3. Preuve que le scanner normal reste fermé

- `index.html` ne contient **aucun** `onclick="scanBarcode()"` ni `onclick="openBarcodeScanner("`.
- Le retrait est **écrit sur place avec sa raison** (**R30**).
- Le témoin `CCCXI ①` rougit **dans les deux sens** : si un bouton revient, **et** si le moteur
  disparaît (*c'est la porte qui est fermée, pas le moteur*).
- La mutation « le bouton utilisateur revient » fait rougir exactement ce témoin.

---

## 4. Moteurs intégrés

| moteur | rôle | brut | gzip |
|---|---|---|---|
| **zxing-wasm** (`lib/zxing-wasm.js` + `lib/zxing_reader.wasm`) | principal | 36 + 931 Ko | 12 + **402 Ko** |
| **Quagga2** (`lib/quagga.min.js`) | repli local, **mode cadre uniquement** | 152 Ko | 41 Ko |
| *ZXing-js* (`lib/zxing.min.js`, déjà servi) | témoin + pilotage du flux | 328 Ko | 96 Ko |

⛔ **Html5-QRCode n'entre pas** : le banc l'a mesuré comme une **régression** (68,8 % contre
77,5 %) — c'est le même moteur avec `TRY_HARDER` forcé à `false`. Un garde du PDF le bannit.
⛔ **Aucun 3ᵉ moteur** : mesuré, le gain est **+0,0**.

---

## 5. Chargement réel

⛔ **Hors du préchargement du service worker** — et le raisonnement était **déjà écrit** dans
`sw.js` trois lignes plus haut, pour CIQUAL : *« le préchargement tourne à CHAQUE mise à jour du
cache »*. Les y mettre, ce serait **~1,1 Mo re-téléchargé par tout le monde à chaque version**,
pour des moteurs que **personne n'atteint** (aucun bouton utilisateur).

⭐ Mis en cache **à la demande** par la branche « autres assets locaux » → disponibles hors ligne
dès la première ouverture du banc. **Rien au démarrage de l'app** (règle d'or #4).

Un témoin vérifie les deux moitiés : absents de la liste d'installation, **et** chargés
uniquement par `_bcChargerMoteur`. La mutation qui met le `.wasm` dans le préchargement mord.

---

## 6. Chaîne exacte — candidat → fusion → lookup

```
CAMÉRA
  └─ live : ZXing-js pilote le flux ──┐
  └─ capture fixe : moteur actif ─────┤
         └─ échec ? Quagga2 CADRÉ ────┤   (capture seulement, jamais en continu)
                                      ▼
                             candidat brut
                                      ▼
                        _bcFusionnerCandidats
                          ├─ _eanValide()      (seul propriétaire de la clé — R2)
                          └─ déduplication     (AVANT le conflit)
                                      ▼
                    aucun → 0 lookup
                    valide → 1 lookup
                    conflit → ⛔ 0 lookup, les deux candidats nommés
```

⚠️ **Dit plutôt que masqué** : zxing-wasm n'a pas de lecture continue à lui. Le **flux** reste
piloté par ZXing-js (qui sait décoder une vidéo) ; chaque frame est ensuite remise au moteur
actif. **C'est la capture fixe qui éprouve zxing-wasm seul**, et le diagnostic l'affiche.

⛔ **Le banc s'arrête avant la Nutrition** : il rend le code validé sans lancer le chemin produit.
*Le test compare des NUMÉROS, il n'enregistre pas des repas.*

---

## 7. Protection contre le double lookup

La machine à états `IDLE → SCANNING → CODE_TROUVE → LOOKUP → TERMINE` et son **verrou unique**
`_bcPrendreLaMain` sont **inchangés** — c'est le correctif de ft-v1210, mesuré sous course
provoquée (le banc martèle « Capturer » pendant toute la lecture continue : **1 lookup**).

S'y ajoute la fusion :

| situation | résultat |
|---|---|
| live trouve X **et** capture trouve X | **confirmation**, `confirme: 2`, **1 seul** lookup |
| deux EAN valides **différents** | **conflit**, **0** lookup |
| clé de contrôle fausse | **0** lookup |
| aucune lecture | **0** lookup |

⛔ **Jamais « prendre le premier ».**

---

## 8. Ce que l'iPhone affichera

| ligne | |
|---|---|
| **Moteur demandé** | ce que le bouton a demandé |
| **Moteur réellement actif** | ⛔ **en rouge s'il diffère** |
| **Cause du repli** | affichée uniquement s'il y a repli |
| zxing-wasm chargé | OUI / NON |
| Quagga2 chargé | OUI / NON |
| Chargement moteur · Caméra prête | en ms |
| Objectif · Résolution réelle · Cadence | ou **« non observable »** |
| **Autofocus demandé** | `continuous` |
| **Autofocus observé** | ⛔ **« non observable »** si Safari ne le dit pas — *jamais un faux OK* |
| Zoom · Piste | ou « non observable » |
| **Appels IA** | doit rester **0** |
| **Lookups produit** | rouge si > 1 |
| **les 6 dernières lectures** | voie (live/capture) · moteur · ms · **LE NUMÉRO COMPLET** · résultat de fusion |

⭐⭐ **Le numéro complet est affiché en monospace**, jamais remplacé par « produit trouvé ».
C'est **le** premier critère du test — parce que le banc a mesuré qu'un moteur peut rendre un
**EAN faux dont la clé est juste** (`3083681011791 → 11151791`).

---

## 9. Témoins — bloc **CCCXI**, 18 témoins

① bouton utilisateur absent (dans les deux sens) · ② porte gardée **dans la fonction** ·
③ aucun repli moteur silencieux · ④ Quagga2 jamais en mode scène · ⑤ le décodeur ne parle pas au
lookup · ⑥ aucune Nutrition · ⑦ zéro appel IA · ⑧ moteurs non préchargés · ⑨ aucun prétraitement ·
⑩ rien d'inventé sur l'autofocus · ⑪ numéro complet affiché · ⑫ Quagga2 sur la capture seulement ·
⑬ le banc s'arrête avant la Nutrition · ⑭ même code ⇒ 1 lookup · ⑮ conflit ⇒ 0 lookup ·
⑯ clé fausse / rien ⇒ 0 lookup · ⑰ `_eanValide` reste le propriétaire · ⑱ hors périmètre.

⚠️ **La leçon de ft-v1212 est appliquée d'avance** : on épingle la **règle** et le
**propriétaire**, jamais le littéral d'un appel.

---

## 10. Mutations — **16, toutes mordent**

① le bouton revient · ② la porte n'est plus gardée · ③ repli silencieux · ④ Quagga2 en mode scène ·
⑤ le décodeur appelle le lookup · ⑥ le banc touche la Nutrition · ⑦ un appel IA se glisse ·
⑧ le `.wasm` entre dans le préchargement · ⑨ un prétraitement revient · ⑩ faux OK d'autofocus ·
⑪ le numéro est masqué · ⑫ Quagga2 en continu · ⑬ la fusion est contournée · ⑭ le conflit est
avalé · ⑮ la clé n'est plus vérifiée · ⑯ la déduplication saute.

**⚠️⚠️ Deux de mes gardes étaient AVEUGLES, et le contrôle négatif l'a dit :**

- ⑨ cherchait un `0.7` **dans** le `drawImage`, or la mutation le posait sur la **ligne d'avant**.
  👉 *Un garde qui cherche la FORME d'un prétraitement en ratera toujours une.* Remplacé par
  l'invariant juste et plus fort : **le décodeur ne fabrique aucun canvas**.
- ⑪ vérifiait la **présence** de `l.code`, qui survit à `l.code ? 'produit trouvé' : …`.
  👉 *Mentionner une variable n'est pas l'afficher.*

**⚠️ Et ma correction de ⑪ était fausse à son tour** : elle interdisait tout `l.code ?`… qui sert
légitimement à choisir la **couleur** du texte. Elle rougissait sur du code sain.
*Un garde plus strict que la contrainte réelle refuse du travail juste.*

---

## 11. Le protocole, sur ton téléphone

**Avant tout** : Profil → **5 taps sur le logo** → onglet **Admin** → carte **📱 Banc scanner**.

### Étape 0 — ce qu'il faut regarder en premier, avant même de scanner

Ouvre **Ⓐ zxing-wasm seul** et lis le panneau :

- **Moteur réellement actif** = `zxing-wasm` ? Si c'est `ZXing-js` avec une cause, **note-la
  telle quelle** : ça veut dire que WebAssembly ne marche pas sur ton Safari, et c'est un
  résultat majeur du test.
- **Autofocus observé** : `non observable`, ou une vraie valeur ? **Note ce que tu lis.**
- **Résolution réelle** et **cadence**.

### Étape 1 — les 6 produits × 6 gestes

| produits | gestes |
|---|---|
| ① code **plat** sur carton mat | a. très proche ~10 cm |
| ② **conserve** cylindrique | b. distance normale ~25 cm |
| ③ emballage **brillant** | c. léger **angle** (~20°) |
| ④ code légèrement **abîmé** | d. léger **mouvement** |
| ⑤ **petit** code | e. **lumière moyenne** |
| ⑥ code **courbé** sur bouteille | f. **pendant que l'autofocus cherche** encore |

**Trois colonnes à noter, pas une de plus :**

1. *premier coup* / *quelques secondes* / *non lu*
2. *instantané* / *1–2 s* / *long*
3. ⭐⭐ **numéro exact OUI / NON** ← **la colonne qui compte le plus**

### Étape 2 — le scénario central

C'est **le** scénario que le banc synthétique désigne :

```
live → pas lu
  ↓  tu attends que l'image se stabilise / fasse sa mise au point
capture fixe → lu
```

**Note quel moteur l'a récupéré** : le panneau l'affiche (`capture · zxing-wasm` ou
`capture · quagga-cadre`). Fais ce scénario avec **Ⓑ** pour que Quagga2 puisse intervenir.

### Étape 3 — le témoin

Refais 2 ou 3 produits avec **Ⓣ (ZXing-js actuel)**. Sans lui, on ne saura pas si zxing-wasm
apporte vraiment quelque chose **sur ton téléphone** — le banc synthétique dit oui, ton iPhone
n'a pas encore voté.

⛔ **Ce que le banc ne fait PAS** : il n'enregistre aucun repas, ne déclenche aucune recherche
produit, et n'appelle **aucune IA**. Tu peux enchaîner autant d'essais que tu veux.

---

## 12. Ce que je ne peux toujours pas mesurer d'ici

⛔ Safari/iOS · WebAssembly sur iPhone · l'autofocus réel · le passage en arrière-plan · le
comportement thermique. **C'est exactement ce que ce banc existe pour aller chercher.**

---

# AUCUNE REACTIVATION UTILISATEUR AVANT RESULTATS IPHONE
