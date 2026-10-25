# 🔎 NUTRITION V2 · FIABILITÉ DES DONNÉES — dossier de livraison à Claude Principal

> **Mission P1 de Michel du 24/10/2026** (« Claude Nutrition corrige Nutrition, Claude Principal coordonne, intègre et
> qualifie »). Branche `claude/nutrition-v2`, **NON fusionnée, NON publiée, rien de redéployé, aucune donnée réelle
> touchée**. Ce dossier suit la liste de `docs/CHANTIER-NUTRITION-SEANCE.md` §8.7 (ce que chaque session livre).
> Décisions : `D-130` → `D-135` (réservées à Claude Nutrition, §8.4). Bugs : `BUGS.md` §113 → §117, puis §118 → §120
> pour les trois conditions de Claude Principal du 25/10 (**§12**).
> Banc : `tools/banc_nut_fiabilite.js` (module `tests/parcours/nut_fiabilite.js`, blocs **B-NFIAB** et **B-NFIAB-X**) ·
> contrôle négatif : `tools/mut_nut_fiabilite.py`.

---

## 1. En une phrase par problème

| # | Ce que Michel a vu | La cause (démontrée) | Ce qui change | Preuve |
|---|---|---|---|---|
| P1-a | L'isolat repris à 40 g (156 · 35 · 1 · 1) ne bouge plus à 35 g ni à 50 g, « fiche non vérifiée » | une ancienne ligne scannée n'est vérifiable que contre CIQUAL : figée à vie ; sa recopie perdait le code-barres ; aucune issue à l'écran (§113) | **dans l'écran**, la fiche se retrouve par l'**identité** (journal, puis Open Food Facts en ligne) et l'écran dit ce que disait la saisie ; sans elle : 🔎 Retrouver · 📷 Scanner · 🏷️ Étiquette (`D-130`) | T02 ② → ⑦ |
| P1-b | Le steak scanné proposé « 200 g · 130 kcal · 22 g » | un pour-100 g **fabriqué** le 01/09 (65 au lieu de 129), recopié de reprise en reprise, proposé et ré-écrit sans réserve (§114) | les saisies du même produit qui se contredisent se disent « ⚠️ à vérifier » ; « + Ajouter » n'écrit rien ; en ligne, la fiche du code-barres revient (`D-131`) | T06 ① ③ ④ |
| P1-c | L'isolat à 26 g **et** à 35 g de protéines ; le même produit à 155 ou 156 kcal | le favori d'avant V2 (26 g) à côté de la ligne vérifiée ; la recherche Open Food Facts arrondissait l'énergie pour 100 g à l'entier (§114) | **règle A de `D-111` (Michel, 24/10)** : dans la liste, la ligne vérifiée reste visible et le favori contradictoire se dit « ⚠️ à vérifier », « + Ajouter » ouvre l'écran ; **dans l'écran**, sa fiche se retrouve et « Ajouter » écrit 155 · 35 · 1 · 1 ; un seul propriétaire de l'énergie pour 100 g ; le favori **se corrige** sans toucher au journal (`D-134`) | T02 ⑥ ⑥b, T09 ① ⑤, F ① ② ③ |
| P1-d | Un aliment retiré revient (« Déjà noté par toi », « Restaurer », autre appareil) | « ✕ » était une liste locale, ignorée par la recherche, jamais synchronisée, effacée au re-noter (§115) | des **dates de départ** synchronisées, fusionnées par le max au téléphone et au serveur (`D-132`) | N2 ① ②, T08 ① → ⑦ |
| §4 | « Repartir avec des propositions propres, sans supprimer le journal » | — | remise à zéro **préparée** (Admin) : périmètre exact → sauvegarde → exécution confirmée, refusée sans sauvegarde à jour ; **jamais exécutée** (`D-133`) | T07 ① → ④, R ① ②, T12 ① |
| §6 | Des chiffres dans des ordres différents ; « pour 100 g » et « mangé » confondus | deux formats, et rien ne disait lequel était une référence (§6 de la mission) | « **calories · pour Q · P · G · L** » partout ; « pour 100 g » = une référence (`D-135`) | T03 ①, T06 ① ②, T09 ① |

## 2. Branche, commits, état

- Branche `claude/nutrition-v2`, repartie de master `999b7947`, **master `98c09ed9` fusionné** (documentation de
  coordination de Claude Principal seulement). Commits : voir `git log 98c09ed9..claude/nutrition-v2`.
- **Rien n'est fusionné sur master, rien n'est publié, rien n'est redéployé.** Aucun numéro de version posé (protocole
  deux sessions). La remise à zéro n'a **jamais** été exécutée sur des données réelles.

## 3. Le diagnostic technique (fichiers, fonctions)

