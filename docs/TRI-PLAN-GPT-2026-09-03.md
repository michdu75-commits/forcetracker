# TRI DU PLAN GPT — 28 POINTS, MESURÉS CONTRE LE CODE

> Réponse à ta demande du §28 : *« classe chaque point, justifie avec le code réel, **ne code pas
> avant ce retour** »*. **Rien n'a été codé.** Mesuré le 03/09/2026 sur `ft-v1113`.

---

## LE RÉSULTAT QUI CHANGE TON PLAN : TA QUESTION §9 A UNE RÉPONSE, ET ELLE INVERSE LE PROBLÈME

Tu demandes d'où sort le **3,2 min/série** avant de le figer. Tu as eu raison de le demander.

**Ce n'est ni une constante de l'app, ni une approximation du banc, ni une hypothèse.** C'est
**Milo qui l'a calculé lui-même**, dans sa propre réponse, à partir d'un nombre que l'application
lui a **mesuré**.

`_rythmeSeance()` (coach.js) fait exactement ce que tu proposes au §9 :

- elle lit `sess.duration` sur les **12 dernières séances** ;
- elle prend la **médiane**, pas la moyenne (une séance écourtée fausserait une moyenne) ;
- elle **retire le cardio** — et seulement s'il était compté dans la mesure ;
- elle **refuse les durées estimées** (`estimee`), qui se déduisent du temps de repos réglé :
  *s'en servir reviendrait à mesurer le réglage de la personne avec ce même réglage* ;
- sans historique suffisant, elle rend une estimation **et dit que c'en est une**
  (`mesure:false`).

Puis `_ctxRythme()` l'envoie à Milo, avec l'ordre explicite :

> *« ⚠️ ARITHMÉTIQUE OBLIGATOIRE dès qu'il/elle demande une séance d'une DURÉE donnée :
> (durée demandée − cardio) ÷ [son rythme] = le nombre MAXIMUM de séries. **Si ton plan dépasse
> ce nombre, RETIRE des séries ou un exercice — ne réponds JAMAIS « ça tient en 1 h » sans avoir
> posé ce calcul.** »*

Et il va plus loin que ce que tu imaginais : il lui dit aussi de **compter les séries que l'app
ajoute toute seule** (montée en charge : 3-4 paliers sur le premier exercice, 1 sur les suivants),
et de les compter **à 1,5 min** et non au tarif plein.

### ⛔⛔ CE QUE ÇA FAIT AU DÉFAUT DE DURÉE

Milo **reçoit la donnée**, **dans le bon canal**, **avec l'instruction juste**, **et il pose le
calcul** — puis il écrit **20 séries pour un budget de 14** et conclut *« ça tient »*.

👉 **C'est le premier `MODEL_ONLY` avéré de tout cet exercice**, au sens exact de ta définition
§56 : données correctes, payload correct, canal correct, aucune contradiction, instruction
explicite — et la réponse ne suit pas.

Et **ça tranche ton §7** : tu demandes si Force Tracker devrait vérifier le budget plutôt que
d'espérer que Milo recompte. **Oui — parce que le levier du prompt a déjà été tiré, à fond.** La
règle du projet dit que le prompt est le *dernier* levier ; ici il a été utilisé jusqu'au bout, et
il ne suffit pas.

⚠️ **Nuance sur ton §8** : tu crains une fausse précision. L'app la gère déjà — `_rythmeSeance`
rend `mesure:true/false` et le contexte dit *« MESURÉ sur ses N dernières séances »* ou
*« ESTIMÉ »*. Un contrôle de durée peut donc être **strict quand c'est mesuré, tolérant quand
c'est estimé**, sans inventer de seuil.

---

## LE TRI DES 28 POINTS

### ✅ DÉJÀ FAIT — ne rien reconstruire

