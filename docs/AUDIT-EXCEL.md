# 📊 Audit — le « suivi Excel » de Force Tracker

> **13/09/2026, demande de Michel** : *« je me souviens avoir mis en place au début de l'application
> un suivi Excel, mais je ne sais plus s'il est encore d'actualité ni réellement branché »*.
> ⛔⛔ **LECTURE SEULE — aucune ligne modifiée.** Pas de correction, pas de refactor, pas de
> suppression de code mort, aucun changement d'export.

---

## ⭐⭐ LA RÉPONSE EN UNE PHRASE

**Ton souvenir est juste, et la chose existe toujours — mais ce n'est pas un fichier Excel : c'est
un classeur Google Sheets, et il est ACTIF, alimenté à chaque séance terminée.**

Il y a **deux sujets différents** derrière le mot « Excel », et les confondre fait dire n'importe quoi :

| | Quoi | État |
|---|---|---|
| **① Le suivi du début** | le **classeur Google Sheets**, onglet `Sessions`, alimenté par l'app à chaque fin de séance | ✅ **ACTIF, jamais débranché** |
| **② Un export XLSX** | un fichier `.xlsx` que l'app fabriquerait | ⛔ **N'A JAMAIS EXISTÉ** — voir §2 |

---

## 1. Existe-t-il un export ou un suivi Excel/XLSX actif ?

### ✅ ① LE CLASSEUR GOOGLE SHEETS — ACTIF

C'est le suivi que tu as mis en place au début. Il n'a jamais été coupé.

| | |
|---|---|
| **Fonction qui produit les lignes** | **`_buildSyncRows(sess)`** — `tracking.js:59` |
| **Fonction qui envoie** | **`syncSheets(sess)`** — `tracking.js:89` |
| **Déclenchement** | **`finishWorkout()`** → `log.js:4371`, à **chaque séance terminée** |
| **Rattrapage** | **`_retrySheetQueue()`** — `tracking.js:119`, rejoue les séances `synced:false` au démarrage, au retour en ligne, et par le bouton **Resynchroniser** (Profil → Admin) |
| **Côté serveur** | **`handleLogSession_(body)`** — `Code.js:1684`, écrit dans l'onglet **`Sessions`** |
| **Porte utilisateur** | ⭐ **aucune — et c'est voulu.** Ce n'est pas un export qu'on déclenche, c'est une **synchronisation automatique** |

⭐ **Preuves qu'il est vivant, pas dormant** : il a été **modifié quatre fois cette année** —
l'e-mail ajouté (ft-v1018, *« les séances de tous les testeurs s'empilaient sans qu'on sache qui
est qui »*), l'écriture passée **ligne par ligne → en bloc** (31/08, la séance de Michel qui ne
partait pas : 25 allers-retours pour 25 séries), le délai dépassé **nommé** au lieu d'être compté
comme un échec, et l'échec d'écriture du drapeau rendu visible (ft-v1092).

### ⛔ ② AUCUN EXPORT `.xlsx` — ET IL N'Y EN A JAMAIS EU

**Mesuré sur les 12 fichiers servis** : `XLSX.write`, `writeFile`, `book_new`,
`book_append_sheet`, `json_to_sheet`, `aoa_to_sheet` → **zéro occurrence**.

👉 **La bibliothèque SheetJS (`lib/xlsx.full.min.js`, 861 Ko) est embarquée pour LIRE, jamais pour
ÉCRIRE.** Deux usages, tous les deux en lecture :

```
XLSX.read(...)                tracking.js:1270
XLSX.utils.sheet_to_csv(...)  tracking.js:1272
```

---

## 2. Où SheetJS sert-il réellement aujourd'hui ?

**À un seul endroit : l'import d'un fichier de balance connectée.**

