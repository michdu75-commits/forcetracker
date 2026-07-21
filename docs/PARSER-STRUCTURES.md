# 🏗️ Parser de structures de programme — architecture (chantier en cours)

> **But** : apprendre à l'app à comprendre la **structure** d'un programme importé (circuits, EMOM, AMRAP, supersets, dropsets, HIIT…), pas seulement la liste des exercices.
> **Méthode (Michel, 21/07/2026)** : *démarrer maintenant sans finaliser* — poser l'architecture, puis la **construire sur des cas RÉELS** (chaque PDF de test valide les 2 axes), jamais sur des hypothèses.
> **Statut** : 🟡 conception. Aucun code de prod modifié tant que le modèle n'est pas validé sur plusieurs programmes réels.

---

## Les 2 axes de l'import (rappel)

| Axe | Rôle | Où | Testable |
|---|---|---|---|
| **① LECTURE** | l'IA lit le document → structure (séances, séries, reps, **tours/temps**) | serveur (worker) | **iPhone seulement** (non-déterministe) |
| **② RATTACHEMENT** | relier chaque nom à EXLIB (VM) | local, 0 IA | banc, en local (déterministe) |

Ce chantier = **axe ① (lecture)**. C'est là que « 5 tours : 10 KB Swings… » devient à tort « 10 × 99 ».

---

## Ce qui existe DÉJÀ (ne pas casser)

**Contrat d'extraction** (ce que l'IA renvoie aujourd'hui, par exercice) → consommé par `_buildProgDay` (log.js) :

| Champ émis par l'IA | Sens | Traitement frontend |
|---|---|---|
| `name`, `sets`, `reps`, `kg` | exercice + volume | 1 série × `sets`, chacune `{kg,reps}` |
| `supersetGroup` (id) | superset / bi-set / tri-set | → `group` + `groupType:'super'` ✅ |
| `setType` (`''`/`'D'`) | type de série (dropset) | → `type` de série ✅ |
| `repsPerSet[]`, `kgPerSet[]` | paliers (dropset) | → séries à reps/kg variables ✅ |
| `restPerSet[]`, `rest` | repos par série / unique | → `rest` (secondes) ✅ |
| `note` | consigne libre | → note d'exercice ✅ |

**Modèle séance (frontend)** — une séance = `{label, exs:[{name, note, sets:[{kg,reps,type,rest,done}], group?, groupType?}]}`.

✅ **Superset** et ✅ **Dropset** sont donc déjà représentables. Manquent : **circuit, EMOM, AMRAP, HIIT**.

---

## Le modèle CIBLE (additif, rétro-compatible)

Principe : une « structure » est une propriété d'un **groupe d'exercices consécutifs** — exactement comme le superset l'est déjà. On **étend `groupType`** au lieu d'inventer un modèle parallèle.

`groupType` (sur un groupe partagé par N exos) :

| `groupType` | Sens | Paramètres du groupe | Statut |
|---|---|---|---|
| `super` | superset (dos-à-dos), `sets` = nb de tours | — | ✅ existe |
| `circuit` | circuit : faire le groupe, répéter N tours | `rounds:N` | 🔜 |
| `emom` | Every Minute On the Minute | `durationMin:N` (+ reps par slot) | 🔜 |
| `amrap` | As Many Rounds As Possible (temps plafonné) | `durationMin:N` | 🔜 |
| `hiit` | intervalles effort/repos | `rounds:N`, `workSec`, `restSec` | 🔜 |

**Contrat d'extraction étendu** (ce que l'IA devra émettre, en plus de l'existant) :

```
structureGroup : <id>            // comme supersetGroup, partagé par les exos du bloc
structureType  : "circuit" | "emom" | "amrap" | "hiit"
rounds         : N               // circuit / hiit
durationMin    : N               // emom / amrap
workSec, restSec : N             // hiit
```

`_buildProgDay` mappera `structureGroup`/`structureType` → `group` + `groupType` + params (comme il le fait déjà pour `supersetGroup`).

---

## Découpage en jalons (on avance pas à pas)

