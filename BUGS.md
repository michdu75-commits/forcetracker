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
| L'**historique de l'objectif** | Michel : *« as-tu vu que j'ai changé d'objectif ? »* → « Non ». Il disait vrai : l'app gardait la valeur du JOUR, jamais son histoire | ft-v1010 |
| L'**horodatage** d'un message | posé à la création, mais **personne ne le lisait** — l'export n'affichait aucune date | ft-v1011 |
| Le **fil de discussion EN COURS** | l'export « avec mes discussions » ne prenait que les discussions RANGÉES : *on repartait sans celle du moment* | ft-v1013 |
| Le **journal alimentaire** | Milo : *« en l'état je travaille à l'aveugle sur la nutrition »* — exclusion marquée « DÉCISION À CONFIRMER », jamais confirmée | ft-v1014 |

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

### 🧾 Le cas où **les deux chiffres sont JUSTES** *(26/08/2026, ft-v1026)*

**La forme la plus vicieuse de cette famille n'est pas deux chiffres dont l'un est faux — c'est
deux chiffres tous les deux exacts, qui ne parlent pas de la même chose.**

Sur une capture d'écran de Michel : la carte *« ce que l'app a appris »* annonce *« en moyenne
**1920 kcal** »*, et **40 px plus bas** *« Ta semaine · **2 495 kcal/j** »*. Aucun des deux n'est
faux : le premier porte sur **tout le journal** (7 jours notés étalés sur 50), le second sur les
**7 derniers jours**. *Rien à l'écran ne le disait, et personne ne peut le deviner.*

**⭐ Ce qui rend ce cas différent des autres de cette famille** : il n'y a **rien à corriger dans
le calcul**. Chercher « lequel est faux » ne mène nulle part — on peut y passer une heure. Le
défaut est dans ce que l'écran **dit** de ses chiffres, pas dans les chiffres.

**🔎 Comment le reconnaître** : deux nombres de même nature (une moyenne, un total, un
pourcentage) visibles **en même temps**, et aucun des deux ne nomme sa **fenêtre** ni son
**périmètre**. Le doute que ça installe ne porte pas sur le chiffre : il porte sur l'app.

