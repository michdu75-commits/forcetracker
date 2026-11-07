# 🏃 Cardio multi-activités — étude et préparation du chantier (07/11/2026)

> **Statut : ÉTUDE EN LECTURE SEULE.** Aucun code applicatif modifié · aucune donnée touchée · rien fusionné, déployé ni publié · aucun numéro de version. Arrêt **volontaire** avant le « GO CODE » de Michel (consigne du 07/11/2026 : *« s'arrêter après l'étude, demander le GO CODE avant toute implémentation »*).
> **Auteur** : Claude N°2 (session-C, couloir Séance) — travail indépendant de Claude N°1 (Nutrition), aucun fichier Nutrition touché.
> **Ticket** : `EVO-CARDIO-01` *(ID **proposé**, onglet « Évolutions » — la Passation Maître du 07/11 parle d'un « bug fonctionnel » mais pose elle-même le diagnostic « contrainte de modèle/UX » ; à confirmer par Michel / Claude Principal ; **registre Drive non modifié** — règles #18/#19, bloc fourni à part).*
> **Bases lues** : **master publié `e2b942f3` (`ft-v1263`)** · **branche `claude/dreamy-bell-pu88ia` @ `b8baa25d`** (« Autre activité » + TDEE V2 étapes 1-2, **non intégrées**, non publiées).
> **Preuves** : sondes navigateur **hors dépôt** sur le **vrai code des deux arbres** (page jetable, stockage jetable, réseau coupé) + lecture du code + trois relevés délégués en lecture seule, **recoupés** par mes soins (§12).

## 📍 Carte de lecture

| § | Contenu |
|---|---|
| 0 | **En clair** — la réponse d'abord, les décisions attendues |
| 1 | Périmètre, sources, méthode |
| 2 | **Diagnostic précis** des limitations actuelles (12 constats, tous prouvés) |
| 3 | **Architecture recommandée** (et les alternatives écartées) |
| 4 | **Exemple de fonctionnement** pour l'utilisateur (ton cas du 07/11) |
| 5 | **Fichiers potentiellement concernés** (par couche, avec ce qui change) |
| 6 | **Compatibilité avec les anciennes séances** (et pourquoi aucune migration) |
| 7 | **Risques techniques et dépendances** |
| 8 | **Plan d'implémentation par étapes** (E0 → E7, estimations D-088) |
| 9 | **Plan de tests et critères d'acceptation** |
| 10 | **Décisions attendues de Michel** (avec ma recommandation pour chacune) |
| 11 | Défauts découverts en chemin — **listés, NON corrigés** |
| 12 | Limites de l'étude (ce que je n'ai pas pu lire ou mesurer) |

---

## 0. En clair — la réponse d'abord

**C'est faisable, sans migration de données et sans toucher au moteur de calories.** Le principe : une séance porte une **liste de blocs cardio** (0 à N : tapis, vélo, rameur… chacun avec sa durée et son intensité). « Avant / après » devient une **étiquette facultative**, affichée seulement quand il y a de la musculation. Les anciennes séances **ne sont pas réécrites** : un traducteur unique les lit telles quelles — **six anciennes séances types rejouées par ce traducteur redonnent exactement les mêmes textes, calories, durée et charge de récupération qu'aujourd'hui** (§6).

**Trois mesures à retenir** (toutes faites sur le vrai code, §2) :

