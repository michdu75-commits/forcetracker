# 🧠 Les décisions de la MÉMOIRE LONGUE (18/09/2026) — ce qui est retrouvé, ce qui ne l'est pas

> **Créé le 20/09/2026.** ⛔⛔ **CE FICHIER NE DÉCIDE RIEN.** Il **restitue** des décisions déjà
> prises par Michel le 18/09/2026, en citant **la source exacte** de chacune, et il **nomme les
> trous** plutôt que de les combler de mémoire.
>
> **Pourquoi il existe** : l'étude de direction du 20/09 a mesuré que plusieurs documents de
> passation invoquent « **M1→M14** » comme un acquis, alors que **seules M12, M13 et M14 étaient
> traçables dans le dépôt**. Une décision qu'on ne retrouve pas ne peut pas être honorée — et
> *rapatrier une décision de mémoire fabriquerait une fausse attribution*, ce que
> `docs/DECISIONS.md` existe précisément pour empêcher.

---

## 0. ⚠️ LE PIÈGE PRINCIPAL, À LIRE AVANT TOUT LE RESTE

Il existe **trois numérotations différentes** pour ces décisions, et **elles ne se correspondent
pas**. Quiconque écrit « M7 » sans dire de quelle numérotation il parle produit une phrase
invérifiable.

| numérotation | où elle vit | ce qu'elle numérote |
|---|---|---|
| **`D1`→`D6`** | `tools/gen_memoire_longue_pdf.py` (matin du 18/09) | les **questions** rendues à Michel |
| **« décision 1 »→« décision 10+ »** | `tools/gen_memoire_archi_pdf.py` (après-midi du 18/09) | les **décisions actées** par Michel |
| **`M1`→`M14`** | messages de commit · `docs/JOURNAL-DE-PARTAGE.md` · `capacites-ia.js` | *prétend* numéroter les mêmes décisions |

⛔⛔ **ET LES DEUX DERNIÈRES SONT DÉMONTRABLEMENT INCOMPATIBLES.** `capacites-ia.js` inscrit
`decisionSource: 'Michel, arbitrage Q3 (M12)'` — or **`Q3` a été posée le 18/09 au SOIR**, dans le
dossier d'architecture, comme une question **encore ouverte** (*« La question reste ouverte et
n'est pas tranchée par cette passe »*). 👉 ***`M12` ne peut donc pas être la 12ᵉ des 14 décisions
de l'après-midi : c'est la réponse à une question posée APRÈS elles.***

⭐ **La conséquence pratique, et elle est simple** : on cesse d'employer les étiquettes `M<n>`
ailleurs que là où elles sont déjà écrites (`capacites-ia.js`), et on désigne chaque décision par
**son énoncé**, qui lui est vérifiable.

---

## 1. LA CHRONOLOGIE RÉELLE, RETROUVÉE DANS GIT

| quand | commit | ce qui s'est passé | trace |
|---|---|---|---|
| **18/09 matin** | `4ee36997` | étude d'architecture de la mémoire longue, **lecture seule** → **6 questions** rendues à Michel | `tools/gen_memoire_longue_pdf.py` |
| **18/09 19:40→21:10 UTC** | `d86a7f10` | *« Michel a **acté 14 décisions** après l'étude du matin »* → dossier d'**architecture de référence** | `tools/gen_memoire_archi_pdf.py` + `docs/JOURNAL-DE-PARTAGE.md` |
| **18/09 soir** | `65d32b17` | *« Michel a arbitré **Q1 à Q5** et acté **M1 à M14** »* → `capacites-ia.js`, 21 capacités | message de commit |

⚠️ **Le commit `65d32b17` AFFIRME « M1 à M14 » et ne les énumère nulle part.** C'est le défaut
d'origine : *une phrase de passation a remplacé la liste, et la phrase a survécu à la liste.*

---

## 2. ✅ CE QUI EST PROUVÉ — 8 décisions, citées textuellement

**Source** : `tools/gen_memoire_archi_pdf.py`, tableau **« DÉCISIONS DÉSORMAIS ACTÉES (rappelées,
jamais rouvertes) »**. Le générateur tourne encore (**33 gardes**, vérifié le 20/09) et relit sa
propre sortie.

