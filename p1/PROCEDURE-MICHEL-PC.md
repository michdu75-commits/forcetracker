# Procédure UNIQUE pour Michel (éditeur Apps Script du projet FT-TEST-P1, ~2 minutes) — v2 du 06/11/2026 au soir

**Pourquoi cette étape avant les essais** : ton nouveau déploiement répond (plus de 403) et le code qu'il sert est bien celui du candidat, feuille de production neutralisée (vérifié par l'API, 12 contrôles sur 13). Le 13ᵉ a échoué et il est important : le Drive du compte ne contient **aucun dossier « FT-TEST-P1… »** alors qu'il contient **« ForceTracker-Backups », le dossier de sauvegarde de la PRODUCTION**. Le code serveur cherche ce dossier **par son nom** : sans réglage, un essai qui écrit la zone de récupération écrirait chez la production. Je n'envoie donc **aucune écriture** au serveur de TEST tant que ce réglage n'est pas fait.

## À faire (une fois)
1. Ouvre l'éditeur du projet **FT-TEST-P1** (le même que pour créer ton déploiement). Recharge la page (la nouvelle fonction vient d'y être poussée).
2. Choisis la fonction **`isolerEtProgrammerEssaiP1`** dans la liste à côté de **Exécuter**, puis **Exécuter**. (L'autorisation est déjà donnée : aucune fenêtre ne devrait s'ouvrir.)
3. Attends « Exécution terminée ». Dans le journal d'exécution, cherche **`ISOLÉ ET PROGRAMMÉ : {…}`**.
   * Si une ligne commence par le symbole d'interdit rouge : **ne fais rien d'autre**, copie-la-moi (c'est un garde qui a refusé exprès, rien n'a été modifié).
4. Écris-moi **« fait »**. Je vérifie moi-même (un dossier « FT-TEST-P1-RECUP-… » doit être apparu dans le Drive) puis je lance C1 tout seul.

## Ce que fait la fonction (et ce qu'elle ne fait pas)
* Refuse si le projet porte autre chose que des comptes **fictifs** (`@example.invalid`) ou un secret ; refuse si la feuille de production n'est pas neutralisée.
* Crée un dossier **neuf « FT-TEST-P1-RECUP-… »** dans ton Drive et y pointe la propriété `ft_backup_drive_folder_id`. **L'ancienne valeur est écartée : le dossier « ForceTracker-Backups » n'est ni lu ni écrit.** Elle relit la propriété et exige un nom « FT-TEST-P1… » avant de continuer.
* Pose `LECTURE_STRICTE = off` (nécessaire aux essais, comme prévu pour le TEST) et programme les créneaux de suspension de **C5** (début 60 min plus tard, 3 créneaux de 12 min toutes les 45 min, puis la programmation se supprime toute seule).
* Ne touche ni à la production, ni à ses sauvegardes, ni à son projet.
* Arrêt d'urgence (facultatif) : fonction `arreterBasculeEssaiP1`.

## Ensuite, tout est automatique
* **C1 réel** (vrai client A/A2 contre le vrai Google, depuis GitHub) dès ton « fait » ; **C5 réel** à partir de +60 min ; rapport PASS/FAIL/BLOQUÉ.
* **iPhone 4G/5G** : quand je te le dis (page déjà prête), de préférence hors des créneaux de suspension.
