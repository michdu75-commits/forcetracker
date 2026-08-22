# 📒 Inventaire — ce qui existe dans Force Tracker

> ⚙️ **FICHIER GÉNÉRÉ — ne pas éditer à la main.** Régénérer avec `python3 tools/inventaire.py`.
> Généré depuis **le code** (version `ft-v962`, dernier commit 2026-08-22).
>
> **À quoi il sert** : répondre à *« est-ce que c'est déjà construit ? »*. Le journal des versions
> (`CLAUDE.md`, `docs/JOURNAL-ARCHIVE.md`) répond à *« que s'est-il passé, quand, pourquoi ? »* —
> ce n'est pas la même question, et il y répond mal (600 entrées chronologiques à lire).
>
> ⚠️ **Colonne « doc »** : ✅ = le nom apparaît quelque part dans la documentation · 
> ❓ = **absent de toute la doc**. Un ❓ n'est pas un bug : c'est une chose qui existe dans le code
> mais dont personne (ni humain ni IA) ne sait qu'elle existe en lisant la doc. C'est précisément
> ce qui a fait conclure à tort, le 27/07, qu'une fonctionnalité manquait.

## 📊 Vue d'ensemble

| Élément | Nombre | Absents de la doc |
|---|---|---|
| Écrans | 7 | 0 |
| Lignes de menu | 6 | 1 |
| Fenêtres (modales) | 61 | 13 |
| Actions du serveur | 41 | 0 |
| Fonctions JS | 560 | — |
| Nouveautés annoncées | 56 | — |

## 🖥️ Écrans

| Écran | doc |
|---|---|
| `s-home` | ✅ |
| `s-log` | ✅ |
| `s-progress` | ✅ |
| `s-nutrition` | ✅ |
| `s-setup` | ✅ |
| `s-coach` | ✅ |
| `s-cycle` | ✅ |

## ☰ Menu

| Libellé | id | ouvre | doc |
|---|---|---|---|
| **Anatomie du corps humain** | `menu-row-profil` | `closeMenuDrawer` | ✅ |
| **Anatomie du corps humain** | `menu-row-premium` | `closeMenuDrawer` | ❓ |
| **Guide de l'application** | `menu-row-appguide` | `openAppGuide` | ✅ |
| **Ce que Milo sait de toi** | `menu-row-miloknows` | `closeMenuDrawer` | ✅ |
| **Nouveautés** | `menu-row-whatsnew` | `closeMenuDrawer` | ✅ |
| **Guide de la muscu** | `menu-row-bilanmois` | `closeMenuDrawer` | ✅ |

## 🔌 Actions du serveur (backend)

Chaque action = une capacité côté serveur (IA, sauvegarde, import, premium…).

| Action | doc |
|---|---|
| `adminRestore` | ✅ |
| `adminUnlockAuth` | ✅ |
| `aiCount` | ✅ |
| `aiUsage` | ✅ |
| `authStatus` | ✅ |
| `bodyStudy` | ✅ |
| `checkBackup` | ✅ |
| `coach` | ✅ |
| `compressStore` | ✅ |
| `estimateFood` | ✅ |
| `foodLabel` | ✅ |
| `gardienStats` | ✅ |
| `generateMealPlan` | ✅ |
| `getCustomEx` | ✅ |
| `getIdees` | ✅ |
| `importBloodTest` | ✅ |
| `importBodyScan` | ✅ |
| `importHistory` | ✅ |
| `importMealPlan` | ✅ |
| `importProgram` | ✅ |
| `installDailyBackup` | ✅ |
| `listUsers` | ✅ |
| `loadProfile` | ✅ |
| `logCustomExercise` | ✅ |
| `logSession` | ✅ |
| `mailFails` | ✅ |
| `migrateBackups` | ✅ |
| `morphoAnalysis` | ✅ |
| `pushHealth` | ✅ |
| `readBarcode` | ✅ |
| `saveProfile` | ✅ |
| `seanceJson` | ✅ |
| `sendConfirmCode` | ✅ |
| `setAccessCode` | ✅ |
| `storeHealth` | ✅ |
| `summarizeCoach` | ✅ |
| `test` | ✅ |
| `testGardeFou` | ✅ |
| `testerIdea` | ✅ |
| `validateCode` | ✅ |
| `verifyConfirmCode` | ✅ |

## 🪟 Fenêtres (modales)

