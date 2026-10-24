# ⚡ D-031 accélérée — la passe complète, ENTIÈRE, jouée en 3 processus

> **Statut : PROPOSITION (`D-113`) — qualifiée le 24/10/2026 sur la branche `claude/d031-acceleree`, NON ADOPTÉE.**
> ⛔ Tant que Michel n'a pas donné son GO distinct, **la passe officielle reste `bash tools/passe_valide.sh`**
> (règle d'or #13, `D-031`), et rien de ce qui suit ne remplace quoi que ce soit.
> Origine : l'expérience OPTI-TEST-02 (session-A, 23-24/10, sur copies de `ft-v1259` ; six fichiers livrés sur
> `claude/opti-test-02-livraison` @ `bf5d584f`, empreintes sha256 vérifiées), puis la qualification ci-dessous
> (session-B, 24/10, sur le code de `ft-v1260`).

## 1. Ce que c'est — et ce que ce n'est pas

- **Les mêmes contrôles, aucun réécrit.** `tools/decouper_passe.js` lit `tests/parcours/runner.js` (sans le modifier)
  et en écrit **3 copies temporaires** `tests/parcours/runner.part-3-{0,1,2}.js` : chaque instruction de premier niveau
  y est **gardée telle quelle** ou **remplacée par « ; »**. `tools/verifier_decoupe.js` **contre-vérifie** les copies
  sans faire confiance au découpeur (rien d'oublié, rien de doublé, rien de réécrit). Les 3 copies tournent **en même
  temps**, puis sont **supprimées**.
- **Ce qui est joué dans chaque processus** : l'infrastructure (serveur, navigateur, enveloppes et **preuve** du garde
  réseau, fermeture, ligne de total). **Ce qui est joué une seule fois** : chaque module awaité (tous ses appels dans
  le même processus, selon `tests/parcours/repartition-3.json`) ; tout le reste — les blocs du runner, la page
  partagée, les autres contrôles du garde, les contrôles de source après la fermeture — dans le **processus 0**, dans
  l'ordre.
- ⛔ **Ce n'est PAS un sous-ensemble.** Le refus du 13/09 tient (`docs/PROTOCOLE-DEUX-SESSIONS.md` §2) : *un
  sous-ensemble ne remplace rien*. Ici, **chaque** contrôle de la passe classique est joué.
- **Le seul écart attendu** : les **19 témoins du garde** (16 `D031S-I` + 3 `D031S-II`) sont joués dans **chaque**
  processus — chaque processus doit prouver son propre garde réseau. Le total réparti vaut donc le total classique
  **+ 2 × 19** ; la ligne « équivalent séquentiel » le retire.
- **Fermé par défaut** : une instruction que le découpeur ne sait pas classer **arrête** la découpe (code 3) et
  `passe_repartie.py` renvoie vers la passe classique. ⛔ **L'ancien découpeur d'OPTI-TEST-02 ne doit plus servir** :
  sur le runner actuel il triplait **en silence** 4 instructions (3 contrôles du garde et `d031s_rir_superset`) —
  `BUGS.md` §102.

## 2. Les commandes

```bash
python3 tools/passe_repartie.py 3 <dossier des journaux>        # la passe, ses 8 conditions, les copies retirées
node tools/banc_journal_qty_guard.js > <dossier>/banc-journal_qty_guard.log   # À PART, comme en classique
```
⚠️ **Le banc `journal_qty_guard` n'est pas dans le runner** (bloc asynchrone, `BUGS.md` §61) : ni la passe classique
ni la répartie ne le jouent. Il se lance **à part**, seul sur la machine, quand le sélecteur le demande.

## 3. Les 8 conditions — toutes, sinon NON VALIDE

| | condition | comment elle se vérifie |
|---|---|---|
| ① | une **ligne de total** dans chacun des 3 journaux | `TOTAL CROISÉ : N ✅ · M ❌` lue dans `p0.log`, `p1.log`, `p2.log` |
| ② | chaque processus a fini en **code 0** | le code du `node` lui-même, jamais celui d'un tube (leçon du 13/09) |
| ③ | l'**arbre n'a pas changé** pendant la passe | `git rev-parse HEAD` avant = après |
| ④ | **aucune publication concurrente** | `git fetch -q --all` puis `git rev-list --count HEAD..origin/master` = 0 |
| ⑤ | **0 rouge réel**, tous journaux confondus | rouges ancrés en début de ligne (`^\s+❌`) — un ❌ dans un libellé n'en est pas un |
| ⑥ | **aucun plantage, aucune interruption, aucun défaut de garde** | aucun « a PLANTÉ », « PASSE INTERROMPUE AVANT LA LIGNE DE TOTAL », « GARDE RÉSEAU NON PROUVÉ »… |
| ⑦ | les **témoins du garde** présents, **verts**, et **les mêmes** dans chaque processus | 19 aujourd'hui (16 `D031S-I` + 3 `D031S-II`) |
| ⑧ | **copies retirées, dépôt revenu à son état d'avant** | `git status --porcelain` avant = après, aucun `runner.part-*.js` |

