# P0 SAUVEGARDES — résultats du « GO TEST P0 » (11/11/2026)

Branche d'essai `test/p0-sauvegardes-2026-11-11` — ⛔ **jamais fusionnée**. Projet Apps Script de **TEST isolé** seulement, **comptes fictifs** `@example.invalid` seulement.
**Aucun changement de `Code.js`, aucune production, aucun compte réel, aucun GO CODE F2.** Registre / passation : bloc fourni dans le rapport de session (règle 18 : le connecteur Drive ne modifie pas un fichier existant).

**État à 09:40 UTC** : protections vérifiées ✅ · témoins d'écrasement joués sur le vrai Google ✅ · **recette de restauration R1–R10 ⏳ en attente d'un clic de Michel dans l'éditeur** (voir § 3).

## 1. Protections vérifiées AVANT toute écriture
- `verifier` (avant) : 13 / 13 OK — le serveur de TEST répond, son code = `Code.js` actuel avec la Sheet de production neutralisée, dossier de récupération de TEST distinct de celui de la production.
- Dossier de sauvegardes de la production, **nombres seulement** (jamais un nom ni un contenu) : **198 éléments, plus récent 2026-11-11 01:31:41 UTC** — identique avant les témoins, après les témoins (09:29 UTC) et après la tentative d'API (09:34 UTC).
- La fonction `recetteRestaurationP1` poussée dans le projet de TEST est **identique** au fichier du dépôt (empreinte `d7d231d615e7` des deux côtés).

## 2. Témoins d'écrasement des séances — le vrai Google (run n°183, commit `a14a71d8`)
Sonde d'écriture OK (3 séances écrites, 3 relues : ni quota plein, ni autorisation perdue). **20 OK / 0 ROUGE** (ici « ROUGE » = défaut du *témoin*). **15 / 15 cas conformes** à la règle transcrite du serveur actuel (`Code.js` L2302–2309 : refus si envoi vide ou si base ≥ 30 et envoi < 0,6 × base, sinon la liste envoyée REMPLACE la liste en base). 71 requêtes, médiane 1 342 ms, **maximum 51 383 ms** (une seule requête lente, réussie).

| Cas | Base → envoi | En base après | Lecture |
|---|---|---|---|
| C01 croissance normale | 40 → 41 | 41 | vert |
| **C02a** 50 envoyées sur 70 | 70 → 50 | 50 | **ROUGE** : 20 anciennes perdues |
| **C02b** 50 envoyées sur 83 | 83 → 50 | 50 | **ROUGE** : 33 anciennes perdues |
| C03 50 envoyées sur 84 | 84 → 50 | 84 (refusé) | vert |
| **C04** 50 + 1 neuve sur 79 | 79 → 51 | 51 | **ROUGE** : 29 anciennes perdues |
| **C05** 50 + 1 neuve sur 86 | 86 → 51 | 86 (refusé) | **ROUGE** : la neuve est perdue côté serveur |
| C06a / C06b 1 ou 2 suppressions | 60 → 59 / 58 | 59 / 58 | vert |
| **C07** 3 séances retirées d'un coup | 60 → 57 | 57 | **ROUGE** (changement voulu, à confirmer : à trancher avec le correctif F2) |
| C08a envoi vide / C08b champ absent | 60 → 0 / (absent) | 60 / 60 | vert |
| C09 petit compte | 20 → 10 | 10 | vert |
| **C10** 3 neuves de chaque appareil | 63 → 63 | 63 | **ROUGE** : 3 anciennes perdues |
| C11 séances sans identifiant | 60 → 60 | 60 | vert |
| **C13** rejeu du même envoi | 79 → 51 (×2) | 51, stable | **ROUGE** : 29 perdues ; rejeu stable |
| **C12** deux envois SIMULTANÉS (vrai `LockService`) | 79 ; A = 50, B = 50 + 1 | 51 (= liste B) | **ROUGE** : les deux répondent `ok`, le dernier remplace l'autre |

Rouges vus = rouges annoncés : **C02a, C02b, C04, C05, C07, C10, C13, C12**. Les verts sont les comportements qui ne doivent pas changer (I4). Lecture : sur le vrai Google, la zone « 51 à 83 en base, 50 envoyées » **perd** des séances et la zone « 84 et plus » **refuse** (et fait alors perdre la séance neuve) — l'écrasement n'est plus une hypothèse, il est **mesuré** sur le serveur de TEST. En local (vrai `Code.js` dans le harnais) : 20 / 20 et 2 000 / 2 000 tirages conformes au modèle (`tools/chaos/ecrasement_sessions.js`).

