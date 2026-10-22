# NUT-INVENTAIRE — comptage des journaux Nutrition en LECTURE SEULE

> Préparé le 22/10/2026 sur la branche isolée `claude/nut-inventaire-lecture-seule`, **corrigé le même
> jour** après la contre-analyse demandée par Michel.
> ⛔ **NON DÉPLOYÉ.** Le workflow Apps Script ne se déclenche que sur `master`. Le déploiement attend
> l'accord explicite de Michel.

## ⛔ Correction : `storeHealth` n'est PAS une voie « zéro risque »

La première version de ce document recommandait la carte Admin « Santé du système » (`storeHealth`)
comme premier chiffre « sans risque ». **C'était faux** : cette route écrit `PING_DIAG` (un test
d'écriture). Elle n'est donc pas en lecture seule et **n'est plus recommandée** ici. Aujourd'hui,
**aucune route déjà en production** ne donne le nombre de comptes sans écrire : l'inventaire réel
passe par le déploiement autorisé de `nutInventory`.

## Les deux routes (POST, action) — lecture seule depuis l'entrée HTTP

Elles sont servies **en tête de `doPost`**, juste après la lecture de la requête et **avant
`ensurePremiumEmails_()`** : ce garde-fou peut écrire `PREMIUM_EMAILS` (et journaliser la liste des
adresses premium). Dans la version précédente (commit `26c67499`), les routes passaient après lui et
pouvaient donc provoquer une **écriture indirecte** — défaut prouvé par un contrôle négatif, puis
fermé. En cas d'erreur, elles renvoient un **code fixe**, jamais le message (un message d'erreur peut
citer la donnée lue). Aucune ligne de `Logger`.

- `nutInventory` — nombres seulement : comptes, comptes avec `foodLog` non vide, entrées totales et
  valides, jours couverts, bornes, histogramme anonyme des tailles, anomalies (`sansDate`, `sansId`,
  `idsEnDouble`, `auPlafond8000`, `datesAberrantes`, `comptesJsonIllisible`,
  `foodLogVideAvecSavedFoods`).
- `nutBackupAudit` — **toutes** les sauvegardes `backup-*` du dossier `ForceTracker-Backups` (pas
  seulement la dernière ; plafond `max` déclaré, jamais silencieux) : par fichier, date, taille,
  lisibilité, comptes, entrées ; puis une **comparaison anonyme avec le serveur** :
  `lignesDansSauvegardesAbsentesDuServeur`, `lignesServeurAbsentesDesSauvegardes`,
  `comptesSeulementDansSauvegardes`. Ne crée jamais le dossier s'il manque.

## ⚠️ Ce que la fusion existante NE garantit PAS (mesuré sur la vraie fonction de production)

La restauration (`_fusionnerFoodLogRestauration` puis `_foodLogIdentifier`) est sûre pour : les
doublons d'une même lignée, les repas identiques à ids distincts, les collisions d'id **à l'intérieur
d'une même source**, et elle est idempotente. Elle a cinq **limites** mesurées :

1. **Collision d'id entre deux sources** (un exemplaire de chaque côté, contenus différents) : traitée
   comme une édition, le repas de l'autre source est **perdu**.
2. **Deux vrais repas identiques sans id**, un par source : un seul est conservé.
3. **Éditions divergentes** du même repas : l'appareil gagne, l'autre édition est écartée **sans signal**.
4. **Suppressions** : `removeFoodEntry` ne garde aucune trace ; une fusion avec une sauvegarde plus
   ancienne **ressuscite** le repas supprimé.
5. **L'ordre des sources** change le résultat.

👉 Conséquence pour le protocole : une ligne présente dans une sauvegarde et absente du serveur est
**ambiguë** (supprimée par la personne, ou perdue par `_pa_`). Elle est **comptée et présentée**, jamais
restaurée d'office (R29 : une erreur qui touche la personne → elle tranche).

## Sources à comparer (toutes celles qui sont accessibles et autorisées)

Appareil (export JSON complet, par la personne) · serveur (`u_`) · **chaque** sauvegarde Drive datée ·
miroir Supabase (`ft_comptes` : **une seule** photo par compte, la dernière ; lecture par la console,
requête SELECT d'agrégats uniquement, sur autorisation).

## Retour arrière après migration — règle

Le retour arrière **rend tout ce que V2 contient au moment du retour** (repas saisis après la bascule
et éditions comprises) **plus** les lignes legacy qui n'avaient pas été migrées. Une ligne migrée puis
supprimée après la bascule reste supprimée (grâce au **manifeste de migration**). ⛔ Jamais « recharger
l'original » : cette règle naïve efface les repas saisis depuis la bascule (prouvé par contrôle négatif).

## Autorisations nécessaires (aucune n'est accordée par ce document)

- Déployer `nutInventory` / `nutBackupAudit` (aucun scope OAuth nouveau ; jeton `IDEES_TOKEN2` existant).
- Lecture de la console Supabase (agrégats seulement) si le miroir doit entrer dans la comparaison.
- Décision produit : traces de suppression et manifeste de migration côté V2 (périmètre Claude Nutrition).
