# 🔥 La dépense énergétique en musculation — ce qui est PROUVÉ, ce qui ne l'est pas

> **Créé le 11/08/2026, sur une exigence de Michel** : *« si on veut que l'application soit
> sérieuse, il faut des données sérieuses et scientifiquement prouvées ET prouvables. »*
>
> Le déclencheur : ses cartes d'historique affichaient **10 250 kg → 199 kcal** et
> **3 049 kg → 191 kcal**. Trois fois le volume, la même dépense.
>
> ⚠️ **Ce document n'est pas une décision, c'est un dossier.** Il rassemble ce que disent les
> sources, avec leurs limites, pour qu'on puisse trancher — et que quelqu'un d'autre puisse
> vérifier. Aucune ligne de code n'a été modifiée sur la base de ce document.

---

## 1. La formule de référence (celle que tout le monde utilise)

**1 MET** = l'énergie dépensée au repos, définie comme **3,5 mL d'O₂ par kg et par minute**,
soit **1 kcal par kg et par heure**.

D'où les deux écritures équivalentes :

```
kcal/min = MET × 3,5 × poids(kg) ÷ 200        (écriture ACSM)
kcal     = MET × poids(kg) × durée(heures)     (la même, simplifiée)
```

C'est la formule de l'American College of Sports Medicine, reprise par le Compendium.
*Ce n'est pas contesté — c'est la définition du MET.*

---

## 2. Ce que dit le Compendium 2024 pour la MUSCULATION

Le **Compendium of Physical Activities** est le catalogue de référence des coûts énergétiques
(Ainsworth et al.). La version **2024** couvre **1 114 activités**, dont **82 % avec des valeurs
MESURÉES** (contre 68 % en 2011).

Trois entrées concernent la musculation :

| Situation | MET |
|---|---|
| Séance **multi-exercices, 8 à 15 répétitions** (le cas courant) | **3,5** |
| **Circuit / supersets** enchaînés | **5,8** |
| Musculation **vigoureuse** (effort intense) | **6,0** |

⚠️⚠️ **CORRECTION DU 11/08 (contre-expertise ChatGPT) — j'avais écrit ceci, et c'était TROP
CATÉGORIQUE** : *« ces valeurs sont mesurées sur la séance entière, temps de repos compris »*.
Le Compendium donne une valeur pour une **catégorie de pratique**, pas une équation physiologique
qui dirait explicitement « 3,5 MET pendant les séries ET les pauses ». Il ne fournit simplement
**aucune valeur séparée** série / repos.

**La formulation juste** :
> Utiliser la durée réelle correspondant au **périmètre du MET choisi**, sans ajouter séparément
> un coût de repos **déjà supposé** par la catégorie d'activité.

*Ce qui reste vrai* : il ne faut pas découper effort/repos avec deux MET différents comme le fait
le modèle actuel — ce serait sortir du cadre des valeurs publiées. *Ce qui était faux* : affirmer
que les repos ont été explicitement mesurés dans chaque valeur. **Une note fausse est pire que pas
de note : elle clôt la question.**

⚠️ **Et une 4ᵉ valeur m'avait échappé**, confirmée sur le Compendium officiel :

| Situation | MET |
|---|---|
| **Squats / soulevés de terre**, effort lent ou explosif | **5,0** |

Elle comble exactement le trou entre « séance classique » (3,5) et « circuit » (5,8) — et c'est le
cas d'une bonne partie des séances de Michel.

---

## 3. ⭐ La charge soulevée ne change (presque) pas la dépense — et c'est mesuré

C'est le résultat le plus contre-intuitif, et il valide un choix déjà fait dans l'app.

Une étude a mesuré la consommation d'oxygène **en continu** (calorimétrie indirecte) sur des
séances à **60 % du 1RM** contre **80 % du 1RM**, chez des sujets sains et des patients
diabétiques de type 2. Résultat : **aucune différence significative de MET** entre les deux
intensités.

**Conséquence pour nous** : lier les calories au **volume soulevé** (kg × reps × séries) serait
une erreur, malgré l'intuition. Une séance à 10 tonnes et une séance à 3 tonnes de durée
identique dépensent des énergies comparables.

