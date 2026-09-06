# 🔍 Audit — pourquoi Milo prescrit une charge que l'app conteste dans la seconde qui suit

> **Créé le 06/09/2026**, à la demande de Michel (spécification *« Cas réels découverts le
> 06/09/2026 — Gardien, prescription et modification relative d'une séance »*).
>
> ⛔⛔ **CE DOCUMENT NE CORRIGE RIEN, ET C'EST LA CONSIGNE.** Son §30 le dit mot pour mot :
> *« Ne corrige rien sur la seule base de ces captures avant d'avoir identifié le pipeline exact
> responsable. »* **Aucun fichier de l'application n'a été modifié.** Ce qui suit est mesuré dans
> le code, reproduit au chiffre près, et s'arrête là où commence l'arbitrage de Michel.

---

## 0. Le cas réel, tel qu'il s'est produit

```
Dernière séance (développé couché)      Prescription de Milo     Alerte de l'app
  95 × 3                                  100 × 3                  3×3 à 100 kg = 93 % du
  95 × 3                                  100 × 3                  1RM estimé (108 kg)
  99 × 3                                  100 × 3                  tenable sur UNE série max,
                                                                   pas sur 3 — viser ~95 kg
```

Puis, après *« allège-moi un peu tout ça »* : `90 × 3 × 3`, **et une baisse sur tous les autres
exercices**.

---

## 1. La règle est identifiée, et elle est reproduite au chiffre près

**Elle vit dans `log.js:2127`, `_intensiteDefauts(nom, sets)`** — livrée en **ft-v980** (23/08/2026),
née d'un cas de Michel lui-même (*« comment il a pu déduire que je pouvais faire 3 séries de 5 à
95 ? »*).

Le calcul, en trois lignes :

