# 🗂️ PROGRES-SEANCES-01 — Progrès → Séances / UX-HIST, lot structurel 01

> Chantier ouvert le 14/10/2026 (session-B), mission de Michel « PROGRÈS → SÉANCES / UX-HIST — LOT
> STRUCTUREL 01 ». Branche de session `claude/claude-md-docs-ytabnv`, base master `a0eab5b3` (`ft-v1254`).
> **Non publié, aucune version, aucun déploiement, aucun merge.** Ce fichier dit ce qui a été fait, ce qui
> ne l'a pas été et pourquoi, et le correctif du runner laissé en attente (cohabitation avec le LOT 0
> Nutrition).

## 1. Ce que le lot applique (décisions de Michel du 14/10 + contrat UX-HIST du 08/10)

| Décision | Appliqué | Où |
|---|---|---|
| Progrès = **Séances \| Exercices \| Corps & santé**, Séances en premier | ✅ onglet `ptab-seances` en tête ; Progrès s'ouvre sur Séances | `index.html`, `switchProgTab` (setup.js) |
| Séances porte « Ce que ton histoire montre », « Ce que tu travailles, par semaine », l'historique, l'export, le filtre, la liste, le débrief | ✅ blocs déplacés **avec leurs id** : `_renderSynthese`, `_renderVolumeSemaine`, `renderSessions` restent les seuls auteurs (R2) | `index.html` |
| Exercices garde raccourcis, recherche, graphique, objectif, « Voir cette séance » | ✅ inchangés (chiffres du graphique épinglés par PS-E07) | — |
| Corps & santé inchangé | ✅ | — |
| **Badges** : destination non décidée, ne pas le rendre inaccessible | ✅ **reste un 4ᵉ onglet**, aucune relocalisation | `PROG_ONGLETS` |
| Historique **Année → Mois → Séance**, plus de plafond de 20 | ✅ années repliées sauf l'année en cours, un mois se déplie à la demande, rendu **par mois** | `renderSessions` |
| Accueil « Séances ce mois », calendrier, « Revoir la séance » → Séances, au bon mois / sur la séance | ✅ par la clé **existante** `ts‖id` (celle de la carte et de `openSessDetail`) — aucune nouvelle identité | `goSessionsHistory`, `_calDayPanel`, vue semaine |
| Volume **14 jours \| 28 jours**, 28 par défaut, moyenne = total / 2 ou / 4 | ✅ choix à l'écran (en mémoire) | `_volumeParMuscle(refTs, jours)`, `_renderVolumeSemaine` |
| **Milo garde son comportement** (pas de changement silencieux) | ✅ `_ctxVolumeMuscles` appelle toujours `_volumeParMuscle()` → 14 jours ; prompt **identique** master ↔ branche (généré des deux côtés, hors date/heure) | coach.js inchangé côté prompt |
| Sous-onglet choisi qui survit (contrat UX-HIST) | ✅ en mémoire (`_progTab`), plus de « forcé à Exercices » | `renderProgress` |
| Aucune nouvelle clé persistée, aucune migration de `S.sessions` | ✅ témoins PS-S6, PS-E35, PS-E36 | — |
| Débrief : D-052, aucun appel automatique, lien `sessionId` gardé, anciens débriefs > 20 atteignables | ✅ même carte, même bouton (`_dbfCle`), 0 appel Milo (PS-E14 → E16) | — |
| Bandeau cycle menstruel : ne rien trancher | ✅ **statu quo** : reste dans Exercices, même affichage (PS-E38) | — |
| Aide « ? », aide détaillée, Guide, points rouges (règle d'or #11) | ✅ points 2 à 5 ; les 4 textes « Poids » périmés corrigés en « Corps & santé » | `screens.js`, `coach.js`, `app.js`, `constants.js` |

## 2. Ce que le lot NE FAIT PAS — détails produit non décidés (aucun n'a été inventé)

1. **Séparation lecture / modification du détail d'une séance.** Le contrat UX-HIST dit « la séance
   s'ouvre en lecture, avec un bouton explicite « Modifier » », mais ne dit pas ce que montre la lecture
   ni ce qui reste modifiable sans passer par « Modifier » (durée ? suppression ? renommage d'exercice ?).
   Aujourd'hui `openSessDetail` est un **éditeur**. ⛔ Non fait : à décider.
2. **Mois en cours replié ou ouvert quand on ouvre Progrès par la barre du bas.** Appliqué **à la lettre**
   du contrat : replié (« un mois se déplie à la demande »). Il s'ouvre seul quand on arrive par « Séances
   ce mois » ou par le calendrier. ⚠️ À confirmer par Michel : c'est un tap de plus qu'avant pour voir sa
   dernière séance depuis la barre du bas.
3. **« Revoir la séance » n'ouvre pas le détail** : il amène sur la **carte** de la séance (entourée de
   bleu), dans son mois. Ouvrir directement le détail ouvrirait aujourd'hui l'éditeur, ce que le contrat
   veut justement éviter (point 1).
4. **Badges** : reste un onglet de Progrès (destination non décidée).
5. **Bandeau de cycle** : reste dans Exercices (non tranché).
6. **Milo 14 jours, écran 28 jours par défaut** : les deux chiffres peuvent différer. C'est la conséquence
   directe de la décision (« Milo conserve son comportement actuel ») ; l'aide « ? » et l'aide détaillée
   le disent. À trancher si Michel veut aligner Milo (ce serait un changement de contexte → banc R34).
7. **Pop-up WHATS_NEW** : méritée (un repère a bougé : l'historique n'est plus dans « Exercices »), mais
   elle exige un numéro de version, interdit pendant le travail (protocole du 13/09). **Texte proposé**,
   à poser à la publication :
   > 🗂️ **Progrès : Séances d'abord** — ① L'onglet **Séances** passe en premier : ton historique, ce que
   > ton histoire montre et ce que tu travailles. ② L'historique n'est plus limité à 20 séances : il est
   > rangé par **année** puis par **mois** — tape un mois pour l'ouvrir. ③ **Exercices** garde la
   > progression d'un exercice.
8. **Passation 08/10 (« ne pas coder UX-HIST avant DATA-CONTRAT-SÉANCES »)** : ce lot ne touche **ni**
   l'identité des séances, **ni** le stockage, **ni** la suppression, **ni** la rétention — il ne fait que
   ranger l'affichage et diriger les portes d'entrée, avec la clé déjà utilisée par la carte. La
   projection `cle = id ‖ runId ‖ ts` du contrat n'est **pas** introduite : c'est le travail de
   DATA-CONTRAT-SÉANCES.

## 3. Hors périmètre, non touché (interdits de la mission)

RIR / Échec (HP-01), records sur série X (HP-02), statistiques par exercice (HP-03, HP-04, HP-10, HP-11),
identité machine, fusion SDT roumain, estimation 1RM, Milo, Gardien, Nutrition, stockage, `S.sessions`,
publication, version. Le graphique d'un exercice garde ses chiffres d'avant (épinglés : PS-E07, mutation M24).

## 4. Tests

- **Témoins** : `tests/parcours/progres_seances.js` — blocs **B-PS01-S** (source) et **B-PS01-E** (écran conduit),
  banc `tools/banc_progres_seances.js`. **Sur le code de master a0eab5b3 : 27 rouges / 18 verts** (commit
  `32da8b9b`, témoins seuls). Sur la branche : **0 rouge**.
- **Contrôle négatif** : `tools/mut_progres_seances.py` (27 mutations, dont M00 = code d'avant, 6 déguisées,
  1 négative, 1 équivalente), sur arbre copié.
- **Bancs voisins adaptés (R30)** : `session_integrity.js`, `debrief_demande.js`, `historique_cloud.js` passaient
  par « Exercices » ou lisaient les enfants directs de `#sess-list` ; ils passent par « Séances » et déplient
  les mois de leur fixture — leur garantie (boutons de débrief d'UNE séance, ordre de l'historique) est inchangée.

## 5. Correctif DIFFÉRÉ du runner (`tests/parcours/runner.js`, `tests/recette/registre.json`)

⛔ **Non appliqué, exprès** : ces deux fichiers sont en cours de modification par le LOT 0 Nutrition
(`claude/nut-lot0-contrat`). Le lot ne les touche pas (cohabitation). À appliquer **à l'intégration**, après
le LOT 0, par la session qui intègre en dernier :

1. **Enregistrer le banc** dans `runner.js` (même motif que les autres modules) :
   `require('./progres_seances.js').source(t, ROOT, fs, path);` dans la partie source, et
   `await require('./progres_seances.js').ecran(t, b, PORT);` dans la partie écran ; et une entrée
   `B-PS01-S` / `B-PS01-E` dans `tests/recette/registre.json`.
2. **Réécrire sur le NOUVEL invariant (R30), jamais assouplir** — la liste exacte est en §6 (mesurée par une
   passe de diagnostic du runner sur la branche, *pas* la D-031).

## 6. Témoins du runner qui dépendent de l'ancienne organisation (passe de diagnostic)

*(rempli à la fin de la passe de diagnostic — voir ci-dessous)*

## 7. Règle d'or #17 — compteurs (code applicatif seulement)

| Compteur | Valeur |
|---|---|
| Données persistées ajoutées | **0** |
| Clés de stockage ajoutées | **0** |
| Fichiers applicatifs touchés | **8** (`index.html`, `setup.js`, `screens.js`, `log.js`, `constants.js`, `coach.js`, `app.js`, `style.css`) — aucun fichier applicatif créé |
| Lignes ajoutées − retirées | voir le rapport final (commentaires compris) |
| Anciens chemins supprimés / fusionnés | `slice(0,20)` retiré ; les 3 bascules d'onglet recopiées → **une table** (`PROG_ONGLETS`) ; le « forcé à Exercices » de `renderProgress` retiré ; la fenêtre du volume, constante en dur à 2 endroits, devient **un paramètre** du même propriétaire (aucune copie du calcul) ; les 2 `goSessionsHistory()` nus du calendrier visent la séance |
