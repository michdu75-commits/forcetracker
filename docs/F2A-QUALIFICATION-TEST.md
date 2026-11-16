# 🧷 F2-A′ — état du candidat et PRÉPARATION de sa qualification sur FT-TEST-P1

> **Écrit le 16/11/2026** (« GO CORRECTIONS PRINCIPAL » de Michel : corrections locales, commits locaux, tests ciblés ; **ni push, ni merge, ni déploiement**).
> Branche : `claude/f2a-prime-qualif-2026-11-16` (depuis master `e4456bf4`, ft-v1267). Fichier applicatif touché : **`Code.js` seul**.
> ⛔ **Rien ici n'autorise un déploiement.** Ce document dit où l'on en est et ce qu'il faudra, au prochain GO TEST, pour qualifier le candidat.

## 1. Les quatre états (jamais confondus)

| État | Valeur |
|---|---|
| Corrigé sur branche | **OUI** — `claude/f2a-prime-qualif-2026-11-16` (5 commits sur master : fusion F2-A′ `a55d6d60`, finalisation U-29 / sauvegarde / restauration, suivi documentaire de F2-A′ repris de `cd1418cb`, reconstruction de l'ancien serveur, ce document). L'ancienne branche `fix/f2-seances-union-2026-11-12 @cd1418cb` et la branche d'essai distante `test/f2a-prime-2026-11-13 @fb92ae19` sont **intactes**. |
| Intégré | **NON** |
| Publié (Apps Script) | **NON** (production @195 inchangée) |
| Vérifié (TEST réel / iPhone) | **NON** pour cette version. (L'essai TEST @5 du 13/11 portait la version d'avant les correctifs de ce document.) |

## 2. Ce que le candidat change dans `Code.js` (par rapport à master)

1. **F2-A′ (inchangé)** — les séances du compte se **fusionnent par identifiant** au lieu de se remplacer ; aucune suppression implicite ; le garde-fou de taille (refus sous 60 %) est remplacé par un simple *signal*.
2. **U-29 (nouveau)** — une séance **sans `id` mais avec un `ts`** (instant de création, recopié à chaque correction) est identifiée **par son `ts`** : sa version la plus récente remplace l'ancienne, à sa place. Avant : 20 corrections = 21 versions au serveur (mesuré). Une séance **sans `id` ni `ts`** reste jugée sur son contenu (*« un doublon vaut mieux qu'une perte »*) ; un `id` présent mais invalide (objet, liste, espaces) **n'active pas** la règle du `ts` ; un `id` n'est jamais confondu avec un `ts`. Aucune heuristique de date ou d'exercices : elle confondrait deux séances réelles du même jour (démontré par le test U03).
3. **Sauvegarde qui dit ce qu'elle n'a pas pu écrire (nouveau, écart « 13 contre 14 » du 15/11)** — `backupAllUserData_` ajoute au fichier `user_count_attendu` (les clés `u_` trouvées) et `erreurs` (clé + raison de chaque compte non sauvegardé), et le journal du serveur le dit. Avant : un compte dont `u_` ne se relit pas était **sauté en silence** et `user_count` présentait les comptes réussis comme *tous*. Rien d'autre ne change (même fichier, mêmes `users`, `user_count` inchangé ; les lecteurs actuels ignorent les nouveaux champs).

## 3. Preuves locales (comptes inventés, Drive et propriétés en mémoire, aucun réseau)

