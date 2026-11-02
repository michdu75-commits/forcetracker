# Corpus de validation de l'import de programmes (IMPORT-IA-FIDELITE-01)
Programmes RÉELS transcrits (PDF privés, hors dépôt) + méthodes SYNTHÉTIQUES, pour vérifier la chaîne document → IA → extraction → reconnaissance → aperçu → programme enregistré → séance. Des données seulement : ni test ni code.

| Fichier | Origine | Jours | Exos | Séries (dont É) |
|---|---|---|---|---|
| C01-gpt-powerbuilding-b1v2 | programme d'IA, colonne Type ECH/TRAV, A/B, + `aiOutputLegacy` | 5 | 21 | 77 (17) |
| C02-coach-A-septembre | coach, tableaux par groupes musculaires | 6 | 27 | 121 |
| C03-coach-A-11sept | coach, abdos + séance 2 | 2 | 9 | 30 |
| C04-coach-A-10mars | coach, % de 1RM, dégressif | 5 | 22 | 85 |
| C05-coach-A-4fev | coach, circuit, tempos, dégressif | 7 | 33 | 141 |
| C06-coach-A-3janv2023 | coach, supersets écrits avec « + », unilatéral | 5 | 24 | 77 |
| C07-coach-A-abdos-27juin | coach, abdos | 1 | 3 | 12 |
| S-methodes | 12 mini-programmes SYNTHÉTIQUES dans `fixtures[]` (avec `texteSource`) | | | |

## Lecture
- `aiOutput` : réponse d'un modèle fidèle au contrat du Worker, APRÈS normalisation : plage → borne basse + « Reps 8-10 » / « Charge 55-60 kg » en note ; charge non chiffrée → kg 0 + « Charge : à calibrer » ; repos = texte brut ; noms du document (pas ceux du catalogue).
- `attendu` : programme à ENREGISTRER avant confirmation des propositions. É = échauffement, D = dropset. `repos` en secondes si ferme, sinon 0 + `reposTxt`. `totaux` compte `exs[]` : le cardio d'échauffement de C01 est rangé dans `cardioAvant`, non compté.
- `catalogueAttendu` : nom exact d'EXLIB quand le mouvement ET le matériel écrits n'ont qu'une entrée (alias déjà validés de l'app compris), sinon `null` (absent, matériel non dit, consigne qui change le mouvement).
- `methodes` : les 4 statuts de la spec ; `nonRepresentable` reprend les NON_REPRÉSENTABLE.

## Conventions de transcription
- Accents restitués (le PDF de C01 n'en a pas) ; fautes du document gardées. Le mot « repos » des cellules « Répétitions et Repos » est gardé (« repos 40 sec »).
- « par bras / jambe / côté » : séries non doublées. Durées tenues (gainage) : secondes dans `reps`. Dégressif : `setType` D, séries = nombre de tours ; le repos écrit UNE fois vaut pour la FIN de la série dégressive (`repos` 0 sur les paliers avant le dernier, comme l'outil de dropset de la séance) alors que `aiOutput.restPerSet` le recopie sur chaque palier (un modèle le fait). `reps` absent : 0 dans `attendu` (le serveur n'invente pas) ; l'app propose 10 à la séance ET le dit dans la note (« Répétitions non écrites dans le document »).
- Les titres de groupes musculaires sont les jours (C02 et C04 n'ont aucun « Séance N »). `specialSets` vide : couleurs illisibles.
- « A + B » : superset si chaque partie a ses propres reps, sinon mouvement combiné (un seul exercice).

## Anonymisation
Prénoms, pseudos, marque et nom du coach retirés de tous les champs (noms de programme, titres, notes). Contenu sportif conservé tel quel. Aucun lien ni identifiant Drive.

## Limites
- L'extraction texte mélange les colonnes : rattachements faits par le sens et dits dans `incertitudes` ; un chiffre ambigu n'est jamais deviné en silence.
- Couleurs, images et vidéos non lues. C03 : pas de « Séance 1 » dans le texte lu.
- S-methodes est inventé : la définition du « dead set » y est supposée.

## Qui lit ce corpus
`tests/parcours/import_corpus.js` (banc `B-IIC`, lanceur `tools/banc_import_corpus.js`, contrôle négatif `tools/mut_import_corpus.py`) passe CHAQUE fixture par la vraie chaîne de l'application et compare le programme enregistré à `attendu`, série par série, puis valide chaque série dans une séance et relève la durée réellement passée au chronomètre. `catalogueAttendu` n'est PAS exigé : le banc vérifie qu'aucun exercice n'est rattaché à une AUTRE cible (limites connues nommées dans le banc) et qu'au moins 76 des 114 exercices du catalogue sont reconnus ou proposés avec la bonne cible.
