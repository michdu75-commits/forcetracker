# 🔥 TDEE V2 — étape 1 : la dépense du jour, séparée de l'objectif (une INFORMATION) · étape 2 : les pas ne modifient plus l'objectif (§12)

> **GO de Michel du 06/11/2026** (« GO DÉVELOPPEMENT TDEE V2 », sur la base de l'audit du même jour) — session-C (Claude N°2, Séance). Branche `claude/dreamy-bell-pu88ia`, repartie de master `e2b942f3` (`ft-v1263`).
> ⛔ **NON FUSIONNÉ · NON PUBLIÉ · AUCUN DÉPLOIEMENT · `Code.js`, `setup.js` et la synchronisation NON TOUCHÉS · aucune donnée persistée · aucune route serveur · aucune intégration Apple Santé · aucun numéro de version** (`sw.js` reste `ft-v1263`). **État : voir §11.**
> ⚠️ **ÉTAPE 2 FAITE LE 06/11/2026 (NUT-TDEE-02, voir §12).** Les §1 à §11 décrivent l'étape 1 telle que livrée ; **là où ils disent « l'objectif est inchangé », « le lien historique avec les pas reste » ou « l'étape 2 n'est pas autorisée », le §12 fait foi** — ces passages sont annotés, jamais effacés.
> Ce document est la **mémoire** du chantier : ce qui est construit (§2-§5), ce qui ne l'est PAS et pourquoi (§6), les tests (§7), les compteurs R17 (§8), les limites (§9), les dépendances avec Claude Principal (§10), l'état final (§11).
> L'**audit** qui a conduit à ce GO est un PDF **hors du dépôt** (le dépôt est public) : `FORCE-TRACKER-AUDIT-TDEE-V2-2026-11-06.pdf`. Ses faits établis ne sont pas refaits ici ; ils sont **épinglés par des témoins** (§7).

## 1. Ce que Michel demande (résumé fidèle)

1. **Un moteur de dépense, indépendant, testable, sans effet de bord**, qui sépare trois valeurs : la dépense quotidienne de **référence** · la dépense **estimée du jour** (avec **fourchette** et **provenance** des données) · l'**objectif alimentaire**.
2. **Fiabiliser les dépenses** (règles anti-doublons de l'audit) : calories **actives** et non brutes · valeurs de montre **préférées sans être crues infaillibles** · pas et activité du même effort **comptés une fois** · musculation habituelle **non ajoutée deux fois** · **aucune donnée de pas inventée**, aucun report des pas d'hier · valeurs absentes **signalées** · hypothèses **calibrées et vérifiées** avant de présenter un chiffre comme fiable.
3. **Préparer l'affichage Nutrition** : les trois valeurs distinctement, plus les **dépenses enregistrées** (musculation, cardio, autres activités) — **sans modifier automatiquement les calories à manger** (décision du 05/11 : l'affichage ne doit pas laisser croire que ce sont des calories supplémentaires autorisées).
4. **Préserver l'existant** : pas de changement du calcul actuel de l'objectif ni de son lien historique avec les pas · rien chez Claude Principal (`setup.js`, `Code.js`, synchronisation) · pas de donnée persistée, de route serveur, d'Apple Santé · pas de fusion, déploiement ou production · pas de refonte du chantier « Autre activité ».
5. **Valider** : repos · musculation · marche · randonnée 8 h · 40 000 pas · course 4 h · activités combinées, plus des tests **anti-doublons, d'historique, d'absence de données et de non-régression**.

~~⛔ **L'étape 2 (découpler les pas de l'objectif) N'EST PAS autorisée** — décision de Michel du 06/11 : elle reste à lui. Cette étape l'**explique**, elle ne la **fait pas** (§6).~~ ✅ **Mise à jour : Michel a ensuite autorisé l'étape 2 (« GO TDEE V2 ÉTAPE 2 », 06/11/2026) — elle est faite, voir §12.**

## 2. Les trois valeurs — trois rôles, jamais l'une déduite de l'autre sans que ce soit dit

