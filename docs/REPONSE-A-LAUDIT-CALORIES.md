# Réponse — côté Force Tracker

**En réponse à** *« Réponse à l'audit — modèle de calories Force Tracker »* (15/08/2026).
**Écrit depuis le dépôt Force Tracker**, avec accès au code réel et aux données réelles.
**Livré avec** : `42-seances-remplies.csv` — **46 séances**, vos colonnes du §22, remplies.

---

## Avertissement symétrique au vôtre

Vous écriviez deux choses honnêtes qu'il faut retourner dans votre sens :

1. *« Je n'ai jamais vu le code de Force Tracker. »* — moi si. La **partie 2** vous donne la
   formule exacte, y compris ce que votre portage ne pouvait pas contenir.
2. *« Je n'ai aucune des 42 séances. »* — je les ai. Le CSV joint débloque vos phases 4 à 7.

En revanche je n'ai **aucune** validation métabolique : ni calorimétrie indirecte, ni chambre.
Tout ce qui suit compare des modèles à une montre et à des valeurs publiées. Rien de plus.

---

# 1. Votre priorité n°1 — vérifiée, et elle se retourne

Votre partie D4 recommande, avant tout le reste :

> *« Vérifier totales vs actives. C'est gratuit, ça prend dix minutes, et si Garmin affiche des
> calories actives, une bonne partie de l'écart que vous cherchez à expliquer disparaît d'un coup. »*

## 1.1 Vous avez raison sur le fait

**Force Tracker compte des calories TOTALES.** Confirmé dans le code réel, pas dans le portage :

```js
// app.js:147
const MET_REST = 2.0;   // Entre les séries (position debout/assis)

// app.js:355
const calsActive = met * bw * activeHours;
const calsRest   = MET_REST * bw * restHours;
```

La formule `MET × poids × heures` inclut le métabolisme de base par construction (MET 1 = repos).
Votre D2 et votre D4 décrivent donc correctement le code réel, et pas seulement votre portage.

## 1.2 Mais la conséquence est inversée

Votre phrase suppose implicitement que **Force Tracker est au-dessus de Garmin**. Sur les données
réelles, c'est le contraire : **médiane −35 %** (27 séances appariées, plage −76 % à +4 %).

Donc si Garmin donnait de l'actif, il faudrait **retirer** le métabolisme de base du chiffre de
Force Tracker pour comparer à périmètre égal. Sur la séance du 15/08 :

| | kcal |
|---|---|
| Force Tracker, musculation seule (total) | 242 |
| Force Tracker, actif (− 1 MET × 63 min) | **148** |
| Garmin | 349 |
| Écart total vs total | −31 % |
| Écart **actif vs actif** | **−58 %** |

**L'écart ne disparaît pas : il double.** La correction que vous proposez comme priorité aggrave
le problème au lieu de le résoudre.

## 1.3 Et de toute façon, Garmin donne un total

Testable sans laboratoire, par cohérence avec la valeur publiée. Sur 42 séances propres, poids
84,95 kg :

| Hypothèse | MET **total** implicite (médiane) | Écart au Compendium 3,5 |
|---|---|---|
| **Garmin = total** | **3,49** | **+0,2 %** |
| Garmin = actif | 4,49 | +28,3 % |

Si le chiffre de la montre n'était que l'actif, le MET total réel de ces séances serait de **4,49**
— très au-dessus de tout ce que le Compendium publie pour la musculation (02050 → 02057 plafonnent
à 6,0 pour du poids de corps intense, et 02054 vaut 3,5).

**Conclusion** : les deux chiffres sont des totaux, la comparaison est à périmètre égal, et il n'y
a pas de biais mécanique à corriger. Votre §7 est une bonne question ; la réponse est « non ».

---

# 2. Ce que votre portage ne pouvait pas contenir : d'où vient la durée

C'est le point le plus utile que je puisse vous apporter, et il précise votre D4 (*« paramètre
d'entrée, le moteur ne la calcule pas — c'est votre app qui décide »*). Voici ce que l'app décide :

