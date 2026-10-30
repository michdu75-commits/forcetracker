# WORKOUT-CORE-01 — Séance : un seul métronome de repos, rendu ciblé des séries

> **Statut (30/10/2026, fin du GO TESTS)** : **CODÉ ET TESTÉ SUR BRANCHE ISOLÉE (tests ciblés, Chromium Linux) · NON INTÉGRÉ ·
> NON PUBLIÉ · NON VÉRIFIÉ SUR IPHONE.**
> Agent : Claude N°2 (Séance, session-C) · ordres « GO DÉVELOPPEMENT sous conditions » puis « GO TESTS CIBLÉS — AUCUNE INTÉGRATION
> AUTORISÉE » du 30/10. Branche `claude/workout-core-01`, partie de `e2b942f3` (`ft-v1263`, base commune ; `origin/master` inchangé).
> Seul fichier applicatif modifié : **`log.js`**. Aucun numéro de version posé, aucune donnée persistée nouvelle, aucune passe D-031
> complète, aucun appel Milo, aucune donnée réelle (garde réseau des tests sur chaque banc).

| Commit | SHA | Contenu |
|---|---|---|
| Réservation | `46d4fc10` | ligne au journal commun, avant tout code |
| **A — CHR-03** | `6523d74d` | métronome unique + témoins CHR préparés + 2 adaptations autorisées |
| Journal A | `21d63c8f` | SHA, fonctions, lignes |
| **B — DOM-01/02** | `bf077948` | rendu ciblé + saisie validée + témoins DOM préparés |
| Rapport de développement | `00a2b6f2` | ce document (1ʳᵉ version), journal |
| Journal GO TESTS | `6309015e` | « GO TESTS ciblés en cours » |
| Témoins CHR corrigés | `df48ea89` | CHR-T03b, CHR-T05b/c/d, CHR-T09a — défauts **des témoins**, prouvés sur la base |
| Matrice de saisie | `7bbb3b6b` | DOM-T13a → f (cas 1, 3, 5, 7, 10 de l'ordre) + DOM-T03 durci |
| **Correctif 1** | `18769fd2` | quitter le champ validé ne refait plus d'`upSet` (mutations D17 → D19) |
| **Correctif 2** | `8d605500` | seule une FRAPPE est une saisie (`session_integrity` T1) — DOM-T13g, T13h, T14, mutations D20, D21 |
| Anomalies de mutations | `f374662c` | W05 reclassée, CHR-T10f (W18 survivait), DOM-T09e (D09 survivait) — témoins seulement |
| Bornes du calage | `ead0aef1` | CHR-S5 — exigé par l'ordre (« (1100 − pos) % 1000, en particulier pos = 100 ») |
| Rapport GO TESTS | (commit de ce document) | résultats, recette iPhone, journal |

---

## 1. CHR-03 — un seul métronome de repos, à 1 s

**Avant** : deux intervalles par repos — `restIv` à 250 ms (`_restTick`) et `_pillIv` à 500 ms (`_updPill`, qui refaisait ce que
`_restTick` faisait déjà). Le dock réécrivait ses 9 valeurs à chaque tic ; le cadran final repeignait ses 44 traits à chaque tic — et,
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

**`restIv` reste non nul pendant le calage** (il porte l'armement ponctuel, `_restIvCale = true`) : l'invariant « `restIv` non nul ⇔ un
repos est armé » (la pastille, `renderLog`, le retour au premier plan, 13 lectures dans 5 bancs existants) est préservé. Aucune
confusion possible entre les deux : `_restDesarmer` choisit `clearTimeout` ou `clearInterval` d'après `_restIvCale` (CHR-T02c, mutations
W03 à W05).

**Inchangés** : 900 s de dépassement, ±15 s, « Régler », « Passer », tap sur GO, RIR, callbacks de fin, persistance du repos, avance
automatique, aucun son. `_wktChronoIv` (chrono de séance) : hors périmètre, non touché.

## 2. DOM-01/02 — rendu ciblé d'une série, saisie validée

`updateWorkoutSetDOM(ei, si, avant)` fabrique la carte à jour avec le **même gabarit** que le rendu global (`_renderExHtml`, dans un
`<template>` inerte) et ne recopie sur les nœuds existants que ce qui a changé ; il rend `false` — et l'appelant reconstruit tout,
comme avant — dès que le cas n'est pas ordinaire (groupe, dropset, mode « Grouper », carte repliée, structure changée). Sur place :
`toggleSet` (fin ordinaire) et `setRir` ; les 6 enchaînements structurels de `toggleSet` et les autres appels gardent `renderExBlocks()`.

### Saisie validée (arbitrage du 30/10, deux correctifs du GO TESTS)

`_saisieVersModele(ei, si, row)` : au geste de **validation**, chaque champ de **cette** série qui a reçu une **frappe** (marque
`_ftTape`, posée par l'événement `input`) et dont le texte diffère du modèle passe par `upSet` — exactement ce qu'aurait fait `change`.
- **seule une frappe est une saisie** (correctif 2) : tout geste de saisie émet `input` (clavier, dictée, correction) ; un script qui
  change `.value`, non. Un modèle changé par le code sans redessiner l'écran garde donc sa valeur — l'ancien texte affiché ne la
  remplace plus en silence (trouvé par `session_integrity` T1). La marque se consomme à la validation (DOM-T13h).
  ⚠️ Pas `defaultValue` : `app.js` le recopie à chaque frappe (astuce iOS « Voulez-vous annuler la saisie ? ») — essayé, mesuré, annulé ;
- un champ **vide** n'est pas une valeur ; « 0 » en est une ; la suggestion grise reste la règle d'avant (modèle vide → suggestion) ;
- les champs des **autres** séries ne sont jamais lus ;
- le champ actif de la série validée **affiche la valeur retenue puis rend le focus** (le clavier se ferme comme avant) ; le
  gestionnaire `onchange` est retiré le temps du `blur()` (correctif 1 : le `change` émis en partant refaisait un `upSet`, donc une
  sauvegarde complète de plus — `persist` réécrit tout l'historique) ;
- « Entrée » sur KG : inchangé ; **dé-valider** ne touche pas au champ actif : la saisie continue, son `change` partira en le quittant.

## 3. Tests exécutés (GO TESTS du 30/10) — témoins du lot

Banc : `node tools/banc_workout_core.js [chr|dom]` (garde réseau en 1ʳᵉ instruction, serveur local, contextes neufs, aucune donnée
réelle, aucun réseau). Base de comparaison : copie de `e2b942f3` + les mêmes témoins.

| Passage | Lot | Base `e2b942f3` | Lecture |
|---|---|---|---|
| CHR, 1ᵉʳ | 30 OK / 2 rouges | 15 OK / 17 rouges | CHR-T03b et T09a : défauts des témoins ; T05b/c/d rouges sur la base à tort |
| CHR, témoins corrigés | **32 OK / 0** | **19 OK / 13 rouges** | les 13 attendus (architecture), et eux seuls |
| DOM, 1ᵉʳ (avec DOM-T13) | 30 OK / 3 rouges | 14 OK / 19 rouges (33 témoins) | DOM-T13a/c/d : vrai défaut du lot → correctif 1 |
| DOM, correctif 1 | 33 OK / 0 | — | — |
| `session_integrity` (voisin) | 92 OK / **1 rouge (T1)** | 93 OK / 0 | vrai défaut du lot → correctif 2 (témoin T1 intact) |
| DOM, correctif 2 (+ T13g, T13h, T14) | **37 OK / 0** | — | — |
| CHR + DOM (+ CHR-T10f, DOM-T09e), joué seul | 72 OK / 0 rouge (CHR 33, DOM 39 ; 2 min 19 s) | 37 OK / 35 rouges : CHR 19 / 14 (les 13 attendus + CHR-T10f), DOM 18 / 21 (dont DOM-T09e) ; DOM-T13g, T13h et T14 verts (non-régressions) | arbre `f374662c` |
| **CHR + DOM, témoins finaux (+ CHR-S5), joué seul** | **73 OK / 0 rouge** (CHR 34, DOM 39 ; 2 min 21 s) | CHR 19 / 15 (+ CHR-S5 : pas de `_restArmer` à exécuter) | arbre final |

**Défauts des témoins (corrigés, aucune assertion historique touchée)** :
- **CHR-T03b** exigeait `S.wkt` absent après « Annuler » / « Terminer » ; or `renderLog` recrée une séance VIDE (base comme lot). Il
  vérifie maintenant ce qui compte : 0 exercice, 0 repos rangé, 0 séance en cours sur le téléphone, 1 séance enregistrée.
- **CHR-T09a** lisait la pastille à un instant quelconque ; le chiffre change ~0,1 s après la seconde (calage voulu) : lu au milieu
  d'une seconde, comme CHR-T05a.
- **CHR-T05b/c/d** comptaient toute ÉCRITURE du chiffre (la base réécrit le même texte 4 fois/s) au lieu de ses CHANGEMENTS : ils
  mesurent maintenant le retard d'affichage — leur promesse — et sont verts sur la base aussi (non-régressions).
- **DOM-T03** était vert à tort sur la base (il lisait la sélection d'un champ détruit) : il exige le même champ, toujours actif.
- **DOM-T13b** (ma 1ʳᵉ écriture) prenait un `.value` posé par script pour une saisie : ses champs émettent maintenant `input`, comme
  une vraie frappe (toujours aucun `change`).
- **Trous de couverture révélés par les mutations** (§5) : CHR-T10f (rien n'est réécrit de ce qui ne change pas — W18 survivait au
  seuil global de CHR-T10b) et DOM-T09e (un `change` différé sur le chemin de reconstruction — D09 survivait). Et une erreur de
  classement : W05 n'est pas « équivalente » (l'ordre exige l'annulation de l'armement ponctuel, pas seulement le jeton).

**Bornes du calage (exigées par l'ordre)** : CHR-S5 exécute le VRAI `_restArmer` / `_restDesarmer` hors navigateur (bac à sable Node,
horloge et minuteurs simulés) pour pos = 0, 1, 99, **100** (délai 0), 101, 550, 899, 900, 999, 1000, un départ dans le futur et 14:59
écoulées : le tic tombe toujours à +100 ms, l'intervalle de 1 s s'installe, un rappel périmé ne fait rien. Il rougit sous W04 (ni
annulation ni jeton) et W14 (calage à +900 ms) ; sur la base, faute de `_restArmer`. Aucune confusion `setTimeout` / `setInterval`
quand `restIv` porte le calage : `_restDesarmer` choisit d'après `_restIvCale` (CHR-T02c, W03 à W05, CHR-S5).

**Matrice de la saisie validée (les 10 cas de l'ordre)** : 1 charge modifiée sans `change` → DOM-T13a (✓) et T09a (Entrée) · 2
répétitions → T09b · 3 les deux champs → T13b (aucun `change`) et T13c (clavier réel) · 4 champ vide → T09c · 5 zéro → T13d et T13e2 ·
6 décimale à virgule → T09a, T13a · 7 suggestion non tapée → T13e · 8 champ actif d'une série voisine → T02, T03, T04, R1 · 9 clavier →
T09a · 10 dé-validation pendant la saisie → T13f. Pour chacun : aucune valeur perdue, remplacée ou rangée dans une autre série, aucune
sauvegarde « faite » avec l'ancienne valeur, rien écrit après le geste, **un seul `upSet` par champ réellement tapé** (espion). Plus :
DOM-T13g (un modèle changé par le code n'est pas écrasé), DOM-T13h (une frappe se consomme une fois), DOM-T14 (règle d'or #9 : le
bouton « + » mesuré au dixième de pixel après chacun des 8 gestes, des 2 réponses de réserve et de l'arrêt du repos : 12 mesures
identiques).

**Ce que la base MONTRE (défauts que le lot corrige)** : la série enregistrée « faite » d'abord avec l'ANCIENNE valeur (T09a, T09b,
T13a, T13c) ; l'écran qui affiche 60 quand le modèle a 62,5 (T09a, T13a, T13c, T13d, T13f) ; un champ vidé qui écrit **0 répétition**
dans une série validée (T09c), et de même un `change` différé sur le chemin de reconstruction (T09e : 0 répétition) ; la saisie
d'une série VOISINE enregistrée sans avoir été validée (T02 : 65 kg) ; deux valeurs tapées sans `change` simplement perdues (T13b) ;
un 1RM resté celui de 60 × 8 sur une série à 0 kg (T13d).

### Avant / après — indicateurs Chromium (⛔ PAS une mesure de batterie, PAS l'iPhone)

| Mesure (repos en cours) | Base `e2b942f3` | Lot |
|---|---|---|
| Réveils du repos / 10 s (écran Séance) | **60** (`_restTick` 40 + `_updPill` 20) | **10** |
| Mutations du dock / 10 s | 180 | 30 |
| … dont les éléments qui NE CHANGENT PAS (durée totale, « au-delà ») — CHR-T10f | 40 | **0** |
| Pastille sur l'Accueil, 5 s | 95 (et le dock caché : 90) | 10 (dock caché : 15) |
| Décompte final, 4 s | 721 | 22 |
| Écran GO laissé ouvert, 3 s | 564 | 3 |
| Retard du chiffre après chaque changement de seconde | 56 à 194 ms (selon la phase du tic de 250 ms) | 100 à 105 ms (calé) |
| Mises en page / 10 s | 50 | 20 |
| Recalculs de style / 10 s | 230 | 208 à 211 |
| Temps de script / 10 s | 11,1 ms | 4,7 à 5,9 ms |
| Temps des tâches / 10 s | 209 ms | 133 à 141 ms |
| Remplacements de `#wkt-exs` : 8 validations / dé-validations + 2 réponses de réserve | **10** (chacun recrée toutes les cartes) | **0** |

Le cadran final reste identique à l'œil (même construction, seuls les traits qui changent sont repeints) ; la carte rendue sur place
est identique **au caractère près** à celle du rendu global (DOM-T01b).

## 4. Bancs voisins — arbre final `8d605500`

Identifiés statiquement (utilisateurs de `toggleSet`, `setRir`, `renderExBlocks`, `restIv`, `_restTick`, `startRest`, `_updPill`,
`updRest`, `_reposReprendre`, `stopRest`) : 16 bancs dédiés + 14 blocs du runner joués seuls (`tools/passe_reduite.js` : installation,
garde réseau et `d031s_rir_superset` compris). Chacun sous `tools/sous_garde.sh`, en série, dans une copie propre de l'arbre commité.

| Banc (fonctions touchées) | Arbre final `8d605500` | Durée | 1ᵉʳ tour (`18769fd2`) |
|---|---|---|---|
| seance_repos (repos, reprise, pastille) | 61 OK / 0 rouge | 302 s | 61 OK / 0 rouge |
| rir_superset (setRir, toggleSet, restIv) | 52 OK / 0 rouge | 68 s | 52 OK / 0 rouge |
| seance_ux (toggleSet, restIv, « + ») | 69 OK / 0 rouge | 71 s | 69 OK / 0 rouge |
| ux_d086 (restIv, dock) | 122 OK / 0 rouge | 65 s | 122 OK / 0 rouge |
| ux_integration (toggleSet, startRest) | 69 OK / 0 rouge | 93 s | 69 OK / 0 rouge |
| cc01_dropset (dropset) | 31 OK / 0 rouge | 61 s | 31 OK / 0 rouge |
| seance_recette (renderExBlocks) | 93 OK / 0 rouge | 142 s | 93 OK / 0 rouge |
| seance_chiffres (toggleSet) | 102 OK / 0 rouge | 78 s | 102 OK / 0 rouge |
| seance_date (toggleSet) | 25 OK / 0 rouge | 56 s | 25 OK / 0 rouge |
| session_integrity (toggleSet) | 93 OK / 0 rouge | 129 s | 92 OK / 1 rouge |
| debrief_provenance (toggleSet, setRir) | 24 OK / 0 rouge | 10 s | 24 OK / 0 rouge |
| nut_punch01 (toggleSet) | 36 OK / 0 rouge | 31 s | 36 OK / 0 rouge |
| aides_audit (renderExBlocks) | 18 OK / 0 rouge | 4 s | 18 OK / 0 rouge |
| ml_a = dropset_programme | 34 OK / 0 rouge | 32 s | 34 OK / 0 rouge |
| ml_b = groupes_orphelins | 60 OK / 0 rouge | 69 s | 60 OK / 0 rouge |
| lot3 = historique_cloud (toggleSet) | 87 OK / 0 rouge | 229 s | 87 OK / 0 rouge |
| runner, 14 blocs (C, VI, XIV, XV, XIX, XXI, XXXVI, L, CXXXV, CXXXVI, CXLI, CXLII, CLXXXVII, B-CCCX) + installation | 632 ✅ · 0 ❌ | 193 s | 632 ✅ · 0 ❌ |

Au premier tour (arbre `18769fd2`), un seul rouge : `session_integrity` T1 → correctif 2 ci-dessus ; base 93 / 0, harnais fidèle
93 / 0 (copie hors dépôt), lot corrigé 93 / 0 avec le harnais d'origine.

## 5. Mutations

### 5.1 Le lot — `tools/mut_workout_core.py` : 42 mutations (les 37 prévues + 5 ajoutées au GO TESTS), jouée SEULE

Résultat : **42/42 conformes**, arbre sain 0 rouge au départ et au rejeu final (banc stable). Chaque mutation « garde » exige un témoin précis parmi les rouges.

| Mutation | Attendu (témoin exigé) | Obtenu | Rouges |
|---|---|---|---|
| W01 _pillIv revient : un 2e intervalle a 500 ms pour la pilule | GARDE (CHR-T01) | GARDE | 11 |
| W02 le tic repasse a 250 ms (le reveil compte) | GARDE (CHR-T10a) | GARDE | 8 |
| W03 [deguisee] le (re)armement n'enleve plus l'ancien minuteur (startRest s'en sort par stopRe | GARDE (CHR-T02b) | GARDE | 4 |
| W04 ni annulation ni jeton : un calage perime installe son intervalle apres stopRest | GARDE (CHR-T02c) | GARDE | 5 |
| W05 l'armement ponctuel n'est plus annule (le jeton seul empeche son effet) : les armements pe | GARDE (CHR-T02a) | GARDE | 2 |
| W06 rattrapage au retour : les vibrations des secondes sautees sont rejouees | GARDE (CHR-T06a) | GARDE | 2 |
| W07 le temps restant compte les tics au lieu de lire l'horloge | GARDE (CHR-T05a) | GARDE | 11 |
| W08 le callback de fin peut repartir a chaque tic | GARDE (CHR-T07) | GARDE | 3 |
| W09 abandon a 899 s au lieu de 900 | GARDE (CHR-T08) | GARDE | 1 |
| W10 la reprise montre le repos sans armer le metronome | GARDE (CHR-T09a) | GARDE | 2 |
| W11 « +15 s » ne recale plus le tic | GARDE (CHR-T05b) | GARDE | 2 |
| W12 « Regler » ne recale plus le tic | GARDE (CHR-T05c) | GARDE | 2 |
| W13 [deguisee] calage retire : l'intervalle part tout de suite, a la phase du geste | GARDE (CHR-T05d) | GARDE | 1 |
| W14 [deguisee] le calage vise la fin de la seconde (+900 ms au lieu de +100 ms) | GARDE (CHR-T05b) | GARDE | 5 |
| W15 le retour au premier plan ne recale plus le metronome | GARDE (CHR-T05a) | GARDE | 2 |
| W16 la memoire des valeurs ecrites survit a l'arret (ecran faux au repos suivant) | GARDE (CHR-T11) | GARDE | 1 |
| W17 [equivalente] le decompte ne vide plus la memoire a l'OUVERTURE (sa fermeture le fait deja | OK | OK | 0 |
| W18 textes reecrits a chaque tic (memoire desactivee) | GARDE (CHR-T10f) | GARDE | 1 |
| W19 les 44 traits repeints a chaque tic | GARDE (CHR-T10e) | GARDE | 2 |
| W20 revenir sur Seance arrete le repos (navigation = fin) | GARDE (CHR-T04) | GARDE | 1 |
| W21 [negatif] un commentaire du metronome est reformule | OK | OK | 0 |
| D01 la validation ordinaire reconstruit tout (rendu cible coupe) | GARDE (DOM-T01) | GARDE | 13 |
| D02 la reponse de reserve (RIR) reconstruit tout | GARDE (DOM-R1) | GARDE | 3 |
| D15 la reponse de reserve mise a jour SUR PLACE n'est plus enregistree (le repli, lui, l'est : | GARDE (DOM-R1) | GARDE | 2 |
| D03 [deguisee] le rendu cible garde « la serie a faire » sur l'ancienne ligne | GARDE (DOM-T01b) | GARDE | 2 |
| D04 la meta de la carte n'est plus mise a jour | GARDE (DOM-T01) | GARDE | 2 |
| D05 le rendu cible ecrase les champs de TOUTES les series, meme en saisie | GARDE (DOM-T02) | GARDE | 4 |
| D16 [deguisee] le 1RM de TOUTES les lignes revient au modele (l'apercu d'une serie en saisie e | GARDE (DOM-T02) | GARDE | 1 |
| D06 le rendu cible accepte les dropsets (la ligne du palier en cours ne change pas de place) | GARDE (DOM-T07b) | GARDE | 3 |
| D07 la valeur tapee n'est plus lue a la validation (l'ancien defaut) | GARDE (DOM-T09b) | GARDE | 11 |
| D08 [deguisee] un champ VIDE est pris pour une valeur (il ecrit 0) | GARDE (DOM-T09c) | GARDE | 3 |
| D09 [deguisee] le champ quitte ne porte pas la valeur retenue : un change differe ecrit 0 (che | GARDE (DOM-T09e) | GARDE | 1 |
| D10 le champ de la serie validee garde le focus (clavier ouvert sur une serie finie) | GARDE (DOM-T09b) | GARDE | 2 |
| D11 la validation lit aussi les champs des AUTRES series | GARDE (DOM-T02) | GARDE | 2 |
| D12 « Ta seance jusqu'ici » ne suit plus la validation | GARDE (DOM-T01) | GARDE | 1 |
| D13 l'en-tete (N / M series) ne suit plus la validation | GARDE (DOM-T01) | GARDE | 1 |
| D17 le `change` emis en quittant le champ n'est plus neutralise (un 2e upSet, une sauvegarde c | GARDE (DOM-T13a) | GARDE | 3 |
| D18 [deguisee] le gestionnaire est remis AVANT de quitter le champ (meme lignes, mauvais ordre | GARDE (DOM-T13a) | GARDE | 3 |
| D19 [deguisee] la suggestion grise d'un champ vide est prise pour une valeur tapee (deux upSet | GARDE (DOM-T13e) | GARDE | 3 |
| D20 [deguisee] la preuve de frappe est ignoree : l'ancien texte affiche ecrase un modele chang | GARDE (DOM-T13g) | GARDE | 2 |
| D21 la marque de frappe ne retombe pas apres usage (un texte deja enregistre ecrase un modele  | GARDE (DOM-T13h) | GARDE | 1 |
| D14 [negatif] un commentaire du rendu cible est reformule | OK | OK | 0 |

Ajoutées au GO TESTS : D17, D18 (correctif 1), D19 (cas 7), D20, D21 (correctif 2). Après la campagne, CHR-S5 ajouté et éprouvé : W04 et W14 rejouées seules avec le détail des rouges — **2/2 conformes, CHR-S5 rouge dans les deux**, arbre sain stable (395 s). Reclassée : W05 (voir §3). Témoins ajoutés pour des mutations qui survivaient à la 1ʳᵉ campagne : W18 → CHR-T10f, D09 → DOM-T09e. ⚠️ La 1ʳᵉ campagne (même 42) a été REFUSÉE par son propre contrôle : rejeu final de l'arbre sain rouge (CHR-T05c/d, 429 et 734 ms) sous 3 navigateurs en parallèle — elle a été rejouée seule.

### 5.2 `tools/mut_seance_repos.py` — les 20 mutations ancrées dans du code modifié par le lot (sur 52)

Résultat : **20/20 conformes**, arbre sain stable (MUT_J=2, 61 min). Sélection STATIQUE : ancre située dans une fonction réellement modifiée (détection par accolades), dont M24 et M28 réancrées au GO DÉVELOPPEMENT.

M4 GARDE (C-REP-D1) · M3 GARDE (C-REP-A1) · M6 GARDE (C-REP-D3) · M7 GARDE (C-REP-A3) · M8 GARDE (C-REP-S1) · M9d GARDE (C-REP-S1) · M30b GARDE (C-REP-S1) · M30 GARDE (C-REP-S1) · M31 GARDE (C-REP-S1) · M32 GARDE (C-REP-B3) · MC2 GARDE (C-REP-I1) · M10 GARDE (C-REP-G2) · M11 GARDE (C-REP-G2) · MD1 GARDE (C-REP-D1b) · MD2 GARDE (C-REP-D1b) · M13 GARDE (C-REP-B0) · M24 GARDE (C-REP-A3) · M26 GARDE (C-REP-D1) · M27 GARDE (C-REP-G2) · M28 GARDE (C-REP-A4)

### 5.3 `tools/mut_rir_superset.py` — les 5 mutations ancrées dans du code modifié + M9

Résultat de l'outil : **5/6 conformes** = les **5 mutations valides conformes** + M9 **INVALIDE** (ancre absente, classée à part ci-dessous) ; arbre sain stable.

M2 GARDE (B-RSS-①b) · M3 GARDE (B-RSS-①b) · M5 GARDE (B-RSS-②a) · M11 GARDE (B-RSS-①a) · M8 GARDE (B-RSS-③a) · M9 INVALIDE (ancre absente)

**M9 — classée à part (ordre GO TESTS)** : son ancre `rir:(r===null?'':r), volume:Math.round(kg*reps)});` n'existe plus dans `setup.js` depuis `cff47f0d` (Mission Séance lot 2 : facteur unilatéral ajouté au volume de l'export) — déjà invalide sur `e2b942f3`, **pas un effet de ce lot**, NON corrigée (fichier hors périmètre). Vérification sur une COPIE hors dépôt, ancre réancrée sur `volume:Math.round(kg*reps*_facteurUni(s, ex.name))` : **1/1 conformes** (M9 GARDE (B-RSS-③d)) — le témoin B-RSS-③d garde toujours l'export. Proposition (autorisation requise) : réancrer M9 dans `tools/mut_rir_superset.py`.

## 6. Risques, limites, anomalies

**Résiduels** :
- **iPhone non vérifié** : clavier réel, vibrations, gel des minuteurs en arrière-plan, batterie — recette ci-dessous obligatoire.
- Si un navigateur émettait le `change` de sortie de champ **après** `blur()` (et non pendant), le correctif 1 ne jouerait pas : la
  valeur réécrite serait la même (aucun risque pour les données), seulement une sauvegarde de plus. Chromium : synchrone (mesuré).
- Seule une frappe compte : une valeur apparue dans un champ sans `input` (aucun cas connu sur iPhone) ne serait pas enregistrée à la
  validation — le modèle (ce que l'écran affichait au rendu) l'emporte, comme avant le lot.
- 1 écouteur `input` posé une fois au chargement (aucune multiplication) ; la marque `_ftTape` vit sur le champ, jamais persistée.
- Les chiffres du chrono changent ≈ 0,1 s après la seconde ; la pastille apparaît dès le démarrage d'un repos hors de l'écran Séance.
- **Les témoins de temps** (CHR-T05, T09a, T10) supposent une machine NON saturée : mesuré le 30/10, sous 3 navigateurs en parallèle
  sur 4 cœurs, CHR-T05c/d ont lu 429 et 734 ms — la 1ʳᵉ campagne de mutations a été refusée pour ça et rejouée seule. À l'intégration :
  jouer ce banc seul, ou dans une passe qui ne le met pas en concurrence.

**Anomalies préexistantes (présentes sur `e2b942f3`, pas des régressions du lot)** : les défauts de saisie listés au §3 (corrigés par
le lot) ; `upSet` ne retire pas un 1RM devenu sans objet quand la charge passe à 0 (sans effet sur les records, recalculés depuis
kg × reps à la fin — piste, non reproduite sur le lot) ; dropset ↓ : l'étiquette « 📉 Série dégressive terminée » posée avant
`startRest()`, qui l'efface (vu à la lecture, non reproduit, hors lot) ; `tools/mut_rir_superset.py` M9 (§5).

**Régressions du lot** : deux, trouvées par les tests, **corrigées** (correctifs 1 et 2) ; aucune connue à ce jour.

## 7. Recette iPhone — PRÉPARÉE, NON EXÉCUTÉE

> ⛔ Rien ici n'a été vu sur un iPhone. Les témoins Chromium **simulent** le clavier (le champ garde le focus, `kbd-serie` reste posée) et
> le gel des minuteurs (intervalle retiré + départ reculé) : ils ne prouvent ni le clavier réel, ni les vibrations ressenties, ni la
> batterie. **Moyen de recette à décider** : le clone `/clone/` (D-084, `tools/clone_build.py <branche>`) se publie par GitHub Pages
> depuis `master` — c'est une publication, hors de l'autorisation du GO TESTS. Il faut donc un GO distinct (clone ou autre moyen).

Préparer : une séance avec un exercice ordinaire de 4 séries pré-remplies (ex. 60 kg × 8), un 2ᵉ exercice, un superset de deux
exercices, un exercice en dropset ↓. Repos réglé à 1:00 pour aller vite.

| # | Geste | Attendu | Ce qu'il faut regarder | Résultat |
|---|---|---|---|---|
| R1 | Série 1 : toucher le champ KG, taper « 62,5 », toucher ✓ **sans fermer le clavier** | la série passe ✓ à **62,5** (pas 60) ; le clavier se ferme ; le repos part | le chiffre affiché dans la série après ✓ ; l'historique de la séance à la fin | ☐ |
| R2 | Série 2 : taper les répétitions puis la charge, « Suivant » / « OK » du clavier (Entrée) | la série 2 est validée avec les deux valeurs tapées ; le curseur passe à la série 3, le clavier reste | aucune valeur ne revient à l'ancienne | ☐ |
| R3 | Taper « 65 » dans la série 4 (sans valider), puis toucher ✓ de la série 3 | la série 3 passe ✓ ; **le clavier reste ouvert dans la série 4**, « 65 » toujours là, le curseur au même endroit | le champ de la série 4 ne clignote pas, ne se vide pas ; la série 4 n'est PAS validée | ☐ |
| R4 | Pendant R3 : sélectionner une partie du texte « 65 » avant de toucher ✓ | la sélection est toujours là après ✓ | — | ☐ |
| R5 | Faire défiler pour que la séance soit au milieu de l'écran, valider puis dé-valider une série | la page ne saute pas | la position de la liste | ☐ |
| R6 | Dé-valider une série faite PENDANT qu'on tape une nouvelle charge dedans (clavier ouvert) | la série repasse « à faire », le clavier reste, le texte tapé reste ; en quittant le champ, la nouvelle charge est dans **cette** série | aucune autre série ne change | ☐ |
| R7 | Taper « 0 » dans la charge d'une série pré-remplie et valider | la série est enregistrée à 0 kg (le champ s'affiche vide, comme toute charge à 0) | pas de retour à 60 | ☐ |
| R8 | Laisser un repos de 1:00 aller au bout, app ouverte, téléphone en main | vibrations courtes à 5, 4, 3, 2, 1 ; écran du décompte puis « GO » ; une vibration de fin et une pour GO, **une fois chacune** | aucune vibration en double ou en rafale | ☐ |
| R9 | Repos lancé, **verrouiller** l'iPhone ~30 s, déverrouiller | le temps affiché est juste tout de suite (≈ 30 s de moins), sans rafale de vibrations ni chiffre qui « rattrape » | le dock ou la pilule | ☐ |
| R10 | Repos de 1:00 lancé, passer sur une autre app **3-4 minutes**, revenir | repos fini : une vibration de fin, l'écran GO, une seule fois ; le dépassement s'affiche (« +2:… ») | pas de double vibration au 2ᵉ retour | ☐ |
| R11 | Même chose mais revenir après **plus de 15 min** | le repos est abandonné, rien ne se relance | — | ☐ |
| R12 | Superset : valider A | on passe à B tout de suite, sans repos | — | ☐ |
| R13 | Superset : valider B | repos « ⚡ Tour suivant » ; la question de réserve (RIR) porte sur A **et** B | — | ☐ |
| R14 | Dropset ↓ : valider le palier 1 | pas de repos, le curseur va au palier 2 | — | ☐ |
| R15 | Dropset ↓ : valider le dernier palier | le repos part | — | ☐ |
| R16 | Pendant un repos, aller sur Nutrition, Milo, Progrès, puis revenir sur Séance | la pilule montre le bon temps dès l'arrivée ; le repos ne s'arrête jamais ; le dock est juste au retour | — | ☐ |
| R17 | Bouton central « + » (règle d'or #9) | il ne bouge pas pendant toute la recette | le **mesurer**, pas le regarder | ☐ |

**Batterie** : non mesurable à la main sur une séance ; rien à cocher. Les chiffres du lot (réveils, écritures) sont des indicateurs
Chromium, jamais une mesure de batterie.

## 8. Coordination, Git, retour arrière

- Claude N°1 (`claude/nut-ref-hist-02`) : `app.js`, tests Nutrition, journal. **Seul fichier commun : le journal** (deux lignes en tête du
  tableau → garder les deux à l'intégration). `app.js:10762` appelle `_reposReprendre()` : nom et contrat inchangés.
- `master` non touché ; aucun push hors de la branche ; aucune opération sur la branche de Claude N°1.
- **Retour arrière** : ne pas fusionner, ou `git revert 8d605500 18769fd2 bf077948 6523d74d` (du plus récent au plus ancien ; les
  commits de tests et de documentation n'ont aucun effet applicatif).
- Décisions à consigner à l'intégration (`docs/DECISIONS.md`, hors périmètre de cet ordre) : calage « seconde + 100 ms » (D-127
  proposé) et saisie validée prioritaire — seule une frappe est une saisie (D-128 proposé).
- Règle d'or #11 : aucun geste nouveau, aucun repère déplacé → pas de pop-up proposée.

**Règle #17 (code applicatif seul)** : données persistées ajoutées **0** · fichiers applicatifs touchés **1** (`log.js`) · **+203 / −30**
lignes (code seul, commentaires retirés : **+119 / −29** ; les deux correctifs du GO TESTS : +4) · anciens chemins supprimés ou
fusionnés **4** : le second intervalle (`_pillIv`) fusionné dans le métronome unique, le tic à 250 ms, les écritures inconditionnelles
du dock / de la pastille / du cadran, la reconstruction globale pour une validation ordinaire et une réponse de réserve (repli
conservé).

---

## Annexe — le rapport du GO DÉVELOPPEMENT (commit `00a2b6f2`), conservé TEL QUEL

> Historique, **dépassé** par ce qui précède : il décrit le code AVANT les tests (« non testé », témoins « préparés »), sans les deux correctifs du GO TESTS. Gardé mot pour mot — ici un document s'ajoute, il ne s'écrase pas.

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
