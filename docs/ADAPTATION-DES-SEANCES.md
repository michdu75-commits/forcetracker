# 🔧 Adaptation des séances — audit du contre-audit, avant toute implémentation

> **Créé le 06/09/2026.** Réponse au document *« Force Tracker — Adaptation intelligente des
> séances »* (contre-audit GPT), qui prolonge `docs/AUDIT-GARDIEN-PRESCRIPTION.md` du même jour.
>
> ⛔⛔ **AUCUNE LIGNE DE CODE APPLICATIF N'A ÉTÉ ÉCRITE.** Le §73 du document le demande
> explicitement (*« AVANT DE CODER »*), et son §74 fixe le livrable en 14 points — c'est le plan
> de ce fichier. Tout ce qui est chiffré ici est **mesuré dans le code**, pas estimé.

---

## 1. Validation / correction du diagnostic

### ✅ Ce qui est exact, vérifié ligne par ligne

Le contre-audit reprend fidèlement l'audit du matin. Sont **confirmés** :

- le pipeline en 10 étapes (§2) ;
- les trois « Gardiens » distincts, et la décision de ne plus employer ce mot pour
  `_intensiteDefauts` (§3) — **cette clarification est adoptée, elle est utile** ;
- le calcul exact de l'alerte (§4) : 108 → 102,00 → 94,86 → seuil 96,75 → conseil ~95 ;
- l'origine monotone du 1RM de 108 (§5), et le refus de le remplacer par la forme récente ;
- le fait que Milo et le contrôle emploient **le même** 1RM (§6) ;
- l'absence de `sessionId` / `version` (§20) — **vérifié** : `S.wkt` vaut
  `{date, progLabel, exs, startHour}`, rien d'autre ;
- l'absence de RIR **cible** (§24) — le RIR existe, mais c'est une **mesure**, jamais une consigne ;
- le modèle de série (§23), exact champ pour champ.

### ⛔⛔ Correction n°1 — LE BANC D'ESSAI API NE PEUT PAS FAIRE L'ÉTAPE 1

C'est la correction la plus importante du document, parce qu'elle porte sur **la toute première
action recommandée** (§9, §68 étape 1, §73 C : *« Sur les scénarios API existants… compter
PASS / WARNING / CONFLICT »*).

**Compté dans `tests/milo/eval-scenarios.js` :**

| Mesure | Valeur |
|---|---|
| scénarios au total | **56** |
| fixtures portant un record (`prs` avec `rm1`) | **7** |
| scénarios demandant une séance | 37 |
| **les deux à la fois** (un conflit est donc *possible*) | **6** — `EV-001` `EV-015` `EV-017` `EV-018` `EV-019` `EV-024` |

👉 ***Le contrôle d'intensité commence par `if(!(rm1>0)) return out;` — il se tait entièrement
sans record.*** Sur 56 scénarios, **50 ne peuvent structurellement produire aucun conflit**.

**Un dénominateur de 6 ne mesure pas une fréquence.** Mesurer là-dessus donnerait un chiffre entre
0 % et 100 % par pas de 17 points, et ce chiffre serait ensuite cité comme s'il voulait dire
quelque chose. *C'est le contrôle négatif à 0 rouge de `BUGS.md` : un instrument qui rend un
chiffre plausible sans pouvoir le fonder.*

⭐ **L'instrument honnête existe déjà et coûte zéro** : le contrôle tourne **en local**, à chaque
séance proposée, dans l'app de Michel. Un compteur de deux entiers (`prescriptions vues`,
`prescriptions ayant déclenché une alerte`) posé au point de passage unique donne, en une
semaine d'usage réel, **un vrai dénominateur et un vrai numérateur** — sans un centime d'API et
sans toucher au raisonnement. C'est le patron déjà employé par `_gardienCompter`
(`ft4_gardienStats`), donc **rien à inventer** (R13).

⚠️ **Et le banc API garde un rôle**, mais pas celui-là : il mesure *si Milo prescrit trop lourd
dans un cas construit exprès*. Ce n'est pas la même question que *« à quelle fréquence, dans la
vraie vie ? »*.

