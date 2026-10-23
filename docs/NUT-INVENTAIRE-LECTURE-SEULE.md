# NUT-INVENTAIRE — comptage des journaux Nutrition en LECTURE SEULE

> Préparé le 22/10/2026 sur la branche isolée `claude/nut-inventaire-lecture-seule`, **corrigé le même
> jour** après la contre-analyse demandée par Michel.
> ✅ **DÉPLOYÉ LE 22/10/2026 (GO limité A1 de Michel)** : Apps Script @192, run n°123 du workflow
> `deploy-appsscript.yml` lancé à la main sur master `236764c5` (le commit de tête porte `[skip ci]` :
> Pages n'a pas été redéployé, l'app reste `ft-v1258`). `clasp push` n'a envoyé que `appsscript.json` et
> `Code.js` ; `?test=1` online ; `authStatus` OK. ⚠️ Les deux routes n'ont **jamais été appelées** en
> production au 22/10 : la carte Admin A2 est **publiée en `ft-v1259`** (GO limité de Michel), le premier
> inventaire réel reste à lancer par Michel ; le réseau de la session Claude refuse `script.google.com`. ⛔ Le GO ne vaut que pour ces deux routes : ni extraction, ni migration,
> ni restauration.

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
  ⚠️ Une ligne est reconnue **par son id OU par son contenu** (tous les champs sauf l'id), et une
  absente n'est comptée **qu'une fois** même si elle revient dans plusieurs sauvegardes : une
  ancienne ligne reçoit un id **aléatoire à chaque chargement** de l'app tant qu'aucun
  enregistrement ne l'écrit (mesuré dans Chromium), donc le même repas peut porter un id différent
  dans chaque sauvegarde. Par l'id seul, il était compté « absent », une fois par sauvegarde
  (corrigé le 22/10, témoins H17-H19, contrôles négatifs NC7-NC9).
  ⏱️ Le dossier n'est jamais purgé (une sauvegarde par nuit depuis fin juin, tous les comptes dans
  chacune) et Apps Script coupe une exécution à 6 min : la route **s'arrête d'elle-même après
  4 min 30 et le dit** (`arretParLeTemps`, `fichiersNonLus`) — les plus anciennes restent alors à
  lire. Un paramètre de reprise ne sera ajouté que si le premier passage réel le montre nécessaire
  (témoin H20, contrôle négatif NC10).

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
6. **Une ancienne ligne exportée deux fois** porte deux ids différents (posés au chargement, au
   hasard) : deux exports du même téléphone fusionnés l'un avec l'autre la **dédoublent**.

👉 Conséquence pour le protocole : une ligne présente dans une sauvegarde et absente du serveur est
**ambiguë** (supprimée par la personne, ou perdue par `_pa_`). Elle est **comptée et présentée**, jamais
restaurée d'office (R29 : une erreur qui touche la personne → elle tranche).

## L'export JSON complet du téléphone (vérifié dans Chromium le 22/10, données fictives)

Chemin réel Menu ☰ → « Exporter mes données » → « Exporter tout ». Sur 8 605 lignes et 260 favoris :
le fichier contient **toutes** les lignes (pas de plafond à 8 000, contrairement à l'envoi au
serveur), chacune **identique champ par champ** à ce que l'app a en mémoire, ids et références
compris (`sourceId`, `per100`, portion, doute, kcal dérivée, code douteux), **tous** les favoris
(pas de plafond à 200), et **pas** l'adresse e-mail. 17 témoins verts ; 5 mutations (troncature à
8 000, ids retirés, références retirées, favoris à 200, journal exclu) font chacune rougir au moins
un témoin. Limites : l'export « séances seulement » ne contient **pas** la nutrition ; l'app n'a
**aucune** fonction pour relire ce fichier ; une ancienne ligne sans id y porte l'id posé au
chargement (voir limite 6) — **on compare un export au serveur par le contenu**, jamais par l'id
seul, et on ne fusionne jamais deux exports du même téléphone.

