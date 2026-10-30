# WORKOUT-CORE-01 — Séance : un seul métronome de repos, rendu ciblé des séries

> **Statut (30/10/2026)** : **CODÉ SUR BRANCHE ISOLÉE, NON TESTÉ, NON FUSIONNÉ, NON PUBLIÉ.**
> Agent : Claude N°2 (Séance, session-C) · ordre « GO DÉVELOPPEMENT sous conditions » du 30/10 · **GO TESTS non accordé**.
> Branche `claude/workout-core-01`, partie de `e2b942f3` (`ft-v1263`, base commune vérifiée au fetch).
> Seul fichier applicatif modifié : **`log.js`**. Aucun numéro de version posé, aucune donnée persistée nouvelle.

| Commit | SHA | Contenu |
|---|---|---|
| Réservation | `46d4fc10` | ligne au journal commun, avant tout code |
| **A — CHR-03** | `6523d74d` | métronome unique (log.js +94 / −28) + témoins CHR préparés + 2 adaptations autorisées |
| Journal A | `21d63c8f` | SHA, fonctions, lignes, état des tests |
| **B — DOM-01/02** | `bf077948` | rendu ciblé + saisie validée (log.js +98 / −2) + témoins DOM préparés |
| Journal B + ce document | (commit suivant) | — |

---

## 1. CHR-03 — un seul métronome de repos, à 1 s

**Avant** : deux intervalles par repos — `restIv` à 250 ms (`_restTick`) et `_pillIv` à 500 ms (`_updPill`, qui refaisait ce que
`_restTick` faisait déjà). Environ 6 réveils par seconde pour un affichage qui ne change qu'une fois par seconde (le temps restant est un
nombre entier de secondes). Le dock réécrivait ses 9 valeurs à chaque tic. Le cadran final repeignait ses 44 traits à chaque tic — et,
après le GO, encore à chaque tic tant que l'écran restait ouvert (jusqu'à 15 min).

**Après** :

| Élément | Comportement |
|---|---|
| `_pillIv` | **supprimé** (déclaration et 5 usages) |
| `restIv` | le SEUL minuteur périodique du repos : `setInterval(_restTick,1000)` |
| `_restArmer()` | (re)pose le métronome : `_restDesarmer()` d'abord (aucun doublon), rien si `!restStartTs` (jamais après `stopRest`), puis un **armement ponctuel annulable** jusqu'à « changement de seconde + 100 ms » (`(1100 − pos) % 1000`), qui installe l'intervalle et fait un `_restTick()` |
| `_restDesarmer()` | incrémente le jeton `_restGen`, annule l'armement ponctuel (`clearTimeout`) ou l'intervalle (`clearInterval`) selon `_restIvCale` |
| Jeton `_restGen` | un rappel d'armement d'une autre génération ne fait rien (défense en profondeur : il est aussi annulé) |
| Appelé par | `startRest`, `_reposReprendre`, `addRT` (±15 s), `applyRestEdit` (« Régler »), le retour au premier plan (`visibilitychange`) — et nulle part ailleurs |
| Temps restant | `_restLeft()` inchangé : `restTot − ⌊(Date.now() − restStartTs) / 1000⌋` ; aucun compteur de tics |
| Retour au premier plan | UN `_restTick()` sur l'heure réelle (aucun tic rattrapé, seule la seconde en cours peut vibrer, fin une seule fois), puis recalage |
| Écritures | `_vuTexte` / `_vuStyle` : n'écrivent que si la valeur change ; la mémoire `_restVu` (≈ 15 clés fixes, aucune fuite) est vidée là où l'écran est remis à zéro par d'autres lignes (`_stopRestTimerOnly`, ouverture et fermeture du décompte, reprise) |
| Cadran (44 traits) | construit une fois (inchangé), puis seuls les traits qui changent d'état sont repeints (`_cdownLit`) |

