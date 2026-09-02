# CONTRE-AUDIT DU PLAN « MILO OFFLINE LAB »

> **Réponse à la demande explicite de GPT** (ses §73-79) : *« ne rien implémenter massivement
> avant d'avoir répondu »*, et *« toute affirmation provenant de GPT doit être re-mesurée »*.
> C'est fait. **Rien n'a été codé.**
>
> Mesuré le 02/09/2026 sur `ft-v1102`. Chaque classement s'appuie sur un chiffre ou un
> emplacement précis dans le dépôt, jamais sur un souvenir.

---

## LE VERDICT EN UNE PAGE

**Le diagnostic de GPT est juste. Son plan est en grande partie déjà construit.**

Sa thèse centrale — *« les tests déterministes prouvent la présence, pas l'obéissance ; il faut
maximiser ce qu'on peut prouver gratuitement avant de payer l'API »* — est **exacte**, et c'est
d'ailleurs déjà écrit dans les documents d'architecture du projet.

Mais le plan sous-estime massivement l'existant. **Mesure :**

| Famille proposée par GPT | Occurrences déjà dans le banc de tests |
|---|---|
| Dates / fuseaux | **153** |
| Payload et canaux de Milo | **32** |
| Personas | **32** |
| Hors ligne | **29** |
| Gardien (blessures / douleurs) | **14** |
| Chemins automatiques vs manuels | **13** |
| Contradiction écran ↔ Milo | **12** |
| Multi-onglets | **9** |
| Service Worker / pré-cache | **6** |

**Sur les 80 sections du plan : 9 décrivent quelque chose qui existe déjà et fonctionne,
14 sont partiellement couvertes, 7 sont réellement absentes et utiles, 3 sont à écarter.**

⭐ **Le vrai gain n'est donc pas de construire une nouvelle couche.** C'est de **nommer,
regrouper et rendre systématique** ce qui existe déjà de façon dispersée — et d'ajouter les
**7 trous réels**.

⚠️ **Et il y a un risque que le plan crée lui-même**, il est nommé au §D.

---

## A — CE QUI EXISTE DÉJÀ (ne pas reconstruire)

### A1. Le test du Service Worker — **§25 : EXISTE, à l'identique**

GPT propose de comparer les scripts servis par `index.html` à ceux pré-cachés par `sw.js`, et
cite le cas `supabase.js`.

**C'est exactement le bloc CLXXXIV du banc de tests, livré en ft-v1079** — et il est né de ce
cas précis. Son commentaire dit : *« ce témoin protège la RÈGLE, pas le cas : le prochain
fichier ajouté à `index.html` et oublié dans `sw.js` le fera rougir »*.

⭐ Détail qui montre que le sujet a été poussé plus loin que le plan : le témoin **retire les
commentaires avant de mesurer**, parce qu'une première version avait été verte en attrapant le
commentaire qui nommait `supabase.js`.

👉 **GPT classe cette proposition « petit chantier, gros bénéfice ». Elle est déjà encaissée.**

### A2. Le test de contradiction calcul ↔ affichage ↔ Milo — **§9/§10 : EXISTE**

C'est le témoin livré en ft-v1100 : sur une même pente de poids, **l'écran et Milo doivent dire
la même chose**, avec un propriétaire unique des plages (`_GOAL_TREND` / `_GOAL_TREND_RECOMP`
dans `state.js`), et un témoin qui **refuse toute plage réécrite en dur ailleurs**.

👉 L'exemple que GPT donne au §10 est **le cas fondateur de ce témoin**, pas une piste à ouvrir.

### A3. Le test du payload réel — **§4 : EXISTE (livré aujourd'hui)**

GPT décrit la méthode : injecter une valeur identifiable, exécuter les vraies fonctions,
chercher la valeur, vérifier le canal. C'est **littéralement** ce qu'a fait l'audit du
02/09/2026, et il a produit le résultat que GPT cite (`badges` et `dayStateLog` déclarés
transmis, mesurés absents). Le bloc de test qui fige la mesure existe.

### A4. Les tests de mutation — **§7/§8 : EXISTENT en substance**

**Mesuré : 25 blocs du banc construisent déjà DEUX contextes** dans le même test pour comparer
l'effet d'un changement (blessure, discipline, autre sport, mode de panne…).

