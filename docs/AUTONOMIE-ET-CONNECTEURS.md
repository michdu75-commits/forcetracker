# 🔌 Rendre l'app autonome — le moins d'IA possible, le plus d'intelligence possible

> **Créé le 12/09/2026, à la demande de Michel** : *« j'aimerais que tu étudies pour rendre l'appli
> le plus autonome possible, avec le moins d'IA possible et la plus intelligente possible avec des
> connecteurs »*.
> ⛔⛔ **LECTURE ET MESURE UNIQUEMENT — aucune ligne de production n'a été modifiée.**
> ⛔ **Nutrition hors périmètre** (consigne du jour).
> 📎 Prolonge `docs/CARTE-DONNEES-MILO.md` (qui dit *ce que Milo reçoit*) : celui-ci dit *ce dont on
> pourrait se passer*.

---

## ⭐⭐ LE CONSTAT QUI DÉCIDE DE TOUT : le bon patron existe déjà, il est appliqué à 3 endroits sur 14

Force Tracker n'a pas besoin d'inventer une architecture « moins d'IA ». **Elle est déjà écrite dans
le dépôt**, et elle a même un nom : l'**échelle des sources** de `REGLES-ARCHITECTURE.md` (**R33**).

> donnée **structurée** native → **texte de PDF** → **OCR** → **IA multimodale** → **échec propre**
> *On ne descend d'un cran que lorsque le précédent échoue.*

**Mesuré dans le code : les quatre barreaux de l'échelle sont DÉJÀ construits et embarqués.**

| Barreau | Ce qui est embarqué | Où on s'en sert aujourd'hui |
|---|---|---|
| **1. structuré** | `lib/xlsx.full.min.js` (881 Ko) — lecture CSV/XLSX | ⭐ **balance connectée** (`tracking.js`, import CSV/XLSX) |
| **1 bis. connecteur** | `healthInbox` / `healthDaily` — **boîte de réception serveur** | ⭐ **montre → raccourci iOS** (ft-v880) |
| **2. texte de PDF** | `_pdfToText()` — *« 100 % local, 0 IA »*, écrit, testé | ⛔ **UN SEUL appelant : le banc d'essai** |
| **3. OCR local** | `lib/ocr` (Tesseract) | ⭐ **bilan corporel** (ft-v974) |
| **3 bis. décodeur** | `lib/zxing.min.js` — code-barres | ⭐ **scan** : ZXing d'abord, IA seulement s'il échoue |
| **4. IA multimodale** | 14 actions serveur | **les 4 imports de documents y vont DIRECTEMENT** |

👉 ***Le problème n'est pas qu'il manque des briques : c'est que les imports sautent les barreaux 1 à 3.***

---

## 1. Le levier n°1 — `_pdfToText` existe et personne ne l'appelle

**Mesuré** : `_pdfToText()` (log.js) extrait la couche texte d'un PDF, **en local, gratuitement, sans
réseau**, avec regroupement des fragments par ligne. Son commentaire dit lui-même *« 100 % local,
0 IA »*.

| Fonction | Appelants |
|---|---|
| `_pdfToText` | **1** — et c'est le **Mode Test VM** (`coach.js`) |
| `_pdfToImages` | **4** — programme · historique · repas · bilan corporel |

**Les quatre imports rendent donc le PDF en IMAGES et envoient les images au modèle** — y compris
quand le PDF contient déjà tout le texte, proprement, exploitable en 200 ms.

### Pourquoi c'est le meilleur rapport valeur / risque

- **Gratuit et instantané** quand il marche (aucun appel, aucune attente, aucun quota).
- **Hors ligne** : un programme en PDF s'importerait **dans le métro** (règle d'or #4).
- **Aucune régression possible si on garde la cascade** : *texte → si vide ou inexploitable → images → IA*.
  C'est exactement ce que fait déjà le code-barres avec ZXing.
- **Le rapprocheur d'exercices existe déjà** (`_matchExercise`, avec ses paliers `auto`/`confirm`) :
  le texte extrait n'a pas besoin d'être parfait, il a besoin d'être **rapproché**.

### ⚠️ Ce qu'il faut mesurer avant de le construire

**Sur les vrais PDF de Michel**, et pas en théorie : combien ont une **couche texte** exploitable ?
Un programme fabriqué sous Word en aura ; un programme **scanné** ou **photographié** n'en aura pas.
👉 *La mesure tient en une soirée : lancer `_pdfToText` sur ses fichiers et compter.*

---

## 2. Les 14 actions IA, une par une — ce qui peut descendre d'un barreau

