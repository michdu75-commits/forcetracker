# 🛡️ NUT-SECURISATION-P1 — le journal alimentaire et les favoris ne perdent plus rien en silence

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
