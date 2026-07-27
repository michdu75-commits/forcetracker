# 🌱 Le PROFIL VIVANT — Milo apprend, vérifie, corrige et évolue

> **Document de conception (vivant).** Prolonge la **Constitution — Principe 25** (« le profil n'est
> jamais figé ») et le **Cerveau 1 « comprendre »** (`docs/MOTEUR-RAISONNEMENT-MILO.md`). Croisement
> Michel + ChatGPT + Claude (26/07/2026).

> ### 🧭 L'idée en une phrase
> *« Toutes les IA répondent à des questions. Milo, lui, **apprend, vérifie, corrige et évolue** avec son
> utilisateur. Ce n'est plus une simple mémoire : c'est une **connaissance vivante du sportif**. »*
>
> **Phrase-signature (Vision / marketing) :** **« Plus tu utilises Force Tracker, plus Milo te connaît
> vraiment. »**

---

## 🏛️ Le profil vivant est la SOURCE DE VÉRITÉ de l'application (principe d'architecture — GPT, 27/07)

> **Tous les moteurs — Milo, nutrition, récupération, programmes, analyses — s'appuient sur le profil
> vivant.** Il n'existe **qu'UN seul profil**, cohérent, partagé par toute l'application.

Pourquoi c'est capital : ça empêche que chaque module se mette, un jour, à **stocker ses propres infos
dans son coin** — des silos qui divergent et finissent par se contredire (la nutrition qui « croit » une
fréquence, Milo qui en « croit » une autre…). Toute l'app doit **raisonner à partir d'un profil unique**.

*Traduction concrète (garde-fou d'archi, Claude) :* aujourd'hui ce profil vit dans quelques clés de l'état
partagé `S` — `S.coachQuiz.answers` (lieu/fréquence/durée/autre sport…), `S.registre` (observations
validées, mémoire), `S.healthProfile` (zones fragiles/santé), `S.goal`/`targetWeight`, + les **faits
mesurés** (séances, poids, sommeil). La règle : un module **LIT** ce profil commun et y **écrit via les
mécanismes prévus** (les 4 modes ci-dessous, la mémoire validée…). Il ne crée **JAMAIS** une copie
parallèle de « où s'entraîne l'utilisateur » ou « son objectif ». **Une info = un seul endroit.** C'est
aussi ce qui rend la sync cloud et la restauration fiables (un seul profil à sauvegarder).

> **Complément (GPT 27/07) — une seule donnée, une seule décision.** La source de vérité concerne la
> **DONNÉE** ; son jumeau concerne la **DÉCISION** : les modules ne lisent pas le profil brut pour re-décider
> chacun dans leur coin, ils passent par le **cerveau** (Cerveau 2 / Gardien) → *« une seule mémoire, une
> seule voix »*. Cette couche de décision se construit **émergentiellement** (pas d'un bloc). Détail :
> `docs/MOTEUR-RAISONNEMENT-MILO.md` § « couche de décision partagée ».

---

## 🎯 RÈGLE D'ARCHITECTURE — toute connaissance doit produire un COMPORTEMENT OBSERVABLE (GPT + Michel, 27/07/2026)

> **« Toute connaissance stockée dans le profil vivant doit produire au moins un comportement observable
> dans l'application. Une connaissance qui ne change rien au comportement de l'app est une connaissance
> inutile. »**

**D'où ça vient (une vraie découverte de terrain, pas une théorie).** Le 27/07, Michel teste en pleine
séance et remonte **4 bugs qui n'en font qu'un** : Milo raisonnait parfaitement dans le chat (charges
`4×6 — 60/70/80/85`, repos « 3 min », ordre des exercices, consignes « omoplates serrées ») **mais une
partie de cette intelligence ne descendait pas jusqu'aux données réellement utilisées par l'app** (cf.
`ft-v625→628`). *L'information existait. Le raisonnement existait. L'app ne s'en servait pas.* → Le maillon
faible n'est ni la **collecte** ni le **raisonnement**, c'est la **RESTITUTION**.

**Les 3 questions à se poser AVANT d'ajouter une information au profil** (grille GPT) :
1. **Qui la PRODUIT ?** (l'utilisateur · Milo · un futur coach · les séances · les check-ins · les analyses
   biologiques · une habitude détectée)
2. **Qui l'EXPLOITE ?** (Milo · le générateur de programmes · la nutrition · la récupération · le mode
   Coach · les analyses/statistiques)
3. **Quel comportement CONCRET change dans l'app ?** (une reco différente · un exercice remplacé · un
   programme adapté · la nutrition ajustée · une synthèse enrichie · la récup modifiée)

