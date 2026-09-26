# 🤝 Journal de partage — qui travaille sur quoi, en ce moment

> **Créé le 24/08/2026, protocole établi par Michel** après une collision réelle le matin même :
> **deux sessions Claude ont écrit ft-v991 et ft-v992 chacune de son côté**, sans le savoir. Même
> travail, deux fois, découvert seulement au moment de pousser — il a fallu fusionner à la main.
>
> *« Il faut que vous puissiez travailler en symbiose et pas en conflit ou adverse. »* (Michel)

---

## 🛣️ LES DEUX COULOIRS — rappelés par Michel le 04/09/2026

> *« Il ne faut pas que ça fasse obstacle à l'autre Claude. Au départ il est vrai que je t'avais
> rajouté pour la **nutrition**. Il faut bien écrire les journaux et ne pas avoir de conflit de
> code. »*

**Le rappel était mérité, et il est MESURABLE.** Le 04/09, session-A (moi) a livré 8 versions :
6 en **nutrition** (`ft-v1114→1117`, `1119→1121` — base de marques, alias, boissons, recherche),
puis **2 hors couloir** : `ft-v1118` (le cardio seul) et `ft-v1123` (le banc A/B de Milo), toutes
deux dans `coach.js`/`log.js`. **Résultat le même jour : deux collisions de version** (24ᵉ et 25ᵉ),
et un **doublon évité de justesse** — j'annonçais à Michel que le barème de récup du cardio
attendait sa décision, pendant que session-B *était en train de le construire*.

| | **session-A** (`project-status`) | **session-B** (`claude-md-docs`) |
|---|---|---|
| **Couloir** | 🍽️ **Nutrition & aliments** | 🧠 **Milo, récup, séance** |
| Fichiers de tête | `tools/ciqual.py` · `tools/alias.py` · `tools/marques.py` · `data/*.json` · la partie nutrition de `screens.js`/`app.js` | `coach.js` · `log.js` · `tracking.js` · `tests/milo/` · le moteur de récupération |
| Doc de cadrage | `NUTRITION-PHILOSOPHIE.md` · `NUTRITION-MOTEUR.md` · `BRIEF-NUTRITION.md` | `MOTEUR-RAISONNEMENT-MILO.md` · `CONSTITUTION-MILO.md` |

⛔ **Ce que ça ne veut PAS dire** : un couloir n'est pas un mur. Un correctif d'une ligne chez le
voisin reste normal — *ce qui coûte, c'est de CONSTRUIRE une brique dans son couloir sans lui
dire*. La ligne du tableau reste le seul geste obligatoire, et elle suffit **si on la lit**.

⚠️⚠️ **ET `sw.js` COLLISIONNERA TOUJOURS, quoi qu'on fasse au découpage** : *toute* version bump
la même ligne. Ce n'est pas un défaut d'organisation, c'est structurel. La règle est stable et ne
demande aucune discussion : **le second qui fusionne MONTE d'un numéro** — on ne fait jamais
reculer le cache. *Un conflit d'une ligne qu'on sait résoudre par avance ne coûte rien ; c'est le
doublon de travail qui coûte une journée.*

⭐ **Et le vrai verrou reste GIT** — vérifié deux fois le 04/09 : le push non-fast-forward a été
**refusé**, rien n'a été écrasé. *Le journal évite le doublon de TRAVAIL, git évite l'écrasement
de CODE.* Les deux sont nécessaires ; aucun ne remplace l'autre.

⛔ **Et un push refusé pour non-fast-forward ne se contourne JAMAIS par un `--force`** : le refus EST le verrou qui fonctionne. On récupère (`git fetch --all -q`), on fusionne, on repousse. *(Écrit le 24/09/2026 : la règle était appliquée, elle n'était écrite nulle part.)*

---

## 📋 Les tâches

> ⭐ **CE TABLEAU EST EN TÊTE DU FICHIER, ET C'EST VOLONTAIRE (26/08/2026).** Il était à **73 %**
> du document, sous 117 lignes d'explication — alors que *tout le reste du fichier n'existe que
> pour lui*, et que le mode d'emploi disait « le tableau **ci-dessous** » 111 lignes trop tôt.
> Deux raisons, et la seconde est un correctif de bug :
> ① on lit et on écrit ici **avant** de coder, donc c'est ce qu'on doit voir en premier ;
> ② **il devient le PREMIER tableau du fichier**, donc une insertion qui vise « la première ligne
> `| 🟢` » tombe au bon endroit. *Deux lignes de tâche s'étaient perdues dans la légende (25/08,
> 26/08), où markdown les rendait invisibles* — c'est la famille **« le premier match gagnant »**
> de `BUGS.md`, retournée à notre avantage.
> ⛔ **Le contrôle 6 de `tools/check_regles.py` reste**, exprès : la légende est toujours une cible
> possible, et *un détecteur qu'on retire parce qu'on a corrigé la cause laisse la rechute muette*.

> 🗂️ **TABLEAU ÉLAGUÉ LE 24/09/2026** (tri documentaire, session-A). Il portait **362** lignes d'état ; il ne garde que ce qui sert **maintenant** : la tâche en cours, les lignes à vérifier (⏰), les chantiers en pause (⏸️), les décisions permanentes (🧊 ⛔) et les **5 dernières clôtures**. Les **353 autres lignes** sont intactes, **mot pour mot**, en fin de `docs/JOURNAL-ARCHIVE.md`.

