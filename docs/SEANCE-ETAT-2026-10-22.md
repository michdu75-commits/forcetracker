# 🏋️ Chantier Séance — état réel et plan (22/10/2026, Claude Séance)

> **Premier livrable de Claude Séance (session-C).** Lecture seule : **aucun code applicatif modifié**,
> ni master, ni clone, ni publication. Mesuré sur `master` `f82a7c07` = **`ft-v1258`** (en ligne depuis le 21/10).
> Sources : `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/SUIVI-AUDIT.md` (fiches du 16 au 21/10),
> `docs/DECISIONS.md` (D-081 → D-093), `BUGS.md` §76 → §89, toutes les branches d'origin, le Drive
> (« Passation Nutrition V2 — 2026-10-22 », dossier « Séance » : recette iPhone du 19/10, idée « durées »).
> ⚠️ Un rapport daté n'est pas un pointeur permanent : relire git avant d'agir.

---

## 1. État réel du chantier Séance

**Tout ce qui a été codé pour Séance est EN PRODUCTION.** Aucune branche d'origin ne porte du code Séance
non intégré : `ux-seance-01`, `ux-seance-02`, `ux-d086`, `cc-01-dropset`, `clone-ux`, `d031-securite-01`
sont toutes **en retard** sur master (leur `log.js` a des centaines de lignes de moins). Les branches locales
de Claude Principal (`rir-superset-d088`, `seance-recette-precedent`, `ux-fig-face-dos-v2`) n'existent plus
que dans leur conteneur ; leur contenu (code + bancs `rir_superset`, `seance_recette`, `fig_face_dos`) est
dans `ft-v1257`.

| Statut | Quoi |
|---|---|
| ✅ **Publié** (`ft-v1257`, 21/10) | Écran Séance en deux états (D-083) · Cobalt / rouge destructif (D-085) · pastille N / É / X, « Précédent » lisible, dock de repos ±15 s, « Passer » Cobalt (D-086) · note de la dernière séance (D-087) · import d'historique dans ⋯ (D-089) · « Ta séance jusqu'ici » face · chiffres · dos, totaux échauffements compris (D-091 / D-092) · réserve **Échec · 0 · 1 · 2 · 3 · 4+**, anciens 0 lus « 0 ou échec », RIR par série dans le détail, « Précédent » sans série inventée, « 4 dernières séances » (D-093) · S-01 date juste (D-081) · CC-01 série validée = passé (D-082) · 35 aides corrigées |
| 🧪 **Clone `/clone/`** | Sert **D-093** (`b1840bc7`), **plus ancien que la prod** (sans le lot final ni les aides). Il sert maintenant aussi à Nutrition V2 : je n'y touche pas sans accord. |
| ⏳ **Non vérifié sur iPhone** | Recette de `ft-v1257` publiée (A4) : barre d'état après long arrière-plan (**à surveiller**), sélecteur de date depuis ⋯, clavier iOS, glisser au doigt, mode clair · persistance des notes (R2) · version servie (le domaine public est inaccessible d'ici : 403). |

## 2. Ce qui reste nécessaire (rien de codé)

| # | Sujet | Statut | Source |
|---|---|---|---|
| S1 | **Chrono de repos qui survit à la fermeture de l'app** | **Décidé comme chantier séparé**, désigné par Michel comme la suite (« ensuite chrono de repos persistant ») | `CONTEXTE-ACTUEL`, Drive 19/10 |
| S2 | RIR en superset : propositions (a) nommer l'exercice dans la question unique · (b) garder la question au rechargement · (c) rouvrir la 1ʳᵉ série à faire, pas le dernier exercice · (d) mesure de la barre du bas sur le clone | **décision de Michel attendue** | `SUIVI-AUDIT` (retour D-088) |
| S3 | Colonne `seance` vide dans l'export CSV (`s.name\|\|s.label` au lieu de `progLabel`) | bug préexistant, **décision attendue** (D-044 fige le format) | `BUGS.md` §89 |
| S4 | « Échec » posé depuis la barre de repos ne rallonge pas le repos · exercice présent deux fois = seul le 1ᵉʳ bloc lu · « Statistiques » = charge max échauffements compris · Milo reçoit « RIR0 » pour un ancien échec (banc R34 obligatoire avant tout changement) | réserves D-093, **hors lot, à tracer** | `SUIVI-AUDIT` |
| S5 | Porte « cardio noté d'abord » non équipée pour la date juste | **décision attendue** (D-081 ④, PROPOSÉ) | `DECISIONS.md` |
| S6 | Heure du débrief et de « continuer dans le Coach » · mémoire de repos des abdos (30 s fixes) | **à trancher** (D-086) | `DECISIONS.md` |
| S7 | Durées par semaine / mois dans Progrès | **idée non validée**, Progrès clos sans nouveau feu vert | Drive 19/10 |
| S8 | « Autre activité » | piste, non construite (D-085 L) | `IDEES-FUTURES.md` |
| S9 | Recette iPhone `ft-v1257` (§1) | à faire par Michel | `SUIVI-AUDIT` A4 / R2 |

