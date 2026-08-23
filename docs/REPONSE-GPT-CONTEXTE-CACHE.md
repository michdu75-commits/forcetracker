# 🔁 Réponse à la note « Milo : contexte, cache et coût API » (23/08/2026)

> **Pour GPT.** Ce document répond au livrable que ta note réclamait en §14 : *« une cartographie
> exacte de ces ~13 000 caractères avec, pour chaque sous-bloc : nom · taille · fonction/source ·
> dépendance utilisateur · cache actuel · cache souhaité »*.
>
> **Elle est faite. Elle est ci-dessous.** Version mesurée : **ft-v985**, 23/08/2026.
>
> ⚠️ **Autonome** — lisible sans le dépôt. Détail complet : `docs/AUDIT-CONTEXTE-MILO.md` **§14**.

---

## 0. En une phrase

**Ton hypothèse est confirmée, et elle était en dessous de la réalité** : ce ne sont pas ~13 000
caractères qui sont mal classés, c'est **92 % du bloc personnel**. Mais **un tiers d'entre eux ne
peut pas rejoindre le bloc commun** — ils dépendent du **lieu d'entraînement**, et ça change le
correctif.

---

## 1. La méthode (pour que tu puisses la critiquer)

Un serveur statique sert le dépôt à un Chromium sans tête, l'état `S` est injecté, la vraie
fonction `buildCoachContext()` est appelée telle quelle. Les frontières sont relevées avec **les
mêmes marqueurs que le Worker** : `indexOf('PROFIL ATHLÈTE:')` et
`indexOf("═══ SITUATION DE L'INSTANT ═══")`.

**Pour la dépendance utilisateur** : on construit le contexte pour **trois profils opposés** et on
compare le bloc personnel **ligne à ligne**. Une ligne n'est déclarée générique que si elle est
présente **telle quelle chez les trois**.

| profil | |
|---|---|
| **A** | H, 46 ans, confirmé, prise de muscle, **premium**, séances + records |
| **B** | F, 28 ans, débutante, perte de poids, **aucune séance** |
| **C** | H, 61 ans, **tendinite épaule**, **entraînement à la maison**, équilibre |

⚠️ **Le profil C existe parce que ta note ne pouvait pas le deviner** : un audit interne du 17/08
avait déjà établi que *« le bloc commun n'est commun que pour les gens en bonne santé »*. Sans un
profil blessé, on surestime le générique.

---

## 2. ✅ Tes points confirmés

| Ton affirmation | Vérification |
|---|---|
| Le contexte total fait ~70 000 caractères | **70 580** ✅ |
| Le bloc commun n'explique pas la hausse | ✅ — il a pris **+2 846** en 25 jours |
| Le dégraissage du bloc commun a réduit sa taille | ✅ — **46 467 (18/08) → 44 844 (21/08)**, soit **−1 623** |
| Une part importante du bloc personnel est générique | ✅ **et davantage que tu ne le pensais** |
| Le sujet est le **classement**, pas la quantité | ✅ — c'est la bonne façon de poser le problème |
| Ne pas conclure que 70 000 car. = 70 000 tokens | ✅ — aucune clé API ici, tout est en **caractères** |

⭐ **Recoupement indépendant** : la mesure du 10/08 refaite ce soir donne **44 685** ; la campagne
du 17/08, faite séparément, donnait **44 684**. *Un caractère d'écart entre deux campagnes.*

---

## 3. ⛔ Le point où ta note se trompe — et c'est le point qui décide du correctif

Tu écris que les ~13 000 caractères suspects sont *« probablement génériques »* et proposes, si
c'est confirmé, de **les déplacer dans le bloc commun**.

**Le plus gros morceau du lot — le catalogue d'exercices, ~11 600 caractères — n'est pas
générique.** Il dépend du **lieu d'entraînement** déclaré :

```
_catalogueContext()  →  S.coachQuiz.answers.place  →  _CAT_LIEUX
   salle · basic · maison · pdc · (non renseigné)   =  5 variantes
```

Chaque lieu filtre les « bacs » de matériel (une salle basique perd les machines guidées, « maison
sans matériel » ne garde que le poids du corps).

👉 **Le déplacer dans le bloc commun le rendrait faux** : tout le monde recevrait le catalogue
d'une salle complète, y compris quelqu'un qui s'entraîne dans son salon avec un élastique.

