# 🔥 TDEE V2 — étape 1 : la dépense du jour, séparée de l'objectif (une INFORMATION, rien d'autre)

> **GO de Michel du 06/11/2026** (« GO DÉVELOPPEMENT TDEE V2 », sur la base de l'audit du même jour) — session-C (Claude N°2, Séance). Branche `claude/dreamy-bell-pu88ia`, repartie de master `e2b942f3` (`ft-v1263`).
> ⛔ **NON FUSIONNÉ · NON PUBLIÉ · AUCUN DÉPLOIEMENT · `Code.js`, `setup.js` et la synchronisation NON TOUCHÉS · aucune donnée persistée · aucune route serveur · aucune intégration Apple Santé · aucun numéro de version** (`sw.js` reste `ft-v1263`). **État : voir §11.**
> Ce document est la **mémoire** du chantier : ce qui est construit (§2-§5), ce qui ne l'est PAS et pourquoi (§6), les tests (§7), les compteurs R17 (§8), les limites (§9), les dépendances avec Claude Principal (§10), l'état final (§11).
> L'**audit** qui a conduit à ce GO est un PDF **hors du dépôt** (le dépôt est public) : `FORCE-TRACKER-AUDIT-TDEE-V2-2026-11-06.pdf`. Ses faits établis ne sont pas refaits ici ; ils sont **épinglés par des témoins** (§7).

## 1. Ce que Michel demande (résumé fidèle)

1. **Un moteur de dépense, indépendant, testable, sans effet de bord**, qui sépare trois valeurs : la dépense quotidienne de **référence** · la dépense **estimée du jour** (avec **fourchette** et **provenance** des données) · l'**objectif alimentaire**.
2. **Fiabiliser les dépenses** (règles anti-doublons de l'audit) : calories **actives** et non brutes · valeurs de montre **préférées sans être crues infaillibles** · pas et activité du même effort **comptés une fois** · musculation habituelle **non ajoutée deux fois** · **aucune donnée de pas inventée**, aucun report des pas d'hier · valeurs absentes **signalées** · hypothèses **calibrées et vérifiées** avant de présenter un chiffre comme fiable.
3. **Préparer l'affichage Nutrition** : les trois valeurs distinctement, plus les **dépenses enregistrées** (musculation, cardio, autres activités) — **sans modifier automatiquement les calories à manger** (décision du 05/11 : l'affichage ne doit pas laisser croire que ce sont des calories supplémentaires autorisées).
4. **Préserver l'existant** : pas de changement du calcul actuel de l'objectif ni de son lien historique avec les pas · rien chez Claude Principal (`setup.js`, `Code.js`, synchronisation) · pas de donnée persistée, de route serveur, d'Apple Santé · pas de fusion, déploiement ou production · pas de refonte du chantier « Autre activité ».
5. **Valider** : repos · musculation · marche · randonnée 8 h · 40 000 pas · course 4 h · activités combinées, plus des tests **anti-doublons, d'historique, d'absence de données et de non-régression**.

⛔ **L'étape 2 (découpler les pas de l'objectif) N'EST PAS autorisée** — décision de Michel du 06/11 : elle reste à lui. Cette étape l'**explique**, elle ne la **fait pas** (§6).

## 2. Les trois valeurs — trois rôles, jamais l'une déduite de l'autre sans que ce soit dit

| Valeur | Ce qu'elle est | Qui la calcule | Ce qu'elle n'est PAS |
|---|---|---|---|
| **Référence** | ton niveau d'activité, **sans** le surplus de pas du jour : `BMR × niveau + travail + sport déclaré` | `depenseReference()` = `calcTDEE()` − `calcPasExtra()` (dérivée du propriétaire de la formule, **jamais recopiée**, R2) | pas une mesure ; elle ne bouge pas avec la journée |
| **Estimée aujourd'hui** | référence + ce que la journée a fait **de plus que d'habitude**, avec **fourchette** et **provenance** | `depenseEstimeeDuJour()` (façade) → `depenseDuJour()` (moteur pur) | **pas** une cible, **pas** « tu peux manger plus » ; une **information** |
| **Objectif alimentaire** | ta cible du jour | `calcMacros()` — ⛔ **INCHANGÉ** | n'en dépend pas ; la carte dit seulement la part des pas que **la règle actuelle** y met encore |

