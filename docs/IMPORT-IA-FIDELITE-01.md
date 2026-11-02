# 📥 IMPORT-IA-FIDELITE-01 — le programme importé ressemble au document, et la séance le suit

> **Claude Séance (« Claude N°2 », session-C) · 02/11/2026 · GO de Michel** (« GO CORRECTION IMPORT IA + RECONNAISSANCE EXERCICES + CHRONOMÈTRE + UX »).
> **État (règle d'or #19, quatre états jamais confondus)** : ✅ *corrigé sur branche* (`claude/import-ia-fidelite-01`, base `e2b942f3` = prod `ft-v1263`) ·
> ⛔ *intégré* : non · ⛔ *publié* : non (aucun push, aucun merge, aucun déploiement Worker / Apps Script) · ⛔ *vérifié sur iPhone* : non.
> Critère de Michel : *« il ne suffit pas qu'un import « semble correct » : le programme doit être fidèle au document, et la séance, chronomètre compris, doit
> fonctionner réellement selon les données importées. »*

## 0. En une minute

| | |
|---|---|
| **Le défaut mesuré** | Sur le code publié, importer le programme d'un coach qui écrit « 3 mins », « 1.30 mins » ou « 2 min max » donnait **0 repos** (la séance prenait 130 s partout) ; les lignes d'échauffement d'un programme à colonne ECH/TRAV restaient des exercices séparés ou se recollaient au hasard ; une plage de repos (« 3-4 min ») disparaissait ; l'aperçu ne montrait ni les échauffements ni les repos ; un programme sans date affichait « Semaine 1/4 ». |
| **Ce qui change** | Le Worker (la route VIVANTE de l'import) a un contrat complet et validé ; le client lit les repos comme les coachs les écrivent, regroupe échauffement + travail par **une seule règle** (avec proposition à confirmer quand l'identité est incertaine), montre un aperçu fidèle, ne fabrique plus de « Semaine 1/N », distingue deux programmes homonymes. |
| **Preuve** | Sur 19 programmes (7 RÉELS anonymisés + 12 méthodes synthétiques) passés par la vraie chaîne : programme enregistré **série par série** identique à l'attendu, chrono **exact** pour chaque série validée. Sur le code publié : 12 témoins rouges sur 67 (dont **0 repos ferme** sur le programme du 10 mars). |
| **Reste à faire** | Recette avec l'IA RÉELLE puis sur iPhone (non faites : interdites ici) · 6 décisions pour Michel (§16). |

## 1. Sources lues — et celles qui MANQUENT (règle d'or #16 : dire exactement)

| Document demandé | Résultat |
|---|---|
| `FORCE_TRACKER_PREPA_ONGLET_SEANCE_2026-10-03.md` | ✅ lu (Drive, lecture seule). Règles reprises : **§2** la fidélité au document prime ; **§18** quatre statuts par élément (`COMPRIS_STRUCTURÉ` · `COMPRIS_MAIS_NOTE` · `PARTIELLEMENT_REPRÉSENTABLE` · `NON_REPRÉSENTABLE`) et la liste « jamais » (supprimer en silence, rest-pause → série droite, superset → deux exercices indépendants, perdre tempo / repos / côté / charge / ordre) ; **§10** critères d'acceptation. |
| `IMPORT-PHASE2-AUDIT-IDENTITE-ECH-2026-10-09.pdf` | ⛔ **INTROUVABLE** — recherche par titre dans le Drive : 0 résultat ; absent du dépôt et de l'environnement. |
| `ADDENDUM-ECHAUFFEMENT-3-PROGRAMMES-2026-10-09.pdf` | ⛔ **INTROUVABLE** (même recherche). |
| `SPEC-IMPORT-PROGRAMME-2026-10-07.pdf` | ⛔ **INTROUVABLE** (même recherche). |

**Conséquence assumée** : la règle d'identité échauffement / travail est celle du **texte de la mission** (cas J3B, « jamais de fusion sur une simple ressemblance », « matériels potentiellement distincts = vérification ») et de ce que le dépôt contient (`IMPORT-ECH-01`, `ft-v1156`, `docs/PLAN-CONTRAT-IMPORTS.md`, `docs/CHANTIER-IMPORTS.md`). Rien n'a été déduit de documents qu'on n'a pas pu lire. Si ces trois PDF existent ailleurs, **ils sont à confronter** à la règle du §4.

**Corpus** : programmes de coachs réels (6) et programme d'IA (1, Powerbuilding Bloc 1 V2, colonne ECH/TRAV) transcrits depuis le Drive en **lecture seule**, puis **anonymisés** (prénoms, pseudos, marque et nom du coach retirés de tous les champs ; aucun lien ni identifiant). Les programmes d'autres personnes suivies (Tatiana, Laurence, Christophe, Emma) n'ont **pas** été utilisés : ce sont des données personnelles ; leurs méthodes sont couvertes par 12 programmes synthétiques. Le PDF « Force Recomposition 6 semaines » n'est pas l'original Powerbuilding et n'a pas servi.

## 2. La chaîne, et les causes racines retirées

`document → IA (Worker) → extraction → normalisation → regroupement ECH/TRAV → reconnaissance → aperçu → programme enregistré → séance → chrono`

| # | Cause racine **mesurée** | Où | Retirée par |
|---|---|---|---|
| 1 | Le Worker portait une **copie ANCIENNE** du prompt de `Code.js` (2 822 caractères contre 9 832) : ni colonne ECH/TRAV, ni repos, ni anti-invention de date (son exemple portait `weeks:7, startDate:"2026-03-23"`, recopiable), il ne lisait pas `body.catalogue` | `worker.js` | Lot A : prompt rattrapé (parité testée phrase par phrase) + fidélité d'abord |
| 2 | **Aucune validation** de la réponse du modèle (réponse tronquée par `max_tokens` acceptée ; un guillemet « » dans une note faisait échouer tout l'import) | `worker.js` | `_normaliserProgramme`, `_jsonProgrammeLisible`, `callClaudeDiag` |
| 3 | `_secRepos` ne lisait pas l'écriture des coachs : « 3 mins » → 0 (pluriel), « 1.30 mins » → 0, « 2 min max » → 0, « 1 . 15 min » → 0 ; une plage perdait son texte | `constants.js` | `_reposLire` (une seule lecture, conventions écrites §5) |
| 4 | **Deux filets** de regroupement échauffement / travail qui ne se contredisaient que par chance ; « Monté en charge » (la faute du coach) et « Série de chauffe » invisibles ; « X » + « X / haltères » fusionnés d'office | `log.js` | `_mergeImportBlocsEch` + `_identiteBlocImport` (trois réponses : *même* · *à vérifier* · *autre*) |
| 5 | Deux jours « Semaine A / Semaine B » du même numéro **collés** en une séance | `log.js` | garde A/B dans `_mergeImportSeances` |
| 6 | Un dropset importé = un repos ENTIER entre deux paliers ; un repos recopié sur chaque palier cassait aussi l'enchaînement | `log.js` | `_dsImporte` (séance) + `_restBrutSerieImport` (import) |
| 7 | L'aperçu n'affichait ni échauffements, ni repos, ni statut ; une **silhouette** de muscle se faisait passer pour une reconnaissance | `log.js` | `_renderImpConfirm` refait (§7) |
| 8 | « Semaine 1 / N » fabriquée sans date de début ; `shiftProgStart` posait **la date du jour** | `log.js` | carte « Date de début à définir », bouton explicite « Aujourd'hui » |
| 9 | Remplacement d'un programme **sur le seul nom** (deux programmes homonymes indistinguables) | `log.js` | `_descProg` + confirmation nommant la cible |
| 10 | `specialSets` (séries en couleur) **jeté en silence** | `log.js` | `_impConserverSpeciales` |
| 11 | Un « 10 reps » inventé par l'app passait pour la prescription du coach ; ce que le serveur écarte n'était pas dit | `log.js` | `_seriesImport` (`repsDef`), `_impSignalerRepsAbsentes`, `_impPertes` |
| 12 | Le **matériel écrit dans la NOTE** (« Front Squat » + « Smith machine ») n'était pas lu : rattachement d'office à la barre | `log.js` | `_materielNoteContredit` |

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
| Développé couché : 4 ECH + 3 travail | **un** exercice de 7 séries `ÉÉÉÉNNN`, charges / reps / repos par série conservés | IIF-A01, D01 · corpus C01 |
| Repos du travail ne déborde pas sur les échauffements | 0, 0, 90, 120, puis les repos du travail | IIF-D01b, D01c |
| Preuve par colonne structurée / par note / absente | regroupé · regroupé · **deux lignes restent deux exercices** | IIF-A01 / D02 / D03 |
| « Montée en charge » ET « Monté en charge » ; « Série de chauffe » | preuves valides (la faute du coach réel est lue) | IIF-D04, D05 |
| Échauffement isolé (aucun travail derrière) | reste un exercice, sa série conservée | IIF-D06 |
| « Squat » (échauffement) puis « Squat Bulgare » | **deux** mouvements, jamais fusionnés, **jamais proposés** | IIF-D07 |
| Développé militaire barre puis haltères | matériels contradictoires : jamais fusionnés ni proposés | IIF-D08 |
| Exercice intercalé | le bloc est coupé | IIF-D09 |
| Marqueur dans le nom | regroupé | IIF-D10 |
| Matériel écrit d'un côté seulement (« Développé militaire » / « … haltères ») | **proposition**, jamais fusion d'office | IIF-D11 |
| **J3B** : « Dev. épaules guidé » ×2 puis « Dev. épaules guidé / haltères » | proposition ; une fois confirmée : **un exercice de 5 séries** `ÉÉNNN` ; refusée : deux exercices ; l'étiquette différente ne bloque pas un regroupement légitime ; l'ancien format du Worker donne le même résultat | IIF-E01 → E06 · corpus C01, IIC-L01 |
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
| **`2 min max` · `repos 30 sec maxi` · `1.15 min max`** | 120 / 30 / 75 s | un **plafond** : le chiffre écrit EST le repos (la colonne s'intitule « Repos maximum ») — mesuré sur 3 programmes de coachs, ~70 repos |
| `environ 90 s` · `~2 min` | 90 / 120 s | |
| **`1 . 15 min`** | 75 s | blanc d'extraction d'un PDF recollé |
| `2` (entier seul) | 120 s | 1 à 9 = minutes ; 10–14 ambigu (texte conservé, rien appliqué) ; ≥ 15 = secondes |
| **`60-90 s` · `3-4 min` · `2 à 3 mins` · `2 -3 mins` · `30/40 sec`** | **aucun repos** — `rest` 0, bornes lues, **texte écrit CONSERVÉ** | jamais « 90 / 120 / 180 » inventé |
| `1.15/30 min` | texte conservé, rien appliqué | borne haute > 5× la basse : pas une plage |
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
| Dropset | aucun repos entre les paliers, le repos écrit **à la fin** | IIF-C02 · corpus C04, C05 |
| Écart entre donnée stockée et durée utilisée | **mesuré sur les 19 fixtures** (série par série) : 0 | IIC-*-CHRONO |

**Démonstration « repos enregistré → chrono »** (programmes RÉELS anonymisés, séance chargée puis chaque série validée dans l'ordre ; colonne de droite = la durée **réellement passée à `startRest`**) :

```
C02 septembre · « Dos et Biceps »
  Soulever de terre   S1…S7  N   repos enregistré 180 s  → chrono 180 s   (×7)
  Rowing Barre        S1…S4  N   repos enregistré 120 s  → chrono 120 s   (×4)
  Pull-over Poulie    S1…S3  N   repos enregistré  90 s  → chrono  90 s   (×3)
  Curl EZ             S1…S4  N   repos enregistré 120 s  → chrono 120 s   (×4)
  Curl poulie Corde   S1…S4  N   repos enregistré  90 s  → chrono  90 s   (×4)
C01 Powerbuilding · J1 « Développé couché » (colonne ECH / TRAV, UN exercice de 7 séries)
  S1 É  50 kg × 5   « 60-90 s » (plage)  → chrono  45 s   (échauffement, défaut de l'app)
  S2 É  65 kg × 3   « 60-90 s » (plage)  → chrono 120 s   (palier : le suivant est plus lourd)
  S3 É  80 kg × 2   90 s                 → chrono  90 s
  S4 É  85 kg × 1   120 s                → chrono 120 s
  S5…S7 N  90 kg × 3  « 3-4 min » (plage) → chrono 130 s + consigne « 3-4 min » affichée (réglage de la personne)
```

## 6. Reconnaissance des exercices (A reconnu · B ambigu · C inconnu)

* **A — reconnu** : rattaché d'office (palier « auto » du rapprocheur existant), nom du catalogue, **vraie illustration**. **B — ambigu** : *proposé* (« À confirmer »), le nom du document est **gardé** tant que la personne n'a pas dit oui. **C — inconnu** : nom gardé, annoncé « Sera créé · exercice perso », avec l'aveu « aucune illustration » — **jamais une silhouette de muscle** qui ferait croire à une reconnaissance (IIF-F02, F03, F09).
* **Garde-fous IMPORT-MAP-01 / 01B / 02 conservés** (aucun rattachement automatique squat machine → barre, poulie → haltères, Smith → libre : IIF-F05). Aucun exercice perso n'est créé avant « Importer » (IIF-F04).
* **Nouveau** : le matériel écrit dans la **note** est lu (`_materielNoteContredit`) : « Front Squat » + « Smith machine » devient une **proposition** au lieu d'un rattachement d'office à la barre (IIF-I03). Une note qui dit « barre » ne contredit pas une cible non marquée (IIF-I05).
* **Mesure sur le corpus** (114 exercices dont le catalogue a l'équivalent) : **66 reconnus d'office + 10 proposés avec la BONNE cible = 76** ; 8 proposés avec une autre cible (à refuser) ; **30 non reconnus** → créés comme exercices perso. Plancher du banc : 76.
* ⚠️ **Limite mesurée, NON corrigée** : les 30 manqués sont des **abréviations de coach** (« Dv », « DC », « Dev. », « Sdt Jambes tendu ») et des **synonymes** (« allongé » = couché, « Papillon machine » = pec deck, « Roulette à abdominaux » = roue abdominale, « Presse incliné », « Pompe »). L'enrichissement de la table d'équivalences est une décision à part (§16) : *un synonyme faux redirige un exercice en silence et coupe un historique en deux* — la règle de `ft-v1170` (« on n'ajoute que ce qui est mesuré sur un vrai document, cible unique vérifiée ») s'applique.
* ⚠️ **Limite connue, nommée dans le banc** : une **variante écrite dans la note** qui n'est pas un matériel (« Curl haltère » + « Prise marto ») est rattachée à « Curl Haltères » (la prise est conservée dans la note, pas lue). Une limite nommée fait rougir le banc si elle **disparaît ou si une autre apparaît** (IIC-Z02).

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

Non couvert par le corpus (texte seul) : couleurs, images, vidéos ; AMRAP / EMOM / giant sets / BFR / clusters (aucun exemple réel) — **rien n'est affirmé** à leur sujet.

## 10. Validation (mission §10) — ce qui a RÉELLEMENT tourné

| Niveau | Quoi | Résultat |
|---|---|---|
| **A — déterministe, IA simulée** | banc client `B-IIF` (`tools/banc_import_fidelite.js`) : lecture des repos, chaîne document → programme → séance → **chrono réel** (espion sur `startRest`), regroupement, aperçu, calendrier, homonymes, corpus-dérivés | **91 OK / 0 rouge** · sur le code publié `ft-v1263` : **27 OK / 36 rouge** (les sections qui plantent sur l'ancien code s'arrêtent à leur première erreur, nommée : 63 témoins joués sur 91) |
| **A — Worker** | banc `IIF-W` (`tools/banc_import_worker_contrat.js`) : le vrai `worker.js` conduit dans un `vm`, réseau simulé, horloge figée, 3 fuseaux | **196 OK / 0 rouge** · sur le `worker.js` publié : **42 OK / 154 rouge** |
| **B — corpus** | banc `B-IIC` (`tools/banc_import_corpus.js`) : 19 fixtures, structure série par série, reconnaissance, **chrono de chaque série validée** | **67 OK / 0 rouge** · sur le code publié : **55 OK / 12 rouge** (les 6 programmes de coachs et C01 ne sont PAS fidèles sur le code publié ; **0 repos ferme lu** sur C04) |
| **C — contre-tests** | mutations sur arbre copié : client `tools/mut_import_fidelite.py` (46), corpus `tools/mut_import_corpus.py` (14), Worker `tools/mut_import_worker_contrat.py` (78) | voir §10 bis |
| **D — IA réelle + iPhone** | **non faits** (interdits : tests IA payants, publication, déploiement) | protocole §14 |

### 10 bis — contrôle négatif (rempli à la clôture)

| Outil | Mutations (chacune REMET un défaut supprimé ou RETIRE une protection ajoutée) | Résultat |
|---|---|---|
| `tools/mut_import_fidelite.py` (client) | **46** — lecture des repos (M01–M05, M38–M41) · transport du texte de repos (M06–M09) · identité et regroupement échauffement / travail (M10–M17) · chrono, consigne, « Régler » (M18–M22) · aperçu, calendrier, homonymes (M23–M31) · séries en couleur, ambigu, confort téléphone (M32–M37) · matériel dans la note, reps non écrites, pertes dites (M42–M45) · données de la personne protégées (M46) | **46/46 tuées** : campagne complète sur l'arbre `36110085` (44/45, M03 réancrée puis rejouée seule : tuée) ; M46 ajoutée ensuite, rejouée seule : tuée |
| `tools/mut_import_corpus.py` (corpus) | **14** — plafond « max », blanc de PDF, plage inventée, repos uniforme d'un dropset, matériel de la note, reps non écrites, suggestion appliquée d'office, type « É » non traduit, regroupement non appelé, `restTxt` perdu (programme et séance), dropset non enchaîné, superset perdu, inconnu non annoncé | **14/14 tuées** — campagne complète rejouée sur l'arbre `1f1363b4` |
| `tools/mut_import_worker_contrat.py` (Worker) | **78** (76 « GARDE » + 2 « NEUTRE ») | **78/78 conformes** : les 76 GARDE font rougir le banc, les 2 NEUTRE (changements que le contrat tolère) le laissent vert ; banc sain vert avant (3 fuseaux) et après ; dépôt intact (empreinte) |
| Témoin du runner réécrit (CCLVI) | appel de `_mergeImportBlocsEch` retiré de l'extraction | **1 rouge** (« le chemin d'extraction APPELLE la fusion, et AVANT le rattachement VM ») |

*Historique honnête du contrôle* : au premier passage 36/37 — la mutation M12 laissait le banc vert parce qu'elle ne changeait rien (les mots sont triés avant comparaison) : réécrite pour viser le vrai garde, tuée. Côté corpus : C13, C15 et C16 étaient neutres sur 19 programmes (déjà tuées par M14, M07, M08 du banc client) → retirées au lieu d'être déclarées couvertes ; C14 survivait (le texte de la plage n'était pas comparé à la séance) → témoin renforcé, tuée ; C07 avait une ancre double → désambiguïsée.

### Bancs voisins

Rejoués **un par un, sur l'arbre final**, sous le garde réseau (`tools/sous_garde.sh`) — tous les bancs qui exercent `_buildProgDay`, `finalImportProg`, `_secRepos`, `toggleSet`, `startRest`, `_loadProgDayVraiment`, `shiftProgStart` ou `openProgModal` :

| Bancs | Résultat |
|---|---|
| **Import** : `d088` 52 · `import_echauffement` 11 · `import_map` 22 · `import_map2` 43 · `import_map_alias` 22 | ✅ 0 rouge — les garde-fous IMPORT-MAP-01 / 01B / 02 et le filet IMPORT-ECH-01 tiennent |
| **Séance / chrono** : `p02_triceps` 23 · `cc01_dropset` 31 · `rir_superset` 52 · `seance_repos` 61 · `seance_c1` 29 · `seance_c2` 22 · `seance_c3` 35 · `seance_chiffres` 102 · `seance_unicite` 12 · `seance_date` 25 · `seance_recette` 93 · `session_integrity` 93 · `travail_lot2` 48 · `ux_d086` 122 · `picker_vignettes` 20 · `aides_audit` 18 · `debrief_provenance` 24 · `nut_punch01` 36 | ✅ 0 rouge |
| **Les trois bancs de ce lot** : `import_fidelite` 91 · `import_corpus` 67 · `import_worker_contrat` 196 | ✅ 0 rouge |
| **Témoins « de source » de la passe** (queue synchrone du runner : 67 appels, dont les 3 de ce lot) | ✅ 793 OK / 0 rouge |
| **Passe réduite** (installation + gouvernance D031S, dont « aucun NOUVEAU point d'entrée Playwright sans garde » + le bloc CCLVI réécrit) | ✅ 63 OK / 0 rouge |
| `seance_ux` (PLANTAGE `page.click` : délai de 3 s) · `progres_seances` (PS-E29, 1 rouge) · `ux_integration` (G2, G3, G5, G7) · `fig_face_dos` (FFD-⑧e, 1 rouge) | ⚠️ **rouges à l'IDENTIQUE sur la version publiée `e2b942f3`** (mêmes témoins, mêmes valeurs, rejoués sur une copie du code publié) : **pré-existants, pas causés par ce lot** — à ne pas confondre avec une régression |

⛔ **Non joué** : la passe D-031 **complète** (non autorisée ; à réserver à la prépublication, sur arbre figé — et après refusion des branches concurrentes, §13-1). Sont aussi pré-existants et sans rapport : `check_regles.py` signale « DOSSIER-ATHLETE-SUIVI.md : le tableau des 8 briques est PÉRIMÉ » à l'identique sur le code publié.

## 11. Protection des données (mission §11) — respectée

Aucune donnée utilisateur lue ni modifiée · aucun programme existant touché (le programme Powerbuilding enregistré de Michel n'est **pas** réparé) · aucune réimportation automatique · aucun exercice perso supprimé ni fusionné · aucune séance, aucun record, aucune charge historique modifiés · aucune préférence de repos écrasée par un import (IIF-B09) · aucune migration · « local d'abord » intact (l'import écrit après « Importer », jamais avant).

## 12. Compteurs règle d'or #17 (code applicatif uniquement)

| Compteur (code applicatif : `worker.js` · `constants.js` · `log.js` · `index.html` · `style.css`) | Valeur |
|---|---|
| **Données persistées ajoutées** | **1** — `restTxt` : le texte du repos écrit, **uniquement** pour une plage ou un texte, champ OPTIONNEL sur chaque série d'un programme et d'une séance. **0** clé de stockage, **0** migration (un programme existant sans `restTxt` se comporte comme avant). |
| **Fichiers applicatifs touchés** | **5** (aucun fichier applicatif créé ; les 19 fichiers créés sont des tests, outils et documents) |
| **Lignes ajoutées − retirées** | **+997 − 173 = +824** (`log.js` +487 −144 · `worker.js` +379 −3 · `constants.js` +86 −24 · `style.css` +40 −0 · `index.html` +5 −2). Dans `worker.js` : 188 lignes de code, 96 de texte de prompt, 75 de commentaires « pourquoi » (convention du projet). |
| **Anciens chemins supprimés / fusionnés** | **6** — ① le 1ᵉʳ filet échauffement (`_mergeImportEchauffements` + `_fusionneEch`) fusionné dans `_mergeImportBlocsEch` · ② `_impThumb` (vignette à silhouette) remplacée par `_impIllu` · ③ l'ancienne copie du prompt du Worker et son appel texte seul · ④ la 2ᵉ lecture des séries de `_buildProgDay`, fusionnée dans `_seriesImport` (aperçu = enregistrement) · ⑤ le corps de `_secRepos`, fusionné dans `_reposLire` (le point d'entrée reste) · ⑥ le chemin de `shiftProgStart` qui posait la date du jour |

⚖️ **Bénéfice / coût (règle d'or #17)** : le bénéfice est mesuré (396 repos écrits sur 396 lus au lieu de 174, 125 textes de plage conservés au lieu de 0, programme fidèle série par série sur 19 programmes) ; le coût architectural est borné (une donnée optionnelle, deux propriétaires uniques remplaçant des doublons : un filet de regroupement au lieu de deux, une lecture des séries au lieu de deux). Tout témoin réécrit rougit sous mutation volontaire (§10 bis ; le témoin CCLVI du runner, réécrit parce que le 1ᵉʳ filet n'existe plus, rougit quand l'appel du filet unique est retiré).

## 13. Risques de régression (à relire avant fusion)

1. **Fusion avec `claude/workout-core-01`, `claude/seance-hl-01`, `claude/seance-hl-04-02`** : essai de fusion fait (`git merge-tree`) → **un seul conflit dans `log.js`**, 5 lignes dans `startRest` (mon crochet `_restConsigneMontrer()`), plus `docs/JOURNAL-DE-PARTAGE.md`. Aucun conflit sur `constants.js` (les branches Nutrition touchent d'autres zones). `worker.js` : aucune branche concurrente. *La session qui publie en dernier refusionne, vérifie les témoins et relance la passe* (protocole deux sessions).
2. **Dropsets déjà enregistrés** (séries de type D, repos 0) : ils **s'enchaînent** désormais (aucun repos entre paliers, le repos à la fin) — conforme à l'outil de dropset de la séance, mais c'est un changement de comportement pour des programmes existants (décision §16-C). Un repos explicite sur un palier gagne toujours.
3. **`_secRepos` lit plus de valeurs** qu'avant (« 2 min max », « environ 90 s ») : un programme existant qui contenait un tel texte dans `rest` est désormais lu en secondes (amélioration, rare).
4. **« X » + « X / haltères »** n'est plus fusionné d'office (proposition) — c'est le cas J3B voulu par la mission.
5. **Séries sans nombre** : `_buildProgDay` lit désormais les séries par `_seriesImport` (même lecture que l'aperçu) ; un `sets` absent donne **1** série (et non 3) — n'arrive que sur une réponse mal formée.
6. **Worker** : prompt plus long (+8,7 k car.), catalogue jusqu'à 12 k car., sortie jusqu'à 16 000 jetons : **coût et latence non mesurés** ; Haiku (une seule image) peut ne pas obéir.
7. **Règle 0 du prompt** (« un groupe musculaire ne crée jamais une séance »), reprise de `Code.js` : les programmes **sans titre « Séance N »** (C02 septembre, C04 10 mars : des tableaux titrés « Dos et Biceps », « Jambes et fessiers »…) risquent d'être **fusionnés en une seule séance** par le modèle. **Non mesurable sans IA réelle** ; clause proposée prête (§16-B), à valider en recette.
8. **Reps** : le 10 de repli subsiste (la séance en a besoin : `_loadProgDayVraiment` remet 10 pour un 0) mais il est **dit** dans la note.
9. **Cas limite dropset** : si la personne règle EXPRESSÉMENT la même valeur sur chaque palier dans l'aperçu, elle est relue comme « le repos de fin de série » (les paliers s'enchaînent) — c'est la lecture voulue d'un dropset, mais ce n'est pas ce qu'elle a tapé à la lettre.
10. **Abdominaux** : la règle existante « 30 s par défaut » s'applique même quand le document écrit une plage (« 60-90 s ») ; la consigne écrite reste affichée et « Régler » propose les deux bornes.

## 14. Protocole de recette (IA réelle puis iPhone) — à lancer sur GO séparé

⛔ Pré-requis qui ne dépendent pas de ce lot : un **GO « test IA réel (coût) »** et un **GO « déploiement du Worker de la branche »** (le clone de test `/clone/` coupe le réseau vers le Worker par construction : il ne peut PAS servir à tester l'IA). Environnement : un compte de test **sans données réelles**, sauvegarde faite avant (règle d'or #6).

1. Déployer `worker.js` de la branche sur un Worker **de test** (jamais le Worker de production) ; vérifier `?test=1`. *(Ou GO explicite pour la production.)*
2. Importer, un par un, **dans l'ordre** : (a) le PDF Powerbuilding Bloc 1 V2 ; (b) le programme de septembre ; (c) le programme du 10 mars ; (d) un programme d'un seul écran en **photo** (Haiku).
3. Relever pour chacun, comparé à `tests/parcours/corpus_import/<id>.json` → `attendu` :

| Contrôle | Attendu |
|---|---|
| Nombre de séances | C01 : **5** (J3A / J3B distincts) · C02 : **6** · C04 : **5** — ⚠️ C02 et C04 n'ont **aucun titre « Séance N »** : si l'IA rend **1** séance, la règle 0 est en cause (§13-7) |
| Échauffements C01 | 17 séries `É`, J3B : proposition « Regrouper » |
| Repos | « 3 mins » = 180 s, « 1.30 mins » = 90 s, « 2 min max » = 120 s ; plages = texte + consigne, **aucun** chiffre inventé |
| Reps / charges | plages : borne basse + note ; « à calibrer » : 0 + note ; rien d'inventé |
| Dates | aucun `startDate` si le document n'en écrit pas ; « Date de début à définir » |
| Reconnaissance | « À confirmer » pour l'ambigu ; « Sera créé » pour l'inconnu ; aucune silhouette |

4. **Séance** : charger un jour, valider chaque série dans l'ordre, **chronométrer** : la durée affichée = le repos enregistré (ou le repos par défaut de l'app + la consigne écrite pour une plage). Tester : ECH → ECH, dernier ECH → premier travail, travail → travail, dernière série → exercice suivant, superset, dropset, fermeture / réouverture, « Régler ».
5. **iPhone (Safari, appareil réel)** : défilement de l'aperçu (`max-height:54dvh`), cibles tactiles, bouton central « + » (mesuré, pas regardé), clavier du champ « autre ». *Chromium 390 × 844 n'est PAS une validation iPhone.*
6. Consigner : version, appareil, scénario, date, résultat (état « vérifié sur iPhone », règle d'or #19).

## 15. Brouillons de communication (règle d'or #11) — NON branchés

À brancher **au moment de la publication** par la session qui publie (point rouge `NEW_FEATURES`, aide « ? » de l'onglet, aide détaillée, diapo du Guide ; **pas de pop-up `WHATS_NEW`** : la personne n'a rien à *faire*, aucun repère n'a bougé) :

* *Import de programme* : « Les repos écrits par ton coach (« 2 mins », « 1.30 », « 2 min max ») sont maintenant lus tels quels. Une plage (« 3-4 min ») n'est jamais transformée en durée : elle s'affiche sous le chrono et tu choisis. L'aperçu montre chaque série (échauffement ou travail), sa charge, ses reps et son repos, et te dit ce qu'il a reconnu ou créé. »
* *Programme sans date* : « Sans date de début, la carte du programme dit « Date de début à définir » — touche « Aujourd'hui » quand tu commences. »

## 16. Décisions en attente de Michel (rien n'est changé sans elles — règle d'or #15)

* **A. Reconnaissance** — enrichir la table d'équivalences avec les abréviations / synonymes de coachs mesurés (30 manqués sur 114) ? Un lot à part, cible unique vérifiée pour chaque entrée (R29, `ft-v1170`).
* **B. Documents sans titre « Séance N »** — ajouter au prompt du Worker : *« si le document n'a AUCUN titre de séance explicite, chaque tableau d'exercices titré est une séance »* ? Non mesurable sans IA réelle : à décider **après** la recette §14 (R34 : un changement de contexte se valide par un avant / après).
* **C. Dropsets existants** — confirmer l'enchaînement des paliers pour les programmes déjà enregistrés (§13-2).
* **D. Reps non écrites** — garder « 10 proposées + note » (choix actuel, sans toucher à la séance) ou afficher 0 (suppose de changer `_loadProgDayVraiment`) ?
* **E. Plafond « max »** — confirmer qu'un « 2 min max » vaut 120 s (choix actuel : le chiffre écrit est le repos).
* **F. Repli Apps Script (`Code.js`)** — l'aligner sur le Worker (interdit dans ce lot) ou le retirer de la chaîne `importProgram` ? Aujourd'hui seule la parité des phrases du prompt est testée.

## 17. Registre et passation (règle d'or #19) — bloc à fournir (le connecteur Drive ne modifie pas un fichier existant, règle #18)

À ajouter au registre « SUIVI DES BUGS » puis à la passation maître, **sans rien effacer** : *IMPORT-IA-FIDELITE-01 — corrigé sur branche `claude/import-ia-fidelite-01` (base `e2b942f3`), commits locaux, non poussé, non intégré, non publié, non vérifié iPhone. Causes : Worker à prompt ancien et sans validation ; lecture des repos ; deux filets ECH ; aperçu muet ; semaine sans date ; homonymes. Preuves : B-IIF 91/0, B-IIC 67/0, IIF-W 196/0 ; code publié 27 OK / 36 rouge, 55 / 12, 42 / 154. Limites : IA réelle et iPhone non testés ; règle 0 (documents sans « Séance N ») non mesurée ; 30 exercices du catalogue non reconnus. Décisions en attente : A à F.*

## 18. Les commits de la branche (locaux, **non poussés**) — base `e2b942f3`

| SHA | Contenu |
|---|---|
| `52bb3de0` | journal de partage : réservation |
| `d3ad635f` | Lot B (1/3) : repos lus comme les coachs les écrivent, regroupement échauffement / travail en UNE règle, chrono et consigne de plage |
| `f71b0267` | Lot B (2/3) + Lot C : aperçu fidèle, semaine sans date, éditeur « Aujourd'hui », programmes homonymes |
| `4d9fbfd5` | Lot B (3/3) : séries « en couleur » conservées, banc B-IIF, outil de mutations, enregistrement dans la passe |
| `7b5d2523` | corpus réel : repos « max » lus, matériel de la note, reps non écrites dites, pertes du serveur dites |
| `8af49d6a` | **Lot A** : le contrat d'import du Worker (`worker.js` + banc + mutations) |
| `df238c7a` | corpus de 19 programmes, banc B-IIC, dropset à repos uniforme — **dernier commit de code applicatif** |
| `36110085` · `1f1363b4` · `dd13d3d7` | témoins : texte de repos jusqu'à la séance, lanceurs gardés (D031S-VII), protection des données (M46) |
| `bef32417` + correctif | dossier, inventaire, journal de partage |

↩️ **Retour arrière** : la branche n'a rien changé hors d'elle-même ; `master` reste `e2b942f3` (= `ft-v1263`). Abandonner = ne pas fusionner la branche (ou `git branch -D claude/import-ia-fidelite-01`).

---

*Fichiers du lot* — `worker.js` · `constants.js` (`_reposLire`) · `log.js` · `index.html` · `style.css` · banc client `tests/parcours/import_fidelite.js` · corpus `tests/parcours/corpus_import/` + `tests/parcours/import_corpus.js` · Worker `tests/parcours/import_worker_contrat.js` · lanceurs `tools/banc_import_*.js` · contrôles négatifs `tools/mut_import_*.py`.
