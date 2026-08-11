<!-- ARCHIVÉ TEL QUEL le 11/08/2026 — roadmap écrite par ChatGPT à la demande de Michel.
     Document SÉPARÉ du chantier calories, exprès : « garder l'analyse vidéo dans un document à
     part, pour ne pas transformer le chantier calories en usine à gaz » (Michel/GPT, 11/08).
     ⚠️ NE PAS RÉÉCRIRE. Les réserves de Claude sont dans le bloc ci-dessous. -->

# ⚠️ LU ET ANNOTÉ — ce qu'on en garde, et le mur qui n'est pas nommé

> **Ce bloc est de Claude (11/08/2026). La roadmap de ChatGPT commence plus bas, intacte.**
> **Statut : ARCHIVÉ POUR LA RÉFLEXION. Rien n'est engagé, rien n'est commencé.**

**✅ CE QUI EST JUSTE, et qui mérite d'être gardé tel quel :**
- **Le modèle économique.** Un modèle de pose (MediaPipe, MoveNet) tourne **dans le téléphone** :
  pas d'API à payer par vidéo, et la vidéo n'a pas besoin de sortir de l'appareil. C'est cohérent
  avec le local-first (**R16**) et ça répond au chantier RGPD, qui est notre vrai bloquant.
- **§5, les trois couches.** La valeur n'est pas dans le modèle de vision (gratuit, commun à tous) :
  elle est dans la **couche 2**, le moteur biomécanique. C'est le seul endroit où il y a un actif
  propriétaire à construire.
- **§18, le score de confiance.** C'est le point le plus important du document, et il est mieux
  formulé ici que dans nos échanges : *« il vaut mieux dire "analyse insuffisamment fiable" que
  d'inventer une correction »*. C'est le Principe 18 (savoir s'arrêter) appliqué à la vidéo.
- **§11, l'analyse longitudinale.** Vrai différenciant, et parfaitement dans l'esprit du produit
  (*« il se souvient de qui tu es devenu »*). Une analyse ponctuelle est un gadget ; une courbe
  d'amplitude sur 6 séances est une mémoire.
- **§17, le LLM APRÈS le moteur**, jamais devant. Nourri de mesures structurées, pas d'une vidéo.
- **§2 et §21, le positionnement.** Aucun diagnostic. Conforme à la Constitution.
- **§23, l'architecture modulaire.** Gratuit à respecter dès maintenant, coûteux à rattraper après.

**⚠️ CE QUI MANQUE, ET C'EST LE VRAI MUR — la caméra 2D ne mesure pas un angle.**
Le document parle de « vue caméra recommandée » (§7, §9) comme d'un détail de cadrage. **C'est le
problème central, pas une contrainte annexe.** Un angle de genou lu sur une image dépend d'abord de
**l'endroit où le téléphone est posé**, ensuite du mouvement. Entre un profil parfait et un
trois-quarts de 20°, la « profondeur » mesurée bouge de plus que ce qu'on prétend détecter. Annoncer
**« amplitude 92 % »** sur une mesure qui varie avec le trépied, c'est de la **fausse précision** —
exactement ce qu'on vient de refuser sur les calories, en **pire** : un pourcentage a l'air objectif.
**MediaPipe rend bien des coordonnées 3D « world », mais elles sont *estimées* depuis une image 2D**,
pas mesurées. Ça ne supprime pas le problème, ça le déplace.
→ **Conséquence sur la roadmap** : la première brique n'est pas « analyser un squat ». C'est
**« dire à la personne si sa vidéo est exploitable »** — cadrage, corps entier visible, une seule
personne, stabilité de la détection. Le §18 (score de confiance) devrait donc passer **avant** le
§9 (5 exercices), pas après. Sans ça on construit un moteur qui produit des chiffres qu'on ne pourra
pas défendre.

**⚠️ Deux réserves techniques à vérifier avant de s'engager :**
- **Le poids embarqué.** L'app n'a **ni bundler ni build step** (c'est un choix, il tient depuis le
  début). MediaPipe en web, c'est plusieurs Mo de WASM + modèle. La **règle d'or #4** (ouverture
  instantanée à la salle) interdit de charger ça au démarrage → chargement à la demande uniquement,
  à l'ouverture du module. Faisable, mais à concevoir exprès.
- **§14, les appareils.** Proposer trois niveaux de qualité selon le téléphone, c'est trois
  comportements à maintenir et à expliquer. À trancher tard, pas au début.

