# 🗂️ PROGRES-SEANCES-01 — Progrès → Séances / UX-HIST, lot structurel 01

<!-- RÉÉCRITURE VOLONTAIRE 2026-10-14 : les sections 4 à 7 étaient un brouillon écrit pendant le travail (emplacements « rempli à la fin de la passe de diagnostic ») ; elles sont remplacées par les résultats mesurés (passe de diagnostic, mutations, outil d'intégration). -->

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
| Historique **Année → Mois → Séance**, plus de plafond de 20 | ✅ années repliées sauf l'année en cours, un mois se déplie à la demande, rendu **par mois** ; ⭐ **mois en cours déplié** en entrée normale s'il existe (décision de Michel du 14/10, §8) | `renderSessions`, `_sessMoisEstOuvert` |
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
   ⭐ **TRANCHÉ par Michel le 14/10** (PROGRES-SEANCES-INTEGRATION-01, §8) : en entrée normale, le **mois
   courant s'ouvre seul s'il existe** ; sans séance ce mois-ci, aucun mois ne s'ouvre et aucun n'est inventé.
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
   ↪️ *Ajusté le 14/10 après la décision du mois courant (§8)* : ② devient « … rangé par **année** puis par
   **mois** — le mois en cours est déjà ouvert, tape un autre mois pour le voir. »
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

- **Témoins** : `tests/parcours/progres_seances.js` — blocs **B-PS01-S** (source, 7) et **B-PS01-E** (écran conduit, 41),
  banc `tools/banc_progres_seances.js`. **Sur le code de master a0eab5b3 : 27 rouges** (commit `32da8b9b`, témoins
  seuls, avant tout code ; 30 après l'ajout de PS-E13b, PS-E39, PS-E40). **Sur la branche : 48 / 0.**
- **Contrôle négatif** : `tools/mut_progres_seances.py`, sur arbre copié — M00 (code de master), 26 mutations qui doivent
  rougir (dont 9 déguisées), 1 négative et 1 équivalente qui ne doivent pas : **31 / 31 conformes**. ⚠️ **Au 1ᵉʳ passage, M24 passait au
  travers** (« Progrès = dernière − record ») : dans la fixture, la plus vieille séance de DC était aussi le record,
  donc les deux formules donnaient le même chiffre. Fixture corrigée, chiffres ré-épinglés sur master, M24 attrapée.
- **Milo** : prompt généré sur master **et** sur la branche avec le même outil (`tools/dump_prompt.js`, racine
  redirigée) → **identique** hors date, heure et empreintes. Aucun appel Milo réel.
- **Bancs voisins adaptés (R30)** : `session_integrity.js` (93/0), `debrief_demande.js` (58/0), `historique_cloud.js` (87/0)
  passaient par « Exercices » ou lisaient les enfants directs de `#sess-list` ; ils passent par « Séances » et déplient
  les mois de leur fixture — leur garantie (boutons de débrief d'UNE séance, ordre de l'historique) est inchangée.
  Également verts : debrief_provenance 24/0, accueil_mini 54/0, poids_chaine 78/0, mensurations 40/0, masse_grasse_source 52/0.
- **Passe de diagnostic du runner complet** (pas la D-031 : le LOT 0 Nutrition fait encore bouger `runner.js`) :
  **6 931 ✅ / 15 ❌**, les 15 dans 8 blocs qui supposaient l'ancienne organisation — §6.

## 5. Correctif DIFFÉRÉ du runner — un OUTIL, pas une modification

⛔ `tests/parcours/runner.js` et `tests/recette/registre.json` ne sont **pas** modifiés : le LOT 0 Nutrition
(`claude/nut-lot0-contrat`) les modifie en ce moment. Le correctif est livré dans **`tools/integrer_progres_seances.py`**,
à exécuter **une fois**, par la session qui intègre en dernier, **après** le LOT 0 :

```
python3 tools/integrer_progres_seances.py --verifier   # n'écrit rien : dit si chaque ancre est trouvée
python3 tools/integrer_progres_seances.py              # écrit runner.js + registre.json
```

Il travaille **par ancres de texte** (pas par numéros de ligne) : si le runner a bougé au point qu'une ancre n'existe
plus ou existe deux fois, il **s'arrête sans rien écrire**. Il ① réécrit les 8 blocs de §6, ② enregistre le banc
B-PS01 dans le runner, ③ ajoute le banc et le scénario PROGRES-SEANCES-01 au registre (JSON revérifié avant écriture).
Il refuse de s'exécuter deux fois.

**Éprouvé avant livraison**, sur une copie, avec un runner **réduit** aux 8 blocs (découpé par un vrai analyseur JS
dans le vrai runner) : sans correctif **57 ✅ / 15 ❌** (les mêmes 15 que la passe complète — la découpe est fidèle) ;
avec correctif **73 ✅ / 0 ❌** ; même runner corrigé sur le code de **master : 14 ❌** ; et **5 mutations** du code
(sous-onglet forcé, Badges retiré, cartes remises dans Exercices, tuile qui n'ouvre aucun mois, panneau Exercices
cassé) : **5 / 5 attrapées**.

## 6. Les 8 blocs du runner, réécrits sur le nouvel invariant (R30 — aucun assoupli)

| Bloc | Pourquoi il rougit | Réécriture (même garantie) |
|---|---|---|
| **XIII** durée visible (2 ❌) | lit la liste : mois repliés | déplie les mois des séances, puis lit |
| **CXLV** synthèse (1 ❌) | « revient sur Exercices » | masquée sur Exercices **et** Poids/Badges, revient intacte **sur Séances** |
| **CLXIV** volume 14 j (3 ❌) | l'écran est à 28 j par défaut | le témoin **choisit 14 jours** (comme la personne) ; 28 par défaut est témoigné par PS-E17→E19 ; « Milo = écran réglé sur 14 j » |
| **CLXIX** modale en bas d'écran (1 ❌) | 30 séances repliées ne font plus défiler | déplie les mois, puis défile à fond |
| **CLXXII** cartes d'entraînement (1 ❌ + **① vert à vide**) | « que sur Exercices » | **que sur Séances** ; **①bis nouveau** : absentes sur Exercices, analyse en haut ; revient sur Séances |
| **CLXXIII** haut de Progrès (**④ vert à vide**) | mesurait la recherche cachée (y = 0) | cartes mesurées sur Séances ; progression et recherche **mesurées sur Exercices**, et **visibles** (h > 0) |
| **CCXXVI ter** cardio dans l'historique (6 ❌ + « 0 kg » vert à vide) | lit la liste : mois repliés | déplie les mois, puis lit |
| **CCXXXIX** tuiles de l'Accueil (1 ❌) | l'arrivée nue EST Séances : plus d'écart d'onglet ni de défilement | « ciblé » = **le mois en cours est déplié**, ce que l'arrivée nue ne fait pas — ↪️ *re-visé à l'intégration (§8)* : l'arrivée nue ouvre maintenant le mois courant, la comparaison se fait depuis un **état dérangé** (Séances, mois courant replié par la personne) |

## 7. Règle d'or #17 — compteurs (code applicatif seulement)

| Compteur | Valeur |
|---|---|
| Données persistées ajoutées | **0** |
| Clés de stockage ajoutées | **0** (PS-S6, PS-E36) |
| Fichiers applicatifs touchés | **8** (`index.html`, `setup.js`, `screens.js`, `log.js`, `constants.js`, `coach.js`, `app.js`, `style.css`) — **aucun fichier applicatif créé** |
| Lignes ajoutées − retirées | **+198 / −56 (net +142)** pour l'arbre intégré qualifié (`bd8ae92e` : ce lot + décision D + aides) ; le lot seul (`7ac0580e`) faisait +192 / −56 (net +136) ; après la micro-fermeture (diapo du Guide) : **+201 / −57 (net +144)** — dont une bonne part de commentaires et de textes d'aide |
| Anciens chemins supprimés / fusionnés | `slice(0,20)` retiré ; les 3 bascules d'onglet recopiées → **une table** (`PROG_ONGLETS`) ; le « forcé à Exercices » de `renderProgress` retiré ; la fenêtre du volume devient **un paramètre** du même propriétaire (aucune copie du calcul) ; les 2 `goSessionsHistory()` nus du calendrier visent la séance |
| Fonction multi-appelants modifiée | `_volumeParMuscle` (écran + Milo) : sans période → **14 jours, inchangé pour Milo** (PS-S5, PS-E22, M7, M8) ; `goSessionsHistory` (tuile + calendrier) : sans argument → mois en cours |

## 8. Intégration — PROGRES-SEANCES-INTEGRATION-01 (14/10/2026, session-B, feu vert de Michel)

Branche `claude/progres-seances-integration-01` depuis master `a0eab5b3` : **LOT 0 Séance → Nutrition**
(`f5c93e63`) fusionné d'abord, puis ce lot (`7ac0580e`). Conflits **en documentation seulement**
(`JOURNAL-DE-PARTAGE.md`, trois lignes de `CONTEXTE-ACTUEL.md` fusionnées sans perte) ; aucun dans le code,
le runner ou le registre. L'outil `tools/integrer_progres_seances.py` a été appliqué au runner final (toutes
ses ancres trouvées, idempotent).

**Décision D de Michel (14/10) — le mois courant.** En ouvrant Progrès normalement : onglet Séances, année
courante ouverte, **mois courant ouvert s'il existe dans l'historique** (pas un clic de plus pour voir ses
séances récentes). Sans séance ce mois-ci : aucun mois ouvert, aucun inventé. Les entrées ciblées restent
prioritaires (« Séances ce mois », calendrier, Accueil).
- **Code** : `_sessMoisEstOuvert(m)` dans `setup.js`, miroir exact de `_sessAnEstOuvert` — défaut = mois
  courant, un tap de la personne prime pour la session (en mémoire, aucune clé). La bascule lit l'état
  **effectif** : écrite `!état brut`, elle aurait lu « absent » comme « replié » et rouvert le mois au 1ᵉʳ tap.
- **Détail d'interaction non spécifié, signalé** : si la personne replie le mois courant puis revient sur
  Progrès dans la même session, il reste replié (son geste prime, comme pour les années). Au prochain
  lancement de l'app, il est de nouveau ouvert.
- **Témoins** : PS-E10 **réécrit** (R30 : « tous repliés » → « seul le mois courant déplié ») ; PS-E41 (mois
  courant absent) ; PS-E42 (un tap replie, un 2ᵉ redéplie) ; PS-E43 (4 onglets sur une ligne, 390 et 320 px).
  Sur l'ancien comportement : PS-E10 et PS-E42 **rouges** (49 / 2) ; après : **51 / 0**.
- **Runner** : CCXXXIX re-visé (R30) — la tuile est comparée à l'arrivée nue depuis le **même état dérangé**.
- **Mutations** : M5 et M17 ré-ancrées ; M31 → M35 ajoutées (défaut replié, bascule sur l'état brut, mois le
  plus récent ouvert à la place, mois courant inventé, équivalente `in`).
- **Qualification de l'arbre combiné** (fonctionnel `bd8ae92e` / arbre `80bc98a2`) : B-PS01 **52 / 0** ; mutations Progrès
  **37 / 37** ; LOT 0 **36 / 0** et **35 / 35** ; 8 blocs du runner réécrits **73 / 0** (6 mutations attrapées) ; 8 bancs voisins
  verts ; contexte Milo **identique** à master (81 018 caractères avec 32 séances, écran sur 14 ou 28 jours) ; **D-031 unique :
  7 035 ✅ / 0 ❌**, 4 conditions vertes (14/10, 14:07 → 15:27 UTC). Après la passe : documentation et handoff seulement.
  Statut : **READY_FOR_COUNTERCHECK** — `HANDOFF-PROGRES-SEANCES-INTEGRATION-01.json`.
- **Micro-fermeture du 14/10 (soir), réserves du contre-check B** : diapo du Guide « Tes progrès » refaite (capture à 4 onglets,
  Séances active, profil de démonstration ; légende et doigt à jour) ; témoins durcis — PS-S8 (diapo), PS-E41 positif, PS-E43
  (étiquette sur deux lignes), PS-E45 (année passée repliée), PS-E46 (porte ciblée > repli manuel), PS-E47 (relance : rien de
  gardé), PS-E48 (marque bleue effacée en entrée normale), PS-E27 / PS-E29 rejoués dans un contexte neuf ; outil de mutation durci
  (un plantage n'est jamais « attrapé », témoin attendu exigé, `MUT_J=1`, arbre sain rejoué à la fin) — M39 re-visée (l'ancienne
  ne fabriquait pas d'étiquette sur deux lignes) ; D-076 / D-077 au registre. Arbre fonctionnel `efa251b9` / `f3813e86` : B-PS01
  **57 / 0**, mutations **44 / 44**, LOT 0 **36 / 0**, voisins verts, **D-031 7 040 ✅ / 0 ❌** (4 conditions, 20:10:14 → 21:23:27 UTC).
  Statut : **READY_FOR_MASTER_INTEGRATION**.
- **Intégré à master le 14/10 (nuit), NON PUBLIÉ** : avance rapide `a0eab5b3` → `b9e91127`, tête `[skip ci]` (aucun déploiement), même arbre fonctionnel que l'arbre qualifié `f3813e86`. Prochaine étape : recette iPhone, puis décision de publication de Michel.
