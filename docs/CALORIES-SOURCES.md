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

---

## 10. ✅ LES DÉCISIONS DE MICHEL (11/08/2026)

| Question | Sa réponse |
|---|---|
| **Brut à l'écran, ACTIF dans le calcul des macros ?** | ✅ **OUI** — tranché |
| **Afficher une fourchette plutôt qu'un chiffre ?** | ⏸️ *« mitigé, je préfère creuser encore plus avant »* |
| **Demander l'effort ressenti après la séance ?** | ✅ **OUI, mais sans appel API** |
| **Viser volontairement le bas de la fourchette ?** | 🔄 remplacé par : *« et si je comparais avec ma montre connectée ? »* |

### Sur la question d'effort : elle ne coûtera rien, et c'est vérifiable

Une question posée **à la fin de la séance** (« Comment était ta séance ? 1-10 ») est du **pur
local** : un chiffre saisi, stocké dans la séance, utilisé par un calcul qui tourne dans le
téléphone. **Aucun appel réseau, aucun centime.** Et si Milo doit en tenir compte, elle voyage dans
le contexte qui part déjà de toute façon — donc gratuite aussi de ce côté.

⚠️ **Le vrai coût n'est pas l'argent, c'est la FRICTION** (R24/R26) : une question de plus après
chaque séance, quand la personne est fatiguée et veut ranger son téléphone. À concevoir comme une
**ligne de pastilles qu'on peut ignorer**, jamais comme un passage obligé.

---

## 11. ⭐ LA MONTRE CONNECTÉE — l'idée de Michel, et ce qu'elle vaut vraiment

*« Et si je comparais avec ma montre connectée ? »*

**C'est la meilleure idée du chantier** : il a un appareil de mesure indépendant sous la main, et
ça ne coûte rien. Mais il faut savoir ce qu'on compare.

### ⚠️ Une montre n'est PAS une vérité — surtout en musculation

C'est précisément le cas où les montres sont le plus mauvaises :

- **erreur moyenne de 30 à 50 %** sur la dépense en musculation, et **au-delà de 100 %** sur
  certains exercices ;
- la raison est structurelle : l'estimation repose largement sur le **mouvement du poignet**, or
  l'effort anaérobie d'une série lourde ne produit **presque aucun mouvement** ;
- pour comparaison, l'erreur n'est « que » de ~31 % à la marche/course et ~52 % au vélo
  (étude Stanford, 7 appareils).

