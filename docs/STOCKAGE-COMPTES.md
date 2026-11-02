# 🗄️ STOCKAGE-COMPTES — plan d'architecture (phase B de NUT-SYNC-02, et suppression de compte anticipée)

> **Créé le 02/11/2026** par Claude N°1 (Nutrition), sur ordre du Principal : (1) le complément « anticipation suppression de compte » ;
> (2) le GO de la phase A de NUT-SYNC-02. **Statut : PLAN. Rien de ce qui suit n'est construit.** La phase A est livrée sur la branche locale
> `claude/nut-sync-02-phase-a`, **non poussée, non validée pour la production** ; la phase B et le chantier STOCKAGE-COMPTES ne sont **pas commencés** :
> ils attendent une décision de Michel (et, pour les mesures sur Google, une autorisation spécifique — voir C7).
> ⛔ **Ce document ne supprime, ne déplace ni ne modifie aucune donnée existante, et n'ouvre pas la suppression de compte** : il fixe ce que le stockage futur
> devra *permettre* pour qu'une suppression définitive et complète soit possible plus tard **sans réorganiser les données**.

## 1. Pourquoi (mesuré, avec ce qui reste inexpliqué)

| Fait | Valeur | Provenance |
|---|---|---|
| Un compte = **une seule propriété** `u_<adresse>` (JSON compressé gzip + base64), santé dans `h_` | 1 valeur par compte | `Code.js` : `_packUser_`, `loadUserData_`, `saveUserData_` (le point de validation unique) |
| Réservoir **partagé** des propriétés du script | 512 000 octets ; **54 %** le 23/10 pour 13 comptes (≈ 21 Ko par compte) | `docs/NUT-INVENTAIRE-LECTURE-SEULE.md` (INV-02) |
| Registre des suppressions de repas | ≈ 34 octets stockés par entrée ; plafond **3 000** = ≈ 100 Ko pour un seul compte (20 % du réservoir) | mesuré (`etude02_tailles`) |
| Limite documentée **9 Ko par valeur** | **contredite** par une valeur de 278 Ko observée le 31/07 (sonde `storeHealth`, `octets=shV.length`, copie de seconde main) | `BUGS.md` §5 · `docs/GALERES-ET-LECONS.md` — **contradiction réelle, NON ÉLUCIDÉE** |

**Position retenue (arbitrage du Principal, 02/11)** : la limite de 9 Ko est **une contrainte de conception pour tout ce qui s'ajoute** — aucune dérogation fondée
sur une mesure non expliquée. Pour l'existant, c'est un **risque latent** à trancher par une preuve de fraîcheur (C0), pas par une dérogation.
STOCKAGE-COMPTES est **préparé comme une dépendance de l'archivage, pas écarté comme optionnel.**

## 2. L'architecture cible : le « registre étagé » (étude du 02/11, `PROPOSITION-NUT-SYNC-02`)

