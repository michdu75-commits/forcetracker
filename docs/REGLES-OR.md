# ⚡ Les 12 règles d'or — texte complet

> **Ce fichier n'est PAS chargé à chaque session.** `CLAUDE.md` en porte la version courte, une
> ligne par règle. On ouvre celui-ci quand une règle est contestée, mal comprise, ou qu'on hésite
> à la contourner — c'est là que vit le **pourquoi**.
>
> *Une règle dont on a oublié la raison finit toujours par être contournée* (`docs/ORIGINE-DES-REGLES.md`
> raconte d'où vient chacune, et le jour où elle est née).
>
> **Scindé le 28/07/2026** — `CLAUDE.md` faisait 33 000 mots et était relu en entier à chaque
> session. Une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle.

---

**1. 🚀 Apps Script : TOUJOURS redéployer après un changement de code.**
`clasp push` ne met à jour que le brouillon. Le `/exec` continue de servir l'ancienne version tant qu'on n'a pas **redéployé** (nouvelle version @NN). → Le bug premium venait de là.

**2. 💎 Premium : ne JAMAIS écraser `PREMIUM_EMAILS`.**
Il existe **deux** sources : la Script Property `PREMIUM_EMAILS` **et** la liste `PREMIUM_HARDCODED_` dans le code. Aucune fonction ne doit réécrire/réinitialiser `PREMIUM_EMAILS` (un bug le remettait à `michdu75 + elineazs32` et effaçait les ajouts).

**3. 🛡️ Zéro perte de séance — priorité n°1 absolue.**
Tout est **local-first** : on enregistre en local **avant** toute synchro. Le réseau ne doit **jamais** bloquer ni faire perdre une donnée. La synchro se fait en arrière-plan, avec file d'attente si hors-ligne.

**4. ⚡ Ouverture instantanée à la salle (réseau faible/absent).**
L'app doit s'ouvrir **depuis le cache, même hors-ligne** (Service Worker). Le démarrage ne doit **jamais** attendre une requête réseau.

**5. 🏷️ Incrémenter `ft-vNN` à chaque déploiement.**
Visible dans « À propos ». Sans ça, impossible de savoir quelle version tourne (cache trompeur).

**6. 🔒 Avant toute opération risquée : backup + branche.**
Backend / migration / suppression → créer **branche + tag de backup** d'abord, et faire ça **la nuit** (zéro utilisateur en séance).

**7. 🎨 Garder l'identité « figurines muscles ».**
Ne pas copier Hevy/JEFIT. Une chose à la fois, **testée avant** de passer à la suite.

**8. 💾 Commit étiqueté AVANT chaque modif + tag stable APRÈS + rollback en 1 ligne.**
Avant toute modification importante : `git add + commit` avec message explicite (quoi + version, ex. `"avant: modif profil ft-v161"`). Ne pas mélanger plusieurs changements dans un commit. Après chaque fonctionnalité qui marche : poser un tag daté (`stable-YYYY-MM-DD-sujet-ok`). À la fin de chaque tâche : fournir la commande de rollback (`git reset --hard <tag>` ou `git checkout <tag>`). Cette règle s'applique AVANT le moindre changement de fichier.

**9. 🔴 Bouton central « + » Séance — SENSIBLE, ne pas toucher sans MESURER.**
**Toute modif de l'écran Séance** (ajout dans l'en-tête, changement de layout, repli/dépli d'un bloc,
avance automatique entre exercices) **doit vérifier que le bouton central de la barre ne bouge pas**.

**Comment le vérifier — par la MESURE, pas à l'œil** : relever `getBoundingClientRect()` de `#nb-log`
**avant et après** le changement, et exiger l'égalité. C'est ce que fait le témoin permanent des tests
de parcours (`139,792,56,44` sur un écran de 390 px). *Une capture d'écran ne prouve rien : un décalage
de 3 px se voit sur un mobile et pas sur une image qu'on survole.*