| § | Ton point | Ce que le code fait déjà |
|---|---|---|
| **9** | *« d'où vient 3,2 ? »* | `_rythmeSeance()` **mesure** le coût réel d'une série (médiane sur 12 séances, cardio retiré, durées estimées refusées) ; `_ctxRythme()` l'envoie avec l'arithmétique obligatoire. **Le 3,2 est le chiffre de CE persona, pas une constante.** |
| **9** | *« repos par exercice ? »* | `S.exRestPref` existe, s'écrit tout seul quand on règle le chrono, et **est transmis** — c'était le dernier des deux trous connus du garde-fou de données, comblé le 12/08. |
| **22** | arrondi des charges | `_PAS_CHARGE_TABLE` + `_ctxCharges()` : *« 82,5 kg n'est pas une charge, c'est une chasse au disque de 1,25 : écris 80 ou 85 »*, avec les pas par matériel et **« en cas de doute, arrondis vers le bas »**. Testé par EV-001. |
| **23** | catalogue = source de vérité | Fait hier : le vérificateur interroge `EXLIB` au lieu d'une copie. 0 faux positif / 19 lignes réelles, 4 inventés / 4 attrapés. |
| **24** | chaîne réponse → séance | **Mesurée** : 3 exercices lus depuis un vrai format, noms préservés, montée en charge ajoutée, `_milo:true` posé, séance lançable, **0 appel IA** sur lecture + validation + activation. Couverte par 14 témoins (`_extractDaySession`), 24 (`_startSessionFromMilo`/`_appliqueMiloSession`), 9 (`_cerveletSeance`). Un arbitrage existe même pour le cas « le bloc caché a perdu un exercice ». |
| **11** | contrôle positif **et** négatif obligatoires | C'est devenu la règle hier (bloc CCXVII) : chaque correctif est éprouvé vert sur la bonne réponse **et** rouge sur la mauvaise. Reste à **généraliser aux 55 scénarios** (voir « à faire »). |
| **21** | contradictions demande ↔ données | Plusieurs existent : **EV-039** (« je veux ABSOLUMENT le pec deck »), **EV-046** (« ne me propose plus jamais l'elliptique »), **EV-044** (écho cardiaque demain), **EV-025** (exercice déjà refusé). |
| **25** | cas Michel réel | **Déjà majoritaire, et c'est même le déséquilibre inverse** : 46 fixtures sur 53 portent son profil, 35/53 sont `confirmé`, 43/53 en objectif `muscle`. Il n'y a que **3 débutants**. |

### 🔴 À FAIRE MAINTENANT

| § | Ton point | Pourquoi maintenant, et ce que ça coûte |
|---|---|---|
| **7 · 10** | contrôle déterministe du budget | **Le seul vrai correctif d'application du lot.** Les pièces existent toutes : `_rythmeSeance()` (coût réel par série), `S.exRestPref` (repos par exercice), le compte des paliers auto. `_validationSeance` est le point unique que les deux portes traversent — et **elle ne parle pas de durée** (vérifié : le mot n'y apparaît pas). **~30 lignes**, 0 appel API. |
| **2-5** | le petit A/B | **4 appels, ~0,05 €.** Techniquement possible depuis ft-v1106. Voir le protocole ci-dessous. |
| **19** | mutation d'une seule donnée | Le meilleur rapport valeur/coût après l'A/B : **2 appels par mutation**. Trois mutations = 6 appels. |
| **11** | généraliser positif/négatif | Gratuit, mécanique : rejouer chaque vérificateur contre une bonne et une mauvaise réponse. **Sans appel API.** |

### 🟡 UTILE, MAIS PLUS TARD

| § | Ton point | Pourquoi différer |
|---|---|---|
| **13 · 14** | enrichir les personas | **D'accord sur le fond** — 3 scénarios sur 55 seulement donnent un historique. Mais chaque persona enrichi **change ce que Milo reçoit**, donc demande son propre avant/après. À faire **après** l'A/B, qui dira si ça vaut le coup. |
| **18** | priorité quand Milo raccourcit | Ne se mesure **pas sans API**, et seulement une fois le contrôle de durée en place — sinon on observe un comportement qu'on va changer. |
| **20** | données anciennes vs récentes | **EV-027 le couvre déjà** (85×5 en avril → 60×8 depuis août, et il compte les séances de la reprise). Tu demandes si c'est robuste ou chanceux : c'est **1 appel** en mutation, à joindre au lot du §19. |
| **15 · 16** | le modèle matériel à deux dimensions | **Tu as raison sur le fond, et c'est mesuré** : 15 exercices sur 39 offerts en « Maison sans matériel » exigent un agrès. Mais `_exEquip` rend **un seul bac** (type de résistance) et **aucun champ « matériel requis » n'existe** (0 occurrence). C'est un changement de modèle de données. **Décision déjà prise par Michel : différé**, écrit avec ses chiffres dans `IDEES-FUTURES.md`. |

