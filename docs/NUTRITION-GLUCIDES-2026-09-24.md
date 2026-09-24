# 🍽️ Nutrition — le moteur tel qu'il est, et d'où viennent les ~659 g de glucides (24/09/2026)

> **Statut : EN ATTENTE DE DÉCISION DE MICHEL.** Rien n'a été modifié dans le moteur.
> Ce document dit ce qui **EST** (mesuré dans l'app servie, `ft-v1234`) ; Michel décide ce qui
> **DOIT ÊTRE** (règle d'or #15). Témoins : `tests/parcours/nutri_moteur.js` (B-CCCLX, B-CCCLXI),
> contrôle négatif : `tools/mut_nutri_moteur.py` (15/15 conformes).

## 1. La chaîne (fichier · fonction · formule · repli)

| Étape | Où | Formule | Repli / provenance |
|---|---|---|---|
| Profil | `state.js` `load()` | `ft4_bw`, `ft4_age`, `ft4_ht`, `ft4_gender` | absent → 0 → **aucun calcul** (`profilCaloriqueManquants`) |
| Activité | `load()` | `ft4_act` | ⚠️ absent → **1,55 silencieux** (« Modéré 3-4j »), indiscernable d'un choix |
| Métier | `calcWorkExtra` | bureau 0 · debout +200 · actif +325 · physique +450 | ⚠️ absent → **bureau silencieux** |
| BMR | `bmrDetail` | Mifflin `10P + 6,25T − 5A (+5 H / −161 F)`, ×1,07 fumeur ; Katch si bilan récent | méthode et raison rendues ✅ |
| TDEE | `calcTDEE` | `BMR × activité + métier + sport(150) + pas` | `null` si profil incomplet ✅ |
| Cible | `autoKcal` | `TDEE + objectif + phase(±100) + lutéale(150)`, plancher H 1500 / F 1200 | manuel prioritaire (`isManual`) ✅ |
| Protéines | `macrosForKcal` | `poids TOTAL × {muscle 2,2 · perte 2,5 · recomp 2,6 · force 2,0 · équilibre 2,0 · endurance 1,7}` | — |
| Lipides | `macrosForKcal` | `poids TOTAL × {0,9 · 0,8 · 0,85 · 1,0 · 0,85 · 0,75}` | — |
| **Glucides** | `macrosForKcal` | **`(cible − 4P − 9L) / 4`, borné à 0, SANS plafond** | — |
| Cycle | `cycleGlucides` | lipides déplacés séance ↔ repos (30 %, plancher 0,6 g/kg), neutre sur la semaine | — |

👉 **Les glucides sont un RÉSIDU.** Ni l'objectif sportif, ni le type de pratique, ni les
préférences alimentaires ne les fixent : chaque kcal de TDEE en plus = **+0,25 g** de glucides.

## 2. Mesures (valeurs de TEST, jamais l'état réel de quelqu'un)

| Profil | TDEE | Cible | P / L / G | G/kg |
|---|---|---|---|---|
| Déclaré : H 48 a · 180 cm · 85,9 kg · Modéré · force · **bureau (inconnu)** | 2 711 | 3 011 | 172 / 86 / **387** | 4,5 |
| idem, métier **physique** | 3 161 | 3 461 | 172 / 86 / **500** | 5,8 |
| idem, **Actif (5-6 j)** | 3 017 | 3 317 | 172 / 86 / **464** | 5,4 |
| SYNTH-B (41 a · 179 · 85,8 · Actif · physique · muscle) — **reconstruit, jamais observé** | 3 515 | 3 965 | 189 / 77 / **629** | 7,3 |
| SYNTH-B + 4 séances/sem, jour de jambes | 3 515 | 3 965 | 189 / 65 / **657** | 7,7 |

**Le cas ~659 g est reproduit** : il faut les DEUX leviers hauts (activité 1,725 **et** métier
physique +450) → TDEE 3 515, puis le résidu, puis le cycle du jour de séance. Avec les entrées
déclarées, il ne se produit pas. ⚠️ Le métier réel de Michel n'est pas connu du dépôt.

Autres constats : plus le poids monte, plus les glucides **baissent** (60 kg → 398 g, 140 kg →
368 g) · quand `4P + 9L` dépasse la cible (1 200 kcal à la main, ou 130 kg en perte), les
glucides tombent à 0 et **les macros affichées dépassent la cible** (1 462 pour 1 200 ;
2 236 pour 2 162) · aucune valeur négative, `NaN` ni `Infinity` par l'interface.

## 3. Revalidation

- **A — profil contaminé** : ✅ CONFIRMÉ. 41 a / 179 cm / 1,725 / physique = `SYNTH-B`
  (`tools/banc_forensique_profil.js`, `tools/banc_v9.js`), reconstruit pour reproduire une sortie.
- **B — TDEE trop haut** : ❓ NON DÉMONTRABLE sans les entrées réelles de son téléphone. Avec les
  entrées déclarées : 2 711 (bureau) à 3 161 (physique). Le levier dominant est le **métier**.
- **C — `tdeeObserve()` / V9** : existe dans `tools/moteur_v9.js` seulement, **non servi**, jamais
  appelé par l'app, décision jamais prise. L'app **n'apprend pas** : `ecartNiveauActivite` propose
  un niveau d'activité d'après la fréquence, la personne tranche — c'est une proposition, pas un
  apprentissage.
- **D — `S.bw || 80`** : Nutrition → `renderWhey` (32 g sans poids) et `renderCreatine` (lu) ;
  ailleurs : calories cardio / séance / temps réel (moteur **gelé**), `_niveauForce`. Non remplacé.

## 4. Défauts dormants (non atteignables par l'interface, notés — non corrigés)

> ✅ **Corrigé depuis** : c'est **B2** (§8, décision de Michel du 24/09 soir), complété la nuit suivante (§10).


Les bornes de l'interface (calories 800-6000, âge 14-99, taille 100-229, activité par liste)
**ne sont pas réappliquées** au chargement ni à la restauration cloud : une valeur corrompue
(`Infinity`, `1e9`, activité 99 ou −1) produit un TDEE absurde (jusqu'à **−1 749**) ou des
glucides infinis. Aucun écrivain actuel ne les produit → même famille que F003 (restauration
sans borne) ; à traiter dans un chantier « entrées ».

## 5. Repères externes (recommandation ≠ choix produit ≠ préférence)

- ACSM / AND / DC 2016 (Thomas, Erdman, Burke) : glucides **3 à 12 g/kg/j selon la charge**
  d'entraînement (léger → extrême).
- Slater & Phillips 2011 (sports de force, culturisme) : **4 à 7 g/kg/j** selon la phase.
- Des revues plus récentes sur l'entraînement en résistance suggèrent des besoins parfois plus
  bas. ⛔ Aucun de ces chiffres n'est une règle du projet tant que Michel ne l'a pas choisi.

## 6. Options (Michel décide — aucune n'est codée)

A résidu (actuel) · B plage affichée · C plafond · D excédent redistribué vers les lipides ·
E adapté au profil sportif · F alerte au-delà d'un seuil · G cible glucidique choisie par la
personne. Et, indépendamment : rendre **visible** la provenance de l'activité et du métier
(aujourd'hui des défauts silencieux).

## 7. Circuit de décision imposé par Michel (24/09/2026)

Toute modification métier du TDEE, des protéines, des lipides, des glucides, du déficit/surplus
ou de la personnalisation Nutrition suit ce circuit, **sans sauter d'étape même si une option
paraît évidente** :
1. la session de chantier mesure et rédige un **« DOSSIER POUR CLAUDE PRINCIPAL »** ;
2. GPT contre-analyse (il ne modifie pas le dépôt) ;
3. Claude principal **vérifie** les faits et les options — il ne choisit pas la politique ;
4. **Michel arbitre** ;
5. la session implémente LA direction choisie ;
6. témoins + contrôle négatif + passe complète ;
7. contre-vérification finale ;
8. publication séparée.

Une décision déjà validée ne redevient pas une question parce qu'un audit est lancé ; une preuve
nouvelle qui la contredit se documente, on s'arrête, et Michel tranche.

## 8. B1 / B2 corrigés (24/09 soir, décision de Michel — `D-020`)

- **B1** : une activité jamais choisie n'est plus `1,55`. Absente → TDEE et macros `null`,
  l'écran dit « il manque ton niveau d'activité », le Profil affiche « À choisir ». Le BMR
  reste calculé. ⚠️ Un `1,55` **déjà stocké** est gardé (provenance inconnue) → `D-021`,
  **à trancher**.
- **B2** : activité et calories manuelles relues (stockage, cloud), âge et taille relus du
  stockage passent par les mêmes bornes que la saisie. Plus de TDEE à −1 749 ni à 9,7 M kcal.
- Aucun multiplicateur, bonus, ratio, résidu, cycle ni plancher modifié.

## 9. Remesure après B1/B2 (règles inchangées, sans historique de séances)

| Cas (activité **choisie** · métier · autre sport · objectif) | BMR | TDEE | Cible | P/L/G | G/kg | Σ macros − cible |
|---|---|---|---|---|---|---|
| Michel 48 a · 180 · 85,9 · activité **non choisie** | 1 749 | — | — | — | — | — |
| Michel · Modéré · bureau · aucun · force | 1 749 | 2 711 | 3 011 | 172/86/387 | 4,5 | −1 |
| idem · debout | 1 749 | 2 911 | 3 211 | 172/86/437 | 5,1 | −1 |
| idem · physique | 1 749 | 3 161 | 3 461 | 172/86/500 | 5,8 | +1 |
| idem · bureau · + vélo | 1 749 | 2 861 | 3 161 | 172/86/425 | 5,0 | +1 |
| Michel · Actif · bureau | 1 749 | 3 017 | 3 317 | 172/86/464 | 5,4 | +1 |
| Michel · Actif · physique | 1 749 | 3 467 | 3 767 | 172/86/576 | 6,7 | −1 |
| Michel · Modéré · bureau · phase décharge | 1 749 | 2 711 | 2 811 | 172/86/337 | 3,9 | −1 |
| Michel · Modéré · bureau · fumeur (×1,07) | 1 871 | 2 900 | 3 200 | 172/86/435 | 5,1 | +2 |
| F 55 kg · 160 · 45 a · Sédentaire · perte | 1 164 | 1 397 | 1 200 (plancher) | 138/44/63 | 1,2 | 0 |
| H 130 kg · 170 · 55 a · Sédentaire · perte | 2 093 | 2 512 | 2 162 | 325/104/**0** | 0 | **+74** |
| H 70 kg · 178 · 25 a · Très actif · physique · endurance | 1 693 | 3 667 | 3 867 | 119/53/**729** | **10,4** | +2 |
| H 100 kg · 190 · 25 a · Très actif · physique · muscle | 2 068 | 4 379 | 4 829 | 220/90/**785** | 7,9 | +1 |
| F 45 kg · 150 · 70 a · Sédentaire · équilibre | 877 | 1 052 | 1 200 (plancher) | 90/38/125 | 2,8 | +2 |
| Michel · Modéré · bureau · **1 200 à la main** | 1 749 | 2 711 | 1 200 | 172/86/**0** | 0 | **+262** |
| Michel · ancien `ft4_act = 99` | 1 749 | — | — | — | — | — |

**Ce qui subsiste après assainissement** : ① **B3** (macros > cible) dès que `4P + 9L`
dépasse la cible ; ② les glucides très hauts (7 à 10 g/kg) restent possibles, mais seulement
avec des entrées **choisies** (activité haute + métier physique) ; ③ le **métier** reste un
défaut silencieux (`bureau`), non tranché ; ④ la **définition** du multiplicateur
(« Modéré (3-4j) » contient-il le métier ?) reste à arbitrer.

## 10. Nuit du 24→25/09 — vérifications restantes de B1/B2, remesure, B3 factuel

**Témoins ajoutés** (`tests/parcours/activite_provenance.js`, banc `tools/banc_activite_provenance.js`) :
B-CCCLXIV (B2 par **origine** : appel direct · stockage · cloud · écran, sur `0`, `2`, `±Infinity`,
`NaN`, `"1e999"`, vide, `abc`, `1.4`, `"1.55abc"`, tableaux…) · B-CCCLXV (**remises à zéro**) ·
B-CCCLXVI (**saisie des calories à la main**, conduite). Sur le code d'avant B1 : **33 rouges / 44**,
aucun plantage. Contrôle négatif `tools/mut_activite_provenance.py` : M4 = M20 · M21 · M22
(Infinity réautorisé par chaque porte), M23 · M24 (lecture tolérante), M25 (régression ci-dessous).

**Deux défauts de ma propre correction B2, trouvés et corrigés (périmètre B2)** :
- **lecture tolérante** : `parseFloat` lisait un préfixe, donc `"1.55abc"` devenait 1,55 (stockage,
  cloud, option forgée), `[1.55]` aussi, `"2200abc"` → 2200 kcal. Remplacé par `_nombreStrict`.
- **⛔ régression de `20eac697`** : un commentaire de fin de ligne avait avalé
  `persist();closeKcalEdit();renderNutrition();` dans `saveKcalEdit`. Régler ses calories affichait
  « Objectif réglé ✅ » **sans rien écrire sur le disque**. Aucun témoin n'appelait `saveKcalEdit`
  (B-CCCLXVI le fait désormais, 4 rouges avant correction). **Non publiée** : aucun utilisateur touché.

**Remises à zéro (B1-06)** : il n'existe **aucune remise à zéro globale en production**. Chemins
réels testés : effacement du site + rechargement · `resetOnboardingTest` (clone seulement ; refuse
en production) · restauration cloud juste après · personas de démo (`_vcApplyPersona` pose la
chaîne `'modéré'` en mémoire — TDEE **NaN avant B1**, `null` depuis — puis `load()` restaure).

**D-021 — faits mesurés, rien de tranché** :
- le serveur (`Code.js`, `_pn_`) **garde** l'ancienne valeur quand le client envoie `null` : un
  compte synchronisé avant B1 garde `1.55` dans le cloud **pour toujours**, et toute restauration
  le ramène ; un compte créé après B1 stocke `0`, que la restauration refuse ;
- l'interface **ne peut pas** remettre un `1.55` stocké à « non renseigné » (« À choisir » n'écrit rien) ;
- le miroir Supabase, lui, remplace par `null` → **les deux clouds divergent** pour ces comptes ;
- aucune donnée ne distingue un 1,55 choisi d'un 1,55 par défaut (seul indice partiel :
  `registre.ctxAct`, jamais produit pour quelqu'un à 3-4 séances/semaine) ;
- ⚠️ **tant que B1 n'est pas publié**, la production continue d'écrire `1.55` pour tout le monde :
  la population concernée **grossit jusqu'à la publication**. Le dépôt ne contient aucune donnée
  utilisateur : **aucun comptage possible** d'ici.

**Scénarios historiques** :
- **~659 g** : vient du **cahier d'audit de Michel du 22/09** (TDEE 3 522, cible 3 972,
  P 189 / G 659 / L 65) — le cahier n'est **pas** dans le dépôt, ses entrées exactes non plus.
  SYNTH-B en est une **reconstruction** (TDEE 3 515, pas 3 522). Rejoué seulement comme
  **SYNTHÉTIQUE — PAS MICHEL** : 629 g sans séances, 657 g (4 séances/sem, jambes), 648 g (5).
- **~932 g : NON REJOUÉ — PARAMÈTRES HISTORIQUES INCOMPLETS.** Introuvable (dépôt, historique git,
  PDF du dépôt). Le TDEE 4 858 se retrouve **exactement** avec H 110 kg · 190 · 25 a · 1,9 ·
  physique · fumeur ; mais **aucune** combinaison objectif + phase ne mène à 5 587 (maximum
  muscle + charge = +450 → 5 308) : l'écart de 279 kcal viendrait d'une entrée **inconnue**
  (pas, cible manuelle… — non reconstruite). Remplacé par des scénarios neufs entièrement spécifiés (X1-X3).

**Remesure, matrice, B3** : `tools/remesure_nutrition.js` (lecture seule, code servi, chemin
`localStorage → load() → moteur`). Sortie complète : voir le checkpoint de fin de nuit.
- **Matrice activité × métier** (H 35 a · 180 · 80 kg) : BMR 1 755 ; le métier ajoute
  **0 / +200 / +325 / +450** à chaque niveau, sans interaction ; TDEE de **2 106 à 3 785**
  (×1,80). Aucune conclusion de « double comptage » : pas de définition produit.
- **B3 (macros > cible)**, grille de **34 560 profils** (H/F · 45→160 kg pas 5 · 160/175/190 cm ·
  20/35/50/65 a · 5 activités · 6 objectifs · 2 phases · bureau) : **1 201 points (3,5 % de la
  grille — pas une fréquence réelle)**. Seulement en **perte** (697) et **recomp** (496), plus
  4 en force et 4 en équilibre (femmes ≥ 145 kg) ; jamais à activité ≥ 1,725 ; à partir de
  **70 kg (femmes) / 85-90 kg (hommes)** ; écart de 3 à **765 kcal** (médiane 167) ; plancher D-017
  mêlé à 34 cas. Cible **manuelle** : 314 / 864 points, dès 70 kg à 1 200 kcal.

**Autres constats, NON corrigés (hors périmètre)** :
- `dashboard.js` lit `m.kcal` / `m.prot` alors que `calcMacros` rend `calories` / `prot_g` : il
  affiche le TDEE au lieu de la cible, jamais les protéines (antérieur à B1 ; `dashboard.js`
  n'est pas chargé par `index.html`) ;
- `calcTDEE` multiplie la valeur **brute** de `S.activityLevel` après l'avoir validée : une chaîne
  `'1,55'` passerait la garde et donnerait `NaN` — **aucun écrivain actuel** ne la produit ;
- `docs/DOSSIER-V9-APPRENTISSAGE.md` emploie `D-019`…`D-022` pour sa propre numérotation locale :
  **collision de noms** avec le registre (D-020, D-021).
- ×1,07 fumeur : présent, origine non traçable, aucun témoin dédié, couplé à `S.smoker` côté
  récupération — **gelé**, chantier séparé.
