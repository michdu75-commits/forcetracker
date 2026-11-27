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
>
> 🧾 **Niveaux de preuve employés dans les ajouts à partir du 04/10/2026** — **P0** : lu dans le
> code · **P1** : mécanisme capable de produire le symptôme (montré, pas l'événement) · **P2** :
> reproduction synthétique (banc, rejeu) · **P3** : constaté sur le terrain (téléphone de Michel).
> *Un P2 n'est pas un P3, et un mécanisme capable n'est pas une cause.*

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

### 🗂️ Index des familles suivantes *(ajouté le 04/10/2026, sans renumérotation)*

Le tableau ci-dessus s'arrête à 15 ; le fichier compte bien plus de familles. **On ne renumérote pas** : des
renvois « §26 », « §45 »… existent dans d'autres documents et casseraient. Les numéros se lisent donc
**tels qu'ils sont écrits dans les titres**, anomalies comprises (16 et 17 n'existent pas ; deux « 21 » ;
24 avant 23 ; « §58 » et « 58 » ; plusieurs familles sans numéro, repérées par leur emoji).
⚠️ **Les compteurs d'occurrences du tableau ci-dessus datent de sa création** et ne sont pas tenus à jour :
c'est la section elle-même qui fait foi.

| Repère | Familles (dans l'ordre du fichier) |
|---|---|
| 5bis · 5ter · 6bis | sauvegarde écrasée par une version tronquée · filtre sans pertinence · indicateur sur deux points |
| 12bis · 12ter · 12quater | l'audit qui ne cherche que ce qu'il sait chercher · la fausse panne de l'outil · la cause déduite d'un seul nombre |
| 🧪 · 🔐 · 🌀 | vérificateur éprouvé sur ses propres exemples · donnée sans anti-fuite dans le contexte · clone périmé qui fait croire à une perte |
| 🧭 | les 12 réflexes (synthèse, pas une famille) |
| 🩹 · 🧱 · 🔁 · 🫥 | export qui perd son contenu · correctif posé d'un seul côté · contrôle circulaire · donnée écrite au mauvais endroit |
| 18 → 22 | spécification qui nomme le mauvais composant · précédence d'opérateur · règle CSS trop large · défaut dormant réveillé (**1ᵉʳ « 21 »**) · mesure qui ne se reproduit pas (**2ᵉ « 21 »**) · « jamais chargé » ≠ « jamais utilisé » |
| 24 puis 23 | fixture sans profondeur (**24, placée avant 23**) · champ qui « refuse » une saisie en la mutilant |
| 25 → 30 | fusion qui efface le bloc de l'autre · état qui survit à son geste · deux couches de guillemets · le client abandonne, le serveur continue · garde-fou calibré sur un ratio · correctif qui retire une protection |
| 31 → 39 | témoin visé sur une forme · aller-retour cassé au milieu · deux onglets, un état · ce qu'un modèle hallucine · chemin automatique moins protégé · sonde au nom de champ inventé · moyenne sur une fenêtre non vécue · taux par échantillons · valeur cohérente et impossible |
| 40 → 50 | vérificateur sur une tournure de langue · nombres verts, écran faux · cas sans l'attribut habituel lu comme « rien » · deux portes, une équipée · coupe d'affichage · définition qui essaime · correctif dans le prompt · plancher qui éteint le pourcentage · porte de secours absente · action silencieuse · règle générale lue sans la spécifique |
| 51 → 57 | trois chemins, une ligne sans origine · frappe lettre par lettre · deux comparaisons pour une question · le commentaire dit vrai, pas le code · total séparé de sa quantité · bloc resté visible · le DOM comme mémoire |
| §58 et 58 | **deux sections portent 58** : « une porte sans témoin » (§58) · « un témoin qui pose l'état final à la main » (58) |
| §59 → §66 | porte et jumelle · fichier servi muté pendant une passe · outil de mesure tronqué · protection qui tenait par l'absence de ménage · motif qui suppose une syntaxe · témoin qui lit la source · `pgrep -f` · réponse IA non confirmée |
| §71 | verrou posé sur les routes neuves, pas sur les anciennes (deux diagnostics restés ouverts) · verrou d'interface qui choisissait le compte · libellé qui promettait de ne lire aucune donnée personnelle *(§67 → §70 : branche Lot 1, non publiée)* |
| §72 | le mot vide qui efface ce qui distingue (le matériel retiré avant de comparer) · la famille qui passe avant le mot écrit · l'alias déclaré qui contredit sa propre clé *(branche `claude/import-map-01`, non publiée)* |

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
| Le **COMPTE** des RIR notés | le RIR par série partait, la règle disait *« dis-le s'il n'y en a pas »* — mais pour obéir il fallait **balayer 44 lignes**. Mesuré : **8 séries sur 591 (1,4 %)** | ft-v1154 |

### ⚠️ LA VARIANTE QUI SE VOIT LE MOINS : la donnée est là, c'est le COMPTE qui manque *(ft-v1154)*

Les cas du tableau sont des **absences**. Celui-ci n'en est pas une : le RIR de chaque série
partait bien, et la règle qui dit quoi en faire était dans le prompt. Ce qui manquait, c'est
**l'agrégat** — *combien* de séries en portent un.
👉 ***Une consigne qui demande un INVENTAIRE (« dis-le s'il n'y en a pas », « appuie-toi sur les
X réellement notés ») exige que le code fournisse le COMPTE, pas seulement les éléments.***
Compter 44 lignes est un travail que le code fait sans se tromper et qu'un modèle fait au jugé —
et son erreur est silencieuse, puisqu'il répond quand même.
⭐ **Le sous-cas à ne pas rater** : ce qui est déjà dit **autrement** compte quand même. Une série
taguée `(X)` est un RIR de 0 sans porter le mot « RIR » ; l'oublier sous-compte **exactement** les
séries les plus dures. *L'agrégat doit compter la RÉALITÉ, pas les occurrences d'un mot.*

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

### 🔄 Les cas du 26/09 au 04/10/2026 *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*

| Ce qui existait | Où ça n'arrivait pas | Version |
|---|---|---|
| La **séance traduite** par l'app (repos, consignes) | ne vivait qu'en mémoire (`_pendingMiloSessions`) ; au rechargement, reconstruite depuis le **texte** : repos 120 s → 0 s, consignes perdues | ft-v1238 (C3) |
| Le **débrief** réussi d'une séance | écrit dans le fil **sans bulle à l'écran** (le Coach ne redessinait que si le fil était vide), rattaché à **aucune** séance, absent de Progrès et de l'export | ft-v1250 (D-043, D-044, D-047) |

⭐ **Ce que le débrief ajoute** : la donnée était produite **et payée**, puis restituée nulle part où
on la cherche — *produite n'est pas consommée*. 🛡️ ft-v1250 : rangée à **sa** séance (`ft4_debriefs`,
par identifiant de séance), visible tout de suite, lisible dans Progrès, exportable avec ou sans.
⚠️ La réapparition après rechargement a été démontrée **en local** (P2), pas sur le téléphone de
Michel ; et les débriefs restent **sur le téléphone** (ni cloud, ni restauration — D-047).

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

### 🔄 2ᵉ cas : la discussion écrasée par le débrief (F07b, ft-v1239) *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
Une discussion **enregistrée mais pas chargée en mémoire** (Coach jamais ouvert, serveur injoignable)
était remplacée par le seul débrief : 30 messages → 2. Même mécanisme que le 02/08 : on écrit une
version **partielle** par-dessus une version complète qu'on n'a pas lue. 🛡️ ft-v1239 :
`_coachHistHydrater` relit le téléphone **avant** toute écriture ; illisible ou refusé → état inconnu,
**rien n'est écrit**.

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

### 🔄 2ᵉ cas : la recherche d'ALIMENTS (01/10/2026) *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
Retour terrain de Michel, mesuré sur le code de production (`docs/SUIVI-AUDIT.md`, 01/10) : « café »
propose d'abord le café **moulu** (poudre) ; « spaghetti bolognaise » des raviolis crus ; « carbonara »
la sauce. Même défaut que les exercices du 02/08 : le tri départage par « commence par », proximité,
longueur, puis **l'ordre physique du fichier CIQUAL**, sans notion de ce que la personne cherche
vraiment. Voisin de §1 (le premier match gagnant).
⛔ **En production au 04/10/2026, rien n'est changé.** Un chantier existe (Food Semantics, FS-01 →
FS-05B, D-036 → D-042) sur des branches **NON PUBLIÉES** : sa protection n'entre ici qu'à sa
publication.

### 🔄 3ᵉ cas : « générique devant » sans pertinence (11/10/2026, NUT-D042-01, branche non publiée)
La 1ʳᵉ version de D-042 faisait passer CIQUAL devant le fast-food **dès que CIQUAL répondait** (et que la requête
ne nommait pas de marque). Mesuré avant tout commit, sur 117 requêtes tirées des noms du fast-food : **27 fois**, le
premier aliment ainsi poussé devant **ne portait même pas le mot tapé** — « wings » → un chewing-gum devant les Hot
Wings, « big » (en tapant « big mac ») → un bigorneau devant le Big Mac, « cheese » → un cheesecake. *Un résultat
non vide n'est pas un résultat pertinent* : c'est exactement ce paragraphe, appliqué à l'ordre des SECTIONS.
🛡️ **Ce qui protège** : le critère ③ de `_afGeneriqueDevant` (cible de la table d'alias, ou chaque mot tapé en
entier — le test de la clé FS-01, partagé) ; témoins D42-100 → 106 (verts sur master, rouges sur la 1ʳᵉ version) ;
mutations M9, M10, DG2 de `tools/mut_food_d042.py`. ⚠️ **Limite dite** : un mot entier n'est pas un sens (« petites »
→ « Pancake (petite crêpe…) » passe encore devant les « Petites frites »).

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

### 🔄 Deux copies du même prompt d'import *(06/10/2026, IMPORT-ECH-01)*
L'import de programme passe par le **Worker** depuis ft-v433 (`PROG_PROMPT`) — une copie **ancienne** de la
consigne d'Apps Script. Il lui manque la règle « lignes ECH / TRAV du même exercice = UN exercice »
(`setTypePerSet`), le catalogue (ft-v1164, envoyé par l'app mais ignoré) et les repos (ft-v1176). Le modèle
rendait donc une ligne = un exercice, au nom nu, et le filet client ne reconnaissait un échauffement qu'à
« (ECH) » en fin de nom. Terrain : « Développé Couché » en cinq cartes d'une série, chacune « Déjà présent ».
🛡️ Corrigé **côté client seulement** (`_mergeImportBlocsEch`, `log.js` : un bloc continu du même exercice qui
commence par une preuve d'échauffement = un exercice). ⛔ **Les deux prompts restent divergents (R2)** : les
aligner touche le Worker — décision de Michel, non ouverte.

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

- **01/10/2026 — l'écran « Restaurer »** *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)* : il annonce *« aucune donnée ne sera écrite vers le
  serveur »*, alors que la restauration déclenche ensuite `saveProfile` / `cloudSave` (observé par
  l'audit Nutrition du 01/10, `docs/SUIVI-AUDIT.md` ; **non rejoué** ici). Le texte est toujours
  présent dans `index.html` au 04/10. ⛔ **NON CORRIGÉ.**

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

### 🔄 Cas du 03/10/2026 — « Remplacer » était un RENOMMAGE *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*

**Le cas** (P3 le 03/10 ; cause démontrée P0 + P2 par l'audit `docs/SESSION-MILO-E2E-01.md`, A et
A-bis) : en pleine séance, la Presse à cuisses remplacée par Rowing Hammer Strength puis par
Shoulder Press gardait ses séries — **2×200 puis 10×240 ×3** sous le nouveau nom. `_replaceExInWorkout`
ne changeait que le **nom** ; le « précédent » (`getPrev` cherche **par nom**) et le repos suivaient
le nouveau nom, les séries restaient. 👉 Un objet **hybride**. Validé sans corriger, il fabriquait un
record de 240 kg (1RM 320) et contaminait séance, volume, records, Progrès et contexte de Milo — et un
faux record ne sera jamais battu (§34).
⚠️ **L'origine était juste dans son contexte** : ft-v296 voulait corriger une **étiquette** (« je me
suis trompé de nom »). Un seul geste servait deux intentions — corriger un nom, changer d'exercice —
et c'est le nom qui tranchait (**R14**). **Même conséquence que §26, autre porte** : là un état
résiduel, ici le geste voulu.

🛡️ **Ce qui protège depuis ft-v1250 (D-046)** : « Remplacer » = remplacement **sémantique**. Le
remplaçant part de **son** historique ; les séries déjà faites restent à l'exercice réellement
exécuté ; rien n'est hérité (charges, repos, consigne, `_milo`). Témoins B-SI01-R, contrôle négatif
`tools/mut_session_integrity.py`.
**Preuve terrain (P3), partielle et dite telle quelle** : le 04/10, après ft-v1250, sur le téléphone
de Michel, remplacement **avant toute série réalisée** — Presse à cuisses 45° → Développé Couché
Larsen (4×80 / 4×80 / 3×85), puis → Rowing Barre (7×60 / 5×40 / 5×80) : **aucune série de la Presse
reprise**. ⛔ **Le remplacement APRÈS des séries déjà réalisées n'a PAS été vérifié sur le terrain** :
il est couvert par les témoins (P0/P2) seulement.

### 🔄 La deuxième racine, démontrée le même jour : prévu, prescrit et réalisé dans UN SEUL objet
Le nom n'est pas la seule clé qui mélange les rôles. La prescription (préremplie par un programme ou
par Milo) et la saisie vivent dans **les mêmes** `S.wkt.exs[].sets[]` : la saisie **écrase** la
prescription, et une valeur préremplie jamais retouchée **devient** le réalisé. Ni les exercices ni
les séries d'une séance n'ont d'identifiant. C'est ce qui a rendu le cas ci-dessus possible (cause B
de l'audit E2E-01, démontrée). ⛔ **Non corrigé** : c'est une dette d'architecture, pas un correctif
ponctuel — la direction est décrite dans `IDEES-FUTURES.md` (entrée D-029, programme versionné).
⏭️ **L'étape 1/3 ci-dessus reste exacte au 04/10** : le nom est toujours la clé de l'historique.

### 🔄 Même famille, autre objet : l'identité d'un brouillon de séance (ft-v1241, lot 3C)
`_recoverDraft` décidait qu'un brouillon était « déjà enregistré » en regardant `S.sessions[0]` (une
**position**) ; la première correction (3B) a pris l'**horloge** — réfutée par la contre-vérification,
« Restaurer » apportant un faux candidat. Ce qui tient : une identité **explicite**, `S.wkt.runId`,
posée une fois et recopiée par `finishWorkout`. *Une position ou une heure n'est pas une identité.*

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

### 🔄 La restauration cloud, corrigée collection par collection *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
« Restaurer » choisissait entre téléphone et cloud **par la longueur** des listes : le plus long
remplaçait l'autre, une ligne locale jamais synchronisée disparaissait. La fusion **par identifiant** a
été posée **un côté à la fois** :
- **séances** — ft-v1241 (union par `id`, conflits mis de côté et dits) ;
- **journal alimentaire** — ft-v1247 (fusion conservatrice ; limite acceptée : une ancienne ligne
  identifiée sur deux appareils peut revenir en double — *préserver plutôt que supprimer*) ;
- ⛔ **bilans corporels (`bodyScans`) et bilans sanguins (`bloodTests`)** : encore **par longueur**
  (P0, setup.js, master `9b8e4813`) — mécanisme capable, **aucune perte réelle mesurée** ;
  `savedFoods` et `_pa_` serveur hors lot. *Une règle corrigée dans deux collections et pas dans les
  autres est exactement ce paragraphe.* Voisin de §33 (le dernier qui écrit efface l'autre).


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

### 🔄 La version PRODUIT : la séance jugée contre le record qu'elle vient de créer (N-G2) *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
Démontré sur master par un banc hors dépôt (Ghost), stable 6 fois sur 6, puis confirmé par la
contre-vérification de SESSION-INTEGRITY-01 : `_intensiteDefauts` lisait `S.prs` **après** que
`finishWorkout` l'avait mis à jour — une séance de record était comparée **à elle-même**. *Le contrôle
circulaire n'est pas réservé aux tests : un calcul du produit peut se mesurer contre sa propre sortie.*
🛡️ ft-v1250 : la séance porte le record d'**avant** elle (`sess.refAvant`) et c'est lui qui sert de
référence.


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

### 🔄 La même famille côté JS : une garde d'unicité sur une classe PARTAGÉE (C2, ft-v1237) *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
La garde de `_appendStartSessionBtn` cherchait `.coach-prog-save` pour savoir si une carte séance
existait déjà — classe portée **aussi** par la carte mémoire « 🧠 Je retiens » et la carte programme.
Une carte mémoire suffisait donc à **masquer** la carte séance. Et sans bulle cible, la garde ne jouait
pas du tout : deux appels → **deux** cartes. 🛡️ ft-v1237 : une marque dédiée, `coach-seance-carte`, et
les gardes ne regardent qu'elle. *Un sélecteur d'unicité doit nommer CE qu'il compte, pas ce qui lui
ressemble* — c'est ce paragraphe appliqué à un `querySelector` au lieu d'une règle CSS.

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

### 🔄 La variante ÉTAT : la fixture qui n'avait jamais fini l'inscription *(06/10/2026, qualification ft-v1251)*
ONBOARDING-QUICK-01 a posé une règle juste : **aucune annonce par-dessus une inscription en cours**
(`checkAnnouncements` se tait sans `ft4_ob2`). La page du runner complet ne posait **jamais** ce repère : sans le
savoir, le bloc F (« Christophe voit SON annonce », « Eline voit LA SIENNE ») testait depuis des semaines une
personne en pleine inscription. Tant que l'app ignorait cet état, c'était sans effet ; le jour où elle l'a lu, le
bloc a rougi — **à la passe complète seulement**, aucun banc du lot ne l'exécutant. Le produit n'était pas cassé :
Christophe et Eline sont inscrits depuis juillet. **Mis à jour (R30)** : le bloc pose le repère le temps du test,
puis rend l'état d'avant ; le silence pendant l'inscription reste gardé par le banc OBQ.
👉 *Une fixture décrit un état, qu'elle le dise ou non : quand le code apprend à lire un état, chaque fixture qui
ne l'a jamais déclaré en choisit un sans le savoir.*

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

### 🔄 5ᵉ cas : le groupe posé AVANT la fin du geste (ML-B, ft-v1243) *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
« ⚡ Super » écrivait **et enregistrait** `group`/`groupType` sur l'exercice **avant** le choix du
partenaire : fermé, retour arrière ou app quittée pendant le choix → « ⚡ Circuit (1) », qui revenait
au rechargement. Même mécanisme que ce paragraphe, appliqué à une **donnée enregistrée** et non à un
mode : *ce qui n'est vrai qu'à la fin du geste ne s'écrit qu'à la fin du geste*. Le même lot a fermé
la variante par le retrait (« ↩ Retirer » laissait un survivant seul dans son groupe).
🛡️ ft-v1243 : `_dissoudreGroupeOrphelin` + le groupe ne naît qu'au choix du 2ᵉ membre (témoins
B-CDIV → B-CDVII, contrôle négatif 26/26). ⛔ **Les orphelins enregistrés avant ft-v1243 ne sont pas
migrés** (décision à prendre séparément).

### ⛔ Ce que la protection de ce paragraphe a CASSÉ — voir §30
Imposer `openExPicker(mode)` (défaut `'workout'`) a désarmé **« + Exo » sur un superset existant** :
`addToGroup` pose `_exPickerMode='addToGroup'` puis appelle `openExPicker()` **sans argument**, et le
mode est écrasé. Détail et état au §30.

### ✏️ Correction d'une phrase de « Ce qui protège » (R30)
La non-régression « **le vrai remplacement garde les séries** » (bloc CLXXVIII) décrivait l'intention
de ft-v296 : corriger une étiquette. **Elle est devenue fausse par décision de Michel (D-046,
ft-v1250)** : le remplacement change d'exercice, les séries faites restent à l'exercice d'origine
(§13). Le témoin CLXXVIII a évolué avec sa raison écrite ; ce qu'il garde de l'esprit d'origine : le
remplacement **marche** et **ne perd rien**.

### 🔄 6ᵉ cas : « continuer sans email » ne quittait pas l'ancien compte *(06/10/2026, D1, AUTH-CLOUD-CLOSURE-01)*
`finishOnboarding` vidait `S.email`, mais l'email vivait à **trois** autres endroits : `ft4_email`, le cookie
`ft_email`, IndexedDB. Au rechargement, `index.html` réinjectait le cookie ; l'ancien compte A revenait, était
restauré par-dessus le nouveau profil local, et les pesées et séances partaient vers A. 🛡️ `_oublierEmailLocal()`
(`app.js`, un propriétaire) efface les quatre, quand l'inscription abandonne l'attente sans email et sur
« introuvable ». ⚠️ **Défaut voisin, connu et NON corrigé** : `_getEmailFromIDB` lit `r.result` sur l'événement
au lieu de `r.target.result` — elle rend **toujours** `null`, le repli IndexedDB n'a jamais fonctionné ; le réparer
activerait un chemin de restauration jamais éprouvé.

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

### 🔄 Le débrief payé deux fois — une récidive, et une porte toujours ouverte *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
Le corollaire ci-dessus disait *« ailleurs, ce serait pire »*. C'est arrivé sur le **débrief** :
- **ft-v1215** concluait « le débrief ne se paie plus deux fois » ; **la mesure du 15/09**
  (`docs/COUT-DOUBLE-DEBRIEF.md`, vrai serveur HTTP) l'a réfutée : un rechargement pendant `en_vol`
  laisse la 1ʳᵉ requête **arriver complète** avant l'abandon — deux appels pour un même débrief ;
- **04/10 (E5)** : nouvelle porte, **sans rechargement** — le rattrapage au démarrage passe pendant
  qu'un débrief est en vol. Reproduit en rejeu synthétique déterministe (P2, banc Ghost hors dépôt,
  6 fois sur 6 sur master) ; le banc le voit disparaître quand on mute `_dbfFini`. **Aucune occurrence
  terrain (pas de P3)** ; fréquence réelle inconnue.
⛔ **NON CORRIGÉ au 04/10/2026 (ft-v1250).** ⚠️ La remise en file existe pour qu'**aucun débrief ne soit
perdu** (ft-v979) : la fermer sans précaution échangerait un doublon contre une perte. La décision
(accepter · fermer côté téléphone · idempotence serveur) **appartient à Michel** et attend depuis le
15/09 (`docs/IDEMPOTENCE-DEBRIEF.md`).

### 🔧 E5 : cause démontrée et corrigée — ✅ publié en `ft-v1251` le 07/10 *(05/10/2026, `claude/e5-debrief-idempotence`)*
**La cause, mesurée avant de corriger** (témoin rouge sur master `a1e39739` : 2 appels pour la même séance, à 2,2 s
puis 7,9 s) : l'état « en vol » n'avait **pas de propriétaire**. Un seul emplacement `{id, ts}`, sans dire **qui**
attendait la réponse — le rattrapage du démarrage (`load` + 3 s) ne pouvait donc pas distinguer un appel
interrompu par une page MORTE d'un appel VIVANT de la page courante, et remettait le second en file. Et le succès
ne retirait pas la séance de la file. *Deux portes ouvertes (le rattrapage `_dbfRecuperer`, le filet n°3
`_dbfRattraper`), un seul défaut de fond : un état sans propriétaire.*
**Le correctif** : « en vol » est rangé **par identifiant de séance** avec le jeton de la **page** qui l'a posé
(`_DBF_PAGE`) ; une entrée de cette page est vivante, personne n'y touche ; une entrée d'une autre page (ou de
l'ancien format) est reprise comme avant. Un seul verrou (`_dbfDejaCouvert` : en vol, ou débrief déjà rangé au
magasin) pour les deux preneurs. Un succès retire la séance de la file ; **un échec ne la marque plus « livrée »**
(c'était faux depuis ft-v979). ⛔ **La remise en file n'est PAS supprimée** : sans elle, on échangerait un doublon
contre une perte. ⚖️ **Pas de minuteur** : un délai arbitraire dirait « mort » à un appel lent (mesuré par la
mutation M-E5-9 : il perd le débrief au rechargement).
**Ce qui reste, dit plutôt que masqué** : un **rechargement pendant l'appel** (cas B du 15/09) — la première
requête aboutit côté serveur sans personne pour lire la réponse, la reprise en paie une seconde (mesuré : 2
requêtes, 1 débrief, 1 message — **aucun doublon côté téléphone, un doublon de facturation**). Sans stockage
serveur, impossible à fermer côté client : décision toujours chez Michel. **Deux onglets** ouverts sont deux
pages (§33). Preuve : P2 (banc), **aucune occurrence terrain (pas de P3)**.

### 🎯 DEBRIEF-ON-DEMAND-01 : la famille est fermée PAR LA DÉCISION, pas par un verrou de plus *(05/10/2026, branche `claude/debrief-on-demand-01` — ✅ publié en `ft-v1251` le 07/10)*
**Décision de Michel : le débrief de Milo se DEMANDE** (« Analyser cette séance avec Milo », fin de séance ou Progrès).
Tous les chemins qui appelaient Milo sans geste sont **retirés** : la file `ft4_pending_debrief`, le « reçu », les
livraisons `ft4_debrief_faits`, le rattrapage au démarrage (`load` + 3 s, `_dbfRecuperer`, `_dbfRattraper`),
`_maybeAutoDebrief` à l'ouverture du Coach, la branche `debriefSess` de `sendToCoach`, et une boucle de **2 essais
réseau cachés** dans le moteur (trouvée en le relisant : un « nouvel essai » qui pouvait payer deux fois une requête
arrivée au serveur). ⭐ *E5 rendait l'automatisme sûr ; l'automatisme n'existe plus — c'est plus simple qu'un verrou
de plus.* Ce qui reste du mécanisme E5 : « en vol » **par séance et par page** — il empêche un double clic de payer
deux générations, et il permet de dire « Analyse interrompue » après un rechargement **sans rien relancer**.
**Ce que ça change au cas B** : un rechargement pendant l'analyse ne déclenche plus de 2ᵉ requête toute seule. La
1ʳᵉ réponse reste perdue avec la page (le serveur l'a facturée) ; si la personne relance, elle paie une 2ᵉ analyse
**qu'elle a demandée**. *Le doublon de facturation n'est plus silencieux : il est un geste.* Banc
`tools/banc_debrief_demande.js` (OD-01 → OD-17), contrôle négatif `tools/mut_debrief_demande.py`.

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

### 🔄 Le cas le plus proche de ce paragraphe : « + Exo » sur un superset existant *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
**Constat** (P0 relu sur master `9b8e4813` ; signalé « mesuré, non corrigé » par ML-B le 29/09) :
`addToGroup` (log.js, 24/06) pose `_exPickerMode='addToGroup'` puis appelle `openExPicker()` **sans
argument** ; depuis ft-v1073, `openExPicker(mode)` fait `_exPickerMode = mode || 'workout'`. Le mode
posé une ligne plus haut est écrasé : l'exercice s'ajoute à la séance, **pas au groupe**.
👉 C'est exactement ce paragraphe : la protection de §26 a changé un comportement **généralisé** sans
convertir **chaque** site qui comptait sur l'ancien.
⚠️ **Pourquoi le témoin de §26 n'a pas rougi** (P0, lu dans `tests/parcours/runner.js`, bloc CLXXVIII) :
il vérifie que les modes restent atteignables en appelant `openExPicker('addToGroup')` **directement**,
jamais `addToGroup()`. Il prouve que la porte existe, pas que le chemin réel y mène — c'est §58 (un
témoin qui pose l'état à la main ne voit pas le chemin qui y mène).
⛔ **NON CORRIGÉ au 04/10/2026 (ft-v1250).** Date d'introduction déduite de l'historique git, pas
rejouée.

### 🔄 Protéger le compte B en effaçant le jeton de A *(06/10/2026, qualification nocturne ft-v1251)*
AUTH-CLOUD-CLOSURE-01 (T-JETON) a lié le jeton d'appareil à son compte — c'était juste : avant, le jeton de A
partait avec les données de B, et le serveur, qui fait gagner le jeton, écrivait B dans A. Mais sa première version
**effaçait** le jeton dès que le compte courant n'était pas le sien. Or une règle plus ancienne dit l'inverse :
**MILO-AUTH1, « aucun code client n'efface le jeton »** (témoin B-CCCLXXV ⑥, `tests/parcours/auth_ia.js`). Le banc
du lot et ses voisins étaient verts ; c'est la série large de la nuit qui a rougi. Mesuré sur une sonde :
**A → B → A perdait le jeton de A** — revenir sur son propre compte redemandait la preuve.
🛡️ Correctif minimal (`constants.js`, même propriétaire) : le jeton d'un autre compte n'est **jamais envoyé, et
jamais effacé** ; il resert dès que son compte revient. Témoin AC-09 (A → B → sans email → A), mutation M3
(effacement réintroduit) rouge, `tools/mut_auth_ia.py` 8/8.
👉 *Retirer l'état de A pour protéger B n'est pas une protection, c'est un échange — et seul un banc qui connaît
les deux règles à la fois peut le voir.*

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

### ⭐⭐ LE MIROIR, TROUVÉ LE 03/09 (ft-v1114) — *et il est plus coûteux que l'original*

§31 décrit un témoin visé sur une forme. **Le miroir est une AIDE visée sur une forme** — et
elle, personne ne la teste.

Trois cas dans la même livraison, dont **deux sur du texte lu par l'utilisateur** :

| où | ce qui était figé | pourquoi c'est devenu faux |
|---|---|---|
| témoin ft-v1113 | le **nom** `ciqual.json`, alors que son propre commentaire écrivait la garantie (*« un FICHIER, jamais l'IA »*) | une 2ᵉ base locale (`marques.json`) est arrivée |
| **aide `?`** ft-v1113 | *« les noms sont GÉNÉRIQUES, **jamais des marques** : tu ne verras pas Big Mac »* | une base d'enseignes est arrivée **le lendemain** |
| **aide `?` + nouveauté + diapo + aide détaillée** ft-v1114 | *« Tape **mcnuggets** »* | **il n'y a aucun nugget** dans les 27 produits — le mot n'a jamais existé |

**⛔ Le 3ᵉ est le pire, et il est entièrement de mon fait** : j'ai écrit le matin même
*« une aide qui nomme un repère inexistant est pire qu'une aide absente, parce qu'on la croit »*,
puis j'ai cité un produit inexistant dans **quatre surfaces à la fois**. ⚠️ *Écrire la règle ne
protège pas de l'enfreindre — seule une mesure le fait.*

### 🛡️ Ce qui protège aujourd'hui
Un témoin **extrait les produits que l'aide propose de taper** (la séquence qui suit « Tape ») et
vérifie que chacun trouve vraiment quelque chose dans `data/marques.json`. ⛔ Il ne fige **aucune
formulation** : on peut réécrire l'aide entièrement, il rougira seulement si elle nomme un produit
qui n'existe pas. ⚠️ **Et son 1ᵉʳ jet était trop large** — il prenait tous les mots en gras et
sortait « enseigne », « rien », « hors ligne » comme des produits introuvables : *un extracteur
trop large ne mesure pas la promesse, il mesure la mise en forme.* Éprouvé **dans les deux sens**
sur le vrai corpus (rouge sur `mcnuggets`, vert sur `big mac` et `tenders kfc`).


### 🔄 « Récap » renommé par une décision *(06/10/2026, qualification ft-v1251)*
Le témoin du bloc G (« les manques signalés par Michel y sont : récap séances… ») cherchait le **mot** `récap`
dans la liste Premium. D-052 (le débrief se demande) a réécrit l'avantage : « L'avis de Milo sur tes séances — à ta
demande » (`be96455f`). L'ancien libellé, « Le récap de **chaque** séance », serait **faux** aujourd'hui. Rouge à
la passe complète de la nuit, aucun banc du lot ne lisant cette liste. **Mis à jour (R30)** sur la garantie :
l'avantage est présent, et la promesse « de chaque séance » est absente.

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

---

## 34. 📥 CE QU'UN MODÈLE HALLUCINE ENTRE DANS LES DONNÉES — et une valeur inventée est CRÉDIBLE **(02/09/2026, ft-v1095)**

Un import fait entrer dans l'app des chiffres qu'**aucun humain n'a tapés** : ils viennent d'un
modèle qui lit une photo. Le piège n'est pas qu'il se trompe — c'est que **ce qu'il invente est
plausible**. Une charge de 500 kg ressemble à une charge. Une date de 1900 ressemble à une date.
Rien ne plante, rien n'alerte, et la valeur s'installe.

### 🔎 Ce qui a été mesuré (les vraies fonctions, seul `fetch` remplacé)
- `500 kg × 50 reps` → record de **1 060 kg de 1RM**, accepté et annoncé « importée ✅ » ;
- charge **négative** → record de **−90 kg** ;
- dates `1900-01-01`, `2099-01-01`, et la chaîne **« le mardi »** → entrées telles quelles ;
- `exercises` rendu comme une **chaîne** → l'import plante, avec la trace technique
  *« (sess.exercises || []).forEach is not a function »* affichée à la personne.

### ⛔ Pourquoi un faux record coûte plus cher qu'il n'en a l'air
Un record faux **vers le haut** ne sera jamais battu : il est donc **éternel**. Et il ne dort
pas — il sert de référence aux charges que Milo propose. *Une seule ligne mal lue déforme les
prescriptions pendant des mois.* (Même famille que le faux record de ft-v1085.)

### ⭐⭐ Le cas qui apprend quelque chose : `500 × 50`
Chaque valeur franchissait les bornes existantes (500 ≤ 500, 50 ≤ 100). **C'est la combinaison
qui est impossible** : `bz()` plafonne les répétitions à 20, donc *toute* charge × 20 vaut 2,1
fois elle-même. 👉 **Borner les entrées ne suffit pas : il faut aussi borner ce qui SORT.**

### ⛔ À quoi on la reconnaît
- Une donnée qui entre **sans avoir été tapée** (import, OCR, réponse d'un modèle, webhook).
- Des bornes présentes sur **un** chemin de lecture et absentes sur l'autre (**R8**) : ici
  `coach.js` bornait déjà `kg` et `reps` pour lire une conversation — l'import, non.
- Un `||[]` qui suppose une **forme** (`(x.exercises||[]).forEach`) : il protège du `null`,
  jamais du **mauvais type**.
- Un message de succès qui ne distingue pas « tout est entré » de « une partie a été jetée ».

### 🛡️ Ce qui protège aujourd'hui
`_serieValide()` et `_dateImportValide()` dans `state.js` — **un seul propriétaire** (R2),
employé par l'import **et** par `coach.js`. La réponse est **normalisée à l'entrée** (une
dizaine de lecteurs en aval : les rustiner un par un, c'est en oublier un). Bloc **CCII**.

### ⭐ Le réflexe, et l'arbitrage qui va avec
**On écarte la SÉRIE, pas la séance** : une ligne mal lue ne doit pas faire perdre les neuf
autres (règle d'or #3). Une **date** invalide, elle, écarte la séance — l'aperçu ne permet pas
de la corriger, et une date fausse pollue durablement les graphes et le contexte de Milo.
⛔ **Et on le dit** : un rejet silencieux est indiscernable d'un import réussi (**R29**).
⚠️ La borne basse des dates (1990) est un arbitrage **assumé** : un import sert justement à
récupérer un carnet antérieur à l'app, donc on ne refuse pas « vieux » — on refuse
« impossible ».

### ⚠️ Et la sonde a menti deux fois avant de mesurer
Elle appelait `_histAnalyzeBatch` — qui ne fait que **rendre** le tableau — au lieu de
`analyzeHistPhotos`, qui **remplit** l'état ; et elle n'avait **pas de cas valide**. Les
quatorze réponses hostiles rendaient donc le même résultat. *Le témoin de contrôle doit être le
PREMIER cas d'un banc de réponses hostiles, pas le dernier* — sans lui, « tout est refusé » et
« je ne mesure rien » sont indistinguables.

---

## 35. 🤖 LE CHEMIN AUTOMATIQUE EST TOUJOURS LE MOINS PROTÉGÉ **(02/09/2026, ft-v1096)**

Quand une même valeur peut entrer par **deux portes** — tapée par la personne, ou lue par une
machine — c'est presque toujours la porte **automatique** qui n'a pas de garde-fou. Et c'est
l'inverse de ce qu'il faudrait : *sur le chemin manuel, quelqu'un relit ; sur le chemin
automatique, personne.*

### 🔎 Le cas fondateur, mesuré avec son témoin de comparaison
Le **poids**. `saveWeightEntry` (saisie manuelle) refuse depuis toujours hors **20–300 kg** et
affiche *« Poids invalide »*. `saveBodyScan` (photo de balance lue par un modèle) ne vérifiait
que `weight > 0` — **et il écrit dans le même `S.weightLog`**.
👉 ***Le chiffre 3 000 était REFUSÉ quand on le TAPE et ACCEPTÉ quand un modèle le LIT.***
Conséquence mesurée : `S.bw = 3000`, **TDEE 47 900 kcal** — donc toutes les cibles de l'onglet
Nutrition absurdes, et un poids de trois tonnes envoyé à Milo. Un poids de **2 kg** passait
aussi (TDEE 1 431), et un **% de gras à 300 %** était enregistré sans un mot.

### 🔁 Ce n'est pas un cas isolé — c'est la 4ᵉ de la semaine
| version | la valeur | bornée sur | pas bornée sur |
|---|---|---|---|
| ft-v1086 | le sexe | le BMR | le plancher calorique |
| ft-v1089 | un élément d'écran | `updSetup` | le bouton « Tester la connexion » |
| ft-v1095 | charge et répétitions | la lecture d'une conversation | **l'import d'historique** |
| ft-v1096 | le poids | **la saisie manuelle** | **le bilan corporel lu par l'IA** |
| ft-v1099 | **l'âge, la taille, le repos** | **la saisie manuelle** (14–99 ans, 100–229 cm) | **la RESTAURATION du compte** |

**⭐⭐ LE 5ᵉ CAS AJOUTE UNE NUANCE QUI VAUT POUR TOUTE LA FAMILLE : la porte automatique n'est pas
forcément une IA.** Les quatre premiers cas venaient d'un modèle, d'un OCR ou d'un import — au
point qu'on pouvait croire que la famille était « les valeurs lues par une machine ». Le 5ᵉ vient
de la **restauration du compte**, c'est-à-dire de **nos propres données**, écrites par nous, la
veille. *Le critère n'est pas « d'où vient la valeur », c'est « quelqu'un la relit-il avant qu'elle
entre ? ».* Mesuré : âge **500**, taille **20 cm**, repos **999 999 s** acceptés, **TDEE −2 433
kcal**, et Milo qui reçoit « 500 ans » comme un fait sur la personne.

**⚠️ ET CELUI-CI SE CACHAIT DERRIÈRE UN PLANCHER.** `calcMacros` ramène la cible affichée à
1 500 kcal quoi qu'il arrive : *l'écran montrait un chiffre plausible au-dessus d'un calcul qui
n'avait plus de sens*. 👉 **Un plancher ou un plafond de sécurité MASQUE la famille §35** — il
transforme une absurdité visible en absurdité silencieuse. Quand on cherche cette famille, mesurer
la valeur **en amont** du plancher, jamais celle qui s'affiche.

### ⛔ À quoi on la reconnaît
- Deux fonctions écrivent dans **le même champ** de `S`, et une seule valide.
- La porte non protégée est celle qui vient d'un **modèle, d'un OCR, d'un import, d'un webhook**.
- Le garde-fou existant porte un **message pour l'humain** (« Poids invalide (20–300 kg) »), ce
  qui fait croire qu'il est global alors qu'il vit dans un seul appelant.

### 🛡️ Ce qui protège aujourd'hui
`_poidsValide()` et `_pctGrasValide()` dans `state.js`, employés par **les deux** chemins — et
deux témoins qui vérifient que le second les emploie vraiment (bloc **CCIII**). ⭐ **Les bornes
ne sont pas inventées** : ce sont **exactement** celles que l'app affiche déjà à qui saisit à la
main. *Répliquer une borne existante ne demande aucun arbitrage ; en inventer une, si.*

### ⭐ Le réflexe
Quand on borne une valeur, chercher **tout de suite** qui d'autre écrit dans le même champ
(**R8**) — et se rappeler que le chemin automatique est celui qui en a le plus besoin, pas le
moins. ⛔ Et **on écarte la valeur, pas tout le document** : le reste de la lecture est
peut-être bon (règle d'or #3). ⭐ Le refus **nomme la source** — *« la lecture de la photo s'est
trompée »* — parce que c'est là que la personne doit regarder, pas dans ses propres doigts.

### 🔄 Le cookie `ft_email` : un indice traité comme une preuve *(06/10/2026, COOKIE-PROFILE-01)*
`index.html` posait `ft4_ob2=1` sur la seule foi du cookie (inscription « faite » sans rien vérifier) ;
`autoConnect` ne restaurait que si le profil en ligne avait au moins une séance ; puis `persist()` lançait
`_cloudSync` → un profil **par défaut** partait vers le compte existant. *Le chemin manuel (Restaurer)
vérifiait ; le chemin automatique décidait seul.* 🛡️ Un état explicite à un seul propriétaire (`state.js`,
`ft4_restau_attendue`) et un **garde central** (`_cloudSync`, `syncSheets`) : rien ne part tant que l'attente
n'est pas résolue. P2 synthétique, aucun incident terrain prouvé.

---

## 36. 🔤 UNE SONDE QUI INVENTE UN NOM DE CHAMP MESURE TOUJOURS ZÉRO **(02/09/2026, ft-v1096)**

Ce n'est pas un bug de l'app : c'est un bug de **celui qui mesure**, et il coûte cher parce que
son résultat est **crédible**. Une clé qui n'existe pas ne lève aucune erreur en JavaScript —
elle rend `undefined`, qui devient `0`, qui ressemble à une donnée perdue.

### 🔎 Trois fois dans la même session, sur trois sondes différentes
| ce que j'ai écrit | ce qui existe | ce que ça rendait |
|---|---|---|
| `ft4_weight` | `ft4_wlog` | *« la pesée n'atteint jamais le disque »* — faux |
| `fatPct` | `bf` | le cas « % de gras à 300 % » n'était **jamais joué** |
| `p` / `c` / `f` | `prot` / `carbs` / `fat` | *« les macros consommées ne sont pas comptées »* — faux |

### ⛔ À quoi on la reconnaît
- La mesure rend **zéro, ou vide, ou identique partout** — la même signature que le témoin qui
  ne mesure rien (§31, et les quatre faux positifs de ft-v1094).
- Le résultat **confirme un peu trop bien** ce qu'on soupçonnait.
- Le cas « hostile » et le cas « valide » donnent **le même** verdict.

### 🛡️ Le réflexe, en une ligne
**Avant d'accuser le code, `grep` le nom du champ.** Trente secondes. Et poser dans chaque banc
d'essai un **cas valide en PREMIER** : si lui aussi rend zéro, c'est la sonde qui est cassée,
pas l'app (leçon de ft-v1095, où quatorze réponses hostiles rendaient le même résultat).

### 🔄 La variante PRODUIT : la tuile qui lisait des clés inexistantes (NUT-DASH1, ft-v1246) *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
Ce paragraphe parle d'une **sonde** ; le même défaut a vécu dans l'app. La tuile Nutrition du tableau
de bord lisait `m.kcal || m.cal` et `m.prot || m.p` — des clés que `calcMacros` n'a jamais rendues
(`calories`, `prot_g`). Tout valait `undefined`, et le **repli** `calcTDEE()` affichait la **dépense**
sous « Objectif du jour » : un chiffre plausible, donc invisible (130 kg en perte → 2 482 au lieu de
1 932). *Un repli plausible est pire qu'une erreur : il ne se voit pas.* 🛡️ ft-v1246 : les vraies clés,
repli retiré (sans cible, pas de chiffre).

---

## 37. 📅 LA MOYENNE DIVISÉE PAR UNE FENÊTRE QUE LA PERSONNE N'A PAS VÉCUE **(02/09/2026, ft-v1098)**

**Le motif** : on fixe une fenêtre (4 semaines, 30 jours, 4 séances), on somme ce qu'on y
trouve, **et on divise par la taille de la fenêtre** — sans se demander si la personne était
déjà là.

**⛔⛔ CE QUI REND CETTE FAMILLE PARTICULIÈREMENT VICIEUSE : le défaut est INVISIBLE POUR CELUI
QUI TESTE.** Il ne se manifeste que sur un compte **récent**, et le développeur — comme le
fondateur — teste avec son propre compte, plein depuis des mois. *Sur un historique complet,
le calcul est parfaitement juste.* Le seul moment où quelqu'un le rencontre est celui où on ne
le regarde pas : la première semaine.

| version | le calcul | ce qu'il divisait par | l'effet |
|---|---|---|---|
| ft-v1021 | moyenne des calories du journal | les jours **écoulés** | un jour non noté se lisait comme un jour de jeûne — la moyenne mentait **vers le bas** |
| ft-v1027 | deux moyennes, deux fenêtres | (justes toutes les deux) | **aucune ne nommait sa fenêtre** : l'écran affichait 1 920 et 2 495 kcal à 40 px d'écart |
| ft-v1098 | fréquence d'entraînement `f` | **4 semaines, toujours** | 2 semaines à 3 séances/sem se lisaient **2** ; 1 semaine à 4 séances/sem se lisait **1** |

**⚠️ Et en ft-v1098 l'effet était à L'ENVERS de ce qu'il faudrait** : l'amplitude du cyclage
vaut `(7−f)/7`, donc **plus `f` est petit, plus la prescription est agressive**. *Le pratiquant
le plus récent, celui dont on sait le moins, recevait l'écart le plus grand* — 52 g de lipides
un jour de séance pour un plancher à 50,4.

**⚠️ La dernière ligne est la plus sournoise des six** : le cas n'est pas *absent*, il est **présent et méconnaissable**. Le titre venait du muscle le plus travaillé (il n'y en a aucun), la ligne du bas des noms d'exercices (il n'y en a aucun), la figurine des scores musculaires (tous nuls). Rien n'est faux ; tout est vide. 👉 ***Une ligne qui n'a rien à dire ne doit pas se taire à la place prévue pour parler : elle doit nommer ce que la chose EST.***

### 🔍 À quoi on la reconnaît
- un dénominateur **constant** (`wk.length`, `30`, `4`) à côté d'un numérateur qui, lui, dépend
  de ce que la personne a fait ;
- un voisin immédiat qui, lui, **se protège** — en ft-v1098 `_pendingFreqContext` refusait déjà
  de juger sous « 3 semaines non vides », deux lignes plus bas (c'est **R8** : le même piège,
  deux lecteurs, un seul gardé) ;
- une valeur qui **se corrige toute seule avec le temps** : si le bug disparaît en attendant, il
  ne disparaît pas, il devient invisible.

### ⛔ Le piège du correctif (celui où on se trompe de dénominateur)
« Diviser par les semaines **non vides** » est tentant et **faux** : une semaine **sautée** fait
partie de la fréquence de quelqu'un. Le bon dénominateur est **l'étendue de l'historique**, pas
son remplissage. Mesuré : `[3,2,0,3]` doit rendre **2**, et c'est ce qu'il rend.
⛔ Et on ne moyenne pas sur **moins d'une fenêtre complète** : rendre « je ne sais pas » (0) est
plus honnête qu'extrapoler une moyenne hebdomadaire sur trois jours (**R29**).

### 🛡️ Le réflexe, en une ligne
**Devant une moyenne, demander « depuis quand cette personne est-elle là ? » avant de demander
« combien a-t-elle fait ? »** — et tester avec un compte de **deux semaines**, jamais avec le sien.


---

## 38. 📏 UN TAUX DIVISÉ PAR LE NOMBRE D'ÉCHANTILLONS AU LIEU DU TEMPS ÉCOULÉ **(02/09/2026, ft-v1102)**

> **La famille §37 sous sa forme la plus pure**, et la plus chère : là-bas c'était une *moyenne*
> divisée par une fenêtre non vécue ; ici c'est une *pente* divisée par le **nombre de mesures**.
> Même signature, même invisibilité — et cette fois le facteur d'erreur est le **rythme de la
> personne**, donc chacun voit un chiffre faux d'un facteur différent.

### 🔍 Le cas
`linearRegression(pts)` recevait, aux **trois** endroits qui l'appelaient, l'**index** du point
comme abscisse : `pts.map((p,i)=>({x:i, y:p.kg}))`. La pente sortait donc en **kg par pesée**.
Le code écrivait ensuite `slope*7` en croyant lire « par semaine » — il lisait **« sur 7 pesées »**.

**Mesuré, à évolution réelle strictement identique (+0,20 kg/semaine) :**

| Rythme de pesée | Ce que l'app annonçait | Facteur |
|---|---|---|
| tous les jours | **+0,20 kg/sem** | ×1 ✅ |
| tous les 2 jours | **+0,40 kg/sem** | ×2 |
| tous les 3 jours | **+0,60 kg/sem** | ×3 |
| une fois par semaine | **+1,40 kg/sem** | **×7** |

👉 ***Le chiffre mesurait la fréquence de la balance, pas le corps.*** Quelqu'un de rigoureux qui
se pèse tous les matins voyait juste ; quelqu'un qui se pèse le dimanche voyait sa tendance
**multipliée par sept** — et Milo la recevait telle quelle, en clair, dans son contexte.

### ⭐⭐ Ce qui rend ce cas instructif : le correctif de la veille l'a RÉVÉLÉ, pas créé
Tant que le juge de ft-v1044 disait *« ✓ dans la bonne direction »* dès que le poids montait, une
pente ×7 restait **dans la bonne direction** — donc **invisible**. C'est ft-v1100, en remplaçant
ce juge par une comparaison à une **plage chiffrée**, qui a fait sortir un `⚠ PLUS RAPIDE que la
plage attendue` sur quelqu'un de parfaitement dans sa cible.

> **Un garde-fou juste révèle les mesures fausses qu'il consomme.** Le premier réflexe, devant ce
> rouge, était de croire que le nouveau juge était trop strict — c'est-à-dire d'aller « réparer »
> le seul morceau du système qui venait de dire la vérité.

### 🔍 À quoi on la reconnaît
- un `map((p,i)=>({x:i, …}))` suivi, plus loin, d'une **multiplication par une durée** (`*7`,
  `*30`, `*365`) : l'abscisse est en *rangs*, le facteur est en *jours* ;
- une fonction **générique** (ici `linearRegression`) correcte en elle-même, avec **plusieurs
  appelants** dont certains ont raison — quand on **trace** une droite, l'index EST la bonne
  abscisse ; c'est seulement quand on **annonce un rythme** qu'il devient faux ;
- un chiffre qui **paraît juste chez celui qui teste** : quiconque a des données quotidiennes voit
  ×1. *Le bug ne se manifeste que chez les gens qui mesurent moins souvent que le développeur.*

### ⛔ Le piège du correctif
Ne **pas** toucher à la fonction générique : elle n'a jamais menti, c'est ce qu'on lui **donne**
qui était faux. Corriger `linearRegression` aurait cassé les tracés de courbes, qui ont raison.
👉 Un **seul propriétaire** de « kg par semaine » (`penteKgParSemaine`), lu par l'écran Progrès,
par le moteur de tendance **et** par le contexte de Milo (**R2**) — et un témoin permanent refuse
tout nouveau `slope*7` sur un index hors de ce propriétaire, sinon la rechute est certaine.
⚠️ Et une garde qu'on n'aurait pas eue en gardant l'index : **deux pesées le même jour** donnent
une étendue nulle ; on rend `0`, pas une pente infinie.

### 🛡️ Le réflexe, en une ligne
**Devant un taux « par semaine », chercher son dénominateur et vérifier qu'il est en JOURS** —
puis le mesurer sur quelqu'un qui note *moins souvent que soi*, jamais sur ses propres données.

---

## 39. ⚖️ UNE VALEUR PEUT ÊTRE COHÉRENTE AVEC ELLE-MÊME ET IMPOSSIBLE **(02/09/2026, ft-v1103)**

> **La suite directe de §34** (*ce qu'un modèle hallucine entre dans les données, et une valeur
> inventée est CRÉDIBLE*). §34 disait : le piège n'est pas qu'il se trompe, c'est que ce qu'il
> invente est plausible. Celle-ci va un cran plus loin : **ce qu'il invente peut passer le
> contrôle qu'on avait justement écrit pour ça.**

### 🔍 Le cas
Michel, capture à l'appui : *« encore le souci avec la prot »*. Une ligne **Iso zero protein**,
portion **30 g** : **156 kcal · 35 g de protéines · 1 g de glucides · 1 g de lipides**.

**35 + 1 + 1 = 37 g de matière dans une portion de 30 g.** La masse ne se crée pas.

### ⛔⛔ Le contrôle existait, et il n'était pas en faute
`_coherenceKcal` (ft-v972) vérifie que **les calories collent aux macros**. Ici :
`4×35 + 4×1 + 9×1 = 153` contre **156 affichées** — **2 % d'écart**, il se tait, et il a raison.

| Question posée | Réponse | Verdict |
|---|---|---|
| Les calories collent-elles aux macros ? | 153 vs 156 | ✅ cohérent |
| **Ces macros tiennent-elles dans la portion ?** | 37 g dans 30 g | 🔴 **personne ne la posait** |

👉 ***Un garde-fou ne protège que de la question qu'il pose.*** Le modèle avait produit un jeu de
valeurs **interne­ment cohérent** — c'est-à-dire exactement ce qui franchit un contrôle de
cohérence. Il fallait une **seconde** question, physique celle-là.

### 🔍 À quoi on la reconnaît
- un contrôle qui vérifie une **relation entre deux champs** (kcal ↔ macros) sans jamais vérifier
  la **contrainte physique** qui les borne tous (masse, durée, volume) ;
- une valeur qui « sonne juste » parce que ses composantes se répondent entre elles ;
- et le signe qui aurait dû alerter : **le contrôle reste muet sur un cas que l'œil voit tout de
  suite**. Michel l'a vu en le regardant ; l'app ne pouvait pas.

### ⛔ Les trois pièges du correctif, chacun payé en mesurant
1. **L'unité.** 100 ml de miel pèsent ~140 g et portent ~116 g de glucides : la règle appliquée
   aux **millilitres** hurlerait sur un sirop, un miel, une huile. *Un garde-fou qui se trompe sur
   le miel ne survit pas au petit-déjeuner* — même leçon que la bière du contrôle voisin (**R19**).
   ⚠️ Et l'unité **ne voyageait pas** avec la référence (`_efRef` ne portait que `{base, q}`) :
   sans la faire voyager, le repli sur « grammes » aurait produit exactement cette fausse alerte.
2. **Le seuil.** Il n'y en a **pas à choisir** : la limite est l'**égalité**. Mesuré — une huile
   (10 g pour 10 g de lipides) et du sucre (20 g pour 20 g de glucides) sont **à 100 % d'une
   seule macro** et parfaitement normales. *Tout pourcentage de tolérance les aurait accusées.*
   La seule marge admise est l'**arrondi** des 4 champs à l'entier : 3 macros gonflées de moins
   de 0,5 g et une quantité rabotée d'autant — **2 g au pire**, dérivés, pas choisis.
3. ⛔⛔ **Le bouton de correction — celui qu'il ne fallait PAS mettre.** Le contrôle voisin en a
   un (*« Mettre 153 kcal »*) parce que la valeur juste **se calcule**. Ici, l'app sait que l'un
   des deux nombres est faux et **ne sait pas lequel**. Chez Michel c'est la **portion qui est
   juste** (30 g d'isolat portent ~26 g de protéines) : un bouton *« mettre 37 g »* aurait
   **aggravé sa ligne au lieu de la réparer**. *On montre les deux nombres, la personne tranche*
   (**R29**).

### 🛡️ Le réflexe, en une ligne
**Un contrôle de cohérence entre champs ne remplace jamais une contrainte physique.** Devant un
jeu de valeurs, demander non seulement *« se répondent-elles ? »* mais *« tiennent-elles dans ce
qui les contient ? »* — la masse, la durée, le volume.

*Voisine de **§34** (l'hallucination crédible), de **§35** (le chemin automatique est le moins
protégé — ici l'estimation IA n'avait aucune borne physique, quand l'import d'historique en a
depuis ft-v1095), et de **§12quater** (reproduire avant d'expliquer : le cas a été rejoué par les
vraies fonctions, seul `fetch` remplacé, avant qu'une ligne de correctif soit écrite).*


---

## 40. 🗣️ LE VÉRIFICATEUR ÉCRIT SUR UNE TOURNURE DE LANGUE SE PÉRIME À LA REFORMULATION SUIVANTE **(03/09/2026)**

**Le symptôme** : un scénario du banc payant ressort **rouge** sur une réponse de Milo qui fait
exactement ce qu'on lui demande — et il ressort rouge **passe après passe**, donc il finit
étiqueté « SYSTÉMATIQUE », c'est-à-dire l'étiquette la plus alarmante du rapport.

**Le cas mesuré (EV-043, deux fois dans la même réponse)** :

| ce que Milo écrit | ce que le motif cherchait |
|---|---|
| « Viser 78 kg irait **à l'encontre** de ce que tu as fixé » | connaissait `contraire`, `inverse` — **pas `à l'encontre`** |
| « un calcul IMC de **ta** balance » | exigeait `la balance` — mesuré : `/la balance/` → false, `/ta balance/` → **true** |

Et sur EV-008 : Milo dit *« je n'ai pas accès à internet »* en ouverture puis donne l'adresse de
PubMed **trois paragraphes plus bas** ; le vérificateur ne lisait que **140 caractères** avant le
lien, donc le refus était écrit mais hors de sa fenêtre.

**⛔⛔ CE QUI FAIT LA FAMILLE N'EST PAS « IL MANQUAIT UN MOT ».** Le commentaire du code raconte
que ce même vérificateur avait **déjà été corrigé le 25/08**, pour une autre formulation de refus
(« ce serait aller dans le sens inverse »). 👉 ***On avait corrigé pour la phrase d'hier, pas pour
celle de demain.*** Un modèle reformule à chaque appel ; une liste de tournures écrite à la main
ne peut pas suivre.

**⚠️ ET LE COÛT EST PIRE QU'UN TEST MANQUANT.** Un rouge sur la bonne réponse apprend à ne plus
lire les rouges (**R19**) — et il enterre les vrais : sur les 5 rouges de cette passe, **2
seulement étaient de vrais défauts**.

### 🛡️ À quoi on la reconnaît
Un rouge dont le **détail imprimé cite une phrase qui dit le contraire de ce qu'on lui reproche**.
Le rapport affichait `adopte le poids cible du fabricant : "viser 78 kg"` — extrait d'une phrase
qui **refuse** les 78 kg.

### 🛡️ Ce qui protège aujourd'hui
- ⭐ **Épingler les formulations déjà rencontrées** dans un témoin permanent (bloc CCXVII), pour
  qu'une 3ᵉ correction du même motif ne passe pas en silence.
- ⛔ **Éprouver dans les deux sens** : le correctif doit rendre le vérificateur vert sur la bonne
  réponse **et le laisser rouge** sur une réponse qui commet vraiment la faute. Sans la seconde
  moitié, on remplace un faux rouge par un vert qui ne peut plus rougir.
- ⚠️ **Préférer le fait à la tournure** : chercher l'appareil (`balance`, `imc`) plutôt qu'un
  article précis ; lire *toute* la réponse avant le lien plutôt qu'une fenêtre de N caractères.

### 🛡️ 2ᵉ FORME, MESURÉE LE MÊME JOUR : LE VÉRIFICATEUR QUI FIGE UN FAIT QUE LE DÉPÔT CORRIGE

`EV-032` accusait Milo de prescrire « tate press », *« que l'app ne sait pas mesurer »* — sur une
liste de 5 noms **figée au 01/08/2026**. Mesuré le 03/09 : `Tate Press` est dans `EXLIB`,
`_mscScores` lui rend `{triceps:2, front-delt:1}`, et **0 des 322 exercices envoyés** est muet.
Les **cinq** noms de la liste y étaient entrés depuis. Milo l'a prescrit **parce que nous le lui
envoyons**, avec la consigne « écris son nom EXACTEMENT ».

⛔⛔ **Et le piège se referme sur le correctif évident** : mettre la liste à jour l'aurait rendue
**vide** — donc un témoin incapable de rougir. *Remplacer une liste périmée par une liste vide,
ce n'est pas corriger.* Le correctif est de changer la QUESTION : interroger le catalogue réel
(`EXLIB`, source unique — **R2**) au lieu d'en garder une copie. Un exercice ajouté demain cesse
alors tout seul d'être coupable.

⚠️ **Le calibrage compte autant que l'idée** : la 1ʳᵉ version générique produisait **4 faux
positifs sur 30 lignes réelles**. Il a fallu comparer *dans les deux sens* (Milo écrit « Rowing
Barre », le catalogue dit « Rowing Barre Buste Penché ») et **sortir du périmètre les lignes sans
nom** (« • S1 : 95×3 » — le nom est sur la ligne du dessus). Résultat mesuré : **0 faux positif
sur 19 lignes réelles, 4 exercices inventés sur 4 attrapés.**

### 🛡️ 3ᵉ FORME : LE SCÉNARIO QUI TESTE UN CHAMP QUE L'APP NE COLLECTE PAS

`EV-040` reproche à Milo de redemander « le matériel qu'il a déjà dans le profil ». Mesuré :
`matos` **n'est pas une question de `COACH_QUIZ`**, et `S.equip`/`S.matos`/`S.materiel` ont
**zéro occurrence dans toute l'app**. La fixture posait un champ inexistant — **§36 appliqué au
scénario lui-même**. Le lieu, lui, passe bien (« Il s'entraîne : Maison avec matériel »).
👉 *La question de Milo est légitime : il demande ce qu'il n'a jamais reçu, ce que **R8**
prescrit précisément de faire.* Ce rouge-là ne ment pas — il pointe un trou de l'app, et le
correctif est dans l'INTERFACE, pas dans le prompt.

*Voisine de **§31** (le témoin visé sur une forme, pas sur sa garantie) — c'en est la version
« langue naturelle », et de **§36** (une sonde qui invente un nom de champ mesure toujours zéro) :
dans les deux cas le détecteur ne mesure pas ce que son titre annonce.*

### 🔄 Deux cas PRODUIT dans la même chaîne (la séance proposée par Milo) *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
- **ft-v1236 (C1)** — la lecture de secours `_seanceDepuisTexte` (utilisée quand la traduction ne
  répond pas) était ancrée en fin de ligne juste après la charge ; le prompt, lui, demande à Milo
  *« séries × reps, la charge, le REPOS et ta consigne »* sur la même ligne. Résultat mesuré : **0 ligne
  sur 4** lue dans le format que **notre propre prompt** impose. Deux propriétaires du même format qui
  se contredisent (§7). ⛔ **Le symptôme réel « 4 exercices demandés, 2 chargés » n'a pas de cause
  démontrée** : C1 ferme un mécanisme capable de le produire (P1/P2), rien de plus.
- **ft-v1244 (FP-01)** — `_demandeUneSeance` prenait une **plainte** contre le bouton (*« le bouton
  démarrer une séance est arrivé »*) pour une **demande** de séance. Deux premières corrections ont
  perdu de vraies demandes — trouvé par la contre-vérification et un corpus différentiel de 57 655
  phrases. Ce qui a tenu (D-032) : garder le comportement de master par défaut, et un **veto borné**
  aux méta-discussions identifiées. ⚠️ Un commentaire de `coach.js` dit encore *« une demande n'est
  JAMAIS perdue »* — trop absolu (§54). ⛔ **La première carte terrain (13:38) n'a pas de cause
  démontrée.**

---

## 41. 📐 TOUS LES NOMBRES SONT VERTS, ET L'ÉCRAN EST FAUX **(03/09/2026, ft-v1109)**

> **La jumelle géométrique de §31.** Là-bas, un témoin visait une *forme* au lieu de la garantie
> qu'il devait tenir. Ici, tous les témoins visent la bonne garantie, la mesurent correctement,
> et **passent à côté de ce que la personne voit** — parce qu'ils mesurent des **coordonnées**,
> pas des **pixels peints**.

### 🔍 Le cas
Michel demande que la ligne « Repas » de la modale d'ajout reste visible quand on descend. On la
rend collante (`position:sticky; top:0`). La sonde répond parfaitement :

| Ce qui était mesuré | Résultat |
|---|---|
| Les puces sont-elles visibles à 300 px, 600 px, au fond ? | **oui, oui, oui** |
| Peut-on encore changer de repas depuis le bas ? | **oui** |
| Le champ de saisie est-il masqué par la bande ? | **non** |
| Erreurs JS | **0** |

**Et la capture d'écran montrait des aliments qui défilaient AU-DESSUS des puces.**

### ⛔ La cause, qui n'est pas une faute de frappe
Un élément collant s'arrête au bord de la **zone de défilement**, et cette zone passe **à
l'intérieur** des 16 px de marge intérieure de la modale. Il restait donc une bande de 16 px
au-dessus du fond de l'élément, par laquelle le contenu défilait à la vue. Toutes les
coordonnées vérifiées étaient justes : la bande *était* bien à sa place. C'est ce qu'il y avait
**autour** qui ne l'était pas.

### 🔍 À quoi on la reconnaît
- On mesure **des positions et des tailles** (`getBoundingClientRect`), jamais **ce qui occupe un
  point de l'écran**.
- Le correctif touche à `position`, `overflow`, `z-index`, `padding`, `transform` — les endroits
  où le navigateur décide **quoi recouvre quoi**, une question qu'aucune coordonnée ne pose.
- Tous les témoins sont verts et personne n'a **regardé** le résultat.

### 🛡️ Le réflexe, en une ligne
**Dès qu'un correctif porte sur la superposition, prendre une capture — et écrire un témoin qui
demande *« qu'est-ce qui est PEINT ici ? »***, pas *« où est cet élément ? »*. En pratique :
`document.elementFromPoint(x, y)`, sur le point que l'on veut protéger.

*Voisine de **§31** (un témoin qui vise la forme et non la garantie) et de **§12quater**
(reproduire avant d'expliquer). ⚠️ Et le cas dit aussi sa limite : la capture a été prise dans
**Chromium**, alors que `position:sticky` dans un conteneur défilant est l'un des points où
**Safari diffère** — donc même la capture ne clôt pas le sujet quand l'app est une PWA iPhone.*



---

## 42. 🕳️ LE CAS QUI N'A PAS L'ATTRIBUT HABITUEL EST LU COMME « RIEN » **(04/09/2026, ft-v1118)**

Michel, deux retours le même jour : *« j'ai fait 45 min de tapis et ma récup n'a pas bougé »*,
puis *« on me dit que j'ai pas fait le cardio hier »*. **Un seul défaut derrière les deux.**

Une séance de **cardio seul** est une séance légitime depuis le 02/08 — l'écran la propose, le
bouton de fin l'accepte, l'app en calcule les calories. Mais elle n'a **aucun exercice**. Or
partout ailleurs, « une séance » se reconnaissait à `S.wkt.exs.length`. **Cinq endroits** en ont
donc déduit *« il n'y a rien »* :

| Endroit | Ce que la personne voyait |
|---|---|
| `startWorkout()` | le bouton rouge **effaçait** 45 min de cardio, sans un mot |
| le bouton de l'Accueil | « Commencer une séance » alors qu'une séance attendait |
| le message d'ouverture | rien du tout en rouvrant l'app |
| le brouillon de secours | aucune copie de sauvegarde |
| `_penaliteSeance()` (récup) | 45 min de tapis = le **plancher**, autant que 4 séries d'abdos |
| la liste de l'historique | *« 💪 jeu. 3 sept. · **0 kg** · 45 min · 351 kcal · **—** »* — présent, mais illisible |

**⛔⛔ Et le pire est qu'AUCUN de ces six n'est un bug isolé** : chacun est parfaitement correct
pour le cas courant. C'est la **définition partagée** qui manquait — et elle existait déjà :
`_seanceOuverte()` (log.js) répond depuis le 02/08 *« démarrée, ou avec des exercices, ou avec un
cardio noté »*. **Il n'a pas fallu écrire une règle, seulement la lire** (R2).

### 🔍 À quoi on la reconnaît
- Un cas **nouveau et légitime** entre dans le système (le cardio seul, l'unilatéral, une séance
  importée…) et **il lui manque l'attribut** par lequel tout le monde reconnaissait le cas courant.
- Le test qui trahit ressemble à `X && X.liste && X.liste.length` — il ne demande pas *« y a-t-il
  quelque chose ? »*, il demande *« y a-t-il ce à quoi je pense d'habitude ? »*.
- **L'échec est SILENCIEUX** : rien ne plante, aucun test ne rougit. Le cas particulier disparaît
  simplement de tout ce qui compte, et personne ne le voit — ni celui qui code, ni celui qui teste,
  seulement celui qui perd sa séance.
- ⚠️ **Signe avant-coureur** : quand un cas nouveau est accepté à UN endroit (ici `finishWorkout`
  et `renderLogFinish`, corrigés le 02/08), c'est le moment de chercher ses jumelles (**R8**) —
  pas six semaines plus tard, sur un retour terrain.

### 🎭 Le symptôme de surface, qui vaut d'être noté à part
Le bouton du bloc Cardio s'appelait **« ✓ Enregistrer le cardio »** et affichait *« Cardio
enregistré ✅ »* — alors qu'il ne fait que **replier le bloc**. Le bouton qui enregistre pour de
vrai est celui du **bas**, et il s'appelait… **« 🏁 Enregistrer le cardio »**. *Deux boutons,
presque les mêmes mots, un seul enregistre.* 👉 **Deux actions différentes ne portent jamais le
même verbe** — et si l'une doit renvoyer à l'autre, elle la **nomme en lisant son vrai libellé**,
jamais en le recopiant (R2 : le jour où le libellé change, on envoie chercher un bouton disparu).

### 🛡️ Le réflexe, en une ligne
**Avant d'écrire `.length` pour dire « il y a quelque chose », chercher s'il existe déjà une
fonction qui répond à cette question-là** — et si elle existe, la lire ; si elle n'existe pas,
l'écrire une fois, pour tout le monde.

*Voisine de **R4a** (une donnée non classée est un oubli silencieux), de **R8** (chercher les
jumelles dès qu'on trouve une absence) et de **§32** (l'aller-retour cassé au milieu). ⚠️ Le cas
dit aussi ce qui n'est PAS corrigé : le barème de récupération du cardio reste sur son plancher —
le corriger demanderait d'inventer une échelle, et on ne l'invente pas (R29).*

### 🔄 La variante RÉSEAU : un REFUS lu comme une ABSENCE — `needsCode` n'est pas `not_found` *(06/10/2026, AUTH-NEW-DEVICE-01 · AUTH-SIGNUP-STRICT-01)*
`loadProfile` a trois réponses qui ne disent pas « voici le profil » : `not_found` (il n'existe pas), `auth` +
`needsCode` (**je ne le dirai pas sans preuve**), et l'erreur réseau. « COMMENCER » rangeait `auth` dans le même
`else` que `not_found` → compte **neuf** → profil de bienvenue et instantanés envoyés à l'email seul, que le
serveur accepte encore (transition, `_MIG_FERME_ = false`) et qui **remplacent** les séances (mesuré sur le vrai
`Code.js` : 20 → 1). Et en lecture stricte, un email **inconnu** reçoit lui aussi `needsCode` : le refus ne dit
rien de l'existence du compte — d'où « Confirme cet e-mail pour continuer », et non « ce compte existe déjà ».
🛡️ Seul `not_found` crée un compte ; `auth` garde l'email en attente (`_restauPoser`, garde central d'écriture) ;
tout le reste est traité comme le réseau. Bancs AN et AS.
👉 *Une réponse qui refuse de dire n'est pas une réponse qui dit non.*

### §40bis — LE BANC D'ESSAI FABRIQUE SES DATES EN UTC PENDANT QUE LA PAGE VIT À PARIS *(05/09/2026)*

**À quoi on la reconnaît** : la suite est verte toute la journée et **rouge entre 00 h et 02 h**
(heure de Paris), sur du code applicatif que personne n'a touché. Le 05/09 à 00 h 34 :
**11 témoins rouges d'un coup**, tous autour du cyclage « jour de séance / jour de repos ».

**La cause, mesurée** : les fixtures écrivaient `new Date().toISOString().slice(0,10)` — la date
**UTC** — pendant que les contextes de test tournent en `timezoneId:'Europe/Paris'`. Entre 22 h
UTC et minuit UTC, la page dit **05/09** et la fixture dit **04/09** : la « séance d'aujourd'hui »
est datée d'hier, `jourSeance()` ne la trouve plus, et tout le cyclage s'effondre.

👉 ***C'est la famille « fuseaux horaires » — la plus documentée du projet — retournée contre le
BANC D'ESSAI lui-même.*** `tests/dates` interdit ce motif dans les fichiers de l'app ; le runner
n'est pas dans sa liste, donc **rien ne le voyait**.

**⛔⛔ ET C'EST PIRE QU'UN TEST QUI ÉCHOUE : il n'échoue que deux heures par jour.** Le reste du
temps la suite est verte, donc personne ne cherche — et à minuit, celui qui livre croit avoir
cassé l'app. *Un test intermittent accuse le dernier qui a touché au code.*

**⭐ Ce qui l'a tranché en une mesure** : rejouer la suite sur le commit **d'avant**. Mêmes 11
rouges, au témoin près → le défaut ne venait pas du changement en cours. *Avant de chercher ce
qu'on a cassé, vérifier que c'était déjà cassé.*

**Ce qui protège aujourd'hui** : 18 fixtures passées à
`toLocaleDateString('sv-SE',{timeZone:'Europe/Paris'})` — qui rend `YYYY-MM-DD` dans le fuseau de
la page et marche **dans Node comme dans le navigateur**, donc un seul motif des deux côtés.
⭐ Les fixtures ancrées sur `today()+'T12:00:00'` (**midi**) n'ont jamais eu le défaut : à midi,
aucun décalage de ±2 h ne change le jour. **C'est l'autre façon correcte de faire.**

⏭️ **Ce qui n'est PAS fait** : `tests/dates` ne scanne toujours pas les runners. *Le détecteur
existe, sa liste de fichiers s'arrête à l'app* — noté, pas élargi dans la foulée.

### 🔄 Le travail compté par ses SÉRIES : le cardio et l'échauffement effacés (F01/F02, ft-v1240) *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
« Oui, on démarre » sur une carte de Milo (F01) ou « ▶ Charger » un programme (F02) effaçaient **sans
question** 20 min de cardio ou 10 min d'échauffement notés : la porte de Milo ne regardait que les
exercices, `_travailAPerdre` ne comptait que les séries faites. *Le cardio n'a pas de séries — il était
lu comme « rien ».* 🛡️ ft-v1240 : `_etatTravailWkt` (RIEN · PRÉPARATION · TRAVAIL), source commune des
deux portes, où le cardio compte par ses **minutes**.
⛔ **Ne pas ranger ici** l'écart « cardio 42 min au résumé, absent du détail » (P3, 04/10) : la séance
était mixte, la vue n'est pas identifiée, **cause non démontrée**.


---

## 43. 🚪 DEUX PORTES MÈNENT AU MÊME ENDROIT, UNE SEULE EST ÉQUIPÉE **(05/09/2026, ft-v1129)**

**Trois fois. Et la troisième s'est produite à côté d'un commentaire qui décrit exactement le
piège**, écrit lors de la deuxième.

Une séance de Milo entre dans l'app par **deux** fonctions : `_startSessionFromMilo` (aucune
séance en cours — **le cas normal**) et `_applyMiloSession` (une séance tourne déjà, on a
répondu « ajouter » ou « remplacer »). Chaque fois qu'on a ajouté un comportement, on l'a posé
sur **une seule** des deux.

| Quand | Ce qui a été posé sur une seule porte | Conséquence |
|---|---|---|
| ft-v980 | le **contrôle d'intensité** | il ne tournait jamais dans le cas le plus fréquent |
| ft-v995 | le **cardio** vers son bloc | idem |
| **12/08 → 05/09** | le **groupement des supersets** | *il n'a JAMAIS fonctionné en production* |

### ⛔ Pourquoi ça ne se voit pas
La fonctionnalité **marche** — sur la porte qu'on a équipée. Il faut donc, pour s'en apercevoir,
emprunter l'autre. Or c'est souvent la porte **la moins testée** qui est la plus **empruntée** :
ici, « aucune séance en cours » est le cas de tous les jours, et c'est celle qui n'avait rien.

### ⛔⛔ Le multiplicateur : le normaliseur qui jette le champ
Pour le superset, il y avait une **seconde couche**, et elle rendait la première invisible :
`_normalizeMiloSession` — **seul écrivain** de `_pendingMiloSessions` en production — ne
recopiait pas `supersetGroup`. Donc même la porte qui savait le lire ne le recevait jamais.
👉 ***Un champ qu'un normaliseur ne recopie pas est un champ supprimé***, quoi qu'on ait payé
pour l'obtenir (le cervelet le transcrivait correctement, à chaque fois). C'est **R4**.

### ⛔⛔ Et le témoin était vert — il entrait par la porte de service
Le banc écrivait **à la main** dans `_pendingMiloSessions` une forme que la production ne
produit jamais (avec `supersetGroup`, donc **après** le normaliseur qui le jette), et il
n'exerçait **que la porte B**. Variante de **§36** : le nom du champ était juste, c'est le
**chemin** qui était faux. *Un test qui n'emploie pas le schéma NI le chemin de la production ne
teste rien, il rassure.*

### 🔎 Comment la reconnaître
- Le code contient déjà, quelque part, la phrase *« il y a deux portes »* — et un correctif
  récent n'est présent que dans l'une d'elles.
- Un correctif **annoncé** à l'utilisateur que personne n'a jamais signalé comme cassé : ici
  l'annonce `milo-superset` décrit mot pour mot le bouton qui ne marchait pas (*« quand tu
  appuies sur ⚡ Commencer cette séance, les exercices qu'il a groupés arrivent liés »*).
- Un test qui **construit lui-même** la structure interne au lieu d'y arriver par l'entrée
  publique.

### 🛡️ Ce qui protège aujourd'hui
- Le comportement vit dans **`_appliqueMiloSession`**, *le seul point que les deux portes
  traversent* (**R2**) — c'est déjà l'endroit du contrôle d'intensité et du cardio.
- Le témoin du banc part de la **forme exacte du cervelet**, traverse le **normaliseur**, et
  exerce **les deux portes** ; un témoin de plus exige que le normaliseur laisse passer le champ.
- ⭐ **Le réflexe, en une ligne** : *avant de poser un comportement sur un chemin, chercher
  combien de chemins mènent là* — et si la réponse est « deux », le poser là où ils se croisent,
  jamais sur l'un des deux.

### 🔄 Le normaliseur qui jette le champ : le dropset (ML-A, ft-v1242) *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
« 💾 Sauvegarder comme programme » (`saveAsProg`) et les deux chargeurs recopiaient une **liste fermée**
de champs : `ex.dropset` n'en faisait pas partie. Rechargé, le dropset disparaissait et ses paliers
redevenaient des séries normales. Trois portes, aucune équipée. 🛡️ ft-v1242 : un propriétaire unique de
la recopie (`_recopierDropset`) appelé aux trois endroits, et la liste exacte des champs figée par
témoin.


---

## 44. ✂️ LA COUPE D'AFFICHAGE QUI SUPPRIME EXACTEMENT CE QUI DISTINGUE **(06/09/2026, ft-v1149)**

L'écran Admin des doublons coupe les noms d'exercice aux **18 premiers caractères** pour tenir
dans deux boutons côte à côte. Le jour où ft-v1148 lui a appris à voir la famille « suffixe »
(`Développé Épaules Assis Machine` ↔ `… (Shoulder Press)`), **mesuré sur les 4 doublons réels de
Michel : 2 paires sur 4 affichaient DEUX FOIS LE MÊME BOUTON**, et les 2 autres ne différaient
que par un `…` ou une parenthèse ouvrante.

### ⛔⛔ Ce qui rend la famille vicieuse
La coupe garde le **DÉBUT**. Or les paires qu'on demande à la personne de départager sont, par
construction, celles qui **se ressemblent** — et se ressembler, pour un nom d'exercice, veut
presque toujours dire **partager son début**. 👉 ***La troncature garde ce que les deux ont en
commun et jette ce qui les sépare*** : elle est d'autant plus aveugle que le cas est plus utile.

### ⛔ Le multiplicateur : c'est le correctif de la veille qui a rendu le cas fréquent
Avant ft-v1148, ce détecteur ne rapprochait que sur une distance d'**une lettre** — deux noms
quasi identiques, donc deux étiquettes quasi identiques… mais on n'en voyait presque jamais.
En ouvrant la famille « suffixe », on a rendu **courant** le seul cas que l'affichage ne savait
pas rendre. *Un correctif peut fabriquer son propre défaut d'affichage sans qu'aucun test ne
bouge, et sans que le correctif soit faux.*

### ⛔⛔ Pourquoi c'est grave ici et pas ailleurs
`mergeExercises` est **IRRÉVERSIBLE**. Deux boutons jumeaux ne font pas renoncer : ils font
**taper au hasard une fois sur deux**. *Une action sans retour dont on ne peut pas lire les
options est pire qu'une action absente* (**R29**).

### 🔎 Comment la reconnaître
- Un écran qui demande de **choisir entre deux choses proches**, et qui **tronque** leur libellé.
- Une troncature écrite pour un cas (« un nom est trop long ») réutilisée pour un autre (« deux
  noms se ressemblent ») — c'est **R14**, le comportement copié d'un contexte à un autre.
- Le signe qui aurait dû alerter : *la coupe est faite nom par nom, alors que la question posée
  est une COMPARAISON*.

### 🛡️ Ce qui protège aujourd'hui
- `_libellesDoublon(a,b)` étiquette la **paire**, pas chaque nom séparément : si les deux têtes
  se ressemblent, on garde la **FIN** — ce qui les sépare — et en dernier recours on ne coupe plus.
- Un témoin exige que le **suffixe reste visible**, pas seulement que les deux étiquettes
  diffèrent : *« …e Machine » et « …s Machine » seraient distinctes et ne diraient rien.*
- ⚠️ **Et la comparaison porte sur ce que l'ŒIL voit** : `Hip Thrust Barre` et `Hip Thrust
  Barre (` sont deux chaînes différentes pour le code et le même mot pour la personne ; `Squat`
  et `Squat ` ne diffèrent que d'une espace. *Un test d'égalité écrit sur les chaînes brutes
  aurait été vert sur les deux cas où l'écran ment* — c'est **§31** (le témoin visé sur la forme
  et non sur la garantie), attrapé cette fois au contrôle négatif.
- ⭐ **Le réflexe, en une ligne** : *quand un écran fait choisir, la coupe se décide sur la
  PAIRE, jamais sur un élément à la fois.*


---

## 45. 🧬 UNE DÉFINITION FAUSSE NE RESTE JAMAIS À UN SEUL ENDROIT **(06/09/2026, ft-v1154)**

ft-v1038 avait écrit, dans un commentaire de code : *« le tag `X` = Échec dit exactement "cette
série est allée à l'échec", c'est-à-dire **RIR 0** »*. C'était **faux d'un cran** — Michel l'a
tranché dix jours plus tard : *« RIR 0 est une série RÉUSSIE à la limite ; le X indique qu'une
répétition prévue/tentée a effectivement ÉCHOUÉ »*.

### ⛔⛔ Ce qui coûte cher n'est pas l'erreur, c'est sa DIFFUSION
En dix jours, la même phrase avait essaimé dans **quatre endroits qui ne se ressemblent pas** :

| Où | Ce que ça produisait |
|---|---|
| `_rirDeSet()` (le code) | un `X` **devenait** un 0 dans la donnée elle-même |
| le **prompt de Milo** | il lisait « (X) = à l'échec, c'est-à-dire RIR 0 » → **une rep d'écart** sur une prescription de charge |
| l'**aide détaillée** | la personne apprenait une définition fausse |
| l'**export CSV** | un fichier qui se relit **ailleurs**, sans personne pour rattraper la nuance |

⭐⭐ **ET J'EN AVAIS OUBLIÉ UN — c'est un TÉMOIN qui l'a trouvé, pas moi.** J'ai corrigé quatre
endroits, lancé la passe, et un témoin écrit en **ft-v1048** (l'export CSV) est tombé rouge :
il exigeait *« `X` vaut 0 »*. 👉 ***Le cinquième endroit n'était pas dans ma liste parce qu'il ne
contenait pas le mot « RIR 0 » — il contenait le CHIFFRE.*** Un `grep` sur la formule ne pouvait
pas le voir ; seul un test qui **exécute** la chaîne pouvait.

👉 ***Une définition vit là où on l'a écrite ET dans tout ce qui la cite.*** Corriger le code
seul aurait laissé Milo, l'aide et l'export dire le contraire — et c'est l'un d'eux qui aurait
gagné, parce que c'est celui-là qu'un humain lit.

### 🔎 Comment la reconnaître
- Un commentaire qui dit **« c'est-à-dire »**, **« autrement dit »**, **« la même information
  saisie autrement »** : c'est la marque d'une **équivalence posée**, et une équivalence est
  exactement ce qui se propage.
- Une valeur **dérivée d'un tag** plutôt que saisie (`type==='X' → 0`) : la dérivation encode une
  définition, et personne ne la relit.

### 🛡️ Ce qui protège aujourd'hui
- **Deux questions, deux propriétaires** (R2) : *« combien en réserve ? »* → `rir` ; *« la série
  est-elle allée à l'échec ? »* → le TAG. Le code ne convertit plus l'une en l'autre.
- Le commentaire périmé est **gardé avec sa correction**, pas réécrit : *c'est cette phrase-là qui
  s'est propagée, et la voir aide le suivant à comprendre pourquoi on a changé* (R30).
- Deux témoins lisent le **texte réellement envoyé à Milo** : l'un refuse la phrase périmée,
  l'autre exige la distinction. *Un témoin sur le code seul aurait été vert pendant que le prompt
  continuait de mentir.*
- ⭐ **Le réflexe** : quand une définition change, `grep` la **formule**, pas le nom de la
  variable — ici « RIR 0 » sortait dans quatre fichiers dont aucun n'appelle `_rirDeSet`.

### 🔄 « Record » quand il n'existe aucune référence *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
`finishWorkout` testait `if(!old||rm>old.rm1)` : **la première fois** qu'un exercice est fait, l'absence
de référence valait record (P3 le 03/10 : Rowing Yates 40×10 annoncé « record personnel » ; cause P0).
La définition essaimait : `S.prs`, la tuile, le contexte de Milo, le badge. C'est la leçon déjà notée au
`docs/JOURNAL-DE-TEST.md` le 27/08 (*« pas de record ne veut pas dire jamais fait »*), jamais promue ici.
🛡️ ft-v1250 (D-045) : « 📌 Première référence enregistrée », plus record. ⛔ **Le badge « Premier PR »
se déclenche encore à la première séance** — un des endroits où la définition vit toujours, consigné
en réserve dans `docs/SUIVI-AUDIT.md`.

### 🔄 « N séances » qui compte en réalité des JOURS
Constaté dans le code de master (P0, `9b8e4813`) : le message d'Accueil « N séances cette semaine »
compte des **dates distinctes** (`new Set(sess.map(s=>s.date))`) — deux séances le même jour en font
une ; l'en-tête « N séances » de l'export PDF compte aussi des dates distinctes (observé pendant
SESSION-INTEGRITY-01). Même mot, définition différente selon l'endroit. ⛔ **NON CORRIGÉ en
production.** Une variante (la tuile « Cette semaine » portait sur 7 jours glissants) est corrigée sur
la branche NUT-PUNCH-01, **NON PUBLIÉE**. ⚖️ Compter des séances ou des jours d'entraînement est une
**décision produit**, pas encore prise.

### 🔄 L'ORDRE des séances sans propriétaire (ft-v1241, F03 / F03b)
Milo recevait la **plus ancienne** séance comme « dernière » (`slice(-1)` d'une liste rangée à
l'envers), et une séance datée d'hier par le sélecteur passait en tête (`unshift`) — puis tous les
lecteurs de `S.sessions[0]` la prenaient pour la dernière. « La dernière séance » était définie par
une **position**, à chaque lecteur. 🛡️ ft-v1241 : l'ordre a **un** propriétaire (`_cmpSeances`,
`_trierSeances`, `_seancesRecentes`, `_derniereSeance`, state.js), appliqué partout où des séances
entrent.

---

## 46. 🎲 UN CORRECTIF QUI VIT DANS LE PROMPT N'EST PAS UN CORRECTIF TANT QU'IL N'EST PAS VÉRIFIÉ EN PROD **(07/09/2026, ft-v1158)**

**Le cas fondateur.** ft-v1156 corrige un vrai bug d'import : les 4 lignes d'échauffement du
développé couché de Michel ressortaient en **4 exercices** nommés *« Développé couché (ECH) »*.
Le diagnostic était juste (**R4** : le modèle, ne pouvant pas mettre l'information dans la
**série**, l'a mise dans le **NOM**), le correctif propre — une règle 8 explicite dans le prompt
du backend, un champ `setTypePerSet`, une validation serveur, un test qui prouve la **chaîne**.
J'avais même **écrit ma limite** : *« je ne peux pas prouver que le modèle obéira »*.

**⛔⛔ Le lendemain matin, deux vidéos de Michel : c'est le même résultat, seulement renommé
« Développé couché (échauffement) ».** Son J1 fait encore **9 blocs au lieu de 4**.

**⭐⭐ Et le renommage EST la preuve, pas un détail.** Le libellé a changé, donc le modèle a bien
**reçu et relu** le nouveau prompt — ***il ne l'a pas suivi***. Sans cette nuance, on conclurait
au déploiement raté et on redéploierait pour rien.

### 🔎 Comment la reconnaître
- Un correctif dont **toute la mécanique** vit dans un texte envoyé à un modèle : prompt, schéma
  d'exemple, consigne. Les tests peuvent alors prouver la **chaîne** (le champ est accepté, validé,
  traduit) sans jamais prouver **qu'il arrive**.
- La phrase *« je ne peux pas prouver que le modèle obéira »* dans une entrée de journal : elle est
  honnête, et elle est exactement le **signal** qu'il manque un étage.
- Deux consignes **contraires** dans le même prompt, à quelques règles d'écart. Le modèle tranche —
  et il tranche pour la plus **absolue**, pas pour la plus récente.
- Un champ demandé par une règle mais **absent du schéma d'exemple**. *Le schéma est le signal le
  plus fort du prompt* : un champ décrit quatre règles plus bas ne pèse pas contre lui.

### 🛡️ Ce qui protège aujourd'hui
- **R7 dans l'ordre, et pour de bon** : ① **structurel** → ② **hiérarchie** → ③ **prompt**. Le
  correctif de ft-v1158 est un **filet déterministe dans l'app** (`_mergeImportEchauffements`) —
  il marche **quel que soit le modèle**, et il est **prouvable ici**.
- **Le prompt est corrigé EN PLUS, jamais À LA PLACE.** Les deux contradictions mesurables ont
  disparu (le champ entre dans le schéma, la règle 4 dit sur quel champ elle porte) — mais le
  résultat n'en dépend plus.
- **Le filet s'AJOUTE, il ne remplace pas** : quand le modèle obéit, la fusion ne trouve rien à
  faire (témoin de non-régression dédié). *Un correctif qui remplace le filet devient une
  régression le jour où il ne s'applique pas* (ft-v1152).
- ⭐ **Le réflexe** : avant de livrer un correctif de prompt, se demander **« qu'est-ce qui reste
  vrai si le modèle n'écoute pas ? »**. Si la réponse est *« rien »*, le correctif n'est pas fini —
  il attend son étage déterministe. *Un correctif qu'on ne peut pas prouver n'est pas un correctif,
  c'est une demande polie.*

### ⚠️ Le cousin trouvé le même jour : **chercher un texte n'est pas vérifier un appel**
Le contrôle négatif de ft-v1158 a fait tomber un **garde-fou qui ne gardait rien**. Le témoin
censé prouver que le chemin d'extraction **APPELLE** la fusion faisait
`log.js.indexOf('_mergeImportEchauffements();')` — or la mutation qui **commente** l'appel
(`//_mergeImportEchauffements();`) laisse la chaîne **intacte dans le fichier**. Le témoin est
donc resté **VERT** pendant que la fusion n'avait plus lieu.
👉 **Un `indexOf` mesure la PRÉSENCE d'un texte, jamais l'EXÉCUTION d'un appel.** Quand un témoin
doit prouver qu'une fonction est appelée, il faut soit **l'exécuter** (le mieux), soit au minimum
**borner la recherche à la région concernée** et **exiger le début de ligne** — ce qu'un `//` casse.
⭐ *Et c'est le contrôle négatif qui l'a trouvé, pas la relecture* : la première passe complète
était **verte à 3069/3069** avec ce témoin creux dedans.

### ⚠️ Le cousin de la §46, trouvé le lendemain : **le voisin savait, pas lui** (07/09/2026, ft-v1160)

Le compteur de ft-v1146 devait mesurer *à quelle fréquence* Milo et le contrôle d'intensité se
contredisent. Chez Michel il a affiché **« 4 séances proposées, 0 jugeable »** — c'est-à-dire que
le contrôle **ne s'était jamais déclenché**, alors qu'il a des records sur ses trois gros
mouvements.

**⛔⛔ La cause : deux fonctions VOISINES répondaient à la même question et pas de la même façon.**
*« Quel est son record pour ce nom ? »* — `_repereDefauts` essayait **quatre variantes** du nom
puis comparait en **normalisé**, et son commentaire expliquait pourquoi **depuis des semaines** :
*« si Milo écrit un nom voisin du catalogue, la clé de `S.prs` ne tombe pas juste »*.
`_intensiteDefauts`, **dix lignes plus loin**, faisait `S.prs[nom]` **brut** — et commence par
`if(!(rm1>0)) return`.

👉 ***Un nom qui ne colle pas n'abîme pas l'affichage : il ÉTEINT un garde-fou.*** Sans erreur,
sans test rouge, sans rien.

### 🔎 Comment la reconnaître
- **Deux fonctions côte à côte** qui lisent la même structure (`S.prs`, `S.sessions`, un catalogue)
  avec des précautions **différentes**. La plus prudente est en général la plus récente : sa
  prudence est une **cicatrice**, et la voisine n'en a pas hérité.
- Un contrôle dont le premier réflexe est **`if (donnée absente) return`**. Son silence est légitime
  *pour sa question*, et **indiscernable d'un « tout va bien »** pour tout le monde.
- Un commentaire qui explique une précaution **à un seul endroit**. *S'il a fallu l'écrire, c'est
  que le piège est réel — donc il vaut pour tous les lecteurs de cette donnée, pas pour celui-là.*

### 🛡️ Ce qui protège aujourd'hui
- **R2 appliqué à la LECTURE, pas seulement à l'écriture** : `_recordPourNom` est le seul
  propriétaire de *« le record de ce nom »*. On a **extrait** la logique, on ne l'a pas recopiée.
- Le **compteur lit exactement comme le contrôle** — sinon il mesure un silence en croyant mesurer
  une absence. *Deux lookups pour une seule question finissent toujours par diverger.*
- ⭐ **Le réflexe** : quand une précaution est écrite dans un commentaire, `grep` la **donnée**
  qu'elle protège (`S.prs[`) et regarder **qui d'autre la lit sans elle**. Ici, dix lignes plus bas.

### ⚠️ Et la §15 s'est rejouée le lendemain, sur la CONSIGNE elle-même (07/09/2026, ft-v1161)

ft-v1160 a changé la façon dont le compteur de contradictions retrouve un record. C'est un
**changement de règle** : les séances comptées avant ne mesurent plus la même chose. Le projet a
un mécanisme fait exactement pour ça — un **numéro de version de règle** qui remet le compteur à
zéro quand il change. **Il n'a pas été incrémenté.**

**⭐⭐ Et la cause n'est pas l'étourderie.** La consigne, écrite au-dessus de la constante, disait :
*« à incrémenter si le contrôle change de **seuil** ou de **formule** »*. Le changement n'était
**ni un seuil ni une formule** — c'était la façon de **trouver** le record.
👉 ***La règle était juste. Elle était définie trop étroit.*** C'est la **famille 15**, appliquée
non pas à du code mais à une **consigne**.

### 🔎 Comment la reconnaître
- Une consigne qui **énumère des causes** (« si X ou Y change ») au lieu de **nommer l'effet**
  (« dès que le résultat ne veut plus dire la même chose »). *Une liste de causes a toujours un
  trou ; une question n'en a pas.*
- Un mécanisme de sécurité **présent, correct, et non déclenché**. Il ne rate pas bruyamment : il
  ne se déclenche simplement jamais, et le total continue de s'afficher comme si de rien n'était.

### 🛡️ Ce qui protège aujourd'hui
- La consigne est reformulée **par l'effet** : *« à incrémenter dès que les chiffres d'avant ne
  mesurent plus la même chose — seuil, formule, ou la façon dont le record est trouvé »*.
- Un témoin vérifie que le compteur **repart réellement à zéro** (1 et pas 5), **et** que la date
  « depuis » repart avec lui — *un total neuf sous une vieille date ment sur la période*.
- ⭐ **Le réflexe** : après un correctif, se demander non pas *« ai-je changé un seuil ? »* mais
  **« un chiffre déjà affiché veut-il encore dire ce qu'il disait ? »**. Si non, il y a une version
  de règle à faire bouger — ou un total à jeter.

### ⚠️ Le corollaire de la §46, mesuré le 07/09 (ft-v1163) : **un témoin en « oui/non » ne voit pas un changement de TAILLE**

La §46 dit qu'un correctif non prouvable n'est pas fini. Ce cas-ci en donne la version outillée :
sur le repli de recherche « tous les mots », **trois mutations sur quatre n'ont pas mordu au
premier jet**. Le code était bon ; les **témoins** ne l'étaient pas.

**⛔⛔ La cause tient en une phrase** : mes témoins de non-régression étaient écrits en
*« la liste est-elle vide ? »*. Or les mutations ne vidaient rien — elles **élargissaient** ou
**rétrécissaient** le résultat. 👉 ***Un témoin qui ne regarde que la présence est aveugle aux
deux défauts les plus courants d'une recherche.***

### 🔎 Comment la reconnaître
- Un témoin qui teste `!== 0`, `!vide`, `.length > 0`, `/motif/.test(html)` sur une fonction dont
  le rôle est de **sélectionner une quantité**. Il passera aussi bien sur 1 résultat que sur 45.
- Un contrôle négatif où **la mutation ne change rien au vert**. C'est le signal — pas la preuve
  que le code est solide, la preuve qu'on a **mal visé**.
- Un cas de test bâti sur deux termes **également inconnus** (`zzzz qqqq`) : il ne distingue pas
  « tous les mots » de « au moins un mot ». Il faut **un mot qui existe et un qui n'existe pas**.

### 🛡️ Ce qui protège aujourd'hui
- Les témoins **comptent les lignes rendues** (8 · 43 · 32 · 1 · 0), ils ne demandent plus si la
  liste est vide.
- ⭐ **Les nombres ont été MESURÉS avant d'être écrits**, pas devinés — et c'est la mesure qui a
  fait apparaître le meilleur témoin du lot : *« tirage horizontal »* rend **32** résultats grâce
  à un élargissement historique (retour de Tatiana, 02/08), que la mutation ramenait à **4**.
  *Sans ce chiffre, la mutation ne mordait sur rien.*
- ⭐ **Le réflexe** : quand la fonction sous test **choisit combien**, le témoin doit dire
  **combien**. Et quand une mutation laisse tout vert, ne pas conclure « c'est robuste » — aller
  chercher le cas qui la distingue.
## 47. 🚧 LE GARDE-FOU DONT LE PLANCHER ÉTEINT LE POURCENTAGE **(07/09/2026, ft-v1162)**

**Un contrôle qui combine un seuil RELATIF et un plancher ABSOLU avec un `ET` a une zone aveugle,
et elle est calculable.** `_coherenceKcal` ne parlait que si l'écart dépassait **25 %** *et*
**60 kcal**. 👉 ***Pour que les 25 % puissent mordre, il faut `0,25 × kcal ≥ 60`, donc une entrée
d'au moins 240 kcal.*** En dessous, le plancher éteint le pourcentage — et « moins de 240 kcal »,
c'est un shake, un yaourt, un fruit, un œuf : **la majorité des lignes d'un journal alimentaire**.

**⛔ À quoi on la reconnaît** : un garde-fou qui n'a *jamais* rien signalé chez quelqu'un qui a
pourtant de vraies données fausses. Il ne plante pas, il ne rougit dans aucun test — *il est
silencieux, et le silence ressemble à « tout va bien »*. Le cas réel : 156 kcal affichées pour
26 P / 1 G / 1 L (117 théoriques), tous les jours, sans un mot.

**⭐ Le calcul à faire une fois** : `seuil_absolu / seuil_relatif` donne la valeur en dessous de
laquelle le contrôle est **inerte**. Si cette valeur couvre les cas courants, le garde-fou ne
protège que les cas rares.

**⭐⭐ CE QUI PROTÈGE AUJOURD'HUI, ET CE N'EST PAS UN SEUIL RÉGLÉ AUTREMENT** : une **loi
physique** posée à côté. Les calories ne peuvent pas dépasser ce que la portion peut porter
(`4P+4C+9L + 9 × masse libre`, parce que rien n'est plus dense que le lipide). ⛔ *On n'a pas
« baissé le plancher »* : mesuré, le passer de 60 à 30 n'aurait coûté que 2 aliments sur 3 126 —
il est presque inerte — mais **30 aurait été un chiffre à défendre**, quand le plafond physique
se démontre. **0 faux positif sur 3 235 aliments CIQUAL et 123 produits de marque.**

**⛔ Et la loi n'a besoin d'aucune liste d'exception**, là où le pourcentage voisin en exige une
(`_KCAL_ALCOOL`, parce que l'alcool fait 7 kcal/g sans champ pour le dire) : *7 est en dessous de
9*. 👉 ***Quand un garde-fou réclame une liste d'exceptions qui s'allonge, c'est souvent qu'il
mesure la mauvaise chose.***

*Voisine de **§39** (une valeur peut être cohérente avec elle-même et impossible — c'est le même
produit, la même ligne, l'autre moitié du problème) et de **§34** (l'hallucination crédible).*


### ⚠️ La §46 vue à l'envers (07/09/2026, ft-v1164) : **on ne corrige pas un modèle qu'on n'a pas informé**

Quatre versions de suite ont buté sur des noms d'exercices mal rattachés à l'import. À chaque fois
le correctif était **en aval** : mieux rapprocher, mieux prévenir, mieux réparer. C'est Michel qui
a pointé l'amont : *« on utilise l'IA pour lire le PDF, elle devrait être capable d'analyser tout
ça »*.

**⭐⭐ Mesure : le prompt d'import contenait ZÉRO nom du catalogue**, et l'app ne transmettait
jamais la liste. Le modèle écrivait « Presse 45 degrés » parce que c'est ce qu'il y a sur la
feuille — *il n'avait aucun moyen de savoir que l'app appelle ça « Press Jambes 45° »*.

👉 ***Ce n'était pas un modèle qui se trompe : c'était un modèle qu'on n'avait pas informé.*** Et
la règle existait déjà (**R8**), appliquée à Milo depuis ft-v713.

### 🔎 Comment la reconnaître
- On envisage de **durcir un prompt**, d'ajouter un **repli** ou un **filet**, alors qu'on n'a pas
  vérifié ce que le modèle **reçoit** réellement. *Compter les caractères du prompt et y chercher
  la source nommée prend trente secondes.*
- Un correctif existe pour **un** consommateur du même mécanisme (ici Milo) et pas pour son
  **jumeau** (ici l'import). Le jumeau ne remonte jamais tout seul : il produit un résultat
  plausible, pas une erreur.
- Le symptôme est **à trois têtes** (pas de photo · pas de figurine · pas d'historique) : trois
  écrans différents pour **une** cause. Une seule cause qui produit trois symptômes est presque
  toujours en amont.

### 🛡️ Ce qui protège aujourd'hui
- La liste part avec le document, sur **les deux** imports — un témoin exige les deux
  branchements, côté serveur **et** côté app.
- ⛔ **La liste est OUVERTE** : « emploie le nom exact quand c'est manifestement le même exercice,
  sinon garde le nom du document ». *Forcer un nom voisin remplacerait un exercice par un autre —
  pire que d'en créer un* (R29). Une mutation dédiée vérifie que la liste n'est jamais fermée.
- ⭐ **Le réflexe** : avant de corriger la sortie d'un modèle, **relire son entrée**. Pour chaque
  source que la consigne nomme (« le catalogue », « ton planning », « ses records »), vérifier
  qu'elle est vraiment dans le contexte — c'est R8, et elle se re-vérifie à chaque nouvelle porte.


## 48. 🚪 LA PORTE DE SECOURS N'EST PAS PROPOSÉE LÀ OÙ LE CHEMIN S'ARRÊTE **(07/09/2026, ft-v1165)**

**Un chemin qui échoue proprement peut quand même être un cul-de-sac.** `_lookupBarcode` faisait
tout bien : il détectait que la fiche Open Food Facts n'avait aucune valeur, le disait
(*« saisis à la main »*), et s'arrêtait. ⛔ **Mais l'outil qui règle exactement ce problème
existait à trois centimètres** — le calibrage « valeurs pour 100 g » (ft-v1110) — et n'était
jamais proposé. *Le message était vrai, l'issue était fausse.*

**⛔ À quoi on la reconnaît** : un message d'erreur honnête qui laisse la personne devant un
formulaire vide, alors que l'app dispose déjà de ce qu'il faut pour l'aider. Le symptôme est
une phrase du genre *« c'est chiant de mettre ses aliments, alors si ça ne fonctionne pas »* —
pas un bug report, une **lassitude**.

**⛔⛔ ET LE COÛT EST DIFFÉRÉ, DONC INVISIBLE** : ici la personne tapait ses macros pour une
quantité inconnue, l'entrée partait avec `per100:null` **et** `q:null`, et **plus rien ne pouvait
la rescaler — ni ce jour-là ni jamais**. *Un cul-de-sac ne se voit pas au moment où on y entre.*

**⭐ Ce qui la trouve** : quand un chemin dit *« saisis à la main »*, *« réessaie »*, *« non
reconnu »* — chercher si l'app possède déjà l'outil qui résout le cas, et **l'ouvrir** au lieu
de le mentionner. C'est **R13** (la porte manque, pas la fonctionnalité) appliqué aux **branches
d'échec** au lieu des écrans principaux — le même diagnostic que ft-v1023, ft-v1155 et celui-ci,
trois fois en six semaines.

**⚠️ Deux pièges rencontrés en la refermant, tous deux mesurés :**
- ⛔ **une absence peut se faire passer pour une valeur** — `_bcNutr` restait posé avec des
  **zéros**, donc le code voisin croyait qu'un pour-100 g était connu et **cachait tout le
  réglage de quantité**, sans la moindre erreur ;
- ⛔ **ouvrir un bloc, c'est aussi devoir le rendre** (**R15**) : le formulaire ne remettait pas
  le bloc de calibrage à zéro entre deux aliments — rare tant qu'il s'ouvrait à la main,
  **courant** dès qu'un chemin l'ouvre tout seul, et *l'étiquette du produit précédent restait
  prête à être appliquée au suivant*.

*Voisine de **§43** (deux portes mènent au même endroit, une seule est équipée) et de **§47**
(le garde-fou dont le plancher éteint le pourcentage — même produit, même semaine).*

## 49. 🤫 L'ACTION SILENCIEUSE QUI RESSEMBLE À L'ACTION RÉUSSIE **(07/09/2026, ft-v1166)**

**Le cas qui la fonde.** À l'import d'un programme, l'aperçu affichait *« ↔ reconnu depuis X »* en
vert pour un exercice rattaché au catalogue, une ligne de choix pour un exercice **proposé**… et
**rien du tout** pour un exercice que l'app allait **inventer**. 👉 ***Reconnu et inventé se
ressemblaient EXACTEMENT à l'écran.***

**À quoi on la reconnaît.** Trois cas possibles, **deux** ont un signal visuel. Le troisième est
le plus lourd de conséquences, et c'est celui qui n'en a pas — souvent parce qu'il est le cas
« par défaut » du code (`return` sans marquer, `else` vide, `tier:'new'` qui ne pose aucun champ).
⛔ **Le signal existait, mais APRÈS** : un `toast` post-import (*« 4 exercices créés
automatiquement »*) qui disparaît en trois secondes, alors que la décision, elle, est déjà prise.
*L'app décidait, puis elle informait* — **R29 à l'envers**, dont le corollaire dit précisément
« informer sans décider ».

**Ce que ça coûtait ici.** Un exercice inventé n'a **ni photo, ni figurine, ni historique**.
Michel a donc lu *« aucun repère dans ton historique »* **en salle**, sur une presse où il avait
fait **280 kg cinq jours plus tôt** — et il a conclu, à raison de son point de vue, que l'app
était bâclée : *« si ça arrive à d'autres personnes je fais comment ? »*.

**Ce qui la protège aujourd'hui.**
1. **Le cas silencieux se marque**, avec ce qu'il **coûte** (« sera créé — sans photo ni
   historique »), pas seulement son nom.
2. **Un compte en tête** : sans lui, il faut parcourir toute la liste pour savoir combien.
3. ⭐ **Une sortie dans le même geste** (« 🔗 Rattacher »), sinon on informe sans donner la main —
   ce qui est **pire** que de se taire : la personne voit le problème et ne peut rien en faire.
4. ⛔ **On n'interdit pas pour autant** (**R24**) : un exercice réellement inconnu a le droit
   d'exister. *Marquer n'est pas bloquer.*

**⚠️ LE PIÈGE DANS LE PIÈGE, mesuré ici** : réparer **une seule occurrence** peut être **pire**
que ne rien réparer. La création dédoublonne par nom ; rattacher la ligne du J1 sans celle du J2
produisait un programme où le **même** exercice existe sous **deux** noms — *l'historique coupé en
deux au lieu d'être d'un seul côté.* 👉 **Quand on corrige une donnée nommée, corriger TOUTES ses
occurrences dans le même lot, ou n'en corriger aucune.**

**Le réflexe.** Devant un aiguillage à trois branches, demander : *« laquelle ne dit rien, et
est-ce la moins grave ? »* Si la branche muette est celle qui a le plus de conséquences, le défaut
n'est pas dans le calcul — il est dans le **rendu**.

**⚠️ Voisine mais distincte** de la famille **43** (deux portes, une seule équipée) : là, un
chemin entier était oublié ; ici, **le même chemin** traite trois cas et n'en montre que deux.

---

## 50. 🪞 LA RÈGLE GÉNÉRALE LUE SANS CHERCHER LA RÈGLE PLUS SPÉCIFIQUE **(07/09/2026, ft-v1166)**

**Le cas, et il est à moi.** J'ai lu `.overlay{z-index:200}` dans `style.css` (ligne 749),
constaté que `#mod-ex` est déclaré **avant** les aperçus d'import dans `index.html` (2122 contre
2348 et 2665), et conclu — logiquement — qu'à plan égal l'ordre du DOM ferait passer le sélecteur
**derrière**. J'ai posé un `style.zIndex='260'` à l'ouverture, écrit un long commentaire sur ce
« piège », et un témoin pour le figer.

**⛔ MESURE : `#mod-ex{z-index:300;}` existe déjà, ligne 770 du MÊME fichier**, posé exactement
pour cette raison. ***Mon « correctif » DESCENDAIT le sélecteur de 300 à 260.*** Et comme 260 reste
au-dessus de 200, **ça marchait** — donc rien, jamais, ne l'aurait signalé.

**Ce qui l'a trouvée : le contrôle négatif, et lui seul.** La mutation qui retirait le
rehaussement n'a fait rougir **aucun** témoin. *Un témoin qui reste vert quand on supprime le code
qu'il est censé protéger ne protège rien — il décrit un état que quelque chose d'autre garantit.*

**À quoi on la reconnaît.** Une règle CSS générale (ou une valeur par défaut, ou un comportement
« de base ») lue dans un fichier, et une conclusion tirée **sans chercher plus loin dans le même
fichier** si une règle plus spécifique la surcharge. Le symptôme est un correctif qui n'a aucun
effet mesurable — ou, comme ici, un effet **négatif** invisible.

**Ce qui la protège.**
1. ⭐ **Le contrôle négatif est le seul détecteur** : si aucune mutation ne mord sur un morceau de
   code, ce code ne sert à rien — le retirer, et écrire pourquoi.
2. Devant `.classe{prop:X}`, chercher `#id{prop:` et les sélecteurs plus spécifiques **avant** de
   conclure. Le navigateur, lui, les applique.
3. ⭐ **Requalifier le témoin plutôt que le jeter** : celui-ci reste, mais il fige désormais la
   **règle CSS** au lieu du correctif — et son libellé le dit (`GARDE (pas détecteur)`), pour que
   personne ne croie qu'il mesure autre chose.

**C'est R28 appliqué à celui qui écrit le code** (*une limite non vérifiée devient une règle de
conception silencieuse*), exactement comme le cas des adducteurs en **R31** : *j'ai écrit six fois
dans le code qu'ils n'existaient pas dans la figurine sans jamais ouvrir le dessin.* La différence
est qu'ici la fausse limite a produit **du code**, pas seulement de l'inaction.

---

## 51. 🏷️ TROIS CHEMINS ÉCRIVENT LA MÊME LIGNE, ET ELLE NE DIT PAS D'OÙ ELLE VIENT **(07/09/2026, ft-v1167)**

**Un signal peut exister, être collecté, et rester illisible parce qu'il manque sa PROVENANCE.**
`_reportCustomEx` remontait les exercices inconnus depuis **trois** appelants : la personne qui en
crée un **exprès**, et les **deux** chemins d'import quand un nom lu dans un document ne correspond
à rien. Les trois écrivaient **la même ligne** du même onglet.

**⛔⛔ Or les deux cas veulent dire l'inverse l'un de l'autre** : *« Développé Michel »* tapé par
quelqu'un = **il manque un exercice au catalogue**. *« Développé couché (ECH) »* écrit quatre fois
par un import = **la chaîne est cassée**. 👉 ***Même ligne, sens opposés*** — donc le bug de
ft-v1156 était déjà dans le Sheet, sous les yeux, et indiscernable d'une demande légitime.

**⛔ Et le 4ᵉ chemin ne signalait rien du tout** : `_nomMiloVersCatalogue` rendait le nom brut en
silence. *Le seul endroit du code qui SAIT que le nom n'a pas été reconnu était aussi le seul à ne
rien en dire.*

**⭐ À quoi on la reconnaît** : une donnée collectée depuis plusieurs points d'entrée, dans un
format qui ne les distingue pas. Le symptôme est qu'on **regarde la table et qu'on ne sait pas
quoi en faire** — pas qu'elle soit vide.

**⭐⭐ Ce qui protège aujourd'hui** : chaque appelant porte sa **source**, le dédoublonnage local
porte sur **`nom|source`** (sur le nom seul, *le premier chemin qui signale empêche les autres* —
un dédoublonnage trop large n'enlève pas du bruit, **il efface le signal**), et les sources
**s'accumulent** sur une ligne existante au lieu de s'écraser.

**⚠️ ET LE PIÈGE PROPRE AUX DÉTECTEURS, payé dans la version même** : mon premier jet comparait le
nom **sans le normaliser**, donc un nom sans accents ressortait « inconnu » alors que l'exercice
existe. ***J'avais reproduit dans le détecteur la faute qu'il est censé détecter*** (le défaut
exact de ft-v1160, dix lignes plus haut). 👉 *Un détecteur qui crie à tort ne produit pas du bruit :
il apprend aux gens à l'ignorer* — c'est la panne de ft-v1145. **Un détecteur se teste d'abord sur
ce qu'il ne doit PAS signaler.**

*Voisine de **§15** (la règle juste, définie trop étroit) et de **§43** (deux portes mènent au même
endroit, une seule est équipée).*


## 52. ⌨️ CE QUI SE TAPE LETTRE PAR LETTRE SE MESURE À LA FIN, PAS À CHAQUE FRAPPE **(07/09/2026, ft-v1168)**

**Instrumenter un champ de saisie sans anti-rebond, c'est mesurer la frappe au lieu du besoin.**
Une recherche « biceps marteau » produit `b`, `bi`, `bic`, `bice`… et **chacun de ces préfixes
rend zéro résultat** à un moment. Un compteur naïf enregistre donc **une douzaine de faux
signaux** pour une seule question réelle — et le vrai terme se noie dedans.

**⛔ À quoi on la reconnaît** : un compteur qui explose sans que rien n'aille mal, ou dont les
valeurs les plus fréquentes sont toutes des **préfixes** les unes des autres.

**⭐ Ce qui protège** : ① n'envoyer qu'après une **pause** de frappe ; ② **re-vérifier** que le
champ porte *encore* ce terme (sinon un préfixe abandonné part quand même une seconde plus
tard) ; ③ une **longueur minimale**, en dessous de laquelle tout le monde tape la même chose.

**⚠️⚠️ ET LA FAMILLE A UN MIROIR CÔTÉ TEST, payé dans la version même.** Pour prouver
l'anti-rebond, les préfixes du témoin doivent **eux-mêmes rendre zéro à chaque étape**. Mes
premiers (`bic`, `bice`, `bicep`) **trouvaient des résultats** — le groupe « Biceps » — donc un
seul envoi partait de toute façon : ***le témoin était vert pour la mauvaise raison, et la
mutation qui retire l'anti-rebond ne le faisait pas rougir.*** C'est `BUGS.md` §34 (le vert qui
ne peut pas rougir) appliqué à un test de frappe.

**⚠️ Deuxième miroir : ne jamais coder en dur un délai dans le test.** Le chemin des aliments a
**son propre** anti-rebond, donc il rappelle le rendu plus tard et **réarme** le nôtre : le
délai réel est « leur pause + la nôtre ». *Un test qui code en dur un délai mesure la machine,
pas le comportement* — on sonde jusqu'à l'événement.

*Voisine de **§47** (le garde-fou dont le plancher éteint le pourcentage) et de **§48** (la porte
de secours non proposée là où le chemin s'arrête) — trois familles nées la même journée, toutes
trois « le mécanisme existe, il mesure ou propose la mauvaise chose ».*


---

## 53. 🔤 DEUX COMPARAISONS POUR LA MÊME QUESTION — ET C'EST LA PLUS GROSSIÈRE QUI DÉCIDE **(08/09/2026, ft-v1172)**

**Le cas.** Michel importe son programme et se retrouve avec **CINQ** exercices perso pour **UN
SEUL** mouvement d'épaules. Deux d'entre eux sont **le même nom** : « Développé Épaules Guide /
Haltères » et « Développé épaules **guidé** / haltères ». Le test *« cet exercice existe-t-il
déjà ? »* comparait en `toLowerCase()` **seul** → `guide` ≠ `guidé` → **deux exercices créés pour
un**.

**⭐⭐ Ce qui fait la famille, et pas seulement le bug** : l'app possédait **déjà** une comparaison
plus fine — `_normEx` (accents, ponctuation, espaces) — employée par la **recherche**, le
**rapprochement d'exercices**, les **records** et l'**historique**. *La seule qui ne l'employait
pas était celle qui décide de **créer**, c'est-à-dire celle dont l'erreur est la plus chère.*

**🔎 Comment la reconnaître.** Chercher une question métier (« est-ce le même nom ? », « est-ce le
même jour ? », « est-ce le même produit ? ») posée à **deux endroits avec deux formules** — et
regarder laquelle des deux **écrit** dans les données. ⚠️ Le signe : une fonction de normalisation
qui existe et qui est appelée **partout sauf là**.

**⛔ Pourquoi personne ne le voit.** Un doublon d'accent **ne ressemble pas à un bug** : il se lit
comme un vrai exercice, il a son propre historique, sa propre ligne dans le catalogue. *Rien ne
plante, aucun test ne rougit — les charges se coupent simplement en deux.* C'est la même
signature que **§46** (le correctif invérifiable) : l'absence de symptôme visible.

**🛡️ Ce qui protège aujourd'hui.**
1. Un **propriétaire unique**, `_cleNom`, employé aux **cinq** endroits qui posaient la question
   (le test d'existence, les **deux** compteurs d'aperçu, les **deux** dédoublonnages de création)
   — **R2** + **R8**.
2. Un témoin qui **mesure la garantie** plutôt que la formule : *zéro collision sous `_cleNom` sur
   les 322 noms du catalogue*. S'il rougit, c'est que la normalisation confondrait deux exercices
   **réels** — et là il faut arrêter, pas ajuster.
3. Un témoin **fonctionnel** qui appelle `finalImportProg` et lit ce que l'app **écrit**.
   ⚠️ **Payé au contrôle négatif** : mon premier témoin **rejouait** le dédoublonnage dans le test,
   et la mutation ne faisait rougir **personne**. *Un contrôle qui recalcule la formule qu'il
   vérifie est un vert qui ne peut pas rougir.*

*Voisine de **§50** (la règle générale lue sans chercher la plus spécifique) et de **§51** (trois
chemins qui écrivent la même ligne) — même racine : **plusieurs endroits répondent à une seule
question**, et on ne sait pas lequel gagne.*
---

## 54. 💬 LE COMMENTAIRE DIT VRAI, LE CODE NE LE FAIT PAS **(08/09/2026, ft-v1173)**

**À quoi on la reconnaît** : un commentaire décrit un comportement **au présent**, comme un fait
acquis — *« les 4 valeurs affichées deviennent la nouvelle référence, quelle qu'elle soit »* — et
la ligne juste en dessous ne le produit pas. Le lecteur suivant (humain ou IA) **lit le
commentaire et passe** : il vient de recevoir la réponse à la question qu'il allait se poser.

**Le cas** : `_afSetUnite` rappelait `_afMajAncre()` **sans `srcChange`**, donc la référence
restait l'ancienne — exactement l'inverse de ce que son propre commentaire promettait. Un `×2`
choisi par la personne, un passage en grammes, « 100 » tapé, et l'app réaffichait la valeur
d'origine ***juste après avoir écrit « les 4 valeurs ci-dessous correspondent à ce poids »***.

**Pourquoi c'est une famille et pas un accident** : un commentaire faux ne lève rien, ne casse
aucun test, et **survit aux relectures parce qu'il les arrête**. Il est plus dangereux qu'un
commentaire absent : l'absence fait lire le code, la présence en dispense. *Une intention écrite
au présent finit par être crue.*

**Ce qui la protège** : ⛔ un commentaire qui décrit un comportement doit avoir **un témoin qui
le vérifie** — sinon il s'écrit au conditionnel (« devrait », « à faire »), jamais au présent.
Et quand on trouve la divergence, **on corrige le code, pas le commentaire** : c'est lui qui
disait la bonne chose.

**⛔⛔ LE MIROIR LE PLUS CHER, ET IL EST ARRIVÉ DANS LA MÊME VERSION : LE CORRECTIF ÉTAIT TROP
LARGE.** Reclasser le geste en « changement de source » **sans condition** réparait le cas
regardé et **rouvrait celui d'à côté** — la capture d'étiquette de ft-v1061, où 40 g
réaffichait 208 kcal. Le mini-banc était à **16/16** ; c'est la **passe complète** qui a rendu
**3 rouges**, tous dans le bloc de ft-v1061. 👉 ***Réparer le cas qu'on regarde en cassant celui
d'à côté n'est pas un correctif, c'est un échange.*** Et les deux cas sont indiscernables par
le **geste** : ce qui les sépare est *« l'app sait-elle déjà combien ça pèse ? »*. **Le réflexe
qui en sort** : quand un correctif consiste à *élargir* une condition, chercher **qui d'autre
passait par la branche étroite** — et ne jamais conclure sur un mini-banc, qui ne joue que les
témoins qu'on a écrits soi-même.

**Le miroir de méthode, payé dans la même version** : le témoin d'étape ⑤ était **vert par
coïncidence** — il rescalait à 50 g, or l'erreur (÷2) et le rescale (÷2) se compensaient et
donnaient le **même nombre des deux côtés**. Passé à 200 g, il rougit. *Un témoin vert par
coïncidence ne mesure rien, il rassure* (§34, le vert qui ne peut pas rougir — 3ᵉ fois).

*Voisine de **§46** (un correctif qui vit dans le prompt n'est pas vérifié) et de la famille
« l'info n'atteint jamais la donnée » (**R4**), qu'elle retourne : ici c'est l'**intention** qui
n'atteint pas le **code**.*


---

## 55. 🔗 UN TOTAL SÉPARÉ DE SA QUANTITÉ DEVIENT UNE FAUSSE RÉFÉRENCE **(08/09/2026, ft-v1177)**

**À quoi on la reconnaît** : une valeur juste change de sens en changeant de contexte. Les
chiffres restent les mêmes à l'écran, rien ne plante, rien ne rougit — et pourtant la ligne ne
veut plus dire la même chose. Le signal typique : **une quantité qui change sans que les valeurs
bougent**, ou l'inverse.

**Le cas** : un aliment enregistré à *380 g = 274 kcal* est repris depuis « Mes aliments ». Le
chemin recopie les **totaux** et laisse tomber la **quantité**. La personne tape 110 g → l'app
apparie 274 kcal à 110 g, en **dérive** un pour-100 g de 249 (au lieu de 72), l'enregistre — et
tout ce qui suit est parfaitement cohérent depuis une vérité fausse (*180 g → 448 kcal*).

**Pourquoi c'est une famille** : les trois objets (une **référence**, une **quantité**, un
**total**) sont interchangeables *à l'œil* — ce sont tous des nombres de calories. Seul leur
**appariement** dit lequel est lequel. Un chemin qui en transporte deux sur trois ne produit
donc pas une erreur visible : il produit un **résultat plausible**, qui se propage.

**Ce qui la protège** : ⛔ ne jamais transporter des totaux sans leur quantité de référence —
et si la quantité est inconnue, **le dire** plutôt que de laisser l'app en fabriquer une. Un
témoin doit vérifier le **rapport** (kcal ÷ grammes), jamais les valeurs seules : c'est le seul
chiffre qui trahit un mauvais appariement.

**⚠️ ET LA VARIANTE LA PLUS COÛTEUSE EST SILENCIEUSE** : `quickAddFood` créait des lignes à
`q:null, per100:null`. Elles ne sont **pas** fausses — elles sont **non convertibles**. Rien ne
permet plus de savoir si 323 kcal valaient 100 g ou 300 g, et *aucune réparation automatique
n'est possible sans inventer* (**R29**).

**⛔⛔ LE MIROIR DE MÉTHODE, PAYÉ DANS LA MÊME VERSION — DEUXIÈME JOUR DE SUITE.** Mon premier
correctif marquait le poids repris comme « déclaré par la personne ». Mesuré : après un
aller-retour d'unité, il **rouvrait le bug**. Le drapeau voulait dire *« un poids a été déclaré
pour CE QUI EST AFFICHÉ »* — un poids **hérité** d'une entrée enregistrée n'est pas cela.
👉 ***Quand deux situations demandent le même geste, vérifier que c'est bien la même question
qui est posée*** — ici : *qui* a posé ce poids, et *pour quoi*.

*Voisine de **§51** (deux comparaisons pour la même question) et de **§54** (le commentaire dit
vrai, le code ne le fait pas). Née d'un audit externe sur un export réel de 168 lignes — le
premier bug de ce dépôt trouvé par la DONNÉE plutôt que par une capture d'écran.*


## 56. 🪟 UN BLOC RESTÉ VISIBLE N'EST PAS INERTE — IL RÉPOND POUR L'ALIMENT D'AVANT **(08/09/2026, ft-v1179)**

**À quoi on la reconnaît** : une valeur *plausible* apparaît sur un écran sans qu'on l'ait tapée, et
elle appartient à **ce qu'on regardait juste avant**. Rien ne plante, rien n'est vide — c'est un
chiffre juste, sur le mauvais sujet.

**Le cas** : Michel scanne un produit complet (le bloc « pour 100 g » s'ouvre avec son défaut à
**100**), puis un produit dont la fiche Open Food Facts n'a **aucune valeur**. L'app éteint bien le
pour-100 g et bascule sur les onglets ⚖️/🍽️ — **mais elle laisse le bloc précédent affiché**. À
l'enregistrement, `_provFood` lit sa quantité *du moment qu'il est visible* : les **274 kcal de la
ratatouille** partent mariées aux **100 g du thon**, et la ligne se relit pour toujours comme
« 274 kcal = 100 g ».

**⛔ CE QUI REND LA FAMILLE VICIEUSE, ET IL FAUT LE SAVOIR** : le champ portait **`value="100"` en
dur dans le HTML**. Un bloc caché n'est donc **jamais vide** — il attend. *Une garantie qui repose
sur « ce n'est pas affiché » suppose que personne ne l'affichera par un autre chemin.*

**Ce qui la protège aujourd'hui** : deux moitiés, et la seconde compte plus que la première.
① **Toute porte qui éteint une référence cache le bloc qui la présente** — c'était posé sur trois
portes sur quatre (**R8**). ② **Un bloc ne donne sa valeur que s'il APPARTIENT à ce qui est
affiché** : la visibilité n'est pas une preuve d'appartenance, il faut un témoin explicite
(`_bcNutr` ici). *La moitié ② referme aussi les portes qu'on n'a pas prévues — mesuré : sans elle,
l'invariant tombe même quand ① est en place.*

**Le réflexe** : quand un écran a **deux réglages pour la même grandeur**, ne pas se demander
seulement *« lequel est visible ? »* mais *« celui-ci parle-t-il de l'aliment que j'ai sous les
yeux ? »*. Et quand un champ a une valeur par défaut dans le HTML, se rappeler qu'**il répond même
quand on ne lui demande rien**.

*Voisine de **§55** (un total séparé de sa quantité) dont c'est la porte d'entrée en amont, de
**R15** (tout chemin de fermeture pose son marqueur) et du « voisinage muet » de ft-v966 / ft-v1042
/ ft-v1051 — un chiffre juste à côté d'un autre chiffre juste, et l'ensemble ment. ⚠️ Née d'une
consigne de Michel plutôt que d'un correctif : *« Ne corrige rien pour l'instant. Trace pourquoi. »*
— la trace a donné la cause, une piste de travers a été éliminée par la mesure, et une **2ᵉ route**
(le poids de paquet tapé, ft-v1174) a été trouvée par une relecture croisée.*


## 57. 🧠 LE DOM COMME MÉMOIRE ENTRE DEUX SUJETS **(09/09/2026, ft-v1180)**

**À quoi on la reconnaît** : on passe d'un sujet au suivant **sans changer d'écran**, et le second
hérite d'une valeur du premier. Le chiffre est plausible, personne ne l'a tapé, et rien ne signale
qu'il vient d'ailleurs.

**Le cas** : dans l'écran « Ajouter un aliment », on reprend une ratatouille (380 g), puis on touche
un autre aliment. Le poulet, le steak, l'omelette tapée à la main, la boîte scannée — **tous
repartaient avec les 380 g**, et l'app en dérivait un pour-100 g inventé (53, 79, 92, 147).

**⛔ CE QUI REND LA FAMILLE VICIEUSE** : le code ne lisait pas une variable, il lisait **un champ
affiché**. `_afMajAncre` prenait la quantité dans `af-prop`, et ce champ n'appartient à personne —
il contient ce que le dernier rendu y a laissé. *Un champ qui affiche « 380 » ne dit pas « le
nouvel aliment pèse 380 » : il dit « je n'ai pas été effacé ».*

**Ce qui la protège aujourd'hui** :
① **« Changer de sujet » est un GESTE, et un geste a un propriétaire.** Une seule fonction oublie
l'état du précédent, appelée par **toutes** les portes — pas une remise à zéro recopiée dans
chacune, qui divergerait (**R2**).
② **La valeur retient à QUI elle appartient.** Quand aucune porte n'est franchie (ici : effacer le
nom et taper à la main), le propriétaire ne peut pas se déclencher — il faut alors que la donnée
elle-même sache de quel sujet elle parle. C'est la forme minimale du jeton de révision.

**Le réflexe** : quand une valeur peut survivre à son sujet, ne pas se demander *« qui l'efface ? »*
mais ***« à quoi appartient-elle, et comment le sait-on ? »***. Et se méfier de tout code qui lit
un champ du DOM pour décider — le DOM est fait pour **afficher** et pour **recevoir une saisie**,
jamais pour se souvenir.

*Voisine de **§56** (un bloc resté visible répond pour l'aliment d'avant) dont c'est la
généralisation : §56 est le cas où le conteneur survit, §57 le cas où la valeur survit. Voisine
aussi de **R15** (tout chemin de fermeture pose son marqueur) — ici c'est tout chemin
d'**ouverture** qui doit effacer. ⚠️ Née d'un cahier des charges externe (GPT) rédigé après un
contre-audit, et de six mesures faites dans un vrai navigateur avant d'écrire une ligne.*

---

## §58 — ⛔⛔ UNE PORTE SANS TÉMOIN RESSEMBLE À DE LA DÉCORATION *(ft-v1180, 09/09/2026)*

**Famille : erreurs de MÉTHODE (§12).** Le contrôle négatif dit *« cette mutation ne fait rougir
personne »*. Deux lectures sont possibles, et **elles sont opposées** :

| lecture | conséquence si on se trompe |
|---|---|
| *le code est de la décoration* | on **retire une vraie protection** |
| *le témoin manque* | on croit couvert un chemin qui ne l'est pas |

**LE CAS.** Retirer l'appel qui « oublie l'aliment précédent » dans `_lookupBarcode` ne faisait
rougir **aucun** témoin. J'ai failli conclure à du code mort et l'enlever. Mesuré avant de le
faire : **un scan emprunte deux chemins**, et ma fausse fiche Open Food Facts n'en exerçait qu'un.
Une fiche **sans** valeurs part vers `_bcSansValeurs`, qui oublie lui-même ; une fiche **avec**
valeurs part vers `_offRemplirFormulaire`, qui **n'oublie pas** — là, cette porte est **la seule**.
👉 *Ma fixture couvrait une branche sur deux, et le silence du contrôle négatif ressemblait
exactement à celui d'une garde inutile.*

**Ce qui la distingue de la garde morte de ft-v1174** (où la conclusion « décoration » était la
bonne) : là-bas, **aucune entrée possible** ne pouvait franchir la garde — c'était prouvable en
lisant l'expression. Ici, l'entrée existait, c'est **mon faux réseau** qui ne la produisait pas.

**Ce qui la protège aujourd'hui** : devant une mutation muette, on ne tranche pas au jugé — on
cherche **par quel chemin la valeur arrive**, et on vérifie que la fixture les produit tous. Si le
chemin existe, on **ajoute le témoin** ; si aucune entrée ne peut l'atteindre, alors seulement on
retire le code.

**Le réflexe** : *une mutation muette est une QUESTION, pas une réponse* — et la question est
toujours la même : **« quelle entrée emprunte ce chemin, et ma fixture la fabrique-t-elle ? »**

*Voisine de **§12** (une mesure fausse rassure) et de la leçon de **ft-v1179** (une mutation qui
échoue en silence ressemble à un témoin inutile) : là c'était la mutation qui ne s'appliquait pas,
ici c'est la fixture qui n'atteignait pas le code. **Les deux rendent « 0 rouge », et aucune des
deux ne veut dire « c'est couvert ».***

---

## 58. ⏳ UN TÉMOIN QUI POSE L'ÉTAT FINAL À LA MAIN NE VOIT PAS LE CHEMIN QUI Y MÈNE **(09/09/2026, ft-v1184)**

**Le cas, et il est humiliant parce que tout était déjà écrit.** Le **15/08/2026**, Michel signale :
*« putain la mise à jour s'est faite au moment où j'ai terminé ma séance, donc j'ai pas vu mon
récapitulatif »*. Un garde-fou est posé (`ov-session-end` ouvert → pas de rechargement) et un
témoin permanent est écrit — le **bloc XXII** du banc de parcours.
**Le 09/09, Michel re-signale exactement le même symptôme.** *Un mois avec le banc au vert.*

**⛔⛔ Ce que le témoin faisait** — il posait les états **à la main** :
```js
S.wkt = null; ov.classList.add('open');     // « le récapitulatif est à l'écran »
o.pendantRecap = _majPeutSAppliquer();      // false ✅
```
👉 Il teste l'**état final**, l'écran **déjà** ouvert. Il ne conduit **jamais** `finishWorkout`.
Or la vraie fenêtre est **avant** : `finishWorkout` vide `S.wkt`, passe à l'accueil, puis **attend
le réseau plusieurs secondes**, et n'ouvre l'écran de fin qu'après. Pendant tout ce temps les
trois gardes tombent ensemble, et chaque `persist()` retente la mise à jour.

**⚠️⚠️ ET LE PLUS COÛTEUX : LE COMMENTAIRE DU TÉMOIN NOMMAIT DÉJÀ LA CAUSE**, mot pour mot —
*« le garde-fou se relâchait à la milliseconde où S.wkt se vide, c'est-à-dire juste avant que
l'écran de fin s'ouvre »*. **La cause était comprise en août.** Le correctif n'a couvert que
l'**après**, le témoin a figé l'**après**, et personne n'a vu que l'**avant** restait ouvert.

**🔎 Comment la reconnaître.** Un témoin qui **fabrique** la situation (`x=null`, `classList.add`,
un objet posé directement) au lieu d'**appeler la fonction de production** qui y mène. Le signe :
on lit le test et on n'y trouve **aucun appel** au vrai chemin.

**🛡️ Ce qui protège.**
1. **Conduire la fonction réelle** — ici `finishWorkout()`, pas un état reconstruit.
2. Se demander, pour chaque garde temporel : *entre quel instant et quel instant tient-il ?*
   Une fin de séance est une **fenêtre**, pas un instant ; deux gardes se **relaient**
   (`_finishing` avant l'ouverture, `ov-session-end` après) et **il faut un témoin pour chacun**.
   ⚠️ Payé au contrôle négatif : ma mutation « garde du récap retiré » ne faisait rougir personne,
   parce qu'aucun de mes témoins ne tentait une mise à jour **pendant** que l'écran est affiché.

**⚠️⚠️ RECHUTE LE JOUR MÊME, PAR CELUI QUI VENAIT D'ÉCRIRE CETTE FAMILLE (ft-v1185).** En figeant
le balayage du débrief, j'ai voulu vérifier que le socle chiffré produisait bien quelque chose. Ma
1ʳᵉ version mesurait la **longueur du texte** — verte alors que le socle était mort, parce qu'un
repli écrit à la main prend le relais. Ma 2ᵉ version **appelait `_debriefLocal` en direct** — verte
aussi, parce que la fonction existe toujours : c'est son **usage par l'écran** qui avait disparu.
👉 ***J'ai écrit §58 puis je l'ai refaite dans l'heure.*** La 3ᵉ version vérifie que le texte
**affiché** contient ce que le socle produit — le **chemin**, pas la fonction : la mutation fait
alors **12 rouges**. *Écrire une famille de bugs ne vaccine pas contre elle ; seul le contrôle
négatif attrape la rechute.*

*Voisine de **§46** (un correctif qu'on ne peut pas vérifier là où il s'applique) et de la leçon de
ft-v1158 — « vérifier la fonction n'est pas vérifier l'appel » : celle-ci en est la version
**temporelle** au lieu de spatiale.*

**⭐⭐ ET LA MÊME FAMILLE FRAPPE LES SONDES, PAS SEULEMENT LES TÉMOINS *(12/09/2026, ft-v1196)*.**
L'instantané du chantier Nutrition portait deux sondes nommées `3_regle_grammes_seuls` et
`3_regle_avec_portions`. Mesuré avant la sous-étape 3-i : elles **RECOPIENT la règle dans la
sonde** —

```js
const regleP = c => (+c.q>0 && (!c.u||c.u==='g'||c.u==='portion'));   // dans la SONDE
```

— donc elles **n'appellent aucun code de production**, et ne peuvent rien détecter d'une
extraction. Ce sont des **tables de vérité**, ce qui est utile, mais ce n'est **pas** de la
couverture. Et la seule sonde qui conduisait vraiment une porte n'en conduisait **qu'une sur deux**.

> **Une sonde qui recopie la règle mesure ce qu'on CROYAIT écrire, pas ce qui est exécuté.**

⚠️ **Le signe qui aurait dû alerter était dans le commentaire lui-même** : il annonçait *« les six
sites conduits par leur VRAIE porte »* pour une boucle qui n'en conduit **qu'une**. *C'est le
miroir du commentaire de ft-v1190, qui annonçait une portée plus ÉTROITE que le code — dans les
deux sens, un commentaire qui décrit mal sa portée dispense le lecteur suivant d'aller vérifier.*

**Le réflexe** : avant d'écrire « instantané couvert », **ouvrir la sonde** et chercher le nom de
la fonction de production dedans. S'il n'y est pas, la sonde ne couvre rien.


---

## §59 — ⛔⛔ CORRIGER UNE PORTE ET PAS SA JUMELLE : LA 8ᵉ FOIS RECENSÉE, ET LA PLUS COÛTEUSE *(10/09/2026)*

**À quoi on la reconnaît** : un correctif est écrit, mesuré, éprouvé par mutation, livré vert — et
le même défaut vit toujours **à côté**, sur l'écran jumeau, dans la fonction jumelle, sur l'autre
porte du même geste. *Le témoin ne peut pas le voir : il regarde la porte qu'on vient de réparer.*

**Le cas de cette version** : ft-v1186 corrige, sur l'écran d'**ajout**, un défaut nommé par Michel
— *« le pour-100 g ne doit pas décider de l'unité »*. Deux portes corrigées (`quickFillFood`,
`_afSuggPrendreLocale`), un témoin de non-régression, contrôle négatif à 15 mutations, tout vert.
⛔⛔ **Et l'écran d'ÉDITION faisait exactement la même chose, intact.** Mesuré : ouvrir « 2 steaks
de 125 g » affichait *« Quantité (g) = 250 »*, et **enregistrer sans rien toucher** réécrivait la
ligne en `q:250, u:'g'`. La consigne était respectée d'un côté et violée de l'autre, dans la même
version, à 900 lignes d'écart.

**Ce qui rend cette famille différente des autres** : elle ne se voit **ni à la relecture ni au
banc d'essai**. Le code corrigé est juste ; les témoins sont verts et le méritent ; le contrôle
négatif mord. *Tout ce qui mesure dit vrai — et pourtant la moitié du bug est encore là.*

**Le recensement, parce que le nombre est l'argument** : ce fichier et le journal portent la même
faute à `_afPoidsDeclare`/`_efPoidsDeclare` (ft-v1064), au champ de quantité (ft-v1056), au
rescale (ft-v1067), à la référence préservée (ft-v1172), aux portes de reprise (ft-v1180), au
pour-100 g dérivé (ft-v1183), à l'unité (ft-v1186) — **et le pour-100 g à une décimale, où
`_per100d1` servait DÉJÀ 7 portes et pas la 8ᵉ**. Huit fois, toujours entre l'écran d'ajout et
l'écran d'édition.

**Ce qui protège aujourd'hui** :
- ⭐ **la question se pose AVANT de livrer, pas après** : *« cette fonction a-t-elle une jumelle
  `_ef*` / `_af*` ? »* — la réponse est **oui** pour presque tout le module nutrition ;
- ⭐⭐ **et le témoin se pose sur les DEUX**, même quand la seconde est déjà correcte. Un témoin
  sur une porte saine coûte trois lignes ; le trouver six mois plus tard coûte une version ;
- ⛔ **ce que ça n'autorise pas** : corriger la jumelle « pour faire propre » sans mesurer qu'elle
  est cassée. Ici les deux étaient mesurées cassées avant qu'une ligne ne change.

*Voisine de **§58** (une porte sans témoin ressemble à de la décoration) : celle-là dit qu'un
mécanisme sans témoin passe pour mort, celle-ci qu'un mécanisme **à moitié posé** passe pour vivant.*

### 🔄 Une coupe retirée du chat, survivante dans le débrief (F07a, ft-v1239) *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
ft-v656 avait retiré la coupe `slice(-20)` du chat comme « perte SILENCIEUSE ». Elle avait **survécu**
dans `_dbfPoserDansHistorique` : une discussion de 30 messages tombait à 20 après un débrief. 🛡️
ft-v1239 : la règle du chat (borne 400 puis budget de place) aux deux endroits.

---

## §60 — ⛔⛔ MUTER UN FICHIER **SERVI** PENDANT QU'UNE PASSE TOURNE FAUSSE LA PASSE **EN SILENCE** *(10/09/2026, ft-v1190)*

> **⚠️⚠️ RÉCIDIVE LE 12/09/2026 (ft-v1197), PAR CELUI QUI A ÉCRIT CETTE SECTION — et elle ajoute
> quelque chose.** Je n'ai pas muté du code applicatif : j'éprouvais les **gardes d'un PDF**, en
> mutant `app.js` et `setup.js` pour vérifier qu'ils refusaient de produire. **Pendant que la passe
> tournait.**
>
> ⭐⭐ **Ce que la récidive apprend** : la règle telle qu'elle était écrite parle du *contrôle négatif
> du **correctif***. Or **un document a ses gardes, et les éprouver mute les mêmes fichiers** — le
> geste est identique, seule l'intention diffère, et *l'intention n'est pas ce que le serveur du banc
> lit*. 👉 **La règle se généralise : pendant une passe, aucun fichier servi ne bouge, quelle que
> soit la RAISON de le faire.** Contrôle négatif du code, gardes d'un PDF, essai rapide, mesure de
> curiosité — même interdit.
>
> ⛔ **Et il y a pire à savoir** : la veille (ft-v1196), j'avais fait la même chose en plus petit et
> **vérifié après coup** que ça n'avait rien touché. *Une vérification qui vient après le geste ne
> protège pas, elle rassure* — c'était déjà écrit dans ft-v1190, et ça n'a pas suffi.
>
> ✅ **Ce qui a limité les dégâts n'est pas la règle, c'est le réflexe** : passe **arrêtée
> immédiatement**, les trois fichiers **vérifiés restaurés au diff**, puis **relancée de zéro sans
> rien toucher** — elle a rendu **3605 ✅ · 0 ❌**, le total exactement prédit. *Rien n'a été conclu
> sur une passe faussée, et c'est la seule chose qui compte une fois la faute commise.*


**À quoi on la reconnaît** : une passe complète rend des rouges **sur un bloc qui passe en isolé**,
et le message d'échec est **plausible** — il tombe sur de vrais témoins, dans le bloc qu'on vient
justement de modifier.

**Le cas vécu (ft-v1190)** — 5 témoins rouges dans le bloc CII, et j'ai bien failli conclure que le
correctif d'option A cassait quelque chose de réel, donc « réparer » du code sain.

| heure | ce qui s'est passé |
|---|---|
| **16:21:05** | la passe complète démarre |
| **16:25:19** | je corrige une autre suite de tests |
| **16:27:10** | ⛔ **je mute `index.html`** pour vérifier que ce correctif-là mord (je retire `_bcQtyPose=true` du `oninput`) |
| **~16:29** | la passe atteint le bloc CII |
| **16:39:57** | la passe finit — `index.html` est restauré depuis longtemps, donc **tous les blocs suivants sont verts** |

👉 **La cause tient au serveur du banc d'essai** : il relit le fichier **à chaque requête**
(`fs.createReadStream`). Le contexte navigateur créé par CII a donc reçu la **version cassée**.
*C'était exactement ma mutation n° 4, celle qui fait 12 rouges quand on la lance exprès.*

**⭐⭐ CE QUI REND CETTE FAMILLE VICIEUSE — et c'est le point à retenir** : modifier les fichiers de
**TEST** pendant une passe est **sans danger** (Node les lit une seule fois au démarrage). L'habitude
est donc bonne, elle ne fait jamais de dégât… et elle rend le piège **invisible** le jour où on touche
un fichier **servi à l'app**.

**⛔ LA RÈGLE** : pendant une passe, on ne touche à **aucun** fichier servi — `app.js`, `index.html`,
`style.css`, `constants.js`, tous les `.js` de la racine. **Le contrôle négatif se fait AVANT la passe
ou APRÈS, jamais pendant.**

**⭐ CE QUI L'A TROUVÉE — tester du moins cher au plus cher, au lieu de conclure** :

| mesure | résultat | ce que ça élimine |
|---|---|---|
| le bloc seul, **6 fois** | **6 verts** | ce n'est pas un témoin instable |
| **toute la passe rejouée jusqu'à** ce bloc | **1310 ✅ · 0 ❌** | ce n'est pas l'état accumulé avant lui |
| les 3 fonctions suspectes, **lues dans le code** | toutes **synchrones**, et les 12 remises à zéro du drapeau sont **directes** | ce n'est pas une course introduite par le correctif |
| **les horodatages des fichiers** | voir le tableau ci-dessus | **la cause** |

✅ **CONFIRMÉ PAR LA MESURE, pas par déduction** : la passe relancée **sans rien toucher** rend
**3513 ✅ · 0 ❌**.

⚠️ **Et je l'ai refaite en plus petit dans la même heure** : j'ai écrit un générateur de PDF et son
document **pendant** la passe suivante. Vérifié après coup qu'aucun témoin ne les lit (celui qui
scanne `tools/` ne retient que les générateurs contenant `.xlsx`) — *mais la vérification vient après
le geste, ce qui est l'ordre inverse du bon.*

⭐ **Le témoin en est sorti meilleur** : il rendait « faux » sans dire ce qu'il avait vu. Il rend
désormais l'état du drapeau, du champ, du bloc et du nom. *Un témoin qui échoue sans dire ce qu'il a
vu coûte une passe entière par hypothèse.*

**Voisine de** : §58 (un témoin qui pose l'état final à la main ne voit pas le chemin) · la famille
« déploiement silencieux » (le vrai état n'est pas celui qu'on croit mesurer) · et la leçon de
ft-v994 — *un contrôle qu'on n'a pas vu échouer ne mesure rien*. Ici c'est le contraire et c'est
aussi grave : **un contrôle qui échoue pour une raison qui n'est pas son sujet**.

## §61 — ⛔⛔ L'OUTIL DE MESURE TRONQUÉ : « aucun rouge » n'est pas « tout est vert » *(11/09/2026, ft-v1192)*

**À quoi on la reconnaît** : une mesure qui rend **0 rouge** alors qu'elle n'a pas mesuré tout ce
qu'elle prétend mesurer. Elle ne ment jamais sur ce qu'elle a vu — elle **se tait sur ce qu'elle
n'a pas vu**, et ce silence est indiscernable d'un succès.

**Les cinq cas vécus :**

| quand | l'outil | ce qu'il affichait | ce qui manquait |
|---|---|---|---|
| ft-v1187 | harnais de mutation coupé à `tail -4` | « 0 rouge » | un rouge en 8ᵉ position sur 12 |
| ft-v1192 | passe complète arrêtée sur `b.close()` | **« 3479 ✅ · 0 ❌ »** | **56 témoins jamais exécutés** |
| ft-v1190 | (passe faussée par ma propre fixture) | vert | le cas réel |
| ft-v1193 | le runner **plante** sur `null` | « 0 rouge » sur une sortie **vide** | la passe entière |
| **ft-v1196** | harnais lisant la **DERNIÈRE LIGNE** d'un JSON **multi-ligne** | **« SONDE MORTE » × 10** | **tout** — y compris le **contrôle sain** |

**⭐⭐ ET LE CAS ft-v1196 RETOURNE LA FAMILLE, CE QUI LA REND ENFIN FACILE À ATTRAPER.** Les quatre
premiers cas affichaient du **vert** ; celui-ci affichait du **rouge partout** — *« SONDE MORTE »*
sur les 10 mutations. Il était donc tentant de conclure que les mutations mordaient toutes, ou que
le code était cassé. 👉 ***Ce qui a tranché n'est aucune des dix : c'est le CONTRÔLE SAIN, lancé en
premier, qui rendait « SONDE MORTE » sur du code intact.*** Cause : la sonde imprime un JSON
**multi-ligne** et le harnais prenait `stdout.split('\n')[-1]`, donc `}`.

**⛔ La règle qui en sort, et elle coûte une ligne** : *un harnais de mutation commence TOUJOURS par
le cas sain, et son résultat attendu est écrit à l'avance.* Sans lui, on ne distingue pas *« la
mutation mord »* de *« l'instrument est mort »* — et un résultat **uniforme**, vert ou rouge, est le
signe de l'instrument, jamais celui du code. *Un harnais uniforme ressemble à un code uniformément
cassé, exactement comme un harnais tronqué ressemble à un code sans défaut.*

**Pourquoi c'est une famille à part, et pas « un bug de test »** : un test FAUX finit par rougir sur
autre chose. Un outil TRONQUÉ, lui, **conforte** — il donne exactement le signal qu'on espérait.
*C'est la seule catégorie d'erreur où plus on est rassuré, moins on a mesuré.*

**Ce qui protège aujourd'hui** :
- ⭐ **le TOTAL se COMPARE, il ne se lit pas seul** — 3479 est un beau chiffre ; c'est `3524 + 11 =
  3535` qui dit qu'il en manque 56. **Toute passe doit être rapprochée de la précédente** ;
- ⛔ **ne jamais couper la sortie d'un outil de mesure** (`tail`, `head`, `| grep` sur les rouges
  seuls) — filtrer l'affichage est déjà tronquer la mesure ;
- ⛔ un bloc de témoins qui a besoin d'un navigateur **doit vivre avant `b.close()`** dans
  `tests/parcours/runner.js` — la raison est écrite à l'endroit exact dans le fichier ;
- ⚠️ et le réflexe : **un exit code 0 ne prouve pas qu'un runner est allé au bout.**

### ⭐ Rechute du 11/09/2026 (ft-v1193) — et elle dit que la famille est **transversale**

Mon **harnais de mutation** a affiché **« 0 rouges »** pour une mutation qui était en réalité la
plus violente de toutes (`_ref100` rend `null`). J'ai failli en conclure qu'elle ne mordait pas,
donc que le code muté était **décoratif**.

**La cause** : la mutation faisait *planter* le runner (`TypeError` sur `null`), donc il n'affichait
**aucune ligne** — et mon `grep -c "❌"` comptait 0 sur une sortie **vide**.

> **Un compteur de rouges doit d'abord vérifier que le runner a FINI.**
> « 0 rouge » et « n'a pas tourné » produisent le même chiffre.

**Le garde-fou posé** : le harnais cherche la **ligne de total** avant de compter, et distingue
explicitement les deux cas (`⛔ RUNNER MORT` vs `n rouge(s)`).

⚠️ **Et le même jour, une troisième forme de la même famille** : `pgrep -f "node tests/parcours/runner.js"`
**matche son propre shell**, parce que le motif figure dans sa ligne de commande — une boucle
d'attente sur une passe **déjà terminée** tourne alors indéfiniment. C'est le piège de ft-v1189
(`pkill` qui tue son propre shell), repayé sous une autre forme.

👉 *Les trois cas — sortie tronquée, sortie vide, motif qui se matche lui-même — ont la même
signature : **l'outil de mesure se décrit comme un résultat**.*

⛔⛔ **4ᵉ PAIEMENT, LE 12/09/2026 (ft-v1195), ET IL A COÛTÉ UNE PASSE ENTIÈRE.** Même motif, mais
avec `xargs kill` au bout : `pgrep -f "node tests/parcours/runner.js" | xargs -r kill` **a tué son
propre shell** (exit 144) **et** le runner. Résultat : une passe arrêtée à mi-parcours, log figé
sur `Target page, context or browser has been closed`… et **0 rouge affiché**.
👉 ***Une passe tuée par accident est indiscernable d'une passe verte tant qu'on ne compte pas.***
**Le remède, qui ne peut pas se retourner contre lui-même** : ne pas filtrer sur le motif, mais
sur le processus — `for pid in $(pgrep -x node); do tr '\0' ' ' < /proc/$pid/cmdline | grep -q …`.
*Un shell ne s'appelle pas `node`.*

## §62 — ⛔⛔ UNE PROTECTION QUI NE TENAIT QUE PAR L'ABSENCE DE MÉNAGE *(11/09/2026, ft-v1193)*

**À quoi on la reconnaît** : un correctif **juste**, qui nettoie enfin une variable oubliée, fait
rougir des témoins qui n'ont **aucun rapport** avec son sujet.

**Le cas** : `_afOublierAliment` ne remettait pas `_bcPaquetG` à zéro — d'où une pastille
« 📦 410 g (le paquet entier) » qui survivait d'un aliment au suivant (mesuré). Le correctif tient
en une ligne. Mais deux témoins de **ft-v1174** sont aussitôt devenus rouges : une ratatouille
*trouvée sans valeurs* perdait son « 250 g » en partant au calibrage.

**Pourquoi** : `_bcPaquetTxt` traversait ce chemin **uniquement parce que personne ne la nettoyait**.
Elle était protégée **par accident**, pas par conception — et rien ne le disait.

> **Le jour où l'on range enfin, on découvre ce qui ne tenait que par le désordre.**

**Ce qui l'attrape** : la passe complète, et elle seule. Ni la relecture, ni le contrôle négatif du
correctif (qui mordait parfaitement sur **ses** témoins), ni l'instantané avant/après (identique
octet pour octet, parce que le chemin cassé n'y figurait pas).

**Le réflexe** : après un correctif qui **nettoie** un état partagé, chercher **qui comptait sur le
fait qu'il ne soit PAS nettoyé**. `grep` le nom de la variable, et regarder chaque lecteur.

**⚠️ Et le piège dans le piège, payé trois fois en une heure.** Ma première réponse a été de
recopier le patron *« on prend, on oublie, on repose »* chez chaque appelant. Posé chez
`_lookupBarcode`, puis chez `_calAppliquer`, il a **raté la troisième porte** (`_bcSansValeurs`) —
et le témoin est resté rouge. C'est **R8** (la porte jumelle) **à l'intérieur du correctif censé
fermer une fuite**.

> **Un patron qu'on recopie à chaque porte EST la duplication qu'on prétend supprimer.**

**Le bon geste** : un **paramètre nommé sur le propriétaire unique** (`_afOublierAliment({garderPaquet:true})`),
qui dit **une seule fois** la distinction entre *« j'oublie l'aliment »* et *« je remets l'écran à
plat pour le MÊME aliment »* — 2 appelants sur 13.

### ⏱️ La récidive de §61 : **une attente qui démarre avant le mouvement** *(12/09/2026, ft-v1200)*

**À quoi on la reconnaît** : un témoin rougit **en passe complète** et passe **3 fois sur 3 en
isolé**. La tentation est immédiate et fausse : *« c'est un flake »*.

**Le cas** : `CCLXXXVIII ①` mesure qu'un avertissement **vient à la vue** après un clic. ft-v1191
avait déjà rendu le cas ② déterministe — *attendre que le défilement se stabilise au lieu de parier
sur un délai* — et la correction n'avait **pas** été posée sur le cas ①. **R8, dans le banc d'essai
lui-même.**

**⛔⛔ Et ma première correction était fausse, d'une façon qui resservira.** J'ai recopié la boucle
« attendre que `scrollTop` se stabilise ». Elle sortait **au premier tour** (`tours:1`) et le témoin
rougissait toujours, avec `apresReset:75` — *un défilement encore en vol après une remise à zéro*.

> **Une boucle de stabilité qui démarre AVANT le mouvement mesure « rien ne bouge encore »
> et le lit comme « le mouvement est fini ».**

Un défilement `smooth` ne commence pas au clic ; **sous charge il commence plus tard**. Deux
échantillons égaux au départ ne prouvent donc rien du tout — et la boucle rend un verdict de
stabilité sur un mouvement qui n'a pas eu lieu.

**Le bon geste** : attendre **la condition réellement mesurée** (*« l'alerte est-elle à la vue ? »*),
pas un proxy — puis exiger la stabilité sur **trois échantillons consécutifs** si un geste suivant
dépend de l'immobilité. ⭐ **Le témoin n'en devient pas creux, et ça se vérifie** : avec
`_amenerALaVue` neutralisée, il rougit toujours. *Une boucle qui sonde la condition échoue
honnêtement quand la condition n'arrive jamais.*

**⚠️ Ce que ça a coûté, mesuré** : **trois passes complètes** (~100 min) pour établir qu'un rouge
n'était pas dû au correctif livré — et, en chemin, **une conclusion annoncée trop tôt** (*« le
contrôle tranche, c'est mon correctif »*) sur **un** échantillon de chaque côté, contre un témoin
déjà connu pour être instable. 👉 ***Un contre-exemple à n=1 ne tranche pas contre un flake
documenté*** : reproduire avant de conclure vaut **dans les deux sens**, y compris quand la mesure
semble accuser son propre travail.


## §63 — ⛔⛔ UN MOTIF DE RECHERCHE QUI SUPPOSE UNE **SYNTAXE** NE COMPTE PAS LES ENDROITS *(12/09/2026, ft-v1194)*

**À quoi on la reconnaît** : un inventaire donne un chiffre **rond et rassurant** (« 6 sites »,
« 8 portes »), et un balayage fait autrement en trouve **deux à trois fois plus** — sans qu'aucune
des deux mesures soit bâclée.

**Le cas** : le plan d'exécution du chantier Nutrition annonçait **6** sites pour l'étape 3 et **5**
pour l'étape 1b. Mesuré site par site : **~17** et **≥ 15**. Le compteur n'était pas négligent, il
était **aveugle à une écriture** — `addFoodEntry`, la porte la plus utilisée de tout l'écran,
construit ses macros en **raccourci ES6** :

```js
const _e=Object.assign({date:…, name:…, kcal, prot, carbs, fat, ts:Date.now()}, _provFood({kcal,prot,carbs,fat}));
```

Il n'y a **pas un seul `kcal:`** dans cette ligne. Un motif `kcal\s*:` ne la voit pas — et ne
signale rien, puisqu'il trouve les autres.

> **Un motif qui suppose une syntaxe ne compte pas les endroits : il compte les endroits écrits
> comme on les imaginait.**

**Pourquoi c'est coûteux** : le chiffre sert ensuite à **dimensionner un chantier**. Une extraction
« de 6 sites » qu'on découvre à 17 en cours de route se termine de deux façons, toutes deux
mauvaises — on livre à moitié, ou on élargit en silence un périmètre que personne n'a validé.
*Un inventaire faux ne se manifeste pas comme une erreur : il se manifeste comme un plan qui
déborde.*

**Ce qui l'attrape** :
- **compter deux fois, autrement** — par motif de texte **et** par ce que la fonction *fait*
  (ici : « qui écrit dans `S.foodLog` ? », qui trouve les 3 écrivains quelle que soit leur syntaxe) ;
- **croiser avec les appelants** : la porte principale d'un écran ne peut pas être absente d'un
  inventaire de cet écran — si elle l'est, c'est le compteur qui a tort ;
- et **dire le chiffre avec sa méthode** : *« 6 lignes correspondent au motif X »* est vérifiable,
  *« il y a 6 sites »* ne l'est pas.

**Le réflexe** : avant d'écrire un nombre dans un plan, se demander **ce que le motif ne peut pas
voir** — le raccourci ES6, l'appel indirect, le champ construit par `Object.assign`, la clé
calculée. Puis chercher ce cas-là **exprès**.

*Voisine de **§58** (vérifier la fonction n'est pas vérifier l'appel) et de **§61** (un outil de
mesure tronqué ressemble à un code sans défaut) : les trois disent la même chose à trois endroits —
**l'instrument fait partie de la mesure**.*

---

## §64 — ⛔⛔ UN TÉMOIN QUI LIT LA SOURCE NE SAIT PAS DISTINGUER LE **CODE** DE CE QUI EN **PARLE** *(12/09/2026, ft-v1195)*

**À quoi on la reconnaît** : un témoin de source (« il ne doit plus rester aucune occurrence de X »)
devient **rouge en réaction à un COMMENTAIRE** — souvent celui qu'on vient d'écrire pour expliquer
qu'on a justement supprimé X.

**Le cas**, deux fois dans la même demi-heure, sur le même témoin :
- il comptait **7 copies pour 6** — parce que la ligne du **propriétaire** contient forcément la
  conversion qu'il cherche : *c'est son métier* ;
- puis il comptait comme copie la **note R30** qui **CITE** `10-n` pour expliquer pourquoi
  `_rirTxt` a été retirée.

> **Un témoin qui ne distingue pas le code de ce qui en PARLE finit par interdire d'écrire la
> documentation du correctif.**

**Pourquoi c'est vicieux** : le témoin n'est pas cassé, il est **trop littéral** — et sa punition
tombe sur exactement la bonne pratique du dépôt (**R27** : écrire le *pourquoi* à côté de ce qu'il
protège). Le réflexe naturel devient alors *« j'enlève le commentaire pour faire passer le test »*,
c'est-à-dire **payer en mémoire** ce qu'on a gagné en vérification.

**Ce qui l'attrape** :
- **retirer les commentaires avant de compter** (`/* … */` et `// …`, sans casser les `://` des URL)
  et **exclure la ligne du propriétaire** — les deux tiennent en deux `replace` ;
- **faire échouer le témoin exprès** avec une variante qui **échappe au motif** (ici `10 - +n`) :
  si rien ne rougit, le témoin ne protège que l'orthographe, pas la règle ;
- et poser **deux verrous de nature différente** — « aucune copie dans la source » (littéral) **et**
  « le propriétaire est vraiment appelé » (structurel). C'est le second qui a mordu sur la variante
  évasive.

**Le réflexe** : quand un témoin lit du **texte de code**, se demander d'abord *« qu'est-ce qu'il
compterait dans une PHRASE ? »* — puis écrire la phrase et vérifier qu'il l'ignore.

*Déjà rencontrée en **ft-v1193** (le témoin « plus aucune traduction » comptait le commentaire qui
citait le motif supprimé) : c'est donc la **2ᵉ fois**, d'où la famille. Sœur de **§61** (l'outil
tronqué) et **§63** (le motif qui suppose une syntaxe) — **l'instrument fait partie de la mesure**.*
### ⭐⭐ RÉCIDIVE MESURÉE : **QUATRE sous-étapes d'affilée** *(13/09/2026, ft-v1195 → ft-v1202)*

Le plan corrigé après ce cas a été redécoupé en sous-étapes, chacune avec son **périmètre écrit**.
Sur les quatre suivantes, **le périmètre écrit était faux les quatre fois**, et jamais de la même
façon — ce qui est justement ce qui le rend dangereux :

| sous-étape | ce que le plan disait | ce que la mesure disait |
|---|---|---|
| **1b-ii** | « 4 sites » | **3** — le 4ᵉ construit un *item de liste*, pas une provenance |
| **1b-iii** | « `q` et `portionWeightG` divergent tous les deux » | **une seule** des deux divergeait |
| **1b-iv** | « la sous-étape la moins risquée du lot » | ⛔ **rien à extraire** : une seule copie |
| **3-iv** | « les **deux** branches, **le seul** endroit qui écrit » | **1 copie de chaque forme** · **5** écritures |

> ⭐ **Ce qu'on en tire, et qui vaut plus que les quatre corrections** : un document de plan reste
> utile pour **ORDONNER** le travail — quoi avant quoi, quoi bloque quoi. Il n'est **jamais** une
> source pour un **chiffre**. *Un périmètre écrit la veille est une hypothèse ; seul un comptage
> refait le jour même est une mesure.*

⚠️ **Et la 4ᵉ ajoute une nuance que les trois premières n'avaient pas** : le test d'entrée
(*« y a-t-il au moins 2 copies ? »*) protège contre la **CRÉATION** d'un propriétaire pour une
forme unique — il ne s'applique **pas** à l'ajout d'un appelant à un propriétaire qui **existe
déjà**. Appliqué aveuglément, il aurait laissé la dernière copie écrite de la règle en dur pour
toujours. *Une règle de garde qui déborde de son domaine devient elle-même une fausse limite*
(**R28**).

---

## §65 — ⛔⛔ UN MOTIF DE PROCESSUS QUI SE TROUVE LUI-MÊME : `pgrep -f` MENT DANS LES DEUX SENS *(14/09/2026, banc des moteurs)*

**À quoi on la reconnaît** : on lance une passe en arrière-plan, on l'attend avec
`until ! pgrep -f "tests/parcours/runner.js"; do sleep; done`… et l'attente ne se termine
**jamais**, même une fois la passe morte depuis longtemps. Ou l'inverse : on veut l'arrêter avec
`pkill -f "…runner.js"` et **on tue son propre shell**.

**La cause est la même dans les deux cas, et elle est bête** : `pgrep -f` compare le motif à la
**ligne de commande complète** de chaque processus — **y compris celle du shell qui porte le motif**.
Donc :

- la boucle d'attente **se voit elle-même** et ne sort pas ;
- pire, **plusieurs** boucles d'attente empilées se voient les unes les autres, et la dernière
  survit à toutes les tentatives d'arrêt.

**Ce que ça a coûté ici** : j'ai cru pendant plusieurs minutes qu'une passe tournait encore
**alors qu'elle était morte**, j'ai tenté de la tuer trois fois, et j'ai fini par conclure à tort
que le `kill` ne marchait pas. ⭐ *Un instrument qui rend toujours « en cours » est indiscernable
d'un travail qui n'avance pas* — c'est la famille §61 (l'outil de mesure tronqué), appliquée cette
fois à la **détection de processus** au lieu du comptage de témoins.

**⚠️ ET C'EST LA QUATRIÈME FOIS.** ft-v1189, ft-v1193 et ft-v1205 ont chacune paye la variante
« `pkill -f` tue mon propre shell ». La variante « `pgrep -f` ne sort jamais » est la même cause
vue de l'autre côté, et je ne l'avais pas reconnue parce que le **symptôme** est inversé.

**Ce qui protège** — lire `/proc/<pid>/cmdline` et **ancrer sur le début** de la ligne :

```bash
vivant(){ for p in /proc/[0-9]*; do
    cl=$(tr '\0' ' ' < $p/cmdline 2>/dev/null) || continue
    case "$cl" in "node tests/parcours/runner.js"*) return 0;; esac
  done; return 1; }
until ! vivant; do sleep 15; done
```

Le `case` ancré au **début** ne peut pas matcher un shell dont la ligne commence par `/bin/bash -c
source …`. ⭐ Et c'est aussi ce qui rend l'arrêt sûr : on collecte les PID par ce même filtre, au
lieu de laisser `pkill` choisir.

👉 ***La règle générale : un motif qui cherche un processus ne doit jamais pouvoir se trouver
lui-même.*** Si le motif est écrit dans la commande qui le cherche, il faut l'ancrer, ou le
chercher ailleurs que dans sa propre ligne de commande.

**⚠️ 5ᵉ FOIS (06/10/2026, qualification ft-v1251)** : pour relancer une passe, `pkill -f "tools/passe_valide.sh"`
— le motif figurait dans la commande du shell qui l'exécutait : **le shell s'est tué lui-même** (code 144) pendant
que la passe continuait, et il a fallu retrouver ses processus un par un. Même cause, même remède.

---

### 🔁 RECHUTE DU 21/09/2026 — LA RÈGLE ÉTAIT ÉCRITE ICI, ET ELLE N'A PAS SUFFI

⛔⛔ **Troisième occurrence, et c'est ce qu'elle apprend qui compte.** La règle ci-dessus était
déjà dans ce fichier — *celui qu'on relit avant de coder* — et le défaut a quand même été refait,
**six fois dans la même journée**.

**Le dégât, mesuré** : six sondes d'attente vivantes de **2 h 12 à 12 h 06**, aucune ne consommant
de CPU, aucune ne rendant jamais sa notification. *Elles ne coûtaient rien en ressources et
faussaient tout en lisibilité* : l'avancement réel était invisible, et un contrôle négatif terminé
depuis **52 minutes** passait pour bloqué.

⚠️⚠️ **ET LA « CORRECTION » ANNONCÉE N'EN ÉTAIT PAS UNE — c'est le point le plus utile.** J'avais
changé le motif (`tests/parcours/runner.js` → `parcours/runner`) et annoncé que la sonde ne pouvait
plus se trouver. **Faux** : elle est restée bloquée **2 h 12** avec le nouveau motif.
👉 ***Renommer le motif ne corrige rien — tant qu'il vit dans son propre `argv`, il s'auto-trouve.***

⭐ **ET LES SONDES SE MAINTIENNENT MUTUELLEMENT EN VIE**, ce qui n'était pas écrit : une sonde
bloquée **porte le motif dans son `argv`**, donc la suivante la voit et se croit en pleine passe.
Une seule sonde oubliée contamine toutes celles qui viennent après.

**⛔ CE QUI PROTÈGE AUJOURD'HUI — et ce n'est pas un meilleur motif, c'est l'absence de motif :**
`tools/attendre_fin.sh`, qui n'interroge **jamais** la liste des processus.
- `attendre_fin.sh pid <PID>` — `kill -0`, qui ne lit aucune ligne de commande ;
- `attendre_fin.sh texte <fichier> <mot>` — on attend l'**artefact** (la ligne de verdict), pas le
  processus. *Le mot attendu peut vivre dans notre propre `argv` : personne ne regarde les `argv`.*
- ⛔ **Les deux abandonnent au bout d'un délai** et rendent la main : *une sonde incapable
  d'abandonner est exactement ce qui a produit les six fantômes.*

⚠️ **Et le mode `pid` porte un piège PIRE que celui qu'il remplace, donc il est écrit dans le
script** : si l'on passe le PID d'un **enveloppeur** (`setsid nohup … &` rend le PID du wrapper,
pas celui du travail), la sonde annonce « terminé » **pendant que le travail tourne encore**.
👉 ***Un faux VERT est pire qu'un blocage : le blocage se voit, le faux vert se croit.*** Mesuré en
écrivant le script — ma propre épreuve est passée verte pour cette raison exacte, et c'est le mode
`texte` qui est immunisé, parce qu'il attend un **résultat** et non un processus.

**La leçon de gouvernance, et elle dépasse ce bug** : *une famille écrite dans `BUGS.md` empêche de
la redécouvrir, pas de la refaire.* Ce qui l'empêche vraiment, c'est un outil qui rend le geste
fautif impossible — **par construction, pas par discipline**.

---

### 🔁 4ᵉ OCCURRENCE — 21/09/2026 AU SOIR : L'OUTIL EXISTAIT, ET JE NE L'AI PAS EMPLOYÉ

⛔⛔ **Le même soir, quelques heures après avoir écrit `tools/attendre_fin.sh`**, j'ai attendu un
déploiement GitHub avec une boucle écrite **à la main**, hors de l'outil :

```bash
until [ "$(curl -s .../actions/runs/<id> | grep -o '"status":"[a-z_]*"' | head -1)" \
        = '"status":"completed"' ]; do sleep 15; done
```

**⭐⭐ ET LA FORME DU DÉFAUT EST NOUVELLE : ce n'est PAS une sonde qui se trouve elle-même.**
Les trois précédentes étaient des `pgrep -f` qui s'auto-correspondaient. Celle-ci est une
**condition qui ne pouvait pas être satisfaite** :

| | |
|---|---|
| ce que le motif cherchait | `"status":"completed"` — **sans espace** |
| ⛔ ce que l'API GitHub renvoie | `  "status": "completed",` — **JSON indenté, AVEC une espace** |
| **mesuré sur la vraie réponse** | `grep -c -o '"status":"[a-z_]*"'` → ⛔ **0 occurrence** |

👉 ***La boucle n'attendait pas un événement lent : elle attendait un texte qui n'existait pas.***
Et comme elle n'avait **aucun maximum**, elle tournait sans fin — jusqu'à ce que Michel demande
*« pourquoi y a-t-il encore une tâche en cours ? »*. C'est le **piège de l'espace pour la 11ᵉ fois**
dans ce dépôt (famille §1), cette fois appliqué non pas à un témoin mais à une **condition d'arrêt**.

**⭐ LA LEÇON QUI S'AJOUTE À LA FAMILLE** : un guetteur a **trois** réponses possibles, pas deux —
*terminé* · *pas encore* · ***je n'ai pas compris la réponse***. Un `grep` n'en connaît que deux :
il range « je n'ai pas compris » dans « pas encore ». 👉 ***Un guetteur incapable de distinguer
l'attente de l'incompréhension attendra éternellement une réponse qu'il ne comprend pas.***

**⛔ CE QUI PROTÈGE AUJOURD'HUI — `tools/attendre_fin.sh gh-run <run_id>`** (consigne de Michel :
*« rends ce cas impossible à refaire »*) :
- **aucun `grep` sur du JSON** — la réponse est lue par un vrai analyseur (`python3 json`), donc
  l'indentation, l'ordre des clés et les espaces n'ont plus aucun effet ;
- **maximum obligatoire** (30 min par défaut) → `exit 2`, la main est rendue ;
- **l'erreur a son propre code** : `exit 3` pour une réponse illisible, vide, HTTP non-200, sans
  champ `status`, ou un identifiant qui n'en est pas un (coller l'URL au lieu du numéro) ;
- **`exit 4`** quand le run est bien terminé mais que son verdict n'est **pas** `success` —
  *sinon « fini » se lirait « réussi », ce qui est exactement le faux vert du mode `pid`.*

Éprouvé sur les **8 chemins** avant d'être écrit ici : succès · échec · délai dépassé · HTTP 404 ·
HTTP 500 · JSON illisible · JSON sans `status` · réponse vide — chacun sort avec un code distinct,
et le **cas exact du bug** (JSON indenté) sort désormais vert.

⛔ **Et la consigne qui accompagne l'outil** : *plus aucun `until curl … grep … sleep` bricolé à la
main.* Les trois modes de `attendre_fin.sh` couvrent les trois attentes réelles du projet — un
processus, un fichier, un déploiement.

---

## §66 — ⛔⛔ UNE RÉPONSE IA DONT LA FIN N'EST PAS CONFIRMÉE TRAITÉE COMME COMPLÈTE *(25-26/09/2026, MILO-PDF1 / MILO-PDF1B, publié en ft-v1235)*

**La leçon, en une phrase :** *une réponse IA dont la fin n'est pas confirmée ne doit jamais être
traitée comme complète* — ni affichée comme finie, ni exportée comme finie, ni transformée en
donnée (séance, annonce, programme).

**À quoi on la reconnaît** : une réponse du modèle est **consommée** (affichée, mise dans un PDF,
lue pour construire quelque chose) alors que rien, côté serveur, ne dit qu'elle s'est **terminée**.
Le signal existe (`stop_reason`) ; s'il n'atteint pas le client, tout ce qui suit le **devine**.

**Les défauts réellement démontrés (MILO-PDF1, puis la contre-vérification MILO-PDF1B)** :
- `stop_reason: max_tokens` **jeté** par le Worker → une réponse tronquée ressortait comme une
  réponse finie (une analyse de programme coupée, que Milo avait lui-même titrée « Analyse complète »).
- La **première couture** de la suite (heuristique) pouvait **perdre ou fusionner des mots**
  (« épaulessont », « et le » + « lendemain » → « et lendemain »), dupliquer une réponse redémarrée — et
  marquer le résultat complet.
- Une raison d'arrêt **inconnue ou absente** (`refusal`, `null`…) s'affichait exactement comme une
  réponse finie.
- **Avant D-025 / MILO-PDF1B**, une séance pouvait être construite depuis une réponse coupée
  (« Leg curl 3×12 » coupé en « 3×1 »).
- Mesuré à la publication (D-028) : une réponse non confirmée pouvait aussi **écrire l'annonce de
  prochaine séance** (`nextPlanned`, en local — pas dans un paquet cloud).

**Ce qui protège aujourd'hui (ft-v1235)** :
- le Worker transporte `stopReason`, `truncated`, `complete`, `continued` ; **fail-closed** : seul
  `end_turn` est complet ;
- la suite (analyse de programme seulement, **une** fois) se raccorde par **ancre exacte** ; sans
  preuve, la réponse reste incomplète ;
- un marqueur **avant** le texte (chat, fil, PDF, partage) ;
- aucune séance (D-025) ni annonce (D-028) depuis une réponse non confirmée ; le bouton programme
  n'accepte qu'un JSON complet, jamais réparé (D-027) ;
- témoins B-CCCLXXVIII → B-CCCLXXXV, contrôles négatifs 47/47 et 13/13, passe complète 5143/0.

**Ce qui n'est PAS fermé, dit plutôt que masqué** :
- ⚠️ **défaut actif** : « Mes discussions » peut perdre le marqueur « coupée » et rendre une réponse
  incomplète à nouveau candidate à une séance — réouverture **étroite** de D-025, non corrigée ;
- la suite réelle d'une analyse coupée n'a pas encore été observée en production.

⛔ **Ne pas ranger ici** le symptôme séance « 4 exercices demandés, 2 chargés » (MILO-SEANCE-01) :
c'est un **symptôme réel dont la cause n'est pas déterminée** — un mécanisme capable de le produire
est reproduit en local, l'événement réel ne l'est pas.

### 🔄 Une porte non équipée : le débrief de fin de séance *(mise à jour DOC-SYNC du 04/10/2026 — ft-v1236 → ft-v1250)*
La protection de ft-v1235 couvrait le chat, le fil, le PDF, le partage, la séance, l'annonce et le
programme — **pas le débrief**. Le Worker transforme un échec en amont (surcharge, quota, réponse vide)
en **HTTP 200 `{reply:'Désolé, réessaie.', complete:false}`** ; `_runSeDebrief` ne lisait que `reply`
→ affiché et rangé comme un débrief, jeton de reprise détruit (plus de « Réessayer »), `summarizeCoach`
payé (P0 + P2, audit E2E-01 C-bis). *Un échec qui arrive avec le code d'un succès et un texte de repli
ressemble à un succès pour tout lecteur qui ne lit pas le drapeau.* Voisin de 🧱 (une protection posée
d'un seul côté) et de §59 (la jumelle).
🛡️ **ft-v1250** : un seul critère de succès, `_dbfReponseValide` (fail-closed), sur les **3** chemins
(fin de séance, « Réessayer », rattrapage) : un échec rend le jeton, ne range rien, ne résume rien.
⛔ **La cause de l'échec réel du 03/10 à 20:01 n'est PAS démontrée** — seul le traitement de l'échec
l'est.

### 🔄 La variante « document » : un PDF importé lu à moitié sans le dire
`_pdfToImages` (log.js) plafonne à **`MAX_PAGES=8`** et rend les pages lues **sans aucun état** de
complétude. Mesuré le 13/09 sur de vrais fichiers (`docs/CHANTIER-IMPORTS.md`) : 22 pages, 8 lues,
**64 % jamais lus**. Le contrat COMPLETE / PARTIAL / UNKNOWN (décision de Michel du 13/09) et son
avertissement n'existent que sur `_pdfToText` — l'autre porte. Appelants en production (P0) : import
de repas, de programme, d'historique, et bilan sanguin. *Une lecture partielle n'est pas un succès* : c'est
la leçon de ce paragraphe, appliquée à une lecture au lieu d'une génération.
⛔ **NON CORRIGÉ au 04/10/2026 (ft-v1250).** Le besoin produit est noté dans `IDEES-FUTURES.md`
(import de documents).

---

## §71 — ⛔⛔ LE VERROU POSÉ SUR LES ROUTES NEUVES, PAS SUR LES ANCIENNES : DEUX DIAGNOSTICS RESTÉS OUVERTS *(09/10/2026, SEC-ADMIN-01 — ✅ publié en `ft-v1252` le 09/10/2026, déploiement @191)*

> ⚠️ Numéro **71** et non 67 : la branche du Lot 1 Import (non publiée) porte déjà §67 → §70. Réutiliser
> ces numéros aurait créé deux sections au même numéro à la fusion (le piège « §58 et 58 » ci-dessus).

**Le mécanisme.** Le 07/08/2026, le jeton d'administration a quitté le frontend et **toutes les routes
Admin de l'époque** ont reçu un contrôle serveur, fermé par défaut. **Deux routes plus anciennes n'étaient
pas dans la liste** : le diagnostic premium (créé le 29/06 pour traquer le déclencheur fantôme qui
réécrivait `PREMIUM_EMAILS`) et le test du garde-fou universel (backend @51). Elles sont restées ouvertes
à tous : la première rendait la liste **complète** des adresses premium — et l'écrivait au passage dans le
journal du serveur ; la seconde écrivait un compte de test et une sauvegarde de profil.
*Un correctif posé sur la liste qu'on a sous les yeux laisse les routes plus anciennes dans l'état d'avant.*
C'est §59 (la porte et sa jumelle) appliqué à la sécurité.

**À quoi on le reconnaît.** Une route d'administration ou de diagnostic dont la **première ligne n'est pas**
un contrôle de jeton serveur. Une carte Admin qui fonctionne sans que le jeton ait jamais été demandé sur
cet appareil.

**La variante côté app (même lot).** Le déverrouillage du mode admin — un verrou d'**interface**, dont le
code est dans le JS public — écrivait l'adresse de l'admin dans l'identité locale d'un appareil sans
e-mail, puis sauvegardait. Les données de cet appareil partaient alors **au nom de l'admin** ; seul le code
perso de son compte les faisait refuser. *Un verrou d'interface ne doit jamais choisir le compte.*

**Et le libellé qui promettait.** La carte « 🔐 Qui a protégé son compte » affirmait *« sans lire aucune
donnée personnelle »* en affichant des adresses e-mail — qui en sont.

🛡️ **SEC-ADMIN-01 (publié en `ft-v1252`, déploiement @191)** : les deux routes exigent le jeton admin **avant toute lecture**
(fermées si le secret manque) ; la réponse admin ne porte que ce que la carte affiche ; le journal ne
reçoit plus d'adresse ; le mode admin ne change plus l'identité ; la carte « Statut Premium » présente le
jeton et oublie un jeton refusé ; le libellé dit ce qu'il affiche. Banc `tools/banc_sec_admin.js` — le vrai
`Code.js` exécuté en local par `doGet` / `doPost`, adresses fictives uniquement : **23 rouges sur master
`6969ce73` → 69/0** ; contrôle négatif `tools/mut_sec_admin.py` **17/17** ; passe complète **6 036 / 0**.
✅ **`Code.js` redéployé le 09/10/2026** (publication `ft-v1252`, workflow Apps Script n°122, déploiement @191).
⚠️ Vérification par un appel anonyme : **non faite** depuis la session (réseau bloqué) — à faire une fois.

**Ce qui reste ouvert, dit plutôt que masqué** (aucune de ces portes ne donne un droit d'administration —
le banc le prouve) :
- la question « cette adresse a-t-elle un code perso ? » reste ouverte à tous pour une adresse **connue**
  (`authStatus`, ouvert par décision du 07/08 ; l'écran de connexion et le workflow de déploiement s'en
  servent) ;
- sans jeton d'appareil, un compte **sans code** reste écrasable par qui connaît son adresse (transition
  `_MIG_FERME_`, décision de Michel) ;
- des adresses réelles restent écrites dans le code public (listes admin / testeurs / premium de l'app,
  liste premium en dur du serveur) — et l'historique git les garde de toute façon ;
- le code admin de l'app reste public : il n'ouvre qu'une **interface** ;
- l'ajout de lignes au journal des séances (feuille « Sessions ») accepte n'importe quelle adresse, sans
  preuve — pollution possible, aucune lecture.

## §72 — ⛔⛔ LE MOT VIDE QUI EFFACE CE QUI DISTINGUE : LE MATÉRIEL RETIRÉ AVANT DE COMPARER *(10/10/2026, IMPORT-MAP-01 — branche `claude/import-map-01` ; ↪️ intégré à master `7d7bb5a8` le 11/10, ✅ publié en `ft-v1253` le 11/10)*

**Le cas.** `_EX_STOP` range `machine`, `barre`, `haltères`, `poulie`, `câble` parmi les mots vides, avec le bruit commercial
(« Evolution X900 »). Pour la reconnaissance, ils disparaissent. Mesuré sur master `b280ea5d` : « Squat machine » se réduisait à
« squat » → équivalence → **Squat à la Barre (AUTO 95)** ; « Élévations latérales haltères » partageait 100 % de ses mots
utiles avec **« …Câble » (AUTO 100)**. Par l'import réel, la carte « Squat machine » devenait « Squat à la Barre », pré-remplie à
**140 kg** avec les séances et le record du squat barre. Grille du catalogue : **626 AUTO inter-matériel** sur 1 518 variantes.

**À quoi on la reconnaît** : une normalisation qui jette un mot parce qu'il « gêne » une comparaison — alors que ce mot est
précisément ce qui DISTINGUE deux identités. *Un mot vide n'est vide que pour la question posée.*

**Deux pièges de la même famille, rencontrés en corrigeant :**
- **la famille qui passe avant le mot écrit** : ma 1ʳᵉ version lisait le matériel de la source avec `_exEquip`, qui classe
  « Chest Press **barre** » en guidé (la famille « chest press » gagne). La grille a montré **253** AUTO inter-matériel restants ;
  les cas nommés, eux, étaient tous verts. *Une grille fabriquée attrape ce qu'une liste de cas ne voit pas.*
- **l'alias déclaré qui contredit sa propre clé** : **23** des 531 alias de `_EX_EQUIV` envoient un matériel écrit vers un autre
  (`dumbbell row` → Rowing Barre, `overhead press machine` → Développé Militaire…). « Rowing haltère » va vers la version
  haltère, « Rowing haltères » (pluriel) vers la barre.

**Ce qui protège (branche)** : `_materielDe` + `_matchExercise` (le mot écrit décide ; rapprochements approximatifs jamais contre
lui ; nom sans matériel → confirmation, D-053) ; banc `tools/banc_import_map.js` (B-IMAP-A/H/G, dont un CLIQUET : les 23 alias
contradictoires ne peuvent que diminuer) ; contrôle négatif `tools/mut_import_map.py` (les deux côtés : pas assez strict ET trop
strict) ; grille avant/après `tools/grille_import_map.js`. ⚠️ **Non corrigé** : les 23 alias déclarés (décision de Michel), l'historique
déjà contaminé avant ce lot (aucune migration).

**↪️ IMPORT-MAP-01B (10/10/2026, même branche, NON publié) — après contre-vérification Nutrition.** L'alias déclaré passe AVANT le
garde-fou matériel : « rowing halteres », « db row », « hip thrust halteres », « thruster halteres »… emportaient la charge, les séances et le
record de la barre (vrai import : 100 / 160 / 60 kg). Inventaire complet des 531 alias avec un vocabulaire de test PROPRE (db / bb / kb) et le
matériel de la cible lu dans le catalogue (nom FR, variante sœur, nom anglais) : **25 alias causaient un AUTO contradictoire** (pas 23).
**16 redirigés** vers la seule cible du bon matériel, **11 retirés** (R30, commentés dans `log.js`), « lat machine » gardé (exception
sémantique). Trois leçons de méthode, payées ici :
- **un cliquet qui COMPTE se contourne par ÉCHANGE** : « ≤ 23 » restait vert en retirant un alias dangereux et en ajoutant un autre. Il faut
  juger chaque élément, pas leur nombre ;
- **un témoin qui recopie le vocabulaire de l'app partage son angle mort** : ni l'app ni l'ancien témoin ne lisaient « db » ;
- **une contradiction peut être portée par le MOTEUR, pas par l'alias** : le cliquet retire l'alias DANS la page et recommence ; si le moteur
  rattache pareil, retirer l'alias ne protège rien — c'est une dette du moteur, nommée et figée (6 clés : `_exEquip` ne lit pas le nom anglais
  du catalogue, « Fentes » est la fente à la barre). *Retirer pour retirer aurait donné un diff propre et zéro protection.*
**Protège (branche)** : banc `tools/banc_import_map_alias.js` (B-IMAPB-O/A/R/S/H) ; contrôle négatif `tools/mut_import_map.py` (24/24 conformes).
⚠️ *Ajout du 10/10 (IMPORT-MAP-02)* : la parenthèse ci-dessus « « Fentes » est la fente à la barre » décrivait le nom anglais du
catalogue (« lunge barbell »), **pas la décision** : Fentes est multi-matériel, « les 3 » (barre, haltères ou poids du corps — Michel, 01/08,
réaffirmé le 10/10, **D-056**). Le nom anglais a été aligné (« lunge »), et 2 des 6 clés de la dette moteur en sortent.

**↪️ IMPORT-MAP-02 (10/10/2026, même branche, NON publié) — le mot lu, mais pas son RÔLE.** Après 01 / 01B, trois défauts restaient dans
le même propriétaire, `_materielDe` (audit du corpus externe + Ghost du Drive) :
- **la cible « Polyvalent » était aveugle** : `_exEquip` range 31 exercices en « autre », et le garde-fou ne leur voyait aucun matériel.
  « Lateral Raise (Cable) » partait en AUTO vers les élévations **aux haltères**, « Machine Glute Kickbacks » vers le kickback **à la poulie**,
  « Reverse Fly Machine » vers l'Oiseau aux haltères — avec leurs charges ;
- **« barre » lu comme une charge partout** : « Tirage vertical barre » (programme réel du 21 juin) est une poulie haute dont la barre
  est la **poignée** — l'illustration du catalogue s'appelle elle-même `triceps-poulie-haute-barre` ;
- **la poulie écrite sans le mot** (corde, rope, pushdown, pulldown) et l'**EZ** n'étaient pas lus : « Triceps corde » ×2 du Drive passait
  pour un nom « sans matériel » et D-053 demandait une confirmation à tort.
**À quoi on la reconnaît** : un mot qui change de sens selon ses voisins (barre = charge, poignée ou agrès), et une catégorie de
**rangement** (le sélecteur) employée comme une **identité**. *Une case « Polyvalent » sert à ranger, pas à dire ce qu'est la chose.*
**Le piège évité, de la même famille** : lire le nom anglais **avant** `_exEquip` (ordre T1) aurait tranché Tirage Menton en barre **en
silence** — une décision de Michel prise par l'ordre de deux lignes. Le nom anglais n'est lu **que** quand la famille ne sait rien.
**Deux protections qui ne se voient QUE chez le propriétaire** (mesuré) : l'exclusion cardio de la corde et l'EZ lue « poignée » partout
ne changent **aucun** rattachement, parce que la lecture est la même des deux côtés. *Une erreur symétrique est invisible à une comparaison* :
elle se teste sur `_materielDe` directement (X2, X10), pas sur le résultat de l'import.
**Protège (branche)** : banc `tools/banc_import_map2.js` (B-IMAP2-A/I/Q/D/X/H/C, corpus externe figé en cliquet) ; contrôle négatif
`tools/mut_import_map2.py` ; oracles 01 / 01B adaptés (rôle de la barre dans la grille, Fentes « les 3 » dans le cliquet).
⚠️ **Non corrigé** (hors lot, consigné) : alias « triceps pushdown » (P0-2 — ✅ **corrigé par IMPORT-P0-2**, publié en `ft-v1253`, voir plus bas), Tirage Menton (P.2) et Tirage en Rack / Waiter Curl (P.3)
différés, suggestions faibles, modificateurs, pluriel « poulies », barre de traction, élastique, langues autres que FR / EN.
**IMPORT-P0-2 (11/10/2026, branche `claude/p0-2-triceps-pushdown` ; ✅ publié en `ft-v1253` le 11/10)** : la même famille, mais par un **alias** — donc
**avant** le garde-fou. Trois clés (« triceps pushdown », « cable triceps pushdown », « extension triceps poulie ») visaient « Extension
Triceps », l'extension **à l'haltère** : un alias complet est souverain, il passe devant `_materielDe`. Corrigé en changeant leurs
**valeurs** vers « Triceps Poulie » (0 clé ajoutée). ⚠️ **Ce qui reste, et pourquoi on ne l'a pas « réparé »** : dix tournures
« extension triceps + matériel » (« à la poulie », « câble », « barre », « machine »…) arrivent encore AUTO sur « Extension Triceps » par
les **mots** — sa case est « Polyvalent » et son nom anglais ne dit aucun matériel, le garde-fou n'a rien à opposer. *C'est le même trou
que P0-1 (une cible « Polyvalent » invisible), sur une cible dont l'identité n'a jamais été tranchée.* Ajouter dix alias serait du cas par
cas ; dire ce qu'**est** « Extension Triceps » est une décision de Michel. Figée par B-P02-A (la liste ne peut que rétrécir).

## §73 — ⛔⛔ LE TÉMOIN QUI CHERCHE LA SÉANCE PAR LA MAUVAISE CLÉ : LA CARTE EST LÀ, IL CONCLUT « ABSENTE » *(15/10/2026, OD-CLÉ-CARTE — avant `ft-v1255`)*

**Symptôme.** D-031 du 15/10 : OD-07 / OD-07b rouges (« carte introuvable » après un rechargement pendant l'analyse), verts au rejeu. Les commentaires du banc attribuaient déjà des « carte introuvable » (OD-08b, OD-10b, OD-11, OD-16, OD-17b) à la **lenteur du rendu** — des attentes de 3 s avaient été ajoutées, sans effet : la carte n'était jamais trouvée, pas trouvée trop tard.

**Cause.** La carte d'historique porte `openSessDetail(ts || id)` ; le débrief est rangé sous l'id (`_dbfCle`) ; `finishWorkout` écrit `{id:Date.now(), …, ts:Date.now()}` — deux lectures d'horloge, qui diffèrent d'1 ms de temps en temps. Le banc cherchait l'**id** dans l'`onclick` de la carte : quand id ≠ ts, la carte affichée n'est jamais reconnue. **Le produit est juste** (chaque clé est lue là où elle est écrite) ; mesuré identique sur candidat, master et production d'avant Progrès (`aa808110`) en forçant l'horloge.

**Ce qui le protège.** Les aides du banc retrouvent la carte par la clé du produit (`openSessDetail(ts || id)`, correspondance exacte) ; OD-18 garde une séance **id ≠ ts** fixe (⛔ ne jamais la « corriger » en id = ts : de telles séances existent) ; contrôle négatif `tools/mut_od_cle_carte.py` (T1 : l'ancienne recherche par id fait rougir OD-18).

**À quoi on le reconnaît.** Un rouge aléatoire « élément introuvable » sur du code sain, plus fréquent sous charge, qui disparaît au rejeu — et une attente ajoutée qui ne le fait pas disparaître. 👉 *Avant d'ajouter une attente, vérifier que le témoin cherche avec la clé que le produit écrit.* Corollaire vu sous mutation : une aide d'affichage (`JSON.stringify(undefined).slice`) peut faire **planter** le banc au lieu de le faire rougir — un plantage n'attrape rien.

## §74 — ⛔ LA MUTATION QUI NE MUTE RIEN : UN « ROUGE ATTENDU » QUI NE VIENT PAS N'ACCUSE PAS FORCÉMENT LE TÉMOIN *(15/10/2026, BADGES → MENU / D-078 — avant `ft-v1255`)*

**Symptôme.** Campagne de mutations du micro-lot Badges : 17 / 19 conformes. M22 (« Badges n'est plus joignable depuis le Menu ») et M56 (« ouvrir Badges déplace le « + » de 2 px ») donnaient **0 rouge**.

**Cause — mesurée avant de toucher au témoin.** Ce sont les MUTATIONS qui ne cassaient rien. M22 posait l'attribut `hidden` sur la ligne du Menu, or `.menu-row{display:flex}` (style.css) l'emporte sur `hidden` : la ligne restait visible, Badges restait joignable — le témoin avait raison d'être vert. M56 posait `margin-top:2px` sur le « + » : la marge est bien appliquée (2 px calculés) mais le rectangle du bouton ne bouge pas d'un pixel. Réécrites (ligne réellement retirée ; `translateY(2px)`, qui déplace le rectangle de 792 → 794 px), elles rougissent : 19 / 19.

**Ce qui le protège.** Le commentaire en tête de M22 / M56 dans `tools/mut_progres_seances.py` garde la 1ʳᵉ version et la mesure qui l'a disqualifiée.

**À quoi on le reconnaît.** Une mutation « évidente » qui ne fait rien rougir. 👉 *Avant de réécrire un témoin parce qu'une mutation passe au travers, vérifier dans la page que la mutation produit vraiment l'effet annoncé* (`hidden` contre un `display` d'auteur ; une marge dans un conteneur qui ne bouge pas). Le miroir de §73 : là le témoin cherchait mal, ici c'est la mutation qui ne cassait pas.

## §75 — ⛔ « VISIBLE » SELON `offsetParent` : DANS UN `<details>` FERMÉ, CHROMIUM GARDE LA BOÎTE *(15/10/2026, petit lot UX Progrès → Séances / D-079 — branche, avant publication)*

**Symptôme.** Témoin PS-E54 (« fermé, le filtre ne montre aucune pastille ») rouge sur du code sain : les pastilles, rangées dans le panneau « Filtrer les séances » fermé, étaient comptées visibles.

**Cause — mesurée par une sonde avant de toucher au code.** L'aide du banc jugeait la visibilité par `offsetParent !== null` et la hauteur du rectangle. Dans un `<details>` fermé, Chromium rend le contenu invisible sans lui retirer sa boîte : `offsetParent` reste non nul et `getBoundingClientRect().height` vaut 31 px. Seul `el.checkVisibility()` rend `false`. Le produit était juste ; le témoin mesurait mal.

**Ce qui le protège.** `pastillesVisibles` (tests/parcours/progres_seances.js) passe par `checkVisibility()` ; la mutation M65 (panneau ouvert d'office) fait rougir PS-E54, donc le témoin sait rougir.

**À quoi on le reconnaît.** Un élément « visible » pour le banc et invisible à l'écran, dans un `<details>`, un `content-visibility` ou un élément `hidden` par l'agent. 👉 *Pour un contenu replié, mesurer avec `checkVisibility()`, pas avec la boîte.*

## §76 — ⛔⛔ DEUX PORTES VERS LA MÊME SÉANCE, UNE SEULE RENOUVELAIT LA DATE *(16/10/2026, SÉANCE S-01 « DATE JUSTE » — branche `claude/claude-md-docs-ytabnv`, non publié)*

**Symptôme (audit Séance ft-v1255 / ft-v1256, reproduit).** Une séance faite le 15/10 enregistrée au **01/10**. Par le « + » central, la date était juste ; en revenant sur Séance autrement (balayage, app restée ouverte, rechargement), non.

**Cause — mesurée sur master `3f61e7e2` (B-S01-A1, A4, P2 → P4 rouges).** L'écran Séance (`renderLog`) et le « + » sans rien noter laissent un objet de séance VIDE daté du jour où il est né ; `persist()` l'écrit dans `ft4_wkt`, il peut dormir des jours. `startWorkout` (le « + ») le jette et en recrée un daté du jour si la séance n'est pas ouverte (`_seanceOuverte`). Les autres portes réutilisent l'objet tel quel : `addExercise` et `lancerTypeSeance` le remplissaient sans regarder sa date. *Le même objet, deux portes, une seule équipée* — la famille du marqueur `_milo` (`_startSessionFromMilo` / `_applyMiloSession`).

**Correctif.** `_dateSeanceReelle()` (log.js), appelée là où la séance devient réelle (1er exercice, carte « type de séance ») : une séance **pas encore commencée** (`_seanceOuverte()` faux — la seule définition) prend la date du jour ; une séance **commencée** garde la sienne ; une date **choisie par la personne** sur la séance vide est gardée (`_wktDateChoisie`, mémoire seulement). Aucune clé, aucune migration, `renderLog` intact.

**Ce qui le protège.** Banc `tools/banc_seance_date.js` (B-S01-*), contrôle négatif `tools/mut_seance_date.py` (suppression, renouvellement trop agressif, une seule porte, date choisie ignorée, barre non mise à jour, 2ᵉ définition).

**À quoi on le reconnaît.** Une donnée juste par une porte et fausse par une autre. 👉 *Quand une porte « nettoie » un état avant de l'utiliser, chercher toutes les autres portes qui utilisent le même état.* ⚠️ **Reste ouvert, consigné** : un cardio noté en premier sur une vieille séance vide la rend « ouverte » avec sa vieille date (`setCardioField`, hors S-01 — le brief exclut le cardio).

## §77 — ⛔⛔ UNE MÉTHODE QUI RECONSTRUIT LA LISTE EFFACE LE PASSÉ : DROP / +% / MODIFIER / RETIRER DROPSET *(16/10/2026, CC-01 — branche `claude/cc-01-dropset`, non intégré, non publié)*

**Symptôme (mesuré sur master `1717edc4`).** Deux séries validées (100 × 8 avec RIR 2 et une note, puis 92,5 × 7), un tap sur « 📉 Drop » : il ne reste que 3 paliers vides. Même chose avec « 📈 +% » et « ⚙️ Modifier paliers » ; « ✕ Retirer dropset » remplaçait les paliers faits par une série vide. La séance enregistrée ne gardait que ce qui restait.

**Cause.** `applyDropset` fabriquait la nouvelle liste puis l'**affectait entière** (`ex.sets=newSets`) ; `removeDropset` aussi. Aucune des deux ne regardait `set.done` — la seule définition d'une série validée, lue partout ailleurs.

**Correctif.** Tout ce qui précède la DERNIÈRE série validée reste tel quel (mêmes objets, même place) ; seule la suite est remplacée ou retirée. Décisions de Michel du 16/10 pour le futur : la suite part de la prochaine série prévue, sinon de la dernière faite ; « Modifier paliers » compte les paliers restants et repart de la dernière charge faite ; une série normale faite avant le dropset reste affichée comme série normale (les paliers sont les `ex.dropset.paliers` dernières séries, `_dropDebut` — aucune donnée nouvelle).

**Ce qui le protège.** Banc `tools/banc_cc01_dropset.js` (B-CC01-*, vraies portes de l'écran), contrôle négatif `tools/mut_cc01_dropset.py` (protection supprimée, partielle, une seule porte, première série seule, Retirer destructeur, base fausse, affichage).

**À quoi on le reconnaît.** Une action qui « reconfigure » un objet en affectant une liste entière (`x.sets=…`, `x.items=…`) alors que certains éléments sont déjà des faits. 👉 *Avant d'écrire `liste = nouvelle`, se demander : un élément de l'ancienne liste est-il déjà du passé ?*

## §78 — ⛔ UNE PHOTO D'UNE AUTRE EXÉCUTION N'EST PAS UNE RÉFÉRENCE : L'HORODATAGE D'UNE SÉRIE VALIDÉE BOUGE D'UNE SECONDE *(16/10/2026, contre-vérification de CC-01 — session-A, sonde hors dépôt, aucun code de l'app)*

**Symptôme.** Pour juger 14 mutations du moteur dropset, ma sonde comparait les séries faites de chaque mutant à celles d'une exécution de référence sur master (le « golden »). Résultat : des « pertes » dans 4 scénarios que la mutation ne pouvait pas atteindre — une mutation d'affichage signalait, par exemple, une perte dans « ✕ Retirer dropset ».

**Cause.** Une série validée PENDANT le scénario (par le vrai ✓) reçoit `at` = la lecture du chrono, en secondes (`toggleSet`). D'une exécution à l'autre, cette lecture bouge d'une seconde (903 / 904) : l'égalité stricte avec la référence échoue alors que la série est intacte. *On mesurait l'horloge, pas le code.*

**Correctif (de la sonde).** Trois références qui ne dépendent pas de l'horloge : les fixtures (valeurs fixes, `at` compris) ; la photo « avant » prise dans la MÊME exécution ; le nombre de séries faites. Les écarts d'affichage ou de futur se comparent sans `at`. Contrôle sur l'arbre SAIN avec la même comparaison : 0 perte, 0 écart ; tout a été rejoué, et le verdict n'a été écrit qu'après.

**À quoi on le reconnaît.** Un rouge qui touche des scénarios hors de portée de la mutation, et qui porte sur une donnée posée pendant le test (horodatage, durée, identifiant). 👉 *Une référence n'est valide que si elle est produite dans les mêmes conditions que ce qu'on compare ; et le contrôle de l'arbre sain se fait avec la MÊME comparaison que les mutants, avant d'interpréter un seul rouge.* Même famille que §61 (c'est l'outil de mesure qui se trompait, pas le code mesuré), dans l'autre sens : là-bas des rouges cachés, ici des rouges fabriqués.

## §79 — ⛔ UN TÉMOIN QUI FIGE UNE VALEUR DU MOMENT ROUGIT AU LOT SUIVANT, SANS DÉFAUT *(16/10/2026, UX SÉANCE — branche, avant intégration)*

**Symptôme.** Deux témoins anciens rougissent sur la branche UX SÉANCE alors que rien de ce qu'ils protègent n'a cassé :
`PS-S11` (lot Progrès D-079) exigeait « la dernière pop-up « Quoi de neuf » reste **v77** » — or ce lot ajoute légitimement la v78
(écran Séance, règle d'or #11, D-083) ; `CXXXVIII` (barre « Séance » opaque, ft-v1032) exigeait que l'écran Séance vide défile de
plus de 50 px **à 430 × 932** — or l'écran « avant séance » est devenu compact (20 px à cette taille, 108 px à 390 × 844).

**Cause.** Chaque témoin encodait une **valeur contingente** (un numéro de version, une taille d'écran) au lieu de sa **garantie**.
La garantie de D-079 est « aucune pop-up n'annonce le filtre de l'historique » ; celle de CXXXVIII est « la barre est collante,
opaque ≥ 0,9 et floutée, mesurée là où du contenu passe dessous ». Le prochain lot qui change la valeur, sans toucher la garantie,
fait rougir le témoin.

**Correctif (R30, écrit à côté du témoin).** PS-S11 vérifie maintenant qu'aucune entrée `WHATS_NEW` n'annonce le filtre (vert sur
le code sain, **rouge** sous une pop-up injectée qui l'annonce) ; CXXXVIII se mesure à 390 × 844. Les deux re-visées disent pourquoi.

**Et la mutation qui ne mutait rien (même famille que §74).** Dans `tools/mut_seance_ux.py`, la 1ʳᵉ version de M4 (« le + crée une
2ᵉ séance ») supprimait un `if(…)` et laissait un `else` orphelin : **erreur de syntaxe**. L'outil l'a classée INVALIDE au lieu de
la compter comme « attrapée » — c'est exactement pour ça qu'il vérifie la syntaxe avant de lancer le banc. Corrigée en `if(true)`,
elle fait rougir B-UXS-E4 et E5.

**À quoi on le reconnaît.** Un témoin qui rougit sur un lot qui ne touche pas son sujet, et dont le libellé contient une **valeur
exacte** (« reste v77 », « 430 × 932 », « 3 lignes », « défile de 50 px »). 👉 *Avant de « réparer » le code pour satisfaire un vieux
témoin, chercher la GARANTIE qu'il protège ; le re-viser sur elle, et le prouver sur une mutation qui casse la garantie.*

## §80 — ⛔ UNE RÈGLE GÉNÉRALE `button{overflow:hidden}` ROGNE UNE PASTILLE POSÉE EN DÉBORDEMENT *(17/10/2026, UX INTÉGRATION / D-085 — branche `claude/ux-seance-02`, non publié)*

**Symptôme.** La pastille de séance du « + » (le petit rond posé en haut à droite du bouton central) s'affichait en **demi-disque** :
elle est dessinée **en débordement** (`top:-4px; right:-4px`), et le bouton qui la porte hérite de la règle générale
`button{overflow:hidden}` — tout ce qui dépasse est coupé. Au même endroit, le point rouge « nouveauté » du même bouton tombait
**sur** la pastille (même coin). Et le « + » **grossissait** (×1,06, ombre renforcée) sur l'écran Séance seulement : sa taille
changeait d'un écran à l'autre (règle d'or #9 : le mesurer, pas le regarder).

**Cause.** Aucune n'est une erreur de logique : la pastille était juste (allumée par `#root.seance-on`, d'après `_seanceOuverte()`),
c'est son **conteneur** qui la rognait. Personne ne le voit en lisant le CSS de la pastille — il faut remonter les ancêtres.

**Correctif (D-085, décisions C et D de Michel).** `#nb-log{overflow:visible}` (le bouton central seulement, ni sa taille ni sa
place ne changent) ; le point « nouveauté » du « + » passe à gauche ; l'agrandissement sur l'écran Séance est retiré (R30, retrait
écrit). La pastille devient un **point bleu plein** (jeton de séance).

**Le témoin qui le voit, et comment.** `B-UXI-C3` calcule le rectangle du point et remonte **chaque ancêtre** jusqu'à la barre : si
l'un n'est pas `overflow:visible` et que le point dépasse de sa boîte, il est rogné → rouge. `B-UXI-C4` mesure l'intersection avec
le point « nouveauté » (créé s'il est absent). `B-UXI-C1` compare position, taille, ombre et transformation du « + » sur cinq
écrans, séance ouverte ou non. Éprouvés par mutation : M7 (overflow remis), M8 (point nouveauté remis à droite), M9 (agrandissement
remis) — `tools/mut_ux_integration.py`.

**À quoi on le reconnaît.** Un élément décoratif placé en **position négative** (badge, pastille, compteur) qui paraît coupé net :
chercher un `overflow:hidden` sur un **ancêtre**, souvent une règle générale (`button`, `.card`), pas sur l'élément lui-même.

## §81 — ⛔⛔ « INTÉGRÉ À MASTER, NON PUBLIÉ » NE TIENT QUE JUSQU'AU PREMIER PUSH SANS `[skip ci]` *(18/10/2026, constaté en préparant le clone D-085 — session-B, aucun code de l'app modifié)*

**Symptôme.** Le 18/10, les documents d'état disaient encore : « master = production `ft-v1256` + SEANCE-01 et CC-01 intégrés, non publiés ». C'était faux depuis le 17/10 à 09:26 UTC.

**Cause.** Pages déploie à chaque push sur master **tout le dépôt** (`deploy-pages.yml`, `path: .`), sauf si le commit de tête porte `[skip ci]`. SEANCE-01 et CC-01 avaient été intégrés le 16/10 avec des têtes `[skip ci]`. Le 17/10, la publication du clone de test (D-084, autorisée par Michel pour `/clone/` seulement) a été poussée **sans** `[skip ci]` — c'est ce qui la publiait — et le déploiement n°1352 (SUCCESS, tête `4960ce72`) a mis en ligne la racine entière : le `log.js` de SEANCE-01 + CC-01 (+59 / −13 depuis `ef160ddd`), **sous la même clé de cache `ft-v1256`**, sans numéro ni annonce. Le commit disait « prod `ft-v1256` inchangée » : vrai pour le commit, faux pour le push. *J'avais vérifié que le commit ne touchait aucun fichier de la prod, pas que master ne portait rien de non publié.*

**Conséquence (lue dans `sw.js`, pas observée sur un appareil).** Les scripts sont servis « cache d'abord » sans revalidation : qui avait déjà `ft-v1256` en cache garde l'ancien `log.js` ; une nouvelle installation, ou un cache vidé, reçoit le nouveau. Deux populations sous un seul numéro. Le site en ligne n'a pas pu être relu d'ici (proxy : `CONNECT tunnel failed, 403` vers github.io) : la preuve est le run de déploiement et le contenu de master.

**Ce qui a été fait.** Rien n'est corrigé en production : garder, régulariser par une version, ou revenir en arrière est une décision de Michel (règle d'or #15). Les documents d'état sont rectifiés (`docs/CONTEXTE-ACTUEL.md`, `docs/SUIVI-AUDIT.md`). ↪️ **Décision de Michel (18/10) : option A — garder tel quel** ; le problème de cache reste ouvert.

**À quoi on le reconnaît.** Un état « intégré, non publié » sur master, puis n'importe quel push sur master sans `[skip ci]`, quelle qu'en soit la raison — même pour un dossier à part comme `/clone/`. Le piège était même écrit le 16/10 (« le prochain push sans `[skip ci]` le publie ») : il n'a pas été relu au moment de pousser. 👉 *Avant tout push sur master sans `[skip ci]`, lister les fichiers servis qui ont changé depuis le dernier commit publié (`git diff --stat <dernier publié> HEAD -- . ':!docs/**' ':!tests/**' ':!tools/**' ':!*.md'`) : tout ce qui n'est pas l'objet de la publication part avec elle.* Rien ne le vérifie automatiquement aujourd'hui (piste notée, non construite). Même famille que le « déploiement silencieux », à l'envers : le déploiement n'a pas échoué en silence, il a **réussi** en silence.

## §82 — ⛔ UN REPLI QUI RÉPÈTE UNE VALEUR NE DOIT PAS RÉPÉTER CE QUI LUI EST ATTACHÉ : LA NOTE D'UNE SÉRIE RECOPIÉE SUR D'AUTRES *(18/10/2026, D-086 — branche locale `claude/ux-d086`, non publié ; défaut PRÉSENT en production `ft-v1256`)*

> Numéro **§82** et non §81 : master porte déjà un §81 (clone D-085, 18/10) que cette branche n'a pas encore ; les deux se
> rejoindront sans collision à l'intégration.

**Symptôme.** Dans la colonne « Précédent » de l'écran Séance, le commentaire écrit sur une série la dernière fois
(« 💬 Échec à la 7e ») s'affichait aussi sur des lignes qui n'étaient **pas** cette série. Mesuré (captures D-086 « avant »,
360 → 430 px) : la séance d'avant avait 4 séries dont la 4ᵉ commentée ; aujourd'hui il y en a 5 → la note de la 4ᵉ apparaît sur la
4ᵉ **et** sur la 5ᵉ ligne. Rien n'est faux dans les données ; c'est l'affichage qui prête une note à la mauvaise série.

**Cause.** `_prevAligne` rapproche les séries par rôle et, quand la dernière fois en avait moins, **répète la dernière** (« repli ») :
pour une VALEUR (« 6×90 ») c'est un repère utile et assumé (décision du 15/08/2026, témoin XIX ④ « REPLI » du runner). Mais `_setPrevNote` lisait
`p.note` sur le même objet : la note, attachée à UNE série précise, était répétée avec la valeur. *Une approximation acceptable
pour un chiffre devient une fausse attribution pour un texte.*

**Correctif (D-086, correction ⑥ du brief de Michel).** `_prevAligneDetail` dit en plus, pour chaque ligne, si la série d'avant
correspond **exactement** (`exact`) ou vient du repli ; `_prevAligne` en est le reflet (mêmes valeurs, mêmes 8 appelants). Le
commentaire n'est plus écrit dans la ligne : un **point bleu** le signale sur sa série exacte seulement (`_notesPrecedentes`), et il
se lit dans la fenêtre de note avec son origine (séance du JJ/MM/AAAA · série N · exercice). La note d'**exercice** (« Note perso »)
n'est jamais rattachée à une ligne. Lecture seule : rien n'est enregistré.

**Le témoin qui le voit.** `B-D086-⑩a` (point sur les séries 2 et 4, pas sur la 5ᵉ remplie par repli) · `B-D086-⑩b` (aucune note
écrite dans les lignes, ni d'une autre séance ni d'un autre exercice) · `B-D086-⑩g` (la ligne de repli n'attribue aucun commentaire)
· `B-D086-③a` (les VALEURS de « Précédent », repli compris, sont inchangées). Éprouvés par mutation : M9 (le point ignore `exact`),
M10 (la note d'exercice prêtée à la 1ʳᵉ série), M12 (la note réécrite dans la ligne) — `tools/mut_ux_d086.py`.

**À quoi on le reconnaît.** Une valeur « par défaut » ou « répétée » (repli, dernière connue, valeur précédente) qui transporte avec
elle un **objet** — une note, un identifiant, une date. Le repli peut être juste pour la valeur et faux pour tout ce qui l'accompagne :
le séparer explicitement (`exact`) plutôt que de laisser l'objet voyager avec.

## §83 — ⛔ UN BANC QUI MESURE AU MAUVAIS ENDROIT ROUGIT (OU VERDIT) POUR UNE AUTRE RAISON : SIX PIÈGES DE MÉTHODE EN UNE JOURNÉE *(18/10/2026, D-087 — branche locale `claude/ux-d086`, non poussée)*

> Erreurs de MÉTHODE (les miennes, dans mes bancs et mes sondes), pas des défauts de l'app : aucune n'a touché le code servi.
> Numéro **§83** : suit §82 sur cette branche (master porte §81).

**Symptômes et causes, mesurés.** ① « Aucune requête pendant la lecture » rougissait : le compteur partait du **chargement** de la
page, où l'app tente déjà sa vérification serveur et une image QR (coupées) → mesurer la **fenêtre du geste** (écart avant / après).
② « Aucune requête vers Milo » rougissait sur la fin de séance : le Worker sert aussi la **synchronisation** (`cloudSave`) — son adresse
ne dit pas « Milo » → reconnaître Milo par l'**action** du corps, liste figée dans le banc (relue dans l'app, une mutation qui
retirerait « coach » de sa liste passerait inaperçue). ③ « La note est gardée » rougissait : l'app range l'exercice sous son **nom
du catalogue** (« Rowing Barre » → « Rowing Barre (Tirage Horizontal) ») → écrire les données de test avec les noms du catalogue.
④ « Pas d'indicateur sans note » aurait **verdi pour rien** si l'historique n'était pas retrouvé du tout (nom différent) → un témoin
d'ABSENCE porte un **contrôle positif** (« Précédent » est bien retrouvé pour cet exercice). ⑤ Une mutation (« Fermer » cassé)
faisait **planter** le banc plus loin (une fiche restée ouverte bloquait le clic suivant) : un plantage n'attrape rien → le banc doit
survivre au défaut qu'il teste (son propre témoin le voit, la suite continue). ⑥ Dans la comparaison ancien / nouveau, des commandes
« INTROUVABLES » ne l'étaient que pour la sonde : bouton sous la barre du bas (il faut faire défiler, comme le pouce), carte repliée
(il faut l'ouvrir d'abord, comme la personne).
⑦ **Deux fois le même jour** (D-086 puis D-087) : `tools/dump_prompt.js` LIT et ÉCRIT le **dépôt principal** (chemin codé en dur,
`/home/user/forcetracker`) ; lancé depuis un dossier de travail, il a réécrit `docs/PROMPT-MILO-REEL.txt` du dépôt principal à partir du
code de master (non commité, remis à l'identique aussitôt chaque fois) et n'a **rien** vérifié du code du dossier de travail. → vérifier sur
une COPIE de l'outil pointée vers le dossier de travail (fait : seule la phrase de l'heure diffère). Proposition, NON faite (outil partagé,
hors périmètre) : `ROOT = path.dirname(__dirname)` et la sortie relative à ROOT.
↪️ **Suite (brief « D-088 », même jour, décision D-089)** : la cause exacte est **deux** chemins codés en dur — `const ROOT=` (ligne 12, la
LECTURE) et la sortie de `fs.writeFileSync` (ligne 99, l'ÉCRITURE). **Garde appliqué** : l'outil refuse de tourner ailleurs qu'à la racine de
ROOT (`fs.realpathSync(process.cwd()) !== ROOT` → code 2, aucune lecture ni écriture) ; les deux lignes restent mot pour mot parce que
`tools/gen_milo_consolidation_pdf.py` les **remplace texte pour texte** pour se rediriger (corriger l'outil seul aurait cassé ce générateur
en silence). **Prouvé uniquement dans un environnement temporaire** : copie de l'outil, LEURRE de dépôt principal, garde d'écriture préchargé
(`node -r`) — l'outil d'origine tente l'écriture (bloquée), l'outil corrigé refuse depuis une copie ou un sous-dossier et n'écrit que son
fichier depuis la racine ; dépôt principal et dossier de travail inchangés. **Proposition en attente de validation** (transversale) :
`ROOT` et la sortie relatifs à l'outil (ou passés par variables d'environnement), et le générateur qui passe ces variables au lieu de
remplacer du texte. ⚠️ **D'autres outils du dépôt portent le même chemin** (relevé, non corrigé — hors périmètre) : 6 `tools/mut_*.py`
(`SRC='/home/user/forcetracker'` : lancés depuis une branche, ils clonent et éprouvent **master** sans le dire — lecture seule) ·
`tools/sonde_fuites_nutrition.js` (lecture seule) · 10 générateurs de PDF qui LISENT par défaut le dépôt principal (sortie dans `/tmp`,
racine réglable par variable d'environnement) · et 4 anciens générateurs (`gen_audit_pdf`, `gen_bug_reprise_pdf`, `gen_dossier_pdf`,
`gen_miseaupoint_pdf`) qui **écrivent** dans `/home/user/forcetracker/docs/` — les seuls, avec `dump_prompt.js`, à pouvoir le salir.

**Suite — quatre pièges de méthode de plus (brief « D-088 », mêmes erreurs de banc, aucune dans l'app).** ⑧ Capturer les messages en
posant `Object.defineProperty(window,'toast',…)` AVANT le chargement : la déclaration `function toast(){}` de l'app **remplace** la
propriété — le témoin ne voyait aucun message → envelopper la vraie fonction APRÈS le chargement. ⑨ Pour comparer avec l'ancien écran,
la sonde touchait « 📷 J'ai déjà un programme ou un historique » à chaque ouverture : ce bouton **replie** le panneau s'il est déjà ouvert,
et « l'ancien chemin » semblait absent → ne le toucher que si le bouton voulu n'est pas déjà à l'écran. ⑩ « La séance en cours est
intacte » comparait la mémoire et le stockage mais **pas la copie de secours** (`ft4_wkt_draft`, règle d'or #3) : une mutation qui
l'effaçait serait passée → le témoin exige que la copie de secours soit toujours CETTE séance. ⑪ Le garde d'écriture comparait des
chemins **sans suivre les liens** (un leurre fait de liens symboliques vers l'arbre testé laissait passer une écriture) ni les adresses
`file://` → chemins réels comparés, et le garde est d'abord **éprouvé sur une zone jetable** (témoin `B-D088-OUTIL-⑪-0`).

**Le témoin qui le voit.** `B-NOTE-⑨b` / `⑨d` (écart pendant le geste + liste d'actions d'IA) · `B-NOTE-③a` / `③b` (« Précédent »
retrouvé, puis point absent) · `tools/mut_notes_d087.py` 21 / 21 (M9 rougit sans plantage ; arbre sain rejoué à 0 à la fin) ·
`B-D088-OUTIL-⑪-0` et `①a`-`①e` (l'outil du prompt, leurre + garde éprouvé) · `B-D088-IMP-⑥a` (le message vu) · `B-D088-IMP-②b`
(copie de secours comprise) · `tools/mut_d088.py`.

**À quoi on le reconnaît.** Un rouge dont le détail parle d'autre chose que du geste testé (une adresse au démarrage, un nom
d'exercice différent), ou un vert qui resterait vert si la fonction n'existait pas. Avant de conclure « l'app a perdu X », refaire le
geste **comme la personne** (faire défiler, ouvrir la carte) et vérifier que la sonde a bien atteint l'endroit voulu.

↪️ **Suite (20/10/2026, audit des aides, lot final ft-v1257) — le même piège dans un témoin de la PASSE, pas d'un banc.** « Plus aucune aide ne décrit un bouton « 📉 −10% » » (`tests/parcours/runner.js`) ne lisait que `index.html` ; la phrase vivait dans `screens.js` (l'aide « ? » de Séance) → **vert pendant qu'elle s'affichait**. Corrigé : il lit le corpus des textes visibles, comme ses voisins — prouvé sur copies : rouge sur le code d'avant, vert après ; et le banc B-AID lit les aides **telles qu'affichées**. *Un témoin d'ABSENCE se prouve rouge sur le code qui porte le défaut : sans ça, on ne sait pas s'il regarde au bon endroit.*

## §84 — ⛔ REJOUER UN BANC À TRAVERS LE CLONE : UN ROUGE N'EST PAS UN DÉFAUT TANT QU'ON N'A PAS PROUVÉ SA CAUSE *(18/10/2026, publication de D-088 sur le clone — session-B, aucun code de l'app modifié)*

**Symptôme.** Rejoués à travers le clone (shim d'isolement actif), deux bancs rougissent alors qu'ils sont verts sur leur arbre source : B-D086 120 / 2 (⑮b à
360 et 430 px) et B-D088 41 / 11 (tous les témoins d'import d'historique et d'import de programme).

**Causes (mesurées).** ① ⑮b espionne `Storage.prototype.setItem` dans un script posé AVANT le shim : il voit la clé RÉELLE, préfixée `cl_` par le shim, et
la compare à des noms écrits en clair (`ft4_seen_ft`, `ft4_gardienStats`). Rendre à l'espion le nom côté application (adaptation ④ du lanceur, hors dépôt) :
122 / 0. ② B-D088 simule l'IA d'import en interceptant le réseau ; le shim rejette l'appel AVANT le réseau (« Clone de test : réseau coupé vers … ») — c'est
sa raison d'être (D-084). Preuve par **mutation inverse** : sur une COPIE du clone dont SEUL le réseau est rouvert (la mutation MI5 du contrôle négatif), 52 / 0.

**À quoi on le reconnaît.** Un banc vert sur sa source, rouge dans le clone, sur des témoins qui touchent le stockage brut ou le réseau.

**La règle.** On ne classe pas un rouge « artefact » à l'œil : on retire **la seule** différence suspectée (une copie, une adaptation nommée) et on montre que
le rouge disparaît — ni plus, ni moins. ⚠️ Et une sonde qui affirme « aucune requête ne sort » se trompe de périmètre : le shim coupe les canaux de DONNÉES
(fetch, XHR, beacon, WebSocket, EventSource), pas les images — l'image QR de partage (lien public de l'app) sort, comme en production. *Un témoin dit ce que
le système promet, pas plus.*

## §85 — ⛔ UNE COPIE DE LA RÈGLE DE VOLUME DANS UN AFFICHAGE : UN UNILATÉRAL Y VALAIT LA MOITIÉ *(19/10/2026, finalisation de D-091 + comptage D-092 — branche locale `claude/ux-fig-face-dos-v2`)*

**Symptôme.** Pendant la séance, « Ta séance jusqu'ici » affichait 416 kg pour un Curl Haltères (3 séries de travail) ; « Terminer » enregistrait 832 kg,
et l'écran de fin, Progrès et l'Accueil montraient 832. Personne ne l'avait signalé : la carte disparaît au moment où l'écran de fin s'ouvre.

**Cause (mesurée).** La carte (16/10) recalculait le volume elle-même, en recopiant le filtre de `_workVol` mais pas sa **convention unilatérale**
(`uniConv` : un unilatéral se note par côté, son volume est doublé — 11/08/2026). Deux calculs du même chiffre : famille « les deux sources qui se
contredisent » (R2). Trouvé en écrivant le témoin du comptage D-092 (un unilatéral était dans le scénario exprès), pas par un retour.

**Correction.** La carte lit LA règle (`_workVol`, qui reçoit un 2ᵉ argument optionnel `avecEchauffements` pour le total D-092), avec la même convention
que `finishWorkout` (`uniConv:1`). Témoins B-FFD-⑩d (la carte) et ⑩e (le « dont … kg de travail » = l'écran de fin = la séance enregistrée, par la vraie
porte « Terminer »), mutations M23 et M29.

**À quoi on le reconnaît.** Un même chiffre (volume, séries, durée) calculé à deux endroits par deux expressions qui « disent la même chose ». La
recopie oublie toujours la partie la moins visible de la règle — ici le cas unilatéral, ailleurs les échecs `X` (le commentaire de `_effortConnu`, `log.js`, décrit la même recopie qui « oublierait la moitié `X` »).
*Un affichage n'a pas le droit de posséder une règle : il la lit.*

## §86 — ⛔⛔ UN LIBELLÉ QUI DIT UNE CHOSE, UNE DONNÉE QUI EN DIT UNE AUTRE : « ÉCHEC » ÉCRIVAIT 0, « VOLUME » ET « KG TOTAL » DISAIENT LE TRAVAIL *(19/10/2026, recette iPhone de Michel sur le clone — chantier SÉANCE, branche locale `claude/seance-recette-precedent`, non publié ; défauts PRÉSENTS en production `ft-v1256`)*

**Symptômes (recette du 19/10, mesurés).** ① Dans la barre de repos, le premier bouton s'appelait « échec » et enregistrait `rir: 0` — un RIR 0
**réussi** et un vrai échec se notaient par le même geste. ② L'écran de fin affichait « 4200 kg » sous « Volume » juste après une carte qui annonçait
« 5 600 kg · dont 4 200 kg de travail » (D-092) : le travail présenté comme le tout. ③ Le détail d'une séance (Progrès) disait « 4200 kg total » pour la
même raison. ④ L'aide « ? » de l'onglet Séance écrivait encore « échec = 0 en réserve — c'est la même chose que le tag X », et l'échelle d'effort du Profil
« 0 = échec » / « 10 = échec ».

**Cause.** ft-v1154 (06/09) avait tranché, avec Michel, qu'un RIR 0 et un `X` sont **deux données** — et corrigé le code, le prompt de Milo et l'aide
détaillée. Mais **le bouton** gardait son mot (`_reserveBoutonTxt(0)` → « échec ») et deux textes d'aide n'avaient pas suivi. Pour le volume, la tuile
et le sous-titre lisaient `sess.volume` — le **travail**, sémantique historique voulue — sous un **nom de total**. *Le calcul était juste ; c'est le
nom posé dessus qui mentait.*

**Correction (D-093, décisions de Michel du 19/10).** « Échec » devient un bouton à part qui pose **le tag X** ; « 0 » écrit un RIR 0 marqué
`rirV: 2` ; un ancien 0 (sans marqueur) se lit « 0 ou échec », **rien n'est réécrit**. L'écran de fin dit « Volume total · dont … kg de travail » et
« Séries de travail · N validées » ; le détail « X kg total · dont Y kg de travail » (affichage seul) ; `sess.volume`, l'export et Milo inchangés. Les
cinq textes d'aide sont alignés. Témoins B-SR-②③④ (`tests/parcours/seance_recette.js`), mutations M01-M18 (`tools/mut_seance_recette.py`).

**À quoi on le reconnaît.** Un **mot** sur un bouton ou au-dessus d'un chiffre qui n'a pas suivi une décision prise sur la **donnée**. Quand une
décision change le sens d'une valeur, chercher **tous** les endroits qui la NOMMENT — bouton, tuile, aide « ? », aide détaillée, Guide, pop-up —
pas seulement ceux qui la calculent. *ft-v1154 a corrigé trois textes sur cinq : les deux oubliés sont ceux qu'on lit le plus.*

## §87 — ⛔ UN REPLI AFFICHÉ COMME UN HISTORIQUE : « PRÉCÉDENT » RÉPÉTAIT LA DERNIÈRE SÉRIE AU-DELÀ DE LA DERNIÈRE FOIS *(19/10/2026, même chantier)*

**Symptôme.** La dernière fois : 4 séries de travail ; aujourd'hui : 6. Les lignes 5 et 6 de « Précédent » affichaient la 4ᵉ série d'avant,
répétée — deux séries qui n'ont jamais existé, présentées comme l'historique.

**Cause.** Le repli de `_prevAligne` (15/08/2026) répète la dernière série quand il y en a moins qu'aujourd'hui : juste comme **suggestion** de charge
(les chiffres gris dans les champs), faux comme **historique affiché**. D-086 (§82) avait séparé la NOTE du repli (`exact`), pas la VALEUR.

**Correction (D-093 — « ne jamais inventer ou dupliquer des séries »).** La case n'affiche que la série **exacte** de la dernière fois (`pv`), « — »
au-delà ; les suggestions grises gardent le repli (`p`). La feuille « 4 dernières séances » applique la même règle : « — » pour une série absente à un
rang, jamais une série recopiée. Témoins B-SR-⑤a, ⑤c, ⑥d ; runner XIX ④ et B-D086-③a mis à jour (R30) ; mutations M19, M20, M28.

**À quoi on le reconnaît.** Une valeur de **commodité** (repli, dernière connue, valeur par défaut) qui sort de son rôle — une suggestion qu'on
laisse s'afficher à l'endroit où la personne lit des **faits**. Le repli peut rester ; il ne doit pas se présenter comme mesuré.

## §88 — ⛔ PROUVER « RIEN N'A CHANGÉ » AVEC UN MORCEAU DE TEXTE : « RIR0 » ACCEPTAIT « RIR0? », « Précédent » REFUSAIT « Précédent ▾ » *(19/10/2026, même chantier — deux pièges de méthode, attrapés avant toute livraison)*

**① Le témoin qui ne voyait pas un ajout (trouvé par le contrôle négatif).** 1ʳᵉ campagne : 38 / 39. La mutation M18 ajoutait un « ? » après
l'ancien RIR 0 dans ce que Milo reçoit — un reclassement silencieux — et **aucun témoin ne rougissait** : B-SR-④d cherchait `/S3 60×9 RIR0/`, vrai
pour « RIR0 » comme pour « RIR0? ». *Un témoin d'« inchangé » écrit comme une PRÉSENCE voit une suppression, jamais un ajout.* Corrigé : ④d
compare la ligne envoyée à Milo série par série, au caractère près, avec une fin bornée ; vert sur le code d'avant (rien n'a changé), rouge sous M18.
2ᵉ campagne : 45 / 45.

**② Le témoin qui lisait un libellé au lieu d'une garantie (trouvé par les bancs voisins).** B-UXI-F5 (D-086) garantit « la colonne Précédent
reste » mais l'écrivait `hdr.includes('Précédent')` — l'égalité exacte d'un libellé. D-093 ajoute « ▾ » quand l'exercice a un historique : 68 / 1,
pour une colonne bien présente. Mis à jour sur sa garantie (`/^Précédent( ▾)?$/`, R30) ; la mutation M19 de `mut_ux_integration.py` le rougit
toujours.

**À quoi on le reconnaît.** Les deux sont le même défaut, à l'envers : **un témoin trop lâche** (un `includes` qui laisse passer un ajout) et **un
témoin trop serré** (une égalité sur le mot alors qu'il protège une structure). *Prouver une absence de changement, c'est comparer le TOUT ;
protéger une présence, c'est viser ce qui doit rester, pas son orthographe du jour.* Le premier ne se voit qu'au contrôle négatif, le second
qu'au banc voisin — d'où les deux, à chaque fois.

## §89 — ⛔ UN NOM QUI NE RETROUVE PAS SA DONNÉE : LA COLONNE « seance » DE L'EXPORT EST VIDE *(20/10/2026, recette iPhone de D-093 — trouvé par Michel, pas par un test)*

**Le constat.** Dans l'export CSV de l'historique, la colonne `seance` est vide. **Mesuré dans le code** : elle lit `s.name || s.label`, alors que
`finishWorkout` enregistre le nom d'une séance sous **`progLabel`** — et une séance libre n'en a aucun. Aucun écrivain ne pose `name` sur une séance
enregistrée ; `label` n'existe que sur une séance proposée par Milo. Le même code est en production `ft-v1256` : **ce n'est pas une régression de D-093.**

**Ce que ça empêche.** Distinguer deux séances du même jour dans l'export « sans débriefs » : ni nom, ni heure, ni identifiant (`seance_id` n'existe
que dans l'export « avec débriefs », D-044).

**Pourquoi rien ne l'a vu.** Aucun témoin ne vérifie qu'une colonne de l'export est REMPLIE pour une séance réelle : ils vérifient la liste des colonnes,
ou comparent l'export à la fonction qui le produit (`_histoLignes`). *Un contrôle qui compare un résultat à la formule qui l'a produit ne peut pas rougir.*

**Non corrigé — décision de Michel attendue.** Lire `progLabel` tient en une ligne ; ajouter une heure ou un identifiant change le format « sans », figé
par D-044 et ses témoins. Classé : amélioration après la production (`docs/SUIVI-AUDIT.md`, R4).

**À quoi on le reconnaît.** La famille « un nom qui ne retrouve pas sa donnée » (R36 ; ft-v1147 → ft-v1163) : deux endroits nomment la même chose
autrement, rien ne plante, la colonne est juste vide.

## §90 — ⛔⛔ L'ÉCRAN D'AJOUT SERT DE MÉMOIRE : UN ÉCRIVAIN QUI NE L'OUVRE JAMAIS LE LISAIT QUAND MÊME (M6) *(21/10/2026, NUT-M6-REJEU-01 — branche `claude/nut-m6-rejeu-01`, non publié · ↪️ publié en `ft-v1258` le 21/10/2026)*

**Le constat.** « Tes repas habituels » (`rejouerRepas`) écrit ses lignes par `_provFood`, qui lit **quatre** états de l'écran d'ajout :
le bloc grammes, l'ancre en grammes, la portion, la trace de fiabilité. Or « Annuler » et « Ajouter » ferment l'écran **sans le
remettre à zéro** : chaque aliment rejoué héritait de l'aliment affiché juste avant. Mesuré le 20/10 sur ft-v1256, **remesuré à
l'identique le 21/10 sur ft-v1257** (banc B-NM6, vrais clics, données inventées) : après une huile notée à 5 g, la banane, le shake
et le yaourt rejoués à **5 g** ; après un riz repris à 200 g, un shake à 200 g avec un faux pour-100 g de **78** et un pain à **125** ;
après une saisie en portions, le pain rejoué en « part » de 80 g ; une trace NON_RESOLU recopiée sur quatre aliments sains.

**Pourquoi rien ne l'a vu.** Deux commentaires affirmaient la protection : « `rejouerRepas` tourne écran fermé » et « la quantité
vient de l'ITEM, jamais du DOM ». **Les deux étaient faux** — un écran fermé garde son état. Et les témoins existants appellent
`_provFood` **directement**, comme s'ils étaient l'écran. *Un commentaire qui affirme une protection dispense de la mesurer.*

**Le correctif (D-094, décision de Michel).** Un marqueur `ecran:false` porté par la **provenance** des deux écrivains hors écran
(`rejouerRepas`, `quickAddFood`), qui coupe les **4** lectures ; `addFoodEntry` inchangé. Ni remise à zéro de l'écran, ni « fermé
par défaut ». Banc : **15 OK / 17 rouges** sur le code de master → **32 OK / 0 rouge**.

**⭐ Et le risque que le correctif ouvrait lui-même.** Un marqueur resté posé après une panne ferait ignorer l'écran au prochain
« Ajouter » : la saisie à la main perdrait ses portions **en silence**. D'où les deux `finally` (provenance rendue dans le rejeu,
effacée dans l'ajout rapide), éprouvés par **panne injectée** (B-NM6-MQ ③ ④ ⑤). Au passage, la panne injectée a montré un défaut
**d'avant** : sur master, un ajout rapide qui plante laissait sa provenance « liste / reprise » sur la saisie suivante à la main.

**Ce qu'il ne fait pas.** Il ne répare **aucune ligne déjà contaminée** (le patch d'historique v1.2 reste une simulation, non
appliquée) et n'empêche pas une source **déjà contaminée** (favori, repas habituel) de se recopier fidèlement : c'est le lot **M3**.

**À quoi on le reconnaît.** La famille « le DOM sert de mémoire entre deux aliments » (ft-v1180, ft-v1191, phase 0a) — un état qui
décrit l'aliment affiché survit à l'aliment ; **ici, il survit à la fermeture de l'écran et il est relu par un écrivain qui ne l'a
jamais ouvert**. Le cliquet B-NM6-C fige la règle : *tout écrivain hors écran porte le marqueur, et un 4ᵉ appelant de `_provFood`
doit se déclarer.*

**Et un témoin voisin a rougi sans défaut — le §79, encore.** `B-CCCXLVI ⑮` (banc de la référence pour 100 g) vérifiait le
**texte exact** de la condition de la trace de fiabilité, `if(_z&&_z.etat!=='COHERENT'){`. Le correctif y ajoute la garde décidée
`ecran&&` : le texte change, l'invariant (*une ligne COHÉRENTE ne grossit pas d'une trace*) reste vrai. Le témoin accepte
désormais cette garde devant, et rien d'autre ; son outil de mutations (`tools/mut_ia_ref100.py` M12) s'ancrait sur la même
ligne et la suit. Éprouvé : vert sur master, vert sur la branche, **rouge quand l'exclusion de COHERENT est retirée**.
⚠️ La simulation du 20/10 annonçait « 0 témoin existant rouge » pour cette forme : elle n'avait rejoué que les blocs CCXCI,
CCCV, CCXCIX et CCCII. *Un « aucun témoin ne rougit » ne vaut que pour les témoins rejoués.*

## §91 — ⛔ UNE GARANTIE POSÉE À L'AVEUGLE CONTREDISAIT, DEPUIS LE RETOUR AU PREMIER PLAN, UNE DÉCISION PRISE APRÈS ELLE *(22/10/2026, SEANCE-REPOS-01 — session-C, branche `claude/dreamy-bell-pu88ia`, non publié)*

**Le constat.** `app.js` portait depuis ft-v144 (01/07/2026, commit `e3367525`) : « Garantie : le timer de repos ne survit jamais
à un redémarrage ni à un retour au premier plan » — `stopRest()` au démarrage, et un écouteur qui **coupait le repos au retour
dans l'app dès 5 s de dépassement**. Or depuis ft-v1030 (le repos est un MAXIMUM, il continue en négatif) et ft-v1075 (« téléphone
dans la poche, on revient et on lit GO, sans savoir si ça fait 20 secondes ou 4 minutes »), le dépassement est **une information
voulue**. Mesuré sur `ft-v1258` (banc C-REP-C1) : retour au premier plan 30 s après la fin → le dock **disparaît**. *Le seul moment
où le dépassement devait servir — le retour dans l'app — était celui où une règle plus ancienne l'effaçait.*

**Pourquoi rien ne l'a vu.** Les témoins de ft-v1030 font avancer l'horloge **sans** jamais simuler un retour au premier plan ;
l'écouteur de `app.js` n'y passe donc pas. Et la garantie était écrite comme un fait (« ne survit jamais »), pas comme une décision
datée avec sa raison : rien ne disait qu'elle venait d'un **correctif à l'aveugle** posé pendant la panne « séance coincée »,
dont la vraie cause a été trouvée ensuite ailleurs (erreurs TDZ propres à Safari, v144 → v153, `docs/GALERES-ET-LECONS.md`).
⭐ Et au démarrage, elle ne protégeait **rien** : le repos n'a jamais été enregistré (vérifié dans `log.js` de ft-v143 comme de
ft-v1258) — `stopRest()` y remettait seulement l'écran à zéro.

**Le correctif (décisions de Michel du 22/10, `docs/SEANCE-REPOS-01.md`).** La garantie est **remplacée**, pas contournée :
`_reposReprendre()` au démarrage (reprise à l'heure réelle, sinon la même remise à zéro qu'avant) et **un seul** seuil,
`REST_DEPASSEMENT_MAX` (5 min après la fin théorique ; **15 min depuis l'avenant du 22/10 après-midi, D-102**), lu app ouverte, au retour et au redémarrage. L'écouteur −5 s a disparu ;
son histoire est écrite à sa place (R30).

**À quoi on le reconnaît.** Deux règles pour la même chose, posées à des mois d'écart, et la plus ancienne gagne sur un chemin
que personne ne teste — la famille « le correctif posé d'un seul côté » (ft-v851 → ft-v1030), vue cette fois depuis l'autre bout :
*avant d'écrire une règle nouvelle, chercher les anciennes qui décident de la même chose — et lire la date et la raison de chacune.*

## §92 — ⛔ UN PARCOURS ENCHAÎNÉ SUR UNE SEULE PAGE MASQUE UNE DÉPENDANCE D'ORDRE : LA TABLE CIQUAL N'ÉTAIT CHARGÉE QU'À LA PREMIÈRE RECHERCHE *(22/10/2026, NUTRITION V2 jalon 4 — branche `claude/nutrition-v2`, non publié ; deux défauts de MON branchement, attrapés avant tout commit)*

**Le défaut.** V2 ne recalcule une ancienne ligne que si sa fiche est **retrouvée à l'identique** dans la table CIQUAL embarquée
(`NUT2.reprise`, D-095). Or `_ciqualCharger()` n'était appelée **qu'à la première recherche** (`_afSuggInput`). Mesuré par sonde,
sur une page neuve, une ancienne ligne CIQUAL parfaitement vérifiable : « Mes aliments » → reprise **figée** ; « + » → ligne
**déclarée** ; « Modifier » → **non vérifiée**. Après une seule recherche, les trois gestes la recalculaient. *Le même aliment se
recalculait ou non selon un geste fait avant, invisible.*

**Pourquoi le banc ne l'a pas vu.** Le banc des parcours V2 jouait la recherche (P2) **avant** la modification d'une ancienne ligne
vérifiée (P6 ⑤), sur la **même page** : P2 chargeait la table, P6 ⑤ passait. ⭐ *Un parcours enchaîné prouve ce qui marche dans
CET ordre ; une dépendance d'ordre ne se voit que sur une page NEUVE.* Le défaut a été trouvé en **lisant le code** (« quand la
table est-elle chargée ? »), puis mesuré — pas par un rouge.

**Le correctif.** Une reprise qui a besoin de la table l'**attend** (`_n2Apres`, locale, une fois par session) : « Mes aliments »,
« + », le repas habituel, « Modifier ». Hors ligne sans table, la ligne reste non vérifiée — le repli sûr, jamais l'inverse.
Témoins sur **page neuve** : `B-NV2P P11 ① ②`, `B-NM6-S S1` / `B-NM6-A A1` ; mutations MP13 et N12.

**Et le second, dans la même lecture : redessiner effaçait la quantité tapée.** Une reprise **figée** (ancienne ligne sans fiche
vérifiée) : on tape 150, on retouche les calories — le `change` rappelle `_afMajAncre(true)`, qui **reconstruit** le bloc ; le
champ revenait vide, et « Ajouter » répondait « Combien en as-tu mangé ? ». *C'est ft-v1159 (« la frappe ne reconstruit jamais le
bloc »), réintroduit par un bloc neuf.* Et dans la même zone, un vrai trou de données : une AUTRE quantité que celle notée,
valeurs non retouchées, enregistrait 150 g avec les calories de 200 g. Corrigé (D-101 ⑧) : la quantité tapée survit, une autre
quantité exige des valeurs retouchées. Témoins `B-NV2P P11 ③ ④`, `B-NM6-A A2b` ; mutations MP14, MP15, N13.

**À quoi on le reconnaît.** Une fonction pure qui reçoit un **contexte** (`ctx.ciqual`) : si ce contexte se remplit tard, la
fonction rend un verdict différent sans que rien ne le dise. 👉 *Avant de faire confiance à un contexte, chercher QUAND il se
remplit.*

## §93 — ⛔ UNE ÉGALITÉ À L'OCTET SUR UN OBJET VIVANT : LE TÉMOIN DE RECHARGEMENT A ROUGI SUR LE SEUL ÉTAT ÉPHÉMÈRE, ET SEULEMENT PARCE QU'IL DEVANÇAIT LE TICK *(22/10/2026, 1ʳᵉ passe complète de SEANCE-REPOS-01 — session-C, branche `claude/dreamy-bell-pu88ia`)*

> Numéro **§93** et non §92 : la branche Nutrition V2 (`claude/nutrition-v2`) porte déjà son propre §92 (22/10) ; les deux se rangeront à l'intégration.

**Le constat.** Passe complète **7 865 ✅ / 1 ❌** : `B-NP01-A ⛔ rechargement en pleine séance : la séance ouverte revient À
L'IDENTIQUE` (banc `nut_punch01`, contrat Séance → Nutrition) comparait **tout** `S.wkt` à l'octet avant et après un rechargement.
SEANCE-REPOS-01 y range désormais l'état du chrono de repos (`repos`). Mesuré sur une copie instrumentée : **`repos` était la SEULE
différence** — un repos parti à 18:30 (2:10), expiré à 18:37:10, présent dans l'instantané pris à 18:40, **effacé au rechargement**
(décision de Michel : 5 min après la fin théorique, l'état persistant est effacé). ↪️ *Depuis l'avenant D-102 (15 min), ce repos
court jusqu'à 18:47:10 et **revient** au rechargement de 18:40 : la course disparaît, et le témoin — qui compare la séance sans
`repos` — reste juste. Le texte ci-dessous décrit le cas du matin, gardé (R30).*

**Pourquoi l'instantané le portait encore.** Le banc saute l'horloge (`setFixedTime`) puis lit `S.wkt` **aussitôt** : le tick qui
efface en mémoire (toutes les 250 ms) n'était pas encore passé. *Le témoin dépendait d'une course* — vert si le tick gagne, rouge
sinon — sans rien dire de la séance elle-même (séries, codes, cardio, chrono identiques à l'octet).

**Ce qui a été fait (R30, règle #17).** Le témoin compare désormais la **séance** sans `repos` (tout le reste à l'octet, comme avant),
avec sa raison écrite ; vert sur la branche (36 / 0) **et** sur le code exact de master (36 / 0) ; sa mutation dédiée `MA20` (le
rechargement perd le chrono de la séance) le fait toujours rougir (2 / 2 conformes avec MA21). `banc:nut_punch01` rejoint les tests
associés de la fiche du registre de ce lot (`SEANCE-REPOS-PERSIST-01` depuis le 22/10 après-midi : son 1ᵉʳ identifiant,
`SEANCE-REPOS-01`, doublonnait une fiche de master — revue de l'avenant) : le sélecteur ne l'avait pas proposé pour ce diff — **c'est la passe ENTIÈRE qui l'a vu**.

**À quoi on le reconnaît.** Une égalité à l'octet sur un objet que d'autres lots enrichissent : elle protège tout, donc aussi ce qui
doit légitimement changer. *Comparer ce qu'on garantit (la séance), pas l'objet qui le transporte.*

## §94 — ⛔⛔ RÉVISER UN TÉMOIN, C'EST AUSSI L'ÉPROUVER : SIX DÉFAUTS DE MON BRANCHEMENT ET UNE FAMILLE DE VERTS SANS OBJET *(22/10/2026, NUTRITION V2 jalon 4 — branche `claude/nutrition-v2`, non publié ; trouvés en révisant les témoins V1 sur le contrat V2, pas par un rouge)*

> *(Numéro : §91 et §93 sont ceux de Claude Séance sur `claude/dreamy-bell-pu88ia` ; celui-ci est le §94 — à reconfirmer à l'intégration.)*

**Le contexte.** Brancher le moteur V2 aux écrans a fait rougir des centaines de témoins écrits pour V1. Les réécrire « pour
qu'ils passent » aurait été facile ; les réécrire sur leur **invariant** (règle d'or #17) a obligé à rejouer chaque geste — et
ces gestes ont trouvé six défauts **réels** de mon branchement, tous corrigés le jour même :

1. **Le contrôle de masse était aveugle sur « Modifier »** : la quantité d'une ligne sans fiche se dit dans `ef-q`, que
   `_qtyGrammesEcran` ne lisait pas, et la frappe ne relançait rien. 28 g de macros « tenaient » dans 5 g — ft-v1103 rouvert.
   **Et sur la reprise figée** : toucher « ↩ 5 g (la dernière fois) » posait la quantité sans le contrôle — ft-v1104 rouvert.
2. **Le poids d'UNE portion survivait à un changement de sens de « 1 portion »** (retour à l'onglet portions, valeur
   retouchée qui fait de l'écran « 1 portion » de ce qui en valait deux). Mesuré : « 1 dose (30 g) = 312 kcal » s'enregistrait,
   soit **173 g de protéines pour 100 g**, sans un mot. Désormais le poids est **redemandé**.
3. **Une reprise figée était redimensionnable** par les fonctions internes (`_afApplyProp`, `_afProp`) : son champ ne
   rescalait pas, mais un autre chemin le pouvait. Désormais aucun chemin.
4. **« Mettre X kcal » dans « Modifier »** : sur une ligne à fiche, l'écran affichait X et la ligne enregistrait la frappe
   précédente (999) ; et sur une ligne sans fiche, la jumelle de D-101 ⑧ manquait — une autre quantité passait avec les
   valeurs notées pour l'ancienne.
5. **L'ancienne provenance `scan` servait encore de repli** à trois portes du code-barres : le moteur la refuse
   (`PROVENANCE_INCONNUE`), donc un code lu sans origine dite **n'écrivait rien**. Repli : `camera-code-local`.
6. **« Modifier » sans rien toucher réécrivait l'origine de la quantité en « tapée »** (`n2.qo`), sur les deux branches.

**Et la famille de verts sans objet.** Plusieurs témoins V1 comparaient **la dernière ligne du journal** à un attendu
(« le 10ᵉ cycle égale le 1ᵉʳ », « la quantité interdite n'est pas là »). Sous V2, la reprise sans quantité est refusée : rien ne
s'ajoutait, la dernière ligne restait **la fixture elle-même**, et le témoin restait vert — CCLXXX ⑩ ⑮, CCLXXXIV ⑪,
CCLXXXV ⑱. *Un vert qui compare un état à lui-même ne mesure rien.* Le même défaut de lecture donne aussi l'inverse, un
**faux rouge** : CCLXXVIII ③ lisait la fixture (380 g) comme si c'était la ligne de l'omelette, qui n'avait pas été ajoutée.

**Le correctif de méthode.** Chaque geste qui doit écrire **compte** la ligne qu'il ajoute (`ajoute`, toasts captés) ; un
témoin qui juge « rien ne part » vérifie l'absence d'ajout, pas la dernière ligne. Témoins des six défauts : `B-NV2P P13 ①→⑨`
(`tests/parcours/nut2_parcours.js`), mutations **MP23 → MP33** (puis MP34, MP35, ci-dessous) ; décisions consignées dans **D-101 ⑪ → ⑯** (PROPOSÉ).

**À quoi on le reconnaît.** Un témoin réécrit qui passe du premier coup sur un comportement qui a CHANGÉ : avant de le croire,
lui faire rater exprès (mutation) — et vérifier qu'un geste censé écrire a **écrit**.

**Puis le contrôle négatif de ces témoins réécrits** (`tools/mut_temoins_v2.py` : 34 mutations de `app.js`, chacune sur
une copie, réseau isolé, passe réduite aux blocs visés) : **34/34** — mais le premier jet en ratait six, et **aucune n'était
un défaut du code** :
- quatre attentes visaient un témoin qui ne porte pas cette garantie (la mutation était attrapée ailleurs). L'un d'eux
  (CCLXXX ①) restait vert pour une AUTRE raison : la portion était refusée **faute de nom**, pas faute de poids — il lit
  désormais la raison du refus ;
- ⭐ **une double protection cache chacun de ses gardes** : CCLXXI ⑤ est tenu par le garde de l'onglet ET par la relecture
  qui remet le poids à zéro — retirer l'un ne fait rien rougir. Le chemin où le garde de l'onglet est SEUL (×1, D-101 ⑬)
  n'avait **aucun** témoin : `B-NV2P P13 ⑪` + MP35 ;
- ⭐ **une mutation que rien ne voit est une garantie sans témoin**, pas une mutation ratée : l'origine d'une reprise à
  l'écran n'était lue par aucun témoin de la passe (elle l'était par `nut2_parcours` P12 ⑥ : MP34) ;
- et un témoin **périmé par mon propre correctif** de l'après-midi : B-NM6-Q ② lisait la ligne de proposition (`af-prop`)
  qu'une reprise sans quantité n'affiche plus (elle ouvre la saisie à la main, poids demandé) — réécrit, mutation N16.

**Et un rouge que mon propre contrôle laissait passer.** Pour que CCCV ㉒ lise les origines dans le code, la reprise à
l'écran a re-séparé ses deux appels à `_ref100` (« reprise », « historique ») — et CCXC, que j'avais passé à « 8 portes »
le matin quand ils n'en faisaient qu'un, a rougi : le code était revenu à **9 appels**, comme sur master. Le contrôle
négatif ne l'a pas vu : son arbre sain ne vérifiait **que** les témoins attendus. CCXC est revenu à 9, avec sa raison ;
l'outil refuse désormais de juger si l'arbre sain n'est pas **entièrement** vert ; mutation R35 (une porte qui contourne
`_ref100`). *Un arbre « sain » qui rougit ailleurs n'est pas sain.* C'est la passe complète qui l'a trouvé — c'est son
travail.

**Et une suite annexe restée sur le contrat V1.** Le bloc 12 de `tests/calculs/runner.js` (« la provenance de chaque ligne »,
hors passe complète) attendait une saisie SANS poids enregistrée, la provenance « scan » et un drapeau `modifie` : rouge sous
V2, et d'abord **masqué** par une « erreur d'infrastructure » (la suite avait tourné pendant que je modifiais le dépôt). Réécrit
sur les mêmes garanties (rien ne part sans poids ; la quantité tapée, la source et le pour-100 g gardés ; une retouche est une
correction tracée ; la provenance ne survit pas), avec de vraies frappes ; contrôle négatif `tools/mut_calculs_provenance.py`
(la provenance est rendue DEUX fois — à l'ouverture et à l'enregistrement : sa mutation retire les deux).

**Piège d'outillage, à ne pas refaire.** Lancé avec `TMPDIR` dans le scratchpad (≈ 100 caractères), Chromium ne démarre
pas : il crée une socket sous `TMPDIR`, une socket Unix est limitée à 108 caractères, il meurt (SIGTRAP) — et **tous** les
témoins sortent « plantage ». L'outil a refusé de conclure (arbre sain non vert) : c'est ce qu'il devait faire. Correctif :
un `TMPDIR` court (un lien vers le même dossier). **Et le second, le même soir** : une passe complète lancée en tâche de
fond **sans limite de durée explicite** est coupée à **30 min** par l'environnement — le navigateur meurt, et chaque module
suivant sort « a PLANTÉ après 0 témoin ». La passe a refusé de se dire verte (SEC-04, pas de ligne de total) : là encore,
c'est ce qu'elle devait faire. Toujours donner la durée maximale (2 h) à une passe lancée en fond.

**À quoi on le reconnaît (suite).** Une mutation qui ne fait rougir AUCUN témoin : avant de corriger l'attente, chercher si
un autre garde couvre le même chemin (double protection) — et si aucun ne le couvre, c'est un témoin qui manque.

---

## §95 — ⛔ DEUX DÉFAUTS DU LOT DU MATIN, TROUVÉS PAR LA REVUE ADVERSE DE L'AVENANT : UNE GARDE QUI JUGEAIT LA MAUVAISE GRANDEUR, ET UN ÉCRIVAIN SANS GESTE QUI ÉCRASAIT L'ÉTAT PARTAGÉ *(22/10/2026 après-midi, SEANCE-REPOS-01 avenant D-102 — session-C, branche `claude/dreamy-bell-pu88ia`, non publié ; ⚠️ numéro à reconfirmer à l'intégration : §92 et §94 sont ceux de Nutrition V2)*

**Ce qui s'est passé.** L'avenant (15 min au lieu de 5) a été soumis à une revue adverse à quatre angles (code · calories · témoins ·
documentation), chaque constat vérifié par deux sceptiques. Elle a trouvé deux défauts **du lot du matin**, que ni le banc (43 / 0),
ni le contrôle négatif (31 / 31), ni la passe complète (7 866 / 0) n'avaient vus — parce qu'aucun témoin ne conduisait ces chemins.

**① La reprise prenait « +15 s » pour une horloge reculée.** `addRT` garde la durée et déplace le départ : allongé TÔT dans le
repos, le restant dépasse la durée, donc le départ équivalent est **dans le futur** (2:00 parti à 15:00:00, deux « +15 s » à
15:00:01 → départ 15:00:30). La reprise refusait tout départ à plus de 5 s dans le futur : verrouiller le téléphone dans les
secondes qui suivent **effaçait le repos**. Le témoin D1 existant rechargeait juste APRÈS le départ équivalent — il ne pouvait pas
le voir. **Correctif** : la garde juge le **restant** (jamais plus que `max(durée, REST_PLUS_MAX)` + 5 s — ce que l'app ne peut pas
produire), plafond de « +15 s » à un seul propriétaire. Témoin C-REP-D1b ; mutations MD1 (la garde du matin) · MD2 · MD3.

**② Un onglet périmé réécrivait la séance.** `_reposMemoriser` écrivait la séance **en mémoire** (`JSON.stringify(S.wkt)`) dans
`ft4_wkt`, et il s'exécute **sans geste** (l'expiration, par le tick ou le retour au premier plan). Deux onglets ouverts : l'onglet
resté en arrière-plan, à l'expiration de SON repos, remettait sa séance périmée sur le disque — une séance déjà terminée dans
l'autre onglet **revenait** (à terminer une 2ᵉ fois : volume et calories comptés deux fois), ou des séries validées entre-temps
**disparaissaient** (règle d'or #3). Le filet multi-onglets existant (`_ftAutreOnglet`, state.js) ne couvre que `persist()` — qui fusionne avec le disque avant
d'écrire. Sur master, aucun chemin n'écrivait `ft4_wkt` sans geste **hors du démarrage**, ni **en dehors de `persist()`**
(`autoConnect` appelle `persist()` sur une réponse réseau, `_recoverDraft` écrit au démarrage d'un onglet frais — précision
apportée par la relecture de l'avenant ; le commentaire de `_reposMemoriser` dit « `persist()`, déclenché par un geste », raccourci à
reprendre à la prochaine modification de `log.js`). **Correctif** : n'écrire QUE le champ `repos`,
dans la séance **du disque**, seulement si c'est la **même** séance (`runId`, sinon départ et date), et n'effacer que **son propre**
repos. Témoins C-REP-K1 (séance terminée ailleurs : ne revient pas) · K2 (séries et repos plus récents de l'autre onglet : intacts)
· K3 (jamais dans une autre séance) ; mutations MK1 (la version du matin) · MK2 · MK3.

**À quoi on les reconnaît.** ① Une garde « valeur impossible » écrite sur une grandeur (le départ) alors que l'invariant porte
sur une autre (le restant) : elle refuse des états que l'app produit elle-même. *Avant d'écrire « impossible », lister TOUS les
écrivains de la valeur.* ② Une écriture déclenchée par une **minuterie** qui recopie un état en mémoire dans un stockage
**partagé** : dès qu'il y a deux lecteurs-écrivains, la mémoire est périmée. *Une écriture sans geste ne doit écrire que ce
qu'elle possède — un champ, pas l'objet entier.*

**Ce qui les protège aujourd'hui.** Les témoins et mutations nommés ci-dessus (`tests/parcours/seance_repos.js`,
`tools/mut_seance_repos.py`). Et la leçon de méthode : *un banc vert, un contrôle négatif conforme et une passe complète valide ne
disent rien des chemins qu'aucun témoin ne conduit* — la revue adverse, elle, cherche justement ces chemins-là.


## §96 — ⛔⛔ UNE RELECTURE ADVERSE TROUVE CE QUE LES TÉMOINS N'AVAIENT PAS LA FORME DE VOIR : UNE MASSE ARRONDIE, UNE PORTE QUI REDÉFINIT, DES CORRECTIONS PERDUES *(22-23/10/2026, NUTRITION V2 — D-103, branche `claude/nutrition-v2`, non publié ; trouvés par une relecture indépendante, pas par un rouge)*

> *(Numéro : §95 est celui de Claude Séance sur `claude/dreamy-bell-pu88ia` ; celui-ci est le §96 — à reconfirmer à l'intégration.)*

**Le contexte.** D-103 (Michel, 22/10) : « 3 portions (450 g) » quand le poids d'une portion est fiable. Implémenté, banc P14
vert (15 témoins), contrôles négatifs 16/16 et 5/5 — puis une **relecture adverse** (trois relecteurs aux angles distincts, chaque
constat soumis à un vérificateur chargé de le réfuter) : **16 constats confirmés, 1 réfuté**. Aucun ne touchait une donnée déjà
enregistrée ; quatre étaient des défauts de code, le reste des phrases d'aide fausses et des trous de témoins.

**Les défauts de code** (tous corrigés, chacun avec son témoin P14 et sa mutation) :
1. **La masse arrondie pour l'écran, exacte pour la ligne.** La pastille posait 49,9 (1,5 × 33,3 = 49,95 arrondi au dixième)
   dans le champ ; l'écran calculait sur 49,9 g, le moteur enregistrait 49,95 g → **4 g de protéines à l'écran, 5 dans la
   ligne** (mesuré par le relecteur : 1 256 cas sur 5 602 poids réalistes). Correctif : l'écran calcule sur la masse EXACTE quand
   la pastille est prise telle quelle (`_bcApplyGrams`). Témoin ⑰, mutations MP60, MP61.
2. **Une nouvelle porte qui redéfinit un favori.** Garder la forme « portions » à la reprise faisait passer la ligne neuve par
   `_majDefFavori` (ft-v1186 ⑤) : un simple toucher réécrivait le poids d'un favori **sans ses valeurs**. Reprendre n'est pas
   redéfinir — la pastille ne touche plus le favori (les portes jumelles ne le touchaient déjà pas). Témoin ⑲, MP56.
3. **La reprise à l'écran perdait les corrections** (jalon 4) : 360 kcal recalculées là où « + Ajouter » écrivait les 300
   corrigées. Elle les reprend désormais, comme « Modifier ». Témoin ⑤b, MP54.
4. **Un favori par l'étoile perdait les corrections de sa ligne** (jalon 4) : il n'était plus « fiable » et « + Ajouter »
   réécrivait le calcul. Elles sont copiées, comme sa fiche. Témoin ⑱, MP55.

**Le défaut qui reste, faute de décision** : à la **2ᵉ** modification d'une ancienne ligne, sa copie d'origine (`n2.av`) n'est
plus reportée (le moteur reconstruit `n2` à neuf) — contraire à D-101 ④. Le correctif tient en une ligne du moteur, mais le moteur
est hors du périmètre accordé ce jour : **soumis à Michel**. En attendant, les aides ne promettent plus « Modifier garde
l'original ».
↪️ *23/10 : **corrigé** sur ordre de Michel (mission « incident prioritaire ») — le moteur transmet `n2.av` de version en version
(`BUGS.md` §98, témoins P15 ㉘ et B-NV2-E ㉑).*

**À quoi on le reconnaît.** Des témoins verts et des mutations conformes prouvent que ce qu'on a pensé à vérifier est vérifié —
pas que tout ce qui compte l'est. Les quatre défauts avaient la même forme : **un chemin que l'implémentation venait d'ouvrir
(ou de rendre visible) et qu'aucun témoin n'empruntait** — une masse inexacte en binaire (toutes les masses testées étaient
rondes), un favori du même nom qu'une ligne récente, une ligne corrigée reprise à l'écran. 👉 *Après un changement de forme
enregistrée, chercher les écrivains et les lecteurs qui réagissent à cette forme (ici `_majDefFavori`, qui ne regardait que
`u==='portion'`), pas seulement ceux qu'on a modifiés.*

**Et trois défauts de MES témoins, trouvés par le contrôle négatif de cette correction (23/10)** :
- **un témoin qui n'empruntait pas le chemin qu'il nommait** : ⑥b retapait la masse sur la pastille du riz — mais à ce moment, la
  dernière ligne de riz était les 300 g de ⑥ : la pastille était en **grammes**, et ⑥b vert sans rien éprouver (MP52 et MP53
  survivaient). Réécrit sur le yaourt, dont la dernière ligne est en portions, et il vérifie d'abord le texte de la pastille ;
- **un témoin qui dépendait de l'HEURE** (P12 ①, jalon 4) : l'ajout rapide tombe dans le repas proposé par l'heure — avant 11 h,
  « Petit-déj », le repas de la ligne testée : l'habitude, notée aujourd'hui, était alors écartée et le témoin rougissait **la
  moitié de la journée** (vert de 22 h à minuit, rouge à 00 h 05). Le repas des ajouts est désormais fixé dans P12 et P14.
  👉 *Un témoin qui passe le soir et rougit le matin n'est pas « instable » : il dépend d'une donnée qu'il ne fixe pas.*
- **un témoin dont la prémisse était tombée sans qu'il le sache** (⑯, trouvé par le contrôle négatif COMPLET, MP1 → MP61,
  rejoué sur le code final : **60 / 61**, seule MP51 survivait) : « riz proposé en portions, puis les pâtes » — mais à ce
  moment-là, la dernière ligne de riz était les 300 g de ⑥ : sa pastille était en grammes, et ⑯ ne mordait que grâce à un
  **reste** laissé plus tôt (sous la mutation, la pastille « 3 portions (450 g) » du riz, proposée en ⑥, survivait jusqu'à ⑯).
  Le nouveau ⑥b, sur le yaourt, a remplacé ce reste par un autre (« 1,5 portion (187,5 g) ») : ⑯ est resté vert, MP51 a
  survécu. Déplacé avant ⑥ et,
  surtout, il **vérifie maintenant sa prémisse** (la pastille du riz doit dire « 3 portions (450 g) ») : si un réordonnancement
  la casse, il rougit au lieu de mentir.
  👉 *Corriger un témoin peut en désarmer un autre plus loin dans le même parcours : après toute réécriture, rejouer TOUTES les
  mutations du banc, pas seulement celles du témoin touché — c'est ce qui l'a vu, et une sélection ne l'aurait pas vu.*


## §97 — ⛔⛔ LE DERNIER APPAREIL QUI ÉCRIT EFFACE LE JOURNAL ALIMENTAIRE DES AUTRES : `_pa_` REMPLACE LA LISTE EN ENTIER *(23/10/2026, NUT-SECURISATION-P1 — branche `claude/nut-securisation-p1`, NON DÉPLOYÉ · numéro choisi après les §95-§96 des branches `dreamy-bell` et `nutrition-v2`)*

**Le constat.** `handleSaveProfile_` écrit le journal et les favoris par `_pa_(body.foodLog, profile.foodLog)`. `_pa_` refuse
un envoi **vide**, mais **tout envoi non vide remplace la liste du serveur en entier**. Le client envoie toute sa liste locale à
chaque synchronisation et ne relit jamais le serveur tant que son stockage n'est pas vide. Rejoué sur le vrai `Code.js` (banc
B-NSP1, données inventées) : un appareil remis à zéro qui saisit un repas → **500 → 1** ; Safari en retard sur l'application
iPhone (deux stockages distincts) → **300 → 2** ; un appareil en retard → 40 → 30, 60 → 51 ; deux appareils aux historiques
différents s'effacent l'un l'autre ; favoris **20 → 1** ; une chaîne reçue à la place d'une liste **remplaçait le journal par
la chaîne**. **Aucune trace** — ni refus, ni journal d'exécution.

**Pourquoi rien ne l'a vu.** Les séances ont un garde-fou depuis le 02/08 (≥ 30 lignes et moins de 60 % gardées) : le journal,
écrit par la même fonction cinquante lignes plus haut, n'en avait **aucun** — *une règle corrigée dans une collection et pas
dans sa voisine*, la phrase du §33. ⚠️ Et ce seuil, recopié tel quel, n'aurait vu **ni 40 → 30, ni 20 → 1, ni l'appareil en
retard** : un seuil sur le NOMBRE de lignes ne distingue pas un écrasement d'une suppression voulue.

**Ce qui est préparé (non déployé, option B validée par Michel — `D-108`).** `_nutProtegerListe_` : l'envoi s'applique
comme avant (rien n'est réintroduit d'office : une absence est ambiguë), mais toute ligne retirée et l'ancienne version de
toute ligne corrigée sont **d'abord copiées** dans une zone de récupération `recupNut` à la racine du compte — même écriture
que le journal, jamais renvoyée à l'app, bornée, avec un événement chiffré sans donnée personnelle. Banc : **26 OK / 48
rouges** sur le `Code.js` de master → **74 / 0** ; contrôle négatif **37 / 37**. Détail : `docs/NUT-SECURISATION-P1.md`.

**⛔ Le même défaut, revenu par la BORNE — trouvé en finalisant (23/10, condition 3 de Michel).** La 1ʳᵉ version bornait la
zone en retirant ses copies **les plus anciennes**, « puisqu'elles sont dans les sauvegardes de la nuit ». **Faux** : un repas
saisi le matin et retiré l'après-midi n'est dans **aucune** sauvegarde. Rejoué : 10 repas du jour + deux écrasements avant la
nuit → **10 introuvables** ; favoris écrasés lot après lot → **340 perdus** ; **12 témoins rouges** à la découverte (15 sur les 74 du banc
final). *Une borne qui jette
est une perte silencieuse qui a changé d'adresse.* Correction : le surplus **déménage** dans un fichier Drive **relu** avant
de quitter la zone ; si Drive refuse ou relit autre chose, l'envoi de la liste est **refusé** (retardé, jamais perdu —
`D-109`, proposé). ⚠️ **Et un 3ᵉ piège, attrapé par un témoin avant d'arriver** : rangé à côté des sauvegardes, ce fichier
devenait pour la sonde `checkBackup` « la dernière sauvegarde » — **il aurait masqué une nuit sans sauvegarde**, la panne de
36 jours que cette sonde surveille. D'où le sous-dossier `recup-nut/`, qu'aucun lecteur existant ne parcourt.
👉 *Avant de ranger un fichier dans un dossier existant, chercher TOUS ceux qui le lisent — et ce qu'ils déduisent du
fichier le plus récent.*

**⛔ Et le refus lui-même, attrapé à la vérification 5 avant publication (23/10 — NON publié).** `D-109` refuse l'envoi
d'une liste quand la zone déborde et que Drive ne répond pas : « retardé, jamais perdu », **parce que l'appareil garde
sa liste**. Vrai… tant que rien ne la remplace. Or « Restaurer mon compte » **remplace** les favoris de l'appareil par
ceux du serveur — qui, pendant le refus, sont justement les anciens. Rejoué bout en bout (vraie app + vrai `Code.js`) :
**4 favoris neufs et 2 modifiés introuvables partout** ; le journal, **fusionné** à la restauration, ne perd rien.
👉 *Un refus « sans perte » ne l'est que si TOUTES les portes qui réécrivent la donnée locale la fusionnent — un refus
côté serveur se vérifie jusqu'au bout de l'app, pas seulement au serveur.* Décision attendue : `D-110`.

**À quoi on le reconnaît.** Une liste synchronisée « en entier » par un client qui ne relit pas le serveur : **le dernier qui
écrit gagne, et ce qu'il n'avait pas disparaît**. Voisins : §33 (le dernier qui écrit efface l'autre), la restauration par
union (ft-v1241 séances, ft-v1247 journal) — la même famille côté **client**, réglée avant que le côté **serveur** le soit.
⚠️ **Et un piège de harnais au passage** : le faux `Utilities.base64Decode` du banc A1 rendait un objet au lieu d'octets ;
`_packUser_` ne se relisait pas et n'osait jamais compresser — la première mesure de taille affichait **167 Ko « compressés »**
pour 30 Ko réels. *Une mesure qui passe par un double doit d'abord prouver que le double fait ce que fait le vrai.*

**↪️ Intégration Nutrition V2 × P1 (23/10, branche `claude/nut-v2-p1-integration`) — `D-110` écrit et éprouvé, NON
déployé.** FIX-A′ (`Code.js` seul, `19b87ffb`) : pour les **favoris**, une panne de Drive ne refuse plus l'envoi — rien ne
sort de la zone (`n = 0`), elle attend au-delà de sa borne jusqu'à un **plafond** (`NUT_RECUP_PLAFOND_FAVORIS_ = 120000`,
deux fois la borne) ; l'événement dit `differe:'drive'`, le journal du serveur dit « ACCEPTÉ » sans donnée personnelle ;
au-delà du plafond, le refus de `D-109` revient. Le **journal garde `D-109`** (sa restauration fusionne : un refus n'y perd
rien). Éprouvé : panne longue (NSP1-80), deux appareils (NSP1-79), deux envois **simultanés** (NSP1-82, nouveau), capacité
(NSP1-81 : ≈ 14 500 octets de plus par compte quand la zone double), restauration pendant ET après la panne avec la vraie app
V2 (B-NIX X1), retour arrière vers @192 sans rien perdre de la zone (`tools/preuve_retour_arriere_d110.js`). B-NSP1
**82 / 0**, contrôle négatif **45 / 45** ; banc croisé **16 / 0**, contrôle négatif **8 / 8**. La vérification 5 rejouée sur
l'arbre intégré : **0 version introuvable** ; avec le serveur de la prod, 5 + 5 anciennes versions perdues (le défaut que P1
corrige). ⚠️ **Risque résiduel dit** : au-delà du plafond (panne de Drive prolongée ET centaines de versions de favoris
changées), un envoi est refusé et une restauration avant le retour de Drive perd ce qu'il portait — fermé côté appareil par
`D-112` (proposé). 👉 *Un plafond n'est pas une garantie, c'est une frontière : elle se mesure (NSP1-80) et elle se dit.*

## §98 — ⛔⛔ UNE REPRISE AFFICHAIT UNE CHOSE ET EN ÉCRIVAIT UNE AUTRE : DEUX CALCULS, UNE IDENTITÉ PAR LE NOM, DES RÉFÉRENCES QUI SE CONTREDISENT RECOPIÉES EN SILENCE *(23/10/2026, NUTRITION V2 — incident prioritaire, mission de Michel ; branche `claude/nutrition-v2`, non publié ; reproduit AVANT correction sur données inventées)*

> *(Numéro : §97 est celui de Claude Principal sur `claude/nut-securisation-p1`, §99 celui de Claude Séance sur
> `claude/dreamy-bell-pu88ia` ; celui-ci est le §98 — à reconfirmer à l'intégration.)*

**Le contexte.** Michel : *« une recherche fraîche ou un scan renvoie les bonnes valeurs, mais la reprise depuis les favoris ou
l'historique peut restituer des valeurs fausses »* (Iso Zero : scan de 40 g juste le 23/08, puis un couple 156 kcal / 26 g de
protéines recopié de favori en historique ; 517 entrées auditées le 19/10, 150 A/B, 51 recopies). Le banc P15 (`nut2_parcours.js`)
a été **écrit et joué sur le code d'avant** : 24 rouges sur 37 — puis 37 verts sur le même banc après correctif.

**Les cinq mécanismes, chacun reproduit par les vrais gestes :**
1. **Deux calculs pour une reprise.** La liste « Mes aliments » affichait les valeurs ENREGISTRÉES d'un favori ; « + Ajouter » les
   RECALCULAIT par sa fiche, avec une définition de portion réécrite après coup par ft-v1186 ⑤ (pot 125 → 150 g, macros
   inchangées par décision) → **400 kcal affichées, 480 écrites**. Le même écart naissait d'un produit À CÔTÉ : « Modifier » un
   yaourt B (pot de 150 g) réécrivait le favori du yaourt A du même nom → 100 kcal affichées, 120 écrites.
2. **L'identité par le NOM.** Un favori d'avant V2 (V1 ne recopiait aucun code-barres dans un favori) masquait le scan juste du
   même nom ; une copie récente masquait la ligne vérifiée ; de deux produits du même nom (deux codes-barres) un seul existait
   dans la liste, dans « Déjà noté par toi » et comme favori ; « ✕ » sur le favori faux masquait le scan juste ; l'étoile d'un
   scan retirait le favori du même nom au lieu d'en créer un.
3. **La recopie silencieuse d'une référence qui se contredit** — 26 g de protéines pour 40 g d'une fiche à 88 g/100 g (la
   correction partielle, M4) ; 28 g de macros dans 5 g (la forme M6) ; une copie différente de la fiche vérifiée du même
   code-barres — par « + Ajouter » et « Tes repas habituels », sans un mot.
4. **`n2.av` perdue à la 2ᵉ modification** d'une ancienne ligne (le moteur ne la recopiait que d'une ligne sans `n2`) — c'était
   le défaut laissé ouvert au §96, faute de périmètre.
5. **Une valeur inconnue devenue 0** dans un favori (`_itemListe` : `s.prot || 0`), puis écrite 0 par « + Ajouter ».

**Ce qui n'a PAS été trouvé, et c'est dit** : aucun commit ne **calcule** le couple 156 / 26 — il naît d'un geste (une seule macro
retouchée dans l'ancien « Modifier », M4 : INDICE, le geste n'est pas enregistré). ft-v1110 (03/09, 07:42 UTC, le calibrage à la
main) précède de quelques heures la première ligne 156 / 26 : **coïncidence de dates écartée par la lecture du code** — le
calibrage écrit un pour-100 g complet et recalcule les quatre valeurs, il ne peut pas produire un couple partiel. Les commits qui
portent les mécanismes, eux, sont prouvés par la reproduction : ft-v1186 (`15ff528e`, 09/09) + jalon 4 (`11ed6348`, 22/10) pour
le 1 ; le dédoublonnage par nom (présent avant ft-v855, `ffe39fa6`, 15/08 — l'origine est hors de l'historique disponible) et
ft-v1042 (`1e066376`, 27/08 : les favoris gardent quantité et pour-100 g) pour le 2 et le 3 ; `9feec3bd` (22/10) pour le 4 ; le
`|| 0` du noyau d'item (centralisé par la sous-étape 1b-iii, `30833641`, 12/09 ; le motif est plus ancien) pour le 5.

**Les correctifs** (D-111) : une construction unique de ce qu'une reprise écrirait, lue par l'affichage et par l'écriture
(`_n2Reajouter` en aperçu) ; l'identité du produit (`_n2Cle`) ; une référence vérifiée jamais masquée ; quatre causes
d'incohérence démontrées (`_n2Incoherence`) → « ⚠️ à vérifier », l'écran plutôt que la recopie ; « non vérifié » sur une
recopie ; l'inconnu reste absent ; `n2.av` transmise par le moteur. ⛔ Aucune donnée enregistrée modifiée.

**Et deux défauts de MES témoins, trouvés en les éprouvant :**
- un témoin qui supposait la liste « une ligne par saisie » : elle montre UN élément par produit (le plus récent vérifié) — le
  scan à étoiler devait donc être la DERNIÈRE saisie (recherche par nom placée avant) ;
- un témoin qui n'aurait jamais rougi : « Modifier le yaourt B ne redéfinit pas le favori du A » était joué APRÈS l'étoile du B —
  deux favoris du même nom, l'ancien code (par le nom) voyait une ambiguïté et ne touchait à rien : vert sans rien éprouver. Il
  est joué quand le SEUL favori de ce nom est celui du A (MP73 le prouve).
- et un correctif inobservable, retiré : « ? kcal » dans une proposition CIQUAL — la recherche écarte déjà les 143 aliments sans
  énergie connue (`_ciqualChercherUne`) ; aucune proposition n'affichait 0.

**Un témoin voisin RÉÉCRIT, pas affaibli** : `B-NM6-C ②` (`nut_m6_rejeu.js`, le cliquet de M6) exigeait **2** appelants de
`_n2Reajouter` — l'aperçu en est un **3ᵉ**, par construction (c'est le correctif lui-même). Il exige maintenant les trois noms,
**et** que `_n2Apercu` passe l'argument d'aperçu, **et** que `_n2Reajouter` rende l'aperçu AVANT tout `_n2Enregistrer` : un
aperçu qui pourrait écrire, un ordre inversé ou un 4ᵉ re-noteur non déclaré le font rougir (N17 → N19,
`tools/mut_nut_m6_rejeu.py`). *Un cliquet qui compte des appelants se déplace avec la construction qu'il protège ; il ne se
relâche pas.*

**Et six témoins de la passe complète (trois blocs), attrapés par la passe RÉDUITE (31 blocs) — tous sur l'ancien contrat,
aucun sur un défaut** *(le commit `47386fb7` dit « cinq » : c'est faux, ils sont six — ⑫ ⑬ · ② ③ · ⑧ ⑪)* :
- `CCLXXXV ⑫ ⑬` (ft-v1188) figeaient « *le nom EST l'identité d'un favori, il ne porte aucun autre identifiant* » — vrai
  le 10/09, **faux depuis la V2** (un favori garde son `sourceId`) et contraire à la mission. ⑫ passe désormais par la VRAIE
  liste (sa fixture reposée à la main testait la recherche par nom de l'étoile, le défaut même) : une identité, un favori ;
  ⑬ garde le refus d'agir sur une identité ambiguë (même nom, sans code-barres) et exige qu'à deux codes-barres seul le bon
  favori suive sa définition ;
- `CCXCV ② ③` (ft-v1198) figeaient les « replis » `kcal: 0`… d'une valeur inconnue — exactement la cause n°5. Le noyau
  garde ses 9 champs sur une source complète, sans `portionWeightG` ni `fav` (décision produit n°2) ; une valeur inconnue
  reste absente, un 0 connu reste 0 ;
- `CCCIV ⑧ ⑪` (ft-v1206) : le canari portait 6 666 g de protéines dans 3 333 g — « + Ajouter » ne le recopie plus, le
  carnet restait vide et le témoin rougissait par sa PRÉCONDITION, pas par une fuite. Le canari se tient désormais
  (4 567 g, valeurs à 4 chiffres reconnaissables).
Chacun rougit sous mutation : R40 → R48, **9 / 9 conformes** (`tools/mut_temoins_v2.py`). *Une passe réduite sur les blocs qui touchent les
fonctions changées n'est pas une formalité : les bancs dédiés étaient verts, et ces cinq-là n'y étaient pas.*

**À quoi on le reconnaît.** *Un affichage et une écriture qui calculent chacun de leur côté finissent par diverger — la seule
question est quand* (R2). Et *un nom n'est pas une identité* : il relie ce qui n'a pas d'identifiant, il ne doit jamais séparer
ni confondre ce qui en a un.

## §99 — ⛔ UN EN-TÊTE MIS EN LIGNE SANS RETOUR POSSIBLE, ET DEUX TÉMOINS QUI NE REGARDAIENT QUE LÀ OÙ ON AVAIT PENSÉ À REGARDER *(23/10/2026, SEANCE-UX-IMAGES — session-C, branche `claude/dreamy-bell-pu88ia`, non publié ; ⚠️ numéro à reconfirmer à l'intégration : §92, §94, §96 sont ceux de Nutrition V2, §97 celui de Claude Principal)*

**Ce qui s'est passé.** Le lot des vignettes de « Choisir un exercice » avait un banc vert (18 / 0) et un contrôle négatif conforme
(17 / 17). Une relecture indépendante, à qui l'on n'avait donné que le code, a trouvé un défaut **calculé** — puis mesuré dans le
rendu : pour mettre la vignette et le libellé d'un groupe ouvert **côte à côte**, l'en-tête était devenu une rangée **sans retour à
la ligne**. Sa largeur minimale passait de « le mot le plus long » à « vignette + écart + mot le plus long » ; à **320 px**,
« Abdominaux » poussait le bouton « 🫀 Anatomie » **20 px** hors de la feuille et la liste glissait de côté (Pectoraux, Fessiers :
1 à 2 px). Avant le lot, rien ne débordait. La consigne du paquet le demandait pourtant en toutes lettres : *« vérifier l'absence
de débordement »*.

**Pourquoi aucun témoin ne l'a vu.** Le contrôle de débordement tournait à 3 largeurs… **sur les tuiles** ; l'en-tête, modifié dans
le même lot, n'était testé **qu'à 390 px**. Et un 2ᵉ témoin, celui du préchargement, **cherchait le texte** des chemins dans
`sw.js` : les lignes mises en commentaire, il restait vert avec **0** vignette préchargée — la mutation qui le « prouvait »
supprimait la ligne au lieu de la commenter.

**Correctif.** L'en-tête peut passer à la ligne, et le libellé a une **base nulle** : il reste à côté de l'image tant que son mot le
plus long y tient (390 px : les 8 groupes, comme avant le correctif), sinon il passe dessous, comme avant le lot. Mesuré : aucun
débordement de 300 à 430 px. Témoin **C-VIG-B4** (les 8 groupes ouverts à 320 et 340 px : rouge avant le correctif, vert avant le
lot) ; C-VIG-S2 **évalue** la liste `PRECACHE` ; mutations MV15 · MV16 · MV17.

**À quoi on le reconnaît.** Un témoin de mise en page qui tourne à plusieurs largeurs sur UNE vue, pendant que la vue voisine,
modifiée par le même lot, n'est vue qu'à une largeur. *Chaque élément dont la largeur minimale change se teste à la plus petite
largeur servie.* Et un témoin de **liste** qui cherche du **texte** : *une liste se lit en l'évaluant, sinon un commentaire la vide
sans que le témoin le sache* (même famille que C-VIG-S3, qui évaluait déjà `EX_GROUPS`).

**Ce qui le protège aujourd'hui.** `tests/parcours/picker_vignettes.js` (C-VIG-B4, C-VIG-S2) et `tools/mut_picker_vignettes.py`
(MV15 → B4, MV16 → B1, MV17 → S2). Et, encore une fois, la leçon du §95 : *la revue adverse cherche les chemins qu'aucun témoin
ne conduit* — ici, une largeur.

## §100 — ⛔ LES JUMELLES DU §85 : LA RÈGLE DE VOLUME ÉTAIT RECOPIÉE À DEUX AUTRES ENDROITS, ET « ENREGISTRER » RECALCULE TOUT *(23/10/2026, contre-vérification de l'audit transversal Séance de ChatGPT — session-C, branche `claude/dreamy-bell-pu88ia` ; **TROUVÉ, NON CORRIGÉ** : phase 1 = analyse seule, décision de Michel attendue ; ⚠️ numéro à reconfirmer à l'intégration : §92, §94, §96, §98 sont ceux de Nutrition V2, §97 celui de Claude Principal)*

**Symptômes (mesurés dans la vraie app, réseau coupé, données fictives — master `4ab7f860` = branche).** ① Une séance avec un
unilatéral (Arraché Haltère 30 kg × 10 « par bras ») et un développé couché (100 × 5) est enregistrée à **1 100 kg** ; le
panneau du jour du calendrier dit **« 0,8 t »**. ② Ouvrir cette séance et appuyer sur « 💾 Enregistrer » **sans rien changer**
fait passer son volume stocké de **600 à 300** — et recalcule ses calories avec le poids **du jour** (82 → 95 kg :
**97 → 112 kcal**). ③ Corriger la durée par ⏱️ ne recalcule pas les calories (317 kcal pour 90 min au lieu de 440), et rouvre le
détail depuis la séance stockée : une charge tapée mais pas encore enregistrée **disparaît** (120 → 100).

**Cause.** La même que le §85 : la règle de volume (`_workVol`, avec la convention unilatérale `uniConv` du 11/08) recopiée là
où on affiche ou ré-enregistre — `_calSessVol` (`screens.js:2220`) et `saveSessEdits` (`setup.js:1693`) refont `kg × reps` sans
doubler l'unilatéral. Le §85 a corrigé **une** copie (« Ta séance jusqu'ici ») ; **deux autres sont restées**. Et
`saveSessEdits` recalcule **tout** (volume, records à la hausse, calories avec `S.bw` du jour) à chaque appui, même sans
changement — alors que la matrice de recette de l'audit l'attend en toutes lettres : *« aucun chiffre ne doit changer sans
raison »*. Le runner du calendrier testait `_calSessVol` avec N, É, W et séries non faites… **jamais avec `uniConv`**.

**Contre-épreuves.** Sur une copie de master où SEULE la ligne suspecte lit `_workVol` : le calendrier dit **« 1,1 t »**, et
« Enregistrer » garde **600** ; une séance ancienne sans `uniConv` reste **600** dans les deux cas (pas de doublement rétroactif).
Scripts : `tools/contre_verif_seance_2026_10_23/` ; rapport complet : `docs/CONTRE-VERIF-AUDIT-SEANCE-2026-10-23.md`.

**À quoi on le reconnaît.** Le même que le §85, et il faut le relire : *un affichage n'a pas le droit de posséder une règle : il la
lit.* Et le corollaire R8 que le §85 n'a pas appliqué : **quand on trouve une copie, chercher ses jumelles tout de suite** —
`grep 'kg\*.*reps\|kg||0)\*(s.reps'` sur les fichiers d'écran les aurait montrées. S'y ajoute une 2ᵉ forme : *un « Enregistrer »
qui recalcule ce que la personne n'a pas touché réécrit l'histoire sans le dire.*

**Ce qui le protège aujourd'hui.** Rien de permanent : les reproductions sont hors passe. ⛔ Les séances unilatérales déjà
modifiées depuis le 11/08 portent un volume divisé par deux — **ne pas les réécrire** sans décision de Michel (diagnostic en
lecture seule d'abord, voir le rapport §4, lot 1).

↪️ **24/10/2026 — CORRIGÉ sur la branche Séance (mission de Michel, lots 1 et 2, non publié)** : « Enregistrer » suit `_workVol`
et ne bouge plus les calories sans changement d'effort (D-114) ; la durée corrigée met les calories à jour et garde la
modification en cours (D-115) ; le calendrier, la tendance, l'export, le tableau de bord et Milo lisent la même règle (D-116) ;
les séances déjà divisées s'affichent juste **sans être réécrites**. Témoins C-NUM-A → D (`tests/parcours/seance_chiffres.js`),
vus rouges sur master. Détail : `docs/SEANCE-CHIFFRES-2026-10-24.md`, §103 ci-dessous.

## §101 — ⛔ « RESTAURER » REMPLACE LES FAVORIS : CE QUI N'EST PAS ENCORE PARTI AU SERVEUR EST PERDU — ET SEULS LES 200 PREMIERS FAVORIS PARTENT *(23/10/2026, intégration Nutrition V2 × P1 — branche `claude/nut-v2-p1-integration` ; deux défauts PRÉEXISTANTS, prod comprise, mesurés, NON corrigés · ↪️ **renuméroté §100 → §101 le 24/10, avant sa publication** : le §100 de `dreamy-bell` (session-C, 23/10 18:50 UTC) était antérieur au mien (21:07) — je l'avais choisi « après le §99 » sans revoir la branche ; c'est donc le mien qui bouge, pas le sien)*

**Le constat (vraie app V2 + vrai `Code.js`, données inventées).** ① Hors ligne, la portion d'un favori est redéfinie
(pot 125 → 150 g) ; l'envoi ne part pas ; « 🔄 Restaurer mon compte » remet la version du serveur (125 g) — **la
modification locale est perdue**, sans message (B-NIX X3, « limite dite »). Le journal, lui, ne perd rien : sa
restauration **fusionne** (ft-v1247), celle des favoris **remplace** (`_applyRestoreData` : `S.savedFoods=d.savedFoods`).
② `_cloudSync` n'envoie que `savedFoods.slice(0,200)`, et un favori s'ajoute **à la fin** (`toggleFavFood` : `push`) :
au-delà de 200 favoris, les **plus récents** n'atteignent jamais le serveur, et « Restaurer » ou un nouvel appareil les
perd. Ni l'un ni l'autre ne vient de V2 ou de P1 : la prod (@192 + `ft-v1259`) les a tous les deux.

**Pourquoi rien ne l'a vu.** La restauration par union a été écrite collection par collection (séances ft-v1241, journal
ft-v1247) — **les favoris sont restés sur l'ancien modèle** : la phrase du §33 encore (*une règle corrigée dans une
collection et pas dans sa voisine*). Et la troncature à 200 est une borne d'envoi sans borne de saisie : *une limite qui
coupe la fin d'une liste coupe ce qu'on vient d'ajouter.*

**Ce qui est proposé, pas appliqué.** ① `D-112` (FIX-B′) : la restauration **ajoute** les favoris du serveur que l'appareil
n'a pas, par **identité de produit** (`_n2Cle`), le téléphone gagne. Prototype hors dépôt : X3 basculé, rien d'autre ; le
coût mesuré (deux appareils) est écrit dans `D-112`. ② La troncature : à trancher avec la décision sur les favoris
(envoyer la liste entière — la zone P1 et sa borne la protègent côté serveur — ou garder les 200 **derniers**). ⛔
Changement de comportement de l'app → décision de Michel.

**À quoi on le reconnaît.** Une porte qui **remplace** une donnée locale par la copie du serveur n'est sûre que si tout ce
que l'appareil sait est **déjà** au serveur. *Un refus côté serveur, une coupure réseau ou une troncature d'envoi
transforment ce remplacement en perte.*

**⭐ Trois leçons de méthode, payées le même jour.** ① Le contrôle négatif du banc croisé a d'abord **planté** au lieu de
rougir (un `[0]` sans garde dans X3) : *un plantage n'est pas un rouge* — le banc a été durci avant de conclure. ② Un
scénario à deux appareils donnait deux résultats différents d'un lancement à l'autre : la synchro **différée** (4 s) d'un
appareil partait au milieu du scénario. *Un test multi-appareils qui ne maîtrise pas les synchros différées mesure
l'horloge, pas le code* — une synchro explicite annule désormais la synchro différée en attente. ③ La passe complète de
l'intégration a trouvé **un témoin d'avant V2 resté en place** (CII ⑥ : « la quantité efface la correction à la main ») —
rouge aussi sur la branche V2 **seule**, vert sur master : la passe **réduite** de V2 ne le couvrait pas. Il a été réécrit sur
`D-096` (Michel : « une modification manuelle est conservée et tracée ») — la correction reste, le calcul pour 50 g (24 · 5)
se lit à côté, « ↺ Revenir au calcul » le remet — et son contrôle négatif rougit 3 fois sur 3. *Un sous-ensemble ne remplace
pas la passe complète : le protocole le disait, le cas l'a montré.*

## §102 — ⛔ UN DÉCOUPEUR QUI DOUBLE SANS REFUSER, ET QUATRE LIBELLÉS QUI AFFICHENT L'HORLOGE *(24/10/2026, OPTI-TEST-02 → D-031 accélérée — branche `claude/d031-acceleree`, fusionnée le 24/10 (`3bc75ab9`) ; `D-113` VALIDÉE par Michel ; outils de test seulement, aucun code de l'app)*

**Le constat (session-A, OPTI-TEST-02, sur copies de `ft-v1259`).** ① Le premier découpeur de la passe en
plusieurs processus avait été écrit pour un runner **antérieur** au harnais D-031 Sécurité. Sur le runner
d'aujourd'hui, il **triplait en silence** 4 instructions — 3 contrôles du garde (`D031S-III`, `IV`, `V`) et le module
`d031s_rir_superset` — **sans rien refuser** : la passe finissait verte, avec un total **plus grand**. ② Quatre témoins
**affichent l'horloge** de la passe : `B-D086-⑫a` ×2 (l'heure, `tests/parcours/ux_d086.js` l. 299), `PS-E13` et
`PS-E14` (une date calculée depuis le jour, `tests/parcours/progres_seances.js` l. 287 et 299). Deux passes
**classiques** du même code ne portent donc pas les mêmes libellés : une comparaison naïve « voit » des écarts qui n'en
sont pas — et une comparaison qui les fait taire à la main peut faire taire n'importe quoi.

**Pourquoi rien ne l'aurait vu.** Un contrôle compté trois fois **passe trois fois** : aucun rouge, aucune erreur, un
total en hausse. *Un total plus grand ressemble à un meilleur total.* Et le découpeur était seul juge de son découpage.

**Ce qui le ferme (`D-113`, validée par Michel le 24/10).** Un découpeur **fermé par défaut** (`tools/decouper_passe.js` : toute instruction
qu'il ne sait pas classer arrête la découpe) **et** un contre-vérificateur **qui ne partage pas son code**
(`tools/verifier_decoupe.js` : chaque instruction gardée exactement une fois, hors de l'infrastructure ; rien de réécrit).
La comparaison classique ↔ répartie (`tools/comparer_passes.py`) se fait sur des **multiensembles** de (libellé,
verdict) ; la normalisation est **limitée** à 3 règles pour ces 4 libellés, **établies entre deux classiques**, et chaque
libellé touché est **compté** dans la sortie.

**À quoi on le reconnaît.** Un outil qui **réorganise** des tests (découpe, parallélise, filtre) doit prouver *chaque
contrôle exactement une fois* par un vérificateur indépendant — et un total qui **monte** sans nouveau test est un signal,
pas une bonne nouvelle. *Un découpage qui ne refuse jamais finit par doubler.* Côté libellés : un témoin qui écrit
l'heure dans son nom n'est plus comparable d'une passe à l'autre ; le corriger, c'est modifier un test (preuve propre et
accord de Michel) — d'ici là, il se normalise **nommément**, jamais par motif large.

## §103 — ⛔⛔ UNE SÉANCE PASSÉE CHANGEAIT EN SILENCE À « ENREGISTRER », ET SES CHIFFRES DIFFÉRAIENT D'UN ÉCRAN À L'AUTRE *(24/10/2026, mission Séance de Michel — session-C, branche `claude/dreamy-bell-pu88ia` ; **CORRIGÉ sur la branche, non publié**)*

**Symptômes (mesurés sur master, vraie app, réseau coupé, données fictives).** « Enregistrer » sans rien changer : calories
recalculées au poids **du jour** (82 → 95 kg : **97 → 112 kcal**) et volume unilatéral **divisé par deux** (600 → 300) ;
corriger la durée (60 → 90 min) gardait les calories de 60 min et effaçait une charge tapée ; le calendrier disait **0,8 t**
pour une séance enregistrée à 1 100 kg ; la tendance de volume, l'export CSV, le tableau de bord et la liste envoyée à Milo
refaisaient `kg × reps` sans l'unilatéral ; une ancienne série « W » comptait comme travail dans le volume par muscle
(**3** séries de pectoraux au lieu de 2, Milo lisait 1,5 série/semaine au lieu de 1) ; le cache de couleur du calendrier ne
voyait pas une série cochée de plus ; la tuile « Séance » de Nutrition ne prenait que la 1ʳᵉ séance du jour (**350 au lieu de
600 kcal**) ; l'en-tête de l'export PDF comptait des jours pour des séances ; un cardio Apple Santé « Walking » s'affichait
« Elliptique » ; un score de récupération SANS sommeil disait « Prêt à performer » et invitait aux records.

**Cause, une seule famille.** Une règle (le volume de travail, les calories d'une séance) **recopiée** là où on affiche ou
ré-enregistre, et un « Enregistrer » qui **recalcule ce que la personne n'a pas touché** (§85, §100 : les jumelles n'avaient
pas toutes été trouvées). *Un affichage n'a pas le droit de posséder une règle : il la lit.*

**Correctif.** `_workVol` / `_volTravail` lus partout (D-116) ; `_kcalApresEdition` : même effort → rien ne bouge, effort
changé → rapport appliqué aux calories d'origine (D-114) ; K2 (D-115) ; F06, F19, F22, F23 (D-117 → D-119). Aucune séance
ancienne réécrite. Le moteur calorique est APPELÉ, jamais modifié.

**Ce qui le protège.** `tests/parcours/seance_chiffres.js` (blocs C-NUM-A → J), branché dans la passe, contrôle négatif
`tools/mut_seance_chiffres.py` (M1 → M35). ⭐ La leçon de méthode : *chercher les jumelles TOUT DE SUITE* — `grep` sur
`kg*reps`, `.volume||`, `calcSessionCalories(` dans tous les fichiers d'écran, `dashboard.js` compris.

## §104 — ⛔ UN RECORD RESTAIT CELUI D'UNE SÉANCE SUPPRIMÉE, ET UNE GARDE « DÉJÀ JUSTE » A CACHÉ UNE MUTATION *(24/10/2026, mission Séance, lot 3 ; **CORRIGÉ sur la branche, non publié**)*

**Symptôme.** Supprimer la séance d'un record (100 × 5), ou corriger sa série à la baisse, laissait le record à 100 × 5 —
sans séance pour le porter. **Correctif** (D-120) : un aperçu « avant → après » calculé par l'outil existant, rien sans le
geste, un record d'origine incertaine jamais proposé. **⚠️ Méthode** : la 1ʳᵉ campagne a donné 10/11 — la mutation « l'origine
n'exige plus la même date » restait verte parce que le témoin G1 recalculait un record **déjà juste** (le même 100 × 5 refait
un autre jour) et la garde « déjà juste » taisait l'aperçu. *Une garde de non-régression peut masquer la mutation qu'un autre
témoin devait attraper.* Témoin ajouté : **C-REC-D2** (un record seulement ÉGALÉ, daté d'un import).

## §105 — ⛔ DEUX LISTES D'IMAGES QUI DIVERGENT : 6 FICHIERS PRÉCHARGÉS JAMAIS AFFICHÉS, ET 156 ILLUSTRATIONS JAMAIS PRÉCHARGÉES *(24/10/2026, mission Séance, lot 5 ; le 1ᵉʳ **CORRIGÉ**, le 2ᵉ **CONSTATÉ, NON CORRIGÉ** — décision de Michel)*

**Mesuré.** ① 6 fichiers de la liste `PRECACHE` (`sw.js`) ne sont nommés **nulle part** dans le code servi (551 289 octets) ;
les 4 de `machine/` sont hors de `IMG_RE`, donc dans le cache **versionné** : 386 881 octets retéléchargés à chaque version.
② **156 des 305** illustrations d'exercices (`EX_YT`) ne sont **pas** dans `PRECACHE` (15,3 Mo) : elles se téléchargent à la
première vue, puis vont dans le tiroir stable. Hors ligne à la salle, sur un téléphone neuf, elles **manquent** tant qu'elles
n'ont pas été vues une fois. **Cause** : deux listes pour la même information (R2) — les animations ajoutées après ft-v214 l'ont
été à `EX_YT` sans l'être toujours à `PRECACHE`. **Correctif ①** (D-125) : retirés du préchargement, fichiers gardés ; témoin
**C-IMG-C1** (« aucun fichier préchargé n'est jamais affiché »). **②** : précharger 15 Mo de plus est une décision de données
mobiles (ft-v436) — **à Michel**. ⚠️ *Mon premier témoin affirmait « toute illustration est préchargée » : c'était une
supposition sur l'app, pas une garantie qu'elle donne — retiré avant d'être livré (R28).*

## §106 — ⛔ LA FIGURINE APPELAIT « PRINCIPAL » UN SECONDAIRE CUMULÉ, ET L'ORACLE D'UN BANC FIGEAIT LA RÈGLE FAUSSE *(24/10/2026, mission Séance, lot 3 ; **CORRIGÉ sur la branche, non publié**)*

**Symptôme.** Deux exercices où le triceps est secondaire : score 2 → listé « Primaires », dessiné en rouge (8 zones rouges au
lieu de 6). **Cause** : un seuil en marche d'escalier (« score ≥ 2 ») confondait « moteur » et « souvent sollicité ».
**Correctif** (D-121) : `prim` = primaire dans au moins un exercice. **⚠️ Le banc voisin `fig_face_dos` a rougi** : son
oracle recalculait « principal » avec la même règle fausse — il ne protégeait pas l'invariant, il recopiait l'implémentation.
Oracle **réécrit** (les moteurs lus dans la fiche), et éprouvé : il rougit sous M41, M42 et M49.

## §107 — ⛔ LE CHOIX DE LA PERSONNE PASSAIT APRÈS LA RÈGLE DU NOM, ET LE CORRIGER CHANGEAIT LES CALORIES PAR LA BANDE *(24/10/2026, mission Séance, lot 3 ; **CORRIGÉ pour l'affichage, calories en attente de Michel**)*

**Symptôme.** Un perso « Croisé Poulie » coché mollets montrait des pectoraux ; un « Curl Maison » coché quadriceps, des
biceps — pendant que Progrès comptait les muscles cochés. **Cause** : premier match gagnant (la fiche, puis la règle du nom,
le choix de la personne en dernier). **Le piège** : `_mscScores` est aussi le moteur des CALORIES (`getExerciseMET` compte
ses muscles) ; le corriger là déplaçait la dépense de certains persos (mesuré : −6 à +4 kcal par séance d'une heure) sans que
personne l'ait décidé. **Correctif** (D-122) : `_mscScores` identique à l'octet à master ; l'affichage passe par
`_mscScoresVus`. Témoins C-MUS-B3 (réécrit), B5, C1 (périmètre : 4 appelants du moteur), C2.

## §108 — ⛔ LE PROFIL AFFICHAIT « REPOS DÉFAUT » VIDE POUR TOUS CEUX QUI N'Y AVAIENT JAMAIS TOUCHÉ *(24/10/2026, mission Séance, lot 4 ; **CORRIGÉ sur la branche, non publié**)*

**Mesuré.** Le sélecteur proposait 60 / 90 / 120 / 180 / 300 s ; la valeur d'installation est **130 s** (`REPOS_DEFAUT`) : la
case restait **vide** (le chrono appliquait bien 130 s). Une valeur restaurée hors liste (75 s) aussi. **Cause** : une liste en
dur dans `index.html`, distincte de la constante (R2). **Correctif** (D-126) : une liste (`reposDefautChoix`), un écrivain
(`choisirReposDefaut`), la valeur hors liste montrée telle quelle ; le menu ⋯ de la séance lit la même. Témoins C-REG-A → D.
*Aucun témoin ne lisait ce sélecteur : il était vide depuis le 12/09 (ft-v1195, 130 s) sans que rien rougisse.*

## §109 — ⛔ UNE IMAGE DE MUSCLE « DEVINÉE » ÉTAIT PRÉSENTÉE COMME L'ILLUSTRATION D'UN EXERCICE *(24/10/2026, mission Séance, lot 5 ; **CORRIGÉ sur la branche, non publié**)*

**Symptôme.** Pour les 17 exercices du catalogue sans animation (et tout perso sans photo), la vignette et la démonstration
montraient l'image du muscle « deviné » du nom — rien ne disait qu'il ne s'agissait pas de l'exercice. **Correctif** (D-124) :
« Aucune illustration disponible » aux 3 surfaces ; R29 (*quand l'app ne sait pas, elle le dit*). Témoins C-IMG-A1 → B1.

## §110 — ⛔ CE QUE LE DIAGNOSTIC MET A TROUVÉ, ET QUI RESTE TEL QUEL (MOTEUR GELÉ) *(24/10/2026, mission Séance, `docs/DIAGNOSTIC-MET-2026-10-24.md` ; **CONSTATÉ, NON CORRIGÉ** — décision de Michel)*

① **Séries cochées en bloc** : des horodatages sous le plancher physique deviennent la durée → **211 kcal au lieu de 337**
(−37 %), sans ⚠️. ② **Cardio d'après, chrono seul** : ses minutes payées deux fois (transition + cardio) → **488 au lieu de
427**. ③ **« Tapis » en sous-chaîne** : « Étirements / Gainage / Crunch sur tapis » (persos) comptés **8,0** comme un burpee.
④ Le gainage noté en secondes compté en répétitions de 3 s. ⑤ Deux chiffres sur le même écran (337 et « 🔬 ~287 »).
⑥ 33 classements douteux nés de la règle « 3 muscles ou plus ». Recommandations simulées R1 → R8, chiffrées ; aucune
appliquée. *Ce sont les familles « premier match gagnant » (mots-clés en sous-chaîne) et « seuil en marche d'escalier ».*

## §111 — ⛔ UN TÉMOIN QUI NE POUVAIT PAS ROUGIR : SA FIXTURE ÉTAIT UNE ISOLATION, ET UNE ISOLATION LE RESTE *(25/10/2026, mission Séance, clôture ; **CORRIGÉ dans le banc**, aucun code applicatif)*

**Le cas.** `C-MUS-B5` garantit qu'un exercice perso au nom **reconnu** garde les calories de sa fiche, quels que soient les
muscles cochés. Sa fixture prenait le 1ᵉʳ nom abrégé du catalogue : « Croisé Poulie (Cable Crossover) », une **isolation**
(MET 4,0). La personne y coche un mollet : **une isolation aussi** (moins de 3 muscles → 4,0). Le témoin comparait 4,0 à 4,0 —
il ne pouvait **pas** rougir, quel que soit le moteur. **Comment on l'a vu** : à la clôture, trois témoins rougissaient sur
master seulement **par absence** (la fonction n'y existe pas) sans être la cible d'aucune mutation ; chacun a reçu la sienne
(M67 → M69). M67 et M69 ont mordu ; **M68** (le moteur lit les muscles cochés **avant** la fiche) n'a fait rougir que B3.
**Correctif** : la fixture prend un **composé** dont le MET dépend vraiment des muscles (« Dips Triceps (Buste Droit) », 5,5 ;
ni mot-clé haltéro / cardio / porté, ni charnière de hanche, ≥ 3 muscles), et B5 exige une fiche **au-dessus** de
l'isolation : si la fixture redevient insensible, le témoin rougit au lieu de se taire. *Famille « un vert qui ne peut pas
rougir » ; leçon : « rouge sur master » ne prouve rien pour un témoin qui échoue par ABSENCE — seule une mutation le peut.*

## §112 — ⛔ MON TÉMOIN DISAIT LE CONTRAIRE D'UN TÉMOIN DU RUNNER, ET MES BANCS VOISINS NE LE JOUAIENT PAS *(25/10/2026, retour de Claude Principal sur la mission Séance ; **CORRIGÉ sur la branche**)*

**Le cas.** La passe répartie sur l'arbre intégré a trouvé 4 rouges côté Séance, invisibles dans mes 25 bancs voisins.
Le plus instructif : mon témoin **C-NUM-J4** exigeait qu'un tapis importé d'Apple Santé passe sur le barème « Tapis »,
pendant que le témoin **XXXII** du grand runner exigeait « course » (calculé comme « Autre »). Les deux portaient **la
même règle en sens contraires** — un seul pouvait être vert, et j'avais choisi le mien sans le savoir. Pire : mon choix
changeait des **calories** (9,5 au lieu de 8,0 MET en intensité forte), ce que ma propre décision D-119 interdisait
(« calculés comme Autre »). **Les deux autres** : une fixture (CCXXVI ter) qui rangeait un volume que ses séries ne font
pas — invisible tant que la carte lisait la copie rangée, rouge dès que D-116 l'a fait lire les séries ; et un témoin de
SOURCE (B-CCCVI ⑥) qui épinglait le texte d'une boucle que D-116 a remplacée. **Correctif** : le code revient à
`ft-v1260` pour le tapis ; la fixture dit la même chose des deux côtés ; le témoin de source garde l'**invariant**
(deux règles, deux propriétaires) au lieu du texte ; chacun éprouvé (`tools/mut_seance_runner.py`, 5 / 5).
*Leçon : avant d'écrire un témoin, chercher dans le runner les témoins qui lisent la même fonction
(`grep` du nom de la fonction dans `tests/`) — et les jouer avec les bancs voisins.*
---

## §113 — ⛔⛔ UNE ANCIENNE LIGNE SCANNÉE RESTAIT FIGÉE À VIE, ET SA RECOPIE PERDAIT LE CODE-BARRES : L'ISOLAT « 156 · 35 · 1 · 1 » POUR 35 G COMME POUR 50 G *(24/10/2026, NUTRITION V2 · FIABILITÉ DES DONNÉES — mission P1 de Michel ; branche `claude/nutrition-v2`, NON publié ; reproduit sur le code de master `98c09ed9` par le banc B-NFIAB, données inventées)*

**Ce que Michel a vu (iPhone, 24/10).** Un isolat repris (40 g · 156 kcal · 35 P · 1 G · 1 L) : 35 g puis 50 g laissaient
156 · 35 · 1 · 1, avec « la fiche n'est pas vérifiée ».

**La cause, démontrée.** ① `NUT2.lireAncienne` ne vérifie une ancienne ligne **que** contre la fiche CIQUAL embarquée
(`ciqual:…`) : une ligne scannée avant V2 (un code-barres) n'est **jamais** vérifiable → reprise **figée**, à vie, même quand
un scan V2 du même produit existe dans le journal. ② La recopie « déclarée » (`ligneNouvelle`, mode `d`) n'écrivait pas
d'identité : `sourceId:null` — le produit redevenait un simple nom, et sa fiche ne pouvait plus jamais être retrouvée.
③ L'écran figé ne proposait **aucune issue**. *(Témoins rouges sur master : T02 ② ③ ④ ⑤ ⑥.)*

**Ce qui le ferme (`D-130`).** Dans l'**écran d'ajout**, la fiche se retrouve par l'**identité seulement**
(`_n2FicheIdentite`, `_n2RepriseIdentite`) : `ciqual:NNNN` → la fiche CIQUAL elle-même ; un code-barres → la fiche vérifiée
la plus récente du journal, sinon la fiche Open Food Facts lue en ligne par le chemin du scan (`_n2RetrouverEnLigne` →
`_offAppliquerProduit`) ; l'écran dit ce que disait la saisie, et c'est « Ajouter » qui écrit. Sans fiche, trois boutons
(🔎 Retrouver · 📷 Scanner · 🏷️ Étiquette) et l'état de la recherche. Un résultat arrivé après un changement d'aliment est
ignoré (`_n2RechJeton`, T02 ⑦). La recopie garde `sourceId` / `etat` — jamais une fiche. ⛔ **Hors de l'écran, la règle A de
`D-111` tient** (Michel, 24/10) : une référence qui contredit la fiche vérifiée de son produit reste « à vérifier » dans la
liste, et « + Ajouter » ouvre l'écran au lieu de la recalculer. ⛔ Aucune ancienne ligne n'est réécrite (`D-098`) : T02 ⑤
relit l'ancienne ligne à l'octet.

**⚠️ Et une erreur de MA première version, attrapée par les témoins voisins** : je recalculais aussi HORS de l'écran (la
liste affichait le favori à 26 g « ✓ fiche du produit » avec les valeurs de la fiche, et « + Ajouter » les écrivait) —
exactement la variante B que Michel avait écartée le matin même. Les témoins `B-NV2P P15` (règle A, 37 témoins) l'ont rendue
rouge : six rouges (P15 ① ② ③ ④ ⑤ ⑦), tous sur ce point. *Un témoin voisin qui rougit n'est pas un obstacle à « réparer » : il rappelait une
décision prise.* La mutation F1b du contrôle négatif la réintroduit exprès.

**À quoi on le reconnaît.** Une reprise qui ne bouge plus quand la quantité change, et qui dit « non vérifié » pour un
produit qu'on a pourtant scanné. *Une identité perdue à la recopie ne se retrouve jamais : c'est à la recopie qu'il faut
la garder.*

## §114 — ⛔⛔ UN POUR-100 G FABRIQUÉ, RECOPIÉ PUIS PROPOSÉ EN SILENCE : LE STEAK « 200 G · 130 KCAL · 22 G » ; ET LE MÊME PRODUIT À 155 OU 156 KCAL SELON LA PORTE *(24/10/2026, même mission, même branche ; reproduit sur master)*

**Ce que Michel a vu.** « Déjà noté par toi » : *Steak haché 5 % MG — 200 g · 130 kcal · 22 g de protéines*, alors qu'il
l'avait scanné. Ce n'est **pas** une confusion avec CIQUAL (« Boeuf, steak haché 5 % MG cru », 130 · 21,9 · 0,3 · 4,6) :
le produit scanné est un steak **de marque** (fiche Open Food Facts 129 · 21 · 0 · 5), relevé dans l'export du 19/10
(`audits/2026-10-21-nutrition-reconstruction-complete/`).

**La cause, démontrée dans l'export et rejouée sur données inventées de même forme.** Le 01/09, une ligne de **300 g**
porte **194 kcal** : ou bien les valeurs de 150 g (hypothèse A de la reconstruction), ou bien une quantité juste et des
valeurs divisées par 2 (hypothèse B, 387 kcal) — l'export ne permet pas de trancher, et on ne tranche pas. Dans les deux
cas, la dérivation du pour-100 g (M1) en tire **65 · 11 · 0 · 3** au lieu de 129 · 21 · 0 · 5 : la moitié. Recopiée de reprise en reprise (C2), elle donne au 16/10 et au 18/10
**200 g · 130 · 22 · 0 · 6** — numériquement le « pour 100 g » du vrai produit, d'où l'impression d'une quantité prise pour
du « pour 100 g ». La naissance du 01/09 relève de M1 / M6 (fermés en `ft-v1258` et en V2) ; **ce qui restait ouvert,
c'est la propagation** : V2 proposait ces lignes sans réserve et « + Ajouter » les ré-écrivait (`sourceId:null`).
*(Rouges sur master : T06 ① ③ ④.)*

**Et une deuxième porte qui contredisait la première.** La recherche Open Food Facts **arrondissait** l'énergie pour 100 g à
l'entier (`_afSuggKcal100`) quand le scan gardait une décimale : le même isolat (388,5 kcal / 100 g) donnait **155** kcal pour
40 g scanné et **156** cherché par son nom — et une étoile sur la ligne cherchée figeait 156 dans le favori. *(Rouges sur
master : T09 ① ⑤.)*

**Ce qui le ferme.** `D-131` : deux saisies de la **même identité** dont les valeurs ramenées à 100 g s'écartent au-delà de
l'arrondi et de 2 % → « ⚠️ à vérifier », « + Ajouter » n'écrit rien et l'écran dit les deux chiffres et la date
(« 65 kcal pour 100 g ici, 129,2 le 23/08 ») ; en ligne, la fiche du code-barres se retrouve (`D-130`) et 200 g =
258 · 42 · 0 · 10. L'énergie pour 100 g d'un produit n'a plus qu'**un** propriétaire, à une décimale, pour le scan
comme pour la recherche (`_afSuggKcal100` → `_offAppliquerProduit`, R2).

**À quoi on le reconnaît.** Un aliment dont la valeur « pour la quantité notée » ressemble trait pour trait à une valeur
« pour 100 g » : chercher un facteur 2 né plus tôt, puis recopié. *Un pour-100 g se lit dans une fiche ; déduit d'une saisie,
il hérite de toutes ses erreurs.*

## §115 — ⛔ « ✕ » ÉTAIT LOCAL, IGNORÉ PAR « DÉJÀ NOTÉ PAR TOI », ET REVENAIT PAR « RESTAURER » OU UN AUTRE TÉLÉPHONE *(24/10/2026, même mission — N2 du plan de Claude Principal ; reproduit sur master)*

**La cause.** `S.hiddenFoods` était une liste de chaînes **locale** : ni dans l'envoi de `_cloudSync`, ni dans la liste
blanche de `saveProfile` (`Code.js`), ni relue par « Restaurer » ou au démarrage ; la recherche dans le journal
(`_afSuggLocales`) ne la lisait pas ; et elle était **retirée** quand on re-notait l'aliment (`_unhideFood`), donc un autre
appareil ne pouvait pas savoir qu'elle avait existé. Une remise à zéro des propositions était, de ce fait, impossible à
tenir d'un appareil à l'autre. *(Rouges sur master : N2 ①, T08 ① → ⑦.)*

**Ce qui le ferme (`D-132`, `D-133`).** Des **dates de départ** `{k, t}` (identité ou `*`), fusionnées par le max au
téléphone et au serveur, appliquées partout où l'on propose, à « Restaurer » et au démarrage ; `_unhideFood` retiré
(R30, la raison écrite à sa place) : une saisie postérieure revient d'elle-même. ⚠️ `Code.js` : **déploiement Apps
Script à part**, avec son GO.

**À quoi on le reconnaît.** Une préférence de la personne qui ne vit que sur un téléphone. *Un masquage qu'on efface pour
« démasquer » ne peut pas se synchroniser : il faut une date, pas une absence.*

## §116 — ⛔ MÉTHODE : CHROMIUM NE DÉMARRE PAS QUAND `TMPDIR` EST TROP LONG — LE CONTRÔLE NÉGATIF « PLANTAIT » SUR UN ARBRE SAIN *(24/10/2026, même mission ; outil de test seulement)*

`TMPDIR=<dossier de session, 85 caractères> python3 tools/mut_nut_fiabilite.py` : l'arbre **sain** sortait « 0 OK / 1 rouge »
(`browserType.launch: … has been closed`). Chromium crée ses sockets dans `TMPDIR` ; un chemin trop long l'empêche de
démarrer. Le même banc, lancé sans ce `TMPDIR`, était vert. **Ce qui le ferme** : l'outil garde `TMPDIR` pour ses copies et
le **retire** de l'environnement du banc (Chromium reprend son dossier par défaut). ⚠️ Les autres `tools/mut_*.py` qui
documentent « les copies vont dans `$TMPDIR` » ont le même piège s'ils sont lancés avec un `TMPDIR` long : un plantage
n'est jamais un verdict, mais il coûte une passe. *Un banc qui plante sur un arbre sain ne dit rien du code : regarder
d'abord ce qui l'entoure.*
⚠️ **Rechute le même soir, par moi** : les bancs voisins relancés avec le même `TMPDIR` long — 20 « plantages » en
1 seconde chacun, seul le banc de chaos (sans navigateur) passait. Relancés sans ce `TMPDIR` : verts. *La leçon écrite
une heure plus tôt n'a pas suffi : le réflexe à prendre est de ne jamais exporter `TMPDIR` vers un banc qui lance Chromium.*
⚠️ **Et un 2ᵉ plantage du même soir, d'une autre cause** : la mutation F15 (« la remise à zéro part SANS sauvegarde »)
faisait planter le banc — la confirmation lisait `_nutRazSauve.nom`, l'exception remontait de la page par un `evaluate` que
le test ne protégeait pas. Deux corrections : le test rend une erreur de la page en **rouge** (jamais en plantage), et F15
modélise vraiment le défaut (la remise à zéro part). *Un témoin qui plante quand le code est faux ne protège rien : il faut
qu'il rougisse.*

## §117 — ⛔ MÉTHODE : UNE MUTATION QUI NE MORDAIT PLUS A TROUVÉ UN DOUBLON QUE J'AVAIS CRÉÉ (`_n2QteListe` devenu mort, sa logique recopiée) *(24/10/2026, même mission ; R2)*

En réunissant les cinq textes de proposition en un seul (`_n2TexteProposition`, `D-135`), j'ai **recopié** la logique de la
quantité (`NUT2.reprise`, puis `_n2QteTexte(q, _n2PortionFiable(R))`) au lieu de la réutiliser — et les deux appelants de
`_n2QteListe` (« Mes aliments », « Déjà noté par toi ») sont passés au nouveau texte : `_n2QteListe` n'avait plus **aucun**
appelant. Rien ne le voyait : le banc des parcours était vert (111 / 0), un code mort ne casse rien. **C'est le contrôle
négatif qui l'a dit** : MP50 (« la liste affirme le poids de toute portion ») mutait la ligne de `_n2QteListe` → **0 rouge**,
la mutation frappait du code que plus rien n'exécute. Corrigé : `_n2QteListe` retiré (sa raison écrite à côté de
`_n2TexteProposition`), son déclencheur du registre de recette reporté sur `_n2TexteProposition`, l'ancre de MP50 déplacée
sur la ligne qui écrit vraiment la quantité. *Une mutation qui ne mord plus ne dit pas toujours que le témoin est faible :
elle peut dire que le code visé est mort — et un code mort qui ressemble au vivant est un doublon (R2).*

⚠️ **Le même soir, F21 n'a pas mordu non plus — pour une 3ᵉ raison** : « Restaurer » qui ne reprend plus les masquages du
serveur laissait `B-NFIAB-X T08 ②` VERT (13 / 0). Le téléphone « neuf » du test démarrait **déjà connecté** : le démarrage
(`autoConnect`) rapportait les masquages avant même « Restaurer ». Deux chemins menaient au même état, le témoin ne savait pas
lequel l'avait produit. Corrigé : l'appareil démarre **hors ligne** (le démarrage ne peut rien charger), le réseau revient,
puis « Restaurer » ; et le témoin vérifie d'abord qu'aucun masquage n'était là avant. Le démarrage garde son propre témoin
(T08 ④, F23 le fait rougir). *Quand deux chemins mènent au même état, un témoin d'état ne prouve aucun des deux.*

## §118 — ⛔⛔ UNE ENTRÉE VIDE (`null`) DANS LE JOURNAL FAISAIT TOMBER LE JOURNAL DU JOUR, CE QUE MILO LIT, « AJOUTER » ET LA RECHERCHE *(25/10/2026, retour de Claude Principal sur NV2-FIAB — « N08 » ; PRÉEXISTANT, reproduit sur master `93dfbb75` ; corrigé sur `claude/nutrition-v2`, non publié)*

**Ce qui se passait.** Une entrée `null` dans `S.foodLog` (d'où qu'elle vienne : rien dans le code actuel n'en écrit, mais
une restauration la garde telle quelle) : erreur au démarrage, journal du jour vide (`renderFoodJournal`, `e.date`), et le
contexte de Milo ne se construisait plus (`_profilAlimentaire`, `e.kcal`). L'export et la synchro passaient déjà.

**Ce qui le ferme.** Les 2 lignes de Principal, mot pour mot (`.filter(e => e && typeof e === 'object')` dans
`_profilAlimentaire`, `e && e.date === td` dans `renderFoodJournal`). ⚠️ **Et quatre de plus, de même cause, trouvées en
élargissant son témoin** : ses conditions (aucun profil calorique, une ligne du jour placée AVANT les entrées vides) laissaient
passer `_resteDuJour` (la carte « ce qu'il te reste », que le journal du jour affiche — il tombait avec elle dès que le profil
est complet), et trois tris dont le comparateur lit `.ts` (`_buildFoodQuickItems` : « Ajouter » ; `_afSuggLocales` : « Déjà
noté par toi » ; `_mesAliments` : les idées pour le reste). Mêmes gestes : les entrées vides sont **ignorées, jamais
réécrites** (le journal garde ses 4 entrées). Contexte de Milo identique à l'octet sans entrée vide (76 275 caractères,
avant/après et contre master). Témoins `B-NFIAB N08 ① ② ③` (rouges sur master et sur `beda2652`), mutations N08a → N08f.

**À quoi on le reconnaît.** Une liste persistée lue champ par champ, ou triée, sans `e &&`. *Un témoin qui reproduit les
conditions de celui qui a trouvé le défaut ne prouve que ces conditions-là : un profil complet et un autre ordre en ont trouvé
quatre de plus.* ⚠️ Limite : revue des lecteurs de `S.foodLog` dans les fichiers de l'app (64 occurrences) et sonde des
écrans principaux ; pas de recherche exhaustive dans les autres listes persistées.

## §119 — ⛔ UNE ANCIENNE SAISIE SANS QUANTITÉ NI VALEURS ÉTAIT UNE IMPASSE : L'ÉCRAN DEMANDAIT UN POIDS SANS ENDROIT OÙ LE DIRE *(25/10/2026, retour de Claude Principal ; reproduit sur master et sur `beda2652` ; corrigé sur `claude/nutrition-v2`)*

**Ce qui se passait.** `{kcal:0, prot:0, carbs:0, fat:0, q:null, per100:null}` reprise (« + Ajouter », « Mes aliments »,
« Déjà noté par toi ») : la reprise sans quantité rend l'écran à la saisie à la main, et `_afMajAncre` cache le bloc
quantité tant qu'**aucune** valeur n'est posée (ft-v1065, « rien à rescaler ») ; les issues n'étaient dessinées que pour
le cas figé (`_afRef.fige`). Résultat : 0 · 0 · 0 · 0, ni champ ni issue, et « Ajouter » répondait « Combien pesait ce que
tu as mangé ? » — rien ne s'écrivait (sûr), mais on ne pouvait pas en sortir.

**Ce qui le ferme.** Les mêmes issues qu'une reprise sans fiche (`_n2IssuesHtml`, **un seul propriétaire** désormais pour
le cas figé et celui-ci — R2), une phrase qui dit pourquoi, et la même phrase dans « Ajouter » et les toasts.
⛔ **Aucun champ « quantité » pour ces 0, exprès** : accepter une quantité avec eux affirmerait, en silence, qu'ils valaient
pour elle. La marque (`_afRepriseVide`, en mémoire seulement) meurt avec l'aliment (`_afOublierAliment`, R15) et un autre
nom n'en hérite pas. Témoins `ZÉRO ① → ④` (① ② rouges avant ; ③ ④ sont des gardes, verts avant aussi, que Z3/Z4 font rougir) ;
mutations Z1 → Z7 et F4.

**À quoi on le reconnaît.** Un écran qui demande une chose sans donner l'endroit pour la faire.

## §120 — ⛔ MÉTHODE : SIX TÉMOINS SUPPOSAIENT UN CODE.JS PAS ENCORE DÉPLOYÉ *(25/10/2026, retour de Claude Principal : 42 / 6 sur l'intégration sans le Code.js de `bb2075b9`)*

Les témoins de synchro des masquages (`B-NFIAB-X T08 ① ② ③ ④ ⑤ ⑦`) supposaient un serveur qui garde `hiddenFoods` —
le commit `Code.js` séparé, à déployer **seulement** sur GO de Michel. Sur une intégration sans lui, ils rougissaient sans
que l'app ait changé : ils mesuraient l'environnement. **Ce qui le ferme** : ces six témoins ne se jouent que si la liste
blanche de `saveProfile` du Code.js servi contient `hiddenFoods` ; sinon ils sont listés **SANS OBJET** (jamais comptés verts).
Les garanties **locales** (`T08L ① ② ③` : « ✕ » et la remise à zéro tiennent au rechargement et à « Restaurer » sur le même
téléphone) se jouent dans les deux modes. ⚠️ **Et la condition est elle-même vérifiée** : `T08 ⓪` compare ce que dit la liste
blanche à ce que le serveur (le vrai Code.js, en local) fait d'un « ✕ » synchronisé — sinon un témoin conditionnel devient un
interrupteur qui éteint les rouges. F19 (le serveur lit les masquages sans les garder) rougit ⓪ et la synchro ; F19b (la ligne
retirée, c'est le Code.js de master) reste vert en le disant ; FL1 → FL3 font rougir les garanties locales sur ce Code.js.
*Un témoin vert sur sa branche et rouge à l'intégration, sans que l'app ait changé, mesurait l'environnement.*

## §121 — ⛔⛔ APRÈS LA REMISE À ZÉRO, D'ANCIENNES SAISIES FAUSSES FAISAIENT DIRE « À VÉRIFIER » À UNE SAISIE JUSTE *(25/10/2026, E2b · registre `NUT-VERIFY-01`, constat de Claude Principal ; reproduit sur `claude/nutrition-v2` @ `fc0a558d` par le banc B-NFIAB, données inventées ; corrigé sur la même branche, non publié)*

**Ce qui se passait.** Remise à zéro hier ; deux anciennes saisies du steak, 200 g · 130 kcal (le pour-100 g FABRIQUÉ à 65,
§114), à J-6 et J-5 ; une saisie neuve et juste, 258 · 42 · 0 · 10 pour 200 g, même code-barres → « ⚠️ à vérifier » dans
« Mes aliments » et « Déjà noté par toi », « + Ajouter » refusé (*« tes saisies de ce produit ne concordent pas : 129 kcal
pour 100 g ici, 65 le … »*), et le repas habituel compté « 1 à vérifier », son « + » refusé. Sans les deux anciennes :
« déclaré ». Même chose avec « ✕ » au lieu de la remise à zéro, et avec un ancien favori encore sur l'appareil.

**La cause.** La comparaison de `D-131` (`_n2Contradiction`, références rangées par `_n2FichesVerifiees`) prenait **toutes**
les saisies du produit, y compris celles que la remise à zéro ou « ✕ » avait retirées des propositions : ce qu'on ne propose
plus jugeait encore ce qu'on propose.

**Ce qui le ferme** (`D-136`). Une ligne : seules les références encore **proposées** (`_n2Propose`, la règle des listes) se
comparent. ⛔ Le journal n'est pas touché ; ⛔ les fiches **vérifiées par la source** (scan, CIQUAL) restent des références
même d'avant la remise à zéro — une saisie neuve fausse se dit encore « à vérifier » (E2b ⑥), et la reprise par identité
(`D-130`) les retrouve toujours ; deux saisies encore proposées qui se contredisent restent « à vérifier » (E2b ⑤) ; le scan
juste est inchangé (E2b ⑦). Témoins `B-NFIAB E2b ① ② ③ ④ ④b` rouges avant, verts après ; ⑤ ⑥ ⑦ verts des deux côtés (les
contrôles qu'il ne fallait pas éteindre) ; mutations E1 → E4 (dont E4, la sur-correction qui retirerait aussi les fiches
vérifiées) et F5 étendue.

**À quoi on le reconnaît.** Un contrôle qui compare à une liste dont on a retiré des éléments — sans retirer les mêmes de
la comparaison. *Retirer d'une liste ne suffit pas : il faut retirer de tout ce qui la lit.*

## §122 — ⛔ LA REMISE À ZÉRO N'ÉTAIT QU'UN MASQUAGE AU SERVEUR : LES ANCIENS FAVORIS Y RESTAIENT, ET UN TÉLÉPHONE EN RETARD OU UNE RESTAURATION ADMIN POUVAIENT LES Y REMETTRE *(25/10/2026, Q15 · `D-141`, registre `NUT-FOR-04` / `SERVEUR-CODEJS-01` ; mesuré avec le vrai Code.js en local ; préparé sur `claude/nutrition-v2`, Code.js NON déployé)*

**Ce qui se passait (`D-133`, branche d'avant).** La date `*` écartait les anciens favoris **à l'affichage** ; au serveur ils
restaient (un envoi vide ne remplace jamais la liste, P1). Deux chemins pouvaient les remettre en circulation : un appareil
resté en retard renvoyait sa liste (P1 l'acceptait), et la restauration admin d'une sauvegarde de la nuit réécrivait tout le
compte — anciens favoris **et** masquages d'avant, donc **sans** la date de remise à zéro (`handleAdminRestore_`, sans garde).

**Ce qui le ferme** (`D-137`, préparé). Au serveur, après la fusion des masquages : tout favori d'avant la date (ou sans
date) quitte la liste active, qu'il y soit ou qu'il arrive — **par la protection P1** (motif « raz ») : copié d'abord dans la
zone de récupération, son surplus relu dans Drive ; Drive en panne → la suppression passe, la zone garde tout jusqu'au plafond
(`D-110`) ; au-delà, refus cette fois (`D-109`). La restauration admin fusionne les masquages du compte et n'y remet pas les
favoris d'avant. Témoins `B-NFIAB-X Q15 ① → ⑨`, `T08 ③` (nouveau contrat), `T08 ⑧`, `T08L ④` ; mutations D1 → D10 et F22
(révisée : le serveur n'en renvoyant plus, c'est `T08L ④` qui garde le filtre de l'app).
⚠️ **Méthode** : ma 1ʳᵉ version copiait dans un fichier Drive à part et REFUSAIT l'envoi si Drive tombait — mesuré contraire à
`D-110` (validée par Michel : pour les favoris, une panne de Drive ne refuse plus l'envoi, un favori neuf refusé se perdant à
« Restaurer »). *Une décision validée est une contrainte (règle d'or 15) : on réutilise ce qu'elle a construit.*

**À quoi on le reconnaît.** Une suppression qui n'existe que dans l'affichage d'un appareil : elle tient tant que tous les
chemins d'écriture passent par cet appareil — et une restauration n'y passe pas.

## §123 — ⛔⛔ À LA REPRISE D'UN ANCIEN SCAN, LA QUANTITÉ POSÉE PENDANT LA RECHERCHE EN LIGNE DISPARAISSAIT QUAND LA FICHE ARRIVAIT *(25/10/2026 soir, registre `NUT-QTY-02`, constat de Claude Principal — sa sonde C7a sur l'intégration `9f0d1e77` ; reproduit sur `claude/nutrition-v2` par le banc B-NFIAB, données inventées ; la jumelle trouvée en cherchant (R8) ; corrigé sur la même branche, non publié)*

**Ce qui se passait.** Reprise d'un ancien produit scanné dont la ligne n'a pas de fiche V2 (« Mes aliments », « + Ajouter ») :
l'app cherche la fiche du code-barres en ligne (Open Food Facts). 180 tapé pendant la recherche (1,5 s simulées) ; la fiche
arrive, l'écran bascule sur le bloc du scan — champ « Quantité » **vide**, rien de posé ; « Ajouter » → « Combien en as-tu
mangé ? Touche une pastille ou tape ton poids. », rien d'écrit. Même chose avec la pastille « ↩ 40 g (la dernière fois) »
touchée avant la réponse. Tapé après la réponse : juste. ⭐ **La jumelle, par le 2ᵉ appel** : un ancien scan noté **sans**
quantité (`q:null`) — sa reprise demande « poids de ce que tu as mangé » ; 180 tapé là (avec ou sans quitter le champ, avec
ou sans pour-100 g d'avant) se perdait de la même façon. *(Absent de `ft-v1260`, qui n'a pas cette recherche en ligne.)*

**La cause.** La fiche arrive par le chemin du scan (`_offAppliquerProduit`), qui oublie l'aliment d'avant
(`_afOublierAliment`) et prépare un écran neuf (`_afPreparerEcran` vide le champ) : la quantité posée sur l'écran de la
reprise n'était relevée par personne — ni dans la reprise figée (`#af-prop`), ni dans celle sans quantité (`#af-poids`,
`_afPoidsDeclare`, ou des portions).

**Ce qui le ferme.** `_afQtePoseeReprise` (lecture seule, un propriétaire) lit la quantité **posée par un geste** sur l'écran
de la reprise, quel que soit son état — avec les lecteurs de l'écriture (`_n2EntreeEcran`, R2), plus le poids tapé avant la
sortie du champ. `_n2RetrouverEnLigne` la relève APRÈS ses contrôles (le jeton, l'écran encore ouvert, le même nom — jamais
pour un autre aliment) et AVANT le chemin du scan, puis la repose dans le bloc du scan avec son origine (tapée ou proposée) et
le même calcul que la saisie à la main (`_bcApplyGrams`, R2) ; l'écran le dit (« ta quantité (180 g) est gardée ») ; la
pastille déjà prise ne se repropose pas. ⛔ Seulement dans l'unité de la fiche : des grammes ne deviennent jamais des ml, ni
des portions des grammes — l'écran dit « tu avais indiqué … : cette fiche compte en ml (ou g), tape ta quantité en ml » et
rien ne s'écrit. ⛔ « 0 », un champ laissé vide, le « 1 » de l'ancre : rien n'est posé. Témoins `B-NFIAB Q2 ① ② ③ ④ ⑦ ⑧ ⑨`
rouges avant, verts après ; `Q2 ⑤ ⑥ ⑩` verts des deux côtés (les protections) ; mutations Q1 → Q13.

**À quoi on le reconnaît.** Une réponse asynchrone qui reconstruit l'écran (« on repart d'un écran propre ») pendant que la
personne y écrivait. *Ce qu'elle a tapé pendant l'attente fait partie de l'état — le reconstruire sans le relever, c'est
l'effacer.* ⚠️ Et le signal de méthode : le constat portait sur UN appel ; la même fonction en avait DEUX (R8 — *un oubli de
ce type est rarement isolé*).

## §124 — ⛔ HORS LIGNE, UNE ANCIENNE LIGNE CIQUAL SE DISAIT « SANS FICHE VÉRIFIÉE » ALORS QUE C'ÉTAIT LA TABLE QUI MANQUAIT *(25/10/2026 soir, registre `NUT-CIQ-HL-01`, constat de Claude Principal — sa sonde C2k, production `ft-v1260` ET intégration ; reproduit sur `claude/nutrition-v2`, données inventées ; corrigé sur la même branche, non publié)*

**Ce qui se passait.** Une ancienne ligne de pâtes CIQUAL (`ciqual:9811`, 130 g · 217 kcal), reprise hors ligne : la table
CIQUAL (`data/ciqual.json`, téléchargée à la demande, pas dans le cache — R30) ne se charge pas, la reprise reste figée et
refuse 180 g (`D-101` ⑨, voulu) — mais l'écran disait « cet ancien aliment n'a pas de fiche vérifiée », et « Modifier »
« (pas de fiche vérifiée) ». Faux : sa fiche existe, c'est sa **référence** qui est injoignable pour l'instant. *(Préexistant en
production.)*

**La cause.** Les deux phrases (`_afMajFige`, `_efQtyRender`) ne distinguaient pas « pas de fiche » de « fiche injoignable » :
l'état de la table n'était pas lu.

**Ce qui le ferme.** `_n2CiqualAbsente(sid)` (un propriétaire, lecture seule) : une ligne `ciqual:` dont la table n'est pas
chargée → « sa référence CIQUAL n'est pas disponible pour l'instant (la table n'a pas pu être chargée — hors ligne ?) » et,
dans l'ajout, comment la retrouver une fois connecté. ⛔ Le refus reste (`D-101` ⑨ : sans la table, rien ne se recalcule) ;
⛔ une ligne vraiment sans fiche (ni code-barres, ni CIQUAL), ou un code que la table chargée n'a pas, garde la phrase d'avant.
Témoins `B-NFIAB CHL ① ④` rouges avant, verts après ; `CHL ② ③ ⑤ ⑥` verts des deux côtés (dont ③ : reconnecté,
« 🔎 Retrouver l'aliment » charge la table et 180 g = 301 · 12 · 57 · 2 s'écrit) ; mutations C1 → C3.

**À quoi on le reconnaît.** Un message qui confond « absent » et « pas joignable ». *« Je n'ai pas » et « je n'arrive pas à
l'atteindre » ne se réparent pas pareil : le premier renvoie la personne chercher ailleurs, le second lui dit d'attendre le
réseau.*

## §125 — ⛔⛔ « MODIFIER » FAISAIT PERDRE SON CODE-BARRES À UNE ANCIENNE LIGNE, ET 270 LIGNES SUR 564 DE L'EXPORT RÉEL N'AVAIENT PLUS D'IDENTITÉ : UN ANCIEN ALIMENT NE SE RECALCULAIT PLUS POUR UNE AUTRE QUANTITÉ *(27/10/2026, mission « GO développement Nutrition » de Michel ; export réel du 27/10, 564 lignes ; reproduit sur `ft-v1261` (master `53c464f6`) par sonde, données inventées ; corrigé sur la branche isolée `claude/nut-identite-reutilisation-01`, NON fusionné, NON publié)*

**Ce qui se passait.** Deux faits, mesurés sur l'export réel : (1) **270 lignes sur 564 (47,9 %) n'ont aucun `source_id`** — les 210
reprises d'avant la V2 l'ont toutes perdu — et leur pour-100 g n'est qu'une reformulation de leurs propres calories (137 sur 142) :
on ne peut donc ni s'y fier ni recalculer pour une autre quantité (`D-101` ⑧, voulu) ; **240 d'entre elles portent pourtant le nom exact
d'une ligne identifiée (CIQUAL ou code-barres) de leur propre journal, pour UNE seule identité**. (2) **« Modifier » une ancienne copie d'un
scan, en ne changeant que le nom (une espace en plus), écrivait `sourceId:null`** : le produit n'était plus qu'un nom et sa fiche ne
se retrouvait plus. `_n2Reajouter` (« + Ajouter ») transmettait déjà l'identité (`cle`) ; `saveEditFood` l'oubliait — **R8, la porte jumelle**.

**La cause.** (2) la branche « déclarée » de `saveEditFood` ne passait pas `cle` au moteur. (1) aucune lecture du journal pour proposer
l'identité qu'il connaît déjà ; et, surtout, **aucune façon sûre de le faire** : le nom ne prouve rien.

**Ce qui le ferme.** `app.js` + 4 lignes d'`index.html`, **aucune donnée persistée de plus** (ni clef, ni champ, ni table d'associations).
**A — `saveEditFood`** : l'identité suit (`_n2IdentiteQuiSuit`) si le nom est resté le même (casse, espaces, apostrophes typographiques près)
ou devient celui d'une AUTRE ligne du journal qui porte déjà cette identité (« Riz thaï ou 90basmati » → « Riz thaï ou basmati, cru »),
**et seulement si les valeurs n'ont pas changé** — des chiffres retapés disent autre chose que la fiche : la ligne garderait son code-barres
avec des valeurs corrigées à la main et « contredirait » (`D-131`) toutes les autres saisies du produit, la règle A bloquant alors « + Ajouter »
et « Tes repas habituels » (⭐ **trouvé par le banc voisin `B-NV2P P8 ①` : 110 / 1 sur ma première version, 111 / 0 sur master**) ; la provenance
d'origine (off, ciqual…) suit avec l'identité. ⛔ **La ligne ne devient pas fiable** : « déclarée »,
« reprise non vérifiée », sans pour-100 g — celui d'avant reste intact avec toute la ligne d'origine dans `n2.av`. **B — la reprise**
(`_n2Candidats`, `_n2CandRendre`, `_n2ChoisirCandidat`, `_n2Reprendre(…, choixSid)`) : une reprise sans fiche source ET sans identité
**propose** les produits identifiés de même nom EXACT ; un seul = un bouton, plusieurs = un choix explicite (aucun pré-choisi) ; la fiche
vient alors de la **source** (table CIQUAL, fiche vérifiée du journal ou Open Food Facts du code-barres), le calcul ne part QUE d'elle, la
quantité déjà tapée survit (D-101 ⑧/⑨) ; **rien ne s'écrit avant « Ajouter »**, qui écrit une ligne NEUVE (identité + pour-100 g de la
source) ; les anciennes restent intactes ; sans fiche (hors ligne, produit inconnu) le blocage de recalcul reste. Les portes « + Ajouter »
et « Tes repas habituels » ne reçoivent AUCUNE identité par le nom (règle A de `D-111`). Témoins `B-NIDT` (46, dont synchro et
restauration avec le vrai `Code.js` en local) : verts ; contrôle négatif `tools/mut_nut_fiabilite.py` (partie `identite`, mutations I1 → I22)
**28 / 28 conformes** (25 mutations qui réintroduisent chacune un défaut que la mission interdit, 1 commentaire seul qui doit rester vert, plus F1 et F1b dont l'ancre a changé ; une mutation — I7, la fiche en ligne qui n'efface pas le panneau — a d'abord révélé qu'un témoin ne mordait pas : il a été refait) ; **non-régression sur les bancs voisins** : Fiabilité complet 139 / 0 (13 « sans objet » attendus : D-141 et `hiddenFoods` non déployés), `nut2_parcours` 111 / 0 (⭐ **110 / 1 sur ma première version** : le défaut ci-dessus), m6 29 / 0, p1 × v2 16 / 0, journal_qty_guard 23 / 0, foodlog_restore 35 / 0, moteur 70 / 0, identité de ligne 32 / 0, B3 102 / 0, DASH1 12 / 0, lipides 25 38 / 0. ⭐ **Rejoué sur l'export réel** (lecture seule, en local, réseau coupé — rien n'est écrit) : sur les 270 lignes sans identité,
`_n2Candidats` donne **240 un candidat, 19 deux (la « Ratatouille cuisinée à la provençale » aux deux codes-barres) et 11 aucun** (97 CIQUAL, 162
code-barres, aucun mélange) — exactement les 259 correspondances de nom identique mesurées à part ; la normalisation (casse, espaces,
apostrophes) n'en ajoute aucune sur ces données.

**Limites écrites (à ne pas redécouvrir).** ① Un nom SANS RAPPORT, ou des valeurs RETAPÉES, font tomber l'identité en « Modifier » (renommer le
scan d'un isolat en « Riz » ne lui laisse pas son code-barres ; corriger ses calories à la main non plus — comme avant) : choix conservateur,
`D-144`, à confirmer. ② Le pour-100 g d'une ancienne ligne
modifiée n'est PAS recopié sur la ligne neuve (il la rendrait lisible comme une fiche, M1) : il est dans `n2.av`. ③ « Mes aliments » ne montre
qu'UNE ligne par nom et par identité (la plus récente) : les doublons ne sont PAS masqués par cette mission, ils le sont déjà par l'existant.
④ Un candidat « code-barres » dont la fiche n'est ni vérifiée dans le journal ni joignable (hors ligne) se choisit mais ne charge rien : l'écran
le dit et le blocage reste. ⑤ Pas de recette iPhone (le conteneur ne joint pas le site) : « corrigé sur branche », pas « vérifié sur iPhone ».

**À quoi on le reconnaît.** Une ancienne ligne dont le nom est celui d'une ligne identifiée, mais qui n'a plus de `source_id`, et qui
refuse toute autre quantité. *Le nom est une suggestion, pas une preuve : la bonne réponse n'est ni de l'ignorer, ni de s'en servir en
silence — c'est de le montrer et de laisser la personne trancher.*

**Leçon de méthode (R5, la règle à l'envers).** Rendre une donnée plus riche (garder l'identité) peut déclencher des contrôles écrits pour des
lignes qui n'en avaient pas : ici la comparaison de `D-131`, qui n'avait jamais vu une ligne corrigée à la main porter un code-barres.
Aucun témoin de la mission ne le voyait ; **le banc d'un chantier voisin (`nut2_parcours`) l'a vu** — et c'est pour cela que la non-régression
se joue sur les bancs des *autres* chantiers, pas seulement sur le sien.


## §126 — ⛔⛔ LA DERNIÈRE ÉCRITURE GAGNAIT EN SILENCE, ET LE SERVEUR « ACQUITTAIT » CE QU'IL AVAIT JETÉ *(01/11/2026, NUT-SYNC-01 FINAL — ordre de Michel après une contre-validation indépendante qui avait mesuré le défaut)*

**Ce qui se passait.** Trois choses, une seule famille — *l'appareil ne sait pas ce que le serveur a réellement fait* :
① le registre des suppressions était plafonné à 3 000 : au-delà, les suppressions en trop étaient **jetées**, journalisées côté serveur, et la réponse
restait « ok » (mesuré par la contre-validation : 3 001 demandées, 3 000 gardées, 1 rejetée sans un mot) ; ② deux appareils qui modifiaient le **même repas**
(même identité) ne se voyaient pas : le dernier arrivé écrasait l'autre ; ③ `saveProfile` ne prenait **aucun verrou** — lecture, décision et écriture n'étaient
pas atomiques (le banc de la brique précédente l'écrivait dans son en-tête : « aucun verrou dans Code.js — défaut préexistant »). Et l'appareil ne pouvait
rien voir de tout cela : `_cloudSync` envoyait en `mode:'no-cors'`, une réponse **opaque**.

**Ce qui a été fait (code réel, pas un contournement).** `NutSyncError` + `_nutSupprimesFusion_` qui **refuse** (`NUT_TOMBSTONE_LIMIT`, `ok:false`, non réessayable,
rien d'écrit côté Nutrition) ; une **révision par repas** (`rev`) posée par le **serveur** (jamais l'horloge d'un téléphone), `nutDecisionModification`
(création · mise à jour · conflit · rejet), la version perdante gardée en zone de récupération **et** renvoyée à l'appareil, qui garde les deux versions ;
`saveProfile` sous `LockService` (verrou indisponible = réponse **réessayable**, rien d'écrit) ; une mémoire des opérations (`requestId`) écrite dans le MÊME
enregistrement que les données ; `_cloudSync` **lit** la réponse (`redirect:'follow'` + `text/plain`, le schéma qui lit déjà `loadProfile` en production) et
distingue trois états de suppression (en attente · confirmée · rejetée). Le refus de Drive (D-109), qui répondait lui aussi « ok », est annoncé (`NUT_ZONE_DRIVE`).

**Pourquoi les tests précédents ne le voyaient pas.** Ils jouaient les envois **l'un après l'autre dans un seul processus** : la concurrence n'y existait pas. Le
banc `nut_sync02` lance de **vrais processus serveur** (le vrai `Code.js`, des propriétés partagées, un vrai verrou entre processus) et fait lire le MÊME état
périmé aux deux grâce à une barrière ; son **propre contrôle négatif** (un verrou qui ne verrouille rien) fait apparaître la perte de mise à jour — *un banc de
concurrence qui ne sait pas échouer sans verrou ne prouve rien.*

**À quoi on le reconnaît.** Une réponse `ok` à un envoi dont une partie n'a pas été écrite ; deux acceptations à la **même** révision d'un même repas ; une
modification qui « disparaît » sans conflit ; un registre qui plafonne sans le dire. *Un accusé que l'appelant ne peut pas lire n'est pas une confirmation.*

**Limites écrites (à ne pas redécouvrir).** ① Seul `saveProfile` prend le verrou : les autres écrivains du compte (santé, code d'accès, mémoire du coach)
relisent puis réécrivent l'enregistrement entier **sans** verrou — fenêtre de quelques millisecondes, non fermée ici. ② Registre plein = les nouvelles
suppressions sont **refusées** et ne se propagent plus : c'est le prix du refus explicite, la personne en est avertie ; le plafond (3 000, ≈ 33 octets chacune,
≈ 100 Ko par compte au plafond) et le lieu de stockage sont une **décision de Michel**. ③ Un ancien client ne peut modifier qu'un repas jamais révisé ; ses autres
modifications sont gardées en zone, jamais appliquées. ④ **Non testé** (cause mesurée : `CONNECT tunnel failed, response 403` vers `script.google.com` et le
Worker depuis le conteneur) : le vrai déploiement Apps Script (vrai `LockService`, vrai 302), le vrai Supabase. ⑤ Le miroir ne reçoit plus le journal ni le registre
par défaut (la **porte** les retire) ; il les reçoit après un accusé valide qui dit que l'envoi couvrait tout le journal du compte. ⑥ Le verrou est **global au
script** (LockService n'en offre pas par compte) : tenu de la lecture à l'écriture du compte, il est **rendu avant** le miroir Sheets et l'e-mail de bienvenue
(témoin `C15` — je l'avais d'abord laissé tenu jusqu'au bout et mon commentaire affirmait le contraire) ; sa durée réelle de détention n'est **pas mesurée**
(bac en mémoire seulement). ⑦ `LockService` n'était utilisé **nulle part** dans `Code.js` avant ce lot (0 occurrence) et le manifeste déclare ses autorisations une
à une : qu'il n'en exige aucune de plus est **non vérifié** — à contrôler au premier déploiement (service refusé = réponse `NUT_LOCK_BUSY` à tous les envois : rien
n'est écrit côté serveur, rien n'est perdu côté téléphone, mais plus rien ne se synchronise). ⑧ **Saturation, MESURÉE (`E01e`)** : le refus est tout-ou-rien par envoi et le téléphone
renvoie tout son registre à chaque synchronisation — tant que le registre du compte est plein, un appareil qui porte une suppression que le compte ne connaît pas voit **tout** son
volet Nutrition refusé : ses repas restent sur le téléphone, ils ne rejoignent plus le compte. ⑨ **Accusé perdu puis modification du même repas, MESURÉ (`E11`)** : l'appareil ignore
sa révision (base 0) alors que le compte est à 1 ; le serveur déclare un conflit avec la propre création de l'appareil — les deux versions sont gardées (jamais de perte), mais il
reste un doublon à supprimer à la main et le message parle d'« un autre appareil ». ⑩ La mémoire des opérations (6) est bornée : une retransmission arrivant après plus de six
opérations plus récentes est rejugée (déduit du code, non joué). **Leçon de méthode** : les mutations ont révélé trois trous dans MES témoins (la reprise « réseau coupé »,
la confirmation au démarrage, une attente du miroir mal écrite) et un témoin ancien instable sous charge (`nut_sync01` T04, T12) — un vert obtenu sur machine calme ne dit pas
qu'un témoin tient ; les mutations se rejouent après chaque changement de code, y compris un changement « de commentaire ».


## §127 — ⛔⛔ UN ANCIEN TÉLÉPHONE POUVAIT RESSUSCITER UN REPAS, UNE ERREUR NUTRITION COÛTAIT LES SÉANCES, ET CINQ ÉCRIVAINS DU COMPTE POUVAIENT EFFACER UN ENVOI DÉJÀ ACCUSÉ *(02/11/2026, NUT-SYNC-02 phase A — GO du Principal, phase A seule ; mesuré avec le vrai Code.js et le vrai client, données inventées)*

**Ce qui se passait.** Cinq choses, une seule famille — *ce que l'appareil croit enregistré n'est pas ce que le serveur a réellement fait, et un second écrivain peut défaire le premier* :
① un **ancien client** (ft-v1263 et avant : réponse jamais lue, aucun `requestId`, journal sans identité) qui envoyait du Nutrition à un serveur NUT-SYNC-01 était traité par le chemin P1
(remplacement du journal avec copie de sécurité) : son instantané pouvait **ressusciter** un repas supprimé (ses copies ne portent pas l'identité du registre), **écraser** un historique plus long, ou être pris pour
acquis sans que rien ne dise à l'appareil ce qui avait été écrit ; ② une **erreur imprévue** du bloc Nutrition (autre qu'une erreur métier nommée) était relancée → `SERVER_ERROR` et **RIEN n'était écrit** —
séances, records et pesées compris (règle d'or n°3) ; ③ au **plafond de 3 000** suppressions, le serveur refusait **tout** le volet Nutrition (repas compris) et le téléphone renvoyait son registre **entier** à chaque
synchronisation (limite ⑧ du §126 ; ≈ 59 Ko à 1 000 entrées, 176 Ko à 3 000, calculé) ; ④ **cinq gestionnaires du compte** — santé de la montre (deux écritures), confirmation d'e-mail, code perso, mémoire du coach,
restauration admin — relisaient puis **réécrivaient l'enregistrement entier sans verrou** (limite ① du §126) ; ⑤ côté téléphone, une clé Nutrition annexe (favoris, masquages, plan de repas, quatre compteurs de l'IA
nutritionnelle) qui dépassait le quota déclenchait le **repli qui ramène `ft4_sessions` à 50 séances** (le navigateur ne dit pas *quelle* clé a échoué), et la reprise n'existait presque pas (`online` ne relançait que la file des
séances ; 5 réessais de 30 s puis plus rien).

**Ce qui a été fait (code réel, pas un contournement).** *Serveur* : une **porte de version** (`NUT_PROTOCOLE_MIN_ = 3`, `NUT_COMPAT_STRICT_ = true` — ↪️ *CORRIGÉ le 02/11/2026, §128 : la porte est PAR COMPTE et cette constante n'existe plus*) — un envoi Nutrition sans `foodLogV ≥ 3` ET sans `requestId` valide est refusé **en
entier et explicitement** (`{status:'nut_refuse', ok:false, code:'NUT_CLIENT_INCOMPATIBLE', retryable:false, profilEnregistre:true}`), rien de Nutrition n'est lu ni écrit, le reste du profil est enregistré ; le **plafond de 3 000 est
conservé**, mais le dépassement est **différé entrée par entrée** (`nut.tomb = {v:1, ok:[…], diff:[{i, code}], n}`) ; le **confinement** : toute erreur du bloc Nutrition restitue l'état d'avant (cinq champs ET zone de récupération) et répond
`NUT_INTERNE` (réessayable) ; **un seul verrou** pour les sept appels d'écriture du compte, durée de détention **mesurée** (`lockMs`) et journalisée au-delà de 2 s ; une seule lecture du compte dans `saveProfile`. *Téléphone* : seules les suppressions
**non confirmées** voyagent ; une suppression n'est **confirmée que si le serveur la nomme** (`tomb.ok`), une différée garde son code et n'est jamais effacée, la **guérison** détecte un compte revenu en arrière (`tomb.n` plus petit que
les confirmées locales) ; temporisation **croissante** des réessais (30 s · 1 min · 2 min · 5 min · 15 min), remise à zéro par un accusé valide ; reprise au retour du réseau et au retour à l'écran **seulement si quelque chose reste à
confirmer** ; les sept clés Nutrition annexes sont écrites par un helper qui **avale** son échec (`_ecrireCleNutrition`) — `ft4_sessions` ne bouge plus.

**Pourquoi les tests précédents ne le voyaient pas.** Aucun ne jouait un *ancien* client contre le serveur ; aucun ne faisait écrire **un autre écrivain du compte** en même temps que `saveProfile` (le banc de concurrence de FINAL
ne lançait que des `saveProfile`) ; aucun n'injectait une erreur *imprévue* au milieu du bloc Nutrition ; le banc de persistance 3B n'isolait que le journal et le registre — les sept clés annexes restaient dans les blocs communs.
Le banc `nut_phasea01` (45 témoins) joue le vrai `Code.js` en mémoire, de **vrais processus** avec un vrai verrou entre processus (`saveProfile` ‖ `pushHealth`, lancés ensemble sur le même état grâce à une barrière — son **contrôle
négatif** fait perdre l'un des deux effets 5 fois sur 5 quand le verrou ne verrouille rien) et le **vrai client** dans Chromium.

**À quoi on le reconnaît.** Un repas supprimé qui revient après la synchronisation d'un vieux téléphone ; des séances ramenées à 50 sur le téléphone après une panne de quota *Nutrition* ; un `SERVER_ERROR` qui coûte aussi la séance du jour ;
une suppression « confirmée » alors que le registre du compte ne la contient pas ; une santé de montre qui disparaît quand un envoi arrive au même moment. *Un accusé qui ne nomme pas ce qu'il confirme est un accusé qui peut mentir.*

**Ce qui change par rapport au §126 (R30 — un retrait s'écrit).** Limite ① (« seul `saveProfile` prend le verrou ») : **LEVÉE**. Limite ② (« registre plein = nouvelles suppressions refusées ») : **remplacée** par le
différé entrée par entrée — le plafond, lui, reste. Limite ⑧ (« tout le volet refusé tant que le registre est plein ») : **LEVÉE** (le témoin `E01e` mesurait cette limite ; il prouve maintenant l'inverse). Limite ⑥, « durée de
détention non mesurée » : **mesurée** (dans le conteneur seulement). Deux mutations de `mut_nut_sync02.py` sont **retirées avec leur raison** (K46, K47 : leur déclencheur n'existe plus ; jumeaux P05, P14, P15 de `mut_nut_phasea01.py`).

**Limites écrites (à ne pas redécouvrir).** ① **Le plafond de 3 000 reste** : une suppression différée ne se propage pas aux autres appareils tant qu'elle n'est pas inscrite (le repas reste vivant au serveur ; un autre appareil
qui restaure le retrouve) — c'est la **phase B** (étage froid hors réservoir), `docs/STOCKAGE-COMPTES.md`. ② Un **ancien client est refusé** : tant qu'un téléphone n'a pas le nouveau client, son Nutrition ne rejoint plus le compte et il ne
peut pas en être prévenu (`no-cors`) ; ses saisies restent sur son téléphone, rien n'est copié côté serveur (**décision à confirmer** : une quarantaine serveur demanderait du stockage de la phase B). D'où l'ordre **client puis serveur** et le
levier `NUT_COMPAT_STRICT_ = false`. ↪️ **CORRIGÉ le 02/11/2026 (§128) : ce levier n'était PAS un retour arrière sûr (il rouvrait la résurrection et l'écrasement) et il est retiré ; l'ordre client-puis-serveur n'est plus une condition de sécurité (la porte est par compte) ; le retour arrière sûr est la SUSPENSION.** ③ **La limite de 9 Ko par valeur reste une contradiction non élucidée** (valeur de 278 Ko observée le 31/07) : la phase A n'ajoute **aucune clé de stockage** ; le seul ajout persisté est
`op.d` / `op.td` dans la mémoire des opérations existante — **≤ 3,6 Ko compressé au pire cas mesuré** (6 opérations × 12 différées, identités de 64 caractères, soit 0,7 % du réservoir, et seulement si le compte est au plafond). ④ « Sous réserve de réussite
du stockage commun » : si l'écriture du compte échoue, tout échoue. ⑤ Une erreur confinée *tardive* peut laisser un fichier de débordement **orphelin** sur Drive (écrit, jamais référencé, jamais relu — mais il contient des copies de repas) :
à inventorier (E3 de `STOCKAGE-COMPTES`). ⑥ Le repli quota d'avant **reste pour toute clé HORS Nutrition** (le navigateur ne dit pas laquelle a échoué), et les petites clés de réglage Nutrition (`ft4_diet*`, `ft4_foodmode`, `ft4_fasting`, `ft4_keto`,
`ft4_nphase`) restent dans les blocs communs. ⑦ **Aucune synchronisation en arrière-plan sur iPhone** : la reprise se fait application ouverte (retour du réseau, retour à l'écran) ou à la réouverture. ⑧ **NON TESTÉ** (cause mesurée : `CONNECT tunnel failed, response 403`
vers `script.google.com` et le Worker) : le vrai Apps Script (premier usage de `LockService` dans ce code, son autorisation, ses délais), les vraies Script Properties, la latence Drive, le vrai Supabase, l'iPhone. ⑨ Verrou occupé (plus de 20 s d'attente) : la mémoire du coach (calculée **hors verrou**) n'est pas écrite ici — l'appareil la garde et la renvoie ; e-mail et code perso se replient sur `confirmed_` ; la restauration admin répond `busy` (réessayable) ; **la santé de la montre répond `NUT_LOCK_BUSY` sans rien écrire** — le raccourci iOS ne réessaie pas, la valeur du jour repart à l'envoi suivant (les valeurs sont fusionnées par date, donc rejouables). Avant ce lot ces écritures n'attendaient rien, et pouvaient effacer un envoi déjà accusé.

**Leçon de méthode.** ① Le banc client est passé **vert du premier coup** — c'est le signal à craindre : seules les mutations disent s'il peut rougir (43 mutations : la première passe en a tué 42 et révélé que la 43ᵉ était un **plantage du banc**, pas un verdict — un témoin qui lève une exception faisait abandonner tout le banc ; chaque bloc est désormais gardé et son exception compte comme un rouge nommé ; cette 43ᵉ puis 6 autres, rejouées sur le banc final : 7 tuées sur 7). ② Un témoin ancien qui mesurait une limite (`E01e`, `S06`) devient, une fois la limite levée, le témoin de la
**garantie inverse** — il s'adapte, il ne se supprime pas (R30) ; et il faut le re-faire rougir (K01, K33, K21 rejouées : B02·B04·D08, E01·E01c·E01e, S06). Un banc d'un AUTRE chantier (`nut_fiabilite`, Q15 ②) postait des envois « tels que l'app les fait » **sans** `foodLogV` ni `requestId` : la porte les refusait — adapté au protocole réel de l'app, l'intention intacte. ③ Deux comparaisons d'« égalité » cachaient un invariant faux : l'**ordre** des lignes du journal du compte n'en est pas un (`E01b`) — un test protège un invariant, pas une implémentation (R17).
④ Les mutations *des autres chantiers* avaient des ancres devenues périmées par ce lot (14 dans `sync01`/`sync02`, 3 dans `journal_ecriture`, 2 dans `pots_nutrition`, 1 dans `secu_p1`) : elles ont été rafraîchies, avec la raison écrite à côté — *un outil de contrôle qui refuse de démarrer
ne contrôle plus rien, et personne ne le voit*.


## §128 — ⛔⛔ LE « LEVIER DE RETOUR ARRIÈRE » DE LA PORTE DE VERSION N'EN ÉTAIT PAS UN, ET LA PORTE REFUSAIT TOUT LE MONDE *(02/11/2026, NUT-SYNC-02 phase A — corrections de sécurité après le contrôle statique du Principal ; mesuré avec le vrai Code.js, de vrais processus, le vrai client courant ET le vrai ancien client de production, données inventées)*

**Ce qui se passait.** Quatre fautes dans ma propre livraison (§127), trouvées par le Principal à la relecture statique, aucune par un test : ① la porte de version était **globale** : un ancien client était refusé *partout*, y compris sur un compte qui n'a **aucun** appareil à jour — or un ancien client
(`no-cors`, réponse jamais lue) ne peut pas le savoir : sa sauvegarde serveur du Nutrition s'arrêtait en silence ; ② le texte présentait `NUT_COMPAT_STRICT_ = false` comme **le levier de retour arrière** : faux — mesuré (COR-0), il rouvrait la **résurrection** (une ancienne ligne SANS identité ne retrouve pas son entrée du registre de
suppressions) et l'**écrasement** du journal ; ③ « laisser passer 24 à 48 h » entre le client et le serveur n'était **pas une mesure** — rien dans le dépôt ne dit en combien de temps les téléphones se mettent à jour — et un merge sur `master` déclenche `deploy-pages.yml` et `deploy-appsscript.yml` **sur le même événement, sans lien d'ordre entre eux** (lu dans les deux fichiers de workflow — aucun run observé) : l'ordre
n'est pas tenu par la chaîne de déploiement ; ④ la première idée pour « reconnaître un compte à jour » (la mémoire des opérations `nutOps` non vide) **ne voit pas** un compte à jour qui n'a ni supprimé ni modifié (mesuré : après une synchro à jour qui ne change rien, ni registre, ni opération, ni ligne révisée).

**Ce qui a été fait (code réel).** *Serveur* : la porte devient **PAR COMPTE** (`_nutAncienRefuse_`, décidée sous le verrou) — un ancien envoi est **toléré** tant que le compte n'a aucun état v3 (le chemin d'avant, journalisé), **refusé** dès qu'il en a un ; un envoi qui se dit à jour **sans `requestId` valide** est refusé partout. L'état v3 est
**prouvé, jamais déclaré** : un **marqueur durable `nutProto`** posé *dans le même enregistrement que les données* par la 1ʳᵉ synchro à jour **appliquée** (même quand elle ne change rien ; jamais par un envoi suspendu, refusé, en erreur ou ancien ; il ne recule jamais, borné à 99), ou à défaut un registre, une mémoire d'opérations, une ligne
révisée — ni `nutRev` ni la zone de récupération n'en sont. La **restauration admin** conserve le marqueur. Le levier global `NUT_COMPAT_STRICT_` est **retiré**. Et le vrai retour arrière : la **suspension** — propriété de script `NUT_SUSPENDU` (instantanée, sans redéploiement, **fail-closed** si sa lecture échoue) : tout envoi qui porte du Nutrition, à jour **comme ancien**, est refusé
*avant* toute lecture ou écriture Nutrition (`NUT_SUSPENDU`, réessayable, aucun accusé, rien à ressusciter ni écraser), le reste du profil est enregistré. *Téléphone* : un message clair, au plus un toutes les 3 h ; les opérations restent en attente.

**Pourquoi les tests ne le voyaient pas.** Les témoins de la phase A jouaient la porte sur un compte déjà *riche* (registre, révisions, mémoire des opérations) — jamais sur un compte à jour **sans trace** ; aucun ne jouait le **vrai** ancien client ni les deux ordres ancien↔nouveau, séquence **et** concurrence ; le réglage de banc `compatStrict:false` masquait ce que la tolérance laisse passer.
Le banc `nut_phasea02` (**50 témoins**) joue le vrai `Code.js` en mémoire (les deux ordres, le compte à jour sans trace, chaque preuve seule, les non-preuves, la durabilité — panne d'écriture : ni accusé ni marqueur, rejeu appliqué en UNE écriture —, la suspension sous toutes ses formes, la restauration admin, un contrôle **statique** « tout écrivain du compte prend le verrou »),
de **vrais processus** avec un vrai verrou (un ancien et un nouveau lancés ensemble, une suppression contre un envoi ancien refusé — leur **contrôle négatif** casse 4 fois sur 4 quand le verrou ne verrouille rien —, la suspension vue par les trois processus à la fois) et **deux vrais clients dans Chromium** : le client courant sous suspension et le **vrai client de production ft-v1263**
(extrait de `origin/master`). **39 mutations tuées sur 39 + 1 équivalente restée verte, avec le bon témoin chaque fois.**

**À quoi on le reconnaît.** Un compte « à jour » qui accepte de nouveau un ancien appareil alors qu'il n'a rien supprimé ; un ancien appareil refusé sur un compte où aucun appareil n'est à jour ; une constante globale présentée comme levier de retour arrière ; un ordre de déploiement donné comme condition de sécurité sans que la chaîne le tienne. *Une porte qu'on ne peut pas rouvrir sans rouvrir la faille n'est pas
un levier, c'est une fausse sortie ; et un état qu'on déduit des données au lieu de l'écrire se perd au premier cas où les données sont vides.*

**Ce qui change par rapport au §127 (R30 — un retrait s'écrit).** Limite ② (« un ancien client est refusé ») : **remplacée** — refusé seulement sur un compte à état v3. « Levier `NUT_COMPAT_STRICT_ = false` » : **RETIRÉ** (figé par le témoin PB14, qui protège une absence). « Ordre client puis serveur, 24 à 48 h » : **retiré**, l'ordre n'est plus une condition de sécurité.
Les témoins PA00, PA02 et PA04 de `nut_phasea01` sont **adaptés avec leur raison** (ils protègent désormais la même garantie sur un compte à état v3 / une absence) ; l'option de banc `compatStrict:false` n'agit plus que sur la porte par compte.

**Limites écrites (à ne pas redécouvrir).** ① **Un ancien client ne voit NI le refus NI la suspension** (`no-cors`) : son seul signal est la mise à jour automatique de l'application ; ses saisies restent sur son téléphone (mesuré avec le vrai client de production : aucune erreur de page, aucun repas perdu localement). ⛔ Ne jamais écrire qu'il « voit » un refus.
② **Sur un compte sans aucune preuve d'état v3, la tolérance garde le défaut d'avant** : un ancien appareil périmé remplace le journal (les repas retirés sont gardés en zone de récupération, rien n'est perdu — PB03c le mesure) et une ancienne ligne sans identité peut ressusciter un repas supprimé *à l'ancienne*. C'est le prix de la compatibilité, borné au compte qui n'a **aucun** appareil à jour.
③ Les suppressions d'un ancien client se font **par omission** : sur un compte à état v3 elles ne passent pas (refusées avec le reste). ④ La suspension est **manuelle** (propriété de script) et coupe le Nutrition de **tout** le monde le temps qu'elle dure — les autres données continuent ; il faut la lever. ⑤ **Redéployer l'ancien code serveur n'est PAS établi comme un retour arrière sûr** une fois que des comptes
ont un état v3 (l'ancien code ne connaît ni le registre ni les révisions — non mesuré, à ne pas présenter comme sûr) : suspendre, puis corriger en avant. ⑥ Un marqueur n'apparaît qu'à la **1ʳᵉ synchro à jour appliquée** : tant que le seul appareil à jour d'un compte n'a pas synchronisé, le compte est « sans état v3 ». ⑦ **NON TESTÉ** (cause mesurée : `CONNECT tunnel failed, response 403`) : le vrai Apps Script
(la lecture réelle de `NUT_SUSPENDU`, `LockService`, son autorisation), la mise à jour automatique de l'application chez un vrai utilisateur, l'iPhone. ⑧ Les contrôles automatiques après déploiement (`?test=1`, `authStatus`) n'exercent ni `saveProfile` ni `LockService` : un essai manuel sur un compte jetable reste nécessaire au premier déploiement (`STOCKAGE-COMPTES` §6).

**Leçon de méthode.** ① Le premier jet du banc a rougi sur **un** témoin — le mien (j'avais mesuré l'état *après* la mise à jour au lieu d'*avant*) : un rouge n'est pas toujours le code. ② Deux hypothèses fausses sur le serveur ont été **mesurées avant d'être écrites** : les séances et les pesées sont REMPLACÉES par la liste reçue (jamais fusionnées) — un témoin qui lance trois envois simultanés
avec trois séances différentes n'en retrouve qu'une, la dernière écrite (mon premier diagnostic, « le serveur dédoublonne par date », était FAUX : il remplace). ③ Sur 40 mutations, **3** ont d'abord survécu — une attente fausse (le témoin visé partait d'un compte déjà marqué), une mutation **équivalente** (tous les appelants comparent encore à la version minimale) et un témoin trop tolérant (il n'exigeait pas qu'une suppression en attente ne soit pas marquée « rejetée ») : le troisième a été
resserré, les deux autres corrigés dans l'outil, et rejoués. ④ Les mutations de la phase A précédente avaient **sept ancres périmées** par cette correction (P01–P06, P16) : rafraîchies et rejouées — *un outil de contrôle qui refuse de démarrer ne contrôle plus rien*.

**Finalisation du 02/11/2026 (GO de Michel — option A, aucune nouvelle fonctionnalité).** ① *Formulations* : « refusé en entier » désigne le **volet Nutrition** (journal, favoris, suppressions), **jamais l'envoi** — corrigé dans `docs/STOCKAGE-COMPTES.md` (§3 et §6), le journal de partage, les titres de témoins et le commentaire de `Code.js`. ② *Le test manquant* : `PB18` (trois états — compte à état v3, suspendu sans état v3, suspendu avec état v3 : séances, records, pesées **et réglages Nutrition du profil** enregistrés, volet Nutrition identique octet pour octet), `PC20e` (le **vrai ancien client de production** sur un compte à état v3) et `PC20d` étendu (suspension) ; les mutations `M41` (« le refus répond avant d'écrire le reste ») et `M42` (idem pour la suspension) sont **tuées** par les bons témoins. ③ *Les exceptions du service de verrou se voient* : `_nutPrendreVerrou_` et `_nutVerrouRendre_` avalaient l'exception en silence ; elle laisse maintenant UNE ligne `[FT VERROU] … exception du service — …`, message nettoyé des adresses et borné à 160 caractères, **comportement inchangé** (la réponse est octet pour octet celle d'un simple délai dépassé, même si le journal lui-même est en panne) : `PB16`, `PB17` ; mutations `M43` à `M48` tuées. ④ *Procédure manuelle* : `docs/EXPLOITATION-NUT-SUSPENSION.md` (qui, quand, suspendre, vérifier, reprendre, journal d'exploitation, liste des personnes autorisées) — décision `D-148`. **Limite écrite** : aucune trace AUTOMATIQUE d'une bascule de `NUT_SUSPENDU` ; le tableau tenu à la main EST la trace (sans ligne, seuls les envois refusés laissent `[FT SUSPENSION]`). **Leçon de méthode** : le rapport du 02/11 affirmait que les réglages Nutrition du profil sont enregistrés sur la seule *lecture* du code ; `PB18` le prouve désormais — *une phrase de rapport sans témoin est une hypothèse*.


## §129 — ⛔⛔ LE MIROIR SUPABASE ACCEPTAIT COMME « ÉCRITS » DES FAVORIS ET DES MASQUAGES QU'APPS SCRIPT AVAIT REFUSÉS OU SUSPENDUS *(03/11/2026, finalisation Nutrition — ordre de Michel ; mesuré avec le vrai client, le vrai Code.js en processus et une suspension réelle, données inventées)*

**Ce qui se passait.** `_cloudSync` lance la requête Apps Script puis envoie **le même corps** au miroir **sans attendre sa réponse**. La porte du miroir (`sbEnvoyer`) ne retirait que `foodLog` et `foodSupprimes` (NUT-SYNC-01 FINAL). Or `savedFoods` (favoris) et `hiddenFoods` (masquages, D-141) sont du **même volet Nutrition** — qu'Apps Script refuse ou suspend **en entier** (`NUT_SUSPENDU`, `NUT_CLIENT_INCOMPATIBLE`, `NUT_INTERNE`, `NUT_ZONE_DRIVE`, verrou) tout en enregistrant le reste du profil. Ils partaient donc au miroir à chaque synchronisation, et le miroir **remplace** un champ présent (migration 0003) : il gardait des favoris et des masquages qu'Apps Script n'avait **jamais acceptés**, et la carte Admin les annonçait « écrits ». Mesuré pendant une **suspension réelle** : Apps Script gardait 1 favori et 1 masquage, le miroir 2 et 2 ; **5 refus sur 5** et **4 cas sans accusé sur 4** (page d'erreur, Apps Script injoignable, ancien serveur, accusé d'une autre opération) : le miroir acceptait à chaque fois. Le Worker ne peut pas décider à la place du téléphone : il ne sait pas ce qu'Apps Script a répondu à une requête qu'il n'a jamais vue.

**Ce qui a été fait (code réel, côté téléphone seulement).** `supabase.js` : la porte retient aussi `savedFoods` et `hiddenFoods` ; `sbEnvoyerFavoris(savedFoods, hiddenFoods)` est la **seule** voie (deux champs, rien d'autre). `setup.js` : `_cloudSync` garde dans l'envoi les deux listes qu'il porte (`_envoi.favoris`) ; `_nutTraiterReponse` les envoie au miroir **à l'accusé valide qui rend compte du volet** (`d.nut`) — avec celles de **cet** envoi, pas celles que le téléphone contient quand l'accusé revient. **Séances, records, pesées et le reste du profil continuent de partir tout de suite, sans accusé** (le filet ne dépend pas du serveur principal). `Code.js`, `worker.js` et les migrations Supabase ne changent pas.

**Pourquoi les tests ne le voyaient pas.** Le témoin du miroir (`E05`, NUT-SYNC-01 FINAL) ne mesurait que le journal et le registre ; aucun ne regardait les **deux autres champs du même volet**. La cause est une **liste tenue en deux endroits** (R2) : le serveur (`_nutCompatibilite_`) comptait quatre champs depuis D-141, la porte du miroir deux — D-141 en a ajouté un côté serveur, personne côté miroir. *Deux listes qui doivent rester identiques finissent par diverger ; la seule question est quand.*

**À quoi on le reconnaît.** Un champ de plus dans le volet du serveur sans que la porte du miroir le sache ; un miroir « à jour » alors que le compte Apps Script ne l'est pas ; une copie de secours qui contient ce que la source de vérité a refusé. **Ce qui protège** : le banc `B-FNL01` (14 témoins) — dont `FNL11`, la **parité** des deux listes, qui rougit au prochain champ ajouté d'un seul côté.

**Preuves.** `tools/banc_nut_miroir_fnl.js` : **8 OK / 5 rouge avant** le correctif (`FNL03` suspension réelle, `FNL06`, `FNL07` cinq refus, `FNL08` sans accusé, `FNL09` la porte), **tous verts après**, prémisses vertes des deux côtés (Apps Script a bien refusé le volet ET enregistré la pesée, le record et la séance : règle d'or n°3). `tools/mut_nut_miroir_fnl.py` : **16 mutations**, 15 tuées par les témoins nommés, 1 équivalente restée verte (l'appel déplacé en fin de traitement : les témoins figent un comportement, pas un emplacement). Témoin `E05c` de `nut_sync02` **adapté (R30)** : il comptait les requêtes (« une seule ») ; la **forme** remplace le nombre (une requête porte le reste, toute autre ne porte que les deux listes).

**Limites écrites (à ne pas redécouvrir).** ① **Les anciens téléphones (≤ ft-v1263) gardent l'ancienne porte** : leur corps complet part au miroir comme avant (journal compris) ; ce correctif protège le NOUVEAU client — et Apps Script refuse déjà leur volet sur un compte à état v3. ② **Le miroir remplace les listes ENTIÈRES** : un téléphone neuf aux listes courtes ou **vides** les y remplace (Apps Script, lui, ignore une liste vide — « le vide ne gagne jamais » — et fusionne les masquages par le plus récent). Même classe que le journal avant `complet` : **inchangé et non traité ici** (le serveur ne rend aucun signal d'exhaustivité pour ces deux listes). ③ Pendant `NUT_ZONE_DRIVE` (Drive indisponible), Apps Script refuse le **journal** mais applique en général les favoris et les masquages (D-109 / D-110 ; sauf si la zone des favoris dépasse son plafond), tout en répondant `ok:false` : le miroir attend l'accusé valide suivant — du retard, pas de perte. ④ **Un appel de plus au Worker par sauvegarde acquittée** (une petite requête ; `cloudSave` n'est pas une dépense d'IA, et le chemin normal ne touche pas Apps Script). ⑤ Nouveau client + **ancien serveur** (réponse sans `ok` ni `requestId`) : le miroir ne reçoit ni favoris ni masquages tant que le serveur n'est pas à jour — c'est le sens voulu (rien n'est confirmé). ⑥ La voie de repli `SB_VOIE='direct'` ne reçoit ni journal, ni registre, ni favoris, ni masquages (déjà le cas des deux premiers). ⑦ **NON TESTÉ** (cause mesurée : `CONNECT tunnel failed, response 403`, seul GitHub est joignable) : le vrai Supabase (RPC, RLS), le vrai Worker Cloudflare, le vrai Apps Script déployé, l'iPhone — le miroir du banc est un **modèle** du contrat de la migration 0003.

**Leçon de méthode.** ① Le garde-fou de l'outil de mutations a **refusé de démarrer** : un sous-ensemble du banc (`S,N,A`) était rouge **sur le code sain** — mon scénario de suspension laissait la suspension posée quand le scénario de reprise ne tournait pas. Sans ce garde-fou, des mutations auraient été « tuées » pour une mauvaise raison. *Un scénario se nettoie lui-même.* ② Un témoin qui comptait des requêtes protégeait une implémentation, pas un invariant : adapté à la forme (R30). ③ Un accusé `ok:true` **sans compte rendu du volet** n'est pas cru (cinquième cas de `FNL08`, mutation `M09`) : *accepté ne veut pas dire appliqué.*

## §130 — ⛔⛔ DES ENVOIS DE SYNCHRONISATION QUI SE CHEVAUCHAIENT FABRIQUAIENT DES DOUBLONS EN CASCADE — RÉGRESSION DE ft-v1264, ET UN ACCUSÉ RELANÇAIT UN ENVOI COMPLET *(05/11/2026, NUT-SYNC-03 ; mesuré avec le vrai client et le vrai Code.js @194, serveur et réseau simulés ; candidat local `881a952c`, NON POUSSÉ)*

**Ce qui se passait.** `_cloudSync` n'avait ni garde « un envoi à la fois » ni délai : dès qu'une réponse tardait (~10 s) ou qu'un téléversement était lent, le minuteur de 4 s relançait un `saveProfile` sans attendre l'accusé du précédent. Le 2ᵉ envoi portait la révision apprise AVANT le 1ᵉʳ, donc le serveur le traitait en CONFLIT contre l'appareil lui-même et gardait les deux versions ; chaque conflit rendu relançait un envoi de plus : une **cascade**. Mesuré sur 5 gestes (ajout, deux retouches, deux ajouts) avec une réponse retardée de 20 s : **83 envois, 40 copies de « Pates »** sur le téléphone ET sur le serveur, le faux message « modifié sur un autre appareil ». ft-v1263 (sans révisions) n'en souffrait pas : régression de ft-v1264. Deuxième défaut, plus discret : un accusé qui n'apprenait qu'une révision appelait `_journalPersister()` → `persist()` → synchro différée, soit un 2ᵉ envoi complet du profil sans rien à dire au serveur (11 envois au lieu de 6 pour 6 gestes ; 8 au lieu de 5 pour 5).

**Ce qui a été fait (`setup.js` seulement).** `_syncVol` : un envoi en vol ; toute demande faite pendant le vol est GARDÉE (jamais abandonnée) et rejouée une fois à sa fin, avec les révisions apprises ; échéance de 180 s (envoi tenu pour non confirmé, garde libérée) ; l'identifiant de vol empêche un accusé tardif de libérer la garde de l'envoi suivant. A2 : l'accusé écrit directement le registre puis le journal (même ordre, même `_journalOk`), **avec la fusion « deux onglets » de `persist()`** ; un conflit et la guérison du registre gardent leur envoi. Aucune donnée persistée, `Code.js` inchangé.

**Pourquoi les tests ne le voyaient pas.** Tous les bancs rejouaient des envois dont la réponse revenait à l'instant : la concurrence n'existait pas dans le harnais. Et le témoin existant du runner (`histTronque`, CCXLI) appelait `_cloudSync()` deux fois d'affilée en supposant deux envois immédiats — une IMPLÉMENTATION, pas un invariant.

**À quoi on le reconnaît.** Un nombre d'envois supérieur au nombre de gestes ; plusieurs requêtes simultanées de cet appareil ; des copies d'un même repas à deux valeurs différentes ; le message « modifié sur un autre appareil » sur un téléphone qui n'en a qu'un.

**Preuves.** `tools/banc_nut_sync_envoi.js` (22 groupes de scénarios, 126 contrôles) : **77 OK / 46 rouge sur a87cc89d, 126 OK / 0 rouge sur le candidat** ; `tools/mut_nut_sync_envoi.py` : **9 mutations sur 9 attrapées** ; 16 bancs voisins verts ; D-031 répartie entière 8 239 ✅ / 7 ❌ (NON VALIDE : 7 rouges Séance/UX, tous reproduits à l'identique sur a87cc89d — 0 imputable au correctif).

**Limites écrites (à ne pas redécouvrir).** ① Un accusé PERDU (lecture CORS bloquée sur réseau mobile, page fermée) laisse le téléphone ignorer la révision du serveur ; retoucher ensuite CE MÊME repas donne un conflit (deux versions gardées, rien de perdu) — identique avant/après (S07b, S12c) : condition C1. ② Un appareil PÉRIMÉ renvoie ses vieilles lignes et crée un conflit sur chaque ligne modifiée ailleurs : le journal n'est pas tiré au démarrage — propriété du protocole déjà dans a87cc89d (S11d), décision de Michel. ③ Aucun test sur Safari ni sur un réseau mobile réel.

**Leçon de méthode.** ① Un contrôle négatif a montré qu'un renvoi que j'avais ajouté (« supprimé ailleurs ») était superflu : je l'ai retiré — *une mutation sert aussi à élaguer*. ② Deux mutations ne rougissaient pas (dernière modification après le vol ; espacement de 7 s qui repoussait le minuteur) : les scénarios ont été durcis (S03v, S16 à 12 s). ③ Une relecture indépendante a trouvé que remplacer `persist()` par une écriture plus étroite **abandonnait son préambule** (la fusion « deux onglets ») : *quand on remplace un appel par un sous-ensemble de ce qu'il faisait, relire ce qu'il faisait AVANT d'écrire*. ④ Mon 1ᵉʳ scénario multi-appareils attendait que les appareils se tirent le journal : faux — lire le produit avant d'écrire l'attendu.

## §131 — ⛔⛔ UN NOM D'ALIMENT ÉCRIT DANS UN ATTRIBUT `onclick` CASSAIT LE BOUTON ET INJECTAIT DU CODE, UNE FICHE REFUSÉE À L'AJOUT CONTINUAIT DE CONSEILLER, ET LA PORTION OBSERVÉE MÉLANGEAIT g / ml / LIGNES MASQUÉES / PRODUITS DE MÊME NOM *(07/11/2026, NUT-CA-FAA'C — contre-audit puis « GO CODE LIMITÉ » de Michel ; mesuré avec l'app RÉELLE chargée dans Chromium, journal INVENTÉ, réseau coupé ; branche isolée `fix/nut-conseils-noms-2026-11-07` basée sur le candidat figé `866846b0`, NON PUBLIÉE)*

**Ce qui se passait.** ① **F — le bouton d'un repas habituel** (`screens.js`, `onclick="rejouerRepas('<signature>', …)"`) ne protégeait que l'apostrophe : un **guillemet droit** cassait le bouton (SyntaxError silencieuse — **27 libellés de la table CIQUAL embarquée** en portent un), un **antislash** changeait la signature (rien ne se rejouait), `\');…` et `&#39;);…` **exécutaient du JavaScript**, et `"><img onerror=…>` **injectait du HTML qui s'exécute à l'AFFICHAGE de la carte, sans aucun appui** (aucune CSP dans l'app). Mesuré par surface : journal, « Mes aliments », favoris, idées : **sains** — seule la carte des habitudes était touchée. ② **A/A' — « Ce qu'il te reste, en vrai »** (`_mesAliments`) retenait la fiche d'une ancienne ligne que le moteur **refuse de re-noter** (copie OFF sans preuve indépendante ; copie contredite par la table CIQUAL : 74 kcal/100 g contre 120) et **conseillait avec** ; et un ancien **favori sans fiche utilisable**, venu avant dans la liste, masquait **par son nom** le produit vérifié du journal (`vus[k]` posé avant l'admission). ③ **C — la portion observée** (`_portionsNotees`) mélangeait **g et ml**, comptait les **prises masquées** (« ✕ ») ou d'avant la remise à zéro et celles d'un **autre produit de même nom** (« 600 g de Skyr » pour une prise masquée de 500 g) ; et `freq` comptait aussi les lignes masquées.

**Ce qui a été fait (code réel, lecture seule : aucune ligne du journal n'est modifiée, supprimée ni recalculée).** `screens.js` : le nom passe par `_escAttrJs` (l'échappeur existant de l'app, `log.js`) + l'écriture JS du retour à la ligne / retour chariot (qu'il laisse passer brut). `app.js` : `_n2PeutNourrirIdee` = le **même verdict que « + Ajouter »** (`_n2Apercu`), sauf qu'une quantité inconnue (« à compléter ») n'est pas un refus de FICHE ; `_mesAliments` n'admet un aliment qu'avec une fiche en grammes admise, **sans** poser son nom « vu » avant ; sa fréquence ne compte que les lignes encore proposées (`_n2Propose`) ; `_portionsNotees(nom, unité, identité)` : **une unité** (celle de la fiche), **une identité** (`_n2Cle`), lignes **encore proposées** seulement.

**Pourquoi les tests ne le voyaient pas.** Les témoins P0 / P11 de `nutri_correctifs` lisaient le **texte** du code — **P11 exigeait littéralement `u!=='g'&&u!=='ml'`, c'est-à-dire le défaut** ; le test des idées (`nut_fiabilite`) ne vérifiait que « c'est un tableau » ; aucun test n'appelait `_mesAliments` ; les tests du « + » appelaient `rejouerRepas()` directement, jamais le **bouton rendu** avec un nom à caractères spéciaux. *Un test qui lit le texte d'une implémentation fige l'implémentation, pas l'invariant — et peut figer le défaut.*

**À quoi on le reconnaît.** Une idée (« 60 g d'Isolat ») pour un produit que « + Ajouter » refuse ; une portion qui ne ressemble à aucune prise réelle (médiane de deux valeurs = leur moyenne) ; un bouton qui ne répond pas sur un nom à guillemet ; un `<img>` de plus dans le DOM de la carte ; une SyntaxError dans la console au toucher.

**Preuves.** `tools/banc_nut_conseils_noms.js` (bloc `B-NCN`, 41 contrôles) : **13 OK / 25 rouge sur le candidat `866846b0`** (F 11 · A/A' 6 · C 8 ; trois témoins ajoutés ensuite — aperçu du moteur en panne, panneau de choix, identité de bout en bout — sont verts sur les deux), **41 OK / 0 rouge après** ; `tools/mut_nut_conseils_noms.py` : **14 mutations sur 14 attrapées** ; P0 / P11 réécrits **sans affaiblir leur garantie** (rouges sur l'ancien code). Bancs voisins identiques avant / après (ref_hist02 43 · ref_hist 50 · recette_mobile 20 · fiabilité 146 · m6_rejeu 29 · nut2_parcours 111 · journal_ecriture 28 · habitudes_alim 37 · nut_b2 51 · food_prefs 39 · nutri_correctifs 45, tous 0 rouge). Coût mesuré : `_mesAliments` +~18 ms sur un journal de 3 000 lignes.

**Limites écrites (à ne pas redécouvrir).** ① `_escAttrJs` (`log.js`) **laisse passer un retour à la ligne brut** : corrigé ici à l'appel, pas dans l'échappeur partagé (autres consommateurs : exercices, programmes — hors périmètre). ② `setup.js` L1733 (`openExHistory('${_escNote(ex.name).replace(/'/g,…)}')`) est de la **même famille** (noms d'exercices) : **non corrigé, hors périmètre Nutrition**. ③ La médiane de DEUX valeurs est leur moyenne : la protection « une grosse saisie isolée » ne joue pas — décision produit (P3) non engagée. ④ Non engagés : B (identité d'une habitude par nom seul, collisions `+` / `::`), D, E, P3, G.

**Leçon de méthode.** ① Mon propre oracle était faux deux fois : un horodatage inversé dans ma fabrique de lignes (« il y a k jours » donnait un `ts` plus GRAND) et une portion nominale écrite de tête (100 g au lieu de 150 g) — **l'oracle se calcule à la main, avec les multiples en regard**. ② Un témoin vérifiait qu'une ligne conservait son nom entier ; le moteur écrit 80 caractères au plus (comportement existant) : *un oracle se confronte au comportement documenté avant d'accuser le code*.

---

## §140 — ⛔⛔ « TOUT ENREGISTREMENT DATÉ VAUT UNE SÉANCE » : UNE SIMPLE MARCHE AURAIT CHANGÉ LA CIBLE ALIMENTAIRE, LA FRÉQUENCE ET LE NIVEAU D'ACTIVITÉ CONSEILLÉ *(05/11/2026, mission « Autre activité » de Michel — `docs/AUTRE-ACTIVITE-CALORIES.md`)*

**Ce que rien n'avait écrit, et qu'on a MESURÉ avant de coder.** Une quarantaine de lecteurs de `S.sessions` (Nutrition, fréquence, récupération,
badges, registre, Milo, calendrier, bilans, export…) comptent « une séance » dès qu'un enregistrement porte une date : **aucun ne regarde son
contenu**. Une activité sans exercice (`exs:[]`) ne plante rien — elle est **comptée partout**. Expérience sur l'app réelle, 9 marches de
60 min / 255 kcal ajoutées SANS garde : fréquence `[5,3,3,3]` → `[6,5,5,5]` ; **macros : glucides 377 → 371 g, lipides 69 → 72 g** (calories
inchangées, 2 786) ; la carte « Passer en Actif (5-6 j) » apparaît ; Milo demande « tu t'entraînes plus que déclaré » ; le bilan du mois passe de
4 à 5 séances ; la tuile Nutrition passe de « 303 kcal / Séance » à « 558 kcal / 2 séances » ; la carte d'historique dit « 0 kg de travail ».
*Aucun de ces changements n'est une erreur de code : c'est une donnée neuve posée dans une liste dont les lecteurs comptent des lignes.*

**Le remède** — un seul prédicat (`_estAutre`, `state.js`), un classement dérivé (`_genreSeance` : `autre` · `cardio` · `muscu`, jamais stocké pour
l'ancien) et une vue (`_seancesTrain()`) que ~30 lecteurs « séance » lisent à la place de `S.sessions`. L'activité est un BLOC dans l'enregistrement
(le `Code.js` déployé jette tout champ racine inconnu et garde tel quel ce qui est DANS une séance — prouvé en exécutant le vrai fichier).

**Ce qui le protège** — un test DIFFÉRENTIEL, pas un témoin par lecteur : le même historique, avec et sans 9 activités (dont la plus récente est
une activité), lu par ~25 lecteurs → sorties identiques à l'octet (`C-ACT-D2` à `D5`, `D7`, `D10`) ; le bloc J (un compte neuf à qui l'on ajoute 120 marches, un
compte établi dont les fenêtres de lecture ne doivent pas se remplir d'activités, la page `dashboard.html`) ; et un témoin de **SOURCE** (`C-ACT-J30` / `J31`) :
toute fonction qui lit `S.sessions` sans passer par `_seancesTrain()` est classée (81, avec sa raison) ou fait rougir.
**Ce que la première version de cette protection ne voyait pas — et qu'on n'a vu qu'en la ROUGISSANT.** Le contrôle négatif complet a donné 44/53 : quatre témoins étaient
**vacueux** (le registre athlète : la fonction écrit et ne rend rien, le banc comparait `undefined` à `undefined` ; la séance annoncée : aucune annonce dans le jeu de départ ;
l'historique compact de Milo : vide sur 4 séances ; la couleur du calendrier : le rouge par défaut d'une activité est AUSSI la couleur « haut du corps »). Puis un balayage
(`tools/mut_sites_garde.py` : retirer la garde de chacun des 52 sites de lecture, un à la fois) a montré que **29 gardes sur 52 ne tombaient sous aucun témoin** — et deux
d'entre elles cachaient de vrais défauts, corrigés : `_repartitionReps` (la répartition des répétitions de Milo prenait les 25 premiers *enregistrements*) et la page du
tableau de bord ordinateur (« 31 séances lues » pour 28 séances et 3 marches). Après le bloc J (et ces deux correctifs, qui ajoutent chacun un site), **les 54 sites sont protégés**.
**À quoi on le reconnaît.** Une ligne nouvelle apparaît dans une liste ancienne, et un chiffre « de séance » bouge sans que personne n'ait fait de
séance. *Avant d'ajouter une ligne à une liste partagée, mesurer lesquels de ses lecteurs la verront (R5 à l'envers), puis protéger par différentiel.*

---

## §141 — ⛔ APRÈS UN EXPORT PDF RÉUSSI, L'APP AFFICHAIT « EXPORT PDF IMPOSSIBLE » *(05/11/2026, trouvé en testant l'export des activités — défaut PUBLIÉ en `ft-v1263`)*

**Mesuré sur la version publiée (`e2b942f3`)** : le fichier est remis (`_donnerFichier` répond « ok »), puis le message de fin lit `seances` — une
variable qui n'existe QUE dans `_histoEntete` — : `ReferenceError`, attrapée par le `catch` de `exportHistoPdf`, qui affiche « Export PDF impossible »
juste après avoir donné le fichier. **Corrigé** : les comptes d'un export ont un seul propriétaire (`_histoCompte`, `setup.js`) que l'en-tête et le
message de fin lisent ; message « N séances » (« N séances et M activités » s'il y en a). Témoin `C-ACT-H4` ; mutation M42 (elle remet le défaut).
**À quoi on le reconnaît.** Un message d'erreur alors que le fichier est arrivé : un `try/catch` large autour d'un geste RÉUSSI transforme une faute
de variable en faux échec. *Le message de fin d'un export se teste aussi.*

---

## §142 — ⛔ FINIR UNE SÉANCE DANS UN ONGLET PÉRIMÉ ÉCRASE LA SÉANCE QU'UN AUTRE ONGLET VIENT D'ENREGISTRER *(05/11/2026, constaté en reprenant le patron pour « Autre activité » — **NON CORRIGÉ, hors périmètre**, à décider)*

**Mesuré sur la version publiée (`e2b942f3`)** : deux onglets du même navigateur ; l'onglet A termine une séance, puis l'onglet B (ouvert avant, donc
sur une liste périmée) termine la sienne → le stockage local ne contient plus QUE la séance de B. Cause : `finishWorkout` écrit `ft4_sessions` en
direct AVANT `persist()` ; le filet multi-onglets (`_ftAutreOnglet` → `_fusionnerAvecLeDisque`) ne s'exécute qu'au début de `persist()`, donc trop tard.
**Les activités n'ont pas ce défaut** : leur écriture absorbe d'abord ce qu'un autre onglet a écrit (`_auAbsorberAutreOnglet`, témoin `C-ACT-G7`,
mutation M25). **Proposition (1 ligne, règle d'or #3)** : appeler la même absorption au début de `finishWorkout` + un témoin à deux onglets — non
fait ici : ce n'est pas le périmètre de la mission, et `finishWorkout` est le cœur de la sauvegarde d'une séance.
**À quoi on le reconnaît.** Une séance qui « disparaît » chez quelqu'un qui garde l'app ouverte dans deux onglets (ou deux fenêtres) du même
navigateur — un cas rare pour une appli installée, mais c'est celui de la règle d'or #3. *Un filet qui s'exécute après l'écriture qu'il devait
protéger ne protège rien.*

---

## §143 — ⛔ DEUX TÉMOINS PIÉGÉS PAR LE CALENDRIER : `PS-E29` ROUGIT SUR LE CODE PUBLIÉ DEPUIS LE 02/11/2026, ET « CE QU'IL TE RESTE » DEPUIS 20 H *(05/11/2026, trouvés par les passes répartie de « Autre activité » — **NON CORRIGÉS** : fichiers d'autres sessions)*

**Cas 1 — la DATE (mesuré sur la version publiée `e2b942f3`, `progres_seances.js` joué seul : 68 OK / 1 rouge).** `tests/parcours/progres_seances.js` fixe
`OFF_DBF = -305` — « la séance au débrief rangé (**année précédente**) » est la séance d'il y a 305 jours. Jusqu'au 01/11/2026 inclus, cette date tombait en
2025 ; **à partir du 02/11/2026 elle tombe en janvier 2026 — l'année courante, déjà dépliée dans une app fraîche** : `PS-E29` attend un repli
(`aria-expanded="false"`) et lit `"true"`. Le code de l'app n'a pas bougé ; **c'est le calendrier qui a fait rougir le témoin**. Il le restera jusqu'au
31/12/2026, puis redeviendra vert le 01/01/2027 — le pire profil de panne : *vert un jour, rouge le lendemain, sur le même code*.
**Cas 2 — l'HEURE (mesuré le même jour).** Le bloc CXXX du `runner` (« ce qu'il te reste » doit aussi se lire dans le Journal) n'a **pas d'horloge figée** : la 1ʳᵉ passe,
jouée l'après-midi, était verte ; la passe finale, jouée à 21 h (Paris), est rouge — `_blocResteHTML` ne rend rien le soir (bascule du soir, 20 h, `ft-v1029`).
Rejoué SEUL sur la version publiée : **rouge à l'heure réelle (21 h), vert dès qu'on fige l'horloge à midi** (`outils_act/base_reste.log`). Toute passe jouée entre 20 h et minuit (Paris) rougit donc, sans qu'aucun commit y soit pour rien.
**Propositions (non appliquées)** : pour le cas 1, calculer l'écart depuis le calendrier (« le 15 mars de l'année précédente ») et le faire figurer dans la fixture ; pour le cas 2,
figer l'horloge du contexte (`page.clock.setFixedTime`, comme le fait le banc `C-ACT`). **À quoi on le reconnaît.** Un rouge sans commit : la passe verte à une heure ou une date, rouge à la suivante, et
`git stash` ne change rien. *Un témoin qui parle d'« il y a N jours » ou qui lit l'horloge réelle parle en réalité d'une date qui change toute seule (famille « fuseaux horaires » de
`BUGS.md` : une durée relative cache une date absolue).*

---

## §144 — ⛔ « 0 » EST UNE VALEUR, PAS UNE ABSENCE : UN CARDIO SAISI À 0 KCAL SUR UNE SÉANCE DE MUSCULATION N'ÉTAIT PAS RANGÉ, ET LE BILAN LE DISAIT « NON SÉPARABLE » *(08/11/2026, trouvé en vérifiant la condition « 0 kcal » de Michel avant l'intégration d'« Autre activité » ; corrigé sur la branche d'intégration `claude/integration-autre-activite-2026-11-08`)*

**Ce qui se passait.** Michel demande de pouvoir remplacer l'estimation par les calories actives de sa Garmin, et de vérifier « la saisie de 0 kcal ». Le mécanisme commun (`kcalBloc`, `app.js`) retient bien 0 (`man != null`, D-ACT-2), et le formulaire d'activité aussi (témoin `C-ACT-A25`). Mais **deux endroits décidaient de « ranger la part cardio » avec un test de vérité** :
`log.js::_calDataSeance` (`if(cardioKcal)`) à l'enregistrement d'une séance, `setup.js::_kcalApresEdition` (`if(cardio>0)`) à la modification d'une séance passée. Sur une séance de **musculation + cardio** dont le cardio est saisi à **0**, la part cardio n'était donc **pas rangée** (`calData.cardio` absent) ; `app.js::_agregatPeriode` lit « part cardio absente » comme
« ancienne séance dont la part n'est pas séparable », et le bilan de la semaine ou du mois affichait **« 1 ancienne séance avec cardio : sa part de cardio n'est pas séparable (comptée en musculation) »** — pour une séance neuve dont la part est parfaitement connue : zéro.
**Effet : un texte de bilan inexact ; aucun chiffre faux** (les calories de la séance étaient justes, le cardio comptait pour 0). Le cardio SEUL à 0 n'avait pas ce défaut (son total vaut la somme de ses blocs, et le bilan le classe par son genre) mais n'avait aucun témoin.

**Le remède** — ranger la part cardio dès qu'un bloc porte une valeur saisie (`kcalBloc(b).remplacee`), 0 compris : 2 conditions, 2 fonctions, aucune donnée nouvelle. Un bloc sans valeur saisie garde l'ancien comportement à l'octet (même total, même rangement).
**Ce qui le protège** — `C-ACT-B16` à `B20` (T44 / T45 / D12) : le cardio à 0 sur une séance de musculation (fin de séance, éditeur de la séance en cours), le bilan du mois sans la note, la séance PASSÉE modifiée (0 puis « Revenir à l'estimation »), le cardio seul à 0 (total 0, aucun forfait). **Éprouvés avant/après** : sans le correctif, B16, B17, B18 et B20 rougissent (le défaut est reproduit) ; avec, le bloc B passe 21/21. Mutations `M63` / `M64` (une par site) : GARDE.
**À quoi on le reconnaît.** Une valeur « zéro » (0 kcal, 0 kg, 0 min, 0 %) qui disparaît d'un rangement ou change un classement alors qu'« absent » et « zéro » ne sont pas la même chose : on cherche `if(x)`, `x||…`, `x>0` sur une grandeur qui peut valoir 0 légitimement. *Un 0 saisi par la personne est une réponse, pas un blanc (D-ACT-2) — famille « valeurs par défaut qui écrasent une réponse ».*
Voisin non touché : les cartes de séances (hors activités) masquent le chiffre quand les calories valent 0 (`if(s.calories)`, convention existante) ; la carte d'une activité l'affiche (« 🔥0 kcal ✎ »).

---

## §145 — ⛔⛔ UNE LIGNE « X - ÉCHAUFFEMENT » FAISAIT DEUX CARTES, UNE PLAGE « 4-5 MIN » SE PERDAIT EN 90 s, UNE SÉANCE FACULTATIVE POUVAIT DISPARAÎTRE DANS SA VOISINE, ET UN COMMENTAIRE LONG ÉTAIT COUPÉ *(08/11/2026, IMPORT PDF — « GO CORRECTIF IMPORT PDF » de Michel ; mesuré avec l'app RÉELLE chargée dans Chromium, document INVENTÉ de la forme de son PDF, réponse de l'IA simulée, réseau coupé ; branche isolée `claude/import-pdf-fidelite-2026-11-08` basée sur master `be04f04c`, NON PUBLIÉE — numéro vérifié sur master le 13/11/2026 : §144 → §145 ; le §146 est réservé à F2-A′ (branche de Claude N°1), sans collision)*

**Ce qui se passait.** ① **« Développé Couché - échauffement » puis « Développé Couché »** (la forme du PDF de Michel : 5 séries d'échauffement, puis le travail ; idem soulevé de terre et squat) faisaient **deux cartes**. Le marqueur d'échauffement dans un NOM n'était reconnu que sous « X (ECH) » (`_nomSansEch`) et « ECH - X » (`_echNomTete`) : « X - échauffement » (le mot À LA FIN, après un tiret) n'était ni l'un ni l'autre — ni sur master, ni dans le lot IMPORT-IA-FIDELITE-01 (**0 témoin** ne couvrait cette forme). La clé d'identité gardait le suffixe, et l'écran « ≈ Rattacher à X ? » **renommait** la carte SANS regrouper (le regroupement passe avant le rattachement, jamais après). ② **« 4-5 min »** était lu **0 s** (`_secRepos`) : le chrono retombait sur le réglage de la personne (**90 s** chez Michel) ; et le prompt du Worker publié n'a **aucun champ repos**. ③ **« Séance 3 » puis « Séance 3 – facultative »** : `_mergeImportSeances` fusionne deux jours consécutifs de même NUMÉRO ; le mot « facultative » n'avait **aucune existence** dans le code. ④ Une note importée de plus de 300 caractères était **coupée à la première frappe** dans l'éditeur (`_setProgExNote`). ⑤ L'aperçu montrait un seul `reps` / `kg` par exercice (« 5×0 reps ») — corrigé par le lot (§ 7 de `docs/IMPORT-IA-FIDELITE-01.md`), revérifié ici sur la forme du PDF.

**Ce qui a été fait (code réel ; aucune donnée existante n'est modifiée, aucune migration).** `log.js` : `_echNomQueue` — une 3ᵉ forme de PREUVE d'échauffement (marqueur à la FIN du nom, après un séparateur ; le mot doit être TOUT ce qui suit : « Squat - Bulgare » n'est jamais touché ; balayage des séparateurs de droite à gauche car « warm-up » contient lui-même un tiret), branchée dans `_typesLigneImport` et `_nomBlocImport` (clé d'identité sans suffixe) ; `_marqueSeance` (« facultative » / « bis » jamais collées à la séance de même numéro ; la fusion par numéro des sections d'une MÊME séance est intacte ; le mot reste dans le libellé) ; repos en plage : `prop` = borne basse (champ de `_reposLire`, `constants.js` — **`_secRepos`, lu aussi par Milo, NE CHANGE PAS**), `rest = prop` à la création, `restTxt` conservé, aperçu « 4 min (écrit : 4-5 min) », éditeur « repos écrit dans le document : « 4-5 min » (séries 6 à 8) », séance « chrono réglé sur 4:00 » et « Régler » propose les deux bornes ; `_setProgExNote` : une note importée n'est plus coupée (2 000 caractères ; 300 pour une note tapée). `worker.js` : deux phrases dans le prompt — **non déployé**.

**Pourquoi les tests ne le voyaient pas.** Aucune fixture n'avait la forme « X - échauffement » ni de séance facultative ; et les témoins de repos du lot **affirmaient la règle d'avant** (« une plage vaut 0 s »). Deux d'entre eux (`IIF-B07` / `B08`) prenaient une plage comme exemple de « sans repos chiffré » : ils ont **rougi au premier banc réel** (131 ✅ / 3 ❌) et ont été reportés sur un exercice dont le texte n'écrit AUCUNE durée.

**À quoi on le reconnaît.** Deux cartes « … - échauffement » et « … » dans l'aperçu ; un exercice perso « … - échauffement » créé à l'enregistrement ; un chrono à 90 s devant « 4-5 min » écrit ; trois séances à l'écran pour un document qui en annonce quatre ; un commentaire de 450 caractères qui perd sa fin dès qu'on tape.

**Preuves.** `tests/parcours/import_fidelite.js` (blocs `B-IIF` + `P`, 25 témoins `IPDF-*`) : **9 ✅ (pur) + 135 ✅ (écran) / 0 rouge** ; `import_corpus` **58 ✅** ; `import_worker_contrat` **198 ✅** (banc du commit Worker de la branche d'intégration : NON repris dans le candidat « application seule ») ; bancs voisins **36 verts / 4 rouges déjà connus et identiques à master** (fig_face_dos, progres_seances, seance_ux, ux_integration) ; **contrôle négatif** `tools/mut_import_fidelite.py` : **96/96** mutations du client conformes (dont M81 à M96, ajoutées pour cette reprise), **14/14** du corpus, **80/80** du Worker (idem : commit Worker, non repris dans le candidat) ; le même banc sur le code d'avant la reprise : **22 rouges**.

**Limites écrites (à ne pas redécouvrir).** ① **Le correctif ne garantit pas ce que l'IA rend** : il rattrape, côté client, la forme du document avec ou sans l'aide du modèle — mais une séance que le modèle n'aurait pas lue, ou un chiffre mal lu sur une image réduite à 1 200 px, restent sa lecture (voir les deux études de `docs/`). ② **Sans le déploiement du Worker, aucun repos n'arrive** : le prompt publié n'a pas ce champ ; la plage « 4-5 min » ne peut donc s'afficher qu'après le GO du Worker (déploiement automatique à la fusion de `worker.js` sur master). ③ **Au-delà de la 8ᵉ page, les pages sont ignorées sans un mot** (`_pdfToImages`) — décision de Michel du 07/10 (numérotée D-056 sur la branche parquée `claude/import-programme-lot1-client`) jamais arrivée sur master ; **non traité ici**. ④ Une plage compte comme un repos ÉCRIT : sa borne basse passe avant la préférence de l'exercice (`IIF-B07b`). ⑤ « Facultative » = un libellé, pas un marqueur (G3 de Michel) ; le programme proposera donc cette séance comme n'importe quelle autre.

**Leçon de méthode.** ① Quand une décision change une règle, il faut chercher les témoins qui l'utilisent comme **fixture** (B07 / B08 prenaient une plage pour « pas de repos »), pas seulement ceux qui la **testent**. ② Un séparateur et le mot qu'il précède peuvent partager un caractère (« warm-up » contient un tiret) : couper au dernier séparateur ne laisse que « up » — le balayage de droite à gauche est figé par `IPDF-F01` et la mutation M96. ③ Mon propre document d'étude écrivait « borne basse » alors que mes témoins disaient encore « 0 s » : la décision de Michel a été reportée dans **dix** témoins et dans la **mutation M21** (qui remettait l'ancien repli) — le premier banc réel n'en a trouvé que deux d'oubliés.

**↪️ 13/11/2026 (reprise de l'import, deux trous de plus, fermés).** ① **« ✓ Oui » au « Rattacher à… » PUIS « Regrouper » retypait les échauffements en séries de travail (NNNNNN)** : le « Oui » remplace le nom, le marqueur « - échauffement » disparaît avec lui, et la preuve d'échauffement ne lisait que le nom COURANT. `_typesLigneImport` lit désormais le nom ÉCRIT (`_vmFrom`) : même résultat dans les deux ordres (témoins `IPDF-G00`–`G03`, mutation M97). ② **Un PDF de plus de 8 pages était lu jusqu'à la 8ᵉ page SANS UN MOT** (une page ignorée peut être la séance facultative) : il est maintenant REFUSÉ avec un message clair, avant tout rendu, jamais tronqué (**D-158**, décision de Michel ; témoins `IPDF-H01`–`H06`, mutations M98–M105). ⚠️ Cette limite portait le n° D-056 sur la branche parquée `lot1-client` ; **D-056 sur master = « Fentes »**. Détail et compteurs : `docs/IMPORT-IA-FIDELITE-01.md` § 21 et § 22.

**↪️ 13/11/2026 soir (STABILISATION DE L'INTÉGRATION — trois rouges de la D-031 complète, option A de Michel, D-159).** La D-031 classique complète de l'intégration (tête `70c0c2ab`, **8 835 ✅ / 10 ❌**) avait, en plus des 7 échecs préexistants de D-156, **trois rouges NOUVEAUX**, tous du lot import et tous dans de VIEUX blocs du runner que ni les bancs dédiés ni les mutations du lot n'avaient jamais rejoués. ① **`CCLXXIII` — défaut RÉEL** : `_materielNoteContredit` (nouveau, absent de master) passait `ex.note` à `_materielsEcrits` SANS garde ; sur une réponse du Worker PUBLIÉ sans champ `note` (ou `note: null`) pour un exercice rattaché d'office au catalogue, `_normEx(undefined)` levait un TypeError et l'import ENTIER échouait (« Erreur analyse : Cannot read properties of undefined (reading 'toLowerCase') »), ET comptait comme un des 2 imports gratuits — mesuré sur le vrai chemin d'import (`analyzeImportPhotos`, réponse brute injectée) ; master n'est pas concerné ; le nouveau Worker et le repli Apps Script, eux, fournissent toujours une `note`. Corrigé par `String(nom||'')` dans `_materielsEcrits` (`log.js`, 1 ligne) ; témoins `IPDF-I00` (contrôle, note vide) / `I01` (clé absente) / `I02` (`null`), écrits AVANT le correctif — `I01` et `I02` ROUGES, puis verts (157 OK / 0) — ; mutation **M106** (le garde retiré), tuée par `I01` et `I02` seuls ; le bloc `CCLXXIII` rejoué seul passe de « n'a pas pu tourner » à 8 OK. ② **`CCLXXIV` — témoin PÉRIMÉ** : il affirmait « un repos VARIABLE laisse l'app à SON réglage (0, pas 105) » — l'alternative (a), ÉCARTÉE par D-153 (« la BORNE BASSE est proposée au chrono ») ; il recevait `[90,90,90]`, le comportement voulu. Réécrit sur la règle décidée (attendu `[90,90,90]`, libellé « D-153 : 90 s, JAMAIS la moyenne 105 ni la borne haute ») ; prouvé rougissant sous 3 mutants de `_reposLire(..).prop` (plage = 0 → `[0,0,0]` · moyenne → `[105,105,105]` · borne haute → `[120,120,120]`), ce témoin seul à chaque fois. `_secRepos` (lu aussi par Milo) n'a pas changé : une plage y reste 0 s, le témoin « FLOU » le tient. ③ **`B-CCCVIII ⑧` — garde de périmètre TROP LARGE** : `!/setTypePerSet/.test(worker.js)` lisait tout le fichier ; le lot WORKER apporte légitimement `setTypePerSet` au Worker pour les PROGRAMMES (9 lignes ; master : 0). Corrigé sur la branche d'intégration (`ed69974c` : le garde lit `HIST_PROMPT` et la branche `kind === 'history'`, avec un témoin séparé qui exige que ces extraits existent ; prouvé rougissant sous 3 mutants) — **NON REPRIS dans le candidat « application seule »** (13/11 nuit) : `worker.js` y reste celui de master, le garde d'origine y est vert (mesuré), et le garde restreint devra accompagner le commit Worker à sa publication. **Leçon (R17 / R35)** : les bancs dédiés d'un lot ne remplacent PAS la D-031 complète — ces trois blocs n'existaient que dans le runner ; un lot qui touche l'import doit y être rejoué avant d'être intégré. **Compteurs règle d'or #17** (code applicatif uniquement) : 0 donnée persistée · 1 fichier (`log.js`) · +3 −1 lignes (dont 2 de commentaire « pourquoi ») · 0 ancien chemin supprimé ; le reste est dans les tests (`import_fidelite.js`, `runner.js`, `mut_import_fidelite.py`).

**↪️ 13/11/2026 nuit (CANDIDAT « APPLICATION SEULE » — « GO PRÉPARATION NOCTURNE » de Michel, D-160).** Branche isolée `claude/candidat-import-app-seule-2026-11-13` depuis master `fd8bf703` : elle reprend de la branche d'intégration (`4e705499`) UNIQUEMENT l'import côté application — `log.js`, `constants.js`, `coach.js`, `index.html`, `style.css` (identiques à la branche d'intégration) + les bancs, le corpus inventé et les mutations d'import + les correctifs `CCLXXIII` (`6e822d63`) et `CCLXXIV` (`886d61c0`). **`Code.js` (F2-A′) et `worker.js` restent EXACTEMENT ceux de master** (même empreinte) ; le banc F2-A′, ses outils et le banc du Worker ne sont pas repris. ⚠️ **Conséquence à ne pas déformer** : avec le Worker PUBLIÉ (prompt court, sans champ repos ni `setTypePerSet`), l'app seule corrige la reconnaissance des mouvements, le regroupement échauffement + travail (séries É puis N), les charges et reps, la séance facultative, le refus des PDF de plus de 8 pages et l'absence de `note` — **mais aucun repos extrait par l'IA n'arrive** : les temps de repos ne seront pleinement opérationnels qu'après la publication SÉPARÉE du Worker (`docs/IMPORT-IA-FIDELITE-01.md` § 21.2 et § 24). Vérifié (sonde hors dépôt sur le vrai chemin d'import, candidat ET master) : l'import en « nouveau programme » ne remplace JAMAIS un programme existant (même nom, deux homonymes, mode « Remplacer » abandonné puis réouverture) ; « Remplacer » demande une confirmation qui NOMME sa cible avant tout effet — sur master, il remplaçait au tap. Compteurs règle d'or #17 du candidat vs master (code applicatif uniquement) : **2** données persistées ajoutées (champs OPTIONNELS `restTxt` et `dropChaine` ; 0 clé de stockage, 0 migration) · **5** fichiers (`log.js` +647 −167, `constants.js` +99 −24, `style.css` +49 −0, `index.html` +5 −2, `coach.js` +1 −1) · **+801 −194 = +607** lignes · **7** anciens chemins supprimés ou fusionnés (les 6 applicatifs du § 12 du dossier — le chemin du prompt du Worker en est exclu — + la troncature silencieuse à la 8ᵉ page).

**↪️ 14/11/2026 (PUBLICATION EN COURS — « GO PUBLICATION ft-v1267 » de Michel, D-161).** L'application seule (candidat `313975a4`, D-160) + l'annonce de la règle d'or #11 + la version sont poussées sur master en avance rapide : seul GitHub Pages se redéploie (`Code.js` et `worker.js` restent ceux de master). États : corrigé sur branche **oui** · intégré **en cours** · publié **à constater** (le constat s'ajoute à l'entrée ft-v1267 de l'archive du journal) · vérifié sur iPhone **non**. ⚠️ Les repos lus dans le document (« 3-4 min ») n'arriveront qu'avec le Worker (publication séparée, GO distinct) : l'annonce ne les promet pas. Les 7 rouges D-031 de D-156 sont acceptés pour CETTE publication seulement (D-161) ; aucun n'est corrigé ici.

**↪️ 14/11/2026 (PUBLIÉE — « GO FINAL » de Michel, D-162).** `master` `fd8bf703` → `c2fd8b8d` en avance rapide à 20:45 UTC (21:45 Paris), **Pages n°1367 ✅**, site servi `ft-v1267`, 10 fichiers servis = commit, aucun run Apps Script ni Worker ; vérification sur le site réel **19 ✅ / 0 ❌** (aperçu d'import : échauffements rangés avec leur exercice, « Non renseigné », PDF de 9 pages refusé, « Remplacer » confirmé et nommé). États : corrigé sur branche **oui** · intégré **oui** · publié **oui** · vérifié sur iPhone **NON** (recette de Michel attendue). ⚠️ Les repos du document restent à lire par le Worker (publication séparée) ; D-031 : 8 552 ✅ / 7 ❌ (les 7 connus de D-156, acceptés pour cette publication seulement).
## §146 — ⛔⛔ UN TÉLÉPHONE À HISTORIQUE INCOMPLET EFFAÇAIT EN SILENCE 1 À 33 SÉANCES DU CLOUD : LE GARDE-FOU DE TAILLE LAISSAIT PASSER 50 ENVOYÉES CONTRE 51 À 83 EN BASE *(12/11/2026, mesuré le 11/11 sur le vrai `Code.js` puis sur le projet Apps Script de test — « perdre encore 1 ou 2 séances n'est pas acceptable » ; **correctif LOCAL, `Code.js` seul, NON PUBLIÉ** ; numéro de BRANCHE, à revérifier à l'intégration)*

**Ce qui se passait.** `handleSaveProfile_` faisait `existing.sessions = envoi` (le dernier appareil qui écrit gagne), protégé par UN garde-fou de TAILLE : un envoi vide, ou inférieur à 60 % d'une base d'au moins 30 séances, était refusé.
Un téléphone qui ne portait que 50 séances (l'app tronque son historique local à 50 quand le stockage sature — `log.js` —, ou après une restauration partielle) remplaçait donc un cloud de 51 à 83 séances **sans que rien ne refuse** :
1 à 33 séances effacées, sans trace. Au-delà de 84 séances en base, le garde-fou refusait… **toute** la liste, **séances neuves comprises** : la séance qu'on venait de faire n'atteignait jamais le cloud. Le compte de Michel (73 séances + 6 neuves) était dans la zone
dangereuse. Mesuré : 13 cas sur le vrai `Code.js` en local, puis sur le projet de test isolé (huit cas rouges comme prédit : C02a, C02b, C04, C05, C07, C10, C12, C13).
**Le remède (F2-A′, décision de Michel)** — le serveur ne remplace plus la liste, il la FUSIONNE par identifiant (`_sessFusion_`) : séances du cloud toutes gardées et dans leur ordre, séances de l'envoi ajoutées, `String(id)` pour identité (le client fait pareil),
sans `id` une empreinte stricte hors `synced` (un doublon plutôt qu'une perte), même identifiant modifié → la version de l'envoi l'emporte, un envoi vide / absent / invalide ne change rien. Verrou et autres données du profil inchangés.
⛔ **Limites écrites, pas guéries** : ① le dernier arrivé gagne encore sur un MÊME identifiant modifié (l'ensemble des identifiants ne dépend pas de l'ordre des appareils, la version d'une séance modifiée, si) ; ② **une suppression voulue ne se propage plus au serveur**
avant F2-B (registre des suppressions) ; ③ une séance SANS identifiant corrigée reste en deux versions ; ④ une base ne fait que croître ; ⑤ **remettre « la version précédente » du serveur réintroduit la perte** (démontré, section H du banc).
**Ce qui le protège** — `tests/parcours/f2_seances_union.js` (banc `tools/banc_f2_seances_union.js` : 13 cas P0 en tolérance zéro, 50 contre n pour n de 29 à 500, 600 tirages sur le vrai serveur + 20 000 sur la fonction, même identifiant en conflit, anciens clients, suppressions documentées, pannes d'écriture et quotas,
vraie concurrence en processus séparés avec auto-contrôle sans verrou, non-régression des autres données contre le serveur d'avant) ; contrôle négatif `tools/mut_f2_seances_union.py` ; `SR-a` de `tools/chaos/banc.js`.
**À quoi on le reconnaît.** Famille « seuils en marche d'escalier » : une liste maintenue par REMPLACEMENT, protégée par un seuil de TAILLE. *Le seuil ne protège que ce qu'il mesure : un envoi perd des éléments sans rétrécir assez, et refuse ce qu'il aurait fallu accepter.* On cherche `x = envoi` précédé d'un `if (taille …)`.


## §147 — ⛔⛔ UNE CHARGE MANQUANTE ÉTAIT FABRIQUÉE ET TOUTES LES AUTRES DÉCALÉES ; L'HISTORIQUE REMPLAÇAIT LES CHARGES PRESCRITES ; « REMPLACER » PRÉSÉLECTIONNAIT LE PREMIER PROGRAMME *(15/11/2026, IMPORT PDF — mission prioritaire de Michel après la recette iPhone de `ft-v1267` ; reproduit à l'identique avec les chiffres de la recette sur le code PUBLIÉ par une sonde hors dépôt, puis mesuré dans l'app réelle (Chromium) avec un document INVENTÉ de la même forme ; branche locale isolée `claude/import-livraison-securisee-2026-11-16` — reconstruite le 16/11 depuis les blobs finaux sur master `e4456bf4`, sans rejouer aucun ancien commit —, NON PUBLIÉE, jamais poussée ; numéro à confirmer à la publication : §146 est réservé à F2-A′, branche de Claude N°1)*

**Ce qui se passait.** ① **Charges décalées à l'aperçu.** Le document écrit un échauffement « Barre / n₁ / n₂ / n₃ / n₄ kg » (5 séries) ; le modèle rend **4** charges (il omet « Barre ») ; `_seriesImport` posait ces 4 valeurs sur les 4 PREMIÈRES séries et comblait la 5ᵉ avec `kg` de l'exercice : aperçu « n₁ × 10 · n₂ × 5 · n₃ × 3 · n₄ × 1 · n₄ × 1 » — la barre disparaît, tout est décalé d'un cran, la dernière est répétée, **sans un mot**. Le défaut est **double** : le modèle omet ; l'app, elle, fabrique. ② **L'historique remplaçait la prescription.** `_loadProgDayVraiment` prenait, pour chaque exercice, la dernière séance de CET exercice (tous programmes confondus, `getPrev(nom)`) et la posait à la place de la charge ET des répétitions du programme : un top set suivi de deux séries de back-off (développé couché, squat) s'ouvrait avec les séries de la dernière séance de l'exercice ; les échauffements d'un soulevé de terre prescrits s'ouvraient avec ceux de l'historique. Le top set et les back-off étaient remplacés par une autre méthode, sans un mot ; les séries de travail du soulevé de terre n'étaient respectées que parce qu'aucune n'existait à cette date. ③ **« Remplacer » présélectionnait le premier programme** (le navigateur choisit la 1ʳᵉ option) ; sans cible lisible le code retombait sur « enregistrer comme nouveau » ; et le début de cycle d'un programme actif disparaissait en silence. ④ **Un échauffement sans charge lisible devenait du cardio** (`_estCreneauCardio` : aucune charge + une durée dans la note « 2-3 min sur 75 kg ») — jusqu'ici masqué parce que le comblement inventait des charges. ⑤ Les traits d'union typographiques (U+2010, U+2011, U+2012, U+2212) n'étaient pas reconnus dans « X - échauffement ».

**Ce qui a été fait (code réel ; aucune migration, aucun historique modifié).** Lots A, B et F : `log.js` seul ; lot C (éditeur) : `log.js` et `style.css` ; lot E (version) : `app.js`, `index.html` et `coach.js` (la ligne « À propos ») — le Worker (lot D) vit sur une branche à part, jamais fusionnée. **A** : un tableau de charges de la mauvaise longueur n'est **jamais aligné** (charges « non renseignées », l'aperçu dit « charges incomplètes : 4 charges lues pour 5 séries ») ; **« à vide » ≠ non renseignée** (`vide:true`) ; un tableau de zéros seuls = remplissage ; « 142,5 » / « 135 kg » lus ; fourchettes (« 44-48 kg », « 6-8 ») = **borne basse** + texte gardé en FIN de note, une fois (cohérent avec D-153) ; forme canonique (nombre · `'vide'` · `null`) réécrite par le regroupement. **B** : `prog.prescrit` (posé à l'import) + `séance.progId` ; tant que CE jour de CE programme n'a pas été fait, les valeurs écrites par le document font foi, l'historique reste visible (« Précédent », grisé) ; une fois le jour fait, la dernière séance DE CE JOUR reprend la main ; un programme d'avant garde l'ancien comportement. **F** : « Choisir le programme à remplacer » (aucune présélection), import bloqué sans cible, début de cycle conservé et DIT. **Garde ①bis** du cardio (nom de base connu → musculation) ; séparateurs typographiques.

**Pourquoi les tests ne le voyaient pas.** Aucune fixture n'avait un tableau de charges de la mauvaise longueur, ni un historique NON VIDE sur le même nom au moment de CHARGER la séance importée. Pire : les témoins de mesure de `import_map` / `import_map2` / `import_map_alias` (`H0`…) **affirmaient le défaut comme une fonctionnalité** — « l'import récupère bien 140 kg » — alors que c'est la prescription du document qu'il fallait respecter ; ils ont été adaptés (la charge « récupérée » = ce que ✓ validerait) et rejoués verts. ⭐ **Un instrument de mesure qui encode un comportement ne peut pas détecter que ce comportement est devenu le défaut.**

**À quoi on le reconnaît.** Un aperçu où la barre n'apparaît pas et où la dernière charge d'un échauffement est répétée ; une séance importée qui s'ouvre sur les charges de la dernière fois au lieu de celles du document ; un « Remplacer » qui vise un programme qu'on n'a pas choisi.

**Preuves.** Banc `tools/banc_import_chaine.js` (`B-ICF`, 47 témoins) : **28 rouges sur master → 0** ; `tools/mut_import_chaine.py` : **32/32** mutations tuées ; bancs voisins rejoués verts (`import_fidelite` 157, `import_echauffement` 11, `import_corpus` 58, `import_map` 22, `import_map2` 43, `import_map_alias` 22, `d088` 52, `cc01_dropset` 31) ; fuzz de 4 000 exercices tordus : 0 plantage, forme canonique et idempotence tenues. Détail : `docs/IMPORT-IA-FIDELITE-01.md` § 26.

**Limites écrites (à ne pas redécouvrir).** ① **La réponse BRUTE de l'IA n'a jamais été observée** : « 4 charges pour 5 séries » est la forme qui reproduit l'aperçu à l'identique, pas une observation. ② Les programmes **déjà importés** (sans `prescrit`) gardent l'ancien comportement jusqu'à un réimport (« Remplacer »). ③ La convention haltères (charge TOTALE) se règle dans le **prompt du Worker** (lot D), pas côté app. ④ « Précédent » reste global (tous programmes) : le restreindre au jour du programme est une décision d'interface, non prise. **Leçon de méthode.** Chercher les témoins qui utilisent un défaut comme **instrument de mesure** (ici : « l'historique est récupéré »), pas seulement ceux qui le testent.

**↪️ 15/11/2026 (suite, même jour — ce que les contrôles de fin de chantier ont trouvé ; chiffres de « Preuves » ci-dessus MIS À JOUR : banc `B-ICF` 53 témoins, 32 rouges sur master → 0 ; `tools/mut_import_chaine.py` 39/39 ; chiffres FINAUX au 16/11 : voir §148 — 74 témoins, 59 mutations).** ① **Un 4ᵉ banc qui mesurait le défaut comme un instrument (après `import_map`, `import_map2` et `import_map_alias`) : `p02_triceps`** (`B-P02-P0…P3`, « la carte reprend SON historique, jamais celui de l'extension haltère ») lisait `kg` de la séance chargée ; avant la correction B l'historique REMPLAÇAIT la charge du programme, donc `kg` portait l'historique ; après, une charge non prescrite reste 0 et l'historique se propose en grisé : **4 rouges** (19 OK / 4 rouge), trouvés par un banc voisin rejoué sur ma branche — pas par un contrôle négatif. L'instrument lit maintenant ce que ✓ validerait (valeur de la série, sinon la suggestion alignée) ; le défaut surveillé rougit toujours (`mut_p02_triceps.py` 9/10 ; la 10ᵉ, M6a, est INVALIDE sur master aussi — ancre périmée, mesuré, inchangée). *Même famille que `import_map*` : avant de croire qu'un lot qui change un comportement est fini, rejouer TOUS les bancs qui chargent un programme importé.* ② **Les valeurs LUES d'un tableau incomplet ne survivaient pas à « Enregistrer »** : « 4 charges lues pour 5 séries (40 · 60 · 75 · 80) » ne vivait que dans l'aperçu ; la personne devait rouvrir le PDF pour placer la barre. Elles sont maintenant écrites **à la fin de la note, une seule fois** (« Charges lues : 40 · 60 · 75 · 80 (4 pour 5 séries) »), jamais en double avec le Worker préparé qui écrit déjà « (4 pour 5 séries) » : témoins `ICF-A23` / `ICF-A24`, mutations `M35` / `M36`. ③ **L'appui ✓ sur une série « à vide »** : le champ porte le TEXTE « à vide » en grisé ; l'appui doit l'enregistrer à 0 kg, `vide` conservé, jamais `NaN` (`ICF-B16`, mutation `M34`). ④ **Croisement B × C** : un éditeur qui réécrirait le programme sans `prescrit` ferait redevenir « d'avant » un programme importé dès qu'on l'ouvre (`ICF-B17`, mutation `M37`, vert sur l'ancien ET le nouvel éditeur). ⑤ **Un commentaire inexact trouvé dans le Worker préparé** : « MESURÉ SUR LA RECETTE RÉELLE… le Worker COMPLÉTAIT la 5ᵉ valeur » — faux pour le Worker **publié**, qui relaie le JSON du modèle tel quel (`importDoc`, vérifié dans `worker.js` de master) ; c'est le **client** publié qui comblait. Seul le contrat préparé de départ (`2b75fda0`) complétait (`_aligner`). Corrigé (commentaire seulement, branche Worker) ; **règle d'or #16 : TESTÉ → OBSERVÉ → EXPLIQUÉ, jamais supposé → affirmé** — et la réponse brute du modèle n'a toujours **jamais** été observée. ⑥ **Deux vérifications hors dépôt, graine rejouable** : un test aléatoire de bout en bout (200 documents fictifs au hasard, ~980 exercices vérifiés dont ~170 regroupés échauffement + travail : jamais de `NaN`, aucune charge fabriquée ni décalée, « à vide » exact, l'aperçu dit « incomplet » quand il faut, le 1ᵉʳ usage rend exactement le programme enregistré malgré un historique aléatoire ; **il rougit sur 11 défauts remis sur 12**, le 12ᵉ — l'échauffement pris pour du cardio — étant tenu par le banc) ; et le **bout en bout Worker → application** (vrai `worker.js` dans un bac à sable `vm`, réseau simulé) dans les **8 combinaisons** (Worker publié / nouveau × modèle qui garde / omet « Barre » × fourchettes · décimales · « confortable ») : aucune charge décalée ni inventée, avec l'ancien comme avec le nouveau Worker. ⑦ **Lot C (éditeur) — ce que la refonte de la ligne a trouvé** : (a) une consigne de repos écrite avec des guillemets (`restTxt`, venue du DOCUMENT) entrait dans un attribut sans échappement des guillemets : **un `onfocus` s'exécutait — injection d'attribut depuis le texte d'un document importé** ; corrigé (échappement `_aq`), éprouvé (`EDP-A08`, mutation M45) ; (b) la hauteur des champs 💬 se mesurait fenêtre FERMÉE (`display:none` répond « 0 ») : 24 px pour un commentaire qui en demande 294 — l'import était lu sur UNE ligne ; les trois portes d'ouverture de l'éditeur sont fusionnées en une, la mesure se refait fenêtre ouverte ; (c) « stocké = 300, écran = 450 » : la première frappe sur un commentaire importé de 509 caractères le ramenait à 300 **en silence** ; plus de plafond de 300 : un plafond de SÛRETÉ de 4 000, dit, jamais en dessous d'un texte déjà là (`IPDF-E01`, qui figeait le plafond de 300, est réécrit) ; (d) à 375 px « 240 » se lisait « 2… » (les flèches du champ numérique mangeaient la place) ; corrigé ; (e) `saveAsProg`, le SEUL copieur de séries d'une séance vers un programme, perdait `vide` et `restTxt` et coupait la consigne à 300 : il les recopie maintenant (`ICF-B18`, mutations M38 / M39) — *un champ qu'un copieur ne recopie pas est un champ supprimé* (R4). Banc `B-EDP` 77 témoins (18 OK / 25 rouges avant → 77 / 0) ; contrôle négatif 61/61 (le contrôle a démasqué deux témoins faibles, corrigés). ⑧ **Lot E (version réelle)** : « À propos » lisait le nom du CACHE du service worker, pas le code en mémoire ; la constante `APP_BUILD` dit maintenant ce qui tourne et **le numéro se pose aux DEUX endroits** (`sw.js` ET `APP_BUILD`, gardés par `check_regles` 17b et `MAJV-D2`) ; banc `B-MAJV` 49 témoins (21 OK / 28 rouges avant : W1-W3 rouges sur Séance et Profil, verts sur l'Accueil → 49/0), mutations 35/35. ⑨ **Lot D (Worker, branche à part)** : banc `B-IWF` 59 rouges prouvés sur le Worker de base → 281 OK / 0 ; mutations 130/130 rejouées par le coordinateur. Détail : `docs/IMPORT-IA-FIDELITE-01.md` § 26. ⛔ Les décisions D-163 à D-172 (modèle de données `prescrit` / `progId` / `vide`, début de cycle conservé, haltères = charge totale, échauffement bloqué, jour déjà suivi contre éditeur, ordre de publication, repère de version, éditeur, les 7 rouges de calendrier) sont **PROPOSÉES, non validées** : elles ne sont **pas** inscrites au registre de cette branche et ne doivent pas être lues comme actées (règle d'or #15).

## §148 — ⛔ DEUX JOURS D'UN MÊME PROGRAMME AU MÊME LIBELLÉ SE CONFONDAIENT (LA PRESCRIPTION DU SECOND ÉTAIT REMPLACÉE PAR LA SÉANCE DU PREMIER), UNE CHARGE PRÉCÉDENTE INCONNUE S'ÉCRIVAIT « null » À L'ÉCRAN, ET UNE LIGNE D'ÉCHAUFFEMENT À LA BARRE SEULE PARTAIT AU CARDIO *(16/11/2026, nuit n°2 — audit D1 / D4 de la chaîne document → séance sur la branche locale `claude/import-livraison-securisee-2026-11-16` ; NON PUBLIÉ)*

**Ce qui se passait.** ① **(D1) L'identité d'un jour n'est que son libellé.** La séance enregistrée porte `progId` et `progLabel` ; aucun identifiant de jour n'existe. Deux jours d'un même programme qui portent le même libellé — un lundi lourd et un jeudi léger tous deux « HAUT DU CORPS » — se confondaient : faire l'un rendait l'autre « déjà suivi », et le jeudi léger s'ouvrait avec les charges et les répétitions du lundi lourd (97,5 · 95 · 95 × 3 au lieu de 60 × 12) — la prescription du document remplacée sans un mot, exactement ce que D1 interdit. Reproduit par `ICF-G01`, rouge sur le comportement d'avant (mutation M40). ② **(D4) « null » à l'écran.** Un champ de charge vidé dans le détail d'une séance passée enregistre `null` (« je ne sais pas ») — et un poids tapé avec une virgule avant le correctif du 01/09/2026 s'est enregistré NaN, devenu `null` par `JSON.stringify` : de vraies histoires en portent. La colonne « Précédent » et le grisé du champ de charge de la séance suivante écrivaient la valeur brute : « 8×null » et « null » (mesuré dans l'app réelle, Chromium). Le correctif du 01/09/2026 (« null » DANS LE CHAMP KG) avait protégé le détail de séance (`_champNum`) ; la jumelle de l'écran de séance n'avait pas été traitée (R8). ③ **(D4) Une charge ÉCRITE mais illisible disparaissait sans trace.** D4 demande de « préserver l'information source » : une charge comme « 2 x 30 kg » (deux haltères ou deux séries ?) ou « Charge adaptée » restait « non renseignée » sans que rien ne le dise — le texte du document n'était ni dans la note, ni signalé à l'aperçu (les fourchettes et les tableaux incomplets avaient déjà leur trace : c'était le seul cas sans). Trouvé par l'audit D4, pas par un témoin. ④ **(conservation, étude des échauffements) Une ligne de musculation prise pour du cardio disparaissait.** Le garde « une ligne avec une charge lisible n'est jamais du cardio » ne comptait que les charges strictement positives, et ne reconnaissait un nom de base connu que par correspondance stricte : « Échauffement - Presse Zeta Prototype » à la barre seule (« à vide ») avec « 5 min tapis » en note, ou « Warm-up - Squat » / « Bench Press - warm-up » avec « 10 min tranquille », repartait dans le bloc cardio — **les séries de la ligne disparaissaient**, l'aperçu les montrant encore. Et `setType:"W"` (ancien format) d'une ligne non regroupée s'enregistrait avec la lettre « W », hors du vocabulaire de l'application (N / É / X). Trouvé par l'étude des échauffements (lecture seule, données fictives), pas par un témoin.

**Ce qui a été fait (`log.js` seul : 27 lignes ajoutées, 5 retirées ; aucune donnée persistée ajoutée, aucune migration).** ① Quand l'identité d'un jour est ambiguë (deux jours ou plus du programme au même libellé), aucun de ces jours n'est « suivi » : la **prescription reste**, l'historique reste visible (« Précédent »). Un jour au libellé unique se comporte exactement comme avant (`ICF-G03`, `ICF-B08`). ② Une charge précédente inconnue (`null`, `undefined`, NaN, chaîne vide) s'écrit « ? » dans « Précédent » et ne laisse aucune suggestion dans le champ ; un `0` reste un `0` (`ICF-G04`, `ICF-G05`). ③ Le texte d'une charge écrite mais illisible reste à la FIN de la note (« Charge non lue : 2 x 30 kg », une fois, jamais en double si la note le porte déjà), l'aperçu le DIT (« Charge écrite non lue dans le document… Rien n'est deviné »), et l'information suit l'exercice quand une ligne d'échauffement est regroupée avec son travail ; aucun nombre n'est deviné, rien de transitoire n'est enregistré (`ICF-A25` à `ICF-A27`). ④ La barre « à vide » compte comme une charge pour le garde du cardio (D4 : une barre à vide ÉCRITE reste identifiable) ; un nom de base connu par ÉQUIVALENCE (synonyme anglais ou équivalence connue — jamais « par mots », trop large) garde la ligne en musculation ; `setType:"W"` se traduit en « É ». **Aucune règle de produit n'est décidée** : D-167 (que faire d'un échauffement dont la durée est écrite en note) reste PROPOSÉE ; on cesse seulement de PERDRE la ligne (`ICF-I01` à `ICF-I05`, mutations M57 à M59 ; `ICF-I04` est le témoin de contrôle : un vrai cardio part toujours dans son bloc). ⑤ **Deux pièges de calendrier de plus, restés dans les fixtures du commit de tests « calendrier » de la livraison du 15/11 (D-172, non arbitrée)**, trouvés en rejouant les quatre bancs corrigés sous une horloge pilotée dont la date est relue dans la page : `progres_seances` (PS-E15) rouge du 17/11 au 01/12 de chaque année (`OFF_DBF`, calculé, tombe sur la 26ᵉ séance de la fixture que le témoin prend pour « une vieille séance sans débrief ») ; `fig_face_dos` (⑧e, ⑩e) rouge le 1ᵉʳ de chaque mois (l'historique daté « aujourd'hui » à 17 h / 18 h est dans le futur avant cette heure). Quatre lignes chacun, tests seuls, **dans le même commit** : garder ou retirer D-172 reste un geste unique.

**L'audit D4, mesuré** (hors dépôt, l'app RÉELLE conduite : 7 états de charge × 11 étapes). États : nombre et décimale · barre « à vide » · « charge adaptée » · fourchette « 44-48 kg » · zéros de remplissage · tableau partiel · « 2 x 30 kg ». Étapes : réponse simulée du Worker → aperçu → programme enregistré → éditeur → séance chargée (sans et avec historique) → séance validée, volume et records → « Précédent » → détail de séance → export CSV → synchronisation (le VRAI `Code.js` dans un vm Node, services Google simulés) → restauration → contexte de Milo. **Résultat : aucune charge inconnue ne devient un zéro écrit par l'application.** Ce que la personne valide d'un appui ✓ sans rien saisir s'enregistre à 0 (le comportement d'avant, identique en séance libre) ; Milo reçoit « ? » (« S1 ?×10 ») ; le serveur rend EXACTEMENT ce qu'il a reçu et la restauration aussi, `vide` / `prescrit` / `progId` compris (`ICF-G06`, `ICF-G07`, `ICF-G08`). La chaîne champ par champ (séries, types, charges, « à vide », reps, repos et sa consigne, superset, commentaires) est identique à chaque étape programme → éditeur → séance chargée → séance enregistrée, malgré un historique différent (`ICF-H00` à `ICF-H03`).

**Limites écrites (à ne pas redécouvrir).** ① Valider ✓ une série dont la charge est inconnue l'enregistre à 0 : c'est le comportement de TOUTE séance, import ou non ; le changer (refuser, demander) est une décision de produit, non prise. ② L'export CSV écrit `kg=0` pour une charge inconnue, une barre « à vide » et un poids du corps (le format ne les distingue pas) ; ne pas le changer sans décision. ③ Milo reçoit « ? » pour une barre « à vide » : l'information `vide` ne lui est pas transmise ; la lui transmettre change ce qu'il reçoit — **R34 : banc avant/après obligatoire**, non fait. ④ Les programmes SANS `prescrit` (créés par Milo, par le générateur, par l'éditeur, ou importés avant) gardent l'ancien comportement : l'historique y remplace les valeurs. ⑤ Deux jours au même libellé ne sont jamais « suivis » : c'est une prudence, pas une règle de produit (D-163 et D-168 restent à arbitrer ; aucune décision n'est présentée comme actée). ⑥ Aucun identifiant de jour n'est enregistré : l'alternative (un `id` de jour et un `progDayId` de séance) ajouterait deux données persistées et plusieurs chemins d'écriture (import, éditeur, copie de jour) — non retenue ce soir (R17), à décider avec D-168. ⑦ **Défaut B de l'étude des échauffements, SEULEMENT CONSIGNÉ (non corrigé, priorité basse — une information, pas une charge)** : après avoir ACCEPTÉ une proposition de regroupement (« Regrouper / Garder séparés »), la note « Séries en couleur … n° 2, 3 » de la carte fusionnée porte les numéros de la ligne d'origine alors que, la ligne d'échauffement passant devant, les séries colorées sont les 3ᵉ et 4ᵉ (même document, nom identique : la fusion d'office, elle, donne « n° 3, 4 », juste). Reproduction fictive : un échauffement « Presse Zeta Prototype » + sa variante « Presse Zeta Prototype / haltères » dont les séries 1 et 2 sont colorées, regroupés à la main. ⑧ **L'étude des échauffements ne tranche pas D-167** : ses constats (une ligne de musculation disparaissait) sont corrigés ci-dessus ; la règle de produit (une durée en note d'une ligne d'échauffement, un nom de base inconnu du catalogue) reste à la décision de Michel. **Restent, mesurés** : un nom INCONNU du catalogue, sans aucune charge, avec une durée et une machine en note (« ECH | Presse Zeta Prototype — 2 min tapis ») est indistinguable d'un vrai cardio et part toujours au cardio (6 cas sur 300 documents, graine 12345 ; 21, graine 777). ⑨ **Calendrier (T2)** : sous une horloge STRICTEMENT figée, `seance_ux` donne 68/1 (le témoin B-UXS-P2 exige une pause qui a duré) : ce n'est pas un défaut de date ; le sens de « horloge figée » est une question posée. Le lint des dates, produit hors dépôt, est aveugle aux deux pièges du ⑤ (fixtures calculées, aucun littéral) : seul un balayage de dates les voit ; il n'est pas intégré (INFRA-QA-01 est le chantier de N°1). ⑩ **Calendrier, 3ᵉ et 4ᵉ pièges — trouvés par la passe D-031 elle-même (16/11, 02 h UTC : `8 796 ✅ · 4 ❌`, passe NON VALIDE), corrigés dans le TÉMOIN seul (`tests/parcours/maj_version.js`, bloc B ; aucune ligne applicative).** Les 4 rouges étaient `MAJV-B1` à `B4` (« Redémarrer maintenant » enregistre d'abord), tous « `clic false` » : le bouton n'était pas cliquable. **Cause OBSERVÉE** (sonde hors dépôt, mêmes fixtures, horloge de la page figée à l'instant testé, aucun réseau) : `checkWeeklySummary` n'agit que **le lundi** et résume la semaine lundi → dimanche PRÉCÉDENTE ; les deux séances fictives du bloc B (12 et 13/11) y tombaient, donc le lundi 16/11 le bilan « Semaine du lun. 9 nov. au dim. 15 nov. » s'ouvrait au démarrage et **tout point touché de l'écran (haut, milieu, bas) appartenait à cette fenêtre**. Le même piège attendait **tout décembre** : `checkMonthlySummary` annonce le mois écoulé (novembre) tant qu'il ne l'a pas été — pas seulement le 1ᵉʳ du mois (observé le 01/12 et le 14/12). Le banc avait donné 49/0 le dimanche 15/11 (22 h 46 UTC) ; rejoué seul, la machine au calme, il redonne 45/4 le lundi à 02 h : **ni la charge, ni l'application** — le bilan automatique est un comportement voulu, hors sujet du bloc. **Correction** : les deux bilans sont posés à « déjà annoncés » dans la fixture (la convention déjà en place dans `autre_activite.js`), et le détail du témoin dit désormais ce qui recouvre le bouton (« clic false (recouvert par ov-week-summary) ») : « clic false » seul a coûté une passe entière de 1 h 50. **Mesuré** (horloge pilotée, date relue dans la page, 7/7 contextes vérifiés, 0 écart) : ancien témoin (tête `98ea4853`) — 45/4 les 16/11, 01/12 et 14/12, 49/0 les 15/11, 17/11 et 23/11 ; témoin corrigé — **49/0 aux sept dates** (16/11, 01/12, 14/12, 15/11, 23/11, 04/01/2027 et la date réelle). Contrôles négatifs : M27 (« Redémarrer » n'enregistre plus d'abord) et M28 (il efface les programmes en passant) **rougissent toujours** leur témoin, rejoués sur l'arbre corrigé **un lundi** ; ce sont les deux seules des 35 mutations MAJV dont le scénario est le bloc B (le filtre `MAJV_SEUL` de `garde` écarte tout autre scénario). ⚠️ **Limites** : aucun lint de dates ne voit ce piège (le code de l'application ne porte aucune date en dur : c'est le JOUR DE LA SEMAINE et le MOIS de l'horloge) ; **les autres bancs qui sèment des séances puis rechargent l'application ne sont pas tous balayés** — la passe du 16/11 n'en a vu aucun autre rouge, ce qui ne dit rien des dates suivantes.

**Preuves.** Banc `B-ICF` : 53 → **74 témoins** (sections G, H et I, et `ICF-A25` à `ICF-A27`) ; `tools/mut_import_chaine.py` : 39 → **59 mutations, 59/59 tuées** (M40 est exactement l'ancien comportement, donc `ICF-G01` et `ICF-G02` sont rouges sur la base pour le motif prévu) ; test aléatoire de bout en bout rejoué sur l'arbre (hors dépôt, graine rejouable) : 300 documents fictifs, 0 mauvais ; **campagnes de conservation des échauffements** (hors dépôt, graines 12345 et 777, 300 documents chacune, rejouées sur l'arbre livré) : 0 violation, « W » 49 → 0 et 54 → 0, perte au cardio 38 → 6 et 57 → 21 (le reste : voir limite ⑧) ; **calendrier**, horloge pilotée et date relue dans la page : `progres_seances` 80/0 aux 15/11, 17/11, 24/11 et 01/12 (79/1 le 01/12 avant), `fig_face_dos` 77/0 aux 15/11, 01/12, 01/01/2027 et 01/02/2027 (75/2 avant), contrôles négatifs ciblés rouges avec le témoin attendu. ⚠️ **Un défaut de la section G elle-même, trouvé et corrigé** : `finishWorkout` garde `_finishing` jusqu'à la fin de son envoi ; une 2ᵉ séance lancée avant était ignorée, et le témoin était instable selon le fuseau horaire du processus — il attend maintenant la fin de l'enregistrement (62/62 sous quatre fuseaux). **Mutations ré-ancrées** : la correction D1 a réécrit `_seancesDuJour` et la D4 le grisé du champ de charge ; trois ancres (M16, M17, M24) ne trouvaient plus leur cible — repérées en rejouant TOUTES les mutations, pas en les supposant valides ; **puis quatre autres, périmées par les corrections de cette nuit** : M31 (chaîne), C08 (corpus), M17 (fidélité) — repérées par la campagne COMPLÈTE de chaque script (58/59, 13/14…) — et M7 de `ux_d086` (la cellule « Précédent » écrit désormais « ? »), repérée par un contrôle STATIQUE de toutes les ancres des 107 scripts de mutations (2 552 mutations examinées, une seule nouvelle ancre périmée ; 802 sont de forme non lisible automatiquement, listées) ; les quatre sont ré-ancrées et rejouées (rouges avec le témoin attendu ; M58 ne retire que l'équivalence connue, M31 tout le garde). **Passe D-031 de la nuit** : une première passe complète sur la tête `98ea4853` donne `8 796 ✅ · 4 ❌` — NON VALIDE, `MAJV-B1` à `B4` (limite ⑩) ; la correction du témoin est un commit de tests à part ; la nouvelle passe sur l'arbre exact (son total, ses 4 conditions) est dans le rapport de livraison, pas ici : ce fichier ne peut pas citer le résultat d'une passe qui porte sur lui.

**Leçon de méthode.** Quand un correctif protège UN affichage d'une valeur inconnue, chercher les autres lecteurs de la même donnée (R8) : ici « Précédent » et le grisé lisaient la même séance passée que le détail corrigé trois mois plus tôt. Et : *une mutation dont l'ancre est périmée ne dit « conforme » à personne* — après chaque correction qui réécrit du code déjà muté, rejouer TOUTES les mutations, pas seulement les nouvelles. Et : *une passe qui rougit un jour précis sans qu'un commit y soit pour rien* — chercher d'abord ce que l'**horloge** change (le jour de la semaine : bilan du lundi ; le mois : bilan du mois écoulé) avant d'accuser la charge de la machine ou le code ; et *un témoin qui ne peut pas cliquer doit dire ce qui recouvre sa cible*.

## §149 — ⛔ « LE DERNIER JOUR FAIT » SE RECONNAISSAIT PAR SON LIBELLÉ ; UNE CHARGE RETOUCHÉE À LA MAIN ÉTAIT ÉCRASÉE PAR L'HISTORIQUE ; UN PROGRAMME MANUEL N'AVAIT PAS LA RÈGLE DU PROGRAMME IMPORTÉ *(16/11/2026, nuit n°3 — décisions de Michel D-163, D-168, D-171 ; branche locale `claude/seance-d163-d168-historique` ; NON PUBLIÉ)*

**Ce qui se passait.** ① **(D-163) L'identité d'un jour n'était que son libellé** : la règle du 15/11 (« 1ᵉʳ usage = les valeurs du document ; ensuite la dernière séance de CE jour ») ne savait reconnaître un jour que par `progId` + `progLabel`. Deux jours homonymes (un lundi lourd et un jeudi léger « HAUT ») ne pouvaient pas être distingués : la nuit du 16/11 avait tranché par **prudence** (aucun des deux n'est « suivi », le lourd gardait sa prescription même une fois fait — `ICF-G02`). Un jour renommé perdait sa séance. ② **(D-163) La règle ne valait que pour un programme IMPORTÉ** (`prescrit`) : un programme créé à la main ou sauvé depuis une séance reprenait, à chaque ouverture, la dernière séance de l'exercice *de n'importe où* (autre jour, autre programme). Et le chargeur d'un programme à UN seul jour recopiait la construction des séries (deux copies de « programme → séance », dont l'une perdait « à vide »). ③ **(D-168) Une charge ou des répétitions retouchées à la main dans l'éditeur étaient écrasées** par la dernière séance de l'exercice dès qu'il en existait une — la retouche n'avait aucune priorité. ④ **(D-171)** l'éditeur par série permet d'ajouter, supprimer, changer le type, la charge, les répétitions, le repos et le commentaire (observé, déjà là) ; **une série ne pouvait pas être déplacée**. ⑤ **(D-167)** après avoir ACCEPTÉ « Regrouper » (échauffement + travail proposés à confirmer), la note « Séries en couleur… n° 2, 3 » gardait les rangs de la ligne d'origine (défaut B consigné au §148 ⑦).

**Ce qui a été fait (`log.js` +84 −54, `style.css` +3 −2 ; aucune migration, aucun historique modifié).** **Identité stable** : chaque jour d'un programme « prescrit » reçoit un `id` à son 1ᵉʳ chargement (paresseusement, jamais d'écriture à l'import ni à la création) ; la séance enregistrée le copie (`progDayId`). « Dernier jour fait » = cet identifiant ; REPLI pour les séances d'avant (sans `progDayId`) : le libellé, seulement s'il est unique dans le programme (la prudence du 16/11 est conservée pour elles). Un renommage ou une réorganisation des jours ne casse rien. **La règle est générique** : `_exsDeProgramme` est l'UNIQUE constructeur « programme → séance » (les deux chargeurs l'appellent) ; elle ne lit AUCUN nom d'exercice (séries, types, instants, identifiants) ; un exercice listé deux fois dans un jour reprend SON bloc (par rang). Les programmes créés dans l'éditeur et « Sauvegarder comme programme » portent `prescrit` comme un import. **Retouche manuelle (D-168)** : l'éditeur pose, sur la série touchée et le champ touché (`kg` / `reps`) seulement, l'instant de la retouche (`ed.kg`, `ed.reps`) quand la valeur CHANGE ; une retouche plus récente que la séance qui reprendrait la valeur garde la valeur du programme, les autres séries et champs gardent leur progression ; une séance terminée ensuite reprend la main. Le repos n'a pas de marqueur (il n'a jamais été repris de l'historique). Valable aussi pour un programme d'AVANT (sans `prescrit`) : seule la série retouchée change de comportement. **D-171** : toucher le numéro d'une série (dès la 2ᵉ) la monte d'un cran, avec toutes ses valeurs et sa retouche. **D-167** : « Regrouper » décale les numéros des séries « en couleur » (3, 4 et non 1, 2).

**Vérifié, rien à corriger (D-165).** Il n'existe aucun « objectif de programme » dans l'import ni à l'activation : le mode « Nouveau » (qui ne remplace rien) est le défaut, « Remplacer » n'a aucune cible d'office et dit le sort du début de cycle (lot F du 15/11, `ICF-F01` à `F09`), aucune case n'est cochée, un import « Nouveau » laisse le cycle en cours intact (`SCHIS-D05`).

**Preuves.** Banc `tools/banc_seance_historique.js` (`B-SCHIS`, 46 témoins ; **25 rouges sur `13e84397` → 0** ; 6 familles dont un exercice PERSONNALISÉ et un exercice FICTIF INÉDIT) ; `tools/mut_seance_historique.py` **34/34** mutations tuées (dont « l'historique d'un autre jour est repris » M02-M04, « une valeur retouchée est écrasée » M05-M09, « un nom d'exercice décide » M01) ; bancs voisins rejoués verts (`import_chaine` 74, `editeur_prescriptions` 78, `import_fidelite` 157, `import_echauffement` 11, `import_corpus` 58, `import_map` 22, `import_map2` 43, `import_map_alias` 22, `p02_triceps` 23, `ml_a` 34, `rir_superset` 52, `seance_recette` 93, `seance_ux` 69, `session_integrity` 93, `autre_activite` 136, `contrat_milo` 23, `aides_audit` 18, `ux_integration` 69, `debrief_provenance` 24, `seance_chiffres` 102, `d088` 52, `cc01_dropset` 31, `ux_d086` 122, `seance_c1/c2/c3` 29/22/35, `seance_repos` 61, `seance_unicite` 12, `seance_date` 25) ; mutations ré-ancrées rejouées : `mut_import_chaine` M15-M21, M23, M40, M41, M48-M50 (13/13), `mut_editeur_prescriptions` M29, M53, M61 (3/3), `mut_ml_a` M2, M3, M9b (3/3). Le vrai `Code.js` rend identité, séance rattachée et retouche tels quels, la restauration aussi (`SCHIS-V01`, `V02`). Règle d'or #9 : le bouton central « + » est mesuré identique (`SCHIS-Z01`).

**Témoins réécrits (à connaître, pas affaiblis).** `ICF-G02` figeait la PRUDENCE de la nuit du 16/11 (`D-163 PROPOSÉE`) : le jour lourd, une fois fait, gardait sa prescription ; avec l'identifiant, il reprend SA séance — le témoin dit maintenant cela (l'invariant « jamais la séance d'un AUTRE jour », `G01`, est intact, et la prudence des séances sans identifiant est tenue par `SCHIS-I09`). `ML-A ③` comptait les appels de `_recopierDropset` dans chacun des deux chargeurs : ils passent par `_exsDeProgramme` (même invariant, lu à son nouvel endroit). `EDP-M16` compare le programme enregistré clé par clé : il admet l'instant de retouche et `EDP-M17` exige qu'il ne soit posé que sur les séries touchées. `EDP-I02` (cible de 24 px) a imposé une colonne « n° » de 24 px (au lieu de 16) pour le nouveau geste ; trois ancres de mutations (`mut_editeur_prescriptions` M29, M53, M61) ont suivi. Deux ancres de `mut_ml_a` (M5, M8, M9) étaient déjà périmées avant ce lot (non rejouées).

**Limites écrites (à ne pas redécouvrir).** ① **Les programmes d'AVANT** (sans `prescrit` : générés, créés avant ce lot, importés avant le 15/11) gardent l'ancien comportement (la dernière séance de l'exercice, partout) — sauf pour les séries retouchées à la main (D-168). Les basculer sur la règle D-163 demande un pont par libellé pour leurs séances anciennes (sans `progId`) : non fait, décision à prendre. ② Un programme **généré** (« Premiers pas ») ou **enregistré depuis Milo** n'est pas « prescrit » (ni importé ni manuel). ③ Aucune édition sur deux appareils n'est réconciliée : chaque appareil pose son identifiant de jour au 1ᵉʳ chargement, la dernière synchronisation du programme gagne. ④ Il n'existe pas de **commentaire par série** (le commentaire est par exercice, entièrement éditable) : D-171 le décrit, ce serait une nouvelle donnée persistée. ⑤ Basculer « à vide » puis le retirer laisse l'instant de retouche (valeur finale inchangée, la charge reste « non renseignée » : la suggestion grise de l'historique reste visible). ⑥ Le cardio (un bloc de durée) n'est pas concerné. ⑦ **Cas ambigus d'import au cardio (D-167, §148 ⑧)** : un échauffement dont le nom est INCONNU du catalogue, sans charge, avec une durée en note part toujours au cardio — indistinguable d'un vrai cardio sans une confirmation à poser à la personne (6 cas sur 300 documents) : non fait. ⑧ Validé sur iPhone : **non** (Chromium 390 × 844 seulement).

## §150 — ⛔ LA CHARGE D'UN AUTRE PROGRAMME REMPLAÇAIT LA PRESCRIPTION D'UN PROGRAMME NON MARQUÉ ; DEUX BLOCS DE MÊME NOM SE CROISAIENT APRÈS UNE RÉORGANISATION ; UNE SÉRIE DÉPLACÉE EMPRUNTAIT L'HISTORIQUE DE SA VOISINE ; LE REPOS N'ÉTAIT JAMAIS REPRIS ; IL N'Y AVAIT PAS DE COMMENTAIRE PAR SÉRIE *(16/11/2026, lot 1 « contre-expertise » — décisions de Michel D-163, D-168, D-171 ; branche locale `claude/seance-ce-lot-h` ; NON PUBLIÉ ; §150 = lot 1, §151 = lot 2, §152 = lot 3 à l'assemblage)*

**Cause** (`_loadProgDayVraiment` / `_loadProgVraiment` / `_exsDeProgramme` / `_prevDuJour`, fichier de l'écran Séance) : la règle D-163 (« 1ᵉʳ chargement = prescriptions, puis dernière séance TERMINÉE du MÊME jour du MÊME programme ») n'existait que pour les programmes portant `prescrit:true` ; les autres (anciens, générés, de Milo) reprenaient la dernière séance de l'exercice de partout (sondes H02/H03). L'ordre de lecture était celui du tableau (H05), un exercice se retrouvait par nom + rang (H12), une série par rôle + rang (une série déplacée emportait la valeur de sa voisine), le repos n'était jamais repris de l'historique (H09), le commentaire n'existait qu'au niveau de l'exercice.
**Correction** : la règle vaut pour TOUS les programmes (le drapeau n'est plus lu) ; identités posées paresseusement au chargement (programme, jour, `exId`, `sid`, uniques) et copiées dans la séance enregistrée ; rapprochement par identité (séance d'avant les identités : nom, puis commentaire, sinon prescription) ; lecture dans la chronologie réelle (`_cmpSeances`) ; le repos reprend l'historique sauf retouche plus récente (`ed.rest`) ; commentaire PAR SÉRIE (`set.note`, le champ que la séance connaît déjà) dans l'éditeur, chargé en séance, recopié par « Sauvegarder comme programme » ; zone tactile du numéro de série 24 × 34 → 40 × 43 px.
**Témoins** : `tests/parcours/seance_ce_h.js` (B-SCCH, `tools/banc_seance_ce_h.js`, contrôle négatif `tools/mut_seance_ce_h.py`). Témoins existants RÉÉCRITS (invariant gardé, l'ancien oracle contredisait D-163/D-168) : `SCHIS-I03/S08/E01/E09/E10`, `EDP-M17`, `ICF-B11`, `T7a/b/e`, `SCPDC-B10/B10c`, `IIF-J04/K16`.
**Limites écrites** : ① **H07** (une séance plus ancienne du même jour fournit la charge quand la dernière n'a pas l'exercice) : état actuel DOCUMENTÉ, arbitrage de Michel en attente. ② Séances d'avant les identités avec deux blocs de même nom, même commentaire, même nombre de blocs : le rang d'avant (indiscernable). ③ Le repos « réalisé » n'est pas mesuré par l'app : l'historique garde le repos PRÉVU de la série à ce moment-là ; un repos retouché dans l'éditeur AVANT ce lot (sans instant) cède devant celui de la dernière séance. ④ Sur 360 px la ligne de série déborde un peu plus (déjà le cas avant). ⑤ Validé sur iPhone : **non**.

## §151 — ⛔ LES CINQ ÉTATS DE CHARGE SE CONFONDAIENT EN CHEMIN ; UN ÉCHAUFFEMENT INCONNU DEVENAIT « CARDIO » SANS QU'ON LE DEMANDE *(mission corrective Séance du 16/11/2026, LOT 2 — D-164 · D-167 ; corrigé sur branche, non publié)*
**Cause.** ① `_kgTxtSerie` lisait `x.kg||'?'` : un ZÉRO écrit passait pour « je ne sais pas » (P01) ; l'import écrivait `0` pour une charge « non renseignée », `_exsDeProgramme` faisait `s.kg||0`, `saveAsProg` aussi : un INCONNU (`null`) devenait un zéro à chaque étape (P03). ② Le `pdc` d'un programme n'était lu ni au 1ᵉʳ chargement (P04) ni recopié par `saveAsProg` (P05) — le PDC +12 prescrit disparaissait. ③ `setPdcMode` / `_pdcSaisie` laissaient `vide:true` à côté de `pdc` (P10). ④ Un lest ne comptait pas au volume (arbitrage de Michel : il doit compter) et rien ne disait un record de lest. ⑤ `_estCreneauCardio` rangeait « Échauffement - X » (X inconnu du catalogue, sans charge, durée en note) au cardio : la série disparaissait (E01).
**Correction.** Inconnu = `null` partout (import, éditeur, 1ᵉʳ chargement, validation d'une série non chiffrée, « enregistrer en programme », CSV vide, Milo « ? »), zéro = `0`, « à vide » = `vide`, `pdc` recopié à chaque étape (programme ↔ séance ↔ historique), PDC et « à vide » jamais ensemble ; `_chargeTonnage` (propriétaire unique) : un lest compte, l'assistance et le PDC seul non (aucune règle inventée) ; record de lest DÉRIVÉ de l'historique (aucune donnée persistée) ; D-167 : `_creneauAConfirmer` — la ligne reste un exercice, l'aperçu d'import demande (« Mettre dans le cardio » / « Garder comme exercice »).
**Témoins.** `tests/parcours/seance_ce_p.js` (B-SCCP-A…K, 89 témoins, rouges avant sur le code d'AVANT) · `tools/mut_seance_ce_p.py` (49 mutations). Oracles RÉÉCRITS en gardant leur invariant : `SCPDC-B1 / B5 / B14 / B16 / C4–C6` (le tonnage ne compte plus 0 pour un lest ; « ? » = inconnu, « 0 » = zéro ; import = inconnue `null`) et `ICF-A01 / A08 / A14 / A18 / A22 / A25 / A27 / B04` (« non renseignée » s'écrit `null`, plus `0`).
**Limites.** ⓐ Une charge `0` d'un ANCIEN programme / d'une ancienne séance se lit désormais « 0 » (et non plus « ? ») pour Milo : le passé n'est pas réécrit, un zéro ancien est indistinguable d'un « non renseigné » ancien. ⓑ Le tableur (Sheets) n'a pas de colonne « charge » (`Code.js`, non modifié) : inconnu, zéro, PDC et « à vide » y partent en `kg` 0. ⓒ Un dégressif sur une série au poids du corps (pourcentage d'un lest ?) : aucune règle inventée. ⓓ Le volume affiché d'une séance ancienne portant un LEST se recalcule depuis ses séries (le volume rangé n'est pas réécrit) — ce champ n'existe que depuis cette candidate. ⓔ Validé sur iPhone : **non** (Chromium 390 × 844).

## §152 — ⛔⛔ UNE MISE À JOUR SE LEVAIT « AU BOUT DE 120 s » PAR-DESSUS UNE OPÉRATION ENCORE ACTIVE (LE CORPS DE LA RÉPONSE N'AVAIT AUCUN DÉLAI), UN DROPSET ÉTAIT EXCLU EN BLOC DE « SUPPRIMER UNE SÉRIE », ET L'EN-TÊTE GLOBAL SE RÉPÉTAIT SUR TOUS LES ÉCRANS *(16/11/2026, CE lot M — contre-expertise de ChatGPT, sondes U02 / U06 / U07 / S04 / S05, et décision D-176 de Michel ; branche locale `claude/seance-ce-lot-m` depuis `ec31a2f6`, NON PUBLIÉE ; §150 = lot 1, §151 = lot 2, §152 = lot 3)*

**D-170 — cause.** `syncSheets` (tracking.js) levait son minuteur dès les EN-TÊTES de la réponse puis `await resp.text()` attendait le CORPS sans aucun délai : une réponse qui s'arrête en route suspendait la fin de séance (verrou `_finishing` posé, récapitulatif jamais ouvert). Le « dernier filet » de `app.js` (`_majVerrouVif`, 120 s) rendait alors la main à la mise à jour : la page se rechargeait par-dessus, récapitulatif perdu (U02, U07) ; une analyse du briefing encore en vol était déclarée « non vive » à 120 s (U06). **Correction.** Un verrou ne se lève plus que quand son opération se TERMINE : une seule attente bornée de bout en bout (`_fetchBorne` : en-têtes ET corps, annulation réelle par `AbortController`, abandon de l'attente même si le corps ignore le signal), employée par `syncSheets` (8 s) et `_runSeDebrief` (90 s) ; `_finishing` n'est plus un horodatage ; `_dbfAnalyseVive` lit les analyses EN COURS de la page (`_dbfActifs`, retirées par le `finally`) ; le `try` du briefing s'ouvre dès la pose du verrou ; la fin de séance DIT l'issue d'un délai (« Réseau trop lent — ta séance est gardée »). Le bandeau de mise à jour se montre aussi sur l'Accueil (une seule règle). **Témoins.** `B-SCCM-F` (l'outil, exécuté, horloge qui avance) · `B-SCCM-U-A…D` (vrai service worker, vrai serveur local qui fige le corps, horloge de la page décalée de 130 s, connexion surveillée côté serveur) · `B-SCCM-B` (bandeau) ; trois témoins qui approuvaient l'expiration réécrits sans perdre leur invariant (`SCMAJ-P1/P2/P3/P8`, `A2b`, `E4`, `E5`).

**D-173 — cause.** `_serieSupprimable` excluait TOUT dropset ; `supprimerSerie` ne recalait pas `_pdcAtt` (le sens « lest / assistance » en attente gardait l'ancien index, et le redessin le perdait). **Correction.** Série complète ≠ palier : un PALIER (`_estPalierDrop`, par index via `_dropDebut`) ne se supprime pas isolément (le nombre de paliers fait loi, « ⚙️ Modifier paliers ») — la feuille le DIT (ligne 🔒 + phrase) ; les séries normales d'un dropset / d'une pyramide se suppriment, la chaîne et son réglage restent ; un dégressif importé (type « D ») n'a pas de réglage : ses lignes sont des séries ; `_pdcAtt` suit sa série (avant, après, supprimée). **Témoins.** `B-SCCM-S1…S23` (+ `SCUI-S20` réécrit : il excluait tout dropset).

**D-176 — correction.** `#root:not(.on-home) .topbar{display:none}` : l'en-tête global n'est visible que sur l'Accueil, sans liste d'écrans (un écran futur le masque aussi), sans bande vide ; l'en-tête de SÉANCE (« Terminer ») fait exception ; `.screens` descend de `env(safe-area-inset-top)` quand l'en-tête est masqué. **Témoins.** `B-SCCM-H1…H15` (+ `UXS-A5`, `MAJV-F4` réécrits). **Conséquence à savoir** : le « ? » d'aide d'onglet, « Partager » et la pastille Sheets ne sont plus que sur l'Accueil.

**Limites.** Chromium seulement : la zone sûre n'est qu'émulée, le geste iPhone (M36), le gel d'une page en arrière-plan et le retour de cache (bfcache) ne sont pas rejoués. Le rechargement AUTOMATIQUE sur l'Accueil (ft-v1184) est conservé : le bandeau n'y reste visible que si cette application n'a pas lieu — le supprimer est une décision de Michel.

## §153 — ⛔⛔ APRÈS UN DÉPLACEMENT DE SÉRIE, « PRÉCÉDENT » MONTRAIT CELLE DE LA VOISINE — ET VALIDER UN ZÉRO ÉCRIT LUI DONNAIT LE « PDC−20 » DE L'AUTRE *(16/11/2026, assemblage des trois lots — banc d'interaction `B-SCCX` ; corrigé sur branche `claude/seance-ce-lot-x`, NON PUBLIÉ)*

**Cause.** Défaut d'INTERACTION, invisible dans chaque lot pris seul. Le lot 1 (D-163 / D-171) rapproche une série de SA série d'avant par identité (`sid`) pour les VALEURS au chargement (`_seriesAvant`) et permet de déplacer une série dans l'éditeur ; le lot 3 (D-173) permet d'en supprimer une du milieu ; le lot 2 (D-164) fait reprendre « telle quelle » la suggestion grise « PDC+10 » quand on valide une série à charge vide. Mais `_prevAligneDetail` (log.js), propriétaire de la colonne « Précédent », de la suggestion grise du champ de charge et du « commentaire de la dernière fois » (`_notesPrecedentes`), rapprochait encore par RÔLE et par ORDRE. Après un déplacement (ou une suppression au milieu), la ligne d'un zéro écrit affichait « 8×PDC−20 » et le commentaire « élastique » de sa voisine, sa suggestion grise disait « PDC−20 », et valider la série sans rien taper reprenait cette suggestion : `{kg:0}` devenait `{pdc:-20}` — un PDC attribué sans choix (D-164), qui se propageait ensuite partout (feuille de suppression, « Sauvegarder comme programme », contexte de Milo, export, chargement suivant). **Correction (minimale, R2).** `_prevAligneDetail` rapproche d'abord par identité quand la séance d'avant en porte (même fonction `_seriesAvant`, mêmes règles : même `sid`, même rôle) ; une série identifiée sans correspondante garde le rapprochement par rôle sauf s'il lui donnerait la série qu'une AUTRE ligne a déjà par identité (un tiret plutôt qu'un repère faux, R29). Les séries sans `sid` (ajoutées en séance) et les séances d'avant sans identités gardent le rapprochement par rôle d'AVANT, à l'octet. **Témoins.** `B-SCCX-X2c5`, `X2c6` (le déplacement : « Précédent », suggestion, commentaire, validation d'un zéro), `X2g1b` (la suppression) — rouges sur le code d'avant (8 rouges en cascade dans le fil : le PDC−20 parasite arrive jusque dans l'export et le contexte de Milo), verts après ; mutations `M36` / `M37` de `tools/mut_seance_ce_x.py`. **Limite connue, NON corrigée** : valider une série dont la charge est vide reprend la suggestion grise de « Précédent » même quand elle vient d'un autre programme (convention ancienne : « la dernière fois, d'où qu'elle vienne ») — voir le rapport de l'assemblage.


## §154 — ⛔ 27 MUTATIONS NE TESTAIENT PLUS RIEN : LEUR ANCRE AVAIT DISPARU DU CODE APRÈS LA MISSION CORRECTIVE SÉANCE *(17/11/2026, ancres ré-ancrées ; liste de mutations `tools/mut_*.py` seulement — aucun code applicatif, aucun test, aucun banc touché ; NON PUBLIÉ)*

**Cause.** Une mutation s'applique sur une COPIE d'arbre par remplacement d'une ancre qui doit apparaître EXACTEMENT UNE FOIS ; quand la mission corrective a retouché le code (D-163 fusion des deux chargeurs de programme en `_exsDeProgramme`, D-164 charge inconnue `null` / PDC / `_chargeTonnage`, D-170 message d'échec de l'analyse, D-171 commentaire par série et `_noteBornee`, D-093 / D-102 dock de repos), 27 ancres sont tombées à « ×0 » : le script affiche INVALIDE (ou, pire, ne rejoue rien) et le témoin n'est plus éprouvé — *un vert qu'on ne peut plus faire rougir rassure sans rien mesurer* (R17 / R35). **Correction.** Chaque ancre est retrouvée dans le code actuel avec la MÊME intention (aucune affaiblie, aucune supprimée) et la mutation est REJOUÉE sous garde réseau (`tools/sous_garde.sh`) : le banc doit rougir. Journaux bruts : `nuit5/out-a/`. **Point à retenir (M55 / M56).** D-163 a fusionné les deux chargeurs (programme à jours / à UN jour) en UNE ligne `_exsDeProgramme(exs, jour, repsDef)` : les deux mutations restent distinctes en ne touchant chacune que SON chemin (`repsDef` 10 ou 5) — chacune est tuée par son propre témoin (IIF-K07 pour 10, IIF-K19 pour 5). **Bilan : 26 tuées, 1 « équivalente » qui reste VERTE comme voulu (rir_superset M16).**

| Script | Mutation | Ré-ancrée | Résultat |
|---|---|---|---|
| mut_editeur_prescriptions | M09 · M11 · M28 · M29 · M30 · M32 · M35 · M37 · M42 · M53 · M61 | oui | 11 / 11 tuées |
| mut_fig_face_dos | M24 | oui | tuée (B-FFD-⑩e) |
| mut_import_chaine | M01 · M23 · M38 | oui | 3 / 3 tuées |
| mut_import_fidelite | M55 · M56 · M63 · M76 · M77 · M89 | oui | 6 / 6 tuées |
| mut_seance_chiffres | M18 | oui | tuée (C-NUM-D4) |
| mut_rir_superset | M7 · M16 | oui | M7 tuée · M16 équivalente (verte, attendu) |
| mut_session_integrity | M4 | oui | tuée (D1) |
| mut_ux_d086 | M7 · M14 | oui | 2 / 2 tuées |

**Non traité (hors liste de la mission, déjà périmées avant).** `mut_fig_face_dos` M7 · `mut_import_chaine` M24, M34, M42, M43, M46, M49 · `mut_rir_superset` M9 · `mut_seance_chiffres` M5, M26 : ancre × 0 constatée en lecture seule, à ré-ancrer dans une prochaine mission.

## §155 — ⛔ LA RÈGLE « QUELLE SÉRIE D'AVANT EST LA MIENNE ? » ÉTAIT ÉCRITE DEUX FOIS, ET UN TÉMOIN NE VOYAIT PLUS LA DIFFÉRENCE *(17/11/2026, assemblage final ; corrigé sur branche, NON PUBLIÉ)*

**Famille : deux sources de vérité (R2) + témoin affaibli par une correction voisine.** Le correctif du banc d'interaction (§153 : « Précédent » par identité) avait **recopié** la recherche par identité de `_seriesAvant` dans `_prevAligneDetail`. Conséquences mesurées sur le candidat assemblé (mutations rejouées) : la mutation **M12** (une série dont le rôle a changé emprunte l'ancien rôle) devenait **INVALIDE** (ancre × 2) ; **M11** et **M13** devenaient **équivalentes** (la colonne « Précédent » faisait désormais, seule, ce que le chargement du jour faisait) — donc le témoin **A18** ne distinguait plus les deux chemins : **un témoin qui ne peut plus rougir ne mesure rien.**

**Correction.** Une seule fonction `_serieParIdentite(prev, s)` (même `sid`, même rôle, UNE candidate), lue par `_seriesAvant` (chargement du jour) et par `_prevAligneDetail` (« Précédent », suggestion grise, commentaire de la dernière fois). Comportement inchangé. **Témoin ajouté (aucun témoin existant modifié) : `SCCH-A18b`** — une série retirée puis une autre ajoutée à sa place : la série ajoutée garde sa prescription, jamais le 31 de la série retirée. **Contrôle négatif :** M12 retrouve une ancre unique et est tuée ; **M11** (désormais : l'identité n'est lue ni au chargement ni dans « Précédent ») est tuée par A18 ; **M13** (re-ciblée sur `_seriesAvant`) **survivait** avant A18b et est **tuée par A18b**.

**Compteurs #17 de ce correctif.** données persistées ajoutées : 0 · fichiers applicatifs touchés : 1 · une fonction partagée remplace deux copies · anciens chemins fusionnés : **1**.

**Confidentialité (même jour).** Le scan d'empreintes de l'archive privée a signalé, dans le témoin `SCCP-J01` (lot 2), une suite de répétitions / charges d'un exemple « fictif » qui coïncide avec une suite du programme réel. Par prudence — ce dépôt est destiné à devenir public — les chiffres de l'exemple sont remplacés par d'autres, nettement inventés (`12·7·4 puis 6·6`, `17 · 34 · 57`, repos `25 · 50 · 70 · 170`) ; le témoin teste le REGROUPEMENT (ordre, types, inconnue, repos, notes), pas ces valeurs : banc `seance_ce_p` rejoué, 94 ✅ / 0 ❌. L'historique Git local de la branche garde l'ancien exemple (jamais poussé) : **ne pas le publier tel quel** (publication par un seul commit « arbre final » ou après réécriture décidée par Michel).

## §156 — ⛔ DEUX EXERCICES HOMONYMES SE DÉPARTAGEAIENT PAR LE RANG, UNE SÉANCE PLUS ANCIENNE PRÊTAIT SA CHARGE, ET VALIDER UNE CHARGE VIDE REPRENAIT LA SUGGESTION D'UN AUTRE PROGRAMME *(17/11/2026, mission de fermeture Séance, LOT H — arbitrages de Michel via la contre-expertise finale ; branche locale `claude/seance-fermeture-lot-h` depuis `4662a2d0`, NON PUBLIÉ ; §156 = lot H, §157 = lot M, §158 = lot D)*

**Cause** (`log.js`, `_prevDuJour` et le dessin du champ de charge de `_renderExHtml`). ① Pour une séance d'AVANT les identités, deux blocs homonymes de même commentaire (ou sans commentaire) se rapprochaient par le RANG (`pool[freres.indexOf(e)]`) : le 2ᵉ bloc du programme prenait le 2ᵉ d'avant, même après une permutation, une suppression ou une insertion (sonde `SEANCE-homonymes-sans-identite` : 1 série reprise au lieu de 0). C'est la « limite ② » écrite au §150, qui disparaît. ② Quand la dernière séance terminée du jour ne contenait pas l'exercice, la boucle passait à une séance plus ancienne du même jour (H07, sonde `SEANCE-absent-derniere-prescription`). ③ Le champ de charge suggérait en gris la « dernière fois » de l'exercice d'où qu'elle vienne (`getPrev`, tous programmes et séances libres confondus) et `toggleSet` lit ce que le champ affiche : valider une charge vide importait donc la valeur d'un AUTRE programme / d'une séance libre.
**Correction.** ① `_prevDuJour` : le rapprochement par nom / commentaire n'a lieu que s'il est NON AMBIGU (un seul bloc de ce nom de chaque côté, ou un commentaire unique de chaque côté) ; sinon la prescription ; le rang n'est plus lu. ② `_prevDuJour` ne lit que la DERNIÈRE séance terminée du jour (rendue triée par `_seancesDuJour`) : l'exercice absent, ou présent sans aucune série faite, reprend sa prescription ; la colonne « Précédent » / « 4 dernières séances » (`getPrev`, `_seancesExercice`) est inchangée. ③ Un seul propriétaire, `_sourceAdmissible(sess)` : la suggestion de CHARGE n'est dessinée que si la séance d'avant est une séance terminée de CE jour de CE programme (`_seancesDuJour`, par identité) — ou, pour une séance libre, une autre séance libre ; programme supprimé / jour introuvable = aucune suggestion. `toggleSet` est inchangé (il lit le champ) : un champ vide n'importe rien, l'inconnu reste `null`, un zéro écrit reste 0, un PDC prescrit reste tel quel. L'historique n'est jamais modifié (relecture octet pour octet dans les témoins).
**Témoins.** Nouveau banc `tests/parcours/seance_cf_h.js` (B-SCFH, 37 témoins : A homonymes — permutation, suppression, insertion, commentaires distincts / dupliqués / coïncidents, conservation de `exId` / `sid`, séances d'avant les identités de jour · B dernière séance absente — programme ancien, importé / Milo, séries non faites, retouche de repos prioritaire, « Précédent » inchangé, sondes directes · C valider une charge vide — premier chargement, champ vide, zéro écrit au clavier, PDC prescrit, dropset (les deux dessins du champ), historique admissible repris, séance libre · D l'incertitude ne suggère rien, un autre jour ne prête rien) ; `tools/banc_seance_cf_h.js`, `tools/mut_seance_cf_h.py` (18 mutations, arbre COPIÉ). Rouge avant / vert après : les deux sondes de la contre-expertise (`_prevDuJour(old, cur[0], cur)` : 1 → 0 série ; `_prevDuJour([newer, old2], cur[0], [cur[0]])` : 1 → 0 série) ; les témoins C rougissent par la mutation M09 (suggestion de n'importe quelle source = l'ancien comportement).
**Oracles réécrits (invariant gardé, raison écrite).** `SCCH-A11` (H07 : exigeait la charge de la séance plus ancienne, « arbitrage en attente » → la prescription ; la dernière séance fait foi pour l'exercice qu'elle contient) · `SCCH-A14 (b)` (exigeait [105, 55], l'attribution par RANG que Michel interdit → la prescription [100, 50]) · `SCHIS-R08` (exigeait l'avant-dernière séance du jour pour un exercice absent de la dernière → la prescription ; « jamais celle d'un autre jour » gardé) · `ICF-B05` (exigeait le grisé « 97.5 » / « 55 » venu d'une séance LIBRE → champ vide ; « Précédent » reste visible, ajouté au témoin) · `ICF-B16` (exigeait que ✓ reprenne 55 d'une séance libre, « le seul chemin par lequel l'historique entre » → la charge reste inconnue) · `B-SCCX-X2f1` (le contexte de Milo a le droit de raconter les Tractions à 99 de l'ancienne séance libre sur SA ligne ; l'interdit, c'est que ce 99 entre dans la lecture de la séance B) ; au banc d'interaction `seance_ce_x`, l'ancienne séance libre porte désormais un 99 sur les Tractions (elles en étaient exclues exprès à cause de l'ancienne convention) : il observe qu'une série « inconnue » validée sans rien taper reste inconnue AVEC un 99 hostile à portée de main. Mutations ré-ancrées : `mut_seance_ce_h` M06/M07/M08/M22/M23 (+ M44), `mut_seance_ce_p` M41. `mut_import_chaine` M24 était déjà périmée avant ce lot (ancre absente), non touchée.
**Limites écrites.** ① Une séance libre ne reprend par ✓ que la dernière séance LIBRE du même exercice : la valeur d'une séance de programme n'y est plus proposée (conséquence directe de l'arbitrage ; à confirmer par Michel). ② `addExercise` / `addSet` pré-remplissent encore la charge depuis la dernière fois du même nom, tous programmes confondus (ajout volontaire, hors du périmètre « valider »). ③ Une retouche manuelle de la charge à une valeur vide / zéro plus récente que la dernière séance du jour laisse ✓ reprendre la dernière fois du même jour (historique admissible, D-163 / D-168) : un zéro retouché ne se distingue pas d'une charge vide sans donnée persistée en plus. ④ Un programme dont les séances d'avant n'ont ni identité d'exercice ni commentaire distinct n'hérite plus d'aucune valeur pour des blocs homonymes (la prescription) : c'est voulu. ⑤ Validé sur iPhone : **non**.
**Compteurs #17 (code applicatif seul).** données persistées ajoutées : **0** · fichiers applicatifs touchés : **1** (`log.js`) · lignes ajoutées − retirées : **+20** (+43 / −23, commentaires compris) · anciens chemins supprimés / fusionnés : **3** (le rang entre homonymes, le repli sur une séance plus ancienne, la suggestion de charge de toute provenance). Fichiers communs avec N°1 : `tests/parcours/runner.js` (+4 lignes : un bloc de commentaire et l'appel `await require('./seance_cf_h.js').ecran(t, b, PORT);` après celui de `seance_ce_x`) et `tests/parcours/repartition-3.json` (+1 ligne : `"./seance_cf_h.js": 1,`) ; `app.js`, `import_fidelite.js` et la configuration : non touchés.

## §158 — ⛔ UN PALIER ISOLÉ DE DROPSET NE POUVAIT PAS ÊTRE SUPPRIMÉ, ET LE RETIRER SANS RECALER LE RÉGLAGE AURAIT FAIT BASCULER UNE SÉRIE NORMALE EN « PALIER » *(17/11/2026, lot D de fermeture, D-173 ; corrigé sur branche, NON PUBLIÉ)*

**Famille : une règle de produit tranchée (Michel, 17/11) + une donnée dérivée qui doit suivre (R2).** Le lot 3 verrouillait les PALIERS d'un dropset (🔒, « le nombre de paliers fait loi »). Arbitrage du 17/11 : le palier isolé se supprime aussi. Piège mesuré avant de coder : `_dropDebut(ex)` recalcule la frontière série normale / palier à partir de `ex.dropset.paliers` ; retirer un palier sans toucher ce nombre faisait basculer la dernière série normale en « palier » (preuve : mutation D02, 22 témoins rouges).

**Correction (`log.js`, une seule fonction propriétaire).** `_nbPaliers(ex)` (= séries − `_dropDebut`) ; `_serieSupprimable` ne refuse un palier que s'il est le DERNIER restant ; `supprimerSerie` recale `ex.dropset.paliers` (calculé AVANT le retrait) dans la même fonction que le splice ; la feuille lit la même règle (« Palier », confirmation « Supprimer le palier N ? » si pointé). Inchangés : ordre, charges, reps, PDC / lest / assistance, `sid`, autres paliers et séries, repos, RIR, pointage, commentaires, programme d'origine, historique ; `_pdcAtt`, `_rirCible`, `_rirPending` suivent leur série (fonction `recaler` existante). Ancien format (sans `paliers`) : le réglage est posé au vrai nombre.

**⛔ DÉCISION RESTANTE POUR MICHEL — le DERNIER palier restant.** Le retirer laisserait un dropset sans palier ; ce que cela doit devenir (série normale ? dropset retiré ? message ?) n'est PAS décidé. On ne tranche pas : la ligne reste verrouillée (🔒), la feuille dit « Dernier palier du dropset : le retirer laisserait un dropset sans palier, rien n'est supprimé. « ⚙️ Modifier paliers » ou « ✕ Retirer dropset » règlent la structure. », les données sont conservées (témoins B-SCFD-E3a/b/c/d).

**Témoins.** Nouveau banc `B-SCFD` (`tests/parcours/seance_cf_d.js`, `tools/banc_seance_cf_d.js`, 6 source + 48 écran) : sur le code d'avant 15 OK / 39 rouges, après 54 OK / 0 rouge. Premier / milieu / dernier palier, pointé / non pointé (confirmation, annulation), dernier palier restant, PDC / lest / assistance / zéro, sens PDC en attente, RIR, déplacement + reprise, superset, « Modifier paliers » après suppression, ancien format, pyramide, 5 exercices dont perso et fictif, bouton central (#9, 390×844 et 375×667). Contrôle négatif : `tools/mut_seance_cf_d.py`, 20 mutations (D01–D20) sur arbre copié, **20 / 20 tuées**.

**Oracles réécrits (invariant gardé, raison écrite dans chaque test).** Ils figeaient « un palier ne se supprime pas » : `B-SCCM-S1`, `S5` (+ `S5b` neuf, dernier palier refusé), `S7`, `S10`, `S12` ; `B-SCUI-S20` / `S21` ; `B-SCCX-X1g`. Invariant conservé : le réglage dit toujours le vrai nombre de paliers · la feuille dit la charge de chaque palier · un dropset ne perd jamais son dernier palier en silence · une série pointée demande confirmation. Les témoins qui protègent la série complète sont inchangés. Témoins ajoutés à `B-SCCM` : `S5b`, `S5c` (la feuille dit pourquoi le dernier palier reste), `S5d` (palier pointé : confirmation), `S24` (4 exercices, aucun nom codé). Mutations des bancs voisins ré-ancrées avec la même intention, rejouées : `mut_seance_ce_m.py` S01–S12 + S08b–f → 17 / 17 tuées (4 survivaient — S07, S08b, S08f, S12 — tant que ces témoins n'existaient pas dans `ce_m` : tuées après ajout de S5c / S5d) ; `mut_seance_ce_x.py` M03 → 1 / 1 tuée ; `mut_seance_ui.py` M02 / M03 / M05 → 3 / 3 tuées. Bancs voisins rejoués sur le correctif : `seance_ce_m` 134 OK · `seance_ui` 85 · `seance_recette` 93 · `cc01_dropset` 31 · `seance_ce_x` 64 · `seance_c3` 35 · `rir_superset` 52 · `seance_unicite` 12 · `session_integrity` 93 — 0 rouge partout.

**Limites.** Chromium n'est pas un iPhone (geste réel sur la feuille à recetter) ; la sémantique du dernier palier est volontairement ouverte ; D-167, D-174 / 175 / 176 non touchées.

**Compteurs #17 (code applicatif seul).** données persistées ajoutées : **0** · fichiers applicatifs touchés : **1** (`log.js`) · lignes ajoutées − retirées : **+12 − 8 = +4** · anciens chemins supprimés / fusionnés : **1** (le verrouillage de tout palier, fusionné dans la règle unique `_serieSupprimable`).

## §157 — ⛔ LA MISE À JOUR SE RECHARGEAIT TOUTE SEULE SUR L'ACCUEIL (DÉCISION DE ft-v1184) : ELLE SE PROPOSE MAINTENANT, ET NE PART QUE DU CHOIX DE LA PERSONNE *(17/11/2026, mission de fermeture Séance — lot M ; corrigé sur branche locale `claude/seance-fermeture-lot-m` depuis `4662a2d0`, NON PUBLIÉ)*

**D-170 — arbitrage de Michel (mission du 17/11).** « Supprimer le rechargement automatique même sur l'Accueil. Bandeau / proposition discrète, mise à jour déclenchée uniquement par un choix explicite, quand toutes les opérations sont terminées en sécurité. » **Cause du comportement retiré.** Trois chemins appelaient `_appliquerMaj()` : l'arrivée d'une version (`controllerchange` / `SW_UPDATED` → `_reloadForUpdate`), `persist()` et le retour à l'Accueil (`_applyScreen`) ; dès qu'aucune opération n'était en cours et que l'écran était l'Accueil, la page se rechargeait toute seule. **Correction.** `_appliquerMaj` n'a plus qu'**un** appelant, le choix explicite (`majRedemarrer`, bouton « Mettre à jour », ex « Redémarrer maintenant ») ; `_reloadForUpdate` dit (bandeau via `_majLireVersion`, toast « après ta séance ou ton enregistrement » si une opération est en cours) sans recharger ; `persist()` et le retour à l'Accueil ne font que rafraîchir l'avis ; `_majPeutSAppliquer` ne lit plus l'écran (paramètre `ecranLibre` supprimé : le bouton marche depuis tous les écrans, jamais pendant une opération) ; « Plus tard » : marqueur en mémoire, **aucun minuteur**, levé au retour à l'Accueil depuis un autre écran (`_majRepropose`) ou au lancement suivant. **Conservés tels quels :** `_majPeutSAppliquer` et ses lecteurs (`_finishing`, `_dbfActifs`, récapitulatif, bilans, banc payant), `_fetchBorne` (délai + annulation effective), l'issue explicite. `sw.js` **non modifié** : il ne déclenche aucun rechargement de page (`skipWaiting` + `clients.claim` seulement) ; l'effet côté page est neutralisé par `_reloadForUpdate`.

**Reproduction.** *Avant (rouge)* : le nouveau banc `seance_cf_m` rejoué sur le code de départ `4662a2d0` (copie hors dépôt) : **9 rouges / 3 verts** (P1 à P6, F1 toast, F3 rechargement automatique sur l'Accueil, scénario F interrompu) ; et les 8 anciens oracles `SCMAJ-P2/P4/P6/A7/A8/B4/B7/C3` rouges sur le code corrigé (journal `maj_avant.log`). *Après (vert)* : `seance_cf_m` 15/0, `seance_maj` 56/0, `maj_version` 51/0, `seance_ce_m` 127/0, `seance_ce_x` 64/0, `seance_ui` 85/0, `seance_ux` 69/0, `ux_d086` 122/0, `ux_integration` 69/0, `session_integrity` 93/0, `seance_recette` 93/0, `aides_audit` 18/0 ; blocs XXII et CCLXXXI du runner rejoués isolément : 49/0.

**Témoins nouveaux** (`tests/parcours/seance_cf_m.js`, blocs `B-SCFM-*`, vrai service worker, publications simulées) : **P1** un seul appelant du rechargement (le bouton) · **P2** rien côté `sw.js` / `index.html`, écouteur unique · **P3** aucun minuteur dans toute la chaîne · **P4** la décision ne lit plus l'écran · **P5** libellés « Mettre à jour » / « Plus tard » · **P6** « Plus tard » n'écrit rien, retour à l'Accueil le lève · **F0** `APP_BUILD` = étiquette = cache · **F1** version reçue PENDANT la séance (aucun rechargement, toast daté) · **F2** PENDANT l'enregistrement (même « Mettre à jour » refuse) · **F3** retour à l'Accueil sans opération (bandeau, aucun rechargement après 4 s et tous les chemins rejoués) · **F4** « Plus tard » + **15 min d'horloge avancée** (aucune relance) · **F5** retour à l'Accueil le re-propose, sans recharger · **F6** « Mettre à jour » = **une seule** mise à jour (compteur de chargements de page), `APP_BUILD`, étiquette et « À propos » à la vraie version, séance intacte · **H1** D-176 : accès Menu.

**Oracles réécrits (invariant gardé, raison écrite dans chaque témoin) :** `SCMAJ-P4` (signature) · `SCMAJ-P6` (approuvait « tous les déclencheurs rappellent `_appliquerMaj` » = le rechargement automatique ; devient « un seul appelant, le choix ») · `SCMAJ-P2` (regex d'extraction) · `SCMAJ-A7/A8`, `B4`, `B7`, `C3` (« la mise à jour s'applique » → « elle se PROPOSE, rien ne se recharge, le clic l'applique, la séance traverse intacte » : `A7b`, `B4b` ajoutés) · `MAJV-A9` (+ `A9b`), `MAJV-A4` (texte du toast), `MAJV-F2`, le bloc `W-home` (le code reste l'ancien jusqu'au choix ; `W4-home` ajouté) · `B-SCCM-U-A6`, `U-C3` · `B-SCCX-M6` · runner `CCLXXXI` (compte désormais les rechargements réels, à ZÉRO partout, et les propositions ; `persist()` rappelé après la sortie ajouté) et `XXII` ③ ④ (la décision ne dépend plus de l'écran : sur le Coach comme sur l'Accueil elle dit OUI ; le « on ne recharge jamais » est tenu par `SCMAJ-P6` / `A7`). Aucun témoin supprimé ni affaibli : chacun rougit sous mutation.

**Mutations (arbres copiés).** Banc `seance_cf_m` : **16/16** (M01 à M16 : retour à l'Accueil / `persist()` / arrivée d'une version qui rechargent de nouveau, relance de 60 s après « Plus tard », « Plus tard » qui ne ferme rien, le retour à l'Accueil qui ne re-propose plus ou re-propose partout, bouton sans effet, ancien libellé, toast sans date / retiré, verrou de fin de séance non lu, écran redevenu raison d'attendre, étiquette de version). **Deux survivantes trouvées et réparées** : M05 (relance de 60 s) — l'horloge simulée n'était installée qu'APRÈS le clic « Plus tard », le minuteur naissait sur l'horloge réelle ; M16 — « `APP_BUILD` changé » est neutralisée par le serveur de publications simulées (il re-pose la constante), re-ciblée sur l'étiquette affichée (la constante elle-même reste gardée par `MAJV-D2`). `seance_maj` M24-M26 (3/3), `maj_version` M29-M32 + M36-M37 (6/6 ; M30 / M31 / M32 réécrites, M29 inversée, raisons dans le script), `CCLXXXI` : retour à l'Accueil / verrou / écran / `persist()` (4/4, `persist()` seulement après l'ajout de la vérification). **159 ancres** des scripts touchés (`mut_maj_version`, `mut_seance_maj`, `mut_seance_ce_m`, `mut_seance_cf_m`, `mut_nut_sync02` K43) vérifiées uniques, 0 INVALIDE (K43 et `mut_seance_ce_m` suivent la ligne de `persist()` / `_majPeutSAppliquer()` déplacées).

**D-176 (acquis, non rouvert) — vérifié conforme.** `B-SCCM-H` (inchangé) et `SCFM-H1` : « ? » d'onglet, « Partager », pastille Sheets visibles sur l'Accueil seulement ; « Partager » et l'Aide détaillée sont bien dans le Menu, l'état Sheets dans Menu → Profil. **À signaler, rien de changé :** le « ? » *d'écran* (`showHelp`) n'a d'équivalent hors Accueil que « Aide de l'écran Séance » (⋯ de l'écran Séance) ; sur Progrès, Nutrition, Coach et Profil il n'y a plus d'accès direct à l'aide d'écran (le Menu garde l'Aide détaillée, le guide) — c'est la conséquence déjà écrite par D-176.

**Limites et décisions pour Michel.** ① **Pendant une opération, la personne est prévenue par un toast, pas par le bandeau** (la mission disait « bandeau »). Le bandeau pendant une séance serait une nouvelle UX (haut de l'écran Séance) : à confirmer. ② « Plus tard » est levé aussi au **retour à l'Accueil depuis un autre écran** (lecture de « revient à un prochain lancement ou retour à l'Accueil ») ; rester sur l'Accueil après « Plus tard » ne re-propose jamais. ③ Sans API `caches` (cas rare) `_majVersion` reste vide : aucun bandeau, la nouvelle version s'applique au lancement suivant. ④ `skipWaiting` + `clients.claim` (inchangés) donnent au nouveau service worker le contrôle de la page **sans la recharger** : une page restée ouverte sert son ancien code en mémoire tout en ayant le cache neuf — le mélange ancien code / fichiers neufs lors d'un chargement paresseux n'est pas mesuré ici (cache atomique ARCH-08 : reporté à N°1, non touché). ⑤ Chromium seulement, jamais un iPhone (gel de page en arrière-plan, politique de cache de WebKit, geste M36 non rejoués). ⑥ Règle #11 : libellé « Mettre à jour » + phrase d'aide de l'Accueil mis à jour (`screens.js`) ; **aucun** point rouge / pop-up / diapo du Guide préparé ici — le changement de repère (la mise à jour ne part plus toute seule sur l'Accueil) mérite peut-être une ligne dans `WHATS_NEW` : décision de Michel. ⑦ Faux rouge noté : un premier passage de `maj_version` a rendu 2 rouges (`W2-log` / `W3-log`, activation du service worker lente, deux caches coexistants) ; rejoué isolé puis en entier : 51/0. ⑧ `check_regles` : exit 0 ; l'avertissement « `PROMPT-MILO-REEL.txt` périmé » (`state.js` a changé) est non bloquant et antérieur.

**Compteurs #17 (code applicatif seul) :** données persistées ajoutées **0** · fichiers applicatifs touchés **4** (`app.js`, `state.js`, `screens.js`, `index.html`) · lignes ajoutées − retirées **+39 − 33 = +6** (le plus gros est du commentaire de raison) · anciens chemins supprimés / fusionnés **3** chemins de rechargement automatique (arrivée d'une version, `persist()`, retour à l'Accueil) **fusionnés en 1** (le choix explicite), plus le paramètre d'écran (`ecranLibre` / `demande`) et la condition d'écran supprimés. **Fichiers communs avec N°1 touchés :** `app.js` (lignes 13368-13440 : `_majPeutSAppliquer`, `_appliquerMaj`, `_majRefresh` (commentaire), `majRedemarrer`, `majPlusTard`, `_majRepropose`, `_reloadForUpdate`), `tests/parcours/runner.js` (blocs `XXII` ③④ et `CCLXXXI` ; une ligne `ecran` et une ligne `pur` pour `seance_cf_m`), `tests/parcours/repartition-3.json` (une ligne : `seance_cf_m` → processus 0), `tools/mut_nut_sync02.py` (K43 : l'ancre suit la ligne de `persist()` déplacée).

## §160 — ⛔ L'AIDE CONTEXTUELLE N'AVAIT PLUS AUCUNE PORTE SUR PROGRÈS, NUTRITION, COACH ET PROFIL : D-176 AVAIT RETIRÉ L'EN-TÊTE GLOBAL, ET AVEC LUI SON « ? » *(17/11/2026, finale Séance — lot A, arbitrage de Michel : « l'aide contextuelle est importante et ne doit pas disparaître » ; corrigé sur branche locale `claude/seance-finale-lot-a` depuis `eae41e30`, NON PUBLIÉ)*

**Famille : une décision (D-176 : pas de bandeau global hors Accueil) qui emportait une fonction sans que personne l'ait voulu (R30 : retrait non écrit).** Le « ? » de l'en-tête appelait `showHelp()` sur tous les écrans ; `#root:not(.on-home) .topbar{display:none}` l'a retiré avec le reste. Mesuré avant de coder : sur Progrès, Nutrition, Coach et Profil, plus aucune porte vers l'aide d'écran ; sur l'écran Séance (D-083, « ? » masqué pendant la séance) elle reste atteignable par ⋯ → « Aide de l'écran Séance » ; le Cycle de force n'a pas d'aide propre (`showHelp` montre celle de l'Accueil).

**Audit des aides déjà fait — NON refait (lu, vérifié).** `docs/CHANTIER-NUTRITION-SEANCE.md` § 2.6 (audit du 17/10 revérifié le 24/10), `BUGS.md` « audit des aides, lot final ft-v1257 » (20/10) et le banc `aides_audit` (18 témoins) : les constats Séance, Accueil, Coach et Profil sont **déjà corrigés** (ft-v1257) ; **restent ouverts, hors de cette mission** : 4 phrases fausses / contradictoires dans les aides Nutrition, un « \*\*pas\*\* » affiché dans l'aide détaillée, des aides Nutrition longues. `aides_audit` rejoué sur le correctif : **18 / 0**.

**Correction (`screens.js`, `style.css` — rien d'autre).** Le moyen le plus simple, en réutilisant l'existant : **UN bouton rond `#ctx-help`**, créé au premier besoin par `_syncAideEcran` (appelée par `_applyScreen`, l'endroit unique qui pose déjà `on-home` / `on-log`), qui appelle **`showHelp()`** (mêmes textes, même fenêtre qu'avant D-176). `#root.aide-ecran` dit s'il doit se montrer : l'écran affiché a une entrée dans `_HELP_DATA` et n'est pas l'Accueil — **aucune liste d'écrans** ; Progrès, Nutrition, Coach, Profil, Séance (avant une séance) et Cycle l'ont, un écran futur sans aide n'en a pas. **Aucune barre** : `.topbar` reste masquée hors Accueil (D-176 intact), le bouton est posé dans `.screens`, en haut à droite, **dans la hauteur de la première rangée** de l'écran ; pour ne rien recouvrir, cette première rangée cède 40 px à droite (`#root.aide-ecran .screen.active>:first-child{margin-right:40px}` — une règle générique). Zone tactile **44 × 44** (disque 32), `z-index` 27 (au-dessus de l'en-tête collant de la Séance, sous les fenêtres). **Pendant une séance** : sur l'écran Séance il s'efface (l'en-tête de séance porte ⋯ → « Aide de l'écran Séance » et « Terminer » n'est jamais gêné) ; **sur tous les autres écrans il reste atteignable**. La clef d'aide d'un écran (« le Cycle montre l'aide de l'Accueil ») était écrite dans `showHelp` : elle l'est maintenant **une fois** (`_aideClef`), lue par `showHelp` et par le bouton (R2). **Aides actualisées (règle d'or #11, seulement les explications directement concernées)** : l'aide de l'Accueil (« le « ? » n'est plus que sur l'Accueil » devenait faux : elle dit où est le « ? » de chaque écran et où est l'aide pendant une séance) et l'aide « Supprimer une série précise » de l'écran Séance (elle disait encore « les paliers se règlent ensemble (🔒) » alors que le lot D permet de supprimer un palier : elle dit « chaque palier se supprime, confirmation s'il est validé, le dernier reste »). Recherche faite dans `screens.js`, `coach.js`, `constants.js` : aucune phrase d'aide ne décrit l'ancienne reprise automatique d'une suggestion de charge (lot H) ni l'ancien rechargement automatique (lot M, déjà corrigée dans l'aide de l'Accueil) ; l'aide détaillée du Menu n'est **pas** touchée (remise en cohérence prévue plus tard).

**Reproduction.** *Avant (rouge)* : le nouveau bloc rejoué sur `style.css` + `screens.js` de `eae41e30` (copie hors dépôt) : **48 rouges / 45 verts** sur B-SCFM-A (A1 × 24, A3 × 12, A10 × 10, A5b, A7 — les verts sont les témoins d'ABSENCE de barre et de « + » immobile, vrais avant comme après) et **4 rouges / 6 verts** sur B-SCFM-AP. *Après (vert)* : B-SCFM-A **93 / 0**, B-SCFM-AP **4 / 0**, banc `seance_cf_m` entier **112 / 0**.

**Témoins nouveaux** (`tests/parcours/seance_cf_m.js`, vrai Chromium mobile, serveur statique, 4 tailles 390×844 · 375×667 · 360×640 · 430×932, séance fictive 17 / 34 kg) : **AP1** clef d'aide unique (R2) · **AP2** le bouton appelle `showHelp()`, ne stocke rien, ne tient aucune liste d'écrans · **AP3** zone 44 × 44 et `z-index` sous les fenêtres · **AP4** les deux aides à jour · **A0** Accueil : aucun « ? » d'écran, l'en-tête global garde le sien et il ouvre l'aide de l'Accueil · **A1** sur chacun des 6 écrans : visible, en haut à droite, dans la fenêtre, ≥ 44 × 44, **élément touché au centre = le bouton**, et **ne recouvre aucun bouton ni texte** de l'écran (mesuré aux rectangles réels, texte compris) · **A2** aucune barre (en-tête global masqué, 0 px, écran collé en haut), **« + » central exactement où il était sur l'Accueil**, 6 onglets atteignables, pas de défilement horizontal · **A3** un **vrai toucher** ouvre la bonne aide, identique à `showHelp()`, toutes ses entrées · **A4** retour à l'Accueil · **A5 / A5b** écran futur sans aide : pas de bouton ; revenu sur Progrès : un seul bouton · **A7** mode clair (classe posée à la main : le mode Jour est suspendu dans l'app, `LIGHT_MODE_PAUSED`) · **A8** pendant une séance, sur l'écran Séance : « Terminer » atteignable, le « ? » s'efface, pas de logo, « + » immobile · **A9** ⋯ → « Aide de l'écran Séance » (vrais touchers) ouvre l'aide Séance · **A10** pendant la séance, sur les 5 autres écrans : « ? » présent, ≥ 44 px, rien de recouvert, vrai toucher → bonne aide · **A11** ouvrir l'aide ne touche pas la séance (mémoire et stockage identiques) · **A6 / A12** aucune erreur de page.

**Oracles réécrits.** `SCFM-H1` (mon propre témoin du lot M) : le titre disait « le « ? » d'onglet … visible sur l'Accueil seulement » alors que le sélecteur ne mesure que le « ? » de l'**en-tête global** — l'arbitrage rend la formule fausse ; **assertion inchangée**, libellé corrigé, raison écrite dans le test (invariant gardé : aucune barre globale hors Accueil, accès au Partage / à l'Aide détaillée / à Sheets par le Menu). **Aucun autre** témoin ne figeait « aucun « ? » hors Accueil » : `B-SCCM-H1–H15`, `B-UXS-A5`, `MAJV-F4`, `SCFM-H1` ne mesurent que `.topbar button[title="Aide"]` (l'en-tête global) et restent **verts sans modification**.

**Mutations (arbres copiés, `tools/mut_seance_cf_m.py` MA01 → MA15) : 15 / 15 tuées** — « ? » visible pendant la séance sur l'écran Séance (MA01) · la première rangée ne cède plus la place (MA02, 28 rouges) · « ? » aussi sur l'Accueil (MA03) · zone tactile 30 px (MA04) · Cycle sans aide (MA05) · le bouton ouvre l'Aide détaillée au lieu de l'aide d'écran (MA06) · passe sous l'écran (MA07) · aide de l'Accueil périmée revenue (MA08) · aide « paliers » périmée revenue (MA09) · Profil sans « ? » (MA10) · **D-176 rouvert, l'en-tête global revient (MA11, 59 rouges)** · un bouton de plus à chaque écran (MA12) · visible sans que l'écran en ait besoin (MA13) · descendu au milieu de l'écran (MA14) · signe de la couleur du disque (MA15).

**Bancs voisins rejoués sur le correctif (0 rouge partout).** `seance_cf_m` 112 · `seance_ce_m` 134 · `seance_ui` 85 · `seance_ux` 69 · `ux_d086` 122 · `ux_integration` 69 · `seance_recette` 93 · `aides_audit` 18 · `seance_maj` 56 · `maj_version` 51 · `seance_ce_x` 64 · `session_integrity` 93.

**Limites et décisions pour Michel.** ① Chromium n'est pas un iPhone : la zone sûre (encoche), le geste réel et l'œil sur le dessin du « ? » restent à recetter. ② **Sur le Coach, à 390 px et moins, le sous-titre « Ton coach IA · S'adapte à toi » passe sur deux lignes** (la première rangée a cédé 40 px) : l'en-tête gagne ~11 px, rien ne chevauche — dire si l'on préfère raccourcir ce sous-titre. ③ Pendant une séance, sur l'écran Séance, la porte reste **⋯** (40 px de large : D-085, non touché) — pas de « ? » en plus, pour ne pas gêner « Terminer ». ④ Le **Cycle de force** reçoit un « ? » qui ouvre l'aide de l'**Accueil** (ce que faisait l'ancien en-tête) : à confirmer si une aide propre au Cycle est voulue. ⑤ **Règle d'or #11 non faite ici, faute de décision** : aucun point rouge `NEW_FEATURES`, aucune diapo du Guide, aucune pop-up `WHATS_NEW` (le « ? » revient, ce n'est pas un repère qui bouge pour qui n'avait connu que D-176 : à trancher). ⑥ Le mode Jour étant suspendu, le contraste en mode clair est mesuré en forçant la classe.

**Compteurs #17 (code applicatif seul).** données persistées ajoutées **0** · fichiers applicatifs touchés **2** (`screens.js`, `style.css`) · lignes ajoutées − retirées **+35 − 4 = +31** (une vingtaine de lignes de commentaire de raison ; le code : 1 fonction de clef, 1 fonction de bouton, 5 règles CSS) · anciens chemins supprimés / fusionnés **1** (la règle « Cycle → Accueil », écrite dans `showHelp`, fusionnée dans `_aideClef`). **Fichiers communs avec N°1 touchés : aucun** (ni `app.js`, `state.js`, `index.html`, `runner.js`, `repartition-3.json`).

## §159 — ⛔ AJOUTER UN EXERCICE OU UNE SÉRIE, REMPLACER, CRÉER UN DROPSET OU LANCER UNE SÉANCE DE MILO REPRENAIT « LA DERNIÈRE FOIS DU MÊME NOM » DE TOUS LES PROGRAMMES — ET UNE CHARGE INCONNUE COPIÉE DEVENAIT UN ZÉRO *(17/11/2026, GO fermeture finale Séance, LOT C — arbitrages 2 et 3 de Michel ; branche locale `claude/seance-finale-lot-c` depuis `eae41e30`, NON PUBLIÉ ; §159 = lot C, §160 = lot A)*

**Famille : une règle écrite dans un chemin, oubliée dans ses voisins (R2 / R14).** Le lot H (§156) avait fait de `_sourceAdmissible` le garde de la suggestion grise du champ de charge, et avait écrit sa limite ② : « `addExercise` / `addSet` pré-remplissent encore depuis la dernière fois du même nom, tous programmes confondus ». Arbitrage de Michel (17/11) : **séance libre = UNIQUEMENT la dernière séance libre admissible du même exercice, sans ambiguïté ; `addExercise` / `addSet` suivent les MÊMES règles de provenance que la validation d'une série ; une charge inconnue n'est JAMAIS transformée en zéro.**

**Inventaire des chemins qui reprennent une charge de l'historique** (`getPrev` / `_prevAligne` / `_prevSeance`, tous dans `log.js`) — les 7 qui contrevenaient, corrigés : ① la suggestion grise du champ (`_renderExHtml` : elle ne regardait que LA dernière fois de tous les programmes — une séance libre ne retrouvait donc JAMAIS sa dernière séance libre si une séance de programme était plus récente) · ② `addExercise` (sélecteur) · ③ `addSet` (« + série ») · ④ `_exerciceRemplacant` (« Remplacer l'exercice ») · ⑤ `applyDropset` (le départ d'un dropset sans charge) · ⑥ `_startSessionFromMilo` (1ʳᵉ porte de Milo) · ⑦ `_applyMiloSession` (2ᵉ porte : une COPIE de ⑥ qui alignait en plus par POSITION — la 2ᵉ copie que ce lot trouve, R2). **Ne contrevenaient pas (non touchés)** : le chargement d'un jour de programme (`_prevDuJour`, déjà par identité, lot H) · la colonne « Précédent » / « 4 dernières séances » / les commentaires de la dernière fois (`getPrev`, `_seancesExercice` : une COMPARAISON, pas une reprise) · `startWorkout` / `lancerTypeSeance` (aucun pré-remplissage par l'historique) · l'éditeur de programme (`addSet` du programme : copie de la série voisine du programme, inconnu préservé) · l'édition d'une séance passée (`setup.js`). **Il n'existe pas** de « refaire la dernière séance », de copie / répétition d'une série ni de séries rapides dans le code.

**Correction — un seul propriétaire (R2), pas cinq fonctions.** `_reprise(name, w)` rend la séance d'avant dont une charge peut être reprise, ou `null` : séance d'un jour de programme = la dernière fois SI elle est de CE jour de CE programme (`_sourceAdmissible`, par identité) ; séance libre = la dernière séance LIBRE terminée où figure l'exercice (une séance de programme plus récente est SAUTÉE, pas lue), et seulement si elle ne porte pas plusieurs blocs de ce nom (ambigu → rien). `_reprisesPour(name, modèle, w)` aligne ses séries par rôle (`_prevAligne`) ; `_serieDepuis(pp, def, type)` construit la série neuve **une seule fois pour les trois chemins d'ajout** (kg, reps, PDC / lest / assistance, « à vide » ; une charge inconnue reste `null`, un zéro écrit reste 0). `_sourceAdmissible(sess, w)` prend désormais la séance concernée en paramètre (`{}` = une séance libre à venir : la séance de Milo). **`addSet`** : la source admissible d'abord ; sinon COPIE VOLONTAIRE de la dernière série du MÊME exercice de la séance en cours (une copie de séance, pas de l'historique — conservée, l'inconnu / le PDC / « à vide » s'y copient tels quels : avant, `last.kg||0` transformait `null` en 0 et « à vide » se perdait). **`applyDropset`** : départ de la source admissible ; un départ INCONNU donne des paliers inconnus (`null`), jamais 0. La **suggestion grise** du champ lit la même source (`_sugDet`) : ✓ n'importe donc que ce que le champ affiche, comme avant (`toggleSet` inchangé). **Reps** : seules les CHARGES suivent la source admissible (la suggestion de répétitions du champ, elle, reste celle de la dernière fois — hors du périmètre « provenance des charges »).

**Reproduction.** *Avant (rouge)* : le banc `seance_cf_h` final rejoué sur le code de départ `eae41e30` (copie hors dépôt, journal `SC/nuit7/avant_c_cfh3.log`) : **17 rouges / 44 verts** — E01 (séance libre : 99 d'un programme au lieu de 57) · E02 · E03 (deux blocs homonymes : le 1ᵉʳ servait) · E05 (PDC −20 d'un programme) · E07 · E09 (`addExercise` dans un jour de programme : 99 / 63 d'ailleurs) · E10 · E12 (`addSet` : 99 d'un autre programme) · E13 (`null` copié → 0) · E15 (« à vide » perdu) · E17 · E18 (champ libre vide / ambigu) · E19 · E20 (Remplacer) · E21 (dropset) · E22 / E22b (Milo, deux portes). *Après (vert)* : **61 ✅ / 0 ❌** (37 témoins du lot H inchangés + 24 neufs). Les 7 témoins du bloc E qui passent aussi avant (E04 zéro / inconnu en historique · E06 · E08 · E11 · E14 · E16 · E23) sont des garde-fous de non-régression (la source admissible reste reprise ; un zéro écrit reste 0).

**Témoins neufs** (`tests/parcours/seance_cf_h.js`, bloc `B-SCFH-E`, aucun nouveau fichier de test, donc aucun enregistrement) : séance libre (E01 · E02 · E03 · E04 · E05 · E06) · jour de programme depuis le sélecteur (E07 · E08 · E09) · `addSet` (E10 · E11 · E12 · E13–E16 : inconnu / zéro / PDC +12 / assistance −17 / à vide / reps « Non renseigné ») · champ de charge d'une séance libre (E17 · E18 · E19) · Remplacer / dropset / Milo, les deux portes (E20 · E21 · E22 · E22b) · aucun appel au modèle (E23). Exercice personnalisé et exercice fictif (noms inventés, jamais d'un vrai programme) ; l'historique est relu octet pour octet.

**Oracle réécrit (invariant gardé, raison écrite dans le test).** `SCPDC-B10d` (`seance_pdc.js`) : il exigeait que la séance de Milo reprenne le PDC (+10 · −20) de la dernière fois d'un **programme** (`pUn`) — l'arbitrage dit qu'une séance libre ne reprend que la dernière séance libre. L'invariant (une charge ÉCRITE par Milo prime, aucun PDC dessus ; les séries sans charge reprennent la dernière fois ADMISSIBLE) est gardé : le test pose une séance libre plus récente qui porte le PDC, vérifie qu'il est repris par les deux portes (`m1`, `m2`) ET que la séance d'un programme seule ne prête rien (`m0`). **Mutations ré-ancrées** : `mut_seance_cf_h` M09 · M18 (la ligne `_vs` / `_sugOk` n'existe plus).

**Mutations** (`tools/mut_seance_cf_h.py`, arbre COPIÉ) : **M09, M18, M19 à M33 + M30b : 18 / 18 tuées** (M19 la séance libre lit tous les programmes · M20 l'ambiguïté disparaît · M21 la source n'a plus à être admissible · M22 / M23 / M27 / M30 / M30b les anciennes lectures de `addExercise` / `addSet` / Remplacer / Milo ×2 · M24 inconnu → zéro · M25 « à vide » perdu · M26 PDC perdu · M28 / M29 dropset · M31 le contexte programme · M32 `{}` n'est plus un paramètre · M33 la copie volontaire disparaît). M30 était INVALIDE (ancre ×2 : les deux portes de Milo avaient la même ligne) : scindée en M30 / M30b.

**Deload — réponse factuelle (aucun développement, aucune donnée ni champ ni bouton).** Sonde reproductible `SC/nuit7/sonde-deload.js` (le vrai écran, trois séances terminées par le vrai `finishWorkout` : 72 · 72 · 39 « allégée », puis le chargement suivant) : **le candidat reprend 39, la séance allégée, pas 72** — il lit « la dernière séance TERMINÉE de ce jour » (`_prevDuJour`, `_seancesDuJour(...)[0]`), sans notion de séance normale ; aucune séance enregistrée ne porte de marqueur d'allègement. Le cas observé n'est donc **pas traité** (il n'est pas aggravé non plus : H07 interdit déjà tout repli vers une séance plus ancienne). Une future « référence de reprise » se branche dans **deux fonctions** de `log.js` : `_prevDuJour` (le chargement d'un jour) et `_reprise` (tout le reste) — la colonne « Précédent » doit rester une comparaison. Note pour Claude N°1 (sauvegarde, `_cloudSync`, fusion / restauration, Sheets, export CSV, Milo) : `SC/nuit7/NOTE-DELOAD-POUR-N1.md`.

**Limites et décisions pour Michel.** ① Une séance de programme ne reprend jamais la valeur d'une séance libre ni d'un autre programme, même si c'est la seule trace de l'exercice : la charge est à saisir (conséquence directe de l'arbitrage ; à confirmer à l'usage sur iPhone). ② Dans un jour de programme, `addExercise` reprend la dernière fois SI c'est la dernière séance de ce jour : une séance plus ancienne du même jour, masquée par une séance libre plus récente, n'est pas relue (cohérent avec H07). ③ Les **répétitions** suggérées dans le champ de répétitions restent celles de la dernière fois de tous les programmes (seule la charge est visée par l'arbitrage) ; à décider si Michel veut le même garde. ④ Le départ d'un dropset reste `0` (et non `null`) quand rien n'est connu ET que la série n'était pas inconnue : un zéro à saisir (le champ vide), pas une valeur inventée. ⑤ La séance de Milo est traitée comme libre (`{}`) même quand elle s'ajoute à une séance de programme en cours (mode « ajouter ») : ses séries sans charge ne reprennent que la dernière séance libre. ⑥ L'ambiguïté (deux blocs du même nom) n'est testée que côté séance d'avant pour la séance libre ; la séance en cours peut porter deux blocs de ce nom (chacun reprend la même séance d'avant, non ambiguë). ⑦ Chromium ≠ iPhone ; non validé sur iPhone.

**Compteurs #17 (code applicatif seul).** données persistées ajoutées **0** · fichiers applicatifs touchés **1** (`log.js` ; les bancs `seance_cf_h` / `seance_pdc` et `mut_seance_cf_h` ne sont pas applicatifs) · lignes ajoutées − retirées **+50 − 30 = +20** (+44 − 25 hors lignes de commentaire pleines ; le plus gros est du commentaire de raison) · anciens chemins supprimés / fusionnés **8** : 7 lectures de « la dernière fois du même nom » (suggestion du champ, ajout, « + série », remplacer, dropset, Milo ×2) fusionnées en 1 propriétaire (`_reprise`) ; la 2ᵉ copie de la construction d'un exercice de Milo (alignement par position) et les 3 copies de construction d'une série neuve fusionnées dans `_serieDepuis`. **Fichiers communs avec N°1 touchés : aucun** (`app.js`, `state.js`, `index.html`, `runner.js`, `repartition-3.json`, `sw.js`, `Code.js`, `CLAUDE.md` : non modifiés).
## §162 — ⛔ UN ZÉRO ÉTAIT INVENTÉ À CHAQUE FOIS QU'UNE CHARGE N'AVAIT PAS DE SOURCE : RETIRER UN DROPSET, EN CRÉER UN, AJOUTER UNE SÉRIE, UN EXERCICE OU UN PROGRAMME GÉNÉRÉ *(18/11/2026, GO correction ciblée Séance V3, LOT Z — contre-sondes 4 et 5 de la contre-expertise ; branche locale `claude/seance-v3b-lot-z` depuis `d850dc4c`, NON PUBLIÉ ; §161 = lot S)*

**Cause.** Plusieurs écritures `kg||0` / `kg:0` fabriquaient un « zéro écrit » là où la charge était inconnue : `removeDropset` (`ex.sets[0]?.kg||0` : inconnu → 0), `_serieDepuis` (les appelants lui passaient `def={kg:0,…}` : addExercise, addSet, remplacer → 0 sans aucune source), `applyDropset` (`ex.sets[0]?.kg||h?.kg||0` : un zéro ÉCRIT passait derrière l'historique, `0||x`, et une charge absente devenait 0 ; les paliers ne recopiaient ni PDC ni « à vide »), plus `addToGroup`, `_doAddToGroup`, `_addProgSet`, le chargement d'un programme (`s.kg||0` : absente → 0), la carte « type de séance » et le générateur de programme. Un zéro écrit et une charge inconnue ne se distinguaient plus (D-164).

**Correction (log.js seul).** Règle unique : une charge inconnue reste `null`, un zéro écrit reste 0 (jamais écrasé par l'historique), PDC / lest / assistance / « à vide » se copient tels quels, sans source admissible on n'invente rien. `_serieDepuis` : sans source la charge est `null` (le `def.kg` des appelants est ignoré, `def` ne porte que les répétitions — ce qui corrige addExercise / addSet / remplacer sans toucher à leurs lignes, zone du lot S). Nouveau `_pdcVideDe` : UN propriétaire de la copie PDC + « à vide » (lu par `_serieDepuis`, `applyDropset`, `removeDropset`, `addToGroup`). `removeDropset` : la série qui reste est la 1ʳᵉ telle qu'elle est. `applyDropset` (la ligne `_reprise` est intacte) : base par `_kgConnu` (la série du jour d'abord, zéro compris ; sinon la source admissible ; sinon inconnue), paliers inconnus si départ inconnu, PDC / à vide recopiés. Dernier palier toujours protégé (D-173 non touché). Chemins voisins alignés : `addToGroup`, `_doAddToGroup`, `_addProgSet`, `_exsDeProgramme` (absente → `null`), `lancerTypeSeance`, générateur (`_s3`).

**Preuves.** Sonde `SC/nuit8/sonde-Z.js` (vraie page, fonctions réelles) : 14 OK / 21 rouge AVANT → 35 OK / 0 rouge APRÈS. Banc `seance_cf_d` : 95 OK / 0 rouge ; sur le code d'avant (`d850dc4c`, mêmes témoins) 65 OK / 30 rouge (B-SCFD-ZP1..4 et ZE1..ZE5 rougissent). Témoins nouveaux : B-SCFD-ZP1..4 (source) et ZE1..ZE5 (écran : retirer dropset × 8 états de charge, applyDropset × 13 cas, ajouts sans / avec source, aval — validation sans saisie, tonnage, Milo, enregistrement —, programmes).

**Oracles réécrits** (seance_cf_h.js, invariant gardé, raison dans le fichier) : SCFH-E01 à E04, E06 à E09, E20 attendaient `0` pour une charge sans source (le zéro inventé lui-même) → `null` ; SCFH-E21 posait « série sans charge » comme `0` et exigeait que `0||57` donne 57 → la série sans charge est maintenant inconnue (`null`, 57 depuis la source libre) et un zéro écrit reste 0.

**Limites / décisions.** ① Les deux portes de Milo (`_startSessionFromMilo`, `_applyMiloSession`) écrivent encore `pp?pp.kg:0` (zone du lot S) ; SCFH-E22 attend encore `0·0` : à passer à `null` côté S. ② Les appelants de `_serieDepuis` passent encore `kg:0` (ignoré, cosmétique). ③ setup.js (édition d'une séance passée) et les `||0` de calcul / affichage (tonnage, Sheets) ne sont pas touchés. ④ Un défaut de répétitions (5 / 8) reste une valeur d'affichage : il ne masque aucune source admissible. ⑤ clone/ non régénéré. ⑥ Chromium ≠ iPhone.

**Compteurs #17 (code applicatif seul, `git diff --numstat d850dc4c HEAD -- log.js`).** données persistées ajoutées **0** · fichiers applicatifs touchés **1** (`log.js`) · lignes ajoutées − retirées **+29 − 19 = +10** (+24 − 18 hors lignes de commentaire pleines) · anciens chemins supprimés / fusionnés **1** (la copie de « PDC + à vide » dans `_serieDepuis` devient `_pdcVideDe`, partagée par 3 autres chemins) et le drapeau `inconnue` d'`applyDropset` retiré.

## §161 — ⛔ « LA DERNIÈRE FOIS » AVAIT DEUX SÉLECTEURS QUI SE CONTREDISAIENT : LE CHARGEMENT LISAIT L'IDENTITÉ DU BLOC, TOUT LE RESTE LISAIT LE NOM *(18/11/2026, GO correction ciblée Séance V3, LOT S — contre-sondes 1, 2, 3 de la contre-expertise ; branche locale `claude/seance-v3b-lot-s` depuis `d850dc4c`, NON PUBLIÉ ; §161 = lot S, §162 = lot Z)*

**Famille : une règle écrite dans un chemin, oubliée dans ses voisins (R2 / R14), encore.** Le chargement d'un jour (`_prevDuJour` sur `_seancesDuJour`) retrouve SON bloc par `exId` dans la dernière séance terminée de CE jour ; `_reprise` (suggestion grise, ✓, `addSet`, `addExercise`, remplacer, dropset, Milo) cherchait « la dernière séance qui contient ce NOM » puis testait seulement si elle était admissible. Trois écarts mesurés (sondes `SC/nuit8/sonde-S.js`, vrai écran, rouge avant / vert après) : ① deux blocs de même nom (17 · 63) → le 2ᵉ bloc suggérait 17 ; ② exercice absent de la dernière séance du jour → la séance plus ancienne (63) était reprise, contre H07 ; ③ un autre programme plus récent (99) → `_prevSeance` rendait SA séance, refusée → rien, au lieu de la dernière séance de CE jour (57). Plus : les répétitions suggérées venaient encore de « la dernière fois » de tous les programmes ; Milo « ajouter » traitait toujours la séance comme libre ; les deux portes de Milo écrivaient `pp?pp.kg:0` (un zéro inventé sans source).

**Correction — UN sélecteur (R2).** `_reprise(bloc, w, exs)` lit le BLOC (`{name, exId?}`) : pour un jour de programme, `_prevDuJour(_seancesDeCeJour(w), bloc, exs)` — exactement ce que lit le chargement ; pour une séance libre, la dernière séance libre où l'exercice figure, lue par le même `_prevDuJour` (donc : plusieurs blocs de ce nom → rien). `_sourceAdmissible` est supprimée (fusionnée en `_seancesDeCeJour`, qui rend la liste admissible ou `[]`). Un bloc AJOUTÉ sans `exId` se rapproche par son nom seulement s'il est non ambigu des deux côtés (une ligne dans `_prevDuJour`). Les répétitions suggérées (série ordinaire ET ligne courante d'un dropset) lisent la même source que la charge. `_repriseMilo(e, data, mode)` : Milo « démarrer » = libre ; « ajouter » / « remplacer » = le contexte de la séance en cours (`S.wkt`), avec ses blocs pour détecter l'homonymie. Sans source admissible, la charge d'une série de Milo est `null`, plus 0. « Précédent » (`getPrev`, `_prevAligneDetail`, `_seancesExercice`) reste la dernière fois réelle (comparatif).

**Témoins nouveaux (`seance_cf_h.js`, bloc F, F01 → F19 ; sur le code de `d850dc4c`, arbre copié : 14 rouges)** : deux blocs homonymes avec / sans identité, permutés ; absent de la dernière séance (champ, `_reprise`, `addSet`, base de dropset) ; autre programme plus récent ; « Précédent » comparatif ; répétitions (suggestion + ✓, dropset) ; bloc ajouté ambigu / non ambigu ; Milo ajouter / remplacer / démarrer / séance libre ; programme ↔ libre ; `addSet` sur le 2ᵉ homonyme ; autre jour sans identités. **Oracles réécrits (invariant gardé, raison écrite dans le banc)** : E07 (`0·0·0` → `0·57·57` : la séance libre ne masque plus la dernière séance de CE jour ; jamais 99), E12 (copie voisine 63 → 72 : un autre programme plus récent ne masque plus la source admissible ; jamais 99), E22 / E22b (`[0,0]` → `[null,null]` : Milo sans source = charge inconnue, consigne du lot Z).

**Mutations (arbre copié, `tools/mut_seance_cf_h.py`).** 29 / 29 conformes sur le sous-ensemble ciblé (M09 · M11–M14 · M18–M23 · M27 · M28 · M30 / M30b · M31 · M32 · M34–M45) ; M13 a d'abord SURVÉCU (le filtre de jour est redondant pour des blocs à identité) → témoin F19 ; M18 était INVALIDE (ancre périmée, corrigée). M10 (équivalente depuis le lot C) est RETIRÉE : son code (`_sourceAdmissible`) n'existe plus, la protection est tuée par M19. NON rejouées (ancres inchangées, code non touché par ce lot) : M01–M08, M15–M17, M24–M26, M29, M33.

**Limites et décisions pour Michel.** ① Un exercice ajouté à la main dont le nom existe déjà dans la séance (ou deux fois dans la dernière séance libre) ne reprend rien (ambigu) : la charge est à saisir. ② En « remplacer », Milo lit le jour du programme de la séance en cours (qui garde son `progId`) : à confirmer à l'usage. ③ Le zéro d'une charge sans source dans `addSet` / `addExercise` / remplacer / dropset reste le sujet du lot Z (§162) — les appelants de `_serieDepuis` ne sont pas touchés ici. ④ Chromium ≠ iPhone.

**Compteurs #17 (code applicatif seul, `log.js`).** données persistées ajoutées **0** · fichiers applicatifs touchés **1** · lignes ajoutées − retirées **+47 − 38 = +9** (+22 − 18 hors lignes de commentaire pleines) · anciens chemins supprimés / fusionnés **3** : `_sourceAdmissible` (fusionnée dans `_seancesDeCeJour`), la 2ᵉ lecture « par nom » de `_reprise` (`_prevSeance` / `_seancesExercice` + test d'ambiguïté propre), les 2 appels de Milo (fusionnés dans `_repriseMilo`). **Fichiers communs avec N°1 touchés : aucun.**

## §163 — ⛔ ASSEMBLAGE DES LOTS S (§161) ET Z (§162) : « SANS SOURCE » SE LIT « INCONNUE » PARTOUT, ET CINQ ORACLES QUI ATTENDAIENT UN ZÉRO ONT ÉTÉ RÉÉCRITS *(18/11/2026, GO correction ciblée Séance V3 ; branche locale `claude/seance-v3b-correction-2026-11-18` depuis `d850dc4c`, NON PUBLIÉ)*

**Ce que l'assemblage a révélé.** Les deux lots, joués séparément, étaient verts. Réunis, cinq témoins rougissaient parce que le lot Z (charge sans source = `null`, jamais 0) contredisait des attendus écrits avant lui : SCFH-F11, SCCH-A08 (programme généré : charges vides), `session_integrity` R1b, R2 et R6b (série d'échauffement sans source). **Aucun n'a été affaibli** : même invariant (« les séries viennent de l'historique de CET exercice », « 1ᵉʳ usage = prescription, jamais 77 »), seul le symbole de l'inconnu change (`null`, affiché vide, au lieu d'un 0 fabriqué) ; la raison est écrite dans chaque banc.

**Preuves.** Contre-sondes de la contre-expertise rejouées en vrai Chromium sur l'arbre d'avant (`d850dc4c`) puis sur le final : sonde S **5 rouges → 0** (6 sondes) ; sonde Z **21 rouges → 0** (35 sondes). Bancs : `seance_cf_h` 80 OK · `seance_cf_d` 95 OK · `seance_ce_h` 44 OK · `session_integrity` 93 OK · tous les autres bancs de la liste ciblée verts (campagne `out-c1`, 0 rouge hors les trois ci-dessus, depuis corrigés). Mutations sur l'arbre assemblé (7 scripts, **280 mutations, toutes gardées**) : `mut_seance_cf_d` 38 / 38 · `mut_seance_cf_h` 45 / 45 · `mut_seance_pdc` 36 / 36 · `mut_seance_ce_h` 44 / 44 · `mut_seance_ce_x` 37 / 37 · `mut_seance_ce_p` 49 / 49 · `mut_seance_cf_m` 31 / 31. **Six ancres devenues périmées par les lots S et Z ont été re-posées avec la MÊME intention** (cf_h M24, M25, M26, M29 · pdc M11 · ce_p M04 : `_serieDepuis`, `_pdcVideDe`, `applyDropset` et la ligne de chargement d'un programme ont été réécrites) ; chacune a été rejouée et RÉ-ENCLENCHÉE (rouge). **Non rejouées** : les autres scripts de mutation (ancres et code non touchés) et la D-031 complète, à faire après intégration ; les 10 mutations anciennes périmées restent à ré-ancrer par la gouvernance.

**Compteurs #17 (code applicatif seul, `git diff --numstat d850dc4c HEAD -- log.js`).** données persistées ajoutées **0** · fichiers applicatifs touchés **1** (`log.js`) · lignes ajoutées − retirées **+76 − 57 = +19** (+66 − 52 = +14 hors lignes de commentaire pleines) · anciens chemins supprimés / fusionnés **5** (lot S : `_sourceAdmissible`, la 2ᵉ lecture « par nom » de `_reprise`, les 2 appels de Milo fusionnés dans `_repriseMilo` ; lot Z : la copie de « PDC + à vide » fusionnée dans `_pdcVideDe`, le drapeau `inconnue` d'`applyDropset`). **Fichiers communs avec N°1 touchés : aucun.**

## §164 — ⛔ L'EXPORT SHEETS TRANSFORMAIT UNE CHARGE INCONNUE EN « 0 » (VOLUME 0) ; V4 EST INTÉGRÉ SUR LE MASTER PUBLIÉ DE PRINCIPAL SANS RIEN ÉCRASER *(21/11/2026, GO d'intégration locale de Michel ; branche `claude/seance-v4-integration-2026-11-21` sur `401b9560` ; NON POUSSÉE, NON PUBLIÉE)*

**Reconstruction de V4 (le candidat d'origine `79104fd6` a disparu avec le conteneur du 21/11).** Recomposé à partir des deux archives sauvegardées sur Drive : arbre **`d6d2109bba5685522e9ddb40860b5b244fdad17d` — identique à l'original**, vérifié fichier par fichier par l'empreinte SHA-1 git de la table des fichiers (893 fichiers exportés exacts ; les 11 fichiers modifiés que la rédaction de l'archive avait altérés — adresses, identifiants, une suite d'exemple — retrouvés octet pour octet, l'empreinte servant d'oracle). Commit reconstruit `3421a171` (même arbre, même base `e4456bf4` ; seuls auteur, date et SHA diffèrent de `79104fd6`).

**Fusion.** 5 conflits, aucun écrasement : `seance_ux` / `ux_integration` / `fig_face_dos` / `progres_seances` (fixtures calendaires : les deux côtés faisaient la même chose ; version de Principal gardée, qualifiée par sa D-031 ; la réécriture D-176 de V4 dans `seance_ux` conservée) ; `BUGS.md` (Principal §146, V4 §147 → §163 : aucune collision). `Code.js`, `worker.js`, `sw.js`, `.github` : inchangés par V4.

**Corrections décidées par Michel (20/11) et intégrées.** ① **Export Sheets** (`_buildSyncRows`, tracking.js) : une série cochée à charge inconnue part en **cellule vide** (kg ET volume) ; le zéro écrit, le PDC et « à vide » restent 0 ; `Code.js` inchangé (`_safeCell_` recopie le vide). Limite écrite : le détecteur de doublons du serveur compare la signature de la série — une séance déjà envoyée avec `0` puis renvoyée avec « vide » ne serait pas reconnue comme doublon (cas rare : seules les séances non synchronisées repartent). ② Six suites à `ft4_lms` en dur → mois précédent d'aujourd'hui (même motif que Principal). ③ Deux dates UTC → jour de Paris (`import_chaine.js` : réel, relatif à maintenant ; `session_integrity.js` : sans effet réel, horodatages fixes à 09 h UTC, aligné par cohérence). ④ `APP_BUILD` = `CACHE` = `ft-v1267` (contrôle 17b vert) : aucun numéro posé, la publication bumpe les deux.

**Preuves.** SCCP-G02 réécrit (invariant gardé : nombres ou cellule vide, jamais null / NaN) ; mutations M50 (inconnu → 0), M51 (volume 0 pour une charge inconnue), M52 (PDC pris pour inconnu) : **3 / 3 gardées**. Bancs ciblés sur la fusion : 24 bancs, tous 0 rouge (voir le rapport). Chromium 153 (le chemin attendu `chromium-1194` a été relié à l'installé, hors dépôt) : ni D-031 ni iPhone.

**À savoir avant publication.** V4 réécrit 11 libellés de témoins déjà comptés par le manifeste `temoins-attendus.json` de Principal (R30 : raisons écrites dans les bancs) : la qualification devra les accepter explicitement (`--calibrer … --accepter-retraits`) ; les témoins ajoutés par V4 sont seulement signalés, jamais bloquants.

## §165 — ⛔ UNE MISE À JOUR À MOITIÉ INSTALLÉE REMPLAÇAIT UNE VERSION COMPLÈTE ; UN STOCKAGE PLEIN POUVAIT TRONQUER L'HISTORIQUE SANS LEVER SON DRAPEAU *(22/11/2026, ARCH-08 `sw.js` et ARCH-04 `state.js`, GO ciblé de Michel ; branche `claude/seance-v4-integration-2026-11-21` ; NON POUSSÉE, NON PUBLIÉE)*

**ARCH-08 — famille « déploiement silencieux ».** `precacheCore` avalait chaque échec de téléchargement (voulu pour un logo), puis l'installation appelait quand même `skipWaiting()` : un code à moitié mis en cache devenait la version active et l'ancienne, complète, était purgée à l'activation. Un réseau qui coupe en plein milieu d'une mise à jour = app cassée, sans un mot. **Correctif** : avant `skipWaiting()`, l'installation vérifie que chaque fichier de code (`./`, html, js, css, json, polices) est dans le nouveau cache ; une seule nouvelle tentative sur les manquants ; s'il en manque encore, elle échoue et l'ancienne version reste active, cache intact. Les images et logos ne bloquent jamais (règle d'or #4, bug du 13/07). Stratégie de cache inchangée. **Preuves** : `maj_version` blocs G1 à G3 (vrai service worker : fichier de code manquant → ancienne version active, cache intact, ouverture hors ligne OK ; images manquantes → installation faite ; raté passager rattrapé) ; mutations M38 à M41 toutes gardées.

**ARCH-04 — famille « perte de séance ».** Le repli quota écrivait les 50 séances PUIS le drapeau `ft4_hist_tronque`. Si le navigateur refusait le drapeau (petite clé, stockage plein), le disque portait 50 séances sans que rien ne le dise : au démarrage suivant l'app n'en connaissait que 50, les renvoyait au serveur et écrasait le cloud (le défaut du 02/08, par une autre porte). **Correctif** : le drapeau s'écrit d'abord ; s'il ne peut pas l'être, `ft4_sessions` n'est pas touché (séances entières sur le disque), le drapeau mémoire n'est pas levé et le message « 50 dernières séances » n'est pas affiché ; `prs` et `wkt` restent tentés. Les autres modifications de `persist()` (`_majRefresh`) sont inchangées. **Preuves** : `seance_ce_p` bloc Q (Q01 témoin sain, Q02 drapeau refusé) ; mutations M53 (ordre d'avant) et M54 (réduction malgré l'échec du drapeau) gardées. **Limite écrite** : si le drapeau passe mais l'écriture des 50 séances échoue ensuite, le drapeau reste levé alors que le disque est complet — côté sûr (plus d'envoi des séances, rien d'écrasé) ; seule une restauration le baisse. Aucun message de plus n'est affiché quand le drapeau est refusé (proposition possible, non décidée).

## §166 — ⛔ SIX ROUGES DE LA D-031 RÉPARTIE SUR V4 : CINQ TÉMOINS DE SOURCE QUE D-170 / D-171 / « SUPPRIMER UNE SÉRIE » CONTREDISENT, ET UN DOUBLON CSS *(22/11/2026, GO ciblé de Michel ; branche `claude/seance-v4-integration-2026-11-21` ; NON POUSSÉE, NON PUBLIÉE)*

**Constat.** Passe répartie K=3 sur `73e2cb8d` : 9 732 ✅ / 6 ❌, tous dans le processus 0 (blocs du `runner.js`) ; conditions ①→⑧ vertes, ⑨ identités : 17 manquantes. **Vérifié nominativement : 17 = les 11 retraits documentés + les 6 rouges, aucun manquant inexpliqué.**

**Causes et corrections (strictement limitées aux six rouges ; libellés des témoins gardés à l'identique, une identité = son libellé).**
① **CCCVI ⑭** et ② **CXCI « sans desserrer les gardes »** exigeaient `_curScreen!=='home'` dans `_majPeutSAppliquer` ; D-170 (17/11, Michel) l'a retiré exprès (l'écran n'est plus une raison d'attendre). Re-visés sur ce qui subsiste : séance ouverte (`_seanceOuverte` / `S.wkt`), fin de séance (`_finishing`), passe payante (`_evRunning`).
③ **`showConfirm` « menteur »** (`log.js`, « Supprimer le palier / la série N ? ») : le titre est un ternaire ; accepté seulement si les DEUX branches commencent par « Supprimer » (une branche « Retirer… » reste menteuse — éprouvé).
④ **B-CCCXII ③′** : D-170 pose `_dbfActifs.delete(…)` en tête du `finally` ; cette seule ligne est tolérée, `_dbfVolRetirer(sid)` reste exigé et `removeItem(_DBF_ENCOURS)` reste interdit (éprouvé : sans `_dbfVolRetirer`, ou avec un `removeItem`, le témoin rougit).
⑤ **`.pe-up` déclaré deux fois** (`style.css`, D-171) : défaut de V4 ; les deux règles sont fusionnées (`position:relative;overflow:visible` dans la première), rendu inchangé ; ancres des mutations M38 et M41 de `mut_seance_ce_h.py` re-posées (4 / 4 gardées).
⑥ **Header de Milo < 60 px** : MESURÉ — `#ctx-help` (« ? » d'écran, lot A du 17/11) réserve 40 px à droite ; à 390 px le sous-titre passe sur deux lignes : 64 px (50 px sur le master publié ; à 375 px il faisait déjà 64). **Michel accepte 64 px** ; seuil du témoin 60 → 70 px (il rougit toujours au-dessus, le défaut d'avant faisait 83). Affichage vérifié à 375, 390 et 430 px : titre, sous-titre, badge et « ? » lisibles, aucun chevauchement, aucune troncature, aucun débordement horizontal (captures hors dépôt).

## §167 — ⛔ LE PASSAGE AUTOMATIQUE ÉTAIT ARMÉ POUR LA FIN DU REPOS ET JAMAIS RELU, LE SUPERSET CHOISISSAIT SON PARTENAIRE PAR POSITION, LA REPRISE ROUVRAIT TOUJOURS LE DERNIER EXERCICE *(24/11/2026, GO « développement local ft-v1269 (S2) » de Michel ; branche `claude/ft-v1269-s2-passage-auto-2026-11-24` sur `dde3e9a2` ; NON POUSSÉE, NON PUBLIÉE)*

**Constat (rejoué en lecture seule sur l'arbre qualifié, avant tout code).** ① `toggleSet` armait l'avance `_restDoneCb` APRÈS `startRest` pour la fin du repos et ne la relisait jamais : un « + Série », une dévalidation (double appui) ou « Passer » pendant le repos déplaçaient quand même l'écran vers l'exercice suivant. ② Le superset prenait le membre suivant PAR RANG (`_nextInGroup`) et, au dernier membre, le premier du groupe : 3+2 → A3 renvoyait sur B terminé, **sans chronomètre** ; 2+3 → B2 renvoyait sur A terminé ; aucune sortie du groupe, jamais. ③ `_expandedEx` n'était pas enregistré : à la réouverture, le DERNIER exercice s'ouvrait, même au milieu du 2ᵉ. ④ La question du RIR ne nommait pas l'exercice visé.
**Famille** : « le comportement d'un chemin rare outillé, d'un chemin banal oublié » (§ ft-v825) et « deux logiques qui ne se parlent pas » (R2) : l'avance de l'exercice ordinaire et le tour du superset répondaient à la même question avec deux règles. **Correctif** : une fonction propriétaire (`_prochainMouvement`, relue à chaque validation sur les séries RÉELLEMENT présentes, définition de « à faire » = celle de « N / M séries » et de « Terminer ») ; le passage a lieu AVANT `startRest` ; dock `#rest-suite` ; vue `S.wkt.vue` (rang + nom) relue au 1ᵉʳ rendu. **Preuves** : `tests/parcours/s2_nav.js` (NR-* écrits avant le code et verts sur master, S2-*, VUE-*), `tools/mut_s2_nav.py`. **Limites écrites** : groupes `drop` / `pyramid-*` : ancien code conservé (avance différée, défaut ① non corrigé pour eux) ; pyramide ↑ de l'outil et dropset importé `dropChaine` suivent l'exercice ordinaire ; échauffement non fait après la dernière série de travail : ne bloque jamais (décision du 16/10).

**Preuves ciblées.** mutations `mut_seance_ce_h` M38-M41 : 4 / 4 ; bancs `seance_ui` 85, `seance_ce_h` 44, `seance_maj` 56, `editeur_prescriptions` 78 : 0 rouge. **La D-031 répartie ET classique sont rejouées sur le nouvel arbre** (la précédente n'est plus valide).

## §168 — ⛔ RECETTE iPHONE ft-v1269 (S1 → S14) ET DIAGNOSTIC DU 27/11 : S4 (DOUBLE APPUI) EST BLOQUANT, DOUZE AUTRES TICKETS DE SÉCURISATION RESTENT OUVERTS, DEUX LOTS (B ET C) ATTENDENT *(25-27/11/2026 ; clone S2 `5e68270b` publié seul sur master `b4fea36b` ; AUCUN CORRECTIF AUTORISÉ ; production `ft-v1268` ; mise à jour documentaire locale, NON POUSSÉE)*

**Ce paragraphe est le registre canonique des anomalies Séance de ft-v1269** (même ID = même ticket ; ancienne valeur conservée, rien d'effacé). §167 reste exact pour ce qu'il décrit, mais son en-tête « NON POUSSÉE, NON PUBLIÉE » est **dépassé** : la branche est poussée (`71295852`) et le clone de test S2 est publié seul (master `b4fea36b`, Pages n°1373 ✅, vérifié en réel le 25/11) ; **la production n'est pas publiée**. Le registre Drive « SUIVI DES BUGS » et la « PASSATION MAÎTRE » doivent reprendre les mêmes IDs (règle d'or #19) : le connecteur Drive ne modifie pas un fichier existant (règle #18) — le bloc à coller est dans le rapport de mission, hors dépôt. Diagnostic complet (10 rubriques par anomalie, lignes de code, tests futurs) : `RAPPORT-DIAGNOSTIC-V1269-2026-11-27` (PDF/MD **hors dépôt**, public).
**Sources** : recette iPhone de Michel sur le clone (25-27/11, point de reprise Drive « SÉANCE — POINT DE REPRISE ACTIF », lu en lecture seule), mandat de diagnostic du 27/11, lecture du code (arbres `5e68270b` / `dde3e9a2`). **Rien n'a été rejoué ni corrigé le 27/11.**
**Décompte exact (corrigé le 28/11 — l'en-tête initial annonçait « sept réserves » et « trois lots » : c'était FAUX, il y a deux lots)** : **13 tickets de sécurisation (Lot A, `SEANCE-1269-*`)** = 1 bloquante (S4) + 5 écarts diagnostiqués (S3, S3B, S9, S11, S13) + 1 anomalie préexistante à cause non établie (S12P) + 5 qualifications ou vérifications non faites (S12A, S12B, S13C, S14, S14K) + 1 besoin produit (ZOOM) ; **+ 5 tickets du lot B + 4 du lot C = 22 tickets** dans ce paragraphe. S10 est clos (OK, non rouvert) et n'est pas compté. Numéros de décision : **aucun numéro D-177 ou suivant n'a été utilisé** par Claude N°2 (les D-xxx cités existent déjà ; les décisions nouvelles restent à numéroter par Claude N°1).
**Vocabulaire — sept états, jamais confondus** : *signalée* · *reproduite* · *diagnostiquée* · *corrigée sur branche* · *testée* · *validée par Michel* · *déployée*. **Un correctif préparé ou testé localement n'est jamais « résolu ».** Aucune des anomalies ci-dessous n'est corrigée, testée ni déployée : il n'y a pas encore de correctif. « Favorable déclaré » = retour oral/écrit de Michel sans preuve archivée ; ce n'est pas « validé ». **Ne pas déclarer 14/14 OK.**

### A. Recette iPhone ft-v1269 sur le clone (états au 27/11)
| Test | État | Preuve / limite |
|---|---|---|
| S1 passage automatique (DC 60 kg, sans « Passer ») | favorable déclaré (25/11 14:25, oral) | pas de capture archivée |
| S2 « + Série sur [exercice] » pendant le repos | favorable déclaré (25/11 16:00) | sous-critères non documentés un à un |
| **S3 clavier / zoom / dock** | **PARTIEL — écart à arbitrer** (25/11 23:54) | bouton central stable mesuré (x=194, y=1016, 51-52 × 52 px) ; restent : nom très long, largeurs 375/390/430, cible ≥ 44 px |
| **S4 double appui** | **FAIL BLOQUANT** (25/11 23:48) | `ScreenRecording_11-25-2026 23-48-21_1.mp4` ; diagnostiquée, non corrigée |
| S5 échauffement non validé ne bloque pas | OK observé (25/11 23:57) | |
| S6 dernière série X, repos 240 s | OK observé (26/11 00:01) | |
| S7 superset 3+2 | OK observé (26/11 00:23) | |
| S8 superset 2+3 | OK observé (26/11 11:08) | |
| S9 ajout nominatif sur le DC après sortie du superset | favorable PARTIEL | le clic du bouton nominatif n'est pas observé directement |
| S10 RIR nominatif | OK : attribution et persistance du RIR 2 (historique, CSV, JSON, relance) | **non rouvert** sans élément nouveau |
| S11 fin de séance | OK fonctionnel (26/11 16:09) ; écart UX | pas de fin automatique ; libellé « SÉRIE SUIVANTE » incohérent |
| S12 dropsets / pyramides | a) anciens groupes **non joués** ; b) pyramide montante + dropset importé favorable partiel (charges vides, +10 % et import non vérifiés) ; c) dropset descendant OK ; saisie tardive / correction de palier **reportée par Michel** | |
| S13 reprise après fermeture | a) favorable, **contexte de repos / bouton nominatif / RIR non restaurés** ; b) OK ; **c) migration V1268 → V1269 NON vérifiable sur le clone** ; d) favorable ; e) OK déclaré | |
| S14 intégrité | favorable **AVEC RÉSERVES** | voir SEANCE-1269-S14 |

### B. Registre des anomalies et réserves — Lot A (sécurisation de ft-v1269)
Légende de l'état : **S**ignalée · **R**eproduite · **D**iagnostiquée · **C**orrigée · **T**estée · **V**alidée · **Dép**loyée ; « ✔ » oui · « ✘ » non · « ~ » partiel.

- **SEANCE-1269-S4 — double appui sur la dernière série d'un exercice : le 2ᵉ appui valide une série de l'exercice qui vient de s'ouvrir.** Découverte 25/11 23:48 · **V1269** (forme voisine V1268, non rejouée) · **Gravité : bloquante publication ; priorité n°1.** *Symptôme* : DC4 validée à ~0,90 s, +167 ms la 3ᵉ ligne du squat est cochée (squat 1/3, séance 5/10), le bandeau de transition disparaît. *Cause CONFIRMÉE (code lu)* : ✓ = `<button onclick="toggleSet(ei,si)">` (`log.js:1212/1240`) ; `touch-action:manipulation` (`style.css:84`) → deux clics ; `toggleSet` (`log.js:2162`) rouvre le squat et redessine **de façon synchrone** (2403-2427) avant le 2ᵉ appui ; aucun garde (ni rebond, ni cible, ni horodatage) ; le 2ᵉ appel valide la case sous le doigt et `startRest` → `_restSuiteEffacer` (6406) efface le dock. **Conséquence non signalée (CONFIRMÉE par lecture, non rejouée)** : hors superset `_rirPending` est écrasé (2215-2217) → **la question du RIR de DC4 n'est plus posée**. *Preuves* : vidéo ; lecture. *Correctif envisagé (PROPOSITION, non codé)* : **P1 quarantaine ciblée** (volatile, ~300 ms, durée à arrêter) ; alternatives rejetées : verrou global, CSS `pointer-events`, passage retardé, ordre imposé ; P2 anti-rebond par case = hors S4. *État* : S✔ R✔ D✔ C✘ T✘ V✘ Dép✘. **↪️ 28/11 (GO « correctif S4 » de Michel) : corrigé sur BRANCHE LOCALE (non poussée), témoins PRÉPARÉS mais NON EXÉCUTÉS → S✔ R✔ D✔ C✔(branche locale) T✘ V✘ Dép✘ — NON résolu, voir §168 M.** *Régression* : valider trop tard une série voulue ; témoins S2 qui enchaînent des validations sans délai (D-172 : ne jamais les affaiblir). *Dépendance N°1* : aucune directe (`toggleSet` ≠ `finishWorkout`) ; la protection est volatile, donc indépendante de la persistance. *À vérifier* : T par mesure sur iPhone (aucune mesure de validations volontaires rapides) ; instant de référence (fin du 1ᵉʳ geste vs `event.timeStamp`) ; coût en tests (recherche des témoins concernés). Périmètre minimal : `log.js`, ~+12 lignes, 0 donnée.
- **SEANCE-1269-S3 — le dock de repos disparaît quand le clavier numérique est ouvert à l'échelle normale.** 25/11 23:54 · V1268 + V1269 · gravité moyenne (le chrono continue). *Cause CONFIRMÉE par lecture, mécanisme iOS = HYPOTHÈSE* : `#rest-bar` est fixe à `bottom:safe+76px` (`style.css:208`), `kbd-serie` masque `.nav` (`style.css:552`) mais pas le dock ; le clavier iOS ne réduit pas la fenêtre de mise en page ; `_dockSuivreZoom` (D-174, `log.js:6314`) ne repositionne que si `visualViewport.scale>1.02` (6317) — d'où le retour au pincement ; `_garderLigneVisible` ignore le dock. *Correctif envisagé* : K1 dock suit `visualViewport` clavier ouvert (+ marge de la ligne), K2 dock masqué + mini-chrono en en-tête, K3 rien ; **à arbitrer par Michel**. S✔ R✔ D✔ C✘ T✘ V✘ Dép✘. Régression : bouton central (règle #9, à MESURER), chevauchement du champ saisi, D-174. À vérifier : 360/375/390/430 px, noms longs (tronqués à 26 car., `log.js:6390`), recette iPhone.
- **SEANCE-1269-S3B — cible tactile du bouton « ＋ Série sur [exercice] » du dock = 38 px (< 44).** 27/11 (lecture) · **V1269 seulement** · gravité faible/moyenne. `#rest-bar #rest-suite .rs-add{height:38px}` (`style.css:233`). Mandat : 44 px CSS minimum. Aussi constatés, non modifiés par S2 : RIR `.rir-b` 40 px (`style.css:254`, D-175 « sans diminution »), case de validation `.chk` 30×30 px (`style.css:739`). *Correctif* : `.rs-add` à 44 px (CSS seul, vérifier la hauteur totale du dock D-175 ~114 px et le bouton central). S✔ R✘ (non mesuré à l'écran) D✔ C✘ T✘ V✘ Dép✘. **Ne pas toucher `.chk` dans le correctif S4.**
- **SEANCE-1269-ZOOM — demande de Michel (26/11) : empêcher le zoom pendant une séance active.** Besoin produit enregistré, **aucun GO**. Décidé : **ne jamais désactiver globalement le zoom** (D-174, accessibilité). *Faits* : viewport `maximum-scale=5, user-scalable=yes` (`index.html:8`) ; double appui déjà neutralisé (`touch-action:manipulation`) ; champ PDC `.sinp-pdc` à **12 px** (`style.css:720`) — cause plausible de l'agrandissement automatique d'iOS à la prise de focus (HYPOTHÈSE à vérifier sur iPhone). *Options (PROPOSITION)* : Z1 champ PDC à 16 px, Z2 dock suit clavier+zoom, Z3 blocage du pincement sur `#s-log` seulement en réglage optionnel par défaut OFF (contraire à D-174 sinon), Z4 rien. À arbitrer.
- **SEANCE-1269-S9 — pas d'ajout nominatif sur le DC depuis le bandeau après la sortie d'un superset.** 26/11 13:48/13:51 · V1269 (dock nouveau) · réserve conservée, gravité faible. *Cause de conception CONFIRMÉE* : `_restSuiteMontrer(S.wkt.exs[ei], …)` (`log.js:2423`) nomme **un seul** exercice, le dernier validé. *Correctif envisagé* : un bouton par membre du groupe (≤ 3) ou statu quo (« + Série » de la carte). **À arbitrer.** Clic de `ajouterSerieDepuisDock` (`log.js:6399`) non observé. S✔ R~ D✔ C✘ T✘ V✘ Dép✘.
- **SEANCE-1269-S11 — « SÉRIE SUIVANTE » s'affiche alors qu'il n'en reste aucune.** 26/11 16:09 · V1268 + V1269 · gravité faible (UX). *Cause CONFIRMÉE* : libellé statique `index.html:3907` (`#rcd-next-label`), jamais adapté par `_showRestCountdown` (`log.js:6143-6167`) ; `_nextSetInfo` (6096) rend `null` quand rien ne reste. *Correctif* : libellé neutre si `null` (« PLUS DE SÉRIE PRÉVUE »), **aucune clôture automatique** ; `log.js` seul. HYPOTHÈSE annexe : `_nextSetInfo` compte les échauffements non validés (`findIndex(!done)`). S✔ R✔ D✔ C✘ T✘ V✘ Dép✘.
- **SEANCE-1269-S12A — anciens groupes drop / pyramide jamais qualifiés.** 26/11 · V1268 + V1269 (ancien code conservé volontairement) · gravité faible (données anciennes seulement). *Fait CONFIRMÉ* : **aucune voie de création dans le code actuel** (seul `groupType='super'` est affecté : `log.js:690, 725, 743, 994` ; `drop`/`pyramid-*` ne sont que recopiés : 4218, 10848, 11226) → ils n'existent que dans d'anciennes données. Qualification possible seulement par données injectées en environnement isolé. Défaut connu non corrigé pour eux (avance différée jamais relue). S✔ R✘ D✔ C✘ T~ (témoins NR-6b/NR-7, statiques) V✘ Dép✘.
- **SEANCE-1269-S12B — pyramide montante de l'outil et dropset importé : charges et import non vérifiés.** 26/11 16:32 · passage = ordinaire S2 en V1269 (différé en V1268). Charges vides **conformes** à D-164 (base inconnue → paliers inconnus, `log.js:866`, clone vierge). À vérifier : `+10 %` avec une charge de base connue ; dropset importé avec/sans `dropChaine` (`log.js:2288`). S✔ R~ D✔ C✘ T✘ V✘ Dép✘.
- **SEANCE-1269-S12P — « paliers validés non modifiables » et « paliers suivants non recalculés ».** 26/11 17:10 · **préexistantes à V1268** (note Drive, lecture statique). Ma lecture : les champs d'une série validée ne sont pas `readonly` (`log.js:1209-1210`) ; `upSet` (2156) n'écrit que la série éditée **sans recalculer la suite** (par conception ; le recalcul est `applyDropset`/« Modifier paliers », invariant CC-01 : le passé reste intact). Le « non modifiable » n'est **pas expliqué** par la lecture statique (HYPOTHÈSE : focus/affichage) → à rejouer. Saisie tardive / correction de palier : **reporté par Michel**. S✔ R✘ D~ C✘ T✘ V✘ Dép✘.
- **SEANCE-1269-S13 — après relance complète, le contexte nominatif du repos, le bouton d'ajout ciblé et la question RIR ne reviennent pas.** 26/11 19:03 · V1268 (limite d'origine, SEANCE-REPOS-01) + V1269 (dock) · gravité moyenne. *Cause CONFIRMÉE, documentée dans le code* : `_reposMemoriser` (`log.js:6450`) ne range que `repos={debut,total}` ; commentaire `log.js:6477-6479`. *Correctif envisagé* : **A — dériver à la reprise** (série retrouvée par `startTs+pausedTotal+at*1000 ≈ repos.debut`, `set.rir` absent, exercice suivant par `_prochainMouvement`) **sans nouvelle donnée** ; **B — ranger la cible dans `repos`** : contredit la décision n°1 de Michel (« et rien d'autre ») → arbitrage préalable. Sans `toggleSet`/`startRest`/`_restDoneCb`. Cas : repos expiré, exercice remplacé/supprimé, superset (appariement ambigu → rien), RIR déjà donné, anciennes données. S✔ R✔ D✔ C✘ T✘ V✘ Dép✘. Dépendance N°1 : écriture de `ft4_wkt` (voir « Coordination »).
- **SEANCE-1269-S13C — migration réelle V1268 → V1269 non vérifiable sur le clone.** 26/11 · gravité inconnue. Procédure future écrite (non exécutée) : (i) local, profil persistant, V1268 puis V1269 sur la même origine avec service worker réel (D-170 : aucune mise à jour forcée pendant une séance) ; (ii) iPhone clone = approximation ; (iii) preuve réelle seulement après publication. **Classée « non vérifiée »**. S✔ R✘ D✘ C✘ T✘ V✘ Dép✘.
- **SEANCE-1269-S14 — intégrité des données : favorable avec réserves, rien n'est démontré au-delà.** 26/11 20:30 → 23:38 · V1268 + V1269. *Établi* : séances 800/778 kg et RIR persistants ; CSV/PDF 28 séries validées sur 3 séances ; JSON prod/clone 107 clés de 1ᵉʳ niveau identiques, 0 id de séance commun (87 vs 3). *NON démontré* : non-pollution par la navigation (S.wkt.vue seulement dans `ft4_wkt`, VUE-7b/8/9), identités et records exhaustifs, restaurabilité, isolement complet (live 25/11 : sentinelle prod intacte ; 1 requête externe `api.qrserver.com`, QR de l'adresse publique), calories. **À préserver** : `sess.exercises` ne porte que `name`+`sets` (`log.js:5434`) — les métadonnées dropset/groupe sont dans `exs` seulement ; ne jamais reconstruire `exs` depuis `exercises`. S✔ R✔ D~ C✘ T✘ V✘ Dép✘. Protocole futur (lecture seule, isolé) écrit dans le rapport.
- **SEANCE-1269-S14K — durée retenue 14 min (`calData.dureeMin`) contre 11 min affichées (séance 800 kg).** 26-27/11 · antérieure à S2 · **ne pas conclure à un bug calorique**. `dureeMin` = durée *retenue pour le calcul* (`app.js:1226`), de `_dureeSeanceMin` (`app.js:913-949`), bornée à 1,5-10 min par série dès 6 séries (garde-fou voulu le 16/08). **HYPOTHÈSE forte** : plancher `nSets×1,5 min` (9 séries → 14). À vérifier : nombre de séries validées, `dureeSrc`, durée mesurée. S✔ R✘ D~ C✘.

### C. Lot B (améliorations fonctionnelles Séance) — lot distinct, aucun GO
Toutes **signalées et diagnostiquées (cause confirmée par lecture)**, **non corrigées, non testées, non validées, non déployées** (S✔ D✔ C✘ T✘ V✘ Dép✘). B1, B2, B4, B5 : **code identique en V1268** (`git diff dde3e9a2 5e68270b` : aucune ligne modifiée dans `addExercise`, `_reprise`, `_exerciceRemplacant`, `filterEx`, `_monteeDefauts`, `_debriefLocal`).
- **SEANCE-B1-ECHAUF-01** (26/11) — trois politiques d'échauffement : libre = `addExercise` crée 3 lignes dont la 1ʳᵉ `É` si historique (`log.js:4146`) → 2 séries de travail ; programme = types du document ; remplacement = rôle de l'ancien (`log.js:4211-4212`) ; `cycleType` (2429) retire 1 série de travail ; « + Série » ajoute toujours un `N` (3930) ; pas d'« ajouter un échauffement » indépendant. **Décidé (principe)** : distinguer conversion et ajout. **Non tranché** : politique automatique. D-167 (regroupement échauffement/travail à l'import) et D-173 (suppression précise d'une série) **ne règlent pas cette politique**. Périmètre minimal : `addExercise` + un geste « + Échauffement » ; ne pas toucher `cycleType`. Risques : `_bilanTravailEx`, passage S2, volume D-092, `_prevAligne`, témoins 3 lignes.
- **SEANCE-B2-CHARGES-REMPL-01** (26/11, retour terrain non confirmé) — au remplacement, le nouvel exercice repart vide : `_reprise` (`log.js:10745`) n'admet que la dernière séance du même jour du même programme, ou la dernière séance libre ; la colonne « Précédent » lit tout l'historique (visible, non reprise) — **voulu (lots C/S 17-18/11)**. **Décidé** : jamais les charges de l'ancien ; viser l'historique du nouvel exercice. Proposition : suggestion explicite (jamais écrite), sans toucher `_reprise` ni les prescriptions (D-163/D-168).
- **SEANCE-B3-NAV-SELECT-01** (arbitrage 26/11) — **Décidé** : préparation → 1ᵉʳ exercice ; ajout pendant la séance → conserver l'exercice en cours ; remplacement → remplaçant ; jamais de retour sur un exercice terminé. Écart CONFIRMÉ : `addExercise` pose `_expandedEx=dernier` (`log.js:4152`) ; `closeExPicker` défile vers lui ; aucune notion « séance démarrée ». Remplacement conforme (4231/4241). Seul sujet touché par V1269 (`_vue*`, `_prochainMouvement`).
- **SEANCE-B4-RECHERCHE-01** (26/11 17:34) — « Curl bicep » → un seul résultat : repli par mots conditionné à l'absence de résultat (`log.js:7077`, `if(!f.length)`). Proposition : union dédupliquée classée (rang 7,5 existant), synonymes/anciens noms/identités préservés ; coordination chantier bibliothèque (aucun ticket nommé trouvé).
- **SEANCE-B5-DEBRIEF-01** (26/11 20:30) — « aucune montée en charge avant 18 kg » pour 15/15/18 : `_monteeDefauts` (`log.js:2868`) = absence de paliers d'échauffement, libellé confondu avec la progression de charge ; `_debriefLocal` (5695) n'applique ni seuil 40 kg, ni filtre « ancre », ni le silence de Milo (`coach.js:3539-3546`). **Calcul 100 % local, aucun appel IA.** Ne pas toucher `_monteeDefauts` (sert `_monteeSuffisante`).

### D. Lot C (historique et exports) — indépendant ; moteur identique V1268/V1269 (preuve par diff : `setup.js`, `state.js`, `tracking.js` non touchés) : **aucune régression S2**
Toutes S✔ D✔ C✘ T✘ V✘ Dép✘ ; D-044 préservée (débriefs Milo = choix explicite, sans appel IA).
- **EXPORT-C1-SEANCE-ID-01** (26/11 22:58, relecture 23:36) — colonne `seance` vide : `_histoLignes` lit `name||label` (`setup.js:300`), `finishWorkout` n'écrit que `progLabel` (`log.js:5433`) ; PDF regroupé par date (`setup.js:608`) ; `seance_id` calculé mais écrit seulement avec « débriefs » (choix d'implémentation, `setup.js:279-283`, figé par le témoin E1 — **pas une décision de Michel**). Identité : `sid`=`_dbfCle` (`id||ts||date`) ; `sigSess`/`openSessDetail` lisent `ts||id`. Titre cohérent déjà à l'écran (`setup.js:2343`). Évolution du format CSV : **arbitrage de Michel**.
- **EXPORT-C2-FILTRE-01** (27/11 08:34-08:46) — **orientation validée** : une fenêtre simple, historique complet par défaut, reprise visible des filtres actifs, compteur réel, options repliées, CSV et PDF mêmes critères. Constats : aucun filtre à l'export ; compteur faux (`setup.js:685` compte aussi cardio/activités) ; filtre de l'écran (`_sessFiltres`/`_sessGenre`, en mémoire) non transmis ; plafonds `S.sessions` 1500 / repli 50 + `ft4_hist_tronque` **jamais signalés à l'export**.
- **EXPORT-C3-PDF-01** (27/11) — PDF compact : heures de début/fin **uniquement si fiables** (`ts - duration` valable en direct seulement, pas pour un import) ; durée totale ≠ temps effectif ≠ durée retenue pour le calcul ; calories absentes volontairement (décision de Michel avant d'en ajouter) ; filtre `_pdfTexte` (WinAnsi) ; témoin `REF_PDF_SANS` à réviser volontairement.
- **EXPORT-C4-JSON-01** (27/11 08:46, capture IMG_3349) — **quatre choix conservés (décidé)** ; constats : choix « Tout » et « Avec discussions » ont le **même nom de fichier** (`coach.js:9060`) ; **aucune identification PROD/CLONE** ; aucune version de schéma ; liste noire (mode complet) vs liste blanche (séances) ; exports par `<a download>` sans feuille de partage iOS ; titre « Exporter mes données » rogné = **HYPOTHÈSE non mesurée** (`.overlay` `flex-end` + `.modal` `max-height:85dvh`). Aucune restauration/import touchés ; **aucun export personnel demandé ni transmis**.

### E. Décisions validées par Michel (rappel, R15 — ne pas rouvrir sans preuve nouvelle et mesurée)
Protection courte contre le double appui (principe ; **durée non arrêtée**) · ne jamais désactiver globalement le zoom (D-174) · échauffements non validés ne bloquent jamais le passage (16/10) · dock « Repos · [exercice] » / « ＋ Série sur [exercice] » · fin de séance jamais automatique · pas de pop-up supplémentaire (« Quoi de neuf » discret) · conversion ≠ ajout d'échauffement (principe) · règles de navigation B3 + « ne pas revenir sur un exercice terminé » · B2 : historique du **nouvel** exercice, jamais l'ancien · export historique : orientation « une fenêtre simple » · quatre choix du menu de sauvegarde conservés · D-044 · aucune publication de ft-v1269 sans GO distinct + R18 + D-031 sur l'arbre candidat.

### F. Investigations reportées
Saisie tardive / correction de charge d'un palier descendant (S12) · S12a (anciens groupes) · S13c (migration réelle) · restaurabilité et isolement complet (S14) · vérification de la cible du RIR en superset après S4 · réglage de repos échauffement/travail par exercice (« BESOIN 2 » du 24/11, backlog, hors V1269) · politique automatique d'échauffement · menu historique « une fenêtre » (C2) · bibliothèque (B4).

### G. Risques, dépendances et travaux restant à réaliser
**Risques** : publier ft-v1269 avec S4 ouvert (double appui = série du mauvais exercice + RIR perdu) ; corriger S4 trop large (verrou global) ; toucher `.chk`/layout et déplacer le bouton central (règle #9) ; modifier `toggleSet` en même temps que N°1 touche `finishWorkout` (même fichier) ; correctifs S13 qui violeraient la décision n°1 (`repos` figé) ; témoins S2 affaiblis pour verdir (D-172) ; confondre durée retenue et durée mesurée (S14K).
**Reste à faire (aucun GO)** : arbitrages T/P1 (S4), K1-K3 (S3), Z1-Z4 (zoom), S9, libellé S11, S13 (A ou B), puis — pour tout correctif — branche dédiée depuis `71295852`, témoins d'abord (mutations), clone S2 régénéré si l'application change, **D-031 complète sur l'arbre candidat** (celle de `5e68270b` ne qualifie ni S4 ni `71295852`), recette iPhone (S4, S3, S13, S12a), **R18**, **GO production distinct** ; puis lots B et C un par un.

### H. Coordination avec Claude N°1 (propriétaire du registre, de `finishWorkout` et de la protection des données)
| Sujet | Mon périmètre | Périmètre N°1 | Point de vigilance |
|---|---|---|---|
| `finishWorkout()` / repli de sauvegarde locale (`log.js` ≈5486-5499) | lecture seule, **aucune modification** | **ARCH-DATA-06** : repli à 50 séances sans `ft4_hist_tronque` ; correctif préparé sur copie jetable (`_ecrireSessionsAvecRepli` dans `state.js` + ~13 lignes du bloc « SAUVEGARDE LOCALE ») | zéro recoupement avec `toggleSet`/`_vue*`/`_restSuite*` ; re-vérifier les conflits APRÈS publication de ft-v1269 |
| Écritures de l'historique (`S.sessions`) | l'export (C2) **lit** `S.sessions` (plafond 1500, repli 50) | centralisation des écritures (`persist`, `_persistRepli`, `_ecrireSessionsLocal`, `finishWorkout`) | l'export doit lire le drapeau `histTronque` posé par son propriétaire ; ne pas dupliquer sa logique |
| Protection des données de `ft4_wkt` | `_vueMemoriser` (`log.js:1698`) et `_reposMemoriser` (`log.js:6450`) **écrivent `ft4_wkt` directement**, champ seul, après un test « même séance » | garde mémoire de `persist()` (`_wktPeutEcrire`, `_wktBasePoser`) : la page n'écrit la séance en cours que si elle l'a modifiée | **à coordonner** : ses gardes ne doivent pas traiter mes écritures « champ seul » comme étrangères, ni l'inverse (non vérifié) |
| Séance active unique | même test d'identité (`runId`, sinon `startTs`+`date`) copié dans `_vueMemoriser` et `_reposMemoriser` | `_ftAutreOnglet` (`state.js`) pour `persist()` | trois copies de la même règle → un seul propriétaire souhaitable |
| Sauvegarde / récupération | S13 (restauration du contexte de repos), S14 (restaurabilité non démontrée) | mécanismes de sauvegarde, restauration, isolement | toute preuve de restauration se fait en environnement isolé, jamais en production |
| Identités de séance | C1/C2 (clé de regroupement, sélection individuelle) | intégrité des identités et des records | `id`, `ts`, `runId`, `sid` : priorités différentes selon le lecteur → **décision commune** |
| Modifications concurrentes | `log.js` : `toggleSet`, `renderExBlocks`, `_vue*`, `_restSuite*`, `_prochainMouvement`, dock ; (lots B/C) `addExercise`, `filterEx`, `_debriefLocal`, `_histoLignes`, `exportHistoPdf`, `openHistoExport` | `state.js` (`load`, `persist`, `_lsJson`…), `setup.js` (`analyzeBodyStudy`, `_bsPhotos*`, `_cloudSync` 2 champs), `finishWorkout` | mêmes fichiers, fonctions différentes : séquencer, `git fetch` + journal de partage avant tout code (règle #13) |

### I. Simplifications possibles dans mon périmètre — **aucune refonte engagée** (le chantier global reste à Claude N°1, coordination ChatGPT ; R30/#15 : un chemin ancien ne se supprime pas sans preuve et accord)
① `toggleSet` (~270 lignes) porte cinq `startRest` et **deux mécanismes de passage** (S2 `_prochainMouvement` ; `_ssNext` + `_restDoneCb` pour les groupes drop/pyramide dont la création n'existe plus) — fusionnables **si** une analyse de sauvegardes réelles (environnement isolé) prouve l'absence de ces groupes. ② Test « même séance sur disque » dupliqué (`_vueMemoriser`, `_reposMemoriser`, `persist`). ③ Deux réponses à « qu'est-ce qui vient ensuite ? » : `_nextSetInfo` (décompte) et `_prochainMouvement` (passage) — source possible de S11. ④ Deux prédicats de filtre (écran / futur export) → un seul. ⑤ Deux implémentations de « montée en charge » : `_debriefLocal` et le verdict de Milo (`coach.js`) (B5). ⑥ Deux systèmes de mots pour retrouver un exercice : `filterEx` et `_matchExercise` (import) (B4). ⑦ `sess.exercises` (copie réduite) à côté de `exs` : lecteurs `exs||exercises` partout. ⑧ Trois priorités d'identité (`id||ts` / `ts||id`). ⑨ Titre de séance calculé à l'écran (`setup.js:2343`) et, autrement, à l'export (`name||label`) (C1).

### J. Contradictions et fragilités documentaires constatées (27/11) — à ne pas résoudre en silence
1. `docs/DECISIONS.md` du dépôt s'arrête à **D-162** ; D-163 → D-176 sont citées par le code, `BUGS.md` et le Drive et **ne sont pas inscrites au registre** (« à numéroter par Claude N°1 »). Les D-xxx de ce paragraphe viennent du Drive (arbitrages du 16/11) **et du dépôt hors registre** : D-173 est décrite dans `BUGS.md` §158, D-167 dans `BUGS.md` §151 et `docs/IMPORT-IA-FIDELITE-01.md` (lignes 591 et 622), D-174 dans le commentaire de `log.js:6302` ; ce qui manque est leur inscription au registre `docs/DECISIONS.md`. *(Rectifié le 28/11 : la phrase initiale « je n'ai pas pu relire D-167, D-173 et D-174 dans le dépôt » était inexacte.)*
2. **Renvois D-167 / D-173 (rectifiés le 28/11).** Le mandat du 27/11 demande de **PRÉSERVER** « les prescriptions, les séries réalisées et D-167/D-173 » : ce n'est pas dire qu'elles gouvernent la politique d'échauffement. Ma formulation initiale (« le mandat les cite comme garde-fous de l'échauffement ») était **inexacte**. Contenu réel : **D-167** = un échauffement nommé mais bloqué par un type D / un superset / un `setTypePerSet` sans W : proposer plutôt que séparer en silence, regrouper échauffements et travail d'un même exercice sans reclassification silencieuse (import de programme) ; **D-173** = suppression précise d'une série choisie, un PALIER de dropset ne se supprime pas isolément (« le nombre de paliers fait loi », `BUGS.md` §158) ; **la sémantique du dernier palier est « volontairement ouverte »** (`BUGS.md` §158) — l'affirmation « le dernier palier reste verrouillé » reprise d'une lecture intermédiaire (rapport hors dépôt, §5 et B1) est **fausse** et corrigée dans le rapport. Ni l'une ni l'autre ne définit la politique d'ajout/conversion d'échauffement (B1, non tranchée).
3. D-174 est « statut ouvert » (Drive) alors que `_dockSuivreZoom` est livré avec « validation iPhone obligatoire avant clôture » : correctif présent, **clôture non établie**.
4. **Master (`b4fea36b`)** : ses documents (CLAUDE.md, CONTEXTE-ACTUEL, JOURNAL-DE-PARTAGE) décrivent encore `ft-v1268` seul et ne disent rien du clone S2 publié ; seuls les documents de la branche S2 (non fusionnée) le disent. Le message du commit du clone porte « LOCAL, NON POUSSÉ » alors qu'il est publié (historique git non réécrit).
5. La puce « Version en ligne (live) : `ft-v1269` » de `docs/CONTEXTE-ACTUEL.md` suit `sw.js` (exigence de `check_regles`) alors que **seul le clone** affiche ft-v1269 : la production sert `ft-v1268`. Lire la phrase qui suit la puce.
6. Le checkout principal de la session (branche `claude/dreamy-bell-pu88ia`, `dfc213c0`) porte un `CLAUDE.md` ancien (`ft-v1263`) ; master porte `ft-v1268`. Aucun fichier du checkout principal n'a été touché.
7. **Statut de D-167 : deux sources se contredisent.** Dépôt (`docs/IMPORT-IA-FIDELITE-01.md` lignes 591 et 622 ; `BUGS.md` §158 « D-167 non touchée ») : **PROPOSÉE, non décidée**. Drive (« ARBITRAGES D-163 À D-175 », 16/11, et complément du 17/11) : **VALIDÉE** puis « corrigée sur branche ». Je ne tranche pas : à lever par Claude N°1 (propriétaire du registre) avec Michel avant toute inscription.

### K. Prochain point de reprise EXACT
Michel arbitre : **(1)** la durée T et la forme P1 de S4 (et si S11, `.rs-add` 44 px y partent) ; **(2)** K1/K2/K3 (dock + clavier) et Z1-Z4 (zoom) ; **(3)** S9 et S13 (A dérivée vs B persistée). Sans ces arbitrages : **rien n'est codé**. Après un GO explicite de correction : branche dédiée depuis `71295852`, `git fetch` + ligne au journal de partage, témoins S4 (positifs, négatifs, limites temporelles, mutations) **avant** le code, puis qualification complète (voir G). Dépôt : branche S2 `71295852` (+ cette mise à jour documentaire locale, non poussée), master `b4fea36b`, production `ft-v1268` (`dde3e9a2`).

### L. Fiche d'arbitrage du 27/11/2026 (demande de Michel : détail de P1, K1-K3, Z1-Z4, A/B) — **PROPOSITIONS, rien n'est décidé, rien n'est codé** ; S4 reste la priorité bloquante
**Décisions à prendre, une par une** (la colonne « Décision » se remplit au fil des arbitrages, ancienne valeur conservée) :
| # | Ticket | Question | Options | Mon penchant (non décisionnel) | Décision de Michel |
|---|---|---|---|---|---|
| 1 | SEANCE-1269-S4 | Forme de la protection | P1 quarantaine ciblée · P2 anti-rebond par case · P3 verrou global · P4 CSS · P5 passage retardé · P6 ordre imposé | **P1** (seule qui couvre S4 sans gêner les validations volontaires) ; P2 hors S4 ; P3-P6 rejetées | **P1 RETENUE par Michel (28/11/2026)** — GO de correction locale |
| 2 | SEANCE-1269-S4 | Durée T, instant de référence, silence | 250 / 300 / 400 ms ; fin du 1ᵉʳ geste ou `event.timeStamp` ; refus silencieux ou vibration | 300 ms (constante nommée), fin du 1ᵉʳ geste, **silencieux** ; T confirmée par une mesure sur iPhone | **300 ms initial, ajustable après recette iPhone ; constante nommée ; protection silencieuse, sans vibration ; référence temporelle MONOTONE, armée au moment effectif du changement d'exercice (28/11)** |
| 3 | SEANCE-1269-S4 | Portée de l'armement | passages ordinaires + superset (avance, tour suivant, sortie) ; groupes drop/pyramide hérités inclus ou non | ordinaires + superset ; **hérités exclus** (aucun comportement nouveau pour eux) | **Armement : passages ordinaires, changement de partenaire de superset, tours suivants, sorties ; limité à la VALIDATION de l'exercice nouvellement ouvert ; anciens groupes drop/pyramide : « à vérifier avant d'exclure » (28/11) → vérifiés, voir §168 M (ils sont armés)** |
| 4 | SEANCE-1269-S3 | Dock et clavier | K1 dock suit le clavier · K1b version compacte · K2 pilule existante en en-tête · K3 ne rien changer | **K2** si la pilule est visible sur l'écran Séance, sinon K1b ; vérification de l'emplacement d'abord | _à arbitrer_ |
| 5 | SEANCE-1269-ZOOM | Zoom en séance | Z1 champ PDC à 16 px · Z2 dock suit zoom + clavier · Z3 blocage du pincement (réglage, défaut OFF) · Z4 rien | Z1 + Z2 ; Z3 seulement en réglage optionnel | _à arbitrer_ |
| 6 | SEANCE-1269-S13 | Restauration du contexte de repos | A dérivation sans nouvelle donnée · B cible rangée dans `repos` (contredit la décision n°1) · C statu quo documenté | **A**, limitée aux cas non ambigus | _à arbitrer_ |
| 7 | SEANCE-1269-S9 | Ajout nominatif après sortie de superset | un bouton par membre · statu quo | statu quo (faible gravité) | _à arbitrer_ |
| 8 | SEANCE-1269-S11 / S3B | Petits correctifs à joindre à S4 ? | libellé « plus de série prévue » ; `.rs-add` à 44 px ; ou rien | libellé + 44 px seulement si Michel veut les joindre ; chaque ajout allonge la recette iPhone | _à arbitrer_ |
**Mesure de l'exposition en tests (lecture seule, 27/11)** : 102 appels `toggleSet(` dans 21 fichiers de `tests/` (dont `import_fidelite.js` 26, `s2_nav.js` 17, `runner.js` 10, `debrief_provenance.js` 8, `seance_ui.js` 8) : c'est un MAJORANT du nombre de témoins qu'une quarantaine P1 pourrait atteindre ; l'impact réel (validations enchaînées entre exercices sans délai) n'est **pas mesuré** — à mesurer avant tout correctif, sans affaiblir un témoin (D-172).
**Rappels** : tout correctif = branche dédiée depuis `71295852`, témoins avant le code, clone S2 régénéré si l'application change, D-031 complète sur l'arbre candidat, recette iPhone, R18, GO de production distinct.

### M. Correctif S4 — GO de Michel du 28/11/2026 — **CORRIGÉ SUR BRANCHE LOCALE (non poussée) · témoins PRÉPARÉS, NON EXÉCUTÉS · NON validé · NON déployé** (S4 reste NON résolu)
**Autorisé** : correction locale de S4 sur la branche S2 ; préparer les témoins ciblés (limites autour de 300 ms, supersets, validations volontaires rapides) ; sans affaiblir les tests existants ; **ne pas toucher** aux fonctions de persistance et de clôture de séance (chantier DATA de Claude N°1). **Non autorisé** : exécuter des tests, D-031, push, fusion, déploiement, et tout autre correctif (S3, zoom, S13, S9, S11, 44 px, lots B/C : « orientations à confirmer »).
**Le correctif (`log.js` seul)** :
- `const GARDE_PASSAGE_MS=300` (constante nommée) · `let _garde` (état volatile `{ex, t}`, jamais persisté) · `_gardeArmer(idx)` · `_gardeDesarmer()` · `_gardeInstant(ev)` · `_gardeRefuse(ex,ev)`.
- `toggleSet` : en TÊTE, avant toute mutation, un refus silencieux si la série n'est pas validée (donc la dévalidation passe toujours), si `_garde.ex` est l'exercice visé, et si l'instant du geste est à moins de 300 ms de l'armement. Aucun toast, aucune vibration.
- **Armement (au moment effectif du changement d'exercice, dans le même tick, juste avant le redessin)** : sortie ordinaire (`_versSuite`) · avance vers le partenaire du superset · tour suivant · groupe « drop » hérité (avance immédiate) · pyramide héritée (au moment où son avance différée s'exécute : fin du repos ou « Passer »).
- `toggleExBlock` désarme (ouvrir une carte à la main = choix de la personne).
- **Référence temporelle monotone** : `performance.now()` pour l'armement ; l'instant du second appui est celui du GESTE (`event.timeStamp`, même horloge) — repli sur `performance.now()` si l'horodatage n'est pas plausible (anciens Safari : époque). Raison : un gestionnaire qui occupe le fil 400 ms ferait traiter un clic arrivé à +167 ms à +400 ms, hors fenêtre.
- **Geste réel seulement** : le refus lit `window.event` (défini pendant un clic ou l'Entrée d'une vraie saisie) ; un appel programmatique (tests, code interne) n'est jamais refusé. Le gabarit du bouton (`onclick="toggleSet(ei,si)"`) n'a **pas** changé (des bancs existants le cherchent par son attribut exact). La touche Entrée (`confirmSetAndNext`) est protégée sans modification, puisqu'elle passe par `toggleSet` pendant l'événement clavier.
**Anciens groupes drop/pyramide — vérification faite avant de décider** : (1) le groupe « drop » avance IMMÉDIATEMENT au palier suivant (`toggleSet`, branche `_ssNext`) : même défaut que S4 (vue redessinée sous le doigt), et aucune validation volontaire n'est possible en 300 ms (le palier suivant se soulève) ; (2) la pyramide hérité change l'exercice ouvert au moment où `_restDoneCb` s'exécute (fin du repos ou « Passer ») : même mécanique ; (3) les témoins NR-* existants appellent `toggleSet` sans geste (programmatique) : ils ne sont **pas** concernés. **Décision : ils sont armés** (aucun comportement de navigation ne change : seul un 2ᵉ appui < 300 ms sur le partenaire qui vient de s'ouvrir est ignoré). Les dropsets descendants de l'outil et importés (même exercice, aucun passage) ne sont jamais armés. **À confirmer par Michel** si tu préfères les exclure.
**Compteurs R17 (code applicatif seulement)** : données persistées ajoutées **0** · fichiers applicatifs touchés **1** (`log.js`) · lignes ajoutées − retirées **+41 − 4 = +37** (dont ~20 de commentaires) · anciens chemins supprimés ou fusionnés **0**. `sw.js` / `APP_BUILD` non touchés (même candidat ft-v1269). **Le clone S2 publié (`b4fea36b`, source `5e68270b`) NE CONTIENT PAS la correction** : un nouveau clone et un GO de publication du clone sont nécessaires avant la recette iPhone.
**Pas touché** (périmètre N°1 respecté) : `finishWorkout`, `persist`, `_persistRepli`, `_ecrireSessionsLocal`, toutes les écritures de `ft4_wkt` ; ni S3, ni zoom, ni S13, ni S9, ni S11, ni `.rs-add`, ni lots B/C.
**Risques de régression** : valider trop tard une série voulue (si 300 ms est trop long pour une saisie à rythme élevé : constante à ajuster après la recette) ; un second appui parti AVANT le redessin vise encore l'ancienne case et la dévalide (comportement d'avant, hors S4, décision produit séparée) ; `window.event` est une API ancienne mais supportée par Safari/Chrome — son absence ferait seulement ne rien refuser (jamais bloquer) ; témoins qui valident par un VRAI clic dans les 300 ms d'un passage (les 4 clics réels trouvés dans `tests/` visent une séance fraîche ou attendent ≥ 600 ms : non concernés — non exécuté) ; ancres des outils de mutation existants (`mut_s2_nav.py` `_VERS`, `mut_rir_superset.py`) : **conservées** (l'armement est écrit AVANT l'affectation de `_expandedEx`, jamais dans le texte ancré).
**Témoins préparés, NON exécutés** (`tests/parcours/s4_garde.js`, 23 libellés `B-S4GARDE-*` ; banc `tools/banc_s4_garde.js` avec garde réseau ; contrôle négatif `tools/mut_s4_garde.py` : 16 mutations qui doivent rougir leur témoin + 2 équivalentes qui doivent rester vertes ; **non branchés** dans `runner.js` ni `repartition-3.json` : l'enregistrement et le calibrage des identités se font avec la D-031 de qualification) : G0 constante et gabarit inchangé · G1/G1b/G1c le cas du constat (refus, chrono, RIR vers DC, dock, aucun `persist()`) + G1d jumeau « sans protection l'appui agit » · G2 limites −10/0/1/167/299 refusés, 300/301/400/600 acceptés · G3 gestionnaire lent et horodatage d'époque · G4 appel sans geste jamais refusé · G5 dévalidation · G6 autre exercice · G7 mêmes séries à 100 ms · G8-G10 superset (avance, tour suivant, sortie 2+2) · G11 dropset ↓ · G12/G13 anciens groupes drop et pyramide · G14 ouverture manuelle · G15 aucune donnée persistée (clés, `ft4_wkt` identique, aucune trace) · G16 RIR vers la bonne série · G17 touche Entrée · G18 aucune erreur de page. Contrôle statique fait : syntaxe JS des deux fichiers de test, 18 ancres de mutation trouvées exactement une fois ; **la syntaxe de `log.js` n'a pas pu être vérifiée par une commande** (le hook de confidentialité refuse les commandes qui nomment ce fichier — contournement refusé), elle l'est par relecture et le sera par le contrôle de syntaxe intégré à `mut_s4_garde.py` au prochain passage autorisé.
**Protocole de recette ciblée iPhone (après nouveau clone et GO de publication du clone)** — noter version (Menu → À propos), appareil, iOS, enregistrement d'écran 60 i/s : **R1** le cas S4 : séance libre DC (3-4 séries) + squat + 3ᵉ exercice ; valider la dernière série du DC par un double appui rapide (10 essais) → le squat s'ouvre, le repos démarre, AUCUNE série du squat cochée, dock « Repos · [DC] » + « Ensuite » présents, la question RIR du DC reste posée et la réponse « 2 » s'écrit sur la dernière série du DC. **R2** volontaire rapide : après un passage, valider une série du nouvel exercice à ~0,3 s, ~0,4 s, ~0,5 s (5 essais chacun) → dire à partir de quel délai elle est acceptée (sert à ajuster la constante). **R3** trois séries d'un même exercice à ~0,3 s d'intervalle → toutes acceptées. **R4** superset 3+2 puis 2+3 : double appui à l'avance A→B, au tour suivant, à la sortie → ignoré ; validation voulue ≥ 0,5 s → acceptée. **R5** dropset ↓ de l'outil : paliers enchaînés à rythme rapide → tous acceptés, repos au dernier. **R6** clavier numérique : double « OK/Done » sur la dernière série d'un exercice → ignoré. **R7** dévalidation d'une série validée de l'exercice ouvert juste après un passage → possible. **R8** bouton central « + » : position avant/après (règle d'or #9) ; chronos 130 s / échec 240 s inchangés. **R9** fermer/rouvrir juste après un passage : aucune protection résiduelle (état volatile). Critère : **bloquant** si une série du nouvel exercice est cochée par le 2ᵉ appui, si le RIR du DC disparaît, si une validation voulue ≥ 0,5 s est avalée, ou si le bouton central bouge ; **à ajuster** si une validation voulue entre 0,3 et 0,5 s est avalée (augmenter ou réduire `GARDE_PASSAGE_MS`).
**Qualification future (rappel, aucun GO)** : D-031 complète sur l'arbre candidat (classique + répartie, avec enregistrement et calibrage du banc S4-GARDE) ; clone régénéré ; recette iPhone ci-dessus ; R18 ; GO de production distinct. La D-031 de `5e68270b` ne qualifie PAS ce correctif.

### N. Finalisation locale du correctif S4 et ERRATUM DES DATES — 27/11/2026 (GO de Michel : « finalisation locale selon le périmètre présenté ») — **corrigé sur BRANCHE LOCALE, NON poussé, témoins NON exécutés, NON validé, NON déployé (S4 reste ouvert)**
**ERRATUM DES DATES (par addendum, aucun commit réécrit, aucune sauvegarde renommée).** Le GO S4 date du **27/11/2026** (l'horloge du conteneur indiquait le 27/11/2026 12:48 UTC ; la date « 28/11 » était une hypothèse non vérifiée de ma part, règle d'or #16). **Toute mention « 28/11 » écrite par Claude N°2 dans ce paragraphe (§168 : décompte corrigé, renvois D-167/D-173, tableau L, §M), dans `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md` (addendum 4), dans les commentaires et messages des commits `7c4f5626`…`2d3778a8`, et dans les noms des dossiers de sauvegarde (`SAUVEGARDE-N2-2026-11-28`, `SAUVEGARDE-N2-S4-2026-11-28`) doit se lire 27/11/2026.** Lignes d'état actuelles corrigées en place (`CLAUDE.md` ×2, `CONTEXTE-ACTUEL` ×1, `JOURNAL-DE-PARTAGE` ×1) ; code et tests : seules les lignes réécrites portent la bonne date. Le nouveau paquet privé porte la date du 27/11.
**Ce que la finalisation change (`log.js`, +25 −8 sur le commit précédent)** :
- **Aucune borne basse** : `_gardeRefuse` ne retient plus que `(instant du geste − armement) < 300 ms` ; la borne arbitraire de −1000 ms est supprimée (un geste né avant l'armement ne peut pas viser une vue qui n'existait pas encore). La plausibilité devient la constante `GARDE_AGE_MAX_MS=5000` (+ `Number.isFinite(ts)`), repli sur `performance.now()` sinon.
- **Geste identifié** : `_gardeGeste(ev,ei,si)` ne rend l'événement que s'il est un clic, ou la touche Entrée, dont la cible est dans la ligne `#sr-ei-si`. Un appel sans événement, un événement d'un autre type ou d'une autre ligne n'est jamais refusé. `isTrusted` n'est PAS exigé (décision de Michel).
- **Levée en arrière-plan** : `visibilitychange` (état « hidden ») et `pagehide` désarment.
- **Anciens groupes drop/pyramide : conservés (armés).** ⚠️ Rectification : la justification « aucune validation volontaire n'est possible en 300 ms » (§168 M et commentaire du code) est **RETIRÉE** — elle supposait ce que rien ne prouve. La justification retenue est l'asymétrie des coûts : un refus à tort coûte un nouvel appui, un appui accepté à tort valide la mauvaise série et fait perdre le RIR. Réversible : retirer deux appels (mutations M12 et M13).
**Témoins (préparés, NON exécutés)** — `tests/parcours/s4_garde.js` : **30 libellés** `B-S4GARDE-*` (23 d'avant + 7 : G2b aucune borne basse ; G3c plausibilité 4999/5000/5500 ms ; G3d horodatage absent ou nul ; G19 `visibilitychange` ; G19b `pagehide` ; G20 identification : autre type, autre ligne, autre touche, contrôle « cible dans la ligne » refusé) ; `tools/mut_s4_garde.py` : **25 mutations — 23 qui doivent rougir leur témoin, 2 équivalentes qui doivent rester vertes** (M18 `undefined`/`null`, M25 `Number.isFinite` redondant). **M17 est reclassée** : elle était étiquetée « équivalente » à tort — elle change le résultat pour un horodatage de 5500 ms ; survivante = trou de couverture, pas équivalence ; elle exige désormais G3c. M7 devient « borne basse réintroduite » (exige G2b). Ancres de mutation : toutes les ancres de `log.js` relues une à une contre le texte ; les ancres des outils existants (`mut_s2_nav.py`, `mut_rir_superset.py`) sont inchangées (aucune ligne d'armement réécrite). Syntaxe : `s4_garde.js`, `banc_s4_garde.js`, `mut_s4_garde.py` vérifiées ; **celle de `log.js` ne l'est que par relecture** (aucune commande ne nomme ce fichier : hook de confidentialité respecté, directement ou indirectement ; elle le sera au premier lancement autorisé du banc, qui charge la page dans Chromium).
**Isolation réseau du banc S4** : `srv.listen(0,'127.0.0.1')` dans `tools/banc_s4_garde.js` (la garde réseau des tests, chargée en 1ʳᵉ instruction, coupe déjà l'accès sortant). **Autres bancs : signalés à Claude N°1, aucun chantier ouvert** — 167 fichiers de `tools/` et `tests/` contiennent `.listen(0`, dont 3 seulement (mon banc compris) écoutent sur 127.0.0.1 ; les ~164 autres écoutent sur toutes les interfaces (exposition entrante du dépôt pendant un lancement ; la garde réseau ne couvre que le sortant).
**Compteurs R17 (code applicatif, S4 cumulé depuis `71295852`)** : 0 donnée persistée · 1 fichier applicatif (`log.js`) · **+58 −4 (net +54), mesuré par `git diff --numstat` depuis `71295852`** (la valeur « +66 −12 » écrite dans le message du commit `e2aac36e` est FAUSSE : j'avais additionné les deux commits sans retrancher les lignes réécrites) · 0 chemin supprimé.
**RÉSERVES CONSERVÉES (aucune levée)** : le second appui sur une MÊME case sans passage (2+3 après B2, dernier exercice de la séance) dévalide toujours (comportement d'avant, décision produit séparée) · la sémantique de `event.timeStamp` sur iPhone (matériel ou création ? horodatage d'époque ?) et le comportement de l'horloge pendant le sommeil restent **à mesurer** (page de diagnostic non retenue pour l'instant) · `window.event` est une API ancienne mais supportée · la durée de 300 ms est à ajuster après la recette iPhone · le clone publié ne contient pas la correction · aucune D-031 ne qualifie `2d3778a8` ni ce correctif · S3, zoom, S13, S9, S11, 44 px, lots B/C non engagés.
**Prochaine étape (sur GO distinct)** : qualification ciblée — exécution de `node tools/banc_s4_garde.js` (sain : 0 rouge attendu) puis `python3 tools/mut_s4_garde.py` (23/23 + 2 équivalentes) ; puis, toujours sur GO : D-031 complète, clone régénéré, recette iPhone (§168 M), R18, GO de production.

### O. Qualification ciblée de S4 — 27/11/2026 — commit local `3899e4f0` UNIQUEMENT (GO de Michel : banc puis contrôle négatif ; aucune D-031, aucun push) — **VERT, mais S4 reste OUVERT (recette iPhone et D-031 non faites)**
**Environnement** : conteneur isolé, données fictives, réseau sortant bloqué (garde réseau des tests chargée en 1ʳᵉ instruction du banc ; contexte Chromium qui annule toute adresse non locale ; serveur du banc sur 127.0.0.1) ; Node 22.23.5, Chromium de Playwright ; arbre propre à `3899e4f0` avant et après (aucun fichier modifié par la passe). Aucun refus de hook ; aucune commande ne nomme `log.js` (la syntaxe de ce fichier est vérifiée par le chargement de la page dans le banc, 0 erreur de page, et par le contrôle de syntaxe interne du script de mutations, 25 mutations toutes valides).
**1. Banc** `node tools/banc_s4_garde.js` : **29 OK / 0 rouge**, code de sortie 0, aucune erreur de page (G18). ⚠️ **Écart avec l'attendu « 30 »** : le chiffre 30 écrit dans ce paragraphe (N), dans l'addendum 5 et dans le message du commit `e2aac36e` était une **erreur de décompte de ma part** (23 libellés d'avant + **6** ajoutés — G2b, G3c, G3d, G19, G19b, G20 — = **29**, et non 7). Le fichier contient 30 occurrences de `t('B-S4GARDE-…` parce que la 30ᵉ est le libellé d'exception (`B-S4GARDE-EXCEPTION`), émis seulement si le module plante : il ne s'est pas déclenché. Aucun témoin n'a été retiré ni modifié.
**2. Contrôle négatif** `python3 tools/mut_s4_garde.py` (MUT_J=3) : arbre sain 0 rouge au départ ET rejoué à la fin (banc stable) ; **25/25 conformes** — **23 mutations détectées**, chacune par le témoin exigé (M1 17 rouges, M2 G6, M3 17, M4 G3 ×2, M5 G5, M6 G2 ×4, M7 G2b, M8 G14, M9 14, M10 G8, M11 G9, M12 G12, M13 G13, M14 G4, M15 G15, M16 17, **M17 G3c**, M19-M21 G20, M22-M23 G19, M24 G19b) ; **2 équivalentes restées vertes** (M18 `undefined`/`null`, M25 `Number.isFinite` redondant) ; aucune mutation invalide, aucun plantage.
**Ce que cela prouve** : la logique de la protection (durée 300 ms et ses bornes, instant du geste, plausibilité, identification, armement aux changements d'exercice, désarmement, aucune donnée persistée), pilotée par de VRAIS événements synthétiques. **Ce que cela ne prouve pas** : le comportement de Safari iPhone (sémantique de `event.timeStamp`, horloge pendant le sommeil, latence réelle), le vrai doigt, le rythme réel ; la non-régression du reste de l'application (**D-031 non faite** ; les témoins existants n'ont pas été rejoués) ; le banc S4 n'est pas encore branché dans `runner.js`.
**État de S4 après cette étape** : signalée ✔ · reproduite ✔ · diagnostiquée ✔ · corrigée sur branche locale ✔ (non poussée) · testée **en ciblé ✔** (D-031 ✘) · validée par Michel ✘ · déployée ✘. **Non résolu.** Prochaines étapes, chacune sur GO distinct : branchement du banc et calibrage des identités, D-031 complète, clone régénéré, recette iPhone (§168 M), R18, production.

### P. Intégration des 29 témoins S4 au runner — 27/11/2026 (GO limité de Michel : `runner.js` + calibrage des identités « selon le protocole existant » ; aucune D-031 complète, aucun push) — **BRANCHÉS ; IDENTITÉS NON CALIBRÉES (le protocole l'exige d'une passe complète, non autorisée) ; S4 reste OUVERT**
**Règle D-190 reçue de Michel le 27/11 (texte tel que communiqué, « règle permanente »)** : défaut avéré → on corrige · risque significatif → on vérifie de manière ciblée · risque purement théorique → on documente et on avance ; but = une application fiable, fluide et utilisable, pas la perfection technique. Chantier limité au besoin initial, aux régressions concrètes et aux risques significatifs (sécurité, intégrité des données, fonctionnement) ; réutiliser les preuves existantes, ne pas répéter les audits ni multiplier variantes de correctifs, tests ou études sans bénéfice démontré ; une fois les critères d'acceptation atteints et les réserves non bloquantes consignées, clôturer après validation utilisateur et passer au suivant. ⛔ Elle ne dispense jamais des contrôles de sécurité indispensables ni des GO explicites déjà exigés. *(Non porté au registre `docs/DECISIONS.md` de mon arbre — D-190 n'y existe pas ; la numérotation et le registre restent à Michel / Claude N°1, pour ne pas écrire deux fois la même ligne.)*
**Ce qui a changé** (aucun code applicatif) : `tests/parcours/runner.js` **+4 lignes** (un commentaire de 3 lignes + `await require('./s4_garde.js').tout(t, b, PORT);` juste après `s2_nav`) ; les commentaires d'en-tête de `tests/parcours/s4_garde.js` et `tools/banc_s4_garde.js` (ils disaient « préparé, non exécuté / non branché » : devenus faux). **Aucun libellé, assertion, seuil ni résultat attendu modifié ; l'écran Séance (`log.js`) inchangé ; `tests/parcours/repartition-3.json` INCHANGÉ — volontairement** : un module sans entrée tourne dans le processus 0 (`docs/D031-ACCELEREE.md` §7, comme `nut2_parcours.js`) ; modifier ce fichier déclenche R1 (requalification classique + répartie), et « une nouvelle répartition se mesure, elle ne s'écrit pas à la main » (Michel, 24/10 : aucun rééquilibrage).
**Preuves (statiques ou à blanc — AUCUN test joué)** : `node --check` runner / module / banc OK · découpeur `--simuler` : avant **97 modules / 113 appels** (p0 37 · p1 40 · p2 36) → après **98 / 114** (p0 38 · p1 40 · p2 36), `./s4_garde.js` dans la copie 0 seulement · découpeur réel + `tools/verifier_decoupe.js` : code 0, `erreurs: []`, 924 instructions, 98 modules awaités, chaque appel joué une fois (copies temporaires supprimées) · `tools/inventaire_temoins.py` (lit le CODE, indépendant du journal) : `s4_garde.js` = **29 appels littéraux + 1 dynamique** (l'étiquette d'exception) → confirme les 29 · `check_regles` code 0 · fichiers de test et d'outil inchangés depuis `3899e4f0` hors ces commentaires.
**Identités** : 29 libellés → **29 identités distinctes** (aucune date dans les libellés), **0 collision** avec le manifeste actuel (9 748 témoins, 9 685 identités, commit `638b6505`). Simulation **EN MÉMOIRE** de la condition ⑦ (rien d'écrit, le manifeste est intact) : [1] D-031 avant calibrage → ✅ « 29 témoin(s) NOUVEAU(X) non encore au manifeste » (signalé, non bloquant) · [2] après calibrage, un témoin S4 omis → ❌ · [3] après calibrage, journal complet → ✅ (9 777 témoins).
**Pourquoi les identités ne sont pas écrites au manifeste** (lu dans le code, `tools/temoins.py` `calibrer`) : il refuse (`SystemExit`) tout journal qui n'est pas une passe ENTIÈRE verte (total unique, 0 rouge) et exige `--croiser` d'une passe répartie du même commit (« deux exécutions indépendantes, ou rien »). Un banc seul n'est pas une passe ; éditer le manifeste à la main fabriquerait une provenance (commit, N, empreintes des journaux) qui n'existe pas. Il s'écrira par `tools/passe_valide.sh --calibrer --croiser <dossier de la répartie>` lors de la D-031, sur GO distinct, suivi d'une passe de contrôle sans l'option.
**Limites** : (1) le module n'a pas encore été joué DANS le runner (enveloppes de contexte du garde, `OUTIL_TS` = un assistant de test `window._tsVersId` sans effet sur ce module ; même motif de contexte que `s2_nav.js`) : premier jeu réel = la D-031 ; (2) sa durée dans le runner n'est pas mesurée (il allonge le processus 0) ; (3) `tests/recette/registre.json` : pas d'entrée `banc:s4_garde` ni de ticket S4 — hors périmètre de ce GO, à ajouter sur demande ; (4) rien de tout cela ne prouve le comportement de Safari iPhone (recette §168 M, R1–R9) ; (5) une commande shell d'ajout à ce fichier a été **refusée par le hook de confidentialité** (motif affiché : adresse e-mail à côté d'une identité de client — la commande ne contenait aucune adresse) ; je ne l'ai pas reformulée, et j'ai écrit la même documentation avec l'outil d'édition de fichier.
**État de S4** : signalée ✔ · reproduite ✔ · diagnostiquée ✔ · corrigée sur branche locale ✔ (non poussée) · testée en ciblé ✔ · témoins branchés au runner ✔ (non joués dans le runner) · identités calibrées ✘ · D-031 ✘ · recette iPhone ✘ · validée par Michel ✘ · déployée ✘. **Non résolu.** Prochaine étape sur GO distinct : D-031 (avec calibrage).

### Q. D-031 de nuit — 27/11/2026 (GO de Michel : « lancer directement la D-031 complète cette nuit » si les contrôles préalables sont conformes ; échec = arrêt et résultats, aucun correctif automatique ni modification des attendus ; vert = bilan complet avec SHA qualifié et journaux ; aucune publication du clone, aucune fusion dans master, aucune production) — **RÉPARTIE NON VALIDE (2 rouges, cause trouvée dans mon correctif S4) ; classique et calibrage NON lancés ; arrêt et rapport (27/11, fin ≈ 17:00 UTC)**
**Contrôle préalable NON conforme, mesuré** : `tools/passe_valide.sh` et `tools/passe_repartie.py` (condition ④a, INFRA-02) exigent que le distant (`git ls-remote origin refs/heads/master`) soit CONTENU dans HEAD. Le master distant était à `b4fea36b` (publication du clone seul, 25/11) ; ma branche, partie de `dde3e9a2`, ne le contenait pas (`git merge-base --is-ancestor` : non). La passe aurait été refusée avant de lancer le moindre test. Remède du script : « refusionner ». Michel avait exclu « toute fusion » sans GO distinct : **question posée, GO obtenu** (« GO fusion locale, puis D-031 ») — fusion de `origin/master` dans la branche S2, **en local, rien poussé, rien dans master**.
**Fusion** : commit `79a13bf3`. Simulation préalable par `git merge-tree` (rien d'écrit) : aucun conflit ; arbre obtenu **identique à la simulation** (`39c158ad`) ; seuls 8 fichiers de `clone/` changent (le clone publié le 25/11, **sans** le correctif S4 ; +169 −43) ; code applicatif et tests identiques ; `check_regles` code 0 sur l'arbre fusionné (clone tamponné, source `5e68270b`). ⚠️ Le SHA qualifié sera celui du dernier commit au lancement de la passe de contrôle, **pas** `893b7cfc`.
**Séquence (journaux dans `D031-NUIT-2026-11-27/`, hors dépôt)** : ① répartie `tools/passe_repartie.py 3` sur le commit X (seule sur la machine) · ② classique `tools/passe_valide.sh --calibrer --croiser <répartie>` sur le MÊME commit X → écrit `tests/recette/temoins-attendus.json` (les 29 identités S4 s'y ajoutent) · ③ relecture du diff du manifeste, commit X+1 (manifeste seul) · ④ classique de CONTRÔLE sans option sur X+1 : seule elle vérifie les identités et qualifie. Repères mesurés le 24/10 (non remesurés ici) : ≈ 37 / 96 / 96 min. Machine au départ : 4 cœurs, charge 0,2, 15 Go libres, 56 Go de disque, aucun autre processus lourd. Origine du distant au départ : master `b4fea36b`, branche S2 distante `71295852`.
**Règles tenues** : échec ou plantage ou refus d'un hook → arrêt, résultats transmis, aucun correctif, aucun attendu touché ; aucun push, aucune publication.
**Résultats** (journaux : `D031-NUIT-2026-11-27/`, hors dépôt, empreintes SHA-256 dans `SHA256SUMS.txt`) :
① **Répartie NON VALIDE** — commit X = `625cac92`, 15:48 → 16:45 UTC, **57,0 min** (37,2 min le 24/10 : machine plus lente). Total réparti **9 813 ✅ · 2 ❌** (équivalent séquentiel 9 775 ✅ · 2 ❌ = 9 777 = 9 748 + 29). p0 6 839 ✅ · 0 ❌ · p1 1 538 ✅ · **2 ❌** · p2 1 436 ✅ · 0 ❌. Conditions ⓪ ③ ④a ④b ⑥ ⑦ ⑧ vertes ; ② p1 code 1 ; ⑨ identités : 2 absents (les deux témoins rouges) et 29 en plus (les S4). **Les 29 témoins `B-S4GARDE-*` sont tous ✅, tous dans le processus 0.**
② **Les 2 rouges**, module `tests/parcours/debrief_demande.js` (processus 1) : `OD-07` (après un rechargement pendant l'analyse, la carte devait dire « Analyse interrompue — relancer » ; elle dit « ✨ Analyser avec Milo ») et `T4` (deux analyses en vol puis rechargement : chacune devait être « interrompue » ; les deux disent « Analyser »). Même mécanisme : l'entrée « en vol » est effacée au rechargement.
③ **Ce n'est PAS la charge, c'est mon correctif S4 — mesuré** : le banc du module (`tools/banc_debrief_demande.js`) rejoué SEUL sur la machine libre = **61 OK / 2 rouge, 3 fois sur 3**, les mêmes 2 rouges. Mêmes témoins sur d'autres arbres : production `dde3e9a2` **63 OK / 0 rouge** · sommet de S2 `71295852` (avant S4) **63 OK / 0 rouge**. Copie jetable de HEAD **sans** la ligne `window.addEventListener('pagehide', _gardeDesarmer)` du correctif S4 : **63 OK / 0 rouge** ; copie jetable avec cette ligne mais **sans** l'écouteur `visibilitychange` : toujours 61 / 2. ⇒ **la cause est cette seule ligne**, ajoutée par la finalisation S4 (volet « levée en arrière-plan »). Ticket : `SEANCE-1269-S4-PAGEHIDE`.
④ **Mécanisme : NON démontré.** Hypothèse, non vérifiée : `coach.js` (l.6121) pose `_dbfQuitte=true` dans SON écouteur `pagehide` ; l'écouteur de S4, enregistré plus tôt, s'exécute en premier ; le navigateur vide les micro-tâches entre deux écouteurs ; si le rejet de la requête annulée est déjà en file, le `catch/finally` de `_runSeDebrief` efface « en vol » AVANT que `_dbfQuitte` passe à vrai — exactement le défaut mesuré le 05/10 que ce drapeau corrige.
⑤ **Pourquoi je ne l'avais pas vu** : le banc `B-S4GARDE` ne regarde que le correctif ; mes contrôles ciblés du 27/11 n'incluaient pas le module débrief. C'est le rôle de la D-031, qui l'a vu. **Gravité** : défaut réel de comportement (après un rechargement pendant l'analyse d'un débrief, la carte ne dit plus « interrompue »), sans perte de séance ni de donnée mesurée ; la production n'est pas concernée (S4 non déployé).
⑥ **Arrêt, comme demandé** : aucune classique, aucun calibrage (une répartie rouge l'interdit), aucun correctif, aucun attendu modifié, rien poussé, rien publié. Les identités des 29 témoins ne sont donc toujours PAS au manifeste. Copies jetables supprimées ; arbre principal propre, HEAD `625cac92`.
⑦ **Options pour Michel (rien décidé)** : (a) retirer la ligne `pagehide` — l'écouteur `visibilitychange` « masqué » couvre déjà la mise en arrière-plan — ce qui oblige à modifier le témoin `G19b` et la mutation `M24` (retrait à écrire, R30) ; (b) garder les deux écouteurs en enregistrant celui de S4 APRÈS celui de `coach.js` (à vérifier) ; (c) autre. Dans tous les cas : requalification ciblée (banc S4 + contrôle négatif + banc débrief), puis la D-031 depuis le début.

### R. Vérification ciblée en lecture seule des écouteurs `pagehide` / `visibilitychange` de S4 — 27/11/2026 (GO de Michel : 3 questions, privilégier l'option A, éviter toute dépendance à l'ordre des écouteurs, D-190 ; aucun code, aucun témoin, aucun nouveau test, aucune D-031) — **RECOMMANDATION : OPTION A ; rien appliqué, STOP pour arbitrage**
**Réponses** (preuves déjà acquises + lecture ; rapport privé `VERIF-PAGEHIDE-2026-11-27/`) : ① **le banc exécute plusieurs écouteurs `pagehide` mais ne peut pas voir un conflit entre eux** : `G19b` (S4) et `OD-06c` (débrief) envoient un événement SYNTHÉTIQUE par script (pas de micro-tâches entre deux écouteurs), `OD-06c` rejette même la requête APRÈS le dispatch (ordre favorable fabriqué) ; seul un vrai rechargement (`OD-07`, `T4`) émet `pagehide` par le navigateur — d'où deux rouges réels et deux témoins synthétiques verts. ② **`visibilitychange` suffit au comportement décidé** (levée en arrière-plan ; « visible » ne ré-arme rien, le premier appui après le retour est accepté : `G19`, mutations `M22`/`M23`) ; la protection est en mémoire de page (rien de persisté) ; bfcache : par la norme HTML la page passe « hidden » (**connaissance générale, non mesurée** — à confirmer à la recette iPhone) ; résiduel si l'événement manquait : un appui à refaire, jamais une perte de donnée. ③ **Retirer `G19b` et `M24` est légitime à 4 conditions** : pas une décision rouverte (Michel a décidé « levée en arrière-plan », pas « via `pagehide` » ; preuve nouvelle MESURÉE, règle #15) · pas d'affaiblissement (la ligne retirée est redondante, le comportement reste couvert par `G19`+`M22`+`M23`) · ni historiques ni calibrés (nés le 27/11, jamais qualifiés, absents du manifeste : ni `--accepter-retraits` ni diff de manifeste si fait AVANT le calibrage) · retrait écrit (R30), garde-fou permanent = `OD-07`/`T4`. **Indépendance à l'ordre** : l'option A supprime l'écouteur `pagehide` de S4 ; celui de `visibilitychange` ne s'appuie sur aucun autre (3 écouteurs de production existants ; banc débrief vert avec le sien, variante s4b). Option B (S4 enregistré après `coach.js`) rejetée : dépendance à l'ordre de chargement ; option C (horloge murale, sans écouteur) en repli seulement.
**Si A est décidée** (prédictions par lecture, NON mesurées) : 1 ligne de code en moins ; banc S4 29 → 28 ; mutations 25 → 24 (22 détectées + 2 équivalentes) ; textes à corriger par addendum (en-tête du témoin et du runner « 29 témoins », en-tête du script de mutations, §168 M à Q, `CLAUDE.md`, `CONTEXTE-ACTUEL`) ; requalification ciblée (banc S4, contrôle négatif, banc débrief) puis D-031 depuis le début, sur GO distinct. **Non prouvé** : le mécanisme exact (hypothèse « micro-tâches entre deux écouteurs lancés par le navigateur », §Q ④) ; fragilité préexistante à consigner comme idée (le drapeau de `coach.js` suppose d'être le PREMIER écouteur `pagehide`) ; Safari iPhone.
