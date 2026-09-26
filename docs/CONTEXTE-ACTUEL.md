# 📍 Contexte actuel — Force Tracker

> **Le PREMIER document à lire avant toute nouvelle tâche.** Une page maximum.
> Il donne l'état du projet en un coup d'œil, sans relire tout le reste.
> ⚠️ À tenir à jour EN TEMPS RÉEL (règle d'or #12).
> 🗂️ **Ramené à une page le 24/09/2026** (il faisait 7 198 lignes). Tout l'historique retiré est
> conservé **mot pour mot** en fin de `docs/JOURNAL-ARCHIVE.md` (**R23** — *tailler ≠ supprimer*).

---

## 📌 Version

- **Version en ligne (live) :** `ft-v1236` — ✅ **publiée et vérifiée en réel sur téléphone** (Michel, Menu → À propos, 26/09 ; Pages n°1315 sur `eb1b2c4a`). 🔬 MILO-SEANCE-02 / C1 seul : la lecture de secours de la séance lit le format que le prompt demande à Milo (format du prompt 0/4 → 4/4, mélange 2/4 → 4/4). Symptôme réel 4→2 : cause de l'événement réel **non déterminée**. Précédente : `ft-v1235` (publication de la branche `project-status`, MILO-PDF1/1B, D-025 → D-028).
- Prochaine : `ft-v1237`. ⚠️ Le numéro fait foi dans `sw.js` et dans l'en-tête du journal de `CLAUDE.md`, jamais ici.

## 🧊 Contraintes en vigueur — décisions actées (règle d'or #15)

- **Chantier Nutrition gelé en phase d'observation réelle** (Michel, 13/09) : toute modification de son comportement exige un **nouveau feu vert explicite**. Détail : `CLAUDE.md`, `docs/DOUANE-NUTRITION.md`. ↪️ Feu vert donné par Michel le 24/09 pour le seul chantier « TDEE / glucides / provenance » : B1/B2 et D-016/D-020/D-021 sont **publiés en `ft-v1235`** ; le gel vaut toujours pour tout le reste.
- **Le repas actif est clos, le chantier Nutrition ne l'est pas** (arbitrage du 20/09) : **D-011** (le choix manuel survit au changement de jour) et **D-012** (au rechargement : on observe).
- **On ne touche pas au workflow de déploiement** (Michel, 27/08). ⚠️ Cette décision n'est écrite **que** dans `docs/JOURNAL-DE-PARTAGE.md` (ligne ⛔).

## 🔬 Chantier actif

- **Publication MILO-PDF1 → `ft-v1235`** (26/09, session-A) — ✅ **publiée et vérifiée en réel** (V1/V2/V4 ; V3 à observer). Worker d'abord (déployé depuis la branche, **1 appel réel** : `complete: true`, `end_turn`), puis intégration sur master et app. Deux décisions de Michel prises juste avant, **publiées en `ft-v1235`** : **D-027** (bouton programme : déjà conforme, figé) et **D-028** (l'annonce de prochaine séance n'est plus enregistrée depuis une réponse non confirmée ; une annonce déjà enregistrée n'est ni remplacée ni effacée). Détail : `docs/MILO-PDF1.md` §C.

