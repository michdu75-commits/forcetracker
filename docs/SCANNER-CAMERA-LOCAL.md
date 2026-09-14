# 📷 Le scanner caméra local — réactivation contrôlée

> **Chantier ouvert par Michel le 14/09/2026**, en deux temps : d'abord un audit, puis — le même
> jour, après une information qu'il apporte — une **contre-enquête** et une **réactivation
> contrôlée**.
>
> ⭐ Objectif produit, écrit par lui :
> *« caméra iPhone → décodage LOCAL → numéro EAN → chemin de lookup produit ACTUEL → même résultat
> que le code tapé → 0 appel IA »*, et seulement si le local échoue : *« bouton volontaire → photo
> avec IA »*.
>
> **LOCAL D'ABORD · IA EN SECOURS · aucun basculement automatique.**
>
> ⛔ **Verdict de ce document : `PRÊT POUR TEST IPHONE`, et rien de plus fort.**
> *« Ne déclare pas le scanner définitivement réactivé avant mon retour iPhone. »*

---

## 1. La chronologie historique — CORRIGÉE

### ⚠️ Ce que la version précédente de ce document affirmait, et qui était trop fort

> *« Pendant ~1 h de ces 2 h 37, la recherche produit rejetait TOUS les produits. Un code
> parfaitement décodé affichait donc "produit introuvable", ce qui ressemble trait pour trait à un
> scanner qui ne marche pas. »*

Michel a demandé de rouvrir ce point : *« ne considère pas comme acquis que le mauvais
fonctionnement historique venait d'un lookup Open Food Facts cassé »*. **Il avait raison de le
demander, et la vérification change la conclusion.**

### Ce que dit l'historique git réel

| moment (2026) | version | fait mesuré |
|---|---|---|
| **08/07 20:41** | ft-v331 | **Open Food Facts entre dans le projet** — `world.openfoodfacts.org`, avec le scan photo ZXing |
| 11/07 10:20 | — | note de chantier : *« photo unique trop fragile, vérifié en test »* |
| **11/07 14:33** | ft-v376 | le scanner caméra **live** est créé |
| **11/07 15:29** | ft-v377 | **le lookup est RÉPARÉ** — *« v2 renvoie `success` pas 1 → tout était rejeté introuvable »* |
| 11/07 15:40 | ft-v378 | correctif *« caméra ouverte mais ne lit pas »* : 1080p + bouton « Capturer » |
| 11/07 16:46-47 | — | clone régénéré et **déployé pour test iPhone** |
| 11/07 16:57 | ft-v384 | saisie manuelle — *« repli quand le scan galère »* |
| **11/07 17:10** | — | **retrait** : *« trop capricieux iPhone »* |

### ⭐⭐ Les trois faits qui corrigent la conclusion précédente

**① Open Food Facts ÉTAIT là.** L'intégration date du **08/07**, trois jours avant le scanner live.
La fonction de recherche produit au moment du retrait est, à quelques champs près, **celle
d'aujourd'hui** (v2 puis repli v0). ⚠️ *Sur la lettre, la prémisse de Michel est donc inexacte —
mais sur le fond elle vise juste* : **tout ce qui entoure ce lookup est postérieur** — `_ref100`,
le résolveur énergie/macros, la douane, CIQUAL, « Mes aliments », le hub de préparation. En juillet,
`_lookupBarcode(ean)` ne prenait **même pas** d'argument de provenance.

**② Le correctif du lookup est un ANCÊTRE du retrait — vérifié par `git merge-base`.** Et le clone
**réellement testé sur iPhone à 16:47** contenait **ft-v377 ET ft-v378**.

> 👉 **Donc le jugement « trop capricieux iPhone » a été porté sur un lookup RÉPARÉ et sur un
> scanner déjà corrigé.** ⛔ **Le bug de lookup n'explique PAS le retrait du scanner live.**
> *C'est la correction principale apportée à ce dossier.*

**③ En revanche, il explique l'AUTRE jugement — celui qui a tout déclenché.** La note du 11/07 à
10:20, *« photo unique trop fragile, vérifié en test »*, a été écrite pendant les **2 jours et
19 heures** où le lookup rejetait **tous** les produits (08/07 20:41 → 11/07 15:29).