**🛡️ Ce qui protège** : tout agrégat affiché **dit sur quoi il porte**, à côté du nombre et pas
dans une aide. *« Observé sur tout ton journal »*, *« 4 jours notés sur 7 »*. ⚠️ Et le témoin qui
le garde doit poser une fixture où les deux valeurs **diffèrent vraiment** — sinon il est vert en
ne mesurant rien.

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
- **🗓️ LIRE UN ÉTAT DU PROJET SANS REGARDER SA DATE** *(26/08/2026)* : j'annonce à Michel qu'il
  lui reste à trouver une figurine de Squat Sumo. **Il l'avait supprimé la veille** — *« squat
  sumo on supprime »*, 25/08, et la décision était écrite **à quatre endroits** (deux commentaires
  de code, `constants.js`, et `A-FAIRE-SUR-PC.md` où la tâche était déjà marquée CLOSE). Je lisais
  un point d'étape daté du **24/08**. ⭐ **Le signe qui aurait dû alerter** : un document d'état
  porte toujours une date, et *une date d'hier sur un projet qui livre six versions par jour n'est
  pas un état, c'est un souvenir*. 🛡️ **Le réflexe** : avant d'annoncer qu'une chose reste à faire,
  **la chercher dans le code**, pas dans un résumé — c'est R23, et c'est la 3ᵉ fois dans la même
  journée (les deux autres : un brief qui décrivait un composant qui n'est pas ce qu'il croit, et
  une aide qui envoyait « sous l'anneau », un repère disparu).
  ⚠️ **Et le fichier lui-même entretenait le piège** : le bloc « ✅ CLOS » était resté **dans la
  section « ⏳ En attente »**. *Un item clos posé au milieu des tâches en attente se lit comme une
  tâche* — la famille n°1 de ce fichier, appliquée à une liste de courses. Il est descendu dans
  « ✅ Fait », avec sa raison et son historique.
- **💬 UN TÉMOIN QUI COMPTE LES COMMENTAIRES MESURE LA DOCUMENTATION, PAS LE CODE**
  *(26/08/2026, ft-v1025)* : pour garantir qu'un bloc n'existe qu'à **un seul endroit** (R2), je
  compte les occurrences de son titre dans `screens.js`. Le témoin rend **2** et rougit — alors
  qu'il n'y a bien qu'un seul rendu. **Les deux occurrences trouvées étaient des COMMENTAIRES** :
  dans le vrai code, l'apostrophe est **échappée** (`Ce qu\'il te reste`), donc le motif ne
  touchait **jamais** le rendu qu'il prétendait compter. *Il aurait été tout aussi vert si le
  rendu avait disparu.* 🛡️ **Le réflexe** : chercher un motif que seul le **code** peut produire
  — ici la balise fermante `te reste, en vrai</div>` — jamais une phrase que la doc répète aussi.
  ⚠️ Et se méfier des **échappements** : `'` en JavaScript devient `\'` dans la source, donc un
  motif écrit « comme à l'écran » rate systématiquement le code.
- **🚰 `| tail` AVALE LE CODE DE SORTIE** *(26/08/2026, ft-v1025)* : je lance la suite parcours
  avec `node tests/parcours/runner.js 2>&1 | tail -60`. Le harnais annonce **« exit code 0 »** —
  or le nouveau bloc **n'avait pas tourné du tout** : il était posé **après** `await b.close()`,
  et la suite s'est arrêtée sur `browser has been closed` **sans jamais imprimer sa ligne
  TOTAL**. En shell, le code de sortie d'un tuyau est celui du **DERNIER** maillon — `tail` réussit
  toujours. *La suite avait échoué, l'outil disait vert.* ⭐ **Ce qui l'a rattrapé n'est pas le
  code de sortie, c'est d'avoir cherché la ligne TOTAL et de ne pas l'avoir trouvée.**
  🛡️ **Le réflexe** : rediriger vers un fichier (`> sortie.txt 2>&1`) et lire le code de sortie
  **de la commande elle-même**, jamais à travers un tuyau. Et devant une suite « verte »,
  vérifier que sa ligne de TOTAL est là — *une suite qui s'arrête en route n'imprime pas de
  total, et une absence ne se remarque pas.*
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

## 12quater. 📸 LA CAUSE DÉDUITE D'UN SEUL NOMBRE — *sans jamais regarder l'écran* **(22/08/2026)**

> **Michel** : *« j'ai trouvé un bug mais pas vraiment un bug lol »*, puis *« j'ai mis 30 grammes de
> protéine mais en fait… j'ai voulu mettre 30 grammes de POUDRE de protéine, et ça fait 88 grammes
> de protéine »*.

**Ce que j'ai fait.** J'ai calculé que **88 g de protéine = exactement 100 g** d'une poudre titrant
88 g/100 g, j'en ai **déduit** que la quantité était restée à sa valeur par défaut, j'ai trouvé une
explication élégante (le champ « Quantité » placé **avant** le champ de recherche), **et j'ai livré
ft-v965 sur cette cause.**

**Ce que l'écran montrait.** Michel a envoyé la vidéo :

| Ce que j'affirmais | Ce que l'écran montrait |
|---|---|
| Quantité restée à **100 g** | Quantité : **30 g** ✅ |
| Macros fausses | **117 kcal · 26 g de protéines** — exactes ✅ |
| Bug de saisie | **Aucun bug** : le 88 était la **carte produit**, titrée *« Valeurs pour 100 g »* |

**Pourquoi c'était crédible — et c'est là le piège.** La coïncidence était **parfaite** : cette poudre
titre justement **88 g/100 g**, donc mon calcul « tombait juste ». *Une coïncidence parfaite est
exactement ce qui rend une fausse cause convaincante* — il n'y avait aucun frottement pour m'arrêter.

**À quoi on la reconnaît.**
- On explique un symptôme à partir d'**un seul nombre** rapporté, sans voir l'état réel.
- L'explication est **élégante** et referme le sujet d'un coup.
- On n'a **pas demandé** la capture / la vidéo alors qu'elle était à un message de distance — et la
  personne en envoie d'habitude.

**Ce qui protège.**
- ⛔ **Demander l'écran avant d'expliquer**, quand le symptôme est visuel. Michel envoie des captures
  spontanément : le coût de la question est nul, celui d'une fausse cause est une version livrée.
- ⭐ **Rejouer le cas exact** (déjà la leçon de ft-v959 avec « poulet », et de ft-v963 avec l'accent).
- ⚠️ Et si on a livré : **corriger le journal en le DISANT**, pas en le réécrivant en douce — sinon la
  fausse cause devient la mémoire du projet (**R23/R27**).

**Le défaut n'était pas le code livré.** Déplacer la quantité près des macros reste bon, et le témoin
d'ordre est gardé. **Ce qui était faux, c'est la RAISON écrite à côté** — et une raison inventée
survit bien plus longtemps qu'un bug, parce que rien ne la teste.

**⭐ Le vrai défaut, lui, était ailleurs** : **deux nombres de protéines sur le même écran** (88 et 26)
sans que rien ne dise lequel est le sien. C'est la famille **§7 — deux sources qui se contredisent**,
sauf qu'ici aucune des deux n'est fausse : *c'est leur voisinage muet qui trompe.*

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

## 🧪 LE VÉRIFICATEUR ÉPROUVÉ SUR SES PROPRES EXEMPLES *(26/08/2026, ft-v1016)*

**Le mécanisme.** On écrit un motif qui doit attraper un défaut. On l'éprouve **dans les deux
sens** — vert sur une bonne réponse, rouge sur une mauvaise — et il passe. Sauf que les deux
réponses, c'est **soi** qui vient de les écrire. *Le motif ne mesure alors pas le monde : il
mesure l'imagination de celui qui l'a écrit.*

**Le cas.** EV-052 devait vérifier que Milo nomme précisément le hip thrust. Corrigé une première
fois (ft-v1007), éprouvé sur 4 cas dans les deux sens, livré vert. ⛔ **Il rougissait toujours sur
la vraie réponse de Milo** : le motif prenait la **PREMIÈRE** occurrence, or Milo écrivait d'abord
*« une séance jambes/fessiers solide avec le **hip thrust** en tête de file »* — de la **prose** —
puis, deux lignes plus bas, la prescription *« **Hip Thrust Barre** »*. Aucun de mes exemples
n'avait cette forme-là, parce que je n'y avais pas pensé.

**⚠️ Pourquoi c'est vicieux** : le témoin était **vert**, la correction **documentée**, l'épreuve
**faite**. Rien ne signalait le trou. Il n'est tombé qu'au moment où on l'a confronté à une
réponse **réelle**.

### 🔎 Comment le reconnaître
- Les cas de test d'un motif sortent tous de la **même tête** que le motif.
- Le motif emploie `match()` (première occurrence) là où le texte réel peut en contenir plusieurs :
  une mention **en passant** et une **prescription** ne sont pas la même chose.
- Le vérificateur passe, mais on n'a jamais vu ce qu'il donne sur une **vraie** sortie du modèle.

### 🛡️ Ce qui protège
- ⭐ **Le rejeu gratuit** (« 🔬 Rejouer les vérificateurs sur la dernière passe », 0 appel, 0 €) :
  il repasse les motifs **d'aujourd'hui** sur les réponses **déjà payées**. C'est lui qui a trouvé
  celui-ci — et au passage prouvé les 5 autres corrections (**9 rouges → 4**).
- **À employer AVANT toute passe payante** : ce qui touche au *motif* se vérifie pour zéro euro ;
  seul ce qui touche à *Milo* se paie.
- Et dans le motif lui-même : préférer « **une** occurrence suffit » (`match(/…/g)` + `some`) à
  « la première décide », dès qu'un mot peut apparaître deux fois avec deux statuts.

---

## 🔐 LA DONNÉE QUI ENTRE DANS LE CONTEXTE ET OUBLIE SON ANTI-FUITE *(26/08/2026, ft-v1014)*

**Le mécanisme.** Le banc d'essai remplace les données réelles de la personne par celles d'un
persona (`_vcApplyPersona`). Son en-tête dit, mot pour mot : *« anti-fuite : TOUT ce que lit le
contexte »*. **Ajouter une source au contexte crée donc une obligation jumelle** — la remettre à
zéro là-bas. L'oublier n'est pas un défaut de test : c'est une **fuite**, la vraie donnée de la
personne part dans le contexte de **chaque** persona joué.

**Le cas.** `foodLog` est entré dans le contexte à 09h30 ; sans la ligne correspondante, **le vrai
journal alimentaire de Michel serait parti dans les 54 scénarios** de la passe suivante.
⚠️ **Et c'était aussi un piège de fixture** : sans la remise à zéro, le `foodLog` d'un scénario
n'atteint jamais `S` — donc le scénario ne teste rien. *C'est la fixture muette d'EV-009, refaite
le lendemain de sa correction.*

### 🛡️ Ce qui protège
- Un témoin qui **généralise** : il compare ce que `buildCoachContext` **lit** à ce que
  `_vcApplyPersona` **remet à zéro**. Il a trouvé **8 autres trous** (`programmes`, `nextPlanned`,
  `exSwaps`…), **épinglés avec leur raison** plutôt que corrigés à la volée — les corriger
  changerait ce que Milo reçoit, donc ça demande sa propre mesure (**R34**).
- Une **neuvième** fera rougir la livraison. *Un trou qu'on mesure vaut mieux qu'un trou qu'on
  découvre.*

---

## 🌀 LE CLONE PÉRIMÉ QUI FAIT CROIRE À UNE PERTE *(26/08/2026)*

**Le mécanisme.** Le conteneur de session est éphémère. Recréé, il reclone le dépôt — et le clone
peut dater de **plusieurs jours**. `git fetch --all` peut alors **ne rien corriger** : on lit un
`master` qui a reculé.

**Le cas.** `origin/master` affichait **ft-v939 du 21/08**, cinq jours en arrière, et un commit
poussé une heure plus tôt n'existait **même pas** (`fatal: Not a valid object name`). Un fetch
**explicite** a ramené la réalité en une ligne : `+ 84cdf26...91c5d92 master (forced update)`.

**⛔ Le danger n'est pas la perte — rien n'était perdu.** C'est la **conclusion** : croire son
travail disparu, ou pire, *« réparer »* master en poussant par-dessus — ce qui écraserait le
travail de l'autre session.

### 🛡️ Ce qui protège
- `git fetch origin <branche>` **explicite**, jamais `--all` seul, après une reprise de session.
- **Devant un master qui a reculé : on ne pousse rien.** On refait un fetch explicite et on regarde
  les dates. (Écrit aussi dans `docs/JOURNAL-DE-PARTAGE.md`.)

---

## 🧭 Les 12 réflexes qui sortent de tout ça

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

12. ⭐⭐ **Quand la personne décrit un symptôme et que ta mesure dit le contraire** → c'est ta
   MESURE qui ne reproduit pas son écran, pas elle qui se trompe. *Elle regarde le vrai
   système ; toi, une fixture.*
   **Le cas qui l'a fondé (30/08/2026, ft-v1062)** — trois versions pour un seul bug, et
   **deux diagnostics faux de ma part** :
   - ① mon test jouait tout le chemin et passait → j'ai corrigé la **livraison du fichier**.
     Vrai défaut, mais pas le sien. Cause : ma fixture avait **1 séance**, l'écran ne défilait pas.
   - ② en VÉRIFIANT le bon diagnostic, j'ai mesuré avec **8 séances** — la modale ressortait
     visible, j'ai écrit « mon hypothèse est fausse ». **Elle ne l'était pas** : à 8 séances les
     deux cartes du haut ne s'affichent pas, l'écran est plus court (473 px de défilement au lieu
     de 905). *Le même piège, deux fois, dans la même heure.*
   - ③ ce qui a tranché **les deux fois** : ce qu'il a envoyé. Ses **cinq mots** — *« ça clique
     bien mais rien ne se passe »* — séparaient le bouton (qui répond) de la fenêtre (qui ne
     s'ouvre pas), donc éliminaient la moitié du code. Puis sa **vidéo** a donné sa position de
     défilement exacte, la seule chose qui manquait.
   👉 **La règle qui en sort** : *une observation brute ne ment jamais ; une mesure, si — quand
   elle porte sur autre chose que ce que la personne a sous les yeux.* Et corollaire pour les
   questions à poser : demander **ce qui se passe** (« le bouton répond ? une fenêtre ? un
   message ? ») vaut mieux que demander ce que la personne **croit** être la cause.

---

*Dernière mise à jour : 30/08/2026 (famille 24 — la fixture sans profondeur — et réflexe 12 — quand la mesure contredit la personne). À compléter à chaque nouveau bug — symptôme, cause, famille,
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

**⚠️ Ce qui N'ÉTAIT PAS conclu le 20/08** : 8 autres exports du dépôt partagent un fichier avec
un titre et **fonctionnent**. La cause n'était donc pas prouvée en général — elle était constatée
**une fois**. On a corrigé là où on l'a vue, et le test le disait : *au 2ᵉ export qui perd son
contenu, la famille sera prouvée et le témoin s'élargira.*

**✅ LE 2ᵉ EST ARRIVÉ — 23/08/2026, ft-v978.** Michel : *« dans Milo, le pdf ne fonctionne pas, il
y a juste **Conseil de Milo** »*. Le code passait `title:'Conseil de '+coach`. **Même signature,
au mot près, sur une autre fonctionnalité et un autre format de fichier** (.pdf au lieu de .txt).

**⭐ Et cette fois le contenu a été MESURÉ avant de conclure** (la leçon de 12quater) :
`_coachPdfText` rend **81 caractères sur 81**, **323 sur 345**, **9 769 sur 9 769** selon le
format. *Le fichier est bon. C'est la livraison qui échoue.* Les deux hypothèses proposées par
l'audit — « le PDF est vide » et « le PDF est trop pauvre » — étaient fausses toutes les deux.

**⛔⛔ ET LE VRAI DÉFAUT N'ÉTAIT PAS LE BUG, C'ÉTAIT SA PROPAGATION.** Le correctif était écrit
depuis le 20/08, dans ce dépôt, avec sa raison : *« PAS DE title: DANS LE PARTAGE »*. **Il avait
été posé sur 1 export sur 10.** C'est la 3ᵉ fois en deux jours qu'un correctif juste ne vit que
d'un côté (voir la famille « le correctif posé d'un seul côté »).

**Ce qui protège aujourd'hui** : **aucun** des 10 partages de fichier ne passe de titre, et un
témoin compte les deux populations séparément — *fichier sans titre* d'un côté, *lien avec titre*
de l'autre (un lien, lui, a besoin du sien). Un nouveau partage de fichier avec titre fait rougir
la livraison.

**⚠️ Ce qui reste NON prouvé, et c'est écrit à côté du code** : l'échec lui-même n'a jamais été
reproduit — il demande un vrai Safari iOS. Et puisque d'autres exports fonctionnaient **avec** un
titre, le titre seul n'explique probablement pas tout : ce qui varie est sans doute l'application
choisie dans la feuille de partage. *On corrige avec ce qui a marché une fois, en disant ce qu'on
ne sait pas.*

---

## 🧱 LE CORRECTIF POSÉ D'UN SEUL CÔTÉ *(23/08/2026, ft-v973)*

> **Michel**, capture du Journal à l'appui : *« Beug, je ne peux plus défiler en bas »* — sa
> dernière ligne restait coincée sous la barre de navigation.

**Le mécanisme** : le correctif **existait**, juste, éprouvé… mais posé sur **un seul** des six
écrans concernés. Safari n'ajoute pas le `padding-bottom` d'un conteneur flex qui défile à sa
hauteur défilable ; l'espaceur qui répare ça avait été ajouté en **ft-v670** — à l'écran Progrès
seulement. Les cinq autres ont gardé pendant des mois un padding que l'iPhone ignore.

**Pourquoi c'est vicieux, et pourquoi ça dure** :
- **rien n'échoue** — les cinq écrans marchent parfaitement partout ailleurs (Chrome compte le
  padding), et l'iPhone ne lève aucune erreur ;
- **ça ne mord qu'au-delà d'un seuil** : tant que le contenu tient dans l'écran, on ne voit rien.
  Le défaut attend qu'une page s'allonge — ici, que Michel se mette vraiment à noter ses repas ;
- **la présence du correctif ailleurs rassure** : on se souvient de l'avoir traité, donc on ne
  cherche plus.

**À quoi on le reconnaît** : un correctif nommé, commenté, documenté… et **un seul appelant**.
La question à poser est toujours la même : *« combien d'endroits ont ce problème, et combien
portent le correctif ? »* — deux nombres, pas un.

**⚠️ Et la fausse piste est presque garantie** : j'ai d'abord accusé la version de la veille
(ft-v968, qui avait rallongé la page de 155 px). Rejoué sur le code d'avant avec les mêmes
données : la dernière ligne était **déjà** cachée. *Un défaut ancien qui se révèle ressemble
exactement à un défaut neuf* — et le dernier changement est toujours le suspect le plus
disponible (famille 12quater).

**Ce qui protège aujourd'hui** : un témoin **structurel** qui lit le DOM et exige l'espaceur sur
**chaque** écran qui défile — donc valable pour n'importe quel moteur, et **un écran futur sans
espaceur fait rougir la livraison**. *Le correctif de ft-v670 était juste ; ce qui manquait,
c'est ce qui empêche de l'oublier ailleurs* (**R8/R13**).

### ⭐⭐ 2ᵉ CAS *(27/08/2026, ft-v1030)* — **la variante la plus coûteuse : le côté oublié est celui qui DÉCIDE**

Le 14/08 (ft-v851), sur une idée de Michel — *« faudrait qu'il continue en chiffre négatif jusqu'à
ce que la personne appuie »* — on a retiré les bornes `Math.max(0, …)` des **deux fonctions qui
AFFICHENT** le chrono de repos (`updRest`, `_updPill`). **On n'a jamais touché à `_restTick`**, qui
appelait `stopRest()` dès `left<=0`.

👉 ***Les afficheurs savaient montrer du négatif ; plus personne ne les appelait.*** La
fonctionnalité a donc été **écrite, commentée, portée au journal comme livrée — et n'a jamais
tourné une seule fois** pendant treize jours.

**Ce que ce cas ajoute au premier**, et c'est la partie qui coûte cher : dans le cas de 2023 les
six écrans étaient **équivalents**, on en avait juste oublié cinq. Ici les deux côtés ne sont pas
du même ordre — il y a celui qui **affiche** et celui qui **décide**. *Corriger l'affichage
pendant que le décideur garde l'ancienne règle produit un code qui a l'air complet, se relit
comme complet, et ne fait rien.*

**À quoi on le reconnaît** :
- le correctif porte sur du **rendu** (une borne, un format, une couleur) alors que le
  comportement voulu dépend d'un **cycle de vie** (un `setInterval`, un `return`, un `stop`) ;
- ⚠️ **le commentaire du code affirme le comportement** — c'est le signe le plus trompeur, parce
  qu'on le relit et qu'on le croit. Ici le commentaire de ft-v851 décrivait précisément ce que
  l'app ne faisait pas.

**Ce qui protège** : **mesurer le comportement avant de le déclarer acquis.** Ce défaut n'a été
trouvé qu'en jouant un vrai repos dans un navigateur et en lisant le chrono seconde par seconde —
il était **invisible à la relecture**, et je l'avais moi-même annoncé à Michel comme fonctionnel
la veille (**R23**). *Un comportement différé ne se vérifie pas en lisant : il se joue.*


---

## 🔁 LE CONTRÔLE CIRCULAIRE — *un vert qui ne peut pas rougir* **(23/08/2026, ft-v974)**

**À quoi on le reconnaît** : un contrôle qui **compare une valeur à la formule qui l'a produite**.
Ici, le lecteur de rapport de balance retrouve la masse maigre par soustraction quand l'OCR la
perd (`poids − gras`), puis un contrôle vérifiait… `maigre = poids − gras`. **Il était vert sur
les 5 rapports, et il l'aurait été sur n'importe quoi** — y compris sur une lecture entièrement
fausse.

**Pourquoi c'est vicieux** : ça ne ressemble pas du tout à un bug. Le contrôle est **écrit**, il
**tourne**, il est **vert** — et il gonfle le compte de contrôles réussis, donc il *renforce* la
confiance qu'il devrait mettre à l'épreuve. C'est le cousin exact des **faux zéros** du Gardien
(§12) : le chiffre rassurant venait de ce que rien n'était réellement mesuré.

**Ce qui l'a démasqué** : pas une relecture — **l'extension du contrôle positif**. En injectant
des erreurs une par une (protéine, poids, %gras, muscle, eau), deux d'entre elles passaient au
vert. C'est le même réflexe que pour le Gardien : *un garde-fou qu'on n'a pas vu rougir n'est pas
un garde-fou.*

**Et il en cachait un second**, trouvé dans le même mouvement : une valeur **écartée par ses
bornes** emportait avec elle l'équation qui l'aurait démasquée — « Muscle 4.5 » passait donc pour
une lecture correcte, par simple disparition. Un contrôle ne peut pas se contenter de vérifier ce
qui est **présent** : il doit aussi exiger ce qui **doit** l'être.

**Ce qui protège aujourd'hui** : la valeur déduite est **marquée** comme telle et ne sert plus à
se vérifier elle-même ; les 8 valeurs du tableau principal sont **obligatoires** ; et les deux
comportements sont épinglés par des témoins qui injectent l'erreur au lieu de constater le succès.

**Le réflexe à garder** : devant un contrôle vert, se demander *« qu'est-ce qui le ferait
rougir ? »*. Si la réponse ne vient pas en une phrase, il ne mesure probablement rien.


---

## 🫥 LA DONNÉE ÉCRITE AU MAUVAIS ENDROIT, QUE PERSONNE NE PEUT VOIR MANQUER **(26/08/2026)**

**Michel, devant le constat : *« j'appelle ça un bug moi »*.** Il a raison, et c'est la
2ᵉ occurrence en deux jours (25/08 puis 26/08) — *deux fois le même défaut, ce n'est plus
un accident, c'est une famille.*

**Ce qui s'est passé** : dans `docs/JOURNAL-DE-PARTAGE.md`, des lignes de **tâche** se sont
retrouvées dans le tableau des **ÉTATS** (la légende) au lieu de celui des **TÂCHES**. Le
25/08 c'était deux lignes de session-B, remises à la main par session-A ; le 26/08, deux
autres lignes de session-B (ft-v1009 et ft-v1012), trouvées par hasard en ouvrant le fichier
pour autre chose.

**⛔⛔ LA CAUSE N'EST PAS DE LA NÉGLIGENCE, ELLE EST DANS LA FORME DU FICHIER.** Deux tableaux
y portent des lignes qui **commencent par le même jeton** :

| Tableau | Ligne | Colonnes |
|---|---|---|
| **Les états** (~ligne 41) | `\| 🟢 **livré** \| terminé… \|` | 2 |
| **Les tâches** (~ligne 118) | `\| 🟢 \| 26/08 09:08 → 09:55 \| session-B \| … \|` | 6 |

👉 **Et le leurre vient EN PREMIER dans le fichier.** Toute insertion qui vise *« la première
ligne `| 🟢` »* atterrit mécaniquement dans la légende. Ce n'est pas une faute d'inattention,
c'est une **ambiguïté structurelle** : le fichier offre deux cibles identiques, et présente la
mauvaise d'abord.

**⛔⛔ CE QUI LE REND COÛTEUX EST LE SILENCE.** Markdown affiche une ligne de 6 colonnes dans
un tableau de 2 en **jetant les cellules en trop**. La ligne **existe** dans le fichier, elle
est **invisible** à l'écran. Le fichier reste valide, git ne dit rien, aucun rendu ne casse.

👉 ***Personne ne peut voir manquer une ligne dont on ignore l'existence.*** Or ce fichier
existe pour une seule chose : dire qui travaille sur quoi. Une tâche invisible, c'est
exactement le doublon de travail que le protocole est censé empêcher — **le garde-fou tombe
en panne dans la panne qu'il surveille**.

### 🔎 Comment le reconnaître
- Deux zones d'un même fichier acceptent une **forme voisine**, et l'une n'est pas la bonne ;
- l'écriture au mauvais endroit **ne produit aucune erreur** — ni au rendu, ni à la relecture ;
- ce qu'on cherche à protéger est **une absence**, et une absence ne se remarque pas.

### 🛡️ Ce qui protège aujourd'hui *(contrôle 6 de `tools/check_regles.py`)*
Une ligne de la **légende** n'a jamais de date. Le contrôle refuse donc toute ligne **datée**
(`JJ/MM`) dans le tableau des états, **fait échouer la livraison** (sortie 1) et **imprime la
ligne fautive** avec le geste correct. ⭐ **La règle est figée, pas la mesure du jour** : elle
ne périme pas si le tableau grandit. ⭐ Il porte aussi un garde-fou contre lui-même — si plus
aucune ligne datée n'est trouvée dans le tableau des tâches, il prévient qu'il ne mesure
peut-être plus rien. Éprouvé **dans les deux sens** : rouge (sortie 1) sur une ligne égarée
posée exprès, vert après remise en état.

### ⭐ Le réflexe
Quand on insère dans un document structuré, **s'ancrer sur l'EN-TÊTE de la section visée**,
jamais sur le premier motif qui ressemble — surtout si le même motif vit ailleurs dans le
fichier. *Et vérifier ce qu'on vient d'écrire à l'endroit où il est censé se lire, pas dans
le diff* : le diff montre la ligne ajoutée, il ne dit pas dans quel tableau elle est tombée.


### 🧟 Le miroir : **la ligne RESSUSCITÉE par une fusion qui ne supprime jamais** *(26/08/2026, le même jour)*

**Le correctif de la famille ci-dessus a créé sa jumelle.** En fusionnant deux versions du
journal de partage, j'ai pris **l'UNION** des lignes de tâche — précisément pour n'en *perdre*
aucune, puisque c'est ce que la famille précédente punit.

**⛔⛔ Mais une union ne supprime jamais.** L'autre session avait **retiré** sa ligne 🟡 en la
remplaçant par une 🟢 ; l'union l'a **ramenée**. Le tableau annonçait donc *« quelqu'un
travaille dessus »* sur un sujet **livré depuis des heures** — exactement le mensonge que ce
fichier existe pour empêcher, obtenu en réparant l'autre.

👉 ***Un choix qui ne peut que gagner ne peut pas non plus oublier.*** Une stratégie de fusion
qui ne fait qu'ajouter est sûre contre la perte et **aveugle au retrait volontaire** : elle ne
distingue pas *« l'autre n'avait pas cette ligne »* de *« l'autre l'a délibérément enlevée »*.

**⚠️ Et ça s'est vu par hasard**, en préparant autre chose — pas par un test. La ligne
ressuscitée est **syntaxiquement parfaite** : rien ne la distingue d'une vraie tâche en cours.

### 🛡️ Ce qui protège aujourd'hui *(contrôle 7 de `tools/check_regles.py`)*
Une 🟡 et une 🟢 qui portent la **même session** et la **même heure de départ** sont la même
tâche, avant et après clôture : **la 🟢 fait foi, la 🟡 est un reste**. Le contrôle les
rapproche, **fait échouer la livraison** et nomme la cause. Éprouvé dans les deux sens : rouge
(sortie 1) sur un zombie remis exprès, vert après retrait.

### ⭐ Le réflexe
Devant une fusion « je garde tout », se demander **ce que l'autre côté a délibérément retiré**.
*L'union protège de l'oubli, jamais de la résurrection* — et les deux produisent un fichier qui
ment, dans des directions opposées.
---

## 18. 📐 LA SPÉCIFICATION QUI NOMME UN COMPOSANT QUI N'EST PAS CE QU'ELLE CROIT *(26/08/2026)*

**Le mécanisme.** Un document de conception écrit **depuis l'extérieur du code** — brief de
maquettage, note d'architecture, rapport d'audit — désigne un composant existant en modèle
(*« reprends l'anneau de récup »*, *« comme le bloc X »*). Le nom est juste, **la chose ne l'est
pas** : le composant fait autre chose, ou s'appelle autrement dans le code. Suivi au mot, le
document fait travailler au mauvais endroit — et **le résultat compile, s'affiche, et paraît
correct**.

### Les cas connus

| Ce que la spécification affirmait | Ce que le code disait | Version |
|---|---|---|
| *« le PDF de Milo ne contient que le titre »* (audit de 200 pages, classé P0) | l'extraction rendait **81 caractères sur 81, 9 769 sur 9 769** — c'était la **livraison** qui échouait, pas le contenu | ft-v978 |
| *« Milo est dans la chaîne de saisie alimentaire »* · *« une saisie invalide le cache »* · *« seuil de rentabilité 1,39 »* | trois affirmations **fausses**, vérifiées dans le code | ft-v978 |
| *« reprends le composant SVG existant — celui de l'anneau de récup »* | cet anneau est en **`conic-gradient` + masques**, avec un commentaire disant que c'est *la seule façon d'avoir une couleur qui suit le cercle*. Le vrai anneau SVG est celui de la **bande des 7 jours** | ft-v1025 |
| *« charge/décharge `#nu-cycle` »* | `#nu-cycle` est l'**explication du cycle des glucides** ; les boutons sont `.phase-row`. Le suivre aurait rangé le mauvais bloc **et laissé les vrais boutons** au milieu de l'écran | ft-v1025 |
| *« ce bloc n'existe pas — le créer »* | il existait depuis **le matin même**, dans un autre onglet. Le créer aurait produit **deux exemplaires** qui divergent (R2) | ft-v1025 |

### 🔎 Comment la reconnaître
- La spécification **nomme** un composant, un fichier ou une ligne **sans citer son code** ;
- elle a été écrite **sans accès au dépôt**, ou à une révision antérieure — et le dit rarement ;
- l'erreur est **plausible** : le composant existe vraiment, il ne fait simplement pas ça.

⚠️ **Le mode d'échec n'est jamais une erreur** : on obtient un écran qui marche, construit sur la
mauvaise brique. C'est **R28** (*une limite non vérifiée devient une règle de conception
silencieuse*) vue de l'autre côté — ici ce n'est pas une limite qu'on croit, c'est une **capacité**.

### 🛡️ Ce qui protège
Rien d'automatique, et c'est le point : **le seul garde-fou est de vérifier chaque affirmation
avant d'écrire une ligne**, et d'écrire l'écart trouvé plutôt que de corriger en silence — sinon
le document repart tel quel vers la personne suivante. Les trois kits du projet
(`DESIGN-KIT.md`, `CONTRAINTES-PDF.md`, `MOTEUR-MET-A-COLLER.md`) existent pour **réduire** cette
famille à la source : ils donnent à l'outil extérieur les vraies valeurs, au lieu de le laisser
deviner.

### ⭐ Le réflexe
Devant une spécification écrite hors du code : **relever les numéros de ligne et les noms de
composants D'ABORD**, en bloc, avant de planifier quoi que ce soit. Ça coûte dix minutes et ça a
déjà changé deux fois la nature du travail à faire.

---

## 19. 🎭 LA PRÉCÉDENCE D'OPÉRATEUR QUI FAIT DISPARAÎTRE UN BLOC ENTIER *(26/08/2026, ft-v1028)*

**Le mécanisme.** Deux morceaux d'affichage sont assemblés autour d'un ternaire :

```js
const bloc = ex.note ? '<div>la consigne</div>' : '' + _intensiteBandeau(ex);
```

L'intention est *« la consigne s'il y en a une, PLUS le bandeau, toujours »*. JavaScript lit
`ex.note ? '…' : ('' + bandeau)` — le `+` se lie plus fort que le `? :`. 👉 **Le bandeau ne
s'affiche QUE si la consigne est absente.**

**Ce qui rend cette famille coûteuse, c'est qu'elle est parfaitement silencieuse.** Aucune erreur,
aucun test rouge, aucune trace en console : la page se rend, elle est simplement **incomplète**.
Et personne ne peut voir manquer un bloc dont il ignore qu'il devait être là.

**Le cas réel.** Le bandeau en question ne portait pas qu'un chiffre d'intensité : `seanceWarn` y
met les **🚫 exclusions** et les **🛡️ blessures**, c'est-à-dire la sortie du **Gardien** au niveau
de la séance. ⛔⛔ **Et la condition qui l'effaçait sélectionnait exactement la mauvaise
population** : ce sont les exercices venus d'un **programme** qui portent une consigne. *L'avertis-
sement de sécurité disparaissait précisément là où il était le plus attendu.*

### 🔎 Comment la reconnaître
- Un ternaire **suivi d'un `+`**, ou précédé d'un `+`, sans parenthèses autour de la condition.
- Le symptôme se raconte toujours pareil : *« ça marche, sauf quand il y a … »* — et le « quand il
  y a » est la branche du ternaire.
- ⚠️ **Elle se lit mal parce qu'on lit l'INTENTION** : la ligne dit ce qu'on voulait écrire. C'est
  la même illusion que la famille **« le premier match gagnant »** (§1).

### 🛡️ Ce qui protège
- Ne jamais laisser un ternaire nu dans une concaténation : **parenthéser la branche**, toujours,
  même quand ça paraît inutile — le coût est de deux caractères.
- Et un témoin qui vérifie **la présence simultanée** des deux morceaux (ici : la consigne ET le
  bandeau, dans le même rendu). Un témoin qui teste chaque moitié séparément reste vert : chacune
  s'affiche bien… dans le cas où l'autre est absente.

### ⭐ Le réflexe
Quand un bloc d'affichage **conditionnel** en côtoie un autre qui doit être **inconditionnel**,
les écrire sur deux lignes séparées plutôt que dans une seule expression. *Une expression qui
mélange « parfois » et « toujours » finit par tout rendre « parfois ».*

---

## 20. 🎯 LA RÈGLE CSS QUI ATTRAPE PLUS LARGE QUE SA CIBLE *(27/08/2026, ft-v1029)*

### Ce qui s'est passé
La pop-up « Quoi de neuf » affichait, en production :

> En arrivant sur
> **Nutrition**
> , tu vois maintenant
> **ta journée d'abord**
> : ce que tu as mangé…

Chaque mot mis en valeur occupait **sa propre ligne**, la phrase était coupée en morceaux et une
**virgule se retrouvait seule en début de ligne**.

### La cause
```css
.sw-feat b{display:block;…}     /* visait le TITRE de la carte */
```
Le sélecteur attrape **tout** `<b>` descendant — donc aussi ceux du texte, dans le `<small>`.
Corrigé en `.sw-feat>div>b` (le titre est un enfant **direct**).

### ⚠️ Ce qui rend cette famille sournoise
**Le défaut dormait depuis l'écriture de `.sw-feat`.** Il fallait qu'une description contienne du
gras pour se voir — et sur **57** entrées « Quoi de neuf », **une seule** le faisait : celle de
ft-v1025, écrite la veille. *Un défaut invisible n'est pas un défaut absent : il attend son
premier cas.* Rien ne le signalait — pas d'erreur, pas de test rouge, un rendu parfaitement
« normal » pour qui ne lit pas la phrase.

### ⭐⭐ Et comment il a été trouvé — c'est le vrai enseignement
**Par une CAPTURE prise pour vérifier tout autre chose.** Aucune mesure de texte ne pouvait le
voir : le HTML est correct, les mots sont dans le bon ordre, `innerText` rend la bonne phrase.
*Seul le rendu trahit un `display` — c'est la 3ᵉ fois qu'une capture attrape ce qu'une mesure de
chaîne ne peut pas voir* (ft-v1025 : un libellé coupé en travers de son titre · ft-v1026 : une
phrase tronquée à 42 caractères).

### ⛔ Le piège du correctif
Le témoin fige **les deux moitiés** : le titre **doit rester** en bloc, le gras du texte **doit
rester** en ligne. Sans la première, on « corrigerait » en supprimant la règle — et tous les
titres de cartes se colleraient à leur texte. *Une règle trop large ne se supprime pas, elle se
vise.*

### ⭐ Le réflexe
Quand une règle CSS met en forme **un** élément d'un composant, l'ancrer sur sa **place**
(`>div>b`) et non sur sa **balise** (`b`). Une balise de mise en forme — `b`, `i`, `small`, `span`
— réapparaît toujours dans le contenu ; le jour où ça arrive, c'est le contenu qui prend la forme
du titre.

---

## 21. 🕰️ LE DÉFAUT DORMANT QU'UNE NOUVELLE FONCTIONNALITÉ RÉVEILLE *(27/08/2026, ft-v1032)*

**Le mécanisme.** Un défaut existe depuis des mois dans du code que personne ne touche. Il ne se
voit pas — non pas parce qu'il est subtil, mais parce que **la condition qui le rend visible
n'existe pas encore**. Une fonctionnalité sans rapport crée cette condition, et le défaut apparaît
le jour de sa livraison. On l'attribue alors au dernier changement, qui n'y est pour rien.

**Le cas réel.** La barre « Séance » (`#log-hdr`) est en `rgba(12,13,17,.55)` + `blur(12px)` depuis
au moins le 29/07. À `.55`, elle laisse **lire** le contenu qui défile dessous. Personne ne l'avait
jamais vu, et la mesure dit pourquoi :

| | écran Séance **vide**, hauteur défilable |
|---|---|
| avant ft-v1026 | **0 px** |
| après (5 cartes de types) | **224 px** |

*Le CSS n'a pas bougé d'un caractère.* Ce sont les cartes qui ont rendu l'écran assez long pour
que quelque chose puisse passer sous la barre. Trouvé sur une **vidéo de production**, pas en
relisant le code — et confirmé dans Chromium, ce qui a écarté la piste « bizarrerie iOS ».

**⚠️ Et c'est la 3ᵉ fois en deux jours** : le gras de `.sw-feat` dormait jusqu'à ce qu'une
description contienne du gras (§20) ; le chrono négatif de ft-v851 n'a jamais tourné faute
d'appelant. *Un défaut invisible n'est pas un défaut absent : il attend son premier cas.*

### 🔎 Comment la reconnaître
- Un défaut qui apparaît juste après une livraison **qui ne touche pas le fichier concerné**.
- Le réflexe qui trompe : « c'est forcément ma dernière modif ». Souvent non — elle a seulement
  **créé la condition**.
- La question qui tranche en une commande : *`git log -S` sur la ligne fautive.* Si elle n'a pas
  bougé, le défaut est ancien et c'est **l'exposition** qui est neuve.

### 🛡️ Ce qui protège
- **Dater la ligne fautive avant d'accuser sa propre livraison.** Ça change ce qu'on écrit dans le
  journal, et ça évite de « corriger » au mauvais endroit.
- Mesurer **la condition**, pas seulement le symptôme (ici : la hauteur défilable avant/après).
- Et le témoin doit épingler **la condition aussi** — sans elle, il serait vert en ne mesurant
  rien le jour où l'écran cesserait de défiler.

### ⭐ Le réflexe
Quand on ajoute du contenu à un écran, se demander : *qu'est-ce que cet écran ne faisait pas avant,
et qui devient possible maintenant ?* Défiler, déborder, se replier, tenir sur deux lignes — chacun
de ces « maintenant » peut réveiller quelque chose d'endormi ailleurs.

---

## 21. 📸 LA MESURE QUI NE SE REPRODUIT PAS ELLE-MÊME *(27/08/2026, ft-v1037)*

### Ce qui s'est passé
Pour prouver qu'un changement de graisses n'avait **aucun effet visuel**, j'ai comparé des
captures d'écran avant/après sur 9 écrans. Résultat : **les 9 avaient changé.** J'étais à un
cheveu d'annoncer *« mon hypothèse est fausse, le correctif se voit »*.

### Ce qui l'a sauvé
Une question avant de conclure : *ma mesure sait-elle se reproduire ?* J'ai relancé la capture
**sur le même code**, deux fois de suite. **Les 9 écrans différaient aussi.**

👉 Le « tout a changé » ne disait rien de mon correctif — il disait que **mes captures étaient
instables** (horloges, animations, contenus datés). *Un contrôle qui varie tout seul ne compare
rien : il fabrique du bruit qu'on prend pour un signal.*

### ⭐ Ce qui l'a remplacé
Une mesure **déterministe** : pour chacun des **11 915 éléments de texte** des 9 écrans, la
famille et la graisse **effective** (celle après plafonnement par le fichier de police). Résultat
lisible : **1 182 graisses demandées changent · 0 graisse effective change.**
Et le contrôle négatif dans l'autre sens : une erreur injectée exprès est **détectée sur 9
écrans**. *La mesure sait rougir, donc son vert veut dire quelque chose.*

### ⭐ Le réflexe
Avant de conclure d'une comparaison avant/après : **la lancer deux fois sur le MÊME code**. Si les
deux passes diffèrent, la comparaison est inutilisable — quel que soit ce qu'elle raconte. C'est
le miroir du *contrôle circulaire* (§ plus haut) : là un vert ne pouvait pas rougir, ici un rouge
ne voulait rien dire.

---

## 22. 🔤 « JAMAIS CHARGÉ » N'EST PAS « JAMAIS UTILISÉ » *(27/08/2026, ft-v1037)*

### Ce qui s'est passé
Audit des polices. `document.fonts` annonçait **`Pacifico … unloaded`**. J'en ai conclu — et
**annoncé à Michel** — que la police ne servait à rien et qu'on pouvait la retirer.

**Faux.** Pacifico compose le prénom en doré de l'**écran d'anniversaire**. Elle n'était pas
chargée parce que **cet écran n'était pas affiché** : une police ne se télécharge qu'au moment où
un élément l'utilise vraiment.

### ⭐ Ce que ça généralise
Toute API qui décrit **l'état courant** du navigateur — polices chargées, images décodées, styles
appliqués, éléments visibles — décrit **ce qui s'est passé jusqu'ici**, pas ce dont l'app a
besoin. *Mesurer une absence sur un écran ne prouve rien sur les autres.*

### ⭐ Le réflexe
Pour prouver qu'une ressource est morte, **chercher ses usages dans le CODE** (`grep`), jamais
dans l'état d'exécution. C'est **R30** (un retrait se décide, il ne se constate pas) appliqué aux
ressources — et la 2ᵉ fois en deux jours que j'appelle « mort » quelque chose de vivant.

---

## 24. 🪟 UNE FIXTURE SANS PROFONDEUR NE TESTE PAS LE MÊME ÉCRAN *(30/08/2026, ft-v1060)*

**Le cas.** Le bouton « Exporter » de l'historique ne faisait rien chez Michel — *« ça clique bien
mais rien ne se passe »*. Mon test de la veille l'avait pourtant joué de bout en bout : bouton,
modale, fichier téléchargé, **0 erreur JS**.

**Pourquoi il passait.** Ma fixture contenait **une seule séance**. L'écran ne défilait donc pas.
Or le défaut était *une modale en `position:absolute` enfermée dans un conteneur qui défile* :
`inset:0` désigne alors le **haut du contenu**, pas la fenêtre — donc elle s'ouvre hors de l'écran
**dès qu'on a défilé**. Avec 30 séances, mesuré : la modale s'ouvre à **y = −3102**, soit
**2 800 px au-dessus**. Le test et l'utilisateur regardaient deux écrans différents.

**À quoi on la reconnaît.** Le test emprunte le bon chemin, dans le bon ordre, et il est vert —
mais **le VOLUME de données qu'il pose ne ressemble pas au réel**. Tout ce qui n'apparaît qu'au-delà
d'un certain seuil y échappe : défilement, pagination, listes tronquées, lenteur, mise en cache.

**Ce qui protège aujourd'hui.** Le témoin du bloc **CLXVI** pose **30 séances** et fait défiler
l'écran **à fond** avant de mesurer — et un second témoin vérifie que le défilement a bien eu lieu
(`> 500 px`) : *sans lui, le premier serait vert en ne mesurant rien.*

👉 **Le réflexe.** Quand un test reproduit « le chemin heureux » et que la personne voit autre
chose, regarder d'abord **ce que la fixture n'a pas** — avant de chercher ce que le code fait mal.

**⭐⭐ CONFIRMÉ SUR LA VIDÉO DE MICHEL — ET JE SUIS RETOMBÉ DANS LE PIÈGE EN LE VÉRIFIANT.**
Sa vidéo montre le bouton qui s'allume à chaque tap et **rien d'autre** : ni modale, ni message.
J'ai alors mesuré à sa position de défilement… **avec une fixture de 8 séances**. Résultat : la
modale était visible, donc *« mon hypothèse est fausse »*. ⛔ **Faux.** Avec 8 séances, les deux
cartes du haut de l'écran Progrès ne s'affichent pas — l'écran est donc **plus court**, et le
défilement nécessaire pour atteindre le bouton était de **473 px**, sous le seuil.
👉 Refait avec **38 séances sur 78 jours** (son profil réel, les deux cartes rendues) : pour amener
le bouton là où il est sur sa vidéo, il faut **905 px** de défilement — au-dessus du seuil de
**742 px**. La modale sort alors à **y = −365 → −61** : `visible:false`. *Après correctif :
540 → 844.*
⚠️ **La leçon se replique donc sur elle-même** : j'ai failli abandonner le bon diagnostic parce que
ma fixture de vérification manquait, elle aussi, de profondeur. **Le seuil n'est pas « ça défile »,
c'est « ça défile AUTANT QUE CHEZ LA PERSONNE ».**

⚠️ **Et c'est la famille MIROIR du « contrôle circulaire » (§ plus haut)** : là-bas le vert ne
pouvait pas rougir ; ici le vert est **sincère**, il porte simplement sur un écran qui n'est pas
celui de la personne. *Les deux coûtent le même prix — on cherche le défaut au mauvais endroit.*

## 23. 🔢 UN CHAMP QUI « REFUSE » UNE SAISIE PEUT EN FAIT LA MUTILER *(30/08/2026, ft-v1057)*

### Ce qui s'est passé
**Eline**, la fille de Michel, écrit dans la boîte à idées : *« impossible de mettre la virgule
pour les poids »*. Formulé comme un **refus** — un champ qui ne veut pas d'un caractère.

**La mesure dit autre chose, et c'est bien pire.** Dans un `<input type="number">`, taper
`62,5` ne rend pas une valeur vide : ça rend **`"625"`**. Le navigateur **jette la virgule et
garde les chiffres**. Mesuré contre le code d'alors, sur le champ le plus utilisé de l'app :

| | Ce qui arrive |
|---|---|
| Ce qu'elle tape | `62,5` |
| Ce que le champ affiche | **625** |
| Ce qui est enregistré | **625 kg** |
| Le 1RM calculé | **776 kg** |

Et l'autre moitié du défaut, ailleurs : `parseFloat('62,5')` rend **62**. La moitié du kilo
disparaît sans un mot.

### ⭐⭐ Ce que ça généralise, et c'est la vraie leçon
***Le mode d'échec dangereux n'est pas « la saisie est refusée », c'est « la saisie devient un
autre nombre, parfaitement crédible ».*** Un refus se voit : la personne recommence. Un **625**
posé à la place d'un **62,5** ne se voit pas — il part dans les records, dans la courbe de
progression, dans le contexte de Milo, et il y **reste**.

⚠️ **Et le mot de la personne décrit le SYMPTÔME, jamais la cause.** Eline a dit « impossible ».
Si on s'était arrêté là, on aurait cherché pourquoi le clavier ne propose pas la virgule — et on
serait passé à côté des séances déjà fausses. *Un retour utilisateur est un point de départ à
mesurer, pas un diagnostic à appliquer.*

### ⚠️⚠️ La nuance qui a failli manquer : DEUX MOTEURS, DEUX ÉCHECS DIFFÉRENTS
J'avais écrit ci-dessus « la série enregistre 625 kg » sans dire **où c'était mesuré**. Michel a
corrigé le tir en une phrase : *« moi je mets aussi des virgules »* — et chez lui, sur iPhone,
**ça marche**. Remesuré :

| Moteur | Ce qu'il fait d'un `62,5` tapé dans un `type="number"` |
|---|---|
| **Chromium** (mesuré ici, en `en-US` **et** en `fr-FR` — la locale n'y change rien) | la virgule est **jetée** → `"625"` |
| **WebKit / Safari iOS** (rapporté par Michel) | la virgule est **acceptée et convertie** → ça marche |
| Le cas d'Eline | **refus** — elle ne peut pas la saisir du tout |

⛔ **Donc « tous les historiques sont pourris » serait FAUX.** Le `×10` demande un moteur qui jette
la virgule ; sur les iPhone de l'équipe, le pire cas est un **arrondi** (12 au lieu de 12,5).
⚠️ **Et ce qui reste inexpliqué est écrit plutôt que comblé** : on ne sait pas *pourquoi* le champ
refuse chez Eline alors qu'il accepte chez son père. Appareil, version, réglage de région — sans
son navigateur sous la main, toute réponse serait une invention (**R29**).

### ⭐⭐ Ce que cette nuance apprend, et c'est le vrai enseignement
***Un contrôle de saisie natif n'a pas UN comportement, il en a autant que de moteurs.*** Mesurer
dans un seul navigateur donne un résultat vrai **et non généralisable** — et une phrase écrite
sans dire *où* elle a été mesurée devient un fait faux dès qu'on la relit ailleurs.
👉 **C'est aussi l'argument le plus fort pour le correctif** : `type="text"` + un lecteur unique
donnent le **même** comportement partout, au lieu de trois comportements qu'on découvre un par un
au fil des retours.

### 🔎 Comment la reconnaître
- Un contrôle de saisie **natif** (`type="number"`, `maxlength`, `pattern`, un `min`/`max`) :
  il ne rend pas la main à la personne, il **transforme** ce qu'elle a écrit.
- Un écart de **facteur 10** (ou un arrondi vers le bas) dans une donnée saisie à la main.
- Un retour qui dit *« impossible de… »* : commencer par **taper vraiment au clavier** dans un
  navigateur, jamais par poser `.value` à la main — une affectation directe **ne reproduit pas**
  le filtrage à la frappe, donc elle montre un écran sain sur un code cassé.

### 🛡️ Ce qui protège aujourd'hui
- **Un seul lecteur de nombre tapé**, `numFR` (R2) : 22 champs décimaux qui liraient chacun leur
  nombre à leur façon, et le 23ᵉ oublierait la virgule.
- Les champs décimaux sont en `type="text"` + `inputmode="decimal"` : **le pavé chiffré du
  téléphone reste**, la virgule devient tapable. *Corriger un bug en supprimant le clavier
  numérique aurait été un deuxième bug.*
- **Un témoin qui protège le futur** (bloc CLXIII) : il refuse qu'un champ `inputmode="decimal"`
  soit en `type="number"`. Le 23ᵉ champ ne pourra plus revenir en arrière en silence.

### ⭐ Le réflexe
Devant un retour de saisie : **reproduire à la frappe, et regarder ce qui est ENREGISTRÉ**, pas
ce qui est affiché. La question n'est pas *« est-ce que ça passe ? »* mais *« qu'est-ce qui est
gardé quand ça ne passe pas ? »*
⚠️ **Famille voisine** : *« le correctif posé d'un seul côté »* — ici, l'app savait lire une
virgule à **dix endroits**, mais uniquement pour du texte venu d'AILLEURS (une phrase libre, un
rapport de balance photographié, une réponse de Milo). **Jamais pour ce que la personne TAPE.**

---

## 25. 🩸 LA FUSION QUI EFFACE LE BLOC DE L'AUTRE — *et qui reprend son NUMÉRO* **(30/08/2026, ft-v1065)**

### 🔎 À quoi on la reconnaît
Un **total de tests qui BAISSE** pendant qu'on annonce des tests en plus. C'est le seul signe, et
il tient dans le message de commit qu'on vient d'écrire soi-même.

### 📉 Le cas
En livrant **ft-v1065**, j'ai résolu un conflit de `tests/parcours/runner.js` en gardant mon côté :
**`-140` lignes**, et **deux blocs entiers de session-A effacés** — leur **CLXX** (« j'ai 2 fois la
même prot », 8 témoins) et leur **CLXXI** (« le choix d'unité dans Modifier l'aliment », 9 témoins).
**17 témoins disparus d'un coup.**

⛔⛔ **Et le code mesuré, lui, était intact.** `_afSetUnite` et `ef-qty-row` sont toujours dans
`app.js`, les deux écrans marchent. *Seuls les témoins qui les protègent avaient disparu* — donc
rien ne casse, rien ne rougit, et la prochaine régression sur ces deux écrans serait passée sans
un bruit. **C'est la panne la plus silencieuse du catalogue : elle ne se manifeste que le jour où
elle aurait dû servir.**

⚠️⚠️ **CE QUI L'A RENDUE INVISIBLE EST PIRE QUE L'EFFACEMENT : MON BLOC A REPRIS LEUR NUMÉRO.**
Le fichier portait toujours un `BLOC CLXX` — avec **mon** titre. Chercher « est-ce que CLXX existe
encore ? » répondait **oui**. 👉 ***Un trou recouvert par quelque chose du même nom ne se compte
pas : il faut compter les TÉMOINS, pas les numéros.***

### ⭐⭐ Le signal était là, et je l'ai écrit sans le lire
L'arbre d'avant portait **1949** témoins. J'ai livré **1939** en annonçant *« +4 »*.
👉 ***Un total qui descend pendant qu'on ajoute des tests est un aveu.*** Le même motif exactement
que le `-1793` du numstat de l'archive, le 04/08 — *lu par personne, découvert deux jours plus tard
par hasard*. **Deuxième fois, autre fichier.**

### 🛡️ Ce qui protège aujourd'hui
- **CONTRÔLE 10 de `check_regles.py`** : il compte les `t(` de `runner.js` et **refuse toute
  baisse** face à la version précédente. Il tourne à **chaque** livraison parce qu'il est
  **statique** — le total réel demande 10 min de Playwright, et *un contrôle qu'on saute parce
  qu'il est lent ne protège personne*.
- **Franchissable exprès** : un retrait de témoin est parfois juste (**R30**). Il faut alors
  l'écrire — `TEMOINS-RETIRES: <raison>` dans le message de commit. *On ne peut plus effacer par
  accident, on peut seulement décider.*
- **Éprouvé dans les deux sens** : 25 témoins retirés → **rouge**, avec le compte nommé ; le même
  fichier avec la déclaration → **vert**, `↓ −8, retrait déclaré`.

### ⭐ Le réflexe
Après **toute** fusion du runner : ne pas se contenter de `node --check` (il dit que le fichier
**démarre**, jamais qu'il est **entier**). Lire le **numstat** — et si le côté supprimé dépasse une
dizaine de lignes, faire `git show HEAD -- tests/parcours/runner.js | grep '^-.*BLOC'`.
⚠️ **Et ne jamais reprendre le numéro d'un bloc qu'on vient de voir dans le conflit** : c'est le
signe qu'il existait, pas qu'il est libre.

---

## 26. 🔴 UN ÉTAT QUI SURVIT À SON GESTE — *et cette fois il abîme les données* **(31/08/2026, ft-v1073)**

### 🔎 À quoi on la reconnaît
Une action fait **autre chose que ce qu'elle annonce**, et seulement *parfois*. Le geste est bon,
l'écran est bon — c'est ce qui reste **de la fois d'avant** qui décide.

### 💥 Le cas
Michel : *« je rajoute le rowing hammer… et en regardant de plus près je vois que mon tirage a été
remplacé par le rowing hammer »*.

Le sélecteur d'exercices garde un **mode** (`_exPickerMode`) et un **index** (`_replaceEi`), tous
deux remis à zéro par `closeExPicker()`. Mais `mod-ex` **n'était pas déclaré** dans
`_OVERLAY_CLOSERS` : fermé **en glissant, à côté ou par Échap**, on tombait sur le repli
(`classList.remove('open')`) et **`closeExPicker()` n'était jamais appelé**.
👉 Le mode restait `'replace'` **avec son index** — et l'ouverture suivante, faite pour
**AJOUTER**, ***renommait*** l'exercice mémorisé.

⛔⛔ **ET C'EST LA PREMIÈRE DE CETTE FAMILLE QUI TOUCHE AUX DONNÉES.** Son Tirage Poulie Haute est
devenu « Rowing Hammer Strength » **en gardant ses séries et sa consigne** — donc un 1RM fabriqué
de **81,9 kg** parti dans ses records, dans Sheets, et dans le débrief de Milo, qui a commenté
« le saut vers 66 kg était trop brutal » **sur le mauvais exercice**. *Le tirage n'existe plus
dans son historique.*

### ⭐⭐ Ce que la correction ajoute à R15
Déclarer la modale ferme **le chemin connu**. Ça ne suffisait pas : ***le défaut de fond n'est pas
la fermeture, c'est qu'un état pouvait SURVIVRE à son geste.***
👉 `openExPicker(mode)` **impose** désormais son mode (défaut `'workout'`) au lieu de l'hériter.
Un mode oublié par **n'importe quelle** voie retombe donc sur « ajouter », le geste sans
conséquence. *Quand un état se perd, il doit se perdre du bon côté.*
⛔ Et l'index part avec le mode : ils décrivent la **même intention**, ils vivent et meurent
ensemble (**R2**). *Un index d'exercice qui survit à son mode est une cible qui attend.*

### 🛡️ Ce qui protège aujourd'hui
- `'mod-ex':'closeExPicker'` dans `_OVERLAY_CLOSERS` (**R15**) ;
- le mode imposé à l'ouverture, l'index purgé avec lui ;
- **bloc CLXXVIII** : son cas rejoué à l'identique (ouvrir en « remplacer » → fermer **au doigt**
  → rouvrir pour ajouter), plus 2 non-régressions (le vrai remplacement garde les séries, les
  5 modes spéciaux restent atteignables). **Contrôle négatif** : l'ancien code rend
  `{"apresDoigt":"replace","idx":1}` et **2 exercices au lieu de 3**.

### ⭐ Le réflexe
Devant un état de module (`_mode`, `_index`, `_cible`) : se demander **par quelles portes on peut
sortir sans le remettre à zéro** — et surtout, **de quel côté il tombe quand on l'oublie**. Un
défaut sûr (« ajouter ») vaut mieux qu'un défaut destructeur (« remplacer »).
⚠️ **3ᵉ fois pour la famille R15** (ft-v466 point rouge, ft-v629 pop-up, celle-ci les données) :
à chaque fois, le chemin oublié était **le glisser du doigt**.

### 🔴🔴 4ᵉ FOIS — ET CETTE FOIS C'EST UN CAPTEUR **(01/09/2026, ft-v1091)**
Le scanner de code-barres : `closeBarcodeScanner()` est la **seule** chose qui coupe le flux
vidéo (`_bcReader.reset()` puis `stopStreams()`). `#ov-bc-scan` n'était déclaré **nulle part**
dans `_OVERLAY_CLOSERS`, et il n'a même pas de fermeture au clic sur le fond.
👉 ***Fermé en glissant : l'écran disparaît, la caméra continue de tourner*** — voyant vert
allumé sur iOS, batterie qui file, et **rien à l'écran pour le dire**.
⭐⭐ **Ce que la 4ᵉ occurrence ajoute à la famille** : les trois premières coûtaient un marqueur,
une pop-up, un exercice. Celle-ci laisse un **capteur** ouvert. *Le coût de cette famille n'est
pas borné par ce qu'on a déjà payé* — la prochaine porte oubliée peut donner sur autre chose.
⚠️ **Et l'overlay était FABRIQUÉ EN JS** (`openBarcodeScanner` le crée avec `className='overlay'`),
donc invisible à toute recherche d'`id=` dans `index.html`. *Un détecteur qui ne lit que le HTML
ne l'aurait jamais vu.*
⛔ **Deux jumelles cherchées dans la même passe** (**R8**) : `getUserMedia` n'a **qu'un seul**
utilisateur dans tout le dépôt (mesuré — donc pas d'autre caméra à fermer) ; et sur les **23**
overlays qui posent un état, **tous** le repositionnent à l'ouverture suivante — le correctif de
ft-v1073 tient partout ailleurs.

### 🧩 La variante « ce n'est pas un état, c'est une SAUVEGARDE » (même version)
Le check-in a **deux étapes** et seule la seconde appelait `persist()`. `mod-checkin` se ferme au
doigt et rien ne tourne à sa fermeture : la réponse *« comment as-tu dormi ? »* restait **en
mémoire**. ⚠️ **Et la perte était ALÉATOIRE** — `persist()` écrit tout `S`, donc n'importe quelle
action ultérieure la rattrapait. ***Parfois gardée, parfois perdue, sans que rien ne distingue les
deux cas*** : c'est pire qu'une perte franche, parce que ça ne se reproduit pas.
👉 **Le réflexe s'élargit** : devant un formulaire en plusieurs étapes, se demander non seulement
*« quel état survit ? »* mais ***« ce qui a déjà été répondu est-il écrit ? »***.

---

## 27. 🔤 DEUX COUCHES DE GUILLEMETS, UN SEUL ÉCHAPPEMENT **(31/08/2026, ft-v1074)**

### 🔎 À quoi on la reconnaît
Un bouton qui **ne fait rien**, et une `SyntaxError` bizarre — *`Unexpected token '}'`* ou
*`Unexpected end of input`* — alors qu'aucun `}` ne manque dans le code source.

### 💥 Le cas
`'onclick="f('+JSON.stringify(v)+')"'` rend `onclick="f("gene")"`.
👉 ***L'attribut se referme au 1ᵉʳ guillemet double.*** Le navigateur ne garde que
`f(`, l'enveloppe dans `function onclick(event){ … }` — et l'accolade fermante devient
« inattendue ». **C'est de là que vient le message, pas d'une accolade manquante.**

`JSON.stringify` échappe parfaitement pour **JavaScript**. Il ne sait rien de l'**HTML**, qui est
la couche du dessus. *Deux couches, deux échappements — en oublier un ne casse pas le texte, ça
casse le CODE.*

### ⛔ Pourquoi ça coûte cher : c'est SILENCIEUX du bon côté
Le bouton s'affiche, il se tape, il s'allume. Seul un bandeau d'erreur passe — et il ressemble à
n'importe quel pépin. **Michel a répondu 4 fois à « Pourquoi ce changement ? » ; ses 4 erreurs
horodatées SONT ses 4 appuis.** `S.exSwaps` est resté vide depuis le 28/08, donc la promesse
*« dis-moi pourquoi et Milo ne te le repropose plus »* n'a **jamais** tenu.

### ⭐⭐ Et deux bugs distincts n'en faisaient qu'un
Il a signalé *« l'image quand je veux changer d'exercice a un beug »* et *« le QCM ne marche
pas »* comme deux choses. C'était **la même ligne de faute** à deux endroits — le bouton photo
(`changeExImg`) casse dès que le nom contient un espace ou une parenthèse.
*Deux symptômes éloignés peuvent partager une cause : c'est le journal d'erreurs qui les a
réunis, pas le raisonnement.*

### 🛡️ Ce qui protège aujourd'hui
- **Un seul propriétaire**, `_argAttr` (**R2**) — 5 sites y passent, dont le seul qui était déjà
  correct. *Sans ça, le 6ᵉ site réinventera un 6ᵉ échappement.*
- **Le nom est explicite exprès** : `_argAttr` se lit « argument pour un attribut ». Un `_esc()`
  générique se serait fait employer là où il ne fallait pas.
- **Bloc CLXXIX** : le témoin va jusqu'au **vrai clic** et vérifie que la raison est
  **enregistrée** — lire l'attribut n'aurait prouvé qu'une chaîne bien formée, pas un bouton qui
  marche. Plus un témoin qui compte les **erreurs JS** de tout le parcours.

### ⭐ Le réflexe
**R8 d'abord, et il paie ici plus qu'ailleurs** : sur 5 occurrences du motif, **1 était déjà
juste**. *Le dépôt contenait la réponse ; personne n'était allé la chercher.* Devant un défaut
d'échappement, chercher immédiatement le même motif partout — et regarder si un endroit fait
déjà bien (**R13**).
⚠️ Et pour l'utilisateur : **un bandeau d'erreur générique est une piste, pas un diagnostic.** Le
journal d'erreurs (Profil → Admin) porte l'heure exacte — c'est lui qui a relié les appuis au
défaut.

---

## 28. ⏳ LE CLIENT ABANDONNE, LE SERVEUR CONTINUE **(31/08/2026, ft-v1077)**

### 🔎 À quoi on la reconnaît
Une opération marquée **échouée** côté téléphone — et pourtant **elle a eu lieu** côté serveur.
Le signe qui doit alerter : le message d'erreur parle de **temps** (*timeout*, *délai dépassé*,
*abort*), jamais de **refus**. Et le geste **se répète** : la personne réessaie, ça « rate »
encore, et à chaque fois quelque chose s'écrit pour de bon.

### 💥 Le cas
`syncSheets` coupe à 8 s avec un `AbortController`. Le message *« ❌ Sync : Timeout (8s) »*
s'affichait en rouge, la séance restait `synced:false`… mais l'abandon coupe **l'attente du
téléphone**, pas le script Google : **les lignes s'écrivaient quand même**. Chaque nouvel essai
re-collait donc la même séance dans l'onglet `Sessions`.

👉 ***Un délai dépassé n'est pas un échec — c'est une réponse qu'on n'a pas attendue.***
Les deux se ressemblent côté client ; ils n'ont **rien** à voir côté serveur.

### ⛔ Et la cause de la lenteur était une boucle d'écritures
`handleLogSession_` faisait **un `appendRow` par série** — un aller-retour complet vers le
classeur à chaque fois. Mesuré : **3 séries → 3 écritures · 25 → 25 · 60 → 60**. C'était le
**seul endroit de `Code.js` dont la durée grandit avec les données**, donc le seul capable de
dépasser un délai fixe. *Une lenteur qui dépend de la taille finit toujours par franchir le
seuil : la question n'est pas si, c'est quand.*

### 🛡️ Ce qui protège aujourd'hui
- **L'écriture en bloc** (`setValues`) : 1 séance = **1 écriture**, qu'elle fasse 3 ou 60 séries.
  La durée cesse de dépendre de la taille.
- **`_safeCell_` transforme une case absente en case vide** : l'écriture en bloc est plus stricte
  que `appendRow`, et une vieille ligne incomplète ne doit pas faire échouer **toute** la séance.
- **Le message dit la vérité** : un délai dépassé n'a plus ni croix ni rouge (*« ta séance est
  gardée, on réessaiera »*), mais une **vraie** erreur garde les siennes — un témoin interdit
  d'effacer la différence.