**Ce que la montre mesure BIEN**, en revanche : la **fréquence cardiaque** — erreur de l'ordre de
**±3 %** (Garmin : −3,3 % d'erreur relative moyenne).

### 👉 Donc ce qu'on peut légitimement en faire

**Pas** : « la montre dit 480, donc le modèle doit dire 480. » Ce serait caler une estimation sur
une estimation **moins fiable que la nôtre** dans ce cas précis.

**Mais** : un **contrôle de cohérence**. Si le modèle annonce 250 et la montre 600, l'un des deux
est franchement à côté et ça mérite qu'on regarde. C'est un **garde-fou d'ordre de grandeur**, pas
un étalon.

**Et surtout** : la **fréquence cardiaque moyenne** de la séance est la donnée la plus solide qu'une
montre puisse donner. C'est elle qui pourrait, un jour, servir de base à une estimation vraiment
personnalisée (voir « objets connectés » dans `IDEES-FUTURES.md`).

### 📋 Le protocole, si Michel veut le faire

Sur **3 à 5 séances**, noter à chaque fois :

1. le chiffre de **l'app** ;
2. le chiffre de la **montre** ;
3. la **durée réelle** de la séance ;
4. la **FC moyenne** si la montre la donne ;
5. le **type de séance** (classique · squat/SDT dominant · supersets/circuit · vigoureuse).

On compare ensuite aux quatre modèles Compendium (3,5 · 5,0 · 5,8 · 6,0). **Trois cas possibles**,
et les trois nous apprennent quelque chose :

- **la montre et un modèle convergent** → on a un point d'ancrage réel ;
- **la montre est très au-dessus de tous les modèles** → c'est probablement elle qui exagère
  (comportement documenté) ;
- **les deux divergent de façon désordonnée d'une séance à l'autre** → confirmation que le chiffre
  ne peut être qu'une fourchette, et la question §10 (« afficher une fourchette ? ») se tranche
  toute seule.

⚠️ **À décider AVANT de coder** : ce protocole donne des données réelles, propres à Michel. Les
attendre coûte quelques jours ; coder sans elles, c'est reconstruire un modèle sans jamais l'avoir
confronté au terrain. *Mesurer d'abord.*

### Sources ajoutées

- **Comparative Validity of Smartwatch-Derived Heart Rate and Energy Expenditure During Endurance
  and Resistance Exercise** — https://www.mdpi.com/1424-8220/26/8/2526
- **Accuracy of Wrist-Worn Activity Monitors During Common Daily Physical Activities and Types of
  Structured Exercise** — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6305876/
- **How accurate are wearable fitness trackers? Less than you might think** (synthèse, UCD) —
  https://theconversation.com/how-accurate-are-wearable-fitness-trackers-less-than-you-might-think-236462

### 🎽 Le matériel de Michel : une Garmin **et** une ceinture Polar H10

*« Le problème de Garmin, c'est qu'il enregistre mal les mouvements. »* — **Son observation est
exactement le mode d'échec décrit par la littérature** : une montre estime la dépense à partir du
**mouvement du poignet**, et une série lourde n'en produit presque aucun. Ce n'est pas un défaut de
son modèle, c'est la limite du principe.

**La ceinture Polar H10, elle, change la donne** : elle mesure la fréquence cardiaque par **ECG**,
pas par optique au poignet. C'est l'appareil utilisé dans les **études de validation**. Michel
l'a déjà.

⚠️ **MAIS — et c'est le point à ne pas sauter — une FC parfaite ne donne pas des calories justes
en musculation.** Deux raisons documentées :

1. L'équation de référence pour convertir FC → dépense (**Keytel et al., 2005**) est calibrée sur
   de l'exercice **sous-maximal en régime stable**, et elle **surestime** — y compris à la marche
   et au vélo, où pourtant elle devrait être à son meilleur.
2. En musculation, la FC monte pour des raisons **qui ne sont pas de la consommation d'oxygène** :
   effort statique, blocage respiratoire, réponse pressive. *Le cœur accélère sans que le corps
   brûle proportionnellement plus.*

👉 **Donc la H10 est un excellent instrument de MESURE, pas une source de calories fiable en
musculation.** Elle donne une donnée solide (la FC) sur laquelle on n'a pas encore d'équation
solide pour ce sport-là.

### ⛔ Et un blocage TECHNIQUE à connaître avant d'imaginer une intégration

**Le Web Bluetooth n'existe pas sur iOS.** Ni dans Safari, ni dans aucun navigateur de l'iPhone —
*« this API is not available in any way, shape or form on iOS »*. Force Tracker étant une **PWA**,
elle **ne peut pas lire la H10** sur l'iPhone de Michel. Sur Android, ce serait possible.

Les contournements existent (navigateurs tiers type Bluefy), mais ce ne sont pas des solutions pour
de vrais utilisateurs. **La seule voie propre est une coque native** — ce qui est déjà le chemin
prévu dans `docs/STRATEGIE-NATIF.md` (Capacitor, zéro réécriture), avec les objets connectés en
**première priorité** de la liste des plugins.

**Conséquence pratique immédiate** : pas d'intégration live. Pour le protocole de calibration,
Michel porte la H10 avec **l'appli Polar**, et recopie les chiffres à la main. C'est suffisant pour
comparer, et ça ne demande aucun développement.

### Sources ajoutées

- **Prediction of energy expenditure from heart rate monitoring during submaximal exercise**
  (Keytel et al., 2005) — https://www.semanticscholar.org/paper/2f647f62e650bf7df32546e541af3cf155297749
- **Acute Behavior of Oxygen Consumption, Lactate Concentrations, and Energy Expenditure During
  Resistance Training** — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8714826/
- **Web Bluetooth — support par plateforme** — https://progressier.com/pwa-capabilities/bluetooth

---

# 12. 🏃 LE CARDIO — le chantier prioritaire, et ce que j'ai TROUVÉ dans le code (11/08/2026)

> Michel : *« creuse le cardio stp »*. Ce qui suit n'est pas une opinion : chaque chiffre a été
> obtenu en **exécutant le code de l'application** sur un gabarit de 84 kg, ou en appliquant les
> **équations métaboliques de l'ACSM**. Rien n'a encore été modifié.

## 12.1 D'abord, la bonne nouvelle : la formule du cardio est JUSTE

```js
function calcCardioKcal(c){
  const met = CARDIO_MET[c.type][c.intensity];
  return Math.round(met * (S.bw||80) * (c.duration/60));   // MET × poids × heures
}
```

C'est exactement `MET × poids × durée`, la formule de référence. **Le problème n'est pas la formule,
il est dans le MET** — et plus précisément dans la façon dont on le choisit.

## 12.2 ⭐⭐ LE VRAI DÉFAUT : trois étiquettes pour un rapport de 1 à 3

L'application demande une **intensité** parmi trois mots — léger · modéré · intense — et en déduit
un MET. Voici ce que ça donne face à l'ACSM, sur un tapis, à 84 kg (20 min) :

| Ce que la personne fait vraiment | ACSM | L'app dit | Écart |
|---|---:|---:|---:|
| marche tranquille 5 km/h, plat | 3,4 MET · 95 kcal | « léger » 3,5 · 98 | ✅ ×0,97 |
| marche rapide 6,5 km/h, plat | 4,1 MET · 115 kcal | « léger » 3,5 · 98 | ×1,17 |
| **marche 6 km/h à 8 % de pente** | **8,0 MET · 223 kcal** | « modéré » 5,5 · 154 | **×1,45** |
| **footing 8 km/h, plat** | **8,6 MET · 241 kcal** | « modéré » 5,5 · 154 | **×1,57** |
| **marche 6 km/h à 12 % de pente** | **10,0 MET · 281 kcal** | « modéré » 5,5 · 154 | **×1,82** |
| **course 10 km/h, plat** | **10,5 MET · 295 kcal** | « modéré » 5,5 · 154 | **×1,91** |
| course 12 km/h, plat | 12,4 MET · 348 kcal | « intense » 9,5 · 266 | ×1,31 |
| course 10 km/h à 5 % | 12,7 MET · 355 kcal | « intense » 9,5 · 266 | ×1,33 |

**Le mot « modéré » recouvre tout, de la marche rapide (4,1) à la course à 10 km/h (10,5).** C'est un
rapport de **1 à 2,5 à l'intérieur d'une seule étiquette**. Aucune valeur unique ne peut être juste
là-dedans : 5,5 est correct pour une marche soutenue et **deux fois trop bas** pour un footing.

*L'étiquette fait un travail que la donnée ne peut pas faire.* Et c'est **exactement le même défaut
que le métabolisme de base corrigé cette nuit** : une valeur moyenne de population appliquée à
quelqu'un, là où une mesure de la personne existe.

**⭐ Or la mesure existe, et elle est SOUS SES YEUX** : le tapis affiche la vitesse, la pente et la
distance. Le vélo affiche les watts. **Ce sont des variables physiques, pas des impressions.**

## 12.3 ✅ CORRIGÉ (ft-v834) — l'échauffement était compté DEUX FOIS

Vérifié en exécutant le code sur une séance de 7 séries (squat + développé couché), 84 kg :

| | kcal |
|---|---:|
| les 7 séries elles-mêmes | **58** |
| forfait « échauffement » ajouté d'office (3,5 MET × 10 min) | **49** |
| total rendu par `calcSessionCalories` | **107** |
| … puis `finishWorkout` ajoute le cardio d'échauffement réellement noté (10 min tapis) | **+77** |
| **total final** | **184** |

**Les mêmes 10 minutes d'échauffement sont donc payées deux fois : 49 en forfait + 77 en réel = 126
kcal pour 10 minutes de tapis.** Le forfait est ajouté **sans condition**, y compris quand la
personne n'a rien échauffé du tout.

Et il pesait **46 % du total** de cette séance. *Le poste le plus lourd du calcul était celui qui
n'avait aucune source.*

**✅ Corrigé en ft-v834** : le forfait ne couvre plus que les moments **non mesurés** (5 min avant +
5 min après), et cède la place dès qu'un cardio réel est enregistré pour ce moment-là. La séance
ci-dessus passe de **184 à 159 kcal**. ⚠️ Une séance **sans** cardio noté est inchangée, et les
séances déjà enregistrées gardent leur chiffre — le reste de cette section (§12.4 et suivantes) est
toujours **ouvert**.

## 12.4 ⚠️ CORRECTION (12/08) — la durée n'est PAS le problème principal. Le RYTHME l'est.

> **Ce paragraphe disait d'abord** qu'une séance de 7 séries « prend 45 à 60 min en vrai », donc que
> les 24 min reconstruites étaient deux fois trop courtes. **C'était une supposition, pas une
> mesure — et les données de Michel la contredisent.**

`_rythmeSeance()` (ft-v826) a **mesuré** son rythme réel sur ses 12 dernières séances : **3,0 minutes
par série**, médiane, cardio déduit, séances aberrantes écartées. Donc :

| | séries | durée **reconstruite** par l'app | durée **déduite du rythme mesuré** |
|---|---:|---:|---:|
| séance courte | 7 | 24 min | **21 min** |
| séance type | 20 | 50 min | **60 min** |
| grosse séance | 28 | 68 min | **84 min** |

La durée reconstruite est donc **correcte à ±20 %**, pas fausse d'un facteur 2. *J'avais inventé la
durée réelle au lieu d'aller lire celle que l'app mesure depuis ft-v826 — dans un document dont le
§12.2 reproche précisément à l'app d'employer une moyenne là où une mesure existe.*

**Le vrai écart est ailleurs : dans le RYTHME de dépense.**

| | kcal/min |
|---|---:|
| Force Tracker, sur sa propre durée (mesuré sur 3 séances types, 85 kg) | **4,15 à 4,50** |
| article — « musculation légère, repos longs » (85 kg) | 4,25 |
| article — « hypertrophie classique » (85 kg) | **7,44** |

**⭐⭐ Force Tracker classe TOUTES les séances dans la catégorie la plus légère.** Son rythme tombe
à 2 % de la ligne « repos longs » de l'article — ce n'est pas un calcul absurde, c'est un calcul
**systématiquement d'un cran trop bas**. L'écart réel est donc de **~1,7×** (et non 3,4× comme
l'estimait la version précédente de ce paragraphe, sur ma durée inventée).

**MET moyen implicite du modèle actuel : 3,18.**

## 12.5 ⚠️ Ce que je ne peux PAS conclure sans Michel

Les quatre chiffres relevés (tapis 101 · montre 89 · Polar 120 · **Force Tracker 57**) ne suffisent
pas à désigner la cause, parce qu'il **manque la durée**. En inversant la formule à 84 kg :

| durée supposée | MET implicite du tapis | MET implicite de Force Tracker |
|---|---:|---:|
| 15 min | 4,81 | **2,71** |
| 20 min | 3,61 | **2,04** |
| 30 min | 2,40 | **1,36** |

**Et aucune de ces valeurs n'existe dans la table de l'app** (le minimum est 3,5). Donc le 57 **ne
peut pas** sortir de `calcCardioKcal` seul — sauf si la durée saisie était d'environ **10-12 minutes
en « léger »** (3,5 × 84 × 0,19 ≈ 57), pendant que le tapis, lui, comptait une vraie séance.

**👉 Les 4 nombres qui referment la question** (à relever une seule fois) : la **durée** saisie dans
l'app · le **type** choisi · l'**intensité** choisie · et ce qu'affichait le **tapis** (vitesse,
pente, distance). Avec ça, la cause est identifiée en une minute au lieu d'être supposée.

## 12.6 ✅ LA DIRECTION — les paramètres physiques d'abord, la FC seulement après

C'est la correction n°3 de GPT (11/08), et mes mesures y mènent indépendamment :

> **Le moteur cardio doit privilégier les paramètres physiques propres à la modalité, avant
> d'utiliser la fréquence cardiaque comme facteur de correction.**

Concrètement, par ordre de solidité décroissante :

1. **Tapis** — si vitesse (et pente) sont saisies : **équations ACSM**, publiées et vérifiables.
   `marche : VO₂ = 0,1×S + 1,8×S×G + 3,5` · `course : VO₂ = 0,2×S + 0,9×S×G + 3,5` (S en m/min,
   G en fraction), puis `MET = VO₂ / 3,5`. ⚠️ Limites à respecter : la formule de marche est validée
   ~3-6 km/h, celle de course au-delà de ~8 km/h ; entre les deux, zone floue.
2. **Vélo** — si les **watts** sont affichés, c'est la meilleure donnée de toutes (ACSM :
   `VO₂ = 10,8 × W / poids + 7`). Sinon, MET par palier.
