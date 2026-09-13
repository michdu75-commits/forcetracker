# 🎯 Trois axes — cascade PDF · règles sortables de Milo · poids du contexte

> **Créé le 13/09/2026, à la demande de Michel** (3 axes précis, **lecture seule**).
> ⛔⛔ **AUCUNE LIGNE DE PRODUCTION MODIFIÉE. Rien n'est décidé, rien n'est branché.**
> ⛔ Nutrition hors périmètre · aucune réduction de prompt au jugement · aucune correction silencieuse.

---

## ⛔⛔ D'ABORD : DEUX CHIFFRES QUE JE T'AI DONNÉS HIER ÉTAIENT FAUX

Je les ai trouvés **en continuant à mesurer**, pas parce que quelqu'un me l'a signalé. Ils sont dans
`docs/CARTE-DONNEES-MILO.md` et dans le dossier PDF destiné à GPT.

| Ce que j'ai annoncé | La mesure corrigée | Ce que ça invalide |
|---|---|---|
| *« CYCLE DE FORCE = 14 097 car. envoyés même sans cycle actif — candidat n°1 à l'allègement »* | ⭐ **38 caractères** : le bloc se réduit à *« Aucun cycle actif »*. **L'app fait déjà ce que je proposais de faire.** | ⛔ toute la ligne « dépendance IA excessive » sur le cycle · ⛔ **la question n°4 posée à GPT n'a pas lieu d'être** |
| *« TA PERSONNALITÉ = 31 091 car., 39 % du contexte »* | **4 192 caractères, 5,1 %** | le classement des « plus gros blocs » était faux |
| *« 13 sections »* | **25 sections** | — |

**⚠️ LA CAUSE EST MON DÉCOUPEUR, ET ELLE EST INSTRUCTIVE** : il exigeait **70 % de capitales sur
toute la ligne** pour reconnaître un titre. Il rejetait donc
`MÉTHODE DE COACHING (très important) :` — et **attribuait ses 14 000 caractères à la section
précédente**. 👉 ***Un découpeur trop strict ne perd pas des sections : il les COLLE à leur voisine,
et le voisin devient énorme.*** Un titre se reconnaît désormais à ses **trois premiers mots**.

**⭐ Et le chiffre corrigé est plus parlant que le faux** : voir §3.

---

## 1. CASCADE PDF — la couverture réelle, mesurée

### 1.1 Ce que j'ai pu mesurer, et sur quoi

⭐ **Sur tes VRAIS fichiers** : tu as déposé 4 PDF dans cette session (2 programmes identiques,
2 exports d'historique). Ce ne sont pas des exemples fabriqués.

| Fichier | Pages | Opérateurs de texte | Caractères | Images | Verdict |
|---|---|---|---|---|---|
| `Programme_Powerbuilding_Bloc_1_V2.pdf` | 3 | **341** | ~11 400 | **0** | ✅ **couche texte** |
| `forcetrackerhistorique_20260906_2.pdf` | 22 | **10 488** | ~52 400 | **0** | ✅ **couche texte** |
| `forcetrackerhistorique_20260904.pdf` | 21 | **9 532** | ~47 000 | **0** | ✅ **couche texte** |

**4 fichiers sur 4. Zéro image. Zéro PDF scanné.**

### 1.2 « Exploitable », pas seulement « présente »

Sur le **programme**, le texte extrait porte **toute la structure** :

| Ce qu'on cherche | Trouvé |
|---|---|
| noms d'exercices | **21** |
| séries × reps (`4x8`, `3 x 10`) | **37** |
| charges en kg | **31** |
| temps de repos | **45** |
| RIR / RPE | **4** |

Extrait brut : *« PROGRAMME POWERBUILDING - BLOC 1 - V2 · 4 semaines - 4 seances/semaine ·
DC 130 / Squat 140 / SDT 180 »*.

⚠️ **Sur l'HISTORIQUE, la structure est TABULAIRE, et c'est une nuance qui compte** : 1 272 noms
d'exercices et 78 dates lisibles, mais **aucun « 4x8 » ni « 80 kg »** — parce que les séries, reps
et kg sont des **cellules de colonnes**, pas du texte courant. Les valeurs y sont bien (j'ai lu
`Leg Curl Assis Machine | 1 | N | 54 | 10 | 540`), mais il faut les **coordonnées** pour
reconstituer les lignes. ⭐ **C'est exactement ce que `_pdfToText` fait déjà** (regroupement par Y,
tri par X).

