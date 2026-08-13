# 📄 Les contraintes des PDF de Force Tracker

> **À quoi sert ce fichier** — le même problème que `DESIGN-KIT.md` a réglé pour l'écran : un outil
> extérieur (ChatGPT, un maquettiste) travaille **à l'aveugle**. Il ne sait pas avec quoi les PDF sont
> fabriqués, ni ce que l'outil sait faire, ni surtout ce qu'il **ne peut pas** faire. Résultat : il
> propose une belle maquette **intransposable**, et on perd du temps à découvrir pourquoi.
>
> **À coller tel quel dans ChatGPT** avant de lui demander d'améliorer un PDF.
> Vérifié le 13/08/2026 en lisant les bibliothèques réellement embarquées, pas de mémoire.

---

## 1. Il y a DEUX mécanismes, pas un

C'est le premier malentendu à éviter. Force Tracker produit des PDF de deux façons **très
différentes**, et une idée réalisable dans l'une est parfois impossible dans l'autre.

| | **A. Feuille imprimée** | **B. jsPDF** |
|---|---|---|
| Comment | HTML + CSS → `window.print()` | Dessin par coordonnées, en JavaScript |
| Qui produit le PDF | le **navigateur** du téléphone | l'**app** elle-même |
| Sert à | le **programme** (bouton 🖨️) | le chat de Milo · l'étude du corps · le rapport PT-001 · le **programme** aussi |
| Mise en forme | **CSS complet** (`@media print`, `style.css`) | Aucun CSS. Tout est dessiné au point près. |
| Résultat | passe par la boîte de dialogue du système | un **vrai fichier**, partageable et hors ligne |
| Sur iPhone | Partager → Imprimer → PDF (plusieurs tapes) | téléchargement ou feuille de partage directe |

**Ce n'est pas un doublon.** La feuille imprimée est plus belle et plus souple ; jsPDF donne un
fichier qu'on peut envoyer par mail ou WhatsApp sans passer par le système. Les deux restent.

---

## 2. Ce que la FEUILLE IMPRIMÉE (A) sait faire

**Presque tout ce que sait faire le CSS.** C'est le terrain le plus libre.

✅ Possible : couleurs, dégradés, ombres, coins arrondis, colonnes, flexbox, grid, polices web,
pseudo-éléments, filets, fonds, rotations, opacité, `break-before/after/inside`, en-tête de tableau
répété sur chaque page (`thead { display: table-header-group }`).

✅ **La police de marque est disponible** : `Manrope` est embarquée dans l'app
(`fonts/manrope-variable.woff2`, 24 Ko, chargée en local donc **hors ligne**). Space Grotesk et
Pacifico aussi.

### ⚠️ Les 4 vraies contraintes

1. **⚠️⚠️ LES FONDS NE SONT PAS GARANTIS.** *« Graphiques d'arrière-plan »* est une **case à cocher
   DÉCOCHÉE par défaut** dans la boîte d'impression des navigateurs. Un aplat, une couleur de fond,
   une image de fond peuvent **ne pas être imprimés du tout**.
   → **Règle absolue du projet** : *aucune information ne repose sur un fond.* La couleur du **TEXTE**
   et les **BORDURES** (toujours imprimées) portent le sens ; les aplats ne sont qu'un bonus.
   *Cas vécu (11/08/2026)* : les en-têtes de colonnes étaient en blanc sur noir → sans les fonds, ils
   sortaient **blanc sur blanc, totalement invisibles**. Personne ne l'avait vu pendant des mois.
2. **Pas d'en-tête/pied de page répété** autre que le `thead` d'un tableau. Pas de numérotation de
   page automatique, pas de « Page 3/7 » en bas de chaque feuille.
3. **Pas de contrôle de la pagination fine.** On peut demander « ne coupe pas ce bloc »
   (`break-inside: avoid`) et « ne laisse pas ce titre seul » (`break-after: avoid`), mais on ne
   décide pas où tombe la coupure.