- **Bloc CLXXXII** : le témoin compte les **allers-retours** vers le classeur, pas les lignes.

### ⭐ Le réflexe
Devant un « échec » réseau, se demander **ce que le serveur a fait pendant ce temps-là** avant
d'annoncer une perte. Et pour la personne : **ne jamais écrire « ❌ » sur une chose qu'on n'a pas
constatée** — le local-first garantit que rien n'est perdu, le message doit le dire (**R29**).
⚠️ Corollaire : si l'opération n'est pas **idempotente**, un délai dépassé fabrique des doublons
en silence. Ici c'est un classeur de log, le coût est du bruit ; ailleurs, ce serait pire.

---

## 29. 🚧 LE GARDE-FOU CALIBRÉ SUR UN RATIO REFUSE LE CAS QU'IL VISE **(31/08/2026, ft-v1083)**

### 🔎 À quoi on la reconnaît
Un garde-fou qui **sonne prudent** — *« si ça touche plus de la moitié, on refuse »*, *« si l'écart
dépasse 50 %, on ignore »* — et qui n'a **jamais été mesuré sur le cas réel** qu'il est censé
encadrer. Le signe : le seuil a été choisi à l'écriture, pas tiré d'une donnée.

### 💥 Le cas
La route de nettoyage des doublons refusait de supprimer plus de **la moitié** des lignes d'une
personne : au-delà, on supposait un défaut de signature qui ratisserait tout le classeur.
👉 Or la séance de Michel était écrite **7 fois** : **6 lignes sur 7** étaient des doublons
parfaitement légitimes. ***Le garde-fou aurait refusé exactement le seul cas pour lequel la route
avait été écrite.***

