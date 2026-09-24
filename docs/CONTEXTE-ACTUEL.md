# 📍 Contexte actuel — Force Tracker

> **Le PREMIER document à lire avant toute nouvelle tâche.** Une page maximum.
> Il donne l'état du projet en un coup d'œil, sans relire tout le reste.
> ⚠️ À tenir à jour EN TEMPS RÉEL (règle d'or #12).
> 🗂️ **Ramené à une page le 24/09/2026** (il faisait 7 198 lignes). Tout l'historique retiré est
> conservé **mot pour mot** en fin de `docs/JOURNAL-ARCHIVE.md` (**R23** — *tailler ≠ supprimer*).

---

## 📌 Version

- **Version en ligne (live) :** `ft-v1234` — 🍽️ les 5 repas toujours dans l'ordre de la journée, et un repas sans données reste visible (« Ce que l'app a appris »).
- Prochaine : `ft-v1235`. ⚠️ Le numéro fait foi dans `sw.js` et dans l'en-tête du journal de `CLAUDE.md`, jamais ici.

## 🧊 Contraintes en vigueur — décisions actées (règle d'or #15)

- **Chantier Nutrition gelé en phase d'observation réelle** (Michel, 13/09) : toute modification de son comportement exige un **nouveau feu vert explicite**. Détail : `CLAUDE.md`, `docs/DOUANE-NUTRITION.md`.
- **Le repas actif est clos, le chantier Nutrition ne l'est pas** (arbitrage du 20/09) : **D-011** (le choix manuel survit au changement de jour) et **D-012** (au rechargement : on observe).
- **On ne touche pas au workflow de déploiement** (Michel, 27/08). ⚠️ Cette décision n'est écrite **que** dans `docs/JOURNAL-DE-PARTAGE.md` (ligne ⛔).

## 🔬 Chantier actif

- **Tri documentaire** de ce fichier et de `docs/JOURNAL-DE-PARTAGE.md` (24/09, session-A) — **en attente de la validation de Michel**, rien de publié.
- **Audit forensique** : **12 défauts confirmés (F001 → F012)**, **aucun corrigé**, **aucun ordre de correction décidé**. ⚠️ Le registre qui les numérote **n'est PAS dans le dépôt** (bloc-notes de session, hors dépôt car celui-ci est public) ; seuls trois dossiers y sont : `docs/SUPPRESSION-QUI-NE-REMONTE-PAS.pdf`, `docs/PROVENANCE-MASSE-GRASSE.pdf`, `docs/POIDS-RESTAURATION-SANS-BORNE.pdf`.

## 🍽️ Retour récurrent de Michel : « l'application donne trop de calories »

- Consigné le 22/09 — **palier R22 : RÉCURRENT**. Son doute n'était écrit nulle part avant.
- ⛔ L'analyse chiffrée qui l'accompagnait est **invalidée** : elle reposait sur un profil de test qui ne correspond pas aux données déclarées de Michel. **Aucun chiffre de remplacement** : une conclusion TDEE / PAL devra être **remesurée** depuis les entrées réellement actives.
- `tdeeObserve()` (candidate **V9**) : **non servie** (0 occurrence dans les fichiers servis, vérifié le 24/09), aucune publication, **décision jamais prise** — pas une décision en attente.

## ⚖️ Décisions ouvertes

- **Aucune dans `docs/DECISIONS.md`** : 19 entrées (D-001 → D-019), toutes `VALIDÉ` ou `REMPLACÉE` (vérifié le 24/09). **D-019 est actée.**
- **Ouvert, vérifié hors registre** : les essais cachés derrière `window.__FT_CLONE__` (12 occurrences dans `app.js` et `coach.js`) — chaque essai reste à décider (`CLAUDE.md`).
- **Trous connus du classement des données (R4a)** : `badges` et `dayStateLog`, déclarés transmis à Milo sans l'être (`tests/donnees/donnees-milo.json`).

## ❓ Points historiques NON re-vérifiés — ni ouverts, ni fermés

Retirés de ce fichier le 24/09 sans qu'on puisse établir leur état actuel. Texte intégral dans l'archive. ⛔ **À vérifier avant de les rouvrir**, jamais à reprendre de mémoire :
- V14 — `AI_GLOBAL_MAX` · « O'Tacos ne contient aucun tacos » · `data/alias.json` n'est plus régénérable · le doublon « pull-over » · les points signalés par Michel le 23/08 au soir · les 5 drapeaux du Gardien non lus (22/08) · l'architecture cerveau / cervelet (une direction, rien de construit) · l'expérience au verdict attendu le 11/08 · le « RESTE À FAIRE » du 23/07.

## ⏭️ Prochaine étape

- Michel valide (ou non) ce tri. S'il le valide, le commit doit porter `LIGNES-PARTAGE-RETIREES:` dans son message — `tools/check_regles.py` (contrôle 11) l'exige pour tout élagage du journal de partage.
- Ensuite : **l'ordre de correction des défauts F001 → F012 est à décider par Michel.**

## 🧭 Où lire quoi

- **Règles** : `CLAUDE.md` (règles d'or, journal récent des versions) · `docs/REGLES-ARCHITECTURE.md`.
- **Décisions** : `docs/DECISIONS.md` — **Qui travaille sur quoi** : `docs/JOURNAL-DE-PARTAGE.md`.
- **Historique complet** : `docs/JOURNAL-ARCHIVE.md` — **Bugs par famille** : `BUGS.md`.
- **Retours des testeurs** : `RETOURS-TESTEURS.md`.