- **Tri documentaire** de ce fichier et de `docs/JOURNAL-DE-PARTAGE.md` (24/09, session-A) — **terminé**, validé par Michel, committé et poussé en `0d8a22b2`. Dépôt documentaire propre.
- **Chantier Poids** (24/09, session-A) — **publié en `ft-v1235`** : `f9a8ec74` (données) + `66a6bd5e` (UX « Dernière mesure »). Corrigés : **F003, F004, F011**, et **F005 pour sa moitié « validation des entrées »** (sa 2ᵉ moitié, les `S.bw || 80` des calculs, reste ouverte) ; **F012 : prémisse réfutée** (mesuré). Décisions rendues à Michel : plusieurs pesées le même jour (le modèle en garde une) · le champ poids du **Profil** reste prérempli · lignes invalides déjà stockées (aucune migration) · `S.bw || 80` des calculs de séance / suppléments (gel Nutrition). ⛔ À la publication : bump `ft-v1235`, entrée de journal dans `CLAUDE.md`, règle d'or #11 (aide · point rouge · Guide).
- **Chantier Milo — provenance du débrief** (24/09, session-A) — **publié en `ft-v1235`** : `e3ae216e` + `307f0972`. Larsen « 70→90 » (fait fabriqué par l'app), superset aplati et RIR de l'Oiseau jamais proposé : **corrigés** ; cardio de fin → « échauffement » : phase conservée par le code, cause **non démontrable** sans la séance réelle. Trace : `RETOURS-TESTEURS.md` (24/09).
- **Backlog Poids, à ne pas perdre** : ⚠️ la carte **Masse grasse** crée une pesée du jour avec un kilo **recopié** — la « Dernière mesure » peut porter la date de cette écriture au lieu d'une vraie pesée → **futur chantier ciblé**. Et : plusieurs pesées le même jour (migration) · champ poids du Profil prérempli (décision d'écran) · anciennes lignes invalides (aucune migration) · `S.bw || 80` (gel Nutrition).
- **Chantier Nutrition — glucides / TDEE** (24/09, session-A) — **politique glucidique et B3 : en attente de décision de Michel** (le résidu glucidique n'est toujours pas plafonné). Mesuré : les glucides sont le **résidu** `(cible − 4P − 9L)/4` sans plafond ; les ~659 g viennent d'un profil **reconstruit** (activité 1,725 + métier physique), pas des entrées déclarées (387 g). Témoins NUT-01→09 figés. Détail et options A→G : `docs/NUTRITION-GLUCIDES-2026-09-24.md`. ✅ **B1/B2 publiés en `ft-v1235`** : activité jamais choisie ≠ 1,55 (`D-020`), relectures bornées ; `D-021` **tranchée par Michel le 25/09** (anciens `1,55` : une confirmation unique, implémentée et testée, §11) ; B3 et politique glucidique **non touchés**. Nuit 24→25/09 : remises à zéro testées, B2 étendu, 4 défauts du périmètre B1/B2 corrigés (lecture tolérante ; régression de `saveKcalEdit` ; plantage silencieux de l'onglet Nutrition sur un TDEE absent ; plan « 0 kcal » qu'il cachait), remesure + matrice activité × métier + B3 factuel → `docs/NUTRITION-GLUCIDES-2026-09-24.md` §10.
- **Backlog futur, consigné le 24/09 (ne PAS traiter sans chantier dédié)** : ① **cardio — chronologie ≠ intention** : le cas de Michel était un cardio rangé dans le volet « Avant », que Milo a appelé échauffement de façon cohérente ; mais « Avant » ≠ échauffement et « Après » ≠ finisher (10 min de vélo doux ≠ 45 min de zone 2). Direction : séparer chronologie (avant/après), intention (échauffement · séance cardio · finisher · récupération · autre) et profil sportif (aide à proposer, jamais à imposer). ② **calories de séance** : le moteur de musculation est **GELÉ** (long à stabiliser) — futur chantier « audit calories séance V2, lecture seule d'abord » ; et un bloc cardio pourrait un jour avoir des calories modifiables avec provenance `auto` / `manuel`.
- **Audit forensique** : **12 défauts numérotés (F001 → F012)** — F003, F004, F011 et la moitié « entrées » de F005 **publiés en `ft-v1235`**, F012 réfuté ; **les autres ne sont pas corrigés**, **aucun ordre de correction décidé**. ⚠️ Le registre qui les numérote **n'est PAS dans le dépôt** (bloc-notes de session, hors dépôt car celui-ci est public) ; seuls trois dossiers y sont : `docs/SUPPRESSION-QUI-NE-REMONTE-PAS.pdf`, `docs/PROVENANCE-MASSE-GRASSE.pdf`, `docs/POIDS-RESTAURATION-SANS-BORNE.pdf`.

## 🍽️ Retour récurrent de Michel : « l'application donne trop de calories »

- Consigné le 22/09 — **palier R22 : RÉCURRENT**. Son doute n'était écrit nulle part avant.
- ⛔ L'analyse chiffrée qui l'accompagnait est **invalidée** : elle reposait sur un profil de test qui ne correspond pas aux données déclarées de Michel. **Aucun chiffre de remplacement** : une conclusion TDEE / PAL devra être **remesurée** depuis les entrées réellement actives.
- `tdeeObserve()` (candidate **V9**) : **non servie** (0 occurrence dans les fichiers servis, vérifié le 24/09), aucune publication, **décision jamais prise** — pas une décision en attente.

## ⚖️ Décisions ouvertes

- **Aucune dans `docs/DECISIONS.md`** : 28 entrées (D-001 → D-028), toutes `VALIDÉ` ou `REMPLACÉE` (vérifié le 26/09).
- **Hors registre — DÉCISION MICHEL EN ATTENTE** : règle d'or #11, **points 2 à 5** pour le marqueur « réponse incomplète / non confirmée » (point rouge, aide `?`, aide détaillée, Guide) — rien n'a été posé ; correctifs MILO-SEANCE-01 **C2 et C3** (C1 publié en `ft-v1236`) ; correction de la faille D-025 / « Mes discussions ».
- **Ouvert, vérifié hors registre** : les essais cachés derrière `window.__FT_CLONE__` (12 occurrences dans `app.js` et `coach.js`) — chaque essai reste à décider (`CLAUDE.md`).
- **Trous connus du classement des données (R4a)** : `badges` et `dayStateLog`, déclarés transmis à Milo sans l'être (`tests/donnees/donnees-milo.json`).

## ❓ Points historiques NON re-vérifiés — ni ouverts, ni fermés

Retirés de ce fichier le 24/09 sans qu'on puisse établir leur état actuel. Texte intégral dans l'archive. ⛔ **À vérifier avant de les rouvrir**, jamais à reprendre de mémoire :
- V14 — `AI_GLOBAL_MAX` · « O'Tacos ne contient aucun tacos » · `data/alias.json` n'est plus régénérable · le doublon « pull-over » · les points signalés par Michel le 23/08 au soir · les 5 drapeaux du Gardien non lus (22/08) · l'architecture cerveau / cervelet (une direction, rien de construit) · l'expérience au verdict attendu le 11/08 · le « RESTE À FAIRE » du 23/07.

## ⏭️ Prochaine étape

- **Après `ft-v1235`** : observer en réel le chemin de troncature de l'analyse de programme (aucune troncature naturelle n'a encore été vue — on ne la provoque pas).
- **MILO-SEANCE-01 → MILO-SEANCE-02 (26/09)** : **SYMPTÔME RÉEL — CAUSE DE L'ÉVÉNEMENT RÉEL NON DÉTERMINÉE.** Un mécanisme capable de produire le 4 → 2 est reproduit localement dans la lecture de secours (`_seanceDepuisTexte`). Un seul échec de traduction établi sur les deux essais de la vérification (essai 1 : traduction lancée au tap, lue 2,5 s plus tard ; essai 2 : délai ou réseau non distingué). ✅ **C1 clos : corrigé, publié en `ft-v1236` et vérifié en réel sur téléphone** : la lecture de secours lit le format que le prompt demande (0/4 → 4/4, mélange 2/4 → 4/4). ⏳ **Restent ouverts, non corrigés** : **C2** (une proposition de mémoire masque la carte séance) · **C3** (la séance traduite redevient celle du repli au rechargement — U9 vert seulement par effet de bord de C1). **Délai de 12 s inchangé.** Dossier : `docs/MILO-SEANCE-01.md` §9. **Décision de Michel attendue** pour C2/C3.
- ⚠️ **Défaut ACTIF — réouverture ÉTROITE de D-025** : « Mes discussions » peut perdre le marqueur « coupée » et permettre à une réponse incomplète de redevenir candidate à une séance. Démontré par MILO-SEANCE-01, **non corrigé**. Ne rouvre **pas** le reste de MILO-PDF1.
- **Cartes séance multiples** : **1 seule carte dans 8 situations testées**, contrôle négatif **3/3** ; le témoin (`tests/parcours/seance_unicite.js`) est dans le dépôt mais **pas branché dans la passe principale** (U8 = C2 y est rouge exprès) ; les 3 parcours de carte de C1 (`tests/parcours/seance_c1.js`), eux, y sont. Ce n'est pas une preuve d'impossibilité.
- Pour l'audit : **l'ordre de correction des défauts restants (F001, F002, F006 → F010, et la 2ᵉ moitié de F005) est à décider par Michel.**

## 🧭 Où lire quoi

- **Règles** : `CLAUDE.md` (règles d'or, journal récent des versions) · `docs/REGLES-ARCHITECTURE.md`.
- **Décisions** : `docs/DECISIONS.md` — **Qui travaille sur quoi** : `docs/JOURNAL-DE-PARTAGE.md`.
- **Historique complet** : `docs/JOURNAL-ARCHIVE.md` — **Bugs par famille** : `BUGS.md`.
- **Retours des testeurs** : `RETOURS-TESTEURS.md`.
