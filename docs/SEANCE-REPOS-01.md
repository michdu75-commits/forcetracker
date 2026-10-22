# ⏱️ SEANCE-REPOS-01 — le repos en cours survit à la fermeture de l'app

> **↪️ AVENANT DU 22/10 APRÈS-MIDI (D-102, décision validée de Michel) : expiration 15 MIN après la fin théorique, app ouverte OU
> fermée — `REST_DEPASSEMENT_MAX` 300 → 900 s ; dépassement en négatif, restauration après fermeture et repos hors brouillon
> inchangés ; moteur calorique et plafonds NON touchés, désormais prouvés par témoins. La revue adverse de l'avenant a trouvé
> DEUX défauts du lot du matin, corrigés (`BUGS.md` §95). Détail et contrôles : §12.**
>
> **Statut de l'avenant (22/10/2026, 20:28 UTC) : développé et testé sur la même branche, fusionnée avec master `6c0a400d` —
> passe complète D-031 VALIDE (7 884 / 0, sur `0d0d4269`) — NON intégré à master, NON publié, clone NON régénéré, aucun numéro de
> version.**
>
> **Statut du lot du matin (22/10/2026, 14:31 UTC, gardé — R30) : développé et testé sur la branche `claude/dreamy-bell-pu88ia` (session-C, Claude Séance) —
> passe complète D-031 VALIDE (7 866 / 0) — NON intégré à master, NON publié, clone NON régénéré, aucun numéro de version posé.** Feu vert de Michel du 22/10 : développement et tests seulement,
> STOP ensuite. Décisions : registre `docs/DECISIONS.md`, **D-100** (⚠️ numéro à reconfirmer à l'intégration : D-099 a été pris
> le même jour par Claude Nutrition sur `claude/nutrition-v2` — le code ne cite aucun numéro, seulement ce fichier).

## 1. Le défaut (mesuré sur `ft-v1258`)

- Le repos en cours vivait **en mémoire seulement** (`restStartTs`, `restTot`, `log.js`). iOS ferme souvent une PWA restée en
  arrière-plan : à la réouverture, **le repos avait disparu** (et la série suivante repartait sans repos affiché).
- Au **retour au premier plan** sans fermeture, `app.js` **coupait** le repos dès 5 s de dépassement : le dépassement en négatif
  (ft-v1030, ft-v1075) ne se voyait donc jamais au moment où on revient dans l'app — celui où il sert.
- Banc `tools/banc_seance_repos.js` (version finale, 43 témoins) sur le code exact de master `f82a7c07` : **17 OK / 26 rouges** — les 26
  rouges = ce qui est construit ici ; les 17 verts = les invariants protégés (pas de fantôme, séance intacte, « + » immobile, Milo, fin
  de séance, superset, avance à l'exercice suivant).

## 2. La garantie d'`app.js` — pourquoi elle existait, pourquoi elle part (R30)

Michel a demandé de vérifier sa raison **avant** de coder, et de s'arrêter si elle protégeait un comportement essentiel.

- **Origine** : commit `e3367525` du 01/07/2026 (ft-v144, « fix: séance coincée au redémarrage — timer, draft et annulation ») :
  `stopRest()` au démarrage + un écouteur qui coupe le repos au retour au premier plan dès −5 s, commentés « Garantie : le timer
  de repos ne survit jamais à un redémarrage ni à un retour au premier plan ».
- **Ce qu'elle faisait vraiment** : le repos n'était **jamais** enregistré (vérifié dans le `log.js` de ft-v143 comme dans celui de
  ft-v1258) — au démarrage, `stopRest()` ne faisait que remettre l'écran du repos à zéro. Cette part est **gardée** (`_reposReprendre`
  appelle `stopRest()` quand il n'y a rien à reprendre).
- **La panne qu'elle visait avait une autre cause**, trouvée ensuite : des erreurs propres à Safari (TDZ, ft-v144 → v153,
  `docs/GALERES-ET-LECONS.md`, ligne « Séance coincée / erreurs invisibles iOS »). La garantie était un correctif à l'aveugle.
- **La coupure à −5 s** datait du dépassement clignotant (« overtime », retiré en ft-v166). Depuis ft-v1030 et ft-v1075, le
  dépassement est une information voulue : elle le **contredisait** au retour dans l'app (`BUGS.md` §91).
