# 🔒 PHASE DE VERROUILLAGE SCIENTIFIQUE ET TECHNIQUE — MOTEUR NUTRITIONNEL

> **22/09/2026** · ⛔ **AUCUNE LIGNE DE CODE MÉTIER N'A ÉTÉ MODIFIÉE. AUCUNE VERSION POSÉE.
> AUCUNE PUBLICATION.** Les seuls fichiers créés sont des **instruments de mesure** et ce
> document.
>
> **Ce que ce dossier est** : un état verrouillé de ce qu'on SAIT, de ce qu'on NE SAIT PAS, et
> de ce que chaque correction candidate changerait — en nombres.
> **Ce qu'il n'est pas** : une recommandation d'implémentation. *Michel décide ce qui DOIT
> ÊTRE ; le code et les mesures disent ce qui EST* (règle d'or #15).

---

## ⚠️ AVERTISSEMENT QUI COMMANDE TOUT LE RESTE

**Aucune source scientifique primaire n'a pu être lue.** Ce n'est pas une estimation, c'est une
mesure, refaite le 22/09 à 2 reprises :

```
doi.org · pubmed.ncbi.nlm.nih.gov · api.crossref.org · jissn.biomedcentral.com
www.anses.fr · api.openalex.org · pmc.ncbi.nlm.nih.gov · link.springer.com
www.tandfonline.com · www.mdpi.com · www.frontiersin.org · www.efsa.europa.eu
www.who.int · www.acsm.org · www.issn.net · api.semanticscholar.org
                                → HTTP 000
```

**Cause technique exacte** (et non « je ne peux pas ») : le proxy de sortie refuse le tunnel —
`connect_rejected : the egress proxy denied the CONNECT (organization policy)`. Seul
`api.github.com` répond 200. L'outil de **recherche** fonctionne, l'outil de **lecture de page**
non : ils passent par le même proxy, mais la recherche ne fait pas de CONNECT vers le domaine
cible.

👉 **Conséquence, et elle est structurante** : tout ce qui suit sous l'étiquette « littérature »
provient d'**extraits de moteur de recherche**, donc de **sources secondaires**. Le brief est
explicite : *« une source secondaire ne devient pas une source primaire parce qu'elle cite une
étude »* et *« ne transforme jamais un snippet de moteur de recherche en preuve scientifique »*.
⛔ **Donc aucune borne chiffrée de ce dossier ne doit être inscrite dans le moteur en l'état.**
Elles servent à **classer un défaut**, jamais à **fonder une prescription**.

---

## §1 — REPRODUCTION INDÉPENDANTE DES MESURES

### La méthode : deux chemins, une seule vérité

Relancer les instruments précédents n'aurait rien reproduit — le même code rend le même nombre
par le même chemin. On a donc construit un **MIROIR** du moteur, ré-écrit à la main depuis la
lecture de `state.js`, puis confronté à l'**app servie** dans un vrai navigateur.

| | |
|---|---|
| profils comparés miroir ↔ app servie | **25 580** |
| champs comparés par profil | BMR · TDEE · calories · protéines · lipides · glucides |
| **écarts** | **0** |
| erreurs de page | **0** |
| branches couvertes | Mifflin · Katch-McArdle · fumeur · métier · autre sport · plancher · kéto · low-carb · les 6 objectifs · les 2 phases |

⭐ **Ce que ce 0 autorise, et rien de plus** : ma lecture du moteur est juste, donc le miroir peut
porter les millions de profils qu'un navigateur ne peut pas porter. ⛔ **Il ne remplace jamais
l'app** : il est revalidé par elle à chaque exécution.

⚠️ **Ce que le miroir ne couvre PAS, écrit plutôt que supposé** : `cycleGlucides` (qui relit
l'historique de séances). Ce chemin-là est mesuré séparément, **dans le navigateur**.

### Fait A — la donnée qui n'atteint pas le moteur

**A1 · La masse maigre.** 85 kg, bilan corporel frais, on ne change QUE le % de gras :

| % de gras | masse maigre | BMR | TDEE | cible | P | L | G |
|---|---|---|---|---|---|---|---|
| 12 % | 74,8 kg | 1 986 | 3 078 | 3 528 | **187** | **77** | 522 |
| 20 % | 68,0 kg | 1 839 | 2 850 | 3 300 | **187** | **77** | 465 |
| 30 % | 59,5 kg | 1 655 | 2 565 | 3 015 | **187** | **77** | 394 |
| 38 % | 52,7 kg | 1 508 | 2 337 | 2 787 | **187** | **77** | 337 |

⭐⭐ **ET C'EST UNE CORRECTION AU DOSSIER PRÉCÉDENT, PAS UNE CONFIRMATION.** Il disait
« la masse maigre n'atteint pas le moteur ». **C'est trop fort, et donc faux.** Elle atteint
parfaitement les **CALORIES** — Katch-McArdle fait varier le BMR de 1 986 à 1 508, soit **478
kcal d'écart**. 👉 ***Elle n'atteint jamais la RÉPARTITION*** : protéines et lipides sont
identiques au gramme près entre 12 % et 38 % de gras. *Le défaut est réel ; sa formulation
était imprécise, et une formulation imprécise fait chercher au mauvais endroit* (R23).

**A2 · La discipline.** Les 5 disciplines (`muscu`, `bodybuilding`, `powerbuilding`,
`powerlifting`, `haltero`) → **3 229 kcal · P187 L77 G447**, identiques. **0 écart.**

**A3 · Le niveau déclaré.** `(vide)`, `debutant`, `intermediaire`, `confirme` → **identiques.
0 écart.**

### Fait B — le volume réel d'entraînement

| séances/sem | cible | P | L | G |
|---|---|---|---|---|
| 0 | **3 229** | 187 | 77 | 447 |
| 3 | **3 229** | 187 | 61 | 484 |
| 6 | **3 229** | 187 | 73 | 456 |
| 7 | **3 229** | 187 | 77 | 447 |

⭐ **Écart de calories entre 0 et 6 séances par semaine : `0 kcal`.** Les protéines ne bougent
pas non plus. Seule la répartition lipides/glucides est redistribuée **à calories constantes**
par `cycleGlucides` — ce qui est son travail, écrit et assumé depuis ft-v1098.

👉 ***Quelqu'un qui passe de 0 à 6 séances par semaine reçoit exactement la même cible
calorique.*** Le seul levier est `S.activityLevel`, que la personne règle à la main, et dont
`ecartNiveauActivite` **propose** la mise à jour sans jamais l'appliquer.

### Fait C — les écarts caloriques sont fixes

| poids | TDEE | perte | (%/sem) | recomp | muscle | (%/sem) | force |
|---|---|---|---|---|---|---|---|
| 50 kg | 2 237 | −450 | **−0,8** | −250 | +350 | **+0,6** | +200 |
| 60 kg | 2 392 | −450 | −0,7 | −250 | +350 | +0,5 | +200 |
| 70 kg | 2 547 | −450 | −0,6 | −250 | +350 | +0,5 | +200 |
| 85 kg | 2 779 | −450 | −0,5 | −250 | +350 | +0,4 | +200 |
| 100 kg | 3 012 | −450 | −0,4 | −250 | +350 | +0,3 | +200 |
| 130 kg | 3 477 | −450 | −0,3 | −250 | +350 | +0,2 | +200 |
| 150 kg | 3 787 | −450 | **−0,3** | −250 | +350 | **+0,2** | +200 |

*(%/sem = perte de poids théorique si l'écart venait entièrement du tissu adipeux, à
7 700 kcal/kg, sur 7 jours. C'est une conversion d'ORDRE, pas une prédiction.)*

⚠️ **CORRECTION À MON PROPRE DOSSIER PRÉCÉDENT.** Il publiait *« −0,53 %/sem à 60 kg contre
−0,24 %/sem à 130 kg »*. Les nombres remesurés ici sont **−0,7 %** et **−0,3 %**. Je n'arrive
pas à reconstruire l'hypothèse de conversion de l'ancien calcul, donc **je ne la défends pas :
ce sont les nombres ci-dessus qui font foi**, avec leur formule écrite à côté. ⭐ **Le constat,
lui, ne bouge pas et c'est lui qui compte** : le rapport entre la personne légère et la personne
lourde est de **2,7 ×** — *plus on est lourd, plus le déficit relatif est FAIBLE*, c'est-à-dire
l'inverse du gradient que décrivent les recommandations consultées.

### Fait D — les cas limites

| cas | cible | protéines | lipides | glucides | fermeture |
|---|---|---|---|---|---|
| ⛔⛔ **F 78 a · 148 cm · 120 kg · sédentaire · perte · décharge** | **1 614** | 300 g (2,5 g/kg, **74,3 %**) | 96 g (0,8 — **53,5 %**) | **0 g (0 %)** | **+450 kcal** |
| H 150 kg sédentaire perte décharge | 2 809 | 375 g (2,5 — 53,4 %) | 120 g (0,8 — 38,4 %) | 57 g (**0,38 g/kg**) | −1 |
| H 130 kg recomp bureau | 3 327 | 338 g (2,6 — **40,6 %**) | 111 g (0,85 — 30 %) | 244 g (1,88) | 0 |
| ⛔ **H 45 kg · 195 cm · 18 a · très actif · muscle** | 3 460 | 99 g (2,2) | 41 g (0,91 — 10,7 %) | **674 g (14,98 g/kg)** | +1 |
| H 55 kg très actif muscle charge | 3 287 | 121 g (2,2) | 50 g (0,91 — 13,7 %) | **588 g (10,69 g/kg)** | −1 |
| H 85 kg métier physique très actif muscle | 4 307 | 187 g (2,2) | 77 g (0,91 — 16,1 %) | **717 g (8,44 g/kg)** | +2 |
| F 42 kg · 150 cm · 25 a · sédentaire · perte | **1 200** (plancher) | 105 g (2,5 — 35 %) | 34 g (0,81) | 119 g (2,83) | +2 |
| H 100 kg kéto perte | 2 662 | 100 g (1,0 — 15 %) | 237 g (2,37 — **80,1 %**) | 33 g | +3 |
| H 100 kg low-carb perte | 2 662 | 200 g (2,0 — 30,1 %) | 133 g (1,33 — 45 %) | 166 g | −1 |

⛔⛔ **Le premier cas est le pire du moteur, et il est reproduit à l'identique** : l'écran annonce
**1 614 kcal**, et les macros qu'il affiche en dessous totalisent **2 064 kcal**. *Deux nombres
qui se contredisent sur le même écran, et aucun ne signale l'autre.* La cause est mécanique :
protéines et lipides sont calés sur le poids RÉEL, les glucides sont le **résidu** — et le
résidu est borné à 0, donc l'excédent **disparaît de l'affichage sans disparaître de
l'assiette**.

### Fait E — la cible manuelle (trouvé en mesurant, pas dans le brief)

| saisie | cible affichée | P | L | G | **somme des macros** |
|---|---|---|---|---|---|
| **600 kcal** | **600** | 187 | 77 | 0 | **1 441 kcal** |
| 1 000 | 1 000 | 187 | 77 | 0 | **1 441 kcal** |
| 1 500 | 1 500 | 187 | 77 | 15 | 1 501 |
| 3 000 | 3 000 | 187 | 77 | 390 | 3 001 |
| 9 000 | 9 000 | 187 | 77 | 1 890 | 9 001 |

⛔ Une cible manuelle de **600 kcal** est acceptée telle quelle (c'est une décision actée : *un
chiffre saisi par la personne est le sien*), mais les macros affichées en dessous en valent
**1 441**. ⚠️ **Ce n'est pas le plancher qui est en cause** — il ne s'applique volontairement
pas à `manualKcal`. C'est le **même défaut de fermeture** que le cas F 78 ans : le résidu ne
peut pas être négatif.

---

## §2 — VERROUILLAGE DES SOURCES

### Le registre, avec son niveau de confiance honnête

| # | Règle invoquée | Valeur | **Unité** | Population | Type | Confiance |
|---|---|---|---|---|---|---|
| S1 | Glucides, sports de force | **4–7 g/kg** | poids de corps | bodybuilders | secondaire (Slater & Phillips 2011, cité) | ⚠️ non vérifiée |
| S2 | Glucides, athlètes de force (CIO) | 4–7 g/kg | poids de corps | athlètes de force | secondaire | ⚠️ non vérifiée |
| S3 | Glucides, athlètes physique en prépa | **2–5 g/kg** | poids de corps | physique en sèche | secondaire | ⚠️ non vérifiée |
| S4 | Glucides, hors saison | ≥ 3–5 g/kg | poids de corps | bodybuilders | secondaire | ⚠️ non vérifiée |
| S5 | Protéines, hypocalorique, entraînés | **2,3–3,1 g/kg** | ⛔ **MASSE MAIGRE (FFM)** | entraînés secs | secondaire (ISSN 2017, cité 2 ×) | ⚠️ non vérifiée |
| S6 | Protéines, général | 1,4–2,0 g/kg | poids de corps | sportifs | secondaire | ⚠️ non vérifiée |
| S7 | Lipides, minimum hormonal | **0,8–1 g/kg** | poids de corps | H et F | secondaire | ⚠️ non vérifiée |
| S8 | Lipides, % de l'énergie | 20–35 % | calories | sportifs | secondaire | ⚠️ non vérifiée |
| S9 | Lipides, % en période de sèche | 15–25 % | calories | sèche | secondaire | ⚠️ non vérifiée |
| S10 | Lipides à 0,5 g/kg | condition **expérimentale** de 2,5 jours | — | — | secondaire | ⛔ **n'est PAS une recommandation** |

### ⚠️⚠️ DEUX DE MES PROPRES AFFIRMATIONS SONT RETIRÉES

**① « ISSN 2017 donne 2,3–3,1 g/kg de POIDS DE CORPS. »** Je l'avais écrit dans une correction
antérieure, en croyant corriger une erreur. **Les deux recherches indépendantes menées
aujourd'hui donnent l'unité inverse : `g/kg FFM` (masse maigre).** Je retire ma correction.
⛔ **Et je ne la remplace pas par la lecture opposée** : aucune des deux n'a été lue à la source.

👉 ***C'est la question la plus lourde de tout le dossier, et elle n'est PAS tranchable ici.***
Elle décide à elle seule si le moteur est correct ou systématiquement au-dessus :

| si la borne est… | alors 2,6 g/kg de poids de corps (recomp)… |
|---|---|
| en **poids de corps** | est **dans la plage**, rien à corriger |
| en **masse maigre** | vaut **3,5 g/kg de masse maigre** à 25 % de gras → **au-dessus de 3,1** |

**② « Le plancher lipidique de 0,5 g/kg est un seuil hormonal. »** Les extraits consultés
situent le minimum recommandé à **0,8–1 g/kg**, et 0,5 g/kg comme une **condition
expérimentale**. ⛔ Je ne change donc pas le plancher tout seul : **les deux valeurs sont
mesurées** (variantes V6 et V7 ci-dessous) et l'arbitrage est rendu à Michel.

### Ce que la recherche internationale a donné — et ce qu'elle n'a pas donné

⛔ **La demande du brief portait sur quatre aires géographiques (France/UE, États-Unis/Canada,
Russie, Asie). Je n'ai obtenu de résultats exploitables que sur les sources anglophones** — les
recherches renvoient des pages que je ne peux pas ouvrir, et l'outil de recherche est
explicitement limité aux États-Unis. **Je ne fabrique pas de « consensus international » à
partir de ça.** Les positions russes et asiatiques restent **inconnues de ce dossier**.

⚠️ **Un point de méthode retrouvé, et il est utile** : l'ANSES (France) **refuse explicitement de
fixer un intervalle de référence pour les glucides** — *« les pourcentages découlent des
références établies pour les deux autres macronutriments et n'ont donc pas de justification
propre »*. 👉 ***C'est exactement l'architecture de Force Tracker*** : protéines et lipides
fixés, glucides en résidu. **L'architecture n'est donc pas le défaut.** Le défaut est que le
résidu n'a **aucune borne** et qu'il **absorbe silencieusement toutes les incohérences**.

---

## §3 — LES GLUCIDES, REPRIS DE ZÉRO

### Ce qui les fait varier aujourd'hui, mesuré

| entrée | atteint les glucides ? | par quel chemin |
|---|---|---|
| poids | ✅ indirectement | via protéines et lipides soustraits |
| taille · âge · sexe | ✅ | via le BMR, donc les calories |
| niveau d'activité | ✅ | multiplicateur du BMR |
| métier | ✅ | +0 à +450 kcal |
| autre sport déclaré | ✅ | +150 kcal (0 si ≥ 1,725) |
| masse maigre | ✅ **calories seulement** | Katch-McArdle |
| objectif | ✅ | écart fixe |
| phase charge/décharge | ✅ | ±100 kcal |
| **jours de séance** | ⚠️ **répartition seulement** | `cycleGlucides`, à calories constantes |
| ⛔ **nombre de séances/sem** | **NON** | 0 kcal d'écart entre 0 et 6 |
| ⛔ **durée de séance** | **NON** | — |
| ⛔ **volume (tonnage)** | **NON** | — |
| ⛔ **intensité** | **NON** | — |
| ⛔ **discipline** | **NON** | 0 écart sur les 5 |
| ⛔ **niveau** | **NON** | 0 écart sur les 4 |

### Distribution mesurée — et pourquoi il y a DEUX nombres

⛔⛔ **Le piège le plus facile de ce dossier** : un taux calculé sur un quadrillage uniforme
**n'est pas une prévalence**. Le quadrillage met sur le même plan « 85 kg pour 148 cm » et
« 85 kg pour 178 cm ». Les deux chiffres répondent à deux questions différentes :

* **quadrillage** (1 179 648 profils) → *« le moteur PEUT-IL produire ça ? »*
* **population modélisée** (1 000 000 profils) → *« combien de personnes le verraient ? »*

⚠️ **La population est un MODÈLE, pas un recensement** : taille et IMC tirés de lois normales
grossières, objectifs et activité tirés selon des poids plausibles pour une app de musculation.
**Elle n'est pas calée sur les utilisateurs réels de Force Tracker** — l'app ne remonte pas ces
distributions. *Une population modélisée reste une hypothèse ; elle se dit.*

**Glucides en g/kg, V0 (production) :**

| | p01 | p05 | p25 | médiane | p75 | p95 | p99 | max |
|---|---|---|---|---|---|---|---|---|
| quadrillage | 0,66 | 1,61 | 3,30 | **4,84** | 6,97 | 10,76 | 13,50 | **18,76** |
| population | — | — | — | **4,70** | — | — | **10,02** | — |

⭐⭐ **LE FAIT LE PLUS IMPORTANT DE CETTE SECTION, ET IL VA CONTRE L'INTUITION DE DÉPART** : la
**médiane est à 4,84 g/kg**, c'est-à-dire **pile au milieu de la plage 4–7**. ***Le moteur n'est
PAS globalement délirant sur les glucides.*** Le problème est **la queue de distribution** :

| population modélisée (pour 100 000) | V0 |
|---|---|
| glucides > 7 g/kg | **13 855** (13,9 %) |
| glucides > 8 g/kg | 6 478 (6,5 %) |
| glucides > 12 g/kg | 96 |
| glucides < 1 g/kg | 325 |
| glucides = 0 g | 19 |

### 🎯 PRATICABILITÉ — la dimension que le brief a raison d'exiger

Une recommandation peut respecter une borne publiée **et rester intenable**. Traduit en
assiette, à ≈ 30 g de glucides pour 100 g de riz cuit :

| cas | glucides | équivalent |
|---|---|---|
| H 85 kg métier physique très actif muscle | **717 g** | ≈ **2,4 kg de riz cuit par jour** |
| H 45 kg 195 cm très actif muscle | **674 g** (14,98 g/kg) | ≈ 2,2 kg |
| H 55 kg très actif muscle | 588 g (10,69 g/kg) | ≈ 2,0 kg |
| médiane de la population | ≈ 330 g | ≈ 1,1 kg |

👉 ***Le cas à 717 g respecte 8,44 g/kg — donc à peine au-dessus de la plage 4–7 — et reste
irréalisable pour presque tout le monde.*** La borne en g/kg ne capture pas ça : *la
praticabilité dépend du nombre ABSOLU de grammes, pas du ratio.* **C'est une dimension qui
manque à toutes les sources consultées, et je ne connais aucune borne publiée pour elle.**

---

## §4 — LES PROTÉINES : la question du dénominateur

**Le moteur aujourd'hui** : `prot_g = poids_de_corps × ratio`, ratio ∈ {1,7 ; 2,0 ; 2,2 ; 2,5 ;
2,6} + 0,2 en phase lutéale.

| population modélisée (pour 100 000) | V0 |
|---|---|
| protéines > 3,1 g/kg de **poids de corps** | 1 013 |
| ⛔⛔ protéines > 3,1 g/kg de **masse maigre estimée** | **47 275 (47 %)** |
| protéines > 40 % des calories | 3 325 |
| protéines < 0,8 g/kg | **0** |

⚠️ La masse maigre est **estimée par Deurenberg (1991)** faute de mesure. **C'est un modèle**, et
il gonfle ou dégonfle le chiffre selon sa justesse — il dit un ORDRE, jamais un diagnostic.

⛔⛔ **47 % contre 1 % : tout dépend du dénominateur, et le dénominateur n'est pas établi.**
👉 *Un chiffre qui change de 47 fois selon une unité qu'on n'a pas vérifiée n'est pas un
résultat : c'est une question ouverte.* **Je refuse de trancher, et c'est la réponse.**

---

## §5 — LES LIPIDES

| population modélisée (pour 100 000) | V0 |
|---|---|
| lipides < 0,5 g/kg | **0** |
| lipides < 0,8 g/kg (minimum des sources consultées) | **14 332 (14,3 %)** |
| lipides < 15 % des calories | 2 446 |
| ⛔ lipides < 20 % des calories (bas de la plage 20–35 %) | **33 157 (33 %)** |
| lipides > 40 % des calories | 76 |

⭐ **Le moteur est systématiquement au BAS de la plage lipidique** : ses ratios (0,75 à 1,0 g/kg)
frôlent le minimum des sources consultées (0,8–1), et **un tiers de la population modélisée
reçoit moins de 20 % de ses calories en lipides**. ⛔ **Ce n'est pas un scandale** : 15–25 % est
cité comme acceptable en sèche. Mais ça vaut pour tout le monde, sèche ou pas — *une borne
tolérée en phase de restriction devient discutable en régime permanent.*

⚠️ Le plancher `_CYCLE_FAT_MIN = 0,6 g/kg` du cyclage est **également sous** le minimum des
sources consultées, et son commentaire dans le code le dit déjà : *« ce plancher est ÉCRIT ICI
faute de mieux… un seuil qu'on invente doit se dire »*. **Le code était honnête ; la mesure lui
donne raison.**

---

## §6-§8 — PERTE / PRISE DE MUSCLE / RECOMPOSITION

Mesurés au §1 fait C. Les trois reposent sur le **même mécanisme** : un nombre de kcal fixe,
identique pour une personne de 50 kg et une de 150 kg.

| | écart fixe | conséquence mesurée |
|---|---|---|
| **perte** | −450 kcal | de **−0,8 %/sem** (50 kg) à **−0,3 %/sem** (150 kg) — gradient **inversé** |
| **prise de muscle** | +350 kcal | de **+0,6 %/sem** (50 kg) à **+0,2 %/sem** (150 kg) |
| **recomp** | −250 kcal | idem, atténué |

⛔ **Je ne publie PAS de plage cible en %/semaine comme si elle était établie.** Les repères que
j'ai en tête (0,5–1 %/sem en perte, 0,25–0,5 %/sem en prise) viennent de sources que je n'ai pas
pu lire. Ce qui est **mesuré et non contestable**, c'est que l'écart relatif varie d'un facteur
**2,7 ×** entre le plus léger et le plus lourd, *sans qu'aucune règle du moteur ne l'ait
décidé* — c'est une conséquence arithmétique d'un nombre fixe, pas un choix.

---

## §9 — GARDE-FOUS ABSOLUS (propriétés testables)

⭐ **Le critère d'entrée** : une propriété n'est un **garde-fou** que si sa borne tient debout
sans source externe. Sinon c'est une **observation**, et elle est étiquetée comme telle.

| propriété | borne | justification | statut |
|---|---|---|---|
| macro jamais négative ni NaN | — | arithmétique | 🛡️ **garde-fou** |
| cible ≥ plancher (H 1 500 / F 1 200) | interne | seuil du **Gardien de Milo**, déjà servi | 🛡️ **garde-fou** |
| ⭐ **fermeture : P×4 + L×9 + G×4 = cible** | ±5 kcal | **cohérence interne** : deux nombres affichés ensemble doivent dire la même chose | 🛡️ **garde-fou** |
| protéines ≥ 0,8 g/kg | 0,8 | seuil d'alerte du Gardien, déjà servi | 🛡️ **garde-fou** |
| glucides ∈ [2 ; 7] g/kg | 2 / 7 | S1–S4, **non vérifiées** | 📊 observation |
| lipides ≥ 0,8 g/kg | 0,8 | S7, **non vérifiée** | 📊 observation |
| lipides ∈ [20 ; 35] % des calories | 20 / 35 | S8, **non vérifiée** | 📊 observation |
| protéines ≤ 3,1 g/kg de masse maigre | 3,1 | S5, **non vérifiée ET d'unité incertaine** | 📊 observation |

👉 ***Le seul défaut du moteur qui se démontre sans AUCUNE source externe est la FERMETURE*** —
1 583 cas sur le quadrillage, **300 au-delà de 200 kcal**, jusqu'à **+450 kcal**. Il ne demande
aucun arbitrage scientifique : *un écran qui affiche « 1 614 kcal » au-dessus de macros qui en
font 2 064 se contredit lui-même.*

---

## §10 — CARTE DONNÉE → UTILISÉE PAR → EFFET

| donnée | lue par | effet mesuré | justification |
|---|---|---|---|
| `bw` · `height` · `age` · `gender` | `bmrDetail` | Mifflin-St Jeor | formule publiée |
| `bodyScans[].leanMass` (< 90 j, ±5 %) | `bmrDetail` | Katch-McArdle · jusqu'à **478 kcal** | formule publiée |
| `smoker` | `bmrDetail` | **+7 %** | ⚠️ non tracée |
| `activityLevel` | `calcTDEE` | × 1,375 à 1,9 | usage courant |
| `workType` | `calcWorkExtra` | +0 / 200 / 325 / 450 | ⚠️ non tracée |
| `coachQuiz.answers.othersport` | `calcSportExtra` | +150 (0 si ≥ 1,725) | ⚠️ non tracée, dite « moyenne prudente » |
| `_pasEcart` | `calcPasExtra` | surplus de pas | tracée dans ft-v1070 |
| `goal` | `goalDeltaKcal` | −450 … +350 | ⚠️ **non tracée** |
| `nutritionPhase` | `_autoKcalBrut` | ±100 | ⚠️ non tracée |
| cycle menstruel (lutéale) | `_autoKcalBrut` · `macrosForKcal` | +150 kcal · +0,2 g/kg prot | ⚠️ non tracée |
| `goal` | `macrosForKcal` | ratios P et L | ⚠️ **non tracée** |
| `foodMode` | `macrosForKcal` | kéto 5/15/80 · low-carb 25/30/45 | kéto : nutritionniste d'Emma |
| `sessions` (4 sem.) | `cycleGlucides` | ± 30 % des lipides, **calories constantes** | choix maison, dit comme tel |
| ⛔ `discipline` · `level` · volume · durée · intensité | **personne** | **aucun** | — |

⛔⛔ **Le constat de la colonne de droite est le vrai résultat du §10** : **les nombres qui
décident des macros (2,2 · 2,5 · 2,6 · 0,8 · 0,9 · 1,0 g/kg, −450, +350) n'ont AUCUNE source
écrite dans le dépôt.** Ils sont plausibles, ils sont dans les ordres de grandeur usuels — et
personne ne sait d'où ils viennent. *Une règle dont on a oublié la raison finit toujours par
être contournée* (`docs/ORIGINE-DES-REGLES.md`).

---

## §11 — HISTORIQUE VERSIONNÉ (conception, non implémentée)

Si le moteur change un jour, une cible affichée hier ne doit pas devenir illisible demain.
La forme la moins chère, et la seule compatible avec **R2** :

* une constante `MOTEUR_NUTRI_VERSION` (entier), **un seul propriétaire** ;
* chaque enregistrement qui fige une cible porte **la version qui l'a produite**, jamais une
  copie des ratios (*une copie des règles diverge, un numéro non*) ;
* ⛔ **aucune migration** : une ligne sans version se lit *« avant le versionnement »*, ce qui
  est vrai, plutôt que d'être remplie d'une valeur plausible (règle d'or #16) ;
* le journal `S.foodLog` **ne change pas** : il enregistre ce qui a été mangé, pas ce qui a été
  prescrit.

## §12 — ARCHITECTURE À MOTEUR UNIQUE

⛔ *« Ne crée pas plusieurs moteurs parallèles. »* Le moteur actuel **est déjà unique** —
`macrosForKcal` est le seul écrivain, `_ref100` le seul résolveur, `goalDeltaKcal` le seul
propriétaire des écarts (ft-v981 a fermé la duplication avec `screens.js`). **Il n'y a rien à
unifier.** Toute évolution doit donc **entrer dans ces fonctions**, jamais à côté.

⛔ **Pas besoin d'IA** : tout ce qui précède est arithmétique et déterministe.

---

## §13 — SIMULATION MASSIVE

| | |
|---|---|
| quadrillage | **1 179 648** profils × 6 variantes = **7 077 888** évaluations |
| population modélisée | **1 000 000** profils × 6 variantes = **6 000 000** évaluations |
| validation miroir ↔ app servie | 25 580 profils, **0 écart** |
| **total** | **13 103 468 évaluations** |
| erreurs de page | **0** |

---

## §14 — CONTRE-AUDIT ADVERSARIAL

### Ce que le contre-audit a trouvé **dans mes propres candidats**

**① V4 cassait un invariant que V0 tenait.** Plafonner le dénominateur protéique à l'IMC 30
faisait tomber les protéines **sous 0,8 g/kg de poids réel** dans **2 048 profils** — V0 en
produisait **0**. ⭐ C'est *mot pour mot* le défaut qui avait tué V1/V2 sur les lipides.
**Fermé** par un plancher qui réemploie le seuil du Gardien (0,8), pas un nombre inventé. La
variante `V4nu` est **conservée dans l'instrument** pour que le défaut reste mesurable — *une
correction dont on efface la trace du défaut qu'elle ferme se fait retirer un jour.*

**② Mon plancher lipidique n'était pas un plancher.** Écrit avec `Math.round`, il laissait passer
**325 profils pour 100 000** sous 0,5 g/kg — alors que V0 n'en produit aucun. À 70,5 kg,
`round(70,5 × 0,5) = 35`, soit **0,4965 g/kg**. 👉 ***Un plancher s'arrondit vers le HAUT, un
plafond vers le BAS ; l'arrondi au plus proche transforme les deux en suggestions.*** Corrigé
en `Math.ceil` / `Math.floor` → **0**.

**③ Mon instrument comptait un régime choisi comme une violation.** Le kéto est **défini** par
5 % de glucides ; lui reprocher « moins de 1 g/kg » c'est lui reprocher d'être du kéto. **4 318
cas pour 100 000** étaient de faux défauts. Ils sont désormais comptés à part (`@regime`) —
⛔ **pas effacés** : *un nombre qui disparaît d'un tableau se relit comme un nombre à zéro* (R30).

**④ Une ancre morte dans mon propre contrôle négatif.** La mutation M09 ne trouvait pas sa cible
— une parenthèse manquante dans le motif. ⛔ **Réparée, pas retirée** (R30) : *une mutation qu'on
supprime parce qu'elle ne s'accroche plus transforme un trou en silence.*

**⑤⑤ ET LA PLUS INSTRUCTIVE : EN AGRANDISSANT MON ÉCHANTILLON, J'AI FAIT PASSER UNE MUTATION DE
ROUGE À VERT.** Les branches rares (masse maigre, kéto, low-carb) ne tenaient qu'à **1 ou 2
profils** — *un témoin qui tient à un seul profil rougit aujourd'hui et devient muet le jour où
ce profil bouge*. J'ai donc élargi : plus de poids, plus d'objectifs, plus de phases. ⛔ **Et
M15 — « le plancher protéique kéto de 0,8 g/kg disparaît » — est passée à 0 écart.**

👉 **La cause** : ce plancher **ne mord que chez quelqu'un de lourd ET peu actif** (là où les
calories sont basses par rapport au poids). En élargissant, j'avais fixé l'activité à 1,55 et
**supprimé la seule condition qui activait la règle que je prétendais mesurer**.
⭐ ***Élargir un échantillon n'est pas couvrir un régime.*** J'avais ajouté des profils et
retiré le cas qui comptait. Fermé en ajoutant les profils sédentaires et âgés.

### Contrôle négatif du miroir

Un « 0 écart » peut vouloir dire *les deux chemins concordent* ou *la comparaison ne compare
rien*. On abîme donc le miroir et on vérifie qu'il rougit.

`tools/mut_verrou_nutri.py` — **21 mutations sur un arbre CLONÉ**, dont deux qui doivent
**RESTER VERTES** (des commentaires citant les mots cherchés), et une qui prouve un
**aveuglement** (retirer la comparaison des glucides doit rendre la mutation M13 invisible).
⛔ **`state.js` n'est jamais muté, même dans le clone** : c'est le miroir qu'on met en doute.

*(Résultat de l'exécution : voir la fin de ce document.)*

---

## §15 — COMPARAISON DES VARIANTES

**Population modélisée, 1 000 000 profils, taux pour 100 000.** ⛔ **Aucune de ces variantes
n'est proposée à la publication.**

| propriété | **V0** (prod) | V4 | V5 | **V6** | **V7** |
|---|---|---|---|---|---|
| fermeture > 5 kcal | 153 | 134 | 172 | 172 | 172 |
| fermeture > 50 kcal | 19 | **0** | **0** | **0** | **0** |
| glucides = 0 | 19 | **0** | **0** | **0** | **0** |
| glucides > 7 g/kg | 13 855 | 13 874 | 13 492 | **0** | **0** |
| glucides > 8 g/kg | 6 478 | 6 478 | 6 153 | **0** | **0** |
| glucides > 12 g/kg | 96 | 96 | 96 | **0** | **0** |
| glucides < 1 g/kg | 325 | 287 | 248 | **38** | 248 |
| lipides < 15 % cal | 2 446 | 2 446 | 2 064 | **0** | **0** |
| lipides < 20 % cal | 33 157 | 33 157 | 30 616 | **19 665** | **19 665** |
| lipides < 0,8 g/kg | 14 332 | 14 332 | 14 332 | ⚠️ 15 995 | **13 778** |
| ⚠️ lipides > 40 % cal | **76** | 76 | 38 | ⚠️ **210** | ⚠️ **248** |
| protéines > 3,1 g/kg poids | 1 013 | 1 013 | 974 | 974 | 974 |
| protéines > 3,1 g/kg MM estimée | 47 275 | **44 905** | 44 790 | 44 790 | 44 790 |
| protéines > 40 % cal | 3 325 | **2 656** | 2 981 | 2 981 | 2 981 |
| protéines < 0,8 g/kg | **0** | **0** | **0** | **0** | **0** |

**Ce que chaque variante est :**

* **V4** = V0 + dénominateur protéique plafonné (IMC 30), **avec plancher 0,8 g/kg**. Lipides
  inchangés.
* **V5** = V4 + écart calorique **proportionnel** au TDEE (perte −20 %, muscle +12 %, recomp
  −10 %, force +7 %, endurance +4 %). ⚠️ **Ces pourcentages ne sont pas sourcés** : ils sont
  choisis pour reproduire l'ordre de grandeur des écarts actuels à poids moyen. *Je le dis au
  lieu de le maquiller.*
* **V6** = V5 + **glucides bornés à [2 ; 7] g/kg**, les lipides absorbant l'écart, plancher
  lipidique **0,5 g/kg** (contrainte dure).
* **V7** = V6 avec plancher lipidique **0,8 g/kg** (la valeur des sources consultées).

**Lecture honnête, V6/V7 compris :**

⭐ **Ce qu'elles gagnent** : la fermeture est **exacte**, les glucides ne sortent plus de leur
plage, les cas à 0 g et à 15 g/kg **disparaissent**, et le déficit de 1 % de la population qui
recevait moins de 15 % de lipides est **fermé**.

⚠️ **Ce qu'elles coûtent, et il faut le dire** : les cas à **plus de 40 % de calories en
lipides** passent de **76 à 210** (V6) et **248** (V7) pour 100 000. *Plafonner les glucides
pousse mécaniquement les calories vers les lipides.* C'est un **échange**, pas un gain net —
et c'est exactement le risque que le brief nomme : *« ne pas sacrifier les lipides… »*, ici
dans l'autre sens.

⚠️ **V7 est moins bonne que V6 sur les glucides bas** (248 contre 38 sous 1 g/kg) : un plancher
lipidique plus haut laisse moins de calories à rendre aux glucides. ***Les deux planchers ne
peuvent pas être satisfaits en même temps chez une personne lourde en déficit*** — et aucune
source consultée ne dit lequel cède. **C'est un arbitrage de produit, pas un calcul.**

⛔⛔ **Aucune variante ne touche au problème du dénominateur protéique** (44 790 contre 47 275),
parce qu'il ne se règle pas sans trancher l'unité — ce que ce dossier refuse de faire.

---

## §16 — TEMPS

| phase | durée |
|---|---|
| A — mesure et reproduction (§1) | validation miroir **9,3 s** · cycle **0,03 s** · faits A→E **3,1 s** |
| B — simulation (§13) | quadrillage **3,9 s** · population **5,0 s** |
| C — contre-audit (§14) | 21 mutations, chacune relançant la validation complète |
| **total machine** | **≈ 23 s** par exécution du verrou |

⛔ **Aucune estimation en « semaines » n'est donnée, et c'est volontaire** — le brief l'interdit
explicitement. Le temps de calcul est ci-dessus ; le temps de **décision** appartient à Michel.

---

## §17 — RAPPORT FINAL EN 27 POINTS

1. **Miroir du moteur construit et validé** : 25 580 profils, **0 écart**, 0 erreur de page.
2. **Fait A1 reproduit ET corrigé** : la masse maigre atteint les **calories** (478 kcal
   d'écart), **jamais** les protéines ni les lipides. La formulation précédente était trop
   forte.
3. **Fait A2 reproduit** : les 5 disciplines donnent un résultat **identique**.
4. **Fait A3 reproduit** : les 4 niveaux déclarés donnent un résultat **identique**.
5. **Fait B reproduit** : 0 vs 6 séances/semaine → **0 kcal d'écart**.
6. **Fait C reproduit, chiffres corrigés** : −0,8 %/sem à 50 kg contre −0,3 %/sem à 150 kg,
   rapport **2,7 ×**, gradient **inversé** par rapport aux recommandations consultées.
7. **Fait D reproduit** : le pire cas affiche **1 614 kcal** au-dessus de macros valant
   **2 064 kcal** — **+450 kcal** d'incohérence.
8. **Fait E trouvé en mesurant** : une cible manuelle de 600 kcal s'affiche avec des macros
   valant **1 441 kcal**.
9. **Aucune source primaire n'a pu être lue** — cause technique exacte : `connect_rejected`,
   CONNECT refusé par la politique du proxy, sur 16 domaines.
10. **10 règles consultées, 10 marquées NON VÉRIFIÉES.** Aucune n'est inscrite dans le moteur.
11. ⚠️ **Je retire ma propre correction sur l'unité des protéines** : les recherches donnent
    `g/kg de MASSE MAIGRE`, pas de poids de corps. Je ne la remplace pas — aucune n'est vérifiée.
12. ⚠️ **Je retire ma propre affirmation sur le plancher lipidique à 0,5 g/kg** : les extraits
    situent le minimum à **0,8–1 g/kg** et 0,5 comme condition **expérimentale**.
13. **La recherche internationale n'a donné que des sources anglophones.** Les positions russes
    et asiatiques restent **inconnues de ce dossier** — je ne fabrique pas de consensus.
14. **L'ANSES refuse de fixer un intervalle pour les glucides** — donc l'architecture « glucides
    en résidu » de Force Tracker **n'est pas le défaut**. Le défaut est l'absence de borne.
15. **La médiane des glucides est à 4,84 g/kg** — pile dans la plage 4–7. **Le moteur n'est pas
    globalement délirant** ; c'est sa **queue de distribution** qui l'est.
16. **13,9 % de la population modélisée dépasse 7 g/kg**, 6,5 % dépasse 8, et **96 pour 100 000
    dépassent 12 g/kg**.
17. **La praticabilité est une dimension que les bornes en g/kg ne capturent pas** : 717 g de
    glucides ≈ **2,4 kg de riz cuit par jour**, pour un ratio de seulement 8,44 g/kg.
18. **Le dénominateur protéique change le diagnostic d'un facteur 47** : 1 013 pour 100 000 en
    poids de corps, **47 275** en masse maigre estimée. ⛔ **Non tranchable ici.**
19. **Le moteur est systématiquement au bas de la plage lipidique** : **33 %** de la population
    modélisée reçoit moins de 20 % de ses calories en lipides.
20. **Le seul défaut démontrable sans aucune source externe est la FERMETURE** — il ne demande
    aucun arbitrage scientifique, seulement de la cohérence interne.
21. **Les nombres qui décident des macros n'ont aucune source écrite dans le dépôt** : 2,2 · 2,5
    · 2,6 · 0,8 · 0,9 · 1,0 g/kg, −450, +350, +7 % fumeur, +150 autre sport.
22. **Le contre-audit a tué une de mes variantes** (V4 cassait l'invariant protéines ≥ 0,8 g/kg,
    **2 048 profils**) — même famille que V1/V2.
23. **Le contre-audit a trouvé que mon plancher n'était pas un plancher** : `Math.round` laissait
    passer 325 cas pour 100 000 sous la borne. *Un plancher s'arrondit vers le haut.*
24. **Le contre-audit a trouvé une faute de périmètre dans mon instrument** : 4 318 « violations »
    pour 100 000 étaient des régimes kéto conformes à leur propre définition. Et surtout, **en
    agrandissant mon échantillon j'ai fait passer une mutation de rouge à vert** (M15) : j'avais
    ajouté des profils et retiré la seule condition qui activait la règle mesurée. ***Élargir un
    échantillon n'est pas couvrir un régime.***
25. **V6/V7 ferment toutes les bornes glucidiques** — mais font passer les cas à plus de 40 % de
    lipides de **76 à 210/248** pour 100 000. C'est un **échange**, pas un gain net.
26. **Les deux planchers (lipides et glucides) sont incompatibles chez une personne lourde en
    déficit**, et aucune source consultée ne dit lequel cède. **Arbitrage produit, pas calcul.**
27. **13 103 468 évaluations du moteur**, 0 erreur de page, 0 ligne de code métier modifiée,
    0 fichier servi touché, 0 version posée.

---

## ⛔ CE QUE JE NE FAIS PAS, ET POURQUOI

* ⛔ **Je ne propose pas de choisir V6 ni V7.** Elles ferment de vrais défauts et en ouvrent un
  autre, sur des bornes non vérifiées. *Choisir reviendrait à transformer un extrait de moteur
  de recherche en règle de prescription nutritionnelle.*
* ⛔ **Je ne tranche pas l'unité des protéines.** C'est la décision la plus lourde du dossier et
  elle dépend d'un document que je n'ai pas pu ouvrir.
* ⭐ **Il y a une chose que je recommanderais si on me le demandait, et une seule** : la
  **FERMETURE**. Elle ne dépend d'aucune source, d'aucune unité, d'aucun arbitrage — seulement
  du fait qu'un écran ne doit pas afficher deux totaux qui se contredisent de 450 kcal. **Mais
  ce n'est toujours pas à moi de la déclencher.**

---

**AUCUNE MODIFICATION DU MOTEUR NUTRITIONNEL N'A ÉTÉ PUBLIÉE. EN ATTENTE DU GO DE MICHEL.**
