<!-- ARCHIVÉ TEL QUEL le 11/08/2026 — synthèse écrite par ChatGPT à la demande de Michel,
     dans le modèle « équipe IA » (README-IA.md) : Michel décide, Claude construit, GPT challenge.
     ⚠️ NE PAS RÉÉCRIRE CE DOCUMENT. Les corrections et les décisions vont dans le bloc ci-dessous
     et dans docs/CALORIES-SOURCES.md (le dossier sourcé, côté Claude). -->

# ⚠️ LU ET ANNOTÉ — ce qu'on en retient, et l'erreur qu'il contient

> **Ce bloc est de Claude (11/08/2026). Le document original de ChatGPT commence plus bas, intact.**

**✅ CE QU'IL APPORTE, et qui a directement changé le code :**
- **§8 — kcal brutes vs kcal actives.** Point majeur, il avait raison et je l'avais raté : `MET ×
  poids × durée` contient déjà le métabolisme de repos. L'ajouter au TDEE compte cette part **deux
  fois**. À traiter avant tout le reste.
- **§4 — la valeur 5,0 MET** (squat/soulevé de terre) que j'avais manquée dans le Compendium.
- **§7 — pas de forfait EPOC.** Accepté : +50 kcal avec ±31 d'écart-type, c'est du bruit habillé en
  précision.
- **§9 et §22 — afficher une FOURCHETTE**, jamais un nombre unique. Accepté.
- **§19 — 10 séances plutôt que 3.** Il a raison, 3 ne montrent qu'une aberration grossière.
- **§16 — Android/Web Bluetooth** : exact, et sans intérêt immédiat (Michel est sur iPhone).

**⛔ L'ERREUR À CORRIGER — §13 et §24 : « le métabolisme basal / composition corporelle est déjà
pris en charge dans Force Tracker via les données de balance ».**
**C'était FAUX au moment où il l'a écrit.** L'app *stockait* les données de la balance, les
*affichait*, les *envoyait à Milo* — et n'en utilisait **aucune** dans le calcul. `calcBMR()` ne
connaissait que le poids total (Mifflin-St Jeor). Michel l'a demandé le soir même : *« on tient
compte dans l'appli de la valeur de base du métabolisme de la balance ? »* — et la réponse honnête
était non.
**⭐ C'est le piège le plus courant de tout ce projet** : une donnée *stockée* passe pour une donnée
*utilisée*. C'est **R5** (l'audit à l'envers : *où cette information ressort-elle concrètement ?*)
et **R4** (l'information doit descendre jusqu'à la donnée). GPT ne pouvait pas le savoir — il lit
une description, pas le code — mais ça montre pourquoi **une revue extérieure ne remplace jamais une
vérification dans le code** (**R28** : une limite non vérifiée devient une règle silencieuse ; ici
c'était l'inverse, une capacité supposée acquise).
**→ Corrigé depuis** (ft-v833) : la masse maigre mesurée alimente le calcul via **Katch-McArdle**
(formule publiée), avec refus explicite si le bilan a plus de 90 jours ou si le poids a bougé de plus
de 5 %. Écart mesuré : **~180 kcal/jour** sur un gabarit musclé. Ce n'était donc pas « déjà pris en
charge » **ni** « pas la priorité » : c'était le plus gros poste de la dépense (60-70 %) et le seul
qu'on pouvait resserrer sans montre, sans ceinture et sans API.

**🔜 CE QUI RESTE À FAIRE, dans son ordre (§23), et il est bon :**
1. le **cardio** d'abord — c'est là que l'écart est le plus criant : sur une même séance, tapis 101 ·
   montre 89 · Polar 120 · **Force Tracker 57**. On est à la moitié des autres, sur la partie où les
   équations sont pourtant les mieux établies (marche/course/vélo). **C'est le prochain chantier.**
2. la **musculation** : durée réelle mesurée + classification MET, sans reconstruire les repos ;
3. les **10 séances** de relevé ;
4. la **FC** seulement si elle apporte quelque chose que durée + type n'apportent pas.

---

# Force Tracker — Synthèse de travail sur l'estimation des calories

> Document destiné à Claude pour poursuivre la réflexion sur le calcul des calories de Force Tracker.
> Objectif : garder une trace claire de ce qui a été décidé, des hypothèses à tester et des pistes techniques.
> Important : ne pas transformer les hypothèses en faits scientifiques sans validation.

---

## 1. Problème de départ

Force Tracker estime actuellement les calories d'une séance de musculation à partir d'un modèle qui reconstruit artificiellement la durée :

```text
kcal = MET_exercice × poids × (nb_séries × 30 s)
     + 2,0 MET × poids × (nb_séries−1) × repos_réglé
     + 3,5 MET × poids × 10 min
