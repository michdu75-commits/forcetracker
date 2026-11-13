# 📥 IMPORT-IA-FIDELITE-01 — le programme importé ressemble au document, et la séance le suit

> **Claude Séance (« Claude N°2 », session-C) · 02/11/2026 · GO de Michel** (« GO CORRECTION IMPORT IA + RECONNAISSANCE EXERCICES + CHRONOMÈTRE + UX »).
> **État (règle d'or #19, quatre états jamais confondus)** : ✅ *corrigé sur branche* (branche locale, **non poussée**, base `e2b942f3` = prod `ft-v1263`) · ⛔ *intégré* : non (`master` inchangé) · ⛔ *publié* : non (aucun merge, aucun déploiement Worker / Apps Script) · ⛔ *vérifié sur iPhone* : non.
> 🔒 **Ce dépôt est PUBLIC** : tous les programmes de test (`tests/parcours/corpus_import/`) sont **ENTIÈREMENT INVENTÉS** ; aucun document de coach, de testeur ou de personne n'y figure, et aucun n'y entrera (§1, témoin IIC-S01).
> Critère de Michel : *« il ne suffit pas qu'un import « semble correct » : le programme doit être fidèle au document, et la séance, chronomètre compris, doit
> fonctionner réellement selon les données importées. »*

## 0. En une minute

| | |
|---|---|
| **Le défaut mesuré** | Sur le code publié, importer le programme d'un coach qui écrit « 3 mins », « 1.30 mins » ou « 2 min max » donnait **0 repos** (la séance prenait 130 s partout) ; les lignes d'échauffement d'un programme à colonne ECH/TRAV restaient des exercices séparés ou se recollaient au hasard ; une plage de repos (« 3-4 min ») disparaissait ; l'aperçu ne montrait ni les échauffements ni les repos ; un programme sans date affichait « Semaine 1/4 ». |
| **Ce qui change** | Le Worker (la route VIVANTE de l'import) a un contrat complet et validé ; le client lit les repos comme les coachs les écrivent, regroupe échauffement + travail par **une seule règle** (avec proposition à confirmer quand l'identité est incertaine), montre un aperçu fidèle, ne fabrique plus de « Semaine 1/N », distingue deux programmes homonymes. |
| **Preuve** | Sur 16 programmes ENTIÈREMENT INVENTÉS (12 méthodes + 4 formats d'écriture) passés par la vraie chaîne : programme enregistré **série par série** identique à l'attendu, chrono **exact** pour chaque série validée. Sur le code publié : banc client 32 OK / 44 rouge, corpus 48 OK / 10 rouge, Worker 42 OK / 154 rouge. **Après les corrections C et D** : banc client 121 OK / 0 rouge, corpus 58 OK / 0 rouge, Worker 196 OK / 0 rouge ; les programmes enregistrés AVANT se comportent comme en production (sonde identique, §19). |
| **Reste à faire** | Recette avec l'IA RÉELLE puis sur iPhone (non faites : interdites ici) · décisions A–F **consignées** (§16) : C et D sont corrigées (§19), A, B, F suivent leur voie. |

## 1. Sources lues — et celles qui MANQUENT (règle d'or #16 : dire exactement)

| Document demandé | Résultat |
|---|---|
| `FORCE_TRACKER_PREPA_ONGLET_SEANCE_2026-10-03.md` | ✅ lu (Drive, lecture seule). Règles reprises : **§2** la fidélité au document prime ; **§18** quatre statuts par élément (`COMPRIS_STRUCTURÉ` · `COMPRIS_MAIS_NOTE` · `PARTIELLEMENT_REPRÉSENTABLE` · `NON_REPRÉSENTABLE`) et la liste « jamais » (supprimer en silence, rest-pause → série droite, superset → deux exercices indépendants, perdre tempo / repos / côté / charge / ordre) ; **§10** critères d'acceptation. |
| `IMPORT-PHASE2-AUDIT-IDENTITE-ECH-2026-10-09.pdf` | ⛔ **INTROUVABLE** — recherche par titre dans le Drive : 0 résultat ; absent du dépôt et de l'environnement. |
| `ADDENDUM-ECHAUFFEMENT-3-PROGRAMMES-2026-10-09.pdf` | ⛔ **INTROUVABLE** (même recherche). |
| `SPEC-IMPORT-PROGRAMME-2026-10-07.pdf` | ⛔ **INTROUVABLE** (même recherche). |

↪️ **Mise à jour du 02/11** : Michel a retrouvé ces trois PDF dans la **bibliothèque ChatGPT** et les transmettra séparément **avant la recette finale**. ⛔ **Ils ne sont PAS lus à ce jour** (non accessibles ici) : rien dans ce dossier ne les cite ni ne s'en réclame ; la règle d'identité du §4 reste à les **confronter** dès qu'ils arrivent.

**Conséquence assumée** : la règle d'identité échauffement / travail est celle du **texte de la mission** (cas du matériel écrit d'un seul côté, « jamais de fusion sur une simple ressemblance », « matériels potentiellement distincts = vérification ») et de ce que le dépôt contient (`IMPORT-ECH-01`, `ft-v1156`, `docs/PLAN-CONTRAT-IMPORTS.md`, `docs/CHANTIER-IMPORTS.md`). Rien n'a été déduit de documents qu'on n'a pas pu lire. Si ces trois PDF existent ailleurs, **ils sont à confronter** à la règle du §4.

**Jeux de test** : tout est **inventé** — 12 méthodes sportives (rest-pause, myo-reps, 10×10, top set…) et 4 programmes qui reproduisent les *formes d'écriture* rencontrées à l'import (repos « 2 mins » / « 75 sec max » / « 1 . 20 min » / plages, dropset à repos recopié, matériel écrit dans la note, reps absentes, colonne ECH/TRAV, lignes d'échauffement à part, ancien format du Worker, noms d'exercices à reconnaître). 🔒 **Aucun document de coach, de testeur ou de personne n'est dans ce dépôt** (il est public) : c'est une règle, et un témoin la tient (IIC-S01 exige 16 fixtures, toutes synthétiques, d'identifiant `S…` ou `X…`). Les documents réels servent à la RECETTE (§14), conduite par Michel avec ses propres fichiers, jamais à un fichier versionné.

## 2. La chaîne, et les causes racines retirées

`document → IA (Worker) → extraction → normalisation → regroupement ECH/TRAV → reconnaissance → aperçu → programme enregistré → séance → chrono`

| # | Cause racine **mesurée** | Où | Retirée par |
|---|---|---|---|
| 1 | Le Worker portait une **copie ANCIENNE** du prompt de `Code.js` (2 822 caractères contre 9 832) : ni colonne ECH/TRAV, ni repos, ni anti-invention de date (son exemple portait `weeks:7, startDate:"2026-03-23"`, recopiable), il ne lisait pas `body.catalogue` | `worker.js` | Lot A : prompt rattrapé (parité testée phrase par phrase) + fidélité d'abord |
| 2 | **Aucune validation** de la réponse du modèle (réponse tronquée par `max_tokens` acceptée ; un guillemet « » dans une note faisait échouer tout l'import) | `worker.js` | `_normaliserProgramme`, `_jsonProgrammeLisible`, `callClaudeDiag` |
| 3 | `_secRepos` ne lisait pas l'écriture des coachs : « 3 mins » → 0 (pluriel), « 1.30 mins » → 0, « 2 min max » → 0, « 1 . 20 min » → 0 ; une plage perdait son texte | `constants.js` | `_reposLire` (une seule lecture, conventions écrites §5) |
| 4 | **Deux filets** de regroupement échauffement / travail qui ne se contredisaient que par chance ; « Monté en charge » (la faute du coach) et « Série de chauffe » invisibles ; « X » + « X / haltères » fusionnés d'office | `log.js` | `_mergeImportBlocsEch` + `_identiteBlocImport` (trois réponses : *même* · *à vérifier* · *autre*) |
| 5 | Deux jours « Semaine A / Semaine B » du même numéro **collés** en une séance | `log.js` | garde A/B dans `_mergeImportSeances` |
| 6 | Un dropset importé = un repos ENTIER entre deux paliers ; un repos recopié sur chaque palier cassait aussi l'enchaînement | `log.js` | `_restBrutSerieImport` (import) + enchaînement à la séance **sur un marquage écrit** `dropChaine` (`_impDropEnchaine`, `_recopierDropset`, `toggleSet`) — jamais par déduction (§19-C) |
| 7 | L'aperçu n'affichait ni échauffements, ni repos, ni statut ; une **silhouette** de muscle se faisait passer pour une reconnaissance | `log.js` | `_renderImpConfirm` refait (§7) |
| 8 | « Semaine 1 / N » fabriquée sans date de début ; `shiftProgStart` posait **la date du jour** | `log.js` | carte « Date de début à définir », bouton explicite « Aujourd'hui » |
| 9 | Remplacement d'un programme **sur le seul nom** (deux programmes homonymes indistinguables) | `log.js` | `_descProg` + confirmation nommant la cible |
| 10 | `specialSets` (séries en couleur) **jeté en silence** | `log.js` | `_impConserverSpeciales` |
| 11 | Un « 10 reps » inventé par l'app passait pour la prescription du coach ; ce que le serveur écarte n'était pas dit | `log.js` | `_seriesImport` rend `null` (« Non renseigné » : plus de 10, plus de note — §19-D) ; `_impPertes` |
| 12 | Le **matériel écrit dans la NOTE** (« Hip Thrust » + « Machine guidée ») n'était pas lu : rattachement d'office à la barre | `log.js` | `_materielNoteContredit` |

## 3. Le contrat du Worker (Lot A)

* **Le modèle transcrit, le code valide** (R7 : le prompt est le dernier levier). Les repos sont recopiés **tels qu'écrits** (plages comprises) : c'est le client qui les lit (`_reposLire`).
* **Validation déterministe** (`_normaliserProgramme`) : plus de « 8-10 » → 810 (la plage garde sa borne basse, son texte part dans la note « Reps 8-10 »), plus de `|| 10` / `|| 3` (reps 0, séries 1 — comptées), `setType` ∈ {« », D}, `setTypePerSet` « W » seulement s'il est écrit, date de début refusée si elle fait afficher un programme « terminé », cycles et tableaux réalignés **sans rien deviner**, réponse coupée par `max_tokens` = **erreur dite** (« importe-le en deux fois »), jamais un programme partiel.
* **`data.normalisation`** : des compteurs ENTIERS (jours écartés, lignes illisibles, plages gardées…), jamais un mot du document (Constitution P3). **Une seule place** (décision de ce lot : `data.normalisation`, comme `typesNormalises` de l'historique) ; le client en lit trois compteurs (`_impPertes`, §7).
* **Catalogue** : lu (`_blocCatalogueProg`), règle « même mouvement ET même matériel » (machine ≠ barre ≠ haltères ≠ poulie ≠ Smith), jamais « uniquement ces noms » (R29), jamais bloquant.
* **Intact** : `Code.js` (repli Apps Script, interdit ici : ses défauts historiques — 810, `|| 10`, plages de repos jetées — restent) · `importHistory` · garde S1 · choix du modèle (décision de coût de Michel) · toutes les autres actions IA.
* **Prompt** : 11 529 caractères (+1 697 sur `Code.js`, budget +3 000). Un témoin de **parité** liste les capacités de `Code.js` et vérifie que le prompt du Worker les porte toutes (47 manquaient sur 54 avant).
* ⚠️ **Limite** : le banc prouve le prompt ENVOYÉ et le traitement de la RÉPONSE, **pas** que le modèle (surtout Haiku sur une seule image) obéit à « TEL QU'ÉCRIT ». Coût (prompt +8,7 k car., catalogue jusqu'à 12 k car., sortie jusqu'à 16 000 jetons) **non mesuré**.

## 4. Échauffement / travail — UNE règle, ses cas, ses contre-exemples

**La règle** (`_mergeImportBlocsEch`, `log.js`) : un **bloc continu** du même exercice qui **commence par une preuve d'échauffement** et contient au moins une série de travail devient **un seul exercice**. Preuves admises (`_typesLigneImport`) : type structuré par série (colonne ECH/TRAV → `setTypePerSet` « W »), marqueur dans le nom (« X (ECH) », « ECH - X »), **note qui COMMENCE** par un marqueur (« Échauffement », « Montée en charge », « Monté en charge », « Série (longue) de chauffe », « Chauffe »). Sans preuve, **rien ne bouge** (R29). Un autre exercice entre deux lignes **coupe** le bloc. Superset et dropset ne sont jamais touchés. Chaque série garde ses reps, sa charge, son type, son repos, son ordre.

**Identité** (`_identiteBlocImport`, trois réponses) : *même* (clé identique → regroupé) · *à vérifier* (le second nom PROLONGE le premier par un séparateur, ou mêmes mots, sans matériel contradictoire → **proposition** « Regrouper en un exercice / Garder séparés », rien n'est fusionné d'office) · *autre* (matériels qui se contredisent, mots différents → jamais ni fusion ni proposition).

| Cas exigé | Résultat | Témoin |
|---|---|---|
| Développé couché : 4 ECH + 3 travail | **un** exercice de 7 séries `ÉÉÉÉNNN`, charges / reps / repos par série conservés | IIF-A01, D01 · corpus X03 |
| Repos du travail ne déborde pas sur les échauffements | 0, 0, 90, 120, puis les repos du travail | IIF-D01b, D01c |
| Preuve par colonne structurée / par note / absente | regroupé · regroupé · **deux lignes restent deux exercices** | IIF-A01 / D02 / D03 |
| « Montée en charge » ET « Monté en charge » ; « Série de chauffe » | preuves valides (la faute du coach réel est lue) | IIF-D04, D05 |
| Échauffement isolé (aucun travail derrière) | reste un exercice, sa série conservée | IIF-D06 |
| « Squat » (échauffement) puis « Squat Bulgare » | **deux** mouvements, jamais fusionnés, **jamais proposés** | IIF-D07 |
| Développé militaire barre puis haltères | matériels contradictoires : jamais fusionnés ni proposés | IIF-D08 |
| Exercice intercalé | le bloc est coupé | IIF-D09 |
| Marqueur dans le nom | regroupé | IIF-D10 |
| Matériel écrit d'un côté seulement (« Développé militaire » / « … haltères ») | **proposition**, jamais fusion d'office | IIF-D11 |
| **Matériel écrit d'un seul côté** : « Presse épaules guidée » ×2 (échauffement) puis « Presse épaules guidée / haltères » (travail) | proposition ; une fois confirmée : **un exercice de 5 séries** `ÉÉNNN` ; refusée : deux exercices ; l'étiquette différente ne bloque pas un regroupement légitime ; l'ancien format du Worker donne le même résultat | IIF-E01 → E06 · corpus X03, IIC-L01 |
| Jours « Semaine A » / « Semaine B » du même numéro | **deux** séances (et « Séance 1 — Dorsaux » + « Séance 1 — Biceps » restent une) | IIF-E07, E08 |

## 5. Le repos, de l'écriture du coach à la durée du chrono

**Lecture** (`_reposLire` — un seul propriétaire, `_secRepos` n'en est que le point d'entrée historique ; **toutes ses valeurs d'avant sont inchangées**, IIF-R05) :

| Écrit dans le document | Lu | Note |
|---|---|---|
| `3 mins` · `3 min` · `3mn` · `2 minutes` | 180 / 120 s | pluriel « mins » : 0 sur le code publié |
| `1.30 mins` · `2.30 mins` · `1.15min` | 90 / 150 / 75 s | **minutes.secondes** (deux chiffres après le point) ; `2.5 min` = 150 s |
| `1 min 30` · `1m30` · `1:30` · `1'30` | 90 s | |
| `90 s` · `40 sec` · `45 secondes` | tel quel | |
| `repos 40 sec` · `Récup 90 s` · `Repos : 2 min` | 40 / 90 / 120 s | le mot « repos » est ôté |
| **`2 min max` · `repos 30 sec maxi` · `1.15 min max`** | 120 / 30 / 75 s | un **plafond** : le chiffre écrit EST le repos |
| `environ 90 s` · `~2 min` | 90 / 120 s | |
| **`1 . 20 min`** | 80 s | blanc d'extraction d'un PDF recollé |
| `2` (entier seul) | 120 s | 1 à 9 = minutes ; 10–14 ambigu (texte conservé, rien appliqué) ; ≥ 15 = secondes |
| **`60-90 s` · `3-4 min` · `2 à 3 mins` · `2 -3 mins` · `30/40 sec`** | **aucun repos** — `rest` 0, bornes lues, **texte écrit CONSERVÉ** | jamais « 90 / 120 / 180 » inventé |
| `1.10/20 min` | texte conservé, rien appliqué | borne haute > 5× la basse : pas une plage |
| `selon ressenti` · vide · `-` | texte conservé / rien | |

**Transport** : `rest` (secondes) + `restTxt` (le texte écrit, **uniquement** pour une plage ou un texte) sur chaque série du programme et de la séance. C'est la **seule donnée persistée ajoutée** (champ optionnel ; aucune clé de stockage, aucune migration ; un programme existant sans `restTxt` se comporte exactement comme avant).

**Priorité à l'exécution** (`toggleSet`, inchangée dans son principe) : ① le repos **ferme** de LA série (`set.rest`) · ② la préférence de l'exercice (`S.exRestPref`) · ③ le réglage global (`S.defRest`, 130 s) — avec les règles historiques par type (échauffement 45 s ou palier, échec 240 s, abdominaux 30 s). **Un import n'écrit jamais une préférence** ni ne touche au réglage global (IIF-B09).

**Plage ou texte à l'exécution** : le chrono tourne au **repos par défaut de l'app pour ce type de série** (rien n'est choisi à la place de la personne) — le réglage de la personne pour une série de travail, 45 s à 120 s selon la charge pour un échauffement (règle de palier existante), 30 s pour les abdominaux —, la **consigne écrite** s'affiche sous le chrono (`#rest-consigne`), et « Régler » propose **les deux bornes** (3:00 · 4:00). Si un repos chiffré a été choisi, la consigne disparaît (rien de contradictoire à l'écran). Le bouton central « + » ne bouge pas d'un pixel (règle d'or #9, mesuré, IIF-B12).

| Cas (mission §5) | Durée passée à `startRest` | Témoin |
|---|---|---|
| ECH `60 s` · 3ᵉ échauffement 90 s · 4ᵉ 120 s | exactement ces durées, `restTot` identique | IIF-B02 |
| TRAV `3 min` | 180 s | IIF-D01c, B01 |
| Dernière série d'un exercice puis exercice suivant (`1.30 mins` puis `40 sec`) | 90 s puis 40 s — **jamais décalé d'une série** | IIF-C03 |
| Repos distincts par série (`restPerSet`) | un par série | IIF-A02, A07 |
| `2 à 4 min` | repos par défaut de l'app + consigne écrite + deux bornes proposées ; choisir 4:00 → 240 s | IIF-B03, B10, B11 |
| Aucun repos écrit | préférence de l'exercice, sinon réglage global | IIF-B07, B08 |
| Changement volontaire (bornes, préréglages) | respecté | IIF-B10 |
| Fermeture / réouverture de l'app | séance et consigne identiques | IIF-B13 |
| Superset | aucun repos après le 1ᵉʳ exercice du tour, le repos de la série du dernier à la fin du tour | IIF-C01 |
| Dropset | aucun repos entre les paliers, le repos écrit **à la fin** — pour un programme **importé après la correction C** (marqueur `dropChaine`) ; un programme enregistré avant garde son repos entier entre les paliers (§19-C) | IIF-C02, IIF-J01 → J10 · corpus X02 |
| Écart entre donnée stockée et durée utilisée | **mesuré sur les 16 fixtures** (série par série) : 0 | IIC-*-CHRONO |

**Démonstration « repos enregistré → chrono »** (programmes INVENTÉS, séance chargée puis chaque série validée dans l'ordre ; colonne de droite = la durée **réellement passée à `startRest`**) :

```
X01 · « Séance push léger (inventée) »
  Développé Militaire Haltères  S1…S5  N  « 2 mins »             repos enregistré 120 s  → chrono 120 s   (×5)
  Élévations Latérales Machine  S1…S3  N  « 75 sec max »         repos enregistré  75 s  → chrono  75 s   (×3)
  Tirage Visage (Face Pull)     S1…S4  N  « Repos 40 sec maxi »  repos enregistré  40 s  → chrono  40 s   (×4)
  Triceps Corde Poulie          S1…S3  N  « 1 . 20 min »         repos enregistré  80 s  → chrono  80 s   (×3)
  Barre au Front                S1…S3  N  « 2 à 3 mins » (plage)  aucun repos ferme       → chrono 130 s + consigne « 2 à 3 mins » affichée (réglage de la personne)
X03 · colonne ECH / TRAV — « Soulevé de Terre », UN exercice de 6 séries
  S1 É   40 kg × 8   « 60 s »               → chrono  60 s
  S2 É   60 kg × 5   « 60-90 s » (plage)    → chrono  90 s   (palier d'échauffement de l'app : le suivant est plus lourd)
  S3 É   80 kg × 3   « 90 s »               → chrono  90 s
  S4…S6 N  100 kg × 5  « 3-4 min » (plage)  → chrono 130 s + consigne « 3-4 min » affichée (réglage de la personne)
```

## 6. Reconnaissance des exercices (A reconnu · B ambigu · C inconnu)

* **A — reconnu** : rattaché d'office (palier « auto » du rapprocheur existant), nom du catalogue, **vraie illustration**. **B — ambigu** : *proposé* (« À confirmer »), le nom du document est **gardé** tant que la personne n'a pas dit oui. **C — inconnu** : nom gardé, annoncé « Sera créé · exercice perso », avec l'aveu « aucune illustration » — **jamais une silhouette de muscle** qui ferait croire à une reconnaissance (IIF-F02, F03, F09).
* **Garde-fous IMPORT-MAP-01 / 01B / 02 conservés** (aucun rattachement automatique squat machine → barre, poulie → haltères, Smith → libre : IIF-F05). Aucun exercice perso n'est créé avant « Importer » (IIF-F04).
* **Nouveau** : le matériel écrit dans la **note** est lu (`_materielNoteContredit`) : « Hip Thrust » + « Machine guidée » devient une **proposition** au lieu d'un rattachement d'office à la barre (IIF-I03). Une note qui dit « barre » ne contredit pas une cible non marquée (IIF-I05).
* **Mesure sur le corpus inventé** (44 exercices dont le catalogue a l'équivalent) : **38 reconnus d'office + 4 proposés avec la BONNE cible = 42** ; 2 limites connues, nommées dans le banc (ci-dessous). Plancher du banc : 42 — une amélioration le dépasse, une régression de la reconnaissance passe dessous et fait rougir.
* ⚠️ **Limite constatée sur de vrais documents, NON corrigée** : les abréviations de coach (« Dév. », « DC »…) et les synonymes ne sont pas rattachés ; ils restent « Sera créé » (jamais rattachés au hasard). L'enrichissement de la table d'équivalences est une décision à part (§16) : *un synonyme faux redirige un exercice en silence et coupe un historique en deux* — la règle de `ft-v1170` (« on n'ajoute que ce qui est mesuré sur un vrai document, cible unique vérifiée ») s'applique.
* ⚠️ **Limite connue, nommée dans le banc** : une **variante écrite dans la note** qui n'est pas un matériel (« Tirage vertical » + « Prise inversée ») est rattachée à « Tirage Poulie Haute (Lat Pulldown) » (la prise est conservée dans la note, pas lue). Une limite nommée fait rougir le banc si elle **disparaît ou si une autre apparaît** (IIC-Z02).

## 7. Aperçu AVANT enregistrement (mission §6)

Par exercice : nom, **statut** (Reconnu · À confirmer · Sera créé), vraie illustration ou aveu d'absence, nombre d'échauffements / de séries de travail, **charges, reps et repos de chaque série** (synthèse + détail repliable « Voir / corriger »), note du document, proposition de regroupement. Corrigeable : **type** d'une série (échauffement ↔ travail), **repos** (puces, ou champ « autre » : chiffres seuls = secondes), ✕ pour retirer un exercice, ✓ / ✕ d'une suggestion. Rien n'est écrit avant « Importer ». Ligne d'alerte **« Ce que l'import n'a pas pu garder »** quand le serveur a dû écarter une séance sans exercice, une ligne illisible ou une date (`data.normalisation`) — et **rien** pour l'ancien serveur ou pour une simple plage conservée (on ne dit pas « tout va bien »). Confort téléphone (Chromium 390 × 844 — **pas** un iPhone) : rien ne déborde, cibles tactiles ≥ 40 px (boutons) / ≥ 34 px (puces) (IIF-F10).

## 8. Calendrier et programmes homonymes (mission §7-8)

* **Sans date de début** : la carte dit « Date de début à définir », pas de « Semaine 1 / N », pas de barre, pas de ± ; A/B jamais déduits ; l'éditeur propose un bouton **explicite** « Aujourd'hui » ; ouvrir puis enregistrer l'éditeur **sans toucher** à la date ne l'invente pas ; « décaler d'une semaine » ne pose jamais la date du jour (IIF-G01 → G06). Avec une vraie date, le calcul existant est **inchangé** (IIF-G02).
* **Homonymes** : chaque programme porte nom, durée, début, nombre de séances et **numéro technique** (6 derniers caractères de l'identifiant) ; « Remplacer » **nomme sa cible** dans une confirmation avant tout effet ; annuler ne remplace ni ne crée rien ; confirmé, **seule** la cible change (IIF-H01 → H05).

## 9. Matrice de couverture des méthodes (mission §9)

Statuts de `PREPA_ONGLET_SEANCE` §18, établis sur le **code** et sur le corpus (colonne `attendu.methodes` des fixtures). ⛔ Aucune méthode n'est déclarée « supportée » au-delà de ce que la séance EXÉCUTE.

| Statut | Éléments (exemples du corpus) | Comment c'est tenu |
|---|---|---|
| **COMPRIS_STRUCTURÉ** | colonne ECH/TRAV → séries typées · lignes du même exercice regroupées · repos fermes (par exercice ou par série) · séries droites, pyramides, 10×10, top set + back-off, charges alternées (reps / charge par série) · supersets et tri-sets (`group`) · dropsets (type D, paliers enchaînés) · cardio d'échauffement (`cardioAvant`) · durée du cycle (`weeks`) | champs du programme, exécutés par `toggleSet` |
| **COMPRIS_MAIS_NOTE** | repos en **plage** (texte sur la série + consigne au chrono) · RIR / RPE cibles · charge « à calibrer » / « léger » · « Monté en charge » / « Série de chauffe » en prose sans colonne · tempo (lu par `_tempoSec` pour la durée) · unilatéral « par bras » · rest-pause (mini-séries à repos court) · séance facultative / de rappel (libellé) · progression par semaine · matériel dans la consigne · dead set | `note` de l'exercice, jamais jetée |
| **PARTIELLEMENT_REPRÉSENTABLE** | plages de reps (borne basse + « Reps 8-10 ») · plages de charge · charge approximative (« ~60 ») · plafond de repos (lu comme valeur ferme) · myo-reps (le lien « grappe » n'existe pas) · 8+2+2+2 (reps = 8, grappes en note) · %1RM (kg calculés **par le modèle** si les 1RM sont écrits) · gainage / isométrie (durée en secondes dans `reps`) · circuit (groupe de séries, pas de « tours ») · Semaine A / B (deux jours, l'alternance n'est pas planifiée) · bloc d'abdos « avant l'entraînement » (jour séparé, l'ordre n'est pas planifié) | structuré en partie, le reste en note |
| **NON_REPRÉSENTABLE** | répartition hebdomadaire / jours de repos · durée cible de séance · règle « la charge monte si le RIR réel l'autorise » · repères d'en-tête (DC 130 / Squat 140…) · renvoi à une vidéo · conseils généraux de préambule · colonne « Image » | **dit** (aperçu / dossier), pas simulé |

Non couvert par le corpus (texte seul) : couleurs, images, vidéos ; AMRAP / EMOM / giant sets / BFR / clusters (aucun exemple dans le corpus) — **rien n'est affirmé** à leur sujet.

## 10. Validation (mission §10) — ce qui a RÉELLEMENT tourné

| Niveau | Quoi | Résultat |
|---|---|---|
| **A — déterministe, IA simulée** | banc client `B-IIF` (`tools/banc_import_fidelite.js`) : lecture des repos, chaîne document → programme → séance → **chrono réel** (espion sur `startRest`), regroupement, aperçu, calendrier, homonymes, cas dérivés des programmes de coachs, **dropsets (J) et reps « Non renseigné » (K)** | **121 OK / 0 rouge** (91 avant les corrections C et D) · sur le code publié `ft-v1263` : **32 OK / 44 rouge** (les sections qui plantent sur l'ancien code s'arrêtent à leur première erreur, nommée) |
| **A — Worker** | banc `IIF-W` (`tools/banc_import_worker_contrat.js`) : le vrai `worker.js` conduit dans un `vm`, réseau simulé, horloge figée, 3 fuseaux | **196 OK / 0 rouge** · sur le `worker.js` publié : **42 OK / 154 rouge** |
| **B — corpus** | banc `B-IIC` (`tools/banc_import_corpus.js`) : 16 fixtures inventées, structure série par série, reconnaissance, **chrono de chaque série validée** | **58 OK / 0 rouge** · sur le code publié : **48 OK / 10 rouge** (repos « max », plages, colonne ECH/TRAV, dropset : ces programmes ne sont PAS fidèles sur le code publié) |
| **C — contre-tests** | mutations sur arbre copié : client `tools/mut_import_fidelite.py` (**80**), corpus `tools/mut_import_corpus.py` (14), Worker `tools/mut_import_worker_contrat.py` (78) | voir §10 bis |
| **D — IA réelle + iPhone** | **non faits** (interdits : tests IA payants, publication, déploiement) | protocole §14 |

### 10 bis — contrôle négatif (rempli à la clôture)

| Outil | Mutations (chacune REMET un défaut supprimé ou RETIRE une protection ajoutée) | Résultat |
|---|---|---|
| `tools/mut_import_fidelite.py` (client) | **80** — lecture des repos (M01–M05, M38–M41) · transport du texte de repos (M06–M09) · identité et regroupement échauffement / travail (M10–M17) · chrono, consigne, « Régler » (M18–M22) · aperçu, calendrier, homonymes (M23–M31) · séries en couleur, ambigu, confort téléphone (M32–M37) · matériel dans la note, reps non écrites (M43 réécrite : un 10 inventé), pertes dites (M42, M44–M45) · données de la personne protégées (M46) · **correction C** : dropsets (M18 réancrée, M47–M52) · **correction D** : « Non renseigné » (M53–M80 : aperçu, matérialisation, chargeurs, validation, saisie, fin de séance, sauvegarde, éditeur, papier, Milo, données d'avant) | **80/80 tuées** : campagne COMPLÈTE rejouée sur l'arbre final (arbre final), `tools/sous_garde.sh python3 tools/mut_import_fidelite.py` |
| `tools/mut_import_corpus.py` (corpus) | **14** — plafond « max », blanc de PDF, plage inventée, repos uniforme d'un dropset, matériel de la note, reps non écrites (C06 réécrite : un 10 inventé), suggestion appliquée d'office, type « É » non traduit, regroupement non appelé, `restTxt` perdu (programme et séance), dropset non enchaîné (C11 réancrée), superset perdu, inconnu non annoncé | **14/14 tuées** — campagne complète rejouée sur l'arbre final |
| `tools/mut_import_worker_contrat.py` (Worker) | **78** (76 « GARDE » + 2 « NEUTRE ») | **78/78 conformes** : les 76 GARDE font rougir le banc, les 2 NEUTRE (changements que le contrat tolère) le laissent vert ; banc sain vert avant (3 fuseaux) et après ; dépôt intact (empreinte) |
| Témoin du runner réécrit (CCLVI) | appel de `_mergeImportBlocsEch` retiré de l'extraction | **1 rouge** (« le chemin d'extraction APPELLE la fusion, et AVANT le rattachement VM ») |

*Historique honnête du contrôle* : au premier passage 36/37 — la mutation M12 laissait le banc vert parce qu'elle ne changeait rien (les mots sont triés avant comparaison) : réécrite pour viser le vrai garde, tuée. Côté corpus : C13, C15 et C16 étaient neutres sur le corpus d'alors (déjà tuées par M14, M07, M08 du banc client) → retirées au lieu d'être déclarées couvertes ; C14 survivait (le texte de la plage n'était pas comparé à la séance) → témoin renforcé, tuée ; C07 avait une ancre double → désambiguïsée.

### Bancs voisins

Rejoués **un par un, sur l'arbre final** (après les corrections C et D), sous le garde réseau (`tools/sous_garde.sh`) — tous les bancs qui exercent `_buildProgDay`, `finalImportProg`, `_secRepos`, `toggleSet`, `startRest`, `_loadProgDayVraiment`, `loadProg`, `saveAsProg`, `addSet`, `upSet`, `finishWorkout`, `printProg`, l'analyse de programme, le contexte de Milo, `shiftProgStart` ou `openProgModal` :

| Bancs | Résultat |
|---|---|
| **Import** : `d088` 52 · `import_echauffement` 11 · `import_map` 22 · `import_map2` 43 · `import_map_alias` 22 | ✅ 0 rouge — les garde-fous IMPORT-MAP-01 / 01B / 02 et le filet IMPORT-ECH-01 tiennent |
| **Séance / chrono** : `p02_triceps` 23 · `cc01_dropset` 31 · `rir_superset` 52 · `seance_repos` 61 · `seance_c1` 29 · `seance_c2` 22 · `seance_c3` 35 · `seance_chiffres` 102 · `seance_unicite` 12 · `seance_date` 25 · `seance_recette` 93 · `session_integrity` 93 · `travail_lot2` 48 · `ux_d086` 122 · `picker_vignettes` 20 · `aides_audit` 18 · `debrief_provenance` 24 · `nut_punch01` 36 | ✅ 0 rouge |
| **Ajoutés pour les corrections C/D** (ils exercent `saveAsProg`, `addSet`, `finishWorkout`, l'analyse de programme, le contexte de Milo, les chargeurs de programme et le dropset du Lot 6) : `ml_a` 34 · `ml_b` 60 · `notes_d087` 70 · `d091_volume_prepare` 8 · `fil_lot1` 39 · `lot3` 87 · `motif_exercice` 17 · `contrat_milo` 23 · `coach_memoire` 28 · `milo_pdf1` 97 · `debrief_demande` 62 | ✅ 0 rouge |
| **Les bancs de ce lot** : `import_fidelite` **121** · `import_corpus` 58 · `import_worker_contrat` 196 (Worker non touché par C/D, non rejoué) | ✅ 0 rouge |
| **Gouvernance** (fichiers ajoutés au dépôt) : `garde_reseau` 38 · `gouv_generateurs` 3 | ✅ 0 rouge |
| **Témoins « de source » de la passe** (queue synchrone du runner) et **passe réduite** (installation + gouvernance D031S) | ✅ 793 OK / 0 rouge et 63 OK / 0 rouge mesurés **avant** les corrections C et D ; non rejoués depuis (aucun fichier du runner n'a changé ; la passe complète est interdite pour cette mission) |
| `seance_ux` (PLANTAGE `page.click` : délai de 3 s) · `progres_seances` (PS-E29, 1 rouge) · `ux_integration` (G2, G3, G5, G7) · `fig_face_dos` (FFD-⑧e, 1 rouge) | ⚠️ **rouges à l'IDENTIQUE sur la version publiée `e2b942f3`** (mêmes témoins, mêmes valeurs, rejoués sur une copie du code publié) : **pré-existants, pas causés par ce lot** — rejoués après C et D : **mêmes témoins rouges, rien de nouveau** |

⛔ **Non joué** : la passe D-031 **complète** (non autorisée ; à réserver à la prépublication, sur arbre figé — et après refusion des branches concurrentes, §13-1). Sont aussi pré-existants et sans rapport : `check_regles.py` signale « DOSSIER-ATHLETE-SUIVI.md : le tableau des 8 briques est PÉRIMÉ » à l'identique sur le code publié (tout le reste est ✅ : 19 règles d'or cohérentes, archive 0 entrée perdue).

## 11. Protection des données (mission §11) — respectée

Aucune donnée utilisateur lue ni modifiée · aucun programme existant touché (aucun programme déjà enregistré n'est réparé) · aucune réimportation automatique · aucun exercice perso supprimé ni fusionné · aucune séance, aucun record, aucune charge historique modifiés · aucune préférence de repos écrasée par un import (IIF-B09) · aucune migration · « local d'abord » intact (l'import écrit après « Importer », jamais avant).

## 12. Compteurs règle d'or #17 (code applicatif uniquement)

| Compteur (code applicatif : `worker.js` · `constants.js` · `log.js` · `index.html` · `style.css`) | Valeur |
|---|---|
| **Données persistées ajoutées** | **2** — `restTxt` : le texte du repos écrit, **uniquement** pour une plage ou un texte, champ OPTIONNEL sur chaque série d'un programme et d'une séance · `dropChaine` (correction C, §19) : booléen OPTIONNEL, **uniquement** sur un exercice importé qui est un dropset. (`reps: null` — correction D — est une **valeur** d'un champ existant, pas un champ.) **0** clé de stockage, **0** migration (un programme existant sans ces champs se comporte comme avant — prouvé par la sonde du §19). |
| **Fichiers applicatifs touchés** | **6** — `log.js` · `worker.js` · `constants.js` · `style.css` · `index.html` · `coach.js` (1 ligne, correction D) ; aucun fichier applicatif créé (les fichiers créés sont des tests, outils, jeux de test et documents) |
| **Lignes ajoutées − retirées** | **+1 091 − 191 = +900** (`log.js` +568 −161 · `worker.js` +379 −3 · `constants.js` +89 −24 · `style.css` +49 −0 · `index.html` +5 −2 · `coach.js` +1 −1) — dont les seules corrections C et D : +127 −51 = +76 (§19). Dans `worker.js` : 188 lignes de code, 96 de texte de prompt, 75 de commentaires « pourquoi » (convention du projet). |
| **Anciens chemins supprimés / fusionnés** | **7** — ① le 1ᵉʳ filet échauffement (`_mergeImportEchauffements` + `_fusionneEch`) fusionné dans `_mergeImportBlocsEch` · ② `_impThumb` (vignette à silhouette) remplacée par `_impIllu` · ③ l'ancienne copie du prompt du Worker et son appel texte seul · ④ la 2ᵉ lecture des séries de `_buildProgDay`, fusionnée dans `_seriesImport` (aperçu = enregistrement) · ⑤ le corps de `_secRepos`, fusionné dans `_reposLire` (le point d'entrée reste) · ⑥ le chemin de `shiftProgStart` qui posait la date du jour · ⑦ `_impSignalerRepsAbsentes` + `repsDef` (correction D : le 10 inventé « puis signalé » n'existe plus) |

⚖️ **Bénéfice / coût (règle d'or #17)** : le bénéfice est mesuré (sur le corpus inventé, le code publié perd 10 témoins sur 58 au banc du corpus et 44 sur 76 au banc client ; le programme enregistré est fidèle série par série sur 16 programmes) ; le coût architectural est borné (une donnée optionnelle, deux propriétaires uniques remplaçant des doublons : un filet de regroupement au lieu de deux, une lecture des séries au lieu de deux). Tout témoin réécrit rougit sous mutation volontaire (§10 bis ; le témoin CCLVI du runner, réécrit parce que le 1ᵉʳ filet n'existe plus, rougit quand l'appel du filet unique est retiré).

## 13. Risques de régression (à relire avant fusion)

1. **Fusion avec `claude/workout-core-01`, `claude/seance-hl-01`, `claude/seance-hl-04-02`** : essai de fusion fait (`git merge-tree`) → **un seul conflit dans `log.js`**, 5 lignes dans `startRest` (mon crochet `_restConsigneMontrer()`), plus `docs/JOURNAL-DE-PARTAGE.md`. Aucun conflit sur `constants.js` (les branches Nutrition touchent d'autres zones). `worker.js` : aucune branche concurrente. *La session qui publie en dernier refusionne, vérifie les témoins et relance la passe* (protocole deux sessions).
2. ~~**Dropsets déjà enregistrés** : ils s'enchaînaient désormais~~ — ✅ **RÉSOLU (§19-C)** : l'enchaînement n'est plus déduit du type « D » ; il exige le marquage écrit `dropChaine`, posé seulement par un NOUVEL import. Un programme enregistré avant garde son chrono à l'identique (sonde comparée à la production : sortie identique octet pour octet). *Reste* : un ancien dropset ne s'enchaîne pas (voulu) ; pour l'avoir, ré-importer le document.
3. **`_secRepos` lit plus de valeurs** qu'avant (« 2 min max », « environ 90 s ») : un programme existant qui contenait un tel texte dans `rest` est désormais lu en secondes (amélioration, rare).
4. **« X » + « X / haltères »** n'est plus fusionné d'office (proposition) — c'est le cas « matériel écrit d'un seul côté » voulu par la mission.
5. **Séries sans nombre** : `_buildProgDay` lit désormais les séries par `_seriesImport` (même lecture que l'aperçu) ; un `sets` absent donne **1** série (et non 3) — n'arrive que sur une réponse mal formée.
6. **Worker** : prompt plus long (+8,7 k car.), catalogue jusqu'à 12 k car., sortie jusqu'à 16 000 jetons : **coût et latence non mesurés** ; Haiku (une seule image) peut ne pas obéir.
7. **Règle 0 du prompt** (« un groupe musculaire ne crée jamais une séance »), reprise de `Code.js` : les programmes **sans titre « Séance N »** (des tableaux titrés par groupe musculaire : « Dos et biceps », « Jambes »…) risquent d'être **fusionnés en une seule séance** par le modèle. **Non mesurable sans IA réelle** ; clause proposée prête (§16-B), à valider en recette.
8. ~~**Reps** : le 10 de repli subsiste mais il est dit dans la note~~ — ✅ **RÉSOLU (§19-D)** : plus aucun 10 inventé ; `reps: null` = « Non renseigné », affiché tel quel, complété par la personne à la séance. *Reste* : (a) la lecture de `null` par tous les lecteurs a été vérifiée un par un (liste au §19-D) mais un lecteur oublié afficherait « null » plutôt que de se tromper de chiffre ; (b) une autre version de l'app (cache d'un 2ᵉ appareil) qui lit un programme `reps: null` retombe sur l'ancien comportement (10), sans perte de donnée ; (c) vider un champ de reps dans l'éditeur dit désormais « Non renseigné » (et non 0) — aussi pour un programme fait à la main.
9. **Cas limite dropset** : si la personne règle EXPRESSÉMENT la même valeur sur chaque palier dans l'aperçu, elle est relue comme « le repos de fin de série » (les paliers s'enchaînent) — c'est la lecture voulue d'un dropset, mais ce n'est pas ce qu'elle a tapé à la lettre.
10. **Abdominaux** : la règle existante « 30 s par défaut » s'applique même quand le document écrit une plage (« 60-90 s ») ; la consigne écrite reste affichée et « Régler » propose les deux bornes.
11. **Corpus de test inventé** : la reconnaissance de noms n'est mesurée que sur des noms inventés autour du catalogue ; sa qualité face à de VRAIS documents ne se juge qu'à la recette (§14).
12. **Validation d'une série « Non renseigné » sur un autre chemin** : seule `toggleSet` écrit `done` pendant une séance (vérifié) ; `confirmSetAndNext` (touche Entrée) passe par elle. Un futur chemin qui validerait une série sans passer par `toggleSet` contournerait la garde — le témoin IIF-K08 le verrait sur les chemins connus seulement.
13. **Le chrono d'un dropset importé AVANT reste « un repos entier entre paliers »** (ou le repos par défaut quand aucun n'est écrit) : c'est le comportement de la production, préservé exprès ; ce n'est pas un défaut de ce lot.

## 14. Protocole de recette (IA réelle puis iPhone) — à lancer sur GO séparé

⛔ Pré-requis qui ne dépendent pas de ce lot : un **GO « test IA réel (coût) »** et un **GO « déploiement du Worker de la branche »** (le clone de test `/clone/` coupe le réseau vers le Worker par construction : il ne peut PAS servir à tester l'IA). Environnement : un compte de test **sans données réelles**, sauvegarde faite avant (règle d'or #6).

1. Déployer `worker.js` de la branche sur un Worker **de test** (jamais le Worker de production) ; vérifier `?test=1`. *(Ou GO explicite pour la production.)*
2. Importer, un par un, **dans l'ordre** : (a) un PDF de programme à colonne ECH/TRAV ; (b) un programme en tableaux sans titre « Séance N » ; (c) un programme qui écrit ses repos « 2 min max » / « 1.30 mins » ; (d) un programme d'un seul écran en **photo** (Haiku).
3. Relever pour chacun, comparé au document lu **par Michel** (jamais à un fichier versionné) :

| Contrôle | Attendu |
|---|---|
| Nombre de séances | celui du document — ⚠️ un programme sans aucun titre « Séance N » : si l'IA rend **1** séance, la règle 0 est en cause (§13-7) |
| Échauffements | une ligne d'échauffement est une série `É` ; un nom qui en prolonge un autre : proposition « Regrouper » |
| Repos | « 3 mins » = 180 s, « 1.30 mins » = 90 s, « 2 min max » = 120 s ; plages = texte + consigne, **aucun** chiffre inventé |
| Reps / charges | plages : borne basse + note ; « à calibrer » : 0 + note ; rien d'inventé |
| Dates | aucun `startDate` si le document n'en écrit pas ; « Date de début à définir » |
| Reconnaissance | « À confirmer » pour l'ambigu ; « Sera créé » pour l'inconnu ; aucune silhouette |
| Reps non écrites | « Non renseigné » dans l'aperçu (résumé, détail) et dans l'éditeur ; **aucun 10** nulle part ; à la séance, champ vide, ✓ refusé sans nombre |
| Dropsets | un NOUVEL import de dropset s'enchaîne sans repos entre paliers, repos à la fin ; un programme enregistré AVANT garde son repos entier entre paliers |

4. **Séance** : charger un jour, valider chaque série dans l'ordre, **chronométrer** : la durée affichée = le repos enregistré (ou le repos par défaut de l'app + la consigne écrite pour une plage). Tester : ECH → ECH, dernier ECH → premier travail, travail → travail, dernière série → exercice suivant, superset, dropset, fermeture / réouverture, « Régler ».
5. **iPhone (Safari, appareil réel)** : défilement de l'aperçu (`max-height:54dvh`), cibles tactiles, bouton central « + » (mesuré, pas regardé), clavier du champ « autre » ; **série « Non renseigné » : toucher ✓ sans nombre → message + curseur dans le champ ET clavier qui s'ouvre** (le focus programmatique sur iOS n'est pas reproductible ici), puis saisir un nombre et valider. *Chromium 390 × 844 n'est PAS une validation iPhone.*
6. Consigner : version, appareil, scénario, date, résultat (état « vérifié sur iPhone », règle d'or #19).

## 15. Brouillons de communication (règle d'or #11) — NON branchés

À brancher **au moment de la publication** par la session qui publie (point rouge `NEW_FEATURES`, aide « ? » de l'onglet, aide détaillée, diapo du Guide ; **pas de pop-up `WHATS_NEW`** : la personne n'a rien à *faire*, aucun repère n'a bougé) :

* *Import de programme* : « Les repos écrits par ton coach (« 2 mins », « 1.30 », « 2 min max ») sont maintenant lus tels quels. Une plage (« 3-4 min ») n'est jamais transformée en durée : elle s'affiche sous le chrono et tu choisis. L'aperçu montre chaque série (échauffement ou travail), sa charge, ses reps et son repos, et te dit ce qu'il a reconnu ou créé. »
* *Programme sans date* : « Sans date de début, la carte du programme dit « Date de début à définir » — touche « Aujourd'hui » quand tu commences. »
* *Répétitions non écrites* : « Quand ton document n'écrit pas les répétitions, l'app ne les invente plus : elle écrit « Non renseigné » et te laisse les saisir pendant la séance. » (Aide « ? » de l'onglet et diapo du Guide ; pas de pop-up.)

## 16. Décisions de Michel — A à F **consignées** (02/11/2026, règle d'or #15 : une décision actée reste actée)

| | Décision (Michel) | État |
|---|---|---|
| **A** | **Synonymes / abréviations de coachs** : un lot séparé, **sans rapprochement automatique dangereux**. | Consignée. **Non commencée** (les abréviations et synonymes de coach restent « Sera créé », jamais rattachés au hasard). Quand le lot s'ouvre : cible unique vérifiée pour chaque entrée (R29, `ft-v1170`). |
| **B** | **Tableaux sans titre « Séance N »** (découpage en séances) : **attendre la recette IA réelle**. | Consignée. La clause proposée (*« si le document n'a AUCUN titre de séance explicite, chaque tableau d'exercices titré est une séance »*) reste **prête et non posée** ; elle se décide après la recette §14 (R34 : un changement de contexte se valide par un avant / après). Risque suivi : §13-7. |
| **C** | **Dropsets historiques** : prouver la compatibilité, ou préserver leur comportement antérieur ; jamais de comportement nouveau imposé à une donnée ancienne par déduction ; marquage explicite pour les futurs imports. | ✅ **Fait** — §19-C : comportement préservé (sonde comparée à la production : identique), marquage `dropChaine` écrit par le seul nouvel import. |
| **D** | **Reps absentes** : ne jamais inventer silencieusement 10 ; afficher « Non renseigné » ; champ à compléter à la séance ; une valeur suggérée n'est jamais enregistrée comme donnée du document sans validation. | ✅ **Fait** — §19-D. |
| **E** | **« 2 min max »** = un **plafond** de 120 s, pas une durée minimale. | ✅ **Déjà conforme par conception, aucun code changé.** `_reposLire` lit « 2 min max » → 120 s ; et le chrono de l'app est un **MAXIMUM** (décision de Michel du 27/08, `ft-v1030` : *« on peut repartir avant, c'est autorisé »* ; il ne s'arrête pas à 0, le dépassement est informatif). Tous les repos de l'app se lisent donc « au plus » : le mot « max » n'a pas besoin d'être conservé en plus du chiffre. Témoins : IIF-R01 (écritures fermes, dont les plafonds), IIF-B (durée passée à `startRest`). |
| **F** | **Repli Apps Script (`Code.js`)** : le conserver provisoirement, et **signaler toute perte fonctionnelle**. | ✅ **Conservé tel quel** (`Code.js` n'est pas touché ; la route vivante de l'import est le Worker, le client n'a **aucun** repli automatique sur erreur). **Pertes fonctionnelles connues si le repli servait** (mesurées dans `Code.js`, `handleImportProgram_`) : ① plafond de sortie **8 192 jetons** contre 16 000 au Worker, **sans détection de coupure** ; ② **aucune validation** de la réponse du modèle (une réponse mal formée fait échouer l'import au lieu d'être réparée ou refusée proprement) ; ③ **aucun compteur `normalisation`** → le bandeau « Ce que l'import n'a pas pu garder » ne peut pas s'afficher (le client se tait plutôt que de dire « tout va bien », témoin IIF-I08) ; ④ pas de diagnostic d'erreur du Worker (`callClaudeDiag`). *Le prompt, lui, est à parité* (testé phrase par phrase) et le repli lit bien le catalogue (`body.catalogue`, `ft-v1164`). |

⛔ **Rien d'autre n'est changé par ces décisions** : ni la table d'équivalences (A), ni le prompt du Worker (B), ni `Code.js` (F).

## 17. Registre et passation (règle d'or #19) — bloc à fournir (le connecteur Drive ne modifie pas un fichier existant, règle #18)

À ajouter au registre « SUIVI DES BUGS » puis à la passation maître, **sans rien effacer** : *IMPORT-IA-FIDELITE-01 — corrigé sur branche locale (base `e2b942f3`), **non poussée** ; non intégré, non publié, non vérifié iPhone. Causes : Worker à prompt ancien et sans validation ; lecture des repos ; deux filets ECH ; aperçu muet ; semaine sans date ; homonymes. **Corrections avant recette (02/11)** : **C** — les dropsets déjà enregistrés gardent leur chrono (l'enchaînement exige le marquage écrit `dropChaine`, posé par le seul nouvel import ; sonde identique à la production) ; **D** — des répétitions non écrites restent « Non renseigné » (`reps: null`), jamais un 10 inventé ; champ à compléter à la séance, validation refusée sans nombre. Preuves : B-IIF 121/0, B-IIC 58/0, IIF-W 196/0 ; mutations client 80, corpus 14/14, Worker 78/78 ; code publié 32 OK / 44 rouge, 48 / 10, 42 / 154. **Décisions de Michel consignées** : A synonymes (lot séparé) · B tableaux sans titre (attendre la recette IA) · C et D (faites) · E « max » = plafond (déjà conforme : le chrono est un maximum, `ft-v1030`) · F repli Apps Script conservé (pertes connues listées, §16). **Limites** : IA réelle et iPhone non testés ; règle 0 (documents sans « Séance N ») non mesurée ; abréviations et synonymes de coach non reconnus ; les trois PDF d'audit du 9 octobre (bibliothèque ChatGPT) **non lus**, à confronter à la règle du §4. Les jeux de test sont **entièrement inventés** (dépôt public).*

## 18. Les commits de la branche — base `e2b942f3`

| SHA | Contenu |
|---|---|
| `12fc8c11` | **Lot A** : le contrat d'import du Worker (`worker.js` : prompt rattrapé, réponse validée, catalogue lu) · banc `IIF-W` 196 témoins · 78 mutations |
| `864d6b33` | **Lots B et C + corrections C et D** (`log.js` · `constants.js` · `style.css` · `index.html` · `coach.js`) : repos lus comme écrits, UNE règle échauffement / travail, aperçu fidèle, semaine sans date, homonymes ; dropsets déjà enregistrés préservés (marquage `dropChaine`) ; reps non écrites = « Non renseigné » · banc `B-IIF` 121 témoins · 80 mutations |
| `674999c5` | jeux de test **entièrement inventés** (16 programmes) · banc `B-IIC` 58 témoins · 14 mutations · enregistrement des trois blocs dans la passe (`runner.js`, répartition en 3 processus) |
| *(ce commit)* | documents : ce dossier, inventaire, journal de partage |

↩️ **Retour arrière** : la branche n'a rien changé hors d'elle-même ; `master` reste `e2b942f3` (= `ft-v1263`). **Tout abandonner** : ne pas fusionner la branche. **Annuler un commit** : `git revert <sha>` (les commits sont dans l'ordre : Worker → client → jeux de test → documents). Les corrections C et D sont dans le code du client (mêmes fichiers que le reste du lot) : on ne les retire pas seules sans revoir `dropChaine` et `reps: null` ensemble.

## 19. Corrections C et D avant recette (02/11/2026) — GO de Michel « CORRECTIONS C/D AVANT RECETTE »

> Deux régressions bloquantes relevées à la relecture avant la recette, **corrigées seules** (aucun autre changement de comportement). Autorisations : corrections **OUI** · tests et mutations ciblés **OUI** · commits locaux **OUI** · tests IA réels payants **NON** · nouveau push **NON** · réécriture de branche **NON** · merge / publication / déploiement **NON** · D-031 complète **NON**.

### C — Dropsets déjà enregistrés : leur comportement est PRÉSERVÉ

* **Le défaut** — le premier jet de ce lot *déduisait* l'enchaînement des paliers du seul type « D » (palier sans repos propre). Or l'ancien import écrivait déjà des paliers « D », avec ou sans repos : le chrono d'un programme enregistré avant changeait **en silence**. Mesuré sur la première version de cette correction (sans marquage) : un ancien dropset sans repos (`rest 0`) enchaînait (`||130`) alors que la production donne `130|130|130`.
* **La règle de Michel** — une donnée ancienne ne reçoit **jamais** un comportement nouveau par simple déduction ; pour les futurs imports, un marquage **explicite**.
* **La correction** — un booléen OPTIONNEL `dropChaine: true` sur l'exercice, écrit par l'import et **par lui seul** quand le document donne un dropset (`setType` D, au moins 2 paliers : `_impDropEnchaine`, posé dans `_buildProgDay`) ; recopié par l'unique propriétaire `_recopierDropset` (séance, « Sauvegarder comme programme », programme à un jour) ; `toggleSet` n'enchaîne **que** si `dropChaine === true`. **Sans le marqueur : exactement le comportement d'avant ce lot.** Un repos écrit pour un palier (`set.rest > 0`) gagne toujours.
* **Preuves**
  * *Sonde de comportement identique* (hors dépôt, rejouée sur la production `e2b942f3` ET sur l'arbre de travail) : ancien dropset avec repos `180|180|180` · sans repos `130|130|130` · exercice suivant `90|90` · programmes d'avant chargés `[[10,12,10],[0 maxi]]` / `[[5,8]]` · série « maxi » validée `true` · ancien `reps: 0` validé `[true,10]` — **sortie identique octet pour octet**.
  * *Témoins* IIF-J01 → J10 : ancien avec repos · ancien sans repos · transition après · programme non réécrit ni marqué · nouvel import (marqueur sur LUI SEUL, repos sur le dernier palier, durée réelle au chrono) · repos écrit par palier respecté · aucun repos écrit · traversée de la sauvegarde en programme et du rechargement · aucune clé ailleurs.
  * *Rouge puis vert* : sur la première version (sans marquage) J03, J05 et J09 sont **rouges** (la régression, le marqueur absent) ; sur la production J01 → J04 sont **verts** (ce que les témoins disent de l'ancien est ce que la production fait).
  * *Mutations* M18 (réancrée), M47 → M52 : **7/7 tuées** (déduction rétablie, marqueur non écrit, non recopié, posé partout, posé sur un palier unique, repos écrit écrasé).
* **Limite dite** — un dropset importé AVANT garde son « repos entier entre paliers » (c'est le but) ; pour l'enchaînement, ré-importer le document. Les dropsets de l'outil de la séance (`ex.dropset`) ne sont pas concernés.

### D — Répétitions absentes : « Non renseigné », jamais un 10 inventé

* **Le défaut** — la production met **10** à la place de répétitions que le document n'écrit pas ; le premier jet de ce lot le *disait* dans la note (« 10 proposées, à corriger »). Michel : on ne transforme jamais l'absence de répétitions en 10, même signalé — un 10 enregistré finit par passer pour la prescription du coach.
* **La correction** (une **valeur** de plus d'un champ existant, aucun champ nouveau) — `_seriesImport` rend `null` ; le programme enregistré garde `reps: null` :
  * **Retiré** (R30, écrit dans le code) : `_impSignalerRepsAbsentes` et `repsDef`. Plus de 10, plus de note ajoutée.
  * **Aperçu** — « Non renseigné » dans le résumé et dans le détail série par série, plus une ligne d'explication sur la carte ; une série sans reps entre deux séries qui en ont reste « Non renseigné » (elle ne reprend pas les reps uniformes de l'exercice, même après correction d'un type dans l'aperçu).
  * **Éditeur de programme** — champ marqué (pointillé or, « ? ») et mention ; vider un champ = « Non renseigné » (et non 0, que la séance remplaçait par 10) ; « + série » copie « Non renseigné » ; retirer « maxi » sans nombre aussi.
  * **Séance** — champ **vide** à compléter (marqué) et bandeau « Non renseigné dans le programme » ; **✓ sans nombre = refus** (message, curseur ramené sur le champ, aucun repos lancé, rien d'enregistré) ; un nombre tapé, ou la suggestion grise visible dans le champ (la dernière fois, mécanisme de toutes les séries), est repris **à l'appui de ✓** ; la touche Entrée du champ de charge suit la même règle et laisse le curseur sur la série refusée.
  * **Fin de séance** — l'historique ne porte jamais `null` (les séries non faites valent 0) ; volume, 1RM et records ne comptent que le validé (`_workVol`, `_serieFaitFoiPourPR` ignoraient déjà les reps nulles — inchangés).
  * **Ailleurs** — « Sauvegarder comme programme » (plus de 5), feuille imprimée et PDF (« 3 × ? », « 8/?/8 »), analyse envoyée à Milo et résumé des programmes du contexte de Milo (« 3×? », jamais « 3×0 »).
* **Préservé exprès** — `reps: 0` et les séries « maxi » des programmes d'AVANT : mêmes valeurs à la séance (10 pour un jour, 5 pour un programme simple, « maxi » à 0 et validable) — sonde identique à la production (voir C). Un champ `reps` absent d'un vieux programme charge toujours 10.
* **Lecteurs de `reps` passés en revue** (aucun ne lit `null` comme un nombre) : volume · 1RM · records · intensité de séance · bandeau de l'exercice · colonne « Précédent » · papier / PDF · analyse de programme · contexte de Milo · export / sync de séance (rien n'écrit `null` dans l'historique). Les chargeurs de séances **de Milo** (`_startSessionFromMilo`, `_applyMiloSession`) ont leur propre décision (« 0 = Milo n'a rien dit ») : non touchés.
* **Preuves** — témoins IIF-K01 → K20 (programme enregistré, aperçu, matérialisation, retrait écrit, séance, validation refusée, nombre tapé, programme jamais écrit par la séance, suggestion, fin de séance, sauvegarde en programme, « + série », éditeur, données d'avant, papier / analyse / Milo, programme à un jour, touche Entrée) ; I01 réécrit (même invariant : des reps non écrites ne passent pas pour une prescription) ; le banc du corpus attend désormais `null` ; mutations M43 (réécrite), M53 → M80 + C06 du corpus. *Rouge puis vert* : sur le code d'avant la correction D, K01 → K15 sont **rouges** (K16, les données d'avant, est **verte** : c'est l'invariant).
* **Limites dites** — ① la suggestion grise (dernière séance) est reprise à l'appui de ✓ : c'est le mécanisme de toutes les séries, et elle n'est **jamais** écrite dans le programme ; ② un lecteur de `reps` oublié afficherait « null » ; ③ une autre version de l'app (cache d'un 2ᵉ appareil) qui lirait `reps: null` retombe sur l'ancien comportement (10), sans perte de donnée ; ④ `Code.js` (repli) rend aussi 0 pour une répétition non écrite : même résultat.

### Compteurs règle d'or #17 des seules corrections C et D (code applicatif : `log.js` · `constants.js` · `style.css` · `coach.js`)

| Compteur | Valeur |
|---|---|
| Données persistées ajoutées | **1** — `dropChaine` (booléen optionnel, uniquement sur un exercice importé qui est un dropset). `reps: null` est une **valeur** d'un champ existant, pas un champ. 0 clé de stockage, 0 migration. |
| Fichiers applicatifs touchés | **4** — `log.js` (+114 −50) · `constants.js` (+3 −0) · `style.css` (+9 −0) · `coach.js` (+1 −1) |
| Lignes ajoutées − retirées | **+127 − 51 = +76** (dont une majorité de commentaires « pourquoi », convention du projet) |
| Anciens chemins supprimés / fusionnés | **1** supprimé — `_impSignalerRepsAbsentes` + `repsDef` · **1** resserré — l'enchaînement d'un dropset à la séance (de « tout palier D » à « palier D d'un exercice marqué ») |

Bilan cumulé de la branche (vs `e2b942f3`) : **2** données persistées ajoutées (`restTxt`, `dropChaine`) · **6** fichiers applicatifs touchés (`log.js` +568 −161 · `worker.js` +379 −3 · `constants.js` +89 −24 · `style.css` +49 −0 · `index.html` +5 −2 · `coach.js` +1 −1) · **+1 091 − 191 = +900** · **7** anciens chemins supprimés ou fusionnés (les 6 du §12 + le signalement des reps).

## 20. Reprise du 08/11/2026 — « X - échauffement », repos en plage, séance facultative, commentaires (« GO CORRECTIF IMPORT PDF » de Michel)

> **Branche isolée `claude/import-pdf-fidelite-2026-11-08`** — base master `be04f04c` (`ft-v1265`) + ce lot (`59226805`, fusionné tel quel : `97a73641`) + la reprise. **Aucune fusion sur master, aucun déploiement du Worker, aucune migration de données, aucune publication** (interdictions de Michel). États : corrigé sur branche · **non intégré** · **non publié** · **non vérifié sur iPhone**. Décisions : **D-153** (plage = borne basse, Michel) et **D-154** (mécanique, Claude ; G3 / G4 à confirmer) · fiche de bug : `BUGS.md` §145 · études séparées : `docs/IMPORT-PDF-ETUDE-CONSIGNE-IA-2026-11-08.md` et `docs/IMPORT-PDF-ETUDE-TEXTE-DU-PDF-2026-11-08.md`.

**Pourquoi une reprise.** Le diagnostic en lecture seule du même jour, face au PDF réel de Michel (captures iPhone du 08/11), a trouvé quatre lacunes que ce lot ne couvrait pas : la forme **« X - échauffement »** (marqueur à la FIN du nom) n'était reconnue ni par master ni par ce lot (0 témoin) ; une **plage de repos « 4-5 min »** valait 0 s ; la **séance facultative** n'existait pas (fusion par numéro) ; un **commentaire importé** de plus de 300 caractères était coupé à la première frappe.

### 20.1 Ce qui a été fait, par priorité du GO

| # | Demande de Michel | Ce que fait le code | Témoins |
|---|---|---|---|
| 3 | Regrouper « X - échauffement » + « X » en UN exercice, séries d'échauffement et de travail distinctes | `_echNomQueue` : 3ᵉ forme de preuve (le mot À LA FIN, après un séparateur ; TOUT ce qui suit le séparateur ; balayage de droite à gauche). Branchée dans `_typesLigneImport` et `_nomBlocImport` (clé d'identité sans suffixe). Sans ligne de travail du même exercice derrière, rien n'est regroupé ni retypé | `IPDF-A01` à `A03`, `F01` à `F07` |
| 4 | Aperçu fidèle : charges, reps, top sets, back-offs, repos par série | L'aperçu par série vient du lot (§ 7) ; la reprise y ajoute le repos de plage « 4 min (écrit : 4-5 min) » et le décompte « ⚑ N repos écrits en plage » | `IPDF-B01`, `B02` |
| 5 | Plage « 4-5 min » → 4 min au chrono, consigne d'origine conservée et modifiable | `prop` (borne basse) dans `_reposLire` ; `_secRepos` — lu aussi par Milo — **ne change pas** ; `rest = prop` et `restTxt` conservé à la création ; éditeur « repos écrit dans le document » ; séance « chrono réglé sur 4:00 » ; « Régler » propose 4:00 et 5:00 | `IIF-R07`, `R08`, `B03`, `B05`, `B07b`, `IPDF-A04`, `C01` à `C03` |
| 6 | Quatre séances dont la facultative, et les commentaires | `_marqueSeance` : « facultative » / « bis » ne sont jamais collées à la séance de même numéro, le mot reste dans le libellé (fusion par numéro des sections d'une MÊME séance intacte) ; `_setProgExNote` : une note importée n'est plus coupée (2 000 ; 300 si tapée) | `IPDF-A05`, `A06`, `D01`, `E01` |
| — | Prompt du Worker | deux phrases : la séance facultative est une séance à part entière ; garder les DEUX lignes d'une forme « X - échauffement ». **Non déployé** | `IIF-W-N` (×2) |

**Jumeau de test.** Tout est **inventé** (le dépôt est public) : un document de 4 séances (3 + 1 « (facultative) »), des lignes « Développé Couché - échauffement » puis « Développé Couché » (idem soulevé de terre et squat), 5 échauffements puis 3 séries de travail, des repos « 4-5 min ». Seule la FORME du document de Michel est reprise, jamais ses valeurs.

### 20.2 Ce que cette reprise NE corrige PAS (à ne pas redécouvrir)

1. **Ce que l'IA rend.** Le client rattrape la forme du document avec ou sans l'aide du modèle ; une séance non lue ou un chiffre mal lu sur une image à 1 200 px restent la lecture du modèle. Voir les deux études : écho de contrôle, recoupement avec le texte du PDF.
2. **Sans le Worker, aucun repos n'arrive.** Le prompt publié n'a aucun champ repos : la plage « 4-5 min » ne s'affichera qu'après le déploiement du Worker (automatique à la fusion de `worker.js` sur master — `deploy-worker.yml`) : **GO distinct**.
3. **Au-delà de la 8ᵉ page, les pages sont ignorées sans un mot** (`_pdfToImages`). Décision de Michel du 07/10 (D-056 de la branche parquée `claude/import-programme-lot1-client`) jamais arrivée sur master : **non traité ici**, à décider.
4. **« Facultative » est un libellé** (G3) : le programme proposera cette séance comme les autres. **Un commentaire par série** n'existe pas au niveau programme (G4) : le commentaire reste celui de l'exercice.
5. **Une plage compte comme un repos écrit** : sa borne basse passe avant la préférence de l'exercice (`IIF-B07b`) — un exercice dont le texte n'écrit AUCUNE durée garde, lui, la préférence puis le réglage global (`IIF-B07`, `B08`).

### 20.3 Validation — ce qui a RÉELLEMENT tourné (08/11/2026, machine seule, sous le garde réseau)

| Niveau | Quoi | Résultat |
|---|---|---|
| **A — client, IA simulée** | `tools/banc_import_fidelite.js` : lecture des repos (`IIF-R*`, pur) ; chaîne document → programme → séance → **chrono réel**, aperçu, jumeau du PDF (blocs `B-IIF` et `P`) | **9 + 135 OK / 0 rouge** · sur le code d'AVANT la reprise (`97a73641`) : **22 rouges** (les témoins de la décision sur les plages, tous ceux du jumeau) |
| **A — Worker** | `tools/banc_import_worker_contrat.js` : le vrai `worker.js` conduit dans un `vm`, réseau simulé | **198 OK / 0 rouge** (196 d'origine + 2 pour les deux phrases ajoutées) |
| **B — corpus** | `tools/banc_import_corpus.js` : 16 programmes inventés, structure série par série, chrono de chaque série validée | **58 OK / 0 rouge** |
| **C — contre-tests** | `tools/mut_import_fidelite.py` (client, **96** : les 80 du lot — M14 et M21 ré-ancrées — + M81 à M96) · `tools/mut_import_corpus.py` (14, C03 réécrite) · `tools/mut_import_worker_contrat.py` (80, + M80 / M81) | **96/96** · **14/14** · **80/80** conformes (chaque mutation fait rougir au moins un témoin) |
| **Bancs voisins** | 40 bancs rejoués sous le garde réseau : import (`d088`, `import_echauffement`, `import_map`, `import_map2`, `import_map_alias`), séance et chrono, programmes, Milo, `nut_punch01` | **36 verts · 4 rouges (fig_face_dos, progres_seances, seance_ux, ux_integration) = les rouges déjà connus, identiques à master** (mêmes libellés : `PS-E29`, `B-UXI-G2/G3/G5/G7`, `B-FFD-⑧e`, plantage de `seance_ux`) |
| **Aperçu de démonstration** | clone de test isolé + réponse de l'IA **simulée** pour le jumeau inventé : aperçu, enregistrement (4 séances), séance (chrono 4:00 + consigne) à la taille d'un iPhone | conforme (Chromium 390 × 844 : **pas** une validation iPhone) |
| **Fusion à blanc** | cette branche + la tête d'« Autre activité » (`3bac5474`) | **0 conflit de code** ; conflits de suivi seulement : `BUGS.md`, `docs/DECISIONS.md`, `docs/INVENTAIRE.md`, `docs/JOURNAL-DE-PARTAGE.md` |
| **Non joué** | la passe D-031 **complète** (à jouer sur l'arbre à publier) ; l'IA réelle ; un iPhone | — |

*Historique honnête du contrôle* : au premier passage réel des bancs, **131 ✅ / 3 ❌** côté écran (`IIF-B07` et `B08` prenaient une plage pour « sans repos chiffré » ; `IPDF-F01` : « warm-up » contient un tiret, le séparateur coupait « up ») et **197 ✅ / 1 ❌** côté Worker (expression du témoin trop éloignée de la phrase exacte). Corrigés ; les mutations M14 et M21 ont été ré-ancrées parce que le code qu'elles visaient avait changé.

### 20.4 Compteurs règle d'or #17 de cette reprise (code applicatif uniquement, vs `97a73641`)

| Compteur | Valeur |
|---|---|
| Données persistées ajoutées | **0** (`restTxt` vient du lot ; `rest` porte désormais la borne basse d'une plage ; l'indication de l'éditeur n'est pas stockée) |
| Fichiers applicatifs touchés | **3** — `log.js` (+79 −18) · `constants.js` (+10 −0) · `worker.js` (+2 −2, non déployé) |
| Lignes ajoutées − retirées | **+91 − 20 = +71** (une majorité de commentaires « pourquoi ») |
| Anciens chemins supprimés / fusionnés | **1** remplacé — la règle du lot « une plage vaut 0 s » (consigne seulement) devient « une plage vaut sa borne basse » : un seul chemin, pas un second |

↩️ **Retour arrière** : la branche n'a rien changé hors d'elle-même ; `master` reste `be04f04c`. Aucune donnée n'est migrée : un programme importé par cette version garde ses champs `rest` et `restTxt` ; une version plus ancienne de l'app ignore `restTxt` et lit `rest` (un nombre).

## 21. Reprise du 13/11/2026 — re-vérifié sur le master actuel (`ft-v1266`), et un trou de plus fermé (« distinction É/N »)

> **Ordre de Michel du 13/11/2026** (« REPRISE IMPORT PDF / ÉCHAUFFEMENT EN PARALLÈLE ») : reprendre le chantier du 08/11 **sans le recommencer**, sur cette branche isolée, avec tests ciblés ; **aucun merge master, aucun déploiement, aucun changement du Worker de production** ; le chantier T-bis reste hors périmètre ; ne pas toucher aux fichiers de Claude N°1 (F2-A′) ni aux fichiers communs sans coordination. Coordination faite par message à Claude N°1 (13/11, périmètre : `log.js`, `constants.js`, `coach.js`, `index.html`, `style.css`, `worker.js` non déployé, tests et outils d'import ; aucun fichier de F2-A′). **États : corrigé sur branche · non intégré · non publié · non vérifié sur iPhone.**

### 21.1 Ce qui a été re-mesuré (arbres JETABLES : aucune référence git créée, rien écrit dans le dépôt)

| Quoi | Résultat (13/11/2026, machine seule sous garde réseau) |
|---|---|
| Fusion à blanc de `b1217e1b` avec master `fd8bf703` (`ft-v1266`) | **0 conflit de code** (`log.js`, `constants.js`, `coach.js`, `index.html`, `tests/parcours/runner.js`, `repartition-3.json` se fusionnent seuls) ; 4 fichiers de SUIVI à réconcilier : `BUGS.md`, `docs/DECISIONS.md`, `docs/INVENTAIRE.md`, `docs/JOURNAL-DE-PARTAGE.md` |
| 3 bancs d'import, branche telle quelle (`b1217e1b`) | **144 OK / 0** · **58 / 0** · **198 / 0** — identiques au 08/11 |
| 3 bancs d'import, arbre fusionné avec master, **avant** le correctif du § 21.3 | **144 / 0** · **58 / 0** · **198 / 0** |
| 3 bancs d'import, arbre fusionné avec master, **avec** le correctif du § 21.3 (`9b19f2ee`) | **148 / 0** · **58 / 0** · **198 / 0** |
| 40 bancs voisins de la liste du 08/11, arbre fusionné (sans le correctif du § 21.3) | **36 verts** (dont 3 qui n'impriment pas de total, code 0) · **3** avec des rouges **déjà connus** (`B-FFD-⑧e`, `PS-E29`, `B-UXI-G2/G3/G5/G7`) · **1** plantage connu (`seance_ux`) : même bilan qu'au 08/11, rien de nouveau. Master non rejoué aujourd'hui. |

### 21.2 Sonde « ancien Worker » — ce qu'un test de l'app SEULE (Worker publié inchangé) montrerait

Le prompt du Worker publié (`PROG_PROMPT`, 2 885 caractères) sait déjà rendre `repsPerSet` / `kgPerSet` ; il n'a **aucun champ repos**, interdit `setType` « W » et range « échauffement » dans la NOTE. La MÊME réponse inventée (forme du PDF de Michel : lignes « X - échauffement » puis « X », une séance facultative), sans aucun repos, passée dans le client des deux arbres :

| | master publié (`ft-v1266`) | candidat (branche fusionnée) |
|---|---|---|
| Exercices pour les 4 séances | 8 (deux cartes par mouvement) | **5** (un exercice par mouvement) |
| Développé couché | « … - échauffement » 5 × « 0 reps » + « Développé Couché » 3 × « 0 reps », proposition « Rattacher… Oui / Non » sur l'échauffement | **UN exercice de 8 séries, types ÉÉÉÉÉNNN**, charges 0·40·55·70·80 puis 90·85·85, reps 10·5·3·1·1 puis 2·3·3 |
| Reps absentes (soulevé de terre, échauffement) | aperçu « 5×0 reps » **mais 10 reps enregistrées** (valeur inventée) | **« Non renseigné »**, rien d'inventé |
| Séance facultative | gardée (numéro 4 distinct) | gardée, libellé intact |
| Repos | 0 enregistré → chrono 90 s (réglage global) | **identique : « repos non précisé », chrono 90 s** (échauffements 45 s puis 90 s : règle de palier existante) |

⚠️ **Conclusion à ne pas déformer** : avec le Worker publié, l'app seule corrige le regroupement, la distinction É/N, les charges et reps et le « 5×0 » — **elle ne peut pas corriger les repos** : aucun champ repos n'arrive. Variante B de la sonde : même « repos 4-5 min » écrit seulement dans la NOTE de l'exercice → il n'est pas lu comme un repos (par construction : on ne devine pas une durée dans une note). Les repos « 4-5 min » → 4:00 exigent le déploiement du Worker (GO distinct, `deploy-worker.yml`).

### 21.3 Un trou trouvé et fermé : « ✓ Oui » au rattachement PUIS « Regrouper » retypait les échauffements en séries de travail

Sonde de noms voisins (14 paires, tout inventé) : 8 paires se regroupent dès l'analyse (« Dév. couché », « Squat » / « Squat à la Barre », matériel d'un seul côté, casse, marqueur en tête, parenthèse, « warm-up »). Trois paires difficiles ne se regroupent pas — **par construction (R29)** : « Tirage poitrine » / « Tirage vertical prise large », « Dc incline » / « Développé Incliné Haltères », « Barre » / « Rowing Barre » : des noms différents ne sont jamais fusionnés d'office. Une paire (« Squats - échauffement » / « Squat à la Barre ») tombe dans le cas prévu par le lot (le catalogue PROPOSE « ≈ Rattacher à Squat à la Barre ? » ET le regroupement est PROPOSÉ à la personne) — et y révélait un défaut réel :

- **« Regrouper » puis « Oui »** → UN exercice de 6 séries, types **ÉÉÉNNN** ✓ ;
- **« Oui » puis « Regrouper »** → UN exercice de 6 séries, types **NNNNNN** ✗ : le « Oui » remplace le nom (le marqueur « - échauffement » disparaît avec lui) et `_typesLigneImport` ne lisait que le nom COURANT. Les échauffements devenaient des séries de travail, **sans un mot**.

**Correctif** (`log.js`, `_typesLigneImport`) : la preuve se lit dans le nom ÉCRIT dans le document — `_vmFrom` quand un rattachement (accepté ou automatique) a remplacé le nom. Le résultat ne dépend plus de l'ordre des gestes. **Aucune donnée persistée, aucun regroupement d'office de plus** (la proposition reste une proposition ; « Garder séparés » reste respecté).

### 21.4 Validation de ce correctif

| Niveau | Quoi | Résultat |
|---|---|---|
| Témoins | `IPDF-G00` (le scénario est celui voulu) · `IPDF-G01` (« Oui » puis « Regrouper » = ÉÉÉNNN) · `IPDF-G02` (l'autre ordre, même résultat) · `IPDF-G03` (« Garder séparés » respecté, NNN + NNN) | **avant le correctif : 138 OK / 1 rouge (`IPDF-G01`, types « NNNNNN »)** · **après : 148 OK / 0** |
| Bancs voisins du lot | corpus · contrat Worker | **58 / 0** · **198 / 0** (inchangés) |
| Contrôle négatif | `tools/mut_import_fidelite.py` : M97 (nouvelle) fait rougir `IPDF-G01` ; M81 ré-ancrée sur la ligne modifiée | **97/97 conformes** (M01–M09 jouées avant la coupure du serveur du 13/11, M10–M97 après) · corpus **14/14** · Worker **80/80** ; M97 fait rougir `IPDF-G01` (1 rouge, le bon), M81 ré-ancrée sur la ligne modifiée |

### 21.5 Compteurs règle d'or #17 de cette reprise (code applicatif uniquement, vs `b1217e1b`)

| Compteur | Valeur |
|---|---|
| Données persistées ajoutées | **0** |
| Fichiers applicatifs touchés | **1** — `log.js` (+6 −1) |
| Lignes ajoutées − retirées | **+5** (dont 4 lignes de commentaire « pourquoi ») |
| Anciens chemins supprimés / fusionnés | **0** (une lecture de nom devient « nom écrit, sinon nom courant » : même fonction, pas de second chemin) |

### 21.6 Ce que cette reprise ne change PAS (à ne pas redécouvrir)

1. **Les repos n'arrivent qu'avec le Worker déployé** (§ 21.2) : GO distinct de Michel, aucun changement de Worker de production n'est fait ici.
2. **Au-delà de la 8ᵉ page, les pages restent ignorées sans un mot** (`_pdfToImages`, `MAX_PAGES=8`) alors que Michel a tranché le 07/10 « jamais silencieuse : refusé avec un message clair, jamais tronqué ». ⚠️ Cette décision porte le numéro **D-056 sur la branche parquée** `claude/import-programme-lot1-client`, mais **D-056 sur master = IMPORT-MAP-02 (Fentes)** : désigner la décision par son énoncé. Une page ignorée peut être la séance facultative.
3. **Un test réel de l'IA ne peut pas se faire hors de l'origine de production** : le Worker refuse toute autre origine (`ALLOWED_ORIGIN`, réponse 403) et le clone coupe le réseau vers lui. Il faut l'app publiée (P-A) ou un Worker de test — aucun n'existe dans le dépôt (`wrangler.toml` ne nomme que `dry-field-e931`).
4. **G3** (séance facultative = libellé seul), **G4** (commentaire par série = commentaire de l'exercice), **G5** (texte du PDF envoyé à l'IA), **Q5** (le PDF de Michel a-t-il un texte sélectionnable ?) : toujours en attente de Michel.
5. **Historique de la branche** : les commits `c187c066` et `23ffa132` gardent des charges de développé couché reprises des captures de Michel (remplacées ensuite par des valeurs inventées). Aucune réécriture n'est faite (ni rebase, ni force-push) : décision de Michel.