### ⛔ Correction n°2 — le diff proposé compare un champ qui n'existe pas

Le §21 (SESSION DIFF) liste `supersetGroup` parmi les champs à comparer. **C'est le nom de
transport, pas le nom stocké.** Mesuré :

- `_normalizeMiloSession` → `supersetGroup: "A"` (étiquette brute du cervelet) ;
- `_appliqueMiloSession` fait `delete o.supersetGroup` puis écrit `o.group = 'ss…_A'` et
  `o.groupType = 'super'`.

👉 Un moteur de diff écrit d'après la spécification comparerait, sur deux objets `S.wkt`, un
champ **absent des deux côtés** — donc *toujours « inchangé »*. **Un vert qui ne peut pas
rougir** (R35). Le diff doit comparer `group` **et** `groupType` sur `S.wkt`, et
`supersetGroup` uniquement sur l'objet de transport.

### ⚠️ Correction n°3 — le §57 n'est pas une question ouverte, la réponse est dans le code

Le document demande de *« définir explicitement si la montée automatique doit être recalculée »*.
Deux faits tranchent :

1. `_completerMonteeEnCharge` **dérive** la montée de la charge de travail :
   `kgT = _kgTravailEx(ex)` puis `_monteeSuffisante(ech, kgT)`. Elle **dépend donc** de ce qu'un
   patch de charge modifie.
2. Elle tourne à **l'étape 5**, c'est-à-dire **avant** que la séance n'existe en mémoire — un
   patch appliqué plus tard ne la rejouerait jamais.

👉 ***Un patch `100 → 95` laisserait donc une montée calibrée pour 100.*** Ce n'est pas un risque
théorique, c'est le comportement actuel du code si on greffe un patch sans y toucher.

### ⚠️ Correction n°4 — `EV-019` et la production ne disent pas la même chose

Le §46 demande de réexaminer `EV-019`. En le lisant, un défaut plus concret apparaît que celui
qu'il vise : **le test emploie une marge de +5 %, la production +2 %.**

| reps | plafond | seuil PRODUCTION (×1,02) | seuil TEST `EV-019` (×1,05) | bande aveugle |
|---|---|---|---|---|
| 3 | 94,86 | 96,75 | 99,60 | **2,85 kg** |
| 5 | 89,27 | 91,06 | 93,73 | 2,68 kg |
| 8 | 80,89 | 82,51 | 84,94 | 2,43 kg |

👉 Une prescription à **98 kg × 3 × 3** déclenche l'avertissement dans l'app **et passe le test au
vert**. *Deux seuils pour une seule règle* — c'est **R2**, et c'est exactement la famille « deux
sources qui se contredisent » de `BUGS.md`.

### ✅ Ce qui est adopté sans réserve

Les interdits du §69, le refus de l'heuristique « un peu = −5 % » (§15), le refus d'un juge IA
(§45), le refus de modifier `_INT_TENUE` maintenant (§8), le refus d'un second framework de tests
(§64), et le principe de responsabilité du §70. **Aucun de ces points n'est contesté.**

---

## 2. Briques existantes réutilisables

C'est la question B du §73, et la réponse est **plus favorable que le document ne le suppose**.

| Ce que le document veut construire | Ce qui existe déjà | État |
|---|---|---|
| `SET_LOAD`, `SET_REPS`, `SET_REST` | **`upSet(ei, si, champ, valeur)`** — `s[champ] = numFR(v) \|\| 0` | ✅ **existe, et déjà idempotent** |
| `SET_SETS` (ajout) | `addSet(ei)` | ✅ existe |
| `REMOVE_EXERCISE` | `rmEx(ei)` | ✅ existe |
| ajout d'exercice | `addExercise(name)` | ✅ existe |
| réordonnancement | `moveExBlock(ei, dir)` + glisser-déposer | ✅ existe |
| comparaison de listes par signature | **`_fusionListe(memoire, disque, cle)`** (`state.js`) | ✅ existe (union, pas diff) |
| compteur d'événements persistant | **`_gardienCompter` / `ft4_gardienStats`** | ✅ patron complet, cloud compris |
| provenance d'une prescription | **`_milo`**, **`_montee`** sur l'exercice | ✅ existe, partiel |
| point de passage unique après Milo | **`_appliqueMiloSession`** | ✅ existe, et c'est écrit noir sur blanc dans le code |

