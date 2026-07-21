# 🧩 Modèle métier de Force Tracker — le langage commun (v0.4)

> **v0.4 (21/07/2026)** — intègre le retour **Gemini** (3ᵉ voix, tour de table complet) : **ANALYSÉ confirmé** (« abstraction brillante », = couche de métadonnées **non destructive** → débat GPT/Mistral clos) ; **Série à métriques flexibles** (temps/distance/calories/puissance, pas que reps/kg — pour endurance/CrossFit) ; **fuzzy matching** avant « inconnu » (existe déjà : `_lev`/Jaccard, à renforcer) ; **garde-fous éthiques TECHNIQUES** (anonymisation import · interdiction de re-partager un programme tiers · charte de transparence) ; et surtout l'**angle mort n°1 : versionnage du schéma de données + migrations client** (garantie technique de la rétro-compat / zéro perte).
> **v0.3 (21/07/2026)** — retour **Mistral** : garde-fous opérationnels éthiques + honnêteté « l'import envoie le doc à l'IA » ; réconciliation ANALYSÉ ; tempo structuré ; hiérarchie variantes ; boucle VM+IA avec validation ; items dynamiques différés.
> **v0.2 (21/07/2026)** — 1ᵉʳ retour GPT : 3ᵉ état **ANALYSÉ**, **Intention** extensible, **propriétés** portées par la fiche (VM relie, ne déduit pas — Principe 15), objet **Connaissance** (futur), « le modèle **est une grammaire** ».

> **Le cap (Michel, 21/07/2026)** : arrêter de penser *uniquement* « fonctionnalités » et penser **« objets métier »**. Définir un **langage commun** que TOUS les modules parlent (VM · import PDF · générateur IA · mode coach · statistiques…). *« On n'ajoute plus des fonctions, on construit un langage capable de représenter la programmation sportive. »*
>
> **Statut** : 🟡 fondation v0.1 — **vivant**. On le distille des **vrais programmes** (Christophe, Emma, Tatiana), on le complète au fil des cas. **Aucun code de prod modifié** : ce document définit le *langage*, il n'impose pas une réécriture du stockage (l'alignement des modules se fait progressivement).
>
> **Pourquoi maintenant** : un modèle clair = tous les modules parlent pareil = le projet tient des années au lieu d'être rafistolé. Investir un peu ici évite de tout reconstruire plus tard.

---

## ⚖️ Éthique — à quoi servent (et ne servent PAS) les programmes de coach *(Constitution, Principe 16)*

Les programmes de vrais coachs (Cyril, Emma, Tatiana…) servent **uniquement de validation métier** : comprendre leur **logique** pour savoir les **importer fidèlement · les représenter correctement · respecter leur travail · permettre au coach de suivre son athlète**.

- ✅ **Ce qu'on distille = le LANGAGE** (le vocabulaire générique : noms d'exercices, structures, principes) → ça, ça enrichit EXLIB/VM/ce modèle.
- ⛔ **Jamais le CONTENU** (leur programme = leur œuvre) : pas de base de données de programmes, **pas d'entraînement du générateur IA** sur leurs plans.
- 🔒 Un programme importé reste **privé à l'athlète** (son compte), jamais mutualisé.
- 🤖 **Le générateur IA produit TOUJOURS de l'original** à partir de principes généraux — **jamais** une reproduction.

*« Force Tracker représente et suit, il ne pille pas. L'IA s'inspire des principes, pas des œuvres. »*

### Garde-fous opérationnels — à mettre en place *(retour Mistral, 21/07)*
La posture (Principe 16) ne suffit pas : il faut des **garanties concrètes**. À implémenter :
- **Consentement explicite** au moment d'importer/partager un programme (cohérent avec le Mode Coach — l'athlète accepte le lien coach↔athlète).
- **Traçabilité** : logger la source (« importé du coach X le JJ/MM »).
- **Mode privé** : programme gardé **local**, aucune analyse IA sauf demande explicite.
- **Garde-fous TECHNIQUES** *(convergence Mistral + Gemini)* : **anonymisation** à l'import · **interdiction technique de re-partager/exporter publiquement** un programme importé d'un tiers · **charte de transparence** claire dans l'app. La posture (Principe 16) ne rassure pas un coach pro tant qu'elle n'est pas **techniquement garantie**.
- ⚠️ **Honnêteté à assumer** : aujourd'hui, l'**import envoie le document à l'IA** (serveur) pour le *lire* → le programme **quitte** donc le téléphone à l'import. Un vrai « mode privé » exigerait une **lecture locale** (OCR local, plus difficile) — à évaluer. Ne pas prétendre « 100 % local » tant que ce n'est pas le cas.

