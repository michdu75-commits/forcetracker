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
| Porte de version **PAR COMPTE** : un ancien client est toléré tant que le compte n'a aucun état v3 ; dès qu'il en a un, **son volet Nutrition** (journal, favoris, suppressions, masquages `hiddenFoods`) est refusé **en entier et explicitement** (`NUT_CLIENT_INCOMPATIBLE`) — **le reste de l'envoi (séances, records, pesées, réglages) est enregistré** ; suspension du volet Nutrition (`NUT_SUSPENDU`) pour le retour arrière — §6, BUGS.md §128 | Segments Drive, pointeurs, index, curseur de rattrapage |
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
  (**faite** en phase A pour `saveProfile`), compteur dans « Santé » (dont le **nombre d'envois anciens tolérés et refusés** (`[FT COMPAT]`), pour savoir combien d'anciens téléphones restent actifs), alerte à 70 % de jauge · **C7** au premier déploiement (GO distinct) : sonde d'écriture de 12 Ko sur une clé
  jetable effacée aussitôt, mesure de la latence Drive et de la durée du verrou — **jamais sur un compte de production**, sur un projet Apps Script de test isolé, après autorisation
  spécifique · **C8** intégrer 3B, NUT-SYNC-01 et 02 **ensemble**, jamais le lot FINAL seul.
* **C9 (nouvelle) — `uid`, manifeste et registre des identités supprimées existent AVANT le premier segment** : aucun segment, index ou copie sans `uid` lisible (E1–E3).
* **C10 (nouvelle) — le registre des identités supprimées est consulté par chaque écrivain avant d'écrire** (E4), et l'isolation (E5) a son test permanent.

## 6. Porte par compte, ordre d'intégration et retour arrière (↪️ REFAIT le 02/11/2026 — BUGS.md §128)

> ↪️ **Ce que disait la 1ʳᵉ version de cette section, et pourquoi c'était faux (R30 — un retrait s'écrit).** Elle recommandait « client d'abord, puis serveur, en laissant passer 24 à 48 h » et donnait `NUT_COMPAT_STRICT_ = false` pour *levier de retour arrière*.
> ① Le délai de 24 à 48 h n'était pas une mesure : rien dans le dépôt ne dit en combien de temps les téléphones se mettent à jour. ② Un merge sur `master` déclenche `deploy-pages.yml` **et** `deploy-appsscript.yml` sur le même événement, sans lien d'ordre entre eux (lu dans les deux fichiers de workflow, aucun run observé) : l'ordre « client puis serveur » n'est pas tenu
> par la chaîne de déploiement. ③ `= false` n'était **pas** un retour arrière sûr : il rouvrait la **résurrection** (une ancienne ligne SANS identité ne retrouve pas son entrée du registre — mesuré) et l'**écrasement**. Cette constante n'existe plus. ④ La porte refusait aussi
> **tous** les anciens clients, y compris ceux d'un compte qui n'a **aucun** appareil à jour : sa sauvegarde serveur du Nutrition s'arrêtait sans qu'il puisse le savoir.