| Étape | Formule | Constante | Valeur |
|---|---|---|---|
| e1RM de l'exercice | `S.prs[nom].rm1` | — | **108 kg** |
| charge d'**une** série maximale à 3 reps | `rm1 × (1,0278 − 0,0278 × reps)` (Brzycki **inversée**) | — | **102,00 kg** |
| plafond pour **plusieurs** séries | `× _INT_TENUE` | `0,93` (`log.js:2044`) | **94,86 kg** |
| seuil de déclenchement | `plafond × 1,02` (marge, on n'ergote pas sur 500 g) | — | **96,75 kg** |
| conseil affiché | `arrondi(plafond) au demi-kilo` | — | **« viser ~95 kg »** |
| pourcentage affiché | `100 × 100 / 108` | — | **93 %** |

👉 ***Les trois nombres de la capture (93 %, 108 kg, ~95 kg) sortent exactement de cette
fonction.*** Il n'y a aucune ambiguïté sur l'origine de l'alerte, et aucune autre règle n'est
impliquée.

---

## 2. ⚠️ Trois choses différentes s'appellent « le Gardien » — et ce n'est PAS celle qu'on croit

C'est la première chose à corriger avant toute discussion, parce que trois personnes qui parlent
du « Gardien » peuvent parler de trois mécanismes qui n'ont **aucun code en commun** :

| Nom dans le code | Fichier | Rôle | Concerné par ce cas ? |
|---|---|---|---|
| `_gardienRules` / `_gardienZones` | `coach.js:2940-2988` | **Sécurité / blessures**, injecté **EN AMONT** dans le prompt | ❌ non |
| `_gardienSortie` | `coach.js:4357` | **Constitution**, relit le TEXTE de Milo avant affichage | ❌ non |
| **`_intensiteDefauts`** | **`log.js:2127`** | **Contrôle d'INTENSITÉ**, arithmétique, tourne sur les charges | ✅ **c'est lui** |

⛔ Conséquence pratique : **chercher la cause dans `_gardien*` ne mène nulle part.** Le contrôle
d'intensité n'a jamais fait partie du Gardien ; il a seulement fini par lui ressembler à l'écran.

---

## 3. Réponses aux 12 questions du §30

### 3.1 — Comment le contrôle calcule ses alertes de charge
Voir §1. Une seule fonction, trois constantes (`_INT_TENUE`, `_INT_LOURD`, `_INT_REPOS`), aucune
IA, aucun appel réseau.

### 3.2 — La règle exacte qui a produit l'alerte
`log.js:2145-2153`, branche `if(p.kg > plafond*1.02)`. Le message *« tenable sur UNE série max,
pas sur N »* n'est émis **que si `p.n >= 2`** — c'est-à-dire quand la même charge revient sur
plusieurs séries. Un `1×3 à 100 kg` aurait produit une autre phrase (*« au-dessus de ton maximum
estimé pour 3 reps »*), et en l'occurrence **pas d'alerte du tout** (100 < 102).

### 3.3 — D'où vient le `1RM estimé = 108 kg`
De `S.prs['Développé Couché'].rm1`, écrit par `log.js:4084` :

```js
const rm = bz(s.kg, s.reps);          // Brzycki : kg × 36 / (37 − reps)
if(!cur || rm > cur.rm1) S.prs[ex.name] = {kg:s.kg, reps:s.reps, rm1:rm, date:sess.date};
```

⭐⭐ **C'est un record MONOTONE : il ne descend jamais.** Vérifié numériquement :

| Série | Brzycki | Effet sur le record |
|---|---|---|
| `105 × 2` (ancienne) | **108,00** | ✅ c'est le record actuel |
| `99 × 3` (récente) | 104,82 | ❌ ne remplace pas — 104,82 < 108 |
| `95 × 3` (récente) | 100,59 | ❌ |

👉 ***Le dénominateur de l'alerte est le meilleur de tous les temps, jamais la forme du moment.***

⚠️ **Et c'est l'inverse de l'intuition** : si le contrôle avait employé la forme récente
(e1RM 104,8), le plafond serait tombé à **92,07 kg** et le 100 kg serait à **95 %**. *L'alerte
aurait été plus SÉVÈRE, pas plus douce.* Ce point est important : on ne peut pas expliquer ce faux
positif présumé par « le 1RM est trop vieux ».

### 3.4 — L'ordre des séries historiques est-il utilisé ?
**Par Milo : OUI.** Depuis ft-v1038, chaque séance lui arrive numérotée, avec le type, le RIR et
les annotations (`coach.js:3290-3303`) :
`S1 95×3 · S2 95×3 · S3 99×3 RIR1 [💬 …]`

**Par le contrôle d'intensité : NON — et c'est un fait, pas une opinion.** `_intensiteDefauts` ne
lit **jamais** `S.sessions`. Il ne connaît que `S.prs[nom].rm1` et les séries **prescrites**. Il
ignore donc que le `99×3` a été fait **en 3ᵉ position**, après deux séries de travail — c'est-à-dire
exactement le contexte qui rend un `100×3` frais plausible.

### 3.5 — Le RIR est-il disponible / utilisé ?
**Disponible : oui** (`_rirDeSet`, saisie sur la barre de repos, ft-v1038). **Transmis à Milo :
oui.** **Utilisé par le contrôle d'intensité : non** — aucune occurrence de RIR dans `log.js:2127`.

### 3.6 — Milo connaît-il les règles appliquées après sa réponse ?
**NON pour la charge. OUI pour le repos.** Mesuré :
- `_ctxReposCharge` (`coach.js:196`) **dérive** la consigne de repos de `_INT_LOURD` et lui dit
  *« l'app le lui dira juste sous ta séance »* ;
- **aucune phrase équivalente n'existe pour le plafond de charge.** Ni `_INT_TENUE`, ni la formule
  inversée, ni le mot « plafond » n'apparaissent dans le prompt.

⭐⭐ **C'est le cœur du problème, et c'est R8 à la lettre** : *un prompt ne compense jamais une
donnée absente* — ici, c'est la RÈGLE qui est absente, pas la donnée.

### 3.7 — Pourquoi Milo propose 100×3×3 alors que l'app le conteste
Parce que **les deux répondent correctement à deux questions différentes** :

| | Question posée | Donnée employée | Réponse |
|---|---|---|---|
| **Milo** | *« quelle est la progression raisonnable ? »* | l'historique : 95, 95, **99** | 100 (**+1 kg**, soit **+1 %**) |
| **Le contrôle** | *« ce triple est-il tenable 3 fois ? »* | une table de pourcentages sur `rm1` | non, viser 95 |

⛔ **Aucun des deux n'est en faute.** Milo applique la progression absolue la plus banale du
métier ; le contrôle applique une table de correspondance `%1RM ↔ répétitions`, qui est une
**approximation statistique**, pas une loi. **Et c'est précisément le §2 de la spécification de
Michel** : *le calcul peut être exact et la conclusion fausse.*

### 3.8 — Comment « allège-moi un peu » a été transmis
Par le chemin **ordinaire**, sans aucun traitement particulier : `sendToCoach` envoie
`{message, context: buildCoachContext(msg), history: _coachHistPayload(8)}` (`coach.js:5204`).

⛔⛔ **ET LA SÉANCE À MODIFIER N'EST PAS DANS LE MESSAGE.** La proposition initiale a bien été
**parsée en objet structuré** — elle vit dans `_pendingMiloSessions` (`coach.js:1653`) — mais
cette variable est **en mémoire du navigateur uniquement** et **n'est jamais renvoyée**. Milo
relit donc **son propre texte** dans la fenêtre des 8 derniers messages.

👉 ***Il n'y a aucun objet « séance » à modifier : il y a une conversation à relire.*** C'est ce
qui rend la reconstruction possible — rien, dans le pipeline, ne distingue *modifier* de
*réécrire*.

### 3.9 — Milo a-t-il reçu la séance précédente en entier ?
**Oui pour la séance RÉALISÉE** (bloc `DERNIÈRES SÉANCES`, avec numérotation, type, RIR, notes,
cardio, et les verdicts `_verdictIntensite` / `_verdictMontee` sur les séances passées).
**Non pour sa propre PROPOSITION** — voir §3.8 : sous forme de texte brut, et seulement tant
qu'elle tient dans les 8 derniers messages.

### 3.10 — Le diff exact entre les deux propositions

| Exercice | Avant | Après | Écart |
|---|---|---|---|
| Développé couché | 100 | 90 | **−10,0 %** |
| Développé incliné | 64 | 56 | −12,5 % |
| Rowing poitrine | 60 | 52 | −13,3 % |
| Épaules machine | 65 | 55 | −15,4 % |
| Machine oiseau | 68 | 55 | **−19,1 %** |
| Face Pull | 30 | 28 | −6,7 % |
| **Moyenne** | | | **−12,8 %** |

⭐⭐ **LE FAIT LE PLUS PARLANT N'EST PAS LA MOYENNE, C'EST LA RÉPARTITION** : l'exercice qui a
déclenché l'alerte (**−10 %**) est celui qui baisse **le moins** en proportion, pendant qu'un
accessoire dont personne ne s'est plaint baisse de **−19 %**. L'amplitude va **du simple au
triple** d'un exercice à l'autre.
⚠️ **Ce n'est pas forcément une faute** — un allègement global après une séance jugée trop dure
peut être un choix de coach défendable. *Mais c'est mesurable, et personne ne le mesurait.*

### 3.11 — Une règle déterministe a-t-elle modifié la réponse APRÈS Milo ?
**Sur les charges de travail : NON.** Vérifié dans `_startSessionFromMilo` (`log.js:6627`) :
`const kg = (s.kg>0) ? s.kg : (pp ? pp.kg : 0)` — *ce que Milo dit prime*, correctif de ft-v625.

**Une seule chose est ajoutée par l'app** : la **montée en charge** (`ex._montee = true`,
`log.js:2417`), c'est-à-dire des séries d'**échauffement**. Elle est étiquetée *« ⚡ Montée en
charge ajoutée par l'app »* et exclue des reproches faits à la personne. **Elle ne touche aucune
série de travail.**

