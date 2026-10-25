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