3. **Rameur** — les watts aussi, quand l'ergomètre les donne.
4. **Elliptique, corde, autre** — pas d'équation validée : MET par palier, **et on le dit**.
5. **La FC** ne devient un correctif que si les 10 séances montrent qu'elle apporte quelque chose
   que durée + paramètres physiques n'apportent pas. **Pas avant.**

**⚠️ Et l'étiquette d'intensité ne disparaît pas** : c'est le repli quand la personne ne connaît ni
sa vitesse ni sa pente — ce qui sera le cas le plus fréquent. Mais alors l'app doit **le dire**
(estimation grossière) au lieu de rendre un nombre qui a l'air aussi précis que l'autre. *Le même
principe que les deux formules du métabolisme de base : on n'interdit pas l'approximation, on refuse
de la faire passer pour une mesure.*

## 12.7 📋 Le protocole de relevé — DEUX tableaux séparés (correction n°5 de GPT)

**Cardio** — un relevé par séance de cardio :

```
Date :            Type (tapis/vélo/rameur/elliptique) :
Durée :           Distance :        Vitesse :      Inclinaison :
Poids du jour :
kcal tapis :      kcal Garmin :     kcal Polar :   kcal Force Tracker :
FC moyenne :      FC max :
Intensité choisie dans l'app (léger/modéré/intense) :
```

