# ⏱️ SEANCE-REPOS-01 — le repos en cours survit à la fermeture de l'app

> **Statut (22/10/2026) : développé et testé sur la branche `claude/dreamy-bell-pu88ia` (session-C, Claude Séance) —
> NON intégré à master, NON publié, clone NON régénéré.** Feu vert de Michel du 22/10 : développement et tests seulement,
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
2. **Repos dépassé : affiché en négatif** à la réouverture (fonctionnement existant), **aucun redémarrage artificiel**.
3. **Brouillon de secours : NON** — le repos n'entre pas dans `ft4_wkt_draft`. Structure `S.wkt.repos = {debut, total}`, **aucune
   clé de stockage nouvelle**. Ne restaurer que si la séance est réellement active ; les anciennes séances sans le champ ne changent pas.

## 4. Mise en œuvre (choix de construction de Claude, à relire par Michel)

| Fichier | Fonction | Changement |
|---|---|---|
| `log.js` | `_reposMemoriser` (nouvelle) | **le seul écrivain** de `S.wkt.repos` : recopie `{debut: restStartTs, total: restTot}`, ou l'efface quand aucun repos ne tourne ; n'écrit **que** `ft4_wkt`, seulement si la valeur change, jamais en mode démo |
| `log.js` | `_reposReprendre` (nouvelle) | **la reprise**, au démarrage : seulement si la séance est active (`_wktEnCours` : ouverte et pas en pause) et la valeur lisible (nombres, durée de 1 s à 1 h, départ pas dans le futur), et si le repos n'a pas expiré ; sinon `stopRest()` (l'écran remis à zéro, la valeur effacée). Un repos déjà fini ne rejoue ni vibration ni écran GO |
| `log.js` | `REST_DEPASSEMENT_MAX` | **900 → 300 s** : la même règle app ouverte, au retour au premier plan et au redémarrage (un seul propriétaire, R2) |
| `log.js` | `startRest`, `stopRest`, `setRestPreset`, `addRT`, `applyRestEdit` | un appel à `_reposMemoriser()` là où l'état du repos change (donc aussi « Passer », le tap sur GO, la fin, l'abandon, « Vider », la pause, qui passent par `stopRest`) |
| `app.js` | démarrage | `stopRest()` + l'écouteur −5 s → **`_reposReprendre()`** ; l'histoire de la garantie écrite à sa place |
| `state.js` | `persist()` | **une ligne** : `ft4_wkt_draft` s'écrit sans `repos` (`Object.assign({},S.wkt,{repos:undefined})` — identique à l'octet quand aucun repos ne tourne). Coordonné avec Claude Principal (22/10, aucune objection) |
| `screens.js`, `coach.js`, `app.js`, `constants.js` | aides | « ? » de Séance, aide détaillée, diapo du Guide « Ton repos est un MAXIMUM », point rouge d'origine (`repos-maximum`) : « 15 min » → « 5 min après la fin » + « l'app se ferme ? il t'attend » ; **nouveau point rouge** `repos-persistant`. ⚖️ **Pas de pop-up** (R25) : rien à faire, aucun repère déplacé |

⭐ **Un choix à confirmer par Michel** : la règle des 5 min s'applique **aussi app ouverte** (avant : le chrono continuait en
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
| **Passe complète D-031 n°1** (4 conditions, réseau isolé, sur `ff718da6`, 11:01 → 12:33 UTC, 92 min) | **7 865 ✅ / 1 ❌ — NON VALIDE** : `B-NP01-A` (rechargement en pleine séance, banc `nut_punch01`) comparait **tout** `S.wkt` à l'octet ; le seul écart mesuré était `repos` — un repos expiré, effacé au rechargement comme décidé, et présent dans l'instantané parce que celui-ci devançait le tick. **Témoin périmé** réécrit sur sa garantie (la séance sans `repos`, tout le reste à l'octet) : 36 / 0 sur la branche **et** sur master, mutation MA20 toujours gardée (`BUGS.md` §92) ; `banc:nut_punch01` ajouté aux tests associés |
| **Passe complète D-031 n°2** (4 conditions, réseau isolé) | ⏳ en cours |

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
| app ouverte : le chrono s'arrête plus tôt (5 min au lieu de 15) | voulu (décision 1) ; C-REP-B5 / B6 ; à confirmer par Michel (§4) |

## 8. Retour arrière

- **Tant que rien n'est intégré** : ne pas fusionner la branche. Master et la production ne sont pas touchés.
- **S'il était publié puis retiré** : remettre `log.js`, `app.js`, `state.js`, `screens.js`, `coach.js`, `constants.js` tels qu'à
  `ft-v1258` (`git checkout f82a7c07 -- <fichiers>`) et monter la clé de cache. ✅ **Rejoué à blanc le 22/10** (hors dépôt, réseau
  coupé) : l'**ancien** code ouvre un `ft4_wkt` écrit par le nouveau (avec `repos`) **sans erreur, sans chrono, la séance intacte**, et
  « Terminer » enregistre une séance **sans** `repos`. Le champ resté dans `ft4_wkt` est simplement ignoré jusqu'à la fin de la séance.
- **Revenir à 15 min app ouverte seulement** : `REST_DEPASSEMENT_MAX` est l'unique constante (mais la reprise suivrait aussi :
  la séparer ferait deux règles).

## 9. Recette sur le clone — état de préparation

- **Prêt à être généré, rien fait** : `python3 tools/clone_build.py claude/dreamy-bell-pu88ia` régénère `clone/` depuis cette
  branche, puis le banc d'isolement (`tools/banc_clone_isolation.js`) et le tampon ; la publication du clone (un push de `clone/`
  sur master) demande **l'accord de Michel** — et une **coordination avec Claude Nutrition**, qui attend aussi le clone pour la V2
  (le clone actuel montre D-093, `b1840bc7`).
- ⚠️ **Le clone ne peut pas tout recetter** : son service worker n'a **aucun cache** (D-084, par construction) — la réouverture
  **hors ligne** ne se recette donc que sur la vraie app, une fois publiée. Tout le reste se recette sur le clone : verrouiller le
  téléphone ou changer d'appli pendant un repos, rouvrir (temps réel) ; revenir après 4 min 59 de dépassement (négatif) puis après
  5 min (rien) ; −15 s / +15 s / « Régler » puis fermer ; « Terminer », « Abandonner », pause pendant un repos ; le « + » central.
- Dans le clone, Milo et la synchronisation sont coupés (D-084) : ce lot n'en dépend pas.

## 10. Règle d'or #17 — les 4 compteurs (code applicatif seulement)

- **Données persistées ajoutées : 1** — `repos` (`{debut, total}`) dans la séance active (`S.wkt`, clé `ft4_wkt` existante) ;
  **0 clé de stockage**, 0 migration.
- **Fichiers applicatifs touchés : 6** — `log.js`, `app.js`, `state.js` (1 ligne), `screens.js`, `coach.js`, `constants.js`
  (les 3 derniers : textes d'aide).
- **Lignes : +100 / −19** (net +81), dont la plupart en commentaires écrits à côté de ce qu'ils protègent ; **le code seul : +41 / −10**
  (mesuré sans les commentaires, analyseur `acorn`).
- **Anciens chemins supprimés ou fusionnés : 2** — l'écouteur `visibilitychange` d'`app.js` (coupure à −5 s) disparaît, fusionné
  dans le seuil unique `REST_DEPASSEMENT_MAX` ; le `stopRest()` de démarrage est absorbé par `_reposReprendre` (même effet quand il
  n'y a rien à reprendre).
