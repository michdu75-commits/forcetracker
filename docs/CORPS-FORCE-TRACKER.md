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
| 🩸 **Foie + Reins** | **Filtration + détoxification des données** — deux fonctions : ① *filtrer ce qui entre* (garde-fous : ne jamais écraser du plein par du vide) ② *détoxifier/renouveler dans la durée* (nettoyage, purge, **MIGRATIONS**) | 🟢 bon **filtre** à l'entrée · 🔴 **détox faible** (migrations « à la main ») |
| 🛡️ **Système immunitaire** | **Le Labo (VT/VC/VM) + l'éthique** — se défendre des régressions, protéger le travail des coachs | 🟡 partiel (l'éthique *technique* manque) |
| ⚡ **Système nerveux** | **Orchestration** — qui décide quel organe intervient, dans quel ordre | ⚪ implicite, à formaliser |
| 💭 **Mémoire** | **Registre + ADN + état ANALYSÉ** — se souvenir de qui tu deviens | 🟡 en construction (Dossier Athlète) |

> 🧠 **Précision biologique (Michel)** : ce sont bien le **foie et les reins** qui nettoient le corps (détoxification du sang). Le « nettoyage / migrations » n'est donc **pas un organe à part** — c'est **une fonction du foie/reins**. Notre foie/reins **filtre bien** ce qui entre (garde-fous solides), mais **détoxifie mal dans la durée** (migrations non systématisées) → c'est **cette fonction-là** qu'il faut soigner.

---

## 🧭 MISE À JOUR DU 19/09/2026 — deux organes changent de NOM ou de RÉGIME, aucun ne se dédouble

> Note d'architecture de Michel. ⛔ **Rien n'est construit** : la direction complète vit dans
> **`docs/INDEPENDANCE-MOTEUR-MILO.md`**. Ce qui suit ne dit que ce qui change **dans ce corps-ci**.

Michel nomme trois organes : **cerveau**, **cervelet**, **estomac**. ⭐⭐ **Deux d'entre eux
existaient déjà ici sous un autre nom, et c'est le point à ne pas rater** — *on ne crée pas un
second vocabulaire pour le même organe* (**R2**).

| son nom (19/09) | le nom déjà écrit ici (20/07) | ce qui change vraiment |
|---|---|---|
| 🧠 **cerveau = Milo** | 🧠 **Cerveau** | **rien** — même organe, même rôle |
| 🧠 **cervelet = Force Tracker / orchestration** | ⚡ **Système nerveux** | **rien sur le fond** : deux noms, un organe. ⭐ Il cesse d'être ⚪ *implicite* : c'est lui qui choisit capacités, droits, contexte, outils — et **éventuellement le moteur IA** |
| 🫃 **estomac** | 🍽️ **Digestion** | ⭐⭐ **le RÉGIME s'élargit énormément** |

**⭐⭐ L'élargissement de l'estomac est le seul vrai changement de ce tableau.** La digestion de
juillet ne mangeait que des **programmes d'entraînement** (EXLIB + moteur VM). Celle de septembre
doit digérer **l'historique sportif, la nutrition, la santé, des documents, des statistiques, et
Internet** — avec toujours la même chaîne : *récupérer → nettoyer → filtrer → dédupliquer →
structurer → réduire*.

👉 ***Et la raison d'être de l'organe devient une phrase*** : ⛔ **le cerveau ne manipule pas les
données brutes, et il ne « mange pas Internet brut ».** Il reçoit un **résultat**, jamais un
entrepôt. *C'est le principe « garder le cerveau proportionné » de la section Risques ci-dessous,
dit à l'entrée du tube digestif au lieu de la sortie.*

⚠️ **Ce que ça ne change pas** : le tableau des organes ci-dessus reste valable tel quel, aucune
ligne n'est retirée, et le **système nerveux garde son état ⚪** — il est nommé depuis juillet et
partiellement explicité depuis le 19/08 (`docs/ARCHITECTURE-CERVEAU-CERVELET.md`), mais il n'est
toujours pas une couche du code.

---

## Pourquoi cette lentille

- **Cohérence** : une idée n'entre que si elle **renforce un organe** (fin des gadgets orphelins).
- **Diagnostic** : on voit tout de suite **l'organe faible** → quoi soigner d'abord.
- **Équilibre** : un **cerveau (l'IA) surdéveloppé** dans un corps fragile est dangereux — le corps (le local) porte le cerveau, jamais l'inverse.
- **Langage commun** : Michel, Claude, GPT parlent du même corps.

## Risques (organes faibles)

1. 🔴 **Détox du foie/reins déficiente** — les migrations de données sont faites « à la main ». = l'**angle mort n°1 de Gemini** : faire évoluer le corps sans une bonne détox = risque de **corrompre l'historique**. Un corps qui ne détoxifie pas s'empoisonne.
2. 🟡 **Immunité incomplète** — l'éthique est une posture (Principe 16), pas encore une **défense technique** (anonymisation, non-repartage, traçabilité).
3. 🟡 **Cerveau > corps** — tentation d'en demander trop à l'IA ; tenir « local d'abord ».
4. ⚪ **Système nerveux implicite** — l'orchestration marche mais n'est pas nommée (deviendra critique au Mode Coach).

## Recommandations — et la SÉQUENCE *(débat GPT ↔ Gemini résolu)*

Divergence : GPT = « continuer VM/Import (la digestion) d'abord, il nourrit tout » · Gemini/Claude = « soigner l'entretien (migrations) d'abord ». **Résolution — les deux ont raison à des moments différents** :

1. **🍽️ MAINTENANT : nourrir la digestion (VM / Import)** — sûr (n'change pas le stockage), gros levier, continu. On enrichit sur les vrais programmes (Christophe/Cyril…).
2. **🩸 JUSTE AVANT le chantier des STRUCTURES : soigner la détox du foie/reins** — le versionnage du schéma + migrations. Car c'est **le chantier structures** (circuits/EMOM → nouveaux champs stockés) qui **change le squelette** → il faut une bonne détox **à ce moment-là**, pas avant.
3. **🛡️ En parallèle, progressivement : compléter l'immunité** (garde-fous éthiques techniques).
4. **🧬 Continuer à consolider le squelette** (modèle métier) sur cas réels, sans le figer.
5. **⚖️ Garder le cerveau proportionné** — l'IA seulement quand indispensable.

> **Le beau** : partir du « corps » (intuition de Michel) ramène **exactement** aux priorités trouvées par l'analyse froide des 3 IA. Deux chemins, une conclusion.

*Idée : Michel. Analyse : Claude. Test de conception & priorisation VM : GPT.*
