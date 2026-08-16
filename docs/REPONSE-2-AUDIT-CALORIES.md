# Réponse 2 — vos trois questions, et deux erreurs de ma part

**En réponse à** *« Synthèse croisée »* et *« Résultats — les 46 séances »*.
**Livré avec** : `46-seances-v2.csv` — corrigé, colonnes non ambiguës.

---

## D'abord : vous avez raison sur les deux points, et ce sont mes erreurs

Vos §3 et §4 ne sont pas des désaccords d'interprétation. **Ce sont deux défauts du fichier que
je vous ai envoyé**, et je les ai vérifiés dans le code avant de vous répondre.

### Erreur 1 — `temps_actif_min` et `temps_repos_min` ne sont pas des mesures

Vous l'avez déduit de mon propre §2. C'est exact :

```
calData : activeMin = 15 · restMin = 48
formule : 29 × 30 s = 14,5 min  ·  (29 − 5) × 120 s = 48 min
```

Ce sont les **sorties de la formule**, et je les ai étiquetées « réels » dans le CSV. C'est une
faute d'étiquetage de ma part, exactement du type que ce dossier passe son temps à traquer.

**Conséquence, que je confirme** : il y a **zéro** séance avec temps actif mesuré, pas deux.
Mon §8 point 3 devient « 0 aujourd'hui ». **La densité n'a jamais été observée.**

Et ce n'est pas un problème d'export, c'est un problème de fond :

> **Le temps sous tension n'est relevé nulle part.** Les horodatages donnent l'instant de
> validation de chaque série. On en déduit la durée totale et chaque intervalle entre séries —
> mais jamais la durée d'une série. Sans elle, la densité reste **structurellement** inobservable,
> même avec 100 séances horodatées.

Mesuré sur le 15/08 : durée réelle 62,5 min, somme des 28 intervalles 62,5 min. Le temps de série
n'apparaît nulle part parce qu'il n'est pas mesuré, pas parce qu'il vaudrait zéro.

### Erreur 2 — `nb_series` ne comptait pas ce que compte le code

Vérifié sur la séance du 15/08 :

| | valeur |
|---|---|
| Séries validées **totales** — ce que compte `calcSessionCalories` | **29** |
| dont échauffements | 14 |
| Séries de **travail** — ce que contenait ma colonne | **15** |

Vous aviez raison, et votre test était le bon : `nb_exercices` négatif est mathématiquement
impossible, donc la colonne ne pouvait pas être le `n` du code.

**Conséquence** : vos analyses « par série » (`e_série`, séries/minute, R² de 0,20, rejet de H2)
ont tourné sur le mauvais compteur. Elles sont à refaire — et je note que vous l'aviez identifié
avant d'avoir la confirmation.

---

## Vos trois questions

### Q1 — Quelle durée dans mon tableau du §3, et quels METs ?

**Ma ligne « MET par exercice × durée réelle → +16 % » était mal nommée. Je retire l'étiquette.**

Ce que j'ai réellement calculé : `MET_de_séance_implicite × 1,12 × durée_montre + cardio`.

- La durée était bien celle de la **montre** (`duree_min`).
- Le MET n'était **pas** les constantes du moteur (5,5 · 6,5 · 8,0). C'était le MET de **séance**
  implicite, reconstruit comme vous le faites, **multiplié par 1,12** — le facteur de recalage que
  je testais ce soir-là.

Recalculé proprement :

| Formule | Biais médian |
|---|---|
| MET de séance × durée montre (**votre A+**) | **+3,8 %** |
| Le même **× 1,12** — ce que j'avais publié sous « +16 % » | **+16,3 %** |

Le facteur 1,12 explique l'intégralité de l'écart. **Il n'y avait donc aucun désaccord de fond, et
votre +105 % pour les vraies constantes d'exercice est probablement juste.** Mon chiffre ne le
contredisait pas : il ne mesurait pas la même chose.

Reste un écart mineur entre votre A+ (−0,4 %) et le mien (+3,8 %) : j'ajoute les calories de
cardio de l'app au total. À harmoniser — le CSV v2 sépare désormais `kcal_modele_actuel_muscu` et
`kcal_cardio_app`.

### Q2 — Que compte `nb_series` ?

**Il comptait les séries de travail. Le code compte toutes les séries validées, échauffements
compris.** Le CSV v2 porte les deux colonnes, plus le nombre d'exercices — les trois grandeurs
dont votre équation a besoin, sans reconstruction.

Et votre §4 sur le changement de convention est confirmé : les séances de mai-juin ne viennent pas
de l'app (elle n'existait pas), leur compteur de séries est **celui de la montre**. Les colonnes
sont maintenant séparées : `series_montre` et `nb_series_total`.

### Q3 — `temps_actif` / `temps_repos` sont-ils des sorties de formule ?

**Oui. Confirmé.** Voir l'erreur 1 ci-dessus. Ces colonnes sont **vides** dans la v2, partout, et
le commentaire de chaque ligne le dit.

---

## Un point de méthode sur votre §8 — vos seuils testés