Rien d'absent n'est comblé : une valeur qu'on n'a pas s'écrit « — » **et dit pourquoi** (R29). Un jour sans aucune donnée **n'est pas « +0 »** : c'est « je ne sais pas » (`connu:false`).

## 3. Les sept règles qui empêchent le doublon (chacune a sa propriété, ses témoins et sa mutation)

| # | Règle | Ce que fait le moteur | Ce que le doublon aurait été |
|---|---|---|---|
| ① | **Actif, pas brut** | la référence contient déjà le repos de chaque heure : on n'ajoute que `brut − 1 MET × poids × durée`. `kcalBloc` range le BRUT dans `calories` | 8 h de randonnée comptées 3 936 au lieu de 3 280 (le repos de 8 h, 656 kcal, compté deux fois) |
| ② | **Une seule preuve par intervalle** | énergie active du jour mesurée > valeur de montre > estimation de l'app > pas. Jamais deux pour la même plage | la montre **s'ajoutait** à l'estimation |
| ③ | **Les pas d'un entraînement sont déjà payés par lui** | ses pas (ceux de la montre, sinon cadence × durée) sont retirés du total du jour **avant** de regarder le surplus de pas | randonnée 8 h : 36 000 pas payés par la randonnée **et** par le surplus de pas |
| ④ | **La musculation n'est pas additive ; l'habitude est déjà dans la référence** | séance de muscu : « déjà dans ton niveau d'activité », +0 ; on déduit `max(médiane des jours observés, sport déclaré +150)` — jamais leur somme | la séance habituelle comptée deux fois (ft-v949 avait déjà corrigé la même famille de défaut) |
| ⑤ | **Le même entraînement ne compte qu'une fois** | saisie + import = une ligne (même famille, début ± 10 min, durée ± 25 %) ; tri sur un **ordre total**, l'ordre d'arrivée ne change rien | une marche saisie à la main ET reçue de la montre comptée deux fois |
| ⑥ | **Une montre n'est pas un instrument** | sa valeur est préférée mais **bornée** entre 0,5× et 2× l'estimation active ; chaque chiffre porte une **fourchette** ; plafond de plausibilité 2 × le métabolisme de base | une montre saisie à 0 (capteur absent) ou à 5 000 pour 2 h de marche |
| ⑦ | **Un jour ne reçoit que ses propres données** | les pas sont ceux du **même jour** ; aucun report d'hier ; sans donnée, `connu:false` et l'absence est **dite** | mesuré sur la version publiée : à 08 h, **les pas d'hier** valaient +435 kcal sur la cible d'aujourd'hui |

## 4. Les hypothèses — ce qui les appuie, dit sans enjolivure

> ⚠️ **Aucune donnée réelle de montre n'est accessible** (le test T50 de l'autre chantier reste BLOCKED). Rien ci-dessous n'est présenté comme **mesuré** : « VÉRIFIÉ » veut dire « confirmé par une source publiée », jamais « mesuré chez Michel ». C'est pour cela que **chaque chiffre porte une fourchette** et que la carte écrit « estimation, pas une mesure ».