```

avec :

- 6,5 MET pour le bas du corps ;
- 5,5 MET pour le haut du corps ;
- 4,0 MET pour l'isolation ;
- 30 secondes forfaitaires par série ;
- repos calculé à partir du repos réglé ;
- +10 minutes d'échauffement forfaitaires.

Ce modèle pose plusieurs problèmes :

- il n'utilise pas la durée réelle mesurée ;
- il invente un échauffement de 10 minutes ;
- il reconstruit les temps de travail/repos ;
- la charge soulevée n'intervient pas ;
- deux séances très différentes peuvent produire des dépenses presque identiques ;
- le chiffre peut devenir artificiellement bas ou élevé selon la structure de la séance.

Exemple observé pour environ 84 kg :

- 60 min → environ 255 kcal ;
- 90 min → environ 361 kcal ;
- le MET moyen implicite est autour de 2,8.

---

# 2. Ce que dit actuellement la littérature / le Compendium

Le Compendium of Physical Activities 2024 fournit notamment des catégories de musculation autour de :

- **3,5 MET** : musculation avec plusieurs exercices, typiquement 8–15 répétitions, résistances variées ;
- **5,0 MET** : squat/deadlift, effort lent ou explosif ;
- **5,8 MET** : circuits / supersets de type circuit ;
- **6,0 MET** : musculation vigoureuse / effort intense.

Point important :

Les valeurs du Compendium sont des catégories d'activité. Il ne faut pas les présenter comme une équation permettant de calculer précisément les calories d'une séance individuelle.

Il faut également éviter d'affirmer trop catégoriquement que chaque valeur inclut explicitement tous les temps de repos de toutes les séances possibles. Le principe prudent est :

> utiliser la durée réelle correspondant au périmètre de l'activité et ne pas reconstruire artificiellement les pauses avec une deuxième formule MET.

Formule de base :

```text
kcal = MET × poids (kg) × durée (heures)
```

Mais cette formule reste une estimation.

---

# 3. Ce qui est considéré comme une bonne correction du modèle actuel

Pour une V1 :

1. utiliser la **durée réelle mesurée** ;
2. supprimer les 30 s forfaitaires par série ;
3. supprimer le calcul artificiel des repos ;
4. supprimer les 10 minutes d'échauffement inventées ;
5. sélectionner un MET correspondant au type réel de séance ;
6. afficher clairement qu'il s'agit d'une estimation.

La sélection des MET ne doit pas être présentée comme une science exacte.

---

# 4. Classification envisagée pour la musculation

Une classification plus cohérente serait :

| Type de séance | MET de référence |
|---|---:|
| Musculation classique | 3,5 |
| Séance dominante squat / soulevé de terre | 5,0 |
| Supersets / circuit | 5,8 |
| Musculation vigoureuse | 6,0 |

Le système peut utiliser les informations connues par Force Tracker pour classifier la séance :

- présence de supersets/circuits ;
- densité ;
- nombre de séries par minute ;
- proportion de polyarticulaires ;
- dominance squat/deadlift ;
- structure générale de la séance.

**Mais attention :**

Il n'existe pas, à notre connaissance actuelle, de méthode publiée et validée disant par exemple :

```text
X séries/minute = 5,8 MET
Y % de polyarticulaires = 6,0 MET
```

Donc cela doit être présenté comme une **heuristique de classification**, pas comme une équation physiologique validée.

---

# 5. La charge : ne pas forcément l'intégrer directement

Le fait que le modèle actuel donne le même résultat pour :

> 20 séries de squat à 40 kg

et

> 20 séries de squat à 130 kg

semble intuitivement problématique.

Mais cela ne signifie pas automatiquement qu'il faut créer une formule :

```text
calories = charge × répétitions × séries
```

La relation entre charge, travail mécanique et dépense énergétique dépend notamment de l'exercice.

Donc :

> la charge est une donnée intéressante, mais elle ne doit pas être transformée naïvement en calories.

Force Tracker possède néanmoins un avantage important : il connaît déjà :

- charge ;
- répétitions ;
- séries ;
- exercice ;
- durée ;
- repos ;
- type de série ;
- supersets/circuits ;
- groupe musculaire.

Ces données pourront éventuellement servir à un futur modèle empirique.

---

# 6. RPE

Le RPE est intéressant comme donnée complémentaire.

Il peut être pertinent pour caractériser l'intensité perçue de la séance.

Mais :

> **RPE ≠ calories**

Un RPE 9 sur un curl et un RPE 9 sur un squat lourd ne signifient pas nécessairement la même dépense énergétique.

Donc si RPE est ajouté :

- le demander simplement après la séance ;
- idéalement sous forme d'une note 1–10 ;
- l'utiliser comme variable secondaire / indicateur d'intensité ou de confiance ;
- ne pas convertir directement RPE en kcal.

---

# 7. EPOC

L'EPOC est réel, mais il ne faut pas ajouter automatiquement un forfait du type :

```text
+50 kcal
```

à chaque séance.

Une valeur de l'ordre de 50 kcal a été observée dans certaines conditions expérimentales, avec une variabilité importante.

Conclusion actuelle :

> ne pas intégrer un +50 kcal forfaitaire dans la V1.

Si l'EPOC est un jour intégré, il devrait être traité comme une composante probabiliste / incertaine, pas comme une constante.

---

# 8. Très important : kcal brutes vs kcal actives

Il faut distinguer :

### Dépense totale pendant la séance

Ce que donne approximativement :

```text
MET × poids × durée
```

Cette valeur inclut la dépense correspondant au métabolisme de repos pendant cette période.

### Dépense active

Conceptuellement :

```text
dépense de séance − dépense de repos correspondante
```

Pour une application nutritionnelle, cette distinction est importante afin d'éviter de compter deux fois la dépense de repos lorsqu'on construit un TDEE.

À clarifier dans l'architecture de Force Tracker.

---

# 9. Comment afficher le résultat

Éviter :

> 🔥 487 kcal

car cela suggère une précision que la science ne permet pas.

Préférer quelque chose comme :

> **≈ 450 kcal**
>
> **Fourchette estimée : 380–520 kcal**
>
> *Estimation — la dépense réelle varie selon l'intensité et la physiologie individuelle.*

Pour un utilisateur qui règle son alimentation à partir du chiffre :

> être conservateur est préférable à une surestimation.

---

# 10. Le vrai problème est encore plus visible avec le cardio

C'est probablement le point qui nous préoccupe le plus maintenant.

Un même entraînement cardio peut produire par exemple :

```text
Tapis :       101 kcal
Montre :       89 kcal
Polar/H10 :   120 kcal
Force Tracker:  57 kcal
```

Ces chiffres peuvent être différents parce que les systèmes n'utilisent pas nécessairement les mêmes données ni la même définition.

Exemples :

### Tapis

Peut utiliser :

- vitesse ;
- pente ;
- durée ;
- poids renseigné ;
- distance.

### Montre

Peut utiliser :

- fréquence cardiaque ;
- poids ;
- âge ;
- profil ;
- algorithme propriétaire ;
- données de mouvement.

### Polar H10

La H10 mesure principalement la fréquence cardiaque.
Le chiffre de calories dépend ensuite de l'écosystème / de l'algorithme qui interprète cette donnée.

### Force Tracker

Utilise son propre modèle.

Donc :

> il ne faut pas simplement choisir la moyenne des quatre chiffres.

Exemple à ne PAS faire :

```text
(101 + 89 + 120 + 57) / 4
```

Cela donnerait une fausse impression de précision.

---

# 11. Cardio et musculation doivent probablement être traités séparément

Une piste importante est de ne pas chercher une formule universelle.

## Cardio

On dispose souvent de variables objectives fortes :

- durée ;
- vitesse ;
- distance ;
- pente ;
- puissance pour le vélo ;
- poids ;
- fréquence cardiaque.

Pour la marche/course/vélo, il existe des équations physiologiques beaucoup mieux établies que pour la musculation.

## Musculation

On dispose de :

- durée ;
- séries ;
- répétitions ;
- charges ;
- repos ;
- exercice ;
- structure ;
- supersets/circuits ;
- FC.

La musculation reste plus difficile à modéliser précisément.

Donc Force Tracker pourrait avoir :

```text
MOTEUR CARDIO
durée + vitesse/pente/puissance + poids + FC
```

et

```text
MOTEUR MUSCULATION
durée + type de séance + structure + éventuellement FC
```

---

# 12. Le problème du TDEE / des montres

C'est un point important pour Force Tracker.

Une montre peut afficher :

> **Dépense totale : 2 800 kcal**

et l'utilisateur peut ensuite manger 2 800 kcal en pensant être exactement à maintenance.

C'est potentiellement trompeur.

Les études de validation des wearables montrent que la dépense énergétique est beaucoup moins fiable que certaines autres mesures comme la fréquence cardiaque.

Conclusion :

> une montre est intéressante comme **source de données physiologiques**, mais son chiffre de calories ne doit pas être considéré comme une vérité.

Pour Force Tracker :

```text
Montre / H10
      ↓
   capteurs
      ↓
