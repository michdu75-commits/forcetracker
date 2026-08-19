# 🧠 Cerveau / cervelet — décharger Milo sans le diluer

> **Créé le 19/08/2026**, sur une idée de Michel formulée ce soir-là : *« pourquoi tout part d'un
> seul bloc ? dans une entreprise il y a le boss et la secrétaire »*, puis nommée par lui —
> **« le cerveau et le cervelet »**.
>
> ⚠️ **Ce document est écrit pour être PARTAGÉ** (ChatGPT, Gemini, une autre instance Claude), donc
> il est **autonome** : tout ce qu'il faut pour challenger la décision est dedans, chiffré, sans
> accès au code. Même esprit que `DESIGN-KIT.md` ou `MOTEUR-MET-A-COLLER.md`.
> 📌 **On ne demande pas un avis sur « faut-il le faire »** — c'est décidé. On demande un challenge
> sur **où passe la frontière** et sur **les modes de panne** (§7).

---

## 1. Ce qui est décidé

**Milo est le CERVEAU.** Il garde le jugement : diagnostiquer, adapter, décider, expliquer, parler.

**Une seconde IA est le CERVELET.** Elle exécute ce qui est mécanique : convertir, lire, calculer,
composer sous contraintes.

**⚠️ Le cervelet N'EXISTE PAS POUR L'UTILISATEUR.** C'est un service : il reçoit une demande de
l'app, il rend une donnée. L'app l'affiche, ou Milo s'en sert. **Deux IA, une seule voix** —
c'est la règle **R6** (*« une seule mémoire, une seule VOIX »*), et elle n'est pas négociable :
le jour où le cervelet parle en son nom, le produit a deux personnalités.

### ⭐⭐ 1.1 POURQUOI il existe — la raison, et le déclencheur (corrigé le 19/08)

> **Le cervelet existe parce que TRANSFORMER et JUGER sont deux métiers différents.
> Le plafond du prompt a été le DÉCLENCHEUR, pas la RAISON.**

⚠️ **La première version de ce document justifiait l'architecture par la contrainte** (*« le prompt
est plein »*). Une relecture extérieure a montré pourquoi c'est dangereux, et l'argument est
imparable : **une justification par la contrainte rend le périmètre ÉLASTIQUE.** Si le prompt se
remplit à nouveau, la tentation sera de déménager davantage — et c'est mot pour mot la dérive
que le §5.4 interdit.

Une justification par la **conception** donne au contraire une frontière **stable** : le critère
« transformation ou jugement ? » ne bouge pas selon la place disponible. Et l'architecture tient
debout toute seule, quel que soit le volume : elle est **plus testable** (une transformation se
vérifie mécaniquement, un jugement non), **plus remplaçable** (le modèle vit dans `worker.js` et
nulle part ailleurs), et **moins chère**.

*La nuance a l'air rhétorique. Elle décide de ce qu'on confiera au cervelet dans six mois.*

---

## 2. Le critère, en une phrase

> ### Est-ce que ça a besoin de savoir QUI est la personne ?
> **Oui → Milo. Non → le cervelet.**

Il se teste en dix secondes sur n'importe quelle tâche, et il ne demande aucune connaissance du
code. C'est ce qui le rend utilisable par quelqu'un d'autre que son auteur.

---

## 3. Pourquoi maintenant — la mesure du 19/08

L'idée existait depuis des semaines (voir §6). Ce qui a changé, c'est qu'on l'a **chiffrée**.

| | |
|---|---|
| Règles dans le prompt commun de Milo | **140** |
| Taille | **46 485 caractères** |
| Plafond que le projet s'est fixé | 46 500 |
| **Marge restante** | **15 caractères** |

**Plus aucune règle générique ne peut entrer sans qu'on en sorte une.** C'est arrivé deux fois dans
la même soirée : une règle sur la géographie de la salle a dû déménager faute de place, et la règle
sur les sources inventées a consommé toute la marge qu'on venait de gagner.