---

## Principe n°1 — PLANIFIÉ · RÉALISÉ · ANALYSÉ

La distinction la plus importante. Les mêmes objets existent en **trois états** *(le 3ᵉ ajouté sur suggestion GPT, 21/07)* :

- **Planifié** (la prescription) : ce qui est **prévu** — un programme, une séance à faire, « 4×8 à 80 % ».
- **Réalisé** (la performance) : ce qui a été **fait** — la séance loggée, « 4×8 à 82,5 kg, la 4ᵉ à l'échec ».
- **Analysé** (le sens) : ce que **Milo en comprend** — débrief, tendances, objectif tenu ou non, score, observations. *(existe déjà : débriefs, `S.registre`, observations, score de récup.)*

Force Tracker gère les trois (`S.programmes` = planifié · `S.sessions` = réalisé · débriefs/Registre = analysé). Le modèle doit **toujours** préciser de quel état on parle. C'est l'incarnation de *« Force Tracker conserve les données, Milo leur donne du sens »*.

> ⚖️ **Débat tranché (GPT + Gemini + nous : garder ; Mistral : ne pas dupliquer → satisfait)** : ANALYSÉ est un **état CONCEPTUEL** (il dit *qui* a produit l'info : coach = planifié · athlète = réalisé · Milo = analysé) mais, **techniquement, une couche de MÉTADONNÉES NON DESTRUCTIVE** posée par-dessus le réalisé — **jamais une copie, jamais une altération de l'historique brut** (formulation Gemini). On garde la clarté conceptuelle de GPT, sans la lourdeur que craignait Mistral, avec la garantie technique de Gemini.

---

## Les objets (le vocabulaire)

### 👤 Athlète
La personne. *(existe : profil `S`, `S.adn`, `S.registre`, `S.healthProfile`)*
- Identité (âge, sexe, taille, poids), niveau, discipline, morphologie.
- **ADN sportif** (durable, déclaré), **Registre** (faits mesurés + observations), **Santé** (contraintes → le Gardien).
- *poursuit* un ou plusieurs **Objectifs**.

### 🎯 Objectif *(porte une Intention)*
Ce que l'athlète vise. *(existe partiellement : `S.goal`, `S.targetWeight`, `S.level`)*
- **Intention = liste OUVERTE/extensible** *(précision GPT)* : force · hypertrophie · perte de gras · recomposition · endurance · **réathlétisation** · **préparation militaire** · **santé** · perf datée… On en ajoute sans casser le modèle.
- Cible (poids visé, 1RM visé…), échéance éventuelle.
- Un programme **sert** un/des objectifs ; l'intention nourrira le **niveau 3** (reconnaissance de l'intention d'un programme importé).

### 📋 Programme
Un plan structuré d'entraînement. *(existe : `S.programmes[]`)*
- Nom, **discipline/intention** (muscu · powerlifting · CrossFit… → *niveau 3 de la vision : reconnaissance de l'intention*), durée (semaines), auteur (coach humain · IA · perso).
- **contient** des **Cycles** *ou* directement des **Séances**.

### 🔄 Cycle *(mésocycle)*
Une phase du programme dans le temps. *(existe : `S.cycle` pour le cycle de force)*
- Type/phase (accumulation · intensification · peak · décharge), durée (semaines), logique de **progression** (+charge, +volume, %1RM montant…).
- **contient** des **Séances**.

### 🗓️ Séance
Une journée d'entraînement. *(existe : `S.programmes[].days[]` planifié · `S.sessions[]` réalisé)*
- Label, ordre/jour, **focus** (haut/bas · push/pull/legs · full body…).
- **contient** des **Blocs** et/ou des **Exercices**.

### 🧱 Bloc
Un groupe d'exercices avec une **structure** partagée. *(existe : `group` + `groupType`)*
- **Type de structure** : simple séquence · **superset** · **circuit** · **EMOM** · **AMRAP** · **HIIT/intervalles** · **giant set**…
- **Paramètres** selon le type : `rounds` (tours) · `durationMin` · `workSec`/`restSec`.
- ⚠️ C'est ici que vit le **chantier « structures »** (voir `PARSER-STRUCTURES.md`, jalon M0.5 = *reconnaître* la structure avant de l'interpréter).

### 🏋️ Exercice *(dans une séance)*
Un mouvement prescrit/réalisé. *(existe : `S.wkt.exs[]`, `S.sessions[].exs[]`)*
- **référence** un **Exercice-bibliothèque** (le rattachement = rôle du **moteur VM**).
- **porte** des **Séries**, une éventuelle **Méthode d'intensification**, des **Consignes techniques**, une note.

### 🔢 Série *(Set)*
Une série. *(existe : `sets[]` = `{kg, reps, type, rest, done, note}`)*
- Reps **ou** temps ; charge (kg · %1RM · RPE · « max ») ; **type** (N normal · É échauffement · X échec · D dropset) ; repos ; note.
- **Métriques flexibles** *(suggestion Gemini)* : la Série doit pouvoir porter, à terme, des mesures **non-poids/reps** — **temps · distance · calories · puissance (watts) · allure** — pour représenter l'endurance, le cardio, le CrossFit. Piste : un couple `{métrique, valeur, unité}` plutôt que des champs figés. *(À construire quand on ira sur ces disciplines — muscu classique d'abord.)*

