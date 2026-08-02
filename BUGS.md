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
| 1 | **Le premier match gagnant** | ≥ 12 | `tests/muscles/` + `tests/croises/` ① |
| 2 | **L'info n'atteint jamais la donnée** | 11 | `tests/donnees/` (garde-fou R4a) |
| 3 | **Le temps et les fuseaux horaires** | ≥ 6 | `tests/dates/` |
| 4 | **Le déploiement silencieux** | 3 | carte 🩺 Santé du système (ft-v717) |
| 5 | **La panne muette côté serveur** | 2 | sondes `storeHealth` / `mailFails` |
| 6 | **Les seuils en marche d'escalier** | 3 | `tests/calculs/` (balayages continus) |
| 7 | **Deux sources qui se contredisent** | 14 | `tests/croises/` (les 6 diagonales) |
| 8 | **La promesse écrite et fausse** | 2 | tests qui relisent les textes d'aide |
| 9 | **Le code orphelin** | 2 | règles R23 / R30 |
| 10 | **Le marqueur non posé** | 2 | règle R15 |
| 11 | **Le comportement copié hors contexte** | 2 | règle R14 |
| 12 | **Les erreurs de MÉTHODE** (mesure fausse) | ≥ 5 | — *le plus dangereux, voir §12* |

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

### 🔎 Comment le reconnaître
- un exercice sort dans un groupe musculaire qui n'a rien à voir ;
- **ou** — beaucoup plus discret — une règle de la liste ne se déclenche **jamais**.

### 🛡️ Ce qui protège
`tests/croises/` croisement ① : **aucune règle de classement ne doit être morte**. C'est ce test
qui a révélé que les oiseaux recevaient le mauvais muscle depuis toujours.

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
- **Chercher un symptôme là où il n'y en a pas** (ft-v727) : je voulais tailler dans les consignes
  de Milo parce qu'elles occupaient 78 % du contexte. Michel : *« tu me fais flipper là, parce que
  franchement Milo il est au top »*. Rien n'était cassé. **« Ça marche » est une raison suffisante
  pour ne pas y toucher.**

---

## 🧭 Les 6 réflexes qui sortent de tout ça

1. **Avant de dire qu'une chose manque** → la chercher dans le code et dans `docs/INVENTAIRE.md`.
2. **Avant de « réparer » du code orphelin** → chercher la décision. Sinon, demander.
3. **Quand une réponse est fausse sur un fait** → vérifier qu'on a bien *donné* le fait, avant de
   toucher au prompt.
4. **Quand on ajoute une règle précise** → vérifier qu'aucune règle plus large ne la précède, et
   qu'elle se déclenche vraiment.
5. **Quand on trouve un oubli** → chercher ses jumeaux dans le même bloc. Ils sont rarement seuls.
6. **Quand un contrôle négatif ne rougit pas** → c'est le test qui est cassé, pas le code qui est bon.

---

*Dernière mise à jour : 02/08/2026. À compléter à chaque nouveau bug — symptôme, cause, famille,
et ce qui le protège désormais.*
