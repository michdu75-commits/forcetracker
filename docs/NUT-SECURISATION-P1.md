# 🛡️ NUT-SECURISATION-P1 — le journal alimentaire et les favoris ne perdent plus rien en silence

> **23/10/2026 · session-B (Claude Principal) · branche isolée `claude/nut-securisation-p1`.**
> **Option B validée par Michel le 23/10 (`D-108`)** : accepter les synchronisations, conserver séparément les anciennes
> entrées retirées ou corrigées, signaler les écrasements suspects, **aucune restauration automatique**.
> ⛔ **NON DÉPLOYÉ, NON FUSIONNÉ** (aucun GO de déploiement Apps Script ni de fusion master). Aucun journal réel lu ni
> modifié, aucune des 10 entrées de NUT-INVENTAIRE-02 restaurée. Ni Nutrition V2, ni Séance, ni moteur calorique ; routes
> A1 et carte A2 inchangées.
> ✅ *Les deux points qui attendaient Michel (§9) sont tranchés le 23/10* : stockage relevé dans l'app à **54 %** (268 Ko
> sur 500, écriture OK, sauvegarde du jour présente) et `D-109` **validée**. GO conditionnel de publication Apps Script donné.
> ⛔⛔ **PUBLICATION ARRÊTÉE le 23/10 à la vérification 5 de Michel (§10)** : un envoi de **favoris** refusé (`D-109`) peut
> être **perdu** si la personne appuie sur « Restaurer mon compte » pendant la panne de Drive. Rien n'est déployé ;
> décision de Michel attendue (`D-110`, proposé).

## 1. La cause exacte (mesurée, pas supposée)

`handleSaveProfile_` (Code.js) écrivait le journal et les favoris par `_pa_` :
`profile.foodLog = _pa_(body.foodLog, profile.foodLog)`. `_pa_` refuse un envoi **vide**, mais **tout envoi non vide
remplace la liste du serveur EN ENTIER**. Le client envoie toute sa liste locale à chaque synchronisation
(`_cloudSync`, `setup.js` : `foodLog.slice(-8000)`, `savedFoods.slice(0,200)`), et il ne relit jamais le serveur tant
que son stockage n'est pas vide (`autoConnect`). Donc **le dernier appareil qui écrit gagne**, ligne par ligne perdue :