- **Conclusion : rien d'essentiel n'est incompatible avec les décisions de Michel → pas de STOP.** La garantie est remplacée, et son
  histoire est écrite à sa place dans `app.js`.

## 3. Les décisions de Michel (22/10/2026)

1. **Expiration : 5 min après la fin THÉORIQUE du repos.** Repos de 2 min parti à 15 h 00 : décompte jusqu'à 15 h 02, temps dépassé
   affiché de 15 h 02 à 15 h 07, **abandonné et effacé à partir de 15 h 07** — calculé depuis l'heure théorique de fin, jamais
   depuis le dernier affichage.
   ↪️ **Remplacée l'après-midi par D-102** : **15 min** après la fin théorique, app ouverte **ou** fermée — même repos de 2 min :
   négatif de 15 h 02 à 15 h 17, abandonné et effacé à partir de 15 h 17. *Le texte du matin est gardé (R30).*
2. **Repos dépassé : affiché en négatif** à la réouverture (fonctionnement existant), **aucun redémarrage artificiel**.
3. **Brouillon de secours : NON** — le repos n'entre pas dans `ft4_wkt_draft`. Structure `S.wkt.repos = {debut, total}`, **aucune
   clé de stockage nouvelle**. Ne restaurer que si la séance est réellement active ; les anciennes séances sans le champ ne changent pas.

## 4. Mise en œuvre (choix de construction de Claude, à relire par Michel)

| Fichier | Fonction | Changement |
|---|---|---|
| `log.js` | `_reposMemoriser` (nouvelle) | **le seul écrivain** de `S.wkt.repos` : recopie `{debut: restStartTs, total: restTot}`, ou l'efface quand aucun repos ne tourne ; n'écrit **que** `ft4_wkt`, seulement si la valeur change, jamais en mode démo |
| `log.js` | `_reposReprendre` (nouvelle) | **la reprise**, au démarrage : seulement si la séance est active (`_wktEnCours` : ouverte et pas en pause) et la valeur lisible (nombres, durée de 1 s à 1 h, départ pas dans le futur), et si le repos n'a pas expiré ; sinon `stopRest()` (l'écran remis à zéro, la valeur effacée). Un repos déjà fini ne rejoue ni vibration ni écran GO |
| `log.js` | `REST_DEPASSEMENT_MAX` | **900 → 300 s** (matin) **→ 900 s** (avenant D-102 : app ouverte, retour au comportement de `ft-v1258` ; la nouveauté est que la même règle s'applique app fermée) : la même règle app ouverte, au retour au premier plan et au redémarrage (un seul propriétaire, R2) |
| `log.js` | `startRest`, `stopRest`, `setRestPreset`, `addRT`, `applyRestEdit` | un appel à `_reposMemoriser()` là où l'état du repos change (donc aussi « Passer », le tap sur GO, la fin, l'abandon, « Vider », la pause, qui passent par `stopRest`) |
| `app.js` | démarrage | `stopRest()` + l'écouteur −5 s → **`_reposReprendre()`** ; l'histoire de la garantie écrite à sa place |
| `state.js` | `persist()` | **une ligne** : `ft4_wkt_draft` s'écrit sans `repos` (`Object.assign({},S.wkt,{repos:undefined})` — identique à l'octet quand aucun repos ne tourne). Coordonné avec Claude Principal (22/10, aucune objection) |
| `screens.js`, `coach.js`, `app.js`, `constants.js` | aides | « ? » de Séance, aide détaillée, diapo du Guide « Ton repos est un MAXIMUM », point rouge d'origine (`repos-maximum`) : « au-delà de 15 min » → « 5 min après la fin » (matin) → **« 15 min après la fin »** (avenant D-102) + « l'app se ferme ? il t'attend » ; **nouveau point rouge** `repos-persistant`. ⚖️ **Pas de pop-up** (R25) : rien à faire, aucun repère déplacé |

