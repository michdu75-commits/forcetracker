# 🧷 F2-A′ — état du candidat et PRÉPARATION de sa qualification sur FT-TEST-P1

> **Écrit le 16/11/2026, mis à jour le même jour après la contre-expertise indépendante** (« GO CORRECTIONS PRINCIPAL » puis « corrections locales Principal » de Michel : corrections locales, commits locaux, tests ciblés ; **ni push, ni merge, ni déploiement**).
> **Mis à jour le 17/11/2026** (« GO corrections locales Principal », mission de fermeture : 3 écarts F2-A′ de la contre-expertise ciblée finale — voir § 2.2 et § 2.4).
> Branche : `claude/f2a-prime-v3-2026-11-17` (depuis `claude/f2a-prime-v2-2026-11-16 @4b4b3475`, elle-même depuis master `e4456bf4`, ft-v1267). Fichier applicatif touché : **`Code.js` seul**.
> ⛔ **Rien ici n'autorise un déploiement.** Ce document dit où l'on en est et ce qu'il faudra, au prochain GO TEST, pour qualifier le candidat.

## 1. Les quatre états (jamais confondus)

| État | Valeur |
|---|---|
| Corrigé sur branche | **OUI** — `claude/f2a-prime-v3-2026-11-17` (les commits au-dessus de master : `git log e4456bf4..HEAD`). Les branches précédentes `claude/f2a-prime-v2-2026-11-16 @4b4b3475`, `claude/f2a-prime-qualif-2026-11-16 @79fc953d`, l'ancienne `fix/f2-seances-union-2026-11-12 @cd1418cb` et la branche d'essai distante `test/f2a-prime-2026-11-13 @fb92ae19` sont **intactes**. |
| Intégré | **NON** |
| Publié (Apps Script) | **NON** (production @195 inchangée) |
| Vérifié (TEST réel / iPhone) | **NON** pour cette version. (L'essai TEST @5 du 13/11 portait la version d'avant les correctifs de ce document.) |

## 2. Ce que le candidat change dans `Code.js` (par rapport à master)

1. **F2-A′ (inchangé)** — les séances du compte se **fusionnent par identifiant** au lieu de se remplacer ; aucune suppression implicite ; le garde-fou de taille (refus sous 60 %) est remplacé par un simple *signal*.
2. **Identité des séances sans `id` — U-29 RETIRÉ le 17/11 (écart `F2-ancien-identite-ambigue`)** — le 16/11, une séance sans `id` était identifiée par son `ts`, puis (1ʳᵉ contre-expertise) par `ts` + jour + noms d'exercices. **La contre-expertise ciblée du 17/11 a démontré que ce rapprochement n'est pas une preuve d'identité** : deux séances distinctes sans `id`, de même `ts`, même jour et mêmes exercices mais aux séries différentes, étaient fusionnées (la seconde écrasait la première, réponse « ok »).
   **Règle actuelle** : une séance **sans `id` valide** n'a pour identité que son **contenu** (hors `synced`) : une copie strictement identique est reconnue (multi-ensemble : N copies légitimes restent N, rejouer un envoi ne change rien), une séance corrigée **reste en deux versions** (un doublon plutôt qu'une perte). Aucune migration, aucune suppression ; un `id` n'est jamais confondu avec un `ts`. `_sessSignature_` et la règle d'ambiguïté sont supprimés (moins de code).
   ⚠️ **Conséquence assumée** : une ancienne séance sans `id`, corrigée 20 fois, laisse 21 versions (mesuré, comme avant U-29) ; les témoins U01, U06, U08, U14, M02 qui attendaient « une seule séance » sont réécrits en leur contraire, avec la justification d'oracle écrite dans le banc.
3. **Sauvegarde qui dit ce qu'elle n'a pas pu écrire (écart « 13 contre 14 » du 15/11)** — `backupAllUserData_` ajoute au fichier `user_count_attendu` (les clés `u_` trouvées) et `erreurs` (clé + raison de chaque compte non sauvegardé), et le journal du serveur le dit. Avant : un compte dont `u_` ne se relit pas était **sauté en silence**. Rien d'autre ne change (mêmes `users`, `user_count` inchangé ; les lecteurs actuels ignorent les nouveaux champs).
4. **Restauration — le piège `data` seule est fermé (nouveau, contre-expertise)** — le fichier de sauvegarde range la santé dans une section **`sante` séparée** ; restaurer `data` seule faisait revenir un compte sans santé, réponse « ok ». `handleAdminRestore_` :
   · accepte `body.sante` (la section du fichier pour ce compte) et la **fusionne** — **champs de santé connus seulement** (`_CHAMPS_SANTE_`) ;
   · **garde de complétude AVANT toute écriture** : si le compte n'a de santé nulle part (ni dans l'envoi, ni dans `sante`, ni déjà sur le serveur) et que l'appelant ne dit pas `sansSante: true`, la restauration est **REFUSÉE** (`sante_non_precisee`, rien n'est écrit). Un compte vivant qui porte déjà sa santé garde le comportement d'avant ;
   · **échec partiel explicite** : l'écriture qui échoue renvoie `restauration_echouee` et **rétablit la santé** (`h_`, écrite en premier) à son état d'avant ; une relecture qui ne retrouve pas ce qui devait être écrit (séances, records, champs de santé) renvoie `partial` avec la liste des manquants — jamais « ok » ;
   · **aucune écriture de `u_` / `h_` ne change** (ARCH-06 reste un lot distinct) ;
   · **DURCI le 17/11 (écarts `REST-sante-vide` et `REST-meme-nombre-contenu-corrompu`)** : `sante: {}` (section vide) **ne prouve pas** une sauvegarde complète → refusée (`sante_vide_ambigue`) sauf `sansSante: true` ; l'**absence** de toute déclaration est refusée (`sante_non_precisee`), **même sur un compte vivant** qui porte déjà sa santé (jamais effacée par défaut) ; `sansSante: true` n'est qu'une déclaration **cohérente** (avec une santé présente : `sans_sante_incoherent`) ; la **relecture compare le CONTENU** (séances, records, chaque champ du profil, santé comprise), pas seulement les nombres : même cardinalité mais contenu différent → `partial` avec le nom des champs en écart.
   ⛔ **CHANGEMENT DE CONTRAT À VALIDER PAR MICHEL AVANT TOUT DÉPLOIEMENT** : l'outil de restauration lui-même (celui qui lit les sauvegardes Drive) est **HORS DÉPÔT** et n'a pas été modifié ni consulté. Il doit désormais envoyer `sante` (ou `sansSante: true`) ; sans cela, toute restauration sur un compte sans santé est refusée (sûr, mais bloquant en cas d'incident si on l'ignore). **Blocage à traiter par une mission distincte** : mettre à jour l'outil réel, puis le qualifier en local isolé.

