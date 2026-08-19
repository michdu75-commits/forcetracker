<!-- RÉÉCRITURE VOLONTAIRE 2026-08-19 : 1ʳᵉ version écrite le matin, réordonnée le soir à la demande de Michel (« je voulais que tu parles de la 2ᵉ ia et ce que l'on fait actuellement ») — l'architecture cerveau/cervelet passe devant, l'historique nutrition descend en §6.2bis. Contenu conservé et relu ligne à ligne ; ce sont les coupures de ligne qui ont changé. -->

# 🥗 Brief nutrition — la 2ᵉ IA, et ce qu'on est en train de faire

> **Créé le 19/08/2026**, à la demande de Michel, pour une **autre instance** qui reprend le chantier
> nutrition. **Autonome** : lisible sans le dépôt sous les yeux.
>
> ⚠️ **Le sujet de ce document, c'est l'architecture en cours de construction** — pas l'historique de
> la nutrition. Le détail du moteur nutrition vit dans `docs/NUTRITION-MOTEUR.md` (le comment) et
> `docs/NUTRITION-PHILOSOPHIE.md` (le pourquoi). Ici : **ce qu'on fabrique en ce moment, et ce que ça
> change pour toi.**

---

## 1. Ce qu'on fait en ce moment, en une page

Le prompt de Milo — le coach IA de l'app — a atteint son plafond : **140 règles, 46 485 caractères
pour un plafond de 46 500. Quinze caractères de marge.** Plus aucune règle générique ne pouvait
entrer sans qu'on en sorte une.

⚠️ **Le plafond n'est pas financier.** Ce bloc est mis en cache une heure et facturé au dixième. Il
existe pour une seule raison, écrite dans le code : **la taille DILUE les règles entre elles**.

Le dégraissage classique (retirer du prompt ce que le code garantit déjà) a été appliqué. Il
**plafonne à 3-4 %**. La méthode marche, elle ne résout pas le problème.

**⚠️ ET LA RAISON N'EST PAS LE PLAFOND — corrigé le 19/08 après une relecture extérieure.** Le
plafond a été le **déclencheur**, pas la raison :

> **Le cervelet existe parce que TRANSFORMER et JUGER sont deux métiers différents.**

C'est important pour toi, concrètement : *justifier l'architecture par la contrainte rend le
périmètre ÉLASTIQUE* — si le prompt se remplit à nouveau, on sera tenté de déménager davantage, et
c'est exactement la dérive du §5.4. Justifiée par la **conception**, la frontière ne bouge plus : le
critère 2 (transformation vs jugement) ne dépend pas de la place disponible.

⚠️ **Et une mesure à connaître avant de te lancer** : sur les 44 157 caractères actuels, **84 % sont
des règles de COMPORTEMENT** et seulement ~5 % encore déchargeables. *Le déménagement technique est
presque fini, et il n'a retiré aucune règle de comportement.* Le détail et les autres leviers sont
au §9 de `docs/ARCHITECTURE-CERVEAU-CERVELET.md`.

Michel a posé l'architecture, et il l'a nommée lui-même :

> *« Pourquoi tout part d'un seul bloc ? Dans une entreprise il y a le boss et la secrétaire. »*
> puis : **« le cerveau et le cervelet »**.

**C'est ça, le chantier en cours.** La nutrition arrive **après**, et **délibérément** : la frontière
doit être posée avant qu'on construise le gros morceau, sinon on la posera autour de ce qu'on aura
déjà écrit.

---

## 2. La 2ᵉ IA — ce qu'elle est, ce qu'elle n'est pas

**Milo est le CERVEAU.** Il comprend, diagnostique, adapte, décide, explique, **parle**.

**La 2ᵉ IA est le CERVELET.** Elle extrait, convertit, normalise, structure, compose sous contraintes
explicites.

### 2.1 ⛔ Les trois interdits, dans l'ordre d'importance

**① ELLE N'EXISTE PAS POUR L'UTILISATEUR.** C'est un service : l'app lui envoie une demande, elle
rend une donnée, l'app l'affiche ou Milo s'en sert. **Deux IA, une seule voix** — c'est la règle R6
du projet, et elle n'est pas négociable. *Le jour où le cervelet parle en son nom, le produit a deux
personnalités.* Sa sortie n'est **jamais** affichée telle quelle.

**② ELLE NE SAIT RIEN DE LA PERSONNE.** Ce n'est pas une précaution rédactionnelle, c'est vérifié par
un test : l'appel ne contient **que deux clés**. Ni profil, ni records, ni historique, ni email, ni
objectif. *Ne pas lui donner l'information est la garantie la plus simple qu'elle ne s'en servira pas.*

**③ ELLE N'A PAS DE MÉMOIRE.** Elle peut **extraire** une information destinée à la mémoire ; elle ne
la stocke jamais. Le chemin est toujours : cervelet → extraction · l'app → stockage · Milo →
utilisation. Il ne doit pas exister une mémoire Milo, une mémoire cervelet et une mémoire nutrition.

### 2.2 Les DEUX critères pour décider ce qui lui revient

**Critère 1 (Michel)** — *« Est-ce que ça a besoin de savoir QUI est la personne ? »*
Oui → Milo. Non → question suivante.

**Critère 2 (ajouté le 19/08 par une relecture extérieure — et il corrige un angle mort réel)** —
*« Est-ce une TRANSFORMATION vérifiable, ou un JUGEMENT ? »*
Transformation → cervelet. Jugement → Milo.

⚠️ **Pourquoi le second est indispensable, et pourquoi c'est TA section** : composer une journée
végane sans arachide à 2 400 kcal n'a **pas** besoin de l'historique de la personne. Le critère 1
seul l'enverrait donc au cervelet. Or cette tâche porte des contraintes de **sécurité**.
***Générique ne veut pas dire mécanique.***

### 2.3 Et le CODE passe avant le cervelet

Ordre de préférence, jamais l'inverse :

```
   ① code déterministe   ②  base fiable   ③  cervelet   ④  Milo
```

Calculer les valeurs de 175 g à partir d'une référence /100 g → **code**.
Comprendre une photo d'étiquette mal cadrée → **cervelet**.
Dire si cet apport est pertinent pour cette personne → **Milo**.

*Créer un cervelet ne doit pas donner envie de lui envoyer tout ce qui est mécanique : il ne remplace
pas du code fiable.*

---

## 3. Ce qui est DÉJÀ LIVRÉ — la 1ʳᵉ brique, et elle est le patron des suivantes

**ft-v919 (19/08/2026) — la conversion séance→JSON est sortie du prompt de Milo.**

**Le défaut** : Milo devait produire **en même temps** une réponse lisible **et** un bloc JSON valide
pour que l'app puisse charger la séance. La spécification de ce bloc pesait **~3 700 caractères dans
le prompt commun** — envoyé à **tout le monde, à chaque conversation**, y compris à quelqu'un qui
parle nutrition et n'aura jamais de séance à charger.

**Ce qui a été fait** : Milo écrit sa séance **en français**, comme un coach. Le cervelet la traduit.

> ### ⭐ Le principe, en quatre mots : **Milo parle, le cervelet traduit.**

**La cascade a trois étages, et l'ordre compte** :

| | | |
|---|---|---|
| **①** | le **bloc caché** de Milo s'il est encore là | rétrocompatible — le prompt commun est en **cache 1 h**, donc pendant une heure après la livraison il peut encore l'émettre. **Gratuit.** |
| **②** | le **cervelet** traduit | un appel Haiku, **seulement** quand le texte ressemble vraiment à une séance |
| **③** | la **lecture déterministe du texte** (code, écrite le 04/08) | plus pauvre (ni repos, ni consigne, ni type de série) mais **gratuite et hors ligne** |

***On ne remplace jamais un chemin qui marche : on en ajoute un meilleur devant.***

**⚠️ L'aiguillage est déterministe et volontairement PLUS PERMISSIF que le filet.** Ce n'est pas un
oubli : le filet **construit** la séance (une ligne mal lue ferait travailler la personne sur autre
chose), l'aiguillage ne fait qu'**orienter** (au pire un appel dépensé pour rien). *Deux coûts
d'erreur différents, donc deux seuils.*

**Résultat mesuré : bloc commun 46 485 → 44 157 caractères. Marge 15 → 2 343.**

### ⚠️ Deux honnêtetés à ne pas perdre en route

1. **La conversion coûte maintenant un appel** par séance proposée, là où elle était incluse dans la
   réponse. C'est le prix du découplage, il est assumé.
2. **On ne peut pas prouver localement que le cervelet traduit BIEN.** Les tests prouvent qu'il
   reçoit le bon texte, qu'il part au bon endroit et que sa sortie atteint l'écran. **La qualité de
   la traduction demande le vrai modèle.** Ne pas présenter le découplage comme un gain de fiabilité
   démontré : ce qui est acquis, c'est que **le système** a trois chemins qui se rattrapent, pas que
   **le modèle** se trompe moins.

---

## 4. 🔧 Comment on ajoute une tâche au cervelet — la recette exacte

Tu en auras besoin. Il y a **quatre endroits** à toucher, et ils doivent rester alignés.

**① `worker.js`** (Cloudflare Worker) — écrire la fonction, et l'ajouter au routeur :
```js
if (body.action === 'maTache')  return json(await maTache(body, apiKey));
```
Le modèle vit **ici et nulle part ailleurs** (`claude-haiku-4-5-20251001` aujourd'hui). L'app ne le
connaît pas → il reste **remplaçable** sans toucher à Milo.

**② `worker.js` — `_ACTIONS_IA`** : la liste des actions comptées.

**③ `constants.js` — `AI_PROXY_ACTIONS`** : c'est ce qui aiguille l'appel vers le Worker.
⚠️ **Sans ça, l'appel part sur Apps Script**, qui ne connaît pas l'action.

**④ `Code.js` — `AI_ACTIONS_`** : le compteur du jour vit dans Apps Script (le Worker lui envoie le
coup). Une action absente de **cette** liste part bien, mais **n'est comptée nulle part** — panne
silencieuse.

**⚠️ Un test épingle le NOMBRE d'actions** (`proxy.size===14` aujourd'hui) : ajouter une action **fait
échouer la livraison** tant qu'on n'est pas repassé par ici. C'est volontaire — les trois listes
s'éloignaient l'une de l'autre en silence, et ça a coûté trois semaines de comptage mort en juillet.

**Le déploiement du Worker est automatique** dès qu'un push sur `master` touche `worker.js`.

**Côté app**, l'appel ressemble à ça — et **regarde ce qui n'y est pas** :
```js
fetch(_aiUrl('seanceJson'), {method:'POST', redirect:'follow',
  headers:{'Content-Type':'text/plain;charset=utf-8'},
  body: JSON.stringify({ action:'seanceJson', texte: '…' })});
```
**Deux clés. C'est tout.** Un témoin permanent vérifie qu'il n'y en a pas une troisième.

---

## 5. ⭐⭐ Ce que ça change pour la NUTRITION — ta frontière

### 5.1 Le partage

| Va au **CERVELET** | Reste chez **MILO** |
|---|---|
| lire une étiquette photographiée | définir / interpréter l'objectif |
| structurer *« 200 g de riz cuit, 150 g de poulet, 2 œufs »* | dire si la personne mange assez pour progresser |
| estimer un plat décrit en texte libre | relier nutrition ↔ séance ↔ récupération |
| rechercher, normaliser un aliment | adapter selon l'historique |
| **proposer** une combinaison sous contraintes déjà fixées | **fixer** ces contraintes (combien de kcal, quelle cible protéique, faut-il vraiment un déficit) |

> **Le cervelet calcule ce qu'il y a dans l'assiette.
> Milo décide ce que cette assiette signifie pour cette personne.**

### 5.2 ⛔⛔ La règle de sécurité — non négociable

**Une contrainte critique vérifiable par du code ne doit JAMAIS dépendre uniquement d'un LLM.**

Allergies, régimes, exclusions sont des contraintes **dures**. L'architecture est :

```
   contraintes fixées (Milo ou le profil)
             ↓
   le cervelet PROPOSE une combinaison
             ↓
   un VALIDATEUR DÉTERMINISTE contrôle    ← allergène ? produit animal ? exclusion interdite ?
             ↓
        rejet   ou   validation
```

Un modèle léger est un **candidat sérieux** comme extracteur, normalisateur, générateur de
propositions. Il ne doit **jamais** être l'**autorité finale** d'une contrainte de sécurité.

**Les précédents sont réels et datés.** Le **02/08**, une testeuse ayant déclaré « fruits à coque » a
vu des **amandes**. Le **19/08**, le garde-fou d'une *autre* fonctionnalité a trouvé deux bugs qui
traînaient depuis des mois : **« Thon » seul n'était couvert par aucune substitution** (un
végétarien voyait du thon) et **le miel n'était remplacé nulle part**. C'est pour ça que le
générateur actuel n'emploie **que des aliments déjà présents dans les plans** : *le risque est nul
par construction, pas par vigilance.*

