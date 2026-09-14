# 📐 Plan — le contrat COMPLETE / PARTIAL / UNKNOWN, puis le lecteur CSV d'historique

> **Créé le 13/09/2026.** Michel tranche l'ordre : *« un import peut réussir silencieusement alors
> qu'il est tronqué »* passe **avant** la cascade.
> ⛔⛔ **PLAN SEUL — AUCUNE LIGNE DE PRODUCTION MODIFIÉE.**
> ⛔ Nutrition · contexte Milo · règles de progression : intacts. ⛔ **Le plafond de pages n'est PAS
> corrigé** — sa consigne : *« pas de correction silencieuse du plafond sans d'abord rendre la
> troncature observable »*.

---

## PARTIE A — LE CONTRAT

### A.1 Les appelants, mesurés un par un (c'est ce qui décide de la forme)

| # | Appelant | Fichier | Ce qu'il consomme | Nature |
|---|---|---|---|---|
| 1 | `_vmCustomPdf` | coach.js:7870 | `lines.length` · `lines.join('\n')` | ⭐ **outil admin** (Mode Test VM) |
| 2 | `addImportFile` (programme) | log.js:6374 | `pages.length` · `...pages` | utilisateur |
| 3 | `addHistFile` (historique) | log.js:7134 | `pages.length` · `...pages` | utilisateur |
| 4 | `addMealImportFile` (repas) | app.js:7354 | `pages.length` · `...pages` | ⛔ **nutrition — hors périmètre** |
| 5 | `onBloodFile` (prise de sang) | tracking.js:1893 | `imgs.map(p=>p.data)` | utilisateur |

⭐⭐ **Deux faits qui changent le plan** :
- **`_pdfToText` n'a QU'UN SEUL appelant, et c'est un outil admin.** Le contrat peut donc y être
  introduit **seul, d'abord, sans toucher au moindre chemin utilisateur.**
- **Les 5 appelants ne lisent QUE `.length` et l'itération.** Aucun ne lit une autre propriété.

### A.2 Les trois formes possibles — et pourquoi la plus compatible est la mauvaise

| | Forme | Appelants à changer | Ce qui se passe si on en oublie un |
|---|---|---|---|
| **A** | tableau **+ propriétés attachées** (`lignes.etat = …`) | **0** | ⛔⛔ **il se comporte exactement comme aujourd'hui : la troncature reste invisible.** *La compatibilité parfaite est ici le défaut, pas la qualité.* |
| ⭐ **B** | objet `{etat, lignes, pagesLues, pagesTotal, raison}` | **5** | ⚠️ `pages.length` vaut `undefined` → `if(!pages.length)` est vrai → *« PDF vide ou illisible »* et on saute le fichier |
| **C** | nouvelle fonction à côté de l'ancienne | 0 au début | ⛔ **deux propriétaires de « lire un PDF »** (**R2**) — elles divergeront |

👉 **B, parce que c'est la seule qui rend l'oubli impossible à ignorer.** C'est exactement ce que
Michel demande : *« je ne veux plus qu'une simple liste nue puisse masquer une troncature »*.

⚠️ **Et je dis la faiblesse de B plutôt que de la taire** : un appelant non migré **échoue fermé**
(aucune donnée fausse n'entre — c'est le bon sens), mais avec un **message trompeur** : il dira
*« PDF vide »* pour un PDF parfaitement lisible. **Ce n'est pas bruyant, c'est muet-mais-sûr.**
👉 Le garde-fou n'est donc pas la forme : c'est **un témoin de source** qui exige que *chaque
appelant lise `.etat`*. Sans lui, la migration peut être incomplète sans que rien ne rougisse.

### A.3 La forme exacte proposée

```js
/* ⛔ UNE LECTURE PARTIELLE N'EST PAS UN SUCCES, et ce n'est pas non plus une exception :
   c'est un ETAT, qui doit remonter jusqu'a l'appelant. Mesure du 13/09 : _pdfToText rendait
   682 lignes d'un fichier de 22 pages SANS RIEN SIGNALER (plafond MAX_PAGES=15, 31 % jamais
   lus) — et _pdfToImages, le chemin qui part a l'IA, plafonne a 8 (64 % jamais envoyes).
   *Une lecture partielle etait indiscernable d'une lecture complete.* */
const LIRE_COMPLET  = 'COMPLETE';   // tout le document a ete lu
const LIRE_PARTIEL  = 'PARTIAL';    // lu, mais pas en entier -> JAMAIS traite comme un succes
const LIRE_INCONNU  = 'UNKNOWN';    // rien d'exploitable -> on peut descendre d'un cran

// { etat, lignes|pages, pagesLues, pagesTotal, raison }
//   · `raison` n'est rempli que pour PARTIAL et UNKNOWN, et elle NOMME la cause
//     ('plafond_pages' | 'aucune_couche_texte' | 'colonnes_absentes' | 'illisible')
//   · elle n'est JAMAIS un message d'interface : l'affichage se decide chez l'appelant
```