* **Étage chaud, dans le compte** : seulement les suppressions récentes. Budgets **en octets** (jamais en nombre d'entrées) : scellement au-dessus de 6 000 o,
  retombée ≤ 2 500 o, **plafond dur 8 000 o** ; toute valeur nouvelle ≤ 8 500 o (marge sous 9 Ko) ; ajout total par compte ≤ 12 000 o.
* **Étage froid, hors réservoir** : segments **scellés** et immuables sur Drive, en **deux copies** (A puis B, relues et vérifiées avant tout commit), nom à empreinte,
  un **index versionné** dont un pointeur de ≤ 400 o reste dans le compte.
* **Curseur de rattrapage** (révision) : un appareil en retard reçoit un delta ; une archive illisible donne « incomplet », jamais un faux « complet ».
* **Suppression découplée des repas** : une suppression sans place ne bloque plus rien (c'est ce que la phase A fait déjà, entrée par entrée).
* **L'appareil ne renvoie que ce qui est en attente** (c'est ce que la phase A fait déjà).
* **Ordre d'écriture, sous le verrou unique** : lire → calculer en mémoire → segment (A puis B) → index (A puis B) → **commit = une seule écriture de `u_`** → rendre le
  verrou → répondre. Une panne avant le commit ne laisse que des fichiers non référencés, jamais lus.
* **Hors périmètre ici** : déplacer les comptes eux-mêmes vers Drive (2 copies, pointeur de ≤ 400 o dans la propriété). Surface mesurée : 2 fonctions centrales + 8 accès
  directs à `u_`. Chantier séparé, décision de Michel, **GO distinct** (il touche des données réelles).

## 3. Où en est la phase A (livrée sur branche) — et ce qu'elle laisse exprès à la phase B

| La phase A fait | La phase A **ne fait pas** (dépend de STOCKAGE-COMPTES / phase B) |
|---|---|
| Porte de version : un ancien client est refusé **en entier et explicitement** (`NUT_CLIENT_INCOMPATIBLE`) | Segments Drive, pointeurs, index, curseur de rattrapage |
| Suppressions **différées entrée par entrée** au plafond (3 000 **conservé**) ; accusé `tomb.ok` / `tomb.diff` | Lever le plafond : aujourd'hui une suppression différée ne se propage pas aux autres appareils tant qu'elle n'est pas inscrite |
| L'appareil ne confirme **que** ce que le serveur nomme ; guérison si le compte est revenu en arrière | Migration des comptes, nouvelles routes de production |
| Confinement : une erreur Nutrition ne coûte plus séances / records / pesées | Mesure des limites sur un **vrai** Apps Script (projet de test isolé, autorisation spécifique) |
| **Un verrou pour tous les écrivains du compte** ; durée de détention **mesurée** et journalisée au-delà de 2 s | Aucune opération Drive nouvelle n'est faite sous ce verrou — c'est la phase B qui devra mesurer ce que Drive y ajoute |
| Quota local : une clé Nutrition refusée ne réduit plus `ft4_sessions` | Le repli quota d'avant reste pour toute clé HORS Nutrition (le navigateur ne dit pas laquelle a échoué) |

## 4. ⭐ Exigences « suppression de compte » — à respecter DÈS la conception du stockage (complément du Principal, 02/11)

Objectif : qu'une suppression **définitive et complète** d'un compte soit possible plus tard sans réorganiser les données. Cinq exigences, **toutes avant le premier segment**.

**E1 — Identifiant d'utilisateur stable et unique (`uid`).** Opaque (≥ 128 bits aléatoires), généré **une fois** à la création du compte, **jamais dérivé de l'adresse
e-mail** ni d'aucun contenu, jamais réutilisé, jamais modifié quand l'adresse change. Écrit dans l'enregistrement du compte et dans un petit index `adresse → uid`.
Pour les comptes existants : attribution **paresseuse**, sous verrou, au premier accès (ajouter un champ ne retire rien — réversible).

**E2 — Rattachement identifiable de tout ce qui est stocké.** *Aucun fichier, segment, ligne de feuille, sauvegarde ou copie miroir n'existe sans `uid` lisible* :
dans le nom (`…/<uid>/…`), dans l'en-tête signé du fichier (`{uid, genre, version, empreinte}`), dans une colonne `uid` des feuilles, dans la clé du miroir. L'adresse
n'est **jamais** le seul rattachement (elle change, et elle fuit dans les noms de fichiers).

**E3 — Inventaire des emplacements.** Un manifeste par compte (`inventaire(uid)`) énumère **toutes** les copies : propriétés (`u_`, `h_`, `auth_`, `prem_`, `confirmed_`,
entrées de `pending_confirms`, jeton) · Drive (segments A/B, index, **fichiers de débordement de la zone de récupération** D-109/D-110 — y compris les fichiers ORPHELINS qu'une erreur confinée tardive de la phase A peut laisser : écrits dans Drive puis jamais référencés, jamais relus, mais ils contiennent des copies de repas —, sauvegardes) · feuilles (Séances,
Utilisateurs, Premium ; « Exercices manquants » ne porte que des identifiants anonymes) · miroir Supabase · caches. Le manifeste est **tenu à jour par le code qui écrit**
(une écriture ajoute son emplacement) et **audité** par un contrôle qui cherche des copies non inventoriées.

**E4 — Protection contre la recréation.** Un registre des **identités supprimées** : empreinte HMAC-SHA-256 de l'adresse avec un secret serveur (jamais l'adresse en
clair), date, `uid` supprimé. Consulté **sous le verrou par chaque écrivain du compte, avant toute écriture** ; jetons révoqués. Un ancien appareil ou une synchronisation
retardée reçoit `ACCOUNT_DELETED` (**non réessayable, aucune écriture**) ; le client ne renvoie plus rien tant que la personne n'a pas choisi — jamais de recréation
silencieuse. Une inscription explicite (adresse vérifiée) crée un **nouvel** `uid` : on ne ressuscite pas l'ancien.