## 3. Travaux déjà disponibles à récupérer

**Aucun code à récupérer** : tout est publié. Ce qui est réutilisable :
- les **bancs Séance** déjà sur master : `seance_recette` (B-SR), `rir_superset` (B-RSS, contrôle négatif 17/17), `ux_d086`, `notes_d087`, `d088_import_notes`, `fig_face_dos`, `cc01_dropset`, `seance_date`, `seance_ux`, `ux_integration`, `seance_unicite`, `seance_c1..c3`, avec leurs `tools/mut_*.py` ;
- le **diagnostic RIR superset** (cause mesurée, 10 parcours) : base de S2 si Michel tranche ;
- le **harnais D-031 Sécurité** (garde réseau, identités fictives) : tout nouveau banc s'y range.

## 4. Fichiers que je toucherai probablement

`log.js` (repos, séries, superset, « Précédent » — mon fichier de tête) · `index.html` (dock / fenêtres de séance) ·
`style.css` · aides : `screens.js` (« ? » Séance), `coach.js` (aide détaillée, `_DRAWER_CONTENT`), `app.js`
(légendes du Guide, et le **bloc de démarrage 9740-9775** : brouillon de séance + `stopRest()`), `constants.js`
(point rouge / `WHATS_NEW`) · tests : `tests/parcours/<nouveau>.js`, `runner.js`, `tests/recette/registre.json`,
`tools/banc_*`, `tools/mut_*` · docs de suivi. ⛔ **Pas** `state.js` (`persist`/`load`/restauration = Principal),
ni `Code.js` / `worker.js` / `supabase.js`, ni la partie Nutrition d'`app.js` / `screens.js`.

## 5. Risques de collision

| Avec | Où | Risque | Parade |
|---|---|---|---|
| **Nutrition V2** (`claude/nutrition-v2`, +5 commits, jalon 2) | aujourd'hui **un nouveau fichier** `nutrition-v2.js` + docs ; demain `app.js`/`screens.js`/`index.html` (écrans), `sw.js` (`PRECACHE`) | **faible maintenant**, réel au branchement des écrans V2 | je reste hors des fonctions Nutrition ; `sw.js` = **le second qui fusionne monte d'un numéro** ; `index.html` : ancrer mes modifs dans le bloc Séance |
| **Principal** (`nut-inventaire-lecture-seule` : `Code.js` ; sécurité, sauvegardes, restauration) | `state.js` (`load`/`persist`, `_fusionnerSeancesRestauration`), `setup.js` (`_cloudSync`), `app.js` (démarrage) | **moyen** : une séance est une donnée sauvegardée/restaurée | je ne modifie aucun chemin de sauvegarde ; tout nouveau champ de séance lui est **signalé avant** (il doit survivre à la restauration) |
| **Les deux** | `docs/DECISIONS.md` (Nutrition a déjà D-096 → D-098 **sur sa branche**), `JOURNAL-DE-PARTAGE.md`, `JOURNAL-DE-TEST.md`, `BUGS.md` (§90 = Nutrition) | **certain** : numérotation | ne pas créer de D-/§ sans relire **toutes** les branches ; prochains numéros libres à vérifier au moment d'écrire (aujourd'hui ≥ D-099, ≥ §91) |
| **Clone** | `clone/` | partagé avec Nutrition V2 | jamais régénéré sans accord de Michel |

