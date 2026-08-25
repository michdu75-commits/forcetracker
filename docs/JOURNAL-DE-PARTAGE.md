# 🤝 Journal de partage — qui travaille sur quoi, en ce moment

> **Créé le 24/08/2026, protocole établi par Michel** après une collision réelle le matin même :
> **deux sessions Claude ont écrit ft-v991 et ft-v992 chacune de son côté**, sans le savoir. Même
> travail, deux fois, découvert seulement au moment de pousser — il a fallu fusionner à la main.
>
> *« Il faut que vous puissiez travailler en symbiose et pas en conflit ou adverse. »* (Michel)

---

## ⚡ EN 20 SECONDES — ce que tu fais avant de commencer

```bash
git fetch origin --all -q          # ⚠️ SANS ÇA, TU NE VOIS RIEN (voir §« La faille »)
```

1. **Tu LIS** le tableau ci-dessous. Une tâche marquée 🟡 **en cours** ? → tu ne prends pas ce sujet.
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

### 🕐 Les heures

Écrire l'heure **UTC** ou préciser le fuseau. Deux sessions peuvent tourner dans des conteneurs
réglés différemment — et *« 21:15 » chez l'une n'est pas « 21:15 » chez l'autre*. C'est la famille de
bugs « fuseaux horaires » de `BUGS.md`, appliquée à nous-mêmes.

---

## 📋 Les tâches

| État | Quand (UTC) | Qui | Sujet | Fichiers | Version |
|---|---|---|---|---|---|
| 🟢 | 25/08 08:45 → 09:05 | session-B (claude-md-docs) | le « Pull-over » générique : RANGEMENT seul (le partage d'animation a été refusé par le contrôle croisé ②) — la fusion du doublon attend l'arbitrage de Michel | `log.js` | ft-v1000 |
| 🟢 | 25/08 08:00 → 08:35 | session-B (claude-md-docs) | 2 animations manquantes ajoutées (écarté haltères · tirage poulie basse prise serrée) — le pull-over est un doublon de catalogue, laissé à l'arbitrage de Michel | `exercises/*`, `log.js`, `sw.js` | ft-v999 |
| 🟢 | 25/08 07:05 → 07:45 | session-A (project-status) | banc d'essai : doctrine R35 (il grandit à chaque bug, sans cible) + 3 scénarios promus (EV-051/052/053) | `tests/milo/eval-scenarios.js`, `docs/REGLES-ARCHITECTURE.md`, `docs/JOURNAL-DE-TEST.md`, `tests/parcours/runner.js` | ft-v998 |
| 🟢 | 24/08 ~20:30 → 21:25 | session-B (claude-md-docs) | un nom ABRÉGÉ lit la fiche écrite (muscles) + sa jumelle unilatéral | `log.js`, `constants.js`, `state.js` | ft-v997 |
| 🟢 | 24/08 ~19:30 → 20:30 | session-B (claude-md-docs) | un nom d'exercice abrégé retrouve sa fiche du catalogue (animation, tutoriel) | `constants.js`, `log.js` | ft-v996 |
| 🟢 | 24/08 20:05 → 20:35 | session-A (project-status) | protocole de partage : créer ce fichier + le déclarer dans CLAUDE.md | `docs/JOURNAL-DE-PARTAGE.md`, `CLAUDE.md` | — |
| 🟢 | 24/08 ~17:00 → 19:50 | session-A (project-status) | le cardio de Milo va dans son bloc, pas dans les exercices | `log.js`, `coach.js`, `tests/parcours/runner.js` | ft-v995 |
| 🟢 | 24/08 ~16:00 → 17:00 | session-A (project-status) | banc d'essai 21 → 50 scénarios | `tests/milo/eval-scenarios.js` | ft-v994 |
| 🟢 | 24/08 ~14:00 → 15:00 | session-A (project-status) | course `_saveCoachMemory` + caches par lieu (mesurés, non construits) | `coach.js` | ft-v993 |
| 🟠 | 24/08 matin | **DEUX sessions en parallèle** | ⚠️ **LA COLLISION QUI A MOTIVÉ CE FICHIER** — ft-v991 et ft-v992 écrits **deux fois**, contenus équivalents, textes différents. Fusionnés à la main : la branche de l'autre a servi de base, seul ft-v993 y a été greffé. | `state.js`, `coach.js`, `tracking.js` | ft-v991 · ft-v992 |

---

## 🧭 Comment se nommer

Pas de nom imposé — **la branche suffit** et elle est déjà unique :
`session-A (project-status)`, `session-B (claude-md-docs)`… L'important est qu'on puisse dire *qui*
sans se tromper, pas d'avoir un joli nom.

---

*Ce fichier est un outil de coordination, pas un compte rendu. Le « pourquoi » d'une version va dans
`CLAUDE.md` (règle d'or #12), le détail dans les docs spécialisés. Ici, une ligne.*
