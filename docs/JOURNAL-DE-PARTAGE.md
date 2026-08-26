# 🤝 Journal de partage — qui travaille sur quoi, en ce moment

> **Créé le 24/08/2026, protocole établi par Michel** après une collision réelle le matin même :
> **deux sessions Claude ont écrit ft-v991 et ft-v992 chacune de son côté**, sans le savoir. Même
> travail, deux fois, découvert seulement au moment de pousser — il a fallu fusionner à la main.
>
> *« Il faut que vous puissiez travailler en symbiose et pas en conflit ou adverse. »* (Michel)

---

## 📋 Les tâches

> ⭐ **CE TABLEAU EST EN TÊTE DU FICHIER, ET C'EST VOLONTAIRE (26/08/2026).** Il était à **73 %**
> du document, sous 117 lignes d'explication — alors que *tout le reste du fichier n'existe que
> pour lui*, et que le mode d'emploi disait « le tableau **ci-dessous** » 111 lignes trop tôt.
> Deux raisons, et la seconde est un correctif de bug :
> ① on lit et on écrit ici **avant** de coder, donc c'est ce qu'on doit voir en premier ;
> ② **il devient le PREMIER tableau du fichier**, donc une insertion qui vise « la première ligne
> `| 🟢` » tombe au bon endroit. *Deux lignes de tâche s'étaient perdues dans la légende (25/08,
> 26/08), où markdown les rendait invisibles* — c'est la famille **« le premier match gagnant »**
> de `BUGS.md`, retournée à notre avantage.
> ⛔ **Le contrôle 6 de `tools/check_regles.py` reste**, exprès : la légende est toujours une cible
> possible, et *un détecteur qu'on retire parce qu'on a corrigé la cause laisse la rechute muette*.

