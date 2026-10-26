---
name: ft-integrer
description: Intégrer des branches Force Tracker sur une branche isolée, préserver les décisions, lancer les contrôles adaptés et préparer la recette, sans publication.
argument-hint: "<branches/commits à intégrer>"
disable-model-invocation: true
model: sonnet
effort: medium
---

Mission : **$ARGUMENTS**. Si branches, commits ou périmètre manquent, demander le seul renseignement bloquant. Ne pas ajouter de chantiers non demandés.

1. `git fetch origin --all` ; vérifier HEAD de chaque livraison, `git status`, registre officiel des bugs/évolutions Drive, passation maître et `docs/JOURNAL-DE-PARTAGE.md`. Confirmer que les corrections attendues existent réellement et ne sont pas déjà intégrées. Vérifier qu'aucune autre session n'intervient sur le même périmètre.
2. Créer une **branche d'intégration distincte** de `master`. Intégrer les commits nommés, conserver les deux côtés des journaux/documents lors des conflits, ne pas écraser un état plus récent. Isoler `Code.js` : aucune modification ni publication serveur sans GO spécifique. Ne pas inclure des changements hors périmètre.
3. Vérifier en priorité les parcours ayant provoqué les incidents : Nutrition (ancien scan, quantité avant fiche, CIQUAL hors ligne, favoris, journal), Séance (remplacement, repos, sets, historique), selon les commits concernés. Témoin du bug, non-régression et contrôles négatifs/mutations **pertinents** ; ne pas confondre tests de branche et tests de l'arbre intégré.
4. Après la dernière modification de code intégrée, exécuter **une** passe D-031 complète valide sur l'arbre figé, par `python3 tools/passe_repartie.py 3` si admissible (`docs/D031-ACCELEREE.md`), puis vérifier ses huit conditions. Suivre les cas imposant `tools/passe_valide.sh`. Pas de relance intégrale automatique en boucle ni de surveillance horaire : en cas d'échec, identifier, corriger, puis seulement rejouer ce qui est nécessaire pour rendre le résultat valide.
5. Préparer, sans l'exécuter sur des données réelles, la recette iPhone NUT-VAL-05 (réseau lent, mode avion, scans historiques, 130→180 g, sauvegardes) avec un compte de test. Préserver D-101, Q15 et les décisions actées. Aucune fusion master, publication Pages, action `Code.js`, clone exposé, purge, restauration ou suppression réelle sans chaque GO distinct.
6. Rendre un bref bilan : commits intégrés, branche et HEAD, écarts, total D-031 et preuves, risques, ce qui attend test iPhone, GO à demander. Respecter règle d'or 14 : PDF autonome daté, bref, hors dépôt, vérifié. Synchroniser registre/passation quand autorisé/possible ; sinon produire un ajout sans écraser l'historique. Une seule sortie finale, aucun processus de rappel/monitoring.

Invocation volontaire seulement : `/ft-integrer`. Modèle Sonnet pour cette exécution.
