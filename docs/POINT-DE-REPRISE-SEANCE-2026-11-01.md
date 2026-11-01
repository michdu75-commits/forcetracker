# POINT DE REPRISE — Force Tracker · chantier Séance (Claude N°2, session-C) — 01/11/2026

> Écrit avant compactage, à la demande de Michel. Tout ce qui suit a été REVÉRIFIÉ le 01/11 (git fetch + ls-remote).
> Versionné dans `docs/` le 01/11, après le push autorisé par Michel des trois commits locaux (documentation seule).
> ⛔ Aucun test non exécuté n'est compté comme validé. Les quatre états restent distincts : corrigé sur branche ≠ intégré ≠
> publié ≠ vérifié sur iPhone.

## 1. Git — état vérifié le 01/11/2026
| Élément | Valeur |
|---|---|
| Branche de référence | `claude/workout-core-01` |
| HEAD local | **`efba1514`** (`efba15146dbed6163b16c550b7b6c5e0af385d69`), arbre propre |
| Branche distante | **`efba1514`** — les 3 commits poussés le 01/11 sur autorisation de Michel (avant : `227f090e` ; avance rapide vérifiée, aucun secret, `master` inchangé) |
| `origin/master` | `e2b942f3` (= code ft-v1263 `922c5d51` + 2 commits de documentation) — base du lot |
| Commits poussés le 01/11 | `a9a0fb85` (simplification S2 : code + témoins) · `daf0f3f4` (témoin D06, tests seuls) · `efba1514` (dossier du lot) |
| Commits poussés du lot | `46d4fc10` réservation · `6523d74d` A CHR-03 · `21d63c8f` · `bf077948` B DOM-01/02 · `00a2b6f2` · `6309015e` · `df48ea89` · `7bbb3b6b` · `18769fd2` correctif 1 · `8d605500` correctif 2 · `f374662c` · `ead0aef1` · `227f090e` |
| Correctif exact (audit) | `FORCE-TRACKER-WORKOUT-CORE-01-S2-2026-10-31.patch` (hors dépôt, remis à Michel) : `227f090e` + correctif = `efba1514` à l'octet près (vérifié) ; depuis le push, `git diff 227f090e efba1514` donne la même chose |
| Rapport PDF | `FORCE-TRACKER-WORKOUT-CORE-01-SIMPLIFICATION-S2-2026-10-31.pdf` (hors dépôt, remis à Michel ; 4 pages, 26 gardes, relu 17/17) |
| Retour arrière | `git revert a9a0fb85 8d605500 18769fd2 bf077948 6523d74d` ; état du GO TESTS seul : `git revert a9a0fb85` |

## 2. Corrections — FAITES (état : corrigé sur branche ; NON intégré, NON publié, NON vérifié iPhone ; statut ORANGE)
- **CHR-03** : un seul minuteur de repos à 1 Hz (`restIv`, `_pillIv` supprimé), calage « changement de seconde + 100 ms »,
  jeton `_restGen`, écritures limitées aux valeurs qui changent (`_restVu`), cadran repeint trait par trait (`_cdownLit`).
- **DOM-01/02** : `updateWorkoutSetDOM` — validation/dé-validation ordinaire et `setRir` mises à jour SUR PLACE (champs voisins,
  focus, sélection gardés) ; groupes, dropsets, mode « Grouper » : reconstruction comme avant.
- **Simplification S2 (31/10)** : à la validation, seul le **champ actif** de la série validée est relu ; `upSet` ne sauvegarde
  plus une valeur inchangée ; **retirés** : `_ftTape` + écouteur global, suspension de `onchange`, `_restIvCale` ; le rendu ciblé
  **refuse** (reconstruction complète) un écran qui ne ressemble plus au gabarit et le **signale** (console + `_logErr`, 1 fois/chargement).
- **D06 (31/10)** : témoins DOM-T19 / T19b (aucun refus signalé dans les parcours normaux) ; 0 faux signalement → aucun code modifié.

## 3. Ouvert — NON fait
- **Recette iPhone R1 à R22 : NON EXÉCUTÉE** (préparée seulement). Aucun résultat.
- **Audit indépendant** du CTO : en attente (statut ORANGE).
- **Passe D-031 complète** : non jouée (non autorisée) — obligatoire avant toute publication.
- **Intégration / publication / merge** : interdits sans GO distinct (le push de la branche a été autorisé le 01/11 ; `master` intact).
- **Conflit règle #13 / ordre** : `docs/JOURNAL-DE-PARTAGE.md` NON modifié pour la simplification (fichier partagé interdit) — à trancher.
- **Registre + passation (règle #19)** : bloc de mise à jour à poser par Principal (le connecteur Drive ne modifie pas un fichier existant).
- **Décisions proposées** pour `docs/DECISIONS.md` à l'intégration : D-127 (calage +100 ms), D-128 (« ce qui est tapé dans la
  série validée l'emporte : seul le champ actif est relu, une valeur inchangée n'est jamais sauvegardée »).