👉 **La méthode n'est pas absente : elle n'est pas nommée.** GPT a raison sur un point réel —
il n'existe pas de catégorie « mutation » ni de rapport dédié — mais tort de la présenter comme
une couche à créer.

### A5. Les personas — **§12 à §22, §61 : EXISTENT**

Il y a deux systèmes distincts, tous deux opérationnels :

- `_vcApplyPersona()` dans le code : applique un persona **et remet à zéro 54 champs** pour
  qu'aucune donnée réelle ne fuite dans un test ;
- les personas du banc d'essai (`VM-…`, `VC-…`) : profils déclaratifs.

👉 La proposition de GPT au §61 (« les personas devraient être déclaratifs ») décrit **ce qui
est déjà le cas**.

### A6. Le Gardien testé sans API — **§40/§41 : EXISTE, partiellement**

14 occurrences dans le banc. La distinction que GPT réclame au §41 (blessure guérie + douleur
du jour) est **déjà implémentée dans le code** : `_gardienZones()` fusionne trois sources
(blessures structurées avec `status`, notes libres, douleurs du jour) et **marque la douleur du
jour comme prioritaire**.

Mesuré aujourd'hui : 0 caractère sans blessure, **1 797** avec une blessure active.

### A7. Le principe « utiliser les vraies fonctions » — **§62 : EXISTE, c'est la règle**

Tout le banc de parcours tourne dans un **vrai navigateur**, sur les **vraies fonctions**, avec
seulement `fetch` remplacé. GPT énonce comme une proposition ce qui est la pratique constante.

### A8. « Ne pas dupliquer les règles dans les tests » — **§63 : EXISTE, c'est une règle écrite**

Le projet a une famille de bugs documentée exactement là-dessus : *un témoin visé sur une
FORME plutôt que sur sa GARANTIE*. Elle a mordu **6 fois**, la dernière il y a deux jours.

### A9. Le contrôle positif obligatoire — **§6 : EXISTE, c'est LA règle de méthode du projet**

GPT écrit : *« aucune sonde ne doit conclure "cette donnée n'existe pas" sans avoir d'abord
réussi un contrôle positif »*.

C'est le réflexe n°5 du catalogue de bugs (*« quand un contrôle négatif ne rougit pas, c'est le
test qui est cassé »*), et il a été appliqué **neuf fois dans la seule journée du 02/09** — dont
sept fois où il a empêché de publier un faux trou.

👉 **Recommandation : conserver cette section telle quelle dans le plan.** C'est la seule qui
mérite d'être répétée même si elle existe.

---

## B — CE QUI EST PARTIELLEMENT COUVERT

| § | Proposition | État réel | Ce qui manque vraiment |
|---|---|---|---|
| §5 | Audit systématique des 106 champs | La classification existe **et le garde-fou refuse une donnée non classée**. Mais il vérifie qu'elle est **classée**, pas **transmise** — il le dit lui-même. | La **mesure** champ par champ, pas la déclaration. Faite pour ~15 champs aujourd'hui, pas pour les 106. |
| §23/§24 | Multi-onglets | Le mécanisme existe et **5 collections sur 13** sont fusionnées, avec témoins. | Les **8 collections restantes** — et la difficulté est nommée : elles **ne sont pas datées**. |
| §33/§34 | Canaux et fuite entre canaux | Les 6 canaux sont mesurés ; un témoin vérifie qu'**aucun prénom ne fuit dans le bloc commun**. | Un test **par canal** avec 4 marqueurs distincts. Peu coûteux, réellement utile. |
| §35/§37/§38 | Taille et composition du contexte | La taille du **bloc commun** est mesurée contre son plafond. | La **décomposition par bloc** (profil / records / santé…), qui n'existe pas. |
| §36 | Stabilité du préfixe de cache | Le principe est appliqué dans le code (l'observation du jour a été **déplacée en bas** exprès, mesure à l'appui : 46 741 caractères refacturés). | Un **test** qui le vérifie. Aujourd'hui c'est un choix documenté, pas un témoin. |
| §27 | Chemins automatiques vs manuels | 13 occurrences, famille documentée, **5 cas corrigés**. | La **matrice complète** (import de programme, code-barres, bilan sanguin restent à instruire). |
| §11 | Règles écrites en prose | Des témoins existent sur « un texte annonce un chiffre que le code n'applique plus ». | Un **balayage systématique** des phrases d'interface contenant un seuil. |
| §32 | Données périssables | Une règle de 3 mois existe pour les bilans corporels. | Rien pour `registre`, `adn`, `coachMemory`. **Vrai trou.** |
| §46/§47 | Réorganiser le Tier 2 par domaine | Les scénarios ont une origine et un thème implicites. | Le **filtrage par domaine** pour ne pas lancer 55 scénarios sur un changement local. **Bonne idée, économiquement réelle.** |

