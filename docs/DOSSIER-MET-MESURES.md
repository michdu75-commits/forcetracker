# 🔥 Dossier MET — ce que 42 séances mesurées ont appris

> **Créé le 15/08/2026.** Dossier **autonome**, destiné à l'application MET indépendante de Michel
> (et à tout outil extérieur qui devra calculer des calories de musculation). Il ne suppose aucune
> connaissance de Force Tracker : tout ce qui est nécessaire est ici.
>
> **Il complète `docs/MOTEUR-MET-A-COLLER.md`**, qui porte le *code* du moteur. Celui-ci porte les
> **mesures**, les **pièges** et les **constantes**. *Le code dit comment ; ce dossier dit pourquoi,
> et surtout ce qui ne marche pas.*
>
> ⚠️ **Chaque chiffre de ce document est mesuré, pas estimé.** Sources : 46 séances de musculation
> exportées d'une montre Garmin (mai → août 2026) et 31 séances enregistrées dans l'application,
> croisées date par date. Quand une valeur est un jugement, c'est écrit.

---

## 1. La formule, et les trois choses qu'elle demande

```
kcal = MET × 3,5 × poids(kg) / 200 × durée(min)
```

Soit, pour un homme de **84,95 kg** : **1,487 kcal par minute et par point de MET**.

Elle a l'air simple. Elle demande trois choses, et **deux d'entre elles sont des pièges** :

| Ce qu'il faut | Difficulté | Où ça casse |
|---|---|---|
| Le poids | aucune | — |
| Le **MET** | modérée | quelle valeur, et pour quoi exactement ? (§2) |
| La **durée** | **c'est là que tout se joue** | §4 — la source d'erreur n°1, et de loin |

---

## 2. Le MET : quelle valeur, et surtout pour QUOI

### La valeur publiée

**Compendium of Physical Activities 2024**, entrée *« resistance training, multiple exercises,
8-15 repetitions at varied resistance », effort modéré* : **MET 3,5**.

### ⚠️ Le piège qui fausse tout : ce MET couvre la séance ENTIÈRE, repos compris

