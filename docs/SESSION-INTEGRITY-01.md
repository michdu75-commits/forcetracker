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
| T4 | Stockage canonique | Magasin LOCAL `ft4_debriefs` = `{v:1, seances:{[id]:{texte, ts, src}}}`, clé = `id‖ts‖date` (la même que le jeton de la file) ; ~~200 débriefs max~~ → **aucun plafond**, et une séance supprimée emporte son débrief (décision de Michel, finition du 04/10 — **D-047**) | Écarté : embarquer le texte dans `S.sessions` (alourdit chaque sync cloud, et plusieurs chemins réécrivent les séances). Limite : local seulement, comme le fil Coach. |
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

## Finition avant publication (04/10, après contre-vérification — fin 16:18 UTC)

**Décisions de Michel actées** (brief « lot de finition ») : remplacement sémantique validé tel quel (**D-046**) ;
débriefs locaux seulement, **aucun plafond**, une séance supprimée emporte son débrief (**D-047**) ; l'export PDF « avec »
ne dégrade pas les caractères que jsPDF sait écrire (précision de **D-044**).

**Ce qui a changé (code applicatif)** — `coach.js` : l'éviction des 200 est retirée de `_dbfEnregistrer` (plus aucun
effacement à l'écriture) ; `_dbfOublier(id)`, **seul** effaceur du magasin, retire aussi le jeton encore en file de cette
séance. `setup.js` : `deleteSessOrConfirm` appelle `_dbfOublier(_dbfCle(séance))` pour la séance supprimée ; `_pdfTexte`
remplace le filtre du PDF des débriefs (texte ET titre).

**Mesuré avant de corriger** :
- jsPDF 2.5.2 (celui de l'app) encode les **27/27** caractères propres à Windows-1252 (œ, €, ’, “ ”, •, ™…) et déclare
  `/Encoding /WinAnsiEncoding` : c'est **mon** filtre de SESSION-INTEGRITY-01 qui retirait « œ » (prémisse fausse : « jsPDF
  ne dessine que le latin »). Un caractère hors de ce jeu (→, emoji, espace fine) fait passer **toute la ligne** en charabia
  16 bits : constaté sur un titre de débrief avec emoji. Sur le code d'avant, « −5 kg » sortait « 5 kg » (signe perdu) et
  « 1ʳᵉ » sortait « 1 ».
- Rendu vérifié à l'œil dans le lecteur PDF de Chromium (capture locale, hors dépôt) : « le cœur de la séance, la Manœuvre
  du jour — 5 € gagnés, l’épaule tient. « Bien joué » et “top” ‘ok’ – fin… • point ™ ».
- Stockage local de Chromium : **5,24 M caractères** par site (mesure, Safari non mesuré). Aucune contrainte de quota ne
  justifie un plafond aujourd'hui ; à saturation, l'écriture échoue et rien n'est effacé.
- Références de l'export « sans » : `tools/ref_pdf_sans_si01.js` lancé sur un `git archive c3c830ab` (master) et sur la
  branche → **listes identiques** ; la référence est inscrite dans le témoin F4.

