<!-- ⛔⛔ FICHIER GÉNÉRÉ — NE PAS ÉDITER À LA MAIN.
     Source de vérité : `capacites-ia.js` (racine du dépôt).
     Régénérer : `node tools/gen_doc_ia.js`
     Un écart entre ce fichier et le registre fait ROUGIR le bloc B-CCCXXXII. -->

# 🗂️ Les capacités IA de Force Tracker — accès, quotas, politique

> **Ce document est une VUE, pas une décision.** Il est régénéré depuis
> `capacites-ia.js`, qui est la seule source de vérité de la politique d'accès.
> Toute correction se fait **dans le registre**, jamais ici.

> ⚠️ **Deux colonnes, et il ne faut jamais les confondre** : la **politique** est
> ce qui *doit être* (la décision de Michel) ; l'**état du code** est ce qui *est*
> aujourd'hui dans le navigateur. Tant qu'elles diffèrent, l'écart est écrit — et
> c'est volontaire : *un registre qui affiche la politique souhaitée à la place de
> la politique appliquée ment plus efficacement qu'une documentation périmée,
> parce qu'il a l'air d'être du code.*

## Les 21 capacités

| # | capacité | module | déclenchement | politique | état du code | quota | action serveur | 2ᵉ porte | serveur applique |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | `milo.chat` | Milo | manuel | **FREEMIUM** | FREEMIUM | 10 · usage_total | `coach` | `coach` | non |
| 2 | `milo.debrief` | Milo | **automatique** | **PREMIUM** | FREE | aucun (Premium) | `coach` | `coach` | non |
| 3 | `milo.memory` | Milo | **automatique** | **PREMIUM** | FREE | aucun (Premium) | `summarizeCoach` | `summarizeCoach` | non |
| 4 | `milo.sessionToJson` | Milo | **automatique** | **INTERNE** | INTERNE | illimité | `seanceJson` | **aucune** | non |
| 5 | `nutrition.label.ai` | Nutrition | manuel | **FREEMIUM** | FREEMIUM | 25 · usage_total | `foodLabel` | `foodLabel` | non |
| 6 | `nutrition.barcode.aiFallback` | Nutrition | manuel | **PREMIUM** | FREEMIUM | aucun (Premium) | `readBarcode` | `readBarcode` | non |
| 7 | `nutrition.mealEstimate.ai` | Nutrition | manuel | **FREEMIUM** | FREEMIUM | 25 · usage_total | `estimateFood` | `estimateFood` | non |
| 8 | `nutrition.mealPlan.ai` | Nutrition | manuel | **FREEMIUM** (jour / semaine) | FREEMIUM | **non décidé** | `generateMealPlan` | `generateMealPlan` | non |
| 9 | `nutrition.mealPlan.regen` | Nutrition | manuel | **FREEMIUM** | FREEMIUM | 1 · usage_par_jour | `generateMealPlan` | `generateMealPlan` | non |
| 10 | `nutrition.mealPlanImport.ai` | Nutrition | manuel | **PREMIUM** | FREE | aucun (Premium) | `importMealPlan` | `importMealPlan` | non |
| 11 | `training.programImport.ai` | Séance | manuel | **FREEMIUM** | FREEMIUM | 2 · usage_total | `importProgram` | `importProgram` | non |
| 12 | `training.historyImport.ai` | Séance | manuel | **FREEMIUM** | FREEMIUM | 1 · usage_total | `importHistory` | `importHistory` | non |
| 13 | `training.programAnalysis.ai` | Séance | manuel | **PREMIUM** | PREMIUM | aucun (Premium) | `coach` | `coach` | non |
| 14 | `profile.morphology.ai` | Profil | manuel | **PREMIUM** | PREMIUM | aucun (Premium) | `morphoAnalysis` | `morphoAnalysis` | non |
| 15 | `profile.bodyStudy.ai` | Profil | manuel | **PREMIUM** | PREMIUM | aucun (Premium) | `bodyStudy` | `bodyStudy` | non |
| 16 | `profile.bodySeries.ai` | Profil | manuel | **INTERNE** | INTERNE | 4 · usage_par_mois | `bodyStudy` | `bodyStudy` | non |
| 17 | `profile.bodyScanImport.ai` | Profil | manuel | **FREEMIUM** | FREEMIUM | 2 · usage_total | `importBodyScan` | `importBodyScan` | non |
| 18 | `health.bloodTest.ai` | Santé | manuel | **PREMIUM** | PREMIUM | aucun (Premium) | `importBloodTest` | `importBloodTest` | non |
| 19 | `admin.bench.milo` | Admin | manuel | **ADMIN** | ADMIN | illimité | `coach` | `coach` | non |
| 20 | `admin.bench.pt001` | Admin | manuel | **ADMIN** | ADMIN | illimité | `coach` | `coach` | non |
| 21 | `milo.memory.backfill` | Milo | **automatique** | **PREMIUM** | INEXISTANT | par_evenement · **non mesuré** | `summarizeCoach` | `summarizeCoach` | non |

## ❓ Les politiques encore ouvertes (0)

