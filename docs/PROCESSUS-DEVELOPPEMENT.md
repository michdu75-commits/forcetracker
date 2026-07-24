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