| Quoi | Résultat |
|---|---|
| Banc `B-F2A` (`tools/banc_f2_seances_union.js`) | **114 OK / 0 rouge** (98 d'avant + sections **U** (U-29), **S** (sauvegarde + restauration isolée), **M** (3 appareils × 60 tours)) |
| Mutations `tools/mut_f2_seances_union.py` | **34 / 34 conformes** (26 d'avant + 8 : règle du `ts` éteinte / étendue à un `id` invalide / remplacée par la date ; `erreurs` retiré ; `user_count_attendu` faussé ; échec non noté ; journal muet ; restauration qui n'écrit plus les séances) |
| Benches voisins qui chargent `Code.js` | `nut_secu_p1` 82/0 · `sec_admin` 69/0 · `nut_d141_minimal` 120/0 · `foodlog_restore` 35/0 · `nut_sync01` 49/0 · `nut_sync02` 73/0 · `nut_phasea01` 45/0 · `nut_phasea02` 55/0 (avec `FT_ANCIEN_CLIENT_REF=922c5d51 FT_DEPOT_GIT=…` : sans eux, 3 rouges **identiques sur master**, d'environnement) · `auth_cloud_closure` 9/0 |
| NON EXÉCUTÉ | le banc `chaos` (exige PostgreSQL local, absent ici) · la D-031 complète (interdite par le GO) · tout contrôle sur un vrai Apps Script ou un iPhone |

### Restauration dans un environnement local isolé (S04–S06) — ce qui est démontré, et un PIÈGE
- Sauvegarde puis restauration **dans un serveur neuf** : les 4 comptes inventés (séances avec `id`, à `ts` seul, sans rien, vide ; santé fictive) reviennent **identiques à l'original** (séances, records, profil, santé ; hors `updatedAt`).
- ⛔ **Piège démontré (S05)** : le fichier de sauvegarde range la santé dans une section **`sante` séparée** (depuis la séparation du 01/09). Restaurer **`data` seule** fait revenir le compte **sans sa santé** (bilans sanguins, profil santé). **La procédure de restauration doit fusionner `sante` dans `data.profile` avant d'appeler `adminRestore`** (c'est ce que fait le test S04). À écrire dans l'outil de restauration (hors dépôt) avant tout usage réel.
- Après restauration, un appareil amputé (50 sur 60) qui synchronise **ne retire aucune séance** (S06).

## 4. Réserves restantes (écrites, aucune n'est cachée)

| Réserve | État |
|---|---|
| **U-09 — écart « 12 lignes ; 13 contre 14 comptes »** | **Cause NON établie** : elle exige de lire les **vraies** sauvegardes Drive et les **vraies** Script Properties (non lisibles ici, aucune lecture réelle autorisée). **Hypothèses codées, testables à la prochaine sauvegarde** : (a) un compte dont `u_` ne se relit pas était sauté en silence → désormais `erreurs` ; (b) un compte créé ou modifié entre deux passages (2 h et 14 h, heure de Paris) ; (c) deux fichiers du même jour (suffixe `-HH-mm`) comparés ensemble. **Mesure à faire** : après le déploiement, lire `user_count_attendu − user_count` et `erreurs` du premier fichier. |
| Suppressions voulues non propagées | **F2-B** (hors périmètre) : une séance supprimée revient à une restauration / sur un nouvel appareil. |
| Dernier arrivé gagne sur un même identifiant modifié | limite écrite (B02) ; seule l'**identité** est indépendante de l'ordre. |
| Séance sans `id` NI `ts` corrigée | reste en plusieurs versions (U02) : un doublon plutôt qu'une perte. |
| Aucune borne de taille | une base ne fait que croître : l'alerte de réservoir à 70 % est une décision à part (U-07 / U-29 de croissance). |
| Six listes (U-03), collisions d'identifiant « Autre activité » (U-06), miroir Supabase | hors F2-A′. |

## 5. Conditions du prochain GO TEST (rien n'est supposé acquis)

1. **GO explicite de Michel** « déploiement F2-A′ sur TEST uniquement » **pour CE candidat** (le GO du 13/11 portait sur l'ancien).
2. **Un push de la branche d'essai** (interdit aujourd'hui, même de sauvegarde) : `test/f2a-prime-2026-11-16-preparation` existe **en local** (candidat + les deux commits de workflow d'essai du 13/11). ⛔ **Ne jamais la fusionner** : son workflow porte le nom de celui de la production.
3. **Adapter avant le push** (constantes du 13/11 encore dans `p1/deployer_test.js` et le workflow) : la marque anti-doublon `F2A-PRIME` et la description du déploiement (sinon « un seul déploiement par candidat » refuse), l'état de base attendu (`BASE4` → le déploiement @5 du 13/11 devient la base), la phrase `DEPLOYER-<empreinte>-SUR-TEST` (l'empreinte change avec le candidat). Le banc des gardes du workflow (32 scénarios) est à rejouer.
4. **Sauvegarde fraîche des données du TEST** et retour arrière préparé (§ 7).
5. **QA L0 intégré ou compensé** : soit la branche `claude/qa-l0-2026-11-16` est intégrée (la 1ʳᵉ passe se lance avec `--calibrer`), soit Michel arbitre les **six contrôles manuels compensatoires** de l'addendum n°1 § 4 de la contre-expertise du 16/11 (arbre propre avant/après, `fetch` + `ls-remote` frais avant le push, ✅ = total, pas de `FT_PASSE_REJOUER`, banc F2-A′ + passe sur le MÊME commit, un seul déploiement Apps Script à la fois). Le recours éventuel aux contrôles compensatoires **n'est pas décidé**.
6. Aucun Worker dans la livraison ; aucun déploiement Apps Script concurrent ; **ARCH-06** (écriture `u_` / `h_`) = un déploiement **séparé**, ensuite.

## 6. Sondes à jouer SUR LE TEST, une fois le GO donné (comptes inventés exclusivement)

| # | Sonde | Attendu |
|---|---|---|
| T1 | compte neuf, 60 séances ; envoi de 50 + 1 neuve | **61** séances (jamais 51) |
| T2 | envoi vide ; champ `sessions` absent | rien ne change |
| T3 | deux « appareils » alternés, 20 tours, envois amputés à ~55 % | le serveur = l'union exacte, aucune copie |
| T4 | ancienne séance **à `ts` seul** corrigée 20 fois | **1** séance (la dernière version) |
| T5 | ancienne séance **sans `id` ni `ts`** corrigée 20 fois | 21 versions (limite écrite, aucune perte) |
| T6 | lancer la sauvegarde sur le TEST ; lire le fichier | `user_count_attendu`, `erreurs` présents ; avec un compte illisible fabriqué, il est NOMMÉ |
| T7 | restaurer un compte inventé depuis ce fichier **avec** `sante` fusionnée | identique à l'original ; **sans** fusion : santé absente (le piège) |
| T8 | rejouer le même envoi | aucune différence (idempotent) |
| T9 | `loadProfile` après chaque étape (code perso fictif) | séances et santé cohérentes |
| T10 | **limites Apps Script** : remplir un compte jusqu'au refus d'une propriété (9 Ko / valeur, 500 Ko / magasin) | un refus **explicite**, rien d'écrit à moitié (ARCH-11 / CH-12, jamais mesuré) |

## 7. Retour arrière

- **Apps Script** : le déploiement de production **n'est pas touché** par une qualification sur TEST. Si un jour F2-A′ est publié : redéployer la version précédente (@195) — c'est la ligne `retour_arriere` de la publication ; l'**ancien serveur reconstruit** est prouvé identique octet pour octet à master (H00b) et **perd bien des séances** (le retour arrière réintroduit la perte : démontré, à dire à Michel avant).
- **Données** : aucune migration, aucun champ persistant ajouté aux comptes ; seul le **fichier de sauvegarde** gagne deux champs (les lecteurs actuels les ignorent).

## 8. Compteurs de complexité (règle d'or #17, code applicatif seul)

Données persistées ajoutées : **0** (2 champs dans le fichier de sauvegarde, pas dans un compte) · fichiers applicatifs touchés : **1** (`Code.js`) · lignes ajoutées − retirées dans `Code.js` : **+82 − 17 = +65** · anciens chemins supprimés / fusionnés : **1** (le garde-fou de taille, remplacé par la fusion — déjà dans F2-A′).