Force Tracker
      ↓
modèle d'estimation
```

et non :

```text
Montre
  ↓
vérité calorique
```

---

# 13. Impédancemétrie / balance

Force Tracker permet déjà de renseigner les données d'une balance impédancemètre :

- automatiquement ou manuellement.

Cela peut inclure selon le modèle :

- poids ;
- masse grasse ;
- masse maigre ;
- masse musculaire ;
- eau ;
- métabolisme basal estimé.

Important :

> le « métabolisme basal » affiché par une balance à impédancemétrie est généralement une **estimation**, pas une mesure directe.

La mesure directe du métabolisme de repos nécessite une calorimétrie indirecte avec mesure des échanges gazeux.

Mais pour Force Tracker, ces données restent utiles car elles permettent de personnaliser le profil corporel au lieu de dépendre uniquement d'une formule générique.

Donc ce point est déjà pris en compte dans l'application et **ne constitue pas la priorité actuelle**.

---

# 14. Les montres / bracelets et le Polar H10

Matériel actuellement disponible pour les tests :

- **Polar H10**
- **Garmin Venu 3**
- possibilité d'utiliser éventuellement un bracelet Fitbit/Google si disponible.

Pour l'objectif actuel :

### Polar H10

Très intéressant comme référence de fréquence cardiaque pendant la musculation et le cardio.

### Garmin Venu 3

Très intéressant comme deuxième source indépendante.

### Fitbit

Potentiellement intéressant comme troisième estimation indépendante, mais inutile d'acheter un appareil uniquement pour Force Tracker avant d'avoir exploité H10 + Garmin.

---

# 15. Polar AccessLink API

Polar AccessLink est particulièrement intéressant pour Force Tracker.

Principe :

```text
Polar H10
   ↓