> 👉 **C'est ce jugement-là qui a motivé la construction du scanner live** — et il a été rendu sur
> un chemin dont la recherche produit était cassée. *L'erreur de confusion a bien eu lieu ; elle
> s'est produite un cran plus tôt que je ne l'avais écrit.*

### ⭐⭐ Et la trouvaille de la contre-enquête : la course est née du correctif

`_bcCaptureFrame` — le bouton « Capturer » — est arrivé en **ft-v378, à 15:40**, avec le
désarmement du décodage continu posé **après** son `await`. **Le scanner a été retiré 1 h 30 plus
tard.**

> ⚠️ **Mécanisme mesuré, cause non prouvée.** Deux lookups pour un scan, c'est deux
> *« Recherche du produit… »* et un formulaire rempli deux fois. **Ça ressemble beaucoup à
> « capricieux ».** Je ne peux pas prouver que Michel l'a vécu — mais le défaut existait, il est
> arrivé au pire moment, et il n'existe plus.

### Le classement A → E demandé

| cause | verdict |
|---|---|
| **A — décodage caméra** | ⛔ **écartée comme cause première** : 17 cas sur 20 décodés (§3) |
| **B — lookup produit de l'époque** | ⛔ **écartée pour le scanner LIVE** (le correctif était en place) · ✅ **retenue pour le jugement sur la PHOTO** (2 j 19 h de lookup cassé) |
| **C — iPhone / autofocus** | ⭐⭐ **la plus probable, et la seule qui reste** — le flou casse tout dès 2 px |
| **D — UX / cycle de vie caméra** | ⚠️ **partielle** : deux correctifs de fermeture ne sont arrivés qu'en ft-v1091/1092, trois semaines plus tard |
| **E — problème actuel différent** | ✅ **la course à deux lookups** — née le jour même du retrait, corrigée aujourd'hui |

---

## 2. Ce qui a été corrigé (ft-v1209)

### ① La course : un seul propriétaire de l'état

**Avant** : un booléen `_bcScanning`, posé par **deux** lecteurs. **Après** : une machine à états
avec **un seul verrou**.

```
IDLE → SCANNING → CODE_TROUVE → LOOKUP → TERMINE
```

Tout code décodé, **d'où qu'il vienne**, passe par `_bcPrendreLaMain(code)` : le premier lecteur
prend la main, le second trouve la porte fermée et ne fait **rien**.

> ⭐⭐ **Propriété garantie et MESURÉE SOUS COURSE PROVOQUÉE** : le banc martèle « Capturer »
> pendant toute la lecture continue. Résultat, trois passes identiques : **1 lookup, 1 requête
> Open Food Facts, 0 appel IA.**
>
> ⚠️ **La course était intermittente, et mon premier témoin l'a payé** : il comptait « exactement
> 2 lookups » et **rougissait dès que la machine était moins chargée**. *Un témoin qui dépend du
> vainqueur d'une course ne mesure pas la course, il mesure la charge de la machine.*

### ② La provenance, explicite

`camera-code-local` est passée **en dur** à l'appel, jamais héritée d'une valeur par défaut.

| provenance | ce que c'est | clé de contrôle |
|---|---|---|
| `camera-code-local` | décodage ZXing depuis la caméra | ✅ vérifiée |
| `code-tape` | chiffres tapés | ⛔ non |
| `photo-code-ia` | chiffres lus par un modèle | ⛔ non |

