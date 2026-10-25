# 🌱 L'origine des règles — d'où vient chaque principe de Force Tracker

> **Créé le 27/07/2026.** Constat de Michel ce soir-là : *« dans 6 mois je ne vais plus m'en souvenir,
> on fait comment ? »*
>
> Les règles d'or et les principes de la Constitution sont écrits partout dans le projet. Mais **leur
> raison d'être ne l'était nulle part** : on savait *quoi* faire, pas *pourquoi* cette règle existe ni
> ce qui l'a déclenchée. Or une règle dont on a oublié la raison finit toujours par être contournée —
> « ça ne sert plus à rien ».
>
> Ce document répare ça. Chaque entrée dit **quel jour**, **dans quel contexte** et **avec quels mots**
> la règle est née.

## 📖 D'où vient ce document

Retrouvé dans les **transcriptions de conversation** conservées par Claude Code (2 → 27 juillet 2026,
1 292 messages de Michel). Ces échanges n'étaient **dans aucun fichier du projet** : ils n'existaient
que dans l'historique des sessions. Le journal des versions gardait le *résultat* (« ajout de X »), la
conversation gardait la *raison*.

⚠️ **Aucune donnée brute n'est recopiée ici** (le dépôt est public, et les transcriptions contiennent
des emails, des jetons et des informations de santé). Les citations sont **courtes, choisies à la main
et vérifiées** ; tout le reste est reformulé.

⚠️ **Ces transcriptions commencent le 2 juillet ; le projet, lui, existait déjà début juin** (l'app tournait
en ligne le 8 juin). Ce qu'on sait de juin vient de l'historique Git, du Drive de Michel et, depuis le
24/10/2026, de ses propres mots (section suivante). *« Le tout premier échange » des entrées ci-dessous veut
dire : le premier des transcriptions conservées, pas le premier du projet.*

---

## 🚦 Pourquoi Force Tracker a COMMENCÉ — la motivation de départ (dite par Michel, 24/10/2026)

**Ses mots, tels quels :**

> *« J'ai commencé Force Tracker uniquement pour moi, pour avoir une application de musculation et de
> force athlétique adaptée à ma façon de m'entraîner et à mes besoins. Les applications que j'avais
> essayées me frustraient parce qu'il fallait rapidement payer pour accéder à davantage de
> fonctionnalités. Je voulais simplement créer mon propre outil, sans aucune ambition commerciale. »*

> *« Par la suite, je l'ai proposée à ma fille, à un ami de la salle et à quelques autres personnes. Leurs
> retours m'ont donné envie de la partager plus largement. »*

**Sa philosophie, restée la même depuis :**

> *« Une application gratuite réellement complète, utilisable pendant des années, et des options payantes
> uniquement pour ceux qui veulent beaucoup plus. »* — *« Aujourd'hui, une éventuelle rémunération
> pourrait notamment couvrir les frais du projet. »*

**Pourquoi c'est écrit seulement maintenant** : la période de juin n'avait laissé aucune trace écrite de la
raison — ni dans le dépôt (le premier `CLAUDE.md`, le 11/06, est purement technique), ni dans le Drive, ni
dans les transcriptions (elles commencent le 2 juillet). Le 24/10 au matin, interrogé sur le *pourquoi*, le
dépôt ne pouvait répondre que par la Vision de juillet et la consultation racontée en août — c'est-à-dire
par ce qui a été écrit **après**. Michel a donné la réponse dans l'heure.

### 🧾 Ce que les traces confirment — vérifié le 24/10/2026, sans rien ajouter à ses mots

