# 🧷 F2-A′ — état du candidat et PRÉPARATION de sa qualification sur FT-TEST-P1

> **Écrit le 16/11/2026, mis à jour le même jour après la contre-expertise indépendante** (« GO CORRECTIONS PRINCIPAL » puis « corrections locales Principal » de Michel : corrections locales, commits locaux, tests ciblés ; **ni push, ni merge, ni déploiement**).
> Branche : `claude/f2a-prime-v2-2026-11-16` (depuis `claude/f2a-prime-qualif-2026-11-16`, elle-même depuis master `e4456bf4`, ft-v1267). Fichier applicatif touché : **`Code.js` seul**.
> ⛔ **Rien ici n'autorise un déploiement.** Ce document dit où l'on en est et ce qu'il faudra, au prochain GO TEST, pour qualifier le candidat.

## 1. Les quatre états (jamais confondus)

| État | Valeur |
|---|---|
| Corrigé sur branche | **OUI** — `claude/f2a-prime-v2-2026-11-16` (les commits au-dessus de master : `git log e4456bf4..HEAD`). La branche précédente `claude/f2a-prime-qualif-2026-11-16 @79fc953d`, l'ancienne `fix/f2-seances-union-2026-11-12 @cd1418cb` et la branche d'essai distante `test/f2a-prime-2026-11-13 @fb92ae19` sont **intactes**. |
| Intégré | **NON** |
| Publié (Apps Script) | **NON** (production @195 inchangée) |
| Vérifié (TEST réel / iPhone) | **NON** pour cette version. (L'essai TEST @5 du 13/11 portait la version d'avant les correctifs de ce document.) |

## 2. Ce que le candidat change dans `Code.js` (par rapport à master)

1. **F2-A′ (inchangé)** — les séances du compte se **fusionnent par identifiant** au lieu de se remplacer ; aucune suppression implicite ; le garde-fou de taille (refus sous 60 %) est remplacé par un simple *signal*.
2. **U-29 — DURCI le 16/11 après la contre-expertise (défaut 1)** — une séance **sans `id` mais avec un `ts`** n'est plus identifiée par son `ts` **seul** (la contre-expertise a reproduit la collision : deux séances DISTINCTES sans `id` de même `ts` se fusionnaient, la 2ᵉ écrasait la 1ʳᵉ, réponse « ok »).
   Elle l'est par une **preuve** : `ts` + **le jour** + **la liste ordonnée des noms d'exercices** (`_sessSignature_`). Une correction change des séries, pas le jour ni les exercices → UNE séance (la version la plus récente, à sa place). Sans preuve (pas de jour, pas d'exercice nommé) ou si elle diffère
   → l'identité reste le **contenu** : les deux séances sont gardées. **Ambiguïté** : si la même identité « ts + preuve » apparaît DEUX FOIS (en base ou dans l'envoi), elle ne désigne plus rien : tout est gardé. Un `id` n'est jamais confondu avec un `ts` ; un `id` présent mais invalide n'active pas la règle.
   ⚠️ **Limite écrite** : deux séances distinctes de même `ts`, même jour, mêmes exercices dans le même ordre, l'une en base, l'autre dans l'envoi, sont prises pour une correction (indiscernable avec les seules données) ; une séance corrigée dont la liste d'exercices change reste en deux versions (un doublon vaut mieux qu'une perte) ; une séance sans `id` NI `ts` reste jugée sur son contenu.
3. **Sauvegarde qui dit ce qu'elle n'a pas pu écrire (écart « 13 contre 14 » du 15/11)** — `backupAllUserData_` ajoute au fichier `user_count_attendu` (les clés `u_` trouvées) et `erreurs` (clé + raison de chaque compte non sauvegardé), et le journal du serveur le dit. Avant : un compte dont `u_` ne se relit pas était **sauté en silence**. Rien d'autre ne change (mêmes `users`, `user_count` inchangé ; les lecteurs actuels ignorent les nouveaux champs).
4. **Restauration — le piège `data` seule est fermé (nouveau, contre-expertise)** — le fichier de sauvegarde range la santé dans une section **`sante` séparée** ; restaurer `data` seule faisait revenir un compte sans santé, réponse « ok ». `handleAdminRestore_` :
   · accepte `body.sante` (la section du fichier pour ce compte) et la **fusionne** — **champs de santé connus seulement** (`_CHAMPS_SANTE_`) ;
   · **garde de complétude AVANT toute écriture** : si le compte n'a de santé nulle part (ni dans l'envoi, ni dans `sante`, ni déjà sur le serveur) et que l'appelant ne dit pas `sansSante: true`, la restauration est **REFUSÉE** (`sante_non_precisee`, rien n'est écrit). Un compte vivant qui porte déjà sa santé garde le comportement d'avant ;
   · **échec partiel explicite** : l'écriture qui échoue renvoie `restauration_echouee` et **rétablit la santé** (`h_`, écrite en premier) à son état d'avant ; une relecture qui ne retrouve pas ce qui devait être écrit (séances, records, champs de santé) renvoie `partial` avec la liste des manquants — jamais « ok » ;
   · **aucune écriture de `u_` / `h_` ne change** (ARCH-06 reste un lot distinct).
   ⛔ **CHANGEMENT DE CONTRAT À VALIDER PAR MICHEL AVANT TOUT DÉPLOIEMENT** : l'outil de restauration lui-même (celui qui lit les sauvegardes Drive) est **HORS DÉPÔT** et n'a pas été modifié ni consulté. Il doit désormais envoyer `sante` (ou `sansSante: true`) ; sans cela, toute restauration sur un compte sans santé est refusée (sûr, mais bloquant en cas d'incident si on l'ignore). **Blocage à traiter par une mission distincte** : mettre à jour l'outil réel, puis le qualifier en local isolé.