⭐ **Et la numérotation par position est corroborée quatre fois, indépendamment** : le corps du
même dossier renvoie à « décision **3** », « décision **4** », « décision **6** » et
« décision **7** » — et les quatre tombent **exactement** sur les rangs 3, 4, 6 et 7 du tableau.
*Quatre coïncidences de rang ne sont pas une coïncidence.*

| rang | la décision (texte du dossier) | conséquence architecturale écrite le 18/09 |
|---|---|---|
| **1** | **les faits déterministes sont conservés pour tous** | aucune ligne à écrire : **c'est déjà le cas**, et sans IA |
| **2** | **les conversations brutes ne sont pas une mémoire** | le fil reste **local et borné** ; seule la mémoire structurée voyage |
| **3** | **un résumé IA ne devient jamais la source de vérité** | la chaîne plate `coachMemory` cesse d'être le support ; elle devient **au mieux une vue** |
| **4** | **trois niveaux A / B / C** | portés par `source` (interface · conversation · déduction) et `status` (proposé vs validé) |
| **5** | **ancien ≠ supprimé** | porté par `status` + `type`, **jamais par une purge liée à l'âge** |
| **6** | **fait actuel et fait historique coexistent** | porté par `remplacePar` — **le seul champ vraiment neuf** |
| **7** | **une suppression importante est un événement explicite** | **le plus gros manque** : rien n'existe aujourd'hui |
| **8** | **le rattrapage est une capacité distincte** | le registre central **prévoit 21 lignes** (et il en porte 21) |

### ✅ Une neuvième, prouvée par deux renvois convergents

| | |
|---|---|
| **« décision 10 »** | **les données déterministes se lisent sans appel IA** — *« l'information est déjà structurée, la lire ne coûte aucun appel »* · et dans le tableau des coûts : *« **0 appel IA**, par construction »* |

⚠️ **Elle est prouvée dans son ÉNONCÉ, pas dans son rang** : le tableau ne porte que 8 lignes, donc
« décision 10 » vit **hors** du tableau. Les rangs 9 et 11→14 ne laissent **aucune trace**.

---

## 3. ⛔ CE QUI N'EST PAS RETROUVÉ — **NON DÉCIDÉ (arbitrage de Michel, 20/09/2026)**

**14 décisions annoncées · 9 retrouvées · 5 manquantes.** Elles ne sont ni dans git, ni dans les
journaux, ni dans les générateurs, ni dans aucun document du dépôt.

### ⚖️ L'ARBITRAGE EST RENDU — Michel, 20/09/2026

> ***« Ne plus présenter M1-M11 comme une série fiable de décisions de Michel. »***
> Les 5 éléments introuvables ne doivent **ni être reconstruits de mémoire · ni être déduits · ni
> être attribués à Michel · ni devenir des contraintes produit par héritage documentaire.**
> Ils restent **NON DÉCIDÉS**, et redeviendront une question **le jour où le cas se présentera**.

⭐ **Et la borne sur la forme, qui compte autant** : *« Ne renumérote pas artificiellement
l'ensemble pour refaire une belle série M1-M14. **La vérité historique vaut plus qu'une
numérotation propre.** »* Les étiquettes **M12, M13, M14** restent légitimes **là où elles sont
prouvées** (`capacites-ia.js`) ; partout ailleurs, une décision se désigne par **son énoncé**.

