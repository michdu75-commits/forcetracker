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

---

## Les règles d'or

### 🛡️ Règle #6 — « Backup + branche avant toute opération risquée »
**Née le 2 juillet 2026, au tout premier échange.** Avant même de faire travailler Claude, Michel pose
le cadre :

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
**Posée le 2 juillet 2026**, dans son message de présentation — avant toute ligne de code. Il ne le dit
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

## ⏳ Ce qui reste à retrouver

Ce document couvre maintenant **l'ensemble du 2 au 27 juillet** (les 26 jours de transcription
disponibles), mais **en relevant les décisions structurantes seulement**. Restent à exploiter, si
besoin un jour : le détail des briques du Dossier Athlète (18→20/07), la conception de la nutrition
(22/07) et le détail des retours testeurs.

⚠️ **Fenêtre à durée limitée** : ces transcriptions vivent dans l'historique des sessions, pas dans le
dépôt. Elles ne sont pas garanties dans le temps. **Le reste est à extraire tant qu'elles existent.**

---

*Complété au fil des relectures. Toute citation doit être vérifiée dans la transcription avant d'être
ajoutée — et ne jamais contenir d'email, de jeton ni de donnée de santé (dépôt public).*