```js
// app.js, calcSessionCalories() — PAR EXERCICE
const activeHours = n * 30 / 3600;                    // 30 s par série, en dur
const restHours   = Math.max(0, n-1) * restSec / 3600; // restSec = préférence utilisateur (120 s par défaut)
```

**La durée n'est jamais mesurée. Elle est reconstruite depuis le nombre de séries.**

Vérification sur la séance du 15/08 (29 séries validées, 5 exercices, `defRest` absent → 120 s) :

| | valeur |
|---|---|
| `activeMin` stocké | 15 · formule : 29 × 30 s = **14,5 min** ✔ |
| `restMin` stocké | 48 · formule : (29 − 5) × 120 s = **48 min** ✔ |
| **Durée réelle**, horodatage de la dernière série | **63 min** |
| Durée relevée par la montre | 64,4 min |

C'est exactement votre « 1 h 51 comptée 28 minutes », caractérisé : la sous-estimation vient de
`(n − nb_exercices) × repos_par_défaut`, qui ignore les temps morts, les changements de poste, les
séries longues et les repos réels.

⚠️ **Et le point qui compte pour vos phases 4-7** : depuis le 12/08 l'app **horodate chaque série**
(`set.at` = secondes depuis le début), mais `calcSessionCalories` **ne les lit toujours pas**. Les
horodatages n'alimentent qu'une estimation *affichée* à côté du chiffre officiel. Autrement dit :

> La donnée nécessaire pour votre modèle existe déjà, elle n'est simplement pas branchée.

Deux séances la portent aujourd'hui (13/08 et 15/08). Elles sont dans le CSV avec leur
`temps_actif_min`, `temps_repos_min` et `densite` réels — les 44 autres ont ces colonnes vides,
volontairement.

---

# 3. Votre partie B : d'accord, et confirmée par la mesure

Vous démontrez que décomposer `MET_effort × densité + MET_repos × (1−densité)` **double-compte le
repos**, parce que les METs musculation du Compendium sont déjà des valeurs de séance. Votre
démonstration est théorique et tient sans aucune donnée.

**Elle a été testée indépendamment, sur les données, avant de lire votre document.** Quatre
approches de recalage mesurées contre 27 séances appariées :

| Approche | Écart médian | Séances à ±20 % |
|---|---|---|
| Modèle actuel (rien changé) | −35 % | 6/27 |
| Chrono stocké × MET 3,5 | +29 % | *(une séance à +217 %)* |
| **MET par exercice × durée réelle** | **+16 %** | — |
| Durée = 3 min × nb de séries × MET 3,5 | −3 % | 14/27 |
| Valeur existante × 1,55 | −2,7 % | 18/27 |

La ligne en gras **est** votre erreur de double-comptage, mesurée : appliquer un MET d'exercice à
la durée totale surestime systématiquement. Deux chemins sans rapport, même conclusion.

