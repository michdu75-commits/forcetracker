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

⚠️ **Point capital, souvent mal compris** : ces valeurs sont mesurées sur **la séance entière,
temps de repos compris**. Ce ne sont PAS des valeurs « pendant l'effort ». On ne doit donc pas
les appliquer aux seules séries en ajoutant du repos à côté — ce serait compter deux fois.

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
| 2 | Appliquer **MET × poids × durée** sur la séance entière (sans découper effort/repos) | définition du MET + Compendium | 🟢 indiscutable |
| 3 | Retirer les **49 kcal forfaitaires** d'échauffement | aucune source, inventé | 🟢 indiscutable |
| 4 | Choisir le MET entre 3,5 / 5,8 / 6,0 selon la séance | déduction maison | 🟠 jugement |
| 5 | Ajouter l'**EPOC** (~50 kcal) | mesuré, mais ±31 | 🟠 à décider |
| 6 | Dire que c'est une **estimation** dans l'interface | la revue 2024 elle-même | 🟢 honnêteté |

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

⚠️ **Vérification à faire par Michel** : le proxy réseau de l'environnement Claude **bloque**
`pacompendium.com`, `pmc.ncbi.nlm.nih.gov`, `frontiersin.org` et `academie-medecine.fr`. Les
valeurs ci-dessus viennent des **résumés de recherche**, pas des pages ouvertes une par une.
Les trois valeurs MET (3,5 · 5,8 · 6,0) et la formule sont concordantes sur plusieurs sources
indépendantes, mais **il faut les confirmer sur le Compendium officiel** avant de coder quoi que
ce soit. *Une source citée n'est pas une source lue.*