### 5.3 ⚠️ Le cervelet doit pouvoir dire « je ne peux pas »

Le mauvais design : *routeur → cervelet → obligation de produire*.
Le bon : *routeur → cervelet → **contrôle de son périmètre** → exécution **OU escalade***.

Statuts utiles : `ambigu` · `donnée insuffisante` · `contraintes contradictoires` ·
`nécessite le contexte personnel` · `ne peut pas s'exécuter sûrement`.

**Pourquoi c'est central** : le principal mode de panne de cette architecture est que
**l'erreur d'aiguillage est SILENCIEUSE** — aucune erreur, aucun test rouge, juste une réponse moins
bonne. Exemple typiquement nutrition : *« depuis que j'ai baissé mes glucides je suis moins
performant au squat, tu ferais quoi ? »* — un classificateur naïf voit « nutrition » et l'envoie au
cervelet. Or ça demande nutrition **+** entraînement **+** historique **+** raisonnement → Milo.
**Si le cervelet sait répondre « il me faut le contexte personnel », une mauvaise décision de routage
cesse d'être une mauvaise réponse.**

**Cas nutrition concret déjà identifié — le cru/cuit.** Si la personne dit *« 200 g de riz »* et que
l'état change substantiellement le résultat, le cervelet ne doit **pas** deviner en silence : il rend
`ambigu` + `information manquante : cru ou cuit`. L'app décide ensuite (préférence connue, question,
choix proposé). *Deviner sans le signaler est la faute.*