⛔ **`raison` est un code, pas une phrase.** Un message d'interface dans une fonction de lecture,
c'est un second propriétaire du texte affiché — et ils divergeront (**R2**).

### A.4 L'ordre de migration, et pourquoi

| Étape | Quoi | Risque | Rollback |
|---|---|---|---|
| **A1** | `_pdfToText` + son **unique** appelant admin | ⭐ **quasi nul** — aucun chemin utilisateur | 1 fonction + 1 appelant : `git revert` |
| **A2** | `_pdfToImages` + **3** appelants (programme · historique · prise de sang) | moyen | 1 commit, 4 fichiers |
| **A3** | ⛔ l'appelant **repas** (`app.js`) | — | **HORS PÉRIMÈTRE** : nutrition. À faire par la session qui la tient, ou après son feu vert |

⚠️ **A2 est incomplet par construction tant que A3 n'est pas fait** : `_pdfToImages` aura 4
appelants dont **un** hors périmètre. Deux sorties possibles, **et c'est une décision à prendre,
pas un détail** : ① `_pdfToImages` change de forme et l'appelant nutrition **casse** (message
trompeur jusqu'à sa migration) ; ② on attend le feu vert nutrition pour A2 entier.
👉 **Je recommande ②** — casser un import de repas pour livrer un contrat serait précisément la
« correction silencieuse » que Michel interdit, à l'envers.

### A.5 Les témoins

| # | Témoin | Ce qu'il fige |
|---|---|---|
| ① | un PDF de 3 pages → `etat === 'COMPLETE'`, `pagesLues === pagesTotal === 3` | le cas normal |
| ② | ⭐ un PDF de **22** pages → `etat === 'PARTIAL'`, `pagesLues 15`, `pagesTotal 22`, `raison 'plafond_pages'` | **le défaut du jour, rendu observable** |
| ③ | un PDF sans couche texte → `etat === 'UNKNOWN'`, `lignes.length === 0` | le droit de dire « je ne sais pas » |
| ④ | ⛔ **de SOURCE** : chaque appelant de `_pdfToText`/`_pdfToImages` lit `.etat` | *sans lui, une migration incomplète est verte* |
| ⑤ | ⛔ **de SOURCE** : `'COMPLETE'`/`'PARTIAL'`/`'UNKNOWN'` ne sont écrits qu'**aux constantes** | pas de littéral recopié (**R2**) |
| ⑥ | `raison` est **vide** quand `etat === 'COMPLETE'` | une raison sur un succès est un signal faux |
| ⑦ | `pagesLues <= pagesTotal`, les deux `> 0` quand le fichier s'ouvre | l'arithmétique du compteur |

**Contrôles négatifs à faire mordre** (chacun doit rougir) : le plafond retiré → ② rouge ·
`etat` toujours `COMPLETE` → ①②③ · `pagesTotal` recopié depuis `pagesLues` → ② · un appelant
remis à l'ancienne forme → ④ · un littéral `'PARTIAL'` réécrit à la main → ⑤.

### A.6 Compatibilité arrière et rollback

- **Aucune donnée stockée ne change.** Le contrat vit **entre deux fonctions**, jamais dans `S`
  ni dans `localStorage` → **rien à migrer, aucun risque pour les données**.
- **Rollback** : `git revert` du commit. Aucune donnée écrite, aucun état à défaire.
- ⛔ **Le plafond `MAX_PAGES` ne bouge pas dans ce chantier.** On le rend **visible** d'abord.
  Le relever est une **décision produit séparée** (coût mémoire sur un vieil iPhone, durée de
  lecture, taille d'envoi à l'IA) — et elle se prendra en **voyant** le chiffre.

---

## PARTIE B — LE LECTEUR CSV D'HISTORIQUE