**⏭️ POSITION ACTUELLE** : d'accord avec son §22 — **on ne développe rien maintenant**. Priorité au
cardio (voir `docs/CALORIES-SOURCES.md`). Le seul engagement à prendre dès aujourd'hui est le §23 :
ne pas construire d'une manière qui empêcherait d'ajouter ce module plus tard. C'est gratuit.

---

# Force Tracker — Roadmap future : analyse technique du mouvement par vidéo

> Document destiné à Claude.
> Cette fonctionnalité est considérée comme une évolution **proche et importante**, mais elle ne doit pas perturber les chantiers actuels.
> Objectif : préparer une architecture qui permette d'ajouter plus tard une analyse vidéo premium sans transformer Force Tracker en application médicale ni dépendre d'une API vidéo payante à chaque analyse.

---

# 1. Idée générale

Force Tracker pourrait proposer à terme une **option payante d'analyse technique du mouvement par vidéo**.

Principe utilisateur :

```text
Utilisateur filme son exercice
        ↓
Force Tracker analyse la vidéo
        ↓
Détection des articulations
        ↓
Analyse biomécanique
        ↓
Retour technique
        ↓
Historique / progression
```

L'objectif n'est PAS de créer une IA qui « diagnostique » le corps.

L'objectif est :

> **analyser la qualité d'exécution d'un mouvement sportif à partir d'une vidéo.**

---

# 2. Positionnement à respecter

Le produit doit rester clairement dans le domaine de :

- analyse technique ;
- préparation physique ;
- suivi de mouvement ;
- mobilité ;
- performance sportive.

Éviter de présenter le système comme :

- diagnostic médical ;
- détection de blessure ;
- rééducation médicale ;
- remplacement d'un kinésithérapeute ;
- remplacement d'un médecin.

### Formulations acceptables

> « Analyse technique du mouvement »

> « Analyse de votre exécution »

> « Observation biomécanique »

> « Analyse de l'amplitude »

> « Analyse de la symétrie »

### Formulations à éviter

> « Nous détectons votre blessure »

> « Votre genou est malade »

> « Cette technique provoque une lésion »

> « Cet exercice rééduque votre tendinite »

> « L'IA diagnostique votre problème »

En cas de douleur/blessure, prévoir un message général orientant vers un professionnel de santé.

---

# 3. Architecture recommandée

Le PWA peut être le point d'entrée de cette fonctionnalité.

Il n'est pas nécessaire de transformer toute l'application en application native.

Architecture cible :

```text
                    FORCE TRACKER PWA
                           │
             ┌─────────────┴─────────────┐
             │                           │
       Application                 Module analyse
       classique                    du mouvement
             │                           │
     programmes / séances              vidéo
     exercices / stats                  │
     nutrition                          ↓
                              moteur de vision
                              (MediaPipe ou équivalent)
                                      ↓
                              points articulaires
                                      ↓
                              moteur biomécanique
                                      ↓
                         analyse spécifique exercice
                                      ↓
                              résultats structurés
                                      ↓
                              interface Force Tracker
```

Important :

> Le module d'analyse vidéo doit être conçu comme un **module indépendant** afin de ne pas casser l'architecture actuelle de Force Tracker.

---

# 4. Pas besoin de créer une IA de vision depuis zéro

La première version ne doit PAS chercher à entraîner une énorme IA propriétaire capable de « comprendre » une vidéo.

On peut utiliser un modèle de détection de pose existant.

Une piste identifiée :

## MediaPipe Pose Landmarker

MediaPipe peut détecter les points du corps sur :

- images ;
- vidéos ;
- flux live.

Il fournit notamment des landmarks corporels et des coordonnées 3D « world ».

Il peut servir de couche :

> **« Où sont les articulations ? »**

Il ne doit pas être considéré comme le coach qui décide si le mouvement est bon ou mauvais.

Autre piste possible :

## MoveNet

Modèle de pose léger pouvant fonctionner sur appareil mobile.

Ces solutions doivent être évaluées techniquement avant de choisir définitivement.

---

# 5. Les trois couches du futur système

## Couche 1 — Vision

Responsabilité :

> détecter les articulations.

Exemple :

```text
épaule
coude
poignet
hanche
genou
cheville
```

La sortie pourrait être une série de positions :