### 5.4 ⚠️⚠️ La dérive à interdire — c'est LE risque de ce chantier

Elle se fait par petits pas, et chacun paraît raisonnable :

> lire une étiquette → estimer un plat → composer un repas → composer une journée →
> **conseiller** → **adapter à l'entraînement**

Arrivé là, il y a **deux cerveaux**. Et surtout : le défaut n°1 du produit — *la nutrition ignore
complètement l'entraînement* — serait **aggravé**, pas résolu. Le lien avec la séance serait perdu
pour de bon, puisque le service qui compose ne saurait rien de l'entraînement.

**La règle anti-dérive, et elle est testable** : *si une nouvelle tâche oblige à charger le profil de
la personne dans le cervelet, la frontière est franchie.* Elle est **verrouillée par un test**, pas
seulement écrite dans un prompt.

### 5.5 Ne pas confondre les moteurs

Le projet en a maintenant plusieurs, et leurs responsabilités ne doivent pas fusionner :

| | Rôle | Exemple |
|---|---|---|
| **Cervelet** | **transforme** | « cette étiquette fait X kcal et Y g de protéines » |
| **Gardien** | **protège** | seuils de sécurité, zones fragiles déclarées |
| **Observateur** | **voit les tendances** | « les apports protéiques sont plus réguliers depuis 4 semaines » |
| **Milo** | **comprend la personne, arbitre et parle** | |