| Paramètre | Valeur | Statut | Source / raison | Sensibilité mesurée |
|---|---|---|---|---|
| Pas par km | 1 300 | **repris** de `_pasEcart` (R13) | l'existant | M36 : l'estimée de S5 change dès qu'on le touche |
| Coût de la marche | 0,5 kcal/kg/km | **VÉRIFIÉ** | coût **net** de la marche des équations ACSM (0,1 mL O₂/kg/m ≈ 100 mL/kg/km ≈ 0,5 kcal/kg/km) ; `docs/CALORIES-SOURCES.md` §1 | K07 : la fourchette de S5 contient le milieu de la référence indépendante |
| Seuil de surplus de pas / jours minimum | 1 500 / 7 | **repris** de `_pasEcart` | l'existant ; ici la rampe est **continue** (la règle actuelle saute de 0 à 47 kcal) | P19 |
| Cadence marche 100 · marche sportive 115 | pas/min | **VÉRIFIÉ** | ≥ 100 pas/min = marche d'intensité modérée (3 MET), 100-119 = marche rapide (Tudor-Locke et coll., *Br J Sports Med*, 2018) | K03 |
| Cadence course 165 | pas/min | **PLAUSIBLE, non mesuré** | cadence d'un coureur de loisir (en général < 170) | K03, K08 |
| Cadence randonnée 75 | pas/min | **NON VÉRIFIÉ** | la littérature dit seulement que la cadence **baisse** en montée | K03 : ± 20 % sur TOUTES les cadences déplacent l'estimée de **moins de 10 %** |
| Cadence balade 85 · tapis 105/125/160 | pas/min | hypothèses | — | K03 |
| Vélo, rameur, elliptique, corde | 0 | choix | aucun pas retiré : un doublon résiduel est **possible, et dit** | — |
| Fourchettes | ± 20 % montre · ± 25 % estimation · ± 40 % randonnée · ± 30 % pas | hypothèses de conception | `docs/CALORIES-SOURCES.md` §8 cite ± 24 % entre personnes | K06 : chaque fourchette annoncée contient le milieu d'une **référence physiologique indépendante** (ACSM + barème MET) |
| Couloir de la montre | 0,5×–2× | hypothèse | une valeur hors couloir est bornée **et dite** | K04, K05 |
| Plafond de plausibilité | 2 × BMR | hypothèse | filet de sécurité, jamais atteint par les scénarios de l'audit | P15 |

**À calibrer sur un export réel** (pas, entraînements, calories de montre) **avant** tout chiffre « fiable » : les cadences non vérifiées, les fourchettes, le couloir, le plafond. En attendant, la carte dit « estimation, pas une mesure » et donne la fourchette.

## 5. Où vit quoi (architecture)