| Date | Trace | Source |
|---|---|---|
| 3 juin 2026 | Une feuille Google est créée ; elle deviendra la feuille de synchronisation de l'app (ses onglets reçoivent les premières séances le 12 juin). ⚠️ **Indice seulement** : rien ne prouve qu'elle servait déjà Force Tracker ce jour-là. | Drive (date de création du fichier) |
| 8 juin 2026 | Document « ForceTracker Liens » : *« Force Tracker v2.2 — Juin 2026 »*, l'app en ligne sur Netlify (une page qu'on dépose), synchronisée avec Google Sheets par Apps Script. **Plus ancienne trace certaine de l'app.** Le « v2.2 » dit qu'il y a eu des versions avant — leur date n'est pas connue. | Drive |
| 11 juin 2026 | Premier commit du dépôt GitHub : *« Initial commit: Force Tracker v2.8 »* (`52a6aa55`). Le même jour : premier `CLAUDE.md` (`0e19fd39`), et des polices agrandies pour la lisibilité (`70f8e187`). | GitHub |
| 12 juin 2026 | Premières séances synchronisées dans la feuille Google : celles de Michel. | Drive |
| 12 juin 2026 | Première option payante de l'historique Git : le **Coach IA** (10 questions gratuites, puis un accès payant — `fab88b36`). Les options payantes qui apparaissent en juin sont toutes des fonctions d'IA, où chaque question est un appel payant à un modèle. | GitHub |
| 15 juin 2026 | `ft-v1` : premier numéro de cache du service worker, début de la numérotation des versions actuelle (`29d84b5c`). | GitHub |
| 29 juin 2026 | Accès complet donné en dur à trois comptes : Michel, sa fille et un testeur (`4acc7057`). | GitHub |
| 2 juillet 2026 | Début des transcriptions de conversation conservées, base du reste de ce document. | historique des sessions |

⛔ **Aucune date exacte de naissance n'est retenue** (consigne de Michel, 24/10/2026) : on sait que l'app
existait le 8 juin, pas depuis quand.

### ⚖️ Trois couches à ne pas confondre (consigne de Michel, 24/10/2026)

| Couche | Quand | Ce que c'est | Où c'est écrit |
|---|---|---|---|
| ① **La motivation de départ** | au départ (juin 2026 au plus tard) | Un outil **pour lui** : adapté à sa façon de s'entraîner, sans fonctions vite payantes, sans ambition commerciale. | ici, ses mots du 24/10 |
| ② **La vision développée ensuite** | juillet 2026 | *« La mémoire sportive intelligente d'une personne »* · *« il se souvient de qui tu es devenu »*. | `docs/VISION-FORCE-TRACKER.md` (validée le 19/07) |
| ③ **Les événements qui l'ont enrichie** | 18/07 → 21/08 | *« Il n'a pas d'âme »* (18/07) · la question de Tatiana (21/07) · la consultation où il s'est senti jugé *« par rapport à un âge et à une donnée »* (racontée le 21/08). | plus bas dans ce document |

⛔ **La consultation n'est pas l'origine du projet** — c'est Michel qui le dit : il a commencé pour avoir son
propre outil, et il range lui-même cette histoire parmi les événements qui ont **enrichi** la vision. Racontée
le 21/08, un mois après la Vision, elle l'a **confirmée** : *« mon appli me reflète encore plus que ce que je
croyais »*. ⚠️ La date de la consultation elle-même n'est écrite nulle part. Le 24/10 au matin, je l'avais
appelée « la racine » en répondant à Michel : c'était faux, et c'est lui qui l'a corrigé.

### ↪️ Les dates corrigées le 24/10/2026 (sur preuves)

| Ce qui était écrit | Ce qui est vrai |
|---|---|
| *« Date de naissance : 17 juin 2026 (première maquette Claude Design) »* | Ce n'est **pas** le début du projet : l'app tournait déjà en ligne le 8 juin et le dépôt GitHub existait depuis le 11. Ce que représente le 17 juin n'a **pas pu être vérifié** (aucune trace de ce jour-là ne parle d'une maquette). |
| *« Le suivi Git n'a démarré qu'au 30 juin »* | **Faux** : premier commit le 11 juin. Le 30 juin, c'est le `CLAUDE.md` qui décrit l'app découpée en modules (`d4ccce18`). |
| *« Le tout premier `CLAUDE.md` (30/06/2026) »* | Le premier date du **11 juin** (`0e19fd39`) ; ceux du 11 au 30 juin sont dans l'historique Git. |
| *« L'historique Git ne remonte qu'au 28/08/2026 »* | **Faux** : lu sur un clone tronqué — le « premier commit » cité, `86e1857`, est une fusion du 28/08. |
| Règles #6 et #10 *« au tout premier échange »*, *« avant toute ligne de code »* | Premier échange **des transcriptions conservées** ; le projet comptait déjà 136 versions (`ft-v136`, 1ᵉʳ juillet). |