### 3.12 — Les tests avant les corrections
Voir §5. **Aucun n'est construit** : ils attendent l'arbitrage de Michel.

---

## 4. Ce que l'audit conclut — et ce qu'il refuse de conclure

### ⭐⭐ Le défaut réel tient en une phrase
**Le contrôle d'intensité tourne APRÈS Milo, avec des données que Milo n'a pas, selon une règle
que Milo ignore.** Il ne peut donc structurellement produire qu'une chose : une contradiction.

Trois asymétries, mesurées, aucune supposée :

| | Milo | Le contrôle d'intensité |
|---|---|---|
| e1RM employé | **108** (`prsText`) | **108** (`S.prs.rm1`) — ✅ **le même** |
| historique récent (95/95/99, ordre, RIR) | ✅ reçu | ❌ jamais lu |
| la règle du plafond (Brzycki inversée × 0,93) | ❌ jamais dite | ✅ c'est la sienne |
| moment d'exécution | avant | **après** |

⛔ **Donc ce n'est PAS une divergence de données.** L'hypothèse la plus naturelle — *« ils ne
regardent pas le même 1RM »* — est **fausse, vérifiée**. C'est une asymétrie de **règles** et de
**moment**.

### ⚠️ Ce que l'audit ne tranche pas, et ne doit pas trancher
- **Le 100×3×3 est-il réellement infaisable ?** Personne ne le sait : il n'a pas été tenté. Le
  seul précédent documenté (ft-v980, 95×5) donnait raison au contrôle. Ici, l'écart avec
  l'historique est de **+1 kg**, ce qui est une tout autre situation.