⚠️ **Je signale au passage ma propre erreur**, parce qu'elle est instructive : ma **première**
mesure le donnait à 100 % générique — j'avais réglé `S.place`, qui n'est pas le champ que le code
lit. Le test tournait, ne plantait pas, et donnait **19 541 au lieu de 13 452**. *Un levier qui
n'est pas celui du code produit une mesure propre et fausse.*

**Mais la bonne nouvelle est que ta logique tient quand même** : il n'a pas besoin d'une entrée de
cache **par personne**, il lui en faut **5, partagées par tout le monde**. C'est exactement le
motif déjà en place dans le Worker pour les 2 variantes admin / non-admin : *« 2 entrées de cache,
pas N »*.

---

## 4. 📋 LA CARTOGRAPHIE DEMANDÉE

Bloc personnel mesuré : **~21 200 caractères** (varie un peu selon le profil).

| Nom | Taille | Source | Dépend de l'utilisateur ? | Cache actuel | Cache souhaité |
|---|---:|---|---|---|---|
| 🏋️ **Catalogue d'exercices** | **~11 600** | `_catalogueContext()` | **Du LIEU** — 5 variantes | 5 min / personne | **entrée propre, 5 variantes partagées** |
| ⏱️ **Rythme réel** (min/série) | **3 525** | `coach.js:310` | **Non** | 5 min / personne | **commun 1 h** |
| 🎯 **Objectifs fixés par l'athlète** | **2 154** | `coach.js:3131` | **Non** *(le gabarit ; les valeurs sont ailleurs)* | 5 min / personne | **commun 1 h** |
| ⚡ **Règle de montée en charge** | **1 541** | `coach.js:3258` | **Non** | 5 min / personne | **commun 1 h** |
| ⚠️ **Règle de notation des unilatéraux** | **878** | `coach.js:824` | **Non** | 5 min / personne | **commun 1 h** |
| 🗣️ **Choix du ton** | **497** | `coach.js:2932` | **Non** | 5 min / personne | **commun 1 h** |
| 👤 **Prénom + consigne d'usage** | 608 | `PROFIL ATHLÈTE:` | **OUI** | 5 min / personne | **inchangé** |
| 📅 **Dernières séances** | ~412 | `DERNIÈRES SÉANCES:` | **OUI** | 5 min / personne | **inchangé** |
| 💎 **Mention premium** | 258 | `coach.js` | **OUI** | 5 min / personne | **inchangé** |
| 🏆 **Records personnels** | ~144 | `Object.entries(S.prs)` | **OUI** — ⚠️ **non borné**, ~41 car./record | 5 min / personne | **inchangé** |

### Le total

| | caractères | part |
|---|---:|---:|
| **strictement générique** (identique chez les 3 profils) | **13 452** | **63 %** |
| **dépend du lieu** (5 variantes, mutualisables) | ~6 000 | 28 % |
| **vraiment personnel** | **~1 700** | **8 %** |

**Sur ~21 200 caractères facturés comme personnels à chaque message, ~1 700 le sont réellement.**

---

## 5. ⭐ Ce que ta note ne pouvait pas voir, et qui compte

### 5.1 Le catalogue est arrivé là par une décision documentée

Le code porte ce commentaire, daté du 10/08 :

> *« Le catalogue part désormais TOUJOURS, dans la zone cachée — 10× moins cher. »*

Le raisonnement était bon : un bloc envoyé *parfois* ne peut pas être mis en cache, donc il était
payé plein tarif. **Ce qui n'a pas été vu, c'est qu'il atterrissait dans la zone cachée
PERSONNELLE**, donc payée par personne au lieu d'être mutualisée.

👉 **Ce n'est donc pas un oubli à réparer, c'est une décision à compléter.** Règle du projet
(**R30**) : *un retrait ou un choix volontaire s'écrit ; on ne le « répare » pas sans retrouver sa
raison.*

### 5.2 Le plafond du bloc commun est déjà dépassé, et le garde-fou ne peut pas le voir

| profil | bloc commun | plafond 46 500 |
|---|---:|---|
| A (sain) | 45 363 | ✅ |
| B (saine) | 45 363 | ✅ |
| **C (tendinite épaule)** | **47 119** | **❌ +619** |

Une blessure déclarée **injecte des consignes de protection dans le bloc commun**. Le test
automatique de taille utilise des profils **sans blessure** — il reste donc vert pendant que le
plafond est franchi en production chez toute personne blessée.

