# 🍽️ L'onglet Nutrition — l'analyse de GPT, passée à la mesure

> **Créé le 02/09/2026**, à la demande de Michel : *« continue avec les autres imports mais
> regarde ce que j'ai vu avec gpt »*. GPT a produit un document de 11 points sur l'onglet
> Nutrition, en demandant **explicitement de ne rien implémenter** avant validation de quatre
> choses : la logique nutritionnelle, les règles d'adaptation, l'UX, et l'impact sur les appels API.
>
> ⛔ **Ce document ne propose rien avant d'avoir mesuré.** Les passes d'audit précédentes ont
> montré que **deux constats sur quatre** étaient faux ou périmés (`docs/SUIVI-AUDIT.md`), et
> c'est arrivé encore ici : **trois des onze points de GPT décrivent un défaut qui n'existe
> pas**. Tout ce qui suit est mesuré dans un vrai navigateur, profil réel (84 kg · 178 cm ·
> 43 ans · prise de muscle · activité 1,55 · 7 séances sur 16 jours · 2 352 kcal notées).
>
> ⚠️ **Aucune ligne de code n'a été modifiée pour ce document.**

---

## 1. Ce que l'app fait AUJOURD'HUI — mesuré, pas lu

### 1.1 La chaîne de calcul, chiffre par chiffre

| étape | valeur mesurée | d'où elle vient |
|---|---|---|
| BMR | **1 743 kcal** | Harris-Benedict adaptatif (`calcTDEE`, `state.js`) |
| × activité | **× 1,55** | `S.activityLevel`, réglé par la personne |
| **TDEE** | **2 702 kcal** | dépense estimée hors alimentation |
| + objectif | **+ 450 kcal** | « prise de muscle » (`_GOAL_DELTA_KCAL`) |
| **Cible affichée** | **3 152 kcal** | ce que l'écran annonce |
| Protéines | **185 g** | ≈ 2,2 g/kg |
| Lipides | **76 g** de cible, **56 g** le jour mesuré | `bw × 0,9` — puis **cyclée** selon le jour |
| Glucides | **478 g** | **le reste** des calories |

> ### ⚠⚠ CORRECTION DU 02/09 — CE DOCUMENT S'EST TROMPÉ SUR LES LIPIDES
>
> **La première version de ce tableau écrivait « Lipides 56 g — plancher, ≈ 0,67 g/kg ».
> C'est faux des deux côtés**, et je l'ai vu en mesurant plutôt qu'en relisant :
>
> - les lipides sont une **CIBLE**, pas un plancher — `macrosForKcal` fait `bw × 0,9`, soit
>   **76 g** à 84 kg (mesuré : `fat_g_par_kg = 0,905`) ;
> - **56 g** n'est pas un seuil : c'est la valeur **d'un jour de séance**, après que le cyclage
>   ait échangé des lipides contre des glucides. Un jour de repos, la même personne reçoit
>   **82 g** ;
> - le vrai plancher (`_CYCLE_FAT_MIN`) vaut **0,6 g/kg = 50,4 g**, et il ne sert qu'à **limiter
>   l'amplitude du cyclage**. Il n'est jamais affiché.
>
> 👉 **Conséquence : la décision ④ que j'avais posée à Michel (« faut-il afficher le plancher
> lipidique autrement ? ») reposait sur MON erreur — elle est retirée du §6.** *Un document
> d'analyse qu'on ne vérifie pas fait prendre des décisions sur du vent* (**R23**).
> ⚠ Ce que GPT suggérait à son §2 n'est donc pas « traiter le plancher à part » : c'est
> **ne pas afficher une cible mobile comme un point fixe** — et là, il a raison (voir ① ci-dessous).

### 1.2 Le cycle des glucides existe déjà, et il est piloté par les séances

`calcMacros(phase)` module selon **deux** axes :

| | calories | glucides |
|---|---|---|
| phase **charge** | 3 152 | 478 g |
| phase **décharge** | 2 952 | 428 g |
| jour **avec séance** | 3 152 | **478 g** |
| jour **sans séance** | 3 152 | **414 g** |

⭐ **Mesuré : un jour de séance reçoit +64 g de glucides, à calories IDENTIQUES.**
C'est très exactement ce que GPT demande à son §2 (*« glucides : variable d'ajustement selon
activité »*) — **l'app le fait déjà**, et personne ne le lui avait dit.

---

## 2. Réponses aux 7 questions de GPT

