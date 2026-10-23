# 🖼️ SEANCE-UX-IMAGES — les vignettes anatomiques de « Choisir un exercice »

> **Statut (23/10/2026) : développé et testé sur la branche `claude/dreamy-bell-pu88ia` (session-C, Claude Séance), qui porte
> aussi SEANCE-REPOS-01 — NON intégré à master, NON publié, clone NON régénéré, aucun numéro de version.** Paquet et consignes de
> Michel du 23/10 (ZIP `FORCE-TRACKER-SEANCE-UX-IMAGES-2026-10-22`). Décisions : `docs/DECISIONS.md` **D-104** (Michel) et
> **D-105** (choix de construction, à valider) — ⚠️ numéros à reconfirmer à l'intégration (Nutrition V2 a pris D-101 et D-103).

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
| **Mollets** | ⚠️ **aucune dans le paquet** | **garde son image actuelle** (`muscles/muscle mollet.png`), en attendant une vignette mollets |
| *(aucun groupe)* | `08_corps_complet.png` | **non copiée, utilisée nulle part** |

## 4. Mise en œuvre

| Fichier | Changement |
|---|---|
| `muscles/vignettes/` (7 PNG, ~260 Ko) | les fichiers du paquet **à l'octet** — ⚠️ **sous des noms NOUVEAUX** : les images vivent dans un cache du téléphone qui ne se vide jamais (`ft-images`) ; une image remplacée sous le même nom resterait l'ancienne chez tout le monde |
| `log.js` — `EX_GROUPS`, en-tête d'un groupe ouvert | seule la source des 7 images change (et la classe d'affichage) ; **libellés, `tags` (les catégories) et `anatomy` (le bouton « Anatomie ») inchangés** ; dans l'en-tête d'un groupe ouvert, le libellé devient un élément (`.ex-grp-header-label`) pour pouvoir passer sous l'image **seulement** s'il ne tient pas à côté |
| `style.css` — `.ex-grp-icon`, `.ex-grp-vig`, `.ex-grp-vig-centre`, `.ex-grp-header`, `.ex-grp-header-label` | cadre **88 × 51**, **plus large que les vignettes** (1,73 contre 1,41 à 1,51), rempli sans étirer (`cover`) et **ancré en bas** : il en coupe le haut — 15 à 24 lignes source, **12 à 18 %** —, c'est-à-dire le **liseré** (3 à 17 lignes) puis **0 à 12 lignes de dessin** (cous, mentons) ; **aucun muscle ciblé (orange) coupé**, sauf 2 à 5 pixels sur Jambes (selon le seuil) ; rien sur les côtés ; sans recolorer. Le conteneur de la tuile prend la taille de l'image (**un seul propriétaire de la taille** : `.ex-grp-vig` ; l'arrondi est redit par le conteneur, qui porte le fond) ; fond rouge des anciennes tuiles retiré ; l'image ne rétrécit pas (`flex-shrink:0`) ; l'en-tête d'un groupe ouvert met l'image et le libellé **côte à côte quand le libellé tient** (390 px : les 8), sinon le libellé passe dessous comme avant le lot ; Mollets centrée |
| `sw.js` | les 7 vignettes ajoutées à la liste de **préchargement** (le sélecteur s'ouvre hors ligne) — ⛔ **pas** le numéro de version ; signalé à Claude Principal et Claude Nutrition avant d'écrire |

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
| **Bancs voisins** (sélecteur `--diff origin/master`) + annexe de recette | «VOISINSVIG» |
| **Passe complète D-031** (les deux lots de la branche) | «PASSEVIG» |
| **Comparateur avant ↔ après** (hors dépôt) : contenu des 8 groupes (lignes, sections de matériel), 30 recherches, reconnaissance de 30 intitulés libres (`_matchExercise`, `exId`) | **12 / 12 identiques** (rejoué après le correctif) ; ⛔ contre-épreuve : une catégorie modifiée dans une copie le fait rougir sur le bon groupe |
| Captures **avant / après** (390 et 320 px, liste entière et groupe ouvert, Abdominaux ouvert à 320 px, zoom ×3 des 8 vignettes) | dans le PDF de livraison (hors dépôt) |

⚠️ **Marge fine, à regarder sur l'iPhone** : le cadre cache en haut 15 à 24 lignes de chaque image source pour un liseré de 3 à 17 ; la marge n'est que de **≈ 1 ligne sur Abdominaux** (17,9 cachées pour 17) et **≈ 3 sur Fessiers** (18,9 pour 16). Vérifié sans aucune trace dans Chromium, rendu agrandi ×3 (la densité d'un iPhone) ; un autre moteur qui lisse autrement (Safari) pourrait laisser un trait très fin en haut de ces deux tuiles — c'est un point de la recette, pas une certitude.

⚠️ **Ce que les témoins ne couvrent pas** : Safari / l'iPhone réel ; le jugement esthétique (c'est le rôle des captures et de la
recette de Michel) ; le mode clair ; la précision anatomique des illustrations (non validée médicalement — limite écrite du paquet).

## 6. Ce que ce lot ne fait pas (limites écrites)

- **Mollets n'a pas de vignette du nouveau style** : son image actuelle (rouge, autre facture) tranche avec les 7 autres. Il
  faut **une vignette mollets** indépendante (pas extrapolée, pas « Corps complet ») pour finir.
- **« Corps complet »** : aucun groupe ne l'utilise. Avant-bras (5 exercices) et Full Body (17) n'ont pas de tuile aujourd'hui —
  en ajouter une serait une **catégorie nouvelle**, donc une décision de Michel.
- Les sous-titres de la maquette (« Grand pectoral • Petit pectoral »…), son bandeau et sa barre de navigation ne sont **pas**
  reproduits (règle 4 du paquet ; et une liste de muscles sous un groupe laisserait croire que tous ses exercices les
  travaillent tous — règle 3).
- Le Guide n'a pas de capture du sélecteur ; la capture promotionnelle `25-choix-exercice` (outil `tools/captures.js`, hors app)
  montrera les nouvelles vignettes à sa prochaine génération.
- Les anciennes images (`muscles/*.png`) restent : les autres écrans s'en servent (`_MG_IMG`, vérifié).
- **À la publication**, chaque téléphone déjà installé verra **une fois** la barre « 📦 Installation de l'appli… » : le service
  worker télécharge les 7 images qui manquent à son cache d'images (≈ 260 Ko) — c'est son fonctionnement normal (`precacheImages`).

## 7. Retour arrière

- **Tant que rien n'est intégré** : ne pas fusionner. Master et la production ne sont pas touchés.
- **Après publication** : remettre `log.js` (`EX_GROUPS` et la ligne de l'en-tête d'un groupe ouvert), `style.css` (5 règles :
  `.ex-grp-icon`, `.ex-grp-vig`, `.ex-grp-vig-centre`, `.ex-grp-header`, `.ex-grp-header-label`) et `sw.js` (5 lignes) tels
  qu'avant, monter la clé de cache. Les 7 fichiers peuvent rester (inutilisés) ou partir ; ceux déjà en cache sur les téléphones y restent sans effet.

## 8. Règle d'or #17 — les 4 compteurs (code applicatif seulement)

- **Données persistées ajoutées : 0** (aucune clé, aucune donnée).
- **Fichiers applicatifs touchés : 3** (`log.js`, `style.css`, `sw.js`) **+ 7 images nouvelles** (`muscles/vignettes/`).
- **Lignes : +42 / −11** (`log.js` +21 / −9, `style.css` +16 / −2, `sw.js` +5) ; **le code seul**, sans les commentaires :
  `log.js` **+9 / −9** (les 8 lignes d'`EX_GROUPS` réécrites et la ligne de l'en-tête), `sw.js` **+3** (préchargement),
  `style.css` **5 règles** (2 modifiées, 3 ajoutées).
- **Anciens chemins supprimés ou fusionnés : 0** — aucun : les anciennes images servent encore ailleurs ; la taille du cadre a
  désormais **un** propriétaire (la classe `.ex-grp-vig`, que le conteneur suit) au lieu de 8 styles en ligne différents.