**D'où venaient ces erreurs** : l'origine exacte n'est pas retrouvée. Un mécanisme est prouvé : les sessions
travaillent sur des **clones tronqués** de l'historique — celui du 24/10 commence le 16/10 — et un clone
tronqué fait croire que le dépôt commence plus tard qu'en réalité. L'historique complet se lit sur GitHub.

Corrigés le 24/10 : `CLAUDE.md`, `docs/DOSSIER-GPT.md`, `IDEES-FUTURES.md`, `docs/CONTRE-AUDIT-RECUP.md`,
`docs/AUDIT-NOCTURNE-2026-07-29.md`, la note de `docs/VISION-FORCE-TRACKER.md`, une entrée de
`docs/JOURNAL-DE-TEST.md`, et ce document ; `docs/JOURNAL-ARCHIVE.md` reçoit une **correction ajoutée à la
fin** (l'archive ne se réécrit jamais).

⚠️ **Pas corrigé, exprès** :
- l'écran « À propos » de l'app affiche *« 🎂 Né le 17 juin 2026 »* (`coach.js`). C'est un affichage voulu
  par Michel (ft-v494, 19/07) : il ne change que sur sa décision ;
- deux **commentaires du code** s'appuient sur « l'app est née le 17 juin » : `screens.js` (brique 7,
  *« personne n'a un an d'historique »*) et `setup.js` (règle ③ des records, *« un record du 14/06… la
  séance ne peut pas être dans l'historique »*). Vérifié le 24/10 : **le code ne dépend pas de cette
  date** — la règle des records compare la date du record à la plus ancienne séance de son exercice, et
  le déclencheur « il y a un an » n'est pas construit. L'argument du `setup.js` tombe (des séances
  existent dès le 12 juin), pas la règle. Ce chantier ne touche que la documentation : ces commentaires
  restent tels quels.

---

## 🌟 Ce qui a enrichi l'ESPRIT du produit — « ne pas juger sur un âge et une donnée »

*(↪️ Titre changé le 24/10/2026 : il disait « D'où vient l'ESPRIT du produit », et la phrase ci-dessous
était dite « fondatrice ». Michel range cette histoire parmi les événements qui ont enrichi la vision, pas
à son point de départ — section précédente.)*

**Dit le 21 août 2026**, un mois après la rédaction de ce document. Michel raconte une consultation
d'où il est ressorti vexé — non pas à cause de ce qui lui a été dit, mais de **la façon dont on est
arrivé là** :

> *« Le toubib m'a vexé sans apprendre à me connaître. […] Ce n'est pas mon ego qui parle je précise,
> c'est que je n'aime pas les gens qui jugent par rapport à un âge et à une donnée. »*

**⭐ CE QU'IL FAUT VOIR ICI : c'est la phrase qui résume le mieux l'ESPRIT du produit, formulée en creux —
pas son point de départ** (le projet a commencé, au plus tard en juin, comme un outil pour lui : voir plus
haut). L'esprit de Force Tracker se tient **contre** cette expérience. On la retrouve, mot pour mot ou
presque, dans tout ce qui a été écrit avant — sans que le lien ait jamais été fait explicitement :

| Ce qu'il dit le 21/08 | Ce qui était déjà écrit |
|---|---|
| « juger par rapport à un âge et une donnée » | **Tatiana** : *personnalisation, **pas de présupposés*** (`PERSONAS-FONDATEURS.md`) |
| « sans apprendre à me connaître » | *« la vie avant le programme »* · *« **observer** avant conseiller »* (`VISION`) |
| — | *« il ne te dit pas qui tu dois devenir, il **se souvient de qui tu es devenu** »* |
| — | **P12** : *le ressenti prime sur la donnée* — Milo croit la personne, il ne la contredit pas avec un score |

**Sa réaction en le découvrant** — et c'est elle qui justifie que ce soit écrit ici :

> *« mon appli me reflète encore plus que ce que je croyais »*

**Ce que ça dit** : les principes du produit n'ont pas été choisis dans un catalogue de bonnes
pratiques. Ils **rejoignent** une **expérience vécue d'être réduit à une catégorie** — et c'est pour ça
qu'ils tiennent. *(↪️ Précisé le 24/10/2026 : « ils viennent de » disait trop. La Vision est écrite le
19/07, la consultation racontée le 21/08 ; Michel la range parmi les événements qui ont enrichi la
vision.)* Une règle qui protège quelqu'un de quelque chose qu'il a réellement subi ne se contourne pas
« pour aller plus vite ».

**⚠️ Corollaire, et il est opérationnel** : le jour où une évolution de Force Tracker fera dire à Milo
« à ton âge », « avec ce chiffre », « les gens comme toi » — **ce n'est pas une maladresse de ton, c'est
une trahison de l'origine**. La bonne question reste celle de la Vision : *est-ce que cela renforce
l'esprit Force Tracker ?*

⚠️ **Le contexte médical de cette consultation n'est pas écrit ici, volontairement** : le dépôt est
public et ce document interdit lui-même d'y mettre des données de santé. Seul le principe compte.

---

## Les règles d'or

### 🛡️ Règle #6 — « Backup + branche avant toute opération risquée »
**Née le 2 juillet 2026, au premier échange des transcriptions conservées** (le projet existait déjà depuis au moins trois semaines).
Avant de faire travailler cette session, Michel pose le cadre :

> *« On va faire un test tous les 2, pour apprendre à se connaître. Je suis comme un bébé. Déjà primo,
> avant tout test il faut créer un backup avant toute écriture, ne déploie jamais sans mon
> autorisation. »*

**Ce que ça dit** : la règle n'est pas née d'un accident, elle est née d'une **méfiance saine assumée
dès le départ** — par quelqu'un qui savait qu'il ne pourrait pas relire le code. C'est un choix de
gouvernance, pas une cicatrice. *(Confirmée le 4/07 : « je ne vois pas de bug mais crée un point de
restauration ».)*

### ⚡ Règle #4 — « Ouverture instantanée à la salle, même hors-ligne »
**Née le 2 juillet 2026**, à propos des polices de caractères :

> *« Héberge les 3 polices dans le projet et ajoute-les au PRECACHE. Je veux supprimer toute dépendance
> internet au démarrage. »*

**Ce que ça dit** : la règle ne vient pas d'une théorie sur la performance, mais d'un **usage réel** —
on ouvre l'app dans une salle de sport, avec un réseau mauvais ou absent. Chaque dépendance externe au
démarrage est un risque de ne pas pouvoir lancer sa séance. *(Renforcée le 8/07 sur le poids des images :
« avec la 4G/5G les data sont gratuites — mais combien de temps pour l'installer ? »)*

### 🛟 Règle #3 — « Zéro perte de séance »
**Formulée le 6 juillet 2026**, à partir d'un risque concret que Michel anticipe :

> *« Chose importante : il faudrait détecter si quelqu'un s'entraîne, pour éviter que lorsqu'on fait une
> modif il ne perde pas tout. »*

**Ce que ça dit** : le déclencheur n'est pas une perte de données subie, c'est la peur d'en **provoquer
une en déployant**. La règle protège l'utilisateur *contre nous*. C'est ce qui a donné le refus de
recharger l'app en pleine séance (`app.js` : *« Ne jamais recharger l'appli en pleine séance — perte de
saisie / interruption d'un superset »*).

### 📣 Règle #11 — La checklist « prévenir l'utilisateur »
**Née le 4 juillet 2026**, en trois phrases lâchées à la suite pendant une session de restylage :

> *« N'oublie pas de mettre les petits points rouges pour montrer aux utilisateurs les nouvelles
> fonctionnalités. »*
> *« Il faut mettre à jour le fichier aide détaillée dans le menu. »*
> *« Et tu sais aussi le petit ? en haut de la page qui ouvre l'aide pour chaque onglet, il faut le
> mettre à jour aussi. »*

**Ce que ça dit** : la checklist des 5 points n'a pas été conçue d'un bloc — c'est la **mise en forme de
trois rappels séparés**, tous nés du même agacement : livrer une fonctionnalité que personne ne
découvre. *(Le « guide de l'application » arrive le 5/07 : « comme un PowerPoint… un petit film mais
avec l'image de l'application ».)*

### 🗣️ Règle #10 — « Michel n'est ni développeur ni programmeur »
**Posée le 2 juillet 2026**, dans son message de présentation — avant toute ligne de code de cette série de
conversations (le dépôt comptait déjà 136 versions). Il ne le dit
pas comme une excuse mais comme une **contrainte de conception** : les explications doivent être
compréhensibles, les opérations risquées annoncées, et rien ne doit supposer qu'il sait lancer une
commande.

---

## Les principes de la Constitution

### 👩 Le respect des femmes — anti-cliché
**Né le 5 juillet 2026**, en concevant l'offre débutant. La formulation de Michel est déjà exactement
celle qu'on retrouvera dans la Constitution :

> *« Je ne veux aucun cliché, homme et femme. Par contre le discours pour la femme et l'homme ne doit
> pas être le même. »*

Et dans la foulée, une exigence très concrète :

> *« Est-ce que tu as rajouté les migraines pour les femmes, qui sont plus fréquentes que chez les
> hommes ? »*

**Ce que ça dit** : le principe n'est pas venu d'une réflexion éthique abstraite (celle-ci arrivera le
22/07), mais d'un **souci pratique d'exactitude physiologique** — traiter les différences réelles sans
inventer de différences imaginaires.

### 🔒 La confidentialité des données de santé
**Né le 5 juillet 2026** :

> *« Les données santé ne sont pas sauvegardées pour l'instant. Déjà il faut notifier que seul
> l'utilisateur a accès à ces données. »*

**Ce que ça dit** : la protection a été pensée **avant** que la donnée existe, pas après un incident.
C'est la même logique qui donnera le masquage de l'identité sur les photos de bilan sanguin (ft-v313).

### 💎 Le freemium qui « donne envie »
**Né le 5 juillet 2026**, à propos de l'offre débutant :

> *« Peut-être faire le premier programme gratuit pour donner envie — c'est pour ça qu'il faut qu'il
> soit bon. »*

**Ce que ça dit** : la version gratuite n'est pas une version amputée, c'est une **démonstration**. Ce
sera formalisé bien plus tard en Principe 24 (« l'engagement responsable ») et dans la règle « le
gratuit doit toujours donner une victoire ».

↪️ *Précisé le 24/10/2026* : la philosophie elle-même est plus ancienne que ce 5 juillet. C'est celle du
départ, dite par Michel : *« une application gratuite réellement complète, utilisable pendant des années,
et des options payantes uniquement pour ceux qui veulent beaucoup plus »* (section « Pourquoi Force
Tracker a COMMENCÉ »). Le 5 juillet, elle s'applique à l'offre débutant.

---

## Deux moments de bascule

### 🔍 L'audit de sécurité du 10 juillet
Longtemps invisible dans le journal (qui n'en gardait que le résultat : *« Protection compte, code
perso »*, ft-v365/366). La conversation montre la démarche :

> *« Refait un point de sécurité, j'ai mis fable pour voir si tu trouves autre chose. »*
> *« Peut-on juste essayer sur un compte qui sert à rien ? »*
> *« Préviens les utilisateurs qu'il y aura une mise à jour de sécurité, explique ce qui sera fait. »*

**Trois réflexes en trois phrases** : croiser avec un autre modèle · tester sans risque · prévenir avant.

### 🧭 Le virage « cohérence » du 24 juillet
> *« Au début, on cherchait surtout à rendre Milo plus intelligent. Aujourd'hui, j'ai l'impression
> qu'on cherche surtout à le rendre plus cohérent. »*

**Ce que ça dit** : le changement de cap du projet a été **nommé par Michel lui-même**, pas déduit après
coup. C'est le point de départ de toute la gouvernance qui a suivi.

---

## Les décisions techniques structurantes

### 🚀 Le déploiement automatique du backend
**Né d'un agacement, le 8 juillet 2026** :

> *« Il va falloir trouver le moyen pour éviter de passer par mon PC pour faire les modifications, c'est
> super chiant. »*
> Puis, dans la même journée : *« Mais pourquoi tu ne m'as pas proposé ça avant ? Surtout que j'avais mon
> PC à portée de main il y a encore 10 minutes. »*

**Ce que ça dit** : le workflow GitHub qui déploie tout seul n'est pas une élégance technique, c'est la
suppression d'un **goulot d'étranglement humain**. Avant, chaque correction backend attendait que Michel
soit physiquement devant son PC. *(Constaté le 12/07 : « tu as oublié que tu peux tout faire, tu n'as
plus besoin que je passe devant mon PC ».)*

### 🩸 Le garde-fou médical du bilan sanguin
**Posé le 8 juillet 2026, avant même de construire la fonctionnalité** :

> *« Oui bien sûr, on ne rigole pas avec ça, ça peut vite faire peur s'il dit de la merde. »*

Et pour les données sensibles du document :

> *« Il faut trouver un moyen pour faire disparaître ces informations sensibles. »*

**Ce que ça dit** : la prudence médicale ET le masquage de l'identité ont été exigés **en amont**, comme
condition d'existence de la fonctionnalité — pas ajoutés après coup.

### 🗂️ La classification des données (ce qu'on stocke, ce qu'on jette)
**Décidée le 8 juillet 2026**, en une phrase qui tranche par la sensibilité :

> *« Les photos d'exercice, on les fout sur le Drive, on s'en fout si c'est pas trop sécurisé, c'est que
> des photos de machine. »*

À l'inverse, les PDF de bilan de santé et les photos de morphologie : *« celles-là on n'est pas obligé de
les garder »*.

**Ce que ça dit** : le critère n'est pas technique mais **la sensibilité du contenu**. Une photo de
machine et une photo de corps ne méritent pas le même traitement, même si ce sont deux images.

### 🔢 Le code-barres : lire les CHIFFRES, pas le code
**Décidé le 11 juillet 2026**, après échec du scanner classique :

> *« Le scanner ne prend pas du tout le code-barres, il ne se passe rien du tout. »*
> *« Bah problème résolu non ? La lecture des chiffres est super rapide. »*
> *« Et le scanner on oublie, c'est pourri. »*

**Ce que ça dit** : pourquoi la fonction s'appelle « lire les chiffres imprimés sous les barres » et non
« scanner un code-barres ». Ce n'est pas un contournement bancal — c'est le choix qui **marchait
vraiment** après test réel en magasin.

### ⏰ Milo doit avoir la notion du temps
**Demandé le 9 juillet 2026** :

> *« Petite chose sur le Coach : il n'a pas la notion du jour, de la nuit. »*
> *« Il faut qu'il se rende compte qu'on a discuté il y a huit heures — parce qu'en discutant avec lui,
> c'est comme si c'était la première fois. »*

**Ce que ça dit** : c'est l'ancêtre direct de tout ce qui deviendra la **continuité de Milo** (le débrief
qui se souvient de l'objectif précédent, le « ça fait X jours », la mémoire de la prochaine séance).
Validé par Michel lui-même le 27/07 : *« il a bien la notion du temps, c'est cool »*.

### 📶 Le problème de la 4G
**Signalé le 13 juillet 2026**, depuis un vrai manque de réseau :

> *« Je veux que tu commences à réfléchir à la solution pour la 4G — moi, pendant deux semaines, je n'ai
> pas de 4G. »*
> *« Et imagine les gens qui n'ont pas de wifi. »*

**Ce que ça dit** : l'origine de `PLAN-SOLUTION-4G.md`. Le déclencheur est un **usage réel et subi**, pas
une hypothèse — c'est la même famille que la règle #4.

---

## Le jour où la règle #11 est devenue une règle d'or

**12 juillet 2026.** La checklist existait depuis le 4/07 sous forme de rappels épars. Ce jour-là, après
avoir constaté qu'on l'avait encore oubliée (*« Faut tout rattraper »*), Michel ordonne de la graver :

> *« Il faut que tu le marques dans les règles d'or. Faire les pop-up, mettre à jour le guide
> d'installation et le guide de l'application dans le menu. »*

**Ce que ça dit** : une règle d'or n'est pas née d'une théorie — elle naît le jour où **le même oubli se
répète une fois de trop**. C'est exactement le mécanisme qu'on retrouvera avec R15 (le marqueur de
fermeture oublié deux fois) le 27/07.

---

## 📓 La naissance de la règle #12 — et son ironie

**18 juillet 2026.** Michel demande explicitement ce qu'on a passé la soirée du 27/07 à rattraper :

> *« J'aimerais que tu crées un fichier, ou dans `CLAUDE.md`, le suivi de chaque évolution **et sa
> raison**, avec une petite explication. »*
> *« Il faut écrire ce que l'on fait automatiquement. **Mets-le dans les règles stp, pas que je te le
> dise à chaque fois.** »*
> *« Tous les fichiers doivent être mis à jour en temps réel. Le fichier `CLAUDE.md` est super important
> aussi. »*

**Ce que ça dit — et c'est la découverte la plus utile de cette relecture** : Michel avait demandé **la
raison**, pas seulement le *quoi*. Neuf jours plus tard, on a mesuré que le *pourquoi* manquait pour
**70 %** des versions. **La règle existait, elle n'a pas été tenue.** Ce n'est pas un manque de
consigne, c'est un manque d'exécution — et c'est précisément ce que ce document répare.

### 🔑 Le mécanisme qui crée les règles d'or (constaté 3 fois)
La phrase *« pas que je te le dise à chaque fois »* est la clé. Une règle d'or ne naît **jamais** d'une
théorie chez Michel — elle naît le jour où **le même rappel revient une fois de trop** :
- **#11** (12/07) : *« Il faut que tu le marques dans les règles d'or »*, après avoir constaté un oubli.
- **#12** (18/07) : *« Mets-le dans les règles, pas que je te le dise à chaque fois. »*
- **R15** (27/07) : le marqueur de fermeture oublié **deux fois** (point rouge, puis pop-up).

*Corollaire pour l'avenir : quand Michel répète une consigne deux fois, ne pas la ré-appliquer — l'écrire.*

---

## Les décisions qu'on aurait mal comprises sans la conversation

### 🏋️ Les listes CrossFit / haltéro du 21 juillet
Le journal montre des dizaines d'exercices exotiques envoyés d'un coup. **Un lecteur en conclurait qu'on
ajoutait le CrossFit.** La conversation dit l'inverse :

> *« Ce n'est pas une décision produit, c'est un **test de robustesse**. Je ne cherche pas à ajouter le
> CrossFit aujourd'hui. »*

**Ce que ça dit** : c'était un test du moteur de reconnaissance d'exercices, pas une extension de
périmètre. Sans cette phrase, quelqu'un aurait pu « finir le travail » et partir dans une mauvaise
direction.

### 🤝 « Un avis extérieur, pas un exécutant » (20 juillet)
Le rôle des IA extérieures a été cadré par Michel dès le départ :

> *« Non, juste pour avoir un avis extérieur. Pas nous aider ici dans sa globalité. »*
> *« Fais d'abord un PDF pour GPT — il l'a fait pour toi, je veux **croiser** les infos. »*

Et sur la paternité des idées, sans ambiguïté :

> *« Alors sache que c'est moi qui ai dit à ChatGPT mes idées. »*

**Ce que ça dit** : la méthode du croisement (chaque IA challenge l'autre, Michel arbitre) est une
**décision de méthode**, pas une habitude accidentelle. *(Gravée seulement le 27/07 dans `README-IA.md` —
sept jours après avoir été énoncée.)*

### 🔐 « Je veux protéger mon code » (17 juillet)
> *« Non mais je ne veux pas qu'on copie mon code. **Je veux le protéger.** »*

**Ce que ça dit** : l'origine des en-têtes de propriété dans les fichiers. Le déclencheur est précis — il
venait de partager l'arborescence de l'app avec une IA extérieure et a réalisé l'exposition.

### 🫀 « Il n'a pas d'âme » (18 juillet)
À propos de Milo, qui ne demandait jamais **pourquoi** il n'était pas allé s'entraîner :

> *« Il ne le demande pas, pourquoi je ne vais pas au sport. Il n'a pas d'âme. »*

**Ce que ça dit** : c'est la graine de toute la réflexion sur la **présence** de Milo (`PRESENCE-MILO.md`,
les « moments Milo »), et elle est antérieure de 4 jours à la grande soirée philosophique du 22/07.
Renforcée par Tatiana le 21/07 : *« si tu veux que ton appli ait du succès, il faut intégrer ce côté
psychologique »*.

---

## 🔍 Audit des « loupés » (27/07) — moins nombreux que craint

Michel, en découvrant ce document : *« y'a eu des loupés de fou »*. Vérification faite en croisant ses
**demandes explicites** (104 messages contenant *« il faudra »*, *« n'oublie pas »*, *« j'aimerais
que »*…) avec **l'état réel du code** :

| Demande | État vérifié |
|---|---|
| Endométriose au profil femme · poids objectif · ligne menu « techniques » · photos d'accessoires · taille du cache affichée · audit du mode jour · offre débutant · compléments (créatine/whey + interactions) | ✅ **faites** |
| Mode compétition (force/body) · montres connectées (Strava/Garmin/Fitbit) | 📝 **notées dans `IDEES-FUTURES.md`** — parkées volontairement, pas oubliées |
| *« il faudra réaméliorer le logo, il est moche finalement »* (6/07) | ❌ **le seul oubli sec** — cosmétique |

**➡️ Conclusion** : les demandes de **fonctionnalités** ont été suivies. Les vrais loupés sont d'une
autre nature — ce sont des **loupés de MÉTHODE** :
1. le **pourquoi** explicitement demandé le 18/07 (règle #12), jamais tenu → 70 % des versions sans raison ;
2. la règle « avis extérieur, pas exécutant » énoncée le 20/07, **gravée seulement le 27/07**.

*Autrement dit : ce qui se perd n'est pas ce que Michel demande de **construire**, c'est ce qu'il demande
de **retenir**.* Une consigne de construction a un résultat visible (la fonctionnalité existe ou pas) ;
une consigne de mémoire n'en a aucun — personne ne voit qu'elle n'a pas été appliquée. **D'où la
nécessité d'outils qui le rendent visible** : `tools/inventaire.py`, et ce document.

---

## ⏳ Ce qui reste à retrouver

Ce document couvre maintenant **l'ensemble du 2 au 27 juillet** (les 26 jours de transcription
disponibles), mais **en relevant les décisions structurantes seulement**. Restent à exploiter, si
besoin un jour : le détail des briques du Dossier Athlète (18→20/07), la conception de la nutrition
(22/07) et le détail des retours testeurs.

📌 **Juin 2026 (avant les transcriptions)** : les conversations de cette période restent introuvables. Ce qui
comptait le plus — **pourquoi le projet a commencé** — est désormais écrit, dit par Michel le 24/10/2026
(section « Pourquoi Force Tracker a COMMENCÉ »).

⚠️ **Fenêtre à durée limitée** : ces transcriptions vivent dans l'historique des sessions, pas dans le
dépôt. Elles ne sont pas garanties dans le temps. **Le reste est à extraire tant qu'elles existent.**

---

*Complété au fil des relectures. Toute citation doit être vérifiée dans la transcription avant d'être
ajoutée — et ne jamais contenir d'email, de jeton ni de donnée de santé (dépôt public).*