| État | Quand (UTC) | Qui | Sujet | Fichiers | Version |
|---|---|---|---|---|---|
| 🟢 | 26/09 19:3x → 21:xx UTC | session-A (project-status) | **🔬 MILO-SEANCE-03 / C2 — une carte mémoire « Je retiens » ne masque plus la carte séance.** ✅ Correctif validé par Michel (commit `222a119c`) : marque dédiée `coach-seance-carte` sur les deux vraies cartes séance, garde d'unicité ciblée, et valable aussi sans bulle cible. Banc C2 22/0, unicité 12/0 (U8 vert), contrôle négatif 12/12, passe 5194/0. ⛔ C3 et D-025 **non commencés**, délai de 12 s inchangé, **0 appel réel à Milo**. `git fetch` fait avant : aucune autre session active. | `coach.js` (`_appendStartSessionBtn`, `_appendSeanceQuestion`), `tests/parcours/`, `tools/`, `sw.js`, `CLAUDE.md`, `docs/` | `ft-v1237` |
| 🟢 | 26/09 14:xx → 17:xx UTC | session-A (project-status) | **🔬 MILO-SEANCE-02 / C1 — la lecture de secours de la séance lit le format que le prompt demande à Milo.** ✅ Correctif validé par Michel sur checkpoint (commit `05a77df2`), branche resynchronisée avec master `a825cab4`, arbre `ft-v1236` préparé ; **publication sur validation de Michel**. ↪️ **Publié et vérifié en réel le 26/09** : master `a825cab4` → `eb1b2c4a` (avance rapide), Pages n°1315 réussi, `ft-v1236` lu par Michel sur son téléphone (Menu → À propos) ; Worker et Apps Script non redéployés. Format du prompt 0/4 → 4/4, mélange 2/4 → 4/4, court et bloc 4/4. ⛔ Cause réelle du 4→2 **non déterminée**. ⛔ C2, C3, D-025, délai de 12 s **non touchés** ; **0 appel réel à Milo**. `git fetch` fait avant : aucune autre session active. | `coach.js` (`_seanceDepuisTexte`), `tests/parcours/`, `tools/`, `sw.js`, `CLAUDE.md`, `docs/` | `ft-v1236` |
| 🟢 | 26/09 10:3x UTC | session-A (project-status) | **📚 SYNCHRONISATION DOCUMENTAIRE POST-ft-v1235** (suite de l'audit « DOCUMENTATION À SYNCHRONISER »). ✅ Docs seulement, **un seul commit** sur la branche (consigne), donc réservation et clôture dans le même commit — `git fetch` fait avant : aucune autre session active. Aucun fichier servi, aucun test, aucune publication. | `CLAUDE.md`, `BUGS.md`, `docs/` (CONTEXTE-ACTUEL, DECISIONS, MILO-PDF1, CONTRAT-FT-MILO, JOURNAL-DE-TEST, JOURNAL-DE-PARTAGE, NUTRITION-GLUCIDES-2026-09-24) | — |
| 🟢 | 26/09 09:3x → 10:xx UTC | session-A (project-status) | **🔬 MILO-SEANCE-01 — diagnostic forensique de la traduction et du repli de séance** ✅ **DIAGNOSTIC LIVRÉ, RIEN CORRIGÉ** (`docs/MILO-SEANCE-01.md`) : ~~4 → 2 = le repli~~ ↪️ *rectifié le 26/09 : symptôme réel 4→2 ; cause de l'événement réel non déterminée. Un mécanisme capable de produire ce résultat a été reproduit localement dans la lecture de secours* ; U8 mémoire, U9 rechargement, D-025 via « Mes discussions » signalés ; décision de Michel attendue. (4 exercices demandés, 2 chargés pendant la vérification ft-v1235). ⛔ **LECTURE ET TESTS SEULEMENT, aucune correction** avant que Michel ait vu le diagnostic ; MILO-PDF1 fermé, non rouvert. | `tests/parcours/` (témoins neufs), `tools/` (banc), `docs/` — aucun fichier servi | — |
| 🟢 | 26/09 08:1x → 09:1x UTC | session-A (project-status) | **🚀 PUBLICATION MILO-PDF1 — Worker d'abord, app ensuite, vérification réelle.** ✅ **PUBLIÉ ET VÉRIFIÉ en `ft-v1235`** (master `ca04c4b2` → `24799e56`) : Worker vérifié AVANT l'app (1 appel réel), D-027 (programme, déjà conforme) et D-028 (annonce de prochaine séance bloquée) décidées par Michel avant publication, passe complète 5143/0, V1/V2/V4 vérifiés en réel, V3 à observer. Détail : `docs/MILO-PDF1.md` §C. Worker déployé depuis la branche (`workflow_dispatch`) et vérifié AVANT toute intégration ; puis master avance en avance rapide jusqu'à `11cabbc8` + bump `ft-v1235`. ⚠️ L'intégration porte TOUS les chantiers validés de la branche (poids, débrief, Nutrition B1/B2/D-016→D-024, contrat FT→Milo, AUTH1, PDF1/1B). ⛔ Aucune autre session ne publie pendant ce temps. | `worker.js` (déploiement), master, `sw.js`, `CLAUDE.md`, `docs/` | `ft-v1235` |
| 🟢 | 25/09 19:09 → 21:3x UTC | session-A (project-status) | **📄 MILO-PDF1B — correction après contre-vérification.** ✅ **Corrigé et testé, NON publié, 0 appel réel** (banc 79/0, contrôle négatif 47/47, passe complète — voir `docs/MILO-PDF1.md` §B6). Couture remplacée par un raccord à ancre exacte (échec → incomplet), `stop_reason` fail-closed (seul `end_turn` = complet), aucune séance depuis une réponse non complète (décision Michel), marqueur AVANT le texte. ⛔ Pas de merge, pas de publication, pas de bump, pas de déploiement Worker. | `worker.js`, `coach.js`, `log.js`, `tests/parcours/`, `tools/`, `docs/MILO-PDF1.md` | — |
| 🟢 | 25/09 16:51 → 17:45 UTC | session-A (project-status) | **📄 MILO-PDF1 — réponses Milo tronquées / export « Analyse complète ».** ✅ **Corrigé et testé, NON publié, NON vérifié en réel** (Worker de prod = master `e77060c3`, sans `stop_reason`) : `3ee66b4f` (Worker) · `d83b0270` (client + témoins B-CCCLXXVIII→LXXX, 37/0, contrôle négatif 26/26) · passe complète **5083 / 0**, 4 conditions. Détail : `docs/MILO-PDF1.md`. Transporter `stop_reason` du Worker au client, ne jamais présenter comme complète une réponse signalée tronquée par le modèle, continuation bornée (1 max) pour l'analyse de programme, JSON tronqué jamais accepté. ⛔ Pas de `1024 → 4096 partout`, pas de changement de modèle, pas de merge, pas de publication, pas de bump. | `worker.js`, `log.js`, `coach.js` *(selon la carte)*, `tests/parcours/`, `tools/`, `docs/` | — |
| 🟢 | 24/09 18:10 → 26/09 | session-A (project-status) | **🍽️ NUTRITION — TDEE / glucides / calories / provenance / cohérence.** Reprise validée par Michel (fin du gel pour CE chantier). Anciens diagnostics = **pistes à revalider** (659 g de glucides, profil contaminé 41 ans/179 cm/1,725, `tdeeObserve()` V9, `S.bw || 80`). ⛔ Aucune nouvelle règle macro / formule TDEE / plafond sans décision de Michel · moteur calories de séance GELÉ · pas de merge, pas de publication, pas de bump. | `state.js`, `screens.js`, `app.js` *(selon la cartographie)*, `tests/parcours/`, `tools/`, `docs/CONTEXTE-ACTUEL.md` | — ⏳ **24/09 : cartographie + témoins NUT-01→09 livrés, moteur NON modifié — EN ATTENTE DE MICHEL** (glucides = résidu sans plafond ; options A→G dans `docs/NUTRITION-GLUCIDES-2026-09-24.md`). ▶️ **24/09 soir : Michel tranche B1 (activité jamais choisie ≠ 1,55 silencieux, D-016 étendue) + B2 (restauration bornée) — EN COURS** · fichiers : `state.js`, `setup.js`, `index.html`, `coach.js`, `screens.js`, tests. B3 et glucides : non touchés. 🌙 **Nuit 24→25/09 : B1/B2 livrés (ec7d076c, 4 929/0). EN COURS : témoins reset + B2 étendus + M4, remesure complète, matrice activité × métier, audit B3 factuel.** B3, glucides, D-021 : non tranchés. 🌙✅ **Nuit : vérifications B1/B2 faites, 4 défauts du périmètre corrigés, remesure + matrice + B3 factuel documentés (§10). Reste OUVERT : D-021, B3, glucides → arbitrage de Michel.** ▶️ **25/09 : Michel tranche D-021 (confirmation unique des anciens 1,55). EN COURS : provenance de l'activité, migration, R34, règle #11, prépublication** · fichiers : `state.js`, `setup.js`, `screens.js`, `coach.js`, `Code.js`, `index.html`, tests. Aucune publication. ✅ **26/09 : PUBLIÉ en `ft-v1235`** (B1/B2 · D-016/D-020/D-021 · R34-A D-022/D-024). ⏳ **Reste en attente de Michel : B3 et politique glucidique** (non touchés). |
| 🟢 | 24/09 16:50 → 17:28 UTC | session-A (project-status) | **🧠 MILO — provenance structurelle du débrief : supersets / ordre / RIR / cardio.** Retour réel de Michel, 4 symptômes revalidés en conduisant l'app : ① Larsen « 70→90 » ✅ — c'est l'APP qui écrivait à Milo « saut de 22 % entre 70 et 90 kg » (chaîne des échauffements fermée par la charge MAX au lieu de la 1ʳᵉ série de travail réelle) · ② cardio de fin → « échauffement » ❌ prémisse fausse côté code (phase conservée jusqu'à Milo), cause restante ❓ non démontrable sans la séance · ③ superset aplati ✅ (une séance TERMINÉE partait sans relation) · ④ RIR de l'Oiseau ✅ (jamais proposé : le superset enchaîne sans repos). **Corrigé au propriétaire** : `_monteeDefauts` (seuils inchangés), `_supersetTxt`, question RIR multi-séries en superset (`_rirCible` garde son contrat). Témoins B-CCCLVIII/LIX (`tests/parcours/debrief_provenance.js`) : 9 rouges avant, **24/0** après · contrôle négatif **17/17** (2 trous bouchés) · passe complète VALIDE sur `307f0972` (**4875 ✅ · 0 ❌**). ⛔ Aucune règle de coaching inventée, aucune publication, aucun bump, aucun merge. | `log.js`, `coach.js`, `RETOURS-TESTEURS.md`, `tests/parcours/debrief_provenance.js`, `tests/parcours/runner.js`, `tools/banc_debrief_provenance.js`, `tools/mut_debrief_provenance.py`, `docs/PROMPT-MILO-REEL.txt` *(régénéré)* | `e3ae216e` + `307f0972` *(branche — non publié, aucune version)* |
| 🟢 | 24/09 14:47 → 16:06 UTC | session-A (project-status) | **⚖️ CHAÎNE POIDS — une règle, un événement, un poids courant ; puis l'UX « Dernière mesure ».** Hypothèses du registre **revalidées en conduisant l'app servie** : F003 ✅ (restauration sans borne, « 85,9 » → 85) · F004 ✅ (import 500/0/−10 kg, poids courant pris sur le dernier jour DU FICHIER, date « 2026-20-09 » en tête) · F005 ✅ pour sa moitié « entrées » (le Profil refusait 20 et 300 kg ; les `S.bw || 80` des calculs restent ouverts, gel Nutrition) · F011 ✅ (le Profil écrivait `S.bw` sans pesée : calculs 84, Accueil 86) · **F012 ❌ prémisse fausse** (le bilan est sur l'écran Progrès, le Profil est redessiné à chaque entrée — invariant figé quand même). ⭐ Trouvés en mesurant : `S.bw = S.weightLog[0].kg` écrivait « undefined » ou 0 ; le champ prérempli + ✓ fabriquait une pesée. **Corrigé au propriétaire** : `_poidsValide` partout (bornes inchangées), `poidsDernier()` (patron `mensDerniere`), `_enregistrerPesee` pour la carte ET le Profil (champ touché seulement). **UX** : champ vide, « Dernière mesure : XX,X kg — JJ/MM/AAAA », écart en présentation. ⛔ Modèle inchangé : une pesée par jour. Témoins B-CCCLV/LVI/LVII (`tests/parcours/poids_chaine.js`), contrôle négatif `tools/mut_poids_chaine.py`, passe complète VALIDE sur `66a6bd5e` (**4851 ✅ · 0 ❌**, 4 conditions) · contrôle négatif **31/31 conformes**. ⛔ Aucune publication, aucun bump, aucun merge. | `state.js`, `tracking.js`, `setup.js`, `screens.js` *(commentaire)*, `tests/parcours/poids_chaine.js`, `tests/parcours/runner.js`, `tools/banc_poids_chaine.js`, `tools/mut_poids_chaine.py`, `docs/PROMPT-MILO-REEL.txt` *(régénéré)* | `f9a8ec74` + `66a6bd5e` *(branche — non publié, aucune version)* |
| 🟢 | 24/09 14:0x → 14:18 UTC | session-A (project-status) | **🗂️ TRI DOCUMENTAIRE — `CONTEXTE-ACTUEL.md` ramené à une page, historique du tableau des tâches déménagé.** Tout ce qui est retiré part **VERBATIM** en fin de `docs/JOURNAL-ARCHIVE.md` (**R23** — *tailler ≠ supprimer*). ⛔ Aucun fichier servi, aucun bump. ✅ Validé par Michel, committé et poussé en `0d8a22b2`. | `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md` | `0d8a22b2` *(documentaire — aucune version)* |
| ⏰ | 13/09 14:15 UTC | session-B (claude-md-docs) | **ACCUEIL + PROGRÈS — les 3 constats de l'audit du 12/09.** ⏰ **Périmée** (🟡 depuis plus de 3 h). Vérifiée le 24/09 par session-A : réservation trouvée (`ab8ff5e5`), **aucune livraison identifiée** — état **INDÉTERMINABLE**. ⛔ **À vérifier avant toute reprise.** Ligne d'origine intacte dans `docs/JOURNAL-ARCHIVE.md` (24/09). | `tracking.js`, `log.js`, `setup.js`, `tests/parcours/runner.js` | — |
| ⏰ | 08/09 16:05 | session-A (project-status) | **⚖️ L'INVARIANT DE REPRISE — des totaux ne doivent jamais être réappariés à une autre quantité.** ⏰ **Périmée** (🟡 depuis plus de 3 h). Vérifiée le 24/09 : le numéro réservé (`ft-v1176`) a servi à **un autre sujet**, et **aucune trace de livraison** n'a été trouvée (archive ≥ ft-v1170, historique git) — état **INDÉTERMINABLE**. ⛔ **À vérifier avant toute reprise.** Ligne d'origine intacte dans `docs/JOURNAL-ARCHIVE.md` (24/09). | `app.js`, `tests/parcours/runner.js`, `sw.js` | — |
| 🟢 | 24/09 08:0x → 12:1x UTC | session-A (project-status) | **🧠 DOSSIER V9 — APPRENTISSAGE LONGITUDINAL, CANDIDATE NON SERVIE, 0 LIGNE MÉTIER.** ⭐⭐ **LE RÉSULTAT PRINCIPAL N'EST PAS V9** : ***les ~659 g n'étaient PAS un défaut de répartition des macros, c'était un TDEE de 3 515 kcal que rien ne venait corriger.*** V9 rend **636 g** sans données (V0 : 629) puis **558 g** une fois qu'elle a appris. ⛔⛔ **ET LES 600 g VIENNENT DE MOI** — `git log -S` le prouve : première apparition dans mon propre commit du 23/09, **zéro occurrence dans le moteur servi**, et **aucune borne absolue en g/jour n'existe dans la littérature**. Retiré des invariants, conservé comme **SIGNAL** étiqueté. ⭐ **Remplacé par une PLAUSIBILITÉ à 4 niveaux** adossée à une échelle publiée (3-5 / 5-7 / 6-10 / **8-12 g/kg** selon la charge) : max mesuré **10,9 g/kg**, donc dans la plage. ⭐⭐ **Alpert 2005 remplace le nombre fixe** : le déficit est borné par ce que la masse grasse peut céder (31 kcal/kg/j), et la transition Murphy & Koehler → Alpert est **interpolée entre les deux seuils OMS** (25 → 30). 🥊 **Le contre-audit a trouvé 6 défauts dans MA V9**, dont ⛔⛔ **mon garde RED-S qui rendait la perte de poids IMPOSSIBLE aux profils lourds** (−18 kcal de déficit à 150 kg : le seuil de 30 kcal/kg de masse maigre a été calibré sur des athlètes) et une **falaise de 243 kcal entre 95 et 96 kg**. ⚠️ **Mon cas de référence « 659 g » était FAUX** (il rendait 490 g) — reconstruit de mémoire au lieu d'être relu. ⛔ **AUDIT §1 : `CLAUDE.md` annonce « TDEE adaptatif » et « Harris-Benedict adaptatif » — les DEUX sont faux** (Mifflin + Katch, rien d'adaptatif, 0 occurrence de `recalibr`). ⛔ **63 témoins verts (bloc B-CCCLIV, NON BRANCHÉ), 31 mutations 31 conformes** — mais le contrôle négatif a d'abord rendu **25/31**. 📣 **Pour vous, session-B** : ⛔ **aucun fichier servi, aucune version, aucune passe** — `docs/` et `tools/` uniquement. | `docs/DOSSIER-V9-APPRENTISSAGE.md` et `.pdf` *(nouveaux)*, `tools/moteur_v9.js`, `tools/banc_v9.js`, `tools/temoins_v9.js`, `tools/mut_v9.py`, `tools/gen_v9_pdf.py` *(nouveaux)* | — *(candidate, pas de version)* |
| 🟢 | 23/09 09:0x → 11:3x UTC | session-A (project-status) | **⚖️ DOSSIER DE DÉCISION V8 — CANDIDATE NON SERVIE, 0 LIGNE DU MOTEUR SERVI.** ⭐⭐ **La contre-vérification tranche la question qui bloquait tout** : la plage protéique **2,3-3,1 g/kg est bien en MASSE MAIGRE** (Helms, Aragon & Fitschen 2014) — ⛔ **mon dossier du 22/09 avait tort deux fois**, d'abord en affirmant « poids de corps », puis en retirant sans remplacer. ⚠️⚠️ **ET MA RÉTRACTATION SUR LES LIPIDES ÉTAIT FAUSSE AUSSI** : Iraki 2019 donne bien **0,5-1,5 g/kg** — donc les ratios actuels de Force Tracker (0,75-1,0) sont **DANS** la plage publiée, et mon « systématiquement au bas de la plage » était infondé. ⛔⛔ **ET J'AVAIS MAL EMPLOYÉ HENSELMANS** : sa revue dit que des glucides *supplémentaires* n'améliorent pas la performance à ≤ 10 séries/groupe — j'en avais fait un **plafond d'apport**. *C'est transformer une observation en seuil physiologique.* Reclassé en OBSERVATION. ⛔ **Recommandations russes : INTROUVABLES.** Recommandations japonaises : c'est un **relevé de consommations**, pas une recommandation. ⭐⭐ **Et V5 — ma propre proposition de la semaine dernière — est RÉFUTÉE** : Murphy & Koehler 2022 plafonne le déficit à **500 kcal/j en ABSOLU**, or V5 le rendait proportionnel (−757 kcal à 150 kg). *Le déficit fixe de V0 était plus défendable que ma correction.* ⭐ **V8 : 1 756 000 profils × 7 variantes**, corpus adversarial + population plausible. Fermeture **287 → 0** pour 100 000 · protéines > 2,2 g/kg **57 100 → 0** · > 3,1 g/kg de masse maigre **42 978 → 0** · EA < 30 **3 937 → 1 777**. 🥊 **Le contre-audit a trouvé 8 défauts dans MA candidate** (dont l'arrondi du plafond, la phase supprimée en silence, une marche de 136 kcal, et l'ordre des bornes qui faisait perdre le plancher de santé). ⛔ **50 témoins verts (bloc B-CCCLIII, NON BRANCHÉ), 29 mutations 29 conformes** — mais le contrôle négatif a d'abord rendu **20/29** : *un témoin qui ne visite pas le régime où la règle mord ne mesure pas la règle*. 📣 **Pour vous, session-B** : ⛔ **aucun fichier servi, aucune version, aucune passe** — `docs/` et `tools/` uniquement. | `docs/DOSSIER-DECISION-V8.md` et `.pdf` *(nouveaux)*, `tools/moteur_v8.js`, `tools/banc_v8.js`, `tools/temoins_v8.js`, `tools/mut_v8.py`, `tools/gen_v8_pdf.py` *(nouveaux)* | — *(candidate, pas de version)* |
| ⏸️ | 16/09 09:0x → 11:5x | session-B (claude-md-docs) | **🪪 CHANTIER S1 — IDENTITÉ SERVEUR MINIMALE.** Suite directe de l'audit du 15/09. Objectif : *« le serveur ne doit plus considérer l'e-mail envoyé par le client comme une preuve d'identité »*. **Étape 1 = AUDIT du code servi** (création · connexion · code perso · sauvegarde · restauration · `pushHealth` · Worker · quotas · Premium · `ft_miroir`), puis conception du credential (jeton d'appareil, entropie forte, révocable, multi-appareils) et des témoins du comportement ACTUEL. ⛔⛔ **POINT BLOQUANT NOMMÉ PAR MICHEL** : les comptes existants **sans code perso** n'ont aucune preuve — *« INTERDIT : e-mail seul → émission automatique d'un credential »*, et **STOP avant cette mutation** si aucune preuve fiable n'existe. ⛔ **4 décisions produit lui appartiennent** : comptes sans code · durée de vie du jeton · multi-appareil · récupération après perte. 📣 **Pour vous** : je LIS tout ; si j'écris, ce sera **strictement borné à l'identité** — ⛔ **RIEN sur Nutrition** (`foodLog`, douane, portions, scanner, `savedFoods`, writers : 0 ligne). ⛔ **Pas de S2 Supabase, pas de S3 idempotence, pas de `deleteAccount`, pas de migration cloud.** ⚠️ Aucun numéro de version pendant le travail. Départ : `cb3a90a3`, servie `ft-v1215`, tree propre, 0 commit concurrent. **⛔⛔ RÉSULTAT — ÉTAPE 1 FAITE, ARRÊT AVANT MUTATION.** ⭐ **Le point bloquant n'est PAS bloqué** : une preuve de bootstrap existe pour les comptes sans code — la **vérification e-mail**, déjà déployée et bornée (**5 essais · 15 min · 60 s · 80/jour** ⇒ ~400 tentatives/jour contre 10⁶). ⚠️ **Faiblesse signalée** : le code de confirmation vient de **`Math.random()`** — à remplacer si ce chemin délivre un jeton. ⭐ **Credential proposé** : 256 bits (`crypto.getRandomValues`), **haché SHA-256** côté serveur, **N jetons par compte** ; ⛔ **pas d'`accountId` maintenant** (migration disproportionnée), la table de jetons servant de point d'indirection. ⭐ **Deux propriétés DÉJÀ correctes à préserver** : le serveur ne lit jamais un `premium` client, et la lecture d'un compte sans code est refusée. ⛔⛔ **`V2 RESTE OUVERTE JUSQU'À S2`** — le miroir part du navigateur, pas du Worker. ⛔ **4 décisions rendues à Michel** (comptes sans code · durée de vie · multi-appareil · récupération) : ce sont les 4 paramètres qui déterminent le code. **Réponses mesurées : Q1 OUI · Q2 OUI · Q3 PARTIEL.** Tests : **bloc B-CCCXIII, 10 témoins**, passe **4150 ✅ · 0 ❌** (4 conditions réunies : ligne TOTAL · `EXIT=0` · arbre propre · 0 commit concurrent). ⛔ **CONTRÔLE NÉGATIF : 15 mutations, 15 mordent par LEUR garde** — dont **4 qui font SEMBLANT d'implémenter S1** : un dossier qui dit « pas encore fait » alors que c'est fait est aussi faux que l'inverse. ⛔ **Aucun fichier servi modifié, `sw.js` NON bumpé, Nutrition 0 ligne.** | `docs/DOSSIER-S1-IDENTITE-SERVEUR.md` (nouveau) · `tools/gen_s1_pdf.py` (nouveau) · `tests/parcours/runner.js` (bloc B-CCCXIII) · `docs/JOURNAL-DE-PARTAGE.md` | *(étape 1 close — décisions attendues)* |
| ⏸️ | 15/09 14:0x → 15:2x | session-B (claude-md-docs) | **🔑 PHASE 1ter — IDEMPOTENCE DU DÉBRIEF : UN MÊME DÉBRIEF LOGIQUE = UN SEUL APPEL IA.** Suite directe de 1bis (qui a prouvé **2 requêtes ARRIVÉES** pour un rechargement, **3** pour deux). ⛔⛔ **Michel impose une ÉTAPE 0 AVANT tout code** : inventorier l'infrastructure serveur RÉELLEMENT disponible, en distinguant *déjà configuré* / *possible mais non configuré* / *nouveau service ou nouveau coût* — et ***« si aucune infrastructure existante ne permet une idempotence serveur fiable, ARRÊTE AVANT DE CODER »***. ⛔ *« N'ajoute pas un nouveau service payant sans feu vert »* · *« ne maquille pas une déduplication approximative en idempotence fiable »*. 📣 **Pour vous** : en étape 0 je ne fais que **LIRE** (`worker.js`, `wrangler.toml`, `Code.js`, `coach.js`, `log.js`) ; je n'écris que dans `docs/` et `tools/`. ⛔ **RIEN dans un fichier servi tant que Michel n'a pas tranché**, donc **`sw.js` NON bumpé** à ce stade (je le dirai si ça change). ⛔⛔ **PÉRIMÈTRE INTERDIT nommé par Michel** : Nutrition · scanner · prévu/réalisé · `buildSessionDebriefContext` · réduction du contexte · blocs C+D · Gardien · Sonnet→Haiku · caches · mémoire Milo · quotas Premium (hors déduplication d'un même débrief) · aucune nouvelle fonctionnalité utilisateur. **⛔⛔ RÉSULTAT — ARRÊT À L'ÉTAPE 0, COMME DEMANDÉ.** ① **Aucun stockage serveur configuré** : `wrangler.toml` déclare **zéro binding**, le Worker ne lit que **2 secrets**. ② ⭐⭐ **Mais le vrai blocage n'est pas technique** : « 1 appel max » + « jamais de perte » ⇒ le **résultat** doit survivre à la disparition du client ⇒ **stockage serveur du TEXTE** — or `coach.js` écrit que *« le fil vit UNIQUEMENT sur le téléphone… c'est un CHOIX de conception »*. **Décision de Michel.** ③ ⭐ **L'identifiant existe déjà** : `sess.id = Date.now()` (unique à la milliseconde, séances importées comprises) → aucun mécanisme nouveau. ④ ⛔ **KV écarté** (pas de compare-and-set). ⑤ **Seule option déjà configurée et atomique : Apps Script + `LockService`** (0 €, mais latence sur le chemin critique) — ⚠️ `LockService` n'est **employé nulle part** aujourd'hui. ⚠️ **Non vérifiable d'ici** : limites gratuites Cloudflare / plan Durable Objects (proxy). ⛔ **Aucun code, aucun fichier servi modifié, `sw.js` NON bumpé.** Contrôle négatif : **14 mutations, 14 mordent par LEUR garde**, contrôle sain vert avant ET après, arbre copié. | `docs/IDEMPOTENCE-DEBRIEF.md` (nouveau) · `tools/gen_1ter_pdf.py` (nouveau) · `docs/CONTEXTE-ACTUEL.md` · `docs/JOURNAL-DE-PARTAGE.md` | *(clos — étape 0, décision attendue)* |
| 🧊 | 13/09 15:0x | session-A (project-status) | **🧊🧊 LE CHANTIER NUTRITION PASSE EN PHASE D'OBSERVATION RÉELLE — GELÉ JUSQU'À NOUVEL ORDRE.** Michel valide l'étape 6 et arrête là : ***« je ne veux pas lancer un nouveau chantier Nutrition pour l'instant »*** · ***« ne modifie plus son comportement sans nouveau feu vert explicite »***. ⛔ **CE QUI EST GELÉ, NOMMÉMENT** : les **21 règles** de la douane · aucune ne devient **bloquante** · aucun **seuil** · les **divergences déjà connues** (une ligne éditée qui perd sa traçabilité · une ligne à zéro refusée d'un côté et acceptée des trois autres · `rejouerRepas` qui perd `sourceId`/`etat` · `ml` conservé en édition) · `savedFoods` · l'écart **48,3 / 48** · l'historique et les migrations · **le format du carnet d'observation**. ⭐ **CE QU'ON ATTEND** : ≥ **100 lignes** réellement observées · les **4 écrivains** vus au moins une fois (`addFoodEntry` · `quickAddFood` · `rejouerRepas` · `saveEditFood`) · idéalement **2 semaines** · et surtout une **couverture** suffisante des formes rencontrées. ⚠️⚠️ **LA CONSIGNE QUI COMPTERA LE JOUR DE L'ANALYSE** : ***une règle qui n'a jamais mordu n'est PAS automatiquement inutile*** — il faut vérifier que les formes capables de la déclencher ont **réellement été rencontrées**. 👉 *Sinon « jamais mordu » se lit « à supprimer », et on retire un garde-fou parce que le cas ne s'est pas encore présenté.* 📣 **À la session qui passera par ici** : Nutrition est **hors service** ; le reste du dépôt est libre. ⛔ **Aucun fichier servi n'est modifié par cette ligne** (`app.js`, `index.html`, `sw.js` intacts) — **`sw.js` n'est donc PAS bumpé**, et le prochain qui livre garde **ft-v1207**. | `CLAUDE.md` · `docs/CONTEXTE-ACTUEL.md` · `docs/DOUANE-NUTRITION.md` | *(gel — aucune version)* |
| ⛔ | 27/08 14:45 | session-A (project-status) | **DÉCISION DE MICHEL — ON NE TOUCHE PAS AU WORKFLOW DE DÉPLOIEMENT** : *« on ne touche pas au workflow surtout »*. ⚠️⚠️ **À LIRE AVANT DE PROPOSER L'OPTIMISATION QUI SAUTE AUX YEUX**, parce qu'elle saute vraiment aux yeux : mesuré le 27/08, **17 déploiements pour 3 livraisons réelles** (5,7 runs par version) — 8 étaient des lignes de réservation 🟡, du **markdown seul**, qui ne changent rien sur le site et redéploient tout. Et chaque run empaquette **9,4 Mo** que l'app ne lit jamais (`docs/` 7,4 · `tests/` 1,7 · `tools/` 0,3). **J'ai proposé un `paths-ignore`. Michel a refusé, et il a raison** : `deploy-pages.yml` existe **parce que** les déploiements se bloquaient **en silence** (site coincé à ft-v600 puis ft-v616 sans que personne soit prévenu — c'est écrit en tête du fichier). *Un filtre qui empêche un run de partir recrée très exactement ce mode de panne*, et **R18** dit qu'on vérifie le DÉPLOIEMENT, pas le push : si certains pushs cessent de produire un run, « pas de run » devient ambigu. ⛔ **Et le coût invoqué n'existe pas** : `forcetracker` est **public** (`visibility: public`, vérifié par l'API), donc **Actions y est gratuit et illimité** sur les runners standard. Les 6,40 $ du relevé de facturation ne viennent **pas** de là — et le montant **facturé est 0 $**. *On allait optimiser une dépense qui n'existe pas, au prix du garde-fou qui protège les mises en ligne.* | *(aucun — décision)* | — (R30) |

---

## ⚡ EN 20 SECONDES — ce que tu fais avant de commencer

```bash
git fetch --all -q                 # ⚠️ SANS ÇA, TU NE VOIS RIEN (voir §« La faille »)
```

1. **Tu LIS** le tableau **en haut de ce fichier**. Une tâche marquée 🟡 **en cours** ? → tu ne prends pas ce sujet.
2. **Tu ÉCRIS** ta ligne (une seule), **tu pousses tout de suite** — avant d'écrire une ligne de code.
3. **Tu travailles.**
4. **Tu CLÔTURES** ta ligne avec la version livrée (`ft-vNNN`) et tu pousses.

**Format d'une ligne — rien de plus :**

```
| 🟡 | JJ/MM HH:MM       | session-X | <sujet en quelques mots> | <fichiers> | — |
| 🟢 | JJ/MM HH:MM → HH:MM | session-X | <sujet en quelques mots> | <fichiers> | ft-vNNN |
```

⚠️ **L'exemple ci-dessus est volontairement en `JJ/MM`, pas avec de vraies dates** — trouvé en me
servant du fichier pour la première fois : un exemple qui *ressemble* à une vraie ligne 🟡 se lit
comme une **tâche en cours**, et bloque un sujet que personne ne traite. *Un exemple ne doit jamais
pouvoir passer pour une donnée.*

⚠️ **Une ligne suffit.** C'est la leçon de `docs/JOURNAL-DE-TEST.md` : *un fichier qu'on ne remplit
pas cesse d'être rempli* — les quatre fichiers vivants du projet tiennent parce qu'ils sont **bon
marché**. Pas de gabarit, pas de section, pas de compte rendu : la date, l'heure, le sujet, les
fichiers, la version.

---

## 🚦 Les états

> ⛔⛔ **CE TABLEAU EST UNE LÉGENDE — ce n'est PAS celui des tâches.** Le tableau des tâches
> est **PLUS HAUT**, tout en tête du fichier, sous « 📋 Les tâches ». ⚠️ **Deux lignes de tâche y sont déjà tombées**
> (25/08 et 26/08) : les deux tableaux commencent par le même jeton `| 🟢`. ⭐ **Le vrai tableau
> est désormais le PREMIER du fichier** (26/08), donc une insertion qui vise « la première ligne
> `| 🟢` » tombe maintenant au bon endroit — mais la légende reste une cible possible.
> **Et ça ne se voit pas** : markdown jette les colonnes en trop, la ligne existe dans le
> fichier et devient invisible à l'écran — *personne ne peut voir manquer une ligne dont on
> ignore l'existence.*
> 👉 **Pour insérer une tâche, s'ancrer sur l'EN-TÊTE du tableau des tâches**, jamais sur un
> jeton d'état. Le contrôle 6 de `tools/check_regles.py` refuse désormais toute ligne datée ici.

| État | Ce que ça veut dire |
|---|---|
| 🟡 **en cours** | quelqu'un travaille dessus **maintenant** — ne pas prendre ce sujet |
| 🟢 **livré** | terminé, la version est indiquée |
| 🔴 **abandonné** | arrêté en route, avec la raison (une session qui meurt, un changement de cap) |
| ⏰ **périmé** | 🟡 depuis **plus de 3 h** sans clôture → considéré abandonné (voir ci-dessous) |
| ❓ **avis demandé** | on demande à l'autre session **ce qu'elle en pense**, pas de faire le travail. ⭐ Nouveau le **31/08/2026**, sur une correction de Michel : *« la session B c'est pas un relais c'est pour avoir plusieurs avis »*. **La distinction n'est pas cosmétique** : un relais transmet une tâche et attend qu'elle soit faite ; une demande d'avis attend une **contradiction**. Écrire l'une pour l'autre fait construire ce qu'on voulait discuter. ⚠️ Et une demande d'avis dit **ses données et sa propre limite**, pour que l'autre puisse juger au lieu de recopier. |
| 📣 **information** | un fait que l'autre session doit connaître (un fichier retiré, un piège rencontré) — **aucune action attendue** |
| ⛔ **décision** | un arbitrage de Michel qui s'applique aux deux sessions |
| ✅ **réglé** | réponse à un signalement de l'autre session : c'est fait, il n'y a plus rien à faire |

> ⚠️ **Ces quatre derniers états étaient EMPLOYÉS sans être déclarés** (constaté le 31/08/2026) —
> exactement le défaut corrigé en **ft-v1028** sur `JOURNAL-DE-TEST.md`, où un `🟠` absent de toute
> légende était **sauté en silence** par le compteur. *Un marqueur qu'aucune légende ne définit se
> lit comme chacun veut, et un contrôle qui ne garde que ce qu'il reconnaît ne peut jamais signaler
> ce qu'il ne reconnaît pas.* Le `🟠` du 24/08 est ramené à **📣** : il raconte une collision
> **résolue par fusion**, pas un abandon. Un état composé (`🔴🟢` = incident **puis** réglé) reste
> lisible et n'est pas retouché — c'est la ligne d'une autre session.

---

## ⚠️ CE QUE CE PROTOCOLE PROTÈGE — ET CE QU'IL NE PROTÈGE PAS

**À lire une fois. C'est ce qui évite de lui faire confiance pour la mauvaise chose.**

| | Qui s'en charge |
|---|---|
| Éviter que deux sessions fassent **le même travail** | **ce fichier** ✅ |
| Éviter qu'une session **écrase le code** de l'autre | **git**, pas ce fichier |

⭐⭐ **LE VRAI VERROU EST GIT, ET IL EST AUTOMATIQUE.** Un `git push` qui n'est pas en avance rapide
**échoue** — c'est exactement ce qui a sauvé le travail de l'autre session ce matin : mon push a été
refusé, j'ai regardé, et j'ai fusionné au lieu d'écraser. *Ce fichier est un panneau d'affichage, pas
une serrure.* Ne jamais forcer un push (`-f`) sur une branche partagée pour « passer outre ».

### ⛔ LA FAILLE, ET ELLE EST RÉELLE

**Un fichier ne prévient pas — il faut aller le lire.** Les deux sessions travaillent sur des
**clones séparés** : ce que l'autre écrit n'existe chez toi qu'après un `git fetch`. Ce matin,
j'avais le dépôt sous la main et je n'ai **pas vu** le travail de l'autre avant de pousser.

👉 **D'où la règle n°1, non négociable : `git fetch` AVANT de lire ce fichier, et RE-fetch avant de
pousser.** Sans ça le protocole ne vaut rien — il donne même une fausse sécurité, ce qui est pire que
pas de protocole du tout.

### ⚠️ Les trois autres limites, écrites plutôt que découvertes

1. **La fenêtre de course.** Entre le moment où tu lis (« rien en cours ») et celui où tu pousses ta
   ligne, l'autre peut avoir commencé. La fenêtre est courte mais elle existe — *c'est exactement la
   course `_saveCoachMemory` corrigée en ft-v993 : lire, puis écrire, sans rien entre les deux.*
   👉 **Ce qui la referme** : pousser sa ligne **immédiatement**, avant de coder. Si le push est
   refusé, c'est que l'autre a écrit entre-temps → on relit.
2. **Une session peut mourir sans clore sa ligne.** Le conteneur redémarre, la session est fermée,
   et la ligne reste 🟡 pour toujours — bloquant l'autre sur un sujet que plus personne ne traite.
   👉 **Ce qui la referme** : la règle des **3 heures**. Une ligne 🟡 plus vieille que ça est
   considérée périmée ; on la passe en ⏰ **avec la raison**, et le sujet se reprend.
3. **Ça repose sur la discipline.** Si une session oublie d'écrire sa ligne, rien ne le signale.
   Le protocole réduit le risque, il ne l'annule pas.

### ⛔⛔ LA 4ᵉ LIMITE, ET ELLE ÉTAIT LA PLUS PROCHE DE NOUS (31/08/2026)

**C'est Michel qui l'a nommée**, après m'avoir entendu dire une fois de trop que des lignes
« avaient failli s'écraser » : *« c'est pas la première fois que tu me dis ça, pourtant on avait
fait le nécessaire, va falloir voir ça »*.

**⭐ Ce qui était vrai** : git n'écrase rien tout seul. Un push non-fast-forward **échoue** — c'est
le vrai verrou, et il a tenu à chaque fois. *Ce qui « a failli » n'a jamais rien risqué : git a
refusé, c'est-à-dire qu'il a fait son travail.* La formulation était mauvaise, pas le mécanisme.

**⛔⛔ Ce qui ne l'était pas** : le danger n'a jamais été git, c'est **la résolution manuelle du
conflit qui suit**. Et elle est manuelle **à chaque fois**, parce que les deux sessions insèrent
leur ligne exactement au même endroit — la 1ʳᵉ ligne du même tableau. *Le protocole garantit qu'on
se voit ; il ne garantissait pas qu'on se recopie bien.* Ça a déjà coûté deux blocs de test à
session-A le 30/08 (ft-v1065), d'où le contrôle 10 sur le runner. **Le journal, lui, n'était gardé
par personne.**

**⭐⭐ Et le trou a été MESURÉ avant d'être bouché** : en supprimant la ligne 🟡 de session-A,
`python3 tools/check_regles.py` sortait **vert sur toute la ligne**. Le contrôle 5 (« aucun document
écrasé ») ne pouvait pas la voir — il exige une perte d'au moins **25 % du fichier ET 15 lignes**,
or une ligne de ce tableau est **une** ligne.

👉 **Ce qui la referme** : le **contrôle 11** de `check_regles.py` compte les lignes du tableau
**par session** et refuse toute baisse. Une 🟡 qui devient 🟢 est une modification sur place, donc
le compte ne bouge pas ; seule la **perte** se voit. ⚠️ Franchissable exprès (**R30**) — élaguer de
vieilles lignes est légitime, mais ça s'écrit : `LIGNES-PARTAGE-RETIREES:` dans le message de commit.

### ⚠️ APRÈS UN CONTENEUR RECRÉÉ : `git fetch --all` PEUT MENTIR (constaté le 26/08/2026)

Le conteneur de session est **éphémère**. Quand il est recréé, le dépôt est recloné — et le clone
peut être **périmé de plusieurs jours**. Vécu ce jour-là : `origin/master` affichait **ft-v939 du
21/08**, cinq jours en arrière, et un commit poussé une heure plus tôt n'existait **même pas** dans
le clone (`fatal: Not a valid object name`).

⛔⛔ **Et `git fetch --all` n'avait rien corrigé.** Seul un fetch **explicite** a ramené la réalité :

```bash
git fetch origin master     # ← celui-ci atteint vraiment GitHub
```
```
+ 84cdf26...91c5d92 master -> origin/master  (forced update)
```

👉 **Le danger n'est pas la perte — rien n'était perdu.** C'est la CONCLUSION qu'on en tire : croire
son travail disparu, ou pire, *« réparer »* master en poussant par-dessus. **Devant un master qui a
reculé, on ne pousse rien : on refait un fetch explicite et on regarde les dates.**

### ⛔⛔ `git rebase` PEUT SUPPRIMER UN COMMIT SANS RIEN DIRE (constaté le 26/08/2026)

**Ce qui s'est passé.** J'avais un seul commit à moi sur ma branche (`docs/MACROS-A.md`, poussé).
`git fetch origin master` ramène la branche de l'autre session — avec un **`(forced update)`** :

```
+ 84cdf26...ce25bbf master -> origin/master  (forced update)
```

Puis `git rebase origin/master` répond **« Successfully rebased »**… et **mon commit n'existe
plus**. Aucun conflit, aucun avertissement, aucune ligne rouge. Le fichier avait simplement disparu
de l'arbre de travail, et je ne l'ai vu que **deux heures plus tard**, en essayant de l'éditer.

**⚠️ La cause.** `git rebase <branche-de-suivi>` utilise par défaut le **`--fork-point`**, qui
devine la base commune à partir du *reflog* de la branche amont. Quand cette branche a été
**réécrite** (force-push — ce que fait l'autre session en rebasant la sienne), cette devinette peut
désigner une base **trop récente**, et git en conclut que nos commits sont « déjà appliqués ».

**🛡️ Ce qui protège.**
1. **Compter avant et après.** `git rev-list --count origin/master..HEAD` avant le rebase, et
   après : le nombre ne doit pas baisser.
2. Ou désactiver la devinette : **`git rebase --no-fork-point origin/master`**.
3. **Rien n'est perdu tant qu'on n'a pas nettoyé** : le commit reste dans l'objet local. On le
   retrouve avec `git reflog` et on récupère le fichier avec
   `git show <sha>:<chemin> > <chemin>`. *C'est comme ça que celui-ci est revenu.*

👉 **La leçon de fond est la même que celle du fetch juste au-dessus** : dans un dépôt partagé par
deux sessions, **la commande a réussi ≠ le résultat est celui qu'on croit**. Ici git a dit
« Successfully ». *Un outil qui annonce un succès en ayant supprimé du travail est plus dangereux
qu'un outil qui échoue.*

### 🕐 Les heures

Écrire l'heure **UTC** ou préciser le fuseau. Deux sessions peuvent tourner dans des conteneurs
réglés différemment — et *« 21:15 » chez l'une n'est pas « 21:15 » chez l'autre*. C'est la famille de
bugs « fuseaux horaires » de `BUGS.md`, appliquée à nous-mêmes.

## 🧭 Comment se nommer

Pas de nom imposé — **la branche suffit** et elle est déjà unique :
`session-A (project-status)`, `session-B (claude-md-docs)`… L'important est qu'on puisse dire *qui*
sans se tromper, pas d'avoir un joli nom.

---

*Ce fichier est un outil de coordination, pas un compte rendu. Le « pourquoi » d'une version va dans
`CLAUDE.md` (règle d'or #12), le détail dans les docs spécialisés. Ici, une ligne.*
