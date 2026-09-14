# 📷 Le scanner caméra local — audit avant réactivation

> **Chantier ouvert par Michel le 14/09/2026**, après le dossier réseau du code-barres.
> Objectif écrit par lui : *« lire un code-barres sans appel IA, puis utiliser exactement le même
> lookup Open Food Facts que le code tapé »*.
>
> ⛔ **Sa borne décide de tout** : *« je ne veux PAS réactiver aveuglément un ancien bouton jugé peu
> fiable. Je veux comprendre exactement pourquoi il avait été retiré et mesurer si ce problème existe
> encore »* · *« ne remets PAS immédiatement le bouton en production »*.
>
> ⚠️ **Ce document ne réactive rien.** Il mesure, il propose, il rend un verdict. Le bouton reste
> muré tant que Michel n'a pas tranché.

---

## 1. Pourquoi le scanner avait été retiré

### La chronologie exacte, lue dans git — et elle tient dans un après-midi

| heure (11/07/2026) | version | ce qui s'est passé |
|---|---|---|
| 10:20 | — | note de chantier : *« ajouter scanner code-barres en direct — **photo unique trop fragile**, vérifié en test »* |
| **14:33** | **ft-v376** | **le scanner caméra live est créé** (ZXing `decodeFromConstraints`, objectif arrière, EAN/UPC, TRY_HARDER, lecture continue) |
| 15:29 | ft-v377 | ⛔⛔ **la recherche produit était CASSÉE** : *« tolérant sur `status` (v2 renvoie `success` pas 1 → **tout était rejeté introuvable**) »* |
| 15:40 | ft-v378 | correctif *« **caméra ouverte mais ne lit pas** »* → 1080p, bouton « Capturer », `focusMode` continu, guidage 15-20 cm |
| 16:57 | ft-v384 | saisie manuelle ajoutée — *« **repli quand le scan galère** »* |
| **17:10** | — | **retrait**, commit `193ea92f` : *« Retrait du scanner camera (**trop capricieux iPhone**) »* |

### ⭐⭐ Trois faits que cette chronologie donne, et qu'aucun résumé ne donnait

**① Le scanner live a vécu 2 h 37.** Créé à 14:33, retiré à 17:10 le même jour.

**② Pendant ~1 h de ces 2 h 37, la recherche produit rejetait TOUS les produits.** Le correctif
ft-v377 est explicite : *« v2 renvoie `success` pas 1 → tout était rejeté introuvable »*. 👉 Un
code-barres **parfaitement décodé** affichait donc *« produit introuvable »*. **C'est exactement
ce à quoi ressemble un scanner qui ne marche pas** — et la faute était dans le lookup, pas dans
le décodeur.

**③ Le retrait n'a tenté aucune correction.** Le commit touche **`index.html` uniquement, 6 lignes
remplacées** : on a enlevé le bouton, pas réparé la caméra. Son message le dit lui-même —
*« Fonctions scan conservées (inertes) »*.

### ⚠️ Ce que la chronologie ne permet PAS de conclure

Elle **ne blanchit pas** le scanner. Le correctif ft-v378 nomme un vrai symptôme iPhone
(*« caméra ouverte mais ne lit pas »*), et **1 h 17 plus tard** le message de ft-v384 parle encore
d'un *« scan qui galère »*. 👉 **Un problème iPhone réel persistait après le correctif.**

*La cause du retrait n'est donc pas « le décodeur est mauvais » ni « c'était un malentendu » :
c'est un jugement porté en moins de trois heures, sur une fenêtre qui contenait une panne de
lookup, sans deuxième tentative.*

### Le classement demandé (A → H), avec ce qui est mesurable aujourd'hui

| cause | verdict | sur quoi |
|---|---|---|
| **A — décodage ZXing** | ⛔ **écartée** | mesuré : **17 cas sur 20** décodés 3/3 (§3) |
| **B — accès caméra iPhone/Safari** | ⚠️ **possible, non mesurable d'ici** | ce conteneur n'a pas de Safari |
| **C — UX** | ⚠️ **partielle** | 3 boutons empilés dans l'écran, dont un mort (§4) |
| **D — permission** | ⛔ **non concerné** | le code gère le refus (message + repli), mesuré |
| **E — focus / autofocus** | ⭐⭐ **la plus probable** | mesuré : **un flou de 2 px suffit à tout casser** (§3) |
| **F — cadence / performance** | ⚠️ **à mesurer sur iPhone** | un échec de décodage coûte **138 ms** |
| **G — mauvais branchement** | ✅ **CONFIRMÉE, et déjà réparée** | ft-v377, la panne de lookup ci-dessus |
| **H — autre** | ✅ **une course, trouvée le 14/09** | deux lookups pour un scan (§4) |

