# 🐛 BUGS — le catalogue des vrais bugs de Force Tracker

> **Créé le 02/08/2026**, à la demande de Michel : *« j'aimerais que tu crées un fichier bugs.md,
> et que tu mettes dedans tous les bugs que tu peux retrouver qui se sont produits »*.
>
> **Ce fichier n'est PAS un journal.** Le journal (`CLAUDE.md` + `docs/JOURNAL-ARCHIVE.md`) raconte
> *ce qui s'est passé, version par version*. Celui-ci répond à une autre question, la seule qui
> serve avant d'écrire du code : **« quels pièges ce projet a-t-il déjà rencontrés, et à quoi les
> reconnaît-on ? »**
>
> Il est donc rangé **par FAMILLE**, pas par date. Parce que le constat qui a motivé sa création
> est celui-ci : sur ~730 versions, **les mêmes cinq ou six bugs reviennent sans arrêt sous des
> déguisements différents**. Un bug isolé est une anecdote ; un bug qui revient huit fois est une
> **propriété du système**, et ça, ça se documente.
>
> ⚠️ **Il ne remplace pas** : `docs/GALERES-ET-LECONS.md` (les grosses galères techniques racontées
> en long) · `docs/BUGS-DE-PHILOSOPHIE.md` (les dérives de *comportement* de Milo, qui ne sont pas
> des bugs de code) · `docs/REGLES-ARCHITECTURE.md` (les règles nées de ces bugs).
>
> **À compléter à chaque nouveau bug**, dans le même mouvement que le journal (règle d'or #12).

---

## 📊 Vue d'ensemble

| # | Famille | Occurrences connues | Ce qui protège aujourd'hui |
|---|---|---|---|
| 1 | **Le premier match gagnant** | ≥ 14 | `tests/croises/` ① (règles mortes) + ⑦ (**empreinte**) |
| 2 | **L'info n'atteint jamais la donnée** | 11 | `tests/donnees/` (garde-fou R4a) |
| 3 | **Le temps et les fuseaux horaires** | ≥ 6 | `tests/dates/` |
| 4 | **Le déploiement silencieux** | 3 | carte 🩺 Santé du système (ft-v717) |
| 5 | **La panne muette côté serveur** | 2 | sondes `storeHealth` / `mailFails` |
| 5bis | **La sauvegarde écrasée par une version tronquée** | 1 | drapeau local + garde-fou serveur + carte Santé |
| 5ter | **Le filtre sans pertinence** | 1 | `tests/muscles/` (ordre des résultats) |
| 6 | **Les seuils en marche d'escalier** | 3 | `tests/calculs/` (balayages continus) |
| 7 | **Deux sources qui se contredisent** | 14 | `tests/croises/` (les 6 diagonales) |
| 8 | **La promesse écrite et fausse** | 2 | tests qui relisent les textes d'aide |
| 9 | **Le code orphelin** | 2 | règles R23 / R30 |
| 10 | **Le marqueur non posé** | 2 | règle R15 |
| 11 | **Le comportement copié hors contexte** | 2 | règle R14 |
| 12 | **Les erreurs de MÉTHODE** (mesure fausse) | ≥ 8 | — *le plus dangereux, voir §12* |
| 13 | **Le NOM comme clé primaire** | *racine de 6 défauts* | identifiant stable (ft-v735, **étape 1/3**) |
| 14 | **Mesurer au lieu de supprimer** | 1 (toute la journée du 02/08) | la question des 3 réponses, voir §14 |
| 15 | **La règle juste, définie trop étroit** | 3 (la même journée) | définitions **nommées** (`_seanceOuverte`…) + témoins sur le cas LIMITE |

---

## 1. 🥇 Le premier match gagnant — **le bug le plus fréquent du projet**

**Le mécanisme.** Le classement des exercices repose sur des listes de règles parcourues **dans
l'ordre**, la première qui correspond gagne. Donc **une règle générale placée avant une règle
précise rend la précise INATTEIGNABLE** — elle devient du code mort, et le classement qu'elle
portait n'existe tout simplement pas.

**Pourquoi il revient sans cesse** : ajouter une règle précise est le geste naturel quand on
corrige un cas particulier. Rien n'oblige à la placer au bon endroit, et **rien ne signale
l'erreur** — l'exercice est juste classé autrement, sans message, sans plantage.

### Les cas connus

| Exercice | Classé à tort en… | Cause | Version |
|---|---|---|---|
| **Extension Poignet Barre** | dos / trapèzes | `t.?bar` (écrit pour le T-Bar Row) attrapait « poigne**T BAR**re » | ft-v669 |
| **Leg Curl** | biceps | le mot-clé `curl` | ft-v667 |
| **Kickback fessiers** | triceps | le mot-clé `kickback` | ft-v686 |
| **Tirage Incliné Poulie Haute** | poussée pectorale | le mot-clé `incliné` | ft-v686 |
| **Superman** | abdominaux | `gainage|plank` | ft-v711 |
| **Chaise Romaine** | quadriceps | volée par « Chaise (Wall Sit) » | ft-v711 |
| **Russian Twist Développé Épaules** | 100 % épaules | `développé épaules` gagnait | ft-v711 |
| **L-Sit / Wall Sit** | gainage | « l sit » est une sous-chaîne de « wa**LL SIT** » | ft-v711 |
| **Chariot — Tirage Épaules** | dorsaux | règle `tirage` générique placée avant | ft-v710 |
| **Élévations Latérales** | + deltoïdes avant et arrière | la règle du deltoïde ARRIÈRE attrapait « lateral raise » | ft-v729 |
| **Oiseau / Face Pull** | deltoïde **moyen** en principal | la règle précise « deltoïde arrière » était **morte** | 02/08 |
| **Jefferson Curl** | curl de biceps | le mot-clé `curl` | 02/08 |

- **« Squat Poids du Corps (Air Squat) » rangé en 🏋️ BARRE** (02/08, ft-v741) : la règle « squat »
  du bac *Barre* passait avant la règle « poids du corps ». Le mot était **écrit dans le nom** et
  n'a servi à rien. Conséquence visible : qui filtre *« je m'entraîne à la maison »* ne voyait pas
  l'air squat. Idem squat sauté, sissy squat, cossack squat.

### 🔎 Comment le reconnaître
- un exercice sort dans un groupe musculaire qui n'a rien à voir ;
- **ou** — beaucoup plus discret — une règle de la liste ne se déclenche **jamais**.

### ⚠️ Le masquage PARTIEL — la moitié invisible de cette famille *(trouvé le 02/08, ft-v734)*

Le contrôle ne voyait que les règles **totalement** mortes. Une règle **à moitié mangée** —
qui capture une partie de ce qui lui revient, le reste étant pris par une règle placée avant
avec un **autre** classement — était parfaitement invisible.

**Mesuré : 19 règles sur 69 sont dans ce cas.** La pire (`tirage|pulldown|row`) capture
9 exercices et **19 lui échappent**. Dans la plupart des cas c'est **voulu** (une règle précise
doit passer avant une règle large) — ce qui manquait, c'était de le **voir**.

> 💡 **Le corollaire, plus large que ce projet** : quand un contrôle cherche une condition
> *absolue* (« jamais déclenchée »), il rate systématiquement la version *graduelle* du même
> défaut. Chercher aussi la forme partielle.