1. **Ton cas se reproduit à l'identique.** La fenêtre n'offre que **deux emplacements fixes**, et une séance sans aucune musculation est quand même racontée « échauffement … + après séance … » — à l'écran, dans l'export, et dans ce que Milo lit.
2. **Le même cardio donne deux totaux selon la façon de le saisir.** Tapis modéré 34 min (profil de test, 80 kg) : **250 kcal en deux blocs 17 + 17, mais 272 kcal en un seul bloc de 34** (+22 kcal = le forfait d'échauffement du moteur : 5 min × 3,5 MET pour chaque emplacement vide). La branche « Autre activité » corrige ce point (D-ACT-4 : 249 kcal) → **le chantier doit s'appuyer sur elle, ou la reprendre** — décision d'ordre d'intégration, §10-D1.
3. **Un défaut de mon propre code TDEE V2 (branche) se révèle** : deux blocs courts de la **même machine** qui démarrent à ≤ 10 min d'écart sont fusionnés comme « doublon » et comptés **une seule fois** (Tapis 10 + 10 → 10 min). Latent aujourd'hui (il faut deux blocs ≤ 10 min), **il devient réel avec N blocs** → traité dans le plan (§8, E2) ; **non corrigé ici** (consigne).

**Coût estimé (méthode D-088, §8)** : ≈ **15 h de bout en bout** — ≈ 12 h 30 de développement et d'écriture, ≈ 2 h 30 d'exécution de tests non recouverte ; risques à part (§8). Huit étapes, chacune livrable et réversible seule ; la première (le traducteur) **ne change rien à l'écran**.

**Ce que j'attends de toi** (§10) : l'**ordre d'intégration** (D1), la règle du **forfait pour une séance 100 % cardio** (D2), le sort des **étiquettes avant/après** en séance mixte (D3), la nature des **paramètres facultatifs** (D4), ce que compte « N activités cardio » (D5), l'**édition d'une ancienne séance** (D6), et **une ou deux publications** (D7).

> ### ⛔ Je m'arrête ici. **GO CODE ?** — rien n'est écrit dans l'application tant que tu ne l'as pas dit.

---

## 1. Périmètre, sources, méthode

**Ce qui a été fait** : lecture du code des deux arbres (master publié `e2b942f3`, branche `dreamy-bell`), **sondes navigateur** hors dépôt rejouant ton cas sur le **vrai code** (`startWorkout` → `setCardioField` → `terminerSeance`, puis lecture par les vraies fonctions de l'app), **trois relevés délégués** (points d'entrée · lecteurs · synchro/exports/tests) que j'ai **recoupés** à la main sur les points qui décident l'architecture (§12).

**Ce qui n'a PAS été fait** (consigne) : aucune modification du code applicatif, de `Code.js`, du Worker, de `sw.js` ; aucune écriture dans une donnée réelle ; aucune écriture sur Drive ; aucune correction annexe — les défauts trouvés sont **listés** (§11), pas réparés.

**Chaîne de preuve (règle d'or #16 : TESTÉ → OBSERVÉ → EXPLIQUÉ)** — chaque constat de §2 porte sa nature :

| Étiquette | Sens |
|---|---|
| **OBSERVÉ** | mesuré par une sonde sur le vrai code (chiffre ou capture) |
| **LU** | lu dans le code, ligne citée ; pas rejoué |
| **RECOUPÉ** | relevé délégué, que j'ai relu moi-même dans le code |
| **DÉLÉGUÉ** | relevé délégué, non recoupé (dit comme tel) |

**Les sondes** (scripts hors dépôt, non versionnés — le banc de §9 en est la forme durable) :
`S1` ton cas (2 blocs 17 + 17) · `S2` un « moment » inconnu · `S3` six anciennes séances types (la référence de §6) · `S4` le traducteur prototype face à cette référence · `R1-R3` le **vrai** cas (deux blocs « Tapis / Modéré / 17 min ») comparé à la même activité saisie en un seul bloc · `E` les écrans (carte d'historique, détail éditable, ligne que lit Milo, texte de Nutrition).

⚠️ **Une précision sur ma première reconstitution** : j'avais d'abord joué « Tapis + Vélo » ; la Passation Maître précise que ta séance était **deux blocs « Tapis / Modéré / 17 min »**. Les mesures `R1-R3` ci-dessous sont rejouées avec **ce** cas exact (profil de test 80 kg — le « ~270 kcal » de ta capture est cohérent avec ton poids de profil, que je ne reproduis pas dans un dépôt public).

---

## 2. Diagnostic précis des limitations actuelles

### 2.1 Le modèle aujourd'hui, en trois lignes

- Une séance en cours (`S.wkt`) ou enregistrée (`S.sessions[i]`) porte **au plus deux** blocs cardio : `cardioAvant` (échauffement, ajouté le 02/08) et `cardio` (= **« après »**, champ historique). Chaque bloc = `{type, intensity, duration}` (branche : + `kcalEst`, `kcalPoids`, `kcalMode`, `kcalMan`). *LU : `app.js:425` (`_CK={avant:'cardioAvant', apres:'cardio'}`, branche ; `app.js:52` sur master).*
- Les calories d'un cardio = `MET[type][intensité] × poids × minutes/60` (`calcCardioKcal`, `app.js:44-48`) ; le moteur de séance (**gelé**, consigne de Michel) lit `session.cardioAvant` / `session.cardio` **par leur nom** pour son forfait et ses minutes (`app.js:1206-1224`, branche ; 803-826 sur master).
- Une séance **100 % cardio** n'est pas un type à part : c'est une séance **sans exercice** avec au moins un de ces deux blocs (branche : `_genreSeance` → `'cardio'`, **dérivé**, jamais stocké).

### 2.2 Les douze constats

| # | Limitation | Preuve | Nature |
|---|---|---|---|
| **LIM-1** | **Deux emplacements, pas plus.** Un troisième cardio (ou la même machine deux fois sans consommer les deux emplacements) est impossible. La fenêtre « Cardio » (`renderCardioBlock`) dessine exactement deux volets ; le détail éditable d'une séance passée aussi. | Capture de l'éditeur (deux volets « 🔥 Avant la séance / 🧊 Après la séance », chacun avec « Retirer ») ; `S1` : `S.wkt` ne contient que `cardioAvant` + `cardio`. | **OBSERVÉ** |
| **LIM-2** | **Le sens « avant / après » est imposé à tout, même sans musculation.** Séance de 0 kg, 34 min dont 34 de cardio : l'éditeur dit « Avant la séance », l'écran de fin « échauffement Tapis 17 min (Modéré) + après séance Tapis 17 min (Modéré) », l'export CSV écrit « cardio avant » / « cardio après », et **Milo lit** « cardio: échauffement Tapis 17min (modere) + après séance Vélo 17min (modere) ». Le code **sait** que c'est faux pour la carte d'historique (`_cardioSeanceTxt` n'ajoute aucun préfixe ; `_cardioClair`, `log.js:5285-5288`, l'interdit explicitement pour un cardio seul — R14) mais **l'écran de fin, Milo, l'export et l'éditeur** l'imposent encore. | `S1` (`txtFinSeance`, `lignesCSV`) ; sonde `E` (ligne de Milo, `coach.js:3671-3674`) ; capture du détail. | **OBSERVÉ** |
| **LIM-3** | **Écrasement silencieux.** Un « moment » inconnu retombe sur `cardio` (« après ») : un 3ᵉ bloc ajouté « par patch » **écraserait** l'après, sans erreur. | `S2` : `setCardioField('duration', 10, 'milieu')` → la durée de `cardio` passe de 20 à 10. | **OBSERVÉ** |
| **LIM-4** | **Le total dépend du nombre d'emplacements remplis.** Le moteur ajoute un forfait de **5 min × 3,5 MET par moment non mesuré** (`app.js:1206-1209`, branche ; 817-818 sur master) : pensé pour la musculation, il s'applique aussi à un cardio seul. Même activité, trois façons de la saisir : voir le tableau ci-dessous. | `R1-R3`, master **et** branche. | **OBSERVÉ** |
| **LIM-5** | **La durée dépend de l'emplacement, et la règle est écrite en trois copies.** Le chrono part à la 1ʳᵉ série validée : le cardio « après » est **dedans**, celui « avant » **dehors**. Cette partition vit dans `_dureeTotaleMin` (`app.js:979-987`), recopiée dans `_rythmeSeance` (`coach.js:144-146`, dont le commentaire dit pourtant « UNE seule fonction ») et dans le forfait du moteur (`app.js:1208-1209`). Un bloc de liste **sans** moment est donc inclassable par ces trois lecteurs. | Lu aux trois endroits ; `R1-R3` (`durée` identique 34 min, `calData.totalMin` 34 vs 39). | **RECOUPÉ** |
| **LIM-6** | **« Un cardio est-il noté ? » ne lit que deux champs.** `_cardioNoteMin` (`log.js:94-97`) = durée(`cardioAvant`) + durée(`cardio`) ; `_hasCardio` (`log.js:5077`) idem. C'est le propriétaire de « le bouton Terminer est-il armé ? ». | Lu ; `S1` (`aUnCardio`, `libelleFin` « 🏁 Enregistrer le cardio »). | **LU** |
| **LIM-7** | **L'éditeur d'une séance passée est un cas particulier de l'écran de saisie** : deux volets figés (`setSessCardio`, `setSessCardioKcal`), un second code à maintenir à côté de `renderCardioBlock`. | Capture ; lecture `setup.js:1550-1676`. | **OBSERVÉ + LU** |
| **LIM-8** | **L'export CSV nomme le moment** : une ligne par bloc, intitulée « cardio avant » ou « cardio après » ; aucun moyen d'en écrire un 3ᵉ. | `S1` (`lignesCSV`). | **OBSERVÉ** |
| **LIM-9** | **Milo ne sait écrire que deux moments** (contrainte, pas défaut) : le schéma du Worker dit `"avant"` / `"apres"` et **« un cardio au MILIEU de la séance reste un exercice »** — décision de `ft-v995`, rappelée *« non rouverte ici »* à `log.js:8144` (règle d'or #15). Le prompt de Milo parle de « DEUX emplacements AVANT/APRÈS » (`coach.js:4345-4346`, zone stable du cache). | Lu `worker.js:1108-1116`, `log.js:8138-8144`. | **RECOUPÉ** |
| **LIM-10** | **Les comptages ne s'accordent pas.** Branche : le bilan compte des **blocs** (`nCardio` = 2 pour ta séance) et des **séances** (`nCardioSeul` = 1) ; l'en-tête de Progrès compte des enregistrements sans exercice ; le filtre « Cardio » ne montre que les cardios seuls. Master : **pas d'`_agregatPeriode`** — ses bilans comptent tout enregistrement comme « séance » et additionnent `calories`, sans lire un seul bloc. | `S1` branche (`agregat`) ; relevé B (`app.js:10602-10626`, `setup.js:2044-2046`). | **OBSERVÉ + DÉLÉGUÉ** |
| **LIM-11** | **Deux propriétaires du libellé cardio.** `_cardioSeanceTxt` (log.js) et `_cTxt` (coach.js) écrivent chacun la phrase ; celui de Milo sort la **clé brute** « (modere) » sans accent et « 17min » collé, alors que `CARDIO_INTENSITES` (`app.js:37-42`) a été créé pour ce défaut. La carte d'historique montre `s.duration` **brute** : un cardio seul n'a **aucune durée** sur sa carte (le chrono n'a jamais tourné). | Sonde `E` (ligne de Milo, capture de la carte : « 279 kcal » + texte, sans « 34 min »). | **OBSERVÉ** |
| **LIM-12** | **Le calendrier ne lit jamais le cardio** : un jour de cardio seul s'affiche « Séance », couleur par défaut, tonnage « — ». | Relevé B (`screens.js:2222-2332`, `2364-2504`). | **DÉLÉGUÉ** |

**LIM-4 en chiffres — Tapis modéré, 34 min au total, profil de test 80 kg (sonde `R1-R3`, vrai `terminerSeance()`)**

| Façon de saisir | **Master publié** | **Branche** (D-ACT-4) |
|---|---|---|
| **2 blocs 17 + 17** (avant + après) — *ta saisie* | **250** kcal | **250** kcal |
| **1 bloc de 34 min** (après) | **272** kcal (blocs 249 + forfait 23) | **249** kcal |
| **1 bloc de 34 min** (avant) | **272** kcal (blocs 249 + forfait 23) | **249** kcal |

*Lecture : sur master, **la façon de découper change le total de 9 %** — c'est un double comptage de forfait (des minutes d'échauffement / retour au calme que personne n'a faites). La branche l'efface pour les **nouveaux** cardios seuls (D-ACT-4, « à confirmer » — `log.js:5057`). Un cardio seul **ancien** garde son total d'origine, forfait compris : c'est une valeur historique (D-114).*

### 2.3 Ce qui n'est PAS un problème (à ne pas « réparer »)

- **Le calcul de ta séance est juste pour ce qu'il sait** : 2 × 125 = 250 kcal, durée 34 min, charge de récupération 5,07. Ce n'est **pas** un bug de calcul — c'est le diagnostic produit de la Passation (« contrainte de modèle/UX et de parcours »).
- **La carte d'historique, la couleur, la récupération** acceptent déjà un cardio seul comme une séance (`_seancesTrain`) : le chantier n'a pas à y toucher, seulement à les nourrir par une liste.
- **« Un cardio au milieu reste un exercice »** (`ft-v995`) : décision actée, **non rouverte** (§3.11).

---

## 3. Architecture recommandée

### 3.1 Le principe, en une phrase

> **La séance porte une LISTE de blocs cardio ; un seul traducteur lit l'ancien et le nouveau ; un seul écrivain écrit le nouveau ; le moteur de calories reste APPELÉ comme aujourd'hui, à travers une « vue » à deux emplacements.**

### 3.2 La donnée (une seule nouvelle, R17)

```jsonc
// séance en cours (S.wkt) ET séance enregistrée (S.sessions[i]) : mêmes champs
{ "cardioBlocs": [
    { "type": "tapis", "intensity": "modere", "duration": 17 },
    { "type": "tapis", "intensity": "modere", "duration": 17 }
] }

// séance MIXTE : l'étiquette « moment » n'existe que si la personne l'a choisie (ou si le chrono
// n'avait pas démarré à la création du bloc — §3.5)
{ "cardioBlocs": [
    { "type": "velo",  "intensity": "leger",  "duration":  8, "moment": "avant" },
    { "type": "tapis", "intensity": "modere", "duration": 15, "moment": "apres" }
] }

// sur la branche (mécanisme « Autre activité », déjà écrit) : chaque bloc porte ses calories
//   kcalEst · kcalPoids · kcalMode · kcalMan   (la valeur de la montre REMPLACE l'estimation)
// « paramètres facultatifs » : voir §3.10 / D4 (recommandation : une note libre, comme `ex.note`)
```

- **Nom** : `cardioBlocs` (parallèle à `exs`). **Pas** de champ `genre` (il reste **dérivé** : `_genreSeance`), **pas** de champ de version (la forme se reconnaît à `Array.isArray`), **pas** d'`id` de bloc (l'index suffit, comme pour `exs`).
- **Ordre du tableau = ordre de saisie.** Pas d'horodatage par bloc.
- **Clé de stockage** : **aucune** nouvelle clé `ft4_*` — le champ vit **dans** `S.wkt` et `S.sessions[]` (donc pas de nouvelle entrée pour la garde `_persistRepli` / J30, ni pour le classement des données de R4a ; à revérifier à l'étape E1).

### 3.3 Le traducteur unique — `_cardioBlocs(src)`

*Contrat (pas du code) :* rend la liste des blocs d'une séance, **dans un ordre stable** :

1. si `src.cardioBlocs` est un tableau → ce tableau (blocs de durée > 0) ;
2. sinon, **l'ancien** : `[cardioAvant (moment « avant »), cardio (moment « après »)]`, blocs de durée > 0 ;
3. chaque entrée donne : `moment` (`'avant'` · `'apres'` · `null`), `type`, `intensity`, `duration`, les champs kcal (lecture seule), et la **référence** vers l'objet stocké (pour l'écrivain unique) ;
4. **il ne modifie jamais rien.** Règle de précédence : si `cardioBlocs` existe, **il est seul vrai** (R2) — les anciens champs sont ignorés.

*Preuve de faisabilité* : le prototype (`S4`) rejoué sur six anciennes séances types redonne **octet pour octet** les textes, calories, durée totale et charge de récupération de la référence (`S3`) — §6.

### 3.4 L'écrivain unique

Toute modification passe par **une** fonction (ajouter · retirer · changer un champ d'un bloc · poser le moment) qui :
- s'assure que l'enregistrement porte `cardioBlocs` (si non : **convertit cet enregistrement-là**, et seulement lui, en recopiant ses anciens blocs avec leur moment, puis supprime `cardioAvant` / `cardio` — **jamais les deux à la fois**) ;
- applique la modification et (branche) recalcule **seulement** l'estimation figée du bloc touché (`kcalPoserEstimation`) ;
- est le seul code qui écrit : écran de saisie (`S.wkt`), éditeur d'une séance passée (`_sessEdits`), séance rédigée par Milo (`_appliqueMiloSession` → `_cardioVersWkt`), import d'activité de la montre.

**Édition d'une ancienne séance** : la conversion se fait dans la **copie de travail** (`_sessEdits = JSON.parse(JSON.stringify(sess))`, `setup.js:1341`) et ne devient réelle qu'à « Enregistrer » (`saveSessEdits` remplace la séance d'un seul geste, `setup.js:1929`) : **annuler ne change rien** (règle d'or #3). Une séance qu'on n'ouvre pas **n'est jamais réécrite**.

### 3.5 Le « moment » — étiquette facultative, jamais imposée

- **Séance sans exercice** (cardio seul) : **aucun moment**, aucune puce, aucun mot « avant/après » (écran, export, Milo).
- **Séance avec musculation** : une puce « 🔥 avant · 🧊 après » par bloc. **Valeur proposée à la création du bloc** : *avant* tant que **aucune série n'est validée** (le chrono n'a pas démarré — c'est exactement la définition actuelle de l'échauffement), *après* ensuite. Un bloc sans moment dans une séance mixte compte comme *après* (c'est ce que `cardio` signifie aujourd'hui).
- **Pourquoi pas un 3ᵉ moment ?** Le moteur n'en connaît que deux, Milo n'en écrit que deux, et « au milieu » est déjà tranché (`ft-v995`). *Un moment qu'aucun lecteur ne sait lire est une donnée morte (R5).* (Le chrono n'est pas le **mot** « avant » : c'est la **partition** que `_dureeTotaleMin` suppose déjà — le cardio d'avant est hors chrono.)

### 3.6 Calories et durée — le moteur reste gelé

- **Calories d'un bloc** : le mécanisme de la branche (`kcalBloc` : estimée / saisie montre / retenue) — **un seul lecteur**. Total cardio d'une séance = **Σ des blocs retenus**. Aucun barème MET nouveau (**D-119** : *« ne pas inventer de nouveau barème MET sans validation »*).
- **Le moteur de séance** (`calcSessionCalories`) est **appelé comme aujourd'hui**, sur une **vue** : `ΣA` = somme des durées des blocs « avant », `ΣB` = somme des autres (« après » ou sans moment) → `vue = {…séance, cardioAvant: {duration: ΣA}, cardio: {duration: ΣB}}`. Il n'utilise **que** ces deux durées (forfait + minutes) : son résultat est donc **identique à l'octet** pour toute séance qui tient dans les deux emplacements — *LU* (`app.js:1208-1217` : c'est tout ce que le moteur lit du cardio) ; preuve §9, banc `C-CARD-B`.
- **Durée** : la **partition « dedans / dehors du chrono »** s'écrit **une fois** (aujourd'hui trois) : `avant` = hors chrono, le reste = dedans ; `_dureeTotaleMin` et `_rythmeSeance` la lisent au même endroit.
- **Séance 100 % cardio** : total = Σ des blocs retenus, **sans forfait** (D-ACT-4 étendu — **D2**). Deux découpages d'une même activité donnent alors le **même** total **à l'arrondi près** : chaque bloc arrondit au kcal (Tapis modéré 34 min, 80 kg : **249** en un bloc, **250** en 17 + 17, **249** en 12 + 12 + 10) — l'écart est **≤ 1 kcal par bloc**, jamais les 22 kcal de forfait d'aujourd'hui.
- **Après édition** : D-114 inchangée (`_kcalApresEdition` : le moteur est appelé avant/après dans le même contexte ; rien ne bouge si l'effort n'a pas bougé).

### 3.7 Le genre reste dérivé

`_genreSeance` (`state.js:903-910`) : `'cardio'` = **aucun exercice et ≥ 1 bloc de durée > 0** (via le traducteur, donc ancien **et** nouveau). **Rien n'est stocké** → aucune migration (la branche l'a déjà prouvé : *« tout l'ancien reste muscu ou cardio exactement comme aujourd'hui »*).

### 3.8 Les libellés — un seul propriétaire

Une fonction unique `_cardioLibelle(sess)` remplace `_cardioSeanceTxt`, `_seCardioTxt` et le `_cTxt` de Milo :
- cardio seul → `Tapis 17 min (Modéré) + Tapis 17 min (Modéré)` (les blocs tels que saisis, **sans** fusion) ;
- séance mixte → préfixe « échauffement » / « après séance » **uniquement** pour un bloc qui porte son moment ;
- plus jamais la clé brute « modere » (R2 : `CARDIO_INTENSITES`).

### 3.9 Les écrans

| Écran | Aujourd'hui | Cible |
|---|---|---|
| **Séance → fenêtre Cardio** (`#log-cardio`) | deux volets figés | **liste de blocs** : machine · intensité · durée · ✕ ; bouton **« + Ajouter une activité cardio »** (la nouvelle ligne reprend machine + intensité de la précédente, **durée vide** : tant qu'elle est vide, le bloc ne compte pas) ; une ligne de résumé « 34 min · ~250 kcal · 2 activités » ; la puce avant/après **seulement** s'il y a de la musculation |
| **Détail d'une séance passée** (`setup.js`) | mêmes deux volets + calories de la montre | **le même rendu de liste** (un seul code, R13), cible = `_sessEdits` |
| **Carte d'historique** | texte + kcal, **sans durée** pour un cardio seul | texte de `_cardioLibelle` + **durée totale** (`_dureeTotaleMin`, comme le détail) |
| **Écran de fin / débrief** | « échauffement … + après séance … » | `_cardioLibelle` |
| **Milo** | idem + clé « modere » | idem (R4 : la liste **atteint** la donnée que Milo lit) — **un changement de contexte ⇒ banc A/B (R34)** avant/après |
| **Accueil · Progrès · bilans · calendrier · récupération** | lecteurs de deux champs | lecteurs de la liste (§5) — la plupart sans changement visible |
| **Nutrition** | **aucun fichier touché** | lecture seule : elle lit les totaux, qui restent des nombres |

> **Bouton central « + » (règle d'or #9)** : la fenêtre Cardio est **sur** l'écran Séance → la position du bouton est **mesurée** avant/après à chaque étape qui touche l'écran (§9).

### 3.10 Les « paramètres facultatifs propres à l'appareil » — recommandation prudente

Ta consigne les prévoit. **Règle R3** : *toute donnée ajoutée doit nommer son consommateur.* Aujourd'hui, **aucun calcul** ne peut s'en servir (pas de barème MET par pente ou par vitesse — **D-119**). Je recommande donc :

- **E-1 (livrable avec le reste)** : un champ **`note`** libre et court par bloc (« pente 5 %, 9 km/h »), **comme `ex.note`** pour les exercices (R13 : même mécanisme, déjà affiché pendant la séance et envoyé à Milo en `[note: …]`). Consommateurs : l'écran, l'historique, Milo. **Zéro effet sur les calories.**
- **E-2 (sur décision, plus tard)** : des champs **structurés par machine** (distance, pente, vitesse, résistance, watts…) — **seulement** quand un consommateur existe (un barème validé par toi, ou une comparaison de séances). 6 machines × plusieurs champs = de l'interface et des tests pour rien tant que rien ne les lit.
- La **valeur de la montre** (déjà dans la branche, par bloc) reste le vrai moyen d'avoir un total précis.

### 3.11 Les alternatives écartées (et pourquoi)

| Alternative | Pourquoi non |
|---|---|
| **Plus d'emplacements fixes** (`cardio2`, `cardio3`…) | Chaque emplacement ajoute **autant de lecteurs à modifier qu'il y en a pour les deux actuels** : **86 lignes de lecture** des deux champs sur la branche (6 fichiers), **56 sur master** (5 fichiers) — compté par script, commentaires exclus (relevé C) ; le plafond ne disparaît pas, il recule ; LIM-3 (écrasement) y est plus dangereux. |
| **Un enregistrement « Autre activité » par machine** | Fait exploser le nombre de séances (une séance de tapis + vélo = 2 cartes, 2 jours actifs ?), casse « une séance = un enregistrement » (Accueil, séries de jours, récupération : plancher de 2 points **par enregistrement**), et double compte la dépense du jour. Une « Autre activité » reste une **tuile à part** (marche, rando…). |
| **Les blocs comme `exs`** (exercices cardio) | Le cardio n'a ni charge ni séries ; Milo le défend explicitement (*« LE CARDIO A SA PROPRE FENÊTRE »*, `coach.js:4345` ; `worker.js:1110`) ; ses calories sont ajoutées **hors** du moteur (`finishWorkout` / `_calDataSeance`) — le mettre dans `exs` les compterait deux fois (le défaut du 11/08/2026, décrit dans le commentaire du moteur, `app.js:1194-1203`). |
| **Migrer toutes les anciennes séances vers `cardioBlocs`** | **Pas nécessaire** (traducteur prouvé équivalent, §6) et **dangereux** : sur un appareil pas encore à jour, chaque séance migrée devient « même `id`, contenu différent » pour `_fusionnerSeancesRestauration` → **autant de conflits** gardés à part (`ft4_sessions_conflits`) ; règle d'or #3 (zéro perte) ; retour arrière impossible sans sauvegarde de données. |
| **Écrire AUSSI les anciens champs** (double écriture) | Deux sources de vérité qui divergent (R2) ; double comptage garanti le jour où un lecteur lit l'un et un autre l'autre. |

### 3.12 Ce que cette architecture ne fait pas

- **Elle ne touche ni Nutrition, ni le moteur de calories, ni `Code.js`, ni le Worker** : Milo continue d'**écrire** « avant / après » (2 moments) ; l'app les range en blocs avec leur moment. Aucun redéploiement serveur.
- **Elle ne rouvre pas** `ft-v995` (« au milieu = exercice ») ni D-119 (pas de nouveau barème).
- **Elle ne crée pas de nouvelle clé de stockage** et ne **réécrit aucune** donnée existante.

---

## 4. Exemple de fonctionnement pour l'utilisateur

*(Maquettes en texte : le rendu final se décide avec toi **après** le GO CODE ; ce qui compte ici, c'est le parcours et les règles. L'écran d'aujourd'hui — deux volets « 🔥 Avant la séance · échauffement » et « 🧊 Après la séance · cardio de fin », chacun avec ses puces de machine, d'intensité et sa durée — a été capturé sur le vrai code, voir le PDF.)*

### Cas 1 — ta séance du 07/11 : 100 % cardio, 34 minutes, deux blocs de tapis

1. **Séance → Cardio** (la fenêtre existe déjà, « optionnel »). Tu choisis `Tapis` · `Modéré` · `17` min : une ligne apparaît.
2. Tu touches **« + Ajouter une activité cardio »** : une 2ᵉ ligne apparaît, **déjà sur Tapis · Modéré** (tu tapes seulement la durée ; **tant que la durée est vide, la ligne ne compte pas**). Même machine deux fois, une autre machine, trois blocs : aucune limite, aucune contrainte de « moment ».
3. Le résumé du bloc dit : **« 34 min · ~250 kcal · 2 activités »** (profil de test 80 kg ; chez toi, le total suit ton poids de profil). **Aucun mot « avant / après »** — il n'y a pas de musculation.
4. **🏁 Enregistrer le cardio.** La carte de l'historique : `🏃 Cardio · sam. 7 nov. · 🔥 250 kcal` / `Tapis 17 min (Modéré) + Tapis 17 min (Modéré)` / **`34 min`** *(la durée manque sur la carte d'aujourd'hui — LIM-11)*.
5. **Plus tard**, tu ouvres la séance : **la même liste**, modifiable (ajouter · retirer · changer une durée). Les calories d'origine **ne bougent pas tant que l'effort ne change pas** (D-114) ; si tu allonges un bloc, le rapport après / avant s'applique aux calories d'origine.

> **Même total quel que soit le découpage, à l'arrondi près** : un bloc de 34 min, ou 17 + 17, ou 12 + 12 + 10 → 249, 250, 249 kcal (chaque bloc arrondit au kcal). Aujourd'hui, sur master : 272 contre 250 — LIM-4.

### Cas 2 — une séance de musculation avec du cardio avant et après

1. Tu ajoutes un bloc **avant** d'avoir validé une série : la puce propose **🔥 avant** (le chrono n'a pas démarré). Après ta première série validée, un nouveau bloc propose **🧊 après**. Tu peux **toujours** changer la puce.
2. Plusieurs blocs « après » (tapis 8 min puis rameur 6 min) sont possibles ; le total, la durée et la récupération les additionnent comme aujourd'hui.
3. **Le moteur de calories voit exactement ce qu'il voit aujourd'hui** : une durée « avant » et une durée « après » (§3.6) — rien ne change pour une séance qui tenait dans les deux emplacements.

### Cas 3 — une séance ancienne (« échauffement … + après séance … »)

Elle **s'ouvre comme aujourd'hui**, ses deux blocs apparaissent comme **deux lignes de la liste** avec leur puce (puisqu'elle a de la musculation) ou sans (si c'était un cardio seul). **Rien n'est réécrit tant que tu n'enregistres pas une modification** ; si tu en enregistres une, **cette séance-là seulement** passe au nouveau format (§3.4).

### Cas 4 — Milo

Milo lit `cardio : Tapis 17 min (Modéré) + Tapis 17 min (Modéré)` pour un cardio seul (plus « échauffement … + après séance … », qui est faux), et garde ses préfixes pour une séance mixte dont les blocs portent un moment. **Il continue d'écrire ses séances avec « avant » et « après »** (le Worker ne change pas) ; l'app range ce qu'il propose dans la liste. *Un cardio « au milieu » reste un exercice (`ft-v995`).*

---

## 5. Fichiers potentiellement concernés

*Numéros de ligne = **branche** `b8baa25d`. **Master `e2b942f3` porte le même code** pour toutes ces fonctions, à des numéros décalés (log.js −9/−11 · coach.js −26 · setup.js −13/−29 · app.js −373 dans le bloc cardio) ; seuls `kcalBloc*`, `_genreSeance`, `_agregatPeriode` et le TDEE V2 **n'existent que sur la branche** (relevé A et B, §12).*
*Colonne « Type » : **N** rien à changer · **L** le lecteur boucle sur la liste · **W** l'écrivain passe par l'écrivain unique · **T** texte / libellé · **D** décision de sens (il faut le moment du bloc) · **A** accepter l'ancienne forme à vie.*

### 5.1 Le noyau — `app.js`

| Lignes | Fonction | Ce qui change | Type |
|---|---|---|---|
| 28-48 | `CARDIO_MET` · `CARDIO_LABELS` · `CARDIO_INTENSITES` · `calcCardioKcal` | rien (aucun barème nouveau — D-119) | N |
| 147-191 | `kcalCardioAffichage` · `kcalNormaliserSeance` · `_kcalAvecSaisie` | la sortie `{avant, apres}` devient une liste ; le **prorata** des anciennes séances (`calData.cardio` réparti sur les blocs sans `kcalEst`) est conservé tel quel | L |
| 425-455 | `_CK` · `_cardioObj` · `setCardioField` | **remplacés** par l'écrivain unique (disparaît : le repli silencieux sur `cardio`, LIM-3) | W |
| 457-492 | `calcCardioKcalTotal` · `_cardioResume` · `_aUnCardio` · `_updateCardioSummary` | bouclent sur le traducteur | L |
| nouveau | `_cardioBlocs` · écrivain unique · vue moteur · `_cardioLibelle` | **le nouveau code** (≈ 120 lignes) | — |
| 494-560 | `renderCardioBlock` · `saveCardioEntry` | deux volets figés → **liste de blocs** | W + T |
| 979-987 | `_dureeTotaleMin` | la partition « dedans / dehors du chrono » s'écrit **ici une fois** (et `coach.js:144-146` la **lit** ici) | D |
| 1206-1224 | `calcSessionCalories` (moteur **gelé**) | **NON modifié** — appelé avec la vue `{cardioAvant: ΣA, cardio: ΣB}` | N |
| 10602-10626 | `_agregatPeriode` *(branche)* | `nCardio` = nombre de blocs (déjà) ; sens à confirmer (**D5**) | L |
| 10139 (Guide ; 9745 sur master) | textes « 🔥 avant / 🧊 après », « 5 min estimées par moment » | réécriture | T |

### 5.2 Saisie, fin de séance, Milo — `log.js`

| Lignes | Fonction | Ce qui change | Type |
|---|---|---|---|
| 94-97 | `_cardioNoteMin` — **propriétaire** de « un cardio est-il noté ? » | boucle sur le traducteur → **corrige d'un coup** `_seanceOuverte` (l.29), `_etatTravailWkt` (l.112), le bouton Terminer, l'en-tête | L |
| 5047-5060 | `_calDataSeance` (le **seul** endroit qui assemble moteur + cardio) | construit la **vue moteur**, somme les blocs retenus, pas de forfait pour un cardio seul (**D2**) | W |
| 5077 · 5134-5137 | `finishWorkout` : `_hasCardio`, copie des deux champs dans la séance | copie `cardioBlocs` | W |
| 5289-5308 | `_cardioClair` · `_cardioSeanceTxt` · `_seCardioTxt` | **fusionnés** en `_cardioLibelle` | T |
| 8091 | `_cardioVersWkt` (chargement d'un jour de programme) | **ajoute** au lieu de « si le créneau est vide » — répare une perte silencieuse (§11-P1) | W |
| 8105 · 8198-8199 | `_buildProgDay` (import de programme) | **inchangé** : le jour garde `cardioAvant`/`cardio` (les programmes ne portent pas de liste — hors périmètre) | A |
| 8974 · 8989 | `_cardioValide` · `_cardioDeclare` | **inchangés** : l'enveloppe `{avant, apres}` de Milo est acceptée **à vie** (elle survit dans les chats locaux) | A |
| 9356-9460 | `_cardioDepuisEx` · `_extraireCardioMilo` | liste **ordonnée par position** (avant la 1ʳᵉ muscu / après la dernière) ; « au milieu = exercice » **intact** ; un cardio seul à 2 machines n'est plus compté « muscu » (§11-P2) | W |
| 9489 (écritures 9600-9601) | `_appliqueMiloSession` | **ajoute** au lieu de « créneau vide » | W |
| 8997 | `_normalizeMiloSession` | inchangé | A |

### 5.3 Détail, historique, export, montre — `setup.js`

| Lignes | Fonction | Ce qui change | Type |
|---|---|---|---|
| 338 | `_histoLignes` (CSV) | une ligne **par bloc** (déjà) ; la colonne « séance » ne dit « cardio avant/après » que si le bloc porte un moment | T |
| 1266-1306 | détail : « (dont N min de cardio) » via `_dureeTotaleMin` | N une fois la partition réglée | N |
| 1341 | `_sessEdits = JSON.parse(JSON.stringify(sess))` | inchangé (copie profonde : `cardioBlocs` suit) | N |
| 1437 | `utiliserActiviteMontre` (activité de la montre → bloc) | **ajoute** (aujourd'hui : `confirm()` avant/après puis **REMPLACE** le créneau occupé) | W |
| 1458-1459 | `CARDIO_NOMS_MONTRE` · `_typeCardioDepuisMontre` | inchangés ; le **domaine de type reste ouvert** (3 types hors `CARDIO_LABELS` : marche, course, natation — D-119) | A |
| 1550-1676 | cartes du détail (2 volets) · `setSessCardio` · `setSessCardioKcal` | **même rendu de liste** que l'écran de saisie ; cible `_sessEdits` | W + T |
| 1901-1935 | `saveSessEdits` | **conversion de la séance éditée** au moment de remplacer `S.sessions[idx]` | W |
| 1867-1899 | `_kcalApresEdition` (D-114) | inchangée (appelle `_calDataSeance` avant / après) | N |
| 2107-2178 | `_sessCarteHtml` (carte d'historique) | texte via `_cardioLibelle` ; durée via `_dureeTotaleMin` (aujourd'hui : `s.duration` brut) | L + T |
| 4658-4684 | recalage admin | lit via le traducteur | L |

### 5.4 Les autres lecteurs

| Fichier:lignes | Fonction | Ce qui change | Type |
|---|---|---|---|
| `state.js:903-910` | `_genreSeance` | « ≥ 1 bloc > 0 sans exercice » via le traducteur | L |
| `tracking.js:3571 · 3614` | `_contenuFinSeance` · `renderLogFinish` | lisent la liste ; libellé | L + T |
| `tracking.js:3959-3970` · `3847-3861` | **TDEE V2** `_djEntrainementsDe` · `djDedoublonner` *(branche)* | itère la liste **dans l'ordre**, et **ne fusionne jamais deux blocs d'une même séance** (défaut §11-P3) | L + D |
| `tracking.js:4102-4116` | `_chargeCardio` (récupération, additive) | boucle ; ordre et moment sans effet | L |
| `coach.js:119-161 (144-146)` | `_rythmeSeance` | **cesse d'être une 2ᵉ copie** de la partition : appelle l'unique | D |
| `coach.js:3605-3687 (3671-3674)` | `_ligneSeance` (ce que Milo lit) + `_cTxt` | `_cardioLibelle` ; plus de « après séance » pour un cardio seul ; plus de clé « modere » | T |
| `coach.js:401-420 · 4345-4346` | `_ctxRythme` · règle de prompt « DEUX emplacements AVANT/APRÈS » | mots à ajuster ; **changement de contexte ⇒ banc A/B (R34)** | T |
| `coach.js:8535` · `screens.js:507-508` | aides, Guide (« deux temps ») | réécriture (règle d'or #11) | T |
| `screens.js` (calendrier, Accueil) · `app.js:10648-10859` (bilans) | comptes d'enregistrements, aucun champ cardio | **inchangés** (§2 LIM-12 : le calendrier ne lit pas le cardio — hors périmètre) | N |
| `screens.js:3401-3452` | Nutrition, carte « Dépense et objectif » | **aucun fichier Nutrition touché** : lit des totaux (nombres) | N |

### 5.5 Ce qui ne bouge pas

`Code.js` (une liste **dans** la séance se sauvegarde telle quelle : `existing.sessions = inSess`, `Code.js:1904` ; Supabase la garde en `jsonb`) · `worker.js` (Milo écrit toujours 2 moments) · `sw.js` (bump à la publication seulement) · `dashboard.js` (tuiles cardio **déjà** cassées, §11-P5) · `index.html` (le conteneur `#log-cardio`, l.646).

### 5.6 Compteurs R17 — **prévisionnels** (à remplacer par la mesure au rapport final)

| Compteur | Estimation | Détail |
|---|---|---|
| Données persistées ajoutées | **1** | le champ `cardioBlocs` (dans `S.wkt` et `S.sessions[]`) ; **aucune clé `ft4_*`** |
| Fichiers applicatifs touchés | **≈ 7** | `app.js` · `log.js` · `setup.js` · `state.js` · `tracking.js` · `coach.js` · `screens.js` |
| Lignes ajoutées − retirées | **≈ +260 − 190** | le noyau neuf, moins les deux rendus figés, les trois copies de la partition, les trois libellés |
| Anciens chemins supprimés / fusionnés | **≥ 7** | deux rendus de volets (saisie, détail) → 1 · `_CK`/`_cardioObj`/`setCardioField` → écrivain · 3 copies de la partition → 1 · 3 libellés → 1 · « créneau vide » (Milo, programme, montre) → « ajouter » |

---

## 6. Compatibilité avec les anciennes séances — et pourquoi aucune migration

### 6.1 La règle posée par la consigne, appliquée

> *« Ne pas proposer une migration de données sans démontrer qu'elle est nécessaire. »* → **Elle n'est pas nécessaire, donc elle n'est pas proposée.** Trois raisons, dont deux **mesurées** :

1. **Un traducteur suffit — MESURÉ.** Le prototype du traducteur (`S4`) a été rejoué sur six anciennes séances types, **sur master et sur la branche** : pour chacune, nombre de blocs, minutes, calories de cardio, texte, charge de récupération et durée totale sont **identiques** à ce que le code actuel rend (`identique: true` six fois sur six).
2. **Une migration serait dangereuse — LU.** Une séance est identifiée par son `id` ; à la restauration, `_fusionnerSeancesRestauration` (`state.js:948`) compare **le contenu entier** (`_empreinteSeance`) : *même `id`, contenu différent* → la version du téléphone reste active et celle du cloud est gardée à part (`ft4_sessions_conflits`). Migrer en bloc fabriquerait donc **autant de « conflits » qu'il y a de séances** sur tout appareil pas encore à jour. Ajoutez la règle d'or #3 (zéro perte) et #8 (retour arrière en une ligne : un retour avant la migration ne saurait plus lire les séances migrées).
3. **Rien n'oblige à réécrire le stock** : le genre est dérivé ; les calories des anciennes séances sont **déjà stockées** (`s.calories`, `s.calData`) et ne sont **jamais recalculées** (D-114) ; les lecteurs qui regardent les blocs (carte d'historique, récupération, bilans, TDEE V2) passent **tous** par le traducteur.

### 6.2 La référence : six anciennes séances types (identiques master / branche)

| # | Forme ancienne | Texte | kcal cardio | Durée totale | Charge de récup. | Calories **stockées** |
|---|---|---|---|---|---|---|
| L1 | cardio seul, **« après » seul** : Tapis modéré 45 min | `Tapis 45 min (Modéré)` | 330 | 45 | 6,00 | **353** (330 + forfait 23) |
| L2 | cardio seul, **« avant » seul** : Elliptique léger 10 min | `Elliptique 10 min (Léger)` | 53 | 10 | 0,97 | **76** (53 + forfait 23) |
| L3 | **deux blocs** : Tapis 17 + Vélo 17 (modéré) | `Tapis 17 min (Modéré) + Vélo 17 min (Modéré)` | 279 | 34 | 5,07 | 279 |
| L4 | muscu + **avant/après** : Rameur 8 léger + Vélo 15 intense | `Rameur 8 min (Léger) + Vélo 15 min (Intense)` | 248 | 31 (*estimée*) | 4,51 | 286 (38 + 248) |
| L5 | muscu + cardio **sans** répartition rangée (très ancienne) : Corde 10 modéré | `Corde 10 min (Modéré)` | 120 | 15,33 | 2,18 | 49 (`cardioNonRepartie` = 1) |
| L6 | muscu **seule** | *(vide)* | 0 | 5,33 | 0 | 72 |

*Ces six lignes sont la **référence à l'octet** du banc de §9 (`C-CARD-A`) : le jour où le traducteur existe, il doit redonner exactement ceci — et un test qui ne rougit pas quand on change un chiffre ne mesure rien (R35).* **L5 est le piège** : une séance ancienne dont les calories rangées **ne contiennent pas** le cardio (120 kcal de corde, 49 stockées) — le traducteur doit l'exposer comme « bloc ancien, sans `kcalEst` » (le prorata de `kcalCardioAffichage` y répond déjà) et **ne jamais recalculer** `calories`.

### 6.3 Ce qui se passe, séance par séance

| Cas | Comportement |
|---|---|
| **Ouvrir / lire** une ancienne séance | traducteur → comme aujourd'hui, **rien n'est écrit** |
| **Enregistrer une modification** d'une ancienne séance | **cette séance-là seulement** : conversion dans la copie de travail, remplacement d'un seul geste (`saveSessEdits`) ; calories d'origine gardées si l'effort n'a pas bougé (D-114) ; **annuler = rien ne change** |
| **Ne pas l'ouvrir** | **jamais réécrite** |
| Une séance **nouvelle** lue par un appareil **pas à jour** (ou après un retour arrière) | **non perdue** (aucun filtre ne l'écarte — `S.sessions` est gardée telle quelle, `Code.js:1904`), ses calories sont justes (stockées) ; elle s'affiche **sans le détail de ses blocs** ; résiduel : une modification de cardio faite **depuis cet appareil** sur cette séance serait ignorée (précédence de `cardioBlocs`) — d'où **D7** |
| **Séance en cours** (`S.wkt`, brouillon `ft4_wkt_draft`) d'une autre version | même logique ; le brouillon copie `S.wkt` entier (`state.js:1263`), donc la liste suit |
| **Enveloppe de Milo** `{avant, apres}` (survit dans les chats locaux, re-normalisée à chaque chargement) | acceptée **à vie** (`_cardioValide` / `_cardioDeclare` inchangés) |
| **Jour de programme** (`day.cardioAvant` / `day.cardio`) | forme **inchangée** (hors périmètre : les programmes ne portent pas de liste) ; `_cardioVersWkt` les range dans la liste de la séance en cours |

### 6.4 Synchro, sauvegarde, exports

| Chemin | Effet d'une liste **dans** la séance | Preuve |
|---|---|---|
| **Cloud (Apps Script)** | stockée telle quelle : `existing.sessions = inSess` (`Code.js:1904`), pas de liste blanche de champs **dans** une séance | **LU** + relevé A |
| **Supabase** | `jsonb` : verbatim | **DÉLÉGUÉ** (A) |
| **Champ RACINE nouveau** | **jeté** : le serveur lit une liste **nommée** de champs (76 `body.X` distincts, aucune boucle générique, `Code.js:1746-1994`) ; précédent : `hiddenFoods`, envoyé par le client (`setup.js:1185`), **absent** du serveur → la liste **doit** vivre **dans** la séance — c'est le cas | **RECOUPÉ** (A + C, compté par moi) |
| **Garde-fou de rétrécissement** (`Code.js:1889-1904`) | non concerné (compte des séances, pas des champs) | **LU** |
| **Restauration / fusion** | identité = `id` ; séance convertie = « contenu différent » → conflit gardé à part, **pas de perte** | **LU** (`state.js:948-980`) |
| **Feuille « Séances » (Sheets)** | **jamais** de cardio (`_buildSyncRows`, `tracking.js:59`) : inchangée | **DÉLÉGUÉ** (A) |
| **Export CSV** | une ligne par bloc (`setup.js:338`) : compatible ; seul le libellé « cardio avant/après » devient conditionnel | **OBSERVÉ** (`S1`) |
| **Brouillons, chats Milo** | locaux (non synchronisés) | **DÉLÉGUÉ** (A) |
| **Stockage serveur** | `JSON.stringify` → Script Property `u_<email>` (gzip + base64 si plus court) ; `loadProfile` rend `data.sessions` tel quel ; sauvegarde Drive et `adminRestore` idem. Aucune limite **par séance** ; le plafond est le réservoir **total** (512 000 car. ; 102 % le 29/07). Une liste de 2-5 blocs ajoute ≈ 130 octets par bloc. | **DÉLÉGUÉ** (C) |
| **Restauration d'une séance SANS `id`** (très anciennes) | seule une copie **strictement identique** est reconnue ; une séance sans `id` **réécrite localement** (modifiée) reviendrait en **doublon** depuis le cloud tant que celui-ci n'a pas reçu la version modifiée (`saveSessEdits` appelle `_cloudSyncSessions()` aussitôt) — même classe de risque que **toute** modification d'une très ancienne séance, **pas propre à ce chantier** | **DÉLÉGUÉ** (C) |
| **Export PDF de l'historique** | aucune lecture propre : mêmes lignes que le CSV ; tableau par **date**, titre = `rows[0].seance` ; **le cardio est poussé avant les exercices** → un jour muscu + cardio peut s'intituler « cardio après — mercredi » ; sous-titre « Séries validées uniquement » alors que des durées y figurent (P15) | **DÉLÉGUÉ** (C) |
| **Export JSON** (complet / « séances seules ») | complet = toutes les clés de `S` ; restreint = liste blanche **racine** (`sessions`, `prs`, `customExercises`), séances telles quelles → un champ **interne** suit ; une clé **racine** neuve serait exclue du restreint | **DÉLÉGUÉ** (C) |
| **Contexte de Milo / impression des programmes** | Milo : texte par séance depuis les deux champs (à brancher, R4) ; impression et PDF de programme : n'impriment jamais le cardio d'un jour (P8) | **DÉLÉGUÉ** (C) |

---

## 6bis. Un point de vigilance de gouvernance — les « ancres » des contrôles négatifs

Les contrôles négatifs (`tools/mut_*`) **s'ancrent sur des chaînes de source exactes** et se déclarent **INVALIDES** si l'ancre a disparu. Le chantier déplace du code : **huit outils** touchent des chaînes qu'il va réécrire (`mut_travail_lot2` : `_cardioNoteMin()>0` · `mut_nut_punch01` : `CARDIO_FIN`/`CAV_FIN` = `log.js:5134-5135` · `mut_ux_integration` B5 · `mut_tdee_v2` S118 · `mut_seance_chiffres` M5 · `mut_autre_activite` M06-M08/M17/M44 · `mut_sites_garde`, 54 sites · `tests/recette/registre.json`, déclencheurs `_cardioNoteMin`, `_cardioVersWkt`, `_extraireCardioMilo`). **Re-ancrer ces outils fait partie du chantier** (E6), pas d'un « après ». *Et la dette existe déjà* : un contrôle par script (35 outils sur 128) montre **11 ancres cassées par la branche** et **8 déjà manquantes sur les deux arbres** — ces gardes ne sont **plus éprouvées** aujourd'hui (P16).

---

## 7. Risques techniques et dépendances

| # | Risque / dépendance | Gravité | Parade | Étape |
|---|---|---|---|---|
| **K1** | **L'ordre d'intégration.** Master **n'a ni** `kcalBloc*`, **ni** `_genreSeance`, **ni** D-ACT-4, **ni** le TDEE V2, **ni** `_agregatPeriode` (relevé B, finding 12). Construire sur master seul oblige à **refaire** le forfait (sinon 250 ≠ 272 kcal reste vrai) et à **re-fusionner** ensuite avec la branche. | **Haute** (bloque le départ) | **D1** : partir de la branche (ou intégrer d'abord « Autre activité » + TDEE V2 — « ordre et GO fusion » sont en attente de Michel dans la Passation du 06/11), puis bâtir dessus | E0 |
| **K2** | **TDEE V2 : `djDedoublonner`** fusionne deux blocs de même famille dont le début est à ≤ 10 min et la durée à ≤ 25 % (mesuré par le relevé B, et conforme à la règle lue dans `tracking.js:3847-3861` : Tapis 10 + 10 → 10 min ; 5 + 5 + 5 → 5 min ; 12 + 12 intact). Latent à 2 emplacements, **réel avec N blocs**. C'est mon code. | **Haute** (sous-compte la dépense du jour) | la fusion ne doit jouer qu'**entre sources différentes** (saisie ↔ Apple Santé), **jamais entre blocs d'une même séance** : étiquette de séance dans l'entrée ; témoin 5 + 5 + 5 | E2 |
| **K3** | **Moteur gelé.** Un changement de la vue ferait bouger des calories de séances mixtes. | **Haute** | la vue n'expose **que** deux durées (vérifié : le moteur ne lit que `_duree('cardioAvant')` et `_duree('cardio')`, `app.js:1208-1217`) ; banc **`C-CARD-B`** : sortie du moteur identique à l'octet sur un corpus de séances mixtes ; mutation « le moteur reçoit la liste » doit rougir | E1 |
| **K4** | **Milo : changer ce qu'il lit = changement de contexte.** Libellé, règle de prompt (zone **stable du cache**, `coach.js:4345`), schéma du cervelet. Plus : **4 gardes sur `exs.length`** empêchent Milo de livrer un cardio seul (relevé A), alors que le prompt le dit « parfaitement valable ». | Moyenne | **R34** : banc A/B avant/après sur le contexte (appels API — non lancés ici) ; le schéma du Worker **ne change pas** ; la capacité « Milo livre un cardio seul » reste **hors chantier** | E5 |
| **K5** | **Tests qui figent l'ancien format.** Au moins `tests/parcours/runner.js:1151` (`/Tapis 25min/`, `/échauffement Vélo 10min/`) et `debrief_provenance.js:151-154` (relevé B) ; la liste complète est en **§9.3** (≈ 86 mentions dans `runner.js` seul ; 7 témoins « DEUX MOMENTS »). **Réécrire un témoin n'est permis que s'il rougit ensuite sous mutation (R17).** | Moyenne | chaque témoin touché est **re-visé sur son invariant** puis muté | E6 |
| **K6** | **Les copies cachées.** Trois copies de la partition « dedans / dehors du chrono », trois propriétaires du libellé, deux rendus de l'éditeur. Chaque copie oubliée = un lecteur qui lit encore deux champs. | Moyenne | un **témoin de source** qui rougit si un lecteur relit `cardioAvant`/`cardio` hors du traducteur (déjà pratiqué sur la branche : balayage des 52 sites de garde) | E2 |
| **K7** | **Appareil pas à jour / retour arrière** (§6.3) : la séance nouvelle reste sûre, **sans détail de blocs** ; modification de cardio ignorée depuis l'ancien appareil. | Faible, **bornée** | **D7** : deux publications espacées (lecteurs d'abord, écriture ensuite) → le retour arrière de la 2ᵉ ne perd pas l'affichage ; sinon risque connu et accepté | E0 / E6 |
| **K8** | **Bouton central « + »** (règle d'or #9) : la fenêtre Cardio est sur l'écran Séance. | Moyenne | position **mesurée** avant/après à chaque étape qui touche l'écran | E3 |
| **K9** | **Prévenir l'utilisateur (règle d'or #11)** : la fenêtre change de forme (un **repère bouge**) — point rouge `NEW_FEATURES`, aide `?`, aide détaillée, diapo du Guide ; la pop-up `WHATS_NEW` **se mérite** : ici, oui, courte. Les textes « 🔥 avant / 🧊 après » vivent aussi dans `app.js:10139` (9745 sur master), `coach.js:8535`, `screens.js:507-508`. | Faible | étape E5 | E5 |
| **K10** | **Collision avec les autres sessions.** *Nutrition (Claude N°1)* : `app.js`/`screens.js` (lot F/A/C) — zones éloignées du bloc cardio, mais même fichier. *Import IA* (branche `claude/import-ia-fidelite-propre`) : `log.js` **+729 lignes** (import de programme, séries/repos, **4 lignes dans `finishWorkout`**) et `worker.js` +382 — **collision textuelle possible** avec `finishWorkout` (l.5134), `_cardioVersWkt` (8091), `_extraireCardioMilo` (9356+). `sw.js` collisionne toujours (le second qui fusionne **monte** d'un numéro). | Moyenne | ligne du journal de partage poussée **avant** de coder ; *« la session qui publie en dernier refusionne, vérifie, relance et pose le numéro final »* ; aucun numéro de version pendant le travail | E0 |
| **K11** | **Comptages** : « N activités cardio » = blocs ou séances ? (bilans = blocs, Progrès = enregistrements sans exercice, filtre « Cardio » = cardios seuls). | Faible (sens) | **D5** | E2 |
| **K12** | **Données personnelles dans un dépôt public** : aucun poids réel, aucune séance réelle dans les tests ni les docs — profil de test 80 kg. | Faible | revue du diff avant chaque commit | toutes |
| **K13** | **Perte silencieuse déjà existante au chargement d'un programme** (P1) et **cardio seul à 2 machines classé « muscu »** (P2) : l'étape W les **répare** par construction (ajouter au lieu de « créneau vide ») — mais c'est **un changement de comportement visible**, à annoncer. | Faible | témoins P1/P2 (§9) | E3 |

**Dépendances amont** : décision **D1** (ordre d'intégration) · publication de **ft-v1264** (Nutrition) — la consigne dit « démarrer vite après » · aucune dépendance serveur (`Code.js`, Worker, Supabase inchangés).

---

## 8. Plan d'implémentation par étapes

**Le principe : « d'abord lire les deux formes, ensuite écrire la nouvelle ».** Chaque étape est **livrable seule**, **réversible**, et porte ses tests ; la première **ne change rien à l'écran**. Rien ne démarre avant le GO CODE ; aucun numéro de version pendant le travail ; ligne du journal de partage poussée **avant** de coder ; nouveaux blocs de tests **préfixés par session** (`B-CCC…`), jamais renommés ; aucun remplacement global.

| Étape | Contenu | Ce que ça prouve | Visible ? |
|---|---|---|---|
| **E0** | **Préalables, sans code applicatif.** Décisions D1-D7 ; base de départ ; ligne du journal de partage ; branche + sauvegarde (règle d'or #6) ; **fusion à blanc** (`merge-tree`) avec la ligne ft-v1264 ; **les six séances de §6.2 figées en banc sur le code ACTUEL** (il doit être vert avant la 1ʳᵉ ligne) | le point de départ est mesuré | non |
| **E1** | **Le traducteur** `_cardioBlocs`, **l'écrivain unique**, **la vue moteur** ; les deux propriétaires à un seul site s'y branchent : `_cardioNoteMin` (log.js:94) et `_genreSeance` (state.js:903). Aucun écran ne l'appelle encore. | bancs **`C-CARD-A`** (six séances à l'octet) et **`C-CARD-B`** (sortie du moteur identique) ; conversion idempotente ; 25 mutations | non |
| **E2** | **Tous les lecteurs passent par le traducteur** (§5.4) : durée (la partition **écrite une fois**), comptages, récupération, TDEE V2 (**ordre + anti-fusion intra-séance**, K2), `_rythmeSeance`, `_cardioLibelle` **qui rend d'abord exactement les textes d'aujourd'hui** (on change le propriétaire avant de changer le texte) | **témoin de source** (plus aucun lecteur ne lit `cardioAvant`/`cardio` en dehors du traducteur) ; banc voisins ; ≈ 35 mutations | non |
| ═══ | **▶ PUBLICATION 1 possible ici** (D7) : l'app **sait lire** les deux formes, personne n'écrit encore la nouvelle. Un retour arrière de la publication 2 reste alors sans danger. | | |
| **E3** | **Écran de saisie** : liste de blocs, « + Ajouter une activité cardio », puce avant/après (si musculation), résumé de ligne, `note` (D4) ; **`_cardioVersWkt`, `_extraireCardioMilo`, `_appliqueMiloSession`, `utiliserActiviteMontre` AJOUTENT** au lieu de « créneau vide / remplace » (répare P1, P2) ; **règle D2** (cardio seul : pas de forfait) ; mesure du bouton « + » | parcours Playwright : ton cas en 3 découpages = même total ; P1/P2 verts ; **bouton central : delta 0 px** | **oui** |
| **E4** | **Détail éditable** : même rendu de liste ; **conversion à l'enregistrement** ; carte d'historique avec la durée totale | conversion idempotente, rien perdu, annuler = rien ; D-114 ; ancienne séance non ouverte = octets identiques | **oui** |
| **E5** | **Textes** : libellés d'un cardio seul (plus de « après séance »), aides, Guide, `NEW_FEATURES`, pop-up courte ; **Milo : banc A/B (R34)** | texte de Milo avant/après ; annonce prête (AC-14) | **oui** |
| **E6** | **Preuve complète** : campagne de mutations de tout le lot, passe D-031 répartie (+ classique à la publication), documentation (`CLAUDE.md` 1 ligne, `INVENTAIRE.md`, archive), journal clos, **PDF vérifié**, rapport avec **compteurs R17 mesurés** et **estimé vs réel** | | — |
| **E7** *(sur décision)* | champs **structurés** par machine (D4 E-2) ; calendrier (LIM-12) ; Milo qui livre un cardio seul ; import d'historique avec cardio ; cardio planifié dans les programmes — **chacun est un chantier à part**, rien n'est lancé sans accord | | — |

### 8.1 Estimation (méthode D-088 : durées **mesurées**, développement **séparé** des tests, risque de reprise **dit à part**, **une** estimation centrale)

*Repères mesurés (`docs/PROCESSUS-DEVELOPPEMENT.md`, 18/10, et mes propres livraisons des 05-07/11)* : passe D-031 répartie **≈ 37-48 min** ; classique **≈ 80-96 min** ; contrôle négatif **≈ nombre de mutations × durée du banc ÷ files** (≈ 17 min pour 32 mutations, banc de 75 s, 3 files) ; bancs voisins **≈ 20 min** ; contrôle ciblé **1-2 min** ; une correction d'écran bornée **≈ 12-40 min** de code ; TDEE V2 étape 2 (un calcul, 4 écrans, 97 mutations, passe complète, PDF) **≈ 3 h 30** de bout en bout ; « Autre activité » (une tuile, un écran, un mécanisme de calories, 131 témoins) **≈ une journée**. Ce chantier est **de la taille de « Autre activité » sans écran neuf**, mais avec **près de 90 lignes de lecture** (86 sur la branche) à faire passer par le traducteur.

| Étape | Développement (lire, coder, écrire les témoins, documenter) | Exécution des tests (mesurable, non recouverte) |
|---|---|---|
| E0 | ≈ 45 min | ≈ 10 min (banc sur les deux arbres) |
| E1 | ≈ 2 h 15 | ≈ 10 min (25 mutations) |
| E2 | ≈ 2 h 30 | ≈ 30 min (voisins 20 min + 35 mutations en 3 files) |
| E3 | ≈ 2 h 30 | ≈ 20 min (parcours Playwright, mesure du bouton) |
| E4 | ≈ 2 h | ≈ 15 min |
| E5 | ≈ 1 h 15 | ≈ 15 min (le banc A/B de Milo se compte à part, plus bas) |
| E6 | ≈ 1 h 15 (docs, PDF, rapport) | ≈ 50 min (campagne finale ≈ 25 min + D-031 répartie ≈ 45 min, en partie en parallèle) |
| **Total** | **≈ 12 h 30** | **≈ 2 h 30** |

> **Estimation centrale : ≈ 15 h de bout en bout** (≈ deux journées de séance), **publication non comprise** (la passe classique ≈ 90 min, le déploiement et les vérifications suivent le GO de publication — deux fois si D7).

**Risques de reprise, à part (ils s'ajoutent, nommés)** :
- **+ 90 min** : une seconde passe complète, si un témoin déjà existant doit être re-visé tard (K5, §9.3) — ou si une ancre de contrôle négatif (§6bis) ne se laisse pas re-ancrer sans changer le sens du test.
- **+ ≈ 1 h et le coût des appels API** : le banc A/B de Milo (R34) pour le changement de libellé (E5) — **non lancé ici** ; sans lui, le libellé de Milo reste celui d'aujourd'hui.
- **+ ≈ 20 min** : refusion avec Nutrition / Import IA au moment de l'intégration (K10).
- **Attente** : la décision **D1** — sans elle, le chantier ne démarre pas.

*Estimé vs réel : à comparer dans le rapport final du chantier (D-088). Pour cette **étude**, qui n'avait **pas été estimée au démarrage** (écart à D-088, à écrire avant la première commande) : voir le journal de partage (ligne close).*

---

## 9. Plan de tests et critères d'acceptation

### 9.1 Principes (règles R17, R35, protocole deux sessions)

- **Un test protège un invariant, pas une implémentation** : tout témoin **réécrit** doit ensuite **rougir sous mutation volontaire** ; un scénario qui ne peut pas rougir ne mesure rien.
- **Le banc des anciennes séances est écrit AVANT le code** (E0) et doit être **vert sur le code actuel** : c'est la référence ; il doit le rester après chaque étape.
- Nouveaux blocs **préfixés par session** (`B-CCC…`, jamais renommés) ; *les noms `C-CARD-A…I` ci-dessous sont des noms de travail*.
- Une **chaîne de source** ne se teste pas par un test de comportement : un **témoin de source** dit « aucun lecteur n'échappe au traducteur », comme `C-ACT-J30/J31` le fait pour `S.sessions` sur la branche.

### 9.2 Les bancs à créer

| Banc | Invariant protégé | Cas principaux |
|---|---|---|
| **`C-CARD-A`** Traducteur + anciennes séances | les six séances de §6.2 : blocs, minutes, kcal, texte, charge, durée **identiques à l'octet** ; `calories` / `calData` stockées **jamais recalculées** ; **lire ne modifie rien** (empreinte avant / après) | L1-L6 (dont **L5**, le piège) ; blocs avec `kcalEst` (branche) ; le moment (`avant` ← `cardioAvant`, `apres` ← `cardio`) |
| **`C-CARD-B`** Vue moteur | `calcSessionCalories(vue)` = `calcSessionCalories(ancien)` **à l'octet** pour toute séance qui tient dans les deux emplacements ; avec N blocs, le moteur ne reçoit **que** `ΣA` et `ΣB` | corpus de 20 séances (muscu × cardio × moment) ; **mutation : lui passer la liste → rouge** |
| **`C-CARD-C`** Écrivain + conversion | ajouter · retirer · modifier ; conversion **idempotente** ; **jamais les deux formes** dans une séance ; **rien perdu** (type, intensité, durée, kcal\*, moment) ; **annuler = octets identiques** ; une séance **non ouverte** n'est pas réécrite | tous les chemins d'écriture : saisie, détail, Milo, programme, montre |
| **`C-CARD-D`** Même activité, même total | cardio seul : **1, 2 ou 3 blocs → même total** (§0, §2 LIM-4) **à l'arrondi près** (chaque bloc arrondit au kcal : **≤ 1 kcal par bloc**) ; mixte : le moteur voit la même chose qu'avant | Tapis modéré 34 min : 249 / 250 / 249 (arrondi par bloc) ; D-114 après allongement d'un bloc |
| **`C-CARD-E`** Lecteurs | **témoin de source** (plus aucune lecture de `cardioAvant`/`cardio` hors traducteur) ; la partition « dedans / dehors du chrono » **existe une fois** (`_rythmeSeance` l'appelle) ; **V2 : 5 + 5 + 5 d'une même séance = 15 min**, mais une saisie et une activité de la montre au même moment **fusionnent encore** ; récupération additive ; genre | un par lecteur de §5.4 |
| **`C-CARD-F`** Entrées | **P1** : un programme à deux cardios avant la muscu → **les deux** arrivent ; **P2** : cardio seul à 2 machines → genre `'cardio'` ; montre : **ajoute**, ne remplace pas ; l'enveloppe `{avant, apres}` de Milo est acceptée (le tableau reste refusé comme aujourd'hui) ; « au milieu = exercice » **intact** | `_cardioVersWkt`, `_extraireCardioMilo`, `_appliqueMiloSession`, `utiliserActiviteMontre` |
| **`C-CARD-G`** Écrans (Playwright) | ton cas en **trois saisies** ; ajouter / retirer ; durée vide ne compte pas ; **aucun « avant/après » sans musculation** ; puce proposée selon le chrono ; carte d'historique **avec** sa durée ; ancienne séance affichée en deux lignes ; **bouton central : delta 0 px** (règle d'or #9) ; captures 390 × 844 | un parcours par cas de §4 |
| **`C-CARD-H`** Synchro / exports | séance à `cardioBlocs` : aller-retour `persist` + `load` **octet pour octet** (comme `G13`) ; **vrai `Code.js` (vm)** : `J(sm) === J(m)` (comme `G4`) ; union / conflit (comme `G6`) ; CSV : une ligne par bloc, libellé conditionnel ; **SHA du CSV d'un jeu ancien = master à l'octet** (comme `H1`) | |
| **`C-CARD-I`** Milo | ligne de contexte : cardio seul **sans** « après séance » ni clé « modere » ; séance mixte avec moments ; ancien format inchangé. **Banc A/B (R34)** hors passe (appels API) | |

### 9.3 Les tests existants que le chantier touche (relevé C — comptes par recherche, aucune passe lancée)

| Fichier | Ce qu'il fige | Classe |
|---|---|---|
| `tests/parcours/runner.js` (≈ 3 800 assertions ; ≈ 86 mentions du cardio) | **L1113-1170 « DEUX MOMENTS »** (7 : `setCardioField`, `S.wkt.cardio*`, « avant 10min » / « après 25min », « échauffement Vélo 10min ») ; `#cardio-save-btn` (L1448-1466, 1762-1766) ; ligne de Milo « cardio: » (L4907-4930) ; recalage garde `calData.cardio` (L4995-5017) ; « la montre ne rattache jamais seule » (L5507-5547) ; total = Σ + cardio + échauffement (L6503-6520) ; **CIX / CCXLVI-CCLI** (`_extraireCardioMilo`, `_cardioDeclare`, contrat IA avant/apres) ; **CCXXVI\*** (cardio seul, `saveCardioEntry`) ; CCLXVI (jour de programme) ; CCLXXXII | **U** (+ **W** pour les libellés) — **L1163 (rétrocompat) et plusieurs autres = K** |
| `tests/calculs/runner.js` (≈ 318 ; ≈ 26 mentions) | maths pures sur objets **au format ancien** (§6, doublon d'échauffement, durée totale, récupération) | **K** — c'est précisément le filet des anciennes séances |
| `tests/parcours/autre_activite.js` *(branche, 130)* | B10-B15 anciens blocs · **G13/T37** six anciens enregistrements identiques à l'octet après persist + load · **G4** vrai `Code.js` · G6 union/conflit · **H1** SHA du CSV · J30/J31 (sites de garde) | **K** surtout ; B1-B9 **U** ; J30/J31 **S** |
| `tests/parcours/tdee_v2.js` *(branche, 145)* | helper `cardioSeul` ; le moteur lit `[s.cardioAvant, s.cardio]` (`tracking.js:3966`) | **U** + **S** (S118) |
| `travail_existant.js` · `seance_ux.js` D8 · `ux_integration` F3 · `aides_audit` · `fig_face_dos` ⑨ · `debrief_demande` T2 | sélecteurs `#log-cardio…`, `S.wkt.cardio*`, regex `_cardioNoteMin\(\)>0` ; invariant « un cardio noté n'est jamais effacé / jamais sans exercice » | **U** (UI) ; l'**invariant = K** |
| `seance_chiffres` (102) · `nut_punch01` B-NP01-A · `debrief_provenance` · `historique_cloud` | `calcCardioKcal(cardioAvant) + (cardio)`, `calData.cardio`, rechargement octet pour octet, `_seCardioTxt`, brouillon intact | **K** (`nut_punch01` a déjà dû être assoupli une fois pour des champs ajoutés au bloc) |
| `seance_date.js` L269 · `tests/recette/registre.json` | chaîne de source exacte ; déclencheurs `_cardioNoteMin`, `_cardioVersWkt`, `_extraireCardioMilo` | **S** |
| **`tools/mut_*`** (8 outils, §6bis) | ancres = chaînes de source exactes | **S — à re-ancrer** |

*K = garde à **garder** (entrée au format ancien) · U = à mettre à jour · W = lié à un libellé · S = lié à une chaîne de source.* **Filets les plus sûrs pour les anciennes séances, sans migration** : `autre_activite` (G13/H1/B10-B15 + G4), `calculs/runner`, `nut_punch01` + `seance_chiffres`, `historique_cloud` (pour l'union — **mais aucune fixture n'y porte de cardio**), `tools/chaos/banc.js` (vrai `Code.js` + PostgreSQL, dernier-écrivain-gagne).

### 9.4 Les contrôles négatifs (mutations) — chaque invariant doit rougir

≈ **25 mutations en E1**, ≈ **35 en E2**, ≈ **20 en E3-E5**. Les plus importantes : le traducteur ne lit que `cardio` (perd l'avant) · il lit **les deux formes** (double comptage) · la vue moteur reçoit **la liste** · l'écrivain **oublie de supprimer** les anciens champs · la conversion se fait **à l'ouverture** (au lieu de l'enregistrement) · le détail écrit dans la séance **sans passer par la copie de travail** · `_dureeTotaleMin` compte l'avant **deux fois** · le forfait est **ajouté** à un cardio seul · `djDedoublonner` **fusionne** deux blocs d'une même séance · `_cardioLibelle` écrit « après séance » pour un cardio seul · `_cardioVersWkt` / la montre **remplacent** au lieu d'ajouter · la puce avant/après est visible **sans musculation** · le bouton central **bouge**.

### 9.5 Scénarios de bout en bout

| # | Scénario | Attendu |
|---|---|---|
| **S-01** | **Ton cas** : Tapis modéré 17 + 17 (cardio seul) | « 34 min · ~250 kcal · 2 activités » ; aucun « avant/après » ; carte d'historique avec « 34 min » |
| **S-02** | la même activité en **1 bloc de 34 min** | même total à l'arrondi près (≤ 1 kcal par bloc) |
| **S-03** | **trois machines** : Tapis 12 + Vélo 12 + Rameur 10 | une carte, une somme, trois lignes |
| **S-04** | **durée vide** sur une 2ᵉ ligne | la ligne ne compte pas ; « Terminer » n'est pas armé par elle |
| **S-05** | retirer la 1ʳᵉ ligne, garder la 2ᵉ | total = la 2ᵉ ; ordre conservé |
| **S-06** | **ouvrir et enregistrer sans rien changer** une ancienne séance | octets identiques (D-114) |
| **S-07** | **allonger** un bloc d'une séance enregistrée | rapport après / avant appliqué aux calories d'origine ; conversion de **cette** séance |
| **S-08** | séance **mixte** : bloc ajouté avant toute série, puis après | puce *avant* proposée, puis *après* ; moteur identique à aujourd'hui |
| **S-09** | **jour de programme** à deux cardios avant la muscu | **les deux** arrivent dans la liste (P1) |
| **S-10** | séance **de Milo** avec cardio « avant » et « après » | rangés dans la liste avec leur moment |
| **S-11** | activité de la **montre** sur une séance qui a déjà un bloc | **ajoutée**, rien n'est remplacé (P10) |
| **S-12** | **restauration** depuis un autre appareil, séance au format ancien d'un côté, nouveau de l'autre | pas de perte ; au pire un conflit rangé à part (§6.3) |
| **S-13** | **retour arrière simulé** (code d'avant E3 lisant une séance à liste) | séance non perdue, calories justes, détail des blocs absent (§6.3) |

### 9.6 Critères d'acceptation

| # | Critère | Mesure |
|---|---|---|
| **AC-1** | aucun écart sur les **six anciennes séances** (§6.2) : texte, kcal, durée, charge, `calories` | banc `C-CARD-A`, à l'octet |
| **AC-2** | le **moteur de calories n'est pas modifié** et sa sortie est identique | diff du bloc `calcSessionCalories` = 0 octet ; `C-CARD-B` |
| **AC-3** | **même activité, même total** pour 1, 2 ou 3 blocs d'un cardio seul (D2 confirmée), à l'arrondi par bloc près | `C-CARD-D` |
| **AC-4** | une séance ancienne **non ouverte** n'est **jamais réécrite** | empreinte identique avant / après `persist` + `load` |
| **AC-5** | modifier une ancienne séance : **rien perdu**, calories d'origine gardées si l'effort n'a pas bougé, **annuler = octets identiques** | `C-CARD-C`, S-06/S-07 |
| **AC-6** | **jamais les deux formes** dans une même séance, quel que soit le chemin d'écriture | `C-CARD-C` + mutation |
| **AC-7** | ton cas en trois saisies ; **aucun mot « avant/après » sans musculation** ; durée vide ne compte pas | `C-CARD-G`, S-01 → S-05 |
| **AC-8** | **bouton central « + » : écart 0 px** à chaque étape qui touche l'écran | mesure Playwright (règle d'or #9) |
| **AC-9** | **aucun lecteur** de `cardioAvant`/`cardio` hors du traducteur | témoin de source (les 86 lignes de lecture de la branche sont toutes classées) |
| **AC-10** | TDEE V2 : **5 + 5 + 5 d'une même séance = 15 min** ; le dédoublonnage montre ↔ saisie reste intact | `C-CARD-E` |
| **AC-11** | synchro : aller-retour octet pour octet ; vrai `Code.js` ; union / conflit comme avant ; **aucun champ racine nouveau** ; CSV d'un jeu ancien = master à l'octet | `C-CARD-H` |
| **AC-12** | **toutes** les mutations du lot sont tuées par leur contrôle requis ; chaque témoin réécrit rougit sous mutation ; les ancres des 8 outils sont **re-ancrées** | contrôle négatif sur arbre copié |
| **AC-13** | passe D-031 répartie : **0 rouge nouveau** (les 7 rouges « préexistants » étaient des pièges de date, déjà réglés dans les tests de la branche) ; la **classique** à la publication | passe complète |
| **AC-14** | **annonce prête** (règle d'or #11) : point rouge, aide `?`, aide détaillée, diapo du Guide ; `CLAUDE.md`, `INVENTAIRE.md`, archive, `BUGS.md` à jour | `check_regles.py` |
| **AC-15** | **compteurs R17 mesurés** et rapportés (données · fichiers · lignes · chemins supprimés) | rapport final |
| **AC-16** | **Milo** : banc A/B (R34) avant / après si le libellé est livré — sinon le libellé de Milo reste celui d'aujourd'hui, **et c'est dit** | `C-CARD-I` |

---

## 10. Décisions attendues de Michel

*« Le code actuel et les mesures disent ce qui EST ; Michel décide ce qui DOIT ÊTRE. »* (règle d'or #15) — pour chaque point : **ma recommandation**, et ce qui se passe **si tu ne tranches pas**.

| # | La question | Ma recommandation | Si tu ne tranches pas |
|---|---|---|---|
| **GO CODE** | Peut-on commencer le développement (E0 → E6) ? | Oui, **après D1**. | Rien n'est écrit dans l'application. |
| **D1** | **Sur quelle base ?** (a) **ma branche isolée** `claude/dreamy-bell-pu88ia` (elle porte déjà « Autre activité » + TDEE V2 : calories par bloc, genre dérivé, D-ACT-4) ; (b) **d'abord intégrer** « Autre activité » + TDEE V2 à la ligne ft-v1264, puis une **nouvelle branche** cardio ; (c) **master seul**, sans rien de la branche. | **(a)** pour démarrer vite (les fondations sont là, rien n'est publié) avec une **fusion à blanc** à chaque étape ; **(b)** est l'ordre d'intégration cible. **(c) déconseillé** : il refait le forfait, puis une seconde fusion (K1). | Le chantier **n'est pas démarrable** : la base conditionne ce qu'on a le droit de réutiliser. |
| **D2** | **Séance 100 % cardio : plus de forfait d'échauffement / retour au calme ?** (aujourd'hui sur master : 272 kcal en un bloc, 250 en deux). | **Oui** — D-ACT-4 *confirmé et étendu* : total = somme des blocs, **même total quel que soit le découpage**. Les **anciennes** séances gardent leur total d'origine (D-114). | Le total d'un cardio seul dépendra de la façon de découper (LIM-4). |
| **D3** | **Séance mixte : la puce « avant / après » par bloc**, proposée *avant* tant qu'aucune série n'est validée, *après* ensuite, modifiable ; un bloc sans moment compte « après ». | **Oui.** | Sans étiquette, le forfait du moteur et la durée (chrono) ne savent plus classer un bloc. |
| **D4** | **« Paramètres facultatifs »** : une **note libre** par bloc (« pente 5 %, 9 km/h »), **sans effet sur les calories** ; les champs **structurés** par machine seulement quand un calcul ou une comparaison les lira (barème MET à valider par toi, D-119). | **Note libre maintenant, structuré plus tard.** | Pas de paramètres du tout dans la 1ʳᵉ version. |
| **D5** | **Ce que compte « N activités cardio »** : les bilans disent « activités » pour les **blocs** et « séances » pour les **enregistrements** (« 1 séance de cardio · 3 activités · 52 min »). | **Oui, tel quel** (c'est le sens que la branche a déjà). | Les bilans gardent leur sens actuel. |
| **D6** | **Modifier une ancienne séance** : sa conversion à l'enregistrement de la modification (jamais en bloc, jamais si on ne l'ouvre pas). | **Oui.** Alternative : anciennes séances en lecture seule pour le cardio (moins de code, mais frustrant). | Les anciennes séances ne se modifient plus côté cardio. |
| **D7** | **Une ou deux publications ?** Deux : **(1)** l'app apprend à *lire* les deux formes (invisible), **(2)** elle *écrit* la nouvelle. | **Deux** : le retour arrière de la 2ᵉ reste sans danger (règle d'or #8) ; coût : une passe classique + un déploiement de plus. | Une seule : le risque K7 (appareil pas à jour, retour arrière) est **connu, borné, accepté**. |

**Choix d'interface à valider sur maquette à l'étape E3** (rien à trancher aujourd'hui) : nouvelle ligne pré-remplie avec la machine et l'intensité de la précédente (durée vide) · deux blocs identiques consécutifs affichés tels que saisis (pas de fusion « 2 × 17 min ») · place de la puce avant/après · libellé du bouton « + Ajouter une activité cardio ».

**À ne PAS rouvrir (décisions actées, règle d'or #15)** : `ft-v995` (« un cardio au milieu reste un exercice ») · D-119 (aucun nouveau barème MET sans validation) · le moteur de calories gelé · le principe « Autre activité » = tuile à part.

---

## 11. Défauts découverts en chemin — **listés, NON corrigés** (consigne : pas de correction annexe)

*La colonne « Sort » dit ce que le chantier en fait **si tu le lances** ; « hors chantier » = je n'y touche pas sans ton accord.*

| # | Défaut | Preuve | Sort |
|---|---|---|---|
| **P1** | **Perte silencieuse au chargement d'un programme.** Un jour de programme avec **deux** cardios du même côté (Tapis 5′ + Elliptique 8′ avant la muscu) : l'import garde le 2ᵉ dans `exs` ; au chargement, `_cardioVersWkt` le ré-extrait puis **le jette** parce que le créneau est pris → l'elliptique **disparaît**, ni dans les exercices ni dans le cardio. Symétrique côté « après ». | **OBSERVÉ** (fonctions réelles de `log.js` sous Node, rejoué par moi) : `S.wkt` = `exs` [DC, SQ] + Tapis + Rameur, l'elliptique n'existe plus. `log.js:8091-8102`. | **réparé par E3** (ajouter au lieu de « créneau vide ») — changement visible, à annoncer |
| **P2** | **Un cardio seul à deux machines est classé « musculation »** quand il vient de Milo / d'un import : la 2ᵉ machine reste un « exercice » → `exs` non vide → genre `'muscu'` (`state.js:903-910`) au lieu de `'cardio'`. | **OBSERVÉ** (Node, `_extraireCardioMilo` sur [Tapis, Elliptique]) : `restes: ["Elliptique"]`. | **réparé par E3** |
| **P3** | **TDEE V2 (mon code, branche) fusionne des blocs d'une même séance** comme « doublons » : deux blocs de même famille à ≤ 10 min d'écart de début et ≤ 25 % d'écart de durée comptent une fois. | **LU** (`tracking.js:3847-3861`, `3959-3970`) + **mesuré par le relevé B** : Tapis 10 + 10 → 10 min ; 5 + 5 + 5 → 5 min ; 12 + 12 intact. | **réparé par E2** (anti-fusion intra-séance) |
| **P4** | **Un brouillon de cardio seul n'est jamais récupéré.** `persist()` écrit bien la copie de secours d'une séance de cardio seul (`state.js:1259-1267`, ajouté le 04/09 : *« 4ᵉ endroit qui lisait des exercices »*) mais `_recoverDraft` (`app.js:11207`) exige encore `draft.exs.length` — **5ᵉ endroit**. Portée **étroite** : la copie ne sert que si `finishWorkout` a planté ; `S.wkt` reste restauré par son propre chemin. | **LU** (les deux sites) | **hors chantier** — une ligne (`_seanceOuverte`) ; règle d'or #3 : je la propose à part |
| **P5** | **Les tuiles cardio du tableau de bord PC sont toujours à 0.** `dashboard.js:252-253` et `417-424` lisent `cardio` / `cardioPre` / `cardioPost` et `.min`, que l'app n'écrit jamais (`cardioAvant`, `duration`). | **OBSERVÉ** par le relevé A (44 min notées → 0) ; code relu par moi ; déjà **F17** de `docs/AUTRE-ACTIVITE-CALORIES.md` | **hors chantier** |
| **P6** | **Le message « ce qu'on n'a pas su placer » ne s'affiche jamais.** `toast()` est mono-emplacement (`tracking.js:174`) et `_appliqueMiloSession` en enchaîne 3-4 dans le même tick : seul « Séance prête » reste. En modes « ajouter / remplacer », un cardio de Milo déjà sorti de `exs` est **jeté** si le créneau est noté (`log.js:9600`) pendant que le message annonce le placement. | **DÉLÉGUÉ** (A, non recoupé) | **réparé par E3** pour la perte (ajouter) ; le toast : hors chantier |
| **P7** | **L'import d'historique ne sait pas lire une ligne de cardio** : elle perd ses séries (`_serieValide` exige un poids > 0) et son nom devient un exercice perso « Autres », signalé aux « Exercices manquants ». La garde cardio de `ft-v1168` n'existe que pour l'import de **programme**. | **DÉLÉGUÉ** (A) | **hors chantier** (E7) |
| **P8** | **Le cardio planifié d'un programme est en écriture seule** depuis `ft-v1168` : rangé sur le jour, lu par personne sauf au chargement. Milo ne le voit plus (`coach.js:4233`, `exList(j&&j.exs,10)`), ni l'éditeur, ni l'impression, ni le PDF ; **« Enregistrer comme programme » ne recopie pas** les blocs cardio de la séance. | **DÉLÉGUÉ** (A) | **hors chantier** (E7) |
| **P9** | **Milo ne peut pas livrer une séance 100 % cardio** : quatre gardes sur `exs.length` (`coach.js:2327`, `2580`, `log.js:9066`, `worker.js:1121`) alors que le prompt la dit « parfaitement valable » (`coach.js:4345`). | **DÉLÉGUÉ** (A) | **hors chantier** (E7) |
| **P10** | **Import depuis la montre sans traçabilité** : le bloc créé n'a ni début, ni calories, ni source ; un 2ᵉ import sur le même créneau **détruit le 1ᵉʳ** après confirmation (`setup.js:1437`). | **DÉLÉGUÉ** (A) | **réparé par E3** pour le remplacement (ajouter) ; la provenance : hors chantier |
| **P11** | **Milo lit la clé brute `modere` et « 17min » collé** : deuxième propriétaire du libellé (`_cTxt`, `coach.js:3672`, branche ; 3646 sur master), alors que `CARDIO_INTENSITES` existe pour ce défaut. | **OBSERVÉ** (ligne lue par Milo) | **réparé par E2/E5** |
| **P12** | **La carte d'historique n'a aucune durée pour un cardio seul** (elle lit `s.duration` brut, `setup.js:2146`, donc 0 : le chrono n'a jamais tourné) ; la musculation n'y montre pas son cardio d'avant : deux durées pour une même séance. | **OBSERVÉ** (capture : « 279 kcal » + texte, sans « 34 min ») | **réparé par E4** |
| **P13** | **Le calendrier ignore le cardio** : un jour de cardio seul s'affiche « Séance », couleur par défaut, tonnage « — ». | **DÉLÉGUÉ** (B) | **hors chantier** (E7) |
| **P14** | `calData.totalMin` et `warmupMin` **incluent** le forfait (39 min pour 34) alors que le total d'un cardio seul **nouveau** l'exclut (D-ACT-4). | **OBSERVÉ** (`R2`/`R3`, branche) ; **aucun lecteur** trouvé hors du moteur (grep) → sans effet visible | à épingler en E1 (cohérence de `calData`) |
| **P15** | **Export PDF de l'historique** : tableau par date, titre = `rows[0].seance` ; le cardio est poussé **avant** les exercices → un jour muscu + cardio peut s'intituler « cardio après — mercredi » ; sous-titre « Séries validées uniquement » alors que des durées y figurent ; le toast compte la ligne CARDIO comme une « série » (« 50 séries » = 49 + 1, épinglé par `H1`). | **DÉLÉGUÉ** (C) — `setup.js:578-677`, `:615`, `:458` | **hors chantier** (le libellé « cardio avant/après » du CSV est, lui, traité en E4) |
| **P16** | **Des ancres de contrôle négatif sont déjà périmées** : un contrôle par script (35 outils sur 128) donne **11 ancres cassées par la branche** (`seance_chiffres` 2 dont `_calDataSeance`, `nut_punch01` 2, `progres_seances` 7) et **8 manquantes sur les deux arbres** (`aides_audit`, `calculs_provenance`, `fig_face_dos`, `seance_recette` ×3, `lot3`, `progres_seances`) : ces gardes ne sont **plus éprouvées**. | **DÉLÉGUÉ** (C, script en lecture seule) ; le balayage des 128 outils a été abandonné (un module a des effets à l'import) | **hors chantier**, sauf les 8 outils que le chantier touche (§6bis) |
| **P17** | **Dernier-écrivain-gagne sur la liste entière des séances** : un 2ᵉ appareil périmé efface côté serveur ce qu'il n'a pas vu (l'union le rattrape, une **suppression ressuscite**) ; aucun verrou dans `Code.js` (`saveProfile`, `pushHealth`, `adminRestore` relisent-modifient-écrivent le même blob) ; `ft4_sessions_conflits` est **écrite, jamais lue**. Le harnais de synchro remplace le stockage par une `Map` : gzip, `h_` et le réservoir ne sont **jamais exercés** par les tests. | **DÉLÉGUÉ** (C : F1, F2, F11) | **hors chantier** — il n'est ni créé ni aggravé par une liste **dans** la séance |
| **P18** | **`check_regles.py` est rouge sur master publié, avec ou sans cette étude** : « `DOSSIER-ATHLETE-SUIVI.md` : le tableau des 8 briques est PÉRIMÉ — relancer `python3 tools/briques.py` ». | **OBSERVÉ** : même sortie sur une copie propre de `origin/master` (`e2b942f3`) et sur la branche | **hors chantier** (non corrigé : consigne) |
| **P19** | **`docs/INVENTAIRE.md` de la branche est en retard sur son propre code** : la régénérer ajoute la modale `ov-autre` (« Autre activité ») et 27 fonctions (diff de 7 lignes). **Non régénéré ici** : l'étude reste purement documentaire et la branche d'Import IA touche aussi ce fichier (collision évitée). | **OBSERVÉ** (`tools/inventaire.py` lancé puis annulé) | à régénérer **à l'intégration** |

---

## 12. Limites de l'étude — ce que je n'ai pas pu lire ou mesurer

- **Drive — registre des bugs** (`SUIVI DES BUGS — FORCE TRACKER`) : **accessible en lecture**, mais l'outil ne renvoie qu'**un échantillon** (les deux premières lignes de chaque onglet) : **je n'ai pas pu lire** d'éventuelles lignes « Séance / cardio » déjà ouvertes ni vérifier l'ID proposé. *Règle #19 ① : je le dis, je ne suppose pas l'avoir lu.* Un export du registre (onglets Bugs · Consolidé · Évolutions) permettrait le rapprochement.
- **Drive — Passation Maître** : lue **en partie** (le point de reprise du 07/11 et les entrées du 06/11 — c'est là que la demande est consignée, **sans** numéro de ticket ; une recherche par mots-clés sur le reste n'a pas été faite). **Rien n'a été écrit sur Drive** (règle #18) ; le bloc registre + passation est fourni **à part**, à coller par Michel.
- **Aucun test sur iPhone réel.** Les sondes tournent dans Chromium (Playwright, 390 × 844, réseau coupé, stockage jetable) ; les relevés « Node » du relevé A chargent les **vraies fonctions** de `log.js`, pas l'application entière.
- **Relevés délégués** : A (points d'entrée), B (lecteurs) et C (synchro, exports, tests) m'ont fourni des catalogues ; je les ai **recoupés** sur les points qui décident l'architecture (partition de durée, forfait du moteur, dédoublonnage V2, `_recoverDraft`, schéma du Worker, chargement d'un programme). **Non recoupés** (étiquette « DÉLÉGUÉ ») : P6, P7, P8, P9, P10, P13, P15, P16, P17 et le détail de la synchro Supabase. **Non déterminé même par eux** : si l'Apps Script **déployé** est bien le `Code.js` du dépôt (injoignable d'ici — `Code.js` est **identique** entre master et la branche, vérifié par moi) ; la limite réelle par valeur des Script Properties et le taux de remplissage actuel du réservoir (lisible dans « Santé du système », jeton admin) ; les plafonds de taille POST (Apps Script, Worker, PostgREST) ; l'effet de la ligne Nutrition **non fusionnée** (lu seulement `a87cc89d` : ligne `sessions` de `_cloudSync` et repli de quota identiques, le reste non audité).
- **Numéros de ligne** : ceux de la **branche** ; master est décalé (§5).
- **Un incident d'outillage, dit tel quel** : pour balayer les ancres de contrôle négatif (§6bis), le relevé C a **importé** des outils `tools/mut_*.py` ; l'un d'eux (`mut_clone_isolation.py`, sans garde `__main__`) a **lancé son banc à l'import** (« arbre sain : 22 OK / 0 rouge ») et commençait ses mutations quand l'agent l'a arrêté. Ce banc travaille sur une **copie** de l'arbre : **aucune écriture dans le dépôt** (`git status` : seul le présent fichier ; checkout principal propre — vérifié par moi), aucun processus restant ; j'ai supprimé les deux copies temporaires orphelines (`/tmp/mutclone_*`, 4,5 Mo chacune). Conséquence pour la confiance : le balayage des ancres est **partiel** (35 des 128 outils), ce que §11-P16 dit déjà.
- **Aucune passe D-031** n'a été lancée : c'est une étude, rien n'a été modifié.
- **Estimation** : sans mesure directe d'un chantier de cette forme ; elle est bornée par deux repères (TDEE V2 étape 2, « Autre activité »), dits en §8.1.
- **Ce que l'étude ne dit pas** : l'effet sur **Apple Santé réel** (`healthInbox`) au-delà du chemin d'import lu ; les **performances** (une liste de 3-5 blocs ne pose pas de question de volume) ; l'**ergonomie** réelle de la liste sur iPhone — elle se décide sur maquette (E3).

*Sondes utilisées (hors dépôt, non versionnées) : `S1` ton cas · `S2` moment inconnu · `S3` six anciennes séances · `S4` traducteur prototype · `R1-R3` le vrai cas · `E` écrans. Leur forme durable est le banc `C-CARD-A` de §9.*