### B.1 ⭐⭐ Le point d'injection existe déjà, et il est haut

**Mesuré** : tout l'aval de l'import d'historique est **déjà écrit et éprouvé**.

```
  [ IA aujourd'hui ]                    [ CSV demain ]
  images -> 3 appels                    fichier -> 0 appel
          \                            /
           v                          v
                _histExtracted = { sessions:[...] }     <-- LE POINT D'INJECTION
                          |
                          v
            _vmMatchHist()        rattache les noms au catalogue EXLIB
                          |
                          v
            _renderHistPreview()  apercu + DETECTION DE CONFLITS avec l'existant
                          |
                          v
            histGoStep(4)         <-- LA CONFIRMATION DE LA PERSONNE
                          |
                          v
            finalImportHist()     validation des dates et des series, ecriture
```

👉 ***Le lecteur CSV n'a donc qu'UN seul travail : produire `{sessions:[...]}` à la même forme que
l'IA.*** Le rattachement au catalogue, l'aperçu, les conflits, la confirmation, la validation
(`_dateImportValide`, `_serieValide`) et le comptage des rejets **existent déjà**.

⭐ **Et la consigne « aucune écriture avant confirmation » est satisfaite gratuitement** : l'écran
d'aperçu **est** la confirmation, et `finalImportHist` est le seul écrivain.

### B.2 ⛔⛔ Deux pièges mesurés dans le lecteur existant — à connaître avant de le réutiliser

Le patron de la balance est le bon, **mais il ne lit pas nos fichiers tels quels** :

| Piège | Mesuré | Conséquence |
|---|---|---|
| ⛔ **le séparateur** | `_csvSplit` (tracking.js) découpe sur **`,`** · `_csvFichier` (setup.js) écrit avec **`;`** | toute la ligne tombe dans **une seule cellule** |
| ⛔ **le BOM** | l'export préfixe `﻿` · `_scaleColMap` teste `h === 'date'` | le 1ᵉʳ en-tête devient `﻿date` → **introuvable** |

⭐ **Bonne nouvelle : ça échoue FERMÉ.** Sans en-tête reconnu, le parseur rend
`{err:'colonnes introuvables'}` — il **n'invente rien**. *Mais il dirait « je ne sais pas » sur un
fichier qu'on a nous-mêmes écrit*, et personne ne comprendrait pourquoi.

👉 **Donc `_csvSplit` devient le propriétaire unique du découpage, avec le séparateur en paramètre**
(**R2** : pas un second découpeur), et le BOM se retire **à l'entrée, une fois**.

### B.3 La correspondance colonnes → objet métier

Parsing **par nom de colonne**, jamais par position, conformément à sa consigne.

| Colonne CSV | Va vers | Obligatoire ? | Si absente |
|---|---|---|---|
| `date` | `session.date` | ⛔ **oui** | **UNKNOWN** — sans date, rien n'est plaçable |
| `exercise` | `exercise.name` | ⛔ **oui** | **UNKNOWN** |
| `kg` | `set.kg` | ⛔ **oui** | **UNKNOWN** |
| `reps` | `set.reps` | ⛔ **oui** | **UNKNOWN** |
| `seance` | `session.label` | non | libellé vide |
| `type` | `set.type` | non | `''` (normal) |
| `set_num` | ordre des séries | non | ordre du fichier |
| `rir` | `set.rir` | non | ⛔ **vide, JAMAIS 0** (ft-v1038) |
| `volume` | ⛔ **ignoré** | — | ⭐ **c'est une valeur CALCULÉE : la relire ferait un 2ᵉ propriétaire du volume (R2)** |
| *toute colonne inconnue* | ignorée | — | ⭐ **tolérance demandée, et elle est gratuite** avec un parsing par nom |

⛔ **`volume` est le point de conception** : il est dans le fichier, il est tentant, et le relire
serait **faux** — si quelqu'un corrige une charge dans le tableur, le volume ne suit pas, et deux
sources se contredisent. **On recalcule, toujours.**

### B.4 ⛔ Ce que le lecteur ne saura PAS faire — dit d'avance