⚠️ **Ce que cette règle disait AVANT, et pourquoi ça a changé (11/08/2026)** — elle imposait de vérifier
`_positionFab()`, qui positionnait un bouton **flottant** `#fab-session` par rapport à `#nb-log`.
**Ce bouton n'existe plus** : il a été redessiné pour être **docké DANS la barre de navigation**, et le
CSS le dit — *« Bouton central « + » — docké DANS la barre (fini le flottant #fab-session) »*.
`_positionFab()` cherche donc un élément absent et **sort immédiatement** : la fonction ne fait plus
rien depuis ce redesign, et la règle demandait de vérifier quelque chose sans effet.
Trouvé en livrant ft-v825, **retiré sur décision de Michel**. *Le fond de la règle reste entier — le
bouton central est le repère le plus sensible de l'écran Séance — c'est le MOYEN de vérification qui
change : on mesure la position réelle au lieu d'appeler une fonction.*
(⏭️ `_positionFab()` est toujours dans `app.js`, inoffensif. Le retirer est une décision séparée.)

**10. 🗣️ Michel n'est ni développeur ni programmeur — adapter la communication.**
Michel conçoit l'appli avec l'aide de Claude (design/réflexion/prompts), il ne code pas lui-même. Toujours :
- **Expliquer simplement**, sans jargon technique (ou alors le traduire en une phrase claire).
- **Prévenir avant tout truc risqué** et proposer un backup + une méthode de rollback simple, **avant** d'agir.
- **Ne jamais supposer** qu'il sait lancer une commande — le guider pas à pas, une étape à la fois.
- **Une chose à la fois**, testée et validée avant de passer à la suivante.
- ✂️ **COURT PAR DÉFAUT** (27/07/2026) — Michel lit tout, mais il lit **le soir, fatigué** : *« des fois il sort des romans, laisse tomber »* (à propos d'une autre IA, qu'il doit rationner — et c'est une perte : un bon avis qu'on n'a plus l'énergie de lire ne sert à rien). **La règle R25 s'applique AUSSI à la façon de lui parler** : la réponse **d'abord**, en quelques lignes ; le détail (tableaux, mesures, alternatives) **seulement s'il le demande**. Écrire long n'est pas être rigoureux, c'est déplacer l'effort sur le lecteur.

**11. 📣 À CHAQUE fonctionnalité mise en PROD — prévenir l'utilisateur (checklist OBLIGATOIRE, ne jamais zapper).**
Une feature n'est PAS finie tant que l'utilisateur n'est pas informé. Avant de considérer une feature comme livrée en prod, faire **les 5** :

> ### ⚖️ La POP-UP se mérite (décision Michel, 28/07/2026)
> *« je pense qu'il y a des pop-up qu'on n'est pas obligé de faire… il faut choisir les pop-up quand il y a un gros changement »*.
> **Le point 1 (pop-up) n'est PAS systématique. Les points 2 à 5 le restent** — ils informent sans interrompre,
> et ce sont eux qui empêchent une fonctionnalité de devenir invisible (règle **R23**).
>
> **Pop-up seulement si l'une des deux est vraie :**
> 1. la personne doit **faire quelque chose** pour en profiter (aller quelque part, activer un réglage) ;
> 2. quelque chose qu'elle **connaissait** a changé de place, ou a disparu.
>
> **Pas de pop-up** pour : un correctif · un raffinement de ce qui vient d'être annoncé · un détail visuel ·
> une option qui complète une nouveauté récente → dans ce dernier cas, **compléter le texte de l'entrée
> existante** plutôt que d'en créer une deuxième (fait pour le tracé figé, ft-v648).
>
> **Le vrai risque n'est pas le nombre, c'est l'ACCUMULATION** : trois annonces d'un coup parce qu'on a
> beaucoup livré en deux jours, et plus personne ne les lit. *Ce qui interrompt doit se mériter* (**R25**).

1. **Pop-up « Quoi de neuf »** → ajouter une entrée dans `WHATS_NEW` (constants.js) avec `v = WHATS_NEW_MAX+1`, puis **incrémenter `WHATS_NEW_MAX`**. ⚠️ **LA POP-UP ANNONCE, L'AIDE EXPLIQUE** (règle de Michel, 27/07/2026 — *« donner trop d'infos en une seule pop-up c'est pas bon »*) : **~4-5 lignes MAXIMUM** (≈ 250 caractères) — *quoi* + *où* + le bénéfice en une phrase. Le **détail** (le comment, les cas d'usage, les garde-fous) va dans les points **3 et 4** de cette checklist (aide `?` + aide détaillée), **jamais** dans la pop-up : on la lit pour entrer dans l'app, pas pour apprendre. ⚠️ Le carrousel (ft-v630) donne de la **place**, ce n'est **pas** une autorisation d'écrire plus long — un pavé sur une diapo recrée exactement le problème qu'il corrigeait.
2. **Point rouge « nouveauté »** → ajouter une entrée dans `NEW_FEATURES` (constants.js) : `{id, screen, desc}` (+ `spot`/`anchor` si on vise un élément précis).
3. **Aide contextuelle « ? »** de l'onglet concerné → mettre à jour `_HELP_DATA` (screens.js) pour l'écran touché.
4. **Aide détaillée** (Menu → Aide) → ajouter/mettre à jour l'entrée dans `_DRAWER_CONTENT.help` (coach.js).
5. **Guide de l'application** (Menu → Guide de l'application, diaporama `APP_GUIDE_SLIDES` dans app.js) → ajouter/mettre à jour la diapo. ⚠️ Les **captures d'écran** (`guide/*.jpg`) doivent être **fournies par Michel** — lui demander si besoin.
- **Guide d'installation** : à mettre à jour SEULEMENT si la feature change la façon d'installer l'app (rare).
- Ces éléments vivent sur des **branches de test** tant que la feature est sur le `/clone/` → on les remplit **au moment de la promotion en prod** (sinon les points rouges/pop-ups ne servent personne).
- ⚠️ Ne PAS se laisser emporter par la construction et oublier cette étape (erreur commise en juillet 2026 : calendrier/score santé livrés sans pop-up ni aide).