Polar Flow
   ↓
AccessLink API
   ↓
Force Tracker
```

Cela permet de récupérer les données après synchronisation sans que le navigateur Force Tracker ait besoin de gérer directement le Bluetooth.

Selon les données disponibles dans Polar Flow / AccessLink, on peut notamment exploiter :

- durée ;
- calories Polar ;
- fréquence cardiaque moyenne/max ;
- données de fréquence cardiaque détaillées ;
- zones de FC ;
- données de séance ;
- données de musculation / séries lorsqu'elles sont disponibles.

### Avantage

Pas besoin de Bluetooth Web dans le navigateur pour récupérer les données après la séance.

### Limite

AccessLink n'est pas une solution de fréquence cardiaque temps réel.

Pour du temps réel :

```text
H10 → BLE → appareil
```

reste nécessaire.

---

# 16. iOS vs Android pour le Bluetooth

### Android

Chrome Android prend en charge Web Bluetooth / BLE dans les contextes compatibles.

Architecture possible :

```text
Polar H10
    ↓ Bluetooth BLE
Chrome Android
    ↓ Web Bluetooth
Force Tracker
```

Donc une web app peut potentiellement recevoir directement la FC du H10 sur Android, sans application native.

### iOS

Safari/WebKit ne permet pas actuellement le même accès Web Bluetooth.

Une web app iOS classique ne peut donc pas faire directement :

```text
H10 → Safari → Force Tracker
```

Des solutions comme un navigateur BLE spécialisé peuvent exister, par exemple Bluefy, mais il ne faut pas baser l'architecture commerciale de Force Tracker sur une solution fragile sans test.

Alternative iOS :

```text
H10
 ↓
