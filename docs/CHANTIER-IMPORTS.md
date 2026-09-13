# 📥 Chantier « autonomie des imports » — mesures et chemins proposés

> **Créé le 13/09/2026**, sur la commande de Michel : *« je veux maintenant travailler uniquement sur
> l'autonomie des imports »*, dans l'ordre qu'il a fixé.
> ⛔⛔ **AUCUNE LIGNE DE PRODUCTION MODIFIÉE.** Rien n'est branché, rien n'est embarqué.
> ⛔ Nutrition hors périmètre · contexte Milo intact · règles de progression **documentées, pas codées**.

**Ce qu'il a explicitement mis de côté** (décision produit ou banc API requis) : le contexte de Milo ·
les consignes du prompt · les doublons du contexte · l'historique des check-in · les badges et
mensurations · les règles locales de progression.

---

## ⭐⭐ ÉTAPE 1 — LA VRAIE FONCTION A TOURNÉ SUR LES VRAIS FICHIERS

**C'est fait**, et c'est la mesure qui manquait depuis hier.

### Ce qui a changé par rapport au 13/09 au matin

Hier j'ai mesuré la couche texte avec **mon propre extracteur**. Il prouvait que du texte **existe**
dans le fichier — pas que le code de l'app sache le lire. ***Un outil externe qui trouve du texte ne
dit rien du rendu de la fonction de production.***

⭐ **Le blocage du CDN est contourné sans rien truquer** : `_loadPDFJS()` commence par
`if(window.pdfjsLib){res();return;}`. Il suffit donc que pdf.js soit **déjà là** pour que la fonction
réelle s'exécute. La bibliothèque servie est **pdfjs-dist@3.11.174**, exactement la version du CDN,
récupérée depuis `registry.npmjs.org` (le même paquet que jsdelivr redistribue).
👉 **`_pdfToText` n'est ni modifiée, ni singée, ni recopiée.** C'est elle qui tourne.

### Le résultat