## 6. Premier lot recommandé — **SEANCE-REPOS-01 : le repos en cours survit à la fermeture de l'app**

**Pourquoi celui-là** : c'est la suite désignée par Michel (S1), aucun autre ne l'attend, il est confiné à
Séance, et il protège un usage de salle (iOS tue souvent une PWA en arrière-plan : aujourd'hui le repos repart
de zéro, ou disparaît).

**Mesuré** : le repos vit **en mémoire seulement** (`restStartTs`, `restTot`, log.js:5459) ; `S.wkt` (`ft4_wkt`)
est local et **n'est envoyé à aucun serveur** (0 occurrence dans `Code.js`, `worker.js`, `supabase.js`).
⚠️ **R30 — une garantie écrite dit le contraire** : `app.js:9772` « *le timer de repos ne survit jamais à un
redémarrage ni à un retour au premier plan* » (`stopRest()` au démarrage). **Je dois retrouver pourquoi avant
de la lever** (probablement : éviter un décompte fantôme au lancement). Si la raison tient encore → stop et
retour à Michel.

**Périmètre exact :**
- **Inclus** : ① un seul champ ajouté dans la séance en cours (`S.wkt.repos = {debut, total}`), posé par
  `startRest` / réglages ±15 s, effacé par `stopRest` / « Passer » / fin / abandon de séance ;
  ② au démarrage, si une séance est ouverte et le repos encore récent, le dock réapparaît avec le **vrai** temps
  restant — ou en négatif s'il est dépassé (comportement ft-v851 existant) ; ③ pas de son ni de plein écran
  rejoué pour un repos déjà fini ; ④ un repos trop ancien est oublié (seuil à valider par Michel) ;
  ⑤ aides (« ? » Séance, aide détaillée) mises à jour ; pop-up : **non** (rien à faire de nouveau).
- **Exclus** : notification ou son quand l'app est fermée (impossible pour une PWA iOS sans push) ;
  l'enchaînement automatique du superset après un repos rechargé (c'est une fonction en mémoire : non
  restaurée, on reste sur la carte ouverte — c'est S2 (c)) ; S2 à S8 ; Milo ; Nutrition ; sauvegarde cloud.