**Musculation** — un relevé par séance de muscu :

```
Date :            Type (classique / squat-SDT / supersets) :
Durée réelle :    Nombre de séries :     Volume (kg) :
kcal Garmin :     kcal Polar :           kcal Force Tracker :
FC moyenne :      FC max :
```

**10 séances** (et non 3 — correction n°5 de GPT : 3 ne détectent qu'une aberration grossière).

## 12.8 ⚠️ La H10 n'est pas une vérité calorique (correction n°4 de GPT)

La Polar H10 est la **meilleure source de fréquence cardiaque disponible pour ces tests** — pas une
référence de calories. **FC ≠ calories** : le chiffre de calories affiché par Polar sort de
l'algorithme de Polar, pas du capteur. Aucune des quatre sources n'est une vérité ; le relevé sert à
mesurer leur **dispersion** et à repérer les aberrations, pas à couronner un gagnant. Ne jamais faire
la moyenne des quatre.

## 12.9 Sources ajoutées

- **ACSM's Guidelines for Exercise Testing and Prescription** — équations métaboliques (marche,
  course, ergocycle, stepper) : https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription
- **ACSM Metabolic Equations (résumé et domaines de validité)** —
  https://www.ncbi.nlm.nih.gov/books/NBK499824/

---

# 13. 📚 LA SOURCE « TOUT POUR MA SANTÉ » — et l'idée qui vaut plus que ses chiffres (12/08/2026)

> Michel apporte la page, GPT la relit. **Elle entre au dossier des sources — mais comme méthode
> À METTRE EN COMPÉTITION, pas comme nouvelle vérité.** Décision de Michel, reprise telle quelle.
> ⚠️ Je n'ai pas pu ouvrir la page moi-même (le domaine est bloqué par le proxy réseau de
> l'environnement) : les chiffres ci-dessous viennent de Michel et de GPT.

## 13.1 Ce qu'elle donne : 4 niveaux, en kcal/minute

| Type de séance | kcal/min à 80 kg | MET équivalent | à 85 kg |
|---|---:|---:|---:|
| musculation légère / repos longs | 4 | ≈ 3,0 | 4,25 |
| **hypertrophie classique** | **7** | ≈ 5,25 | **7,44** |
| musculation intense / repos courts | 10 | ≈ 7,5 | 10,63 |
| circuit / HIIT / CrossFit | 14 | ≈ 10,5 | 14,88 |

Facteurs cités : intensité · volume · poids · charge · vitesse d'exécution · niveau d'expérience ·
**répartition effort/repos**.

**Convergence avec le Compendium** (3,5 / 5,0 / 5,8 / 6,0-8,0) : les deux barèmes se recouvrent sur
les trois premiers niveaux. Deux sources indépendantes qui tombent au même endroit valent mieux
qu'une seule, même mieux référencée.

