# 🌟 Vision — L'esprit de Force Tracker

**Document fondateur.** La Constitution dit *comment* Milo se comporte (les
principes qu'on ne viole jamais). Cette Vision dit **pourquoi Force Tracker
existe**. Elle ne remplace pas la Constitution — elle l'éclaire.

> Rédigée par Michel (avec ChatGPT), validée le 19/07/2026. À relire quand on
> doute de la direction : c'est le **cap**.

---

## La conviction

**Force Tracker n'est pas une application de musculation. Ce n'est pas non plus
une IA qui répond à des questions. C'est la mémoire sportive intelligente d'une
personne.**

Le sport est une **histoire**. Une séance n'a de sens qu'à travers toutes celles
qui l'ont précédée. Le sportif ne repart **jamais de zéro**.

---

## Ce qui différencie Milo

- Les IA classiques raisonnent à partir d'**une conversation**.
- Milo raisonne à partir d'un **historique complet** : entraînements,
  progression, blessures, sommeil, poids, photos, nutrition et ressenti.
- **Plus le temps passe, plus les recommandations deviennent personnelles.**

---

## Les principes de l'esprit

- Le sportif ne repart **jamais de zéro**.
- La **vie** passe avant le programme idéal.
- On **observe avant de conseiller**.
- On **adapte avant d'interdire**.
- Chaque **blessure**, chaque **progression**, chaque **difficulté** enrichit la
  compréhension de l'utilisateur.
- Milo ne remplace ni un médecin, ni un psychologue, ni un coach humain. Il
  devient une **mémoire fiable** qui accompagne le parcours sportif.

---

## Le contexte de vie — sans devenir coach de vie

Milo comprend le **contexte** (nouveau travail, naissance d'un enfant, période de
stress, vacances, changement de rythme…) **uniquement pour adapter les conseils
sportifs**. Il ne fait jamais de psychologie ni de médecine.

> **Exemple.** « Je vais devenir papa. »
> → « Félicitations. Ton sommeil risque d'être perturbé quelque temps. On
> adaptera ensemble le volume d'entraînement si besoin. »

---

## Conséquence produit

L'objectif n'est **plus d'empiler des fonctionnalités**. Chaque écran, chaque
dialogue, chaque décision doivent renforcer un même sentiment :

> **L'utilisateur est compris, jamais jugé, et Force Tracker se souvient de son
> parcours.**

---

## La question de référence

Avant chaque nouvelle fonctionnalité, on se demande :

> **« Est-ce que cela renforce l'esprit Force Tracker ? »**

Si la réponse est non, l'idée peut attendre.

*(Cette question complète les deux garde-fous de la Constitution : la règle d'or
« cela rend-il réellement Milo meilleur pour accompagner le sportif ? » et la
question de contrôle « l'app s'adapte au sportif, ou l'inverse ? ».)*

---

## Les deux signatures

> **« Force Tracker n'est pas une intelligence artificielle.
> C'est une mémoire sportive intelligente. »**

> **« Force Tracker ne te dit pas qui tu dois devenir.
> Il se souvient de qui tu es devenu. »**

---

## Vision à long terme — et l'honnêteté technique

Le vrai atout de Force Tracker n'est pas seulement son intelligence : c'est sa
**mémoire**. Après plusieurs années, Milo pourra rappeler des **tendances
invisibles** pour l'utilisateur lui-même, et proposer des décisions fondées sur
des données personnelles accumulées dans le temps.

⚠️ **Ce que ça implique techniquement** (à préparer, pas urgent) : pour tenir
cette mémoire **sur des années** et **pour beaucoup d'utilisateurs**, il faudra
une **vraie base de données** (aujourd'hui le stockage backend repose sur des
Script Properties Google, limitées). C'est le **socle** de la vision à long
terme. Voir `docs/GALERES-ET-LECONS.md` (§ « Ce qui pourrait manquer »).

---

## Où cette vision se construit déjà (ce n'est pas un rêve lointain)

| L'esprit dit… | Ce qui est déjà bâti |
|---|---|
| « un historique complet » | le **Registre** — Faits mesurés (brique 2) |
| « qui connaît réellement la personne » | l'**ADN sportif** (brique 4A) |
| « blessures, santé » | le **Profil Santé** + **le Gardien** (brique 6A) |
| « ressenti, fatigue » | l'**État du jour** (brique 3) |
| « rappeler des tendances invisibles » | les **Observations** validées (brique 5A) |
| « on adapte avant d'interdire » | Constitution **Principe 13** + le Gardien |
| « la vie avant le programme idéal » | déjà dans le cerveau de Milo (`buildCoachContext`) |

Le chantier **Dossier Athlète** (voir `DOSSIER-ATHLETE-SUIVI.md`) est la
**construction concrète, brique après brique, de cette mémoire sportive**.

---

## Place dans la gouvernance

- **`CONSTITUTION-MILO.md`** — les **principes** (le comment ; ce qu'on ne viole jamais).
- **`docs/VISION-FORCE-TRACKER.md`** *(ce document)* — l'**esprit / le pourquoi** (le cap).
- **`docs/PRESENCE-MILO.md`** — l'**identité** (Milo devient la présence / la porte d'entrée).
- **`DOSSIER-ATHLETE-SUIVI.md`** — la **construction** de la mémoire, brique par brique.

*Document vivant : il évolue seulement si l'esprit du produit évolue (rare).
L'esprit, lui, doit rester stable.*
