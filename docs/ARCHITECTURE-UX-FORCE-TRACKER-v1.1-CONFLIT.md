# 🗺️ ARCHITECTURE UX — v1.1 · MISE EN CONFLIT avec le code actuel et le contre-audit

> **Addendum du 08-09/10/2026 (nuit), session-B.** ⛔ **Analyse et documentation uniquement** :
> aucun code produit modifié, aucun déploiement, aucune publication, **0 appel IA réel**.
>
> **Ce document ne remplace pas le document maître** : il le confronte au code d'aujourd'hui.
> Le document maître (103 pages, 7 cartographies, banc, 141 captures) **n'est pas copié dans le dépôt**
> (il est public et le paquet contient des captures) — il est identifié par son empreinte :
>
> | Pièce (hors dépôt) | Empreinte SHA-256 |
> |---|---|
> | `ARCHITECTURE-UX-FORCE-TRACKER-v1-2026-10-08-paquet.zip` | `d3f8e33b11473e58462f57767c4ba54a0b3912b3f61f1da665d338c511b13558` |
> | `ARCHITECTURE-UX-FORCE-TRACKER-v1-2026-10-08.md` (document principal) | `ca163d751c2025bfcb726a9029bda2f02174ce3d890d8b4cae3251ff5b529f7d` |
> | `ARCHITECTURE-UX-FORCE-TRACKER-v1-2026-10-08.pdf` | `8aa3ef42a61115642c3f4e18eef9c05b964a279aef32cf1bca6d767d4fb4320f` |
> | `CONTRE-AUDIT-ARCHITECTURE-UX-FORCE-TRACKER-2026-10-08.md` | `1a5c9379eb3f8538f8d09dc36ae9601200f79634e7db10d18261b7dc0889fd86` |
>
> **Comment le lire** : §3 à §6 disent ce que le code a fait des 115 constats ; §10 à §15 sont
> l'architecture **avant code** (chaînes, Historique/Séances, Milo, multi-appareils, Premium) ;
> l'annexe B porte le tableau delta complet, ligne par ligne, avec la preuve dans le code.
> ⭐ *Le code actuel et les mesures disent ce qui EST ; Michel décide ce qui DOIT ÊTRE* (règle d'or #15) :
> **aucune décision n'est prise ici**, les arbitrages sont listés comme tels.

---

## 1. Base auditée

- **Audit v1** : production `ft-v1251`, master `6969ce73` (lecture seule, copie figée, intégrité vérifiée par
  1 034 empreintes avant/après). Banc local : Chromium 390×844, réseau externe bloqué, données fictives.
- **Contre-audit** : relecture du v1 ; il tient le diagnostic pour solide, conteste l'ordre des lots et
  pose **10 questions** (réponses en annexe A).
- **Registre v1** : **115 constats** — 53 courts-circuits (CC-01 → CC-53), 12 doublons (DB), 14 navigation
  (NV), 10 libellés (LB), 5 états (ET), 7 données (DN), 2 Free/Premium (FP), 10 dettes d'architecture
  (AR), 2 sécurité (S) — et **17 décisions proposées** (M-01 → M-17).

## 2. HEAD actuel

- **HEAD analysé : `fb3d9fe6`**, branche `claude/import-programme-lot1-client` (Lot 1 import programme +
  fermeture de sûreté + P2), **qualifiée mais NON publiée**. `origin/master` = `6969ce73` = production
  `ft-v1251`, inchangée.
- **Ce qui a bougé depuis la base v1** (`git diff 6969ce73 fb3d9fe6`) : 28 fichiers. Code servi touché :
  `log.js` (fonctions de programmes, d'import et `finishWorkout` pour `progRef`), `state.js` (migration des
  programmes, compteur de repli), `setup.js` (`_cloudSync` : programmes omis si la mémoire ≠ le disque),
  `coach.js` (`_saveForceProgram`, aide), `app.js` (diapo du Guide), `screens.js` (aide, `_OVERLAY_CLOSERS`),
  `constants.js` (point rouge), `index.html` (fenêtre d'import, `ov-prog-cible`, `ov-prog-gerer`).
- **Inchangés** : `tracking.js`, `Code.js`, `worker.js`, `style.css`, `sw.js`, `capacites-ia.js`,
  `dashboard.js`, `confidentialite.html`. ⇒ **tout constat situé dans ces fichiers est encore vrai par
  construction** ; les autres ont été vérifiés un par un (annexe B).
- ⚠️ **Conséquence à ne pas perdre** : ce qui est « fermé » ici l'est **sur la branche**. En production,
  **les 115 constats sont toujours présents** tant que le Lot 1 n'est pas publié.

## 3. Corrigés depuis ft-v1251 (preuve dans le code de `fb3d9fe6`)

| ID | Constat v1 | Preuve |
|---|---|---|
| CC-02 | « Sauvegarder comme programme » écrasait un programme du même nom et l'aplatissait | `log.js` `saveAsProg` → `_progMemeNom` → `_ouvrirProgCible` (question : créer, ou mettre à jour une cible à plat désignée, en version) ; D-062 ; témoin T-L1-01 |
| CC-03 | Import « Remplacer » : 1er programme prérempli, sans confirmation, nouvel id | cible proposée **seulement** sur l'empreinte du document (`_impProposerCible`) ; mise à jour = nouvelle version (`_progNouvelleVersion`), id conservé ; sans cible désignée, rien n'est écrit (`finalImportProg`) ; D-055, D-061 |
| CC-04 | Suppression d'un programme en 1 tap | `deleteProg` → `showConfirm` (« archive-le plutôt ») → `_progSupprimer(id)` |
| CC-23 | Mode d'import remis à zéro sans l'affichage | le mode « Remplacer » n'existe plus ; `impRecommencer` remet tout l'état, l'écran est rendu depuis `_impMode` |

**Fermés après l'audit v1, hors registre** (même branche) : opération de programme vérifiée sur le disque
avant tout succès (`_progSauver`) et jamais un succès affiché par-dessus l'alerte « stockage plein » (P2) ;
programmes jamais envoyés au cloud s'ils diffèrent du disque ; document d'import rattaché à **son** compte
(`_impScope`) et jamais lu ni écrit en démo, persona ou pendant une restauration attendue ; import refusé
au-delà de 8 pages au lieu d'être tronqué ; échec / annulation / délai d'analyse sans décompte de l'import
gratuit. *(BUGS.md §67, §68, §69.)*

## 4. Partiellement corrigés

| ID | Ce qui est fermé | Ce qui reste |
|---|---|---|
| CC-24 | import **programme** : PDF > 8 pages refusé, jamais tronqué | `_pdfToImages` tronque **encore en silence** pour l'import d'historique, le plan de repas (Nutrition gelée) et le bilan sanguin |
| CC-50 | démo : plus aucun accès au document d'import ; une opération de programme n'écrit rien | `finishWorkout` écrit en direct, débriefs, fil du Coach, mémoire, marqueurs « vu » |
| CC-52 | l'import gratuit n'est plus compté sur un échec, une annulation, un délai ni une lecture vide | il est compté après une lecture utile mais **avant** l'enregistrement : abandonner après l'aperçu consomme l'import |
| DB-03 | « Sauvegarder comme programme » demande au lieu d'écraser | le Coach suffixe encore « 2 » ; import et création manuelle acceptent un même nom (voulu : D-061) |
| LB-01 | import : « Remplacer » devenu « Mettre à jour » versionné | « Remplacer » garde 4 sens (exercice D-046, séance chargée, conflit d'import d'historique, détail de séance) |
| LB-05 | aides des programmes alignées (8 pages, bouton 📄, versions) | aides fausses ailleurs (cycle, bilans, cardio/TDEE, « Photographier le code-barres »…) |
| AR-01 | statut **« en cours »** (0 ou 1, `_progDefinirEnCours`, D-053) | personne ne le lit : ni l'Accueil, ni Milo (D-067, volontaire), ni le chargement d'un jour |
| AR-02 | `progRef {id, version, day}` sur les **nouvelles** séances (`_loadProgDayVraiment`, `finishWorkout`) | aucun lecteur (Milo, Historique, Progrès) ; anciennes séances liées par libellé seul (D-057 : additif, voulu) |

## 5. Encore ouverts

**110 constats du v1 restent ouverts** (dont **9** en attente d'une décision produit et
**8** partiels). Priorités : P0 1 · P1 21 · P2 56 · P3 32. Catégories : BUG 14 · ARCH 13 · SEC 3 · DATA 15 · UX 42 · PRODUCT 4 · MILO 8 · PREMIUM 10 · TERRAIN 1.

**Les P0 / P1 encore vrais** :

- **CC-01** (P0, BUG, chaîne B) — Drop/+%/Retirer dropset effacent les séries validées
- **AR-01** (P1, ARCH, chaîne D) — pas de programme actif *[partiel]*
- **AR-02** (P1, ARCH, chaîne D) — séance ↔ programme par libellé seul *[partiel]*
- **AR-03** (P1, ARCH, chaîne E) — historique enterré, 20 max, détail = éditeur
- **AR-04** (P1, ARCH, chaîne C) — débrief en 3 copies effacées différemment
- **AR-05** (P1, ARCH, chaîne A) — pas de cycle de vie du compte; Restaurer sert de connexion
- **AR-06** (P1, ARCH, chaîne A) — cloud = état du dernier appareil; pas de fusion; suppressions non transmises
- **CC-05** (P1, BUG, chaîne E) — 1RM vide = valeur d'exemple; cycle démarre sur 120/90/140/65
- **CC-06** (P1, BUG, chaîne G) — #toast z600 sous les fenêtres 9999 (inscription, restaurer, protéger)
- **CC-07** (P1, UX, chaîne A) — Protéger exige email; aucun champ email hors Admin -> impasse
- **CC-08** (P1, MILO, chaîne A) — IA exige jeton d'appareil (email confirmé/code); nouvel inscrit sans email -> "Reconnecte ton appareil"; rien ne propose de confirmer
- **CC-09** (P1, PREMIUM, chaîne F) — showPremiumWall hors quota (questions avancées, question semaine, menu photo, Activer code Nutrition) ; mur sans fermeture, texte faux "10 questions"
- **CC-10** (P1, PREMIUM, chaîne F) — mur reposé au démarrage et après 10e réponse : fil/discussions illisibles *[décision]*
- **CC-11** (P1, MILO, chaîne C) — continueInCoach remplace coachHistory sans ranger
- **CC-12** (P1, UX, chaîne E) — calendrier/tuile/vue semaine -> liste 20 dernières, pas LA séance
- **CC-13** (P1, DATA, chaîne A) — Restaurer avec email B sur appareil A: union par id puis synchro vers B; texte promet "aucune donnée écrite"
- **CC-14** (P1, UX, chaîne A) — S.connected posé par ping, jamais remis à faux: "Sheets ✓" vert sans sauvegarde
- **CC-49** (P1, PREMIUM, chaîne F) — serveur plafonne toutes IA à 50/j/email, Premium compris, vs "Milo en illimité" *[décision]*
- **DN-04** (P1, DATA, chaîne A) — ~20 JSON.parse non protégés: valeur illisible interrompt load()
- **ET-01** (P1, PRODUCT, chaîne A) — ni déconnexion, ni changement, ni suppression; confidentialite.html promet effacement *[décision]*
- **NV-01** (P1, UX, chaîne E) — historique limité à 20, sans voir plus
- **S-01** (P1, SEC, chaîne I) — route de diagnostic serveur publique, sans authentification, qui expose des données de comptes Premium

**Plus 9 constats nouveaux, nés après l'audit ou révélés par cette mise en conflit** (annexe C) —
dont deux trous de sécurité serveur mineurs (NX-01, NX-03) et un affichage admin trompeur (NX-02).

⭐ **Deux inférences du v1 sont désormais MESURÉES** (sondes locales non destructives, copie de `fb3d9fe6`,
réseau coupé, 0 appel IA — consignées dans `docs/JOURNAL-DE-TEST.md`) :
- **DN-04 passe de P2 à P1** : une seule valeur illisible (`ft4_badges`) suffit pour que `load()` s'arrête ;
  le journal alimentaire et les bilans corporels ne sont pas chargés, et **le `persist()` suivant les écrit
  vides** (`[]`). Déclencheur rare, perte totale.
- **CC-42 confirmé, ramené à P2** : deux onglets ouverts sur une même séance → le dernier qui écrit efface
  les séries de l'autre sur le disque. Exposition faible en app installée (une seule fenêtre).

## 6. Faux positifs et constats devenus obsolètes

- **NV-14 (faux positif partiel)** : parmi les « fenêtres inatteignables », `mod-plate` (calculateur de
  plaques), `ov-tester-eq` et `ov-bday` sont des **retraits volontaires** écrits (R30, ONBOARDING-QUICK-01) —
  ce ne sont pas des défauts. Restent à instruire avant tout retrait : `#drawer`, `mod-checkin`,
  `ov-pr-congrats`, `ov-lang` (R30 : chercher pourquoi ils sont restés).
- **CC-33 (reformulé, pas faux)** : le chat **marque déjà** une réponse non confirmée (« non confirmée »,
  MILO-PDF1B) ; ce qui reste vrai, c'est que **la question gratuite est décomptée quand même**.
- **CC-23** : obsolète par construction (le mode « Remplacer » a disparu) — compté en « fermé ».
- **Écart à signaler au v1 lui-même** : la zone G range « le scanner caméra n'a pas de bouton » (H1) parmi
  les décisions actées, la zone E montre que cette décision a été **remplacée le 17/09** (bouton servi,
  témoin qui l'exige). `CLAUDE.md` dit encore l'ancienne version → écart documentaire (annexe D), pas une
  décision à rouvrir.

## 7. Sécurité

> ⚠️ Le dépôt est public : ce paragraphe nomme les points **sans mode d'emploi**. Aucune valeur secrète,
> aucune adresse n'est reproduite. ⛔ **Rien n'a été testé en production** (interdit par le brief, et le
> serveur est de toute façon injoignable depuis ce conteneur : refus du proxy, mesuré le 07/10).

| ID | Constat | Verdict | Gravité | Ce qu'il faut pour trancher |
|---|---|---|---|---|
| S-01 | Une route de diagnostic du serveur répond **sans authentification** avec des données de comptes Premium (adresses des comptes Premium activés par code + liste en dur + déclencheurs). Les achats Ko-fi datés n'y figurent pas. | **confirmé par lecture** du code source ; **présence dans le déploiement actif : probable, non testée** | **P1** (données personnelles de clients) | test **sécurisé** : relire la version déployée dans l'éditeur Apps Script, ou déployer directement la correction (rien à lire en production) |
| S-02 | Le code de secours admin est dans le JS public. **Privilèges réels** : le **panneau admin du téléphone seulement** (personas, démo, bancs, champ TRT, réponse brute). Les routes admin du serveur exigent des **jetons séparés** (propriétés du script, ≥ 12 caractères). ⚠️ **Mais une chaîne existe** : sur un appareil sans email, activer le mode admin pose l'email de Michel (CS-20) → la synchronisation suivante vise **son** compte. | **confirmé par lecture** | **P2** si le compte de Michel est protégé par un code (le serveur refuse l'écriture), **P1** sinon | savoir si ce compte est protégé (question à Michel, §11) |
| NX-01 | Route de test sans jeton qui écrit puis efface un compte fictif | confirmé par lecture | P3 (consommation de quota, aucune donnée exposée) | — |
| NX-03 | Un commentaire montre un **exemple** de jeton de maintenance | nécessite vérification backend | P3 si la propriété est différente | **rotation du jeton** dans le lot : supprime le besoin de vérifier |
| CC-45 | Le verrou santé reste ouvert sur l'appareil après un changement de compte ou la désactivation du code (`ft4_hascode` jamais effacé) | confirmé par lecture | P2 | — |

**Points de conception, déjà connus et décidés ailleurs (non rouverts)** : un compte **sans code** reste
écrasable par une écriture faite hors de l'app tant que la transition n'est pas fermée (H19, décision de
Michel : lot séparé, ne pas basculer `_MIG_FERME_`) · le Premium est appliqué côté navigateur (AR-07,
architecture d'entitlements prévue **avec Android**, D-049) · état réel de `LECTURE_STRICTE` en production
non vérifiable d'ici.

**Proposition — LOT SEC-ADMIN** (petit, **serveur + redéploiement** : règle d'or #1, décision de Michel) :
① fermer ou protéger par jeton la route de diagnostic (S-01) et la route de test (NX-01) ; ② faire tourner
le jeton de maintenance (NX-03) ; ③ côté app, ne plus jamais poser une identité par défaut en mode admin
(S-02/CS-20) et effacer le drapeau du verrou santé au changement de compte (CC-45). Témoins : appel de la
route sans jeton → refus (banc local sur le source), mutation qui retire le contrôle → rouge.
⛔ Aucun test d'exploitation en production.

## 8. Dettes d'architecture

| ID | Dette | État à `fb3d9fe6` | Lot |
|---|---|---|---|
| AR-01 | pas de programme actif | **partiel** : statut existe, lu par personne | PROG-SUITE |
| AR-02 | séance ↔ programme par libellé | **partiel** : `progRef` sur les nouvelles séances, aucun lecteur | PROG-SUITE / UX-HIST |
| AR-03 | historique enterré (20 max, détail = éditeur) | ouvert | UX-HIST |
| AR-04 | débrief en 3 copies effacées différemment | ouvert | MILO-FLUX |
| AR-05 | pas de cycle de vie du compte (Restaurer sert de connexion) | ouvert | SEC-COMPTE |
| AR-06 | cloud = état du dernier appareil, pas de fusion, suppressions non transmises | ouvert (le Lot 1 n'ajoute qu'un garde « disque ≠ mémoire ») | DATA-SYNC |
| AR-07 | Premium appliqué seulement côté navigateur | ouvert | PREMIUM-B (après Android, D-049) |
| AR-08 | tiroir qui mélange tout, Profil sans titre ni statut | ouvert | UX-NAV |
| AR-09 | Séance vide = 7 départs, bibliothèque modale | ouvert | PROG-SUITE |
| AR-10 | Milo à contrats multiples ; analyse de programme non rangée | ouvert — **reformulé §13** : la multiplicité n'est pas le défaut | MILO-FLUX |

⛔ *Ne pas refaire l'architecture pour la rendre « plus propre »* : chaque dette ci-dessus est rattachée à un
défaut mesuré (colonne « Lot ») ; aucune n'est un chantier en soi.

## 9. Décisions produit (à arbitrer — rien n'est acté ici)

| Sujet | Constats | Ce que le code impose de savoir | Décision attendue |
|---|---|---|---|
| Cycle de vie du compte (se déconnecter, changer, supprimer) | ET-01, CC-07, CC-13, AR-05 | `confidentialite.html` promet l'effacement « dans l'app » ; rien ne l'implémente | M-04 |
| Mur Premium : bloque-t-il la **lecture** du fil ? | CC-10 | mur plein écran, sans fermeture | M-06 |
| Profil : un seul mode d'enregistrement | CC-40 | « tout au tap » écrirait des valeurs à moitié tapées et créerait des **pesées datées** à chaque frappe (le poids passe par `_enregistrerPesee`) | M-14 **reformulée** : par catégorie de contrôle (§ annexe A, Q7) |
| Charges et répétitions au chargement d'un programme | CC-20 | les charges de la dernière fois sont **documentées** comme voulues ; les répétitions prescrites sont perdues | à soumettre (R14) |
| « Programme perso » proposé comme séance | CC-34 | D-032 conserve le comportement de master ; H26 « pas de chasse aux formulations » | à soumettre, pas à corriger d'office |
| « Milo en illimité » vs 50 appels / jour pour tous | CC-49 | décision **commerciale** | P1 **avant toute vente** |
| Compteur de questions gratuites par appareil | FP-01 | `coachFree` local, jamais synchronisé | M-11 |
| Trois notions de « plan de force » ; deux entrées Cycle | DB-07 | `s-cycle` n'est atteignable que par le Menu | M-13 (lieu canonique + raccourci) |
| Adresse de contact | DB-22 | personnelle dans l'app, dédiée dans la confidentialité | choix de Michel |
| Purge des versions de programme | NX-09 | ≈ 10,6 Ko par version d'un gros programme | **D-069** |
| Publication du Lot 1 | — | branche qualifiée (passe 6 045 / 0) | **préalable** : tous les lots client suivants touchent `log.js` |

⛔ Contraintes rappelées (ne se rediscutent pas) : gel Nutrition (13/09), calendrier « on ne touche pas »
(seule la **destination** de « Revoir la séance » est en cause), D-045, D-046, D-047, D-052, D-053 → D-062,
bouton central mesuré (règle #9), un écran à la fois (règle #7), la pop-up se mérite (règle #11).

## 10. Chaînes fonctionnelles

Chaque chaîne dit **qui possède chaque donnée**, ce qui tient, et où ça casse. Deux chaînes s'ajoutent aux
sept du brief : **H** (démarrage, mise à jour, hors ligne) et **I** (admin, démo, personas, routes serveur).

### A — Compte → Auth → stockage local → cloud → restauration → autre appareil
- **Propriétaires** : identité = `S.email` (**3 copies** : localStorage, cookie, IndexedDB — repli mort,
  DN-07) ; code perso = **un emplacement par appareil, non lié au compte** ; jeton d'appareil = rangé avec
  son compte (MILO-AUTH1) ; garde `ft4_restau_attendue` (un seul propriétaire, COOKIE-PROFILE-01).
- **Cloud** : instantané complet (`saveProfile`, `no-cors` = aveugle) vers Apps Script + miroir Supabase ;
  le serveur **remplace** les listes, **le vide ne gagne jamais**, garde « moins de 60 % des séances ».
- **Restauration** : ~10 règles de fusion, puis `persist()` → **réécrit le cloud** (le texte promet l'inverse).
- **Tient** : jamais d'écriture à l'aveugle pour un compte non résolu (ft-v1251) ; programmes jamais
  envoyés s'ils diffèrent du disque (branche).
- **Casse** : CC-06 (messages invisibles), CC-07 (pas d'email après l'inscription), CC-08 (pas de chemin
  vers le jeton), CC-13 (Restaurer un autre compte mélange), CC-14 / ET-03 / LB-04 (faux vert), CC-32
  (attente invisible), CC-43 / CC-44 (suppressions), CC-45, DN-04 (**mesuré**), DN-06, ET-01, AR-05, AR-06,
  NX-04 → NX-06. **Lots** : SEC-COMPTE (client), DATA-INTEGRITE, DATA-SYNC (serveur).

### B — Import → Programme → jour → Séance active → fin → Historique
- **Propriétaires** : `S.programmes` (id, version, statut — branche) ; document d'import (IndexedDB par
  compte) ; `S.wkt` + brouillon `ft4_wkt_draft` + `runId` ; `S.sessions` (`id`, `runId`, `progRef`).
- **Tient** (branche) : identité, versions, cible explicite, refus > 8 pages, scan repris après fermeture,
  `progRef` posé au chargement et gardé à la fin, confirmation avant d'écraser une séance en cours.
- **Casse** : **CC-01 (P0, dropset efface des séries faites)**, CC-05 (cycle sur valeurs d'exemple), CC-17
  (nom effacé), CC-19 (date), CC-20 (décision), CC-21 (attente de 8 s), CC-24 (autres imports tronqués),
  CC-42 (**mesuré**), CC-53, NV-07, AR-09, LB-01/02, DB-02. **Lots** : SEANCE-SAFE, PROG-SUITE.

### C — Séance → Historique → Débrief → Milo → Progrès
- **Propriétaires** : séance (`S.sessions[id]`) ; débrief canonique `ft4_debriefs[_dbfCle]` (**local**,
  D-047) ; **copie** dans le fil courant du Coach ; **extrait** `registre.sessionLog` (≤ 40, **synchronisé**,
  dédoublonné par `sessId`) ; `coachMemory` (résumé, synchronisé).
- **Tient** : un geste = au plus une génération (D-052) ; seul `complete` est un succès ; débrief rangé à
  sa séance, supprimé avec elle (D-047) ; « Voir » hors ligne.
- **Casse** : CC-37 (**l'extrait survit à la suppression — Milo peut citer une séance supprimée**), DN-02
  (records non recalculés), CC-35 (extraits relus par ordre d'arrivée, pas par date de séance), CC-11, CC-36,
  CC-22, DN-03, DN-05, AR-04, AR-10, LB-03, LB-09. **Lots** : DATA-INTEGRITE puis MILO-FLUX.

### D — Programme → version → progRef → séance passée → restauration de version
- **Tient** (branche) : une version à l'import, à la mise à jour, à la réanalyse, à la restauration et à la
  1ʳᵉ modification après un import ; restaurer crée une version, n'efface rien ; **aucune séance passée
  n'est jamais réécrite** (D-057).
- **Casse** : AR-01 / AR-02 (statut et `progRef` lus par personne → pas encore de « prévu vs réalisé »),
  NX-07 (deux appareils), NX-08 (quota iPhone), NX-09 (purge), CC-43 (supprimer le **dernier** programme
  n'atteint pas le cloud : il revient à la restauration d'un téléphone vide). **Lot** : PROG-SUITE.

### E — Progrès → Exercices → Corps & santé → Badges → futur Séances
- **Casse** : NV-01 / AR-03 (20 séances, détail = éditeur), CC-12 (calendrier → liste, pas la séance),
  CC-18, CC-41, CC-25 / DB-06 (D-045 appliquée à moitié : calendrier, « ⭐ PR », badge « Premier PR »),
  DB-11, DB-12, LB-08, CC-05 / CC-15 (cycle). **Lot** : UX-HIST (après DATA-INTEGRITE).

### F — Free/Premium → droits → quotas → Worker → fonctions IA
- **Propriétaires** : politique = `capacites-ia.js` (IA seulement : les murs non-IA n'ont pas de
  propriétaire) ; droits = `S.premium` (navigateur) ; plafond = serveur (identique pour tous) ; jeton =
  Worker (exigé pour **toute** IA).
- **Casse** : CC-09 / CC-10 (mur), CC-31, CC-33, CC-38, CC-48, CC-49, CC-52, DB-13, DB-17, DB-23, LB-06,
  FP-01, FP-02, NV-09, AR-07, NX-02. **Lots** : PREMIUM-A (vérité d'affichage, tôt) / PREMIUM-B (droits
  serveur, après Android).

### G — Navigation → modales → retours → menus → états implicites
- **Casse** : CC-06, CC-16, CC-29, CC-30, CC-39, CC-40, NV-02 → NV-06, NV-11 → NV-14, DB-20 → DB-22, LB-05,
  LB-10, AR-08. **Lot** : UX-NAV (un écran à la fois, bouton central mesuré).

### H — Démarrage → mise à jour du service worker → hors ligne
- **Casse** : CC-26 (mise à jour pendant une analyse Milo), CC-27 (pendant l'inscription — **terrain**),
  CC-28, NV-10 (pop-ups empilées), ET-02 (aucun indicateur hors ligne), ET-04. **Lot** : MAJ-DEMARRAGE.

### I — Admin → démo → personas → routes serveur
- **Casse** : S-01, S-02, NX-01, NX-03, CC-50, CC-51, ET-05. **Lot** : SEC-ADMIN.

## 11. Ordre des chantiers

**Règle de priorité appliquée** : sécurité → vérité des données → identité des objets → persistance →
flux entre modules → navigation / visuel. ⛔ Pas de lot « pour rendre l'app plus propre ».

**Préalable (décision de Michel)** : publier ou non le Lot 1. Tous les lots client suivants touchent
`log.js` ; les construire à côté d'une branche non publiée de 1 400 lignes fabriquerait des conflits.

| # | Lot | Contenu | Pourquoi à ce rang | Touche le serveur ? |
|---|---|---|---|---|
| 1 | **SEC-ADMIN** | S-01, NX-01, NX-03, S-02/CS-20, CC-45 | données personnelles exposées ; petit | **oui** (redéploiement) |
| 2 | **SEANCE-SAFE** | **CC-01 (P0)**, CC-05, CC-17, CC-19, CC-53, CC-21 | perte de séries faites, cycle bâti sur des valeurs d'exemple | non |
| 3 | **DATA-INTEGRITE** | DN-04 (**mesuré**), CC-37, DN-02, CC-22, CC-24 (historique, bilan), DN-05, NX-05, NX-06 | une suppression doit être cohérente partout **avant** qu'un écran Séances l'affiche | non |
| 4 | **SEC-COMPTE (client)** | CC-06, CC-14 / ET-03 / LB-04, CC-32, CC-07, CC-08, CC-13, DN-07 | messages visibles et état de sauvegarde honnête ; cycle de vie : après M-04 | non (H19 reste à part) |
| 5 | **UX-HIST** | NV-01, AR-03, CC-12, CC-18, CC-41, CC-25 / DB-06, LB-08 — sur le contrat §12 | | non |
| 6 | **MILO-FLUX** | AR-04, CC-35, CC-36, CC-11, DN-03, AR-10, LB-09, CC-33 — sur le contrat §13 | ⚠️ la partie « contexte » exige un **banc avant/après (R34)**, jamais tourné | non |
| 7 | **PREMIUM-A** | CC-09, CC-31, CC-38, CC-48, DB-13, LB-06, NV-09, FP-02, NX-02 (textes, murs fermables) | vérité d'affichage, **sans changer la politique** | non |
| 8 | **MAJ-DEMARRAGE** | CC-26, CC-27, CC-28, NV-10, ET-02, ET-04 | | non |
| 9 | **PROG-SUITE** (Lot 2 import) | AR-01 / AR-02 exploités, D-058, DB-03, NV-07, AR-09, LB-07, NX-04, NX-08, NX-09 | dépend de la publication du Lot 1 et du Worker (Lot 2) | Worker |
| 10 | **DATA-SYNC** | CC-43, CC-44, AR-06, DN-06, NX-07 | marque de suppression et fusion multi-appareils : **serveur** + décision | **oui** |
| 11 | **UX-NAV** | le reste de la chaîne G, écran par écran | | non |
| 12 | **PREMIUM-B** | AR-07, CC-49, FP-01, CC-10 | après Android (D-049) | **oui** |

**Prochains lots recommandés** : ① SEC-ADMIN · ② SEANCE-SAFE · ③ DATA-INTEGRITE · ④ SEC-COMPTE (client),
puis UX-HIST sur le contrat du §12. *(Le contre-audit avait raison : le v1 plaçait les données en lot 7, après
l'Historique et Milo — c'est l'inverse qui tient : un écran Séances au-dessus de suppressions incohérentes
afficherait des choses fausses.)*

## 12. Architecture minimale Historique / Séances (contrat avant code)

> ⛔ Le visuel final n'est pas décidé ici. Ce qui suit est le **contrat de données et de navigation**.
> Contraintes : l'historique essentiel reste **gratuit** (Vision Premium §4 et §8) ; le calendrier n'est
> pas redessiné ; D-043 / D-045 / D-047 / D-052 / D-057 s'appliquent.

**Ce qui existe aujourd'hui (mesuré)**
- **Où vivent les séances** : `S.sessions` (local, `ft4_sessions`, **≤ 1 500**, triées de la plus récente) ;
  cloud Apps Script (`u_<email>`, **≤ 2 000**, champ **omis** si l'historique a été tronqué faute de place) ;
  feuille « Séances » (lignes de `logSession`) ; miroir Supabase (écriture seule).
- **Combien sont visibles** : **20** (Progrès → Historique, sans « voir plus ») ; le calendrier ne mène
  pas à la séance du jour.
- **Identité** : `id` (horodatage de fin), `runId` (depuis le lot 3C), `progRef` (nouvelles séances,
  branche) ; clé du débrief `_dbfCle = id || ts || date` (⚠️ le repli **par date** confond deux anciennes
  séances du même jour).
- **Sauvegarde** : locale d'abord, puis instantané complet. **Restauration** : union par identifiant.
  **Autre appareil** : le dernier instantané gagne. **Hors ligne** : tout est local, « Voir le débrief »
  marche, « Analyser » le dit.
- **Suppression** : locale ; emporte le débrief (D-047) ; **laisse** l'extrait dans `sessionLog` (CC-37) et
  les records (DN-02) ; **aucune marque de suppression** → un autre appareil la fait revenir (CC-44).

**Contrat de données proposé (sans nouveau stockage — R2)**
- Une **projection calculée à la demande** depuis `S.sessions`, jamais stockée : `{cle, date, annee, mois,
  libelle, source (séance | import | Milo), progRef?, debrief (aucun | présent | interrompu), volume, duree,
  sync}`. `cle` = `id`, sinon `runId`, sinon `ts` — **jamais la date seule**.
- **Un seul propriétaire de la suppression** (`supprimerSeance(cle)`) qui emporte : la séance, son débrief,
  **son extrait `sessionLog`** (par `sessId`), et un **recalcul ciblé** des records des exercices touchés
  (la définition de « comparable » reste non tranchée : D-045 — à défaut, avertir au lieu de recalculer).
  Il garde une **marque locale** `{cle, supprimeeLe}` prête pour DATA-SYNC — **sans** l'envoyer tant que le
  serveur ne sait pas l'appliquer.
- **Débrief** : lu depuis `ft4_debriefs` (canonique, D-047) ; « Analyser » **ou** « Voir », jamais les deux
  (D-052).
- **progRef** : affiché quand il existe (« Programme · Jour · v3 ») ; les anciennes séances gardent leur
  libellé, **rien n'est reconstruit** (D-057). Le « prévu vs réalisé » est une suite (candidat Premium dans
  la Vision), pas ce lot.

**Contrat de navigation proposé**
- **Progrès → Séances → Année → Mois → Séance** : années repliées sauf l'année en cours ; un mois se déplie
  à la demande (rendu par mois, pas de `slice(0,20)`) ; la séance s'ouvre en **lecture**, avec un bouton
  explicite « Modifier » (sépare consulter et éditer — AR-03).
- **Calendrier → jour → « Revoir la séance »** ouvre **cette** séance (par sa clé) ; plusieurs séances ce
  jour-là → la liste du jour.
- Le retour ramène au mois, à la même position ; le sous-onglet choisi survit (aujourd'hui forcé à « Exercices », zone D).
- **Au-delà du téléphone** (> 1 500 séances, ou téléphone vidé) : **ne rien afficher de faux**. Une ligne
  « séances plus anciennes en ligne » n'existe que si le serveur sait les compter et les servir (nouvelle
  route = serveur + décision) — **hors du premier lot**.
- **Multi-appareils** : un débrief fait sur l'appareil A n'existe pas sur B (D-047, local), alors que son
  **extrait**, lui, voyage : sur B, la séance propose « Analyser » pendant que Milo connaît déjà le débrief.
  Conséquence d'une décision actée — **documentée, pas rouverte**.

## 13. Architecture minimale du flux Milo

**Hypothèse testée : « le problème est le flux, pas l'intelligence ».** ✅ **Vérifiée** pour les 13 constats
de la chaîne C : tous sont du routage, de la persistance ou de l'identité ; **aucun** ne demande de toucher au
raisonnement ni au prompt (R7). ⚠️ Limite : la qualité du modèle n'est pas mesurée ici (0 appel, R9/R34).

**Carte de bout en bout** : Séance (`finishWorkout` → `S.sessions[id]`) → **données** (résumé local
déterministe, toujours gratuit) → **analyse** (geste explicite, action `coach` + consigne de débrief +
bloc « SÉANCE À ANALYSER » avec la vraie séance) → **débrief** (accepté seulement si `complete`) →
**persistance** (`ft4_debriefs` local · **copie** dans le fil courant · **extrait** `sessionLog` synchronisé ·
`coachMemory` si le fil ≥ 4) → **affichage** (écran de fin, Progrès « Voir », fil du Coach) → **Coach**
(relit les 3 derniers extraits **par ordre d'arrivée**, la mémoire, les 8 derniers messages) → **mémoire**
(`coachMemory`, synchronisée, **invisible, non effaçable**) → **consultation** (« Voir le débrief » ; « Ce que
Milo sait de toi » montre les observations, **pas** la mémoire).

**Cinq contrats distincts — et c'est normal** (on ne cherche pas un prompt unique) :

| Contrat | Entrée | Sortie rangée où | Défaut d'identité / provenance |
|---|---|---|---|
| Chat libre | message, contexte complet, 8 messages, mémoire | fil (local), mémoire (cloud) | réponse non confirmée décomptée (CC-33) |
| Débrief de séance | la séance réelle (F1) | 3 endroits (AR-04) | extrait relu par arrivée (CC-35) ; survit à la suppression (CC-37) ; copie du fil sans référence à la séance |
| Mémoire (`summarizeCoach`) | fil | `coachMemory` | aucune provenance, invisible, non effaçable (DN-03) |
| Analyse de programme | programme, « coach expert », **sans** mémoire | **nulle part** (variable perdue) ; « Continuer dans le Coach » **remplace** le fil (CC-11) | ni version ni `progRef` (AR-10) |
| Cervelet séance → JSON | réponse de Milo | séance proposée | — (interne) |

Autour : imports, morphologie, nutrition — **d'autres moteurs** présentés sous le nom de Milo (zone E) ;
« une seule voix » (R6) est respectée, mais l'aide dit parfois le contraire de ce que Milo reçoit.

**Contrat minimal proposé (avant code)**
1. **Une enveloppe** pour toute sortie de Milo qui persiste : `{type, sujet (cle de séance | progRef | aucun),
   creeLe, source, complete}`.
2. **Une source canonique par type** ; les autres endroits **référencent** au lieu de copier (le fil porte
   une carte « Débrief du 03/10 » qui ouvre `ft4_debriefs[cle]`, pas le texte recopié).
3. **La suppression d'un sujet emporte ses projections** (séance supprimée → extrait retiré).
4. **Milo relit par date du sujet, pas par date d'arrivée.**
5. **Rien ne part sans geste** (D-052) ; « Continuer avec Milo » **emporte** la référence de la séance
   (CC-36) ; l'analyse de programme est rangée avec la version qu'elle a lue.
6. ⚠️ Les points 4 et 5 **changent ce que Milo reçoit** : banc avant/après obligatoire (**R34**), jamais tourné
   faute de clé — la partie stockage/affichage peut avancer, la partie contexte attend le banc.

## 14. Multi-appareils

| Donnée | Voyage ? | Conflit | Suppression |
|---|---|---|---|
| Séances | oui (≤ 2 000, omis si tronqué) | union par identifiant à la restauration ; sinon dernier instantané | **revient** depuis l'autre appareil (CC-44) |
| Programmes + versions | oui, liste entière | dernier instantané gagne (NX-07) | le dernier programme supprimé revient (CC-43) |
| Débriefs (texte) | **non** (D-047) | — | locale |
| Extraits de débrief (`sessionLog`) | **oui** | remplacement | jamais retirés (CC-37) |
| Mémoire de Milo | oui | remplacement | impossible (DN-03) |
| Questions gratuites | **non** (FP-01) | chaque appareil repart à 10 | — |
| Code perso / jeton | un par appareil | — | `ft4_hascode` jamais effacé (CC-45) |
| Document d'import | **jamais** (D-054) | portée par compte | effacé avec son programme |
| Séance en cours | non | deux onglets : le dernier gagne (CC-42, mesuré) | — |

⭐ **Ce qu'il faut retenir** : le modèle actuel est « **un téléphone principal + une sauvegarde** », pas un
vrai multi-appareils. Le rendre vrai demande une marque de suppression et une fusion **côté serveur**
(DATA-SYNC) — une décision d'architecture, pas un correctif.

## 15. Free / Premium

| Sujet | Vision Premium v0.1 (27/09, Drive) | Registre `capacites-ia.js` | Code réel | Serveur / Worker |
|---|---|---|---|---|
| Débrief Milo | « compris dans le quota Milo » | **PREMIUM** (19/09) | **gratuit, illimité, sans garde** | plafond commun |
| Mémoire longue | « partielle / complète » | PREMIUM (M12) | ouverte à tous (ft-v992) | — |
| « Milo démarre la séance » | « non / oui » | — | aucune garde | — |
| Étiquette / estimation / photo de code-barres | « un pool de 25 » | 3 capacités | **3 pots séparés** de 25 | — |
| Chat | 10 puis illimité | FREEMIUM 10 | 10, **par appareil** | **50 / jour / email pour tous** (Premium compris) |
| Promesse | « ne pas promettre un illimité IA sans mesure » (§8) | — | « Milo en illimité », « Estimations IA illimitées » | `premium` reçu, **jamais appliqué** |
| Historique essentiel | **gratuit**, jamais derrière le paywall (§4, §8) | — | gratuit | — |
| Prix | hypothèse 6,99-7,99 €/mois | — | 6,99 €/mois, 34,99 €/6 mois, essai 1,99 € — écrit en dur à ≥ 6 endroits ; serveur : « 4,99 €/2 mois » | Ko-fi : 3 / 31 / 184 jours |
| Achat | — | — | mailto sur les murs, Ko-fi ailleurs (DB-13) | webhook Ko-fi |

**Contradictions à soumettre, sans rien changer** (la Vision dit elle-même : *« aucune fonction existante ne
doit être déplacée derrière un paywall sur la seule base de ce document »*) : ① la promesse « illimité » contre
le plafond serveur et contre la règle §8 de la Vision (CC-49) ; ② le débrief : trois réponses différentes
(Vision, registre, code) ; ③ la fiche Premium vend des fonctions communes (LB-06) ; ④ les murs non-IA n'ont
pas de propriétaire de politique. Le futur Séances / « Mon évolution » doit respecter la frontière de la
Vision : **suivre et calculer = gratuit ; analyser, croiser, automatiser = Premium**.

## 16. Points terrain (à vérifier sur un vrai téléphone ou côté serveur)

| Point | Où | Pourquoi pas d'ici |
|---|---|---|
| Toast sous les fenêtres (CC-06) sur iPhone | téléphone | WebKit ≠ Chromium (RENDU-IOS-01) |
| Rechargement pendant l'inscription au 1ᵉʳ lancement (CC-27) | téléphone, installation neuve | dépend du service worker réel |
| Porte unique d'import (D-060 : appareil photo / photothèque / fichier) | iPhone | sélecteur système |
| Quota de stockage iPhone pour les versions (NX-08) | iPhone | Safari ≠ Chromium |
| S-01 présent dans le déploiement actif | éditeur Apps Script | production injoignable ; test interdit |
| Compte de Michel protégé par un code (sévérité de S-02) | app de Michel | propriété serveur |
| Valeurs réelles `AI_EMAIL_MAX` / `AI_GLOBAL_MAX` / `LECTURE_STRICTE` | propriétés du script | non lisibles d'ici |
| Jeton de maintenance ≠ exemple commenté (NX-03) | propriétés du script | non lisible — **rotation** proposée à la place |

---

## Annexe A — Réponses aux 10 questions du contre-audit

1. **Le lot Données arrivait-il trop tard ?** Oui. Le v1 le plaçait 7ᵉ, après l'Historique et Milo. Ordre
   retenu ici : SEC-ADMIN → SEANCE-SAFE → **DATA-INTEGRITE** → SEC-COMPTE → UX-HIST → MILO-FLUX. La partie
   multi-appareils (DATA-SYNC) reste plus tard : elle exige le serveur et une décision.
2. **Historique pluriannuel** : §12 — projection calculée depuis `S.sessions` (≤ 1 500), navigation Année →
   Mois → Séance, rendu par mois ; au-delà du téléphone, rien de faux tant qu'aucune route serveur ne sait
   compter et servir les anciennes années.
3. **Débrief = source canonique + projections ?** Oui : canonique `ft4_debriefs[cle]` ; projections = carte
   de référence dans le fil, extrait `sessionLog` (clé + date de la séance), export. La suppression les emporte.
4. **Milo : contrats multiples ou absence de contexte commun ?** Ni l'un ni l'autre exactement : les cinq
   contrats sont légitimes ; ce qui manque, c'est une **enveloppe d'identité/provenance** et **une règle de
   persistance par type** (§13). L'analyse de programme est le seul contrat sans mémoire ni rangement.
5. **S-01** : route présente dans le source et sans authentification ; données exposées = adresses des
   comptes Premium activés par code + liste en dur + déclencheurs ; **déploiement actif probable, non testé**.
6. **S-02** : privilèges = panneau admin **du téléphone** ; aucun privilège serveur (jetons séparés). Risque
   réel = la chaîne « mode admin sans email → email de Michel → synchronisation » : P1 ou P2 selon que son
   compte est protégé.
7. **M-14 « tout au tap » ?** Non, pas tel quel : un champ numérique libre écrirait des valeurs à moitié
   tapées (« 1 » pour « 180 ») et le poids créerait **une pesée datée par frappe**. Proposé : choix
   (boutons, listes) → immédiat ; champs libres → validés à la sortie du champ, bornés ; poids → par le
   propriétaire des pesées, confirmé ; sortie avec un champ non validé → garde.
8. **M-13 : pourquoi deux entrées Cycle ?** Aujourd'hui il n'y en a qu'**une** (Menu → Tes outils) ; le v1
   proposait d'en ajouter une dans Mes Programmes. Le vrai sujet est le **modèle** : un cycle de force est-il
   un programme (D-048) ? Lieu canonique + raccourci, à décider. CC-05 (cycle sur valeurs d'exemple) se
   corrige quoi qu'il arrive.
9. **CC-49, 50/jour contre « illimité »** : confirmé par lecture ; le Worker reçoit `premium` et ne s'en sert
   pas. P1 **avant toute vente**, décision commerciale (texte « usage étendu » ou plafond différencié).
10. **Delta Lot 1** : **fermés** CC-02, CC-03, CC-04, CC-23 ; **partiels** CC-24, CC-50, CC-52, DB-03, LB-01,
    LB-05, AR-01, AR-02 ; **aucun constat rendu faux** par le Lot 1 ; tout cela **sur branche non publiée**.

## Annexe B — Tableau delta complet (115 constats)

Colonnes : **Prio** (révisée si une mesure l'a justifié) · **Cat** (catégorie principale) · **Statut** à
`fb3d9fe6` · **Prod** = présent en production `ft-v1251` · **Preuve** dans le code actuel · **Chaîne** (§10) ·
**Lot** propriétaire (§11) · **Vérif** restante.

| ID | Constat (v1) | Prio | Cat | Statut | Prod | Preuve à `fb3d9fe6` | Chaîne | Lot | Vérif |
|---|---|---|---|---|---|---|---|---|---|
| CC-01 | Drop/+%/Retirer dropset effacent les séries validées | P0 | BUG | ouvert | présent | log.js:564-577 ex.sets=newSets (applyDropset) inchangé — banc v1 201-202 | B | SEANCE-SAFE | - |
| CC-02 | Sauvegarder comme programme écrase par nom (casse ignorée) et aplatit multi-jours | P1 | DATA | **fermé** (branche) | présent | log.js:10229-10253 _progMemeNom→_ouvrirProgCible ; D-062 ; témoin T-L1-01 — fermé sur branche NON publiée | D | (Lot 1) | - |
| CC-03 | Import Remplacer: cible préremplie 1er programme, sans confirmation; nouvel id; toast ancien nom | P1 | DATA | **fermé** (branche) | présent | log.js:6761-6766 cible par empreinte seulement ; 7799-7800 cible désignée ; _progNouvelleVersion — fermé sur branche NON publiée | D | (Lot 1) | - |
| CC-04 | deleteProg supprime en 1 tap sans confirmation | P1 | DATA | **fermé** (branche) | présent | log.js:9946-9954 showConfirm + « archive-le plutôt » — fermé sur branche NON publiée | D | (Lot 1) | - |
| CC-05 | 1RM vide = valeur d'exemple; cycle démarre sur 120/90/140/65 | P1 | BUG | ouvert | présent | tracking.js:322-326 getCycleInputRM lit le placeholder | E | SEANCE-SAFE | - |
| CC-06 | #toast z600 sous les fenêtres 9999 (inscription, restaurer, protéger) | P1 | BUG | ouvert | présent | style.css:1087 #toast (z 600) inchangé | G | SEC-COMPTE | terrain iPhone |
| CC-07 | Protéger exige email; aucun champ email hors Admin -> impasse | P1 | UX | ouvert | présent | app.js:7909 « Ajoute d'abord ton email dans le Profil » ; aucun champ hors Admin — attend M-04 | A | SEC-COMPTE | - |
| CC-08 | IA exige jeton d'appareil (email confirmé/code); nouvel inscrit sans email -> "Reconnecte ton appareil"; rien ne propose de confirmer | P1 | MILO | ouvert | présent | worker.js:201-219 jeton exigé ; aucun chemin dans le Coach | A | SEC-COMPTE | backend (LECTURE_STRICTE) |
| CC-09 | showPremiumWall hors quota (questions avancées, question semaine, menu photo, Activer code Nutrition) ; mur sans fermeture, texte faux "10 questions" | P1 | PREMIUM | ouvert | présent | coach.js:2907 showPremiumWall ; 1012-1026 openCoachQuiz('pro') ; #coach-wall sans fermeture | F | PREMIUM-COHERENCE | - |
| CC-10 | mur reposé au démarrage et après 10e réponse : fil/discussions illisibles | P1 | PREMIUM | décision | présent | app.js:10856 ; coach.js:5988 mur reposé — attend M-06 | F | PREMIUM-COHERENCE | - |
| CC-11 | continueInCoach remplace coachHistory sans ranger | P1 | MILO | ouvert | présent | log.js:11073-11080 continueInCoach remplace coachHistory | C | MILO-FLUX | - |
| CC-12 | calendrier/tuile/vue semaine -> liste 20 dernières, pas LA séance | P1 | UX | ouvert | présent | screens.js:2444 « Revoir la séance » → goSessionsHistory() ; setup.js:1700 slice(0,20) — calendrier : destination seulement | E | UX-HIST | - |
| CC-13 | Restaurer avec email B sur appareil A: union par id puis synchro vers B; texte promet "aucune donnée écrite" | P1 | DATA | ouvert | présent | setup.js _applyRestoreData union + persist ; index.html:3692 texte faux | A | SEC-COMPTE | backend |
| CC-14 | S.connected posé par ping, jamais remis à faux: "Sheets ✓" vert sans sauvegarde | P1 | UX | ouvert | présent | app.js:10818 S.connected=true au ping | A | SEC-COMPTE | - |
| CC-15 | endCycle sans confirmation | P2 | UX | ouvert | présent | tracking.js:358-362 endCycle sans confirmation | E | UX-NAV | - |
| CC-16 | fermeture sans garde: modifs perdues | P2 | DATA | ouvert | présent | log.js:10956 closeProgEdit ; setup.js closeSessDetail ; closeProfil sans garde | G | UX-NAV | - |
| CC-17 | nom effacé à l'ajout d'exercice | P2 | BUG | ouvert | présent | log.js:10644 _renderProgEdit remet nameInp.value=d.name à chaque rendu | B | SEANCE-SAFE | - |
| CC-18 | editSessDuree rouvre version enregistrée: corrections perdues | P2 | BUG | ouvert | présent | setup.js:1352 editSessDuree inchangé | E | UX-HIST | - |
| CC-19 | date=today() écrase la date choisie | P2 | BUG | ouvert | présent | log.js chargement d'un jour : date=today() inchangé | B | SEANCE-SAFE | - |
| CC-20 | reps/kg viennent de la dernière séance, pas du programme; prescription invisible | P2 | PRODUCT | décision | présent | charges de la dernière fois = comportement documenté (aide Programmes) ; reps du programme perdues — à soumettre (R14) | B | SEANCE-SAFE | - |
| CC-21 | écran de fin attend syncSheets (jusqu'à 8 s) | P2 | UX | ouvert | présent | log.js:4543 persist() AVANT ; 4566 await syncSheets avant l'écran de fin — local d'abord respecté | B | SEANCE-SAFE | - |
| CC-22 | Remplacer (conflit de date) supprime la 1re séance du jour, débrief orphelin | P2 | DATA | ouvert | présent | log.js finalImportHist : findIndex par date + splice, débrief non nettoyé | C | DATA-INTEGRITE | - |
| CC-23 | mode d'import remis à zéro sans l'affichage (Remplacer paraît actif) | P2 | BUG | **fermé** (branche) | présent | log.js:6845 impRecommencer remet l'état ; 6786/7617 rendu depuis _impMode ; mode « Remplacer » disparu — fermé sur branche NON publiée | B | (Lot 1) | - |
| CC-24 | PDF coupé à 8 pages sans le dire | P2 | BUG | partiel | présent | log.js:6632-6639 import programme refuse >8 p ; _pdfToImages tronque encore (log.js:6927 ; appelants 7936 historique, app.js:9109 plan repas, tracking.js:2154 bilan sanguin) — plan repas = Nutrition gelée | B | DATA-INTEGRITE | - |
| CC-25 | étoile Record sur 1re fois (contre D-045) | P2 | BUG | ouvert | présent | screens.js:2191 _calPrDays compte la 1re occurrence — résidu D-045 (application, pas réouverture) | E | UX-HIST | - |
| CC-26 | mise à jour ignore analyse Milo en vol -> "Analyse interrompue" | P2 | BUG | ouvert | présent | app.js:11043 _majPeutSAppliquer ne lit ni _dbfEnVol ni coachBusy | H | MAJ-DEMARRAGE | - |
| CC-27 | rechargement SW pendant l'inscription | P2 | TERRAIN | ouvert | présent | app.js:11120-11123 sans garde de 1er contrôleur (inférence v1) | H | MAJ-DEMARRAGE | terrain |
| CC-28 | persist() sur Accueil applique la MAJ en attente (rechargement immédiat) | P2 | BUG | ouvert | présent | state.js persist → _appliquerMaj sur Accueil | H | MAJ-DEMARRAGE | - |
| CC-29 | retour Android ferme le menu ET dépile (hors Accueil); ne ferme pas sur Accueil | P2 | UX | ouvert | présent | app.js popstate : tiroir hors .overlay | G | UX-NAV | - |
| CC-30 | Ce que Milo sait de toi: 2 cibles | P2 | UX | ouvert | présent | index.html : même libellé, 2 cibles (openMiloKnows / openCoachQuiz) | G | UX-NAV | - |
| CC-31 | _agPremiumCta ouvre le Coach au lieu de la fiche Premium | P2 | UX | ouvert | présent | app.js:8478 _agPremiumCta → Coach | F | PREMIUM-COHERENCE | - |
| CC-32 | restauration attendue sans affichage: synchro en pause indéfinie | P2 | DATA | ouvert | présent | setup.js _cloudSync bloqué si restau attendue ; aucun affichage | A | SEC-COMPTE | - |
| CC-33 | chat ne vérifie pas complete: "Désolé, réessaie." affiché comme réponse, question décomptée | P2 | MILO | ouvert | présent | coach.js:5895 marque « non confirmée » (v1 imprécis) ; 5985-5988 question décomptée quand même — reformulé : le décompte reste | F | MILO-FLUX | - |
| CC-34 | Programme perso reconnu comme demande de séance | P2 | MILO | décision | présent | coach.js:1691 la tuile parle de « séance » ; D-032 conserve master, H26 « pas de chasse aux formulations » — à soumettre, pas à corriger d'office | C | MILO-FLUX | - |
| CC-35 | continuité "MA séance d'aujourd'hui"; sessionLog par ordre d'arrivée | P2 | MILO | ouvert | présent | coach.js:4079 slice(-3) par ordre d'arrivée ; 4725 sessId existe mais pas d'ordre par date | C | MILO-FLUX | - |
| CC-36 | Continuer avec Milo ne transmet rien | P2 | MILO | ouvert | présent | index.html:2168 closeSessionEnd('coach') n'emporte rien | C | MILO-FLUX | - |
| CC-37 | supprimer séance laisse extrait sessionLog et records | P2 | DATA | ouvert | présent | setup.js:1599-1614 deleteSessOrConfirm : séance + débrief retirés ; registre.sessionLog et S.prs intacts ; coach.js:4079 Milo relit sessionLog | C | DATA-INTEGRITE | - |
| CC-38 | refus Premium après l'effort | P2 | PREMIUM | ouvert | présent | tracking.js:2195 refus Premium après verrou + masquage | F | PREMIUM-COHERENCE | - |
| CC-39 | textes renvoyant à des chemins inexistants | P2 | UX | ouvert | présent | constants.js / app.js / screens.js textes « Profil → … » inchangés | G | UX-NAV | - |
| CC-40 | Profil enregistre de deux façons; taille/poids/repos perdus à ✕ | P2 | DATA | décision | présent | setup.js saveProfile vs écritures au tap ; ✕ sans garde — attend M-14 (reformulée) | G | UX-NAV | - |
| CC-41 | confirm() natif où Annuler = "retour au calme (APRÈS)" | P2 | UX | ouvert | présent | setup.js:1309 confirm() natif détourné | E | UX-HIST | - |
| CC-42 | ft4_wkt non fusionnée entre onglets: dernier qui écrit gagne | P2 (v1 P1) | DATA | ouvert | présent | SONDE 08/10 : onglet 1 (2 séries) puis onglet 2 → ft4_wkt ne contient plus que l'onglet 2 — mécanisme confirmé ; exposition faible en PWA installée (une fenêtre) | B | DATA-INTEGRITE | sonde locale faite |
| CC-43 | suppressions ne remontent pas au cloud (dernier programme, pesée, bilan, poids cible...) | P2 | DATA | ouvert | présent | setup.js _corpsSync : listes remplacées, vide jamais gagnant ; pas de marque de suppression | A | DATA-SYNC | backend |
| CC-44 | union par id sans marque de suppression: séance supprimée revient d'un autre appareil | P2 | DATA | ouvert | présent | state.js:844 _fusionnerSeancesRestauration union par id, pas de tombstone | A | DATA-SYNC | backend |
| CC-45 | ft4_hascode jamais effacé: verrou santé reste ouvert après désactivation/changement de compte | P2 | SEC | ouvert | présent | tracking.js:19-20 ft4_hascode posé, jamais effacé — verrou santé | A | SEC-COMPTE | - |
| CC-46 | jour consulté du Journal non remis à aujourd'hui | P3 (v1 P2) | UX | ouvert | présent | app.js:5782,5796 jour consulté (Nutrition gelée) — voisin de D-011/D-012 | - | (gel Nutrition) | - |
| CC-47 | raccourci Code-barres ouvre le clavier | P3 (v1 P2) | UX | ouvert | présent | app.js:4145 raccourci 📷 → clavier (Nutrition gelée) | - | (gel Nutrition) | - |
| CC-48 | phrase d'erreur serveur non relayée | P2 | UX | ouvert | présent | app.js:4556,4608,4638,9012 phrase serveur ignorée hors chat — portes Nutrition gelées | F | PREMIUM-COHERENCE | - |
| CC-49 | serveur plafonne toutes IA à 50/j/email, Premium compris, vs "Milo en illimité" | P1 (v1 P2) | PREMIUM | décision | présent | Code.js:1160-1161 600/50 ; worker.js:114 premium lu, inutilisé — P1 avant toute vente (contre-audit) ; décision commerciale | F | PREMIUM-COHERENCE | backend (valeurs réelles) |
| CC-50 | démo annonce "rien ne sera enregistré" mais fil/débriefs/coachMemory/préférences s'écrivent | P3 | DATA | partiel | présent | Lot 1 : aucun accès IndexedDB en démo, _progSauver sans écriture ; restent finishWorkout direct, débriefs, fil, coach_mem, vus | I | SEC-ADMIN | - |
| CC-51 | personas remplacent S sans bandeau ni blocage (admin) | P3 | DATA | ouvert | présent | coach.js:6715-6716 persona remplace S (Lot 1 : document d'import exclu seulement) | I | SEC-ADMIN | - |
| CC-52 | quota d'import compté dès l'analyse | P3 | PREMIUM | partiel | présent | log.js:7082 compté après lecture utile (plus sur échec/annulation/vide) mais avant l'enregistrement | F | PREMIUM-COHERENCE | - |
| CC-53 | sous-titre de fin = date du jour, pas celle de la séance | P3 | UX | ouvert | présent | log.js _showSessionEnd sous-titre = date du jour | B | SEANCE-SAFE | - |
| DB-02 | même fenêtre, deux noms (Scanner/Importer) | P3 | UX | ouvert | présent | index.html:623 « Scanner ton programme » vs 3367 « Importer un programme » | B | UX-NAV | - |
| DB-03 | 5 chemins de création, 3 règles de nom (remplacement / suffixe 2 / doublon) | P2 | ARCH | partiel | présent | saveAsProg demande (D-062) ; coach.js:1774 suffixe « 2 » ; import/manuel : même nom autorisé (D-061) | D | PROG-SUITE | - |
| DB-06 | Record 4 règles; D-045 non appliquée partout (calendrier, ⭐PR, badge Premier PR) | P2 | BUG | ouvert | présent | 4 règles de « record » (graphe, période, calendrier, bilan) ; badge Premier PR — résidu D-045 | E | UX-HIST | - |
| DB-07 | 3 notions de plan de force (s-cycle, Big 3, programme à semaines) | P3 | PRODUCT | décision | présent | s-cycle / Big 3 / programme à semaines — M-13 | E | PROG-SUITE | - |
| DB-11 | 3 écrivains du même poids | P3 | UX | ouvert | présent | même propriétaire _enregistrerPesee, 3 portes | E | UX-HIST | - |
| DB-12 | 2 calculs %MG (Marine US / US Navy) | P3 | ARCH | ouvert | présent | setup.js renderBFCard vs tracking.js _bfNavy — proche Nutrition (Katch) : prudence | E | UX-HIST | - |
| DB-13 | 4 formes de mur, 3 listes d'avantages, 2 chemins d'achat | P2 | PREMIUM | ouvert | présent | 4 murs, 3 listes, mailto vs Ko-fi | F | PREMIUM-COHERENCE | - |
| DB-17 | deux murs différents pour la morphologie | P3 | PREMIUM | ouvert | présent | setup.js:2111 vs 2226 | F | PREMIUM-COHERENCE | - |
| DB-20 | Partager x2 + "Partager" bilans = copier | P3 | UX | ouvert | présent | « Partager » ×2, bilans = copier | G | UX-NAV | - |
| DB-21 | Apparence (Menu) / Accessibilité (Profil) éclatées | P3 | UX | ouvert | présent | Apparence (Menu) / Accessibilité (Profil) | G | UX-NAV | - |
| DB-22 | adresse perso (Menu, À propos, Premium) vs adresse de l'app (Confidentialité) | P3 | PRODUCT | décision | présent | adresse perso vs adresse de l'app — choix de Michel | G | UX-NAV | - |
| DB-23 | code Premium vs code perso | P3 | UX | ouvert | présent | « code d'accès » Premium vs code perso | F | PREMIUM-COHERENCE | - |
| NV-01 | historique limité à 20, sans voir plus | P1 | UX | ouvert | présent | setup.js:1700 slice(0,20) sans « voir plus » | E | UX-HIST | - |
| NV-02 | Échap sans effet | P3 (v1 P2) | UX | ouvert | présent | aucun écouteur Escape — ordinateur seulement | G | UX-NAV | - |
| NV-03 | choix du jour/import ferment Mes Programmes; retour n'y ramène pas | P2 | UX | ouvert | présent | openDaySel / import ferment Mes Programmes | G | UX-NAV | - |
| NV-04 | tap fond ferme toutes fenêtres sauf Mes Programmes | P2 | UX | ouvert | présent | index.html:3343 mod-prog sans fermeture au fond | G | UX-NAV | - |
| NV-05 | onglet allumé incohérent | P2 | UX | ouvert | présent | setup.js openMenuDrawer / openProfil | G | UX-NAV | - |
| NV-06 | « ‹ Accueil » ramène toujours à l'Accueil | P3 (v1 P2) | UX | ouvert | présent | index.html « ‹ Accueil » → goScreen('home') | G | UX-NAV | - |
| NV-07 | bibliothèque seulement depuis l'écran Séance | P2 | UX | ouvert | présent | Mes Programmes seulement depuis Séance (Lot 1 n'ajoute pas de porte) | B | PROG-SUITE | - |
| NV-08 | aucune porte depuis Accueil/Progrès | P3 (v1 P2) | UX | ouvert | présent | aucune porte Nutrition hors barre (gel) | - | (gel Nutrition) | - |
| NV-09 | fiche Premium sans ✕ | P2 | UX | ouvert | présent | ov-premium-info sans ✕ | F | PREMIUM-COHERENCE | - |
| NV-10 | bilan hebdo/mensuel/Quoi de neuf s'empilent | P2 | UX | ouvert | présent | app.js bilans hebdo/mensuel sans file | H | MAJ-DEMARRAGE | - |
| NV-11 | écran sans titre | P3 | UX | ouvert | présent | index.html Profil sans titre | G | UX-NAV | - |
| NV-12 | aide ? = aide de l'Accueil | P3 | UX | ouvert | présent | screens.js aide cycle = Accueil | G | UX-NAV | - |
| NV-13 | Mes discussions reste ouvert hors écran, bloque le glisser | P3 | UX | ouvert | présent | ov-coach-convs imbriqué | G | UX-NAV | - |
| NV-14 | fenêtres inatteignables, ancien tiroir | P3 | ARCH | faux positif (partiel) | présent | mod-plate, ov-tester-eq, ov-bday = retraits volontaires (R30, H16) ; restent #drawer, mod-checkin, ov-pr-congrats, ov-lang à instruire — faux positif partiel | G | UX-NAV | - |
| LB-01 | Remplacer = 6 effets | P2 | UX | partiel | présent | import « Remplacer » devenu « Mettre à jour » versionné ; saveAsProg demande ; restent Remplacer exercice (D-046), séance, conflit d'historique | B | UX-NAV | - |
| LB-02 | Terminer = enregistrer/fermer/supprimer | P3 (v1 P2) | UX | ouvert | présent | « Terminer » = enregistrer / fermer / supprimer | B | UX-NAV | - |
| LB-03 | Analyser = 4 traitements | P2 | UX | ouvert | présent | « Analyser » = débrief / programme / morpho / Nutrition | C | MILO-FLUX | - |
| LB-04 | jargon Sheets; COMPTE SYNCHRONISÉ · Non connecté | P2 | UX | ouvert | présent | « Sheets » ; « COMPTE SYNCHRONISÉ · Non connecté » | A | SEC-COMPTE | - |
| LB-05 | aides fausses/périmées | P2 | UX | partiel | présent | aides Programmes mises à jour par le Lot 1 ; restent cycle, bilans, cardio/TDEE, « Photographier le code-barres »… | G | UX-NAV | - |
| LB-06 | PREMIUM_PERKS vend des fonctions communes | P2 | PREMIUM | ouvert | présent | constants.js PREMIUM_PERKS inchangé | F | PREMIUM-COHERENCE | - |
| LB-07 | Programme mis à jour ✅ pour une création | P3 | UX | ouvert | présent | log.js:10951 « Programme mis à jour ✅ » aussi pour une création | B | PROG-SUITE | - |
| LB-08 | Historique des pesées = bilans; "Partager" copie | P3 | UX | ouvert | présent | tracking.js « Historique des pesées » = bilans | E | UX-HIST | - |
| LB-09 | étiquette [DÉBRIEF AUTO] alors que débrief à la demande | P3 | MILO | ouvert | présent | consigne « [DÉBRIEF AUTO] » alors que D-052 — change ce que Milo reçoit : banc R34 | C | MILO-FLUX | - |
| LB-10 | Séance/Objectif/Cycle/Bilan 4 sens chacun | P3 (v1 P2) | UX | ouvert | présent | Séance / Objectif / Cycle / Bilan polysémiques | G | UX-NAV | - |
| ET-01 | ni déconnexion, ni changement, ni suppression; confidentialite.html promet effacement | P1 | PRODUCT | décision | présent | aucune déconnexion / changement / suppression ; confidentialite.html:180 promet l'effacement — promesse publique non tenue ; M-04 | A | SEC-COMPTE | - |
| ET-02 | hors ligne: ni bannière ni pastille | P2 | UX | ouvert | présent | aucun indicateur hors ligne | H | MAJ-DEMARRAGE | - |
| ET-03 | point vert "Compte synchronisé" au-dessus de "Sauvegarde en pause" | P2 | UX | ouvert | présent | setup.js point vert = email && connected | A | SEC-COMPTE | - |
| ET-04 | date figée au lancement | P3 | BUG | ouvert | présent | app.js date posée une fois | H | MAJ-DEMARRAGE | - |
| ET-05 | faux toast de synchro; sortie de démo non annoncée | P3 | BUG | ouvert | présent | tracking.js:90 syncSheets {ok:true} en démo | I | SEC-ADMIN | - |
| DN-01 | persist() réécrit 106 clés + synchro complète 4 s après | P2 | ARCH | ouvert | présent | persist() réécrit toutes les clés + synchro 4 s (Lot 1 : _progSauver écrit d'abord ses clés) | A | DATA-SYNC | - |
| DN-02 | records jamais recalculés après suppression d'une séance | P2 | DATA | ouvert | présent | suppression de séance sans recalcul de S.prs — « comparable » non tranché (D-045) | C | DATA-INTEGRITE | - |
| DN-03 | coachMemory synchronisée, invisible, non effaçable | P2 | MILO | ouvert | présent | coachMemory synchronisée, invisible, non effaçable — M-08 | C | MILO-FLUX | - |
| DN-04 | ~20 JSON.parse non protégés: valeur illisible interrompt load() | P1 (v1 P2) | DATA | ouvert | présent | state.js:579 S.badges=JSON.parse sans garde ; SONDE 08/10 : ft4_badges illisible → foodLog et bodyScans non chargés, le persist suivant les écrit vides ([]) — mesuré : perte du journal alimentaire et des bilans au persist suivant | A | DATA-INTEGRITE | sonde locale faite |
| DN-05 | Exporter tout n'inclut pas les débriefs | P3 | DATA | ouvert | présent | « Exporter tout » sans débriefs | C | DATA-INTEGRITE | - |
| DN-06 | ft4_sessions_conflits invisible | P3 | DATA | ouvert | présent | ft4_sessions_conflits sans écran | A | DATA-SYNC | - |
| DN-07 | repli IndexedDB de l'email inopérant | P3 | BUG | ouvert | présent | app.js:9225 _getEmailFromIDB | A | SEC-COMPTE | - |
| FP-01 | compteur questions gratuites local (non synchronisé) | P2 | PREMIUM | décision | présent | coachFree local, non synchronisé — M-11 | F | PREMIUM-COHERENCE | - |
| FP-02 | 🤖 Coach IA visible pour tous dans l'éditeur -> toast Premium | P3 | PREMIUM | ouvert | présent | index.html éditeur « 🤖 Coach IA » visible → toast | F | PREMIUM-COHERENCE | - |
| AR-01 | pas de programme actif | P1 | ARCH | partiel | présent | statut active + _progDefinirEnCours (D-053) ; non lu par Accueil ni Milo (D-067), chargement ne le pose pas | D | PROG-SUITE | - |
| AR-02 | séance ↔ programme par libellé seul | P1 | ARCH | partiel | présent | progRef {id,version,day} sur les NOUVELLES séances (log.js:4461, 9377) ; aucun lecteur ; anciennes séances par libellé | D | PROG-SUITE | - |
| AR-03 | historique enterré, 20 max, détail = éditeur | P1 | ARCH | ouvert | présent | historique sous Progrès, 20 max, détail = éditeur | E | UX-HIST | - |
| AR-04 | débrief en 3 copies effacées différemment | P1 | ARCH | ouvert | présent | ft4_debriefs + copie fil + extrait sessionLog | C | MILO-FLUX | - |
| AR-05 | pas de cycle de vie du compte; Restaurer sert de connexion | P1 | ARCH | ouvert | présent | pas de cycle de vie du compte | A | SEC-COMPTE | - |
| AR-06 | cloud = état du dernier appareil; pas de fusion; suppressions non transmises | P1 | ARCH | ouvert | présent | cloud = dernier instantané ; Lot 1 : programmes omis si mémoire ≠ disque (setup.js:985-994) | A | DATA-SYNC | backend |
| AR-07 | Premium appliqué seulement côté navigateur | P2 | ARCH | ouvert | présent | worker.js:114 ; Code.js:2011 premium renvoyé, jamais appliqué — après Android (D-049) | F | PREMIUM-COHERENCE | - |
| AR-08 | tiroir mélange tout; Profil sans titre ni statut | P2 | ARCH | ouvert | présent | tiroir 4 rayons + Apparence — M-12 | G | UX-NAV | - |
| AR-09 | Séance vide = 7 départs; bibliothèque modale | P2 | ARCH | ouvert | présent | Séance vide 7 départs, bibliothèque modale | B | PROG-SUITE | - |
| AR-10 | Milo plusieurs contrats; analyse de programme non stockée | P2 | ARCH | ouvert | présent | contrats Milo multiples ; analyse de programme non rangée | C | MILO-FLUX | - |
| S-01 | route de diagnostic serveur publique, sans authentification, qui expose des données de comptes Premium | P1 | SEC | ouvert | présent | Code.js, `doGet` : route de diagnostic sans jeton (détail hors dépôt) — confirmé par lecture ; déploiement non testé | I | SEC-ADMIN | test sécurisé backend |
| S-02 | code de secours admin en clair dans le JS public | P2 | SEC | ouvert | présent | constants.js : code de secours public → panneau admin du téléphone ; mode admin sans email → email par défaut (app.js) — confirmé par lecture | I | SEC-ADMIN | backend (compte protégé ?) |

## Annexe C — Constats nouveaux (post-audit ou révélés par la mise en conflit)

| ID | Constat | Prio | Cat | Preuve | Chaîne | Vérif | Lot |
|---|---|---|---|---|---|---|---|
| NX-01 | Une route de test du serveur, sans jeton, écrit puis efface un compte fictif dans les propriétés du script | P3 | SEC | Code.js, doGet (route de test) : aucun contrôle de jeton | I | confirmé par lecture | SEC-ADMIN |
| NX-02 | Le panneau admin « IA » affiche des plafonds par défaut (1500 / 100) différents de ceux appliqués (600 / 50) quand les propriétés ne sont pas posées (R2) | P3 | BUG | Code.js:757-758 vs Code.js:1160-1161 | F | confirmé par lecture | PREMIUM-COHERENCE |
| NX-03 | Un commentaire du serveur montre un exemple de jeton de maintenance ; si la propriété vaut cet exemple, la route correspondante est ouverte | P3 | SEC | Code.js (commentaire de la route d'installation des sauvegardes) | I | backend : propriété non lisible d'ici | SEC-ADMIN |
| NX-04 | Un brouillon d'import commencé « sans compte » devient invisible quand un email est ajouté (portée local → compte) | P3 | DATA | log.js _impScope ; JOURNAL-DE-TEST 08/10 | A | confirmé (fermeture P2) | PROG-SUITE |
| NX-05 | L'alerte « stockage plein » générale de persist promet une sauvegarde en ligne même sans compte | P3 | UX | state.js persist (branche quota) ; JOURNAL-DE-TEST 08/10 | A | confirmé (fermeture P2) | DATA-INTEGRITE |
| NX-06 | Un échec d'écriture dans persist interrompt les clés suivantes (un seul try) | P3 | DATA | state.js persist | A | confirmé par lecture | DATA-INTEGRITE |
| NX-07 | Versions de programmes sur deux appareils : la liste part en bloc, le dernier instantané gagne — des versions créées sur l'autre appareil peuvent disparaître | P2 | DATA | setup.js _corpsSync (programmes remplacés) ; Code.js remplace la liste | D | inférence (pas de banc multi-appareils) | DATA-SYNC |
| NX-08 | Quota de stockage réel d'un iPhone (Safari) pour les versions de programmes non mesuré | P3 | TERRAIN | mesure Chromium seulement (tools/mesure_versions_programme.js) | D | terrain iPhone | PROG-SUITE |
| NX-09 | Purge des versions (D-069) à trancher ; D-063 → D-068 au statut PROPOSÉ | P2 | PRODUCT | docs/DECISIONS.md | D | décision Michel | PROG-SUITE |

## Annexe D — Écarts documentaires relevés (non corrigés : hors périmètre de cette nuit)

- `CLAUDE.md` : « le scanner caméra n'a pas de bouton » (remplacé le 17/09) · liste Premium en dur à 3
  adresses (le code en a 5) · écrans (« Setup », `s-cycle` « depuis s-home », bouton central « 54 px »,
  « pas de JS inline ») · bilans placés dans « Profil → Santé » (ils sont dans Progrès) · mode clair décrit
  comme actif (en pause).
- `docs/DECISIONS.md` : D-055 renvoie à « D-071 » et D-056 à « D-070 », **qui n'existent pas** (la purge est
  D-069, la valeur 8 pages est D-066). Non corrigé ici : le registre s'ajoute, il ne se réécrit pas — à
  trancher par une ligne de correction datée.
- `docs/INVENTAIRE.md` : compte 68 fenêtres ; l'expression de `tools/inventaire.py` ne voit pas les fenêtres
  écrites `id=… class="overlay"` (4 fenêtres de compte) — écart connu, **non corrigé** (mission d'analyse).
- Texte de « Restaurer » : « aucune donnée ne sera écrite vers le serveur » (faux) · `confidentialite.html` :
  « efface-les dans l'app » (aucun effacement) · aides périmées (LB-05).
- `docs/CONTEXTE-ACTUEL.md` : « D-043 → D-045 validées mais non implémentées » (publiées en ft-v1250).

## Annexe E — Méthode et limites

- **Lu en entier** : document principal (3 188 lignes), contre-audit, les 7 cartographies (A 934, B 711,
  C 484, D 594, E 625, F 529, G 688 lignes), `verifs-live.md`, le condensé du banc (`digest.txt`, scénarios
  s00 → s11), les sources des schémas (`.dot` et Mermaid), la Vision Premium v0.1 (Drive, lecture seule).
- **Partiellement** : captures du banc — **7 sur 141 regardées** (programmes, historique, fin de séance,
  murs, dropset, Restaurer) ; journaux JSON s10/s11 en extrait ; scripts du banc non relus ligne à ligne
  (méthode décrite par `verifs-live.md`).
- **Code** : `git diff 6969ce73 fb3d9fe6` + lecture ciblée de chaque preuve ; deux sondes locales non
  destructives (copie de l'arbre, réseau coupé, 0 appel IA) pour DN-04 et CC-42.
- **Non fait, volontairement** : aucun test en production, aucun appel au serveur ni au Worker, aucune
  modification du code produit, aucune décision inscrite au registre.