4. **Pas de fichier partageable.** Le résultat passe par la boîte de dialogue du système : l'app ne
   peut ni le nommer, ni l'envoyer, ni le stocker.

---

## 3. Ce que jsPDF (B) sait faire

**Bibliothèque : jsPDF 2.5.2 + le module autoTable**, tous deux embarqués en local dans `lib/`
(donc **hors ligne**, aucun CDN).

✅ Possible : texte, lignes, rectangles, cercles, couleurs pleines, épaisseurs de trait, traits
pointillés, images **PNG et JPEG**, tableaux via autoTable (lignes alternées, largeurs de colonnes,
alignements, fusion de cellules, en-tête répété sur chaque page), pagination, marges, plusieurs pages.

✅ **Dégradés : POSSIBLES.** jsPDF 2.5.2 embarque `addShadingPattern` / `ShadingPattern` (dégradés
axiaux et radiaux) et `TilingPattern`. *Je m'attendais à l'inverse — vérifié dans le fichier.*
⚠️ Mais l'API est bas niveau et pénible : rien à voir avec un `linear-gradient` CSS.

✅ **Polices personnalisées : POSSIBLES** — `addFileToVFS` + `addFont` existent.
⚠️ **Mais pas avec les polices actuelles de l'app** : jsPDF veut du **TTF/OTF en base64**, or
Force Tracker n'embarque que du **.woff2**. Il faudrait ajouter un fichier TTF au dépôt
(≈ 50-150 Ko selon la fonte) — donc du poids en plus dans le cache hors ligne de tout le monde.
*C'est une décision, pas une impossibilité.*

### ⚠️ Les contraintes réelles

1. **Aucun CSS. Zéro.** Tout est en coordonnées absolues (points, origine en haut à gauche). Une
   maquette exprimée en CSS n'est pas transposable telle quelle : il faut la re-décrire en positions,
   tailles et couleurs RGB.
2. **Polices d'origine : helvetica, times, courier** (+ symbol, zapfdingbats). Les accents français
   passent (encodage WinAnsi). **La police de marque Manrope n'y est PAS** — voir ci-dessus.
3. **Pas de SVG.** Le module `svg2pdf` n'est pas embarqué. Un logo vectoriel doit être converti en
   PNG (c'est ce qu'on fait déjà).
4. **⚠️ autoTable ne sait pas styler une PARTIE de cellule.** Une cellule a **un seul** style. C'est
   la limite qu'on vit aujourd'hui : la consigne d'exercice s'imprime en 2ᵉ ligne de cellule, donc
   **du même gris que le nom de l'exercice** — alors que sur la feuille imprimée (A) elle est en or
   et en italique.
   → Contournement possible : dessiner la note à la main dans le hook `didDrawCell`. Faisable, plus
   fragile (il faut gérer soi-même la hauteur de ligne et les retours à la ligne).
5. **Pas d'emoji.** Les polices d'origine n'ont pas les glyphes ; il faudrait embarquer une police
   emoji entière (plusieurs centaines de Ko). En pratique : **on n'utilise pas d'emoji dans les PDF
   jsPDF**.
6. Hooks disponibles pour aller plus loin : `didParseCell`, `willDrawCell`, `didDrawCell`,
   `didDrawPage`. Styles réglables par cellule : `fillColor`, `textColor`, `fontStyle`, `halign`,
   `valign`, `cellWidth`, `minCellHeight`, `lineWidth`, `lineColor`, `cellPadding`.

---

## 4. ⛔ CE QUI N'EST PAS POSSIBLE — la liste courte