### ⛔ INUTILE / MAUVAISE IDÉE

| § | Ton point | Pourquoi |
|---|---|---|
| **9** | figer 3,2 dans le moteur | **Surtout pas**, et ta prudence était justifiée : ce serait remplacer une mesure **par personne** par une constante **pour tout le monde** — exactement le contraire de ce que fait `_rythmeSeance`. |
| **12** | *« éviter les regex fragiles »* | D'accord, mais pas comme règle absolue. Certaines choses **ne sont vérifiables que dans le texte** (ne pas poser de diagnostic médical, ne pas inventer une source, ne pas donner un feu vert médical). La règle utile n'est pas « pas de regex », c'est **« un vérificateur textuel doit être éprouvé dans les deux sens »** — ton §11. |
| **26** | *(ce que tu ne veux pas)* | Aucun de ces objets n'est proposé ici. |

### 📐 MESURÉ SPÉCIALEMENT POUR TOI — ton §17

Tu demandes si Milo place systématiquement le travail de prévention **en fin de séance**.

**Compté à la main sur les 19 réponses du 01/09 qui produisent une séance complète : 17 finissent
par un exercice de prévention ou de gainage** — le plus souvent **Tirage Visage (Face Pull)** (9)
ou **Gainage** (8).

Les deux exceptions sont EV-017 (mollets) et EV-034 (leg curl). ⭐ **Et EV-034 est précisément
l'une des deux séances qui RESPECTENT leur budget.**

👉 **Ton intuition est juste, et le défaut de durée est donc pire que ce qu'il paraît** : le
dépassement se paie sur la fin, et la fin est exactement ce que Milo a ajouté pour la santé de
l'épaule. *La personne ne coupe pas « un accessoire » — elle coupe la partie personnalisée.*

⚠️ **Méthode, dite honnêtement** : ce comptage est **manuel**, pas machine. Le corpus n'est pas
dans le dépôt. Il faudrait le rejouer par code pour l'épingler.

---

## LES RÉPONSES À TES 7 QUESTIONS

### 1. Les vrais trous restants

1. **Aucun contrôle déterministe de durée** avant l'activation d'une séance (`_validationSeance`
   couvre doublons, exclusions durables, blessures, charnières de hanche — **pas la durée**).
2. **Le banc n'a pas de mémoire** : 3 scénarios sur 55 donnent un historique, 0 un programme,
   0 un cycle, 0 un état du jour — alors que 20 demandent de construire une séance.
3. **Le A/B n'a jamais été lancé.**
4. **Les vérificateurs ne sont pas tous éprouvés dans les deux sens** (4 sur 5 se sont révélés
   faux hier).
5. **Le modèle matériel** — différé, chiffré.

### 2. Les faux problèmes — déjà couverts

L'arrondi des charges (§22) · le catalogue comme source de vérité (§23) · la chaîne réponse →
séance (§24) · les cas Michel réels (§25) · une partie des contradictions (§21) · et surtout
**l'origine du 3,2** (§9), qui est mieux traitée que ce que tu proposais.

### 3. Les modifications minimales recommandées

**Une seule touche à l'application** : ajouter une **5ᵉ famille** à `_validationSeance` — la durée.

- **Où** : le point unique que les deux portes traversent (`_appliqueMiloSession`), là où vivent
  déjà les 4 autres familles. Pas un nouveau système.
- **Avec quoi** : `_rythmeSeance()` pour le coût réel d'une série, `S.exRestPref` pour le repos
  par exercice, et le compte des paliers automatiques — **tout existe**.
