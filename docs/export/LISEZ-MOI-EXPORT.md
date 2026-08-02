# 📦 Catalogue d'exercices — export pour réutilisation

> **Généré le 02/08/2026 depuis Force Tracker** — 337 exercices, avec leurs muscles, leur schéma de
> mouvement, leur matériel et leur coût énergétique.
>
> ⚠️ **Lis ce fichier en entier avant d'utiliser les données.** Elles ne sont pas ce qu'elles ont
> l'air d'être : elles sont **déduites**, pas saisies. La section « Fiabilité » explique ce que ça
> implique concrètement.

---

## Les fichiers

| Fichier | Pour quoi |
|---|---|
| `catalogue-exercices.json` | La source. 195 Ko, tout est dedans, y compris le vocabulaire. |
| `catalogue-exercices.csv` | Le même, ouvrable dans un tableur (séparateur `;`, encodage UTF-8 avec BOM). |
| `LISEZ-MOI-EXPORT.md` | Ce fichier. |

Régénérable par `node tools/export_catalogue.js` — les données sont **lues dans l'application en
cours d'exécution**, jamais recopiées à la main. L'export ne peut donc pas diverger du produit.

---

## Le schéma, champ par champ

```json
{
  "nom": "Rowing Barre (Tirage Horizontal)",
  "groupe": "Dos",
  "musclesPrincipaux":   ["lats", "rear-delt", "traps"],
  "musclesSecondaires":  ["biceps", "forearms", "lower-back"],
  "musclesPrincipauxFr": ["Grand dorsal", "Deltoïde postérieur", "Trapèzes"],
  "musclesSecondairesFr":["Biceps", "Avant-bras", "Lombaires"],
  "schemaMouvement": "tirage-horizontal",
  "schemaLibelle":   "Tirage horizontal",
  "materiel": "barre",
  "materielLibelle": "Barre",
  "met": 5.5,
  "role": "ancre",
  "termeAnglais": "barbell row bent over",
  "classementCertain": true
}
```

| Champ | Description |
|---|---|
| `nom` | Nom affiché. **C'est aussi la clé** — voir l'avertissement plus bas. |
| `groupe` | Groupe musculaire **choisi à la main** (13 valeurs). C'est la seule donnée saisie ; tout le reste est calculé. |
| `musclesPrincipaux` / `Secondaires` | Codes des muscles. La hiérarchie est **binaire** : principal ou secondaire, rien entre les deux. |
| `…Fr` | Les mêmes, en français lisible. |
| `schemaMouvement` | Famille de mouvement (20 valeurs) : squat, charnière de hanche, poussée/tirage horizontal et vertical, gainage, porté… Sert à mesurer l'équilibre d'une séance. |
| `materiel` | 8 catégories. Sert au filtrage « je m'entraîne à la maison ». |
| `met` | Coût énergétique (équivalent métabolique) : **4** isolation · **5,5** haut du corps · **6,5** bas du corps · **8** cardio et haltérophilie. |
| `role` | `ancre` (mouvement principal qui porte la progression) ou `accessoire` (isolation, volume). Utile pour construire un programme. |
| `termeAnglais` | Terme de recherche anglais. **Absent pour 82 exercices.** |
| `classementCertain` | `true` si le classement est **robuste**, `false` s'il dépend de l'ordre des règles. Voir ci-dessous. |

Le vocabulaire complet (17 muscles, 8 matériels, 20 schémas, 13 groupes) est dans la clé
`vocabulaire` du JSON — pas besoin de le deviner.

---

## 🎯 Fiabilité — la partie à ne pas sauter

### D'où viennent ces données

**Un exercice, dans Force Tracker, n'est qu'un nom et un groupe.** Tout le reste — muscles, schéma,
matériel, calories, rôle — est **recalculé à partir du nom** par un moteur de **69 règles**
parcourues dans l'ordre, la première qui correspond gagne.

### Ce que vaut le résultat, mesuré

| | Exercices | |
|---|---|---|
| Classement **robuste** (`classementCertain: true`) | 277 | **82 %** |
| Classement **fragile** (`classementCertain: false`) | 60 | 18 % |
| Sans aucun classement | **0** | — |

**« Fragile » ne veut pas dire faux.** Ça veut dire que *plusieurs règles correspondent à cet
exercice en donnant des muscles différents*, et que le résultat retenu dépend de **l'ordre** des
règles. Les 60 sont corrects aujourd'hui — le développé couché sort bien en pectoraux et non en
épaules. Mais si tu réordonnes ou réécris les règles, **ce sont ces 60-là qui basculent d'abord**.

### Ce qui a été vérifié, et ce qui ne l'a pas été

- ✅ **Cohérence interne** : 337/337. Aucun exercice dont le groupe contredit ses muscles, ou dont
  le schéma de mouvement contredit ses muscles.
- ✅ **Aucun doublon** : deux exercices ne partagent ni le même terme anglais ni la même animation.
- ⚠️ **Justesse anatomique** : vérifiée sur sources (NASM, BarBend, études EMG) pour **5 exercices
  seulement**, ceux qui étaient suspects. **Pas sur les 337.**