⚠️ **Deux noms ne sont plus produits mais restent lisibles** : `scan` (l'ancien nom du décodage
caméra) et `photo-code` (le décodage local d'une photo, retiré avec `onBarcodeFile`). *Une
provenance qu'on ne sait plus lire est pire qu'une provenance qu'on ne produit plus.*

### ③ Plus aucun bouton mort

`scanBarcodePhoto`, `_bcPhotoFallback` et `onBarcodeFile` sont **supprimées** — orphelines depuis
ft-v388, et rien à rebrancher : le bouton **« 📸 Capturer »** fait le même travail en mieux, en
décodant la frame que la personne est **en train de viser**.

### ④ §16 — « code non lu » ne peut plus se confondre avec « produit non trouvé »

Dès qu'un code est accepté, **avant** la recherche :
- le statut affiche **« ✅ Code lu : 3083681011791 — recherche du produit… »** ;
- le **champ de saisie est rempli** avec le numéro.

> 👉 Même si Open Food Facts ne connaît pas le produit, **le numéro reste à l'écran**. La personne
> voit que son code a été lu, et peut relancer ou corriger. *C'est l'erreur de juillet rendue
> impossible à refaire.*

### ⑤ Le repli IA : un bouton, jamais un basculement

Dans l'écran du scanner : **« 📸 Prendre une photo avec l'IA »**. ⛔ Aucun minuteur, aucun compteur
d'échecs, aucun déclenchement « parce que le code est flou » — et un témoin permanent le vérifie
dans la source.

> *Un code flou restera flou : l'IA lit aussi mal une image molle. On paierait un appel pour
> échouer deux fois.*

### ⑥ La caméra, coupée par deux chemins

`closeBarcodeScanner` coupe le **lecteur ZXing** *et* les pistes portées par la **balise vidéo** —
si le lecteur a été remplacé entre-temps, la vidéo tient encore le flux. Et elle ne remet l'état à
`IDLE` que s'il valait encore `SCANNING` : *sinon elle rouvrirait la porte au second lecteur,
c'est-à-dire la course qu'on vient de fermer.*

---

## 3. La fiabilité du décodeur, mesurée

Trois vrais codes-barres encodés en EAN-13 selon la norme, dégradés, décodés par le ZXing
**réellement servi**. **17 cas sur 20 passent à 3/3.**

| ce qui passe | ce qui ne passe pas |
|---|---|
| net · petit · éloigné · **vu de près** · incliné 5-20° · **90°** · flou 1 px · **lumière à 25 %** · contraste écrasé · **reflet métal 75 %** · cumul réaliste | **incliné 45°** · **flou dès 2 px** · reflet quasi opaque |

⭐⭐ **Le flou est le seul vrai ennemi, et brutalement : 1 px passe, 2 px ne passe plus.**
👉 *Sur un téléphone, « flou » s'appelle « mise au point ».*

> ⚠️ **Une erreur de mesure à moi, gardée ici parce qu'elle se reposera.** Ma première passe
> concluait *« code vu de près : 0/3 »*. **C'était ma fixture, pas ZXing** : je laissais une marge
> blanche de **20 pixels**, alors que la norme EAN-13 exige une **zone de silence de 9 à 11
> MODULES**. À 8 px par module, 20 px ne valent que **2,5 modules**. Corrigé → **3/3**.
> 👉 ***Un paramètre exprimé dans la mauvaise unité ne mesure pas le code, il mesure le test***
> (`BUGS.md` §63). Un garde du PDF refuse désormais que la zone de silence repasse en pixels.

### ⛔ §8 — le traitement d'image n'apporte RIEN (mesuré, pas supposé)

Michel : *« avant d'ajouter sharpen, contraste, binarisation… prouve que cela améliore réellement
ZXing »*. Mesuré sur **18 cas durs** :

| traitement | réussites | coût |
|---|---|---|
| **aucun** | **3/18** | 152 ms |
| contraste ×2,2 | **3/18** | 174 ms |
| netteté + désaturation | **3/18** | 163 ms |
| **binarisation d'Otsu** (seuil calculé, pas un 128 arbitraire) | **3/18** | 169 ms |
| agrandissement ×2 | **3/18** | **258 ms** |

> 👉 ***Aucun traitement ne fait passer un seul cas de plus.*** L'agrandissement coûte **+70 %** de
> temps pour rien. **Il n'y aura donc pas d'usine à gaz** : le facteur limitant est l'autofocus, et
> aucun post-traitement ne rattrape une image molle.

### ⭐ §9 — les formats : la liste n'est pas un caprice

| réglage | succès | **échec** | lit le paysage |
|---|---|---|---|
| **4 formats + TRY_HARDER** *(retenu)* | 3 ms | **140 ms** | ✅ |
| 4 formats seuls | 2 ms | 8 ms | ⛔ |
| TRY_HARDER seul | 5 ms | **436 ms** | ✅ |
| aucun réglage | 2 ms | 21 ms | ⛔ |

> ⭐ **TRY_HARDER apporte le paysage ; la liste de 4 formats divise par 3 le coût d'un échec.**
> *C'est elle qui rend TRY_HARDER abordable* — 140 ms par frame ratée, soit ~7 tentatives par
> seconde en lecture continue.

**Formats retenus, avec leur justification** : **EAN-13** (Europe, l'écrasante majorité) ·
**EAN-8** (petits emballages) · **UPC-A** et **UPC-E** (produits américains, présents en rayon).
⛔ **Pas un de plus** : chaque format supplémentaire rallonge **chaque frame ratée** sans rien lire
de nouveau.

### Performance

| | mesuré |
|---|---|
| décodage **réussi** d'une image | **2-3 ms** |
| décodage **échoué** (réglages retenus) | **140 ms** |
| capture manuelle complète | **~480 ms** |

⚠️ **La cadence de la lecture continue n'est PAS mesurable ici** : ce conteneur rend la vidéo en
**logiciel**. Le chiffre du banc est un **plafond large**, pas une prédiction de téléphone — et le
dire vaut mieux que de le publier comme une performance.

---

## 4. Le chemin réseau

```
caméra → ZXing local → EAN → _bcTraiterCode → _lookupBarcode('camera-code-local')
       → _offFetchProduct → Open Food Facts → _ref100 → résolveur → écran
```

| | scanner caméra | code tapé | photo IA |
|---|---|---|---|
| appels **IA** | ⭐ **0** | 0 | **1** |
| quota des 25 essais | **inchangé** | inchangé | **+1** |
| lookups Open Food Facts | ⭐ **1** *(course fermée)* | 1 | 1 |
| provenance | `camera-code-local` | `code-tape` | `photo-code-ia` |
| résultat produit | **identique** | identique | identique |

⛔ **Le scanner ne possède aucune logique nutritionnelle** — un témoin vérifie qu'il ne touche ni
`_ref100`, ni le résolveur, ni la douane, ni `S.foodLog`, ni les portions, ni les quantités. *Il
fournit un numéro, et appelle le chemin existant.*

**Sur un code illisible** : **0 lookup · 0 appel IA · quota intact**, un message qui dit quoi
faire, et la caméra **reste ouverte** pour réessayer.

---

## 5. Le cycle de vie de la caméra (§10)

| situation | mesuré ici | à vérifier sur iPhone |
|---|---|---|
| ouverture | ✅ contraintes arrière + 1080p demandées | ✅ |
| **permission refusée** | ✅ message + écran gardé ouvert avec ses sorties | ✅ |
| caméra indisponible | ✅ même chemin | ✅ |
| lookup réussi | ✅ **pistes `ended`** | ✅ (voyant vert éteint) |
| lookup échoué | ✅ caméra gardée pour réessayer | ✅ |
| fermeture (« Annuler ») | ✅ | ✅ |
| glisser · Échap · **bouton retour** | ✅ passent par `closeBarcodeScanner` (ft-v1091/1092) | ✅ |
| réouverture | ✅ état remis à `SCANNING` | ✅ |
| **passage en arrière-plan / retour** | ⛔ **non mesurable ici** | ⚠️ **à tester** |
| navigation vers un autre onglet | ⛔ **non mesurable ici** | ⚠️ **à tester** |

---

## 6. Le protocole iPhone — à exécuter par Michel

⚠️ **Rien de ce qui suit n'est validé par moi.** Ce conteneur n'a ni caméra ni Safari : **la
fiabilité mobile n'est pas mesurée**, et je ne la présenterai pas comme telle.

**Pour chaque produit** : ouvrir le scanner · chronométrer grossièrement · noter si l'autofocus
accroche · le nombre de tentatives · le **numéro détecté** · le **produit trouvé ou non** ·
vérifier qu'**aucune IA** n'est utilisée · puis, si le local échoue, essayer le repli IA.

| # | produit | ce qu'on cherche |
|---|---|---|
| 1 | **Cassegrain `3083681011791`** | le cas nominal, carton mat |
| 2 | **Raynal `3021690201123`** | l'avertissement 🔬 doit apparaître (fiche à valeur énergétique fausse) |
| 3 | un code **parfaitement plat** | la référence haute |
| 4 | une **boîte cylindrique** | le code courbé |
| 5 | un emballage **brillant / métallique** | le reflet (tient jusqu'à 75 % de voile au banc) |
| 6 | un code **légèrement abîmé** | là où le repli IA devient utile |

**Et les variations** : téléphone proche · un peu plus loin · petit angle · code courbé · léger
mouvement · éclairage moyen.

**Les cinq gestes qui décident :**

1. **Le scan est-il plus rapide que taper 13 chiffres ?** — le seul vrai critère d'adoption.
2. **La mise au point accroche-t-elle** à ~15-20 cm ? (le flou est l'ennemi mesuré)
3. **« Capturer » sauve-t-il** les cas où la lecture continue n'aboutit pas ?
4. **La caméra s'éteint-elle** à chaque sortie — « Annuler », glisser, bouton retour ? (voyant vert)
5. **Deux scans d'affilée** : le second marche-t-il aussi bien ?

⭐ **Et le test qui vaut tous les autres, posé par Michel lui-même** :

> *« Est-ce qu'un utilisateur normal arrive à scanner rapidement la majorité de ses produits sans
> s'énerver ? »*

---

## 7. Ce que je ne peux pas prouver d'ici

- ⛔ **La fiabilité sur Safari/iPhone** — ni caméra ni Safari dans ce conteneur.
- ⛔ **Le comportement de l'autofocus réel**, qui est pourtant le facteur limitant mesuré.
- ⛔ **Le passage en arrière-plan et le retour au premier plan.**
- ⛔ **La cadence réelle** de la lecture continue sur un téléphone (le banc rend en logiciel).
- ⚠️ Et une honnêteté sur l'enquête : que la course ait *causé* le retrait de juillet est un
  **mécanisme plausible**, pas un fait établi. Le fait établi est qu'elle existait ce jour-là.

---

## 8. Verdict

### ⭐ **PRÊT POUR TEST IPHONE**

⛔ **Et rien de plus fort.** Michel : *« ne déclare pas le scanner définitivement réactivé avant mon
retour iPhone »*.

**Ce qui est fait** : la course fermée par une machine à états · la provenance explicite · aucun
bouton mort · le repli IA volontaire · le numéro lu montré avant la recherche · la caméra coupée par
deux chemins · le scanner sans aucune logique nutritionnelle.

**Ce qui reste à décider, après l'iPhone**, parmi les quatre options de Michel :
**A** réactiver définitivement · **B** réactiver avec fallback IA · **C** réactiver mais améliorer
encore l'UX / l'autofocus · **D** ne pas réactiver.

---

*Mesures figées par les blocs **CCCVIII** (19 témoins, le scanner conduit devant une caméra factice)
et **CCCIX** (12 témoins, les garanties de la réactivation) de `tests/parcours/runner.js`.
Chemin réseau du code-barres : `docs/CHEMIN-RESEAU-CODEBARRES.pdf`.*

---

# 📎 Annexe — la version du MATIN, conservée telle quelle

> ⛔ **Elle n'est pas effacée, elle est datée** (règle du projet : *un document s'AJOUTE ou se
> DÉPLACE, il ne s'écrase pas*). C'est l'audit rendu le 14/09 au matin, **avant** que Michel
> apporte l'information sur Open Food Facts et que la contre-enquête corrige sa conclusion.
>
> ⚠️ **Ce qu'elle dit de faux, et qui est corrigé au §1 ci-dessus** : elle laisse entendre que la
> panne de lookup peut expliquer le jugement négatif porté sur le **scanner live**. C'est faux —
> le correctif était en place et le clone testé sur iPhone le contenait. *On garde le texte pour
> que la correction reste vérifiable, pas pour le croire.*
>
> ⭐ **Ce qu'elle garde de vrai** : toutes les mesures du décodeur, le cycle de vie de la caméra,
> et les quatre défauts trouvés — dont trois sont corrigés en ft-v1209.

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