- un appareil remis à zéro qui saisit un repas : **500 → 1** ;
- un appareil en retard (Safari et l'application iPhone ont des **stockages distincts**) : **40 → 30**, 60 → 51 ;
- deux appareils aux historiques différents : chacun efface les lignes de l'autre, en alternance ;
- les favoris : **20 → 1** ;
- un envoi qui n'est pas une liste (une chaîne) remplaçait le journal par cette chaîne.

Rejoué sur le vrai `Code.js` de master (banc B-NSP1) : **48 témoins rouges sur 74**. Les séances ont un garde-fou depuis
le 02/08 (seuil 30 lignes / 60 %) ; le journal et les favoris n'en avaient **aucun**. ⚠️ Ce seuil, appliqué tel quel,
**n'aurait vu ni 40 → 30 (75 % gardés), ni 20 → 1 (moins de 30), ni l'appareil en retard** : il ne suffit pas.

## 2. Ce qui est fait (branche isolée, `Code.js` seulement)

Une fonction, `_nutProtegerListe_`, remplace `_pa_` pour `foodLog` et `savedFoods` :

1. **L'envoi s'applique comme avant** : ajouts, corrections et suppressions passent — l'app reste maître de son journal,
   **rien n'est réintroduit d'office** dans le journal actif (une absence est ambiguë : suppression voulue ou écrasement).
2. **Mais avant, toute ligne du serveur absente de l'envoi, et l'ancienne version de toute ligne corrigée, est COPIÉE**
   dans une zone de récupération `recupNut`, **à la racine du compte** (pas dans `profile`) :
   - `loadProfile` (POST et GET, la restauration de l'app) ne la renvoie **jamais** ; `saveProfile` répond toujours
     `{status:"ok"}` ; les routes A1 ne lisent que `profile.foodLog` → **compteurs A1 identiques** avec ou sans zone ;
   - elle part dans la **même écriture** que le journal (une seule clé `u_`) : il n'existe aucun ordre où une ligne
     quitte le journal sans être déjà gardée ; si l'écriture échoue, ni l'un ni l'autre n'est à moitié écrit ;
   - la sauvegarde nocturne l'emporte **automatiquement** (elle recopie le compte entier).
3. **Appariement en trois temps** : même identifiant ET même contenu (cherché d'abord pour toutes les lignes : un
   identifiant en double par erreur retrouve sa copie identique, dans n'importe quel ordre) → même identifiant, contenu
   différent = **modifiée** → sans identifiant commun, **par le contenu en multi-ensemble** (les anciennes lignes
   changent d'identifiant d'un appareil à l'autre, NUT-INVENTAIRE-02 : ce n'est ni une suppression ni une alerte).
   Mêmes clés que l'audit A1 (`_nutIdLigne_`, `_nutEmpreinte_`).
4. **Pas de doublon** : un envoi répété ne recopie pas ce qu'un envoi précédent a déjà gardé ; deux repas identiques
   retirés ensemble restent **deux** copies.
5. **Bornée, et RIEN N'EST JAMAIS JETÉ** (condition 3 de Michel, finalisation du 23/10) — voir §3.
6. **Traçabilité sans donnée personnelle** : chaque écart est un événement daté (`evts`, 50 au plus : liste, avant, reçu,
   retirées, modifiées, copiées, déménagées, brutal, fichier, refus) et une ligne `[FT GARDE-FOU foodLog]` dans le journal
   d'exécution Apps Script — **des nombres et un nom de fichier, ni adresse ni aliment** (une adresse dans un message
   d'erreur de Drive est masquée).
7. **Rétrécissement brutal** (≥ 30 lignes et moins de 60 % gardées, le seuil des séances) : **marqué « brutal »,
   signalé, pas refusé** (option B).
8. **Envoi illisible** (chaîne, objet, nombre…) : ignoré, liste conservée (avant : stocké tel quel pour une chaîne).

## 3. La borne : ce qui déborde DÉMÉNAGE dans Drive, relu — jamais à la poubelle

**Le défaut trouvé en finalisant (mesuré : 12 témoins rouges sur la 1ʳᵉ version au moment de la découverte, 15 sur les 74 du banc final).** La zone était bornée en retirant ses
copies **les plus anciennes**, avec l'idée qu'elles étaient « dans les sauvegardes de la nuit ». **C'est faux** : un repas
saisi le matin et retiré l'après-midi n'est dans **aucune** sauvegarde. Rejoué : 10 repas du jour, deux écrasements avant
la nuit → **les 10 introuvables** ; favoris écrasés lot après lot → **340 favoris perdus**. La perte silencieuse qu'on
voulait fermer revenait par la borne.

**Ce qui est fait.** Bornes en caractères : **200 000 pour le journal** (≈ 520 repas : un écrasement **complet** du plus
gros journal réel, ≤ 491 lignes au 22/10, tient sans toucher Drive), **60 000 pour les favoris** (les 200 que l'app envoie
au plus). Au-delà :

1. les copies **les plus anciennes** sont écrites, jusqu'à ramener la zone à la **moitié** de sa borne (un fichier par
   débordement, pas un par synchronisation), dans un fichier `recup-nut-AAAA-MM-JJ-HHMMSS-xxxxxxxx.json` du
   **sous-dossier `recup-nut`** du dossier des sauvegardes (`ForceTracker-Backups/recup-nut/`) ; contenu :
   `{type:"recupNut", v, compte, liste, deplaceLe, entrees:[…]}` — le nom ne porte **aucune donnée personnelle** ;
2. le fichier est **RELU** et comparé à ce qui a été écrit ;
3. **seulement alors** les copies quittent la zone (compteur `deplacees`, événement avec le nom du fichier).

**Pourquoi un sous-dossier** (témoin rouge d'abord, NSP1-73) : la sonde `checkBackup` (Profil → Admin → Santé du système)
annonce le fichier **le plus récent** du dossier comme « dernière sauvegarde ». Un fichier de débordement écrit dans la
journée aurait **masqué une nuit sans sauvegarde** — exactement la panne de 36 jours que cette sonde surveille. Aucun
lecteur existant (`checkBackup`, audit A1, compteur de fichiers de la sauvegarde, fonctions de contrôle manuelles) ne
descend dans un sous-dossier ; l'audit A1 ne lit de toute façon que les fichiers `backup-…`.

**Si Drive refuse, ou relit autre chose** (`D-109`, proposé) : **l'envoi de cette liste est REFUSÉ** — le journal du
serveur et la zone restent tels quels, l'appareil garde les siens et renvoie à la synchronisation suivante ; un événement
`refus:"drive"` et une ligne `REFUSÉ` dans le journal d'exécution. **Retardé, jamais perdu.** C'est le seul cas où
l'option B n'accepte pas un envoi : l'accepter imposerait de jeter des copies (contraire à la condition 3) ou de laisser
la zone dépasser sa borne pendant une panne de Drive (risque pour le stockage partagé, cf. §5).

## 4. Les suppressions volontaires — ce qui se passe exactement

| Cas | Journal actif | Zone de récupération |
|---|---|---|
| Une entrée supprimée | supprimée (respecté) | la ligne est gardée, « retirée » |
| Suppression importante voulue (100 → 50) | appliquée, **rien n'est bloqué** | les 50 gardées, événement « brutal » |
| La dernière entrée (envoi vide) | ⚠️ **inchangé** : la règle existante « le vide ne gagne jamais » tient | rien |
| Renvoi de la même liste | inchangé | rien recopié |
| Zone pleine | appliquée | le surplus le plus ancien déménage dans `recup-nut/` (relu) |
| Zone pleine **et** Drive indisponible | ⚠️ **inchangé** (envoi refusé, renvoyé plus tard) | inchangée, événement `refus` |

⚠️ **Limite connue, inchangée** : supprimer la **dernière** entrée n'atteint pas le serveur (un envoi vide est
indiscernable d'un appareil neuf). Elle revient à la prochaine restauration. Seule une marque de suppression posée par
l'app (P3, client) lèverait l'ambiguïté.
⚠️ **Confidentialité** : une ligne supprimée volontairement reste conservée côté serveur — dans la zone, puis dans un
fichier `recup-nut/` — comme elle l'est déjà dans les sauvegardes nocturnes. **Aucune suppression automatique** (même
règle que les sauvegardes : jamais supprimé, jamais écrasé).

## 5. Capacité du stockage (condition 1)

- **Le plafond** : les comptes vivent dans les Script Properties, **512 000 octets pour TOUT le stockage** (panne du
  29/07 à 102 %). La zone vit dans le compte : elle compte dans ce plafond. Les fichiers `recup-nut/` sont dans Drive :
  ils n'y comptent pas.
- **Mesuré (vraie compression du vrai `_packUser_`)** : compte de 500 repas ≈ **30 200 octets** stockés ; zone **pleine**
  sur les deux listes, pire cas du banc (noms aléatoires) ≈ **48 200 octets** de plus par compte (NSP1-72, garde : < 70 000) ;
  avec des valeurs entièrement aléatoires (mesure hors dépôt) ≈ **63 000**. Une zone ne se remplit que par des
  suppressions, des corrections ou des écrasements.
- **Comptes concernés aujourd'hui** (INV-02, 23/10) : 13 comptes, **2 avec un journal**, 1 avec des favoris → pire cas
  ≈ **2 × 63 000 ≈ 126 000 octets (≈ 25 points)**, atteint seulement si les deux zones se remplissent entièrement.
- **Le remplissage réel n'est PAS lisible depuis une session Claude** : `script.google.com` est refusé par le mandataire
  réseau (`CONNECT tunnel failed, response 403`, revérifié le 23/10), et les sauvegardes sont dans le Drive du compte
  forcetracker.app, pas dans celui connecté (recherche Drive : 0 fichier `backup-…`). Aucun workflow ne lit `storeHealth`.
  → **Michel le lit en 30 secondes** : Profil → Admin → Surveillance → **Santé du système** (pourcentage plein).
- **Seuil** : **≤ 55 %** → déploiement sûr même dans le pire cas (≤ 80 % après). **56–70 %** → réduire d'abord la borne
  du journal (100 000 caractères, une constante + une nouvelle passe). **> 70 %** → ne pas déployer : le stockage est déjà
  le problème (le vrai remède, déjà écrit : déménager les comptes sur Drive).

## 6. Tests

- **Banc B-NSP1** (`tests/parcours/nut_secu_p1.js`, `tools/banc_nut_secu_p1.js`) : vrai `Code.js` par `doPost`/`doGet`,
  vraie compression, Drive en mémoire **avec sous-dossiers et pannes injectées** (création refusée, relecture tronquée),
  données inventées (example.test), garde réseau. **74 / 0** sur la branche ; **48 rouges** sur le `Code.js` de master ;
  la 1ʳᵉ version (éviction) : **15 rouges** ; la version intermédiaire (fichiers à côté des sauvegardes) : **1 rouge**
  (NSP1-73). Couvre : 500 → 1 · 40 → 30 · deux appareils · iPhone/Safari · ajout depuis un appareil en retard ·
  modification · suppressions · favoris 20 → 1 · envoi répété · identifiants absents, instables, en double · données
  invalides · isolement entre comptes · zone jamais renvoyée · A1 inchangé · sauvegarde nocturne · écriture atomique ·
  **débordement avant la sauvegarde de la nuit (repas du jour)** · **écrasements répétés (5 appareils × 3 tours)** ·
  **favoris au-delà de la borne** · **Drive en panne, relecture altérée, puis rétabli** · **fuzz 8 graines × 60 étapes**
  (bornes réduites, pannes au hasard, restaurations, sauvegardes : « aucune version passée par le serveur n'est jamais
  perdue ») · **capacité d'une zone pleine** · **sonde `checkBackup` non trompée**.
- **Contrôle négatif** (`tools/mut_nut_secu_p1.py`) : **37 / 37 mutations conformes** (dont le code de master, le surplus
  jeté sans Drive, aucune relecture, Drive en panne accepté, nom « backup-… », adresse dans le nom, décalage d'une ligne,
  sans hystérésis, borne doublée, fichiers à côté des sauvegardes ; un commentaire modifié reste vert).
- **Voisins** (vrai `Code.js`) : sec_admin 69/0 · auth_cloud_closure 9/0 · auth_signup_strict 8/0 · coach_memoire 28/0 ·
  d021_activite 42/0 · pots_nutrition 48/0 · nut_inventaire_admin 20/0 · chaos 56/0 (PostgreSQL local, fuzz
  multi-appareils) · banc HTTP A1 29/0 (hors dépôt).
- **Passe complète D-031 unique** sur l'arbre final : **7917 ✅ / 0 ❌** sur `db8699cc` (arbre `87002186`), 4 conditions vertes (07:58 → 09:29 UTC) ; depuis, documentation seulement.

## 7. Ce que ça ne fait pas (risque résiduel)

- **La relecture Drive réelle n'est pas éprouvée** : `createFile` (sauvegardes de la nuit) et `getBlob().getDataAsString()`
  depuis `doPost` (audit A1, 157 fichiers lus le 23/10) tournent en production, mais **pas encore ensemble dans
  `saveProfile`**, ni la création du sous-dossier. Si elle échouait toujours : aucun envoi perdu, mais les envois qui font
  déborder la zone seraient refusés (`REFUSÉ` dans le journal d'exécution).
- **Aucune résolution contrôlée encore** : la zone se lit dans la sauvegarde nocturne, le surplus dans `recup-nut/` ; une
  route Admin de lecture / restauration ligne à ligne (P2, avec l'accord de Michel) reste à faire. **Aucun écran** ne montre
  encore les événements (le signal vit dans le compte et le journal d'exécution).
- **Deux envois simultanés** : aucun verrou dans `Code.js` (défaut préexistant). Mesuré (NSP1-54/55) : aucune ligne
  **déjà au serveur** n'est perdue, mais un repas **ajouté** par le premier manque au serveur jusqu'à la prochaine
  synchronisation de son appareil. Deux débordements simultanés peuvent créer deux dossiers `recup-nut` (aucune perte :
  P2 devra lire les deux).
- **`adminRestore`** (route manuelle, aucun bouton) remplace le compte entier, zone comprise (les fichiers `recup-nut/`
  restent).
- **Le seuil « brutal »** n'étiquette que l'extrême ; la protection, elle, ne dépend pas de lui.
- **Temps** : un débordement ajoute une écriture et une relecture Drive (non mesuré en production).

## 8. Retour arrière

Remettre le `Code.js` de master (`git revert` des commits fonctionnels) et redéployer Apps Script. Les données écrites
entre-temps restent : l'ancien code **conserve** les champs racine qu'il ne connaît pas (`recupNut` reste dans le compte
et dans les sauvegardes, simplement plus alimenté) ; les fichiers `recup-nut/` restent dans Drive, lus par personne.
Le journal actif n'a pas changé de forme. Aucune migration.

## 9. Le GO exact nécessaire

1. **Michel lit Santé du système** (§5) : ≤ 55 % → on continue ; au-delà, la réponse du §5.
2. **Michel confirme `D-109`** (envoi refusé seulement si la zone déborde ET que Drive ne garde pas le surplus) — ou en
   choisit une autre.
3. **GO explicite de déploiement Apps Script seul** (`Code.js` ; aucun fichier de l'app, aucune version `ft-vNN`) —
   même procédure que A1 (22/10). Après : `?test=1` online, `authStatus`, puis un premier relevé des événements de zone
   à la sauvegarde de la nuit suivante.

**État au 23/10** : 1 ✅ (54 %) · 2 ✅ (`D-109` validée) · 3 : GO conditionnel donné, **non exercé** — arrêt à la
vérification 5 (§10).

## 10. ⛔ Vérification 5 avant publication (23/10) — publication ARRÊTÉE

**La question de Michel** : *quand une liste est refusée par le garde-fou, reste-t-elle sur l'appareil pour être
retransmise, ne peut-elle pas être effacée par un faux succès, et aucune perte silencieuse ne peut-elle en découler ?*
« Si le point 5 révèle un risque réel de perte : STOP. Ne pas publier. »

**Ce que dit le code de l'app** : la synchronisation part en `no-cors` — l'app ne lit **aucune** réponse, n'efface rien
après l'envoi et renvoie ses listes entières à la synchronisation suivante : **un faux succès ne peut rien effacer**. Mais
les deux listes ne se restaurent pas pareil : le journal est **fusionné** (`_fusionnerFoodLogRestauration`, le téléphone
gagne), les favoris sont **remplacés** (`_applyRestoreData` : `S.savedFoods=d.savedFoods`). Portes de restauration :
« 🔄 Restaurer mon compte depuis le cloud » (Profil, **visible par tous**), « Restaurer depuis mon email » (Admin),
l'inscription d'un compte existant, et la restauration automatique d'un appareil sans séance, record ni programme.

**Le banc bout en bout** (hors dépôt, `/tmp/claude-0/-home-user-forcetracker/12f61d67-fd14-50ef-8709-99418240fb44/scratchpad/pub_p1/e2e_refus_v2.js`) : vraie app (Chromium) ↔ vrai `Code.js`
(vm, Drive en mémoire, panne injectée), compte **protégé par un code perso** (la lecture stricte refuse sinon
`loadProfile` : la 1ʳᵉ version du banc ne restaurait donc jamais — un vert qui ne prouvait rien), données inventées.
L'appareil porte 3 retraits, 2 modifications et 4 ajouts ; Drive est en panne **dès l'ouverture** ; puis « Restaurer ».

| Variante | Envoi pendant la panne | Après « Restaurer » | Introuvables (appareil · serveur · zone · Drive) |
|---|---|---|---|
| **Branche P1** (`db8699cc`) | les deux listes **refusées** (`D-109`) | journal : tout gardé · **favoris : 0/4 neufs, 0/2 modifiés** | journal **0** · **favoris 6** ⛔ |
| Témoin : branche P1, **Drive OK** | acceptées | tout gardé | **0** |
| Comparaison : **master = prod @192** | acceptées (remplacées) | tout gardé | neufs 0 · **anciennes versions : 5 + 5** (le défaut que P1 corrige) |
| Prototype **FIX-A′** (serveur : favoris jamais refusés) | favoris acceptés, journal refusé | tout gardé | **0** |
| Prototype **FIX-B** (app : la restauration fusionne les favoris) | les deux refusées | tout gardé (+ 3 favoris retirés revenus) | **0** |

**Conclusion** : la garantie « aucune perte silencieuse » **ne tient pas pour les favoris** pendant une fenêtre de refus.
Il faut trois conditions réunies (zone des favoris au-delà de sa borne, Drive indisponible à ce moment, restauration avant
la synchronisation suivante acceptée) — c'est rare, **mais c'est une perte réelle et silencieuse**. Conformément à la
consigne : **non publié**. Le journal alimentaire, lui, ne perd rien (les repas retirés reviennent après une
restauration : c'est la fusion existante, pas une perte).

**La correction minimale** (`D-110`, à trancher par Michel) : **FIX-A′**, `Code.js` seul, 6 lignes — pour les favoris, une
panne de Drive ne refuse plus l'envoi, la zone garde tout au-delà de sa borne jusqu'au prochain déménagement réussi. Elle
reste dans le périmètre Apps Script, mais rouvre une alternative que `D-109` avait écartée. **FIX-B** (app, une ligne)
traite la cause côté restauration et couvre aussi le cas préexistant, mais demande une version de l'app. Après la
décision : tests ciblés (B-NSP1 adapté + contrôle négatif), puis **une** passe complète D-031, puis publication.

**Vérifications 1-4 et 6, faites** : master `32bea1ef` (seul le journal de partage a changé depuis la base `c34d928c`) ·
`Code.js` de master = celui de la prod @192 (run n°123, `236764c5`) · `Code.js` de la branche = celui testé (`db8699cc`,
passe 7917/0) · différence = P1 seul, aucun fichier de l'app · B-NSP1 rejoué **74 / 0** · retour arrière sûr : l'ancien
code garde `recupNut` dans le compte sans jamais le renvoyer (`loadProfile` liste ses champs un par un).

---

## 11. ↪️ Intégration avec Nutrition V2 et `D-110` (23/10, branche `claude/nut-v2-p1-integration`) — NON DÉPLOYÉ

- **FIX-A′ écrit** (`19b87ffb`, `Code.js` seul) : pour les **favoris**, une panne de Drive au débordement ne refuse plus
  l'envoi — rien ne sort de la zone, elle attend au-delà de sa borne jusqu'à un **plafond** de 120 000 caractères (deux
  fois la borne), événement `differe:'drive'` ; au-delà du plafond, le refus de `D-109` revient. Le journal garde `D-109`.
- **Éprouvé** sur les sept points demandés par Michel (saturation, dépassements successifs, pannes longues, envois
  concurrents, restaurations pendant et après la panne, intégrité, retour arrière) : NSP1-75 → NSP1-82, banc croisé B-NIX
  (vraie app V2 ↔ vrai `Code.js`), `tools/preuve_retour_arriere_d110.js`. Détail et chiffres :
  `docs/INTEGRATION-NUT-V2-P1.md` §4.
- **Retour arrière (complète le §8)** : prouvé — le `Code.js` de @192 relit et réécrit un compte dont la zone des favoris
  dépasse sa borne, sans la renvoyer à l'app et en la gardant à l'octet ; redéployé en avant, rien n'est perdu.
- **Risque résiduel** : au-delà du plafond (panne prolongée ET centaines de versions changées). Fermé côté appareil par
  `D-112` (proposé : « Restaurer » ajoute les favoris au lieu de les remplacer).
- ⛔ **Statut** : `D-110` reste **PROPOSÉ** — sa validation par Michel est la condition de tout déploiement Apps Script.

---

## Annexe — le texte d'avant la finalisation, gardé tel quel (R30)

> Écrit le 23/10 vers 01:40 UTC, **avant** la décision de Michel (option B, `D-108`) et avant que la borne ne soit corrigée
> (la 1ʳᵉ version retirait les copies les plus anciennes — §3 ci-dessus). Remplacé par les sections ci-dessus ; conservé
> parce qu'un document s'ajoute, il ne s'écrase pas.


> **23/10/2026 · session-B (Claude Principal) · GO limité de Michel : branche isolée `claude/nut-securisation-p1`.**
> ⛔ **NON DÉPLOYÉ, NON FUSIONNÉ.** Aucun journal réel lu ni modifié, aucune des 10 entrées de NUT-INVENTAIRE-02
> restaurée. Ni Nutrition V2, ni Séance, ni moteur calorique ; routes A1 et carte A2 inchangées.
> **Une décision reste ouverte** (§5) : elle conditionne l'arbre final, donc la passe complète D-031 et le GO de
> déploiement.

## 1. La cause exacte (mesurée, pas supposée)

`handleSaveProfile_` (Code.js) écrivait le journal et les favoris par `_pa_` :
`profile.foodLog = _pa_(body.foodLog, profile.foodLog)`. `_pa_` refuse un envoi **vide**, mais **tout envoi non vide
remplace la liste du serveur EN ENTIER**. Le client envoie toute sa liste locale à chaque synchronisation
(`_cloudSync`, `setup.js` : `foodLog.slice(-8000)`, `savedFoods.slice(0,200)`), et il ne relit jamais le serveur tant
que son stockage n'est pas vide (`autoConnect`). Donc **le dernier appareil qui écrit gagne**, ligne par ligne perdue :

- un appareil remis à zéro qui saisit un repas : **500 → 1** ;
- un appareil en retard (Safari et l'application iPhone ont des **stockages distincts**) : **40 → 30**, 60 → 51 ;
- deux appareils aux historiques différents : chacun efface les lignes de l'autre, en alternance ;
- les favoris : **20 → 1** ;
- un envoi qui n'est pas une liste (une chaîne) remplaçait le journal par cette chaîne.

Rejoué sur le vrai `Code.js` de master (banc B-NSP1) : **32 témoins rouges sur 56**. Les séances ont un garde-fou depuis le 02/08
(seuil 30 lignes / 60 %) ; le journal et les favoris n'en avaient **aucun**. ⚠️ Ce seuil, appliqué tel quel, **n'aurait
vu ni 40 → 30 (75 % gardés), ni 20 → 1 (moins de 30), ni l'appareil en retard** : il ne suffit pas.

## 2. Ce qui est fait (branche isolée, `Code.js` seulement)

Une fonction, `_nutProtegerListe_`, remplace `_pa_` pour `foodLog` et `savedFoods` :

1. **L'envoi s'applique comme avant** : ajouts, corrections et suppressions passent — l'app reste maître de son journal,
   **rien n'est réintroduit d'office** dans le journal actif (une absence est ambiguë : suppression voulue ou écrasement).
2. **Mais avant, toute ligne du serveur absente de l'envoi, et l'ancienne version de toute ligne corrigée, est COPIÉE**
   dans une zone de récupération `recupNut`, **à la racine du compte** (pas dans `profile`) :
   - `loadProfile` (POST et GET, la restauration de l'app) ne la renvoie **jamais** ; `saveProfile` répond toujours
     `{status:"ok"}` ; les routes A1 ne lisent que `profile.foodLog` → **compteurs A1 identiques** avec ou sans zone ;
   - elle part dans la **même écriture** que le journal (une seule clé `u_`) : il n'existe aucun ordre où une ligne
     quitte le journal sans être déjà gardée ; si l'écriture échoue, ni l'un ni l'autre n'est à moitié écrit ;
   - la sauvegarde nocturne l'emporte **automatiquement** (elle recopie le compte entier).
3. **Appariement en trois temps** : même identifiant ET même contenu (cherché d'abord pour toutes les lignes : un
   identifiant en double par erreur retrouve sa copie identique, dans n'importe quel ordre) → même identifiant, contenu
   différent = **modifiée** → sans identifiant commun, **par le contenu en multi-ensemble** (les anciennes lignes
   changent d'identifiant d'un appareil à l'autre, NUT-INVENTAIRE-02 : ce n'est ni une suppression ni une alerte).
   Mêmes clés que l'audit A1 (`_nutIdLigne_`, `_nutEmpreinte_`).
4. **Pas de doublon** : un envoi répété ne recopie pas ce qu'un envoi précédent a déjà gardé ; deux repas identiques
   retirés ensemble restent **deux** copies.
5. **Bornée, et jamais en silence** : 200 000 caractères pour le journal (≈ 530 repas ≈ 30 000 octets stockés : un
   écrasement **complet** du plus gros journal réel, ≤ 491 lignes au 22/10), 60 000 pour les favoris (les 200 que l'app
   envoie au plus). Au-delà, ce sont les copies **les plus anciennes** qui partent (elles sont dans les sauvegardes de la
   nuit ; les plus récentes, non) — et c'est **compté** (`coupees`). 50 événements au plus.
6. **Traçabilité sans donnée personnelle** : chaque écart est un événement daté (`evts` : liste, avant, reçu, retirées,
   modifiées, copiées, coupées, brutal) et une ligne `[FT GARDE-FOU foodLog]` dans le journal d'exécution Apps Script —
   **des nombres, ni adresse ni aliment**.
7. **Rétrécissement brutal** (≥ 30 lignes et moins de 60 % gardées, le seuil des séances) : **marqué « brutal »,
   signalé, pas refusé** — le refus est la décision ouverte du §5.
8. **Envoi illisible** (chaîne, objet, nombre…) : ignoré, liste conservée (avant : stocké tel quel pour une chaîne).

## 3. Les suppressions volontaires — ce qui se passe exactement

| Cas | Journal actif | Zone de récupération |
|---|---|---|
| Une entrée supprimée | supprimée (respecté) | la ligne est gardée, « retirée » |
| Suppression importante voulue (100 → 50) | appliquée, **rien n'est bloqué** | les 50 gardées, événement « brutal » |
| La dernière entrée (envoi vide) | ⚠️ **inchangé** : la règle existante « le vide ne gagne jamais » tient | rien |
| Renvoi de la même liste | inchangé | rien recopié |

⚠️ **Limite connue, inchangée** : supprimer la **dernière** entrée n'atteint pas le serveur (un envoi vide est
indiscernable d'un appareil neuf). Elle revient à la prochaine restauration. Seule une marque de suppression posée par
l'app (P3, client) lèverait l'ambiguïté.
⚠️ **Confidentialité** : une ligne supprimée volontairement reste conservée côté serveur dans la zone (comme elle l'est
déjà dans les sauvegardes nocturnes) jusqu'à éviction par la borne.

## 4. Tests

- **Banc B-NSP1** (`tests/parcours/nut_secu_p1.js`, `tools/banc_nut_secu_p1.js`) : vrai `Code.js` par `doPost`/`doGet`,
  vraie compression, données inventées (example.test), garde réseau. **56 / 0** sur la branche ; **32 rouges** sur le
  `Code.js` de master. Tous les cas de la mission : 500 → 1 · 40 → 30 · deux appareils · iPhone/Safari · ajout depuis un
  appareil en retard · modification · suppression d'une entrée, importante, de la dernière · favoris 20 → 1 · envoi
  répété · identifiants absents, instables, en double · données incomplètes ou invalides · isolement entre comptes
  (jeton A + adresse B écrit A ; écriture refusée = rien écrit) · zone jamais renvoyée · A1 inchangé · sauvegarde
  nocturne · écriture atomique · borne.
- **Contrôle négatif** (`tools/mut_nut_secu_p1.py`) : **23 / 23 mutations conformes** (dont le code d'avant, et un
  commentaire modifié qui reste vert).
- **Voisins** (vrai `Code.js`) : sec_admin 69/0 · auth_cloud_closure 9/0 · auth_signup_strict 8/0 · coach_memoire 28/0 ·
  d021_activite 42/0 · pots_nutrition 48/0 · backup_fuseau 7/0 · quota_double 12/0 · chaos 56/0 (PostgreSQL local,
  fuzz multi-appareils) · banc HTTP A1 29/0 (hors dépôt).
- **Mesures** : compte de 500 repas ≈ 30 000 octets stockés ; zone pleine + journal rétabli ≈ 60 600 (sur 512 000 pour
  TOUT le stockage) ; journal de 8 000 lignes : ~0,3 s de plus par synchronisation (Node).

## 5. ⛔ La décision ouverte — que faire d'un rétrécissement BRUTAL ?

| Option | Ce qu'elle fait | Pour | Contre |
|---|---|---|---|
| **B (codée)** | appliquer + tout copier + signaler | rien ne se perd ; les suppressions voulues passent ; aucune ambiguïté tranchée | le journal actif du serveur peut montrer 1 ligne jusqu'à la resynchronisation de l'appareil principal (une restauration sur un appareil neuf, pendant ce temps, aurait 1 ligne — les 500 restent dans la zone) |
| **A** (comme les séances) | refuser l'envoi brutal | le journal actif reste complet | une suppression massive voulue est bloquée ; les vrais ajouts de l'appareil refusé ne montent pas (à garder « en attente ») ; l'appareil reste désynchronisé sans le savoir (aucun écran ne le dit) |
| **A′** | refuser seulement l'extrême (ex. ≥ 100 lignes et < 10 % gardées) | couvre 500 → 1 sans toucher 100 → 50 | mêmes contre que A, sur moins de cas ; un seuil de plus à justifier |
| **C** (union) | réintroduire les lignes absentes | rien ne disparaît du journal actif | **réintroduit des suppressions peut-être voulues** — contraire à la consigne |

**Recommandation : B** — sans nouvelle décision sur les suppressions, aucune perte, aucune ambiguïté tranchée en silence.
A′ ne devient utile que si l'on veut que le journal **actif** du serveur reste complet pendant la fenêtre d'écrasement ;
elle demanderait alors l'état « en attente » et, idéalement, un message dans l'app.

## 6. Ce que ça ne fait pas (risque résiduel)

- **Aucune réparation** : les 10 entrées de NUT-INVENTAIRE-02 ne sont pas restaurées ; rien de l'existant n'est réécrit.
- **Aucune résolution contrôlée encore** : la zone se lit aujourd'hui dans la sauvegarde nocturne ; une route Admin de
  lecture / restauration ligne à ligne (P2, avec l'accord de Michel) reste à faire.
- **Deux envois simultanés** : aucun verrou dans `Code.js` (défaut préexistant). Mesuré (NSP1-54/55) : aucune ligne
  **déjà au serveur** n'est perdue (le calcul du second les garde), mais un repas **ajouté** par le premier manque au
  serveur jusqu'à la prochaine synchronisation de son appareil (il reste sur cet appareil).
- **`adminRestore`** (route manuelle, aucun bouton) remplace le compte entier, zone comprise.
- **Le seuil « brutal »** ne marque ni 40 → 30, ni 20 → 1, ni les petits journaux : il n'étiquette que l'extrême ; la
  protection, elle, ne dépend pas de lui.
- **Stockage** : la zone ajoute au plus ≈ 30 000 + 8 000 octets par compte au réservoir de 512 000 (≈ 2 comptes ont un
  journal aujourd'hui). ⚠️ Lire **Profil → Admin → Santé du système** (remplissage) avant le déploiement.

## 7. Retour arrière

Remettre le `Code.js` de master (`git revert` du commit fonctionnel) et redéployer Apps Script. Les données écrites
entre-temps restent : l'ancien code **conserve** les champs racine qu'il ne connaît pas (`recupNut` reste dans le compte
et dans les sauvegardes, simplement plus alimenté). Le journal actif n'a pas changé de forme. Aucune migration.

## 8. Le GO exact nécessaire

1. **Décision sur le §5** (B, A ou A′).
2. Sur l'arbre final : passe complète D-031 (4 conditions), puis **GO explicite de déploiement Apps Script seul**
   (`Code.js` ; aucun fichier de l'app, aucune version `ft-vNN`, pas de Pages).
3. Avant : lire le remplissage du stockage (Santé du système). Après : `?test=1` online, `authStatus`, et un premier
   relevé des événements de zone à la prochaine sauvegarde nocturne.