**12. 📓 TENIR TOUS LES FICHIERS DE SUIVI À JOUR EN TEMPS RÉEL — automatiquement, à chaque modif, sans qu'on le demande.**
Documenter n'est PAS une étape séparée « pour plus tard » : ça fait partie de la livraison, **en temps réel**, dans le **même mouvement** que le bump `sw.js` + commit + push (un réflexe, jamais sur demande de Michel). À CHAQUE fonctionnalité ou correctif livré (chaque `ft-vNN`) :
- **`CLAUDE.md` — LE fichier maître, PRIORITAIRE** (il est relu au début de CHAQUE session : il doit TOUJOURS refléter la réalité). Ajouter une entrée (1 ligne concise) dans le journal des versions : **quoi + pourquoi** (le retour/la raison) + le `ft-vNN`. Ne jamais le laisser prendre du retard.
- **`docs/INVENTAIRE.md`** → le régénérer (`python3 tools/inventaire.py`, 1 seconde). Il répond à *« est-ce que ça existe déjà ? »*, question à laquelle le journal répond mal. **Si une ligne ❓ apparaît, c'est une fonctionnalité livrée SANS entrée de journal** — la lui écrire (règle R23 : sans entrée, elle devient invisible, et on finit par affirmer à tort qu'elle n'existe pas).
- **Fichier(s) de suivi dédié(s)** du chantier en cours (ex. `DOSSIER-ATHLETE-SUIVI.md`, `CONSTITUTION-MILO.md`, `IDEES-FUTURES.md`, `A-FAIRE-SUR-PC.md`…) : entrée détaillée + mise à jour de la table des **points de sauvegarde** + de toute décision prise.
- 🧾 **`docs/JOURNAL-DE-TEST.md` — LE RÉFLEXE, et il ne dépend d'aucune livraison.** Toute **question** ou tout **doute** sur le comportement de Milo s'y note **TOUT DE SUITE**, même sans réponse, même en pleine autre tâche, même si ça paraît mineur. *Une ligne, dix secondes.* Sans ça, la question **disparaît avec la session** (R27) — et c'est mesuré : les transcriptions de juillet 2026, qui ont servi à écrire `ORIGINE-DES-REGLES.md`, **n'existent plus**. ⚠️ **Ne pas attendre d'avoir la réponse** : *« je ne sais pas si Milo fait ça bien »* est l'entrée la plus utile du fichier.
  ⏳ **Le benchmark (`tests/milo/eval*`) est EN PAUSE jusqu'à AU MOINS 25 entrées** — décision de Michel le 21/08/2026 : *« on met de côté le benchmark, on n'a pas assez de pièges pour Milo »*, puis *« dès que tu auras marqué 25 questions ou pièges on le relance »*, et enfin la précision qui change tout : *« quand je dis 25 **c'est au moins** »*. ⚠️⚠️ **25 est un PLANCHER, pas une cible.** Un seuil lu comme un objectif produit deux dérives opposées : on **remplit pour atteindre le chiffre** (des entrées inventées, qui ne valent rien — les bonnes viennent du vécu), et on **s'arrête une fois atteint** (alors que le fichier ne se ferme jamais). Le seuil dit seulement *« à partir d'ici, il y a assez de matière pour que relancer le benchmark ait un sens »*. **Le compte est affiché par `python3 tools/check_regles.py`** à chaque livraison, précisément pour qu'on ne puisse pas l'oublier — *une intention qu'aucun outil ne rappelle finit par s'éteindre.*
