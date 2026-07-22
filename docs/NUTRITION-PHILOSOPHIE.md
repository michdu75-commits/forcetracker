# 🍽️ L'esprit de la nutrition dans Force Tracker

> **Le cadre à respecter AVANT de coder la moindre brique nutrition.**
> Né du cadrage « esprit nutrition » (22/07/2026) — croisement **Gemini + Mistral + Claude
> + synthèse de Michel**, même méthode que pour l'IMC (convergence = on grave, divergence = on débat).
> Gravé aussi : **Constitution · Principe 21** + le cerveau de Milo (`buildCoachContext`).

---

## 🧭 La phrase-boussole (Michel)

> **« La nutrition est un moyen d'améliorer la santé, la récupération et la performance.
> Elle ne doit jamais devenir une source de stress supérieure au bénéfice qu'elle apporte. »**

Corollaire général (Principe 21) : *le but n'est pas d'obtenir le MAXIMUM de données, mais
SUFFISAMMENT pour prendre la meilleure décision possible tout en conservant une excellente
expérience.*

---

## Les principes (esprit)

1. **Au service de l'objectif** — la nutrition est un **levier** (perte, muscle, force, santé,
   compétition, récup), jamais une finalité. Les conseils changent selon l'objectif RÉEL.
2. **Optionnelle, jamais bloquante** — Milo aide déjà sans ; il propose la nutrition comme une
   **opportunité d'affiner** (« répondre d'abord, proposer ensuite », P19). Elle **améliore** le
   coaching, ne le **conditionne** jamais. On ne dit JAMAIS « il faut remplir ta nutrition ».
3. **La précision est un CHOIX** (voir « les 4 niveaux ») — jamais une obligation, jamais du
   micro-comptage imposé. C'est la pertinence appliquée à la profondeur de suivi.