## 13.2 ⚠️ Pourquoi elle ne devient PAS notre référence

**La page ne publie pas la formule qui produit 4 / 7 / 10 / 14.** Elle invoque « des études », ce qui
n'est pas une source qu'on peut refaire sur un coin de table — le critère que Michel a posé le 11/08
(*« des données sérieuses et scientifiquement prouvées ET prouvables »*) et qui nous avait fait
préférer Katch-McArdle au chiffre de la balance. L'auteur dit lui-même que ce sont des
approximations, et qu'une mesure exacte demande la VO₂ en laboratoire.

*Elle sert donc à corroborer un ordre de grandeur, pas à fixer une constante.*

## 13.3 ⭐⭐ L'IDÉE QUI VAUT PLUS QUE SES CHIFFRES : elle classe la SÉANCE, pas l'exercice

Repérée par GPT, et c'est la remarque la plus utile des deux relectures :

> *60 minutes de musculation avec 3 minutes de repos entre les séries n'est pas comparable à
> 60 minutes de supersets avec 30 secondes de repos.*

**Et c'est structurellement l'inverse de ce que fait Force Tracker.** Notre modèle attribue un MET
**par exercice** (6,5 bas du corps · 5,5 haut · 4,0 isolation · 8,0 haltérophilie), puis reconstruit
le repos autour. Autrement dit : il est **précis sur ce qui compte peu** et **muet sur ce qui compte
beaucoup**.

Que ce soit « ce qui compte peu » n'est pas une opinion — c'est le §3 de ce document : *la charge
soulevée ne change presque pas la dépense*, mesuré. La nature de l'exercice non plus, à volume égal.
Ce qui déplace vraiment le total, c'est la **densité** de la séance.

**Notre granularité est au mauvais endroit.**

## 13.4 La densité — et pourquoi elle règle AUSSI l'objection de Michel

Michel, le 12/08 : *« si la personne n'arrête pas sa séance les calories continuent de monter ; ça
m'arrive de prendre plus de temps de récupération »*. C'est l'objection qui tue « MET × durée
réelle ».

**La densité y répond toute seule** :

    densité = nombre de séries validées ÷ durée réelle de la séance

Un repos rallongé **fait baisser la densité**, donc fait baisser le rythme de dépense — le total ne
s'envole pas, il se **tasse**. Le modèle est auto-correcteur contre le mode de panne exact que
Michel a identifié, là où « MET × durée » l'amplifie.

Correspondance avec les 4 niveaux de l'article (à valider sur les relevés) :

| minutes par série | densité | niveau probable |
|---|---:|---|
| > 4 min | < 0,25 | repos longs |
| ~2,5 à 4 min | 0,25-0,40 | hypertrophie classique |
| ~1,5 à 2,5 min | 0,40-0,65 | intense / repos courts |
| < 1,5 min | > 0,65 | circuit / supersets |

**Michel est mesuré à 3,0 min/série → 0,33 → « hypertrophie classique »**, ce qui est exactement la
description de son entraînement. Le classement tombe juste sans qu'on ait rien à lui demander.

## 13.5 ⚠️ Le préalable technique, sinon rien de tout ça ne tient

La densité se calcule aujourd'hui (`séries ÷ sess.duration`), **mais elle hérite de la fragilité de
`sess.duration`** : un « Terminer » oublié gonfle la durée, donc écrase la densité, donc sous-estime
la séance.

**Le correctif est le même que pour l'objection de Michel : horodater chaque série** (`doneAt` dans
`toggleSet`, log.js). On calcule alors la fenêtre de la **première à la dernière série validée**, en
**plafonnant chaque écart** — et un « Terminer » oublié n'a plus aucun effet, puisque l'horloge
s'arrête à la dernière série et non au bouton.

**Sans cet horodatage, aucune des trois approches ci-dessous n'est mesurable proprement.** C'est le
premier geste de code du chantier, avant tout choix de barème (R8 : un modèle ne compense jamais une
donnée absente).

> ### ✅ FAIT — ft-v835 (12/08/2026)
> `toggleSet` pose `at` = la lecture du chrono en secondes (pauses exclues, même horloge que
> `sess.duration`). `_dureeEffective(session)` en tire `{n, spanSec, actifSec, coupeSec, plafondSec,
> densite}` — fenêtre 1ʳᵉ→dernière série, chaque écart plafonné à `max(5 min, 2× le repos réglé)`.
> **Vérifié** : un « Terminer » oublié 2 h ne change rien · 3 interruptions de 20 min ramènent
> 117 min bruts à 63 min effectifs · une séance sans horodatage répond `null`, jamais un chiffre.
> **Aucun calcul de calories n'a bougé** — un témoin le fige. Visible dans le détail d'une séance.
> Coût de stockage mesuré : **+13,8 %** par séance (+283 Ko au plafond de 1500 séances).
>
> ⏭️ **Il faut maintenant des séances RÉELLES** : les valeurs ci-dessus sont produites sur des
> séries simulées. Le protocole des 10 séances (§12.7) commence donc à la première séance faite
> avec ft-v835 — les séances antérieures n'ont aucun horodatage et ne peuvent pas y participer.

## 13.6 Les 3 approches à départager sur les 10 séances