## 3. Preuves locales (comptes inventés, Drive et propriétés en mémoire, aucun réseau)

| Quoi | Résultat |
|---|---|
| Banc `B-F2A` (`tools/banc_f2_seances_union.js`) | **136 OK / 0 rouge** (114 d'avant + collision U-29 U09–U21, restauration S05–S13) — journal brut dans l'archive |
| Mutations `tools/mut_f2_seances_union.py` | voir le journal brut de l'archive (les mutations M26–M28 et M33 sont réancrées sur le nouveau code ; M34–M50 couvrent la preuve, l'ambiguïté et la restauration) |
| Benches voisins qui chargent `Code.js` | journaux **complets** dans l'archive ; `nut_phasea02` exige `FT_ANCIEN_CLIENT_REF=922c5d51 FT_DEPOT_GIT=…`. ⚠️ Quatre bancs voisins (`nut_d141_minimal`, `nut_phasea01`, `nut_phasea02`, `nut_fiabilite`) appelaient `adminRestore` sur des comptes SANS santé : leur appel porte désormais `sansSante: true` (la forme de l'appel change, ce qu'ils vérifient non) |
| Outil de lecture des sauvegardes (`tools/diag_sauvegardes.py`) | auto-test 9/9, **lecture seule, hors ligne**, adresses masquées (empreinte de 8 caractères) — voir § 4 |
| NON EXÉCUTÉ | le banc `chaos` (exige PostgreSQL local, absent ici) · la D-031 complète (interdite par le GO) · tout contrôle sur un vrai Apps Script ou un iPhone |

### 113 / 114 — l'écart est expliqué
Le banc affiche **114** témoins dans un dépôt Git qui contient l'objet de master `fd8bf703`, **113** sinon : `F2A-H00b` (la reconstruction de « l'ancien serveur » est identique octet pour octet à `git show fd8bf703:Code.js`) n'est **pas joué** quand cet objet est absent (« H00b non vérifiable ici », INFO). C'est le cas dans l'arbre temporaire des mutations (aucun `.git`) et dans une copie sans l'historique : le journal de la nuit du 16/11 et le rejeu indépendant affichaient 113 pour cette raison, pas pour une différence de code.

