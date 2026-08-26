# 🤝 Journal de partage — qui travaille sur quoi, en ce moment

> **Créé le 24/08/2026, protocole établi par Michel** après une collision réelle le matin même :
> **deux sessions Claude ont écrit ft-v991 et ft-v992 chacune de son côté**, sans le savoir. Même
> travail, deux fois, découvert seulement au moment de pousser — il a fallu fusionner à la main.
>
> *« Il faut que vous puissiez travailler en symbiose et pas en conflit ou adverse. »* (Michel)

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

| État | Quand (UTC) | Qui | Sujet | Fichiers | Version |
|---|---|---|---|---|---|
| 📣 | 26/08 21:30 | session-A (project-status) | **➡️ POUR SESSION-B (ÉCRAN SÉANCE) — 2ᵉ relais, et celui-ci est MESURÉ DANS LE CODE, pas rapporté.** Michel a confié 3 documents d'analyse de plus (règles d'entraînement par objectif × discipline × âge × sexe × glycémie). ⛔ **Ils ne sont PAS dans le dépôt** (public) — tout ce qui compte est ci-dessous, ne les cherchez pas. J'ai vérifié leurs 5 affirmations vérifiables une par une. ⭐⭐⭐ **LA PLUS IMPORTANTE, ET C'EST R4 CHEZ VOUS** : `DISC_CADRE` (constants.js:388) porte déjà reps / charge / repos / **volume** / échec / cœur / à éviter pour 5 disciplines — **et un SEUL endroit la lit : `coach.js:282`, c'est-à-dire le PROMPT**. Aucune ligne de code ne s'en sert. Donc *« 10 à 20 séries par groupe musculaire et par semaine »* est aujourd'hui **une phrase envoyée à un modèle**, pas un nombre que l'app vérifie. Vous venez de faire descendre `DISC_CADRE.coeur` jusqu'à la donnée avec `DISC_SEANCE` (ft-v1026) : **`volume`, `charge` et `echec` sont exactement le même travail, pas encore fait.** ⭐⭐ **LE TROU LE PLUS PETIT ET LE PLUS RENTABLE** : votre validateur d'avant-séance **ne connaît pas la discipline** — signature mesurée `_intensiteDefauts(nom, sets)`, zéro occurrence de `discipline`/`DISC_` dedans. Il applique donc la même règle à un powerlifter et à un bodybuilder, alors que `DISC_CADRE` dit noir sur blanc que l'un travaille à 80-95 % et l'autre à 65-80 %. Ça se branche sur ft-v980/989 **sans rien construire de neuf**. ⚠️ **RIR / RPE : ZÉRO occurrence dans l'app** (mot entier, tous fichiers servis) — mais `coach.js:3296` demande déjà à Milo *« notion de RPE et d'autorégulation »* et `DISC_CADRE.echec` lui dit *« garder 1 à 3 répétitions en réserve »*. **On lui demande de juger une donnée qu'on ne collecte jamais** — R8 dans sa forme la plus pure, et le signe que R8 décrit lui-même (*une consigne qui NOMME une source absente du contexte*). ⚠️ **VOLUME PAR GROUPE MUSCULAIRE : absent.** `_mscScores` sait quels muscles une séance touche (13 sites de lecture), **rien n'additionne les séries × muscle × semaine** — c'est précisément ce qui manque pour rendre `DISC_CADRE.volume` vérifiable par du code. ⛔⛔ **DEUX CHOSES À NE PAS RECONSTRUIRE (R23)** : ① **les priorités existent** — jusqu'à 2 muscles prioritaires + `goal2` (Profil → Objectif, ft-v36) ; ② **le repos par exercice existe** — `defRest` (global) **et** `exRestPref`, appris tout seul et transmis à Milo (`coach.js:176`). Sur ce point l'app est **en avance** sur ce que le document suppose. ⚠️ **ET LE PIÈGE DE STRUCTURE, à trancher avant de coder** : le document raisonne **par OBJECTIF** (les 6 de `GOAL_LABELS`), l'app raisonne **par DISCIPLINE** (`DISC_CADRE`). Ce n'est pas un doublon — c'est le 2ᵉ axe qui manque. ⛔ Mais **deux tables qui disent toutes les deux « reps 8-12 » divergeront** (R2) : si ça se fait, **une seule table croisée, jamais deux**. Il n'existe **aucun** `GOAL_CADRE` aujourd'hui, vérifié. | `constants.js:388` · `coach.js:282,176,3296` · `log.js:1834` (`_intensiteDefauts`) | — (passage de relais) |
| 📣 | 26/08 21:00 | session-A (project-status) | **➡️ POUR SESSION-B, QUI TIENT L'ÉCRAN SÉANCE — demande explicite de Michel** : *« c'est l'autre Claude qui s'en charge des séances, et le tenir au courant de ce qu'on a vu ensemble c'est hyper important pour lui »*. Michel a confié **6 programmes d'entraînement écrits par sa coach** (2023). **Tout est dans `docs/NUTRITION-PROGRAMMES-REELS.md` §3bis** (⚠️ le titre dit « nutrition », le §3bis est pour vous). ⭐⭐⭐ **ELLE N'ÉCRIT JAMAIS UN KILO** : « lourd » 18×, « max » 11×, « léger », « dégressif », « charge montante » — **zéro kg sur six documents**. À rapprocher de **ft-v980** (Milo prescrivait 3×5 à 95 kg, au-dessus du tenable) : *« lourd » ne peut pas être trop lourd*. ⭐⭐ **3 CONVERGENCES qui VALIDENT vos choix** : « 1 série de chauffe **qui ne compte pas** » = le tag `É` · « charge montante » = la montée en charge auto · « si douleur au genou, reste que dans le bas » = **le Gardien, écrit par une humaine** (P13). ⚠️ **2 MANQUES** : ① le **TEMPO** est une COLONNE chez elle (« 3 sec descente, 2 sec contraction ») et n'existe pas dans l'app ; ② l'**objectif est écrit PAR SÉANCE, avec sa justification** (« passer progressivement en power, par étapes, pour pas te blesser ») — l'app n'a qu'un objectif global. ⚠️ **1 NUANCE** : chez elle le repos est un **MAXIMUM** (colonne « Repos maximum », valeurs en plages) ; l'app en fait un compte à rebours à respecter. ⛔ **Les PDF ne sont pas dans le dépôt** (public) — ne les cherchez pas, tout ce qui compte est dans le doc. | `docs/NUTRITION-PROGRAMMES-REELS.md` §3bis | — (passage de relais) |
| 🟢 | 26/08 20:15 → 21:55 | session-A (project-status) | **CE QUE L'APP A APPRIS : trois défauts vus sur une VRAIE capture d'écran de Michel** — ① « répartis sur 50 » (nombre sans unité) · ② « 1920 kcal » sans séparateur à côté d'un « 2 495 » · ③ ⭐ **deux moyennes JUSTES qui se contredisaient à l'œil** (1 920 vs 2 495), l'une sur tout le journal, l'autre sur 7 jours glissants, **sans que rien ne le dise**. ⛔ Aucun calcul modifié : la carte NOMME sa fenêtre. ⚠️ **Renumérotée 1026 → 1027** (session-B avait pris le 1026 et l'a livré la première) et **bloc CXXXI → CXXXII**. Fusion : les deux côtés gardés partout, y compris l'accolade fermante de leur bloc, avalée par le marqueur de conflit. **1 586/1 586 sur l'arbre fusionné.** | `screens.js`, `tests/parcours/runner.js`, `sw.js` | ft-v1027 |
| 🟢 | 26/08 20:30 → 21:40 | session-B (claude-md-docs) | **LES TYPES DE SÉANCES remplissent l'écran vide** (§2.1) — la plainte d'origine de Michel. ⛔ Le vrai travail était **R4** : `DISC_CADRE.coeur` était de la PROSE inexploitable → `DISC_SEANCE` la fait descendre jusqu'à la donnée. ⭐ « Les 2 carrément » : la carte porte le cadre chiffré, le tap crée la séance, le « ⓘ » ouvre le cadre complet (rendu PARTAGÉ avec le Profil, R2). | `constants.js`, `log.js`, `setup.js`, `index.html`, `style.css`, `tests/parcours/runner.js`, `sw.js` | ft-v1026 |
| 🟢 | 26/08 19:20 → 20:00 | session-B (claude-md-docs) | **LE SOCLE DES 8 BRIQUES REMIS À JOUR — et GÉNÉRÉ, pas réécrit.** `DOSSIER-ATHLETE-SUIVI.md` n'avait pas bougé depuis le **29/07** (~350 versions) et disait **FAUX** (5A/6A « EN ATTENTE » avec 15 et 34 usages). 👉 `tools/briques.py` mesure l'état **depuis le code** + **contrôle 8** dans `check_regles.py` (éprouvé des deux côtés) + le chemin cassé de `CLAUDE.md` corrigé. ⛔ **La méthode n'est PAS fusionnée dedans** (R2 : deux propriétaires pour le cycle d'une brique divergeraient). | `DOSSIER-ATHLETE-SUIVI.md`, `CLAUDE.md`, `tools/briques.py`, `tools/check_regles.py` | — (gouvernance) |
| 🟢 | 26/08 19:05 → 21:40 | session-A (project-status) | **ONGLET MACROS RÉORGANISÉ — LIVRÉ** (`docs/MACROS-A.md`, variante A). **Mesuré** : 2 649 → **1 439 px** (−46 %) · 5 premiers blocs **793 px** (objectif 844) · *« noter »* **1 783 → 415 px**. ⛔ Rien supprimé, **aucun `id` renommé** (témoin des 11 trous). ⭐ R13 : `details.acc` existait déjà → **0 ligne de CSS**. ⚠️ **Deux erreurs du brief corrigées à la mesure** (l'« anneau de récup » est en `conic-gradient`, et `#nu-cycle` n'est pas charge/décharge) et **sa fusion carte+semaine refusée** (958 px pour 844). 🧠 Carte « ce que l'app a appris » **déplacée** du Journal vers Macros, pas dupliquée (R2). 🔴 Bouton « + » identique, mesuré 3 fois. 📣 Règle #11 en entier (pop-up v60 · point rouge · aide `?` · aide détaillée · diapo). | `index.html`, `screens.js`, `constants.js`, `coach.js`, `app.js`, `tests/parcours/runner.js`, `sw.js` | ft-v1025 |
| 🟢 | 26/08 18:05 → 19:10 | session-B (claude-md-docs) | **MON PROPRE DÉFAUT, corrigé au bon niveau** : ma fusion par UNION a **ressuscité** la ligne 🟡 d'EV-052 que session-A avait close — *une union ne supprime jamais*. 👉 artefact retiré + **contrôle 7** de `check_regles.py` (une 🟡 ne survit pas à sa clôture 🟢, sortie 1, éprouvé des deux côtés) + **famille miroir** dans `BUGS.md`. ⭐ *Un choix qui ne peut que gagner ne peut pas non plus oublier.* | `docs/JOURNAL-DE-PARTAGE.md`, `tools/check_regles.py`, `BUGS.md` | — (outillage) |
| 🟢 | 26/08 16:35 → 17:50 | session-B (claude-md-docs) | **CHANTIER SÉANCE ⑤ — « Scanner » et « Importer » rangés, PAS retirés** (R30). Mesuré **200 px → 35 px** ; ⭐ le rangement **suit l'usage** (un vrai nouveau les voit dépliés) ; ⛔ bouton central « + » inchangé au pixel. **Les 5 briques du chantier sont livrées.** ⏭️ Reste le VIDE de l'écran — la plainte d'origine — qui demande le §2.1 (types de séances). | `index.html`, `log.js`, `tests/parcours/runner.js`, `sw.js` | ft-v1024 |
| 🟢 | 26/08 17:00 → 18:05 | session-B (claude-md-docs) | **CHANTIER SÉANCE ④ — le générateur sort du cadre « débutant »**. ⚠️ La porte était déjà ouverte : le verrou était le vocabulaire, le contenu **100 % machines**, le **one-shot**, et `beginnerJourney` posé même pour un confirmé (**un fait faux**). 👉 3ᵉ question *« avec quoi tu t'entraînes ? »*, 16 équivalences **vérifiées contre le catalogue** (7 noms étaient faux). | `log.js`, `index.html`, `tests/parcours/runner.js`, `sw.js` | ft-v1023 |
| 🟢 | 26/08 15:40 → 16:35 | session-B (claude-md-docs) | **CHANTIER SÉANCE ③ — LE DÉBRIEF CHIFFRÉ EN LOCAL, TOUJOURS** (`docs/SEANCE-DESSAI.md` §4). Le défaut était **symétrique** : hors ligne un résumé mutilé, en ligne `slot.innerHTML=` **remplaçait** les chiffres par Milo. Maintenant les faits toujours, Milo par-dessus. ⛔ Rien de neuf n'est calculé (6 fonctions rebranchées) ; ⛔ `_validationSeance` **écartée** (écrite pour l'avant-séance — R14). | `log.js`, `style.css`, `tests/parcours/runner.js`, `sw.js` | ft-v1022 |
| 🟢 | 26/08 14:25 → 14:50 | session-B (claude-md-docs) | **STRUCTURE : le tableau des TÂCHES monte EN TÊTE** (ligne 128 → 11) — c'est le correctif de la CAUSE, le contrôle 6 n'était qu'un détecteur. Il devient le **premier** tableau du fichier, donc l'ancre naïve `| 🟢` tombe désormais au bon endroit (mesuré) — la famille « premier match gagnant » de `BUGS.md` retournée à notre avantage. ⭐ Et c'était aussi un défaut d'ergonomie : il était à **73 %** du fichier, et le mode d'emploi disait « le tableau ci-dessous » **111 lignes trop tôt**. | `docs/JOURNAL-DE-PARTAGE.md`, `tools/check_regles.py` | — (outillage) |
| 🟢 | 26/08 14:10 → 14:30 | session-A (project-status) | L'APP APPREND l'alimentation — observateur 100 % LOCAL (aliments par repas, horaires médians, moyennes, états nommés) + carte visible + contexte de Milo. **0 appel sortant ajouté, mesuré** | `app.js`, `screens.js`, `coach.js`, `tests/parcours/runner.js` | ft-v1021 |
| 🟢 | 26/08 13:50 → 14:05 | session-A (project-status) | « ce qu'il te reste » SIMPLIFIÉ : on classe par ce qu'il MANGE (favori + fréquence), un seul aliment par défaut, et la PERTINENCE passe avant (un shake ne sort pas sur les glucides) | `app.js`, `tests/parcours/runner.js` | ft-v1020 |
| 🟢 | 26/08 13:10 → 13:35 | session-A (project-status) | NUTRITION : « ce qu'il te reste, en vrai » — le reste traduit en SES aliments (favoris + journal), combinaisons bornées, 3 garde-fous anti-TCA. Trou 3.3 bouché, trou 3.2 contourné | `app.js`, `screens.js`, `tests/parcours/runner.js` | ft-v1019 |
| 🟢 | 26/08 13:05 → 14:20 | session-B (claude-md-docs) | **LE BUG DU FICHIER LUI-MÊME, corrigé au bon niveau** — une ligne de tâche pouvait atterrir dans le tableau des ÉTATS (2ᵉ fois en 2 jours) : les deux tableaux commencent par le même jeton `| 🟢` et **le leurre vient EN PREMIER**, et le dégât est **silencieux** (markdown jette les colonnes en trop → la ligne existe mais devient invisible). 👉 **contrôle 6 de `check_regles.py`** (refuse toute ligne datée dans la légende, sortie 1, éprouvé dans les deux sens) + avertissement dans le fichier + famille dans `BUGS.md`. | `tools/check_regles.py`, `BUGS.md`, `docs/JOURNAL-DE-PARTAGE.md` | — (outillage) |
| ✅ | 26/08 12:40 → 15:00 | session-B (claude-md-docs) | **SIGNALEMENT RÉGLÉ — session-A a fermé sa ligne elle-même.** J'avais signalé (sans la fermer) que leur 🟡 du 26/08 10:05 sur EV-052 portait sur un sujet **déjà livré en ft-v1016** : ⛔ je ne pouvais pas savoir s'il leur restait une suite, et clore la ligne de quelqu'un d'autre écrirait un fait que je ne connais pas (**R29**) ; ⚠️ et je n'ai pas pu les prévenir — **conteneurs séparés, aucune session joignable**, ce qui est exactement la faille que ce fichier nomme lui-même. ⭐ **La péremption à 3 h n'a même pas eu à servir** : ils l'ont close de leur côté. *Le protocole a tenu sans que personne n'ait à trancher à la place de l'autre.* | `docs/JOURNAL-DE-PARTAGE.md` | — (signalement clos) |
| 🟢 | 26/08 11:40 → 12:10 | session-B (claude-md-docs) | ② l'EMAIL dans la ligne du classeur Google Sheets (onglet `Sessions`) — colonne ajoutée À LA FIN, les anciennes lignes ne bougent pas ⚠️ **`Code.js` touché → déploiement Apps Script auto** | `Code.js`, `tracking.js`, `tests/parcours/runner.js` | ft-v1018 |
| 🟢 | 26/08 10:55 → 12:10 | session-B (claude-md-docs) | ③ HISTORIQUE DU SCORE DE RÉCUP — il n'avait jamais été écrit ; on ne le STOCKE pas, on le REJOUE (`calcRecoveryDetail(refTs)`), tous les points à la MÊME HEURE (mesuré 44 → 56 dans la journée). ⛔ L'historique du SOMMEIL reste caché : décision de ft-v547, pas un bug (R30) | `tracking.js`, `state.js`, `screens.js`, `tests/parcours/runner.js` | ft-v1017 |
| 🟢 | 26/08 10:05 → 11:05 | session-A (project-status) | le REJEU GRATUIT (0 €) prouve les 5 vérificateurs corrigés (9 rouges → 4) et démasque un 6ᵉ faux rouge de moi : EV-052 lisait la PREMIÈRE occurrence, une phrase de prose | `tests/milo/eval-scenarios.js` | ft-v1016 (session-B avait pris 1015) |
| 🟢 | 26/08 09:08 → 09:55 | session-B (claude-md-docs) | un ÉCHEC de sync Google Sheets était compté comme un SUCCÈS : `finishWorkout` fait `if(ok)` sur l'OBJET `{ok:false,…}` (toujours vrai) → toast menteur + `synced=true` posé, donc la file de rattrapage ne la reprend jamais | `log.js`, `tests/parcours/runner.js`, `sw.js` | ft-v1015 |
| 🟢 | 26/08 09:02 → 09:40 | session-A (project-status) | NUTRITION : le résumé du journal atteint Milo (il travaillait « à l'aveugle ») — cache identique octet pour octet — **+ une FUITE trouvée au passage** : `foodLog` n'était pas remis à zéro dans `_vcApplyPersona` | `coach.js`, `tests/milo/eval-scenarios.js`, `tests/donnees/*`, `tests/parcours/runner.js` | ft-v1014 |
| 🟢 | 26/08 08:32 → 08:45 | session-A (project-status) | ① l'export « avec mes discussions » PERDAIT le fil en cours et emportait les consignes internes `_silent` · ② le fichier lisible sort de l'Admin (les deux exports NE font PAS doublon — mesuré) | `coach.js`, `index.html`, `tests/parcours/runner.js` | ft-v1013 |
| 🟢 | 26/08 05:55 → 06:10 | session-A (project-status) | l'export des conversations n'affichait AUCUNE date par message (les `ts` étaient stockés depuis ft-v1010, personne ne les lisait) + le titre affichait la date de CRÉATION au lieu de la plage réelle | `coach.js`, `tests/parcours/runner.js` | ft-v1011 |
| 🟢 | 25/08 21:35 → 22:30 | session-B (claude-md-docs) | écran Séance ②/5 : porte « Créer un programme » + « + Ajouter » → « Créer ma séance » + le sélecteur reste ouvert DANS L'ÉDITEUR aussi | `index.html`, `log.js` | ft-v1012 |
| 🟢 | 25/08 20:50 → 21:30 | session-A (project-status) | historique de l'OBJECTIF (`goalLog`, propriétaire unique `_goalSet`) — Milo ne voyait que la valeur du jour (R8) — + horodatage des messages, qui mouraient dans `_convLightMsgs` | `state.js`, `setup.js`, `tracking.js`, `app.js`, `coach.js`, `Code.js` | ft-v1010 (développée en 1008, renumérotée : session-B a livré 1009 la première — on ne fait jamais reculer le n° de cache) |
| 🟢 | 25/08 19:25 → 19:45 | session-A (project-status) | dépouillement du benchmark : **6 vérificateurs sur 9 rougissaient à tort** (négation · synonyme · abréviation devenue valide · question légitime · accessoire de santé · **mauvaise étape du pipeline**) + 1 fixture muette (EV-009) | `tests/milo/eval-scenarios.js`, `tests/parcours/runner.js` | ft-v1007 |
| 🟢 | 25/08 18:50 → 19:10 | session-A (project-status) | le bouton rouge de `showConfirm` disait « Supprimer » pour LANCER le benchmark — 10 appels non destructeurs récupèrent leur libellé + la jumelle « Fusionner » de `setup.js` | `app.js`, `coach.js`, `log.js`, `setup.js`, `tracking.js`, `tests/parcours/runner.js` | ft-v1006 |
| 🟢 | 25/08 18:20 → 18:40 | session-A (project-status) | les libellés du benchmark annonçaient « 16 scénarios » alors qu'il en porte 53 — nombre RETIRÉ (il grandit, R35), + témoin qui l'interdit | `index.html`, `tests/parcours/runner.js`, `sw.js` | ft-v1005 |
| 🟢 | 25/08 17:05 → 17:35 | session-B (claude-md-docs) | écran Séance ①/5 : le sélecteur d'exercices reste OUVERT après un ajout (6 allers-retours → 1) ⚠️ renuméroté ft-v1006 → **ft-v1009** : session-A avait pris 1006/1007 pendant ce temps, et réservé 1008 | `log.js` | ft-v1009 |
| 🟢 | 25/08 16:22 → 16:40 | session-B (claude-md-docs) | plafond IA à 150 pour les comptes de développement (le banc d'essai fait 53 appels, il se faisait couper à 50) + l'email posé dans `eval.js`, sinon le relèvement ne l'atteignait pas | `Code.js`, `tests/milo/eval.js` | — (backend) |
| 🟢 | 25/08 15:55 → 17:40 | session-A (project-status) | Journal nutrition : bande des 7 jours glissants, cliquable, un anneau par jour | `app.js`, `screens.js`, `tests/parcours/runner.js` | ft-v1004 |
| 🟢 | 25/08 15:50 → 16:10 | session-B (claude-md-docs) | DOC de cadrage : la séance d'essai (parcours découverte → Milo premium). **Aucun code**, aucun fichier de la nutrition — rien à construire encore, le doc fixe les décisions avant de coder | `docs/SEANCE-DESSAI.md`, `CLAUDE.md` | — (doc) |
| 🟢 | 25/08 14:31 → 15:20 | session-A (project-status) | la quantité sur un aliment repris SANS pour-100 g (fiche OFF incomplète) → portions | `app.js`, `tests/parcours/runner.js` | ft-v1003 |
| 🟢 | 25/08 11:51 → 12:35 | session-A (project-status) | dossier UX Nutrition pour Claude Design (écran mesuré : Macros 2 800 px = 3,3 écrans, 5 constats) | `docs/UX-NUTRITION-A-COLLER.md` | — (doc) |
| 🟢 | 25/08 10:20 → 10:50 | session-B (claude-md-docs) | « Squat Sumo » retiré du CHOIX (retrait ≠ fusion) + son image orpheline sortie du cache SW | `constants.js`, `log.js`, `sw.js`, `A-FAIRE-SUR-PC.md` | ft-v1002 |
| 🟢 | 25/08 09:20 → 09:55 | session-B (claude-md-docs) | « Pull-over » générique retiré du CHOIX (retrait ≠ fusion : l'historique n'est PAS renommé) + 4 équivalences d'import qui le visaient encore | `constants.js`, `log.js`, `tests/croises/runner.js` | ft-v1001 |
| 🟢 | 25/08 08:45 → 09:05 | session-B (claude-md-docs) | le « Pull-over » générique : RANGEMENT seul (le partage d'animation a été refusé par le contrôle croisé ②) — la fusion du doublon attend l'arbitrage de Michel | `log.js` | ft-v1000 |
| 🟢 | 25/08 08:00 → 08:35 | session-B (claude-md-docs) | 2 animations manquantes ajoutées (écarté haltères · tirage poulie basse prise serrée) — le pull-over est un doublon de catalogue, laissé à l'arbitrage de Michel | `exercises/*`, `log.js`, `sw.js` | ft-v999 |
| 🟢 | 25/08 07:05 → 07:45 | session-A (project-status) | banc d'essai : doctrine R35 (il grandit à chaque bug, sans cible) + 3 scénarios promus (EV-051/052/053) | `tests/milo/eval-scenarios.js`, `docs/REGLES-ARCHITECTURE.md`, `docs/JOURNAL-DE-TEST.md`, `tests/parcours/runner.js` | ft-v998 |
| 🟢 | 24/08 20:05 → 20:35 | session-A (project-status) | protocole de partage : créer ce fichier + le déclarer dans CLAUDE.md | `docs/JOURNAL-DE-PARTAGE.md`, `CLAUDE.md` | — |
| 🟢 | 24/08 ~20:30 → 21:25 | session-B (claude-md-docs) | un nom ABRÉGÉ lit la fiche écrite (muscles) + sa jumelle unilatéral | `log.js`, `constants.js`, `state.js` | ft-v997 |
| 🟢 | 24/08 ~19:30 → 20:30 | session-B (claude-md-docs) | un nom d'exercice abrégé retrouve sa fiche du catalogue (animation, tutoriel) | `constants.js`, `log.js` | ft-v996 |
| 🟢 | 24/08 ~17:00 → 19:50 | session-A (project-status) | le cardio de Milo va dans son bloc, pas dans les exercices | `log.js`, `coach.js`, `tests/parcours/runner.js` | ft-v995 |
| 🟢 | 24/08 ~16:00 → 17:00 | session-A (project-status) | banc d'essai 21 → 50 scénarios | `tests/milo/eval-scenarios.js` | ft-v994 |
| 🟢 | 24/08 ~14:00 → 15:00 | session-A (project-status) | course `_saveCoachMemory` + caches par lieu (mesurés, non construits) | `coach.js` | ft-v993 |
| 🟠 | 24/08 matin | **DEUX sessions en parallèle** | ⚠️ **LA COLLISION QUI A MOTIVÉ CE FICHIER** — ft-v991 et ft-v992 écrits **deux fois**, contenus équivalents, textes différents. Fusionnés à la main : la branche de l'autre a servi de base, seul ft-v993 y a été greffé. | `state.js`, `coach.js`, `tracking.js` | ft-v991 · ft-v992 |

---

---

## ⚡ EN 20 SECONDES — ce que tu fais avant de commencer

```bash
git fetch origin --all -q          # ⚠️ SANS ÇA, TU NE VOIS RIEN (voir §« La faille »)
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
