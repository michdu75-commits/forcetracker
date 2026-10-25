# 🔎 Contre-vérification de l'audit transversal Séance (ChatGPT, 23/10/2026)

> **Session-C (Claude Séance) · 23/10/2026 · branche `claude/dreamy-bell-pu88ia` · PHASE 1 : analyse seule.**
> Aucune ligne de code applicatif modifiée, aucune fusion, aucune publication, aucune donnée réelle (décision de Michel :
> *« Première phase : analyse, vérification et rapport. Aucune correction, fusion ni publication sans mon accord. »*).
> Destinataires : Michel, puis **Claude Principal** (contre-vérification et coordination) et **Claude Nutrition** (§5).
> Audit vérifié : les trois documents du 23/10 (« Audit transversal Séance », « Matrice de recette & index des fonctions »,
> « Index code des fonctions »), master audité `57553711`.

## 0. La réponse, en clair

- **L'audit est solide.** Sur ses 20 constats : **15 confirmés** (dont 2 avec une nuance importante), **1 confirmé mais
  connu et voulu** (records, F08), **2 faits confirmés mais conclusion infirmée** (F11, F14), **1 non vérifiable ici**
  (iPhone, F18), **1 état confirmé** (le blocage de Claude Principal, F20). Aucun constat n'est faux sur les faits ;
  deux conclusions le sont.
- **Les deux vrais bugs à corriger d'abord** : le **calendrier** compte un exercice unilatéral à moitié (F01), et
  **« Enregistrer » une séance sans rien changer** divise son volume unilatéral par deux **et** recalcule ses calories
  avec le poids du jour (F02 + un complément trouvé ici). C'est la famille déjà connue de `BUGS.md` §85 (« une copie
  de la règle de volume ») : §85 en a corrigé une copie, **deux autres sont restées**.
- **Rien de grave côté perte de données** : tous les cas de la matrice qui **protègent les données** passent (séance
  vide refusée, double « Terminer » = une seule séance, remplacement d'exercice sans hériter des charges, stockage plein
  sans perte, séance non marquée « synchronisée » tant que le serveur n'a pas dit OK, débrief supprimé avec sa séance
  seulement). Ceux qui sont en écart sont des cas de **chiffres** (que la matrice classe aussi P0) : F01, F02, F03, F05,
  F08.
- **Deux constats nouveaux** (hors audit), mesurés : corriger la **durée** d'une séance ne recalcule pas ses calories
  (317 kcal affichées pour 90 min au lieu de 440), et **efface en silence** une modification pas encore enregistrée
  dans le même écran.
- **Plusieurs points demandent une décision de Michel**, pas un correctif technique : étiquette « Primaires » (F04),
  muscles perso contre règles génériques (F05), records après suppression (F08), score de récupération sans sommeil
  (F19), tuile Nutrition à plusieurs séances (F06), et tout ce qui touche le moteur calorique (F09–F12).

## 1. Ce qui a été vérifié, sur quoi, comment

