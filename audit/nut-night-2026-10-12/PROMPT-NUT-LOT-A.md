# FORCE TRACKER — NUT-LOT-A — TABLES GÉNÉRÉES : LE SENS AVANT LE CODE (alias + fast-food)

Rôle : Principal. Mission issue de l'audit de nuit du 12/10/2026 (`Force Tracker/Nutrition/AUDIT-NIGHT-2026-10-12/`).
Dégel Nutrition **limité à ce lot**. ⛔ Ne touche pas `app.js`, `state.js` ni aucune logique runtime : ce lot ne modifie que
des **générateurs** (`tools/alias.py`, `tools/marques.py`) et les fichiers qu'ils **régénèrent** (`data/alias.json`,
`data/marques.json`). Un fichier `data/*.json` ne se retouche **jamais à la main**.

## 0. Base et protocole
- `git fetch origin`, lire `docs/JOURNAL-DE-PARTAGE.md`, y écrire ta ligne et la **pousser AVANT de coder** (règle #13).
- Branche `claude/nut-lot-a` depuis la tête de `claude/nut-food-variants-03`. Vérifie toi-même son hash : `7dd1b005` au
  12/10, ou le commit de contre-vérification qui le suit s'il existe. Vérifie aussi `origin/master` = `7b75f3c1`.
- Aucun numéro de version pendant le travail. Pas de D-031 (différée à l'arbre final intégré). Pas de publication, pas de merge.
- **Décisions de Michel attendues AVANT de coder** (elles sont dans `REPRISE-DEMAIN.md`) :
  - **D1** — les alias discutables (NIGHT-P-027) et la cible de « confiture » générique ;
  - **D4** — les lignes Quick suspectes : DOUTE ou RETRAIT.
  Sans réponse, tu traites **seulement** les erreurs nettes (§2-a) et tu laisses D1/D4 en dette nommée.

## 1. Ce qui est mesuré (ne pas refaire l'audit, le rejouer)
- `python3 tools/audit-nut-night/alias_semantique.py out.json` →
  - 632 alias, dont 273 cibles qui ne portent pas tous les mots de leur clé ;
  - **49 cas où un AUTRE aliment proposable porte tous ces mots**.
- Erreurs nettes, **en ligne** (l'état normal ; hors ligne, l'aliment exact sort 1ᵉʳ) :
  - `confiture`, `confiture de fraise`, `confiture dabricot`, `confiture fruits rouges` → **31040 « Confiture de lait » (340 kcal)**.
    CIQUAL porte 31024 « Confiture de fraise (extra ou classique) » 248, 31037 abricot 246, 30999 / 31006 (aliments moyens) ;
  - `gruyere` → Emmental (373), alors que 12114 « Gruyère, sans précision » (408) existe ;
  - `lieu noir` → Lieu d'Alaska, alors que 26134 « Lieu noir, cru » existe ;
  - `pilon(s) de poulet` → cuisse (114), alors que 36022 « Poulet, pilon cru » (155) existe ;
  - `riz semi-complet` → riz complet (187), alors que 9113 (165) existe ;
  - `pain aux cereales` → pain complet (234), alors que 7255 (269) existe ;
  - `jambon de bayonne` → jambon cru, alors que 28811 existe ;
  - `jambon sec` → jambon cru, alors que 28812 existe ;
  - `lentilles blondes` → lentille verte, alors que 20588 existe ;
  - `pates semi-completes` → 9871, alors que 9877 existe ;
  - `haut de cuisse de poulet` → 36024, alors que 36019 existe ;
  - `beurre sale` → demi-sel, alors que 16403 « salé » existe ;
  - `riz thai` → riz blanc, alors que 9124 « Riz thaï, cuit » existe.
- `python3 tools/audit-nut-night/marques_doublons.py` → **5 groupes** de produits Quick DIFFÉRENTS aux valeurs identiques :
  - « Dosette salade fromage blanc ciboulette » = « Grande Rustiques », soit **576 kcal pour une dosette** ;
  - « Grande Frites supplément Sauce Ranch » = « Petite Frite » (portion 65 g) ;
  - 3 autres groupes.

  Le décalage est **dans le classeur source** (ligne 86 « Base nutrition »). Un seul doute est affiché sur 11 lignes concernées.

⚠️ Vérifie chaque cible proposée **dans `data/ciqual.json`** avant de l'écrire : ces codes sont une carte, pas une vérité.

## 2. Ce que le lot fait
a) **Erreurs nettes d'alias** : une entrée par clé dans `CORRECTIONS` de `tools/alias.py`, chacune avec sa raison écrite
   (« audit de nuit 12/10 : l'aliment nommé existe »). Les clés D1 attendent leur décision.
b) **Un contrôle de génération** dans `tools/alias.py` qui **IMPRIME** toute clé dont la cible ne porte pas tous les mots de la
   clé alors qu'un aliment proposable les porte tous. Il prend une **liste blanche explicite** des traductions voulues
   (`lait d'amande` → boisson, `patate`, `spaghetti`, `burger`, `laitue`… selon D1), chacune avec sa raison (R30). Le
   générateur **refuse** de produire si une clé non blanchie est détectée. *C'est ce contrôle qui manquait en ft-v1115 :
   on a vérifié les codes et les macros, jamais le sens.*
c) **Un contrôle dans `tools/marques.py`** : des produits différents aux valeurs identiques (kcal, P, G, L, portion) reçoivent
   un `doute` lisible (mécanisme existant, décision ft-v1114 « tout mettre et marquer le doute »), ou sont retirés si D4 le
   dit. Le contrôle s'imprime à la génération, comme le doute « mêmes poids » existant.