---

## C — CE QUI MANQUE RÉELLEMENT (les 7 trous)

Classés par rapport bénéfice / coût, tous **gratuits**.

### C1. Le test par canal avec 4 marqueurs — **§33/§34**

Le seul vrai trou de la partie « Milo », et il est bon marché. Aujourd'hui on sait que les
6 canaux existent ; on ne teste pas qu'une donnée arrive **dans le bon** et **pas dans les
autres**.

### C2. Les 8 collections multi-onglets — **§23/§24**

Perte **reproduite**. C'est la règle n°1 du projet (zéro perte). ⚠️ Ce n'est **pas un test à
écrire, c'est une décision de conception** : ces collections ne sont pas datées, donc le
mécanisme actuel ne s'y applique pas.

### C3. La péremption des données de Milo — **§32**

`registre`, `adn`, `coachMemory` n'ont aucune date de validité. **Milo peut s'appuyer sur un
fait devenu faux sans que rien ne le signale.** GPT pose exactement la bonne question :
*« quelles données peuvent devenir obsolètes sans que Force Tracker le sache ? »*

### C4. Le test `BIG3` — **§30**

Deux définitions (une liste, une expression régulière). Un test qui vérifie qu'elles
reconnaissent le même ensemble coûte dix lignes.

### C5. Le filtrage du Tier 2 par domaine — **§46**

Une passe complète coûte 0,84 à 3,63 €. Pouvoir lancer seulement les scénarios de sécurité
après un changement du Gardien est un gain **direct et chiffrable**.

### C6. Le diff lisible en cas d'échec — **§65**

Aujourd'hui un témoin rouge affiche son libellé et une valeur. La forme que GPT propose
(*donnée changée → attendu → observé*) est meilleure, et elle est **gratuite**.

### C7. Le test `getPrev()` — **§28**

**1 seule occurrence** dans tout le banc, pour une fonction à **8 consommateurs** qui décide du
pré-remplissage de chaque série. Et le projet a déjà constaté qu'un pré-remplissage correct
dans un contexte devient faux dans un autre.

---

## D — CE QUI EST À ÉCARTER, ET POURQUOI

### D1. Le nom « Tier 1.5 » et l'arborescence dédiée — **§44, §60**

GPT propose `tests/milo/offline/{personas,payload,mutations,contradictions,gardien,channels,reports}`.

⛔ **Sept dossiers pour une couche dont 9 propositions sur 30 existent déjà ailleurs.** Le
projet a déjà tranché ce type d'arbitrage — quand GPT proposait de scinder les règles
d'architecture en deux fichiers, la réponse a été : *« une section coûte zéro, une frontière
coûte cher »*. Deux emplacements pour un même genre de test produisent des tests introuvables
dans les deux.

👉 **Contre-proposition** : garder le banc unique, et ajouter une **étiquette de domaine** par
bloc. On gagne le filtrage (§46) sans payer la frontière. GPT le concède d'ailleurs lui-même :
*« respecter l'architecture existante si une autre organisation est plus cohérente »*.

### D2. Les golden snapshots — **§64**

GPT met déjà l'avertissement (*« éviter la comparaison stricte de 75 000 caractères »*), mais la
proposition reste risquée : un snapshot partiel se périme au premier changement légitime de
formulation. Le projet a **exactement** cette famille de bugs — un témoin qui fige une **forme**
au lieu d'une **garantie**, 6 occurrences.

⛔ **Le contre-argument décisif** : le témoin d'accord écran ↔ Milo (A2) est *plus fort* qu'un
snapshot, parce qu'il n'épingle aucune formulation — il exige que **deux sources racontent la
même histoire**. C'est cette forme-là qu'il faut généraliser, pas le snapshot.