⚠️ **Nuance sur la dernière ligne** : le ×1,55 est une **calibration personnelle** (médiane des 27
séances d'un seul sujet — juin 1,54 · juillet 1,36 · août 1,69), livrée derrière un verrou admin et
réversible. Ce n'est pas un modèle, c'est une mise à l'échelle en attendant le vôtre.

---

# 4. Sur `MET_REST = 2,0 → 1,5`

**D'accord sur l'ancrage** : 2,0 dépasse toutes les postures publiées (assis 1,0 · debout tranquille
1,3 · debout à s'agiter 1,5). Votre R7 est juste, et la constante existe bien dans le code réel.

⚠️ **Mais il faut dire ce que ça fait ici.** Sur la séance du 15/08, le terme de repos vaut 48 min ;
passer de 2,0 à 1,5 retire environ **35 kcal**, soit −14 % sur la partie musculation. Comme Force
Tracker est **déjà 35 % sous** la montre, ce changement **éloigne** encore le modèle de la seule
référence externe disponible.

Ce n'est pas un argument contre — la physiologie ne se règle pas sur une montre. C'est un argument
pour **ne pas le livrer isolément** : corriger `MET_REST` sans corriger la durée au même moment
dégraderait le résultat visible sans rien améliorer de réel.

---

# 5. Vos hypothèses H1-H5 — ce que les données peuvent déjà dire

Votre test décisif de H2 (*« `e_série` stable ⇒ le modèle tient ; il dérive ⇒ il faut la densité »*)
est exécutable sur le CSV. Deux avertissements de méthode avant de le lancer :

1. **`e_série` calculé depuis les kcal Garmin n'est pas indépendant.** La corrélation mesurée entre
   fréquence cardiaque moyenne et kcal/min sur ces 42 séances est **r = 0,968**
   (`kcal/min ≈ 0,0959 × FCmoy − 5,32`). Le chiffre de la montre est donc, pour l'essentiel, une
   fonction du cardio. Un `e_série` estimé sur cette base mesure la réponse cardiaque, pas l'énergie.
2. **Le rythme varie énormément** : 2,2 min/série sur une séance dense, 7,4 sur des jambes lourdes,
   médiane 4,5. Si `e_série` est estimé sur des séances de formats différents, sa dispersion
   reflétera d'abord ça.

Sur H3 (`MET_hors_série = 1,5`) : votre intercept ajusté de 1,46 et la posture publiée 07041 à 1,5
concordent. C'est la partie la mieux ancrée de votre modèle.

---

# 6. Ce que contient le CSV joint

**46 lignes** (pas 42 — l'export complet en donne 46, du 04/05 au 15/08).

| Colonne | État |
|---|---|
| `duree_min`, `kcal_garmin`, `fc_moy`, `fc_max`, `nb_series`, `repetitions` | **46/46** |
| `kcal_modele_actuel`, `met_modele_actuel`, `duree_app_min` | 30 (les séances présentes dans l'app) |
| `temps_actif_min`, `temps_repos_min`, `densite` | **2** — uniquement les séances horodatées |
| `rpe`, `rir` | **0** — jamais collectés par l'app. Donnée absente = donnée absente (votre E3) |
| `type_effort` | déduit des noms d'exercices — **la méthode est écrite dans `commentaire`** |

**4 séances sont marquées « à exclure »** dans `commentaire`, avec la raison mesurée : montre
arrêtée à 5 min · laissée tourner 3 h 12 · 20 min par série · 4 h 36. Elles ne sont pas supprimées :
c'est votre décision, pas la mienne.

⚠️ **Le sujet est unique** : homme, 48 ans, 84,95 kg, 180 cm. Rien ne dit que quoi que ce soit se
transpose.

---

# 7. Ce sur quoi je vous suis sans réserve

- **Ne pas modifier le code de production maintenant.** Aucun changement de modèle n'a été livré ;
  seul le recalage personnel réversible existe, derrière un verrou admin.
- **Ne pas afficher « ± 20 % ».** Votre A2 est juste : la dispersion observée n'est pas l'erreur du
  modèle, et la confondre serait présenter du bruit de mesure comme une précision.
- **Ne jamais viser Garmin comme cible.** Contre calorimétrie indirecte, les calories d'un bracelet
  en résistance corrèlent à r = 0,10-0,34 (ICC < 0,45). La montre est une colonne de comparaison,
  jamais un objectif — et son horloge, elle, est excellente.

---

# 8. Ce qui reste ouvert de mon côté

1. **Brancher les horodatages sur le calcul officiel.** La donnée existe, le calcul ne la lit pas.
   C'est le préalable à tout modèle, y compris le vôtre.
2. **`MET_REST` à 1,5** — d'accord sur le fond, à livrer avec la durée, pas avant.
3. **Le nombre de séances horodatées** : 2 aujourd'hui, une par entraînement désormais. Il en faudra
   6 à 8 avant de trancher H2.

*Aucun code n'a été modifié en réponse à ce document.*
