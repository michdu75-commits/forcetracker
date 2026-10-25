# 🖼️ SEANCE-UX-IMAGES — les vignettes anatomiques de « Choisir un exercice »

> **Statut (23/10/2026) : développé, testé et qualifié (passe complète 7 923 ✅ / 0 ❌) sur la branche `claude/dreamy-bell-pu88ia` (session-C, Claude Séance), qui porte
> aussi SEANCE-REPOS-01 — NON intégré à master, NON publié, clone NON régénéré, aucun numéro de version.** Paquet et consignes de
> Michel du 23/10 (ZIP `FORCE-TRACKER-SEANCE-UX-IMAGES-2026-10-22`). Décisions : `docs/DECISIONS.md` **D-104** (Michel) et
> **D-105** (choix de construction, à valider) — ⚠️ numéros à reconfirmer à l'intégration (Nutrition V2 a pris D-101 et D-103).
> **Ajout du 23/10 au matin — la vignette Mollets** (2ᵉ ZIP de Michel, `FORCE-TRACKER-MOLLETS-VIGNETTE`) : décisions **D-106**
> (Michel : `08_mollets.png` remplace l'image de Mollets, **rien d'autre**) et **D-107** (Claude : retirer son fond blanc, ancrer
> à 35 % — à valider). ⚠️ La passe complète ci-dessous (7 923 / 0) est **antérieure** à cet ajout : il a ses tests ciblés (§5) ; la
> passe complète est à refaire avant toute intégration.

## 1. La demande

- Brancher les vignettes anatomiques du paquet sur l'écran « Choisir un exercice », **et nulle part ailleurs** : ni les autres
  écrans, ni le bouton « 🫀 Anatomie ».
- **Garder la catégorie Mollets.** Le paquet n'a pas de vignette mollets ; sa 8ᵉ image est « Corps complet » — **ne pas
  l'utiliser pour les mollets**, et signaler le manque.
- Préserver la recherche, les catégories et la reconnaissance des exercices. Branche seule : ni fusion ni publication.
- Les règles du paquet (`INSTRUCTIONS-CLAUDE-SEANCE.md`) : fichiers fournis branchés tels quels (pas d'image « approchante »), pas
  de vignette de groupe pour un exercice inconnu, vignettes de groupe réservées au sélecteur, pas d'élément nouveau (bandeau,
  sous-titre, filtre) parce que la maquette en montre un, aucune image étirée, `cover` *« seulement si aucune zone anatomique
  importante n'est coupée »*, le sujet jamais masqué par du texte, un voile ou un flou, *« vérifier l'absence de débordement »* dans
  la vraie largeur iPhone, captures avant / après.

## 2. Ce qui a été vérifié dans le paquet AVANT de coder

- **Les empreintes** : les 8 PNG ont exactement les SHA-256 du manifeste (8/8).
- **Le liseré** : les vignettes ont été découpées dans une capture de maquette, et le découpage a emporté, en haut de chaque image,
  **de 3 à 17 lignes** de fond de page puis le **bord de la carte** de la maquette (mesuré ligne par ligne : 7 · 12 · 3 · 9 · 11 ·
  16 · 17 pour les 7 groupes). Les coins et les bords latéraux, eux, sont propres (inspectés à ×3).
- **8 groupes** dans l'app, **exactement** : Pectoraux, Dos / Dorsaux, Épaules / Trapèzes, Bras — Biceps / Triceps, Jambes,
  Fessiers / Ischios / Lombaires, Abdominaux, Mollets. Le paquet en couvre **7** ; « Corps complet » n'a pas de groupe ici.

## 3. La correspondance (stricte)

