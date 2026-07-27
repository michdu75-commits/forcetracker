# 🏗️ Processus officiel de développement — Force Tracker

> Méthode de travail **officielle** de Force Tracker. Chaque évolution suit
> exactement ce processus. **L'objectif n'est pas de développer plus vite —
> c'est de développer mieux.**
>
> Cohérent avec la **Constitution de Milo** (`CONSTITUTION-MILO.md`, Principe 8
> « une brique à la fois ») et la **règle d'or #12** de `CLAUDE.md` (journal en
> temps réel).

---

## 🎯 Philosophie

Chaque brique doit être : **comprise · challengée · simplifiée · validée ·
développée · testée · documentée · puis clôturée.**

**Aucune étape ne doit être sautée.**

> Je préfère développer une fonctionnalité de moins mais conserver un projet
> parfaitement organisé. — Michel

---

## 🪶 Gouvernance légère — « la gouvernance sert le produit, jamais l'inverse » (Michel, 24/07/2026)

La phase **« cohérence »** (rendre Milo **fiable** avant de le rendre plus intelligent — de la
logique de *développement* à la logique de *gouvernance*) a un **piège** : une gouvernance si bien
pensée qu'elle **ralentit** le produit. Garde-fous :

- **La gouvernance est soumise à SA PROPRE loi.** Chaque règle, test ou étape de process doit
  *mériter sa place* en réduisant un **risque** OU une **charge mentale**. Sinon → on le coupe. Le
  « −10 % » ne vaut pas que pour le prompt : il vaut aussi pour le **framework et le process**.
- **La mesure du succès** n'est PAS le nombre de documents produits, mais que **valider la prochaine
  évolution de Milo soit plus simple, plus sûre et plus rapide qu'aujourd'hui.** Corollaire : si le
  framework nous fait réfléchir *davantage* à chaque évolution, c'est le signal qu'il est devenu trop
  complexe → on le simplifie lui aussi.
- **Prompt vs doc — deux natures d'objets :**
  - le **prompt** = objet **opérationnel** (lu par Milo à chaque message, les règles s'y
    concurrencent) → reste **maigre** : *une règle entre, une règle sort — ou on justifie clairement
    pourquoi elle reste*.
  - la **doc** = objet de **mémoire** (garde le *pourquoi* des décisions) → on ne la plafonne pas,
    mais on la **jardine** régulièrement (restructuration) pour qu'elle ne devienne pas un empilement
    que plus personne ne relit.

### 🎮 Garde-fou de priorisation : la gamification vient APRÈS les fondations (GPT + Michel, 27/07/2026)