### 1.3 ⛔ Ce que je n'ai PAS pu mesurer, et pourquoi

**La mesure décisive — faire tourner `_pdfToText` DE L'APP sur tes fichiers — a échoué ici** :
`Impossible de charger PDF.js`. **pdf.js est chargé depuis un CDN** (`cdn.jsdelivr.net`) et le
réseau de ce conteneur le refuse. Ma propre extraction est indépendante de pdf.js, donc elle prouve
la **présence** et la **richesse** du texte — pas le rendu exact de la fonction de production.

**⭐⭐ ET CETTE LIMITE EST ELLE-MÊME UN CONSTAT D'ARCHITECTURE.** Mesuré :

| Lecteur | Où il vit |
|---|---|
| ZXing (codes-barres) · Tesseract (OCR) · xlsx · jsPDF | ⭐ **embarqués dans `lib/`** |
| **pdf.js** | ⛔ **CDN, chargé à l'exécution** |

👉 **L'import PDF ne fonctionne donc pas hors ligne aujourd'hui** — ni le chemin actuel
(`_pdfToImages`) ni la cascade proposée, **puisque les deux passent par pdf.js**. Ce n'est donc
**pas une régression apportée par la cascade** ; c'est une dette qui existe déjà et qu'il faudrait
nommer avant de bâtir dessus (**règle d'or #4**).

### 1.4 Le tableau demandé, par type d'import

| Type | Texte PDF exploitable | OCR nécessaire | IA nécessaire | Données structurées disponibles AVANT l'IA |
|---|---|---|---|---|
| **Programme** | ✅ **oui** (mesuré : 37 séries×reps, 31 kg, 45 repos) | ⛔ non | ⚠️ **seulement en secours** | ⚠️ **oui si le coach exporte en CSV/XLSX** — le lecteur est déjà embarqué |
| **Historique** | ✅ **oui, mais tabulaire** — il faut les coordonnées | ⛔ non | ⚠️ **seulement en secours** | ⭐⭐ **OUI — l'app EXPORTE DÉJÀ l'historique en CSV**. Deux des fichiers mesurés sont **son propre export PDF** (*« 40 séances · 733 séries · exporté le 04/09 »*) |
| **Plan de repas** | non mesuré | — | — | *(nutrition — hors périmètre)* |
| **Bilan corporel** | non mesuré (pas de fichier) | ⭐ **déjà en place** (Tesseract, ft-v974) | en dernier recours | ⚠️ **oui** : les balances exportent du CSV/XLSX, et `XLSX.read` est **déjà utilisé** pour ça |
| **Prise de sang** | non mesuré | possible | ⛔ **oui, et ça doit le rester** — aucune arithmétique interne ne permet de vérifier la lecture | non |

### 1.5 La cascade minimale proposée (à valider, pas à coder)

```
 ① SOURCE STRUCTUREE   CSV / XLSX / export de l'app        -> 0 appel, 0 attente
        |  (absente ou illisible)
        v
 ② TEXTE PDF           _pdfToText  (deja ecrit, 1 appelant) -> 0 appel IA
        |  (aucune couche texte, ou structure non reconnue)
        v
 ③ OCR LOCAL           Tesseract   (deja embarque)          -> 0 appel IA
        |  (illisible)
        v
 ④ IA                  le chemin actuel                     -> 1 appel
        |
        v
 ⑤ ECHEC PROPRE        « document non reconnu » — jamais une donnee inventee
```

**⭐ Le patron existe déjà à un endroit** : le code-barres (ZXing d'abord, IA seulement s'il échoue).
**⛔ Et la règle qui rend la cascade sûre** : on ne descend d'un cran **que** si le précédent échoue,
et **chaque cran doit pouvoir dire « je ne sais pas »** — un cran qui devine est pire qu'un cran absent.

### 1.6 ⛔ Ce qui reste à mesurer avant de coder

1. **Rejouer `_pdfToText` sur tes 4 fichiers** — depuis un endroit qui a accès au CDN, ou après avoir
   embarqué pdf.js dans `lib/` comme les 4 autres lecteurs.
2. **Un bilan corporel** et **un plan de repas** réels (aucun fichier disponible ici).
3. **Un programme reçu d'un coach** (pas généré par l'app) — c'est le vrai cas d'usage de l'import.

