# Contre-audit Nutrition (07/11/2026) — banc de reproduction, LECTURE SEULE

Branche d'essai `test/c1-c5-2026-11-06`, **jamais fusionnée**. Rien ici n'est du code applicatif : ce sont des outils de mesure.

* `banc_ca.js <racine> <étiquette>` — charge l'app **réelle** de la racine donnée (worktree de master `e2b942f3` ou du candidat `866846b0`) dans Chromium local, **réseau coupé** (garde `tests/_garde_reseau.js` du dépôt examiné), pose un journal **fictif** dans `S.foodLog`, appelle les fonctions réelles et imprime ce qu'elles rendent (JSON). Familles : A (idées / fiche refusée) · B (identité d'une habitude) · C (portions) · D (trois places, jour) · E (masquer) · F (noms dans `onclick`) · H (geste « + » master ≠ candidat) · G (compteur).
* `temoins.py <résultat.json>` — 12 témoins de **comportement attendu** (rouges aujourd'hui sur master et candidat, verts sur la copie corrigée jetable).
* `patch_A_C.diff`, `patch_F.diff` — corrections minimales **NON APPLIQUÉES** (essai sur une copie jetable hors dépôt ; un GO de Michel est requis).
* `releve_compteur.js` — relevé **lecture seule** du compteur « noté N fois » (que des nombres, aucun nom ni contenu du journal) à lancer avant puis après une synchronisation.
* `res_master.json`, `res_cand.json`, `res_patched.json` — résultats des trois versions (données inventées uniquement).

Aucune donnée personnelle, aucun appel réseau sortant, aucun correctif, aucune fusion.