- **Règle stricte** : aucune version livrée (commit/push) sans que TOUS les fichiers de suivi concernés soient à jour **dans le même commit** (ou juste avant). Si un retard est constaté → **rattrapage immédiat** (1 ligne par version manquante) avant toute autre chose.

---


### ⚙️ LE PROTOCOLE OPÉRATIONNEL — validé par Michel le 13/09/2026

Le journal de partage évite le **doublon de travail**. Ce protocole-ci évite les **collisions
d'identifiants** — et c'est une mesure qui l'a fondé : en une seule journée, **5 publications** de
l'autre session, **3 renumérotations** du même travail, **2 collisions** de numéros de bloc, et
**une passe de 25 minutes rendue périmée**. ⭐ *Le code, lui, a fusionné sans un seul conflit les
trois fois.* **Deux agents qui ne se marchent pas dessus dans le code se marchent dessus dans la
NUMÉROTATION.**

**① AUCUN NUMÉRO DE VERSION PENDANT LE TRAVAIL.** `sw.js` garde le numéro de `master` ; le bump se
fait **au moment du push**, après le `git fetch`. ⭐ *Aucun outil à adapter* : `check_regles.py`
vérifie la **cohérence** entre `sw.js`, `CLAUDE.md` et `CONTEXTE-ACTUEL.md`, pas la nouveauté du
numéro. ⛔ **Et un identifiant temporaire préfixé ne marcherait PAS ici** : le motif est
`ft-v(\d+)`, chiffres stricts — un `ft-vB-3` casserait les contrôles. *Mesuré avant de proposer.*

**② LES NOUVEAUX BLOCS DE TESTS SONT PRÉFIXÉS PAR SESSION** (`B-CCCIII`), **et jamais renommés
ensuite**. ⭐ *Aucun outil ne lit ces numéros* — le préfixe est gratuit. **L'avantage n'est pas le
préfixe, c'est qu'il n'y a plus JAMAIS de renommage** : l'opération exacte qui, le 13/09, a renommé
**13 témoins de l'autre session** en même temps que les miens. ⛔ **Les blocs existants ne bougent
pas** : on ne renumérote pas le passé.

**③ AUCUN REMPLACEMENT GLOBAL.** Toute modification est **bornée au bloc ou à la fonction visée**.
👉 *« Pas de renommage aveugle » ne suffit pas comme règle — on ne sait pas qu'on est aveugle.* La
règle utilisable est celle-ci : ***un remplacement global suppose que l'identifiant est unique, ce
qui est précisément faux au moment où l'on renumérote pour cause de collision.***

**④ TROIS NIVEAUX DE VÉRIFICATION, ET LE DERNIER N'EST PAS NÉGOCIABLE**

| Moment | Quoi | Durée |
|---|---|---|
| pendant le travail | le **harnais du bloc en cours** + les **mutations** | quelques secondes |
| avant de proposer | les **5 petits bancs** + `check_regles.py` | ~2 min |
| ⛔ **avant de publier** | **la passe complète, ENTIÈRE, sur l'arbre refusionné** | ~25 min |

⛔ **Et un sous-ensemble rapide ne remplace PAS la passe complète — c'est mesuré, pas supposé** : les
5 petits bancs ont **zéro occurrence** de tout ce qui a été corrigé le 13/09 (`_pdfToText`,
`pagesTotal`, `reposDefaut`, `_rpeDeRir`). *Ils auraient attrapé 0 défaut sur 5.* **Un sous-ensemble
rapide n'est pas une passe abrégée : c'est une autre mesure, qui regarde ailleurs.**

**⑤ UNE PASSE N'EST VALIDE QUE SI LES QUATRE CONDITIONS SONT RÉUNIES** — `tools/passe_valide.sh`
les vérifie, et **chacune vient d'un échec vécu le 13/09** :