### Restauration dans un environnement local isolé (S04–S13) — ce qui est démontré
- Sauvegarde puis restauration **dans un serveur neuf** : les comptes inventés (séances avec `id`, à `ts` seul, sans rien, vide ; santé fictive) reviennent **identiques à l'original** par les DEUX voies (santé fusionnée à la main — S04 — et `sante` envoyée à part — S07).
- Le **piège est fermé** (S05) : `data` seule sur un compte sans santé est refusé, rien n'est écrit ; seule la déclaration explicite `sansSante: true` rétablit l'ancien résultat (S05b).
- `sante` ne laisse passer que les champs de santé (S08), refuse un type invalide (S08b) ; un compte vivant garde son comportement (S09) ; une `sante` fournie remplace celle du compte (S10).
- **Échec partiel** : l'écriture de `u_` qui échoue rétablit la santé (absente S11, ou octet pour octet S12) ; une relecture incomplète répond `partial` (S13).
- Après restauration, un appareil amputé (50 sur 60) qui synchronise **ne retire aucune séance** (S06).

## 4. Réserves restantes (écrites, aucune n'est cachée)

| Réserve | État |
|---|---|
| **U-09 — écarts « 12 lignes au lieu de 10 » et « 13 contre 14 comptes »** | **Causes NON établies**, **distinctes** (l'un compte des lignes, l'autre des comptes) : elles exigent de lire les **vraies** sauvegardes Drive et les **vraies** Script Properties (aucune lecture réelle autorisée). Hypothèses codées, testables : (a) un compte dont `u_` ne se relit pas était sauté en silence → désormais `erreurs` ; (b) un compte créé ou modifié entre deux passages (2 h et 14 h, heure de Paris) ; (c) deux fichiers du même jour (suffixe `-HH-mm`) comparés ensemble. **Rien ne suppose une perte ni une suppression volontaire.** |
| **Diagnostic lecture seule, prêt pour un futur GO DISTINCT** | `python3 tools/diag_sauvegardes.py <dossier de copies exportées>` : par fichier `user_count` / `user_count_attendu` / comptes présents / `erreurs` ; entre deux fichiers : comptes disparus, nouveaux, séances en baisse ou en hausse — **des faits, jamais une conclusion**. Il ne lit que le dossier donné (une copie exportée par Michel), n'écrit rien, ne se connecte à rien. **Il n'a jamais tourné sur une vraie sauvegarde.** |
| Outil de restauration réel (hors dépôt) | **NON modifié, NON consulté** : doit envoyer `sante` ou `sansSante: true` (§ 2.4). Mission distincte. |
| Suppressions voulues non propagées | **F2-B** (hors périmètre) : une séance supprimée revient à une restauration / sur un nouvel appareil. |
| Dernier arrivé gagne sur un même identifiant modifié | limite écrite (B02) ; seule l'**identité** est indépendante de l'ordre. |
| Limite U-29 | voir § 2.2 (même jour, mêmes exercices, même `ts` = prise pour une correction). |
| Aucune borne de taille | une base ne fait que croître : l'alerte de réservoir à 70 % est une décision à part. Les limites Apps Script (9 Ko par valeur, 500 Ko par magasin) **n'ont jamais été mesurées**. |
| Six listes (U-03), collisions d'identifiant « Autre activité » (U-06), miroir Supabase | hors F2-A′. |

## 5. Conditions du prochain GO TEST (rien n'est supposé acquis)

1. **GO explicite de Michel** « déploiement F2-A′ sur TEST uniquement » **pour CE candidat** (les GO du 13/11 portaient sur des versions antérieures).
2. **Décision de Michel sur le contrat de restauration** (§ 2.4) : l'outil réel devra envoyer `sante` / `sansSante`.
3. **Un push de la branche d'essai** (interdit aujourd'hui, même de sauvegarde). ⛔ **Ne jamais la fusionner** : son workflow porte le nom de celui de la production. `test/f2a-prime-2026-11-16-preparation` existe **en local** pour l'ANCIEN candidat `79fc953d` ; **pour ce candidat-ci, la branche d'essai n'est pas refaite** (voir « préparé / non fait » ci-dessous).
4. **Adapter avant le push** (constantes du 13/11 encore dans `p1/deployer_test.js` et le workflow) : la marque anti-doublon `F2A-PRIME` et la description du déploiement (sinon « un seul déploiement par candidat » refuse), l'état de base attendu (`BASE4` → le déploiement @5 du 13/11 devient la base), la phrase `DEPLOYER-<empreinte>-SUR-TEST` (l'empreinte change avec le candidat). Le banc des gardes du workflow (32 scénarios) est à rejouer.
5. **Sauvegarde fraîche des données du TEST**, **restaurable** (à vérifier par une restauration locale isolée AVANT de déployer), et retour arrière préparé (§ 7).
6. **QA L0 intégré ou compensé** : soit la branche `claude/qa-l0-v2-2026-11-16` est intégrée (la 1ʳᵉ passe se lance avec `--calibrer --croiser <passe répartie du même commit>`), soit Michel arbitre les contrôles manuels compensatoires de l'addendum n°1 § 4 de la contre-expertise du 16/11.
7. Aucun Worker dans la livraison ; aucun déploiement Apps Script concurrent ; **ARCH-06** (écriture `u_` / `h_`) = un déploiement **séparé**, ensuite.