👉 **Le tonnage n'est pas une mesure de dépense énergétique. C'est une mesure de travail
mécanique.** Les deux ne se confondent pas — le corps n'est pas une poulie.

---

## 4. ⚠️ Ce que les sources disent AUSSI, et qu'il faut dire

**La revue systématique de référence** (Mitchell et al., *Sports Medicine*, 2024) a passé au
crible **19 867 études**, en a retenu **166**. Ses conclusions tempèrent tout ce qui précède :

- les valeurs rapportées **varient énormément d'une étude à l'autre** ;
- la calorimétrie indirecte, méthode dominante (136 études sur 166), **sous-estime** la musculation
  parce qu'elle ne capte pas la part **anaérobie** (glycolytique) — or elle est importante en
  musculation, contrairement au cardio ;
- pour approcher la dépense totale, il faudrait **combiner** calorimétrie indirecte **et** lactate
  sanguin.

**Autrement dit : personne ne sait mesurer proprement la dépense d'une séance de musculation.**
Toute valeur affichée par une application est une **estimation**, y compris avec les meilleures
sources. C'est une raison de plus pour ne pas la présenter comme un fait.

### Quelques valeurs réellement mesurées, pour l'ordre de grandeur

| Population | Protocole | Mesure |
|---|---|---|
| 18 femmes en surpoids | musculation à charge lourde | **289 ± 69 kcal** par séance |
| 9 hommes actifs | 30 min à 75 % du 1RM | **8,83 ± 1,55 kcal/min** |

⚠️ L'**écart-type** compte autant que la moyenne : ±69 kcal sur 289, c'est **±24 %** entre deux
personnes faisant la même séance.

---

## 5. L'EPOC — ce qu'on brûle APRÈS

L'**EPOC** (consommation d'oxygène excédentaire post-exercice) est réel après la musculation, et
plus marqué qu'après le cardio. Mais son ampleur est modeste :

- **51 ± 31 kcal** après une séance de charges lourdes (contre 49 ± 20 en circuit, 32 ± 16 à vélo) ;
- métabolisme de repos élevé d'environ **10 % pendant 2 h**, et encore **4,7 à 9,4 % à 15 h** ;
- les intensités de **80-90 % du 1RM** l'augmentent, et les gros groupes musculaires aussi.

👉 **~50 kcal, avec un écart-type de ±31.** À connaître, mais ce n'est pas ce qui explique
l'écart qu'on cherche.

---

## 6. 📏 L'ÉCART, mesuré sur le modèle actuel de Force Tracker

Le modèle actuel **reconstruit** la séance : 30 s par série (forfait) + le temps de repos *réglé*
dans les paramètres + **49 kcal forfaitaires** d'échauffement. Il n'utilise **pas** la durée réelle,
qu'il enregistre pourtant depuis toujours (`sess.duration`).

**À 84 kg :**

| Durée | App actuelle | Compendium 3,5 MET | Compendium 5,8 MET | Compendium 6,0 MET |
|---|---|---|---|---|
| 45 min | **202** | 220 *(+9 %)* | 365 | 378 |
| 60 min | **255** | 294 *(+15 %)* | 487 | 504 |
| 75 min | **308** | 368 *(+19 %)* | 609 | 630 |
| 90 min | **361** | 441 *(+22 %)* | 731 | 756 |

**Le MET moyen implicite du modèle actuel est de 2,8 à 2,9** — soit le niveau « debout, activité
légère ». Même comparé à la valeur la **plus basse** du Compendium (3,5), l'app sous-estime de
**9 à 22 %**, et l'écart grandit avec la durée.

⚠️ Et si la personne fait des **supersets** ou un **circuit** (5,8 MET), l'écart passe à **+80 à
+100 %** : l'app annonce 255 kcal là où le Compendium en donne 487.

---

## 6bis. ⭐⭐ LE PIÈGE QUE J'AVAIS COMPLÈTEMENT RATÉ : calories BRUTES contre calories ACTIVES

*(Apporté par la contre-expertise ChatGPT, 11/08. C'est le point le plus important de sa réponse,
et il est architectural — à régler AVANT de coder.)*

`MET × poids × durée` donne la dépense **TOTALE pendant l'activité**. Or cette dépense **contient
le métabolisme de repos** — l'énergie que la personne aurait brûlée de toute façon, assise sur son
canapé, pendant la même heure.