| | méthode | ce qu'elle vaut |
|---|---|---|
| **A — Compendium** | 3,5 / 5,0 / 5,8 / 6,0 MET × poids × durée | la mieux référencée · granularité par exercice, donc au mauvais endroit |
| **B — Tout pour ma santé** | 4 / 7 / 10 / 14 kcal/min à 80 kg, par TYPE de séance | classe la séance (juste) · **formule non publiée** |
| **C — hybride Force Tracker** | durée réelle **plafonnée** + **densité mesurée** + poids + (FC plus tard) | la seule qui n'exige rien de la personne · à valider |

**L'approche C ne demande aucune saisie** : la densité se déduit des séries et du chrono, que l'app
possède déjà. C'est ce qui la distingue de A et B, qui supposent toutes deux qu'on sache **classer**
la séance — soit à la main, soit par une règle qu'on aurait inventée.

**Le protocole ne change pas** : 10 séances relevées (§12.7), puis on regarde laquelle des trois est
la moins aberrante. On ne choisit pas avant d'avoir mesuré.

## 13.7 Ce qu'elle confirme sur le CARDIO

La page emploie, pour la marche, **poids + sexe + durée + vitesse + inclinaison**, et pour la course
sur plat **distance × poids**. C'est exactement la direction du §12.6 : *les paramètres physiques
propres à la modalité d'abord, le MET générique en dernier recours*. Troisième source indépendante
à y arriver.

⚠️ **`distance × poids` mérite d'être notée pour ce qu'elle est** : une approximation bien connue
(courir 1 km coûte ≈ 1 kcal par kg, quelle que soit l'allure sur le plat). Elle est **robuste** et
demande une seule donnée — mais elle ignore la pente, là où l'équation ACSM la prend. À comparer,
pas à substituer.

## 13.8 Source

- **Tout pour ma santé — Calories brûlées pendant le sport : tableau et calculateur**
  https://toutpourmasante.fr/calories-brulees-sport/
  *(apportée par Michel le 12/08/2026 · relue par GPT · statut : méthode en compétition, pas
  référence)*



---

## 14. 📓 LE RELEVÉ — séance 1 sur 10 (13/08/2026)

Première mesure du protocole §12.7, notée par Michel dans ses notes le soir même.

| | Machine | Montre (Garmin) | Force Tracker | Écart app / montre |
|---|---|---|---|---|
| **Cardio** vélo elliptique | 67 kcal | 55 kcal | *(non relevé)* | — |
| **Musculation** | — | **346 kcal** | **245 kcal** | **−29 %** |

### Points Garmin de l'historique (donnés par Michel le 13/08, à compléter)

⚠️ **Demi-paires** : la valeur Force Tracker de la même séance manque encore. Un chiffre de montre
seul ne dit rien — c'est l'ÉCART qui nous intéresse. À compléter depuis Progrès → historique (`🔥 … kcal`).

| Date | Garmin | Force Tracker | Écart |
|---|---|---|---|
| 13/08 (muscu) | 346 | 245 | **−29 %** |
| **10/08** | **420** (1 h 31) | **248** | **−41 %** |
| **08/08** | **419** (1 h 11) | **248** | **−41 %** |

#### ⭐⭐⭐ SIX SÉANCES (14/08) — le tableau complet, et il ne laisse plus de doute

Michel a déroulé son historique Garmin en face de celui de l'app. `MET` = kcal / (84 kg × heures).

| Date | Garmin | Durée réelle | MET Garmin | App | Durée app | **MET app** | ratio |
|---|---|---|---|---|---|---|---|
| 05/08 | 480 | 2 h 00 | 2,86 | **231** | 2 h 20 | **1,18** | 0,48 |
| 03/08 | 428 | 1 h 50 | 2,78 | **261** | 2 h 20 | **1,33** | 0,61 |
| 02/08 | 458 | 1 h 23 | 3,94 | **260** | 1 h 30 | **2,06** | 0,57 |
| 08/08 | 419 | 1 h 11 | 4,22 | **248** | 1 h 33 | **1,90** | 0,59 |
| 10/08 | 420 | 1 h 31 | 3,30 | **248** | 1 h 35 | **1,86** | 0,59 |
| 13/08 | 346 | — | — | **245** | — | — | 0,71 |

**① L'intensité créditée est physiologiquement absurde.** 1 MET = au repos allongé ; 1,3 = assis à un
bureau ; 2 = debout immobile. L'app crédite **1,18 à 2,06 MET** pour de la musculation lourde. Le
05/08, elle compte 2 h 20 d'entraînement comme à peine plus qu'une sieste. La Garmin, elle, reste
entre **2,78 et 4,22** — cohérent avec le Compendium (3,5 modéré, 6,0 vigoureux).

**② Le total de l'app est INDÉPENDANT de la durée.** La preuve tient en deux lignes :
**2 h 20 → 231 kcal** contre **1 h 30 → 260 kcal**. *La séance la plus longue rapporte moins.*
Sur les six, l'app varie de **12 %** quand la réalité varie de **32 %**, et pas dans le même sens.

**③ Le mécanisme est visible** : plus la séance est longue, plus le MET crédité s'effondre (1,18 à
2 h 20 · 2,06 à 1 h 30). La durée reconstruite depuis le **nombre de séries** ne bouge presque pas ;
l'écart avec le temps réel se creuse donc à mesure que la séance s'allonge.

**④ Aucun coefficient ne marchera** : les ratios vont de **0,48 à 0,71**. ×1,7 collerait sur trois
séances et raterait les trois autres.