| Valeur | Ce qu'elle est | Qui la calcule | Ce qu'elle n'est PAS |
|---|---|---|---|
| **Référence** | ton niveau d'activité, **sans** le surplus de pas du jour : `BMR × niveau + travail + sport déclaré` | `depenseReference()` = `calcTDEE()` (dérivée du propriétaire de la formule, **jamais recopiée**, R2) — *étape 1 : `calcTDEE()` − `calcPasExtra()`, avant que le TDEE ne perde son terme de pas (§12)* | pas une mesure ; elle ne bouge pas avec la journée |
| **Estimée aujourd'hui** | référence + ce que la journée a fait **de plus que d'habitude**, avec **fourchette** et **provenance** | `depenseEstimeeDuJour()` (façade) → `depenseDuJour()` (moteur pur) | **pas** une cible, **pas** « tu peux manger plus » ; une **information** |
| **Objectif alimentaire** | ta cible du jour | `calcMacros()` — *étape 1 : ⛔ inchangé ; **étape 2 : ne dépend plus ni des pas ni des activités** (§12)* | n'en dépend pas ; *(étape 1 : la carte disait la part des pas que la règle d'alors y mettait encore — ligne supprimée à l'étape 2)* |

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
- **Aucun ancien chemin n'est touché** *(étape 1 seulement)* : `calcTDEE`, `calcMacros`, `_pasEcart`, `calcPasExtra`, `autoKcal` étaient **identiques à l'octet** à la version publiée (témoins N01-N06). ⚠️ **L'étape 2 les modifie volontairement** (§12) : `calcPasExtra` est retirée, `calcTDEE` perd son terme de pas, `_pasEcart` ne rend plus de kcal ; N01-N06 ont été réécrits en invariants.

### Sortie du moteur

`{ ref, connu, extra, estime, bande:{lo,hi}, bandeExtra:{lo,hi}, lignes:[{label,kcal,source,u,alerte?}], avert:[], manques:[], sources:[] }` — ou `null` si le profil ne permet pas de calcul (D-016 : aucun chiffre fabriqué). `manques` : `pas_du_jour`, `habitude_pas`. `source` d'une ligne : `montre` · `estimation` · `pas` · `dans_ton_niveau` · `aucune`.

## 6. Ce qui n'est PAS fait — et pourquoi