### 📚 Exercice-bibliothèque *(la référence)*
Le mouvement canonique — **porteur de propriétés**. *(existe : `EXLIB` + taxonomie VM)*
- Nom, groupe musculaire, muscles, **schéma moteur** (14 patterns), famille, **alias** (FR/EN/marques), média (gif/photo).
- **Propriétés enrichies** *(suggestion GPT R3)* : **matériel** (barre/haltères/machine/poulie/poids du corps…), **niveau technique** (débutant/confirmé), unilatéral/bilatéral…
- Le **moteur VM** relie un nom brut → cette référence (sans doublon). ⚠️ **Frontière (Constitution, Principe 15)** : VM ne **déduit** pas ces propriétés du nom — il **relie** à une fiche qui les **porte déjà**. C'est la fiche qu'on enrichit, pas le parsing. « Le moteur comprend, le Gardien décide. »

---

## Les concepts transversaux (qualifient, ne contiennent pas)

### ⚡ Méthode d'intensification
Une technique appliquée à une série / un exercice / un bloc. *(partiel : `type` de série, Guide muscu)*
- Dropset · rest-pause · superset · myo-reps · cluster · pyramide · pré-fatigue · tempo/excentrique…
- ⚠️ Certaines sont une **structure de bloc** (superset), d'autres un **type de série** (dropset), d'autres une **consigne** (tempo). À ranger proprement — cas réels à l'appui.

### 📝 Consigne technique
Une instruction de coach attachée à un exercice/série. *(partiel : champs `note`)*
- « descente contrôlée 3 s » · « coudes serrés » · « dernière série à l'échec » · « amplitude complète ».
- Souvent lue dans les programmes de coach → **matière première de Christophe/Emma**.

### 🧮 Notation / prescription
La **façon d'écrire** le volume/l'intensité. *(partiel : `reps`, `kg`, `maxi`, `repsPerSet`)*
- `sets×reps` · `%1RM` · `RPE` · **tempo** (ex. 3-1-1) · `AMRAP` · « max » · reps montantes (ramping).

### 🧠 Connaissance *(objet transversal — FUTUR, niveau 3)* *(suggestion GPT R6/R7)*
La **capitalisation** : ce que Force Tracker apprend et accumule au fil du temps — **des principes, jamais des programmes** (Constitution, Principe 16). Deux facettes :
- **Connaissance générique** : vocabulaire (alias VM), schémas moteurs, familles, principes de programmation, structures. C'est le **patrimoine** (public, réutilisable, local). *(existe déjà, épars : EXLIB, `_EX_EQUIV`, taxonomie, lexique de structures.)*
- **Connaissance de l'athlète** : ce que Milo observe/relie sur SA personne (faits, corrélations, tendances). *(existe : `S.registre` — faits + observations.)*
- ⚠️ **On ne construit PAS cet objet maintenant** (une brique à la fois) — on le **nomme** pour savoir où rangeront, à terme, la mémoire vivante (briques 7-8) et les enseignements des analyses IA. Enrichi par l'état **Analysé**, jamais par la copie d'une œuvre.

---

## La grammaire (relations)

> Le modèle métier **EST une grammaire de la programmation sportive** *(formule GPT)* : un petit ensemble d'objets + des règles de composition qui permettent de **représenter n'importe quel programme**, comme une langue compose des phrases avec un vocabulaire fini.

```
Athlète ── poursuit ──▶ Objectif
Programme ── sert ──▶ Objectif   ,   appartient à ──▶ Discipline/Intention
Programme ── contient ──▶ Cycle*  (ou directement Séance)
Cycle ── contient ──▶ Séance     ,   porte ──▶ Phase / Progression
Séance ── contient ──▶ Bloc / Exercice
Bloc ── groupe ──▶ Exercices     ,   porte ──▶ Structure (superset/circuit/EMOM…)
Exercice ── référence ──▶ Exercice-bibliothèque (via VM)
Exercice ── porte ──▶ Série(s) , Méthode? , Consigne(s)?
Série ── décrit ──▶ reps/temps · charge · type · repos
```

