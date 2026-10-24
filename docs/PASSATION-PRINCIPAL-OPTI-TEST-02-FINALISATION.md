# PASSATION — OPTI-TEST-02 · FINALISATION → Claude Principal

**De** : Claude (session Nutrition, « forcetracker claude B / nutrition ») · **Pour** : Claude Principal · **Date** : 24/10/2026
**Statut** : expérience terminée, sur COPIES du commit `4ab7f860` (master, `ft-v1259`). **Rien n'est branché** : aucun commit, aucun push, aucune modification de D-031, de `tests/`, de l'application ni de `master`. ⛔ **Rien n'est à intégrer tant que Michel n'a pas validé** : la passe D-031 et ses 4 conditions sont une décision actée (règle d'or #15).

## 1. Le résultat en 6 lignes

- Classique : **94,6 min** (93,5 et 95,6). Sur 3 processus : **33,3 min** (5 passes : 33,2 · 33,4 · 33,3 · 33,3 · 33,3), **×2,84**.
- **7 843 contrôles** + 21 du banc `journal_qty_guard` ; les 5 passes rapides sont **identiques à la classique du même jour, contrôle par contrôle** (règle d'horloge seule).
- **14 défauts injectés** : 92 rouges + 1 rouge du banc en classique ; **exactement les mêmes** sur 3 processus (13 défauts vus sur 14, le 14ᵉ est le contrôle non couvert).
- **Zéro sortie réseau** dans chaque processus de chaque passe (D031S-II ② vert partout ; ~229 appels IA émis par passe, tous simulés, refusés ou bloqués), plus un isolement système.
- 2 processus : **non mesuré** — retiré avant de démarrer, sur décision de Michel (24/10 : « je préfère gagner du temps plutôt que multiplier les essais sans nécessité »).
- L'outil final (`tools/passe_repartie.py`), essayé tel qu'il serait installé : **PASSE RÉPARTIE VALIDE**, 8 conditions sur 8, 34,9 min ; puis `comparer_passes.py` contre R1, exactement comme à l'étape 4 ci-dessous → **IDENTIQUE**.

## 2. Ce que tu trouveras dans le dossier

`audits/2026-10-23-opti-test-02-finalisation/` (hors du dépôt) :

| Chemin | Quoi |
|---|---|
| `RAPPORT-OPTI-TEST-02-FINALISATION-2026-10-24.md` / `.pdf` | le rapport complet : durées, contrôles, stabilité, défauts, réseau, ressources, risques, procédure |
| `propositions/tools/decouper_passe.js` | le découpeur adapté au runner D031S (fermé par défaut) |
| `propositions/tools/verifier_decoupe.js` | le contre-vérificateur indépendant des copies découpées |
| `propositions/tools/passe_repartie.py` | la passe répartie et ses 8 conditions (sur le modèle de `passe_valide.sh`) |
| `propositions/tools/comparer_passes.py` | la comparaison classique ↔ répartie, contrôle par contrôle |
| `propositions/tests/parcours/repartition-3.json` | la répartition mesurée des 74 modules sur 3 processus |
| `propositions/tests/parcours/comparaison-normalisation.json` | les 3 SEULES règles de normalisation (4 libellés affichent l'heure ou la date de la passe) |
| `outils/`, `mesures/`, `mutations/` | les outils de l'expérience, les journaux de chaque passe, les 14 défauts |

## 3. Ce qu'il faut savoir avant de toucher à quoi que ce soit

1. **Le découpeur d'OPTI-TEST-02 est périmé, et il ne le dit pas** : sur le runner d'aujourd'hui, il triple en silence 4 instructions (3 contrôles du garde D031S-III/IV/V + le module `d031s_rir_superset`). Utiliser uniquement `decouper_passe.js`, toujours suivi de `verifier_decoupe.js` (c'est ce que fait `passe_repartie.py`).
2. **Le seul écart attendu** entre classique et réparti : les 19 témoins du garde (16 D031S-I + 3 D031S-II) sont joués dans chaque processus. Tout le reste est identique, libellé par libellé.
3. **4 libellés changent d'une passe à l'autre**, même entre deux classiques : `B-D086-⑫a` ×2 (l'heure de la passe, `tests/parcours/ux_d086.js` l. 299) ; `PS-E13` et `PS-E14` (une date calculée depuis le jour, `tests/parcours/progres_seances.js` l. 287 et 299). Toute comparaison les normalise (`comparaison-normalisation.json`). ⛔ Ne jamais ajouter de règle pour faire disparaître un écart de la passe répartie.
4. **Jamais deux passes en même temps** : 3 processus = 3 navigateurs, charge ~9 sur 4 cœurs. Jamais entre 21:40 et 22:05 UTC (minuit à Paris, CXVIII).
5. **Un rouge ou un plantage en réparti se confirme en classique** (`tools/passe_valide.sh`) avant d'accuser le code.
6. **Le conteneur peut redémarrer** (2 fois en 12 h ici) : une passe coupée n'a pas de ligne de total, donc elle est invalide, jamais verte. Il faut la relancer.

## 4. Si Michel valide — l'intégration, pas à pas

1. `git fetch origin --all`, ligne au journal de partage (règle d'or #13 ; je n'ai pas pu l'écrire : il vit sur `master`, interdit dans ma mission), **branche dédiée** depuis `origin/master`.
2. Copier les 6 fichiers de `propositions/` aux mêmes chemins dans le dépôt. **`tests/parcours/runner.js` n'est pas modifié.**
3. Gouvernance, déjà vérifiée sur la copie : `.claspignore` les ignore (tout sauf `Code.js` et `appsscript.json`) ; D031S-VII ne les voit pas comme points d'entrée Playwright (aucun ne charge Playwright ; les copies `runner.part-*.js` sont retirées après chaque passe et n'ont pas de `require.main === module`). À faire sur la branche : `python3 tools/check_regles.py` et `python3 tools/inventaire.py`.
4. **Qualification sur la branche, même commit, même jour** : `tools/passe_valide.sh /tmp/seq.log`, puis `python3 tools/passe_repartie.py 3 /tmp/rep`, puis `python3 tools/comparer_passes.py /tmp/seq.log /tmp/rep --normaliser tests/parcours/comparaison-normalisation.json` → **IDENTIQUE** exigé. Sinon : on s'arrête et on cherche pourquoi.
5. Documents : la décision de Michel dans `docs/DECISIONS.md` (nouveau D-xxx, origine Michel) ; la règle d'or #13 et `docs/PROTOCOLE-DEUX-SESSIONS.md` (« la passe complète ENTIÈRE » peut être la répartie, avec ses 8 conditions) ; `BUGS.md` (le découpeur périmé qui doublait sans refuser ; les libellés horodatés).
6. **Retour arrière en une ligne** : on revient à `tools/passe_valide.sh`, qui n'a jamais changé ; on supprime les 6 fichiers.

## 5. Ce que je n'ai PAS fait (et pourquoi)

- **La passe sur 2 processus** (saine et à défauts) : retirée avant de démarrer, sur décision de Michel.
- **Aucune passe supplémentaire** sans son accord, donc pas de vérification de l'hypothèse sur le temps de calcul divisé par 2 (rapport §9).
- **Pas de ligne au journal de partage** : `master` interdit dans cette mission. À reporter.
- **Pas de passe sur 4 processus** : non demandée ; plancher du processus 0 ~24 min sous charge, et charge accrue.
- **Pas de correction des libellés horodatés** : ce sont des tests ; les modifier demande leur propre preuve et l'accord de Michel.
- **Pas de E2** (attendre un état au lieu d'une pause fixe) **ni de E6** : chacun modifie des tests, hors de cette proposition.
