# Corpus de validation de l'import de programmes (IMPORT-IA-FIDELITE-01)

🔒 **Tout est INVENTÉ.** Ce dépôt est PUBLIC : aucun programme de coach, de testeur ou de personne n'entre ici, ni transcrit, ni « anonymisé », ni résumé. Les noms
d'exercices sont ceux du catalogue de l'application ; les charges, répétitions, repos et libellés sont fabriqués pour provoquer un cas précis. Le témoin `IIC-S01`
(`tests/parcours/import_corpus.js`) exige 16 fixtures, toutes synthétiques, d'identifiant `S…` ou `X…` : en ajouter une autre forme fait rougir le banc. *Les documents
réels servent à la RECETTE (dossier `docs/IMPORT-IA-FIDELITE-01.md` §14), jamais à un fichier versionné.*

Le corpus fait passer par la vraie chaîne — document → IA (réponse simulée) → extraction → reconnaissance → aperçu → programme enregistré → séance → chrono — des programmes
dont on connaît d'avance, à la main, le résultat.

| Fichier | Ce qu'il provoque | Jours | Exos | Séries (dont É) |
|---|---|---|---|---|
| `X01-formats-repos` | une façon d'écrire un repos par exercice (« 2 mins », « 75 sec max », « Repos 40 sec maxi », « 1 . 20 min », « 2 à 3 mins », « 1.45 mins »), une charge « à calibrer », des répétitions non écrites | 1 | 6 | 20 |
| `X02-dropset-superset-materiel` | dropset à repos recopié sur chaque palier, superset, matériel écrit dans la note (« Machine guidée »), variante écrite dans la note (« Prise inversée » : limite connue) | 2 | 7 | 23 |
| `X03-echauffement-colonne` | colonne ECH/TRAV (types par série, plages de repos), lignes d'échauffement à part (marqueur « (ECH) » ou « Monté en charge » / « Série de chauffe » en note), + le même programme dans l'ANCIEN format du Worker (`aiOutputLegacy`) | 1 | 3 | 16 (7) |
| `X04-reconnaissance` | les trois statuts de l'aperçu : reconnu d'office · À CONFIRMER (jamais appliqué sans la personne) · inconnu (« sera créé ») | 1 | 10 | 30 |
| `S-methodes` | 12 mini-programmes dans `fixtures[]` : rest-pause, myo-reps, 10×10, 8+2+2+2, top set + back-off, %1RM + RPE, séance facultative / rappel, unilatéral, tempo, isométrie progressive, ramping, dead set | | | |

## Lecture d'une fixture
- `aiOutput` : la réponse d'un modèle fidèle au contrat du Worker, APRÈS normalisation (plage → borne basse + « Reps 8-10 » / « Charge 55-60 kg » en note ; charge non chiffrée → kg 0 +
  « Charge : à calibrer » ; repos recopié tel qu'écrit, plages comprises). `aiOutputLegacy` : la même chose dans l'ancien format (une ligne = un exercice, « ECH » en note).
- `attendu` : le programme à ENREGISTRER, écrit à la main. `É` = échauffement, `D` = dropset. `repos` en secondes si ferme, sinon 0 + `reposTxt` (le texte écrit). **Jamais
  calculé par `_reposLire`** : un attendu calculé par le code qu'il juge ne peut pas rougir.
- `catalogueAttendu` : nom exact du catalogue (EXLIB) quand le mouvement ET le matériel écrits n'ont qu'une entrée. `statutAttendu` : `ok` (reconnu d'office), `conf` (À
  CONFIRMER), `new` (« sera créé »).
- `totaux` : jours, exercices, séries, échauffements — recalculés par le témoin `IIC-S04`.

## Ajouter un cas
1. Écrire la fixture à la main (aucun document réel), `attendu` compris.
2. Lancer `tools/sous_garde.sh node tools/banc_import_corpus.js` : elle doit être verte.
3. Prouver qu'elle sert : une mutation de `tools/mut_import_corpus.py` doit la voir (ou en ajouter une). *Un cas qui ne peut pas rougir ne mesure rien, il rassure.*

## Qui lit ce corpus
`tests/parcours/import_corpus.js` (banc `B-IIC`, lanceur `tools/banc_import_corpus.js`, contrôle négatif `tools/mut_import_corpus.py` — 14 mutations, chacune remet un défaut
supprimé) passe CHAQUE fixture par la vraie chaîne de l'application et compare le programme enregistré à `attendu`.