### ⛔⛔ Q3 — « les calories d'entraînement sont-elles ajoutées à l'objectif alimentaire ? »

**NON. Mesuré : l'écart de TDEE avec et sans la séance du jour est de ZÉRO kcal.**

Le « compte bancaire calorique » que GPT redoute (§3) et la « dette artificielle » d'une séance
tardive (§4) **n'existent pas dans le code**. Ajouter une séance de 80 min à 20 h ne change pas
d'une calorie la cible du jour.

⚠️ **Et ce n'est pas un hasard : c'est un correctif déjà payé.** `ft-v949` a retiré cette
addition, précisément parce qu'elle **comptait la séance deux fois** — le multiplicateur
d'activité (1,55 = « modéré, 3-4 j/semaine ») l'inclut déjà. L'encadré daté est dans
`docs/NUTRITION-MOTEUR.md`.

👉 **Ce qui change, en revanche, c'est la RÉPARTITION** : +64 g de glucides les jours de séance.
*L'app traite déjà l'entraînement comme un signal de répartition, pas comme une dette.*

**Conclusion : les §3 et §4 de GPT sont sans objet. Rien à corriger.**

### ⛔ Q — « l'onglet coûte-t-il des appels IA ? »

**NON. Mesuré : zéro appel IA.** Le rendu complet de l'onglet Nutrition, avec repas notés,
déclenche **2 requêtes sortantes**, toutes deux au démarrage de l'app et sans rapport :
le QR code de partage et le ping Apps Script. L'écran l'écrit lui-même :
*« Calculé sur ton téléphone, sans aucun appel à l'IA. »*

👉 **Le §10 de GPT décrit un risque qui n'existe pas.** L'onglet est **déjà** entièrement
déterministe. Le seul bouton qui appelle l'IA est explicite et volontaire :
*« Générer ma semaine avec Milo IA »*.

**Conclusion : le §10 est sans objet — mais son principe reste juste pour ce qu'on AJOUTERA.**

### ⚠️ Q — « l'écran présente-t-il les calories comme une dette ? »

**OUI. GPT a raison, et c'est mesuré :**

```
CIBLE 3 152 KCAL
2 352  kcal mangées
800 kcal restantes
181 / 185 g   PROTÉINES
273 / 478 g   GLUCIDES
54 / 56 g     LIPIDES
```

Et la notion de **zone** est absente : `zone = false` sur tout l'écran.

⚠️ **Ma première mesure disait le contraire** — parce que je l'avais faite **sans repas noté** :
l'écran affichait alors *« Rien de noté pour l'instant »*, sans aucune ligne « restantes ».
*Un écran vide n'est pas l'écran.* Sans la seconde mesure, j'aurais dit à Michel que GPT
décrivait un écran qui n'existe plus — et j'aurais eu tort.

**Conclusion : les §1, §2 et §9 de GPT sont FONDÉS.**

### Q4 — « quelles décisions sont prises par Milo, lesquelles sont déterministes ? »

| décision | qui la prend | appel IA |
|---|---|---|
| BMR, TDEE, cible calorique | **code** | non |
| Protéines / lipides / glucides | **code** | non |
| Cycle charge / décharge | **code** | non |
| Modulation jour de séance | **code** | non |
| « Ce qu'il te reste, en vrai » (traduit en TES aliments) | **code** (ft-v1019/1020) | non |
| « Ce que l'app a appris de ton alimentation » | **code** (ft-v1021) | non |
| Plan de repas local | **code** | non |
| Plan de repas « avec Milo » | **Milo** | **oui, sur demande explicite** |

👉 **Tout est déjà déterministe sauf un bouton clairement étiqueté.** La bascule que GPT propose
au §5 est donc **déjà l'état du produit** — ce qui manque n'est pas l'architecture, c'est ce que
le moteur déterministe **décide** avec ce qu'il calcule.

### Q5-Q6 — l'architecture et l'UX proposées

Voir §3 et §4 ci-dessous.

---

## 3. Ce qui manque VRAIMENT (et que GPT a vu juste)

Une fois retirés les trois points sans objet, il reste **quatre manques réels**, et ils sont tous
du même ordre : **l'app CALCULE bien, elle ne CONCLUT pas.**