| Non fait | Pourquoi |
|---|---|
| **Découpler les pas de l'objectif** (étape 2) | ~~**Pas autorisé** (décision de Michel, 06/11). La carte dit seulement la part des pas que la règle actuelle y met encore. Quand l'étape 2 viendra, `depenseReference` devra perdre sa soustraction — le témoin `C-TDEE-N05` la recalcule à part et rougira exprès.~~ ✅ **FAIT à l'étape 2 (§12)** : Michel l'a autorisée le 06/11. Les témoins N05/N08 ont rougi exprès, comme annoncé, et ont été réécrits. |
| Plafond de 500 kcal, falaise de 1 500 pas, report des pas d'hier **dans l'objectif** | ~~Constats de l'audit sur la règle actuelle, pinglés tels quels (N03, N04) : les corriger changerait l'objectif.~~ ✅ **Disparus à l'étape 2** avec le lien lui-même : il n'y a plus rien à plafonner, ni de falaise sur l'objectif, ni de report (§12). |
| Lire `S.healthInbox` (calories actives de la montre) | Les calories de la montre reçues restent « jamais reprises dans un calcul » (décision à Michel, commentaire de `setup.js`). Le moteur a la **place** de la connexion future (`energieJour`) mais **elle n'est pas branchée** (P23 la prouve sur le moteur seul). |
| Intégration Apple Santé, route serveur, donnée persistée | Hors périmètre. **Aucune** n'est ajoutée. |
| Aide « ? » de Nutrition (`_HELP_DATA`), Guide, point rouge, pop-up | *Étape 1 : zone de Claude Principal ; la règle d'or n°11 se fait **à la publication**.* **Étape 2 : l'aide « ? » (Nutrition, Progrès) et la diapo du Guide sont CORRIGÉES** (elles disaient que les pas s'ajoutent à l'objectif, c'était devenu faux) ; le témoin U18 pinne maintenant la nouvelle règle. **Point rouge et pop-up v65 : volontairement NON réécrits** (annonces datées) — annonce corrective à la publication (§12.5). |
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

## 12. ÉTAPE 2 (NUT-TDEE-02) — les pas ne modifient plus l'objectif alimentaire

> **GO de Michel du 06/11/2026** (« GO TDEE V2 ÉTAPE 2 ») : *supprimer l'augmentation automatique de l'objectif alimentaire liée aux pas.* Développé et testé sur la **même branche isolée**, à partir de l'étape 1 (`7f2caa0b`). ⛔ **NON fusionné · NON publié · aucun déploiement · aucun GO production · aucune version** (`sw.js` reste `ft-v1263`). `setup.js`, `Code.js`, `supabase.js`, la synchronisation, `load()`/`persist()` : **non touchés**. Aucune donnée persistée, aucune route serveur.

### 12.1 Ce qui change — avant / après

| | Avant (ft-v1070 → étape 1) | Après (étape 2) |
|---|---|---|
| `calcTDEE()` | BMR × niveau + travail + sport **+ surplus de pas** (`calcPasExtra`, jusqu'à +500 kcal) | BMR × niveau + travail + sport — `calcPasExtra` **n'existe plus** (R30 : pourquoi écrit dans `state.js`, figé par N03) |
| Objectif et macros (`calcMacros`) | montaient avec les pas (+378 à +500 kcal sur les 7 scénarios de l'audit) | **identiques** quels que soient les pas et les activités (N01, N02, N06) |
| `depenseReference()` | `calcTDEE() − calcPasExtra()` | `calcTDEE()` |
| « Reste » d'hier · tendance 14 jours | recalculés avec la cible d'**aujourd'hui** (pas d'aujourd'hui compris : 786 → 1 221) | identiques (H14, H15) |
| `_pasEcart()` | pas + surplus + **kcal** (plafond 500, falaise à 1 500) | pas + surplus + `depasse` ; **aucun kcal** — la conversion pas → kcal n'a plus qu'**un** propriétaire, le moteur de la dépense estimée (R2, N04) |
| Ligne « 🚶 +K kcal » sous le TDEE | oui (`#nu-tdee-pas`) | supprimée, conteneur compris (N15) |
| Carte « Dépense et objectif » | « inclut +K kcal de pas (règle actuelle) » | Objectif : « ne dépend ni de l'estimée ni de tes pas » ; information prudente si effort exceptionnel (12.4) |
| Milo | « Ces ~K kcal sont DÉJÀ ajoutées à son TDEE — ne les recompte pas » ; les pas d'**hier** dits « aujourd'hui » | « Ces pas ne changent PAS son objectif calorique ni son TDEE… Ne dis JAMAIS qu'ils lui donnent des calories en plus à manger » ; seulement les pas d'**aujourd'hui** (N11, N12) |
| Progrès → « Tes pas » | « N pas · +K kcal » ; prenait la veille pour le jour | « N pas · aujourd'hui / hier / date · X de plus que ton habitude » ; jamais de kcal (N13) |

### 12.2 Ce qui ne change pas

Les **données** de pas (`S.healthDaily`) et leur usage pour **estimer** la dépense du jour (les sept règles de l'étape 1, §3) ; les **trois valeurs distinctes** de Nutrition (référence · estimée du jour · objectif) ; le moteur pur, ses adaptateurs et sa façade ; les activités enregistrées (elles informent la dépense **estimée**, jamais l'objectif — N02, banc « Autre activité » 131 ✅).

### 12.3 Les tests de l'audit repris (TD-C01 → TD-C08)

| ID | Ce qui est vérifié | Témoin(s) | Résultat |
|---|---|---|---|
| TD-C01 | cible (TDEE, calories, P/L/G) identique avec ou sans les pas, sur les 7 scénarios avec leurs activités — **remplace les deux verrous de source** de l'ancienne règle | N01 (+ N02, N05, N06) | PASS |
| TD-C02 | estimée ≥ référence ; = référence sans aucune source ; `connu:false` sans donnée (300 jours aléatoires) | P35 | PASS |
| TD-C03 | un jour ne reçoit que ses données : 08 h avec les seuls pas d'hier, 09 h avec un partiel, minuit, J+2 — aucun saut de ±435 kcal | H02, H15 (+ H01, H03-H07) | PASS |
| TD-C04 | rejeu : le « reste » d'hier identique avec 0, 20 000 ou 40 000 pas aujourd'hui ; tendance 14 j aussi | H14 | PASS |
| TD-C05 | `cibleDecomposition` : sans terme « pas », base + travail + sport = TDEE, somme = cible | N10 | PASS |
| TD-C06 | un rendu n'écrit aucune clé, n'appelle ni `persist` ni synchronisation, aucun réseau — dès le premier appel | E01-E04, U17 | PASS |
| TD-C07 | aucune lecture brute de `S.sessions` hors liste blanche (les deux lecteurs V2 y sont classés) | J30 / J31 (banc « Autre activité ») | PASS |
| TD-C08 | brut → actif converti à **un seul** endroit (`kg × h` une fois) ; les calories enregistrées n'entrent que sous le nom `kcalEstBrute` | P34 (+ D04, P17) | PASS |

### 12.4 L'information prudente — « journée d'effort exceptionnel »

`djEcartObjectif(r, objectif)` (**pure**, `tracking.js`) : l'alerte s'affiche **si et seulement si** (1) la journée a fait **au moins 800 kcal de plus que d'habitude** (`ALERTE_EFFORT_KCAL`, l'habitude étant déjà déduite) **ET** (2) la dépense estimée dépasse l'objectif d'**au moins 1000 kcal** (`ALERTE_ECART_KCAL`). ⛔ **Deux conditions, pas une** : avec une cible BASSE choisie à la main (1 500), deux heures de marche écartent déjà de 1 645 kcal — un faux positif qui apprendrait à ignorer l'information quand elle compte (U21). **Les deux seuils sont des hypothèses de conception, pas des valeurs médicales** : à valider par Michel.

Texte (neutre, aucun mot qui dise quoi manger — U22) : « *Journée d'effort exceptionnel : ta dépense estimée dépasse ton objectif d'environ N kcal (estimation, pas une mesure). Ton objectif ne change pas. Un écart aussi marqué, s'il se répète, peut peser sur ta récupération et ton énergie : c'est une information, pas une consigne. Au moindre doute (fatigue inhabituelle, vertiges), parles-en à un professionnel de santé.* » ; l'objectif affiché reste identique (U20) ; seuil à la kcal près (P33, U23).

### 12.5 Textes corrigés — et textes volontairement conservés

Corrigés : aide « ? » de **Nutrition** et de **Progrès** (`_HELP_DATA`), **suppression** de la ligne sous le TDEE, carte « Tes pas » (**Progrès**), ligne des pas et détail du calcul de la cible de **Milo**, diapo du **Guide**. **Accueil** : aucun texte ne parlait des pas ; « ce qu'il te reste » est identique avec 0, 20 000 ou 40 000 pas (N14).

⛔ **Volontairement NON réécrits : les annonces DATÉES** — pop-up v65 et descriptions du point rouge `pas-surplus` / `pas-courbe` (`constants.js`). Elles disent ce qui a été annoncé le jour de ft-v1070 ; les réécrire falsifierait l'histoire (« on ne RÉÉCRIT pas la v65 »). Seul le raccourci iOS de Michel les rend visibles (`si:'montrePas'`). **À la publication**, la règle d'or n°11 appelle une **annonce corrective** (point rouge, aide « ? » — déjà faite —, aide détaillée, diapo — déjà faite ; pop-up seulement si un repère a bougé) : décision de Michel, ticket proposé **NUT-TDEE-05**. Le témoin N15 interdit les anciennes phrases dans tout texte vivant ; les annonces datées en sont exemptées exprès.

### 12.6 Tests

| Contrôle | Résultat |
|---|---|
| Banc `node tools/banc_tdee_v2.js` | **161 OK / 0 rouge** · matrice **18 PASS** (étape 1 : 145 / 15 ; +16 témoins : TD-C01…C08, l'information prudente, les textes) |
| Contrôle négatif `python3 tools/mut_tdee_v2.py` | **98/98 conformes** : 95 attrapées par **le témoin nommé** · 3 équivalentes · arbre sain à **0 rouge avant et après** (dont **26 mutations nouvelles** : le TDEE reprend les pas, un terme « pas » dans la décomposition, la ligne de Milo, les textes, chaque seuil et chaque phrase de l'alerte, l'objectif affiché relevé, une 2ᵉ conversion brut → actif, une 3ᵉ lecture brute de `S.sessions`… ; **2 retirées** parce que leur prémisse est devenue fausse : M64 « la part de pas de la règle actuelle est dite » et M68 « l'aide ? est gelée ». Le premier passage donnait 94/97 : les 3 écarts étaient de vrais trous de témoins — l'objectif **affiché** par la carte (U20), la fenêtre de `_pasEcart` (N04) — comblés avant ce résultat) |
| Verrous de l'ancienne règle, **réécrits** (R17 : un test protège un invariant, pas une implémentation) | `runner.js` CLXXV et CLXXVI · B-CCCLX ⑤ (`nutri_moteur.js`) · B-NP01-A ① (`nut_punch01.js`) · N01-N06 et H02 de `tdee_v2.js` · **CTX-02** (`contrat_milo.js`, la ligne de calcul de la cible que reçoit Milo : 4 témoins **que ma cartographie avait manqués et que la 1ʳᵉ passe a démasqués**) : chacun **rougit sous mutation** |
| Mutations des chantiers voisins dont l'ancre dépendait de l'ancienne formule | `mut_nut_punch01` MA1-MA5 et `mut_autre_activite` M11 : ancres mises à jour, toutes attrapées ; `mut_contrat_milo` : M-CTX-11 (la ligne redit un terme « pas ») et M-CTX-12 (un sport faux de 40 kcal) ajoutées, **14/14 conformes** |
| Banc « Autre activité » | **131 OK / 0 rouge** |
| Passe D-031 répartie `python3 tools/passe_repartie.py 3` sur `5d59fedf` | **8 527 ✅ / 7 ❌** (équivalent séquentiel 8 489 ✅ / 7 ❌). **Aucun rouge nouveau** : les 7 rouges sont tous déjà rouges sur la version publiée (`differentiel_passe.py` rejoue les preuves : PS-E29 piégé par la date, le module `seance_ux.js` qui plante au même clic « Reprendre », B-UXI-G2/G3/G5/G7, B-FFD-⑧e). ⚠️ La 1ʳᵉ passe (sur `1ea5c0e4`) donnait 8 523 ✅ / 11 ❌ : **4 rouges nouveaux** — les CTX-02 du contrat FT → Milo, qui exigeaient encore le terme « pas » — réécrits, prouvés sous mutation (14/14), puis la passe a été **rejouée en entier**. La passe n'est **pas « valide »** au sens de ses 8 conditions (rouges préexistants, un module planté) : aucun feu vert de publication. |
| Fusion à blanc avec la dernière tête de Claude Principal (`866846b0`) | conflits **de documentation seulement** (`BUGS.md`, `docs/JOURNAL-DE-PARTAGE.md`) ; sur l'arbre fusionné : banc TDEE V2 **161 ✅ / 0 ❌**, contrat FT → Milo 23/0, nutri_moteur 28/0, et **les bancs de synchronisation de Claude Principal intacts** (NUT-SYNC 01 : 49/0 · 02 : 73/0 · envois A/A2 : 124/0) ; banc « Autre activité » 130 ✅ / **1 ❌ attendu** : `C-ACT-J30`, `state.js::_persistRepli` (sa fonction) à classer dans la liste blanche à l'intégration. |

### 12.7 Compteurs R17 de l'étape 2 (code applicatif seulement ; base = `7f2caa0b`)

| Compteur | Valeur |
|---|---|
| Données persistées ajoutées | **0** |
| Fichiers applicatifs touchés | **6** (app.js, coach.js, index.html, screens.js, state.js, tracking.js) · aucun créé |
| Lignes ajoutées − retirées | **+114 − 80 = +34** (app.js +1 −1 · coach.js +14 −6 · index.html +1 −2 · screens.js +16 −17 · state.js +18 −23 · tracking.js +64 −31) |
| Anciens chemins supprimés / fusionnés | **5** : `calcPasExtra` · la conversion pas → kcal de `_pasEcart` (fusionnée dans le moteur de la dépense estimée) · la ligne `#nu-tdee-pas` et son conteneur · la branche `pasLegacy` de la carte · le terme « pas » de `cibleDecomposition` et du détail de Milo |

### 12.8 Limites et risques résiduels

1. **Les deux seuils de l'information prudente (800 / 1 000 kcal) sont des hypothèses de conception**, pas un avis médical ; le texte ne donne aucune consigne et renvoie à un professionnel de santé.
2. **Annonces datées non corrigées** (pop-up v65, point rouge) : elles décrivent l'ancien comportement ; seul le raccourci iOS de Michel les montre. À traiter à la publication (NUT-TDEE-05).
3. **Changement visible** : une personne habituée à voir son objectif monter les jours de marche le verra fixe — c'est la décision de Michel, à annoncer à la publication.
4. **Les pas seuls sous-estiment la course et la randonnée** : sans activité enregistrée, une grosse journée de sport peut ne pas déclencher l'information prudente.
5. Toutes les limites de l'étape 1 (§9) restent : aucune donnée réelle, hypothèses non calibrées, **vérifié en Chromium émulé, jamais sur iPhone réel**.
6. À l'intégration : `state.js::_persistRepli` (Claude Principal) est une nouvelle lecture brute de `S.sessions` à classer dans la liste blanche J30 ; U18 pinne l'aide « ? » de Nutrition et de Progrès (la nouvelle règle) — si l'autre branche la retouche, il rougit exprès.

### 12.9 État de l'étape 2

**✅ LIVRÉE SUR BRANCHE, NON FUSIONNÉE, NON PUBLIÉE, AUCUN DÉPLOIEMENT, AUCUNE VERSION.** Dernier commit de **code** validé par la passe : **`5d59fedf`** (les commits qui le suivent ne changent que de la documentation). **Attend** : Michel (les deux seuils ; l'annonce corrective ; la fusion, qui exige une nouvelle validation) · Claude Principal (fusion en premier ; ligne J30) · la recette iPhone. **Retour arrière** : sans objet (rien n'est fusionné) ; `git revert 5d59fedf` rétablirait l'étape 1.
