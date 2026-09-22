# ⚖️ DOSSIER DE DÉCISION — MOTEUR NUTRITIONNEL V8 (CANDIDATE NON SERVIE)

> **23/09/2026** · reprend `docs/VERROU-NUTRITION-2026-09-22.md` (arbre `ce2c25fd`).
> ⛔ **AUCUNE LIGNE DU MOTEUR SERVI N'A ÉTÉ MODIFIÉE. AUCUNE VERSION POSÉE. AUCUNE PUBLICATION.**
> V8 vit dans `tools/moteur_v8.js`, un simulateur Node que **rien** dans l'app ne charge.

## 🏷️ LA CONVENTION D'ÉTIQUETAGE, PARCE QU'ELLE COMMANDE TOUT

| | |
|---|---|
| **[A]** | fait **mesuré** dans Force Tracker (app servie, navigateur réel) |
| **[B]** | résultat scientifique **transmis de l'extérieur**, que je n'ai pas lu à la source |
| **[C]** | **inférence** que je tire de A et B |
| **[D]** | **choix produit** |
| **[E]** | point qui **reste incertain** |

⛔ **Je ne transforme jamais B en A.** Mon environnement ne peut toujours pas ouvrir une
publication : `connect_rejected` sur 16 domaines scientifiques, seul `api.github.com` répond.
Ce que j'ai pu faire, et c'est différent, c'est **contre-vérifier chaque affirmation par une
recherche indépendante** et comparer ce qui en revient.

---

# PARTIE I — CONTRE-VÉRIFICATION DU DOSSIER SCIENTIFIQUE EXTERNE

## Le tableau

| # | Affirmation | Source retrouvée | **Unité** | Population | Contexte | **Verdict** | Limites | Conséquence pour Force Tracker |
|---|---|---|---|---|---|---|---|---|
| 1 | Protéines 2,3–3,1 g/kg | **Helms, Aragon & Fitschen 2014**, JISSN | ⭐ **MASSE MAIGRE (LBM)** | bodybuilders naturels | **préparation de concours, déficit, sujets secs** | **CONFIRMÉE** | narrative review, pas un essai ; « most but not all » | barème protéique **en masse maigre**, pas en poids |
| 2 | « plus sec + plus gros déficit → plus haut dans la plage » | Helms 2014 | — | idem | idem | **CONFIRMÉE** | règle qualitative, aucun barème chiffré | modulation par masse grasse **et** sévérité du déficit |
| 3 | Lipides 15–30 % des calories | Helms 2014 | **% énergie** | idem | prépa | **CONFIRMÉE** | idem | plancher lipidique **en % de l'énergie** |
| 4 | Perte 0,5–1 %/semaine | Helms 2014 | **% du poids/sem** | idem | prépa | **CONFIRMÉE** | idem | la vitesse devient le pilotage |
| 5 | Plateau protéique ~1,6 g/kg | **Morton et al. 2018**, méta-analyse + méta-régression, > 1 800 sujets | ⭐ **POIDS DE CORPS** | adultes sains | entraînement en résistance, **hors déficit** | **CONFIRMÉE MAIS CONTEXTUELLE** | c'est un **point de rupture moyen**, pas un plafond individuel | sert de repère de maintien, **jamais** de plafond |
| 6 | 0,7 %/sem > 1,4 %/sem | **Garthe et al. 2011**, IJSNEM | % du poids/sem | **24 athlètes d'élite** | perte + entraînement en force | **CONFIRMÉE MAIS CONTEXTUELLE** | n = 24, athlètes d'élite ; les deux groupes ont perdu **le même poids** (5,6 / 5,5 %) | 0,7 %/sem retenu comme vitesse de référence |
| 7 | Déficit > 500 kcal/j nuit à la masse maigre | **Murphy & Koehler 2022**, Scand J Med Sci Sports, méta-analyse + méta-régression | ⭐ **kcal/jour ABSOLU** | entraînement en résistance ≥ 3 sem | déficit | **CONFIRMÉE** | méta-régression : une tendance, pas une falaise | **plafond absolu** de déficit |
| 8 | Surplus 10–20 %, +0,25–0,5 %/sem | **Iraki, Fitschen, Espinar & Helms 2019**, *Sports* | % TDEE / % poids/sem | bodybuilders **novices/intermédiaires** | hors saison | **CONFIRMÉE MAIS CONTEXTUELLE** | « avancés : plus conservateur » | on prend le **bas** de la plage |
| 9 | Protéines 1,6–2,2 g/kg | Iraki 2019 | **POIDS DE CORPS** | bodybuilders | hors saison | **CONFIRMÉE** | — | contexte « prise de muscle », différent du déficit |
| 10 | Lipides 0,5–1,5 g/kg | Iraki 2019 | poids de corps | bodybuilders | hors saison | **CONFIRMÉE** | — | ⚠️ **corrige MA propre rétractation** (voir plus bas) |
| 11 | Un surplus important n'ajoute que du gras | **Helms et al. 2023**, *Sports Med Open*, 8 sem., maintien vs +5 % vs +15 % | — | entraînés | prise de masse | **CONFIRMÉE** | n modeste, 8 semaines | **×5 de masse grasse, aucun gain de force ni de masse maigre** |
| 12 | …mais la littérature n'est pas unanime | *« Greater energy surplus promotes body protein accretion »*, essai randomisé 2024 | — | jeunes hommes sains | suralimentation | ⚠️ **CONTRADICTION EXISTANTE** | non lue | on reste **conservateur**, et on le dit |
| 13 | Glucides : pas de bénéfice ergogénique à ≤ 10 séries/groupe, nourri | **Henselmans et al. 2022**, *Nutrients*, revue systématique, **49 études** | ⭐ **nombre de séries par groupe musculaire** | pratiquants de force | aigu **et** long terme (15/17 études sans différence) | **CONFIRMÉE** | peu d'études isocaloriques | ⚠️ **je l'avais MAL employée** (voir plus bas) |
| 14 | Glucides 4–7 g/kg sports de force | Slater & Phillips 2011, **cité** partout | poids de corps | bodybuilders | — | **NON VÉRIFIABLE** (source secondaire) | jamais lue | ⛔ ne fonde **aucune** borne dure |
| 15 | ANSES : 1,3–1,5 g/kg sportifs de force · plafond de sécurité **2,2 g/kg** | rapport ANSES *« Apport en protéines »*, via **sources françaises secondaires** | poids de corps | sportifs de force | population générale et sportive | **PARTIELLEMENT CONFIRMÉE** | le rapport lui-même est inaccessible | plafond **mesuré avec ET sans** (V8 / V8nc) |
| 16 | Disponibilité énergétique : `(apports − dépense d'exercice) / masse maigre`, LEA < **30 kcal/kg FFM**, optimal 45 | **CIO, consensus RED-S 2018** | **kcal/kg de masse maigre** | athlètes H et F | chronique | **CONFIRMÉE** | ⛔ le consensus dit lui-même que le seuil **ne prédit pas l'aménorrhée chez toutes les femmes** | garde-fou qui **relève** une cible, jamais un diagnostic |
| 17 | « Recommandations russes » 5–7 / 7–10 g/kg | — | — | — | — | ⛔ **NON VÉRIFIABLE** | **aucun document officiel russe retrouvé** | ⛔ ne fonde **aucune** règle |
| 18 | « Recommandations japonaises » | relevé de consommations : **5,0 / 6,4 / 8,3 g/kg** (foot / fond / cyclisme) | poids de corps | athlètes japonais | **enquête alimentaire** | ⛔ **CONTESTÉE — c'est une OBSERVATION, pas une recommandation** | l'article dit que ces apports étaient **insuffisants** vs les recommandations | utile comme **ancre du réel**, pas comme règle |
| 19 | Lipides 0,8–1,2 g/kg, 20–35 % | blog commercial de powerlifting | — | — | — | ⛔ **NON VÉRIFIABLE** | source non scientifique | ⛔ écartée |
| 20 | TDEE calculé = estimation | — | — | — | — | **CONFIRMÉE par construction** | Mifflin/Katch sont des régressions de population | ⛔ jamais présenté comme une mesure |