C'est l'erreur la plus coûteuse rencontrée, et elle est invisible : on applique un MET « par
exercice » (un squat vaut plus qu'une extension de mollets) puis on le multiplie par la durée
**totale** de la séance. **On compte alors l'intensité de l'effort pendant les temps de repos.**

Mesuré : sur une séance réelle, le MET par exercice × la durée réelle donne **+16 %** d'erreur
médiane, avec des séances à +100 %.

> **Règle** : un MET *par exercice* se multiplie par le **temps actif**. Un MET *de séance* (3,5)
> se multiplie par la **durée totale**. Les mélanger produit un résultat systématiquement trop haut.

### ✅ La validation indépendante

Le 3,5 a été **choisi dans le Compendium avant d'avoir la moindre donnée personnelle**. Confronté
ensuite à 42 séances mesurées à la montre :

| | MET implicite |
|---|---|
| **Médiane mesurée** | **3,49** |
| Moyenne | 3,55 |
| Écart-type | 0,68 |
| Plage | 2,38 → 5,17 |

Deux méthodes qui ne se parlent pas — une table publiée issue de calorimétrie indirecte, et un
relevé cardiaque sur trois mois — tombent au même endroit. **3,5 est un bon centre.**

⚠️ **Mais l'écart-type de 0,68 n'est pas du bruit** : une séance donnée peut réellement valoir 2,4
ou 5,2. Un MET fixe donne un bon **total sur la période** et une **valeur médiocre séance par
séance**. Le dire à l'utilisateur est plus honnête que de prétendre à une précision qu'on n'a pas.

---

## 3. ⛔ Ne JAMAIS caler un modèle sur les calories d'une montre

C'est la conclusion la plus importante du dossier, et elle est contre-intuitive.

### Ce que dit la littérature

| Ce que mesure la montre | Fiabilité contre référence |
|---|---|
| **Fréquence cardiaque** | **excellente** — r = 0,64 à 0,97 · ICC > 0,94 · ±10 bpm |
| Calories en **endurance** | correctes |
| **Calories en musculation** | **r = 0,10 à 0,34 · ICC < 0,45** |

Contre calorimétrie indirecte, les calories d'un bracelet **en résistance** corrèlent à **0,10-0,34**
— à peine mieux que le hasard. Les algorithmes reposent sur la réserve de fréquence cardiaque et une
estimation de VO₂ **calibrées sur de l'aérobie continue**. En musculation, l'apnée, l'effort
isométrique et la manœuvre de Valsalva font monter le cœur **sans consommation d'oxygène
proportionnelle**. Surestimation typique : **+32 %**, et **> 45 %** en résistance ou HIIT.

### La démonstration, sur les données

Corrélation entre la **fréquence cardiaque moyenne** et les **kcal/min** de la montre, sur 42 séances :

```
r = 0,968          kcal/min ≈ 0,0959 × FCmoy − 5,32
```

**r = 0,97.** Autrement dit, le chiffre de calories de la montre est **presque entièrement une
fonction de la fréquence cardiaque moyenne**. Ce n'est pas une mesure d'énergie : c'est une
conversion du cardio, avec tous ses biais.

### 👉 Ce qu'il faut en faire

> **On prend de chaque source ce qu'elle sait faire.**
> La montre mesure le **TEMPS** parfaitement — c'est une horloge. On lui prend la durée.
> L'intensité vient d'une **table publiée**. On ne copie jamais ses calories.

Une montre reste un **contrôle** utile — un désaccord permanent signale un problème. Elle n'est
jamais la **source**.

---

## 4. ⭐ La durée : la vraie source d'erreur, et personne ne la soupçonne

L'application mesurée ici affichait **−35 % en médiane** par rapport à la montre (plage −76 % à +4 %).
Le réflexe est d'accuser le MET. **C'est faux, et la mesure le prouve :**

| | MET |
|---|---|
| Modèle par exercice de l'app (médiane, 31 séances) | **3,11** |
| Valeur publiée | 3,5 |
| Mesuré à la montre | 3,49 |

**L'intensité était à 12 %. Le trou était dans la durée.** Un exemple : une séance réellement longue
de **1 h 51** était comptée **28 minutes**, parce que la durée était **déduite du nombre de séries**
au lieu d'être mesurée.

> **Règle** : avant de toucher au MET, vérifier **d'où vient la durée**. Une durée déduite d'un
> compteur de séries est une invention, pas une mesure.

### La seule durée fiable : l'horodatage de chaque série

Enregistrer, à chaque série validée, le **nombre de secondes écoulées depuis le début**. Cela donne :
la durée réelle, la durée de chaque repos, la densité (temps actif / temps total), et la capacité de
détecter les anomalies (§5).

Vérification : sur la première séance ainsi horodatée, l'app a compté **63 min** là où la montre en a
mesuré **64,4**. **2 % d'écart** — le problème disparaît.

### ⚠️ Le plafond de repos adaptatif

Un repos ne doit pas être compté sans limite : un appel téléphonique de 20 minutes n'est pas de
l'entraînement. Plafonner chaque intervalle à **2 × la médiane des repos de la séance** fonctionne :
sur une séance réelle de 29 séries, un seul intervalle a été écrêté — les 5,6 minutes de changement
de poste entre deux exercices. Tout le reste est passé intact.

⚠️ **Un plafond FIXE ne marche pas** : 3 minutes de repos sur un squat lourd sont normales, 3 minutes
entre deux séries d'abdos ne le sont pas. Le plafond doit venir **de la séance elle-même**.

---

## 5. Détecter une durée fausse : le temps par série

Une durée peut être fausse de **trois** façons, et elles ne se ressemblent pas :

| Cause | Symptôme | Cas réel |
|---|---|---|
| Le chrono **continue** de tourner | durée énorme | 4 h 14 pour 14 séries |
| Le chrono **démarre en retard** | durée trop courte | 124 min affichées, 47 réelles |
| La séance est **rejouée** après une perte | durée = temps de **saisie** | 19 min pour 16 séries |

**Le même repère les trahit toutes les trois : les minutes par série validée.**

### Les seuils, et comment ils ont été fixés

Médiane de référence : **4,5 min par série** (plage réelle 1,2 → 18,2).

| Règle | Seuil | Justification |
|---|---|---|
| Trop long | **> 10 min/série** | vérifié contre la montre : attrape 254 min (192 réelles) **et** 124 min (47 réelles), **épargne** 140 min (111 réelles), qui était une vraie longue séance. Un seuil à 9 accusait à tort ; un seuil à 12 laissait passer un vrai cas. |
| Trop long, absolu | **> 3 h** | au-delà, ce n'est plus une séance |
| Trop court | **< 1,5 min/série**, à partir de 6 séries | **plancher physique** : une série plus le repos minimal ne descend pas sous 1 min 30. Vérifié : la séance la plus dense mesurée (2,4 min/série) est épargnée. |

⚠️ **Le seuil haut est une calibration** (il vient des données) ; **le seuil bas est physique** (il
vient de ce qu'un corps peut faire). Le second est transposable à n'importe qui, le premier non.

### Et ensuite : signaler, ne pas corriger

> **On ne remplace jamais une mesure douteuse par une estimation inventée.**

On marque la valeur (couleur + ⚠️), on **montre le calcul** — *« 19 min pour 16 séries, soit 1,2 min
par série »* — et on laisse la personne saisir la vraie durée, ou l'effacer. Une durée saisie à la
main est ensuite **crue sur parole** et n'est plus jamais remise en cause.

⚠️ Et il faut **nommer la possibilité au bon moment** : la capacité d'effacer une durée existait bien
avant qu'on pense à la proposer là où elle sert. *Une capacité qu'on ne nomme pas au moment utile
n'existe pas.*

---

## 6. Corriger un historique déjà enregistré

Quatre approches ont été mesurées contre 27 séances relevées à la montre. **La plus simple gagne, et
largement :**

| Approche | Écart médian | Séances à ±20 % |
|---|---|---|
| Ne rien faire | −35 % | 6/27 |
| Chrono stocké × MET 3,5 | +29 % | *(une séance à +217 %)* |
| MET par exercice × durée réelle | +16 % | — |
| Durée = 3 min × nb de séries × MET 3,5 | −3 % | 14/27 |
| **Valeur existante × 1,55** | **−2,7 %** | **18/27** |

**Pourquoi la version bête gagne** : la valeur existante encode déjà le mélange d'exercices et le
volume. Elle n'est pas *fausse*, elle est **mal mise à l'échelle**. Chaque formule plus savante
rajoutait du bruit sans corriger le biais.

⚠️ **Le facteur 1,55 est une calibration PERSONNELLE** (médiane de 27 séances d'une seule personne :
juin 1,54 · juillet 1,36 · août 1,69). Ce n'est pas une constante physiologique. Elle est réservée à
un usage privé tant qu'on n'a pas de mesures d'autres personnes.

### Les trois garde-fous, non négociables

1. **Sauvegarder la valeur d'origine**, écrite **une seule fois** — un deuxième passage ne doit pas
   cumuler.
2. **Une annulation** qui rend un historique **identique**, sans champ résiduel. À vérifier par un
   aller-retour sur des données réelles, pas en théorie.
3. **L'annulation ne doit pas être derrière la même serrure que l'action.** Si le droit d'accès se
   perd entre les deux, on garde des données modifiées sans moyen de revenir. *Remettre une donnée
   dans son état d'origine n'est jamais risqué ; l'empêcher, si.*

⚠️ **Ne jamais recalculer une séance dont la durée est déjà réelle.** Mesuré : les séances horodatées
ne demandent qu'un × 1,13 contre × 1,54 pour les autres — les recaler les **éloignerait** de la vérité.

---

## 7. Le cardio, à part

Le cardio se calcule séparément et **ne doit pas être recalé** : ses minutes sont saisies par la
personne, donc déjà justes. Sur une séance mixte, la formule est :

```
total = (musculation recalée) + (cardio inchangé)
```

Mélanger les deux dans un même facteur fausse la partie qui était correcte.

---

## 8. Constantes utiles, mesurées

### Pas de charge par matériel

Une charge que la salle ne possède pas fait perdre du temps au râtelier. Les pas ci-dessous viennent
de **31 séances réelles** (toutes les charges d'haltères à deux bras y sont des multiples de 4) :

| Matériel | Pas | Détail |
|---|---|---|
| Barre | **5 kg** | 2,5 kg par côté — évite de chercher des disques de 1,25 |
| Haltères, deux bras | **4 kg** | 2 kg par haltère, **additionnés** |
| Haltère, un bras | **2 kg** | |
| Machine / poulie | **5 kg** | crans usuels |
| Élastique / TRX | 2,5 kg | pas de disques |

⚠️ Pour un échauffement, **arrondir vers le bas** (plus léger n'est jamais un risque) — **sauf le
dernier palier**, arrondi au plus proche : tout arrondir vers le bas creuse l'écart avec la charge de
travail et oblige à ajouter un palier, soit l'inverse du but.

### Repos observés

| Type de série | Repos réel |
|---|---|
| Lourd (≤ 5 reps) | 3 à 5 min |
| Normal (6-12 reps) | 1 min 15 à 1 min 45 |
| Abdos / isolation légère | 30 s à 1 min |

⚠️ **La clé est le nombre de RÉPÉTITIONS, pas le nom de l'exercice.** Un squat à 2 min de repos
existe ; c'est le schéma de séries (3×3, 5×3, 5×5) qui dit la phase, pas l'intitulé.

### Rythme global

**Médiane : 4,5 min par série** — mais de 2,2 (séance dense avec échauffements) à 7,4 (jambes
lourdes). ⚠️ **Un chiffre unique de min/série ne suffit pas pour planifier une durée** : les séries
d'échauffement vont vite, les séries lourdes non. Compter 29 séries à 4,6 min donne 133 minutes là où
la réalité est 64.

---

## 9. Ce qu'on ne sait toujours pas

Écrit ici pour que personne ne le redécouvre en croyant que c'est résolu :

- **La variation d'une séance à l'autre est réelle et non expliquée** (MET 2,38 → 5,17). La densité
  (temps actif / temps total) est une piste — deux séances mesurées vont dans le bon sens (densité
  0,48 → MET 3,65 ; densité 0,27 → MET 2,69) — mais **deux points ne font pas un modèle**. Il en faut
  6 à 8.
- **Aucune de ces données n'est de la calorimétrie indirecte.** La montre est une référence de
  travail, pas une vérité. L'accord entre elle et le Compendium est rassurant, il n'est pas une preuve.
- **Tout vient d'une seule personne** (homme, 48 ans, 84,95 kg, 180 cm). Rien ne dit que les facteurs
  se transposent.

---

## 10. Les six réflexes, en une page

1. **La durée avant le MET.** Vérifier d'où elle vient avant de soupçonner l'intensité.
2. **Un MET de séance se multiplie par la durée totale ; un MET d'exercice par le temps actif.** Ne
   jamais croiser les deux.
3. **Prendre l'horloge de la montre, jamais ses calories.**
4. **Mesurer avant de choisir un seuil.** Chaque seuil de ce dossier a été vérifié contre des données
   réelles ; plusieurs auraient été faux si on les avait posés au jugé.
5. **Signaler, ne pas corriger.** Une mesure douteuse remplacée par une estimation inventée est pire
   que la mesure douteuse.
6. **La version simple gagne souvent.** Quatre approches mesurées ici : la plus bête est la plus juste.

---

## 11. Sources

**Valeurs de référence**
- Compendium of Physical Activities 2024 — *resistance training, multiple exercises, moderate effort*, MET 3,5

**Fiabilité des objets connectés**
- [Comparative Validity of Smartwatch-Derived Heart Rate and Energy Expenditure During Endurance and Resistance Exercise](https://www.mdpi.com/1424-8220/26/8/2526) — MDPI Sensors
- [6 ways your smartwatch is lying to you, according to science](https://theconversation.com/6-ways-your-smartwatch-is-lying-to-you-according-to-science-279851) — The Conversation
- [Accuracy of Heart Rate Watches: Implications for Weight Management](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4883747/) — PMC

**Montée en charge** *(pour la partie échauffement)*
- [Ramp-Up Sets](https://barbend.com/ramp-up-sets/) — BarBend · [Ramp Up Your Major Lifts](https://drjohnrusin.com/ramp-up-performance-prevention/) — Dr John Rusin
- [Compound First, Accessory Second](https://risingsuncommunityfitness.com/gym-news/compound-first-accessory-second-the-smart-way-to-build-a-complete-body/) — Rising Sun Fitness

**Données brutes** — 46 activités Musculation Garmin (04/05 → 15/08/2026) · 31 séances Force Tracker
(12/06 → 15/08/2026), croisées par date. Le détail des relevés vit dans `docs/CALORIES-SOURCES.md`.