⚠️ ⑦ compare les processus **entre eux** et exige le vert ; il ne compte pas « 19 » en dur — si le runner gagne ou
perd un témoin du garde, le nombre change légitimement. **À chaque qualification**, le nombre se vérifie contre la
passe classique du même commit (la comparaison ci-dessous le fait).

## 4. La comparaison classique ↔ répartie (qualification)

```bash
bash tools/passe_valide.sh <réf>/p0.log                              # la classique, SEULE sur la machine
python3 tools/passe_repartie.py 3 <cand>                             # puis la répartie, SEULE
python3 tools/comparer_passes.py <réf> <cand> --normaliser tests/parcours/comparaison-normalisation.json
```
- **Multiensembles de (libellé, verdict)**, témoin par témoin : chaque processus porte tout le garde ; la réunion,
  moins 2 copies du garde, doit être **IDENTIQUE** à la classique — mêmes libellés, mêmes verdicts, mêmes nombres.
  Les bancs à part (`banc-*.log`) se comparent banc par banc.
- **Normalisation : 3 règles, 4 libellés, rien d'autre** — ils **affichent l'horloge** de la passe et changent même
  entre deux classiques : `B-D086-⑫a` ×2 (l'heure, `tests/parcours/ux_d086.js` l. 299) · `PS-E13` et `PS-E14` (une
  date calculée depuis le jour, `tests/parcours/progres_seances.js` l. 287 et 299).
  ⛔ **Jamais de règle pour faire disparaître un écart de la passe répartie** : une règle ne s'ajoute que si elle est
  **établie entre deux passes CLASSIQUES** (R0 ↔ R1), et la sortie compte chaque libellé touché.

## 5. ⚖️ Politique proposée — quand la classique reste obligatoire, quand la répartie suffit

**La répartie suffit** pour la passe complète finale (`D-031`) d'une livraison, **aux trois conditions** :
1. `passe_repartie.py` dit **PASSE RÉPARTIE VALIDE** (les 8 conditions) ;
2. la méthode est **qualifiée pour l'état courant** : aucun « déclencheur de requalification » (ci-dessous) n'a changé
   depuis la dernière qualification réussie ;
3. elle tourne **seule** sur la machine, **hors des fenêtres de minuit** (21:40–22:05 et 23:40–00:05 UTC).

**La classique reste OBLIGATOIRE** :
- **R1 · requalification** (une classique **et** une répartie sur le **même commit**, comparaison **IDENTIQUE**) quand
  change : l'un des 6 fichiers ; l'**infrastructure** du runner (serveur, navigateur, garde réseau
  `tests/_garde_reseau.js`, `tests/_plantages.js`, fermeture, ligne de total) ; l'**environnement** (Playwright,
  Chrome, Node — comme le 24/10) ; la **répartition** (un module change de processus).
- **R2 · confirmation** : un rouge, un plantage, une interruption ou une condition non verte en répartie → **la
  classique tranche** avant d'accuser le code. Rouge confirmé = vrai défaut ; vert en classique = **anomalie de la
  répartie** → retour à la classique jusqu'au diagnostic. ⛔ Jamais de vert présenté sans ces conditions.
