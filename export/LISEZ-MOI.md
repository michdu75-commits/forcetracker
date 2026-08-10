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

## 🖼️ Les figurines sont DÉJÀ EN LIGNE — aucun zip à trimballer

306 fichiers, 31 Mo, déjà servis publiquement par GitHub Pages :

```
https://michdu75-commits.github.io/forcetracker/exercises/<fichier>.webp
```

Le champ `image_url` du JSON (et du CSV) donne l'adresse complète, prête à l'emploi. **Il n'y a donc
rien à téléverser** : une autre app peut pointer dessus directement, sans stockage et sans copie.

## 🔗 Et surtout : LE RAPPROCHEMENT EST DÉJÀ FAIT

C'est le travail le plus long, et il est **terminé** — chaque exercice porte SA figurine, vérifiée
sur des mois d'usage réel. `Développé Couché → developpe-couche.webp`, et les **11 variantes**
(incliné, décliné, haltères, Larsen, au sol, chaînes, Smith, poulie, élastique…) sont distinguées
une par une.

⚠️ **Ne pas refaire ce rapprochement à partir des noms de fichiers.** C'est exactement là qu'on se
trompe : les fichiers s'appellent `developpe-couche-halteres-exercice-musculation.webp` ou
`rowing-haltere-un-bras.webp` — un rapprochement automatique sur le nom rate les cas simples et
invente des liens faux. Prendre la colonne, pas la deviner.

## 📊 Deux formats, même contenu

- `catalogue-exercices.json` — pour lire depuis du code
- `catalogue-exercices.csv` — pour importer directement dans une base (Supabase, Airtable…),
  colonnes plates, listes séparées par `|`. **72 Ko pour les 362 exercices.**