**E5 — Isolation stricte entre utilisateurs.** Toute lecture / écriture passe par le `uid` — **jamais** par un balayage de préfixe sur le stockage commun ; un dossier
Drive par `uid` ; test permanent : *supprimer A laisse B identique octet pour octet*, et la demande de A ne peut jamais lire un segment de B.

**Ordre de suppression futur (NON construit, à ne pas coder avant décision)** : verrou → **inscrire l'identité supprimée d'abord** (pour qu'aucune écriture tardive ne
ressuscite quoi que ce soit) → révoquer les jetons → supprimer segments et index Drive → lignes de feuilles → miroir → `u_` / `h_` / `auth_` / … → **vérifier que l'inventaire
est vide** → journaliser des nombres → rendre le verrou. **Idempotent et reprenable** (un état « suppression en cours » persistant) : jamais en une seule étape non reprenable.

**⚠️ Problèmes structurels déjà connus, à trancher AVANT d'ouvrir la suppression (ils ne se règlent pas après coup)** :
① les **sauvegardes nocturnes** agrègent plusieurs comptes dans un même fichier — non supprimables compte par compte : il faudra soit une **durée de rétention bornée et
annoncée**, soit des sauvegardes **par compte** ; ② les lignes de feuilles **antérieures à ft-v1018** ne portent pas d'identifiant de compte (non attribuables) ; ③ les fichiers
de la zone de récupération contiennent du **contenu rattaché à une adresse** ; ④ les lignes du miroir Supabase doivent être couvertes par la même suppression.

## 5. Conditions de la phase B (reprend C0–C8 de l'étude, ajoute C9–C10)

* **C0 (lecture seule, avant tout code)** : preuve de fraîcheur de la contradiction 9 Ko / 278 Ko — la feuille « Utilisateurs » (`derniere_sync` des comptes à gros historique,
  écrite **après** un `saveUserData_` réussi), la carte Admin « Inventaire Nutrition », option « Santé du système ». *Si un compte volumineux n'est pas à jour alors que son
  propriétaire synchronise : incident de production, STOCKAGE-COMPTES passe en premier.* **Non faite** (classeur introuvable depuis le Drive connecté).
