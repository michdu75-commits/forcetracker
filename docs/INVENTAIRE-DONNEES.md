# 📊 Inventaire des DONNÉES — ce que l'app enregistre, et ce qu'elle en fait

> ⚙️ **GÉNÉRÉ depuis le code** par `python3 tools/donnees.py` — ne pas éditer à la main.
> Un inventaire écrit à la main redevient faux en trois semaines et personne ne le voit (**R27**).
> Demandé par Michel le 05/09/2026 : *« un check de tout ce que l'on marque dans l'application,
> et tout ce qui est suivi et enregistré »*.

## Comment lire ce tableau

Les trois colonnes répondent à **trois questions indépendantes**, et c'est leur croisement
qui est utile :

| Colonne | La question |
|---|---|
| **Forme** | est-ce un **historique daté** (on peut tracer une courbe) ou une **valeur écrasée** (seul le dernier état existe) ? |
| **Survit au changement de téléphone** | est-elle envoyée au cloud **ET** relue à la restauration ? |
| **Milo la reçoit** | atterrit-elle dans le contexte du coach ? (source : `tests/donnees/donnees-milo.json`, vérifié à chaque livraison) |

⛔ **Le croisement qui fait mal** : une donnée **datée** mais **non sauvegardée** est un
historique qui disparaîtra sans prévenir, le jour d'un changement de téléphone ou d'un
vidage de navigateur. C'est la règle d'or #3 appliquée ailleurs que sur une séance.

---

## ⚠️ CE QUI SE PERDRAIT AUJOURD'HUI (à lire en premier)

**29 données sur 107 ne quittent jamais le téléphone.** La plupart sont des réglages ou de
l'état passager, et c'est très bien. Celles qui posent problème sont les **historiques** :

| Donnée | Clé sur le téléphone | Milo la reçoit |
|---|---|---|
| **`mensLog`** | `ft4_mens` | ✅ oui |
| **`missedLog`** | `ft4_missed` | ✅ oui |

Les autres pertes possibles (séries non datées et valeurs) :
`beginnerJourney` · `bodySeries` · `coachConversations` · `coachFree` · `connected` · `creatDose` · `ecgStill` · `echelleReserve` · `expandAll` · `halo` · `haloColor` · `haloDir` · `hiddenFoods` · `histTronque` · `lastMonthSummary` · `lastWeekSummary` · `levelAuto` · `mealPlan` · `menuAck` · `miloRates` · `nextPlanned` · `progExos` · `reportedCustomEx` · `ringStyle` · `seenFeatures` · `testerIdeas` · `wkt`

---

## 📈 LES HISTORIQUES (15 séries)

Ce sont eux qui portent la mémoire du produit — *« tu ne repars jamais de zéro »*.

| Donnée | Forme | Clé locale | Survit | Milo |
|---|---|---|---|---|
| **`coachConversations`** | série | `—` | ⛔ NON — locale | — |
| **`customExercises`** | série | `ft4_cuex` | ✅ oui | ✅ oui |
| **`dayStateLog`** | série datée | `ft4_dayslog` | ✅ oui | ⚠️ trou connu |
| **`foodLog`** | série datée | `ft4_foodlog` | ✅ oui | ✅ oui |
| **`goalLog`** | série datée | `ft4_goallog` | ✅ oui | ✅ oui |
| **`healthDaily`** | série datée | `ft4_healthd` | ✅ oui (autre route) | ✅ oui |
| **`healthInbox`** | série | `ft4_healthbox` | ✅ oui (autre route) | — |
| **`mensLog`** | série datée | `ft4_mens` | ⛔ NON — locale | ✅ oui |
| **`miloRates`** | série | `ft4_milo_rates` | ⛔ NON — locale | — |
| **`missedLog`** | série datée | `ft4_missed` | ⛔ NON — locale | ✅ oui |
| **`priorities`** | série | `ft4_priorities` | ✅ oui | ✅ oui |
| **`programmes`** | série | `ft4_progs` | ✅ oui | ✅ oui |
| **`sessions`** | série datée | `ft4_sessions` | ✅ oui | ✅ oui |
| **`sleepLog`** | série datée | `ft4_sleep` | ✅ oui | ✅ oui |
| **`weightLog`** | série datée | `ft4_wlog` | ✅ oui | ✅ oui |

---

## 📋 TOUT (107 données)

