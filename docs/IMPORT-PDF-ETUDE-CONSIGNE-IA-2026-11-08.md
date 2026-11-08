# 🧠 Import PDF — ÉTUDE : améliorer la consigne donnée à l'IA (08/11/2026)

> **Étude seule. Rien n'est implémenté par ce document, rien n'est déployé.** Demandée par Michel dans le « GO CORRECTIF IMPORT PDF » du 08/11/2026
> (*« Étudie séparément l'amélioration de la consigne IA et l'exploitation du texte du PDF »*). L'autre étude : `docs/IMPORT-PDF-ETUDE-TEXTE-DU-PDF-2026-11-08.md`.
> Cadre : **R7** (le prompt est le DERNIER levier), **R20** (le prompt est opérationnel, chaque règle ajoutée dilue les autres), **R34** (un changement de contexte se valide
> par un avant / après au banc, jamais au feeling), **R9** (le niveau de modèle est une variable structurelle), **R33** (la lecture d'une source se recoupe avec ce que le document contient déjà).
> Tout chiffre ci-dessous est **soit mesuré dans le dépôt (et dit tel), soit une ESTIMATION (et dite telle)** : aucun appel à l'IA n'a été fait (réseau du conteneur limité à GitHub).

## 1. Où en est la consigne

| | Worker publié (`ft-v1265`, ce que lit l'IA aujourd'hui) | Lot IMPORT-IA-FIDELITE-01 (branche isolée) | + cette branche |
|---|---|---|---|
| Taille du texte de consigne | 2 885 caractères *(mesuré)* | ≈ 11 500 caractères *(dossier du lot, `docs/IMPORT-IA-FIDELITE-01.md` §3)* | + 2 phrases (≈ 600 caractères) |
| Champ « repos » | **aucun** → le repos du PDF n'arrive jamais | `rest` / `restPerSet`, recopiés TELS QU'ÉCRITS | inchangé |
| Liste du catalogue | non lue | lue (≤ 12 000 caractères) | inchangé |
| Échauffement | « échauffement → NOTE, jamais setType » | colonne « Type » ECH/TRAV seulement ; sinon « UNE LIGNE = UN EXERCICE » | + « si le NOM porte le mot d'échauffement, garde les DEUX lignes, l'app les regroupe » |
| Séance facultative | non dite | « garde son libellé avec (facultative) » | + « jour à part entière, même sans numéro, jamais fusionné » |
| Sortie | 8 192 jetons, aucune détection de coupure | 16 000 jetons, **détection de coupure** (`stop_reason`), réponse validée (`_normaliserProgramme`) | inchangé |

**Ce que la consigne n'a PAS à porter** (et que le code porte depuis ce lot) : le regroupement échauffement + travail, la lecture des repos (« 4-5 min »), la borne basse, la séance facultative qui ne doit pas être collée, la validation des types et des nombres. *La consigne dit au modèle quoi recopier ; le code décide quoi en faire* (R7).

## 2. Ce que la consigne ne peut pas garantir

1. **L'obéissance.** Une règle écrite dans un prompt est lue, pas appliquée : le 07/09 le modèle a relu la règle `setTypePerSet` et ne l'a pas suivie (`docs/IMPORT-IA-FIDELITE-01.md`, §4). Aucun banc hors-ligne ne le prouve — **seule une recette avec l'IA réelle le mesure**.
2. **La lecture de l'image.** Le Worker reçoit des pages rendues en JPEG ≤ 1 200 px (`_pdfToImages`, 8 pages au plus) : un « 10-15 » ou un « 105 × 2 » peuvent être mal lus, et rien dans la consigne ne l'empêche. C'est l'objet de l'autre étude (le TEXTE du PDF, qui est exact).
3. **La longueur.** Chaque règle ajoutée dilue les autres (R20). Le lot est déjà à +1 697 caractères au-dessus de `Code.js` pour un budget de +3 000 (témoin `IIF-W-C budget`).

## 3. Pistes, classées (bénéfice · risque · coût · comment on le mesure)

| # | Piste | Bénéfice attendu | Risque | Coût | Mesure |
|---|---|---|---|---|---|
| **A** | **Un exemple court et neutre** pour la forme « ligne d'échauffement nommée `X - échauffement` puis `X` » : deux exercices, noms exacts, valeurs neutres | le modèle garde les deux noms **sans les fusionner ni les renommer** (aujourd'hui une phrase seulement) | l'exemple est recopié (leçon de l'exemple `2026-03-23`, `weeks:7`) → témoin de non-recopie, valeurs volontairement fausses | ≈ +300 caractères | banc réel : taux de réponses qui gardent les deux noms, avant / après |
| **B** | **Un écho de contrôle** : demander `seancesDetectees` (les titres lus) et `nbLignes` ; le client compare au nombre de jours et d'exercices reçus et **dit l'écart** dans l'aperçu | repère une séance perdue (la 4ᵉ facultative) ou une ligne sautée **sans rien déduire** ; ne change aucune donnée | le modèle invente le compte : un écart reste un signal utile, jamais une correction | ≈ +60 jetons de sortie, ≈ +250 caractères de consigne, ≈ 30 lignes de client | banc réel : l'écho détecte-t-il une coupure volontaire ? (document tronqué à la main) |
| **C** | **Sortie structurée par outil** (`tool_use` + `input_schema`) au lieu d'un JSON écrit dans du texte | moins de JSON invalide (guillemets typographiques, texte avant / après), schéma garanti | un schéma strict refuse les valeurs « chaîne » des plages (`"8-10"`) → déclarer `string | number` partout ; changement du Worker (appel + lecture) | modéré (Worker seul) | banc réel : taux de réponses valides, avant / après, mêmes documents |
| **D** | **Deux passes** : (1) squelette (séances + exercices), (2) détail séance par séance | fidélité sur les gros documents, fin de la troncature | coût ×2 à ×3, latence, complexité de reprise | élevé | à réserver aux documents > N pages, **après** les mesures A–C |
| **E** | **Changer de modèle** (Sonnet partout, ou autre) | — | R9 : un modèle plus léger suit mal les consignes fines ; décision de coût de Michel | — | **non étudié** : décision hors lot |
| **F** | **Alléger** la consigne en retirant ce que le client sait faire seul | moins de dilution (R20) | dégrade le repli Apps Script / les anciens clients | faible | seulement après la recette réelle |

