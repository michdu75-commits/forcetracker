# Procédure UNIQUE pour Michel (sur le PC, ~5 minutes) — rendre son autorisation au serveur de TEST

**Pourquoi** : le 06/11, le serveur de TEST répondait « Access Denied » à tout le monde. Le diagnostic (run 150, lecture seule) a montré qu'avec le jeton du propriétaire les 3 déploiements répondent **« Authorization needed — FT-TEST-P1 (Unverified) »** : le script de TEST n'est plus autorisé par son propriétaire. C'est un consentement Google : aucun programme ne peut le donner à ta place. Le fichier du projet, l'espace Drive et la configuration d'accès sont sains.
**Ce que ça ne touche pas** : la production (autre projet, autre adresse). Le projet de TEST n'a ni la feuille de production, ni son dossier de sauvegarde (vérifié par la fonction elle-même, qui refuse sinon).

## À faire (dans l'ordre, une fois)
1. Sur le PC, dans Chrome, **connecte-toi au compte Google du projet Force Tracker** (celui qui possède l'Apps Script de production).
2. Ouvre ce lien : <https://script.google.com/home/projects/1gBAmFDy2iEtsM8i5qeBTU5x2RckHqchkizUYgOurhKHw9C-Ymvis8C6m/edit>
   Le projet s'appelle **FT-TEST-P1**. ⛔ Si la page dit « Vous avez besoin d'un accès » : mauvais compte, change de compte. ⛔ N'ouvre JAMAIS le projet de production.
3. Dans la barre du haut, à côté du bouton **Exécuter**, ouvre la liste des fonctions et choisis **`autoriserEtProgrammerEssaiP1`**, puis clique **Exécuter**.
4. Une fenêtre **« Autorisation requise »** s'ouvre : **Examiner les autorisations** → choisis le compte → *« Google n'a pas validé cette application »* → **Paramètres avancés** → **Accéder à FT-TEST-P1 (non sécurisé)** → **Autoriser**.
5. Attends « Exécution terminée ». Dans le journal d'exécution, la ligne **`AUTORISÉ ET PROGRAMMÉ : {…}`** doit apparaître. Si une ligne commence par **« ⛔ »** : ne fais rien d'autre, copie-la et envoie-la à Claude (c'est un garde qui a refusé exprès).
6. **Vérification** : dans une fenêtre de navigation **privée**, ouvre
   `https://script.google.com/macros/s/AKfycbxdlCZcqOeKymoP5FDxMF9KdeWbNvqWI9h2vX0QCCMIJwSO3HYujOUdOR4KJ-x2qdMr/exec?test=1`
   → elle doit afficher `{"status":"online",…}`.
7. Écris à Claude **« fait »** (et l'heure). C'est tout. Tu peux fermer le PC.

## Si l'étape 6 n'affiche PAS « online » (une seule manœuvre de secours)
Dans l'éditeur : **Déployer → Gérer les déploiements →** le crayon ✏️ du déploiement le plus récent → **Version : Nouvelle version → Déployer**, puis recharge le lien de l'étape 6. Si ça ne change rien : envoie à Claude une capture de l'écran « Gérer les déploiements » et de la page affichée.

## Ce que Claude fait ensuite, tout seul (il ne t'est plus rien demandé sur le PC)
* **Tout de suite** : lecture de contrôle (`diag`), puis **C1 réel** sur le vrai Google depuis les serveurs GitHub (scénarios R1–R8 : réponses lisibles, accusés, réseau lent, réponse perdue, doublons, délai de 180 s).
* **+60 min après ton « fait »** : la fonction programmée suspend le Nutrition du serveur de TEST (3 créneaux de 12 min, un toutes les 45 min, puis elle se supprime toute seule) ; **C5 réel** (suspension → refus compris → reprise → convergence, aucune perte) est joué pendant ce temps.
* **Après** : rapport C1/C5 (PASS / FAIL / BLOQUÉ, avec les preuves). L'essai **iPhone 4G/5G** (page déjà prête) se fait quand tu veux, de préférence hors des créneaux de suspension (Claude te dira les heures).
* **Arrêt d'urgence** (facultatif) : fonction `arreterBasculeEssaiP1` (même éditeur) : retire la suspension et supprime la programmation.

## Rien n'est « validé » tant que ce n'est pas joué
C1 et C5 restent **non validés** jusqu'au rapport. Aucun déploiement en production n'est lié à cette procédure (aucun GO).
