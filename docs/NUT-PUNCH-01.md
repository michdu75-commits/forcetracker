# 🍽️ NUT-PUNCH-01 — coup de poing Nutrition (03/10/2026)

> **Statut : branche `claude/nut-punch-01`, NON publiée.** Base `master ad172a87` (ft-v1249).
> Feu vert de Michel du 03/10/2026 : corrections factuelles prouvées + UX validée (« Tes repas
> habituels », « Ce qu'il te reste »). ⛔ Ni pas, ni Katch/Navy/%gras, ni Milo réel, ni multisport,
> ni publication. Aucun numéro de version pendant le travail (protocole du 13/09).
>
> Vocabulaire : **OBSERVÉ DANS LE CODE** · **BUG FACTUEL** · **DÉCISION PRODUIT VALIDÉE** ·
> **DIRECTION FUTURE** · **DETTE CONNUE** · **HORS LOT**.

## 1. Ce qui a changé, par sous-lot

| Sous-lot | Nature | Avant (master, mesuré) | Après (branche) |
|---|---|---|---|
| **A** contrat Séance → Nutrition | tests seuls | — | 23 témoins (21 conduits + 2 de source : vraie séance, rechargements, date locale après minuit, 0 appel réseau), dont 5 contrôles négatifs ; 5 observations jamais rouges |
| **A2** écran Séance vide | BUG FACTUEL | afficher l'onglet Séance un jour de repos = « séance en cours » (repas pré/post, macros côté séance), et après une sauvegarde toute la journée, rechargement compris | `jourSeance` lit la définition unique `_seanceOuverte` (log.js) |
| **B1** cycle en jours | BUG FACTUEL | 4 j × 2 séances → `f = 8`, cycle coupé ; 3 j × 2 → semaine non neutre (−182 g de glucides, +77 g de lipides) | le SEUL cycle compte des jours (`_weeklyCounts(4,true)`) ; tuile, proposition de niveau, carte de Milo : inchangées |
| **B2** cache de région | BUG FACTUEL | région de la séance ouverte figée « inconnue » : ni la 1ʳᵉ série, ni la fin de séance ne corrigeaient le cycle ni la couleur du calendrier avant rechargement | la clé porte l'état « série validée » de chaque exercice |
| **B3** jour annoncé | BUG FACTUEL | facteur 1 (452 / 73 g) au lieu du « jour de séance typique » annoncé la veille (456 / 71 g) | r̄ (moyenne par JOUR), rien deviné du libellé ; séance faite de région inconnue : facteur 1 gardé |
| **C1** low carb | BUG FACTUEL | « ⚡ Autour de la séance » affiché les jours de repos | rôle du repas lu sur l'intitulé d'origine ; retiré les jours de repos, calories redistribuées |
| **C2** jeûne | BUG FACTUEL | force / endurance 16/8, séance 18 h : plus aucun pré-entraînement (renommé « Rupture du jeûne ») ; un jour de repos, son contenu restait affiché | « ⏳ Rupture du jeûne (12 h) — avant ta séance de 18 h » ; un jour de repos, aucun repas d'entraînement, même renommé (2 repas au lieu de 3, total identique) |
| **D1** tendance de force | BUG FACTUEL | l'échauffement `É` comptait (+26,3 % au lieu de +2,6 %) ; le garde-fou de volume comptait les paliers | `É` et `W` exclus (comme `_workVol`) ; `X` reste du travail ; `E` non tranché |
| **D2** phase du cycle menstruel | BUG FACTUEL | bascule à MIDI (+150 kcal lutéaux l'après-midi seulement) | dates locales, bascule à minuit |
| **D3** « Séance demain » | BUG FACTUEL | en UTC+13 / +14, datée d'AUJOURD'HUI | `today(ts)` : demain local |
| **D4** tuile | BUG FACTUEL (libellé) | « Cette semaine » pour 7 jours glissants | « 7 derniers jours » |
| **E** repas habituels | DÉCISION PRODUIT VALIDÉE | HAB1 : 2 cartes de shaker sur 3, « Poulet + pâtes » absent, titres bruts, « noté X fois » sur chaque carte | une carte par famille, variantes derrière, titres courts sûrs, détail au tap |
| **E′** guillemet dans un nom | BUG FACTUEL | un repas habituel contenant `"` cassait le bouton (erreur au clic, rien ajouté) | échappement par l'utilitaire existant `_escAttrJs` |
| **F** « Il te reste aujourd'hui » | DÉCISION PRODUIT VALIDÉE | équivalences affichées d'office (« 250 g de Blanc de poulet + 2 × … »), jamais le reste en kcal / P / G / L | ≈ kcal puis P · G · L ; idées sur un appui |
| **F′** aide « ? » | texte (R23) | l'entrée « plan de repas » de l'aide nommait encore « ce qu'il te reste, en vrai » | « il te reste aujourd'hui », témoin conduit (aide ouverte) |
| **UI** zones tactiles | vérification réelle | — | « N variantes » et « Voir des idées » : 29 px → 40 px |

## 2. Les règles écrites (le COMMENT, décidé par Claude dans le cadre validé)

**Familles de repas habituels (E).** Deux habitudes sont de la même famille si les aliments de l'une
sont TOUS dans l'autre (nom, casse ignorée) ET que cette base commune apporte **au moins la moitié des
protéines** du plus grand repas (repli : la moitié des calories si le repas n'a aucune protéine, puis
la moitié des aliments si rien n'est chiffré). Les familles se forment dans l'ordre du classement
(fréquence, puis récence) ; la carte principale est la plus fréquente ; une habitude rejoint la
première famille dont un membre est sa variante. ⚠️ « La moitié » est une **convention**, écrite et
témoignée (HAB1 → HAB4 et leurs bornes), pas une vérité. La part en **calories** a été essayée puis
**écartée par un témoin** : l'huile pèse 82 % des calories d'une « salade + huile » (0 % des
protéines) — « huile seule » devenait une variante de la salade.

**Libellés courts (E).** Seulement pour un nom déjà choisi depuis CIQUAL (provenance, pas forme du
texte) : on garde ce qui précède la 1ʳᵉ virgule. Jamais si deux noms complets donneraient le même
libellé. Ordre : la source de protéines d'abord (pas les calories : « Huile d'olive + salade »).
Le nom enregistré n'est jamais modifié ; il s'affiche en entier au tap.

**« Il te reste aujourd'hui » (F).** Nombres de `_resteDuJour` (calcul inchangé). Rien un jour passé,
rien si rien n'est noté, rien si la cible est atteinte ou dépassée, « atteint » au lieu d'un négatif.
Le Journal ne répète pas les kcal de son en-tête. Idées dans un déroulant fermé.

## 3. Décisions déjà actées et GARDÉES (règle d'or #15)

- **ft-v1102** — « kcal mangées » reste le gros chiffre de la carte du jour ; le reste vient sous les
  anneaux, au second plan (témoin B-NP01-F).
- **ft-v1029** — après 20 h : silence sans idée légère utile ; sinon seules les macros qu'une idée
  légère complète encore, sans total kcal (témoins + mutations MF6, MF10, MF11).
- **ft-v1052** — le moment d'un repas habituel se DEMANDE au tap, il ne s'applique jamais seul.
- **ft-v1062** — une habitude notée aujourd'hui sur un autre moment reste proposée par ses autres
  variantes.
- **ft-v950 / ft-v951** — repas d'entraînement seulement les jours de séance ; cycle neutre sur la semaine.

## 4. ⛔ RÈGLE ABSOLUE — l'historique alimentaire n'est jamais réécrit

Le regroupement des repas habituels est une **VUE** (un index calculé à l'affichage), jamais une
fusion destructive : aucun nom, aucune ligne, aucune quantité du journal n'est modifié. Témoin
B-NP01-E §14 : journal capturé avant → regroupement → rejeu d'une variante par vrais clics → vrai
rechargement → les lignes d'avant sont identiques **octet pour octet**, seules les lignes voulues
s'ajoutent. Mutation déguisée ME7 (un libellé court qui renommerait les aliments enregistrés) :
gardée.

## 5. DIRECTION FUTURE (validée par Michel, NON construite)

Deux natures d'effort à ne jamais confondre :

- **A. SÉANCE SPORTIVE STRUCTURÉE** — musculation, elliptique, rameur, cardio structuré, marche
  **volontairement déclarée comme séance**, récupération active structurée.
- **B. ACTIVITÉ DE VIE / QUOTIDIENNE** — une balade de 3 h, une grosse journée de marche en
  vacances, un déplacement, une activité exceptionnelle : **pas automatiquement une séance**.

⭐ **La distinction est SÉMANTIQUE, pas une question de durée** : 3 h de marche en vacances restent une
activité de vie ; 30 min de marche déclarées comme séance sont une séance. À reprendre pour un futur
`TrainingDaySummary` / `ActivityDaySummary` et les intégrations santé natives. ⛔ Rien de cela n'est
codé ici.

## 6. HORS LOT (et le reste)

- **Pas / Apple Santé / montres** : Michel confirme que l'automatisation des pas n'a jamais atteint
  un usage réel stable. Aucun investissement, G2/G9 non choisis, cible non modifiée sur cette base ;
  non-régressions seulement.
- **Katch / Navy / % de gras** : G3/G4 non choisis, formules et priorités inchangées.
- **Milo** : 0 appel réel, prompt inchangé (texte identique ; seules les lignes datées diffèrent
  dans `docs/PROMPT-MILO-REEL.txt`, régénéré). Le contexte local change seulement sur la ligne des
  macros du jour, dans les 3 cas corrigés (jour annoncé, 4 j × 2, écran Séance vide) — calories
  identiques. ⚠️ **R34** : le banc réel n'a pas tourné.
- **Aliments / recettes perso (8.2)** : direction validée, non lancée.

## 7. DETTES CONNUES (écrites pour ne pas être « réparées » par erreur)

- **Observations du contrat, jamais rouges** : la dernière séance du jour donne la région ;
  deux séances le même jour = deux événements pour le compteur ; un bloc abdos séparé donne la
  région du jour ; un cardio seul fait un jour de séance de région inconnue (facteur 1) ; une
  annonce est honorée par n'importe quelle séance.
- **« Démarrer » sans rien** n'est plus une séance en cours (définition unique appliquée) : le jour
  devient un jour de séance au 1ᵉʳ exercice, cardio noté ou série validée.
- **G11** (quel repas dans la fenêtre de jeûne selon l'heure de séance) : non décidé.
- **Code `E`** (sans accent) : sens non tranché, toujours exclu de la tendance.
- **Familles** : deux variantes par substitution (« shaker + banane » / « shaker + pomme ») restent
  séparées si « shaker » seul n'est pas une habitude ; les familles ne fusionnent pas entre elles.
- **Libellés** : seuls les noms CIQUAL sont raccourcis (les noms Open Food Facts et manuels restent
  entiers, tronqués par « … »).
- **Accueil** : le message de régularité « N séances cette semaine » compte des JOURS distincts
  depuis lundi sous le mot « séances » — hors lot.
- **Annonces passées** : deux entrées anciennes de `NEW_FEATURES` (`constants.js`) citent encore « ce qu'il te
  reste, en vrai » — c'est de l'histoire, elles ne sont pas réécrites.
- **Générateurs de PDF d'audits passés** (`tools/gen_nutri_audit_pdf.py`, `tools/gen_nutri_correctifs_pdf.py`) :
  ils lisent encore le seuil des habitudes dans `_repasHabituels` et refuseraient de régénérer leur
  PDF. Ils décrivent l'état d'alors ; à faire suivre seulement s'il faut les relancer.
- **Pop-up WHATS_NEW** : méritée (un repère a bougé : variantes rangées, idées sur demande) mais elle
  exige un numéro de version — à poser à la publication.

## 8. Tests

- Banc : `node tools/banc_nut_punch01.js [contrat|cycle|repas|reliquats|habituels|reste]` — **111 OK / 0 rouge**
  (comptés dans la passe complète sur l'arbre final `b9c11776`) ; chaque bug factuel a son témoin, rouge sur master `ad172a87`.
- Contrôle négatif : `python3 tools/mut_nut_punch01.py` — **60 mutations, 60 conformes**, toutes appliquées DANS LA COPIE MUTÉE
  (dépôt cloné, jamais modifié).
- Blocs `B-NP01-A` → `B-NP01-F`, branchés dans la passe complète. Passe D-031 : **passe complète sur `b9c11776` : 5 873 ✅ / 0 ❌, 4 conditions vertes (18:07 → 18:53 UTC) ; une 1ʳᵉ passe sur `e3219cba` (5 871 ✅ · 2 ❌) avait trouvé deux témoins anciens rendus faux par la refonte, corrigés et éprouvés par mutation**.
- Bancs voisins désignés par le sélecteur de recette : habitudes_alim 37/0 · ordre_repas 39/0 · nutri_b3 102/0 · nutri_moteur 28/0 · nutri_lipides25 38/0 · repas_actif 24/0 · ia_ref100 36/0 · pots_nutrition 48/0 · plan_incomplet 46/0 · contrat_milo 23/0 · nutri_dash1 12/0 · nutri_objectifs (mesure : 90 combinaisons, écarts discipline 0, niveau 0, 0 erreur de page) — tous verts (sur `bb9bf7a1` ; la suite ne change qu'un texte d'aide et des témoins).
- Annexe de recette : 14 PASS + 1 DÉFAUT CONNU (« discussions » : taille du contexte de Milo, 71 538 / 76 457 / 68 778 caractères, identique à master à la même minute, 35/37 des deux côtés) — sur `bb9bf7a1`.
- Témoins existants ajustés (raison écrite à chaque endroit, R30) : `tests/calculs` (« une séance EN
  COURS compte » utilisait l'objet vide de `renderLog`) ; 5 blocs du runner qui lisaient l'ancien
  titre « Ce qu'il te reste, en vrai » ou mesuraient des idées affichées d'office.
- ⭐ **Ce que seule la passe complète a vu** (1ʳᵉ passe sur `e3219cba` : 5 871 ✅ · 2 ❌, aucun défaut de
  l'app) : ① le bloc CXXV lisait le Journal **sans l'afficher** (`goScreen('s-nutrition')` n'ouvre aucun
  écran) — un élément non affiché rend tout son texte à `innerText`, déroulant fermé compris, donc
  « fermé au départ » ne pouvait pas être mesuré ; Journal maintenant affiché, titre comparé sans la
  casse, horloge de la page figée à 14 h (le rendu lisait l'heure réelle) ; ② le témoin de périmètre
  B-CCCXXIII H0 cherchait le seuil `s.n >= 2` dans `_repasHabituels`, d'où il a déménagé — inchangé —
  dans `_repasHabituelsTous`. Les deux corrigés, verts sur l'arbre sain, **rouges DANS LA COPIE MUTÉE**
  (idées ouvertes d'office · mention retirée · seuil 2 → 3). *Les petits bancs ne lancent pas ces
  blocs : c'est exactement pourquoi la passe entière est exigée.*