**Pourquoi le calage** (arbitrage du 30/10) : à 250 ms chaque seconde était lue quatre fois ; à 1 s, une seule. Or le tic tombait pile sur
le changement de seconde (`restStartTs` posé juste avant l'intervalle) : 1 ms d'avance de la minuterie sur `Date.now()` suffit à lire la
seconde d'avant (chiffre sauté ou doublé, vibration 5…1 manquée). Calé à +100 ms : 99 ms d'avance et 899 ms de retard tolérés.
⛔ Ce n'est pas une garantie contre iOS, qui gèle les minuteurs en arrière-plan : c'est le retour au premier plan qui relit l'horloge.

**`restIv` reste non nul pendant le calage** (il porte l'armement ponctuel, `_restIvCale = true`) : l'invariant « `restIv` non nul ⇔ un
repos est armé » est lu par la pastille, `renderLog`, le retour au premier plan et **13 lectures dans 5 bancs existants** — il est
préservé, aucun de ces fichiers n'est touché.

**Inchangés** : 900 s de dépassement (`REST_DEPASSEMENT_MAX`), ±15 s (`REST_PLUS_MAX`), « Régler », « Passer », tap sur GO, RIR, callbacks
de fin (`_restBeeped`, `_restDoneCb`, `_cdownPendingCb`), persistance du repos (`_reposMemoriser`), avance automatique, aucun son.
`_wktChronoIv` (chrono de séance) : hors périmètre, non touché.

Réveils pendant un repos (calculés d'après les cadences, **pas mesurés**) : ≈ 7/s → 2/s (le repos + le chrono de séance).

## 2. DOM-01/02 — rendu ciblé d'une série

**Avant** : chaque validation (et chaque réponse de réserve) appelait `renderExBlocks()`, qui remplace tout `#wkt-exs`. Tous les champs de
la séance étaient détruits puis recréés : le champ où l'on préparait la série suivante perdait son focus, sa sélection et son texte pas
encore enregistré, et le clavier de l'iPhone se fermait.

**Après** : `updateWorkoutSetDOM(ei, si, avant)` fabrique la carte à jour avec le **même gabarit** que le rendu global (`_renderExHtml`,
dans un `<template>` inerte : rien n'y est chargé ni exécuté) et ne recopie sur les nœuds existants que ce qui a changé. Puis il appelle
les deux résumés qui en dépendent, comme `renderExBlocks` (`renderLogFinish`, `_renderEnteteSeance`). Il rend `false` — et l'appelant
reconstruit tout, comme avant — dès que le cas n'est pas ordinaire.

| Appel | Rendu |
|---|---|
| `toggleSet`, fin ordinaire (valider / dé-valider une série hors groupe, hors dropset, carte ouverte) | **sur place** |
| `setRir` (réserve, échec, retrait) hors groupe / dropset | **sur place** |
| `toggleSet` : dropset ↓ palier suivant / dernier palier, superset et drop de groupe, pyramide, tour suivant, exercice suivant (fin du repos) | global (inchangé : la structure change) |
| `toggleSet` / `setRir` sur un exercice de groupe ou à dropset | global (repli) |
| Les 40 autres appels de `log.js` (ajout / retrait de série ou d'exercice, groupes, dropset, notes, type de série, ouvrir une carte, programme, Milo, images, `renderLog`…) et `setup.js:3221` | global (non modifiés) |

Ce qui est recopié : classes de chaque ligne (`done-row`, `set-cur`), coche ✓, 1RM de **la série touchée** (celui d'une autre série suit sa
saisie en cours), pastille N / É / X (classe, texte, `title`, `aria-label`), méta de la carte. Refus : groupe, dropset, mode « Grouper »,
carte repliée ou absente, nombre de séries changé, ligne manquante, colonne « Précédent » qui se réalignerait.

**`setRir`** : `if(updateWorkoutSetDOM(…)){ persist(); _renderRirRow(); } else{ persist(); _renderRirRow(); renderExBlocks(); }` — la ligne
d'avant reste telle quelle en repli (l'ancre M8 de `tools/mut_rir_superset.py`, fichier non autorisé ici, reste donc valable).

### Saisie validée (arbitrage du 30/10)

`_saisieVersModele(ei, si, row)` : au geste de **validation**, chaque champ de **cette** série dont le texte diffère de ce que le modèle
affiche passe par `upSet` — exactement ce qu'aurait fait l'événement `change` (mêmes conversions `numFR`, même 1RM, même sauvegarde).
- un champ **vide** n'est pas une valeur : la règle existante de `toggleSet` s'applique (modèle vide → suggestion grise ; modèle rempli →
  modèle). « 0 » est une valeur. Vide, zéro et suggestion restent distincts ;
- les champs des **autres** séries ne sont jamais lus ;
- le champ actif de la série validée **affiche la valeur retenue puis rend le focus** : le clavier se ferme comme avant (la reconstruction
  détruisait ce champ), et aucun `change` tardif ne peut écrire 0 dans une série validée ;
- « Entrée » sur KG : inchangé, le focus passe à la série suivante (`confirmSetAndNext`) ;
- **dé-valider** ne touche pas au champ actif : la saisie continue.

## 3. Témoins préparés — NON EXÉCUTÉS

Seuls contrôles faits : syntaxe (`node --check`, `py_compile`), **unicité des 104 ancres** de `mut_workout_core.py` (37),
`mut_seance_repos.py` (51) et `mut_rir_superset.py` (16), syntaxe de chaque `log.js` muté, aucune autre ancre de `tools/mut_*.py` cassée par
le lot. Les témoins de source (CHR-S*, DOM-S*) n'ont pas été évalués non plus.

| Fichier | Contenu |
|---|---|
| `tests/parcours/workout_core_chr.js` | CHR-T01 → CHR-T11, CHR-S1 → CHR-S4 |
| `tests/parcours/workout_core_dom.js` | DOM-T01, T01b, T02 → T05, T06, T07, T07b, T08, T09a → T09d, T10, T11, T12, DOM-R1, DOM-S1 → S3 |
| `tools/banc_workout_core.js` | `node tools/banc_workout_core.js [chr\|dom]` — sous garde réseau, plantage = code 2 |
| `tools/mut_workout_core.py` | 21 mutations CHR + 16 DOM (dont 4 négatives / équivalentes, 7 déguisées) — `python3 tools/mut_workout_core.py [W,D]` |
| `tests/parcours/seance_repos.js` | **adapté** : `heure()` attend 1 250 ms au lieu de 450 (« ≥ un tick (250 ms) ») — aucune assertion touchée |
| `tools/mut_seance_repos.py` | **adapté** : M24 et M28 réancrées sur le nouvel armement (même intention, mêmes témoins C-REP-A3 / A4) |

Rouges attendus sur `e2b942f3` : CHR-T01, T02a, T02b, T09a, T10a → T10e, CHR-S1 ; DOM-T01 → T04, T09b, T11, T12, DOM-R1, DOM-S1 ;
**à mesurer** : DOM-T05, DOM-T09a, DOM-T09c (dépendent de ce que le navigateur faisait d'un champ détruit). Les autres sont des
non-régressions. CHR-T10 imprime aussi les métriques Chromium (recalculs de style, mises en page, temps de script) — ⛔ **indicateurs,
jamais une mesure de batterie**.

Exécution future (sur GO TESTS) : nouveau banc ≈ 3 min ; bancs voisins `seance_repos`, `rir_superset`, `d031s_rir_superset`, `cc01_dropset`,
`dropset_programme`, `groupes_orphelins`, `seance_ux`, `ux_d086`, `ux_integration`, `seance_recette`, `seance_chiffres`, `seance_unicite`
+ blocs repos du runner (`passe_reduite.js`) ≈ 35-40 min ; mutations ≈ 25 min ; mesure du bouton « + » (règle #9). ≈ 1 h 15 au total.
0 appel Milo. Pas de passe D-031 complète sans GO spécifique.

## 4. Risques et limites

- **Rien n'a tourné** : les témoins peuvent demander un ajustement au premier passage (attentes de 1 Hz, sélecteurs) — ce sera un défaut de
  témoin, à distinguer d'une régression de l'app.
- **iPhone** : clavier réel, vibrations, gel des minuteurs en arrière-plan, batterie — recette obligatoire avant publication. Points à
  regarder : le clavier reste ouvert quand on valide une AUTRE série pendant la saisie (voulu) ; dé-valider avec un champ actif garde le
  clavier (nouveau) ; valider la série où l'on tape ferme le clavier (comme avant).
- Les chiffres du chrono changent ≈ 0,1 s après la seconde (au plus 0,25 s avant).
- La pastille apparaît dès le démarrage d'un repos hors de l'écran Séance et à la réouverture (avant : au premier tic, ≤ 0,25 s).
- Valider une série dont la valeur a été tapée sans « change » enregistre désormais cette valeur (arbitrage du 30/10) : c'est un
  changement de DONNÉES voulu, sur ce seul cas.
- `renderLogFinish` (deux figurines) reste recalculé à chaque validation, comme avant ; `_renderExHtml` est fabriqué une fois par geste
  pour la carte touchée (au lieu de toutes les cartes).

**Constatés en lisant, hors de ce lot, non reproduits, non corrigés** :
- dropset ↓ dans un exercice : l'étiquette « 📉 Série dégressive terminée » est posée AVANT `startRest()`, qui l'efface — le témoin DOM-T07
  ne l'exige donc pas ;
- `tools/mut_rir_superset.py` M9 : son ancre dans `setup.js` est déjà absente sur `e2b942f3` (mutation invalide avant ce lot) ;
- au retour au premier plan après la fin d'un repos : une vibration de fin et l'avance automatique ; à la réouverture de l'app : ni l'une ni
  l'autre (comportement existant, décision produit, inchangé ici).

## 5. Coordination, Git, retour arrière

- Claude N°1 (`claude/nut-ref-hist-02`, `00bde308`, base `e2b942f3`) : `app.js`, tests Nutrition, journal. **Seul fichier commun : le
  journal** (les deux flottes insèrent une ligne en tête du tableau → conflit de texte attendu à l'intégration, garder les deux lignes).
  Aucun fichier applicatif commun ; `screens.js` non touché ; aucun fichier de test partagé (`runner.js`, registre) touché.
- Lien indirect unique : `app.js:10762` appelle `_reposReprendre()` — nom et contrat inchangés.
- `master` non touché. **Retour arrière** : ne pas fusionner la branche, ou `git revert bf077948 6523d74d` (B puis A ; les commits de
  documentation n'ont aucun effet applicatif).
- Décisions à consigner à l'intégration (`docs/DECISIONS.md` hors périmètre de cet ordre) : calage « seconde + 100 ms » et saisie validée
  prioritaire (arbitrages du 30/10) — numéros proposés D-127 / D-128 (réserve de la session).
- Règle d'or #11 : aucun geste nouveau, aucun repère déplacé → pas de pop-up proposée ; les aides ne décrivent ni la cadence du chrono ni la
  reconstruction de l'écran (à confirmer à l'intégration).

**Règle #17 (code applicatif seul)** : données persistées ajoutées **0** · fichiers applicatifs touchés **1** (`log.js`) · **+192 / −30**
lignes (code seul : +115 / −29, le reste en commentaires) · anciens chemins supprimés ou fusionnés **4** : le second intervalle (`_pillIv`)
fusionné dans le métronome unique, le tic à 250 ms, les écritures inconditionnelles du dock / de la pastille / du cadran, la reconstruction
globale pour une validation ordinaire et une réponse de réserve (repli conservé).