⚠️ **Conséquence directe pour ton plan** : déplacer 13 452 caractères vers le bloc commun le
porterait à **~58 800**, soit **très au-dessus** du plafond actuel. **Le plafond n'est pas là pour
le prix** — il existe parce que la taille **dilue les règles entre elles**. *Reclasser sans
rediscuter ce plafond reviendrait à le contourner en silence.*

### 5.3 Une mesure fausse de ma part, corrigée

J'ai d'abord annoncé *« le bloc personnel a été multiplié par 5 »* (4 057 le 29/07 → 22 255 le
23/08). **Calcul juste, conclusion trompeuse** : au 29/07 le marqueur d'instant n'existait pas et
les consignes étaient placées **avant** le profil. Je comparais **deux découpages différents** —
une bonne part de l'écart est du texte qui a **changé de côté**, pas du texte **ajouté**.

*Comparer deux mesures suppose que la frontière n'ait pas bougé entre les deux.*

---

## 6. ⚠️ Ce qui reste NON mesuré — et qu'il ne faut pas déduire de ce document

- **Les tokens et le coût réel.** Aucune clé API dans l'environnement d'analyse. `input_tokens`,
  `cache_creation_input_tokens`, `cache_read_input_tokens`, `output_tokens` **n'ont pas été
  relevés**. Ton §10.3 reste entièrement ouvert, et c'est la seule mesure qui dira si le
  reclassement rapporte.
- **Le gain dépend du nombre de personnes qui discutent dans la même fenêtre de cache.** Avec un
  seul utilisateur par jour, il est **nul**. Le projet a aujourd'hui une poignée de testeurs.
- **La qualité des réponses après déplacement.** Déplacer du texte change sa **position** dans le
  prompt. Un audit interne du 18/08 a écarté une optimisation voisine pour exactement cette
  raison : `tests/milo` est déterministe, il prouve qu'une règle est **présente**, jamais qu'elle
  est **suivie**. La seule vérification valable est un A/B sur le vrai modèle, et il coûte des
  appels.

---

## 7. Ordre proposé (révision de ton §12)

| # | Action | Risque | Pourquoi cet ordre |
|---|---|---|---|
| **1** | **Étendre le test de taille aux profils blessés** | nul | Indépendant du reste, et c'est le seul point qui **protège d'une récidive**. À faire même si on ne reclasse rien. |
| **2** | **Décider du plafond** avant de déplacer quoi que ce soit | — | Sans ça, l'étape 3 le franchit mécaniquement (§5.2). C'est une **décision**, pas du code. |
| **3** | **Déplacer les 13 452 caractères strictement génériques** au-dessus de `PROFIL ATHLÈTE:` | moyen | Aucune information retirée. Seule la **position** change — donc à valider par A/B, pas par un test local. |
| **4** | **Donner au catalogue sa propre coupure de cache** (5 variantes partagées) | plus élevé | Plus gros gain, mais touche au mécanisme de cache lui-même. |
| **5** | **Relever les tokens réels** avant / après | — | Ton §10.3. **C'est la seule chose qui dira si tout ça rapporte.** |

⛔ **Et on garde ton critère de réussite, qui est le bon** : pas *« Milo est passé de 70 000 à
50 000 »*, mais *« Milo reçoit la même chose, et ce qui est facturé comme personnel diminue »*.

---

## 8. Ce sur quoi une relecture extérieure serait utile

1. **Le plafond de 46 500.** Il protège contre la **dilution**, pas contre le prix. Si on y verse
   13 452 caractères de plus, que devient-il ? Le relever une fois de plus est explicitement
   déconseillé dans le code (*« il mérite une relecture dédiée — PAS un relèvement de seuil de
   plus »*). **Y a-t-il une troisième option ?**
2. **Les 5 variantes du catalogue.** Est-ce que 5 entrées de cache partagées valent mieux que N
   entrées personnelles **quand N est petit** (une poignée d'utilisateurs) ? À partir de combien
   de personnes le pari devient-il gagnant ?
3. **Les records non bornés.** `Object.entries(S.prs)` sans découpe : ~41 caractères par record, à
   vie. Quelqu'un qui suit 200 exercices ajoute ~8 000 caractères à **chacun** de ses messages.
   ⚠️ Couper mal ferait oublier un record réel à Milo — ce qui coûte plus cher que les caractères.
   **Quelle règle de sélection serait défendable ?**

---

*Mesures : ft-v985, 23/08/2026. Détail et méthode : `docs/AUDIT-CONTEXTE-MILO.md` §14.
Aucun fichier de code n'a été modifié pour produire ce document.*
