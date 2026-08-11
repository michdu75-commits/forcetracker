# 📋 À coller dans ChatGPT — contre-expertise sur le calcul des calories

> Rédigé le 11/08/2026. Modèle « équipe IA » (`README-IA.md`) : Michel décide, Claude construit,
> ChatGPT challenge. Le but n'est PAS d'obtenir un accord — c'est de trouver ce qui cloche.
> Dossier complet et sourcé : `docs/CALORIES-SOURCES.md`.

---

Je développe **Force Tracker**, une application de suivi de musculation. J'ai besoin d'une
contre-expertise **critique** sur la façon dont elle estime les calories brûlées pendant une
séance. Cherche les erreurs, ne cherche pas à me faire plaisir.

## Le contexte

Des utilisateurs règlent leur alimentation sur ce chiffre. Il doit donc être défendable et
traçable, pas approximatif. L'application connaît, pour chaque séance : la **durée réelle**
(chronomètre, pauses exclues), chaque **série** (charge, répétitions, type : échauffement /
normale / à l'échec / dégressive), le **groupe musculaire** de chaque exercice, l'existence de
**supersets ou circuits**, le **temps de repos** réglé, et le **poids de corps** de la personne.

## Ce que fait le modèle actuel (et que je pense faux)

Il **reconstruit** la durée au lieu d'utiliser celle qu'il mesure :

```
kcal = MET_exercice × poids × (nb_séries × 30 s)        ← 30 s forfaitaires par série
     + 2,0 MET      × poids × (nb_séries−1) × repos_réglé
     + 3,5 MET      × poids × 10 min                     ← forfait "échauffement", inventé
```

avec MET_exercice = 6,5 (bas du corps) · 5,5 (haut du corps) · 4,0 (isolation).

**Conséquences mesurées** (personne de 84 kg) :
- le **MET moyen implicite** ressort à **2,8** — le niveau « debout, activité légère » ;
- une séance de 60 min donne **255 kcal**, une de 90 min **361 kcal** ;
- la **charge soulevée n'intervient nulle part** : 20 séries de squat à 40 kg = 20 séries à 130 kg ;
- deux séances réelles : **10 250 kg → 199 kcal** et **3 049 kg → 191 kcal**.

## Ce que j'ai trouvé dans la littérature

1. **Formule de référence** : `kcal = MET × poids(kg) × durée(heures)` (définition du MET :
   1 MET = 1 kcal/kg/h = 3,5 mL O₂/kg/min).
2. **Compendium of Physical Activities 2024** (Ainsworth et al.), musculation :
   **3,5 MET** (séance multi-exercices 8-15 reps) · **5,8 MET** (circuit/supersets) ·
   **6,0 MET** (effort vigoureux). Ces valeurs sont mesurées sur **la séance entière, temps de
   repos compris**.
3. **La charge ne change pas significativement le MET** : une étude comparant **60 % vs 80 % du
   1RM** (calorimétrie indirecte continue) ne trouve **aucune différence significative**.
4. **Revue systématique** (Mitchell et al., *Sports Medicine*, 2024 — 166 études retenues sur
   19 867) : les valeurs **varient énormément**, et la calorimétrie indirecte **sous-estime** car
   elle ne capte pas la part **anaérobie** ; il faudrait la combiner au **lactate sanguin**.
5. **Valeurs mesurées** : 18 femmes en surpoids, charges lourdes → **289 ± 69 kcal/séance**
   (soit **± 24 %**). 9 hommes, 30 min à 75 % 1RM → **8,83 ± 1,55 kcal/min**.
6. **EPOC** (dépense post-exercice) après charges lourdes : **51 ± 31 kcal** ; métabolisme de repos
   +10 % pendant 2 h, +4,7 à 9,4 % à 15 h.

## L'écart mesuré (84 kg)

| Durée | Modèle actuel | 3,5 MET | 5,8 MET | 6,0 MET |
|---|---|---|---|---|
| 45 min | 202 | 220 | 365 | 378 |
| 60 min | 255 | 294 | 487 | 504 |
| 90 min | 361 | 441 | 731 | 756 |

## Ce que je compte changer

1. utiliser la **durée réelle mesurée** au lieu de la reconstruire ;
2. appliquer **MET × poids × durée** sur la séance entière, **sans** découper effort/repos
   (puisque les valeurs du Compendium incluent déjà le repos) ;
3. **supprimer** les 49 kcal forfaitaires d'échauffement (aucune source) ;
4. choisir le MET entre 3,5 / 5,8 / 6,0 en le **déduisant** de ce que l'app sait :
   présence de supersets/circuits, densité (séries par minute), part de polyarticulaires lourds ;
5. éventuellement ajouter l'**EPOC** (~50 kcal) ;
6. **afficher que c'est une estimation**, pas une mesure.

## Mes questions — sois critique

1. **Le point 2 est-il correct ?** Les valeurs MET du Compendium incluent-elles vraiment les temps
   de repos d'une séance de musculation classique, ou est-ce que je me trompe sur leur périmètre ?
   Si je me trompe, tout mon raisonnement s'effondre.
2. **Le point 4 est-il défendable ?** Déduire l'effort perçu (3,5 / 5,8 / 6,0) à partir de la
   densité et du type d'exercices — est-ce raisonnable, ou est-ce que j'invente une science ?
   Existe-t-il une méthode publiée pour faire cette attribution automatiquement ?
3. **Vaut-il mieux demander le RPE** (effort ressenti 1-10) après la séance et s'en servir ? Ça
   ajoute une friction ; est-ce que le gain de justesse la vaut ?
4. **L'EPOC doit-il être compté ?** Il est réel mais avec ±31 kcal d'écart-type. L'inclure
   améliore-t-il l'estimation ou ajoute-t-il du bruit ?
5. **Est-ce que je rate une approche ?** Existe-t-il une équation validée pour la musculation
   (type ACSM pour la course/le vélo) qui utiliserait charge, répétitions et repos plutôt que MET
   et durée ? Si oui, laquelle et quelle est sa validation ?
6. **Sur la présentation** : quelle est la façon honnête d'afficher un chiffre dont les études
   elles-mêmes se trompent de ±24 % — un nombre unique, une fourchette, autre chose ?
7. **Y a-t-il un risque à sur-estimer** pour quelqu'un qui règle son alimentation là-dessus ?
   Faut-il volontairement viser le bas de la fourchette ?

## Réserve importante

Les sources ci-dessus proviennent de **résumés de recherche**, pas de pages consultées une par une
(le réseau de mon environnement de développement bloque `pacompendium.com`, PubMed, Frontiers).
**Les trois valeurs MET (3,5 / 5,8 / 6,0) sont donc à confirmer** sur le Compendium officiel.
Si tu peux les vérifier, dis-moi ce que tu trouves — y compris si ça me contredit.