| État | Quand (UTC) | Qui | Sujet | Fichiers | Version |
|---|---|---|---|---|---|
| 🟡 | 26/08 15:40 | session-B (claude-md-docs) | **CHANTIER SÉANCE ③ — LE DÉBRIEF CHIFFRÉ EN LOCAL** (`docs/SEANCE-DESSAI.md` §4). Aujourd'hui c'est symétrique et faux dans les deux sens : hors ligne on n'a que « N exercices · N séries · N kg », et EN LIGNE `slot.innerHTML=` **remplace** les chiffres par le texte de Milo. Le doc demande les deux : les faits en local TOUJOURS, Milo ajoute le jugement par-dessus | `log.js`, `tests/parcours/runner.js`, `sw.js` | ft-v1022 (réservée) |
| 🟢 | 26/08 14:25 → 14:50 | session-B (claude-md-docs) | **STRUCTURE : le tableau des TÂCHES monte EN TÊTE** (ligne 128 → 11) — c'est le correctif de la CAUSE, le contrôle 6 n'était qu'un détecteur. Il devient le **premier** tableau du fichier, donc l'ancre naïve `| 🟢` tombe désormais au bon endroit (mesuré) — la famille « premier match gagnant » de `BUGS.md` retournée à notre avantage. ⭐ Et c'était aussi un défaut d'ergonomie : il était à **73 %** du fichier, et le mode d'emploi disait « le tableau ci-dessous » **111 lignes trop tôt**. | `docs/JOURNAL-DE-PARTAGE.md`, `tools/check_regles.py` | — (outillage) |
| 🟢 | 26/08 14:10 → 14:30 | session-A (project-status) | L'APP APPREND l'alimentation — observateur 100 % LOCAL (aliments par repas, horaires médians, moyennes, états nommés) + carte visible + contexte de Milo. **0 appel sortant ajouté, mesuré** | `app.js`, `screens.js`, `coach.js`, `tests/parcours/runner.js` | ft-v1021 |
| 🟢 | 26/08 13:50 → 14:05 | session-A (project-status) | « ce qu'il te reste » SIMPLIFIÉ : on classe par ce qu'il MANGE (favori + fréquence), un seul aliment par défaut, et la PERTINENCE passe avant (un shake ne sort pas sur les glucides) | `app.js`, `tests/parcours/runner.js` | ft-v1020 |
| 🟢 | 26/08 13:10 → 13:35 | session-A (project-status) | NUTRITION : « ce qu'il te reste, en vrai » — le reste traduit en SES aliments (favoris + journal), combinaisons bornées, 3 garde-fous anti-TCA. Trou 3.3 bouché, trou 3.2 contourné | `app.js`, `screens.js`, `tests/parcours/runner.js` | ft-v1019 |
| 🟢 | 26/08 13:05 → 14:20 | session-B (claude-md-docs) | **LE BUG DU FICHIER LUI-MÊME, corrigé au bon niveau** — une ligne de tâche pouvait atterrir dans le tableau des ÉTATS (2ᵉ fois en 2 jours) : les deux tableaux commencent par le même jeton `| 🟢` et **le leurre vient EN PREMIER**, et le dégât est **silencieux** (markdown jette les colonnes en trop → la ligne existe mais devient invisible). 👉 **contrôle 6 de `check_regles.py`** (refuse toute ligne datée dans la légende, sortie 1, éprouvé dans les deux sens) + avertissement dans le fichier + famille dans `BUGS.md`. | `tools/check_regles.py`, `BUGS.md`, `docs/JOURNAL-DE-PARTAGE.md` | — (outillage) |
| ✅ | 26/08 12:40 → 15:00 | session-B (claude-md-docs) | **SIGNALEMENT RÉGLÉ — session-A a fermé sa ligne elle-même.** J'avais signalé (sans la fermer) que leur 🟡 du 26/08 10:05 sur EV-052 portait sur un sujet **déjà livré en ft-v1016** : ⛔ je ne pouvais pas savoir s'il leur restait une suite, et clore la ligne de quelqu'un d'autre écrirait un fait que je ne connais pas (**R29**) ; ⚠️ et je n'ai pas pu les prévenir — **conteneurs séparés, aucune session joignable**, ce qui est exactement la faille que ce fichier nomme lui-même. ⭐ **La péremption à 3 h n'a même pas eu à servir** : ils l'ont close de leur côté. *Le protocole a tenu sans que personne n'ait à trancher à la place de l'autre.* | `docs/JOURNAL-DE-PARTAGE.md` | — (signalement clos) |
| 🟢 | 26/08 11:40 → 12:10 | session-B (claude-md-docs) | ② l'EMAIL dans la ligne du classeur Google Sheets (onglet `Sessions`) — colonne ajoutée À LA FIN, les anciennes lignes ne bougent pas ⚠️ **`Code.js` touché → déploiement Apps Script auto** | `Code.js`, `tracking.js`, `tests/parcours/runner.js` | ft-v1018 |
| 🟢 | 26/08 10:55 → 12:10 | session-B (claude-md-docs) | ③ HISTORIQUE DU SCORE DE RÉCUP — il n'avait jamais été écrit ; on ne le STOCKE pas, on le REJOUE (`calcRecoveryDetail(refTs)`), tous les points à la MÊME HEURE (mesuré 44 → 56 dans la journée). ⛔ L'historique du SOMMEIL reste caché : décision de ft-v547, pas un bug (R30) | `tracking.js`, `state.js`, `screens.js`, `tests/parcours/runner.js` | ft-v1017 |
| 🟡 | 26/08 10:05 | session-A (project-status) | EV-052 rougit encore À TORT : mon motif prend la PREMIÈRE occurrence (une phrase de prose) au lieu de la prescription — trouvé par le rejeu gratuit | `tests/milo/eval-scenarios.js` | ft-v1015 (réservée) |
| 🟢 | 26/08 10:05 → 11:05 | session-A (project-status) | le REJEU GRATUIT (0 €) prouve les 5 vérificateurs corrigés (9 rouges → 4) et démasque un 6ᵉ faux rouge de moi : EV-052 lisait la PREMIÈRE occurrence, une phrase de prose | `tests/milo/eval-scenarios.js` | ft-v1016 (session-B avait pris 1015) |
| 🟢 | 26/08 09:08 → 09:55 | session-B (claude-md-docs) | un ÉCHEC de sync Google Sheets était compté comme un SUCCÈS : `finishWorkout` fait `if(ok)` sur l'OBJET `{ok:false,…}` (toujours vrai) → toast menteur + `synced=true` posé, donc la file de rattrapage ne la reprend jamais | `log.js`, `tests/parcours/runner.js`, `sw.js` | ft-v1015 |
| 🟢 | 26/08 09:02 → 09:40 | session-A (project-status) | NUTRITION : le résumé du journal atteint Milo (il travaillait « à l'aveugle ») — cache identique octet pour octet — **+ une FUITE trouvée au passage** : `foodLog` n'était pas remis à zéro dans `_vcApplyPersona` | `coach.js`, `tests/milo/eval-scenarios.js`, `tests/donnees/*`, `tests/parcours/runner.js` | ft-v1014 |
| 🟢 | 26/08 08:32 → 08:45 | session-A (project-status) | ① l'export « avec mes discussions » PERDAIT le fil en cours et emportait les consignes internes `_silent` · ② le fichier lisible sort de l'Admin (les deux exports NE font PAS doublon — mesuré) | `coach.js`, `index.html`, `tests/parcours/runner.js` | ft-v1013 |
| 🟢 | 26/08 05:55 → 06:10 | session-A (project-status) | l'export des conversations n'affichait AUCUNE date par message (les `ts` étaient stockés depuis ft-v1010, personne ne les lisait) + le titre affichait la date de CRÉATION au lieu de la plage réelle | `coach.js`, `tests/parcours/runner.js` | ft-v1011 |
| 🟢 | 25/08 21:35 → 22:30 | session-B (claude-md-docs) | écran Séance ②/5 : porte « Créer un programme » + « + Ajouter » → « Créer ma séance » + le sélecteur reste ouvert DANS L'ÉDITEUR aussi | `index.html`, `log.js` | ft-v1012 |
| 🟢 | 25/08 20:50 → 21:30 | session-A (project-status) | historique de l'OBJECTIF (`goalLog`, propriétaire unique `_goalSet`) — Milo ne voyait que la valeur du jour (R8) — + horodatage des messages, qui mouraient dans `_convLightMsgs` | `state.js`, `setup.js`, `tracking.js`, `app.js`, `coach.js`, `Code.js` | ft-v1010 (développée en 1008, renumérotée : session-B a livré 1009 la première — on ne fait jamais reculer le n° de cache) |
| 🟢 | 25/08 19:25 → 19:45 | session-A (project-status) | dépouillement du benchmark : **6 vérificateurs sur 9 rougissaient à tort** (négation · synonyme · abréviation devenue valide · question légitime · accessoire de santé · **mauvaise étape du pipeline**) + 1 fixture muette (EV-009) | `tests/milo/eval-scenarios.js`, `tests/parcours/runner.js` | ft-v1007 |
| 🟢 | 25/08 18:50 → 19:10 | session-A (project-status) | le bouton rouge de `showConfirm` disait « Supprimer » pour LANCER le benchmark — 10 appels non destructeurs récupèrent leur libellé + la jumelle « Fusionner » de `setup.js` | `app.js`, `coach.js`, `log.js`, `setup.js`, `tracking.js`, `tests/parcours/runner.js` | ft-v1006 |
| 🟢 | 25/08 18:20 → 18:40 | session-A (project-status) | les libellés du benchmark annonçaient « 16 scénarios » alors qu'il en porte 53 — nombre RETIRÉ (il grandit, R35), + témoin qui l'interdit | `index.html`, `tests/parcours/runner.js`, `sw.js` | ft-v1005 |
| 🟢 | 25/08 17:05 → 17:35 | session-B (claude-md-docs) | écran Séance ①/5 : le sélecteur d'exercices reste OUVERT après un ajout (6 allers-retours → 1) ⚠️ renuméroté ft-v1006 → **ft-v1009** : session-A avait pris 1006/1007 pendant ce temps, et réservé 1008 | `log.js` | ft-v1009 |
| 🟢 | 25/08 16:22 → 16:40 | session-B (claude-md-docs) | plafond IA à 150 pour les comptes de développement (le banc d'essai fait 53 appels, il se faisait couper à 50) + l'email posé dans `eval.js`, sinon le relèvement ne l'atteignait pas | `Code.js`, `tests/milo/eval.js` | — (backend) |
| 🟢 | 25/08 15:55 → 17:40 | session-A (project-status) | Journal nutrition : bande des 7 jours glissants, cliquable, un anneau par jour | `app.js`, `screens.js`, `tests/parcours/runner.js` | ft-v1004 |
| 🟢 | 25/08 15:50 → 16:10 | session-B (claude-md-docs) | DOC de cadrage : la séance d'essai (parcours découverte → Milo premium). **Aucun code**, aucun fichier de la nutrition — rien à construire encore, le doc fixe les décisions avant de coder | `docs/SEANCE-DESSAI.md`, `CLAUDE.md` | — (doc) |
| 🟢 | 25/08 14:31 → 15:20 | session-A (project-status) | la quantité sur un aliment repris SANS pour-100 g (fiche OFF incomplète) → portions | `app.js`, `tests/parcours/runner.js` | ft-v1003 |
| 🟢 | 25/08 11:51 → 12:35 | session-A (project-status) | dossier UX Nutrition pour Claude Design (écran mesuré : Macros 2 800 px = 3,3 écrans, 5 constats) | `docs/UX-NUTRITION-A-COLLER.md` | — (doc) |
| 🟢 | 25/08 10:20 → 10:50 | session-B (claude-md-docs) | « Squat Sumo » retiré du CHOIX (retrait ≠ fusion) + son image orpheline sortie du cache SW | `constants.js`, `log.js`, `sw.js`, `A-FAIRE-SUR-PC.md` | ft-v1002 |
| 🟢 | 25/08 09:20 → 09:55 | session-B (claude-md-docs) | « Pull-over » générique retiré du CHOIX (retrait ≠ fusion : l'historique n'est PAS renommé) + 4 équivalences d'import qui le visaient encore | `constants.js`, `log.js`, `tests/croises/runner.js` | ft-v1001 |
| 🟢 | 25/08 08:45 → 09:05 | session-B (claude-md-docs) | le « Pull-over » générique : RANGEMENT seul (le partage d'animation a été refusé par le contrôle croisé ②) — la fusion du doublon attend l'arbitrage de Michel | `log.js` | ft-v1000 |
| 🟢 | 25/08 08:00 → 08:35 | session-B (claude-md-docs) | 2 animations manquantes ajoutées (écarté haltères · tirage poulie basse prise serrée) — le pull-over est un doublon de catalogue, laissé à l'arbitrage de Michel | `exercises/*`, `log.js`, `sw.js` | ft-v999 |
| 🟢 | 25/08 07:05 → 07:45 | session-A (project-status) | banc d'essai : doctrine R35 (il grandit à chaque bug, sans cible) + 3 scénarios promus (EV-051/052/053) | `tests/milo/eval-scenarios.js`, `docs/REGLES-ARCHITECTURE.md`, `docs/JOURNAL-DE-TEST.md`, `tests/parcours/runner.js` | ft-v998 |
| 🟢 | 24/08 20:05 → 20:35 | session-A (project-status) | protocole de partage : créer ce fichier + le déclarer dans CLAUDE.md | `docs/JOURNAL-DE-PARTAGE.md`, `CLAUDE.md` | — |
| 🟢 | 24/08 ~20:30 → 21:25 | session-B (claude-md-docs) | un nom ABRÉGÉ lit la fiche écrite (muscles) + sa jumelle unilatéral | `log.js`, `constants.js`, `state.js` | ft-v997 |
| 🟢 | 24/08 ~19:30 → 20:30 | session-B (claude-md-docs) | un nom d'exercice abrégé retrouve sa fiche du catalogue (animation, tutoriel) | `constants.js`, `log.js` | ft-v996 |
| 🟢 | 24/08 ~17:00 → 19:50 | session-A (project-status) | le cardio de Milo va dans son bloc, pas dans les exercices | `log.js`, `coach.js`, `tests/parcours/runner.js` | ft-v995 |
| 🟢 | 24/08 ~16:00 → 17:00 | session-A (project-status) | banc d'essai 21 → 50 scénarios | `tests/milo/eval-scenarios.js` | ft-v994 |
| 🟢 | 24/08 ~14:00 → 15:00 | session-A (project-status) | course `_saveCoachMemory` + caches par lieu (mesurés, non construits) | `coach.js` | ft-v993 |
| 🟠 | 24/08 matin | **DEUX sessions en parallèle** | ⚠️ **LA COLLISION QUI A MOTIVÉ CE FICHIER** — ft-v991 et ft-v992 écrits **deux fois**, contenus équivalents, textes différents. Fusionnés à la main : la branche de l'autre a servi de base, seul ft-v993 y a été greffé. | `state.js`, `coach.js`, `tracking.js` | ft-v991 · ft-v992 |

---

---

## ⚡ EN 20 SECONDES — ce que tu fais avant de commencer

```bash
git fetch origin --all -q          # ⚠️ SANS ÇA, TU NE VOIS RIEN (voir §« La faille »)
```

1. **Tu LIS** le tableau **en haut de ce fichier**. Une tâche marquée 🟡 **en cours** ? → tu ne prends pas ce sujet.
2. **Tu ÉCRIS** ta ligne (une seule), **tu pousses tout de suite** — avant d'écrire une ligne de code.
3. **Tu travailles.**
4. **Tu CLÔTURES** ta ligne avec la version livrée (`ft-vNNN`) et tu pousses.

**Format d'une ligne — rien de plus :**

```
| 🟡 | JJ/MM HH:MM       | session-X | <sujet en quelques mots> | <fichiers> | — |
| 🟢 | JJ/MM HH:MM → HH:MM | session-X | <sujet en quelques mots> | <fichiers> | ft-vNNN |
```

⚠️ **L'exemple ci-dessus est volontairement en `JJ/MM`, pas avec de vraies dates** — trouvé en me
servant du fichier pour la première fois : un exemple qui *ressemble* à une vraie ligne 🟡 se lit
comme une **tâche en cours**, et bloque un sujet que personne ne traite. *Un exemple ne doit jamais
pouvoir passer pour une donnée.*

⚠️ **Une ligne suffit.** C'est la leçon de `docs/JOURNAL-DE-TEST.md` : *un fichier qu'on ne remplit
pas cesse d'être rempli* — les quatre fichiers vivants du projet tiennent parce qu'ils sont **bon
marché**. Pas de gabarit, pas de section, pas de compte rendu : la date, l'heure, le sujet, les
fichiers, la version.

---

## 🚦 Les états

> ⛔⛔ **CE TABLEAU EST UNE LÉGENDE — ce n'est PAS celui des tâches.** Le tableau des tâches
> est **PLUS HAUT**, tout en tête du fichier, sous « 📋 Les tâches ». ⚠️ **Deux lignes de tâche y sont déjà tombées**
> (25/08 et 26/08) : les deux tableaux commencent par le même jeton `| 🟢`. ⭐ **Le vrai tableau
> est désormais le PREMIER du fichier** (26/08), donc une insertion qui vise « la première ligne
> `| 🟢` » tombe maintenant au bon endroit — mais la légende reste une cible possible.
> **Et ça ne se voit pas** : markdown jette les colonnes en trop, la ligne existe dans le
> fichier et devient invisible à l'écran — *personne ne peut voir manquer une ligne dont on
> ignore l'existence.*
> 👉 **Pour insérer une tâche, s'ancrer sur l'EN-TÊTE du tableau des tâches**, jamais sur un
> jeton d'état. Le contrôle 6 de `tools/check_regles.py` refuse désormais toute ligne datée ici.

| État | Ce que ça veut dire |
|---|---|
| 🟡 **en cours** | quelqu'un travaille dessus **maintenant** — ne pas prendre ce sujet |
| 🟢 **livré** | terminé, la version est indiquée |
| 🔴 **abandonné** | arrêté en route, avec la raison (une session qui meurt, un changement de cap) |
| ⏰ **périmé** | 🟡 depuis **plus de 3 h** sans clôture → considéré abandonné (voir ci-dessous) |

---

## ⚠️ CE QUE CE PROTOCOLE PROTÈGE — ET CE QU'IL NE PROTÈGE PAS

**À lire une fois. C'est ce qui évite de lui faire confiance pour la mauvaise chose.**

| | Qui s'en charge |
|---|---|
| Éviter que deux sessions fassent **le même travail** | **ce fichier** ✅ |
| Éviter qu'une session **écrase le code** de l'autre | **git**, pas ce fichier |

⭐⭐ **LE VRAI VERROU EST GIT, ET IL EST AUTOMATIQUE.** Un `git push` qui n'est pas en avance rapide
**échoue** — c'est exactement ce qui a sauvé le travail de l'autre session ce matin : mon push a été
refusé, j'ai regardé, et j'ai fusionné au lieu d'écraser. *Ce fichier est un panneau d'affichage, pas
une serrure.* Ne jamais forcer un push (`-f`) sur une branche partagée pour « passer outre ».

### ⛔ LA FAILLE, ET ELLE EST RÉELLE

**Un fichier ne prévient pas — il faut aller le lire.** Les deux sessions travaillent sur des
**clones séparés** : ce que l'autre écrit n'existe chez toi qu'après un `git fetch`. Ce matin,
j'avais le dépôt sous la main et je n'ai **pas vu** le travail de l'autre avant de pousser.

👉 **D'où la règle n°1, non négociable : `git fetch` AVANT de lire ce fichier, et RE-fetch avant de
pousser.** Sans ça le protocole ne vaut rien — il donne même une fausse sécurité, ce qui est pire que
pas de protocole du tout.

### ⚠️ Les trois autres limites, écrites plutôt que découvertes

1. **La fenêtre de course.** Entre le moment où tu lis (« rien en cours ») et celui où tu pousses ta
   ligne, l'autre peut avoir commencé. La fenêtre est courte mais elle existe — *c'est exactement la
   course `_saveCoachMemory` corrigée en ft-v993 : lire, puis écrire, sans rien entre les deux.*
   👉 **Ce qui la referme** : pousser sa ligne **immédiatement**, avant de coder. Si le push est
   refusé, c'est que l'autre a écrit entre-temps → on relit.
2. **Une session peut mourir sans clore sa ligne.** Le conteneur redémarre, la session est fermée,
   et la ligne reste 🟡 pour toujours — bloquant l'autre sur un sujet que plus personne ne traite.
   👉 **Ce qui la referme** : la règle des **3 heures**. Une ligne 🟡 plus vieille que ça est
   considérée périmée ; on la passe en ⏰ **avec la raison**, et le sujet se reprend.
3. **Ça repose sur la discipline.** Si une session oublie d'écrire sa ligne, rien ne le signale.
   Le protocole réduit le risque, il ne l'annule pas.

### ⚠️ APRÈS UN CONTENEUR RECRÉÉ : `git fetch --all` PEUT MENTIR (constaté le 26/08/2026)

Le conteneur de session est **éphémère**. Quand il est recréé, le dépôt est recloné — et le clone
peut être **périmé de plusieurs jours**. Vécu ce jour-là : `origin/master` affichait **ft-v939 du
21/08**, cinq jours en arrière, et un commit poussé une heure plus tôt n'existait **même pas** dans
le clone (`fatal: Not a valid object name`).

⛔⛔ **Et `git fetch --all` n'avait rien corrigé.** Seul un fetch **explicite** a ramené la réalité :

```bash
git fetch origin master     # ← celui-ci atteint vraiment GitHub
```
```
+ 84cdf26...91c5d92 master -> origin/master  (forced update)
```

👉 **Le danger n'est pas la perte — rien n'était perdu.** C'est la CONCLUSION qu'on en tire : croire
son travail disparu, ou pire, *« réparer »* master en poussant par-dessus. **Devant un master qui a
reculé, on ne pousse rien : on refait un fetch explicite et on regarde les dates.**

### 🕐 Les heures

Écrire l'heure **UTC** ou préciser le fuseau. Deux sessions peuvent tourner dans des conteneurs
réglés différemment — et *« 21:15 » chez l'une n'est pas « 21:15 » chez l'autre*. C'est la famille de
bugs « fuseaux horaires » de `BUGS.md`, appliquée à nous-mêmes.

## 🧭 Comment se nommer

Pas de nom imposé — **la branche suffit** et elle est déjà unique :
`session-A (project-status)`, `session-B (claude-md-docs)`… L'important est qu'on puisse dire *qui*
sans se tromper, pas d'avoir un joli nom.

---

*Ce fichier est un outil de coordination, pas un compte rendu. Le « pourquoi » d'une version va dans
`CLAUDE.md` (règle d'or #12), le détail dans les docs spécialisés. Ici, une ligne.*