## 3. Recette de restauration R1–R10 — ⏳ clic de Michel
Critères (PDF « P0 — Sécurisation des sauvegardes », § 2) : R1 gardes passées · R2 sauvegarde du point 2 lisible, A = S0 · R3 après activité plus récente, A = 63 séances et la sauvegarde fraîche les contient · R4 restauration `ok`, 60 séances · R5 séances = S0 (les 3 plus récentes **absentes** : la destruction documentée est constatée), records / pesées / journal = S0 · R6 `nutProto` jamais abaissé (variante sans marqueur comprise) · R7 santé `h_` et compte témoin B identiques · R8 l'annulation redonne S1 exactement · R9 aucun résidu (jeton absent, aucun déclencheur ajouté, dossier de production inchangé) · R10 aucun `NUT_LOCK_BUSY`, durée < 2 min.
- **Tentative d'automatisation (règle 16), run n°185** — étape `recette` : appel `scripts.run` sur le projet de TEST, `devMode`, jeton de `clasp`. Réponse de Google : HTTP 200, erreur d'exécution **`code 3 — « We're sorry, a server error occurred while reading from storage. Error code NOT_FOUND. »`** (`USER_ERROR`). Portées du jeton : `script.projects`, `script.deployments`, `script.webapp.deploy`, `drive.file`, `drive.metadata.readonly`, `cloud-platform`, `service.management`, `logging.read`, `userinfo.*`, `openid` — **ni `drive`, ni `script.scriptapp`** que la recette utilise. Rien n'a été écrit (run n°186 : dossier de TEST 0 fichier, aucun marqueur de verdict, dossier de production inchangé). *Cause probable, non prouvée* : le projet n'est pas exposé comme « API exécutable » / le jeton de `clasp` n'appartient pas au projet Cloud du script et n'a pas les portées de la recette (la documentation de `clasp run` exige un projet Cloud standard, un client OAuth propre et `executionApi` dans le manifeste — trois réglages manuels, plus lourds qu'un clic). Conclusion mesurée : **le clic dans l'éditeur reste le seul chemin praticable.**
- **Action de Michel (une seule)** : éditeur du projet **FT-TEST-P1** → recharger la page → fonction `recetteRestaurationP1` → **Exécuter** → attendre « Exécution terminée » (~30 s) → relever la ligne `VERDICT P0-RESTAURATION : PASS (10/10)` (ou `FAIL …`) ; une ligne `⛔ …` = une garde a refusé exprès, rien n'a été écrit.
- Ensuite (automatique) : étapes `verdict` (nom du marqueur `P0-VERDICT-PASS|FAIL-…` + nombres du dossier de production) et `verifier` (après).

## 4. Ce qui n'est pas prouvé
- Le comportement **en production** : le serveur n'est pas joignable depuis le conteneur, aucune donnée réelle n'a été lue ; le serveur de TEST porte le même `Code.js` (Sheet neutralisée), mais ses données sont fictives.
- Les limites du vrai Google (quotas, cohérence de Drive, autorisations) ne se prouvent que par l'exécution dans l'éditeur (§ 3).
- Le miroir Supabase accepte 500 → 50 (`SR-b`) : hors périmètre de ce GO.
- Le **correctif F2 n'est pas appliqué** (le patch reste un fichier non appliqué). Prochains GO non demandés : GO CODE F2 (tolérance K = 2 ; avec le comportement « 3 suppressions ou plus dans un même envoi ne se propagent plus ») ; publication (revue de surface serveur ciblée, sauvegarde fraîche, budget de versions 195 / 200).

## 5. Écarts au § 6 du PDF (à connaître)
Trois étapes ajoutées au workflow d'essai de la branche (`ecrasement`, `verdict`, `recette`) et trois fichiers `p1/` neufs (`p0_ecrasement.js`, `lire_verdict_p0.js`, `lancer_recette_p0.js`) : tous sur la branche d'essai, jamais fusionnée ; aucune écriture hors du projet de TEST et de ses comptes fictifs ; chacune refuse le Script ID et l'adresse de la production.