*Un ratio ne distingue pas « je me trompe en grand » de « il y a vraiment beaucoup de doublons ».*
C'est la même grandeur dans les deux cas ; seule la **cause** diffère, et un pourcentage ne la voit
pas.

### ⛔ Pourquoi ça coûte cher : l'échec est POLI
Le refus n'est pas un plantage. Il s'affiche proprement, il a l'air raisonnable, et il dit même
pourquoi. La personne conclut que l'outil « a jugé que c'était trop risqué » — et **personne ne va
vérifier si le seuil avait raison**. Un garde-fou qui se trompe ne ressemble jamais à un bug : il
ressemble à de la prudence.

### 🛡️ Ce qui protège aujourd'hui
- **Le plafond est ABSOLU**, pas proportionnel : il n'attrape plus que l'échelle absurde.
- **La vraie protection n'est pas un seuil** : c'est l'**aperçu** (la personne voit le nombre avant
  de confirmer) et le fait qu'on ne supprime **jamais** la première occurrence d'une signature —
  **garanti par construction**.
- **Bloc CLXXXVIII, témoin ⑦** : une séance écrite **7 fois** (86 % de doublons) doit passer. Il
  porte le cas réel, pas un cas inventé — un ratio le fait rougir.

### ⭐ Le réflexe
Avant d'écrire un seuil, **le passer sur le cas réel qui a motivé le travail**. S'il le refuse, ce
n'est pas le cas qui est anormal, c'est le seuil.
⚠️ Et se demander ce que le seuil **prétend** distinguer : s'il est censé séparer deux *causes*
(un bug vs une situation extrême), un chiffre sur la *conséquence* ne le fera jamais. Chercher
alors la garantie **par construction** — ici : on ne touche jamais au premier exemplaire.