| | |
|---|---|
| **Chargement** | `_loadXlsx()` — `tracking.js:1237`, à la demande, depuis `./lib/` (**hors ligne OK**) |
| **Porte utilisateur** | `openScaleCsvImport()` → bouton **« Importer un fichier balance (CSV ou Excel) »** |
| **Où** | **Profil → Bilan corporel** (`tracking.js:1025`) |
| ⛔ **Accessibilité** | **`_isScaleCsvBeta()`** — **Michel + `TESTER_EMAILS` uniquement.** Invisible pour tout le monde d'autre |
| **Chaîne** | `onScaleCsvFile` → `_loadXlsx` → `XLSX.read` → `sheet_to_csv` → `_scaleCsvImportFromText` → `_parseScaleCsv` → `showConfirm` → `_importScaleRows` |

⭐ **Le `.xlsx` est converti en CSV immédiatement** : il n'y a qu'**un seul chemin** en aval (**R2**).

---

## 3. Ce que le classeur Google Sheets exporte réellement

**Onglet `Sessions`, une ligne par SÉRIE VALIDÉE, 12 colonnes :**

```
date · exercise · set_num · type · kg · reps · volume · rm1 · bw · gender · age · email
```

| Donnée | Dans le classeur ? |
|---|---|
| séances | ✅ (par leur date) |
| séries | ✅ une ligne chacune — ⛔ **seulement si `done`** |
| exercices | ✅ nom, tronqué à 150 caractères |
| charges | ✅ `kg`, arrondi à 0,1 |
| reps | ✅ arrondi entier |
| volume | ✅ `kg × reps`, **recalculé ici** |
| 1RM estimé | ✅ `rm1` |
| poids de corps · sexe · âge | ✅ **oui** — *(à savoir : le CSV utilisateur les exclut exprès)* |
| e-mail | ✅ posé **par le serveur** sur chaque ligne (l'app l'envoie **une fois**, sur l'enveloppe — R2) |
| ⛔ **RIR / RPE** | ⛔ **NON — jamais envoyé** |
| ⛔ **cardio** | ⛔ **NON — jamais envoyé** |
| ⛔ nom de séance (`seance`) | ⛔ non |
| ⛔ nutrition | ⛔ non — aucun chemin |
| ⛔ mesures corporelles / pesées | ⛔ non — aucun chemin |
| ⛔ programmes · records · badges | ⛔ non |

### ⛔⛔ ET LES DEUX ABSENCES CI-DESSUS SONT DES DÉFAUTS, PAS DES CHOIX

**`_buildSyncRows` ne parcourt que `sess.exs`** (`tracking.js:66`) — or un cardio ne vit pas dans
les exercices, il vit dans `sess.cardioAvant` et `sess.cardio`. **Donc aucun cardio n'a jamais pu
atteindre le classeur.**

⭐⭐ **C'est EXACTEMENT le défaut qui a été corrigé dans `_histoLignes` le 04/09** — Michel :
*« il faut que le cardio soit sur l'export de l'historique »*, et la mesure de l'époque disait
**« 27 cardios enregistrés, 0 exporté »**. 👉 ***La porte jumelle n'a pas été traitée*** (**R8**).
Idem pour le RIR : `_histoLignes` le lit par son propriétaire `_rirDeSet` ; `_buildSyncRows`
ne le connaît pas.

⛔ **Non corrigé — c'est un audit.** Écrit ici pour que ce soit une décision, pas un oubli (**R30**).

---

## 4. Les producteurs de lignes — qui reconstruit quoi

**Il y a DEUX producteurs distincts de « une ligne par série », et ils ne partagent rien.**

| Producteur | Fichier | Sert à | Champs |
|---|---|---|---|
| **`_histoLignes()`** | `setup.js:270` | ⭐ **le CSV ET le PDF** (`exportHistoCsv` + `exportHistoPdf`) | 9 : `date · seance · exercise · set_num · type · kg · reps · rir · volume` |
| **`_buildSyncRows()`** | `tracking.js:59` | **le classeur Google Sheets** | 11 (+ e-mail serveur) : `date · exercise · set_num · type · kg · reps · volume · rm1 · bw · gender · age` |

⭐ **Le CSV et le PDF partagent DÉJÀ leur producteur**, et le code dit pourquoi noir sur blanc :
*« deux producteurs finiraient par ne pas dire la même chose du même historique »*.

⛔ **Le classeur, lui, a le sien.**

### Les divergences mesurées entre les deux

| Écart | Verdict |
|---|---|
| le classeur a `rm1`, `bw`, `gender`, `age`, `email` — pas le CSV | ⭐ **LÉGITIME, et documenté** : le CSV/PDF **exclut volontairement** toute donnée de santé (*« ce fichier sort de l'app »*) |
| le CSV a `seance` et `rir` — pas le classeur | ⚠️ **écart non justifié** |
| le CSV a le **cardio** (depuis le 04/09) — pas le classeur | ⛔ **défaut, R8** |
| `type` : le classeur **force `'N'`** si la valeur est inconnue · le CSV la passe telle quelle | ⚠️ **deux règles pour la même colonne** |
| `volume` : recalculé **des deux côtés**, séparément | ⚠️ deux copies de `kg × reps` |
| filtre `done` | ✅ **identique des deux côtés** |

👉 **Réponse à ta question 9 : oui, il y a divergence — mais elle n'est PAS entre l'Excel, le CSV
et le PDF. Le CSV et le PDF sont déjà unifiés. La ligne de fracture passe entre le CLASSEUR et
les deux autres.**

---

## 5. Les autres producteurs de fichiers — l'inventaire complet

| Fonction | Sort quoi | Porte utilisateur | État |
|---|---|---|---|
| `exportHistoCsv()` | **CSV** séries | **Progrès → Historique séances → 📤 Exporter → 📊 Tableur** | ✅ **actif, ouvert à tous** |
| `exportHistoPdf()` | **PDF** séances | même modale → 📄 Document | ✅ actif |
| `exportNutritionCsv()` | **CSV** journal alimentaire | Nutrition → 📤 | ✅ actif *(hors périmètre)* |
| `exportPoidsCsv()` | **CSV** pesées | Progrès → Corps & santé → 📤 | ✅ actif |
| `exportData()` / `lancerExportSeances()` | ⚠️ **JSON**, pas un tableur | Menu → Exporter mes données | ✅ actif |
| `exporterConversationsMilo()` | **texte** | même modale | ✅ actif |
| `exportVmBenchCsv()` | **CSV** du banc d'essai VM | ⛔ **admin** | ✅ actif, réservé |
| `exportBodyStudyPdf()` · `exportCoachPdf()` · `exportProgPdf()` | PDF | divers | ✅ actifs |
| `exportPt001Text/Pdf` · `exportVcText` · `exportEvalText` · `exportVmText` | texte/PDF | ⛔ **admin** | ✅ actifs, réservés |

⭐ **Le propriétaire commun de l'écriture CSV est `_csvFichier()`** (`setup.js:422`) — un seul
échappement, un seul `;`+BOM, un seul nom daté. `exportHistoCsv` garde encore **sa propre copie**
de cet échappement (`setup.js:397`), pour une raison historique.

---

## 6. ⚠️ UN DÉFAUT TROUVÉ AU PASSAGE — l'aide envoie au mauvais écran

**Deux textes d'aide annoncent** : *« Il existe aussi un export de tes SÉANCES : **Profil →
Exporter → 📊 Tableur (CSV)** »* (`coach.js:8127`) et *« 🏋️ tes séances — **Profil → Exporter** »*
(`app.js:6655`).

⛔ **Mesuré : la modale « Exporter mes données » (Profil) n'a AUCUN bouton tableur.** Ses quatre
boutons sortent du **JSON** ou du **texte**. Le bouton **📊 Tableur (CSV)** vit dans
**Progrès → Historique séances → 📤 Exporter** (`index.html:1969`).

👉 *Quelqu'un qui suit l'aide ne trouve pas le bouton, et conclut que la fonctionnalité n'existe
pas.* ⛔ **Non corrigé — lecture seule.**

---

## 7. Le classement demandé

| Classe | Ce qui en relève |
|---|---|
| ✅ **ACTIF** | le **classeur Google Sheets** (`_buildSyncRows` + `syncSheets` + `_retrySheetQueue` + `handleLogSession_`) · les **4 exports CSV** utilisateur · le **PDF** d'historique |
| ⚠️ **BRANCHÉ MAIS INUTILISÉ (par presque tout le monde)** | l'**import balance CSV/XLSX** — chaîne complète et fonctionnelle, mais derrière `_isScaleCsvBeta()` : **Michel et les testeurs seulement**. ⭐ C'est le **seul** usage de SheetJS |
| ⛔ **MORT** | **rien**. Aucune fonction d'export sans appelant n'a été trouvée. ⭐ *Et c'était la question la plus utile : il n'y a pas de code mort à ranger ici* |
| ⭐ **ENCORE PERTINENT ARCHITECTURALEMENT** | ① le **patron d'import** de la balance (il sait dire *« je ne sais pas »* et demande confirmation avant d'écrire) · ② `_histoLignes` comme **producteur unique CSV+PDF** · ③ `_csvFichier` comme propriétaire de l'écriture |

---

## 8. Peut-il servir de base au futur format structuré réimportable ?

**Non pour le classeur. Oui pour le CSV — et c'est déjà le plan en cours.**

| Candidat | Verdict |
|---|---|
| **Le classeur Google Sheets** | ⛔ **Non.** Il est **serveur**, il **agrège tous les utilisateurs** dans un onglet commun, il n'a **ni RIR ni cardio ni nom de séance**, il porte des **données de santé** (poids, sexe, âge) qu'on ne veut pas dans un fichier d'échange, et **il ne descend jamais vers le téléphone** — il n'y a aucun chemin de lecture |
| ⭐ **Le CSV d'historique** | ✅ **Oui, sans refonte.** 9 colonnes explicites, échappement réel, `;`+BOM, **aucun plafond**, cardio inclus, RIR correct (vide ≠ 0), et **le même producteur que le PDF** |

⭐ **Et c'est exactement l'étape B du plan que tu as validé ce matin** (`docs/PLAN-CONTRAT-IMPORTS.md`) :
le lecteur CSV d'historique, avec parsing par nom de colonne et `format_version`.
👉 **Cet audit ne change donc rien au plan — il le confirme, et il ajoute une pièce** : le lecteur
XLSX est déjà là et déjà éprouvé, il ne servira qu'à convertir vers ce CSV.

---

## ⭐ CONCLUSION

Parmi les quatre formulations proposées, **aucune ne s'applique telle quelle**, et il faut le dire
plutôt que de choisir la moins fausse :

> ### **« Excel » actif et exploitable — mais ce n'est pas un Excel.**
>
> **① Le suivi que tu as mis en place au début est un classeur GOOGLE SHEETS, et il est pleinement
> ACTIF** : alimenté à chaque séance terminée, avec file de rattrapage, amélioré quatre fois cette
> année. Il n'a jamais été débranché.
>
> **② Un export `.xlsx` n'a JAMAIS existé.** La bibliothèque Excel embarquée ne sert qu'à **LIRE**,
> à un seul endroit (l'import de balance), réservé aux testeurs.
>
> **③ Rien n'est mort.** Aucun code d'export orphelin.
>
> **④ Mais le classeur a DEUX TROUS RÉELS** — **ni RIR, ni cardio** — parce que son producteur
> `_buildSyncRows` n'a **jamais reçu** les correctifs appliqués à son jumeau `_histoLignes`
> (**R8**, la porte jumelle).

---

*Audit du 13/09/2026, lecture seule. Aucune ligne de production modifiée, aucun code mort supprimé,
aucun export changé. Mesures faites sur les 12 fichiers servis + `Code.js`.*
