# AUDIT NUTRITION DE NUIT — RAPPORT PRINCIPAL (12/10/2026)

Session-B · Principal · **lecture seule sur le produit**.
Branche d'audit `claude/nut-night-audit-2026-10-12`. Base auditée `claude/nut-food-variants-03` @ `7dd1b005` (fonctionnel `ae2f950c`).

## A. Résumé exécutif

- **Recommandation : CORRIGER AVANT FERMETURE — 3 petits lots, puis fermer Nutrition et passer à Séance.**
- Environ **28 000 requêtes** ont été jouées sur les **vraies fonctions** de recherche de l'app, plus **20 scénarios de
  parcours réel** (clics, rechargement). Résultat : **222 symptômes bruts**, ramenés à **3 causes P1**, toutes confirmées et
  reproductibles en une commande :

| Cause | Ce que voit l'utilisateur | Lot |
|---|---|---|
| **C-A — tables générées sans contrôle de SENS** (alias + fast-food) | en ligne, « confiture » (et fraise, abricot, fruits rouges) met la **Confiture de lait** (340 kcal) en tête ; « gruyère » donne de l'Emmental, « pilon de poulet » une cuisse (−26 % kcal)… alors que l'aliment exact existe. Une dosette de sauce Quick affiche **576 kcal**, sous l'étiquette « sources officielles ». | **LOT-A** |
| **C-B — la requête exige la quantité comme un mot** | « riz 100g », « poulet 200g », « riz cuit 150 g », « lait 250ml » → **liste vide** (14 requêtes sur 20). « coca 0 » → **cola sucré**. « pain complet. » (point d'iOS) → vide. | **LOT-B** |
| **C-C — garde de quantité fondée sur un drapeau, pas sur la valeur** | taper puis vider la quantité (ou 0) → la ligne s'enregistre **pour 100 g, sans quantité**. Dans **Modifier**, vider le champ **écrase une ligne existante** (388 → 155 kcal, q = 0). | **LOT-C** |

- **Ce qui tient** :
  - les 3 341 aliments CIQUAL proposables se retrouvent tous par leur nom, en ligne et hors ligne ;
  - **aucune variante contraire** n'est classée devant la variante demandée (1 270 requêtes × 2 modes) ;
  - le parcours journal (ajout, rechargement, modification, autre jour, suppression d'une ligne) est juste ;
  - les conversions Open Food Facts (kJ seuls, valeurs par portion seules) sont justes.
- **0 P0.**
- Produit **non modifié**. Master intact.

## B. Baseline Git vérifiée (observée, pas recopiée)

| | Observé |
|---|---|
| Branche source | `claude/nut-food-variants-03` |
| HEAD source | `7dd1b0051af290267d6f498bf96b8e32de885498` (tree `c343e699…`) |
| HEAD fonctionnel | `ae2f950c00fe794f937988f4d453bf9e53fc60ef` (tree **`5785192494bb0d50c6f9320197b134be43b6ef95`**) |
| Commits après le fonctionnel | `01e91f86`, `b08eda14`, `7dd1b005` : documentation + `HANDOFF-NUT-FOOD-VARIANTS-03.json` seulement (vérifié par `git diff --name-only`) |
| `origin/master` | `7b75f3c1b029b713d1a6db9692f407af302a0d6c`, inchangé du début à la fin |
| Branche d'audit | `claude/nut-night-audit-2026-10-12` depuis `7dd1b005` : réservation au journal de partage + `tools/audit-nut-night/` (outils d'audit, hors runtime) |
| Statut git | propre au départ ; à la fin, aucun fichier produit modifié |

## C. Couverture auditée

- **Sources** :
  - CIQUAL : 3 484 lignes, dont 3 341 proposables et 143 masquées (kcal non déterminées, décision R30) ;
  - table d'alias : 632 ;
  - fast-food : 123 produits ;
  - compléments : 129 033 lignes, identification seule ;
  - Open Food Facts : recherche et code-barres par réponses **figées** (le réseau réel est injoignable d'ici, 403) ;
  - journal de la personne : « Déjà noté par toi » ;
  - « Mes aliments » : par les bancs existants.
- **Chemin** : toutes les sondes passent par les fonctions appelées à la frappe (`_ciqualChercher`, `_marquesChercher`,
  `_afSuggLocales`, `_complChercher`), et les parcours par la **vraie interface**. Aucune réimplémentation du moteur.
- **Batteries** :
  - B1 accessibilité (3 341 noms, tête, mots nécessaires) ;
  - B2 têtes de nom (2 132) ;
  - B3 variantes tête + qualificatif (1 270) ;
  - B4 adversarial : 217 mots courants, 52 paires de normalisation, 20 requêtes avec quantité, 20 fautes ;
  - B5 table d'alias (632) + contrôle sémantique ;
  - B6 fast-food et compléments ;
  - J parcours réel (20 scénarios).
- **Non testé** (dit, pas deviné) :
  - Open Food Facts et code-barres **réels** ;
  - synchronisation cloud et restauration (lot FOODLOG-RESTORE déjà publié) ;
  - multi-appareil ;
  - clavier iOS réel ;
  - « Mes aliments » et `rejouerRepas` (couverts par `habitudes_alim` / `repas_actif`, non rejoués ici).

## D. Métriques

| | |
|---|---|
| Requêtes jouées | ≈ 28 000 (B1 19 436 · B2 4 264 · B3 2 540 · B4 972 · B5 632 · B6 153) |
| Aliments inventoriés | 3 484 CIQUAL + 123 fast-food + 632 alias (+ 129 033 compléments) |
| TOTAL analysé (CIQUAL proposable) | 3 341 |
| PASS (nom entier retrouvé) | 3 341 |
| INACCESSIBLE | 0 |
| AMBIGU (≥ 5 mots nécessaires pour sortir dans les 6 lignes) | 131 — normal : familles de variantes (crèmes, eaux minérales…) |
| MASQUÉ | 143 (kcal non déterminées — décision R30) |
| FAUX MATCH (faux amis, après correction de l'oracle) | 70 symptômes → famille connue « dernier mot partiel » + traductions voulues |
| DONNÉE INCOMPLÈTE | 18 aliments à une macro non déterminée (enregistrée à 0, NIGHT-P-009) |
| DÉCISION PRODUIT | 4 (D1 → D4) |
| NON TESTABLE | OFF / code-barres réels |
| Symptômes bruts → entrées du registre → causes | 222 → 33 → **3 causes P1** |
| P0 / P1 / P2 / P3+dettes | **0 / 7 entrées (3 causes) / 4 / 14** |

## E. P0

Aucun.
- La dosette Quick à 576 kcal (NIGHT-P-003) répond à la lettre de la définition (« valeur fausse proposée comme fiable »).
  Elle est classée **P1**, parce qu'elle touche un produit rare ; la contre-vérification peut la reclasser.

## F. P1 (7 entrées, 3 causes)

- **NIGHT-P-001** (C-A) — `confiture`, `confiture de fraise`, `confiture d'abricot`, `confiture fruits rouges` → **31040
  Confiture de lait** en tête, en ligne. Les vraies confitures existent (31024, 31037, 30999).
- **NIGHT-P-002** (C-A) — 13 clés contournent l'aliment nommé, qui existe :
  - gruyère → Emmental ;
  - lieu noir → lieu d'Alaska ;
  - pilon(s) de poulet → cuisse ;
  - riz semi-complet → riz complet ;
  - pain aux céréales → pain complet ;
  - jambon de Bayonne / sec → jambon cru ;
  - lentilles blondes, pâtes semi-complètes, haut de cuisse, beurre salé, riz thaï.
- **NIGHT-P-003** (C-A, donnée source) — fast-food Quick : **5 groupes** de produits différents aux valeurs identiques.
  - Dosette = Grande Rustiques, soit 576 kcal.
  - « Grande Frites + Sauce Ranch » porte la portion de 65 g de la petite frite.
  - Le décalage est **dans le classeur source**, et un seul doute est affiché.
- **NIGHT-P-004** (C-B) — une quantité dans la requête vide la liste (14/20) ; « 2 oeufs » → un dessert.
- **NIGHT-P-005** (C-B) — « coca 0 » → cola **sucré** en tête (le `0` d'un caractère est jeté).
- **NIGHT-P-007** (C-C) — ajout : quantité vidée / 0 / texte → ligne enregistrée pour 100 g, `q:null` (Big Mac 228 au lieu de 530).
- **NIGHT-P-008** (C-C) — **modifier** : vider le champ grammes écrase la ligne (250 g / 388 kcal → 155 kcal, `q:0`).

Commandes de reproduction : dans `REGISTRE-NUT-NIGHT.json`, champ `commande_ou_procedure_reproduction`.

## G. P2

- **NIGHT-P-006** — point final de la requête (iOS) → liste vide. Rattaché à LOT-B.
- **NIGHT-P-009** — macro « non déterminée » (affichée « ? ») enregistrée **à 0**. 18 aliments ; impact faible ; décision D3.
- **NIGHT-P-010** — vocabulaire : nutella, popcorn (« pop-corn » dans CIQUAL), granola → rien. Optionnel dans LOT-A.
- **NIGHT-P-027** — alias **discutables** (pas des erreurs nettes) : blanc de poulet / dinde, pomme de terre vapeur,
  laitue / batavia / feuille de chêne → « salade verte », tradition. Décision D1.

## H. Dettes (P3 et dettes connues)

- **Nouvelles P3** (dette, pas de lot) :
  - fautes de frappe non tolérées (NIGHT-P-012) ;
  - variantes d'écriture : choufleur, cacahouète, pomme-de-terre, « jus d orange », « l'huile d'olive » (NIGHT-P-013) ;
  - premier usage hors ligne sans table d'alias (NIGHT-P-014) ;
  - pluriels sans alias (NIGHT-P-015) ;
  - compléments : coupure à 400 + lettre seule jetée (NIGHT-P-016) ;
  - fast-food : nom exact pas en tête (NIGHT-P-017) ;
  - fast-food : kcal ≠ macros sur 3 petites lignes (NIGHT-P-018).
- **Dettes connues, retrouvées, non recomptées comme nouvelles** :
  - « dernier mot partiel », qui couvre cola seul, roquette → croquette, oseille → groseille, gin → aubergine (NIGHT-P-019) ;
  - FV-164 et **FV-165** (« viande hachée » sans précision = crus seulement) ;
  - « light » → édulcorants ;
  - crème Isigny / UHT et « crème entière » ;
  - FR-119 à reclasser.

## I. Décisions produit (à trancher par Michel — liste courte)

- **D1 — Alias discutables.** Et quelle cible pour « confiture » tout court :
  - 30999 « sans précision sur la teneur en sucres (aliment moyen) », 235 kcal ;
  - ou 31006 « non allégée (aliment moyen) », 244 kcal ?
- **D2 — Quantité tapée dans la recherche.** Seulement ignorée par la recherche (défaut proposé), ou aussi reportée dans le
  champ quantité ?
- **D3 — Macro non déterminée.** La garder « inconnue » dans la ligne (avec une mention), ou 0 avec un drapeau ?
- **D4 — Lignes Quick aux valeurs dupliquées.** Les marquer en DOUTE (mécanisme existant, ta décision de ft-v1114
  « tout mettre et marquer le doute »), ou les retirer ?

## J. Données absentes / problèmes de source

- **CIQUAL** : 0 valeur extrême ou négative, 0 code ou nom en double.
  - Plancher énergétique : 48 lignes à ≤ 1,3 kcal (arrondis), réécrites par le résolveur (ft-v1207). Négligeable.
  - Écarts Atwater > 25 % : alcools, polyols, aromates — expliqués.
  - 18 macros non déterminées → NIGHT-P-009.
- **Absents de CIQUAL** : whey, ricotta, skyr, tacos — déjà listés en ft-v1115 (DONNÉE ABSENTE).
- **Fast-food** : les 5 groupes dupliqués (NIGHT-P-003) viennent du **classeur source**. La PDF officielle Quick
  (assets.quick.fr) est injoignable d'ici ; la vérification est à faire par Michel, ou à marquer en doute (D4).

## K. Causes racines

| Cause | Mécanisme | Symptômes rattachés | Confiance |
|---|---|---|---|
| **C-A** | les générateurs (`tools/alias.py`, `tools/marques.py`) contrôlent la FORME (codes, macros, tailles) mais pas le SENS : une cible qui ne porte pas les mots de sa clé, ou deux produits aux valeurs identiques, passent | NIGHT-P-001, 002, 003, (010, 015, 027) | haute |
| **C-B** | `_afMots`, propriétaire unique du découpage (R2), exige chaque jeton comme mot du nom : nombres et unités inclus ; il jette les jetons d'une lettre (`0`) ; `_afNorm` ne traite pas le `.` | NIGHT-P-004, 005, 006, (013, 016) | haute |
| **C-C** | `addFoodEntry` lit `_bcQtyPose` (« touché ») au lieu de la quantité ; `saveEditFood` écrit `q=0` ; les champs se replient sur la référence 100 g | NIGHT-P-007, 008 | haute |
| C-D | `_per100d1(null)` → 0 : l'absence devient zéro | NIGHT-P-009 | haute |

## L. Lots proposés (3 ; prompts prêts)

| Lot | Cause | Fichiers | Décision requise | Durée |
|---|---|---|---|---|
| **LOT-C** — une quantité vide ou nulle ne s'enregistre pas (ajout ET modification) | C-C | `app.js` (`addFoodEntry`, `saveEditFood`) | **aucune** | 45–60 min |
| **LOT-A** — le sens avant le code (alias + fast-food) | C-A | `tools/alias.py`, `tools/marques.py` (+ JSON régénérés) ; **0 ligne d'app.js** | D1, D4 (sinon : erreurs nettes seulement) | 45–60 min |
| **LOT-B** — la requête dit l'aliment, pas la quantité | C-B | `app.js` (`_afMots`, peut-être `_afNorm`) | D2 (défaut : ignorer) | 60–90 min |

Chaque prompt (`PROMPT-NUT-LOT-A/B/C.md`) porte :
- la base vérifiée ;
- la mesure à rejouer ;
- la stratégie minimale, **sans patch aveugle** ;
- les tests à écrire D'ABORD ;
- les mutations et les bancs ;
- les risques, les dettes laissées et le critère de fermeture.

## M. Ce qu'il ne faut PAS corriger maintenant

- La recherche approchée (fautes de frappe) : c'est un chantier, pas un correctif.
- Les pluriels et variantes d'écriture, une par une.
- Le « dernier mot partiel » (décision V03).
- Les compléments.
- L'ordre fast-food.
- Les 273 alias « sans tous les mots » : la plupart sont des traductions voulues.
- La douane (gelée).
- Le repli d'affichage de `_qtyRescale` (décidé).
- Le report de quantité dans le champ, sans D2.

## N. Risques

- **LOT-B touche le découpage commun aux 4 recherches.**
  - L'invariant B-FV-N (3 341 noms) et les faux amis figés par D-042 doivent rester verts.
  - Des noms CIQUAL contiennent des nombres.
- **LOT-A peut faire bouger un témoin FS-03 / FS-05** qui figeait un alias fautif.
  - C'est une décision à rapporter, jamais une retouche du témoin.
- **LOT-C ne doit refuser que le cas « bloc grammes actif + quantité ≤ 0 / illisible ».**
  - Il faut d'abord vérifier les portions, le poids déclaré, l'unité ml et la reprise depuis « Mes aliments ».
- **Les trois lots partent de la même base.**
  - L'intégration suivra le protocole deux sessions (la dernière qui publie refusionne).

## O. Première action demain

1. Lire `SYNTHESE-CROISEE-NUT-NIGHT.md`, puis répondre à **D1 → D4** (5 minutes).
2. Lancer **PROMPT-NUT-LOT-C.md** : il ne dépend d'aucune décision et ferme la seule corruption de données du journal.

## P. Critère de fermeture Nutrition

Nutrition se ferme quand :
- LOT-C, LOT-A et LOT-B sont verts et contre-vérifiés ;
- les branches Nutrition sont intégrées (D-042 closure → VARIANTS-01/02/03 → lots A, B, C) ;
- la passe **D-031** est **verte sur l'arbre final intégré** ;
- les dettes de §H sont consignées.

Alors : **publication, puis passage à Séance.**

On ne cherche pas la perfection : les P3 restent des dettes nommées.

---

### Annexe — « Ajouter un aliment, mais pas n'importe comment » (audit seulement, aucun code)

- **Où ça se grefferait** : l'écran « Ajouter un aliment » existe déjà, avec la saisie libre (nom + kcal / P / G / L), le
  code-barres, la photo d'étiquette et l'estimation IA. « Mes aliments » (`S.savedFoods` + l'historique, `_afQuickItems`)
  est la mémoire personnelle. Un « Ajouter un aliment » propre est une **porte de plus vers le même formulaire**
  (R2 / R13), pas un écran neuf.
- **Doublons avant création** : la recherche locale existe (`_ciqualChercher`, `_marquesChercher`, `_afSuggLocales`). Il
  suffirait de l'interroger avec le nom saisi AVANT d'enregistrer, et de proposer « c'est peut-être déjà ceci ».
  ⚠️ Cela dépend de LOT-B (sinon « riz 100g » ne trouve rien).
- **Validations qui existent** :
  - `_coherenceKcal` (kcal vs macros, bouton « Mettre X kcal ») ;
  - `_resoudreNutrition` (plancher énergétique ; ne réécrit jamais une saisie de la personne) ;
  - la douane (21 règles, observation) ;
  - le refus « sans nom » / « sans valeur » ;
  - le refus `ml` sans densité ;
  - la garde de quantité (à durcir : LOT-C).
- **Ce qui manque** :
  - la déclaration explicite « ces valeurs sont pour 100 g / pour une portion de N g » sur la saisie libre (aujourd'hui
    déduite du poids déclaré, `_afDeclarePoids`) ;
  - le contrôle de doublon ;
  - une **provenance** affichée à la création : `_afSetSrc` / `_provFood` la portent déjà en donnée.
- **Personnel vs base commune** :
  - personnel = `S.savedFoods` (chez la personne, Constitution P3) ;
  - base commune = **R36** : seul ce qui décrit le monde se récolte, avec le seuil de 3 identifiants pour un texte libre ;
  - le chemin `logSearchMiss` (`_signalerRechercheVide`) existe déjà et peut servir de modèle.
- **Portion vs 100 g incohérents** : réutiliser `_per100Derive` / `_per100SuitLaPortion` (propriétaire unique,
  12/09/2026), ne pas réécrire d'algèbre.
