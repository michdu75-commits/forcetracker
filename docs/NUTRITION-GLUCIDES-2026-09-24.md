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