---

## 30. 🩹 LE CORRECTIF QUI RETIRE UNE PROTECTION SANS METTRE LA SIENNE **(01/09/2026, ft-v1088)**

> **Le cas** — Michel, capture du compte d'Eline : son Pec Deck affiche `10 reps × **null** kg` sur
> deux séries. Et sa lecture est la bonne : *« Eline avait mis des valeurs, et si je dis pas de
> bêtises c'est en mettant la virgule »*.

### 🔗 La chaîne, maillon par maillon (établie dans le code, pas déduite)
1. **ft-v1057** (30/08, *« la virgule décimale : 22 champs et un seul lecteur de nombre »*) fait
   passer le champ kg du détail de séance de `type="number"` à **`type="text"`**…
2. ⛔⛔ **…en laissant `+this.value`.** Or `type="number"` était **la seule chose qui protégeait ce
   champ** : le navigateur refusait la virgule, `.value` rendait `''`, donc `+'' = 0`.
3. À partir de là, `+'62,5'` = **`NaN`**.
4. `persist()` fait `JSON.stringify`, et **`JSON.stringify(NaN)` vaut `null`**.
5. Au rechargement, `value="${s.kg}"` écrit le mot **« null »** à l'écran.

### ⛔ À quoi on la reconnaît
- Un correctif **généralise** un changement (« tous les champs passent en texte », « on retire le
  `type=number` partout ») **sans que chaque site reçoive le remplacement**.