⛔ **Elles ne sont donc pas reconstituées ici**, et ce n'est plus seulement de la prudence : c'est
une **contrainte du projet** (**règle d'or #15**).

⚠️ **Ce que « non décidé » veut dire exactement, pour éviter la lecture facile** : ce n'est pas
*« ça n'a pas d'importance »*, c'est *« personne ne peut dire aujourd'hui ce qui a été tranché »*.
Un chantier qui a besoin de l'une de ces cinq réponses **doit la demander**, pas la supposer.

---

## 4. ⚠️⚠️ UNE PRÉMISSE FAUSSE, MESURÉE — quatre « décisions » n'en sont pas

Le brief du 20/09 énumère **onze** énoncés comme des décisions de Michel. **Sept le sont** (ce sont
les rangs 1→7 ci-dessus). **Quatre ne le sont pas** : ce sont les **« comportements attendus » des
cas adversariaux** du dossier du 18/09 — *écrits par Claude dans l'étude*, jamais arbitrés.

| l'énoncé du brief | ce que c'est réellement |
|---|---|
| *« Premium → FREE : mémoire construite **gelée**, pas détruite »* | **cas adversarial n°9**, colonne « comportement attendu » |
| *« **accumulation** des faits en FREE »* | **le même cas n°9**, la même cellule |
| *« retour Premium : traiter uniquement le **delta** »* | **le même cas n°9**, la même cellule |
| *« conversations perdues jamais présentées comme **reconstruites** »* | **cas n°1** + le risque *« la fausse promesse »* |

> La cellule entière du cas 9 dit : ***« mémoire gelée, faits accumulés, delta seul au retour. »***
> Un seul attendu de test, découpé en trois décisions par la passation.

⚖️ **À dire sans exagérer, parce que la nuance compte** : ces attendus sont **probablement
conformes** à ce que veut Michel — ils ont été écrits à partir de son cadrage, et le dossier note
que *« l'accumulation des faits fonctionne déjà »*. ⛔ **Mais « probablement conforme » n'est pas
« arbitré ».** Les classer *décidés* reviendrait à transformer **ma propre proposition** en
contrainte du projet, sous le nom de Michel.

👉 ***C'est exactement le défaut que le registre des décisions existe pour fermer, à un endroit où
il ne regardait pas : non pas une décision prise sans être vue, mais une PROPOSITION devenue
décision en changeant de document.***

---

## 5. 🧩 CE QUE LE CODE FAIT DÉJÀ DE CES DÉCISIONS (mesuré le 20/09)

| la décision | état du code aujourd'hui |
|---|---|
| **1** — faits déterministes pour tous | ✅ **EXISTANT** — `computeRegistreFacts()` (`tracking.js`), 7 faits, recalcul complet, **0 appel IA** |
| **2** — la conversation brute n'est pas une mémoire | ✅ **EXISTANT** — le fil est borné et local ; `registre` part au nuage, pas le fil |
| **3** — un résumé IA n'est pas la source de vérité | ⛔ **NON TENU** — `S.coachMemory` est un résumé Haiku, **persisté** au profil cloud et **réinjecté** à chaque message, **sans provenance ni date ni statut** |
| **4** — trois niveaux A / B / C | ✅ **EXISTANT** — `registre.observations` porte `source` et `status` (`pending` · `validated` · `rejected`) |
| **5** — ancien ≠ supprimé | 🟡 **PARTIEL** — les statuts existent ; le champ `type` n'existe pas |
| **6** — fait actuel / fait historique | 🟡 **PARTIEL** — le patron existe **deux fois** (blessures `{zone,status,since}` · `goalLog {date,de,vers,src}`) ; `remplacePar` n'existe pas sur une observation |
| **7** — la suppression est un événement | ⛔ **INEXISTANT** — une suppression est un `filter`, elle ne laisse rien |
| **8** — le rattrapage est une capacité | ✅ **EXISTANT dans le registre** — `milo.memory.backfill`, `etatCode: 'INEXISTANT'` (déclarée avant d'être bâtie, exprès) |
| **« 10 »** — le déterministe ne coûte aucun appel | ✅ **EXISTANT** — vérifié : ni `computeRegistreFacts` ni `_memoireLongue` n'appellent le réseau |

⭐ **Le constat du 18/09 tient toujours** : *on ne construit pas un modèle, on en généralise un qui
tourne déjà.* **Six des sept champs** demandés existent dans `registre.observations`.

---

## 6. 🔗 CE QUE CE FICHIER N'EST PAS

⛔ **Ce n'est pas un second registre des décisions.** `docs/DECISIONS.md` reste le registre
(**R2**) ; ce fichier est une **trace de source**, que le registre pourra **référencer sans la
recopier** (règle 4 du registre : *il référence, il ne recopie pas*).

⚠️ **Et il n'y entre pas tout seul** : ces décisions sont **antérieures** au registre (18/09 contre
19/09), et le registre dit lui-même qu'il *« ne prétend pas être complet »*. Les y faire entrer est
un geste de gouvernance qui appartient à Michel — pas un effet de bord de cette restitution.

*Lié à : `tools/gen_memoire_archi_pdf.py` (la source) · `tools/gen_memoire_longue_pdf.py` (l'étude
du matin) · `capacites-ia.js` (M12/M13/M14, les seules étiquettes `M` légitimes) ·
`docs/DECISIONS.md` (le registre) · **R2**, **R23**, **R27**, **règles d'or #15 et #16**.*
