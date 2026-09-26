# 📍 Contexte actuel — Force Tracker

> **Le PREMIER document à lire avant toute nouvelle tâche.** Une page maximum.
> Il donne l'état du projet en un coup d'œil, sans relire tout le reste.
> ⚠️ À tenir à jour EN TEMPS RÉEL (règle d'or #12).
> 🗂️ **Ramené à une page le 24/09/2026** (il faisait 7 198 lignes). Tout l'historique retiré est
> conservé **mot pour mot** en fin de `docs/JOURNAL-ARCHIVE.md` (**R23** — *tailler ≠ supprimer*).

---

## 📌 Version

- **Version en ligne (live) :** `ft-v1235` — 🚀 publication de la branche `project-status` : une réponse de Milo coupée ou non confirmée porte un marqueur et ne produit plus rien d'automatique (MILO-PDF1/1B, D-025 → D-028), plus AUTH1, contrat FT→Milo, Nutrition B1/B2/D-016/D-020/D-021, R34-A (D-022/D-024), chaîne poids et provenance du débrief. Worker déployé et vérifié **avant** l'app.
- Prochaine : `ft-v1236`. ⚠️ Le numéro fait foi dans `sw.js` et dans l'en-tête du journal de `CLAUDE.md`, jamais ici.

## 🧊 Contraintes en vigueur — décisions actées (règle d'or #15)

- **Chantier Nutrition gelé en phase d'observation réelle** (Michel, 13/09) : toute modification de son comportement exige un **nouveau feu vert explicite**. Détail : `CLAUDE.md`, `docs/DOUANE-NUTRITION.md`.
- **Le repas actif est clos, le chantier Nutrition ne l'est pas** (arbitrage du 20/09) : **D-011** (le choix manuel survit au changement de jour) et **D-012** (au rechargement : on observe).
- **On ne touche pas au workflow de déploiement** (Michel, 27/08). ⚠️ Cette décision n'est écrite **que** dans `docs/JOURNAL-DE-PARTAGE.md` (ligne ⛔).

## 🔬 Chantier actif

- **Publication MILO-PDF1 → `ft-v1235`** (26/09, session-A) — ✅ **publiée et vérifiée en réel** (V1/V2/V4 ; V3 à observer). Worker d'abord (déployé depuis la branche, **1 appel réel** : `complete: true`, `end_turn`), puis intégration sur master et app. Deux décisions de Michel prises juste avant : **D-027** (bouton programme : déjà conforme, figé) et **D-028** (l'annonce de prochaine séance n'est plus enregistrée depuis une réponse non confirmée). Détail : `docs/MILO-PDF1.md` §C.

- **Tri documentaire** de ce fichier et de `docs/JOURNAL-DE-PARTAGE.md` (24/09, session-A) — **terminé**, validé par Michel, committé et poussé en `0d8a22b2`. Dépôt documentaire propre.
- **Chantier Poids** (24/09, session-A) — **publié en `ft-v1235`** : `f9a8ec74` (données) + `66a6bd5e` (UX « Dernière mesure »). Corrigés : **F003, F004, F011**, et **F005 pour sa moitié « validation des entrées »** (sa 2ᵉ moitié, les `S.bw || 80` des calculs, reste ouverte) ; **F012 : prémisse réfutée** (mesuré). Décisions rendues à Michel : plusieurs pesées le même jour (le modèle en garde une) · le champ poids du **Profil** reste prérempli · lignes invalides déjà stockées (aucune migration) · `S.bw || 80` des calculs de séance / suppléments (gel Nutrition). ⛔ À la publication : bump `ft-v1235`, entrée de journal dans `CLAUDE.md`, règle d'or #11 (aide · point rouge · Guide).
- **Chantier Milo — provenance du débrief** (24/09, session-A) — **publié en `ft-v1235`** : `e3ae216e` + `307f0972`. Larsen « 70→90 » (fait fabriqué par l'app), superset aplati et RIR de l'Oiseau jamais proposé : **corrigés** ; cardio de fin → « échauffement » : phase conservée par le code, cause **non démontrable** sans la séance réelle. Trace : `RETOURS-TESTEURS.md` (24/09).
- **Backlog Poids, à ne pas perdre** : ⚠️ la carte **Masse grasse** crée une pesée du jour avec un kilo **recopié** — la « Dernière mesure » peut porter la date de cette écriture au lieu d'une vraie pesée → **futur chantier ciblé**. Et : plusieurs pesées le même jour (migration) · champ poids du Profil prérempli (décision d'écran) · anciennes lignes invalides (aucune migration) · `S.bw || 80` (gel Nutrition) · publication du chantier Poids non faite.
- **Chantier Nutrition — glucides / TDEE** (24/09, session-A) — **en attente de décision de Michel**, moteur **non modifié**. Mesuré : les glucides sont le **résidu** `(cible − 4P − 9L)/4` sans plafond ; les ~659 g viennent d'un profil **reconstruit** (activité 1,725 + métier physique), pas des entrées déclarées (387 g). Témoins NUT-01→09 figés. Détail et options A→G : `docs/NUTRITION-GLUCIDES-2026-09-24.md`. ✅ **B1/B2 corrigés sur la branche (non publiés)** : activité jamais choisie ≠ 1,55 (`D-020`), relectures bornées ; `D-021` **tranchée par Michel le 25/09** (anciens `1,55` : une confirmation unique, implémentée et testée, §11) ; B3 et politique glucidique **non touchés**. Nuit 24→25/09 : remises à zéro testées, B2 étendu, 4 défauts du périmètre B1/B2 corrigés (lecture tolérante ; régression de `saveKcalEdit` ; plantage silencieux de l'onglet Nutrition sur un TDEE absent ; plan « 0 kcal » qu'il cachait), remesure + matrice activité × métier + B3 factuel → `docs/NUTRITION-GLUCIDES-2026-09-24.md` §10.
- **Backlog futur, consigné le 24/09 (ne PAS traiter sans chantier dédié)** : ① **cardio — chronologie ≠ intention** : le cas de Michel était un cardio rangé dans le volet « Avant », que Milo a appelé échauffement de façon cohérente ; mais « Avant » ≠ échauffement et « Après » ≠ finisher (10 min de vélo doux ≠ 45 min de zone 2). Direction : séparer chronologie (avant/après), intention (échauffement · séance cardio · finisher · récupération · autre) et profil sportif (aide à proposer, jamais à imposer). ② **calories de séance** : le moteur de musculation est **GELÉ** (long à stabiliser) — futur chantier « audit calories séance V2, lecture seule d'abord » ; et un bloc cardio pourrait un jour avoir des calories modifiables avec provenance `auto` / `manuel`.
- **Audit forensique** : **12 défauts numérotés (F001 → F012)** — F003, F004, F011 et la moitié « entrées » de F005 corrigés sur la branche, F012 réfuté ; **les autres ne sont pas corrigés**, **aucun ordre de correction décidé**. ⚠️ Le registre qui les numérote **n'est PAS dans le dépôt** (bloc-notes de session, hors dépôt car celui-ci est public) ; seuls trois dossiers y sont : `docs/SUPPRESSION-QUI-NE-REMONTE-PAS.pdf`, `docs/PROVENANCE-MASSE-GRASSE.pdf`, `docs/POIDS-RESTAURATION-SANS-BORNE.pdf`.

## 🍽️ Retour récurrent de Michel : « l'application donne trop de calories »

- Consigné le 22/09 — **palier R22 : RÉCURRENT**. Son doute n'était écrit nulle part avant.
- ⛔ L'analyse chiffrée qui l'accompagnait est **invalidée** : elle reposait sur un profil de test qui ne correspond pas aux données déclarées de Michel. **Aucun chiffre de remplacement** : une conclusion TDEE / PAL devra être **remesurée** depuis les entrées réellement actives.
- `tdeeObserve()` (candidate **V9**) : **non servie** (0 occurrence dans les fichiers servis, vérifié le 24/09), aucune publication, **décision jamais prise** — pas une décision en attente.

## ⚖️ Décisions ouvertes

- **Aucune dans `docs/DECISIONS.md`** : 28 entrées (D-001 → D-028), toutes `VALIDÉ` ou `REMPLACÉE` (vérifié le 26/09).
- **Ouvert, vérifié hors registre** : les essais cachés derrière `window.__FT_CLONE__` (12 occurrences dans `app.js` et `coach.js`) — chaque essai reste à décider (`CLAUDE.md`).
- **Trous connus du classement des données (R4a)** : `badges` et `dayStateLog`, déclarés transmis à Milo sans l'être (`tests/donnees/donnees-milo.json`).

## ❓ Points historiques NON re-vérifiés — ni ouverts, ni fermés

Retirés de ce fichier le 24/09 sans qu'on puisse établir leur état actuel. Texte intégral dans l'archive. ⛔ **À vérifier avant de les rouvrir**, jamais à reprendre de mémoire :
- V14 — `AI_GLOBAL_MAX` · « O'Tacos ne contient aucun tacos » · `data/alias.json` n'est plus régénérable · le doublon « pull-over » · les points signalés par Michel le 23/08 au soir · les 5 drapeaux du Gardien non lus (22/08) · l'architecture cerveau / cervelet (une direction, rien de construit) · l'expérience au verdict attendu le 11/08 · le « RESTE À FAIRE » du 23/07.

## ⏭️ Prochaine étape

- **Après `ft-v1235`** : observer en réel le chemin de troncature de l'analyse de programme (aucune troncature naturelle n'a encore été vue — on ne la provoque pas).
- **MILO-SEANCE-01 (26/09, diagnostic, rien corrigé)** : la perte 4 → 2 vient du **repli** (`_seanceDepuisTexte`), qui ne lit pas le format que le prompt impose à Milo ; deux défauts d'intégrité trouvés en vérifiant (une proposition de mémoire masque la carte séance · la séance traduite redevient celle du repli au rechargement) ; « Mes discussions » perd le marqueur `coupee` (D-025). Correctifs **proposés, non codés** : `docs/MILO-SEANCE-01.md` §9. **Décision de Michel attendue.**
- Pour l'audit : **l'ordre de correction des défauts restants (F001, F002, F006 → F010, et la 2ᵉ moitié de F005) est à décider par Michel.**

## 🧭 Où lire quoi

- **Règles** : `CLAUDE.md` (règles d'or, journal récent des versions) · `docs/REGLES-ARCHITECTURE.md`.
- **Décisions** : `docs/DECISIONS.md` — **Qui travaille sur quoi** : `docs/JOURNAL-DE-PARTAGE.md`.
- **Historique complet** : `docs/JOURNAL-ARCHIVE.md` — **Bugs par famille** : `BUGS.md`.
- **Retours des testeurs** : `RETOURS-TESTEURS.md`.