**Préparé / non fait** : préparé = ce document, le diagnostic lecture seule, la liste exacte des constantes à adapter, les tests de restauration locale isolée. **Non fait** = la nouvelle branche d'essai TEST, le contrôle du workflow sur ce candidat, la sauvegarde TEST, tout push et tout déploiement.

## 6. Sondes à jouer SUR LE TEST, une fois le GO donné (comptes inventés exclusivement)

| # | Sonde | Attendu |
|---|---|---|
| T1 | compte neuf, 60 séances ; envoi de 50 + 1 neuve | **61** séances (jamais 51) |
| T2 | envoi vide ; champ `sessions` absent | rien ne change |
| T3 | deux « appareils » alternés, 20 tours, envois amputés à ~55 % | le serveur = l'union exacte, aucune copie |
| T4 | ancienne séance **à `ts` + jour + exercices** corrigée 20 fois | **1** séance (la dernière version) |
| T4b | deux séances distinctes sans `id`, même `ts`, sans jour ni exercice, envoyées dans les deux ordres | **2** séances, contenus intacts |
| T5 | ancienne séance **sans `id` ni `ts`** corrigée 20 fois | 21 versions (limite écrite, aucune perte) |
| T6 | lancer la sauvegarde sur le TEST ; lire le fichier | `user_count_attendu`, `erreurs` présents ; avec un compte illisible fabriqué, il est NOMMÉ |
| T7 | restaurer un compte inventé depuis ce fichier avec `sante` envoyée à part | identique à l'original ; sans `sante` ni `sansSante` : **refus** `sante_non_precisee`, rien d'écrit |
| T8 | rejouer le même envoi | aucune différence (idempotent) |
| T9 | `loadProfile` après chaque étape (code perso fictif) | séances et santé cohérentes |
| T10 | **limites Apps Script** : remplir un compte jusqu'au refus d'une propriété (9 Ko / valeur, 500 Ko / magasin) | un refus **explicite**, rien d'écrit à moitié (ARCH-11 / CH-12, jamais mesuré) |
| T11 | panne d'écriture de `u_` pendant une restauration (compte inventé) | `restauration_echouee`, santé rétablie |

## 7. Retour arrière

- **Apps Script** : le déploiement de production **n'est pas touché** par une qualification sur TEST. Si un jour F2-A′ est publié : redéployer la version précédente (@195) — c'est la ligne `retour_arriere` de la publication ; l'**ancien serveur reconstruit** est prouvé identique octet pour octet à master (H00b) et **perd bien des séances** (le retour arrière réintroduit la perte : démontré, à dire à Michel avant).
- **Données** : aucune migration, aucun champ persistant ajouté aux comptes ; seul le **fichier de sauvegarde** gagne deux champs (les lecteurs actuels les ignorent).

## 8. Compteurs de complexité (règle d'or #17, code applicatif seul)

Données persistées ajoutées : **0** (2 champs dans le fichier de sauvegarde, pas dans un compte) · fichiers applicatifs touchés : **1** (`Code.js`) · lignes ajoutées − retirées dans `Code.js` : voir `git diff --numstat e4456bf4 HEAD -- Code.js` · anciens chemins supprimés / fusionnés : **1** (le garde-fou de taille, remplacé par la fusion — déjà dans F2-A′). Outillage de test hors compteur : le diagnostic `tools/diag_sauvegardes.py` (1 fichier).