⭐⭐ **La conséquence est importante pour l'étape 4 du §68** : les cinq opérations réclamées
**existent déjà toutes les cinq**. Et `upSet` fait une **affectation**, jamais une soustraction —
donc **l'idempotence du §55 est déjà acquise par construction**, elle n'est pas à obtenir.

👉 ***Ce qui manque n'est pas la primitive, c'est l'AIGUILLAGE*** : le chemin qui va d'une phrase
(« passe le couché à 95 ») à `upSet`. Cela change complètement le dimensionnement de l'étape 4.

⛔ **Et cela déplace le risque** : construire cinq opérations qui doublonneraient `upSet`/`rmEx`
serait une violation directe de **R2** — deux façons de changer une charge divergeraient, et l'une
des deux oublierait `persist()` ou le recalcul de `rm1` (que `upSet` fait déjà).

---

## 3. Les vrais manques

Après retrait de ce qui existe, il reste **cinq** manques réels — et un seul est structurel.

| # | Manque | Nature | Bloquant pour |
|---|---|---|---|
| 1 | **La séance proposée n'est jamais renvoyée à Milo** (`_pendingMiloSessions` est en mémoire) | **structurel** | tout le §16 |
| 2 | Aucun **aiguillage** phrase → opération locale | à construire | §13, §17 |
| 3 | Aucun **identifiant** de séance ni de version | à construire | §20, traçabilité |
| 4 | Aucun **RIR cible** | à construire | §24, §25 |
| 5 | Aucun **moteur de comparaison** de deux séances | à construire | §21, tous les tests d'invariant |

⭐ **Le manque n°1 est le seul qui explique le comportement observé.** Les quatre autres sont des
manques de confort ou d'outillage ; celui-là est la cause mécanique du fait que Milo *refait* au
lieu de *modifier*. **Le combler seul changerait déjà le comportement**, sans aucun patch, sans
identifiant, sans diff : il suffirait d'envoyer la séance courante **en clair et structurée** dans
le message, avec la consigne de ne toucher que ce qui est demandé.