**La porte est PAR COMPTE** (`_nutAncienRefuse_`, décidée sous le verrou, selon l'état durable du compte — `_nutProtoDe_`) :

| Envoi | Compte SANS état v3 | Compte AVEC état v3 |
|---|---|---|
| ancien (ni `foodLogV` ni `requestId`) | **toléré** — le chemin d'avant (remplacement du journal avec copie de sécurité, P1), journalisé `[FT COMPAT] ancien client toléré` ; il ne pose jamais de marqueur | **son volet Nutrition est refusé en entier**, explicitement (`NUT_CLIENT_INCOMPATIBLE`, non réessayable), avant toute lecture ou écriture Nutrition ; **séances, records, pesées et réglages du même envoi sont enregistrés** (prouvé : `PA01c`, `PB18`, `PC20e`) |
| se dit à jour (`foodLogV ≥ 3`) **sans** `requestId` valide | refusé (il ne pourrait pas lire d'accusé) | refusé |
| à jour (`foodLogV ≥ 3` + `requestId` valide) | appliqué ; **pose le marqueur** | appliqué |

**L'état v3 d'un compte est PROUVÉ, jamais déclaré par le client** : le marqueur `nutProto`, posé **dans le même enregistrement que les données** par la 1ʳᵉ synchro à jour *appliquée* (donc durable avant que l'accusé ne parte — y compris quand cette synchro ne change rien :
un compte à jour qui n'a ni supprimé ni modifié n'a ni registre ni opération, **mesuré**), ou à défaut un registre non vide, une mémoire d'opérations non vide, une ligne déjà révisée. Ne comptent **pas** : `nutRev` (une écriture ancienne le fait monter) ni la zone de récupération (la voie ancienne en écrit aussi).
Le marqueur ne recule jamais (une restauration admin le conserve), n'est jamais posé par un envoi suspendu, refusé, en erreur ou ancien.

⚠️ **Un ancien client ne lit pas ce refus** (`no-cors`) : il n'affiche rien, et le seul message serveur qu'il lit au démarrage — le refus d'authentification — suspendrait **toute** sa sauvegarde : on ne s'en sert surtout pas. Son seul signal est la **mise à jour automatique de l'application**. ⛔ Ne jamais écrire qu'il « voit » ce refus.
Ce qu'il saisit reste sur son téléphone (mesuré avec le vrai client de production : aucune erreur, aucun repas perdu localement) et part à sa mise à jour.

**L'ordre d'intégration n'est plus une condition de sécurité.** À chaque instant, chaque compte est dans l'un des deux états et la règle de CE compte s'applique : *serveur d'abord* — aucun compte n'a d'état v3, les anciens clients sont tolérés jusqu'à la première synchro à jour ; *client d'abord* — l'ancien serveur ignore `foodLogV`, `requestId` et
`foodSupprimes`, ne pose aucun marqueur, et le téléphone ne confirme rien (un message honnête au plus toutes les 10 minutes si une suppression attend). Les quatre situations — ancien téléphone + ancien serveur (la production d'aujourd'hui) · nouveau téléphone + ancien serveur (E10) · ancien téléphone + serveur corrigé · nouveau + serveur corrigé — sont jouées par `nut_phasea02`.

**Le retour arrière sûr est de SUSPENDRE, jamais de régresser.** Propriété de script `NUT_SUSPENDU` (Paramètres du projet → Propriétés du script : instantané, sans redéploiement). Absente, vide, `0`, `false`, `non`, `off`, `no` = actif ; toute autre valeur = **suspendu** ; si la lecture échoue : suspendu. Suspendu, **tout** envoi qui porte du Nutrition (à jour comme ancien — aucun ne contourne) est refusé *avant* la moindre lecture ou écriture
Nutrition : `{status:'nut_refuse', ok:false, code:'NUT_SUSPENDU', retryable:true, profilEnregistre:true}`, aucun accusé, rien à ressusciter ni à écraser. Séances, records, pesées, réglages sont enregistrés. L'appareil garde ses opérations en attente, réessaie à temporisation croissante et ne le dit qu'une fois toutes les 3 heures.
La restauration admin reste possible **pendant la suspension** (acte conscient, jeton administrateur ; `handleAdminRestore_` lit et fusionne les masquages `hiddenFoods` sous le verrou, les plus récents du compte sont conservés) — **ligne obligatoire au journal d'exploitation** (`docs/EXPLOITATION-NUT-SUSPENSION.md` §8). Pour reprendre : retirer la propriété (ou `0`).
**Qui, et quelle trace — décision de Michel du 02/11/2026 (option A, `D-148`)** : activation et désactivation **réservées à l'administrateur autorisé**, avec un **journal d'exploitation MANUEL** — aucun code de traçabilité n'a été ajouté. La procédure pas à pas, la liste des personnes autorisées et le journal sont dans **`docs/EXPLOITATION-NUT-SUSPENSION.md`**.
⛔ **Redéployer l'ancien code serveur n'est PAS établi comme un retour arrière sûr** une fois que des comptes ont un état v3 : l'ancien code ne connaît ni le registre ni les révisions (non mesuré — à ne pas présenter comme sûr). Suspendre, puis corriger en avant.

1. **Publier** (client et serveur, dans n'importe quel ordre — voir plus haut). `clasp push` puis `clasp deploy -i` (règle d'or n°1), contrôle `?test=1`. ⚠️ Les contrôles automatiques après déploiement (`?test=1`, `authStatus`) **n'exercent ni `saveProfile` ni `LockService`** : voir 3.
2. **Surveiller** dans le journal du script : `[FT COMPAT]` — « ancien client toléré » (combien d'anciens téléphones restent actifs sur des comptes sans appareil à jour) et « Nutrition refusée » (un ancien téléphone sur un compte à jour) —, `[FT SUSPENSION]`, `[FT NUT_INTERNE]`, `[FT VERROU]` (détention ≥ 2 s), `[FT GARDE-FOU foodSupprimes]`, `[FT saveProfile] ERREUR`.
3. **Au premier déploiement seulement** (GO distinct, C7) : un essai manuel sur un compte JETABLE (une synchro à jour, puis un envoi ancien) et la vérification que `LockService` est bien autorisé (service refusé = `NUT_LOCK_BUSY` à tous les envois : rien d'écrit côté serveur, rien de perdu côté téléphone, mais plus rien ne se synchronise) ; relever la durée de détention réelle. Depuis la finalisation, une **exception du service de verrou** laisse une ligne `[FT VERROU] prise du verrou : exception du service — …` dans le journal d'exécution (sans donnée ni adresse ; le comportement est inchangé) : si elle apparaît, **ce n'est pas une contention, c'est le service qui échoue** — chaque envoi répond `NUT_LOCK_BUSY` et rien n'est enregistré, séances comprises, tant que la cause (autorisation, portées de `appsscript.json`) n'est pas traitée ; la suspension n'y change rien.
4. Phase B et STOCKAGE-COMPTES : **chantiers distincts**, après décision, jamais dans le même déploiement.

## 7. NON TESTÉ (et pourquoi)

Le vrai Apps Script (vrai `LockService` — premier usage dans ce code ; ses délais ; son autorisation), les vraies Script Properties et leurs plafonds, la latence Drive, le vrai
Supabase, l'iPhone, la lecture **réelle** de la propriété `NUT_SUSPENDU` par un vrai Apps Script, et la mise à jour automatique de l'application chez un vrai utilisateur : le conteneur n'atteint ni `script.google.com` ni le Worker (`CONNECT tunnel failed, 403`, mesuré). Les bancs jouent le **vrai `Code.js`** dans un moteur Node avec
des services Google simulés, de **vrais processus** avec un vrai verrou entre processus, et le **vrai client** dans Chromium.