- **Hors lot, non corrigés** : étiquette « 📉 Série dégressive terminée » effacée par `startRest()` (lu, non reproduit) ;
  M9 de `tools/mut_rir_superset.py` périmée depuis `cff47f0d` ; `check_regles` : tableau des briques de
  `DOSSIER-ATHLETE-SUIVI.md` périmé (préexistant sur `e2b942f3`) ; DOM-S1 / DOM-S2 = témoins de FORME à remplacer un jour ;
  R8 (vibrations) : `navigator.vibrate` probablement absent de Safari iOS (non vérifié).

## 4. Recette iPhone R18 à R22 — critères (NON exécutés, aucun résultat)
| # | Geste | Attendu |
|---|---|---|
| R18 | « 62,5 » dans une charge pré-remplie (60), fermer le clavier par « OK », puis ✓ | validée à 62,5 |
| R19 | répétitions, flèche ⌄ vers la charge, « 62,5 », ✓ clavier ouvert | les deux valeurs tapées enregistrées |
| R20 | taper une charge, passer sur une autre app sans fermer le clavier, revenir, ✓ | valeur tapée enregistrée |
| R21 | taper une charge, verrouiller, déverrouiller, ✓ | valeur tapée enregistrée |
| R22 | lancer un repos, « Passer » dans la première seconde | rien ne repart (ni chiffre, ni décompte ; sur un appareil qui vibre, aucune vibration — rien à constater sur iPhone) |
(R1 à R17 : voir `docs/WORKOUT-CORE-01.md` §7 — aussi NON exécutées.)

## 5. Bugs identifiés — causes — solutions retenues
| Bug | Cause | Solution retenue |
|---|---|---|
| Sauvegarde complète en double en quittant le champ validé (GO TESTS, correctif 1 `18769fd2`) | le `change` de sortie refaisait un `upSet` | d'abord suspension de `onchange` ; **remplacée (S2)** par `upSet` qui ne sauvegarde pas une valeur inchangée |
| Ancien texte affiché écrasant un modèle changé par le code (`session_integrity` T1, correctif 2 `8d605500`) | la validation relisait tous les champs | d'abord `_ftTape` ; **remplacé (S2)** : seul le champ actif est relu |
| Sauvegarde identique de trop après « tapé, champ quitté, ✓ » (rouge sur `227f090e` : DOM-T13i, T13e2) | `_ftTape` relisait « 62,5 » ≠ « 62.5 » | S2 + `upSet` idempotent |
| Ligne restée fausse sans trace / erreur avalée dans le rendu ciblé (rouge sur `227f090e` : DOM-T17, T18) | sauts silencieux, `catch` muet | vérification de présence + `_rcRefus` (reconstruction + trace) |
| `_restIvCale` inutile | `clearInterval` annule aussi un armement ponctuel (une seule liste de minuteurs) | retiré ; CHR-T02d + mutation équivalente W22 |
| Trou de témoin D06 | le filet du rendu ciblé masquait la mutation à l'écran | DOM-T19 / T19b (aucun refus signalé en usage normal) |
| **Transverse (étude 3b, non corrigé)** : un journal alimentaire qui déborde tronque les séances locales à 50 + pose `ft4_hist_tronque` (mesuré, vrai `persist()`, quota simulé) | `persist()` = un seul `try` ; le `catch` quota réécrit `ft4_sessions` à 50 | avis **GO conditionnel 3b** (écriture dédiée de `ft4_foodlog`, hors du bloc commun) — lot séparé Nutrition, relu par Séance |

## 6. Fichiers modifiés par le lot (`e2b942f3` → `efba1514`)
`log.js` (+219 / −31 ; code seul +126 / −30) · `tests/parcours/workout_core_chr.js` (nouveau) · `tests/parcours/workout_core_dom.js`
(nouveau) · `tools/banc_workout_core.js` (nouveau) · `tools/mut_workout_core.py` (nouveau, 50 mutations + `MUT_RETIREES`) ·
`tests/parcours/seance_repos.js` (+5/−1, adaptation autorisée) · `tools/mut_seance_repos.py` (+7/−3) · `docs/WORKOUT-CORE-01.md` ·
`docs/JOURNAL-DE-PARTAGE.md` (+1, ligne du GO TESTS). **Aucun** autre fichier applicatif (`app.js`, `state.js`, `setup.js`,
`Code.js`, `screens.js`, `coach.js`, `constants.js`, `sw.js`, `nutrition-v2.js` intacts). Aucune donnée persistée nouvelle.

