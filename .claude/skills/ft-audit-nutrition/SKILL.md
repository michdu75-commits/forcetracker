---
name: ft-audit-nutrition
description: Auditer un périmètre précis de Nutrition dans Force Tracker, en lecture seule, avec preuves et tests ciblés, sans correction, audit exhaustif ni publication.
argument-hint: "<ticket, aliment ou parcours Nutrition à auditer>"
disable-model-invocation: true
model: sonnet
effort: medium
---

Mission : **$ARGUMENTS**. Si le périmètre n'est pas identifiable, poser **une seule question** avant de poursuivre. **Audit ciblé seulement** : l'audit exhaustif des aliments (couverture, alias, variantes, sources) reste planifié plus tard, après le chantier Séance. Ne pas élargir la mission sans GO explicite.

1. **État réel.** Vérifier branche/HEAD, `git status` et `docs/JOURNAL-DE-PARTAGE.md` ; lire le ticket et son statut dans le registre Drive « SUIVI DES BUGS — FORCE TRACKER », puis la passation maître et les documents utiles au seul périmètre. Si ces sources sont inaccessibles, le dire et ne pas inventer de statut ni conclure qu'un bug est corrigé. Distinguer « corrigé sur branche », « intégré », « publié » et « vérifié iPhone ».
2. **Chemin de données.** Identifier le parcours réellement utilisé (saisie, recherche, scan, historique, fiche, quantité, calcul et ajout au journal). Pour chaque aliment concerné, distinguer CIQUAL, Open Food Facts, favoris/historique, alias, variantes et sources réellement affichées ; ne pas traiter une correspondance approximative comme une fiche vérifiée. Vérifier unités, grammes/ml/portions, valeurs pour 100 g ou 100 ml, conversions justifiées, arrondis et cohérence calories/protéines/glucides/lipides.
3. **Cas sensibles selon le périmètre.** Contrôler si pertinent : produit ancien scanné puis fiche asynchrone, quantité 130 → 180 g préservée, connexion lente/hors ligne et CIQUAL indisponible ; aliment non vérifié bloqué sans valeurs inventées ni ajout trompeur à 0 kcal ; favoris obsolètes et appareils désynchronisés sans altérer le journal daté ; recherches « zéro », crème fraîche, viande hachée et ambiguïtés de variantes. **D-101 est une décision produit validée, pas une preuve d'implémentation.** `EVO-CIQUAL-01` est une évolution future, pas une fonctionnalité existante.
4. **Preuves économes.** Commencer par lecture ciblée du code et des tests existants, puis **quelques scénarios synthétiques** adaptés au défaut observé. Consigner entrée, source, résultat attendu, résultat obtenu, version/commit et reproduction. Comparer avec le même code réellement exécuté ; distinguer preuve mesurée, hypothèse et vérification encore nécessaire. Ne lancer **ni D-031 complète**, ni mutations massives, ni balayage de toute la base alimentaire dans ce Skill ; proposer ces travaux séparément s'ils sont justifiés. Pas de surveillance, boucle de relance ni agents parallèles.
5. **Lecture seule et sûreté.** Ne modifier aucun code (`app.js`, `Code.js`...), règle, base, journal, favori réel, sauvegarde ou compte utilisateur. Ne pas publier, fusionner, supprimer, restaurer, redéployer ni déclencher de facturation externe. En cas de besoin de correction, produire un ticket précis pour `/ft-corriger-bug` ; ne pas corriger soi-même. Registre/passation : préparer un texte de mise à jour, sans modifier leur contenu sans autorisation spécifique. Aucun test sur des données réelles.
6. **Livraison courte.** Tableau des constats : ID/périmètre ; reproductibilité et preuves ; impact/sévérité proposée ; fichiers/parcours concernés ; statut réel ; action recommandée. Séparer **confirmé / suspecté / non vérifié** ; indiquer les limites et 1 à 3 priorités maximum. Respecter la règle d'or 14 : PDF autonome daté, bref, hors dépôt, vérifié. Finir après une seule synthèse, sans ouvrir de chantier supplémentaire.

Invocation volontaire uniquement par `/ft-audit-nutrition` ; rester sur Sonnet, effort moyen.