### D3. La nomenclature à 16 codes — **§58**

`DATA_MISSING`, `RULE_NOT_TRIGGERED`, `MODEL_ONLY`… ⛔ Le projet classe déjà ses défauts par
**famille narrative** (37 familles), avec pour chacune *à quoi on la reconnaît* et *ce qui la
protège*. Une seconde taxonomie, plus abstraite, serait une deuxième source de vérité sur la
manière de nommer les bugs.

⭐ **En revanche, une seule de ces étiquettes vaut d'être retenue : `MODEL_ONLY`.** C'est la
seule qui apporte quelque chose qui n'existe pas — le droit de dire *« tout ce qui précède a été
vérifié, le problème appartient au modèle »*. C'est l'idée centrale du plan, et elle tient en
un mot, pas en seize.

---

## E — LE RISQUE QUE CE CHANTIER CRÉE LUI-MÊME

GPT demande de l'identifier (§76). Le voici, et il est sérieux :

> **Un Milo Offline Lab entièrement vert donnerait le sentiment que Milo va bien.**

Or par construction, cette couche **ne mesure rien du comportement**. Le projet a déjà écrit
cette phrase dans ses documents d'architecture : *les tests prouvent la PRÉSENCE, jamais
l'OBÉISSANCE*.

⚠️ **Le danger concret** : plus la couche gratuite est riche, plus la tentation de repousser le
banc payant est forte — alors que GPT lui-même note que celui-ci **n'a pas tourné récemment**
et que **deux changements de contexte ont été livrés depuis**.

👉 **Garde-fou à poser en même temps que la couche, pas après** : tout rapport Offline Lab doit
afficher, à côté de « API calls : 0 », la **date de la dernière passe réelle du banc payant**.
*Une couche gratuite qui fait oublier la couche payante coûte plus cher que ce qu'elle
économise.*

Trois risques secondaires, plus classiques : duplication de l'outillage (traitée en D1),
snapshots fragiles (D2), et coût de maintenance d'une arborescence à sept dossiers.

---

## F — LE PROTOTYPE MINIMAL

GPT propose (§77) : 5 personas, 10 mutations, 4 à 6 canaux, 1 rapport, 0 API. **C'est bien
dimensionné, mais mal ciblé** : les personas et les mutations existent déjà (A4, A5).

**Contre-proposition — le plus petit prototype qui prouve quelque chose de neuf :**

1. **Les 4 marqueurs de canaux** (C1) — un marqueur par canal, on vérifie qu'il arrive dans le
   bon **et pas dans les trois autres**. *C'est le seul test du plan qui ne peut pas être vert
   par accident.*
2. **Le test `BIG3`** (C4) — dix lignes, un défaut déjà identifié.
3. **Le diff lisible** (C6) — appliqué à ces deux tests seulement.

**Coût : une passe. Aucune arborescence, aucun renommage, aucune API.**

Si ces trois-là ne trouvent rien de neuf, le §78 de GPT s'applique à son propre plan : *« si
aucun bénéfice concret n'apparaît, ne pas industrialiser inutilement »*.

---

## G — L'ORDRE PROPOSÉ (révisé)

GPT propose 9 étapes (§68). Son étape 1 (Service Worker) est **déjà faite** ; sa 3 et sa 4 sont
faites en partie. Ordre révisé, du plus rentable au moins :

| # | Action | Pourquoi en premier | Coût |
|---|---|---|---|
| 1 | **Les 4 marqueurs de canaux** | seul test qui ne peut pas être vert par accident | très faible |
| 2 | **`BIG3`** | défaut déjà identifié, correction triviale | très faible |
| 3 | **Étiquette de domaine par bloc + filtrage du Tier 2** | gain **financier** direct sur chaque passe payante | faible |
| 4 | **`getPrev()`** | 8 consommateurs, 1 seul test | moyen |
| 5 | **Péremption de `registre`/`adn`/`coachMemory`** | Milo s'appuie peut-être sur des faits périmés | moyen — **c'est une décision produit, pas un test** |
| 6 | **Les 8 collections multi-onglets** | perte reproduite, règle n°1 | **élevé — conception, pas test** |
| 7 | **Composition du contexte par bloc** | utile pour décider quoi alléger | moyen |
| 8 | **Audit UX « j'arrive à la salle »** | voir §H | faible mais ce n'est pas un test |

