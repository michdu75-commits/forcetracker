# 🧩 Modèle métier de Force Tracker — le langage commun (v0.1)

> **Le cap (Michel, 21/07/2026)** : arrêter de penser *uniquement* « fonctionnalités » et penser **« objets métier »**. Définir un **langage commun** que TOUS les modules parlent (VM · import PDF · générateur IA · mode coach · statistiques…). *« On n'ajoute plus des fonctions, on construit un langage capable de représenter la programmation sportive. »*
>
> **Statut** : 🟡 fondation v0.1 — **vivant**. On le distille des **vrais programmes** (Christophe, Emma, Tatiana), on le complète au fil des cas. **Aucun code de prod modifié** : ce document définit le *langage*, il n'impose pas une réécriture du stockage (l'alignement des modules se fait progressivement).
>
> **Pourquoi maintenant** : un modèle clair = tous les modules parlent pareil = le projet tient des années au lieu d'être rafistolé. Investir un peu ici évite de tout reconstruire plus tard.

---

## Principe n°1 — PLANIFIÉ vs RÉALISÉ

La distinction la plus importante. Les mêmes objets existent en **deux états** :

- **Planifié** (la prescription) : ce qui est **prévu** — un programme, une séance à faire, « 4×8 à 80 % ».
- **Réalisé** (la performance) : ce qui a été **fait** — la séance loggée, « 4×8 à 82,5 kg, la 4ᵉ à l'échec ».

Force Tracker gère déjà les deux (aujourd'hui : `S.programmes` = planifié · `S.sessions` = réalisé). Le modèle doit **toujours** préciser de quel état on parle.

---

## Les objets (le vocabulaire)

### 👤 Athlète
La personne. *(existe : profil `S`, `S.adn`, `S.registre`, `S.healthProfile`)*
- Identité (âge, sexe, taille, poids), niveau, discipline, morphologie.
- **ADN sportif** (durable, déclaré), **Registre** (faits mesurés + observations), **Santé** (contraintes → le Gardien).
- *poursuit* un ou plusieurs **Objectifs**.

### 🎯 Objectif
Ce que l'athlète vise. *(existe partiellement : `S.goal`, `S.targetWeight`, `S.level`)*
- Type (force · hypertrophie · perte de gras · recomposition · endurance · perf datée…).
- Cible (poids visé, 1RM visé…), échéance éventuelle.
- Un programme **sert** un/des objectifs.

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

### 📚 Exercice-bibliothèque *(la référence)*
Le mouvement canonique. *(existe : `EXLIB` + taxonomie VM)*
- Nom, groupe musculaire, muscles, **schéma moteur** (14 patterns), famille, **alias** (FR/EN/marques), média (gif/photo).
- Le **moteur VM** relie un nom brut → cette référence (sans doublon).

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

---

## La grammaire (relations)

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
| Tempo (3-1-1) : notation dédiée ? | oui, champ `tempo` sur la série/exercice | Christophe (probable) |

---

## Méthode

- **Doc vivant** : chaque programme réel qui révèle un nouvel objet/attribut → on met à jour ici **avant** de coder.
- **Rétro-compatible** : ce modèle est le *cap conceptuel* ; le stockage actuel (`S.programmes`, `S.sessions`, `EXLIB`) y converge **progressivement**, jamais par une réécriture brutale (règles d'or n°3 & n°6 : zéro perte, backup avant risque).
- **À croiser** : soumettre ce modèle aux regards extérieurs (GPT vision/UX, éventuellement Gemini/Mistral) — convergence = on grave, divergence = on débat (méthode déjà adoptée).

*Idée & conception du cap : Michel. Mise en forme du modèle : Claude. À enrichir avec GPT.*