- **Le coefficient 0,93 est-il juste ?** Il a été vérifié à trois points contre les barèmes
  classiques (3 reps → 88 %, 5 → 83 %, 8 → 75 %) et il tient. Mais un barème reste un barème.
- **Faut-il des niveaux INFO / WARN / BLOCK (§9) ?** C'est une décision produit. Note honnête :
  **aucun niveau n'existe aujourd'hui, et rien ne BLOQUE** — le bouton reste actif, la charge
  n'est pas retouchée (R24/R29). Le mécanisme actuel est déjà un « WARN » unique.

---

## 5. Les tests proposés — et lesquels sont réellement finançables

⚠️ **Le critère du projet est unique** (`docs/JOURNAL-DE-TEST.md`) : *l'attendu est-il vérifiable
par du CODE ?* Le banc d'essai n'a **aucun juge IA**. Un scénario dont l'attendu est *« la
réduction est-elle cohérente ? »* n'est pas promouvable — il reste **juge humain**.

### ⛔⛔ D'abord : un scénario existe DÉJÀ, et il ne faut pas le doubler (R13/R23)
**`EV-019`** (`tests/milo/eval-scenarios.js:687`, origine ft-v980) — *« Il ne prescrit pas une
charge que la personne ne peut pas tenir »*. Sa fixture est **exactement ce cas** :
`prs:{'Développé Couché':{rm1:108, kg:105, reps:2}}`, et son vérificateur rejoue la **même**
formule avec une marge de +5 %.

👉 ***Il demande « 3 séries de 5 ». Le cas réel est « 3 séries de 3 ».*** Le scénario existe,
il n'a simplement jamais été exercé sur ce triple.
⚠️ **Et il faut le dire franchement** : ce vérificateur **encode la règle contestée comme la
bonne réponse**. Si Michel décide que le contrôle est trop catégorique, **EV-019 devient faux
avant le code.** C'est le §2 de sa spécification appliqué au banc d'essai lui-même.

