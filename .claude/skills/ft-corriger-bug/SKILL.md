---
name: ft-corriger-bug
description: Corriger un ticket de bug Force Tracker précis avec preuve avant/après et contrôles de non-régression, sans publication.
argument-hint: "<ID-ticket et symptôme>"
disable-model-invocation: true
model: sonnet
effort: medium
---

Mission : **$ARGUMENTS**. Si l'ID ou le symptôme est insuffisant, poser une seule question avant d'agir. Ne traiter **qu'un ticket** ; ne pas élargir spontanément l'audit.

1. `git fetch origin --all` ; vérifier branche, statut Git et `docs/JOURNAL-DE-PARTAGE.md` avant travail. Une seule session active sur ces fichiers. Travailler sur branche isolée, jamais directement sur `master`.
2. Lire le ticket canonique dans le registre Drive « SUIVI DES BUGS — FORCE TRACKER », puis la passation maître ; se limiter aux pièces liées au ticket. Si Drive inaccessible, le signaler et demander l'export pertinent ; ne pas inventer le statut. Vérifier que le bug n'est pas déjà corrigé et confirmé par l'utilisateur.
3. Reproduire avec données fictives et obtenir un témoin **rouge avant**. Identifier la cause et les vrais chemins concernés ; faire le changement minimal sans dupliquer un calcul ni dégrader les garde-fous.
4. Obtenir **vert après**, puis tests ciblés voisins et contrôles négatifs/mutations pertinents ; vérifier les données, la synchro et le journal si concernés. Ne pas relancer tous les bancs sans justification. La passe D-031 complète reste requise **avant toute publication** de code modifié, pas pour un simple correctif isolé non publié.
5. Préserver les décisions validées (dont D-101 : garder la quantité saisie, sans inventer les macros), et l'historique réel. Ne jamais modifier compte réel, journal passé, favoris réels, serveur `Code.js`, master, clone public, ni lancer déploiement, restauration, purge ou fusion sans GO distinct.
6. Livrer une réponse courte : ticket, cause, commit/branche, preuve rouge→vert, autres contrôles, limites, état exact (« branche » ≠ « intégré » ≠ « publié » ≠ « vérifié iPhone »), prochaine action. Respecter la règle d'or 14 : PDF autonome daté, bref, hors dépôt, vérifié. Mettre à jour le registre et la passation si autorisé/possible, sinon fournir un bloc prêt à reporter. Aucune surveillance, aucun réveil programmé ; une notification finale seulement.

N'invoquer ce Skill que sur demande explicite `/ft-corriger-bug` ; conserver Sonnet pour cette exécution.