### 📐 L'indicateur de confiance *(ft-v734)*

Définition retenue : un exercice est **robuste** si **toutes** les règles qui lui correspondent
donnent le même résultat ; il est **fragile** si plusieurs correspondent en donnant des muscles
**différents** — sa justesse ne tient alors qu'à l'**ordre**.

| | Exercices | |
|---|---|---|
| Robustes (indépendants de l'ordre) | 277 | **82 %** |
| **Fragiles** (dépendants de l'ordre) | 60 | 18 % |
| Sans classement | 0 | — |

⚠️ **Ce 18 % n'est pas un taux d'erreur.** Les 60 sont corrects aujourd'hui. C'est une **surface
de risque** : ce sont eux qui basculent si on insère une règle au mauvais endroit. Un test
vérifie que cette part **ne grandit pas**.

⚠️⚠️ **Et il faut savoir LESQUELS — sinon le chiffre rassure à tort.** Mesuré : les 60 fragiles
ne sont **pas** des exercices obscurs, ils se concentrent sur les familles les plus courantes —
**13 « Développé »** (dont le **Développé Couché**, qui sert de référence au niveau de force),
**10 « Tirage »**, **5 « Rowing »**. C'est logique et donc durable : ce sont précisément les
familles où une règle précise doit battre une règle large. *La surface de risque est concentrée
là où elle coûte le plus cher.*

**Protection ajoutée en conséquence** (`tests/croises/` ⑩) : les **10 exercices socles** ont
leur classement écrit **à la main** dans le test, pas dans un fichier régénérable. L'empreinte ⑦
peut être régénérée sans qu'on lise le diff ; ces attentes-ci ne peuvent être modifiées que
volontairement. Vérifié en neutralisant la règle du développé couché : le test affiche
*« attendu pec, reçu front-delt,side-delt,triceps »*.

### 🛡️ Ce qui protège
- `tests/croises/` ① : **aucune règle de classement ne doit être morte**. C'est ce test qui a
  révélé que les oiseaux recevaient le mauvais muscle depuis toujours.
- `tests/croises/` ⑦ **l'empreinte du catalogue** *(ft-v734)* : les 337 exercices avec leurs
  muscles, schéma, matériel et calories sont **figés dans un fichier**. Toute dérive est signalée
  **avec le nom des exercices qui bougent**. Vérifié en cassant volontairement : retirer la règle
  du deltoïde postérieur affiche *« Machine Oiseau : rear-delt → (vide) »*.
  Changement voulu → `node tools/gen_reference_catalogue.js`, et le diff montre qui a bougé.

> ⚠️ **Règle absolue** : ne JAMAIS insérer une règle précise APRÈS le bloc de rattrapage générique
> de `_MEX` — elle serait morte à la seconde où on l'écrit.

---

## 2. 📡 L'info existe, mais n'atteint jamais la DONNÉE (**R4**)

**Le mécanisme.** L'app *sait* quelque chose — dans une conversation, dans une table, dans un
onglet — mais cette connaissance n'arrive pas là où quelqu'un la cherche. Le maillon faible n'est
ni la collecte ni le raisonnement : c'est la **restitution**.

| Ce qui existait | Où ça n'arrivait pas | Version |
|---|---|---|
| Les charges prescrites par Milo | écrasées par l'historique dans la séance | ft-v625 |
| Le temps de repos annoncé par Milo | le timer ne s'y adaptait pas | ft-v626 |
| L'ordre des exercices de Milo | pas respecté dans la séance | ft-v627 |
| Les consignes techniques de Milo | jamais en commentaire d'exercice | ft-v628 |
| Le **prénom** de la personne | jamais transmis à Milo… qui devait l'employer | ft-v652 |
| Les jours à venir / passés, les dates de records | Milo disait « demain mercredi » un mercredi | ft-v658 / ft-v660 |
| Le **catalogue de 340 exercices** | 0 occurrence dans les 47 000 caractères envoyés à Milo | ft-v713 |
| Les **muscles** cochés sur un exercice perso | reçus par le serveur, écrits nulle part | ft-v714 |
| Les exercices demandés par les utilisateurs | dans un onglet Google Sheet que personne n'ouvre | ft-v715 |
| Le **cardio** d'une séance | pas transmis à Milo | ft-v720 |
| Le vocabulaire « tirage horizontal » | connu de l'app, absent de la **recherche** | ft-v728 |

### 🔎 Comment le reconnaître
**Le signe qui doit alerter** : une consigne qui **nomme une source** (« la bibliothèque », « ton
planning », « ses records ») sans que cette source soit réellement dans le contexte.
Et le réflexe, quand une réponse est fausse sur un point *factuel* : **« est-ce qu'on lui a
seulement donné le fait ? »** — avant de toucher au prompt.

> ⚠️ **Corollaire coûteux (ft-v660)** : quand on trouve une donnée absente, **chercher
> immédiatement ses jumelles** ailleurs dans le même bloc. Un oubli de ce type est rarement isolé —
> corriger « demain » sans regarder « hier » a fait revenir le même retour deux heures plus tard.

### 🛡️ Ce qui protège
`tests/donnees/` : **chaque** donnée chargée par `load()` doit être classée — transmise, exclue
avec la raison écrite, ou trou connu. Une donnée non classée **bloque la livraison**.

---

## 3. 🕛 Le temps, les fuseaux, et les bornes de journée

**Le mécanisme.** `toISOString()` rend la date **de Greenwich**, pas celle du téléphone. Et
l'horloge d'un serveur n'est pas celle de l'utilisateur.

- **Entre minuit et 2 h du matin, une séance était datée de la veille** (ft-v655). Trouvé en
  enquêtant sur une séance qui « n'apparaissait pas ».
- **Le bouton « Hier » datait d'avant-hier** — plus 5 cousins du même bug (ft-v671).
- **La « marche de midi »** : la fatigue d'une séance se calculait par bonds au changement de jour
  au lieu d'être continue (ft-v671).
- **02/08** : j'ai écrit « bonne nuit » à Michel en lisant l'horloge du serveur — il était
  **13 h chez lui**. Le même bug, commis par moi, deux fois dans la même journée.

### 🛡️ Ce qui protège
`tests/dates/` **interdit** `toISOString()` pour la date du jour. Il m'a arrêté net en ft-v716
quand j'ai voulu recommencer.

---

## 4. 🚀 Le déploiement silencieux — *« j'ai poussé » ≠ « c'est en ligne »*

**C'est le silence le plus coûteux du projet.**

- **ft-v600** : GitHub Pages a cessé de déployer après ft-v593. Michel est resté bloqué plusieurs
  versions en arrière **sans aucune alerte**.
- **ft-v619** : rebelote → passage à un workflow GitHub Actions, relançable à la main.
- **Le pire (21/07)** : le déploiement **backend** échouait **depuis mi-juillet** sans que personne
  le voie. Cause : `worker.js` (syntaxe ES module) n'était pas dans `.claspignore` → poussé dans
  Apps Script → `Syntax error` → **plus aucun changement backend ne partait**. Des semaines de
  travail (persistance de l'ADN sportif, du journal d'état du jour) sont restées non déployées.

> ⚠️ **La leçon générale** : à chaque **nouveau fichier `.js` à la racine**, l'ajouter
> IMMÉDIATEMENT à `.claspignore`. La liste est explicite, sans joker — un fichier oublié casse
> tout le backend.

### 🛡️ Ce qui protège
La carte **🩺 Santé du système** (ft-v717) lit l'état des deux workflows et dit, en clair :
*« Tant que c'est rouge, tes changements ne partent pas. »*

---

## 5. 🚨 La panne muette côté serveur

- **29/07** : le réservoir des Script Properties était **plein à 102 %** (524 Ko / 512 Ko).
  Pendant **deux jours**, **aucune écriture n'aboutissait** : sync des gros comptes figée, boîte à
  idées muette, mails morts. La sonde `storeHealth` le disait **dès le premier jour** — mais
  personne n'avait de bouton pour la lire. Découvert seulement parce que Christophe a signalé
  qu'un message n'arrivait pas.
- **Deuxième panne empilée sur la première** : l'autorisation Gmail avait été révoquée, et
  l'échec d'envoi était avalé par un `catch` vide.

> ⚠️ **Le motif** : *une donnée rangée où personne ne va n'existe pas* — exactement le pendant de
> *« une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle »*.

### ⏭️ Toujours ouvert
Le stockage des comptes a été **contourné** (compression gzip, ~5× plus petit), **pas résolu**.
Le vrai correctif est de déménager les comptes vers le Drive, qui n'a pas de plafond.

---

## 5bis. 💾 La sauvegarde écrasée par une version tronquée *(02/08/2026)*

**Le mécanisme, en quatre étapes dont aucune n'est absurde :**

1. le stockage du téléphone sature → l'app ramène l'historique **local** à 50 séances et affiche
   *« tes séances restent sauvegardées dans le cloud »* ;
2. au redémarrage, l'app ne relit que ces 50 ;
3. à la première sauvegarde, elle les **envoie au serveur** ;
4. le garde-fou serveur ne refusait **que les envois VIDES** → 50 séances remplaçaient 500,
   **en silence**.

**Ce qui rend ce bug exemplaire** : chaque étape est un comportement *raisonnable*. La troncature
protège l'app d'un crash. Le renvoi est une sauvegarde normale. Le garde-fou existait. C'est leur
**enchaînement** qui détruit les données — et le message affiché devenait **faux** à l'étape 4.

⚠️ **Impossible de savoir s'il a frappé** : rien ne le traçait. C'est précisément le problème.

### 🛡️ Ce qui protège (ft-v732)
Un **drapeau** qui empêche l'envoi tant que le local est incomplet · un garde-fou serveur qui
refuse tout **rétrécissement brutal** (pas seulement le vide) · et une ligne **« Historiques
protégés »** dans la carte Santé, parce qu'*une alerte qui ne remonte nulle part ne sert à personne*.

---

## 5ter. 🔎 Le filtre sans pertinence *(02/08/2026)*

**Le mécanisme.** Une recherche qui répond **oui/non** et affiche le résultat dans l'ordre
**alphabétique** n'a aucune notion de *« à quel point ça correspond »*. Tant que le filtre est
étroit, personne ne le remarque. **Chaque élargissement du filtre aggrave alors le bruit**, sans
qu'aucun tri ne vienne le compenser.

**Cas réel.** Une testeuse ne trouve pas un exercice → on élargit la recherche aux familles de
mouvement (ft-v728) → deux versions plus tard, taper **« pec deck »** rend **45 résultats** avec
le Pec Deck en **dernière position**, et **« développé couché »** rend 45 résultats dont 8
seulement contiennent ces mots.

**Le piège dans le piège** : le tri par pertinence, une fois écrit, ne se voyait toujours pas —
parce que l'affichage **regroupe par matériel**, et que ce regroupement imposait son propre ordre.
*Un tri ne sert à rien s'il ne traverse pas la mise en forme.*

### 🔎 Comment le reconnaître
Un mot très précis (un nom propre, une marque, un nom d'exercice unique) rend beaucoup de
résultats. C'est le signe qu'un élargissement se déclenche là où il ne devrait pas.

### 🛡️ Ce qui protège (ft-v733)
Un rang de pertinence explicite, transmis jusqu'au rendu · et un élargissement qui ne se
déclenche que sur une **intention de famille** (le libellé), jamais sur un mot-clé isolé.

> ⚠️ **La leçon de méthode** : les tests de ft-v728 vérifiaient le **nombre** de résultats et
> l'absence de faux positif — **jamais leur ORDRE**. *Un test qui compte ne dit rien de ce que
> l'utilisateur voit en premier.*

---

## 6. 📶 Les seuils en marche d'escalier

**Le mécanisme.** Un score calculé par paliers produit des **sauts absurdes** au voisinage du seuil.

- **Récupération, ft-v718** : 6 h 54 de sommeil → score **53** ; 7 h 00 → score **77**.
  **24 points pour six minutes.** Corrigé par une courbe continue : sur un balayage 3 h → 11 h, le
  plus gros saut est passé de **24 points à 1**.
- **La « marche de midi »** de la fatigue (ft-v671), même maladie.

### 🛡️ Ce qui protège
`tests/calculs/` fait des **balayages** au lieu de tester des points isolés, et vérifie qu'aucun
saut ne dépasse un maximum.

---

## 6bis. 📉 L'indicateur calculé sur DEUX POINTS *(03/08/2026)*

**Le mécanisme.** Une tendance mesurée en comparant **la première valeur à la dernière** n'est pas
une tendance : c'est un tirage au sort sur deux échantillons. Une seule séance atypique — un jour
de récup, une mauvaise nuit, une reprise — renverse le verdict.

- **La progression de la mémoire longue (ft-v753)** : pour une progression réelle et régulière de
  **100 → 123 kg sur 24 séances**, le chiffre annoncé passait de **+23 %** à **−20 %** selon que la
  dernière séance était allégée. **43 points d'écart pour un seul entraînement.** Corrigé par la
  **médiane d'une fenêtre de 3** au début et à la fin : le même test donne désormais +21 % / +20 %.
- **Ce qui rendait le bug coûteux, ce n'est pas le chiffre — c'est ce que Milo en faisait.** Il
  bâtissait un **diagnostic** sur la fausse baisse (« la cause probable : la fréquence, le
  sommeil »). Michel : *« je trouve ça super vache et hyper démotivant »*. Un indicateur faux qui
  décourage quelqu'un qui progresse coûte plus cher qu'un indicateur absent.
- **Famille voisine, même réponse** : c'est **R12** (raisonner sur des tendances, pas sur du bruit),
  écrite dans les règles d'architecture… et non appliquée à ce calcul-là.

### 🛡️ Ce qui protège
`tests/parcours/` rejoue **la même progression avec et sans séance allégée** et exige que l'écart
entre les deux verdicts reste ≤ 3 points. Un exercice vu moins de 5 fois ne produit plus aucun
pourcentage. Et le chiffre est désormais **nommé** (« niveau de travail habituel ») pour ne plus
être confondu avec le record — Milo donnait les deux dans la même réponse.

**Le réflexe.** Devant tout indicateur d'évolution : *combien de points le premier chiffre
résume-t-il ? et le dernier ?* Si la réponse est « un », ce n'est pas une tendance.

---

## 7. 🔀 Deux sources qui se contredisent — *la famille trouvée le 02/08*

**Le mécanisme, et pourquoi il est spécial.** L'app connaît **plusieurs choses indépendantes** sur
un même exercice : son groupe musculaire (choisi à la main), ses muscles (calculés), son schéma de
mouvement, son terme anglais, le fichier de son animation, son bac de matériel. **Chacune est
plausible séparément.** Aucune ne plante. Ces bugs sont donc **totalement invisibles** — jusqu'à ce
qu'on confronte deux sources qui devraient dire la même chose.

**Ils ont été trouvés parce que Michel a dit** : *« mon intuition me dit qu'il y a un truc qui va
pas… il faudrait croiser les données comme on a fait en linéaire et en diagonale… je le sens, y'a
un truc qui nous a échappé. »* La lecture linéaire (les 69 règles, une par une) en avait trouvé 4.
**Le croisement en a trouvé 14 de plus.**

| Ce qui se contredisait | Le bug | |
|---|---|---|
| animation ⟷ nom | « Écarté Haltères » affichait un écarté **décliné** | |
| animation ⟷ animation | Leg Curl Couché = Curl Ischio-jambiers → **même fiche en double** | |
| terme anglais ⟷ terme anglais | 3 autres paires de doublons, dont « Tirage Menton » et « Tirage Vertical » | |
| schéma ⟷ muscles | **Chariot — Poussée** classé en *tirage* : l'app croyait qu'on avait tiré alors qu'on avait poussé | |
| schéma ⟷ muscles | « Sled Pull » classé en *squat* ; Jefferson Curl en *curl de biceps* | |
| groupe ⟷ muscles | Good Morning rangé dans « Dos », Farmer's Walk dans « Jambes » | |
| matériel ⟷ nom | « Leg Curl **Haltère** » rangé en machine ; « Montée sur Box **Haltères** » en poids du corps | |
| règle morte | oiseaux et face pull recevaient le deltoïde **moyen** en muscle principal | |

### 🛡️ Ce qui protège
La 12ᵉ famille de tests, **`tests/croises/`**, rejoue les 6 diagonales à chaque version. Elle a
attrapé un 14ᵉ bug **dès son premier lancement**.

### ⚠️ Ce que ce contrôle NE voit PAS — à lire avant de se croire couvert
**Un croisement ne détecte qu'une CONTRADICTION.** Si deux sources sont fausses **de la même
façon**, il se tait. Un exercice dont le groupe, les muscles et le schéma sont tous les trois
cohérents *et tous les trois faux* reste invisible — seule une vérification **externe** (anatomie,
littérature) l'attrape, et elle n'a été faite que sur une poignée d'exercices, pas sur les 337.

Couverture réelle, mesurée le 02/08 :

| Croisement | Couvre | Pourquoi pas 100 % |
|---|---|---|
| ① règles mortes | **337/337** | — |
| ④ groupe ⟷ muscles | **337/337** | — |
| ⑤ schéma ⟷ muscles | **337/337** | — |
| ② animation en double | 282/337 (83 %) | **55 exercices n'ont pas d'animation** |
| ③ terme anglais en double | 255/337 (75 %) | **82 exercices n'ont pas de terme anglais** |
| ⑥ matériel ⟷ nom | 143/337 (42 %) | ne juge que si **un seul** matériel est écrit dans le nom |

*Les trous de ② et ③ ne sont pas des trous du contrôle mais des trous de DONNÉE : ajouter une
animation ou un terme anglais élargit mécaniquement la détection.*

---

## 8. 🤥 La promesse écrite à l'utilisateur, et fausse

Un texte d'aide qui affirme quelque chose que le code ne fait pas (ou ne fait plus). **C'est pire
qu'un bug** : la personne fait confiance à l'écrit.

- **ft-v723** : la carte du profil promettait *« Milo et le plan de repas respectent tout ça —
  jamais un aliment que tu ne manges pas »*. Emma déclarait **« fruits à coque »** et le plan lui
  servait **amandes** puis **noix de macadamia**.
- **ft-v728** : l'aide de l'onglet Séance promettait encore *« tu peux régler le poids de ta barre
  dans le 🔢 calculateur de plaques »* — **retiré deux versions plus tôt**.

> ⚠️ **La règle qui en découle** : quand on retire quelque chose, **retirer aussi ce qui en parle**.

---

## 9. 👻 Le code orphelin — et le piège du « je répare »

**Deux situations produisent exactement le même symptôme** (une fonction sans appelant, une modale
sans bouton), et elles demandent l'inverse l'une de l'autre :

- **ft-v721 — un vrai oubli** : le champ de réglage du poids de barre avait disparu de l'interface
  lors d'une refonte, son code de lecture était resté. La barre était figée à 20 kg pour tout le
  monde. → à réparer.
- **ft-v725/726 — une DÉCISION** : `openPlateCalc` n'avait aucun appelant… parce que **Michel
  l'avait retiré exprès** (« ça ne servait à rien »). Je l'ai « réparé ». Michel : *« dans mes
  souvenirs le calculateur de plaques, je l'avais retiré »*. → à laisser mort.

> ⚠️ **Du code orphelin ne prouve rien.** Avant de réparer, chercher la décision (journal, git) — et
> si on ne trouve rien, **demander au lieu de supposer** (règle **R30**).

---

## 10. 🔖 Le marqueur non posé

Une action a un effet de bord (marquer « vu », consommer un quota, poser une date) mais **tous** les
chemins qui la déclenchent ne le font pas.

- **ft-v466** : un point rouge de nouveauté ne partait pas.
- **ft-v629** (retour de Christophe) : une pop-up fermée **en la glissant vers le bas** revenait au
  lancement suivant — le bouton posait le marqueur, le glissement non.

**Deux fois le même oubli** → règle **R15** : *tout chemin de fermeture pose son marqueur*, y
compris les chemins secondaires (glissement, Échap, clic à côté).

---

## 11. 📋 Le comportement copié d'un contexte à un autre

Copier du code, c'est aussi copier ses **hypothèses implicites**.

- **ft-v625** : pré-remplir les charges depuis l'historique a du sens pour un **programme
  générique** (qui dit « 4×8 » sans charge). C'est **absurde** pour une séance que Milo vient de
  prescrire exprès — ça l'écrasait.

---

## 12. 🔬 Les erreurs de MÉTHODE — *les plus dangereuses*

Ce ne sont pas des bugs du produit, mais des bugs de **la façon de chercher les bugs**. Elles font
conclure faux avec assurance.

- **🎞️ JUGER UN MOUVEMENT SUR SON IMAGE D'ARRÊT** *(10/08/2026)* : pour dresser la liste des
  exercices **unilatéraux**, j'ouvre les 15 figurines concernées une par une — la bonne méthode
  (R31 : *ouvrir le dessin, pas la table qui nomme*). J'en classe deux « douteuses, le dessin
  contredit son nom » : le Hip Thrust Unilatéral (les deux pieds au sol) et le Rowing Unilatéral
  Élastique (les deux bras qui tirent). **Michel corrige de mémoire, sans ouvrir le fichier** :
  *« tu as raison pour la 1ʳᵉ partie du gif, mais quand le gif avance il y a un pied en l'air »*.
  **La cause : 304 figurines sur 306 sont des WebP ANIMÉS** (12 à 24 images), et l'outil de
  lecture n'affiche que **l'image 1** — c'est-à-dire, très souvent, la **POSITION DE DÉPART**,
  le seul instant où le mouvement n'a pas encore commencé. *J'AI ouvert le dessin ; ce que je
  n'avais pas vu, c'est qu'il BOUGE.* ⭐ **Ce qui rend cette famille reconnaissable** : la
  conclusion était fausse alors que **chaque étape** était juste (bon fichier, bonne image, bonne
  observation) — c'est l'**instant** choisi qui était faux, et rien ne le signale.
  🛡️ **Ce qui protège** : extraire **4 images réparties** (`PIL.Image.seek`) et les coller côte à
  côte avant tout verdict sur un mouvement. Appliqué immédiatement **aux deux verdicts opposés**
  (« bilatéral ») que j'avais rendus par la même méthode — ils tiennent, mais *une erreur de
  méthode ne se répare pas à moitié : elle invalide tout ce qui a été produit avec elle.*
- **Un contrôle négatif à 0 rouge** (ft-v714) : je vérifiais qu'un test échoue bien sans le
  correctif — il affichait **0 échec**. Le runner **plantait** au lieu d'échouer, et le crash
  masquait tout. *Un test qui plante n'est pas un test qui passe.*
- **🔁 LA MÊME, RECOMMENCÉE LE SOIR MÊME OÙ CE FICHIER A ÉTÉ ÉCRIT** (ft-v735) : le contrôle
  négatif des tests d'identifiants affichait **0 échec**. Même cause exactement — une variable
  absente faisait planter le runner. Corrigé par des `try/catch` → **6 échecs lisibles**.
  ⭐ **Ce que ça prouve, et c'est le passage le plus utile de ce fichier** : *documenter un bug
  ne protège pas de ce bug*. J'avais écrit cette ligne la veille et je l'ai refaite le lendemain.
  **Seul un test protège ; un document ne fait que rendre le diagnostic plus rapide.** C'est la
  raison d'être de la règle R17 (chaque bug devient un test permanent) — et la limite honnête
  de `BUGS.md`.
- **Tester des archétypes au lieu du catalogue** (ft-v666) : j'avais vérifié un changement sur
  « 9 types de séances » et conclu « aucune couleur ne change ». Michel : *« sur tous les mouvements
  tu as vérifié ? »* — non. Sur les 287 exercices, **4 changeaient**. Ce passage a révélé au
  passage que **86 exercices (30 %) n'avaient AUCUN muscle**.
- **Affirmer qu'une chose n'existe pas** (27/07) : un audit a conclu que l'import de prise de sang
  manquait. **Il existait depuis le 8 juillet** — mais n'avait aucune entrée de journal. → règle
  **R23**.
- **Croire une fausse limite** : Michel a conçu l'app pendant des semaines en pensant qu'elle était
  bridée graphiquement (« on est limité avec canvas »). Vérification : l'interface est en **SVG**
  (104 balises), canvas ne sert qu'à traiter des images. *Un bug coûte une correction ; une fausse
  limite coûte tout ce qu'on n'a jamais imaginé* (règle **R28**).
- **Se fier à une source externe non vérifiée** (02/08) : pour auditer le catalogue, j'ai comparé
  nos 340 exercices à une base publique de 873. Elle classe le **développé couché** en « triceps »
  principal. **Résultat inutilisable** — l'essentiel des « désaccords » était du bruit.
- **🖼️ Se fier à une source UNIQUE contre le consensus** (02/08, ft-v737) : en relisant les
  pectoraux, j'ai reclassé le **« Dips Assis Machine »** en *triceps* — sur la foi d'**une seule
  image**, l'animation du catalogue, où seuls les triceps et le dos sont colorés. Michel a
  vérifié en trente secondes : la recherche « Dips Assis Machine muscle » montre la **même
  machine avec les PECTORAUX en rouge** chez Fitwill comme chez Strength Level.
  **C'est notre animation qui est l'exception, pas la règle.**
  ⭐ *Une image vaut mieux qu'un nom — mais une image ne vaut pas un consensus.* Et le piège est
  d'autant plus vicieux que la méthode « regarder l'animation » avait très bien marché deux fois
  avant (le tirage menton, l'écarté décliné) : **une méthode qui a marché inspire une confiance
  qu'elle ne mérite pas toujours.**
- **📉 Un indicateur qui ne peut JAMAIS baisser** (02/08, ft-v739) : l'« indicateur de fragilité »
  comptait les exercices dont le classement dépend de l'ordre des règles. Depuis qu'on **écrit**
  les muscles de certains exercices, ces exercices-là ne dépendent plus de l'ordre du tout — mais
  l'indicateur continuait de les compter. Il serait donc resté à 18 % **même en basculant tout le
  catalogue**. ⭐ *Un indicateur qui ne peut pas bouger dans le bon sens ne mesure plus rien : il
  décore.* Corrigé → 60 → 36. **Le réflexe** : quand on change la façon dont une chose est
  produite, vérifier que ce qui la MESURE a suivi — sinon on pilote avec un cadran mort.
- **🧪 Un test qui ne distingue pas l'exception de la règle** (02/08, ft-v739) : mon test du
  « Développé Nuque » vérifiait qu'il a bien le deltoïde latéral en muscle moteur. Il passait au
  vert — **et il passait AUSSI avec l'ancien classement**, où les 13 développés étaient identiques.
  Le contrôle négatif l'a montré (il est resté vert quand tout le reste rougissait). *Un test qui
  décrit l'exception sans la comparer à la règle ne prouve rien.* Réécrit en comparant les deux.
- **🪞 Corriger un cas et ne pas chercher son MIROIR** (02/08, ft-v739 → ft-v740) : aux épaules,
  j'ai trouvé que le deltoïde latéral était compté comme *moteur* dans les développés alors qu'il
  n'est qu'un assistant. J'ai corrigé, livré, et je suis passé au groupe suivant — où **la même
  erreur attendait deux fois** : le deltoïde postérieur moteur dans les 18 rowings, le biceps
  moteur dans les 13 tirages verticaux. ⭐ *Une erreur de MODÈLE (« trop de muscles moteurs »)
  ne vit jamais dans un seul groupe.* Quand une correction porte sur la façon de classer et non
  sur un exercice, chercher immédiatement ses jumelles ailleurs — c'est le corollaire de **R8**,
  appliqué cette fois aux données et non au contexte de Milo.
- **🕶️ Un croisement ne voit que ce qu'on lui a APPRIS à lire** (02/08, ft-v741) : le croisement ⑥
  compare le matériel déduit aux mots du nom (« haltère », « machine », « poulie »…). Il n'a jamais
  signalé que **« Squat Poids du Corps (Air Squat) » était rangé en Barre** — parce que
  *« poids du corps »* ne faisait pas partie de son vocabulaire. Le contrôle tournait au vert sur
  un exercice manifestement mal rangé. ⭐ *Un contrôle silencieux ne prouve rien tant qu'on n'a
  pas vérifié CE QU'IL REGARDE* — c'est la même leçon que les 19 schémas de mouvement inconnus de
  la table de correspondance (ft-v731), qui passaient en silence.
- **⚖️ Une correction ANATOMIQUE qui déplace les CALORIES par effet de bord** (02/08, ft-v742,
  déjà vu au farmer's walk en ft-v730) : retirer le quadriceps du soulevé **roumain** — il n'y
  travaille pas, les genoux restent tendus — a fait tomber les 6 roumains de **6,5 à 5,5**, soit
  le coût d'un développé couché pour l'exercice de chaîne postérieure le plus lourd du catalogue.
  Cause : le modèle de calories déduit la région des muscles, et `lower-back` n'appartient à
  **aucune** des deux régions — il gonfle donc le dénominateur sans jamais compter côté « bas ».
  ⭐ *Quand on corrige une donnée, vérifier ce qui la LIT* : ici les calories, ailleurs le
  calendrier, la figurine ou l'équilibre de séance. Le réflexe qui l'attrape : comparer les MET
  avant/après sur les 337, systématiquement, même quand on n'a « touché qu'aux muscles ».
- **👯 Un correctif appliqué à une table et pas à sa JUMELLE** (02/08, deux fois la même semaine) :
  l'app décrit un exercice dans **plusieurs tables indépendantes** — ses muscles (`_MEX`), son
  schéma de mouvement (`_MOV_PATTERNS`), son matériel (`_exEquip`). Corriger l'une ne corrige pas
  les autres, et rien ne le signale. **Cas 1 (ft-v740)** : le chariot de puissance avait ses
  *muscles* vérifiés en ft-v719, mais pas son *schéma* — sa poussée est restée classée en
  « tirage » deux jours. **Cas 2 (ft-v746)** : l'exclusion `poignet|wrist` de la règle « curl »
  avait été posée dans `_MEX` en **ft-v669**… et jamais dans `_MOV_PATTERNS` — « Curl Poignet
  Barre » est resté classé en *flexion du coude* pendant des mois. ⭐ **Le réflexe** : quand on
  corrige la façon dont un nom est interprété, chercher **toutes** les tables qui lisent ce nom.
  C'est ce que le croisement ⑤ (schéma ⟷ muscles) attrape aujourd'hui — il a trouvé seul le
  schéma « saut » de la corde ondulatoire, sur laquelle on ne saute pas (ft-v745).
- **🏷️ Un contrôle indexé par NOM devient aveugle le jour où le nom change** (03/08, ft-v749) :
  en renommant « Dips Parallèles » en « Dips **Triceps** (Buste Droit) », le mot ajouté a fait
  basculer son schéma de mouvement de *poussée horizontale* à *extension du coude* — le moteur
  lit le nom. C'est le défaut même qui a motivé l'identifiant stable (ft-v735), refait par
  moi-même 14 versions plus tard. **Et l'empreinte du catalogue (croisement ⑦) ne l'a pas vu** :
  elle compare fiche à fiche **par nom**, donc un renommage s'y lit comme *« un exercice disparu
  + un nouveau »* et la comparaison des champs ne se fait jamais.
  ⭐ *Un renommage est le seul changement qui échappe à un contrôle indexé par nom — c'est-à-dire
  exactement le changement le plus risqué.* Le réflexe, tant que l'identifiant stable n'est pas
  branché partout : après tout renommage, comparer **à la main** l'ancienne et la nouvelle ligne
  de l'empreinte.
- **Chercher un symptôme là où il n'y en a pas** (ft-v727) : je voulais tailler dans les consignes
  de Milo parce qu'elles occupaient 78 % du contexte. Michel : *« tu me fais flipper là, parce que
  franchement Milo il est au top »*. Rien n'était cassé. **« Ça marche » est une raison suffisante
  pour ne pas y toucher.**

---

## 12bis. 🕵️ L'AUDIT QUI NE REGARDE QUE CE QU'IL SAIT CHERCHER *(05/08/2026)*

> *« Et nos audits n'ont pas vu ce point de sécurité »* — Michel, 05/08/2026, 1h du matin.

**Le cas.** Un audit de sécurité a été mené le 10/07. Le 04/08, trois failles ont été trouvées
et traitées (déploiements Apps Script fantômes, `loadProfile` sans authentification, jeton de la
boîte à idées en clair). **Aucun de ces passages n'a vu que n'importe qui pouvait demander à Milo
de réciter ses propres consignes** — c'est-à-dire de lire **les garde-fous eux-mêmes** (santé,
blessures, limites de rôle). Ce n'est pas une fuite de données (0 clé, 0 e-mail, 0 donnée d'un
autre utilisateur : mesuré), mais *qui lit les garde-fous sait par où passer*.

**Pourquoi personne ne l'a vu.** Un audit cherche là où il sait chercher : les **fichiers**, les
**routes**, les **droits d'accès**. Le prompt, lui, n'est ni un fichier ni une route — c'est du
**texte envoyé à un modèle**, et personne ne le range mentalement dans la surface d'attaque. Il a
d'ailleurs fallu que Milo **audite son propre prompt sous les yeux de Michel** pour que la question
se pose : *« c'est chelou, tout le monde peut faire ça ? »*.

**⚠️ Et j'ai d'abord répondu à côté** : « ce n'est pas ta sécurité, c'est ton savoir-faire — deux
lignes par pudeur ». Michel a insisté : *« si c'est le cas c'est un point de sécurité »*. Il avait
raison, et l'écart entre les deux lectures tient à une seule chose : je regardais **ce qui fuit**
(rien de sensible), il regardait **ce que ça permet** (contourner les protections).

### 🔎 Comment la reconnaître
- L'audit énumère des **fichiers, des routes, des clés** — jamais des **entrées** ni des **sorties**
  de modèle.
- Personne n'a écrit la phrase *« qu'est-ce qu'un utilisateur curieux peut obtenir en le DEMANDANT
  simplement ? »*.
- On raisonne « qu'est-ce qui fuit ? » sans jamais poser « qu'est-ce que ça permet ensuite ? ».

### 🛡️ Ce qui protège
- Faire figurer **le prompt** dans le périmètre d'audit, au même titre qu'un fichier servi.
- Poser systématiquement les **deux** questions : *qu'est-ce qui fuit ?* **et** *à quoi ça sert
  à celui qui l'obtient ?*
- ⚠️ Et se souvenir qu'une consigne de prompt **se contourne** : c'est un ralentisseur, jamais une
  serrure. La serrure est **déterministe** et vit dans le code (Gardien de sortie).
- ft-v766 puis ft-v767 : consigne posée, puis réservée au **super-admin** — avec un test des deux
  branches (autorisé / interdit), parce qu'une protection sans test n'est qu'un souhait.

---

## 12ter. 🔧 LA FAUSSE PANNE — quand c'est l'OUTIL DE MESURE qui se trompe *(18/08/2026)*

> **Michel, après l'audit des renvois du prompt** : *« fais gaffe de ne pas réparer des trucs qui ne
> doivent pas être réparés »*. Il a raison, et j'ai frôlé la faute deux fois **dans le même audit**.

**Le cas.** En vérifiant que chaque renvoi de position du prompt (« sa MÉMOIRE LONGUE plus bas »,
« voir le Gardien plus haut ») pointe au bon endroit, l'outil a signalé **deux cibles introuvables**.
Les deux étaient des **défauts de la recherche**, pas du prompt :

| Fausse alerte | Cause réelle |
|---|---|
| « le PROFIL SANTÉ **plus bas** » → cible à 3 caractères | la recherche partait du **début du texte**, elle trouvait donc la phrase du renvoi **elle-même** (qui contient les mots « PROFIL SANTÉ ») |
| « n'ajoute jamais un détail **plus haut** » → introuvable | **la casse** : la règle existe bien, 12 000 car. plus haut, écrite `⛔ N'AJOUTE JAMAIS un DÉTAIL` |

**Sans vérification, les deux « correctifs » auraient été des dégradations** : réécrire une consigne
juste, ou pire, ajouter une règle qui existait déjà — c'est-à-dire la dupliquer (R2).

### 🔎 Comment le reconnaître

- L'outil signale un problème **là où le code n'a pas changé récemment**. Un défaut qui apparaît sans
  qu'on ait rien touché est d'abord une suspicion sur la **mesure**.
- Le résultat est **trop propre** : « 0 caractère réécrit », « cible introuvable », « aucune donnée ».
  Un zéro parfait est plus souvent un chemin non emprunté qu'un succès. *(Le 17/08, un `0` a d'abord
  été pris pour une réussite : c'était le bloc POIDS tombé dans un commentaire et disparu du prompt.)*
- La cible est **trouvée collée au renvoi** (quelques caractères d'écart) : l'outil s'est trouvé
  lui-même.

### 🛡️ Ce qui protège

1. **Avant de corriger, ouvrir la chose incriminée** et la lire. Pas le rapport : la chose.
   C'est R28 appliqué à ses propres outils.
2. **Chercher la formulation, pas la chaîne** : insensible à la casse, plusieurs variantes.
3. **Une recherche « ce qui suit » doit commencer APRÈS la phrase qui pose la question**, sinon elle
   se mord la queue.
4. **Écrire les pièges DANS l'outil**, pas dans un compte rendu qu'on ne relira pas — les deux
   ci-dessus sont en commentaire dans `tests/parcours` (bloc XLVII).

*Voisine de la famille **9** (le code orphelin : avant de « réparer », chercher la décision) et de la
**12** (les erreurs de méthode). La différence : ici ce n'est ni le code ni la décision qui manque,
c'est l'instrument qui ment.*

---

## 13. 🔑 Le NOM comme clé primaire — *la racine commune*

**Ce n'est pas un bug, c'est ce qui en produit.** Sur les 19 défauts trouvés le 02/08, **6
viennent directement de là** — c'est la seule « famille » de ce fichier qui soit une cause
d'architecture plutôt qu'un accident.

**Le mécanisme.** Le nom d'un exercice porte **trois responsabilités incompatibles** :

1. c'est **l'étiquette affichée** — donc on veut pouvoir la changer, la traduire, la préciser ;
2. c'est **l'entrée de cinq calculs** (muscles, schéma, matériel, calories, rôle) — donc la
   changer modifie des statistiques ;
3. c'est **la clé primaire de l'historique** (séances, records, programmes, temps de repos) —
   donc la changer casse le lien avec le passé.

**Les trois se contredisent.** Toute amélioration du nom est un risque pour les deux autres.

### Les cas réels

| Ce qu'on voulait faire | Ce que ça a cassé |
|---|---|
| Ajouter la traduction : « Rowing Barre » → « Rowing Barre **(Tirage Horizontal)** » | Il est passé de 🏋️ **Barre** à ⚙️ **Guidé** — le mot « tirage » évoque une poulie |
| Ajouter « (Lateral Raise) » aux élévations latérales | L'isolation a gagné **2 muscles** et est devenue polyarticulaire pour les calories |
| Renommer 9 exercices « Chariot » → « Chariot de Puissance » | Rien, mais il a fallu **écrire une table de migration** pour ne pas orpheliner l'historique |
| Fusionner 3 doublons | Idem — sans migration, les records disparaissaient |

### 🔎 Comment le reconnaître
Un changement **cosmétique** (renommer, traduire, préciser) qui modifie une **statistique**.
Si toucher au libellé change un chiffre, c'est ce défaut.

### 🛡️ Ce qui protège *(en cours, ft-v735 = étape 1 sur 3)*
Chaque exercice a désormais un **identifiant stable** qui ne changera jamais, et la table
`EX_IDS` porte **l'histoire de ses noms** (`['nom actuel', ...anciens noms]`).

> ⚠️ **Le sens de la table est toute la décision** : elle va de **l'identifiant vers les noms**.
> Rangée par nom, elle aurait cassé au premier renommage — soit exactement le défaut à supprimer.

**Effet immédiat** : la table de migration qui vivait dans le code de chargement a disparu, elle
faisait doublon et devait être tenue à jour à deux endroits (**R2**).

**⏭️ Ce qui reste** : ② écrire l'identifiant dans les nouvelles séances · ③ faire lire
l'historique, les records et les programmes par identifiant. **Tant que ③ n'est pas fait, le nom
reste la clé** — la dette est entamée, pas remboursée.

---

## 14. 🏗️ Mesurer un problème qu'on aurait pu SUPPRIMER

**La forme la plus coûteuse de l'usine à gaz**, parce qu'elle a l'air vertueuse.

**Le cas, vécu le 02/08.** Les muscles de chaque exercice étaient *devinés* à partir du nom
par 69 règles ordonnées. Cette devinette produisait la famille de bugs n° 1 du projet. Réponse
apportée pendant toute une journée : des croisements, une empreinte, un indicateur de fragilité,
un audit des règles, un audit du masquage — **~350 lignes d'infrastructure pour surveiller une
déduction**.

Michel : *« des fois on veut faire compliqué et plus simple est mieux »*. Le plus simple était
d'**écrire les muscles**. Et ce qui disparaît alors n'est pas corrigé : il devient **impossible**.
Plus d'ordre où se tromper, plus de règle à masquer, plus de fragilité.

### 🔎 Comment le reconnaître
On construit un **outil de mesure** pour surveiller un mécanisme… qu'on pourrait remplacer par
une **donnée**. Le signe : l'appareil de surveillance devient plus gros que ce qu'il surveille.

> ⚠️ **Un appareil de mesure est une couche, lui aussi.** Une usine à gaz faite de tests reste
> une usine à gaz — et elle a un défaut propre : elle **fige le comportement actuel**, erreurs
> comprises.

### 🛡️ La règle à se poser, dans cet ordre
Face à un problème, trois réponses possibles :

| | Effet |
|---|---|
| Réarchitecturer | **plus** de complexité |
| Mieux mesurer | plus d'observabilité, **mais une couche de plus à maintenir** |
| **Supprimer la cause** | **moins de tout** |

**L'ordre naturel est celui-là ; l'ordre efficace est l'inverse.**

⚠️ **Nuance qui compte** : mesurer était le bon choix *tant que le catalogue grossissait vite*
(71 exercices ajoutés en 5 jours, classés gratuitement). Ce qui change, c'est que la valeur de la
devinette baisse quand le catalogue se stabilise, **alors que le coût de la surveillance reste**.
*Une règle doit deviner ce qu'on ignore, pas ce qu'on sait.*

---

## 15. 📏 LA RÈGLE JUSTE, DÉFINIE TROP ÉTROIT — *les trois bugs du 18/08* 

**La famille la plus discrète du projet, et elle a frappé trois fois dans la même journée.**
Ce n'est ni un oubli, ni une règle absente : la règle **existe**, elle est **écrite**, elle est
**testée**, et elle passe au vert. Ce qui cloche, c'est **UN MOT dans sa définition** — trop
serré d'un cran. Le comportement observé est donc « la règle ne s'applique pas », alors que le
code fait exactement ce qui est écrit.

| La règle existait… | …et sa définition était trop étroite | Livré |
|---|---|---|
| « ne jamais recharger l'app en pleine séance » (15/08) | *séance en cours* = `S.wkt.exs.length` → une séance qui commence par **20 min de cardio** ne comptait pas | ft-v903 |
| « ouvrir l'exercice suivant quand le précédent est fini » (ft-v825) | *terminé* = **toutes les lignes cochées** → les paliers d'échauffement que l'app ajoute elle-même bloquaient la bascule | ft-v904 |
| « ne pas reprocher une montée en charge qu'on a écrite » (15/08) | *on* = **l'app seulement** → une montée prescrite par **Milo** n'était pas couverte | ft-v905 |

### 🔎 Comment la reconnaître
- **Le signe le plus sûr : la personne signale DEUX FOIS la même chose.** Les trois cas ci-dessus
  sont des retours de Michel sur un comportement déjà « corrigé ». *Quand la même remarque revient,
  ce n'est pas la règle qu'il faut réécrire — c'est sa DÉFINITION qu'il faut aller relire.*
- Le test de la règle est **vert**, et il a raison de l'être : il teste le cas pour lequel la
  définition a été écrite. Il ne peut pas voir le cas qu'elle exclut.
- La règle emploie un mot du métier (« séance », « terminé », « on ») qui a **plusieurs sens
  possibles**, et le code n'en a retenu qu'un — souvent celui du jour où elle a été écrite.
- ⚠️ **Souvent, c'est un correctif ANTÉRIEUR qui a fabriqué le cas d'échec** : ft-v887 a fait
  ajouter des paliers d'échauffement par l'app, ce qui a créé la condition qui bloquait ft-v825.
  *Personne n'a rien cassé ; le monde autour de la règle a bougé.*

### 🛡️ Ce qui protège
- **Nommer la définition dans une fonction, jamais l'écrire en ligne** : `_seanceOuverte()`,
  `_wktEnCours()`, `_estEch()`. Une définition qui a un nom se relit, se teste et se corrige **en
  un seul endroit** (R2). Une condition écrite à la volée dans un `if` se duplique et diverge.
- **Écrire à côté ce que la définition EXCLUT**, pas seulement ce qu'elle inclut — c'est
  l'exclusion qui devient fausse avec le temps.
- **Le témoin doit jouer le cas limite**, pas le cas nominal : paliers laissés vides, séance de
  cardio seul, séance en pause. Les blocs L, LI et LII de `tests/parcours/` sont écrits comme ça.
- ⚠️ **Et le réflexe qui vaut pour toute la famille** : quand on corrige un auteur, une source ou
  un chemin, **chercher sa jumelle immédiatement** (réflexe 5, R8). Le 15/08 on a couvert « écrite
  par l'app » et pas « prescrite par Milo » — trois jours et un incident identique plus tard.

---

## 🧭 Les 11 réflexes qui sortent de tout ça

1. **Avant de dire qu'une chose manque** → la chercher dans le code et dans `docs/INVENTAIRE.md`.
2. **Avant de « réparer » du code orphelin** → chercher la décision. Sinon, demander.
3. **Quand une réponse est fausse sur un fait** → vérifier qu'on a bien *donné* le fait, avant de
   toucher au prompt.
4. **Quand on ajoute une règle précise** → vérifier qu'aucune règle plus large ne la précède, et
   qu'elle se déclenche vraiment.
5. **Quand on trouve un oubli** → chercher ses jumeaux dans le même bloc. Ils sont rarement seuls.
6. **Quand un contrôle négatif ne rougit pas** → c'est le test qui est cassé, pas le code qui est bon.
7. **Quand un contrôle cherche une condition ABSOLUE** (« jamais déclenchée », « toujours vide ») →
   chercher aussi sa forme **graduelle**. C'est ce qui a caché 19 règles partiellement masquées
   derrière un test qui ne voyait que les règles totalement mortes.
8. **Quand un changement COSMÉTIQUE modifie un chiffre** → c'est que le libellé sert aussi de clé
   ou d'entrée de calcul. Voir la famille 13.
9. **Avant d'ajouter une couche** (une règle, un test, un indicateur) → se demander si on peut en
   **RETIRER** une. Mesurer un problème qu'on aurait pu supprimer, c'est le rendre permanent.
10. **Quand la même remarque revient une 2ᵉ fois sur un comportement déjà corrigé** → ne pas
   réécrire la règle : aller relire **sa définition**. Trois fois le 18/08. Voir la famille 15.
11. **Quand un outil signale un défaut là où RIEN n'a changé** → suspecter l'outil avant le code, et
   ouvrir la chose incriminée pour la lire. Deux fausses alertes sur deux dans l'audit du 18/08 :
   une recherche qui se trouvait elle-même, et une différence de CASSE. Voir la famille 12ter.

---

*Dernière mise à jour : 18/08/2026 (familles 12ter — la fausse panne — et 15 — la règle définie trop étroit). À compléter à chaque nouveau bug — symptôme, cause, famille,
et ce qui le protège désormais.*


---

## 🩹 L'EXPORT QUI PERD SON CONTENU SANS RIEN DIRE *(20/08/2026)*

**À quoi on le reconnaît** : la personne appuie sur « exporter », il ne se passe **aucune
erreur**… et le fichier reçu est **vide ou tronqué**. Ici : le rapport du benchmark est revenu
avec **une seule ligne, « Benchmark Milo »** — c'est-à-dire le `title:` passé à
`navigator.share`, pas le contenu. La feuille de partage a gardé le titre et jeté le fichier.

**Pourquoi c'est vicieux** : c'est un **échec silencieux** de plus. Rien ne plante, aucun toast,
aucun test rouge — le seul témoin est la personne qui ouvre le fichier plus tard. C'est la même
signature que le bouton « copier » muet du 13/08 et que le débrief amputé du 20/08.

**Ce qui protège aujourd'hui** : le rapport a un **deuxième chemin qui ne dépend d'aucune
feuille de partage** (« 📋 Copier »), avec repli `execCommand`, puis affichage du texte dans le
chat si tout tombe — *on ne laisse jamais la personne devant un bouton qui ne donne rien*.

**⚠️ Ce qui N'EST PAS conclu** : 8 autres exports du dépôt partagent un fichier avec un titre et
**fonctionnent**. La cause n'est donc pas prouvée en général — elle est constatée **une fois**.
On a corrigé là où on l'a vue, et le test le dit : *au 2ᵉ export qui perd son contenu, la
famille sera prouvée et le témoin s'élargira.* Deviner deux fois de suite a déjà coûté cher
(famille 12ter).