```text
frame 001
épaule = (...)
coude = (...)
genou = (...)
...

frame 002
épaule = (...)
coude = (...)
genou = (...)
...
```

---

## Couche 2 — moteur biomécanique Force Tracker

C'est cette couche qui doit devenir **le savoir-faire propriétaire de Force Tracker**.

Elle transforme les points articulaires en mesures pertinentes :

- angles ;
- amplitude ;
- trajectoire ;
- vitesse ;
- stabilité ;
- symétrie ;
- profondeur ;
- tempo ;
- évolution au fil des répétitions.

Exemple pour un squat :

```text
Squat
│
├── profondeur
├── angle du genou
├── angle de hanche
├── inclinaison du tronc
├── trajectoire du genou
├── symétrie
├── vitesse descente
├── vitesse remontée
└── stabilité
```

---

## Couche 3 — interprétation

Au départ, cette couche peut être **entièrement déterministe**.

Le moteur produit :

```text
profondeur = bonne
symétrie = bonne
inclinaison_tronc = élevée
vitesse = contrôlée
```

Puis le code Force Tracker transforme cela en texte :

> « Ton amplitude est bonne. L'inclinaison du tronc augmente sur les dernières répétitions. »

Il n'est donc pas obligatoire d'appeler une IA générative pour chaque vidéo.

---

# 6. Exemple concret : squat

La vidéo est analysée.

Le système détecte par exemple :

```text
8 répétitions
profondeur moyenne = 92 %
symétrie = 94 %
stabilité = 88 %
inclinaison du tronc = élevée sur les dernières reps
vitesse = contrôlée
```

Interface :

## Analyse du squat

**Amplitude** — 🟢 92 %

**Stabilité** — 🟢 Bonne

**Symétrie** — 🟢 94 %

**Inclinaison du tronc** — 🟠 Augmente en fin de série

**Observation**

> « Ton inclinaison du tronc augmente légèrement sur les dernières répétitions. »

Ce type de résultat est beaucoup plus crédible que :

> « Ton squat est mauvais. »

---

# 7. Exemple : développé couché

Variables potentiellement analysables :

- angle du coude ;
- trajectoire générale de la barre si elle est visible ;
- position du poignet ;
- symétrie ;
- amplitude ;
- stabilité ;
- vitesse de la répétition.

Attention :

> certaines informations ne sont détectables que si la caméra est placée correctement.

Il faut donc définir pour chaque exercice :

- vue recommandée ;
- distance ;
- orientation ;
- corps entier ou segment ;
- éclairage minimal ;
- nombre de personnes visibles ;
- contraintes de cadrage.

---

# 8. Exemple : soulevé de terre

Variables potentielles :

- position du dos visible dans la vue choisie ;
- angle hanche/tronc ;
- trajectoire de la barre si elle est visible ;
- extension de hanche ;
- vitesse ;
- symétrie.

Important :

> ne pas prétendre analyser quelque chose que la caméra ne permet pas réellement d'observer.

---

# 9. Commencer avec très peu d'exercices

Ne pas lancer 100 exercices immédiatement.

Commencer par environ **5 exercices très bien analysés** :

1. Squat
2. Soulevé de terre
3. Développé couché
4. Développé militaire
5. Rowing

Pour chaque exercice, créer une fiche technique :

```text
EXERCICE
│
├── vue caméra recommandée
├── points corporels nécessaires
├── angles calculés
├── amplitude
├── trajectoire
├── vitesse
├── symétrie
├── erreurs potentiellement détectables
├── seuils
└── niveau de confiance minimal
```

---

# 10. Le positionnement premium

Cette fonction pourrait devenir une fonctionnalité payante.

Exemple :

> **Analyse technique du mouvement par IA**

L'utilisateur filme une série et reçoit :

- répétitions détectées ;
- amplitude ;
- stabilité ;
- symétrie ;
- tempo ;
- observations ;
- évolution par rapport aux séances précédentes.

Le vrai avantage commercial pourrait être l'**historique technique**.

---

# 11. Gros potentiel : analyse longitudinale

Ne pas limiter la fonction à :

> « Analyse cette vidéo. »

Force Tracker connaît déjà l'historique des séances.

Donc on pourrait proposer :

## Squat — évolution technique

```text
Amplitude       +4 %
Stabilité       +8 %
Symétrie        stable
Vitesse         +6 %
```

Puis :

> « Ton amplitude moyenne progresse depuis les 6 dernières séances, tandis que ta stabilité reste stable. »