**⑤ Et le chrono brut n'est pas branchable non plus** : la durée de l'app dépasse celle de la Garmin de
**+4 · +7 · +20 · +22 · +30 min**. C'est l'objection de Michel, mesurée six fois. Seule la durée
**effective** (`_dureeEffective`, ft-v835 : fenêtre première→dernière série validée, temps morts
plafonnés) peut servir d'entrée — et elle n'existe que pour les séances à partir du 13/08.

#### ⭐⭐ LE VRAI RÉSULTAT : l'app rend une CONSTANTE, pas une mesure

C'est plus parlant que l'écart. Sur trois séances : **245 · 248 · 248**. L'app varie de **1 %**.
La Garmin, sur les mêmes séances : **346 · 419 · 420** — elle varie de **20 %**.

*L'app ne mesure pas la séance : elle produit une valeur quasi fixe.* Elle est dominée par une part
forfaitaire et par un nombre de séries qui se ressemble d'une fois sur l'autre ; l'intensité réelle,
la fréquence cardiaque et les vingt minutes supplémentaires du 10/08 ne l'atteignent pas.

**C'est la même famille que les défauts corrigés le 13/08** (la carte Santé qui affichait « serveur
OK » sans jamais interroger le serveur) : *un indicateur qui affiche quelque chose sans rien mesurer*.
En pire, même : 248 kcal est un chiffre **crédible**, donc rien n'alerte.

#### ⭐⭐⭐ CONFIRMÉ (14/08) : l'app CONNAÎT la durée, elle ne s'en sert pas

Les durées affichées par l'app pour ces séances (visibles depuis `ft-v849`) :

| Date | Garmin | App | Écart |
|---|---|---|---|
| 10/08 | 1 h 31 | **1 h 35** | +4 min |
| 08/08 | 1 h 11 | **1 h 33** | +22 min |

**Le 10, les deux sont d'accord à 4 minutes près.** `sess.duration` est donc juste : le chrono
mesure correctement. Ce n'est pas un problème de collecte.

**Le chiffre qui tranche** : 248 kcal pour 1 h 35 → **1,9 MET** (248 / (84 × 1,583)). C'est l'ordre de
grandeur de quelqu'un **debout, immobile**. Pour 95 minutes de squat. La Garmin, elle, est à **3,3 MET**
sur la même séance — et 3,3 appliqué à la durée que l'app connaît déjà donnerait **≈ 440 kcal**, soit
le chiffre de la montre.

**Conclusion : le calcul n'est pas à réinventer.** Il a la bonne durée d'un côté et une intensité
plausible de l'autre ; il ne les multiplie simplement pas ensemble — il passe par une durée
*reconstruite depuis les séries*, qui vaut environ trois fois moins.

#### ⚠️⚠️ MAIS LE 08/08 MONTRE POURQUOI ON NE PEUT PAS BRANCHER `duration` DIRECTEMENT

22 minutes d'écart ce jour-là. C'est très exactement l'objection posée par Michel **avant** qu'on
écrive la moindre ligne : *« si la personne n'arrête pas sa séance les calories continuent de monter ;
ça m'arrive de prendre plus de temps de récupération »*. Brancher `durée réelle × MET` gonflerait
cette séance de ~25 %.

C'est la raison d'être de `_dureeEffective()` (`ft-v835`) : fenêtre de la **première à la dernière
série validée** (le bouton « Terminer » n'entre pas dans le calcul) et chaque temps mort **plafonné**.
*Le 08/08 est la démonstration chiffrée que l'objection était fondée.*

⚠️ **Cette durée n'existe que pour les séances à partir du 13/08** — les précédentes n'ont pas
d'horodatage de séries, et on ne peut pas la recalculer rétroactivement. Les prochaines séances
donneront donc les 3 chiffres d'un coup : durée brute, durée effective, et calories.

#### ⚠️ Et un COEFFICIENT ne réparera pas ça

Les rapports app/montre valent **0,59 · 0,59 · 0,71**. Il n'existe pas de facteur unique. Multiplier
la sortie par 1,7 collerait sur deux séances et raterait la troisième — en figeant au passage les deux
erreurs qui se compensent (durée sous-estimée × MET trop élevé, voir ci-dessus).

**Ce qu'il faut réparer, c'est ce qui ENTRE dans le calcul** — d'abord la durée, maintenant qu'elle est
réellement mesurée (`ft-v835`). Ensuite seulement on regardera l'intensité.

⚠️ **Trois séances.** C'est une piste solide, pas une conclusion. Et le 13/08 comportait un cardio
enregistré, ce qui change la composition du total : les trois lignes ne sont pas strictement
comparables entre elles.

#### ⭐ Ce que les DURÉES révèlent, et c'est plus important que les totaux

**Presque les mêmes calories pour 20 minutes de plus** : 419 en 1 h 11, 420 en 1 h 31. Soit **5,9**
puis **4,6 kcal/min**. La Garmin ne fait donc pas « durée × intensité fixe » — c'est **cohérent avec un
calcul piloté par la fréquence cardiaque** : la séance du 10 était plus longue mais moins intense.
*Comparer deux totaux sans leurs durées ne veut rien dire.*

**Et la Garmin n'est PAS gonflée**, contrairement à ce qu'on pouvait craindre. Ramenés en MET à 84 kg :

- 08/08 → 419 / (84 × 1,183 h) = **4,2 MET**
- 10/08 → 420 / (84 × 1,517 h) = **3,3 MET**

Le Compendium donne 6,0 MET pour une musculation *vigoureuse* et 3,5 pour *modérée*. La Garmin est
donc **entre léger et modéré** — plutôt conservatrice. On ne peut pas expliquer l'écart en disant
« la montre exagère ».

#### ⚠️ L'hypothèse qui en découle : ce n'est pas un coefficient, c'est le TEMPS

Ses séances durent **71 et 91 minutes réelles**. Or `calcSessionCalories` **reconstruit** une durée
depuis les séries — de l'ordre de **24 minutes pour une séance de 50** (§12). On est sur un facteur
**≈ 3** sur le temps, pour un écart final de seulement −29 % sur le total.

**Deux erreurs qui se compensent à moitié** : une durée très sous-estimée, rattrapée par un MET
implicite trop élevé (3,18 mesuré au §12). C'est le pire des cas — ça tient « à peu près » tant que
les séances se ressemblent, et ça dérape dès qu'une séance sort du moule (longue et tranquille, ou
courte et intense). *Corriger par un coefficient global figerait les deux erreurs au lieu d'en
supprimer une.*