---

## 6. ⏭️ La suite — l'ordre, et l'état honnête

### 6.1 Sur l'architecture (avant la nutrition)

| | Quoi | État |
|---|---|---|
| ✅ | conversion séance→JSON | **livrée** (ft-v919) |
| ⏭️ | **contrôler que les exercices rendus viennent bien du texte de Milo** | trouvé par la relecture du 19/08 : on le *demande* au modèle, personne ne le *contrôle*. Petit, et c'est la même faute que §5.2. |
| ⏭️ | les **réponses rapides** (~1 655 car.) | ⚠️ avec la nuance : *choisir* la question reste chez Milo, seul le *raccourcissement en boutons* part au cervelet |
| ⏭️ | la **prochaine séance annoncée** (~825 car.) | |
| ❓ | **le benchmark comportemental** | **le point le plus important, et le plus coûteux.** Voir §6.3. |

### 6.2 Sur la nutrition

| Priorité | Quoi | État |
|---|---|---|
| ✅ | **Brique 0 — la provenance** | **FAITE** (ft-v907). Chaque entrée du journal porte `saisie` (comment c'est entré) **et** `origine` (d'où vient le chiffre) — deux axes, pas un — plus `q`, `per100`, `modifie`. ⛔ **Ne la refais pas.** |
| **1** | **Brique 1 — la base CIQUAL** | ⚠️ **DEUX BASES, PAS UNE** — voir §6.4. Mesurer le **poids** sur l'ouverture instantanée, ne pas le supposer négligeable. |
| **2** | **Brique 3 — le générateur** | Branché **derrière** l'existant d'abord, on compare les deux sorties avant de basculer. Le **validateur déterministe** du §5.2 fait partie de la brique, pas d'une suite. |
| **3** | **Brique 4 — les 4 niveaux de précision** | qualitatif → portions → macros → suivi précis. La précision est un **choix**, jamais une obligation. |
| **4** | **le jour de séance**, puis **l'heure réelle** de la séance | C'est **le vrai gain produit** : le défaut n°1. |
| ⏸️ | la contradiction sur les protéines (fiche whey **1,6-2 g/kg** vs moteur **2,0-2,6**) | **BLOQUÉE volontairement** : trancher demande des références vérifiées. ⛔ Ne pas « harmoniser » au jugé — ce serait inventer une **troisième** valeur. |
| ❓ | les **micronutriments** (CIQUAL les donne gratuitement) | ⚠️ Dès qu'on en affiche un, on entre dans un domaine où l'app doit **renvoyer au médecin** et jamais interpréter. À traiter comme le bilan sanguin, **ou pas du tout**. |