petite app native / bridge
 ↓
Force Tracker
```

ou :

```text
H10
 ↓
Polar Flow
 ↓
AccessLink
 ↓
Force Tracker
```

pour les données post-séance.

---

# 17. Garmin : pourquoi certaines applications ont du Garmin en direct et d'autres non

Il existe plusieurs niveaux d'intégration Garmin.

### Garmin Connect API / Health API

Architecture :

```text
Garmin
 ↓
Garmin Connect
 ↓
API
 ↓
Force Tracker
```

Très intéressant pour récupérer des données après synchronisation.

Ce n'est pas nécessairement du vrai temps réel.

### Garmin Health SDK / Companion SDK

Certaines applications peuvent accéder à des flux live, notamment la fréquence cardiaque, via des SDK Garmin dédiés.

Cela explique pourquoi certaines applications peuvent afficher Garmin en direct.

Mais ces SDK ne sont pas simplement une API publique librement accessible à n'importe quelle petite application : les conditions d'accès et d'utilisation commerciale sont plus encadrées.

### Connect IQ

Autre possibilité : développer un logiciel qui tourne directement sur la montre Garmin.

Donc :

> certaines applications disposent d'un niveau d'intégration Garmin plus profond que l'API cloud classique.

---

# 18. Ne pas construire trop vite l'infrastructure

Conclusion pratique actuelle :

> **Ne pas commencer par développer BLE, API Polar, API Garmin, SDK Garmin, iOS et Android en même temps.**

C'est beaucoup trop tôt.

La priorité est d'abord de vérifier si l'amélioration de l'estimation est réellement utile.

---

# 19. Protocole de test proposé

La proposition initiale de Claude était :

Pour chaque séance, noter :

| Donnée | Valeur |
|---|---:|
| Polar | X kcal |
| Garmin | X kcal |
| Durée réelle | X min |
| Type de séance | classique / squat-SDT / supersets |

Cette proposition est bonne comme première expérience.

Mais il vaut mieux faire **environ 10 séances plutôt que seulement 3**.

### Pourquoi ?

3 séances peuvent montrer si le modèle est complètement aberrant, mais ne suffisent pas à conclure qu'un MET est réellement « le bon » pour une personne.

Avec 10 séances, on peut au moins observer :

- dispersion Polar ↔ Garmin ;
- comportement du modèle 3,5 MET ;
- comportement du modèle 5,0 MET ;
- comportement du modèle 5,8 MET ;
- comportement du modèle 6,0 MET ;
- différences selon le type de séance ;
- influence de la durée ;
- cas où Force Tracker est manifestement aberrant.

Important :

> Polar et Garmin ne sont pas des références absolues de vérité.

Ils peuvent être tous les deux biaisés.

Le test sert d'abord à comparer les comportements des modèles et à détecter les aberrations.

---

# 20. Données recommandées pour les prochaines séances

Pour chaque séance, relever si possible :

```text
Date :
Durée réelle :
Type de séance :
Calories Polar :
Calories Garmin :
Calories Force Tracker :
MET 3,5 :
MET 5,0 :
MET 5,8 :
MET 6,0 :
```

Optionnel :

```text
Volume total :
Nombre de séries :
FC moyenne :
FC maximale :
```

Et idéalement conserver la courbe H10 seconde par seconde pour une phase ultérieure.

---

# 21. Phase 2 éventuelle : utiliser la fréquence cardiaque

La FC seconde par seconde pourrait devenir très intéressante parce que Force Tracker connaît déjà les événements mécaniques de la séance.

Exemple conceptuel :

```text
Force Tracker
20:15:00
Squat
120 kg
5 reps
RPE 8
```

et H10 :

```text
20:15:00 → 128 bpm
20:15:05 → 134 bpm
20:15:10 → 141 bpm
20:15:20 → 148 bpm
20:16:00 → 132 bpm
20:17:00 → 116 bpm
```

On pourrait alors étudier :

- FC moyenne pendant la série ;
- FC maximale ;
- FC avant la série ;
- FC après la série ;
- vitesse de récupération ;
- temps passé dans différentes zones ;
- densité de la séance.

Cela pourrait permettre de tester si la FC apporte réellement une information supplémentaire par rapport à :

> durée + type de séance.

Mais **ne pas construire cette intégration avant d'avoir démontré que la donnée est utile**.

---

# 22. Philosophie générale recommandée pour Force Tracker

Le but ne devrait pas être :

> « Force Tracker connaît exactement les calories brûlées. »

Mais :

> **« Force Tracker fournit l'estimation la plus cohérente, traçable et honnête possible à partir des données disponibles. »**

Éviter la fausse précision.

Exemple préférable :

> **≈ 450 kcal**
>
> **Fourchette estimée : 380–520 kcal**
>
> Estimation — dépense réelle variable selon l'intensité et la physiologie.

Plutôt que :

> **487 kcal**

---

# 23. Priorité actuelle

Ordre recommandé :

### Étape 1
Tester les modèles actuels sur des séances réelles.

### Étape 2
Faire environ 10 séances et comparer :

- Polar ;
- Garmin ;
- Force Tracker ;
- durée ;
- type de séance.

### Étape 3
Traiter séparément :

- cardio ;
- musculation.

### Étape 4
Si nécessaire, tester l'apport réel de la FC H10.

### Étape 5
Seulement ensuite envisager :

- Polar AccessLink ;
- Garmin API ;
- Bluetooth Android ;
- solution iOS ;
- temps réel ;
- modèle hybride.

---

# 24. Point essentiel pour Claude

**Ne pas transformer cette réflexion en une usine à gaz avant d'avoir des données.**

Le problème prioritaire est maintenant clairement identifié :

> **le cardio semble être la partie la plus difficile à estimer proprement et la plus susceptible d'influencer la confiance de l'utilisateur dans son bilan énergétique.**

La musculation est également difficile, mais le modèle peut commencer simplement avec durée + classification MET.

Le métabolisme basal / composition corporelle est déjà pris en charge dans Force Tracker via les données de balance.

La prochaine étape doit donc être **expérimentale**, pas architecturale.

---

## Résumé en une phrase

> **On ne cherche pas pour l'instant à trouver « la vraie calorie » : on cherche d'abord à déterminer si le modèle Force Tracker est dans le bon ordre de grandeur, particulièrement pour le cardio, puis à voir si les données de fréquence cardiaque du H10 apportent suffisamment d'information pour justifier une intégration technique plus complexe.**