- **Reprise figée (P1-a)** — `nutrition-v2.js` `lireAncienne` (une ancienne ligne n'est vérifiable que par `ciqual:`),
  `ligneNouvelle` (la recopie déclarée n'écrivait pas `sourceId`) ; `app.js` `_n2Reprendre` / `_afMajFige` (aucune issue).
- **Steak (P1-b)** — la naissance du 01/09 est M1 / M6 (fermés en `ft-v1258` et en V2) ; la **propagation** passait par
  `_n2Reajouter` / `_n2Incoherence` (aucune comparaison entre saisies d'un même produit) et `_n2TexteProposition` (aucune
  réserve). ⛔ Le produit scanné **n'est pas** CIQUAL : fiche Open Food Facts 129 · 21 · 0 · 5 (steak de marque, export du 19/10),
  CIQUAL 6250 = 130 · 21,9 · 0,3 · 4,6 — on ne les confond pas parce que leurs noms se ressemblent.
- **Deux résultats pour une fiche (P1-c)** — `_afSuggKcal100` (recherche, arrondi à l'entier) contre le scan (une
  décimale) ; `toggleFavFood` figeait le chiffre arrondi dans le favori.
- **« ✕ » (P1-d)** — `S.hiddenFoods` (chaînes, locale), `_afSuggLocales` (ne la lisait pas), `_cloudSync` / `saveProfile`
  (absente de l'envoi et de la liste blanche), `_applyRestoreData` / `autoConnect` (jamais relue), `_unhideFood` (l'effaçait).

## 4. Les corrections

| Fichier | Ce qui change |
|---|---|
| `app.js` | `_n2FicheIdentite`, `_n2RepriseIdentite` (fiche par l'identité, **dans l'écran seulement** — règle A ailleurs) · `_n2RetrouverEnLigne`, `_n2EtatRetrouver`, `_n2RetrouverRecherche`, `_n2EtiquetteFige` + 3 boutons dans `_afMajFige` · `_n2RechJeton` (un résultat en retard est ignoré) · `_n2Contradiction` dans `_n2Incoherence` · `_offAppliquerProduit` (le corps de `_lookupBarcode`, partagé avec la reprise, R2) · `_afSuggKcal100` à une décimale, lu aussi par le scan · `_n2LigneValeurs`, `_n2TexteProposition` (un seul texte pour « Mes aliments », « Déjà noté par toi », CIQUAL, Open Food Facts, fast-food) · `_n2Propose` (les masquages, partout où l'on propose) · `_favDepuisLigne`, `majFavoriDepuisEcran`, `_afFavMontrer` · la carte Admin de remise à zéro (`nutRazPerimetre`, `nutRazSauvegarder`, `nutRazExecuter`, `nutRazRetablir`) · au démarrage (`autoConnect`), les masquages venus du serveur · 🗑️ `_unhideFood` retiré (R30, raison écrite à sa place) |
| `state.js` | `_nutMasquesNormaliser`, `_nutMasquesFusion`, `_nutDepart`, `_nutFavorisVivants` ; `load()` convertit l'ancienne liste |
| `setup.js` | l'envoi porte `hiddenFoods` ; « Restaurer » fusionne les masquages et écarte les favoris d'avant |
| `nutrition-v2.js` | une recopie « déclarée » garde `sourceId` / `etat` (jamais une fiche) |
| `Code.js` | `saveProfile` : `hiddenFoods` entre dans la liste blanche, fusionné par le max (`_nutMasquesFusion_`, borné à 300) — **⚠️ déploiement Apps Script à part, avec son GO** |
| `index.html` | la carte Admin « 🧹 Remise à zéro des propositions » ; le bouton « ⭐ Corriger ce favori » |
| `screens.js`, `coach.js`, `constants.js`, `app.js` (Guide) | règle d'or #11 : l'aide « ? » de Nutrition, l'aide détaillée, un point rouge `nutri-v2-fiabilite` (bloc Nutrition, jamais en tête), une phrase dans la diapo du Guide. ⚖️ Pas de pop-up proposée (rien à faire pour la personne, aucun repère déplacé hors de l'ordre des chiffres) — à trancher par Michel à la publication (v81 réservée). |

## 5. Avant / après

- **Le banc final (48 témoins) sur le code de master `98c09ed9`** (même banc, `NUTF_RACINE` = une copie dont les 13 fichiers
  applicatifs sont ceux de master) : **16 OK / 32 rouge** — les 32 rouges sont les défauts ci-dessus ; les 16 verts sont les
  témoins de **non-régression** (scan, CIQUAL au chiffre près, code-barres, ml, réouverture, quantités refusées, saisie à la
  main, étiquette, IA, totaux et ce que Milo lit, aucune erreur de page).
- **Le même banc sur la branche (arbre final)** : **48 OK / 0 rouge**.
- **Le contrôle négatif** (`tools/mut_nut_fiabilite.py`, 25 mutations « GARDE » — F1, F1b, F2 → F24 — et 1 témoin « commentaire », MC1) : _voir §10_.

## 6. Ce qui reste ouvert (dit, pas caché)

0. **⚠️ À valider par Michel — deux choix de ce lot touchent des décisions antérieures** :
   - **`D-111` règle A (validée par Michel le 24/10) : respectée.** Ma première version recalculait aussi HORS de l'écran
     (la variante B qu'il a écartée) ; les témoins voisins l'ont rendue rouge, c'est corrigé (`BUGS.md` §113). Le recalcul
     par la fiche du code-barres ne vit plus que **dans l'écran**, où la personne voit les valeurs et confirme par « Ajouter » —
     c'est ce que demande le §2 de la mission (« retrouver la fiche d'origine si une identité fiable le permet »).
   - **`D-101` ⑩ n°1 (Claude, PROPOSÉ, publiée en `ft-v1260`) : remplacée sur l'identité seulement** (`D-130`) — une recopie
     « déclarée » garde le code-barres du produit (jamais une fiche) ; sans lui, la fiche ne se retrouve jamais et la copie
     échappe à « ✕ » et aux doublons. Témoin `B-NV2P P12 ②` réécrit (MP17 et MP85 le font rougir).

1. **`Code.js` non déployé** : tant qu'il ne l'est pas, un « ✕ » et la remise à zéro restent **locaux** (comme aujourd'hui) ;
   le reste du lot fonctionne. Déploiement Apps Script à part, GO de Michel (§8.3 de Principal).
2. **`D-112` reportée par Michel** : « Restaurer » remplace toujours les favoris. Conséquence nommée (`D-134`) : un favori
   **corrigé hors ligne** puis « Restaurer » avant la synchro est perdu (comme toute modification de favori hors ligne
   aujourd'hui) ; l'ancien ne revient pas.
3. **Les favoris du serveur ne sont pas effacés** par la remise à zéro (la protection P1 `D-108` refuse un envoi qui rétrécit) :
   la date les écarte partout. Q15 parlait d'« effacement local et serveur » : **écart à valider par Michel**.
4. **Le contrôle kcal / macros (Atwater) n'est pas ajouté** : Q16, douane gelée, feu vert explicite de Michel. `D-131` n'est pas
   ce contrôle (il compare les saisies d'un même produit entre elles).
5. **Un favori d'avant V2 sans identité** (le favori réel de Michel, sans code-barres) ne peut pas retrouver de fiche : il se
   dit « non vérifié » et se **corrige** (`D-134`) — rien n'est deviné par le nom.
6. **Observé en Chromium, non reproduit sur iPhone** : taper dans le nom puis toucher directement le champ de quantité
   redessine la ligne (l'événement `change` du nom appelle `_afMajAncre`) et le premier toucher peut être perdu.
   Préexistant (master), sans effet sur les données ; à regarder sur l'iPhone.
7. **Les anciennes lignes fausses restent** dans le journal (aucune réécriture, `D-098`) : elles ne sont simplement plus
   proposées en silence. Leur correction réelle est le patch d'historique v1.2 (simulation, `D-095`), avec son propre GO.
8. **La remise à zéro réelle** : jamais exécutée ; procédure au §8.
9. **Pour Claude Principal — un en-tête périmé** : `CLAUDE.md` dit encore « le scanner caméra n'a pas de bouton
   (Michel, 14/09) ». C'est faux depuis `ft-v1221` (le scanner « capture » est revenu, validé par Michel ; seul le LIVE
   reste éteint hors du banc Admin). Le bouton « 📷 Scanner le code-barres » de la reprise figée appelle la **même**
   fonction que l'écran d'ajout (`scanBarcode()`, voie capture) — rien de nouveau n'est exposé. Je n'ai pas touché
   `CLAUDE.md` (hors couloir) : à corriger à la publication (R23).

## 7. Le journal n'est jamais réécrit — la preuve

- B-NFIAB T02 ⑤ : l'ancienne ligne de l'isolat relue **à l'octet** après une reprise par sa fiche.
- B-NFIAB F ③ : corriger le favori laisse le journal **identique à l'octet**, y compris la ligne notée depuis lui (26 g).
- B-NFIAB-X T07 ③ : après la remise à zéro, l'empreinte du journal est **identique** ; T12 ① : les totaux du jour et le
  contexte envoyé à Milo sont **identiques** avant / après ; T08 ④ ⑤ : le journal arrive **entier** sur les autres appareils.
- B-NFIAB R ② : la remise à zéro faite, le journal est relu à l'octet.
- Le contrôle négatif F13 (réécrire les lignes d'un favori corrigé) et F17 (la remise à zéro touche le journal) **rougissent**.

## 8. La remise à zéro, prête à valider — ⛔ NON exécutée

Profil → 🔧 Admin → « 🧹 Remise à zéro des propositions (Nutrition) » :
1. **🔎 Voir le périmètre exact** : *N favori(s) · N aliment(s) proposé(s) · N repas habituel(s)* disparaîtront des
   propositions ; *ton journal daté : N ligne(s)* reste intact. Rien n'est modifié.
2. **💾 Télécharger la sauvegarde** : `forcetracker-propositions-AAAA-MM-JJ.json` (favoris + masquages + périmètre). Sur
   iPhone, si le partage ne confirme pas, l'app demande « As-tu bien reçu le fichier ? ».
3. **🧹 Remettre à zéro…** : refusé sans sauvegarde, refusé si les favoris ont changé depuis (« refais-la ») ; sinon
   confirmé, puis contrôle affiché : *favoris N → 0 · aliments proposés N → 0 · repas habituels N → 0 · journal : N
   ligne(s), identique*.
4. **♻️ Rétablir des favoris depuis une sauvegarde** : ils redeviennent des favoris d'aujourd'hui, sans doublon.

**Ce qui ne revient pas** : à la fermeture de l'app, sur un autre appareil (au démarrage), après « Restaurer », sur un
téléphone neuf — **à condition que `Code.js` soit déployé** (sinon : cet appareil seulement). Ce qui revient : ce qui est
noté **après** (re-noter, c'est le vouloir).

## 9. Les témoins réécrits ou retirés, et pourquoi (§8.7 ③)

| Témoin | Pourquoi | Toujours mordant ? |
|---|---|---|
| `B-NV2P P14 ① ②`, `P15 ① ③ ⑪ ⑯ ⑳ ㉖ ㉙ ㉛ ㉜b`, `P14 ⑱` (`nut2_parcours.js`) | l'ordre d'affichage change (`D-135`) : « 40 g · 156 kcal » → « 156 kcal · pour 40 g » ; même quantité, mêmes valeurs, mêmes réserves | contrôle négatif `tools/mut_nut2_parcours.py` rejoué (§10) |
| `MP81` (`tools/mut_nut2_parcours.py`) | son ancre suit la ligne de « Déjà noté par toi », qui passe par `_n2TexteProposition` | même mutation, même témoin attendu (`P15 ③`) |
| `MP50` (`tools/mut_nut2_parcours.py`) | elle visait `_n2QteListe`, **devenu mort** (sa logique recopiée dans `_n2TexteProposition`, un doublon que j'avais créé — `BUGS.md` §117) : 0 rouge. `_n2QteListe` retiré, l'ancre déplacée sur la ligne qui écrit vraiment la quantité | même mutation, même témoin attendu (`P14 ②`) — rejouée : **conforme** (P14 ② rouge ; arbre sain 111 / 0) |
| `N16` (`tools/mut_nut_m6_rejeu.py`) | deux lignes (identité, recherche en ligne) s'intercalent avant `}else{` : l'ancre s'arrête sur la première | même mutation (une quantité posée à l'ouverture) |
| `AS-FF1 FF2 FF4` (`food_alias_sens.js`), `MS-196 MS-197` (`food_multisource_corpus.js`, OBSERVATION) | « 576 kcal la portion (226 g) » → « 576 kcal · pour la portion (226 g) » | même valeur (le moteur), même portion |
| `MS-156 MS-157` (`food_multisource_corpus.js`, SHOULD) | les détails Open Food Facts « 380 kcal/100 g » → « 380 kcal · pour 100 g · P 10 · G 10 · L 5 » ; une macro inconnue s'écrit « ? » (la barre en kJ seulement) — trouvés par le banc voisin `food_multisource` rejoué sur l'arbre final (175 / 2) | `tools/mut_food_multisource.py` M2, M10, M11, M12 : **5 / 5** ; MS-157 : mutation ciblée (« ? » → « 0 ») : **rouge, seul** |
| `tests/recette/registre.json` | `_unhideFood` retiré des déclencheurs (sinon le sélecteur échoue) ; `_n2QteListe` → `_n2TexteProposition` dans ceux de `NUT2-PARCOURS-01` (la fonction qui écrit maintenant la quantité, §117) ; nouveau scénario `NUT2-FIABILITE-01` ; le banc ajouté à `CLOUD-01`, `APPS-SCRIPT-01`, `NUT2-PARCOURS-01` | `selecteur-autotest` vert |
| `B-NV2P P12 ②` (`nut2_parcours.js`) | `D-130` remplace `D-101` ⑩ n°1 sur l'identité : la copie garde son code-barres et son état, toujours sans fiche ni pour-100 g | MP17 (une fiche fabriquée), MP85 (l'identité perdue) |
| `B-NM6-C ③` (`nut_m6_rejeu.js`, le cliquet de M6) | « ⭐ Corriger ce favori » (`majFavoriDepuisEcran`) est un 2ᵉ lecteur **déclaré** de l'écran : il en fait un favori et n'écrit jamais le journal | N20 (un 3ᵉ lecteur non déclaré), N21 (la correction écrit le journal) |
| `B-NFIAB T02 ⑥` (ce lot) | réécrit pendant le lot sur la règle A (liste) + `⑥b` (l'écran) | F1 (écran), F1b (la variante B réintroduite) |
| `B-NFIAB-X T08 ②` (ce lot) | démarré en ligne, le téléphone « neuf » recevait déjà les masquages au démarrage : F21 (« Restaurer » les perd) ne mordait pas. Il démarre maintenant **hors ligne**, et le témoin vérifie qu'aucun masquage n'était là avant « Restaurer » (`BUGS.md` §117) | F21 et F23 rejouées après la correction : **2 / 2** (T08 ② et T08 ④ rouges, chacune le sien) |
| `B-NFIAB-X T07 ①` (ce lot) | une erreur dans la page faisait **planter** le banc sous F15 : elle se dit maintenant en rouge ; F15 modélise vraiment « la remise à zéro part sans sauvegarde » (`BUGS.md` §116) | F15 rejouée : **conforme** (T07 ① rouge, plus de plantage) |

**Le témoin `B-NP01-A` (`nut_punch01`) réécrit par la branche Séance (repos persistant) : relu, ACCEPTÉ.** La comparaison
« la séance ouverte revient à l'identique au rechargement » n'exclut que `S.wkt.repos` — l'état du chrono de repos, effacé au
rechargement quand il a expiré (`D-102`) ; tout le reste de la séance (séries, codes, cardio, chrono) reste comparé à
l'octet. Et la Nutrition **ne lit jamais** `S.wkt.repos` (vérifié : aucune lecture dans `app.js`, `screens.js`, `state.js`) :
ce que le contrat NUT-PUNCH-01 garantit à la Nutrition (date, heure, séries, codes) est intact. Condition : que `MA20`
(`tools/mut_nut_punch01.py`, le chrono de la séance perdu au rechargement) rougisse sur la branche Séance — affirmé par sa
session, non rejoué ici.

## 10. Chiffres de la dernière exécution, voisins, intégration

Tout est joué sur des **données inventées**, réseau isolé (garde réseau), **0 appel Milo**, sur l'arbre final de la branche.

**Le banc du lot** `tools/banc_nut_fiabilite.js` — 48 témoins (B-NFIAB 35, l'écran ; B-NFIAB-X 13, synchro et appareils
par le vrai `Code.js` en local) :

| Arbre | Résultat |
|---|---|
| master `98c09ed9` (copie servie, même banc ; les 13 fichiers applicatifs de master) | **16 OK / 32 rouge** (les 16 verts : la non-régression) |
| branche (arbre final) | **48 OK / 0 rouge** |

**Contrôles négatifs** (chaque défaut corrigé réintroduit dans une copie ; le banc doit rougir au bon témoin) :

| Outil | Mutations | Résultat |
|---|---|---|
| `tools/mut_nut_fiabilite.py` (arbre sain : croise 13 / 0, écran 35 / 0) | F1, F1b, F2 → F24 (« GARDE »), MC1 (un commentaire : doit rester vert) | 1ʳᵉ exécution **24 / 26** : F15 **plantait** (le test ne protégeait pas un appel à la page) et F21 **ne mordait pas** (le téléphone « neuf » démarrait connecté) — témoins corrigés (`BUGS.md` §116, §117), puis **F15 1 / 1** et **F21 + F23 2 / 2** rejouées (arbre sain croise 13 / 0) → **26 / 26** |
| `tools/mut_nut2_parcours.py` (arbre sain 111 / 0) — les témoins réécrits | MP17, MP36, MP37, MP39, MP46, MP50, MP55, MP62, MP63, MP66, MP69, MP71, MP76, MP80, MP81, MP83, MP85, MP86 | **17 / 18**, puis MP50 rejouée après le retrait du doublon (`BUGS.md` §117) : **1 / 1** (arbre sain 111 / 0 avant et après) → **18 / 18** |
| `tools/mut_nut_m6_rejeu.py` — le cliquet M6 réécrit | N16, N20, N21 | **3 / 3** (chacune : 28 ou 27 OK, son témoin rouge) |
| `tools/mut_food_multisource.py` — MS-156 / MS-157 réécrits | M2, M10, M11, M12 (+ M20, prise par le préfixe) | **5 / 5** ; et une mutation ciblée sur une copie (une valeur inconnue s'écrit « 0 » au lieu de « ? ») : **MS-157 rouge, lui seul** (176 / 1) |

**Bancs voisins** — le T1 du sélecteur de recette pour ce diff, plus les bancs T2 de la Nutrition, rejoués sur l'arbre final ;
et une **passe réduite** : les 61 blocs de la passe complète qui citent une fonction touchée (sur 251 ; la passe complète,
elle, se joue une seule fois, sur l'intégration — §8.7 ⑦). Chiffres lus dans les journaux d'exécution :

| Banc | Résultat (OK / rouge) | Durée |
|---|---|---|
| `aides_audit` | 18 / 0 | 4 s |
| `nut_m6_rejeu` | 29 / 0 | 65 s |
| `nut_v2_p1_croise` | 16 / 0 | 52 s |
| `repas_actif` | 24 / 0 | 18 s |
| `ia_ref100` | 36 / 0 | 17 s |
| `journal_qty_guard` | 23 / 0 | 21 s |
| `food_reference` | 136 / 0 | 19 s |
| `food_d042` | 73 / 0 | 34 s |
| `food_lot_b` | 73 / 0 | 35 s |
| `food_variants` | 131 / 0 | 233 s |
| `food_alias_sens` | 77 / 0 | 19 s |
| `lot3` | 87 / 0 | 236 s |
| `poids_chaine` | 78 / 0 | 43 s |
| `foodlog_restore` | 35 / 0 | 38 s |
| `habitudes_alim` | 37 / 0 | 4 s |
| `ordre_repas` | 39 / 0 | 13 s |
| `nut_secu_p1` | 82 / 0 | 3 s |
| `sec_admin` | 69 / 0 | 74 s |
| `nut2_moteur` | 70 / 0 | 0 s |
| `nut_punch01` | 36 / 0 | 33 s |
| `chaos` | 56 / 0 | 15 s |
| `annexe pwa-offline` | PASS | 11 s |
| `food_multisource` | 175 / 2 avant la réécriture de MS-156 / MS-157 → **177 / 0** après | 113 s |
| `food_semantics` (T2) | 44 / 0 | 276 s |
| `food_formes` (T2) | 46 / 0 | 6 s |
| `food_prefs` (T2) | 39 / 0 | 14 s |
| `pots_nutrition` (T2) | 48 / 0 | 25 s |
| `nutri_moteur` (T2) | 28 / 0 | 6 s |
| passe réduite (61 blocs) | **2003 ✅ · 0 ❌** | 640 s |
| annexe calculs | PASS | 97 s |

`food_multisource` a d'abord rendu **2 rouges** : MS-156 et MS-157 lisaient encore l'ancien ordre d'affichage des résultats
Open Food Facts — réécrits (§9), puis 177 / 0. `chaos` (vrai PostgreSQL local, vrai `Code.js`) : 56 / 0.

**Ce que Milo reçoit** : le prompt complet construit par la vraie app avec les mêmes données inventées (une ligne V2,
deux anciennes lignes dont le steak fabriqué) fait **76 388 caractères sur master et 76 388 sur la branche, identiques
à l'octet** (R34 ; `buildCoachContext` n'est pas touché).

**Le moteur MET n'a pas bougé** (§8.7 ⑥) : le texte exact des 8 fonctions et constantes gelées du §8.3 — `CARDIO_MET`,
`calcCardioKcal`, `calcCardioKcalTotal`, `_MET_REGIONS`, `getExerciseMET`, `calcSessionCalories`, `_movPattern`,
`_mscScores` — comparé à master : **8 identiques, 0 écart**. `log.js`, `tracking.js`, `style.css`, `sw.js` : non touchés.
Aucune séance n'est lue ni écrite par ce lot ; le journal ancien n'est jamais réécrit (§7).

**Les fichiers touchés hors de mon couloir, et pourquoi** (§8.7 ⑤) :

| Fichier, zone | Pourquoi | À savoir pour l'intégration |
|---|---|---|
| `app.js`, `APP_GUIDE_SLIDES` (Guide, partagé avec Séance) | une phrase dans la diapo **Nutrition** (règle #11) | Séance touche aussi ce tableau : conflit mécanique possible, garder les deux |
| `app.js`, le démarrage (après `_ftBootstrapJeton`) | les masquages venus du serveur fusionnés au lancement (sinon un « ✕ » d'un autre appareil ne tient pas) | quelques lignes, sans réseau de plus (la réponse de `loadProfile` déjà attendue) |
| `index.html`, section **Admin** | la carte « 🧹 Remise à zéro des propositions » | bloc distinct de ceux de Séance |
| `setup.js`, `_cloudSync` (**carrefour**) | l'envoi porte `hiddenFoods` | le sélecteur réclame l'annexe entière et la passe complète à l'intégration |
| `state.js`, `load()` (**carrefour**) | l'ancienne liste de « ✕ » convertie en dates ; **aucune clé nouvelle** | idem |
| `Code.js`, `saveProfile` (liste blanche) | `hiddenFoods` gardé, fusionné par le max, borné à 300 | ⚠️ **commit séparé** : le fusionner sur master **déclenche le déploiement Apps Script** — GO de Michel |
| tests : `runner.js`, `registre.json`, `nut2_parcours.js`, `nut_m6_rejeu.js`, `nut_v2_p1_croise.js` (outils prêtés), `food_alias_sens.js`, `food_multisource_corpus.js` ; outils `mut_nut2_parcours.py`, `mut_nut_m6_rejeu.py` | témoins réécrits (§9) et banc ajouté | conflits de liste attendus avec Séance (`runner.js`, `registre.json`) |

Rien dans `renderNutrition` (la tuile « Séance », F06, est à Claude Séance), ni dans `buildCoachContext`, ni dans le
moteur MET.

**Intégration** : master `98c09ed9` fusionné dans la branche par moi (§8.7 ①, fusion `06a30687`) — documentation seulement ;
les commits du lot : `f0869fdf` (l'app, les tests, la documentation), **`bb2075b9` (`Code.js` seul)**, `954111d5` (deux témoins
corrigés pendant la qualification : T08 ②, T07 ①), puis la documentation de clôture (`git log 98c09ed9..claude/nutrition-v2`).
Prévision `git merge-tree` avec la branche Séance `claude/dreamy-bell-pu88ia` @ `b2a6280a` : **aucun conflit de code** —
`app.js`, `coach.js`, `constants.js`, `index.html`, `screens.js`, `setup.js`, `state.js`, `runner.js`, `registre.json` se
fusionnent d'eux-mêmes ; **3 conflits de documentation** (`BUGS.md` : les deux ajoutent des sections en fin de fichier ;
`CONTEXTE-ACTUEL`, `JOURNAL-DE-PARTAGE` : une ligne chacun). ⚠️ Une fusion sans conflit n'est pas une preuve : les zones
touchées des deux côtés (`APP_GUIDE_SLIDES`, `NEW_FEATURES`, `setup.js`, `state.js`) se relisent, et les bancs des deux
sessions se rejouent sur l'arbre fusionné (§8.8 ⑤).

**Règle d'or #17 (code applicatif seulement)** : données persistées ajoutées **2** (le champ `hiddenFoods` du profil
serveur ; la date `t` d'un favori — aucune clé de stockage nouvelle, `ft4_hiddenfoods` change de forme) · fichiers
applicatifs touchés **9** · **+510 − 45** · anciens chemins : **1 supprimé** (`_unhideFood`), **5 fusionnés**
(`_lookupBarcode` → `_offAppliquerProduit` partagé avec la reprise ; `_afSuggKcal100` seul propriétaire de l'énergie
pour 100 g ; cinq textes de proposition → `_n2LigneValeurs` / `_n2TexteProposition` ; `_n2QteListe` → la quantité
d'une proposition écrite à un seul endroit, `_n2TexteProposition` (`BUGS.md` §117) ; `toggleFavFood` et la correction
d'un favori → `_favDepuisLigne`).

## 11. La recette sur l'iPhone (à faire, sur le clone à l'intégration — Q22)

Ce que Chromium ne prouve pas (WebKit, le vrai toucher, la caméra, le partage de fichier). Sur un compte de test, jamais
sur le vrai journal de Michel :

1. **L'isolat repris, en ligne** : toucher sa ligne dans « Mes aliments » → l'écran dit « fiche retrouvée par son
   code-barres — ta saisie disait … » ; taper 35 → 136 kcal · 31 g ; 50 → 194 kcal · 44 g ; « Ajouter » écrit ce qui
   est affiché.
2. **Le même, en mode avion** : les trois boutons « 🔎 Retrouver » · « 📷 Scanner » (la caméra s'ouvre) · « 🏷️ Saisir
   l'étiquette » ; rien n'est enregistré sans quantité.
3. **Un produit aux saisies contradictoires** : « ⚠️ à vérifier » dans la liste ; « + Ajouter » ouvre l'écran et n'écrit
   rien tout seul.
4. **« ✕ »** : la proposition disparaît, reste partie après fermeture de l'app ; sur un 2ᵉ appareil, après le démarrage
   (⚠️ seulement si `Code.js` est déployé).
5. **« ⭐ Corriger ce favori »** : le favori change ; le journal, lui, ne bouge pas.
6. **La carte Admin de remise à zéro** : « 🔎 Voir le périmètre exact » seulement (les nombres sont plausibles) ; « 💾
   Télécharger la sauvegarde » (le partage iOS, puis « As-tu bien reçu le fichier ? ») ; ⛔ **pas d'exécution** sans le
   GO de Michel.
7. **La lecture** : « 156 kcal · pour 40 g · P 35 · G 1 · L 1 » tient sur la largeur d'un iPhone, sans débordement.
8. **Le premier toucher** : taper un nom puis toucher directement le champ de quantité — le toucher est-il perdu (vu en
   Chromium, §6 ⑥) ?

---

## 12. Retours de Claude Principal du 25/10 (verdict B) — les trois conditions

> Branche `claude/nutrition-v2` après `beda2652` ; `Code.js` **non touché** ; ni master, ni publication, ni déploiement.
> Bugs : `BUGS.md` §118 → §120. Témoins nouveaux : `B-NFIAB N08 ① ② ③`, `ZÉRO ① → ④`, `B-NFIAB-X T08 ⓪`, `T08L ① ② ③`.

**① N08 — une entrée vide (`null`) dans le journal.** Les 2 lignes de Principal sont intégrées **mot pour mot**
(`_profilAlimentaire`, `renderFoodJournal`). ⚠️ **Elles ne suffisaient pas** : son témoin (aucun profil calorique, une ligne
du jour placée avant les entrées vides) laissait passer quatre lecteurs de même cause, mesurés en élargissant le témoin
(profil complet, entrée vide **en tête**) : `_resteDuJour` (la carte « ce qu'il te reste », que le journal du jour affiche :
avec un profil complet, le journal tombait encore), `_buildFoodQuickItems` (« Ajouter »), `_afSuggLocales` (« Déjà noté par
toi ») et `_mesAliments` (les idées pour le reste). Même garde, même règle : les entrées vides sont **ignorées, jamais
réécrites**. Contexte de Milo **identique à l'octet** sans entrée vide : 76 275 caractères avant/après et contre master
(Principal en mesure 81 145 sur sa copie d'intégration, qui porte aussi Séance).

**② L'ancienne saisie à zéro** `{kcal:0, prot:0, carbs:0, fat:0, q:null, per100:null}`. Reprise (« + Ajouter », « Mes
aliments », « Déjà noté par toi ») : l'écran dit pourquoi (*« Cette ancienne saisie n'a ni quantité ni valeurs : rien ne se
calcule à partir d'elle. Retrouve l'aliment, scanne son code-barres ou saisis son étiquette — ou tape ses valeurs. »*) et
donne **les mêmes trois issues** qu'une reprise sans fiche — un seul propriétaire désormais (`_n2IssuesHtml`, R2). « Ajouter »
et les toasts redisent la phrase au lieu de « Combien pesait… ». ⛔ **Aucun champ « quantité » pour ces 0, exprès** : en accepter
une affirmerait qu'ils valaient pour elle. Les valeurs tapées mènent au journal (ZÉRO ④ : 300 · 20 · 30 · 10 pour 250 g,
déclarées, l'ancienne saisie intacte). Aide détaillée Nutrition : une phrase ajoutée. Pas de pop-up (un correctif).

**③ Les témoins de synchro, selon le Code.js servi.** Sans `hiddenFoods` dans la liste blanche de `saveProfile` (le Code.js de
master, donc l'intégration sans GO serveur), les six témoins `T08 ① ② ③ ④ ⑤ ⑦` sont **SANS OBJET** — listés, jamais
comptés verts ; avec elle (le commit `Code.js` séparé), ils se jouent. `T08 ⓪` vérifie que le mode annoncé concorde avec ce que
le serveur (le vrai Code.js, en local) fait d'un « ✕ » synchronisé. Les garanties **locales** se jouent dans les deux modes :
`T08L ①` « ✕ » tient au rechargement, `T08L ②` à « Restaurer » sur le même téléphone, `T08L ③` la remise à zéro aussi (le
serveur garde ses anciens favoris, la date locale les écarte).

### 12.1 Rouge avant, vert après

| Témoin | master `93dfbb75` | branche `beda2652` | branche après |
|---|---|---|---|
| N08 ① ② (entrée vide, conditions de Principal) | rouges | rouges | verts |
| N08 ③ (profil complet, entrée vide en tête) | rouge | rouge (aussi avec les 2 lignes seules) | vert |
| ZÉRO ① ② (l'impasse) | rouges | rouges | verts |
| ZÉRO ③ ④ (gardes : la marque ne déborde pas ; l'issue « tape ses valeurs ») | verts | verts | verts — Z3, Z4 les font rougir |
| T08 ⓪ · T08L ① ② ③ | — (nouveaux) | — | verts dans les deux modes |

Totaux de la partie écran (OK / rouge) : master **16 / 26** · `beda2652` **37 / 5** (exactement les 5 témoins nouveaux) · avec les
2 lignes de Principal seules **41 / 1** (N08 ③) · après **42 / 0**.

### 12.2 Les deux modes de la synchro (banc entier, écran + croisé)

| Code.js servi | Mode annoncé par le banc | Résultat |
|---|---|---|
| celui de la branche (garde `hiddenFoods`) | synchro entre appareils ET garanties locales | **59 / 0** (T08 ⓪ → ⑦, T08L ① ② ③) |
| celui de master (ne le garde pas) | garanties locales seulement | **53 / 0**, et **6 témoins SANS OBJET** listés (T08 ① ② ③ ④ ⑤ ⑦), jamais comptés verts |

### 12.3 Contrôle négatif, voisins, contexte de Milo

| Contrôle | Résultat |
|---|---|
| `tools/mut_nut_fiabilite.py`, les 43 mutations (arbre sain : écran 42 / 0, croisé 17 / 0) | **43 / 43 conformes** |
| dont celles de ce retour : N08a → N08f, Z1 → Z7, F19 (ré-exprimée), F19b, FL1 → FL3, F4 (étendue) | 19 / 19 |

| Banc | Résultat | Durée |
|---|---|---|
| aides_audit | 18 / 0 | 6 s |
| journal_qty_guard | 23 / 0 | 27 s |
| nut2_parcours | 111 / 0 | 134 s |
| seance_recette | 93 / 0 | 167 s |
| nut2_moteur | 70 / 0 | 1 s |
| nut_secu_p1 | 82 / 0 | 7 s |
| nut_m6_rejeu | 29 / 0 | 74 s |
| pots_nutrition | 48 / 0 | 31 s |
| nut_v2_p1_croise | 16 / 0 | 57 s |
| repas_actif | 24 / 0 | 19 s |
| ia_ref100 | 36 / 0 | 17 s |
| nut_fiabilite (Code.js de la branche : mode serveur) | 59 / 0 | 172 s |
| nut_fiabilite (Code.js de master : mode local) | 53 / 0 | 171 s |
| annexe (toutes les suites) | 14 PASS + 1 défaut connu (`discussions`, ses 2 rouges listés, préexistant) | 445 s |
| passe réduite (26 blocs) | **997 ✅ · 0 ❌** | 330 s |

- **Contexte de Milo** (R34), à données égales et sans entrée vide : **identique à l'octet**, 76 275 caractères — `beda2652`
  contre la branche après, et master contre la branche après.
- **Moteur MET** : les 8 fonctions et constantes gelées sont identiques à master (aucun fichier de Séance touché).
- `check_regles` vert ; sélecteur de recette (auto-test) **15 / 0** ; `git diff --check` propre.

### 12.4 Ce qui reste ouvert

- **Pour l'intégration** : si les 2 lignes de N08 ont déjà été posées sur la copie d'intégration, il faut aussi les **4 autres**
  — avec un profil calorique complet, le journal du jour et « Ajouter » tombent encore sans elles (N08 ③).
- **Un rouge isolé, non expliqué** : la 1ʳᵉ tentative d'un des trois groupes du contrôle négatif a été refusée (arbre sain :
  1 rouge sous charge, trois bancs en parallèle). Relancé : 42 / 0 puis 15 / 15 ; **non reproduit en 6 exécutions** sous la
  même charge ; témoin non identifié — `tools/mut_nut_fiabilite.py` nomme désormais le rouge qui fait refuser l'arbre sain.
- **Les autres listes enregistrées** (séances, pesées, sommeil…) n'ont pas été passées au même crible que `S.foodLog`.
- **La ligne écrite par l'issue « tape ses valeurs »** garde la porte « reprise » et la fiabilité « déclarée », comme toute
  reprise sans quantité.
- **Pas de passe complète** (§8.7 ⑦) ; passe réduite aux 26 blocs qui citent une fonction touchée.
- **Recette iPhone** (à ajouter à §11) : une ancienne saisie à 0 (si le compte de test en a une) → « + Ajouter » → la phrase et
  les 3 boutons ; « Retrouver » lance la recherche ; « Étiquette » ouvre le calibrage ; rien n'est enregistré sans valeurs.

### 12.5 Compteurs (règle 17, code de l'app seulement)

| Compteur | Valeur |
|---|---|
| Données persistées ajoutées | **0** — la marque de la saisie à zéro vit en mémoire, rien n'est stocké |
| Fichiers applicatifs touchés | **3** : `app.js`, `screens.js`, `coach.js` (une phrase d'aide) ; `Code.js` non touché |
| Lignes ajoutées − retirées | **+48 − 16** (net + 32), dont `app.js` + 46 − 14 |
| Anciens chemins supprimés ou fusionnés | **1 fusionné** : les trois issues, dessinées en ligne dans le cas figé, ont un seul propriétaire (`_n2IssuesHtml`) partagé avec la saisie à zéro ; 0 supprimé |

### 12.6 Registre et passation (règle d'or 19) — le bloc à reporter, ⛔ rien n'est écrit sur Drive par cette session

> **Lu avant de livrer** (Drive, lecture seule, accès testé) : le registre « SUIVI DES BUGS — FORCE TRACKER », vue
> « Consolidé 25-10 » (les 54 lignes ; en entier pour les tickets ci-dessous), et la « PASSATION MAÎTRE » — ses deux blocs du
> 25/10 (complément Q15 / validation, point de pilotage), pas l'historique plus ancien. La règle 19 est arrivée sur master
> **pendant** cette mission (`58755762`) : la lecture a été faite à la livraison, pas avant le code. Le connecteur ne modifie
> pas un fichier existant (règle 18) : **Claude Principal** reporte ce bloc, mêmes IDs, même date, rien d'effacé.

| ID | Ancienne valeur (Consolidé 25-10) | Nouvelle valeur proposée (25/10/2026) |
|---|---|---|
| `NUT-LIMITES-01` (entrée null) | « À qualifier ; limites déclarées » · reste : « reproduire séparément ; distinguer null synthétique et vrai parcours » | **Corrigé sur branche** `claude/nutrition-v2`, code `eea860ec` : une entrée `null` (synthétique : aucun écrivain actuel n'en écrit ; une restauration la garde si elle existe) faisait tomber le démarrage, le journal du jour, le contexte de Milo et, avec un profil complet, « ce qu'il te reste », « Ajouter » et « Déjà noté par toi ». Témoins `B-NFIAB N08 ① ② ③` rouges sur master et `beda2652`, verts après ; mutations N08a → N08f. Publication : aucune. iPhone : non (non reproductible sans données fabriquées). **Reste** : le « premier tap quantité Chromium » (l'autre moitié du ticket), non traité ; origine réelle d'un `null`, non démontrée. |
| `NUT-ZERO-01` (**proposé**, nouveau) | — | Ancienne saisie sans quantité ni valeurs : la reprise était une impasse. **Corrigé sur branche** (`eea860ec`) : les 3 issues d'une reprise sans fiche, aucune quantité acceptée pour ces 0. Témoins `ZÉRO ① → ④`, mutations Z1 → Z7. iPhone : à faire. Lien possible, **non qualifié** : « crème fraîche ajoutée à zéro » (`NUT-IDENT-01`) et « aliment ajouté à zéro » (recette de la passation) — ce correctif couvre la **reprise** d'une ancienne saisie à zéro, pas l'ajout d'un aliment à zéro. |
| `NUT-VAL-02` / `SERVEUR-CODEJS-01` | « avec Code.js Nutrition 48/0 ; sans 42/6 » | La dépendance demeure ; le banc la **dit** au lieu de rougir : avec le Code.js de la branche **59 / 0** ; avec celui de master **53 / 0 + 6 témoins SANS OBJET** (listés, jamais verts) ; `T08 ⓪` vérifie le mode ; garanties locales `T08L ① ② ③` vertes dans les deux modes. Q15 (`D-141`) : effacement réel **non construit** ici. |
| `INTEGRATION-NS-01` | « Intégration mesurée b37ddf3a (Nutrition beda2652) » | Branche Nutrition avancée (`eea860ec` + documentation) : **à refusionner**. ⚠️ Si les 2 lignes de N08 sont déjà sur la copie d'intégration, y ajouter les 4 autres. Contrôle négatif 43 / 43, voisins verts, passe réduite 997 / 0 ; pas de passe complète. |
| `NUT-QTY-01`, `NUT-FOR-03`, `NUT-IDENT-01`, `NUT-FOR-04`, `NUT-PERSO-01` | « claude/nutrition-v2 @ beda2652 » | Branche avancée à `eea860ec` (+ doc) **sans changer leur périmètre** ; leurs témoins rejoués verts. |
| `NUT-VERIFY-01` (E2b) | « après correction Nutrition en cours » | **Non commencé** — c'est la suite, après ces trois points. |

## 13. Clôture ciblée du 25/10 (mission de Michel) — E2b / `NUT-VERIFY-01` et la préparation de Q15 / `D-141`

> Branche `claude/nutrition-v2` ; ni master, ni publication, ni déploiement Apps Script, **aucune suppression réelle,
> aucune donnée réelle** (comptes et aliments inventés, réseau coupé, 0 appel Milo). `Code.js` en **commit séparé, NON
> déployé**. Décisions : `D-136`, `D-137` (Claude, PROPOSÉ) ; `D-133` → **REMPLACÉE → `D-141`**. Bugs : `BUGS.md` §121,
> §122. Tickets : `NUT-VERIFY-01`, `NUT-FOR-04`, `SERVEUR-CODEJS-01`, `NUT-VAL-01`, `NUT-VAL-02`, `INTEGRATION-NS-01`.
> ⛔ **Non rouverts** (déjà livrés, §12) : N08, l'ancienne saisie à zéro, les témoins de synchro selon le Code.js servi.

### 13.1 E2b / `NUT-VERIFY-01` — une saisie juste ne se dit plus « à vérifier » à cause d'anciennes saisies écartées

**Le constat** (registre, sonde de Claude Principal) : remise à zéro hier ; deux anciennes saisies du steak à 200 g ·
130 kcal (le pour-100 g fabriqué à 65, §114), à J-6 et J-5 ; une saisie neuve et juste, 258 · 42 · 0 · 10 pour 200 g, même
code-barres → « ⚠️ à vérifier ». **Reproduit** sur la branche telle que livrée (`fc0a558d`, données inventées) — et plus large
que le constat : « + Ajouter » refusé, le repas habituel compté « 1 à vérifier » et son « + » refusé, la même chose après
« ✕ » et avec un ancien favori encore sur l'appareil.

**La cause** : la comparaison de `D-131` (`_n2Contradiction`, références rangées par `_n2FichesVerifiees`) prenait toutes les
saisies du produit, **y compris celles que la remise à zéro ou « ✕ » avait retirées des propositions**.

**La correction** (`D-136`, `app.js`, une ligne) : seules les références encore **proposées** (`_n2Propose`, la règle même
des listes) se comparent. ⛔ Le journal n'est pas touché ; ⛔ les fiches **vérifiées par la source** (scan Open Food Facts,
CIQUAL) restent des références même d'avant la remise à zéro (elles décrivent le produit — une saisie neuve fausse se dit
encore « à vérifier », et la reprise par identité `D-130` les retrouve toujours) ; ⛔ deux saisies encore proposées qui se
contredisent restent « à vérifier » (`D-131`) ; le scan juste est inchangé.

| Témoin (`B-NFIAB E2b`) | `fc0a558d` | après |
|---|---|---|
| ① le cas du registre (« Mes aliments », « Déjà noté par toi ») · ② « + Ajouter » · ③ le repas habituel · ④ après « ✕ » | **rouges** | verts |
| ④b un ancien favori faux encore sur l'appareil | **rouge** (mutation E1 = le code d'avant) | vert |
| ⑤ sans remise à zéro, les saisies se contredisent toujours · ⑥ la fiche du scan d'avant juge une saisie fausse · ⑦ le scan juste | verts | verts — F5 et E4 les font rougir |

### 13.2 Q15 / `D-141` — la suppression réelle, préparée (⛔ rien d'exécuté)

Les cinq points de la mission, et où chacun se prouve :

1. **Suppression ciblée des anciennes listes personnelles du compte.** Sur l'appareil, les favoris d'avant sont retirés de
   `S.savedFoods` à l'exécution (déjà le cas). « Déjà noté par toi », les récents et les repas habituels **ne sont pas des
   listes enregistrées** : ils naissent du journal, qui reste intact — la date `*` les fait renaître de ce qui sera noté
   ensuite. **Au serveur** (`Code.js`, `_nutRazFavoris_`, `D-137`) : après la fusion des masquages, tout favori d'avant la
   date (ou sans date `t`) quitte la liste active **du seul compte concerné** — **par la protection P1** (motif « raz ») :
   copié d'abord dans sa zone de récupération, jamais renvoyée à l'app. Témoins `Q15 ①`, `T08 ③`.
2. **Aucune réapparition** : un appareil en retard qui renvoie un ancien favori ne le fait pas reprendre (`Q15 ③`, `T08 ⑧`) ;
   un autre appareil au démarrage (`T08 ④`) ; « 🔄 Restaurer » (`T08 ⑤`, `T08L ③`) ; et même un serveur qui en renverrait un
   (`T08L ④`) ; la **restauration admin d'une sauvegarde d'avant** fusionne les masquages du compte et ne remet pas les
   favoris d'avant (`Q15 ⑥`) — avant, elle réécrivait tout le compte, date de remise à zéro comprise.
3. **Les nouveaux favoris** (datés `t`) se gardent et se synchronisent normalement (`T08 ⑥`, `Q15 ③`).
4. **Protection** : au serveur, journal, profil et séances identiques à l'octet (`Q15 ② ⑧`) ; sur l'appareil, journal
   identique, totaux et contexte de Milo inchangés (`T07 ③`, `T12 ①`) ; un autre compte n'est jamais touché (`Q15 ⑨`).
5. **Une sauvegarde exploitable d'abord** : sur l'appareil, le fichier téléchargé est obligatoire, refusé s'il est périmé,
   rétablissable (`T07 ① ② ④`) ; au serveur, rien ne part sans copie — P1 copie avant de retirer, le surplus de la zone est
   **relu** dans Drive ; Drive en panne → la suppression passe et la zone garde tout jusqu'au plafond (`D-110`, `Q15 ④`) ;
   au-delà, l'envoi de favoris est refusé cette fois et rien n'est supprimé (`D-109`, `Q15 ⑤`).

⚠️ **Ce que la 1ʳᵉ version faisait de travers** (mesuré, corrigé avant livraison) : une copie Drive à part, et un **refus**
de l'envoi si Drive tombait — contraire à `D-110`, validée par Michel (pour les favoris, une panne de Drive ne refuse plus
l'envoi : un favori neuf refusé se perd à « Restaurer »). D'où la réutilisation de P1 : une seule mécanique de copie (R2).

### 13.3 La zone de récupération P1 et les sauvegardes nocturnes — ce qui se passe (⛔ rien n'est purgé)

| Où | Ce qui y reste après la remise à zéro | Revient-il dans l'app ? | Purge |
|---|---|---|---|
| Zone de récupération P1 (`recupNut.savedFoods`, dans le compte) | les favoris retirés, motif « raz » (et ceux retirés avant, par « ✕ » ou un envoi plus court) ; bornée à 60 000 caractères | **jamais** (ni `loadProfile`, ni les routes A1) | aucune |
| `ForceTracker-Backups/recup-nut/` (Drive) | le surplus le plus ancien de la zone, **relu** avant de la quitter | **jamais** | aucune |
| Sauvegardes nocturnes `backup-AAAA-MM-JJ.json` | les instantanés des nuits d'avant, anciens favoris compris | seulement par une **restauration admin** — qui ne les remet plus dans la liste active (`Q15 ⑥`) | aucune (« jamais supprimées automatiquement ») |
| Le fichier téléchargé par Michel (② de la carte Admin) | ses favoris et masquages au moment de la sauvegarde | seulement par « ♻️ Rétablir » — un geste volontaire, les favoris redeviennent d'aujourd'hui | à lui |

**Questions rendues à Michel (rien n'est décidé, rien n'est purgé)** : ① les copies « raz » de la zone de récupération — les
garder (défaut, la règle de P1) ou les purger après la remise à zéro, sur un GO et avec un protocole ; ② les sauvegardes
nocturnes qui contiennent les anciens favoris — les garder (défaut) ; une règle de conservation toucherait **toutes** les données
de **tous** les comptes, c'est une autre décision ; ③ garder « ♻️ Rétablir » (le seul chemin de retour, volontaire).

### 13.4 Conséquences précises d'une future modification de `Code.js`

- **Ce que le `Code.js` de la branche change par rapport à la production (@193)** : ① `saveProfile` garde et fusionne les
  masquages (`hiddenFoods`, commit `bb2075b9`) ; ② `D-141` : la date `*` du compte supprime ses favoris d'avant, par P1 ;
  ③ la restauration admin fusionne les masquages et ne remet pas les favoris d'avant ; ④ P1 reçoit un motif optionnel
  (« raz ») — **sans lui, son comportement est inchangé** (banc P1 82 / 0).
- **Inerte tant qu'aucune remise à zéro n'est exécutée** : aucun compte n'a de date `*` au serveur (la production ne garde
  même pas les masquages, et la remise à zéro est une carte Admin non publiée). Déployé seul, il ne fait que garder les
  masquages.
- ⛔ **Ordre obligatoire** : ne **jamais** exécuter la remise à zéro réelle avant ce déploiement — sinon les anciens favoris
  restent au serveur et reviennent par un autre appareil ou une restauration (la production ne connaît pas la date).
- **Mode de livraison** (réconcilié par Claude Principal) : le workflow Apps Script part tout seul si `Code.js` change sur
  master, sauf commit `[skip ci]` ; pratique validée : commit `[skip ci]`, puis lancement à la main **avec le GO**. Retour
  arrière : redéployer @193 — les favoris déjà supprimés restent dans la zone (et le fichier de Michel permet « ♻️ Rétablir »).
- **Une ancienne version de l'app** (sans favoris datés, `ft-v1260`) sur un appareil pas encore mis à jour : après une remise à
  zéro, un favori qu'elle ajouterait (sans `t`) serait pris pour un ancien et retiré (copié). L'app se met à jour au lancement ;
  à vérifier sur le compte de test.
- **Stockage** : la zone grossit de la taille des favoris retirés (bornée à 60 000 caractères, plafond 120 000 pendant une
  panne de Drive). Règle de P1 avant de déployer : **Santé du système ≤ 55 %**.
- **Outils voisins mis à jour** : `tools/mut_nut_secu_p1.py` (ancres M02, M03, M16 : les lignes de P1 portent le motif).

### 13.5 Tests exécutés (données inventées, réseau coupé, 0 appel Milo)

Données inventées (comptes `@example.test`, aliments fictifs), réseau coupé par le garde des bancs, **0 appel Milo**,
aucune donnée réelle, aucun déploiement. Arbre testé : `ebc751ee` + `01d1c88e` + `5a3a21a0` (outils de test seulement) — bancs
voisins, modes serveur, chaos, annexe et passe réduite sur cet arbre final ; le HEAD livré n'y ajoute que de la documentation.
⚠️ Le contrôle négatif B-NFIAB a commencé sur l'arbre d'avant une correction de texte (`35331051` : même code ; seuls un
commentaire de `Code.js`, l'ancre `RAZ_ORDRE` de l'outil et un message du banc différaient) et s'est fini sur l'arbre final
(l'outil copie l'arbre à chaque mutation) ; ses 63 ancres ont été revérifiées sur l'arbre final : 63 / 63 trouvées une fois.

| Banc / contrôle | Résultat | Ce qu'il prouve |
|---|---|---|
| B-NFIAB écran, **code d'avant** (`fc0a558d`) avec le banc final | **45 / 5** — exactement E2b ① ② ③ ④ ④b | les témoins E2b ① ② ③ ④ ④b sont **rouges** sur le code d'avant ; ⑤ ⑥ ⑦ (contrôles légitimes, scan juste) verts |
| B-NFIAB écran, branche | **50 / 0** (arbre sain de chaque groupe du contrôle négatif) | E2b vert ; N08, saisie à zéro, D-131, D-130 inchangés |
| B-NFIAB-X croisé, `Code.js` de la **branche** (`D-141`) | **78 / 0** (banc complet : écran 50 + croisé 28) | Q15 ① → ⑨, T07, T08 (contrat `D-141`), T08L, T12 |
| B-NFIAB-X croisé, `Code.js` de **master** (@193) | **15 / 0**, 13 « sans objet » (ni verts ni rouges) | le banc s'adapte : les témoins `D-141` passent « sans objet », rien de rouge |
| B-NFIAB-X croisé, `Code.js` d'**avant `D-141`** (`fc0a558d`, masquages gardés) | **21 / 0**, 7 « sans objet » (Q15 ① ③ ④ ⑤ ⑥ ⑦, T08 ⑧) ; T08 ③ joué au contrat `D-133` | idem ; le contrat `D-133` (masquage seul) reste vérifié |
| Contrôle négatif B-NFIAB (`tools/mut_nut_fiabilite.py`) | **57 / 57 conformes** en trois groupes (17 + 18 + 22) ; arbres sains 50 / 0 (écran, ×2) et 28 / 0 (croisé) — D7 → D10 relancées (4 / 4) après l'arrêt du groupe sur l'ancre de D7 (le commentaire corrigé pendant la course) | E1 → E4 (E2b), D1 → D10 (`D-141`), F5 / F22 révisées, et toutes les mutations d'avant |
| Banc P1 (`nut_secu_p1`) | **82 / 0** | sans motif, P1 se comporte comme avant |
| Contrôle négatif P1 (`mut_nut_secu_p1`) | **45 / 45** — 44 au premier passage, puis M00 relancée : 1 / 1 (56 rouges) | ancres M02 / M03 / M16 suivies ; ⚠️ M00 comparait P1 à… P1 : son « `Code.js` d'avant » était master, qui porte P1 depuis le 23/10 (`9a72e107`) — préexistant, sans lien avec `D-141` ; base fixée à `677cf50b` (master @192, juste avant P1), commit `5a3a21a0` |
| Contrôle négatif V2 × P1 (`mut_nut_v2_p1_croise`) | **8 / 8** — 7 au premier passage, puis C01 relancée : 1 / 1 (3 rouges) | même défaut que M00 pour C01 (« la prod @192 » = master), même correction |
| Bancs voisins désignés par le sélecteur (+ `pots_nutrition`) — **18 bancs, 826 / 0** | `aides_audit` 18 / 0 · `journal_qty_guard` 23 / 0 · `nut2_parcours` 111 / 0 · `seance_recette` 93 / 0 · `nut2_moteur` 70 / 0 · `nut_secu_p1` 82 / 0 · `nut_m6_rejeu` 29 / 0 · `pots_nutrition` 48 / 0 · `nut_v2_p1_croise` 16 / 0 · `repas_actif` 24 / 0 · `sec_admin` 69 / 0 · `ia_ref100` 36 / 0 · `lot3` 87 / 0 · `auth_new_device` 16 / 0 · `auth_cloud_closure` 9 / 0 · `auth_signup_strict` 8 / 0 · `cookie_profile` 16 / 0 · `s2b_bascule` 71 / 0 | non-régression : parcours Nutrition, Séance, P1, sécurité de l'admin, comptes et synchro |
| Annexe de recette (toutes les suites) | **14 PASS + 1 défaut connu** (`discussions`, ses 2 rouges listés : 71 545 / 76 464 / 68 782 caractères — **identiques** au code d'avant `fc0a558d` rejoué le même jour) ; `pwa-offline` PASS | le défaut connu de la taille du contexte de Milo, inchangé |
| Banc de chaos (vrai `Code.js`, vrai PostgreSQL local) | **56 / 0** | P1, synchro et serveur sous pannes, concurrence et fuzz (8 graines) — la base PostgreSQL jetable a dû être recréée (le conteneur avait redémarré), socket local seulement |
| Passe réduite : les blocs de la passe complète qui citent les fonctions changées ou leurs appelants (XXXIII, LXXXI, CLXII, CCVII, CCXLI, CCLXXV, CCLXXVIII, CCLXXX, CCLXXXV, CCLXXXVII, CCX, CCCIII, B-CCCXIII, B-CCCXVII — avec leurs sous-blocs) | **989 / 0**, puis **CCX seul : 46 / 0** (un titre mal écrit par moi, « `== BLOC CCX` », avait joué CCXCV à sa place) | la passe complète D-031 reste à Claude Principal, sur l'arbre d'intégration |
| Contexte de Milo, à données égales (R34) | **identique à l'octet**, 76 188 caractères (`fc0a558d` / après) | rien de ce que Milo reçoit ne change |
| Moteur MET | **8 fonctions identiques à master, 0 écart** | hors périmètre, non touché |
| T0 : `git diff --check`, `check_regles`, auto-test du sélecteur | **verts** : `diff --check` propre ; `check_regles` sans erreur (seul l'avertissement connu, non bloquant : `docs/PROMPT-MILO-REEL.txt` périmé) ; sélecteur **15 / 0** | |
| Banc de la carte Admin d'inventaire (`nut_inventaire_admin`) | **20 / 0** | le sélecteur rattache le commentaire de la remise à zéro à `loadNutInventaireAdmin`, sa voisine dans `app.js` : non modifiée, vérifiée quand même |

### 13.6 Limites et décisions restantes

- **Rien n'est vérifié sur un vrai téléphone** : E2b et `D-141` attendent la recette sur compte de test (`NUT-VAL-05`), après
  intégration, GO serveur et déploiement.
- **La copie Drive réelle dans `saveProfile` n'est pas éprouvée en production** (limite déjà écrite de P1) ; avec `D-141`, les
  copies restent d'ordinaire dans la zone — Drive n'intervient que si elle déborde.
- **Une ancienne version de l'app** (favoris non datés) sur un appareil pas encore mis à jour : après une remise à zéro, un
  favori qu'elle ajouterait serait pris pour un ancien (retiré, copié).
- **Un favori créé hors ligne sur un 2ᵉ appareil avant la remise à zéro, jamais synchronisé** : retiré de cet appareil à sa
  reconnexion (la date), sans copie au serveur — le fichier de sauvegarde vient du 1ᵉʳ appareil. Cas rare, nommé.
- **Un « ✕ » isolé n'est pas appliqué au serveur** (seule la remise à zéro l'est) : un appareil en retard peut y remettre un
  favori retiré par « ✕ » ; l'app l'écarte toujours par la date (préexistant).
- **Les favoris se synchronisent toujours « le dernier qui écrit gagne »** avec copie en zone (P1, préexistant ; `D-112`
  reportée).
- **La restauration admin remplace tout le compte** (journal, zone) — préexistant ; seuls favoris et masquages y sont gardés.
- **Le contrôle négatif relit l'arbre de travail à chaque mutation** : le modifier pendant la course fausse le résultat — vécu
  deux fois aujourd'hui, par moi (des copies effacées en cours de route ; puis un commentaire de `Code.js` corrigé pendant la course :
  l'ancre de D7 a manqué, le groupe s'est arrêté, D7 → D10 relancées sur l'arbre final). Idée consignée, **non faite** (hors
  périmètre) : figer une copie de l'arbre au départ de l'outil.
- **Pas de passe complète D-031** (passe réduite aux blocs concernés) : c'est à Claude Principal, sur l'arbre d'intégration.
- **Décisions en attente de Michel** : `D-136` et `D-137` (proposées) ; les trois questions sur la zone de récupération, les sauvegardes nocturnes et « ♻️ Rétablir » ; le GO serveur (déploiement
  de `Code.js`) ; le GO de recette ; puis, seulement après, le GO d'exécution réelle de la remise à zéro.

### 13.7 Compteurs (règle 17 — code de l'app et du serveur)

| Compteur | Valeur |
|---|---|
| Données persistées ajoutées | **0 clé nouvelle** — au serveur, les copies de la zone portent le motif « raz » et ses événements un champ `motif` (structures existantes de P1) |
| Fichiers applicatifs touchés | **3** : `app.js`, `index.html`, `Code.js` (commit séparé, non déployé) |
| Lignes ajoutées − retirées | **+88 − 13** (net + 75) : `app.js` + 20 − 8 (dont 1 ligne de code pour E2b, le reste en commentaires et textes), `index.html` + 1 − 1, `Code.js` + 67 − 4 |
| Anciens chemins supprimés ou fusionnés | **2 fusionnés, 0 supprimé** : la comparaison de `D-131` suit la règle même des listes (`_n2Propose`, un seul propriétaire) ; la suppression au serveur passe par P1 (aucune seconde mécanique de copie — ma 1ʳᵉ version en avait une, retirée) |

### 13.8 Registre et passation (règle d'or 19) — à reporter par Claude Principal

> **Lus avant la mission** (Drive, lecture seule, accès testé à 13:31 UTC) : le registre « SUIVI DES BUGS — FORCE TRACKER »,
> vue « Consolidé 25-10 » (59 lignes ; en entier pour les tickets ci-dessous), et la « PASSATION MAÎTRE » — ses blocs du 25/10
> (retours S6 / S7, règle 19, Q15 et validation). Le connecteur ne modifie pas un fichier existant (règle 18) : **Claude
> Principal** reporte ce bloc, mêmes IDs, même date (25/10/2026), rien d'effacé.
> Revérifié avant la livraison (14:36 UTC, métadonnées seulement) : registre modifié pour la dernière fois à 13:12 UTC,
> passation à 13:13 UTC — la lecture de 13:31 est donc la plus récente ; les « anciennes valeurs » ci-dessous sont à jour.

| ID | Ancienne valeur (Consolidé 25-10) | Nouvelle valeur proposée |
|---|---|---|
| `NUT-VERIFY-01` | « Reproduit par sonde indépendante rapportée ; ouvert, non corrigé dans PDF » · « Conserver OUVERT jusqu'à un témoin dédié rouge→vert » | **Corrigé sur branche** `claude/nutrition-v2` (commit `ebc751ee`) : seules les saisies encore proposées se comparent (`D-136`, proposée). Témoins `B-NFIAB E2b ① ② ③ ④ ④b` rouges sur `fc0a558d`, verts après ; ⑤ ⑥ ⑦ (contrôles légitimes, scan juste) verts des deux côtés ; mutations E1 → E4, F5. Journal intact. Publication : aucune. iPhone : à faire sur compte de test. |
| `NUT-FOR-04` (Q15) | « Q15 décidé le 25/10 ; suppression réelle à construire/valider, non exécutée » | **Suppression réelle PRÉPARÉE** (`D-137`, proposée ; `Code.js` commit `01d1c88e`, NON déployé) : au serveur, la date de remise à zéro supprime les favoris d'avant par la protection P1 (copie en zone d'abord) ; un appareil en retard, « Restaurer » ou une restauration admin d'avant ne les ramènent plus ; journal, profils et autres comptes intacts. **Aucune exécution.** Zone P1 et sauvegardes nocturnes : non purgées, 3 questions à Michel. `D-133` → REMPLACÉE → `D-141`. |
| `SERVEUR-CODEJS-01` | « Dépendance démontrée sur banc ; nouveau changement Q15 à qualifier » | `Code.js` de la branche = `bb2075b9` (masquages) + `01d1c88e` (`D-141` par P1, restauration admin gardée, motif optionnel de P1). Banc à trois modes (branche, master, avant `D-141`) ; banc P1 et son contrôle négatif rejoués. **NON déployé** ; déploiement à part avec GO (`[skip ci]` puis lancement à la main) ; ⛔ jamais de remise à zéro réelle avant ce déploiement. |
| `NUT-VAL-01` | « Validation finale non acquise ; Q15 exige désormais effacement réel serveur » | Mécanisme d'effacement réel **préparé** (sauvegarde obligatoire côté téléphone, copie avant suppression côté serveur) ; validation finale toujours non acquise : déploiement, recette compte de test, GO. |
| `NUT-VAL-02` | « Dépendance serveur démontrée sur banc ; recette réelle non faite » | Réapparition **fermée sur banc** pour la synchro, un autre appareil, « Restaurer » et la restauration admin (`Q15 ③ ⑥`, `T08 ④ ⑤ ⑧`, `T08L ③ ④`) ; recette réelle à faire. |
| `NUT-VAL-05` | « Non exécuté dans le PDF ; obligatoire avant Nutrition terminée » · « Clone après GO Q22 … Puis après GO serveur/publication : synchro et Restaurer en compte test AVANT vrai compte » | Inchangé (toujours **à faire**), deux scénarios ajoutés à la recette : **E2b** (produit fictif saisi faux deux fois, remise à zéro, saisie juste → ni « à vérifier » ni refus) et **`D-141`** (après déploiement de `Code.js` : remise à zéro sur compte de test → favoris d'avant absents au serveur et sur un 2ᵉ appareil, « Restaurer » ne les rend pas, un favori neuf se synchronise). |
| `INTEGRATION-NS-01` | « … Claude Nutrition clôt ses retours, Principal … refusionne » | Branche Nutrition avancée (HEAD : partie « Pour l'intégration ») : **à refusionner** ; `Code.js` en commit séparé ; `tools/mut_nut_secu_p1.py` (ancres M02 / M03 / M16) mis à jour avec lui ; la base de M00 (`mut_nut_secu_p1`) et de C01 (`mut_nut_v2_p1_croise`) fixée à `677cf50b` (master avant P1) — elles comparaient P1 à P1 depuis le 23/10. Passe complète D-031 sur l'arbre final : à Principal. |

**Source proposée** : « S8 — rapport de clôture ciblée Nutrition, 25/10 » (le registre s'arrête à S7).

**Passation maître — paragraphe proposé** : *« COMPLÉMENT — 25/10/2026 (fin d'après-midi) — CLÔTURE CIBLÉE NUTRITION (S8,
Claude Nutrition). NUT-VERIFY-01 (E2b) corrigé sur branche : seules les saisies encore proposées se comparent, journal intact,
contrôles légitimes et scan inchangés (D-136, proposée). NUT-FOR-04 / Q15 : suppression réelle des anciens favoris PRÉPARÉE au
serveur par la protection P1 (D-137, proposée ; Code.js en commit séparé, NON déployé) ; appareil en retard, Restaurer et
restauration admin ne les ramènent plus ; zone de récupération et sauvegardes nocturnes non purgées — trois questions à Michel
(copies de la zone, conservation des sauvegardes, « Rétablir »). D-133 remplacée par D-141. Aucune fusion, publication,
déploiement, suppression réelle ni donnée réelle. Recette iPhone sur compte de test et GO serveur toujours requis. »*

### 13.9 Pour l'intégration (handoff)

**Branche** `claude/nutrition-v2`, **HEAD de code `5a3a21a0`** (ensuite, documentation seulement, `[skip ci]`) — à jour de master `5c8fedb2` (fusionné en `b4c60c85`). ⛔ Rien sur master,
rien publié, rien déployé.

**Commits de la mission** (dans l'ordre) :

| Commit | Contenu |
|---|---|
| `7941d673` | journal de partage : ma ligne « en cours », poussée avant de coder `[skip ci]` |
| `ebc751ee` | application + tests : `app.js` (E2b ; textes de la remise à zéro), `index.html` (carte Admin), `tests/parcours/nut_fiabilite.js`, `tools/mut_nut_fiabilite.py`, `tests/recette/registre.json` |
| `01d1c88e` | **`Code.js`** (`D-141`, `D-137`) + `tools/mut_nut_secu_p1.py` (ancres M02 / M03 / M16) ; au même commit, alignés sur son texte : l'ancre `RAZ_ORDRE` de `tools/mut_nut_fiabilite.py` et un message du banc — **aucun fichier de l'app** ; **NON déployé** |
| `ab606683` | documentation (en cours) : `BUGS.md` §121 – §122, `docs/DECISIONS.md` (`D-136`, `D-137` ; `D-133` → REMPLACÉE → `D-141`), dossier §13.1 – §13.4, `docs/CONTEXTE-ACTUEL.md` `[skip ci]` |
| `5a3a21a0` | outils de test : M00 (`mut_nut_secu_p1`) et C01 (`mut_nut_v2_p1_croise`) comparent de nouveau P1 au `Code.js` d'avant P1 (base fixe `677cf50b`, master @192) — préexistant, constaté ici `[skip ci]` |
| `87e469d7` (+ la correction de cette table) | documentation (fin) : dossier §13.5 – §13.9, `docs/CONTEXTE-ACTUEL.md` (les tests), `docs/JOURNAL-DE-PARTAGE.md` (ligne close) `[skip ci]` |

**Fonctions touchées.** `app.js` : `_n2FichesVerifiees` (une ligne : seules les références encore proposées, `_n2Propose`) ;
`nutRazPerimetre`, `nutRazExecuter` (textes). `Code.js` : `_nutRazDate_`, `_nutRazTri_`, `_nutRazFavoris_` (nouvelles) ;
`_nutProtegerListe_` (motif optionnel ; sans lui, inchangée) ; `handleSaveProfile_` (ordre : masquages fusionnés → `D-141` →
P1) ; `handleAdminRestore_` (masquages fusionnés, favoris d'avant non remis).

**À faire à l'intégration (Claude Principal)** :

1. Fusionner le HEAD dans l'arbre d'intégration — conflits attendus en **documentation seulement** (journal de partage,
   `DECISIONS.md`, `BUGS.md`, `CONTEXTE-ACTUEL.md`) : garder les deux côtés. Numéros vérifiés libres sur master,
   `claude/dreamy-bell-pu88ia` et `claude/integration-nut-seance` : `D-136`, `D-137`, §121, §122.
2. **Passe complète D-031** sur l'arbre d'intégration (la mienne est réduite à 14 blocs) ; le sélecteur
   (`python3 tools/recette_selecteur.py --diff <base>`) désigne `NUT2-FIABILITE-01` et les suites voisines.
3. `Code.js` peut rester hors d'une première intégration : l'app et les bancs s'adaptent au `Code.js` servi (témoins `D-141`
   « sans objet », `T08 ③` suit alors le contrat `D-133`) — vérifié dans les trois modes. ⚠️ Mais alors le texte de la carte
   Admin (« supprimés … du serveur ») ne serait vrai qu'après le déploiement : **la remise à zéro ne s'exécute pas avant**.
4. **Déploiement Apps Script** : à part, avec le GO de Michel ; commit `[skip ci]` sur master puis lancement à la main du
   workflow ; vérifier `?test=1` et **Santé du système ≤ 55 %** avant ; retour arrière : @193.
5. **Recette iPhone** (`NUT-VAL-05`) sur compte de test : E2b (un produit fictif saisi faux deux fois, remise à zéro, saisie
   juste → pas de « à vérifier ») ; `D-141` (remise à zéro, puis : favoris d'avant absents au serveur et sur un 2ᵉ appareil,
   « Restaurer » ne les rend pas, un favori neuf se synchronise).
6. ⛔ **Remise à zéro réelle du compte de Michel** : seulement après 4 et 5, et sur son GO d'exécution.
7. Contrôle négatif : `python3 tools/mut_nut_fiabilite.py [préfixes]` (57 mutations ; ex. `E1,E2,E3,E4` ou `D1,…,D10`) —
   les mutations `D` passent « sans objet » si `Code.js` ne porte pas `_nutRazFavoris_(`.
8. Registre et passation : le bloc « Registre et passation » est à reporter (le connecteur ne modifie pas un fichier existant).