| Idée | Verdict | Pourquoi |
|---|---|---|
| Styler une partie du texte d'une cellule de tableau (jsPDF) | ⛔ | autoTable = un style par cellule. Contournable à la main, plus fragile. |
| Emoji dans un PDF jsPDF | ⛔ | Aucun glyphe dans les polices d'origine. |
| SVG dans un PDF jsPDF | ⛔ | Module `svg2pdf` non embarqué. → convertir en PNG. |
| Utiliser Manrope dans jsPDF **sans rien ajouter au dépôt** | ⛔ | jsPDF veut du TTF, l'app n'a que du .woff2. |
| Garantir qu'un **fond de couleur** s'imprime (feuille A) | ⛔ | Case « graphiques d'arrière-plan », décochée par défaut. |
| Numéro de page / pied répété (feuille A) | ⛔ | Le CSS d'impression ne le permet pas. |
| Décider où tombe une coupure de page (feuille A) | ⛔ | On peut seulement *interdire* de couper un bloc. |
| Obtenir un fichier partageable depuis la feuille A | ⛔ | Passe par la boîte de dialogue du système. |
| PDF interactif (champs à remplir, cases à cocher) | ⛔ | Non implémenté, et sans usage ici : la feuille se remplit **au stylo**. |
| Charger une police ou une image depuis Internet | ⛔ | L'app doit marcher **hors ligne** (règle d'or #4). |

**À l'inverse, ce qu'on croit souvent impossible et qui ne l'est pas** : les dégradés (jsPDF sait),
les polices personnalisées (moyennant un TTF ajouté au dépôt), les images (PNG/JPEG), les tableaux
complexes avec fusion de cellules, plusieurs pages avec en-tête de tableau répété.

---

## 5. 🎨 L'identité — non négociable