## ⚠️ CE QUE CETTE CONTRE-VÉRIFICATION CORRIGE — Y COMPRIS CHEZ MOI

**① ChatGPT a raison sur le point qui bloquait tout.** La plage 2,3–3,1 g/kg est bien exprimée
en **masse maigre**. ⛔ **Et mon dossier du 22/09 avait tort deux fois de suite** : d'abord en
affirmant « poids de corps », puis en retirant cette affirmation **sans la remplacer**. La
question est tranchée, et elle l'est dans le sens que ChatGPT indiquait.
⚠️ *Nuance de vocabulaire* : Helms écrit **LBM** (lean body mass), ChatGPT écrit **FFM**. Les
deux sont employés indifféremment en pratique mais ne sont pas strictement identiques ; aucune
conséquence chiffrée ici, je le note pour ne pas propager une fausse précision.

**② ChatGPT a raison sur Morton, et sa mise en garde aussi.** ~1,62 g/kg **de poids de corps**
est bien le point de rupture de la méta-régression. ⛔ Ce n'est **pas** un plafond : la
population n'était pas en déficit, et un point de rupture moyen ne décrit personne en
particulier. *Morton et Helms ne se contredisent pas — ils ne parlent pas de la même situation.*

**③ ⚠️ MA PROPRE RÉTRACTATION DU 22/09 SUR LES LIPIDES ÉTAIT FAUSSE.** J'avais écrit que
« 0,5 g/kg n'est pas une recommandation mais une condition expérimentale ». **Iraki 2019 donne
explicitement 0,5–1,5 g/kg** pour les bodybuilders hors saison — c'est la borne basse d'une
plage publiée et revue par les pairs. 👉 ***Conséquence directe : les ratios lipidiques actuels
de Force Tracker (0,75 à 1,0 g/kg) sont à l'intérieur de cette plage, et mon dossier précédent
avait tort de les présenter comme « systématiquement au bas de la plage ».*** Face aux 15–30 %
de Helms, les 33 % de la population sous 20 % des calories **ne sont pas une violation**.

**④ ⚠️ J'AVAIS MAL EMPLOYÉ HENSELMANS — c'est le piège n°10 de la liste de Michel, commis par
moi.** Sa revue dit que **des glucides SUPPLÉMENTAIRES n'améliorent pas la performance** à
≤ 10 séries par groupe musculaire chez quelqu'un de nourri. J'en avais fait une **bande maximale
d'apport** (4–8 g/kg selon la charge). ⛔ C'est faux : quelqu'un dont la dépense est élevée a
besoin de ces calories, et elles doivent bien aller quelque part. *Transformer « pas de bénéfice
ergogénique supplémentaire » en « plafond d'apport » est exactement transformer une plage de
littérature en seuil physiologique.* Le compteur est **reclassé en OBSERVATION** (`O13`) dans
tout le banc.

**⑤ « Recommandations russes » : introuvables.** Ma recherche indépendante ne retrouve **aucun**
document officiel russe. Les valeurs citées (5–7 / 7–10 g/kg) correspondent à des plages
internationales courantes, mais **l'attribution n'est pas vérifiée**. ⛔ Elle ne fonde rien.