d) Optionnel, seulement si Michel le valide : 3 alias de vocabulaire (NIGHT-P-010).
   - `nutella` → 31032 « Pâte à tartiner chocolat et noisette ».
   - `popcorn` → un des pop-corn 9230 / 9231 / 9232 (lequel : décision).
   - `granola` → un muesli croustillant 32108… (lequel : décision).
   *Aucun mot de marque ne crée de valeur : c'est une porte vers un code CIQUAL.*

## 3. Tests D'ABORD (rouges avant le code)
- **Bloc de témoins préfixé session** dans un banc ciblé : nouveau banc `tests/parcours/food_alias_sens.js` + `tools/banc_food_alias_sens.js`,
  ou bloc ajouté à `food_variants`, sur la **vraie frappe** (le harnais `food_multisource.js` sait le faire).
  - Pour chaque clé corrigée : en ligne, la 1ʳᵉ ligne porte le mot nommé (« gruyère » → un Gruyère, « confiture de fraise » →
    une confiture de fraise) et **jamais** « Confiture de lait » ;
  - hors ligne : inchangé.
- Témoin générateur : une clé fautive injectée dans une **copie** de `tools/alias.py` fait **refuser** la génération.
- Témoin fast-food : la dosette porte un doute affiché (ou a disparu, selon D4) ; « Grande Rustiques » garde ses valeurs.
- Rouges sur la base **avant** le code, verts après.

## 4. Mutations (`tools/mut_food_alias_sens.py`, sur arbre CLONÉ, statuts GARDE / OK)
- M1 rétablir `confiture` → 31040 ;
- M2 retirer le contrôle sémantique du générateur ;
- M3 blanchir une clé fautive en silence ;
- M4 retirer le contrôle « valeurs identiques » de `marques.py` ;
- M5 remettre `gruyere` → Emmental ;
- MC1 commentaire modifié (doit rester VERT).

## 5. Bancs à rejouer (tous verts, comparés aux références VARIANTS-03)
- `food_variants` 122 · `food_d042` 73 · `food_semantics` 44 · `food_formes` 46 · `food_prefs` 39 ·
  `food_reference` 136 · `food_multisource` 177 · `repas_actif` 24 · `habitudes_alim` 37 ;
- `python3 tools/check_regles.py` · `git diff --check` · régénération des deux tables avec le **diff attendu**, et rien d'autre.
- ⚠️ Un témoin FS existant qui change parce qu'il figeait un alias fautif : **ne le modifie pas pour faire passer le code**.
  Cite-le, explique-le, demande.

## 6. Risques
- Un alias corrigé peut faire bouger un témoin FS-03 / FS-05 qui figeait la mauvaise cible : c'est une **décision** à
  rapporter, pas une retouche.
- La liste blanche ne doit pas devenir un fourre-tout : chaque ligne porte sa raison.
- Ne pas élargir aux 273 « cibles sans tous les mots » : la plupart sont des traductions voulues.

## 7. Dettes laissées de côté
- Pluriels sans alias (NIGHT-P-015).
- Variantes d'écriture (NIGHT-P-013).
- Fautes de frappe (NIGHT-P-012).
- Fast-food : nom exact pas en tête (NIGHT-P-017).
- kcal ≠ macros sur 3 petites lignes (NIGHT-P-018).

## 8. Critère de fermeture et sortie
- Erreurs nettes corrigées · générateur qui refuse une clé fautive · doute (ou retrait) Quick ;
- témoins rouges avant / verts après · mutations conformes · 9 bancs verts ;
- règle #17 (4 compteurs) · handoff JSON (HEAD fonctionnel / final, arbre, bancs, mutations) · push de la branche seulement.

Estimation : **45 à 60 min**.
