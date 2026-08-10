# 📦 Catalogue d'exercices — export lisible par une autre IA / une autre app

**Fichier : `catalogue-exercices.json` · 362 entrées · généré depuis le code, jamais écrit à la main.**

À régénérer après toute évolution du catalogue :
`python3 -m http.server 8123 &` puis `node tools/export_catalogue.js`

> ⚠️ **Généré, donc il ne peut pas mentir** (R27). S'il est faux, c'est le code qui est faux.
> Ne jamais le corriger à la main : corriger `constants.js` / `log.js` et relancer l'export.

## Les champs

| Champ | Ce que c'est |
|---|---|
| `id` | identifiant **stable** (`rowing-haltere-tirage-horizontal`). C'est LUI qui range l'historique, jamais le nom — un nom peut changer, l'id non. |
| `nom` | le nom affiché, en français |
| `groupe` | le bac du sélecteur (Pectoraux, Dos, Jambes…) |
| `muscles_primaires` / `muscles_secondaires` | codes musculaires (`lats`, `quads`, `front-delt`…). Relus un par un en août 2026. |
| `pattern` | famille de mouvement (`poussee-horizontale`, `tirage-vertical`, `hip-hinge`, `fente`, `squat`…) — sert à trouver un exercice **équivalent**. |
| `met` | coût énergétique (4.0 isolation · 5.5 haut du corps · 6.5 bas du corps · 8.0 explosif/cardio) |
| `unilateral` | **true = la série se refait de l'autre côté** (critère de Michel, 10/08/2026). Vérifié figurine par figurine, 57 exercices tranchés à la main. |
| `image` | figurine **animée** (WebP, 12 à 24 images) dans `exercises/` — 340 des 362 en ont une |
| `youtube` | démonstration vidéo quand elle existe |

## ⚠️ Deux pièges qui ont coûté cher ici

1. **La figurine BOUGE.** Ouvrir une seule image montre la **position de départ** — le seul instant
   où le mouvement n'a pas commencé. Pour juger un geste, extraire 4 images réparties.
2. **Le nom ne dit pas tout.** « Haltère » au singulier ne veut pas dire « un bras » ; « iso-latéral »
   ne veut pas dire « un à la fois ». C'est pour ça que `unilateral` est une donnée **vérifiée**,
   pas une déduction sur le nom.