### ① Il n'y a aucune notion de ZONE
`185 g` de protéines est un **point**, pas une plage. Or 181 g n'est pas un échec : c'est dans la
cible. L'affichage `181 / 185` transforme une réussite en manque de 4 g.
**Le moteur a déjà tout pour calculer une zone** (les macros sont dérivées du poids et de
l'objectif) : ce qui manque est une **borne haute et une borne basse**, pas un calcul nouveau.

### ② Il n'y a aucun VERDICT
L'écran donne des nombres et laisse la personne conclure. GPT propose l'inverse : un état en
haut (*« bien adapté à ton objectif »*), les chiffres ensuite. ⭐ **C'est cohérent avec la
Vision** — *« Force Tracker n'est pas une IA, c'est une mémoire sportive intelligente »* — et
avec **R29** : l'app a le droit de conclure quand elle a de quoi, à condition de montrer sur
quoi elle s'appuie.

### ③ Rien ne raisonne sur la TENDANCE
Les données existent **toutes** — `weightLog`, `bodyScans` (tour de taille), `sessions`, `prs`,
`foodLog`, `sleepLog` — et ft-v1021 sait déjà lire l'alimentation sur plusieurs jours. Mais
**rien ne les croise** pour dire *« ça avance, ne change rien »*.
⚠️ **Et c'est le point où il faut se méfier de soi** : `R12` dit *« raisonner sur des tendances,
pas sur du bruit »*, et `R32` rappelle qu'une variation de balance à court terme **n'est pas**
un changement de tissu. Un moteur de tendance mal borné dirait des bêtises avec assurance.

### ④ La friction de saisie reste réelle
GPT a raison au §8, et la brique existe à moitié : les favoris et les aliments récents sont là,
le code-barres aussi. **Ce qui manque est le REPAS complet en un geste** (« mon déjeuner
habituel »), et ft-v1021 sait déjà quels aliments reviennent, par repas, avec leur fréquence.
*La donnée est là, le bouton n'existe pas.*

---

## 4. L'architecture proposée — trois couches, zéro appel IA en régime normal

```
      ① MESURE (existe déjà, ne bouge pas)
         BMR · TDEE · macros · cycle · foodLog · weightLog · sessions · prs
                            │
      ② JUGEMENT  ← LA COUCHE QUI MANQUE, 100 % déterministe
         zones (min/max par macro)  ·  état du jour  ·  tendance 7/14 j
         → rend un VERDICT nommé : conforme · légèrement bas · légèrement haut
           · données insuffisantes
                            │
      ③ AFFICHAGE
         le verdict d'abord, les chiffres ensuite, les réglages repliés
```

**Ce que la couche ② doit respecter, et qui vient de règles déjà écrites :**

- ⛔ **elle rend « je ne sais pas »** quand il n'y a pas assez de jours notés — et ce `null` ne
  se remplace jamais par une valeur par défaut (**R29**). ft-v1021 le fait déjà : *« 1 jour noté
  — pas encore de quoi dégager une habitude »* ;
- ⛔ **elle ne conclut jamais sur une journée** (**R12**) : le seuil est une tendance sur
  plusieurs jours, jamais un écart ponctuel ;
- ⛔ **elle nomme sa fenêtre** (*« sur 14 jours »*) — c'est le défaut corrigé en ft-v1027, où
  deux moyennes justes se contredisaient à l'écran faute de dire sur quoi elles portaient ;
- ⛔ **elle ne fabrique pas de score chiffré de fiabilité** (**R32/R33**) : des états nommés,
  pas un « 92 % » qu'on ne sait pas calculer ;
- ⛔ **anti-TCA** (Constitution **P21**) : aucun rouge d'échec, aucune injonction à « remplir ».
  Les garde-fous de ft-v1019 sont le patron — rien le soir, rien sur une cible dépassée.

**Impact API : zéro.** Tout ce qui précède est de l'arithmétique sur des données déjà en local.
⭐ Et le format compact que GPT propose au §10 pour l'IA a une valeur **indépendante** : c'est
exactement ce qu'il faudra envoyer à Milo quand il devra interpréter une contradiction — et
`ARCHITECTURE-CERVEAU-CERVELET` donne déjà le critère qui décide de la frontière : *« est-ce
que ça a besoin de savoir QUI est la personne ? »*

---

## 5. La hiérarchie visuelle proposée

⚠️ **L'onglet a déjà été rangé en ft-v1025** (2 649 px → 1 439 px, « noter » remonté de 1 783 px
à 415 px). La proposition ci-dessous **ne le refait pas** : elle ajoute une carte en tête et
change la présentation des trois macros. Le reste de l'ordre actuel est conservé.

