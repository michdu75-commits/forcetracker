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
  ⏳ **Le benchmark (`tests/milo/eval*`) est EN PAUSE jusqu'à 25 entrées** — décision de Michel le 21/08/2026 : *« on met de côté le benchmark, on n'a pas assez de pièges pour Milo »*, puis *« dès que tu auras marqué 25 questions ou pièges on le relance »*. **Le compte est affiché par `python3 tools/check_regles.py`** à chaque livraison, précisément pour qu'on ne puisse pas l'oublier — *une intention qu'aucun outil ne rappelle finit par s'éteindre.*
- **Règle stricte** : aucune version livrée (commit/push) sans que TOUS les fichiers de suivi concernés soient à jour **dans le même commit** (ou juste avant). Si un retard est constaté → **rattrapage immédiat** (1 ligne par version manquante) avant toute autre chose.
