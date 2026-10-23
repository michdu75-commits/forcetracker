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
  sous-titre, filtre) parce que la maquette en montre un, rien d'étiré ni de masqué, captures avant / après.

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
| `log.js` — `EX_GROUPS` | seule la source des 7 images change (et la classe d'affichage) ; **libellés, `tags` (les catégories) et `anatomy` (le bouton « Anatomie ») inchangés** |
| `style.css` — `.ex-grp-icon`, `.ex-grp-vig`, `.ex-grp-header` | cadre **88 × 51** (le rapport des vignettes), `cover` **ancré en bas** : il masque le liseré du haut sans étirer ni recolorer ; fond rouge des anciennes tuiles retiré ; l'image ne rétrécit pas (`flex-shrink:0`) ; l'en-tête d'un groupe ouvert met l'image et le libellé **côte à côte** (le libellé long passait sous l'image — déjà avant le lot) ; Mollets centrée |
| `sw.js` | les 7 vignettes ajoutées à la liste de **préchargement** (le sélecteur s'ouvre hors ligne) — ⛔ **pas** le numéro de version ; signalé à Claude Principal et Claude Nutrition avant d'écrire |

**Ce qui ne change pas, mesuré** : les vignettes des autres écrans viennent d'une autre table (`_MG_IMG`), intacte ; une ligne
d'exercice inconnu n'affiche aucune image (comme avant) ; aucune aide ne décrit les images du sélecteur — ⚖️ **pas d'annonce**
(règle d'or #11 : changement purement visuel, rien à faire, aucun repère déplacé ; et la consigne de Michel exclut les autres écrans).

## 5. Les tests (23/10/2026, réseau coupé, 0 appel à Milo)

| Contrôle | Résultat |
|---|---|
| **Banc** `tools/banc_picker_vignettes.js` (blocs C-VIG-*, 18 témoins : tuiles à 320 / 390 / 430 px, correspondance stricte, Mollets, liseré masqué calculé depuis le rendu, en-tête sans rétrécir, « Anatomie », recherche, exercice inconnu, autres écrans, **hors ligne par le vrai service worker**, empreintes SHA-256, catégories figées) | **18 OK / 0** · sur le code d'avant : **7 OK / 11 rouges** (les 7 verts = les invariants : libellés, catégories, recherche, Anatomie, exercice inconnu, autres écrans) |
| **Contrôle négatif** `tools/mut_picker_vignettes.py` (17 mutations : 15 doivent rougir avec SON témoin, 2 doivent rester vertes) | «MUTVIG» |
| **Comparateur avant ↔ après** (hors dépôt) : contenu des 8 groupes (lignes, sections de matériel), 30 recherches, reconnaissance de 30 intitulés libres (`_matchExercise`, `exId`) | **12 / 12 identiques** ; ⛔ contre-épreuve : une catégorie modifiée dans une copie le fait rougir sur le bon groupe |
| Captures **avant / après** (390 et 320 px, liste et groupe ouvert, zoom ×3 des 8 vignettes et de leurs coins) | dans le PDF de livraison (hors dépôt) |

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
- Les anciennes images (`muscles/*.png`) restent : les autres écrans s'en servent.

## 7. Retour arrière

- **Tant que rien n'est intégré** : ne pas fusionner. Master et la production ne sont pas touchés.
- **Après publication** : remettre `log.js` (`EX_GROUPS`), `style.css` (3 règles) et `sw.js` (5 lignes) tels qu'avant, monter la
  clé de cache. Les 7 fichiers peuvent rester (inutilisés) ou partir ; ceux déjà en cache sur les téléphones y restent sans effet.

## 8. Règle d'or #17 — les 4 compteurs (code applicatif seulement)

- **Données persistées ajoutées : 0** (aucune clé, aucune donnée).
- **Fichiers applicatifs touchés : 3** (`log.js`, `style.css`, `sw.js`) **+ 7 images nouvelles** (`muscles/vignettes/`).
- **Lignes : +33 / −10** (`log.js` +20 / −8, `style.css` +8 / −2, `sw.js` +5) ; **le code seul** (`log.js`, `sw.js` sans
  commentaires, analyseur `acorn`) : **+11 / −8** — les 8 lignes d'`EX_GROUPS` réécrites, et les 3 lignes de préchargement.
- **Anciens chemins supprimés ou fusionnés : 0** — aucun : les anciennes images servent encore ailleurs ; le cadre des tuiles a
  désormais **un** propriétaire (la classe `.ex-grp-vig`) au lieu de 8 styles en ligne différents.