- Le symptôme apparaît **là où le correctif est passé**, pas là où il a manqué — donc on cherche
  la régression du mauvais côté.
- La valeur affichée est **un mot** (`null`, `undefined`, `NaN`) et non un nombre : c'est la
  signature d'une donnée **détruite à l'écriture**, pas d'un affichage raté.

### ⚠️ Pourquoi elle coûte plus cher qu'un oubli ordinaire
Un champ simplement **oublié** garde son ancien comportement — imparfait, mais stable. Ici le champ
a été **rendu pire qu'avant** : il était protégé par le navigateur, il ne l'est plus, et rien ne
l'a remplacé. ⛔ **Et la donnée est PERDUE, pas masquée** : Eline a tapé un poids, il n'existe plus.
On ne le devine pas à sa place (**R29**).
👉 *Le danger n'est pas dans ce que le correctif ajoute, il est dans ce qu'il ENLÈVE.*

### 🛡️ Ce qui protège aujourd'hui
- Le champ passe par **`numFR`** — ce que ft-v1057 aurait dû faire ici.
- Un champ vidé rend **`null`** (« je ne sais pas »), jamais `0` : *écrire 0 dirait qu'elle a
  poussé zéro, ce qui est faux*.
- **Bloc CXCIII, témoin de RÈGLE** : *aucun champ décimal en `type="text"` ne lit par
  `+this.value`*. Il ne protège pas le cas, il protège la paire — il rougira au prochain champ
  converti en texte dont on oubliera le lecteur de nombre. **Contrôle négatif fait** : remis dans
  l'état de ft-v1057, il **nomme le champ coupable**.