**Témoins ajoutés** (`tests/parcours/session_integrity.js`) — contrôle négatif d'abord : **14 rouges sur le code d'avant
la finition**, F4 vert (l'export « sans » était déjà celui de master) ; tous verts après :
- B-SI01-K (rétention) : K0 (l'écriture n'efface jamais, à aucun seuil) · K1/K1b (260 séances, 260 débriefs, horloge à
  rebours, champs inconnus gardés) · K2 (réécriture = même entrée) · K3 (rechargement, boutons).
- B-SI01-Z (suppression, conduite par Progrès → carte → « 🗑️ Supprimer » ×2) : Z0 (un seul effaceur) · Z1/Z1b/Z1c (séance
  du matin : son débrief part, celui du soir reste, fil Coach intact) · Z2 (séance sans débrief : magasin inchangé à l'octet)
  · Z3 (rechargement) · Z4 (séance du soir) · Z5 (débrief encore en file : aucun appel payé, aucun orphelin).
- B-SI01-F (PDF) : F1 (Windows-1252 intact) · F2 (traductions) · F2b (aucune ligne en 16 bits) · F3 (titre avec emoji, long
  débrief entier) · F4 (export « sans » = master `c3c830ab`, texte et ordre).

**Banc** : 92/0. **Contrôle négatif** (`tools/mut_session_integrity.py`, dans la COPIE mutée) : **37/37** — les 22
d'avant + M-FIN1 (plafond 2) · M-FIN1b (200) · M-FIN1c (1 000, attrapée par K0 seul) · M-FIN2 (mauvais débrief) · M-FIN2b (par
date) · M-FIN2c (le dernier écrit) · M-FIN3 (plus de suppression) · M-FIN3b (jeton laissé en file) · M-FIN4 (ancien filtre,
« cœur » → « cur ») · M-FIN4b (sans traduction) · M-FIN4c (sans filtre) · M-FIN4d (titre non filtré) · M-FIN4e (export
« sans » changé) · M-FIN5 (négative : commentaires, reste verte) · M-FIN6 (équivalente, reste verte). Ancres de M8 et
M-FIN3b rendues uniques (`_dbfOublier` écrit aussi le magasin).
**Bancs voisins sur l'arbre final** : SI-01 92/0 · fil lot 1 38/0 · provenance du débrief 24/0 · ML-B 60/0 · C3 35/0 · C2 22/0 ·
lot 3 87/0 · travail lot 2 48/0 · ML-A 34/0. **Bloc annexe** : 14 PASS + 1 défaut connu (« discussions » : 71 540 / 76 459 /
68 778 caractères) — **identique à master `c3c830ab` à la même minute**. Prompt de référence régénéré : seule l'heure change.
**Passe complète (D-031)** sur `7b13cc9e` : **5 854 ✅ / 0 ❌**, 4 conditions vertes. Après elle : documentation seulement.

**Limites, dites** : local seulement (ratifié) ; téléphone plein → le nouveau débrief n'est pas rangé, sans message ;
une suppression faite PENDANT l'appel du débrief (quelques secondes) laisserait l'entrée arriver après — fenêtre non
couverte ; le chemin « remplacer » de l'**import d'historique** (même date) retire une séance sans `_dbfOublier` — hors lot
(import historique), une séance importée n'a de toute façon pas de débrief rangé, mais une séance de l'app remplacée par
un import garderait le sien en orphelin, invisible ; Safari iOS non testé.

**Observé, non corrigé (hors périmètre du brief)** : dans le PDF « avec », la largeur de coupure d'un long débrief est
calculée avant de poser la taille 8,5 → lignes un peu plus courtes que la page (cosmétique, code de SI-01) ; l'en-tête
« N séances » du PDF compte les **jours**, pas les séances (préexistant, master) ; un nom de séance (`name` / `label`) avec emoji dans
un titre de jour passerait lui aussi en 16 bits — même mécanisme, préexistant (master), **non mesuré sur ce chemin** ; le PDF
« sans » ne change pas (D-044).
**Consignés depuis la contre-vérification, sans code** : superset non contigu · badge « Premier PR » · import historique /
édition d'ancienne séance · RIR décalé · nettoyage d'un bloc technique sans backticks.

```
CHECKPOINT SESSION-INTEGRITY-01 — FINITION — 04/10/2026
BASE : master c3c830ab (ft-v1249) · branche claude/session-integrity-01 · départ aa0ff6dd
CORRIGÉ : plus de plafond (D-047) · séance supprimée → son débrief (+ jeton en file) · PDF fidèle (D-044)
TESTS : banc 92/0 · mutations 37/37 · passe 5 854 ✅ / 0 ❌ sur 7b13cc9e
0 appel Milo réel · 0 publication · aucune version (sw.js ft-v1249)
STATUT : PRÊT POUR DÉCISION DE PUBLICATION
```
