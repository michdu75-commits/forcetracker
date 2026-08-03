# 📦 Catalogue d'exercices — export pour réutilisation

> **Généré depuis Force Tracker (mis à jour le 02/08/2026, soir)** — 337 exercices, avec leur
> **identifiant stable**, leurs muscles, leur schéma de mouvement, leur matériel, leur coût
> énergétique et le **fichier de leur animation**.
>
> ⚠️ **Lis ce fichier en entier avant d'utiliser les données.** Les muscles de **277 exercices sur
> 337** ont été **écrits et relus un par un** ; les **60 autres** sont encore **déduits du nom** par
> un moteur de règles. La section « Fiabilité » dit lesquels, et ce que ça implique.

---

## Les fichiers

| Fichier | Pour quoi |
|---|---|
| `catalogue-exercices.json` | La source. 265 Ko, tout est dedans, y compris le vocabulaire. |
| `catalogue-exercices.csv` | Le même, ouvrable dans un tableur (séparateur `;`, encodage UTF-8 avec BOM). |
| `animations-exercices.csv` | **La correspondance NOM EXACT ⟷ FICHIER D'ANIMATION**, et rien d'autre. C'est le fichier à ouvrir si tu veux réutiliser les visuels : le fichier d'un côté, le nom qui doit s'afficher en face de l'autre. |
| `LISEZ-MOI-EXPORT.md` | Ce fichier. |

Régénérable par `node tools/export_catalogue.js` — les données sont **lues dans l'application en
cours d'exécution**, jamais recopiées à la main. L'export ne peut donc pas diverger du produit.

---

## Le schéma, champ par champ

```json
{
  "nom": "Rowing Barre (Tirage Horizontal)",
  "identifiant": "rowing-barre-tirage-horizontal",
  "anciensNoms": ["Rowing Barre"],
  "groupe": "Dos",
  "musclesPrincipaux":   ["lats", "traps"],
  "musclesSecondaires":  ["biceps", "forearms", "lower-back", "rear-delt"],
  "musclesPrincipauxFr": ["Grand dorsal", "Trapèzes"],
  "musclesSecondairesFr":["Biceps", "Avant-bras", "Lombaires", "Deltoïde postérieur"],
  "schemaMouvement": "tirage-horizontal",
  "schemaLibelle":   "Tirage horizontal",
  "materiel": "barre",
  "materielLibelle": "Barre",
  "met": 5.5,
  "role": "ancre",
  "termeAnglais": "barbell row bent over",
  "animation": "exercises/rowing-barre.webp",
  "animationExiste": true,
  "musclesEcrits": true,
  "relueLe": "2026-08-02",
  "classementCertain": true
}
```

| Champ | Description |
|---|---|
| `nom` | Nom affiché. Il peut changer — **ne t'en sers pas comme clé**, utilise `identifiant`. |
| `identifiant` | **La clé stable**, indépendante du nom (`rowing-barre-tirage-horizontal`). `null` pour un exercice créé par un utilisateur. |
| `anciensNoms` | Les noms que cet exercice a portés avant. Sert à rattacher un historique. |
| `groupe` | Groupe musculaire **choisi à la main** (13 valeurs). C'est la seule donnée saisie ; tout le reste est calculé. |
| `musclesPrincipaux` / `Secondaires` | Codes des muscles. La hiérarchie est **binaire** : principal ou secondaire, rien entre les deux. |
| `…Fr` | Les mêmes, en français lisible. |
| `schemaMouvement` | Famille de mouvement (20 valeurs) : squat, charnière de hanche, poussée/tirage horizontal et vertical, gainage, porté… Sert à mesurer l'équilibre d'une séance. |
| `materiel` | 8 catégories. Sert au filtrage « je m'entraîne à la maison ». |
| `met` | Coût énergétique (équivalent métabolique) : **4** isolation · **5,5** haut du corps · **6,5** bas du corps · **8** cardio et haltérophilie. |
| `role` | `ancre` (mouvement principal qui porte la progression) ou `accessoire` (isolation, volume). Utile pour construire un programme. |
| `termeAnglais` | Terme de recherche anglais. **Absent pour 82 exercices.** |
| `animation` | Chemin du fichier d'animation, **relatif à la racine du dépôt** (`exercises/…` ou `machine/…`). `null` pour 55 exercices qui n'en ont pas. Format **`.webp` animé** (pas des GIF) — plus léger, lisible par tous les navigateurs modernes ; quelques `.jpg` fixes pour les presses à jambes. |
| `animationExiste` | Vérifié **sur le disque** au moment de l'export : le fichier annoncé est bien là. Une correspondance qui pointe un fichier absent est pire qu'une case vide, elle se découvre chez toi. |
| `musclesEcrits` | `true` si les muscles ont été **écrits et relus à la main**, `false` s'ils sont encore déduits du nom par des règles. |
| `relueLe` | Date de la relecture humaine (uniquement si `musclesEcrits`). |
| `classementCertain` | `true` si les muscles sont écrits **ou** si le classement par règles est robuste ; `false` s'il dépend de l'ordre des règles. Voir ci-dessous. |

Le vocabulaire complet (17 muscles, 8 matériels, 20 schémas, 13 groupes) est dans la clé
`vocabulaire` du JSON — pas besoin de le deviner.

---

## 🎯 Fiabilité — la partie à ne pas sauter