**Si on ne sait répondre à aucune des trois → on n'ajoute pas la donnée (ou pas encore).** Le profil vivant
n'est pas une base de **stockage**, c'est une base de **connaissances ACTIVE**.

> ### ⚠️ Nuance d'architecte (Claude) — le comportement peut être DIFFÉRÉ, mais il doit être NOMMABLE
> Appliquée trop littéralement (« la donnée doit changer quelque chose **tout de suite** »), cette règle se
> retournerait contre l'ADN du produit : la **mémoire longue**. Contre-exemples internes bien réels —
> une **pesée isolée** ne change rien (c'est la *tendance* sur des semaines qui parle) ; le **journal du
> check-in quotidien** (`dayStateLog`) a été construit en sachant que sa valeur n'apparaîtrait qu'après des
> mois (« retrouver dans quel état tu étais le jour d'un record ») ; la **date de dernière confirmation**
> ne fait rien en soi, elle pilote *plus tard* le mode Confirmer ; et les **briques 7-8** (mémoire vivante,
> synthèse) reposent **entièrement** sur des données accumulées à valeur différée.
>
> **Formulation retenue** : on doit pouvoir **NOMMER le comportement qu'elle changera — et QUAND**. Une
> échéance lointaine (« brique 7, dans plusieurs mois ») est légitime ; un « on verra bien à quoi ça
> servira » ne l'est pas. C'est la version compatible avec *« il se souvient de qui tu es devenu »*.
>
> **Bonus — la règle marche aussi À L'ENVERS (audit).** C'est en se demandant « où cette info ressort-elle
> concrètement ? » qu'on a trouvé les 4 bugs. À faire un jour sur l'existant : passer en revue chaque donnée
> déjà stockée et repérer les **données mortes** (stockées, jamais exploitées) — soit on les branche, soit
> on les retire.

**Application aux « pratiques d'entraînement »** (cardio, mobilité, pilates, préhab — cf.
`IDEES-FUTURES.md`) : elles ne s'ajoutent pas « pour faire joli ». Elles passent la grille — le **cardio**
influence récupération + dépense énergétique + conseils + nutrition + analyses ; la **mobilité** influence
les exercices proposés et les échauffements ; la **prévention** (genou/épaules/lombaires) influence les
programmes, les alertes de surcharge et les adaptations. ✅

---

## Les 4 modes du profil vivant

Le profil ne se remplit pas une fois pour toutes : il se **complète, s'enrichit, se met à jour et se
confirme** au fil des échanges. Chaque petite question de Milo relève d'un de ces 4 modes.

| Mode | Déclencheur | Effet sur le profil | Exemple |
|---|---|---|---|
| **Compléter** | Un champ est **VIDE** (zappé à l'inscription, ancien compte) | On **écrit** le champ | « Tu t'entraînes plutôt où ? » |
| **Enrichir** | La base est là, on va **plus loin** | On **ajoute** une info nouvelle | « Tu fais un autre sport à côté ? » |
| **Mettre à jour** | Une info est **ancienne**, ou l'app détecte un **écart** déclaré/réalisé | On **change** la valeur (avec accord) | « Je pars sur du volume plutôt que de la force pure ? » |
| **Confirmer** ✅ (`ft-v617`) | Une info **encore fiable** mais à re-valider (> 90 j) | On **ne change RIEN** : on repousse juste la *date de dernière confirmation* et on remonte la fiabilité | « Tu t'entraînes toujours en salle basique ? » → « Oui, toujours » |

> **Le mode Confirmer (ajout de Michel) est distinct de Mettre à jour** : « Oui » ne modifie pas la donnée,
> il la **rafraîchit**. Ça évite de re-poser sans cesse les mêmes questions.

---

## Déclaré vs Réalisé — la réalité prime (avec l'accord de la personne)

Deux vérités coexistent :
- **Déclaré** = ce que la personne a dit (« je fais 3 séances/sem »).
- **Réalisé** = ce que l'app **mesure** dans les séances enregistrées (5/sem).

Un vrai coach ne se base pas que sur la fiche : il regarde ce qu'il **voit**. Le déclaré est un **point de
départ** ; la réalité mesurée doit primer. C'est l'esprit **« il se souvient de qui tu es DEVENU »**.

- ⚠️ **Seulement sur une tendance STABLE**, jamais un pic isolé (« la cohérence avant la réactivité »,
  Constitution P20) : 1 semaine à 5 séances = peut-être exceptionnel → on ne dit rien ; 4-5 semaines
  régulières → signal.
- ⚠️ **Observé ≠ intention.** Le **niveau d'activité** s'observe (nombre réel de séances). L'**objectif**
  reste une **intention** : le *style* observé (volume/hypertrophie) est un **indice fort**, pas une preuve.
  Milo **ne bascule JAMAIS l'objectif tout seul** — il constate et demande :
  > *« J'observe que ton entraînement ressemble davantage à une prépa force qu'à une prise de masse.
  > Souhaites-tu mettre ton objectif à jour ? »*

---

## Le principe cardinal : « Milo ne pilote JAMAIS à ta place »

**Milo ne change jamais rien automatiquement** — ni l'objectif, ni la nutrition, ni les exercices. Son
cycle est toujours :

> **Observer → Expliquer la conséquence → Proposer → Laisser l'utilisateur décider.**

La **valeur** n'est pas la mise à jour elle-même, c'est la **prise de conscience**. Et **tout se répercute**
(surtout sur la nutrition — cf. `docs/NUTRITION-PHILOSOPHIE.md` : passer de 3 à 5 séances augmente la
dépense → les calories doivent suivre). Milo est un **miroir qui explique**, pas un pilote automatique.

---

## La fiabilité par champ (le moteur qui décide QUOI re-demander)

Chaque information porte un **niveau de fiabilité** (idée « étoiles » de Michel) et une **date de dernière
confirmation**. Milo ne re-pose pas au hasard : il vise la donnée **la moins fiable** ou **contredite par le
réalisé**.

La fiabilité **décroît différemment selon la nature du champ** :
- **Stable** (âge, sexe, taille) → ne décroît quasi jamais → on ne re-demande presque pas. *(ex. ★★★★★)*
- **Qui dérive** (fréquence, matériel, objectif) → décroît avec le **temps** ET peut être **contredite par
  l'observé**. *(ex. ★★★☆☆)*

Formule mentale : **fiabilité = nature du champ × temps depuis confirmation × écart observé.**

> ⚠️ **Blessures = domaine SENSIBLE** (permissions bornées, Constitution v2.4). Leur fiabilité peut baisser
> (une blessure guérit), mais re-demander doit être **encore plus délicat** — jamais insistant, jamais un
> interrogatoire médical. On reste sur son terrain (entraînement), on oriente vers un pro si besoin.

---

## Le TON : curiosité humble, JAMAIS surveillance (le point de vigilance n°1)

Le plus grand risque de tout ce système, c'est de donner une **impression de flicage**. Deux règles strictes :

1. **Ne JAMAIS empiler** les tournures « je vois que… / j'ai remarqué… / tu fais… ». Deux d'affilée = flicage.
2. **Registre = la curiosité HUMBLE**, pas la surveillance. Milo **doute de lui**, il ne te surprend pas en
   faute. Un **stock d'ouvertures variées** est tiré au sort, jamais deux fois la même formule :
   - « Petite vérification 😊 »
   - « C'est toujours d'actualité ? »
   - « J'ai peut-être faux, mais… »
   - « Ça a changé depuis la dernière fois ? »

C'est l'application directe du principe d'**humilité** (« Milo ne cherche pas à comprendre mieux que toi »,
Constitution P22). Discrétion absolue : mieux vaut une question de moins qu'une de trop.

---

## Rendre l'évolution PERCEPTIBLE — mais MÉRITÉE

La personne doit **sentir** que son coach évolue avec elle (c'est très valorisant, ça crée l'attachement) :
> « Ton profil est devenu beaucoup plus précis. » · « 🧠 Milo te connaît de mieux en mieux. »

⚠️ **Mais gagné, jamais creux.** On **ancre sur du réel**, pas une flatterie vague :
- « Ton profil est **complet à 80 %** » · « Milo a appris **12 choses** sur toi »…
- Réutiliser la page **« Ce que Milo sait de toi »** comme une **jauge qui se remplit**.

La sensation « mon coach me connaît » vient du **concret visible**, pas d'un « il te connaît très bien »
balancé dans le vide.

> ✅ **Étape 1 livrée (`ft-v618`) — la PHRASE-BÉNÉFICE.** Nuance décisive de Michel : **pas un %/score**
> (l'utilisateur ne cherche pas un taux de complétude, il veut savoir si Milo peut lui donner de
> **meilleurs conseils**) → une **phrase orientée bénéfice** en haut de « Ce que Milo sait de toi »
> (« Milo apprend à te connaître » → … → « connaît très bien ton profil — conseils sur-mesure »). Elle
> **ne fait que MONTER** (high-water mark `S.registre.knowPeak`) → **jamais punitive**. La
> **fiabilité/fraîcheur par champ reste INTERNE** (elle décroît et pilote QUELLES questions Milo pose,
> mode Confirmer) — **jamais affichée** (anti-« score » anxiogène, anti-flicage). ⏭️ Étape 2 = « Milo a
> appris quelque chose » (la liste vivante des infos récemment apprises).

---

## Déclenchement : DEUX mécanismes complémentaires (Michel, 26/07)

La fréquence hebdomadaire n'est **pas une règle absolue**, c'est un **filet de sécurité**. Deux mécanismes
se complètent :

### 1. Questions PROACTIVES (le filet)
**Au plus UNE question proactive par semaine**, tant qu'il reste une info utile à **compléter / enrichir /
confirmer**. But : faire **vivre** le profil **sans jamais donner l'impression d'un questionnaire**. C'est le
fond de tableau, discret.

### 2. Questions CONTEXTUELLES (prioritaires — liées à un événement)
Certaines situations méritent une question **tout de suite**, **même si** une question a été posée récemment,
parce qu'elle est **directement liée à ce que la personne vient de faire** (elle paraît alors naturelle,
jamais « parce que c'est lundi ») :
- un **écart durable** entre le déclaré et le réalisé ;
- un **nouveau sport** détecté ;
- une **forte hausse** du nombre de séances ;
- une **variation de poids** importante ;
- un **changement de comportement** évident.

**Règle simple** : *max 1 proactive/semaine · mais une contextuelle passe **outre** ce plafond quand un
événement important le justifie.*

> ⚠️ **Garde-fous communs (valent pour les DEUX)** : **une seule question à la fois** (deux événements proches
> ne déclenchent qu'une question) · **« Pas maintenant »** toujours possible · **uniquement du durable** ·
> **s'arrêter** si la personne ignore plusieurs fois. L'objectif : *« la bonne question au bon moment, comme
> un vrai coach »* — **jamais** « parce que c'est lundi ».

*Note d'implémentation : le mécanisme **contextuel** = essentiellement la tranche **« déclaré vs réalisé »**
(détecter un écart stable, un pic de séances, une dérive de poids). La **tranche 1** livrée (mode Compléter,
`ft-v612`) est **PROACTIVE** (max 1/semaine). **1ᵉʳ détecteur contextuel livré (`ft-v614`) : la FRÉQUENCE**
— l'app mesure les séances/semaine sur 4 semaines, exige un écart **stable** (≥3 semaines du même sens,
jamais un pic), et propose la mise à jour (`_pendingFreqContext`/`applyFreqContext`/`dismissFreqContext`,
anti-nag par niveau observé). **2ᵉ détecteur livré (`ft-v622`) : le STYLE** (force vs hypertrophie) —
signature d'entraînement (reps des séries faites) comparée à l'objectif ; **intention → on QUESTIONNE,
jamais on ne tranche** (`S.goal` ne change qu'au tap de l'utilisateur ; anti-nag `ctxStyle`). ⏭️ Détecteurs
suivants : **dérive de poids** *(reporté : action ambiguë, lié à la nutrition pas encore construite)*.*

---

## Le backbone technique (à construire)

- Chaque info du profil : `valeur` + `fiabilité` + `dateDeDerniereConfirmation` + `source` (déclaré /
  observé / confirmé). **Bonne nouvelle** : les petites questions actuelles (Registre, `maybeProposeObservation`)
  portent **déjà** une confiance + une date → on **étend** un mécanisme existant, on ne repart pas de zéro.
- Détecter l'**écart déclaré/réalisé** (fréquence mesurée vs déclarée, signature d'entraînement force vs
  hypertrophie…) sur une **fenêtre stable**.