| Groupe de l'app | Image | Fichier du dépôt |
|---|---|---|
| Pectoraux | `01_pectoraux.png` | `muscles/vignettes/01_pectoraux.png` |
| Dos / Dorsaux | `02_dos_dorsaux.png` | `muscles/vignettes/02_dos_dorsaux.png` |
| Épaules / Trapèzes | `03_epaules_trapezes.png` | `muscles/vignettes/03_epaules_trapezes.png` |
| Bras — Biceps / Triceps | `04_bras_biceps_triceps.png` | `muscles/vignettes/04_bras_biceps_triceps.png` |
| Jambes | `05_jambes.png` | `muscles/vignettes/05_jambes.png` |
| Fessiers / Ischios / Lombaires | `06_fessiers_ischios_lombaires.png` | `muscles/vignettes/06_fessiers_ischios_lombaires.png` |
| Abdominaux | `07_abdominaux.png` | `muscles/vignettes/07_abdominaux.png` |
| **Mollets** | ⚠️ aucune dans le 1ᵉʳ paquet → **`08_mollets.png` du 2ᵉ paquet** (23/10 matin) | `muscles/vignettes/08_mollets.png` — la carte **sans son fond blanc** (§3 bis) |
| *(aucun groupe)* | `08_corps_complet.png` | **non copiée, utilisée nulle part** |

## 3 bis. La vignette Mollets (2ᵉ paquet, 23/10 matin)

- **Livré** : un seul fichier, `08_mollets.png`, **2172 × 724**, SHA-256 `11f4582abb89743ca0e45165daaac36ba0ca450d42cf16499a6c2ac68db7856e`,
  sans manifeste ni consigne. **Ce n'est pas une vignette cadrée comme les 7 autres** : c'est une **carte arrondie** (fond bleu
  nuit) posée au milieu d'un grand **fond blanc** — la carte va de x = 588 à 1583, sur toute la hauteur.