⭐ **Et on a maintenant de quoi trancher** : depuis `ft-v835`, chaque série validée porte l'heure du
chrono, donc `_dureeEffective()` rend la durée **mesurée**. Il devient possible de comparer la durée
réelle à celle que le calcul suppose — c'est cette comparaison-là qu'il faut faire en premier, avant
de toucher au moindre barème.

⚠️ **Trois séances. On ne conclut rien.** Hypothèse à vérifier, pas résultat.

### Ce qu'on peut déjà en dire — et ce qu'on ne peut PAS

⚠️ **Une séance ne prouve rien.** C'est un point, pas une tendance : on ne touche à aucun barème
avant d'en avoir dix. Noté ici pour ne pas le perdre, pas pour conclure.

**Ce qui frappe quand même** : sur la **musculation**, l'app est **29 % en dessous** de la montre.
C'est un écart nettement plus faible que celui relevé en juillet (tapis 101 · montre 89 · Polar 120 ·
**Force Tracker 57**, soit ~50 % de moins) — mais l'entrée de juillet mélangeait cardio et muscu, et
`ft-v834` a depuis retiré le double comptage de l'échauffement, qui faisait *monter* le total. **Les
deux chiffres ne sont donc pas comparables** ; c'est ce relevé-ci qui fait foi désormais.

**Sur le cardio, machine 67 contre montre 55** : la machine annonce **22 % de plus** que la montre.
Rien d'anormal — les machines de salle ne connaissent ni le poids réel ni la fréquence cardiaque, et
surestiment classiquement. À garder en tête : *la machine n'est pas une référence*, la montre l'est
davantage (elle a la FC et le poids).

### ⭐ L'occasion à ne pas rater : l'historique Garmin

Michel : *« j'ai tout l'historique de Garmin »*.

**C'est potentiellement bien mieux que le protocole des 10 séances.** Celui-ci demande d'attendre dix
entraînements, à raison de quelques-uns par semaine — donc des semaines. L'historique Garmin, lui,
contient **déjà** des dizaines de séances, avec leurs calories, leur durée et leur FC.

Croisé avec les séances correspondantes de Force Tracker (mêmes dates), il donnerait **immédiatement**
la comparaison sur un grand nombre de points, au lieu d'un par un. C'est aussi ce qui permettrait de
départager les 3 approches du §13.6 sur des données réelles plutôt que sur une poignée.

**À faire** : voir ce que Garmin Connect permet d'exporter (CSV des activités), et si le rapprochement
par date est fiable. ⚠️ Ne rien construire avant d'avoir regardé le format réel du fichier.

### ⭐ La Polar : c'est la CEINTURE qui est morte, pas le capteur — et ça la rend précieuse

**⚠️ Correction d'une conclusion trop rapide.** Michel a d'abord dit *« ma Polar déconne »*, et j'en ai
conclu que l'appareil n'était plus fiable — donc à retirer des références. **Faux.** Il a précisé :
*« c'est la ceinture qui déconne, pas le capteur »*. Ce n'est donc pas un appareil douteux, c'est une
**pièce d'usure** (la sangle élastique) à remplacer — quelques euros, et la mesure redevient valide.
*Un consommable usé n'est pas un instrument défaillant* : jeter l'un pour l'autre aurait écarté la
meilleure source qu'on ait.

**Et c'est bien la MEILLEURE, pas une de plus.** Une ceinture pectorale mesure la fréquence cardiaque
par voie **électrique** (comme un ECG) ; une montre la déduit optiquement au poignet. En musculation,
l'optique est justement mise en défaut : serrage de la barre, flexion du poignet, contractions —
autant de sources d'erreur *sur l'exercice qui nous intéresse le plus*, celui où le modèle actuel est
le plus faible (−29 % sur cette séance).

**Conséquence pratique** : remplacer la sangle de la Polar est probablement **l'action la plus rentable**
de tout ce chantier. Elle donnerait une référence de FC solide là où la Garmin est la moins sûre.
⚠️ À vérifier avant d'en dépendre : que la Polar exporte bien ses séances, et que ses horodatages
permettent de la rapprocher des séances de Force Tracker.