**⚠️ Point de calendrier** : Michel **commence à se servir de la nutrition pour de vrai cette
semaine**. Les briques 1/3/4 sont **différées de deux semaines exprès**, pour construire sur du
**vrai usage** plutôt que sur des suppositions. *C'est un choix, pas un retard.*

### 6.2bis ⛔ Ce qui est DÉJÀ livré côté nutrition — à ne pas défaire, ni refaire

Neuf versions sont passées entre le 18 et le 19/08, **après** l'écriture de `NUTRITION-MOTEUR.md`.
Chacune a sa raison, et plusieurs corrigent une faute qu'il serait facile de réintroduire.

- **ft-v906 — un PLANCHER sur la cible calorique.** `autoKcal()` était une addition sans plancher et
  pouvait prescrire **847 kcal** (femme 55 kg sédentaire, perte, décharge), pendant que le Gardien de
  Milo alerte sous 1 500 (H) / 1 200 (F) : *deux sources pour la même règle de santé*. Le plancher est
  posé **et expliqué à l'écran** — une cible qui bouge sans raison visible est pire que pas de
  plancher. ⚠️ Il ne touche **pas** `manualKcal` : une cible saisie à la main est celle de la
  personne. Même correction sur le **kéto** (15 % de protéines passait sous 0,8 g/kg) : ce sont les
  **lipides** qui absorbent, jamais les glucides — les 5 % de glucides *définissent* le régime.
- **ft-v907 — la brique 0, la provenance** (voir §6.2). ⛔ Ne la refais pas.
- **ft-v908 — la barre de protéines lit enfin le journal.** `prot-eaten` était une saisie manuelle que
  rien n'alimentait : avec 60 g déjà notés, l'app affichait « il te reste 187 g » sur une cible de 187.
  ⚠️ La saisie manuelle reste **prioritaire quand elle est remplie** (même arbitrage que `manualKcal`).
  ⛔ Et une affirmation a été **retirée parce qu'elle était FAUSSE** : la caféine ne réduit pas
  l'absorption de la créatine, et l'espacement de 2 h n'a jamais été testé. *Ne pas la réintroduire.*