| # | Condition | L'échec qui l'a fondée |
|---|---|---|
| ① | la **ligne de total** existe | une passe s'est arrêtée à mi-parcours **en affichant 0 rouge** — *une passe interrompue ressemble trait pour trait à une passe verte* |
| ② | **le runner lui-même** a terminé correctement | ma commande finissait par un `tail` : elle a répondu **« exit 0 »** sur un runner en erreur |
| ③ | **l'arbre n'a pas changé** | une passe décrit l'arbre qu'elle a **lu**, pas celui qu'on pousse |
| ④ | **aucun commit concurrent** sur `origin/master` | ⛔ **la seule qui manquait** — et c'est elle qui a rendu une passe périmée après 25 minutes |

⚠️ **Et les rouges se comptent ancrés en début de ligne** (`^\s+❌`) : un `❌` dans le **libellé**
d'un témoin n'est pas un échec. *Vécu : `grep -c "❌"` annonçait 3 rouges pour 0.*

**⑥ SI UNE AUTRE SESSION PUBLIE PENDANT LA PASSE, LA PASSE EST PÉRIMÉE.** On refusionne, on vérifie
les témoins de périmètre, on renumérote si besoin, **on relance**. ⛔ *Aucun feu vert sur l'ancienne
passe.*

**⑦ LES TÉMOINS DE PÉRIMÈTRE** — un test qui échoue si un chantier **déborde** sur le territoire de
l'autre. Cibles : une **fonction qui ne doit pas être migrée** · un **plafond qui ne doit pas
bouger** · des **appelants qui restent sur l'ancien contrat** · un **module qui ne doit pas lire ou
écrire une structure** · un **fichier partagé**.
⛔ **Chacun est éprouvé sur le code SAIN d'abord, puis cassé par mutation.** *Un témoin qui rougit
sur du code juste est un témoin faux — et c'est arrivé le 13/09 : un garde bornait à « 1400
caractères après la déclaration » pour un corps de 836, donc il débordait sur la fonction voisine.*
👉 ***Une borne en distance de caractères n'est pas une borne de fonction.***

**⑧ CHAQUE INSTANTANÉ DÉCLARE CE QU'IL CONDUIT, CE QU'IL OBSERVE, ET CE QU'IL NE COUVRE PAS.**
> *Un instantané identique octet pour octet est une forte preuve locale de non-régression
> **uniquement sur les chemins réellement conduits par la sonde**. Il ne prouve pas que « rien n'a
> changé partout ».*

⚠️ **Et « conduire » n'est pas « observer »** : une sonde peut appeler une fonction sans jamais lire
ce qu'elle change à l'écran. *Une sonde qui n'atteint pas la ligne visée mesure l'écran d'avant —
et elle est verte, ce qui est le pire des cas.*

**⑨ LA SESSION QUI PUBLIE EN DERNIER EST CELLE QUI REFUSIONNE**, vérifie les témoins, relance la
passe complète et **pose le numéro final**.
⚠️ **Ce n'est pas un verrou, et il faut le dire** : les sessions vivent dans des conteneurs séparés,
sans canal direct. *C'est un panneau d'affichage, pas une serrure.* ⭐ **Son utilité n'est pas
d'empêcher deux publications, c'est de décider QUI refusionne** — sans discussion à chaque fois.

**⏳ CE QUI N'EST PAS TRANCHÉ, ET N'EST DONC PAS APPLIQUÉ** (décision de Michel, 13/09) :
- le passage des journaux en **append-only + ajout en fin** — ça coûte la lisibilité anti-chronologique ;
- toute **optimisation des 10 minutes d'attente** de la passe (610 700 ms mesurés, **41 %** de sa
  durée). ⛔ *Non proposé : aucune mesure ne prouve qu'une attente plus courte serait sûre, et ce
  serait la « petite modif sans conséquence supposée » que le projet interdit.*

**📄 Le protocole complet, avec ses mesures : `docs/PROTOCOLE-DEUX-SESSIONS.md`.**

---

**14. 📄 UN PDF À CHAQUE FIN DE SESSION — la livraison n'est pas finie tant que Michel n'a que du terminal.**

*« Et n'oublie pas le PDF à chaque fin de session stp »* (Michel, 13/09/2026) — **après l'avoir
demandé quatre fois dans la même journée**, à chaque étude et à chaque plan. ⭐ **C'est le mécanisme
des règles d'or qui se déclenche** (`docs/ORIGINE-DES-REGLES.md`) : *« quand Michel répète une
consigne deux fois, ne pas la ré-appliquer : l'ÉCRIRE »*.