### Famille A — le Gardien (contrôle d'intensité), **hors ligne, 0 €**
Ceux-là ne parlent pas à Milo : ils appellent `_intensiteDefauts` directement, donc ils ne
coûtent **aucun appel API** et tournent à chaque passe.

| Id proposé | Ce qu'il fige | Vérifiable par code ? |
|---|---|---|
| `REG-GARDIEN-BENCH-001` | le cas réel : `rm1=108`, `3×3×100` → 93 %, plafond 94,86, conseil 95 | ✅ **oui** — arithmétique pure |
| `BENCH-GUARDIAN-FN-001` | historique 90×3, prescription **110×5** → l'alerte DOIT sortir | ✅ oui |
| `BENCH-GUARDIAN-FP-001` | une prescription **sous** le plafond ne déclenche RIEN (ex. le 90×3×3 : 83 %) | ✅ oui |
| *(nouveau, non demandé)* | **sans record, le contrôle se TAIT** — déjà garanti par `if(!(rm1>0)) return` | ✅ oui, et gratuit |

⭐ **Ces quatre-là sont finançables tout de suite** : ils figent le comportement actuel, quel que
soit l'arbitrage. *Un test qui décrit ce que le code fait aujourd'hui ne présume pas qu'il ait
raison* — il empêche qu'il change sans qu'on le sache.

### Famille B — la contradiction Milo ↔ contrôle
| Id proposé | Ce qu'il mesure | Vérifiable par code ? |
|---|---|---|
| `REG-MILO-GARDIAN-CONFLICT-001` | *une prescription de Milo déclenche-t-elle une alerte ?* | ✅ **oui** — c'est un booléen, `_intensiteDefauts(...).length > 0` sur la séance parsée |

⭐⭐ **C'est le scénario le plus rentable de toute la liste**, et pour une raison simple : il ne
juge PAS qui a raison. Il **compte** les contradictions. Aujourd'hui, personne ne sait si ce cas
arrive une fois sur cent ou une fois sur trois — et *cette fréquence est la seule donnée qui
permettra de décider* entre « le contrôle est trop sévère » et « Milo prescrit trop lourd ».

### Famille C — les modifications relatives (`MILO-RELATIVE-EDIT`)
| Id proposé | Ce qu'il mesure | Vérifiable par code ? |
|---|---|---|
| `BENCH-MILO-ADJUST-005` | **conservation de la structure** : mêmes exercices, même ordre, même nombre de séries | ✅ **oui** — comparaison d'ensembles |
| `BENCH-MILO-ADJUST-003` | *« change seulement X »* → les autres exercices sont **inchangés** | ✅ **oui** — le plus net des trois |
| `BENCH-MILO-ADJUST-001/002` | *« allège un peu »* / *« augmente légèrement »* → **le SENS** de la variation | ✅ oui pour le **signe**, ❌ non pour l'**ampleur** |
| `BENCH-MILO-ADJUST-004` | une vraie séance de décharge | ⚠️ partiellement — « décharge » n'a pas de définition chiffrée unique |

⛔⛔ **LA LIGNE DE PARTAGE EST NETTE, ET IL FAUT LA TENIR** : le **signe** et la **structure** sont
vérifiables par du code ; **l'ampleur ne l'est pas**. Décider que *« un peu = entre −5 % et
−15 % »* serait exactement ce que le §21 de la spécification interdit — *remplacer une mauvaise
heuristique par une autre*.

👉 **La sortie proposée** : le **moteur de diff** (§17) **mesure et affiche** l'amplitude
(−10 % / −12,8 % / −19,1 %) **sans en tirer de verdict**. Le chiffre part au rapport ; le
PASS/WARN/FAIL sur l'ampleur reste **juge humain** tant qu'aucun critère métier n'a été validé
par Michel. *C'est la même décision qu'en R32 : on ne fabrique pas un score de fiabilité sans
méthode pour le calculer.*