⚠️ **Ne PAS proposer une autre palette.** Force Tracker a la sienne, et un PDF doit se reconnaître
(règle d'or #7). Les couleurs sont celles du **mode CLAIR** de l'app — celles du mode sombre ne valent
rien sur papier.

| Rôle | Couleur | RGB (pour jsPDF) |
|---|---|---|
| Rouge — titres, en-têtes de tableau, filet principal | `#D91843` | `[217, 24, 67]` |
| Or — filet d'accent, séparateurs, pied de page | `#CC8800` | `[204, 136, 0]` |
| Encre — texte courant | `#12121E` | `[18, 18, 30]` |
| Gris — texte secondaire | `#4A4A6A` | `[74, 74, 106]` |
| Pâle — mentions légales, pagination | `#8888AA` | `[136, 136, 170]` |
| Fond alterné de tableau | `#F6F6F9` | `[246, 246, 249]` |
| Filet de séparation | `#DCDDE4` | `[220, 221, 228]` |

**Les partis pris de mise en page déjà adoptés** (issus du modèle que Michel a écrit pour une autre
application, transposé le 12/08) : filet doré à gauche de chaque section · lignes alternées ·
**aucun trait vertical dans le corps du tableau** (*ce sont les colonnes qui portent le sens, pas les
cloisons*) · coins arrondis · aplats francs, **jamais de dégradé** · un titre ne reste jamais seul en
bas de page.

---

## 6. 🏋️ Les contraintes d'USAGE — celles qu'un outil extérieur ne devine jamais

Ce sont souvent les plus décisives.

1. **La feuille va à la salle.** Elle est pliée dans un sac, posée sur un banc, manipulée avec les
   mains moites. Elle est **imprimée une fois** et sert plusieurs séances.
2. **On écrit dessus au STYLO.** Toute zone de saisie doit être assez large pour un chiffre écrit à
   la main (≈ 36 pt minimum par case). Une case élégante mais étroite ne sert à rien.
3. **Beaucoup d'imprimantes sont en noir et blanc.** Tout doit rester lisible sans couleur —
   c'est la même règle que les fonds : la couleur ajoute, elle ne porte jamais l'information seule.
4. **On la lit vite, entre deux séries, parfois mal éclairé.** Un corps de texte trop petit ou trop
   pâle est inutilisable en conditions réelles.
5. **Tout doit marcher hors ligne** (règle d'or #4) : aucune police, image ou bibliothèque chargée
   depuis Internet.
6. **iPhone d'abord.** L'app est une PWA pensée pour mobile (largeur max 430 px).
7. **Ça ne doit pas ralentir l'app.** Les bibliothèques sont chargées **à la demande**, seulement au
   moment où l'on exporte.

---

## 7. Où c'est dans le code

| Quoi | Où |
|---|---|
| Feuille imprimée — construction du HTML | `log.js` → `printProg()` |
| Feuille imprimée — toute la mise en forme | `style.css` → bloc `@media print` |
| Palette + en-tête + pied communs aux 4 PDF | `log.js` → `PDF_COL`, `_pdfEntete()`, `_pdfPied()` |
| PDF du programme | `log.js` → `exportProgPdf()` |
| PDF du chat de Milo | `coach.js` |
| PDF de l'étude du corps | `setup.js` |
| PDF du rapport PT-001 | `coach.js` |
| Bibliothèques (hors ligne) | `lib/jspdf.umd.min.js`, `lib/jspdf.plugin.autotable.min.js` |
| Polices de l'app | `fonts/manrope-variable.woff2` (+ Space Grotesk, Pacifico) |

---

## 8. 💬 Comment demander une amélioration à ChatGPT

Colle ce fichier, puis précise **de quel PDF tu parles** — c'est la question qui change tout :

> « J'améliore **la feuille imprimée du programme** (mécanisme A, CSS complet) » → il a beaucoup de
> liberté, mais doit respecter la règle des fonds non garantis.

> « J'améliore **le PDF jsPDF du programme** (mécanisme B) » → il doit raisonner en **coordonnées et
> en couleurs RGB**, pas en CSS, et accepter les limites du §4.

**Et demande-lui de dire, pour chaque proposition, dans quel mécanisme elle s'applique.** Une idée
qui marche dans A et pas dans B n'est pas une mauvaise idée — c'est une idée à ranger au bon endroit.

---

## 9. 🎨 La consigne pour CLAUDE DESIGN (l'outil de maquettage)

> **⚠️ Ne PAS lui coller le bloc de `docs/DESIGN-KIT.md`.** Celui-là décrit **l'écran** : mode sombre
> uniquement, largeur 430 px, `--bg #0C0D11`. Sur du **papier**, chacune de ces trois consignes est
> **fausse** — une maquette sombre en 430 px de large ne s'imprime pas, elle se gâche.
> *Le même outil, deux supports, deux kits.* C'est la seule raison d'être de cette section.
>
> Et le partage des rôles ne change pas : **l'outil externe explore une direction, Claude Code la rend
> réelle**. Une maquette n'est jamais la livraison — elle est l'idée qu'on transpose ensuite.

### 📋 LE BLOC À COLLER

```
Je veux une maquette de FEUILLE IMPRIMÉE (papier A4), pas un écran.
C'est un programme d'entraînement de musculation qu'on imprime, qu'on plie dans un sac
de sport, et sur lequel on écrit AU STYLO entre deux séries.

CONTRAINTES TECHNIQUES (strictes)
- HTML + CSS purs, un SEUL fichier autonome que je puisse ouvrir et imprimer tel quel.
- Format A4 PORTRAIT. Prévois @page { size: A4; margin: 12mm } et un @media print complet.
- FOND BLANC, encre sombre. Ce n'est PAS le mode sombre de l'application.
- Aucune ressource externe : ni police, ni image, ni script chargés depuis internet.
- Police : Manrope si disponible, sinon system-ui / -apple-system / sans-serif.
- Le tableau doit répéter son en-tête sur chaque page : thead { display: table-header-group }.
- Un titre ne doit jamais rester seul en bas de page : break-after: avoid.

LES 3 RÈGLES QUI ONT DÉJÀ COÛTÉ CHER — ce ne sont pas des préférences
1. AUCUNE INFORMATION NE REPOSE SUR UN FOND DE COULEUR.
   « Graphiques d'arrière-plan » est DÉCOCHÉ par défaut dans la boîte d'impression :
   les aplats peuvent ne pas s'imprimer du tout. La couleur du TEXTE et les BORDURES
   portent le sens ; un fond n'est qu'un bonus.
   Cas vécu : des en-têtes blancs sur noir sortaient blanc sur blanc, donc invisibles,
   et personne ne l'avait vu pendant des mois.
   → Teste ta maquette avec tous les background-color retirés : tout doit rester lisible.
2. TOUT DOIT RESTER LISIBLE EN NOIR ET BLANC. Beaucoup d'imprimantes n'ont pas de couleur.
3. CHAQUE CASE À REMPLIR AU STYLO FAIT AU MOINS 36 px DE LARGE.
   Une case élégante mais étroite est inutilisable : on y écrit « 130 » à la main.

PALETTE — utilise CES couleurs, n'en invente pas d'autres
  Rouge (titres, en-têtes de tableau, filet principal) : #D91843
  Or (filet d'accent, séparateurs, pied de page)        : #CC8800
  Encre (texte courant)                                 : #12121E
  Gris (texte secondaire)                               : #4A4A6A
  Pâle (mentions, pagination)                           : #8888AA
  Fond alterné de tableau                               : #F6F6F9
  Filet de séparation                                   : #DCDDE4

PARTIS PRIS DE MISE EN PAGE DÉJÀ ADOPTÉS — les garder
- Un filet doré vertical à gauche de chaque bloc « jour ».
- Lignes alternées dans les tableaux.
- AUCUN trait vertical dans le corps du tableau : ce sont les colonnes qui portent
  le sens, pas les cloisons. (Exception : un filet très pâle entre deux cases à
  remplir, pour qu'on voie où finit l'une et où commence l'autre.)
- Coins arrondis, aplats francs, JAMAIS de dégradé.
- Une consigne d'exercice s'affiche sous son nom, en or et en italique.

CE QUE LA FEUILLE DOIT CONTENIR
- Un en-tête : nom du programme, et des champs à remplir au stylo (Date, Poids du corps,
  Semaine) — sans eux, deux tirages du même programme sont indiscernables sur le banc.
- Par jour : le titre du jour, puis un tableau des exercices.
- Par exercice : le nom, sa consigne éventuelle, le nombre de séries × répétitions,
  puis UNE CASE VIDE PAR SÉRIE (maximum 6). On monte en charge série après série
  (70, 100, 115, 130) : une case unique ne permettrait d'en noter qu'une seule.
- Un exercice à 3 séries a 3 cases, pas 6. Une case pour une série qui n'existe pas
  invite à écrire n'importe quoi.

CE QUE TU NE PEUX PAS FAIRE (le CSS d'impression ne le permet pas)
- Pas de numéro de page ni de pied répété (autre que le thead d'un tableau).
- Pas de contrôle de l'endroit où tombe une coupure de page : on peut seulement
  interdire de couper un bloc (break-inside: avoid).
```

### Après la maquette

- **Envoie-moi le rendu réel**, pas une description : la capture de la feuille **et** la même
  feuille **fonds coupés** (la case « graphiques d'arrière-plan » décochée). C'est le seul contrôle
  qui attrape le défaut n°1, et c'est exactement celui qui a échappé au générateur Python d'origine
  — il forçait `print_background=True`, donc *l'outil de référence était aveugle au défaut qu'on
  cherchait*.
- **Si tu veux ensuite la même chose en PDF jsPDF (mécanisme B)** : ne redemande pas du CSS, il n'y
  en a pas. Demande-lui de **re-décrire** sa maquette en positions (points, origine en haut à
  gauche), tailles et couleurs RGB — et rappelle-lui les limites du §4 (pas d'emoji, pas de SVG,
  pas de style sur une partie de cellule).
