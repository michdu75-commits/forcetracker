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
| 12 | **Les erreurs de MÉTHODE** (mesure fausse) | ≥ 7 | — *le plus dangereux, voir §12* |
| 13 | **Le NOM comme clé primaire** | *racine de 6 défauts* | identifiant stable (ft-v735, **étape 1/3**) |
| 14 | **Mesurer au lieu de supprimer** | 1 (toute la journée du 02/08) | la question des 3 réponses, voir §14 |

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
- **Chercher un symptôme là où il n'y en a pas** (ft-v727) : je voulais tailler dans les consignes
  de Milo parce qu'elles occupaient 78 % du contexte. Michel : *« tu me fais flipper là, parce que
  franchement Milo il est au top »*. Rien n'était cassé. **« Ça marche » est une raison suffisante
  pour ne pas y toucher.**

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

## 🧭 Les 9 réflexes qui sortent de tout ça

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

---

*Dernière mise à jour : 02/08/2026 (soir, après ft-v735). À compléter à chaque nouveau bug — symptôme, cause, famille,
et ce qui le protège désormais.*