**Le risque, et il est concret** : l'app additionne ce chiffre au **TDEE**, qui contient déjà le
métabolisme de repos de la journée entière. On compte donc **deux fois** la même énergie.

**L'ordre de grandeur, à 84 kg sur une séance d'une heure :**

| | kcal |
|---|---|
| Dépense **brute** de séance (3,5 MET) | **294** |
| Métabolisme de repos sur la même heure (1 MET) | **84** |
| Dépense **ACTIVE** (ce que la séance a réellement ajouté) | **210** |

**Soit 29 % d'écart.** Pour quelqu'un qui règle son alimentation là-dessus, ce n'est pas un détail :
c'est 84 kcal offertes par séance, 4 séances par semaine, ~340 kcal/semaine mangées en trop.

👉 **Décision à prendre avant de coder** : que doit afficher l'app, et surtout que doit-elle
transmettre au calcul nutritionnel ? *La réponse la plus probable : brut à l'écran (c'est ce que
les gens attendent), ACTIF dans le calcul des macros.* Mais c'est un choix à assumer et à écrire.

---

## 7. Ce qui reste un JUGEMENT, et doit être assumé comme tel

Les sources donnent la formule et trois valeurs. Elles ne disent **pas** comment une application
choisit entre 3,5 · 5,8 · 6,0 pour une séance donnée — le Compendium classe par **effort perçu**,
que l'app ne connaît pas.

Ce qu'on pourrait déduire de ce que l'app sait déjà, sans rien demander :

- **supersets / dropsets / circuit** → l'app le sait (`groupType`) → oriente vers **5,8** ;
- **densité** (séries par minute, mesurable via `duration`) → un repos court oriente vers le haut ;
- **part de polyarticulaires lourds** → l'app le sait (`_movPattern`) → oriente vers le haut.

**C'est défendable, mais ce n'est pas sourcé.** À écrire comme un choix, pas comme une preuve.

⏭️ **La seule façon de le sourcer vraiment** serait de demander l'effort ressenti à la personne
(RPE) — une question de plus après la séance. À arbitrer : la précision contre la friction.

---

## 8. Ce qu'il faudrait changer, par ordre de solidité

