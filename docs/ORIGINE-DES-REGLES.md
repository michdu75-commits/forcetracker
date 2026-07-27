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

## ⏳ Ce qui reste à retrouver

Ce document couvre **le 2 au 10 juillet** et deux moments clés plus tardifs. Les **16 jours restants**
(11 → 27 juillet) contiennent encore des décisions non documentées — notamment autour du Dossier
Athlète, du Coach, de la nutrition et des retours testeurs.

⚠️ **Fenêtre à durée limitée** : ces transcriptions vivent dans l'historique des sessions, pas dans le
dépôt. Elles ne sont pas garanties dans le temps. **Le reste est à extraire tant qu'elles existent.**

---

*Complété au fil des relectures. Toute citation doit être vérifiée dans la transcription avant d'être
ajoutée — et ne jamais contenir d'email, de jeton ni de donnée de santé (dépôt public).*