**⚠️ Et le dégraissage plafonne.** Mesuré le même soir : ce qui peut réellement sortir du prompt
*parce que le code le garantit déjà* représente **3 à 4 %**. La méthode marche (on l'a appliquée),
mais elle ne résout pas le problème.

**⚠️ Le plafond n'est PAS financier.** Le bloc commun est mis en cache 1 h et facturé ~10× moins.
Le seuil existe pour une seule raison, écrite dans le code : *« sa taille coûte peu, mais elle
DILUE les règles entre elles, et c'est ÇA le vrai prix »*.

### ⚠️ 3.1 Ce que le chiffre de 46 500 vaut vraiment — dit franchement

**C'est un cliquet posé par l'histoire, pas une mesure.** Il était à 45 000 ; il a été relevé à
46 500 le 12/08 parce qu'une spécification n'entrait plus. Personne n'a jamais mesuré qu'au-delà
d'un certain volume, telle règle cesse d'être suivie. *L'architecture est bonne indépendamment de
sa cause — mais la justification affichée n'était pas démontrée.* (Raison de plus pour la §1.1.)

### ⭐⭐ 3.2 LA MESURE QUI CHANGE LE PLAN — déchargement ≠ dilution (19/08)

Une relecture extérieure a posé la bonne objection : *« la dilution n'est pas proportionnelle au
volume, elle est proportionnelle au nombre de règles CONCURRENTES et à leur proximité sémantique.
3 700 caractères de spécification JSON ne diluent rien : c'est un bloc technique, sans concurrence
avec "ne culpabilise jamais". »* **Donc ft-v919 a libéré de la place, pas réduit la dilution.**

Mesuré bloc par bloc sur les **44 157 caractères** actuels :

| | Caractères | Part |
|---|---|---|
| **Règles de COMPORTEMENT** (méthode de coach, nutrition, personnalité, raisonnement, état du jour…) | **36 861** | **84 %** |
| Blocs portant encore de la mécanique | 7 079 | 16 % |
| …dont réellement **déchargeable** (le format seul, le jugement reste) | **≈ 2 000-2 500** | ≈ 5 % |

**⚠️ Conclusion, et elle change la suite** : le déchargement technique est **presque terminé**. Les
deux cibles restantes (réponses rapides, prochaine séance annoncée) pèsent 2 711 caractères de bloc,
dont **la moitié est du jugement** — *quand* poser une question rapide, *quoi* mérite d'être retenu :
ça reste chez Milo. Après elles, on sera à ~42 000 caractères **avec les 140 règles toujours là**.

*On a gagné de la CAPACITÉ. La FIABILITÉ, elle, n'est pas encore mesurée* (§8).
Les autres leviers — ceux qui s'attaquent vraiment à la concurrence entre règles — sont au **§9**.

---

## 4. La frontière proposée — avec les poids réels

### 4.1 Ce qui part au cervelet

| Tâche | Poids actuel dans le prompt | Pourquoi elle part |
|---|---|---|
| **Convertir une séance en JSON** pour l'app | **4 194 car.** | c'est un format, pas du coaching |
| **Proposer des réponses rapides** à taper | **1 655 car.** | idem |
| **Mémoriser la prochaine séance annoncée** | **825 car.** | idem |
| **Nutrition-outil** : lire une étiquette, estimer un plat, composer un plan sous contraintes, chercher un aliment | **2 126 car.** *(et les briques 1/3/4 à venir)* | ça demande une base et des règles, pas un historique |
| **Total** | **≈ 8 800 car. — 19 % du prompt** | |

### 4.2 Ce qui reste chez Milo

- **Décider** quels exercices, quelles charges, quel ordre, quelle progression.
- **Diagnostiquer** : deux personnes au même objectif peuvent avoir besoin de l'inverse.
- **Dire** si elle mange assez pour progresser — ça n'a de sens qu'en croisant séances, sommeil et apports.
- **Choisir** la question à poser, et quand.
- **Tout le noyau non négociable** (§5.3).

### 4.3 ⭐ Le principe qui résume : **Milo parle, le cervelet traduit**

Milo écrit sa séance **en français**, comme un coach. Le cervelet la convertit en données pour l'app.

**Et ce n'est pas qu'un gain de place — c'est probablement plus fiable.** Aujourd'hui Milo doit
produire *simultanément* une réponse lisible **et** un JSON valide ; quand le JSON est mal formé,
la séance ne se charge pas. Un convertisseur qui n'a qu'un seul métier se trompe moins.

---

## 5. Les trois contraintes — trouvées le 19/08, à ne pas redécouvrir

### 5.1 ⚠️ Le cache : des variantes FIXES, jamais une variation continue

Le bloc commun est **identique pour tous les utilisateurs** → mis en cache 1 h, facturé ~10× moins.
Un contexte **différent à chaque message** ferait sauter le cache : plein tarif à chaque question.

⭐ **Mais un petit nombre de configurations FIXES fonctionne** : 4 variantes = 4 caches chauds.
*Ce qui tue le cache, c'est la variation continue, pas la pluralité.*

### 5.2 ⚠️ L'erreur d'aiguillage est SILENCIEUSE

Un message d'entraînement classé « nutrition », et Milo répond sans les règles dont il a besoin.
**Aucune erreur, aucun test rouge, juste une réponse moins bonne.** C'est la famille de bugs que ce
projet collectionne — celle qu'on ne voit pas.

👉 Toute conception doit répondre à : *comment sait-on qu'un aiguillage s'est trompé ?*

### 5.3 ⚠️ Un noyau ne se conditionne JAMAIS

Partent **toujours**, quel que soit l'aiguillage : la sécurité, les zones fragiles déclarées,
« n'invente rien », l'identité et le ton de Milo. Seuls les modules spécialisés tournent.

### ⭐ 5.3bis Toute tâche du cervelet doit avoir un CHEMIN DE REPLI — écrit maintenant, exprès

> **Toute tâche confiée au cervelet doit avoir un chemin de repli, OU être non essentielle.**

ft-v919 a une cascade à trois étages. La bonne question, posée par la relecture du 19/08 :
*« sera-ce le cas de chaque tâche future, ou la cascade était-elle le luxe de la première brique,
celle qu'on a soignée parce qu'elle servait de patron ? »*

**On l'écrit pendant qu'il n'y a qu'une tâche.** Sinon la deuxième ou la troisième arrivera sans
filet, et **personne ne le remarquera avant la panne**. Deux repli acceptables : du **code
déterministe** (le meilleur), ou **ne rien afficher** — jamais une valeur devinée.

### ⭐ 5.3ter QUI GAGNE en cas de désaccord — la hiérarchie, avant qu'elle manque

Quatre moteurs existent ou vont exister (§5.5), et **trois d'entre eux parlent**. Il n'y avait
nulle part de règle disant qui l'emporte. L'ordre est donc posé maintenant :

1. **Le GARDIEN** — toujours. Sécurité, zones fragiles, seuils. Rien ne passe au-dessus.
2. **MILO** — il arbitre tout le reste, et **il est le seul à parler**.
3. **L'OBSERVATEUR** — il *fournit* un constat à Milo ; il ne conclut jamais à sa place. Si
   l'Observateur voit un progrès et Milo un problème dans le même chiffre, **Milo tranche** :
   lui seul a le contexte de la personne.
4. **Le CERVELET** — il n'entre jamais dans un désaccord : il rend une donnée, ou il rend
   « je ne peux pas ». Quand il répond `ambigu`, **Milo tranche s'il a le contexte** ; sinon on
   demande à la personne. *Le cervelet ne devine jamais à la place de quelqu'un qui sait.*

⚠️ **Pourquoi maintenant** : aujourd'hui la question ne se pose pas (une tâche, un Observateur qui
n'existe pas encore). Elle se posera au troisième composant, et il sera trop tard pour la traiter
proprement. **L'écrire coûte trois lignes ; la reconstituer après coup coûtera une refonte.**
*C'est la leçon de la brique 0 (la provenance), appliquée aux composants au lieu des données.*

### 5.4 ⚠️ Et le risque propre à la nutrition

`docs/NUTRITION-MOTEUR.md` identifie le **plus gros défaut actuel** :

> *« Le plus important n'est pas la variété, c'est que la nutrition IGNORE COMPLÈTEMENT
> L'ENTRAÎNEMENT : l'app connaît la séance, l'heure, les calories dépensées, la région travaillée
> — et n'en fait rien côté nutrition. »*

**Un service nutrition séparé peut AGGRAVER exactement ça.** D'où le partage strict du §4 :
l'**outillage** part, la **conversation** reste. Si le cervelet se met à conseiller, le lien avec
l'entraînement est perdu pour de bon.

---

## 6. Ce n'est pas une idée neuve — elle était écrite deux fois

- **`docs/CONTEXTE-ACTUEL.md`** la listait comme *« archi cerveau/cervelet — **pas encore
  envoyé** »* à Gemini/Mistral pour challenge. Le cross-review n'est jamais parti.
- **L'architecture hybride** actée le 20/07/2026 la contient déjà, nommée : le **niveau ③
  Orchestration** — *« décide quel composant intervient, dans quel ordre, avec quelles données »*,
  explicitement marqué **« couche encore IMPLICITE aujourd'hui : routage + assemblage du contexte »*.

**Le cervelet = rendre le niveau ③ explicite.** La pièce manquante d'une architecture déjà décidée.

### ✅ Et le patron existe déjà en production
Le worker appelle **déjà** des modèles légers (Haiku) en service, sans contexte personnel :
lecture d'un code-barres, import d'un bilan corporel, résumés. **L'utilisateur ne leur parle
jamais.** Le mécanisme est éprouvé — il s'agit de l'étendre, pas de l'inventer.

---

## 7. ❓ Ce qu'on demande à un regard extérieur

1. **La frontière du §4 est-elle au bon endroit ?** Y a-t-il une tâche classée « cervelet » qui a en
   réalité besoin de connaître la personne — ou l'inverse ?
2. **Comment détecte-t-on un aiguillage raté** (§5.2), sachant qu'il ne produit aucune erreur ?
3. **Combien de variantes de contexte** avant que le cache ne devienne contre-productif ?
4. **Le convertisseur séance→JSON** est-il vraiment plus fiable que le tout-en-un actuel, ou
   déplace-t-on simplement le point de casse ?
5. **Quel modèle pour le cervelet ?** Un Haiku suffit-il pour composer un plan alimentaire sous
   contraintes de régime et d'allergies — sachant qu'une erreur y est une erreur de **sécurité**
   (un végan qui reçoit de la viande, une allergie ignorée) ?

---

## 8. ⏭️ Le prérequis, et il n'est pas un détail

**Est-ce que Milo suit ses 140 règles aujourd'hui ?**

Si oui, l'orchestration est une optimisation. Si non, elle est urgente.

**On ne peut pas trancher localement** : `tests/milo` est déterministe — il prouve qu'une règle est
**PRÉSENTE** dans le contexte, jamais qu'elle est **SUIVIE**. Il faut des cas réels sur le vrai
modèle. C'est le prérequis de tout le reste.

---

## 9. 🔧 LES AUTRES LEVIERS — ceux qui s'attaquent vraiment à la DILUTION

> **Pourquoi cette section existe** : le §3.2 le montre en chiffres — le déchargement technique
> touche à sa fin et **n'a pas retiré une seule règle de comportement**. Si la dilution est le
> problème, le cervelet seul ne le résout pas. Voici les autres pistes, classées, avec ce que
> chacune coûte et ce qu'elle risque. *Aucune n'est engagée : c'est un menu, pas un plan.*

### ⭐⭐ 9.1 Le RAPPEL CIBLÉ dans la queue non cachée — probablement le meilleur rapport

**Le fait qu'on n'exploitait pas** : le prompt système part déjà en **trois blocs** — le commun
(cache 1 h), le personnel (cache 5 min), et **l'instant, jamais caché, placé en DERNIER**.

Une règle qui ne compte que dans une situation précise peut donc **quitter le bloc commun** et
apparaître, **courte**, dans la queue **uniquement quand la situation se présente** (détection en
**code**, donc déterministe et testable). Trois gains d'un coup : le bloc commun perd une règle
concurrente · la règle arrive **au moment où elle compte** · et elle est **en fin de prompt**,
là où un modèle pèse le plus.

⚠️ **Le piège, et il est du même genre que l'aiguillage** : si la règle a quitté le commun et que
la détection rate, **la règle est absente et rien ne le dit**. La forme sûre est donc :
**une ligne dans le noyau, le détail en rappel** — on compresse dans le cœur, on renforce dans la
queue. Jamais « on retire et on espère ».

### ⭐⭐ 9.2 Le GARDIEN DE SORTIE au lieu de la règle d'entrée

Chaque règle qu'on déplace de *« le prompt EMPÊCHE »* vers *« le code ATTRAPE à la sortie »* est
une règle qui **cesse de concurrencer les autres**, et qui devient **déterministe et testable**.

C'est **R7 appliqué au COMPORTEMENT**, alors qu'on ne l'avait appliqué qu'au **calcul** : ft-v917 a
retiré du prompt ce que le code *calcule* (barème des paliers) ; ici on retirerait ce que le code
peut *détecter*. Le Gardien de sortie a **5 contrôles** aujourd'hui — c'est une infrastructure qui
existe et qu'on sous-emploie (**R13**).

⚠️ **Deux limites honnêtes** : ça ne marche que pour ce qu'un motif peut voir (une liste de
questions numérotées, un lien, un bloc technique — pas « ce conseil est-il pertinent ? »), et le
Gardien **SIGNALE, il ne réécrit pas** : on ne charcute pas une phrase de Milo.