Cela transforme l'analyse vidéo en :

> **suivi de progression technique**

et pas seulement en « filtre IA ».

C'est potentiellement beaucoup plus différenciant.

---

# 12. Coût : ne pas payer une API vidéo à chaque analyse

Objectif architectural :

> **traiter la vidéo localement sur l'appareil lorsque c'est possible.**

Architecture privilégiée :

```text
Vidéo utilisateur
       ↓
PWA
       ↓
modèle de pose local
       ↓
landmarks
       ↓
moteur biomécanique local
       ↓
résultat
```

Ainsi :

- pas de coût d'API vidéo à chaque analyse ;
- pas forcément besoin d'envoyer la vidéo au serveur ;
- moins de stockage ;
- meilleure confidentialité ;
- coût marginal potentiellement très faible.

Les modèles de vision embarqués sont précisément intéressants pour ce type de traitement local.

---

# 13. Confidentialité

Une architecture locale permettrait idéalement :

```text
VIDÉO
 ↓
traitement sur appareil
 ↓
résultats
 ↓
vidéo supprimée / jamais envoyée
```

Le serveur pourrait ne conserver que :

```text
exercice
date
nombre de répétitions
mesures
scores
observations
```

et non la vidéo brute.

Cela pourrait devenir un argument important :

> « Votre vidéo peut être analysée directement sur votre appareil. »

Cette formulation ne doit être utilisée que si l'architecture finale garantit réellement ce comportement.

---

# 14. Performance des appareils

Le traitement local doit prendre en compte les différences entre appareils :

- iPhone ancien ;
- iPhone récent ;
- Android bas de gamme ;
- Android haut de gamme ;
- ordinateur.

Prévoir éventuellement plusieurs niveaux :

### Appareil puissant

Analyse vidéo complète.

### Appareil moyen

Analyse à fréquence réduite.

### Appareil faible

Analyse plus légère ou traitement serveur optionnel ultérieur.

Ne pas imposer une qualité identique si le matériel ne le permet pas.

---

# 15. Ce qu'il ne faut PAS faire au début

Ne pas chercher immédiatement à :

- créer une IA propriétaire de vision complète ;
- analyser 100 exercices ;
- envoyer toutes les vidéos sur un serveur ;
- appeler une API payante pour chaque vidéo ;
- faire du diagnostic médical ;
- donner des prescriptions de rééducation ;
- prétendre détecter les blessures ;
- produire des scores ultra-précis sans validation.

La priorité doit être :

> **5 exercices → analyse fiable → validation → amélioration.**

---

# 16. Possibilité d'une petite IA spécialisée plus tard

Après une première version basée sur :

> détection de pose + règles biomécaniques

on pourra éventuellement ajouter un petit modèle spécialisé.

Exemple :

```text
landmarks
   ↓
mesures biomécaniques
   ↓
modèle spécialisé
   ↓
classification
```

Il pourrait apprendre à reconnaître des catégories comme :

- exécution correcte ;
- amplitude insuffisante ;
- perte de stabilité ;
- variation technique en fin de série.

Mais ce sera une phase ultérieure.

Il n'est pas nécessaire d'avoir une IA générative pour obtenir une première analyse intéressante.

---

# 17. IA générative : optionnelle

Si un LLM est utilisé, il peut être placé **après** le moteur biomécanique.

Architecture :

```text
Vidéo
 ↓
Pose estimation
 ↓
Mesures
 ↓
Moteur biomécanique
 ↓
résultats structurés
 ↓
LLM optionnel
 ↓
explication naturelle
```

Le LLM ne doit pas recevoir comme seule information :

> « regarde cette vidéo et dis-moi si le squat est bon ».

Il devrait recevoir des données déjà structurées :

```text
profondeur = 92 %
symétrie = 94 %
inclinaison = élevée
vitesse = contrôlée
```

Cela réduit les hallucinations et permet de contrôler beaucoup mieux les réponses.

---

# 18. Score de confiance

Une notion importante à prévoir.

L'application devrait pouvoir dire :

> **Confiance de l'analyse : élevée**

ou :

> **Confiance de l'analyse : faible**

Par exemple, si :

- caméra mal placée ;
- articulation masquée ;
- mauvaise lumière ;
- plusieurs personnes ;
- mouvement hors cadre ;
- détection instable.

Il vaut mieux dire :

> « Analyse insuffisamment fiable »