**Ordre de construction** : ① mode **Compléter** ✅ (`ft-v612`) → ② **Confirmer** ✅ (`ft-v617` — réutilise
la *date de dernière confirmation* + le backbone `S.coachQuiz.confirmedAt` ; « Oui » rafraîchit la date sans
rien changer, « Non » bascule vers Compléter/Enrichir via `gapForce` ; > 90 j, proactif ≤1/sem, `freq` exclu
car couvert par ③, lazy-init pour ne pas harceler les comptes existants au déploiement) → ③ détection
**déclaré/réalisé** ✅ *(fréquence, `ft-v614` ; suivants : poids/style)* → ④ **Enrichir** ✅ *(1ʳᵉ question
« autre sport », `ft-v615` ; stock à élargir)*. **Les 4 modes sont désormais livrés.** **Fiabilité par champ — ÉTAPE 1 livrée** (`ft-v618`/`ft-v619`) :
la **phrase-bénéfice** visible en haut de « Ce que Milo sait de toi » (orientée bénéfice, jamais un
score, **ne redescend jamais** via le high-water mark `S.registre.knowPeak`) + ses **aides** (`?` Accueil
🟢 + aide détaillée). Le **moteur de fiabilité/fraîcheur par champ** (celui qui décroît et pilote QUELLES
questions poser) reste **interne** — backbone en place (`S.coachQuiz.confirmedAt`), à exploiter plus
finement ensuite. **Brique 2 « Milo a appris récemment » ✅ livrée** (`ft-v620`) : la liste vivante des
dernières infos apprises (obs validées + infos de base via `S.registre.learnedAt`, dates honnêtes), en
haut de « Ce que Milo sait de toi » — **c'est avec elle** qu'a été fait le pop-up « Quoi de neuf » (v44,
l'annonce forte des Briques 1+2). **Détecteurs contextuels : fréquence ✅ (ft-v614) + style ✅ (ft-v622,
= intention → questionner, jamais trancher).** **Reste à faire** : le détecteur **dérive de poids** *(reporté
— action ambiguë, lié à la nutrition à venir)* + exploiter la **fiabilité interne**
pour prioriser plus finement les questions + d'autres questions d'enrichissement.

---

## Pourquoi c'est différenciant

On ne construit plus un chatbot, mais **un vrai coach qui apprend progressivement à connaître son athlète**.
Aucune appli de muscu ne réconcilie ce que tu **dis** avec ce que tu **fais**. À condition de rester
**discret** et de **ne jamais donner l'impression de surveiller**, c'est **l'un des plus gros points forts**
de Force Tracker.

*Résumé de la philosophie : **observer → expliquer → proposer → laisser l'utilisateur décider.***
