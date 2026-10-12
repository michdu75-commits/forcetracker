# FORCE TRACKER — NUT-LOT-C — UNE QUANTITÉ VIDE OU NULLE NE S'ENREGISTRE PAS (ajout ET modification)

Rôle : Principal. Mission issue de l'audit de nuit du 12/10/2026 (`Force Tracker/Nutrition/AUDIT-NIGHT-2026-10-12/`).
Dégel Nutrition **limité à ce lot**. C'est le lot **intégrité du journal** : aucune décision de Michel n'est requise
pour le commencer.

## 0. Base et protocole
- `git fetch origin` ; ligne au `docs/JOURNAL-DE-PARTAGE.md` **poussée avant de coder** (règle #13).
- Branche `claude/nut-lot-c`, depuis la tête de `claude/nut-food-variants-03`. Hash vérifié par toi : `7dd1b005` au 12/10,
  ou le commit de contre-vérification qui le suit.
- `origin/master` = `7b75f3c1`.
- Pas de numéro de version, pas de D-031, pas de publication, pas de merge.

## 1. Ce qui est mesuré (rejouer : `node tools/audit-nut-night/sonde_journal.js out`, scénarios J4b → J4g)
- **Ajout** (`addFoodEntry`) : choisir un aliment (CIQUAL, fast-food…), taper « 5 » dans le champ quantité puis l'effacer
  (ou taper « 0 », ou « abc ») → **Ajouter** :
  - la ligne s'enregistre avec les valeurs **pour 100 g** et `q:null` ;
  - Big Mac : 228 kcal enregistrées pour un produit dont la portion publiée fait 530 kcal ;
  - riz : 155 kcal.
  - La garde « Combien en as-tu mangé ? » (ft-v1051) ne se déclenche que si le champ n'a **jamais été touché** : elle lit
    le drapeau `_bcQtyPose`, posé par n'importe quel `oninput` de `#af-bc-grams`, et non la VALIDITÉ de la quantité.
- **Modification** (`saveEditFood`) — la porte JUMELLE (R8), plus grave, car elle **écrase une ligne existante** :
  - une ligne de 250 g / 388 kcal → Modifier → champ grammes vidé (ou « 0 ») → Enregistrer → **155 kcal, `q:0`** ;
  - `e.q=numFR(gEl.value)||0`, et les champs sont repliés sur la référence 100 g par `_qtyRescale`.
- Ce qui tient déjà (ne pas casser) : quantité valide, pastille de portion publiée, champ jamais touché (refus), modification
  à 200 g, rechargement, suppression d'UNE ligne, autre jour.

## 2. Ce que le lot fait (stratégie minimale — à prouver par les tests)
- **Une seule règle, aux deux portes** : quand le bloc quantité est l'autorité (pour-100 g connu), une quantité lue ≤ 0 ou
  illisible **ne s'enregistre pas**.
  - À l'ajout : même toast que la garde existante (« Combien en as-tu mangé ? »).
  - À la modification : refus avec un message clair, la ligne reste **intacte**.
- ⛔ Ne PAS toucher au repli d'AFFICHAGE de `_qtyRescale` (« les valeurs se replient, la phrase se tait » : décidé).
- ⛔ Vérifier les autres unités / modes AVANT de coder : portions (`ef-prop`, `_efPortions`), poids déclaré, unité `ml`
  refusée, reprise depuis « Mes aliments ».
  - La règle ne doit refuser que le cas « bloc grammes actif + quantité ≤ 0 / illisible ».
  - Une saisie **sans** pour-100 g (aliment tapé à la main) reste **hors portée**, comme aujourd'hui.
- La douane (21 règles, gelée) n'est pas modifiée : observation seule.

## 3. Tests D'ABORD (rouges sur la base, verts après) — bloc préfixé session, **par clics réels** (sonde_journal.js montre comment)
- Ajout :
  - vide / « 0 » / « abc » → 0 ligne ajoutée, toast affiché ;
  - pour CIQUAL, fast-food, OFF figé, scan figé, reprise depuis le journal.
- Modification :
  - vide / « 0 » → ligne **identique** (kcal, macros, `q`, `u`, `per100`), y compris après rechargement.
- Non-régressions :
  - « 150 » → 1,5 × pour-100 g ; pastille de portion publiée ;
  - champ jamais touché → refus inchangé ;
  - modification 250 → 200 ;
  - portions (×2) ;
  - « Mes aliments » (`quickAddFood`) et `rejouerRepas` inchangés.

## 4. Mutations (`tools/mut_nut_lot_c.py`, arbre CLONÉ)
- M1 garde de l'ajout ramenée au seul drapeau `_bcQtyPose` (code d'avant) ;
- M2 garde de la modification retirée ;
- M3 garde qui accepte 0 ;
- M4 garde qui refuse aussi une quantité valide (doit rougir sur les non-régressions) ;
- MC1 commentaire (VERT).

## 5. Bancs à rejouer
- `repas_actif` 24 · `habitudes_alim` 37 · `food_variants` 122 · `food_multisource` 177 ;
- `python3 tools/recette_selecteur.py` sur ton diff. Le runner porte des témoins de la garde ft-v1051 (`_bcQtyPose`,
  lignes ~11893, ~24584, ~35738) et de `saveEditFood` ; `tests/parcours/identite_ligne.js` aussi. Tous verts.
- Instantanés `tools/instantane_1b23.js` et `tools/instantane_douane.js` : **identiques octet pour octet** hors cas refusés.
- `check_regles.py` · `git diff --check`.

## 6. Risques
- Bloquer une saisie légitime (portion, unité non-gramme) : c'est pourquoi les modes sont vérifiés AVANT de coder.
- Réintroduire le « voisinage muet » (ft-v966 / 1042 / 1051) : ne pas afficher de total pour une quantité refusée.

## 7. Dettes laissées de côté
- Macro « non déterminée » enregistrée à 0 (NIGHT-P-009, décision D3).
- Unités `ml`.
- Report d'une quantité tapée dans la recherche (D2, LOT-B).

## 8. Critère de fermeture
- Rouges avant / verts après · mutations conformes · bancs verts · instantanés identiques.
- Règle #17 (4 compteurs) · handoff JSON · push de la branche seulement.
- Règle d'or #11 : un refus qui protège ne mérite pas de pop-up ; l'aide « ? » de Nutrition n'a probablement rien à
  changer — à vérifier.

Estimation : **45 à 60 min**.