---

## H — LA PARTIE PRODUIT (§49 à §54) : LA MEILLEURE DU PLAN

⭐⭐ **C'est là que GPT apporte le plus, et ça n'a rien à voir avec les tests.**

Il relie deux constats de Michel — *« personne n'utilise Milo pour créer sa séance »* et *« le
parcours pour créer sa séance n'est pas terrible »* — et pose la bonne question (§52) :

> **Ne pas demander « comment forcer les gens à utiliser Milo ? », mais « à quel moment Milo
> apporte-t-il quelque chose que l'interface classique ne peut pas apporter aussi vite ? ».
> Si la réponse est "aucun", il est normal que personne ne l'utilise à ce moment-là.**

Et son hypothèse du §53 est la plus intéressante de tout le document :

> **Milo n'est peut-être pas le bon outil pour CRÉER une séance de zéro. Il l'est pour ADAPTER
> une séance existante** — *« j'ai mal à l'épaule aujourd'hui »*, avec le programme, les
> blessures, l'historique et la récupération sous la main.

👉 **Cette hypothèse est cohérente avec la vision du produit** (*une mémoire sportive, pas une
IA*) et avec le fait mesuré que l'app **a déjà toutes les données nécessaires** pour ce cas.

⚠️ **Mais c'est une HYPOTHÈSE, pas une mesure**, et GPT le classe correctement. Ce qui manque
pour la trancher : mesurer le parcours réel (nombre de taps et d'écrans avant la première
série, dans les trois cas de son §51). **Aucun test ne mesure ça aujourd'hui** — c'est un vrai
trou, et il est bon marché.

---

## RÉPONSES AUX 10 QUESTIONS

1. **Qu'est-ce qui existe déjà ?** Le test Service Worker, le test de contradiction écran ↔ Milo,
   le test du payload réel, les tests de mutation (25 blocs), les personas (deux systèmes), le
   Gardien, l'usage des vraies fonctions, et la règle du contrôle positif.
2. **Partiellement couvert ?** L'audit des 106 champs (classés, pas mesurés), le multi-onglets
   (5/13), les canaux, la taille du contexte, les chemins automatiques, les règles en prose,
   la péremption, le filtrage du Tier 2.
3. **Ce qui manque vraiment ?** Les 7 points de la section C.
4. **Doublons ?** §25, §9/§10, §4, §7, §12-22, §61, §62, §63, §40 — neuf sections.
5. **Mauvais ou inutile ?** L'arborescence à sept dossiers, les golden snapshots, la
   nomenclature à 16 codes (garder **`MODEL_ONLY`** seul).
6. **Prototype minimal ?** Section F : marqueurs de canaux + `BIG3` + diff lisible.
7. **Tests gratuits les plus rentables ?** Les marqueurs de canaux, puis le filtrage par
   domaine du banc payant.
8. **Dans quel ordre ?** Section G.
9. **Risques du chantier ?** Section E — principalement le **faux sentiment de sécurité**.
10. **Première étape prouvant la valeur ?** Les 4 marqueurs de canaux : c'est le seul test du
    plan qui **ne peut pas être vert par accident**.

---

## CE QU'IL FAUT DIRE À GPT

Son plan est bon, sa thèse est juste, et **deux de ses apports sont réellement neufs** : le
filtrage du banc payant par domaine, et surtout l'hypothèse produit du §53 (Milo adapte, il ne
crée pas).

⚠️ **Mais il a écrit son plan sans savoir ce qui existait** — c'est la limite d'une session
vierge, pas une faute. Le dossier complet qui lui a été remis devrait éviter que cela se
reproduise.

⭐ **Et un point où il a eu parfaitement raison** : sa règle du §79 — *« ne pas accepter ce
document comme vérité, le confronter au dépôt réel »* — est exactement ce qui a permis de
classer neuf de ses propositions comme déjà faites. **Il a fourni le mode d'emploi de son
propre contre-audit.**

---

*Contre-audit produit le 02/09/2026 sur `ft-v1102`. Aucune ligne de l'application n'a été
modifiée. Aucun test n'a été écrit.*