| Fichier | Pages | Lignes rendues | Caractères | Durée | Verdict |
|---|---|---|---|---|---|
| **programme (coach)** | 3 | 87 | 4 253 | **384 ms** | ✅ lu |
| **historique 06/09** (export de l'app) | 22 | 682 | 23 770 | **413 ms** | ⚠️ lu **en partie** |
| **historique 04/09** (export de l'app) | 21 | 671 | 22 775 | **418 ms** | ⚠️ lu **en partie** |
| ⭐ **contrôle négatif** — PDF sans couche texte | 1 | **0** | 0 | — | ✅ **elle sait rendre `[]`** |

**Les lignes telles que la fonction les rend**, ce qui est le seul test qui compte :

```
programme :   ECH Developpe couche 1 x 5 50 kg - 60-90 s
historique :  Leg Curl Couché Machine 2 X 52.5 9 0 473
```

⭐⭐ **La structure tabulaire EST reconstituée.** Le regroupement par Y et le tri par X font leur
travail : `exercice · n° de série · type · kg · reps · rir · volume` — et l'arithmétique le confirme
(52,5 × 9 = 472,5 → **473**). *C'était le doute principal d'hier : il est levé.*

⭐ **Et le contrôle négatif est le témoin le plus important** : sur un PDF sans texte, la fonction rend
**`[]`**. Elle sait donc dire **« je ne sais pas »** — c'est ce qui rend une cascade possible.

### ⛔⛔ MAIS ELLE A TROUVÉ UN DÉFAUT, ET IL EST SILENCIEUX

`_pdfToText` a **`MAX_PAGES = 15`**. Les deux historiques font **22 et 21 pages**.

| | jetons lus | jetons jamais lus | part perdue |
|---|---|---|---|
| `_pdfToText` (plafond **15**) | 5 169 | **2 308** | **31 %** |
| ⛔⛔ `_pdfToImages` — **le chemin d'aujourd'hui** (plafond **8**) | 2 725 | **4 752** | **64 %** |

👉 ***La fonction rend 682 lignes sans le moindre signal de troncature : une lecture partielle est
indiscernable d'une lecture complète.*** C'est exactement ce que la consigne de Michel interdit —
*« aucun barreau ne doit inventer une donnée »*. Un barreau qui rend **les deux tiers** d'un
historique en ayant l'air d'avoir réussi est pire qu'un barreau qui échoue.

⚠️ **Et le chemin actuel est le pire des deux** : 8 pages sur 22, découpées en lots de 3 →
**3 appels IA** pour importer **36 %** du fichier.

### ⚠️ J'AI FAILLI ANNONCER UN FAUX CHIFFRE, DIT PARCE QUE ÇA RESSERVIRA

Ma première sonde comparait des **caractères** et annonçait **« 11 % perdus »** sur le programme —
un fichier de **3 pages**, où un plafond à 15 ne peut pas s'appliquer. En comparant les **jetons**
au lieu de la longueur : **874 lus sur 874, perte nulle**. L'écart était de la **mise en forme**
(espaces normalisés par `replace(/\s+/g,' ')`).
👉 ***Compter des caractères mélange ce qui est absent et ce qui est mis en forme.*** Sur les pages
réellement lues, **aucun contenu ne manque** — la seule perte est le plafond de pages.

---

## ÉTAPE 2 — EMBARQUER pdf.js EN LOCAL

### Chemin actuel

`_loadPDFJS()` (log.js:6256) injecte un `<script>` vers `cdn.jsdelivr.net`, puis pointe le worker
vers le même CDN. **Quatre imports en dépendent** (programme, historique, bilan sanguin, repas), tous
via le propriétaire unique `_pdfOuvrir` (R2).

⛔ **Conséquence mesurée, et elle enfreint la règle d'or #4** : pdf.js est la **seule** bibliothèque
non embarquée. ZXing, Tesseract, SheetJS et jsPDF sont dans `lib/`. **Hors ligne, ou derrière un
réseau qui filtre, aucun import PDF ne fonctionne** — et l'erreur rendue est
*« Impossible de charger PDF.js »*, ce qui au moins ne ment pas.

### Chemin proposé

Copier `pdf.min.js` et `pdf.worker.min.js` dans `lib/`, et faire pointer `_loadPDFJS` sur `./lib/`.

**Mesuré, pas estimé** — versions minifiées de pdfjs-dist@3.11.174 :

| Fichier | Taille |
|---|---|
| `pdf.min.js` | **312,5 Ko** |
| `pdf.worker.min.js` | **1 061,7 Ko** |
| **total** | ⚠️ **1,34 Mo** |

Pour comparaison : `zxing.min.js` 328 Ko · `jspdf.umd.min.js` 357 Ko · `jspdf.plugin.autotable` 38 Ko ·
`xlsx.full.min.js` 861 Ko — **`lib/` hors OCR pèse 1,55 Mo aujourd'hui** (et `lib/ocr/` **12 Mo**,
dans son propre tiroir). L'embarquement de pdf.js **double presque** le premier.

### ⛔ L'effet de bord qui décide de tout — et le modèle existe déjà

**Ne PAS mettre pdf.js dans `PRECACHE`.** Ce tiroir est **versionné** : il est vidé à chaque
livraison. 1,34 Mo re-téléchargés **à chaque `ft-vNN`**, plusieurs fois par jour en ce moment.

⭐ **Le patron est déjà écrit dans `sw.js`, deux fois** :

| Ressource | Poids | Mécanisme |
|---|---|---|
| OCR (Tesseract) | **12 Mo** | tiroir **stable** `ft-ocr` + regex `/\/lib\/ocr\//` — **jamais vidé** par une livraison |
| `data/ciqual.json` | 250 Ko | **retiré du précache exprès** (22/08), mis en cache à la demande |
| images | ~15 Mo | tiroir stable `IMG_CACHE`, hors de l'install bloquante |

👉 **pdf.js relève du même régime** : un tiroir stable, alimenté **à la première ouverture d'un PDF**.
*Le commentaire de ciqual.json dit déjà pourquoi, mot pour mot.*

### Ce qui est mesuré, et ce qui ne l'est pas

| | État |
|---|---|
| **la bibliothèque locale fonctionne** | ✅ **prouvé** : toute l'étape 1 a tourné sur une copie servie localement, worker compris |
| **le poids exact** | ✅ 1,34 Mo, mesuré |
| **le mécanisme de cache à copier** | ✅ existe déjà (`ft-ocr`) |
| ⛔ **l'effet sur le temps d'installation du SW** | **non mesuré** |
| ⛔ **le comportement iOS/Safari du worker en `blob:` ou `file:`** | **non mesuré** |

⛔ **Donc on ne code pas**, conformément à la consigne (*« ne code pas encore si cela implique des
effets de bord non mesurés »*). Les deux trous ci-dessus se mesurent avant, pas après.

---

## ⭐⭐ ÉTAPE 3 — LES EXPORTS DE FORCE TRACKER : LE CHEMIN STRUCTURÉ EXISTE DÉJÀ

**C'est la découverte la plus rentable du lot, et elle rend l'étape 4 presque inutile pour ce cas.**

### Le fait mesuré

`exportHistoCsv()` (setup.js:390) et `exportHistoPdf()` (setup.js:475) appellent **la même fonction**,
`_histoLignes()`. Le commentaire du code le dit déjà : *« deux producteurs finiraient par ne pas dire
la même chose du même historique »*.

👉 ***Le PDF et le CSV de l'historique sortent du même producteur.*** Lire le PDF pour retrouver ce
que le CSV donne déjà en clair, c'est **traverser une conversion à sens unique pour rien**.

| | CSV | PDF |
|---|---|---|
| colonnes | **9, explicites** : `date · seance · exercise · set_num · type · kg · reps · rir · volume` | 7 — `date` et `seance` relégués en **en-têtes de section**, à ré-associer |
| plafond | **aucun** | ⛔ **15 pages** (`_pdfToText`) ou **8** (`_pdfToImages`) |
| échappement | ✅ guillemets réels (un nom d'exercice peut contenir une virgule) | à reconstituer |
| encodage | ✅ `;` + BOM UTF-8 (Excel FR) | — |
| coût | **0 appel, 0 réseau** | 3 appels IA aujourd'hui |
| cardio | ✅ présent (`type = CARDIO`, depuis le 04/09) | idem |

### ⛔ Mais l'honnêteté du constat : il n'y a AUCUN import d'historique non-IA

Mesuré : le **seul** chemin d'entrée de l'historique est `importHistory` → images → IA.
**Aucun lecteur CSV d'historique n'existe.** L'étape 3 n'est donc **pas** « rebrancher » — c'est
**écrire un lecteur**, en réutilisant un patron déjà éprouvé.

### ⭐ Le patron est complet, et il tourne déjà en production

La chaîne d'import de la **balance** fait exactement ce qu'il faut, de bout en bout :

```
onScaleCsvFile(input)           tracking.js  — reconnait .csv / .xlsx / .xls
   |-- _loadXlsx()                          — charge ./lib/xlsx.full.min.js A LA DEMANDE
   |-- XLSX.read(...) + sheet_to_csv(...)   — Excel -> CSV, un seul chemin en aval
   `-- _scaleCsvImportFromText(texte)
          |-- _parseScaleCsv(texte)  -> {rows} ou {err}   <-- il SAIT dire « je ne sais pas »
          |-- showConfirm(...)       -> la personne TRANCHE avant d'ecrire
          `-- _importScaleRows(rows) -> ecrit, sans rien effacer
```

⭐ **Trois qualités à reprendre telles quelles** : ① `{err}` plutôt qu'une exception — *le lecteur
peut échouer proprement* ; ② `showConfirm` avant d'écrire — *l'app propose, la personne décide*
(**R29**) ; ③ `.xlsx` converti en CSV **tout de suite**, donc **un seul chemin** en aval (**R2**).

⚠️ **Et il est derrière `_isScaleCsvBeta()`** — réservé aux testeurs. À savoir avant de le citer
comme « déjà ouvert ».

### Le tableau demandé

| | |
|---|---|
| **Chemin actuel** | PDF → `_pdfToImages` (8 pages max) → lots de 3 → **3 appels IA** → JSON → normalisation |
| **Chemin proposé** | CSV/XLSX → `_parseHistoCsv` (à écrire) → `showConfirm` → écriture — **0 appel** |
| **Fonctions réutilisables** | `_loadXlsx` · `XLSX.utils.sheet_to_csv` · `showConfirm` · `_csvEchappe` (à l'envers) · `HISTO_COLONNES` comme **contrat** · la normalisation d'entrée de ft-v1095 |
| **Dépendances** | `lib/xlsx.full.min.js` — **déjà embarqué, déjà dans le précache** |
| **Témoins nécessaires** | ① un CSV exporté par l'app se relit **à l'identique** (aller-retour) · ② un fichier sans les colonnes attendues rend une **erreur nommée**, pas un import vide · ③ les dates déjà présentes sont **mises à jour**, jamais dupliquées · ④ une série non validée **n'entre pas** · ⑤ le cardio reste du cardio · ⑥ **le RIR vide reste vide, jamais 0** (ft-v1038) |
| **Hors ligne** | ✅ **total** — SheetJS est local, aucun réseau |
| **Fallback** | l'import IA actuel, **intact** |
| **Critère « je ne sais pas »** | l'en-tête ne porte pas les colonnes attendues, ou **0 ligne exploitable** → `{err}` et on **ne descend pas** tout seul : on le **dit** |

---

## ÉTAPE 4 — LES PDF EXTERNES : LA CASCADE

Uniquement pour ce qui **ne vient pas** de Force Tracker (un programme reçu d'un coach).

```
 (1) SOURCE STRUCTUREE   CSV / XLSX                      -> 0 appel   [lecteur deja embarque]
        |  echec EXPLICITE : pas les colonnes attendues
        v
 (2) TEXTE PDF           _pdfToText (existe, 1 appelant) -> 0 appel   [mesure : 384 ms, 87 lignes]
        |  echec EXPLICITE : [] rendu, ou structure non reconnue
        v
 (3) OCR LOCAL           Tesseract (deja embarque)       -> 0 appel
        |  echec EXPLICITE : rien de lisible
        v
 (4) IA                  le chemin actuel, intact        -> 1 appel
        |
        v
 (5) ECHEC PROPRE        « document non reconnu » — jamais une donnee inventee
```

### Ce que la mesure dit de chaque barreau

| Barreau | Existe ? | Sait dire « je ne sais pas » ? |
|---|---|---|
| ① structuré | ✅ SheetJS embarqué | ✅ `_parseScaleCsv` rend `{err}` |
| ② texte PDF | ✅ `_pdfToText` | ✅ **rend `[]`** — vérifié au contrôle négatif |
| ③ OCR | ✅ Tesseract embarqué (ft-v974) | ✅ échec propre déjà écrit |
| ④ IA | ✅ le chemin actuel | ⚠️ voir ci-dessous |
| ⑤ échec propre | ⚠️ **partiel** | *« PDF vide ou illisible »* existe ; il faudra un état **nommé** |

### ⛔⛔ LE POINT DE CONCEPTION, ET IL VIENT DE L'ÉTAPE 1

Un barreau ne doit pas seulement savoir **échouer** : il doit savoir dire qu'il a **réussi à moitié**.
`_pdfToText` rend aujourd'hui 682 lignes d'un fichier de 22 pages **sans rien signaler** — pour la
cascade, c'est **un succès qui ment**, et c'est plus dangereux qu'un échec.

👉 **Avant la cascade, `_pdfToText` doit rendre au minimum « j'ai lu N pages sur M ».** Sinon le
barreau ② renvoie un résultat partiel, la cascade s'arrête là, et on n'appelle jamais le barreau
suivant qui aurait fait mieux. ⚠️ *C'est une modification de la fonction, donc hors de la lecture
seule — elle est écrite ici, pas faite.*

### Le tableau demandé

| | |
|---|---|
| **Chemin actuel** | PDF → images → IA, **systématiquement**, même quand le texte est là |
| **Chemin proposé** | la cascade ci-dessus, chaque cran essayé **seulement si** le précédent échoue explicitement |
| **Fonctions réutilisables** | `_pdfOuvrir` (**porte unique**, mot de passe compris) · `_pdfToText` · `_pdfToImages` · le moteur OCR de ft-v974 · `_catalogueImport()` |
| **Dépendances** | ⛔ **pdf.js** — donc **l'étape 2 est un prérequis strict** |
| **Témoins nécessaires** | ① un PDF avec texte **n'appelle pas l'IA** · ② un PDF scanné **descend** jusqu'à l'IA · ③ chaque cran **peut rendre** « je ne sais pas » · ④ un cran ne s'exécute **jamais** si le précédent a réussi · ⑤ **une lecture partielle n'est pas un succès** |
| **Hors ligne** | ✅ crans ①②③ — **après l'étape 2 seulement** · ⛔ cran ④ impossible |
| **Fallback** | le chemin IA actuel, **inchangé** |
| **Critère « je ne sais pas »** | ① colonnes absentes · ② `[]` **ou** pages manquantes · ③ aucun mot reconnu · ④ JSON invalide · ⑤ état **nommé**, jamais une donnée inventée |

---

## ÉTAPE 5 — LA RÈGLE DE DESCENTE

*« Ne descends au barreau suivant que si le précédent échoue explicitement. Aucun barreau ne doit
inventer une donnée. »*

**Ce qui la rend applicable** : chaque cran rend **trois** réponses possibles, jamais deux.

| Réponse | Ce qu'on en fait |
|---|---|
| ✅ **lu, complet** | on s'arrête, les crans suivants ne tournent pas |
| ⚠️ **lu, partiel** | ⛔ **n'est PAS un succès** — on le dit, et on laisse la personne trancher |
| ⛔ **je ne sais pas** | on descend d'un cran |

⛔ **Ce que la règle interdit** : qu'un cran comble un trou avec une valeur par défaut. Un `null`
ne se remplace jamais par un `0` (**R29**) — *un blanc se voit, un chiffre crédible et faux ne se
voit pas*.

---

## 🔒 CE QUI EST DOCUMENTÉ ET NON CODÉ — les règles de progression

Conformément à la consigne : **gardées, pas codées.** Les quatre termes ci-dessous doivent devenir
des **décisions produit explicites** avant qu'une ligne soit écrite.

| Terme | Où il vit | Ce qu'il faut trancher |
|---|---|---|
| **« proprement »** | *« monte la charge quand toutes les séries passent proprement »* | toutes les séries validées ? aucune série `X` ? un RIR ≥ n ? les trois ? |
| **« 4 ou 6 semaines »** | *« une semaine plus légère toutes les 4-6 sem »* | un code doit choisir **un** nombre, ou une règle qui dépend de quoi ? |
| **« N séances »** | *« changer le stimulus si ça stagne »* | **N n'est écrit nulle part** |
| **« maximal »** | *« compte 4 à 7 jours avant de reproposer un maximal »* | 1-3 reps près du max ? un % du 1RM ? une série notée à l'échec ? |

⛔ **Et la question qui vient après, sans réponse aujourd'hui** : une fois la règle codée,
**que devient la phrase dans le prompt ?** La garder = **deux sources** pour une même décision.
La retirer = **changement de contexte** → banc d'essai obligatoire (**R34**).

---

## Ordre proposé, révisé par les mesures du jour

| # | Chantier | Pourquoi | Prérequis |
|---|---|---|---|
| ⭐ **1** | **Lecteur CSV d'historique** | le CSV et le PDF sortent du **même producteur** ; le lecteur XLSX est **déjà embarqué** ; **0 appel, 0 réseau** — et ça ne touche pas à pdf.js | aucun |
| **2** | **Embarquer pdf.js** (tiroir stable) | corrige une dette hors ligne **et** débloque la cascade | mesurer l'install SW + Safari |
| **3** | **`_pdfToText` sait dire « N pages sur M »** | sans ça, le barreau ② de la cascade **ment** | ② |
| **4** | **Cascade — programme** | seul vrai cas de PDF externe | ②③ |
| **5** | **Cascade — historique** | porte jumelle (**R8**) | ②③ |

⭐ **Le n°1 a changé de place grâce à la mesure du jour** : il ne dépend de rien, il supprime
3 appels IA, et il marche hors ligne aujourd'hui.

---

## Ce que ce document NE fait pas

⛔ aucune ligne de production modifiée · ⛔ pdf.js **n'est pas** dans `lib/` · ⛔ aucun lecteur CSV
écrit · ⛔ aucune cascade branchée · ⛔ `MAX_PAGES` **inchangé** · ⛔ nutrition non approchée ·
⛔ contexte de Milo intact · ⛔ règles de progression non codées.

*Sondes hors dépôt : `sonde_pdftotext.js`, `sonde_pages.js`, `sonde_perte.js` — rejouables.
pdf.js récupéré depuis `registry.npmjs.org`, jamais déposé dans le dépôt.*