| Cas | État |
|---|---|
| **le CARDIO** | l'export l'aplatit en une ligne `type = CARDIO`, la durée dans `reps`, et le moment (`avant`/`après`) **dans le libellé de séance**. Le relever demande de reconstruire `cardioAvant`/`cardio`, que `_histExtracted` **ne porte pas**. ⛔ **Hors périmètre de la v1, écrit ici pour ne pas passer pour un oubli (R30)** — et le lecteur doit **le dire** : *« N lignes de cardio ignorées »*, jamais les avaler en silence |
| **le poids de corps, l'âge, le sexe** | ⭐ **volontairement absents de l'export** (le PDF le dit lui-même). Rien à relire |
| **les séries non validées** | jamais exportées. Un aller-retour ne peut pas les recréer |

### B.5 `formatVersion` — la compatibilité arrière, dans les deux sens

Sa position : *« favorable à l'ajouter, mais il ne doit pas rendre illisibles les anciens exports »*.

| | Règle |
|---|---|
| **à l'écriture** | une colonne `format_version` en **dernière position**, valeur `1`. ⭐ **Ajoutée en dernier, un tableur qui ignore la colonne n'est pas décalé** |
| **à la lecture** | **colonne absente → `version = 0`, et on lit quand même.** Un export d'avant aujourd'hui reste parfaitement lisible |
| ⛔ **version plus RÉCENTE que le lecteur** | on lit ce qu'on comprend et on rend **`PARTIAL`** avec `raison:'version_inconnue'` — *pas* UNKNOWN : les colonnes obligatoires sont là, c'est une lecture **incomplète**, pas impossible |
| ⛔ **ce que la version ne fait PAS** | elle **ne remplace pas** le parsing par nom. Elle explique un écart ; elle ne décide pas de la lecture |

⚠️ **Et le constat honnête** : ajouter la colonne **change le fichier produit aujourd'hui**, donc
c'est une modification de l'**export**, pas seulement de l'import. À faire dans le **même** commit
que le lecteur, sinon on livre un lecteur qui cherche une version que rien n'écrit.

### B.6 Les témoins

| # | Témoin | Ce qu'il fige |
|---|---|---|
| ① | ⭐ **aller-retour** : un CSV produit par `exportHistoCsv` est relu → **mêmes séances, mêmes séries, mêmes charges** | le cas central |
| ② | colonnes dans un **ordre différent** → même résultat | le parsing par **nom** |
| ③ | une **colonne en plus**, inconnue → même résultat | la tolérance |
| ④ | `kg` absent → **UNKNOWN**, raison `colonnes_absentes`, **0 écriture** | le refus explicite |
| ⑤ | fichier sans `format_version` → **lu**, `version = 0` | ⛔ **la compatibilité arrière** |
| ⑥ | `format_version = 99` → **PARTIAL**, pas UNKNOWN | la version future |
| ⑦ | séparateur `;` **et** BOM → lus | ⛔ **les deux pièges mesurés en B.2** |
| ⑧ | un nom d'exercice contenant `;` entre guillemets → **une seule cellule** | l'échappement réel |
| ⑨ | ⛔ `rir` vide → reste **vide**, jamais `0` | ft-v1038 |
| ⑩ | ⛔ `volume` du fichier **ignoré** ; un volume faux dans le fichier ne ressort pas | **R2** |
| ⑪ | lignes `type = CARDIO` → **comptées et annoncées**, pas avalées | B.4 |
| ⑫ | ⛔ **aucune écriture** dans `S` avant `finalImportHist` | la confirmation |
| ⑬ | ⛔ **0 appel réseau** sur tout le chemin | l'autonomie |
| ⑭ | une date invalide dans le fichier → **séance écartée et comptée** | on réutilise `_dateImportValide` |

**Contrôles négatifs** : découpage sur `,` → ⑦ rouge · BOM non retiré → ⑦ · lecture par position →
② · colonne obligatoire non vérifiée → ④ · `volume` relu → ⑩ · `rir` replié sur 0 → ⑨ · écriture
avant confirmation → ⑫ · un `fetch` ajouté → ⑬.

### B.7 Compatibilité arrière, rollback, comportement hors ligne

| | |
|---|---|
| **Données existantes** | ⛔ **rien n'est migré**. Le lecteur **ajoute** un chemin d'entrée ; l'import IA reste **intact et inchangé** |
| **Anciens exports** | ✅ lus (témoin ⑤). C'est la raison d'être de `version = 0` |
| **Hors ligne** | ✅ **total** — le lecteur de tableur est **déjà embarqué et déjà dans le précache** |
| **Rollback** | retirer le bouton → le chemin devient inatteignable, **sans rien défaire** : aucune donnée n'a été écrite par lui qui ne l'aurait été par l'import IA |
| **Quota** | ⛔ **à décider** : l'import de journal est limité à **1 gratuit**. Un import **sans appel IA** doit-il consommer ce quota ? *Mon avis : non — le quota paie l'IA.* **Mais c'est une décision produit, pas une évidence technique** |