- **Le moteur pur** `depenseDuJour(profil, jour, hist)` — `tracking.js`, entre les repères `// ⟦DJ:DEBUT⟧` et `// ⟦DJ:FIN⟧`. **N'écrit rien, ne lit ni `S`, ni le DOM, ni le stockage, ni le réseau, ni l'horloge, ni le hasard**, n'a **aucun barème MET** à lui (l'estimation brute lui est fournie par `kcalBloc`, le propriétaire, R2). Paramètres **gelés** (`Object.freeze`). Les témoins l'extraient du vrai fichier et le rejouent **dans Node, sans navigateur**.
- **Les adaptateurs** (impurs, ils **lisent** `S`, n'écrivent jamais) — `_djEntrainementsDe`, `_djHistorique`, `_djIndexSessions` : `S.sessions` (activités, cardio autonome ; la musculation est transmise pour être **dite**) et `S.healthDaily` (pas, du **même jour**). Une 3ᵉ source (énergie active de la montre) sera un 3ᵉ adaptateur : **le moteur ne bouge pas**.
- **La façade** `depenseEstimeeDuJour(date)` — un jour passé se rejoue avec ses seules données et celles d'**avant** lui.
- **L'affichage** `_renderDepenseJour()` — `screens.js`, la carte `#nu-dj` (`index.html`) juste sous les tuiles de séance de l'onglet Nutrition. Appelée par `renderNutrition` **dans un `try/catch`** : une erreur de la carte ne bloque jamais l'écran.
- **Aucun ancien chemin n'est touché** : `calcTDEE`, `calcMacros`, `_pasEcart`, `calcPasExtra`, `autoKcal` sont **identiques à l'octet** à la version publiée (témoins N01-N06).

### Sortie du moteur

`{ ref, connu, extra, estime, bande:{lo,hi}, bandeExtra:{lo,hi}, lignes:[{label,kcal,source,u,alerte?}], avert:[], manques:[], sources:[] }` — ou `null` si le profil ne permet pas de calcul (D-016 : aucun chiffre fabriqué). `manques` : `pas_du_jour`, `habitude_pas`. `source` d'une ligne : `montre` · `estimation` · `pas` · `dans_ton_niveau` · `aucune`.

## 6. Ce qui n'est PAS fait — et pourquoi

| Non fait | Pourquoi |
|---|---|
| **Découpler les pas de l'objectif** (étape 2) | **Pas autorisé** (décision de Michel, 06/11). La carte dit seulement la part des pas que la règle actuelle y met encore. Quand l'étape 2 viendra, `depenseReference` devra perdre sa soustraction — le témoin `C-TDEE-N05` la recalcule à part et rougira exprès. |
| Plafond de 500 kcal, falaise de 1 500 pas, report des pas d'hier **dans l'objectif** | Constats de l'audit sur la règle **actuelle**, **pinglés tels quels** (N03, N04) : les corriger changerait l'objectif. |
| Lire `S.healthInbox` (calories actives de la montre) | Les calories de la montre reçues restent « jamais reprises dans un calcul » (décision à Michel, commentaire de `setup.js`). Le moteur a la **place** de la connexion future (`energieJour`) mais **elle n'est pas branchée** (P23 la prouve sur le moteur seul). |
| Intégration Apple Santé, route serveur, donnée persistée | Hors périmètre. **Aucune** n'est ajoutée. |
| Aide « ? » de Nutrition (`_HELP_DATA`), Guide, point rouge, pop-up | Zone de Claude Principal (`screens.js`, 3 lignes de son côté) ; la règle d'or n°11 se fait **à la publication**, après sa fusion. Le témoin `C-TDEE-U18` interdit à cette branche d'y toucher. |
| Lignes `CLAUDE.md` / `BUGS.md` | Reportées à l'intégration (conflits connus sur ces deux fichiers, §10). |

## 7. Tests

### 7.1 Ce qui a été exécuté

| Contrôle | Résultat | Ce qu'il prouve |
|---|---|---|
| Banc `node tools/banc_tdee_v2.js` | **145 OK / 0 rouge** (≈ 36 s) · matrice **15 PASS · 0 FAIL · 0 NOT RUN** | le moteur (57 témoins SANS navigateur), les 7 scénarios de l'audit, les anti-doublons, l'historique, l'absence de données, la non-régression de l'objectif, les effets de bord, l'affichage |
| Contrôle négatif `python3 tools/mut_tdee_v2.py` | **74/74 conformes** : 71 mutations attrapées par **le témoin nommé** · 3 équivalentes qui ne rougissent pas · arbre sain à **0 rouge avant et après** | chaque règle, chaque garde de l'objectif et chaque ligne de l'affichage **rougit quand on la casse** (R17) |
| Banc « Autre activité » (le chantier voisin) | **131 OK / 0 rouge** | rien de ce chantier n'a bougé ; la liste blanche J30/J31 des lecteurs de `S.sessions` connaît les deux nouveaux lecteurs |
| Passe D-031 répartie `python3 tools/passe_repartie.py 3` sur `9b1b7094` | **8 507 ✅ / 9 ❌** (équivalent séquentiel 8 469 ✅ / 9 ❌, 48 min). **7 des 9 rouges sont déjà rouges sur la version publiée** (preuves rejouées par `differentiel_passe.py` : PS-E29 piégé par la date, le module `seance_ux` qui plante au même clic « Reprendre », B-UXI-G2/G3/G5/G7, B-FFD-⑧e). **Les 2 autres, B-UXI-F8 et F9, sont des échecs de CHARGE** : le module `ux_integration.js` rejoué seul donne 65 OK / 4 rouges **identiques sur la version publiée et sur cette branche**, et le **processus 2 rejoué SEUL** sur le même commit donne 1 293 ✅ / 6 ❌ — exactement les rouges préexistants, F8 et F9 verts. ⚠️ La passe n'est **pas « valide »** au sens de ses 8 conditions (rouges, module planté) : **aucun feu vert de publication**, comme pour « Autre activité ». | l'ensemble de l'application |
| `python3 tools/check_regles.py` | 1 échec, **identique sur la version publiée** (`e2b942f3`) : le tableau des 8 briques de `DOSSIER-ATHLETE-SUIVI.md` est périmé (`python3 tools/briques.py`) — sans rapport avec ce chantier | la gouvernance |
| Fusion à blanc avec la tête d'intégration de Claude N°1 (`a87cc89d`) | banc TDEE V2 : **145 OK / 0 rouge sur l'arbre fusionné** · banc « Autre activité » : 130 OK / 1 rouge — **`C-ACT-J30`** : `state.js::_persistRepli` (N°1) est une nouvelle lecture brute de `S.sessions` | les dépendances (§10) |

### 7.2 Les 145 témoins du banc (par bloc)

| Bloc | Témoins | Contenu |
|---|---|---|
| **P** · moteur pur (49) | P01-P07d · P10-P29e · P30-P32 | les **7 scénarios de l'audit au chiffre près** (repos, musculation 1 h, 2 h de marche, randonnée 8 h, 40 000 pas, course 4 h, combiné — chacun avec ses variantes « pas seuls », « saisie seule », « montre ») · **25 propriétés** rejouées sur des jeux pseudo-aléatoires (monotonie, aucun doublon pas/entraînement, même effort saisi ET importé = un seul, jamais négatif, plafond, continuité au seuil, actif ≤ brut − repos, indépendance de l'ordre et de la provenance, déterminisme, entrée non modifiée…) · **pureté lue dans la source** (aucune référence à `S`, au DOM, au stockage, au réseau, à l'horloge, au hasard ; paramètres gelés ; aucun barème MET) |
| **K** · calibrage (8) | K01-K08 | banc de sensibilité sain · **± 20 % sur TOUTES les cadences déplace l'estimée de moins de 10 %** · bornes exactes du couloir de la montre · **les fourchettes annoncées contiennent le milieu d'une référence physiologique indépendante** (ACSM + barème MET) · la **limite écrite** (la course vue par ses seuls pas est sous-estimée de plus de moitié) |
| **S** · façade dans la vraie app (18) | S101-S118 | les mêmes 7 scénarios par `depenseEstimeeDuJour()` dans le vrai navigateur · cardio autonome, cardio avant/après, musculation avec cardio, valeur de montre · **de bout en bout par le VRAI formulaire « Autre activité »** |
| **D** · anti-doublons (13) | D01-D13 | pas + marche = un effort · randonnée 8 h · course 4 h · actif et non brut · la montre remplace · muscu non additive · même effort saisi deux fois · deux marches distinctes · deux familles à la même heure · habitude déjà dans la référence · « autre sport » déclaré |
| **H** · historique (13) | H01-H13 | **aucun report des pas d'hier** · **le lien historique de l'OBJECTIF avec les pas n'est pas touché** · un jour passé se rejoue seul · minuit et fuseau (23 h 50, 00 h 30 à Paris) · base de pas hors entraînement · fenêtres de 28 et 30 jours · **un jour ne fait jamais sa propre habitude** |
| **A** · absence (10) | A01-A10 | aucune donnée = `connu:false` (jamais « +0 ») · pas connus mais pas aujourd'hui · jour à 0 pas · habitude inconnue (< 7 jours) · montre saisie à 0 · enregistrements abîmés · profil incomplet = aucun chiffre (D-016) |
| **N** · non-régression de l'objectif (9) | N01-N09 | **l'objectif est à l'octet celui de la version publiée** (valeurs mesurées sur master `e2b942f3` : repos 2 686 / 2 786 · S3 3 064 / 3 164 / +378 · S4-S7 3 186 / 3 286 / +500) · le lien historique avec les pas est intact (randonnée 36 600 pas : toujours +500) · `_pasEcart` inchangé, falaise et plafond compris · **`calcTDEE`, `calcMacros` et `autoKcal` ne citent ni le moteur ni l'affichage** (lecture de la source) · la référence recalculée **à part** sur 24 profils |
| **E** · effets de bord (5) | E01-E05 | **dès le premier appel** : aucune clé écrite, aucun réseau, aucune persistance ni synchronisation, `S` et le stockage identiques avant et après chaque appel de la V2 |
| **U** · affichage (19) | U01-U19 | trois valeurs distinctes avec leur propre chiffre · fourchette et provenance à l'écran · **l'objectif affiché est celui de `m-kcal`** · la note mot pour mot, **aucun mot qui invite à manger plus** · 390 et 320 px sans débordement · dépense enregistrée (jeu de référence de la mission, modification, suppression, fenêtre de 7 jours) · l'absence dite · source de la carte (n'écrit rien, try/catch) · **`_HELP_DATA` non touché** |