### ⭐ 9.3 Nommer la hiérarchie UNE fois — et supprimer les arbitrages éparpillés

Le prompt contient aujourd'hui des clauses d'arbitrage **inline**, du type *« PRIORITAIRE sur les
consignes qui te poussent à DEMANDER… MAIS JAMAIS au-dessus de la SÉCURITÉ »*. Elles existent
**parce qu'aucune hiérarchie globale n'est énoncée** : chaque règle doit donc négocier sa place
toute seule, au milieu du texte.

Énoncer **une fois** les trois étages de **R11** (Constitution → noyau de conversation →
comportements) permet de supprimer ces clauses. **Ça retire des caractères ET de la concurrence** :
le modèle n'a plus à résoudre les conflits lui-même. *C'est la seule piste qui améliore les deux à
la fois.*

### ⭐⭐ 9.4 Conditionner un BLOC ENTIER — le plus gros volume, le plus gros risque

Nutrition pèse **6 668** caractères, la méthode de coach **7 462**. Quelqu'un qui parle uniquement
nutrition reçoit 7 462 caractères de construction de séance qui **diluent** ce qu'il lit vraiment.
**Quatre variantes FIXES = quatre caches chauds** (§5.1) : le cache n'est pas l'obstacle.

⚠️⚠️ **Mais c'est ici que se concentrent les deux dangers du document** : l'**erreur d'aiguillage
est silencieuse** (§5.2), et un **noyau ne se conditionne jamais** (§5.3). La parade est la même
que pour l'aiguillage de ft-v919 : **être PERMISSIF** — dans le doute, on envoie les deux blocs.
*Un faux positif coûte des caractères ; un faux négatif coûte une règle.*