que d'inventer une correction.

---

# 19. Lien avec la bibliothèque d'exercices

La bibliothèque d'exercices actuelle peut devenir la base du futur moteur.

Chaque exercice pourrait progressivement contenir :

```text
nom
matériel
groupe musculaire
type de mouvement
vue caméra recommandée
landmarks nécessaires
angles à calculer
amplitude
trajectoire
tempo
symétrie
erreurs détectables
niveau de confiance
```

Cela permettrait d'avoir une vraie architecture cohérente entre :

> exercice → programme → séance → vidéo → analyse → historique.

---

# 20. Lien avec les figurines anatomiques

Les figurines et les informations musculaires déjà envisagées peuvent renforcer l'interface.

Exemple :

```text
Analyse du squat
        ↓
Observation : inclinaison du tronc
        ↓
visualisation anatomique / mouvement
```

Mais ne pas afficher une zone du corps en rouge en donnant l'impression :

> « blessure détectée ».

La visualisation doit rester une représentation pédagogique du mouvement observé.

---

# 21. Positionnement général de Force Tracker

Cette future fonction doit rester cohérente avec la philosophie générale de l'application :

> **Mesuré → Analysé → Interprété**

### Mesuré

- vidéo ;
- positions articulaires ;
- durée ;
- répétitions.

### Analysé

- angles ;
- amplitude ;
- trajectoire ;
- vitesse ;
- symétrie ;
- stabilité.

### Interprété

- observation ;
- tendance ;
- comparaison historique ;
- conseil technique général.

Ne pas confondre :

> mesure / estimation / interprétation / diagnostic.

---

# 22. Roadmap recommandée

## Maintenant

Ne pas développer le moteur vidéo immédiatement.

Priorités actuelles :

1. stabiliser le calcul des calories ;
2. mieux traiter le cardio ;
3. tester Polar / Garmin / Force Tracker ;
4. finaliser l'expérience utilisateur ;
5. conserver une architecture propre.

## Très proche

Commencer un prototype technique de :

> **Pose estimation dans le PWA**

avec 1 exercice simple.

## Phase suivante

5 exercices :

- squat ;
- soulevé de terre ;
- développé couché ;
- développé militaire ;
- rowing.

## Puis

- moteur biomécanique ;
- détection des répétitions ;
- mesures ;
- score de confiance ;
- historique.

## Enfin

- fonctionnalité premium ;
- éventuellement petit modèle spécialisé ;
- éventuellement LLM pour la formulation des observations.

---

# 23. Décision architecturale importante

Même si cette fonctionnalité n'est pas développée immédiatement :

> **ne pas construire Force Tracker d'une manière qui empêcherait l'ajout ultérieur d'un module vidéo local.**

Le module doit pouvoir être ajouté sans réécrire :

- programmes ;
- séances ;
- exercices ;
- comptes utilisateurs ;
- historique ;
- statistiques.

Prévoir simplement une architecture modulaire :

```text
Force Tracker
│
├── Core
├── Programmes
├── Séances
├── Exercices
├── Nutrition
├── Calories
├── Statistiques
│
└── Movement Analysis
      ├── Video input
      ├── Pose estimation
      ├── Biomechanics
      ├── Exercise rules
      ├── Confidence
      └── Results
```

---

# 24. Conclusion

L'analyse vidéo est considérée comme une **fonction premium potentiellement très forte** pour Force Tracker.

La stratégie privilégiée est :

> **ne pas acheter une API vidéo externe à chaque analyse.**

Commencer avec :

> **modèle de pose existant + traitement local + moteur biomécanique Force Tracker.**

Le modèle existant détecte le corps.

Force Tracker fait l'analyse.

Une IA générative peut éventuellement intervenir plus tard uniquement pour formuler les résultats.

La priorité n'est pas de construire immédiatement une énorme IA.

La priorité est de construire une analyse **limitée, mesurable, explicable et réellement fiable sur quelques exercices**.

---

## Principe directeur

> **Force Tracker ne doit pas prétendre être un médecin qui regarde une vidéo.**
>
> **Force Tracker doit devenir un outil d'analyse technique du mouvement qui sait exactement ce qu'il mesure, ce qu'il déduit et ce qu'il ne peut pas savoir.**

Cette philosophie est importante pour la crédibilité générale de l'application et pour pouvoir proposer cette fonction en premium sans faire de promesses excessives.