| | |
|---|---|
| **Arbres** | master `4ab7f860` — code applicatif **identique** à `57553711` (l'arbre audité : seul le journal de partage a changé depuis) · branche `7f359f15` (38 commits d'avance, 0 de retard). **Chaque scénario rend exactement les mêmes chiffres sur les deux arbres** : ce que la branche ajoute (repos persistant, vignettes) ne touche aucun calcul audité. |
| **Reproductions** | 3 bancs écrits pour cet audit (`tools/contre_verif_seance_2026_10_23/`) : la **vraie app** servie en local, ses **vraies fonctions**, **réseau coupé** (garde + routes locales seules), **données fictives**, un contexte neuf par scénario — **26 scénarios**. Ce qui est simulé est dit dans chaque scénario (toast enregistré, `fetch` simulé pour la synchro, quota simulé pour le stockage plein, `prompt` répondu comme la personne). |
| **Contrôles négatifs** | **6 contre-épreuves** (`contre_epreuves.py`) : une copie de master où **seule la ligne suspecte** est corrigée → le défaut **disparaît** dans le même scénario (F01, F02, F03, F05, F06, F07). Un défaut qui ne bascule pas quand on corrige sa cause présumée ne serait pas prouvé. |
| **Bancs existants rejoués** | sur `7f359f15` : **20 bancs Séance, 920 témoins, 0 rouge** + runners calendrier 10/0, muscles 241/241, calculs 339/0 (liste en annexe A) — et les témoins de la dernière passe complète D-031 (**7 923 / 0** sur `756c97a3`, valide aux 4 conditions) pour les cas de la matrice qu'ils couvrent. |
| **Vérifications déléguées** | calories (F09–F13, §5, C01–C09) et catalogue/images (F14–F17, D01–D10, index) confiées à deux agents ; **j'ai rejoué moi-même leurs preuves décisives** (`harnais3.js`, `catalogue_verif.js`, `tuiles.js`). Un chiffre marqué *(délégué)* vient de leur mesure et n'a pas été rejoué par moi. |
| **Non vérifiable ici** | iPhone réel (Safari/WebKit, clavier iOS, bande d'appel, safe-area), données réelles, physiologie (aucune mesure métabolique), valeurs du Compendium : `pacompendium.com` est **inaccessible** depuis la session — `curl` → `CONNECT tunnel failed, response 403` (le proxy refuse le domaine), `WebFetch` → `getaddrinfo ENOTFOUND`. |

## 2. Classement des 20 constats

Priorités proposées : **P0** perte de données ou écriture fausse irréversible (aucun trouvé) · **P1** un chiffre faux
écrit ou montré dans un parcours courant, ou deux écrans qui se contredisent sur le même fait · **P2** cas plus rare,
ou correction qui demande une décision de Michel · **P3** invisible pour la personne (code mort, cache, commentaire).
Lignes : master `4ab7f860` (= `57553711`).

| # | Verdict | Preuve mesurée (vraie app) | Où | Prio | Décide |
|---|---|---|---|---|---|
| **F01** tonnage unilatéral au calendrier | ✅ **CONFIRMÉ** | Séance : Arraché Haltère 30 kg × 10 « par bras » + Développé Couché 100 × 5. Enregistrée **1 100 kg**, cartes 1 100, panneau du jour **« 0,8 t »**. Contre-épreuve (`_calSessVol` → `_workVol`) : **« 1,1 t »** ; l'ancienne séance sans `uniConv` reste **600** (pas de doublement rétroactif). | `screens.js:2220` | **P1** | technique |
| **F02** « Enregistrer » divise le volume | ✅ **CONFIRMÉ** | Ouvrir la séance, « 💾 Enregistrer » **sans rien changer** : **600 → 300** (carte « 300 kg de travail »), pendant que `_workVol` — que lisent le résumé de la semaine et le bilan du mois (`app.js:9248`, `:9300`) — dit toujours 600 : deux écrans en désaccord. Bilatéral : 500 → 500. Contre-épreuve (`_workVol`) : 600 reste 600. | `setup.js:1693` | **P1** | technique |
| ↳ **complément** (hors audit) | ✅ **CONFIRMÉ** | Le **même** « Enregistrer » sans changement recalcule les calories avec le poids **du jour** : séance faite à 82 kg, poids passé à 95 kg → **97 → 112 kcal**. Les deux violent l'attendu de la matrice R-02 / B02 (*« aucun chiffre ne doit changer sans raison »*). | `setup.js:1709` | **P1** | technique |
| **F03** séries « W » dans le volume par muscle | ✅ **CONFIRMÉ**, portée limitée | N, N, É, **W** → **3** séries de pectoraux au lieu de 2 ; Milo reçoit **« 1,5 séries/semaine »** au lieu de 1. Contre-épreuve (`&&type!=='W'`) : 2 et 1. Le type W ne s'écrit plus (migration W→É, l'import convertit W→É) mais **revient par la restauration d'un ancien compte** (`log.js:1726`). Le fait « groupes (30 j) » du registre exclut déjà W : deux règles. | `log.js:4670` | P2 | technique |
| **F04** « Primaires » par cumul de secondaires | ✅ **CONFIRMÉ** | Triceps **secondaire** sur Développé Couché + Développé Couché Haltères → score 2 → listé **« Primaires »** et **rouge** (8 zones rouges contre 6 avec un seul exercice). | `log.js:4844-4851`, `setup.js:1731` | P2 | **Michel** (la figurine est le vocabulaire de l'app, R31) |
| **F05** règle générique avant les muscles choisis | ✅ **CONFIRMÉ** | « Curl Maison Zorglub » (perso, muscles cochés : quadriceps) → figurine **biceps** (règle `_MEX`), Progrès **quadriceps** (le choix) : deux écrans en désaccord. Contre-épreuve (le choix avant la règle) : figurine quadriceps. Noms réalistes : « Rowing… », « Squat… », « Tirage… », « Pompes… » ignorent les muscles cochés — **figurine ET classe MET des calories** (« Rowing Zorglub » 5,5 au lieu de 4). **« Spoto press » (cité par l'audit) n'est PAS concerné** : aucune règle ne le capte. | `log.js:4550-4580` | P2 | **Michel** (change les calories de ces persos) |
| **F06** tuile Séance de Nutrition | ✅ **CONFIRMÉ** | Deux séances aujourd'hui (250 + 350 kcal) → la tuile affiche **350** (la plus récente). Contre-épreuve (somme) : **600**. La cible calorique, elle, n'additionne pas (voir F13) — c'est juste. | `screens.js:3385` | P2 | Michel + **Claude Nutrition** (libellé) |
| **F07** couleur du calendrier en cache | ✅ **CONFIRMÉ** | Séance éditée (mêmes noms, autres séries faites) → reste **« bas » 86 %** au lieu de **« haut » 100 %** jusqu'au redémarrage de l'app. Contre-épreuve (clé avec les séries faites) : « haut ». | `screens.js:2262` | P3 | technique |
| **F08** record d'une séance supprimée / corrigée | ✅ **CONFIRMÉ — connu et voulu** | Record 100 × 5 porté par B ; B supprimée → le record **reste** (daté du jour de B) ; B corrigée 100 → 50 → le record reste. Supprimer une **autre** séance ne le touche pas. L'outil admin `_prsDepuisSeances` le corrige (aperçu : 60 × 5). **Connu depuis le 02/09 (ft-v1099)** : entrée « UN RECORD SURVIT À LA SUPPRESSION DE SA SÉANCE » de `docs/JOURNAL-DE-TEST.md`, *« bloquée par une décision produit »*. Le non-recalcul est une **règle écrite** (`setup.js:4237-4248` : ne jamais supprimer un record invérifiable) — mais le même commentaire dit que ce maximum sert de référence aux **charges proposées par Milo**, à la **montée en charge** et au **% du max des calories** : un fantôme n'est jamais battu. | `setup.js:1669`, `:1687`, `:4249` | **P1** | **Michel** (recalcul ciblé avec aperçu) |
| **F09** repos du moteur calorique | ✅ **CONFIRMÉ** — nuance | Repos par défaut 60 / 130 / 240 s, séance de 60 min : **317 / 317 / 317 kcal** — le total ne bouge pas (repos et transition valent tous deux 3 MET) ; seule la répartition change, et elle n'est affichée nulle part. Séance de 20 min : **153 / 147 / 140**. Préférence de repos par exercice : **ignorée** (sortie identique). | `app.js:719-804` | P2 | **Michel** (moteur calorique) |
| **F10** forfait 10 min, `totalMin` | ✅ **CONFIRMÉ**, invisible | Forfait 10 / 5 / 0 min selon le cardio noté (317 / 293 / 270 kcal hors cardio). `totalMin` = 38 alors que durée 60 + forfait 10 = 70 (la transition, 32 min, manque) — **mais `totalMin` n'a aucun lecteur**. Vu en plus : une durée **saisie à la main** reçoit quand même le forfait (317 kcal, comme le chrono). | `app.js:816-833` | P3 / P2 | **Michel** (forfait sur durée saisie) |
| **F11** détail calories décalé | ⚠️ **arithmétique confirmée, prémisse INFIRMÉE** | L'écart existe (≤ 5 kcal sur 3 000 séances aléatoires, 18 kcal sur un cas construit — *délégué*), **mais le détail par exercice n'est affiché nulle part** : `renderCalorieBreakdown` n'a **aucun appelant**, `calData.breakdown` n'est lu par personne. | `app.js:843` | P3 | Michel (code mort) |
| **F12** Oiseau compté comme un développé | ✅ **CONFIRMÉ** | Oiseau **5,5** (3 muscles) au lieu de 4 (isolation) ; Élévations latérales 4. Même cas pour les autres oiseaux et écartés arrière (*délégué*) ; +7 kcal sur 4 × 12 (*délégué*). L'aveu est dans `constants.js`. | `app.js:298-330` | P2 (faible) | **Michel** (moteur calorique) |
| **F13** aide Nutrition contraire au calcul | ✅ **CONFIRMÉ** | TDEE **2 663** et cible **2 763** identiques avec une séance du jour de 800 kcal (dont 200 de cardio) ; l'aide « ? » dit : *« Les calories brûlées au cardio … s'ajoutent à ton TDEE estimé du jour »*. C'est l'aide qui est en retard (décision du 21/08), pas le calcul. | `screens.js:358`, `state.js:1714` | P2 | **Claude Nutrition** |
| **F14** catégories des Leg Curl | ⚠️ **faits confirmés, « incohérence » INFIRMÉE**, un effet réel | Les 6 Leg Curl sont bien dans « Fessiers » (muscle principal : ischios) — **c'est la définition du projet** (Fessiers = fessiers + ischios, `tests/croises`), pas une erreur. **Mais** le fait envoyé à Milo « Groupes musculaires (30 j) » lit ce groupe : 4 séances de leg curl → **« le plus : Fessiers »**, pendant que le bloc volume du **même** contexte dit ischio-jambiers (`hamstrings:4`) — deux sources (R2). Et **21 noms** (Avant-bras 5, Full Body 16) n'ont **aucune tuile** du sélecteur : recherche seulement. ⚠️ Appliquer l'audit à la lettre (Dead Hang en Avant-bras, GHD en « Ischios ») **sortirait** ces exercices des tuiles. | `constants.js:137-138`, `tracking.js:2393` | P2 | technique (fait Milo) / **Michel** (tuiles) |
| **F15** images manquantes | ✅ **CONFIRMÉ** | **359** appartenances · **322** noms · **13** groupes ; **305** noms avec image (fichiers tous présents), **17 sans image — exactement la liste de l'audit** ; 1 clé morte (« Curl Ischio-jambiers (Leg Curl) », ancien nom). Ce que voit la personne pour les 17 : case vide dans le sélecteur, image musculaire générique ailleurs — **jamais l'animation d'un autre exercice** (*délégué*). **4 WebP orphelins** (2 précachés) + **4 images `machine/` inutilisées précachées** (386 881 octets, cache versionné → retéléchargées à chaque version) — déjà consigné (`JOURNAL-ARCHIVE.md`, « décision non prise »). | `log.js:10787`, `sw.js:175`, `:204` | P2 / P3 | **Michel** (images à valider, précache) |
| **F16** Spoto press | ✅ **CONFIRMÉ**, rien à faire | Absent du catalogue ; un perso s'affiche dans « Polyvalent » ; à l'import, `_matchExercise` propose Développé Couché avec une confiance de 33 → palier **« confirmer »** : rien d'automatique, pas de doublon (*délégué*). | — | — | — |
| **F17** trois systèmes d'images | ✅ **CONFIRMÉ**, complété | Les trois existent. Sur master, les 8 icônes du sélecteur sont **les mêmes fichiers** que le repli musculaire `_MG_IMG` ; sur la branche (vignettes), indépendantes. Code mort : `_genderGroupSvg`, `_groupTemplateSvg`, `_exVideoHtml`, `fetchExImage` (*délégué*). | — | info | — |
| **F18** PWA / modales iPhone | ❔ **NON VÉRIFIÉ** | iPhone réel requis. ⚠️ **La pastille bleue sur le « + » est VOULUE** (D-083 : séance en cours, elle ramène à la même séance) — ce n'est pas un défaut. | — | — | recette Michel |
| **F19** score de récupération sans sommeil | ✅ **CONFIRMÉ** | Aucune nuit notée, une séance vieille de 20 jours : **« Bon 79/100 »** à 40 ans ; à 25 ans **« Optimal 82/100 — Prêt à performer — idéal pour tenter des records »**, alors que la ligne d'explication dit « Récup de base 70 » et qu'un conseil invite à renseigner le sommeil. Sans aucune séance : score masqué (« Enregistre ton sommeil »). Limite documentée dans le code. | `tracking.js:3962`, `screens.js:887-891` | P2 | **Michel** (libellé) |
| **F20** blocage serveur Nutrition | ✅ **ÉTAT CONFIRMÉ** (journal de master) | NUT-SECURISATION-P1 arrêté avant publication (vérification 5 : favoris refusés + « Restaurer » = perte), prod Apps Script @192, D-110 à trancher ; Claude Principal intègre maintenant NUTRITION V2 + P1 sur `claude/nut-v2-p1-integration`. Aucune dépendance de **code** avec les corrections Séance (P1 = `Code.js`) — mais dépendance de **fichiers et de calendrier** (§5). | — | — | Michel / Principal |

**Les autres affirmations de l'audit :**

| Affirmation | Verdict | Preuve |
|---|---|---|
| §4 « le retour Sheets doit être jugé par `res.ok` » | ✅ **DÉJÀ CORRIGÉ** (26/08/2026) | Serveur injoignable → `synced:false`, message « Séance sauvegardée » (pas « synchronisée »), 1 en attente ; réponse d'erreur → toujours `false` ; accusé « ok » → `true`, écrit sur le disque, **aucun renvoi ensuite**. |
| §4 « stockage plein : repli à 50 séances » | ✅ exact, **conforme** | Quota simulé : 50 séances gardées dont la nouvelle, avertissement affiché, drapeau `ft4_hist_tronque` posé (le cloud ne reçoit plus les séances tant qu'il est levé), plus un garde-fou serveur qui refuse un rétrécissement brutal (lu dans `Code.js`, non exécuté). Si rien ne tient : séance **non** enregistrée, record rétabli, séance et brouillon intacts, message « Ta séance est toujours là ». Observations (P3) : quatre avertissements d'affilée (celui de `finishWorkout`, puis le même de `persist` trois fois) ; le repli de `finishWorkout` ne pose pas le drapeau lui-même (c'est `persist()` juste après qui le pose) — fragilité **théorique**, reproduite seulement en refusant artificiellement la clé du drapeau. |
| §5 MET, `_secSerie`, facteur de charge, cardio | ✅ **CONFIRMÉ** | Les 7 MET sont ceux annoncés ; `_secSerie` 90/90 et facteur de charge 14/14 contre un oracle indépendant ; cardio : 360 combinaisons sans écart, compté **une seule fois** (*délégué*, recoupé par mes scénarios K4–K7). |
| §5 « TDEE : la séance n'est plus ajoutée » | ✅ **CONFIRMÉ** | B16 : cible inchangée (2 763) avec 800 kcal de séance. |
| §10 Compendium : « 02052 = 5,0, pas 3,5 » | ⚠️ contradiction **interne** au code confirmée ; source **non vérifiée** | `app.js:193` et `:622` disent « 02054 → 3,5 », `app.js:701` dit « 02052 → 3,5 » ; `app.js:622` parle encore d'un repos « à 1,5 » alors que MET_REPOS vaut 3. Les valeurs du Compendium : site inaccessible (403). P3 (commentaires). |
| Index : « 1 903 déclarations » | ⚠️ **INFIRMÉ de 2**, sans conséquence | 1 901 déclarations de fonctions (analyseur syntaxique *délégué* et mon comptage par motif identiques fichier par fichier : log 474 · app 477 · tracking 224 · setup 215 · screens 146 · coach 252 · state 97 · constants 16) ; l'index ajoute deux fonctions asynchrones auto-exécutées (`autoConnect`, `_autoRestoreFromIDB`). Il coïncide nom et ligne sur les 1 901. |
| §0 « branche : 36 commits d'avance, 4 de retard » | ✅ exact **au 23/10 11:18** | Aujourd'hui 38 / 0 (master fusionné, deux commits de journal en plus). |

### Deux constats nouveaux (hors audit), mesurés

| # | Constat | Preuve | Où | Prio |
|---|---|---|---|---|
| **N1** | Corriger la **durée** d'une séance (⏱️) **efface en silence** une modification pas encore enregistrée dans le même écran. | Charge passée de 100 à **120** dans le détail (non enregistrée), puis ⏱️ 75 min → le détail se rouvre depuis la séance stockée → **100** ; « Enregistrer » écrit 100. La durée, elle, est gardée. | `setup.js:1453` (`openSessDetail` après la durée) | P2 |
| **N2** | Corriger la durée **ne recalcule pas les calories**, et la séance reste stockée ainsi. | 60 → 90 min : **317 kcal** affichées et stockées, au lieu de **440** ; la carte montre « ⏱️ 1h30 · 🔥 317 kcal ». Elles ne se recalculent qu'à un « Enregistrer » (qui, lui, reprend le poids du jour — complément de F02). | `setup.js:1416-1452` | P2 |

## 3. La matrice de recette (62 cas)

**Exécuté** = conduit ici par mes bancs · **Couvert** = un témoin existant le prouve (banc rejoué sur `7f359f15`, ou
passe 7 923/0) · **Délégué** = mesuré par une vérification déléguée · **Non vérifié** = avec la raison.

| Cas | Statut | Résultat |
|---|---|---|
| A01 séance vide | Exécuté | refus « Ajoute un exercice ou un cardio ! », 0 séance, séance gardée — **conforme** |
| A02 aucune série faite | Exécuté | « Il reste 3 séries à faire — Terminer quand même ? » puis refus « Valide une série… » ; séance et brouillon identiques — **conforme** |
| A03 cardio seul | Couvert (passe) | « une séance CARDIO SEULE est comptabilisée », « 🏃 Cardio », compteur du mois, brouillon — **conforme** (forfait +24 kcal, *délégué*, P3) |
| A04 cardio avant + après | Couvert (passe) + délégué | deux moments nommés, calories additionnées **une fois** (ré-enregistrer : 614 puis 614) — **conforme** |
| A05 chrono à la 1ʳᵉ série | Couvert (passe XV) | « le chrono NE démarre PAS à l'ouverture… il démarre à la 1ʳᵉ série validée » — **conforme** |
| A06 pause | Couvert (`seance_ux` 69/0, passe) | « le temps de pause cumulé est déduit comme dans la durée enregistrée » — **conforme** |
| A07 repos fermé (branche) | Couvert (`seance_repos` 61/0) | « retour 30 s après la fin : … +0:30 » — **conforme sur la branche** (non publié) |
| A08 repos expiré (branche) | Couvert (`seance_repos`) | expiration à 900 s (avenant) — **conforme sur la branche** |
| A09 double « Terminer » | Exécuté | 1 séance par le bouton, 1 par le double appel direct — **conforme** |
| A10 date rétrospective | Couvert (`historique_cloud` LOT 3 F03b, `seance_date` 25/0) | la séance d'hier est rangée à sa date — **conforme** |
| A11 remplacer, rien de fait | Exécuté | séries du rowing depuis **son** historique (40×10, 50×8, 50×8), rien des 240 kg — **conforme** |
| A12 remplacer, 2 faites | Exécuté | 2 séries restent sur la presse, 1 restante passe au rowing ; aucun record fantôme — **conforme** |
| A13 superset + RIR | Couvert (`rir_superset` 52/0) | « deux questions, chacune à SA série » — **conforme** |
| A14 dropset / échec | Couvert (`cc01_dropset` 31/0, `seance_recette` 93/0) | — **conforme** |
| A15 import interrompu | **Non vérifié** | aucun témoin d'un import interrompu puis repris — à construire |
| A16 petite largeur iOS | Partiel | largeurs 320/360/390 couvertes ; clavier iOS, bande d'appel, safe-area, grosse police : **iPhone réel** |
| A17 retour après longue inactivité | Partiel | repos (branche) et resynchro couverts ; « barre d'état après long arrière-plan » : **iPhone réel** |
| B01 tonnage unilatéral | Exécuté | **écart** — F01 |
| B02 éditer sans toucher aux poids | Exécuté | **écart** — F02 + complément calories |
| B03 ancienne séance sans `uniConv` | Exécuté | 600 partout, jamais doublée — **conforme** |
| B04 bilatéral 100 × 5 | Exécuté | 500 partout — **conforme** |
| B05 même exercice en deux blocs | Exécuté | 4 350 = attendu (fin, calendrier) ; 8 séries ; **un** record — **conforme** |
| B06 deux séances le même jour | Exécuté | **écart** — F06 |
| B07 N, É, W | Exécuté | **écart** — F03 |
| B08 RIR 0 contre ancien « échec » | Couvert (`seance_recette`) | « un ANCIEN 0 … rien n'est reclassé » — **conforme** |
| B09 première fois | Exécuté | « première référence », pas « record » — **conforme** |
| B10 vrai record | Exécuté | record 85 × 5 annoncé — **conforme** |
| B11 supprimer le meilleur | Exécuté | **écart connu** — F08 |
| B12 corriger le meilleur à la baisse | Exécuté | **écart connu** — F08 |
| B13 secondaires cumulés | Exécuté | **écart** — F04 |
| B14 exercice perso + règle | Exécuté | **écart** — F05 |
| B15 couleur après édition | Exécuté | **écart** — F07 |
| B16 TDEE et séance | Exécuté | calcul **conforme** ; aide **en écart** — F13 |
| B17 récupération sans sommeil | Exécuté | **écart** — F19 |
| C01 série de 10 répétitions | Délégué | 10 + 10 × 3 = 40 s, 90/90 contre l'oracle — **conforme** |
| C02 tempo dans la note | Délégué | lu avec « s » ; « tempo 3-1-2 » (sans « s ») n'est pas lu — voulu |
| C03 sans 1RM | Délégué | facteur 1 — **conforme** ; un ré-enregistrement recalcule (voir complément F02) |
| C04 20 min de transition | Exécuté | `totalMin` omet la transition (sans lecteur) — F10 |
| C05 repos personnalisés | Exécuté | ignorés par le moteur — F09 |
| C06 forfait | Exécuté | 10 / 5 / 0 min — conforme au code ; « estimé » : seulement « ~ » dans le détail, pas sur la carte |
| C07 cardio MET | Délégué | 360 combinaisons sans écart — **conforme** |
| C08 total = détail + … | Délégué | prémisse infirmée — F11 |
| C09 limites | Exécuté + délégué | tout ce que l'écran peut produire reste fini ; seuls des cas impossibles à saisir (poids négatif chargé tel quel, intensité inconnue) donnent NaN/négatif — P3 |
| C10 comparaison à la montre | **Non vérifié** | données réelles nécessaires — hors phase 1 |
| D01 catalogue 359 / 322 | Exécuté | **conforme** : 36 noms rangés dans 2 ou 3 groupes, exprès (squats, fentes, presses en Jambes + Fessiers…) |
| D02 chaque nom actif | Exécuté | 305 images, 17 sans, 0 fichier manquant, 1 clé morte |
| D03 les 17 sans image | Délégué | case vide (sélecteur) ou image musculaire générique, jamais un autre exercice ; perso inconnu rangé en Mollets → `chest.svg` (P3) |
| D04 barre libre / Smith | **Non vérifié** | validation visuelle humaine |
| D05 Oiseau incliné | **Non vérifié** | aucune image à ajouter dans cette phase |
| D06 8 vignettes (branche) | Couvert (`picker_vignettes` 20/0) | **conforme sur la branche** |
| D07 face + dos | Couvert (`fig_face_dos` 77/0) | **conforme**, sauf F04 |
| D08 4 WebP inutilisés | Exécuté | confirmés, 2 précachés ; + 4 images `machine/` — F15 |
| D09 hors ligne | Couvert (branche + passe) | vignettes précachées ; vrai hors-ligne iPhone non vérifié |
| D10 photo perso | Partiel (délégué) | la photo perso passe avant tout (`_exImg`) ; elle reste locale par conception (jamais synchronisée) |
| E01 stockage plein à « Terminer » | Exécuté | **conforme** (voir §2) |
| E02 Sheets indisponible | Exécuté | **conforme — déjà corrigé** |
| E03 restaurer après écritures locales | **Non vérifié ici** | domaine de Claude Principal (vérification 5, D-110) ; pour les séances, la fusion à la restauration est couverte par `historique_cloud` |
| E04 suppression + débrief | Exécuté + couvert (`session_integrity` 93/0) | seul le débrief de la séance supprimée part — **conforme** |
| E05 CSV | Couvert (passe) | même producteur que le PDF, BOM, RIR ; observation : le volume d'une ligne unilatérale est celui d'**un** côté (la somme ≠ le volume de la séance) ; colonne `seance` vide (`BUGS.md` §89, connu) |
| E06 PDF historique | Couvert (passe) | multipage, protégé, même producteur — **conforme** |
| E07 programme de Milo | Couvert (`seance_unicite` 12/0, `motif_exercice` 17/0) | une réponse = une carte — **conforme** |
| E08 intégrer la branche Séance | Processus | à faire plus tard : refusion, passe D-031 sur l'arbre intégré, recette, GO de Michel |

**Bilan matrice** : **31** cas conduits ici · **6** mesurés par les vérifications déléguées · **16** couverts par un
témoin existant rejoué · **3** partiels · **6** non vérifiés (iPhone, validation humaine, données réelles, domaine de
Claude Principal, processus d'intégration) = 62. Parmi les cas que la matrice classe **P0** : ceux qui protègent les
données sont **conformes** (A01, A02, A09, A11, A12, B03, B04, C09, E01, E02, E04) ; ceux qui portent sur des
**chiffres** sont **en écart** (B01, B02, B07, B11, B12, B14 — c'est F01, F02, F03, F08, F05) ; B16 : calcul conforme,
aide en écart ; E03 : non vérifié ici ; E08 : processus.

## 4. Plan de correction priorisé — à décider, rien n'est commencé

⛔ Règles communes : **aucune réécriture de l'historique** (consigne de Michel ; l'unilatéral ancien « laisse pour
l'instant ») · chaque correction commence par un **témoin vu rouge** sur l'arbre actuel, puis mutations, contrôle
négatif, voisins, passe D-031 complète · moteur calorique et durées de repos des programmes : **rien sans accord**.

| Lot | Contenu | Pourquoi d'abord | Risques | Qui |
|---|---|---|---|---|
| **1 — Une seule règle pour les chiffres d'une séance** (P1, avec N1 et N2 qui sont P2 mais au même endroit du code) | F01 : le calendrier lit `_workVol`. F02 : « Enregistrer » lit `_workVol`. Complément : ne **pas** recalculer les calories quand ni les séries, ni la durée, ni le cardio n'ont changé (au minimum) — ou les calculer avec le poids **de la séance** (nouvelle donnée stockée → règle #17, décision). N1 + N2 : la durée se corrige **dans** le détail ouvert (plus de réouverture) et recalcule les calories. | Deux écrans se contredisent aujourd'hui ; un geste anodin modifie une valeur stockée. C'est la famille §85 : *un affichage n'a pas le droit de posséder une règle*. | ① Les séances unilatérales **déjà** éditées depuis le 11/08 gardent leur volume divisé par deux — **pas de réécriture** ; je propose d'abord un **diagnostic en lecture seule** (combien de séances `uniConv:1` ont `volume ≠ _workVol`), puis Michel choisit : afficher le recalcul sans réécrire, ou recalcul consenti. ② Chiffres visibles qui changent (calendrier). ③ Mêmes fichiers que l'intégration Nutrition V2 (§5). | Séance (moi) ; diagnostic à faire valider par Principal |
| **2 — Records** (P1, décision) | F08 : après suppression / correction d'une séance qui porte un record, **proposer** le recalcul **de ces exercices seulement**, avec la règle `_serieFaitFoiPourPR` et l'aperçu existants, sans jamais effacer un record invérifiable (règle ③ déjà écrite). | Un fantôme n'est jamais battu et sert de référence aux charges. | Toucher `S.prs` (donnée réelle) → aperçu obligatoire ; tests sur données fictives seulement. | **Michel** décide ; Séance réalise |
| **3 — Figurine et muscles** (P2, décisions) | F04 (libellé ou rôle/intensité séparés) · F05 (le choix de la personne avant la règle générique) · F03 (exclure W) · F14 (le fait Milo depuis `EX_MUSCLES` ; tuiles Avant-bras / Full Body ?). | R31 : la figurine est le vocabulaire de toute l'app ; R29 : la personne décide de ses muscles. | F05 change la classe MET de certains persos → **banc calories avant/après** (R34). F04 touche l'identité visuelle. | **Michel** ; Séance réalise |
| **4 — Affichages et aides** (P2/P3) | F06 (tuile : somme ou liste des séances du jour) · F13 (réécrire l'aide) · F19 (« estimation sans sommeil récent », pas de conseil « records » sur une base neutre) · F07 (vider le cache de couleur après une édition) · avertissement de stockage ×3. | Textes et affichages, risque faible. | F06 et F13 sont sur l'écran Nutrition, réécrit par V2. | **Nutrition** (F06, F13) ; Séance (F07, F19) ; Principal (stockage) |
| **5 — Moteur calorique** (P2/P3, gelé) | F09 (repos réels, ou le total des séances courtes indépendant du repos supposé) · F10 (forfait sur durée saisie ; `totalMin`) · F11 (code mort ou arrondi unique) · F12 (liste d'isolations) · commentaires Compendium. | Estimation assumée ; aucun écart grave. | Toute modif change les kcal de l'historique **à l'affichage suivant** → `CAL_ENGINE` à monter, banc avant/après sur séances réelles anonymisées. | **Michel** d'abord |
| **6 — Catalogue et images** (P2/P3) | F15 : 17 images à produire **et valider une par une** · précache de 6 fichiers jamais affichés (2 WebP + 4 `machine/`, 551 289 octets) · F14 : 21 noms sans tuile. | Visible, mais rien de faux n'est montré. | Une image fausse est pire qu'aucune image. | **Michel** (validation) |

## 5. Dépendances avec Claude Principal et Claude Nutrition

**Claude Principal**
- **Calendrier et fichiers** : son intégration NUTRITION V2 + P1 (`claude/nut-v2-p1-integration`, base `4ab7f860`)
  modifie `app.js` (≈ 2 200 lignes, partie aliments à partir de `app.js:1306`), `screens.js` (aides Nutrition
  `:260-376`, journal alimentaire `:3856-4017`), `setup.js` (export Nutrition `:473-490`) et `Code.js`. Le lot 1 Séance
  toucherait `screens.js:2220` et `:2262`, `setup.js:1416-1453` et `:1687-1713` : **régions différentes, aucun conflit
  de lignes mesuré**, mais les **mêmes fichiers** → l'ordre doit être décidé (Séance après leur fusion, ou rebase et
  passe complète sur l'arbre intégré).
- **Son domaine, à confirmer par lui** : E03 (restaurer après écritures locales — vérification 5, D-110) ; le stockage
  plein (`persist`, `state.js:1270-1280` : avertissement ×3, drapeau posé par `persist` et pas par `finishWorkout`) ;
  la synchro d'une **suppression** de séance (`_cloudSyncSessions` après `deleteSessOrConfirm` ; le garde-fou serveur
  refuse les rétrécissements brutaux) ; le diagnostic en lecture seule du lot 1.
- **Rien** dans les corrections Séance proposées ne dépend du code P1 (`Code.js`), ni ne le modifie.

**Claude Nutrition**
- **F06** (tuile « Séance » de l'écran Nutrition, `screens.js:3385`) et **F13** (aide « ? » de Nutrition,
  `screens.js:358`, dans le bloc d'aides que V2 réécrit) : c'est son écran — à faire par Nutrition, ou après la fusion
  de V2. B16 : la cible n'est pas gonflée par la séance, **rien à faire**.
- **Moteur calorique** (F09–F12) : la dépense de séance s'affiche dans Nutrition ; toute modification, après accord de
  Michel, doit le prévenir (les chiffres de sa tuile changeraient).

## 6. Ce que cette contre-vérification ne couvre pas

iPhone réel (Safari/WebKit, PWA installée, clavier, bande d'appel, safe-area, retour d'arrière-plan) · données réelles
de Michel · justesse anatomique des 305 animations (non regardées une par une) · physiologie des calories (aucune mesure
métabolique, et une montre n'est pas un étalon) · valeurs du Compendium (site inaccessible) · le serveur réel (aucun
appel). *Conduire n'est pas observer* : chaque scénario dit ce qu'il remplace (`fetch`, quota, `prompt`, toast).

## 7. Reproduire (pour Claude Principal)

```bash
git archive origin/master | tar -x -C /tmp/arbre_master        # l'arbre de master, hors dépôt
K=tools/contre_verif_seance_2026_10_23
tools/sous_garde.sh node $K/harnais.js  /tmp/arbre_master       # F01 F02 F03 F04 F05 F06 F07 F08 F19
tools/sous_garde.sh node $K/harnais2.js /tmp/arbre_master       # A01 A02 A09 A11A12 B05 B09B10 B16 E01 E02 E04
tools/sous_garde.sh node $K/harnais3.js /tmp/arbre_master       # K1 (N2) K2 (N1) K3 (complément F02) K4–K7 (calories)
tools/sous_garde.sh python3 $K/contre_epreuves.py /tmp/arbre_master /tmp/copies   # les 6 contre-épreuves
tools/sous_garde.sh node $K/catalogue_verif.js /tmp/arbre_master                  # 359/322/13, les 17, orphelins, fait Milo
tools/sous_garde.sh node $K/tuiles.js /tmp/arbre_master                           # 21 noms sans tuile
tools/sous_garde.sh node $K/spoto.js /tmp/arbre_master                            # F05 sur des noms réalistes
# même chose avec l'arbre de la branche : remplacer /tmp/arbre_master par la racine du dépôt
```

Chaque script charge le garde réseau avant Playwright (reconnu par le cliquet D031S-VII) et n'est **jamais** lancé par
la passe. Les mesures marquées *(délégué)* viennent de scripts restés dans la session de vérification (non versionnés).

## Annexe A — bancs existants rejoués sur `7f359f15` (23/10, ~18:12-18:31 UTC)

`seance_recette` 93/0 · `seance_ux` 69/0 · `seance_date` 25/0 · `session_integrity` 93/0 · `rir_superset` 52/0 ·
`cc01_dropset` 31/0 · `fig_face_dos` 77/0 · `seance_unicite` 12/0 · `progres_seances` 80/0 · `seance_repos` 61/0 ·
`picker_vignettes` 20/0 · `d091_volume_prepare` 8/0 · `debrief_demande` 62/0 · `motif_exercice` 17/0 ·
`import_echauffement` 11/0 · `d088` 52/0 · `fp01` 71/0 · `seance_c1` 29/0 · `seance_c2` 22/0 · `seance_c3` 35/0 —
**20 bancs, 920 témoins, 0 rouge** ; runners `calendrier` 10/0 · `muscles` 241/241 · `calculs` 339/0.
⚠️ Le runner calendrier teste `_calSessVol` avec N, É, W et séries non faites, **mais jamais avec `uniConv`** — c'est
exactement pourquoi F01 est passé (l'audit le dit aussi, §10).

## Annexe B — incident de procédure de cette session

En ouvrant la ligne du journal de partage pour cette mission, ma fusion de master avait laissé un conflit dans
`docs/JOURNAL-DE-PARTAGE.md` et mon commit suivant l'a emporté tel quel (`9473ed88`). Corrigé aussitôt (`7f359f15`) :
les trois lignes de Claude Principal et la mienne gardées, `check_regles` vert. Aucun code applicatif touché.