| Donnée | Forme | Clé locale | Survit | Milo |
|---|---|---|---|---|
| `a11y` | valeur | `ft4_a11y` | ✅ oui | — |
| `activityLevel` | valeur | `ft4_act` | ✅ oui | ✅ oui |
| `adn` | valeur | `ft4_adn` | ✅ oui | ✅ oui |
| `age` | valeur | `ft4_age` | ✅ oui | ✅ oui |
| `anonId` | valeur | `—` | ⚠️ côté serveur seulement | — |
| `badges` | valeur | `ft4_badges` | ✅ oui | ⚠️ trou connu |
| `barW` | valeur | `ft4_bar` | ✅ oui | — |
| `bday` | valeur | `ft4_bday` | ✅ oui | — |
| `beginnerJourney` | valeur | `ft4_bjourney` | ⛔ NON — locale | ✅ oui |
| `bloodTests` | valeur | `ft4_bloodtests` | ✅ oui | ✅ oui |
| `bodyScanImports` | valeur | `ft4_bsimports` | ✅ oui | — |
| `bodyScans` | valeur | `ft4_bodyscans` | ✅ oui | ✅ oui |
| `bodySeries` | valeur | `ft4_body_series` | ⛔ NON — locale | — |
| `bodyStudies` | valeur | `ft4_bodystudies` | ✅ oui | — |
| `bodyStudy` | valeur | `ft4_bodystudy` | ✅ oui | ✅ oui |
| `bw` | valeur | `ft4_bw` | ✅ oui | ✅ oui |
| `coachConversations` | série | `—` | ⛔ NON — locale | — |
| `coachFree` | valeur | `ft4_coachFree` | ⛔ NON — locale | — |
| `coachMemory` | valeur | `ft4_coach_mem` | ✅ oui | ✅ oui |
| `coachQuiz` | valeur | `ft4_coachquiz` | ✅ oui | ✅ oui |
| `coachQuizPro` | valeur | `ft4_coachquizpro` | ✅ oui | ✅ oui |
| `coachTone` | valeur | `ft4_coachtone` | ✅ oui | ✅ oui |
| `colorblind` | valeur | `ft4_cb` | ✅ oui | — |
| `connected` | valeur | `ft4_ok` | ⛔ NON — locale | — |
| `contraception` | valeur | `ft4_contra` | ✅ oui | ✅ oui |
| `creatDose` | valeur | `—` | ⛔ NON — locale | — |
| `customExercises` | série | `ft4_cuex` | ✅ oui | ✅ oui |
| `cycle` | valeur | `ft4_cycle` | ✅ oui | ✅ oui |
| `dayState` | valeur | `ft4_daystate` | ✅ oui (autre route) | ✅ oui |
| `dayStateLog` | série datée | `ft4_dayslog` | ✅ oui | ⚠️ trou connu |
| `defRest` | valeur | `ft4_rest` | ✅ oui | — |
| `diet` | valeur | `ft4_diet_restr` | ✅ oui | ✅ oui |
| `dietNotes` | valeur | `ft4_diet_notes` | ✅ oui | ✅ oui |
| `dietRestrictions` | valeur | `ft4_diet_restr` | ✅ oui | ✅ oui |
| `discipline` | valeur | `ft4_discipline` | ✅ oui | ✅ oui |
| `ecgStill` | valeur | `—` | ⛔ NON — locale | — |
| `echelleReserve` | valeur | `ft4_echelle` | ⛔ NON — locale | ✅ oui |
| `email` | valeur | `ft4_email` | ⚠️ envoyée, jamais relue | — |
| `emailVerified` | valeur | `ft4_email_verified` | ⚠️ côté serveur seulement | — |
| `exPhotos` | valeur | `ft4_exphotos` | ⚠️ côté serveur seulement | — |
| `exRestPref` | valeur | `ft4_exRp` | ✅ oui | ✅ oui |
| `exSwaps` | valeur | `ft4_exswaps` | ✅ oui | ✅ oui |
| `expandAll` | valeur | `ft4_expandall` | ⛔ NON — locale | — |
| `fasting` | valeur | `ft4_fasting` | ✅ oui | ✅ oui |
| `foodAiUses` | valeur | `—` | ✅ oui | — |
| `foodLog` | série datée | `ft4_foodlog` | ✅ oui | ✅ oui |
| `foodMode` | valeur | `ft4_foodmode` | ✅ oui | ✅ oui |
| `gardienStats` | valeur | `—` | ⚠️ envoyée, jamais relue | — |
| `gender` | valeur | `ft4_gender` | ✅ oui | ✅ oui |
| `goal` | valeur | `ft4_goallog` | ✅ oui | ✅ oui |
| `goal2` | valeur | `ft4_goal2` | ✅ oui | ✅ oui |
| `goalLog` | série datée | `ft4_goallog` | ✅ oui | ✅ oui |
| `halo` | valeur | `ft4_halo` | ⛔ NON — locale | — |
| `haloColor` | valeur | `ft4_haloColor` | ⛔ NON — locale | — |
| `haloDir` | valeur | `ft4_haloDir` | ⛔ NON — locale | — |
| `healthDaily` | série datée | `ft4_healthd` | ✅ oui (autre route) | ✅ oui |
| `healthInbox` | série | `ft4_healthbox` | ✅ oui (autre route) | — |
| `healthProfile` | valeur | `ft4_health` | ✅ oui | ✅ oui |
| `height` | valeur | `ft4_ht` | ✅ oui | ✅ oui |
| `hiddenFoods` | valeur | `ft4_hiddenfoods` | ⛔ NON — locale | — |
| `hip` | valeur | `ft4_hip` | ✅ oui | ✅ oui |
| `histImports` | valeur | `ft4_histImp` | ✅ oui | — |
| `histTronque` | valeur | `—` | ⛔ NON — locale | — |
| `keto` | valeur | `ft4_keto` | ⚠️ côté serveur seulement | ✅ oui |
| `lastMonthSummary` | valeur | `ft4_lms` | ⛔ NON — locale | — |
| `lastWeekSummary` | valeur | `ft4_lws` | ⛔ NON — locale | — |
| `leftHand` | valeur | `ft4_lh` | ✅ oui | — |
| `level` | valeur | `ft4_level` | ✅ oui | ✅ oui |
| `levelAuto` | valeur | `ft4_levelAuto` | ⛔ NON — locale | — |
| `manualKcal` | valeur | `ft4_manualkcal` | ✅ oui | ✅ oui |
| `mealPlan` | valeur | `ft4_mealplan` | ⛔ NON — locale | — |
| `mensCycleDur` | valeur | `ft4_mcdur` | ✅ oui | ✅ oui |
| `mensCycleStart` | valeur | `ft4_mcstart` | ✅ oui | ✅ oui |
| `mensLog` | série datée | `ft4_mens` | ⛔ NON — locale | ✅ oui |
| `menuAck` | valeur | `—` | ⛔ NON — locale | — |
| `miloRates` | série | `ft4_milo_rates` | ⛔ NON — locale | — |
| `missedLog` | série datée | `ft4_missed` | ⛔ NON — locale | ✅ oui |
| `morpho` | valeur | `ft4_morpho` | ✅ oui | ✅ oui |
| `morphotype` | valeur | `ft4_morphot` | ✅ oui | ✅ oui |
| `name` | valeur | `ft4_name` | ✅ oui | ✅ oui |
| `neck` | valeur | `ft4_neck` | ✅ oui | ✅ oui |
| `nextPlanned` | valeur | `ft4_nextplanned` | ⛔ NON — locale | ✅ oui |
| `nutritionPhase` | valeur | `ft4_nphase` | ✅ oui | ✅ oui |
| `premium` | valeur | `ft4_premium` | ⚠️ côté serveur seulement | — |
| `premiumExpiry` | valeur | `ft4_premiumExp` | ✅ oui (autre route) | — |
| `priorities` | série | `ft4_priorities` | ✅ oui | ✅ oui |
| `progExos` | valeur | `ft4_progexos` | ⛔ NON — locale | — |
| `progImports` | valeur | `ft4_progimports` | ✅ oui | — |
| `programmes` | série | `ft4_progs` | ✅ oui | ✅ oui |
| `prs` | valeur | `ft4_prs` | ✅ oui | ✅ oui |
| `registre` | valeur | `ft4_registre` | ✅ oui | ✅ oui |
| `reportedCustomEx` | valeur | `—` | ⛔ NON — locale | — |
| `ringStyle` | valeur | `—` | ⛔ NON — locale | — |
| `savedFoods` | valeur | `ft4_savedfoods` | ✅ oui | — |
| `scaleType` | valeur | `ft4_scaletype` | ✅ oui | — |
| `seenFeatures` | valeur | `—` | ⛔ NON — locale | — |
| `sessions` | série datée | `ft4_sessions` | ✅ oui | ✅ oui |
| `sleepLog` | série datée | `ft4_sleep` | ✅ oui | ✅ oui |
| `smoker` | valeur | `ft4_smoker` | ✅ oui | ✅ oui |
| `strengthGoals` | valeur | `ft4_strgoals` | ✅ oui | ✅ oui |
| `targetWeight` | valeur | `ft4_target` | ✅ oui | ✅ oui |
| `testerIdeas` | valeur | `ft4_tester_ideas` | ⛔ NON — locale | — |
| `url` | valeur | `—` | ⚠️ côté serveur seulement | — |
| `waist` | valeur | `ft4_waist` | ✅ oui | ✅ oui |
| `weightLog` | série datée | `ft4_wlog` | ✅ oui | ✅ oui |
| `wkt` | valeur | `ft4_wkt` | ⛔ NON — locale | ✅ oui |
| `workType` | valeur | `ft4_work` | ✅ oui | ✅ oui |

---

## 🔢 Le compte

- **107 données** suivies au total
- **15 historiques** (dont **9 datés**)
- **70** survivent à un changement de téléphone · **29** ne le survivraient pas
- **60** atteignent Milo · **45** en sont exclues **avec leur raison écrite** · **2 trous connus**

⛔ **Aucune donnée n'est « non classée »** : `tests/donnees/runner.js` fait échouer la
livraison si une donnée nouvelle n'a pas été rangée. *On ne peut plus oublier — on peut
seulement décider* (**R4a**).