| Action | Ce qu'elle fait | Barreau atteignable | Verdict |
|---|---|---|---|
| `importProgram` | lit un programme (photo/PDF) | **2 — texte de PDF** | ⭐⭐ **cascade à construire** |
| `importHistory` | lit un historique de séances | **2 — texte de PDF** | ⭐⭐ **idem** |
| `importMealPlan` | lit un plan de repas | 2 | *(nutrition — hors périmètre)* |
| `importBodyScan` | lit un rapport de balance | **1 — connecteur** | ⭐⭐ **la balance exporte du CSV** (déjà lu !) |
| `readBarcode` | lit les chiffres d'un code-barres | **3 bis — déjà fait** | ✅ **ZXing d'abord, IA en secours** |
| `importBloodTest` | lit une prise de sang | 4 | ⛔ **reste à l'IA** — pas d'arithmétique interne pour vérifier une lecture (**R33**) |
| `bodyStudy` · `morphoAnalysis` | analyse de photos | 4 | ⛔ **reste à l'IA** — c'est du **jugement visuel** |
| `coach` | la conversation | 4 | ⛔ **c'est le produit** |
| `summarizeCoach` | résume la mémoire | 4 | ⛔ jugement |
| `seanceJson` | met une séance en forme | **code** | ⚠️ **candidat** : c'est une transformation, pas un jugement |
| `estimateFood` · `foodLabel` · `generateMealPlan` | nutrition | — | *(hors périmètre)* |

**⭐ Les deux critères, repris de `BRIEF-NUTRITION.md` et valables ici** :
① *« a-t-on besoin de savoir QUI est la personne ? »* — non → ça peut sortir de Milo ;
② *« est-ce une transformation VÉRIFIABLE, ou un JUGEMENT ? »* — transformation → ça peut devenir du code.

---

## 3. Les connecteurs — le patron existe, il s'appelle `healthInbox`