### ⭐ Le réflexe
Quand un correctif **retire un garde-fou** (une contrainte de navigateur, une validation, un type),
lister **tous** les sites qu'il touche et vérifier que **chacun** reçoit le remplacement. Un site
oublié n'est pas resté « comme avant » — il est devenu **plus fragile qu'avant**.
⚠️ Et se méfier des correctifs qui annoncent un **nombre** dans leur titre (« 22 champs ») : le
nombre dit ce qui a été traité, jamais ce qui a été **manqué**.

---

## 31. 🎯 LE TÉMOIN VISÉ SUR UNE FORME, PAS SUR SA GARANTIE **(01/09/2026, ft-v1092)**

> **Quatre fois en une semaine.** Ce n'est plus une coïncidence : c'est la façon dont un test
> écrit *correctement* devient faux tout seul.

### 🔁 Les quatre cas, et ils ne se ressemblent qu'à la fin
| version | ce que le témoin figeait | ce qui l'a fait rougir |
|---|---|---|
| ft-v1085 | *« exactement 2 écritures »* du compteur du Gardien | il y en a **3**, la 3ᵉ écrit un bloc **séparé exprès** |
| ft-v1087 | *« 3 exercices recalculés »* | j'ai ajouté un **4ᵉ** cas à la fixture |
| ft-v1092 | l'**expression littérale** de la lecture du compte | la fonction a sorti son accesseur dans une variable |
| ft-v1092 | l'**expression littérale** de l'écriture du compte | la fonction écrit un objet allégé (`aEcrire`) |

### ⛔ À quoi on la reconnaît
- Le témoin rougit sur un changement **qui améliore le code** ou qui n'a rien à voir avec lui.
- Son libellé annonce une **garantie** (« un seul propriétaire », « tous les lecteurs
  décompressent ») mais son assertion contient un **nombre** ou une **chaîne recopiée du code**.
- ⚠️ **Le piège du diagnostic** : le premier réflexe est de croire à une régression, et de
  « réparer » du code sain. *Un témoin qui a tort coûte deux fois — le temps de le croire, puis
  le temps de ne pas le croire.*

### ⚠️ Pourquoi c'est dangereux et pas seulement agaçant
Un témoin qui rougit pour rien **finit désactivé** (**R19**) — et il emporte alors la vraie
garantie avec lui. ***Le risque n'est pas le faux rouge, c'est le vrai vert qu'on perdra après.***