- **Tel quel**, le cadre 88 × 51 aurait montré **21 % de blanc** (deux bandes sur les côtés, mesuré).
- **Ce qui est dans le dépôt** (décision **D-107**, Claude, à valider) : la carte seule — boîte (588, 0) → (1584, 724),
  **996 × 724**, **chaque pixel conservé identique à l'original** (vérifié pixel par pixel), sans redimensionner ni retoucher.
  SHA-256 du fichier du dépôt : `59605168c31134b904ba1f878082c0425d70c4444e5e34f7409c8764bde0f499`. Il ne reste du blanc que dans
  les 4 coins arrondis de la carte (2,7 % de l'image).
- **Son ancrage** : 35 % de sa hauteur (`.ex-grp-vig-mollets`) — mesuré sur 6 positions : c'est celle qui ne coupe **aucun
  muscle ciblé** (l'orange commence à la ligne 55 ; centrée, 1,1 % de l'orange partait) et ne laisse voir que **0,18 %** de blanc
  (les coins). Cachés : 51 lignes en haut (les genoux), 95 en bas (les talons).
- Poids : 765 Ko (l'ancienne image de Mollets : 1,8 Mo) — les 8 tuiles passent de 2,1 à **1,0 Mo**.

## 4. Mise en œuvre

| Fichier | Changement |
|---|---|
| `muscles/vignettes/` (7 PNG, ~260 Ko, + `08_mollets.png`, 765 Ko) | les 7 fichiers du paquet **à l'octet** (Mollets : §3 bis) — ⚠️ **sous des noms NOUVEAUX** : les images vivent dans un cache du téléphone qui ne se vide jamais (`ft-images`) ; une image remplacée sous le même nom resterait l'ancienne chez tout le monde |
| `log.js` — `EX_GROUPS`, en-tête d'un groupe ouvert | seule la source des 8 images change (et la classe d'affichage) ; **libellés, `tags` (les catégories) et `anatomy` (le bouton « Anatomie ») inchangés** ; dans l'en-tête d'un groupe ouvert, le libellé devient un élément (`.ex-grp-header-label`) pour pouvoir passer sous l'image **seulement** s'il ne tient pas à côté |
| `style.css` — `.ex-grp-icon`, `.ex-grp-vig`, `.ex-grp-vig-mollets`, `.ex-grp-header`, `.ex-grp-header-label` | cadre **88 × 51**, **plus large que les vignettes** (1,73 contre 1,41 à 1,51), rempli sans étirer (`cover`) et **ancré en bas** : il en coupe le haut — 15 à 24 lignes source, **12 à 18 %** —, c'est-à-dire le **liseré** (3 à 17 lignes) puis **0 à 12 lignes de dessin** (cous, mentons) ; **aucun muscle ciblé (orange) coupé**, sauf 2 à 5 pixels sur Jambes (selon le seuil) ; rien sur les côtés ; sans recolorer. Le conteneur de la tuile prend la taille de l'image (**un seul propriétaire de la taille** : `.ex-grp-vig` ; l'arrondi est redit par le conteneur, qui porte le fond) ; fond rouge des anciennes tuiles retiré ; l'image ne rétrécit pas (`flex-shrink:0`) ; l'en-tête d'un groupe ouvert met l'image et le libellé **côte à côte quand le libellé tient** (390 px : les 8), sinon le libellé passe dessous comme avant le lot ; Mollets ancrée à 35 % (`.ex-grp-vig-mollets`, qui remplace `.ex-grp-vig-centre` de l'ancienne image) |
| `sw.js` | les 8 vignettes ajoutées à la liste de **préchargement** (le sélecteur s'ouvre hors ligne) — ⛔ **pas** le numéro de version ; signalé à Claude Principal et Claude Nutrition avant d'écrire |

**⚠️ Défaut trouvé par la revue adverse du 23/10, corrigé avant toute intégration** : la 1ʳᵉ version mettait l'en-tête d'un
groupe ouvert en ligne **sans retour possible** — à **320 px**, « Abdominaux » poussait le bouton « 🫀 Anatomie » **20 px** hors de
la feuille et la liste glissait de côté (Pectoraux et Fessiers : 1 à 2 px) ; **avant le lot, rien ne débordait** (mesuré dans le
rendu, 8 groupes × 5 largeurs). Aucun témoin ne le voyait : l'en-tête n'était testé qu'à 390 px, le contrôle de débordement ne
regardait que les tuiles (`BUGS.md` §99). Correctif : l'en-tête peut passer à la ligne, le libellé a une base nulle — il reste
à côté de l'image tant que son mot le plus long y tient ; mesuré ensuite **sans aucun débordement de 300 à 430 px**, et à 390 px
la même disposition qu'avant le correctif. Témoin **C-VIG-B4** (les 8 groupes ouverts à 320 et 340 px).

**Ce qui ne change pas, mesuré** : les vignettes des autres écrans viennent d'une autre table (`_MG_IMG`), intacte ; une ligne
d'exercice inconnu n'affiche aucune image (comme avant) ; aucune aide ne décrit les images du sélecteur — ⚖️ **pas d'annonce**
(règle d'or #11 : changement purement visuel, rien à faire, aucun repère déplacé ; et la consigne de Michel exclut les autres écrans).

## 5. Les tests (23/10/2026, réseau coupé, 0 appel à Milo)

| Contrôle | Résultat |
|---|---|
| **Banc** `tools/banc_picker_vignettes.js` (blocs C-VIG-*, 19 témoins : tuiles à 320 / 390 / 430 px, correspondance stricte, Mollets, liseré masqué calculé depuis le rendu, en-tête sans rétrécir, **les 8 groupes ouverts à 320 et 340 px sans débordement**, « Anatomie », recherche, exercice inconnu, autres écrans, **hors ligne par le vrai service worker**, empreintes SHA-256, liste `PRECACHE` **évaluée**, catégories figées) | **19 OK / 0** (arbre final) · avant le correctif de l'en-tête : **18 / 1** (C-VIG-B4, le défaut) · sur le code d'avant le lot : **8 OK / 11 rouges** (les 8 verts = les invariants : libellés, catégories, recherche, Anatomie, exercice inconnu, autres écrans, aucun débordement) |
| **Contrôle négatif** `tools/mut_picker_vignettes.py` (20 mutations : 17 doivent rougir avec SON témoin, 3 doivent rester vertes) | **20 / 20 conformes** — les 17 casses rougissent chacune avec SON témoin (le code d'avant remis : 10 rouges ; MV15 → C-VIG-B4, MV16 → C-VIG-B1, MV17 → C-VIG-S2), le commentaire (MN1), « center bottom » (MN2) et MV5 restent verts ; l'arbre sain rejoué à la fin de chaque moitié : 0 rouge. ⚠️ **MV5 reclassée équivalente** : elle retire l'interdiction de rétrécir la vignette, et rougissait tant que l'en-tête ne passait pas à la ligne ; avec le correctif, l'en-tête passe à la ligne au lieu d'écraser l'image — **mesuré** sans cette règle : vignette en 88 × 51 de 300 à 430 px, en-tête comme tuiles, aucun débordement (rejouée seule : conforme ; la règle reste, défensive). Historique : 1ᵉʳ tour **16 / 17** (MV6 restait verte : C-VIG-B1 ne mesurait que le **premier caractère** du libellé ; témoin corrigé), 2ᵉ tour **17 / 17** ; puis la revue adverse a ajouté 3 casses — MV15 (l'en-tête ne passe plus à la ligne → C-VIG-B4), MV16 (le libellé reprend sa largeur de contenu → C-VIG-B1), MV17 (les lignes de préchargement mises **en commentaire** : l'ancien C-VIG-S2, qui cherchait du texte, restait vert avec 0 vignette préchargée → il évalue maintenant la liste) |
| **Bouton central « + »** (règle d'or #9, hors dépôt : `#nb-log` mesuré, pas regardé ; rejoué après le correctif) | **immobile et identique avant / après** : 320 / 390 / 430 px × sans séance / séance ouverte (observée par `_seanceOuverte()`) × 5 états (sélecteur fermé, ouvert, groupe Dos, groupe Mollets, refermé) |
| **Bancs voisins** (sélecteur `--diff origin/master`) + annexe de recette | **0 rouge** — avant le correctif de l'en-tête : 14 bancs, **852** témoins ; après : les 4 qui ouvrent le sélecteur rejoués (picker 19 · seance_ux 69 · seance_date 25 · session_integrity 93 = **206**) · annexe **14 PASS + 1 défaut connu** (`discussions` : 71 725 / 76 644 / 68 781 caractères, les chiffres de master) ; ⚠️ `calculs` d'abord marquée « erreur d'infra » : c'est **mon commit pendant la suite** (elle vérifie que rien ne change dans le dépôt) — rejouée seule : PASS |
| **Vignette Mollets — tests ciblés** (23/10 matin, demande de Michel : « avec les tests ciblés nécessaires ») | banc **20 / 0** (+ **C-VIG-A6** : blanc visible et muscles coupés, calculés sur les pixels de l'image et sa position réellement rendue ; sur la version d'avant l'ajout : **12 / 8**, les 8 rouges = A2, A3, A6, B1, E1, S1, S2, S4) · contrôle négatif **25 / 25** (MV18 ancienne image → A2 ; MV19 le fichier **tel que livré**, fond blanc compris → A6 ; MV20 centrée → A6 ; MV21 sans ancrage → A6 ; MN3, ancrée à 33 % au lieu de 35 %, **reste verte** : le témoin juge le résultat, pas la valeur) · comparateur **12 / 12** · bouton central **immobile** · voisins du sélecteur **207** témoins, 0 rouge (picker 20 · seance_ux 69 · seance_date 25 · session_integrity 93). ⚠️ **Passe complète NON refaite** pour cet ajout (la ligne ci-dessous le précède) : à refaire avant toute intégration |
| **Passe complète D-031** (les deux lots de la branche, AVANT la vignette Mollets) | **7 923 ✅ / 0 ❌, VALIDE** sur `756c97a3` (4 conditions ; ④ revérifiée hors isolement : 0 commit de retard sur master `980566dd`) — 90 min ; les 19 C-VIG et les 61 C-REP verts. Depuis : documentation seulement (D-031) |
| **Comparateur avant ↔ après** (hors dépôt) : contenu des 8 groupes (lignes, sections de matériel), 30 recherches, reconnaissance de 30 intitulés libres (`_matchExercise`, `exId`) | **12 / 12 identiques** (rejoué après le correctif) ; ⛔ contre-épreuve : une catégorie modifiée dans une copie le fait rougir sur le bon groupe |
| Captures **avant / après** (390 et 320 px, liste entière et groupe ouvert, Abdominaux ouvert à 320 px, zoom ×3 des 8 vignettes) | dans le PDF de livraison (hors dépôt) |

⚠️ **Marge fine, à regarder sur l'iPhone** : le cadre cache en haut 15 à 24 lignes de chaque image source pour un liseré de 3 à 17 ; la marge n'est que de **≈ 1 ligne sur Abdominaux** (17,9 cachées pour 17) et **≈ 3 sur Fessiers** (18,9 pour 16). Vérifié sans aucune trace dans Chromium, rendu agrandi ×3 (la densité d'un iPhone) ; un autre moteur qui lisse autrement (Safari) pourrait laisser un trait très fin en haut de ces deux tuiles — c'est un point de la recette, pas une certitude.

⚠️ **Ce que les témoins ne couvrent pas** : Safari / l'iPhone réel ; le jugement esthétique (c'est le rôle des captures et de la
recette de Michel) ; le mode clair ; la précision anatomique des illustrations (non validée médicalement — limite écrite du paquet).

## 6. Ce que ce lot ne fait pas (limites écrites)

- **Mollets** : sa vignette est arrivée à part (2ᵉ paquet) et elle est branchée (§3 bis). ⚠️ Son fichier n'est **pas** l'octet
  livré : c'est la même image sans son fond blanc (D-107, à valider).
- **« Corps complet »** : aucun groupe ne l'utilise. Avant-bras (5 exercices) et Full Body (17) n'ont pas de tuile aujourd'hui —
  en ajouter une serait une **catégorie nouvelle**, donc une décision de Michel.
- Les sous-titres de la maquette (« Grand pectoral • Petit pectoral »…), son bandeau et sa barre de navigation ne sont **pas**
  reproduits (règle 4 du paquet ; et une liste de muscles sous un groupe laisserait croire que tous ses exercices les
  travaillent tous — règle 3).
- Le Guide n'a pas de capture du sélecteur ; la capture promotionnelle `25-choix-exercice` (outil `tools/captures.js`, hors app)
  montrera les nouvelles vignettes à sa prochaine génération.
- Les anciennes images (`muscles/*.png`) restent : les autres écrans s'en servent (`_MG_IMG`, vérifié).
- **À la publication**, chaque téléphone déjà installé verra **une fois** la barre « 📦 Installation de l'appli… » : le service
  worker télécharge les 8 images qui manquent à son cache d'images (≈ 1 Mo) — c'est son fonctionnement normal (`precacheImages`).

## 7. Retour arrière

- **Tant que rien n'est intégré** : ne pas fusionner. Master et la production ne sont pas touchés.
- **Après publication** : remettre `log.js` (`EX_GROUPS` et la ligne de l'en-tête d'un groupe ouvert), `style.css` (5 règles :
  `.ex-grp-icon`, `.ex-grp-vig`, `.ex-grp-vig-mollets`, `.ex-grp-header`, `.ex-grp-header-label`) et `sw.js` (6 lignes) tels
  qu'avant, monter la clé de cache. Les 8 fichiers peuvent rester (inutilisés) ou partir ; ceux déjà en cache sur les téléphones y restent sans effet.
- **Pour la seule vignette Mollets** : remettre la ligne Mollets d'`EX_GROUPS` (`muscles/muscle mollet.png`, classe
  `ex-grp-vig-centre`), la règle `.ex-grp-vig-centre{object-position:50% 50%;}` et retirer la ligne de préchargement.

## 8. Règle d'or #17 — les 4 compteurs (code applicatif seulement)

- **Données persistées ajoutées : 0** (aucune clé, aucune donnée).
- **Fichiers applicatifs touchés : 3** (`log.js`, `style.css`, `sw.js`) **+ 8 images nouvelles** (`muscles/vignettes/`).
- **Lignes : +49 / −11** pour tout le lot (`log.js` +25 / −9, `style.css` +18 / −2, `sw.js` +6), dont l'ajout Mollets **+13 / −6**
  (commentaires compris) ; **le code seul**, sans les commentaires : `log.js` **+9 / −9** (les 8 lignes d'`EX_GROUPS` réécrites et
  la ligne de l'en-tête), `sw.js` **+4** (préchargement), `style.css` **5 règles** (2 modifiées, 3 ajoutées).
- **Anciens chemins supprimés ou fusionnés : 0** — aucun : les anciennes images servent encore ailleurs ; la taille du cadre a
  désormais **un** propriétaire (la classe `.ex-grp-vig`, que le conteneur suit) au lieu de 8 styles en ligne différents.