**Aucune.** Les trois derniers arbitrages (`milo.debrief`,
`nutrition.mealPlan.ai`, `nutrition.mealPlanImport.ai`) ont été rendus par
Michel le **19/09/2026**.

⚠️ **Zéro politique ouverte ne veut pas dire zéro travail** : une politique
décidée n'est pas une politique *appliquée*. Les écarts ci-dessus disent ce
que le code fait encore, et le verrou serveur reste à poser.

⛔ La valeur `NON_DECIDEE` reste dans le registre alors que plus personne ne la
porte : la retirer forcerait la prochaine capacité déclarée avant d'être
tranchée à s'inscrire « FREE » par défaut — exactement la faute qu'elle existe
pour empêcher (règle d'or 15).

## ⛔ Les écarts entre la politique et le code (12)

Chacun est **mesuré**, pas supposé. Ils sont écrits ici pour la même raison
qu'un retrait volontaire s'écrit (**R30**) : *sans la raison à côté, le suivant
« répare » une décision, ou croit à un oubli là où il y a un choix.*

- **`milo.chat`** — politique **FREEMIUM**, code `FREEMIUM` : un chip `.coach-qr` présent dans le DOM fait passer TOUT message tapé en noQuota : la condition porte sur la présence d'un chip, pas sur le fait que le message y réponde
- **`milo.debrief`** — politique **PREMIUM**, code `FREE` : AUCUN garde dans le code : le débrief part pour tout le monde. La décision du 19/09 n'est pas encore appliquée — le verrou appartient à la phase serveur. Défaut annexe inchangé : un jeton par séance empêche de payer deux fois, mais une boucle de réessai peut émettre DEUX appels pour une seule fin de séance.
- **`milo.memory`** — politique **PREMIUM**, code `FREE` : le code ne porte AUCUN garde : _saveCoachMemory part dès 4 messages, pour tout le monde. La décision M12 n'est pas encore appliquée.
- **`nutrition.label.ai`** — politique **FREEMIUM**, code `FREEMIUM` : le pot est désormais PROPRE (S.foodLabelAiUses) : la politique est appliquée par le client, pas par le serveur — `serveurApplique` reste false
- **`nutrition.barcode.aiFallback`** — politique **PREMIUM**, code `FREEMIUM` : ⚠️ LE CODE ACCORDE ENCORE 25 USAGES GRATUITS, sur un compteur qui lui est PROPRE (S.foodBarcodeAiUses) depuis le 19/09. La séparation est faite, le verrou Premium ne l'est pas : il appartient à la phase serveur. ⛔ Le compteur propre n'est pas une demi-mesure, c'est le SEUL état sûr — retirer le pot sans poser le verrou aurait rendu cette capacité ILLIMITÉE ET GRATUITE, soit l'exact contraire de la décision (mesuré : deux portes réelles, le bouton « 🆘 si la caméra n'y arrive pas » et le repli du scanner).
- **`nutrition.mealEstimate.ai`** — politique **FREEMIUM**, code `FREEMIUM` : le pot est désormais PROPRE (S.foodMealEstimateAiUses) : la politique est appliquée par le client, pas par le serveur — `serveurApplique` reste false
- **`nutrition.mealPlan.ai`** — politique **FREEMIUM**, code `FREEMIUM` : ⚠️ `etatCode` passe de FREE à FREEMIUM et ce n'est PAS un adoucissement : le client applique DÉJÀ la variation de périmètre (app.js, `scope: isPrem ? 'week' : 'day'`). Ce qui reste ouvert est ailleurs, et c'est écrit : ① le serveur ne vérifie pas le `scope` reçu, donc un navigateur modifié demande la semaine ; ② le NOMBRE de générations complètes n'a aucun plafond pour personne — et il reste NON DÉCIDÉ, pas « illimité ».
- **`nutrition.mealPlan.regen`** — politique **FREEMIUM**, code `FREEMIUM` : le compteur vit toujours DANS S.mealPlan (il n'a pas de propriétaire à lui), et le serveur ne l'applique pas. ⭐ La porte de contournement, elle, est FERMÉE le 19/09 : une génération complète ne remet plus `regenCount` à 0 le jour même.
- **`nutrition.mealPlanImport.ai`** — politique **PREMIUM**, code `FREE` : ni l'ouvreur ni le porteur ne vérifient quoi que ce soit : l'import IA d'un plan de diététicien reste gratuit dans le code. La décision du 19/09 attend le verrou de la phase serveur.
- **`training.historyImport.ai`** — politique **FREEMIUM**, code `FREEMIUM` : l'incrément du compteur n'est PAS conditionné par !S.premium, contrairement aux deux compteurs d'import jumeaux
- **`health.bloodTest.ai`** — politique **PREMIUM**, code `PREMIUM` : le Premium n'est annoncé nulle part : la personne le découvre au lancement
- **`milo.memory.backfill`** — politique **PREMIUM**, code `INEXISTANT` : n'existe pas encore dans le code : la capacité est déclarée avant d'être construite, exprès — le registre doit pouvoir porter une politique décidée pour une chose non bâtie

## 🔀 Une action serveur n'est pas une capacité

**21 capacités produit** pour **14 actions serveur**.
C'est la règle actée — *route technique ≠ capacité produit* — et c'est aussi
pourquoi le serveur ne peut pas appliquer une politique par capacité : il ne voit
que l'action.

| action serveur | capacités qui l'empruntent |
|---|---|
| `bodyStudy` | **2** — `profile.bodyStudy.ai`, `profile.bodySeries.ai` |
| `coach` | **5** — `milo.chat`, `milo.debrief`, `training.programAnalysis.ai`, `admin.bench.milo`, `admin.bench.pt001` |
| `estimateFood` | `nutrition.mealEstimate.ai` |
| `foodLabel` | `nutrition.label.ai` |
| `generateMealPlan` | **2** — `nutrition.mealPlan.ai`, `nutrition.mealPlan.regen` |
| `importBloodTest` | `health.bloodTest.ai` |
| `importBodyScan` | `profile.bodyScanImport.ai` |
| `importHistory` | `training.historyImport.ai` |
| `importMealPlan` | `nutrition.mealPlanImport.ai` |
| `importProgram` | `training.programImport.ai` |
| `morphoAnalysis` | `profile.morphology.ai` |
| `readBarcode` | `nutrition.barcode.aiFallback` |
| `seanceJson` | `milo.sessionToJson` |
| `summarizeCoach` | **2** — `milo.memory`, `milo.memory.backfill` |

## ⏱️ Les six formes de quota

Le registre ne suppose pas que tout quota s'exprime en « X appels par jour ».

| forme | ce qu'elle exprime | capacités |
|---|---|---|
| `usage_total` | N essais gratuits **au total**, pas par période | `milo.chat`, `nutrition.label.ai`, `nutrition.mealEstimate.ai`, `training.programImport.ai`, `training.historyImport.ai`, `profile.bodyScanImport.ai` |
| `usage_par_jour` | N par jour, remis à zéro chaque jour | `nutrition.mealPlan.regen` |
| `usage_par_mois` | N par mois | `profile.bodySeries.ai` |
| `illimite` | aucun compteur produit | `milo.sessionToJson`, `admin.bench.milo`, `admin.bench.pt001` |
| `zero` | Premium uniquement — aucun essai gratuit | `milo.debrief`, `milo.memory`, `nutrition.barcode.aiFallback`, `nutrition.mealPlanImport.ai`, `training.programAnalysis.ai`, `profile.morphology.ai`, `profile.bodyStudy.ai`, `health.bloodTest.ai` |
| `par_evenement` | N appels liés à **un événement**, pas à une période | `milo.memory.backfill` |
| `non_decide` | undefined | `nutrition.mealPlan.ai` |

## ⚡ Les capacités automatiques (4)

Elles ne sont déclenchées par **aucun bouton** : la personne ne les demande pas et
ne peut pas les refuser. *Un mur ne peut pas s'afficher devant une chose que
personne n'a demandée* — c'est ce qui les rend particulières pour une politique.

- **`milo.debrief`** — ⭐ LE SOCLE DÉTERMINISTE DE FIN DE SÉANCE RESTE DISPONIBLE SANS IA — c'est le débrief CHIFFRÉ, calculé en local (décision `SEANCE-DESSAI`). Ce qui devient Premium est le JUGEMENT de Milo par-dessus, pas les faits. Part aussi sur la navigation vers l'onglet Coach et sur un rattrapage 3 s après chaque chargement.
- **`milo.memory`** — ⭐ M12 : la CONSERVATION des faits reste FREE ; c'est l'ENTRETIEN IA de la mémoire structurée qui devient Premium. Ne jamais confondre les deux.
- **`milo.sessionToJson`** — le cervelet : il ne reçoit que du texte, ni profil ni e-mail. ⭐ SEULE capacité sans seconde porte Apps Script.
- **`milo.memory.backfill`** — ⭐⭐ MÊME action serveur que milo.memory, capacité DIFFÉRENTE : l'une entretient une mémoire qui existe (déclenchement diffus), l'autre en construit une qui n'existe pas (rafale déclenchée par UN événement). ⚠️ quotaValeur est `null` et ce n'est pas un oubli : la taille d'une période est NON MESURÉE, et inventer un nombre serait inventer une décision (règle d'or 15).

## 🔒 Ce que le serveur applique

**0 capacité(s) sur 21.**

Mesure de la phase 2 : `_moi.premium` est lu **0 fois** dans `worker.js`, et le mot
*premium* a **0 occurrence** dans `_aiQuotaBlock_`. Le serveur ne connaît que **QUI**
(le jeton), **COMBIEN** (un plafond d'abus identique pour tous) et **D'OÙ** (l'Origin).

👉 **Toute la séparation FREE / FREEMIUM / PREMIUM vit donc dans le navigateur.**
Ce fichier décrit une politique ; il ne la fait pas respecter. Le verrouillage serveur
est la passe suivante, et ce tableau est ce qui la rendra exprimable.

---

*Généré depuis `capacites-ia.js` par `tools/gen_doc_ia.js`. Ne pas éditer à la main.*