### 🛡️ Ce qui protège aujourd'hui
- **On ne désarme pas un témoin, on le VISE.** Un compte exact devient un **plancher** (`>=`) ;
  une chaîne recopiée devient une **propriété mesurée** (*« toute lecture de cette clé passe par
  `_unpackUser_` »*, *« aucun autre écrivain de `analysees`/`total` »*).
- **Et on éprouve la nouvelle visée dans les DEUX sens** avant de la garder : casser la garantie
  doit le faire rougir. Fait à chaque fois — sinon on remplace un témoin trop strict par un
  témoin mort, ce qui est pire.

### ⭐ Le réflexe, en une question
Avant d'écrire l'assertion : **« si quelqu'un améliore ce code demain, mon témoin rougit-il ? »**
Si oui, il mesure la **forme**. La bonne question à poser au code n'est jamais *« ressembles-tu
encore à ça ? »* mais *« la propriété que je protège tient-elle toujours ? »*

---

## 32. 🔗 L'ALLER-RETOUR CASSÉ AU MILIEU — les deux bouts sont justes, le maillon central n'existe pas **(01/09/2026, ft-v1093)**

Une donnée de profil fait trois sauts : **l'app l'envoie** → **le serveur la range** → **l'app la
relit** à la restauration. Cette famille est le cas où **les deux extrémités sont parfaitement
écrites** et où **le maillon du milieu n'a jamais été posé**. Personne ne le voit, parce que chaque
bout, pris seul, a l'air correct — et parce que le symptôme n'apparaît **que le jour où on change
de téléphone**, c'est-à-dire une fois par an et jamais chez le développeur.

### 🔎 Les cas mesurés
- **`foodMode` / `fasting`** (ft-v1093). Envoyés depuis le 02/08 (`setup.js`), **attendus au
  retour** (`setup.js` les lit et recalcule `S.keto`) — et `grep body.foodMode Code.js` rend **0**
  sur 3 500 lignes. Aller-retour joué en vrai : keto + jeûne 16/8 partent, **reviennent vides**,
  et les glucides passent de **39 g à 432 g**.
- **`goalLog`** (ft-v1093). Cassé **deux fois** : le serveur ne l'écrivait nulle part, **et** la
  restauration le lisait dans `raw.profile` alors que la réponse le met à la **racine**. Réparer
  un seul des deux maillons n'aurait rien changé — et c'est la panne que **ft-v1010** disait
  explicitement avoir corrigée, commentaire à l'appui.
- **`nutritionPhase`** (ft-v1093), variante inoffensive mais parlante : la réponse annonçait une
  phase qui était en réalité une **constante** (`data.nutritionPhase` toujours `undefined` → le
  repli `'charge'`), pendant que la vraie valeur dormait dans `profile`, juste à côté.

### ⛔ À quoi on la reconnaît
- Un champ qui **part** dans le payload et qu'un lecteur **attend** au retour, sans que personne
  n'ait vérifié le **milieu**.
- Un commentaire qui **promet** la persistance (*« sans ça, changer de téléphone perdrait… »*) :
  il prouve l'intention, jamais le fait.
- Un champ classé **« transmis »** dans un fichier de suivi — le classement décrit ce qui atteint
  **Milo**, pas ce qui survit à une **restauration**. Ce ne sont pas les mêmes trajets.
- Une réponse serveur qui expose une clé qu'**aucune écriture** ne remplit : le repli (`|| ''`,
  `|| []`, `|| 'charge'`) rend alors une valeur **plausible**, ce qui est pire qu'une erreur.

### ⚠️ Pourquoi elle échappe à tout
Aucun test d'un seul côté ne peut la voir. Le frontend est **correct** : il envoie et il relit. Le
backend est **cohérent** : il ne connaît simplement pas le champ. Il n'y a **ni erreur, ni log, ni
écran rouge** — la personne retrouve juste un réglage à blanc, *ce qui ressemble à un compte neuf
et pas à une perte*. Et comme la donnée n'a jamais atteint le serveur, elle n'est **dans aucune
sauvegarde** : elle n'est pas récupérable, seulement re-saisissable.

### 🛡️ Ce qui protège aujourd'hui
Le bloc **CXCIX** de `tests/parcours/runner.js` joue l'**aller-retour complet** — le vrai `Code.js`
dans un bac à sable, `saveProfile` puis `loadProfile` — et exige que le champ **revienne**. Un
témoin de contrôle vérifie que des champs **voisins du même envoi** reviennent intacts : sans lui,
un « champ vide » serait vrai parce que **rien** n'a été sauvegardé.

### ⭐ Le réflexe
**Ne jamais conclure d'un seul côté.** Quand on ajoute un champ au profil, on écrit la table des
**trois colonnes** — *envoyé · rangé · relu* — et on la **mesure**, on ne la déduit pas. Et quand
on répare un maillon, on vérifie **l'autre** : ici, réparer le serveur seul aurait laissé `goalLog`
perdu, et réparer le lecteur seul aussi.

### 📏 CE QUI A ÉTÉ MESURÉ ET N'A RIEN RENDU — à lire avant de refaire la chasse

Le balayage complet du trajet a porté sur **106 champs de `S`**, dont **69 réellement envoyés**
(corps capturé en remplaçant `fetch`, aucune sortie réseau). Sur ces 69 : **3 cassés** (les trois
ci-dessus) et **66 qui bouclent**. Écrire ce vide coûte trois lignes et évite de tout refaire :

- **`cycle`, `programmes`, `exRestPref`, `exSwaps` sont SAINS.** Ils avaient été signalés comme
  suspects par un détecteur *statique* lors d'une passe précédente — **faux positifs**, corrigés
  par la mesure comportementale : ils font l'aller-retour et reviennent identiques. *Ne pas les
  « réparer ».*
- **`gardienStats` : absence VOLONTAIRE, pas un oubli.** Il monte bien au serveur et n'est pas
  relu à la restauration — c'est cohérent, le compteur est **par appareil** (la modale s'intitule
  « Gardien — ce téléphone ») et il n'existe côté cloud que pour l'agrégation admin. Le restaurer
  importerait sur un téléphone neuf un compteur de réponses qu'il n'a pas produites (**R30**).
- **`healthDaily` / `healthInbox` : retard d'un démarrage, pas une perte.** Ils arrivent par une
  autre route et `autoConnect` les réinjecte au lancement suivant.
- **37 champs ne partent pas du tout au cloud**, et aucun n'entre dans cette famille — plusieurs
  avec leur raison écrite (`coachConversations` reste local par confidentialité, `exPhotos` a été
  exclu parce qu'il saturait les 9 Mo).
- ⏭️ **Un seul point reste ouvert, et il est hors de cette famille** : `beginnerJourney` n'est
  **jamais envoyé** — il n'atteint donc même pas la première colonne. À instruire par une passe
  « champs qui ne partent jamais », pas conclu ici.

⚠️ **Limite écrite** : le serveur réel est injoignable depuis le conteneur (403). Toutes les
mesures serveur passent par le **vrai `Code.js`** dans un bac à sable — donc elles décrivent le
**code**, pas l'instance en production (**R18**).

### ⛔ Le piège dans le piège : la convention du voisin n'est pas forcément la bonne
`handleSaveProfile_` applique partout `_ps_` — *« le vide ne gagne jamais sur du rempli »*. Copier
cette ligne pour `foodMode` **aurait fabriqué un bug pire que celui qu'on répare** : ces réglages
se **décochent** (`S.foodMode=(S.foodMode===v?'':v)`), donc `''` est une **décision** de la
personne. Arrêter le cétogène ne serait jamais reparti, et un changement de téléphone l'aurait
fait **revenir**. *Un garde-fou juste pour un prénom est faux pour une case à cocher* — c'est la
famille **§30** prise à l'envers, et la seule façon de le voir est de mesurer **les deux sens**.

---

## 33. 🪟 DEUX ONGLETS, UN SEUL ÉTAT — le dernier qui écrit efface l'autre **(02/09/2026, ft-v1094)**

L'app garde tout dans un objet global `S` et le sauvegarde **en bloc** : `persist()` réécrit
chaque clé depuis la mémoire de l'onglet qui l'appelle. Tant qu'il n'y a qu'un onglet, c'est
juste. Dès qu'il y en a deux, **celui qui écrit en dernier impose sa vision périmée** et efface
tout ce que l'autre a fait depuis son chargement.

### ⚠️ Pourquoi ce n'est pas un cas d'école
C'est une **PWA**. L'icône de l'écran d'accueil et un onglet du navigateur sont deux pages
distinctes qui partagent le **même** stockage. Les avoir toutes les deux ouvertes n'est pas une
manipulation exotique : c'est le mode d'usage normal de quelqu'un qui a installé l'app *et* qui
ouvre parfois le lien.

### 🔎 Ce qui a été mesuré (par les vraies fonctions, deux pages du même contexte)
- l'onglet **B** termine une séance → **1 séance + 1 record** sur le disque ;
- l'onglet **A** règle son temps de repos — *le geste le plus banal qui soit* → `persist()` ;
- résultat : **0 séance, 0 record**. Le rechargement ne les ramène pas.
- Même chose pour une **pesée** notée dans un onglet : effacée par la série validée dans l'autre.

### ⛔ À quoi on la reconnaît
- Un état global sauvegardé **en bloc** (`setItem` de tout l'objet) plutôt que par delta.
- **Aucun** écouteur `storage`, aucun `BroadcastChannel` : l'app ne sait pas qu'elle existe
  ailleurs. C'était le cas ici — vérifié, zéro occurrence dans tout le dépôt.
- Le symptôme est **silencieux et différé** : rien ne plante, aucune erreur ; la donnée est
  simplement absente la fois d'après, et on croit ne l'avoir jamais saisie.

### 🛡️ Ce qui protège aujourd'hui
Le navigateur signale lui-même l'écriture des autres onglets : l'événement `storage` ne se
déclenche **que** dans les autres pages. Quand il est reçu, le `persist()` suivant prend
l'**union** des collections datées au lieu de remplacer. Bloc **CCI** de `tests/parcours`.

### ⭐ Le réflexe, et la propriété qui rend le correctif sûr
**Ne jamais toucher à `persist()` pour tout le monde afin de réparer un cas.** Le drapeau reste
faux tant qu'aucun autre onglet n'a écrit : dans 99,9 % des ouvertures, la fonction est
identique au caractère près. Deux témoins l'épinglent — dont celui qui vérifie qu'une
**suppression volontaire** reste possible, sinon on aurait échangé un bug contre un autre.
⚠️ **Limite écrite** : si on supprime une entrée pendant qu'un autre onglet écrit, la fusion
peut la faire revenir. On échange une suppression rare et refaisable contre une séance perdue
pour toujours — et le sens de l'échange est le bon (**R29** : le coût de l'erreur décide).

### 📏 Ce qui a été cherché dans la même passe et n'a RIEN rendu
Écrire le vide évite de refaire la chasse : **hors ligne**, une séance terminée sans réseau est
bien sur le disque, mise en file, et les 5 écrans rendent (0 erreur JS) · les **8 dates rares**
(1ᵉʳ janvier, 31 décembre, 1ᵉʳ du mois, lundi, 29 février, changement d'heure, minuit) ne
cassent rien · et les **« seuils écrits deux fois »** étaient tous des nombres égaux **par
hasard** — 180 secondes contre 180 minutes, 120 kg contre 120 cm. *Un détecteur de nombres
identiques a une précision quasi nulle : l'égalité numérique n'est presque jamais une parenté.*