⚠️ **Ce n'est pas gratuit** (cela consomme du contexte à chaque tour), et **ce n'est pas garanti**
(c'est une consigne à un modèle, donc R7 : probabiliste). Mais c'est **la mesure la moins chère
qui puisse déplacer le résultat**, et elle est testable par le banc API avec un attendu
parfaitement déterministe : *les cinq exercices non ciblés sont-ils identiques au kilo près ?*

---

## 4. La mesure des conflits — comment la faire vraiment

Voir la correction n°1. Le protocole recommandé, par ordre de coût croissant :

**① Compteur local, 0 €, aucun appel** — un objet `ft4_intensiteStats` de la forme
`{vues, alertes, parEx:{}}`, incrémenté au point de passage unique. Il donne le vrai dénominateur
en une semaine d'usage. **C'est la seule mesure qui répond à la question posée.**

**② Rejeu gratuit des réponses déjà payées** — le banc conserve les réponses de la dernière passe
(`ft4_evalReps`). Faire tourner le contrôle dessus ne coûte rien. ⚠️ **Portée honnête : 6
scénarios**, donc cela ne donne pas une fréquence — cela donne seulement une **liste de cas** à
regarder.

**③ Élargir le banc API** — n'a de sens qu'après ①. Sans le chiffre réel, on ne sait pas si l'on
construit pour un cas rare ou pour un cas fréquent, et *une architecture dimensionnée pour un
problème qu'on n'a pas est une dette* (R19).

⛔ **Ce que le compteur ne doit pas devenir** : un score affiché à l'utilisateur. C'est un
instrument de mesure interne, derrière l'admin, comme `ft4_gardienStats`.

---

## 5. Architecture — SESSION DIFF (le plus petit moteur utile)

**Forme.** Une fonction pure, sans effet de bord, sans dépendance à `S` :

`_seanceDiff(avant, apres) → {parEx:[…], ampleur:{…}}`

**Entrée.** Deux objets de forme `S.wkt` (`{exs:[{name, note, group, groupType, sets:[…]}]}`).

**Appariement.** Par **nom normalisé** (la normalisation existe déjà : minuscules, sans accents,
sans ponctuation — c'est celle de `_extractDaySession`). ⚠️ **Le nom est le seul appariement
possible aujourd'hui**, faute d'identifiant d'exercice — c'est une limite à écrire, pas à
contourner : un exercice **renommé** apparaîtra comme *supprimé + ajouté*.

**Champs comparés**, et c'est la liste corrigée :

| Niveau | Champs |
|---|---|
| exercice | `name`, **`group`**, **`groupType`**, `note`, position |
| série | `kg`, `reps`, `maxi`, `type`, `rest` |
| plus tard | `targetRir` |

⛔ **Champs explicitement EXCLUS** : `done`, `rm1`, `_milo`, `_montee`. Ce sont des traces
d'exécution ou de provenance, pas de la prescription — les inclure ferait rougir un diff sur une
séance simplement commencée.

**Sortie.** `UNCHANGED · MODIFIED · ADDED · REMOVED · MOVED` par exercice, plus les variations
chiffrées (charge, séries, reps, repos, volume prévu).

⛔⛔ **Il MESURE, il ne juge pas.** Le §22 est adopté sans réserve : `−10 %` n'est pas un `FAIL`.
Le moteur rend un nombre, le verdict appartient au banc API ou au juge humain.

**Coût estimé** : ~120 lignes, aucune dépendance, testable entièrement hors ligne. **C'est la
brique la moins risquée de tout le chantier** — elle ne modifie rien.

---

## 6. Architecture — SESSION PATCH

**Le format minimal**, tel qu'il découle des primitives existantes :

```
{ op:'SET_LOAD',   ex:'Développé Couché', sets:[1,2,3], kg:95 }
{ op:'SET_REPS',   ex:'Développé Couché', sets:'*',     reps:5 }
{ op:'SET_REST',   ex:'Développé Couché', sets:'*',     rest:180 }
{ op:'SET_SETS',   ex:'Développé Couché', n:2 }
{ op:'REMOVE_EX',  ex:'Face Pull' }
```

**Toutes absolues, aucune relative** — conformément au §55, et c'est déjà ce que fait `upSet`.

**Application.** Le patch **ne réécrit rien lui-même** : il traduit en appels aux primitives
existantes. C'est ce qui garantit qu'il hérite gratuitement de ce qu'elles font déjà
(`persist()`, recalcul de `rm1`, re-rendu).

**Les quatre décisions qui doivent être prises AVANT d'écrire une ligne** — ce sont les vrais
sujets, et trois d'entre eux ne sont pas dans la spécification :

1. ⛔⛔ **La montée en charge.** Un `SET_LOAD` change `_kgTravailEx`, dont la montée dérive. Il faut
   **rejouer `_completerMonteeEnCharge`** après un patch de charge — sinon la séance porte une
   montée calibrée pour l'ancienne. ⚠️ Mais **seulement si la montée est celle de l'app**
   (`_montee: true`) : une montée que la personne a écrite elle-même **ne se réécrit pas** (R29).
2. ⛔⛔ **L'identité de la séance.** Voir §8 ci-dessous — un patch qui retire un exercice change la
   signature de fusion. **C'est le risque le plus discret de tout le chantier.**
3. ⛔ **La provenance.** Le §59 a raison : après un patch utilisateur, `_milo` ne doit plus
   couvrir la charge modifiée, sinon le débrief reprochera à Milo un choix de la personne — ou
   l'inverse. La forme la plus économe est **au niveau de la série** (`src:'user'`), pas un
   nouveau champ sur l'exercice.
4. ⛔ **Le contrôle repasse.** Le §58 est adopté : après patch, `_intensiteDefauts` doit être
   rejoué. Un patch ne doit jamais être un chemin de contournement des contrôles.

---

## 7. La frontière LOCAL / MILO — sans liste de phrases

C'est la question G, et c'est la plus délicate. **Une liste de formulations est fragile par
construction** : elle rate « mets 95 au couché », « couché : 95 », « 95 kg pour le développé ».

**Le critère qui ne dépend pas des mots, et qui est déjà celui du projet** (`ARCHITECTURE-
CERVEAU-CERVELET`) :

> *La demande contient-elle déjà toutes les valeurs nécessaires ?*

- **Oui → local.** *« passe le couché à 95 »* porte la cible et la valeur. Aucune décision de
  coaching : la personne a déjà décidé.
- **Non → Milo.** *« allège-moi un peu »* ne porte **aucune valeur**. Il faut décider *quoi*
  alléger et *de combien* — c'est du coaching.

⭐ **La conséquence pratique est que l'aiguillage n'est pas de la compréhension de langage, c'est
de l'EXTRACTION** : on cherche un nom d'exercice reconnu **et** un nombre avec son unité. Les deux
trouvés → opération locale ; sinon → Milo. **`_matchExercise` existe déjà** pour la première
moitié, et le lecteur de séance (`_seanceDepuisTexte`) sait déjà lire `X kg`.

⛔⛔ **Et le repli doit être ASYMÉTRIQUE, c'est la règle de sécurité de cette brique** : dans le
doute, **on envoie à Milo**. Un appel API de trop coûte 0,26 € ; une modification locale mal
comprise change la séance de quelqu'un sans qu'il l'ait demandé — *le coût de l'erreur décide de
la méthode* (R29).

⚠️ **Deuxième garde-fou, non négociable** : une opération locale **s'affiche avant de s'appliquer**
(« je passe le développé couché à 95 kg sur les 3 séries — c'est bien ça ? ») ou reste **annulable
d'un tap**. Sinon on aurait construit exactement ce que le §29 interdit : une modification
silencieuse de la prescription.

---

## 8. `sessionId` / `version` — et le piège que personne ne voit venir

**Réponse courte : oui, mais pas pour la raison invoquée.** Le document les veut pour la
traçabilité (§20). Il y a une raison plus urgente.

⛔⛔ **`state.js` identifie déjà une séance PAR SON CONTENU** :

```js
const sigSess = s => String((s && (s.ts || s.id))
  || ((s&&s.date||'') + '|' + ((s&&s.exs||[]).length) + '|' + (((s&&s.exs||[])[0]||{}).name || '')));
```

👉 ***La signature de repli contient le NOMBRE d'exercices et le NOM du premier.*** Donc un patch
qui **retire un exercice** ou **réordonne** change l'identité de la séance, et `_fusionListe`
(multi-onglet, restauration cloud) **en garderait deux**. *Personne ne trouve ça en lisant une
spécification d'architecture — on le trouve en ouvrant `state.js`.*

**Ce que ça implique :**

| Question du §73 H | Réponse |
|---|---|
| Où les stocker | Sur `S.wkt` (`id`, `v`), puis recopiés dans `sess` à `finishWorkout` — le chemin existe déjà, `S.wkt.exs` est copié tel quel |
| Quand créer l'`id` | À la création de la séance (`startWorkout`, `_appliqueMiloSession`, chargement d'un programme) — **les trois portes**, sinon une séance sur trois n'en aurait pas |
| Quand incrémenter `v` | À chaque patch appliqué. Jamais à la validation d'une série (c'est de l'exécution, pas de la prescription) |
| Impact persistance | Nul : deux champs scalaires dans un objet déjà enregistré |
| Impact synchronisation | ⭐ **Positif** : `sigSess` préfère déjà `ts || id`. Un `id` posé **améliore** la fusion, il ne la casse pas |
| Impact anciens utilisateurs | **Aucun, à une condition** : le repli par contenu doit rester pour les séances déjà enregistrées sans `id`. Le retirer réécrirait l'identité de tout l'historique |

⭐ **C'est donc la brique la moins chère et la plus rentable des trois** (diff, patch, identité) :
deux champs, et elle referme un défaut de fusion qui existe **déjà aujourd'hui**, indépendamment
du chantier.

---

## 9. `targetRir` — où l'ajouter, et le piège qui l'annulerait

**La chaîne complète**, dans l'ordre où un champ disparaît s'il manque quelque part :

| Étape | Fichier | Ce qu'il faut faire | Si on l'oublie |
|---|---|---|---|
| 1. spécification du bloc | `worker.js` | ajouter `"targetRir"` au format demandé au cervelet | le cervelet ne l'émet jamais |
| 2. **normalisation** | **`log.js` `_normalizeMiloSession`** | **recopier le champ** | ⛔⛔ **il disparaît en silence** |
| 3. application | `log.js` `_startSessionFromMilo` | le transporter vers `S.wkt` | perdu au démarrage |
| 4. affichage | `log.js` | le montrer sur la série | invisible pour la personne |
| 5. contexte | `coach.js` | l'envoyer avec la série réalisée | Milo ne peut pas comparer prescrit / réalisé |
| 6. classement | `tests/donnees` | classer la donnée face à Milo (**R4a**) | **la livraison est refusée** — et c'est voulu |

⛔⛔ **L'étape 2 est celle qui a déjà coûté un mois.** `_normalizeMiloSession` est le **seul
écrivain** de `_pendingMiloSessions` en production : *tout champ qu'il ne recopie pas n'existe
pas*, quoi que le cervelet ait transcrit et quoi qu'on ait payé pour l'obtenir. C'est exactement
ce qui est arrivé à `supersetGroup` — correctif du 12/08 **inopérant jusqu'au 05/09**, et
**le témoin du banc était vert** parce que sa fixture écrivait à la main une forme que la
production ne produit pas (`BUGS.md` §36).

⚠️ **Donc le premier test à écrire n'est pas « le RIR cible s'affiche »** : c'est *« un
`targetRir` transcrit par le cervelet survit jusqu'à `S.wkt` en passant par le vrai
normaliseur »*.

⭐ **Et l'ordre du §26 est adopté sans réserve** : `targetRir` d'abord, observation réelle
ensuite, conditionnalité **seulement si le besoin est confirmé**. Le §27 l'est aussi — une
consigne d'autorégulation enfermée dans `note` serait invisible pour l'app, donc **R4** dans sa
forme la plus pure.

---

## 10. Intégration au banc hors ligne

Tout ce qui suit tourne **sans un seul appel API**, dans `tests/parcours/runner.js` :

- **diff** : deux séances construites à la main → chaque verdict (`UNCHANGED`/`MODIFIED`/…) ;
- **patch** : `BEFORE → patch → AFTER` attendu, **et `appels API = 0`** ;
- **invariant** : *les exercices non ciblés sont identiques au kilo, à la rep et à la seconde* ;
- **persistance** : `patch → persist() → load() → comparaison` (le §54 — et c'est aussi le point
  aveugle mesuré ce matin : le cycle complet enregistrer/relire/comparer n'existe qu'**une fois**
  dans toute la suite) ;
- **idempotence** : appliquer deux fois le même patch donne le même résultat ;
- **superset** : `group` et `groupType` inchangés après un patch qui ne les vise pas ;
- **montée** : après un `SET_LOAD`, la montée est-elle recalculée (et **seulement** si `_montee`) ;
- **identité** : après un `REMOVE_EX`, `sigSess` désigne-t-il toujours la même séance.

⚠️ **Le coût est réel et il se dit** : une passe complète dure **16 minutes**. Ces témoins sont
peu coûteux à l'unité (aucun réseau), mais *un banc qu'on ne lance plus ne protège rien* — il
faudra les grouper en un bloc, pas les disperser.

## 11. Intégration au banc API

Le §44 a raison sur le principe. Les scénarios réellement finançables, par ordre de netteté de
l'attendu :

| Scénario | Attendu | Vérifiable par code ? |
|---|---|---|
| `BENCH-MILO-ADJUST-003` — *« change seulement X »* | les autres exercices **identiques au kilo près** | ✅ **oui, parfaitement** |
| `BENCH-MILO-ADJUST-005` — conservation de structure | mêmes exercices, même ordre, même nombre de séries | ✅ oui |
| `BENCH-MILO-ADJUST-001/002` — « allège » / « augmente » | **le SIGNE** de la variation | ✅ oui pour le signe |
| — les mêmes, ampleur | *« −12,8 % est-il raisonnable ? »* | ❌ **non — juge humain** |
| `BENCH-MILO-ADJUST-004` — décharge | pas de définition chiffrée unique | ⚠️ partiel |

⭐ **Le pré-vol du §66 est adopté** : si les contrôles hors ligne échouent sur une fixture, on ne
dépense pas l'appel. C'est gratuit à écrire et ça évite de payer pour un test cassé.

⛔ **Et `EV-019` doit être scindé**, comme le demande le §35 — mais pour la raison mesurée au
§1 ci-dessus : il mélange aujourd'hui *« le calcul est correct »* et *« la conclusion métier est
correcte »*, avec en prime **un seuil différent de la production**. Le premier se fige hors ligne
(0 €) ; seul le second mérite un appel API.

---

## 12. Risques de régression

Classés par ce qu'ils coûteraient, pas par leur probabilité.

| # | Risque | Pourquoi il est discret | Ce qui le rattrape |
|---|---|---|---|
| 1 | **Un champ neuf non recopié par `_normalizeMiloSession`** | aucune erreur, aucun test rouge — le champ n'existe simplement pas | un témoin qui traverse **le vrai normaliseur**, jamais une fixture écrite à la main |
| 2 | **Un patch change `sigSess`** → deux séances au lieu d'une | ne se voit qu'au 2ᵉ onglet ou à la restauration | un témoin sur la signature avant/après patch |
| 3 | **Montée non recalculée** après un `SET_LOAD` | la séance reste valide et lançable, elle est juste mal échauffée | un témoin dédié, et la distinction `_montee` |
| 4 | **« ce que Milo dit prime » cassé** (`log.js:6627`) | un patch mal placé rendrait la main au pré-remplissage par l'historique | le témoin existe déjà (ft-v625) — **ne pas le contourner** |
| 5 | **Provenance faussée** : une charge modifiée par la personne reste `_milo` | le débrief reproche à Milo un choix qui n'est pas le sien, ou l'inverse | `src` au niveau série + témoin |
| 6 | **Doublon de primitive** (un `SET_LOAD` qui n'appelle pas `upSet`) | les deux marchent, puis divergent sur `persist()` ou `rm1` | R2, et un témoin qui vérifie que `rm1` est recalculé |
| 7 | **Aiguillage trop gourmand** : une phrase de coaching traitée en local | l'app décide à la place de Milo, en silence | repli asymétrique + confirmation avant application |
| 8 | **Le prompt gonfle** pour porter la séance courante | dilue toutes les autres règles (R20), et le bloc commun est presque plein | la séance va dans le **bloc personnel**, jamais dans le commun mis en cache |

---

## 13. Ordre d'implémentation recommandé

L'ordre du §68 est bon dans son principe, mais **l'étape 1 telle qu'elle est écrite n'est pas
exécutable** (voir §1). Ordre corrigé :

| # | Étape | Coût | Ce qu'elle débloque |
|---|---|---|---|
| **0** | **Compteur local de conflits** | ~30 lignes, 0 € | **le chiffre qui décide de tout le reste** |
| 1 | `sessionId` / `version` | ~20 lignes | referme un défaut de fusion **déjà présent** |
| 2 | **SESSION DIFF** | ~120 lignes, aucun risque | rend tous les tests d'invariant possibles |
| 3 | Scinder `EV-019` + aligner le seuil test/production | petit | supprime une contradiction mesurée |
| 4 | La séance courante **renvoyée à Milo** | contexte, pas de code neuf | ⭐ **la seule chose qui peut changer le comportement observé** |
| 5 | Patch local (aiguillage + 5 opérations sur les primitives existantes) | moyen | l'économie d'appels API |
| 6 | `targetRir` | traverse 6 endroits | la comparaison prescrit / réalisé |
| 7 | Patch émis par Milo (§18) | dépend de 1, 2, 5 | la modification ciblée par l'IA |
| 8 | Autorégulation conditionnelle | **seulement si 6 le justifie** | — |

⭐⭐ **Les étapes 0 à 3 ne changent AUCUN comportement utilisateur.** Elles installent la mesure et
l'outillage. C'est délibéré : *on ne modifie pas un système qu'on ne sait pas encore mesurer.*

⚠️ **Et l'étape 4 est probablement le meilleur rapport résultat / risque du chantier** — elle ne
demande ni patch, ni identifiant, ni moteur : seulement d'arrêter de faire relire à Milo son
propre texte quand on a l'objet sous la main.

---

## 14. Complexité, coût, maintenance

| Brique | Lignes | Risque | Coût API | Charge d'entretien |
|---|---|---|---|---|
| Compteur de conflits | ~30 | très faible | 0 | nulle |
| `sessionId` / `version` | ~20 | faible | 0 | nulle |
| SESSION DIFF | ~120 | **nul** (fonction pure) | 0 | faible |
| Séance renvoyée à Milo | ~40 | moyen (contexte) | **+ contexte à chaque tour** | à surveiller (R20) |
| Patch local | ~200 | **moyen à élevé** (7 risques sur 8 ci-dessus) | **économie** | moyenne |
| `targetRir` | ~80 sur 6 fichiers | moyen | négligeable | moyenne |
| Autorégulation | non estimable | élevé | — | **à ne pas engager maintenant** |

**Coût de test.** Chaque témoin hors ligne est gratuit à l'exécution mais s'ajoute aux 16 minutes
de la passe. Chaque scénario API coûte ~0,26 € **par passe**. Les 14 fixtures du §52 en API
coûteraient ~3,60 € par passe ; **la majorité d'entre elles n'ont pas besoin de l'API** (patch,
diff, persistance, idempotence, supersets sont tous déterministes) — **seules 4 ou 5 le méritent**.

---

## ⛔ Ce qui reste à trancher par Michel

| # | Question | Ce que l'audit peut dire |
|---|---|---|
| 1 | Pose-t-on le **compteur** avant tout le reste ? | C'est la recommandation. Sans lui, tout le dimensionnement est une hypothèse. |
| 2 | Accepte-t-on de **renvoyer la séance courante** dans le contexte à chaque tour ? | C'est le levier le plus direct, et il coûte du contexte — donc R34 s'applique : banc avant/après. |
| 3 | Le patch local doit-il **demander confirmation** ou être annulable ? | L'un des deux est obligatoire (§29). Le choix entre les deux est une décision d'usage. |
| 4 | Aligne-t-on le seuil de `EV-019` sur la production (+2 %) ou l'inverse ? | Deux seuils pour une règle est intenable ; lequel gagne est un arbitrage. |

---

## 🔗 Où va le reste

| Sujet | Document |
|---|---|
| L'audit du cas réel du 06/09 | `docs/AUDIT-GARDIEN-PRESCRIPTION.md` |
| Les questions ouvertes sur le comportement de Milo | `docs/JOURNAL-DE-TEST.md` |
| La frontière Milo / exécution mécanique | `docs/ARCHITECTURE-CERVEAU-CERVELET.md` |
| Les règles de construction citées | `docs/REGLES-ARCHITECTURE.md` |
| Les familles de bugs déjà rencontrées | `BUGS.md` |