### ⭐ Le moteur de diff n'est pas à inventer
`SESSION DIFF` (§17) et `CHANGE MAGNITUDE` (§18) sont **génériques** : ils comparent deux objets
`{exs:[{name, sets:[{kg,reps,type,rest}]}]}`, forme que l'app produit déjà
(`_pendingMiloSessions`). C'est **une centaine de lignes** qui servent ensuite à *tous* les
scénarios de la famille C — au lieu d'un vérificateur écrit à la main par scénario.

---

## 6. Ce qu'il ne faut PAS faire, écrit maintenant pour ne pas le redécouvrir (R30)

1. ⛔ **Ne pas coder `if("un peu") load *= 0,95`** — §21 de la spécification. Le banc d'essai
   **mesure** le comportement de Milo, il ne le remplace pas.
2. ⛔ **Ne pas faire du contrôle d'intensité un blocage.** Il ne bloque pas aujourd'hui, et c'est
   une décision datée (**R29**, née du cas de Michel : *il VOULAIT ses 95 kg pour tester son max,
   et il en avait le droit*). Une app qui réécrit 90 à la place de la personne décide de son
   entraînement.
3. ⛔ **Ne pas remplacer le record par la forme récente** dans le dénominateur sans mesurer :
   c'est un durcissement (93 % → 95 %), pas un assouplissement. Voir §3.3.
4. ⛔ **Ne pas donner à Milo la règle du plafond sans passer par R34** — *état A → banc d'essai →
   état B → même banc → comparaison*. Ajouter une phrase au prompt est **le dernier levier** (R7),
   pas le premier, et le prompt commun est **à quelques centaines de caractères de son plafond**.
5. ⛔ **Ne pas créer un second système de tests** (§29). Tout ce qui précède se greffe sur
   `tests/milo/eval-scenarios.js` (API) et sur le banc hors ligne existant.

---

## 7. Les trois décisions qui appartiennent à Michel

| # | La question | Ce que l'audit peut dire | Ce qu'il ne peut pas dire |
|---|---|---|---|
| 1 | **Le contrôle est-il trop catégorique ?** | La phrase *« tenable sur UNE série max, pas sur 3 »* est une **affirmation**, pas une estimation, alors qu'elle dérive d'un barème. Elle pourrait être reformulée sans toucher au calcul. | Si le 100×3×3 était faisable. |
| 2 | **Faut-il des niveaux INFO / WARN / BLOCK ?** | Rien ne bloque aujourd'hui ; il n'existe qu'un seul niveau. Un `INFO` distinct coûterait peu. | Où placer les seuils. |
| 3 | **Faut-il que Milo connaisse la règle avant de prescrire ?** | C'est **la seule correction qui supprime la contradiction à la source** (les autres la rendent plus douce). Le patron existe déjà : `_ctxReposCharge` fait exactement ça pour le repos. | Si le gain vaut les caractères de prompt — **seul le banc d'essai peut le dire (R34)**. |

⭐ **Et il y a un ordre naturel** : le scénario `REG-MILO-GARDIAN-CONFLICT-001` **compte** les
contradictions sans juger. Le faire tourner d'abord donne le chiffre qui manque aux trois
décisions ci-dessus. *On mesure la fréquence avant de choisir le remède.*

---

## 🔗 Où va le reste

| Sujet | Document |
|---|---|
| Les questions ouvertes sur le comportement de Milo | `docs/JOURNAL-DE-TEST.md` |
| Le banc d'essai, sa doctrine (R35) et son coût | `docs/REGLES-ARCHITECTURE.md` |
| Les familles de bugs déjà rencontrées | `BUGS.md` |
| Les dérives de comportement de Milo | `docs/BUGS-DE-PHILOSOPHIE.md` |