- **M0 — le contrat** *(ce doc)* : figer le modèle ci-dessus. Rétro-compatible : un exo normal (sans structure) se comporte **exactement** comme avant.
- **M1 — le fix « 99 » (priorité)** : apprendre à la LECTURE que **« N tours » → `sets = N`** et que le nombre à côté d'un exo = ses **reps** (ex. « 5 tours : 10 KB Swings » → KB Swings `5×10`). **Interdire le sentinelle « 99 »** ; un temps sans reps → défaut raisonnable (ou champ vide), **jamais 99**. → gros gain visuel immédiat, même sans rendu spécial.
- **M2 — le rendu** : aperçu d'import + écran séance affichent un bloc circuit/EMOM groupé avec l'info « N tours » / « X min ». (Frontend → **testable en local**.)
- **M3 — les minuteurs** : EMOM/HIIT branchés sur le chrono (à la minute / effort-repos). Plus tard.

**Dégradation gracieuse** : tant qu'un `groupType` n'est pas rendu spécialement, l'app doit au moins montrer les exos avec des `sets`/`reps` sensés (pas « 99 »).

---

## Questions ouvertes — à trancher SUR DES CAS RÉELS

*(on remplit ce tableau au fil des PDF de test — ne pas décider dans le vide)*

| Question | Piste | Vu sur quel programme ? |
|---|---|---|
| « N tours » : compter comme `sets=N` ou garder la notion de circuit ? | `sets=N` + `groupType:'circuit'` (les deux) | Force (5 tours), Femme (Circuit A/B 3 tours) |
| EMOM alterné (Min1 = A, Min2 = B) : comment répartir ? | slots minute par exo | Femme (EMOM 10 min) |
| HIIT « 30s / 30s » : exercice ou juste cardio ? | `hiit` + work/rest, exos en `nouveau` si non couverts | Femme (HIIT 5 tours) |
| Cardio (marche/vélo) dans un circuit : exo ou métadonnée ? | à voir | plusieurs |
| Reps « max » / AMRAP : quel champ ? | `set.maxi` (existe déjà, ft-v409) | — |

---

## Cas réels observés (on remplit au fil des imports)

**Import « Perte de Poids Femme » (clone ft-v543, 21/07)** — ce que la LECTURE a produit :

| Structure du doc | Résultat de la lecture | Verdict |
|---|---|---|
| « Circuit A (3 tours) : Goblet Squat 15 reps… » | chaque exo en **3×15**, note `📋 Circuit A (3 tours)` | ✅ **bon** — « 3 tours » → `sets=3`, l'info circuit est dans la note (pas de « 99 » ici) |
| « Finisher EMOM 10 min : Min1 = 12 Step Ups ; Min2 = 10 KB Swings » | **1 seul exo** « Finisher EMOM » 2×10, note = tout le détail | ⚠️ les 2 mouvements **ne sont pas séparés** (à trancher : les splitter ?) |
| « HIIT 5 tours : 30s Burpees, 30s repos, 30s Mountain Climbers… » | exos séparés **« HIIT - Burpees »**, **« HIIT - Repos »**… en 5×30 | ⚠️ ① « repos » créé comme **faux exercice** ; ② préfixe « HIIT - » = **bruit** qui gêne le rattachement |
| « Cardio : Vélo 20 min » | « Vélo » 1×20, note `Cardio 20 min` | 🟡 minutes lues comme reps (inoffensif) ; Vélo reste « nouveau » (cardio non couvert) |

**Enseignements pour la LECTURE (prompt d'extraction, à tester iPhone)** :
1. **Ne jamais créer un « repos » comme exercice** (HIIT/intervalles) — le repos est un paramètre, pas un mouvement.
2. **Retirer les préfixes de bloc** des noms (« HIIT - », « Finisher EMOM », « Circuit A : ») → garder le nom d'exercice pur (le rattachement VM sera net).
3. **EMOM/AMRAP** : décider si on éclate les mouvements en exercices distincts (probablement oui) ou un bloc unique.
4. Le motif **« N tours » → `sets=N`** marche bien quand il est écrit clairement — à généraliser/fiabiliser (c'est le cas « 99 » du programme Force qui reste à mater).

## Méthode de test (à chaque nouveau PDF)

1. **Axe ② (moi, en local)** : passer les noms dans le moteur VM → rapport reconnu/confirm/nouveau, corriger les vrais bugs.
2. **Axe ① (Michel, iPhone)** : import réel dans le clone → vérifier le **découpage de la structure** (séries, tours, temps) → capture → Claude analyse où ça coince.
3. Remplir le tableau « questions ouvertes » avec ce que le cas réel a montré.

> ⚠️ Claude ne peut pas tester l'axe ① (le serveur IA est hors de portée de son environnement). Toute évolution de la LECTURE se valide sur l'iPhone de Michel.