Vous avez appliqué ma règle « > 10 min/série » à `duree_min` (montre) et à `nb_series` (ma colonne
fausse). **La règle du code utilise la durée stockée par l'app et toutes les séries validées.**
Sur les cinq séances de votre tableau :

| Votre séance | Dans l'app ? | Ce que la règle voit réellement | Verdict du code |
|---|---|---|---|
| 3 · 07/05 | **non** — antérieure à l'app | rien | ne peut pas se prononcer |
| 17 · 12/06 | oui mais **aucune durée stockée** | rien | ne se prononce pas |
| 23 · 25/06 | idem | rien | ne se prononce pas |
| 33 · 12/07 | oui | 254 min / 14 séries = 18,2 | **DOUTEUSE** ✅ |
| 37 · 28/07 | oui | 91 min / 21 séries = 4,3 | silencieux — **et c'est correct** |

La séance 37 est instructive : la **montre** s'est arrêtée à 4,8 min, l'**app** dit 91 min pour
21 séries, ce qui est parfaitement plausible. Ce jour-là c'est la montre qui est fausse, pas
l'app. Ma règle juge la durée de l'app ; la vôtre jugerait celle de la montre. **Ce ne sont pas
la même question**, et il n'y a donc ni raté ni fausse alerte à corriger de mon côté.

⚠️ **Cela dit, votre idée de fond est bonne** : comparer à la médiane de la personne plutôt qu'à
une constante. Je la garde en note — elle deviendra pertinente quand toutes les séances porteront
une durée réelle, c'est-à-dire après le branchement.

---

## Ce sur quoi nous sommes d'accord, et qui ne bouge plus

| | Vous | Moi |
|---|---|---|
| La durée était **construite**, pas mesurée | r = −0,105 avec la durée réelle | formule lue dans le code |
| Le MET de l'app était **déjà juste** au niveau séance | facteur médian **1,005** | MET modèle 3,11 vs 3,49 mesuré |
| Garmin compte du **total** | biais +0,2 % | MET implicite 3,49 vs 3,5 publié |
| Le modèle **densité** est réfuté | −35,5 %, 8/42 | +16 % mesuré sur une variante |
| Le **×1,55** perd son objet une fois la durée réparée | « symptôme d'un bug de durée » | 15/08 ne demande que × 1,13 |

Votre résultat central — **A → A+ : biais de −38,9 % à −0,4 %, 2/27 → 18/27 dans ±20 %, sans
toucher au MET** — est la meilleure justification qu'on ait du branchement des horodatages. Je le
prends tel quel.

Et votre §7 est la formulation la plus juste qu'on ait produite sur Garmin :

> *« un bon thermomètre de période, un mauvais thermomètre de séance »*

Elle a une conséquence produit directe, et je la retiens : **un total mensuel est défendable, un
chiffre à la séance ne l'est pas** — quelle que soit la méthode.

---

## Ce qu'il y a dans `46-seances-v2.csv`

27 colonnes, chacune nommée pour ce qu'elle est. Les changements par rapport à la v1 :

| Colonne | Changement |
|---|---|
| `nb_series_total` / `nb_series_travail` / `nb_exercices` | **séparées** — plus d'ambiguïté |
| `series_montre` | isolée du compteur de l'app |
| `duree_utilisee_par_le_calcul_min` | **nouvelle** — la sortie de la formule, calculée directement. Plus besoin de la reconstruire par `kcal ÷ MET` |
| `duree_reelle_horodatee_min` | **nouvelle** — la vraie durée, sur les 2 séances horodatées |
| `duree_chrono_app_min` | le chrono stocké, distinct des deux précédentes |
| `kcal_modele_actuel_muscu` / `kcal_cardio_app` | **séparées** — le cardio ne pollue plus la comparaison |
| `temps_actif_mesure_min`, `temps_repos_mesure_min`, `densite_mesuree` | **vides partout**, et le commentaire dit pourquoi |

Il y a donc désormais **trois durées explicites** par séance : ce que la montre a chronométré, ce
que le calcul a utilisé, et ce que les horodatages mesurent. Elles ne se confondent plus.

---

## L'ordre retenu

1. **Brancher les horodatages sur `calcSessionCalories`.** Nous le disons tous les deux, et vous
   avez chiffré le gain attendu : −38,9 % → environ 0.
2. **Ne rien changer au MET.** Facteur médian 1,005 — votre point 2, que je fais mien.
3. **`MET_REST` à 1,5 après**, jamais avant. Votre §5 durcit mon §4 et vous avez raison : l'effet
   passe de −23 à −43 kcal une fois le repos réel, donc le livrer d'abord dégraderait deux fois.
4. **Retirer le ×1,55** une fois la durée réparée. Il n'aura plus d'objet.

**Aucun code n'a été modifié en réponse à ces deux documents.**

---

### Ce que je ne peux toujours pas vous donner

Le **temps sous tension**. Il n'est mesuré nulle part, et aucun export ne le fera apparaître. Si
la densité doit un jour être testée, il faudra d'abord décider **comment** la mesurer — et ce
n'est pas un problème d'analyse, c'est un problème d'interface.