- **R3 · refus du découpeur** (structure inconnue du runner) → classique ; c'est automatique (code 3, message).
- **R4 · contrôle de dérive** : une classique **au moins une fois par semaine où l'on publie**, sur le même commit qu'une
  répartie, comparée. C'est le seul filet contre une **dépendance d'ordre entre modules** (un module qui ne passe
  que parce qu'un autre, désormais dans un autre processus, a laissé un état) — aucune des 8 conditions ne la voit.

**Ce qui ne change pas** : `D-031` (sur quel arbre la passe doit avoir tourné ; ce qu'on peut ajouter après elle),
le sélecteur de recette, les bancs à part, les petits bancs pendant le travail.

## 6. Retour arrière — en une ligne

`bash tools/passe_valide.sh` n'a **jamais changé** : on y revient, et on retire les 6 fichiers
(`git rm tools/decouper_passe.js tools/verifier_decoupe.js tools/passe_repartie.py tools/comparer_passes.py
tests/parcours/repartition-3.json tests/parcours/comparaison-normalisation.json`). Rien d'autre ne dépend d'eux :
`tests/parcours/runner.js`, les tests et l'application ne sont pas modifiés.

## 7. Limites résiduelles — dites, pas cachées

- **Charge** : 3 navigateurs à la fois (charge ~9 sur 4 cœurs, OPTI-TEST-02). D'où « seule sur la machine » ; une
  machine plus lente rendrait des délais plus serrés — un rouge de délai se confirme en classique (R2).
- **Dépendances d'ordre** entre modules : invisibles aux 8 conditions → R4.
- **Modules hors répartition** : un module ajouté au runner sans entrée dans `repartition-3.json` tourne **dans le
  processus 0** — couvert, jamais perdu, mais il **allonge** le processus 0. Le 24/10 : 2 modules Nutrition V2
  (`nut2_parcours.js`, `nut_v2_p1_croise.js`), mesurés §8. Une nouvelle répartition se **mesure** et se requalifie
  (R1), elle ne s'écrit pas à la main.
- **Les 4 libellés horodatés** restent dans les tests : les corriger, c'est modifier des tests (preuve propre et
  accord de Michel).
- **Conteneur qui redémarre** (2 fois en 12 h pendant OPTI-TEST-02) : une passe coupée n'a pas de ligne de total → elle
  est **invalide**, jamais verte ; on la relance.
- **Non mesuré** : 2 processus (retiré par Michel avant de démarrer), 4 processus (charge).
- Le rapport PDF d'OPTI-TEST-02 n'était pas accessible à la session-B (ni dans le dépôt, ni sur le Drive) : la
  qualification s'appuie sur la passation de la session-A et sur ses propres mesures.

## 8. La qualification du 24/10/2026 (code de `ft-v1260`, commit `ee61e669`)

| | classique (référence) | répartie (3 processus) |
|---|---|---|
| verdict | **PASSE VALIDE** (4 conditions) | **PASSE RÉPARTIE VALIDE** (8 conditions) |
| total | **7 920 ✅ · 0 ❌** | **7 958 ✅ · 0 ❌** = 7 920 + 2 × 19 (équivalent séquentiel : 7 920) |
| par processus | — | p0 : 5 577 · p1 : 1 041 · p2 : 1 340 ; 19 témoins du garde, verts, dans chacun (`SORTIE = 0` partout) |
| durée | **96,2 min** (12:52 → 14:28 UTC) | **37,2 min** (14:29 → 15:07 UTC) ; fin de p0 à 37,3 min · p1 33,6 · p2 34,1 |
| banc `journal_qty_guard` (à part, seul) | 23 OK / 0 rouge | 23 OK / 0 rouge, identiques libellé par libellé |

- **Comparaison** (`tools/comparer_passes.py`, puis une contre-vérification indépendante qui relit les journaux
  elle-même) : **IDENTIQUE** témoin par témoin. Écarts bruts : 2, tous deux `B-D086-⑫a` (l'heure de la passe) ; les
  règles d'horloge touchent exactement les 4 libellés documentés, de chaque côté.
- **Deux classiques du même jour** (celle du matin, code de `ft-v1260`, et la référence) : identiques après les mêmes
  règles — aucun autre libellé ne dépend de l'horloge.
- **Les modules Nutrition V2 hors répartition** (`nut2_parcours.js` : 111 témoins · `nut_v2_p1_croise.js` : 16) : joués
  dans le **processus 0 seulement**, mêmes témoins que la classique, tous verts. Ils coûtent **~3,3 min** (136 + 60 s) au
  processus 0, qui est **le plus long** : sans eux, il finirait vers 34 min. Une autre répartition gagnerait 1 à 2 min au
  mieux (estimation, **non mesurée**) — elle se mesure et se requalifie (R1), elle ne s'écrit pas à la main.
- **Gain réel** : 96,2 → 37,2 min, **×2,6, soit −59 min par validation complète** (le banc à part, ~23 s, est le même
  des deux côtés). L'objectif de 33-35 min est dépassé de 2 à 4 min, et la mesure dit pourquoi : les 2 modules V2 en p0.
- **Retour arrière rejoué à blanc** : sans les 6 fichiers, l'arbre est identique à master (`5cf5b8cb`) et
  `check_regles` est vert.
