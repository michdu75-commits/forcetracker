# 🥗 Le moteur nutrition de Force Tracker — comment ça marche, et ce qu'il faut construire

> **Créé le 18/08/2026**, à la demande de Michel : *« donne-moi un fichier complet qui explique
> comment fonctionne la nutrition sur l'application, ce dont nous avons besoin, créer une base de
> données complète des aliments pour créer des repas sans passer par l'IA, et qui se mette à jour.
> Il faudra que ça s'adapte aux styles d'entraînement […] des repas simples, modulables, s'il y a
> une diète aussi, une perte de poids etc. »*
>
> ⚠️ **Ce document ne remplace pas `docs/NUTRITION-PHILOSOPHIE.md`**, qui dit le **pourquoi** et pose
> les garde-fous éthiques (la nutrition ne doit jamais devenir une source de stress supérieure au
> bénéfice qu'elle apporte — Constitution **P21**). Celui-ci dit le **comment** : les chiffres réels,
> les mécanismes en place, ce qui manque, et le plan pour la suite.
>
> 📏 **Tout ce qui est chiffré ici a été LU dans le code**, pas retenu de mémoire (R28).

---

## 1. En une page, pour décider

**Ce qui marche déjà** : le calcul des besoins (BMR → TDEE → objectif → macros) est solide, il tient
compte de la masse maigre mesurée quand elle existe, du travail, des autres sports, du cycle
menstruel, et il est entièrement **hors ligne**.

**Ce qui est faible** : le **plan de repas**. Ce sont **25 phrases écrites à la main**, du texte libre
(« Riz + poulet + légumes »). Les régimes et les allergies sont gérés par **remplacement de mots dans
ce texte** — ça marche, c'est testé, mais ça ne monte pas en charge : chaque aliment nouveau demande
d'être ajouté à la main dans trois tables, sinon un végan voit de la viande.

**Ce qu'il faut construire** : remplacer le texte par une **base d'aliments structurée** et un
**générateur** qui compose les repas. Aucune IA : le calcul est déterministe, gratuit et fonctionne
sans réseau.

**Le vrai gain, au-delà de la variété** : aujourd'hui la nutrition **ignore complètement
l'entraînement**. Elle ne sait pas si tu t'entraînes aujourd'hui, à quelle heure, ni ce que tu as
soulevé. C'est le manque le plus important, et c'est celui qui différencie le produit.

---

## 2. La chaîne complète, telle qu'elle tourne aujourd'hui

```
  Profil (poids, taille, âge, sexe, activité, travail)
        │
        ├─ bmrDetail()  ── masse maigre mesurée ? ─→ Katch-McArdle
        │                  sinon                  ─→ Mifflin-St Jeor
        │
        ├─ calcTDEE()   = BMR × niveau d'activité + travail + autre sport
        │
        ├─ autoKcal()   = TDEE + objectif + phase (± 100) + cycle menstruel
        │                 ⤷ ou le réglage MANUEL s'il existe (il gagne toujours)
        │
        ├─ macrosForKcal()  → protéines / glucides / lipides
        │
        └─ getMeals()   → 5 à 6 repas, avec leurs calories et leurs macros
                 │
                 ├─ 1. plan choisi : mode alimentaire > objectif
                 ├─ 2. jeûne intermittent : le petit-déjeuner est redistribué
                 ├─ 3. variante DU JOUR (3 par repas, choisie par la date)
                 ├─ 4. _adaptMealDesc()  → régime + allergies (remplacement de mots)
                 └─ 5. _portionner()     → les grammes, calculés sur les kcal du repas
```

### 2.1 Les besoins caloriques

| Étage | Règle exacte | Où |
|---|---|---|
| **BMR** | Katch-McArdle si une **masse maigre mesurée** existe (bilan corporel < 90 j), sinon Mifflin-St Jeor | `bmrDetail()` |
| **Travail** | bureau +0 · debout +200 · actif +325 · physique +450 kcal | `calcWorkExtra()` |
| **Autre sport** | +150 kcal/j, **sauf** si le niveau d'activité est déjà ≥ Actif (sinon on compte deux fois) | `calcSportExtra()` |
| **Objectif** | muscle +350 · force +200 · endurance +100 · équilibre 0 · **recomp −250** · perte −450 | `autoKcal()` |
| **Phase** | charge +100 · décharge −100 | `autoKcal()` |
| **Cycle** | phase lutéale : +150 kcal et +0,2 g/kg de protéines | `autoKcal()`, `macrosForKcal()` |
| **Manuel** | si la personne a fixé ses calories, **elles gagnent** ; protéines et lipides restent sains, les glucides absorbent l'écart | `calcMacros()` |

### 2.2 Les macros

**Par défaut** (g par kg de poids de corps) :

| Objectif | Protéines | Lipides | Glucides |
|---|---|---|---|
| muscle | 2,2 | 0,9 | le reste |
| force | 2,0 | 1,0 | le reste |
| équilibre | 2,0 | 0,85 | le reste |
| endurance | 1,7 | 0,75 | le reste |
| perte | 2,5 | 0,8 | le reste |
| **recomp** | **2,6** | 0,85 | le reste |

**Modes alimentaires** — deux se substituent au calcul, deux non :

| Mode | Effet sur les macros |
|---|---|
| **Cétogène** | 5 % glucides / 15 % protéines / 80 % lipides (en % des calories) |
| **Low carb** | 25 / 30 / 45 |
| **Paléo**, **Méditerranéen** | ⚠️ **aucun** — ce sont des choix d'**aliments**. Inventer une répartition serait un faux-précis |

### 2.3 Les repas — le maillon faible

`getMeals()` choisit un plan dans cet ordre : **mode alimentaire** (keto / low carb / paléo /
méditerranéen) → sinon **objectif** (muscle / perte / force / équilibre / endurance ; *recomp* utilise
le plan *perte*).

Un plan = 4 à 6 lignes `[part des calories, nom du repas, description]`. Depuis ft-v900, la
description peut être **une liste de 3 variantes** dont on prend celle du jour.

**La description est du TEXTE LIBRE** — c'est là que tout se joue :

```
'Riz + poulet + légumes — Repas complet'
 └── aliments ──┘   └─ note ─┘
```

### 2.4 Régimes et allergies — par remplacement de mots

- **`_DIET_SWAPS`** : ~20 règles `[contrainte, motif, remplacement]`. Ex. végan : `Œufs → Tofu`,
  `Poulet/thon|Poulet|Dinde → Tempeh`, `Saumon|Bœuf|Poisson|Thon → Pois chiches`, `miel → dattes`.
- **`_ALLERGENES`** : 8 catégories (fruits à coque, fruits de mer, arachide, poisson, œuf, soja,
  lactose, gluten) → une catégorie déclarée attrape ses membres (« fruits à coque » → amandes, noix…).
- **`_EVIT_SWAPS`** : remplacements sûrs quand on en connaît un. **Sinon on SIGNALE** l'aliment au lieu
  de faire semblant (R29 — ici l'erreur peut être une allergie).
- **Le kéto a son propre plan** au lieu de substitutions : remplacer mot à mot donnerait
  « Œufs brouillés + œufs ».

### 2.5 Les portions (ft-v899)

`_PORTIONER()` calcule les grammes depuis les calories du repas, avec une table de ~40 motifs
`[motif, kcal/100 g, poids relatif, pas, mini, maxi, portion fixe, liquide]`.

**Quatre règles, chacune née d'un défaut mesuré :**

1. **Tout en grammes, jamais en pièces.** « Œufs (3) » deviendrait « Tofu (3) » après substitution.
2. **On quantifie APRÈS l'adaptation au régime**, sur l'aliment réellement affiché.
3. **La quantité se pose juste après l'aliment**, pas en fin de morceau — « à l'huile d'olive 200 g »
   se lit comme 200 g d'huile.
4. **Aliment inconnu = aucune quantité.** On n'invente pas.

Les légumes et les fruits ont une **portion standard** : répartir les calories au prorata donnait
« fruit 280 g » à un petit-déjeuner.

### 2.6 ⚠️ Il y a DEUX plans dans l'écran Nutrition — ne pas les confondre

| | **Plan alimentaire journalier** | **Plan de repas IA** |
|---|---|---|
| Bloc | `#meal-plan`, en haut | `#meal-plan-ia`, plus bas |
| Calcul | **local, hors ligne, gratuit** | appel IA (Worker → Claude) |
| Contenu | 5-6 repas dérivés des macros | 4 repas/jour, jusqu'à 7 jours |
| Déclenchement | automatique | bouton « Générer » |
| Portions | oui (ft-v899) | oui (demandées dans le prompt) |
| Premium | non | semaine complète + régénérations illimitées |

*Le 18/08, cette confusion a failli me faire corriger le mauvais bloc.* Le document existe en partie
pour ça.

### 2.7 Le reste de l'écran

- **Journal alimentaire** : saisie réelle (`S.foodLog`), par repas, avec code-barres →
  **Open Food Facts** (gratuit, Nutri-Score et NOVA récupérés), photo d'étiquette, estimation IA,
  ou saisie à la main.
- **Suppléments** : créatine (dose, charge/entretien), whey (dose post-séance), avec les
  interactions connues (créatine + caféine).
- **Hydratation**, **régime alimentaire** (type + restrictions + allergies en texte libre).

---

## 3. Ce qui manque — les cinq trous, par ordre d'importance

### ⭐⭐⭐ 3.1 La nutrition ignore complètement l'entraînement

**C'est le trou le plus important, et le plus différenciant.** Aujourd'hui le plan est le même un jour
de repos et un jour de soulevé de terre lourd. Or l'app **sait déjà tout** :

| Ce que l'app connaît déjà | Ce qu'on n'en fait pas |
|---|---|
| `S.wkt` — séance en cours | rien |
| `S.sessions[].startHour` — l'heure des séances | rien |
| `sess.calories` — les calories dépensées | rien (le TDEE ne bouge pas) |
| `_calSessRegion()` — haut / dos / bas / tronc / full | rien |
| `S.discipline` + `_repartitionReps()` | rien côté nutrition |
| `plannedSession()` — séance annoncée | rien |

**Ce qu'on devrait en faire :**

- **jour d'entraînement vs repos** → glucides plus hauts les jours de séance, plus bas au repos
  (à calories hebdomadaires égales) ;
- **les repas pré et post ne devraient exister QUE les jours de séance**, et être placés **autour de
  l'heure réelle** de l'entraînement, pas à heure fixe ;
- **séance de jambes lourdes** → plus de glucides que « bras + épaules » ;
- **calories réellement dépensées** → proposer (jamais imposer) un ajustement.

⚠️ **Garde-fou** : la Constitution P21 interdit d'en faire une source de stress. Donc **proposer,
expliquer, ne jamais imposer** — et rester utilisable par quelqu'un qui ne veut pas y penser.

### ⭐⭐ 3.2 Aucune base d'aliments

Il n'y a **aucune** table d'aliments : seulement 25 phrases et une table de 40 motifs pour les
portions. Conséquences :

- **la variété est plafonnée** — 3 variantes écrites à la main, et c'est tout ;
- **chaque aliment nouveau est un risque** : il doit être ajouté à `_PORTIONS`, `_DIET_SWAPS` et
  `_ALLERGENES`, sinon un végan voit de la viande. *C'est exactement ce qui a été trouvé le 18/08 :*
  **« Thon » seul n'était couvert par aucune substitution, depuis toujours** ;
- **pas de fibres, pas de micronutriments** — donc rien à dire sur le fer, la B12, le calcium.

### ⭐⭐ 3.3 Le Journal et le Plan ne se parlent pas

On peut noter ce qu'on mange (`S.foodLog`) et on a un plan suggéré — **les deux s'ignorent**. On ne
sait pas « il te reste 40 g de protéines », ni « tu as suivi ton plan à 80 % cette semaine ».

### ⭐ 3.4 Les modes alimentaires n'ont pas de variantes

Kéto, low carb, paléo, méditerranéen ont chacun **un seul** plan figé. La rotation quotidienne
(ft-v900) ne couvre que les 5 plans d'objectif.

### ⭐ 3.5 Pas de notion de coût, de temps de préparation, ni de saison

« Saumon » tous les jours n'est ni tenable ni réaliste.

---

## 4. La base d'aliments — ce qu'il faut construire

### 4.0 ⭐⭐ DEUX BASES, PAS UNE — la distinction qui décide de tout

> Cette section est née de la confrontation avec la **note technique v1.0** (§9). Elle proposait
> d'embarquer **CIQUAL en entier** (3 484 aliments) ; je proposais une base **curatée** de ~300.
> **Les deux ont raison, pour deux usages différents** — et confondre les deux est la meilleure façon
> de rater la brique.

| | **Le JOURNAL** (« qu'est-ce que j'ai mangé ? ») | **Le GÉNÉRATEUR** (« qu'est-ce que je mange ? ») |
|---|---|---|
| Qui choisit | **la personne** | **l'application** |
| Ce qu'il faut | **couverture maximale** | **sûreté maximale** |
| Base | **CIQUAL entier** (3 484) + Open Food Facts | **sous-ensemble curaté** (~300) |
| Champs de sécurité | inutiles — elle sait ce qu'elle mange | `regimes` + `allergenes` **obligatoires** |
| Si un aliment manque | on ne le trouve pas → gênant | on ne le propose pas → **sans danger** |

**La raison est asymétrique et elle est simple** : quand la personne cherche « thon » dans son journal,
elle a le thon devant elle — aucune décision n'est prise à sa place. Quand l'app **compose** un repas,
elle décide pour quelqu'un qui a peut-être déclaré une allergie. Une base de 3 484 aliments dont les
champs `regimes`/`allergenes` seraient remplis automatiquement serait **impossible à relire**, donc
impossible à garantir.

👉 **On embarque donc CIQUAL en entier** (la note v1.0 a raison sur la volumétrie : ~400-450 Ko, ~100-130 Ko
compressés) **et on marque ~300 aliments comme « composables »** avec leurs champs de sécurité relus à
la main. Une seule table, deux usages, un seul fichier.

### 4.1 ⚠️ Open Food Facts et CIQUAL ne sont pas concurrents

L'app utilise **déjà** Open Food Facts, et c'est le bon choix **pour le Journal** : scanner un
code-barres, retrouver un **produit de marque**, son Nutri-Score et son groupe NOVA.

**Mais pour composer des repas, il faut des INGRÉDIENTS génériques**, pas des produits :
« riz basmati », pas « Riz Uncle Ben's 2 min ». OFF contient plus de 3 millions de produits, de
qualité inégale, et pèse plusieurs gigaoctets — inembarquable dans une app qui doit s'ouvrir
instantanément hors ligne (règle d'or #4).

### 4.2 La bonne source : CIQUAL (ANSES)

**CIQUAL** est la table officielle de composition nutritionnelle des aliments en France, publiée par
l'**ANSES**. Elle contient ~3 200 aliments **génériques** (crus et cuits), avec ~60 nutriments
chacun : macros, fibres, vitamines, minéraux. Elle est **gratuite**, téléchargeable en bloc, et c'est
la référence utilisée par les diététiciens français.

**C'est exactement ce qu'il faut** — et ça règle la question du « qui se met à jour » : on ne
synchronise pas en direct, on **régénère la table depuis CIQUAL avec un script**, comme
`docs/INVENTAIRE.md` est régénéré depuis le code (R27 : une table écrite à la main redevient fausse en
trois semaines).

```
CIQUAL (fichier officiel)  ──►  tools/aliments.py  ──►  aliments.js  (~300 aliments retenus)
                                       │
                                       └─ filtre : on ne garde que les aliments COURANTS
                                          et on ajoute nos champs à nous (rôle, régimes,
                                          allergènes, portion) — voir 4.4
```

⚠️ **On garde les 3 484 pour le Journal**, mais seuls ~300 portent le drapeau `composable` et les
champs de sécurité relus à la main (voir §4.0). *Une base entière dont on remplirait les allergènes
automatiquement serait impossible à garantir.*

### 4.3 Le schéma d'un aliment

```js
{
  id:      'riz_basmati',              // stable, sert de clé (jamais le nom — R13/famille 13)
  nom:     'Riz basmati',
  alias:   ['riz', 'riz blanc'],       // pour retrouver l'aliment dans un texte existant
  role:    'feculent',                 // proteine | feculent | legume | fruit | lipide | laitier | boisson
  kcal100: 350, prot100: 7.5, carbs100: 78, fat100: 0.6, fibres100: 1.3,

  // ── sécurité : ces deux champs décident de tout ──
  regimes:    ['vegan','vegetarien','pescetarien','halal','casher','sansporc','sansboeuf','sansgluten','sanslactose'],
  allergenes: [],                      // gluten | lactose | oeuf | poisson | fruits_de_mer
                                       // | fruits_a_coque | arachide | soja

  // ── portion ──
  portion: { base: 80, pas: 10, min: 40, max: 200, unite: 'g' },
  portionFixe: 0,                      // > 0 pour les légumes/fruits (portion standard)

  // ── confort (optionnels, arrivent plus tard) ──
  cout: 1,                             // 1 = économique … 3 = cher
  prep: 15,                            // minutes de préparation
  saison: [],                          // [] = toute l'année
  remplacePar: ['quinoa','pates']      // équivalents de même rôle
}
```

**⚠️ Le champ `regimes` est une LISTE BLANCHE, pas une liste noire.** Un aliment n'est proposé à un
végan que s'il porte explicitement `vegan`. Un aliment oublié devient **invisible**, jamais dangereux.
*C'est l'inverse du mécanisme actuel*, où un aliment non listé dans les substitutions passe à travers —
et c'est exactement comme ça que « Thon » est passé pendant des mois.

### 4.4 Le modèle de repas

```js
{
  id:     'dej_feculent_proteine_legume',
  moment: 'dejeuner',                  // petitdej | collation | dejeuner | diner | pre | post
  nom:    'Assiette complète',
  slots: [                             // les « cases » à remplir
    { role:'proteine', part:0.40 },
    { role:'feculent', part:0.45 },
    { role:'legume',   part:0.15 }
  ],
  note:   'Repas complet',
  modes:  ['normal','paleo','mediterraneen'],   // pas keto (trop de féculents)
  minKcal: 400                                   // en dessous, ce modèle n'a pas de sens
}
```

**Un repas = un modèle + un tirage d'aliments compatibles.** La variété ne vient plus de phrases
écrites à la main mais de la **combinatoire** : 6 protéines × 6 féculents × 8 légumes = 288 déjeuners
possibles, sans écrire une seule phrase de plus.

### 4.5 Le générateur, en dix lignes

```js
function composerRepas(modele, kcalRepas, jour, profil){
  const choix = modele.slots.map((slot, i) => {
    const possibles = ALIMENTS
      .filter(a => a.role === slot.role)
      .filter(a => estCompatible(a, profil))        // régimes + allergies + aliments à éviter
      .filter(a => !profil.recemment.includes(a.id)); // pas le même que ces 2 derniers jours
    if(!possibles.length) return null;               // ⚠️ on ne force JAMAIS
    // déterministe : même jour = même repas, jour suivant = repas différent
    return possibles[(jour * 7 + i * 31) % possibles.length];
  });
  if(choix.includes(null)) return null;              // on rend « je ne sais pas » (R29)
  return choix.map((a, i) => ({
    aliment: a,
    grammes: grammesPour(a, kcalRepas * modele.slots[i].part)
  }));
}
```

**Quatre propriétés qui comptent :**

1. **Déterministe** — même jour, même repas. Il ne change pas à chaque affichage.
2. **Aucun réseau, aucune IA** — ça marche à la salle, en avion, gratuitement.
3. **Il peut rendre « je ne sais pas »** — si aucun aliment ne convient (allergies multiples + végan +
   kéto), on n'invente pas : on le dit (R29).
4. **Anti-répétition** — on évite ce qui a été proposé les jours précédents.

### 4.6 La compatibilité — la seule fonction qui doit être parfaite

```js
function estCompatible(aliment, profil){
  // ① le régime déclaré : LISTE BLANCHE
  if(profil.diet && !aliment.regimes.includes(profil.diet)) return false;
  // ② les restrictions : toutes doivent être satisfaites
  for(const r of profil.restrictions) if(!aliment.regimes.includes(r)) return false;
  // ③ les allergènes déclarés : aucune tolérance, aucune exception
  for(const a of profil.allergenes) if(aliment.allergenes.includes(a)) return false;
  // ④ le texte libre « aliments à éviter » : on compare sur le nom ET les alias
  if(profil.aEviter.some(t => aliment.alias.concat(aliment.nom).some(n => _normAli(n).includes(t)))) return false;
  return true;
}
```

⚠️ **Cette fonction doit être testée sur la base ENTIÈRE, pour chaque combinaison de régime.** Pas sur
un échantillon : sur les 300 aliments. C'est bon marché et c'est le seul endroit où une erreur se paie
sur la santé de quelqu'un.

---

## 5. L'adaptation au style d'entraînement

**C'est ce qui manque le plus, et l'app a déjà toutes les données.**

### 5.1 Jour de séance ou jour de repos

```js
const seanceAujourdhui = !!(S.wkt && S.wkt.exs.length)          // en cours
   || (S.sessions[0] && S.sessions[0].date === today())          // déjà faite
   || (plannedSession() && plannedSession().days === 0);         // annoncée
```

À **calories hebdomadaires égales**, on déplace des glucides des jours de repos vers les jours de
séance (« carb cycling » léger, ±15 %, jamais plus). Les protéines ne bougent pas.

### 5.2 L'heure réelle de la séance

`S.sessions[].startHour` existe et n'est **jamais utilisé** côté nutrition. Il permet de :

- ne proposer un **pré-entraînement** que 1 à 2 h avant l'heure habituelle ;
- ne proposer un **post-entraînement** que les jours de séance ;
- adapter le petit-déjeuner à quelqu'un qui s'entraîne à 7 h (≠ 19 h).

### 5.3 Le type de séance

`_calSessRegion()` classe déjà chaque séance (haut / dos / bas / tronc / full). Une séance **bas du
corps** ou **full body** est nettement plus coûteuse qu'une séance de bras : +10 % de glucides ce
jour-là est défendable et explicable.

### 5.4 La discipline

`S.discipline` + `_repartitionReps()` (déjà envoyés à Milo) disent si la personne travaille en
**force** (séries lourdes, longues récups) ou en **volume**. Le premier tire vers les lipides et la
créatine, le second vers les glucides.

⚠️ **Et le rappel du 16/08 vaut ici aussi** : ces chiffres décrivent une **personne**, pas une norme.
On adapte, on **ne reproche jamais** l'écart.

---

## 6. Ce qu'il ne faut PAS faire — pièges déjà payés

| ⛔ | Pourquoi |
|---|---|
| **Générer le plan quotidien par IA** | Coûte à chaque jour, ne marche plus sans réseau (règle d'or #4), et non déterministe. Le « Plan de repas IA » existe déjà, séparément, sur bouton. |
| **Embarquer Open Food Facts en entier** | 3 M de produits de marque, plusieurs Go. C'est la source du **Journal** (code-barres), pas celle des repas. |
| **Ajouter un aliment sans le déclarer dans les régimes ET les allergènes** | C'est le bug d'Emma (02/08) et celui du « Thon » (trouvé le 18/08, présent depuis des mois). |
| **Écrire les quantités en pièces** | « Œufs (3) » devient « Tofu (3) » après substitution. |
| **Tester une seule variante** | Depuis ft-v900 le plan tourne : un test qui ne voit qu'un jour laisserait passer une variante dangereuse. Le test parcourt **40 jours × 6 objectifs**. |
| **Utiliser le NOM comme clé** | Famille 13 de `BUGS.md` — un renommage casse tout. Les aliments ont un `id`. |
| **Inventer une répartition de macros pour paléo/méditerranéen** | Ce sont des choix d'aliments, pas de macros. Un faux-précis est pire qu'un silence. |
| **Rendre la nutrition bloquante** | Constitution **P21**. Elle est optionnelle du début à la fin. |

---

## 7. Plan de livraison — par briques, testables une par une

> ⚠️ **Ce tableau a vieilli — l'état à jour est dans `docs/BRIEF-NUTRITION.md`** (créé le 19/08 pour
> une instance qui reprend le chantier). La brique **0 est livrée**, six versions sont passées depuis
> l'écriture de ce document, et la frontière **cerveau/cervelet** a été décidée entre-temps : elle
> change qui a le droit de composer une assiette.

| # | Brique | Contenu | Dépend de |
|---|---|---|---|
| **0** | ✅ **FAITE — ft-v907 (18/08/2026).** La provenance figée | `S.foodLog` porte `source` / `sourceId` / `sourceVersion` / `quantite` / `unite` ; les macros deviennent un **cache**, jamais la vérité. ⚠️ **À faire AVANT la base** : chaque jour qui passe ajoute des entrées sans provenance, et on ne pourra pas les reconstruire. | — |
| **1** | **La base d'aliments** | `tools/aliments.py` (extraction CIQUAL) + `aliments.js` (3 484 aliments, dont ~300 marqués `composable` avec leurs champs de sécurité) + le test de compatibilité sur la base **entière** | 0 |
| **2** | **La recherche** | index inversé + **fréquence d'usage personnelle d'abord** (le plus rentable, note v1.0 §7) | 1 |
| **3** | **Le générateur** | `composerRepas()` + les modèles de repas ; branché **derrière** l'existant (on compare les deux sorties avant de basculer) | 1 |
| **4** | **Bascule** | `getMeals()` utilise le générateur ; les 25 phrases deviennent un **repli** si la base ne rend rien | 2 |
| **5** | **Jour de séance** | glucides ± selon séance/repos, à calories hebdomadaires égales | 4 |
| **6** | **Heure de séance** | pré/post uniquement les jours de séance, placés autour de l'heure réelle | 5 |
| **7** | **Journal ↔ Plan** | « il te reste X g de protéines », suivi de l'écart | 0, 4 |
| **8** | **Confort** | coût, temps de préparation, saison, anti-répétition sur 7 jours | 4 |

**Règle de méthode** (`docs/PROCESSUS-DEVELOPPEMENT.md`) : une brique à la fois, testée et validée
avant la suivante. ⚠️ **La brique 0 passe devant tout le reste** : c'est la seule dont le retard est
irrattrapable — une entrée de journal écrite sans sa provenance ne pourra jamais la retrouver.
Les briques 0 et 1 ne changent **rien** pour l'utilisateur — c'est voulu : on construit la
fondation et on la vérifie avant de brancher quoi que ce soit.

---

## 8. Les questions encore ouvertes

1. **Le poids de la base.** 300 aliments ≈ 40-60 Ko. À vérifier sur l'ouverture instantanée
   (règle d'or #4) — probablement négligeable, mais **à mesurer**, pas à supposer.
2. **La fréquence de mise à jour de CIQUAL.** La table bouge rarement (tous les 1-2 ans). Régénérer à
   la main lors d'une publication suffit ; automatiser serait de la sur-ingénierie (R19).
3. **Les recettes.** Un « repas » reste une liste d'aliments avec des grammes. Faut-il aller jusqu'à la
   recette (étapes, temps) ? **Position par défaut : non** — ce n'est pas le métier du produit, et
   Michel a déjà tranché ce type de question en refusant les fausses précisions.
4. **Le lien avec Milo.** Le plan du jour n'est pas dans son contexte aujourd'hui. À classer face au
   garde-fou des données (R4a) : transmis, ou exclu **avec sa raison**.
5. **Les micronutriments.** CIQUAL les fournit gratuitement (fer, B12, calcium, vitamine D). Tentant —
   mais ⚠️ dès qu'on affiche un micronutriment, on entre dans un domaine où l'app doit **renvoyer au
   médecin** et jamais interpréter (R10). À traiter comme le bilan sanguin, ou pas du tout.

---

## 9. 🔍 Audit de la **note technique v1.0** (instance Claude « analyse », 18/08/2026)

> Michel a fait rédiger en parallèle une *« Base alimentaire locale — note technique v1.0 »* par une
> autre instance, **sans accès au code**. Elle le dit elle-même et **demande explicitement la
> contradiction**. Voici la vérification, faite dans le code.

### ✅ Ce qui est VÉRIFIÉ et adopté

| Sa proposition | Vérification |
|---|---|
| **Cache produits 30 jours** dans `food-health.js` — *sa confiance : faible* | ✅ **VRAI** : `cacheTtlDays: 30`, clé `fh:cache:<code>`. Confiance à relever au maximum. |
| **CIQUAL et Open Food Facts sont complémentaires**, pas concurrents | ✅ Exact, et c'est le §4.1 ici. |
| **Cascade de résolution** (CIQUAL local → cache produits → OFF → saisie manuelle) | ✅ **Adoptée telle quelle.** C'est la bonne architecture, elle recouvre l'existant. |
| **§8 — la provenance figée dans chaque entrée du journal** | ✅ **Le meilleur apport de la note, et le trou est réel** : `S.foodLog` stocke aujourd'hui `{date, meal, name, kcal, prot, carbs, fat, ts}` — **aucune source, aucun identifiant, aucune version**. Adopté intégralement. |
| **§7 — la couche de recherche est le vrai coût** | ✅ Point que je n'avais pas traité. Et son conseil « **commencer par la fréquence d'usage personnelle** » est le bon : ~100-200 aliments récurrents couvrent l'essentiel. |
| **Format compact** (tableau de tableaux, sentinelles pour « non déterminé ») | ✅ Adopté. Le §6.1 (un zéro silencieux dans une base nutritionnelle) est un vrai risque. |
| **Volumétrie ~400-450 Ko / ~100-130 Ko gzippés** | ⚪ Non vérifiable ici (pas d'accès réseau). Sa méthode de calcul est explicite et plausible. **À mesurer sur le fichier réel**, comme elle le dit. |

### ⛔ Ce qui est FAUX, vérifié dans le code

**① « Sortir Milo de la chaîne de saisie alimentaire. »**
**Milo n'y est pas.** La conversation (`coach`) n'intervient à aucun moment dans la saisie. Ce qui
existe, ce sont **trois actions distinctes**, toutes sur bouton explicite :

| Action | Ce qu'elle fait | Modèle |
|---|---|---|
| `readBarcode` | lit les **chiffres** d'un code-barres sur une photo → puis Open Food Facts, **gratuit** | vision |
| `foodLabel` | lit une **étiquette** nutritionnelle | vision |
| `estimateFood` | estime les macros d'une **description libre** | texte |

Elles sont déjà **plafonnées à 25 usages gratuits** (`FOOD_AI_FREE_LIMIT`), puis mur premium. La
prémisse « le volume de saisie est corrélé au coût API » est donc **déjà fausse aujourd'hui**.

**② « Chaque saisie alimentaire est une mutation de moins » (son §9, bénéfice indirect).**
**Structurellement nul, pas seulement non quantifié.** `foodLog` est **exclu du contexte de Milo** —
c'est écrit et classé dans le garde-fou des données (`tests/donnees/donnees-milo.json` : *« volumineux
à chaque message, les macros cibles sont déjà transmises »*). **Une saisie alimentaire ne touche donc
pas le prompt et n'invalide aucun cache.** Le raisonnement était bon, la donnée manquait.

**③ « Le cache Sonnet est déficitaire : 3,03 écritures pour un seuil de 1,39. »**
La note reprend un chiffre déjà **corrigé le 17/08** (`docs/AUDIT-CONTEXTE-MILO.md` §6) :
- le **seuil de 1,39 est mal calculé** — il compte l'écriture entière comme un surcoût, alors que sans
  cache ce texte serait payé **1× de toute façon**. Surcoût réel **0,25×**, économie **0,9×** par
  lecture → seuil **0,28** (cache 5 min) et **1,11** (cache 1 h). Il est **4 à 5× trop sévère** ;
- et le ratio 3,03 est une **moyenne** qui inclut la période de construction. **En régime établi
  depuis le 08/08 : ratio 1,14 : 1, et le cache RAPPORTE** (−11 %).

*Ce n'est pas une faute de la note* : elle cite honnêtement « chiffre repris d'une analyse
antérieure ». Mais l'analyse antérieure était fausse, et il ne faut pas construire une décision
dessus.

### 🤝 Le désaccord qui n'en était pas un

Elle recommande d'embarquer **CIQUAL en entier** ; je proposais **~300 aliments curatés**.
**Les deux sont justes, pour deux usages différents** — voir **§4.0**, qui est né de cette
confrontation. Le Journal veut de la **couverture**, le générateur veut de la **sûreté**.

### 📌 Ses « points à trancher », avec ce que le code permet de dire

| # | Sa question | Réponse |
|---|---|---|
| 1 | Licence CIQUAL | Non vérifiable ici. **À faire avant publication** — l'attribution ANSES doit apparaître dans l'app. |
| 2 | Micronutriments embarqués ? | **Non pour l'instant.** Pas pour le volume : parce qu'afficher un micronutriment fait entrer dans un domaine où l'app doit renvoyer au médecin (R10). Voir §8.5. |
| 3 | Table figée ou téléchargeable ? | **Figée dans le bundle.** Règle d'or #4 (ouverture instantanée hors ligne) et versionnement propre. Régénération par script à chaque publication. |
| 4 | Stratégie de portions | **Déjà tranchée et livrée** (ft-v899, §2.5) : table maison, grammes, jamais de pièces. Sa remarque « cette table est une donnée Force Tracker, pas CIQUAL » est **juste** — elle est versionnée avec le code. |
| 5 | Cache produits `food-health.js` | ✅ Vérifié ci-dessus : 30 jours. |

---

## 🔗 Où va le reste

| Sujet | Document |
|---|---|
| Le **pourquoi** de la nutrition, les garde-fous éthiques | `docs/NUTRITION-PHILOSOPHIE.md` |
| Les principes stables de comportement | `CONSTITUTION-MILO.md` (P21) |
| Les règles de construction | `docs/REGLES-ARCHITECTURE.md` |
| Les familles de bugs déjà rencontrées | `BUGS.md` (familles 12ter, 13) |
| Le langage métier commun | `docs/MODELE-METIER.md` |
| L'état du projet | `docs/CONTEXTE-ACTUEL.md` |

---

*À compléter au fil des briques. Chaque chiffre de ce document a été lu dans le code le 18/08/2026 ;
s'il ne correspond plus, c'est le code qui fait foi — et c'est ce document qu'il faut corriger.*