**⑥ « Recommandations japonaises » : ce n'en sont pas.** Ce que je retrouve est une **enquête de
consommation** chez des athlètes japonais (5,0 g/kg au football, 6,4 en fond, 8,3 en cyclisme),
et l'article conclut que ces apports étaient **insuffisants** par rapport aux recommandations.
👉 ***C'est une observation présentée comme une recommandation*** — le piège n°9 de la liste.
⭐ Elle reste **très utile autrement** : elle donne une ancre du réel. Même des **cyclistes** —
sport d'endurance — mangent 8,3 g/kg. Les 10 à 15 g/kg que V0 prescrit à des pratiquants de
musculation sont donc au-delà de ce que mangent des athlètes d'endurance professionnels.

---

# PARTIE II — LE DOSSIER DE DÉCISION V8 (30 RÉPONSES)

## 1. Qu'est-ce qui est FAUX dans V0 ?

**[A] Six défauts mesurés**, tous reproduits dans l'app servie (miroir revalidé : **3 597
profils, 0 écart, 0 erreur de page**) :

| défaut | mesure |
|---|---|
| ⛔⛔ **la fermeture** : la cible affichée ≠ la somme des macros | jusqu'à **+450 kcal** ; **287 profils pour 100 000** au-delà de 5 kcal en population plausible |
| ⛔ **protéines au-dessus du plafond ANSES** (2,2 g/kg) | **57 100 pour 100 000** (57 %) |
| ⛔ **protéines au-dessus de Helms** (3,1 g/kg de masse maigre) | **42 978 pour 100 000** (43 %) |
| ⛔ **déficit au-delà de 500 kcal** (Murphy & Koehler) | **7 051 pour 100 000** |
| ⛔ **disponibilité énergétique sous 30 kcal/kg FFM** | **3 937 pour 100 000** |
| ⛔ **la masse maigre n'atteint jamais la répartition** | Δ protéines = 0, Δ lipides = 0 entre 12 % et 38 % de masse grasse |

## 2. Qu'est-ce qui était finalement CORRECT dans V0 ?

⭐ **Plus de choses que mes deux dossiers précédents ne le disaient.**

* **Les lipides.** 0,75–1,0 g/kg est **dans** la plage d'Iraki (0,5–1,5). Face aux 15–30 % de
  Helms, V0 ne viole quasiment rien : **1 778 pour 100 000** sous 15 %.
* **L'architecture « glucides = résidu ».** L'ANSES **refuse elle-même** de fixer un intervalle
  glucidique propre. Le défaut n'est pas la méthode, c'est l'absence de contrôle sur son
  résultat.
* ⭐⭐ **Le déficit FIXE de −450 kcal.** Il est **sous** le plafond de 500 kcal de Murphy &
  Koehler — donc **plus défendable que ma propre V5**, qui le rendait proportionnel et
  produisait **−757 kcal** à 150 kg. *Ma « correction » de la semaine dernière empirait ce
  qu'elle prétendait corriger.*
* **La médiane glucidique** : 4,74 g/kg en population plausible — au milieu des plages citées.
* **Le plancher calorique** (1 500 H / 1 200 F) et le refus de relever une cible manuelle.

## 3. Quelles conclusions de mes anciens audits étaient FAUSSES ?

1. ⛔ « ISSN donne 2,3–3,1 g/kg de **poids de corps** » → **faux**, c'est la masse maigre.
2. ⛔ « 0,5 g/kg de lipides n'est pas une recommandation » → **faux**, c'est la borne basse
   d'Iraki 2019.
3. ⛔ « Le moteur est systématiquement au bas de la plage lipidique » → **non pertinent** face à
   Helms (15–30 %).
4. ⛔ « Le gradient de déficit est inversé par rapport à la littérature » → **incomplet** : le
   sujet léger à −0,8 %/sem est **dans** la plage 0,5–1 % de Helms ; c'est le sujet **lourd**
   qui est sous-dosé. Et le corriger proportionnellement **viole** Murphy & Koehler.
5. ⛔ « −0,53 %/sem à 60 kg » → chiffre non reconstructible, remplacé par une mesure avec sa
   formule écrite.
6. ⛔ Ma bande glucidique tirée de Henselmans → **mauvaise application de la source**.

## 4. Quelles conclusions restent INCERTAINES ? **[E]**

* **[E1]** Aucune source primaire n'a été lue. Tout le volet scientifique est **secondaire**.
* **[E2]** La plage 4–7 g/kg de glucides (Slater & Phillips) reste non vérifiée.
* **[E3]** Le plafond ANSES de 2,2 g/kg vient de sources françaises secondaires.
* **[E4]** Le surplus optimal n'est **pas établi** : Helms 2023 dit « +5 % suffit », un essai
  randomisé 2024 suggère l'inverse.
* **[E5]** Aucune borne de **praticabilité** n'existe dans la littérature consultée.
* **[E6]** Les positions russes et asiatiques restent **inconnues**.
* **[E7]** La dépense d'exercice de la formule RED-S est **estimée** (≈ 7 kcal/kg/séance), pas
  mesurée.

## 5–6. La règle PROTÉINES, et pourquoi

**Barème en MASSE MAIGRE, bornes en POIDS DE CORPS. ⛔ Jamais les deux dans le même calcul.**

| objectif | g/kg de **masse maigre** | origine |
|---|---|---|
| équilibre | 1,9 | **[C]** Morton 1,62 g/kg de poids ≈ 1,9 g/kg de masse maigre à 15 % de gras |
| endurance | 1,8 | **[D]** |
| force · muscle | 2,0 | **[B]** Iraki 1,6–2,2 g/kg de poids, converti |
| recomposition | 2,4 | **[B]** bas de Helms |
| perte | 2,3 → **3,1** | **[B]** Helms, modulé par sécheresse (**+0,5** si sec, **+0,2** si moyen) et sévérité du déficit (**+0,3** au maximum) |

