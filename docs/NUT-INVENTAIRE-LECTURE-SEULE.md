# NUT-INVENTAIRE — comptage des journaux Nutrition en LECTURE SEULE

> Préparé le 22/10/2026 sur la branche isolée `claude/nut-inventaire-lecture-seule`.
> ⛔ **NON DÉPLOYÉ.** Le workflow Apps Script ne se déclenche que sur `master` : tant que ce
> code reste sur cette branche, il n'est pas en ligne. Le déploiement attend l'accord de Michel.

## À quoi ça sert

Produire, **avant la migration Nutrition V2**, un inventaire chiffré des journaux alimentaires,
**sans extraire aucun contenu** et **sans toucher aucun compte**. Deux routes serveur ajoutées à
`Code.js`, réservées à un administrateur authentifié (même jeton `IDEES_TOKEN2` que `storeHealth`).

## Les deux routes (POST, action)

### `nutInventory`
Parcourt les comptes (`u_*`) en lecture seule et rend **uniquement des nombres** :
- `comptes` · `avecFoodLog` · `avecSavedFoods`
- `entreesTotal` · `entreesValides` (date lisible + au moins une valeur de macro)
- `joursCouverts` · `borneMin` · `borneMax` · `entreesParAnnee`
- `histogrammeTailles` (répartition anonyme des tailles de journal)
- `anomalies` : `sansDate`, `sansId`, `foodLogVideAvecSavedFoods`, `auPlafond8000`,
  `datesAberrantes`, `comptesJsonIllisible`

### `nutBackupAudit`
Lit le dossier Drive `ForceTracker-Backups` en lecture seule (⛔ ne crée, ne modifie, ne met à la
corbeille **aucun** fichier) et rend : `dossierTrouve`, `nbFichiers`, `dernierNom`, `dernierDateISO`,
`dernierOctets`, `ageJours` (fraîcheur), `dernierLisible` (intégrité JSON), `userCountDeclare`,
`comptesDansDernier`, `avecFoodLogDansDernier`, `entreesFoodLogDansDernier`.

## Garanties (prouvées par les tests, hors dépôt)

- **Lecture seule** : les handlers n'appellent que des lectures. Un test prend un instantané des
  Script Properties avant/après un appel **direct** du handler et exige l'égalité ; un autre vérifie
  qu'aucune méthode d'écriture Drive n'est appelée. 25 témoins verts / 0 rouge.
  *(Note : `doPost` lance par ailleurs `ensurePremiumEmails_`, un garde-fou pré-existant qui peut
  écrire `PREMIUM_EMAILS` — ce n'est pas ces fonctions.)*
- **Aucune donnée personnelle en sortie ni dans les logs** : jamais d'e-mail, de nom d'aliment, de
  contenu de repas, de macro individuelle (R36).

## Comment l'exécuter (quand Michel l'autorise)

1. Vérifier que `IDEES_TOKEN2` est bien posé dans les Script Properties.
2. Déployer la branche (ou copier les deux fonctions + leurs routes dans le projet Apps Script).
3. Appeler la web app en POST : `{"action":"nutInventory","token":"<IDEES_TOKEN2>"}` puis
   `{"action":"nutBackupAudit","token":"<IDEES_TOKEN2>"}`.
4. Sans déployer : la carte **Profil → Admin → Santé du système** (`storeHealth`, déjà en prod)
   donne déjà le nombre de clés `u_` et les 15 plus grosses — un premier chiffre sans aucun code.

## Autorisations nécessaires

- `IDEES_TOKEN2` présent (déjà le cas en prod pour les autres cartes Admin).
- Pour `nutBackupAudit` : l'exécution Apps Script tourne sous `forcetracker.app@gmail.com`, qui
  possède `ForceTracker-Backups` — l'accès Drive est donc déjà là, en lecture.
- Aucune permission nouvelle, aucun scope OAuth ajouté.