| # | Changement | Fondé sur | Solidité |
|---|---|---|---|
| 1 | Utiliser la **durée réelle** (`sess.duration`) au lieu de la reconstruire | la donnée existe déjà, elle est mesurée | 🟢 indiscutable |
| 2 | Appliquer **MET × poids × durée** sans découper effort/repos avec deux MET | définition du MET + Compendium | 🟢 indiscutable |
| 3 | Retirer les **49 kcal forfaitaires** d'échauffement | aucune source, inventé | 🟢 indiscutable |
| 4 | Séparer **brut** (à l'écran) et **actif** (dans le calcul des macros) | évite le double comptage avec le TDEE | 🟢 indiscutable |
| 5 | Choisir le MET entre 3,5 / **5,0** / 5,8 / 6,0 selon la séance | **heuristique maison** assise sur les catégories du Compendium | 🟠 à assumer comme tel |
| 6 | Afficher une **fourchette**, pas un nombre au kcal près | la revue 2024 (±24 % entre personnes) | 🟢 honnêteté |
| 7 | Dire « **estime** la dépense », pas « calcule les calories brûlées » | la revue 2024 | 🟢 honnêteté |
| 8 | ~~Ajouter l'EPOC (~50 kcal)~~ | **ÉCARTÉ** — ±31 kcal, dépend du volume ET de la charge | 🔴 non |

### ⛔ Ce qui a été ÉCARTÉ, et pourquoi (contre-expertise, 11/08)

- **L'EPOC forfaitaire (+50 kcal)** : la revue de Farinatti montre que son amplitude dépend du
  volume ET de la charge, et que des repos courts peuvent l'augmenter **sans augmenter la dépense
  totale**. Ajouter un forfait serait *exactement la fausse précision qu'on cherche à supprimer*.
- **Une équation charge × reps × repos** : il en existe une expérimentale (Kravits, R² ≈ 0,773,
  à partir de l'âge, la taille, la masse grasse/maigre et le volume total), mais **c'est un travail
  de conférence**, pas une équation validée comme celles de l'ACSM pour la course. À connaître,
  pas à implémenter.
- **Le RPE comme convertisseur de calories** : le RPE est un indicateur d'intensité **valide**
  (méta-analyse : coefficient de validité 0,88), mais *RPE ≠ kcal* — un RPE 9 sur 3 séries de squat
  et un RPE 9 sur 5 séries de curl ne coûtent pas la même énergie. À utiliser comme **modificateur**,
  jamais comme convertisseur. Et s'il est demandé, en une question sans friction (« Comment était ta
  séance ? 1-10 »), pas en jargon.

### ⚠️ LE RISQUE À GARDER EN TÊTE, formulé par la contre-expertise

> *Force Tracker risquerait de remplacer une approximation grossière par **une approximation
> sophistiquée qui donne l'illusion d'être scientifique**.*

C'est le vrai danger de ce chantier. L'objectif n'est donc pas « le calculateur le plus précis »,
mais **« le système d'estimation le plus honnête, traçable et cohérent »** à partir des données
disponibles. Un chiffre faux affiché avec assurance est pire qu'un chiffre faux affiché comme
incertain.

⚠️ **Le point 6 n'est pas cosmétique.** Si Tatiana règle son alimentation sur ce chiffre, elle doit
savoir que c'est une fourchette, pas une mesure. Les meilleures études se trompent de ±24 % entre
deux personnes faisant la même séance.

---

## 9. Les sources

- **2024 Adult Compendium of Physical Activities** — Ainsworth et al., *Journal of Sport and Health
  Science* — https://www.sciencedirect.com/science/article/pii/S2095254623001084
  · site officiel : https://pacompendium.com/adult-compendium/
- **Methods to Assess Energy Expenditure of Resistance Exercise: A Systematic Scoping Review** —
  Mitchell, Wilson, Duthie, Pumpa, Weakley, Scott, Slater — *Sports Medicine*, 2024 —
  https://pubmed.ncbi.nlm.nih.gov/38896201/
- **Determination of metabolic equivalents during low- and high-intensity resistance exercise** —
  https://pmc.ncbi.nlm.nih.gov/articles/PMC4763546/
- **Similar Energy Expenditure During BodyPump and Heavy Load Resistance Exercise in Overweight
  Women** — *Frontiers in Physiology*, 2020 —
  https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2020.00570/full
- **Influence of Resistance Training Variables on Excess Postexercise Oxygen Consumption: A
  Systematic Review** — Farinatti et al. —
  https://onlinelibrary.wiley.com/doi/10.1155/2013/825026
- **Effects of load-volume on EPOC after acute bouts of resistance training** —
  https://pubmed.ncbi.nlm.nih.gov/23085971/

**Ajoutées par la contre-expertise du 11/08 :**

- **Convergent Validity of Ratings of Perceived Exertion During Resistance Exercise** (méta-analyse,
  validité 0,88) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8742800/
- **Total Energy Cost — Aerobic and Anaerobic, Exercise and Recovery — of Five Resistance
  Exercises** — https://doaj.org/article/ba144a51e1b446238376a70edc1fc328
- **Predicting Energy Expenditure of an Acute Bout of Resistance Exercise** (Kravits, R² ≈ 0,773)
  — https://digitalcommons.wku.edu/ijesab/vol2/iss10/59/

✅ **VÉRIFICATION FAITE (11/08)** : les valeurs MET **3,5 · 5,8 · 6,0 sont confirmées** sur le
Compendium officiel par la contre-expertise, **plus une quatrième que j'avais ratée : 5,0 MET pour
squats/soulevés de terre**. En revanche mon affirmation « repos compris » a été jugée **trop
catégorique** et corrigée au §2.

⚠️ **Reste vrai** : le proxy réseau de l'environnement Claude **bloque**
`pacompendium.com`, `pmc.ncbi.nlm.nih.gov`, `frontiersin.org` et `academie-medecine.fr`. Les
valeurs ci-dessus viennent des **résumés de recherche**, pas des pages ouvertes une par une.
Les trois valeurs MET (3,5 · 5,8 · 6,0) et la formule sont concordantes sur plusieurs sources
indépendantes, mais **il faut les confirmer sur le Compendium officiel** avant de coder quoi que
ce soit. *Une source citée n'est pas une source lue.*
