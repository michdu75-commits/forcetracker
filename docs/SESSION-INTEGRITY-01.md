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