4. **Fiabilité > exhaustivité** — l'estimation des apports via une app est très imprécise
   (**±20 à 50 %** ; MyFitnessPal ~50 % d'abandon à 3 mois). Un suivi partiel mais **tenu** vaut
   mieux qu'un journal précis mais abandonné. Un suivi sporadique ne pilote pas les conclusions.
5. **Cohérence > réactivité** — raisonner sur les **tendances** (poids × perf sur des semaines),
   pas sur le repas du jour. La balance énergétique se **déduit** de la tendance de poids → le
   comptage quotidien est largement redondant. Jamais de faux-précis → **fourchettes** (« ~1900 kcal ± 200 »).
6. **Local d'abord** — recherche d'aliments **locale et gratuite** (Open Food Facts, déjà utilisée
   pour le code-barres), instantanée et hors-ligne. L'IA sert au **confort** (photo d'étiquette,
   estimation d'un repas). ⚠️ **Fallback fait-maison** : Open Food Facts est incomplet pour le
   non-emballé (~20 % des repas) → estimation **par catégorie** (« 1 pomme ≈ 80 kcal ») + Milo
   apprend les habitudes.
7. **Qualité, pas que quantité** — mais **sans friction** : le **Nutri-Score** et le **NOVA**
   (degré de transformation) sont **déjà dans Open Food Facts** → repère qualité **gratuit** au scan.
8. **Adapter, pas imposer** — régimes (keto, halal, végé), allergies, budget, et la **vraie vie**
   (horaires décalés → repas calés sur les siens). Jamais d'interdit bête.
9. **La mémoire = notre différence** — relier apports ↔ performance/récup (« les semaines où tu
   manges mieux, tes séances sont plus fortes ») ; ce qu'un simple compteur de calories ne fait pas.
10. **Côté humain / anti-TCA** — ton **éducatif** (le POURQUOI), lexique « carburant / cycle /
    tendance » (jamais « bon / mauvais / écart / triche »), **jamais culpabiliser**, intervenir sur
    les tendances (pas par repas). Si le suivi stresse au point de nuire au sommeil/à la régularité
    → **alléger ou masquer** (Principe 21).

---

## 📊 La précision au CHOIX — les 4 niveaux (nuance clé de Michel)

Ne PAS opposer qualitatif et quantitatif. Le curseur appartient à l'utilisateur :

| Niveau | Suivi | Pour qui |
|---|---|---|
| 1 | **Qualitatif** (repères, ressenti) | Débutant, entretien, « je veux juste des repères » |
| 2 | **Portions** (une portion de prot / de glucides) | La majorité — faible friction, tenu dans la durée |
| 3 | **Macros** (prot/gluc/lip) | Objectif précis (recomposition, prise sérieuse) |
| 4 | **Suivi précis** | Compétition, powerlifting, bodybuilding, grosse perte |

**La précision est un choix, jamais une obligation.** Milo respecte le niveau où la personne se situe.

---

## 🛡️ Le Gardien nutrition (seuils d'alerte santé)

Pendant du Gardien « seuils absolus » (IMC ≥ 40 · tour de taille > 120) — **s'allument seulement
si l'utilisateur logge assez** (cohérent avec « fiabilité »). Vigilance, **jamais un diagnostic** ;
orientation vers un pro.

| Critère | Seuil d'alerte | Action de Milo |
|---|---|---|
| Apports caloriques | < ~1500 kcal/j (H) · < ~1200 (F) | « Apport très bas — consulte un·e diététicien·ne. » |
| Perte de poids | > ~1 %/semaine | « Une perte trop rapide peut coûter du muscle. » |
| Ratio protéines | > 3 g/kg ou < 0,8 g/kg | « Ce ratio est extrême, vérifie avec un pro. » |
| Fréquence repas | < 2 repas/j | « Manger trop peu souvent peut te desservir. » |
| Rapport à la nourriture | signes d'anxiété / orthorexie | Adoucir, déculpabiliser, orienter vers un pro. |

---

## 🥇 La 1ʳᵉ brique (recommandation convergente Gemini + Mistral)

**Un journal léger « à la portion » posé sur Open Food Facts** : scan → macros **+ Nutri-Score/NOVA
gratuits** ; estimation **par catégorie** pour le fait-maison ; chiffres en **fourchette** (jamais
faux-précis) ; détail au gramme **en option** (niveau 3/4). Cible : **peu de friction = tenu = fiable**.
Le coaching fin vient APRÈS le journal.

*(À valider comme prochaine brique — on cadre l'esprit d'abord, on choisit/priorise ensuite avec Michel.)*

---

## ⏳ Couche future (honnêteté — données qu'on n'a pas encore)

**Chronobiologie** (impact d'un nutriment selon l'horloge biologique), **flexibilité métabolique**,
**marqueurs biologiques** (FC repos, récup auto-évaluée) → nécessitent des données de **montre
connectée** / un suivi longitudinal. Fil **transversal**, pas la 1ʳᵉ brique. Lié à la brique
« mémoire vivante ».

---

## Sources croisées
- **Gemini** (lentille rigueur) : ±20-50 % d'erreur d'estimation → ne pas micro-compter ; modèle
  « portions » ; charge cognitive / anti-TCA (masquer une métrique qui stresse) ; posture « régulateur
  systémique » ; chronobiologie (future).
- **Mistral** (lentille science + business) : validation par études ; **qualité via Nutri-Score/NOVA** ;
  **tableau de seuils d'alerte santé** ; trou « fait-maison » d'Open Food Facts ; modèle « MVN » ;
  anti-pseudo-précision (fourchettes).
- **Claude** (archi) : ranger chronobiologie/flexibilité/FC en couche future ; « masquer si ça stresse »
  → version implémentable (détail opt-in, défaut qualitatif, Milo surveille les signes).
- **Michel** (synthèse) : ne pas opposer qualitatif/quantitatif → **les 4 niveaux** ; même philo que
  Milo (affiner, pas conditionner) ; nutrition au service de l'objectif ; **la phrase-boussole**.