**Bornes en poids de corps** : **1,4 g/kg** au plancher **[B]**, **2,2 g/kg** au plafond **[E3]**.

⚠️ **Et un fait mesuré qu'il faut dire** : chez un sujet **sec**, c'est le **plafond ANSES** qui
commande, pas Helms — 0,94 × 3,1 = 2,91 g/kg de poids, donc le plafond tranche avant que la
modulation ne se voie. **La variante `V8nc` mesure exactement ce que ce plafond change** :
**9 268 pour 100 000** au lieu de 0 sur le plafond de 2,2, et **38** au lieu de 0 sur Helms.

## 7–8. La règle LIPIDES, et pourquoi

`fat = poids × ratio(objectif)` (**0,75 à 1,0 g/kg**, inchangé — il est **dans** Iraki), puis :

* plancher **0,5 g/kg** **[B Iraki]** · plancher **15 % des calories** **[B Helms]**
* plafond **1,5 g/kg** **[B Iraki]** · plafond **35 % des calories** **[C]**, extension de
  Helms (30 %) pour laisser de la place à l'arbitrage

⛔⛔ **ET DEUX BORNES PUBLIÉES SE CONTREDISENT — je le nomme au lieu de choisir en silence.**
Au-delà de ~120 kcal/kg, « au moins 15 % des calories » et « au plus 1,5 g/kg » sont
**incompatibles** : chez 42 kg visant 5 000 kcal, 15 % de l'énergie font **2,0 g/kg**. V8 émet
alors le signal **`bornes_lipides_en_conflit`**. *Aucune des deux n'est fausse — c'est l'entrée
qui est absurde, et c'est ça qu'il faut dire.*

⚠️ **Et l'ORDRE d'application est une décision, que le contre-audit a corrigée** : le plafond
s'applique d'abord, le **plancher de santé tranche ensuite**. Dans l'autre sens, mesuré :
**0,45 g/kg**, sous une borne de santé publiée.

## 9–10. La règle GLUCIDES, et pourquoi

**Les glucides restent le RÉSIDU. ⛔ Aucun plafond dur, aucune calorie jetée.**

C'est ce que la science consultée permet de défendre, et rien de plus :
① l'**ANSES refuse** de fixer un intervalle glucidique propre ; ② **Henselmans** ne parle que du
**bénéfice ergogénique de glucides supplémentaires**, pas d'une limite d'apport ; ③ la plage
4–7 g/kg n'est **pas vérifiable**.

⭐ **Ce que V8 ajoute est un ARBITRAGE puis un SIGNAL, jamais une troncature** :
1. si les glucides dépassent la bande justifiée par la charge d'entraînement, on **rééquilibre
   vers les lipides** — ⛔ dans la limite de **1,5 g/kg** et de **35 % des calories** ;
2. s'ils la dépassent encore, on émet `gluc_au_dela_de_la_charge` ;
3. si la cible dépasse **55 kcal/kg** (Iraki observe ~45 chez les bodybuilders), on émet
   `tdee_a_reexaminer` — 👉 ***le problème est en amont, dans le TDEE et le niveau d'activité,
   pas dans l'assiette.***

## 11. PERTE DE POIDS

**Une VITESSE, puis deux bornes.**
`vitesse = −0,5 %/sem si sec → −1,0 %/sem si forte masse grasse` **[B Helms 0,5–1 %]**,
**interpolée** (le contre-audit a trouvé une marche de **136 kcal** entre 12 % et 13 % de gras),
ancrée sur **0,7 %/sem** **[B Garthe]** au milieu. Puis **déficit ≤ 500 kcal/j** **[B Murphy &
Koehler]**. Puis le garde-fou RED-S, puis le plancher calorique.

⛔⛔ **LE CONFLIT EST RÉEL ET IL EST MESURÉ — je ne le masque pas :**

| poids | vitesse voulue | déficit demandé | **appliqué** | vitesse obtenue |
|---|---|---|---|---|
| 50 kg | −0,50 %/sem | −275 | −176 | −0,32 %/sem |
| 70 kg | −0,68 %/sem | −521 | −419 | −0,54 %/sem |
| 85 kg | −0,83 %/sem | −780 | **−499 ⛔ plafonné** | −0,53 %/sem |
| 120 kg | −1,00 %/sem | −1 320 | **−498 ⛔ plafonné** | −0,38 %/sem |
| 150 kg | −1,00 %/sem | −1 650 | **−499 ⛔ plafonné** | −0,30 %/sem |

