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
- Banc `tools/banc_seance_repos.js` sur le code de master : **15 OK / 27 rouges** (les 27 rouges = ce qui est construit ici).

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

## 5. Les tests

⏳ *(chiffres posés à la fin de la campagne)*

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

⏳ *(rempli à la fin)*

## 10. Règle d'or #17 — les 4 compteurs (code applicatif seulement)

⏳ *(rempli à la fin)*