**Mesuré (ft-v880)** : le téléphone dépose les données de la montre dans une **boîte de réception
côté serveur** ; l'app les reçoit **avec le profil**, donc **sans aucun appel réseau supplémentaire**.
Le commentaire du code le dit : *« aucun appel réseau en plus, donc aucun risque pour l'ouverture
instantanée (règle d'or #4) »*.

⭐ **C'est le bon patron pour TOUS les connecteurs à venir** — il respecte les deux règles d'or les
plus dures (#3 zéro perte, #4 ouverture instantanée) et il ne met **rien** de bloquant au démarrage.

### Les connecteurs candidats, par rapport valeur / effort

| # | Connecteur | Ce qu'il apporte | Remplace | Effort |
|---|---|---|---|---|
| **1** | **Apple Santé / Google Fit** (raccourci iOS — *déjà branché des deux côtés*) | sommeil **mesuré**, pas, énergie active | de la saisie | ⭐ **le code est prêt, la donnée n'arrive pas** |
| **2** | **Balance connectée** (Withings, Xiaomi…) — export CSV/XLSX | poids, impédance, masse grasse **structurés** | `importBodyScan` (photo + IA) | faible — **`XLSX.read` est déjà embarqué** |
| **3** | **Montre** (Garmin/Polar/Suunto) — FIT/TCX ou via Santé | cardio, FC, durée réelle | saisie du cardio | moyen |
| **4** | **Fichier de programme structuré** (CSV/XLSX exporté par un coach) | programme **sans IA du tout** | `importProgram` | faible — même lecteur que ② |
| **5** | **Partage iOS (feuille de partage)** vers l'app | recevoir un PDF/texte sans passer par un fichier | — | moyen (natif) |
| **6** | **Open Food Facts** | *(nutrition — déjà en place, hors périmètre)* | — | — |

⛔ **Ce qu'on n'ajoute PAS** : un connecteur par anticipation. `STRATEGIE-NATIF.md` le dit déjà —
*« n'ajouter chaque plugin que sur un besoin réel »*. Les connecteurs 3 et 5 demandent la coque
native ; 1, 2 et 4 se font **en PWA, aujourd'hui**.

---

## 4. L'intelligence SANS IA — l'inventaire de ce qui existe déjà

Mesuré : **13 moteurs déterministes** tournent déjà, sans aucun appel réseau.

| Moteur | Ce qu'il décide |
|---|---|
| `bz()` | le 1RM (Brzycki) |
| `calcTDEE` · `calcMacros` | la dépense et les macros |
| `calcRecoveryScore` | la récupération |
| `getExerciseMET` · `_mscScores` | les calories, les muscles travaillés |
| `_matchExercise` | rapprocher un nom d'exercice du catalogue (avec paliers de confiance) |
| `_gardienRules` | la sécurité (zones fragiles, blessures) |
| `projectRM` | la projection de progression |
| `getProgCurrentWeek` | la semaine de cycle, l'alternance A/B |
| `_validationSeance` · `_dureeDouteuse` | « cette séance est-elle plausible ? » |
| `_serieFaitFoiPourPR` | « cette série compte-t-elle pour un record ? » |
| `openBeginnerSetup` | **un générateur de programme SANS IA** (2 questions) |
| `_pendingGap` · `_pendingEnrich` · `_pendingConfirm` | quand poser une question, et laquelle |

### Ce qu'on peut rendre intelligent sans une ligne d'IA

| Idée | Pourquoi c'est du code, pas de l'IA |
|---|---|
| **Progression automatique** : proposer +2,5 / +5 kg quand toutes les séries sont passées proprement | la règle est **écrite dans le prompt** de Milo depuis toujours — donc elle est **déterministe**, et elle est aujourd'hui appliquée par un modèle probabiliste |
| **Décharge (deload)** toutes les 4-6 semaines | idem : règle fixe, déjà écrite |
| **Alerte de stagnation** : même charge, même reps, 3 séances de suite | comparaison, pas jugement |
| **« Tu n'as pas travaillé ce muscle depuis 3 semaines »** | `_mscScores` + dates. Zéro IA. |
| **Débrief chiffré de fin de séance** | ⭐ **déjà décidé** dans `SEANCE-DESSAI.md` : *le débrief CHIFFRÉ est calculé en LOCAL, toujours* ; Milo n'ajoute que le **jugement et le ton** |
| **Le tour de taille dans la tendance** | soustraction entre deux mesures |

⛔ **Et la limite à ne pas franchir** : ces règles **proposent**, elles ne décident pas à la place de
la personne (**R29**). Un « +2,5 kg » suggéré est une aide ; un « +2,5 kg » imposé est une erreur.

---

## 5. Ce qui justifie vraiment l'IA — et qu'il ne faut PAS essayer de coder

| Ce qui reste à l'IA | Pourquoi |
|---|---|
| **La conversation** | c'est le produit |
| **Le diagnostic** | *même contexte, cause différente → stratégie différente* (`MOTEUR-RAISONNEMENT-MILO.md`) |
| **Relier ce qui n'est dans aucun champ** | *« tu as annoncé le bas du corps, tu as fait du haut, et tu déménages en octobre »* |
| **Lire un document sans structure** (photo, scan, écriture à la main) | aucune arithmétique interne ne permet de vérifier la lecture |
| **Le jugement visuel** (photos, morphologie) | ce n'est pas une transformation |

---

## 6. L'ordre de marche proposé

> ⛔ **Rien n'est commencé : ce document est une étude, pas un plan validé.**

| # | Étape | Pourquoi dans cet ordre | Coût |
|---|---|---|---|
| **0** | **MESURER** : passer les vrais PDF de Michel dans `_pdfToText` et compter ceux qui ont une couche texte | *sans ce chiffre, tout le reste est une hypothèse* | une soirée |
| **1** | **Brancher le raccourci iOS** (sommeil + pas) | le code est **déjà prêt des deux côtés**, la donnée n'arrive pas | côté Michel |
| **2** | **Cascade PDF pour l'import de programme** : texte → sinon images → IA | le plus gros gain, le patron existe (ZXing) | moyen |
| **3** | Même cascade pour l'**import d'historique** | jumelle de ② — *et une porte jumelle non traitée est un oubli, pas un arbitrage* (**R8**) | faible après ② |
| **4** | **Import CSV/XLSX de balance** en entrée officielle | `XLSX.read` est déjà embarqué et utilisé | faible |
| **5** | **Règles de progression locales** (charge, décharge, stagnation) | rend l'app utile **sans réseau ni quota** | moyen |
| **6** | Alléger le contexte de Milo (cycle de force absent quand il n'y a pas de cycle) | ⛔ **gated par le banc d'essai** (**R34**) | bloqué |

---

## 7. Ce qu'on ne peut PAS trancher ici

| Question | Ce qui manque |
|---|---|
| « Telle section du contexte sert-elle ? » | **un vrai banc d'essai API** — aucune exception |
| « La cascade PDF couvrirait quel pourcentage des imports ? » | **les vrais fichiers de Michel** |
| « Un connecteur montre vaut-il la coque native ? » | l'usage réel — `STRATEGIE-NATIF.md` : *le natif ne doit apporter que ce que le web ne peut pas offrir* |

---

## 8. La phrase à retenir

> **Force Tracker n'a pas un problème d'IA : il a un problème de BARREAUX SAUTÉS.**
> Les quatre étages de l'échelle sont construits, embarqués et payés. Trois d'entre eux ne servent
> qu'à un seul endroit chacun. *La version la plus autonome de l'app n'est pas celle qui remplace
> l'IA : c'est celle qui ne l'appelle que lorsque les trois autres barreaux ont échoué.*

---

*Étude établie le 12/09/2026, en lecture seule. Aucune ligne de production modifiée.
Tous les chiffres proviennent du code du dépôt à cette date.*