---

## 2. L'état du code aujourd'hui

### Ce qui existe et fonctionne

| fonction | rôle | état |
|---|---|---|
| `_loadZXing()` | charge `./lib/zxing.min.js` **depuis le dépôt** | ✅ aucun CDN, aucun réseau |
| `_bcHints()` | TRY_HARDER + EAN-13/EAN-8/UPC-A/UPC-E | ✅ mesuré utile (§3) |
| `openBarcodeScanner()` | caméra live + décodage continu + bouton « Capturer » | ✅ conduit et mesuré |
| `_bcCaptureFrame()` | capture manuelle d'une image du flux | ✅ **marche du premier coup** |
| `closeBarcodeScanner()` | `reset()` + `stopStreams()` | ✅ la caméra est bien coupée |
| `onBarcodeFile()` | décodage **local** d'une photo (`photo-code`) | ⚠️ **orphelin** |

### ⭐ Deux correctifs ont été posés PENDANT que le scanner était orphelin

- **ft-v1091** — `ov-bc-scan` déclaré dans `_OVERLAY_CLOSERS` : fermer en glissant coupe la caméra ;
- **ft-v1092** — le **bouton retour** passe par la vraie fermeture (avant : *« la caméra reste allumée »*).

👉 *Le code orphelin d'aujourd'hui est meilleur que celui qui a été retiré en juillet.*

### ⛔ Les quatre défauts trouvés dans le code orphelin

**① La course — jusqu'à DEUX lookups pour un seul scan.** Mesurée devant une caméra factice : le
callback **continu** de ZXing et le bouton **« Capturer »** ont lu le même code à **28 ms
d'intervalle** et tiré **chacun** son `_lookupBarcode`. Cause structurelle : `_bcCaptureFrame` ne
pose `_bcScanning=false` qu'**après** son `await` de décodage (~500 ms), pendant lesquelles le
continu reste armé.

> ⚠️⚠️ **Et elle est INTERMITTENTE — ce qui a d'abord produit un mauvais témoin, le mien.**
> Selon qui gagne, on observe **1 ou 2** lookups. Ma première version du témoin comptait
> « exactement 2 » : elle est passée au rouge dès que la machine était moins chargée et que le
> décodage continu gagnait. 👉 ***Un témoin qui dépend du vainqueur d'une course ne mesure pas la
> course, il mesure la charge de la machine.*** La course, elle, est **déterministe dans le code** :
> c'est un **témoin de source** qui la fige, pas un comptage.

⛔ **Non corrigé** (voir §7). ⭐ Et sur un téléphone la course est **plus** probable, pas moins : le
décodage continu y est rapide, donc il a toutes les chances de tirer pendant les ~500 ms de la
capture.

**② Le bouton de repli photo est mort.** `scanBarcodePhoto()` cherche l'élément `af-bc-input`,
**retiré avec ft-v388**. Le bouton *« 🖼️ Prendre une photo à la place »* ferme l'écran et ne fait
rien — **0 appel mesuré**.

**③ Le décodage LOCAL d'une photo est orphelin.** `onBarcodeFile` (provenance `photo-code`) est le
**seul chemin photo sans IA**, et rien ne l'appelle. Aujourd'hui, photographier un code-barres
passe forcément par l'IA.

**④ La provenance n'est pas dite explicitement.** Les deux appels du scanner écrivent
`_lookupBarcode(code)` **sans** argument de provenance ; la valeur par défaut `'scan'` rattrape.
Le résultat est juste, la ligne d'appel ne le dit pas.

---

## 3. La fiabilité du décodeur, mesurée

**Protocole** : trois vrais codes-barres (`3083681011791` Cassegrain · `3021690201123` Raynal ·
`3017620422003` Nutella), encodés en EAN-13 selon la norme, rendus puis dégradés, décodés par
**le ZXing réellement servi**.

