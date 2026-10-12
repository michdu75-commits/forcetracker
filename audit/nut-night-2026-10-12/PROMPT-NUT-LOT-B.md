# FORCE TRACKER — NUT-LOT-B — LA REQUÊTE DIT L'ALIMENT, PAS LA QUANTITÉ (nombres, unités, « 0 », point final)

Rôle : Principal. Mission issue de l'audit de nuit du 12/10/2026 (`Force Tracker/Nutrition/AUDIT-NIGHT-2026-10-12/`).
Dégel Nutrition **limité à ce lot**.

## 0. Base et protocole
- `git fetch origin` ; ligne au `docs/JOURNAL-DE-PARTAGE.md` **poussée avant de coder** (règle #13).
- Branche `claude/nut-lot-b`, depuis la tête de `claude/nut-food-variants-03`. Hash vérifié par toi : `7dd1b005` au 12/10,
  ou le commit de contre-vérification qui le suit. Si LOT-A est déjà poussé, pars de LOT-A.
- `origin/master` = `7b75f3c1` (vérifie-le).
- Pas de numéro de version, pas de D-031 (différée à l'arbre final), pas de publication, pas de merge.
- **Décision de Michel attendue — D2** : une quantité tapée dans la recherche (« riz 100g ») est-elle seulement **ignorée
  par la recherche**, ou aussi **reportée** dans le champ quantité ?
  - Par défaut, sans réponse : **ignorée seulement**. Le report touche le formulaire, donc la règle d'or #11 et les gardes de
    quantité : c'est un autre lot.

## 1. Ce qui est mesuré (rejouer, pas refaire)
- `node tools/audit-nut-night/sonde_ciblee.js "riz 100g" "poulet 200g" "200 g poulet" "riz cuit 150 g" "lait 250ml" "30g de whey" "2 oeufs" "coca 0" "vitamine c" "pain complet." "riz."`
  - **14 des 20 requêtes « avec quantité »** de l'audit ne rendent RIEN, en ligne comme hors ligne :
    `riz 100g`, `poulet 200g`, `riz cuit 150 g`, `lait 250ml`, `pâtes 80g`, `30g de whey`, `banane x2`…
  - `2 oeufs` → « Oeufs au lait, rayon frais » : un **dessert**.
  - `coca 0` → **Cola, sucré** (40 kcal/100 ml) ; le sans sucres n'est que 4ᵉ. V03 a traité « zéro / zero », pas « 0 ».
  - `pain complet.` / `riz.` → rien : iOS met un point sur double espace.
- **Cause unique** : `_afMots` (app.js), propriétaire unique du découpage de la requête (R2, ft-v1119), qui sert les QUATRE
  recherches (CIQUAL via `_fsIntention`, fast-food, compléments, journal) :
  - il garde `100g`, `250ml`, `x2`, `200` comme des mots EXIGÉS du nom ;
  - il jette tout jeton d'une lettre, donc `0` ;
  - `_afNorm` ne traite pas le `.` (gardé pour les décimales).

## 2. Ce que le lot fait (stratégie minimale — à prouver par les tests, pas à recopier)
- Dans le propriétaire existant (`_afMots`, et seulement si nécessaire `_afNorm`), **aucune fonction nouvelle si possible**.
  - Ne plus EXIGER les jetons de quantité :
    - nombre seul ;
    - nombre collé à une unité `g gr kg ml cl dl l` ;
    - unité seule qui suit un nombre ;
    - `xN` / `Nx`.
  - ⛔ **Un taux `N%` reste un qualificatif** (VARIANTS-01/03 le lisent) : il ne doit JAMAIS être retiré.
  - ⛔ `1/2` est déjà traduit avant (`FOOD_SYNONYMES`) : ne pas le casser.
- « 0 » isolé = « zéro » : par la **même table** que V03 (`FOOD_SYNONYMES` : `'zero':['0%','sans sucres']`), pas par une
  nouvelle logique.
- Un `.` qui n'est pas entre deux chiffres ne compte pas dans la requête.
- Si la requête ne contenait QUE des quantités (« 100g »), garder le comportement actuel (jamais vide si la frappe ne l'était
  pas : c'est la règle écrite dans `_afMots`).

## 3. Tests D'ABORD (rouges sur la base, verts après) — bloc préfixé session, sur la **vraie frappe**
- Chaque requête du §1, en ligne ET hors ligne : l'aliment attendu est dans la liste, et les invariants tiennent.
  - `riz 100g` ≡ `riz` ; `poulet 200g` ≡ `poulet` ; `lait 250ml` ≡ `lait`.
  - `2 oeufs` : jamais un dessert en tête si `oeufs` seul ne le met pas.
  - `coca 0` : la version sans sucres devant le sucré ; ≡ `coca zéro`.
  - `pain complet.` ≡ `pain complet`.
- **Non-régressions explicites** :
  - `lait 0%`, `lait 1,2%`, `fromage blanc 2%`, `beurre 60-62%`, `crème 15%` (taux intacts) ;
  - `lait 1/2 écrémé` (V03) ; `7up` ; `steak haché 5%` ;
  - « Coca-Cola 350 ml » fast-food toujours trouvable ;
  - faux amis du journal **figés par D-042** (`oeuf` → Bœuf haché, `lait` → Laitue) — inchangés.
- Le même comportement sur les 4 recherches (CIQUAL, fast-food, compléments, journal) : un témoin par source.

## 4. Mutations (`tools/mut_nut_lot_b.py`, arbre CLONÉ)
- M1 retirer la règle « nombre + unité » ;
- M2 retirer la règle « unité après un nombre » ;
- M3 traiter `N%` comme une quantité (doit rougir) ;
- M4 retirer `0` → zéro ;
- M5 laisser le `.` final ;
- M6 retirer la règle `xN` ;
- MC1 commentaire (VERT) · MC2 écriture équivalente (VERT).

## 5. Bancs à rejouer
- `food_variants` 122 · `food_d042` 73 · `food_semantics` 44 · `food_formes` 46 · `food_prefs` 39 ·
  `food_reference` 136 · `food_multisource` 177 · `repas_actif` 24 · `habitudes_alim` 37 ;
- l'invariant **B-FV-N** (3 341 noms complets se retrouvent) DOIT rester vert : des noms CIQUAL contiennent des nombres
  (« Eau minérale … (Arcachon, 33) », « Beurre à 80% MG ») ;
- `python3 tools/recette_selecteur.py` sur ton diff, pour les blocs du runner touchés ;
- `check_regles.py` · `git diff --check`.

## 6. Risques
- `_afMots` sert 4 recherches : un jeton retiré à tort vide ou élargit une liste ailleurs. Témoins par source.
- Nombres qui font partie d'un nom : `7up`, « 4 quarts », « pain 7 céréales », départements des eaux minérales.
  L'invariant B-FV-N les attrape.
- Ne pas toucher au classement (FS-01/02/03) ni à la règle « mot entier » de V03.

## 7. Dettes laissées de côté
- Report de la quantité dans le champ (D2, si Michel le veut : autre lot).
- Mots de contenant : verre, tasse, canette, tranche.
- Fautes de frappe.
- Trait d'union `pomme-de-terre` : à inclure seulement si un témoin prouve qu'il ne casse rien.

## 8. Critère de fermeture
- Rouges avant / verts après · mutations conformes · 9 bancs + B-FV-N verts.
- Règle #17 (4 compteurs) · handoff JSON · push de la branche seulement.

Estimation : **60 à 90 min**.