👉 ***Au-delà de ~75 kg, la vitesse de Garthe et le plafond de Murphy & Koehler ne peuvent pas
être satisfaits ensemble.*** **[C] Je tranche techniquement** : le plafond absolu gagne, parce
que ① il vient d'une **méta-analyse** et non d'un essai à n = 24, ② la population de Garthe
(athlètes d'élite) est plus légère et plus sèche que les profils concernés, ③ l'objectif commun
des deux sources est la **préservation de la masse maigre**, et c'est ce que mesure Murphy &
Koehler. ⚠️ **Le coût est réel et il est dit** : une personne de 150 kg perd 0,30 %/sem, c'est
lent. *C'est un choix conservateur assumé, pas une victoire.*

## 12. PRISE DE MUSCLE

`+0,25 %/sem` (novice/intermédiaire) ou `+0,125 %/sem` (confirmé) **[B Iraki]**, plafonné à
**+15 % du TDEE** **[B Helms 2023]**.
⭐ **Pourquoi le BAS de la plage d'Iraki** : Helms 2023 a comparé +5 % et +15 % pendant 8
semaines chez des entraînés → **×5 de masse grasse, aucun gain supplémentaire** de force ni de
masse maigre. ⚠️ **[E4]** Un essai randomisé de 2024 suggère l'inverse ; **on reste
conservateur et on l'écrit.**

## 13. RECOMPOSITION

`−0,25 %/sem`. **[D]** — et **pas inventé** : `state.js` porte déjà une décision actée,
`trendPourObjectif(recomp) = −0,3 à 0 kg/semaine`. −0,25 %/sem y tombe pour un adulte moyen.
*Une décision actée reste actée* (règle d'or #15).

## 14. FORCE

`+0,1 %/sem` (`+0,05` si confirmé). **[D]** — aucune source consultée ne donne de cible
spécifique à la force ; c'est un petit surplus assumé comme tel.

## 15. Comment le VOLUME d'entraînement intervient-il ?

**[A] Dans V0 : pas du tout.** 0 vs 6 séances/semaine → **0 kcal d'écart**.
**Dans V8, à deux endroits, et seulement là où c'est défendable :**
1. **la dépense d'exercice** de la formule RED-S dépend du nombre de séances **[C]** ;
2. **la bande glucidique justifiée** dépend des séries par groupe musculaire **[B Henselmans]**
   — mais elle n'alimente qu'un **signal**, jamais une troncature.
⛔ **Le volume ne change PAS la cible calorique de base** : `activityLevel` contient déjà
l'entraînement, et y ajouter les séances le compterait **deux fois** (défaut corrigé en
ft-v949). *On ne refait pas un bug qu'on a déjà payé.*

## 16. Comment DISCIPLINE et NIVEAU interviennent-ils ?

**[A] Mesuré : discipline → 0 écart sur les 5. Niveau → 0 écart sur les 4.**

* **Discipline : B — aucune raison scientifique suffisante.** Les 5 disciplines de Force Tracker
  sont **toutes des sports de force**. Aucune source consultée ne différencie bodybuilding et
  powerlifting sur l'énergie ou les macros. ⛔ **On ne fabrique pas deux coefficients pour faire
  joli.** Si leur volume réel diffère, c'est le **volume** qui doit produire la différence.
* **Niveau : A — il doit intervenir, et il intervient.** Iraki distingue explicitement
  novice/intermédiaire et **avancé** (« plus conservateur »). V8 utilise `S.level` pour la
  vitesse de prise. ⭐ **C'est la seule donnée « morte » de V0 que la science justifie de
  brancher.**

## 17. Comment le TDEE est-il RECALIBRÉ ?

⛔ **Rien n'est implémenté** — c'est une conception, et je le dis plutôt que de le suggérer.
La boucle, **entièrement déterministe, sans IA** :

```
profil → TDEE ESTIMÉ (Mifflin ou Katch) → cible → prescription
   ↑                                                    ↓
recalibrage ← écart mesuré ← tendance de poids 7/14/28 j ← consommation observée
```
* La brique qui manque n'est **pas** le calcul : c'est de savoir **ce qui a réellement été
  mangé**. Force Tracker a `S.foodLog` mais il est **facultatif**, et le principe 4 assume
  qu'une partie des gens ne le tiendront pas.
* **[C] Le recalibrage sans journal reste possible** : `TDEE_réel ≈ TDEE_estimé − (Δpoids × 7 700 / jours)`
  quand la personne suit à peu près sa cible. ⛔ Mais il faut **≥ 14 jours** et une tendance,
  jamais deux pesées (R12).
* ⛔ **Jamais appliqué tout seul** : on montre l'écart, la personne tranche (R29, et c'est déjà
  ce que fait `ecartNiveauActivite`).

## 18. Comment fonctionne l'HISTORIQUE ?

⛔ **Non implémenté.** Conception (reprise et précisée de `VERROU-NUTRITION` §11) :
* une constante `MOTEUR_NUTRI_VERSION`, **un seul propriétaire** (R2) ;
* une **PÉRIODE** s'ouvre quand un paramètre structurant change (poids, masse grasse, activité,
  objectif, fréquence, calories manuelles, méthode) ;
* chaque période porte : profil · méthode · TDEE estimé · calories prescrites · macros
  prescrites · observé · résultat ;