---

## 2. LES RÈGLES QUI PEUVENT SORTIR DE MILO

⭐ **Vérifié dans le code avant d'affirmer quoi que ce soit (R23)** : **aucune** de ces règles n'a
aujourd'hui de fonction locale — sauf le débrief, qui en a déjà une.

| Règle | Texte actuel dans le prompt | Données nécessaires | Déjà disponibles ? | Propriétaire actuel | Calculable localement ? | Risque si déplacée |
|---|---|---|---|---|---|---|
| **Progression** | *« monte la charge quand toutes les séries passent proprement (~+2,5 kg haut du corps, +5 kg bas du corps) »* | dernières séries d'un exercice : `done`, `kg`, `reps`, `type` | ✅ `S.sessions` | ⛔ **le prompt seul** | ✅ **oui** — c'est un seuil | ⚠️ *« proprement »* n'est pas défini : le code devra le **nommer** (toutes validées, aucune `X`, RIR ≥ n ?). **C'est une décision produit, pas une traduction.** |
| **Décharge (deload)** | *« une semaine plus légère toutes les 4-6 sem »* | date de début de cycle, ou dates de séances | ✅ `S.cycle` / `S.sessions` | ⛔ le prompt | ✅ oui | ⚠️ 4 **ou** 6 ? Le prompt tolère un flou qu'un code doit trancher |
| **Stagnation** | *« changer le stimulus si ça stagne »* | mêmes charge/reps sur N séances | ✅ `S.sessions` | ⛔ le prompt | ✅ oui | ⚠️ **N n'est écrit nulle part** — à décider |
| **Muscle non travaillé depuis X semaines** | implicite (*« ce qui est travaillé et ce qui ne l'est pas »*) | muscles par exercice + dates | ✅ `_mscScores` + `S.sessions` | ⛔ aucun | ✅ **oui, entièrement** | faible — c'est un constat, pas un conseil |
| **Effort maximal → 4 à 7 jours** | *« compte 4 à 7 jours avant de reproposer un maximal sur le MÊME mouvement »* | date du dernier record par exercice | ✅ `S.prs[x].date` | ⛔ le prompt | ✅ oui | ⚠️ « maximal » à définir (1-3 reps près du max) |
| **Charges/reps selon l'objectif** | *« force → 3-6 reps, repos 2-4 min ; hypertrophie → 8-15, repos 60-90 s »* | objectif | ✅ `S.goal` | ⛔ le prompt | ✅ **oui, c'est une table** | faible |
| **Débrief chiffré** | — | séance terminée | ✅ | ⭐ **`_debriefLocal` (log.js) — DÉJÀ LOCAL** | ✅ **déjà fait** | aucun |

### ⛔ La limite, et elle n'est pas négociable

**Force Tracker peut PROPOSER. Il ne décide pas à la place de la personne.**
Un « +2,5 kg » **suggéré**, visible, refusable, est une aide. Un « +2,5 kg » **appliqué** est une
erreur — et c'est déjà une règle du projet (**R29**).

### ⚠️ Le risque commun aux six, dit une fois

Ces règles sont aujourd'hui **des phrases**, avec le flou qu'une phrase autorise (*« proprement »*,
*« 4-6 »*, *« si ça stagne »*). Les coder **oblige à trancher ce flou**. 👉 ***Sortir une règle de
Milo n'est pas une traduction : c'est une décision produit déguisée en refactorisation.***
Et il faut décider ce que Milo en fait ensuite : **s'il garde la phrase ET que le code calcule, on a
deux sources qui peuvent se contredire** (la famille de bugs la plus coûteuse du projet).

---

## 3. LE CONTEXTE DE MILO — mesuré, rien réduit

### 3.1 Le partage réel

| | Caractères | Part |
|---|---|---|
| **DONNÉES de la personne** | **12 712** | **15,6 %** |
| **CONSIGNES et cadres** | **68 664** | **84,4 %** |
| **Total** | **81 376** | 25 sections |

⭐ *Le chiffre corrigé est plus fort que celui que j'avais annoncé : ce ne sont pas « les 3/4 », ce
sont **plus de 5/6**.*

### 3.2 Les 12 plus gros blocs

| Section | Car. | Part | Cache | Nature |
|---|---|---|---|---|
| ÉTAT DU JOUR & CHECK-IN | **18 409** | 22,6 % | cache 1 h | **consignes** |
| MÉTHODE DE COACHING | **14 053** | 17,3 % | cache 1 h | **consignes** |
| NUTRITION | **13 178** | 16,2 % | cache 1 h | **consignes** *(hors périmètre)* |
| **PROFIL ATHLÈTE** | 6 189 | 7,6 % | cache 1 h | **données** |
| ⚖️ LES CHARGES QUE TU ÉCRIS… | 5 454 | 6,7 % | cache 1 h | consignes |
| TA PERSONNALITÉ | 4 192 | 5,1 % | cache 1 h | consignes |
| **DERNIÈRES SÉANCES** | 3 124 | 3,8 % | cache 1 h | **données** |
| RETENIR DURABLEMENT (mémoire) | 2 273 | 2,8 % | cache 1 h | consignes |
| 🛡️ RÈGLES DU GARDIEN | 1 991 | 2,4 % | cache 1 h | consignes + données |
| LA COHÉRENCE AVANT LA RÉACTIVITÉ | 1 808 | 2,2 % | cache 1 h | consignes |
| CHOISIR LES BONNES DONNÉES | 1 693 | 2,1 % | cache 1 h | consignes |
| **RÉCUPÉRATION & SOMMEIL** | 1 461 | 1,8 % | ⛔ **plein tarif** | **données** |

### 3.3 La frontière du cache

**91 % du contexte est AU-DESSUS de la ligne `═══ SITUATION DE L'INSTANT ═══`**, donc **mis en cache
1 h**. Seuls **`RÉCUPÉRATION & SOMMEIL` (1 461 car.)** et le bloc instant lui-même (1 304 car.) sont
payés plein tarif à chaque message.

⛔ **Et le prompt porte lui-même sa règle de conception**, il faut la citer avant de proposer quoi
que ce soit : *« ① ne jamais insérer plus haut une valeur qui CHANGE ; ② ne jamais rendre un bloc
plus haut CONDITIONNEL — **un bloc qui apparaît puis disparaît casse le cache exactement comme une
valeur qui change** »*.

### 3.4 Sections envoyées même quand vides — mesuré

| Section | Quand la donnée manque | Verdict |
|---|---|---|
| **CYCLE DE FORCE** | **38 car.** — *« Aucun cycle actif »* | ⭐ **déjà optimal**. Taille **fixe** → le cache est préservé. *C'est le modèle à copier, pas le problème.* |
| RECORDS PERSONNELS | 238 car. avec 3 records | proportionnel aux données |
| CHECK-IN SÉANCES RÉCENTES | 70 car. | négligeable |
| POIDS & COMPOSITION | 162 car. | négligeable |

👉 ***Aucun bloc de données ne gaspille : ce qui pèse, ce sont les CONSIGNES, et elles sont dans le
cache.*** Le contexte est donc **bien plus sain** que ce que ma mesure d'hier laissait croire.

### 3.5 Doublons mesurés (inchangés, confirmés)

poids et dernière pesée dans **3 sections** · objectif dans **4** · charges dans **2** (Records /
Dernières séances — *probablement légitime*, ce ne sont pas les mêmes faits) · priorités dans **2**.

### 3.6 Dépendances entre sections

- Le **Gardien** lit `healthProfile` **et** la douleur du jour → il dépend de deux blocs.
- **RÉCUPÉRATION & SOMMEIL** dépend de `_nuit()`, qui unit `sleepLog` **et** `healthDaily`.
- **RECORDS** et **DERNIÈRES SÉANCES** partagent la même source (`S.sessions`) → d'où le doublon des charges.

---

## 4. Optimisations possibles SANS changer le comportement

| # | Optimisation | Gain | Risque |
|---|---|---|---|
| 1 | **Embarquer pdf.js dans `lib/`** comme les 4 autres lecteurs | l'import PDF marcherait **hors ligne** ; et la cascade devient possible | ⚠️ poids du fichier — à mesurer |
| 2 | **Cascade PDF** sur programme et historique | 0 appel quand le texte suffit, réponse **instantanée** | ⚠️ nécessite ① |
| 3 | **Import CSV/XLSX** comme entrée officielle (balance, programme) | supprime un appel IA entier | faible — le lecteur est déjà là |
| 4 | Retirer **un** des 3 emplacements du poids dans le contexte | quelques centaines de caractères, **dans le cache** → gain ≈ nul | ⛔ **change ce que Milo reçoit → banc d'essai** |

⭐ **Les trois premières ne touchent pas au contexte de Milo** : elles ne demandent donc **aucun banc
d'essai**. C'est ce qui les rend faisables en premier.

---

## 5. Ce qui exige obligatoirement un banc d'essai API

1. **Retirer quoi que ce soit des consignes** (68 664 car.) — sans exception.
2. **Ajouter** l'historique des check-in, les badges ou le tour de taille : *ajouter change aussi ce
   que Milo reçoit*.
3. **Réduire les doublons** du contexte.
4. Toute réponse à *« Milo s'en sert-il vraiment ? »*.
5. **Sortir une règle de Milo** (progression, décharge, stagnation…) **si on retire la phrase du
   prompt** — si on la garde, ça devient deux sources pour une même décision.

---

## 6. Ordre recommandé des prochains chantiers

| # | Chantier | Pourquoi dans cet ordre | Banc d'essai ? |
|---|---|---|---|
| **0** | **Rejouer `_pdfToText` sur les 4 fichiers**, depuis un poste qui a le réseau | *le seul chiffre qui manque encore* | non |
| **1** | **Embarquer pdf.js dans `lib/`** | prérequis de la cascade **et** correction d'une dette hors ligne | non |
| **2** | **Cascade PDF — import de programme** | le plus gros gain, patron déjà éprouvé (ZXing) | non |
| **3** | **Même cascade — import d'historique** | jumelle de ② ; *une porte jumelle non traitée est un oubli, pas un arbitrage* (**R8**) | non |
| **4** | **Import CSV/XLSX** (balance, puis programme) | lecteur déjà embarqué et déjà utilisé | non |
| **5** | **Muscle non travaillé depuis X semaines** | la règle locale la **moins risquée** : un constat, pas un conseil | non |
| **6** | **Progression / stagnation / décharge** | ⚠️ demandent de **trancher le flou** des phrases actuelles | ⚠️ oui si on retire la phrase du prompt |
| **7** | Les 4 trous de connexion (tour de taille, check-in, badges, montre) | chacun **ajoute** au contexte | ⛔ **oui, obligatoire** |
| **8** | Doublons du contexte | gain faible, dans le cache | ⛔ oui |

---

## 7. Les trous de connexion — gardés OUVERTS et documentés

⛔ **Non branchés, à ta demande.** Les ajouter change ce que Milo reçoit → banc d'essai obligatoire.

| Trou | État mesuré |
|---|---|
| **tour de taille / cou / hanches** | absents du contexte ; le prompt les réclame **2 fois** |
| **historique des check-in** (`dayStateLog`) | **0 occurrence** dans `coach.js` |
| **badges** | déclarés transmis, **ne le sont pas** |
| **sommeil / pas** | code branché des deux côtés, la donnée n'arrive pas (raccourci iOS) |

---

## 8. Une limite d'environnement, dite plutôt que tue

**Les passes de tests complètes (~16 min) ne survivent pas dans ce conteneur** : mesuré **5 fois**,
le processus est interrompu entre deux tours et le journal s'arrête **sans total** — ce qui ressemble
trait pour trait à une passe verte (**`BUGS.md` §61**). La seule passe complète obtenue l'a été en
restant actif sans interruption : **3583 ✅ · 0 ❌** (arbre d'avant la fusion).

👉 **Conséquence concrète** : `ft-v1200` **n'est pas en ligne**, et ne le sera pas tant qu'une passe
complète n'aura pas tourné sur l'arbre fusionné.

---

*Mesures du 13/09/2026, en lecture seule. Aucune ligne de production modifiée.
Sondes : `couche_texte.py`, `exploitable.py`, `mesure_pdftotext.js` (hors dépôt).*