Autrement dit : les données ne se contredisent pas entre elles, mais **rien ne garantit qu'elles
soient toutes anatomiquement exactes**. Si ton application prend des décisions d'entraînement à
partir de ces muscles, **re-vérifie les exercices que tu utilises le plus**.

---

## ⚠️ Les cinq pièges — appris en ~730 versions

### 1. Le nom est la clé primaire

L'historique d'entraînement de Force Tracker est indexé **par le nom de l'exercice**. Conséquences :

- **renommer casse le lien avec le passé** — il faut une table de correspondance ancien → nouveau ;
- **deux exercices différents ne peuvent pas porter le même nom** ;
- **ajouter un mot dans un nom change ses calculs** (avéré : ajouter « (Tirage Horizontal) » à
  « Rowing Barre » l'a fait passer de la catégorie *barre* à la catégorie *machine*, en silence).

👉 **Recommandation forte pour ta nouvelle application : donne un identifiant stable à chaque
exercice, indépendant du nom.** C'est la dette principale de Force Tracker, et elle coûte cher.

### 2. Le « premier match gagnant »

C'est le bug le plus fréquent du projet — **au moins 12 occurrences**. Une règle générale placée
avant une règle précise rend la précise **inatteignable**, et rien ne le signale : l'exercice est
simplement classé autrement, sans erreur ni plantage.

Exemples réels : un *leg curl* classé en biceps (mot-clé `curl`) · un *Jefferson Curl* (flexion du
dos) classé en biceps · les *oiseaux* recevant le deltoïde **moyen** au lieu du **postérieur**
pendant des mois, parce que la règle correcte était masquée.

👉 Si tu construis un moteur à règles ordonnées, **vérifie qu'aucune règle n'est jamais atteinte**,
et surtout qu'aucune n'est **partiellement** masquée (19 le sont ici).

### 3. Les pièges de sous-chaîne

Une correspondance textuelle sans bornes attrape des mots à l'intérieur d'autres mots. Cas réels :

- `t.?bar` (écrit pour le T-Bar Row) attrapait « poigne**T BAR**re » → classé en dos ;
- `l sit` (pour le L-Sit) attrapait « wa**ll sit** » → la chaise murale partait en gainage.

### 4. Les muscles ne sont pas figés dans l'historique

Force Tracker **ne stocke pas** les muscles dans les séances : il les recalcule à l'affichage.
Corriger une règle change donc rétroactivement ce que les séances d'il y a un an « ont travaillé ».
Pratique pour propager un correctif, gênant pour la reproductibilité des statistiques.

👉 **À trancher explicitement dans ta nouvelle application** : figer au moment de l'enregistrement
(statistiques stables, erreurs gravées) ou recalculer (correctifs propagés, passé mouvant).

### 5. Ce qui n'est PAS modélisé

Ces informations n'existent pas dans l'export parce qu'il n'y a nulle part où les mettre :

**unilatéral / bilatéral** · **côté travaillé** · **amplitude** · **tempo** · **variantes d'un même
mouvement** · **pondération continue des muscles** (la hiérarchie est binaire) · **niveau de
difficulté** · **contre-indications**.

⚠️ Conséquence concrète : **un exercice unilatéral compte comme un bilatéral dans les volumes.**
Une fente ou un rowing à un bras est comptabilisé comme s'il chargeait les deux côtés à la fois.

---

## ✅ Ce qui est solide et réutilisable tel quel

- **Le vocabulaire.** 17 muscles, 20 schémas de mouvement, 8 catégories de matériel, 13 groupes.
  Ce découpage a été éprouvé sur ~730 versions et corrigé plusieurs fois ; il tient.
- **Les schémas de mouvement.** C'est la donnée la plus utile pour construire des programmes :
  elle permet de mesurer l'équilibre d'une séance (a-t-on autant poussé que tiré ?) et de proposer
  un **remplacement pertinent** (même schéma, matériel différent).
- **Le champ `role`** (ancre / accessoire) : simple, et suffisant pour ordonner une séance.
- **Le modèle MET** pour les calories : grossier mais honnête, et il ne prétend pas à la précision.

---

## Une suggestion de méthode, plus utile que les données

Le dispositif qui a trouvé le plus de défauts dans ce catalogue s'appelle **les croisements**.
L'idée : quand un système connaît **plusieurs choses indépendantes** sur un même objet (ici : le
groupe, les muscles, le schéma, le terme anglais, l'animation, le matériel), **chacune est
plausible isolément et aucune ne plante**. On ne tient un bug que lorsque **deux se contredisent**.

Une lecture attentive des 69 règles avait trouvé **4 erreurs**. Les croisements en ont trouvé
**14 de plus** — dont un exercice de *poussée* classé en *tirage*, qui faussait l'équilibre de
séance depuis des jours sans que rien ne l'indique.

👉 Si tu reprends ces données dans un autre système, **crée au moins un contrôle croisé** entre
deux sources qui devraient dire la même chose. C'est ce qui rapporte le plus, et de loin.

---

*Export généré depuis le code source de Force Tracker le 02/08/2026 · `tools/export_catalogue.js`*