## 7. Tests EXÉCUTÉS (31/10, Chromium Linux, joués seuls, garde réseau) — résultats
| Contrôle | Résultat |
|---|---|
| Préalable S2 : 13 sorties de champ | frappe enregistrée à chaque sortie (devenu DOM-T15) ; app en arrière-plan NON reproductible ici |
| Banc du lot `chr,dom` (arbre final) | **84 OK / 0 rouge** |
| `227f090e` avec les témoins S2 | 78 / 4 (les 4 défauts corrigés par S2) |
| Base `e2b942f3`, témoins finaux | 43 / 41 (attendus) |
| Mutations du lot (50) | 49/50 → D06 traitée (DOM-T19) : conforme ; D14 [négatif] conforme ; arbre sain stable |
| 16 bancs voisins | **976 OK / 0 rouge** |
| Passe réduite du runner (14 blocs) | **632 ✅ / 0 ❌** |
| `mut_rir_superset` M2, M3, M5, M11, M8 | 5/5 |
| `check_regles` | 1 erreur préexistante (briques), non liée au lot |
**NON exécutés** : D-031 complète, recette iPhone, `mut_seance_repos` (aucune ancre dans une fonction touchée par S2).

## 8. Points de vigilance — `app.js`, `state.js`, `setup.js`, `Code.js`
- **`app.js`** (non touché par le lot ; très gros fichier partagé avec Nutrition) : appelle `_reposReprendre()` (l. 10762,
  contrat inchangé) ; astuce iOS `el.defaultValue=el.value` à chaque frappe (l. 10834) → `defaultValue` inutilisable comme
  preuve de frappe ; porte `_logErr` (journal `ft4_errlog`, 8 lignes) utilisé par `_rcRefus`. Claude N°1 modifie `app.js`
  (`rejouerRepas`, `_habDurable` relit `ft4_foodlog`). ⇒ prochaine mission : **toucher `app.js` le moins possible**.
- **`state.js`** : `persist()` écrit ~100 clés dans UN `try` ; le moindre dépassement de quota (quelle que soit la clé) réécrit
  `ft4_sessions` à 50 et pose `ft4_hist_tronque`, et les clés suivantes ne sont pas écrites (mesuré). `_ecrireSessionsLocal()`
  = précédent d'écriture dédiée à résultat explicite. Contrainte du lot : **aucun changement de `state.js` / `persist()`**.
- **`setup.js`** : `_cloudSync` omet les séances si `S.histTronque` ; la restauration lève le drapeau au-delà de 50 séances ;
  le journal part en `slice(-8000)` ; `_applyRestoreData` fusionne (séances par identité, journal par `_fusionnerFoodLogRestauration`).
- **`Code.js`** (non touché) : `_nutProtegerListe_` remplace la liste du journal par celle reçue et copie les lignes retirées en
  zone de récupération (`recupNut`, débordement vers Drive ; refus si Drive échoue). Tout changement backend = `clasp push` +
  `clasp deploy -i …` + `?test=1` (règle d'or #1) — hors périmètre Séance.
- **Module isolé = nouveau fichier `.js` à la racine** : l'ajouter AUSSITÔT à `.claspignore` (liste explicite ; sinon `clasp push`
  envoie du frontend dans Apps Script et casse le backend — incidents du 07/07 et du 21/07), à `index.html` (ordre des scripts),
  au pré-cache de `sw.js` ; déclencheur de la règle #17 (compteurs) ; toute nouvelle clé `ft4_*` doit être classée dans
  `tests/donnees/runner.js` (R4a).

## 9. Nutrition en parallèle — NUT-SYNC-01
- **Aucune branche distante NUT-SYNC-01 trouvée au 01/11** (`git ls-remote` sur `*sync*` : vide) — à confirmer auprès du CTO.
- Branche Nutrition connue : `claude/nut-ref-hist-02` @ `ad658939` (rapport GO TESTS ORANGE ; `app.js` + tests ; touche aussi
  `tests/parcours/runner.js` +2). Ne jamais fusionner les branches l'une dans l'autre ; seul fichier commun connu : le journal de partage.

## 10. Interdits en vigueur
Aucun push (hors autorisation explicite), merge, intégration, déploiement ni numéro de version · pas de D-031 complète sans GO ·
aucun fichier partagé sans accord · pas de `state.js` / `persist()` dans ce lot · aucun son (pas d'`AudioContext`) · aucun test
sur données réelles · ne jamais présenter un test Chromium comme une validation iPhone.

## 11. Prochaine mission (objectif annoncé par Michel)
Corrections Séance avec **impact minimal sur `app.js`**, en privilégiant des **modules isolés** (voir §8 : `.claspignore`,
`index.html`, `sw.js`, règle #17, R4a). Ne pas refaire les travaux terminés ci-dessus ; repartir de `efba1514` (ou du commit qui verse ce fichier). Protéger les fichiers
communs à la Nutrition (`app.js`, `state.js`, `setup.js`, `docs/JOURNAL-DE-PARTAGE.md`, `tests/parcours/runner.js`).