✅ **TRANCHÉ PAR MICHEL (D-102, 22/10 après-midi)** : 15 min, app ouverte **et** fermée, une seule règle. *Ce qui suit est la question telle
qu'elle était posée le matin (R30).* ⭐ **Un choix à confirmer par Michel** : la règle des 5 min s'applique **aussi app ouverte** (avant : le chrono continuait en
négatif jusqu'à 15 min, un choix de Claude en ft-v1030). C'est la lecture littérale de la décision 1 (« à partir de 15 h 07 : le
repos est abandonné ») et la seule qui donne **une** règle pour un même repos ; revenir à 15 min app ouverte tient en une
constante, mais ferait deux règles.

## 5. Les tests (22/10/2026, réseau coupé : garde réseau, aucune requête externe, 0 appel à Milo)

| Contrôle | Résultat |
|---|---|
| **Banc** `tools/banc_seance_repos.js` (blocs C-REP-*, 43 témoins : vrais gestes, vrais rechargements, horloge pilotée, réouverture hors ligne par le vrai service worker) | **17 OK / 26 rouges sur `ft-v1258`** (master `f82a7c07` exact ; les rouges = ce qui est construit) → **43 OK / 0 rouge** sur l'arbre final |
| **Contrôle négatif** `tools/mut_seance_repos.py` (31 mutations sur des copies de l'arbre, dont 9 déguisées, 1 équivalente, 1 neutre ; chaque mutation qui doit rougir exige SON témoin) | **31 / 31 conformes** ; arbre sain 0 rouge au début et à la fin (37 min, 2 files) |
| **Bancs voisins** (sélecteur `tools/recette_selecteur.py --diff master`, T1 + T2) | `aides_audit` 18/0 · `ux_integration` 69/0 · `lot3` 87/0 · `ux_d086` 122/0 · `rir_superset` 52/0 · `seance_ux` 69/0 · `ml_a` 34/0 · `seance_recette` 93/0 · `session_integrity` 93/0 · `cc01_dropset` 31/0 · `seance_date` 25/0 · `debrief_demande` 62/0 — **755 OK / 0 rouge** |
| **Annexe de recette** (`tools/recette_annexe.py`, 15 suites sous garde ; `persist` est un carrefour) | **14 PASS + 1 défaut connu** (`discussions`, ses 2 rouges listés) — valeurs identiques à master rejoué le même jour : 71 541 / 76 460 / 68 781 caractères (−3 face au 21/10 : « mercredi » → « jeudi » dans le prompt) |
| **Prompt de Milo** (contexte construit, jamais envoyé) | **identique à l'octet** entre master `f82a7c07` et la branche (77 697 caractères), avec ou sans repos rangé |
| **Retour arrière à blanc** (ancien code, `ft4_wkt` écrit par le nouveau) | aucune erreur, aucun chrono, séance intacte ; « Terminer » enregistre une séance sans `repos` |
| `check_regles`, `git diff --check`, auto-test du sélecteur | verts (alerte connue sans lien : `PROMPT-MILO-REEL.txt` signalé périmé — le prompt réel, lui, est identique) |
| **Passe complète D-031 n°1** (4 conditions, réseau isolé, sur `ff718da6`, 11:01 → 12:33 UTC, 92 min) | **7 865 ✅ / 1 ❌ — NON VALIDE** : `B-NP01-A` (rechargement en pleine séance, banc `nut_punch01`) comparait **tout** `S.wkt` à l'octet ; le seul écart mesuré était `repos` — un repos expiré, effacé au rechargement comme décidé, et présent dans l'instantané parce que celui-ci devançait le tick. **Témoin périmé** réécrit sur sa garantie (la séance sans `repos`, tout le reste à l'octet) : 36 / 0 sur la branche **et** sur master, mutation MA20 toujours gardée (`BUGS.md` §93) ; `banc:nut_punch01` ajouté aux tests associés |
| **Passe complète D-031 n°2** (4 conditions, réseau isolé + garde, sur `ffa5ee4e`, 12:57:42 → 14:30:44 UTC, 93 min) | **7 866 ✅ / 0 ❌ — VALIDE**, 4 conditions vertes ; ④ revérifiée hors isolement par un vrai `git fetch` (master `f82a7c07`, retard 0). Depuis : documentation seulement (D-031) |

⚠️ **Ce que les témoins ne couvrent pas** : Safari / l'iPhone réel (une PWA tuée par iOS est simulée par un rechargement ; un
retour depuis l'arrière-plan par l'événement `visibilitychange`), la lisibilité ressentie, les limites du §6.

## 6. Ce que ce lot ne fait pas (limites écrites)

- **Aucun son ni alerte quand l'app est fermée** (hors périmètre ; impossible pour une PWA iOS sans notification push).
- **Ce qui ne revient pas après un rechargement** : la question « il t'en restait combien ? » de la série qui venait d'être validée,
  l'étiquette du dock (« ⏭️ Ensuite : … », « Échauffement »…), **l'avance automatique** à l'exercice suivant ou au tour de superset
  (une fonction en mémoire), le pas de 5 s des abdos (le dock repris propose ±15 s), la mémoire de durée par exercice (un réglage
  fait sur un repos repris n'est pas retenu pour l'exercice). Le repos, lui, revient juste. *Ces points relèvent de la refonte
  RIR / superset, hors périmètre ; aucun n'est une perte de données.*
- **Au retour au premier plan sans fermeture**, si le repos s'est terminé en arrière-plan, la vibration de fin et l'avance
  automatique partent au retour — **inchangé** (comportement d'avant ce lot) ; seule la coupure du dock à −5 s a disparu.
- **L'export complet** (« Exporter mes données ») recopie la séance en cours telle quelle : pendant un repos, il contient donc
  `repos` (son heure de départ et sa durée). Sans conséquence (relevé aussi par Claude Principal) ; l'export « séances seules » n'a
  pas de séance en cours.
- **Deux onglets ouverts** sur la même séance : comme pour le reste de la séance en cours, le dernier qui écrit `ft4_wkt` gagne.

## 7. Risques de régression (et ce qui les couvre)

| Risque | Couverture |
|---|---|
| un repos fantôme au démarrage | C-REP-A5, B3, B4, F1 → F5, G1, G2 (le dock compté depuis le chargement, même un quart de seconde) |
| perte ou modification de la séance | C-REP-A7, B3b ; finishWorkout choisit ses champs (C-REP-F2) |
| le brouillon de secours change | C-REP-A2, C-REP-S4 ; identique à l'octet sans repos |
| Milo reçoit autre chose | C-REP-H1 ; contexte construit identique à master (77 697 caractères, sans et avec repos) |
| supersets, RIR, avance à l'exercice suivant | C-REP-H2, H3 + bancs voisins `rir_superset`, `seance_recette`, `ux_d086`, `seance_ux`… |
| le « + » central bouge | C-REP-A8 (règle d'or #9) |
| écritures en trop | C-REP-G3 (le repos n'écrit que `ft4_wkt`), G4 (rien en mode démo) |
| app ouverte : le chrono s'arrête plus tôt (5 min au lieu de 15) | *(matin)* voulu (décision 1) ; C-REP-B5 / B6 ↪️ **levé par D-102** : 15 min ouverte ou fermée ; C-REP-B0, B5a, C1b (15:07:00 ne coupe plus rien), B1, B1b, B5, B6, B2, B3, C2 |
| les calories ou la durée de la séance dépendent du repos (consigne de Michel, avenant) | moteur **non touché** ; C-REP-I1 / I2 (séance enregistrée identique à l'octet, 5 états de repos × 3 sources de durée), C-REP-J1 / J2 (fermeture pendant un repos : rien compté deux fois, une seule séance) — §12 |

## 8. Retour arrière

- **Tant que rien n'est intégré** : ne pas fusionner la branche. Master et la production ne sont pas touchés.
- **S'il était publié puis retiré** : remettre `log.js`, `app.js`, `state.js`, `screens.js`, `coach.js`, `constants.js` tels qu'à
  `ft-v1258` (`git checkout f82a7c07 -- <fichiers>`) et monter la clé de cache. ✅ **Rejoué à blanc le 22/10** (hors dépôt, réseau
  coupé) : l'**ancien** code ouvre un `ft4_wkt` écrit par le nouveau (avec `repos`) **sans erreur, sans chrono, la séance intacte**, et
  « Terminer » enregistre une séance **sans** `repos`. Le champ resté dans `ft4_wkt` est simplement ignoré jusqu'à la fin de la séance.
- **Revenir à 15 min app ouverte seulement** *(matin)* : `REST_DEPASSEMENT_MAX` est l'unique constante (mais la reprise suivrait aussi :
  la séparer ferait deux règles). ↪️ **Depuis D-102** : revenir à **5 min** = remettre la constante à 300 (et les 5 aides, et les
  témoins C-REP-B*) — une constante, toujours une seule règle.

## 9. Recette sur le clone — état de préparation

- **Prêt à être généré, rien fait** : `python3 tools/clone_build.py claude/dreamy-bell-pu88ia` régénère `clone/` depuis cette
  branche, puis le banc d'isolement (`tools/banc_clone_isolation.js`) et le tampon ; la publication du clone (un push de `clone/`
  sur master) demande **l'accord de Michel** — et une **coordination avec Claude Nutrition**, qui attend aussi le clone pour la V2
  (le clone actuel montre D-093, `b1840bc7`).
- ⚠️ **Le clone ne peut pas tout recetter** : son service worker n'a **aucun cache** (D-084, par construction) — la réouverture
  **hors ligne** ne se recette donc que sur la vraie app, une fois publiée. Tout le reste se recette sur le clone : verrouiller le
  téléphone ou changer d'appli pendant un repos, rouvrir (temps réel) ; revenir après 5 min de dépassement (toujours là, +5:00), après 14 min 59
  (négatif) puis après 15 min (rien) ; −15 s / +15 s / « Régler » puis fermer ; « Terminer », « Abandonner », pause pendant un repos ; le « + » central.
- Dans le clone, Milo et la synchronisation sont coupés (D-084) : ce lot n'en dépend pas.

## 10. Règle d'or #17 — les 4 compteurs (code applicatif seulement)

- **Données persistées ajoutées : 1** — `repos` (`{debut, total}`) dans la séance active (`S.wkt`, clé `ft4_wkt` existante) ;
  **0 clé de stockage**, 0 migration.
- **Fichiers applicatifs touchés : 6** — `log.js`, `app.js`, `state.js` (1 ligne), `screens.js`, `coach.js`, `constants.js`
  (les 3 derniers : textes d'aide).
- **Lignes : +131 / −19** (net +112) sur l'arbre de l'avenant contre master `f82a7c07` *(le matin : +100 / −19)*, dont la plupart en
  commentaires écrits à côté de ce qu'ils protègent ; **le code seul : +49 / −10** *(le matin : +41 / −10)* — mesuré sans les
  commentaires, analyseur `acorn`. L'avenant seul : +53 / −22 lignes, dont la constante 300 → 900, les 5 aides, et les deux
  correctifs de la revue (`_reposMemoriser`, la garde de `_reposReprendre`, `REST_PLUS_MAX`).
- **Anciens chemins supprimés ou fusionnés : 2** — l'écouteur `visibilitychange` d'`app.js` (coupure à −5 s) disparaît, fusionné
  dans le seuil unique `REST_DEPASSEMENT_MAX` ; le `stopRest()` de démarrage est absorbé par `_reposReprendre` (même effet quand il
  n'y a rien à reprendre). *Avenant* : le plafond de « +15 s » (600 s, écrit en dur dans `addRT`) a maintenant **un seul propriétaire**
  (`REST_PLUS_MAX`), lu aussi par la reprise — aucune donnée, aucun fichier en plus.

## 11. Intégration — ce qu'il faudra fusionner (mesuré le 22/10, 14:31 UTC)

- **master n'a pas bougé** (`f82a7c07`) : la branche s'y fusionne en avance rapide tant qu'aucune autre publication ne passe avant.
- **Nutrition V2** (`claude/nutrition-v2`, 30 fichiers) partage 6 fichiers avec ce lot : `app.js` et `screens.js` — **zones
  distinctes** (Nutrition : lignes < 7 500 d'`app.js` et `renderFoodJournal` ; ce lot : la diapo du Guide, le démarrage, l'aide
  « ? » de Séance), `tests/recette/registre.json` (lignes différentes), `docs/DECISIONS.md`, `docs/JOURNAL-DE-PARTAGE.md` et
  `BUGS.md` (ajouts au même endroit : conflits de texte triviaux, garder les deux).
- **Numéros** : Nutrition a pris D-096 → D-099 puis **D-101** — **D-100 reste celui de ce lot** ; Nutrition a un `BUGS.md` §92 → ce
  lot écrit **§91 et §93**. Le code ne cite aucun numéro.
- **À rejouer après toute fusion** : le banc `tools/banc_seance_repos.js`, les voisins du sélecteur et la passe complète (D-031).

## 12. Avenant du 22/10 après-midi — 15 min (D-102), la protection des calories, et deux défauts trouvés par la revue

**La décision (Michel, validée)** : « expiration 15 minutes après la fin théorique du repos, application ouverte ou fermée.
Remplacer l'actuel seuil de 300 secondes par 900 secondes. Conserver le dépassement affiché en négatif et la restauration après
fermeture. Ne pas modifier les durées de repos prévues dans les programmes dans ce lot. » Registre : **D-102** (remplace D-100 ①).

### 12.1 Ce qui change

| Fichier | Changement |
|---|---|
| `log.js` | `REST_DEPASSEMENT_MAX` **300 → 900** (une constante, lue par ses 3 chemins : arrêt app ouverte, pilule, reprise) ; commentaires (son histoire : 900 → 300 → 900, R30) |
| `screens.js`, `coach.js`, `constants.js` ×2, `app.js` (Guide) | les 5 aides : « 5 min après la fin » → **« 15 min après la fin »** — ⚖️ toujours pas de pop-up (rien à faire, aucun repère déplacé ; les points rouges existants portent le texte) |
| durées de repos prévues (programmes, préréglages, `S.defRest`, `S.exRestPref`, plafond de « +15 s ») | **inchangées** — vérifié dans le diff : aucune n'est liée à `REST_DEPASSEMENT_MAX` |

### 12.2 Les calories (consigne de Michel : « ne modifier ni le moteur calorique ni les règles de plafonnement »)

- **Le moteur n'est pas touché, et c'est mesuré, pas affirmé** : les fonctions que le lot modifie (analyse du diff contre master par
  `acorn`) sont `_updPill`, `_restTick`, `startRest`, `stopRest`, `_reposMemoriser`, `_reposReprendre`, `setRestPreset`, `addRT`,
  `applyRestEdit` (log.js), le démarrage et la diapo du Guide (app.js), une ligne de `persist` (state.js, le brouillon sans repos).
  **Aucune** ligne de `calcSessionCalories`, `_dureeEffective`, `_dureeSeanceMin`, `_estimCalTempsReel`, `_dureeDouteuse`,
  `finishWorkout`, `toggleSet` ni `_wktElapsedMs`. Le moteur lit la séance figée par « Terminer » (`set.at`, `sess.duration`),
  `S.defRest`, le poids, les records — **jamais** le chrono de repos.
- **Calories identiques à données de séance équivalentes** — témoins **C-REP-I1 / I2** : 3 sources de durée (horodatages, chrono,
  estimation) × 5 états du repos à la fin (passé, en cours, expiré app ouverte, restauré après fermeture, expiré au retour) : la
  séance enregistrée est **identique à l'octet** (calories, détail, durée, horodatages, chaque champ hors `runId`), et ancrée sur
  les valeurs **mesurées sur master** (74 kcal / 1 600 s · 126 kcal / 1 060 s · 74 kcal / 1 600 s).
- **Comparateur master ↔ branche** (hors dépôt, mêmes gestes, même horloge, 15 scénarios dont des fermetures pendant le repos et
  des reprises au-delà de l'expiration) : **15 / 15 identiques à l'octet**. ⛔ Contre-épreuve : la même comparaison contre une copie
  de la branche où la durée de séance dépend du repos rougit **6 / 15** (1 600 → 720 s, 126 → 65 kcal) — il sait voir une dérive.
- **Pas de double comptage après fermeture et reprise** — témoins **C-REP-J1 / J2** : la même séance jouée sans fermer, puis en
  fermant l'app pendant le repos (60 s : le repos revient ; 1 500 s : il a expiré) → séance enregistrée identique, chrono de séance
  (`startTs`, `pausedTotal`, horodatages) intact à la reprise, **une seule** séance en mémoire et sur le disque, brouillon supprimé,
  rien ne renaît après un nouveau rechargement. Et **deux onglets** (C-REP-K, §12.3).

### 12.3 Deux défauts du lot du MATIN, trouvés par la revue adverse de l'avenant (`BUGS.md` §95)

La revue (4 angles, chaque constat vérifié par deux sceptiques) a remonté 18 constats : 14 confirmés, 2 déjà corrigés quand les
sceptiques les ont relus (« +15 s » ci-dessous, vérifié d'abord par moi ; le doublon du registre), 2 écartés. Deux sont des défauts
de code — **tous deux dans le lot du matin**, invisibles au banc (43 / 0), au contrôle négatif (31 / 31) et à la passe (7 866 / 0), faute de témoin qui conduise
ces chemins :

1. **« +15 s » tôt dans le repos, puis fermeture → repos effacé.** `addRT` range alors un départ équivalent **dans le futur** ;
   la reprise refusait tout départ à plus de 5 s dans le futur (garde « horloge reculée »). **Corrigé** : la garde juge le
   **restant** (jamais plus que `max(durée, REST_PLUS_MAX)` + 5 s), plafond de « +15 s » à un seul propriétaire. Témoin
   **C-REP-D1b** ; G2 passe à 8 cas (un restant impossible de 10:20 reste refusé).
2. **Deux onglets : un onglet périmé réécrivait SA séance à l'expiration de son repos** (sans geste) → une séance terminée ailleurs
   **revenait** (à enregistrer une 2ᵉ fois : volume et calories comptés deux fois), ou des séries validées entre-temps
   **disparaissaient**. **Corrigé** : `_reposMemoriser` n'écrit plus que le champ `repos`, dans la séance **du disque**, seulement
   si c'est la **même** séance, et n'efface que **son propre** repos. Témoins **C-REP-K1 / K2 / K3** (deux vrais onglets).

Les autres constats confirmés (documentation périmée, témoins trop faibles) sont corrigés : C-REP-S1 compte le CODE seul (3 lecteurs
exacts, aucun seuil en dur), C-REP-S5 refuse toute autre durée et compte les 5 textes, I1 est ancré sur master, la fiche du
registre a un identifiant propre (`SEANCE-REPOS-PERSIST-01`, l'ancien doublonnait une fiche de master).

### 12.4 Les contrôles de l'avenant (22/10, réseau coupé, 0 appel à Milo)

| Contrôle | Résultat |
|---|---|
| **Banc** `tools/banc_seance_repos.js` (61 témoins) | **61 OK / 0** sur l'arbre final · **46 / 15 rouges** sur le code du matin (`e4afb36b` : 900 s, aides, « +15 s », deux onglets — et I1, dont deux variantes ne peuvent pas exister à 5 min ; ses calories y étaient déjà identiques) · **25 / 36 rouges** sur master `f82a7c07` (ft-v1258) |
| **Contrôle négatif** `tools/mut_seance_repos.py` (51 mutations, chacune exige SON témoin) | «MUTATIONS» |
| **Bancs voisins** (sélecteur, T1 + T2) sur l'arbre final (rejoués APRÈS les deux correctifs de la revue) | `aides_audit` 18 · `ux_integration` 69 · `lot3` 87 · `ux_d086` 122 · `rir_superset` 52 · `seance_ux` 69 · `ml_a` 34 · `seance_recette` 93 · `session_integrity` 93 · `nut_punch01` 36 · `cc01_dropset` 31 · `seance_date` 25 · `debrief_demande` 62 — **791 OK / 0 rouge** |
| **Annexe de recette** (15 suites) | **14 PASS + 1 défaut connu** (`discussions`) — valeurs **identiques à master rejoué à la même minute** (71 725 / 76 644 / 68 781 ; l'écart avec ce matin vient de l'heure, pas du lot) |
| **Prompt de Milo** | **identique à l'octet** à master (77 697 caractères), avec ou sans repos |
| **Retour arrière à blanc** | l'ancien code ouvre un `ft4_wkt` avec `repos` sans erreur, sans chrono, séance intacte ; « Terminer » l'enregistre sans `repos` |
| `check_regles`, `git diff --check`, sélecteur (auto-test) | verts |
| **Passe complète D-031** (sur `0d0d4269` = la branche fusionnée avec master `6c0a400d`, 18:47 → 20:28 UTC, 101 min, réseau isolé + garde) | **7 884 ✅ / 0 ❌ — VALIDE**, 4 conditions vertes ; ④ revérifiée hors isolement par un vrai `git fetch` (master `6c0a400d`, retard 0). Depuis : documentation seulement (D-031) |

⚠️ **Fusion de master pendant le lot** : master a reçu à 18:22 UTC les routes admin Nutrition de Claude Principal (`Code.js` seul,
@192, + docs) ; fusionnées dans la branche (conflit de texte du journal de partage, les deux lignes gardées) **avant** la passe.

### 12.5 Ce que l'avenant ne fait pas

- Rien de neuf côté iPhone réel : la recette Safari reste à faire (§9) ; la fermeture iOS est simulée par un rechargement.
- Le filet multi-onglets de `persist()` (`_ftAutreOnglet`) n'est pas touché : un **geste** dans un onglet périmé (cocher une série)
  écrit toujours sa séance comme avant ce lot — comportement existant, hors périmètre.
- Les numéros (D-102, §95) sont à reconfirmer à l'intégration avec Nutrition V2.
