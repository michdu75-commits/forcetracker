# 🛡️ SESSION-INTEGRITY-01 — registre de travail (au fil de l'eau)

> Chantier fonctionnel ouvert le 04/10/2026 (session-B), branche `claude/session-integrity-01`, depuis
> master `c3c830ab` (`ft-v1249`, DOC-SYNC intégré). **Non publié, aucune version.** Source des défauts :
> `docs/SESSION-MILO-E2E-01.md`. Ce fichier est tenu PENDANT le travail (consigne de Michel, 04/10) :
> preuve, choix, limite — écrits quand ils arrivent, pas seulement dans le rapport final.

## Choix techniques structurants (Claude décide le COMMENT — décisions produit : Michel)

| # | Sujet | Choix | Pourquoi / alternative écartée |
|---|---|---|---|
| T1 | Remplacement (bloc A) | Nouvel objet construit depuis l'historique de B (`_exerciceRemplacant`, même alignement par rôle que `addExercise`) ; gardés : position, groupe, **nombre de séries et rôle É/W/travail** | Écarté : garder kg/reps/repos/consigne/méthode/`_milo` de A (c'était le défaut). Une méthode (`D`, `X`) appartient à A → les types repassent en `N`. |
| T2 | Séries déjà faites au remplacement | **Elles restent à A** ; A sort de son groupe et ne garde que ses séries faites ; B est inséré juste après, avec le travail restant (si tout était fait : la structure entière de A) | Aucune confirmation demandée (pas de décision produit manquante : l'invariant de Michel suffit). Corriger le NOM d'une séance déjà faite reste possible, explicitement, dans le détail de la séance (`replaceSessEx`). |
| T3 | Succès d'un débrief | Un seul critère, `_dbfReponseValide` = réponse non vide, ≠ « Désolé, réessaie. », et `_miloEtatReponse(data)==='complete'` (fail-closed existant) — appliqué aux 3 chemins (écran de fin, Coach, rattrapage) | Écarté : se fier au code HTTP (200 ≠ débrief). Un débrief coupé (`max_tokens`) est aussi un échec. |
| T4 | Stockage canonique | Magasin LOCAL `ft4_debriefs` = `{v:1, seances:{[id]:{texte, ts, src}}}`, clé = `id‖ts‖date` (la même que le jeton de la file), 200 débriefs max | Écarté : embarquer le texte dans `S.sessions` (alourdit chaque sync cloud, et plusieurs chemins réécrivent les séances). Limite : local seulement, comme le fil Coach. |
| T5 | Rendu immédiat | Fil déjà rendu → `_renderCoachThread()` (la fonction du rechargement) | Écarté : ajouter une bulle à part (doublon possible, rendu différent du rechargement). |
| T6 | Consigne cachée d'un débrief raté | Retirée du fil en cas d'échec (Coach) | Sinon chaque nouvel essai empilait une consigne de plus. |
| T7 | Première référence (D-045) | `S.prs` crée la référence avec `premiere:true` ; record = référence antérieure ET performance strictement supérieure ; lecteurs : écran de fin (tuile « 📌 Première référence enregistrée »), contexte de Milo (`[1ʳᵉ référence, pas un record]`, exclue du « Dernier RECORD »), bilan du mois | Les anciennes entrées sans marqueur restent des records : on ne devine pas après coup. |
| T8 | N-G2 (MILO-GHOST-01) | `sess.refAvant` = record de référence de chaque exercice **figé avant** la mise à jour de `S.prs` ; `_intensiteDefauts(nom, sets, refRm1)` le lit pour l'écran de fin et le contexte de Milo | Confirmé dans le code : la séance était jugée contre le record qu'elle venait de créer. Séances d'avant le correctif : comportement d'avant. |
| T9 | « Voir le débrief Milo » | Petit bouton sur la carte de séance (Progrès) seulement si un débrief est rangé à son nom ; visionneuse locale `#ov-debrief-milo` (aucun appel, aucune écriture) | Décision D-043 (Michel) : pas de texte affiché d'office sous chaque séance. |
| T10 | Export (D-044) | Choix « Sans / Avec les débriefs » dans la fenêtre d'export d'historique, « sans » par défaut, visible seulement s'il existe un débrief. CSV « sans » = fichier d'avant à l'identique ; « avec » = colonnes `seance_id` + `debrief_milo` et une ligne `DEBRIEF` par séance ; PDF « avec » = le débrief sous le tableau de son jour, nommé par l'heure de la séance | L'export JSON (Menu) n'est pas modifié. |

## Constats consignés pendant le travail

- **N-G1 (MILO-GHOST-01) — HORS LOT, dette MILO / TRANSPORT / PAYLOAD** : le message courant semble
  partir deux fois vers le modèle (`sendToCoach` le met dans `history`, le Worker fait ensuite
  `history.concat([message])`). Reproduit par Claude Work sur le Worker local ; impact sur les
  réponses **non démontré**. Non corrigé ici.
- `_dbfRendre` (échec propre) appelle `_dbfFini`, qui marque la séance « livrée » tout en la remettant
  en file — comportement préexistant, compensé par « la file fait foi » (`_dbfPrendreCible`). Non
  modifié.
- Le témoin CLXXVIII ⑤ (`tests/parcours/runner.js`, ft-v1073) figeait « le vrai remplacement GARDE les
  séries » (ft-v296). Il devient faux par décision de Michel (04/10) : à faire évoluer avec sa raison.

## Preuves au fil de l'eau

- **04/10 ~09:40 UTC — banc `tools/banc_session_integrity.js` : 71 OK / 0 rouge** sur la branche (blocs B-SI01-S/R/D/H/E/P/G/T).
  Le même banc sur le code de **master** rougit dès la source et sur R1-R4 : séries 200/240 héritées, `_milo`,
  consigne et repos gardés — **le défaut du 03/10 est reproduit par le témoin, puis fermé**.
- Un témoin à moi était faux (R6b) : j'attendais `60,80,90` pour un ajout d'exercice, `addExercise` (inchangé)
  rend `0,60,80` (É + 2 séries). Attente corrigée, pas le code.
- Prompt de Milo régénéré (`node tools/dump_prompt.js`) : **seules la date et l'heure de génération changent** —
  le profil de démo n'a pas de première référence. Contenu du prompt inchangé.
- Commits : `d5fa2a8c` (bloc A) · `70b12f3f` (blocs B-F + N-G2 + règle d'or #11 points 2-5) · `f0a52c76` (banc,
  contrôle négatif, registre de recette).
- **Bancs voisins, tous verts** (04/10 ~10:20 UTC) : fil Coach lot 1 **38/0** · provenance du débrief **24/0** · ML-B **60/0** ·
  séance C3 **35/0** · séance C2 **22/0** · travail existant (lot 2) **48/0** · lot 3 **87/0** · ML-A **34/0** · unicité de la carte
  séance **12/0**.
- **Avant la passe, un témoin ANCIEN aurait rougi à tort** : le bloc X du runner simulait le Worker au format d'avant MILO-PDF1
  (`{reply}` sans `complete`). Le nouveau critère le refuse — à raison : le Worker de production envoie `complete` depuis le
  25/09. Simulation mise au format réel (`e46728db`), raison écrite dans le témoin.
- **Contrôle négatif `tools/mut_session_integrity.py` : 22/22 conformes**, dans la COPIE mutée. M00 (code d'avant) · M1→M11 (les
  mutations demandées) · M12/M12b (N-G2) · M13 (rendu immédiat) · M14 (consigne cachée) · M15 (ancien reçu de repli) · M16, M17,
  M18, M7b (déguisées) · 1 négative (commentaire) restée verte.
  ⚠️ **1er tour : 21/22 — M12b avait SURVÉCU**, et c'était mon témoin : `Rowing Yates[^·]*⚡ intensité` s'arrête au premier « · »,
  or les séries sont séparées par « · » dans le contexte de Milo — il ne pouvait jamais trouver la remarque. Réparé (`d0a041e5`),
  vert sur l'arbre sain (et il exige maintenant que la ligne du Rowing Yates soit présente), M12 et M12b relancées : 2/2.

## Clôture (10:27 UTC)

- **Bloc annexe** : 14 PASS + 1 DÉFAUT CONNU (« discussions », taille du contexte de Milo 71 626 / 76 545 / 68 778 caractères) —
  **identique à master à la même minute**, mesuré sur une copie de `origin/master`.
- **Passe complète n°1** sur `77a023f9` : **5 830 ✅ · 3 ❌ — NON VALIDE**. Les 3 rouges, classés :
  ① « DÉBRIEF : une fois fait, le jeton est consommé » et ② CXXVI « EN LIGNE : Milo s'AJOUTE » = **témoins périmés** — leurs
  simulations du Worker étaient au format d'avant MILO-PDF1 (`{reply}` sans `complete`) ; épreuve faite : sur master, ancienne et
  nouvelle simulation donnent le même vert, sur la branche seule l'ancienne rougit (par son format) ;
  ③ CCLXXVI « plus aucune limite d'interface en `vh` » = **vraie régression de règle, introduite par mon CSS** (`58vh` → `58dvh`).
  Corrigés en `5b4d0c70`. Deux autres simulations au vieux format (blocs ~32641, ~32780) restaient vertes : non touchées (un témoin
  ne se modifie pas pour du vert).
- **Passe complète n°2 (D-031)** sur `5b4d0c70` : **5 833 ✅ / 0 ❌**, 4 conditions de `tools/passe_valide.sh` vertes. Après elle :
  documentation seulement (D-031).
- **Décision de Michel prise dans le brief du 04/10, à inscrire au registre s'il le souhaite** : « un remplacement est un
  REMPLACEMENT SÉMANTIQUE d'exercice, pas un renommage » (remplace l'esprit de ft-v296 pour le menu « Remplacer »). Le brief
  limitait `docs/DECISIONS.md` aux changements de statut : **non inscrite**, proposée dans le rapport.