| cas | avec les réglages de l'app | sans réglages |
|---|---|---|
| net, bien éclairé | **3/3** | 3/3 |
| code plus petit / éloigné (module 1 px) | **3/3** | 3/3 |
| code vu de près (module 8 px) | **3/3** | 3/3 |
| incliné 5° · 10° · 20° | **3/3** | 3/3 |
| **incliné 45°** | ⛔ **0/3** | 0/3 |
| incliné 90° (paysage) | **3/3** | ⛔ **0/3** |
| **flou 1 px** | **3/3** | 3/3 |
| **flou 2 px** | ⛔ **0/3** | 0/3 |
| **flou 3 px** | ⛔ **0/3** | 0/3 |
| faible lumière (45 %) · très faible (25 %) | **3/3** | 3/3 |
| contraste écrasé (35 %) | **3/3** | 3/3 |
| reflet métal (voile 75 %) | **3/3** | 3/3 |
| reflet très fort (voile 90 %) | ⛔ **0/3** | 0/3 |
| cumul réaliste (10° + flou 1 px + lumière 60 %) | **3/3** | 3/3 |

**17 cas sur 20 passent à 3/3.** Trois échouent : **l'inclinaison à 45°**, **le flou dès 2 px**, et
**un reflet quasi opaque**.

### ⭐⭐ Le flou est le seul vrai ennemi — et ça désigne la cause du retrait

La lumière ne gêne pas (25 % de luminosité : 3/3). Le contraste non plus. L'inclinaison jusqu'à 20°
non plus. **Le flou, si — et brutalement : 1 px passe, 2 px ne passe plus.**

👉 ***Sur un téléphone, « flou » s'appelle « mise au point ».*** C'est exactement le symptôme de
ft-v378 (*« caméra ouverte mais ne lit pas »*) : la caméra marche, l'image arrive, elle est
simplement trop molle pour être décodée. **La cause E est la plus probable, et elle est mesurée.**

### ⭐ Les réglages de l'app servent vraiment

Un code vu **en paysage** est lu **3/3 avec** `_bcHints()` et **0/3 sans**. *TRY_HARDER n'est pas
décoratif.*

### ⚠️ Une erreur de mesure, dite plutôt que cachée

Ma première passe concluait *« code vu de près : 0/3 »*. **C'était ma fixture, pas ZXing** : je
laissais une marge blanche de **20 pixels**, alors que la norme EAN-13 exige une zone de silence de
**9 à 11 MODULES**. À 8 px par module, 20 px ne valent que 2,5 modules. Corrigé : **3/3**.
*Un paramètre exprimé dans la mauvaise unité ne mesure pas le code, il mesure le test* (`BUGS.md` §63).

### Performance du décodage

| | mesuré |
|---|---|
| décodage **réussi** d'une image | **2 ms** |
| décodage **échoué** (flou) | **138 ms** |
| capture manuelle complète (« Capturer » → produit) | **~480 ms** |

⚠️ **La cadence de la lecture continue n'est PAS mesurable ici** : ce conteneur rend la vidéo en
logiciel, et le décodage continu y a mis ~33 s. **Ce chiffre ne dit rien d'un téléphone** — il est
donné pour qu'on ne le confonde pas avec une mesure.

---

## 4. Le chemin réseau visé, et ce qui est déjà vrai

```
caméra locale → ZXing local → numéro EAN → _lookupBarcode → _offFetchProduct
              → Open Food Facts → _ref100 → résolveur → écran
```

**Mesuré devant une caméra factice filmant un vrai EAN-13, `fetch` intercepté et classé par domaine :**

| | scanner caméra | code tapé | photo IA |
|---|---|---|---|
| appels **IA** | ⭐ **0** | 0 | 1 |
| quota `foodAiUses` | ⭐ **inchangé** | inchangé | **+1** |
| lookups Open Food Facts | ⚠️ **1 ou 2** *(la course, §2)* | 1 | 1 |
| provenance | `scan` | `code-tape` | `photo-code-ia` |
| résultat produit | **identique** | identique | identique |

⭐⭐ **Le point le plus important est acquis : le scanner ne crée aucun chemin nutrition nouveau.**
Il appelle `_lookupBarcode` avec un numéro, exactement comme la saisie manuelle. `_offFetchProduct`,
`_ref100`, le résolveur, la douane et le journal ne voient **aucune** différence.