- **Données** : 1 donnée persistée (règle #17 déclenchée → 4 compteurs au rapport), 0 clé de stockage,
  0 migration ; une ancienne séance sans `repos` se comporte exactement comme aujourd'hui.
- **3 questions à Michel avant de coder** : seuil d'oubli (ex. 30 min après la fin prévue) · repos dépassé au
  retour : affiché en négatif ou fermé · le brouillon de secours (`ft4_wkt_draft`) doit-il aussi le porter
  (je propose non : il sert à ne pas perdre la séance, pas le repos).
- **Tests** : banc neuf sous garde réseau, données fictives (repos en cours → rechargement → temps juste ;
  dépassé ; ancien ; fin / abandon effacent ; hors ligne ; séance sans le champ), **témoins vus rouges sur
  `ft-v1258`** ; contrôle négatif par mutations ; bancs voisins (`rir_superset`, `ux_d086`, `seance_recette`,
  `cc01_dropset`, `seance_ux`) ; le bouton « + » mesuré (règle #9) ; passe complète D-031 à la fin.
- **Retour arrière** : `log.js` / `app.js` de `ft-v1258` + clé de cache suivante. Le champ `repos` laissé dans
  un `ft4_wkt` est ignoré par l'ancien code (vérifié dans le banc).

*Alternative plus petite si Michel préfère d'abord trancher S2 / S3 : un micro-lot « S3 + S2 (a)(c) » (~1 h de
travail), mais il attend ses décisions.*

## 7. Modularisation future — proposition, **rien exécuté**

**Mesures** (22/10) : `log.js` = 11 463 lignes, **472 fonctions**, ~19 grandes zones ; il utilise **114 globales**
d'autres fichiers (`S` 842 fois, `toast`, `persist`, `EXLIB`…) ; **151** de ses fonctions sont appelées depuis
d'autres fichiers ; **~147** sont appelées depuis du HTML (`onclick=`) et doivent rester globales. Aucun
`defer` / `async` / module : 11 `<script>` chargés dans l'ordre, une seule portée globale.

**Exclusivement Séance (dans `log.js`)** : séance en cours / chrono / en-tête (1-607) · supersets, dropsets,
glisser (608-1012) · rendu d'un bloc (1013-1236) · « Précédent », 4 dernières séances, notes (1237-1920) ·
saisie des séries N / É / X (1921-2190) · actions sur exercices (3631-3997) · fin de séance (4916-5458) ·
**repos / dock / RIR (5459-6091)** · sélecteur d'exercices (6092-6998) · import programme (6999-7983) ·
import historique (7984-8576) · programmes (8577-10659) · médias, calculateur (10660-11463).

**Séance mélangé ailleurs** : historique et **édition des séances passées** dans `setup.js` (1205-1738,
`renderSessions`, `exportHistoCsv`) · **cardio dans la séance** et **calories** dans `app.js` (53-200, 469-719)
· fin de séance dans `tracking.js` (`renderLogFinish`) · calendrier dans `screens.js` · séance proposée par
Milo dans `coach.js`.

**Vraiment communs, à garder centralisés** : `S` / `load` / `persist` / restauration (`state.js`, Principal) ·
`toast`, `showConfirm`, `_escNote`, `_argAttr`, `goScreen` · **`_mscScores` / `_volumeParMuscle`** (la figurine,
lue par 4 fichiers — R31) · `_matchExercise` / `_EX_EQUIV` / `_movPattern` (catalogue, lu par Milo) ·
`_workVol`, `_rirDeSet`, `_serieFaitFoiPourPR` (règles de comptage : **une seule copie**, R2).

**Extractions possibles sans toucher aux données** : déplacer un bloc **tel quel** dans un nouveau fichier
classique (pas de module ES), chargé juste après `log.js`, fonctions toujours globales. Aucun changement de
`S`, de clés ni de calcul.

**Risques** : ① ordre de chargement (un bloc qui exécute du code au chargement, pas seulement à l'appel) ·
② **hors ligne** : tout nouveau `.js` doit entrer dans `PRECACHE` de `sw.js` dans le même commit (panne
silencieuse déjà vécue avec `supabase.js`) · ③ **tests** : `runner.js` lit `log.js` en texte ~30 fois et ~16
bancs exigent « déclarée une fois, dans log.js » ; 88 outils citent `log.js` (`check_regles.py`, `mut_*`) —
c'est le **vrai coût** du découpage · ④ collisions avec les autres Claude pendant le déplacement.

**Meilleur premier découpage (limité, réversible)** : extraire **le repos** (log.js 5459-6091, 31 fonctions)
vers `seance-repos.js`, **après** SEANCE-REPOS-01 : zone cohérente, que je viens de couvrir de témoins, qui
ne lit `S` qu'à travers la séance en cours, sans calcul partagé. Étapes : déplacement à l'octet près (diff
vérifiable : lignes retirées = lignes ajoutées), `PRECACHE` + cache, bancs statiques réorientés vers « déclarée
une fois dans le dépôt », passe complète. Retour arrière = un revert. *Le précédent existe déjà :
Nutrition V2 naît dans son propre fichier (`nutrition-v2.js`).* Le chantier reste **à décider par Michel**.

## 8. Estimation (méthode D-088, repères mesurés de `PROCESSUS-DEVELOPPEMENT.md`)

| SEANCE-REPOS-01 | Estimation centrale |
|---|---|
| **Développement** (retrouver la raison de la garantie, code ~45 min, banc et témoins, aides, docs) | **≈ 2 h 15** |
| **Exécution des tests** (banc 2 min · mutations ~15 min · voisins ~20 min · passe D-031 ~85 min) | **≈ 2 h** (dont la passe, mécanique) |
| **Risques, à part** | +30 min si la garantie de `app.js` cache un vrai cas (alors stop et retour à Michel) · +20 min si un témoin existant est à re-viser · +85 min si une 2ᵉ passe est nécessaire |
| Micro-lot alternatif S3 + S2 (a)(c) | ≈ 1 h de travail + ≈ 40 min de tests (sans passe) |
| Premier découpage (repos → `seance-repos.js`) | ≈ 2 h de travail (surtout les tests statiques) + ≈ 1 h 45 de tests |