### 7.3 L'histoire du contrôle négatif (R17 : ce qui a failli passer)

La **première** campagne (72 mutations) n'en a attrapé que **58** par le bon témoin. Les 14 écarts étaient de vrais trous de témoins, pas des mutations mal posées :

| Mutation qui survivait | Ce qui manquait | Corrigé par |
|---|---|---|
| M54 la façade **écrit** dans `S` (`S._dj = r`) | E04 prenait son instantané **après** la première navigation : la clé créée au premier calcul était déjà là | E01-E04 refaits : les deux points d'entrée de la V2 sont observés **dès le tout premier appel**, les compteurs ne comptent que pendant eux |
| M09 les pas propres à l'entraînement ignorés | aucun témoin n'en portait | P29b |
| M13 habitude et sport déclaré **sommés** | D12 n'avait pas d'habitude en même temps | P26b |
| M18 / M21 fusion dépendante de l'ordre d'arrivée | les jeux aléatoires n'avaient jamais d'ex æquo | P29c |
| M19 fusion qui garde la durée la plus courte | tous les doublons testés avaient la même durée | P29d |
| M20 la fusion perd la valeur de la montre | idem | P29e |
| M37 l'historique commence **aujourd'hui** | des données constantes : la médiane ne bougeait pas | H13 (6 jours + aujourd'hui) |
| M42 le cardio fait **avant** ignoré | seul le cardio « après » était testé | S118 |
| M65 « 7 derniers jours » passe à 8 | aucune séance au bord de la fenêtre | U19 |
| M38, M40, M47, M63 : rougissaient, mais avec **un autre** témoin que celui qui le prétendait | l'intitulé de U03 promettait de comparer le chiffre de la carte à `m-kcal` et ne comparait que `m-kcal` | attentes corrigées ; **U03 renforcé** (le chiffre de la CARTE doit être celui de `m-kcal`) |

Après correction : **74/74**, avec 2 mutations de plus (M73 une clé créée « une seule fois », M74 la carte qui écrit le stockage au premier affichage).

### 7.4 Rejouer

```bash
node tools/banc_tdee_v2.js                      # le banc : 145 témoins, ≈ 36 s (TDEE_BLOCS=P,K : le moteur seul, sans navigateur ; TDEE_MATRICE=… : écrit la matrice)
python3 tools/mut_tdee_v2.py                    # le contrôle négatif : 74 mutations sur un ARBRE COPIE (MUT_VALIDE=1 : vérifie seulement les ancres ; MUT_DETAIL=1 : tous les rouges)
python3 tools/passe_repartie.py 3 <dossier>     # la passe complète D-031, seule sur la machine, puis le classement des rouges contre la version publiée
```

## 8. Compteurs R17 (code applicatif seulement ; base = `98e17112`, la branche juste avant ce chantier — elle porte déjà « Autre activité », voir `docs/AUTRE-ACTIVITE-CALORIES.md`)

| Compteur | Valeur |
|---|---|
| Données persistées ajoutées | **0** |
| Fichiers applicatifs touchés | **3** (`tracking.js`, `screens.js`, `index.html`) · aucun créé |
| Lignes ajoutées − retirées | **+264 − 0 = +264** (`tracking.js` +188 · `screens.js` +72 · `index.html` +4) |
| Anciens chemins supprimés / fusionnés | **0** — aucun ancien chemin n'est touché (R30 / décision n°15 : l'objectif et son lien historique avec les pas restent) |