## Sources à comparer (toutes celles qui sont accessibles et autorisées)

Appareil (export JSON complet, par la personne) · serveur (`u_`) · **chaque** sauvegarde Drive datée ·
miroir Supabase (`ft_comptes` : **une seule** photo par compte, la dernière ; lecture par la console,
requête SELECT d'agrégats uniquement, sur autorisation).

## Retour arrière après migration — règle

Le retour arrière **rend tout ce que V2 contient au moment du retour** (repas saisis après la bascule
et éditions comprises) **plus** les lignes legacy qui n'avaient pas été migrées. Une ligne migrée puis
supprimée après la bascule reste supprimée (grâce au **manifeste de migration**). ⛔ Jamais « recharger
l'original » : cette règle naïve efface les repas saisis depuis la bascule (prouvé par contrôle négatif).

## Points ouverts (mesurés le 22/10)

- **Aucun bouton** ne lance ces routes, et la session Claude ne peut pas les appeler : le réseau de
  l'environnement refuse `script.google.com` (`CONNECT tunnel failed, response 403`), et le jeton
  admin n'est que sur le téléphone de Michel (`ft4_admin_tok`). Options : une petite carte Admin
  (lot d'interface, recommandé) ou une variante GET ouverte comme lien (le jeton passe alors dans
  l'adresse, comme pour les cartes Admin existantes).
- **Perte possible au serveur aujourd'hui** : `profile.foodLog = _pa_(body.foodLog, profile.foodLog)`
  remplace le journal du serveur par toute liste non vide plus courte ; les séances ont un garde
  contre le rétrécissement, pas le journal (changement de production : décision de Michel).
- Journaux restés sur le téléphone : seul l'export complet de la personne les capture, et l'app ne
  sait pas relire un export (outil de reprise : V2).

## Autorisations nécessaires (aucune n'est accordée par ce document)

- ~~Déployer `nutInventory` / `nutBackupAudit`~~ — **accordé et fait le 22/10 (A1, @192)**.
- Choisir comment les lancer (carte Admin ou lien GET) — sans ce choix, le déploiement ne donne
  rien de lisible.
- Lecture de la console Supabase (agrégats seulement) si le miroir doit entrer dans la comparaison.
- Décision produit : traces de suppression et manifeste de migration côté V2 (périmètre Claude Nutrition).

## A2 — la carte Admin « Inventaire Nutrition » (préparée le 22/10, ✅ PUBLIÉE en `ft-v1259` le 22/10)

Branche `claude/nut-inventaire-carte-admin` (`0fb75f7c`). Profil → Admin → groupe « Surveillance », deux boutons :
« 📊 Compter les journaux » (`nutInventory`) et « 🗄️ Comparer avec les sauvegardes » (`nutBackupAudit`, jusqu'à
5 min). Réservée à l'admin ; même jeton et même mémoire que les autres cartes (`_adminTok`, oublié s'il est refusé),
mais envoyé **dans le corps d'un POST**, jamais dans l'adresse ; une **liste blanche de nombres** (un champ inattendu
du serveur ne s'affiche pas), valeurs échappées ; aucun résultat rangé sur l'appareil. Banc
`tools/banc_nut_inventaire_admin.js` 20/0, contrôle négatif `tools/mut_nut_inventaire_admin.py` 10/10.
✅ Publiée en `ft-v1259` (GO limité « PUBLICATION A2 » de Michel, 22/10 ; master `3d6953c4`, Pages run n°1359 réussi, aucun run Apps Script) : passe complète **7 843 ✅ / 0 ❌** sur `9c527110`. **Retour arrière** (jamais lancé sans décision de Michel) : `git revert` du commit fonctionnel A2 (`app.js`, `index.html`, banc, runner, registre reviennent à master `6c0a400d`) + clé de cache **jamais diffusée** `ft-v1260` ; rejoué à blanc le 22/10 sur un arbre jetable, rien poussé.
**Premier inventaire réel (Michel, iPhone)** : Menu → À propos = `ft-v1259` · 5 tapes sur le logo + code admin · Profil → 🔧 Admin → Surveillance → « 🍽️ Inventaire Nutrition » → « 📊 Compter les journaux » (jeton admin si demandé) · puis « 🗄️ Comparer avec les sauvegardes » (jusqu'à 5 min, app ouverte) · capture d'écran. Rien n'est modifié.


## INV-02 — les premiers résultats réels, lus (23/10/2026, mission de Michel, LECTURE SEULE)

**Résultats de Michel (iPhone, `ft-v1259`)** : 13 comptes au serveur, 2 avec un journal (542 lignes, 62 jours,
08/07 → 21/10), 1 avec des favoris, aucune anomalie · 157 sauvegardes lues sur 157 · 14 comptes dans les
sauvegardes, **1 seulement dans les sauvegardes** · **10 lignes des sauvegardes absentes du serveur (1 compte)** ·
0 ligne du serveur absente des sauvegardes.

**Ce que le code déployé (@192, identique au `Code.js` du dépôt) permet d'en dire** — vérifié par simulation hors
dépôt sur le vrai `Code.js`, données inventées, réseau coupé (`inv02_simu.js`, 17 / 0) :
- couverture complète (0 fichier non lu) ; tout ce qui est au serveur a été sauvegardé au moins une nuit ;
- le compte en plus a **existé puis disparu** (chaque compte est enregistré sous l'e-mail de sa clé, `Code.js:1853`) ;
- ⚠️ **un compte disparu fait compter TOUTES ses lignes comme « absentes »** (`Code.js:2216`) : les deux chiffres
  peuvent avoir **une seule cause** ;
- **trois histoires donnent EXACTEMENT la même carte** : ① un compte de test supprimé qui avait 10 lignes (le code
  prévoit deux suppressions de comptes de test : `michdu75+test` par `compressStore`, 31/07, et un second par
  `supprimerCompteTest`, 05/08 — **rien ne prouve qu'elles ont été lancées**, et un seul compte manque) ;
  ② 10 repas supprimés volontairement ; ③ 10 repas **perdus** par écrasement ;
- **faux « absent »** possible : un repas d'avant le 16/09 (sans identifiant dans les vieilles sauvegardes) corrigé
  ensuite compte 1 absente sans aucune perte ;
- suppression ou perte : **indiscernables** ici (aucune trace de suppression dans l'app).

**Ce qui départage, sans toucher aux données** : la route renvoie DÉJÀ, par sauvegarde, la date, le nombre de
comptes, de comptes avec journal et de lignes (`fichiers`) — la carte ne l'affiche pas. Cette série sépare ① de
②/③ et date la chute ; elle ne sépare pas ② de ③.

**Le risque `_pa_`, rejoué par la vraie route `saveProfile`** : tout envoi non vide **remplace** le journal (40 → 30
sans trace ; 500 → 1 pour un appareil remis à zéro qui ajoute un repas) ; seul un envoi vide est ignoré ; les
**favoris** suivent la même règle ; les **séances**, elles, ont un garde-fou depuis le 02/08 (refus + trace). Et
**ouvrir l'app suffit** : au démarrage, le journal du serveur n'est relu que si le téléphone est entièrement vide
(`app.js`, `autoConnect`), sinon `persist()` déclenche la synchro 4 s plus tard et le journal local remplace —
un 2ᵉ stockage resté en arrière (Safari ≠ app de l'écran d'accueil sur iPhone, autre appareil) écrase.

**Proposé, NON implémenté** (décision de Michel attendue) : P1 Apps Script seul — une ligne retirée va dans une
corbeille serveur bornée au lieu d'être jetée, et un rétrécissement brutal (même seuil que les séances) devient une
union tracée ; P2 afficher la série par sauvegarde dans la carte ; P3 (plus tard, avec Nutrition V2) traces de
suppression et fusion au démarrage. ⛔ Rien restauré, rien extrait, aucun compte touché, aucun déploiement.