---

## Comment chaque module parle CE langage

| Module | Rôle dans le langage |
|---|---|
| **Moteur VM** | Nom brut → **Exercice-bibliothèque** (rattachement, 0 doublon). |
| **Import PDF** | Document → **Programme** (Cycles/Séances/**Blocs**/Exercices/Séries) + reconnaît **Structures** (M0.5) + **Méthodes/Consignes**. |
| **Générateur IA** (prog force) | Produit un **Programme** dans ce modèle (chargeable en séance). |
| **Mode coach / Milo** | Lit **Athlète** + **Objectif** + **Registre** + historique de **Séances** réalisées. |
| **Statistiques / Progrès** | Agrège les **Séries réalisées** par **Exercice-bibliothèque**. |
| **Le Gardien** | Croise **Santé** (Athlète) × **Exercices** de la séance → adapte. |

> Le langage est l'**interface commune** : chaque module produit ou consomme les mêmes objets. On peut faire évoluer un module sans casser les autres.

---

## Points ouverts — à trancher SUR DES CAS RÉELS

*(remplis au fil des programmes de Christophe, Emma, Tatiana)*

| Question | Piste | Vu où ? |
|---|---|---|
| Une « méthode » (superset/dropset/tempo…) : structure de bloc, type de série, ou consigne ? | ranger par nature (les 3 existent) | Christophe (tempo, superset) |
| Consigne technique : champ libre ou vocabulaire structuré ? | libre d'abord, structurer si récurrent | Christophe/Emma |
| Cycle : toujours explicite, ou déduit (semaines + progression) ? | optionnel — un programme simple n'a pas de cycle | — |
| Charge : kg / %1RM / RPE / « max » — un champ unifié ? | `valeur` + `unité` | Force (%1RM), Femme (max) |
| Tempo (3-1-1) : notation dédiée ? | oui, champ `tempo` **structuré** (`{phase, durée, unité}`) — validable, lisible par Milo | Christophe (probable) · *Mistral* |
| Variantes d'exercice : hiérarchie dans la biblio (Squat → bulgare/avant) ? | famille + parent/enfant ; les **synonymes marchent déjà** (VM) | *Mistral* |
| **FUTUR (programmes dynamiques / Mode Coach — pas maintenant)** : blocs **conditionnels** (« si RPE<7 → +1 série »), **dépendances entre séances** (auto-régulation), moteur de **règles** Milo, **CRDT** (sync multi-écritures), **crowdsourcing** du lexique | pertinents surtout hors muscu classique → **différés** (une brique à la fois) | *Mistral* |
| Boucle d'enrichissement VM+IA (un cas résolu par l'IA enrichit le lexique) | oui, **avec validation** (palier « confirm ») — **jamais d'ajout auto aveugle** (garde le déterminisme) | *Mistral* |

---

## Méthode

- **Doc vivant** : chaque programme réel qui révèle un nouvel objet/attribut → on met à jour ici **avant** de coder.
- **Rétro-compatible** : ce modèle est le *cap conceptuel* ; le stockage actuel (`S.programmes`, `S.sessions`, `EXLIB`) y converge **progressivement**, jamais par une réécriture brutale (règles d'or n°3 & n°6 : zéro perte, backup avant risque).
- **🛡️ Versionnage du schéma + migrations client — L'ANGLE MORT N°1** *(Gemini, décision d'archi)* : comme les données vivent **sur le téléphone**, toute évolution du modèle risque de **casser/corrompre l'historique** de l'athlète s'il n'y a pas de migration soignée. **Décision** : formaliser un **`schema_version`** en localStorage + des **migrations automatiques idempotentes** exécutées au chargement (`load()`), **avant** toute évolution structurelle. On le fait déjà en ad hoc (`ft4_exmig2`, `ft4_pressmig1`, `ft4_fragmig1`…) → le rendre **systématique et versionné**. C'est la **garantie technique** de « rétro-compatible » et de la règle d'or n°3.
- **À croiser** : soumettre ce modèle aux regards extérieurs (GPT · Gemini · Mistral) — convergence = on grave, divergence = on débat.

*Idée & conception du cap : Michel. Mise en forme du modèle : Claude. Enrichi par la relecture croisée GPT · Gemini · Mistral (21/07/2026).*