⚠️ **Et cette piste a déjà été ÉCARTÉE une fois** (ft-v898, « option 2 ») — pour une bonne raison :
elle éloignait les zones de blessure de la règle qui les protège, **pour un gain purement
financier**. Ici l'enjeu n'est plus l'argent mais la dilution, donc elle mérite d'être rouverte —
**avec exactement la même prudence**, et sûrement pas sur le bloc qui porte la sécurité.

### ⭐⭐⭐ 9.5 Mesurer LAQUELLE des 140 est réellement suivie — le seul levier empirique

Les quatre pistes ci-dessus reposent toutes sur l'hypothèse que **la dilution est le problème**.
**Personne ne l'a démontré.**

Un jeu fixe de **100 à 200 cas difficiles**, joué avant et après, répond à deux questions d'un
coup : *l'allègement améliore-t-il le respect des règles ?* et surtout *quelles règles ne sont
JAMAIS violées ?* — celles-là sont soit évidentes pour le modèle, soit déjà tenues par le code :
**ce sont les candidates à la suppression, sur preuve et non sur goût.** C'est le chemin qui fait
passer de 140 règles à 90 sans rien casser.

⚠️ C'est le plus coûteux, et c'est le **prérequis du §8**. *Tant qu'il n'existe pas, « les 140
règles diluent Milo » reste une intuition crédible — pas un fait.*