- **Quel seuil** : pas un chiffre inventé. **Strict si le rythme est `mesure:true`, tolérant s'il
  est estimé.** Et on **signale sans bloquer**, comme les 4 autres familles le font déjà
  (le projet a tranché : on informe, on n'interdit pas).
- **Taille** : ~30 lignes. **0 appel API.**

⛔ Ce que je **ne** recommande pas : recompter la durée dans le prompt (déjà fait, et ça ne suffit
pas), ni créer un moteur de planification.

### 4. Les tests que j'ajouterais

- **1 témoin déterministe** : une séance de 20 séries pour une enveloppe de 60 min doit être
  signalée ; une de 14 ne doit pas l'être. Contre-épreuve incluse.
- **1 témoin de non-régression** : les 4 familles existantes de `_validationSeance` continuent de
  rendre exactement la même chose.
- **La généralisation positif/négatif** sur les 55 vérificateurs — gratuit, et c'est ce qui a
  manqué le plus cher jusqu'ici.
- ⛔ **Rien d'autre.** Pas de nouvelle catégorie, pas de Tier 1.5.

### 5. Les appels API réellement nécessaires

| Quoi | Appels |
|---|---|
| A/B mémoire vs sans mémoire, sur **2 cas** (historique de perf · douleur active) | **4** |
| Répétition pour distinguer le hasard du signal | **+4** |
| Mutations d'une seule donnée (douleur · sommeil · dernière perf) | **+6** |
| **Total** | **14 appels** |

⛔ **Pas de passe complète des 55.** Elle a déjà tourné le 01/09 et ses réponses sont exploitables
gratuitement — c'est ce qui a produit tout ce document.

### 6. Le coût approximatif

Le devis du banc est **mesuré**, pas estimé : `node tests/milo/eval.js` construit les contextes
réels et calcule 4 057 k caractères ≈ 1 126 852 tokens d'entrée pour 55 scénarios, soit
**0,84 € à 3,64 €** sur Sonnet selon l'état du cache.

**Au prorata : 14 appels ≈ 0,21 € à 0,93 €.** Appelons-le **moins d'un euro**.

### 7. Les risques de régression

| Risque | Ce qui le contient |
|---|---|
| **Un avertissement de durée qui crie au loup** — le pire, parce qu'un garde-fou qui se trompe souvent finit par ne plus être lu | Le seuil **suit la qualité de la mesure** (`mesure:true/false`), et on **signale sans bloquer** |
| **Casser les 4 familles existantes** de `_validationSeance` | Témoin de non-régression sur les 4, obligatoire |
| **Un vert qui ne peut pas rougir** — le défaut d'hier | Contre-épreuve obligatoire sur chaque nouveau témoin |
| **Changer ce que Milo reçoit sans le mesurer** | Le correctif proposé est **côté app, après la réponse** — il ne touche pas au contexte, donc il ne change rien à ce que Milo produit |

---

## L'ORDRE QUE JE PROPOSE — un écart avec le tien

Tu proposes **P0 = durée**, **P1 = A/B**. **Je les inverse, pour une raison de coût :**

1. **L'A/B d'abord (4 appels, ~0,25 €).** Il répond à la question produit, et il est **plus fragile
   dans le temps** : chaque persona enrichi et chaque correctif change ce qu'on mesurerait. *Le
   mesurer maintenant, c'est le mesurer sur l'état qu'on connaît.*
2. **Puis la durée** — le défaut est réel, mesuré, et il ne s'en ira pas. Il ne dépend d'aucun
   appel.
3. Puis les mutations, puis les personas.

⚠️ **Et une réserve que je maintiens** : si l'A/B montre que les deux réponses se ressemblent, il
ne faudra pas conclure trop vite. **Ces 52 réponses viennent toutes de personas dont 50 n'ont
aucun historique.** On mesurerait alors surtout la pauvreté des fixtures — c'est pour ça que le
§13 vient après, et pas à la place.

---

*Aucune ligne de code n'a été écrite pour ce document. Toutes les mesures sont rejouables sur
`ft-v1113`, sauf le comptage du §17, qui est manuel et signalé comme tel.*