* **C1** budgets en octets codés en constantes, avec assertions · **C2** ordre d'écriture du §2, panne injectée à chaque étape, mutations · **C3** tous les écrivains du compte
  sous un même verrou — **LIVRÉE par la phase A** (les 7 appels d'écriture du compte, dans 6 gestionnaires, passent par `_nutVerrouPrendre_` ; seule la route diagnostic `testGardeFou` reste hors verrou, sur une clé jetable) · **C4** curseur de rattrapage dans le même
  lot (sans lui, pas d'étage froid) · **C5** deux copies, dossier privé, audit, restauration jouée sur un compte de test · **C6** observabilité : journaliser les `SERVER_ERROR`
  (**faite** en phase A pour `saveProfile`), compteur dans « Santé » (dont le **nombre d'anciens clients encore refusés**, pour décider si la porte reste stricte), alerte à 70 % de jauge · **C7** au premier déploiement (GO distinct) : sonde d'écriture de 12 Ko sur une clé
  jetable effacée aussitôt, mesure de la latence Drive et de la durée du verrou — **jamais sur un compte de production**, sur un projet Apps Script de test isolé, après autorisation
  spécifique · **C8** intégrer 3B, NUT-SYNC-01 et 02 **ensemble**, jamais le lot FINAL seul.
* **C9 (nouvelle) — `uid`, manifeste et registre des identités supprimées existent AVANT le premier segment** : aucun segment, index ou copie sans `uid` lisible (E1–E3).
* **C10 (nouvelle) — le registre des identités supprimées est consulté par chaque écrivain avant d'écrire** (E4), et l'isolation (E5) a son test permanent.

## 6. Ordre d'intégration recommandé (client d'abord, puis serveur — et pourquoi)

Quatre situations existent selon l'état du téléphone et du serveur : ancien téléphone + serveur actuel (la production d'aujourd'hui) · **nouveau téléphone + serveur actuel** (E10 : aucun accusé reçu, donc aucune suppression « confirmée », un message
honnête au plus toutes les 10 minutes si une suppression attend — rien n'est perdu) · **ancien téléphone + serveur de la phase A** (son Nutrition est refusé en entier ; il garde tout en local ; il ne peut pas en être prévenu) · nouveau + phase A (tout marche).
Publier le serveur d'abord refuserait **tous** les téléphones d'un coup ; publier le client d'abord ne refuse, à l'armement de la porte, que les téléphones **qui n'ont pas encore été ouverts depuis**.

1. **Client** (3B + NUT-SYNC-01 + phase A), publié seul : il envoie déjà `foodLogV:3` et un `requestId`, il lit l'accusé, il ne confirme que ce qui est nommé. Les téléphones se mettent à jour à la prochaine ouverture. *Laisser passer 24 à 48 h* (décision du Principal) pour que
   les appareils actifs se mettent à jour — au prix du message « suppression pas encore confirmée » pour qui supprime un repas dans l'intervalle.
2. **Serveur** (`Code.js`) : `clasp push` puis `clasp deploy -i` (règle d'or n°1), contrôle `?test=1`. La porte est **armée par défaut** ; son levier de retour arrière est `NUT_COMPAT_STRICT_ = false` (retour exact au comportement d'avant pour les anciens clients — une décision à prendre
   sciemment). Surveiller dans le journal du script : `[FT COMPAT]` (anciens clients refusés : à compter), `[FT NUT_INTERNE]`, `[FT VERROU]` (détention ≥ 2 s), `[FT GARDE-FOU foodSupprimes]`, `[FT saveProfile] ERREUR`. Un nombre de refus qui ne baisse pas = repasser le levier à `false`, le temps de comprendre.
3. **Au premier déploiement seulement** (GO distinct, C7) : vérifier que `LockService` est bien autorisé (service refusé = réponse `NUT_LOCK_BUSY` à tous les envois : rien d'écrit côté serveur, rien de perdu côté téléphone, mais plus rien ne se synchronise) et relever la durée de détention réelle.
4. Phase B et STOCKAGE-COMPTES : **chantiers distincts**, après décision, jamais dans le même déploiement.

## 7. NON TESTÉ (et pourquoi)

Le vrai Apps Script (vrai `LockService` — premier usage dans ce code ; ses délais ; son autorisation), les vraies Script Properties et leurs plafonds, la latence Drive, le vrai
Supabase, l'iPhone : le conteneur n'atteint ni `script.google.com` ni le Worker (`CONNECT tunnel failed, 403`, mesuré). Les bancs jouent le **vrai `Code.js`** dans un moteur Node avec
des services Google simulés, de **vrais processus** avec un vrai verrou entre processus, et le **vrai client** dans Chromium.