- **ft-v909 / 912 / 913 — la carte « où tu en es ».** Elle répond à *« où j'en suis »*, pas à
  *« combien il me reste à manger »* (qui n'a de sens que si on a déjà tout noté). **La règle qui
  tient tout : une semaine incomplète produit une moyenne HONNÊTE** — on divise par les jours
  **réellement notés**, jamais par 7, et on **écrit combien il y en a**. La moyenne ne porte que sur
  les **jours terminés** (aujourd'hui est par construction incomplet). Un écart n'apparaît qu'à partir
  de **3 jours terminés**, et **en gris, pas en orange** : *un écart est un constat, pas une alerte*.
  Zéro jour noté → une invitation, pas un « 0 / 2 600 » qui se lit comme un reproche.
- **ft-v910 / 913 — la créatine.** Dose **libre** (0,5 à 30 g, bornes anti-faute-de-frappe), avec
  **deux seuils et deux tons** : au-dessus de **3 g** un simple **repère** (règle de
  *commercialisation* française, arrêté du 26/09/2016 — **pas** une limite légale pour le
  consommateur ; écrire « maximum légal » était faux) ; au-dessus de **5 g** un **avertissement** (on
  sort de ce que décrivent les sociétés savantes). ⚠️ Dans les deux cas, écrit noir sur blanc : **ce
  n'est pas un risque démontré, c'est une zone peu étudiée.** Les **contre-indications ANSES** (rein,
  facteurs cardiovasculaires, foie, troubles neuropsychiatriques, mineurs, grossesse) sont affichées —
  c'est le seul point du dossier qui relève vraiment de la sécurité. La phase de **charge** n'est plus
  le défaut (elle affichait 20 g/j pendant que la même app avertissait au-delà de 5).
- **ft-v911 — « tes repas habituels ».** **Observés** dans le journal (les aliments notés *ensemble*,
  le même jour, sur le même repas), **jamais déclarés** : pas de liste à gérer. Il en faut **deux**
  pour qu'un repas soit proposé. ⚠️ Qui mange différemment chaque jour **ne voit rien du tout** — pas
  une section vide, qui serait un reproche déguisé.
- **ft-v915 — le cru/cuit est ÉCRIT, jamais converti.** La table de portions mélangeait le cru et le
  cuit sans le dire (riz 350 kcal/100 g = cru ; légumineuses 116 = **cuites**). C'est un biais
  **systématique**, donc il **survit au moyennage hebdomadaire** — la seule classe d'erreur que
  « cohérence avant réactivité » ne peut pas absorber. ⛔ **On ne convertit pas, on nomme** : convertir
  supposerait un ratio d'absorption d'eau qu'on n'a pas. Chaque ligne porte SON état (*« Riz 100 g
  (pesé cru) + lentilles 250 g (pesé cuit) »*) — pas de convention globale, parce que le riz s'achète
  sec et les lentilles souvent cuites en boîte. Côté journal, Open Food Facts donne les valeurs
  **« telles que vendues »** : 200 g de pâtes *cuites* saisies au chiffre du paquet, c'est **700 kcal
  au lieu de 260**. Une note prévient, **sans bloquer**, et **seulement** sur les aliments qui
  gonflent vraiment.

### 6.3 Le prérequis dont personne ne peut se passer

**Est-ce que Milo suit réellement ses 140 règles aujourd'hui ?**

Si oui, l'allègement est une optimisation. Si non, il est urgent. **On ne peut pas trancher
localement** : les tests du projet sont déterministes — ils prouvent qu'une règle est **PRÉSENTE**
dans le contexte, **jamais qu'elle est SUIVIE**.

La relecture extérieure va plus loin, et elle a raison : constituer un **jeu fixe de 100 à 200 cas
difficiles**, mesurer **avant** et **après** sur le même jeu. Sinon *« les 140 règles diluent Milo »*
reste une intuition — crédible, mais non démontrée. Et la bonne question finale n'est pas
« combien de caractères a-t-on économisés », c'est **« Force Tracker est-il devenu plus fiable ? »**.

### 6.4 ⭐⭐ DEUX BASES, PAS UNE — la décision structurante de la brique 1

L'erreur naturelle est d'en faire une seule.

| | **Le JOURNAL** | **Le GÉNÉRATEUR** |
|---|---|---|
| Ce qu'il veut | la **COUVERTURE** | la **SÛRETÉ** |
| Taille | CIQUAL entier, **3 484 aliments** | **~300** marqués `composable` |
| Régimes / allergènes | pas nécessaire | **liste blanche relue à la main** |
| Qui choisit | **la personne** | **l'app** |

*C'est le « qui choisit » qui justifie les deux* : quand la personne cherche un aliment, elle sait ce
qu'elle mange — il faut de la couverture. Quand **l'app** compose son assiette, elle engage sa
responsabilité — il faut de la sûreté.

⚠️ **Open Food Facts et CIQUAL ne sont pas concurrents** : OFF = les **produits emballés**
(codes-barres, Nutri-Score, NOVA) ; CIQUAL = les **aliments bruts** (ANSES, référence française,
gratuite). Le journal a besoin des deux ; le générateur, de CIQUAL.

---

## 7. Les règles du projet qui vont te tomber dessus

1. **L'information doit descendre jusqu'à la DONNÉE, pas rester dans le TEXTE** (R4). *La famille de
   bugs la plus coûteuse du projet.* Exemples nutrition vécus : le champ `etat` (cru/cuit) existait et
   valait **toujours `null`** ; le poids scanné était **connu** et **pas enregistré**.
2. **Une information a UN propriétaire** (R2). Deux endroits qui stockent la même chose divergeront —
   la seule question est quand. Trois fois en nutrition en deux semaines.
3. **Le droit de deviner dépend du COÛT de l'erreur** (R29). Une couleur de calendrier : devine. Un
   fait sur la personne, sa santé, son allergie : **demande**, ou tais-toi. Une fonction qui ne sait
   pas doit pouvoir rendre `null`, et ce `null` ne se remplace **jamais** par une valeur par défaut.
4. **Informer sans bloquer** (R24). Une note affichée pour tout n'est plus lue ; un garde-fou qui crie
   pour rien finit désactivé (R19).
5. **Ne jamais inventer un chiffre pour combler un vide.** Les trois dérives du dossier créatine
   avaient la même forme : *un vide comblé par un mécanisme vraisemblable*. **Dire « personne n'a
   mesuré ça » est une information.**
6. **Ne pas inventer de faux score de confiance** (« fiabilité : 94 % »). Des **catégories** de
   provenance — estimé · étiquette fabricant · base officielle · saisi · corrigé — sont bien plus
   défendables qu'un pourcentage pseudo-scientifique. C'est déjà le choix de la brique 0.
7. **Tester la BASE ENTIÈRE, pas des archétypes.** Le test de compatibilité régime/allergie doit
   parcourir **tous** les aliments et **toutes** les variantes de jour — sinon un cas dangereux ne
   sortirait que certains jours, et personne ne le verrait avant qu'un utilisateur le mange.
8. **Contrôle négatif obligatoire** : les nouveaux témoins, tournés contre l'**ancien** code, doivent
   **rougir**. Un témoin qui **plante** ne prouve rien — piège payé six fois : appeler une fonction
   neuve dans un témoin la fait planter sur l'ancien code au lieu de le faire échouer.

---

## 8. Qui est en face

Michel — auteur et unique décideur du produit. **Il n'est ni développeur ni programmeur.**

- **Explications simples, la réponse d'abord**, le détail seulement s'il le demande.
- **Prévenir avant tout risque.** Backup et branche avant une opération sensible.
- Quand il répète une consigne deux fois : **l'écrire**, au lieu de la ré-appliquer.
- Ses retours viennent du terrain — souvent en pleine séance, ou devant son écran. Ils sont précis, et
  ils ont presque toujours raison sur le **symptôme**, même quand la cause est ailleurs.
- Les personas ne sont pas des profils de test, ce sont les **dimensions du projet** :
  **Christophe** = terrain/métier · **Tatiana** = personnalisation, **aucun présupposé** ·
  **Emma** = physiologie & ressenti (c'est elle qui a vu les amandes).

---

## 9. Où lire le reste

| Sujet | Document |
|---|---|
| **L'architecture cerveau/cervelet en entier** (frontière chiffrée, contraintes, questions ouvertes) | `docs/ARCHITECTURE-CERVEAU-CERVELET.md` |
| **Le COMMENT de la nutrition** (chaîne complète, les 5 trous, schéma d'aliment, générateur en 10 lignes) | `docs/NUTRITION-MOTEUR.md` |
| **L'ESPRIT** (les principes, les 4 niveaux de précision, le Gardien nutrition, l'anti-TCA) | `docs/NUTRITION-PHILOSOPHIE.md` |
| Comment on construit (31 règles, chacune née d'un vrai bug) | `docs/REGLES-ARCHITECTURE.md` |
| Comment Milo se comporte envers la personne | `CONSTITUTION-MILO.md` (**P21** = la nutrition) |
| Les familles de bugs du projet, et à quoi on les reconnaît | `BUGS.md` |
| Ce qui EXISTE déjà (généré depuis le code, jamais écrit à la main) | `docs/INVENTAIRE.md` |
| L'état du jour : version, branche, chantier actif | `docs/CONTEXTE-ACTUEL.md` |

**⚠️ Avant d'affirmer qu'une chose n'existe pas : vérifier dans le code ET dans l'inventaire**
(règle R23). C'est arrivé deux fois — un audit a conclu que l'import de prise de sang manquait, il
existait depuis trois semaines ; et j'ai proposé de « construire un pont » vers la montre alors que
Michel l'avait fait lui-même trois jours plus tôt. *Une fonctionnalité non relue est une
fonctionnalité qu'on re-propose.*