| Overlay | doc |
|---|---|
| `ov-drawer-cnt` | ✅ |
| `ov-milo-knows` | ✅ |
| `ov-rest-edit` | ✅ |
| `ov-coach-convs` | ✅ |
| `ov-appguide` | ✅ |
| `ov-super-welcome` | ✅ |
| `ov-billoute` | ✅ |
| `ov-christophe-photos` | ✅ |
| `ov-memoire-c` | ❓ |
| `ov-pesee-nav-c` | ❓ |
| `ov-pesee-nav-e` | ❓ |
| `ov-emma-welcome` | ✅ |
| `ov-kcal-edit` | ✅ |
| `ov-tester-guide` | ✅ |
| `ov-whatsnew` | ✅ |
| `ov-tester-eq` | ✅ |
| `ov-tester-3b` | ✅ |
| `ov-tester-space` | ✅ |
| `ov-help` | ❓ |
| `ov-session-end` | ✅ |
| `mod-checkin` | ✅ |
| `mod-share` | ✅ |
| `mod-plate` | ❓ |
| `mod-ex` | ✅ |
| `ov-mm` | ✅ |
| `ov-confirm` | ✅ |
| `ov-reco-why` | ✅ |
| `ov-type-help` | ✅ |
| `ov-bmr-help` | ❓ |
| `ov-uni-help` | ❓ |
| `ov-sess-detail` | ✅ |
| `ov-import-prog` | ✅ |
| `ov-import-meal` | ✅ |
| `ov-add-food` | ✅ |
| `ov-food-wall` | ✅ |
| `ov-import-hist` | ✅ |
| `ov-hist-wall` | ✅ |
| `ov-day-sel` | ✅ |
| `ov-export-choix` | ❓ |
| `ov-ex-swap` | ❓ |
| `ov-milo-seance` | ❓ |
| `ov-morpho-analysis` | ✅ |
| `ov-premium-info` | ❓ |
| `ov-weigh-edit` | ✅ |
| `ov-bs-scan` | ✅ |
| `ov-health-lock` | ❓ |
| `ov-bodyscan-form` | ✅ |
| `ov-blood-redact` | ✅ |
| `ov-blood-test` | ✅ |
| `ov-body-study` | ✅ |
| `ov-photo-menu` | ✅ |
| `ov-coach-quiz` | ✅ |
| `ov-body-series` | ✅ |
| `ov-morpho-loading` | ✅ |
| `mod-prog` | ✅ |
| `ov-beginner-setup` | ✅ |
| `ov-pr-congrats` | ✅ |
| `ov-week-summary` | ✅ |
| `ov-month-summary` | ❓ |
| `ov-prog-edit` | ✅ |
| `ov-prog-analysis` | ✅ |

## ✨ Nouveautés annoncées aux utilisateurs

Ce qui a été **annoncé dans la pop-up « Quoi de neuf »** — donc censé exister et être visible.

| # | | Nouveauté |
|---|---|---|
| 59 | 🎽 | Ta discipline change enfin quelque chose |
| 58 | ⏱️ | Tes calories comptent enfin le TEMPS de ta séance |
| 57 | 🔥 | Tes calories tiennent compte de ton muscle |
| 56 | 🔀 | Les exercices « un côté à la fois » |
| 55 | 🔒 | Protège ton compte — 2 minutes |
| 54 | 🏷️ | Des exercices ont changé de nom |
| 53 | 🧍 | Ta figurine passe à 41 muscles |
| 52 | 💚 | Deux styles pour ta récup |
| 51 | 📅 | Ton calendrier se lit d'un coup d'œil |
| 50 | 🎯 | Ta récup passe en anneau |
| 49 | ✨ | Les nouveautés restent consultables |
| 48 | 🎯 | Nouvel objectif : « Perte de gras + muscle » |
| 47 | ✏️ | Règle tes calories et macros à la main |
| 46 | 💯 | « maxi » dans tes répétitions |
| 45 | 🏋️ | Milo repère ton style d'entraînement |
| 44 | 🧠 | Ta page « Ce que Milo sait de toi » devient vivante |
| 43 | 🌿 | Milo garde ton profil à jour |
| 42 | 🚴 | Milo tient compte de tes autres sports |
| 41 | 🔎 | Milo s'adapte à ce que tu fais vraiment |
| 40 | 🌱 | Milo complète ton profil tout seul |
| 39 | 💬 | Milo va droit au but |
| 38 | 🧠 | Milo retient ce que tu lui confies |
| 37 | ⚡ | Milo démarre ta séance |
| 36 | 💪 | Dis à Milo tes muscles prioritaires |
| 35 | 🎯 | Choisis DEUX objectifs |
| 34 | 🩹 | Tes douleurs, en tapant sur le corps |
| 33 | 💡 | « Pourquoi ce score ? » — ta récup expliquée |
| 32 | 🔎 | Ton historique plus pratique |
| 31 | 🎯 | Fixe-toi un objectif de force |
| 30 | 📅 | Ton calendrier se souvient de tes journées |
| 29 | 📈 | Ton graphe de progression, interactif |
| 28 | 🌡️ | Ton « check-in du jour » regroupé |
| 27 | 🤝 | Milo t'accompagne dans les moments difficiles |
| 26 | 🏁 | Ton écran de fin de séance |
| 25 | 🎯 | Tes douleurs, en plus précis |
| 24 | 💬 | Tes discussions avec Milo sont gardées |
| 20 | 🌡️ | Dis à Milo comment tu te sens aujourd'hui |
| 19 | 🛡️ | Milo veille sur ta sécurité |
| 18 | 🧠 | Milo apprend à te connaître |
| 17 | 🧬 | Ton ADN sportif |
| 16 | 😴 | Ton sommeil sur l'Accueil + son historique |
| 15 | 🙏 | Petit souci réglé — merci de votre patience |
| 14 | 🧠 | Milo coache comme un vrai coach |
| 13 | ✋ | Superset par glisser-déposer |
| 12 | 📷 | Photographie le code-barres |
| 11 | 🥗 | Score santé des produits |
| 10 | 📅 | Calendrier sur ton Accueil |
| 9 | 🔒 | Mise à jour de sécurité en approche |
| 8 | 🎨 | Ton app à ta couleur |
| 7 | 🏋️ | Séances : cardio & corrections |
| 6 | 🏃 | Niveau de travail « Actif » |
| 5 | 💬 | Milo (Coach IA) plus naturel |
| 4 | 📓 | Journal alimentaire |
| 3 | 📷 | Scan de code-barres |
| 2 | 🤖 | Estimation par l'IA |
| 1 | 📥 | Importer un plan diététicien |

---

*Régénéré par `tools/inventaire.py`. Si une ligne ❓ correspond à une vraie fonctionnalité,
lui écrire une entrée de journal — c'est le geste qui manquait (règle R23).*
