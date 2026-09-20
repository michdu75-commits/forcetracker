# 🧭 L'indépendance du moteur — Milo n'est pas le modèle qui le fait tourner

> **Consigné le 19/09/2026**, sur une note d'architecture de Michel. ⛔⛔ **RIEN ICI N'EST
> CONSTRUIT** : ce fichier est une **direction**, pas un chantier. Aucune ligne de code n'a été
> écrite en le posant, et il ne doit pas en déclencher sans feu vert explicite (**règle d'or 15**).
>
> ⚠️ **Il se lit en trois colonnes, et elles ne se confondent jamais** :
> **EXISTANT** (mesuré dans le code d'aujourd'hui) · **DÉCIDÉ** (une contrainte du projet) ·
> **DIRECTION** (le cap, sans date, sans engagement de forme).

---

## 1. La phrase qui tient tout

> **« Claude n'est pas Milo. Claude est actuellement l'un des moteurs que Milo utilise. »**
> — Michel, 19/09/2026

**DÉCIDÉ.** Milo ne doit jamais être **défini** par le fournisseur d'IA qui fait tourner son
raisonnement. L'objectif de long terme que Michel nomme est un **assistant personnel** de type
« Jarvis » ; il ne s'agit **pas** de fabriquer un modèle fondamental.

**La définition de Milo, à terme :**

```
   Milo = identité + mémoire + règles + capacités + contexte + droits + outils
```

Le LLM est un **composant interchangeable** dans cette liste. Il n'en est pas le sujet.

| | aujourd'hui | direction |
|---|---|---|
| ce qui fait tourner le raisonnement | Claude / Anthropic | modèle local · Claude · autre fournisseur · **plusieurs moteurs spécialisés** |
| ce qui ne doit jamais changer en même temps | — | mémoire · personnalité · connaissances de la personne · règles · capacités · continuité · permissions |

⚠️ **Et la borne qui évite la bêtise** : *il est interdit de dégrader Milo pour obtenir
artificiellement l'indépendance.* Une bascule vers du local se fait **progressive, mesurée,
comparée sur de vrais bancs Milo, et réversible** — sinon elle n'est pas un progrès, c'est un
troc silencieux entre qualité et principe.

---

## 2. ⏳ LA CHRONOLOGIE — ce n'est pas une idée neuve, et le dépôt le prouve

**C'est le point le plus utile de ce fichier**, parce qu'une vision qu'on croit neuve se
re-débat ; une vision dont on retrouve la trace se **continue**.

| date | ce qui est posé | où c'est écrit |
|---|---|---|
| **19/07/2026** | la **Vision** : Force Tracker est une *mémoire sportive*, pas une IA — *« local d'abord »* | `docs/VISION-FORCE-TRACKER.md` |
| **20/07/2026** | l'**architecture hybride à 4 niveaux**, et déjà ⭐ *« cœur métier **indépendant du modèle d'IA** — durable même si les modèles changent »* · le niveau ③ **Orchestration** est nommé et déclaré **implicite** | `docs/JOURNAL-ARCHIVE.md` |
| **20/07/2026** | le **corps** : cerveau · système nerveux · digestion · reins/estomac — l'organisme comme outil de conception | `docs/CORPS-FORCE-TRACKER.md` |
| **22/07/2026** | le **pipeline de raisonnement** Compréhension → Diagnostic → décision → Explication | `docs/MOTEUR-RAISONNEMENT-MILO.md` |
| **26/07/2026** | **R9** — *le niveau de MODÈLE est une variable structurelle* | `docs/REGLES-ARCHITECTURE.md` |
| **19/08/2026** | le **cervelet** est nommé, et le niveau ③ devient explicite | `docs/ARCHITECTURE-CERVEAU-CERVELET.md` |
| **19/09/2026** | l'**indépendance du moteur** devient un cap déclaré, et l'**estomac** reçoit un régime beaucoup plus large | ce fichier |

⭐⭐ **La ligne du 20/07 est la plus importante du tableau** : *« cœur métier indépendant du modèle
d'IA »* était déjà écrit **deux mois avant** cette note. 👉 ***Ce que Michel formule aujourd'hui
n'est pas un virage, c'est l'extension du même principe : il passait sur le CŒUR MÉTIER, il passe
maintenant sur MILO LUI-MÊME.***

⚠️ **Et une nuance de date, dite plutôt que lissée** : l'**idée** de la couche d'orchestration date
bien de **juillet** ; le **nom** « cerveau / cervelet » est de Michel le **19/08**. Les deux sont
vrais, ils ne se remplacent pas.

**Pourquoi ça devient pressant en septembre 2026**, et c'est mesuré ailleurs dans le dépôt, pas
supposé : la **mémoire longue** arrive · le **contexte** a atteint son plafond (46 485 caractères
pour 46 500, `ARCHITECTURE-CERVEAU-CERVELET.md` §3) · le **coût en jetons** devient un sujet · et
les **21 capacités IA** viennent d'être inventoriées (`capacites-ia.js`). *Les quatre poussent dans
la même direction : décider AVANT d'appeler un modèle.*

---

## 3. 🫀 LES TROIS ORGANES — et le vocabulaire est RÉCONCILIÉ, pas dupliqué

Michel nomme trois organes. **Deux existaient déjà sous un autre nom** dans
`docs/CORPS-FORCE-TRACKER.md` : on ne crée pas un second vocabulaire pour le même organe (**R2**).

| organe (note du 19/09) | rôle | organe déjà écrit (20/07) |
|---|---|---|
| 🧠 **cerveau = Milo** | conversation · compréhension · raisonnement · coaching · synthèse · personnalisation · propositions | 🧠 **Cerveau** — identique |
| 🧠 **cervelet = Force Tracker / orchestration** | reconnaître le besoin · choisir capacités, droits, contexte, outils, moteur · limiter les appels · appliquer les règles déterministes · **décider ce qui atteint le cerveau** | ⚡ **Système nerveux** — *même organe, deux noms* |
| 🫃 **estomac** | récupérer → nettoyer → filtrer → dédupliquer → structurer → réduire | 🍽️ **Digestion** — *même organe, **régime élargi*** |

⭐ **L'élargissement est le vrai changement, et il vaut d'être dit** : la digestion de 20/07 ne
mangeait que des **programmes d'entraînement** (EXLIB + moteur VM). L'estomac de 19/09 mange
**l'historique sportif, la nutrition, la santé, des documents, des statistiques, et Internet**.

**Le principe, dans les deux sens :**

> ⛔ **Le cerveau ne doit pas manipuler les données brutes.**
> ⛔ **Le cerveau ne doit pas « manger Internet brut ».**
> ⭐ **Un maximum de logique déterministe quand elle suffit ; une IA uniquement quand une IA
> apporte réellement quelque chose.**

**L'exemple que Michel donne, et qui vaut définition :**

```
   « Combien ai-je fait au couché ces six dernières semaines ? »
        ↓
   le cervelet reconnaît : entraînement / statistiques
        ↓  l'estomac récupère l'historique utile, calcule, réduit
        ↓
   Milo reçoit LE RÉSULTAT, jamais tout Force Tracker
```

---

## 4. 🌐 INTERNET — un outil de l'architecture, pas une capacité du fournisseur

**DIRECTION.** Le jour où Milo accède à Internet, cet accès doit **appartenir à Force Tracker** et
non être une fonction louée à Anthropic, OpenAI ou un autre.

```
   Milo demande une information
        ↓  Force Tracker décide si Internet est nécessaire
        ↓  recherche / index / navigateur
        ↓  récupération des sources
        ↓  extraction · nettoyage · classement          ← l'estomac
        ↓  contexte utile
   Milo
```

⛔ **Il n'est PAS question de copier Internet.** À très long terme, Force Tracker *pourrait*
maintenir son propre index de sources utiles — au conditionnel, sans engagement.

**EXISTANT, mesuré** : **aucun Milo utilisateur n'a accès à Internet aujourd'hui.**

---

## 5. 🛠️ AUTONOMIE — des outils, et une autorité qui n'est jamais le modèle

**DIRECTION.** Milo pourra disposer d'outils pour agir. Les noms ci-dessous sont **conceptuels**,
ils ne décrivent aucune fonction existante :

```
   training.getSessions()   stats.calculate()   nutrition.getDay()
   web.search()   web.open()   web.extract()   calendar.read()
```

**DÉCIDÉ, et c'est la borne non négociable :**

> ⛔⛔ **Le modèle ne décide jamais seul de ses permissions. Le serveur / cervelet reste
> l'autorité.**

Cinq niveaux à distinguer **au minimum** : **observer · analyser · proposer · demander
confirmation · exécuter**.

⭐ *C'est **R10** (les permissions sont hiérarchisées ET bornées à un domaine) appliqué à des
outils au lieu d'hypothèses — la règle existe déjà, elle change seulement d'objet.*

---

## 6. 👤 MON MILO / LES MILO UTILISATEURS — un seul Milo, des droits différents

**DÉCIDÉ.** Le cœur reste **commun**. Ce ne sont pas deux assistants :

```
   même Milo  +  permissions différentes
```

**EXISTANT, les différences réelles d'aujourd'hui** : le Milo de Michel peut parler de sa propre
architecture · il a plus de liberté sur certains sujets sexuels · les Milo utilisateurs ont des
restrictions propres · **aucun Milo utilisateur n'a accès à Internet**.

**DIRECTION** : ces différences devraient dépendre de **capacités et de droits côté serveur**, pas
uniquement d'un prompt. ⭐ *C'est exactement ce que `capacites-ia.js` a commencé à rendre possible
— et c'est aussi pourquoi les **21 capacités portent toutes `serveurApplique: false` aujourd'hui**
(mesuré) : la place du verrou est prévue, le verrou n'existe pas.*

---

## 7. 📏 CE QUE ÇA COÛTE AUJOURD'HUI — la seule mesure de ce fichier

Pour que la direction ne reste pas une intention, voici **où en est le couplage réel**, compté le
19/09/2026 :

| fait mesuré | valeur |
|---|---|
| le **modèle** est déjà une variable choisie à l'exécution | ✅ `worker.js` : défaut, modèle de Michel, surcharge de banc |
| l'adresse du fournisseur dans **`worker.js`** | ✅ **1 seule** — tenue par la constante `ANTHROPIC_URL` (**R2 respecté**) |
| l'adresse du fournisseur dans **`Code.js`** | ⛔ **13 fois, écrite en dur** (**R2 violé**) |
| le **format** des messages et le **nom** des fonctions (`callClaude`) | ⛔ portent le fournisseur |

👉 ***Le premier pas vers l'indépendance n'est donc pas une interface abstraite : c'est R2 appliqué
à l'adresse du fournisseur.*** Une même information écrite treize fois **divergera** — la seule
question est quand. ⛔ **Et ce n'est PAS un chantier ouvert ici** : c'est le chiffre à connaître le
jour où Michel décidera d'en ouvrir un.

---

## 8. ⚖️ LA QUESTION À POSER À CHAQUE ARCHITECTURE IMPORTANTE

C'est la conséquence opérationnelle de tout ce qui précède, et elle est devenue **R37** dans
`docs/REGLES-ARCHITECTURE.md` :

> **Est-ce que ce choix rend Milo plus indépendant et modulaire — ou est-ce qu'il l'enferme
> davantage dans un fournisseur, un modèle ou un prompt particulier ?**

⛔ **Éviter toute dépendance difficilement réversible.**

---

## 9. ⏭️ CE QUE CE FICHIER NE FAIT PAS

⛔ Aucun code · ⛔ aucun moteur abstrait · ⛔ aucun accès Internet · ⛔ aucun outil d'action ·
⛔ aucun verrou serveur · ⛔ aucune modification du comportement de Milo · ⛔ aucun chantier ouvert.

⚠️ **Et rien ici n'est implémenté.** Les seules choses *mesurées* sont celles du §7 et les dates du
§2 ; tout le reste est un **cap**.

---

*Lié à : `docs/CORPS-FORCE-TRACKER.md` (les organes) · `docs/ARCHITECTURE-CERVEAU-CERVELET.md` (le
cervelet, sa frontière chiffrée, ses modes de panne) · `docs/MOTEUR-RAISONNEMENT-MILO.md` (le
pipeline) · `docs/VISION-FORCE-TRACKER.md` (le pourquoi) · `capacites-ia.js` + `docs/IA-FREE-PREMIUM.md`
(les 21 capacités) · `docs/REGLES-ARCHITECTURE.md` (**R2** un propriétaire, **R9** le modèle est une
variable structurelle, **R10** permissions bornées, **R6** une seule voix, **R37** la question
ci-dessus).*