### D'où viennent ces données

Historiquement, **un exercice dans Force Tracker n'était qu'un nom et un groupe** : tout le reste —
muscles, schéma, matériel, calories, rôle — était **recalculé à partir du nom** par un moteur de
**69 règles** parcourues dans l'ordre, la première qui correspond gagne.

**Ça a changé pour les muscles.** Depuis le 02/08/2026, les muscles sont **écrits** exercice par
exercice et **relus à la main**, groupe par groupe. Ce qui disparaît alors n'est pas *corrigé*, il
devient **impossible** : plus d'ordre de règles où se tromper, plus de règle masquée.

Le déclencheur, c'est le résultat de la relecture du premier groupe : **5 erreurs sur 41
pectoraux**. Extrapolé, ~40 erreurs invisibles dans le catalogue. Les groupes suivants l'ont
confirmé — un deltoïde postérieur compté comme *moteur* dans 18 rowings, un biceps *moteur* dans
13 tirages verticaux, des rowings à poitrine appuyée qui comptaient le bas du dos (alors que c'est
précisément ce qu'ils suppriment), un leg curl qui créditait les fessiers alors que la hanche ne
bouge pas, des crunchs qui comptaient les fléchisseurs de hanche…

### Ce que vaut le résultat, mesuré

| | Exercices | |
|---|---|---|
| Muscles **écrits et relus à la main** (`musclesEcrits: true`) | **277** | **82 %** |
| Encore déduits par règles, classement **robuste** | 55 | 16 % |
| Encore déduits par règles, classement **fragile** (`classementCertain: false`) | **5** | 1 % |
| Sans aucun classement | **0** | — |

**7 groupes sont entièrement relus** : Pectoraux · Épaules · Dos · Jambes · Fessiers · Triceps ·
Abdominaux. Restent à relire : Full Body, Biceps, Lombaires, Mollets, Trapèzes, Avant-bras.

**« Fragile » ne veut pas dire faux.** Ça veut dire que *plusieurs règles correspondent à cet
exercice en donnant des muscles différents*, et que le résultat retenu dépend de **l'ordre** des
règles. Les 5 sont corrects aujourd'hui — mais si tu réécris les règles, **ce sont eux qui
basculent d'abord**. Ils sont nommés dans le JSON.

### Ce qui a été vérifié, et ce qui ne l'a pas été

- ✅ **Relecture anatomique** : 277 exercices, un par un, sur sources (ExRx, Strength Level, EMG),
  chacun portant sa date de relecture (`relueLe`).
- ✅ **Cohérence interne** : 337/337. Aucun exercice dont le groupe contredit ses muscles, ou dont
  le schéma de mouvement contredit ses muscles.
- ✅ **Aucun doublon** : deux exercices ne partagent ni le même terme anglais ni la même animation.
- ✅ **Animations** : chaque chemin annoncé a été **vérifié sur le disque** au moment de l'export.
- ⚠️ **Les 60 non relus** n'ont bénéficié d'aucune vérification externe. Traite-les comme des
  approximations.

---

## 🎬 Les animations

**282 exercices sur 337 ont une animation** ; 55 n'en ont pas (surtout des abdominaux et des
biceps — le détail est dans `animations-exercices.csv`, colonne vide).

- Ce sont des **`.webp` animés**, pas des GIF : ~10× plus légers à qualité égale, lus nativement
  par tous les navigateurs modernes. Quelques `.jpg` fixes pour les presses à jambes.
- Le chemin est **relatif à la racine du dépôt** : `exercises/…` pour la quasi-totalité,
  `machine/…` pour deux fiches. **Ne suppose pas un dossier unique** — c'est le piège dans lequel
  la première version de ce contrôle est tombée, en déclarant « cassées » deux animations
  parfaitement présentes.
- Poids total : **29 Mo** pour le dossier `exercises/`.
- **7 fichiers du dépôt ne sont utilisés par aucune fiche** — probablement des restes.

👉 Pour ton usage (« le GIF d'un côté, le nom exact en face »), ouvre **`animations-exercices.csv`** :
une ligne par exercice, avec `nom` · `identifiant` · `groupe` · `animation` · `animationExiste` ·
`termeAnglais`. Rien d'autre.

---

## ⚠️ Les cinq pièges — appris en ~730 versions

### 1. Le nom ÉTAIT la clé primaire

L'historique d'entraînement de Force Tracker était indexé **par le nom de l'exercice**.
Conséquences vécues :

- **renommer cassait le lien avec le passé** — il a fallu trois tables de correspondance ;
- **deux exercices ne pouvaient pas porter le même nom** ;
- **ajouter un mot dans un nom changeait ses calculs** (avéré : ajouter « (Tirage Horizontal) » à
  « Rowing Barre » l'a fait passer de la catégorie *barre* à la catégorie *machine*, en silence).

**C'est réparé côté Force Tracker** : chaque exercice a désormais un **identifiant stable**
(champ `identifiant`), et la table va de l'**identifiant vers les noms** — jamais l'inverse. Le
premier nom de la liste s'affiche, les suivants sont les **anciens** (champ `anciensNoms`), ce qui
permet à un historique de suivre un renommage.

👉 **Fais pareil dès le départ dans ta nouvelle application** : la clé, c'est l'identifiant ; le
nom n'est qu'une étiquette qu'on a le droit de changer.

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