Hors compteurs (tests et outils) : `tests/parcours/tdee_v2.js` (571 lignes), `tools/banc_tdee_v2.js` (36), `tools/mut_tdee_v2.py` (314), plus 7 lignes de branchement (`runner.js` +4, `repartition-3.json` +1, `autre_activite.js` ±2).
**R17 appliqué** : pas de nouvelle donnée, de clé de stockage ni de route ; le moteur est **pur** (pas de chemin d'exécution caché) ; `depenseReference` se **dérive** de `calcTDEE` au lieu de recopier la formule (R2) ; l'estimation brute vient de `kcalBloc`, le moteur n'a **aucun** barème MET.

## 9. Limites connues, dites

1. **Aucune donnée réelle** : aucun export de montre n'est accessible ici (le test T50 de l'autre chantier reste BLOCKED). Les cadences non vérifiées (randonnée 75), les fourchettes, le couloir de la montre et le plafond sont des **hypothèses de conception**, pas des intervalles statistiques. D'où « estimation, pas une mesure » et la fourchette sur chaque chiffre. **À calibrer sur un export réel** avant de parler de fiabilité.
2. **Les pas sont un chemin prêt et testé, dont la donnée n'est pas garantie** : le code de réception est branché des deux côtés, mais le raccourci iPhone montré par Michel n'envoie **visiblement que la fréquence cardiaque de repos** (point de reprise Séance du 06/11 : le code serveur capable de recevoir pas et sommeil n'atteste pas leur collecte), `docs/CARTE-DONNEES-MILO.md` (12/09/2026) note déjà que la donnée n'arrive pas, le raccourci ne lit Santé que téléphone déverrouillé (audit R6), et il n'existe **aucun compteur de pas manuel** dans l'interface. **Je n'ai lu aucune donnée réelle** (point 1). Tant que les pas manquent, la carte vit des **activités enregistrées**, et le dit (« pas du jour non reçus » quand d'autres jours en ont, rien sinon).
3. **Les pas seuls sous-estiment la course et la randonnée** (K08 : 1 164 pour ≈ 2 540 sur 4 h de course) — c'est un fait écrit, pas un défaut caché : enregistrer l'activité corrige.
4. **Un enregistrement sans heure** (ancien import) est daté de midi : deux marches de durées voisines le même jour, sans heure, **fusionneraient** (sous-compte, dans le sens prudent).
5. **Deux efforts de familles différentes à la même heure ne sont pas fusionnés** (D10) : le moteur ne devine pas, il additionne ce qui est saisi.
6. L'**historique** utilise le **poids actuel** pour toute la dépense active des jours passés, et la **référence** d'un jour passé est celle du profil actuel (elle ne dépend pas de la date, M71).
7. **Pendant la journée**, l'estimée évolue avec les pas reçus : tôt le matin elle est basse et monte (c'est ce qu'elle dit : « pas reçus de Santé »).
8. Une habitude d'entraînement est « connue » à partir de **7 jours observés** : avant, une séance habituelle compte en entier (sur-estimation possible pendant la première semaine).
9. **Vérifié en Chromium émulé (390 et 320 px), jamais sur iPhone réel ni avec HealthKit.**
10. La carte vit **dans l'onglet Nutrition seulement** ; ni l'aide « ? », ni le Guide, ni le point rouge, ni la pop-up (règle d'or n°11) : à la publication, après la fusion de Claude Principal. Le témoin U18 interdit d'y toucher d'ici là — il devra être **mis à jour volontairement** quand l'aide parlera de la carte.
11. Fuseaux UTC+13/+14 : le décalage de jour passe par midi local (`toISOString`), comme le reste de l'app ; sans objet en France.

## 10. Dépendances et conflits avec Claude Principal (N°1) — rien de sa branche n'est modifié

- **Fusion à blanc** (`git merge-tree`, aucune référence ni arbre de travail touché) de `9b1b7094` avec la tête d'intégration de N°1 `a87cc89d` (branche `integration/nut-publication-2026-11-04`) : **aucun conflit de code**, **2 conflits de documentation** (`BUGS.md`, `docs/JOURNAL-DE-PARTAGE.md`). Sur l'arbre fusionné : **banc TDEE V2 145 OK / 0 rouge** (matrice 15 PASS) ; banc « Autre activité » 130 OK / 1 rouge, **le seul rouge est la liste blanche `C-ACT-J30`** qui signale `state.js::_persistRepli` (le repli de stockage plein, déplacé hors de `persist()` par N°1) : **une ligne à ajouter à la liste blanche à l'intégration** (famille « persistance »), déjà signalée par le chantier « Autre activité ».
- **Conflits textuels attendus à la fusion réelle : `BUGS.md` et `docs/JOURNAL-DE-PARTAGE.md`** (deux documents, comme pour « Autre activité » : on garde les deux côtés). Le code (`screens.js`, `state.js`, `app.js`, `setup.js`, `coach.js`, `constants.js`, `tests/parcours/runner.js`) fusionne **sans conflit**.
- **Zones de N°1 que cette étape ne touche pas** : `setup.js`, `Code.js`, `supabase.js`, la synchronisation (`NUT-SYNC-*`), `state.js` (`load`, `persist`, init de `S`), `app.js`. Les fichiers que nous touchons tous les deux : `screens.js` (**3 lignes** de leur côté — `_HELP_DATA`, `renderFoodJournal` ; **un bloc de fonctions et un appel** du mien, à des endroits différents) et `tests/parcours/runner.js` (une ligne d'appel chacun).
- **Dépendance voulue** : le témoin **U18** (`_HELP_DATA` ne parle pas de la carte) tient tant que N°1 n'y cite pas la carte ; le témoin **J30** de l'autre chantier (liste blanche des lecteurs bruts de `S.sessions`) devra connaître tout **nouveau** lecteur que N°1 ajouterait — il rougit sinon, exprès.
- ⚠️ La **vraie** dernière tête de N°1 n'est pas sur origin (`881a952c`, corrections `setup.js` A/A2, local chez lui) : la fusion à blanc ne peut porter que sur `a87cc89d`. **À refaire** quand elle sera poussée.
- **Aucune dépendance de données** : pas de clé de stockage, pas de route, pas de champ de `S` ajouté ; la synchronisation de N°1 ne voit rien de neuf.

## 11. État final

**✅ LIVRÉ SUR BRANCHE, NON FUSIONNÉ, NON PUBLIÉ, AUCUN DÉPLOIEMENT, AUCUNE VERSION** (`sw.js` reste `ft-v1263`).

- Dernier commit de **code** validé par la passe : **`9b1b7094`** ; les commits qui le suivent ne changent que de la **documentation** (ce fichier, le journal de partage).
- Ce qui est livré : le moteur pur, ses adaptateurs et sa façade (`tracking.js`), la carte « Dépense et objectif » (`screens.js`, `index.html`), 145 témoins, 74 mutations, la doc. **L'objectif alimentaire est identique à l'octet à la version publiée** (témoins N01-N09).
- Ce qui n'est **pas** dit : que les chiffres sont *justes* — seulement qu'ils sont **cohérents, bornés, sans doublon, qu'ils portent une fourchette et leur provenance, et qu'ils ne touchent à rien d'autre**. Le calibrage sur données réelles reste à faire (§9).
- **Attend** : Michel (étape 2 ; position de la carte et vocabulaire ; un export réel ; calendrier) · Claude Principal (fusion **en premier** ; une ligne de liste blanche J30 ; fusion à blanc à refaire quand sa tête `881a952c` sera poussée) · la **recette iPhone** · la règle d'or n°11 (annonce, aide « ? », Guide, point rouge) **à la publication** · les lignes `CLAUDE.md` / `BUGS.md` / `docs/INVENTAIRE.md` **à l'intégration** (conflits connus sur les deux premiers ; l'inventaire généré passerait de 646 à 673 fonctions).
- **Retour arrière** : sans objet (rien n'est fusionné) ; `git revert 9b1b7094` retirerait le chantier d'un seul geste.