## 4. Protocole de mesure (R34) — il faut un accès à l'IA, donc un GO distinct

- **Corpus** : les 16 programmes inventés du lot + le jumeau inventé du PDF de Michel (section `P` de `tests/parcours/import_fidelite.js` pour la forme ; à rendre en PDF pour le banc réel).
- **Variantes** : consigne publiée · consigne du lot · consigne du lot + A · + B · + C. **3 répétitions** par cas (le modèle n'est pas déterministe).
- **Critères** (tous calculés par le code, jamais « au feeling ») : séries exactes (type, charge, reps, repos) · séances conservées sur séances du document · noms gardés tels qu'écrits · JSON valide · jetons d'entrée et de sortie · latence.
- **Ordre de grandeur du coût (ESTIMATION, non mesurée)** : ≈ 12 000 jetons en entrée par appel (consigne ≈ 3 000 + 6 pages en image ≈ 9 000) et jusqu'à 6 000 en sortie ; 17 cas × 3 répétitions × 5 variantes ≈ 255 appels, soit de l'ordre de **3 millions de jetons d'entrée**. À valider sur UN appel réel avant de lancer le reste.
- **Garde-fous** : appels via le **Worker de test** uniquement, jamais la production ; aucune donnée de personne (le jumeau est inventé) ; résultats stockés hors dépôt.

## 5. Recommandation

1. **Ne pas allonger la consigne avant la recette réelle** : le client rattrape déjà la forme du PDF de Michel avec ou sans l'aide du modèle (c'est tout l'intérêt de R7). Les deux phrases ajoutées par cette branche sont suffisantes et sont couvertes par deux témoins de présence (`IIF-W-N`) + deux mutations (M80, M81).
2. **Mesurer B en premier** (écho de contrôle) : c'est la seule piste qui apporte quelque chose que le code ne peut pas faire seul — savoir **combien de séances le modèle a lues** — pour un coût négligeable.
3. **C ensuite** (sortie structurée), si le taux de JSON invalide mesuré est non nul.
4. **A, D, E, F : seulement si les mesures l'exigent.**

## 6. Ce que cette étude ne couvre pas

Aucune mesure sur l'IA réelle (impossible d'ici) · aucune estimation de qualité du modèle sur un PDF réel · le coût est un ordre de grandeur · l'état de la consigne d'Apps Script (`Code.js`, repli) n'est pas modifié ni étudié ici.
