# 🔬 Contre-audit — « Nutrition : bloc de pilotage » (proposition GPT du 02/09/2026)

> **Créé le 02/09/2026**, à la demande de Michel : *« Ok avant lit ça »*, en relayant un document
> de GPT écrit après visionnage de deux vidéos des écrans **Nutrition** et **Journal**.
>
> ⛔ **PHASE 1 UNIQUEMENT — aucune ligne de code n'a été écrite.** GPT le demande explicitement
> (*« Contre-audite d'abord. On décidera ensuite »*), et c'est aussi la bonne méthode : sur les
> passes précédentes, **2 constats d'audit sur 4** se sont révélés faux ou périmés une fois
> mesurés. Tout ce qui suit est **mesuré dans un navigateur**, par les vraies fonctions.

---

## ⭐⭐ LE RÉSULTAT EN UNE PHRASE

**L'axe B que GPT propose (« ma trajectoire ») est construit et en production depuis hier** —
`tendance14j()` + la carte « Ton évolution » (ft-v1102). **Il lui manque exactement UNE chose**,
et c'est petite : le moteur **compte** les jours de repas, il ne **lit jamais les calories**.

> La relation que GPT veut — **APPORT → CIBLE → POIDS → TENDANCE → OBJECTIF** — a **quatre de
> ses cinq maillons déjà en production**. Le maillon absent est le premier.

---

## 1. ÉTAT ACTUEL (mesuré)

### Journal
Rôle **opérationnel** : saisie (4 chemins : code-barres tapé · photo du code · photo de
l'étiquette · estimation IA), liste du jour, navigation par date, export CSV daté.
⭐ **La mémoire alimentaire n'y est plus** : elle a été **déplacée** vers Nutrition en **ft-v1025**,
sur décision de Michel, *pour la raison exacte que GPT redécouvre* — éviter le doublon.

### Nutrition
Rôle **de lecture** : carte du jour (anneaux + état par macro), « ce qu'il te reste, en vrai »,
bouton noter, **carte « Ton évolution » (ft-v1102)**, mémoire alimentaire, « Ta semaine »,
réglages (cible manuelle, phase), écart d'activité.

### « Ta semaine » — comment il marche vraiment
| Point | Mesuré |
|---|---|
| Fenêtre | **7 jours** |
| Jours retenus | ceux qui ont **au moins une entrée**, **hors aujourd'hui** |
| Moyenne | sur les **jours notés**, jamais sur 7 — et le texte le dit (« Moyenne des N jours notés sur 7 ») |
| Écart | `moyenne − macros.calories` = **la cible D'AUJOURD'HUI** |
| Garde-fou | **aucun écart affiché sous 3 jours** notés |
| Jours incomplets | ⛔ **AUCUNE détection** |

### Mémoire alimentaire (`_profilAlimentaire`)
| Question de GPT | Réponse mesurée |
|---|---|
| Données | `S.foodLog` — **en entier, depuis toujours** |
| Fenêtre | ⛔ **aucune** |
| Détection d'habitude | **top 3 par repas**, par fréquence |
| Occurrence minimale | ⛔ **aucune** (un aliment noté 1 fois est « une habitude » s'il est seul sur ce repas) |
| Horaires | **médiane** de l'heure, **≥ 3 points** exigés — bon garde-fou |
| Même aliment, noms différents | `trim + lowercase` **seulement** — « Riz » et « Riz basmati » restent deux aliments |
| Recalcul | à chaque rendu, **déterministe** |
| Habitude périmée | ⛔ **OUI, elle peut rester à vie** |
| Récence | ⛔ **aucune** |
| IA | **aucune** — et l'écran le dit |
| Utilisé ailleurs | ⭐ **OUI — dans le contexte de Milo** (`coach.js`) |

### Tendance de poids
Un seul propriétaire, déjà partagé (**R2**) : `_GOAL_TREND` · `poidsDansLaPlage` ·
`rythmeVsPlage` · `penteKgParSemaine` (ft-v1100/1102), lus par **l'écran Progrès**, le **moteur
de tendance** et le **contexte de Milo**. Les 6 objectifs sont couverts (muscle · perte ·
recomposition · équilibre · force · endurance, les deux derniers marqués « flou »).

---

## 2. CLASSEMENT DES PROPOSITIONS DE GPT

| § | Proposition | Verdict |
|---|---|---|
| 1 | Ne pas dupliquer le graphe 7 j du Journal | ✅ **DÉJÀ RESPECTÉ** — la carte livrée hier n'a **aucun graphique** |
| 2 | Journal = ce que je mange · Nutrition = ce que ça signifie | **EXISTE** — c'est la décision de ft-v1025, déjà appliquée |
| 5-6 | Relier apport → cible → poids → objectif | ⭐ **PARTIEL — le seul vrai trou** (voir §3) |
| 7 | Ne pas créer un 2ᵉ moteur | ✅ **DÉJÀ TENU** — un seul propriétaire depuis ft-v1100 |
| 9 | Seuils de fiabilité | **EXISTE** : `TENDANCE_FENETRE=14`, `TENDANCE_MIN_PESEES=3`, `_PA_MIN_JOURS=3`, `_PA_SOLIDE=14` |
| 10 | Jours alimentaires incomplets | 🔴 **ABSENT — et coûteux** (voir §3) |
| 11-12 | Auditer la mémoire alimentaire | **FAIT** (tableau ci-dessus) — **2 trous réels** : récence, occurrence minimale |
| 13 | « Ne pas mettre Milo partout » | ⚠️ **PRÉMISSE FAUSSE** — voir §4 |
| 14 | Axe A habitudes / axe B trajectoire | **DÉJÀ EN PLACE** — les deux cartes existent |
| 15 | Ne pas supprimer « Ta semaine » | ✅ **D'ACCORD** — il porte la seule moyenne calorique de l'app |
| 17 | Graphique seulement s'il apporte | ✅ **DÉJÀ TRANCHÉ** — aucun graphique livré |
| 19-20 | Historisation des cibles | 🔴 **ABSENTE** — confirmé, mais voir la nuance §4 |
| 21 | Cibles variables séance/repos | ⚠️ **SANS OBJET POUR LES CALORIES** — voir §4 |
| 22 | Pas de recommandation automatique | ✅ **DÉJÀ TENU** |
| 23 | « Données insuffisantes » = vrai résultat | ✅ **DÉJÀ CONSTRUIT** — c'est l'un des 4 états |

---

## 3. LES VRAIS TROUS (trois, mesurés)

### 🔴 ① Le moteur de trajectoire ignore les calories
`tendance14j()` produit `alim:{jours:7, etat:'partiel'}` — **un compte de jours**. Les kcal ne
sont **jamais lues**. Donc l'app sait dire *« ton poids baisse plus vite que prévu »* et *« tu
manges 1 354 kcal sous ta cible »*… **dans deux cartes différentes, sur deux fenêtres
différentes (14 j et 7 j), sans jamais les rapprocher.**

👉 **C'est exactement ce que GPT demande, et c'est le plus petit changement de tout le document.**

### 🔴 ② Un jour mal noté déforme la moyenne — chiffré
Fixture : **6 jours à 4 repas + 1 jour où seul le petit-déjeuner a été noté.**

| | kcal/j | écart à la cible (3 152) |
|---|---|---|
| Moyenne affichée (6 jours) | **1 798** | **−1 354** |
| Moyenne des seuls jours complets (5) | **2 067** | **−1 085** |
| **Distorsion d'UN seul jour** | **−269 kcal/j** | **+269 kcal d'erreur** |

⭐⭐ **Et l'indicateur qui le détecterait est DÉJÀ CALCULÉ** : `entreesParJour` (3,6 ici), avec
ce commentaire dans le code — *« une moyenne de 1,2 entrée par jour ne décrit pas une journée »*.
⛔ **Il n'est lu nulle part.** C'est une **donnée morte** au sens de **R5** : le problème avait
été vu, l'indicateur écrit, et jamais branché.

### 🔴 ③ La mémoire alimentaire n'a aucune récence
Rien ne périme. Un aliment mangé 20 fois il y a six mois reste en tête de liste pour toujours —
**et il part chez Milo**, qui bâtit ses conseils dessus. *Une mémoire sans oubli finit par décrire
quelqu'un qui n'existe plus.*

---

## 4. LÀ OÙ JE CHALLENGE GPT (trois points)

### ⚠️ §13 — « le journal alimentaire a été exclu du contexte Milo » : **faux aujourd'hui**
Le **journal brut** est bien exclu. Mais le **profil agrégé** (`_profilAlimentaire`) est envoyé à
Milo depuis ft-v1021 : ses aliments habituels **par repas et par heure**, pour qu'il propose dans
ce qu'elle mange déjà. La décision d'architecture que GPT veut préserver **a déjà été prise dans
l'autre sens**, avec ses garde-fous écrits (*« une absence ne prouve pas un dégoût »*).

### ⚠️ §21 — cibles variables séance/repos : **sans objet pour les calories**
Le cyclage (ft-v1098) **échange** glucides et lipides ; **les calories du jour ne bougent pas**,
et le total de la semaine est identique. Comparer une moyenne calorique à la cible actuelle est
donc **légitime**. GPT a raison pour les **macros** — tort pour les **calories**, qui sont
justement ce que son bloc veut afficher. *Le problème qu'il décrit n'existe pas là où il le met.*

### ⚠️ §19-20 — historisation : le trou est réel, l'urgence non
Confirmé : **aucun historique** de la cible, de l'objectif, de la phase ni des macros — seule la
valeur courante existe. Mais le seul consommateur serait une comparaison rétrospective **qui
n'existe pas encore**. Construire l'historisation **avant** le bloc qui la consomme, c'est payer
une complexité pour un besoin qui n'est pas né (**R19**). ⭐ **Ce qui est gratuit tout de suite** :
poser la question à l'écran (*« ta cible a changé pendant la période »*) le jour où on aura de
quoi la détecter — et **ne pas afficher un statut** si on ne peut pas le garantir.

---

## 5. RISQUES

- ⛔ **Anti-TCA (P21)** : un statut *« ton apport n'est pas cohérent »* affiché en permanence sur
  l'écran nutrition est un jugement quotidien sur ce qu'on mange. Les 4 états actuels sont
  volontairement **descriptifs** ; il ne faut pas glisser vers l'évaluatif.
- ⛔ **Causalité** : GPT le dit lui-même (§8) et il a raison — on **constate une cohérence**, on
  n'explique jamais un kilo par des calories.
- ⚠️ **Hauteur d'écran** : l'onglet est à **2 140 px** (mesuré hier, plafond posé : ne pas revenir
  à 2 600). Une 3ᵉ carte de pilotage mangerait cette marge.

---

## 6. RECOMMANDATION

**Ne rien construire de neuf.** Brancher l'apport dans le moteur qui existe :

```text
PLUS PETIT PROTOTYPE UTILE

But      : que la carte « Ton évolution » lise l'APPORT MOYEN, pas seulement le NOMBRE de jours.
Données  : S.foodLog (déjà lu) · macros.calories (déjà calculé) · la tendance de poids (déjà là).
Réutilisé: tendance14j · _foodTotals · calcMacros · _GOAL_TREND · penteKgParSemaine.
Nouveau  : UNE fonction — « ce jour est-il assez rempli pour compter ? » — branchée sur
           `entreesParJour`, qui est déjà calculé et mort.
UI       : AUCUNE nouvelle carte. Une ligne de plus dans « Ton évolution » : « Apport ~2 067 kcal/j
           sur 5 jours complets » — et la mention des jours écartés, jamais silencieuse.
Tests    : la distorsion du jour incomplet (269 kcal, mesurée) doit disparaître ; les 4 états
           existants ne doivent pas bouger ; 0 appel API au rendu.
On ne touche pas : « Ta semaine » (seule moyenne calorique, sur 7 j — c'est un autre sujet),
           la mémoire alimentaire, le Journal, les seuils existants.
```

⛔ **Et deux choses restent à décider par Michel, pas par moi** :
① **le seuil de « journée assez remplie »** — il n'existe nulle part et je refuse de l'inventer :
`entreesParJour` donne une moyenne, pas une règle. La piste honnête est de le **mesurer sur son
vrai journal** (combien de ses journées ont 1 ou 2 entrées ?) avant de choisir un chiffre.
② **la récence de la mémoire alimentaire** — combien de temps une habitude reste-t-elle vraie ?
C'est une question produit, et elle touche ce que Milo reçoit.

---

*Mesures faites le 02/09/2026 dans Chromium, par les vraies fonctions de l'app. Aucune ligne de
code modifiée par cet audit.*