```
┌─ ÉTAT DU JOUR ────────────────────── ← NOUVEAU
│  ✓ Conforme à ton objectif
│  Tes apports sont cohérents avec ton activité.
│  Sur 14 jours : poids ↘ · force ↗ · protéines suffisantes
└───────────────────────────────────────
┌─ AUJOURD'HUI ─────────────────────── ← EXISTE (présentation à changer)
│  2 352 kcal        zone 2 900 – 3 300     ✓
│  Protéines  181 g  zone 170 – 195 g      ✓
│  Glucides   273 g  zone 380 – 480 g      ↓ un peu bas
│  Lipides     54 g  minimum 56 g          ↓ juste sous le plancher
└───────────────────────────────────────
   [ 📓 Noter ce que je mange ]            ← EXISTE, reste en 2ᵉ position
┌─ CE QU'IL TE RESTE, EN VRAI ──────── ← EXISTE DÉJÀ (ft-v1019/1020)
┌─ TENDANCE 7 / 14 JOURS ──────────── ← NOUVEAU
┌─ COMMENT C'EST CALCULÉ ──────────── ← EXISTE, replié
┌─ MES RÉGLAGES ALIMENTAIRES ──────── ← EXISTE, replié
```

⛔ **Ce qui ne doit PAS changer** : les trois anneaux de ft-v1025 s'arrêtent à 100 % et ne
passent jamais au rouge (anti-TCA) ; *« ce qu'il te reste, en vrai »* garde ses trois garde-fous
et son silence du soir (ft-v1029). ⚠️ Les chiffres des zones ci-dessus sont des **exemples de
mise en page** : les vraies bornes sont à décider (§6).

---

## 6. Ce qui reste à trancher — et qui revient à Michel

Ces quatre points sont des **décisions**, pas des questions techniques. Ils ne peuvent pas être
pris depuis le code (**R29**).

1. ~~**La largeur des zones.**~~ ✅ **TRANCHÉE PAR LA MESURE LE 02/09, sans rien inventer**
   (ft-v1098). Je cherchais un ±X % à choisir ; **le moteur produisait déjà la zone** —
   il prescrit à la même personne **368 à 478 g** de glucides et **56 à 82 g** de lipides
   selon le jour (26 % et 38 % d'amplitude, mesurés). La zone, ce sont **les deux bouts de sa
   propre semaine**, pas un pourcentage. ⛔ Et les **protéines n'en ont pas** : amplitude
   **0 g** — on ne leur en invente pas une (**R29**). *La question était mal posée : il n'y
   avait pas une largeur à choisir, il y avait un calcul à regarder.*
2. **Le seuil de la tendance.** Combien de jours notés avant qu'un verdict s'affiche ? ft-v1021
   utilise **3 jours** pour parler et **8 séances sur 21 jours** ailleurs — il faut un chiffre,
   et il vaut mieux qu'il vienne de toi que d'une moyenne inventée.
3. **Le droit de conclure.** L'app dit-elle *« ne change rien »* toute seule, ou propose-t-elle
   à Milo de commenter ? La Vision penche pour le déterministe ; c'est un arbitrage produit.
4. ~~**Le plancher des lipides.**~~ ⛔ **RETIRÉE LE 02/09 — elle reposait sur une erreur de ce
   document** (voir l'encadré du §1.1) : les lipides sont une **cible** (`bw × 0,9`), pas un
   plancher. Il n'y avait rien à trancher.

---

## 7. Ce que ce document ne dit pas

- **Rien n'a été implémenté**, conformément à la demande.
- **Les zones n'ont pas été calculées** : il faut d'abord la décision §6.1.
- **La tendance n'a pas été prototypée** : sans le seuil §6.2, elle dirait n'importe quoi sur
  un historique court, et un moteur qui se trompe avec assurance est pire que pas de moteur.
- ⚠️ **Le raccourci iOS n'alimente toujours pas l'app** : `sleep` et `steps` sont branchés mais
  la donnée n'arrive pas. Un moteur de tendance qui s'appuierait dessus serait aveugle en
  pratique — à savoir avant de le construire.

---

*Source des mesures : `nutri3.js` (scratchpad de session), profil 84 kg / 178 cm / 43 ans /
prise de muscle / activité 1,55, 7 séances sur 16 jours, 2 352 kcal notées le jour même.
Toutes les valeurs de ce document ont été lues dans un navigateur, pas dans le code.*