- **Choix de Claude à soumettre** (impact produit, réversible) : débriefs rangés **localement** seulement (T4) ; séries faites
  gardées à l'exercice réel **sans demander** (T2) — la correction de nom reste possible dans Progrès.
- ⛔ Aucune publication, aucune version, `sw.js` inchangé (`ft-v1249`), 0 appel réel, Drive non touché.

```
CHECKPOINT SESSION-INTEGRITY-01 — 04/10/2026
BASE : master c3c830ab (ft-v1249, DOC-SYNC intégré en avance rapide) · branche claude/session-integrity-01
CORRIGÉ (branche, NON publié) : remplacement hybride (P0) · faux débrief complete:false (P1) ·
  débrief invisible / sans lien (P1) · première référence ≠ record (D-045) · N-G2
AJOUTÉ : ft4_debriefs (local) · « Voir le débrief Milo » · export avec / sans · tuile « Première référence »
TESTS : banc B-SI01 71/0 · 9 bancs voisins verts · annexe 14 PASS + 1 défaut connu = master ·
  contrôle négatif 22/22 · passe 5 833 ✅ / 0 ❌ sur 5b4d0c70
NON TRAITÉ : discussion du 03/10 · ancien J1 · montée en charge · CTA « petite séance » · summarizeCoach ·
  maintenance · N-G1 (dette MILO / TRANSPORT / PAYLOAD)
STATUT : PRÊT POUR CONTRE-VÉRIFICATION — pas de publication sans décision de Michel
```
