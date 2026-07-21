# 🫀 Le Corps de Force Tracker — l'architecture comme organisme

> **L'intuition (Michel)** : penser Force Tracker non comme un empilement de fonctions, mais comme un **corps humain vivant** — chaque partie est un **organe** avec un rôle vital, et tout est **relié**. Ce n'est pas qu'une image : c'est un **outil de conception** et de **diagnostic**.

---

## Le test de conception *(GPT, adopté)*

Avant d'ajouter une fonctionnalité, une seule question :

> **« Dans quel organe cette fonctionnalité doit-elle vivre ? »**

Si la réponse n'est pas évidente, c'est que la fonctionnalité **n'est pas assez définie**, ou qu'elle **mélange plusieurs responsabilités** (à découper). C'est le pendant « corps » du garde-fou anti-gadget.

---

## Les organes (check-up)

| Organe | Dans Force Tracker | Santé |
|---|---|---|
| ❤️ **Cœur** | **Local-first** — le sang (les données locales) circule partout, tout le temps | 🟢 solide (le pilier) |
| 🫁 **Poumons** | **Résilience réseau** — respirer même en air rare (4G faible, sous-sol) | 🟢 solide (gym perf) |
| 🧠 **Cerveau** | **Milo** (l'IA) — raisonne, conseille, uniquement quand il apporte vraiment | 🟡 en croissance, bien cadré |
| 🍽️ **Digestion** | **EXLIB + moteur VM** — ingérer un programme, reconnaître les exercices | 🟢 robuste muscu · 🟡 à nourrir ailleurs |
| 🦴 **Colonne** | **Constitution + Vision + règles d'or** — ce qui tient tout droit | 🟢 solide, vivante (v1.6) |
| 🧬 **Squelette / langage** | **Modèle métier** — le langage commun qui structure tout | 🟡 neuf, en consolidation (v0.4) |
| 🩸 **Reins / foie** | **Garde-fous de données** — ne jamais écraser du plein par du vide | 🟢 solides |
| 🛡️ **Système immunitaire** | **Le Labo (VT/VC/VM) + l'éthique** — se défendre des régressions, protéger le travail des coachs | 🟡 partiel (l'éthique *technique* manque) |
| ⚡ **Système nerveux** | **Orchestration** — qui décide quel organe intervient, dans quel ordre | ⚪ implicite, à formaliser |
| 💭 **Mémoire** | **Registre + ADN + état ANALYSÉ** — se souvenir de qui tu deviens | 🟡 en construction (Dossier Athlète) |
| 🚽 **Élimination / Entretien** | **Nettoyage, purge, MIGRATIONS** de données | 🔴 **le point faible** (organe négligé) |

---

## Pourquoi cette lentille

- **Cohérence** : une idée n'entre que si elle **renforce un organe** (fin des gadgets orphelins).
- **Diagnostic** : on voit tout de suite **l'organe faible** → quoi soigner d'abord.
- **Équilibre** : un **cerveau (l'IA) surdéveloppé** dans un corps fragile est dangereux — le corps (le local) porte le cerveau, jamais l'inverse.
- **Langage commun** : Michel, Claude, GPT parlent du même corps.

## Risques (organes faibles)

1. 🔴 **Entretien atrophié** — migrations « à la main ». = l'**angle mort n°1 de Gemini** : faire évoluer le corps sans cet organe = risque de **corrompre l'historique**. Un corps qui n'élimine pas s'empoisonne.
2. 🟡 **Immunité incomplète** — l'éthique est une posture (Principe 16), pas encore une **défense technique** (anonymisation, non-repartage, traçabilité).
3. 🟡 **Cerveau > corps** — tentation d'en demander trop à l'IA ; tenir « local d'abord ».
4. ⚪ **Système nerveux implicite** — l'orchestration marche mais n'est pas nommée (deviendra critique au Mode Coach).

## Recommandations — et la SÉQUENCE *(débat GPT ↔ Gemini résolu)*

Divergence : GPT = « continuer VM/Import (la digestion) d'abord, il nourrit tout » · Gemini/Claude = « soigner l'entretien (migrations) d'abord ». **Résolution — les deux ont raison à des moments différents** :

1. **🍽️ MAINTENANT : nourrir la digestion (VM / Import)** — sûr (n'change pas le stockage), gros levier, continu. On enrichit sur les vrais programmes (Christophe/Cyril…).
2. **🚽 JUSTE AVANT le chantier des STRUCTURES : soigner l'entretien** — le versionnage du schéma + migrations. Car c'est **le chantier structures** (circuits/EMOM → nouveaux champs stockés) qui **change le squelette** → il faut l'organe d'entretien **à ce moment-là**, pas avant.
3. **🛡️ En parallèle, progressivement : compléter l'immunité** (garde-fous éthiques techniques).
4. **🧬 Continuer à consolider le squelette** (modèle métier) sur cas réels, sans le figer.
5. **⚖️ Garder le cerveau proportionné** — l'IA seulement quand indispensable.

> **Le beau** : partir du « corps » (intuition de Michel) ramène **exactement** aux priorités trouvées par l'analyse froide des 3 IA. Deux chemins, une conclusion.

*Idée : Michel. Analyse : Claude. Test de conception & priorisation VM : GPT.*