Risque nommé clairement : la tentation d'ajouter **trop tôt** des **badges, succès, défis, animations,
gamification**. Ces éléments sont sympas mais **ne créent pas la valeur principale** de Force Tracker — qui
est son **intelligence personnalisée** (la connaissance progressive de l'utilisateur). Règle : *on ne pose
pas de vernis de gamification tant que les fondations (profil vivant, cerveau, cohérence) ne sont pas
solides.* La gamification viendra **naturellement** ensuite, et sera **meilleure** parce qu'ancrée sur une
vraie mémoire (un « défi » sur mesure vaut mille badges génériques). Cohérent avec l'identité « figurines
muscles » (on ne copie pas Hevy/JEFIT) et avec le filtre de priorisation (« est-ce que ça améliore les
décisions de Milo ? »).

### 👥 Retours des vrais utilisateurs — anti-sur-ajustement (3 paliers)

Ne jamais transformer un retour **isolé** en règle. Seule la **récurrence** fait monter d'un palier :

| Palier | Décision | Où ça vit |
|---|---|---|
| **1 retour isolé** | on **observe** | `RETOURS-TESTEURS.md` |
| **2-3 retours indépendants, même sujet** | on **enquête** | note / `docs/BUGS-DE-PHILOSOPHIE.md` |
| **problème reproductible / récurrent** | **scénario permanent** | `tests/milo/scenarios.js` |

> Angle mort à surveiller : à force de travailler notre propre logique, ne plus assez confronter Milo
> à de **vrais utilisateurs**. **Séparer les rôles** : les utilisateurs **génèrent la surprise**
> (→ le corpus de tests, via la récurrence ci-dessus) ; l'humain de l'équipe **juge le ressenti** (ce
> qu'aucun test déterministe ne capte). **La machine garde les régressions, l'humain garde le ressenti.**

---

## 🧠 Le prompt est le DERNIER levier, pas le premier (Michel, 25/07/2026)

Apprentissage majeur de la semaine : on a parfois essayé de résoudre **avec le prompt** des problèmes qui
étaient en réalité **structurels**. Le **cerveau de Milo est distribué** (onboarding · données · mémoire ·
`coach.js` · hiérarchie des règles · prompt) — cadre complet dans `docs/MOTEUR-RAISONNEMENT-MILO.md`.

**Discipline — avant TOUTE correction, répondre aux 3 questions** (du plus fiable au moins fiable) :
1. **STRUCTURE ?** (UI, onboarding, donnée manquante, **ET le NIVEAU DE MODÈLE**) — fix déterministe et définitif.
2. **HIÉRARCHIE ?** (deux règles qui se concurrencent) — fix déterministe (on réordonne).
3. **PROMPT seul ?** — fix probabiliste (le modèle peut obéir… ou pas).

**Tant qu'on n'a pas répondu aux trois, on ne touche pas au prompt.** Corollaire gravé : **un prompt ne
compense jamais une donnée absente** — si Milo redemande toujours le lieu/la durée/la fréquence parce qu'ils
ne sont jamais collectés, le vrai correctif est dans l'**interface**, pas dans le cerveau de Milo.

### 🎚️ Le NIVEAU DE MODÈLE est une variable STRUCTURELLE (26/07/2026 — la « variable cachée »)

Cas fondateur : on a durci le prompt anti-interrogatoire **trois fois** (ft-v602/603/606), le comportement
revenait. La vraie cause n'était pas le prompt mais le **modèle** : le coach tournait sur un modèle **léger
par défaut** (qui suit mal les consignes fines), alors que le fondateur testait sur un modèle **haut de
gamme**. Un modèle léger ne tient pas la nuance ; le prompt fin ne « prend » que sur un modèle capable.
Le **choix du modèle est donc une couche du cerveau distribué**, au même titre que les données ou la mémoire —
et c'est un fix **structurel** (déterministe), pas un énième patch de prompt.

**Règle de gouvernance qui en sort (Michel + ChatGPT) :** *« On évalue Milo sur le modèle réellement utilisé
par les VRAIS utilisateurs, pas sur le modèle premium du fondateur. »* Sinon on **corrige le mauvais cerveau**
— on optimise pendant des jours une expérience que la majorité ne voit pas. Corollaire : le **gratuit / la
découverte** (là où se joue la conversion) doit tourner sur un modèle **capable** ; les tâches **utilitaires**
(code-barres, résumés, lecture d'étiquette) peuvent rester sur le modèle léger.

**Et quand on doit VRAIMENT toucher au prompt** : pas de grand ménage. On garde le **noyau cardinal intact**,
on retire **uniquement les redondances évidentes, une par une, avec validation après chaque suppression**
(noyau dur + IA + test humain). *« Dix petites coupes validées valent mieux qu'une grosse simplification qui
changerait subtilement le comportement de Milo. »*

### 🎯 Le bon indicateur : « combien de valeur AVANT la première question ? » (Michel, 26/07/2026)

Raffinement du noyau cardinal ① (aider avant de questionner), né d'un vrai test (« je veux faire de la
force » → Milo pose 2 questions avant de proposer). **Le bon indicateur de qualité d'un échange n'est PAS
le nombre de questions posées, mais : *combien de valeur la personne a-t-elle reçue AVANT la première
question ?*** Chaque premier message doit contenir un conseil déjà **exploitable**. Corollaires (gravés
aussi dans le prompt, `buildCoachContext`) : **Milo n'a pas peur de faire un premier choix** quand il a
assez d'infos ; **une fois l'orientation crédible posée, les questions restantes ne débloquent plus rien —
elles ne font que PERSONNALISER** (différence fondamentale) ; sur une blessure connue, il **montre qu'il
sait quoi en faire** (« amplitude contrôlée, progression adaptée »), pas seulement qu'il s'en souvient.
C'est ce qui fait sentir un **coach** et non un assistant qui collecte des infos.

---

## 🔁 Le cycle d'une brique

### 1. Réflexion
- Définir le problème à résoudre.
- Vérifier que la brique respecte la **Constitution** de Force Tracker.
- Identifier clairement sa **valeur pour l'utilisateur** (règle d'or : « cela
  rend-il Milo/l'app réellement meilleur pour le sportif ? »).

### 2. Spécification
Toujours définir les **3 sections** :
- **Objectif** — ce que la brique apporte, en une phrase.
- **Critère de réussite** — comment on sait qu'elle est finie et validée.
- **Hors périmètre** — ce qui NE doit PAS être fait dans cette brique.

La brique doit rester **simple et indépendante** (anti « puisqu'on y est »).

### 3. Challenge
- La proposition est relue (Claude ↔ ChatGPT ↔ Michel).
- Les remarques sont discutées, les améliorations intégrées.
- **La validation finale appartient toujours à Michel.**

> **🧪 Les 3 critères d'évaluation d'une proposition** *(grille permanente, apport Michel 23/07/2026)* —
> avant de figer quoi que ce soit, toute proposition passe ces trois filtres :
> 1. **Améliore-t-elle réellement l'expérience utilisateur ?**
> 2. **Est-elle soutenable économiquement à grande échelle ?** (une excellente idée qui double les
>    coûts LLM n'est probablement pas une bonne idée produit.)
> 3. **Existe-t-il une solution plus simple qui apporte 80 % du bénéfice pour 20 % du coût ?**
>
> Corollaire décisif : **séparer le PRINCIPE de son IMPLÉMENTATION.** On grave un principe quand il
> est mûr ; on ne fige pas une architecture sur une simple intuition. Transformer trop vite une bonne
> intuition en implémentation est un piège récurrent.

> **🎯 4ᵉ filtre — le COMPORTEMENT OBSERVABLE** *(GPT + Michel, 27/07/2026 ; né des 4 bugs Milo→Séance)* —
> pour toute brique qui **ajoute une connaissance** au profil vivant, répondre AVANT de coder :
> **① qui la produit · ② qui l'exploite · ③ quel comportement CONCRET change dans l'app ?**
> Si on ne sait répondre à aucune → on n'ajoute pas (ou pas encore). *« Une connaissance qui ne change
> rien au comportement de l'app est une connaissance inutile. »*
> ⚠️ **Nuance** : le comportement peut être **différé**, mais il doit être **NOMMABLE** (« ça servira à la
> brique 7 dans quelques mois » = valide ; « on verra bien » = non) — sinon on tuerait la mémoire longue,
> qui est l'ADN du produit. Détail + contre-exemples : `docs/PROFIL-VIVANT.md`.
> 💡 Cette grille sert **aussi à l'envers**, en audit : *où cette info ressort-elle concrètement ?* — c'est
> comme ça qu'on a trouvé les 4 bugs de restitution (`ft-v625→628`).

### 4. Développement
- **Sauvegarde d'abord** (point de restauration — voir « Adaptation Force
  Tracker » ci-dessous).
- Implémentation, une chose à la fois.
- **Tests techniques** (Playwright / Chrome + Safari quand c'est de l'UI).

### 5. Clôture obligatoire
Une brique n'est **PAS terminée** tant que TOUT ceci n'est pas fait :

- [ ] Code terminé
- [ ] Tests réalisés
- [ ] **`CLAUDE.md` mis à jour** (fichier maître, prioritaire)
- [ ] Roadmap mise à jour (si nécessaire)
- [ ] Fichier de suivi dédié mis à jour (ex. `DOSSIER-ATHLETE-SUIVI.md`)
- [ ] Journal des décisions mis à jour
- [ ] Documentation (aides `?`, Aide détaillée, Guide…) mise à jour si feature visible
- [ ] Résumé des changements rédigé (message clair à Michel)
- [ ] Point de sauvegarde / rollback fourni

### 6. Validation finale — les 4 axes
Une brique n'est **réellement terminée** que lorsque les **4 validations** sont
obtenues (méthode adoptée à la clôture de la brique 3, 19/07/2026) :

1. **Validation fonctionnelle** — la fonction fait ce qu'elle doit faire.
2. **Validation technique** — code propre, tests OK, 0 erreur, rien de cassé.
3. **Validation en situation réelle** — Michel l'a essayée en vrai (iPhone) et
   ça tient dans l'usage.
4. **Validation de la philosophie de Milo** — le comportement respecte la
   Constitution (la personne d'abord, écouter/comprendre avant de conseiller…).

- **Michel valide** ces 4 axes → la brique est close ; on passe à la suivante.

---

## 📝 Résumé de fin de tâche (obligatoire, format standard)

À la fin de CHAQUE tâche, produire automatiquement un petit compte-rendu — **toujours
les mêmes 5 points** (fait partie de la « Clôture obligatoire », pas optionnel) :

1. **Ce qui a été modifié** (le quoi).
2. **Pourquoi** (le retour / la raison).
3. **Fichiers impactés.**
4. **Documentation mise à jour** (CLAUDE.md, CONTEXTE-ACTUEL, suivi, décisions…).
5. **Prochaine étape** (+ le rollback / point de sauvegarde).

> C'est ce compte-rendu que Michel lit pour comprendre l'état sans relire le code.
> La doc est donc TOUJOURS synchronisée avec le code — plus jamais de rappel
> « tu as oublié de mettre à jour le fichier… ».

---

## 🎯 Objectif

Le code n'est qu'une **partie** du travail. Une brique n'est terminée que
lorsque :
- le code fonctionne,
- la documentation est à jour,
- la traçabilité est complète,
- **l'état du projet est immédiatement compréhensible.**

## ❓ Pourquoi ?

Pour qu'à **tout moment** on puisse reprendre le projet **sans relire des
centaines de lignes de code**. Chaque décision doit rester compréhensible des
mois — ou des années — plus tard.

---

## 🔧 Adaptation Force Tracker (le vrai flux)

Force Tracker se **déploie sur `master`** (GitHub Pages met en ligne
directement ; le backend Apps Script + le Worker Cloudflare s'auto-déploient).
Le « branche → merge » classique se traduit donc ainsi :

- **Sauvegarde = point de restauration**, pas une branche de feature fusionnée :
  - commit clair **avant** la modif (rollback facile),
  - **branche de backup** poussée pour un jalon important (ex.
    `backup-AAAA-MM-JJ-sujet`) → restauration en 1 ligne
    (`git reset --hard origin/<branche-backup>`).
- **Gros chantier ou risqué** → on construit dans le **bac à sable `/clone/`**,
  Michel valide sur l'URL du clone, PUIS on **promeut** en prod.
- **Petite brique sûre** → commit + push sur `master`, **puis** Michel valide sur
  iPhone (le déploiement est réversible via le rollback).
- **Backend / migration / suppression** → branche + **tag/branche de backup**
  d'abord, et de préférence **la nuit** (0 utilisateur en séance).
- Toujours **bumper `sw.js` (`ft-vNN`)** à chaque release qui touche un asset,
  et **journaliser en temps réel** (règle d'or #12).

> En clair : la rigueur du cycle (spéc → challenge → tests → clôture → doc) est
> **identique** ; seule la mécanique Git est adaptée au fait qu'on déploie en
> continu sur `master` plutôt que via des PR.

---

## 🔭 Croiser les regards extérieurs (adopté le 20/07/2026)

Le projet avance à plusieurs IA (**Michel décide · Claude archi/dev · GPT
vision**) et fait ponctuellement appel à des **regards extérieurs** (Gemini,
Mistral…) pour un avis franc. La règle, proposée par GPT et validée :

- **Convergence** de plusieurs regards **indépendants** sur une même idée
  → **décision d'architecture** (on grave et on avance).
- **Divergence** → **débat technique** explicite **avant** d'implémenter.
- Un nouvel avis n'a de valeur que s'il ouvre une **dimension nouvelle**
  (règle des personas) — pas juste « un avis de plus » (sinon = bruit +
  contradictions qui ralentissent la décision).
- **Honnêteté du briefing** : quand on sollicite une IA extérieure, lui préciser
  ce qui **existe déjà** — sinon elle classera « urgent » des choses déjà faites
  (piège vécu : Mistral a cru la sauvegarde absente alors qu'elle est en place).

> Exemple fondateur (20/07) : Gemini + Mistral ont **convergé** sur « ne pas
> sur-modéliser le graphe biomécanique » et « la couche machine, le risque =
> les médias » → ces 2 convergences sont **devenues des décisions d'archi VM**.

---

*Ce document est la méthode officielle de Force Tracker. Il évolue si la méthode
elle-même évolue (rare) — la discipline, elle, reste stable.*