⛔ **Le seul écart est la course** : deux lookups au lieu d'un. Il est dans le scanner, pas dans le
lookup.

### Sur un code illisible (flou), mesuré aussi

**0 lookup · 0 appel IA · aucune valeur inventée** — un message qui dit quoi faire (*« recule un
peu, attends la mise au point… »*), et **la caméra reste ouverte pour réessayer**. ⭐ *Le repli
n'est PAS un appel IA automatique*, ce qui est exactement ce que Michel demande au §7 de sa
consigne.

---

## 5. La provenance

L'app distingue **déjà quatre** chemins, et le contrat est écrit dans `app.js` depuis le 23/08 :

| provenance | ce que c'est | clé de contrôle vérifiée ? |
|---|---|---|
| `scan` | caméra live, décodé par ZXing | ✅ **oui** |
| `photo-code` | photo décodée **localement** par ZXing | ✅ **oui** |
| `photo-code-ia` | chiffres **lus par un modèle** | ⛔ non |
| `code-tape` | chiffres tapés par un humain | ⛔ non |

⚠️ **Michel demande `camera-code-local`.** La distinction qu'il veut **existe déjà** — sous le nom
`scan`. Renommer coûterait : ① des lignes de journal déjà enregistrées qui porteraient un nom
disparu (et **l'historique est hors périmètre**, §12 de sa consigne) ; ② un cinquième nom pour une
chose qui en a un.

👉 **Recommandation : garder `scan`**, et rendre l'appel **explicite** (`_lookupBarcode(code, 'scan')`)
au lieu de compter sur la valeur par défaut. **Décision de Michel.**

---

## 6. L'UX proposée

### Option A — local d'abord, IA en secours *(recommandée)*

```
🔢 Code-barres du produit — tape les chiffres écrits sous le code   [_______]  [OK]

📷 Ou scanner le code-barres avec la caméra          ← NOUVEAU, gratuit et instantané
📸 Ou lire l'étiquette nutritionnelle (IA)
```

…et **dans l'écran du scanner**, quand la lecture échoue plusieurs fois :

```
Pas lu — recule un peu, attends la mise au point, remplis le cadre rouge.
        [ 📸 Faire lire le code par l'IA ]     ← apparaît APRÈS l'échec
```

**Pourquoi celle-ci :**
- le **repli est contextuel** : il apparaît là où la personne est bloquée, pas dans une liste de
  boutons qu'elle doit trier à l'avance ;
- l'écran d'ajout ne gagne **qu'un seul** bouton ;
- ⭐ **aucun appel IA ne part sans un geste explicite** — le repli est un bouton, jamais un
  basculement automatique.

### Option B — les deux boutons côte à côte

```
📷 Scanner avec la caméra        📸 Photo lue par l'IA
```

**Pourquoi je ne la recommande pas** : elle demande à la personne de choisir **avant** de savoir si
le scan va marcher. Or le seul moment où l'on sait qu'il faut l'IA, c'est **après** un échec.
*Un choix posé trop tôt est un choix posé à l'aveugle.*

### ⛔ Ce qu'il ne faut pas faire — le basculement automatique

Enchaîner sur l'IA après N échecs serait **un appel payant déclenché sans geste**. Deux raisons :
① le quota de 25 essais gratuits se viderait **sans que la personne l'ait demandé** ;
② un code flou **restera flou** — l'IA lit aussi mal une image molle, on paierait un appel pour
échouer deux fois. **Le repli doit rester un bouton.**

---

## 7. Ce qui reste à décider — et ce qui devra être corrigé avant réactivation

| # | à faire | pourquoi |
|---|---|---|
| ① | **la course des deux lookups** | mesurée, structurelle — deux requêtes pour un scan |
| ② | **le bouton de repli mort** | `af-bc-input` n'existe plus |
| ③ | **la provenance explicite** | ne plus dépendre de la valeur par défaut |
| ④ | **le repli IA contextuel** | il n'existe pas encore dans l'écran du scanner |

⛔ **Aucun des quatre n'est corrigé dans cette livraison.** La consigne de Michel est explicite —
*« ne remets PAS immédiatement le bouton en production »* — et la règle du projet depuis ft-v1200
dit qu'un défaut trouvé pendant un audit **se mesure, s'écrit, et attend un feu vert séparé**.

---

## 8. Le protocole iPhone — à exécuter par Michel

⚠️ **Rien de ce qui suit n'est validé par moi.** Ce conteneur n'a ni caméra ni Safari : la
fiabilité mobile **n'est pas mesurée**, et je ne la présenterai pas comme telle.

**Prérequis** : le bouton du scanner doit d'abord être rebranché (décision de Michel).

Pour **chaque** produit, noter : le numéro lu · le nom du produit affiché · le temps approximatif ·
le nombre d'essais · l'éventuel recours à l'IA.

| # | produit | ce qu'on cherche |
|---|---|---|
| 1 | **Cassegrain `3083681011791`** | le cas nominal, code net sur carton mat |
| 2 | **Raynal `3021690201123`** | le produit du chantier précédent — la fiche a une valeur énergétique fausse, l'écran doit afficher l'avertissement 🔬 |
| 3 | **un produit banal** (pâtes, riz, yaourt) | un code quelconque, jamais scanné |
| 4 | **une boîte métallique / un emballage brillant** | le reflet (mesuré : tient jusqu'à 75 % de voile) |
| 5 | **un code légèrement abîmé** (plié, frotté) | là où le repli IA doit devenir utile |

**Et les cinq gestes qui décident du verdict :**

1. **Le scan est-il plus rapide que taper 13 chiffres ?** C'est le seul vrai critère d'adoption.
2. **La mise au point se fait-elle toute seule** à ~15-20 cm ? (le flou est l'ennemi mesuré)
3. **Le bouton « Capturer » sauve-t-il les cas où la lecture continue n'aboutit pas ?**
4. **La caméra s'éteint-elle** en fermant l'écran — glisser, bouton retour, « Annuler » ?
   (le voyant vert de l'iPhone doit s'éteindre)
5. **Deux scans d'affilée** : le second marche-t-il aussi bien que le premier ?

---

## 9. Le verdict

### ⭐ **RÉACTIVER AVEC FALLBACK IA** — sous quatre conditions, et après validation iPhone.

**Ce qui plaide pour :**
- le décodeur passe **17 cas sur 20**, dont la faible lumière, le contraste écrasé et le reflet ;
- il fait **zéro appel IA** et ne touche **aucun quota** — mesuré, pas supposé ;
- il passe par **exactement le même lookup** que le code tapé : aucun chemin nutrition nouveau ;
- **une des deux causes du retrait est confirmée ET déjà réparée** (la panne de lookup, ft-v377) ;
- deux correctifs de cycle de vie sont arrivés depuis (ft-v1091/1092) ;
- ⭐ **le bouton « Capturer » marche du premier coup** — il donne à la personne le moyen de décider
  elle-même quand l'image est nette, ce qui contourne le problème de mise au point.

**Ce qui empêche de réactiver tout de suite :**
- ⛔ la **course des deux lookups** doit être corrigée ;
- ⛔ le **bouton de repli mort** doit être réparé ou retiré ;
- ⛔ le **repli IA contextuel** doit être écrit ;
- ⛔⛔ et surtout : **la cause B (Safari/iPhone) n'est pas mesurable d'ici**. *Le vrai critère reste
  l'iPhone, et il n'est pas encore passé.*

### ⛔ Pourquoi pas « NE PAS RÉACTIVER »

Parce que la mesure ne soutient pas le jugement de juillet. **Le décodeur n'est pas mauvais** — et
la fenêtre sur laquelle il a été jugé durait 2 h 37 et contenait une panne de lookup qui faisait
échouer **tous** les produits, même parfaitement décodés.

### ⛔ Pourquoi pas « RÉACTIVER » tout court

Parce que le flou casse tout dès 2 px, et que **le flou sur un téléphone s'appelle la mise au
point**. Tant qu'un iPhone n'a pas confirmé que l'autofocus suit, le repli IA n'est pas un luxe :
c'est ce qui empêche la personne de rester coincée.

*Le scanner local doit être le chemin par défaut parce qu'il est gratuit et instantané.
L'IA doit rester derrière, accessible en un geste, quand le code ne passe vraiment pas.*

---

*Mesures figées par le bloc **CCCVIII** de `tests/parcours/runner.js` — conduit devant une caméra
factice qui filme un vrai EAN-13. Chemin réseau du code-barres : `docs/CHEMIN-RESEAU-CODEBARRES.pdf`.*