---

## PARTIE C — LES TÉMOINS DE NON-APPEL

Sa demande : instrumenter **uniquement au banc**, avec des compteurs temporaires, sans transformer
le code de production.

⭐ **C'est faisable sans toucher à une ligne de production** : le banc charge déjà l'app dans un vrai
navigateur, et ces fonctions sont globales. On les **enveloppe au banc**, on compte, on restaure.

```js
// AU BANC UNIQUEMENT — jamais dans un fichier servi.
const compteurs = {};
// ⚠️ NOMS REELS, VERIFIES DANS LE CODE — pas devines. `_ocrRapportBalance` est le lecteur OCR
//    (tracking.js:1514), et il rend deja `null` quand il ne sait pas (R33). Le cran IA se compte
//    sur `_histAnalyzeBatch` (log.js) cote historique, `analyzeImportPhotos` cote programme.
['_pdfToText','_pdfToImages','_ocrRapportBalance','_histAnalyzeBatch'].forEach(nom=>{
  const vrai = window[nom]; compteurs[nom] = 0;
  window[nom] = function(...a){ compteurs[nom]++; return vrai.apply(this, a); };
});
// ... on joue le scenario ...
// puis on RESTAURE, sinon le temoin suivant compte les appels du precedent.
```

| Scénario | PDF | OCR | IA |
|---|---|---|---|
| CSV reconnu | **0** | **0** | **0** |
| PDF texte complet | 1 | **0** | **0** |
| PDF sans texte, OCR réussi | 1 | 1 | **0** |
| tous les crans locaux échouent | 1 | 1 | **1** |
| résultat `PARTIAL` | — | — | ⛔ **jamais traité comme `COMPLETE`** |

⚠️ **Trois pièges de cette technique, dits d'avance parce qu'ils mordront** :
① **restaurer entre chaque scénario**, sinon un compteur non remis à zéro rend un témoin vert pour
la mauvaise raison ; ② **un compteur à 0 parce que la fonction n'existe pas** est indiscernable d'un
non-appel légitime → **vérifier que chaque nom enveloppé existe** avant de compter ; ③ ⛔ **le
contrôle sain d'abord** : sur un scénario où l'IA *doit* être appelée, le compteur doit valoir 1 —
*sinon l'instrument est mort et tous les « 0 » sont faux* (`BUGS.md` §61).

---

## Ordre d'exécution proposé

| # | Chantier | Feu vert nécessaire ? |
|---|---|---|
| **1** | **A1** — le contrat sur `_pdfToText` + son appelant admin | ⭐ le moins risqué du projet |
| **2** | **B** — le lecteur CSV d'historique (+ `format_version` à l'export) | ⚠️ **2 décisions produit** : le quota · le cardio |
| **3** | **A2** — le contrat sur `_pdfToImages` (3 appelants) | ⛔ **dépend du feu vert nutrition** (A3) |
| **4** | **C** — les témoins de non-appel | après 1 et 2 |
| **5** | pdf.js embarqué, puis la cascade | après tout ce qui précède |

## ⚠️ Les décisions qui t'attendent, et elles sont courtes

1. **Le quota** — un import d'historique **sans IA** consomme-t-il le quota gratuit ? *(mon avis : non)*
2. **Le cardio** — ignoré et annoncé en v1, ou attendu dès la v1 ? *(mon avis : ignoré et annoncé)*
3. **A2 sans la nutrition** — on attend son feu vert, ou on casse temporairement l'import de repas ?
   *(mon avis : on attend)*
4. **`MAX_PAGES`** — une fois la troncature visible, on relève ? on prévient ? on découpe ?
   *(à décider en voyant le chiffre, pas avant)*

## Ce que ce document NE fait pas

⛔ aucune ligne de production modifiée · ⛔ aucun contrat écrit · ⛔ aucun lecteur CSV écrit ·
⛔ `MAX_PAGES` inchangé · ⛔ pdf.js toujours hors du dépôt · ⛔ nutrition non approchée ·
⛔ contexte de Milo intact · ⛔ règles de progression non codées.