## 3. Preuves locales (comptes inventés, Drive et propriétés en mémoire, aucun réseau)

| Quoi | Résultat |
|---|---|
| Banc `B-F2A` (`tools/banc_f2_seances_union.js`) | voir le journal brut de l'archive (le nombre de témoins change à chaque lot : il n'est pas figé ici) — le même banc sur l'ANCIEN `Code.js` (`4b4b3475`) rougit sur les témoins des 3 écarts |
| Mutations `tools/mut_f2_seances_union.py` | voir le journal brut de l'archive (M26–M28, M34 : identité = contenu seul ; M42–M44, M49–M53 : garde de complétude, `sante` vide, cohérence de `sansSante`, relecture de contenu) |
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

## 4 bis. Outil de restauration réel (hors dépôt) — contrat et blocage
Le contrat exact, les vérifications de compatibilité et la recette locale fictive sont dans **`docs/RESTAURATION-OUTIL-CONTRAT.md`**. Blocage : l'outil réel n'est pas dans le dépôt ; sa mise en conformité et la qualification d'une restauration RÉELLE sont une **mission distincte** (condition de passage TEST).

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
| T4 | ancienne séance sans `id` (avec `ts`, jour, exercices) corrigée 20 fois | 21 versions, aucune perdue (U-29 retiré : un doublon plutôt qu'une perte) |
| T4b | deux séances distinctes sans `id`, même `ts`, **même jour, mêmes exercices, séries différentes**, envoyées dans les deux ordres | **2** séances, contenus intacts |
| T5 | ancienne séance **sans `id` ni `ts`** corrigée 20 fois | 21 versions (limite écrite, aucune perte) |
| T6 | lancer la sauvegarde sur le TEST ; lire le fichier | `user_count_attendu`, `erreurs` présents ; avec un compte illisible fabriqué, il est NOMMÉ |
| T7 | restaurer un compte inventé depuis ce fichier avec `sante` envoyée à part | identique à l'original ; sans `sante` ni `sansSante` : **refus** `sante_non_precisee` ; `sante: {}` : **refus** `sante_vide_ambigue` ; rien d'écrit |
| T7b | restauration avec un `Code.js` de test qui altère une valeur à la relecture (même nombre d'éléments) | `partial` + nom du champ, jamais « ok » |
| T8 | rejouer le même envoi | aucune différence (idempotent) |
| T9 | `loadProfile` après chaque étape (code perso fictif) | séances et santé cohérentes |
| T10 | **limites Apps Script** : remplir un compte jusqu'au refus d'une propriété (9 Ko / valeur, 500 Ko / magasin) | un refus **explicite**, rien d'écrit à moitié (ARCH-11 / CH-12, jamais mesuré) |
| T11 | panne d'écriture de `u_` pendant une restauration (compte inventé) | `restauration_echouee`, santé rétablie |

## 7. Retour arrière

- **Apps Script** : le déploiement de production **n'est pas touché** par une qualification sur TEST. Si un jour F2-A′ est publié : redéployer la version précédente (@195) — c'est la ligne `retour_arriere` de la publication ; l'**ancien serveur reconstruit** est prouvé identique octet pour octet à master (H00b) et **perd bien des séances** (le retour arrière réintroduit la perte : démontré, à dire à Michel avant).
- **Données** : aucune migration, aucun champ persistant ajouté aux comptes ; seul le **fichier de sauvegarde** gagne deux champs (les lecteurs actuels les ignorent).

## 8. Compteurs de complexité (règle d'or #17, code applicatif seul)

Données persistées ajoutées : **0** (2 champs dans le fichier de sauvegarde, pas dans un compte) · fichiers applicatifs touchés : **1** (`Code.js`) · lignes ajoutées − retirées dans `Code.js` : voir `git diff --numstat e4456bf4 HEAD -- Code.js` · anciens chemins supprimés / fusionnés : **1** (le garde-fou de taille, remplacé par la fusion — déjà dans F2-A′). Outillage de test hors compteur : le diagnostic `tools/diag_sauvegardes.py` (1 fichier).