### ⭐⭐ 9.6 Et à long terme : le cervelet finit par ne plus être une IA

Piste apportée par la relecture du 19/08, et elle retourne l'intuition. Les tâches du cervelet —
extraire, convertir, normaliser, structurer — sont **exactement celles qu'on résout par du code une
fois qu'on connaît la forme du problème**. Donc :

```
   le cervelet fait le travail
        ↓
   on collecte ses entrées et ses sorties
        ↓
   on écrit le code déterministe
        ↓
   le cervelet devient le REPLI du code, et non l'inverse
```

C'est déjà la cascade de ft-v919, **mais dans l'autre sens** : aujourd'hui le code déterministe est
l'étage ③, le filet ; le jour où il fait mieux que le modèle sur les cas courants, il devient
l'étage ①. **Chaque appel IA devient un investissement au lieu d'une dépense récurrente** : il
produit une paire (entrée, sortie) qui rapproche du jour où on n'en aura plus besoin.

**Application directe à la nutrition** : un parseur déterministe couvrirait ~85 % des saisies
(gratuit, hors ligne), le cervelet rattraperait les 15 % restants — **et chaque rattrapage est une
règle manquante identifiée**. Après six mois, le parseur couvre l'essentiel et le cervelet ne traite
plus que les vrais cas difficiles.

---

## 📌 Ce qui sort d'ici, par taille

| Coût | Action |
|---|---|
| **fait** | mesurer la part comportement / technique (§3.2) · écrire le chemin de repli et la hiérarchie (§5.3bis/ter) · comparer les 4 listes d'actions en ensembles · trancher la fourchette de reps sans deviner en silence |
| petit | §9.3 — énoncer la hiérarchie une fois, retirer les arbitrages éparpillés |
| moyen | §9.1 et §9.2 — le rappel ciblé, et le Gardien de sortie |
| gros | §9.4 — conditionner un bloc entier · **§9.5 — le benchmark, qui conditionne le sens de tout le reste** |

---

*Lié à : `docs/MOTEUR-RAISONNEMENT-MILO.md` (le pipeline de raisonnement) · `docs/REGLES-ARCHITECTURE.md`
(R6 une seule voix, R7 le prompt est le dernier levier, R9 le modèle est une variable structurelle) ·
`docs/NUTRITION-MOTEUR.md` (§5.4) · `README-IA.md` (comment une IA extérieure lit ce dépôt).*