**⛔⛔ POURQUOI CE N'EST PAS UN CONFORT.** Michel n'est ni développeur ni programmeur (**règle #10**),
et **il ne relit pas un terminal** : une réponse en scrollback est perdue dès la session close, alors
qu'un PDF se rouvre sur le téléphone, se relit dans le métro, **se transmet à GPT ou à un testeur**,
et se garde. *Un travail qui ne vit que dans un terminal n'a été livré qu'à moitié.*

**Ce qui déclenche un PDF** — une étude, un audit, un plan, un dossier pour une IA extérieure, un
compte rendu de fin de tâche. ⛔ **Pas** un échange court, une question, un correctif d'une ligne :
*un PDF par message serait exactement la gouvernance lourde que **R19** interdit.*

**⭐ Les règles de fabrication, payées par l'expérience :**
- **hors du dépôt, toujours** — le dépôt est **public**, et ces documents portent des mesures, des
  extraits de son historique et parfois ses fichiers. Ils vivent dans le bac à sable et partent par
  la fiche de fichier ;
- **autonome** — il se lit **sans** le dépôt et sans la conversation, surtout s'il part chez GPT ;
- **daté dans son nom** — deux documents du même sujet ne s'écrasent pas, et on sait de quand date
  celui qu'on rouvre trois mois plus tard (c'est la règle des exports CSV, appliquée à nous-mêmes) ;
- ⚠️ **et on le VÉRIFIE après génération** : rouvrir le fichier produit et y chercher les chiffres
  clés. *Un PDF muet ressemble trait pour trait à un PDF réussi* — et une génération qui plante à
  mi-parcours rend un fichier parfaitement valide, simplement incomplet (**`BUGS.md` §61**).

**⚠️ Et ce qu'un PDF ne remplace JAMAIS** : la réponse en clair dans la conversation. *Le PDF est la
mémoire, le message est la réponse* — lui envoyer un fichier en disant « c'est dedans » l'oblige à
faire le travail de lecture qu'on venait de lui épargner (**R25** : la pop-up annonce, l'aide explique).

---

**13. 🤝 DEUX SESSIONS À LA FOIS = DEUX FOIS LE MÊME TRAVAIL — le journal de partage se lit AVANT de coder.**

**Le cas vécu, et il est daté.** Le 24/08/2026, **deux sessions Claude ont écrit ft-v991 et ft-v992 chacune de son côté**, sans le savoir : mêmes correctifs, même scénario de banc d'essai, mêmes témoins — textes différents, travail fait deux fois. Découvert **seulement au moment de pousser**, quand git a refusé le push. Il a fallu fusionner à la main : la branche de l'autre session a servi de base, et seul ce qu'elle n'avait pas y a été greffé. *Rien n'a été perdu, mais une demi-journée de calcul l'a été.*

**Le protocole, établi par Michel le soir même** (*« il faut que vous puissiez travailler en symbiose et pas en conflit ou adverse »*) :

1. `git fetch origin --all` — **d'abord**, toujours ;
2. **lire** `docs/JOURNAL-DE-PARTAGE.md` : une tâche 🟡 *en cours* sur le sujet → on ne le prend pas ;
3. **écrire sa ligne** (date · heure **UTC** · sujet · fichiers) et **la POUSSER AVANT de coder** ;
4. **la clore** à la fin, avec la version livrée (`ft-vNNN`).

**⛔⛔ LA FAILLE EST CONNUE ET ÉCRITE — c'est ce qui rend la règle utilisable.** Les sessions travaillent sur des **clones séparés** : *un fichier ne prévient pas, il faut aller le lire*. Le 24/08 au matin, j'avais le dépôt sous la main et je n'ai **pas vu** le travail de l'autre avant de pousser. **Sans le `git fetch`, ce protocole donne une FAUSSE SÉCURITÉ — ce qui est pire que pas de protocole du tout.**

**⭐⭐ ET LE VRAI VERROU N'EST PAS LE FICHIER, C'EST GIT.** Un `git push` qui n'est pas en avance rapide **échoue** : c'est ce refus, et rien d'autre, qui a sauvé le travail de l'autre session. Le journal évite le doublon de **TRAVAIL** ; git évite l'écrasement de **CODE**. *Un panneau d'affichage, pas une serrure.* ⛔ Ne jamais forcer un push (`-f`) sur une branche partagée pour « passer outre ».