* ⛔ **aucune migration** : une ligne sans version se lit *« avant le versionnement »* — ce qui
  est vrai — plutôt que d'être remplie d'une valeur plausible (règle d'or #16).

## 19. Quels GARDE-FOUS ?

| # | garde-fou | borne | origine |
|---|---|---|---|
| P01 | **fermeture** : cible = somme des macros | exact | **cohérence interne — aucune source requise** |
| P02/P03 | aucune macro négative, aucun NaN | — | arithmétique |
| P09 | déficit | ≤ 500 kcal/j | **[B]** Murphy & Koehler |
| P10 | surplus | ≤ 15 % du TDEE | **[B]** Helms 2023 |
| P11 | protéines | [1,4 ; 2,2] g/kg poids · ≤ 3,1 g/kg masse maigre | **[B/E3]** |
| P12 | lipides | [0,5 ; 1,5] g/kg · [15 % ; 35 %] des calories | **[B]** Iraki + Helms |
| P19 | disponibilité énergétique | ≥ 30 kcal/kg de masse maigre | **[B]** CIO/RED-S |
| P20 | plausibilité | signal au-delà de 55 kcal/kg | **[B]** Iraki (~45 observé) |
| — | plancher calorique | 1 500 H / 1 200 F | **[D]** décision maison, déjà servie |

## 20. Comment la FERMETURE est-elle garantie ?

Les glucides sont le **résidu**, donc `P×4 + L×9 + G×4` ne peut manquer la cible que par
l'arrondi du gramme. **V8 rend alors la somme des macros comme cible** — l'écran ne peut plus
afficher deux totaux différents.

⛔⛔ **ET P01 ENTRE EN CONFLIT AVEC P15 (cible manuelle), MATHÉMATIQUEMENT.** Les macros sont en
grammes entiers ; à protéines et lipides fixés, la somme avance **par pas de 4 kcal**. Une cible
manuelle de 3 000 kcal n'est **en général pas atteignable exactement**. 👉 **Le choix est forcé
et il est le bon : la cible affichée EST la somme des macros**, et la cible manuelle est honorée
**à ≤ 2 kcal près** — borne **prouvée sur 5 201 cibles**. *Afficher 3 000 au-dessus de macros
qui en font 2 999 recréerait exactement le défaut que ce chantier ferme.*

Quand les minimums de sécurité **dépassent** la cible (cible manuelle à 600 kcal), V8 remonte au
minimum réalisable et **déclare `cible_infaisable`** au lieu d'afficher une contradiction.

## 21–22. RÉSULTATS DES CORPUS

**Corpus A — quadrillage adversarial : 756 000 profils. Corpus B — population plausible :
1 000 000.** ⛔ **La fréquence de A n'est pas une prévalence** : A met sur le même plan « 150 kg
pour 148 cm » et « 75 kg pour 178 cm ». ⚠️ **B est un MODÈLE**, pas un recensement — l'app ne
remonte pas ces distributions.

**Taux pour 100 000, corpus B :**

| propriété | **V0** | V4 | V5 | V6 | V7 | **V8** | V8nc |
|---|---|---|---|---|---|---|---|
| P01 fermeture > 5 kcal | 287 | 287 | 210 | 210 | 210 | **0** | **0** |
| P09 déficit > 500 kcal | 7 051 | 7 051 | 13 586 | 13 586 | 13 586 | **401** | **401** |
| P10 surplus > 20 % | 4 281 | 4 281 | 0 | 0 | 0 | **0** | **0** |
| P11 protéines > 2,2 g/kg | 57 100 | 54 271 | 54 271 | 54 271 | 54 271 | **0** | 9 268 |
| P11 protéines > 3,1 g/kg masse maigre | 42 978 | 41 010 | 41 010 | 41 010 | 41 010 | **0** | 38 |
| P11 protéines > 40 % des calories | 3 458 | 3 000 | 3 325 | 3 325 | 3 325 | **0** | **0** |
| P12 lipides < 15 % des calories | 1 778 | 1 778 | 1 720 | **0** | **0** | **0** | **0** |
| P12 lipides > 1,5 g/kg | **0** | **0** | **0** | 3 727 | 3 727 | **0** | **0** |
| P12 lipides > 35 % des calories | 191 | 191 | 210 | 860 | 1 051 | **77** | **77** |
| P13 glucides > 12 g/kg | 172 | 172 | 153 | **0** | **0** | **0** | **0** |
| P13 glucides > 600 g (praticabilité) | 3 459 | 3 803 | 4 473 | **2 160** | **2 160** | 2 523 | 2 523 |
| P19 disponibilité énergétique < 30 | 3 937 | 3 937 | 5 103 | 5 103 | 5 103 | **1 777** | **1 777** |
| P20 kcal/kg > 55 | 1 452 | 1 452 | 1 414 | 1 414 | 1 414 | **631** | **631** |
| *O13 glucides au-delà de la charge* (observation) | 22 339 | 22 569 | 21 136 | **18 173** | **18 173** | 21 899 | 21 690 |

## 23. EXTRÊMES DE V8

| | V0 médiane / p99 | **V8** médiane / p99 |
|---|---|---|
| glucides g/kg | 4,74 / 9,72 | **5,00 / 8,28** |
| glucides absolus | 360 / 656 g | **368 / 646 g** |
| protéines g/kg poids | 2,20 / 3,14 | **1,64 / 3,08** |
| protéines g/kg masse maigre | 3,06 / 4,46 | **2,17 / 4,06** |
| lipides g/kg | 0,89 / 3,68 | **0,90 / 3,53** |
| kcal/kg | 36,71 / 56,69 | **35,86 / 53,67** |
| vitesse %/sem | 0,12 / 0,80 | **0,09 / 0,42** |
| disponibilité énergétique | 44,77 / 67,08 | **43,59 / 62,93** |

**Les 14 cas obligatoires :**

| cas | V0 | **V8** |
|---|---|---|
| F 78 a · 148 cm · 120 kg · perte | 1 614 kcal · P300 L96 G0 · **fermeture +450** | **1 664 · P168 L64 G104 · fermeture 0** |
| H 55 kg très actif muscle | 3 287 · P121 L50 **G588 (10,7 g/kg)** | **3 090 · P96 L82 G492** + 2 signaux |
| H 85 kg métier physique très actif | 4 307 · P187 L77 **G717** | **4 190 · P129 L106 G680** |
| H 45 kg · 195 cm · 18 a · très actif | 3 460 · P99 L41 **G674 (15,0 g/kg)** | **3 235 · P87 L67 G571** + 2 signaux |
| H 150 kg sédentaire perte | 2 809 · P375 **(2,5 g/kg)** L120 G57 | **2 859 · P210 L111 G255** |
| **cible manuelle 600 kcal** | **600 affiché, macros = 1 441** | **863 · fermeture 0 · `cible_infaisable`** |
| H 80 kg **7 % de gras** perte | 3 060 · P200 L64 G421 | **3 072 · P176 L64 G448** · `prot_plafonnee` |
| H 120 kg **42 % de gras** perte | 2 225 · P300 L96 G40 | **2 330 · P170 L90 G210** · garde RED-S |
| F 42 kg · 150 cm perte | 1 200 · P105 L34 G119 | **1 202 · P86 L34 G138** |
| H 130 kg recomp | 3 327 · P338 **(2,6 g/kg)** L111 G244 | **3 219 · P196 L111 G359** |
| TDEE très élevé (110 kg, 1,9, physique) | 5 019 · P242 L99 G790 | **4 971 · P163 L99 G857** |
| TDEE très faible (F 45 kg, 80 a) | 1 200 · P90 L38 G125 | **1 202 · P63 L38 G152** |
| H 100 kg kéto perte | 1 992 · fermeture +3 | **2 169 · fermeture 0** · garde RED-S |
| H 100 kg low-carb perte | 1 992 · fermeture +4 | **2 169 · fermeture 0** · garde RED-S |

## 24. COMPARAISON — et **où V8 est MOINS BONNE**

⛔ **Je l'écris, comme demandé.**

1. **V6 et V7 sont meilleures sur la praticabilité brute** : 2 160 contre 2 523 pour 100 000
   au-dessus de 600 g de glucides. Elles y arrivent en **tronquant** à 7 g/kg — ce que Michel a
   interdit, et elles le paient : **3 727 pour 100 000 au-dessus de 1,5 g/kg de lipides**, une
   borne publiée que V0 ne franchissait jamais.
2. **V6 et V7 sont meilleures sur l'observation O13** (18 173 contre 21 899), pour la même
   raison et au même prix.
3. ⚠️ **V8 donne un peu PLUS de glucides en médiane** (5,00 contre 4,74 g/kg) : elle réduit les
   protéines, donc le résidu grandit. *Une correction qui améliore une macro en déplace une
   autre — c'est arithmétique, et il faut le dire.*
4. ⚠️ **Il reste 401 profils pour 100 000 au-delà du plafond de déficit** en V8. **Tous sont des
   régimes kéto/low-carb, et le dépassement le pire est de 3 kcal** (mesuré sur 200 000
   profils) — un résidu d'arrondi, pas une brèche.
5. ⚠️ **19 profils pour 100 000 sous 0,8 g/kg de protéines** : identique dans **toutes** les
   variantes, y compris V0 — ce sont des profils kéto, dont la répartition est une décision de
   la personne.
6. ⚠️ **V8 est plus COMPLEXE** : ~150 lignes contre ~25. C'est un coût réel (R19).

⭐ **Sur tout le reste, V8 domine** — et surtout sur le seul défaut qui ne demande aucune source
externe : **la fermeture**.

## 25. CONTRE-AUDIT DE V8 — ce qu'il a trouvé **dans ma propre candidate**

| # | défaut trouvé | mesure | fermeture |
|---|---|---|---|
| ① | le low-carb ne fermait pas | jusqu'à 6 kcal | lipides en résidu, comme le kéto le fait déjà |
| ② | **le plafond protéique arrondi au plus proche** | 5 121/100 000 au-dessus de 2,2 g/kg | `Math.floor` — *un plafond s'arrondit vers le bas* |
| ③ | **V8 supprimait la phase charge/décharge en silence** | — | rétablie (décision actée, règle d'or #15) |
| ④ | le plafond de déficit était vérifié sur la cible **visée** | 2 713/100 000 dépassaient de 1–2 kcal | vérifié sur la valeur **servie** |
| ⑤ | **le rééquilibrage vers les lipides dépassait Iraki** | p99 à **2,27 g/kg** | borné à 1,5 g/kg — *déplacer l'absurdité n'est pas la résoudre* |
| ⑥ | **marche d'escalier** de 136 kcal entre 12 % et 13 % de gras | 1 saut | vitesse **interpolée** |
| ⑦ | **l'ordre des bornes lipidiques faisait perdre le plancher de santé** | **0,45 g/kg** | plafond d'abord, plancher ensuite |
| ⑧ | **deux bornes publiées se contredisent** au-delà de 120 kcal/kg | — | signal `bornes_lipides_en_conflit` |

**Résultat final du contre-audit :** continuité +1 kg → **0 saut > 120 kcal** · continuité
+1 % de masse grasse → **0 saut** · déterminisme → **0 échec** · profils sans solution → **0**.

## 26. RÉSULTATS DES MUTATIONS

`tools/temoins_v8.js` (bloc **B-CCCLIII**, ⛔ **non branché** dans le runner) : **50 témoins,
0 rouge**, dont **3 qui échouent volontairement sur V0** — c'est ce qui prouve qu'ils mesurent
un invariant et non le comportement de la candidate.

`tools/mut_v8.py` : **29 mutations sur arbre cloné, 29 conformes, 0 ancre morte**, dont **3 qui
doivent RESTER VERTES** (commentaires citant `Math.ceil`, `500 kcal`, `2,2 g/kg`, `0,5 g/kg`,
`SERIES_SEUIL`…).

⚠️⚠️ **ET LE CONTRÔLE NÉGATIF A D'ABORD RENDU 20/29 — 9 DE MES TÉMOINS NE MESURAIENT RIEN.**
Tous du même défaut : **le jeu de profils ne visitait jamais le régime où la règle mord.** Porter
le plafond de déficit de 500 à 1 500 kcal ne changeait rien parce qu'aucun de mes profils ne
l'atteignait. 👉 ***Un témoin qui ne visite pas le régime où la règle décide ne mesure pas la
règle, il mesure son absence.*** Les profils de déclenchement ont été trouvés **par balayage**,
pas choisis à la main.
⚠️ Deux autres holes, plus subtils : ⓐ V8 **garantit** `kcal = somme des macros` par
construction, donc la fermeture ne peut plus servir de témoin pour ce qui se passe en amont —
il a fallu épingler l'écart **cible visée / cible servie** ; ⓑ le **plafond ANSES masque** la
modulation de Helms, donc celle-ci se mesure sur `V8nc`.

## 27. CONFLITS SCIENTIFIQUES NON RÉSOLUS

1. ⛔⛔ **Garthe (0,7 %/sem) contre Murphy & Koehler (≤ 500 kcal/j)** — incompatibles au-delà de
   ~75 kg. **[C] Tranché techniquement** en faveur du plafond absolu, avec sa raison écrite.
2. ⛔ **Helms 15 % des calories contre Iraki 1,5 g/kg de lipides** — incompatibles au-delà de
   ~120 kcal/kg. **Signalé**, pas arbitré : l'entrée est absurde.
3. **[E4] Helms 2023 contre l'essai randomisé 2024** sur le surplus optimal. **Non résolu** —
   on reste conservateur.
4. **[E3] ANSES 2,2 g/kg contre Helms 3,1 g/kg de masse maigre** chez le sujet sec : à 6 % de
   gras, Helms autorise 2,91 g/kg de poids, l'ANSES plafonne à 2,2. **Mesuré dans les deux sens**
   (V8 / V8nc). ⚖️ **C'est un vrai choix, et il revient à Michel** (voir 28).
5. **[E2/E6]** Les plages glucidiques ne sont vérifiables nulle part, et deux aires
   géographiques restent inconnues.

## 28. CHOIX PRODUIT QUI RESTENT À MICHEL

⭐ **Trois seulement.** Tout le reste, les données permettaient de le trancher, et je l'ai fait.

| # | question | ce qui est mesuré | pourquoi je ne tranche pas |
|---|---|---|---|
| **D-016** | **Garde-t-on le plafond ANSES de 2,2 g/kg de poids ?** | V8 : 0 dépassement · V8nc : 9 268/100 000, et Helms passe de 0 à 38 | la source est **française et secondaire**, et elle **prime sur Helms chez le sujet sec**. Trancher, c'est choisir entre une borne de **sécurité générale** et une borne de **performance en sèche** — deux valeurs, pas deux chiffres |
| **D-017** | **Une cible manuelle irréalisable : on la remonte en le disant, ou on la laisse et on avertit ?** | 600 kcal saisis → V0 affiche 600 avec des macros à 1 441 ; V8 remonte à 863 et déclare `cible_infaisable` | « le chiffre saisi est le sien » est une **décision actée**. V8 la contredit pour tenir la fermeture. *Je ne rouvre pas une décision de Michel tout seul* (règle d'or #15) |
| **D-018** | **Une personne de 150 kg perd 0,30 %/sem. Est-ce acceptable ?** | c'est la conséquence directe du plafond de 500 kcal | c'est un arbitrage **sécurité contre vitesse**, et il se ressent dans l'usage réel, pas dans un tableau |

## 29. FICHIERS QUI SERAIENT MODIFIÉS APRÈS GO

| fichier | quoi | ampleur |
|---|---|---|
| `state.js` | `macrosForKcal`, `_autoKcalBrut`, `autoKcal`, `calcMacros` — **les fonctions existantes**, pas de moteur parallèle | ~150 lignes |
| `screens.js` | affichage des **signaux** et de l'état `infaisable` | ~30 lignes |
| `index.html` · `style.css` | le bandeau de signal | ~15 lignes |
| `tests/parcours/nutri_v8.js` | le bloc B-CCCLIII **branché** | nouveau |
| `tests/donnees/runner.js` | classer `level` (aujourd'hui non transmis) | 1 ligne |
| `sw.js` · `CLAUDE.md` · `docs/*` | version, journal, inventaire | — |

⛔ **Ni `coach.js`, ni `Code.js`, ni `worker.js`, ni `log.js`, ni `tracking.js`, ni
`constants.js`.** ⛔ **Aucun moteur parallèle** : `macrosForKcal` reste propriétaire unique.

## 30. TEMPS D'IMPLÉMENTATION

⛔ **Aucune estimation en semaines** — le brief l'interdit et il a raison.
Ce qui est **mesuré**, c'est le temps machine : banc complet **20,6 s** (dont validation du
miroir 1,4 s, corpus A 4,9 s, corpus B 10,9 s) · témoins **< 1 s** · 29 mutations **~4 min**.
La **passe produit complète** du dépôt dure **~25 minutes** et devra être relancée entière.
⚠️ Le temps de **décision** appartient à Michel, et les trois arbitrages ci-dessus le précèdent.

---

## 🎯 MA RECOMMANDATION TECHNIQUE

⭐ **Une seule chose est démontrable sans aucune source externe : la FERMETURE.** Un écran qui
affiche « 1 614 kcal » au-dessus de macros valant 2 064 se contredit lui-même. C'est le défaut
que je corrigerais en premier, et V8 le ferme complètement (**0 pour 100 000**).

⚠️ **Mais je ne recommande PAS de livrer V8 d'un bloc**, et voici pourquoi : ses gains
protéiques reposent sur **[E3]** (un plafond ANSES non vérifié à la source) et sur **[B]** (une
plage de Helms que je n'ai pas lue). Les livrer ensemble ferait passer une **décision
scientifique** sous couvert d'une **correction mathématique**.

**[C] L'ordre que je défends**, si Michel donne un GO :
1. **la fermeture seule**, avec le contrôle de faisabilité — aucune borne scientifique engagée ;
2. **le garde-fou de disponibilité énergétique** — la seule source dont le consensus est
   institutionnel (CIO) ;
3. **le plafond de déficit** de Murphy & Koehler — méta-analyse, borne absolue, effet mesurable ;
4. **le barème protéique en masse maigre** — seulement après l'arbitrage **D-016** ;
5. **les signaux de plausibilité** — ils ne changent aucun chiffre, ils expliquent.

⛔ Et **rien** de tout ça ne se déclenche sans le GO de Michel.

---

**V8 EST UNE CANDIDATE NON SERVIE.
AUCUNE MODIFICATION DU MOTEUR NUTRITIONNEL N'A ÉTÉ PUBLIÉE.
EN ATTENTE DU GO DE MICHEL.**