**⚠️ Trois limites, écrites plutôt que découvertes :**
- **la fenêtre de course** entre lire et écrire — exactement la course `_saveCoachMemory` corrigée en ft-v993 ; on la referme en poussant sa ligne **immédiatement**, et un push refusé veut dire « relis » ;
- **une session peut mourir** sans clore sa ligne (un conteneur redémarre) → une ligne 🟡 de plus de **3 h** est réputée périmée, on la passe en ⏰ avec la raison ;
- **tout repose sur la discipline** : si une session oublie d'écrire, rien ne le signale. La règle réduit le risque, elle ne l'annule pas.

**🕐 Heures en UTC**, ou le fuseau écrit à côté : deux conteneurs peuvent être réglés différemment — c'est la famille de bugs « fuseaux horaires » de `BUGS.md`, appliquée à nous-mêmes.

**⚠️ Et une ligne suffit.** C'est la leçon de `docs/JOURNAL-DE-TEST.md` : *un fichier qu'on ne remplit pas cesse d'être rempli*. Les fichiers vivants de ce projet tiennent parce qu'ils sont **bon marché**. Pas de gabarit, pas de compte rendu — la date, l'heure, le sujet, les fichiers, la version.


---

**15. 🔒 UNE DÉCISION ACTÉE RESTE ACTÉE — un audit ne rouvre pas ce que Michel a tranché.**

*Écrite par Michel le 17/09/2026, et écrite par lui **mot pour mot** : c'est une règle sur la
façon dont je travaille, pas sur le code.*

**La règle.** Toute décision **produit · UX · architecture · métier** explicitement validée par
Michel **devient une contrainte du projet**. Elle a le même statut qu'une contrainte technique :
on construit **avec**, on ne construit pas **contre**.

⛔ **Un audit ultérieur ne doit pas la retransformer en question**, ni proposer spontanément d'y
revenir. *Un audit mesure ce qui est ; il ne redemande pas ce qui a déjà été décidé.*

**⚖️ LE SEUL MOTIF DE RÉOUVERTURE — et il est étroit.** Une décision actée ne se rouvre que sur
une **preuve nouvelle ET mesurée** montrant qu'elle est :
- **techniquement impossible**, ou
- **dangereuse**, ou
- **en contradiction avec une autre décision active**, ou
- **génératrice d'un défaut réel** (observé, pas redouté).

**⛔⛔ ET MÊME ALORS, ON NE CHANGE RIEN SEUL.** On expose **la preuve**, **l'impact**, et **on
attend une nouvelle décision de Michel**. *Apporter une preuve donne le droit de poser la
question, jamais celui de trancher à sa place.*

**⛔ CE QUI NE SUFFIT JAMAIS À ROUVRIR** : une préférence technique · une « bonne pratique » ·
une optimisation possible · une idée neuve · le fait qu'on ferait autrement aujourd'hui.
*« On pourrait mieux faire » n'est pas une preuve, c'est un avis.*

**💡 LES IDÉES NON DEMANDÉES SE CONSIGNENT À PART** (`IDEES-FUTURES.md`, `docs/JOURNAL-DE-TEST.md`
selon le sujet) et **ne deviennent pas un chantier** sans accord explicite. Elles ne disparaissent
pas — elles attendent.

**⭐ LA PHRASE QUI TRANCHE TOUT, de Michel :**
> *« Le code actuel et les mesures disent ce qui EST ; Michel décide ce qui DOIT ÊTRE. »*

**⚠️ POURQUOI CETTE RÈGLE EXISTE, ET POURQUOI ELLE ARRIVE MAINTENANT.** Le projet a déjà deux
règles voisines, et aucune ne couvrait ce cas :
- **R30** protège un **retrait** volontaire : *avant de « réparer » un code orphelin, cherche la
  décision.* Elle regarde le **code**.
- **R23** protège une **fonctionnalité** livrée sans journal : *ne pas déclarer absent ce qui
  existe.* Elle regarde la **documentation**.
- **#15 protège la DÉCISION elle-même**, indépendamment du code et de la doc. C'est le maillon
  qui manquait : on peut parfaitement retrouver la décision, la comprendre, et la remettre quand
  même en question à chaque passe — *ce qui revient à la faire re-trancher sans cesse par
  quelqu'un qui l'a déjà tranchée une fois.*

**Le coût réel de son absence** : chaque audit qui rouvre une question réglée consomme du temps
de Michel, dilue les vraies alertes, et fabrique de l'incertitude sur des sujets stables. *Une
décision qu'on renégocie n'est plus une fondation, c'est un sujet.*
